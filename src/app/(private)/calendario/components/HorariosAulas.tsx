'use client'
import clsx from 'clsx'
import { Dispatch, SetStateAction, useState } from 'react'
import { LuTrash2 } from 'react-icons/lu'
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
  const nome = (c: string) => disciplinas.find((d) => d.codigo === c)?.nome ?? c

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
          Horários das aulas
        </h3>
        <p className="text-sm text-gray-500">
          Você não tem disciplinas em andamento. Marque as do semestre em
          Progressão de curso para cadastrar os horários.
        </p>
      </Card>
    )

  return (
    <Card>
      <h3 className="text-base font-bold tracking-tight">Horários das aulas</h3>
      <p className="text-sm text-gray-500">
        Os horários das suas disciplinas não vêm do SIGAA: cadastre aqui para
        aparecerem na grade.
      </p>
      <form onSubmit={adicionar} className="grid gap-2 md:grid-cols-6">
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

      {turmas.length > 0 && (
        <ul className="divide-y divide-gray-100">
          {turmas.map((t) => (
            <li
              key={t.id}
              className="flex items-center justify-between gap-2 py-2 text-sm"
            >
              <span>
                <strong>{t.codigo}</strong> {nome(t.codigo)} ·{' '}
                {t.dias.map((d) => ROTULO_DIA.get(d)).join(', ')} · {t.inicio}{' '}
                às {t.fim}
              </span>
              <button
                type="button"
                aria-label={`Remover horário de ${t.codigo}`}
                onClick={() => setTurmas((l) => l.filter((x) => x.id !== t.id))}
                className="cursor-pointer text-gray-400 hover:text-red-600"
              >
                <LuTrash2 />
              </button>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}

export default HorariosAulas
