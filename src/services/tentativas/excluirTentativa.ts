import api from '../api'

export async function excluirTentativa(tentativaId: number) {
  await api.delete(`/progresso/tentativas/${tentativaId}`)
}
