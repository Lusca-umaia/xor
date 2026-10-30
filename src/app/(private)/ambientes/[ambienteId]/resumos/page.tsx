'use client'

import clsx from 'clsx'
import Link from 'next/link'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  LuFileText,
  LuLoader,
  LuNetwork,
  LuPlus,
  LuTrash2
} from 'react-icons/lu'
import { Resumo } from '@/@types/AmbienteEstudo'
import Botao from '@/components/AmbienteEstudo/Botao/Botao'
import EstadoVazio from '@/components/AmbienteEstudo/EstadoVazio/EstadoVazio'
import { EsqueletoCards } from '@/components/AmbienteEstudo/Esqueleto/Esqueleto'
import { classeCartao } from '@/components/AmbienteEstudo/estilos'
import MenuAcoes from '@/components/AmbienteEstudo/MenuAcoes/MenuAcoes'
import ModalConfirmacao from '@/components/AmbienteEstudo/ModalConfirmacao/ModalConfirmacao'
import FormGerarResumo from '@/components/AmbienteEstudo/Resumo/FormGerarResumo'
import { useMateriais } from '@/hooks/ambienteEstudo/useMateriais'
import {
  useExcluirResumo,
  useGerarResumo,
  useResumos
} from '@/hooks/ambienteEstudo/useResumos'
import { formatarDataRelativa } from '@/utils/ambienteEstudo/formatar'
import { ROTULO_FORMATO_RESUMO } from '@/utils/ambienteEstudo/rotulos'

/** Prévia em texto puro: remove marcações de markdown e LaTeX. */
function previa(resumo: Resumo) {
  if (resumo.formato === 'MAPA_MENTAL')
    return 'Mapa mental com os conceitos e suas relações.'
  return resumo.conteudo
    .replace(/\$[^$]*\$/g, '…')
    .replace(/[#*_|`>-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 160)
}

export default function ResumosPage() {
  const { ambienteId } = useParams<{ ambienteId: string }>()
  const parametros = useSearchParams()
  const router = useRouter()
  const { data: resumos, isLoading } = useResumos(ambienteId)
  const { data: materiais = [] } = useMateriais(ambienteId)
  const gerar = useGerarResumo(ambienteId)
  const excluir = useExcluirResumo()
  const [formAberto, setFormAberto] = useState(false)
  const [excluindo, setExcluindo] = useState<Resumo | null>(null)
  const base = `/ambientes/${ambienteId}/resumos`

  useEffect(() => {
    if (parametros.get('novo')) {
      setFormAberto(true)
      router.replace(base, { scroll: false })
    }
  }, [parametros, router, base])

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <Botao
          variante="primario"
          icone={<LuPlus aria-hidden />}
          onClick={() => setFormAberto(true)}
        >
          Gerar resumo
        </Botao>
      </div>

      {isLoading && <EsqueletoCards />}

      {resumos?.length === 0 && (
        <EstadoVazio
          icone={<LuFileText />}
          titulo="Nenhum resumo ainda"
          descricao="Gere resumos em tópicos, texto corrido, glossário ou mapa mental a partir dos materiais. Você pode editar tudo depois."
          acao={
            <Botao variante="primario" onClick={() => setFormAberto(true)}>
              Gerar primeiro resumo
            </Botao>
          }
        />
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {resumos?.map((resumo) => {
          const gerando = resumo.status === 'GERANDO'
          return (
            <div
              key={resumo.id}
              className={clsx(classeCartao, 'relative flex flex-col gap-3 p-5')}
            >
              <div className="flex items-start gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-lg">
                  {gerando ? (
                    <LuLoader className="animate-spin" aria-hidden />
                  ) : resumo.formato === 'MAPA_MENTAL' ? (
                    <LuNetwork aria-hidden />
                  ) : (
                    <LuFileText aria-hidden />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  {gerando ? (
                    <p className="font-bold">{resumo.titulo}</p>
                  ) : (
                    <Link
                      href={`${base}/${resumo.id}`}
                      className="font-bold after:absolute after:inset-0 focus-visible:outline-none"
                    >
                      {resumo.titulo}
                    </Link>
                  )}
                  <p className="text-xs text-gray-500">
                    {ROTULO_FORMATO_RESUMO[resumo.formato]} ·{' '}
                    {resumo.materialIds.length} material(is)
                  </p>
                </div>
                <div className="relative z-10">
                  <MenuAcoes
                    acoes={[
                      {
                        rotulo: 'Excluir',
                        icone: <LuTrash2 />,
                        perigosa: true,
                        aoClicar: () => setExcluindo(resumo)
                      }
                    ]}
                  />
                </div>
              </div>
              {gerando ? (
                <div
                  className="space-y-2"
                  role="status"
                  aria-label="Gerando resumo"
                >
                  <div className="h-3 w-full animate-pulse rounded bg-gray-200" />
                  <div className="h-3 w-4/5 animate-pulse rounded bg-gray-200" />
                </div>
              ) : (
                <p className="line-clamp-3 text-sm text-gray-600">
                  {previa(resumo)}
                </p>
              )}
              <div className="mt-auto flex flex-wrap gap-2 text-xs text-gray-400">
                {formatarDataRelativa(resumo.criadoEm)}
                {resumo.editadoPeloAluno && (
                  <span className="rounded bg-gray-100 px-1.5 font-semibold text-gray-600">
                    Editado por você
                  </span>
                )}
                {resumo.origemChatId && (
                  <span className="rounded bg-gray-100 px-1.5 text-gray-600">
                    Do chat
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <FormGerarResumo
        aberto={formAberto}
        aoFechar={() => setFormAberto(false)}
        ambienteId={ambienteId}
        materiais={materiais}
        gerando={gerar.isPending}
        aoGerar={(config) =>
          gerar.mutate(config, { onSuccess: () => setFormAberto(false) })
        }
      />
      <ModalConfirmacao
        aberto={excluindo !== null}
        aoFechar={() => setExcluindo(null)}
        titulo="Excluir resumo?"
        perigoso
        textoConfirmar="Excluir"
        carregando={excluir.isPending}
        mensagem={`“${excluindo?.titulo}” será excluído, incluindo as edições feitas por você.`}
        aoConfirmar={() =>
          excluindo &&
          excluir.mutate(excluindo.id, { onSuccess: () => setExcluindo(null) })
        }
      />
    </div>
  )
}
