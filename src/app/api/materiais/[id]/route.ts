import { handler, ok, parseBody, requireUser } from '@/lib/api/http'
import {
  excluirMaterial,
  renomearMaterial
} from '@/lib/api/ambienteEstudo/materiais'
import { lerId, renomearSchema } from '@/lib/api/ambienteEstudo/schemas'

type Rota = { params: Promise<{ id: string }> }

export const PATCH = handler(async (request: Request, { params }: Rota) => {
  const id = await lerId(params, 'id')
  const { nome } = await parseBody(request, renomearSchema)
  return ok(await renomearMaterial(await requireUser(), id, nome))
})

export const DELETE = handler(async (_: Request, { params }: Rota) => {
  await excluirMaterial(await requireUser(), await lerId(params, 'id'))
  return new Response(null, { status: 204 })
})
