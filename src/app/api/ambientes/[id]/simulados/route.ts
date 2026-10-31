import { handler, ok, parseBody, requireUser } from '@/lib/api/http'
import {
  gerarSimulado,
  listarSimulados
} from '@/lib/api/ambienteEstudo/simulados'
import { lerId, simuladoSchema } from '@/lib/api/ambienteEstudo/schemas'

type Rota = { params: Promise<{ id: string }> }

export const GET = handler(async (_: Request, { params }: Rota) =>
  ok(await listarSimulados(await requireUser(), await lerId(params, 'id')))
)

// Cria como GERANDO e gera com a IA depois da resposta.
export const POST = handler(async (request: Request, { params }: Rota) => {
  const id = await lerId(params, 'id')
  const dados = await parseBody(request, simuladoSchema)
  return ok(await gerarSimulado(await requireUser(), id, dados), 201)
})
