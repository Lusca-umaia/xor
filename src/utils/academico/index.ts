import type {
  Atividade,
  Avaliacao,
  DisciplinaCurriculo,
  Evento,
  RiscoDisciplina,
  SituacaoCurricular,
  TentativaHistorico
} from '@/@types/Academico'

// ---- Parâmetros declarados (heurísticas do app, NÃO regras oficiais da UFC) ----
// Conferir com o Regulamento da Graduação da UFC antes de citar como regra oficial.
export const MEDIA_APROVACAO = 7
export const MEDIA_MINIMA_FINAL = 4
export const MEDIA_FINAL_APROVACAO = 5
// Nota necessária (nas avaliações restantes) a partir da qual o risco sobe.
export const LIMITE_RISCO_MEDIO = 6
export const LIMITE_RISCO_ALTO = 8.5
// Detector de sobrecarga: valores iniciais, ajustáveis pelo usuário.
export const LIMITE_HORAS_SEMANA = 20
export const LIMITE_ITENS_SEMANA = 4
// Revisão espaçada: dias antes da prova e horas por sessão.
export const INTERVALOS_REVISAO = [7, 3, 1]
export const HORAS_REVISAO = 2
export const HORARIO_REVISAO = '19:00'

// ---- Datas (sempre locais, formato YYYY-MM-DD) ----
export function chaveData(data: Date) {
  const mes = String(data.getMonth() + 1).padStart(2, '0')
  const dia = String(data.getDate()).padStart(2, '0')
  return `${data.getFullYear()}-${mes}-${dia}`
}

export function lerData(chave: string) {
  const [ano, mes, dia] = chave.split('-').map(Number)
  return new Date(ano, mes - 1, dia)
}

export function somarDias(data: Date, dias: number) {
  const copia = new Date(data)
  copia.setDate(copia.getDate() + dias)
  return copia
}

// Semana começa na segunda-feira.
export function inicioDaSemana(data: Date) {
  const base = new Date(data.getFullYear(), data.getMonth(), data.getDate())
  return somarDias(base, -((base.getDay() + 6) % 7))
}

// ---- Histórico, IRA e integralização ----
export function numeroDoPeriodo(periodo: string) {
  const m = periodo.match(/^(\d{4})\.(\d)$/)
  return m ? Number(m[1]) * 10 + Number(m[2]) : 0
}

export function indexarCurriculo(curriculo: DisciplinaCurriculo[]) {
  return new Map(curriculo.map((d) => [d.codigo, d]))
}

export function situacoes(
  curriculo: DisciplinaCurriculo[],
  historico: TentativaHistorico[]
) {
  const mapa = new Map<string, SituacaoCurricular>()
  for (const { codigo } of curriculo) mapa.set(codigo, 'PENDENTE')
  for (const t of historico) {
    if (t.status === 'APROVADA') mapa.set(t.codigo, 'CONCLUIDA')
    else if (t.status === 'ANDAMENTO' && mapa.get(t.codigo) !== 'CONCLUIDA')
      mapa.set(t.codigo, 'ANDAMENTO')
  }
  return mapa
}

// IRA Individual da UFC (https://prograd.ufc.br/pt/perguntas-frequentes/ira/):
//   IRA = (1 − 0,5·T/C) × (Σ Pi·Ci·Ni / Σ Pi·Ci) × 1.000
//   T = carga horária das disciplinas trancadas;
//   C = carga horária das disciplinas cursadas ou trancadas;
//   Pi = mín{6, semestre do aluno em que a disciplina i foi cursada};
//   Ci = carga horária e Ni = nota final da disciplina i.
// A fórmula está em imagem na página. O fator "1.000" foi lido como 1 (escala 0 a 10 com
// 3 casas, como a página descreve o IRA); se o fator oficial for 1000, mudar FATOR_ESCALA_IRA.
export const FATOR_ESCALA_IRA = 1
export const SEMESTRE_MAXIMO_PESO = 6
export const PENALIDADE_TRANCAMENTO = 0.5
// Atividades complementares de ensino não entram no IRA.
const FORA_DO_IRA = new Set(['CCP0001'])

function indiceDoPeriodo(periodo: string) {
  const m = periodo.match(/^(\d{4})\.(\d)$/)
  return m ? Number(m[1]) * 2 + Number(m[2]) - 1 : null
}

// Primeiro semestre do aluno no histórico (índice absoluto de semestres).
export function ingressoDe(historico: TentativaHistorico[]) {
  const indices = historico
    .map((t) => indiceDoPeriodo(t.periodo))
    .filter((i): i is number => i !== null)
  return indices.length ? Math.min(...indices) : null
}

// Entram: tentativas aprovadas ou reprovadas com nota (reprovada conta cada vez que consta)
// e trancamentos (só em T e C). Ficam de fora: em andamento, aproveitamentos e atividades
// complementares. O app não distingue trancamento parcial de total (o total não afeta o
// IRA) nem reprovação por falta (nota 0): todo trancamento é tratado como parcial.
export function iraIndividual(
  historico: TentativaHistorico[],
  porCodigo: Map<string, DisciplinaCurriculo>,
  ingresso = ingressoDe(historico)
) {
  if (ingresso === null) return null
  let trancada = 0
  let cursada = 0
  let soma = 0
  let pesos = 0
  for (const t of historico) {
    const d = porCodigo.get(t.codigo)
    const indice = indiceDoPeriodo(t.periodo)
    if (!d || indice === null || FORA_DO_IRA.has(t.codigo)) continue
    if (t.status === 'TRANCADA') {
      trancada += d.cargaHoraria
      cursada += d.cargaHoraria
      continue
    }
    if (t.status === 'ANDAMENTO' || t.nota === null) continue
    const pi = Math.max(
      1,
      Math.min(SEMESTRE_MAXIMO_PESO, indice - ingresso + 1)
    )
    cursada += d.cargaHoraria
    soma += pi * d.cargaHoraria * t.nota
    pesos += pi * d.cargaHoraria
  }
  if (!pesos) return null
  return (
    (1 - (PENALIDADE_TRANCAMENTO * trancada) / cursada) *
    (soma / pesos) *
    FATOR_ESCALA_IRA
  )
}

export interface PontoIRA {
  periodo: string
  iraPeriodo: number | null
  iraAcumulado: number | null
}

export function evolucaoIRA(
  historico: TentativaHistorico[],
  porCodigo: Map<string, DisciplinaCurriculo>
): PontoIRA[] {
  const ingresso = ingressoDe(historico)
  const periodos = [...new Set(historico.map((t) => t.periodo))]
    .filter((p) =>
      historico.some((t) => t.periodo === p && t.status !== 'ANDAMENTO')
    )
    .sort((a, b) => numeroDoPeriodo(a) - numeroDoPeriodo(b))
  return periodos.map((periodo) => ({
    periodo,
    iraPeriodo: iraIndividual(
      historico.filter((t) => t.periodo === periodo),
      porCodigo,
      ingresso
    ),
    iraAcumulado: iraIndividual(
      historico.filter(
        (t) => numeroDoPeriodo(t.periodo) <= numeroDoPeriodo(periodo)
      ),
      porCodigo,
      ingresso
    )
  }))
}

export function resumoCurso(
  curriculo: DisciplinaCurriculo[],
  sit: Map<string, SituacaoCurricular>
) {
  const total = curriculo.reduce((s, d) => s + d.cargaHoraria, 0)
  const concluida = curriculo
    .filter((d) => sit.get(d.codigo) === 'CONCLUIDA')
    .reduce((s, d) => s + d.cargaHoraria, 0)
  return {
    cargaTotal: total,
    cargaConcluida: concluida,
    percentual: total ? (concluida / total) * 100 : 0,
    disciplinasConcluidas: curriculo.filter(
      (d) => sit.get(d.codigo) === 'CONCLUIDA'
    ).length
  }
}

// ---- Grafo de pré-requisitos ----
export function dependentesDiretos(curriculo: DisciplinaCurriculo[]) {
  const mapa = new Map<string, string[]>(curriculo.map((d) => [d.codigo, []]))
  for (const d of curriculo)
    for (const p of d.prerequisitos) mapa.get(p)?.push(d.codigo)
  return mapa
}

function alcancar(inicio: string, vizinhos: Map<string, string[]>) {
  const visitados = new Set<string>()
  const pilha = [...(vizinhos.get(inicio) ?? [])]
  while (pilha.length) {
    const atual = pilha.pop() as string
    if (visitados.has(atual)) continue
    visitados.add(atual)
    pilha.push(...(vizinhos.get(atual) ?? []))
  }
  return visitados
}

export function descendentes(
  codigo: string,
  dependentes: Map<string, string[]>
) {
  return alcancar(codigo, dependentes)
}

export function ancestrais(
  codigo: string,
  porCodigo: Map<string, DisciplinaCurriculo>
) {
  const pre = new Map<string, string[]>(
    [...porCodigo.values()].map((d) => [d.codigo, d.prerequisitos])
  )
  return alcancar(codigo, pre)
}

// Gargalo = disciplina com mais dependentes transitivos (ranking, sem limiar mágico).
export function gargalos(curriculo: DisciplinaCurriculo[], quantidade: number) {
  const dep = dependentesDiretos(curriculo)
  return curriculo
    .map((d) => ({
      codigo: d.codigo,
      dependentes: descendentes(d.codigo, dep).size
    }))
    .filter((g) => g.dependentes > 0)
    .sort((a, b) => b.dependentes - a.dependentes)
    .slice(0, quantidade)
}

// "E se eu reprovar": disciplinas ainda não concluídas que dependem dela e o maior
// encadeamento entre elas. É um indicador, não uma previsão do atraso de formatura.
export function impactoReprovacao(
  codigo: string,
  curriculo: DisciplinaCurriculo[],
  sit: Map<string, SituacaoCurricular>
) {
  const dep = dependentesDiretos(curriculo)
  const afetadas = [...descendentes(codigo, dep)].filter(
    (c) => sit.get(c) !== 'CONCLUIDA'
  )
  const conjunto = new Set(afetadas)
  const memo = new Map<string, number>()
  const profundidade = (c: string): number => {
    const salvo = memo.get(c)
    if (salvo !== undefined) return salvo
    const filhos = (dep.get(c) ?? []).filter((f) => conjunto.has(f))
    const valor = 1 + Math.max(0, ...filhos.map(profundidade))
    memo.set(c, valor)
    return valor
  }
  return {
    afetadas,
    cadeiaMaisLonga: afetadas.length
      ? Math.max(...afetadas.map(profundidade))
      : 0
  }
}

// ---- Calculadora de meta ----
export interface PrevisaoDisciplina {
  mediaAtual: number | null
  pesoRestante: number
  necessaria: number | null
  mediaMinima: number
  mediaMaxima: number
  risco: RiscoDisciplina
}

export function preverDesempenho(
  avaliacoes: Avaliacao[],
  alvo = MEDIA_APROVACAO
): PrevisaoDisciplina {
  const pesoTotal = avaliacoes.reduce((s, a) => s + a.peso, 0)
  const lancadas = avaliacoes.filter((a) => a.nota !== null)
  const pesoLancado = lancadas.reduce((s, a) => s + a.peso, 0)
  const soma = lancadas.reduce((s, a) => s + (a.nota as number) * a.peso, 0)
  const pesoRestante = pesoTotal - pesoLancado
  const mediaMinima = pesoTotal ? soma / pesoTotal : 0
  const mediaMaxima = pesoTotal ? (soma + 10 * pesoRestante) / pesoTotal : 0
  const necessaria =
    pesoRestante > 0 ? (alvo * pesoTotal - soma) / pesoRestante : null

  let risco: RiscoDisciplina
  if (mediaMinima >= alvo) risco = 'GARANTIDO'
  else if (mediaMaxima < MEDIA_MINIMA_FINAL) risco = 'CRITICO'
  else if (necessaria === null) risco = 'ALTO'
  else if (necessaria > 10 || necessaria >= LIMITE_RISCO_ALTO) risco = 'ALTO'
  else if (necessaria >= LIMITE_RISCO_MEDIO) risco = 'MEDIO'
  else risco = 'BAIXO'

  return {
    mediaAtual: pesoLancado ? soma / pesoLancado : null,
    pesoRestante,
    necessaria,
    mediaMinima,
    mediaMaxima,
    risco
  }
}

// Nota na prova final para (MP + NF) / 2 >= 5, dado MP entre 4 e 7.
export function notaFinalNecessaria(mediaParcial: number) {
  return 2 * MEDIA_FINAL_APROVACAO - mediaParcial
}

// ---- Detector de sobrecarga ----
export interface CargaSemana {
  inicio: string
  horas: number
  itens: number
  critica: boolean
  motivos: string[]
}

export function cargaDaSemana(
  inicioSemana: Date,
  atividades: Atividade[],
  eventos: Evento[],
  limiteHoras = LIMITE_HORAS_SEMANA,
  limiteItens = LIMITE_ITENS_SEMANA
): CargaSemana {
  const de = chaveData(inicioSemana)
  const ate = chaveData(somarDias(inicioSemana, 6))
  const naSemana = (d: string) => d >= de && d <= ate
  const ativ = atividades.filter((a) => !a.feita && naSemana(a.prazo))
  const evs = eventos.filter((e) => naSemana(e.data))
  const horas =
    ativ.reduce((s, a) => s + a.horas, 0) + evs.reduce((s, e) => s + e.horas, 0)
  // Entregas e provas contam como itens; revisões só somam horas.
  const itens = ativ.length + evs.filter((e) => e.tipo === 'PROVA').length
  const motivos: string[] = []
  if (horas > limiteHoras)
    motivos.push(`${horas}h planejadas (limite ${limiteHoras}h)`)
  if (itens >= limiteItens)
    motivos.push(`${itens} entregas/provas (limite ${limiteItens})`)
  return { inicio: de, horas, itens, critica: motivos.length > 0, motivos }
}

// ---- Revisão espaçada ----
export function sugerirRevisoes(eventos: Evento[], hoje: Date): Evento[] {
  const hojeChave = chaveData(hoje)
  const existentes = new Set(eventos.map((e) => e.id))
  const sugestoes: Evento[] = []
  for (const prova of eventos.filter((e) => e.tipo === 'PROVA')) {
    for (const dias of INTERVALOS_REVISAO) {
      const data = chaveData(somarDias(lerData(prova.data), -dias))
      const id = `rev-${prova.id}-${dias}`
      if (data < hojeChave || existentes.has(id)) continue
      sugestoes.push({
        id,
        titulo: `Revisão: ${prova.titulo}`,
        data,
        tipo: 'REVISAO',
        codigo: prova.codigo,
        inicio: HORARIO_REVISAO,
        fim: deMinutos(paraMinutos(HORARIO_REVISAO) + HORAS_REVISAO * 60),
        horas: HORAS_REVISAO
      })
    }
  }
  return sugestoes.sort((a, b) => a.data.localeCompare(b.data))
}

// ---- Horários ----
export function paraMinutos(hora: string) {
  const [h, m] = hora.split(':').map(Number)
  return h * 60 + (m || 0)
}

export function deMinutos(minutos: number) {
  const m = Math.max(0, Math.min(24 * 60 - 1, Math.round(minutos)))
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`
}

// Coloca blocos sobrepostos lado a lado: cada grupo de blocos que se tocam divide a
// largura em tantas faixas quantas forem necessárias.
export function dispor<T extends { inicio: number; fim: number }>(blocos: T[]) {
  const ordenados = [...blocos].sort(
    (a, b) => a.inicio - b.inicio || b.fim - a.fim
  )
  const resultado: (T & { faixa: number; faixas: number })[] = []
  let grupo: (T & { faixa: number; faixas: number })[] = []
  let fimDoGrupo = -1
  const fechar = () => {
    const faixas = Math.max(1, ...grupo.map((b) => b.faixa + 1))
    for (const b of grupo) b.faixas = faixas
    resultado.push(...grupo)
    grupo = []
  }
  for (const bloco of ordenados) {
    if (grupo.length && bloco.inicio >= fimDoGrupo) fechar()
    const ocupadas = new Set(
      grupo.filter((b) => b.fim > bloco.inicio).map((b) => b.faixa)
    )
    let faixa = 0
    while (ocupadas.has(faixa)) faixa++
    grupo.push({ ...bloco, faixa, faixas: 1 })
    fimDoGrupo = Math.max(fimDoGrupo, bloco.fim)
  }
  if (grupo.length) fechar()
  return resultado
}

// ---- Exportação .ics ----
const escaparICS = (texto: string) =>
  texto
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n')

export function gerarICS(
  eventos: Evento[],
  atividades: Atividade[],
  agora = new Date()
) {
  const carimbo = agora.toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '')
  const itens = [
    ...eventos.map((e) => ({
      id: e.id,
      titulo: e.titulo,
      data: e.data,
      inicio: e.inicio,
      fim: e.fim
    })),
    ...atividades.map((a) => ({
      id: a.id,
      titulo: `Entrega: ${a.titulo} (${a.codigo})`,
      data: a.prazo,
      inicio: null,
      fim: null
    }))
  ]
  const linhas = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//XOR//Vida Academica//PT'
  ]
  for (const i of itens) {
    const dia = i.data.replace(/-/g, '')
    const hhmm = (h: string) => `${h.replace(':', '')}00`
    // Com horário, usa hora local "flutuante"; sem, evento de dia inteiro.
    const horario = i.inicio && i.fim
    const fim = chaveData(somarDias(lerData(i.data), 1)).replace(/-/g, '')
    linhas.push(
      'BEGIN:VEVENT',
      `UID:${i.id}@xor`,
      `DTSTAMP:${carimbo}`,
      horario
        ? `DTSTART:${dia}T${hhmm(i.inicio as string)}`
        : `DTSTART;VALUE=DATE:${dia}`,
      horario
        ? `DTEND:${dia}T${hhmm(i.fim as string)}`
        : `DTEND;VALUE=DATE:${fim}`,
      `SUMMARY:${escaparICS(i.titulo)}`,
      'END:VEVENT'
    )
  }
  linhas.push('END:VCALENDAR')
  return linhas.join('\r\n')
}
