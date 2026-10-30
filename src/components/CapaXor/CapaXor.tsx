import clsx from 'clsx'
import { ReactNode } from 'react'

interface CapaXorProps {
  className?: string
  children?: ReactNode
}

// Faixa nas cores do logo, com os degraus e a seta de evolução.
const CapaXor: React.FC<CapaXorProps> = ({ className, children }) => (
  <div
    className={clsx(
      'relative overflow-hidden bg-linear-to-br from-xor-navy via-xor-navy to-xor-slate',
      className
    )}
  >
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 opacity-15 [background-image:radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"
    />
    <div
      aria-hidden="true"
      className="pointer-events-none absolute -top-24 -right-16 size-72 rounded-full bg-xor-lime/30 blur-3xl"
    />
    <div
      aria-hidden="true"
      className="pointer-events-none absolute -bottom-28 left-1/4 size-64 rounded-full bg-xor-slate/60 blur-3xl"
    />
    <svg
      viewBox="0 0 120 80"
      aria-hidden="true"
      className="pointer-events-none absolute right-6 bottom-0 h-28 max-md:h-20"
    >
      <path d="M0 80V58h26V38h26V18h26v62z" className="fill-white/10" />
      <g
        fill="none"
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="stroke-xor-lime"
      >
        <path d="M60 44 94 12" />
        <path d="M78 8h18v18" />
      </g>
    </svg>
    {children && <div className="relative h-full">{children}</div>}
  </div>
)

export default CapaXor
