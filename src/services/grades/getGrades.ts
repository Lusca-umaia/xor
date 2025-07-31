import { Grade } from '@/@types/Grade'
import api from '../api'

export async function getGrades() {
  const response = await api.get(`/grade/`)
  return response.data as Grade[]
}

export async function getGrade(id: number) {
  const response = await api.get(`/grade/${id}`)
  return response.data as Grade
}
