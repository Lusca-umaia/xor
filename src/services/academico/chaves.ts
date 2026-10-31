// Chaves dos dados da vida acadêmica. Ficam no localStorage como cache e
// são sincronizadas com o servidor (tabela dados_aluno).
export const CHAVES = {
  atividades: 'xor:atividades',
  eventos: 'xor:eventos',
  turmas: 'xor:turmas',
  playlists: 'xor:playlists',
  portfolio: 'xor:portfolio',
  avaliacoes: 'xor:avaliacoes',
  planejador: 'xor:planejador',
  limites: 'xor:limites-sobrecarga',
  consentimentoIA: 'xor:consentimento-ia'
} as const

export const CHAVE_CONFIG_POMODORO = 'xor:pomodoro:config'

// Tem de bater com o check da tabela dados_aluno.
export const CHAVES_SINCRONIZADAS: readonly string[] = [
  ...Object.values(CHAVES),
  CHAVE_CONFIG_POMODORO
]
