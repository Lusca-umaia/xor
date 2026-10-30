'use client'

import { useQuery } from '@tanstack/react-query'
import { getSessoesFoco } from '@/services/pomodoro/getSessoesFoco'
import { QUERY_KEYS } from '../queryKeys'

export function useSessoesFoco() {
  return useQuery({
    queryKey: QUERY_KEYS.SESSOES_FOCO,
    queryFn: getSessoesFoco
  })
}
