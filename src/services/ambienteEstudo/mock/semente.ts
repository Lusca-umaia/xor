import {
  AmbienteEstudo,
  Atividade,
  CorAmbiente,
  Material
} from '@/@types/AmbienteEstudo'
import { AlunoAtual, obterAlunoAtual } from '../cadeiras'
import {
  BancoAmbienteEstudo,
  alterarBanco,
  gerarId,
  lerBanco,
  limparBanco
} from './armazenamento'
import { escolherPacote } from './conteudo'
import {
  gerarConteudoResumo,
  gerarFlashcards,
  gerarQuestoes,
  gerarRespostaChat
} from './geradores'

export const CORES_SEMENTE: CorAmbiente[] = [
  'azul',
  'verde',
  'roxo',
  'laranja',
  'rosa',
  'ciano',
  'ambar'
]

const PERGUNTAS_INICIAIS: Record<string, string> = {
  computacao: 'Qual é a diferença entre pilha e fila?',
  calculo: 'Como eu escolho o u na integração por partes?',
  redacao: 'Qual a diferença entre coesão e coerência?',
  generico: 'Qual é a melhor forma de estudar este conteúdo?'
}

const horasAtras = (horas: number) =>
  new Date(Date.now() - horas * 3_600_000).toISOString()

/** Cria o conteúdo de demonstração de um ambiente recém-criado pela semente. */
function popularAmbiente(banco: BancoAmbienteEstudo, ambiente: AmbienteEstudo) {
  const pacote = escolherPacote(ambiente.nome)

  const materiais: Material[] = pacote.materiaisDemonstracao.map(
    (material, indice) => ({
      ...material,
      id: gerarId(),
      ambienteId: ambiente.id,
      status: 'PRONTO',
      mensagemErro: null,
      origem: 'UPLOAD',
      conteudoTexto: null,
      criadoEm: horasAtras(72 - indice)
    })
  )
  banco.materiais.push(...materiais)
  const materialIds = materiais.map(({ id }) => id)

  const chatId = gerarId()
  const pergunta = PERGUNTAS_INICIAIS[pacote.chave]
  const resposta = gerarRespostaChat(pacote, materiais, {
    modo: 'TUTOR',
    indice: 0
  })
  banco.chats.push({
    id: chatId,
    ambienteId: ambiente.id,
    titulo: pergunta,
    materialIds,
    modo: 'TUTOR',
    fixado: false,
    criadoEm: horasAtras(30),
    atualizadoEm: horasAtras(30)
  })
  banco.mensagens.push(
    {
      id: gerarId(),
      chatId,
      papel: 'ALUNO',
      conteudo: pergunta,
      anexoIds: [],
      citacoes: [],
      foraDoMaterial: false,
      status: 'CONCLUIDA',
      criadoEm: horasAtras(30)
    },
    {
      id: gerarId(),
      chatId,
      papel: 'ASSISTENTE',
      ...resposta,
      anexoIds: [],
      status: 'CONCLUIDA',
      criadoEm: horasAtras(30)
    }
  )

  const resumo = gerarConteudoResumo(pacote, materiais, 'TOPICOS')
  banco.resumos.push({
    id: gerarId(),
    ambienteId: ambiente.id,
    titulo: `Resumo geral — ${ambiente.nome}`,
    formato: 'TOPICOS',
    materialIds,
    ...resumo,
    editadoPeloAluno: false,
    origemChatId: null,
    status: 'PRONTO',
    criadoEm: horasAtras(48),
    atualizadoEm: horasAtras(48)
  })

  const atividadeBase = {
    ambienteId: ambiente.id,
    materialIds,
    dificuldade: 'MISTA' as const,
    origemChatId: null,
    origemResumoId: null,
    status: 'PRONTO' as const
  }
  const atividades: Atividade[] = [
    {
      ...atividadeBase,
      id: gerarId(),
      titulo: 'Quiz de revisão',
      tipo: 'QUIZ',
      questoes: gerarQuestoes(pacote, materiais, {
        tipos: ['MULTIPLA_ESCOLHA'],
        quantidade: 5,
        dificuldade: 'MISTA'
      }),
      flashcards: [],
      criadoEm: horasAtras(40)
    },
    {
      ...atividadeBase,
      id: gerarId(),
      titulo: 'Flashcards dos conceitos-chave',
      tipo: 'FLASHCARDS',
      questoes: [],
      flashcards: gerarFlashcards(pacote, materiais, pacote.flashcards.length),
      criadoEm: horasAtras(36)
    }
  ]
  banco.atividades.push(...atividades)
}

function semear(banco: BancoAmbienteEstudo, aluno: AlunoAtual) {
  aluno.cadeiras.forEach((cadeira, indice) => {
    const ambiente: AmbienteEstudo = {
      id: gerarId(),
      nome: cadeira.nome,
      descricao: null,
      cor: CORES_SEMENTE[indice % CORES_SEMENTE.length],
      origem: 'CADEIRA',
      disciplinaCodigo: cadeira.codigo,
      arquivado: false,
      criadoEm: horasAtras(96),
      atualizadoEm: horasAtras(24 + indice)
    }
    banco.ambientes.push(ambiente)
    popularAmbiente(banco, ambiente)
  })
  banco.semeado = true
  banco.donoId = aluno.id
}

/**
 * No primeiro acesso de cada aluno, cria um ambiente por cadeira em andamento.
 * Se outro aluno entrar no mesmo navegador, os dados locais são recomeçados.
 * Sem progresso disponível, segue com o que já existe e tenta de novo depois.
 */
export async function garantirSemente() {
  const aluno = await obterAlunoAtual()
  const banco = lerBanco()
  if (!aluno || (banco.semeado && banco.donoId === aluno.id)) return
  limparBanco()
  alterarBanco((novo) => semear(novo, aluno))
}

export async function restaurarSemente() {
  const aluno = await obterAlunoAtual()
  if (!aluno) {
    throw new Error('Não foi possível carregar suas cadeiras. Tente novamente.')
  }
  limparBanco()
  alterarBanco((banco) => semear(banco, aluno))
}
