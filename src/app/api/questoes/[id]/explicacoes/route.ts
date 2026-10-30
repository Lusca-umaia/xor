import { handler, ok, requireUser } from '@/lib/api/http'
import { explicarDeOutroJeito } from '@/lib/api/ambienteEstudo/atividades'
import { lerId } from '@/lib/api/ambienteEstudo/schemas'

type Rota = { params: Promise<{ id: string }> }

export const POST = handler(async (_: Request, { params }: Rota) => {
  const id = await lerId(params, 'id')
  return ok({ explicacao: await explicarDeOutroJeito(await requireUser(), id) })
})
