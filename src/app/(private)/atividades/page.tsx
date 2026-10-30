'use client'
import { LuTriangleAlert } from 'react-icons/lu'
import Header from '@/components/Header/Header'
import Skeleton from '@/components/Skeleton/Skeleton'
import { useAgenda } from '@/hooks/useAgenda'
import { useDisciplinasAtivas } from '@/hooks/useDisciplinasAtivas'
import ListaAtividades from './components/ListaAtividades'

const AtividadesPage = () => {
  const { ativas, isLoading } = useDisciplinasAtivas()
  const { atividades, setAtividades, semanaAtual } = useAgenda()

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-80 max-w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  return (
    <div>
      <Header
        title="Atividades"
        description="Trabalhos, listas e leituras por disciplina, com prioridade e prazo."
      />
      <div className="space-y-4">
        {semanaAtual.critica && (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900"
          >
            <LuTriangleAlert className="mt-0.5 shrink-0" />
            <p>
              <strong>Semana crítica:</strong> {semanaAtual.motivos.join(' · ')}
              . Veja o Calendário para redistribuir.
            </p>
          </div>
        )}
        <ListaAtividades
          disciplinas={ativas}
          atividades={atividades}
          setAtividades={setAtividades}
        />
      </div>
    </div>
  )
}

export default AtividadesPage
