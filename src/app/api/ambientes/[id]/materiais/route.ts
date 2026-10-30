import { handler, ok, requireUser } from '@/lib/api/http'
import { ApiError } from '@/lib/api/http'
import {
  enviarMaterial,
  listarMateriais
} from '@/lib/api/ambienteEstudo/materiais'
import { lerId } from '@/lib/api/ambienteEstudo/schemas'

type Rota = { params: Promise<{ id: string }> }

export const GET = handler(async (_: Request, { params }: Rota) =>
  ok(await listarMateriais(await requireUser(), await lerId(params, 'id')))
)

// multipart/form-data com "arquivo" e "origem" (UPLOAD | CHAT). O texto é
// extraído depois da resposta; o front acompanha o status.
export const POST = handler(async (request: Request, { params }: Rota) => {
  const id = await lerId(params, 'id')
  const ctx = await requireUser()
  const formulario = await request.formData().catch(() => null)
  const arquivo = formulario?.get('arquivo')
  if (!(arquivo instanceof File)) {
    throw new ApiError(400, 'Envie o arquivo no campo "arquivo"')
  }
  const origem = formulario?.get('origem') === 'CHAT' ? 'CHAT' : 'UPLOAD'
  return ok(await enviarMaterial(ctx, id, arquivo, origem), 201)
})
