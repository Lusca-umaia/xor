'use client'

import clsx from 'clsx'
import { LuClock, LuTriangleAlert } from 'react-icons/lu'
import { EstadoCronometro } from '@/hooks/ambienteEstudo/useCronometro'
import { formatarCronometro } from '@/utils/ambienteEstudo/formatar'

const ESTILOS: Record<EstadoCronometro, string> = {
  NORMAL: 'bg-gray-900 text-white',
  ALERTA_10: 'bg-amber-100 text-amber-900 ring-2 ring-amber-400',
  ALERTA_5: 'bg-red-100 text-red-900 ring-2 ring-red-500',
  ESGOTADO: 'bg-red-600 text-white'
}

const DESCRICAO: Record<EstadoCronometro, string> = {
  NORMAL: 'Tempo restante',
  ALERTA_10: 'Menos de 10 minutos',
  ALERTA_5: 'Menos de 5 minutos',
  ESGOTADO: 'Tempo esgotado'
}

export default function Cronometro({
  restanteSeg,
  estado
}: {
  restanteSeg: number
  estado: EstadoCronometro
}) {
  const alerta = estado === 'ALERTA_5' || estado === 'ESGOTADO'
  return (
    <div
      role="timer"
      aria-label={`${DESCRICAO[estado]}: ${formatarCronometro(restanteSeg)}`}
      className={clsx(
        'inline-flex items-center gap-2 rounded-xl px-3 py-1.5 font-mono text-lg font-bold tabular-nums transition-colors',
        ESTILOS[estado]
      )}
    >
      {alerta ? <LuTriangleAlert aria-hidden /> : <LuClock aria-hidden />}
      {formatarCronometro(restanteSeg)}
    </div>
  )
}
