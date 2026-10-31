'use client'

import Link from 'next/link'
import { useParams, useSearchParams } from 'next/navigation'
import { LuArrowLeft, LuListChecks, LuLoader } from 'react-icons/lu'
import { LinkBotao } from '@/components/AmbienteEstudo/Botao/Botao'
import EstadoVazio from '@/components/AmbienteEstudo/EstadoVazio/EstadoVazio'
import Esqueleto from '@/components/AmbienteEstudo/Esqueleto/Esqueleto'
import PlayerFlashcards from '@/components/AmbienteEstudo/PlayerFlashcards/PlayerFlashcards'
import PlayerQuestoes from '@/components/AmbienteEstudo/PlayerQuestoes/PlayerQuestoes'
import { useAtividade } from '@/hooks/ambienteEstudo/useAtividades'
import { mensagemDeErro } from '@/services/ambienteEstudo/erros'

export default function AtividadePage() {
  const { ambienteId, atividadeId } = useParams<{
    ambienteId: string
    atividadeId: string
  }>()
  const parametros = useSearchParams()
  const { data: atividade, isLoading, error } = useAtividade(atividadeId)
  const voltar = `/ambientes/${ambienteId}/atividades`

  return (
    <div className="space-y-4">
      <Link
        href={voltar}
        className="inline-flex items-center gap-1 text-sm font-semibold text-gray-600 hover:text-gray-900"
      >
        <LuArrowLeft aria-hidden /> Atividades
      </Link>

      {isLoading && <Esqueleto className="mx-auto h-72 max-w-3xl" />}

      {error && (
        <EstadoVazio
          icone={<LuListChecks />}
          titulo="Atividade não encontrada"
          descricao={mensagemDeErro(error)}
          acao={<LinkBotao href={voltar}>Voltar às atividades</LinkBotao>}
        />
      )}

      {atividade?.status === 'GERANDO' && (
        <EstadoVazio
          icone={<LuLoader className="animate-spin" />}
          titulo="Gerando a atividade..."
          descricao="A IA está criando as questões a partir dos seus materiais. Isso leva alguns segundos."
        />
      )}

      {atividade?.status === 'PRONTO' &&
        (atividade.tipo === 'FLASHCARDS' ? (
          <PlayerFlashcards
            atividade={atividade}
            ambienteId={ambienteId}
            modoInicial={
              parametros.get('modo') === 'pendentes' ? 'pendentes' : undefined
            }
          />
        ) : atividade.questoes.length === 0 ? (
          <EstadoVazio
            icone={<LuListChecks />}
            titulo="Nenhuma questão foi gerada"
            descricao="Os materiais selecionados não tinham conteúdo suficiente para este tipo de atividade. Tente outro tipo ou adicione mais materiais."
            acao={<LinkBotao href={voltar}>Voltar às atividades</LinkBotao>}
          />
        ) : (
          <PlayerQuestoes atividade={atividade} ambienteId={ambienteId} />
        ))}
    </div>
  )
}
