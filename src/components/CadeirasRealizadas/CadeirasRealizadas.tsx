'use client'

import { useMemo, useState } from 'react'

import { CadeiraHistorico } from '@/@types/Historico'
import { useRegisterContext } from '@/context/RegisterContext'
import { LuPencilLine } from 'react-icons/lu'
import DisciplinaBox from '../DisciplinaBox/DisciplinaBox'

function numeroDoPeriodo(periodo: string | null): number {
  const correspondencia = periodo?.match(/^(\d{4})\.([12])$/)

  if (!correspondencia) return 0

  return Number(correspondencia[1]) * 10 + Number(correspondencia[2])
}

function agruparPorPeriodo(cadeiras: CadeiraHistorico[]) {
  const grupos = new Map<string, CadeiraHistorico[]>()

  for (const cadeira of cadeiras) {
    const periodo = cadeira.periodo ?? 'Sem período'

    grupos.set(periodo, [...(grupos.get(periodo) ?? []), cadeira])
  }

  return [...grupos.entries()].sort(
    ([periodoA], [periodoB]) =>
      numeroDoPeriodo(periodoA) - numeroDoPeriodo(periodoB)
  )
}

const CadeirasRealizadas = () => {
  const {
    handleChangeCadeiraRealizada,
    CADEIRAS_REALIZADAS,
    handleChangeNotaCadeiraRealizada,
    optativas,
    obrigatorias,
    historico,
    cadeirasHistorico,
    cadeirasPendentes
  } = useRegisterContext()

  const [editandoNotas, setEditandoNotas] = useState(false)

  const { periodos, emAndamento, totalConcluidas, totalReprovadas } =
    useMemo(() => {
      const emAndamento = cadeirasHistorico.filter(
        ({ status }) => status === 'ANDAMENTO'
      )

      const demais = cadeirasHistorico.filter(
        ({ status }) => status !== 'ANDAMENTO'
      )

      return {
        periodos: agruparPorPeriodo(demais),
        emAndamento,
        totalConcluidas: cadeirasHistorico.filter(
          ({ status }) => status === 'CONCLUIDA'
        ).length,
        totalReprovadas: cadeirasHistorico.filter(
          ({ status }) => status === 'REPROVADA'
        ).length
      }
    }, [cadeirasHistorico])

  if (!historico) {
    return (
      <fieldset>
        {(Object.entries(obrigatorias).length > 0 || optativas.length > 0) && (
          <p className="text-sm font-semibold leading-6 text-gray-900">
            Selecione as cadeiras que você já cursou:
          </p>
        )}
        <div className="space-y-4 flex flex-col mt-1">
          {Object.entries(obrigatorias).map(([semestre, cadeiras]) => {
            return (
              <div key={semestre} className="space-y-4">
                <span className="text-xl flex items-center gap-2">
                  <div className="flex gap-4 items-center">
                    <h3 className="font-bold leading-none  text-sm tracking-tight">
                      {semestre}º Semestre
                    </h3>
                  </div>
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {cadeiras!.map((cadeira) => (
                    <DisciplinaBox
                      key={cadeira.codigo}
                      nota={CADEIRAS_REALIZADAS[cadeira.id]?.nota}
                      handleChangeNota={(value) => {
                        handleChangeNotaCadeiraRealizada(
                          cadeira.id,
                          parseFloat(value)
                        )
                      }}
                      onClick={() => handleChangeCadeiraRealizada(cadeira.id)}
                      carater={cadeira.carater}
                      status={
                        CADEIRAS_REALIZADAS[cadeira.id.toString()]
                          ? 'CONCLUIDA'
                          : 'PENDENTE'
                      }
                      cargaHoraria={cadeira.cargaHoraria}
                      codigo={cadeira.codigo}
                      nome={cadeira.nome}
                      periodo={`${cadeira.semestre}º semestre`}
                      editavel={editandoNotas}
                    />
                  ))}
                </div>
              </div>
            )
          })}
          {optativas && optativas.length > 0 && (
            <div className="space-y-4 flex flex-col mt-1">
              <div className="space-y-4 ">
                <span className="text-xl flex items-center gap-2">
                  <div className="flex gap-4 items-center">
                    <h3 className="font-bold leading-none  text-sm tracking-tight">
                      Optativas
                    </h3>
                  </div>
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {optativas.map((cadeira) => (
                    <DisciplinaBox
                      key={cadeira.codigo}
                      handleChangeNota={(value) =>
                        handleChangeNotaCadeiraRealizada(
                          cadeira.id,
                          parseFloat(value)
                        )
                      }
                      nota={CADEIRAS_REALIZADAS[cadeira.id]?.nota}
                      onClick={() => handleChangeCadeiraRealizada(cadeira.id)}
                      carater={cadeira.carater}
                      status={
                        CADEIRAS_REALIZADAS[cadeira.id.toString()]
                          ? 'CONCLUIDA'
                          : 'PENDENTE'
                      }
                      cargaHoraria={cadeira.cargaHoraria}
                      codigo={cadeira.codigo}
                      nome={cadeira.nome}
                      editavel={editandoNotas}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={() => setEditandoNotas((prev) => !prev)}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-md bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
          >
            <LuPencilLine className="text-sm" />
            {editandoNotas ? 'Concluir edição' : 'Editar notas'}
          </button>
        </div>
      </fieldset>
    )
  }

  return (
    <fieldset className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="text-sm font-semibold leading-6 text-gray-900">
            Cadeiras identificadas no histórico
          </p>
          <p className="text-xs font-medium text-gray-500">
            {totalConcluidas} concluída(s) · {emAndamento.length} em andamento ·{' '}
            {totalReprovadas} reprovada(s)
          </p>
        </div>
        <button
          type="button"
          onClick={() => setEditandoNotas((prev) => !prev)}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-md bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
        >
          <LuPencilLine className="text-sm" />
          {editandoNotas ? 'Concluir edição' : 'Editar notas'}
        </button>
      </div>

      {periodos.map(([periodo, cadeiras]) => (
        <div key={periodo} className="space-y-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold leading-none tracking-tight">
              {periodo}
            </h3>
            <span className="rounded-md px-2 py-0.5 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-200">
              {cadeiras.length} disciplina(s)
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {cadeiras.map((cadeira) => (
              <DisciplinaBox
                key={`${cadeira.codigo}-${cadeira.periodo}`}
                nome={cadeira.nome}
                codigo={cadeira.codigo}
                cargaHoraria={cadeira.cargaHoraria}
                carater={cadeira.carater}
                status={cadeira.status}
                nota={cadeira.nota}
                frequencia={cadeira.frequencia}
                periodo={cadeira.periodo}
                situacao={cadeira.situacao}
                docente={cadeira.docente}
                tipoComponente={cadeira.tipoComponente}
                editavel={editandoNotas}
                handleChangeNota={(value) =>
                  handleChangeNotaCadeiraRealizada(
                    cadeira.id,
                    parseFloat(value)
                  )
                }
              />
            ))}
          </div>
        </div>
      ))}

      {emAndamento.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold leading-none tracking-tight">
              Semestre atual
            </h3>
            <span className="rounded-md bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
              {emAndamento[0].periodo}
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {emAndamento.map((cadeira) => (
              <DisciplinaBox
                key={`${cadeira.codigo}-${cadeira.periodo}`}
                nome={cadeira.nome}
                codigo={cadeira.codigo}
                cargaHoraria={cadeira.cargaHoraria}
                carater={cadeira.carater}
                status={cadeira.status}
                nota={cadeira.nota}
                frequencia={cadeira.frequencia}
                periodo={cadeira.periodo}
                situacao={cadeira.situacao}
                docente={cadeira.docente}
                tipoComponente={cadeira.tipoComponente}
              />
            ))}
          </div>
        </div>
      )}

      {cadeirasPendentes.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold leading-none tracking-tight">
              Pendências curriculares
            </h3>
            <span className="rounded-md bg-gray-50 px-2 py-0.5 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
              {cadeirasPendentes.length}
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {cadeirasPendentes.map((cadeira) => (
              <DisciplinaBox
                key={cadeira.codigo}
                nome={cadeira.nome}
                codigo={cadeira.codigo}
                cargaHoraria={cadeira.cargaHoraria}
                carater={cadeira.carater}
                status={cadeira.status}
                nota={cadeira.nota}
                periodo={cadeira.periodo}
                situacao={cadeira.situacao}
              />
            ))}
          </div>
        </div>
      )}
    </fieldset>
  )
}

export default CadeirasRealizadas
