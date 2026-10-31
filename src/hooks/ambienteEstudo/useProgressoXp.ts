import { useQuery } from '@tanstack/react-query'
import {
  listarDiasDeEstudo,
  obterProgressoXp
} from '@/services/ambienteEstudo/progresso'
import { chavesAmbiente, repetirConsulta } from './chavesConsulta'

export function useProgressoXp(ambienteId: string) {
  return useQuery({
    queryKey: chavesAmbiente.progresso(ambienteId),
    queryFn: () => obterProgressoXp(ambienteId),
    retry: repetirConsulta
  })
}

/** Dias com estudo em qualquer ambiente (sequência da tela inicial). */
export function useDiasDeEstudo() {
  return useQuery({
    queryKey: chavesAmbiente.diasDeEstudo(),
    queryFn: listarDiasDeEstudo,
    retry: repetirConsulta
  })
}
