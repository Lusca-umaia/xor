'use client'

import clsx from 'clsx'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { DragEvent, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import {
  LuArrowLeft,
  LuFileText,
  LuLayers,
  LuLightbulb,
  LuListChecks,
  LuPencil,
  LuSettings2,
  LuSparkles,
  LuUpload,
  LuEye
} from 'react-icons/lu'
import {
  ConfigAtividade,
  ConfigResumo,
  PedidoTutor
} from '@/@types/AmbienteEstudo'
import {
  useAtualizarChat,
  useChat,
  useEnviarMensagem,
  useMensagens
} from '@/hooks/ambienteEstudo/useChats'
import {
  useEnviarMateriais,
  useMateriais
} from '@/hooks/ambienteEstudo/useMateriais'
import { useMutacaoAmbiente } from '@/hooks/ambienteEstudo/useMutacaoAmbiente'
import { gerarAtividade } from '@/services/ambienteEstudo/atividades'
import { mensagemDeErro } from '@/services/ambienteEstudo/erros'
import { gerarResumo } from '@/services/ambienteEstudo/resumos'
import Botao, { LinkBotao } from '../Botao/Botao'
import EstadoVazio from '@/components/EstadoVazio/EstadoVazio'
import Skeleton from '@/components/Skeleton/Skeleton'
import MenuAcoes from '../MenuAcoes/MenuAcoes'
import ModalRenomear from '../ModalRenomear/ModalRenomear'
import AlternadorModo from './AlternadorModo'
import CampoMensagem from './CampoMensagem'
import MensagemChat, { IndicadorDigitando } from './MensagemChat'
import ModalContextoChat from './ModalContextoChat'

const SUGESTOES = {
  TUTOR: [
    'Me faça perguntas para eu revisar o conteúdo',
    'Quero entender o conceito principal passo a passo',
    'Corrija meu raciocínio: vou explicar o que entendi'
  ],
  EXPLICACAO: [
    'Explique o conceito principal do material',
    'Quais são os pontos mais importantes para a prova?',
    'Compare os principais conceitos em uma tabela'
  ]
}

export default function JanelaChat({
  ambienteId,
  chatId
}: {
  ambienteId: string
  chatId: string
}) {
  const router = useRouter()
  const { data: chat, error } = useChat(chatId)
  const { data: mensagens, isLoading } = useMensagens(chatId)
  const { data: materiais = [] } = useMateriais(ambienteId)
  const atualizar = useAtualizarChat()
  const enviarMateriais = useEnviarMateriais(ambienteId)
  const { enviar, parar, pendente, transmissao, ocupado } =
    useEnviarMensagem(chatId)

  const criarAtividade = useMutacaoAmbiente((config: ConfigAtividade) =>
    gerarAtividade(ambienteId, config)
  )
  const criarResumo = useMutacaoAmbiente((config: ConfigResumo) =>
    gerarResumo(ambienteId, config)
  )

  const [editandoContexto, setEditandoContexto] = useState(false)
  const [renomeando, setRenomeando] = useState(false)
  const [arquivosSoltos, setArquivosSoltos] = useState<File[]>([])
  const [arrastando, setArrastando] = useState(false)
  const fim = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fim.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [mensagens?.length, pendente, transmissao?.texto])

  if (error) {
    return (
      <EstadoVazio
        icon={<LuSparkles />}
        titulo="Chat não encontrado"
        descricao={mensagemDeErro(error)}
        acao={
          <LinkBotao href={`/ambientes/${ambienteId}/chats`}>
            Voltar aos chats
          </LinkBotao>
        }
      />
    )
  }

  if (!chat) return <Skeleton className="h-full min-h-96" />

  const materiaisContexto = materiais.filter(({ id }) =>
    chat.materialIds.includes(id)
  )
  const ultima = mensagens?.at(-1)
  const mostrarAcoesTutor =
    chat.modo === 'TUTOR' &&
    !ocupado &&
    ultima?.papel === 'ASSISTENTE' &&
    ultima.status === 'CONCLUIDA' &&
    !ultima.foraDoMaterial

  const pedir = (pedido: PedidoTutor) =>
    enviar({ conteudo: '', anexoIds: [], pedido })

  const anexar = async (arquivos: File[]) => {
    try {
      return await enviarMateriais.mutateAsync({ arquivos, origem: 'CHAT' })
    } catch {
      return []
    }
  }

  const abrirCriado = (mensagem: string, href: string) =>
    toast.success(mensagem, {
      action: { label: 'Abrir', onClick: () => router.push(href) }
    })

  const semContexto = chat.materialIds.length === 0
  const acoesRapidas = [
    {
      rotulo: 'Gerar quiz desta conversa',
      icone: <LuListChecks />,
      aoClicar: () =>
        criarAtividade.mutate(
          {
            tipo: 'QUIZ',
            materialIds: chat.materialIds,
            quantidade: 5,
            dificuldade: 'MISTA',
            titulo: `Quiz: ${chat.titulo}`,
            origemChatId: chat.id
          },
          {
            onSuccess: (atividade) =>
              abrirCriado(
                'Gerando quiz a partir da conversa...',
                `/ambientes/${ambienteId}/atividades/${atividade.id}`
              )
          }
        )
    },
    {
      rotulo: 'Gerar flashcards desta conversa',
      icone: <LuLayers />,
      aoClicar: () =>
        criarAtividade.mutate(
          {
            tipo: 'FLASHCARDS',
            materialIds: chat.materialIds,
            quantidade: 8,
            dificuldade: 'MISTA',
            titulo: `Flashcards: ${chat.titulo}`,
            origemChatId: chat.id
          },
          {
            onSuccess: (atividade) =>
              abrirCriado(
                'Gerando flashcards a partir da conversa...',
                `/ambientes/${ambienteId}/atividades/${atividade.id}`
              )
          }
        )
    },
    {
      rotulo: 'Resumir conversa',
      icone: <LuFileText />,
      aoClicar: () =>
        criarResumo.mutate(
          {
            materialIds: chat.materialIds,
            formato: 'TOPICOS',
            titulo: `Resumo: ${chat.titulo}`,
            origemChatId: chat.id
          },
          {
            onSuccess: (resumo) =>
              abrirCriado(
                'Gerando resumo da conversa...',
                `/ambientes/${ambienteId}/resumos/${resumo.id}`
              )
          }
        )
    }
  ]

  const aoSoltar = (evento: DragEvent<HTMLDivElement>) => {
    evento.preventDefault()
    setArrastando(false)
    const arquivos = Array.from(evento.dataTransfer.files)
    if (arquivos.length) setArquivosSoltos(arquivos)
  }

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-lg">
      <header className="space-y-2 border-b border-gray-100 px-4 py-3">
        <div className="flex items-center gap-2">
          <Link
            href={`/ambientes/${ambienteId}/chats`}
            className="rounded-md p-1 text-gray-500 hover:bg-gray-100 lg:hidden"
            aria-label="Voltar à lista de chats"
          >
            <LuArrowLeft />
          </Link>
          <h2 className="min-w-0 flex-1 truncate font-bold">{chat.titulo}</h2>
          <AlternadorModo
            modo={chat.modo}
            desabilitado={ocupado}
            aoMudar={(modo) =>
              atualizar.mutate({ id: chat.id, dados: { modo } })
            }
          />
          <MenuAcoes
            rotulo="Ações do chat"
            acoes={[
              ...acoesRapidas.map((acao) => ({
                ...acao,
                aoClicar: semContexto
                  ? () =>
                      toast.info(
                        'Selecione materiais no contexto do chat para gerar conteúdo.'
                      )
                  : acao.aoClicar
              })),
              {
                rotulo: 'Editar contexto',
                icone: <LuSettings2 />,
                aoClicar: () => setEditandoContexto(true)
              },
              {
                rotulo: 'Renomear',
                icone: <LuPencil />,
                aoClicar: () => setRenomeando(true)
              }
            ]}
          />
        </div>
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="font-semibold text-gray-500">Contexto:</span>
          {materiaisContexto.length === 0 ? (
            <span className="text-amber-700">
              nenhum material (respostas sem fonte)
            </span>
          ) : (
            materiaisContexto.slice(0, 3).map((material) => (
              <span
                key={material.id}
                className="max-w-44 truncate rounded-md bg-gray-100 px-2 py-0.5 text-gray-700"
              >
                {material.nome}
              </span>
            ))
          )}
          {materiaisContexto.length > 3 && (
            <span className="text-gray-500">
              +{materiaisContexto.length - 3}
            </span>
          )}
          <button
            type="button"
            onClick={() => setEditandoContexto(true)}
            className="font-semibold text-gray-900 underline cursor-pointer"
          >
            editar
          </button>
        </div>
      </header>

      <div
        className={clsx(
          'relative min-h-0 flex-1 overflow-y-auto px-4 py-5',
          arrastando && 'bg-gray-50'
        )}
        onDragOver={(evento) => {
          evento.preventDefault()
          setArrastando(true)
        }}
        onDragLeave={(evento) => {
          if (!evento.currentTarget.contains(evento.relatedTarget as Node))
            setArrastando(false)
        }}
        onDrop={aoSoltar}
      >
        {arrastando && (
          <div className="pointer-events-none absolute inset-3 z-10 flex items-center justify-center rounded-2xl border-2 border-dashed border-xor-navy bg-white/80 text-sm font-semibold">
            <LuUpload className="mr-2" aria-hidden /> Solte para anexar à
            mensagem
          </div>
        )}
        <div className="mx-auto max-w-3xl space-y-5" aria-live="polite">
          {isLoading && <Skeleton className="h-24" />}

          {mensagens?.length === 0 && !pendente && (
            <div className="py-8 text-center">
              <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-xor-navy text-2xl text-white">
                <LuSparkles aria-hidden />
              </span>
              <h3 className="mt-3 text-lg font-bold">
                {chat.modo === 'TUTOR'
                  ? 'Vamos estudar juntos?'
                  : 'Como posso ajudar?'}
              </h3>
              <p className="mx-auto mt-1 max-w-md text-sm text-gray-600">
                {chat.modo === 'TUTOR'
                  ? 'No modo Tutor, eu guio seu raciocínio com perguntas e dicas, em vez de entregar a resposta pronta.'
                  : 'Respondo com base nos seus materiais e mostro de onde veio cada informação.'}
              </p>
              <div className="mt-5 flex flex-col items-center gap-2">
                {SUGESTOES[chat.modo].map((sugestao) => (
                  <button
                    key={sugestao}
                    type="button"
                    onClick={() => enviar({ conteudo: sugestao, anexoIds: [] })}
                    className="rounded-full border border-gray-200 px-4 py-2 text-sm hover:bg-gray-50 cursor-pointer"
                  >
                    {sugestao}
                  </button>
                ))}
              </div>
            </div>
          )}

          {mensagens?.map((mensagem) => (
            <MensagemChat
              key={mensagem.id}
              mensagem={mensagem}
              materiais={materiais}
              textoTransmitindo={
                transmissao?.mensagemId === mensagem.id
                  ? transmissao.texto
                  : undefined
              }
            />
          ))}

          {pendente && (
            <>
              <MensagemChat
                mensagem={{
                  id: 'pendente',
                  chatId,
                  papel: 'ALUNO',
                  conteudo:
                    pendente.conteudo ||
                    (pendente.pedido === 'DICA'
                      ? '💡 Me dê uma dica'
                      : 'Mostre a resposta completa'),
                  anexoIds: pendente.anexoIds,
                  citacoes: [],
                  foraDoMaterial: false,
                  status: 'CONCLUIDA',
                  criadoEm: new Date().toISOString()
                }}
                materiais={materiais}
              />
              <IndicadorDigitando />
            </>
          )}

          {mostrarAcoesTutor && (
            <div className="flex flex-wrap gap-2 pl-11">
              <Botao
                tamanho="sm"
                icone={<LuLightbulb aria-hidden />}
                onClick={() => pedir('DICA')}
              >
                Me dê uma dica
              </Botao>
              <Botao
                tamanho="sm"
                variante="fantasma"
                icone={<LuEye aria-hidden />}
                onClick={() => pedir('RESPOSTA_COMPLETA')}
              >
                Mostrar resposta completa
              </Botao>
            </div>
          )}
          <div ref={fim} />
        </div>
      </div>

      <div className="border-t border-gray-100 bg-white px-4 py-3">
        <div className="mx-auto max-w-3xl">
          <CampoMensagem
            aoEnviar={(conteudo, anexoIds) => enviar({ conteudo, anexoIds })}
            aoParar={parar}
            aoAnexar={anexar}
            ocupado={ocupado}
            transmitindo={Boolean(transmissao)}
            arquivosSoltos={arquivosSoltos}
            aoConsumirArquivosSoltos={() => setArquivosSoltos([])}
            placeholder={
              chat.modo === 'TUTOR'
                ? 'Conte o que você quer entender ou tente explicar com suas palavras...'
                : 'Pergunte sobre o conteúdo...'
            }
          />
        </div>
      </div>

      <ModalContextoChat
        aberto={editandoContexto}
        aoFechar={() => setEditandoContexto(false)}
        ambienteId={ambienteId}
        materiais={materiais}
        inicial={{
          titulo: chat.titulo,
          materialIds: chat.materialIds,
          modo: chat.modo
        }}
        salvando={atualizar.isPending}
        aoSalvar={({ materialIds, modo }) =>
          atualizar.mutate(
            { id: chat.id, dados: { materialIds, modo } },
            { onSuccess: () => setEditandoContexto(false) }
          )
        }
      />
      <ModalRenomear
        aberto={renomeando}
        aoFechar={() => setRenomeando(false)}
        titulo="Renomear chat"
        valorInicial={chat.titulo}
        salvando={atualizar.isPending}
        aoSalvar={(titulo) =>
          atualizar.mutate(
            { id: chat.id, dados: { titulo } },
            { onSuccess: () => setRenomeando(false) }
          )
        }
      />
    </div>
  )
}
