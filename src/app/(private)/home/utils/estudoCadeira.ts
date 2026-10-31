import type { Atividade as AtividadeAgenda, Evento } from '@/@types/Academico'
import type { ItemRetomar, ResumoCadeira } from '@/@types/AmbienteEstudo'
import { lerData } from '@/utils/academico'
import { nivelDe } from '@/utils/ambienteEstudo/gamificacao'

// O que a tela inicial mostra de cada cadeira: uma linha de situação e, no
// máximo, um próximo passo. Junta o ambiente de estudo (servidor) com a
// agenda da vida acadêmica (navegador), ligados pelo código da disciplina.

const DIA_MS = 86_400_000
const JANELA_PROVA_DIAS = 14
const JANELA_PRAZO_DIAS = 7
// Prazos até aqui passam na frente do que o ambiente sugere.
const PRAZO_URGENTE_DIAS = 2

export type TipoPasso =
  | 'PROVA'
  | 'PRAZO'
  | 'RETOMAR'
  | 'FLASHCARDS'
  | 'TOPICO'
  | 'COMECAR'

export interface ProximoPasso {
  tipo: TipoPasso
  texto: string
  href: string
  urgente: boolean
}

export const hrefRetomar = (ambienteId: string, item: ItemRetomar) => {
  const base = `/ambientes/${ambienteId}`
  switch (item.tipo) {
    case 'SIMULADO':
      return `${base}/simulados/${item.simuladoId}/tentativas/${item.id}`
    case 'ATIVIDADE':
      return `${base}/atividades/${item.id}`
    case 'CHAT':
      return `${base}/chats/${item.id}`
    case 'RESUMO':
      return `${base}/resumos/${item.id}`
  }
}

const ROTULO_RETOMAR: Record<ItemRetomar['tipo'], string> = {
  SIMULADO: 'Simulado',
  ATIVIDADE: 'Atividade',
  CHAT: 'Chat',
  RESUMO: 'Resumo'
}

export const rotuloRetomar = (item: ItemRetomar) =>
  item.emAndamento
    ? `${ROTULO_RETOMAR[item.tipo]} em andamento`
    : ROTULO_RETOMAR[item.tipo]

/** Dias de hoje até a data (YYYY-MM-DD); negativo se já passou. */
const diasAte = (chave: string, hoje: Date) => {
  const inicioHoje = new Date(hoje)
  inicioHoje.setHours(0, 0, 0, 0)
  return Math.round((lerData(chave).getTime() - inicioHoje.getTime()) / DIA_MS)
}

const quandoFalta = (dias: number) =>
  dias === 0 ? 'hoje' : dias === 1 ? 'amanhã' : `em ${dias} dias`

const quandoVence = (dias: number) =>
  dias < 0
    ? `venceu há ${-dias} ${dias === -1 ? 'dia' : 'dias'}`
    : `vence ${quandoFalta(dias)}`

/** "Nível 3 · estudou ontem", ou o convite quando ainda não há estudo. */
export function situacaoDoEstudo(resumo: ResumoCadeira, hoje = new Date()) {
  if (!resumo.ultimoEstudoEm) return 'Ambiente criado, ainda sem estudo'
  const inicioHoje = new Date(hoje)
  inicioHoje.setHours(0, 0, 0, 0)
  const ultimo = new Date(resumo.ultimoEstudoEm)
  ultimo.setHours(0, 0, 0, 0)
  const dias = Math.round((inicioHoje.getTime() - ultimo.getTime()) / DIA_MS)
  const quando =
    dias <= 0
      ? 'estudou hoje'
      : dias === 1
        ? 'estudou ontem'
        : dias < 7
          ? `estudou há ${dias} dias`
          : 'sem estudar há mais de uma semana'
  return `Nível ${nivelDe(resumo.xp).nivel} · ${quando}`
}

/** O passo mais útil agora para a cadeira, ou nada. */
export function proximoPasso({
  codigo,
  resumo,
  eventos,
  atividades,
  hoje = new Date()
}: {
  codigo: string
  resumo?: ResumoCadeira
  eventos: Evento[]
  atividades: AtividadeAgenda[]
  hoje?: Date
}): ProximoPasso | null {
  const base = resumo ? `/ambientes/${resumo.ambienteId}` : null

  const [prova] = eventos
    .filter((e) => e.codigo === codigo && e.tipo === 'PROVA')
    .map((e) => ({ ...e, dias: diasAte(e.data, hoje) }))
    .filter(({ dias }) => dias >= 0 && dias <= JANELA_PROVA_DIAS)
    .sort((a, b) => a.dias - b.dias)
  if (prova) {
    return {
      tipo: 'PROVA',
      texto: base
        ? `Prova ${quandoFalta(prova.dias)} · fazer um simulado`
        : `Prova ${quandoFalta(prova.dias)}`,
      href: base ? `${base}/simulados/novo` : '/calendario',
      urgente: prova.dias <= 3
    }
  }

  const [prazo] = atividades
    .filter((a) => a.codigo === codigo && !a.feita)
    .map((a) => ({ ...a, dias: diasAte(a.prazo, hoje) }))
    .filter(
      ({ dias }) => dias >= -JANELA_PRAZO_DIAS && dias <= JANELA_PRAZO_DIAS
    )
    .sort((a, b) => a.dias - b.dias)
  const passoPrazo = prazo && {
    tipo: 'PRAZO' as const,
    texto: `${prazo.titulo} ${quandoVence(prazo.dias)}`,
    href: '/atividades',
    urgente: prazo.dias <= PRAZO_URGENTE_DIAS
  }
  if (passoPrazo?.urgente) return passoPrazo

  if (resumo && base) {
    const emAndamento = resumo.retomar.find((item) => item.emAndamento)
    if (emAndamento) {
      return {
        tipo: 'RETOMAR',
        texto: `Continuar: ${emAndamento.titulo}`,
        href: hrefRetomar(resumo.ambienteId, emAndamento),
        urgente: false
      }
    }
    if (resumo.flashcardsPendentes > 0) {
      const n = resumo.flashcardsPendentes
      return {
        tipo: 'FLASHCARDS',
        texto: `${n} ${n === 1 ? 'flashcard' : 'flashcards'} para revisar`,
        href: `${base}/atividades`,
        urgente: false
      }
    }
    if (resumo.topicoFraco) {
      const { topico, taxa } = resumo.topicoFraco
      return {
        tipo: 'TOPICO',
        texto: `Revisar ${topico} (${Math.round(taxa * 100)}% de acerto)`,
        href: base,
        urgente: false
      }
    }
  }

  if (passoPrazo) return passoPrazo

  if (resumo && base && !resumo.ultimoEstudoEm) {
    return {
      tipo: 'COMECAR',
      texto: 'Envie um material para começar',
      href: `${base}/materiais`,
      urgente: false
    }
  }
  return null
}
