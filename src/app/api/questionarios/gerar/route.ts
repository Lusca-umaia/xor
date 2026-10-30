import { handler, ok, parseBody, requireUser } from '@/lib/api/http'
import { gerarQuestoesComIa } from '@/lib/api/ia'
import { gerarQuestoesSchema } from '@/lib/api/schemas'

// Sugere questões com a IA local. Nada é salvo: o aluno revisa no
// editor e salva o questionário normalmente.
export const POST = handler(async (request: Request) => {
  const parametros = await parseBody(request, gerarQuestoesSchema)
  const { supabase, user } = await requireUser()

  let disciplinaNome: string | null = null
  if (parametros.disciplinaId) {
    const { data, error } = await supabase
      .from('disciplinas')
      .select('nome')
      .eq('id', parametros.disciplinaId)
      .eq('aluno_id', user.id)
      .maybeSingle()

    if (error) throw error
    disciplinaNome = data?.nome ?? null
  }

  const questoes = await gerarQuestoesComIa({ ...parametros, disciplinaNome })
  return ok({ questoes })
})
