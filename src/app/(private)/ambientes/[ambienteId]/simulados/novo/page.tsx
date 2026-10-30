'use client'

import { useParams, useRouter } from 'next/navigation'
import FormNovoSimulado from '@/components/AmbienteEstudo/Simulado/FormNovoSimulado'
import { useMateriais } from '@/hooks/ambienteEstudo/useMateriais'
import { useGerarSimulado } from '@/hooks/ambienteEstudo/useSimulados'

export default function NovoSimuladoPage() {
  const { ambienteId } = useParams<{ ambienteId: string }>()
  const router = useRouter()
  const { data: materiais = [] } = useMateriais(ambienteId)
  const gerar = useGerarSimulado(ambienteId)
  const base = `/ambientes/${ambienteId}/simulados`

  return (
    <FormNovoSimulado
      ambienteId={ambienteId}
      materiais={materiais}
      gerando={gerar.isPending}
      aoCancelar={() => router.push(base)}
      aoGerar={(dados) =>
        gerar.mutate(dados, {
          onSuccess: (simulado) => router.push(`${base}/${simulado.id}`)
        })
      }
    />
  )
}
