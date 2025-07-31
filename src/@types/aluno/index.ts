export interface CadastroAluno {
  nome: string
  email: string
  senha: string
  cursoId: number | null
  gradeId: number | null
  semestreAtual: number | null
  matricula: string
  cadeirasRealizadas: {
    id: number
    nota: number | null
  }[]
  cadeirasAtivas: number[]
}
