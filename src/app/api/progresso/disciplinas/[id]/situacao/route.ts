import { handler, ok, parseBody, parseId, requireUser } from '@/lib/api/http'
import { definirSituacao } from '@/lib/api/disciplinas'
import { situacaoSchema } from '@/lib/api/schemas'

// Define a situação atual da disciplina (concluir, reprovar, trancar,
// voltar para pendente...). A regra fica em definir_situacao_disciplina.
export const PUT = handler(
  async (request: Request, { params }: { params: Promise<{ id: string }> }) => {
    const id = await parseId(params)
    const situacao = await parseBody(request, situacaoSchema)
    const { supabase } = await requireUser()

    await definirSituacao(supabase, id, situacao)

    return ok({ success: true })
  }
)
