import type { CadastroInput } from '@/lib/api/schemas'
import api from '../api'

export interface RegisterResponse {
  precisaConfirmarEmail: boolean
}

export async function register(payload: CadastroInput) {
  const response = await api.post<RegisterResponse>('/auth/register', payload)
  return response.data
}
