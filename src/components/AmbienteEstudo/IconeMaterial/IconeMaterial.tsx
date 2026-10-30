import clsx from 'clsx'
import {
  LuFileImage,
  LuFileText,
  LuPresentation,
  LuStickyNote
} from 'react-icons/lu'
import { TipoMaterial } from '@/@types/AmbienteEstudo'

const ICONES: Record<TipoMaterial, { icone: typeof LuFileText; cor: string }> =
  {
    PDF: { icone: LuFileText, cor: 'bg-red-50 text-red-700' },
    DOCX: { icone: LuFileText, cor: 'bg-blue-50 text-blue-700' },
    PPTX: { icone: LuPresentation, cor: 'bg-orange-50 text-orange-700' },
    IMAGEM: { icone: LuFileImage, cor: 'bg-emerald-50 text-emerald-700' },
    TEXTO: { icone: LuStickyNote, cor: 'bg-gray-100 text-gray-700' }
  }

export default function IconeMaterial({
  tipo,
  className
}: {
  tipo: TipoMaterial
  className?: string
}) {
  const { icone: Icone, cor } = ICONES[tipo]
  return (
    <span
      className={clsx(
        'flex size-9 shrink-0 items-center justify-center rounded-lg text-lg',
        cor,
        className
      )}
      aria-hidden
    >
      <Icone />
    </span>
  )
}
