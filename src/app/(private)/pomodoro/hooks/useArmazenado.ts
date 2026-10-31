'use client'

import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react'

function ler<T>(chave: string, padrao: T): T {
  try {
    const bruto = window.localStorage.getItem(chave)
    if (bruto === null) return padrao
    const valor = JSON.parse(bruto)
    // Objetos são mesclados com o padrão para aceitar campos novos.
    if (
      typeof padrao === 'object' &&
      padrao !== null &&
      !Array.isArray(padrao) &&
      typeof valor === 'object' &&
      valor !== null
    ) {
      return { ...padrao, ...valor }
    }
    return valor as T
  } catch {
    return padrao
  }
}

// Estado salvo no localStorage. Lê só depois de montar para não divergir
// do HTML gerado no servidor; `carregado` indica quando o valor é o salvo.
export function useArmazenado<T>(
  chave: string,
  padrao: T
): [T, Dispatch<SetStateAction<T>>, boolean] {
  const padraoRef = useRef(padrao)
  const [valor, setValor] = useState<T>(padrao)
  const [carregado, setCarregado] = useState(false)

  useEffect(() => {
    setValor(ler(chave, padraoRef.current))
    setCarregado(true)
  }, [chave])

  useEffect(() => {
    if (!carregado) return
    try {
      window.localStorage.setItem(chave, JSON.stringify(valor))
    } catch {
      // Sem armazenamento (ex.: modo privado): segue só em memória.
    }
  }, [chave, valor, carregado])

  return [valor, setValor, carregado]
}
