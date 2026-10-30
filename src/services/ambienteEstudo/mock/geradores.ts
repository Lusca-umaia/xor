import {
  Citacao,
  CorrecaoDiscursiva,
  DificuldadeConfig,
  Flashcard,
  FormatoResumo,
  Material,
  ModoChat,
  PedidoTutor,
  Questao,
  QuestaoDiscursiva,
  TipoQuestao
} from '@/@types/AmbienteEstudo'
import { normalizarTexto } from '@/utils/historicoAcademico'
import { agora, gerarId } from './armazenamento'
import { PacoteConteudo } from './conteudo'
import { QuestaoPacote } from './conteudo/tipos'

export function embaralhar<T>(itens: T[]): T[] {
  const copia = [...itens]
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copia[i], copia[j]] = [copia[j], copia[i]]
  }
  return copia
}

/**
 * Associa os trechos do pacote aos materiais reais selecionados. Se o aluno
 * enviou o próprio material de demonstração, a citação aponta para ele;
 * caso contrário, os trechos são distribuídos entre os materiais escolhidos.
 */
export function montarCitacoes(
  pacote: PacoteConteudo,
  indices: number[],
  materiais: Material[]
): Citacao[] {
  if (materiais.length === 0) return []

  return indices.map((indice) => {
    const trecho = pacote.trechos[indice]
    const nomeDemonstracao = pacote.materiaisDemonstracao[trecho.material]?.nome
    const material =
      materiais.find(({ nome }) => nome === nomeDemonstracao) ??
      materiais[trecho.material % materiais.length]

    return {
      materialId: material.id,
      materialNome: material.nome,
      pagina: material.tipo === 'TEXTO' ? null : trecho.pagina,
      trecho: trecho.texto
    }
  })
}

function materializarQuestao(
  base: QuestaoPacote,
  pacote: PacoteConteudo,
  materiais: Material[],
  embaralharOpcoes: boolean
): Questao {
  const { trecho, ...questao } = base
  const comum = {
    id: gerarId(),
    origem: 'IA' as const,
    citacoes: montarCitacoes(pacote, [trecho], materiais)
  }

  if (questao.tipo === 'MULTIPLA_ESCOLHA') {
    return {
      ...questao,
      ...comum,
      opcoes: embaralharOpcoes ? embaralhar(questao.opcoes) : questao.opcoes
    }
  }
  return { ...questao, ...comum } as Questao
}

interface OpcoesGerarQuestoes {
  tipos: TipoQuestao[]
  quantidade: number
  dificuldade: DificuldadeConfig
  topico?: string | null
  embaralharOpcoes?: boolean
}

/**
 * Seleciona questões do pacote priorizando a dificuldade e o tópico pedidos.
 * Quando o banco de demonstração não tem questões suficientes, devolve menos
 * do que o pedido (a interface informa isso).
 */
export function gerarQuestoes(
  pacote: PacoteConteudo,
  materiais: Material[],
  {
    tipos,
    quantidade,
    dificuldade,
    topico,
    embaralharOpcoes = true
  }: OpcoesGerarQuestoes
): Questao[] {
  const candidatas = pacote.questoes.filter(({ tipo }) => tipos.includes(tipo))

  const pontuar = (questao: QuestaoPacote) =>
    (dificuldade !== 'MISTA' && questao.dificuldade === dificuldade ? 2 : 0) +
    (topico && questao.topico === topico ? 3 : 0) +
    Math.random()

  return candidatas
    .map((questao) => ({ questao, pontos: pontuar(questao) }))
    .sort((a, b) => b.pontos - a.pontos)
    .slice(0, quantidade)
    .map(({ questao }) =>
      materializarQuestao(questao, pacote, materiais, embaralharOpcoes)
    )
}

export function contarQuestoesDisponiveis(
  pacote: PacoteConteudo,
  tipos: TipoQuestao[]
) {
  return pacote.questoes.filter(({ tipo }) => tipos.includes(tipo)).length
}

export function topicosDoPacote(pacote: PacoteConteudo) {
  return [
    ...new Set(
      pacote.questoes
        .map(({ topico }) => topico)
        .filter((topico): topico is string => Boolean(topico))
    )
  ]
}

export function gerarFlashcards(
  pacote: PacoteConteudo,
  materiais: Material[],
  quantidade: number
): Flashcard[] {
  return embaralhar(pacote.flashcards)
    .slice(0, quantidade)
    .map(({ frente, verso, trecho }) => ({
      id: gerarId(),
      frente,
      verso,
      citacoes: montarCitacoes(pacote, [trecho], materiais),
      revisao: {
        repeticoes: 0,
        intervaloDias: 0,
        facilidade: 2.5,
        proximaRevisao: agora()
      }
    }))
}

export function gerarConteudoResumo(
  pacote: PacoteConteudo,
  materiais: Material[],
  formato: FormatoResumo
) {
  const { conteudo, trechos } = pacote.resumos[formato]
  return { conteudo, citacoes: montarCitacoes(pacote, trechos, materiais) }
}

const RESPOSTA_FORA_DO_MATERIAL =
  'Não encontrei esse assunto nos materiais deste chat. **Quando a IA estiver integrada**, eu responderia com conhecimento geral e sinalizaria que a resposta não veio dos seus documentos.\n\nPara respostas com fonte, adicione um material sobre o tema à biblioteca e selecione-o no contexto do chat.'

interface OpcoesRespostaChat {
  modo: ModoChat
  pedido?: PedidoTutor
  /** Quantas respostas o assistente já deu neste chat (para variar o conteúdo). */
  indice: number
}

export function gerarRespostaChat(
  pacote: PacoteConteudo,
  materiais: Material[],
  { modo, pedido, indice }: OpcoesRespostaChat
): { conteudo: string; citacoes: Citacao[]; foraDoMaterial: boolean } {
  if (materiais.length === 0) {
    return {
      conteudo: RESPOSTA_FORA_DO_MATERIAL,
      citacoes: [],
      foraDoMaterial: true
    }
  }

  if (pedido === 'DICA') {
    const dica = pacote.chat.dicas[indice % pacote.chat.dicas.length]
    return { conteudo: dica, citacoes: [], foraDoMaterial: false }
  }

  const lista =
    modo === 'TUTOR' && pedido !== 'RESPOSTA_COMPLETA'
      ? pacote.chat.tutor
      : pacote.chat.explicacao
  const { conteudo, trechos } = lista[indice % lista.length]

  return {
    conteudo,
    citacoes: montarCitacoes(pacote, trechos, materiais),
    foraDoMaterial: false
  }
}

export function gerarExplicacaoAlternativa(
  pacote: PacoteConteudo,
  indice: number
) {
  const lista = pacote.explicacoesAlternativas
  return lista[indice % lista.length]
}

const PALAVRAS_VAZIAS = new Set([
  'para',
  'como',
  'mais',
  'pela',
  'pelo',
  'que',
  'uma',
  'com',
  'dos',
  'das',
  'por',
  'sao',
  'nao',
  'isso',
  'essa',
  'esse',
  'entao',
  'quando',
  'onde',
  'ainda',
  'mesmo'
])

function palavrasRelevantes(texto: string) {
  return new Set(
    normalizarTexto(texto)
      .split(' ')
      .filter((palavra) => palavra.length > 3 && !PALAVRAS_VAZIAS.has(palavra))
  )
}

/**
 * Correção de demonstração: estima a qualidade pela cobertura do vocabulário
 * da resposta modelo e pela extensão do texto. A correção real virá do back.
 */
export function corrigirDiscursivaDemonstracao(
  questao: QuestaoDiscursiva,
  texto: string
): CorrecaoDiscursiva {
  const modelo = palavrasRelevantes(questao.respostaModelo)
  const resposta = palavrasRelevantes(texto)
  const emComum = [...resposta].filter((palavra) => modelo.has(palavra)).length
  const cobertura = Math.min(1, emComum / Math.max(6, modelo.size * 0.35))
  const extensao = Math.min(1, texto.trim().split(/\s+/).length / 50)
  const qualidade = texto.trim() ? 0.65 * cobertura + 0.35 * extensao : 0

  const criterios = questao.rubrica.map((criterio) => {
    const variacao = (Math.random() - 0.5) * 0.2
    const fator = Math.max(0, Math.min(1, qualidade + variacao))
    const pontosObtidos = Math.round(criterio.pontos * fator * 2) / 2
    const proporcao = pontosObtidos / criterio.pontos
    const descricao = criterio.descricao.replace(/\.$/, '')

    const justificativa =
      proporcao >= 0.75
        ? `Atende bem ao critério: ${descricao.toLowerCase()}.`
        : proporcao >= 0.4
          ? `Atende parcialmente. Desenvolva melhor este ponto: ${descricao.toLowerCase()}.`
          : `Ainda não atende. Revise no material: ${descricao.toLowerCase()}.`

    return { criterioId: criterio.id, pontosObtidos, justificativa }
  })

  const nota = criterios.reduce(
    (soma, { pontosObtidos }) => soma + pontosObtidos,
    0
  )
  const notaMaxima = questao.rubrica.reduce(
    (soma, { pontos }) => soma + pontos,
    0
  )
  const proporcao = nota / notaMaxima

  const feedbackGeral =
    proporcao >= 0.75
      ? 'Ótima resposta! Você cobriu os pontos principais. Compare com a resposta modelo para ver se algum detalhe pode deixar o texto ainda mais preciso.'
      : proporcao >= 0.4
        ? 'Bom começo. Alguns critérios foram atendidos só em parte: veja as justificativas abaixo e confira os trechos do material indicados.'
        : 'Sua resposta ainda não cobre os pontos centrais da questão. Releia o trecho citado, tente explicar com suas palavras e responda de novo.'

  return {
    questaoId: questao.id,
    status: 'PRONTO',
    criterios,
    nota,
    notaMaxima,
    feedbackGeral
  }
}

/** Título curto a partir do texto da primeira mensagem do chat. */
export function tituloDeTexto(texto: string) {
  const limpo = texto.replace(/\s+/g, ' ').trim()
  if (!limpo) return 'Novo chat'
  return limpo.length > 48 ? `${limpo.slice(0, 45).trimEnd()}...` : limpo
}
