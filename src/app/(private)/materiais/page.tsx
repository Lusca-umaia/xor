'use client'
import clsx from 'clsx'
import { ReactNode, useState } from 'react'
import { LuBookOpen, LuPlay } from 'react-icons/lu'
import Header from '@/components/Header/Header'
import Skeleton from '@/components/Skeleton/Skeleton'
import { useDisciplinasAtivas } from '@/hooks/useDisciplinasAtivas'
import LivrosTab from './components/LivrosTab'
import PlaylistsTab from './components/PlaylistsTab'

const TABS = [
  { key: 'playlists', label: 'Minhas playlists', icon: <LuPlay /> },
  { key: 'livros', label: 'Livros de acesso livre', icon: <LuBookOpen /> }
] as const satisfies readonly { key: string; label: string; icon: ReactNode }[]

type TabKey = (typeof TABS)[number]['key']

const MateriaisPage = () => {
  const [tab, setTab] = useState<TabKey>('playlists')
  const { ativas, isLoading } = useDisciplinasAtivas()

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-80 max-w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  return (
    <div>
      <Header
        title="Biblioteca"
        description="Playlists do YouTube e livros de acesso livre para as suas disciplinas."
      />
      <div className="space-y-4">
        <div
          role="tablist"
          className="flex w-fit max-w-full gap-1 overflow-x-auto rounded-full border border-gray-100 bg-white p-1 shadow-lg"
        >
          {TABS.map(({ key, label, icon }) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={tab === key}
              onClick={() => setTab(key)}
              className={clsx(
                'flex shrink-0 cursor-pointer items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold duration-200 max-md:px-3',
                tab === key
                  ? 'bg-black text-white'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              )}
            >
              <span className="text-base max-sm:hidden">{icon}</span>
              {label}
            </button>
          ))}
        </div>

        {tab === 'playlists' && <PlaylistsTab />}
        {tab === 'livros' && <LivrosTab ativas={ativas} />}
      </div>
    </div>
  )
}

export default MateriaisPage
