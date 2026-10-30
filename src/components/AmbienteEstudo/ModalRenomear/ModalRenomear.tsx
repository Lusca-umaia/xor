'use client'

import { useEffect, useState } from 'react'
import Botao from '../Botao/Botao'
import { classeCampo, classeRotulo } from '../estilos'
import Modal from '../Modal/Modal'

interface ModalRenomearProps {
  aberto: boolean
  aoFechar: () => void
  aoSalvar: (nome: string) => void
  titulo: string
  valorInicial: string
  salvando?: boolean
}

export default function ModalRenomear({
  aberto,
  aoFechar,
  aoSalvar,
  titulo,
  valorInicial,
  salvando
}: ModalRenomearProps) {
  const [valor, setValor] = useState(valorInicial)

  useEffect(() => {
    if (aberto) setValor(valorInicial)
  }, [aberto, valorInicial])

  const salvar = () => valor.trim() && aoSalvar(valor.trim())

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
            variante="primario"
            disabled={!valor.trim()}
            carregando={salvando}
            onClick={salvar}
          >
            Salvar
          </Botao>
        </>
      }
    >
      <form
        onSubmit={(evento) => {
          evento.preventDefault()
          salvar()
        }}
      >
        <label className={classeRotulo}>
          Nome
          <input
            value={valor}
            onChange={(evento) => setValor(evento.target.value)}
            className={classeCampo}
            autoFocus
          />
        </label>
      </form>
    </Modal>
  )
}
