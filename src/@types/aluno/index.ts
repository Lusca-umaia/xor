export type Carater = 'OBRIGATORIA' | 'OPTATIVA'

export type ResultadoCursada = 'APROVADA' | 'REPROVADA' | 'TRANCADA'

// Disciplina informada à mão no cadastro. Sem cursadas e sem andamento,
// conta como pendente.
export interface DisciplinaManual {
  codigo: string
  nome: string
  cargaHoraria: number
  carater: Carater
  emAndamento: boolean
}

export interface CursadaManual {
  codigo: string
  status: ResultadoCursada
  nota: number | null
}

// Semestre já cursado, montado à mão pelo aluno.
export interface SemestreManual {
  id: string
  // Ex.: 2024.1. Opcional: sem ele, vale a ordem dos semestres.
  periodo: string
  cursadas: CursadaManual[]
}

export interface CadastroAluno {
  nome: string
  email: string
  senha: string
  cursoNome: string
  cursoCodigo: string | null
  semestreAtual: number | null
  matricula: string
  cargaOptativaExigida: number | null
  disciplinasManuais: DisciplinaManual[]
  semestresManuais: SemestreManual[]
}
