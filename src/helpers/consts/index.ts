export const STEP_KEYS = {
  COURSE_INFORMATION: 'COURSE_INFORMATION',
  PERSONAL_INFORMATION: 'PERSONAL_INFORMATION',
  CURRENT_SEMESTER: 'CURRENT_SEMESTER'
} as const

export const CARATER_OPCOES: {
  id: 'OBRIGATORIA' | 'OPTATIVA'
  nome: string
}[] = [
  { id: 'OBRIGATORIA', nome: 'Obrigatória' },
  { id: 'OPTATIVA', nome: 'Optativa' }
]
