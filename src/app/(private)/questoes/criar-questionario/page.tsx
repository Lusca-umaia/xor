'use client'
import clsx from 'clsx'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useMemo, useState } from 'react'
import { LuCirclePlus, LuSave, LuSparkles } from 'react-icons/lu'
import { Dificuldade, QuestaoGerada } from '@/@types/Questionario'
import Header from '@/components/Header/Header'
import Select from '@/components/Select/Select'
import Skeleton, { SkeletonCard } from '@/components/Skeleton/Skeleton'
import { useSalvarQuestionario } from '@/hooks/mutations/useQuestionarios'
import { useProgresso } from '@/hooks/queries/useProgresso'
import { useQuestionario } from '@/hooks/queries/useQuestionarios'
import { getErrorMessage } from '@/services/api'
import { DIFICULDADE_OPCOES } from '@/utils/questionarios'
import CampoTexto from '../components/CampoTexto'
import EditorQuestao from '../components/EditorQuestao'
import ModalGerarIa from '../components/ModalGerarIa'
import {
  QuestaoRascunho,
  Rascunho,
  duplicarQuestao,
  novaQuestao,
  questaoCompleta,
  questaoDaIa,
  rascunhoDoQuestionario,
  rascunhoVazio,
  validarRascunho
} from '../components/rascunho'

const DIFICULDADES: { id: Dificuldade | ''; nome: string }[] = [
  { id: '', nome: 'Não definida' },
  ...DIFICULDADE_OPCOES
]

// Questão que o aluno ainda não começou a preencher.
const emBranco = (q: QuestaoRascunho) =>
  !q.enunciado.trim() && q.alternativas.every(({ texto }) => !texto.trim())

// Erros de uma questão, com o caminho relativo a ela.
function errosDaQuestao(erros: Record<string, string>, indice: number) {
  const prefixo = `questoes.${indice}.`
  return Object.fromEntries(
    Object.entries(erros)
      .filter(([caminho]) => caminho.startsWith(prefixo))
      .map(([caminho, mensagem]) => [caminho.slice(prefixo.length), mensagem])
  )
}

const rolarAte = (chave: string) =>
  document
    .getElementById(`questao-${chave}`)
    ?.scrollIntoView({ behavior: 'smooth', block: 'start' })

const EditorQuestionario = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const questionarioId = Number(searchParams.get('id')) || null

  const { data: questionario, isError } = useQuestionario(questionarioId)
  const { data: progresso } = useProgresso()
  const salvar = useSalvarQuestionario()

  const [rascunho, setRascunho] = useState<Rascunho | null>(() =>
    questionarioId
      ? null
      : {
          ...rascunhoVazio(),
          disciplinaId: Number(searchParams.get('disciplina')) || null
        }
  )
  const [erros, setErros] = useState<Record<string, string>>({})
  const [tentouSalvar, setTentouSalvar] = useState(false)
  const [sujo, setSujo] = useState(false)
  const [modalIa, setModalIa] = useState(searchParams.get('ia') === '1')

  // Na edição, o rascunho nasce do questionário carregado (uma vez só,
  // para um refetch não apagar o que está sendo editado).
  useEffect(() => {
    if (questionario && !rascunho) {
      setRascunho(rascunhoDoQuestionario(questionario))
    }
  }, [questionario, rascunho])

  useEffect(() => {
    if (!sujo) return
    const avisar = (e: BeforeUnloadEvent) => e.preventDefault()
    window.addEventListener('beforeunload', avisar)
    return () => window.removeEventListener('beforeunload', avisar)
  }, [sujo])

  const disciplinas = useMemo(
    () =>
      (progresso?.disciplinas ?? []).map(({ id, codigo, nome }) => ({
        id,
        nome: `${codigo} · ${nome}`
      })),
    [progresso]
  )

  // Depois da primeira tentativa de salvar, os erros acompanham a edição.
  useEffect(() => {
    if (tentouSalvar && rascunho) setErros(validarRascunho(rascunho).erros)
  }, [rascunho, tentouSalvar])

  const atualizar = (alterar: (r: Rascunho) => Rascunho) => {
    setRascunho((anterior) => anterior && alterar(anterior))
    setSujo(true)
  }

  const alterarQuestao = (indice: number, questao: QuestaoRascunho) =>
    atualizar((r) => ({
      ...r,
      questoes: r.questoes.map((q, i) => (i === indice ? questao : q))
    }))

  const adicionarQuestao = () => {
    const questao = novaQuestao()
    atualizar((r) => ({ ...r, questoes: [...r.questoes, questao] }))
    setTimeout(() => rolarAte(questao.chave), 50)
  }

  const removerQuestao = (indice: number) =>
    atualizar((r) => ({
      ...r,
      questoes: r.questoes.filter((_, i) => i !== indice)
    }))

  const duplicar = (indice: number) =>
    atualizar((r) => ({
      ...r,
      questoes: r.questoes.flatMap((q, i) =>
        i === indice ? [q, duplicarQuestao(q)] : [q]
      )
    }))

  const mover = (indice: number, direcao: -1 | 1) =>
    atualizar((r) => {
      const questoes = [...r.questoes]
      const destino = indice + direcao
      ;[questoes[indice], questoes[destino]] = [
        questoes[destino],
        questoes[indice]
      ]
      return { ...r, questoes }
    })

  const receberDaIa = (geradas: QuestaoGerada[], tema: string) => {
    const novas = geradas.map(questaoDaIa)
    atualizar((r) => ({
      ...r,
      titulo: r.titulo.trim() ? r.titulo : tema,
      origem: 'IA',
      questoes: [...r.questoes.filter((q) => !emBranco(q)), ...novas]
    }))
    setModalIa(false)
    setTimeout(() => novas[0] && rolarAte(novas[0].chave), 300)
  }

  const handleSalvar = () => {
    if (!rascunho) return
    setTentouSalvar(true)
    const { dados, erros: novosErros } = validarRascunho(rascunho)
    setErros(novosErros)

    if (!dados) {
      const primeira = Object.keys(novosErros)
        .map((caminho) => caminho.match(/^questoes\.(\d+)/)?.[1])
        .find(Boolean)
      if (primeira !== undefined) {
        rolarAte(rascunho.questoes[Number(primeira)].chave)
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
      return
    }

    salvar.mutate(
      { questionarioId: questionarioId ?? undefined, dados },
      {
        onSuccess: () => {
          setSujo(false)
          router.push('/questoes/lista-questionario')
        }
      }
    )
  }

  if (isError) {
    return (
      <div>
        <Header
          title="Editar questionário"
          backPath="/questoes/lista-questionario"
        />
        <p className="text-sm font-medium text-red-600">
          Não foi possível carregar este questionário.
        </p>
      </div>
    )
  }

  if (!rascunho) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-72" />
        <SkeletonCard className="h-40 p-6" />
        <SkeletonCard className="h-64 p-6" />
      </div>
    )
  }

  const completas = rascunho.questoes.filter(questaoCompleta).length
  const totalErros = Object.keys(erros).length

  return (
    <div>
      <Header
        title={questionarioId ? 'Editar questionário' : 'Novo questionário'}
        description="Escreva as questões à mão, peça sugestões para a IA ou combine os dois."
        backPath="/questoes/lista-questionario"
        actions={{
          primaryAction: {
            title: 'Gerar com IA',
            onClick: () => setModalIa(true)
          },
          secondaryAction: {
            title: salvar.isPending ? 'Salvando...' : 'Salvar',
            disabled: salvar.isPending,
            onClick: handleSalvar
          }
        }}
      />

      <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="space-y-4">
          <div className="space-y-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-md max-md:p-4">
            <div>
              <input
                type="text"
                value={rascunho.titulo}
                aria-label="Título do questionário"
                placeholder="Título do questionário"
                onChange={(e) =>
                  atualizar((r) => ({ ...r, titulo: e.target.value }))
                }
                className={clsx(
                  'w-full border-b-2 bg-transparent pb-2 text-2xl font-bold tracking-tight text-gray-900 placeholder:text-gray-300 outline-none max-md:text-xl',
                  erros.titulo
                    ? 'border-red-300'
                    : 'border-gray-100 focus:border-gray-900'
                )}
              />
              {erros.titulo && (
                <p className="mt-1 text-sm font-medium text-red-600">
                  {erros.titulo}
                </p>
              )}
            </div>
            <CampoTexto
              name="descricao"
              placeholder="Descrição (opcional): o que este questionário cobre?"
              value={rascunho.descricao}
              error={erros.descricao}
              handleChange={(descricao) =>
                atualizar((r) => ({ ...r, descricao }))
              }
            />
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <Select
                className="md:col-span-2"
                label="Disciplina"
                options={[{ id: 0, nome: 'Nenhuma' }, ...disciplinas]}
                value={rascunho.disciplinaId ?? 0}
                onChange={({ id }) =>
                  atualizar((r) => ({ ...r, disciplinaId: id || null }))
                }
              />
              <Select
                label="Dificuldade"
                options={DIFICULDADES}
                value={rascunho.dificuldade ?? ''}
                onChange={({ id }) =>
                  atualizar((r) => ({ ...r, dificuldade: id || null }))
                }
              />
            </div>
          </div>

          {rascunho.questoes.map((questao, indice) => (
            <EditorQuestao
              key={questao.chave}
              questao={questao}
              indice={indice}
              total={rascunho.questoes.length}
              erros={errosDaQuestao(erros, indice)}
              onChange={(q) => alterarQuestao(indice, q)}
              onRemover={() => removerQuestao(indice)}
              onDuplicar={() => duplicar(indice)}
              onMover={(direcao) => mover(indice, direcao)}
            />
          ))}

          {erros.questoes && (
            <p className="text-sm font-medium text-red-600">{erros.questoes}</p>
          )}

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <button
              type="button"
              onClick={adicionarQuestao}
              className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-gray-300 bg-white p-4 text-sm font-semibold text-gray-700 hover:border-gray-900 hover:text-gray-900"
            >
              <LuCirclePlus className="text-lg" /> Adicionar questão
            </button>
            <button
              type="button"
              onClick={() => setModalIa(true)}
              className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-xor-lime/60 bg-xor-lime/10 p-4 text-sm font-semibold text-xor-navy hover:border-xor-lime"
            >
              <LuSparkles className="text-lg" /> Gerar questões com IA
            </button>
          </div>
        </div>

        <aside className="space-y-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-md xl:sticky xl:top-4">
          <div>
            <p className="text-sm font-semibold text-gray-900">Resumo</p>
            <p className="text-sm text-gray-500">
              {completas} de {rascunho.questoes.length}{' '}
              {rascunho.questoes.length === 1
                ? 'questão pronta'
                : 'questões prontas'}
            </p>
          </div>

          {rascunho.questoes.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {rascunho.questoes.map((questao, indice) => {
                const comErro =
                  Object.keys(errosDaQuestao(erros, indice)).length > 0
                return (
                  <button
                    key={questao.chave}
                    type="button"
                    title={`Ir para a questão ${indice + 1}`}
                    onClick={() => rolarAte(questao.chave)}
                    className={clsx(
                      'size-8 cursor-pointer rounded-lg text-xs font-bold transition',
                      comErro
                        ? 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-200'
                        : questaoCompleta(questao)
                          ? 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200'
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    )}
                  >
                    {indice + 1}
                  </button>
                )
              })}
            </div>
          )}

          {totalErros > 0 && (
            <p className="rounded-xl bg-red-50 p-3 text-sm font-medium text-red-700">
              Corrija os campos destacados antes de salvar.
            </p>
          )}

          {salvar.error && (
            <p className="rounded-xl bg-red-50 p-3 text-sm font-medium text-red-700">
              {getErrorMessage(salvar.error, 'Não foi possível salvar')}
            </p>
          )}

          <button
            type="button"
            disabled={salvar.isPending}
            onClick={handleSalvar}
            className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-black px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 disabled:opacity-60"
          >
            <LuSave />
            {salvar.isPending ? 'Salvando...' : 'Salvar questionário'}
          </button>
        </aside>
      </div>

      <ModalGerarIa
        open={modalIa}
        onClose={() => setModalIa(false)}
        onGerar={receberDaIa}
        disciplinas={disciplinas}
        disciplinaId={rascunho.disciplinaId}
        dificuldade={rascunho.dificuldade}
        tema={rascunho.titulo}
      />
    </div>
  )
}

const Page = () => (
  <Suspense>
    <EditorQuestionario />
  </Suspense>
)

export default Page
