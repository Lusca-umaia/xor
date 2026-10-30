'use client'

import clsx from 'clsx'
import { useParams } from 'next/navigation'
import { useState } from 'react'
import { LuLibrary, LuSearch, LuShieldCheck } from 'react-icons/lu'
import { Material } from '@/@types/AmbienteEstudo'
import IconeTile from '@/components/IconeTile/IconeTile'
import Botao from '@/components/AmbienteEstudo/Botao/Botao'
import EstadoVazio from '@/components/AmbienteEstudo/EstadoVazio/EstadoVazio'
import Esqueleto from '@/components/AmbienteEstudo/Esqueleto/Esqueleto'
import {
  classeCampo,
  classeCartao,
  classeRotulo
} from '@/components/AmbienteEstudo/estilos'
import ItemMaterial from '@/components/AmbienteEstudo/ItemMaterial/ItemMaterial'
import Modal from '@/components/AmbienteEstudo/Modal/Modal'
import ModalConfirmacao from '@/components/AmbienteEstudo/ModalConfirmacao/ModalConfirmacao'
import VisualizadorMaterial from '@/components/AmbienteEstudo/VisualizadorMaterial/VisualizadorMaterial'
import ZonaUpload from '@/components/AmbienteEstudo/ZonaUpload/ZonaUpload'
import {
  useCriarMaterialTexto,
  useEnviarMateriais,
  useExcluirMaterial,
  useMateriais,
  useRenomearMaterial
} from '@/hooks/ambienteEstudo/useMateriais'
import { normalizarTexto } from '@/utils/historicoAcademico'

export default function MateriaisPage() {
  const { ambienteId } = useParams<{ ambienteId: string }>()
  const { data: materiais, isLoading } = useMateriais(ambienteId)
  const enviar = useEnviarMateriais(ambienteId)
  const criarTexto = useCriarMaterialTexto(ambienteId)
  const renomear = useRenomearMaterial()
  const excluir = useExcluirMaterial()

  const [busca, setBusca] = useState('')
  const [visualizando, setVisualizando] = useState<Material | null>(null)
  const [renomeando, setRenomeando] = useState<Material | null>(null)
  const [novoNome, setNovoNome] = useState('')
  const [excluindo, setExcluindo] = useState<Material | null>(null)
  const [colandoTexto, setColandoTexto] = useState(false)
  const [texto, setTexto] = useState({ nome: '', conteudo: '' })

  const filtrados = (materiais ?? []).filter(({ nome }) =>
    normalizarTexto(nome).includes(normalizarTexto(busca))
  )

  const fecharTexto = () => {
    setColandoTexto(false)
    setTexto({ nome: '', conteudo: '' })
  }

  return (
    <div className="space-y-5">
      <ZonaUpload
        aoSelecionar={(arquivos) => enviar.mutate({ arquivos })}
        aoColarTexto={() => setColandoTexto(true)}
        enviando={enviar.isPending}
      />

      <p className="flex items-start gap-2 text-xs text-gray-500">
        <LuShieldCheck className="mt-0.5 shrink-0" aria-hidden />
        Seus materiais são usados apenas para gerar conteúdo de estudo para você
        e não são compartilhados com outros alunos.
      </p>

      {isLoading ? (
        <div className={clsx(classeCartao, 'space-y-4 p-4')}>
          <Esqueleto className="h-10" />
          <Esqueleto className="h-10" />
        </div>
      ) : materiais && materiais.length === 0 ? (
        <EstadoVazio
          icone={<LuLibrary />}
          titulo="A biblioteca está vazia"
          descricao="Envie slides, apostilas, listas de exercícios ou anotações. Eles serão a base dos chats, resumos, atividades e simulados."
        />
      ) : (
        <section className={clsx(classeCartao, 'overflow-hidden')}>
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-6 py-4 max-md:px-4">
            <header className="flex items-center gap-3">
              <IconeTile>
                <LuLibrary />
              </IconeTile>
              <div>
                <h2 className="text-lg font-bold leading-tight tracking-tight max-md:text-base">
                  Biblioteca
                </h2>
                <p className="text-sm text-gray-500">
                  {materiais?.length ?? 0} material(is) usados como base da IA
                </p>
              </div>
            </header>
            <div className="relative w-full sm:w-64">
              <LuSearch className="absolute left-3 top-1/2 mt-0.5 -translate-y-1/2 text-gray-400" />
              <input
                value={busca}
                onChange={(evento) => setBusca(evento.target.value)}
                placeholder="Buscar na biblioteca"
                aria-label="Buscar na biblioteca"
                className={clsx(classeCampo, 'mt-0 pl-9')}
              />
            </div>
          </div>
          <ul className="divide-y divide-gray-100">
            {filtrados.map((material) => (
              <ItemMaterial
                key={material.id}
                material={material}
                aoVisualizar={() => setVisualizando(material)}
                aoRenomear={() => {
                  setRenomeando(material)
                  setNovoNome(material.nome)
                }}
                aoExcluir={() => setExcluindo(material)}
              />
            ))}
            {filtrados.length === 0 && (
              <li className="px-4 py-6 text-center text-sm text-gray-500">
                Nenhum material encontrado para “{busca}”.
              </li>
            )}
          </ul>
        </section>
      )}

      <VisualizadorMaterial
        material={visualizando}
        aoFechar={() => setVisualizando(null)}
      />

      <Modal
        aberto={colandoTexto}
        aoFechar={fecharTexto}
        titulo="Colar texto"
        descricao="Anotações de aula, trechos de livro ou qualquer texto de estudo."
        largura="lg"
        rodape={
          <>
            <Botao onClick={fecharTexto}>Cancelar</Botao>
            <Botao
              variante="primario"
              disabled={!texto.conteudo.trim()}
              carregando={criarTexto.isPending}
              onClick={() =>
                criarTexto.mutate(
                  { nome: texto.nome, texto: texto.conteudo },
                  { onSuccess: fecharTexto }
                )
              }
            >
              Adicionar à biblioteca
            </Botao>
          </>
        }
      >
        <div className="space-y-4">
          <label className={classeRotulo}>
            Título
            <input
              value={texto.nome}
              onChange={(evento) =>
                setTexto({ ...texto, nome: evento.target.value })
              }
              placeholder="Ex.: Anotações da aula 7"
              className={classeCampo}
            />
          </label>
          <label className={classeRotulo}>
            Texto
            <textarea
              value={texto.conteudo}
              onChange={(evento) =>
                setTexto({ ...texto, conteudo: evento.target.value })
              }
              rows={10}
              placeholder="Cole aqui o conteúdo. Markdown e fórmulas em LaTeX ($x^2$) são aceitos."
              className={classeCampo}
            />
          </label>
        </div>
      </Modal>

      <Modal
        aberto={renomeando !== null}
        aoFechar={() => setRenomeando(null)}
        titulo="Renomear material"
        largura="sm"
        rodape={
          <>
            <Botao onClick={() => setRenomeando(null)}>Cancelar</Botao>
            <Botao
              variante="primario"
              disabled={!novoNome.trim()}
              carregando={renomear.isPending}
              onClick={() =>
                renomeando &&
                renomear.mutate(
                  { id: renomeando.id, nome: novoNome },
                  { onSuccess: () => setRenomeando(null) }
                )
              }
            >
              Salvar
            </Botao>
          </>
        }
      >
        <label className={classeRotulo}>
          Nome
          <input
            value={novoNome}
            onChange={(evento) => setNovoNome(evento.target.value)}
            className={classeCampo}
            autoFocus
          />
        </label>
      </Modal>

      <ModalConfirmacao
        aberto={excluindo !== null}
        aoFechar={() => setExcluindo(null)}
        titulo="Excluir material?"
        perigoso
        textoConfirmar="Excluir"
        carregando={excluir.isPending}
        aoConfirmar={() =>
          excluindo &&
          excluir.mutate(excluindo.id, { onSuccess: () => setExcluindo(null) })
        }
        mensagem={
          <p>
            <strong>{excluindo?.nome}</strong> deixará de ser usado como
            contexto nos chats. Resumos e atividades já gerados continuam
            disponíveis, mas as citações apontarão para um material que não
            existe mais.
          </p>
        }
      />
    </div>
  )
}
