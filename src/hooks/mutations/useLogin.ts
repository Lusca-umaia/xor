'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { login } from '@/services/auth/login'

export function useLogin() {
  const router = useRouter()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: login,
    // 401 aqui é senha errada, não sessão expirada.
    meta: { ignorarNaoAutenticado: true },
    onSuccess: () => {
      queryClient.clear()
      router.replace('/home')
      router.refresh()
    }
  })
}
