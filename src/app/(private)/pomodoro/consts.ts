import { IconType } from 'react-icons'
import { LuBrain, LuCoffee, LuSunrise } from 'react-icons/lu'

export type ModoTimer = 'FOCO' | 'PAUSA_CURTA' | 'PAUSA_LONGA'

export type TipoRuido = 'NENHUM' | 'BRANCO' | 'ROSA' | 'MARROM'

export interface ConfigPomodoro {
  // Durações em minutos.
  foco: number
  pausaCurta: number
  pausaLonga: number
  ciclosAtePausaLonga: number
  // Pomodoros por dia.
  metaDiaria: number
  autoIniciarPausas: boolean
  autoIniciarFoco: boolean
  som: boolean
  notificacoes: boolean
  ruido: TipoRuido
  volumeRuido: number
}

export const CONFIG_PADRAO: ConfigPomodoro = {
  foco: 25,
  pausaCurta: 5,
  pausaLonga: 15,
  ciclosAtePausaLonga: 4,
  metaDiaria: 6,
  autoIniciarPausas: true,
  autoIniciarFoco: false,
  som: true,
  notificacoes: false,
  ruido: 'NENHUM',
  volumeRuido: 0.4
}

export const PRESETS = [
  { nome: 'Clássico', foco: 25, pausaCurta: 5, pausaLonga: 15 },
  { nome: 'Imersão', foco: 50, pausaCurta: 10, pausaLonga: 20 },
  { nome: 'Leve', foco: 15, pausaCurta: 3, pausaLonga: 10 }
]

export const MODOS: Record<
  ModoTimer,
  {
    label: string
    curto: string
    icon: IconType
    // Classes estáticas para o Tailwind encontrar.
    traco: string
    texto: string
    fundo: string
    botao: string
  }
> = {
  FOCO: {
    label: 'Foco',
    curto: 'Foco',
    icon: LuBrain,
    traco: 'stroke-xor-navy',
    texto: 'text-xor-navy',
    fundo: 'bg-xor-navy/5',
    botao: 'bg-xor-navy hover:bg-xor-navy/90'
  },
  PAUSA_CURTA: {
    label: 'Pausa curta',
    curto: 'Pausa',
    icon: LuCoffee,
    traco: 'stroke-emerald-500',
    texto: 'text-emerald-600',
    fundo: 'bg-emerald-50',
    botao: 'bg-emerald-600 hover:bg-emerald-500'
  },
  PAUSA_LONGA: {
    label: 'Pausa longa',
    curto: 'Longa',
    icon: LuSunrise,
    traco: 'stroke-sky-500',
    texto: 'text-sky-600',
    fundo: 'bg-sky-50',
    botao: 'bg-sky-600 hover:bg-sky-500'
  }
}

export const RUIDOS: { id: TipoRuido; nome: string }[] = [
  { id: 'NENHUM', nome: 'Sem som ambiente' },
  { id: 'BRANCO', nome: 'Ruído branco' },
  { id: 'ROSA', nome: 'Ruído rosa (chuva)' },
  { id: 'MARROM', nome: 'Ruído marrom (cachoeira)' }
]

export const DICAS_PAUSA = [
  'Levante e alongue o pescoço e os ombros por 30 segundos.',
  'Beba um copo de água. Hidratação ajuda na concentração.',
  'Regra 20-20-20: olhe para algo a 6 metros por 20 segundos.',
  'Respire: inspire por 4s, segure por 7s, solte por 8s. Repita 3 vezes.',
  'Caminhe um pouco pelo ambiente para ativar a circulação.',
  'Evite o celular: redes sociais tornam a volta ao foco mais difícil.',
  'Relembre em uma frase o que você acabou de estudar.',
  'Abra a janela ou mude de posição para renovar a energia.'
]

export const FRASES_FOCO = [
  'Um pomodoro de cada vez.',
  'Constância vence intensidade.',
  'Desligue as notificações e mergulhe.',
  'Feito é melhor que perfeito.',
  'Seu eu do futuro agradece.'
]

export const duracaoDoModo = (modo: ModoTimer, config: ConfigPomodoro) =>
  ({
    FOCO: config.foco,
    PAUSA_CURTA: config.pausaCurta,
    PAUSA_LONGA: config.pausaLonga
  })[modo] * 60

export const formatarTempo = (segundos: number) => {
  const mins = Math.floor(segundos / 60)
  const secs = segundos % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

// Ex.: 95 min -> "1h 35min"
export const formatarDuracao = (segundos: number) => {
  const minutos = Math.round(segundos / 60)
  if (minutos < 60) return `${minutos}min`
  const horas = Math.floor(minutos / 60)
  const resto = minutos % 60
  return resto ? `${horas}h ${resto}min` : `${horas}h`
}
