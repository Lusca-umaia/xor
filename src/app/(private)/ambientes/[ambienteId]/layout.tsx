'use client'

import clsx from 'clsx'
import Link from 'next/link'
import {
  useParams,
  useRouter,
  useSelectedLayoutSegments
} from 'next/navigation'
import { ReactNode, useState } from 'react'
import {
  LuArchive,
  LuArchiveRestore,
  LuArrowLeft,
  LuGraduationCap,
  LuPencil,
  LuTrash2
} from 'react-icons/lu'
import CapaXor from '@/components/CapaXor/CapaXor'
import AbasAmbiente from '@/components/AmbienteEstudo/AbasAmbiente/AbasAmbiente'
import Botao, { LinkBotao } from '@/components/AmbienteEstudo/Botao/Botao'
import EstadoVazio from '@/components/AmbienteEstudo/EstadoVazio/EstadoVazio'
import Esqueleto from '@/components/AmbienteEstudo/Esqueleto/Esqueleto'
import MenuAcoes from '@/components/AmbienteEstudo/MenuAcoes/MenuAcoes'
import ModalAmbiente from '@/components/AmbienteEstudo/ModalAmbiente/ModalAmbiente'
import ModalConfirmacao from '@/components/AmbienteEstudo/ModalConfirmacao/ModalConfirmacao'
import {
  useAmbiente,
  useAtualizarAmbiente,
  useExcluirAmbiente
} from '@/hooks/ambienteEstudo/useAmbientes'
import {
  ErroNaoEncontrado,
  mensagemDeErro
} from '@/services/ambienteEstudo/erros'
import { CORES_AMBIENTE } from '@/utils/ambienteEstudo/cores'

export default function AmbienteLayout({ children }: { children: ReactNode }) {
  const { ambienteId } = useParams<{ ambienteId: string }>()
  const router = useRouter()
  const segmentos = useSelectedLayoutSegments()
  const { data: ambiente, isLoading, error, refetch } = useAmbiente(ambienteId)
  const atualizar = useAtualizarAmbiente()
  const excluir = useExcluirAmbiente()
  const [editando, setEditando] = useState(false)
  const [confirmandoExclusao, setConfirmandoExclusao] = useState(false)

  // Realização de simulado: modo foco, sem cabeçalho nem abas.
  const modoFoco =
    segmentos.includes('tentativas') && segmentos.at(-1) !== 'resultado'
  if (modoFoco) return <>{children}</>

  if (error) {
    const naoEncontrado = error instanceof ErroNaoEncontrado
    return (
      <EstadoVazio
        icone={<LuGraduationCap />}
        titulo={
          naoEncontrado
            ? 'Ambiente não encontrado'
            : 'Erro ao carregar o ambiente'
        }
        descricao={
          naoEncontrado
            ? 'Ele pode ter sido excluído ou o link está incorreto.'
            : mensagemDeErro(error)
        }
        acao={
          naoEncontrado ? (
            <LinkBotao href="/ambientes" variante="primario">
              Ver meus ambientes
            </LinkBotao>
          ) : (
            <Botao onClick={() => refetch()}>Tentar novamente</Botao>
          )
        }
      />
    )
  }

  const cor = ambiente ? CORES_AMBIENTE[ambiente.cor] : null

  return (
    <div className="space-y-5">
      <header className="space-y-4">
        <Link
          href="/ambientes"
          className="inline-flex items-center gap-1 text-sm font-semibold text-gray-600 hover:text-gray-900"
        >
          <LuArrowLeft aria-hidden /> Ambientes
        </Link>

        {isLoading || !ambiente || !cor ? (
          <Esqueleto className="h-36 rounded-3xl" />
        ) : (
          <section className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-lg">
            <CapaXor className="px-6 py-6 max-md:px-4 max-md:py-5">
              <div className="flex items-start gap-3">
                <div className="min-w-0 flex-1 space-y-2 pr-28 max-md:pr-16">
                  <div className="flex flex-wrap items-center gap-2">
                    {ambiente.disciplinaCodigo && (
                      <span className="inline-flex rounded-md bg-white/10 px-2 py-0.5 font-mono text-xs font-semibold text-white/90 ring-1 ring-inset ring-white/20">
                        {ambiente.disciplinaCodigo}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-white/10 px-2 py-0.5 text-xs font-semibold text-white/90 ring-1 ring-inset ring-white/20">
                      <span
                        className={clsx('size-2 rounded-full', cor.solido)}
                        aria-hidden
                      />
                      {ambiente.origem === 'CADEIRA'
                        ? 'Cadeira em andamento'
                        : 'Ambiente livre'}
                    </span>
                    {ambiente.arquivado && (
                      <span className="inline-flex rounded-md bg-xor-lime px-2 py-0.5 text-xs font-semibold text-xor-navy">
                        Arquivado
                      </span>
                    )}
                  </div>
                  <h1 className="text-2xl font-bold tracking-tight text-white max-md:text-lg sm:text-3xl">
                    {ambiente.nome}
                  </h1>
                  {ambiente.descricao && (
                    <p className="text-sm font-medium text-white/70">
                      {ambiente.descricao}
                    </p>
                  )}
                </div>
                <MenuAcoes
                  claro
                  rotulo="Ações do ambiente"
                  acoes={[
                    {
                      rotulo: 'Editar',
                      icone: <LuPencil />,
                      aoClicar: () => setEditando(true)
                    },
                    {
                      rotulo: ambiente.arquivado ? 'Desarquivar' : 'Arquivar',
                      icone: ambiente.arquivado ? (
                        <LuArchiveRestore />
                      ) : (
                        <LuArchive />
                      ),
                      aoClicar: () =>
                        atualizar.mutate({
                          id: ambiente.id,
                          dados: { arquivado: !ambiente.arquivado }
                        })
                    },
                    {
                      rotulo: 'Excluir',
                      icone: <LuTrash2 />,
                      perigosa: true,
                      aoClicar: () => setConfirmandoExclusao(true)
                    }
                  ]}
                />
              </div>
            </CapaXor>
          </section>
        )}
        <AbasAmbiente ambienteId={ambienteId} />
      </header>

      {children}

      <ModalAmbiente
        aberto={editando}
        aoFechar={() => setEditando(false)}
        ambiente={ambiente}
        salvando={atualizar.isPending}
        aoSalvar={(dados) =>
          atualizar.mutate(
            { id: ambienteId, dados },
            { onSuccess: () => setEditando(false) }
          )
        }
      />
      <ModalConfirmacao
        aberto={confirmandoExclusao}
        aoFechar={() => setConfirmandoExclusao(false)}
        titulo="Excluir ambiente?"
        perigoso
        textoConfirmar="Excluir definitivamente"
        carregando={excluir.isPending}
        mensagem="Todos os materiais, chats, resumos, atividades e simulados deste ambiente serão excluídos. Esta ação não pode ser desfeita."
        aoConfirmar={() =>
          excluir.mutate(ambienteId, {
            onSuccess: () => router.push('/ambientes')
          })
        }
      />
    </div>
  )
}
