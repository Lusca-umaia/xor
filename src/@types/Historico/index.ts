export type StatusCadeira = 'CONCLUIDA' | 'ANDAMENTO' | 'PENDENTE' | 'REPROVADA'

export interface CadeiraHistorico {
  id: number
  codigo: string
  nome: string
  cargaHoraria: number
  carater: 'OBRIGATORIA' | 'OPTATIVA'
  status: StatusCadeira
  nota: number | null
  frequencia: number | null
  periodo: string | null
  situacao: string | null
  docente: string | null
  tipoComponente: string | null
  origem: 'historico' | 'grade'
}
