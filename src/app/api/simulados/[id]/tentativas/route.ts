import { handler, ok, requireUser } from '@/lib/api/http'
import { iniciarTentativa } from '@/lib/api/ambienteEstudo/simulados'
import { lerId } from '@/lib/api/ambienteEstudo/schemas'

type Rota = { params: Promise<{ id: string }> }

// Devolve a tentativa em andamento ou cria outra. O prazo é definido aqui.
export const POST = handler(async (_: Request, { params }: Rota) =>
  ok(
    await iniciarTentativa(await requireUser(), await lerId(params, 'id')),
    201
  )
)
