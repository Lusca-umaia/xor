'use client'
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react'
import clsx from 'clsx'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  LuLayoutGrid,
  LuLock,
  LuLogOut,
  LuUserRound,
  LuX
} from 'react-icons/lu'
import { useLogout } from '@/hooks/mutations/useLogout'
import { useMe } from '@/hooks/queries/useMe'
import Avatar from '../Avatar/Avatar'
import {
  ATALHOS_MOBILE,
  estaAtivo,
  grupos,
  ItemNav,
  PERFIL,
  PRIVACIDADE
} from './Navbar'

const todos = grupos.flatMap(({ itens }) => itens)
const atalhos = ATALHOS_MOBILE.map(
  (path) => todos.find((item) => item.path === path) as ItemNav
)
// Na folha "Mais" entra só o que não está na barra inferior.
const gruposMais = grupos
  .map(({ titulo, itens }) => ({
    titulo,
    itens: itens.filter(({ path }) => !ATALHOS_MOBILE.includes(path))
  }))
  .filter(({ itens }) => itens.length > 0)

const classeLinhaFolha =
  'flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium'

export default function NavbarMobile() {
  const pathname = usePathname()
  const { data: me } = useMe()
  const { mutate: sair, isPending: saindo } = useLogout()
  const [maisAberto, setMaisAberto] = useState(false)

  // Fecha a folha ao trocar de tela.
  useEffect(() => setMaisAberto(false), [pathname])

  const maisAtivo =
    !ATALHOS_MOBILE.some((path) => estaAtivo(pathname, path)) || maisAberto

  return (
    <div className="lg:hidden print:hidden">
      <header className="fixed inset-x-0 top-0 z-20 flex h-[50px] items-center justify-between border-b border-gray-100 bg-white/90 px-3 backdrop-blur">
        <Link href="/home" aria-label="Tela inicial">
          <Image
            src="/logo.png"
            alt="XOR"
            width={832}
            height={389}
            className="h-7 w-auto"
            priority
          />
        </Link>
        <Link href={PERFIL} aria-label="Meu perfil">
          <Avatar nome={me?.nome} className="size-8 text-xs" />
        </Link>
      </header>

      <nav
        aria-label="Menu principal"
        className="fixed inset-x-0 bottom-0 z-20 border-t border-gray-100 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur"
      >
        <ul className="grid grid-cols-5">
          {atalhos.map((item) => {
            const ativo = estaAtivo(pathname, item.path)
            return (
              <li key={item.path}>
                <Link
                  href={item.path}
                  aria-current={ativo ? 'page' : undefined}
                  className={clsx(
                    'flex h-14 flex-col items-center justify-center gap-0.5 text-[11px] font-medium',
                    ativo ? 'text-xor-navy' : 'text-gray-500'
                  )}
                >
                  <span
                    className={clsx(
                      'flex h-7 w-12 items-center justify-center rounded-full text-lg transition-colors',
                      ativo && 'bg-xor-navy/10'
                    )}
                  >
                    {item.icon}
                  </span>
                  {item.curto ?? item.name}
                </Link>
              </li>
            )
          })}
          <li>
            <button
              type="button"
              onClick={() => setMaisAberto(true)}
              aria-haspopup="dialog"
              aria-expanded={maisAberto}
              className={clsx(
                'flex h-14 w-full cursor-pointer flex-col items-center justify-center gap-0.5 text-[11px] font-medium',
                maisAtivo ? 'text-xor-navy' : 'text-gray-500'
              )}
            >
              <span
                className={clsx(
                  'flex h-7 w-12 items-center justify-center rounded-full text-lg transition-colors',
                  maisAtivo && 'bg-xor-navy/10'
                )}
              >
                <LuLayoutGrid />
              </span>
              Mais
            </button>
          </li>
        </ul>
      </nav>

      <Dialog
        open={maisAberto}
        onClose={() => setMaisAberto(false)}
        className="relative z-50 lg:hidden"
      >
        <div
          aria-hidden="true"
          className="fixed inset-0 bg-black/30 backdrop-blur-sm"
        />
        <div className="fixed inset-x-0 bottom-0 flex max-h-[85vh]">
          <DialogPanel
            transition
            className="flex w-full flex-col overflow-hidden rounded-t-2xl bg-white pb-[env(safe-area-inset-bottom)] shadow-2xl transition duration-200 ease-out data-closed:translate-y-full"
          >
            <div className="flex items-center justify-between px-4 pt-3 pb-2">
              <DialogTitle className="text-base font-bold text-gray-900">
                Menu
              </DialogTitle>
              <button
                type="button"
                onClick={() => setMaisAberto(false)}
                aria-label="Fechar menu"
                className="cursor-pointer rounded-full p-2 text-lg text-gray-500 hover:bg-gray-100"
              >
                <LuX />
              </button>
            </div>

            <div className="space-y-4 overflow-y-auto px-3 pb-4">
              {gruposMais.map(({ titulo, itens }, indice) => (
                <div key={titulo ?? indice} className="space-y-0.5">
                  {titulo && (
                    <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                      {titulo}
                    </p>
                  )}
                  {itens.map((item) => {
                    const ativo = estaAtivo(pathname, item.path)
                    return (
                      <Link
                        key={item.path}
                        href={item.path}
                        aria-current={ativo ? 'page' : undefined}
                        className={clsx(
                          classeLinhaFolha,
                          ativo
                            ? 'bg-xor-navy/5 text-xor-navy'
                            : 'text-gray-700 active:bg-gray-100'
                        )}
                      >
                        <span className="text-lg">{item.icon}</span>
                        {item.name}
                      </Link>
                    )
                  })}
                </div>
              ))}

              <div className="space-y-0.5 border-t border-gray-100 pt-3">
                <Link
                  href={PERFIL}
                  className={clsx(
                    classeLinhaFolha,
                    'text-gray-700 active:bg-gray-100'
                  )}
                >
                  <LuUserRound className="text-lg" />
                  Meu perfil
                </Link>
                <Link
                  href={PRIVACIDADE}
                  className={clsx(
                    classeLinhaFolha,
                    'text-gray-700 active:bg-gray-100'
                  )}
                >
                  <LuLock className="text-lg" />
                  Privacidade e IA
                </Link>
                <button
                  type="button"
                  disabled={saindo}
                  onClick={() => sair()}
                  className={clsx(
                    classeLinhaFolha,
                    'w-full cursor-pointer text-red-600 active:bg-red-50 disabled:opacity-60'
                  )}
                >
                  <LuLogOut className="text-lg" />
                  {saindo ? 'Saindo...' : 'Sair'}
                </button>
              </div>
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </div>
  )
}
