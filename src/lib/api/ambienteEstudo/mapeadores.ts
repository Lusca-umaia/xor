import 'server-only'

import type {
  AmbienteEstudo,
  Atividade,
  Chat,
  Citacao,
  ConfigSimulado,
  CorAmbiente,
  CorrecaoDiscursiva,
  DificuldadeConfig,
  Flashcard,
  FormatoResumo,
  Material,
  MensagemChat,
  ModoChat,
  Questao,
  Resposta,
  ResultadoSimulado,
  Resumo,
  Simulado,
  StatusGeracao,
  TentativaAtividade,
  TentativaSimulado,
  TipoAtividade,
  TipoMaterial
} from '@/@types/AmbienteEstudo'

// Linhas do banco (snake_case) → tipos do front (camelCase), que são o
// contrato da API. Cada SELECT usa as colunas listadas aqui.

export const COLUNAS_AMBIENTE =
  'id, nome, descricao, cor, origem, disciplina_codigo, arquivado, criado_em, atualizado_em'

export interface AmbienteRow {
  id: string
  nome: string
  descricao: string | null
  cor: CorAmbiente
  origem: AmbienteEstudo['origem']
  disciplina_codigo: string | null
  arquivado: boolean
  criado_em: string
  atualizado_em: string
}

export const mapearAmbiente = (row: AmbienteRow): AmbienteEstudo => ({
  id: row.id,
  nome: row.nome,
  descricao: row.descricao,
  cor: row.cor,
  origem: row.origem,
  disciplinaCodigo: row.disciplina_codigo,
  arquivado: row.arquivado,
  criadoEm: row.criado_em,
  atualizadoEm: row.atualizado_em
})

export const COLUNAS_MATERIAL =
  'id, ambiente_id, nome, tipo, tamanho_bytes, paginas, status, mensagem_erro, origem, conteudo_texto, storage_path, criado_em'

export interface MaterialRow {
  id: string
  ambiente_id: string
  nome: string
  tipo: TipoMaterial
  tamanho_bytes: number
  paginas: number | null
  status: Material['status']
  mensagem_erro: string | null
  origem: Material['origem']
  conteudo_texto: string | null
  storage_path: string | null
  criado_em: string
}

export const mapearMaterial = (row: MaterialRow): Material => ({
  id: row.id,
  ambienteId: row.ambiente_id,
  nome: row.nome,
  tipo: row.tipo,
  tamanhoBytes: Number(row.tamanho_bytes),
  paginas: row.paginas,
  status: row.status,
  mensagemErro: row.mensagem_erro,
  origem: row.origem,
  conteudoTexto: row.conteudo_texto,
  criadoEm: row.criado_em
})

export const COLUNAS_CHAT =
  'id, ambiente_id, titulo, material_ids, modo, fixado, criado_em, atualizado_em'

export interface ChatRow {
  id: string
  ambiente_id: string
  titulo: string
  material_ids: string[]
  modo: ModoChat
  fixado: boolean
  criado_em: string
  atualizado_em: string
}

export const mapearChat = (row: ChatRow): Chat => ({
  id: row.id,
  ambienteId: row.ambiente_id,
  titulo: row.titulo,
  materialIds: row.material_ids ?? [],
  modo: row.modo,
  fixado: row.fixado,
  criadoEm: row.criado_em,
  atualizadoEm: row.atualizado_em
})

export const COLUNAS_MENSAGEM =
  'id, chat_id, papel, conteudo, anexo_ids, citacoes, fora_do_material, status, criado_em'

export interface MensagemRow {
  id: string
  chat_id: string
  papel: MensagemChat['papel']
  conteudo: string
  anexo_ids: string[]
  citacoes: Citacao[]
  fora_do_material: boolean
  status: MensagemChat['status']
  criado_em: string
}

export const mapearMensagem = (row: MensagemRow): MensagemChat => ({
  id: row.id,
  chatId: row.chat_id,
  papel: row.papel,
  conteudo: row.conteudo,
  anexoIds: row.anexo_ids ?? [],
  citacoes: row.citacoes ?? [],
  foraDoMaterial: row.fora_do_material,
  status: row.status,
  criadoEm: row.criado_em
})

export const COLUNAS_RESUMO =
  'id, ambiente_id, titulo, formato, material_ids, conteudo, citacoes, editado_pelo_aluno, origem_chat_id, status, criado_em, atualizado_em'

export interface ResumoRow {
  id: string
  ambiente_id: string
  titulo: string
  formato: FormatoResumo
  material_ids: string[]
  conteudo: string
  citacoes: Citacao[]
  editado_pelo_aluno: boolean
  origem_chat_id: string | null
  status: StatusGeracao
  criado_em: string
  atualizado_em: string
}

export const mapearResumo = (row: ResumoRow): Resumo => ({
  id: row.id,
  ambienteId: row.ambiente_id,
  titulo: row.titulo,
  formato: row.formato,
  materialIds: row.material_ids ?? [],
  conteudo: row.conteudo,
  citacoes: row.citacoes ?? [],
  editadoPeloAluno: row.editado_pelo_aluno,
  origemChatId: row.origem_chat_id,
  status: row.status,
  criadoEm: row.criado_em,
  atualizadoEm: row.atualizado_em
})

export const COLUNAS_ATIVIDADE =
  'id, ambiente_id, titulo, tipo, material_ids, dificuldade, topico, questoes, flashcards, origem_chat_id, origem_resumo_id, status, mensagem_erro, criado_em'

export interface AtividadeRow {
  id: string
  ambiente_id: string
  titulo: string
  tipo: TipoAtividade
  material_ids: string[]
  dificuldade: DificuldadeConfig
  topico: string | null
  questoes: Questao[]
  flashcards: Flashcard[]
  origem_chat_id: string | null
  origem_resumo_id: string | null
  status: StatusGeracao
  mensagem_erro: string | null
  criado_em: string
}

export const mapearAtividade = (row: AtividadeRow): Atividade => ({
  id: row.id,
  ambienteId: row.ambiente_id,
  titulo: row.titulo,
  tipo: row.tipo,
  materialIds: row.material_ids ?? [],
  dificuldade: row.dificuldade,
  topico: row.topico,
  questoes: row.questoes ?? [],
  flashcards: row.flashcards ?? [],
  origemChatId: row.origem_chat_id,
  origemResumoId: row.origem_resumo_id,
  status: row.status,
  mensagemErro: row.mensagem_erro,
  criadoEm: row.criado_em
})

export const COLUNAS_TENTATIVA_ATIVIDADE =
  'id, atividade_id, respostas, correcoes_discursivas, confirmadas, indice_atual, acertos, total, iniciada_em, concluida_em'

export interface TentativaAtividadeRow {
  id: string
  atividade_id: string
  respostas: Record<string, Resposta>
  correcoes_discursivas: Record<string, CorrecaoDiscursiva>
  confirmadas: string[]
  indice_atual: number
  acertos: number
  total: number
  iniciada_em: string
  concluida_em: string | null
}

export const mapearTentativaAtividade = (
  row: TentativaAtividadeRow
): TentativaAtividade => ({
  id: row.id,
  atividadeId: row.atividade_id,
  respostas: row.respostas ?? {},
  correcoesDiscursivas: row.correcoes_discursivas ?? {},
  confirmadas: row.confirmadas ?? [],
  indiceAtual: row.indice_atual,
  acertos: row.acertos,
  total: row.total,
  iniciadaEm: row.iniciada_em,
  concluidaEm: row.concluida_em
})

export const COLUNAS_SIMULADO =
  'id, ambiente_id, titulo, config, questoes, status, criado_em'

export interface SimuladoRow {
  id: string
  ambiente_id: string
  titulo: string
  config: ConfigSimulado
  questoes: Questao[]
  status: StatusGeracao
  criado_em: string
}

export const mapearSimulado = (row: SimuladoRow): Simulado => ({
  id: row.id,
  ambienteId: row.ambiente_id,
  titulo: row.titulo,
  config: row.config,
  questoes: row.questoes ?? [],
  status: row.status,
  criadoEm: row.criado_em
})

export const COLUNAS_TENTATIVA_SIMULADO =
  'id, simulado_id, iniciada_em, prazo_final, entregue_em, entrega_automatica, respostas, marcadas, tempo_por_questao, resultado'

export interface TentativaSimuladoRow {
  id: string
  simulado_id: string
  iniciada_em: string
  prazo_final: string | null
  entregue_em: string | null
  entrega_automatica: boolean
  respostas: Record<string, Resposta>
  marcadas: string[]
  tempo_por_questao: Record<string, number>
  resultado: ResultadoSimulado | null
}

export const mapearTentativaSimulado = (
  row: TentativaSimuladoRow
): TentativaSimulado => ({
  id: row.id,
  simuladoId: row.simulado_id,
  iniciadaEm: row.iniciada_em,
  prazoFinal: row.prazo_final,
  entregueEm: row.entregue_em,
  entregaAutomatica: row.entrega_automatica,
  respostas: row.respostas ?? {},
  marcadasParaRevisao: row.marcadas ?? [],
  tempoPorQuestaoSeg: row.tempo_por_questao ?? {},
  resultado: row.resultado
})
