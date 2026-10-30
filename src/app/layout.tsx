import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import ReactQueryProvider from '@/context/ReactQueryProvider/ReactQueryProvider'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin']
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin']
})

const descricao =
  'Acompanhe sua graduação na UFC: importe o histórico do SIGAA, veja o que falta cursar, estude com Pomodoro e revise com questionários gerados por IA.'

export const metadata: Metadata = {
  // URL pública, usada para montar os links absolutos do Open Graph.
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
  ),
  title: {
    default: 'XOR — Progressão de curso na UFC',
    template: '%s | XOR'
  },
  description: descricao,
  applicationName: 'XOR',
  keywords: [
    'UFC',
    'SIGAA',
    'progressão de curso',
    'grade curricular',
    'histórico acadêmico',
    'Pomodoro',
    'questionários',
    'estudos'
  ],
  authors: [{ name: 'Lucas Maia' }],
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    siteName: 'XOR',
    title: 'XOR — Progressão de curso na UFC',
    description: descricao
  },
  twitter: {
    card: 'summary_large_image',
    title: 'XOR — Progressão de curso na UFC',
    description: descricao
  }
}

export const viewport: Viewport = {
  themeColor: '#1d3446'
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-gray-50 antialiased`}
      >
        <ReactQueryProvider>{children}</ReactQueryProvider>
      </body>
    </html>
  )
}
