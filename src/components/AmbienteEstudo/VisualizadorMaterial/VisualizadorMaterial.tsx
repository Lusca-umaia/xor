'use client'

import { LuDownload } from 'react-icons/lu'
import { Material } from '@/@types/AmbienteEstudo'
import { urlDoArquivo } from '@/services/ambienteEstudo/materiais'
import {
  formatarDataHora,
  formatarTamanho
} from '@/utils/ambienteEstudo/formatar'
import { ROTULO_TIPO_MATERIAL } from '@/utils/ambienteEstudo/rotulos'
import Markdown from '../Markdown/Markdown'
import Modal from '../Modal/Modal'

export default function VisualizadorMaterial({
  material,
  aoFechar
}: {
  material: Material | null
  aoFechar: () => void
}) {
  const arquivo = material ? urlDoArquivo(material.id) : ''

  const conteudo = () => {
    if (!material) return null
    if (material.tipo === 'TEXTO' && material.conteudoTexto) {
      return (
        <div className="rounded-xl bg-gray-50 p-4 text-sm">
          <Markdown conteudo={material.conteudoTexto} />
        </div>
      )
    }
    if (material.tipo === 'IMAGEM') {
      return (
        <img
          src={arquivo}
          alt={material.nome}
          className="w-full rounded-xl ring-1 ring-gray-200"
        />
      )
    }
    if (material.tipo === 'PDF') {
      return (
        <iframe
          src={arquivo}
          title={material.nome}
          className="h-[60vh] w-full rounded-xl ring-1 ring-gray-200"
        />
      )
    }
    // DOCX e PPTX não têm pré-visualização no navegador: baixa o original.
    return (
      <a
        href={arquivo}
        className="inline-flex items-center gap-2 rounded-xl bg-gray-50 p-4 text-sm font-semibold text-gray-800 hover:bg-gray-100"
      >
        <LuDownload aria-hidden /> Baixar o arquivo original
      </a>
    )
  }

  return (
    <Modal
      aberto={Boolean(material)}
      aoFechar={aoFechar}
      lateral
      titulo={material?.nome ?? ''}
      descricao={
        material &&
        [
          ROTULO_TIPO_MATERIAL[material.tipo],
          formatarTamanho(material.tamanhoBytes),
          material.paginas && `${material.paginas} páginas`,
          `enviado em ${formatarDataHora(material.criadoEm)}`
        ]
          .filter(Boolean)
          .join(' · ')
      }
    >
      {conteudo()}
    </Modal>
  )
}
