import { z } from 'zod'
import { handler, ok, parseBody, requireUser } from '@/lib/api/http'
import {
  apagarDadosAluno,
  listarDadosAluno,
  validarChave
} from '@/lib/api/dadosAluno'

// Dados da vida acadêmica do aluno, todas as chaves numa resposta só.
export const GET = handler(async () => {
  const { supabase } = await requireUser()
  return ok(await listarDadosAluno(supabase))
})

const apagarSchema = z.object({ chaves: z.array(z.string()).min(1).max(20) })

// Apaga as chaves pedidas (tela de privacidade do perfil).
export const DELETE = handler(async (request: Request) => {
  const { chaves } = await parseBody(request, apagarSchema)
  const { supabase } = await requireUser()
  await apagarDadosAluno(supabase, chaves.map(validarChave))
  return ok({ chaves })
})
