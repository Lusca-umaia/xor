'use client'
import clsx from 'clsx'
import { Dispatch, SetStateAction, useState } from 'react'
import { LuCircleCheck, LuClock, LuTrash2 } from 'react-icons/lu'
import type { DisciplinaCurriculo, Turma } from '@/@types/Academico'
import { paraMinutos } from '@/utils/academico'
import { Card } from '../../academico/components/Comuns'

interface Props {
  disciplinas: DisciplinaCurriculo[]
  turmas: Turma[]
  setTurmas: Dispatch<SetStateAction<Turma[]>>
}

const DIAS = [
  { valor: 1, rotulo: 'seg' },
  { valor: 2, rotulo: 'ter' },
  { valor: 3, rotulo: 'qua' },
  { valor: 4, rotulo: 'qui' },
  { valor: 5, rotulo: 'sex' },
  { valor: 6, rotulo: 'sáb' },
  { valor: 0, rotulo: 'dom' }
]
const ROTULO_DIA = new Map(DIAS.map((d) => [d.valor, d.rotulo]))
const campo = 'rounded-md border border-gray-300 px-2 py-1.5 text-sm'

const HorariosAulas: React.FC<Props> = ({ disciplinas, turmas, setTurmas }) => {
  const [codigo, setCodigo] = useState(disciplinas[0]?.codigo ?? '')
  const [dias, setDias] = useState<number[]>([])
  const [inicio, setInicio] = useState('08:00')
  const [fim, setFim] = useState('10:00')

  const valido =
    codigo !== '' && dias.length > 0 && paraMinutos(fim) > paraMinutos(inicio)
  const semHorario = disciplinas.filter(
    (d) => !turmas.some((t) => t.codigo === d.codigo)
  )

  const alternar = (dia: number) =>
    setDias((atual) =>
      atual.includes(dia) ? atual.filter((d) => d !== dia) : [...atual, dia]
    )

  const adicionar = (e: React.FormEvent) => {
    e.preventDefault()
    if (!valido) return
    setTurmas((l) => [
      ...l,
      { id: crypto.randomUUID(), codigo, dias, inicio, fim }
    ])
    setDias([])
  }

  if (disciplinas.length === 0)
    return (
      <Card>
        <h3 className="text-base font-bold tracking-tight">
          Disciplinas e horários
        </h3>
        <p className="text-sm text-gray-500">
          O calendário usa as disciplinas que estão{' '}
          <strong>em andamento</strong> no seu progresso, e nenhuma foi
          encontrada. Marque as do semestre na aba &quot;Semestre atual&quot; de
          Progressão de curso e volte aqui.
        </p>
      </Card>
    )

  return (
    <Card>
      {/* Aberto de início enquanto falta horário, para a grade não ficar vazia sem explicação. */}
      <details open={semHorario.length > 0} className="group space-y-3">
        <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-2">
          <span>
            <span className="block text-base font-bold tracking-tight">
              Disciplinas do semestre e horários
            </span>
            <span className="block text-sm text-gray-500">
              {semHorario.length === 0
                ? `Todas as ${disciplinas.length} disciplinas têm horário na grade.`
                : `${disciplinas.length - semHorario.length} de ${disciplinas.length} disciplinas com horário. A grade mostra só o que você cadastrar.`}
            </span>
          </span>
          <span className="text-xs font-semibold text-xor-navy group-open:hidden">
            Mostrar
          </span>
          <span className="hidden text-xs font-semibold text-xor-navy group-open:inline">
            Ocultar
          </span>
        </summary>

        <p className="text-sm text-gray-500">
          O SIGAA não informa os horários no histórico, então eles não entram
          sozinhos. Escolha a disciplina, os dias e o horário.
        </p>

        <ul className="divide-y divide-gray-100">
          {disciplinas.map((d) => {
            const dela = turmas.filter((t) => t.codigo === d.codigo)
            return (
              <li key={d.codigo} className="py-2 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="flex min-w-0 items-center gap-2">
                    {dela.length > 0 ? (
                      <LuCircleCheck className="shrink-0 text-green-600" />
                    ) : (
                      <LuClock className="shrink-0 text-amber-600" />
                    )}
                    <span className="truncate">
                      <strong>{d.codigo}</strong> {d.nome}
                    </span>
                  </span>
                  {dela.length === 0 && (
                    <button
                      type="button"
                      onClick={() => setCodigo(d.codigo)}
                      className="cursor-pointer rounded-md px-2 py-1 text-xs font-semibold text-xor-navy ring-1 ring-xor-navy/30 ring-inset hover:bg-gray-50"
                    >
                      Cadastrar horário
                    </button>
                  )}
                </div>
                {dela.map((t) => (
                  <div
                    key={t.id}
                    className="mt-1 ml-6 flex items-center justify-between gap-2 text-gray-600"
                  >
                    <span>
                      {t.dias.map((x) => ROTULO_DIA.get(x)).join(', ')} ·{' '}
                      {t.inicio} às {t.fim}
                    </span>
                    <button
                      type="button"
                      aria-label={`Remover horário de ${d.codigo}`}
                      onClick={() =>
                        setTurmas((l) => l.filter((x) => x.id !== t.id))
                      }
                      className="cursor-pointer text-gray-400 hover:text-red-600"
                    >
                      <LuTrash2 />
                    </button>
                  </div>
                ))}
              </li>
            )
          })}
        </ul>

        <form
          onSubmit={adicionar}
          className="grid gap-2 border-t border-gray-100 pt-3 md:grid-cols-6"
        >
          <select
            aria-label="Disciplina"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
            className={clsx(campo, 'md:col-span-3')}
          >
            {disciplinas.map((d) => (
              <option key={d.codigo} value={d.codigo}>
                {d.codigo} · {d.nome}
              </option>
            ))}
          </select>
          <label className="flex items-center gap-2 text-sm text-gray-600 md:col-span-1">
            Início
            <input
              type="time"
              step={1800}
              value={inicio}
              onChange={(e) => setInicio(e.target.value)}
              className={campo}
            />
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-600 md:col-span-2">
            Fim
            <input
              type="time"
              step={1800}
              value={fim}
              onChange={(e) => setFim(e.target.value)}
              className={campo}
            />
          </label>
          <fieldset className="flex flex-wrap gap-1 md:col-span-6">
            <legend className="sr-only">Dias da semana</legend>
            {DIAS.map(({ valor, rotulo }) => (
              <button
                key={valor}
                type="button"
                aria-pressed={dias.includes(valor)}
                onClick={() => alternar(valor)}
                className={clsx(
                  'cursor-pointer rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset',
                  dias.includes(valor)
                    ? 'bg-black text-white ring-black'
                    : 'bg-white text-gray-600 ring-gray-300 hover:bg-gray-50'
                )}
              >
                {rotulo}
              </button>
            ))}
          </fieldset>
          <button
            type="submit"
            disabled={!valido}
            className="cursor-pointer rounded-md bg-black px-3 py-2 text-sm font-semibold text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-50 md:col-span-6 md:w-fit"
          >
            Adicionar horário
          </button>
        </form>
      </details>
    </Card>
  )
}

export default HorariosAulas
