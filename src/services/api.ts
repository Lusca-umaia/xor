import axios from 'axios'

// Rotas de API do próprio Next. A sessão vai no cookie httpOnly do Supabase.
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
})

export interface ApiErrorBody {
  error: string
  details?: Record<string, string[]>
}

export function getErrorStatus(error: unknown) {
  return axios.isAxiosError(error) ? error.response?.status : undefined
}

// Mensagem amigável para exibir ao usuário a partir de um erro de requisição.
export function getErrorMessage(error: unknown, fallback = 'Algo deu errado') {
  if (!axios.isAxiosError<ApiErrorBody>(error)) return fallback
  if (!error.response) return 'Sem conexão com o servidor. Tente novamente'
  return error.response.data?.error ?? fallback
}

export default api
