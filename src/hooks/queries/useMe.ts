'use client'

import { useQuery } from '@tanstack/react-query'
import { getMe } from '@/services/aluno/getMe'
import { QUERY_KEYS } from '../queryKeys'

export function useMe() {
  return useQuery({ queryKey: QUERY_KEYS.ME, queryFn: getMe })
}
