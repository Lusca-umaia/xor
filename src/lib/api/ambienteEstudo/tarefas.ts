import 'server-only'

import { after } from 'next/server'
import { ApiError } from '../http'

/**
 * Roda uma geração demorada depois de a resposta ser enviada. A rota grava o
 * registro como GERANDO/PROCESSANDO e o front acompanha por polling.
 *
 * Serve para rodar localmente. Em produção (serverless), isso deve virar uma
 * fila ou worker, porque a função pode ser encerrada antes de terminar.
 */
export function executarEmSegundoPlano(
  rotulo: string,
  tarefa: () => Promise<void>,
  aoFalhar: (mensagem: string) => Promise<void>
) {
  after(async () => {
    try {
      await tarefa()
    } catch (erro) {
      console.error(`[ambienteEstudo] falha em "${rotulo}"`, erro)
      const mensagem =
        erro instanceof ApiError
          ? erro.message
          : 'Não foi possível concluir a geração. Tente novamente.'
      try {
        await aoFalhar(mensagem)
      } catch (erroAoRegistrar) {
        console.error(
          `[ambienteEstudo] falha ao registrar erro de "${rotulo}"`,
          erroAoRegistrar
        )
      }
    }
  })
}
