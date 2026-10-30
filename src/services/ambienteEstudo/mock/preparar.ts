import { Material } from '@/@types/AmbienteEstudo'
import { exigir } from '../erros'
import { BancoAmbienteEstudo, agora } from './armazenamento'
import { atraso } from './atraso'
import { escolherPacote } from './conteudo'
import { garantirSemente } from './semente'

/** Latência simulada + garantia de que a semente existe. */
export async function preparar(min?: number, max?: number) {
  await atraso(min, max)
  await garantirSemente()
}

export function pacoteDoAmbiente(
  banco: BancoAmbienteEstudo,
  ambienteId: string
) {
  const ambiente = exigir(
    banco.ambientes.find(({ id }) => id === ambienteId),
    'Ambiente'
  )
  return escolherPacote(ambiente.nome)
}

/** Materiais utilizáveis como contexto (ignora os que falharam). */
export function materiaisUtilizaveis(
  banco: BancoAmbienteEstudo,
  materialIds: string[]
): Material[] {
  return banco.materiais.filter(
    ({ id, status }) => materialIds.includes(id) && status !== 'ERRO'
  )
}

/** Marca o ambiente como alterado agora (usado em "última atividade"). */
export function tocarAmbiente(banco: BancoAmbienteEstudo, ambienteId: string) {
  const ambiente = banco.ambientes.find(({ id }) => id === ambienteId)
  if (ambiente) ambiente.atualizadoEm = agora()
}
