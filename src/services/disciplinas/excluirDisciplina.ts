import api from '../api'

export async function excluirDisciplina(disciplinaId: number) {
  await api.delete(`/progresso/disciplinas/${disciplinaId}`)
}
