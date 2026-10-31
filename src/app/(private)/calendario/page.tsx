'use client'
import clsx from 'clsx'
import { useMemo, useState } from 'react'
import { LuChevronLeft, LuChevronRight, LuTriangleAlert } from 'react-icons/lu'
import Header from '@/components/Header/Header'
import Skeleton from '@/components/Skeleton/Skeleton'
import { useAgenda } from '@/hooks/useAgenda'
import { useDisciplinasAtivas } from '@/hooks/useDisciplinasAtivas'
import {
  cargaDaSemana,
  chaveData,
  deMinutos,
  gerarICS,
  inicioDaSemana,
  somarDias,
  sugerirRevisoes
} from '@/utils/academico'
import { Card } from '../academico/components/Comuns'
import GradeMes from './components/GradeMes'
import GradeSemana from './components/GradeSemana'
import HorariosAulas from './components/HorariosAulas'
import NovoEvento, { type Rascunho } from './components/NovoEvento'
import PainelSemana from './components/PainelSemana'

const DURACAO_SLOT_MIN = 120

const CalendarioPage = () => {
  const { ativas, isLoading } = useDisciplinasAtivas()
  const {
    atividades,
    eventos,
    setEventos,
    turmas,
    setTurmas,
    limites,
    setLimites
  } = useAgenda()
  const [inicio, setInicio] = useState(() => inicioDaSemana(new Date()))
  const [rascunho, setRascunho] = useState<Rascunho | null>(null)
  const [modo, setModo] = useState<'semana' | 'mes'>('semana')
  const [mes, setMes] = useState(() => new Date())

  const nomes = useMemo(
    () => new Map(ativas.map((d) => [d.codigo, d.nome])),
    [ativas]
  )
  const revisoes = useMemo(
    () => sugerirRevisoes(eventos, new Date()),
    [eventos]
  )

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-80 max-w-full" />
        <Skeleton className="h-[34rem] w-full" />
      </div>
    )
  }

  const dias = Array.from({ length: 7 }, (_, i) => somarDias(inicio, i))
  const carga = cargaDaSemana(
    inicio,
    atividades,
    eventos,
    limites.horas,
    limites.itens
  )
  const titulo = `${dias[0].toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })} a ${dias[6].toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}`

  const semanal = modo === 'semana'
  const tituloMes = mes.toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric'
  })
  const mover = (dias: number) => setInicio((d) => somarDias(d, dias))
  const moverMes = (n: number) =>
    setMes((d) => new Date(d.getFullYear(), d.getMonth() + n, 1))
  const irParaHoje = () => {
    setInicio(inicioDaSemana(new Date()))
    setMes(new Date())
  }

  const abrirNovo = (data: string, inicioMin: number) =>
    setRascunho({
      data,
      inicio: deMinutos(inicioMin),
      fim: deMinutos(inicioMin + DURACAO_SLOT_MIN)
    })

  const exportar = () => {
    const blob = new Blob([gerarICS(eventos, atividades)], {
      type: 'text/calendar;charset=utf-8'
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'xor-calendario.ics'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div>
      <Header
        title="Calendário"
        description="Aulas, provas e revisões em blocos de 2 em 2 horas. Clique num horário para criar um evento."
        actions={{
          primaryAction: { title: 'Exportar .ics', onClick: exportar },
          secondaryAction: {
            title: 'Novo evento',
            onClick: () => abrirNovo(chaveData(new Date()), 8 * 60)
          }
        }}
      />
      <div className="space-y-4">
        {carga.critica && (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900"
          >
            <LuTriangleAlert className="mt-0.5 shrink-0" />
            <p>
              <strong>Semana crítica:</strong> {carga.motivos.join(' · ')}.
            </p>
          </div>
        )}

        <HorariosAulas
          disciplinas={ativas}
          turmas={turmas}
          setTurmas={setTurmas}
        />

        {rascunho && (
          <NovoEvento
            key={`${rascunho.data}-${rascunho.inicio}`}
            rascunho={rascunho}
            disciplinas={ativas}
            onSalvar={(evento) => {
              setEventos((l) => [...l, evento])
              setRascunho(null)
            }}
            onCancelar={() => setRascunho(null)}
          />
        )}

        <Card>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1">
              <button
                type="button"
                aria-label={semanal ? 'Semana anterior' : 'Mês anterior'}
                onClick={() => (semanal ? mover(-7) : moverMes(-1))}
                className="cursor-pointer rounded-md p-2 hover:bg-gray-100"
              >
                <LuChevronLeft />
              </button>
              <h3 className="min-w-48 text-center text-base font-bold tracking-tight capitalize">
                {semanal ? titulo : tituloMes}
              </h3>
              <button
                type="button"
                aria-label={semanal ? 'Próxima semana' : 'Próximo mês'}
                onClick={() => (semanal ? mover(7) : moverMes(1))}
                className="cursor-pointer rounded-md p-2 hover:bg-gray-100"
              >
                <LuChevronRight />
              </button>
              <button
                type="button"
                onClick={irParaHoje}
                className="ml-1 cursor-pointer rounded-md px-2 py-1 text-xs font-semibold text-xor-navy hover:bg-gray-100"
              >
                Hoje
              </button>
            </div>
            <div
              role="tablist"
              className="flex gap-1 rounded-full border border-gray-100 bg-white p-1 shadow-sm"
            >
              {(['semana', 'mes'] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  role="tab"
                  aria-selected={modo === m}
                  onClick={() => setModo(m)}
                  className={clsx(
                    'cursor-pointer rounded-full px-3 py-1 text-xs font-semibold',
                    modo === m
                      ? 'bg-black text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  )}
                >
                  {m === 'semana' ? 'Semana' : 'Mês'}
                </button>
              ))}
            </div>
          </div>

          {semanal ? (
            <GradeSemana
              dias={dias}
              turmas={turmas}
              nomes={nomes}
              eventos={eventos}
              atividades={atividades}
              onSlot={abrirNovo}
              onRemover={(id) =>
                setEventos((l) => l.filter((e) => e.id !== id))
              }
            />
          ) : (
            <GradeMes
              mes={mes}
              turmas={turmas}
              eventos={eventos}
              atividades={atividades}
              onDia={(dia) => {
                setInicio(inicioDaSemana(dia))
                setModo('semana')
              }}
            />
          )}
          <p className="text-xs text-gray-500">
            Os horários de aula são os que você cadastra abaixo.
            {!semanal && ' Clique num dia para abrir a semana dele.'}
          </p>
        </Card>

        <PainelSemana
          carga={carga}
          limites={limites}
          setLimites={setLimites}
          revisoes={revisoes}
          onAdicionar={(evento) => setEventos((l) => [...l, evento])}
        />
      </div>
    </div>
  )
}

export default CalendarioPage
