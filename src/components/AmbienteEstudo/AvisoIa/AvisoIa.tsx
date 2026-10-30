'use client'

import { useQuery } from '@tanstack/react-query'
import { LuRefreshCw, LuTriangleAlert } from 'react-icons/lu'
import { StatusIa } from '@/@types/AmbienteEstudo'
import { chavesAmbiente } from '@/hooks/ambienteEstudo/chavesConsulta'
import { obterStatusIa } from '@/services/ambienteEstudo/ia'

const MENSAGENS: Record<
  Exclude<StatusIa['situacao'], 'OK'>,
  (status: StatusIa) => { texto: string; dica: string }
> = {
  OFFLINE: () => ({
    texto:
      'A IA local não está respondendo. Chats, resumos, atividades e simulados ficam indisponíveis até ela voltar.',
    dica: 'Abra o Ollama ou rode npm run ia:verificar.'
  }),
  SEM_MODELO: ({ modelo }) => ({
    texto: `O modelo de IA "${modelo}" não está instalado no servidor de IA.`,
    dica: 'Rode npm run ia:setup para baixar e criar os modelos.'
  }),
  NAO_CONFIGURADA: () => ({
    texto: 'A IA ainda não foi configurada neste servidor.',
    dica: 'Copie o .env.example para .env.local e rode npm run ia:setup.'
  })
}

// Os comandos só fazem sentido para quem está rodando o projeto.
const EM_DESENVOLVIMENTO = process.env.NODE_ENV === 'development'

/** Aviso quando a IA local não responde ou não tem o modelo instalado. */
export default function AvisoIa() {
  const {
    data: status,
    refetch,
    isFetching
  } = useQuery({
    queryKey: [...chavesAmbiente.raiz, 'statusIa'],
    queryFn: obterStatusIa,
    staleTime: 60_000,
    retry: false
  })
  if (!status || status.situacao === 'OK') return null

  const { texto, dica } = MENSAGENS[status.situacao](status)
  return (
    <div
      role="alert"
      className="flex flex-wrap items-start gap-3 rounded-2xl bg-amber-50 p-4 text-sm text-amber-900 ring-1 ring-inset ring-amber-600/20"
    >
      <LuTriangleAlert className="mt-0.5 shrink-0 text-lg" aria-hidden />
      <div className="min-w-0 flex-1">
        <p className="font-semibold">{texto}</p>
        {EM_DESENVOLVIMENTO && <p className="mt-0.5 text-amber-800">{dica}</p>}
      </div>
      <button
        type="button"
        onClick={() => refetch()}
        disabled={isFetching}
        className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 font-semibold text-amber-900 ring-1 ring-inset ring-amber-600/30 hover:bg-amber-100 disabled:opacity-60"
      >
        <LuRefreshCw
          className={isFetching ? 'animate-spin' : undefined}
          aria-hidden
        />
        Verificar de novo
      </button>
    </div>
  )
}
