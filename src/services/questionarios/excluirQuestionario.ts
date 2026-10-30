import api from '../api'

export async function excluirQuestionario(questionarioId: number) {
  await api.delete(`/questionarios/${questionarioId}`)
}
