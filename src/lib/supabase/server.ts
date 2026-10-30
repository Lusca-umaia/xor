import 'server-only'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Cliente Supabase usado pelas rotas de API e server components.
// Usa a chave publicável + o cookie de sessão do usuário, então toda
// consulta passa pelas políticas de RLS do banco.
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Chamado a partir de um server component: o middleware
            // já cuida de renovar a sessão.
          }
        }
      }
    }
  )
}
