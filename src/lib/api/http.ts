import 'server-only'

import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: unknown
  ) {
    super(message)
  }
}

export function ok<T>(data: T, status = 200) {
  return NextResponse.json(data, { status })
}

// Lê e valida o corpo JSON. Campos fora do schema são descartados pelo zod.
export async function parseBody<T extends z.ZodTypeAny>(
  request: Request,
  schema: T
): Promise<z.infer<T>> {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    throw new ApiError(400, 'Corpo da requisição inválido')
  }

  const result = schema.safeParse(body)
  if (!result.success) {
    throw new ApiError(
      422,
      'Dados inválidos',
      result.error.flatten().fieldErrors
    )
  }
  return result.data
}

// Lê um id numérico de parâmetro de rota.
export async function parseId(params: Promise<{ id: string }>) {
  const id = Number((await params).id)
  if (!Number.isSafeInteger(id) || id <= 0) {
    throw new ApiError(400, 'Identificador inválido')
  }
  return id
}

// Retorna o cliente Supabase e o usuário da sessão, ou 401.
export async function requireUser() {
  const supabase = await createClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) throw new ApiError(401, 'Não autenticado')
  return { supabase, user }
}

// Envolve o handler para padronizar erros sem vazar detalhes internos.
export function handler<Args extends unknown[]>(
  fn: (...args: Args) => Promise<Response>
) {
  return async (...args: Args) => {
    try {
      return await fn(...args)
    } catch (error) {
      if (error instanceof ApiError) {
        return NextResponse.json(
          { error: error.message, details: error.details },
          { status: error.status }
        )
      }
      console.error(error)
      return NextResponse.json(
        { error: 'Erro interno do servidor' },
        { status: 500 }
      )
    }
  }
}
