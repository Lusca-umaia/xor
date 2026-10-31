// Contrato do Ambiente de Estudo com o back (rotas em src/app/api/ambientes).
import {
  AmbienteEstudo,
  AmbienteListagem,
  DadosAmbiente,
  ResumoCadeira
} from '@/@types/AmbienteEstudo'
import api from '../api'
import { dados } from './erros'

/** Na primeira chamada, o servidor cria um ambiente por cadeira em andamento. */
export const listarAmbientes = () =>
  dados(api.get<AmbienteListagem[]>('/ambientes'))

/** Resumo dos ambientes de cadeira, para os cards da tela inicial. */
export const listarResumoCadeiras = () =>
  dados(api.get<ResumoCadeira[]>('/ambientes/resumo'))

export const obterAmbiente = (id: string) =>
  dados(api.get<AmbienteEstudo>(`/ambientes/${id}`))

export const criarAmbiente = (novo: DadosAmbiente) =>
  dados(api.post<AmbienteEstudo>('/ambientes', novo))

export const atualizarAmbiente = (
  id: string,
  campos: Partial<DadosAmbiente> & { arquivado?: boolean }
) => dados(api.patch<AmbienteEstudo>(`/ambientes/${id}`, campos))

/** Exclui o ambiente e todo o seu conteúdo. */
export const excluirAmbiente = async (id: string) => {
  await dados(api.delete(`/ambientes/${id}`))
}
