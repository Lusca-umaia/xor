// Contrato do Ambiente de Estudo. Nesta fase as funções usam o mock local
// (./mock); com o back pronto, troque os corpos por chamadas a `api`.
import {
  AmbienteEstudo,
  AmbienteListagem,
  DadosAmbiente
} from '@/@types/AmbienteEstudo'
import { exigir } from './erros'
import {
  agora,
  alterarBanco,
  clonar,
  gerarId,
  lerBanco
} from './mock/armazenamento'
import { atraso } from './mock/atraso'
import { preparar } from './mock/preparar'
import { restaurarSemente } from './mock/semente'

export async function listarAmbientes(): Promise<AmbienteListagem[]> {
  await preparar()
  const banco = lerBanco()

  const contar = (lista: { ambienteId: string }[], ambienteId: string) =>
    lista.filter((item) => item.ambienteId === ambienteId).length

  return clonar(
    banco.ambientes
      .map((ambiente) => ({
        ...ambiente,
        contagem: {
          materiais: contar(banco.materiais, ambiente.id),
          chats: contar(banco.chats, ambiente.id),
          resumos: contar(banco.resumos, ambiente.id),
          atividades: contar(banco.atividades, ambiente.id),
          simulados: contar(banco.simulados, ambiente.id)
        },
        ultimaAtividadeEm: ambiente.atualizadoEm
      }))
      .sort((a, b) => b.ultimaAtividadeEm.localeCompare(a.ultimaAtividadeEm))
  )
}

export async function obterAmbiente(id: string): Promise<AmbienteEstudo> {
  await preparar(150, 350)
  return clonar(
    exigir(
      lerBanco().ambientes.find((ambiente) => ambiente.id === id),
      'Ambiente'
    )
  )
}

export async function criarAmbiente(
  dados: DadosAmbiente
): Promise<AmbienteEstudo> {
  await preparar()
  const ambiente: AmbienteEstudo = {
    id: gerarId(),
    ...dados,
    origem: dados.disciplinaCodigo ? 'CADEIRA' : 'LIVRE',
    arquivado: false,
    criadoEm: agora(),
    atualizadoEm: agora()
  }
  alterarBanco((banco) => banco.ambientes.push(ambiente))
  return clonar(ambiente)
}

export async function atualizarAmbiente(
  id: string,
  dados: Partial<DadosAmbiente> & { arquivado?: boolean }
): Promise<AmbienteEstudo> {
  await preparar()
  return clonar(
    alterarBanco((banco) => {
      const ambiente = exigir(
        banco.ambientes.find((item) => item.id === id),
        'Ambiente'
      )
      Object.assign(ambiente, dados, { atualizadoEm: agora() })
      if (dados.disciplinaCodigo !== undefined) {
        ambiente.origem = dados.disciplinaCodigo ? 'CADEIRA' : 'LIVRE'
      }
      return ambiente
    })
  )
}

/** Exclui o ambiente e todo o seu conteúdo. */
export async function excluirAmbiente(id: string): Promise<void> {
  await preparar()
  alterarBanco((banco) => {
    const chats = new Set(
      banco.chats.filter((c) => c.ambienteId === id).map((c) => c.id)
    )
    const atividades = new Set(
      banco.atividades.filter((a) => a.ambienteId === id).map((a) => a.id)
    )
    const simulados = new Set(
      banco.simulados.filter((s) => s.ambienteId === id).map((s) => s.id)
    )
    const materiais = banco.materiais.filter((m) => m.ambienteId === id)

    materiais.forEach((material) => delete banco.miniaturas[material.id])
    banco.ambientes = banco.ambientes.filter((a) => a.id !== id)
    banco.materiais = banco.materiais.filter((m) => m.ambienteId !== id)
    banco.chats = banco.chats.filter((c) => !chats.has(c.id))
    banco.mensagens = banco.mensagens.filter((m) => !chats.has(m.chatId))
    banco.resumos = banco.resumos.filter((r) => r.ambienteId !== id)
    banco.atividades = banco.atividades.filter((a) => !atividades.has(a.id))
    banco.tentativasAtividade = banco.tentativasAtividade.filter(
      (t) => !atividades.has(t.atividadeId)
    )
    banco.simulados = banco.simulados.filter((s) => !simulados.has(s.id))
    banco.tentativasSimulado = banco.tentativasSimulado.filter(
      (t) => !simulados.has(t.simuladoId)
    )
  })
}

/** Apaga tudo e recria os ambientes de demonstração. Só existe no mock. */
export async function restaurarDemonstracao(): Promise<void> {
  await atraso()
  await restaurarSemente()
}
