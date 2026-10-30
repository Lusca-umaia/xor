import type { SessaoFoco } from '@/@types/Pomodoro'
import type { SessaoFocoInput } from '@/lib/api/schemas'
import api from '../api'

export async function registrarSessaoFoco(payload: SessaoFocoInput) {
  const response = await api.post<SessaoFoco>('/pomodoro/sessoes', payload)
  return response.data
}
