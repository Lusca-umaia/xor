import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { ImageResponse } from 'next/og'

// Imagem de prévia ao compartilhar o link (WhatsApp, LinkedIn, X...).
export const alt = 'XOR — Progressão de curso na UFC'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  const logo = await readFile(join(process.cwd(), 'public/logo.png'))
  const logoSrc = `data:image/png;base64,${logo.toString('base64')}`

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          width: '100%',
          height: '100%',
          padding: '72px 80px',
          background: '#ffffff',
          borderBottom: '24px solid #c6de34'
        }}
      >
        <img src={logoSrc} alt="" width={416} height={195} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div
            style={{
              fontSize: 64,
              fontWeight: 700,
              lineHeight: 1.1,
              color: '#1d3446'
            }}
          >
            Sua graduação na UFC, do histórico ao diploma
          </div>
          <div style={{ fontSize: 32, color: '#5e6e7c' }}>
            Progressão de curso, Pomodoro e questionários com IA
          </div>
        </div>
      </div>
    ),
    size
  )
}
