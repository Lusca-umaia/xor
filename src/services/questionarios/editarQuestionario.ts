import type { QuestionarioInput } from '@/lib/api/schemas'
import api from '../api'

export interface EditarQuestionarioPayload {
  questionarioId: number
  dados: QuestionarioInput
}

export async function editarQuestionario({
  questionarioId,
  dados
}: EditarQuestionarioPayload) {
  const response = await api.patch<{ id: number }>(
    `/questionarios/${questionarioId}`,
    dados
  )
  return response.data
}
