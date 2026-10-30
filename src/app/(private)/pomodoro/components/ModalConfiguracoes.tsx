'use client'

import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
  Field,
  Label,
  Switch
} from '@headlessui/react'
import clsx from 'clsx'
import { useEffect, useState } from 'react'
import FormInput from '@/components/FormInput/FormInput'
import { CONFIG_PADRAO, ConfigPomodoro, PRESETS } from '../consts'

interface ModalConfiguracoesProps {
  open: boolean
  config: ConfigPomodoro
  onClose: () => void
  onSalvar: (config: ConfigPomodoro) => void
}

type CampoNumerico =
  | 'foco'
  | 'pausaCurta'
  | 'pausaLonga'
  | 'ciclosAtePausaLonga'
  | 'metaDiaria'

const CAMPOS: {
  campo: CampoNumerico
  label: string
  min: number
  max: number
}[] = [
  { campo: 'foco', label: 'Foco (min)', min: 1, max: 120 },
  { campo: 'pausaCurta', label: 'Pausa curta (min)', min: 1, max: 30 },
  { campo: 'pausaLonga', label: 'Pausa longa (min)', min: 1, max: 60 },
  {
    campo: 'ciclosAtePausaLonga',
    label: 'Pomodoros até a longa',
    min: 2,
    max: 8
  },
  { campo: 'metaDiaria', label: 'Meta diária (pomodoros)', min: 1, max: 24 }
]

type Alternavel =
  | 'autoIniciarPausas'
  | 'autoIniciarFoco'
  | 'som'
  | 'notificacoes'

const ALTERNAVEIS: { campo: Alternavel; label: string; descricao: string }[] = [
  {
    campo: 'autoIniciarPausas',
    label: 'Iniciar pausas sozinho',
    descricao: 'A pausa começa assim que o foco termina.'
  },
  {
    campo: 'autoIniciarFoco',
    label: 'Iniciar foco sozinho',
    descricao: 'O próximo pomodoro começa ao fim da pausa.'
  },
  {
    campo: 'som',
    label: 'Som ao terminar',
    descricao: 'Toca um aviso curto no fim de cada bloco.'
  },
  {
    campo: 'notificacoes',
    label: 'Notificações do navegador',
    descricao: 'Avisa mesmo com a aba em segundo plano.'
  }
]

const ModalConfiguracoes: React.FC<ModalConfiguracoesProps> = ({
  open,
  config,
  onClose,
  onSalvar
}) => {
  const [rascunho, setRascunho] = useState<Record<CampoNumerico, string>>()
  const [opcoes, setOpcoes] = useState(config)
  const [erro, setErro] = useState<string>()

  useEffect(() => {
    if (!open) return
    setOpcoes(config)
    setErro(undefined)
    setRascunho(
      Object.fromEntries(
        CAMPOS.map(({ campo }) => [campo, String(config[campo])])
      ) as Record<CampoNumerico, string>
    )
  }, [open, config])

  const aplicarPreset = (preset: (typeof PRESETS)[number]) =>
    setRascunho(
      (r) =>
        r && {
          ...r,
          foco: String(preset.foco),
          pausaCurta: String(preset.pausaCurta),
          pausaLonga: String(preset.pausaLonga)
        }
    )

  const alternar = async (campo: Alternavel, ativo: boolean) => {
    if (campo === 'notificacoes' && ativo) {
      if (!('Notification' in window)) {
        setErro('Seu navegador não suporta notificações.')
        return
      }
      const permissao = await Notification.requestPermission()
      if (permissao !== 'granted') {
        setErro('Permita as notificações nas configurações do navegador.')
        return
      }
    }
    setErro(undefined)
    setOpcoes((o) => ({ ...o, [campo]: ativo }))
  }

  const salvar = () => {
    if (!rascunho) return
    const numeros = {} as Record<CampoNumerico, number>
    for (const { campo, label, min, max } of CAMPOS) {
      const valor = Number(rascunho[campo])
      if (!Number.isInteger(valor) || valor < min || valor > max) {
        setErro(`${label}: informe um número entre ${min} e ${max}.`)
        return
      }
      numeros[campo] = valor
    }
    onSalvar({ ...opcoes, ...numeros })
    onClose()
  }

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
            className="relative transform max-md:w-full overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8 sm:w-full sm:max-w-xl sm:p-6 data-closed:sm:translate-y-0 data-closed:sm:scale-95"
          >
            <form
              onSubmit={(e) => {
                e.preventDefault()
                salvar()
              }}
              className="space-y-5"
            >
              <DialogTitle
                as="h3"
                className="text-base font-semibold text-gray-900"
              >
                Configurações do pomodoro
              </DialogTitle>

              <div className="space-y-2">
                <p className="text-sm font-semibold text-gray-900">Ritmo</p>
                <div className="flex flex-wrap gap-2">
                  {PRESETS.map((preset) => {
                    const ativo =
                      rascunho?.foco === String(preset.foco) &&
                      rascunho?.pausaCurta === String(preset.pausaCurta) &&
                      rascunho?.pausaLonga === String(preset.pausaLonga)
                    return (
                      <button
                        key={preset.nome}
                        type="button"
                        onClick={() => aplicarPreset(preset)}
                        className={clsx(
                          'cursor-pointer rounded-full px-3 py-1.5 text-sm font-semibold ring-1 ring-inset transition',
                          ativo
                            ? 'bg-xor-navy text-white ring-xor-navy'
                            : 'bg-white text-gray-700 ring-gray-300 hover:bg-gray-50'
                        )}
                      >
                        {preset.nome} · {preset.foco}/{preset.pausaCurta}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {CAMPOS.map(({ campo, label, min, max }) => (
                  <FormInput
                    key={campo}
                    type="number"
                    name={campo}
                    label={label}
                    min={min}
                    max={max}
                    value={rascunho?.[campo]}
                    handleChange={(valor) =>
                      setRascunho((r) => r && { ...r, [campo]: valor })
                    }
                  />
                ))}
              </div>

              <div className="divide-y divide-gray-100">
                {ALTERNAVEIS.map(({ campo, label, descricao }) => (
                  <Field
                    key={campo}
                    className="flex items-center justify-between gap-4 py-3"
                  >
                    <span>
                      <Label className="text-sm font-semibold text-gray-900">
                        {label}
                      </Label>
                      <p className="text-sm text-gray-500">{descricao}</p>
                    </span>
                    <Switch
                      checked={opcoes[campo]}
                      onChange={(ativo) => alternar(campo, ativo)}
                      className="group relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full bg-gray-200 p-0.5 transition-colors data-checked:bg-xor-navy"
                    >
                      <span className="size-5 rounded-full bg-white shadow-sm transition-transform group-data-checked:translate-x-5" />
                    </Switch>
                  </Field>
                ))}
              </div>

              {erro && (
                <p className="text-sm font-medium text-red-600">{erro}</p>
              )}

              <div className="flex max-md:flex-col-reverse gap-3 justify-between">
                <button
                  type="button"
                  onClick={() => {
                    setOpcoes(CONFIG_PADRAO)
                    setRascunho(
                      Object.fromEntries(
                        CAMPOS.map(({ campo }) => [
                          campo,
                          String(CONFIG_PADRAO[campo])
                        ])
                      ) as Record<CampoNumerico, string>
                    )
                  }}
                  className="cursor-pointer text-sm font-semibold text-gray-500 hover:text-gray-900"
                >
                  Restaurar padrão
                </button>
                <div className="flex max-md:flex-col-reverse gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="cursor-pointer inline-flex justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="cursor-pointer inline-flex justify-center rounded-md bg-black px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-800"
                  >
                    Salvar
                  </button>
                </div>
              </div>
            </form>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  )
}

export default ModalConfiguracoes
