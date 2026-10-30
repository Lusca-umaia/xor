'use client'

import { useState } from 'react'
import { z } from 'zod'
import FormInput from '../FormInput/FormInput'
import Select from '../Select/Select'
import { CARATER_OPCOES } from '@/helpers/consts'
import { caraterSchema } from '@/lib/api/schemas'
import { Carater } from '@/@types/aluno'

export type StatusFormDisciplina =
  | 'PENDENTE'
  | 'ANDAMENTO'
  | 'APROVADA'
  | 'REPROVADA'
  | 'TRANCADA'

const STATUS_LABEL: Record<StatusFormDisciplina, string> = {
  PENDENTE: 'Pendente',
  ANDAMENTO: 'Em andamento',
  APROVADA: 'Aprovada',
  REPROVADA: 'Reprovada',
  TRANCADA: 'Trancada'
}

export interface DadosFormDisciplina {
  codigo: string
  nome: string
  cargaHoraria: number
  carater: Carater
}

export interface ResultadoFormDisciplina {
  status: StatusFormDisciplina
  nota: number | null
}

const schema = z
  .object({
    codigo: z.string().trim().min(1, 'Informe o código').max(40),
    nome: z.string().trim().min(1, 'Informe o nome').max(200),
    cargaHoraria: z.coerce
      .number({ invalid_type_error: 'Informe a carga horária' })
      .int('Use um número inteiro')
      .min(0)
      .max(2000),
    carater: caraterSchema,
    status: z.enum([
      'PENDENTE',
      'ANDAMENTO',
      'APROVADA',
      'REPROVADA',
      'TRANCADA'
    ]),
    nota: z.string()
  })
  .transform((dados) => ({
    ...dados,
    nota: dados.nota.trim() === '' ? null : Number(dados.nota.replace(',', '.'))
  }))
  .refine(({ nota }) => nota === null || (nota >= 0 && nota <= 10), {
    message: 'Nota entre 0 e 10',
    path: ['nota']
  })

interface Campos {
  codigo: string
  nome: string
  cargaHoraria: string
  carater: Carater
  status: StatusFormDisciplina
  nota: string
}

interface FormNovaDisciplinaProps {
  // Status que o usuário pode escolher. Com um só, o campo fica oculto.
  statusPermitidos: StatusFormDisciplina[]
  // Disciplinas já conhecidas: ao digitar um código delas, o resto é preenchido.
  catalogo?: DadosFormDisciplina[]
  textoBotao?: string
  onAdicionar: (
    disciplina: DadosFormDisciplina,
    resultado: ResultadoFormDisciplina
  ) => string | null | Promise<string | null>
}

const camposIniciais = (status: StatusFormDisciplina): Campos => ({
  codigo: '',
  nome: '',
  cargaHoraria: '',
  carater: 'OBRIGATORIA',
  status,
  nota: ''
})

const normalizar = (codigo: string) => codigo.trim().toUpperCase()

const FormNovaDisciplina: React.FC<FormNovaDisciplinaProps> = ({
  statusPermitidos,
  catalogo = [],
  textoBotao = 'Adicionar disciplina',
  onAdicionar
}) => {
  const [campos, setCampos] = useState<Campos>(
    camposIniciais(statusPermitidos[0])
  )
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [enviando, setEnviando] = useState(false)

  const exibeNota =
    campos.status === 'APROVADA' || campos.status === 'REPROVADA'
  const conhecida = catalogo.find(
    ({ codigo }) => normalizar(codigo) === normalizar(campos.codigo)
  )

  const handleChange = (campo: keyof Campos, valor: string) => {
    setCampos((prev) => ({ ...prev, [campo]: valor }))
    setErrors((prev) => ({ ...prev, [campo]: '', geral: '' }))
  }

  const handleChangeCodigo = (valor: string) => {
    const disciplina = catalogo.find(
      ({ codigo }) => normalizar(codigo) === normalizar(valor)
    )

    setCampos((prev) => ({
      ...prev,
      codigo: valor,
      ...(disciplina && {
        nome: disciplina.nome,
        cargaHoraria: String(disciplina.cargaHoraria),
        carater: disciplina.carater
      })
    }))
    setErrors({})
  }

  // Não é um <form> próprio porque costuma ficar dentro do form do cadastro.
  const handleAdicionar = async () => {
    const result = schema.safeParse(campos)

    if (!result.success) {
      const fieldErrors: Record<string, string> = {}
      result.error.errors.forEach((err) => {
        fieldErrors[String(err.path[0])] = err.message
      })
      setErrors(fieldErrors)
      return
    }

    const { status, nota, ...disciplina } = result.data

    setEnviando(true)
    const erro = await onAdicionar(disciplina, {
      status,
      nota: exibeNota ? nota : null
    })
    setEnviando(false)

    if (erro) {
      setErrors({ geral: erro })
      return
    }

    setCampos(camposIniciais(campos.status))
    setErrors({})
  }

  return (
    <div className="space-y-3 rounded-xl bg-gray-50/80 p-4 ring-1 ring-inset ring-gray-200">
      <div className="grid grid-cols-6 gap-3">
        <FormInput
          className="col-span-6 md:col-span-1"
          type="text"
          label="Código"
          name="codigo"
          placeholder="Ex: CK0101"
          value={campos.codigo}
          error={errors.codigo}
          handleChange={handleChangeCodigo}
        />
        <FormInput
          className="col-span-6 md:col-span-3"
          type="text"
          label="Nome"
          name="nomeDisciplina"
          placeholder="Ex: Cálculo I"
          value={campos.nome}
          disabled={Boolean(conhecida)}
          error={errors.nome}
          handleChange={(value) => handleChange('nome', value)}
        />
        <FormInput
          className="col-span-3 md:col-span-1"
          type="number"
          label="Carga (h)"
          name="cargaHoraria"
          min={0}
          placeholder="64"
          value={campos.cargaHoraria}
          disabled={Boolean(conhecida)}
          error={errors.cargaHoraria}
          handleChange={(value) => handleChange('cargaHoraria', value)}
        />
        <Select
          className="col-span-3 md:col-span-1"
          label="Caráter"
          options={CARATER_OPCOES}
          value={campos.carater}
          disabled={Boolean(conhecida)}
          onChange={({ id }) => handleChange('carater', id)}
        />
        {statusPermitidos.length > 1 && (
          <Select
            className="col-span-3 md:col-span-2"
            label="Situação"
            options={statusPermitidos.map((status) => ({
              id: status,
              nome: STATUS_LABEL[status]
            }))}
            value={campos.status}
            onChange={({ id }) => handleChange('status', id)}
          />
        )}
        {exibeNota && (
          <FormInput
            className="col-span-3 md:col-span-1"
            type="number"
            label="Nota"
            name="nota"
            min={0}
            max={10}
            step=".1"
            placeholder="7,0"
            value={campos.nota}
            error={errors.nota}
            handleChange={(value) => handleChange('nota', value)}
          />
        )}
      </div>
      <div className="flex flex-wrap items-center justify-end gap-3">
        {conhecida && (
          <p className="mr-auto text-xs font-medium text-gray-500">
            Disciplina já cadastrada: os dados foram preenchidos.
          </p>
        )}
        {errors.geral && (
          <p className="text-sm font-medium text-red-600">{errors.geral}</p>
        )}
        <button
          type="button"
          disabled={enviando}
          onClick={handleAdicionar}
          className="cursor-pointer disabled:opacity-70 rounded-md bg-black px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-gray-700/95"
        >
          {enviando ? 'Adicionando...' : textoBotao}
        </button>
      </div>
    </div>
  )
}

export default FormNovaDisciplina
