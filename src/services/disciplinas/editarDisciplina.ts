import type { NovaDisciplinaInput } from '@/lib/api/schemas'
import api from '../api'

export interface EditarDisciplinaPayload {
  disciplinaId: number
  dados: NovaDisciplinaInput
}

export async function editarDisciplina({
  disciplinaId,
  dados
}: EditarDisciplinaPayload) {
  await api.patch(`/progresso/disciplinas/${disciplinaId}`, dados)
}
