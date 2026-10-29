'use client'

import { Disciplina } from '@/utils/mockData'
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle
} from '@headlessui/react'
import { useEffect, useState } from 'react'
import CadeirasAtivas from '../CadeirasAtivas/CadeirasAtivas'

interface ModalEncerrarCursoProps {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  cadeirasAtivas: Disciplina[]
}

const ModalEncerrarCurso: React.FC<ModalEncerrarCursoProps> = ({
  open,
  setOpen,
  cadeirasAtivas
}) => {
  const [formData, setFormData] = useState<
    {
      cadeiraId: number
      nota: string
    }[]
  >([])

  useEffect(() => {
    setFormData(cadeirasAtivas.map(({ id }) => ({ cadeiraId: id, nota: '' })))
  }, [cadeirasAtivas])

  const [cadeiraAtual, setCadeiraAtual] = useState(-1)

  const handleClickNext = () => {
    if (cadeiraAtual === cadeirasAtivas.length - 1) {
      setOpen(false)
      setCadeiraAtual(-1)
    } else {
      setCadeiraAtual((cadeiraAtual) => cadeiraAtual + 1)
    }
  }

  const handleClickPrev = () => {
    if (cadeiraAtual === -1) {
      setOpen(false)
    } else {
      setCadeiraAtual((cadeiraAtual) => cadeiraAtual - 1)
    }
  }

  const handleChangeNota = (idCadeira: number, value: string) => {
    setFormData((prevFormData) =>
      prevFormData.map(({ cadeiraId, nota }) => ({
        cadeiraId,
        nota: cadeiraId === idCadeira ? value : nota
      }))
    )
  }

  return (
    <Dialog open={open} onClose={setOpen} className="relative z-10">
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
            <form onSubmit={(e) => e.preventDefault()}>
              <div>
                <DialogTitle
                  as="h3"
                  className="text-base gap-2 flex justify-between font-semibold text-gray-900"
                >
                  Encerrar semestre
                  {cadeiraAtual >= 0 && (
                    <span>
                      {cadeiraAtual + 1}/{cadeirasAtivas.length}
                    </span>
                  )}
                </DialogTitle>
                {cadeiraAtual >= 0 ? (
                  <div className="mt-2 space-y-2">
                    <p className="text-sm text-gray-700">
                      Forneça sua nota na disciplina{' '}
                      <span className="font-bold">
                        {cadeirasAtivas[cadeiraAtual].nomeCadeira}
                      </span>
                      :
                    </p>
                    <input
                      type={'number'}
                      placeholder="7,00"
                      value={formData[cadeiraAtual].nota}
                      min={0}
                      step=".1"
                      max={10}
                      onChange={(e) =>
                        handleChangeNota(
                          cadeirasAtivas[cadeiraAtual].id,
                          e.target.value
                        )
                      }
                      className="block w-16 rounded-md outline-indigo-700 border-0 p-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 font-medium text-sm"
                    />
                  </div>
                ) : (
                  <div className="mt-2">
                    <p className="text-sm text-gray-700">
                      Tem certeza de que deseja{' '}
                      <span className="font-bold">encerrar</span> este semestre?{' '}
                      <br /> Essa ação finalizará o período atual. Após o
                      encerramento, você deverá preencher as disciplinas do
                      próximo semestre, caso ainda tenha cadeiras pendentes para
                      cursar.
                    </p>
                  </div>
                )}
              </div>
              <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                <button
                  type="submit"
                  onClick={handleClickNext}
                  disabled={
                    cadeiraAtual >= 0 &&
                    !(
                      cadeiraAtual >= 0 &&
                      parseFloat(formData[cadeiraAtual].nota) >= 0 &&
                      parseFloat(formData[cadeiraAtual].nota) <= 10
                    )
                  }
                  className="disabled:opacity-80 not-disabled:cursor-pointer inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-xs not-disabled:hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:col-start-2"
                >
                  {cadeiraAtual === cadeirasAtivas.length - 1
                    ? 'Enviar'
                    : 'Seguir'}
                </button>
                <button
                  type="button"
                  data-autofocus
                  onClick={handleClickPrev}
                  className="mt-3 cursor-pointer inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-xs ring-1 ring-gray-300 ring-inset hover:bg-gray-50 sm:col-start-1 sm:mt-0"
                >
                  {cadeiraAtual >= 0 ? 'Voltar' : 'Cancelar'}
                </button>
              </div>
            </form>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  )
}

export default ModalEncerrarCurso
