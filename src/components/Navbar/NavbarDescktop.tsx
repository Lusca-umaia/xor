'use client'
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import clsx from 'clsx'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'
import {
  LuEllipsis,
  LuLock,
  LuLogOut,
  LuPanelLeftClose,
  LuPanelLeftOpen,
  LuUserRound
} from 'react-icons/lu'
import icone from '@/app/icon.png'
import { useArmazenado } from '@/app/(private)/pomodoro/hooks/useArmazenado'
import { useLogout } from '@/hooks/mutations/useLogout'
import { useMe } from '@/hooks/queries/useMe'
import Avatar from '../Avatar/Avatar'
import Skeleton from '../Skeleton/Skeleton'
import { estaAtivo, grupos, PERFIL, PRIVACIDADE } from './itensNav'

// Atalho para recolher a barra; não age enquanto o aluno digita (no editor
// de texto, Ctrl+B é negrito).
const ehEditavel = (alvo: EventTarget | null) =>
  alvo instanceof HTMLElement &&
  (alvo.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(alvo.tagName))

const classeItemMenu =
  'flex w-full cursor-pointer items-center gap-2 rounded-md px-2.5 py-2 text-sm font-medium text-gray-700 data-focus:bg-gray-100'

export default function NavbarDescktop() {
  const pathname = usePathname()
  const { data: me } = useMe()
  const { mutate: sair, isPending: saindo } = useLogout()
  // Preferência do dispositivo: fica no navegador.
  const [recolhida, setRecolhida] = useArmazenado('xor:navbar:recolhida', false)

  useEffect(() => {
    const aoTeclar = (evento: KeyboardEvent) => {
      if (
        (evento.ctrlKey || evento.metaKey) &&
        evento.key.toLowerCase() === 'b' &&
        !ehEditavel(evento.target)
      ) {
        evento.preventDefault()
        setRecolhida((atual) => !atual)
      }
    }
    window.addEventListener('keydown', aoTeclar)
    return () => window.removeEventListener('keydown', aoTeclar)
  }, [setRecolhida])

  return (
    <nav
      aria-label="Menu principal"
      className={clsx(
        'sticky top-0 flex h-screen shrink-0 flex-col border-r border-gray-100 bg-white transition-[width] duration-200 max-lg:hidden print:hidden',
        recolhida ? 'w-[68px]' : 'w-64'
      )}
    >
      <div
        className={clsx(
          'flex h-14 shrink-0 items-center gap-2',
          recolhida ? 'flex-col justify-center px-2' : 'justify-between px-4'
        )}
      >
        {recolhida ? (
          <Link href="/home" aria-label="Tela inicial">
            <Image src={icone} alt="" className="size-8" priority />
          </Link>
        ) : (
          <Link href="/home" aria-label="Tela inicial">
            <Image
              src="/logo.png"
              alt="XOR"
              width={832}
              height={389}
              className="h-8 w-auto"
              priority
            />
          </Link>
        )}
        {!recolhida && (
          <button
            type="button"
            onClick={() => setRecolhida(true)}
            title="Recolher menu (Ctrl+B)"
            aria-label="Recolher menu"
            className="cursor-pointer rounded-md p-1.5 text-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700"
          >
            <LuPanelLeftClose />
          </button>
        )}
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-3 py-2">
        {recolhida && (
          <button
            type="button"
            onClick={() => setRecolhida(false)}
            title="Expandir menu (Ctrl+B)"
            aria-label="Expandir menu"
            className="mx-auto cursor-pointer rounded-md p-2 text-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700"
          >
            <LuPanelLeftOpen />
          </button>
        )}
        {grupos.map(({ titulo, itens }, indice) => (
          <div key={titulo ?? indice} className="flex flex-col gap-0.5">
            {titulo &&
              (recolhida ? (
                <hr className="mx-2 mb-1 border-gray-100" />
              ) : (
                <p className="px-2.5 pb-1 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                  {titulo}
                </p>
              ))}
            {itens.map((item) => {
              const ativo = estaAtivo(pathname, item.path)
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  aria-current={ativo ? 'page' : undefined}
                  title={recolhida ? item.name : undefined}
                  className={clsx(
                    'relative flex h-9 items-center gap-2.5 rounded-lg text-sm font-medium transition-colors',
                    recolhida ? 'justify-center' : 'px-2.5',
                    ativo
                      ? 'bg-xor-navy/5 text-xor-navy'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  )}
                >
                  {ativo && (
                    <span
                      aria-hidden="true"
                      className="absolute top-1.5 bottom-1.5 left-0 w-0.5 rounded-full bg-xor-navy"
                    />
                  )}
                  <span className="shrink-0 text-lg">{item.icon}</span>
                  {!recolhida && <span className="truncate">{item.name}</span>}
                </Link>
              )
            })}
          </div>
        ))}
      </div>

      <div className="shrink-0 border-t border-gray-100 p-3">
        <Menu>
          <MenuButton
            title={recolhida ? (me?.nome ?? 'Conta') : undefined}
            className={clsx(
              'flex w-full cursor-pointer items-center gap-2.5 rounded-lg p-1.5 text-left outline-none hover:bg-gray-50 data-active:bg-gray-50 data-focus:ring-2 data-focus:ring-xor-navy',
              recolhida && 'justify-center',
              estaAtivo(pathname, PERFIL) && 'bg-xor-navy/5'
            )}
          >
            <Avatar nome={me?.nome} className="size-8 text-xs" />
            {!recolhida && (
              <>
                <div className="min-w-0 flex-1">
                  {me ? (
                    <p className="truncate text-sm font-semibold text-gray-900">
                      {me.nome}
                    </p>
                  ) : (
                    <Skeleton className="h-4 w-28" />
                  )}
                  <p className="text-xs text-gray-500">Estudante</p>
                </div>
                <LuEllipsis className="shrink-0 text-gray-400" />
              </>
            )}
          </MenuButton>
          <MenuItems
            anchor={recolhida ? 'right end' : 'top start'}
            className="z-50 w-56 rounded-xl border border-gray-100 bg-white p-1.5 shadow-xl outline-none [--anchor-gap:8px]"
          >
            <MenuItem>
              <Link href={PERFIL} className={classeItemMenu}>
                <LuUserRound className="text-gray-400" />
                Meu perfil
              </Link>
            </MenuItem>
            <MenuItem>
              <Link href={PRIVACIDADE} className={classeItemMenu}>
                <LuLock className="text-gray-400" />
                Privacidade e IA
              </Link>
            </MenuItem>
            <div className="my-1 h-px bg-gray-100" />
            <MenuItem disabled={saindo}>
              <button
                type="button"
                onClick={() => sair()}
                className={clsx(classeItemMenu, 'data-disabled:opacity-60')}
              >
                <LuLogOut className="text-gray-400" />
                {saindo ? 'Saindo...' : 'Sair'}
              </button>
            </MenuItem>
          </MenuItems>
        </Menu>
      </div>
    </nav>
  )
}
