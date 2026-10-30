'use client'

import { useState } from 'react'
import { LuPencilLine, LuPlus, LuTrash2 } from 'react-icons/lu'
import { SemestreManual } from '@/@types/aluno'
import { useRegisterContext } from '@/context/RegisterContext'
import DisciplinaBox from '../DisciplinaBox/DisciplinaBox'
import FormNovaDisciplina from '../FormNovaDisciplina/FormNovaDisciplina'

const STATUS_CARD = {
  APROVADA: 'CONCLUIDA',
  REPROVADA: 'REPROVADA',
  TRANCADA: 'TRANCADA'
} as const

interface SemestreBlocoProps {
  semestre: SemestreManual
  numero: number
  editandoNotas: boolean
}

const SemestreBloco: React.FC<SemestreBlocoProps> = ({
  semestre,
  numero,
  editandoNotas
}) => {
  const {
    formData,
    atualizarPeriodoSemestre,
    removerSemestreManual,
    adicionarCursada,
    atualizarNotaCursada,
    removerCursada
  } = useRegisterContext()
  const [adicionando, setAdicionando] = useState(semestre.cursadas.length === 0)

  const catalogo = new Map(
    formData.disciplinasManuais.map((d) => [d.codigo, d])
  )

  return (
    <div className="space-y-3 rounded-2xl p-4 ring-1 ring-inset ring-gray-200">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-bold leading-none tracking-tight">
            {numero}º semestre
          </h3>
          <input
            type="text"
            value={semestre.periodo}
            placeholder="Período (ex: 2024.1)"
            onChange={(e) =>
              atualizarPeriodoSemestre(semestre.id, e.target.value)
            }
            className="w-40 rounded-md border-0 px-2 py-1 text-xs font-medium text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600"
          />
          <span className="text-xs font-medium text-gray-500">
            {semestre.cursadas.length} disciplina(s)
          </span>
        </div>
        <div className="flex items-center gap-2">
          {!adicionando && (
            <button
              type="button"
              onClick={() => setAdicionando(true)}
              className="inline-flex cursor-pointer items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold text-indigo-600 hover:bg-indigo-50"
            >
              <LuPlus /> Adicionar disciplina
            </button>
          )}
          <button
            type="button"
            title="Remover semestre"
            onClick={() => removerSemestreManual(semestre.id)}
            className="cursor-pointer rounded-md p-1 text-gray-400 hover:bg-red-50 hover:text-red-600"
          >
            <LuTrash2 />
          </button>
        </div>
      </div>

      {semestre.cursadas.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {semestre.cursadas.map((cursada) => {
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
                editavel={editandoNotas}
                handleChangeNota={(value) =>
                  atualizarNotaCursada(
                    semestre.id,
                    cursada.codigo,
                    value === '' ? null : Number(value)
                  )
                }
                onRemover={() => removerCursada(semestre.id, cursada.codigo)}
              />
            )
          })}
        </div>
      )}

      {adicionando && (
        <FormNovaDisciplina
          statusPermitidos={['APROVADA', 'REPROVADA', 'TRANCADA']}
          catalogo={formData.disciplinasManuais}
          textoBotao="Adicionar ao semestre"
          onAdicionar={(disciplina, { status, nota }) =>
            status === 'APROVADA' ||
            status === 'REPROVADA' ||
            status === 'TRANCADA'
              ? adicionarCursada(semestre.id, disciplina, { status, nota })
              : 'Situação inválida'
          }
        />
      )}
    </div>
  )
}

interface CadastroManualProps {
  titulo?: string
  descricao?: string
}

// Montagem manual do histórico: semestres já cursados + pendentes.
const CadastroManual: React.FC<CadastroManualProps> = ({
  titulo = 'Semestres cursados',
  descricao = 'Crie um bloco para cada semestre que você já cursou e adicione as disciplinas com o resultado. As do semestre atual entram no próximo passo.'
}) => {
  const {
    formData,
    adicionarSemestreManual,
    adicionarDisciplinaManual,
    removerDisciplinaManual,
    codigosAprovadosManual
  } = useRegisterContext()
  const [editandoNotas, setEditandoNotas] = useState(false)

  const tentativasPorCodigo = new Map<string, string[]>()
  for (const { cursadas } of formData.semestresManuais) {
    for (const { codigo, status } of cursadas) {
      tentativasPorCodigo.set(codigo, [
        ...(tentativasPorCodigo.get(codigo) ?? []),
        status
      ])
    }
  }

  const pendentes = formData.disciplinasManuais.filter(
    ({ codigo, emAndamento }) =>
      !emAndamento && !codigosAprovadosManual.has(codigo)
  )

  const resumoTentativas = (codigo: string) => {
    const tentativas = tentativasPorCodigo.get(codigo) ?? []
    const reprovacoes = tentativas.filter((s) => s === 'REPROVADA').length
    const trancamentos = tentativas.filter((s) => s === 'TRANCADA').length
    const partes = [
      reprovacoes > 0 && `Reprovada ${reprovacoes}x`,
      trancamentos > 0 && `Trancada ${trancamentos}x`
    ].filter(Boolean)
    return partes.length ? partes.join(' · ') : null
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="text-sm font-semibold leading-6 text-gray-900">
              {titulo}
            </p>
            <p className="text-xs font-medium text-gray-500">{descricao}</p>
          </div>
          {formData.semestresManuais.some((s) => s.cursadas.length > 0) && (
            <button
              type="button"
              onClick={() => setEditandoNotas((prev) => !prev)}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-md bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
            >
              <LuPencilLine className="text-sm" />
              {editandoNotas ? 'Concluir edição' : 'Editar notas'}
            </button>
          )}
        </div>

        {formData.semestresManuais.map((semestre, indice) => (
          <SemestreBloco
            key={semestre.id}
            semestre={semestre}
            numero={indice + 1}
            editandoNotas={editandoNotas}
          />
        ))}

        <button
          type="button"
          onClick={adicionarSemestreManual}
          className="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-2xl border-2 border-dashed border-gray-300 px-4 py-3 text-sm font-semibold text-gray-600 hover:border-indigo-400 hover:text-indigo-600"
        >
          <LuPlus /> Adicionar semestre
        </button>
      </div>

      <div className="space-y-4 border-t border-black/10 pt-5">
        <div>
          <p className="text-sm font-semibold leading-6 text-gray-900">
            Disciplinas pendentes
          </p>
          <p className="text-xs font-medium text-gray-500">
            Disciplinas do curso que você ainda vai cursar. Reprovadas e
            trancadas sem aprovação aparecem aqui automaticamente.
          </p>
        </div>

        <FormNovaDisciplina
          statusPermitidos={['PENDENTE']}
          catalogo={formData.disciplinasManuais}
          textoBotao="Adicionar pendente"
          onAdicionar={(disciplina) => adicionarDisciplinaManual(disciplina)}
        />

        {pendentes.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pendentes.map((disciplina) => (
              <DisciplinaBox
                key={disciplina.codigo}
                nome={disciplina.nome}
                codigo={disciplina.codigo}
                cargaHoraria={disciplina.cargaHoraria}
                carater={disciplina.carater}
                status="PENDENTE"
                situacao={resumoTentativas(disciplina.codigo)}
                onRemover={() => removerDisciplinaManual(disciplina.codigo)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default CadastroManual
