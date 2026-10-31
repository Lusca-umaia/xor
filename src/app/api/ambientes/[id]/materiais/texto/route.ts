import { handler, ok, parseBody, requireUser } from '@/lib/api/http'
import { criarMaterialTexto } from '@/lib/api/ambienteEstudo/materiais'
import { lerId, materialTextoSchema } from '@/lib/api/ambienteEstudo/schemas'

type Rota = { params: Promise<{ id: string }> }

export const POST = handler(async (request: Request, { params }: Rota) => {
  const id = await lerId(params, 'id')
  const dados = await parseBody(request, materialTextoSchema)
  return ok(await criarMaterialTexto(await requireUser(), id, dados), 201)
})
