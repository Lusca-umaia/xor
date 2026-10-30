'use client'

import clsx from 'clsx'
import { useState } from 'react'
import { LuFlag } from 'react-icons/lu'
import { AlvoReporte, MotivoReporte } from '@/@types/AmbienteEstudo'
import { useMutacaoAmbiente } from '@/hooks/ambienteEstudo/useMutacaoAmbiente'
import { reportarConteudo } from '@/services/ambienteEstudo/reportes'
import { ROTULO_MOTIVO_REPORTE } from '@/utils/ambienteEstudo/rotulos'
import Botao from '../Botao/Botao'
import { classeCampo, classeRotulo } from '../estilos'
import Modal from '../Modal/Modal'

interface BotaoReportarProps {
  alvo: { tipo: AlvoReporte; id: string }
  texto?: string
  className?: string
}

/** Permite reportar qualquer conteúdo gerado por IA. */
export default function BotaoReportar({
  alvo,
  texto = 'Reportar',
  className
}: BotaoReportarProps) {
  const [aberto, setAberto] = useState(false)
  const [motivo, setMotivo] = useState<MotivoReporte>('INCORRETO')
  const [comentario, setComentario] = useState('')

  const reportar = useMutacaoAmbiente(reportarConteudo, {
    invalidar: false,
    mensagemSucesso: 'Obrigado! Seu reporte ajuda a melhorar a IA.'
  })

  const fechar = () => {
    setAberto(false)
    setComentario('')
    setMotivo('INCORRETO')
  }

  const enviar = () =>
    reportar.mutate({ alvo, motivo, comentario }, { onSuccess: fechar })

  return (
    <>
      <button
        type="button"
        onClick={() => setAberto(true)}
        aria-label={texto || 'Reportar conteúdo'}
        title="Reportar conteúdo gerado por IA"
        className={clsx(
          'inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-xs font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-900 cursor-pointer',
          className
        )}
      >
        <LuFlag aria-hidden />
        {texto}
      </button>
      <Modal
        aberto={aberto}
        aoFechar={fechar}
        titulo="Reportar conteúdo gerado por IA"
        descricao="O reporte vai para revisão e não afeta sua nota."
        largura="sm"
        rodape={
          <>
            <Botao onClick={fechar}>Cancelar</Botao>
            <Botao
              variante="primario"
              onClick={enviar}
              carregando={reportar.isPending}
            >
              Enviar reporte
            </Botao>
          </>
        }
      >
        <fieldset className="space-y-2">
          <legend className={classeRotulo}>Qual é o problema?</legend>
          {(Object.keys(ROTULO_MOTIVO_REPORTE) as MotivoReporte[]).map(
            (opcao) => (
              <label
                key={opcao}
                className="flex items-center gap-2 text-sm cursor-pointer"
              >
                <input
                  type="radio"
                  name="motivo-reporte"
                  value={opcao}
                  checked={motivo === opcao}
                  onChange={() => setMotivo(opcao)}
                  className="size-4 accent-black"
                />
                {ROTULO_MOTIVO_REPORTE[opcao]}
              </label>
            )
          )}
        </fieldset>
        <label className={clsx(classeRotulo, 'mt-4')}>
          Comentário (opcional)
          <textarea
            value={comentario}
            onChange={(evento) => setComentario(evento.target.value)}
            rows={3}
            className={classeCampo}
            placeholder="Ex.: a resposta correta segundo o slide 12 é outra."
          />
        </label>
      </Modal>
    </>
  )
}
