'use client'

import { ReactNode, useState } from 'react'
import { LuEye, LuEyeOff } from 'react-icons/lu'

interface CampoSenhaProps {
  label: string
  name: string
  value: string
  autoComplete: 'current-password' | 'new-password'
  handleChange: (value: string) => void
  error?: string
  className?: string
  // Conteúdo extra logo abaixo do input (ex.: medidor de força).
  children?: ReactNode
}

// Mesmo visual do FormInput, com botão para mostrar/ocultar a senha.
const CampoSenha: React.FC<CampoSenhaProps> = ({
  label,
  name,
  value,
  autoComplete,
  handleChange,
  error,
  className,
  children
}) => {
  const [visivel, setVisivel] = useState(false)

  return (
    <div className={className}>
      <label
        htmlFor={name}
        className="text-sm font-semibold leading-6 text-gray-900"
      >
        {label}
      </label>
      <div className="relative mt-1">
        <input
          id={name}
          name={name}
          type={visivel ? 'text' : 'password'}
          value={value}
          autoComplete={autoComplete}
          onChange={(e) => handleChange(e.target.value)}
          className="block w-full rounded-md border-0 p-1.5 pr-9 text-sm font-medium text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 outline-indigo-700 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600"
        />
        <button
          type="button"
          onClick={() => setVisivel((atual) => !atual)}
          aria-label={visivel ? 'Ocultar senha' : 'Mostrar senha'}
          className="absolute inset-y-0 right-0 flex cursor-pointer items-center px-2.5 text-gray-400 hover:text-gray-700"
        >
          {visivel ? <LuEyeOff /> : <LuEye />}
        </button>
      </div>
      {children}
      {error && (
        <p className="mt-0.5 text-sm font-medium text-red-600">{error}</p>
      )}
    </div>
  )
}

export default CampoSenha
