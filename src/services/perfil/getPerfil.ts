import { Perfil } from '@/@types/Perfil'
import api from '../api'

export async function getPerfil() {
  const response = await api.get<Perfil>('/perfil')
  return response.data
}
