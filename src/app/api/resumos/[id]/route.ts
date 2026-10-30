import { handler, ok, parseBody, requireUser } from '@/lib/api/http'
import {
  atualizarResumo,
  excluirResumo,
  obterResumo
} from '@/lib/api/ambienteEstudo/resumos'
import { atualizarResumoSchema, lerId } from '@/lib/api/ambienteEstudo/schemas'

type Rota = { params: Promise<{ id: string }> }

export const GET = handler(async (_: Request, { params }: Rota) =>
  ok(await obterResumo(await requireUser(), await lerId(params, 'id')))
)

export const PATCH = handler(async (request: Request, { params }: Rota) => {
  const id = await lerId(params, 'id')
  const dados = await parseBody(request, atualizarResumoSchema)
  return ok(await atualizarResumo(await requireUser(), id, dados))
})

export const DELETE = handler(async (_: Request, { params }: Rota) => {
  await excluirResumo(await requireUser(), await lerId(params, 'id'))
  return new Response(null, { status: 204 })
})
