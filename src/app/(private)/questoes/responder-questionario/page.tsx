'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'
import { Questao } from '@/@types/Questionario'
import Header from '@/components/Header/Header'
import Skeleton, { SkeletonCard } from '@/components/Skeleton/Skeleton'
import { useEnviarResolucao } from '@/hooks/mutations/useQuestionarios'
import { useQuestionario } from '@/hooks/queries/useQuestionarios'
import type { EnviarResolucaoPayload } from '@/services/questionarios/enviarResolucao'
import { getErrorMessage, getErrorStatus } from '@/services/api'
import IntroducaoQuestionario, {
  ModoResolucao
} from '../components/IntroducaoQuestionario'
import ResolucaoQuestionario, {
  Respostas
} from '../components/ResolucaoQuestionario'
import ResultadoQuestionario from '../components/ResultadoQuestionario'

type Etapa =
  | { tipo: 'INTRO' }
  | {
      tipo: 'RESOLVENDO'
      questoes: Questao[]
      treino: boolean
      // Muda a cada início para remontar a resolução do zero.
      rodada: number
    }
  | {
      tipo: 'RESULTADO'
      questoes: Questao[]
      treino: boolean
      respostas: Respostas
      duracaoSegundos: number
      melhorAnterior: number | null
    }

const embaralhar = <T,>(lista: T[]) => {
  const copia = [...lista]
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copia[i], copia[j]] = [copia[j], copia[i]]
  }
  return copia
}

const VOLTAR = '/questoes/lista-questionario'

const ResponderQuestionario = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const questionarioId = Number(searchParams.get('id')) || null

  const {
    data: questionario,
    isLoading,
    error
  } = useQuestionario(questionarioId)
  const enviar = useEnviarResolucao()

  const [etapa, setEtapa] = useState<Etapa>({ tipo: 'INTRO' })
  const [opcoes, setOpcoes] = useState<{
    modo: ModoResolucao
    embaralhar: boolean
  }>({ modo: 'PROVA', embaralhar: false })
  const [envioPendente, setEnvioPendente] =
    useState<EnviarResolucaoPayload | null>(null)

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [etapa.tipo])

  if (!questionarioId || getErrorStatus(error) === 404) {
    return (
      <div>
        <Header title="Questionário não encontrado" backPath={VOLTAR} />
        <p className="text-sm text-gray-500">
          Ele pode ter sido excluído. Volte para a lista e escolha outro.
        </p>
      </div>
    )
  }

  if (error) {
    return (
      <div>
        <Header title="Responder questionário" backPath={VOLTAR} />
        <p className="text-sm font-medium text-red-600">
          {getErrorMessage(error, 'Não foi possível carregar o questionário')}
        </p>
      </div>
    )
  }

  if (isLoading || !questionario) {
    return (
      <div className="mx-auto max-w-5xl space-y-4">
        <Skeleton className="h-6 w-24" />
        <SkeletonCard className="h-96 p-6" />
      </div>
    )
  }

  const iniciar = (questoes: Questao[], treino: boolean) => {
    enviar.reset()
    setEtapa({
      tipo: 'RESOLVENDO',
      questoes: opcoes.embaralhar ? embaralhar(questoes) : questoes,
      treino,
      rodada: Date.now()
    })
  }

  const registrar = (payload: EnviarResolucaoPayload) => {
    setEnvioPendente(payload)
    enviar.mutate(payload)
  }

  const finalizar = (respostas: Respostas, duracaoSegundos: number) => {
    if (etapa.tipo !== 'RESOLVENDO') return
    const { questoes, treino } = etapa

    // Capturado antes do envio, que atualiza o histórico.
    const percentuais = questionario.historico.map((r) => r.percentual)
    setEtapa({
      tipo: 'RESULTADO',
      questoes,
      treino,
      respostas,
      duracaoSegundos,
      melhorAnterior: percentuais.length ? Math.max(...percentuais) : null
    })

    if (!treino) {
      registrar({
        questionarioId: questionario.id,
        dados: {
          respostas: questoes.map((q) => ({
            questaoId: q.id,
            alternativa: respostas[q.id] ?? null
          })),
          duracaoSegundos
        }
      })
    }
  }

  return (
    <div>
      {etapa.tipo === 'INTRO' && (
        <>
          <Header title="Responder questionário" backPath={VOLTAR} />
          <IntroducaoQuestionario
            questionario={questionario}
            onIniciar={(escolhidas) => {
              setOpcoes(escolhidas)
              enviar.reset()
              setEtapa({
                tipo: 'RESOLVENDO',
                questoes: escolhidas.embaralhar
                  ? embaralhar(questionario.questoes)
                  : questionario.questoes,
                treino: false,
                rodada: Date.now()
              })
            }}
          />
        </>
      )}

      {etapa.tipo === 'RESOLVENDO' && (
        <ResolucaoQuestionario
          key={etapa.rodada}
          titulo={questionario.titulo}
          questoes={etapa.questoes}
          modo={opcoes.modo}
          treino={etapa.treino}
          onFinalizar={finalizar}
        />
      )}

      {etapa.tipo === 'RESULTADO' && (
        <>
          <Header title={questionario.titulo} backPath={VOLTAR} />
          <ResultadoQuestionario
            questoes={etapa.questoes}
            respostas={etapa.respostas}
            duracaoSegundos={etapa.duracaoSegundos}
            treino={etapa.treino}
            melhorAnterior={etapa.melhorAnterior}
            envio={{
              salvando: enviar.isPending,
              erro: enviar.error
                ? getErrorMessage(enviar.error, 'Não foi possível salvar')
                : null,
              onTentarNovamente: () => envioPendente && registrar(envioPendente)
            }}
            onRefazer={() => iniciar(questionario.questoes, false)}
            onTreinarErradas={(erradas) => iniciar(erradas, true)}
            onVoltar={() => router.push(VOLTAR)}
          />
        </>
      )}
    </div>
  )
}

const Page = () => (
  <Suspense>
    <ResponderQuestionario />
  </Suspense>
)

export default Page
