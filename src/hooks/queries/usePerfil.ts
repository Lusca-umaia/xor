'use client'

import { useQuery } from '@tanstack/react-query'
import { getPerfil } from '@/services/perfil/getPerfil'
import { QUERY_KEYS } from '../queryKeys'

export function usePerfil() {
  return useQuery({ queryKey: QUERY_KEYS.PERFIL, queryFn: getPerfil })
}
