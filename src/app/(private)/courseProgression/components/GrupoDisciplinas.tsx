import { ReactNode } from 'react'
import { DisciplinaProgresso } from '@/@types/Progresso'
import DisciplinaBox from '@/components/DisciplinaBox/DisciplinaBox'
import IconeTile from '@/components/IconeTile/IconeTile'
import { SkeletonCard } from '@/components/Skeleton/Skeleton'

function resumoTentativas({ reprovacoes, trancamentos }: DisciplinaProgresso) {
  const partes = [
    reprovacoes > 0 && `Reprovada ${reprovacoes}x`,
    trancamentos > 0 && `Trancada ${trancamentos}x`
  ].filter(Boolean)
  return partes.length ? partes.join(' · ') : null
}

const formatarMedia = (media: number) => media.toFixed(1).replace('.', ',')

function mediaDasNotas(disciplinas: DisciplinaProgresso[]) {
  const notas = disciplinas.flatMap(({ nota }) => (nota === null ? [] : nota))
  if (notas.length === 0) return null
  return notas.reduce((acc, nota) => acc + nota, 0) / notas.length
}

const Etiqueta = ({ children }: { children: ReactNode }) => (
  <span className="inline-flex items-center rounded-full bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-200">
    {children}
  </span>
)

interface GrupoDisciplinasProps {
  titulo: string
  icon: ReactNode
  disciplinas: DisciplinaProgresso[]
  onSelect: (disciplina: DisciplinaProgresso) => void
  // Mostra a média das notas do grupo (períodos concluídos).
  exibirMedia?: boolean
}

const GrupoDisciplinas: React.FC<GrupoDisciplinasProps> = ({
  titulo,
  icon,
  disciplinas,
  onSelect,
  exibirMedia = false
}) => {
  const carga = disciplinas.reduce((acc, d) => acc + d.cargaHoraria, 0)
  const media = exibirMedia ? mediaDasNotas(disciplinas) : null

  return (
    <section className="space-y-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-lg max-md:p-4">
      <header className="flex flex-wrap items-center gap-3">
        <IconeTile>{icon}</IconeTile>
        <h3 className="text-lg font-bold tracking-tight max-md:text-base">
          {titulo}
        </h3>
        <div className="flex flex-wrap gap-2">
          <Etiqueta>
            {disciplinas.length}{' '}
            {disciplinas.length === 1 ? 'disciplina' : 'disciplinas'}
          </Etiqueta>
          <Etiqueta>{carga}h</Etiqueta>
          {media !== null && <Etiqueta>Média {formatarMedia(media)}</Etiqueta>}
        </div>
      </header>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {disciplinas.map((disciplina) => (
          <DisciplinaBox
            key={disciplina.id}
            nome={disciplina.nome}
            codigo={disciplina.codigo}
            cargaHoraria={disciplina.cargaHoraria}
            carater={disciplina.carater}
            status={disciplina.status}
            nota={disciplina.nota}
            periodo={disciplina.periodo}
            situacao={resumoTentativas(disciplina)}
            onClick={() => onSelect(disciplina)}
          />
        ))}
      </div>
    </section>
  )
}

export const GrupoDisciplinasSkeleton = () => (
  <div className="space-y-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-lg max-md:p-4">
    <div className="h-10 w-56 animate-pulse rounded-xl bg-gray-200" />
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {Array.from({ length: 4 }, (_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  </div>
)

export default GrupoDisciplinas
