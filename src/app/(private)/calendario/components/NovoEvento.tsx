'use client'
import clsx from 'clsx'
import { useState } from 'react'
import type {
  DisciplinaCurriculo,
  Evento,
  TipoEvento
} from '@/@types/Academico'
import { deMinutos, paraMinutos } from '@/utils/academico'
import { Card } from '../../academico/components/Comuns'

export interface Rascunho {
  data: string
  inicio: string
  fim: string
}

interface Props {
  rascunho: Rascunho
  disciplinas: DisciplinaCurriculo[]
  onSalvar: (evento: Evento) => void
  onCancelar: () => void
}

const TIPOS: Record<TipoEvento, string> = {
  PROVA: 'Prova',
  REVISAO: 'Revisão',
  OUTRO: 'Outro'
}
// Horas de dedicação sugeridas; para provas, o preparo costuma passar da duração.
const HORAS_PADRAO: Record<TipoEvento, number | null> = {
  PROVA: 6,
  REVISAO: null,
  OUTRO: null
}

const campo = 'rounded-md border border-gray-300 px-2 py-1.5 text-sm'

const NovoEvento: React.FC<Props> = ({
  rascunho,
  disciplinas,
  onSalvar,
  onCancelar
}) => {
  const [titulo, setTitulo] = useState('')
  const [data, setData] = useState(rascunho.data)
  const [inicio, setInicio] = useState(rascunho.inicio)
  const [fim, setFim] = useState(rascunho.fim)
  const [tipo, setTipo] = useState<TipoEvento>('OUTRO')
  const [codigo, setCodigo] = useState('')
  const [horas, setHoras] = useState<number | null>(null)

  const duracao = (paraMinutos(fim) - paraMinutos(inicio)) / 60
  const horasEfetivas = horas ?? HORAS_PADRAO[tipo] ?? Math.max(0, duracao)
  const horarioValido = duracao > 0
  const valido = titulo.trim() !== '' && data !== '' && horarioValido

  const salvar = (e: React.FormEvent) => {
    e.preventDefault()
    if (!valido) return
    onSalvar({
      id: crypto.randomUUID(),
      titulo: titulo.trim(),
      data,
      tipo,
      codigo: codigo || null,
      inicio,
      fim,
      horas: horasEfetivas
    })
  }

  return (
    <Card>
      <h3 className="text-base font-bold tracking-tight">Novo evento</h3>
      <form onSubmit={salvar} className="grid gap-2 md:grid-cols-6">
        <input
          aria-label="Título"
          placeholder="Título"
          autoFocus
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          className={clsx(campo, 'md:col-span-3')}
        />
        <select
          aria-label="Tipo"
          value={tipo}
          onChange={(e) => setTipo(e.target.value as TipoEvento)}
          className={clsx(campo, 'md:col-span-1')}
        >
          {Object.entries(TIPOS).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
        <select
          aria-label="Disciplina"
          value={codigo}
          onChange={(e) => setCodigo(e.target.value)}
          className={clsx(campo, 'md:col-span-2')}
        >
          <option value="">Sem disciplina</option>
          {disciplinas.map((d) => (
            <option key={d.codigo} value={d.codigo}>
              {d.codigo} · {d.nome}
            </option>
          ))}
        </select>
        <input
          aria-label="Data"
          type="date"
          value={data}
          onChange={(e) => setData(e.target.value)}
          className={clsx(campo, 'md:col-span-2')}
        />
        <label className="flex items-center gap-2 text-sm text-gray-600 md:col-span-2">
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
        <label className="flex items-center gap-2 text-sm text-gray-600 md:col-span-3">
          Horas de dedicação
          <input
            type="number"
            min={0}
            step={0.5}
            value={horasEfetivas}
            onChange={(e) => setHoras(Math.max(0, Number(e.target.value)))}
            className={clsx(campo, 'w-20')}
          />
        </label>
        {!horarioValido && (
          <p role="alert" className="text-sm text-red-600 md:col-span-6">
            O fim precisa ser depois do início ({deMinutos(paraMinutos(inicio))}
            ).
          </p>
        )}
        <div className="flex gap-2 md:col-span-6">
          <button
            type="submit"
            disabled={!valido}
            className="cursor-pointer rounded-md bg-black px-3 py-2 text-sm font-semibold text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
          >
            Adicionar
          </button>
          <button
            type="button"
            onClick={onCancelar}
            className="cursor-pointer rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
          >
            Cancelar
          </button>
        </div>
      </form>
    </Card>
  )
}

export default NovoEvento
