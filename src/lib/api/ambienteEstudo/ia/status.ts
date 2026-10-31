import 'server-only'

import type { StatusIa } from '@/@types/AmbienteEstudo'
import { modeloEmbedding } from './cliente'

// Diagnóstico da IA local para o aviso no ambiente. Usa a lista de modelos
// da API compatível com a OpenAI (GET /models), que é rápida e não carrega
// o modelo na memória. Um resultado OK fica guardado por 30 s; uma falha
// não, para o "verificar de novo" refletir na hora quem acabou de arrumar.
const VALIDADE_MS = 30_000
let guardado: { quando: number; status: StatusIa } | null = null

const mesmoModelo = (instalado: string, nome: string) =>
  instalado === nome || instalado === `${nome}:latest`

async function consultar(): Promise<StatusIa> {
  const url = process.env.LM_STUDIO_URL?.replace(/\/$/, '')
  const modelo = process.env.LM_STUDIO_MODEL || null
  if (!url) return { situacao: 'NAO_CONFIGURADA', modelo, embeddings: false }

  try {
    const resposta = await fetch(`${url}/models`, {
      signal: AbortSignal.timeout(3000),
      cache: 'no-store'
    })
    if (!resposta.ok) throw new Error(String(resposta.status))
    const ids = (
      ((await resposta.json()) as { data?: { id: string }[] }).data ?? []
    ).map(({ id }) => id)
    return {
      // Sem LM_STUDIO_MODEL (LM Studio), vale o modelo carregado.
      situacao:
        !modelo || ids.some((id) => mesmoModelo(id, modelo))
          ? 'OK'
          : 'SEM_MODELO',
      modelo,
      embeddings: ids.some((id) => mesmoModelo(id, modeloEmbedding()))
    }
  } catch {
    return { situacao: 'OFFLINE', modelo, embeddings: false }
  }
}

export async function statusIa(): Promise<StatusIa> {
  if (guardado && Date.now() - guardado.quando < VALIDADE_MS)
    return guardado.status
  const status = await consultar()
  guardado = status.situacao === 'OK' ? { quando: Date.now(), status } : null
  return status
}
