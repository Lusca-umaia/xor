'use client'

import clsx from 'clsx'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useState } from 'react'
import { LuLoader, LuPlus, LuTimer, LuTrash2 } from 'react-icons/lu'
import { SimuladoListagem } from '@/@types/AmbienteEstudo'
import { LinkBotao } from '@/components/AmbienteEstudo/Botao/Botao'
import EstadoVazio from '@/components/AmbienteEstudo/EstadoVazio/EstadoVazio'
import { EsqueletoCards } from '@/components/AmbienteEstudo/Esqueleto/Esqueleto'
import { classeCartao } from '@/components/AmbienteEstudo/estilos'
import MenuAcoes from '@/components/AmbienteEstudo/MenuAcoes/MenuAcoes'
import ModalConfirmacao from '@/components/AmbienteEstudo/ModalConfirmacao/ModalConfirmacao'
import {
  useExcluirSimulado,
  useSimulados
} from '@/hooks/ambienteEstudo/useSimulados'
import {
  formatarDataRelativa,
  formatarNota
} from '@/utils/ambienteEstudo/formatar'
import { ROTULO_TIPO_QUESTAO } from '@/utils/ambienteEstudo/rotulos'

function resumoConfig(simulado: SimuladoListagem) {
  const { config, questoes, status } = simulado
  return [
    `${status === 'PRONTO' ? questoes.length : config.quantidadeQuestoes} questões`,
    config.duracaoMinutos
      ? `${config.duracaoMinutos} min`
      : 'treino, sem cronômetro',
    config.tiposQuestao.map((tipo) => ROTULO_TIPO_QUESTAO[tipo]).join(', ')
  ].join(' · ')
}

export default function SimuladosPage() {
  const { ambienteId } = useParams<{ ambienteId: string }>()
  const { data: simulados, isLoading } = useSimulados(ambienteId)
  const excluir = useExcluirSimulado()
  const [excluindo, setExcluindo] = useState<SimuladoListagem | null>(null)
  const base = `/ambientes/${ambienteId}/simulados`

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <LinkBotao
          href={`${base}/novo`}
          variante="primario"
          icone={<LuPlus aria-hidden />}
        >
          Novo simulado
        </LinkBotao>
      </div>

      {isLoading && <EsqueletoCards quantidade={2} />}

      {simulados?.length === 0 && (
        <EstadoVazio
          icone={<LuTimer />}
          titulo="Nenhum simulado ainda"
          descricao="Monte uma prova com cronômetro a partir dos seus materiais e descubra quais tópicos precisam de mais estudo."
          acao={
            <LinkBotao href={`${base}/novo`} variante="primario">
              Criar simulado
            </LinkBotao>
          }
        />
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        {simulados?.map((simulado) => {
          const emAndamento = simulado.tentativas.find(
            ({ entregueEm }) => !entregueEm
          )
          const entregues = simulado.tentativas.filter(
            ({ resultado }) => resultado
          )
          const gerando = simulado.status === 'GERANDO'

          return (
            <div
              key={simulado.id}
              className={clsx(classeCartao, 'flex flex-col gap-4 p-5')}
            >
              <div className="flex items-start gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-lg">
                  {gerando ? (
                    <LuLoader className="animate-spin" aria-hidden />
                  ) : (
                    <LuTimer aria-hidden />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <Link
                    href={`${base}/${simulado.id}`}
                    className="font-bold hover:underline"
                  >
                    {simulado.titulo}
                  </Link>
                  <p className="text-xs text-gray-500">
                    {resumoConfig(simulado)}
                  </p>
                </div>
                <MenuAcoes
                  acoes={[
                    {
                      rotulo: 'Excluir',
                      icone: <LuTrash2 />,
                      perigosa: true,
                      aoClicar: () => setExcluindo(simulado)
                    }
                  ]}
                />
              </div>

              {gerando && (
                <p className="text-sm text-gray-500" role="status">
                  Gerando as questões...
                </p>
              )}
              {simulado.status === 'ERRO' && (
                <p className="text-sm text-red-600">
                  Não foi possível gerar questões com essa configuração.
                </p>
              )}

              {entregues.length > 0 && (
                <ul className="divide-y divide-gray-100 rounded-xl bg-gray-50 px-3">
                  {entregues.slice(0, 3).map((tentativa) => (
                    <li key={tentativa.id}>
                      <Link
                        href={`${base}/${simulado.id}/tentativas/${tentativa.id}/resultado`}
                        className="flex items-center justify-between py-2 text-sm hover:underline"
                      >
                        <span className="text-gray-600">
                          {formatarDataRelativa(
                            tentativa.entregueEm ?? tentativa.iniciadaEm
                          )}
                          {tentativa.entregaAutomatica && ' · tempo esgotado'}
                        </span>
                        <span className="font-bold">
                          {formatarNota(tentativa.resultado?.notaFinal ?? 0)}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}

              <div className="mt-auto flex flex-wrap gap-2">
                {emAndamento ? (
                  <LinkBotao
                    href={`${base}/${simulado.id}/tentativas/${emAndamento.id}`}
                    variante="primario"
                  >
                    Continuar tentativa
                  </LinkBotao>
                ) : (
                  simulado.status === 'PRONTO' && (
                    <LinkBotao
                      href={`${base}/${simulado.id}`}
                      variante="primario"
                    >
                      {entregues.length ? 'Refazer' : 'Iniciar'}
                    </LinkBotao>
                  )
                )}
              </div>
            </div>
          )
        })}
      </div>

      <ModalConfirmacao
        aberto={excluindo !== null}
        aoFechar={() => setExcluindo(null)}
        titulo="Excluir simulado?"
        perigoso
        textoConfirmar="Excluir"
        carregando={excluir.isPending}
        mensagem={`“${excluindo?.titulo}” e todas as tentativas serão excluídos.`}
        aoConfirmar={() =>
          excluindo &&
          excluir.mutate(excluindo.id, { onSuccess: () => setExcluindo(null) })
        }
      />
    </div>
  )
}
