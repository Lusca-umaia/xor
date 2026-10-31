import { useEffect, useRef } from 'react'

const digitandoEmCampo = (alvo: EventTarget | null) =>
  alvo instanceof HTMLElement &&
  (alvo.isContentEditable ||
    ['INPUT', 'TEXTAREA', 'SELECT'].includes(alvo.tagName))

/**
 * Atalhos de teclado ignorados enquanto o usuário digita em um campo.
 * As chaves do mapa são `event.key` em minúsculas (ex.: 'a', 'arrowright', ' ').
 */
export function useAtalhosTeclado(
  mapa: Record<string, () => void>,
  ativo = true
) {
  const mapaAtual = useRef(mapa)
  mapaAtual.current = mapa

  useEffect(() => {
    if (!ativo) return

    const aoPressionar = (evento: KeyboardEvent) => {
      if (evento.ctrlKey || evento.metaKey || evento.altKey) return
      if (digitandoEmCampo(evento.target)) return

      const acao = mapaAtual.current[evento.key.toLowerCase()]
      if (acao) {
        evento.preventDefault()
        acao()
      }
    }

    window.addEventListener('keydown', aoPressionar)
    return () => window.removeEventListener('keydown', aoPressionar)
  }, [ativo])
}
