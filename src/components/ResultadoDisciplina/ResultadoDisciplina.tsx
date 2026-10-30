import clsx from 'clsx'

export interface Resultado {
  status: 'APROVADA' | 'REPROVADA' | 'TRANCADA'
  nota: string
}

const OPCOES: { status: Resultado['status']; label: string }[] = [
  { status: 'APROVADA', label: 'Aprovado' },
  { status: 'REPROVADA', label: 'Reprovado' },
  { status: 'TRANCADA', label: 'Trancado' }
]

export function resultadoValido({ status, nota }: Resultado) {
  if (status === 'TRANCADA') return true
  const valor = parseFloat(nota)
  return valor >= 0 && valor <= 10
}

interface ResultadoDisciplinaProps {
  value: Resultado
  onChange: (value: Resultado) => void
}

// Escolha de situação final + nota de uma disciplina.
const ResultadoDisciplina: React.FC<ResultadoDisciplinaProps> = ({
  value,
  onChange
}) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="inline-flex rounded-md shadow-xs ring-1 ring-inset ring-gray-300">
        {OPCOES.map(({ status, label }) => (
          <button
            key={status}
            type="button"
            onClick={() => onChange({ ...value, status })}
            className={clsx(
              'cursor-pointer px-3 py-1.5 text-xs font-semibold first:rounded-l-md last:rounded-r-md',
              value.status === status
                ? 'bg-black text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            )}
          >
            {label}
          </button>
        ))}
      </div>
      {value.status !== 'TRANCADA' && (
        <label className="flex items-center gap-2 text-sm font-semibold text-gray-600">
          Nota
          <input
            type="number"
            placeholder="7,0"
            value={value.nota}
            min={0}
            step=".1"
            max={10}
            onChange={(e) => onChange({ ...value, nota: e.target.value })}
            className="block w-16 rounded-md outline-indigo-700 border-0 p-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 font-medium text-sm"
          />
        </label>
      )}
    </div>
  )
}

export default ResultadoDisciplina
