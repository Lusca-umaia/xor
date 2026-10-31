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

export const options = [
  {
    path: '/home',
    icon: <FaHome />,
    name: 'Tela Inicial'
  },
  {
    icon: <GiProgression />,
    path: '/courseProgression',
    name: 'Progressão de curso'
  },
  {
    icon: <LuGraduationCap />,
    path: '/ambientes',
    name: 'Ambientes de estudo'
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
  },
  {
    icon: <LuCalendarDays />,
    path: '/calendario',
    name: 'Calendário'
  },
  {
    icon: <LuClipboardList />,
    path: '/atividades',
    name: 'Atividades'
  },
  {
    icon: <LuLibraryBig />,
    path: '/materiais',
    name: 'Materiais de estudo'
  },
  {
    icon: <LuTimer />,
    path: '/pomodoro',
    name: 'Pomodoro'
  },
  {
    icon: <LuUserRound />,
    path: '/perfil',
    name: 'Meu perfil'
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
