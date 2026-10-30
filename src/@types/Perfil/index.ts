export interface Perfil {
  id: string
  nome: string
  email: string
  // Novo email aguardando confirmação pelo link enviado.
  emailPendente: string | null
  matricula: string | null
  cursoNome: string
  cursoCodigo: string | null
  semestreAtual: number
  cargaOptativaExigida: number | null
  criadoEm: string
}
