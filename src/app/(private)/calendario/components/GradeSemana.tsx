'use client'
import clsx from 'clsx'
import { useEffect, useState } from 'react'
import type { Atividade, Evento, TipoEvento, Turma } from '@/@types/Academico'
import { chaveData, deMinutos, dispor, paraMinutos } from '@/utils/academico'

// Grade da semana: faixas de 2 em 2 horas e blocos com altura proporcional à duração.
export const HORA_INICIO = 6
export const HORA_FIM = 22
const PASSO_HORAS = 2
const PX_POR_HORA = 36
const DIAS = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb']

type Tipo = TipoEvento | 'AULA'

const COR: Record<Tipo, string> = {
  AULA: 'border-blue-500 bg-blue-100 text-blue-900',
  PROVA: 'border-red-500 bg-red-100 text-red-900',
  REVISAO: 'border-lime-500 bg-lime-100 text-lime-900',
  OUTRO: 'border-gray-400 bg-gray-100 text-gray-800'
}

interface Props {
  dias: Date[]
  turmas: Turma[]
  nomes: Map<string, string>
  eventos: Evento[]
  atividades: Atividade[]
  onSlot: (data: string, inicioMinutos: number) => void
  onRemover: (id: string) => void
}

interface Bloco {
  id: string
  titulo: string
  tipo: Tipo
  inicio: number
  fim: number
  removivel: boolean
}

const topoMinimo = HORA_INICIO * 60
const topoMaximo = HORA_FIM * 60
const altura = (HORA_FIM - HORA_INICIO) * PX_POR_HORA
const faixas = Array.from(
  { length: (HORA_FIM - HORA_INICIO) / PASSO_HORAS },
  (_, i) => HORA_INICIO + i * PASSO_HORAS
)

const GradeSemana: React.FC<Props> = ({
  dias,
  turmas,
  nomes,
  eventos,
  atividades,
  onSlot,
  onRemover
}) => {
  const hoje = chaveData(new Date())
  // Linha do "agora": só no cliente, para não divergir do HTML do servidor.
  const [agora, setAgora] = useState<number | null>(null)
  useEffect(() => {
    const atualizar = () => {
      const d = new Date()
      setAgora(d.getHours() * 60 + d.getMinutes())
    }
    atualizar()
    const id = setInterval(atualizar, 60_000)
    return () => clearInterval(id)
  }, [])

  const blocosDoDia = (dia: Date) => {
    const chave = chaveData(dia)
    const aulas = turmas
      .filter((t) => t.dias.includes(dia.getDay()))
      .map<Bloco>((t) => ({
        id: `aula-${t.id}`,
        titulo: nomes.get(t.codigo) ?? t.codigo,
        tipo: 'AULA',
        inicio: paraMinutos(t.inicio),
        fim: paraMinutos(t.fim),
        removivel: false
      }))
    const marcados = eventos
      .filter((e) => e.data === chave && e.inicio && e.fim)
      .map<Bloco>((e) => ({
        id: e.id,
        titulo: e.titulo,
        tipo: e.tipo,
        inicio: paraMinutos(e.inicio as string),
        fim: paraMinutos(e.fim as string),
        removivel: true
      }))
    return dispor(
      [...aulas, ...marcados].filter(
        (b) => b.fim > topoMinimo && b.inicio < topoMaximo
      )
    )
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-100">
      <div className="min-w-[760px]">
        <div className="grid grid-cols-[3rem_repeat(7,minmax(0,1fr))] border-b border-gray-100 bg-white">
          <div />
          {dias.map((dia) => {
            const eHoje = chaveData(dia) === hoje
            return (
              <div key={chaveData(dia)} className="py-2 text-center">
                <p className="text-xs font-semibold uppercase text-gray-400">
                  {DIAS[dia.getDay()]}
                </p>
                <p
                  className={clsx(
                    'mx-auto flex size-8 items-center justify-center rounded-full text-sm font-bold',
                    eHoje ? 'bg-xor-navy text-white' : 'text-gray-800'
                  )}
                >
                  {dia.getDate()}
                </p>
              </div>
            )
          })}
        </div>

        <div className="grid grid-cols-[3rem_repeat(7,minmax(0,1fr))] border-b border-gray-100 bg-gray-50/60">
          <div className="px-1 py-1 text-[10px] font-semibold leading-tight text-gray-400">
            dia todo
          </div>
          {dias.map((dia) => {
            const chave = chaveData(dia)
            const entregas = atividades.filter(
              (a) => a.prazo === chave && !a.feita
            )
            const semHorario = eventos.filter(
              (e) => e.data === chave && !(e.inicio && e.fim)
            )
            return (
              <div
                key={chave}
                className="min-h-7 space-y-0.5 border-l border-gray-100 p-0.5"
              >
                {entregas.map((a) => (
                  <p
                    key={a.id}
                    title={`Entrega: ${a.titulo}`}
                    className="truncate rounded bg-amber-100 px-1 py-0.5 text-[11px] font-medium text-amber-900"
                  >
                    Entrega: {a.titulo}
                  </p>
                ))}
                {semHorario.map((e) => (
                  <p
                    key={e.id}
                    className={clsx(
                      'flex items-center justify-between gap-1 truncate rounded border-l-4 px-1 py-0.5 text-[11px] font-medium',
                      COR[e.tipo]
                    )}
                  >
                    <span className="truncate">{e.titulo}</span>
                    <button
                      type="button"
                      aria-label={`Remover ${e.titulo}`}
                      onClick={() => onRemover(e.id)}
                      className="cursor-pointer font-bold"
                    >
                      ×
                    </button>
                  </p>
                ))}
              </div>
            )
          })}
        </div>

        <div className="grid grid-cols-[3rem_repeat(7,minmax(0,1fr))] bg-white">
          <div className="relative" style={{ height: altura }}>
            {faixas.map((h) => (
              <span
                key={h}
                className="absolute right-1 -translate-y-1/2 text-[10px] font-medium text-gray-400"
                style={{
                  top: (h - HORA_INICIO) * PX_POR_HORA,
                  visibility: h === HORA_INICIO ? 'hidden' : 'visible'
                }}
              >
                {deMinutos(h * 60)}
              </span>
            ))}
          </div>

          {dias.map((dia) => {
            const chave = chaveData(dia)
            return (
              <div
                key={chave}
                className="relative border-l border-gray-100"
                style={{ height: altura }}
              >
                {faixas.map((h) => (
                  <button
                    key={h}
                    type="button"
                    aria-label={`Novo evento ${DIAS[dia.getDay()]} ${String(dia.getDate()).padStart(2, '0')} das ${deMinutos(h * 60)} às ${deMinutos((h + PASSO_HORAS) * 60)}`}
                    onClick={() => onSlot(chave, h * 60)}
                    className="block w-full cursor-pointer border-t border-gray-100 text-left outline-none hover:bg-xor-navy/5 focus-visible:bg-xor-navy/10"
                    style={{ height: PASSO_HORAS * PX_POR_HORA }}
                  />
                ))}

                {blocosDoDia(dia).map((b) => {
                  const inicio = Math.max(b.inicio, topoMinimo)
                  const fim = Math.min(b.fim, topoMaximo)
                  return (
                    <div
                      key={b.id}
                      title={`${b.titulo} · ${deMinutos(b.inicio)} às ${deMinutos(b.fim)}`}
                      className={clsx(
                        'group absolute overflow-hidden rounded-md border-l-4 px-1.5 py-1 text-[11px] leading-tight shadow-sm',
                        COR[b.tipo]
                      )}
                      style={{
                        top: ((inicio - topoMinimo) / 60) * PX_POR_HORA + 1,
                        height: Math.max(
                          18,
                          ((fim - inicio) / 60) * PX_POR_HORA - 2
                        ),
                        left: `calc(${(b.faixa / b.faixas) * 100}% + 2px)`,
                        width: `calc(${100 / b.faixas}% - 4px)`
                      }}
                    >
                      <p className="truncate font-semibold">{b.titulo}</p>
                      <p className="truncate opacity-70">
                        {deMinutos(b.inicio)} – {deMinutos(b.fim)}
                      </p>
                      {b.removivel && (
                        <button
                          type="button"
                          aria-label={`Remover ${b.titulo}`}
                          onClick={() => onRemover(b.id)}
                          className="absolute top-0.5 right-1 hidden cursor-pointer font-bold group-hover:block"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  )
                })}

                {chave === hoje &&
                  agora !== null &&
                  agora >= topoMinimo &&
                  agora <= topoMaximo && (
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-x-0 z-10 border-t-2 border-red-500"
                      style={{
                        top: ((agora - topoMinimo) / 60) * PX_POR_HORA
                      }}
                    >
                      <span className="absolute -top-1.5 -left-1 size-2.5 rounded-full bg-red-500" />
                    </div>
                  )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default GradeSemana
