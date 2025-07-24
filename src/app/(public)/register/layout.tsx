import { RegisterProvider } from '@/context/RegisterContext'

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return <RegisterProvider>{children}</RegisterProvider>
}
