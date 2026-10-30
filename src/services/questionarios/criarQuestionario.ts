import type { QuestionarioInput } from '@/lib/api/schemas'
import api from '../api'

export async function criarQuestionario(payload: QuestionarioInput) {
  const response = await api.post<{ id: number }>('/questionarios', payload)
  return response.data
}
