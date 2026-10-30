import api from '../api'

export interface LoginPayload {
  email: string
  senha: string
}

export async function login(payload: LoginPayload) {
  await api.post('/auth/login', payload)
}
