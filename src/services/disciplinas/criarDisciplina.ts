import type { CriarDisciplinaInput } from '@/lib/api/schemas'
import api from '../api'

export async function criarDisciplina(payload: CriarDisciplinaInput) {
  const response = await api.post<{ id: number }>(
    '/progresso/disciplinas',
    payload
  )
  return response.data
}
