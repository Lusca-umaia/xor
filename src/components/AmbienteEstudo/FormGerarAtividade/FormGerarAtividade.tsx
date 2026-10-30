'use client'

import clsx from 'clsx'
import { useEffect, useState } from 'react'
import {
  ConfigAtividade,
  DificuldadeConfig,
  Material,
  TipoAtividade
} from '@/@types/AmbienteEstudo'
import {
  DESCRICAO_TIPO_ATIVIDADE,
  ROTULO_DIFICULDADE,
  ROTULO_TIPO_ATIVIDADE
} from '@/utils/ambienteEstudo/rotulos'
import Botao from '../Botao/Botao'
import { classeAjuda, classeCampo, classeOpcao, classeRotulo } from '../estilos'
import Modal from '../Modal/Modal'
import SeletorMateriais from '../SeletorMateriais/SeletorMateriais'
import { MODO_DEMONSTRACAO } from '../SeloIA/SeloIA'

const TIPOS = Object.keys(ROTULO_TIPO_ATIVIDADE) as TipoAtividade[]
const DIFICULDADES = Object.keys(ROTULO_DIFICULDADE) as DificuldadeConfig[]

const LIMITES: Record<
  TipoAtividade,
  { min: number; max: number; padrao: number }
> = {
  QUIZ: { min: 3, max: 30, padrao: 5 },
  VERDADEIRO_FALSO: { min: 3, max: 30, padrao: 5 },
  LACUNAS: { min: 2, max: 20, padrao: 4 },
  DISCURSIVA: { min: 1, max: 5, padrao: 1 },
  FLASHCARDS: { min: 5, max: 40, padrao: 10 }
}

interface FormGerarAtividadeProps {
  aberto: boolean
  aoFechar: () => void
  aoGerar: (config: ConfigAtividade) => void
  gerando?: boolean
  ambienteId: string
  materiais: Material[]
  tipoInicial?: TipoAtividade
}

export default function FormGerarAtividade({
  aberto,
  aoFechar,
  aoGerar,
  gerando = false,
  ambienteId,
  materiais,
  tipoInicial = 'QUIZ'
}: FormGerarAtividadeProps) {
  const [tipo, setTipo] = useState<TipoAtividade>(tipoInicial)
  const [materialIds, setMaterialIds] = useState<string[]>([])
  const [quantidade, setQuantidade] = useState(LIMITES[tipoInicial].padrao)
  const [dificuldade, setDificuldade] = useState<DificuldadeConfig>('MISTA')
  const [topico, setTopico] = useState('')
  const [titulo, setTitulo] = useState('')

  useEffect(() => {
    if (!aberto) return
    setTipo(tipoInicial)
    setQuantidade(LIMITES[tipoInicial].padrao)
    setMaterialIds(
      materiais.filter(({ status }) => status === 'PRONTO').map(({ id }) => id)
    )
    setTopico('')
    setTitulo('')
    // Só ao abrir: não sobrescreve a seleção se a lista de materiais atualizar.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aberto, tipoInicial])

  const escolherTipo = (novo: TipoAtividade) => {
    setTipo(novo)
    setQuantidade(LIMITES[novo].padrao)
  }

  const limite = LIMITES[tipo]
  const valido =
    materialIds.length > 0 &&
    quantidade >= limite.min &&
    quantidade <= limite.max

  const gerar = () =>
    aoGerar({
      tipo,
      materialIds,
      quantidade,
      dificuldade: tipo === 'FLASHCARDS' ? 'MISTA' : dificuldade,
      topico: topico.trim() || null,
      titulo: titulo.trim() || undefined
    })

  return (
    <Modal
      aberto={aberto}
      aoFechar={aoFechar}
      titulo="Gerar atividade de reforço"
      descricao="A IA cria a atividade a partir dos materiais selecionados."
      largura="lg"
      rodape={
        <>
          <Botao onClick={aoFechar}>Cancelar</Botao>
          <Botao
            variante="primario"
            disabled={!valido}
            carregando={gerando}
            onClick={gerar}
          >
            Gerar atividade
          </Botao>
        </>
      }
    >
      <div className="space-y-6">
        <fieldset>
          <legend className={classeRotulo}>Tipo de atividade</legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {TIPOS.map((opcao) => (
              <button
                key={opcao}
                type="button"
                aria-pressed={tipo === opcao}
                onClick={() => escolherTipo(opcao)}
                className={classeOpcao(tipo === opcao)}
              >
                <span className="block text-sm font-bold">
                  {ROTULO_TIPO_ATIVIDADE[opcao]}
                </span>
                <span
                  className={clsx(
                    'block text-xs',
                    tipo === opcao ? 'text-gray-300' : 'text-gray-500'
                  )}
                >
                  {DESCRICAO_TIPO_ATIVIDADE[opcao]}
                </span>
              </button>
            ))}
          </div>
        </fieldset>

        <div>
          <span className={classeRotulo}>Materiais de base</span>
          <div className="mt-2">
            <SeletorMateriais
              ambienteId={ambienteId}
              materiais={materiais}
              selecionados={materialIds}
              aoMudar={setMaterialIds}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className={classeRotulo}>
            {tipo === 'FLASHCARDS'
              ? 'Quantidade de cartões'
              : 'Quantidade de questões'}
            <input
              type="number"
              min={limite.min}
              max={limite.max}
              value={quantidade}
              onChange={(evento) => setQuantidade(Number(evento.target.value))}
              className={classeCampo}
            />
            <span className={classeAjuda}>
              Entre {limite.min} e {limite.max}.
            </span>
          </label>
          <label className={classeRotulo}>
            Tópico (opcional)
            <input
              value={topico}
              onChange={(evento) => setTopico(evento.target.value)}
              placeholder="Ex.: Árvores balanceadas"
              className={classeCampo}
            />
            <span className={classeAjuda}>Foca a atividade em um assunto.</span>
          </label>
        </div>

        {tipo !== 'FLASHCARDS' && (
          <fieldset>
            <legend className={classeRotulo}>Dificuldade</legend>
            <div className="mt-2 grid grid-cols-4 gap-2">
              {DIFICULDADES.map((opcao) => (
                <button
                  key={opcao}
                  type="button"
                  aria-pressed={dificuldade === opcao}
                  onClick={() => setDificuldade(opcao)}
                  className={clsx(
                    classeOpcao(dificuldade === opcao),
                    'text-center text-sm font-semibold'
                  )}
                >
                  {ROTULO_DIFICULDADE[opcao]}
                </button>
              ))}
            </div>
          </fieldset>
        )}

        <label className={classeRotulo}>
          Título (opcional)
          <input
            value={titulo}
            onChange={(evento) => setTitulo(evento.target.value)}
            placeholder={ROTULO_TIPO_ATIVIDADE[tipo]}
            className={classeCampo}
          />
        </label>

        {MODO_DEMONSTRACAO && (
          <p className="rounded-lg bg-amber-50 p-3 text-xs text-amber-900">
            Modo demonstração: o banco de conteúdo tem poucas questões de cada
            tipo, então a atividade pode vir com menos itens do que o pedido.
          </p>
        )}
      </div>
    </Modal>
  )
}
