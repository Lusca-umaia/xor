'use client'
import clsx from 'clsx'
import type { Atividade, Evento, TipoEvento, Turma } from '@/@types/Academico'
import { chaveData, inicioDaSemana, somarDias } from '@/utils/academico'

const DIAS = ['seg', 'ter', 'qua', 'qui', 'sex', 'sáb', 'dom']
const MAX_ITENS = 3

const COR: Record<TipoEvento, string> = {
  PROVA: 'bg-red-100 text-red-900',
  REVISAO: 'bg-lime-100 text-lime-900',
  OUTRO: 'bg-gray-100 text-gray-800'
}

interface Props {
  // Qualquer data do mês exibido.
  mes: Date
  turmas: Turma[]
  eventos: Evento[]
  atividades: Atividade[]
  onDia: (dia: Date) => void
}

const GradeMes: React.FC<Props> = ({
  mes,
  turmas,
  eventos,
  atividades,
  onDia
}) => {
  const hoje = chaveData(new Date())
  const primeiro = new Date(mes.getFullYear(), mes.getMonth(), 1)
  const inicio = inicioDaSemana(primeiro)
  // 6 semanas cobrem qualquer mês.
  const dias = Array.from({ length: 42 }, (_, i) => somarDias(inicio, i))

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-100">
      <div className="min-w-[640px]">
        <div className="grid grid-cols-7 border-b border-gray-100 bg-white">
          {DIAS.map((d) => (
            <p
              key={d}
              className="py-2 text-center text-xs font-semibold uppercase text-gray-400"
            >
              {d}
            </p>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {dias.map((dia) => {
            const chave = chaveData(dia)
            const doMes = dia.getMonth() === primeiro.getMonth()
            const aulas = turmas.filter((t) => t.dias.includes(dia.getDay()))
            const itens = [
              ...eventos
                .filter((e) => e.data === chave)
                .sort((a, b) => (a.inicio ?? '').localeCompare(b.inicio ?? ''))
                .map((e) => ({
                  id: e.id,
                  texto: `${e.inicio ? `${e.inicio} ` : ''}${e.titulo}`,
                  classe: COR[e.tipo]
                })),
              ...atividades
                .filter((a) => a.prazo === chave && !a.feita)
                .map((a) => ({
                  id: a.id,
                  texto: `Entrega: ${a.titulo}`,
                  classe: 'bg-amber-100 text-amber-900'
                }))
            ]
            return (
              <button
                key={chave}
                type="button"
                onClick={() => onDia(dia)}
                aria-label={`Ver a semana de ${dia.getDate()}/${dia.getMonth() + 1}`}
                className={clsx(
                  'min-h-24 cursor-pointer space-y-0.5 border-t border-l border-gray-100 p-1 text-left outline-none hover:bg-xor-navy/5 focus-visible:bg-xor-navy/10',
                  !doMes && 'bg-gray-50/70 text-gray-400'
                )}
              >
                <span
                  className={clsx(
                    'flex size-6 items-center justify-center rounded-full text-xs font-bold',
                    chave === hoje ? 'bg-xor-navy text-white' : 'text-gray-700'
                  )}
                >
                  {dia.getDate()}
                </span>
                {aulas.length > 0 && doMes && (
                  <span className="block truncate rounded bg-blue-100 px-1 py-0.5 text-[10px] font-medium text-blue-900">
                    {aulas.length} aula{aulas.length > 1 ? 's' : ''}
                  </span>
                )}
                {itens.slice(0, MAX_ITENS).map((i) => (
                  <span
                    key={i.id}
                    className={clsx(
                      'block truncate rounded px-1 py-0.5 text-[10px] font-medium',
                      i.classe
                    )}
                  >
                    {i.texto}
                  </span>
                ))}
                {itens.length > MAX_ITENS && (
                  <span className="block text-[10px] font-semibold text-gray-500">
                    +{itens.length - MAX_ITENS} mais
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default GradeMes
