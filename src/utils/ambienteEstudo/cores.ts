import { CorAmbiente } from '@/@types/AmbienteEstudo'

// Classes escritas por extenso para o Tailwind encontrá-las no código-fonte.
export const CORES_AMBIENTE: Record<
  CorAmbiente,
  {
    rotulo: string
    solido: string
    suave: string
    texto: string
    borda: string
  }
> = {
  cinza: {
    rotulo: 'Cinza',
    solido: 'bg-gray-800',
    suave: 'bg-gray-100',
    texto: 'text-gray-800',
    borda: 'border-gray-300'
  },
  azul: {
    rotulo: 'Azul',
    solido: 'bg-blue-600',
    suave: 'bg-blue-50',
    texto: 'text-blue-700',
    borda: 'border-blue-200'
  },
  verde: {
    rotulo: 'Verde',
    solido: 'bg-emerald-600',
    suave: 'bg-emerald-50',
    texto: 'text-emerald-700',
    borda: 'border-emerald-200'
  },
  roxo: {
    rotulo: 'Roxo',
    solido: 'bg-violet-600',
    suave: 'bg-violet-50',
    texto: 'text-violet-700',
    borda: 'border-violet-200'
  },
  laranja: {
    rotulo: 'Laranja',
    solido: 'bg-orange-500',
    suave: 'bg-orange-50',
    texto: 'text-orange-700',
    borda: 'border-orange-200'
  },
  rosa: {
    rotulo: 'Rosa',
    solido: 'bg-pink-600',
    suave: 'bg-pink-50',
    texto: 'text-pink-700',
    borda: 'border-pink-200'
  },
  ciano: {
    rotulo: 'Ciano',
    solido: 'bg-cyan-600',
    suave: 'bg-cyan-50',
    texto: 'text-cyan-700',
    borda: 'border-cyan-200'
  },
  ambar: {
    rotulo: 'Âmbar',
    solido: 'bg-amber-500',
    suave: 'bg-amber-50',
    texto: 'text-amber-700',
    borda: 'border-amber-200'
  }
}

export const LISTA_CORES = Object.keys(CORES_AMBIENTE) as CorAmbiente[]
