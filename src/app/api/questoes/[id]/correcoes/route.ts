import { handler, ok, parseBody, requireUser } from '@/lib/api/http'
import { corrigirDiscursiva } from '@/lib/api/ambienteEstudo/atividades'
import { lerId, textoRespostaSchema } from '@/lib/api/ambienteEstudo/schemas'

type Rota = { params: Promise<{ id: string }> }

// Correção formativa da resposta discursiva pela rubrica (síncrona).
export const POST = handler(async (request: Request, { params }: Rota) => {
  const id = await lerId(params, 'id')
  const { texto } = await parseBody(request, textoRespostaSchema)
  return ok(await corrigirDiscursiva(await requireUser(), id, texto))
})
