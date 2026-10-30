'use client'

import { DisciplinaProgresso } from '@/@types/Progresso'
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle
} from '@headlessui/react'
import clsx from 'clsx'
import { useState } from 'react'
import { getErrorMessage } from '@/services/api'
import { useEncerrarSemestre } from '@/hooks/mutations/useEncerrarSemestre'
import { useCriarDisciplina } from '@/hooks/mutations/useDisciplinas'
import type { NovaDisciplinaInput } from '@/lib/api/schemas'
import FormNovaDisciplina from '../FormNovaDisciplina/FormNovaDisciplina'
import ResultadoDisciplina, {
  Resultado,
  resultadoValido
} from '../ResultadoDisciplina/ResultadoDisciplina'

interface ModalEncerrarCursoProps {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  semestreAtual: number
  cadeirasAtivas: DisciplinaProgresso[]
  // Disciplinas que podem ser cursadas no próximo semestre.
  disponiveis: DisciplinaProgresso[]
}

const RESULTADO_PADRAO: Resultado = { status: 'APROVADA', nota: '' }

const ModalEncerrarCurso: React.FC<ModalEncerrarCursoProps> = ({
  open,
  setOpen,
  semestreAtual,
  cadeirasAtivas,
  disponiveis
}) => {
  // -1: confirmação, 0..n-1: notas, n: próximo semestre.
  const [passo, setPasso] = useState(-1)
  const [resultados, setResultados] = useState<Record<number, Resultado>>({})
  const [proximas, setProximas] = useState<Set<number>>(new Set())

  const passoProximoSemestre = cadeirasAtivas.length
  const cadeiraAtual = cadeirasAtivas[passo]
  const resultadoAtual =
    (cadeiraAtual && resultados[cadeiraAtual.id]) ?? RESULTADO_PADRAO

  const fechar = () => {
    setOpen(false)
    setPasso(-1)
    setResultados({})
    setProximas(new Set())
    reset()
  }

  const { mutate, isPending, error, reset } = useEncerrarSemestre()
  const { mutateAsync: criar } = useCriarDisciplina()

  const encerrar = () =>
    mutate(
      {
        resultados: cadeirasAtivas.map(({ id }) => {
          const { status, nota } = resultados[id] ?? RESULTADO_PADRAO
          return {
            disciplinaId: id,
            status,
            nota: status === 'TRANCADA' ? null : Number(nota)
          }
        }),
        proximasDisciplinas: [...proximas]
      },
      { onSuccess: fechar }
    )

  const adicionarDisciplina = async (disciplina: NovaDisciplinaInput) => {
    try {
      const { id } = await criar(disciplina)
      setProximas((prev) => new Set(prev).add(id))
      return null
    } catch (err) {
      return getErrorMessage(err, 'Não foi possível adicionar a disciplina')
    }
  }

  const toggleProxima = (id: number) => {
    setProximas((prev) => {
      const proximo = new Set(prev)
      if (proximo.has(id)) proximo.delete(id)
      else proximo.add(id)
      return proximo
    })
  }

  const handleClickNext = () => {
    if (passo === passoProximoSemestre) return encerrar()
    setPasso((p) => p + 1)
  }

  const handleClickPrev = () => {
    if (passo === -1) return fechar()
    setPasso((p) => p - 1)
  }

  const podeSeguir =
    !isPending && (!cadeiraAtual || resultadoValido(resultadoAtual))

  return (
    <Dialog open={open} onClose={fechar} className="relative z-10">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-gray-500/75 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in"
      />

      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <DialogPanel
            transition
            className="relative transform max-md:w-full overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8 sm:w-full sm:max-w-2xl sm:p-6 data-closed:sm:translate-y-0 data-closed:sm:scale-95"
          >
            <form onSubmit={(e) => e.preventDefault()}>
              <div>
                <DialogTitle
                  as="h3"
                  className="text-base gap-2 flex justify-between font-semibold text-gray-900"
                >
                  {passo === passoProximoSemestre
                    ? `Disciplinas do ${semestreAtual + 1}º semestre`
                    : `Encerrar ${semestreAtual}º semestre`}
                  {cadeiraAtual && (
                    <span>
                      {passo + 1}/{cadeirasAtivas.length}
                    </span>
                  )}
                </DialogTitle>

                {passo === -1 && (
                  <p className="mt-2 text-sm text-gray-700">
                    Tem certeza de que deseja{' '}
                    <span className="font-bold">encerrar</span> este semestre?{' '}
                    <br /> Você vai informar o resultado de cada disciplina em
                    andamento e, em seguida, escolher as disciplinas do próximo
                    semestre.
                  </p>
                )}

                {cadeiraAtual && (
                  <div className="mt-2 space-y-3">
                    <p className="text-sm text-gray-700">
                      Como foi a disciplina{' '}
                      <span className="font-bold">{cadeiraAtual.nome}</span>?
                    </p>
                    <ResultadoDisciplina
                      value={resultadoAtual}
                      onChange={(valor) =>
                        setResultados((prev) => ({
                          ...prev,
                          [cadeiraAtual.id]: valor
                        }))
                      }
                    />
                  </div>
                )}

                {passo === passoProximoSemestre && (
                  <div className="mt-2 space-y-3">
                    <p className="text-sm text-gray-700">
                      Selecione o que você vai cursar. Se uma disciplina não
                      estiver na lista, adicione abaixo.
                    </p>
                    <div className="max-h-64 overflow-y-auto space-y-1.5 pr-1">
                      {disponiveis.length === 0 && (
                        <p className="text-sm text-gray-500">
                          Nenhuma disciplina pendente.
                        </p>
                      )}
                      {disponiveis.map((disciplina) => (
                        <label
                          key={disciplina.id}
                          className={clsx(
                            'flex cursor-pointer items-center justify-between gap-3 rounded-md px-3 py-2 text-sm ring-1 ring-inset',
                            proximas.has(disciplina.id)
                              ? 'bg-indigo-50 ring-indigo-300'
                              : 'ring-gray-200 hover:bg-gray-50'
                          )}
                        >
                          <span className="flex items-center gap-2 min-w-0">
                            <input
                              type="checkbox"
                              checked={proximas.has(disciplina.id)}
                              onChange={() => toggleProxima(disciplina.id)}
                            />
                            <span className="truncate font-medium">
                              {disciplina.nome}
                            </span>
                          </span>
                          <span className="shrink-0 text-xs text-gray-500">
                            {disciplina.codigo} · {disciplina.cargaHoraria}h
                            {disciplina.reprovacoes + disciplina.trancamentos >
                              0 && ' · refazer'}
                          </span>
                        </label>
                      ))}
                    </div>
                    <FormNovaDisciplina
                      statusPermitidos={['ANDAMENTO']}
                      onAdicionar={({ codigo, nome, cargaHoraria, carater }) =>
                        adicionarDisciplina({
                          codigo,
                          nome,
                          cargaHoraria,
                          carater
                        })
                      }
                    />
                  </div>
                )}

                {error && (
                  <p className="mt-3 text-sm font-medium text-red-600">
                    {getErrorMessage(error)}
                  </p>
                )}
              </div>
              <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                <button
                  type="submit"
                  onClick={handleClickNext}
                  disabled={!podeSeguir}
                  className="disabled:opacity-80 not-disabled:cursor-pointer inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-xs not-disabled:hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:col-start-2"
                >
                  {passo === passoProximoSemestre
                    ? isPending
                      ? 'Encerrando...'
                      : 'Encerrar semestre'
                    : 'Seguir'}
                </button>
                <button
                  type="button"
                  data-autofocus
                  onClick={handleClickPrev}
                  className="mt-3 cursor-pointer inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-xs ring-1 ring-gray-300 ring-inset hover:bg-gray-50 sm:col-start-1 sm:mt-0"
                >
                  {passo >= 0 ? 'Voltar' : 'Cancelar'}
                </button>
              </div>
            </form>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  )
}

export default ModalEncerrarCurso
