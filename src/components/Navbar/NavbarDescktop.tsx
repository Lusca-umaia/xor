'use client'
import { usePathname } from 'next/navigation'
import { HiOutlineLogout } from 'react-icons/hi'
import Link from 'next/link'
import Image from 'next/image'
import { classNames } from '@/utils/auxiliars'
import { grupos } from './Navbar'
import { useMe } from '@/hooks/queries/useMe'
import { useLogout } from '@/hooks/mutations/useLogout'
import Skeleton from '../Skeleton/Skeleton'
import Avatar from '../Avatar/Avatar'

export default function NavbarDescktop() {
  const pathname = usePathname()
  const { data: me } = useMe()
  const { mutate: sair, isPending: saindo } = useLogout()

  const getFirstPath = () => {
    return '/' + pathname.split('/')[1]
  }

  return (
    <nav className="flex max-lg:hidden print:hidden sticky top-0 bg-white h-screen flex-col min-w-72 max-w-72 gap-4 p-2">
      <Image
        src={'/logo.png'}
        className="w-10/12 mt-2 mx-auto h-auto"
        width={1000}
        height={1000}
        quality={100}
        alt="Logo"
      />
      <Link
        href="/perfil"
        title="Meu perfil"
        className="flex items-center gap-2 border border-gray-100 rounded-full shadow-lg p-3 hover:border-gray-200 hover:shadow-xl duration-200"
      >
        <Avatar nome={me?.nome} className="size-10 text-sm" />
        <div className="flex min-w-0 flex-col">
          {me ? (
            <p className="truncate font-semibold text-sm">{me.nome}</p>
          ) : (
            <Skeleton className="h-4 w-32 my-0.5" />
          )}
          <span className="text-xs bg-gray-100 w-fit px-2 py-0.5 rounded-sm">
            Estudante
          </span>
        </div>
      </Link>
      <div className="flex flex-col overflow-auto gap-3">
        {grupos.map(({ titulo, itens }, indice) => (
          <div key={titulo ?? indice} className="flex flex-col gap-1">
            {titulo && (
              <p className="px-3 pt-1 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                {titulo}
              </p>
            )}
            {itens.map((option) => (
              <Link
                key={option.path}
                href={`${option.path}`}
                className={classNames(
                  option.path.includes(getFirstPath())
                    ? 'bg-black text-white'
                    : '',
                  'text-2xl flex gap-2 text-black justify-start hover:text-white hover:bg-black duration-200 w-full items-center px-3 py-2 rounded-full'
                )}
              >
                {option.icon}
                <span className="text-sm font-semibold">{option.name}</span>
              </Link>
            ))}
          </div>
        ))}
      </div>
      <div className="mt-auto">
        <button
          type="button"
          disabled={saindo}
          onClick={() => sair()}
          className="flex cursor-pointer gap-1 items-center disabled:opacity-60"
        >
          <HiOutlineLogout className="text-2xl" />
          <span className="text-sm font-semibold">
            {saindo ? 'Saindo...' : 'Sair'}
          </span>
        </button>
      </div>
    </nav>
  )
}
