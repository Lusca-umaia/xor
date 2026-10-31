import { handler, ok, requireUser } from '@/lib/api/http'
import { listarResumoCadeiras } from '@/lib/api/ambienteEstudo/resumoCadeiras'

// Resumo dos ambientes de cadeira (nível, revisões, o que retomar) para a
// tela inicial.
export const GET = handler(async () =>
  ok(await listarResumoCadeiras(await requireUser()))
)
