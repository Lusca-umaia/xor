import React from 'react'
import Navbar from '@/components/Navbar/Navbar'

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
