'use client'

import clsx from 'clsx'
import { useRouter } from 'next/navigation'
import { ReactNode, useMemo, useState } from 'react'
import {
  LuArchive,
  LuBookOpen,
  LuChevronDown,
  LuGraduationCap,
  LuHistory,
  LuLayers,
  LuPlus,
  LuSearch
} from 'react-icons/lu'
import {
  AmbienteListagem,
  CadeiraHistorico,
  DadosAmbiente,
  SituacaoCadeira
} from '@/@types/AmbienteEstudo'
import Header from '@/components/Header/Header'
import IconeTile from '@/components/IconeTile/IconeTile'
import CardAmbiente from '@/components/AmbienteEstudo/CardAmbiente/CardAmbiente'
import {
  CardCadeiraSemAmbiente,
  LinhaCadeiraSemAmbiente
} from '@/components/AmbienteEstudo/CadeiraSemAmbiente/CadeiraSemAmbiente'
import EstadoVazio from '@/components/EstadoVazio/EstadoVazio'
import { SkeletonCards } from '@/components/Skeleton/Skeleton'
import ModalAmbiente from '@/components/AmbienteEstudo/ModalAmbiente/ModalAmbiente'
import ModalConfirmacao from '@/components/AmbienteEstudo/ModalConfirmacao/ModalConfirmacao'
import Botao from '@/components/AmbienteEstudo/Botao/Botao'
import { classeCampo } from '@/components/AmbienteEstudo/estilos'
import {
  useAmbientes,
  useAtualizarAmbiente,
  useCriarAmbiente,
  useExcluirAmbiente
} from '@/hooks/ambienteEstudo/useAmbientes'
import { useHistoricoCadeiras } from '@/hooks/ambienteEstudo/useHistoricoCadeiras'
import { corDaCadeira } from '@/utils/ambienteEstudo/cores'
import { pluralizar } from '@/utils/ambienteEstudo/formatar'
import { normalizarTexto } from '@/utils/historicoAcademico'
import { mensagemDeErro } from '@/services/ambienteEstudo/erros'

type EstadoModal =
  | { tipo: 'criar' }
  | { tipo: 'editar'; ambiente: AmbienteListagem }
  | null

type Filtro = 'TODOS' | 'ANDAMENTO' | 'APROVADA' | 'PENDENCIA' | 'LIVRES'

const FILTROS: { valor: Filtro; rotulo: string }[] = [
  { valor: 'TODOS', rotulo: 'Todos' },
  { valor: 'ANDAMENTO', rotulo: 'Em andamento' },
  { valor: 'APROVADA', rotulo: 'Concluídas' },
  { valor: 'PENDENCIA', rotulo: 'Reprovadas e trancadas' },
  { valor: 'LIVRES', rotulo: 'Livres' }
]

const passaNoFiltro = (filtro: Filtro, situacao: SituacaoCadeira | null) => {
  if (filtro === 'TODOS') return true
  if (filtro === 'LIVRES') return situacao === null
  if (filtro === 'PENDENCIA')
    return situacao === 'REPROVADA' || situacao === 'TRANCADA'
  return situacao === filtro
}

const classeGrade =
  'grid grid-cols-[minmax(0,1fr)] gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4'

// Seção no estilo dos grupos de disciplinas da progressão de curso.
function Secao({
  titulo,
  icone,
  contagem,
  children
}: {
  titulo: string
  icone: ReactNode
  contagem: string
  children: ReactNode
}) {
  return (
    <section className="space-y-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-lg max-md:p-4">
      <header className="flex flex-wrap items-center gap-3">
        <IconeTile>{icone}</IconeTile>
        <h2 className="text-lg font-bold tracking-tight max-md:text-base">
          {titulo}
        </h2>
        <span className="inline-flex items-center rounded-full bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-200">
          {contagem}
        </span>
      </header>
      {children}
    </section>
  )
}

interface GrupoPeriodo {
  periodo: string
  ordem: number
  ambientes: AmbienteListagem[]
  semAmbiente: CadeiraHistorico[]
}

export default function AmbientesPage() {
  const router = useRouter()
  const { data: ambientes, isLoading, error, refetch } = useAmbientes()
  const { cadeiras, porCodigo } = useHistoricoCadeiras()
  const criar = useCriarAmbiente()
  const atualizar = useAtualizarAmbiente()
  const excluir = useExcluirAmbiente()

  const [modal, setModal] = useState<EstadoModal>(null)
  const [paraExcluir, setParaExcluir] = useState<AmbienteListagem | null>(null)
  const [mostrarArquivados, setMostrarArquivados] = useState(false)
  const [busca, setBusca] = useState('')
  const [filtro, setFiltro] = useState<Filtro>('TODOS')
  const [criandoCodigo, setCriandoCodigo] = useState<string | null>(null)

  const situacaoDe = (codigo: string | null) =>
    codigo ? (porCodigo.get(codigo)?.situacao ?? null) : null

  // Ambientes e cadeiras organizados pelo histórico acadêmico. Cadeiras sem
  // ambiente não existem no banco: aparecem só como atalho para criar.
  const organizado = useMemo(() => {
    const termo = normalizarTexto(busca.trim())
    const casa = (...textos: (string | null)[]) =>
      !termo ||
      textos.some((texto) => texto && normalizarTexto(texto).includes(termo))
    const situacao = (codigo: string | null) =>
      codigo ? (porCodigo.get(codigo)?.situacao ?? null) : null

    const lista = ambientes ?? []
    const comAmbiente = new Set(lista.map((a) => a.disciplinaCodigo))
    const visiveis = lista.filter(
      (a) =>
        !a.arquivado &&
        casa(a.nome, a.disciplinaCodigo) &&
        passaNoFiltro(filtro, situacao(a.disciplinaCodigo))
    )
    const semAmbiente = cadeiras.filter(
      (c) =>
        !comAmbiente.has(c.codigo) &&
        casa(c.nome, c.codigo) &&
        passaNoFiltro(filtro, c.situacao)
    )

    // Cadeiras de semestres anteriores, agrupadas pelo período.
    const grupos = new Map<string, GrupoPeriodo>()
    const grupoDe = (cadeira: CadeiraHistorico) => {
      const periodo = cadeira.periodo ?? 'Sem período'
      let grupo = grupos.get(periodo)
      if (!grupo) {
        grupo = {
          periodo,
          ordem: cadeira.ordemPeriodo,
          ambientes: [],
          semAmbiente: []
        }
        grupos.set(periodo, grupo)
      }
      return grupo
    }
    for (const ambiente of visiveis) {
      const cadeira = ambiente.disciplinaCodigo
        ? porCodigo.get(ambiente.disciplinaCodigo)
        : undefined
      if (cadeira && cadeira.situacao !== 'ANDAMENTO')
        grupoDe(cadeira).ambientes.push(ambiente)
    }
    for (const cadeira of semAmbiente)
      if (cadeira.situacao !== 'ANDAMENTO')
        grupoDe(cadeira).semAmbiente.push(cadeira)

    return {
      emAndamento: visiveis.filter(
        (a) => situacao(a.disciplinaCodigo) === 'ANDAMENTO'
      ),
      andamentoSemAmbiente: semAmbiente.filter(
        (c) => c.situacao === 'ANDAMENTO'
      ),
      // Livres e cadeiras que não estão (mais) no histórico.
      outros: visiveis.filter((a) => situacao(a.disciplinaCodigo) === null),
      historico: [...grupos.values()].sort((a, b) => b.ordem - a.ordem),
      arquivados: lista.filter(
        (a) => a.arquivado && casa(a.nome, a.disciplinaCodigo)
      )
    }
  }, [ambientes, cadeiras, porCodigo, busca, filtro])

  const buscando = busca.trim() !== '' || filtro !== 'TODOS'
  const totalAndamento =
    organizado.emAndamento.length + organizado.andamentoSemAmbiente.length
  const totalHistorico = organizado.historico.reduce(
    (soma, grupo) => soma + grupo.ambientes.length + grupo.semAmbiente.length,
    0
  )
  const nadaParaMostrar =
    totalAndamento + organizado.outros.length + totalHistorico === 0

  const salvar = (dados: DadosAmbiente) => {
    if (modal?.tipo === 'editar') {
      atualizar.mutate(
        { id: modal.ambiente.id, dados },
        { onSuccess: () => setModal(null) }
      )
    } else {
      criar.mutate(dados, {
        onSuccess: (ambiente) => {
          setModal(null)
          router.push(`/ambientes/${ambiente.id}`)
        }
      })
    }
  }

  // O ambiente só passa a existir quando o aluno pede.
  const criarDaCadeira = (cadeira: CadeiraHistorico) => {
    setCriandoCodigo(cadeira.codigo)
    criar.mutate(
      {
        nome: cadeira.nome.slice(0, 80),
        descricao: null,
        cor: corDaCadeira(cadeira.codigo),
        disciplinaCodigo: cadeira.codigo
      },
      {
        onSuccess: (ambiente) => router.push(`/ambientes/${ambiente.id}`),
        onSettled: () => setCriandoCodigo(null)
      }
    )
  }

  const propsCard = (ambiente: AmbienteListagem) => ({
    situacao: situacaoDe(ambiente.disciplinaCodigo),
    aoEditar: () => setModal({ tipo: 'editar', ambiente }),
    aoAlternarArquivo: () =>
      atualizar.mutate({
        id: ambiente.id,
        dados: { arquivado: !ambiente.arquivado }
      }),
    aoExcluir: () => setParaExcluir(ambiente)
  })

  const propsCadeira = (cadeira: CadeiraHistorico) => ({
    cadeira,
    aoCriar: () => criarDaCadeira(cadeira),
    criando: criandoCodigo === cadeira.codigo
  })

  return (
    <div className="space-y-6">
      <Header
        title="Ambientes de estudo"
        description="Seus materiais, chats com IA, resumos, atividades e simulados, organizados pelas cadeiras do seu histórico ou por tema."
        actions={{
          primaryAction: { title: 'Atualizar', onClick: () => refetch() },
          secondaryAction: {
            title: 'Novo ambiente',
            onClick: () => setModal({ tipo: 'criar' })
          }
        }}
      />

      {isLoading && <SkeletonCards quantidade={3} />}

      {error && (
        <EstadoVazio
          icon={<LuGraduationCap />}
          titulo="Não foi possível carregar seus ambientes"
          descricao={mensagemDeErro(error)}
          acao={<Botao onClick={() => refetch()}>Tentar novamente</Botao>}
        />
      )}

      {ambientes && (
        <div className="flex flex-wrap items-center gap-3">
          <label className="relative w-full max-w-xs max-md:max-w-none">
            <span className="sr-only">Buscar cadeira ou ambiente</span>
            <LuSearch
              className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-gray-400"
              aria-hidden
            />
            <input
              type="search"
              value={busca}
              onChange={(evento) => setBusca(evento.target.value)}
              placeholder="Buscar cadeira ou ambiente"
              className={clsx(classeCampo, 'pl-9')}
            />
          </label>
          <div
            role="tablist"
            aria-label="Filtrar por situação"
            className="flex w-fit max-w-full gap-1 overflow-x-auto rounded-full border border-gray-100 bg-white p-1 shadow-lg [scrollbar-width:none]"
          >
            {FILTROS.map(({ valor, rotulo }) => (
              <button
                key={valor}
                type="button"
                role="tab"
                aria-selected={filtro === valor}
                onClick={() => setFiltro(valor)}
                className={clsx(
                  'shrink-0 cursor-pointer rounded-full px-4 py-2 text-sm font-semibold duration-200 max-md:px-3',
                  filtro === valor
                    ? 'bg-black text-white'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                )}
              >
                {rotulo}
              </button>
            ))}
          </div>
        </div>
      )}

      {ambientes && nadaParaMostrar && !buscando && (
        <EstadoVazio
          icon={<LuGraduationCap />}
          titulo="Crie seu primeiro ambiente de estudo"
          descricao="Envie os materiais de uma cadeira e use a IA para tirar dúvidas, gerar resumos, praticar com atividades e fazer simulados. As cadeiras do seu histórico acadêmico aparecem aqui."
          acao={
            <Botao
              variante="primario"
              icone={<LuPlus aria-hidden />}
              onClick={() => setModal({ tipo: 'criar' })}
            >
              Novo ambiente
            </Botao>
          }
        />
      )}

      {ambientes && nadaParaMostrar && buscando && (
        <EstadoVazio
          icon={<LuSearch />}
          titulo="Nada encontrado"
          descricao="Tente outro nome ou código, ou mude o filtro."
        />
      )}

      {ambientes && totalAndamento > 0 && (
        <Secao
          titulo="Em andamento"
          icone={<LuBookOpen />}
          contagem={pluralizar(totalAndamento, 'cadeira', 'cadeiras')}
        >
          <div className={classeGrade}>
            {organizado.emAndamento.map((ambiente) => (
              <CardAmbiente
                key={ambiente.id}
                ambiente={ambiente}
                {...propsCard(ambiente)}
              />
            ))}
            {organizado.andamentoSemAmbiente.map((cadeira) => (
              <CardCadeiraSemAmbiente
                key={cadeira.codigo}
                {...propsCadeira(cadeira)}
              />
            ))}
          </div>
        </Secao>
      )}

      {organizado.outros.length > 0 && (
        <Secao
          titulo="Outros ambientes"
          icone={<LuLayers />}
          contagem={pluralizar(
            organizado.outros.length,
            'ambiente',
            'ambientes'
          )}
        >
          <div className={classeGrade}>
            {organizado.outros.map((ambiente) => (
              <CardAmbiente
                key={ambiente.id}
                ambiente={ambiente}
                {...propsCard(ambiente)}
              />
            ))}
          </div>
        </Secao>
      )}

      {ambientes && organizado.historico.length > 0 && (
        <Secao
          titulo="Semestres anteriores"
          icone={<LuHistory />}
          contagem={pluralizar(totalHistorico, 'cadeira', 'cadeiras')}
        >
          <div className="space-y-3">
            {organizado.historico.map((grupo) => (
              // Períodos com ambiente ficam abertos; os demais, recolhidos.
              <details
                key={grupo.periodo}
                open={buscando || grupo.ambientes.length > 0}
                className="group/periodo rounded-xl ring-1 ring-inset ring-gray-100"
              >
                <summary className="flex cursor-pointer list-none flex-wrap items-center gap-x-3 gap-y-1 rounded-xl px-4 py-3 hover:bg-gray-50 [&::-webkit-details-marker]:hidden">
                  <LuChevronDown
                    className="shrink-0 text-gray-400 transition-transform group-open/periodo:rotate-180"
                    aria-hidden
                  />
                  <span className="font-bold text-gray-900">
                    {grupo.periodo}
                  </span>
                  <span className="text-xs font-medium text-gray-500">
                    {[
                      grupo.ambientes.length > 0 &&
                        pluralizar(
                          grupo.ambientes.length,
                          'ambiente',
                          'ambientes'
                        ),
                      grupo.semAmbiente.length > 0 &&
                        `${pluralizar(grupo.semAmbiente.length, 'cadeira', 'cadeiras')} sem ambiente`
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                  </span>
                </summary>
                <div className="space-y-4 px-4 pb-4">
                  {grupo.ambientes.length > 0 && (
                    <div className={classeGrade}>
                      {grupo.ambientes.map((ambiente) => (
                        <CardAmbiente
                          key={ambiente.id}
                          ambiente={ambiente}
                          {...propsCard(ambiente)}
                        />
                      ))}
                    </div>
                  )}
                  {grupo.semAmbiente.length > 0 && (
                    <ul className="divide-y divide-gray-100">
                      {grupo.semAmbiente.map((cadeira) => (
                        <LinhaCadeiraSemAmbiente
                          key={cadeira.codigo}
                          {...propsCadeira(cadeira)}
                        />
                      ))}
                    </ul>
                  )}
                </div>
              </details>
            ))}
          </div>
        </Secao>
      )}

      {organizado.arquivados.length > 0 && (
        <div className="space-y-3">
          <Botao
            variante="fantasma"
            onClick={() => setMostrarArquivados((valor) => !valor)}
          >
            {mostrarArquivados ? 'Ocultar' : 'Mostrar'}{' '}
            {pluralizar(
              organizado.arquivados.length,
              'arquivado',
              'arquivados'
            )}
          </Botao>
          {mostrarArquivados && (
            <Secao
              titulo="Arquivados"
              icone={<LuArchive />}
              contagem={pluralizar(
                organizado.arquivados.length,
                'ambiente',
                'ambientes'
              )}
            >
              <div className={classeGrade}>
                {organizado.arquivados.map((ambiente) => (
                  <CardAmbiente
                    key={ambiente.id}
                    ambiente={ambiente}
                    {...propsCard(ambiente)}
                  />
                ))}
              </div>
            </Secao>
          )}
        </div>
      )}

      <ModalAmbiente
        aberto={modal !== null}
        aoFechar={() => setModal(null)}
        aoSalvar={salvar}
        salvando={criar.isPending || atualizar.isPending}
        ambiente={modal?.tipo === 'editar' ? modal.ambiente : null}
      />

      <ModalConfirmacao
        aberto={paraExcluir !== null}
        aoFechar={() => setParaExcluir(null)}
        titulo="Excluir ambiente?"
        perigoso
        textoConfirmar="Excluir definitivamente"
        carregando={excluir.isPending}
        aoConfirmar={() =>
          paraExcluir &&
          excluir.mutate(paraExcluir.id, {
            onSuccess: () => setParaExcluir(null)
          })
        }
        mensagem={
          paraExcluir && (
            <>
              <p>
                <strong>{paraExcluir.nome}</strong> será excluído junto com{' '}
                {pluralizar(
                  paraExcluir.contagem.materiais,
                  'material',
                  'materiais'
                )}
                , {pluralizar(paraExcluir.contagem.chats, 'chat', 'chats')},{' '}
                {pluralizar(paraExcluir.contagem.resumos, 'resumo', 'resumos')},{' '}
                {pluralizar(
                  paraExcluir.contagem.atividades,
                  'atividade',
                  'atividades'
                )}{' '}
                e{' '}
                {pluralizar(
                  paraExcluir.contagem.simulados,
                  'simulado',
                  'simulados'
                )}
                .
              </p>
              <p className="mt-2">
                Se quiser só tirar da lista, use <strong>Arquivar</strong>. Se
                for uma cadeira do histórico, ela continua aparecendo aqui para
                você criar um ambiente novo quando quiser.
              </p>
            </>
          )
        }
      />
    </div>
  )
}
