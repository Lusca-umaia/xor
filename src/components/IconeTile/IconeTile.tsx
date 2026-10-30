import clsx from 'clsx'
import { ReactNode } from 'react'

// Quadrado arredondado em azul do logo que destaca o ícone de uma seção.
const IconeTile: React.FC<{ children: ReactNode; className?: string }> = ({
  children,
  className
}) => (
  <span
    className={clsx(
      'flex size-10 shrink-0 items-center justify-center rounded-xl bg-xor-navy/5 text-xl text-xor-navy ring-1 ring-inset ring-xor-navy/10',
      className
    )}
  >
    {children}
  </span>
)

export default IconeTile
