'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { ConfigPomodoro, duracaoDoModo, ModoTimer } from '../consts'
import { useArmazenado } from './useArmazenado'

interface EstadoTimer {
  modo: ModoTimer
  // Duração do bloco atual, em segundos.
  total: number
  // Segundos restantes enquanto pausado.
  restante: number
  // Momento (ms) em que o bloco termina, quando está rodando. Usar o horário
  // final evita atraso do setInterval em aba inativa e sobrevive a recarregar.
  fimEm: number | null
  // Focos concluídos no ciclo atual (zera depois da pausa longa).
  ciclo: number
  // Quando o bloco de foco atual começou (ISO).
  iniciadoEm: string | null
}

export interface FocoConcluido {
  iniciadaEm: string
  concluidaEm: string
  duracaoSegundos: number
}

interface UsePomodoroOptions {
  config: ConfigPomodoro
  onFocoConcluido?: (foco: FocoConcluido) => void
  onBlocoConcluido?: (modo: ModoTimer, proximo: ModoTimer) => void
}

function novoBloco(
  modo: ModoTimer,
  ciclo: number,
  config: ConfigPomodoro,
  iniciar = false
): EstadoTimer {
  const total = duracaoDoModo(modo, config)
  return {
    modo,
    ciclo,
    total,
    restante: total,
    fimEm: iniciar ? Date.now() + total * 1000 : null,
    iniciadoEm: iniciar && modo === 'FOCO' ? new Date().toISOString() : null
  }
}

function blocoSeguinte(estado: EstadoTimer, config: ConfigPomodoro) {
  if (estado.modo === 'FOCO') {
    const ciclo = estado.ciclo + 1
    const modo =
      ciclo >= config.ciclosAtePausaLonga ? 'PAUSA_LONGA' : 'PAUSA_CURTA'
    return novoBloco(modo, ciclo, config, config.autoIniciarPausas)
  }
  const ciclo = estado.modo === 'PAUSA_LONGA' ? 0 : estado.ciclo
  return novoBloco('FOCO', ciclo, config, config.autoIniciarFoco)
}

const restanteAgora = (estado: EstadoTimer) =>
  estado.fimEm === null
    ? estado.restante
    : Math.max(0, Math.ceil((estado.fimEm - Date.now()) / 1000))

export function usePomodoro({
  config,
  onFocoConcluido,
  onBlocoConcluido
}: UsePomodoroOptions) {
  const [estado, setEstado, carregado] = useArmazenado<EstadoTimer>(
    'xor:pomodoro:timer',
    novoBloco('FOCO', 0, config)
  )
  const [agora, setAgora] = useState(() => Date.now())

  const callbacks = useRef({ onFocoConcluido, onBlocoConcluido })
  useEffect(() => {
    callbacks.current = { onFocoConcluido, onBlocoConcluido }
  })

  const rodando = estado.fimEm !== null

  useEffect(() => {
    if (estado.fimEm === null) return
    setAgora(Date.now())
    const intervalo = setInterval(() => setAgora(Date.now()), 250)
    return () => clearInterval(intervalo)
  }, [estado.fimEm])

  // Fim do bloco: registra o foco e passa para o próximo.
  useEffect(() => {
    if (!carregado || estado.fimEm === null || agora < estado.fimEm) return

    if (estado.modo === 'FOCO') {
      callbacks.current.onFocoConcluido?.({
        iniciadaEm:
          estado.iniciadoEm ??
          new Date(estado.fimEm - estado.total * 1000).toISOString(),
        concluidaEm: new Date(estado.fimEm).toISOString(),
        duracaoSegundos: estado.total
      })
    }

    const proximo = blocoSeguinte(estado, config)
    callbacks.current.onBlocoConcluido?.(estado.modo, proximo.modo)
    setEstado(proximo)
  }, [agora, estado, config, carregado, setEstado])

  // Mudou a duração nas configurações: aplica se o bloco ainda não começou.
  const duracaoConfigurada = duracaoDoModo(estado.modo, config)
  useEffect(() => {
    setEstado((e) =>
      e.fimEm === null &&
      e.restante === e.total &&
      e.total !== duracaoConfigurada
        ? { ...e, total: duracaoConfigurada, restante: duracaoConfigurada }
        : e
    )
  }, [duracaoConfigurada, setEstado])

  const alternar = useCallback(() => {
    setEstado((e) => {
      if (e.fimEm !== null) {
        return { ...e, fimEm: null, restante: restanteAgora(e) }
      }
      return {
        ...e,
        fimEm: Date.now() + e.restante * 1000,
        iniciadoEm:
          e.iniciadoEm ?? (e.modo === 'FOCO' ? new Date().toISOString() : null)
      }
    })
  }, [setEstado])

  const reiniciar = useCallback(() => {
    setEstado((e) => novoBloco(e.modo, e.ciclo, config))
  }, [config, setEstado])

  // Pular não registra o foco nem conta no ciclo.
  const pular = useCallback(() => {
    setEstado((e) =>
      e.modo === 'FOCO'
        ? novoBloco(
            e.ciclo + 1 >= config.ciclosAtePausaLonga
              ? 'PAUSA_LONGA'
              : 'PAUSA_CURTA',
            e.ciclo,
            config
          )
        : novoBloco('FOCO', e.modo === 'PAUSA_LONGA' ? 0 : e.ciclo, config)
    )
  }, [config, setEstado])

  const trocarModo = useCallback(
    (modo: ModoTimer) => {
      setEstado((e) => novoBloco(modo, e.ciclo, config))
    },
    [config, setEstado]
  )

  return {
    modo: estado.modo,
    total: estado.total,
    // `agora` só agenda as renderizações; o cálculo usa o relógio atual para
    // não mostrar um valor velho logo após dar play.
    restante: restanteAgora(estado),
    rodando,
    ciclo: estado.ciclo,
    // Já passou tempo neste bloco (para confirmar antes de descartar).
    emAndamento: rodando || estado.restante < estado.total,
    carregado,
    alternar,
    reiniciar,
    pular,
    trocarModo
  }
}
