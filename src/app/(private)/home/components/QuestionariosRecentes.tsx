'use client'

import clsx from 'clsx'
import Link from 'next/link'
import { LuArrowRight, LuListChecks, LuPlus } from 'react-icons/lu'
import IconeTile from '@/components/IconeTile/IconeTile'
import Skeleton from '@/components/Skeleton/Skeleton'
import { useQuestionarios } from '@/hooks/queries/useQuestionarios'

const tomDoPercentual = (percentual: number) =>
  percentual >= 70
    ? 'bg-lime-50 text-lime-800 ring-lime-600/20'
    : percentual >= 50
      ? 'bg-amber-50 text-amber-800 ring-amber-600/20'
      : 'bg-red-50 text-red-700 ring-red-600/20'

const QuestionariosRecentes = () => {
  const { data, isLoading, isError } = useQuestionarios()

  const recentes = (data ?? [])
    .toSorted((a, b) => b.atualizadoEm.localeCompare(a.atualizadoEm))
    .slice(0, 3)

  return (
    <section className="space-y-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-lg max-md:p-4">
      <header className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <IconeTile>
            <LuListChecks />
          </IconeTile>
          <h2 className="text-lg font-bold tracking-tight max-md:text-base">
            Questionários
          </h2>
        </div>
        <Link
          href="/questoes/lista-questionario"
          className="inline-flex items-center gap-1 text-sm font-semibold text-xor-navy hover:text-xor-slate"
        >
          Ver todos
          <LuArrowRight />
        </Link>
      </header>

      {isLoading && (
        <div className="space-y-2">
          {Array.from({ length: 3 }, (_, i) => (
            <Skeleton key={i} className="h-14 rounded-xl" />
          ))}
        </div>
      )}

      {isError && (
        <p className="text-sm font-medium text-red-600">
          Não foi possível carregar seus questionários.
        </p>
      )}

      {data && recentes.length === 0 && (
        <div className="space-y-3 rounded-xl border-2 border-dashed border-gray-200 p-4 text-center">
          <p className="text-sm text-gray-500">
            Crie um questionário para revisar o conteúdo das disciplinas.
          </p>
          <Link
            href="/questoes/criar-questionario"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-xor-navy hover:text-xor-slate"
          >
            <LuPlus />
            Criar questionário
          </Link>
        </div>
      )}

      {recentes.length > 0 && (
        <ul className="space-y-2">
          {recentes.map((questionario) => (
            <li key={questionario.id}>
              <Link
                href={`/questoes/responder-questionario?id=${questionario.id}`}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 ring-1 ring-inset ring-gray-100 transition hover:bg-gray-50 hover:ring-gray-200"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-gray-900">
                    {questionario.titulo}
                  </p>
                  <p className="truncate text-xs text-gray-500">
                    {questionario.disciplina?.nome ?? 'Sem disciplina'} ·{' '}
                    {questionario.totalQuestoes}{' '}
                    {questionario.totalQuestoes === 1 ? 'questão' : 'questões'}
                  </p>
                </div>
                {questionario.melhorPercentual !== null ? (
                  <span
                    title="Melhor resultado"
                    className={clsx(
                      'shrink-0 rounded-full px-2 py-0.5 text-xs font-bold ring-1 ring-inset',
                      tomDoPercentual(questionario.melhorPercentual)
                    )}
                  >
                    {questionario.melhorPercentual}%
                  </span>
                ) : (
                  <span className="shrink-0 rounded-full bg-xor-lime/15 px-2 py-0.5 text-xs font-semibold text-xor-navy ring-1 ring-inset ring-xor-lime/60">
                    Novo
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export default QuestionariosRecentes
