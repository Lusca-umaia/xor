'use client'

import clsx from 'clsx'
import Link from 'next/link'
import {
  LuCircleCheck,
  LuLayers,
  LuListChecks,
  LuLoader,
  LuPencilLine,
  LuSquareCheck,
  LuTextCursorInput,
  LuTrash2
} from 'react-icons/lu'
import { AtividadeListagem, TipoAtividade } from '@/@types/AmbienteEstudo'
import { formatarDataRelativa } from '@/utils/ambienteEstudo/formatar'
import { ROTULO_TIPO_ATIVIDADE } from '@/utils/ambienteEstudo/rotulos'
import { classeCartao } from '../estilos'
import MenuAcoes from '../MenuAcoes/MenuAcoes'

export const ICONE_ATIVIDADE: Record<TipoAtividade, typeof LuListChecks> = {
  QUIZ: LuListChecks,
  VERDADEIRO_FALSO: LuSquareCheck,
  LACUNAS: LuTextCursorInput,
  DISCURSIVA: LuPencilLine,
  FLASHCARDS: LuLayers
}

export default function CardAtividade({
  atividade,
  href,
  aoExcluir
}: {
  atividade: AtividadeListagem
  href: string
  aoExcluir: () => void
}) {
  const Icone = ICONE_ATIVIDADE[atividade.tipo]
  const gerando = atividade.status === 'GERANDO'
  const flashcards = atividade.tipo === 'FLASHCARDS'
  const quantidade = flashcards
    ? atividade.flashcards.length
    : atividade.questoes.length

  return (
    <div className={clsx(classeCartao, 'relative flex flex-col gap-3 p-5')}>
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-xor-navy/5 text-xl text-xor-navy ring-1 ring-inset ring-xor-navy/10">
          {gerando ? (
            <LuLoader className="animate-spin" aria-hidden />
          ) : (
            <Icone aria-hidden />
          )}
        </span>
        <div className="min-w-0 flex-1">
          {gerando ? (
            <p className="font-bold text-gray-900">{atividade.titulo}</p>
          ) : (
            <Link
              href={href}
              className="font-bold text-gray-900 after:absolute after:inset-0 focus-visible:outline-none"
            >
              {atividade.titulo}
            </Link>
          )}
          <p className="text-xs text-gray-500">
            {ROTULO_TIPO_ATIVIDADE[atividade.tipo]}
            {!gerando &&
              ` · ${quantidade} ${flashcards ? 'cartões' : 'questões'}`}
          </p>
        </div>
        <div className="relative z-10">
          <MenuAcoes
            acoes={[
              {
                rotulo: 'Excluir',
                icone: <LuTrash2 />,
                aoClicar: aoExcluir,
                perigosa: true
              }
            ]}
          />
        </div>
      </div>

      {gerando ? (
        <p className="text-sm text-gray-500" role="status">
          Gerando a partir dos seus materiais...
        </p>
      ) : (
        <div className="flex flex-wrap gap-2 text-xs">
          {flashcards && (
            <span
              className={clsx(
                'rounded-full px-2 py-0.5 font-semibold',
                atividade.flashcardsPendentes > 0
                  ? 'bg-black text-white'
                  : 'bg-gray-100 text-gray-600'
              )}
            >
              {atividade.flashcardsPendentes > 0
                ? `${atividade.flashcardsPendentes} para revisar hoje`
                : 'Revisão em dia'}
            </span>
          )}
          {atividade.melhorResultado && (
            <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 font-semibold text-green-800">
              <LuCircleCheck aria-hidden />
              Melhor: {atividade.melhorResultado.acertos}/
              {atividade.melhorResultado.total}
            </span>
          )}
          {atividade.tentativaEmAndamento && (
            <span className="rounded-full bg-amber-50 px-2 py-0.5 font-semibold text-amber-800">
              Em andamento
            </span>
          )}
          {atividade.origemChatId && (
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-gray-600">
              Criada a partir de um chat
            </span>
          )}
          {atividade.origemResumoId && (
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-gray-600">
              Criada a partir de um resumo
            </span>
          )}
        </div>
      )}
      <p className="mt-auto text-xs text-gray-400">
        {formatarDataRelativa(atividade.criadoEm)}
      </p>
    </div>
  )
}
