'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { alterarEmail } from '@/services/perfil/alterarEmail'
import { alterarSenha } from '@/services/perfil/alterarSenha'
import { atualizarPerfil } from '@/services/perfil/atualizarPerfil'
import { QUERY_KEYS } from '../queryKeys'

export function useAtualizarPerfil() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: atualizarPerfil,
    onSuccess: (perfil) => {
      queryClient.setQueryData(QUERY_KEYS.PERFIL, perfil)
      // Nome, curso e semestre aparecem na navbar e no progresso.
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ME })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PROGRESSO })
    }
  })
}

export function useAlterarEmail() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: alterarEmail,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PERFIL })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ME })
    }
  })
}

export function useAlterarSenha() {
  return useMutation({ mutationFn: alterarSenha })
}
