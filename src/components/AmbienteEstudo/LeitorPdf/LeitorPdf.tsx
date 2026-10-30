'use client'

import './leitor.css'
import clsx from 'clsx'
import Link from 'next/link'
import type {
  PDFDocumentProxy,
  RenderTask,
  TextLayer as CamadaTexto
} from 'pdfjs-dist'
import {
  FormEvent,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react'
import {
  LuArrowLeft,
  LuChevronLeft,
  LuChevronRight,
  LuDownload,
  LuLoader,
  LuMaximize,
  LuMinimize,
  LuPanelLeft,
  LuSearch,
  LuX,
  LuZoomIn,
  LuZoomOut
} from 'react-icons/lu'

type Pdfjs = typeof import('pdfjs-dist')

interface Tamanho {
  largura: number
  altura: number
}

const ZOOMS = [0.5, 0.75, 1, 1.25, 1.5, 2, 3]
const MARGEM_PAGINAS = 24

// Minúsculas e sem acento, caractere a caractere, para que as posições do
// texto normalizado batam com as do original (usado no realce da busca).
const normalizar = (texto: string) =>
  [...texto]
    .map((letra) => {
      const base = letra.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
      return base.length === 1 ? base : letra.toLowerCase()
    })
    .join('')

const chaveLeitura = (materialId: string) => `xor:leitor:${materialId}`

function lerPaginaSalva(materialId: string) {
  try {
    return Number(localStorage.getItem(chaveLeitura(materialId))) || null
  } catch {
    return null
  }
}

function salvarPagina(materialId: string, pagina: number) {
  try {
    localStorage.setItem(chaveLeitura(materialId), String(pagina))
  } catch {
    // Sem armazenamento (aba anônima): só não lembra a página.
  }
}

/** Realça a busca e o trecho citado na camada de texto de uma página. */
function realcar(camada: HTMLElement, termo: string, citado: string) {
  const spans = camada.querySelectorAll<HTMLSpanElement>(
    'span:not(.markedContent)'
  )
  for (const span of spans) {
    // Desfaz o realce anterior (marks viram texto de novo).
    if (span.dataset.original !== undefined) {
      span.textContent = span.dataset.original
      delete span.dataset.original
    }
    span.classList.remove('citado')
    const texto = span.textContent ?? ''
    const normal = normalizar(texto)

    if (citado && normal.trim().length >= 4 && citado.includes(normal.trim()))
      span.classList.add('citado')

    if (!termo || !normal.includes(termo)) continue
    span.dataset.original = texto
    span.textContent = ''
    let inicio = 0
    for (
      let achado = normal.indexOf(termo);
      achado !== -1;
      achado = normal.indexOf(termo, achado + termo.length)
    ) {
      span.append(texto.slice(inicio, achado))
      const marca = document.createElement('mark')
      marca.className = 'busca'
      marca.textContent = texto.slice(achado, achado + termo.length)
      span.append(marca)
      inicio = achado + termo.length
    }
    span.append(texto.slice(inicio))
  }
}

/** Renderiza uma página quando ela chega perto da área visível. */
function Pagina({
  pdf,
  pdfjs,
  numero,
  tamanho,
  escala,
  termo,
  citado,
  registrar
}: {
  pdf: PDFDocumentProxy
  pdfjs: Pdfjs
  numero: number
  tamanho: Tamanho
  escala: number
  termo: string
  citado: string
  registrar: (numero: number, elemento: HTMLDivElement | null) => void
}) {
  const caixa = useRef<HTMLDivElement>(null)
  const tela = useRef<HTMLCanvasElement>(null)
  const camada = useRef<HTMLDivElement>(null)
  const [perto, setPerto] = useState(false)
  const [desenhada, setDesenhada] = useState(false)

  useEffect(() => {
    const elemento = caixa.current
    if (!elemento) return
    const observador = new IntersectionObserver(
      ([entrada]) => setPerto(entrada.isIntersecting),
      { rootMargin: '800px 0px' }
    )
    observador.observe(elemento)
    return () => observador.disconnect()
  }, [])

  useEffect(() => {
    if (!perto) return
    let cancelado = false
    let tarefa: RenderTask | null = null
    let camadaTexto: CamadaTexto | null = null

    void (async () => {
      const pagina = await pdf.getPage(numero)
      if (cancelado || !tela.current || !camada.current) return
      const viewport = pagina.getViewport({ scale: escala })
      const densidade = window.devicePixelRatio || 1
      const canvas = tela.current
      canvas.width = Math.floor(viewport.width * densidade)
      canvas.height = Math.floor(viewport.height * densidade)
      const contexto = canvas.getContext('2d')
      if (!contexto) return
      tarefa = pagina.render({
        canvas,
        canvasContext: contexto,
        viewport,
        transform:
          densidade !== 1 ? [densidade, 0, 0, densidade, 0, 0] : undefined
      })
      try {
        await tarefa.promise
      } catch {
        return // Cancelada por zoom ou rolagem.
      }
      if (cancelado || !camada.current) return
      camada.current.replaceChildren()
      camadaTexto = new pdfjs.TextLayer({
        textContentSource: pagina.streamTextContent(),
        container: camada.current,
        viewport
      })
      await camadaTexto.render()
      if (!cancelado) setDesenhada(true)
    })()

    return () => {
      cancelado = true
      tarefa?.cancel()
      camadaTexto?.cancel()
      setDesenhada(false)
    }
  }, [perto, pdf, pdfjs, numero, escala])

  useEffect(() => {
    if (desenhada && camada.current) realcar(camada.current, termo, citado)
  }, [desenhada, termo, citado])

  const largura = Math.floor(tamanho.largura * escala)
  const altura = Math.floor(tamanho.altura * escala)

  return (
    <div
      ref={(elemento) => {
        caixa.current = elemento
        registrar(numero, elemento)
      }}
      data-pagina={numero}
      className="relative mx-auto bg-white shadow-md ring-1 ring-black/5"
      style={
        {
          width: largura,
          height: altura,
          '--total-scale-factor': escala,
          '--scale-round-x': '1px',
          '--scale-round-y': '1px'
        } as React.CSSProperties
      }
    >
      <canvas
        ref={tela}
        aria-hidden
        className="absolute inset-0 size-full"
        style={{ width: largura, height: altura }}
      />
      <div ref={camada} className="textLayer" />
      {!desenhada && (
        <span className="absolute inset-0 flex items-center justify-center text-sm text-gray-300">
          {numero}
        </span>
      )}
    </div>
  )
}

/** Miniatura da barra lateral, desenhada só quando aparece na lista. */
function Miniatura({
  pdf,
  numero,
  tamanho,
  ativa,
  aoClicar
}: {
  pdf: PDFDocumentProxy
  numero: number
  tamanho: Tamanho
  ativa: boolean
  aoClicar: () => void
}) {
  const botao = useRef<HTMLButtonElement>(null)
  const tela = useRef<HTMLCanvasElement>(null)
  const [perto, setPerto] = useState(false)
  const escala = 96 / tamanho.largura

  useEffect(() => {
    const elemento = botao.current
    if (!elemento) return
    const observador = new IntersectionObserver(
      ([entrada]) => entrada.isIntersecting && setPerto(true),
      { rootMargin: '300px 0px' }
    )
    observador.observe(elemento)
    return () => observador.disconnect()
  }, [])

  useEffect(() => {
    if (!perto) return
    let tarefa: RenderTask | null = null
    void (async () => {
      const pagina = await pdf.getPage(numero)
      const canvas = tela.current
      const contexto = canvas?.getContext('2d')
      if (!canvas || !contexto) return
      const viewport = pagina.getViewport({ scale: escala })
      canvas.width = Math.floor(viewport.width)
      canvas.height = Math.floor(viewport.height)
      tarefa = pagina.render({ canvas, canvasContext: contexto, viewport })
      await tarefa.promise.catch(() => undefined)
    })()
    return () => tarefa?.cancel()
  }, [perto, pdf, numero, escala])

  useEffect(() => {
    if (ativa) botao.current?.scrollIntoView({ block: 'nearest' })
  }, [ativa])

  return (
    <button
      ref={botao}
      type="button"
      onClick={aoClicar}
      aria-label={`Ir para a página ${numero}`}
      aria-current={ativa ? 'page' : undefined}
      className="group flex w-full cursor-pointer flex-col items-center gap-1 rounded-lg p-2 hover:bg-white/60"
    >
      <canvas
        ref={tela}
        aria-hidden
        className={clsx(
          'bg-white shadow-sm ring-2 transition',
          ativa ? 'ring-xor-navy' : 'ring-transparent group-hover:ring-gray-300'
        )}
        style={{
          width: 96,
          height: Math.floor(tamanho.altura * escala)
        }}
      />
      <span
        className={clsx(
          'text-xs font-semibold',
          ativa ? 'text-xor-navy' : 'text-gray-500'
        )}
      >
        {numero}
      </span>
    </button>
  )
}

function BotaoBarra({
  rotulo,
  aoClicar,
  desabilitado,
  ativo,
  children
}: {
  rotulo: string
  aoClicar: () => void
  desabilitado?: boolean
  ativo?: boolean
  children: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={aoClicar}
      disabled={desabilitado}
      aria-label={rotulo}
      aria-pressed={ativo}
      title={rotulo}
      className={clsx(
        'flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-lg text-lg transition-colors disabled:cursor-not-allowed disabled:opacity-40',
        ativo
          ? 'bg-xor-navy text-white'
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
      )}
    >
      {children}
    </button>
  )
}

interface LeitorPdfProps {
  url: string
  nome: string
  materialId: string
  /** Página para abrir (ex.: vinda de uma citação). Sem ela, retoma a leitura. */
  paginaInicial?: number | null
  /** Texto citado pela IA, realçado na página aberta. */
  trechoCitado?: string | null
  voltarHref: string
  /** Botões extras na barra (ex.: perguntar à IA). */
  acoes?: ReactNode
}

export default function LeitorPdf({
  url,
  nome,
  materialId,
  paginaInicial,
  trechoCitado,
  voltarHref,
  acoes
}: LeitorPdfProps) {
  const raiz = useRef<HTMLDivElement>(null)
  const rolagem = useRef<HTMLDivElement>(null)
  const campoBusca = useRef<HTMLInputElement>(null)
  const paginas = useRef(new Map<number, HTMLDivElement>())
  const textos = useRef(new Map<number, string>())

  const [pdfjs, setPdfjs] = useState<Pdfjs | null>(null)
  const [pdf, setPdf] = useState<PDFDocumentProxy | null>(null)
  const [tamanhos, setTamanhos] = useState<Tamanho[]>([])
  const [erro, setErro] = useState<string | null>(null)
  const [zoom, setZoom] = useState<number | 'largura'>('largura')
  const [larguraUtil, setLarguraUtil] = useState(0)
  const [paginaAtual, setPaginaAtual] = useState(1)
  const [campoPagina, setCampoPagina] = useState('1')
  const [miniaturas, setMiniaturas] = useState(false)
  const [telaCheia, setTelaCheia] = useState(false)
  const [buscaAberta, setBuscaAberta] = useState(false)
  const [busca, setBusca] = useState('')
  const [termo, setTermo] = useState('')
  const [resultados, setResultados] = useState<number[]>([])
  const [indiceResultado, setIndiceResultado] = useState(0)
  const [buscando, setBuscando] = useState(false)
  const [retomada, setRetomada] = useState<number | null>(null)

  const citado = useMemo(
    () => (trechoCitado ? normalizar(trechoCitado) : ''),
    [trechoCitado]
  )
  // O realce do trecho citado vale só para a página da citação.
  const paginaCitada = trechoCitado ? (paginaInicial ?? null) : null

  // Carrega o pdf.js só no navegador e abre o documento.
  useEffect(() => {
    let cancelado = false
    let carregamento: ReturnType<Pdfjs['getDocument']> | null = null
    void (async () => {
      try {
        const biblioteca = await import('pdfjs-dist')
        // Copiado de node_modules por scripts/copiar-worker-pdf.mjs. A versão
        // na URL evita usar um worker antigo do cache depois de atualizar.
        biblioteca.GlobalWorkerOptions.workerSrc = `/pdfjs/pdf.worker.min.mjs?v=${biblioteca.version}`
        carregamento = biblioteca.getDocument({ url })
        const documento = await carregamento.promise
        const medidas: Tamanho[] = []
        for (let numero = 1; numero <= documento.numPages; numero++) {
          const pagina = await documento.getPage(numero)
          const { width, height } = pagina.getViewport({ scale: 1 })
          medidas.push({ largura: width, altura: height })
        }
        if (cancelado) return
        setPdfjs(biblioteca)
        setTamanhos(medidas)
        setPdf(documento)
      } catch (falha) {
        console.error('[leitor] não abriu o PDF', falha)
        if (!cancelado)
          setErro('Não foi possível abrir este PDF. Tente baixar o arquivo.')
      }
    })()
    return () => {
      cancelado = true
      void carregamento?.destroy()
    }
  }, [url])

  // Largura disponível para "ajustar à largura".
  useEffect(() => {
    const elemento = rolagem.current
    if (!elemento) return
    const observador = new ResizeObserver(([entrada]) =>
      setLarguraUtil(entrada.contentRect.width)
    )
    observador.observe(elemento)
    return () => observador.disconnect()
  }, [])

  const maiorLargura = Math.max(1, ...tamanhos.map((t) => t.largura))
  const escala =
    zoom === 'largura'
      ? Math.max(
          0.3,
          Math.min(3, (larguraUtil - 2 * MARGEM_PAGINAS) / maiorLargura)
        )
      : zoom

  const registrar = useCallback(
    (numero: number, elemento: HTMLDivElement | null) => {
      if (elemento) paginas.current.set(numero, elemento)
      else paginas.current.delete(numero)
    },
    []
  )

  const irPara = useCallback(
    (numero: number, suave = true) => {
      const alvo = Math.min(Math.max(1, numero), tamanhos.length || 1)
      const elemento = paginas.current.get(alvo)
      if (elemento && rolagem.current)
        rolagem.current.scrollTo({
          top: elemento.offsetTop - MARGEM_PAGINAS / 2,
          behavior: suave ? 'smooth' : 'auto'
        })
      setPaginaAtual(alvo)
      setCampoPagina(String(alvo))
    },
    [tamanhos.length]
  )

  const abriu = useRef(false)

  // Mantém a página no lugar quando o zoom muda. Fica antes da abertura:
  // no render em que o PDF abre a escala também muda, e esse ajuste não pode
  // passar por cima da página pedida.
  const paginaAntesDoZoom = useRef(paginaAtual)
  paginaAntesDoZoom.current = paginaAtual
  const escalaAnterior = useRef(escala)
  useEffect(() => {
    if (escalaAnterior.current === escala) return
    escalaAnterior.current = escala
    if (!abriu.current) return
    requestAnimationFrame(() => irPara(paginaAntesDoZoom.current, false))
  }, [escala, irPara])

  // Abre na página pedida ou retoma de onde o aluno parou.
  useEffect(() => {
    if (!pdf || abriu.current || larguraUtil === 0) return
    abriu.current = true
    const salva = lerPaginaSalva(materialId)
    const inicial = paginaInicial ?? salva ?? 1
    if (!paginaInicial && salva && salva > 1) setRetomada(salva)
    requestAnimationFrame(() => irPara(inicial, false))
  }, [pdf, larguraUtil, paginaInicial, materialId, irPara])

  // Página atual = a que cruza o topo da área de leitura.
  useEffect(() => {
    const elemento = rolagem.current
    if (!elemento || !pdf) return
    let quadro = 0
    const aoRolar = () => {
      cancelAnimationFrame(quadro)
      quadro = requestAnimationFrame(() => {
        const referencia = elemento.scrollTop + elemento.clientHeight * 0.3
        let atual = 1
        for (const [numero, pagina] of paginas.current)
          if (pagina.offsetTop <= referencia && numero > atual) atual = numero
        setPaginaAtual(atual)
        setCampoPagina(String(atual))
      })
    }
    elemento.addEventListener('scroll', aoRolar, { passive: true })
    return () => {
      elemento.removeEventListener('scroll', aoRolar)
      cancelAnimationFrame(quadro)
    }
  }, [pdf])

  useEffect(() => {
    if (!pdf) return
    const espera = setTimeout(() => salvarPagina(materialId, paginaAtual), 600)
    return () => clearTimeout(espera)
  }, [pdf, paginaAtual, materialId])

  useEffect(() => {
    if (retomada === null) return
    const espera = setTimeout(() => setRetomada(null), 5000)
    return () => clearTimeout(espera)
  }, [retomada])

  const mudarZoom = useCallback(
    (direcao: 1 | -1) =>
      setZoom(() => {
        const proximo =
          direcao > 0
            ? ZOOMS.find((z) => z > escala + 0.01)
            : [...ZOOMS].reverse().find((z) => z < escala - 0.01)
        return proximo ?? (direcao > 0 ? ZOOMS.at(-1)! : ZOOMS[0])
      }),
    [escala]
  )

  const alternarTelaCheia = async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen()
      else await raiz.current?.requestFullscreen()
    } catch {
      // Navegador sem tela cheia: ignora.
    }
  }
  useEffect(() => {
    const aoMudar = () => setTelaCheia(Boolean(document.fullscreenElement))
    document.addEventListener('fullscreenchange', aoMudar)
    return () => document.removeEventListener('fullscreenchange', aoMudar)
  }, [])

  // Busca em todas as páginas (o texto de cada página é lido uma vez).
  const buscar = async (evento?: FormEvent) => {
    evento?.preventDefault()
    const alvo = normalizar(busca.trim())
    setTermo(alvo)
    if (!pdf || alvo.length < 2) {
      setResultados([])
      return
    }
    setBuscando(true)
    const achadas: number[] = []
    for (let numero = 1; numero <= pdf.numPages; numero++) {
      let texto = textos.current.get(numero)
      if (texto === undefined) {
        const conteudo = await (await pdf.getPage(numero)).getTextContent()
        texto = normalizar(
          conteudo.items
            .map((item) => ('str' in item ? item.str : ''))
            .join(' ')
        )
        textos.current.set(numero, texto)
      }
      if (texto.includes(alvo)) achadas.push(numero)
    }
    setBuscando(false)
    setResultados(achadas)
    const primeiro = Math.max(
      0,
      achadas.findIndex((numero) => numero >= paginaAtual)
    )
    setIndiceResultado(primeiro)
    if (achadas.length) irPara(achadas[primeiro])
  }

  const proximoResultado = (direcao: 1 | -1) => {
    if (!resultados.length) return
    const indice =
      (indiceResultado + direcao + resultados.length) % resultados.length
    setIndiceResultado(indice)
    irPara(resultados[indice])
  }

  const fecharBusca = () => {
    setBuscaAberta(false)
    setBusca('')
    setTermo('')
    setResultados([])
  }

  // Atalhos: setas e PageUp/PageDown trocam de página, +/- mudam o zoom e
  // Ctrl+F abre a busca do leitor.
  useEffect(() => {
    const aoTeclar = (evento: KeyboardEvent) => {
      if ((evento.ctrlKey || evento.metaKey) && evento.key === 'f') {
        evento.preventDefault()
        setBuscaAberta(true)
        requestAnimationFrame(() => campoBusca.current?.focus())
        return
      }
      const alvo = evento.target as HTMLElement
      if (alvo.closest('input, textarea, select, [contenteditable]')) return
      if (['ArrowRight', 'PageDown'].includes(evento.key)) {
        evento.preventDefault()
        irPara(paginaAtual + 1)
      } else if (['ArrowLeft', 'PageUp'].includes(evento.key)) {
        evento.preventDefault()
        irPara(paginaAtual - 1)
      } else if (evento.key === '+' || evento.key === '=') mudarZoom(1)
      else if (evento.key === '-') mudarZoom(-1)
    }
    window.addEventListener('keydown', aoTeclar)
    return () => window.removeEventListener('keydown', aoTeclar)
  }, [irPara, paginaAtual, mudarZoom])

  const total = tamanhos.length

  return (
    <div
      ref={raiz}
      className={clsx(
        'leitor-pdf flex flex-col overflow-hidden bg-gray-100',
        telaCheia
          ? 'h-dvh'
          : 'h-[calc(100dvh-15rem)] min-h-[560px] rounded-2xl border border-gray-100 shadow-lg max-lg:h-[calc(100dvh-13rem)]'
      )}
    >
      {/* Barra de ferramentas. */}
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 border-b border-gray-200 bg-white px-3 py-2">
        <Link
          href={voltarHref}
          aria-label="Voltar para a biblioteca"
          title="Voltar para a biblioteca"
          className="flex size-9 shrink-0 items-center justify-center rounded-lg text-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900"
        >
          <LuArrowLeft />
        </Link>
        <BotaoBarra
          rotulo={miniaturas ? 'Ocultar miniaturas' : 'Mostrar miniaturas'}
          aoClicar={() => setMiniaturas((valor) => !valor)}
          ativo={miniaturas}
          desabilitado={!pdf}
        >
          <LuPanelLeft />
        </BotaoBarra>
        <p
          className="min-w-0 flex-1 truncate text-sm font-semibold text-gray-900 max-md:order-last max-md:basis-full"
          title={nome}
        >
          {nome}
        </p>

        <div className="flex items-center gap-1">
          <BotaoBarra
            rotulo="Página anterior"
            aoClicar={() => irPara(paginaAtual - 1)}
            desabilitado={!pdf || paginaAtual <= 1}
          >
            <LuChevronLeft />
          </BotaoBarra>
          <form
            onSubmit={(evento) => {
              evento.preventDefault()
              irPara(Number(campoPagina) || paginaAtual)
            }}
            className="flex items-center gap-1 text-sm text-gray-500"
          >
            <input
              value={campoPagina}
              onChange={(evento) =>
                setCampoPagina(evento.target.value.replace(/\D/g, ''))
              }
              onBlur={() => setCampoPagina(String(paginaAtual))}
              inputMode="numeric"
              aria-label="Página atual"
              disabled={!pdf}
              className="w-11 rounded-md border border-gray-200 px-1 py-1 text-center font-semibold text-gray-900 outline-xor-navy"
            />
            <span>/ {total || '–'}</span>
          </form>
          <BotaoBarra
            rotulo="Próxima página"
            aoClicar={() => irPara(paginaAtual + 1)}
            desabilitado={!pdf || paginaAtual >= total}
          >
            <LuChevronRight />
          </BotaoBarra>
        </div>

        <div className="flex items-center gap-1">
          <BotaoBarra
            rotulo="Diminuir zoom"
            aoClicar={() => mudarZoom(-1)}
            desabilitado={!pdf || escala <= ZOOMS[0]}
          >
            <LuZoomOut />
          </BotaoBarra>
          <select
            value={zoom === 'largura' ? 'largura' : String(zoom)}
            onChange={(evento) =>
              setZoom(
                evento.target.value === 'largura'
                  ? 'largura'
                  : Number(evento.target.value)
              )
            }
            aria-label="Zoom"
            disabled={!pdf}
            className="cursor-pointer rounded-md border border-gray-200 bg-white px-1.5 py-1 text-sm font-semibold text-gray-900 outline-xor-navy"
          >
            <option value="largura">
              Largura
              {zoom === 'largura' ? ` (${Math.round(escala * 100)}%)` : ''}
            </option>
            {ZOOMS.map((valor) => (
              <option key={valor} value={valor}>
                {Math.round(valor * 100)}%
              </option>
            ))}
          </select>
          <BotaoBarra
            rotulo="Aumentar zoom"
            aoClicar={() => mudarZoom(1)}
            desabilitado={!pdf || escala >= ZOOMS.at(-1)!}
          >
            <LuZoomIn />
          </BotaoBarra>
        </div>

        <div className="flex items-center gap-1">
          <BotaoBarra
            rotulo="Buscar no PDF (Ctrl + F)"
            aoClicar={() => {
              setBuscaAberta((valor) => !valor)
              requestAnimationFrame(() => campoBusca.current?.focus())
            }}
            ativo={buscaAberta}
            desabilitado={!pdf}
          >
            <LuSearch />
          </BotaoBarra>
          {acoes}
          <a
            href={url}
            download={nome}
            aria-label="Baixar o PDF"
            title="Baixar o PDF"
            className="flex size-9 items-center justify-center rounded-lg text-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900"
          >
            <LuDownload />
          </a>
          <BotaoBarra
            rotulo={telaCheia ? 'Sair da tela cheia' : 'Tela cheia'}
            aoClicar={alternarTelaCheia}
          >
            {telaCheia ? <LuMinimize /> : <LuMaximize />}
          </BotaoBarra>
        </div>
      </div>

      {buscaAberta && (
        <form
          onSubmit={buscar}
          role="search"
          className="flex flex-wrap items-center gap-2 border-b border-gray-200 bg-white px-3 py-2"
        >
          <div className="relative min-w-48 flex-1 sm:max-w-sm">
            <LuSearch
              className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-gray-400"
              aria-hidden
            />
            <input
              ref={campoBusca}
              value={busca}
              onChange={(evento) => setBusca(evento.target.value)}
              onKeyDown={(evento) => {
                if (evento.key === 'Escape') fecharBusca()
                if (
                  evento.key === 'Enter' &&
                  termo &&
                  termo === normalizar(busca.trim())
                ) {
                  evento.preventDefault()
                  proximoResultado(evento.shiftKey ? -1 : 1)
                }
              }}
              placeholder="Buscar no PDF"
              aria-label="Buscar no PDF"
              className="w-full rounded-lg border border-gray-200 py-1.5 pr-3 pl-9 text-sm outline-xor-navy"
            />
          </div>
          <span className="text-sm text-gray-500" role="status">
            {buscando ? (
              <span className="inline-flex items-center gap-1">
                <LuLoader className="animate-spin" aria-hidden /> Buscando...
              </span>
            ) : termo ? (
              resultados.length ? (
                `Página ${resultados[indiceResultado]} · ${indiceResultado + 1} de ${resultados.length} ${resultados.length === 1 ? 'página' : 'páginas'}`
              ) : (
                'Nada encontrado'
              )
            ) : (
              'Enter busca · Enter de novo vai para a próxima página'
            )}
          </span>
          <div className="ml-auto flex items-center gap-1">
            <BotaoBarra
              rotulo="Resultado anterior"
              aoClicar={() => proximoResultado(-1)}
              desabilitado={resultados.length < 2}
            >
              <LuChevronLeft />
            </BotaoBarra>
            <BotaoBarra
              rotulo="Próximo resultado"
              aoClicar={() => proximoResultado(1)}
              desabilitado={resultados.length < 2}
            >
              <LuChevronRight />
            </BotaoBarra>
            <BotaoBarra rotulo="Fechar busca" aoClicar={fecharBusca}>
              <LuX />
            </BotaoBarra>
          </div>
        </form>
      )}

      <div className="relative flex min-h-0 flex-1">
        {miniaturas && pdf && (
          <nav
            aria-label="Miniaturas das páginas"
            className="w-32 shrink-0 overflow-y-auto border-r border-gray-200 bg-gray-50 max-sm:absolute max-sm:inset-y-0 max-sm:left-0 max-sm:z-20 max-sm:shadow-lg"
          >
            {tamanhos.map((tamanho, indice) => (
              <Miniatura
                key={indice}
                pdf={pdf}
                numero={indice + 1}
                tamanho={tamanho}
                ativa={paginaAtual === indice + 1}
                aoClicar={() => irPara(indice + 1)}
              />
            ))}
          </nav>
        )}

        <div
          ref={rolagem}
          tabIndex={-1}
          className="min-w-0 flex-1 overflow-auto outline-none"
        >
          {erro ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
              <p className="text-sm text-gray-600">{erro}</p>
              <a
                href={url}
                download={nome}
                className="inline-flex items-center gap-2 rounded-lg bg-xor-navy px-3 py-2 text-sm font-semibold text-white hover:bg-xor-navy/90"
              >
                <LuDownload aria-hidden /> Baixar o PDF
              </a>
            </div>
          ) : !pdf || !pdfjs ? (
            <div className="flex h-full items-center justify-center gap-2 text-sm text-gray-500">
              <LuLoader className="animate-spin" aria-hidden /> Abrindo o PDF...
            </div>
          ) : (
            <div
              className="flex w-fit min-w-full flex-col items-center"
              style={{ gap: MARGEM_PAGINAS / 2, padding: MARGEM_PAGINAS }}
            >
              {tamanhos.map((tamanho, indice) => (
                <Pagina
                  key={indice}
                  pdf={pdf}
                  pdfjs={pdfjs}
                  numero={indice + 1}
                  tamanho={tamanho}
                  escala={escala}
                  termo={termo}
                  citado={paginaCitada === indice + 1 ? citado : ''}
                  registrar={registrar}
                />
              ))}
            </div>
          )}
        </div>

        {retomada !== null && (
          <div
            role="status"
            className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 items-center gap-3 rounded-full bg-xor-navy px-4 py-2 text-sm font-semibold text-white shadow-lg"
          >
            Continuando da página {retomada}
            <button
              type="button"
              onClick={() => {
                setRetomada(null)
                irPara(1)
              }}
              className="cursor-pointer text-xor-lime hover:underline"
            >
              Voltar ao início
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
