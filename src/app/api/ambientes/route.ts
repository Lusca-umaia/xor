import { handler, ok, parseBody, requireUser } from '@/lib/api/http'
import {
  criarAmbiente,
  listarAmbientes
} from '@/lib/api/ambienteEstudo/ambientes'
import { dadosAmbienteSchema } from '@/lib/api/ambienteEstudo/schemas'

// Na primeira chamada, cria um ambiente por disciplina em andamento.
export const GET = handler(async () =>
  ok(await listarAmbientes(await requireUser()))
)

export const POST = handler(async (request: Request) => {
  const dados = await parseBody(request, dadosAmbienteSchema)
  return ok(await criarAmbiente(await requireUser(), dados), 201)
})
