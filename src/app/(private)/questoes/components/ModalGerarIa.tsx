'use client'

import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle
} from '@headlessui/react'
import { useEffect, useState } from 'react'
import { LuLoaderCircle, LuSparkles } from 'react-icons/lu'
import { Dificuldade, QuestaoGerada } from '@/@types/Questionario'
import FormInput from '@/components/FormInput/FormInput'
import Select from '@/components/Select/Select'
import { useGerarQuestoes } from '@/hooks/mutations/useQuestionarios'
import { gerarQuestoesSchema } from '@/lib/api/schemas'
import { getErrorMessage } from '@/services/api'
import { DIFICULDADE_OPCOES } from '@/utils/questionarios'
import CampoTexto from './CampoTexto'

const ALTERNATIVAS_OPCOES = [2, 3, 4, 5, 6].map((n) => ({
  id: n,
  nome: `${n} alternativas`
}))

interface Campos {
  tema: string
  conteudo: string
  instrucoes: string
  disciplinaId: number
  quantidade: string
  alternativas: number
  dificuldade: Dificuldade
}

interface ModalGerarIaProps {
  open: boolean
  onClose: () => void
  onGerar: (questoes: QuestaoGerada[], tema: string) => void
  disciplinas: { id: number; nome: string }[]
  // Valores do questionário em edição, para já vir preenchido.
  disciplinaId: number | null
  dificuldade: Dificuldade | null
  tema: string
}

const ModalGerarIa: React.FC<ModalGerarIaProps> = ({
  open,
  onClose,
  onGerar,
  disciplinas,
  disciplinaId,
  dificuldade,
  tema
}) => {
  const gerar = useGerarQuestoes()
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [campos, setCampos] = useState<Campos>({
    tema: '',
    conteudo: '',
    instrucoes: '',
    disciplinaId: 0,
    quantidade: '5',
    alternativas: 5,
    dificuldade: 'MEDIA'
  })

  useEffect(() => {
    if (!open) return
    gerar.reset()
    setErrors({})
    setCampos((prev) => ({
      ...prev,
      tema: prev.tema || tema,
      disciplinaId: disciplinaId ?? prev.disciplinaId,
      dificuldade: dificuldade ?? prev.dificuldade
    }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const handleChange = <K extends keyof Campos>(campo: K, valor: Campos[K]) => {
    setCampos((prev) => ({ ...prev, [campo]: valor }))
    setErrors((prev) => ({ ...prev, [campo]: '' }))
  }

  const handleSubmit = () => {
    const parametros = gerarQuestoesSchema.safeParse({
      ...campos,
      disciplinaId: campos.disciplinaId || null
    })

    if (!parametros.success) {
      const fieldErrors: Record<string, string> = {}
      for (const err of parametros.error.errors) {
        fieldErrors[String(err.path[0])] ??= err.message
      }
      setErrors(fieldErrors)
      return
    }

    gerar.mutate(parametros.data, {
      onSuccess: (questoes) => onGerar(questoes, parametros.data.tema)
    })
  }

  // Não fecha no meio da geração para não perder o resultado.
  const fechar = () => !gerar.isPending && onClose()

  return (
    <Dialog open={open} onClose={fechar} className="relative z-20">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-gray-500/75 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in"
      />
      <div className="fixed inset-0 z-20 w-screen overflow-y-auto">
        <div className="flex min-h-full items-end justify-center p-4 sm:items-center">
          <DialogPanel
            transition
            className="w-full max-w-2xl transform rounded-2xl bg-white p-6 shadow-xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in data-closed:sm:translate-y-0 data-closed:sm:scale-95"
          >
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleSubmit()
              }}
              className="space-y-5"
            >
              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-violet-50 p-2.5 text-violet-700">
                  <LuSparkles className="text-xl" />
                </div>
                <div>
                  <DialogTitle
                    as="h3"
                    className="text-base font-semibold text-gray-900"
                  >
                    Gerar questões com IA
                  </DialogTitle>
                  <p className="text-sm text-gray-500">
                    Quanto mais contexto você der, melhores as questões. Você
                    revisa tudo antes de salvar.
                  </p>
                </div>
              </div>

              <fieldset disabled={gerar.isPending} className="space-y-4">
                <FormInput
                  type="text"
                  name="tema"
                  label="Tema"
                  placeholder="Ex: Árvores binárias de busca e balanceamento AVL"
                  value={campos.tema}
                  error={errors.tema}
                  handleChange={(valor) => handleChange('tema', valor)}
                />

                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                  <Select
                    className="col-span-2"
                    label="Disciplina"
                    options={[{ id: 0, nome: 'Nenhuma' }, ...disciplinas]}
                    value={campos.disciplinaId}
                    onChange={({ id }) => handleChange('disciplinaId', id)}
                  />
                  <Select
                    label="Dificuldade"
                    options={DIFICULDADE_OPCOES}
                    value={campos.dificuldade}
                    onChange={({ id }) => handleChange('dificuldade', id)}
                  />
                  <FormInput
                    type="number"
                    name="quantidade"
                    label="Quantidade"
                    min={1}
                    max={20}
                    value={campos.quantidade}
                    error={errors.quantidade}
                    handleChange={(valor) => handleChange('quantidade', valor)}
                  />
                  <Select
                    className="col-span-2"
                    label="Alternativas por questão"
                    options={ALTERNATIVAS_OPCOES}
                    value={campos.alternativas}
                    onChange={({ id }) => handleChange('alternativas', id)}
                  />
                </div>

                <CampoTexto
                  name="conteudo"
                  label="Material de referência"
                  rows={5}
                  placeholder="Cole aqui um resumo, trecho do livro, slides ou anotações da aula. As questões serão baseadas só nesse conteúdo."
                  dica="Opcional. Sem material, a IA usa o conhecimento próprio sobre o tema."
                  value={campos.conteudo}
                  error={errors.conteudo}
                  handleChange={(valor) => handleChange('conteudo', valor)}
                />

                <CampoTexto
                  name="instrucoes"
                  label="Instruções extras"
                  placeholder="Ex: foque em complexidade de algoritmos, inclua questões com trechos de código"
                  value={campos.instrucoes}
                  error={errors.instrucoes}
                  handleChange={(valor) => handleChange('instrucoes', valor)}
                />
              </fieldset>

              {gerar.isPending && (
                <div className="flex items-center gap-3 rounded-xl bg-violet-50 p-3 text-sm text-violet-800">
                  <LuLoaderCircle className="shrink-0 animate-spin text-lg" />
                  Gerando questões... modelos locais podem levar alguns minutos.
                </div>
              )}

              {gerar.error && (
                <p className="text-sm font-medium text-red-600">
                  {getErrorMessage(gerar.error)}
                </p>
              )}

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={fechar}
                  disabled={gerar.isPending}
                  className="cursor-pointer rounded-xl bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-xs ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-60"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={gerar.isPending}
                  className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-xs hover:bg-violet-500 disabled:opacity-60"
                >
                  <LuSparkles />
                  {gerar.isPending ? 'Gerando...' : 'Gerar questões'}
                </button>
              </div>
            </form>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  )
}

export default ModalGerarIa
