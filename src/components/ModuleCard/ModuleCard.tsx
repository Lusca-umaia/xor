'use client'

import { useRouter } from 'next/navigation'
import { ReactNode, useCallback } from 'react'

interface ModuleCardProps {
  nome: string
  descricao: string
  path: string
  icon: ReactNode
}

const ModuleCard: React.FC<ModuleCardProps> = ({
  descricao,
  nome,
  path,
  icon
}) => {
  const router = useRouter()

  const handleNavigation = useCallback(() => {
    router.push(path)
  }, [path, router])

  return (
    <div className="bg-white border flex flex-col gap-6 border-gray-100 rounded-2xl shadow-lg p-6">
      {icon}
      <div className="flex text-center flex-col gap-2">
        <h3 className="text-lg font-bold leading-none tracking-tight">
          {nome}
        </h3>
        <p className="text-sm text-gray-400">{descricao}</p>
      </div>
      <button
        type="button"
        onClick={handleNavigation}
        className="w-fit mt-auto rounded-xl block mx-auto bg-white px-3.5 py-3.5 cursor-pointer text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
      >
        Entrar na sessão
      </button>
    </div>
  )
}

export default ModuleCard
