'use client'

import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import clsx from 'clsx'
import { ReactNode } from 'react'
import { LuEllipsisVertical } from 'react-icons/lu'

export interface AcaoMenu {
  rotulo: string
  icone?: ReactNode
  aoClicar: () => void
  perigosa?: boolean
}

export default function MenuAcoes({
  acoes,
  rotulo = 'Mais ações',
  claro = false
}: {
  acoes: AcaoMenu[]
  rotulo?: string
  /** Botão claro, para fundos escuros (ex.: CapaXor). */
  claro?: boolean
}) {
  return (
    <Menu as="div" className="relative">
      <MenuButton
        className={clsx(
          'rounded-md p-1.5 cursor-pointer',
          claro
            ? 'text-white/80 hover:bg-white/10 hover:text-white'
            : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
        )}
        aria-label={rotulo}
        onClick={(evento) => evento.stopPropagation()}
      >
        <LuEllipsisVertical className="text-lg" />
      </MenuButton>
      <MenuItems
        anchor="bottom end"
        transition
        className="z-50 w-48 rounded-xl border border-gray-100 bg-white p-1 shadow-lg outline-none transition data-closed:scale-95 data-closed:opacity-0"
      >
        {acoes.map(({ rotulo: texto, icone, aoClicar, perigosa }) => (
          <MenuItem key={texto}>
            <button
              type="button"
              onClick={(evento) => {
                evento.stopPropagation()
                aoClicar()
              }}
              className={clsx(
                'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm data-focus:bg-gray-100 cursor-pointer',
                perigosa ? 'text-red-600' : 'text-gray-800'
              )}
            >
              {icone}
              {texto}
            </button>
          </MenuItem>
        ))}
      </MenuItems>
    </Menu>
  )
}
