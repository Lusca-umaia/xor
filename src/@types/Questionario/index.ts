export type Dificuldade = 'FACIL' | 'MEDIA' | 'DIFICIL'

export type OrigemQuestionario = 'MANUAL' | 'IA'

export interface DisciplinaVinculada {
  id: number
  codigo: string
  nome: string
}

export interface Questao {
  id: number
  enunciado: string
  alternativas: string[]
  // Índice (a partir de 0) da alternativa correta.
  correta: number
  explicacao: string | null
}

export interface Resolucao {
  id: number
  acertos: number
  emBranco: number
  total: number
  percentual: number
  duracaoSegundos: number | null
  criadoEm: string
}

export interface QuestionarioResumo {
  id: number
  titulo: string
  descricao: string | null
  dificuldade: Dificuldade | null
  origem: OrigemQuestionario
  disciplina: DisciplinaVinculada | null
  totalQuestoes: number
  totalResolucoes: number
  melhorPercentual: number | null
  ultimaResolucao: Resolucao | null
  criadoEm: string
  atualizadoEm: string
}

export interface Questionario {
  id: number
  titulo: string
  descricao: string | null
  dificuldade: Dificuldade | null
  origem: OrigemQuestionario
  disciplina: DisciplinaVinculada | null
  questoes: Questao[]
  // Resoluções mais recentes primeiro.
  historico: Resolucao[]
  criadoEm: string
  atualizadoEm: string
}

export interface RespostaCorrigida {
  questaoId: number
  alternativa: number | null
  correta: number
  acertou: boolean
}

export interface ResultadoResolucao {
  resolucao: Resolucao
  correcao: RespostaCorrigida[]
}

// Questão sugerida pela IA, ainda não salva.
export interface QuestaoGerada {
  enunciado: string
  alternativas: string[]
  correta: number
  explicacao: string | null
}
