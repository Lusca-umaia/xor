'use client'

import { useRegisterContext } from '@/context/RegisterContext'
import DisciplinaBox from '../DisciplinaBox/DisciplinaBox'
import FormNovaDisciplina, {
  DadosFormDisciplina
} from '../FormNovaDisciplina/FormNovaDisciplina'

// Disciplinas manuais que podem entrar no semestre atual.
const AtivasManuais = ({ titulo }: { titulo: string }) => {
  const {
    formData,
    adicionarDisciplinaManual,
    alternarAndamento,
    codigosAprovadosManual
  } = useRegisterContext()

  const candidatas = formData.disciplinasManuais.filter(
    ({ codigo }) => !codigosAprovadosManual.has(codigo)
  )

  // Código já cadastrado: só marca como em andamento.
  const adicionar = (disciplina: DadosFormDisciplina) => {
    const codigo = disciplina.codigo.trim().toUpperCase()
    const existente = formData.disciplinasManuais.find(
      (d) => d.codigo === codigo
    )

    if (!existente) return adicionarDisciplinaManual(disciplina, true)
    if (codigosAprovadosManual.has(codigo)) {
      return 'Essa disciplina já foi aprovada'
    }
    if (!existente.emAndamento) alternarAndamento(codigo)
    return null
  }

  return (
    <fieldset className="space-y-4">
      <div>
        <p className="text-sm font-semibold leading-6 text-gray-900">
          {titulo}
        </p>
        <p className="text-xs font-medium text-gray-500">
          Clique nas pendentes para marcar como em andamento, ou adicione uma
          disciplina nova.
        </p>
      </div>

      <FormNovaDisciplina
        statusPermitidos={['ANDAMENTO']}
        catalogo={formData.disciplinasManuais}
        onAdicionar={adicionar}
      />

      {candidatas.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {candidatas.map((disciplina) => (
            <DisciplinaBox
              key={disciplina.codigo}
              nome={disciplina.nome}
              codigo={disciplina.codigo}
              cargaHoraria={disciplina.cargaHoraria}
              carater={disciplina.carater}
              status={disciplina.emAndamento ? 'ANDAMENTO' : 'PENDENTE'}
              onClick={() => alternarAndamento(disciplina.codigo)}
            />
          ))}
        </div>
      )}
    </fieldset>
  )
}

export default function CadeirasAtivas() {
  const { historico, cadeirasHistorico, removerDisciplinaHistorico } =
    useRegisterContext()

  if (!historico) {
    return <AtivasManuais titulo="Disciplinas do semestre atual" />
  }

  const cadeirasEmAndamento = cadeirasHistorico.filter(
    ({ status }) => status === 'ANDAMENTO'
  )

  return (
    <div className="space-y-6">
      <fieldset className="space-y-4">
        <div>
          <p className="text-sm font-semibold leading-6 text-gray-900">
            Disciplinas em andamento identificadas no histórico
          </p>
          <p className="text-xs font-medium text-gray-500">
            Elas foram adicionadas automaticamente ao semestre atual.
          </p>
        </div>

        {cadeirasEmAndamento.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {cadeirasEmAndamento.map((cadeira) => (
              <DisciplinaBox
                key={`${cadeira.codigo}-${cadeira.periodo}`}
                onRemover={() => removerDisciplinaHistorico(cadeira)}
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
        ) : (
          <p className="rounded-xl bg-gray-50 px-3 py-2 text-xs font-medium text-gray-500 ring-1 ring-inset ring-gray-200">
            Nenhuma disciplina em andamento foi encontrada no histórico.
          </p>
        )}
      </fieldset>

      <div className="border-t border-black/10 pt-5">
        <AtivasManuais titulo="Outras disciplinas deste semestre" />
      </div>
    </div>
  )
}
