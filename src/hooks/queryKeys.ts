export const QUERY_KEYS = {
  ME: ['me'],
  PROGRESSO: ['progresso'],
  PERFIL: ['perfil'],
  QUESTIONARIOS: ['questionarios'],
  QUESTIONARIO: (id: number) => ['questionarios', id],
  SESSOES_FOCO: ['sessoesFoco']
} as const
