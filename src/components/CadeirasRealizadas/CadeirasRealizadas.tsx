'use client'

import { useRegisterContext } from '@/context/RegisterContext'
import DisciplinaBox from '../DisciplinaBox/DisciplinaBox'

const CadeirasRealizadas = () => {
  const {
    handleChangeCadeiraRealizada,
    CADEIRAS_REALIZADAS,
    handleChangeNotaCadeiraRealizada,
    optativas,
    obrigatorias
  } = useRegisterContext()

  return (
    <fieldset>
      {(Object.entries(obrigatorias).length > 0 || optativas.length > 0) && (
        <p className="text-sm font-semibold leading-6 text-gray-900">
          Selecione as cadeiras do semestre atual:
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
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </fieldset>
  )
}

export default CadeirasRealizadas
