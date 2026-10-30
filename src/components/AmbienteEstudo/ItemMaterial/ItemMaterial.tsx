'use client'

import {
  LuCircleAlert,
  LuEye,
  LuLoader,
  LuPencil,
  LuTrash2
} from 'react-icons/lu'
import { Material } from '@/@types/AmbienteEstudo'
import { obterMiniatura } from '@/services/ambienteEstudo/materiais'
import {
  formatarDataRelativa,
  formatarTamanho
} from '@/utils/ambienteEstudo/formatar'
import { ROTULO_TIPO_MATERIAL } from '@/utils/ambienteEstudo/rotulos'
import IconeMaterial from '../IconeMaterial/IconeMaterial'
import MenuAcoes from '../MenuAcoes/MenuAcoes'

interface ItemMaterialProps {
  material: Material
  aoVisualizar: () => void
  aoRenomear: () => void
  aoExcluir: () => void
}

const STATUS = {
  ENVIANDO: 'Enviando...',
  PROCESSANDO: 'Processando o conteúdo...'
} as const

export default function ItemMaterial({
  material,
  aoVisualizar,
  aoRenomear,
  aoExcluir
}: ItemMaterialProps) {
  const miniatura =
    material.tipo === 'IMAGEM' ? obterMiniatura(material.id) : null
  const emAndamento =
    material.status === 'ENVIANDO' || material.status === 'PROCESSANDO'
  const comErro = material.status === 'ERRO'

  const detalhes = [
    ROTULO_TIPO_MATERIAL[material.tipo],
    formatarTamanho(material.tamanhoBytes),
    material.paginas &&
      `${material.paginas} ${material.tipo === 'PPTX' ? 'slides' : 'pág.'}`,
    formatarDataRelativa(material.criadoEm)
  ].filter(Boolean)

  return (
    <li className="flex items-center gap-3 px-4 py-3">
      {miniatura ? (
        <img
          src={miniatura}
          alt=""
          className="size-9 shrink-0 rounded-lg object-cover ring-1 ring-gray-200"
        />
      ) : (
        <IconeMaterial tipo={material.tipo} />
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={aoVisualizar}
            disabled={comErro}
            className="truncate text-left text-sm font-semibold text-gray-900 hover:underline disabled:no-underline cursor-pointer disabled:cursor-default"
          >
            {material.nome}
          </button>
          {material.origem === 'CHAT' && (
            <span className="shrink-0 rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-gray-600">
              do chat
            </span>
          )}
        </div>
        {comErro ? (
          <p className="flex items-center gap-1 text-xs font-medium text-red-600">
            <LuCircleAlert aria-hidden /> {material.mensagemErro}
          </p>
        ) : emAndamento ? (
          <div className="mt-1 space-y-1" role="status">
            <p className="flex items-center gap-1 text-xs text-gray-600">
              <LuLoader className="animate-spin" aria-hidden />{' '}
              {STATUS[material.status as keyof typeof STATUS]}
            </p>
            <div className="h-1 w-40 max-w-full overflow-hidden rounded-full bg-gray-100">
              <div
                className={`h-full bg-gray-900 transition-all duration-700 ${material.status === 'ENVIANDO' ? 'w-1/3' : 'w-3/4 animate-pulse'}`}
              />
            </div>
          </div>
        ) : (
          <p className="text-xs text-gray-500">{detalhes.join(' · ')}</p>
        )}
      </div>
      <MenuAcoes
        rotulo={`Ações para ${material.nome}`}
        acoes={[
          ...(comErro
            ? []
            : [
                {
                  rotulo: 'Visualizar',
                  icone: <LuEye />,
                  aoClicar: aoVisualizar
                },
                {
                  rotulo: 'Renomear',
                  icone: <LuPencil />,
                  aoClicar: aoRenomear
                }
              ]),
          {
            rotulo: 'Excluir',
            icone: <LuTrash2 />,
            aoClicar: aoExcluir,
            perigosa: true
          }
        ]}
      />
    </li>
  )
}
