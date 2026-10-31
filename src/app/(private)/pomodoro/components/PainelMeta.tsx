import clsx from 'clsx'
import { LuCalendarDays, LuClock, LuFlame, LuTarget } from 'react-icons/lu'
import Skeleton from '@/components/Skeleton/Skeleton'
import { formatarDuracao } from '../consts'
import type { ResumoFoco } from '../utils/estatisticas'

interface PainelMetaProps {
  resumo: ResumoFoco
  metaDiaria: number
  minutosFoco: number
  carregando: boolean
}

const PainelMeta: React.FC<PainelMetaProps> = ({
  resumo,
  metaDiaria,
  minutosFoco,
  carregando
}) => {
  const feitos = resumo.hoje.pomodoros
  const faltam = Math.max(0, metaDiaria - feitos)
  const percentual = Math.min(100, (feitos / metaDiaria) * 100)

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-lg p-6 max-md:p-4 space-y-5">
      <div className="space-y-3">
        <span className="flex items-center gap-2 text-base font-bold tracking-tight">
          <LuTarget className="text-xor-navy" />
          Meta de hoje
        </span>
        {carregando ? (
          <Skeleton className="h-16 w-full" />
        ) : (
          <>
            <p className="text-3xl font-semibold tabular-nums">
              {feitos}
              <span className="text-lg text-gray-400 font-medium">
                {' '}
                / {metaDiaria} pomodoros
              </span>
            </p>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
              <div
                className={clsx(
                  'h-full rounded-full transition-[width] duration-700',
                  faltam ? 'bg-xor-navy' : 'bg-xor-lime'
                )}
                style={{ width: `${percentual}%` }}
              />
            </div>
            <p className="text-sm text-gray-500 font-medium">
              {faltam
                ? `Faltam ${faltam} ${faltam === 1 ? 'pomodoro' : 'pomodoros'} (~${formatarDuracao(faltam * minutosFoco * 60)} de foco).`
                : 'Meta batida! Cada pomodoro a mais é bônus.'}
            </p>
          </>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2">
        <Indicador
          icon={
            <LuFlame
              className={clsx(
                resumo.sequenciaAtual ? 'text-orange-500' : 'text-gray-400'
              )}
            />
          }
          titulo="Sequência de foco"
          valor={`${resumo.sequenciaAtual} ${resumo.sequenciaAtual === 1 ? 'dia' : 'dias'}`}
          detalhe={`Recorde: ${resumo.melhorSequencia}`}
          carregando={carregando}
        />
        <Indicador
          icon={<LuClock className="text-xor-slate" />}
          titulo="Hoje"
          valor={formatarDuracao(resumo.hoje.segundos)}
          carregando={carregando}
        />
        <Indicador
          icon={<LuCalendarDays className="text-xor-slate" />}
          titulo="7 dias"
          valor={formatarDuracao(resumo.segundosSemana)}
          carregando={carregando}
        />
      </div>
    </div>
  )
}

interface IndicadorProps {
  icon: React.ReactNode
  titulo: string
  valor: string
  detalhe?: string
  carregando: boolean
}

const Indicador: React.FC<IndicadorProps> = ({
  icon,
  titulo,
  valor,
  detalhe,
  carregando
}) => (
  <div className="rounded-xl bg-gray-50 p-3 space-y-1">
    <span className="flex items-center gap-1 text-xs font-medium text-gray-500">
      {icon}
      {titulo}
    </span>
    {carregando ? (
      <Skeleton className="h-5 w-12" />
    ) : (
      <p className="text-base font-semibold leading-tight">{valor}</p>
    )}
    {detalhe && !carregando && (
      <p className="text-xs text-gray-400">{detalhe}</p>
    )}
  </div>
)

export default PainelMeta
