// Reprovada/trancada sem aprovação posterior conta como PENDENTE.
export type StatusDisciplinaAluno = 'PENDENTE' | 'ANDAMENTO' | 'CONCLUIDA'

export type StatusTentativa =
  | 'ANDAMENTO'
  | 'APROVADA'
  | 'REPROVADA'
  | 'TRANCADA'

export interface Tentativa {
  id: number
  status: StatusTentativa
  nota: number | null
  periodo: string | null
  semestre: number | null
}

export interface DisciplinaProgresso {
  id: number
  codigo: string
  nome: string
  cargaHoraria: number
  carater: 'OBRIGATORIA' | 'OPTATIVA'
  semestre: number | null
  status: StatusDisciplinaAluno
  nota: number | null
  // Período (ex.: 2024.1) ou semestre do aluno da tentativa que define o status.
  periodo: string | null
  reprovacoes: number
  trancamentos: number
  tentativas: Tentativa[]
}

export interface ResumoProgresso {
  obrigatoriasTotal: number
  obrigatoriasConcluidas: number
  optativasConcluidas: number
  cargaObrigatoriaTotal: number
  cargaObrigatoriaConcluida: number
  cargaOptativaExigida: number | null
  cargaOptativaConcluida: number
  cargaTotal: number
  percentualGeral: number
  emAndamento: number
}

export interface Me {
  id: string
  email: string
  nome: string
  matricula: string | null
  semestreAtual: number
  curso: {
    nome: string
    codigo: string | null
  }
}

export interface Progresso {
  aluno: Me
  disciplinas: DisciplinaProgresso[]
  resumo: ResumoProgresso
}
