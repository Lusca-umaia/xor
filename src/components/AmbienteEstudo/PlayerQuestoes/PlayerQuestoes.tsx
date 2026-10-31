'use client'

import { useQueryClient } from '@tanstack/react-query'
import clsx from 'clsx'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import { LuArrowLeft, LuArrowRight, LuPlay, LuRotateCcw } from 'react-icons/lu'
import {
  Atividade,
  Resposta,
  TentativaAtividade
} from '@/@types/AmbienteEstudo'
import { chavesAmbiente } from '@/hooks/ambienteEstudo/chavesConsulta'
import { useAtalhosTeclado } from '@/hooks/ambienteEstudo/useAtalhosTeclado'
import {
  useCorrigirDiscursiva,
  useGerarAtividade,
  useTentativasAtividade
} from '@/hooks/ambienteEstudo/useAtividades'
import { useMutacaoAmbiente } from '@/hooks/ambienteEstudo/useMutacaoAmbiente'
import {
  iniciarTentativaAtividade,
  salvarTentativaAtividade
} from '@/services/ambienteEstudo/atividades'
import { mensagemDeErro } from '@/services/ambienteEstudo/erros'
import { registrarEventoEstudo } from '@/services/ambienteEstudo/eventos'
import {
  contarAcertos,
  questaoCorreta
} from '@/utils/ambienteEstudo/calcularResultado'
import {
  corrigirQuestao,
  respostaPreenchida
} from '@/utils/ambienteEstudo/corrigirQuestao'
import { ROTULO_TIPO_ATIVIDADE } from '@/utils/ambienteEstudo/rotulos'
import Botao from '../Botao/Botao'
import Skeleton from '@/components/Skeleton/Skeleton'
import { classeCartao } from '../estilos'
import FeedbackQuestao from '../Questoes/FeedbackQuestao'
import RenderizadorQuestao from '../Questoes/RenderizadorQuestao'
import ResultadoAtividade from '../ResultadoAtividade/ResultadoAtividade'

type Fase = 'INICIO' | 'RESPONDENDO' | 'RESULTADO'

const LETRAS = ['a', 'b', 'c', 'd', 'e']

/** Quiz, V/F, lacunas e discursiva: uma questão por vez, com feedback imediato. */
export default function PlayerQuestoes({
  atividade,
  ambienteId
}: {
  atividade: Atividade
  ambienteId: string
}) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { data: tentativas, isLoading } = useTentativasAtividade(atividade.id)
  const iniciar = useMutacaoAmbiente(iniciarTentativaAtividade, {
    invalidar: false
  })
  const corrigir = useCorrigirDiscursiva()
  const gerarErradas = useGerarAtividade(ambienteId)

  const [fase, setFase] = useState<Fase>('INICIO')
  const [tentativa, setTentativa] = useState<TentativaAtividade | null>(null)

  const { questoes } = atividade
  const emAndamento = tentativas?.find(({ concluidaEm }) => !concluidaEm)
  const concluidas = tentativas?.filter(({ concluidaEm }) => concluidaEm) ?? []
  const melhor = [...concluidas].sort((a, b) => b.acertos - a.acertos)[0]

  const salvar = (nova: TentativaAtividade) => {
    setTentativa(nova)
    salvarTentativaAtividade(nova).catch((erro) =>
      toast.error(mensagemDeErro(erro))
    )
  }

  const comecar = () =>
    iniciar.mutate(atividade.id, {
      onSuccess: (nova) => {
        setTentativa(nova)
        setFase('RESPONDENDO')
      }
    })

  const questao = tentativa ? questoes[tentativa.indiceAtual] : undefined
  const resposta =
    questao && tentativa ? tentativa.respostas[questao.id] : undefined
  const confirmada = Boolean(
    questao && tentativa?.confirmadas.includes(questao.id)
  )
  const ultima = tentativa
    ? tentativa.indiceAtual === questoes.length - 1
    : false

  const responder = (nova: Resposta) => {
    if (!tentativa || !questao || confirmada) return
    setTentativa({
      ...tentativa,
      respostas: { ...tentativa.respostas, [questao.id]: nova }
    })
  }

  const confirmar = () => {
    if (
      !tentativa ||
      !questao ||
      confirmada ||
      !respostaPreenchida(questao, resposta)
    )
      return
    const confirmadas = [...tentativa.confirmadas, questao.id]

    if (questao.tipo === 'DISCURSIVA' && resposta?.tipo === 'DISCURSIVA') {
      corrigir.mutate(
        { questaoId: questao.id, texto: resposta.texto },
        {
          onSuccess: (correcao) =>
            salvar({
              ...tentativa,
              confirmadas,
              correcoesDiscursivas: {
                ...tentativa.correcoesDiscursivas,
                [questao.id]: correcao
              }
            })
        }
      )
      return
    }

    registrarEventoEstudo('QUESTAO_RESPONDIDA', {
      atividadeId: atividade.id,
      correta: corrigirQuestao(questao, resposta)?.correta
    })
    salvar({ ...tentativa, confirmadas })
  }

  const avancar = () => {
    if (!tentativa || !confirmada) return
    if (!ultima) {
      salvar({ ...tentativa, indiceAtual: tentativa.indiceAtual + 1 })
      return
    }
    const concluida: TentativaAtividade = {
      ...tentativa,
      acertos: contarAcertos(
        questoes,
        tentativa.respostas,
        tentativa.correcoesDiscursivas
      ),
      total: questoes.length,
      concluidaEm: new Date().toISOString()
    }
    salvar(concluida)
    setFase('RESULTADO')
    queryClient.invalidateQueries({
      queryKey: chavesAmbiente.atividades(ambienteId)
    })
    queryClient.invalidateQueries({
      queryKey: chavesAmbiente.tentativasAtividade(atividade.id)
    })
  }

  const voltar = () => {
    if (tentativa && tentativa.indiceAtual > 0) {
      setTentativa({ ...tentativa, indiceAtual: tentativa.indiceAtual - 1 })
    }
  }

  const refazerErradas = () => {
    if (!tentativa) return
    const erradas = questoes.filter(
      (item) =>
        questaoCorreta(
          item,
          tentativa.respostas,
          tentativa.correcoesDiscursivas
        ) === false
    )
    gerarErradas.mutate(
      {
        tipo: atividade.tipo,
        materialIds: atividade.materialIds,
        quantidade: erradas.length,
        dificuldade: atividade.dificuldade,
        titulo: `${atividade.titulo} (revisão)`,
        questoesBase: erradas
      },
      {
        onSuccess: (nova) =>
          router.push(`/ambientes/${ambienteId}/atividades/${nova.id}`)
      }
    )
  }

  const atalhos: Record<string, () => void> = {
    enter: () => (confirmada ? avancar() : confirmar()),
    arrowright: avancar,
    arrowleft: voltar
  }
  if (questao?.tipo === 'MULTIPLA_ESCOLHA') {
    questao.opcoes.forEach(({ id }, indice) => {
      const escolher = () =>
        responder({ tipo: 'MULTIPLA_ESCOLHA', opcaoId: id })
      atalhos[LETRAS[indice]] = escolher
      atalhos[String(indice + 1)] = escolher
    })
  }
  if (questao?.tipo === 'VERDADEIRO_FALSO') {
    atalhos.v = () => responder({ tipo: 'VERDADEIRO_FALSO', valor: true })
    atalhos.f = () => responder({ tipo: 'VERDADEIRO_FALSO', valor: false })
  }
  useAtalhosTeclado(atalhos, fase === 'RESPONDENDO')

  if (isLoading) return <Skeleton className="h-64" />

  if (fase === 'RESULTADO' && tentativa) {
    return (
      <ResultadoAtividade
        atividade={atividade}
        tentativa={tentativa}
        voltarHref={`/ambientes/${ambienteId}/atividades`}
        aoRefazer={comecar}
        refazendo={iniciar.isPending}
        aoRefazerErradas={refazerErradas}
        gerandoErradas={gerarErradas.isPending}
      />
    )
  }

  if (fase === 'INICIO' || !tentativa || !questao) {
    return (
      <section
        className={clsx(classeCartao, 'mx-auto max-w-xl p-6 text-center')}
      >
        <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">
          {ROTULO_TIPO_ATIVIDADE[atividade.tipo]}
        </p>
        <h2 className="mt-1 text-2xl font-bold">{atividade.titulo}</h2>
        <p className="mt-2 text-gray-600">
          {questoes.length} {questoes.length === 1 ? 'questão' : 'questões'} ·
          feedback imediato após cada resposta
        </p>
        {melhor && (
          <p className="mt-1 text-sm text-gray-500">
            Seu melhor resultado: {melhor.acertos}/{melhor.total}
          </p>
        )}
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {emAndamento && (
            <Botao
              variante="primario"
              icone={<LuPlay aria-hidden />}
              onClick={() => {
                setTentativa(emAndamento)
                setFase('RESPONDENDO')
              }}
            >
              Continuar (questão {emAndamento.indiceAtual + 1} de{' '}
              {questoes.length})
            </Botao>
          )}
          <Botao
            variante={emAndamento ? 'secundario' : 'primario'}
            icone={
              emAndamento ? <LuRotateCcw aria-hidden /> : <LuPlay aria-hidden />
            }
            onClick={comecar}
            carregando={iniciar.isPending}
          >
            {emAndamento ? 'Recomeçar' : 'Começar'}
          </Botao>
        </div>
        <p className="mt-4 hidden text-xs text-gray-400 sm:block">
          Atalhos: A–E ou 1–5 escolhem a alternativa, V/F julgam, Enter
          confirma, ← → navegam.
        </p>
      </section>
    )
  }

  const progresso =
    ((tentativa.indiceAtual + (confirmada ? 1 : 0)) / questoes.length) * 100

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div className="flex items-center gap-3">
        <div
          className="h-2 flex-1 overflow-hidden rounded-full bg-gray-200"
          role="progressbar"
          aria-valuenow={Math.round(progresso)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Progresso da atividade"
        >
          <div
            className="h-full rounded-full bg-xor-navy transition-all"
            style={{ width: `${progresso}%` }}
          />
        </div>
        <span className="text-sm font-semibold text-gray-600">
          {tentativa.indiceAtual + 1}/{questoes.length}
        </span>
      </div>

      <section className={clsx(classeCartao, 'space-y-5 p-6 max-md:p-4')}>
        <RenderizadorQuestao
          key={questao.id}
          numero={tentativa.indiceAtual + 1}
          questao={questao}
          resposta={resposta}
          aoResponder={responder}
          modo={
            confirmada
              ? 'CORRIGIDA'
              : corrigir.isPending
                ? 'BLOQUEADA'
                : 'RESPONDENDO'
          }
        />

        {(confirmada || corrigir.isPending) && (
          <FeedbackQuestao
            questao={questao}
            resposta={resposta}
            correcaoDiscursiva={
              tentativa.correcoesDiscursivas[questao.id] ?? null
            }
          />
        )}

        <div className="flex items-center justify-between gap-2 border-t border-gray-100 pt-4">
          <Botao
            variante="fantasma"
            icone={<LuArrowLeft aria-hidden />}
            onClick={voltar}
            disabled={tentativa.indiceAtual === 0}
          >
            Anterior
          </Botao>
          {confirmada ? (
            <Botao variante="primario" onClick={avancar}>
              {ultima ? 'Ver resultado' : 'Próxima'}
              <LuArrowRight aria-hidden />
            </Botao>
          ) : (
            <Botao
              variante="primario"
              onClick={confirmar}
              disabled={!respostaPreenchida(questao, resposta)}
              carregando={corrigir.isPending}
            >
              {questao.tipo === 'DISCURSIVA'
                ? 'Enviar para correção'
                : 'Confirmar resposta'}
            </Botao>
          )}
        </div>
      </section>
    </div>
  )
}
