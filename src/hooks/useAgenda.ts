'use client'

import { useEffect, useMemo } from 'react'
import type { Atividade, Evento, Limites, Turma } from '@/@types/Academico'
import { useArmazenado } from '@/app/(private)/pomodoro/hooks/useArmazenado'
import { CHAVES } from '@/services/academico/chaves'
import {
  LIMITE_HORAS_SEMANA,
  LIMITE_ITENS_SEMANA,
  cargaDaSemana,
  inicioDaSemana
} from '@/utils/academico'

const ehExemploAntigo = ({ id }: { id: string }) => id.startsWith('demo-')

// Atividades, eventos, horários de aula e limites do detector de sobrecarga
// (localStorage por enquanto). Tudo começa vazio: nada é inventado para o aluno.
export function useAgenda() {
  const hoje = useMemo(() => new Date(), [])
  const [atividades, setAtividades, atividadesOk] = useArmazenado<Atividade[]>(
    CHAVES.atividades,
    []
  )
  const [eventos, setEventos, eventosOk] = useArmazenado<Evento[]>(
    CHAVES.eventos,
    []
  )
  const [turmas, setTurmas] = useArmazenado<Turma[]>(CHAVES.turmas, [])
  const [limites, setLimites] = useArmazenado<Limites>(CHAVES.limites, {
    horas: LIMITE_HORAS_SEMANA,
    itens: LIMITE_ITENS_SEMANA
  })

  // Versões anteriores gravavam exemplos fictícios (ids "demo-..."): remove uma vez.
  useEffect(() => {
    if (atividadesOk && atividades.some(ehExemploAntigo))
      setAtividades((l) => l.filter((a) => !ehExemploAntigo(a)))
  }, [atividadesOk, atividades, setAtividades])
  useEffect(() => {
    if (eventosOk && eventos.some(ehExemploAntigo))
      setEventos((l) => l.filter((e) => !ehExemploAntigo(e)))
  }, [eventosOk, eventos, setEventos])

  const semanaAtual = cargaDaSemana(
    inicioDaSemana(hoje),
    atividades,
    eventos,
    limites.horas,
    limites.itens
  )
  return {
    atividades,
    setAtividades,
    eventos,
    setEventos,
    turmas,
    setTurmas,
    limites,
    setLimites,
    semanaAtual
  }
}
