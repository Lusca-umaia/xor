'use client'

import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import clsx from 'clsx'
import Link from 'next/link'
import {
  LuBookOpen,
  LuEllipsisVertical,
  LuListChecks,
  LuPencil,
  LuPlay,
  LuSparkles,
  LuTrash2
} from 'react-icons/lu'
import { QuestionarioResumo } from '@/@types/Questionario'
import {
  DIFICULDADE_LABEL,
  formatarData,
  tomDoPercentual
} from '@/utils/questionarios'
import Etiqueta from './Etiqueta'

interface QuestionarioCardProps {
  questionario: QuestionarioResumo
  onExcluir: (questionario: QuestionarioResumo) => void
}

const corDaBarra = (valor: number) =>
  valor >= 70 ? 'bg-emerald-500' : valor >= 50 ? 'bg-amber-400' : 'bg-red-500'

const QuestionarioCard: React.FC<QuestionarioCardProps> = ({
  questionario,
  onExcluir
}) => {
  const {
    id,
    titulo,
    descricao,
    disciplina,
    origem,
    dificuldade,
    totalQuestoes,
    totalResolucoes,
    melhorPercentual,
    ultimaResolucao,
    atualizadoEm
  } = questionario

  return (
    <div className="group flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-md transition hover:-translate-y-0.5 hover:shadow-lg">
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 flex-wrap gap-1.5">
          {disciplina && (
            <Etiqueta
              title={disciplina.nome}
              icon={<LuBookOpen className="shrink-0" />}
              className="max-w-48"
            >
              {disciplina.codigo} · {disciplina.nome}
            </Etiqueta>
          )}
          {origem === 'IA' && (
            <Etiqueta tom="ia" icon={<LuSparkles />}>
              Gerado com IA
            </Etiqueta>
          )}
          {dificuldade && <Etiqueta>{DIFICULDADE_LABEL[dificuldade]}</Etiqueta>}
        </div>

        <Menu>
          <MenuButton
            title="Mais ações"
            className="-mr-1 -mt-1 cursor-pointer rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-900"
          >
            <LuEllipsisVertical className="text-lg" />
          </MenuButton>
          <MenuItems
            transition
            anchor="bottom end"
            className="z-30 w-40 rounded-xl bg-white p-1 text-sm shadow-lg ring-1 ring-black/5 [--anchor-gap:4px] focus:outline-none data-closed:scale-95 data-closed:opacity-0 transition duration-100"
          >
            <MenuItem>
              <Link
                href={`/questoes/criar-questionario?id=${id}`}
                className="flex items-center gap-2 rounded-lg px-3 py-2 font-medium text-gray-900 data-focus:bg-gray-100"
              >
                <LuPencil /> Editar
              </Link>
            </MenuItem>
            <MenuItem>
              <button
                type="button"
                onClick={() => onExcluir(questionario)}
                className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 font-medium text-red-600 data-focus:bg-red-50"
              >
                <LuTrash2 /> Excluir
              </button>
            </MenuItem>
          </MenuItems>
        </Menu>
      </div>

      <div className="space-y-1">
        <h3
          title={titulo}
          className="line-clamp-2 text-lg font-bold leading-tight tracking-tight"
        >
          {titulo}
        </h3>
        {descricao && (
          <p className="line-clamp-2 text-sm text-gray-500">{descricao}</p>
        )}
      </div>

      <div className="flex items-center gap-3 text-xs font-medium text-gray-500">
        <span className="inline-flex items-center gap-1">
          <LuListChecks className="text-sm" />
          {totalQuestoes} {totalQuestoes === 1 ? 'questão' : 'questões'}
        </span>
        <span aria-hidden="true">•</span>
        <span>Atualizado em {formatarData(atualizadoEm)}</span>
      </div>

      <div className="mt-auto rounded-xl bg-gray-50 p-3">
        {ultimaResolucao ? (
          <div className="space-y-2">
            <div className="flex items-baseline justify-between text-sm">
              <span className="font-medium text-gray-600">
                Última resolução
              </span>
              <span
                className={clsx(
                  'font-bold',
                  tomDoPercentual(ultimaResolucao.percentual)
                )}
              >
                {ultimaResolucao.percentual}%
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-gray-200">
              <div
                className={clsx(
                  'h-full rounded-full',
                  corDaBarra(ultimaResolucao.percentual)
                )}
                style={{ width: `${ultimaResolucao.percentual}%` }}
              />
            </div>
            <p className="text-xs text-gray-500">
              Melhor {melhorPercentual}% · {totalResolucoes}{' '}
              {totalResolucoes === 1 ? 'resolução' : 'resoluções'}
            </p>
          </div>
        ) : (
          <p className="py-1.5 text-center text-sm text-gray-500">
            Você ainda não resolveu este questionário
          </p>
        )}
      </div>

      <Link
        href={`/questoes/responder-questionario?id=${id}`}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-black px-3.5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-gray-800"
      >
        <LuPlay />
        {totalResolucoes > 0 ? 'Resolver novamente' : 'Responder'}
      </Link>
    </div>
  )
}

export default QuestionarioCard
