'use client'

import clsx from 'clsx'
import Link from 'next/link'
import { useState } from 'react'
import {
  LuBookOpen,
  LuClock,
  LuGraduationCap,
  LuHistory,
  LuListChecks,
  LuPencil,
  LuPlay,
  LuShuffle,
  LuSparkles,
  LuTrophy
} from 'react-icons/lu'
import { Questionario } from '@/@types/Questionario'
import {
  DIFICULDADE_LABEL,
  formatarData,
  formatarDuracao,
  tomDoPercentual
} from '@/utils/questionarios'
import Etiqueta from './Etiqueta'

export type ModoResolucao = 'PROVA' | 'ESTUDO'

const MODOS: {
  id: ModoResolucao
  nome: string
  descricao: string
  icon: React.ReactNode
}[] = [
  {
    id: 'PROVA',
    nome: 'Modo prova',
    descricao: 'Responda tudo e veja a correção completa no final.',
    icon: <LuGraduationCap className="text-xl" />
  },
  {
    id: 'ESTUDO',
    nome: 'Modo estudo',
    descricao: 'Confira a resposta e a explicação a cada questão.',
    icon: <LuBookOpen className="text-xl" />
  }
]

interface IntroducaoQuestionarioProps {
  questionario: Questionario
  onIniciar: (opcoes: { modo: ModoResolucao; embaralhar: boolean }) => void
}

const IntroducaoQuestionario: React.FC<IntroducaoQuestionarioProps> = ({
  questionario,
  onIniciar
}) => {
  const [modo, setModo] = useState<ModoResolucao>('PROVA')
  const [embaralhar, setEmbaralhar] = useState(false)

  const { historico, questoes } = questionario
  const melhor = historico.length
    ? Math.max(...historico.map((r) => r.percentual))
    : null
  const comExplicacao = questoes.filter((q) => q.explicacao).length

  const informacoes = [
    {
      label: 'Questões',
      valor: String(questoes.length),
      icon: <LuListChecks />
    },
    {
      label: 'Dificuldade',
      valor: questionario.dificuldade
        ? DIFICULDADE_LABEL[questionario.dificuldade]
        : '-',
      icon: <LuGraduationCap />
    },
    {
      label: 'Melhor resultado',
      valor: melhor === null ? '-' : `${melhor}%`,
      icon: <LuTrophy />
    },
    {
      label: 'Resoluções',
      valor: String(historico.length),
      icon: <LuHistory />
    }
  ]

  return (
    <div className="mx-auto grid max-w-5xl grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="space-y-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-md max-md:p-4">
        <div className="space-y-3">
          <div className="flex flex-wrap gap-1.5">
            {questionario.disciplina && (
              <Etiqueta icon={<LuBookOpen />}>
                {questionario.disciplina.codigo} ·{' '}
                {questionario.disciplina.nome}
              </Etiqueta>
            )}
            {questionario.origem === 'IA' && (
              <Etiqueta tom="ia" icon={<LuSparkles />}>
                Gerado com IA
              </Etiqueta>
            )}
          </div>
          <h1 className="text-2xl font-bold tracking-tight max-md:text-xl">
            {questionario.titulo}
          </h1>
          {questionario.descricao && (
            <p className="whitespace-pre-wrap text-sm text-gray-600">
              {questionario.descricao}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {informacoes.map((info) => (
            <div key={info.label} className="rounded-xl bg-gray-50 p-3">
              <p className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
                {info.icon}
                {info.label}
              </p>
              <p className="mt-1 text-lg font-bold">{info.valor}</p>
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <p className="text-sm font-semibold text-gray-900">
            Como você quer resolver?
          </p>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {MODOS.map((opcao) => (
              <button
                key={opcao.id}
                type="button"
                onClick={() => setModo(opcao.id)}
                aria-pressed={modo === opcao.id}
                className={clsx(
                  'flex cursor-pointer items-start gap-3 rounded-xl p-4 text-left ring-inset transition',
                  modo === opcao.id
                    ? 'bg-gray-50 ring-2 ring-black'
                    : 'ring-1 ring-gray-200 hover:ring-gray-400'
                )}
              >
                <span
                  className={clsx(
                    'rounded-lg p-2',
                    modo === opcao.id
                      ? 'bg-black text-white'
                      : 'bg-gray-100 text-gray-600'
                  )}
                >
                  {opcao.icon}
                </span>
                <span>
                  <span className="block text-sm font-semibold">
                    {opcao.nome}
                  </span>
                  <span className="block text-xs text-gray-500">
                    {opcao.descricao}
                  </span>
                </span>
              </button>
            ))}
          </div>
          {modo === 'ESTUDO' && comExplicacao < questoes.length && (
            <p className="text-xs text-gray-500">
              {comExplicacao === 0
                ? 'Nenhuma questão tem explicação cadastrada; você verá só o gabarito.'
                : `${comExplicacao} de ${questoes.length} questões têm explicação cadastrada.`}
            </p>
          )}
        </div>

        <label className="flex cursor-pointer items-center gap-3 text-sm font-medium text-gray-900">
          <input
            type="checkbox"
            checked={embaralhar}
            onChange={(e) => setEmbaralhar(e.target.checked)}
            className="size-4 cursor-pointer accent-black"
          />
          <LuShuffle className="text-gray-500" />
          Embaralhar a ordem das questões
        </label>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onIniciar({ modo, embaralhar })}
            className="inline-flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-black px-6 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-gray-800"
          >
            <LuPlay /> Começar
          </button>
          <Link
            href={`/questoes/criar-questionario?id=${questionario.id}`}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-3.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
          >
            <LuPencil /> Editar
          </Link>
        </div>
      </div>

      <div className="space-y-3 rounded-2xl border border-gray-100 bg-white p-5 shadow-md">
        <p className="flex items-center gap-2 text-sm font-semibold text-gray-900">
          <LuHistory /> Histórico
        </p>
        {historico.length === 0 ? (
          <p className="text-sm text-gray-500">
            Suas resoluções aparecem aqui para você acompanhar a evolução.
          </p>
        ) : (
          <ul className="space-y-2">
            {historico.map((resolucao) => (
              <li
                key={resolucao.id}
                className="flex items-center justify-between gap-3 rounded-xl px-3 py-2 ring-1 ring-inset ring-gray-100"
              >
                <div>
                  <p className="text-sm font-semibold">
                    {resolucao.acertos}/{resolucao.total} acertos
                  </p>
                  <p className="flex items-center gap-1 text-xs text-gray-500">
                    {formatarData(resolucao.criadoEm)}
                    {resolucao.duracaoSegundos !== null && (
                      <>
                        {' · '}
                        <LuClock />
                        {formatarDuracao(resolucao.duracaoSegundos)}
                      </>
                    )}
                  </p>
                </div>
                <span
                  className={clsx(
                    'text-base font-bold',
                    tomDoPercentual(resolucao.percentual)
                  )}
                >
                  {resolucao.percentual}%
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export default IntroducaoQuestionario
