'use client'

import {
  QueryClient,
  QueryClientProvider,
  HydrationBoundary
} from '@tanstack/react-query'
import { ReactNode, useState } from 'react'

interface Props {
  children: ReactNode
}

export default function ReactQueryProvider({ children }: Props) {
  const [queryClient] = useState(() => new QueryClient())

  return (
    <QueryClientProvider client={queryClient}>
      <HydrationBoundary state={null}>{children}</HydrationBoundary>
    </QueryClientProvider>
  )
}
