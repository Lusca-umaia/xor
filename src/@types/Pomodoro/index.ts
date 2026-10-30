// Bloco de foco concluído no pomodoro.
export interface SessaoFoco {
  id: number
  disciplinaId: number | null
  tarefa: string | null
  duracaoSegundos: number
  iniciadaEm: string
  concluidaEm: string
}
