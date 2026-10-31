const doisDigitos = (valor: number) => String(valor).padStart(2, '0')

/** 754 → "12:34"; 3754 → "1:02:34". */
export function formatarCronometro(segundos: number) {
  const total = Math.max(0, Math.ceil(segundos))
  const horas = Math.floor(total / 3600)
  const minutos = Math.floor((total % 3600) / 60)
  const resto = total % 60
  return horas > 0
    ? `${horas}:${doisDigitos(minutos)}:${doisDigitos(resto)}`
    : `${doisDigitos(minutos)}:${doisDigitos(resto)}`
}

/** 754 → "12 min 34 s". */
export function formatarDuracao(segundos: number) {
  const total = Math.max(0, Math.round(segundos))
  const horas = Math.floor(total / 3600)
  const minutos = Math.floor((total % 3600) / 60)
  const resto = total % 60
  if (horas > 0) return `${horas} h ${minutos} min`
  if (minutos > 0) return resto ? `${minutos} min ${resto} s` : `${minutos} min`
  return `${resto} s`
}

export function formatarDataRelativa(iso: string) {
  const data = new Date(iso)
  const diferencaMin = Math.round((Date.now() - data.getTime()) / 60_000)

  if (diferencaMin < 1) return 'agora'
  if (diferencaMin < 60) return `há ${diferencaMin} min`
  if (diferencaMin < 24 * 60) return `há ${Math.floor(diferencaMin / 60)} h`
  if (diferencaMin < 48 * 60) return 'ontem'
  return data.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}

export function formatarDataHora(iso: string) {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export function formatarTamanho(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1).replace('.', ',')} MB`
}

export function formatarNota(nota: number) {
  return nota.toLocaleString('pt-BR', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  })
}

export function pluralizar(
  quantidade: number,
  singular: string,
  plural: string
) {
  return `${quantidade} ${quantidade === 1 ? singular : plural}`
}
