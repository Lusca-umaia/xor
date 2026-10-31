import { handler, ok, parseBody, requireUser } from '@/lib/api/http'
import {
  atualizarAmbiente,
  excluirAmbiente,
  obterAmbiente
} from '@/lib/api/ambienteEstudo/ambientes'
import {
  atualizarAmbienteSchema,
  lerId
} from '@/lib/api/ambienteEstudo/schemas'

type Rota = { params: Promise<{ id: string }> }

export const GET = handler(async (_: Request, { params }: Rota) =>
  ok(await obterAmbiente(await requireUser(), await lerId(params, 'id')))
)

export const PATCH = handler(async (request: Request, { params }: Rota) => {
  const id = await lerId(params, 'id')
  const dados = await parseBody(request, atualizarAmbienteSchema)
  return ok(await atualizarAmbiente(await requireUser(), id, dados))
})

// Apaga o ambiente, todo o conteúdo (cascata) e os arquivos no Storage.
export const DELETE = handler(async (_: Request, { params }: Rota) => {
  await excluirAmbiente(await requireUser(), await lerId(params, 'id'))
  return new Response(null, { status: 204 })
})
