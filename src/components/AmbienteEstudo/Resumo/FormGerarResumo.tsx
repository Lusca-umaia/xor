'use client'

import clsx from 'clsx'
import { useEffect, useState } from 'react'
import { ConfigResumo, FormatoResumo, Material } from '@/@types/AmbienteEstudo'
import {
  DESCRICAO_FORMATO_RESUMO,
  ROTULO_FORMATO_RESUMO
} from '@/utils/ambienteEstudo/rotulos'
import Botao from '../Botao/Botao'
import { classeCampo, classeOpcao, classeRotulo } from '../estilos'
import Modal from '../Modal/Modal'
import SeletorMateriais from '../SeletorMateriais/SeletorMateriais'

const FORMATOS = Object.keys(ROTULO_FORMATO_RESUMO) as FormatoResumo[]

interface FormGerarResumoProps {
  aberto: boolean
  aoFechar: () => void
  aoGerar: (config: ConfigResumo) => void
  gerando?: boolean
  ambienteId: string
  materiais: Material[]
}

export default function FormGerarResumo({
  aberto,
  aoFechar,
  aoGerar,
  gerando,
  ambienteId,
  materiais
}: FormGerarResumoProps) {
  const [formato, setFormato] = useState<FormatoResumo>('TOPICOS')
  const [materialIds, setMaterialIds] = useState<string[]>([])
  const [titulo, setTitulo] = useState('')

  useEffect(() => {
    if (!aberto) return
    setFormato('TOPICOS')
    setTitulo('')
    setMaterialIds(
      materiais.filter(({ status }) => status === 'PRONTO').map(({ id }) => id)
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aberto])

  return (
    <Modal
      aberto={aberto}
      aoFechar={aoFechar}
      titulo="Gerar resumo"
      descricao="Cada afirmação do resumo aponta para o trecho do material de onde veio."
      largura="lg"
      rodape={
        <>
          <Botao onClick={aoFechar}>Cancelar</Botao>
          <Botao
            variante="primario"
            disabled={materialIds.length === 0}
            carregando={gerando}
            onClick={() =>
              aoGerar({
                formato,
                materialIds,
                titulo: titulo.trim() || undefined
              })
            }
          >
            Gerar resumo
          </Botao>
        </>
      }
    >
      <div className="space-y-6">
        <fieldset>
          <legend className={classeRotulo}>Formato</legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {FORMATOS.map((opcao) => (
              <button
                key={opcao}
                type="button"
                aria-pressed={formato === opcao}
                onClick={() => setFormato(opcao)}
                className={classeOpcao(formato === opcao)}
              >
                <span className="block text-sm font-bold">
                  {ROTULO_FORMATO_RESUMO[opcao]}
                </span>
                <span
                  className={clsx(
                    'block text-xs',
                    formato === opcao ? 'text-gray-300' : 'text-gray-500'
                  )}
                >
                  {DESCRICAO_FORMATO_RESUMO[opcao]}
                </span>
              </button>
            ))}
          </div>
        </fieldset>
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
        <label className={classeRotulo}>
          Título (opcional)
          <input
            value={titulo}
            onChange={(evento) => setTitulo(evento.target.value)}
            placeholder="Gerado automaticamente"
            className={classeCampo}
          />
        </label>
      </div>
    </Modal>
  )
}
