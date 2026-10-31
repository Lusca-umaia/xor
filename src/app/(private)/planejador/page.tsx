'use client'
import clsx from 'clsx'
import { useMemo, useState } from 'react'
import { LuCircleAlert, LuCircleCheck } from 'react-icons/lu'
import type { PlanoSemestre } from '@/@types/Academico'
import Header from '@/components/Header/Header'
import Skeleton from '@/components/Skeleton/Skeleton'
import { useAcademico } from '@/hooks/queries/useAcademico'
import { CHAVES } from '@/services/academico/chaves'
import { CURRICULO_CC } from '@/services/mocks/curriculoCC'
import { HORARIOS_PADRAO_CC } from '@/services/mocks/horariosPadraoCC'
import { OPTATIVAS_CC } from '@/services/mocks/optativasCC'
import {
  conflitos,
  liberadasPeloPlano,
  pendencias,
  statusCarga,
  type ItemCatalogo
} from '@/utils/academico/planejador'
import { AvisoDemo, Card, Explicacao } from '../academico/components/Comuns'
import { useSincronizado } from '@/hooks/useSincronizado'
import Catalogo from './components/Catalogo'
import GradePlano from './components/GradePlano'
import NovaDisciplina from './components/NovaDisciplina'

// Limites iniciais SUGERIDOS pelo app, não o regulamento da UFC: cada aluno ajusta ao
// seu curso e ao seu caso (os valores abaixo são carga horária total do semestre).
const PLANO_PADRAO: PlanoSemestre = {
  codigos: [],
  personalizadas: [],
  minimo: 192,
  maximo: 480
}

const campo = 'w-24 rounded-md border border-gray-300 px-2 py-1 text-sm'

const PlanejadorPage = () => {
  const { data, isLoading, isError } = useAcademico()
  const [plano, setPlano] = useSincronizado<PlanoSemestre>(
    CHAVES.planejador,
    PLANO_PADRAO
  )
  const [aviso, setAviso] = useState<string | null>(null)

  const { aprovados, andamento } = useMemo(() => {
    const historico = data?.historico ?? []
    const ap = new Set(
      historico.filter((t) => t.status === 'APROVADA').map((t) => t.codigo)
    )
    const an = new Set(
      historico
        .filter((t) => t.status === 'ANDAMENTO' && !ap.has(t.codigo))
        .map((t) => t.codigo)
    )
    return { aprovados: ap, andamento: an }
  }, [data])

  const catalogo = useMemo(() => {
    const mapa = new Map<string, ItemCatalogo>()
    for (const d of CURRICULO_CC)
      mapa.set(d.codigo, {
        codigo: d.codigo,
        nome: d.nome,
        cargaHoraria: d.cargaHoraria,
        prerequisitos: d.prerequisitos,
        carater: 'OBRIGATORIA',
        horarios: HORARIOS_PADRAO_CC[d.codigo] ?? []
      })
    for (const d of OPTATIVAS_CC)
      if (!mapa.has(d.codigo))
        mapa.set(d.codigo, {
          codigo: d.codigo,
          nome: d.nome,
          cargaHoraria: d.cargaHoraria,
          prerequisitos: d.prerequisitos,
          carater: 'OPTATIVA',
          horarios: []
        })
    for (const p of plano.personalizadas)
      mapa.set(p.codigo, {
        codigo: p.codigo,
        nome: p.nome,
        cargaHoraria: p.cargaHoraria,
        prerequisitos: [],
        carater: p.carater,
        horarios: p.horario ? [p.horario] : [],
        personalizada: true
      })
    return [...mapa.values()]
  }, [plano.personalizadas])

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-80 max-w-full" />
        <Skeleton className="h-96 w-full" />
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

  const porCodigo = new Map(catalogo.map((d) => [d.codigo, d]))
  const noPlano = plano.codigos
    .map((c) => porCodigo.get(c))
    .filter((d): d is ItemCatalogo => !!d && !aprovados.has(d.codigo))
  const setPlanoCodigos = new Set(noPlano.map((d) => d.codigo))

  const linhas = catalogo
    .filter(
      (d) =>
        !aprovados.has(d.codigo) &&
        !andamento.has(d.codigo) &&
        !setPlanoCodigos.has(d.codigo)
    )
    .map((item) => ({
      item,
      pend: pendencias(item, aprovados, andamento, setPlanoCodigos)
    }))

  const total = noPlano.reduce((s, d) => s + d.cargaHoraria, 0)
  const status = statusCarga(total, plano.minimo, plano.maximo)
  const emConflito = conflitos(noPlano)
  const semHorario = noPlano.filter((d) => d.horarios.length === 0)
  const mesmoSemestre = noPlano
    .map((d) => ({
      d,
      p: pendencias(d, aprovados, andamento, setPlanoCodigos).noPlano
    }))
    .filter(({ p }) => p.length > 0)
  const liberadas = liberadasPeloPlano(
    catalogo,
    aprovados,
    andamento,
    setPlanoCodigos
  )

  const adicionar = (codigo: string) => {
    const item = porCodigo.get(codigo)
    if (!item || aprovados.has(codigo) || andamento.has(codigo)) return
    const { faltam } = pendencias(item, aprovados, andamento, setPlanoCodigos)
    if (faltam.length > 0) {
      setAviso(`${item.nome} está bloqueada: falta ${faltam.join(', ')}.`)
      return
    }
    setAviso(null)
    setPlano((p) =>
      p.codigos.includes(codigo) ? p : { ...p, codigos: [...p.codigos, codigo] }
    )
  }
  const remover = (codigo: string) =>
    setPlano((p) => ({ ...p, codigos: p.codigos.filter((c) => c !== codigo) }))
  const excluirPropria = (codigo: string) =>
    setPlano((p) => ({
      ...p,
      codigos: p.codigos.filter((c) => c !== codigo),
      personalizadas: p.personalizadas.filter((d) => d.codigo !== codigo)
    }))
  const arrastar = (e: React.DragEvent, codigo: string) => {
    e.dataTransfer.setData('text/plain', codigo)
    e.dataTransfer.effectAllowed = 'move'
  }

  const CORES_STATUS = {
    ABAIXO: 'text-amber-700',
    OK: 'text-green-700',
    ACIMA: 'text-red-700'
  }
  const MSG_STATUS = {
    ABAIXO: `abaixo do mínimo de ${plano.minimo}h`,
    OK: `dentro do intervalo ${plano.minimo}h a ${plano.maximo}h`,
    ACIMA: `acima do máximo de ${plano.maximo}h`
  }

  return (
    <div>
      <Header
        title="Planejador de matrícula"
        description="Arraste disciplinas para a grade e veja carga horária, choques de horário e pré-requisitos antes de se matricular."
      />
      <div className="space-y-4">
        {data.demonstracao && <AvisoDemo />}

        <div className="grid gap-4 lg:grid-cols-[22rem_minmax(0,1fr)]">
          <Card>
            <h3 className="text-base font-bold tracking-tight">
              Disciplinas disponíveis
            </h3>
            <p className="text-sm text-gray-500">
              Arraste para a grade (ou use o +). Para tirar do plano, arraste de
              volta para cá.
            </p>
            <Catalogo
              linhas={linhas}
              onArrastar={arrastar}
              onAdicionar={adicionar}
              onSoltarRemover={remover}
              onExcluir={excluirPropria}
            />
            <NovaDisciplina
              codigosExistentes={new Set(catalogo.map((d) => d.codigo))}
              onAdicionar={(d) =>
                setPlano((p) => ({
                  ...p,
                  personalizadas: [...p.personalizadas, d]
                }))
              }
            />
          </Card>

          <div className="min-w-0 space-y-4">
            <Card>
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold tracking-tight">
                    Meu plano
                  </h3>
                  <p
                    className={clsx(
                      'text-sm font-semibold',
                      CORES_STATUS[status]
                    )}
                  >
                    {total}h no plano · {noPlano.length}{' '}
                    {noPlano.length === 1 ? 'disciplina' : 'disciplinas'} ·{' '}
                    {MSG_STATUS[status]}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                  <label className="flex items-center gap-2">
                    Mín. (h)
                    <input
                      type="number"
                      min={0}
                      step={16}
                      value={plano.minimo}
                      onChange={(e) =>
                        setPlano((p) => ({
                          ...p,
                          minimo: Number(e.target.value)
                        }))
                      }
                      className={campo}
                    />
                  </label>
                  <label className="flex items-center gap-2">
                    Máx. (h)
                    <input
                      type="number"
                      min={0}
                      step={16}
                      value={plano.maximo}
                      onChange={(e) =>
                        setPlano((p) => ({
                          ...p,
                          maximo: Number(e.target.value)
                        }))
                      }
                      className={campo}
                    />
                  </label>
                </div>
              </div>

              {aviso && (
                <p
                  role="status"
                  className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800"
                >
                  {aviso}
                </p>
              )}

              <GradePlano
                itens={noPlano}
                emConflito={emConflito}
                onSoltar={adicionar}
                onArrastar={arrastar}
                onRemover={remover}
              />

              <ul className="space-y-1 text-sm">
                {emConflito.size > 0 && (
                  <li className="flex items-start gap-2 text-red-700">
                    <LuCircleAlert className="mt-0.5 shrink-0" />
                    Choque de horário entre {[...emConflito].join(', ')}.
                  </li>
                )}
                {mesmoSemestre.map(({ d, p }) => (
                  <li
                    key={d.codigo}
                    className="flex items-start gap-2 text-red-700"
                  >
                    <LuCircleAlert className="mt-0.5 shrink-0" />
                    {d.codigo} exige {p.join(', ')}, que está no mesmo plano:
                    não dá para cursar junto.
                  </li>
                ))}
                {semHorario.length > 0 && (
                  <li className="flex items-start gap-2 text-amber-700">
                    <LuCircleAlert className="mt-0.5 shrink-0" />
                    Sem horário conhecido (contam na carga, mas não aparecem na
                    grade): {semHorario.map((d) => d.codigo).join(', ')}.
                  </li>
                )}
                {noPlano.some(
                  (d) =>
                    pendencias(d, aprovados, andamento, setPlanoCodigos)
                      .emAndamento.length > 0
                ) && (
                  <li className="flex items-start gap-2 text-amber-700">
                    <LuCircleAlert className="mt-0.5 shrink-0" />
                    Parte do plano depende de aprovação nas disciplinas que você
                    está cursando agora.
                  </li>
                )}
                {noPlano.length > 0 &&
                  emConflito.size === 0 &&
                  mesmoSemestre.length === 0 &&
                  status === 'OK' && (
                    <li className="flex items-start gap-2 text-green-700">
                      <LuCircleCheck className="mt-0.5 shrink-0" />
                      Sem choques de horário e com a carga dentro do intervalo.
                    </li>
                  )}
                {liberadas.length > 0 && (
                  <li className="text-gray-600">
                    <strong>Este plano libera para depois:</strong>{' '}
                    {liberadas
                      .slice(0, 8)
                      .map((d) => d.codigo)
                      .join(', ')}
                    {liberadas.length > 8 && ` e mais ${liberadas.length - 8}`}.
                  </li>
                )}
              </ul>
            </Card>

            <Explicacao titulo="De onde vêm os dados e o que não está verificado">
              <p>
                Pré-requisitos e disciplinas aprovadas ou em andamento vêm do
                seu histórico no XOR. A matriz obrigatória, as optativas e os
                horários vêm do site do curso de CC (consultado em 29/10/2026),
                transcritos por leitura automática.
              </p>
              <p>
                Os horários da página não têm data de atualização e a sua turma
                pode ser outra; optativas não têm horário publicado (cadastre o
                seu em &quot;Cadastrar outra disciplina&quot;). A lista de
                optativas pode estar incompleta e alguns pré-requisitos com
                &quot;ou&quot; foram simplificados.
              </p>
              <p>
                Os limites de carga horária iniciais são valores sugeridos, não
                o regulamento da UFC: ajuste. O app não verifica correquisitos,
                vagas nem ofertas do semestre. Confirme tudo no SIGAA antes de
                se matricular.
              </p>
            </Explicacao>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PlanejadorPage
