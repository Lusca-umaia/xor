import 'server-only'

import type {
  AmbienteEstudo,
  AmbienteListagem,
  CorAmbiente,
  DadosAmbiente
} from '@/@types/AmbienteEstudo'
import { buscarProgresso } from '../progresso'
import { Contexto, exigir, verificar } from './comum'
import { AmbienteRow, COLUNAS_AMBIENTE, mapearAmbiente } from './mapeadores'
import { removerArquivos } from './materiais'

const CORES_INICIAIS: CorAmbiente[] = [
  'azul',
  'verde',
  'roxo',
  'laranja',
  'rosa',
  'ciano',
  'ambar'
]

/**
 * No primeiro acesso, cria um ambiente por disciplina em andamento. A linha em
 * ambientes_config é inserida antes: se já existe (23505), o aluno já foi
 * semeado e nada é recriado, mesmo que ele tenha excluído os ambientes.
 */
async function garantirAmbientesIniciais(ctx: Contexto) {
  const { supabase, user } = ctx
  const { error } = await supabase
    .from('ambientes_config')
    .insert({ aluno_id: user.id })
  if (error?.code === '23505') return
  verificar(error)

  const { disciplinas } = await buscarProgresso(supabase, user)
  const emAndamento = disciplinas.filter(({ status }) => status === 'ANDAMENTO')
  if (emAndamento.length === 0) return

  const { error: erroInsercao } = await supabase.from('ambientes').insert(
    emAndamento.map((disciplina, indice) => ({
      aluno_id: user.id,
      nome: disciplina.nome.slice(0, 80),
      cor: CORES_INICIAIS[indice % CORES_INICIAIS.length],
      origem: 'CADEIRA',
      disciplina_codigo: disciplina.codigo
    }))
  )
  verificar(erroInsercao)
}

const contarPorAmbiente = async (
  { supabase }: Contexto,
  tabela: string
): Promise<Map<string, number>> => {
  const { data, error } = await supabase.from(tabela).select('ambiente_id')
  verificar(error)
  const contagem = new Map<string, number>()
  for (const { ambiente_id } of (data ?? []) as { ambiente_id: string }[]) {
    contagem.set(ambiente_id, (contagem.get(ambiente_id) ?? 0) + 1)
  }
  return contagem
}

export async function listarAmbientes(
  ctx: Contexto
): Promise<AmbienteListagem[]> {
  await garantirAmbientesIniciais(ctx)

  const [{ data, error }, materiais, chats, resumos, atividades, simulados] =
    await Promise.all([
      ctx.supabase
        .from('ambientes')
        .select(COLUNAS_AMBIENTE)
        .order('atualizado_em', { ascending: false }),
      contarPorAmbiente(ctx, 'materiais'),
      contarPorAmbiente(ctx, 'chats'),
      contarPorAmbiente(ctx, 'resumos'),
      contarPorAmbiente(ctx, 'atividades'),
      contarPorAmbiente(ctx, 'simulados')
    ])
  verificar(error)

  return ((data ?? []) as AmbienteRow[]).map((row) => ({
    ...mapearAmbiente(row),
    contagem: {
      materiais: materiais.get(row.id) ?? 0,
      chats: chats.get(row.id) ?? 0,
      resumos: resumos.get(row.id) ?? 0,
      atividades: atividades.get(row.id) ?? 0,
      simulados: simulados.get(row.id) ?? 0
    },
    ultimaAtividadeEm: row.atualizado_em
  }))
}

export async function obterAmbiente(
  { supabase }: Contexto,
  id: string
): Promise<AmbienteEstudo> {
  const { data, error } = await supabase
    .from('ambientes')
    .select(COLUNAS_AMBIENTE)
    .eq('id', id)
    .maybeSingle()
  verificar(error)
  return mapearAmbiente(exigir(data as AmbienteRow | null, 'Ambiente'))
}

/** Nome do ambiente, usado como tema da IA quando não há material com texto. */
export async function temaDoAmbiente({ supabase }: Contexto, id: string) {
  const { data, error } = await supabase
    .from('ambientes')
    .select('nome')
    .eq('id', id)
    .maybeSingle()
  verificar(error)
  return exigir(data, 'Ambiente').nome as string
}

export async function criarAmbiente(
  { supabase, user }: Contexto,
  dados: DadosAmbiente
): Promise<AmbienteEstudo> {
  const { data, error } = await supabase
    .from('ambientes')
    .insert({
      aluno_id: user.id,
      nome: dados.nome,
      descricao: dados.descricao,
      cor: dados.cor,
      origem: dados.disciplinaCodigo ? 'CADEIRA' : 'LIVRE',
      disciplina_codigo: dados.disciplinaCodigo
    })
    .select(COLUNAS_AMBIENTE)
    .single()
  verificar(error)
  return mapearAmbiente(data as AmbienteRow)
}

export async function atualizarAmbiente(
  { supabase }: Contexto,
  id: string,
  dados: Partial<DadosAmbiente> & { arquivado?: boolean }
): Promise<AmbienteEstudo> {
  const campos: Record<string, unknown> = {}
  if (dados.nome !== undefined) campos.nome = dados.nome
  if (dados.descricao !== undefined) campos.descricao = dados.descricao
  if (dados.cor !== undefined) campos.cor = dados.cor
  if (dados.arquivado !== undefined) campos.arquivado = dados.arquivado
  if (dados.disciplinaCodigo !== undefined) {
    campos.disciplina_codigo = dados.disciplinaCodigo
    campos.origem = dados.disciplinaCodigo ? 'CADEIRA' : 'LIVRE'
  }

  const { data, error } = await supabase
    .from('ambientes')
    .update(campos)
    .eq('id', id)
    .select(COLUNAS_AMBIENTE)
    .maybeSingle()
  verificar(error)
  return mapearAmbiente(exigir(data as AmbienteRow | null, 'Ambiente'))
}

/** Exclui o ambiente (o banco apaga o conteúdo em cascata) e os arquivos. */
export async function excluirAmbiente(ctx: Contexto, id: string) {
  const { data: materiais, error } = await ctx.supabase
    .from('materiais')
    .select('storage_path')
    .eq('ambiente_id', id)
  verificar(error)

  const { data, error: erroExclusao } = await ctx.supabase
    .from('ambientes')
    .delete()
    .eq('id', id)
    .select('id')
  verificar(erroExclusao)
  exigir(data?.[0], 'Ambiente')

  await removerArquivos(
    ctx,
    (materiais ?? []).map(({ storage_path }) => storage_path as string | null)
  )
}
