import { handler, ok, parseBody, requireUser } from '@/lib/api/http'
import { criarChat, listarChats } from '@/lib/api/ambienteEstudo/chats'
import { lerId, criarChatSchema } from '@/lib/api/ambienteEstudo/schemas'

type Rota = { params: Promise<{ id: string }> }

export const GET = handler(async (_: Request, { params }: Rota) =>
  ok(await listarChats(await requireUser(), await lerId(params, 'id')))
)

export const POST = handler(async (request: Request, { params }: Rota) => {
  const id = await lerId(params, 'id')
  const dados = await parseBody(request, criarChatSchema)
  return ok(await criarChat(await requireUser(), id, dados), 201)
})
