import clsx from 'clsx'
import Link from 'next/link'
import { ButtonHTMLAttributes, ComponentProps, ReactNode } from 'react'
import { LuLoader } from 'react-icons/lu'

const VARIANTES = {
  primario: 'bg-black text-white hover:bg-gray-800 disabled:bg-gray-300',
  secundario:
    'bg-white text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:text-gray-400',
  fantasma:
    'text-gray-700 hover:bg-gray-100 disabled:text-gray-300 shadow-none',
  perigo: 'bg-red-600 text-white hover:bg-red-700 disabled:bg-red-300'
} as const

const TAMANHOS = {
  sm: 'px-2.5 py-1.5 text-xs gap-1.5',
  md: 'px-3 py-2 text-sm gap-2',
  lg: 'px-4 py-3 text-sm gap-2'
} as const

type Variante = keyof typeof VARIANTES
type Tamanho = keyof typeof TAMANHOS

export const classesBotao = (variante: Variante, tamanho: Tamanho) =>
  clsx(
    'inline-flex items-center justify-center rounded-md font-semibold shadow-sm transition-colors not-disabled:cursor-pointer disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black',
    VARIANTES[variante],
    TAMANHOS[tamanho]
  )

interface BotaoProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: Variante
  tamanho?: Tamanho
  icone?: ReactNode
  carregando?: boolean
}

export default function Botao({
  variante = 'secundario',
  tamanho = 'md',
  icone,
  carregando = false,
  disabled,
  className,
  children,
  type = 'button',
  ...props
}: BotaoProps) {
  return (
    <button
      type={type}
      disabled={disabled || carregando}
      className={clsx(classesBotao(variante, tamanho), className)}
      {...props}
    >
      {carregando ? (
        <LuLoader className="animate-spin shrink-0" aria-hidden />
      ) : (
        icone
      )}
      {children}
    </button>
  )
}

interface LinkBotaoProps extends ComponentProps<typeof Link> {
  variante?: Variante
  tamanho?: Tamanho
  icone?: ReactNode
}

/** Link com aparência de botão (navegação, não ação). */
export function LinkBotao({
  variante = 'secundario',
  tamanho = 'md',
  icone,
  className,
  children,
  ...props
}: LinkBotaoProps) {
  return (
    <Link
      className={clsx(classesBotao(variante, tamanho), className)}
      {...props}
    >
      {icone}
      {children}
    </Link>
  )
}
