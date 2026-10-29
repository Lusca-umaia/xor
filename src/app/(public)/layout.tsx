import { RegisterProvider } from '@/context/RegisterContext'
import { Suspense } from 'react'

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <RegisterProvider>
      <Suspense>{children}</Suspense>
    </RegisterProvider>
  )
}
