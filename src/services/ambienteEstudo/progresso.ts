import { ProgressoXp } from '@/@types/AmbienteEstudo'
import api from '../api'
import { dados } from './erros'

/** XP do ambiente e os eventos recentes, para nível e sequência de estudo. */
export const obterProgressoXp = (ambienteId: string) =>
  dados(api.get<ProgressoXp>(`/ambientes/${ambienteId}/progresso`))

/** Dias (YYYY-MM-DD) com estudo em qualquer ambiente, nos últimos 90 dias. */
export const listarDiasDeEstudo = () =>
  dados(api.get<string[]>('/ambientes/dias'))
