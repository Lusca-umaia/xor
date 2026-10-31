import { handler, ok, parseBody, requireUser } from '@/lib/api/http'
import { reportarConteudo } from '@/lib/api/ambienteEstudo/reportes'
import { reporteSchema } from '@/lib/api/ambienteEstudo/schemas'

export const POST = handler(async (request: Request) => {
  const dados = await parseBody(request, reporteSchema)
  return ok(await reportarConteudo(await requireUser(), dados), 201)
})
