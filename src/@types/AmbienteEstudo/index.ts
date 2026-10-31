// Tipos do Ambiente de Estudo. Eles são o contrato entre o front e o back:
// as datas são strings ISO 8601 e os IDs são strings (UUID).

export type StatusGeracao = 'GERANDO' | 'PRONTO' | 'ERRO'
export type Dificuldade = 'FACIL' | 'MEDIA' | 'DIFICIL'
export type DificuldadeConfig = Dificuldade | 'MISTA'

export type CorAmbiente =
  | 'cinza'
  | 'azul'
  | 'verde'
  | 'roxo'
  | 'laranja'
  | 'rosa'
  | 'ciano'
  | 'ambar'

export interface AmbienteEstudo {
  id: string
  nome: string
  descricao: string | null
  cor: CorAmbiente
  origem: 'CADEIRA' | 'LIVRE'
  disciplinaCodigo: string | null
  arquivado: boolean
  criadoEm: string
  atualizadoEm: string
}

export interface AmbienteListagem extends AmbienteEstudo {
  contagem: {
    materiais: number
    chats: number
    resumos: number
    atividades: number
    simulados: number
  }
  ultimaAtividadeEm: string
}

export interface DadosAmbiente {
  nome: string
  descricao: string | null
  cor: CorAmbiente
  disciplinaCodigo: string | null
}

/** Situação da cadeira no histórico acadêmico (não é gravada no ambiente). */
export type SituacaoCadeira =
  | 'ANDAMENTO'
  | 'APROVADA'
  | 'REPROVADA'
  | 'TRANCADA'

export interface CadeiraHistorico {
  codigo: string
  nome: string
  situacao: SituacaoCadeira
  nota: number | null
  /** Período da tentativa que define a situação (ex.: 2024.1 ou 3º semestre). */
  periodo: string | null
  /** Chave numérica para ordenar os períodos (maior = mais recente). */
  ordemPeriodo: number
}

export type TipoMaterial = 'PDF' | 'DOCX' | 'PPTX' | 'IMAGEM' | 'TEXTO'
export type StatusMaterial = 'ENVIANDO' | 'PROCESSANDO' | 'PRONTO' | 'ERRO'

export interface Material {
  id: string
  ambienteId: string
  nome: string
  tipo: TipoMaterial
  tamanhoBytes: number
  paginas: number | null
  status: StatusMaterial
  mensagemErro: string | null
  origem: 'UPLOAD' | 'CHAT'
  conteudoTexto: string | null
  criadoEm: string
}

/** Referência ao trecho do material que sustenta uma afirmação da IA. */
export interface Citacao {
  materialId: string
  materialNome: string
  pagina: number | null
  trecho: string
}

export type ModoChat = 'TUTOR' | 'EXPLICACAO'

export interface Chat {
  id: string
  ambienteId: string
  titulo: string
  materialIds: string[]
  modo: ModoChat
  fixado: boolean
  criadoEm: string
  atualizadoEm: string
}

export interface MensagemChat {
  id: string
  chatId: string
  papel: 'ALUNO' | 'ASSISTENTE'
  conteudo: string
  anexoIds: string[]
  citacoes: Citacao[]
  foraDoMaterial: boolean
  status: 'TRANSMITINDO' | 'CONCLUIDA' | 'ERRO'
  criadoEm: string
}

/** Pedido especial do aluno no modo Tutor. */
export type PedidoTutor = 'DICA' | 'RESPOSTA_COMPLETA'

export interface DadosNovaMensagem {
  conteudo: string
  anexoIds: string[]
  pedido?: PedidoTutor
}

export type FormatoResumo = 'TOPICOS' | 'CORRIDO' | 'GLOSSARIO' | 'MAPA_MENTAL'

export interface Resumo {
  id: string
  ambienteId: string
  titulo: string
  formato: FormatoResumo
  materialIds: string[]
  /** Markdown; no formato MAPA_MENTAL, código Mermaid. */
  conteudo: string
  citacoes: Citacao[]
  editadoPeloAluno: boolean
  origemChatId: string | null
  status: StatusGeracao
  criadoEm: string
  atualizadoEm: string
}

export interface ConfigResumo {
  materialIds: string[]
  formato: FormatoResumo
  titulo?: string
  origemChatId?: string | null
}

// ---------- Questões (união discriminada por `tipo`) ----------

interface QuestaoBase {
  id: string
  enunciado: string
  dificuldade: Dificuldade
  topico: string | null
  citacoes: Citacao[]
  origem: 'IA' | 'MANUAL'
}

export interface QuestaoMultiplaEscolha extends QuestaoBase {
  tipo: 'MULTIPLA_ESCOLHA'
  opcoes: { id: string; texto: string; justificativa: string }[]
  opcaoCorretaId: string
}

export interface QuestaoVerdadeiroFalso extends QuestaoBase {
  tipo: 'VERDADEIRO_FALSO'
  resposta: boolean
  justificativa: string
}

export interface QuestaoLacunas extends QuestaoBase {
  tipo: 'LACUNAS'
  /** Texto com marcadores {{id}}, ex.: "A {{l1}} transforma energia em {{l2}}." */
  texto: string
  lacunas: { id: string; respostasAceitas: string[] }[]
  justificativa: string
}

export interface QuestaoDiscursiva extends QuestaoBase {
  tipo: 'DISCURSIVA'
  rubrica: { id: string; descricao: string; pontos: number }[]
  respostaModelo: string
}

export type Questao =
  | QuestaoMultiplaEscolha
  | QuestaoVerdadeiroFalso
  | QuestaoLacunas
  | QuestaoDiscursiva

export type TipoQuestao = Questao['tipo']

export type Resposta =
  | { tipo: 'MULTIPLA_ESCOLHA'; opcaoId: string }
  | { tipo: 'VERDADEIRO_FALSO'; valor: boolean }
  | { tipo: 'LACUNAS'; valores: Record<string, string> }
  | { tipo: 'DISCURSIVA'; texto: string }

export interface CorrecaoDiscursiva {
  questaoId: string
  status: StatusGeracao
  criterios: {
    criterioId: string
    pontosObtidos: number
    justificativa: string
  }[]
  nota: number
  notaMaxima: number
  feedbackGeral: string
}

// ---------- Atividades ----------

export type TipoAtividade =
  | 'QUIZ'
  | 'VERDADEIRO_FALSO'
  | 'LACUNAS'
  | 'DISCURSIVA'
  | 'FLASHCARDS'

export type AvaliacaoFlashcard = 'DE_NOVO' | 'DIFICIL' | 'BOM' | 'FACIL'

export interface EstadoRevisao {
  repeticoes: number
  intervaloDias: number
  facilidade: number
  proximaRevisao: string
}

export interface Flashcard {
  id: string
  frente: string
  verso: string
  citacoes: Citacao[]
  revisao: EstadoRevisao
}

export interface Atividade {
  id: string
  ambienteId: string
  titulo: string
  tipo: TipoAtividade
  materialIds: string[]
  dificuldade: DificuldadeConfig
  /** Tópico pedido ao gerar (opcional). */
  topico: string | null
  questoes: Questao[]
  flashcards: Flashcard[]
  origemChatId: string | null
  origemResumoId: string | null
  status: StatusGeracao
  mensagemErro: string | null
  criadoEm: string
}

export interface ConfigAtividade {
  tipo: TipoAtividade
  materialIds: string[]
  quantidade: number
  dificuldade: DificuldadeConfig
  topico?: string | null
  titulo?: string
  origemChatId?: string | null
  origemResumoId?: string | null
  /** Usa estas questões em vez de gerar novas (ex.: refazer só as erradas). */
  questoesBase?: Questao[]
}

export interface TentativaAtividade {
  id: string
  atividadeId: string
  respostas: Record<string, Resposta>
  correcoesDiscursivas: Record<string, CorrecaoDiscursiva>
  /** Questões já confirmadas (feedback exibido). */
  confirmadas: string[]
  indiceAtual: number
  acertos: number
  total: number
  iniciadaEm: string
  concluidaEm: string | null
}

export interface AtividadeListagem extends Atividade {
  melhorResultado: { acertos: number; total: number } | null
  tentativaEmAndamento: boolean
  flashcardsPendentes: number
  /** Quando a última tentativa foi concluída (para ordenar e agrupar). */
  ultimaConclusaoEm: string | null
}

// ---------- Simulados ----------

export interface ConfigSimulado {
  materialIds: string[]
  quantidadeQuestoes: number
  tiposQuestao: TipoQuestao[]
  dificuldade: DificuldadeConfig
  /** null = modo treino (sem cronômetro). */
  duracaoMinutos: number | null
  embaralharOpcoes: boolean
}

export interface Simulado {
  id: string
  ambienteId: string
  titulo: string
  config: ConfigSimulado
  questoes: Questao[]
  status: StatusGeracao
  criadoEm: string
}

export interface ResultadoSimulado {
  acertos: number
  totalObjetivas: number
  notaDiscursivas: number | null
  notaMaximaDiscursivas: number | null
  /** De 0 a 10. */
  notaFinal: number
  porTopico: { topico: string; acertos: number; total: number }[]
  correcoesDiscursivas: Record<string, CorrecaoDiscursiva>
}

export interface TentativaSimulado {
  id: string
  simuladoId: string
  iniciadaEm: string
  /** iniciadaEm + duração; null no modo treino. */
  prazoFinal: string | null
  entregueEm: string | null
  entregaAutomatica: boolean
  respostas: Record<string, Resposta>
  marcadasParaRevisao: string[]
  tempoPorQuestaoSeg: Record<string, number>
  resultado: ResultadoSimulado | null
}

export type AtualizacaoTentativaSimulado = Partial<
  Pick<
    TentativaSimulado,
    'respostas' | 'marcadasParaRevisao' | 'tempoPorQuestaoSeg'
  >
>

export interface SimuladoListagem extends Simulado {
  tentativas: TentativaSimulado[]
}

// ---------- Transparência ----------

export type MotivoReporte =
  | 'INCORRETO'
  | 'SEM_FONTE'
  | 'ENVIESADO'
  | 'OFENSIVO'
  | 'OUTRO'

export type AlvoReporte =
  | 'MENSAGEM'
  | 'RESUMO'
  | 'QUESTAO'
  | 'FLASHCARD'
  | 'CORRECAO'

export interface ReporteConteudoIA {
  id: string
  alvo: { tipo: AlvoReporte; id: string }
  motivo: MotivoReporte
  comentario: string | null
  criadoEm: string
}

// ---------- XP ----------

export type TipoXp =
  | 'MATERIAL'
  | 'MENSAGEM'
  | 'RESUMO'
  | 'ATIVIDADE'
  | 'FLASHCARD'
  | 'SIMULADO'
  | 'SIMULADO_NOTA'

export interface EventoXp {
  tipo: TipoXp
  xp: number
  criadoEm: string
}

export interface ProgressoXp {
  xp: number
  porTipo: Partial<Record<TipoXp, number>>
  /** Eventos dos últimos 60 dias, do mais recente para o mais antigo. */
  eventos: EventoXp[]
}

// ---------- Status da IA ----------

export interface StatusIa {
  situacao: 'OK' | 'SEM_MODELO' | 'OFFLINE' | 'NAO_CONFIGURADA'
  modelo: string | null
  /** Modelo de embeddings instalado (busca semântica). */
  embeddings: boolean
}
