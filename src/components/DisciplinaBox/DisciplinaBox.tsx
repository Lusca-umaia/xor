import { ReactNode } from 'react'

import clsx from 'clsx'
import { VscVerified } from 'react-icons/vsc'
import { LuCircle, LuCirclePlay, LuCircleX } from 'react-icons/lu'

export const STATUS_KEYS = {
  PENDENTE: 'PENDENTE',
  CONCLUIDA: 'CONCLUIDA',
  ANDAMENTO: 'ANDAMENTO',
  REPROVADA: 'REPROVADA'
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
}

const CARD_ICON: Record<CourseCardProps['status'], ReactNode> = {
  [STATUS_KEYS.CONCLUIDA]: (
    <VscVerified className="shrink-0 text-2xl text-green-600" />
  ),
  [STATUS_KEYS.PENDENTE]: <LuCircle className="shrink-0 text-xl text-black" />,
  [STATUS_KEYS.ANDAMENTO]: (
    <LuCirclePlay className="shrink-0 text-2xl text-blue-600" />
  ),
  [STATUS_KEYS.REPROVADA]: (
    <LuCircleX className="shrink-0 text-2xl text-red-600" />
  )
}

const CARD_BADGE: Record<CourseCardProps['status'], ReactNode> = {
  [STATUS_KEYS.CONCLUIDA]: (
    <span className="self-start shrink-0 inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
      Concluída
    </span>
  ),
  [STATUS_KEYS.PENDENTE]: (
    <span className="self-start shrink-0 inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
      Pendente
    </span>
  ),
  [STATUS_KEYS.ANDAMENTO]: (
    <span className="self-start shrink-0 inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
      Em andamento
    </span>
  ),
  [STATUS_KEYS.REPROVADA]: (
    <span className="self-start shrink-0 inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/20">
      Reprovada
    </span>
  )
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

const InfoItem = ({ label, value }: { label: string; value: string }) => (
  <div className="min-w-0">
    <p className="text-[11px] font-medium uppercase tracking-wide text-gray-400">
      {label}
    </p>
    <p title={value} className="truncate text-xs font-semibold text-gray-700">
      {value}
    </p>
  </div>
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
  handleChangeNota
}) => {
  const interativo = Boolean(onClick)
  const exibeNota =
    status === STATUS_KEYS.CONCLUIDA || status === STATUS_KEYS.REPROVADA

  return (
    <div
      onClick={onClick}
      className={clsx(
        'border-l-[6px] flex flex-col bg-white rounded-2xl rounded-l-lg space-y-3 shadow-md p-4',
        {
          'border-green-600': status === STATUS_KEYS.CONCLUIDA,
          'border-black': status === STATUS_KEYS.PENDENTE,
          'border-blue-600': status === STATUS_KEYS.ANDAMENTO,
          'border-red-600': status === STATUS_KEYS.REPROVADA,
          'cursor-pointer hover:scale-105 duration-200': interativo
        }
      )}
    >
      <div className="flex items-start justify-between gap-1.5">
        <span className="flex min-w-0 items-center gap-2">
          {CARD_ICON[status]}
          <div className="min-w-0 space-y-1">
            <h3
              title={nome}
              className="line-clamp-2 font-semibold leading-none tracking-tight"
            >
              {nome}
            </h3>
            <p className="flex flex-wrap items-center gap-1.5 text-sm leading-none font-medium text-gray-600">
              <span>{codigo}</span>
              <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gray-500">
                {CARATER_LABEL[carater]}
              </span>
            </p>
          </div>
        </span>
        {CARD_BADGE[status]}
      </div>

      <div className="grid grid-cols-2 gap-x-3 gap-y-2 rounded-xl bg-gray-50/80 p-2.5">
        <InfoItem label="Carga horária" value={`${cargaHoraria}h`} />
        {periodo && <InfoItem label="Período" value={periodo} />}
        {situacao && (
          <InfoItem label="Situação" value={formatarSituacao(situacao)} />
        )}
        {typeof frequencia === 'number' && (
          <InfoItem label="Frequência" value={`${frequencia}%`} />
        )}
        {exibeNota && (
          <InfoItem
            label="Nota"
            value={typeof nota === 'number' ? formatarNota(nota) : '—'}
          />
        )}
      </div>

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
            className="block w-16 rounded-md border-0 p-1.5 text-sm font-medium text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 outline-indigo-700 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600"
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
        <span className="inline-flex w-fit items-center rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-indigo-600 ring-1 ring-inset ring-indigo-600/10">
          {tipoComponente}
        </span>
      )}
    </div>
  )
}

export default DisciplinaBox
