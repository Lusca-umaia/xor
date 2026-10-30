'use client'

import clsx from 'clsx'
import { toast } from 'sonner'
import { LuCopy, LuPaperclip, LuSparkles, LuUser } from 'react-icons/lu'
import { Material, MensagemChat as TipoMensagem } from '@/@types/AmbienteEstudo'
import BotaoReportar from '../BotaoReportar/BotaoReportar'
import Citacoes from '../Citacoes/Citacoes'
import Markdown from '../Markdown/Markdown'
import SeloIA from '../SeloIA/SeloIA'

interface MensagemChatProps {
  mensagem: TipoMensagem
  materiais: Material[]
  /** Texto parcial enquanto a resposta chega em streaming. */
  textoTransmitindo?: string
}

export function Avatar({ papel }: { papel: TipoMensagem['papel'] }) {
  return (
    <span
      className={clsx(
        'flex size-8 shrink-0 items-center justify-center rounded-full text-white',
        papel === 'ALUNO' ? 'bg-gray-700' : 'bg-black'
      )}
      aria-hidden
    >
      {papel === 'ALUNO' ? <LuUser /> : <LuSparkles />}
    </span>
  )
}

export function IndicadorDigitando() {
  return (
    <div
      className="flex items-end gap-3"
      role="status"
      aria-label="O assistente está escrevendo"
    >
      <Avatar papel="ASSISTENTE" />
      <div className="flex gap-1 rounded-2xl rounded-bl-md border border-gray-200 bg-white px-4 py-3 shadow-sm">
        {[0, 0.15, 0.3].map((atraso) => (
          <span
            key={atraso}
            className="size-2 animate-bounce rounded-full bg-gray-400"
            style={{ animationDelay: `${atraso}s` }}
          />
        ))}
      </div>
    </div>
  )
}

export default function MensagemChat({
  mensagem,
  materiais,
  textoTransmitindo
}: MensagemChatProps) {
  const aluno = mensagem.papel === 'ALUNO'
  const transmitindo = textoTransmitindo !== undefined
  const conteudo = transmitindo ? textoTransmitindo : mensagem.conteudo
  // TRANSMITINDO sem streaming ativo: a página foi recarregada no meio da resposta.
  const interrompida = mensagem.status === 'TRANSMITINDO' && !transmitindo
  const anexos = materiais.filter(({ id }) => mensagem.anexoIds.includes(id))

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(mensagem.conteudo)
      toast.success('Resposta copiada.')
    } catch {
      toast.error('Não foi possível copiar.')
    }
  }

  return (
    <div className={clsx('flex items-end gap-3', aluno && 'flex-row-reverse')}>
      <Avatar papel={mensagem.papel} />
      <div
        className={clsx(
          'flex max-w-[85%] flex-col gap-1.5',
          aluno && 'items-end'
        )}
      >
        {anexos.length > 0 && (
          <div className="flex flex-wrap justify-end gap-1">
            {anexos.map((anexo) => (
              <span
                key={anexo.id}
                className="inline-flex items-center gap-1 rounded-md bg-gray-100 px-2 py-1 text-xs text-gray-700"
              >
                <LuPaperclip aria-hidden /> {anexo.nome}
              </span>
            ))}
          </div>
        )}
        <div
          className={clsx(
            'rounded-2xl px-4 py-3 text-sm',
            aluno
              ? 'rounded-br-md bg-gray-700 text-white [&_.conteudo-markdown_code]:text-gray-900'
              : 'rounded-bl-md border border-gray-200 bg-white text-gray-800 shadow-sm'
          )}
        >
          {aluno ? (
            <p className="whitespace-pre-wrap break-words">{conteudo}</p>
          ) : interrompida && !conteudo ? (
            <p className="italic text-gray-500">Resposta interrompida.</p>
          ) : (
            <Markdown conteudo={conteudo || '…'} />
          )}
          {transmitindo && (
            <span className="ml-0.5 inline-block h-4 w-1.5 animate-pulse bg-gray-400 align-middle" />
          )}
        </div>

        {!aluno && !transmitindo && conteudo && (
          <div className="flex w-full flex-wrap items-center gap-1.5">
            <Citacoes citacoes={mensagem.citacoes} />
            <span className="ml-auto flex items-center gap-1">
              <SeloIA variante={mensagem.foraDoMaterial ? 'fora' : 'padrao'} />
              <button
                type="button"
                onClick={copiar}
                className="rounded-md p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-900 cursor-pointer"
                aria-label="Copiar resposta"
              >
                <LuCopy />
              </button>
              <BotaoReportar
                alvo={{ tipo: 'MENSAGEM', id: mensagem.id }}
                texto=""
              />
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
