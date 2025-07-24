'use client'
import { LuTimer } from 'react-icons/lu'
import { usePathname } from 'next/navigation'
import { HiOutlineLogout } from 'react-icons/hi'
import { FaTasks } from 'react-icons/fa'
import Link from 'next/link'
import { GiProgression } from 'react-icons/gi'
import { FaHome } from 'react-icons/fa'
import Image from 'next/image'
import { classNames } from '@/utils/auxiliars'

const options = [
  {
    path: '/home',
    icon: <FaHome />,
    name: 'Tela Inicial'
  },
  {
    icon: <GiProgression />,
    path: '/courseProgression',
    name: 'Progressão de curso'
  },
  {
    icon: <LuTimer />,
    path: '/pomodoro',
    name: 'Pomodo'
  },
  {
    icon: <FaTasks />,
    path: '/questions',
    name: 'Questões'
  }
]

export default function Navbar() {
  const pathname = usePathname()

  const getFirstPath = () => {
    return '/' + pathname.split('/')[1]
  }

  return (
    <nav className="flex sticky top-0 bg-white h-screen flex-col min-w-72 max-w-72 gap-4 p-2">
      <Image
        src={'/logo.png'}
        className="w-10/12 mt-2 mx-auto h-auto"
        width={1000}
        height={1000}
        quality={100}
        alt="Logo"
      />
      <div className=" flex gap-2 border border-gray-100 rounded-full shadow-lg p-3">
        <div className="aspect-square h-full rounded-full bg-gray-200"></div>
        <div className="flex flex-col">
          <p className="font-semibold text-sm">Lucas Maia</p>
          <span className="text-xs bg-gray-100 w-fit px-2 py-0.5 rounded-sm">
            Adminstrador
          </span>
        </div>
      </div>
      <div className="flex flex-col overflow-auto gap-2">
        {options.map((option) => (
          <Link
            key={option.path}
            href={`${option.path}`}
            className={classNames(
              option.path.includes(getFirstPath()) ? 'bg-black text-white' : '',
              'text-2xl flex gap-2 text-black justify-start hover:text-white hover:bg-black duration-200 w-full items-center px-3 py-2 rounded-full'
            )}
          >
            {option.icon}
            <span className="text-sm font-semibold">{option.name}</span>
          </Link>
        ))}
      </div>
      <div className="flex gap-1 items-center mt-auto">
        <HiOutlineLogout className="text-2xl" />
        <span className="text-sm font-semibold">Sair</span>
      </div>
      <div></div>
    </nav>
  )
}
