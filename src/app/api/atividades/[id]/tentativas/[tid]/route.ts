import { handler, ok, parseBody, requireUser } from '@/lib/api/http'
import { salvarTentativa } from '@/lib/api/ambienteEstudo/atividades'
import {
  lerId,
  tentativaAtividadeSchema
} from '@/lib/api/ambienteEstudo/schemas'

type Rota = { params: Promise<{ id: string; tid: string }> }

// O front envia o estado inteiro da tentativa a cada passo.
export const PUT = handler(async (request: Request, { params }: Rota) => {
  const id = await lerId(params, 'id')
  const tid = await lerId(params, 'tid')
  const dados = await parseBody(request, tentativaAtividadeSchema)
  return ok(await salvarTentativa(await requireUser(), id, tid, dados))
})
