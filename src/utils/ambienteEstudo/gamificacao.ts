import type {
  AtividadeListagem,
  EventoXp,
  Chat,
  Material,
  Resumo,
  SimuladoListagem,
  TentativaSimulado
} from '@/@types/AmbienteEstudo'

// Gamificação da visão geral. O XP e os dias de estudo vêm do registro de
// eventos do servidor (xp_eventos): cada ação conta uma vez, nunca é retirada
// e há um limite por dia. Missões, conquistas e domínio por tópico são
// derivados do estado atual do ambiente.

export interface DadosGamificacao {
  materiais: Material[]
  chats: Chat[]
  resumos: Resumo[]
  atividades: AtividadeListagem[]
  simulados: SimuladoListagem[]
}

const DIA_MS = 86_400_000

// ---------- XP e nível ----------

// Espelho das regras do servidor (src/lib/api/ambienteEstudo/xp.ts).
export const REGRAS_XP = [
  { acao: 'Material processado', xp: '+20' },
  { acao: 'Resposta da IA no chat', xp: '+2' },
  { acao: 'Resumo gerado', xp: '+15' },
  { acao: 'Atividade concluída (1ª vez)', xp: '+10' },
  { acao: 'Cada acerto nessa conclusão', xp: '+5' },
  { acao: 'Revisão de flashcard (por cartão, por dia)', xp: '+2' },
  { acao: 'Simulado entregue (refeito: +10)', xp: '+30' },
  { acao: 'Cada ponto da nota (refeito: +2)', xp: '+5' }
] as const

export const tentativasEntregues = (simulados: SimuladoListagem[]) =>
  simulados
    .flatMap(({ id, titulo, tentativas }) =>
      tentativas
        .filter((t): t is TentativaSimulado & { entregueEm: string } =>
          Boolean(t.entregueEm && t.resultado)
        )
        .map((tentativa) => ({ simuladoId: id, titulo, tentativa }))
    )
    .sort((a, b) =>
      a.tentativa.entregueEm.localeCompare(b.tentativa.entregueEm)
    )

const TITULOS = [
  'Iniciante',
  'Curioso',
  'Dedicado',
  'Estudioso',
  'Avançado',
  'Especialista',
  'Mestre'
]

/** Nível n começa em 100·n·(n−1)/2 XP: 0, 100, 300, 600, 1000... */
export function nivelDe(xp: number) {
  let nivel = 1
  while (xp >= (100 * (nivel + 1) * nivel) / 2) nivel++
  const inicio = (100 * nivel * (nivel - 1)) / 2
  const proximo = (100 * (nivel + 1) * nivel) / 2
  return {
    nivel,
    titulo: TITULOS[Math.min(nivel, TITULOS.length) - 1],
    xpNoNivel: xp - inicio,
    xpDoNivel: proximo - inicio,
    faltam: proximo - xp
  }
}

// ---------- Dias de estudo e sequência ----------

const chaveDia = (data: Date) =>
  `${data.getFullYear()}-${data.getMonth()}-${data.getDate()}`

/** Dias (no fuso do aluno) em que ele ganhou XP no ambiente. */
export const diasDeEstudo = (eventos: EventoXp[]): Set<string> =>
  new Set(eventos.map(({ criadoEm }) => chaveDia(new Date(criadoEm))))

/** Flashcards revisados: cada revisão registrada vale 2 XP. */
export const revisoesDeFlashcard = (xpDeFlashcard = 0) =>
  Math.floor(xpDeFlashcard / 2)

/**
 * Dias seguidos com estudo. Se hoje ainda não teve estudo, a sequência que
 * terminou ontem continua valendo (e o aluno é lembrado de mantê-la).
 */
export function sequenciaDeDias(dias: Set<string>, hoje = new Date()) {
  const estudouHoje = dias.has(chaveDia(hoje))
  let sequencia = 0
  const dia = new Date(hoje)
  if (!estudouHoje) dia.setDate(dia.getDate() - 1)
  while (dias.has(chaveDia(dia))) {
    sequencia++
    dia.setDate(dia.getDate() - 1)
  }
  return { sequencia, estudouHoje }
}

/** Os últimos 7 dias, do mais antigo para hoje. */
export function semana(dias: Set<string>, hoje = new Date()) {
  return Array.from({ length: 7 }, (_, i) => {
    const dia = new Date(hoje)
    dia.setDate(dia.getDate() - (6 - i))
    return {
      rotulo: dia
        .toLocaleDateString('pt-BR', { weekday: 'narrow' })
        .toUpperCase(),
      data: dia.toLocaleDateString('pt-BR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
      }),
      estudou: dias.has(chaveDia(dia)),
      hoje: i === 6
    }
  })
}

// ---------- Domínio por tópico ----------

export interface DominioTopico {
  topico: string
  acertos: number
  total: number
  taxa: number
}

/** Acerto por tópico em todos os simulados entregues, do mais fraco ao mais forte. */
export function dominioPorTopico(simulados: SimuladoListagem[]) {
  const mapa = new Map<string, { acertos: number; total: number }>()
  for (const { tentativa } of tentativasEntregues(simulados)) {
    for (const { topico, acertos, total } of tentativa.resultado?.porTopico ??
      []) {
      const atual = mapa.get(topico) ?? { acertos: 0, total: 0 }
      mapa.set(topico, {
        acertos: atual.acertos + acertos,
        total: atual.total + total
      })
    }
  }
  return [...mapa.entries()]
    .filter(([, { total }]) => total > 0)
    .map(([topico, { acertos, total }]) => ({
      topico,
      acertos,
      total,
      taxa: acertos / total
    }))
    .sort((a, b) => a.taxa - b.taxa || b.total - a.total)
}

// ---------- Conquistas ----------

export interface Conquista {
  id: string
  nome: string
  descricao: string
  atual: number
  meta: number
  desbloqueada: boolean
}

export function conquistas(
  dados: DadosGamificacao,
  { sequencia, revisoes }: { sequencia: number; revisoes: number }
): Conquista[] {
  const entregues = tentativasEntregues(dados.simulados)
  const notas = entregues.map(
    ({ tentativa }) => tentativa.resultado?.notaFinal ?? 0
  )
  const melhorou = notas.some((nota, i) => i > 0 && nota > notas[i - 1])
  const lista = [
    {
      id: 'primeiro-material',
      nome: 'Primeiro passo',
      descricao: 'Envie o primeiro material',
      atual: dados.materiais.filter(({ status }) => status === 'PRONTO').length,
      meta: 1
    },
    {
      id: 'biblioteca',
      nome: 'Bibliotecário',
      descricao: 'Tenha 5 materiais na biblioteca',
      atual: dados.materiais.filter(({ status }) => status === 'PRONTO').length,
      meta: 5
    },
    {
      id: 'curioso',
      nome: 'Curioso',
      descricao: 'Abra 5 chats com a IA',
      atual: dados.chats.length,
      meta: 5
    },
    {
      id: 'praticante',
      nome: 'Praticante',
      descricao: 'Conclua 5 atividades',
      atual: dados.atividades.filter(({ melhorResultado }) => melhorResultado)
        .length,
      meta: 5
    },
    {
      id: 'memoria',
      nome: 'Memória afiada',
      descricao: 'Revise 20 flashcards',
      atual: revisoes,
      meta: 20
    },
    {
      id: 'simulado',
      nome: 'Prova de fogo',
      descricao: 'Entregue um simulado',
      atual: entregues.length,
      meta: 1
    },
    {
      id: 'excelencia',
      nome: 'Excelência',
      descricao: 'Tire 9 ou mais em um simulado',
      atual: notas.some((nota) => nota >= 9) ? 1 : 0,
      meta: 1
    },
    {
      id: 'superacao',
      nome: 'Superação',
      descricao: 'Melhore a nota de um simulado para o seguinte',
      atual: melhorou ? 1 : 0,
      meta: 1
    },
    {
      id: 'constancia',
      nome: 'Constância',
      descricao: 'Estude 3 dias seguidos',
      atual: sequencia,
      meta: 3
    }
  ]
  return lista.map((conquista) => ({
    ...conquista,
    atual: Math.min(conquista.atual, conquista.meta),
    desbloqueada: conquista.atual >= conquista.meta
  }))
}

// ---------- Missões do dia ----------

export interface Missao {
  id: string
  titulo: string
  detalhe: string
  href: string
  concluida: boolean
}

/**
 * Até 3 missões, escolhidas pelo estado do ambiente, da mais para a menos
 * importante. Missões concluídas hoje continuam na lista, marcadas.
 */
export function missoesDoDia(
  dados: DadosGamificacao,
  base: string,
  { estudouHoje, sequencia }: { estudouHoje: boolean; sequencia: number },
  hoje = new Date()
): Missao[] {
  const missoes: Missao[] = []
  const prontos = dados.materiais.filter(({ status }) => status === 'PRONTO')
  const hojeChave = chaveDia(hoje)

  if (prontos.length === 0) {
    missoes.push({
      id: 'material',
      titulo: 'Envie o primeiro material',
      detalhe: 'A IA usa seus materiais em tudo: chats, resumos e questões.',
      href: `${base}/materiais`,
      concluida: false
    })
  }

  const emAndamento =
    dados.simulados
      .flatMap((simulado) =>
        simulado.tentativas
          .filter(({ entregueEm }) => !entregueEm)
          .map((tentativa) => ({
            titulo: simulado.titulo,
            href: `${base}/simulados/${simulado.id}/tentativas/${tentativa.id}`
          }))
      )
      .at(0) ??
    dados.atividades
      .filter(({ tentativaEmAndamento }) => tentativaEmAndamento)
      .map((atividade) => ({
        titulo: atividade.titulo,
        href: `${base}/atividades/${atividade.id}`
      }))
      .at(0)
  if (emAndamento) {
    missoes.push({
      id: 'terminar',
      titulo: `Termine: ${emAndamento.titulo}`,
      detalhe: 'Você parou no meio. Falta pouco!',
      href: emAndamento.href,
      concluida: false
    })
  }

  const comCartoes = dados.atividades.filter(
    ({ tipo, flashcards }) => tipo === 'FLASHCARDS' && flashcards.length > 0
  )
  if (comCartoes.length > 0) {
    const pendentes = comCartoes.reduce(
      (soma, { flashcardsPendentes }) => soma + flashcardsPendentes,
      0
    )
    const maisPendente = [...comCartoes].sort(
      (a, b) => b.flashcardsPendentes - a.flashcardsPendentes
    )[0]
    missoes.push({
      id: 'revisao',
      titulo:
        pendentes > 0
          ? `Revise ${pendentes} ${pendentes === 1 ? 'flashcard' : 'flashcards'}`
          : 'Revisão do dia em dia',
      detalhe:
        pendentes > 0
          ? 'Revisão espaçada: revisar na hora certa fixa o conteúdo.'
          : 'Nenhum cartão pendente. Volte amanhã!',
      href:
        pendentes > 0
          ? `${base}/atividades/${maisPendente.id}?modo=pendentes`
          : `${base}/atividades`,
      concluida: pendentes === 0
    })
  }

  const maisFraco = dominioPorTopico(dados.simulados).find(
    ({ taxa }) => taxa < 0.7
  )
  if (maisFraco) {
    missoes.push({
      id: 'reforco',
      titulo: `Pratique ${maisFraco.topico}`,
      detalhe: `Seu acerto neste tópico está em ${Math.round(maisFraco.taxa * 100)}%.`,
      href: `${base}/atividades?novo=1&topico=${encodeURIComponent(maisFraco.topico)}`,
      concluida: false
    })
  }

  if (prontos.length > 0) {
    const entregues = tentativasEntregues(dados.simulados)
    const ultima = entregues.at(-1)?.tentativa.entregueEm
    const fezHoje = ultima && chaveDia(new Date(ultima)) === hojeChave
    const recente =
      ultima && hoje.getTime() - new Date(ultima).getTime() < 7 * DIA_MS
    if (fezHoje || !recente) {
      missoes.push({
        id: 'simulado',
        titulo: fezHoje ? 'Simulado feito hoje' : 'Faça um simulado',
        detalhe: fezHoje
          ? 'Ótimo! Confira o resultado por tópico.'
          : 'Testar-se com tempo marcado é a melhor preparação para a prova.',
        href: `${base}/simulados/novo`,
        concluida: Boolean(fezHoje)
      })
    }
  }

  missoes.push({
    id: 'sequencia',
    titulo: estudouHoje
      ? `Sequência de ${sequencia} ${sequencia === 1 ? 'dia' : 'dias'}`
      : sequencia > 0
        ? `Mantenha a sequência de ${sequencia} ${sequencia === 1 ? 'dia' : 'dias'}`
        : 'Estude hoje',
    detalhe: estudouHoje
      ? 'Você já estudou hoje. Volte amanhã para continuar.'
      : 'Qualquer ação conta: um chat, um resumo ou uma revisão.',
    href: `${base}/chats?novo=1`,
    concluida: estudouHoje
  })

  return missoes.slice(0, 3)
}
