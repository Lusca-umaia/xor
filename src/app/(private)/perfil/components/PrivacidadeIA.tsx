'use client'

import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { LuBrainCircuit, LuDatabase } from 'react-icons/lu'
import { CHAVES } from '@/services/academico/chaves'
import { QUERY_KEYS } from '@/hooks/queryKeys'
import { useSincronizado } from '@/hooks/useSincronizado'
import { apagarDadosAluno } from '@/services/academico/dadosAluno'
import { Aviso, BOTAO_SECUNDARIO, SecaoCard } from './SecaoCard'

const DADOS = [
  ['Atividades por disciplina', CHAVES.atividades],
  ['Eventos do calendário', CHAVES.eventos],
  ['Horários das aulas', CHAVES.turmas],
  ['Playlists do YouTube', CHAVES.playlists],
  ['Portfólio acadêmico', CHAVES.portfolio],
  ['Avaliações da calculadora de meta', CHAVES.avaliacoes],
  ['Limites do detector de sobrecarga', CHAVES.limites],
  ['Plano de matrícula', CHAVES.planejador]
] as const

const APAGAVEIS = [
  CHAVES.turmas,
  CHAVES.playlists,
  CHAVES.portfolio,
  CHAVES.atividades,
  CHAVES.eventos,
  CHAVES.avaliacoes,
  CHAVES.limites,
  CHAVES.planejador
]

const PrivacidadeIA: React.FC = () => {
  const [consentimento, setConsentimento] = useSincronizado(
    CHAVES.consentimentoIA,
    false
  )
  const queryClient = useQueryClient()
  const [estado, setEstado] = useState<
    'ocioso' | 'apagando' | 'apagado' | 'erro'
  >('ocioso')

  // Apaga no servidor e no cache deste navegador.
  const apagar = async () => {
    setEstado('apagando')
    try {
      await apagarDadosAluno(APAGAVEIS)
    } catch {
      setEstado('erro')
      return
    }
    try {
      APAGAVEIS.forEach((c) => window.localStorage.removeItem(c))
    } catch {
      // Sem acesso ao armazenamento: nada a apagar aqui.
    }
    queryClient.removeQueries({ queryKey: QUERY_KEYS.DADOS_ALUNO })
    setEstado('apagado')
  }

  return (
    <div className="space-y-4">
      <SecaoCard
        icon={<LuDatabase />}
        titulo="Dados da vida acadêmica"
        descricao="O que as telas de calendário, tarefas, calculadora e planejador guardam."
        rodape={
          <button
            type="button"
            onClick={apagar}
            disabled={estado === 'apagando'}
            className={BOTAO_SECUNDARIO}
          >
            {estado === 'apagando' ? 'Apagando...' : 'Apagar estes dados'}
          </button>
        }
      >
        <p className="text-sm text-gray-600">
          O que você cadastra nessas telas fica salvo na{' '}
          <strong>sua conta</strong> e aparece em qualquer dispositivo em que
          você entrar. Só você tem acesso, e nada disso é enviado a serviço de
          IA. Este navegador guarda uma cópia para abrir mais rápido.
        </p>
        <ul className="divide-y divide-gray-100 text-sm">
          {DADOS.map(([nome, chave]) => (
            <li key={chave} className="flex items-center justify-between py-2">
              <span>{nome}</span>
              <code className="text-xs text-gray-400">{chave}</code>
            </li>
          ))}
        </ul>
        {estado === 'apagado' && (
          <Aviso tipo="sucesso">
            Dados apagados da sua conta e deste navegador. Recarregue a página
            para ver as telas vazias.
          </Aviso>
        )}
        {estado === 'erro' && (
          <Aviso tipo="erro">
            Não foi possível apagar agora. Verifique a conexão e tente de novo.
          </Aviso>
        )}
      </SecaoCard>

      <SecaoCard
        icon={<LuBrainCircuit />}
        titulo="Uso de IA com seus dados"
        descricao="Preferência guardada para quando houver uma LLM conectada."
      >
        <p className="text-sm text-gray-600">
          Se uma LLM for conectada ao relatório semestral, os dados enviados
          seriam apenas os números já calculados (IRA, notas, riscos), nunca
          nome ou matrícula, e só com o seu consentimento abaixo. O texto gerado
          deve ser revisado por você antes de qualquer decisão.
        </p>
        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
          <input
            type="checkbox"
            checked={consentimento}
            onChange={(e) => setConsentimento(e.target.checked)}
            className="size-4 accent-black"
          />
          Autorizo o uso dos meus dados acadêmicos calculados por uma LLM
        </label>
        <p className="text-xs text-gray-500">
          Nenhuma LLM está conectada nesta versão, então esta preferência ainda
          não tem efeito.
        </p>
      </SecaoCard>
    </div>
  )
}

export default PrivacidadeIA
