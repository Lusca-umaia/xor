import { useQuery } from '@tanstack/react-query'
import { obterProgressoXp } from '@/services/ambienteEstudo/progresso'
import { chavesAmbiente, repetirConsulta } from './chavesConsulta'

export function useProgressoXp(ambienteId: string) {
  return useQuery({
    queryKey: chavesAmbiente.progresso(ambienteId),
    queryFn: () => obterProgressoXp(ambienteId),
    retry: repetirConsulta
  })
}
