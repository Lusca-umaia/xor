'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { encerrarSemestre } from '@/services/progresso/encerrarSemestre'
import { QUERY_KEYS } from '../queryKeys'

export function useEncerrarSemestre() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: encerrarSemestre,
    onSuccess: (progresso) => {
      queryClient.setQueryData(QUERY_KEYS.PROGRESSO, progresso)
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ME })
    }
  })
}
