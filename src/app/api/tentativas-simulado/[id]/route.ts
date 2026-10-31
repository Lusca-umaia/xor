import { handler, ok, parseBody, requireUser } from '@/lib/api/http'
import { lerId, salvarRespostasSchema } from '@/lib/api/ambienteEstudo/schemas'
import {
  obterTentativa,
  salvarRespostas
} from '@/lib/api/ambienteEstudo/simulados'

type Rota = { params: Promise<{ id: string }> }

// Tentativa com prazo vencido é entregue automaticamente ao ser aberta.
export const GET = handler(async (_: Request, { params }: Rota) =>
  ok(await obterTentativa(await requireUser(), await lerId(params, 'id')))
)

// 409 depois da entrega ou do prazo (com tolerância de 3 s).
export const PATCH = handler(async (request: Request, { params }: Rota) => {
  const id = await lerId(params, 'id')
  const parcial = await parseBody(request, salvarRespostasSchema)
  return ok(await salvarRespostas(await requireUser(), id, parcial))
})
