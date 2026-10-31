import { ConfigResumo, Resumo } from '@/@types/AmbienteEstudo'
import api from '../api'
import { dados } from './erros'

export const listarResumos = (ambienteId: string) =>
  dados(api.get<Resumo[]>(`/ambientes/${ambienteId}/resumos`))

export const obterResumo = (id: string) =>
  dados(api.get<Resumo>(`/resumos/${id}`))

/** Cria o resumo como GERANDO; o conteúdo chega quando a IA terminar. */
export const gerarResumo = (ambienteId: string, config: ConfigResumo) =>
  dados(api.post<Resumo>(`/ambientes/${ambienteId}/resumos`, config))

export const atualizarResumo = (
  id: string,
  campos: { titulo?: string; conteudo?: string }
) => dados(api.patch<Resumo>(`/resumos/${id}`, campos))

export const excluirResumo = async (id: string) => {
  await dados(api.delete(`/resumos/${id}`))
}
