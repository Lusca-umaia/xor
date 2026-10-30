import { Progresso } from '@/@types/Progresso'
import api from '../api'

export async function getProgresso() {
  const response = await api.get<Progresso>('/progresso')
  return response.data
}
