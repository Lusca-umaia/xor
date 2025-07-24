import React from 'react'
import Navbar from '@/components/Navbar/Navbar'

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="flex">
      <Navbar />
      <div className="p-8 w-full">{children}</div>
    </div>
  )
}
