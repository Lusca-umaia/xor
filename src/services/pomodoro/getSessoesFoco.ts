import type { SessaoFoco } from '@/@types/Pomodoro'
import api from '../api'

export async function getSessoesFoco() {
  const response = await api.get<SessaoFoco[]>('/pomodoro/sessoes')
  return response.data
}
