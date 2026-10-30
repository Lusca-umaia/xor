import { ReactNode } from 'react'

interface EstadoVazioProps {
  icone: ReactNode
  titulo: string
  descricao?: ReactNode
  acao?: ReactNode
}

export default function EstadoVazio({
  icone,
  titulo,
  descricao,
  acao
}: EstadoVazioProps) {
  return (
    <div className="flex flex-col items-center rounded-2xl border-2 border-dashed border-gray-200 bg-white px-6 py-12 text-center">
      <div className="mb-3 flex size-14 items-center justify-center rounded-full bg-gray-100 text-2xl text-gray-700">
        {icone}
      </div>
      <h3 className="text-base font-bold text-gray-900">{titulo}</h3>
      {descricao && (
        <p className="mt-1 max-w-md text-sm text-gray-500">{descricao}</p>
      )}
      {acao && <div className="mt-5">{acao}</div>}
    </div>
  )
}
