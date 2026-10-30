import { handler, ok, requireUser } from '@/lib/api/http'
import {
  excluirAtividade,
  obterAtividade
} from '@/lib/api/ambienteEstudo/atividades'
import { lerId } from '@/lib/api/ambienteEstudo/schemas'

type Rota = { params: Promise<{ id: string }> }

export const GET = handler(async (_: Request, { params }: Rota) =>
  ok(await obterAtividade(await requireUser(), await lerId(params, 'id')))
)

export const DELETE = handler(async (_: Request, { params }: Rota) => {
  await excluirAtividade(await requireUser(), await lerId(params, 'id'))
  return new Response(null, { status: 204 })
})
