'use client'
import clsx from 'clsx'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useMemo, useState } from 'react'
import {
  LuFileQuestion,
  LuHistory,
  LuListChecks,
  LuPlus,
  LuSearch,
  LuSparkles,
  LuTarget
} from 'react-icons/lu'
import { QuestionarioResumo } from '@/@types/Questionario'
import Header from '@/components/Header/Header'
import Select from '@/components/Select/Select'
import { SkeletonCard } from '@/components/Skeleton/Skeleton'
import StatCard from '@/components/StatCard/StatCard'
import { useExcluirQuestionario } from '@/hooks/mutations/useQuestionarios'
import { useProgresso } from '@/hooks/queries/useProgresso'
import { useQuestionarios } from '@/hooks/queries/useQuestionarios'
import { getErrorMessage } from '@/services/api'
import ModalConfirmacao from '../components/ModalConfirmacao'
import QuestionarioCard from '../components/QuestionarioCard'

type FiltroOrigem = 'TODOS' | 'MANUAL' | 'IA'

const FILTROS_ORIGEM: { id: FiltroOrigem; nome: string }[] = [
  { id: 'TODOS', nome: 'Todos' },
  { id: 'MANUAL', nome: 'Manuais' },
  { id: 'IA', nome: 'Gerados com IA' }
]

// Sem acento e minúsculo, para a busca.
const normalizar = (texto: string) =>
  texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

const ListaQuestoes = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: questionarios, isLoading, isError } = useQuestionarios()
  const { data: progresso } = useProgresso()
  const excluir = useExcluirQuestionario()

  const [busca, setBusca] = useState('')
  const [origem, setOrigem] = useState<FiltroOrigem>('TODOS')
  // 0 = todas as disciplinas. Vem preenchido pelo "Ver questões".
  const [disciplinaId, setDisciplinaId] = useState(
    Number(searchParams.get('disciplina')) || 0
  )
  const [paraExcluir, setParaExcluir] = useState<QuestionarioResumo | null>(
    null
  )

  const opcoesDisciplina = useMemo(() => {
    const unicas = new Map<number, string>()
    questionarios?.forEach(({ disciplina }) => {
      if (disciplina) unicas.set(disciplina.id, disciplina.nome)
    })
    // A disciplina vinda do "Ver questões" pode ainda não ter questionário.
    const filtrada = progresso?.disciplinas.find((d) => d.id === disciplinaId)
    if (filtrada && !unicas.has(filtrada.id)) {
      unicas.set(filtrada.id, filtrada.nome)
    }
    return [
      { id: 0, nome: 'Todas as disciplinas' },
      ...[...unicas].map(([id, nome]) => ({ id, nome }))
    ]
  }, [questionarios, progresso, disciplinaId])

  const filtrados = useMemo(() => {
    const termo = normalizar(busca.trim())
    return (questionarios ?? []).filter(
      (q) =>
        (origem === 'TODOS' || q.origem === origem) &&
        (!disciplinaId || q.disciplina?.id === disciplinaId) &&
        (!termo ||
          normalizar(
            [q.titulo, q.descricao, q.disciplina?.nome, q.disciplina?.codigo]
              .filter(Boolean)
              .join(' ')
          ).includes(termo))
    )
  }, [questionarios, busca, origem, disciplinaId])

  const estatisticas = useMemo(() => {
    const lista = questionarios ?? []
    const resolvidos = lista.filter((q) => q.ultimaResolucao)
    const media = resolvidos.length
      ? Math.round(
          resolvidos.reduce(
            (acc, q) => acc + q.ultimaResolucao!.percentual,
            0
          ) / resolvidos.length
        )
      : null

    return [
      {
        title: 'Questionários',
        value: String(lista.length),
        icon: <LuFileQuestion className="text-3xl text-gray-400" />
      },
      {
        title: 'Questões',
        value: String(lista.reduce((acc, q) => acc + q.totalQuestoes, 0)),
        icon: <LuListChecks className="text-3xl text-gray-400" />
      },
      {
        title: 'Resoluções',
        value: String(lista.reduce((acc, q) => acc + q.totalResolucoes, 0)),
        icon: <LuHistory className="text-3xl text-gray-400" />
      },
      {
        title: 'Média de acertos',
        value: media === null ? '-' : `${media}%`,
        icon: <LuTarget className="text-3xl text-gray-400" />
      }
    ]
  }, [questionarios])

  const temFiltro = busca.trim() !== '' || origem !== 'TODOS' || !!disciplinaId

  const limparFiltros = () => {
    setBusca('')
    setOrigem('TODOS')
    setDisciplinaId(0)
  }

  // Com o filtro de disciplina ativo, o novo questionário já nasce nela.
  const novo = (comIa = false) => {
    const params = new URLSearchParams()
    if (comIa) params.set('ia', '1')
    if (disciplinaId) params.set('disciplina', String(disciplinaId))
    const query = params.toString()
    router.push(`/questoes/criar-questionario${query ? `?${query}` : ''}`)
  }

  return (
    <div>
      <Header
        title="Questionários"
        description="Crie questões à mão ou gere com IA a partir do seu material e treine até dominar o conteúdo."
        actions={{
          primaryAction: { title: 'Gerar com IA', onClick: () => novo(true) },
          secondaryAction: { title: 'Novo questionário', onClick: () => novo() }
        }}
      />

      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
          {estatisticas.map((estatistica) => (
            <StatCard
              key={estatistica.title}
              title={estatistica.title}
              icon={estatistica.icon}
              value={isLoading ? '...' : estatistica.value}
            />
          ))}
        </div>

        <div className="flex flex-col gap-3 rounded-2xl border border-gray-100 bg-white p-3 shadow-md lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <LuSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por título, descrição ou disciplina"
              className="block w-full rounded-xl border-0 py-2 pl-9 pr-3 text-sm font-medium text-gray-900 ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-xor-navy outline-none"
            />
          </div>
          <div className="flex rounded-xl bg-gray-100 p-1 text-sm font-semibold">
            {FILTROS_ORIGEM.map((filtro) => (
              <button
                key={filtro.id}
                type="button"
                onClick={() => setOrigem(filtro.id)}
                className={clsx(
                  'flex-1 cursor-pointer whitespace-nowrap rounded-lg px-3 py-1.5 transition',
                  origem === filtro.id
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-900'
                )}
              >
                {filtro.nome}
              </button>
            ))}
          </div>
          {opcoesDisciplina.length > 1 && (
            <Select
              className="lg:w-64"
              options={opcoesDisciplina}
              value={disciplinaId}
              onChange={({ id }) => setDisciplinaId(id)}
            />
          )}
        </div>

        {isError && (
          <p className="text-sm font-medium text-red-600">
            Não foi possível carregar seus questionários.
          </p>
        )}

        {isLoading && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-3">
            {Array.from({ length: 6 }, (_, i) => (
              <SkeletonCard key={i} className="h-64 p-6" />
            ))}
          </div>
        )}

        {questionarios && questionarios.length === 0 && (
          <div className="flex flex-col items-center gap-4 rounded-2xl border-2 border-dashed border-gray-200 bg-white px-6 py-16 text-center">
            <div className="rounded-2xl bg-gray-100 p-4">
              <LuFileQuestion className="text-4xl text-gray-500" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold">Nenhum questionário ainda</h3>
              <p className="max-w-md text-sm text-gray-500">
                Monte suas próprias questões ou deixe a IA criar uma lista a
                partir do tema e do material da aula.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              <button
                type="button"
                onClick={() => novo(true)}
                className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-xor-navy shadow-sm ring-1 ring-inset ring-xor-lime/60 hover:bg-xor-lime/15"
              >
                <LuSparkles /> Gerar com IA
              </button>
              <button
                type="button"
                onClick={() => novo()}
                className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-black px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-gray-800"
              >
                <LuPlus /> Criar manualmente
              </button>
            </div>
          </div>
        )}

        {questionarios &&
          questionarios.length > 0 &&
          filtrados.length === 0 && (
            <div className="rounded-2xl bg-white px-6 py-12 text-center">
              <p className="text-sm text-gray-500">
                Nenhum questionário encontrado com esses filtros.
              </p>
              {temFiltro && (
                <button
                  type="button"
                  onClick={limparFiltros}
                  className="mt-2 cursor-pointer text-sm font-semibold text-xor-navy hover:text-xor-slate"
                >
                  Limpar filtros
                </button>
              )}
            </div>
          )}

        {filtrados.length > 0 && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-3">
            {filtrados.map((questionario) => (
              <QuestionarioCard
                key={questionario.id}
                questionario={questionario}
                onExcluir={(q) => {
                  excluir.reset()
                  setParaExcluir(q)
                }}
              />
            ))}
          </div>
        )}
      </div>

      <ModalConfirmacao
        open={paraExcluir !== null}
        onClose={() => setParaExcluir(null)}
        perigo
        titulo="Excluir questionário"
        descricao={
          <>
            <strong>{paraExcluir?.titulo}</strong> e todo o histórico de
            resoluções serão apagados. Essa ação não pode ser desfeita.
          </>
        }
        confirmar="Excluir"
        carregando={excluir.isPending}
        erro={excluir.error && getErrorMessage(excluir.error)}
        onConfirm={() =>
          paraExcluir &&
          excluir.mutate(paraExcluir.id, {
            onSuccess: () => setParaExcluir(null)
          })
        }
      />
    </div>
  )
}

const Page = () => (
  <Suspense>
    <ListaQuestoes />
  </Suspense>
)

export default Page
