'use client'

import { Questao, Resposta } from '@/@types/AmbienteEstudo'
import { respostaPreenchida } from '@/utils/ambienteEstudo/corrigirQuestao'
import Botao from '../Botao/Botao'
import Modal from '../Modal/Modal'

interface ModalEntregarProps {
  aberto: boolean
  aoFechar: () => void
  aoConfirmar: () => void
  aoIr: (indice: number) => void
  entregando?: boolean
  questoes: Questao[]
  respostas: Record<string, Resposta>
  marcadas: string[]
}

function ListaNumeros({
  titulo,
  indices,
  aoIr
}: {
  titulo: string
  indices: number[]
  aoIr: (indice: number) => void
}) {
  if (indices.length === 0) return null
  return (
    <div>
      <p className="text-sm font-semibold">{titulo}</p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {indices.map((indice) => (
          <button
            key={indice}
            type="button"
            onClick={() => aoIr(indice)}
            className="size-8 rounded-md bg-gray-100 text-sm font-bold hover:bg-gray-200 cursor-pointer"
            aria-label={`Ir para a questão ${indice + 1}`}
          >
            {indice + 1}
          </button>
        ))}
      </div>
    </div>
  )
}

export default function ModalEntregar({
  aberto,
  aoFechar,
  aoConfirmar,
  aoIr,
  entregando,
  questoes,
  respostas,
  marcadas
}: ModalEntregarProps) {
  const emBranco = questoes.flatMap((questao, indice) =>
    respostaPreenchida(questao, respostas[questao.id]) ? [] : [indice]
  )
  const paraRevisar = questoes.flatMap((questao, indice) =>
    marcadas.includes(questao.id) ? [indice] : []
  )

  return (
    <Modal
      aberto={aberto}
      aoFechar={aoFechar}
      titulo="Entregar simulado?"
      descricao="Depois de entregar, as respostas não podem ser alteradas."
      largura="sm"
      rodape={
        <>
          <Botao onClick={aoFechar}>Continuar respondendo</Botao>
          <Botao
            variante="primario"
            onClick={aoConfirmar}
            carregando={entregando}
          >
            Entregar agora
          </Botao>
        </>
      }
    >
      <div className="space-y-4">
        {emBranco.length === 0 && paraRevisar.length === 0 ? (
          <p className="text-sm text-gray-700">
            Todas as {questoes.length} questões estão respondidas. Boa sorte!
          </p>
        ) : (
          <>
            <ListaNumeros
              titulo={`${emBranco.length} questão(ões) em branco`}
              indices={emBranco}
              aoIr={aoIr}
            />
            <ListaNumeros
              titulo={`${paraRevisar.length} marcada(s) para revisão`}
              indices={paraRevisar}
              aoIr={aoIr}
            />
          </>
        )}
      </div>
    </Modal>
  )
}
