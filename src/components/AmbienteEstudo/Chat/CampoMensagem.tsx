'use client'

import clsx from 'clsx'
import {
  ClipboardEvent,
  KeyboardEvent,
  useEffect,
  useRef,
  useState
} from 'react'
import { LuLoader, LuPaperclip, LuSend, LuSquare, LuX } from 'react-icons/lu'
import { Material } from '@/@types/AmbienteEstudo'
import { EXTENSOES_ACEITAS } from '@/services/ambienteEstudo/materiais'

interface CampoMensagemProps {
  aoEnviar: (conteudo: string, anexoIds: string[]) => void
  aoParar: () => void
  aoAnexar: (arquivos: File[]) => Promise<Material[]>
  ocupado: boolean
  transmitindo: boolean
  /** Arquivos soltos sobre a conversa (arrastar e soltar), repassados pela janela. */
  arquivosSoltos: File[]
  aoConsumirArquivosSoltos: () => void
  placeholder?: string
}

export default function CampoMensagem({
  aoEnviar,
  aoParar,
  aoAnexar,
  ocupado,
  transmitindo,
  arquivosSoltos,
  aoConsumirArquivosSoltos,
  placeholder = 'Pergunte sobre o conteúdo...'
}: CampoMensagemProps) {
  const [texto, setTexto] = useState('')
  const [anexos, setAnexos] = useState<Material[]>([])
  const [anexando, setAnexando] = useState(false)
  const areaTexto = useRef<HTMLTextAreaElement>(null)
  const entradaArquivo = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const area = areaTexto.current
    if (!area) return
    area.style.height = 'auto'
    area.style.height = `${Math.min(area.scrollHeight, 160)}px`
  }, [texto])

  const anexar = async (arquivos: File[]) => {
    if (!arquivos.length) return
    setAnexando(true)
    try {
      const enviados = await aoAnexar(arquivos)
      setAnexos((atuais) => [
        ...atuais,
        ...enviados.filter(({ status }) => status !== 'ERRO')
      ])
    } finally {
      setAnexando(false)
    }
  }

  useEffect(() => {
    if (arquivosSoltos.length) {
      anexar(arquivosSoltos)
      aoConsumirArquivosSoltos()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [arquivosSoltos])

  const podeEnviar = texto.trim().length > 0 && !ocupado && !anexando

  const enviar = () => {
    if (!podeEnviar) return
    aoEnviar(
      texto,
      anexos.map(({ id }) => id)
    )
    setTexto('')
    setAnexos([])
  }

  const aoTeclar = (evento: KeyboardEvent<HTMLTextAreaElement>) => {
    if (evento.key === 'Enter' && !evento.shiftKey) {
      evento.preventDefault()
      enviar()
    }
  }

  // Ctrl+V com imagem (ex.: print de um exercício) vira anexo.
  const aoColar = (evento: ClipboardEvent<HTMLTextAreaElement>) => {
    const imagens = Array.from(evento.clipboardData.files).filter(({ type }) =>
      type.startsWith('image/')
    )
    if (imagens.length) {
      evento.preventDefault()
      anexar(
        imagens.map(
          (imagem, indice) =>
            new File(
              [imagem],
              imagem.name || `imagem-colada-${Date.now()}-${indice}.png`,
              {
                type: imagem.type
              }
            )
        )
      )
    }
  }

  return (
    <div className="space-y-2">
      {(anexos.length > 0 || anexando) && (
        <div className="flex flex-wrap gap-1.5">
          {anexos.map((anexo) => (
            <span
              key={anexo.id}
              className="inline-flex items-center gap-1 rounded-md bg-gray-100 py-1 pl-2 pr-1 text-xs text-gray-700"
            >
              <LuPaperclip aria-hidden />
              <span className="max-w-48 truncate">{anexo.nome}</span>
              <button
                type="button"
                onClick={() =>
                  setAnexos(anexos.filter(({ id }) => id !== anexo.id))
                }
                aria-label={`Remover ${anexo.nome}`}
                className="rounded p-0.5 hover:bg-gray-200 cursor-pointer"
              >
                <LuX />
              </button>
            </span>
          ))}
          {anexando && (
            <span className="inline-flex items-center gap-1 text-xs text-gray-500">
              <LuLoader className="animate-spin" aria-hidden /> Anexando...
            </span>
          )}
        </div>
      )}
      <div className="flex items-end gap-2 rounded-xl border border-gray-300 bg-white p-1.5 focus-within:border-black">
        <button
          type="button"
          onClick={() => entradaArquivo.current?.click()}
          className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 cursor-pointer"
          aria-label="Anexar arquivo ou imagem"
          title="Anexar arquivo ou imagem (vai para a biblioteca)"
        >
          <LuPaperclip />
        </button>
        <textarea
          ref={areaTexto}
          value={texto}
          onChange={(evento) => setTexto(evento.target.value)}
          onKeyDown={aoTeclar}
          onPaste={aoColar}
          rows={1}
          placeholder={placeholder}
          aria-label="Mensagem"
          className="max-h-40 min-h-9 flex-1 resize-none bg-transparent px-1 py-2 text-sm outline-none"
        />
        {transmitindo ? (
          <button
            type="button"
            onClick={aoParar}
            className="rounded-lg bg-gray-900 p-2 text-white hover:bg-gray-700 cursor-pointer"
            aria-label="Parar resposta"
            title="Parar resposta"
          >
            <LuSquare />
          </button>
        ) : (
          <button
            type="button"
            onClick={enviar}
            disabled={!podeEnviar}
            className={clsx(
              'rounded-lg p-2 text-white transition-colors',
              podeEnviar
                ? 'bg-black hover:bg-gray-800 cursor-pointer'
                : 'bg-gray-300'
            )}
            aria-label="Enviar mensagem"
          >
            {ocupado ? <LuLoader className="animate-spin" /> : <LuSend />}
          </button>
        )}
      </div>
      <p className="text-center text-xs text-gray-500 max-sm:hidden">
        Enter envia · Shift + Enter quebra linha · cole imagens com Ctrl + V
      </p>
      <input
        ref={entradaArquivo}
        type="file"
        multiple
        accept={EXTENSOES_ACEITAS}
        className="sr-only"
        tabIndex={-1}
        onChange={(evento) => {
          anexar(Array.from(evento.target.files ?? []))
          evento.target.value = ''
        }}
      />
    </div>
  )
}
