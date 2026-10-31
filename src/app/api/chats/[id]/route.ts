import { handler, ok, parseBody, requireUser } from '@/lib/api/http'
import {
  atualizarChat,
  excluirChat,
  obterChat
} from '@/lib/api/ambienteEstudo/chats'
import { atualizarChatSchema, lerId } from '@/lib/api/ambienteEstudo/schemas'

type Rota = { params: Promise<{ id: string }> }

export const GET = handler(async (_: Request, { params }: Rota) =>
  ok(await obterChat(await requireUser(), await lerId(params, 'id')))
)

export const PATCH = handler(async (request: Request, { params }: Rota) => {
  const id = await lerId(params, 'id')
  const dados = await parseBody(request, atualizarChatSchema)
  return ok(await atualizarChat(await requireUser(), id, dados))
})

export const DELETE = handler(async (_: Request, { params }: Rota) => {
  await excluirChat(await requireUser(), await lerId(params, 'id'))
  return new Response(null, { status: 204 })
})
