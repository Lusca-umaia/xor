import { QuestaoGerada } from '@/@types/Questionario'
import type { GerarQuestoesInput } from '@/lib/api/schemas'
import api from '../api'

// A IA local pode demorar bastante para responder.
export async function gerarQuestoes(payload: GerarQuestoesInput) {
  const response = await api.post<{ questoes: QuestaoGerada[] }>(
    '/questionarios/gerar',
    payload,
    { timeout: 200_000 }
  )
  return response.data.questoes
}
