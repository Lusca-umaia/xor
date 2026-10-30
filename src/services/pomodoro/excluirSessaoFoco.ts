import api from '../api'

export async function excluirSessaoFoco(sessaoId: number) {
  await api.delete(`/pomodoro/sessoes/${sessaoId}`)
}
