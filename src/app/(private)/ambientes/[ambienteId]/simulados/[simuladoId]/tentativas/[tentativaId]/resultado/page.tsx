'use client'

import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import {
  LuArrowLeft,
  LuLoader,
  LuRotateCcw,
  LuTarget,
  LuTimer
} from 'react-icons/lu'
import { TipoAtividade } from '@/@types/AmbienteEstudo'
import Botao, { LinkBotao } from '@/components/AmbienteEstudo/Botao/Botao'
import EstadoVazio from '@/components/EstadoVazio/EstadoVazio'
import Skeleton from '@/components/Skeleton/Skeleton'
import ResultadoSimulado from '@/components/AmbienteEstudo/Simulado/ResultadoSimulado'
import { useGerarAtividade } from '@/hooks/ambienteEstudo/useAtividades'
import {
  correcaoPendente,
  useIniciarTentativa,
  useSimulado,
  useTentativaSimulado
} from '@/hooks/ambienteEstudo/useSimulados'
import { mensagemDeErro } from '@/services/ambienteEstudo/erros'
import { questaoCorreta } from '@/utils/ambienteEstudo/calcularResultado'

const TIPO_ATIVIDADE_POR_QUESTAO: Record<string, TipoAtividade> = {
  MULTIPLA_ESCOLHA: 'QUIZ',
  VERDADEIRO_FALSO: 'VERDADEIRO_FALSO',
  LACUNAS: 'LACUNAS',
  DISCURSIVA: 'DISCURSIVA'
}

export default function ResultadoPage() {
  const { ambienteId, simuladoId, tentativaId } = useParams<{
    ambienteId: string
    simuladoId: string
    tentativaId: string
  }>()
  const router = useRouter()
  const simulado = useSimulado(simuladoId)
  const tentativa = useTentativaSimulado(tentativaId)
  const iniciar = useIniciarTentativa()
  const gerarAtividade = useGerarAtividade(ambienteId)
  const base = `/ambientes/${ambienteId}/simulados`

  if (simulado.error || tentativa.error) {
    return (
      <EstadoVazio
        icon={<LuTimer />}
        titulo="Resultado não encontrado"
        descricao={mensagemDeErro(simulado.error ?? tentativa.error)}
        acao={<LinkBotao href={base}>Voltar aos simulados</LinkBotao>}
      />
    )
  }

  if (!simulado.data || !tentativa.data) return <Skeleton className="h-96" />

  if (!tentativa.data.resultado) {
    return (
      <EstadoVazio
        icon={<LuLoader className="animate-spin" />}
        titulo="Esta tentativa ainda não foi entregue"
        acao={
          <LinkBotao
            href={`${base}/${simuladoId}/tentativas/${tentativaId}`}
            variante="primario"
          >
            Voltar à prova
          </LinkBotao>
        }
      />
    )
  }

  const dadosSimulado = simulado.data
  const dadosTentativa = tentativa.data
  const erradas = dadosSimulado.questoes.filter(
    (questao) =>
      questaoCorreta(
        questao,
        dadosTentativa.respostas,
        dadosTentativa.resultado?.correcoesDiscursivas
      ) === false
  )
  const tipos = [...new Set(erradas.map(({ tipo }) => tipo))]

  const praticarErradas = () =>
    gerarAtividade.mutate(
      {
        // Questões de um único tipo viram a atividade correspondente; misturadas, um quiz.
        tipo:
          tipos.length === 1 ? TIPO_ATIVIDADE_POR_QUESTAO[tipos[0]] : 'QUIZ',
        materialIds: dadosSimulado.config.materialIds,
        quantidade: erradas.length,
        dificuldade: dadosSimulado.config.dificuldade,
        titulo: `Revisão: ${dadosSimulado.titulo}`,
        questoesBase: erradas
      },
      {
        onSuccess: (atividade) =>
          router.push(`/ambientes/${ambienteId}/atividades/${atividade.id}`)
      }
    )

  const refazer = () =>
    iniciar.mutate(simuladoId, {
      onSuccess: (nova) =>
        router.push(`${base}/${simuladoId}/tentativas/${nova.id}`)
    })

  return (
    <div className="space-y-4">
      <Link
        href={`${base}/${simuladoId}`}
        className="inline-flex items-center gap-1 text-sm font-semibold text-gray-600 hover:text-gray-900"
      >
        <LuArrowLeft aria-hidden /> Simulado
      </Link>
      <ResultadoSimulado
        simulado={dadosSimulado}
        tentativa={dadosTentativa}
        acoes={
          <>
            {erradas.length > 0 && (
              <Botao
                variante="primario"
                icone={<LuTarget aria-hidden />}
                onClick={praticarErradas}
                carregando={gerarAtividade.isPending}
                disabled={correcaoPendente(dadosTentativa.resultado)}
              >
                Praticar as {erradas.length} que errei
              </Botao>
            )}
            <Botao
              icone={<LuRotateCcw aria-hidden />}
              onClick={refazer}
              carregando={iniciar.isPending}
            >
              Refazer simulado
            </Botao>
            <LinkBotao href={`${base}/novo`}>Novo simulado</LinkBotao>
          </>
        }
      />
    </div>
  )
}
