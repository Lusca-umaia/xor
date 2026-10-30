import { ReactNode } from 'react'

import clsx from 'clsx'
import {
  LuCalendar,
  LuClock,
  LuHistory,
  LuUserCheck,
  LuX
} from 'react-icons/lu'

export const STATUS_KEYS = {
  PENDENTE: 'PENDENTE',
  CONCLUIDA: 'CONCLUIDA',
  ANDAMENTO: 'ANDAMENTO',
  REPROVADA: 'REPROVADA',
  TRANCADA: 'TRANCADA'
} as const

interface CourseCardProps {
  nome: string
  codigo: string
  cargaHoraria: number
  carater: 'OBRIGATORIA' | 'OPTATIVA'
  status: keyof typeof STATUS_KEYS
  nota?: number | null
  onClick?: () => void
  handleChangeNota?: (value: string) => void
  situacao?: string | null
  frequencia?: number | null
  periodo?: string | null
  docente?: string | null
  tipoComponente?: string | null
  editavel?: boolean
  onRemover?: () => void
}

// Cor de destaque, selo e ponto de cada status.
const STATUS_ESTILO: Record<
  CourseCardProps['status'],
  { label: string; destaque: string; selo: string; ponto: string }
> = {
  [STATUS_KEYS.CONCLUIDA]: {
    label: 'Concluída',
    destaque: 'bg-xor-lime',
    selo: 'bg-lime-50 text-lime-800 ring-lime-600/20',
    ponto: 'bg-lime-500'
  },
  [STATUS_KEYS.ANDAMENTO]: {
    label: 'Em andamento',
    destaque: 'bg-xor-navy',
    selo: 'bg-xor-navy/5 text-xor-navy ring-xor-navy/20',
    ponto: 'bg-xor-navy'
  },
  [STATUS_KEYS.PENDENTE]: {
    label: 'Pendente',
    destaque: 'bg-xor-slate/40',
    selo: 'bg-gray-50 text-gray-600 ring-gray-500/15',
    ponto: 'bg-gray-400'
  },
  [STATUS_KEYS.REPROVADA]: {
    label: 'Reprovada',
    destaque: 'bg-red-500',
    selo: 'bg-red-50 text-red-700 ring-red-600/20',
    ponto: 'bg-red-500'
  },
  [STATUS_KEYS.TRANCADA]: {
    label: 'Trancada',
    destaque: 'bg-amber-400',
    selo: 'bg-amber-50 text-amber-800 ring-amber-600/20',
    ponto: 'bg-amber-500'
  }
}

const CARATER_LABEL: Record<CourseCardProps['carater'], string> = {
  OBRIGATORIA: 'Obrigatória',
  OPTATIVA: 'Optativa'
}

function formatarNota(nota: number): string {
  return nota.toFixed(1).replace('.', ',')
}

function formatarSituacao(situacao: string): string {
  const texto = situacao.trim().toLowerCase()

  return texto.charAt(0).toUpperCase() + texto.slice(1)
}

const Meta = ({ icon, children }: { icon: ReactNode; children: string }) => (
  <span title={children} className="flex min-w-0 items-center gap-1">
    <span className="shrink-0 text-gray-400">{icon}</span>
    <span className="truncate">{children}</span>
  </span>
)

const DisciplinaBox: React.FC<CourseCardProps> = ({
  codigo,
  nome,
  nota,
  status,
  cargaHoraria,
  situacao,
  frequencia,
  periodo,
  docente,
  tipoComponente,
  carater,
  editavel = false,
  onClick,
  handleChangeNota,
  onRemover
}) => {
  const interativo = Boolean(onClick)
  const exibeNota =
    status === STATUS_KEYS.CONCLUIDA || status === STATUS_KEYS.REPROVADA
  const estilo = STATUS_ESTILO[status]

  return (
    <div
      onClick={onClick}
      className={clsx(
        'relative flex flex-col gap-3 rounded-2xl border border-gray-100 bg-white p-4 pt-5 shadow-sm',
        interativo &&
          'cursor-pointer transition duration-200 hover:-translate-y-0.5 hover:border-gray-200 hover:shadow-lg'
      )}
    >
      <span
        aria-hidden="true"
        className={clsx(
          'absolute top-0 left-4 h-1 w-10 rounded-b-full',
          estilo.destaque
        )}
      />

      {onRemover && (
        <button
          type="button"
          title="Remover disciplina"
          onClick={(e) => {
            e.stopPropagation()
            onRemover()
          }}
          className="absolute -top-2 -right-2 cursor-pointer rounded-full bg-white p-1 text-gray-500 shadow ring-1 ring-gray-200 hover:text-red-600"
        >
          <LuX className="text-sm" />
        </button>
      )}

      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-1.5">
          <span className="truncate font-mono text-xs font-semibold text-gray-500">
            {codigo}
          </span>
          <span className="shrink-0 rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gray-500">
            {CARATER_LABEL[carater]}
          </span>
        </div>
        <span
          className={clsx(
            'inline-flex shrink-0 items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset',
            estilo.selo
          )}
        >
          <span className={clsx('size-1.5 rounded-full', estilo.ponto)} />
          {estilo.label}
        </span>
      </div>

      <h3
        title={nome}
        className="line-clamp-2 font-semibold leading-snug tracking-tight text-gray-900"
      >
        {nome}
      </h3>

      <div className="mt-auto flex items-end justify-between gap-3 border-t border-gray-100 pt-3">
        <div className="flex min-w-0 flex-wrap gap-x-3 gap-y-1 text-xs font-medium text-gray-500">
          <Meta icon={<LuClock />}>{`${cargaHoraria}h`}</Meta>
          {periodo && <Meta icon={<LuCalendar />}>{periodo}</Meta>}
          {typeof frequencia === 'number' && (
            <Meta icon={<LuUserCheck />}>{`${frequencia}%`}</Meta>
          )}
        </div>
        {exibeNota && (
          <div className="flex shrink-0 flex-col items-end leading-none">
            <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
              Nota
            </span>
            <span
              className={clsx(
                'mt-1 text-lg font-bold',
                status === STATUS_KEYS.REPROVADA
                  ? 'text-red-600'
                  : 'text-gray-900'
              )}
            >
              {typeof nota === 'number' ? formatarNota(nota) : '—'}
            </span>
          </div>
        )}
      </div>

      {situacao && (
        <p className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
          <LuHistory className="shrink-0 text-gray-400" />
          {formatarSituacao(situacao)}
        </p>
      )}

      {exibeNota && editavel && (
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-semibold text-gray-600">
            Ajustar nota
          </span>
          <input
            type="number"
            value={nota ?? ''}
            min={0}
            step=".1"
            max={10}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) =>
              handleChangeNota && handleChangeNota(e.target.value)
            }
            className="block w-16 rounded-md border-0 p-1.5 text-sm font-medium text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 outline-xor-navy placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-xor-navy"
          />
        </div>
      )}

      {docente && (
        <p className="text-[11px] leading-snug text-gray-500">
          <span className="font-semibold text-gray-600">Docente(s): </span>
          <span className="line-clamp-2">{docente}</span>
        </p>
      )}

      {tipoComponente && (
        <span className="inline-flex w-fit items-center rounded-md bg-xor-navy/5 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-xor-navy ring-1 ring-inset ring-xor-navy/10">
          {tipoComponente}
        </span>
      )}
    </div>
  )
}

export default DisciplinaBox
