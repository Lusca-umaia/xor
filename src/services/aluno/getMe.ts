import { Me } from '@/@types/Progresso'
import api from '../api'

export async function getMe() {
  const response = await api.get<Me>('/me')
  return response.data
}
