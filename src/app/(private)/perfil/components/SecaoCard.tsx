import clsx from 'clsx'
import { ReactNode } from 'react'
import { LuCircleAlert, LuCircleCheck, LuMailWarning } from 'react-icons/lu'
import type { ZodError } from 'zod'
import IconeTile from '@/components/IconeTile/IconeTile'

interface SecaoCardProps {
  icon: ReactNode
  titulo: string
  descricao?: string
  children: ReactNode
  // Faixa inferior com as ações do formulário.
  rodape?: ReactNode
}

export const SecaoCard: React.FC<SecaoCardProps> = ({
  icon,
  titulo,
  descricao,
  children,
  rodape
}) => (
  <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-lg">
    <div className="space-y-6 p-6 max-md:space-y-4 max-md:p-4">
      <header className="flex items-start gap-3">
        <IconeTile>{icon}</IconeTile>
        <div className="space-y-0.5">
          <h3 className="text-lg font-bold leading-tight tracking-tight max-md:text-base">
            {titulo}
          </h3>
          {descricao && <p className="text-sm text-gray-500">{descricao}</p>}
        </div>
      </header>
      {children}
    </div>
    {rodape && (
      <div className="flex flex-wrap items-center justify-end gap-3 border-t border-gray-100 bg-gray-50/70 px-6 py-4 max-md:px-4">
        {rodape}
      </div>
    )}
  </section>
)

const AVISO_ESTILOS = {
  sucesso: {
    classe: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
    icon: <LuCircleCheck className="mt-0.5 shrink-0 text-base" />
  },
  erro: {
    classe: 'bg-red-50 text-red-700 ring-red-200',
    icon: <LuCircleAlert className="mt-0.5 shrink-0 text-base" />
  },
  pendente: {
    classe: 'bg-amber-50 text-amber-800 ring-amber-200',
    icon: <LuMailWarning className="mt-0.5 shrink-0 text-base" />
  }
}

interface AvisoProps {
  tipo: keyof typeof AVISO_ESTILOS
  children: ReactNode
  className?: string
}

export const Aviso: React.FC<AvisoProps> = ({ tipo, children, className }) => {
  const { classe, icon } = AVISO_ESTILOS[tipo]
  return (
    <div
      role={tipo === 'erro' ? 'alert' : 'status'}
      className={clsx(
        'flex items-start gap-2 rounded-xl px-3 py-2.5 text-sm font-medium ring-1 ring-inset',
        classe,
        className
      )}
    >
      {icon}
      <div>{children}</div>
    </div>
  )
}

// Primeira mensagem de erro de cada campo, no formato usado pelos inputs.
export const errosPorCampo = (error: ZodError) =>
  Object.fromEntries(
    Object.entries(error.flatten().fieldErrors).map(([campo, mensagens]) => [
      campo,
      (mensagens as string[] | undefined)?.[0] ?? ''
    ])
  ) as Record<string, string>

export const BOTAO_PRIMARIO =
  'inline-flex cursor-pointer items-center gap-2 rounded-md bg-xor-navy px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-xor-navy/90 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-xor-navy'

export const BOTAO_SECUNDARIO =
  'inline-flex cursor-pointer items-center gap-2 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-xs ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60'
