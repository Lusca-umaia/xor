import clsx from 'clsx'
import { LuChartColumn } from 'react-icons/lu'
import { formatarDuracao } from '../consts'
import type { DiaFoco } from '../utils/estatisticas'

interface GraficoSemanaProps {
  dias: DiaFoco[]
  // Minutos de foco equivalentes à meta diária.
  metaMinutos: number
}

const GraficoSemana: React.FC<GraficoSemanaProps> = ({ dias, metaMinutos }) => {
  const escala = Math.max(metaMinutos * 60, ...dias.map((d) => d.segundos), 1)
  const alturaMeta = ((metaMinutos * 60) / escala) * 100
  // Média diária das barras do gráfico (dias sem foco contam como zero).
  const mediaSegundos =
    dias.reduce((total, d) => total + d.segundos, 0) / Math.max(dias.length, 1)
  const alturaMedia = (mediaSegundos / escala) * 100

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-lg p-6 max-md:p-4 space-y-4">
      <span className="flex items-center gap-2 text-base font-bold tracking-tight">
        <LuChartColumn className="text-xor-navy" />
        Últimos 7 dias
      </span>

      <div className="relative h-36">
        <div
          aria-hidden="true"
          className="absolute inset-x-0 border-t-2 border-dashed border-xor-lime z-10"
          style={{ bottom: `${alturaMeta}%` }}
        />
        {mediaSegundos > 0 && (
          <div
            aria-hidden="true"
            className="absolute inset-x-0 border-t-2 border-dotted border-orange-400 z-10 transition-[bottom] duration-700"
            style={{ bottom: `${alturaMedia}%` }}
          />
        )}
        <div className="grid h-full grid-cols-7 items-end gap-2">
          {dias.map((dia) => {
            const bateuMeta = dia.segundos >= metaMinutos * 60
            return (
              <div
                key={dia.chave}
                className="group relative flex h-full items-end"
                title={`${dia.pomodoros} pomodoros · ${formatarDuracao(dia.segundos)}`}
              >
                <div
                  className={clsx(
                    'w-full rounded-t-md transition-[height] duration-700',
                    bateuMeta
                      ? 'bg-xor-lime'
                      : dia.hoje
                        ? 'bg-xor-navy'
                        : 'bg-xor-slate/40 group-hover:bg-xor-slate/60'
                  )}
                  style={{
                    height: dia.segundos
                      ? `${Math.max(4, (dia.segundos / escala) * 100)}%`
                      : '2px'
                  }}
                />
              </div>
            )
          })}
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 text-center">
        {dias.map((dia) => (
          <span
            key={dia.chave}
            className={clsx(
              'text-xs font-medium',
              dia.hoje ? 'text-gray-900 font-bold' : 'text-gray-400'
            )}
          >
            {dia.hoje ? 'hoje' : dia.rotulo}
          </span>
        ))}
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
        <span className="inline-flex items-center gap-1.5">
          <span
            aria-hidden="true"
            className="w-5 border-t-2 border-dashed border-xor-lime"
          />
          Meta diária: {formatarDuracao(metaMinutos * 60)}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span
            aria-hidden="true"
            className="w-5 border-t-2 border-dotted border-orange-400"
          />
          Média: {formatarDuracao(Math.round(mediaSegundos))}/dia
        </span>
      </div>
    </div>
  )
}

export default GraficoSemana
