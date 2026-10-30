'use client'

import clsx from 'clsx'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { LuListChecks, LuPlus } from 'react-icons/lu'
import { AtividadeListagem, TipoAtividade } from '@/@types/AmbienteEstudo'
import Botao from '@/components/AmbienteEstudo/Botao/Botao'
import CardAtividade from '@/components/AmbienteEstudo/CardAtividade/CardAtividade'
import EstadoVazio from '@/components/AmbienteEstudo/EstadoVazio/EstadoVazio'
import { EsqueletoCards } from '@/components/AmbienteEstudo/Esqueleto/Esqueleto'
import FormGerarAtividade from '@/components/AmbienteEstudo/FormGerarAtividade/FormGerarAtividade'
import ModalConfirmacao from '@/components/AmbienteEstudo/ModalConfirmacao/ModalConfirmacao'
import {
  useAtividades,
  useExcluirAtividade,
  useGerarAtividade
} from '@/hooks/ambienteEstudo/useAtividades'
import { useMateriais } from '@/hooks/ambienteEstudo/useMateriais'
import { ROTULO_TIPO_ATIVIDADE } from '@/utils/ambienteEstudo/rotulos'

const FILTROS: (TipoAtividade | 'TODAS')[] = [
  'TODAS',
  ...(Object.keys(ROTULO_TIPO_ATIVIDADE) as TipoAtividade[])
]

export default function AtividadesPage() {
  const { ambienteId } = useParams<{ ambienteId: string }>()
  const parametros = useSearchParams()
  const router = useRouter()
  const { data: atividades, isLoading } = useAtividades(ambienteId)
  const { data: materiais = [] } = useMateriais(ambienteId)
  const gerar = useGerarAtividade(ambienteId)
  const excluir = useExcluirAtividade()

  const [formAberto, setFormAberto] = useState(false)
  const [tipoInicial, setTipoInicial] = useState<TipoAtividade>('QUIZ')
  const [filtro, setFiltro] = useState<TipoAtividade | 'TODAS'>('TODAS')
  const [excluindo, setExcluindo] = useState<AtividadeListagem | null>(null)

  // Atalhos da visão geral chegam com ?novo=1 (e opcionalmente &tipo=...).
  useEffect(() => {
    if (parametros.get('novo')) {
      setTipoInicial((parametros.get('tipo') as TipoAtividade | null) ?? 'QUIZ')
      setFormAberto(true)
      router.replace(`/ambientes/${ambienteId}/atividades`, { scroll: false })
    }
  }, [parametros, router, ambienteId])

  const filtradas = (atividades ?? []).filter(
    ({ tipo }) => filtro === 'TODAS' || tipo === filtro
  )

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div
          role="tablist"
          className="flex w-fit max-w-full gap-1 overflow-x-auto rounded-full border border-gray-100 bg-white p-1 shadow-lg [scrollbar-width:none]"
        >
          {FILTROS.map((opcao) => {
            const ativa = filtro === opcao
            const quantidade = (atividades ?? []).filter(
              ({ tipo }) => opcao === 'TODAS' || tipo === opcao
            ).length
            return (
              <button
                key={opcao}
                type="button"
                role="tab"
                aria-selected={ativa}
                onClick={() => setFiltro(opcao)}
                className={clsx(
                  'flex shrink-0 cursor-pointer items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold duration-200 max-md:px-3',
                  ativa
                    ? 'bg-black text-white'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                )}
              >
                {opcao === 'TODAS' ? 'Todas' : ROTULO_TIPO_ATIVIDADE[opcao]}
                <span
                  className={clsx(
                    'rounded-full px-1.5 py-0.5 text-[11px] leading-none',
                    ativa
                      ? 'bg-white/20 text-white'
                      : 'bg-gray-100 text-gray-600'
                  )}
                >
                  {quantidade}
                </span>
              </button>
            )
          })}
        </div>
        <Botao
          variante="primario"
          icone={<LuPlus aria-hidden />}
          onClick={() => setFormAberto(true)}
        >
          Gerar atividade
        </Botao>
      </div>

      {isLoading && <EsqueletoCards />}

      {atividades && atividades.length === 0 && (
        <EstadoVazio
          icone={<LuListChecks />}
          titulo="Nenhuma atividade ainda"
          descricao="Gere quizzes, questões de verdadeiro ou falso, lacunas, discursivas com rubrica ou flashcards a partir dos seus materiais."
          acao={
            <Botao variante="primario" onClick={() => setFormAberto(true)}>
              Gerar primeira atividade
            </Botao>
          }
        />
      )}

      {atividades && atividades.length > 0 && filtradas.length === 0 && (
        <p className="text-sm text-gray-500">Nenhuma atividade deste tipo.</p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filtradas.map((atividade) => (
          <CardAtividade
            key={atividade.id}
            atividade={atividade}
            href={`/ambientes/${ambienteId}/atividades/${atividade.id}`}
            aoExcluir={() => setExcluindo(atividade)}
          />
        ))}
      </div>

      <FormGerarAtividade
        aberto={formAberto}
        aoFechar={() => setFormAberto(false)}
        ambienteId={ambienteId}
        materiais={materiais}
        tipoInicial={tipoInicial}
        gerando={gerar.isPending}
        aoGerar={(config) =>
          gerar.mutate(config, { onSuccess: () => setFormAberto(false) })
        }
      />

      <ModalConfirmacao
        aberto={excluindo !== null}
        aoFechar={() => setExcluindo(null)}
        titulo="Excluir atividade?"
        perigoso
        textoConfirmar="Excluir"
        carregando={excluir.isPending}
        mensagem={`“${excluindo?.titulo}” e o histórico de tentativas serão excluídos.`}
        aoConfirmar={() =>
          excluindo &&
          excluir.mutate(excluindo.id, { onSuccess: () => setExcluindo(null) })
        }
      />
    </div>
  )
}
