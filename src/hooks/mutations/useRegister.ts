'use client'

import { useMutation } from '@tanstack/react-query'
import { register } from '@/services/auth/register'

export function useRegister() {
  return useMutation({
    mutationFn: register,
    meta: { ignorarNaoAutenticado: true }
  })
}
