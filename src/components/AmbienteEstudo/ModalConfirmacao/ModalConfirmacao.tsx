'use client'

import { ReactNode } from 'react'
import Botao from '../Botao/Botao'
import Modal from '../Modal/Modal'

interface ModalConfirmacaoProps {
  aberto: boolean
  aoFechar: () => void
  aoConfirmar: () => void
  titulo: string
  mensagem: ReactNode
  textoConfirmar?: string
  perigoso?: boolean
  carregando?: boolean
}

export default function ModalConfirmacao({
  aberto,
  aoFechar,
  aoConfirmar,
  titulo,
  mensagem,
  textoConfirmar = 'Confirmar',
  perigoso = false,
  carregando = false
}: ModalConfirmacaoProps) {
  return (
    <Modal
      aberto={aberto}
      aoFechar={aoFechar}
      titulo={titulo}
      largura="sm"
      rodape={
        <>
          <Botao onClick={aoFechar}>Cancelar</Botao>
          <Botao
            variante={perigoso ? 'perigo' : 'primario'}
            onClick={aoConfirmar}
            carregando={carregando}
          >
            {textoConfirmar}
          </Botao>
        </>
      }
    >
      <div className="text-sm text-gray-700">{mensagem}</div>
    </Modal>
  )
}
