import {
  CorrecaoDiscursiva,
  Questao,
  Resposta,
  ResultadoSimulado
} from '@/@types/AmbienteEstudo'
import { corrigirQuestao } from './corrigirQuestao'

/** Proporção mínima da rubrica para uma discursiva contar como acerto. */
const LIMIAR_DISCURSIVA = 0.6

/** `true`/`false` para questões corrigidas; `null` para discursivas pendentes. */
export function questaoCorreta(
  questao: Questao,
  respostas: Record<string, Resposta>,
  correcoes: Record<string, CorrecaoDiscursiva> = {}
): boolean | null {
  if (questao.tipo === 'DISCURSIVA') {
    const correcao = correcoes[questao.id]
    if (!correcao || correcao.status !== 'PRONTO') return null
    return correcao.nota / correcao.notaMaxima >= LIMIAR_DISCURSIVA
  }
  return corrigirQuestao(questao, respostas[questao.id])?.correta ?? false
}

export function contarAcertos(
  questoes: Questao[],
  respostas: Record<string, Resposta>,
  correcoes: Record<string, CorrecaoDiscursiva> = {}
) {
  return questoes.reduce(
    (total, questao) =>
      questaoCorreta(questao, respostas, correcoes) ? total + 1 : total,
    0
  )
}

export function calcularDesempenhoPorTopico(
  questoes: Questao[],
  respostas: Record<string, Resposta>,
  correcoes: Record<string, CorrecaoDiscursiva> = {}
) {
  const porTopico = new Map<string, { acertos: number; total: number }>()

  questoes.forEach((questao) => {
    const correta = questaoCorreta(questao, respostas, correcoes)
    if (correta === null) return

    const topico = questao.topico ?? 'Geral'
    const atual = porTopico.get(topico) ?? { acertos: 0, total: 0 }
    porTopico.set(topico, {
      acertos: atual.acertos + (correta ? 1 : 0),
      total: atual.total + 1
    })
  })

  return [...porTopico.entries()]
    .map(([topico, valores]) => ({ topico, ...valores }))
    .sort((a, b) => a.acertos / a.total - b.acertos / b.total)
}

/**
 * Nota de 0 a 10. Cada objetiva vale 1 ponto e cada discursiva vale a
 * proporção obtida na rubrica. Discursivas ainda não corrigidas ficam de fora
 * (a nota é parcial até a correção terminar).
 */
export function calcularResultadoSimulado(
  questoes: Questao[],
  respostas: Record<string, Resposta>,
  correcoes: Record<string, CorrecaoDiscursiva>
): ResultadoSimulado {
  const objetivas = questoes.filter(({ tipo }) => tipo !== 'DISCURSIVA')
  const discursivas = questoes.filter(({ tipo }) => tipo === 'DISCURSIVA')
  const corrigidas = discursivas
    .map(({ id }) => correcoes[id])
    .filter((correcao) => correcao?.status === 'PRONTO')

  const acertos = contarAcertos(objetivas, respostas)
  const notaDiscursivas = corrigidas.length
    ? corrigidas.reduce((soma, { nota }) => soma + nota, 0)
    : null
  const notaMaximaDiscursivas = corrigidas.length
    ? corrigidas.reduce((soma, { notaMaxima }) => soma + notaMaxima, 0)
    : null

  const pontosDiscursivas = corrigidas.reduce(
    (soma, { nota, notaMaxima }) => soma + nota / notaMaxima,
    0
  )
  const totalPontos = objetivas.length + corrigidas.length
  const notaFinal = totalPontos
    ? Math.round(((acertos + pontosDiscursivas) / totalPontos) * 100) / 10
    : 0

  return {
    acertos,
    totalObjetivas: objetivas.length,
    notaDiscursivas,
    notaMaximaDiscursivas,
    notaFinal,
    porTopico: calcularDesempenhoPorTopico(questoes, respostas, correcoes),
    correcoesDiscursivas: correcoes
  }
}
