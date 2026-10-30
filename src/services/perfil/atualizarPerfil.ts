import { Perfil } from '@/@types/Perfil'
import type { PerfilInput } from '@/lib/api/schemas'
import api from '../api'

// Devolve o perfil já atualizado.
export async function atualizarPerfil(payload: PerfilInput) {
  const response = await api.patch<Perfil>('/perfil', payload)
  return response.data
}
