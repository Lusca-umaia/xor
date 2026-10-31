import type { DisciplinaProgresso } from '@/@types/Progresso'

// Média das notas por período, ponderada pela carga horária. Entram as
// tentativas aprovadas e reprovadas com nota; ficam de fora as em andamento,
// os trancamentos e os aproveitamentos (sem nota).

/** Ordena rótulos como "2024.1" ou "3º semestre"; desconhecidos vão ao fim. */
export function numeroDoPeriodo(periodo: string) {
  const ano = periodo.match(/^(\d{4})\.(\d)$/)
  if (ano) return Number(ano[1]) * 10 + Number(ano[2])
  const semestre = periodo.match(/^(\d+)º/)
  return semestre ? Number(semestre[1]) : Number.MAX_SAFE_INTEGER
}

export interface PontoMedia {
  periodo: string
  /** Média só das disciplinas daquele período. */
  media: number
  /** Média de tudo até aquele período, inclusive. */
  acumulada: number
  disciplinas: number
}

export function evolucaoDaMedia(
  disciplinas: DisciplinaProgresso[]
): PontoMedia[] {
  const porPeriodo = new Map<
    string,
    { soma: number; carga: number; disciplinas: number }
  >()
  for (const { cargaHoraria, tentativas } of disciplinas) {
    for (const { status, nota, periodo, semestre } of tentativas) {
      if (nota === null || (status !== 'APROVADA' && status !== 'REPROVADA'))
        continue
      const rotulo = periodo ?? (semestre ? `${semestre}º semestre` : null)
      if (!rotulo) continue
      // Disciplina sem carga informada ainda conta, com peso mínimo.
      const peso = Math.max(cargaHoraria, 1)
      const atual = porPeriodo.get(rotulo) ?? {
        soma: 0,
        carga: 0,
        disciplinas: 0
      }
      porPeriodo.set(rotulo, {
        soma: atual.soma + nota * peso,
        carga: atual.carga + peso,
        disciplinas: atual.disciplinas + 1
      })
    }
  }

  let soma = 0
  let carga = 0
  return [...porPeriodo.entries()]
    .sort(([a], [b]) => numeroDoPeriodo(a) - numeroDoPeriodo(b))
    .map(([periodo, p]) => {
      soma += p.soma
      carga += p.carga
      return {
        periodo,
        media: p.soma / p.carga,
        acumulada: soma / carga,
        disciplinas: p.disciplinas
      }
    })
}
