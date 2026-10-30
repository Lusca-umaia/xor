import { ApiError, handler, ok, parseId, requireUser } from '@/lib/api/http'

// Remove uma sessão de foco do histórico (ex.: registrada por engano).
export const DELETE = handler(
  async (
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
  ) => {
    const id = await parseId(params)
    const { supabase, user } = await requireUser()

    const { data, error } = await supabase
      .from('sessoes_foco')
      .delete()
      .eq('id', id)
      .eq('aluno_id', user.id)
      .select('id')

    if (error) throw error
    if (!data.length) throw new ApiError(404, 'Sessão não encontrada')

    return ok({ success: true })
  }
)
