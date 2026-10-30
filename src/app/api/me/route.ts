import { handler, ok, requireUser } from '@/lib/api/http'
import { buscarMe } from '@/lib/api/progresso'

export const GET = handler(async () => {
  const { supabase, user } = await requireUser()
  return ok(await buscarMe(supabase, user))
})
