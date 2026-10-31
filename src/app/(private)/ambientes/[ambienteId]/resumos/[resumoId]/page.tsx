'use client'

import clsx from 'clsx'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import {
  LuArrowLeft,
  LuCopy,
  LuFileText,
  LuLayers,
  LuLoader,
  LuPencil,
  LuPrinter,
  LuTrash2
} from 'react-icons/lu'
import Botao, { LinkBotao } from '@/components/AmbienteEstudo/Botao/Botao'
import BotaoReportar from '@/components/AmbienteEstudo/BotaoReportar/BotaoReportar'
import Citacoes from '@/components/AmbienteEstudo/Citacoes/Citacoes'
import EstadoVazio from '@/components/AmbienteEstudo/EstadoVazio/EstadoVazio'
import Esqueleto from '@/components/AmbienteEstudo/Esqueleto/Esqueleto'
import { classeCartao } from '@/components/AmbienteEstudo/estilos'
import MenuAcoes from '@/components/AmbienteEstudo/MenuAcoes/MenuAcoes'
import ModalConfirmacao from '@/components/AmbienteEstudo/ModalConfirmacao/ModalConfirmacao'
import ModalRenomear from '@/components/AmbienteEstudo/ModalRenomear/ModalRenomear'
import EditorResumo from '@/components/AmbienteEstudo/Resumo/EditorResumo'
import VisualizadorResumo from '@/components/AmbienteEstudo/Resumo/VisualizadorResumo'
import SeloIA from '@/components/AmbienteEstudo/SeloIA/SeloIA'
import { useGerarAtividade } from '@/hooks/ambienteEstudo/useAtividades'
import { useMateriais } from '@/hooks/ambienteEstudo/useMateriais'
import {
  useAtualizarResumo,
  useExcluirResumo,
  useResumo
} from '@/hooks/ambienteEstudo/useResumos'
import { mensagemDeErro } from '@/services/ambienteEstudo/erros'
import { formatarDataHora } from '@/utils/ambienteEstudo/formatar'
import { ROTULO_FORMATO_RESUMO } from '@/utils/ambienteEstudo/rotulos'

export default function ResumoPage() {
  const { ambienteId, resumoId } = useParams<{
    ambienteId: string
    resumoId: string
  }>()
  const router = useRouter()
  const { data: resumo, isLoading, error } = useResumo(resumoId)
  const { data: materiais = [] } = useMateriais(ambienteId)
  const atualizar = useAtualizarResumo()
  const excluir = useExcluirResumo()
  const gerarFlashcards = useGerarAtividade(ambienteId)
  const [editando, setEditando] = useState(false)
  const [renomeando, setRenomeando] = useState(false)
  const [excluindo, setExcluindo] = useState(false)
  const voltar = `/ambientes/${ambienteId}/resumos`

  const copiar = async () => {
    if (!resumo) return
    try {
      await navigator.clipboard.writeText(resumo.conteudo)
      toast.success('Resumo copiado.')
    } catch {
      toast.error('Não foi possível copiar.')
    }
  }

  const criarFlashcards = () =>
    resumo &&
    gerarFlashcards.mutate(
      {
        tipo: 'FLASHCARDS',
        materialIds: resumo.materialIds,
        quantidade: 10,
        dificuldade: 'MISTA',
        titulo: `Flashcards: ${resumo.titulo}`,
        origemResumoId: resumo.id
      },
      {
        onSuccess: (atividade) =>
          router.push(`/ambientes/${ambienteId}/atividades/${atividade.id}`)
      }
    )

  const usados = materiais.filter(({ id }) => resumo?.materialIds.includes(id))

  return (
    <div className="space-y-4">
      <Link
        href={voltar}
        className="inline-flex items-center gap-1 text-sm font-semibold text-gray-600 hover:text-gray-900"
      >
        <LuArrowLeft aria-hidden /> Resumos
      </Link>

      {isLoading && <Esqueleto className="h-96" />}

      {error && (
        <EstadoVazio
          icone={<LuFileText />}
          titulo="Resumo não encontrado"
          descricao={mensagemDeErro(error)}
          acao={<LinkBotao href={voltar}>Voltar aos resumos</LinkBotao>}
        />
      )}

      {resumo?.status === 'GERANDO' && (
        <EstadoVazio
          icone={<LuLoader className="animate-spin" />}
          titulo="Gerando o resumo..."
          descricao="A IA está lendo os materiais selecionados. Isso leva alguns segundos."
        />
      )}

      {resumo?.status === 'PRONTO' && (
        <article
          className={clsx(
            classeCartao,
            'area-impressao space-y-5 p-6 max-md:p-4'
          )}
        >
          <header className="flex flex-wrap items-start gap-3">
            <div className="min-w-0 flex-1">
              <h2 className="text-2xl font-bold">{resumo.titulo}</h2>
              <p className="mt-1 text-xs text-gray-500">
                {ROTULO_FORMATO_RESUMO[resumo.formato]} · atualizado em{' '}
                {formatarDataHora(resumo.atualizadoEm)}
                {usados.length > 0 &&
                  ` · a partir de ${usados.map(({ nome }) => nome).join(', ')}`}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <SeloIA texto="Gerado por IA a partir dos seus materiais: confira as fontes" />
                {resumo.editadoPeloAluno && (
                  <span className="rounded-full bg-gray-900 px-2 py-0.5 text-xs font-semibold text-white">
                    Editado por você
                  </span>
                )}
                {resumo.origemChatId && (
                  <Link
                    href={`/ambientes/${ambienteId}/chats/${resumo.origemChatId}`}
                    className="nao-imprimir rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium underline"
                  >
                    Ver chat de origem
                  </Link>
                )}
              </div>
            </div>
            {!editando && (
              <div className="nao-imprimir flex flex-wrap items-center gap-2">
                <Botao
                  tamanho="sm"
                  icone={<LuPencil aria-hidden />}
                  onClick={() => setEditando(true)}
                >
                  Editar
                </Botao>
                <Botao
                  tamanho="sm"
                  icone={<LuLayers aria-hidden />}
                  onClick={criarFlashcards}
                  carregando={gerarFlashcards.isPending}
                >
                  Gerar flashcards
                </Botao>
                <MenuAcoes
                  rotulo="Mais ações do resumo"
                  acoes={[
                    { rotulo: 'Copiar', icone: <LuCopy />, aoClicar: copiar },
                    {
                      rotulo: 'Imprimir',
                      icone: <LuPrinter />,
                      aoClicar: () => window.print()
                    },
                    {
                      rotulo: 'Renomear',
                      icone: <LuPencil />,
                      aoClicar: () => setRenomeando(true)
                    },
                    {
                      rotulo: 'Excluir',
                      icone: <LuTrash2 />,
                      perigosa: true,
                      aoClicar: () => setExcluindo(true)
                    }
                  ]}
                />
              </div>
            )}
          </header>

          {editando ? (
            <EditorResumo
              formato={resumo.formato}
              conteudoInicial={resumo.conteudo}
              salvando={atualizar.isPending}
              aoCancelar={() => setEditando(false)}
              aoSalvar={(conteudo) =>
                atualizar.mutate(
                  { id: resumo.id, dados: { conteudo } },
                  { onSuccess: () => setEditando(false) }
                )
              }
            />
          ) : (
            <VisualizadorResumo
              formato={resumo.formato}
              conteudo={resumo.conteudo}
            />
          )}

          {!editando && (
            <footer className="flex flex-wrap items-center gap-2 border-t border-gray-100 pt-4">
              <Citacoes citacoes={resumo.citacoes} />
              <BotaoReportar
                alvo={{ tipo: 'RESUMO', id: resumo.id }}
                className="nao-imprimir ml-auto"
              />
            </footer>
          )}
        </article>
      )}

      <ModalRenomear
        aberto={renomeando}
        aoFechar={() => setRenomeando(false)}
        titulo="Renomear resumo"
        valorInicial={resumo?.titulo ?? ''}
        salvando={atualizar.isPending}
        aoSalvar={(titulo) =>
          atualizar.mutate(
            { id: resumoId, dados: { titulo } },
            { onSuccess: () => setRenomeando(false) }
          )
        }
      />
      <ModalConfirmacao
        aberto={excluindo}
        aoFechar={() => setExcluindo(false)}
        titulo="Excluir resumo?"
        perigoso
        textoConfirmar="Excluir"
        carregando={excluir.isPending}
        mensagem="O resumo e suas edições serão excluídos."
        aoConfirmar={() =>
          excluir.mutate(resumoId, { onSuccess: () => router.push(voltar) })
        }
      />
    </div>
  )
}
