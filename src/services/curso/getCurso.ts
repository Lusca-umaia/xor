import api from '../api'
import { Curso } from '@/@types/Curso'

export async function getCursos() {
  const response = await api.get(`/cursos`)
  return response.data as Curso[]
}

export async function getCurso(id: string) {
  const response = await api.get(`/cursos/${id}`)
  return response.data
}
