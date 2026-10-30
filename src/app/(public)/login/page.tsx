'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { z } from 'zod'
import { LuArrowLeft, LuCircleAlert, LuCircleCheck } from 'react-icons/lu'
import AnelProgresso from '@/components/AnelProgresso/AnelProgresso'
import CampoSenha from '@/components/CampoSenha/CampoSenha'
import CapaXor from '@/components/CapaXor/CapaXor'
import FormInput from '@/components/FormInput/FormInput'
import { STEP_KEYS } from '@/helpers/consts'
import { useLogin } from '@/hooks/mutations/useLogin'
import { getErrorMessage } from '@/services/api'

const schemaLogin = z.object({
  email: z.string().min(1, 'Email é obrigatório').email('Email inválido'),
  senha: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres')
})

type LoginFormData = {
  email: string
  senha: string
}

const DESTAQUES = [
  'Progresso do curso atualizado a cada semestre',
  'Histórico do SIGAA importado direto do PDF',
  'Assistente com IA, questionários e pomodoro'
]

// Barras da prévia com dados fictícios.
const BARRAS_EXEMPLO = [
  { titulo: 'Obrigatórias', percentual: 60, cor: 'bg-xor-navy' },
  { titulo: 'Optativas', percentual: 50, cor: 'bg-xor-lime' }
]

const PainelMarca = () => (
  <CapaXor className="h-full rounded-3xl p-12 xl:p-16">
    <div className="flex h-full flex-col justify-between gap-12">
      <p className="inline-flex w-fit items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white ring-1 ring-inset ring-white/20">
        <span className="size-2 rounded-full bg-xor-lime" />
        Sua jornada acadêmica
      </p>

      <div className="max-w-md space-y-6">
        <h2 className="text-balance text-4xl font-bold tracking-tight text-white">
          Cada semestre é um degrau. Acompanhe a subida.
        </h2>
        <ul className="space-y-3">
          {DESTAQUES.map((destaque) => (
            <li
              key={destaque}
              className="flex items-center gap-3 text-sm font-medium text-white/80"
            >
              <LuCircleCheck className="shrink-0 text-lg text-xor-lime" />
              {destaque}
            </li>
          ))}
        </ul>
      </div>

      <div
        aria-hidden="true"
        className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl"
      >
        <div className="flex items-center gap-4">
          <AnelProgresso percentual={59} className="size-16">
            <span className="text-sm font-bold text-gray-900">59%</span>
          </AnelProgresso>
          <div>
            <p className="text-xs font-medium text-gray-500">
              Ciência da Computação
            </p>
            <p className="font-bold text-gray-900">5º semestre</p>
          </div>
        </div>
        <div className="mt-5 space-y-3">
          {BARRAS_EXEMPLO.map(({ titulo, percentual, cor }) => (
            <div key={titulo} className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold text-gray-700">
                <span>{titulo}</span>
                <span className="text-gray-500">{percentual}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                <div
                  style={{ width: `${percentual}%` }}
                  className={`h-full rounded-full ${cor}`}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </CapaXor>
)

export default function Login() {
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    senha: ''
  })

  const [errors, setErrors] = useState<
    Partial<Record<keyof LoginFormData, string>>
  >({})

  const { mutate: submitLogin, isPending, error: loginError } = useLogin()

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
    submitLogin(result.data)
  }

  return (
    <div className="flex min-h-screen bg-white">
      <div className="flex flex-1 flex-col px-6 py-8 sm:px-10 lg:flex-none lg:basis-1/2 xl:px-20">
        <Link
          href="/"
          className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-900"
        >
          <LuArrowLeft />
          Voltar ao início
        </Link>

        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-12">
          <Image
            src="/logo.png"
            alt="XOR"
            width={832}
            height={389}
            priority
            className="h-12 w-auto self-start"
          />
          <h1 className="mt-10 text-3xl font-bold tracking-tight text-xor-navy">
            Bem-vindo(a) de volta
          </h1>
          <p className="mt-2 text-sm/6 text-gray-500">
            Entre para continuar acompanhando sua graduação.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <FormInput
              value={formData.email}
              label="Email"
              type="email"
              name="email"
              autoComplete="email"
              placeholder="voce@exemplo.com"
              error={errors.email}
              handleChange={(value) => handleChange('email', value)}
            />

            <CampoSenha
              label="Senha"
              name="senha"
              autoComplete="current-password"
              value={formData.senha}
              error={errors.senha}
              handleChange={(value) => handleChange('senha', value)}
            />

            {loginError && (
              <div
                role="alert"
                className="flex items-start gap-2 rounded-xl bg-red-50 px-3 py-2.5 text-sm font-medium text-red-700 ring-1 ring-inset ring-red-200"
              >
                <LuCircleAlert className="mt-0.5 shrink-0" />
                {getErrorMessage(loginError)}
              </div>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="flex w-full cursor-pointer justify-center rounded-md bg-xor-navy px-3 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-xor-navy/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-xor-navy disabled:opacity-70"
            >
              {isPending ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <p className="mt-8 border-t border-gray-100 pt-6 text-center text-sm text-gray-500">
            Ainda não tem conta?{' '}
            <Link
              href={`/register?step=${STEP_KEYS.PERSONAL_INFORMATION}`}
              className="font-semibold text-xor-navy underline decoration-xor-lime decoration-2 underline-offset-4 hover:decoration-xor-navy"
            >
              Criar conta
            </Link>
          </p>
        </div>
      </div>

      <div className="hidden flex-1 p-3 lg:block">
        <PainelMarca />
      </div>
    </div>
  )
}
