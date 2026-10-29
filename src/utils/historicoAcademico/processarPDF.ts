import { PDFParse } from 'pdf-parse'

import {
  ResultadoHistorico,
  extrairHistoricoSIGAA
} from '@/utils/extrairHistoricoSigaa'

const PDF_PARSE_WORKER =
  'https://cdn.jsdelivr.net/npm/pdf-parse@2.4.5/dist/pdf-parse/web/pdf.worker.min.mjs'

let workerConfigurado = false

function configurarWorker() {
  if (workerConfigurado) return

  PDFParse.setWorker(PDF_PARSE_WORKER)
  workerConfigurado = true
}

export async function processarHistoricoPDF(
  arquivo: File
): Promise<ResultadoHistorico> {
  configurarWorker()

  const buffer = await arquivo.arrayBuffer()
  const parser = new PDFParse({ data: new Uint8Array(buffer) })

  try {
    const resultadoTabelas = await parser.getTable()
    const resultadoTexto = await parser.getText()

    const tabelas = resultadoTabelas.pages.flatMap((pagina, indicePagina) =>
      (pagina.tables ?? []).map((tabela, indiceTabela) => ({
        pagina: indicePagina + 1,
        indice: indiceTabela,
        linhas: tabela as string[][]
      }))
    )

    return extrairHistoricoSIGAA(tabelas, resultadoTexto.text)
  } finally {
    await parser.destroy()
  }
}
