import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const ROTAS_PRIVADAS = [
  '/home',
  '/ambientes',
  '/courseProgression',
  '/pomodoro',
  '/chat',
  '/questoes',
  '/extrator',
  '/perfil'
]

const ROTAS_SO_DESLOGADO = ['/login', '/register']

// APIs que podem ser chamadas sem sessão.
const APIS_PUBLICAS = ['/api/auth/login', '/api/auth/register']

const METODOS_SEGUROS = ['GET', 'HEAD', 'OPTIONS']

const comecaCom = (pathname: string, rotas: string[]) =>
  rotas.some((rota) => pathname === rota || pathname.startsWith(`${rota}/`))

function json(status: number, error: string) {
  return NextResponse.json({ error }, { status })
}

export async function updateSession(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isApi = pathname.startsWith('/api/')

  // Proteção contra CSRF: requisições que alteram estado precisam vir
  // da própria origem da aplicação.
  if (isApi && !METODOS_SEGUROS.includes(request.method)) {
    const origin = request.headers.get('origin')
    if (!origin || origin !== request.nextUrl.origin) {
      return json(403, 'Origem não permitida')
    }
  }

  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        }
      }
    }
  )

  // Não colocar código entre a criação do cliente e o getUser():
  // é ele que valida o token no Supabase e renova a sessão.
  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    if (isApi && !comecaCom(pathname, APIS_PUBLICAS)) {
      return json(401, 'Não autenticado')
    }

    if (comecaCom(pathname, ROTAS_PRIVADAS)) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      url.search = ''
      return NextResponse.redirect(url)
    }
  }

  if (user && comecaCom(pathname, ROTAS_SO_DESLOGADO)) {
    const url = request.nextUrl.clone()
    url.pathname = '/home'
    url.search = ''
    return NextResponse.redirect(url)
  }

  return response
}
