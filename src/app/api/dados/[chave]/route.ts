import { z } from 'zod'
import { handler, ok, parseBody, requireUser } from '@/lib/api/http'
import { salvarDadoAluno, validarChave } from '@/lib/api/dadosAluno'

type Rota = { params: Promise<{ chave: string }> }

const corpoSchema = z.object({
  valor: z
    .unknown()
    .refine((valor) => valor !== undefined && valor !== null, 'Valor vazio')
})

// Substitui o valor de uma chave (o banco limita o tamanho).
export const PUT = handler(async (request: Request, { params }: Rota) => {
  const chave = validarChave(decodeURIComponent((await params).chave))
  const { valor } = await parseBody(request, corpoSchema)
  const { supabase, user } = await requireUser()
  await salvarDadoAluno(supabase, user, chave, valor)
  return ok({ chave })
})
