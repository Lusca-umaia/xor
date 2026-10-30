'use client'

import { useEffect, useId, useState } from 'react'
import { LuLoader, LuTriangleAlert } from 'react-icons/lu'

type Estado =
  | { tipo: 'carregando' }
  | { tipo: 'pronto'; svg: string }
  | { tipo: 'erro'; mensagem: string }

/** Renderiza código Mermaid. A biblioteca só é baixada quando um mapa aparece. */
export default function MapaMental({ codigo }: { codigo: string }) {
  const idBase = useId().replace(/[^a-zA-Z0-9]/g, '')
  const [estado, setEstado] = useState<Estado>({ tipo: 'carregando' })

  useEffect(() => {
    let cancelado = false
    setEstado({ tipo: 'carregando' })

    import('mermaid')
      .then(async ({ default: mermaid }) => {
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: 'strict',
          theme: 'neutral',
          fontFamily: 'inherit'
        })
        const { svg } = await mermaid.render(
          `mapa-${idBase}-${Date.now()}`,
          codigo
        )
        if (!cancelado) setEstado({ tipo: 'pronto', svg })
      })
      .catch((erro: unknown) => {
        if (!cancelado) {
          setEstado({
            tipo: 'erro',
            mensagem:
              erro instanceof Error ? erro.message : 'Código do mapa inválido.'
          })
        }
      })

    return () => {
      cancelado = true
    }
  }, [codigo, idBase])

  if (estado.tipo === 'carregando') {
    return (
      <div
        className="flex items-center gap-2 py-10 text-sm text-gray-500"
        role="status"
      >
        <LuLoader className="animate-spin" aria-hidden /> Desenhando o mapa
        mental...
      </div>
    )
  }

  if (estado.tipo === 'erro') {
    return (
      <div className="space-y-2">
        <p className="flex items-center gap-2 text-sm text-amber-800">
          <LuTriangleAlert aria-hidden /> Não foi possível desenhar o mapa.
          Confira o código abaixo.
        </p>
        <pre className="overflow-x-auto rounded-xl bg-gray-50 p-4 text-xs">
          {codigo}
        </pre>
      </div>
    )
  }

  return (
    <div
      className="overflow-x-auto [&_svg]:mx-auto [&_svg]:h-auto [&_svg]:max-w-full"
      role="img"
      aria-label="Mapa mental do conteúdo"
      // SVG gerado pelo Mermaid com securityLevel 'strict' (sem scripts nem HTML do usuário).
      dangerouslySetInnerHTML={{ __html: estado.svg }}
    />
  )
}
