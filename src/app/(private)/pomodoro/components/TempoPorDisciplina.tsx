import { LuBookOpen } from 'react-icons/lu'
import { formatarDuracao } from '../consts'
import type { ResumoFoco } from '../utils/estatisticas'

interface TempoPorDisciplinaProps {
  itens: ResumoFoco['porDisciplina']
  nomeDisciplina: (id: number | null) => string
}

const TempoPorDisciplina: React.FC<TempoPorDisciplinaProps> = ({
  itens,
  nomeDisciplina
}) => {
  const maior = itens[0]?.segundos ?? 1

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-lg p-6 max-md:p-4 space-y-4">
      <span className="flex items-center gap-2 text-base font-bold tracking-tight">
        <LuBookOpen className="text-xor-navy" />
        Foco por disciplina
        <span className="text-xs font-medium text-gray-400">7 dias</span>
      </span>

      {itens.length === 0 ? (
        <p className="text-sm text-gray-500">
          Conclua um pomodoro escolhendo uma disciplina para ver onde seu tempo
          está indo.
        </p>
      ) : (
        <ul className="space-y-3">
          {itens.slice(0, 6).map(({ disciplinaId, segundos }) => (
            <li key={disciplinaId ?? 'livre'} className="space-y-1">
              <div className="flex items-center justify-between gap-2 text-sm">
                <span className="truncate font-medium text-gray-700">
                  {nomeDisciplina(disciplinaId)}
                </span>
                <span className="shrink-0 font-semibold tabular-nums">
                  {formatarDuracao(segundos)}
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full bg-xor-navy"
                  style={{ width: `${(segundos / maior) * 100}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default TempoPorDisciplina
