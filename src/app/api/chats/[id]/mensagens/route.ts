import { handler, ok, parseBody, requireUser } from '@/lib/api/http'
import { enviarMensagem, listarMensagens } from '@/lib/api/ambienteEstudo/chats'
import { lerId, novaMensagemSchema } from '@/lib/api/ambienteEstudo/schemas'

type Rota = { params: Promise<{ id: string }> }

export const GET = handler(async (_: Request, { params }: Rota) =>
  ok(await listarMensagens(await requireUser(), await lerId(params, 'id')))
)

/**
 * Resposta em streaming (text/plain). A primeira linha é um JSON com
 * { mensagemAluno, mensagemAssistente }; o resto é o texto do assistente,
 * na ordem em que o modelo gera. Se o cliente abortar, o texto recebido
 * até ali é salvo. (Cabeçalhos HTTP não servem: mensagens longas estouram
 * o limite de tamanho.)
 */
export const POST = handler(async (request: Request, { params }: Rota) => {
  const id = await lerId(params, 'id')
  const dados = await parseBody(request, novaMensagemSchema)
  const { mensagemAluno, mensagemAssistente, fluxo } = await enviarMensagem(
    await requireUser(),
    id,
    dados,
    request.signal
  )

  const codificador = new TextEncoder()
  const corpo = new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(
        codificador.encode(
          `${JSON.stringify({ mensagemAluno, mensagemAssistente })}\n`
        )
      )
    },
    async pull(controller) {
      const { value, done } = await fluxo.next()
      if (done) controller.close()
      else controller.enqueue(codificador.encode(value))
    },
    async cancel() {
      await fluxo.return(undefined)
    }
  })

  return new Response(corpo, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform'
    }
  })
})
