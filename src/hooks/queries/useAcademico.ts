'use client'

import { useQuery } from '@tanstack/react-query'
import { getAcademico } from '@/services/academico/getAcademico'
import { QUERY_KEYS } from '../queryKeys'

export function useAcademico() {
  return useQuery({
    queryKey: QUERY_KEYS.ACADEMICO,
    queryFn: getAcademico,
    staleTime: Infinity
  })
}
