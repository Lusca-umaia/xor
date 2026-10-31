'use client'

import { useState } from 'react'
import { LuBrainCircuit, LuDatabase } from 'react-icons/lu'
import { CHAVES } from '@/services/academico/chaves'
import { useArmazenado } from '../../pomodoro/hooks/useArmazenado'
import { Aviso, BOTAO_SECUNDARIO, SecaoCard } from './SecaoCard'

const DADOS = [
  ['Atividades por disciplina', CHAVES.atividades],
  ['Eventos do calendário', CHAVES.eventos],
  ['Horários das aulas', CHAVES.turmas],
  ['Playlists do YouTube', CHAVES.playlists],
  ['Portfólio acadêmico', CHAVES.portfolio],
  ['Avaliações da calculadora de meta', CHAVES.avaliacoes],
  ['Limites do detector de sobrecarga', CHAVES.limites]
] as const

const APAGAVEIS = [
  CHAVES.turmas,
  CHAVES.playlists,
  CHAVES.portfolio,
  CHAVES.atividades,
  CHAVES.eventos,
  CHAVES.avaliacoes,
  CHAVES.limites
]

const PrivacidadeIA: React.FC = () => {
  const [consentimento, setConsentimento] = useArmazenado(
    CHAVES.consentimentoIA,
    false
  )
  const [apagado, setApagado] = useState(false)

  const apagar = () => {
    try {
      APAGAVEIS.forEach((c) => window.localStorage.removeItem(c))
    } catch {
      // Sem acesso ao armazenamento: nada a apagar.
    }
    setApagado(true)
  }

  return (
    <div className="space-y-4">
      <SecaoCard
        icon={<LuDatabase />}
        titulo="Dados da vida acadêmica"
        descricao="O que as telas de calendário, atividades e calculadora guardam."
        rodape={
          <button type="button" onClick={apagar} className={BOTAO_SECUNDARIO}>
            Apagar dados deste navegador
          </button>
        }
      >
        <p className="text-sm text-gray-600">
          Hoje, tudo o que você cadastra nessas telas fica{' '}
          <strong>somente neste navegador</strong> (localStorage). Nada é
          enviado a servidor nem a serviço de IA. O histórico e a matriz
          curricular exibidos são dados de demonstração.
        </p>
        <ul className="divide-y divide-gray-100 text-sm">
          {DADOS.map(([nome, chave]) => (
            <li key={chave} className="flex items-center justify-between py-2">
              <span>{nome}</span>
              <code className="text-xs text-gray-400">{chave}</code>
            </li>
          ))}
        </ul>
        {apagado && (
          <Aviso tipo="sucesso">
            Dados apagados. Recarregue a página para voltar aos exemplos.
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
