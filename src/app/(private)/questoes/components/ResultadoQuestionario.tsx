'use client'

import clsx from 'clsx'
import { useMemo, useState } from 'react'
import {
  LuCircleCheck,
  LuCircleMinus,
  LuCircleX,
  LuClock,
  LuLightbulb,
  LuListChecks,
  LuLoaderCircle,
  LuRotateCcw,
  LuTarget,
  LuTrophy
} from 'react-icons/lu'
import { Questao } from '@/@types/Questionario'
import { numeroParaLetra } from '@/utils/auxiliars'
import { corrigir, formatarDuracao } from '@/utils/questionarios'
import AlternativaOpcao, { estadoNaCorrecao } from './AlternativaOpcao'
import AnelProgresso from './AnelProgresso'
import Etiqueta from './Etiqueta'
import type { Respostas } from './ResolucaoQuestionario'

type Filtro = 'TODAS' | 'ACERTOS' | 'ERROS' | 'EM_BRANCO'

interface ResultadoQuestionarioProps {
  questoes: Questao[]
  respostas: Respostas
  duracaoSegundos: number
  treino: boolean
  // Melhor percentual antes desta resolução (null se for a primeira).
  melhorAnterior: number | null
  envio: {
    salvando: boolean
    erro: string | null
    onTentarNovamente: () => void
  }
  onRefazer: () => void
  onTreinarErradas: (questoes: Questao[]) => void
  onVoltar: () => void
}

function mensagem(valor: number) {
  if (valor === 100) return 'Gabaritou! Domínio total do conteúdo.'
  if (valor >= 80) return 'Excelente! Você está muito bem preparado(a).'
  if (valor >= 60)
    return 'Bom trabalho! Revise os erros para fechar as lacunas.'
  if (valor >= 40)
    return 'Caminho certo. Vale revisar o conteúdo e tentar de novo.'
  return 'Hora de revisar. Use as explicações e treine as que errou.'
}

const ResultadoQuestionario: React.FC<ResultadoQuestionarioProps> = ({
  questoes,
  respostas,
  duracaoSegundos,
  treino,
  melhorAnterior,
  envio,
  onRefazer,
  onTreinarErradas,
  onVoltar
}) => {
  const [filtro, setFiltro] = useState<Filtro>('TODAS')

  const resultado = useMemo(
    () => corrigir(questoes, respostas),
    [questoes, respostas]
  )
  const erradas = questoes.filter((_, i) => !resultado.correcao[i].acertou)
  const recorde =
    !treino && melhorAnterior !== null && resultado.percentual > melhorAnterior

  const filtros: { id: Filtro; nome: string; total: number }[] = [
    { id: 'TODAS', nome: 'Todas', total: resultado.total },
    { id: 'ACERTOS', nome: 'Acertos', total: resultado.acertos },
    { id: 'ERROS', nome: 'Erros', total: resultado.erros },
    { id: 'EM_BRANCO', nome: 'Em branco', total: resultado.emBranco }
  ]

  const itens = questoes
    .map((questao, i) => ({ questao, numero: i + 1, ...resultado.correcao[i] }))
    .filter(({ acertou, alternativa }) => {
      if (filtro === 'ACERTOS') return acertou
      if (filtro === 'ERROS') return !acertou && alternativa !== null
      if (filtro === 'EM_BRANCO') return alternativa === null
      return true
    })

  const numeros = [
    {
      label: 'Acertos',
      valor: resultado.acertos,
      icon: <LuCircleCheck className="text-emerald-500" />
    },
    {
      label: 'Erros',
      valor: resultado.erros,
      icon: <LuCircleX className="text-red-500" />
    },
    {
      label: 'Em branco',
      valor: resultado.emBranco,
      icon: <LuCircleMinus className="text-gray-400" />
    },
    {
      label: 'Tempo',
      valor: formatarDuracao(duracaoSegundos),
      icon: <LuClock className="text-gray-500" />
    }
  ]

  return (
    <div className="mx-auto max-w-5xl space-y-4">
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-md max-md:p-4">
        <div className="flex flex-col items-center gap-6 md:flex-row">
          <AnelProgresso
            valor={resultado.percentual}
            tamanho={140}
            espessura={12}
          >
            <span className="text-3xl font-bold">{resultado.percentual}%</span>
            <span className="text-xs font-medium text-gray-500">de acerto</span>
          </AnelProgresso>

          <div className="flex-1 space-y-3 max-md:text-center">
            <div className="flex flex-wrap items-center gap-2 max-md:justify-center">
              {treino && <Etiqueta tom="alerta">Treino das erradas</Etiqueta>}
              {recorde && (
                <Etiqueta tom="sucesso" icon={<LuTrophy />}>
                  Novo recorde! Antes: {melhorAnterior}%
                </Etiqueta>
              )}
            </div>
            <h2 className="text-xl font-bold tracking-tight">
              {mensagem(resultado.percentual)}
            </h2>
            <p className="text-sm text-gray-500">
              Você acertou {resultado.acertos} de {resultado.total}{' '}
              {resultado.total === 1 ? 'questão' : 'questões'}.
            </p>

            <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
              {numeros.map((n) => (
                <div
                  key={n.label}
                  className="rounded-xl bg-gray-50 p-3 text-left"
                >
                  <p className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
                    {n.icon}
                    {n.label}
                  </p>
                  <p className="mt-0.5 text-lg font-bold">{n.valor}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 border-t border-gray-100 pt-4 md:flex-row md:items-center md:justify-between">
          <div className="text-sm">
            {treino ? (
              <p className="text-gray-500">
                Treinos não entram no seu histórico.
              </p>
            ) : envio.salvando ? (
              <p className="flex items-center gap-1.5 text-gray-500">
                <LuLoaderCircle className="animate-spin" /> Salvando no
                histórico...
              </p>
            ) : envio.erro ? (
              <p className="font-medium text-red-600">
                {envio.erro}.{' '}
                <button
                  type="button"
                  onClick={envio.onTentarNovamente}
                  className="cursor-pointer font-semibold underline"
                >
                  Tentar novamente
                </button>
              </p>
            ) : (
              <p className="flex items-center gap-1.5 text-emerald-700">
                <LuCircleCheck /> Resultado salvo no histórico
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onVoltar}
              className="cursor-pointer rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
            >
              Voltar para a lista
            </button>
            {erradas.length > 0 && (
              <button
                type="button"
                onClick={() => onTreinarErradas(erradas)}
                className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
              >
                <LuTarget /> Treinar as {erradas.length} que errei
              </button>
            )}
            <button
              type="button"
              onClick={onRefazer}
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-black px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-gray-800"
            >
              <LuRotateCcw /> Refazer
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-md max-md:p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <p className="flex items-center gap-2 text-base font-bold">
            <LuListChecks /> Correção
          </p>
          <div className="flex overflow-x-auto rounded-xl bg-gray-100 p-1 text-sm font-semibold">
            {filtros.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFiltro(f.id)}
                className={clsx(
                  'cursor-pointer whitespace-nowrap rounded-lg px-3 py-1.5 transition',
                  filtro === f.id
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-900'
                )}
              >
                {f.nome} <span className="text-gray-400">{f.total}</span>
              </button>
            ))}
          </div>
        </div>

        {itens.length === 0 && (
          <p className="py-6 text-center text-sm text-gray-500">
            Nenhuma questão nesta categoria.
          </p>
        )}

        {itens.map(({ questao, numero, alternativa, acertou }) => (
          <div
            key={questao.id}
            className="space-y-3 rounded-xl p-4 ring-1 ring-inset ring-gray-100"
          >
            <div className="flex items-start justify-between gap-3">
              <p className="whitespace-pre-wrap text-sm font-semibold text-gray-900">
                <span className="mr-1 text-gray-400">{numero}.</span>
                {questao.enunciado}
              </p>
              {acertou ? (
                <Etiqueta tom="sucesso" icon={<LuCircleCheck />}>
                  Acertou
                </Etiqueta>
              ) : alternativa === null ? (
                <Etiqueta icon={<LuCircleMinus />}>Em branco</Etiqueta>
              ) : (
                <Etiqueta tom="erro" icon={<LuCircleX />}>
                  Errou
                </Etiqueta>
              )}
            </div>

            <div className="space-y-2">
              {questao.alternativas.map((texto, indice) => (
                <AlternativaOpcao
                  key={indice}
                  indice={indice}
                  texto={texto}
                  estado={estadoNaCorrecao(
                    indice,
                    questao.correta,
                    alternativa
                  )}
                />
              ))}
            </div>

            {!acertou && (
              <p className="text-xs text-gray-500">
                {alternativa === null
                  ? 'Você não respondeu.'
                  : `Você marcou ${numeroParaLetra(alternativa + 1)}.`}{' '}
                A resposta certa é a {numeroParaLetra(questao.correta + 1)}.
              </p>
            )}

            {questao.explicacao && (
              <div className="flex items-start gap-2 rounded-xl bg-amber-50/70 p-3 text-sm text-gray-700">
                <LuLightbulb className="mt-0.5 shrink-0 text-amber-500" />
                <p className="whitespace-pre-wrap">{questao.explicacao}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default ResultadoQuestionario
