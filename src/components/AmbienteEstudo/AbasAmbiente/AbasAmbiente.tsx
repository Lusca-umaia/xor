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

  // Abas em pílula, no mesmo estilo das abas da progressão de curso.
  return (
    <nav
      aria-label="Seções do ambiente"
      className="flex w-fit max-w-full gap-1 overflow-x-auto rounded-full border border-gray-100 bg-white p-1 shadow-lg [scrollbar-width:none]"
    >
      {ABAS.map(({ segmento, caminho, rotulo, icone: Icone }) => {
        const ativa = segmentoAtivo === segmento
        return (
          <Link
            key={rotulo}
            href={`/ambientes/${ambienteId}${caminho}`}
            aria-current={ativa ? 'page' : undefined}
            className={clsx(
              'flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold duration-200 max-md:px-3',
              ativa
                ? 'bg-black text-white'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            )}
          >
            <Icone className="text-base max-sm:hidden" aria-hidden />
            {rotulo}
          </Link>
        )
      })}
    </nav>
  )
}
