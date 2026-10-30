import { handler, ok, parseBody, requireUser } from '@/lib/api/http'
import { avaliarFlashcard } from '@/lib/api/ambienteEstudo/atividades'
import {
  avaliacaoFlashcardSchema,
  lerId
} from '@/lib/api/ambienteEstudo/schemas'

type Rota = { params: Promise<{ id: string; cid: string }> }

// Aplica a avaliação do aluno ao agendamento de revisão espaçada (SM-2).
export const POST = handler(async (request: Request, { params }: Rota) => {
  const id = await lerId(params, 'id')
  const cid = await lerId(params, 'cid')
  const { avaliacao } = await parseBody(request, avaliacaoFlashcardSchema)
  return ok(await avaliarFlashcard(await requireUser(), id, cid, avaliacao))
})
