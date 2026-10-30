import { ApiError, handler, ok, parseBody, requireUser } from '@/lib/api/http'
import { confirmarSenhaAtual } from '@/lib/api/perfil'
import { alterarSenhaSchema } from '@/lib/api/schemas'

export const PUT = handler(async (request: Request) => {
  const { senhaAtual, novaSenha } = await parseBody(request, alterarSenhaSchema)
  const { supabase, user } = await requireUser()

  if (senhaAtual === novaSenha) {
    throw new ApiError(422, 'A nova senha deve ser diferente da atual')
  }

  await confirmarSenhaAtual(supabase, user, senhaAtual)

  const { error } = await supabase.auth.updateUser({ password: novaSenha })

  if (error) {
    if (error.code === 'same_password') {
      throw new ApiError(422, 'A nova senha deve ser diferente da atual')
    }
    if (error.code === 'weak_password') {
      throw new ApiError(422, 'Senha muito fraca')
    }
    console.error(error)
    throw new ApiError(400, 'Não foi possível alterar a senha')
  }

  return ok({ success: true })
})
