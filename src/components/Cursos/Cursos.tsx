'use client'

import DisciplinaBox from '../DisciplinaBox/DisciplinaBox'

interface Disciplina {
  carater: 'Obrigatória' | 'Optativa'
  cargaHoraria: number
  codigo: string
  nome: string
}

const disciplinas: Disciplina[] = [
  {
    carater: 'Obrigatória',
    cargaHoraria: 64,
    codigo: 'CCK123',
    nome: 'SGBD'
  }
]

export default function Cursos() {
  return (
    <fieldset aria-label="Server size">
      <p className="text-sm font-semibold leading-6 text-gray-900">
        Selecione as cadeiras que já realizou:
      </p>
      <div className="space-y-4 mt-1">
        {disciplinas.map((disciplina) => (
          <DisciplinaBox
            key={disciplina.codigo}
            carater={disciplina.carater}
            cargaHoraria={disciplina.cargaHoraria}
            codigo={disciplina.codigo}
            nome={disciplina.nome}
          />
        ))}
      </div>
    </fieldset>
  )
}
