'use client'

import clsx from 'clsx'
import {
  LuAward,
  LuChartColumn,
  LuMedal,
  LuTrendingDown,
  LuTrendingUp,
  LuZap
} from 'react-icons/lu'
import type { EventoXp, TipoXp } from '@/@types/AmbienteEstudo'
import IconeTile from '@/components/IconeTile/IconeTile'
import { useResumoCadeiras } from '@/hooks/ambienteEstudo/useAmbientes'
import {
  Conquista,
  origemDoXp,
  proximaConquista,
  xpDaSemana
} from '@/utils/ambienteEstudo/gamificacao'
import { classeCartao } from '../estilos'

// Tons da barra de origem do XP, do maior para o menor.
const TONS = [
  'bg-xor-navy',
  'bg-xor-slate',
  'bg-xor-lime',
  'bg-sky-400',
  'bg-amber-400',
  'bg-gray-300'
]

function Bloco({
  icone,
  titulo,
  children
}: {
  icone: React.ReactNode
  titulo: string
  children: React.ReactNode
}) {
  return (
    <div className="flex min-w-0 flex-col gap-3">
      <h3 className="flex items-center gap-2 text-sm font-bold text-gray-900">
        <span className="text-xor-navy">{icone}</span>
        {titulo}
      </h3>
      {children}
    </div>
  )
}

/** XP da cadeira na semana, de onde ele vem e o que vem a seguir. */
export default function PainelXp({
  ambienteId,
  disciplinaCodigo,
  eventos,
  porTipo,
  conquistas
}: {
  ambienteId: string
  disciplinaCodigo: string | null
  eventos: EventoXp[]
  porTipo?: Partial<Record<TipoXp, number>>
  conquistas: Conquista[]
}) {
  const semana = xpDaSemana(eventos)
  const origem = origemDoXp(porTipo)
  const proxima = proximaConquista(conquistas)
  const maximo = Math.max(...semana.dias.map(({ xp }) => xp), 1)
  const variacao =
    semana.anterior > 0
      ? (semana.total - semana.anterior) / semana.anterior
      : null

  // Posição entre as cadeiras do aluno (só para ambientes de cadeira).
  const resumos = useResumoCadeiras()
  const ranking = disciplinaCodigo
    ? [...(resumos.data ?? [])].sort((a, b) => b.xp - a.xp)
    : []
  const posicao = ranking.findIndex((r) => r.ambienteId === ambienteId) + 1

  return (
    <section
      className={clsx(
        classeCartao,
        'grid gap-6 p-6 max-md:p-4 md:grid-cols-3 lg:col-span-3'
      )}
    >
      <Bloco icone={<LuChartColumn />} titulo="XP nesta semana">
        <p className="flex flex-wrap items-baseline gap-x-2 text-2xl font-bold text-gray-900">
          {semana.total} XP
          {variacao !== null && Math.round(variacao * 100) !== 0 && (
            <span
              title={`Semana anterior: ${semana.anterior} XP`}
              className={clsx(
                'inline-flex items-center gap-0.5 text-xs font-semibold',
                variacao > 0 ? 'text-lime-700' : 'text-red-600'
              )}
            >
              {variacao > 0 ? <LuTrendingUp /> : <LuTrendingDown />}
              {variacao > 0 ? '+' : ''}
              {Math.round(variacao * 100)}% vs. semana anterior
            </span>
          )}
        </p>
        <ol className="grid h-24 grid-cols-7 items-end gap-1.5">
          {semana.dias.map((dia) => (
            <li
              key={dia.data}
              className="flex h-full flex-col items-center justify-end gap-1"
              title={`${dia.data}: ${dia.xp} XP`}
            >
              <span
                className={clsx(
                  'w-full rounded-t-md transition-[height] duration-700',
                  dia.hoje ? 'bg-xor-lime' : 'bg-xor-navy/70'
                )}
                style={{
                  height: dia.xp
                    ? `${Math.max(6, (dia.xp / maximo) * 100)}%`
                    : '2px'
                }}
              />
              <span
                className={clsx(
                  'text-[10px] font-semibold',
                  dia.hoje ? 'text-gray-900' : 'text-gray-400'
                )}
              >
                {dia.hoje ? 'Hoje' : dia.rotulo}
              </span>
              <span className="sr-only">
                {dia.data}: {dia.xp} XP
              </span>
            </li>
          ))}
        </ol>
      </Bloco>

      <Bloco icone={<LuZap />} titulo="De onde vem seu XP">
        {origem.length === 0 ? (
          <p className="text-sm text-gray-500">
            Envie um material ou converse com a IA para ganhar os primeiros
            pontos.
          </p>
        ) : (
          <>
            <div
              className="flex h-3 overflow-hidden rounded-full bg-gray-100"
              aria-hidden="true"
            >
              {origem.map(({ rotulo, fracao }, indice) => (
                <span
                  key={rotulo}
                  className={TONS[indice % TONS.length]}
                  style={{ width: `${fracao * 100}%` }}
                />
              ))}
            </div>
            <ul className="space-y-1.5 text-sm">
              {origem.map(({ rotulo, xp, fracao }, indice) => (
                <li key={rotulo} className="flex items-center gap-2">
                  <span
                    aria-hidden="true"
                    className={clsx(
                      'size-2.5 shrink-0 rounded-full',
                      TONS[indice % TONS.length]
                    )}
                  />
                  <span className="min-w-0 flex-1 truncate text-gray-600">
                    {rotulo}
                  </span>
                  <span className="font-semibold text-gray-900 tabular-nums">
                    {xp} XP
                  </span>
                  <span className="w-9 text-right text-xs text-gray-400 tabular-nums">
                    {Math.round(fracao * 100)}%
                  </span>
                </li>
              ))}
            </ul>
          </>
        )}
      </Bloco>

      <Bloco icone={<LuAward />} titulo="Próximos objetivos">
        {proxima ? (
          <div className="space-y-2 rounded-xl bg-gray-50 p-3 ring-1 ring-inset ring-gray-100">
            <p className="text-xs font-medium text-gray-500">
              Próxima conquista
            </p>
            <p className="text-sm font-bold text-gray-900">{proxima.nome}</p>
            <p className="text-xs text-gray-500">{proxima.descricao}</p>
            <div
              className="h-2 overflow-hidden rounded-full bg-gray-200"
              role="progressbar"
              aria-label={`Progresso em ${proxima.nome}`}
              aria-valuenow={proxima.atual}
              aria-valuemin={0}
              aria-valuemax={proxima.meta}
            >
              <div
                className="h-full rounded-full bg-xor-lime"
                style={{
                  width: `${Math.max(4, (proxima.atual / proxima.meta) * 100)}%`
                }}
              />
            </div>
            <p className="text-xs font-semibold text-gray-700">
              {proxima.atual} de {proxima.meta}
            </p>
          </div>
        ) : (
          <p className="text-sm font-medium text-lime-700">
            Todas as conquistas desta cadeira foram desbloqueadas!
          </p>
        )}

        {posicao > 0 && ranking.length > 1 && (
          <div className="flex items-center gap-3 rounded-xl p-3 ring-1 ring-inset ring-gray-100">
            <IconeTile>
              <LuMedal />
            </IconeTile>
            <p className="text-sm text-gray-600">
              {posicao === 1 ? (
                <>
                  <strong className="text-gray-900">
                    Sua cadeira com mais XP
                  </strong>{' '}
                  entre as {ranking.length} que você estuda.
                </>
              ) : (
                <>
                  <strong className="text-gray-900">{posicao}ª em XP</strong>{' '}
                  entre as suas {ranking.length} cadeiras. Faltam{' '}
                  {ranking[posicao - 2].xp - ranking[posicao - 1].xp + 1} XP
                  para subir.
                </>
              )}
            </p>
          </div>
        )}
      </Bloco>
    </section>
  )
}
