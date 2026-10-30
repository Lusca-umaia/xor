import { useEffect, useRef, useState } from 'react'

export type EstadoCronometro = 'NORMAL' | 'ALERTA_10' | 'ALERTA_5' | 'ESGOTADO'

const calcularRestante = (prazoFinal: string) =>
  Math.max(0, (new Date(prazoFinal).getTime() - Date.now()) / 1000)

function estadoPara(restanteSeg: number): EstadoCronometro {
  if (restanteSeg <= 0) return 'ESGOTADO'
  if (restanteSeg <= 5 * 60) return 'ALERTA_5'
  if (restanteSeg <= 10 * 60) return 'ALERTA_10'
  return 'NORMAL'
}

/**
 * O tempo restante é sempre derivado de `prazoFinal - agora`, nunca de um
 * contador decrementado: fica correto com a aba em segundo plano, com timers
 * estrangulados pelo navegador ou depois de recarregar a página.
 * `onEsgotar` é chamado uma única vez.
 */
export function useCronometro(
  prazoFinal: string | null,
  onEsgotar: () => void
) {
  const [restanteSeg, setRestanteSeg] = useState(() =>
    prazoFinal ? calcularRestante(prazoFinal) : Infinity
  )
  const esgotado = useRef(false)
  const callback = useRef(onEsgotar)
  callback.current = onEsgotar

  useEffect(() => {
    if (!prazoFinal) return
    esgotado.current = false

    const atualizar = () => {
      const restante = calcularRestante(prazoFinal)
      setRestanteSeg(restante)
      if (restante <= 0 && !esgotado.current) {
        esgotado.current = true
        callback.current()
      }
    }

    atualizar()
    const intervalo = setInterval(atualizar, 250)
    document.addEventListener('visibilitychange', atualizar)
    return () => {
      clearInterval(intervalo)
      document.removeEventListener('visibilitychange', atualizar)
    }
  }, [prazoFinal])

  return {
    restanteSeg,
    estado: prazoFinal
      ? estadoPara(restanteSeg)
      : ('NORMAL' as EstadoCronometro)
  }
}
