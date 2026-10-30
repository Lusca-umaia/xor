'use client'
import clsx from 'clsx'
import { Dispatch, SetStateAction, useState } from 'react'
import { LuListTodo, LuTrash2 } from 'react-icons/lu'
import type {
  Atividade,
  DisciplinaCurriculo,
  Prioridade,
  TipoAtividade
} from '@/@types/Academico'
import { chaveData } from '@/utils/academico'
import { Card } from '../../academico/components/Comuns'
import EstadoVazio from '@/components/EstadoVazio/EstadoVazio'

interface Props {
  disciplinas: DisciplinaCurriculo[]
  atividades: Atividade[]
  setAtividades: Dispatch<SetStateAction<Atividade[]>>
}

const PRIORIDADE: Record<Prioridade, { texto: string; classe: string }> = {
  ALTA: { texto: 'Alta', classe: 'bg-red-100 text-red-800' },
  MEDIA: { texto: 'Média', classe: 'bg-amber-100 text-amber-800' },
  BAIXA: { texto: 'Baixa', classe: 'bg-gray-100 text-gray-700' }
}

const TIPOS: Record<TipoAtividade, string> = {
  TRABALHO: 'Trabalho',
  LISTA: 'Lista',
  LEITURA: 'Leitura'
}

const campo = 'rounded-md border border-gray-300 px-2 py-1.5 text-sm'

const formatarPrazo = (prazo: string) =>
  prazo.split('-').reverse().slice(0, 2).join('/')

const ListaAtividades: React.FC<Props> = ({
  disciplinas,
  atividades,
  setAtividades
}) => {
  const [codigo, setCodigo] = useState(disciplinas[0]?.codigo ?? '')
  const [titulo, setTitulo] = useState('')
  const [tipo, setTipo] = useState<TipoAtividade>('TRABALHO')
  const [prioridade, setPrioridade] = useState<Prioridade>('MEDIA')
  const [prazo, setPrazo] = useState('')
  const [horas, setHoras] = useState(2)

  const hoje = chaveData(new Date())
  const valido = codigo && titulo.trim() && prazo && horas > 0

  const adicionar = (e: React.FormEvent) => {
    e.preventDefault()
    if (!valido) return
    setAtividades((lista) => [
      ...lista,
      {
        id: crypto.randomUUID(),
        codigo,
        titulo: titulo.trim(),
        tipo,
        prioridade,
        prazo,
        horas,
        feita: false
      }
    ])
    setTitulo('')
  }

  const alternar = (id: string) =>
    setAtividades((lista) =>
      lista.map((a) => (a.id === id ? { ...a, feita: !a.feita } : a))
    )
  const remover = (id: string) =>
    setAtividades((lista) => lista.filter((a) => a.id !== id))

  const ordem = { ALTA: 0, MEDIA: 1, BAIXA: 2 }
  const porDisciplina = Map.groupBy(atividades, (a) => a.codigo)

  return (
    <div className="space-y-4">
      <Card>
        <h3 className="text-base font-bold tracking-tight">Nova atividade</h3>
        {disciplinas.length === 0 && (
          <p className="text-sm text-gray-500">
            Você não tem disciplinas em andamento. Marque as do semestre em
            Progressão de curso para cadastrar atividades.
          </p>
        )}
        <form onSubmit={adicionar} className="grid gap-2 md:grid-cols-6">
          <select
            aria-label="Disciplina"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
            className={clsx(campo, 'md:col-span-2')}
          >
            {disciplinas.map((d) => (
              <option key={d.codigo} value={d.codigo}>
                {d.codigo} · {d.nome}
              </option>
            ))}
          </select>
          <input
            aria-label="Título"
            placeholder="Título"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            className={clsx(campo, 'md:col-span-2')}
          />
          <select
            aria-label="Tipo"
            value={tipo}
            onChange={(e) => setTipo(e.target.value as TipoAtividade)}
            className={campo}
          >
            {Object.entries(TIPOS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
          <select
            aria-label="Prioridade"
            value={prioridade}
            onChange={(e) => setPrioridade(e.target.value as Prioridade)}
            className={campo}
          >
            {Object.entries(PRIORIDADE).map(([k, v]) => (
              <option key={k} value={k}>
                {v.texto}
              </option>
            ))}
          </select>
          <input
            aria-label="Prazo"
            type="date"
            value={prazo}
            onChange={(e) => setPrazo(e.target.value)}
            className={clsx(campo, 'md:col-span-2')}
          />
          <label className="flex items-center gap-2 text-sm text-gray-600 md:col-span-2">
            Horas estimadas
            <input
              type="number"
              min={0.5}
              step={0.5}
              value={horas}
              onChange={(e) => setHoras(Number(e.target.value))}
              className={clsx(campo, 'w-20')}
            />
          </label>
          <button
            type="submit"
            disabled={!valido}
            className="cursor-pointer rounded-md bg-black px-3 py-2 text-sm font-semibold text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-50 md:col-span-2"
          >
            Adicionar
          </button>
        </form>
      </Card>

      {atividades.length === 0 ? (
        <EstadoVazio
          icon={<LuListTodo />}
          titulo="Nenhuma atividade"
          descricao="Cadastre trabalhos, listas e leituras com prazo para acompanhar por disciplina."
        />
      ) : (
        [...porDisciplina.entries()].map(([cod, lista]) => {
          const d = disciplinas.find((x) => x.codigo === cod)
          return (
            <Card key={cod}>
              <h4 className="font-bold">
                <span className="text-xs font-semibold text-gray-400">
                  {cod}{' '}
                </span>
                {d?.nome ?? cod}
              </h4>
              <ul className="divide-y divide-gray-100">
                {[...lista]
                  .sort(
                    (a, b) =>
                      Number(a.feita) - Number(b.feita) ||
                      a.prazo.localeCompare(b.prazo) ||
                      ordem[a.prioridade] - ordem[b.prioridade]
                  )
                  .map((a) => {
                    const atrasada = !a.feita && a.prazo < hoje
                    return (
                      <li key={a.id} className="flex items-center gap-3 py-2">
                        <input
                          type="checkbox"
                          aria-label={`Concluir ${a.titulo}`}
                          checked={a.feita}
                          onChange={() => alternar(a.id)}
                          className="size-4 cursor-pointer accent-black"
                        />
                        <div className="min-w-0 flex-1">
                          <p
                            className={clsx(
                              'truncate text-sm font-medium',
                              a.feita && 'text-gray-400 line-through'
                            )}
                          >
                            {a.titulo}
                          </p>
                          <p
                            className={clsx(
                              'text-xs',
                              atrasada
                                ? 'font-semibold text-red-600'
                                : 'text-gray-500'
                            )}
                          >
                            {TIPOS[a.tipo]} · prazo {formatarPrazo(a.prazo)}
                            {atrasada && ' (atrasada)'} · {a.horas}h
                          </p>
                        </div>
                        <span
                          className={clsx(
                            'rounded-full px-2 py-0.5 text-[11px] font-bold',
                            PRIORIDADE[a.prioridade].classe
                          )}
                        >
                          {PRIORIDADE[a.prioridade].texto}
                        </span>
                        <button
                          type="button"
                          aria-label={`Remover ${a.titulo}`}
                          onClick={() => remover(a.id)}
                          className="cursor-pointer text-gray-400 hover:text-red-600"
                        >
                          <LuTrash2 />
                        </button>
                      </li>
                    )
                  })}
              </ul>
            </Card>
          )
        })
      )}
    </div>
  )
}

export default ListaAtividades
