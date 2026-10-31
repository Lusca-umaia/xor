import {
  DificuldadeConfig,
  FormatoResumo,
  MotivoReporte,
  TipoAtividade,
  TipoMaterial,
  TipoQuestao
} from '@/@types/AmbienteEstudo'

export const ROTULO_TIPO_ATIVIDADE: Record<TipoAtividade, string> = {
  QUIZ: 'Quiz rápido',
  VERDADEIRO_FALSO: 'Verdadeiro ou falso',
  LACUNAS: 'Complete as lacunas',
  DISCURSIVA: 'Discursiva com rubrica',
  FLASHCARDS: 'Flashcards'
}

export const DESCRICAO_TIPO_ATIVIDADE: Record<TipoAtividade, string> = {
  QUIZ: 'Múltipla escolha com feedback imediato e explicação do erro.',
  VERDADEIRO_FALSO: 'Afirmações para julgar, com justificativa.',
  LACUNAS: 'Complete as frases com os termos corretos.',
  DISCURSIVA: 'Resposta aberta corrigida por critérios visíveis.',
  FLASHCARDS: 'Cartões frente e verso com revisão espaçada.'
}

/** Tipo de questão gerado para cada tipo de atividade. */
export const TIPO_QUESTAO_DA_ATIVIDADE: Record<
  Exclude<TipoAtividade, 'FLASHCARDS'>,
  TipoQuestao
> = {
  QUIZ: 'MULTIPLA_ESCOLHA',
  VERDADEIRO_FALSO: 'VERDADEIRO_FALSO',
  LACUNAS: 'LACUNAS',
  DISCURSIVA: 'DISCURSIVA'
}

export const ROTULO_TIPO_QUESTAO: Record<TipoQuestao, string> = {
  MULTIPLA_ESCOLHA: 'Múltipla escolha',
  VERDADEIRO_FALSO: 'Verdadeiro ou falso',
  LACUNAS: 'Lacunas',
  DISCURSIVA: 'Discursiva'
}

export const ROTULO_FORMATO_RESUMO: Record<FormatoResumo, string> = {
  TOPICOS: 'Tópicos',
  CORRIDO: 'Texto corrido',
  GLOSSARIO: 'Glossário',
  MAPA_MENTAL: 'Mapa mental'
}

export const DESCRICAO_FORMATO_RESUMO: Record<FormatoResumo, string> = {
  TOPICOS: 'Pontos principais organizados por assunto.',
  CORRIDO: 'Texto contínuo, bom para leitura de revisão.',
  GLOSSARIO: 'Termos e definições, com busca.',
  MAPA_MENTAL: 'Diagrama com as relações entre os conceitos.'
}

export const ROTULO_DIFICULDADE: Record<DificuldadeConfig, string> = {
  FACIL: 'Fácil',
  MEDIA: 'Média',
  DIFICIL: 'Difícil',
  MISTA: 'Mista'
}

export const ROTULO_TIPO_MATERIAL: Record<TipoMaterial, string> = {
  PDF: 'PDF',
  DOCX: 'Word',
  PPTX: 'Slides',
  IMAGEM: 'Imagem',
  TEXTO: 'Texto'
}

export const ROTULO_MOTIVO_REPORTE: Record<MotivoReporte, string> = {
  INCORRETO: 'Informação incorreta',
  SEM_FONTE: 'Não está no material / fonte errada',
  ENVIESADO: 'Conteúdo enviesado',
  OFENSIVO: 'Conteúdo ofensivo',
  OUTRO: 'Outro motivo'
}
