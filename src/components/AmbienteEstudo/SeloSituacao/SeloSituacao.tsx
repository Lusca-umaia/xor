import clsx from 'clsx'
import { SituacaoCadeira } from '@/@types/AmbienteEstudo'

// Mesmas cores dos selos do DisciplineCard da progressão de curso.
export const SITUACOES: Record<
  SituacaoCadeira,
  { rotulo: string; selo: string; ponto: string }
> = {
  ANDAMENTO: {
    rotulo: 'Em andamento',
    selo: 'bg-xor-navy/5 text-xor-navy ring-xor-navy/20',
    ponto: 'bg-xor-navy'
  },
  APROVADA: {
    rotulo: 'Concluída',
    selo: 'bg-lime-50 text-lime-800 ring-lime-600/20',
    ponto: 'bg-lime-500'
  },
  REPROVADA: {
    rotulo: 'Reprovada',
    selo: 'bg-red-50 text-red-700 ring-red-600/20',
    ponto: 'bg-red-500'
  },
  TRANCADA: {
    rotulo: 'Trancada',
    selo: 'bg-amber-50 text-amber-800 ring-amber-600/20',
    ponto: 'bg-amber-500'
  }
}

export default function SeloSituacao({
  situacao,
  className
}: {
  situacao: SituacaoCadeira
  className?: string
}) {
  const { rotulo, selo, ponto } = SITUACOES[situacao]
  return (
    <span
      className={clsx(
        'inline-flex shrink-0 items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset',
        selo,
        className
      )}
    >
      <span className={clsx('size-1.5 rounded-full', ponto)} aria-hidden />
      {rotulo}
    </span>
  )
}
