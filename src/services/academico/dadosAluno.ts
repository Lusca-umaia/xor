import api from '../api'

// Dados da vida acadêmica guardados no servidor, por chave.

export const listarDadosAluno = async () =>
  (await api.get<Record<string, unknown>>('/dados')).data

export const salvarDadoAluno = async (chave: string, valor: unknown) => {
  await api.put(`/dados/${encodeURIComponent(chave)}`, { valor })
}

export const apagarDadosAluno = async (chaves: readonly string[]) => {
  await api.delete('/dados', { data: { chaves } })
}
