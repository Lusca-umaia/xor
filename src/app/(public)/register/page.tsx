'use client'
import ProgressBar from '@/components/ProgressBar/ProgressBar'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import CourseInformation from './components/CourseInformation'
import PersonalInformation from './components/PersonalInformation'
import { STEP_KEYS } from '@/helpers/consts'
import Image from 'next/image'
import Link from 'next/link'
import { LuArrowLeft } from 'react-icons/lu'
import CurrentSemester from './components/CurrentSemester'

const STEP_TITLES = {
  [STEP_KEYS.COURSE_INFORMATION]: 'Informações do curso',
  [STEP_KEYS.PERSONAL_INFORMATION]: 'Informações pessoais',
  [STEP_KEYS.CURRENT_SEMESTER]: 'Informações do semestre atual'
} as const

const ORDEM_PASSOS = [
  STEP_KEYS.PERSONAL_INFORMATION,
  STEP_KEYS.COURSE_INFORMATION,
  STEP_KEYS.CURRENT_SEMESTER
]

const formatarPasso = (numero: number) => String(numero).padStart(2, '0')

const Register = () => {
  const searchParams = useSearchParams()
  const currentStep = searchParams.get('step') as keyof typeof STEP_KEYS
  const pathname = usePathname()
  const router = useRouter()

  const handleChangeStep = (step: keyof typeof STEP_KEYS) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('step', step)
    router.replace(`${pathname}?${params.toString()}`)
  }

  const STEP_COMPONENTS = {
    [STEP_KEYS.COURSE_INFORMATION]: (
      <CourseInformation handleChangeStep={handleChangeStep} />
    ),
    [STEP_KEYS.PERSONAL_INFORMATION]: (
      <PersonalInformation handleChangeStep={handleChangeStep} />
    ),
    [STEP_KEYS.CURRENT_SEMESTER]: (
      <CurrentSemester handleChangeStep={handleChangeStep} />
    )
  }

  const numeroPasso = ORDEM_PASSOS.indexOf(currentStep) + 1

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link href="/">
            <Image
              src="/logo.png"
              alt="XOR"
              width={832}
              height={389}
              priority
              className="h-9 w-auto"
            />
          </Link>
          <p className="text-sm text-gray-500">
            Já possui conta?{' '}
            <Link
              href="/login"
              className="font-semibold text-xor-navy underline decoration-xor-lime decoration-2 underline-offset-4 hover:decoration-xor-navy"
            >
              Entrar
            </Link>
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6">
        <div className="space-y-3">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-900"
          >
            <LuArrowLeft />
            Voltar ao início
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-xor-navy max-md:text-2xl">
              Crie sua conta
            </h1>
            <p className="mt-1 text-gray-500 max-md:text-sm">
              Em três passos você monta seu perfil acadêmico e já vê o seu
              progresso no curso.
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-gray-100 bg-white shadow-lg">
          <div className="px-4 py-6 sm:p-8">
            <ProgressBar />
            <div className="mt-6 mb-6 flex items-center gap-3 border-b border-gray-100 pb-4">
              {numeroPasso > 0 && (
                <span className="rounded-md bg-xor-navy/5 px-2 py-1 font-mono text-xs font-bold text-xor-navy ring-1 ring-inset ring-xor-navy/10">
                  {formatarPasso(numeroPasso)}/
                  {formatarPasso(ORDEM_PASSOS.length)}
                </span>
              )}
              <h2 className="text-lg font-bold tracking-tight max-md:text-base">
                {STEP_TITLES[currentStep]}
              </h2>
            </div>
            <form onSubmit={(e) => e.preventDefault()}>
              {STEP_COMPONENTS[currentStep]}
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Register
