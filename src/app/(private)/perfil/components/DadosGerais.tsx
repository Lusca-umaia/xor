'use client'

import { useEffect, useMemo, useState } from 'react'
import { LuArrowRight, LuMail, LuUserPen } from 'react-icons/lu'
import { Perfil } from '@/@types/Perfil'
import FormInput from '@/components/FormInput/FormInput'
import { useAtualizarPerfil } from '@/hooks/mutations/usePerfil'
import { perfilSchema } from '@/lib/api/schemas'
import { getErrorMessage } from '@/services/api'
import {
  Aviso,
  BOTAO_PRIMARIO,
  BOTAO_SECUNDARIO,
  SecaoCard,
  errosPorCampo
} from './SecaoCard'

interface Campos {
  nome: string
  matricula: string
  cursoNome: string
  semestreAtual: string
  cargaOptativaExigida: string
}

const camposDoPerfil = (perfil: Perfil): Campos => ({
  nome: perfil.nome,
  matricula: perfil.matricula ?? '',
  cursoNome: perfil.cursoNome,
  semestreAtual: String(perfil.semestreAtual),
  cargaOptativaExigida:
    perfil.cargaOptativaExigida === null
      ? ''
      : String(perfil.cargaOptativaExigida)
})

interface DadosGeraisProps {
  perfil: Perfil
  onAlterarEmail: () => void
}

const DadosGerais: React.FC<DadosGeraisProps> = ({
  perfil,
  onAlterarEmail
}) => {
  const iniciais = useMemo(() => camposDoPerfil(perfil), [perfil])
  const [campos, setCampos] = useState<Campos>(iniciais)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const salvar = useAtualizarPerfil()

  useEffect(() => {
    setCampos(iniciais)
  }, [iniciais])

  const alterado = (Object.keys(campos) as (keyof Campos)[]).some(
    (campo) => campos[campo] !== iniciais[campo]
  )

  const handleChange = (campo: keyof Campos, valor: string) => {
    setCampos((prev) => ({ ...prev, [campo]: valor }))
    setErrors((prev) => ({ ...prev, [campo]: '' }))
    if (!salvar.isIdle) salvar.reset()
  }

  const descartar = () => {
    setCampos(iniciais)
    setErrors({})
    salvar.reset()
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const result = perfilSchema.safeParse({
      ...campos,
      cargaOptativaExigida: campos.cargaOptativaExigida.trim() || null
    })

    if (!result.success) {
      setErrors(errosPorCampo(result.error))
      return
    }

    setErrors({})
    salvar.mutate(result.data)
  }

  return (
    <form onSubmit={handleSubmit}>
      <SecaoCard
        icon={<LuUserPen />}
        titulo="Dados gerais"
        descricao="Essas informações aparecem no seu painel e na progressão de curso."
        rodape={
          <>
            {salvar.isSuccess && (
              <Aviso tipo="sucesso" className="mr-auto py-1.5">
                Perfil atualizado
              </Aviso>
            )}
            {salvar.isError && (
              <Aviso tipo="erro" className="mr-auto py-1.5">
                {getErrorMessage(salvar.error)}
              </Aviso>
            )}
            {alterado && salvar.isIdle && (
              <span className="mr-auto flex items-center gap-2 text-sm font-medium text-gray-500">
                <span className="size-2 rounded-full bg-amber-400" />
                Alterações não salvas
              </span>
            )}
            {alterado && (
              <button
                type="button"
                onClick={descartar}
                disabled={salvar.isPending}
                className={BOTAO_SECUNDARIO}
              >
                Descartar
              </button>
            )}
            <button
              type="submit"
              disabled={!alterado || salvar.isPending}
              className={BOTAO_PRIMARIO}
            >
              {salvar.isPending ? 'Salvando...' : 'Salvar alterações'}
            </button>
          </>
        }
      >
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
            Identificação
          </p>
          <div className="grid grid-cols-6 gap-3">
            <FormInput
              className="col-span-6 md:col-span-4"
              type="text"
              label="Nome completo"
              name="nome"
              autoComplete="name"
              value={campos.nome}
              error={errors.nome}
              handleChange={(value) => handleChange('nome', value)}
            />
            <FormInput
              className="col-span-6 md:col-span-2"
              type="text"
              label="Matrícula"
              name="matricula"
              value={campos.matricula}
              error={errors.matricula}
              handleChange={(value) => handleChange('matricula', value)}
            />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-gray-50 px-3 py-2.5 ring-1 ring-inset ring-gray-100">
            <span className="flex min-w-0 items-center gap-2 text-sm">
              <LuMail className="shrink-0 text-gray-400" />
              <span className="font-semibold text-gray-900">Email</span>
              <span className="truncate text-gray-500">{perfil.email}</span>
            </span>
            <button
              type="button"
              onClick={onAlterarEmail}
              className="inline-flex cursor-pointer items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-500"
            >
              Alterar email
              <LuArrowRight />
            </button>
          </div>
        </div>

        <div className="space-y-3 border-t border-gray-100 pt-5">
          <div className="flex items-center gap-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Vida acadêmica
            </p>
            {perfil.cursoCodigo && (
              <span className="rounded-md px-1.5 py-0.5 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-200">
                {perfil.cursoCodigo}
              </span>
            )}
          </div>
          <div className="grid grid-cols-6 gap-3">
            <FormInput
              className="col-span-6"
              type="text"
              label="Curso"
              name="cursoNome"
              value={campos.cursoNome}
              error={errors.cursoNome}
              handleChange={(value) => handleChange('cursoNome', value)}
            />
            <FormInput
              className="col-span-3"
              type="number"
              label="Semestre atual"
              name="semestreAtual"
              min={1}
              max={30}
              value={campos.semestreAtual}
              error={errors.semestreAtual}
              handleChange={(value) => handleChange('semestreAtual', value)}
            />
            <FormInput
              className="col-span-3"
              type="number"
              label="Carga optativa exigida (h)"
              name="cargaOptativaExigida"
              min={0}
              placeholder="Opcional"
              value={campos.cargaOptativaExigida}
              error={errors.cargaOptativaExigida}
              handleChange={(value) =>
                handleChange('cargaOptativaExigida', value)
              }
            />
          </div>
          <p className="text-xs text-gray-500">
            O semestre avança sozinho quando você encerra um semestre na
            progressão de curso. Ajuste aqui só para corrigir.
          </p>
        </div>
      </SecaoCard>
    </form>
  )
}

export default DadosGerais
