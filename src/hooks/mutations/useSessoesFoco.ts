'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { SessaoFoco } from '@/@types/Pomodoro'
import { excluirSessaoFoco } from '@/services/pomodoro/excluirSessaoFoco'
import { registrarSessaoFoco } from '@/services/pomodoro/registrarSessaoFoco'
import { QUERY_KEYS } from '../queryKeys'

// A sessão salva entra direto no cache para as estatísticas reagirem na hora.
export function useRegistrarSessaoFoco() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: registrarSessaoFoco,
    onSuccess: (sessao) => {
      queryClient.setQueryData<SessaoFoco[]>(
        QUERY_KEYS.SESSOES_FOCO,
        (sessoes) => (sessoes ? [sessao, ...sessoes] : sessoes)
      )
    },
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SESSOES_FOCO })
  })
}

export function useExcluirSessaoFoco() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: excluirSessaoFoco,
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SESSOES_FOCO })
  })
}
