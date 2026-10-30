import clsx from 'clsx'
import { TextareaHTMLAttributes } from 'react'

interface CampoTextoProps
  extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange'> {
  name: string
  label?: string
  dica?: string
  error?: string
  value: string
  handleChange: (value: string) => void
}

// Textarea que cresce com o conteúdo, no mesmo visual do FormInput.
const CampoTexto: React.FC<CampoTextoProps> = ({
  name,
  label,
  dica,
  error,
  value,
  handleChange,
  className,
  rows = 2,
  ...props
}) => (
  <div className={className}>
    {label && (
      <label
        htmlFor={name}
        className="text-sm font-semibold leading-6 text-gray-900"
      >
        {label}
      </label>
    )}
    <textarea
      id={name}
      name={name}
      rows={rows}
      value={value}
      onChange={(e) => handleChange(e.target.value)}
      className={clsx(
        'block w-full resize-y field-sizing-content rounded-md border-0 p-2 text-sm font-medium text-gray-900 shadow-sm ring-1 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-xor-navy outline-none',
        label && 'mt-1',
        error ? 'ring-red-300' : 'ring-gray-300'
      )}
      {...props}
    />
    {dica && !error && <p className="mt-1 text-xs text-gray-500">{dica}</p>}
    {error && (
      <p className="text-sm font-medium mt-0.5 text-red-600">{error}</p>
    )}
  </div>
)

export default CampoTexto
