import { Questao, Resposta } from '@/@types/AmbienteEstudo'

/**
 * RESPONDENDO: o aluno pode alterar a resposta.
 * CORRIGIDA: mostra certo/errado (feedback imediato ou revisão do resultado).
 * BLOQUEADA: resposta congelada sem revelar o gabarito (ex.: tempo esgotado).
 */
export type ModoQuestao = 'RESPONDENDO' | 'CORRIGIDA' | 'BLOQUEADA'

export interface PropsQuestao<Q extends Questao = Questao> {
  questao: Q
  resposta?: Resposta
  aoResponder: (resposta: Resposta) => void
  modo: ModoQuestao
}
