import { paraMinutos } from './index'

export interface Horario {
  // 0 = domingo ... 6 = sábado
  dias: number[]
  inicio: string
  fim: string
}

export interface ItemCatalogo {
  codigo: string
  nome: string
  cargaHoraria: number
  prerequisitos: string[]
  carater: 'OBRIGATORIA' | 'OPTATIVA'
  horarios: Horario[]
  personalizada?: boolean
}

export interface Pendencias {
  // Pré-requisitos sem aprovação, sem andamento e fora do plano: bloqueiam a matrícula.
  faltam: string[]
  // Em andamento neste semestre: contam como cumpridos se o aluno for aprovado.
  emAndamento: string[]
  // Estão no mesmo plano: não dá para cursar junto com a disciplina que os exige.
  noPlano: string[]
}

export function pendencias(
  item: Pick<ItemCatalogo, 'prerequisitos'>,
  aprovados: Set<string>,
  andamento: Set<string>,
  plano: Set<string>
): Pendencias {
  const resultado: Pendencias = { faltam: [], emAndamento: [], noPlano: [] }
  for (const p of item.prerequisitos) {
    if (aprovados.has(p)) continue
    if (andamento.has(p)) resultado.emAndamento.push(p)
    else if (plano.has(p)) resultado.noPlano.push(p)
    else resultado.faltam.push(p)
  }
  return resultado
}

const sobrepoe = (a: Horario, b: Horario) =>
  a.dias.some((d) => b.dias.includes(d)) &&
  paraMinutos(a.inicio) < paraMinutos(b.fim) &&
  paraMinutos(b.inicio) < paraMinutos(a.fim)

// Códigos de disciplinas do plano cujos horários se sobrepõem a outra do plano.
export function conflitos(itens: Pick<ItemCatalogo, 'codigo' | 'horarios'>[]) {
  const em = new Set<string>()
  for (let i = 0; i < itens.length; i++)
    for (let j = i + 1; j < itens.length; j++)
      if (
        itens[i].horarios.some((a) =>
          itens[j].horarios.some((b) => sobrepoe(a, b))
        )
      ) {
        em.add(itens[i].codigo)
        em.add(itens[j].codigo)
      }
  return em
}

export type StatusCarga = 'ABAIXO' | 'OK' | 'ACIMA'

export function statusCarga(total: number, minimo: number, maximo: number) {
  if (total < minimo) return 'ABAIXO' as StatusCarga
  if (total > maximo) return 'ACIMA' as StatusCarga
  return 'OK' as StatusCarga
}

// Disciplinas que passam a ter todos os pré-requisitos cumpridos só por causa do plano.
export function liberadasPeloPlano(
  catalogo: ItemCatalogo[],
  aprovados: Set<string>,
  andamento: Set<string>,
  plano: Set<string>
) {
  const comPlano = new Set([...aprovados, ...andamento, ...plano])
  const antes = new Set([...aprovados, ...andamento])
  return catalogo.filter(
    (d) =>
      !comPlano.has(d.codigo) &&
      d.prerequisitos.length > 0 &&
      d.prerequisitos.every((p) => comPlano.has(p)) &&
      !d.prerequisitos.every((p) => antes.has(p))
  )
}
