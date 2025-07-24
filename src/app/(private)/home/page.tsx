import Header from '@/components/Header/Header'
import { LuTrendingUp } from 'react-icons/lu'
import { FaBook } from 'react-icons/fa'
import DisciplineCard from '@/components/DisciplineCard/DisciplineCard'
import ModuleCard from '@/components/ModuleCard/ModuleCard'
import QuickStats from '@/components/QuickStats/QuickStats'
import { GiProgression } from 'react-icons/gi'
import { IoTimerSharp } from 'react-icons/io5'
import { TbMessageChatbot } from 'react-icons/tb'
import { STATUS_KEYS } from '@/components/CourseCard/CourseCard'

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
  }
]

const mockData = {
  nomeUsuario: 'Lucas Maia',
  cadeiras: [
    {
      id: 1,
      nome: 'Algoritmos em Grafos',
      xp: 2000,
      status: STATUS_KEYS.ANDAMENTO
    },
    {
      id: 2,
      nome: 'Sistema de Gerenciamento de Banco de Dados',
      xp: 3000,
      status: STATUS_KEYS.ANDAMENTO
    },
    {
      id: 3,
      nome: 'Redes de Computadores',
      xp: 2000,
      status: STATUS_KEYS.ANDAMENTO
    },
    {
      id: 4,
      nome: 'Filosofia da Mente',
      xp: 2000,
      status: STATUS_KEYS.CONCLUIDA
    }
  ]
}

const HomePage = () => {
  return (
    <div>
      <Header
        title={`Bem-vindo(a) de volta, ${mockData.nomeUsuario}!`}
        description="Acompanhe sua evolução, conclua desafios e aproveite ferramentas que potencializam seus estudos!"
      />
      <div className="space-y-4">
        <div className="grid grid-cols-1 2xl:grid-cols-4 items-start max-2xl:gap-y-4 2xl:gap-4">
          <QuickStats />
          <div className="col-span-3 flex flex-col gap-4">
            <div className="bg-white border border-gray-100 rounded-2xl space-y-6 shadow-lg p-6">
              <span className="text-xl flex items-center gap-2">
                <LuTrendingUp className="text-muted-foreground" />
                <h3 className=" font-bold leading-none tracking-tight">
                  Visão geral da progressão do curso
                </h3>
              </span>
              <div className="grid grid-cols-1 2xl:grid-cols-2  gap-4">
                {mockData.cadeiras.map((cadeira) => (
                  <DisciplineCard
                    key={cadeira.id}
                    nome={cadeira.nome}
                    status={cadeira.status}
                    xp={cadeira.xp}
                  />
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 2xl:grid-cols-3 justify-end gap-4">
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
