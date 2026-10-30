'use client'

import clsx from 'clsx'
import { DragEvent, useRef, useState } from 'react'
import { LuClipboardPaste, LuUpload } from 'react-icons/lu'
import { EXTENSOES_ACEITAS } from '@/services/ambienteEstudo/materiais'
import Botao from '../Botao/Botao'

interface ZonaUploadProps {
  aoSelecionar: (arquivos: File[]) => void
  aoColarTexto: () => void
  enviando?: boolean
}

export default function ZonaUpload({
  aoSelecionar,
  aoColarTexto,
  enviando = false
}: ZonaUploadProps) {
  const entrada = useRef<HTMLInputElement>(null)
  const [arrastando, setArrastando] = useState(false)

  const aoSoltar = (evento: DragEvent<HTMLDivElement>) => {
    evento.preventDefault()
    setArrastando(false)
    const arquivos = Array.from(evento.dataTransfer.files)
    if (arquivos.length) aoSelecionar(arquivos)
  }

  return (
    <div
      onDragOver={(evento) => {
        evento.preventDefault()
        setArrastando(true)
      }}
      onDragLeave={() => setArrastando(false)}
      onDrop={aoSoltar}
      className={clsx(
        'flex flex-col items-center rounded-2xl border-2 border-dashed px-6 py-8 text-center transition-colors',
        arrastando ? 'border-black bg-gray-100' : 'border-gray-300 bg-white'
      )}
    >
      <span className="flex size-12 items-center justify-center rounded-full bg-gray-100 text-xl">
        <LuUpload aria-hidden />
      </span>
      <p className="mt-3 font-semibold text-gray-900">
        Arraste arquivos para cá ou selecione do computador
      </p>
      <p className="mt-1 text-xs text-gray-500">
        PDF, DOCX, PPTX, PNG, JPG, WEBP, TXT ou MD · até 25 MB por arquivo
      </p>
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        <Botao
          variante="primario"
          icone={<LuUpload aria-hidden />}
          onClick={() => entrada.current?.click()}
          carregando={enviando}
        >
          Selecionar arquivos
        </Botao>
        <Botao icone={<LuClipboardPaste aria-hidden />} onClick={aoColarTexto}>
          Colar texto
        </Botao>
      </div>
      <input
        ref={entrada}
        type="file"
        multiple
        accept={EXTENSOES_ACEITAS}
        className="sr-only"
        tabIndex={-1}
        onChange={(evento) => {
          const arquivos = Array.from(evento.target.files ?? [])
          if (arquivos.length) aoSelecionar(arquivos)
          evento.target.value = ''
        }}
      />
    </div>
  )
}
