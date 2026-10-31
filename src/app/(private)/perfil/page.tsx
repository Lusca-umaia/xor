'use client'

import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react'
import { useEffect, useState } from 'react'
import { LuLock, LuShieldCheck, LuUserPen } from 'react-icons/lu'
import Header from '@/components/Header/Header'
import Skeleton from '@/components/Skeleton/Skeleton'
import { usePerfil } from '@/hooks/queries/usePerfil'
import AlterarEmail from './components/AlterarEmail'
import AlterarSenha from './components/AlterarSenha'
import DadosGerais from './components/DadosGerais'
import PerfilHero, { PerfilHeroSkeleton } from './components/PerfilHero'
import PrivacidadeIA from './components/PrivacidadeIA'

const ABAS = [
  {
    label: 'Dados gerais',
    descricao: 'Nome, matrícula e curso',
    icon: <LuUserPen />
  },
  {
    label: 'Login e segurança',
    descricao: 'Email e senha',
    icon: <LuShieldCheck />
  },
  {
    label: 'Privacidade e IA',
    descricao: 'Seus dados e uso de IA',
    icon: <LuLock />
  }
]

const ABA_SEGURANCA = 1
const ABA_PRIVACIDADE = 2

const PerfilSkeleton = () => (
  <div className="space-y-4">
    <PerfilHeroSkeleton />
    <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[18rem_1fr]">
      <div className="space-y-2 rounded-2xl border border-gray-100 bg-white p-2 shadow-lg max-lg:flex max-lg:gap-2 max-lg:space-y-0">
        <Skeleton className="h-12 w-full rounded-xl max-lg:w-36" />
        <Skeleton className="h-12 w-full rounded-xl max-lg:w-36" />
        <Skeleton className="h-12 w-full rounded-xl max-lg:w-36" />
      </div>
      <div className="space-y-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-lg">
        <Skeleton className="h-10 w-72 max-w-full" />
        <div className="grid grid-cols-6 gap-3">
          <Skeleton className="col-span-6 h-14 md:col-span-4" />
          <Skeleton className="col-span-6 h-14 md:col-span-2" />
          <Skeleton className="col-span-6 h-14" />
          <Skeleton className="col-span-3 h-14" />
          <Skeleton className="col-span-3 h-14" />
        </div>
      </div>
    </div>
  </div>
)

export default function PerfilPage() {
  const { data: perfil, isLoading, isError } = usePerfil()
  const [aba, setAba] = useState(0)

  // O menu da conta abre direto em Privacidade com ?aba=privacidade.
  useEffect(() => {
    if (
      new URLSearchParams(window.location.search).get('aba') === 'privacidade'
    )
      setAba(ABA_PRIVACIDADE)
  }, [])

  return (
    <div>
      <Header
        title="Meu perfil"
        description="Gerencie suas informações pessoais, acadêmicas e a segurança da sua conta."
      />

      {isLoading && <PerfilSkeleton />}
      {isError && (
        <p className="text-sm font-medium text-red-600">
          Não foi possível carregar seu perfil.
        </p>
      )}

      {perfil && (
        <div className="space-y-4">
          <PerfilHero perfil={perfil} />

          <TabGroup
            selectedIndex={aba}
            onChange={setAba}
            className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[18rem_1fr]"
          >
            <TabList className="flex gap-2 overflow-x-auto rounded-2xl border border-gray-100 bg-white p-2 shadow-lg lg:sticky lg:top-8 lg:flex-col">
              {ABAS.map((item) => (
                <Tab
                  key={item.label}
                  className="group flex shrink-0 cursor-pointer items-center gap-3 rounded-full px-3 py-2 text-left text-gray-900 outline-none duration-200 hover:bg-gray-100 data-focus:ring-2 data-focus:ring-xor-navy data-selected:bg-black data-selected:text-white data-selected:hover:bg-black lg:rounded-xl lg:py-3"
                >
                  <span className="text-xl">{item.icon}</span>
                  <span>
                    <span className="block text-sm font-semibold">
                      {item.label}
                    </span>
                    <span className="block text-xs text-gray-500 group-data-selected:text-gray-300 max-lg:hidden">
                      {item.descricao}
                    </span>
                  </span>
                </Tab>
              ))}
            </TabList>

            <TabPanels>
              <TabPanel className="outline-none">
                <DadosGerais
                  perfil={perfil}
                  onAlterarEmail={() => setAba(ABA_SEGURANCA)}
                />
              </TabPanel>
              <TabPanel className="space-y-4 outline-none">
                <AlterarEmail perfil={perfil} />
                <AlterarSenha />
              </TabPanel>
              <TabPanel className="outline-none">
                <PrivacidadeIA />
              </TabPanel>
            </TabPanels>
          </TabGroup>
        </div>
      )}
    </div>
  )
}
