'use client'

import { useState } from 'react'
import FormInput from '@/components/FormInput/FormInput'
import { STEP_KEYS } from '@/helpers/consts'
import Link from 'next/link'
import { z } from 'zod'
import { useRouter } from 'next/navigation'

const schemaLogin = z.object({
  email: z.string().min(1, 'Email é obrigatório').email('Email inválido'),
  senha: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres')
})

type LoginFormData = {
  email: string
  senha: string
}

export default function Login() {
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    senha: ''
  })

  const router = useRouter()

  const [errors, setErrors] = useState<
    Partial<Record<keyof LoginFormData, string>>
  >({})

  const handleChange = (key: keyof LoginFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: '' })) // limpa erro ao digitar
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const result = schemaLogin.safeParse(formData)

    if (!result.success) {
      const fieldErrors: Partial<Record<keyof LoginFormData, string>> = {}
      result.error.errors.forEach((err) => {
        const key = err.path[0] as keyof LoginFormData
        fieldErrors[key] = err.message
      })
      setErrors(fieldErrors)
      return
    }

    setErrors({})

    router.push('/home')
  }

  return (
    <div className="flex bg-white min-h-screen flex-1">
      <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div>
            <img alt="Logo" src="/logo.png" className="mx-auto h-20 w-auto" />
            <h2 className="mt-8 text-2xl/9 font-bold tracking-tight text-gray-900">
              Entre na sua conta
            </h2>
            <p className="mt-2 text-sm/6 text-gray-500">
              Não possui conta?{' '}
              <Link
                href={`/register?step=${STEP_KEYS.PERSONAL_INFORMATION}`}
                className="font-semibold text-indigo-600 hover:text-indigo-500"
              >
                Realizar cadastro
              </Link>
            </p>
          </div>

          <div className="mt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <FormInput
                value={formData.email}
                label="Email"
                type="text"
                name="email"
                error={errors.email}
                handleChange={(value) => handleChange('email', value)}
              />

              <FormInput
                value={formData.senha}
                label="Senha"
                type="password"
                name="senha"
                error={errors.senha}
                handleChange={(value) => handleChange('senha', value)}
              />

              <button
                type="submit"
                className="flex cursor-pointer w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Entrar
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="relative hidden w-0 flex-1 lg:block">
        <img
          alt="Foto"
          src="https://images.unsplash.com/photo-1496917756835-20cb06e75b4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1908&q=80"
          className="absolute inset-0 size-full object-cover"
        />
      </div>
    </div>
  )
}
