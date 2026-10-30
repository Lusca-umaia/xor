import type {
  Dificuldade,
  OrigemQuestionario,
  QuestaoGerada,
  Questionario
} from '@/@types/Questionario'
import { type QuestionarioInput, questionarioSchema } from '@/lib/api/schemas'

// Estado do editor. As chaves só existem no cliente, para o React
// identificar questões e alternativas enquanto são reordenadas.
export interface AlternativaRascunho {
  chave: string
  texto: string
}

export interface QuestaoRascunho {
  chave: string
  enunciado: string
  alternativas: AlternativaRascunho[]
  correta: number | null
  explicacao: string
  geradaPorIa: boolean
}

export interface Rascunho {
  titulo: string
  descricao: string
  disciplinaId: number | null
  dificuldade: Dificuldade | null
  origem: OrigemQuestionario
  questoes: QuestaoRascunho[]
}

export const MIN_ALTERNATIVAS = 2
export const MAX_ALTERNATIVAS = 6

let contador = 0
export const novaChave = () => `k${Date.now().toString(36)}${contador++}`

const alternativa = (texto = ''): AlternativaRascunho => ({
  chave: novaChave(),
  texto
})

export const novaQuestao = (): QuestaoRascunho => ({
  chave: novaChave(),
  enunciado: '',
  alternativas: Array.from({ length: 4 }, () => alternativa()),
  correta: null,
  explicacao: '',
  geradaPorIa: false
})

export const rascunhoVazio = (): Rascunho => ({
  titulo: '',
  descricao: '',
  disciplinaId: null,
  dificuldade: null,
  origem: 'MANUAL',
  questoes: [novaQuestao()]
})

export const questaoDaIa = (questao: QuestaoGerada): QuestaoRascunho => ({
  chave: novaChave(),
  enunciado: questao.enunciado,
  alternativas: questao.alternativas.map((texto) => alternativa(texto)),
  correta: questao.correta,
  explicacao: questao.explicacao ?? '',
  geradaPorIa: true
})

export const rascunhoDoQuestionario = (q: Questionario): Rascunho => ({
  titulo: q.titulo,
  descricao: q.descricao ?? '',
  disciplinaId: q.disciplina?.id ?? null,
  dificuldade: q.dificuldade,
  origem: q.origem,
  questoes: q.questoes.map((questao) => ({
    chave: novaChave(),
    enunciado: questao.enunciado,
    alternativas: questao.alternativas.map((texto) => alternativa(texto)),
    correta: questao.correta,
    explicacao: questao.explicacao ?? '',
    geradaPorIa: false
  }))
})

export const duplicarQuestao = (q: QuestaoRascunho): QuestaoRascunho => ({
  ...q,
  chave: novaChave(),
  alternativas: q.alternativas.map(({ texto }) => alternativa(texto))
})

export const adicionarAlternativa = (q: QuestaoRascunho): QuestaoRascunho => ({
  ...q,
  alternativas: [...q.alternativas, alternativa()]
})

// Mantém a correta apontando para a mesma alternativa depois da remoção.
export const removerAlternativa = (
  q: QuestaoRascunho,
  indice: number
): QuestaoRascunho => ({
  ...q,
  alternativas: q.alternativas.filter((_, i) => i !== indice),
  correta:
    q.correta === null || q.correta === indice
      ? null
      : q.correta > indice
        ? q.correta - 1
        : q.correta
})

// Valida o rascunho com o mesmo schema da API. Os erros vêm com o
// caminho completo, ex.: "questoes.2.alternativas.1".
export function validarRascunho(r: Rascunho) {
  const resultado = questionarioSchema.safeParse({
    titulo: r.titulo,
    descricao: r.descricao,
    disciplinaId: r.disciplinaId,
    dificuldade: r.dificuldade,
    origem: r.origem,
    questoes: r.questoes.map((q) => ({
      enunciado: q.enunciado,
      alternativas: q.alternativas.map(({ texto }) => texto),
      // null faz o zod acusar "Marque a alternativa correta".
      correta: q.correta,
      explicacao: q.explicacao
    }))
  })

  if (resultado.success) {
    return { dados: resultado.data as QuestionarioInput, erros: {} }
  }

  const erros: Record<string, string> = {}
  for (const erro of resultado.error.errors) {
    erros[erro.path.join('.')] ??= erro.message
  }
  return { dados: null, erros }
}

export const questaoCompleta = (q: QuestaoRascunho) =>
  q.enunciado.trim() !== '' &&
  q.correta !== null &&
  q.alternativas.length >= MIN_ALTERNATIVAS &&
  q.alternativas.every(({ texto }) => texto.trim() !== '')
