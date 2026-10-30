import { handler, ok, parseBody, requireUser } from '@/lib/api/http'
import { entregaSchema, lerId } from '@/lib/api/ambienteEstudo/schemas'
import { entregarTentativa } from '@/lib/api/ambienteEstudo/simulados'

type Rota = { params: Promise<{ id: string }> }

export const POST = handler(async (request: Request, { params }: Rota) => {
  const id = await lerId(params, 'id')
  const { automatica } = await parseBody(request, entregaSchema)
  return ok(await entregarTentativa(await requireUser(), id, automatica))
})
