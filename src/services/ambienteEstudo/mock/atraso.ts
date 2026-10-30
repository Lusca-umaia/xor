// Taxa de falha simulada (0 a 1). Aumente para testar os estados de erro.
const TAXA_FALHA = Number(process.env.NEXT_PUBLIC_AMBIENTE_MOCK_FALHA ?? 0)

export class ErroSimulado extends Error {
  constructor() {
    super('Falha simulada de rede. Tente novamente.')
  }
}

export function esperar(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms))
}

/** Simula a latência de uma chamada ao servidor. */
export async function atraso(min = 250, max = 700) {
  await esperar(min + Math.random() * (max - min))
  if (TAXA_FALHA > 0 && Math.random() < TAXA_FALHA) {
    throw new ErroSimulado()
  }
}

/** Executa `tarefa` depois de `ms`, simulando um processamento assíncrono no servidor. */
export function agendar(ms: number, tarefa: () => void) {
  setTimeout(() => {
    try {
      tarefa()
    } catch (erro) {
      console.error('[ambienteEstudo/mock] falha em tarefa agendada', erro)
    }
  }, ms)
}
