'use client'
import clsx from 'clsx'
import { useState } from 'react'
import type { DisciplinaPersonalizada } from '@/@types/Academico'
import { paraMinutos } from '@/utils/academico'

interface Props {
  codigosExistentes: Set<string>
  onAdicionar: (d: DisciplinaPersonalizada) => void
}

const DIAS = [
  { valor: 1, rotulo: 'seg' },
  { valor: 2, rotulo: 'ter' },
  { valor: 3, rotulo: 'qua' },
  { valor: 4, rotulo: 'qui' },
  { valor: 5, rotulo: 'sex' },
  { valor: 6, rotulo: 'sáb' }
]
const campo = 'rounded-md border border-gray-300 px-2 py-1.5 text-sm'

// Disciplina fora do catálogo (outra optativa, de outro curso, ou com horário próprio).
const NovaDisciplina: React.FC<Props> = ({
  codigosExistentes,
  onAdicionar
}) => {
  const [codigo, setCodigo] = useState('')
  const [nome, setNome] = useState('')
  const [carga, setCarga] = useState(64)
  const [carater, setCarater] =
    useState<DisciplinaPersonalizada['carater']>('OPTATIVA')
  const [dias, setDias] = useState<number[]>([])
  const [inicio, setInicio] = useState('08:00')
  const [fim, setFim] = useState('10:00')

  const cod = codigo.trim().toUpperCase()
  const comHorario = dias.length > 0
  const erro =
    cod && codigosExistentes.has(cod)
      ? 'Já existe uma disciplina com esse código.'
      : comHorario && paraMinutos(fim) <= paraMinutos(inicio)
        ? 'O fim precisa ser depois do início.'
        : null
  const valido = cod !== '' && nome.trim() !== '' && carga > 0 && !erro

  const enviar = (e: React.FormEvent) => {
    e.preventDefault()
    if (!valido) return
    onAdicionar({
      codigo: cod,
      nome: nome.trim(),
      cargaHoraria: carga,
      carater,
      horario: comHorario ? { dias, inicio, fim } : null
    })
    setCodigo('')
    setNome('')
    setDias([])
  }

  return (
    <details className="rounded-lg bg-gray-50 px-3 py-2 text-sm">
      <summary className="cursor-pointer font-semibold text-gray-700">
        Cadastrar outra disciplina
      </summary>
      <form onSubmit={enviar} className="mt-3 grid gap-2 sm:grid-cols-6">
        <input
          aria-label="Código"
          placeholder="Código"
          value={codigo}
          onChange={(e) => setCodigo(e.target.value)}
          className={clsx(campo, 'sm:col-span-2')}
        />
        <input
          aria-label="Nome"
          placeholder="Nome da disciplina"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className={clsx(campo, 'sm:col-span-4')}
        />
        <label className="flex items-center gap-2 text-gray-600 sm:col-span-3">
          Carga (h)
          <input
            type="number"
            min={16}
            step={16}
            value={carga}
            onChange={(e) => setCarga(Number(e.target.value))}
            className={clsx(campo, 'w-24')}
          />
        </label>
        <select
          aria-label="Caráter"
          value={carater}
          onChange={(e) =>
            setCarater(e.target.value as DisciplinaPersonalizada['carater'])
          }
          className={clsx(campo, 'sm:col-span-3')}
        >
          <option value="OPTATIVA">Optativa</option>
          <option value="OBRIGATORIA">Obrigatória</option>
        </select>
        <label className="flex items-center gap-2 text-gray-600 sm:col-span-3">
          Início
          <input
            type="time"
            step={1800}
            value={inicio}
            onChange={(e) => setInicio(e.target.value)}
            className={campo}
          />
        </label>
        <label className="flex items-center gap-2 text-gray-600 sm:col-span-3">
          Fim
          <input
            type="time"
            step={1800}
            value={fim}
            onChange={(e) => setFim(e.target.value)}
            className={campo}
          />
        </label>
        <fieldset className="flex flex-wrap gap-1 sm:col-span-6">
          <legend className="sr-only">Dias da semana</legend>
          {DIAS.map(({ valor, rotulo }) => (
            <button
              key={valor}
              type="button"
              aria-pressed={dias.includes(valor)}
              onClick={() =>
                setDias((a) =>
                  a.includes(valor)
                    ? a.filter((d) => d !== valor)
                    : [...a, valor]
                )
              }
              className={clsx(
                'cursor-pointer rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset',
                dias.includes(valor)
                  ? 'bg-black text-white ring-black'
                  : 'bg-white text-gray-600 ring-gray-300 hover:bg-gray-100'
              )}
            >
              {rotulo}
            </button>
          ))}
        </fieldset>
        <p className="text-xs text-gray-500 sm:col-span-6">
          Sem dias marcados, a disciplina entra no plano só na soma da carga
          horária, sem bloco na grade.
        </p>
        {erro && (
          <p
            role="alert"
            className="text-xs font-medium text-red-600 sm:col-span-6"
          >
            {erro}
          </p>
        )}
        <button
          type="submit"
          disabled={!valido}
          className="cursor-pointer rounded-md bg-black px-3 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50 sm:col-span-6 sm:w-fit"
        >
          Cadastrar
        </button>
      </form>
    </details>
  )
}

export default NovaDisciplina
