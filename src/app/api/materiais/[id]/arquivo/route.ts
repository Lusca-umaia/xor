import { handler, requireUser } from '@/lib/api/http'
import { urlDoArquivo } from '@/lib/api/ambienteEstudo/materiais'
import { lerId } from '@/lib/api/ambienteEstudo/schemas'

type Rota = { params: Promise<{ id: string }> }

// Redireciona para uma URL assinada e temporária do Storage.
export const GET = handler(async (_: Request, { params }: Rota) => {
  const url = await urlDoArquivo(await requireUser(), await lerId(params, 'id'))
  return Response.redirect(url, 302)
})
