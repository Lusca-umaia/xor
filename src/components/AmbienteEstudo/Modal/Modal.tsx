'use client'

import {
  Description,
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle
} from '@headlessui/react'
import clsx from 'clsx'
import { ReactNode } from 'react'
import { LuX } from 'react-icons/lu'

const LARGURAS = {
  sm: 'sm:max-w-md',
  md: 'sm:max-w-lg',
  lg: 'sm:max-w-2xl',
  xl: 'sm:max-w-4xl'
} as const

interface ModalProps {
  aberto: boolean
  aoFechar: () => void
  titulo: ReactNode
  descricao?: ReactNode
  children: ReactNode
  rodape?: ReactNode
  largura?: keyof typeof LARGURAS
  /** Abre como painel lateral à direita (ex.: citações, pré-visualização). */
  lateral?: boolean
}

export default function Modal({
  aberto,
  aoFechar,
  titulo,
  descricao,
  children,
  rodape,
  largura = 'md',
  lateral = false
}: ModalProps) {
  return (
    <Dialog open={aberto} onClose={aoFechar} className="relative z-50">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-gray-900/40 backdrop-blur-[2px] transition-opacity data-closed:opacity-0 data-enter:duration-200 data-leave:duration-150"
      />
      <div
        className={clsx(
          'fixed inset-0 flex',
          lateral
            ? 'justify-end'
            : 'items-end sm:items-center justify-center p-0 sm:p-4'
        )}
      >
        <DialogPanel
          transition
          className={clsx(
            'flex w-full flex-col bg-white shadow-xl transition data-closed:opacity-0 data-enter:duration-200 data-leave:duration-150',
            lateral
              ? 'h-full max-w-md data-closed:translate-x-8'
              : clsx(
                  'max-h-[92vh] rounded-t-2xl sm:rounded-2xl data-closed:translate-y-4',
                  LARGURAS[largura]
                )
          )}
        >
          <div className="flex items-start gap-4 border-b border-gray-100 px-5 py-4">
            <div className="min-w-0 flex-1">
              <DialogTitle className="text-lg font-bold text-gray-900">
                {titulo}
              </DialogTitle>
              {descricao && (
                <Description className="mt-0.5 text-sm text-gray-500">
                  {descricao}
                </Description>
              )}
            </div>
            <button
              type="button"
              onClick={aoFechar}
              className="rounded-md p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-900 cursor-pointer"
              aria-label="Fechar"
            >
              <LuX className="text-xl" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
          {rodape && (
            <div className="flex flex-wrap justify-end gap-2 border-t border-gray-100 px-5 py-3">
              {rodape}
            </div>
          )}
        </DialogPanel>
      </div>
    </Dialog>
  )
}
