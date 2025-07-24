'use client'

import FormInput from '@/components/FormInput/FormInput'
import { STEP_KEYS } from '@/helpers/consts'
import Link from 'next/link'

export default function Login() {
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
            <div>
              <form className="space-y-6">
                <div>
                  <FormInput
                    value=""
                    label="Email"
                    type="text"
                    name="email"
                    handleChange={(value) => {}}
                  />
                </div>
                <div>
                  <FormInput
                    value=""
                    label="Senha"
                    type="text"
                    name="senha"
                    handleChange={(value) => {}}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm/6">
                    <a
                      href="#"
                      className="font-semibold text-indigo-600 hover:text-indigo-500"
                    >
                      Esqueceu sua senha?
                    </a>
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                  >
                    Entrar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      <div className="relative hidden w-0 flex-1 lg:block">
        <img
          alt=""
          src="https://images.unsplash.com/photo-1496917756835-20cb06e75b4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1908&q=80"
          className="absolute inset-0 size-full object-cover"
        />
      </div>
    </div>
  )
}
