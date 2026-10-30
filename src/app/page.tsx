import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ReactNode } from 'react'
import {
  LuArrowRight,
  LuBot,
  LuCalendarCheck,
  LuFileText,
  LuFileUp,
  LuListChecks,
  LuQuote,
  LuTimer,
  LuTrendingUp
} from 'react-icons/lu'
import { DisciplinaProgresso, Me, ResumoProgresso } from '@/@types/Progresso'
import CursoHero from '@/app/(private)/courseProgression/components/CursoHero'
import CapaXor from '@/components/CapaXor/CapaXor'
import DisciplinaBox from '@/components/DisciplinaBox/DisciplinaBox'
import IconeTile from '@/components/IconeTile/IconeTile'
import { STEP_KEYS } from '@/helpers/consts'

export const metadata: Metadata = {
  title: 'XOR | Sua jornada acadêmica',
  description:
    'Acompanhe seu curso, importe seu histórico do SIGAA e planeje sua graduação em um só lugar.'
}

const CADASTRO = `/register?step=${STEP_KEYS.PERSONAL_INFORMATION}`

// Dados fictícios para a prévia do sistema.
const ALUNO_EXEMPLO: Me = {
  id: 'exemplo',
  email: '',
  nome: 'Ana Souza',
  matricula: '512345',
  semestreAtual: 5,
  curso: { nome: 'Ciência da Computação', codigo: 'CC' }
}

const RESUMO_EXEMPLO: ResumoProgresso = {
  obrigatoriasTotal: 40,
  obrigatoriasConcluidas: 24,
  optativasConcluidas: 3,
  cargaObrigatoriaTotal: 2720,
  cargaObrigatoriaConcluida: 1632,
  cargaOptativaExigida: 384,
  cargaOptativaConcluida: 192,
  cargaTotal: 3104,
  percentualGeral: 58.8,
  emAndamento: 5
}

const DISCIPLINAS_EXEMPLO: Pick<
  DisciplinaProgresso,
  'codigo' | 'nome' | 'cargaHoraria' | 'carater' | 'status' | 'nota' | 'periodo'
>[] = [
  {
    codigo: 'CK0109',
    nome: 'Estruturas de Dados',
    cargaHoraria: 96,
    carater: 'OBRIGATORIA',
    status: 'ANDAMENTO',
    nota: null,
    periodo: '2026.2'
  },
  {
    codigo: 'CK0154',
    nome: 'Cálculo Diferencial e Integral I',
    cargaHoraria: 96,
    carater: 'OBRIGATORIA',
    status: 'CONCLUIDA',
    nota: 8.7,
    periodo: '2024.1'
  },
  {
    codigo: 'CK0201',
    nome: 'Inteligência Artificial',
    cargaHoraria: 64,
    carater: 'OPTATIVA',
    status: 'ANDAMENTO',
    nota: null,
    periodo: '2026.2'
  },
  {
    codigo: 'CK0114',
    nome: 'Fundamentos de Bancos de Dados',
    cargaHoraria: 64,
    carater: 'OBRIGATORIA',
    status: 'PENDENTE',
    nota: null,
    periodo: null
  }
]

const RECURSOS = [
  {
    nome: 'Progressão de curso',
    descricao:
      'Veja quanto falta para se formar, o que está pendente e o que já foi concluído, com a carga de obrigatórias e optativas.',
    icon: <LuTrendingUp />
  },
  {
    nome: 'Histórico do SIGAA',
    descricao:
      'Envie o PDF do seu histórico e as disciplinas, notas e períodos entram sozinhos. Se preferir, cadastre tudo à mão.',
    icon: <LuFileUp />
  },
  {
    nome: 'Assistente com IA',
    descricao:
      'Tire dúvidas sobre conteúdos e peça sugestões de estudo para um assistente que acompanha a sua jornada.',
    icon: <LuBot />
  },
  {
    nome: 'Questionários',
    descricao:
      'Monte questionários, gere questões com IA e resolva para fixar o conteúdo das disciplinas.',
    icon: <LuListChecks />
  },
  {
    nome: 'Pomodoro',
    descricao:
      'Alterne períodos de foco e pausas e acompanhe suas sessões de estudo com estatísticas.',
    icon: <LuTimer />
  },
  {
    nome: 'Fim de semestre',
    descricao:
      'Registre os resultados do semestre e escolha as próximas disciplinas em um só passo.',
    icon: <LuCalendarCheck />
  }
]

// Alturas crescentes no desktop, como os degraus do logo.
const PASSOS = [
  {
    titulo: 'Crie sua conta',
    descricao: 'Informe seus dados e o curso em poucos minutos.',
    altura: 'md:min-h-52'
  },
  {
    titulo: 'Traga seu histórico',
    descricao:
      'Importe o PDF do SIGAA ou cadastre as disciplinas que já cursou.',
    altura: 'md:min-h-64'
  },
  {
    titulo: 'Acompanhe e planeje',
    descricao:
      'Veja seu progresso, encerre semestres e decida o que cursar a seguir.',
    altura: 'md:min-h-76'
  }
]

const BOTAO_PRINCIPAL =
  'inline-flex items-center gap-2 rounded-full bg-black px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-black/10 duration-200 hover:bg-gray-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black'

const BOTAO_SECUNDARIO =
  'inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-200 duration-200 hover:bg-gray-50'

const Titulo = ({
  eyebrow,
  children
}: {
  eyebrow: string
  children: ReactNode
}) => (
  <div className="mx-auto max-w-2xl text-center">
    <p className="inline-flex items-center gap-2 text-sm font-semibold text-xor-navy">
      <span className="size-2 rounded-full bg-xor-lime" />
      {eyebrow}
    </p>
    <h2 className="mt-3 text-balance text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
      {children}
    </h2>
  </div>
)

// Prévia do sistema montada com os componentes reais.
const PreviaSistema = () => (
  <div className="rounded-[2rem] bg-white/60 p-2 shadow-2xl ring-1 shadow-xor-navy/10 ring-gray-900/5 backdrop-blur sm:p-3">
    <div className="overflow-hidden rounded-3xl bg-gray-50 ring-1 ring-gray-900/5">
      <div className="flex items-center gap-2 border-b border-gray-200/70 bg-white px-4 py-3">
        <span className="size-2.5 rounded-full bg-gray-200" />
        <span className="size-2.5 rounded-full bg-gray-200" />
        <span className="size-2.5 rounded-full bg-gray-200" />
        <span className="mx-auto rounded-full bg-gray-100 px-4 py-1 text-xs font-medium text-gray-500">
          Progressão de curso
        </span>
      </div>
      <div
        inert
        aria-hidden="true"
        className="pointer-events-none space-y-4 p-6 text-left select-none max-md:p-3"
      >
        <CursoHero aluno={ALUNO_EXEMPLO} resumo={RESUMO_EXEMPLO} />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {DISCIPLINAS_EXEMPLO.map((disciplina, i) => (
            <div
              key={disciplina.codigo}
              className={i > 1 ? 'max-md:hidden' : ''}
            >
              <DisciplinaBox {...disciplina} />
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
)

const LandingPage = () => (
  <div className="min-h-screen bg-white">
    <header className="sticky top-0 z-50 border-b border-gray-100/80 bg-white/80 backdrop-blur">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-3 lg:px-8">
        <Image
          src="/logo.png"
          alt="XOR"
          width={832}
          height={389}
          priority
          className="h-10 w-auto"
        />
        <div className="flex items-center gap-2 sm:gap-4">
          <Link
            href="/login"
            className="rounded-full px-3 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-100"
          >
            Entrar
          </Link>
          <Link
            href={CADASTRO}
            className="rounded-full bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800"
          >
            Criar conta
          </Link>
        </div>
      </nav>
    </header>

    <main className="isolate">
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-6 pt-20 pb-24 sm:pt-28 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold text-xor-navy shadow-sm ring-1 ring-gray-200">
              <span className="size-2 rounded-full bg-xor-lime" />
              Feito para estudantes de graduação
            </p>
            <h1 className="mt-6 text-balance text-5xl font-bold tracking-tight text-xor-navy sm:text-7xl">
              Domine sua{' '}
              <span className="relative whitespace-nowrap">
                <span
                  aria-hidden="true"
                  className="absolute inset-x-0 bottom-1 -z-10 h-3 rounded-full bg-xor-lime/70 sm:bottom-2 sm:h-4"
                />
                jornada acadêmica
              </span>{' '}
              com inteligência
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg font-medium text-gray-500 sm:text-xl/8">
              Acompanhe seu curso, evite surpresas e planeje sua graduação com o
              XOR. Seu progresso, suas escolhas e seu futuro em um só lugar.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <Link href={CADASTRO} className={BOTAO_PRINCIPAL}>
                Criar minha conta
                <LuArrowRight />
              </Link>
              <Link href="/login" className={BOTAO_SECUNDARIO}>
                Já tenho conta
              </Link>
            </div>
            <p className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-500">
              <LuFileText className="shrink-0 text-xor-navy" />
              Importe seu histórico do SIGAA em PDF e veja seu progresso na
              hora.
            </p>
          </div>

          <div className="mx-auto mt-16 max-w-6xl sm:mt-20">
            <PreviaSistema />
          </div>
        </div>
      </section>

      <section className="bg-gray-50 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <Titulo eyebrow="Recursos">
            Tudo o que você precisa para planejar, acompanhar e conquistar sua
            graduação
          </Titulo>
          <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {RECURSOS.map((recurso) => (
              <div
                key={recurso.nome}
                className="space-y-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-lg transition duration-200 hover:-translate-y-0.5 hover:shadow-xl"
              >
                <IconeTile>{recurso.icon}</IconeTile>
                <div className="space-y-1.5">
                  <h3 className="text-lg font-bold tracking-tight text-gray-900">
                    {recurso.nome}
                  </h3>
                  <p className="text-sm/6 text-gray-500">{recurso.descricao}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <Titulo eyebrow="Como funciona">
            Três degraus até ter sua graduação sob controle
          </Titulo>
          <ol className="mx-auto mt-16 grid max-w-5xl gap-4 md:grid-cols-3 md:items-end">
            {PASSOS.map((passo, i) => {
              const ultimo = i === PASSOS.length - 1
              return (
                <li
                  key={passo.titulo}
                  className={`flex flex-col justify-end gap-3 rounded-3xl p-6 ${passo.altura} ${
                    ultimo
                      ? 'bg-xor-navy text-white shadow-xl shadow-xor-navy/20'
                      : 'border border-gray-100 bg-white shadow-lg'
                  }`}
                >
                  <span
                    className={`font-mono text-sm font-bold ${
                      ultimo ? 'text-xor-lime' : 'text-xor-slate'
                    }`}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <h3 className="text-xl font-bold tracking-tight">
                    {passo.titulo}
                  </h3>
                  <p
                    className={`text-sm/6 ${ultimo ? 'text-white/70' : 'text-gray-500'}`}
                  >
                    {passo.descricao}
                  </p>
                </li>
              )
            })}
          </ol>
        </div>
      </section>

      <section className="px-6 pb-24 sm:pb-32 lg:px-8">
        <CapaXor className="mx-auto max-w-6xl rounded-3xl px-6 py-16 sm:px-16 sm:py-20">
          <figure className="mx-auto max-w-3xl text-center">
            <LuQuote className="mx-auto text-4xl text-xor-lime" />
            <blockquote className="mt-6 text-balance text-lg/8 font-semibold text-white sm:text-2xl/10">
              A educação é o grande motor do desenvolvimento pessoal. É por meio
              dela que a filha de um camponês pode se tornar médica, que o filho
              de um mineiro pode se tornar o chefe da mina, que uma criança
              nascida na pobreza pode se tornar presidente de uma grande nação.
            </blockquote>
            <figcaption className="mt-10 flex items-center justify-center gap-3">
              <Image
                src="/NelsonMandela.jpg"
                alt="Foto de Nelson Mandela"
                width={96}
                height={96}
                className="size-12 rounded-full object-cover ring-2 ring-white/20"
              />
              <div className="text-left">
                <p className="font-semibold text-white">Nelson Mandela</p>
                <p className="text-sm text-white/60">
                  Advogado e ex-presidente da África do Sul
                </p>
              </div>
            </figcaption>
          </figure>
        </CapaXor>

        <div className="mx-auto mt-24 max-w-2xl text-center sm:mt-32">
          <h2 className="text-balance text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Pronto para subir o próximo degrau?
          </h2>
          <p className="mt-4 text-lg text-gray-500">
            Crie sua conta, traga seu histórico e veja onde você está no curso.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link href={CADASTRO} className={BOTAO_PRINCIPAL}>
              Começar agora
              <LuArrowRight />
            </Link>
            <Link href="/login" className={BOTAO_SECUNDARIO}>
              Entrar
            </Link>
          </div>
        </div>
      </section>
    </main>

    <footer className="border-t border-gray-100">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-8 lg:px-8">
        <Image
          src="/logo.png"
          alt="XOR"
          width={832}
          height={389}
          className="h-8 w-auto"
        />
        <p className="text-sm text-gray-500">
          &copy; {new Date().getFullYear()} XOR. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  </div>
)

export default LandingPage
