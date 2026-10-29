import { Disciplina } from '../Grade'

export interface Curso {
  id: number
  nome: string
  email: string
  unidade: string
  codigo: string
  disciplinas: Disciplina[]
}
