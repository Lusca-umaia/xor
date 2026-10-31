// Itens do menu, compartilhados pelas barras do desktop e do celular. Fica
// fora do Navbar.tsx para não criar importação circular com elas.
import { ReactNode } from 'react'
import {
  LuBookOpen,
  LuCalendarDays,
  LuChartNoAxesColumnIncreasing,
  LuClipboardList,
  LuGraduationCap,
  LuHouse,
  LuLibraryBig,
  LuListChecks,
  LuTimer
} from 'react-icons/lu'

export interface ItemNav {
  path: string
  icon: ReactNode
  name: string
  // Nome curto para a barra inferior do celular.
  curto?: string
}

// Menu em grupos; o título vazio fica sem cabeçalho (início). O perfil fica
// no menu da conta, no rodapé da barra.
export const grupos: { titulo: string | null; itens: ItemNav[] }[] = [
  {
    titulo: null,
    itens: [
      {
        path: '/home',
        icon: <LuHouse />,
        name: 'Tela Inicial',
        curto: 'Início'
      }
    ]
  },
  {
    titulo: 'Estudo',
    itens: [
      {
        path: '/ambientes',
        icon: <LuGraduationCap />,
        name: 'Ambientes de estudo',
        curto: 'Ambientes'
      },
      { path: '/pomodoro', icon: <LuTimer />, name: 'Pomodoro' },
      { path: '/materiais', icon: <LuLibraryBig />, name: 'Biblioteca' }
    ]
  },
  {
    titulo: 'Curso',
    itens: [
      {
        path: '/courseProgression',
        icon: <LuChartNoAxesColumnIncreasing />,
        name: 'Progressão de curso'
      },
      { path: '/academico', icon: <LuBookOpen />, name: 'Vida acadêmica' },
      {
        path: '/planejador',
        icon: <LuListChecks />,
        name: 'Planejador de matrícula'
      }
    ]
  },
  {
    titulo: 'Organização',
    itens: [
      {
        path: '/calendario',
        icon: <LuCalendarDays />,
        name: 'Calendário',
        curto: 'Agenda'
      },
      {
        path: '/atividades',
        icon: <LuClipboardList />,
        name: 'Tarefas e prazos'
      }
    ]
  }
]

// Destinos fixos da barra inferior do celular; o resto fica em "Mais".
export const ATALHOS_MOBILE = [
  '/home',
  '/ambientes',
  '/pomodoro',
  '/calendario'
]

export const PERFIL = '/perfil'
export const PRIVACIDADE = '/perfil?aba=privacidade'

/** Item ativo: a rota exata ou uma subrota dela. */
export const estaAtivo = (pathname: string, path: string) =>
  pathname === path || pathname.startsWith(`${path}/`)
