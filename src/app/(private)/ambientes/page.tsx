'use client'

import { useMemo, useState } from 'react'
import { LuGraduationCap, LuPlus } from 'react-icons/lu'
import { AmbienteListagem, DadosAmbiente } from '@/@types/AmbienteEstudo'
import Header from '@/components/Header/Header'
import CardAmbiente from '@/components/AmbienteEstudo/CardAmbiente/CardAmbiente'
import EstadoVazio from '@/components/AmbienteEstudo/EstadoVazio/EstadoVazio'
import { EsqueletoCards } from '@/components/AmbienteEstudo/Esqueleto/Esqueleto'
import ModalAmbiente from '@/components/AmbienteEstudo/ModalAmbiente/ModalAmbiente'
import ModalConfirmacao from '@/components/AmbienteEstudo/ModalConfirmacao/ModalConfirmacao'
import Botao from '@/components/AmbienteEstudo/Botao/Botao'
import {
  MODO_DEMONSTRACAO,
  SeloDemonstracao
} from '@/components/AmbienteEstudo/SeloIA/SeloIA'
import {
  useAmbientes,
  useAtualizarAmbiente,
  useCriarAmbiente,
  useExcluirAmbiente,
  useRestaurarDemonstracao
} from '@/hooks/ambienteEstudo/useAmbientes'
import { useCadeirasAtuais } from '@/hooks/ambienteEstudo/useCadeirasAtuais'
import { LISTA_CORES } from '@/utils/ambienteEstudo/cores'
import { pluralizar } from '@/utils/ambienteEstudo/formatar'
import { mensagemDeErro } from '@/services/ambienteEstudo/erros'

type EstadoModal =
  | { tipo: 'criar'; dadosIniciais?: Partial<DadosAmbiente> }
  | { tipo: 'editar'; ambiente: AmbienteListagem }
  | null

function GradeAmbientes({
  titulo,
  ambientes,
  aoEditar,
  aoAlternarArquivo,
  aoExcluir
}: {
  titulo: string
  ambientes: AmbienteListagem[]
  aoEditar: (ambiente: AmbienteListagem) => void
  aoAlternarArquivo: (ambiente: AmbienteListagem) => void
  aoExcluir: (ambiente: AmbienteListagem) => void
}) {
  if (ambientes.length === 0) return null
  return (
    <section className="space-y-3">
      <h3 className="text-sm font-bold uppercase tracking-wide text-gray-500">
        {titulo}
      </h3>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {ambientes.map((ambiente) => (
          <CardAmbiente
            key={ambiente.id}
            ambiente={ambiente}
            aoEditar={() => aoEditar(ambiente)}
            aoAlternarArquivo={() => aoAlternarArquivo(ambiente)}
            aoExcluir={() => aoExcluir(ambiente)}
          />
        ))}
      </div>
    </section>
  )
}

export default function AmbientesPage() {
  const { data: ambientes, isLoading, error, refetch } = useAmbientes()
  const criar = useCriarAmbiente()
  const atualizar = useAtualizarAmbiente()
  const excluir = useExcluirAmbiente()
  const restaurar = useRestaurarDemonstracao()

  const [modal, setModal] = useState<EstadoModal>(null)
  const [paraExcluir, setParaExcluir] = useState<AmbienteListagem | null>(null)
  const [confirmarRestauracao, setConfirmarRestauracao] = useState(false)
  const [mostrarArquivados, setMostrarArquivados] = useState(false)

  const ativos = ambientes?.filter(({ arquivado }) => !arquivado) ?? []
  const arquivados = ambientes?.filter(({ arquivado }) => arquivado) ?? []

  // Cadeiras em andamento que ainda não têm ambiente (ex.: o aluno excluiu).
  const cadeiras = useCadeirasAtuais()
  const cadeirasSemAmbiente = useMemo(() => {
    const vinculadas = new Set(
      ambientes?.map(({ disciplinaCodigo }) => disciplinaCodigo)
    )
    return cadeiras.filter(({ codigo }) => !vinculadas.has(codigo))
  }, [ambientes, cadeiras])

  const salvar = (dados: DadosAmbiente) => {
    if (modal?.tipo === 'editar') {
      atualizar.mutate(
        { id: modal.ambiente.id, dados },
        { onSuccess: () => setModal(null) }
      )
    } else {
      criar.mutate(dados, { onSuccess: () => setModal(null) })
    }
  }

  const alternarArquivo = (ambiente: AmbienteListagem) =>
    atualizar.mutate({
      id: ambiente.id,
      dados: { arquivado: !ambiente.arquivado }
    })

  const propsGrade = {
    aoEditar: (ambiente: AmbienteListagem) =>
      setModal({ tipo: 'editar', ambiente }),
    aoAlternarArquivo: alternarArquivo,
    aoExcluir: setParaExcluir
  }

  return (
    <div className="space-y-6">
      <Header
        title="Ambientes de estudo"
        description="Seus materiais, chats com IA, resumos, atividades e simulados, organizados por cadeira ou tema."
        actions={{
          primaryAction: MODO_DEMONSTRACAO
            ? {
                title: 'Restaurar demonstração',
                onClick: () => setConfirmarRestauracao(true)
              }
            : { title: 'Atualizar', onClick: () => refetch() },
          secondaryAction: {
            title: 'Novo ambiente',
            onClick: () => setModal({ tipo: 'criar' })
          }
        }}
      />
      <SeloDemonstracao />

      {cadeirasSemAmbiente.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-gray-200 bg-white p-4">
          <span className="text-sm font-semibold text-gray-700">
            Cadeiras em andamento sem ambiente:
          </span>
          {cadeirasSemAmbiente.map((cadeira, indice) => (
            <Botao
              key={cadeira.codigo}
              tamanho="sm"
              icone={<LuPlus aria-hidden />}
              onClick={() =>
                criar.mutate({
                  nome: cadeira.nome,
                  descricao: null,
                  cor: LISTA_CORES[(indice + 1) % LISTA_CORES.length],
                  disciplinaCodigo: cadeira.codigo
                })
              }
            >
              {cadeira.nome}
            </Botao>
          ))}
        </div>
      )}

      {isLoading && <EsqueletoCards quantidade={3} />}

      {error && (
        <EstadoVazio
          icone={<LuGraduationCap />}
          titulo="Não foi possível carregar seus ambientes"
          descricao={mensagemDeErro(error)}
          acao={<Botao onClick={() => refetch()}>Tentar novamente</Botao>}
        />
      )}

      {ambientes && ativos.length === 0 && (
        <EstadoVazio
          icone={<LuGraduationCap />}
          titulo="Crie seu primeiro ambiente de estudo"
          descricao="Envie os materiais de uma cadeira e use a IA para tirar dúvidas, gerar resumos, praticar com atividades e fazer simulados."
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

      <GradeAmbientes
        titulo="Minhas cadeiras"
        ambientes={ativos.filter(({ origem }) => origem === 'CADEIRA')}
        {...propsGrade}
      />
      <GradeAmbientes
        titulo="Outros ambientes"
        ambientes={ativos.filter(({ origem }) => origem === 'LIVRE')}
        {...propsGrade}
      />

      {arquivados.length > 0 && (
        <div className="space-y-3">
          <Botao
            variante="fantasma"
            onClick={() => setMostrarArquivados((valor) => !valor)}
          >
            {mostrarArquivados ? 'Ocultar' : 'Mostrar'}{' '}
            {pluralizar(arquivados.length, 'arquivado', 'arquivados')}
          </Botao>
          {mostrarArquivados && (
            <GradeAmbientes
              titulo="Arquivados"
              ambientes={arquivados}
              {...propsGrade}
            />
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
                Se quiser só tirar da lista, use <strong>Arquivar</strong>.
              </p>
            </>
          )
        }
      />

      <ModalConfirmacao
        aberto={confirmarRestauracao}
        aoFechar={() => setConfirmarRestauracao(false)}
        titulo="Restaurar dados de demonstração?"
        perigoso
        textoConfirmar="Apagar e restaurar"
        carregando={restaurar.isPending}
        aoConfirmar={() =>
          restaurar.mutate(undefined, {
            onSuccess: () => setConfirmarRestauracao(false)
          })
        }
        mensagem="Todos os ambientes deste navegador serão apagados e substituídos pelos ambientes de demonstração das suas cadeiras atuais."
      />
    </div>
  )
}
