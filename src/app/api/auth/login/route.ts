import { ApiError, handler, ok, parseBody } from '@/lib/api/http'
import { loginSchema } from '@/lib/api/schemas'
import { createClient } from '@/lib/supabase/server'

export const POST = handler(async (request: Request) => {
  const { email, senha } = await parseBody(request, loginSchema)
  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password: senha
  })

  if (error) {
    if (error.code === 'email_not_confirmed') {
      throw new ApiError(403, 'Confirme seu email antes de entrar')
    }
    // Mensagem genérica para não revelar se o email existe.
    throw new ApiError(401, 'Email ou senha incorretos')
  }

  return ok({ success: true })
})
