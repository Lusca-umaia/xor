'use client'

import clsx from 'clsx'
import { useEffect, useState } from 'react'
import { Material, ModoChat } from '@/@types/AmbienteEstudo'
import Botao from '../Botao/Botao'
import { classeCampo, classeOpcao, classeRotulo } from '../estilos'
import Modal from '../Modal/Modal'
import SeletorMateriais from '../SeletorMateriais/SeletorMateriais'
import { MODOS } from './AlternadorModo'

export interface DadosContextoChat {
  titulo: string
  materialIds: string[]
  modo: ModoChat
}

interface ModalContextoChatProps {
  aberto: boolean
  aoFechar: () => void
  aoSalvar: (dados: DadosContextoChat) => void
  salvando?: boolean
  ambienteId: string
  materiais: Material[]
  /** Sem valores iniciais, o modal cria um chat novo. */
  inicial?: DadosContextoChat
}

/** Cria um chat ou edita o contexto (materiais e modo) de um chat existente. */
export default function ModalContextoChat({
  aberto,
  aoFechar,
  aoSalvar,
  salvando,
  ambienteId,
  materiais,
  inicial
}: ModalContextoChatProps) {
  const [dados, setDados] = useState<DadosContextoChat>({
    titulo: '',
    materialIds: [],
    modo: 'TUTOR'
  })

  useEffect(() => {
    if (!aberto) return
    setDados(
      inicial ?? {
        titulo: '',
        materialIds: materiais
          .filter(({ status }) => status === 'PRONTO')
          .map(({ id }) => id),
        modo: 'TUTOR'
      }
    )
    // Só ao abrir: a lista de materiais pode atualizar enquanto o modal está aberto.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aberto])

  const editando = Boolean(inicial)

  return (
    <Modal
      aberto={aberto}
      aoFechar={aoFechar}
      titulo={editando ? 'Contexto do chat' : 'Novo chat'}
      descricao="A IA responde com base nos materiais selecionados e cita as fontes."
      largura="lg"
      rodape={
        <>
          <Botao onClick={aoFechar}>Cancelar</Botao>
          <Botao
            variante="primario"
            carregando={salvando}
            onClick={() => aoSalvar(dados)}
          >
            {editando ? 'Salvar' : 'Criar chat'}
          </Botao>
        </>
      }
    >
      <div className="space-y-5">
        {!editando && (
          <label className={classeRotulo}>
            Título (opcional)
            <input
              value={dados.titulo}
              onChange={(evento) =>
                setDados({ ...dados, titulo: evento.target.value })
              }
              placeholder="Gerado a partir da primeira pergunta"
              className={classeCampo}
            />
          </label>
        )}
        <div>
          <span className={classeRotulo}>Materiais usados como contexto</span>
          <div className="mt-2">
            <SeletorMateriais
              ambienteId={ambienteId}
              materiais={materiais}
              selecionados={dados.materialIds}
              aoMudar={(materialIds) => setDados({ ...dados, materialIds })}
            />
          </div>
          {dados.materialIds.length === 0 && (
            <p className="mt-2 text-xs text-amber-700">
              Sem materiais, a IA não terá fontes para citar e avisará quando
              responder com conhecimento geral.
            </p>
          )}
        </div>
        <fieldset>
          <legend className={classeRotulo}>Modo do assistente</legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {MODOS.map(({ valor, rotulo, descricao, icone: Icone }) => (
              <button
                key={valor}
                type="button"
                aria-pressed={dados.modo === valor}
                onClick={() => setDados({ ...dados, modo: valor })}
                className={classeOpcao(dados.modo === valor)}
              >
                <span className="flex items-center gap-1.5 text-sm font-bold">
                  <Icone aria-hidden /> {rotulo}
                  {valor === 'TUTOR' && (
                    <span
                      className={clsx(
                        'rounded px-1 text-[10px] font-semibold uppercase',
                        dados.modo === valor ? 'bg-white/20' : 'bg-gray-100'
                      )}
                    >
                      recomendado
                    </span>
                  )}
                </span>
                <span
                  className={clsx(
                    'mt-0.5 block text-xs',
                    dados.modo === valor ? 'text-gray-300' : 'text-gray-500'
                  )}
                >
                  {descricao}
                </span>
              </button>
            ))}
          </div>
        </fieldset>
      </div>
    </Modal>
  )
}
