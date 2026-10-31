'use client'

import Link from 'next/link'
import { useParams, useSearchParams } from 'next/navigation'
import {
  LuArrowLeft,
  LuDownload,
  LuFileX,
  LuMessageSquarePlus
} from 'react-icons/lu'
import EstadoVazio from '@/components/EstadoVazio/EstadoVazio'
import Skeleton from '@/components/Skeleton/Skeleton'
import LeitorPdf from '@/components/AmbienteEstudo/LeitorPdf/LeitorPdf'
import Markdown from '@/components/AmbienteEstudo/Markdown/Markdown'
import { LinkBotao } from '@/components/AmbienteEstudo/Botao/Botao'
import { classeCartao } from '@/components/AmbienteEstudo/estilos'
import { useMateriais } from '@/hooks/ambienteEstudo/useMateriais'
import { urlDoArquivo } from '@/services/ambienteEstudo/materiais'
import {
  formatarDataHora,
  formatarTamanho
} from '@/utils/ambienteEstudo/formatar'
import { ROTULO_TIPO_MATERIAL } from '@/utils/ambienteEstudo/rotulos'

/**
 * Leitura de um material. PDFs abrem no leitor (com busca, miniaturas e
 * zoom); citações da IA chegam com ?pagina= e ?trecho= para abrir e realçar
 * o trecho usado.
 */
export default function MaterialPage() {
  const { ambienteId, materialId } = useParams<{
    ambienteId: string
    materialId: string
  }>()
  const parametros = useSearchParams()
  const { data: materiais, isLoading } = useMateriais(ambienteId)
  const material = materiais?.find(({ id }) => id === materialId)
  const biblioteca = `/ambientes/${ambienteId}/materiais`
  const pagina = Number(parametros.get('pagina')) || null
  const trecho = parametros.get('trecho')

  if (isLoading) return <Skeleton className="h-[60vh] rounded-2xl" />

  if (!material) {
    return (
      <EstadoVazio
        icon={<LuFileX />}
        titulo="Material não encontrado"
        descricao="Ele pode ter sido excluído da biblioteca."
        acao={
          <LinkBotao href={biblioteca} variante="primario">
            Voltar à biblioteca
          </LinkBotao>
        }
      />
    )
  }

  const arquivo = urlDoArquivo(material.id)
  const perguntar = (
    <Link
      href={`/ambientes/${ambienteId}/chats?novo=1&material=${material.id}`}
      aria-label="Perguntar à IA sobre este material"
      title="Perguntar à IA sobre este material"
      className="flex size-9 items-center justify-center rounded-lg text-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900"
    >
      <LuMessageSquarePlus />
    </Link>
  )

  if (material.tipo === 'PDF') {
    return (
      <LeitorPdf
        url={arquivo}
        nome={material.nome}
        materialId={material.id}
        paginaInicial={pagina}
        trechoCitado={trecho}
        voltarHref={biblioteca}
        acoes={perguntar}
      />
    )
  }

  return (
    <section className={`${classeCartao} space-y-4 p-6 max-md:p-4`}>
      <header className="flex flex-wrap items-center gap-3">
        <Link
          href={biblioteca}
          aria-label="Voltar para a biblioteca"
          className="flex size-9 items-center justify-center rounded-lg text-lg text-gray-600 hover:bg-gray-100"
        >
          <LuArrowLeft />
        </Link>
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-lg font-bold tracking-tight">
            {material.nome}
          </h2>
          <p className="text-sm text-gray-500">
            {[
              ROTULO_TIPO_MATERIAL[material.tipo],
              formatarTamanho(material.tamanhoBytes),
              material.paginas &&
                `${material.paginas} ${material.tipo === 'PPTX' ? 'slides' : 'páginas'}`,
              `enviado em ${formatarDataHora(material.criadoEm)}`
            ]
              .filter(Boolean)
              .join(' · ')}
          </p>
        </div>
        {perguntar}
      </header>

      {trecho && (
        <blockquote className="rounded-xl border-l-4 border-xor-lime bg-xor-lime/10 p-4 text-sm text-gray-800">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
            Trecho citado
            {pagina
              ? ` · ${material.tipo === 'PPTX' ? 'slide' : 'p.'} ${pagina}`
              : ''}
          </p>
          <Markdown conteudo={trecho} />
        </blockquote>
      )}

      {material.tipo === 'TEXTO' && material.conteudoTexto ? (
        <div className="rounded-xl bg-gray-50 p-4 text-sm">
          <Markdown conteudo={material.conteudoTexto} />
        </div>
      ) : material.tipo === 'IMAGEM' ? (
        <img
          src={arquivo}
          alt={material.nome}
          className="mx-auto max-h-[70vh] rounded-xl ring-1 ring-gray-200"
        />
      ) : (
        <div className="flex flex-col items-start gap-3 rounded-xl bg-gray-50 p-4 text-sm text-gray-600">
          <p>
            {ROTULO_TIPO_MATERIAL[material.tipo]} não tem pré-visualização no
            navegador. Baixe o arquivo original para ler.
          </p>
          <a
            href={arquivo}
            download={material.nome}
            className="inline-flex items-center gap-2 rounded-lg bg-xor-navy px-3 py-2 font-semibold text-white hover:bg-xor-navy/90"
          >
            <LuDownload aria-hidden /> Baixar o arquivo
          </a>
        </div>
      )}
    </section>
  )
}
