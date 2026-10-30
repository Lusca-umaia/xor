import { Questionario } from '@/@types/Questionario'
import api from '../api'

export async function getQuestionario(questionarioId: number) {
  const response = await api.get<Questionario>(
    `/questionarios/${questionarioId}`
  )
  return response.data
}
