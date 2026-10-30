import {
  Label,
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions
} from '@headlessui/react'

import { FaCheck } from 'react-icons/fa'
import { LuChevronsUpDown } from 'react-icons/lu'

interface Option<T extends string | number> {
  id: T
  nome: string
}

interface SelectProps<T extends string | number> {
  label?: string
  error?: string
  options: Option<T>[]
  value: T | null
  onChange: (value: Option<T>) => void
  disabled?: boolean
  className?: string
}

const Select = <T extends string | number>({
  label,
  options,
  value,
  onChange,
  error,
  disabled = false,
  className
}: SelectProps<T>) => {
  const data = options?.find(({ id }) => id === value)

  return (
    <div className={className}>
      <Listbox
        disabled={disabled}
        value={data ?? null}
        by="id"
        onChange={(option) => option && onChange(option)}
      >
        {label && (
          <Label className="text-sm font-semibold leading-6 text-gray-900">
            {label}
          </Label>
        )}
        <div className={label ? 'relative mt-1' : 'relative'}>
          <ListboxButton className="grid disabled:pointer-events-none disabled:bg-gray-50 w-full font-medium cursor-default grid-cols-1 rounded-md bg-white py-1.5 pl-3 pr-2 text-left text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 text-sm">
            <span className="col-start-1 row-start-1 truncate pr-6">
              &nbsp;
              {data && data.nome}
            </span>
            <LuChevronsUpDown
              aria-hidden="true"
              className="col-start-1 row-start-1 size-5 self-center justify-self-end text-gray-500 sm:size-4"
            />
          </ListboxButton>

          <ListboxOptions
            transition
            // Ancorado ao botão: não é cortado dentro de modais.
            anchor="bottom start"
            className="z-50 w-[var(--button-width)] [--anchor-gap:4px] max-h-60 overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none data-[closed]:data-[leave]:opacity-0 data-[leave]:transition data-[leave]:duration-100 data-[leave]:ease-in sm:text-sm"
          >
            {options.map((option) => (
              <ListboxOption
                key={option.id}
                value={option}
                className="group relative cursor-default select-none py-2 pl-8 pr-4 text-gray-900 data-[focus]:bg-indigo-600 data-[focus]:text-white data-[focus]:outline-none"
              >
                <span className="block truncate font-semibold group-data-[selected]:font-semibold">
                  {option.nome}
                </span>

                <span className="absolute inset-y-0 left-0 flex items-center pl-1.5 text-indigo-600 group-[&:not([data-selected])]:hidden group-data-[focus]:text-white">
                  <FaCheck className="size-4" />
                </span>
              </ListboxOption>
            ))}
          </ListboxOptions>
        </div>
      </Listbox>
      {error && (
        <p className="text-sm font-medium mt-0.5 text-red-600">{error}</p>
      )}
    </div>
  )
}

export default Select
