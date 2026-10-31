import { handler, ok, requireUser } from '@/lib/api/http'
import { listarDiasDeEstudo } from '@/lib/api/ambienteEstudo/xp'

// Dias com estudo nos ambientes (últimos 90), para a sequência da tela inicial.
export const GET = handler(async () =>
  ok(await listarDiasDeEstudo(await requireUser()))
)
