'use client'

import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
  HydrationBoundary
} from '@tanstack/react-query'
import { ReactNode, useState } from 'react'
import { getErrorStatus } from '@/services/api'

interface Props {
  children: ReactNode
}

declare module '@tanstack/react-query' {
  interface Register {
    mutationMeta: {
      // Para chamadas em que 401 não significa sessão expirada (ex.: login).
      ignorarNaoAutenticado?: boolean
    }
  }
}

// Sessão expirada: volta para o login.
function redirecionarSeNaoAutenticado(error: unknown) {
  if (getErrorStatus(error) === 401 && typeof window !== 'undefined') {
    window.location.assign('/login')
  }
}

function criarQueryClient() {
  return new QueryClient({
    queryCache: new QueryCache({ onError: redirecionarSeNaoAutenticado }),
    mutationCache: new MutationCache({
      onError: (error, _variables, _context, mutation) => {
        if (!mutation.meta?.ignorarNaoAutenticado) {
          redirecionarSeNaoAutenticado(error)
        }
      }
    }),
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        refetchOnWindowFocus: false,
        // Erros 4xx não melhoram com nova tentativa.
        retry: (falhas, error) => {
          const status = getErrorStatus(error)
          if (status && status >= 400 && status < 500) return false
          return falhas < 2
        }
      }
    }
  })
}

export default function ReactQueryProvider({ children }: Props) {
  const [queryClient] = useState(criarQueryClient)

  return (
    <QueryClientProvider client={queryClient}>
      <HydrationBoundary state={null}>{children}</HydrationBoundary>
    </QueryClientProvider>
  )
}
