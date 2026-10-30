import clsx from 'clsx'
import { ReactNode } from 'react'
import { LuInfo, LuTriangleAlert } from 'react-icons/lu'

export const Card: React.FC<{ children: ReactNode; className?: string }> = ({
  children,
  className
}) => (
  <div
    className={clsx(
      'bg-white border border-gray-100 rounded-2xl shadow-lg p-6 max-md:p-4 space-y-4',
      className
    )}
  >
    {children}
  </div>
)

export const AvisoDemo = () => (
  <div
    role="note"
    className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
  >
    <LuTriangleAlert className="mt-0.5 shrink-0" />
    <p>
      <strong>Modo demonstração:</strong> o histórico, as notas, os horários e
      os eventos de exemplo são <strong>fictícios</strong> e não representam um
      estudante real. As disciplinas e pré-requisitos vêm da matriz de Ciência
      da Computação (currículo 2024.1). Os cálculos são estimativas do app e{' '}
      <strong>não substituem o SIGAA</strong>.
    </p>
  </div>
)

// Transparência: toda estimativa ou alerta mostra a regra e os dados usados.
export const Explicacao: React.FC<{ titulo?: string; children: ReactNode }> = ({
  titulo = 'Por que este resultado?',
  children
}) => (
  <details className="group rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-600">
    <summary className="flex cursor-pointer items-center gap-2 font-semibold text-gray-700">
      <LuInfo className="text-xor-navy" />
      {titulo}
    </summary>
    <div className="mt-2 space-y-1">{children}</div>
  </details>
)

export const Estatistica: React.FC<{
  rotulo: string
  valor: string
  detalhe?: string
}> = ({ rotulo, valor, detalhe }) => (
  <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
      {rotulo}
    </p>
    <p className="text-3xl font-bold text-gray-900">{valor}</p>
    {detalhe && <p className="text-xs text-gray-500">{detalhe}</p>}
  </div>
)

export const formatarNota = (n: number | null) =>
  n === null ? '—' : n.toFixed(2).replace('.', ',')
