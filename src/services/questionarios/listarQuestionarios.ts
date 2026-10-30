import { QuestionarioResumo } from '@/@types/Questionario'
import api from '../api'

export async function listarQuestionarios() {
  const response = await api.get<QuestionarioResumo[]>('/questionarios')
  return response.data
}
