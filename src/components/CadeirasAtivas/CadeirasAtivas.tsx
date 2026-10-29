'use client'

import { useRegisterContext } from '@/context/RegisterContext'
import DisciplinaBox from '../DisciplinaBox/DisciplinaBox'

export default function CadeirasAtivas() {
  const {
    handleChangeCadeiraAtiva,
    obrigatoriasInativas,
    CADEIRAS_ATIVAS,
    optativasInativas
  } = useRegisterContext()

  return (
    <fieldset>
      <p className="text-sm font-semibold leading-6 text-gray-900">
        Selecione as cadeiras do semestre atual:
      </p>
      <div className="space-y-4 flex flex-col mt-1">
        {Object.entries(obrigatoriasInativas).map(([semestre, cadeiras]) => {
          return (
            <div key={semestre} className="space-y-4 ">
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
                    handleChangeNota={() => {
                      handleChangeCadeiraAtiva(cadeira.id)
                    }}
                    onClick={() => handleChangeCadeiraAtiva(cadeira.id)}
                    carater={cadeira.carater}
                    status={
                      CADEIRAS_ATIVAS[cadeira.id.toString()]
                        ? 'ANDAMENTO'
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
              {optativasInativas.map((cadeira) => (
                <DisciplinaBox
                  key={cadeira.codigo}
                  handleChangeNota={(value) =>
                    handleChangeCadeiraAtiva(cadeira.id)
                  }
                  onClick={() => handleChangeCadeiraAtiva(cadeira.id)}
                  carater={cadeira.carater}
                  status={
                    CADEIRAS_ATIVAS[cadeira.id.toString()]
                      ? 'ANDAMENTO'
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
      </div>
    </fieldset>
  )
}
