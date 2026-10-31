import 'server-only'

import JSZip from 'jszip'
import mammoth from 'mammoth'
import { PDFParse } from 'pdf-parse'
import type { TipoMaterial } from '@/@types/AmbienteEstudo'

export interface TrechoExtraido {
  pagina: number | null
  texto: string
}

export interface TextoExtraido {
  trechos: TrechoExtraido[]
  /** Páginas do PDF ou slides do PPTX; null para os demais tipos. */
  paginas: number | null
}

const TAMANHO_TRECHO = 1_500

/** Divide um texto longo em trechos, preferindo quebrar entre parágrafos. */
export function dividirTexto(
  texto: string,
  pagina: number | null = null
): TrechoExtraido[] {
  const paragrafos = texto
    .split(/\n\s*\n/)
    .map((paragrafo) => paragrafo.replace(/\s+/g, ' ').trim())
    .filter(Boolean)

  const trechos: TrechoExtraido[] = []
  let atual = ''
  for (const paragrafo of paragrafos) {
    if (atual && atual.length + paragrafo.length > TAMANHO_TRECHO) {
      trechos.push({ pagina, texto: atual })
      atual = ''
    }
    // Parágrafo maior que um trecho inteiro: corta em pedaços.
    for (let inicio = 0; inicio < paragrafo.length; inicio += TAMANHO_TRECHO) {
      const pedaco = paragrafo.slice(inicio, inicio + TAMANHO_TRECHO)
      atual = atual ? `${atual}\n\n${pedaco}` : pedaco
      if (atual.length >= TAMANHO_TRECHO) {
        trechos.push({ pagina, texto: atual })
        atual = ''
      }
    }
  }
  if (atual) trechos.push({ pagina, texto: atual })
  return trechos
}

async function extrairPdf(bytes: Uint8Array): Promise<TextoExtraido> {
  const parser = new PDFParse({ data: bytes })
  try {
    const resultado = await parser.getText()
    return {
      paginas: resultado.total,
      trechos: resultado.pages.flatMap(({ num, text }) =>
        dividirTexto(text, num)
      )
    }
  } finally {
    await parser.destroy()
  }
}

async function extrairDocx(bytes: Uint8Array): Promise<TextoExtraido> {
  const { value } = await mammoth.extractRawText({ buffer: Buffer.from(bytes) })
  return { paginas: null, trechos: dividirTexto(value) }
}

const decodificarXml = (texto: string) =>
  texto
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&')

/** Lê o texto de cada slide (elementos <a:t> de ppt/slides/slideN.xml). */
async function extrairPptx(bytes: Uint8Array): Promise<TextoExtraido> {
  const zip = await JSZip.loadAsync(bytes)
  const slides = Object.keys(zip.files)
    .map((nome) => ({
      nome,
      numero: Number(nome.match(/^ppt\/slides\/slide(\d+)\.xml$/)?.[1])
    }))
    .filter(({ numero }) => Number.isInteger(numero) && numero > 0)
    .sort((a, b) => a.numero - b.numero)

  const trechos: TrechoExtraido[] = []
  for (const { nome, numero } of slides) {
    const xml = await zip.file(nome)!.async('string')
    const textos = [...xml.matchAll(/<a:t>([^<]*)<\/a:t>/g)].map(([, texto]) =>
      decodificarXml(texto)
    )
    trechos.push(...dividirTexto(textos.join('\n\n'), numero))
  }
  return { paginas: slides.length, trechos }
}

/** Extrai o texto do arquivo. Imagens não têm texto nesta fase. */
export async function extrairTexto(
  tipo: TipoMaterial,
  bytes: Uint8Array
): Promise<TextoExtraido> {
  switch (tipo) {
    case 'PDF':
      return extrairPdf(bytes)
    case 'DOCX':
      return extrairDocx(bytes)
    case 'PPTX':
      return extrairPptx(bytes)
    case 'TEXTO':
      return {
        paginas: null,
        trechos: dividirTexto(new TextDecoder().decode(bytes))
      }
    case 'IMAGEM':
      return { paginas: null, trechos: [] }
  }
}
