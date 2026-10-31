'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { LuLoader, LuTimer } from 'react-icons/lu'
import { LinkBotao } from '@/components/AmbienteEstudo/Botao/Botao'
import EstadoVazio from '@/components/AmbienteEstudo/EstadoVazio/EstadoVazio'
import Esqueleto from '@/components/AmbienteEstudo/Esqueleto/Esqueleto'
import ProvaSimulado from '@/components/AmbienteEstudo/Simulado/ProvaSimulado'
import {
  useSimulado,
  useTentativaSimulado
} from '@/hooks/ambienteEstudo/useSimulados'
import { mensagemDeErro } from '@/services/ambienteEstudo/erros'

export default function TentativaPage() {
  const { ambienteId, simuladoId, tentativaId } = useParams<{
    ambienteId: string
    simuladoId: string
    tentativaId: string
  }>()
  const router = useRouter()
  const simulado = useSimulado(simuladoId)
  const tentativa = useTentativaSimulado(tentativaId)
  const base = `/ambientes/${ambienteId}/simulados/${simuladoId}`
  const resultadoHref = `${base}/tentativas/${tentativaId}/resultado`
  const entregue = Boolean(tentativa.data?.entregueEm)

  // Tentativa já entregue (inclusive por prazo vencido ao abrir): vai para o resultado.
  useEffect(() => {
    if (entregue) router.replace(resultadoHref)
  }, [entregue, router, resultadoHref])

  if (simulado.error || tentativa.error) {
    return (
      <EstadoVazio
        icone={<LuTimer />}
        titulo="Tentativa não encontrada"
        descricao={mensagemDeErro(simulado.error ?? tentativa.error)}
        acao={<LinkBotao href={base}>Voltar ao simulado</LinkBotao>}
      />
    )
  }

  if (!simulado.data || !tentativa.data) {
    return <Esqueleto className="mx-auto h-96 max-w-5xl" />
  }

  if (entregue) {
    return (
      <EstadoVazio
        icone={<LuLoader className="animate-spin" />}
        titulo="Simulado entregue"
        descricao="Abrindo o resultado..."
      />
    )
  }

  return (
    <ProvaSimulado
      simulado={simulado.data}
      tentativa={tentativa.data}
      resultadoHref={resultadoHref}
    />
  )
}
