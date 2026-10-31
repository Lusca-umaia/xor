'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import clsx from 'clsx'
import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { LuCheck } from 'react-icons/lu'
import { z } from 'zod'
import {
  AmbienteEstudo,
  CorAmbiente,
  DadosAmbiente
} from '@/@types/AmbienteEstudo'
import { useHistoricoCadeiras } from '@/hooks/ambienteEstudo/useHistoricoCadeiras'
import { SITUACOES } from '../SeloSituacao/SeloSituacao'
import { CORES_AMBIENTE, LISTA_CORES } from '@/utils/ambienteEstudo/cores'
import Botao from '../Botao/Botao'
import { classeAjuda, classeCampo, classeErro, classeRotulo } from '../estilos'
import Modal from '../Modal/Modal'

const esquema = z.object({
  nome: z
    .string()
    .trim()
    .min(1, 'Dê um nome ao ambiente.')
    .max(80, 'Use no máximo 80 caracteres.'),
  descricao: z.string().trim().max(300, 'Use no máximo 300 caracteres.'),
  cor: z.enum(LISTA_CORES as [CorAmbiente, ...CorAmbiente[]]),
  disciplinaCodigo: z.string()
})

type ValoresFormulario = z.infer<typeof esquema>

interface ModalAmbienteProps {
  aberto: boolean
  aoFechar: () => void
  aoSalvar: (dados: DadosAmbiente) => void
  salvando?: boolean
  /** Com um ambiente, o modal edita; sem, cria. */
  ambiente?: AmbienteEstudo | null
}

export default function ModalAmbiente({
  aberto,
  aoFechar,
  aoSalvar,
  salvando = false,
  ambiente
}: ModalAmbienteProps) {
  const { cadeiras } = useHistoricoCadeiras()
  // Agrupadas por situação; as mais recentes primeiro em cada grupo.
  const grupos = (['ANDAMENTO', 'REPROVADA', 'TRANCADA', 'APROVADA'] as const)
    .map((situacao) => ({
      situacao,
      cadeiras: cadeiras
        .filter((cadeira) => cadeira.situacao === situacao)
        .sort((a, b) => b.ordemPeriodo - a.ordemPeriodo)
    }))
    .filter((grupo) => grupo.cadeiras.length > 0)

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    getValues,
    formState: { errors }
  } = useForm<ValoresFormulario>({
    resolver: zodResolver(esquema),
    defaultValues: {
      nome: '',
      descricao: '',
      cor: 'azul',
      disciplinaCodigo: ''
    }
  })

  useEffect(() => {
    if (!aberto) return
    reset({
      nome: ambiente?.nome ?? '',
      descricao: ambiente?.descricao ?? '',
      cor: ambiente?.cor ?? 'azul',
      disciplinaCodigo: ambiente?.disciplinaCodigo ?? ''
    })
  }, [aberto, ambiente, reset])

  const aoEscolherCadeira = (codigo: string) => {
    const cadeira = cadeiras.find((item) => item.codigo === codigo)
    if (cadeira && !getValues('nome').trim()) setValue('nome', cadeira.nome)
  }

  const enviar = handleSubmit((valores) =>
    aoSalvar({
      nome: valores.nome,
      descricao: valores.descricao || null,
      cor: valores.cor,
      disciplinaCodigo: valores.disciplinaCodigo || null
    })
  )

  return (
    <Modal
      aberto={aberto}
      aoFechar={aoFechar}
      titulo={ambiente ? 'Editar ambiente' : 'Novo ambiente de estudo'}
      descricao="Um espaço para os materiais, chats e atividades de uma cadeira ou tema."
      rodape={
        <>
          <Botao onClick={aoFechar}>Cancelar</Botao>
          <Botao variante="primario" onClick={enviar} carregando={salvando}>
            {ambiente ? 'Salvar' : 'Criar ambiente'}
          </Botao>
        </>
      }
    >
      <form onSubmit={enviar} className="space-y-5" noValidate>
        <div>
          <label htmlFor="ambiente-cadeira" className={classeRotulo}>
            Cadeira (opcional)
          </label>
          <select
            id="ambiente-cadeira"
            className={classeCampo}
            {...register('disciplinaCodigo', {
              onChange: (evento) => aoEscolherCadeira(evento.target.value)
            })}
          >
            <option value="">Nenhuma: ambiente livre</option>
            {grupos.map((grupo) => (
              <optgroup
                key={grupo.situacao}
                label={SITUACOES[grupo.situacao].rotulo}
              >
                {grupo.cadeiras.map((cadeira) => (
                  <option key={cadeira.codigo} value={cadeira.codigo}>
                    {cadeira.nome} ({cadeira.codigo})
                    {cadeira.periodo ? ` · ${cadeira.periodo}` : ''}
                  </option>
                ))}
              </optgroup>
            ))}
            {ambiente?.disciplinaCodigo &&
              !cadeiras.some(
                ({ codigo }) => codigo === ambiente.disciplinaCodigo
              ) && (
                <option value={ambiente.disciplinaCodigo}>
                  {ambiente.disciplinaCodigo} (fora do histórico)
                </option>
              )}
          </select>
          <p className={classeAjuda}>
            Vincule a uma cadeira do seu histórico (atual ou de semestres
            passados) ou deixe livre para outros temas (concurso, idiomas,
            projeto pessoal...).
          </p>
        </div>

        <div>
          <label htmlFor="ambiente-nome" className={classeRotulo}>
            Nome
          </label>
          <input
            id="ambiente-nome"
            className={classeCampo}
            placeholder="Ex.: Cálculo II"
            autoFocus
            {...register('nome')}
          />
          {errors.nome && <p className={classeErro}>{errors.nome.message}</p>}
        </div>

        <div>
          <label htmlFor="ambiente-descricao" className={classeRotulo}>
            Descrição (opcional)
          </label>
          <textarea
            id="ambiente-descricao"
            rows={2}
            className={classeCampo}
            placeholder="Ex.: Revisão para a AP2 — integrais e séries."
            {...register('descricao')}
          />
          {errors.descricao && (
            <p className={classeErro}>{errors.descricao.message}</p>
          )}
        </div>

        <fieldset>
          <legend className={classeRotulo}>Cor</legend>
          <Controller
            control={control}
            name="cor"
            render={({ field }) => (
              <div className="mt-2 flex flex-wrap gap-2">
                {LISTA_CORES.map((cor) => (
                  <button
                    key={cor}
                    type="button"
                    onClick={() => field.onChange(cor)}
                    aria-label={CORES_AMBIENTE[cor].rotulo}
                    aria-pressed={field.value === cor}
                    className={clsx(
                      'flex size-8 items-center justify-center rounded-full text-white ring-offset-2 cursor-pointer',
                      CORES_AMBIENTE[cor].solido,
                      field.value === cor && 'ring-2 ring-xor-navy'
                    )}
                  >
                    {field.value === cor && <LuCheck aria-hidden />}
                  </button>
                ))}
              </div>
            )}
          />
        </fieldset>
      </form>
    </Modal>
  )
}
