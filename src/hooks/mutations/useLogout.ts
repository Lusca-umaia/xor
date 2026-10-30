'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { logout } from '@/services/auth/logout'
import { esquecerAlunoAtual } from '@/services/ambienteEstudo/cadeiras'

export function useLogout() {
  const router = useRouter()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: logout,
    meta: { ignorarNaoAutenticado: true },
    // Mesmo se a chamada falhar, limpa o estado local e volta ao login.
    onSettled: () => {
      queryClient.clear()
      esquecerAlunoAtual()
      router.replace('/login')
      router.refresh()
    }
  })
}
