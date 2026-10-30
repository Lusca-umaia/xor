import { handler, ok, requireUser } from '@/lib/api/http'
import { statusIa } from '@/lib/api/ambienteEstudo/ia/status'

// Se a IA local responde e tem os modelos (aviso no Ambiente de Estudo).
export const GET = handler(async () => {
  await requireUser()
  return ok(await statusIa())
})
