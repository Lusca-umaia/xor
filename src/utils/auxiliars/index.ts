export const classNames = (...classes: string[]) => {
  return classes.join(' ')
}

// "Maria da Silva" -> "MS"
export const iniciais = (nome: string) => {
  const partes = nome.trim().split(/\s+/).filter(Boolean)
  if (partes.length === 0) return ''
  const primeira = partes[0][0]
  const ultima = partes.length > 1 ? partes[partes.length - 1][0] : ''
  return (primeira + ultima).toUpperCase()
}

export const numeroParaLetra = (numero: number) => {
  if (numero < 1 || numero > 26) return null
  return String.fromCharCode(64 + numero)
}
