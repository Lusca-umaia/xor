'use client'

import clsx from 'clsx'
import Link from 'next/link'
import { useSelectedLayoutSegment } from 'next/navigation'
import {
  LuFileText,
  LuHouse,
  LuLibrary,
  LuListChecks,
  LuMessagesSquare,
  LuTimer
} from 'react-icons/lu'

const ABAS = [
  { segmento: null, caminho: '', rotulo: 'Visão geral', icone: LuHouse },
  {
    segmento: 'materiais',
    caminho: '/materiais',
    rotulo: 'Materiais',
    icone: LuLibrary
  },
  {
    segmento: 'chats',
    caminho: '/chats',
    rotulo: 'Chats',
    icone: LuMessagesSquare
  },
  {
    segmento: 'resumos',
    caminho: '/resumos',
    rotulo: 'Resumos',
    icone: LuFileText
  },
  {
    segmento: 'atividades',
    caminho: '/atividades',
    rotulo: 'Atividades',
    icone: LuListChecks
  },
  {
    segmento: 'simulados',
    caminho: '/simulados',
    rotulo: 'Simulados',
    icone: LuTimer
  }
]

export default function AbasAmbiente({ ambienteId }: { ambienteId: string }) {
  const segmentoAtivo = useSelectedLayoutSegment()

  return (
    <nav
      aria-label="Seções do ambiente"
      className="-mx-1 flex gap-1 overflow-x-auto border-b border-gray-200 px-1 [scrollbar-width:none]"
    >
      {ABAS.map(({ segmento, caminho, rotulo, icone: Icone }) => {
        const ativa = segmentoAtivo === segmento
        return (
          <Link
            key={rotulo}
            href={`/ambientes/${ambienteId}${caminho}`}
            aria-current={ativa ? 'page' : undefined}
            className={clsx(
              '-mb-px flex shrink-0 items-center gap-2 border-b-2 px-3 py-2.5 text-sm font-semibold transition-colors',
              ativa
                ? 'border-black text-gray-900'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-800'
            )}
          >
            <Icone aria-hidden />
            {rotulo}
          </Link>
        )
      })}
    </nav>
  )
}
