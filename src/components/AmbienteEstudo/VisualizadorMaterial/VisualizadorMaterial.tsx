'use client'

import { LuInfo } from 'react-icons/lu'
import { Material } from '@/@types/AmbienteEstudo'
import {
  obterMiniatura,
  obterPreviewSessao
} from '@/services/ambienteEstudo/materiais'
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
  const preview = material ? obterPreviewSessao(material.id) : null
  const miniatura = material ? obterMiniatura(material.id) : null

  const conteudo = () => {
    if (!material) return null
    if (material.tipo === 'TEXTO' && material.conteudoTexto) {
      return (
        <div className="rounded-xl bg-gray-50 p-4 text-sm">
          <Markdown conteudo={material.conteudoTexto} />
        </div>
      )
    }
    if (material.tipo === 'IMAGEM' && (preview || miniatura)) {
      return (
        <img
          src={preview ?? miniatura ?? ''}
          alt={material.nome}
          className="w-full rounded-xl ring-1 ring-gray-200"
        />
      )
    }
    if (material.tipo === 'PDF' && preview) {
      return (
        <iframe
          src={preview}
          title={material.nome}
          className="h-[60vh] w-full rounded-xl ring-1 ring-gray-200"
        />
      )
    }
    return (
      <p className="flex items-start gap-2 rounded-xl bg-gray-50 p-4 text-sm text-gray-600">
        <LuInfo className="mt-0.5 shrink-0" aria-hidden />A pré-visualização
        deste arquivo fica disponível depois da integração com o servidor. Por
        enquanto, os arquivos não são guardados no navegador.
      </p>
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
