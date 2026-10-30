'use client'

import clsx from 'clsx'
import { useEffect, useState } from 'react'
import {
  ConfigSimulado,
  DificuldadeConfig,
  Material,
  TipoQuestao
} from '@/@types/AmbienteEstudo'
import {
  ROTULO_DIFICULDADE,
  ROTULO_TIPO_QUESTAO
} from '@/utils/ambienteEstudo/rotulos'
import Botao from '../Botao/Botao'
import {
  classeAjuda,
  classeCampo,
  classeCartao,
  classeOpcao,
  classeRotulo
} from '../estilos'
import SeletorMateriais from '../SeletorMateriais/SeletorMateriais'

const TIPOS = Object.keys(ROTULO_TIPO_QUESTAO) as TipoQuestao[]
const DIFICULDADES = Object.keys(ROTULO_DIFICULDADE) as DificuldadeConfig[]

/** 2 min por objetiva + 10 min por discursiva (estimando ~20% de discursivas). */
export function duracaoSugerida(quantidade: number, tipos: TipoQuestao[]) {
  const temDiscursiva = tipos.includes('DISCURSIVA')
  const soDiscursiva = temDiscursiva && tipos.length === 1
  const discursivas = soDiscursiva
    ? quantidade
    : temDiscursiva
      ? Math.max(1, Math.round(quantidade * 0.2))
      : 0
  return Math.max(5, (quantidade - discursivas) * 2 + discursivas * 10)
}

interface FormNovoSimuladoProps {
  ambienteId: string
  materiais: Material[]
  gerando?: boolean
  aoGerar: (dados: { titulo?: string; config: ConfigSimulado }) => void
  aoCancelar: () => void
}

export default function FormNovoSimulado({
  ambienteId,
  materiais,
  gerando,
  aoGerar,
  aoCancelar
}: FormNovoSimuladoProps) {
  const [titulo, setTitulo] = useState('')
  const [materialIds, setMaterialIds] = useState<string[]>([])
  const [materiaisIniciados, setMateriaisIniciados] = useState(false)
  const [quantidade, setQuantidade] = useState(10)
  const [tipos, setTipos] = useState<TipoQuestao[]>(['MULTIPLA_ESCOLHA'])
  const [dificuldade, setDificuldade] = useState<DificuldadeConfig>('MISTA')
  const [treino, setTreino] = useState(false)
  const [duracao, setDuracao] = useState(
    duracaoSugerida(10, ['MULTIPLA_ESCOLHA'])
  )
  const [duracaoEditada, setDuracaoEditada] = useState(false)
  const [embaralhar, setEmbaralhar] = useState(true)

  // Seleciona os materiais prontos quando a lista chega pela primeira vez.
  useEffect(() => {
    if (materiaisIniciados || materiais.length === 0) return
    setMaterialIds(
      materiais.filter(({ status }) => status === 'PRONTO').map(({ id }) => id)
    )
    setMateriaisIniciados(true)
  }, [materiais, materiaisIniciados])

  const sugerida = duracaoSugerida(quantidade, tipos)
  useEffect(() => {
    if (!duracaoEditada) setDuracao(sugerida)
  }, [sugerida, duracaoEditada])

  const alternarTipo = (tipo: TipoQuestao) =>
    setTipos((atuais) =>
      atuais.includes(tipo)
        ? atuais.filter((item) => item !== tipo)
        : [...atuais, tipo]
    )

  const valido =
    materialIds.length > 0 &&
    tipos.length > 0 &&
    quantidade >= 5 &&
    quantidade <= 60 &&
    (treino || (duracao >= 1 && duracao <= 300))

  const gerar = () =>
    aoGerar({
      titulo: titulo.trim() || undefined,
      config: {
        materialIds,
        quantidadeQuestoes: quantidade,
        tiposQuestao: tipos,
        dificuldade,
        duracaoMinutos: treino ? null : duracao,
        embaralharOpcoes: embaralhar
      }
    })

  return (
    <div
      className={clsx(
        classeCartao,
        'mx-auto max-w-3xl space-y-7 p-6 max-md:p-4'
      )}
    >
      <div>
        <h2 className="text-xl font-bold">Novo simulado</h2>
        <p className="text-sm text-gray-500">
          Uma prova com cronômetro gerada a partir dos seus materiais. O
          resultado mostra o desempenho por tópico.
        </p>
      </div>

      <div>
        <span className={classeRotulo}>Materiais</span>
        <div className="mt-2">
          <SeletorMateriais
            ambienteId={ambienteId}
            materiais={materiais}
            selecionados={materialIds}
            aoMudar={setMaterialIds}
          />
        </div>
      </div>

      <fieldset>
        <legend className={classeRotulo}>Tipos de questão</legend>
        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {TIPOS.map((tipo) => (
            <button
              key={tipo}
              type="button"
              aria-pressed={tipos.includes(tipo)}
              onClick={() => alternarTipo(tipo)}
              className={clsx(
                classeOpcao(tipos.includes(tipo)),
                'text-center text-sm font-semibold'
              )}
            >
              {ROTULO_TIPO_QUESTAO[tipo]}
            </button>
          ))}
        </div>
        {tipos.length === 0 && (
          <p className="mt-1 text-xs text-red-600">
            Escolha pelo menos um tipo.
          </p>
        )}
      </fieldset>

      <div className="grid gap-5 sm:grid-cols-2">
        <label className={classeRotulo}>
          Número de questões
          <input
            type="number"
            min={5}
            max={60}
            value={quantidade}
            onChange={(evento) => setQuantidade(Number(evento.target.value))}
            className={classeCampo}
          />
          <span className={classeAjuda}>Entre 5 e 60.</span>
        </label>
        <fieldset>
          <legend className={classeRotulo}>Dificuldade</legend>
          <div className="mt-1.5 grid grid-cols-4 gap-1.5">
            {DIFICULDADES.map((opcao) => (
              <button
                key={opcao}
                type="button"
                aria-pressed={dificuldade === opcao}
                onClick={() => setDificuldade(opcao)}
                className={clsx(
                  classeOpcao(dificuldade === opcao),
                  'px-1 py-2 text-center text-xs font-semibold'
                )}
              >
                {ROTULO_DIFICULDADE[opcao]}
              </button>
            ))}
          </div>
        </fieldset>
      </div>

      <div className="space-y-3 rounded-xl bg-gray-50 p-4">
        <label className="flex items-center gap-2 text-sm font-semibold cursor-pointer">
          <input
            type="checkbox"
            checked={treino}
            onChange={(evento) => setTreino(evento.target.checked)}
            className="size-4 accent-black"
          />
          Modo treino (sem cronômetro)
        </label>
        {!treino && (
          <label className={classeRotulo}>
            Duração (minutos)
            <input
              type="number"
              min={1}
              max={300}
              value={duracao}
              onChange={(evento) => {
                setDuracao(Number(evento.target.value))
                setDuracaoEditada(true)
              }}
              className={clsx(classeCampo, 'max-w-40')}
            />
            <span className={classeAjuda}>
              Sugerido: {sugerida} min (2 min por objetiva, 10 por discursiva).{' '}
              {duracaoEditada && (
                <button
                  type="button"
                  onClick={() => setDuracaoEditada(false)}
                  className="font-semibold underline cursor-pointer"
                >
                  Usar sugestão
                </button>
              )}
            </span>
          </label>
        )}
        <p className="text-xs text-gray-500">
          {treino
            ? 'Sem limite de tempo; o tempo gasto é registrado no resultado.'
            : 'Não é possível pausar. A prova é entregue automaticamente quando o tempo acaba.'}
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <label className={classeRotulo}>
          Título (opcional)
          <input
            value={titulo}
            onChange={(evento) => setTitulo(evento.target.value)}
            placeholder="Ex.: Simulado para a AP2"
            className={classeCampo}
          />
        </label>
        <label className="flex items-center gap-2 self-end pb-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={embaralhar}
            onChange={(evento) => setEmbaralhar(evento.target.checked)}
            className="size-4 accent-black"
          />
          Embaralhar alternativas
        </label>
      </div>

      <p className="text-xs text-gray-500">
        A geração roda na IA local e pode levar alguns minutos.
      </p>

      <div className="flex justify-end gap-2 border-t border-gray-100 pt-5">
        <Botao onClick={aoCancelar}>Cancelar</Botao>
        <Botao
          variante="primario"
          disabled={!valido}
          carregando={gerando}
          onClick={gerar}
        >
          Gerar simulado
        </Botao>
      </div>
    </div>
  )
}
