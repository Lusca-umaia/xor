import { ApiError, handler, ok, parseBody } from '@/lib/api/http'
import { cadastroSchema } from '@/lib/api/schemas'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

export const POST = handler(async (request: Request) => {
  const dados = await parseBody(request, cadastroSchema)
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signUp({
    email: dados.email,
    password: dados.senha,
    options: {
      emailRedirectTo: `${new URL(request.url).origin}/login`,
      data: { nome: dados.nome }
    }
  })

  if (error) {
    if (error.code === 'user_already_exists') {
      throw new ApiError(409, 'Já existe uma conta com este email')
    }
    if (error.code === 'weak_password') {
      throw new ApiError(422, 'Senha muito fraca')
    }
    if (error.code === 'email_address_invalid') {
      throw new ApiError(422, 'Email inválido ou não aceito. Use um email real')
    }
    if (error.code === 'over_email_send_rate_limit') {
      throw new ApiError(
        429,
        'Muitos cadastros em pouco tempo. Tente novamente mais tarde'
      )
    }
    console.error(error)
    throw new ApiError(400, 'Não foi possível concluir o cadastro')
  }

  // Com confirmação de email ligada, o Supabase devolve um usuário sem
  // identidades quando o email já existe (para não revelar a conta).
  if (!data.user || data.user.identities?.length === 0) {
    throw new ApiError(409, 'Já existe uma conta com este email')
  }

  const admin = createAdminClient()

  const { error: registroError } = await admin.rpc('registrar_aluno', {
    p_aluno: data.user.id,
    p_dados: {
      nome: dados.nome,
      matricula: dados.matricula,
      curso_nome: dados.cursoNome,
      curso_codigo: dados.cursoCodigo,
      semestre_atual: dados.semestreAtual,
      carga_optativa_exigida: dados.cargaOptativaExigida,
      disciplinas: dados.disciplinas.map((d) => ({
        codigo: d.codigo,
        nome: d.nome,
        carga_horaria: d.cargaHoraria,
        carater: d.carater,
        semestre: d.semestre
      })),
      tentativas: dados.tentativas
    }
  })

  if (registroError) {
    // Desfaz o usuário para o aluno poder tentar de novo com o mesmo email.
    await admin.auth.admin.deleteUser(data.user.id)
    await supabase.auth.signOut()
    console.error(registroError)
    throw new ApiError(400, 'Não foi possível salvar seus dados acadêmicos')
  }

  // Sem sessão = confirmação de email ligada no projeto Supabase.
  return ok({ precisaConfirmarEmail: !data.session }, 201)
})
