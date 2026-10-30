import { ApiError, handler, ok, parseBody, requireUser } from '@/lib/api/http'
import { buscarPerfil } from '@/lib/api/perfil'
import { perfilSchema } from '@/lib/api/schemas'

export const GET = handler(async () => {
  const { supabase, user } = await requireUser()
  return ok(await buscarPerfil(supabase, user))
})

// Atualiza os dados gerais do aluno. O código do curso não é editável.
export const PATCH = handler(async (request: Request) => {
  const dados = await parseBody(request, perfilSchema)
  const { supabase, user } = await requireUser()

  const { data, error } = await supabase
    .from('perfis')
    .update({
      nome: dados.nome,
      matricula: dados.matricula,
      curso_nome: dados.cursoNome,
      semestre_atual: dados.semestreAtual,
      carga_optativa_exigida: dados.cargaOptativaExigida
    })
    .eq('id', user.id)
    .select('id')

  if (error) throw error
  if (!data.length) throw new ApiError(404, 'Perfil não encontrado')

  return ok(await buscarPerfil(supabase, user))
})
