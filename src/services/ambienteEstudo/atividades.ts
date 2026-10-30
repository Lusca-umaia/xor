import {
  Atividade,
  AtividadeListagem,
  AvaliacaoFlashcard,
  ConfigAtividade,
  CorrecaoDiscursiva,
  Flashcard,
  TentativaAtividade
} from '@/@types/AmbienteEstudo'
import {
  contarPendentes,
  proximoEstadoRevisao
} from '@/utils/ambienteEstudo/revisaoEspacada'
import {
  ROTULO_TIPO_ATIVIDADE,
  TIPO_QUESTAO_DA_ATIVIDADE
} from '@/utils/ambienteEstudo/rotulos'
import { ErroNaoEncontrado, exigir } from './erros'
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
import {
  corrigirDiscursivaDemonstracao,
  gerarExplicacaoAlternativa,
  gerarFlashcards,
  gerarQuestoes
} from './mock/geradores'
import {
  materiaisUtilizaveis,
  pacoteDoAmbiente,
  preparar,
  tocarAmbiente
} from './mock/preparar'

export async function listarAtividades(
  ambienteId: string
): Promise<AtividadeListagem[]> {
  await preparar(150, 400)
  const banco = lerBanco()

  return clonar(
    banco.atividades
      .filter((atividade) => atividade.ambienteId === ambienteId)
      .sort((a, b) => b.criadoEm.localeCompare(a.criadoEm))
      .map((atividade) => {
        const tentativas = banco.tentativasAtividade.filter(
          ({ atividadeId }) => atividadeId === atividade.id
        )
        const concluidas = tentativas.filter(({ concluidaEm }) => concluidaEm)
        const melhor = concluidas.sort((a, b) => b.acertos - a.acertos)[0]
        return {
          ...atividade,
          melhorResultado: melhor
            ? { acertos: melhor.acertos, total: melhor.total }
            : null,
          tentativaEmAndamento: tentativas.some(
            ({ concluidaEm }) => !concluidaEm
          ),
          flashcardsPendentes: contarPendentes(atividade.flashcards)
        }
      })
  )
}

export async function obterAtividade(id: string): Promise<Atividade> {
  await preparar(100, 300)
  return clonar(
    exigir(
      lerBanco().atividades.find((a) => a.id === id),
      'Atividade'
    )
  )
}

function preencherAtividade(
  banco: BancoAmbienteEstudo,
  atividade: Atividade,
  config: ConfigAtividade
) {
  const pacote = pacoteDoAmbiente(banco, atividade.ambienteId)
  const materiais = materiaisUtilizaveis(banco, config.materialIds)

  if (config.tipo === 'FLASHCARDS') {
    atividade.flashcards = gerarFlashcards(pacote, materiais, config.quantidade)
  } else {
    atividade.questoes = gerarQuestoes(pacote, materiais, {
      tipos: [TIPO_QUESTAO_DA_ATIVIDADE[config.tipo]],
      quantidade: config.quantidade,
      dificuldade: config.dificuldade,
      topico: config.topico
    })
  }
  atividade.status = 'PRONTO'
}

/**
 * Cria a atividade como GERANDO e preenche de forma assíncrona. Com
 * `questoesBase` (ex.: refazer as erradas), fica pronta na hora.
 */
export async function gerarAtividade(
  ambienteId: string,
  config: ConfigAtividade
): Promise<Atividade> {
  await preparar()

  const atividade = alterarBanco((banco) => {
    const nova: Atividade = {
      id: gerarId(),
      ambienteId,
      titulo: config.titulo?.trim() || ROTULO_TIPO_ATIVIDADE[config.tipo],
      tipo: config.tipo,
      materialIds: config.materialIds,
      dificuldade: config.dificuldade,
      questoes: config.questoesBase
        ? config.questoesBase.map((questao) => ({ ...questao, id: gerarId() }))
        : [],
      flashcards: [],
      origemChatId: config.origemChatId ?? null,
      origemResumoId: config.origemResumoId ?? null,
      status: config.questoesBase ? 'PRONTO' : 'GERANDO',
      criadoEm: agora()
    }
    banco.atividades.push(nova)
    tocarAmbiente(banco, ambienteId)
    return nova
  })

  if (!config.questoesBase) {
    agendar(1800 + Math.random() * 1500, () =>
      alterarBanco((banco) => {
        const salva = banco.atividades.find(({ id }) => id === atividade.id)
        if (salva) preencherAtividade(banco, salva, config)
      })
    )
  }

  return clonar(atividade)
}

export async function excluirAtividade(id: string): Promise<void> {
  await preparar()
  alterarBanco((banco) => {
    banco.atividades = banco.atividades.filter(
      (atividade) => atividade.id !== id
    )
    banco.tentativasAtividade = banco.tentativasAtividade.filter(
      ({ atividadeId }) => atividadeId !== id
    )
  })
}

export async function listarTentativasAtividade(
  atividadeId: string
): Promise<TentativaAtividade[]> {
  await preparar(100, 250)
  return clonar(
    lerBanco()
      .tentativasAtividade.filter((t) => t.atividadeId === atividadeId)
      .sort((a, b) => b.iniciadaEm.localeCompare(a.iniciadaEm))
  )
}

export async function iniciarTentativaAtividade(
  atividadeId: string
): Promise<TentativaAtividade> {
  await preparar(100, 250)
  return clonar(
    alterarBanco((banco) => {
      const atividade = exigir(
        banco.atividades.find(({ id }) => id === atividadeId),
        'Atividade'
      )
      // Uma nova tentativa substitui a que estava em andamento.
      banco.tentativasAtividade = banco.tentativasAtividade.filter(
        (t) => t.atividadeId !== atividadeId || t.concluidaEm
      )
      const tentativa: TentativaAtividade = {
        id: gerarId(),
        atividadeId,
        respostas: {},
        correcoesDiscursivas: {},
        confirmadas: [],
        indiceAtual: 0,
        acertos: 0,
        total: atividade.questoes.length,
        iniciadaEm: agora(),
        concluidaEm: null
      }
      banco.tentativasAtividade.push(tentativa)
      return tentativa
    })
  )
}

export async function salvarTentativaAtividade(
  tentativa: TentativaAtividade
): Promise<TentativaAtividade> {
  await atraso(50, 150)
  alterarBanco((banco) => {
    const indice = banco.tentativasAtividade.findIndex(
      ({ id }) => id === tentativa.id
    )
    if (indice === -1) throw new ErroNaoEncontrado('Tentativa')
    banco.tentativasAtividade[indice] = clonar(tentativa)

    const atividade = banco.atividades.find(
      ({ id }) => id === tentativa.atividadeId
    )
    if (atividade) tocarAmbiente(banco, atividade.ambienteId)
  })
  if (tentativa.concluidaEm) {
    registrarEventoEstudo('ATIVIDADE_CONCLUIDA', {
      atividadeId: tentativa.atividadeId,
      acertos: tentativa.acertos,
      total: tentativa.total
    })
  }
  return clonar(tentativa)
}

function encontrarQuestao(banco: BancoAmbienteEstudo, questaoId: string) {
  for (const origem of [...banco.atividades, ...banco.simulados]) {
    const questao = origem.questoes.find(({ id }) => id === questaoId)
    if (questao) return { questao, ambienteId: origem.ambienteId }
  }
  throw new ErroNaoEncontrado('Questão')
}

/** Correção formativa por rubrica. Demora alguns segundos, como a IA real. */
export async function corrigirDiscursiva(
  questaoId: string,
  texto: string
): Promise<CorrecaoDiscursiva> {
  await preparar(1500, 2800)
  const { questao } = encontrarQuestao(lerBanco(), questaoId)
  if (questao.tipo !== 'DISCURSIVA') {
    throw new Error('Apenas questões discursivas são corrigidas por rubrica.')
  }
  return corrigirDiscursivaDemonstracao(questao, texto)
}

const contadorExplicacoes = new Map<string, number>()

export async function explicarDeOutroJeito(questaoId: string): Promise<string> {
  await preparar(700, 1400)
  const banco = lerBanco()
  const { ambienteId } = encontrarQuestao(banco, questaoId)
  const indice = contadorExplicacoes.get(questaoId) ?? 0
  contadorExplicacoes.set(questaoId, indice + 1)
  return gerarExplicacaoAlternativa(pacoteDoAmbiente(banco, ambienteId), indice)
}

export async function avaliarFlashcard(
  atividadeId: string,
  flashcardId: string,
  avaliacao: AvaliacaoFlashcard
): Promise<Flashcard> {
  await atraso(50, 150)
  const flashcard = alterarBanco((banco) => {
    const atividade = exigir(
      banco.atividades.find(({ id }) => id === atividadeId),
      'Atividade'
    )
    const card = exigir(
      atividade.flashcards.find(({ id }) => id === flashcardId),
      'Flashcard'
    )
    card.revisao = proximoEstadoRevisao(card.revisao, avaliacao)
    tocarAmbiente(banco, atividade.ambienteId)
    return card
  })
  registrarEventoEstudo('FLASHCARD_REVISADO', { atividadeId, avaliacao })
  return clonar(flashcard)
}
