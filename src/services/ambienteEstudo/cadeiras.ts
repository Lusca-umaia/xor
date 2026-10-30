import { CadeiraHistorico, SituacaoCadeira } from '@/@types/AmbienteEstudo'
import { Progresso, Tentativa } from '@/@types/Progresso'

const rotuloPeriodo = (t: Tentativa) =>
  t.periodo ?? (t.semestre ? `${t.semestre}º semestre` : null)

// "2024.1" vira 20241; "3º semestre" vira 3. Sem período, vai para o fim.
function ordemDoPeriodo(t: Tentativa) {
  const ano = t.periodo?.match(/(\d{4})\D*(\d)/)
  if (ano) return Number(ano[1]) * 10 + Number(ano[2])
  return t.semestre ?? 0
}

/**
 * Cadeiras que o aluno já cursou ou está cursando, a partir do histórico
 * (GET /api/progresso). Cadeiras sem nenhuma tentativa ficam de fora.
 * A tentativa que define a situação segue a regra da progressão: aprovação
 * vence andamento, que vence a última reprovação ou trancamento.
 */
export function cadeirasDoHistorico(progresso: Progresso): CadeiraHistorico[] {
  return progresso.disciplinas.flatMap((disciplina) => {
    const { tentativas } = disciplina
    if (tentativas.length === 0) return []
    const decisiva =
      tentativas.find((t) => t.status === 'APROVADA') ??
      tentativas.find((t) => t.status === 'ANDAMENTO') ??
      tentativas[tentativas.length - 1]
    const situacao: SituacaoCadeira =
      decisiva.status === 'APROVADA' ? 'APROVADA' : decisiva.status
    return [
      {
        codigo: disciplina.codigo,
        nome: disciplina.nome,
        situacao,
        nota: decisiva.nota,
        periodo: rotuloPeriodo(decisiva),
        ordemPeriodo: ordemDoPeriodo(decisiva)
      }
    ]
  })
}
