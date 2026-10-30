'use client'
import Header from '@/components/Header/Header'
import Skeleton, { SkeletonCard } from '@/components/Skeleton/Skeleton'
import { useProgresso } from '@/hooks/queries/useProgresso'
import { LuTrendingUp } from 'react-icons/lu'
import DisciplineCard from '@/components/DisciplineCard/DisciplineCard'
import ModuleCard from '@/components/ModuleCard/ModuleCard'
import QuickStats from '@/components/QuickStats/QuickStats'
import { GiProgression } from 'react-icons/gi'
import { IoTimerSharp } from 'react-icons/io5'
import { TbMessageChatbot } from 'react-icons/tb'
import { STATUS_KEYS } from '@/components/CourseCard/CourseCard'
import { FaTasks } from 'react-icons/fa'

const moduleCard = [
  {
    nome: 'Progressão de curso',
    icon: <GiProgression className="text-4xl mx-auto" />,
    path: '/courseProgression',
    descricao:
      'Acompanhe o andamento das suas disciplinas em tempo real. Uma forma clara e visual de entender seu crescimento acadêmico.'
  },
  {
    nome: 'Pomodoro',
    icon: <IoTimerSharp className="text-4xl mx-auto" />,
    path: '/pomodoro',
    descricao:
      'Organize seu tempo de estudo com a técnica Pomodoro. Alterne entre períodos de foco e pausas estratégicas para manter a produtividade em alta.'
  },
  {
    nome: 'Chat com IA',
    icon: <TbMessageChatbot className="text-4xl mx-auto" />,
    path: '/chat',
    descricao:
      'Tire dúvidas, revise conteúdos ou peça sugestões de estudo com a ajuda de uma Inteligência Artificial treinada para te apoiar durante a jornada.'
  },
  {
    nome: 'Questões',
    icon: <FaTasks className="text-4xl mx-auto" />,
    path: '/questoes/lista-questionario',
    descricao: 'Resolva questões para testar e reforçar seus conhecimentos.'
  }
]

const HomePage = () => {
  const { data, isLoading, isError } = useProgresso()

  const cadeirasAtivas =
    data?.disciplinas.filter(
      ({ status }) => status === STATUS_KEYS.ANDAMENTO
    ) ?? []

  const primeiroNome = data?.aluno.nome.split(' ')[0]

  return (
    <div>
      {isLoading ? (
        <div className="mb-4 space-y-2">
          <Skeleton className="h-8 w-80 max-w-full" />
          <Skeleton className="h-4 w-[32rem] max-w-full" />
        </div>
      ) : (
        <Header
          title={
            primeiroNome
              ? `Bem-vindo(a) de volta, ${primeiroNome}!`
              : 'Bem-vindo(a) de volta!'
          }
          description="Acompanhe sua evolução, conclua desafios e aproveite ferramentas que potencializam seus estudos!"
        />
      )}
      <div className="space-y-4">
        <div className="grid grid-cols-1 2xl:grid-cols-4 items-start max-2xl:gap-y-4 2xl:gap-4">
          <QuickStats
            carregando={isLoading}
            curso={data?.aluno.curso?.nome}
            semestre={data?.aluno.semestreAtual}
            progresso={data?.resumo.percentualGeral}
          />
          <div className="col-span-3 flex flex-col gap-4">
            <div className="bg-white border border-gray-100 rounded-2xl space-y-6 shadow-lg p-6">
              <span className="max-lg:text-base text-xl flex items-center gap-2">
                <LuTrendingUp className="text-muted-foreground" />
                <h3 className=" font-bold leading-none tracking-tight">
                  Disciplinas em andamento
                </h3>
              </span>
              {isLoading && (
                <div className="grid grid-cols-1 2xl:grid-cols-2 gap-4">
                  {Array.from({ length: 4 }, (_, i) => (
                    <SkeletonCard key={i} className="p-6" />
                  ))}
                </div>
              )}
              {isError && (
                <p className="text-sm font-medium text-red-600">
                  Não foi possível carregar seus dados.
                </p>
              )}
              {data && cadeirasAtivas.length === 0 && (
                <p className="text-sm text-gray-500">
                  Nenhuma disciplina em andamento. Você pode escolher as
                  disciplinas do próximo semestre na tela de progressão.
                </p>
              )}
              <div className="grid grid-cols-1 2xl:grid-cols-2  gap-4">
                {cadeirasAtivas.map((cadeira) => (
                  <DisciplineCard
                    key={cadeira.id}
                    id={cadeira.id}
                    nome={cadeira.nome}
                    status={STATUS_KEYS.ANDAMENTO}
                  />
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 max-md:grid-cols-1 2xl:grid-cols-3 justify-end gap-4">
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
        </div>
      </div>
    </div>
  )
}

export default HomePage
