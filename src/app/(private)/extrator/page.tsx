'use client'

import { useState } from 'react'
import { processarHistoricoPDF } from '@/utils/historicoAcademico/processarPDF'

export default function Home() {
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  async function processarPDF(event: React.ChangeEvent<HTMLInputElement>) {
    const arquivo = event.target.files?.[0]

    if (!arquivo) return

    if (arquivo.type !== 'application/pdf') {
      setErro('Selecione um arquivo PDF.')
      return
    }

    setCarregando(true)
    setErro(null)

    try {
      const historico = await processarHistoricoPDF(arquivo)

      console.group('📄 Histórico acadêmico — SIGAA/UFC')

      console.log('Arquivo:', arquivo.name)
      console.log('Aluno:', historico.dadosAluno)
      console.log('Curso:', historico.dadosCurso)
      console.log('Semestre atual:', historico.semestreAtual)
      console.log('Resumo:', historico.resumo)
      console.log('Carga horária:', historico.cargaHoraria)

      console.group('Disciplinas cursadas')
      console.table(historico.cursadas)
      console.groupEnd()

      console.group('Disciplinas em andamento')
      console.table(historico.emAndamento)
      console.groupEnd()

      console.group('Pendências curriculares')
      console.table(historico.pendencias)
      console.groupEnd()

      console.log('Integralização:', historico.integralizacao)

      console.group('Registros não identificados')
      console.table(historico.registrosNaoIdentificados)
      console.groupEnd()

      console.log('Objeto completo:', historico)
      console.groupEnd()
    } catch (error) {
      console.error('Erro ao processar o PDF:', error)

      setErro(
        error instanceof Error
          ? error.message
          : 'Não foi possível processar o PDF.'
      )
    } finally {
      setCarregando(false)
      event.target.value = ''
    }
  }

  return (
    <main className="mx-auto max-w-2xl space-y-4 p-8">
      <h1 className="text-2xl font-bold">Extrator de histórico acadêmico</h1>

      <p>
        Selecione o PDF do histórico acadêmico para extrair e normalizar as
        informações.
      </p>

      <input
        type="file"
        accept="application/pdf,.pdf"
        onChange={processarPDF}
        disabled={carregando}
      />

      {carregando && <p>Extraindo informações do PDF...</p>}

      {erro && <p className="text-red-500">{erro}</p>}

      <p className="text-sm text-gray-500">
        Abra o console do navegador (F12) para visualizar os dados extraídos.
      </p>
    </main>
  )
}
