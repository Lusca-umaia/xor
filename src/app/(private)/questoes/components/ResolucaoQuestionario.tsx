'use client'

import clsx from 'clsx'
import { useCallback, useEffect, useRef, useState } from 'react'
import {
  LuChevronLeft,
  LuChevronRight,
  LuCircleCheck,
  LuCircleX,
  LuClock,
  LuFlag,
  LuLightbulb
} from 'react-icons/lu'
import { Questao } from '@/@types/Questionario'
import { numeroParaLetra } from '@/utils/auxiliars'
import { formatarCronometro } from '@/utils/questionarios'
import AlternativaOpcao, { estadoNaCorrecao } from './AlternativaOpcao'
import Etiqueta from './Etiqueta'
import type { ModoResolucao } from './IntroducaoQuestionario'
import ModalConfirmacao from './ModalConfirmacao'

export type Respostas = Record<number, number | null>

interface ResolucaoQuestionarioProps {
  titulo: string
  questoes: Questao[]
  modo: ModoResolucao
  // Treino das erradas: não entra no histórico.
  treino: boolean
  onFinalizar: (respostas: Respostas, duracaoSegundos: number) => void
}

const LETRAS = 'abcdef'

const ResolucaoQuestionario: React.FC<ResolucaoQuestionarioProps> = ({
  titulo,
  questoes,
  modo,
  treino,
  onFinalizar
}) => {
  const [atual, setAtual] = useState(0)
  const [respostas, setRespostas] = useState<Respostas>({})
  // Modo estudo: questões já conferidas (resposta travada).
  const [conferidas, setConferidas] = useState<Set<number>>(new Set())
  const [marcadas, setMarcadas] = useState<Set<number>>(new Set())
  const [confirmarFim, setConfirmarFim] = useState(false)

  const inicio = useRef(Date.now())
  const [segundos, setSegundos] = useState(0)

  useEffect(() => {
    const intervalo = setInterval(
      () => setSegundos(Math.floor((Date.now() - inicio.current) / 1000)),
      1000
    )
    return () => clearInterval(intervalo)
  }, [])

  // Sair no meio perde as respostas.
  useEffect(() => {
    const avisar = (e: BeforeUnloadEvent) => e.preventDefault()
    window.addEventListener('beforeunload', avisar)
    return () => window.removeEventListener('beforeunload', avisar)
  }, [])

  const questao = questoes[atual]
  const resposta = respostas[questao.id] ?? null
  const conferida = modo === 'ESTUDO' && conferidas.has(questao.id)
  const respondidas = questoes.filter((q) => respostas[q.id] != null).length
  const emBranco = questoes.length - respondidas
  const ultima = atual === questoes.length - 1

  const responder = useCallback(
    (alternativa: number) => {
      if (conferida) return
      setRespostas((prev) => ({ ...prev, [questao.id]: alternativa }))
    },
    [conferida, questao.id]
  )

  const irPara = useCallback(
    (indice: number) =>
      setAtual(Math.min(Math.max(indice, 0), questoes.length - 1)),
    [questoes.length]
  )

  const conferir = () => setConferidas((prev) => new Set(prev).add(questao.id))

  const alternarMarcada = () =>
    setMarcadas((prev) => {
      const nova = new Set(prev)
      if (nova.has(questao.id)) nova.delete(questao.id)
      else nova.add(questao.id)
      return nova
    })

  const finalizar = () =>
    onFinalizar(respostas, Math.floor((Date.now() - inicio.current) / 1000))

  const pedirFinalizar = () => {
    if (emBranco > 0) setConfirmarFim(true)
    else finalizar()
  }

  // Ação principal: no modo estudo, conferir antes de avançar.
  const avancar = () => {
    if (modo === 'ESTUDO' && resposta !== null && !conferida) conferir()
    else if (ultima) pedirFinalizar()
    else irPara(atual + 1)
  }

  // Atalhos: A-F ou 1-6 respondem, setas navegam, Enter avança.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (confirmarFim || e.ctrlKey || e.metaKey || e.altKey) return
      if (
        e.target instanceof HTMLElement &&
        e.target.closest('input, textarea')
      )
        return

      const tecla = e.key.toLowerCase()
      const indice = /^[1-6]$/.test(tecla)
        ? Number(tecla) - 1
        : LETRAS.indexOf(tecla)

      if (indice >= 0 && indice < questao.alternativas.length) {
        responder(indice)
      } else if (e.key === 'ArrowRight') {
        irPara(atual + 1)
      } else if (e.key === 'ArrowLeft') {
        irPara(atual - 1)
      } else if (
        e.key === 'Enter' &&
        !(e.target instanceof HTMLButtonElement)
      ) {
        avancar()
      } else {
        return
      }
      e.preventDefault()
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  })

  const rotuloAvancar =
    modo === 'ESTUDO' && resposta !== null && !conferida
      ? 'Conferir resposta'
      : ultima
        ? 'Finalizar'
        : 'Próxima'

  const corNavegador = (q: Questao, indice: number) => {
    const r = respostas[q.id] ?? null
    if (modo === 'ESTUDO' && conferidas.has(q.id)) {
      return r === q.correta
        ? 'bg-emerald-500 text-white'
        : 'bg-red-500 text-white'
    }
    if (r !== null) return 'bg-black text-white'
    return indice === atual
      ? 'bg-white text-gray-900'
      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
  }

  return (
    <div className="mx-auto max-w-6xl space-y-4">
      <div className="sticky top-0 z-10 rounded-2xl border border-gray-100 bg-white/95 p-4 shadow-md backdrop-blur max-lg:top-12">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="truncate text-sm font-bold">{titulo}</p>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              {respondidas} de {questoes.length} respondidas
              {treino && <Etiqueta tom="alerta">Treino das erradas</Etiqueta>}
              {modo === 'ESTUDO' && <Etiqueta>Modo estudo</Etiqueta>}
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <span className="inline-flex items-center gap-1.5 font-mono text-sm font-semibold tabular-nums text-gray-700">
              <LuClock />
              {formatarCronometro(segundos)}
            </span>
            <button
              type="button"
              onClick={pedirFinalizar}
              className="cursor-pointer rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800"
            >
              Finalizar
            </button>
          </div>
        </div>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full rounded-full bg-black transition-all duration-300"
            style={{ width: `${(respondidas / questoes.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,1fr)_16rem]">
        <div className="space-y-5 rounded-2xl border border-gray-100 bg-white p-6 shadow-md max-md:p-4">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-semibold text-gray-500">
              Questão {atual + 1} de {questoes.length}
            </span>
            <button
              type="button"
              onClick={alternarMarcada}
              className={clsx(
                'inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition',
                marcadas.has(questao.id)
                  ? 'bg-amber-100 text-amber-800'
                  : 'text-gray-500 hover:bg-gray-100'
              )}
            >
              <LuFlag />
              {marcadas.has(questao.id)
                ? 'Marcada para revisar'
                : 'Revisar depois'}
            </button>
          </div>

          <p className="whitespace-pre-wrap text-lg font-semibold leading-snug text-gray-900 max-md:text-base">
            {questao.enunciado}
          </p>

          <div className="space-y-2.5">
            {questao.alternativas.map((texto, indice) => (
              <AlternativaOpcao
                key={indice}
                indice={indice}
                texto={texto}
                estado={
                  conferida
                    ? estadoNaCorrecao(indice, questao.correta, resposta)
                    : resposta === indice
                      ? 'selecionada'
                      : 'neutro'
                }
                onClick={conferida ? undefined : () => responder(indice)}
              />
            ))}
          </div>

          {conferida && (
            <div
              className={clsx(
                'space-y-1 rounded-xl p-4 text-sm',
                resposta === questao.correta
                  ? 'bg-emerald-50 text-emerald-900'
                  : 'bg-red-50 text-red-900'
              )}
            >
              <p className="flex items-center gap-1.5 font-semibold">
                {resposta === questao.correta ? (
                  <>
                    <LuCircleCheck /> Resposta certa!
                  </>
                ) : (
                  <>
                    <LuCircleX /> Resposta errada. A certa é a{' '}
                    {numeroParaLetra(questao.correta + 1)}.
                  </>
                )}
              </p>
              {questao.explicacao && (
                <p className="flex items-start gap-1.5 whitespace-pre-wrap text-gray-700">
                  <LuLightbulb className="mt-0.5 shrink-0 text-amber-500" />
                  {questao.explicacao}
                </p>
              )}
            </div>
          )}

          <div className="flex items-center justify-between gap-2 border-t border-gray-100 pt-4">
            <button
              type="button"
              disabled={atual === 0}
              onClick={() => irPara(atual - 1)}
              className="inline-flex cursor-pointer items-center gap-1 rounded-xl px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 disabled:pointer-events-none disabled:opacity-40"
            >
              <LuChevronLeft /> Anterior
            </button>
            <p className="text-xs text-gray-400 max-md:hidden">
              Atalhos: A–{numeroParaLetra(questao.alternativas.length)} para
              responder, ← → para navegar, Enter para avançar
            </p>
            <button
              type="button"
              onClick={avancar}
              className="inline-flex cursor-pointer items-center gap-1 rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800"
            >
              {rotuloAvancar}{' '}
              {rotuloAvancar === 'Próxima' && <LuChevronRight />}
            </button>
          </div>
        </div>

        <div className="space-y-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-md lg:sticky lg:top-32">
          <p className="text-sm font-semibold text-gray-900">Questões</p>
          <div className="grid grid-cols-6 gap-1.5 lg:grid-cols-5">
            {questoes.map((q, indice) => (
              <button
                key={q.id}
                type="button"
                onClick={() => irPara(indice)}
                title={`Questão ${indice + 1}`}
                className={clsx(
                  'relative aspect-square cursor-pointer rounded-lg text-xs font-bold transition',
                  corNavegador(q, indice),
                  indice === atual && 'ring-2 ring-black ring-offset-2'
                )}
              >
                {indice + 1}
                {marcadas.has(q.id) && (
                  <span className="absolute -right-0.5 -top-0.5 size-2.5 rounded-full bg-amber-400 ring-2 ring-white" />
                )}
              </button>
            ))}
          </div>
          <div className="space-y-1 border-t border-gray-100 pt-3 text-xs text-gray-500">
            <p className="flex items-center gap-2">
              <span className="size-2.5 rounded-sm bg-black" /> Respondida
            </p>
            <p className="flex items-center gap-2">
              <span className="size-2.5 rounded-sm bg-gray-200" /> Em branco
            </p>
            <p className="flex items-center gap-2">
              <span className="size-2.5 rounded-full bg-amber-400" /> Para
              revisar ({marcadas.size})
            </p>
          </div>
        </div>
      </div>

      <ModalConfirmacao
        open={confirmarFim}
        onClose={() => setConfirmarFim(false)}
        onConfirm={() => {
          setConfirmarFim(false)
          finalizar()
        }}
        titulo="Finalizar com questões em branco?"
        descricao={
          <>
            Você deixou{' '}
            <strong>
              {emBranco} {emBranco === 1 ? 'questão' : 'questões'}
            </strong>{' '}
            sem resposta. Elas não contam como acerto no resultado.
          </>
        }
        confirmar="Finalizar mesmo assim"
      />
    </div>
  )
}

export default ResolucaoQuestionario
