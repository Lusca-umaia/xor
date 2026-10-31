'use client'
import clsx from 'clsx'
import { ReactNode, useEffect, useMemo, useState } from 'react'
import {
  LuAward,
  LuCalculator,
  LuChartLine,
  LuFileText,
  LuNetwork
} from 'react-icons/lu'
import type { Avaliacao, SituacaoCurricular } from '@/@types/Academico'
import Header from '@/components/Header/Header'
import Skeleton from '@/components/Skeleton/Skeleton'
import { useAcademico } from '@/hooks/queries/useAcademico'
import { useDisciplinasAtivas } from '@/hooks/useDisciplinasAtivas'
import { CHAVES } from '@/services/academico/chaves'
import { AVALIACOES_DEMO } from '@/services/mocks/historico'
import { CURRICULO_CC } from '@/services/mocks/curriculoCC'
import { situacoes } from '@/utils/academico'
import { useArmazenado } from '../pomodoro/hooks/useArmazenado'
import CalculadoraTab from './components/CalculadoraTab'
import { AvisoDemo, Card } from './components/Comuns'
import DesempenhoTab from './components/DesempenhoTab'
import PortfolioTab from './components/PortfolioTab'
import PreRequisitosTab from './components/PreRequisitosTab'
import RelatorioTab from './components/RelatorioTab'

const TABS = [
  { key: 'desempenho', label: 'Desempenho', icon: <LuChartLine /> },
  { key: 'calculadora', label: 'Calculadora de meta', icon: <LuCalculator /> },
  { key: 'prerequisitos', label: 'Pré-requisitos', icon: <LuNetwork /> },
  { key: 'relatorio', label: 'Relatório', icon: <LuFileText /> },
  { key: 'portfolio', label: 'Portfólio', icon: <LuAward /> }
] as const satisfies readonly { key: string; label: string; icon: ReactNode }[]

type TabKey = (typeof TABS)[number]['key']

const AcademicoPage = () => {
  const [tab, setTab] = useState<TabKey>('desempenho')
  const { data, isLoading, isError } = useAcademico()
  const { ativas, isLoading: carregandoAtivas } = useDisciplinasAtivas()
  // O padrão precisa existir já no primeiro render (o hook o captura uma vez).
  const [avaliacoes, setAvaliacoes, avaliacoesOk] = useArmazenado<
    Record<string, Avaliacao[]>
  >(CHAVES.avaliacoes, {})

  // Versões anteriores gravavam avaliações de exemplo: remove as que ainda são idênticas.
  useEffect(() => {
    if (!avaliacoesOk) return
    const exemplo = (codigo: string) =>
      JSON.stringify(avaliacoes[codigo]) ===
      JSON.stringify(AVALIACOES_DEMO[codigo])
    if (!Object.keys(avaliacoes).some(exemplo)) return
    setAvaliacoes((atual) =>
      Object.fromEntries(Object.entries(atual).filter(([c]) => !exemplo(c)))
    )
  }, [avaliacoesOk, avaliacoes, setAvaliacoes])

  const situacao = useMemo(
    () =>
      data
        ? situacoes(CURRICULO_CC, data.historico)
        : new Map<string, SituacaoCurricular>(),
    [data]
  )

  if (isLoading || carregandoAtivas) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-80 max-w-full" />
        <Skeleton className="h-11 w-96 max-w-full rounded-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (isError || !data) {
    return (
      <p className="text-sm font-medium text-red-600">
        Não foi possível carregar seus dados acadêmicos.
      </p>
    )
  }

  // O mapa usa a matriz de CC; para outros cursos não há dados de pré-requisitos.
  const codigosCC = new Set(CURRICULO_CC.map((d) => d.codigo))
  const temMatrizCC =
    data.demonstracao || data.curriculo.some((d) => codigosCC.has(d.codigo))

  return (
    <div>
      <Header
        title="Vida acadêmica"
        description="Desempenho, calculadora de meta, pré-requisitos, relatório semestral e portfólio."
      />
      <div className="space-y-4">
        {data.demonstracao && <AvisoDemo />}

        <div
          role="tablist"
          className="flex w-fit max-w-full gap-1 overflow-x-auto rounded-full border border-gray-100 bg-white p-1 shadow-lg"
        >
          {TABS.map(({ key, label, icon }) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={tab === key}
              onClick={() => setTab(key)}
              className={clsx(
                'flex shrink-0 cursor-pointer items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold duration-200 max-md:px-3',
                tab === key
                  ? 'bg-black text-white'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              )}
            >
              <span className="text-base max-sm:hidden">{icon}</span>
              {label}
            </button>
          ))}
        </div>

        {tab === 'desempenho' && (
          <DesempenhoTab
            curriculo={data.curriculo}
            historico={data.historico}
            semPeriodo={data.semPeriodo}
          />
        )}
        {tab === 'calculadora' && (
          <CalculadoraTab
            disciplinas={ativas}
            avaliacoes={avaliacoes}
            setAvaliacoes={setAvaliacoes}
          />
        )}
        {tab === 'prerequisitos' &&
          (temMatrizCC ? (
            <PreRequisitosTab curriculo={CURRICULO_CC} situacao={situacao} />
          ) : (
            <Card>
              <p className="text-sm text-gray-600">
                O mapa de pré-requisitos só está disponível para o curso de
                Ciência da Computação (matriz 2024.1). Nenhuma das suas
                disciplinas corresponde a essa matriz.
              </p>
            </Card>
          ))}
        {tab === 'portfolio' && <PortfolioTab />}
        {tab === 'relatorio' && (
          <RelatorioTab
            curriculo={data.curriculo}
            historico={data.historico}
            avaliacoes={AVALIACOES_DEMO}
          />
        )}
      </div>
    </div>
  )
}

export default AcademicoPage
