'use client'

import { useQuery } from '@tanstack/react-query'
import { getProgresso } from '@/services/progresso/getProgresso'
import { QUERY_KEYS } from '../queryKeys'

export function useProgresso() {
  return useQuery({ queryKey: QUERY_KEYS.PROGRESSO, queryFn: getProgresso })
}
