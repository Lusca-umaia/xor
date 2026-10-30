import React from 'react'
import type { Metadata } from 'next'
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
      <div className="p-8 max-md:p-3 w-full max-lg:mt-[40px]">{children}</div>
    </div>
  )
}
