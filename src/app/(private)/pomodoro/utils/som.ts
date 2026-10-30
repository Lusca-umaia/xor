import type { TipoRuido } from '../consts'

// Sons gerados com Web Audio, sem arquivos de áudio.

let contexto: AudioContext | null = null

function obterContexto() {
  if (typeof window === 'undefined') return null
  contexto ??= new AudioContext()
  if (contexto.state === 'suspended') void contexto.resume()
  return contexto
}

// Três notas curtas e suaves ao fim de um bloco.
export function tocarAlerta() {
  const ctx = obterContexto()
  if (!ctx) return

  const notas = [659.25, 783.99, 1046.5]
  notas.forEach((frequencia, i) => {
    const inicio = ctx.currentTime + i * 0.18
    const oscilador = ctx.createOscillator()
    const ganho = ctx.createGain()

    oscilador.type = 'sine'
    oscilador.frequency.value = frequencia
    ganho.gain.setValueAtTime(0.0001, inicio)
    ganho.gain.exponentialRampToValueAtTime(0.25, inicio + 0.02)
    ganho.gain.exponentialRampToValueAtTime(0.0001, inicio + 0.6)

    oscilador.connect(ganho).connect(ctx.destination)
    oscilador.start(inicio)
    oscilador.stop(inicio + 0.65)
  })
}

function gerarRuido(ctx: AudioContext, tipo: Exclude<TipoRuido, 'NENHUM'>) {
  const tamanho = ctx.sampleRate * 8
  const buffer = ctx.createBuffer(1, tamanho, ctx.sampleRate)
  const dados = buffer.getChannelData(0)

  let b0 = 0,
    b1 = 0,
    b2 = 0,
    b3 = 0,
    b4 = 0,
    b5 = 0,
    b6 = 0
  let ultimo = 0

  for (let i = 0; i < tamanho; i++) {
    const branco = Math.random() * 2 - 1

    if (tipo === 'BRANCO') {
      dados[i] = branco * 0.3
    } else if (tipo === 'ROSA') {
      // Filtro de Paul Kellet.
      b0 = 0.99886 * b0 + branco * 0.0555179
      b1 = 0.99332 * b1 + branco * 0.0750759
      b2 = 0.969 * b2 + branco * 0.153852
      b3 = 0.8665 * b3 + branco * 0.3104856
      b4 = 0.55 * b4 + branco * 0.5329522
      b5 = -0.7616 * b5 - branco * 0.016898
      dados[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + branco * 0.5362) * 0.08
      b6 = branco * 0.115926
    } else {
      ultimo = (ultimo + 0.02 * branco) / 1.02
      dados[i] = ultimo * 3
    }
  }

  return buffer
}

let ruidoAtual: {
  tipo: TipoRuido
  fonte: AudioBufferSourceNode
  ganho: GainNode
} | null = null

export function tocarRuido(tipo: TipoRuido, volume: number) {
  if (tipo === 'NENHUM') return pararRuido()

  if (ruidoAtual?.tipo === tipo) {
    ruidoAtual.ganho.gain.value = volume
    return
  }

  pararRuido()
  const ctx = obterContexto()
  if (!ctx) return

  const fonte = ctx.createBufferSource()
  const ganho = ctx.createGain()
  fonte.buffer = gerarRuido(ctx, tipo)
  fonte.loop = true
  ganho.gain.value = volume
  fonte.connect(ganho).connect(ctx.destination)
  fonte.start()

  ruidoAtual = { tipo, fonte, ganho }
}

export function pararRuido() {
  if (!ruidoAtual) return
  ruidoAtual.fonte.stop()
  ruidoAtual.fonte.disconnect()
  ruidoAtual = null
}
