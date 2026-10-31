import {
  AtualizacaoTentativaSimulado,
  ConfigSimulado,
  Simulado,
  SimuladoListagem,
  TentativaSimulado
} from '@/@types/AmbienteEstudo'
import api from '../api'
import { dados } from './erros'
import { registrarEventoEstudo } from './eventos'

export const listarSimulados = (ambienteId: string) =>
  dados(api.get<SimuladoListagem[]>(`/ambientes/${ambienteId}/simulados`))

export const obterSimulado = (id: string) =>
  dados(api.get<Simulado>(`/simulados/${id}`))

export const gerarSimulado = (
  ambienteId: string,
  novo: { titulo?: string; config: ConfigSimulado }
) => dados(api.post<Simulado>(`/ambientes/${ambienteId}/simulados`, novo))

export const excluirSimulado = async (id: string) => {
  await dados(api.delete(`/simulados/${id}`))
}

/** Inicia uma tentativa ou devolve a que está em andamento. O servidor define o prazo. */
export const iniciarTentativa = (simuladoId: string) =>
  dados(api.post<TentativaSimulado>(`/simulados/${simuladoId}/tentativas`))

/** Ao abrir uma tentativa com prazo vencido, o servidor a entrega automaticamente. */
export const obterTentativa = (id: string) =>
  dados(api.get<TentativaSimulado>(`/tentativas-simulado/${id}`))

/** Lança ErroPrazoEsgotado depois da entrega ou do fim do tempo. */
export const salvarRespostas = (
  id: string,
  parcial: AtualizacaoTentativaSimulado
) => dados(api.patch<TentativaSimulado>(`/tentativas-simulado/${id}`, parcial))

export async function entregarTentativa(id: string, automatica: boolean) {
  const tentativa = await dados(
    api.post<TentativaSimulado>(`/tentativas-simulado/${id}/entrega`, {
      automatica
    })
  )
  registrarEventoEstudo('SIMULADO_ENTREGUE', {
    simuladoId: tentativa.simuladoId,
    automatica,
    notaParcial: tentativa.resultado?.notaFinal
  })
  return tentativa
}
