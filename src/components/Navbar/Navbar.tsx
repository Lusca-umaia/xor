'use client'
import {
  LuBookOpen,
  LuCalendarDays,
  LuClipboardList,
  LuLibraryBig,
  LuListChecks,
  LuGraduationCap,
  LuTimer,
  LuUserRound
} from 'react-icons/lu'
import { GiProgression } from 'react-icons/gi'
import { FaHome } from 'react-icons/fa'
import NavbarMobile from './NavbarMobile'
import NavbarDescktop from './NavbarDescktop'

// Menu em grupos; o título vazio fica sem cabeçalho (início e perfil).
export const grupos = [
  {
    titulo: null,
    itens: [
      {
        path: '/home',
        icon: <FaHome />,
        name: 'Tela Inicial'
      }
    ]
  },
  {
    titulo: 'Estudo',
    itens: [
      {
        icon: <LuGraduationCap />,
        path: '/ambientes',
        name: 'Ambientes de estudo'
      },
      {
        icon: <LuTimer />,
        path: '/pomodoro',
        name: 'Pomodoro'
      },
      {
        icon: <LuLibraryBig />,
        path: '/materiais',
        name: 'Biblioteca'
      }
    ]
  },
  {
    titulo: 'Curso',
    itens: [
      {
        icon: <GiProgression />,
        path: '/courseProgression',
        name: 'Progressão de curso'
      },
      {
        icon: <LuBookOpen />,
        path: '/academico',
        name: 'Vida acadêmica'
      },
      {
        icon: <LuListChecks />,
        path: '/planejador',
        name: 'Planejador de matrícula'
      }
    ]
  },
  {
    titulo: 'Organização',
    itens: [
      {
        icon: <LuCalendarDays />,
        path: '/calendario',
        name: 'Calendário'
      },
      {
        icon: <LuClipboardList />,
        path: '/atividades',
        name: 'Tarefas e prazos'
      }
    ]
  },
  {
    titulo: null,
    itens: [
      {
        icon: <LuUserRound />,
        path: '/perfil',
        name: 'Meu perfil'
      }
    ]
  }
]

export default function Navbar() {
  return (
    <>
      <NavbarMobile />
      <NavbarDescktop />
    </>
  )
}
