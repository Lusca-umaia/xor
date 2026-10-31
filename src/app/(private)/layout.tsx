import React from 'react'
import type { Metadata } from 'next'
import { Toaster } from 'sonner'
import Navbar from '@/components/Navbar/Navbar'

// Telas logadas não devem aparecer em buscadores.
export const metadata: Metadata = {
  robots: { index: false, follow: false }
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="flex max-lg:flex-col">
      <Navbar />
      <div className="p-8 max-md:p-3 w-full min-w-0 max-lg:mt-[50px] max-lg:pb-24">
        {children}
      </div>
      <Toaster position="top-right" richColors closeButton />
    </div>
  )
}
