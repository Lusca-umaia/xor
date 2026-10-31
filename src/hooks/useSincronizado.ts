'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react'
import { useArmazenado } from '@/app/(private)/pomodoro/hooks/useArmazenado'
import {
  listarDadosAluno,
  salvarDadoAluno
} from '@/services/academico/dadosAluno'
import { QUERY_KEYS } from './queryKeys'

const ESPERA_ENVIO_MS = 800

// Objetos são mesclados com o padrão para aceitar campos novos.
function mesclar<T>(padrao: T, valor: unknown): T {
  if (
    typeof padrao === 'object' &&
    padrao !== null &&
    !Array.isArray(padrao) &&
    typeof valor === 'object' &&
    valor !== null &&
    !Array.isArray(valor)
  )
    return { ...padrao, ...valor }
  return valor as T
}

/**
 * Como o useArmazenado, mas o valor acompanha o aluno em qualquer
 * dispositivo: o localStorage vira cache e o servidor guarda a versão
 * oficial. Na primeira vez, o que já estava só no navegador sobe para o
 * servidor. Sem conexão, segue funcionando só no navegador.
 */
export function useSincronizado<T>(
  chave: string,
  padrao: T
): [T, Dispatch<SetStateAction<T>>, boolean] {
  const padraoRef = useRef(padrao)
  const queryClient = useQueryClient()
  const [valor, setValor, localOk] = useArmazenado<T>(chave, padrao)
  // Uma consulta só para todas as chaves da página.
  const remoto = useQuery({
    queryKey: QUERY_KEYS.DADOS_ALUNO,
    queryFn: listarDadosAluno,
    staleTime: Infinity,
    retry: 1
  })
  const [sincronizado, setSincronizado] = useState(false)
  // Último valor que o servidor já tem, para não reenviar o que veio dele.
  const noServidor = useRef<string | null>(null)

  useEffect(() => {
    if (sincronizado || !localOk || !remoto.isSuccess) return
    if (chave in remoto.data) {
      const doServidor = mesclar(padraoRef.current, remoto.data[chave])
      noServidor.current = JSON.stringify(doServidor)
      setValor(doServidor)
    } else {
      // Nada no servidor: o efeito de envio abaixo sobe o valor local, se
      // houver algo além do padrão.
      noServidor.current = JSON.stringify(padraoRef.current)
    }
    setSincronizado(true)
  }, [chave, localOk, remoto.isSuccess, remoto.data, sincronizado, setValor])

  useEffect(() => {
    if (!sincronizado) return
    const json = JSON.stringify(valor)
    if (json === noServidor.current) return
    const espera = setTimeout(() => {
      noServidor.current = json
      // Mantém o cache igual ao servidor: outra tela que montar depois lê
      // daqui e não pode voltar a um valor antigo.
      queryClient.setQueryData<Record<string, unknown>>(
        QUERY_KEYS.DADOS_ALUNO,
        (atual) => ({ ...atual, [chave]: valor })
      )
      salvarDadoAluno(chave, valor).catch(() => {
        // Fica no navegador; tenta de novo na próxima alteração.
        noServidor.current = null
      })
    }, ESPERA_ENVIO_MS)
    return () => clearTimeout(espera)
  }, [chave, valor, sincronizado, queryClient])

  return [valor, setValor, localOk && (sincronizado || remoto.isError)]
}
