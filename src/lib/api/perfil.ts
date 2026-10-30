import 'server-only'

import type { SupabaseClient, User } from '@supabase/supabase-js'
import type { Perfil } from '@/@types/Perfil'
import { ApiError } from './http'

export async function buscarPerfil(
  supabase: SupabaseClient,
  user: User
): Promise<Perfil> {
  const { data, error } = await supabase
    .from('perfis')
    .select(
      'id, nome, matricula, curso_nome, curso_codigo, semestre_atual, carga_optativa_exigida, criado_em'
    )
    .eq('id', user.id)
    .maybeSingle()

  if (error) throw error
  if (!data) throw new ApiError(404, 'Perfil não encontrado')

  return {
    id: data.id,
    nome: data.nome,
    email: user.email ?? '',
    emailPendente: user.new_email ?? null,
    matricula: data.matricula,
    cursoNome: data.curso_nome,
    cursoCodigo: data.curso_codigo,
    semestreAtual: data.semestre_atual,
    cargaOptativaExigida: data.carga_optativa_exigida,
    criadoEm: data.criado_em
  }
}

// Reautentica o aluno antes de trocar email ou senha: quem pegar uma
// sessão aberta não consegue tomar a conta sem saber a senha.
export async function confirmarSenhaAtual(
  supabase: SupabaseClient,
  user: User,
  senha: string
) {
  if (!user.email) throw new ApiError(400, 'Conta sem email cadastrado')

  const { error } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: senha
  })

  if (!error) return
  if (error.code === 'over_request_rate_limit') {
    throw new ApiError(
      429,
      'Muitas tentativas. Aguarde alguns minutos e tente novamente'
    )
  }
  throw new ApiError(403, 'Senha atual incorreta')
}
