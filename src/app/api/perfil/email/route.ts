import { ApiError, handler, ok, parseBody, requireUser } from '@/lib/api/http'
import { confirmarSenhaAtual } from '@/lib/api/perfil'
import { alterarEmailSchema } from '@/lib/api/schemas'
import { createAdminClient } from '@/lib/supabase/admin'

// Troca o email na hora, sem link de confirmação: o Supabase recusaria
// enviar o link para domínios que não aceita (inclusive o email antigo).
// A proteção é a senha atual, conferida antes da troca.
export const PUT = handler(async (request: Request) => {
  const { email, senhaAtual } = await parseBody(request, alterarEmailSchema)
  const { supabase, user } = await requireUser()

  if (email === user.email) {
    throw new ApiError(422, 'Este já é o seu email atual')
  }

  await confirmarSenhaAtual(supabase, user, senhaAtual)

  const { error } = await createAdminClient().auth.admin.updateUserById(
    user.id,
    { email, email_confirm: true }
  )

  if (error) {
    if (error.code === 'email_exists') {
      throw new ApiError(409, 'Já existe uma conta com este email')
    }
    console.error(error)
    throw new ApiError(400, 'Não foi possível alterar o email')
  }

  return ok({ emailPendente: null })
})
