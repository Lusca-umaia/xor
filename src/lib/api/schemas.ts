import { z } from 'zod'

const nota = z.number().min(0, 'Nota mínima é 0').max(10, 'Nota máxima é 10')
const idDisciplina = z.number().int().positive()
const semestre = z.number().int().min(1).max(30)

export const codigoDisciplina = z
  .string()
  .trim()
  .min(1, 'Código é obrigatório')
  .max(40)
  .transform((codigo) => codigo.toUpperCase())

export const caraterSchema = z.enum(['OBRIGATORIA', 'OPTATIVA'])

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Email inválido'),
  senha: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres').max(72)
})

export const novaDisciplinaSchema = z.object({
  codigo: codigoDisciplina,
  nome: z.string().trim().min(1, 'Nome é obrigatório').max(200),
  cargaHoraria: z.coerce
    .number({ invalid_type_error: 'Informe a carga horária' })
    .int()
    .min(0)
    .max(2000),
  carater: caraterSchema,
  semestre: semestre.nullable().default(null)
})

const tentativaCadastroSchema = z.object({
  codigo: codigoDisciplina,
  status: z.enum(['ANDAMENTO', 'APROVADA', 'REPROVADA', 'TRANCADA']),
  nota: nota.nullable().default(null),
  periodo: z.string().trim().max(20).nullable().default(null),
  semestre: semestre.nullable().default(null)
})

export const cadastroSchema = z
  .object({
    nome: z.string().trim().min(1, 'Nome é obrigatório').max(120),
    email: z.string().trim().toLowerCase().email('Email inválido'),
    senha: z
      .string()
      .min(6, 'A senha deve ter pelo menos 6 caracteres')
      .max(72, 'A senha deve ter no máximo 72 caracteres'),
    matricula: z.string().trim().min(1, 'Matrícula é obrigatória').max(30),
    cursoNome: z.string().trim().min(1, 'Informe o curso').max(200),
    cursoCodigo: z.string().trim().max(30).nullable().default(null),
    semestreAtual: z.coerce.number().int().min(1).max(30),
    cargaOptativaExigida: z.number().int().min(0).nullable().default(null),
    disciplinas: z.array(novaDisciplinaSchema).max(300),
    tentativas: z.array(tentativaCadastroSchema).max(500)
  })
  .superRefine(({ disciplinas, tentativas }, ctx) => {
    const codigos = new Set(disciplinas.map(({ codigo }) => codigo))
    const unicas = new Set<string>()

    for (const { codigo, status } of tentativas) {
      if (!codigos.has(codigo)) {
        ctx.addIssue({
          code: 'custom',
          path: ['tentativas'],
          message: `Disciplina ${codigo} não informada`
        })
        return
      }

      // Uma aprovação e um andamento por disciplina, no máximo.
      if (status === 'APROVADA' || status === 'ANDAMENTO') {
        const chave = `${codigo}:${status}`
        if (unicas.has(chave)) {
          ctx.addIssue({
            code: 'custom',
            path: ['tentativas'],
            message: `Disciplina ${codigo} repetida`
          })
          return
        }
        unicas.add(chave)
      }
    }
  })

export const statusResultadoSchema = z.enum([
  'APROVADA',
  'REPROVADA',
  'TRANCADA'
])

const resultadoComNota = <T extends z.ZodRawShape>(shape: T) =>
  z
    .object({
      ...shape,
      status: statusResultadoSchema,
      nota: nota.nullable().default(null)
    })
    .refine(({ status, nota }) => status === 'TRANCADA' || nota !== null, {
      message: 'Informe a nota da disciplina',
      path: ['nota']
    })

export const encerrarSemestreSchema = z.object({
  resultados: z.array(resultadoComNota({ disciplinaId: idDisciplina })).max(30),
  proximasDisciplinas: z.array(idDisciplina).max(30).default([])
})

// Situação atual de uma disciplina (edição livre pelo aluno).
export const situacaoSchema = z.object({
  status: z.enum([
    'PENDENTE',
    'ANDAMENTO',
    'APROVADA',
    'REPROVADA',
    'TRANCADA'
  ]),
  nota: nota.nullable().default(null),
  periodo: z.string().trim().max(20).nullable().default(null)
})

export const criarDisciplinaSchema = novaDisciplinaSchema.extend({
  situacao: situacaoSchema.optional()
})

export type CadastroInput = z.input<typeof cadastroSchema>
export type NovaDisciplinaInput = z.input<typeof novaDisciplinaSchema>
export type CriarDisciplinaInput = z.input<typeof criarDisciplinaSchema>
export type EncerrarSemestreInput = z.input<typeof encerrarSemestreSchema>
export type SituacaoInput = z.input<typeof situacaoSchema>

// Meu perfil -----------------------------------------------------

export const perfilSchema = z.object({
  nome: z.string().trim().min(1, 'Nome é obrigatório').max(120),
  matricula: z.string().trim().min(1, 'Matrícula é obrigatória').max(30),
  cursoNome: z.string().trim().min(1, 'Informe o curso').max(200),
  semestreAtual: z.coerce
    .number({ invalid_type_error: 'Informe o semestre' })
    .int('Informe um número inteiro')
    .min(1, 'Semestre mínimo é 1')
    .max(30, 'Semestre máximo é 30'),
  cargaOptativaExigida: z.coerce
    .number({ invalid_type_error: 'Informe a carga horária' })
    .int('Informe um número inteiro')
    .min(0, 'Carga horária não pode ser negativa')
    .max(5000)
    .nullable()
    .default(null)
})

const novaSenha = z
  .string()
  .min(6, 'A senha deve ter pelo menos 6 caracteres')
  .max(72, 'A senha deve ter no máximo 72 caracteres')

export const alterarEmailSchema = z.object({
  email: z.string().trim().toLowerCase().email('Email inválido'),
  senhaAtual: z.string().min(1, 'Informe sua senha atual').max(72)
})

export const alterarSenhaSchema = z.object({
  senhaAtual: z.string().min(1, 'Informe sua senha atual').max(72),
  novaSenha
})

export type PerfilInput = z.input<typeof perfilSchema>
export type AlterarEmailInput = z.input<typeof alterarEmailSchema>
export type AlterarSenhaInput = z.input<typeof alterarSenhaSchema>

// Questionários ---------------------------------------------------

// Texto opcional: vazio vira null.
const textoOpcional = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .nullable()
    .default(null)
    .transform((texto) => texto || null)

export const dificuldadeSchema = z.enum(['FACIL', 'MEDIA', 'DIFICIL'])

export const questaoSchema = z
  .object({
    enunciado: z
      .string()
      .trim()
      .min(1, 'Escreva o enunciado da questão')
      .max(4000),
    alternativas: z
      .array(z.string().trim().min(1, 'Preencha a alternativa').max(1000))
      .min(2, 'A questão precisa de pelo menos 2 alternativas')
      .max(6, 'A questão pode ter no máximo 6 alternativas'),
    correta: z
      .number({
        required_error: 'Marque a alternativa correta',
        invalid_type_error: 'Marque a alternativa correta'
      })
      .int()
      .min(0),
    explicacao: textoOpcional(4000)
  })
  .refine(({ alternativas, correta }) => correta < alternativas.length, {
    message: 'Marque a alternativa correta',
    path: ['correta']
  })

export const questionarioSchema = z.object({
  titulo: z.string().trim().min(1, 'Dê um título ao questionário').max(200),
  descricao: textoOpcional(1000),
  disciplinaId: idDisciplina.nullable().default(null),
  dificuldade: dificuldadeSchema.nullable().default(null),
  origem: z.enum(['MANUAL', 'IA']).default('MANUAL'),
  questoes: z
    .array(questaoSchema)
    .min(1, 'Adicione pelo menos uma questão')
    .max(100, 'O questionário pode ter no máximo 100 questões')
})

export const resolucaoSchema = z.object({
  respostas: z
    .array(
      z.object({
        questaoId: z.number().int().positive(),
        alternativa: z.number().int().min(0).max(5).nullable()
      })
    )
    .max(100),
  duracaoSegundos: z.number().int().min(0).max(86400).nullable().default(null)
})

// Parâmetros para a IA sugerir questões (revisadas antes de salvar).
export const gerarQuestoesSchema = z.object({
  tema: z.string().trim().min(1, 'Informe o tema das questões').max(200),
  conteudo: textoOpcional(20000),
  instrucoes: textoOpcional(1000),
  disciplinaId: idDisciplina.nullable().default(null),
  quantidade: z.coerce
    .number({ invalid_type_error: 'Informe a quantidade' })
    .int()
    .min(1, 'Gere pelo menos 1 questão')
    .max(20, 'Gere no máximo 20 questões por vez'),
  alternativas: z.coerce.number().int().min(2).max(6).default(5),
  dificuldade: dificuldadeSchema.default('MEDIA')
})

export type QuestaoInput = z.input<typeof questaoSchema>
export type QuestionarioInput = z.input<typeof questionarioSchema>
export type ResolucaoInput = z.input<typeof resolucaoSchema>
export type GerarQuestoesInput = z.input<typeof gerarQuestoesSchema>

// Pomodoro --------------------------------------------------------

export const sessaoFocoSchema = z
  .object({
    disciplinaId: idDisciplina.nullable().default(null),
    tarefa: z
      .string()
      .trim()
      .max(200)
      .nullable()
      .default(null)
      .transform((tarefa) => tarefa || null),
    duracaoSegundos: z
      .number()
      .int()
      .min(60)
      .max(4 * 60 * 60),
    iniciadaEm: z.string().datetime({ offset: true }),
    concluidaEm: z.string().datetime({ offset: true })
  })
  .refine(
    ({ iniciadaEm, concluidaEm }) =>
      Date.parse(concluidaEm) >= Date.parse(iniciadaEm) &&
      // Tolera pequena diferença de relógio do navegador.
      Date.parse(concluidaEm) <= Date.now() + 5 * 60 * 1000,
    { message: 'Horário da sessão inválido', path: ['concluidaEm'] }
  )

export type SessaoFocoInput = z.input<typeof sessaoFocoSchema>
