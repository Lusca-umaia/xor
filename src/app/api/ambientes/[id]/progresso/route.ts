import { handler, ok, requireUser } from '@/lib/api/http'
import { lerId } from '@/lib/api/ambienteEstudo/schemas'
import { obterProgressoXp } from '@/lib/api/ambienteEstudo/xp'

type Rota = { params: Promise<{ id: string }> }

// XP do ambiente e os eventos dos últimos 60 dias (sequência de estudo).
export const GET = handler(async (_: Request, { params }: Rota) =>
  ok(await obterProgressoXp(await requireUser(), await lerId(params, 'id')))
)
