import {
  AtualizacaoTentativaSimulado,
  ConfigSimulado,
  CorrecaoDiscursiva,
  QuestaoDiscursiva,
  Simulado,
  SimuladoListagem,
  TentativaSimulado
} from '@/@types/AmbienteEstudo'
import { calcularResultadoSimulado } from '@/utils/ambienteEstudo/calcularResultado'
import { ErroPrazoEsgotado, exigir } from './erros'
import { registrarEventoEstudo } from './eventos'
import {
  BancoAmbienteEstudo,
  agora,
  alterarBanco,
  clonar,
  gerarId,
  lerBanco
} from './mock/armazenamento'
import { agendar, atraso } from './mock/atraso'
import { corrigirDiscursivaDemonstracao, gerarQuestoes } from './mock/geradores'
import {
  materiaisUtilizaveis,
  pacoteDoAmbiente,
  preparar,
  tocarAmbiente
} from './mock/preparar'

/** Tolerância para respostas salvas no último segundo (latência de rede). */
const TOLERANCIA_PRAZO_MS = 3000

export async function listarSimulados(
  ambienteId: string
): Promise<SimuladoListagem[]> {
  await preparar(150, 400)
  const banco = lerBanco()
  return clonar(
    banco.simulados
      .filter((simulado) => simulado.ambienteId === ambienteId)
      .sort((a, b) => b.criadoEm.localeCompare(a.criadoEm))
      .map((simulado) => ({
        ...simulado,
        tentativas: banco.tentativasSimulado
          .filter(({ simuladoId }) => simuladoId === simulado.id)
          .sort((a, b) => b.iniciadaEm.localeCompare(a.iniciadaEm))
      }))
  )
}

export async function obterSimulado(id: string): Promise<Simulado> {
  await preparar(100, 300)
  return clonar(
    exigir(
      lerBanco().simulados.find((s) => s.id === id),
      'Simulado'
    )
  )
}

export async function gerarSimulado(
  ambienteId: string,
  dados: { titulo?: string; config: ConfigSimulado }
): Promise<Simulado> {
  await preparar()
  const { config } = dados

  const simulado = alterarBanco((banco) => {
    const quantidade = banco.simulados.filter(
      (s) => s.ambienteId === ambienteId
    ).length
    const novo: Simulado = {
      id: gerarId(),
      ambienteId,
      titulo: dados.titulo?.trim() || `Simulado ${quantidade + 1}`,
      config,
      questoes: [],
      status: 'GERANDO',
      criadoEm: agora()
    }
    banco.simulados.push(novo)
    tocarAmbiente(banco, ambienteId)
    return novo
  })

  agendar(2500 + Math.random() * 1500, () =>
    alterarBanco((banco) => {
      const salvo = banco.simulados.find(({ id }) => id === simulado.id)
      if (!salvo) return
      salvo.questoes = gerarQuestoes(
        pacoteDoAmbiente(banco, ambienteId),
        materiaisUtilizaveis(banco, config.materialIds),
        {
          tipos: config.tiposQuestao,
          quantidade: config.quantidadeQuestoes,
          dificuldade: config.dificuldade,
          embaralharOpcoes: config.embaralharOpcoes
        }
      )
      salvo.status = salvo.questoes.length ? 'PRONTO' : 'ERRO'
    })
  )

  return clonar(simulado)
}

export async function excluirSimulado(id: string): Promise<void> {
  await preparar()
  alterarBanco((banco) => {
    banco.simulados = banco.simulados.filter((simulado) => simulado.id !== id)
    banco.tentativasSimulado = banco.tentativasSimulado.filter(
      ({ simuladoId }) => simuladoId !== id
    )
  })
}

const prazoVencido = (tentativa: TentativaSimulado, folgaMs = 0) =>
  tentativa.prazoFinal !== null &&
  Date.now() > new Date(tentativa.prazoFinal).getTime() + folgaMs

/** Corrige as objetivas na hora e agenda a correção das discursivas. */
function entregar(
  banco: BancoAmbienteEstudo,
  tentativa: TentativaSimulado,
  automatica: boolean
) {
  const simulado = exigir(
    banco.simulados.find(({ id }) => id === tentativa.simuladoId),
    'Simulado'
  )
  const discursivas = simulado.questoes.filter(
    (questao): questao is QuestaoDiscursiva => questao.tipo === 'DISCURSIVA'
  )
  const correcoes: Record<string, CorrecaoDiscursiva> = Object.fromEntries(
    discursivas.map(({ id, rubrica }) => [
      id,
      {
        questaoId: id,
        status: 'GERANDO',
        criterios: [],
        nota: 0,
        notaMaxima: rubrica.reduce((soma, { pontos }) => soma + pontos, 0),
        feedbackGeral: ''
      }
    ])
  )

  // Com prazo, a entrega automática registra o horário do prazo, não o da abertura.
  tentativa.entregueEm =
    automatica && tentativa.prazoFinal ? tentativa.prazoFinal : agora()
  tentativa.entregaAutomatica = automatica
  tentativa.resultado = calcularResultadoSimulado(
    simulado.questoes,
    tentativa.respostas,
    correcoes
  )
  tocarAmbiente(banco, simulado.ambienteId)

  if (discursivas.length) {
    agendar(2500 + Math.random() * 2000, () =>
      alterarBanco((bancoAtual) => {
        const salva = bancoAtual.tentativasSimulado.find(
          ({ id }) => id === tentativa.id
        )
        if (!salva) return
        const corrigidas = Object.fromEntries(
          discursivas.map((questao) => {
            const resposta = salva.respostas[questao.id]
            const texto = resposta?.tipo === 'DISCURSIVA' ? resposta.texto : ''
            return [questao.id, corrigirDiscursivaDemonstracao(questao, texto)]
          })
        )
        salva.resultado = calcularResultadoSimulado(
          simulado.questoes,
          salva.respostas,
          corrigidas
        )
      })
    )
  }

  registrarEventoEstudo('SIMULADO_ENTREGUE', {
    simuladoId: simulado.id,
    automatica,
    notaParcial: tentativa.resultado.notaFinal
  })
}

/** Inicia uma tentativa ou devolve a que já está em andamento. O prazo é definido aqui (no servidor). */
export async function iniciarTentativa(
  simuladoId: string
): Promise<TentativaSimulado> {
  await preparar(200, 400)
  return clonar(
    alterarBanco((banco) => {
      const simulado = exigir(
        banco.simulados.find(({ id }) => id === simuladoId),
        'Simulado'
      )
      const emAndamento = banco.tentativasSimulado.find(
        (t) => t.simuladoId === simuladoId && !t.entregueEm
      )
      if (emAndamento && !prazoVencido(emAndamento)) return emAndamento
      if (emAndamento) entregar(banco, emAndamento, true)

      const inicio = Date.now()
      const { duracaoMinutos } = simulado.config
      const tentativa: TentativaSimulado = {
        id: gerarId(),
        simuladoId,
        iniciadaEm: new Date(inicio).toISOString(),
        prazoFinal: duracaoMinutos
          ? new Date(inicio + duracaoMinutos * 60_000).toISOString()
          : null,
        entregueEm: null,
        entregaAutomatica: false,
        respostas: {},
        marcadasParaRevisao: [],
        tempoPorQuestaoSeg: {},
        resultado: null
      }
      banco.tentativasSimulado.push(tentativa)
      return tentativa
    })
  )
}

/** Ao abrir uma tentativa com prazo vencido, ela é entregue automaticamente. */
export async function obterTentativa(id: string): Promise<TentativaSimulado> {
  await preparar(100, 250)
  return clonar(
    alterarBanco((banco) => {
      const tentativa = exigir(
        banco.tentativasSimulado.find((t) => t.id === id),
        'Tentativa'
      )
      if (!tentativa.entregueEm && prazoVencido(tentativa)) {
        entregar(banco, tentativa, true)
      }
      return tentativa
    })
  )
}

export async function salvarRespostas(
  id: string,
  parcial: AtualizacaoTentativaSimulado
): Promise<TentativaSimulado> {
  await atraso(50, 150)
  return clonar(
    alterarBanco((banco) => {
      const tentativa = exigir(
        banco.tentativasSimulado.find((t) => t.id === id),
        'Tentativa'
      )
      if (
        tentativa.entregueEm ||
        prazoVencido(tentativa, TOLERANCIA_PRAZO_MS)
      ) {
        throw new ErroPrazoEsgotado()
      }
      Object.assign(tentativa, parcial)
      return tentativa
    })
  )
}

export async function entregarTentativa(
  id: string,
  automatica: boolean
): Promise<TentativaSimulado> {
  await preparar(400, 800)
  return clonar(
    alterarBanco((banco) => {
      const tentativa = exigir(
        banco.tentativasSimulado.find((t) => t.id === id),
        'Tentativa'
      )
      if (!tentativa.entregueEm) entregar(banco, tentativa, automatica)
      return tentativa
    })
  )
}
