'use client'

import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle
} from '@headlessui/react'
import clsx from 'clsx'
import { ReactNode } from 'react'

interface ModalConfirmacaoProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  titulo: string
  descricao: ReactNode
  confirmar: string
  perigo?: boolean
  carregando?: boolean
  erro?: string | null
}

const ModalConfirmacao: React.FC<ModalConfirmacaoProps> = ({
  open,
  onClose,
  onConfirm,
  titulo,
  descricao,
  confirmar,
  perigo = false,
  carregando = false,
  erro
}) => (
  <Dialog open={open} onClose={onClose} className="relative z-20">
    <DialogBackdrop
      transition
      className="fixed inset-0 bg-gray-500/75 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in"
    />
    <div className="fixed inset-0 z-20 w-screen overflow-y-auto">
      <div className="flex min-h-full items-end justify-center p-4 sm:items-center">
        <DialogPanel
          transition
          className="w-full max-w-md transform rounded-2xl bg-white p-6 shadow-xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in data-closed:sm:translate-y-0 data-closed:sm:scale-95"
        >
          <DialogTitle
            as="h3"
            className="text-base font-semibold text-gray-900"
          >
            {titulo}
          </DialogTitle>
          <div className="mt-2 text-sm text-gray-600">{descricao}</div>
          {erro && (
            <p className="mt-3 text-sm font-medium text-red-600">{erro}</p>
          )}
          <div className="mt-6 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer rounded-xl bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-xs ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              disabled={carregando}
              onClick={onConfirm}
              className={clsx(
                'cursor-pointer rounded-xl px-4 py-2 text-sm font-semibold text-white shadow-xs disabled:opacity-60',
                perigo
                  ? 'bg-red-600 hover:bg-red-500'
                  : 'bg-black hover:bg-gray-800'
              )}
            >
              {carregando ? 'Aguarde...' : confirmar}
            </button>
          </div>
        </DialogPanel>
      </div>
    </div>
  </Dialog>
)

export default ModalConfirmacao
