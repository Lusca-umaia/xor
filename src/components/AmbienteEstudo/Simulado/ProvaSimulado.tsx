'use client'

import clsx from 'clsx'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import {
  LuArrowLeft,
  LuArrowRight,
  LuBookmark,
  LuBookmarkCheck,
  LuGrid3X3,
  LuLoader,
  LuTimer
} from 'react-icons/lu'
import { Resposta, Simulado, TentativaSimulado } from '@/@types/AmbienteEstudo'
import { useAtalhosTeclado } from '@/hooks/ambienteEstudo/useAtalhosTeclado'
import {
  EstadoCronometro,
  useCronometro
} from '@/hooks/ambienteEstudo/useCronometro'
import { useEntregarTentativa } from '@/hooks/ambienteEstudo/useSimulados'
import { ErroPrazoEsgotado } from '@/services/ambienteEstudo/erros'
import { salvarRespostas } from '@/services/ambienteEstudo/simulados'
import { respostaPreenchida } from '@/utils/ambienteEstudo/corrigirQuestao'
import { formatarCronometro } from '@/utils/ambienteEstudo/formatar'
import Botao from '../Botao/Botao'
import { classeCartao } from '../estilos'
import Modal from '../Modal/Modal'
import RenderizadorQuestao from '../Questoes/RenderizadorQuestao'
import Cronometro from './Cronometro'
import ModalEntregar from './ModalEntregar'
import NavegadorQuestoes from './NavegadorQuestoes'

const LETRAS = ['a', 'b', 'c', 'd', 'e']
const ATRASO_AUTOSAVE_MS = 500

const AVISOS: Partial<Record<EstadoCronometro, string>> = {
  ALERTA_10: 'Faltam 10 minutos para o fim do simulado.',
  ALERTA_5: 'Faltam 5 minutos! Revise as questões marcadas.'
}

function useTempoDecorrido(inicio: string, ativo: boolean) {
  const [segundos, setSegundos] = useState(0)
  useEffect(() => {
    if (!ativo) return
    const atualizar = () =>
      setSegundos((Date.now() - new Date(inicio).getTime()) / 1000)
    atualizar()
    const intervalo = setInterval(atualizar, 1000)
    return () => clearInterval(intervalo)
  }, [inicio, ativo])
  return segundos
}

interface ProvaSimuladoProps {
  simulado: Simulado
  tentativa: TentativaSimulado
  resultadoHref: string
}

/** Realização do simulado em modo foco. O estado local é a fonte da verdade. */
export default function ProvaSimulado({
  simulado,
  tentativa,
  resultadoHref
}: ProvaSimuladoProps) {
  const router = useRouter()
  const entregarTentativa = useEntregarTentativa()
  const { questoes } = simulado

  const [respostas, setRespostas] = useState(tentativa.respostas)
  const [marcadas, setMarcadas] = useState(tentativa.marcadasParaRevisao)
  const [indice, setIndice] = useState(() => {
    const primeiraEmBranco = questoes.findIndex(
      (questao) => !respostaPreenchida(questao, tentativa.respostas[questao.id])
    )
    return Math.max(0, primeiraEmBranco)
  })
  const [confirmandoEntrega, setConfirmandoEntrega] = useState(false)
  const [navegadorAberto, setNavegadorAberto] = useState(false)
  const [esgotado, setEsgotado] = useState(false)
  const [aviso, setAviso] = useState('')

  // Refs com os valores mais recentes, para o autosave e a entrega não usarem dados velhos.
  const tempoPorQuestao = useRef<Record<string, number>>({
    ...tentativa.tempoPorQuestaoSeg
  })
  const entradaQuestao = useRef(Date.now())
  const atual = useRef({ respostas, marcadas, indice })
  atual.current = { respostas, marcadas, indice }
  const temporizadorAutosave = useRef<ReturnType<typeof setTimeout> | null>(
    null
  )
  const entregando = useRef(false)

  const questao = questoes[indice]
  const treino = tentativa.prazoFinal === null

  /** Soma ao tempo da questão atual o período desde que ela foi aberta. */
  const registrarTempo = () => {
    const id = questoes[atual.current.indice]?.id
    if (id) {
      const decorrido = (Date.now() - entradaQuestao.current) / 1000
      tempoPorQuestao.current = {
        ...tempoPorQuestao.current,
        [id]: (tempoPorQuestao.current[id] ?? 0) + decorrido
      }
    }
    entradaQuestao.current = Date.now()
  }

  const salvarAgora = async () => {
    if (entregando.current) return
    registrarTempo()
    try {
      await salvarRespostas(tentativa.id, {
        respostas: atual.current.respostas,
        marcadasParaRevisao: atual.current.marcadas,
        tempoPorQuestaoSeg: tempoPorQuestao.current
      })
    } catch (erro) {
      if (erro instanceof ErroPrazoEsgotado) entregar(true)
    }
  }

  const entregar = async (automatica: boolean) => {
    if (entregando.current) return
    if (temporizadorAutosave.current) clearTimeout(temporizadorAutosave.current)
    registrarTempo()
    try {
      await salvarRespostas(tentativa.id, {
        respostas: atual.current.respostas,
        marcadasParaRevisao: atual.current.marcadas,
        tempoPorQuestaoSeg: tempoPorQuestao.current
      })
    } catch {
      // Prazo já vencido no servidor: entrega com o que foi salvo por último.
    }
    entregando.current = true
    entregarTentativa.mutate(
      { id: tentativa.id, automatica },
      {
        onSuccess: () => router.replace(resultadoHref),
        onError: () => {
          entregando.current = false
        }
      }
    )
  }

  const { restanteSeg, estado } = useCronometro(tentativa.prazoFinal, () => {
    setEsgotado(true)
    entregar(true)
  })
  const decorrido = useTempoDecorrido(tentativa.iniciadaEm, treino)

  // Avisos de 10 e 5 minutos: só na transição, nunca na abertura da página.
  const estadoAnterior = useRef<EstadoCronometro | null>(null)
  useEffect(() => {
    if (treino) return
    if (
      estadoAnterior.current !== null &&
      estadoAnterior.current !== estado &&
      AVISOS[estado]
    ) {
      toast.warning(AVISOS[estado])
      setAviso(AVISOS[estado] ?? '')
    }
    estadoAnterior.current = estado
  }, [estado, treino])

  // Autosave com debounce a cada alteração.
  useEffect(() => {
    if (temporizadorAutosave.current) clearTimeout(temporizadorAutosave.current)
    temporizadorAutosave.current = setTimeout(salvarAgora, ATRASO_AUTOSAVE_MS)
    return () => {
      if (temporizadorAutosave.current)
        clearTimeout(temporizadorAutosave.current)
    }
    // salvarAgora lê os valores atuais por ref.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [respostas, marcadas])

  // Avisa antes de fechar a aba (o cronômetro continua contando).
  useEffect(() => {
    const aoSair = (evento: BeforeUnloadEvent) => {
      if (entregando.current) return
      evento.preventDefault()
      evento.returnValue = ''
    }
    window.addEventListener('beforeunload', aoSair)
    return () => window.removeEventListener('beforeunload', aoSair)
  }, [])

  const irPara = (novo: number) => {
    if (novo < 0 || novo >= questoes.length || novo === indice) return
    salvarAgora()
    setIndice(novo)
    setNavegadorAberto(false)
    setConfirmandoEntrega(false)
  }

  const responder = (resposta: Resposta) => {
    if (esgotado || !questao) return
    setRespostas((anteriores) => ({ ...anteriores, [questao.id]: resposta }))
  }

  const alternarMarcada = () => {
    if (!questao || esgotado) return
    setMarcadas((anteriores) =>
      anteriores.includes(questao.id)
        ? anteriores.filter((id) => id !== questao.id)
        : [...anteriores, questao.id]
    )
  }

  const atalhos: Record<string, () => void> = {
    arrowright: () => irPara(indice + 1),
    arrowleft: () => irPara(indice - 1),
    m: alternarMarcada
  }
  if (questao?.tipo === 'MULTIPLA_ESCOLHA') {
    questao.opcoes.forEach(({ id }, posicao) => {
      const escolher = () =>
        responder({ tipo: 'MULTIPLA_ESCOLHA', opcaoId: id })
      atalhos[LETRAS[posicao]] = escolher
      atalhos[String(posicao + 1)] = escolher
    })
  }
  if (questao?.tipo === 'VERDADEIRO_FALSO') {
    atalhos.v = () => responder({ tipo: 'VERDADEIRO_FALSO', valor: true })
    atalhos.f = () => responder({ tipo: 'VERDADEIRO_FALSO', valor: false })
  }
  useAtalhosTeclado(
    atalhos,
    !esgotado && !confirmandoEntrega && !navegadorAberto
  )

  if (!questao) return null
  const marcada = marcadas.includes(questao.id)

  const navegador = (
    <NavegadorQuestoes
      questoes={questoes}
      respostas={respostas}
      marcadas={marcadas}
      indiceAtual={indice}
      aoIr={irPara}
    />
  )

  return (
    <div className="mx-auto max-w-6xl space-y-4">
      <p className="sr-only" aria-live="assertive">
        {aviso}
      </p>

      <header className="sticky top-0 z-20 -mx-3 flex flex-wrap items-center gap-3 border-b border-gray-200 bg-gray-50/95 px-3 py-3 backdrop-blur max-lg:top-[50px] md:-mx-8 md:px-8">
        <div className="min-w-0 flex-1">
          <h1 className="truncate font-bold">{simulado.titulo}</h1>
          <p className="text-xs text-gray-500">
            Questão {indice + 1} de {questoes.length}
          </p>
        </div>
        {treino ? (
          <span
            className="inline-flex items-center gap-2 rounded-xl bg-gray-200 px-3 py-1.5 font-mono text-sm font-bold tabular-nums"
            title="Modo treino: tempo decorrido"
          >
            <LuTimer aria-hidden /> {formatarCronometro(decorrido)}
          </span>
        ) : (
          <Cronometro restanteSeg={restanteSeg} estado={estado} />
        )}
        <Botao
          className="lg:hidden"
          icone={<LuGrid3X3 aria-hidden />}
          onClick={() => setNavegadorAberto(true)}
          aria-label="Ver todas as questões"
        />
        <Botao
          variante="primario"
          onClick={() => setConfirmandoEntrega(true)}
          disabled={esgotado}
        >
          Entregar
        </Botao>
      </header>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_260px]">
        <section className={clsx(classeCartao, 'space-y-6 p-6 max-md:p-4')}>
          <RenderizadorQuestao
            key={questao.id}
            numero={indice + 1}
            questao={questao}
            resposta={respostas[questao.id]}
            aoResponder={responder}
            modo={esgotado ? 'BLOQUEADA' : 'RESPONDENDO'}
            acoesCabecalho={
              <button
                type="button"
                onClick={alternarMarcada}
                disabled={esgotado}
                aria-pressed={marcada}
                className={clsx(
                  'inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold cursor-pointer',
                  marcada
                    ? 'bg-amber-100 text-amber-900'
                    : 'text-gray-600 hover:bg-gray-100'
                )}
              >
                {marcada ? (
                  <LuBookmarkCheck aria-hidden />
                ) : (
                  <LuBookmark aria-hidden />
                )}
                {marcada ? 'Marcada para revisão' : 'Marcar para revisão'}
                <kbd className="hidden text-[10px] opacity-60 sm:inline">M</kbd>
              </button>
            }
          />
          <div className="flex items-center justify-between gap-2 border-t border-gray-100 pt-4">
            <Botao
              variante="fantasma"
              icone={<LuArrowLeft aria-hidden />}
              onClick={() => irPara(indice - 1)}
              disabled={indice === 0}
            >
              Anterior
            </Botao>
            {indice < questoes.length - 1 ? (
              <Botao onClick={() => irPara(indice + 1)}>
                Próxima <LuArrowRight aria-hidden />
              </Botao>
            ) : (
              <Botao
                variante="primario"
                onClick={() => setConfirmandoEntrega(true)}
                disabled={esgotado}
              >
                Revisar e entregar
              </Botao>
            )}
          </div>
        </section>

        <aside
          className={clsx(
            classeCartao,
            'sticky top-24 hidden self-start p-4 lg:block'
          )}
        >
          {navegador}
        </aside>
      </div>

      <Modal
        aberto={navegadorAberto}
        aoFechar={() => setNavegadorAberto(false)}
        titulo="Questões"
        largura="sm"
      >
        {navegador}
      </Modal>

      <ModalEntregar
        aberto={confirmandoEntrega}
        aoFechar={() => setConfirmandoEntrega(false)}
        aoConfirmar={() => entregar(false)}
        aoIr={irPara}
        entregando={entregarTentativa.isPending}
        questoes={questoes}
        respostas={respostas}
        marcadas={marcadas}
      />

      {esgotado && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 p-4"
          role="alertdialog"
          aria-label="Tempo esgotado"
        >
          <div className="max-w-sm rounded-2xl bg-white p-6 text-center shadow-xl">
            <LuTimer className="mx-auto text-4xl text-red-600" aria-hidden />
            <h2 className="mt-2 text-xl font-bold">Tempo esgotado</h2>
            <p className="mt-1 text-sm text-gray-600">
              Suas respostas foram salvas e o simulado está sendo entregue.
            </p>
            <LuLoader
              className="mx-auto mt-4 animate-spin text-xl"
              aria-hidden
            />
          </div>
        </div>
      )}
    </div>
  )
}
