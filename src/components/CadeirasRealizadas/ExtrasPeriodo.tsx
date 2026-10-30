'use client'

import { useState } from 'react'
import { LuPlus } from 'react-icons/lu'
import { useRegisterContext } from '@/context/RegisterContext'
import DisciplinaBox from '../DisciplinaBox/DisciplinaBox'
import FormNovaDisciplina from '../FormNovaDisciplina/FormNovaDisciplina'

const STATUS_CARD = {
  APROVADA: 'CONCLUIDA',
  REPROVADA: 'REPROVADA',
  TRANCADA: 'TRANCADA'
} as const

// Disciplinas adicionadas à mão em um período que veio do histórico.
const ExtrasPeriodo = ({ periodo }: { periodo: string }) => {
  const {
    cursadasExtrasHistorico,
    adicionarCursadaHistorico,
    removerCursadaHistorico,
    catalogoDisciplinas
  } = useRegisterContext()
  const [adicionando, setAdicionando] = useState(false)

  const catalogo = new Map(catalogoDisciplinas.map((d) => [d.codigo, d]))
  const extras = cursadasExtrasHistorico[periodo] ?? []

  return (
    <div className="space-y-3">
      {extras.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {extras.map((cursada) => {
            const disciplina = catalogo.get(cursada.codigo)
            if (!disciplina) return null

            return (
              <DisciplinaBox
                key={cursada.codigo}
                nome={disciplina.nome}
                codigo={disciplina.codigo}
                cargaHoraria={disciplina.cargaHoraria}
                carater={disciplina.carater}
                status={STATUS_CARD[cursada.status]}
                nota={cursada.nota}
                periodo={periodo}
                tipoComponente="Adicionada por você"
                onRemover={() =>
                  removerCursadaHistorico(periodo, cursada.codigo)
                }
              />
            )
          })}
        </div>
      )}

      {adicionando ? (
        <div className="space-y-2">
          <FormNovaDisciplina
            statusPermitidos={['APROVADA', 'REPROVADA', 'TRANCADA']}
            catalogo={catalogoDisciplinas}
            textoBotao={`Adicionar em ${periodo}`}
            onAdicionar={(disciplina, { status, nota }) => {
              if (
                status !== 'APROVADA' &&
                status !== 'REPROVADA' &&
                status !== 'TRANCADA'
              ) {
                return 'Situação inválida'
              }
              const erro = adicionarCursadaHistorico(periodo, disciplina, {
                status,
                nota
              })
              if (!erro) setAdicionando(false)
              return erro
            }}
          />
          <button
            type="button"
            onClick={() => setAdicionando(false)}
            className="cursor-pointer text-xs font-semibold text-gray-500 hover:text-gray-700"
          >
            Cancelar
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setAdicionando(true)}
          className="inline-flex cursor-pointer items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold text-xor-navy hover:bg-xor-navy/5"
        >
          <LuPlus /> Adicionar disciplina em {periodo}
        </button>
      )}
    </div>
  )
}

export default ExtrasPeriodo
