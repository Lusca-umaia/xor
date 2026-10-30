'use client'

import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle
} from '@headlessui/react'
import { useEffect, useState } from 'react'
import { LuTrash2 } from 'react-icons/lu'
import { z } from 'zod'
import { DisciplinaProgresso, StatusTentativa } from '@/@types/Progresso'
import {
  useExcluirDisciplina,
  useExcluirTentativa,
  useSalvarDisciplina
} from '@/hooks/mutations/useDisciplinas'
import { novaDisciplinaSchema, situacaoSchema } from '@/lib/api/schemas'
import { getErrorMessage } from '@/services/api'
import FormInput from '../FormInput/FormInput'
import Select from '../Select/Select'
import { CARATER_OPCOES } from '@/helpers/consts'

type StatusSituacao = z.infer<typeof situacaoSchema>['status']

const SITUACOES: { id: StatusSituacao; nome: string }[] = [
  { id: 'PENDENTE', nome: 'Pendente' },
  { id: 'ANDAMENTO', nome: 'Em andamento' },
  { id: 'APROVADA', nome: 'Concluída' },
  { id: 'REPROVADA', nome: 'Reprovada' },
  { id: 'TRANCADA', nome: 'Trancada' }
]

const TENTATIVA_LABEL: Record<StatusTentativa, string> = {
  ANDAMENTO: 'Em andamento',
  APROVADA: 'Aprovada',
  REPROVADA: 'Reprovada',
  TRANCADA: 'Trancada'
}

interface Campos {
  codigo: string
  nome: string
  cargaHoraria: string
  carater: 'OBRIGATORIA' | 'OPTATIVA'
  semestre: string
  status: StatusSituacao
  nota: string
  periodo: string
}

function camposIniciais(disciplina?: DisciplinaProgresso): Campos {
  if (!disciplina) {
    return {
      codigo: '',
      nome: '',
      cargaHoraria: '',
      carater: 'OBRIGATORIA',
      semestre: '',
      status: 'PENDENTE',
      nota: '',
      periodo: ''
    }
  }

  const aprovada = disciplina.tentativas.find((t) => t.status === 'APROVADA')
  const andamento = disciplina.tentativas.find((t) => t.status === 'ANDAMENTO')
  const atual = aprovada ?? andamento

  return {
    codigo: disciplina.codigo,
    nome: disciplina.nome,
    cargaHoraria: String(disciplina.cargaHoraria),
    carater: disciplina.carater,
    semestre: disciplina.semestre ? String(disciplina.semestre) : '',
    status: aprovada ? 'APROVADA' : andamento ? 'ANDAMENTO' : 'PENDENTE',
    nota: aprovada?.nota != null ? String(aprovada.nota) : '',
    periodo: atual?.periodo ?? ''
  }
}

const numeroOuNull = (valor: string) =>
  valor.trim() === '' ? null : Number(valor.replace(',', '.'))

interface ModalEditarDisciplinaProps {
  open: boolean
  onClose: () => void
  // Sem disciplina, o modal cria uma nova.
  disciplina?: DisciplinaProgresso
}

const ModalEditarDisciplina: React.FC<ModalEditarDisciplinaProps> = ({
  open,
  onClose,
  disciplina
}) => {
  const [campos, setCampos] = useState<Campos>(camposIniciais(disciplina))
  const [errors, setErrors] = useState<Record<string, string>>({})

  const salvar = useSalvarDisciplina()
  const excluir = useExcluirDisciplina()
  const removerTentativa = useExcluirTentativa()

  useEffect(() => {
    if (open) {
      setCampos(camposIniciais(disciplina))
      setErrors({})
    }
  }, [open, disciplina])

  const handleChange = (campo: keyof Campos, valor: string) => {
    setCampos((prev) => ({ ...prev, [campo]: valor }))
    setErrors((prev) => ({ ...prev, [campo]: '' }))
  }

  const handleSalvar = () => {
    const dados = novaDisciplinaSchema.safeParse({
      codigo: campos.codigo,
      nome: campos.nome,
      cargaHoraria: campos.cargaHoraria,
      carater: campos.carater,
      semestre: numeroOuNull(campos.semestre)
    })
    const situacao = situacaoSchema.safeParse({
      status: campos.status,
      nota:
        campos.status === 'APROVADA' || campos.status === 'REPROVADA'
          ? numeroOuNull(campos.nota)
          : null,
      periodo: campos.periodo.trim() || null
    })

    if (!dados.success || !situacao.success) {
      const fieldErrors: Record<string, string> = {}
      for (const err of [
        ...(dados.error?.errors ?? []),
        ...(situacao.error?.errors ?? [])
      ]) {
        fieldErrors[String(err.path[0])] = err.message
      }
      setErrors(fieldErrors)
      return
    }

    // Na edição, só envia o que mudou.
    const iniciais = camposIniciais(disciplina)
    const mudou = (lista: readonly (keyof Campos)[]) =>
      !disciplina || lista.some((campo) => campos[campo] !== iniciais[campo])

    salvar.mutate(
      {
        disciplinaId: disciplina?.id,
        dados: mudou(['codigo', 'nome', 'cargaHoraria', 'carater', 'semestre'])
          ? dados.data
          : undefined,
        situacao: mudou(['status', 'nota', 'periodo'])
          ? situacao.data
          : undefined
      },
      { onSuccess: onClose }
    )
  }

  const handleExcluir = () => {
    if (
      disciplina &&
      window.confirm(
        `Excluir ${disciplina.nome}? O histórico dela também será apagado.`
      )
    ) {
      excluir.mutate(disciplina.id, { onSuccess: onClose })
    }
  }

  const erroApi = salvar.error ?? excluir.error ?? removerTentativa.error
  const exibeNota =
    campos.status === 'APROVADA' || campos.status === 'REPROVADA'
  const ocupado =
    salvar.isPending || excluir.isPending || removerTentativa.isPending

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
            className="relative transform max-md:w-full overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8 sm:w-full sm:max-w-2xl sm:p-6 data-closed:sm:translate-y-0 data-closed:sm:scale-95"
          >
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleSalvar()
              }}
              className="space-y-5"
            >
              <DialogTitle
                as="h3"
                className="text-base font-semibold text-gray-900"
              >
                {disciplina ? 'Editar disciplina' : 'Adicionar disciplina'}
              </DialogTitle>

              <div className="grid grid-cols-6 gap-3">
                <FormInput
                  className="col-span-6 md:col-span-2"
                  type="text"
                  label="Código"
                  name="codigo"
                  placeholder="Ex: CK0101"
                  value={campos.codigo}
                  error={errors.codigo}
                  handleChange={(value) => handleChange('codigo', value)}
                />
                <FormInput
                  className="col-span-6 md:col-span-4"
                  type="text"
                  label="Nome"
                  name="nomeDisciplina"
                  value={campos.nome}
                  error={errors.nome}
                  handleChange={(value) => handleChange('nome', value)}
                />
                <FormInput
                  className="col-span-3 md:col-span-2"
                  type="number"
                  label="Carga (h)"
                  name="cargaHoraria"
                  min={0}
                  value={campos.cargaHoraria}
                  error={errors.cargaHoraria}
                  handleChange={(value) => handleChange('cargaHoraria', value)}
                />
                <Select
                  className="col-span-3 md:col-span-2"
                  label="Caráter"
                  options={CARATER_OPCOES}
                  value={campos.carater}
                  onChange={({ id }) => handleChange('carater', id)}
                />
                <FormInput
                  className="col-span-6 md:col-span-2"
                  type="number"
                  label="Semestre na grade"
                  name="semestre"
                  min={1}
                  placeholder="Opcional"
                  value={campos.semestre}
                  error={errors.semestre}
                  handleChange={(value) => handleChange('semestre', value)}
                />
              </div>

              <div className="space-y-2 border-t border-black/10 pt-4">
                <p className="text-sm font-semibold text-gray-900">
                  Situação atual
                </p>
                <div className="grid grid-cols-6 gap-3">
                  <Select
                    className="col-span-6 md:col-span-2"
                    options={SITUACOES}
                    value={campos.status}
                    onChange={({ id }) => handleChange('status', id)}
                  />
                  {exibeNota && (
                    <FormInput
                      className="col-span-3 md:col-span-2"
                      type="number"
                      name="nota"
                      min={0}
                      max={10}
                      step=".1"
                      placeholder="Nota"
                      value={campos.nota}
                      error={errors.nota}
                      handleChange={(value) => handleChange('nota', value)}
                    />
                  )}
                  {campos.status !== 'PENDENTE' && (
                    <FormInput
                      className="col-span-3 md:col-span-2"
                      type="text"
                      name="periodo"
                      placeholder="Período (ex: 2025.1)"
                      value={campos.periodo}
                      error={errors.periodo}
                      handleChange={(value) => handleChange('periodo', value)}
                    />
                  )}
                </div>
                {disciplina && campos.status === 'PENDENTE' && (
                  <p className="text-xs text-gray-500">
                    Marcar como pendente remove a aprovação ou o andamento.
                    Reprovações e trancamentos continuam no histórico.
                  </p>
                )}
              </div>

              {disciplina && disciplina.tentativas.length > 0 && (
                <div className="space-y-2 border-t border-black/10 pt-4">
                  <p className="text-sm font-semibold text-gray-900">
                    Histórico
                  </p>
                  <ul className="space-y-1.5">
                    {disciplina.tentativas.map((tentativa) => (
                      <li
                        key={tentativa.id}
                        className="flex items-center justify-between gap-3 rounded-md px-3 py-2 text-sm ring-1 ring-inset ring-gray-200"
                      >
                        <span className="font-medium">
                          {TENTATIVA_LABEL[tentativa.status]}
                          {tentativa.nota !== null &&
                            ` · nota ${tentativa.nota.toFixed(1).replace('.', ',')}`}
                        </span>
                        <span className="flex items-center gap-3 text-xs text-gray-500">
                          {tentativa.periodo ??
                            (tentativa.semestre
                              ? `${tentativa.semestre}º semestre`
                              : 'Sem período')}
                          <button
                            type="button"
                            title="Remover do histórico"
                            disabled={ocupado}
                            onClick={() =>
                              removerTentativa.mutate(tentativa.id)
                            }
                            className="cursor-pointer text-gray-400 hover:text-red-600 disabled:opacity-50"
                          >
                            <LuTrash2 className="text-base" />
                          </button>
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {erroApi && (
                <p className="text-sm font-medium text-red-600">
                  {getErrorMessage(erroApi)}
                </p>
              )}

              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                {disciplina ? (
                  <button
                    type="button"
                    disabled={ocupado}
                    onClick={handleExcluir}
                    className="cursor-pointer rounded-md px-3 py-2 text-sm font-semibold text-red-600 ring-1 ring-inset ring-red-200 hover:bg-red-50 disabled:opacity-60"
                  >
                    Excluir disciplina
                  </button>
                ) : (
                  <span />
                )}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="cursor-pointer rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-xs ring-1 ring-gray-300 ring-inset hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={ocupado}
                    className="cursor-pointer disabled:opacity-70 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500"
                  >
                    {salvar.isPending ? 'Salvando...' : 'Salvar'}
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

export default ModalEditarDisciplina
