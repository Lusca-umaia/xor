import clsx from 'clsx'
import { iniciais } from '@/utils/auxiliars'

interface AvatarProps {
  nome?: string
  className?: string
}

// Círculo com as iniciais do aluno nas cores do logo.
const Avatar: React.FC<AvatarProps> = ({ nome, className }) => (
  <div
    aria-hidden="true"
    className={clsx(
      'flex shrink-0 select-none items-center justify-center rounded-full bg-linear-to-br from-xor-navy to-xor-slate font-bold tracking-wide text-white',
      className
    )}
  >
    {nome && iniciais(nome)}
  </div>
)

export default Avatar
