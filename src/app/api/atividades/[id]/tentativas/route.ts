import { handler, ok, requireUser } from '@/lib/api/http'
import {
  iniciarTentativa,
  listarTentativas
} from '@/lib/api/ambienteEstudo/atividades'
import { lerId } from '@/lib/api/ambienteEstudo/schemas'

type Rota = { params: Promise<{ id: string }> }

export const GET = handler(async (_: Request, { params }: Rota) =>
  ok(await listarTentativas(await requireUser(), await lerId(params, 'id')))
)

// Começa uma tentativa nova; a que estava em andamento é descartada.
export const POST = handler(async (_: Request, { params }: Rota) =>
  ok(
    await iniciarTentativa(await requireUser(), await lerId(params, 'id')),
    201
  )
)
