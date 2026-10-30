import 'server-only'

import { createClient } from '@supabase/supabase-js'

// Cliente com a chave secreta: ignora RLS. Usar SOMENTE no servidor e
// apenas onde o cliente do usuário não resolve (ex.: logo após o signUp,
// ou na troca de email depois de conferir a senha atual).
// A chave nunca deve ter o prefixo NEXT_PUBLIC_.
export function createAdminClient() {
  const secretKey = process.env.SUPABASE_SECRET_KEY
  if (!secretKey) throw new Error('SUPABASE_SECRET_KEY não configurada')

  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, secretKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  })
}
