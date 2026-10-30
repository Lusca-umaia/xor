'use client'

import clsx from 'clsx'
import {
  useParams,
  useRouter,
  useSearchParams,
  useSelectedLayoutSegment
} from 'next/navigation'
import { ReactNode, useEffect, useState } from 'react'
import { Chat } from '@/@types/AmbienteEstudo'
import ListaChats from '@/components/AmbienteEstudo/Chat/ListaChats'
import ModalContextoChat from '@/components/AmbienteEstudo/Chat/ModalContextoChat'
import ModalConfirmacao from '@/components/AmbienteEstudo/ModalConfirmacao/ModalConfirmacao'
import ModalRenomear from '@/components/AmbienteEstudo/ModalRenomear/ModalRenomear'
import {
  useAtualizarChat,
  useChats,
  useCriarChat,
  useExcluirChat
} from '@/hooks/ambienteEstudo/useChats'
import { useMateriais } from '@/hooks/ambienteEstudo/useMateriais'

export default function ChatsLayout({ children }: { children: ReactNode }) {
  const { ambienteId } = useParams<{ ambienteId: string }>()
  const chatAtivoId = useSelectedLayoutSegment()
  const parametros = useSearchParams()
  const router = useRouter()
  const { data: chats } = useChats(ambienteId)
  const { data: materiais = [] } = useMateriais(ambienteId)
  const criar = useCriarChat(ambienteId)
  const atualizar = useAtualizarChat()
  const excluir = useExcluirChat()

  const [criando, setCriando] = useState(false)
  const [renomeando, setRenomeando] = useState<Chat | null>(null)
  const [excluindo, setExcluindo] = useState<Chat | null>(null)
  const base = `/ambientes/${ambienteId}/chats`

  useEffect(() => {
    if (parametros.get('novo')) {
      setCriando(true)
      router.replace(base, { scroll: false })
    }
  }, [parametros, router, base])

  return (
    <div className="grid h-[calc(100dvh-15rem)] min-h-[520px] grid-cols-[minmax(0,1fr)] gap-4 max-lg:h-[calc(100dvh-13rem)] lg:grid-cols-[280px_minmax(0,1fr)]">
      <aside className={clsx('min-h-0', chatAtivoId && 'max-lg:hidden')}>
        <ListaChats
          ambienteId={ambienteId}
          chats={chats}
          chatAtivoId={chatAtivoId}
          aoNovo={() => setCriando(true)}
          aoRenomear={setRenomeando}
          aoAlternarFixado={(chat) =>
            atualizar.mutate({ id: chat.id, dados: { fixado: !chat.fixado } })
          }
          aoExcluir={setExcluindo}
        />
      </aside>
      <section className={clsx('min-h-0', !chatAtivoId && 'max-lg:hidden')}>
        {children}
      </section>

      <ModalContextoChat
        aberto={criando}
        aoFechar={() => setCriando(false)}
        ambienteId={ambienteId}
        materiais={materiais}
        salvando={criar.isPending}
        aoSalvar={(dados) =>
          criar.mutate(dados, {
            onSuccess: (chat) => {
              setCriando(false)
              router.push(`${base}/${chat.id}`)
            }
          })
        }
      />
      <ModalRenomear
        aberto={renomeando !== null}
        aoFechar={() => setRenomeando(null)}
        titulo="Renomear chat"
        valorInicial={renomeando?.titulo ?? ''}
        salvando={atualizar.isPending}
        aoSalvar={(titulo) =>
          renomeando &&
          atualizar.mutate(
            { id: renomeando.id, dados: { titulo } },
            { onSuccess: () => setRenomeando(null) }
          )
        }
      />
      <ModalConfirmacao
        aberto={excluindo !== null}
        aoFechar={() => setExcluindo(null)}
        titulo="Excluir chat?"
        perigoso
        textoConfirmar="Excluir"
        carregando={excluir.isPending}
        mensagem={`A conversa “${excluindo?.titulo}” será excluída. Os materiais anexados continuam na biblioteca.`}
        aoConfirmar={() =>
          excluindo &&
          excluir.mutate(excluindo.id, {
            onSuccess: () => {
              if (excluindo.id === chatAtivoId) router.push(base)
              setExcluindo(null)
            }
          })
        }
      />
    </div>
  )
}
