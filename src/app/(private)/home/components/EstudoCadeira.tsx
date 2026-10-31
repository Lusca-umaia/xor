'use client'
import clsx from 'clsx'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ReactNode } from 'react'
import {
  LuArrowRight,
  LuBookOpen,
  LuCalendarDays,
  LuCirclePlay,
  LuClipboardList,
  LuLayers,
  LuLoaderCircle,
  LuPlus,
  LuTarget,
  LuUpload
} from 'react-icons/lu'
import { useCriarAmbiente } from '@/hooks/ambienteEstudo/useAmbientes'
import { corDaCadeira } from '@/utils/ambienteEstudo/cores'
import type { ProximoPasso, TipoPasso } from '../utils/estudoCadeira'

const ICONE_PASSO: Record<TipoPasso, ReactNode> = {
  PROVA: <LuCalendarDays />,
  PRAZO: <LuClipboardList />,
  RETOMAR: <LuCirclePlay />,
  FLASHCARDS: <LuLayers />,
  TOPICO: <LuTarget />,
  COMECAR: <LuUpload />
}

const classeBotaoSecundario =
  'inline-flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:cursor-wait disabled:opacity-60'

/** Situação no ambiente e o próximo passo, logo abaixo do nome da cadeira. */
export function EstudoDaCadeira({
  situacao,
  passo
}: {
  situacao?: string
  passo: ProximoPasso | null
}) {
  if (!situacao && !passo) return null
  return (
    <div className="space-y-2">
      {situacao && (
        <p className="truncate text-xs font-medium text-gray-500">{situacao}</p>
      )}
      {passo && (
        <Link
          href={passo.href}
          className={clsx(
            'group flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition',
            passo.urgente
              ? 'bg-amber-50 text-amber-900 hover:bg-amber-100'
              : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
          )}
        >
          <span
            className={clsx(
              'shrink-0',
              passo.urgente ? 'text-amber-600' : 'text-gray-400'
            )}
          >
            {ICONE_PASSO[passo.tipo]}
          </span>
          <span className="min-w-0 flex-1 truncate" title={passo.texto}>
            {passo.texto}
          </span>
          <LuArrowRight className="shrink-0 opacity-0 transition group-hover:opacity-100" />
        </Link>
      )}
    </div>
  )
}

/** Abre o ambiente da cadeira ou, se ainda não existe, cria e abre. */
export function AcaoEstudo({
  ambienteId,
  codigo,
  nome,
  indisponivel = false
}: {
  ambienteId?: string
  codigo: string
  nome: string
  // Sem o resumo não dá para saber se o ambiente existe: manda para a lista.
  indisponivel?: boolean
}) {
  const router = useRouter()
  const criar = useCriarAmbiente()

  if (ambienteId || indisponivel) {
    return (
      <Link
        href={ambienteId ? `/ambientes/${ambienteId}` : '/ambientes'}
        className={classeBotaoSecundario}
      >
        <LuBookOpen />
        Estudar
      </Link>
    )
  }

  // O ambiente só passa a existir quando o aluno pede.
  return (
    <button
      type="button"
      disabled={criar.isPending}
      onClick={() =>
        criar.mutate(
          {
            nome: nome.slice(0, 80),
            descricao: null,
            cor: corDaCadeira(codigo),
            disciplinaCodigo: codigo
          },
          { onSuccess: (ambiente) => router.push(`/ambientes/${ambiente.id}`) }
        )
      }
      className={classeBotaoSecundario}
    >
      {criar.isPending ? (
        <LuLoaderCircle className="animate-spin" />
      ) : (
        <LuPlus />
      )}
      Começar a estudar
    </button>
  )
}
