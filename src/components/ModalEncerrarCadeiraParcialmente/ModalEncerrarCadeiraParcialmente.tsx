'use client'

import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle
} from '@headlessui/react'
import { useState } from 'react'
import { getErrorMessage } from '@/services/api'
import { useDefinirSituacao } from '@/hooks/mutations/useDisciplinas'
import ResultadoDisciplina, {
  Resultado,
  resultadoValido
} from '../ResultadoDisciplina/ResultadoDisciplina'

interface ModalEncerrarCadeiraParcialmenteProps {
  open: boolean
  disciplinaNome: string
  disciplinaId: number
  onClose: (value: boolean) => void
}

const ModalEncerrarCadeiraParcialmente: React.FC<
  ModalEncerrarCadeiraParcialmenteProps
> = ({ open, onClose, disciplinaId, disciplinaNome }) => {
  const [resultado, setResultado] = useState<Resultado>({
    status: 'APROVADA',
    nota: ''
  })
  const { mutate, isPending, error, reset } = useDefinirSituacao()

  const salvar = () =>
    mutate(
      {
        disciplinaId,
        situacao: {
          status: resultado.status,
          nota: resultado.status === 'TRANCADA' ? null : Number(resultado.nota)
        }
      },
      { onSuccess: fechar }
    )

  const fechar = () => {
    reset()
    setResultado({ status: 'APROVADA', nota: '' })
    onClose(false)
  }

  return (
    <Dialog open={open} onClose={fechar} className="relative z-10">
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
            <div className="space-y-3">
              <DialogTitle
                as="h3"
                className="text-base font-semibold text-gray-900"
              >
                Encerrar disciplina
              </DialogTitle>
              <p className="text-sm text-gray-700">
                Como foi a disciplina{' '}
                <span className="font-bold">{disciplinaNome}</span>?
              </p>
              <ResultadoDisciplina value={resultado} onChange={setResultado} />
              {error && (
                <p className="text-sm font-medium text-red-600">
                  {getErrorMessage(error)}
                </p>
              )}
            </div>
            <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
              <button
                type="button"
                disabled={!resultadoValido(resultado) || isPending}
                onClick={salvar}
                className="disabled:opacity-80 not-disabled:cursor-pointer inline-flex w-full justify-center rounded-md bg-xor-navy px-3 py-2 text-sm font-semibold text-white shadow-xs not-disabled:hover:bg-xor-navy/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-xor-navy sm:col-start-2"
              >
                {isPending ? 'Salvando...' : 'Encerrar disciplina'}
              </button>
              <button
                type="button"
                data-autofocus
                onClick={fechar}
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
