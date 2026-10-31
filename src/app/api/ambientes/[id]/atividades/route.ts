import { handler, ok, parseBody, requireUser } from '@/lib/api/http'
import {
  gerarAtividade,
  listarAtividades
} from '@/lib/api/ambienteEstudo/atividades'
import { lerId, configAtividadeSchema } from '@/lib/api/ambienteEstudo/schemas'

type Rota = { params: Promise<{ id: string }> }

export const GET = handler(async (_: Request, { params }: Rota) =>
  ok(await listarAtividades(await requireUser(), await lerId(params, 'id')))
)

// Cria como GERANDO e gera com a IA depois da resposta.
export const POST = handler(async (request: Request, { params }: Rota) => {
  const id = await lerId(params, 'id')
  const dados = await parseBody(request, configAtividadeSchema)
  return ok(await gerarAtividade(await requireUser(), id, dados), 201)
})
