'use client'
import clsx from 'clsx'
import Link from 'next/link'
import { useEffect } from 'react'
import {
  LuFlame,
  LuTimer,
  LuTrendingDown,
  LuTrendingUp,
  LuTrophy
} from 'react-icons/lu'
import { toast } from 'sonner'
import Skeleton from '@/components/Skeleton/Skeleton'
import { useArmazenado } from '../../pomodoro/hooks/useArmazenado'
import {
  MARCOS,
  type MediaFoco,
  type ResumoSequencia
} from '../utils/sequencia'

interface SequenciaEstudoProps {
  // Indefinidos enquanto as sessões e os dias de estudo carregam.
  resumo?: ResumoSequencia
  media?: MediaFoco
}

const plural = (n: number, um: string, varios: string) =>
  `${n} ${n === 1 ? um : varios}`

/** Comemora uma vez por dia quando a sequência cresce (por dispositivo). */
function useComemoracao(resumo?: ResumoSequencia) {
  const [comemorado, setComemorado, carregado] = useArmazenado(
    'xor:sequencia:comemorada',
    ''
  )
  useEffect(() => {
    if (!resumo?.estudouHoje || !carregado) return
    const hoje = resumo.semana[6].chave
    if (comemorado === hoje) return
    setComemorado(hoje)
    const n = resumo.sequencia
    if (MARCOS.includes(n))
      toast.success(`Novo marco: ${n} dias seguidos de estudo!`, {
        icon: <LuTrophy className="text-amber-500" />
      })
    else if (n === 1)
      toast.success('Sequência iniciada! Volte amanhã para continuar.', {
        icon: <LuFlame className="text-orange-500" />
      })
    else
      toast.success(`${n} dias seguidos! Sua sequência continua.`, {
        icon: <LuFlame className="text-orange-500" />
      })
  }, [resumo, carregado, comemorado, setComemorado])
}

const SequenciaEstudo: React.FC<SequenciaEstudoProps> = ({ resumo, media }) => {
  useComemoracao(resumo)

  if (!resumo) return <Skeleton className="h-full min-h-72 rounded-3xl" />

  const { sequencia, estudouHoje, recorde, semana, proximoMarco } = resumo
  const emRisco = !estudouHoje && sequencia > 0
  const apagada = !estudouHoje && sequencia === 0
  const marcoAnterior =
    [...MARCOS].reverse().find((marco) => marco <= sequencia) ?? 0
  const progressoMarco =
    ((sequencia - marcoAnterior) / (proximoMarco - marcoAnterior)) * 100

  return (
    <section
      aria-label="Sequência de estudo"
      className={clsx(
        'flex h-full flex-col gap-5 rounded-3xl border p-6 shadow-lg max-md:p-4',
        estudouHoje
          ? 'border-orange-100 bg-linear-to-br from-orange-50 via-white to-amber-50'
          : 'border-gray-100 bg-white'
      )}
    >
      <div className="flex items-center gap-4">
        <div className="relative shrink-0">
          {estudouHoje && (
            <span
              aria-hidden="true"
              className="absolute inset-0 animate-ping rounded-2xl bg-orange-400/30 [animation-duration:2.5s]"
            />
          )}
          <span
            className={clsx(
              'relative flex size-16 items-center justify-center rounded-2xl text-4xl',
              estudouHoje
                ? 'bg-linear-to-br from-amber-400 via-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/30'
                : emRisco
                  ? 'bg-orange-50 text-orange-400 ring-2 ring-orange-200 ring-inset'
                  : 'bg-gray-100 text-gray-300'
            )}
          >
            <LuFlame aria-hidden="true" />
          </span>
        </div>
        <div className="min-w-0">
          <p className="flex items-baseline gap-1.5">
            <span
              className={clsx(
                'text-4xl font-black leading-none tracking-tight tabular-nums',
                estudouHoje ? 'text-orange-600' : 'text-gray-900'
              )}
            >
              {sequencia}
            </span>
            <span className="text-sm font-semibold text-gray-500">
              {sequencia === 1 ? 'dia seguido' : 'dias seguidos'}
            </span>
          </p>
          <p
            className={clsx(
              'mt-1 text-sm font-medium',
              emRisco ? 'text-orange-700' : 'text-gray-500'
            )}
          >
            {estudouHoje
              ? 'Você já estudou hoje. Sequência garantida!'
              : emRisco
                ? `Estude hoje para não perder. Faltam ${plural(resumo.horasAteMeiaNoite, 'hora', 'horas')}.`
                : 'Estude hoje para começar uma sequência.'}
          </p>
        </div>
      </div>

      <ol className="grid grid-cols-7 gap-1.5" aria-label="Últimos 7 dias">
        {semana.map((dia) => (
          <li
            key={dia.chave}
            className="flex flex-col items-center gap-1"
            aria-label={`${dia.hoje ? 'Hoje' : dia.chave}: ${dia.estudou ? 'estudou' : 'não estudou'}`}
          >
            <span
              className={clsx(
                'flex size-8 items-center justify-center rounded-full text-base',
                dia.estudou
                  ? 'bg-linear-to-br from-amber-400 to-orange-500 text-white'
                  : dia.hoje
                    ? 'border-2 border-dashed border-orange-300 text-orange-300'
                    : 'bg-gray-100 text-gray-300'
              )}
            >
              <LuFlame aria-hidden="true" />
            </span>
            <span
              className={clsx(
                'text-[11px] font-semibold',
                dia.hoje ? 'text-gray-900' : 'text-gray-400'
              )}
            >
              {dia.rotulo}
            </span>
          </li>
        ))}
      </ol>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs font-medium text-gray-500">
          <span>
            Próximo marco:{' '}
            <strong className="text-gray-900">{proximoMarco} dias</strong>
          </span>
          <span>
            {plural(proximoMarco - sequencia, 'dia', 'dias')} para chegar
          </span>
        </div>
        <div
          className="h-2 overflow-hidden rounded-full bg-gray-100"
          role="progressbar"
          aria-label="Progresso até o próximo marco"
          aria-valuenow={sequencia}
          aria-valuemin={marcoAnterior}
          aria-valuemax={proximoMarco}
        >
          <div
            className="h-full rounded-full bg-linear-to-r from-amber-400 to-orange-500 transition-[width] duration-700"
            style={{ width: `${Math.max(progressoMarco, sequencia ? 4 : 0)}%` }}
          />
        </div>
      </div>

      <div className="mt-auto grid grid-cols-2 gap-3 border-t border-gray-100 pt-4">
        <div>
          <p className="text-xs font-medium text-gray-500">Recorde</p>
          <p className="flex items-center gap-1 text-lg font-bold text-gray-900">
            <LuTrophy className="text-amber-500" aria-hidden="true" />
            {plural(recorde, 'dia', 'dias')}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium text-gray-500">
            Média de foco (7 dias)
          </p>
          {media ? (
            <p className="flex flex-wrap items-baseline gap-x-1.5 text-lg font-bold text-gray-900">
              {media.minutos} min/dia
              {media.variacao !== null &&
                Math.round(media.variacao * 100) !== 0 && (
                  <span
                    title={`Semana anterior: ${media.minutosAnterior} min/dia`}
                    className={clsx(
                      'inline-flex items-center gap-0.5 text-xs font-semibold',
                      media.variacao > 0 ? 'text-lime-700' : 'text-red-600'
                    )}
                  >
                    {media.variacao > 0 ? <LuTrendingUp /> : <LuTrendingDown />}
                    {media.variacao > 0 ? '+' : ''}
                    {Math.round(media.variacao * 100)}%
                  </span>
                )}
            </p>
          ) : (
            <Skeleton className="mt-1 h-6 w-24" />
          )}
        </div>
      </div>

      {(emRisco || apagada) && (
        <Link
          href="/pomodoro"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-linear-to-r from-amber-500 to-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:from-amber-600 hover:to-orange-600"
        >
          <LuTimer />
          {emRisco ? 'Manter a sequência agora' : 'Começar a estudar'}
        </Link>
      )}
    </section>
  )
}

export default SequenciaEstudo
