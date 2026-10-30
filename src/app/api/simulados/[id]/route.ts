import { handler, ok, requireUser } from '@/lib/api/http'
import {
  excluirSimulado,
  obterSimulado
} from '@/lib/api/ambienteEstudo/simulados'
import { lerId } from '@/lib/api/ambienteEstudo/schemas'

type Rota = { params: Promise<{ id: string }> }

export const GET = handler(async (_: Request, { params }: Rota) =>
  ok(await obterSimulado(await requireUser(), await lerId(params, 'id')))
)

export const DELETE = handler(async (_: Request, { params }: Rota) => {
  await excluirSimulado(await requireUser(), await lerId(params, 'id'))
  return new Response(null, { status: 204 })
})
