import { handler, ok, requireUser } from '@/lib/api/http'
import { buscarProgresso } from '@/lib/api/progresso'

export const GET = handler(async () => {
  const { supabase, user } = await requireUser()
  return ok(await buscarProgresso(supabase, user))
})
