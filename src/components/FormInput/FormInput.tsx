'use client'

import { ChangeEvent, InputHTMLAttributes } from 'react'
import { IMaskInput } from 'react-imask'

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  name: string
  type: InputHTMLAttributes<HTMLInputElement>['type']
  required?: boolean
  mask?: string
  value: string
  disabled?: boolean
  handleChange: (value: string) => void
  className?: string
  error?: string
}

const FormInput: React.FC<FormInputProps> = ({
  name,
  type,
  className,
  disabled,
  error,
  handleChange,
  label,
  mask,
  value,
  required = false,
  ...props
}) => {
  return (
    <div className={className}>
      <div className="flex gap-1 items-center">
        {label && (
          <label
            htmlFor={name}
            className="text-sm font-semibold leading-6 text-gray-900"
          >
            {label}
          </label>
        )}
      </div>
      <div className="mt-1">
        {mask ? (
          <IMaskInput
            id={name}
            onAccept={(value: string) => handleChange(value)}
            className="block w-full rounded-md outline-indigo-700 border-0 p-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 font-medium text-sm"
            mask={mask}
            value={value}
            lazy={false}
            required={required}
            type={type}
            {...props}
          />
        ) : (
          <input
            type={type}
            value={value}
            {...props}
            onChange={(e) => handleChange(e.target.value)}
            id={name}
            disabled={disabled}
            className="block w-full rounded-md outline-indigo-700 border-0 p-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 font-medium text-sm"
            required={required}
          />
        )}
      </div>
      {error && (
        <p className="text-sm font-medium mt-0.5 text-red-600">{error}</p>
      )}
    </div>
  )
}

export default FormInput
