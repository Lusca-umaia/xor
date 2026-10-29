export interface Disciplina {
  id: number
  codigo: string
  nome: string
  cargaHoraria: number
  carater: 'OBRIGATORIA' | 'OPTATIVA'
  semestre: number
}

export interface Grade {
  id: number
  codigo: number
  cargaObrigatoria: number
  cargaOptativa: number
  disciplinas: Disciplina[]
}
