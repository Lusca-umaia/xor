import type { StatusTentativa } from '../Progresso'

export interface DisciplinaCurriculo {
  codigo: string
  nome: string
  cargaHoraria: number
  semestre: number
  prerequisitos: string[]
}

// Uma linha por vez cursada (mesmo formato conceitual de `tentativas`).
export interface TentativaHistorico {
  codigo: string
  periodo: string
  status: StatusTentativa
  nota: number | null
}

export type SituacaoCurricular = 'CONCLUIDA' | 'ANDAMENTO' | 'PENDENTE'

export interface Avaliacao {
  nome: string
  peso: number
  nota: number | null
}

export type RiscoDisciplina =
  | 'GARANTIDO'
  | 'BAIXO'
  | 'MEDIO'
  | 'ALTO'
  | 'CRITICO'

export interface Turma {
  id: string
  codigo: string
  // 0 = domingo ... 6 = sábado
  dias: number[]
  inicio: string
  fim: string
}

export type Prioridade = 'ALTA' | 'MEDIA' | 'BAIXA'
export type TipoAtividade = 'TRABALHO' | 'LISTA' | 'LEITURA'

export interface Atividade {
  id: string
  codigo: string
  titulo: string
  tipo: TipoAtividade
  prioridade: Prioridade
  // YYYY-MM-DD
  prazo: string
  horas: number
  feita: boolean
}

export type TipoEvento = 'PROVA' | 'REVISAO' | 'OUTRO'

export interface Evento {
  id: string
  titulo: string
  // YYYY-MM-DD
  data: string
  tipo: TipoEvento
  codigo: string | null
  // Horário opcional (HH:MM). Sem ele, o evento ocupa o dia inteiro.
  inicio?: string | null
  fim?: string | null
  // Horas de estudo/dedicação planejadas.
  horas: number
}

export interface Limites {
  horas: number
  itens: number
}
