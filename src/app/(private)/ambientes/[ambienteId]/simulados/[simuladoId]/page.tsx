'use client'

import clsx from 'clsx'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import {
  LuArrowLeft,
  LuBan,
  LuBookmark,
  LuClock,
  LuKeyboard,
  LuListOrdered,
  LuLoader,
  LuPlay,
  LuTimer
} from 'react-icons/lu'
import Botao, { LinkBotao } from '@/components/AmbienteEstudo/Botao/Botao'
import EstadoVazio from '@/components/AmbienteEstudo/EstadoVazio/EstadoVazio'
import Esqueleto from '@/components/AmbienteEstudo/Esqueleto/Esqueleto'
import { classeCartao } from '@/components/AmbienteEstudo/estilos'
import {
  useIniciarTentativa,
  useSimulado,
  useSimulados
} from '@/hooks/ambienteEstudo/useSimulados'
import { mensagemDeErro } from '@/services/ambienteEstudo/erros'
import {
  formatarDataRelativa,
  formatarNota
} from '@/utils/ambienteEstudo/formatar'
import { ROTULO_TIPO_QUESTAO } from '@/utils/ambienteEstudo/rotulos'

/** Instruções antes de começar + histórico de tentativas. */
export default function SimuladoPage() {
  const { ambienteId, simuladoId } = useParams<{
    ambienteId: string
    simuladoId: string
  }>()
  const router = useRouter()
  const { data: simulado, isLoading, error } = useSimulado(simuladoId)
  const { data: simulados } = useSimulados(ambienteId)
  const iniciar = useIniciarTentativa()
  const base = `/ambientes/${ambienteId}/simulados`

  const tentativas =
    simulados?.find(({ id }) => id === simuladoId)?.tentativas ?? []
  const emAndamento = tentativas.find(({ entregueEm }) => !entregueEm)
  const entregues = tentativas.filter(({ resultado }) => resultado)

  const comecar = () =>
    iniciar.mutate(simuladoId, {
      onSuccess: (tentativa) =>
        router.push(`${base}/${simuladoId}/tentativas/${tentativa.id}`)
    })

  return (
    <div className="space-y-4">
      <Link
        href={base}
        className="inline-flex items-center gap-1 text-sm font-semibold text-gray-600 hover:text-gray-900"
      >
        <LuArrowLeft aria-hidden /> Simulados
      </Link>

      {isLoading && <Esqueleto className="mx-auto h-80 max-w-2xl" />}

      {error && (
        <EstadoVazio
          icone={<LuTimer />}
          titulo="Simulado não encontrado"
          descricao={mensagemDeErro(error)}
          acao={<LinkBotao href={base}>Voltar aos simulados</LinkBotao>}
        />
      )}

      {simulado?.status === 'GERANDO' && (
        <EstadoVazio
          icone={<LuLoader className="animate-spin" />}
          titulo="Montando o seu simulado..."
          descricao="A IA está selecionando e equilibrando as questões a partir dos materiais. Isso leva alguns segundos."
        />
      )}

      {simulado?.status === 'ERRO' && (
        <EstadoVazio
          icone={<LuTimer />}
          titulo="Não foi possível gerar o simulado"
          descricao="Os materiais não tinham conteúdo suficiente para os tipos de questão escolhidos. Tente outra configuração."
          acao={
            <LinkBotao href={`${base}/novo`}>
              Configurar outro simulado
            </LinkBotao>
          }
        />
      )}

      {simulado?.status === 'PRONTO' && (
        <div className="mx-auto max-w-2xl space-y-4">
          <section className={clsx(classeCartao, 'space-y-5 p-6 max-md:p-4')}>
            <div>
              <h2 className="text-2xl font-bold">{simulado.titulo}</h2>
              <p className="text-sm text-gray-500">
                {simulado.config.tiposQuestao
                  .map((tipo) => ROTULO_TIPO_QUESTAO[tipo])
                  .join(', ')}
              </p>
            </div>

            <ul className="grid gap-3 sm:grid-cols-2">
              <li className="flex items-center gap-3 rounded-xl bg-gray-50 p-3">
                <LuListOrdered className="text-xl" aria-hidden />
                <span>
                  <span className="block text-lg font-bold">
                    {simulado.questoes.length}
                  </span>
                  <span className="text-xs text-gray-500">questões</span>
                </span>
              </li>
              <li className="flex items-center gap-3 rounded-xl bg-gray-50 p-3">
                <LuClock className="text-xl" aria-hidden />
                <span>
                  <span className="block text-lg font-bold">
                    {simulado.config.duracaoMinutos
                      ? `${simulado.config.duracaoMinutos} min`
                      : 'Livre'}
                  </span>
                  <span className="text-xs text-gray-500">
                    {simulado.config.duracaoMinutos
                      ? 'de duração'
                      : 'modo treino'}
                  </span>
                </span>
              </li>
            </ul>

            {simulado.questoes.length < simulado.config.quantidadeQuestoes && (
              <p className="rounded-lg bg-amber-50 p-3 text-xs text-amber-900">
                Você pediu {simulado.config.quantidadeQuestoes} questões e a IA
                gerou {simulado.questoes.length}.
              </p>
            )}

            <div>
              <h3 className="font-bold">Antes de começar</h3>
              <ul className="mt-2 space-y-2 text-sm text-gray-700">
                {simulado.config.duracaoMinutos ? (
                  <>
                    <li className="flex gap-2">
                      <LuBan className="mt-0.5 shrink-0" aria-hidden />O
                      cronômetro não pode ser pausado e continua contando se
                      você fechar ou recarregar a página.
                    </li>
                    <li className="flex gap-2">
                      <LuClock className="mt-0.5 shrink-0" aria-hidden />
                      Você recebe avisos quando faltarem 10 e 5 minutos. Ao
                      zerar, a prova é entregue automaticamente com o que
                      estiver respondido.
                    </li>
                  </>
                ) : (
                  <li className="flex gap-2">
                    <LuClock className="mt-0.5 shrink-0" aria-hidden />
                    Modo treino: sem limite de tempo. O tempo gasto aparece no
                    resultado.
                  </li>
                )}
                <li className="flex gap-2">
                  <LuBookmark className="mt-0.5 shrink-0" aria-hidden />
                  Não há correção durante a prova. Marque questões para revisar
                  antes de entregar.
                </li>
                <li className="hidden gap-2 sm:flex">
                  <LuKeyboard className="mt-0.5 shrink-0" aria-hidden />
                  Atalhos: A–E ou 1–5 escolhem a alternativa, V/F julgam, ← →
                  navegam e M marca para revisão.
                </li>
              </ul>
            </div>

            <div className="flex flex-wrap gap-2 border-t border-gray-100 pt-5">
              {emAndamento ? (
                <LinkBotao
                  href={`${base}/${simuladoId}/tentativas/${emAndamento.id}`}
                  variante="primario"
                  tamanho="lg"
                  icone={<LuPlay aria-hidden />}
                >
                  Continuar tentativa em andamento
                </LinkBotao>
              ) : (
                <Botao
                  variante="primario"
                  tamanho="lg"
                  icone={<LuPlay aria-hidden />}
                  onClick={comecar}
                  carregando={iniciar.isPending}
                >
                  Iniciar simulado
                </Botao>
              )}
            </div>
          </section>

          {entregues.length > 0 && (
            <section className={clsx(classeCartao, 'p-5')}>
              <h3 className="font-bold">Tentativas anteriores</h3>
              <ul className="mt-2 divide-y divide-gray-100">
                {entregues.map((tentativa) => (
                  <li key={tentativa.id}>
                    <Link
                      href={`${base}/${simuladoId}/tentativas/${tentativa.id}/resultado`}
                      className="flex items-center justify-between py-2.5 text-sm hover:underline"
                    >
                      <span className="text-gray-600">
                        {formatarDataRelativa(
                          tentativa.entregueEm ?? tentativa.iniciadaEm
                        )}
                        {tentativa.entregaAutomatica &&
                          ' · entregue automaticamente'}
                      </span>
                      <span className="font-bold">
                        {formatarNota(tentativa.resultado?.notaFinal ?? 0)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}
    </div>
  )
}
