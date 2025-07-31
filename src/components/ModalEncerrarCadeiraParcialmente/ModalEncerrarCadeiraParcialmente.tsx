'use client'

import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle
} from '@headlessui/react'
import { useState } from 'react'

interface ModalEncerrarCadeiraParcialmenteProps {
  open: boolean
  disciplinaNome: string
  disciplinaId: number
  onClose: (value: boolean) => void
}

const ModalEncerrarCadeiraParcialmente: React.FC<
  ModalEncerrarCadeiraParcialmenteProps
> = ({ open, onClose, disciplinaId, disciplinaNome }) => {
  const [nota, setNota] = useState('')

  return (
    <Dialog open={open} onClose={onClose} className="relative z-10">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-gray-500/75 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in"
      />

      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <DialogPanel
            transition
            className="relative transform max-md:w-full overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8 sm:w-full sm:max-w-lg sm:p-6 data-closed:sm:translate-y-0 data-closed:sm:scale-95"
          >
            <div>
              <DialogTitle
                as="h3"
                className="text-base font-semibold text-gray-900"
              >
                Encerrar cadeira
              </DialogTitle>
              <div className="mt-2">
                <p className="text-sm text-gray-700">
                  Tem certeza de que deseja{' '}
                  <span className="font-bold">encerrar</span> a disciplina{' '}
                  <span className="font-bold">{disciplinaNome}</span>?
                </p>
              </div>
              <div className="flex flex-col gap-4">
                <p className="text-sm items-center text-gray-600 leading-none flex justify-between font-semibold">
                  Forneça a nota obtida na disciplina:
                  <input
                    type={'number'}
                    placeholder="7,00"
                    value={nota ?? ''}
                    min={0}
                    step=".1"
                    max={10}
                    onChange={(e) => setNota(e.target.value)}
                    className="block w-16 ml-auto rounded-md outline-indigo-700 border-0 p-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 font-medium text-sm"
                  />
                </p>
              </div>
            </div>
            <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
              <button
                type="button"
                disabled={!(parseFloat(nota) >= 0 && parseFloat(nota) <= 10)}
                onClick={() => onClose(false)}
                className="disabled:opacity-80 not-disabled:cursor-pointer inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-xs not-disabled:hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:col-start-2"
              >
                Encerrar cadeira
              </button>
              <button
                type="button"
                data-autofocus
                onClick={() => onClose(false)}
                className="mt-3 cursor-pointer inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-xs ring-1 ring-gray-300 ring-inset hover:bg-gray-50 sm:col-start-1 sm:mt-0"
              >
                Cancelar
              </button>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  )
}

export default ModalEncerrarCadeiraParcialmente
