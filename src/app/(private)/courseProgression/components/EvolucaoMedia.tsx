import clsx from 'clsx'
import { LuChartLine, LuTrendingDown, LuTrendingUp } from 'react-icons/lu'
import IconeTile from '@/components/IconeTile/IconeTile'
import type { PontoMedia } from '../utils/evolucaoMedia'

const L = 600
const A = 200
const M = { e: 30, d: 16, t: 14, b: 30 }
// Média para aprovação direta na UFC.
const MEDIA_APROVACAO = 7

const formatar = (nota: number) =>
  nota.toLocaleString('pt-BR', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  })

function Estatistica({
  rotulo,
  valor,
  detalhe
}: {
  rotulo: string
  valor: React.ReactNode
  detalhe?: React.ReactNode
}) {
  return (
    <div className="rounded-xl bg-gray-50 px-3 py-2 ring-1 ring-inset ring-gray-100">
      <p className="text-xs font-medium text-gray-500">{rotulo}</p>
      <p className="text-xl font-bold text-gray-900 tabular-nums">{valor}</p>
      {detalhe && <p className="text-xs text-gray-500">{detalhe}</p>}
    </div>
  )
}

/** Média por período e acumulada, ao longo dos semestres. */
const EvolucaoMedia: React.FC<{ pontos: PontoMedia[] }> = ({ pontos }) => {
  if (pontos.length === 0) return null

  const ultimo = pontos[pontos.length - 1]
  const penultimo = pontos[pontos.length - 2]
  const melhor = pontos.reduce((a, b) => (b.media > a.media ? b : a))
  const variacao = penultimo ? ultimo.media - penultimo.media : null

  const x = (i: number) =>
    pontos.length > 1
      ? M.e + (i / (pontos.length - 1)) * (L - M.e - M.d)
      : (L + M.e - M.d) / 2
  const y = (v: number) => M.t + (1 - v / 10) * (A - M.t - M.b)
  const linha = (chave: 'media' | 'acumulada') =>
    pontos.map((p, i) => `${x(i)},${y(p[chave])}`).join(' ')

  return (
    <section className="space-y-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-lg max-md:p-4">
      <header className="flex items-center gap-3">
        <IconeTile>
          <LuChartLine />
        </IconeTile>
        <div>
          <h2 className="text-lg font-bold leading-tight tracking-tight max-md:text-base">
            Evolução da média
          </h2>
          <p className="text-sm text-gray-500">
            Notas por período, ponderadas pela carga horária
          </p>
        </div>
      </header>

      <div className="grid grid-cols-3 gap-3 max-sm:grid-cols-1">
        <Estatistica
          rotulo="Média geral"
          valor={formatar(ultimo.acumulada)}
          detalhe={`em ${pontos.length} ${pontos.length === 1 ? 'período' : 'períodos'}`}
        />
        <Estatistica
          rotulo={`Último período (${ultimo.periodo})`}
          valor={
            <span className="inline-flex items-baseline gap-2">
              {formatar(ultimo.media)}
              {variacao !== null && Math.abs(variacao) >= 0.05 && (
                <span
                  className={clsx(
                    'inline-flex items-center gap-0.5 text-xs font-semibold',
                    variacao > 0 ? 'text-lime-700' : 'text-red-600'
                  )}
                >
                  {variacao > 0 ? <LuTrendingUp /> : <LuTrendingDown />}
                  {variacao > 0 ? '+' : ''}
                  {formatar(variacao)}
                </span>
              )}
            </span>
          }
          detalhe={
            penultimo ? `antes: ${formatar(penultimo.media)}` : undefined
          }
        />
        <Estatistica
          rotulo="Melhor período"
          valor={formatar(melhor.media)}
          detalhe={melhor.periodo}
        />
      </div>

      <svg
        viewBox={`0 0 ${L} ${A}`}
        className="w-full"
        role="img"
        aria-label={`Evolução da média: ${pontos
          .map(
            (p) =>
              `${p.periodo}, período ${formatar(p.media)}, acumulada ${formatar(p.acumulada)}`
          )
          .join('; ')}`}
      >
        {[0, 5, MEDIA_APROVACAO, 10].map((v) => (
          <g key={v}>
            <line
              x1={M.e}
              x2={L - M.d}
              y1={y(v)}
              y2={y(v)}
              stroke={v === MEDIA_APROVACAO ? '#c6de34' : '#e5e7eb'}
              strokeDasharray={v === MEDIA_APROVACAO ? '4 3' : undefined}
            />
            <text
              x={M.e - 6}
              y={y(v) + 3}
              textAnchor="end"
              fontSize="10"
              fill="#9ca3af"
            >
              {v}
            </text>
          </g>
        ))}
        {pontos.length > 1 && (
          <>
            <polyline
              fill="none"
              stroke="#5e6e7c"
              strokeWidth="1.5"
              strokeDasharray="4 3"
              points={linha('media')}
            />
            <polyline
              fill="none"
              stroke="#1d3446"
              strokeWidth="2.5"
              points={linha('acumulada')}
            />
          </>
        )}
        {pontos.map((p, i) => (
          <g key={p.periodo}>
            <circle cx={x(i)} cy={y(p.media)} r="3" fill="#5e6e7c">
              <title>{`${p.periodo}: média do período ${formatar(p.media)} (${p.disciplinas} ${p.disciplinas === 1 ? 'disciplina' : 'disciplinas'})`}</title>
            </circle>
            <circle cx={x(i)} cy={y(p.acumulada)} r="4.5" fill="#1d3446">
              <title>{`${p.periodo}: média acumulada ${formatar(p.acumulada)}`}</title>
            </circle>
            <text
              x={x(i)}
              y={A - 8}
              textAnchor="middle"
              fontSize="10"
              fill="#6b7280"
            >
              {p.periodo}
            </text>
          </g>
        ))}
      </svg>

      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-0.5 w-5 rounded bg-xor-navy" aria-hidden="true" />
          Média acumulada
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span
            className="h-0 w-5 border-t-2 border-dashed border-xor-slate"
            aria-hidden="true"
          />
          Média do período
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span
            className="h-0 w-5 border-t-2 border-dashed border-xor-lime"
            aria-hidden="true"
          />
          Média para aprovação ({MEDIA_APROVACAO})
        </span>
      </div>
    </section>
  )
}

export default EvolucaoMedia
