'use client'
import Link from 'next/link'
import { useMemo } from 'react'
import {
  LuArrowRight,
  LuBookOpen,
  LuCirclePlay,
  LuGraduationCap,
  LuTimer,
  LuTrendingUp
} from 'react-icons/lu'
import type { ResumoCadeira } from '@/@types/AmbienteEstudo'
import DisciplineCard from '@/components/DisciplineCard/DisciplineCard'
import EstadoVazio from '@/components/EstadoVazio/EstadoVazio'
import IconeTile from '@/components/IconeTile/IconeTile'
import ModuleCard from '@/components/ModuleCard/ModuleCard'
import Skeleton, { SkeletonCard } from '@/components/Skeleton/Skeleton'
import { STATUS_KEYS } from '@/components/CourseCard/CourseCard'
import { useResumoCadeiras } from '@/hooks/ambienteEstudo/useAmbientes'
import { useProgresso } from '@/hooks/queries/useProgresso'
import { useSessoesFoco } from '@/hooks/queries/useSessoesFoco'
import { useAgenda } from '@/hooks/useAgenda'
import GraficoSemana from '../pomodoro/components/GraficoSemana'
import { CONFIG_PADRAO } from '../pomodoro/consts'
import { useArmazenado } from '../pomodoro/hooks/useArmazenado'
import { resumirSessoes } from '../pomodoro/utils/estatisticas'
import BoasVindas, { BoasVindasSkeleton } from './components/BoasVindas'
import ContinuarEstudo from './components/ContinuarEstudo'
import { AcaoEstudo, EstudoDaCadeira } from './components/EstudoCadeira'
import FocoHoje from './components/FocoHoje'
import { proximoPasso, situacaoDoEstudo } from './utils/estudoCadeira'

const moduleCard = [
  {
    nome: 'Progressão de curso',
    icon: <LuTrendingUp />,
    path: '/courseProgression',
    descricao:
      'Acompanhe suas disciplinas e veja quanto falta para concluir o curso.'
  },
  {
    nome: 'Pomodoro',
    icon: <LuTimer />,
    path: '/pomodoro',
    descricao:
      'Alterne períodos de foco e pausas para manter a produtividade em alta.'
  },
  {
    nome: 'Ambientes de estudo',
    icon: <LuGraduationCap />,
    path: '/ambientes',
    descricao:
      'Materiais, chats, resumos e simulados de cada cadeira em um só lugar.'
  },
  {
    nome: 'Vida acadêmica',
    icon: <LuBookOpen />,
    path: '/academico',
    descricao: 'Veja seu desempenho, os pré-requisitos e o relatório do curso.'
  }
]

const HomePage = () => {
  const { data, isLoading, isError } = useProgresso()
  const { data: sessoes } = useSessoesFoco()
  const [configPomodoro] = useArmazenado('xor:pomodoro:config', CONFIG_PADRAO)
  const resumos = useResumoCadeiras()
  const agenda = useAgenda()

  // Só calcula depois de carregar: depende da data local do navegador.
  const foco = useMemo(
    () => (sessoes ? resumirSessoes(sessoes) : undefined),
    [sessoes]
  )

  const cadeirasAtivas =
    data?.disciplinas.filter(
      ({ status }) => status === STATUS_KEYS.ANDAMENTO
    ) ?? []

  // Com mais de um ambiente para a mesma cadeira, vale o estudado por último.
  const resumoPorCodigo = useMemo(() => {
    const mapa = new Map<string, ResumoCadeira>()
    for (const resumo of resumos.data ?? []) {
      const atual = mapa.get(resumo.disciplinaCodigo)
      if (
        !atual ||
        (resumo.ultimoEstudoEm ?? '') > (atual.ultimoEstudoEm ?? '')
      )
        mapa.set(resumo.disciplinaCodigo, resumo)
    }
    return mapa
  }, [resumos.data])

  const nomeDaCadeira = (codigo: string) =>
    data?.disciplinas.find((d) => d.codigo === codigo)?.nome

  return (
    <div className="space-y-4">
      {isLoading && <BoasVindasSkeleton />}
      {isError && (
        <p className="text-sm font-medium text-red-600">
          Não foi possível carregar seus dados.
        </p>
      )}
      {data && (
        <BoasVindas
          aluno={data.aluno}
          resumo={data.resumo}
          foco={foco}
          metaDiaria={configPomodoro.metaDiaria}
        />
      )}

      <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-3">
        <div className="space-y-4 xl:col-span-2">
          <section className="space-y-5 rounded-2xl border border-gray-100 bg-white p-6 shadow-lg max-md:p-4">
            <header className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <IconeTile>
                  <LuBookOpen />
                </IconeTile>
                <div>
                  <h2 className="text-lg font-bold leading-tight tracking-tight max-md:text-base">
                    Disciplinas em andamento
                  </h2>
                  {data ? (
                    <p className="text-sm text-gray-500">
                      {data.aluno.semestreAtual}º semestre ·{' '}
                      {cadeirasAtivas.length}{' '}
                      {cadeirasAtivas.length === 1
                        ? 'disciplina'
                        : 'disciplinas'}
                    </p>
                  ) : (
                    <Skeleton className="mt-1 h-4 w-40" />
                  )}
                </div>
              </div>
              <Link
                href="/courseProgression"
                className="inline-flex items-center gap-1 text-sm font-semibold text-xor-navy hover:text-xor-slate"
              >
                Ver progressão
                <LuArrowRight />
              </Link>
            </header>

            {isLoading && (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {Array.from({ length: 4 }, (_, i) => (
                  <SkeletonCard key={i} className="p-6" />
                ))}
              </div>
            )}

            {data && cadeirasAtivas.length === 0 && (
              <EstadoVazio
                icon={<LuCirclePlay />}
                titulo="Nenhuma disciplina em andamento"
                descricao="Escolha as disciplinas do próximo semestre na tela de progressão."
                acao={
                  <Link
                    href="/courseProgression"
                    className="rounded-md bg-xor-navy px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-xor-navy/90"
                  >
                    Ir para a progressão
                  </Link>
                }
              />
            )}

            {cadeirasAtivas.length > 0 && (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {cadeirasAtivas.map((cadeira) => {
                  const resumo = resumoPorCodigo.get(cadeira.codigo)
                  return (
                    <DisciplineCard
                      key={cadeira.id}
                      nome={cadeira.nome}
                      codigo={cadeira.codigo}
                      cargaHoraria={cadeira.cargaHoraria}
                      periodo={cadeira.periodo}
                      status={STATUS_KEYS.ANDAMENTO}
                      estudo={
                        resumos.data && (
                          <EstudoDaCadeira
                            situacao={resumo && situacaoDoEstudo(resumo)}
                            passo={proximoPasso({
                              codigo: cadeira.codigo,
                              resumo,
                              eventos: agenda.eventos,
                              atividades: agenda.atividades
                            })}
                          />
                        )
                      }
                      acaoEstudo={
                        resumos.isLoading ? (
                          <Skeleton className="h-9 flex-1 rounded-md" />
                        ) : (
                          <AcaoEstudo
                            ambienteId={resumo?.ambienteId}
                            codigo={cadeira.codigo}
                            nome={cadeira.nome}
                            indisponivel={resumos.isError}
                          />
                        )
                      }
                    />
                  )
                })}
              </div>
            )}
          </section>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {moduleCard.map((module) => (
              <ModuleCard
                key={module.nome}
                icon={module.icon}
                nome={module.nome}
                path={module.path}
                descricao={module.descricao}
              />
            ))}
          </div>
        </div>

        <aside className="space-y-4">
          <FocoHoje foco={foco} metaDiaria={configPomodoro.metaDiaria} />
          {foco ? (
            <GraficoSemana
              dias={foco.ultimos7Dias}
              metaMinutos={configPomodoro.metaDiaria * configPomodoro.foco}
            />
          ) : (
            <Skeleton className="h-64 rounded-2xl" />
          )}
          {resumos.data && (
            <ContinuarEstudo
              resumos={resumos.data}
              nomeDaCadeira={nomeDaCadeira}
            />
          )}
        </aside>
      </div>
    </div>
  )
}

export default HomePage
