'use client'

import { FaXmark } from 'react-icons/fa6'
import { usePathname, useRouter } from 'next/navigation'

import { options } from './Navbar'
import clsx from 'clsx'
import { useState } from 'react'
import Image from 'next/image'
import { IoMenu } from 'react-icons/io5'
import { HiOutlineLogout } from 'react-icons/hi'
import { useLogout } from '@/hooks/mutations/useLogout'

export default function NavbarMobile() {
  const router = useRouter()
  const pathname = usePathname()

  const [openMenu, setOpenMenu] = useState(false)
  const { mutate: sair } = useLogout()
  const getFirstPath = () => {
    return '/' + pathname.split('/')[1]
  }

  const closeModal = () => {
    setOpenMenu(false)
  }

  return (
    <div className="lg:hidden print:hidden flex items-center w-full fixed top-0 bg-gray-50 border-b border-gray-200/80 h-[50px] z-10">
      <div className="grid grid-cols-3 items-center px-2 w-full">
        <button
          type="button"
          onClick={() => setOpenMenu(true)}
          className="col-span-1 cursor-pointer inline-flex rounded-md bg-white text-gray-900 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-xor-navy focus:ring-offset-2"
        >
          <IoMenu className="text-2xl" />
        </button>
        <Image
          src={'/logo.png'}
          className="h-10 col-span-1 mx-auto w-auto my-2"
          width={1000}
          height={1000}
          quality={100}
          alt="Logo"
        />
      </div>
      {openMenu && (
        <div
          onClick={() => closeModal()}
          className="lg:hidden fixed inset-0 backdrop-blur-md z-0 animate-appearance"
        ></div>
      )}
      <div
        className={clsx(
          openMenu ? 'left-0' : '-left-full',
          'duration-700 lg:hidden max-[340px]:w-full z-10 top-0 fixed flex items-start h-full'
        )}
      >
        <ul
          className={
            'flex flex-col max-[340px]:w-full w-72 gap-2.5 duration-100 h-full bg-white py-2.5 border-r border-gray-200/80 px-2 shadow-inner'
          }
        >
          <button
            type="button"
            onClick={() => closeModal()}
            className="lg:hidden cursor-pointer inline-flex ml-auto rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-xor-navy focus:ring-offset-2"
          >
            <FaXmark className="h-5 w-5" />
          </button>
          <Image
            src={'/logo.png'}
            className="w-2/3 my-2 mx-auto h-auto"
            width={1000}
            height={1000}
            quality={100}
            alt="Logo"
          />
          {options.map((option, index) => (
            <li
              onClick={() => {
                closeModal()
                router.push(option.path)
              }}
              key={index}
              className={clsx(
                option.path.includes(getFirstPath())
                  ? 'bg-black text-white'
                  : 'text-gray-900 bg-gray-50',
                'cursor-pointer text-2xl w-full gap-2 justify-center shadow-md hover:bg-black hover:scale-105 px-3 py-2 hover:text-white duration-100 h-10 flex items-center rounded-full'
              )}
            >
              {option.icon}
              <span className={'w-full text-sm font-semibold duration-100'}>
                {option.name}
              </span>
            </li>
          ))}
          <li
            onClick={() => sair()}
            className="mt-auto mb-2 cursor-pointer text-2xl w-full gap-2 px-3 py-2 h-10 flex items-center rounded-full text-gray-900 hover:bg-gray-100"
          >
            <HiOutlineLogout />
            <span className="text-sm font-semibold">Sair</span>
          </li>
        </ul>
      </div>
    </div>
  )
}
