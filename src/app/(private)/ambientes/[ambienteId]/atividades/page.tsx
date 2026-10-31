'use client'

import clsx from 'clsx'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { ReactNode, useEffect, useMemo, useState } from 'react'
import {
  LuCircleCheck,
  LuListChecks,
  LuListTodo,
  LuPlus,
  LuSearch,
  LuZap
} from 'react-icons/lu'
import { AtividadeListagem, TipoAtividade } from '@/@types/AmbienteEstudo'
import IconeTile from '@/components/IconeTile/IconeTile'
import Botao from '@/components/AmbienteEstudo/Botao/Botao'
import EstadoVazio from '@/components/EstadoVazio/EstadoVazio'
import { SkeletonCards } from '@/components/Skeleton/Skeleton'
import FormGerarAtividade from '@/components/AmbienteEstudo/FormGerarAtividade/FormGerarAtividade'
import LinhaAtividade from '@/components/AmbienteEstudo/LinhaAtividade/LinhaAtividade'
import ModalConfirmacao from '@/components/AmbienteEstudo/ModalConfirmacao/ModalConfirmacao'
import { classeCampo, classeCartao } from '@/components/AmbienteEstudo/estilos'
import {
  useAtividades,
  useExcluirAtividade,
  useGerarAtividade
} from '@/hooks/ambienteEstudo/useAtividades'
import { useMateriais } from '@/hooks/ambienteEstudo/useMateriais'
import { pluralizar } from '@/utils/ambienteEstudo/formatar'
import {
  aproveitamento,
  casaComBusca,
  Ordem,
  ordenar,
  ROTULO_ORDEM,
  situacaoDaAtividade
} from '@/utils/ambienteEstudo/organizarAtividades'
import { ROTULO_TIPO_ATIVIDADE } from '@/utils/ambienteEstudo/rotulos'

const TIPOS = Object.keys(ROTULO_TIPO_ATIVIDADE) as TipoAtividade[]
// Cada grupo mostra poucas atividades; o resto fica atrás de "mostrar todas".
const LIMITE_POR_GRUPO = 5

// Seletor compacto da barra de filtros (o classeCampo ocupa a largura toda).
const classeSeletor =
  'cursor-pointer rounded-md bg-white px-3 py-2 text-sm text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-xor-navy max-sm:flex-1'

// Dentro de "Para agora", o que está pela metade vem primeiro.
const PRIORIDADE_AGORA = ['ANDAMENTO', 'REVISAR', 'GERANDO', 'ERRO']

function Grupo({
  icone,
  titulo,
  subtitulo,
  atividades,
  ambienteId,
  aoExcluir,
  expandido,
  aoExpandir
}: {
  icone: ReactNode
  titulo: string
  subtitulo: string
  atividades: AtividadeListagem[]
  ambienteId: string
  aoExcluir: (atividade: AtividadeListagem) => void
  expandido: boolean
  aoExpandir: () => void
}) {
  if (atividades.length === 0) return null
  const visiveis = expandido
    ? atividades
    : atividades.slice(0, LIMITE_POR_GRUPO)
  return (
    <section className={clsx(classeCartao, 'p-6 max-md:p-4')}>
      <header className="flex flex-wrap items-center gap-3">
        <IconeTile>{icone}</IconeTile>
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-bold leading-tight tracking-tight max-md:text-base">
            {titulo}
          </h2>
          <p className="text-sm text-gray-500">{subtitulo}</p>
        </div>
        <span className="inline-flex items-center rounded-full bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-200">
          {pluralizar(atividades.length, 'atividade', 'atividades')}
        </span>
      </header>
      <ul className="mt-3 divide-y divide-gray-100">
        {visiveis.map((atividade) => (
          <LinhaAtividade
            key={atividade.id}
            atividade={atividade}
            href={`/ambientes/${ambienteId}/atividades/${atividade.id}`}
            aoExcluir={() => aoExcluir(atividade)}
          />
        ))}
      </ul>
      {atividades.length > LIMITE_POR_GRUPO && (
        <button
          type="button"
          onClick={aoExpandir}
          className="mt-2 w-full cursor-pointer rounded-xl py-2 text-sm font-semibold text-xor-navy hover:bg-gray-50"
        >
          {expandido ? 'Mostrar menos' : `Mostrar todas (${atividades.length})`}
        </button>
      )}
    </section>
  )
}

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
  const [topicoInicial, setTopicoInicial] = useState('')
  const [tipo, setTipo] = useState<TipoAtividade | 'TODAS'>('TODAS')
  const [busca, setBusca] = useState('')
  const [ordem, setOrdem] = useState<Ordem>('RECENTES')
  const [expandidos, setExpandidos] = useState<Record<string, boolean>>({})
  const [excluindo, setExcluindo] = useState<AtividadeListagem | null>(null)

  // Atalhos da visão geral chegam com ?novo=1 (e opcionalmente &tipo= e &topico=).
  useEffect(() => {
    if (parametros.get('novo')) {
      setTipoInicial((parametros.get('tipo') as TipoAtividade | null) ?? 'QUIZ')
      setTopicoInicial(parametros.get('topico')?.slice(0, 200) ?? '')
      setFormAberto(true)
      router.replace(`/ambientes/${ambienteId}/atividades`, { scroll: false })
    }
  }, [parametros, router, ambienteId])

  const abrirNovo = () => {
    setTopicoInicial('')
    setFormAberto(true)
  }

  const grupos = useMemo(() => {
    const filtradas = (atividades ?? []).filter(
      (atividade) =>
        (tipo === 'TODAS' || atividade.tipo === tipo) &&
        casaComBusca(atividade, busca)
    )
    const daSituacao = (...situacoes: string[]) =>
      filtradas.filter((a) => situacoes.includes(situacaoDaAtividade(a)))
    const concluidas = ordenar(daSituacao('CONCLUIDA'), ordem)
    const taxas = concluidas
      .map(aproveitamento)
      .filter((taxa): taxa is number => taxa !== null)
    return {
      total: filtradas.length,
      agora: ordenar(daSituacao(...PRIORIDADE_AGORA), ordem).sort(
        (a, b) =>
          PRIORIDADE_AGORA.indexOf(situacaoDaAtividade(a)) -
          PRIORIDADE_AGORA.indexOf(situacaoDaAtividade(b))
      ),
      novas: ordenar(daSituacao('NOVA'), ordem),
      concluidas,
      media: taxas.length
        ? taxas.reduce((soma, taxa) => soma + taxa, 0) / taxas.length
        : null
    }
  }, [atividades, tipo, busca, ordem])

  const contagemPorTipo = (opcao: TipoAtividade) =>
    (atividades ?? []).filter((a) => a.tipo === opcao).length

  const propsGrupo = (chave: string) => ({
    ambienteId,
    aoExcluir: setExcluindo,
    expandido: Boolean(expandidos[chave]) || busca.trim() !== '',
    aoExpandir: () =>
      setExpandidos((atual) => ({ ...atual, [chave]: !atual[chave] }))
  })

  const temAtividades = Boolean(atividades && atividades.length > 0)

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        {temAtividades && (
          <>
            <label className="relative min-w-48 flex-1 sm:max-w-xs">
              <span className="sr-only">Buscar atividades</span>
              <LuSearch
                className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-gray-400"
                aria-hidden
              />
              <input
                type="search"
                value={busca}
                onChange={(evento) => setBusca(evento.target.value)}
                placeholder="Buscar por nome ou tópico"
                className={clsx(classeCampo, 'mt-0 pl-9')}
              />
            </label>
            <select
              value={tipo}
              onChange={(evento) =>
                setTipo(evento.target.value as TipoAtividade | 'TODAS')
              }
              aria-label="Filtrar por tipo"
              className={classeSeletor}
            >
              <option value="TODAS">
                Todos os tipos ({atividades?.length ?? 0})
              </option>
              {TIPOS.map((opcao) => (
                <option key={opcao} value={opcao}>
                  {ROTULO_TIPO_ATIVIDADE[opcao]} ({contagemPorTipo(opcao)})
                </option>
              ))}
            </select>
            <select
              value={ordem}
              onChange={(evento) => setOrdem(evento.target.value as Ordem)}
              aria-label="Ordenar"
              className={classeSeletor}
            >
              {(Object.keys(ROTULO_ORDEM) as Ordem[]).map((opcao) => (
                <option key={opcao} value={opcao}>
                  {ROTULO_ORDEM[opcao]}
                </option>
              ))}
            </select>
          </>
        )}
        <Botao
          variante="primario"
          icone={<LuPlus aria-hidden />}
          onClick={abrirNovo}
          className="ml-auto max-sm:w-full"
        >
          Gerar atividade
        </Botao>
      </div>

      {isLoading && <SkeletonCards />}

      {atividades && atividades.length === 0 && (
        <EstadoVazio
          icon={<LuListChecks />}
          titulo="Nenhuma atividade ainda"
          descricao="Gere quizzes, questões de verdadeiro ou falso, lacunas, discursivas com rubrica ou flashcards a partir dos seus materiais."
          acao={
            <Botao variante="primario" onClick={abrirNovo}>
              Gerar primeira atividade
            </Botao>
          }
        />
      )}

      {temAtividades && grupos.total === 0 && (
        <EstadoVazio
          icon={<LuSearch />}
          titulo="Nenhuma atividade encontrada"
          descricao="Tente outro nome ou tópico, ou mude o filtro de tipo."
        />
      )}

      <Grupo
        icone={<LuZap />}
        titulo="Para agora"
        subtitulo="Em andamento, flashcards para revisar e gerações em curso"
        atividades={grupos.agora}
        {...propsGrupo('agora')}
      />
      <Grupo
        icone={<LuListTodo />}
        titulo="Para fazer"
        subtitulo="Geradas e ainda não começadas"
        atividades={grupos.novas}
        {...propsGrupo('novas')}
      />
      <Grupo
        icone={<LuCircleCheck />}
        titulo="Concluídas"
        subtitulo={
          grupos.media !== null
            ? `Acerto médio de ${Math.round(grupos.media * 100)}% na melhor tentativa`
            : 'Atividades já feitas pelo menos uma vez'
        }
        atividades={grupos.concluidas}
        {...propsGrupo('concluidas')}
      />

      <FormGerarAtividade
        aberto={formAberto}
        aoFechar={() => setFormAberto(false)}
        ambienteId={ambienteId}
        materiais={materiais}
        tipoInicial={tipoInicial}
        topicoInicial={topicoInicial}
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
        mensagem={`“${excluindo?.titulo}” e o histórico de tentativas serão excluídos. O XP já ganho continua.`}
        aoConfirmar={() =>
          excluindo &&
          excluir.mutate(excluindo.id, { onSuccess: () => setExcluindo(null) })
        }
      />
    </div>
  )
}
