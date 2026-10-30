'use client'
import {
  LuCalendarDays,
  LuClipboardList,
  LuGraduationCap,
  LuTimer,
  LuUserRound
} from 'react-icons/lu'
import { FaTasks } from 'react-icons/fa'
import { GiProgression } from 'react-icons/gi'
import { FaHome } from 'react-icons/fa'
import NavbarMobile from './NavbarMobile'
import NavbarDescktop from './NavbarDescktop'
import { TbMessageChatbot } from 'react-icons/tb'

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
    path: '/academico',
    name: 'Vida acadêmica'
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
    icon: <LuTimer />,
    path: '/pomodoro',
    name: 'Pomodoro'
  },
  {
    icon: <TbMessageChatbot />,
    path: '/chat',
    name: 'Assistente com IA'
  },
  {
    icon: <FaTasks />,
    path: '/questoes/lista-questionario',
    name: 'Questões'
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
