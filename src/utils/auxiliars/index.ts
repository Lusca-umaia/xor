export const classNames = (...classes: string[]) => {
  return classes.join(' ')
}

export const numeroParaLetra = (numero: number) => {
  if (numero < 1 || numero > 26) return null
  return String.fromCharCode(64 + numero)
}
