import { ReactNode } from 'react'

interface EstadoVazioProps {
  icon: ReactNode
  titulo: string
  descricao?: ReactNode
  acao?: ReactNode
}

const EstadoVazio: React.FC<EstadoVazioProps> = ({
  icon,
  titulo,
  descricao,
  acao
}) => (
  <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-gray-200 bg-white/60 px-6 py-12 text-center">
    <span className="flex size-12 items-center justify-center rounded-full bg-xor-navy/5 text-2xl text-xor-navy">
      {icon}
    </span>
    <div className="space-y-1">
      <p className="font-semibold text-gray-900">{titulo}</p>
      {descricao && (
        <p className="max-w-md text-sm text-gray-500">{descricao}</p>
      )}
    </div>
    {acao}
  </div>
)

export default EstadoVazio
