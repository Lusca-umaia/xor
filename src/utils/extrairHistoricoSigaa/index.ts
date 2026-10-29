export type TabelaPDF = {
  pagina: number
  indice: number
  linhas: string[][]
}

export type CategoriaDisciplina =
  | 'cursada'
  | 'em_andamento'
  | 'pendente'
  | 'nao_identificada'

export type DisciplinaHistorico = {
  codigo: string | null
  nome: string
  semestre: string | null
  cargaHoraria: number | null
  turma: string | null
  frequencia: number | null
  nota: number | null
  situacao: string | null
  categoria: CategoriaDisciplina
  marcador: string | null
  tipoComponente: string | null
  docente: string | null
  pagina: number
  tabela: number
  linhaOriginal: string[]
}

export type PendenciaCurricular = {
  codigo: string
  nome: string
  cargaHoraria: number | null
  matriculado: boolean
  pagina: number
  linhaOriginal: string[]
}

export type RegistroNaoIdentificado = {
  pagina: number
  tabela: number
  linhaOriginal: string[]
  motivo: string
}

export type LinhaCargaHoraria = {
  exigido: number | null
  integralizado: number | null
  computavel: number | null
  pendente: number | null
}

export type CargaHorariaHistorico = {
  total: LinhaCargaHoraria | null
  optativa: LinhaCargaHoraria | null
  atividadesComplementares: LinhaCargaHoraria | null
  optativosLivres: LinhaCargaHoraria | null
  tcc: LinhaCargaHoraria | null
  estagio: LinhaCargaHoraria | null
  extensao: LinhaCargaHoraria | null
}

export type DadosAlunoHistorico = {
  matricula: string | null
  nome: string | null
}

export type DadosCursoHistorico = {
  codigo: string | null
  nome: string | null
  grau: string | null
  modalidade: string | null
  curriculo: string | null
  turno: string | null
  status: string | null
  unidade: string | null
  anoPeriodoInicial: string | null
  prazoConclusao: string | null
  formaIngresso: string | null
  iraIndividual: number | null
  iraGeral: number | null
}

export type ResultadoHistorico = {
  disciplinas: DisciplinaHistorico[]
  cursadas: DisciplinaHistorico[]
  emAndamento: DisciplinaHistorico[]
  pendencias: PendenciaCurricular[]
  integralizacao: Record<string, string>
  cargaHoraria: CargaHorariaHistorico
  dadosAluno: DadosAlunoHistorico
  dadosCurso: DadosCursoHistorico
  semestreAtual: string | null
  resumo: {
    totalDisciplinas: number
    totalCursadas: number
    totalEmAndamento: number
    totalPendencias: number
    totalAprovadas: number
    totalReprovadas: number
    cargaHorariaCursada: number
    cargaHorariaEmAndamento: number
    cargaHorariaPendente: number
    mediaNotas: number | null
  }
  registrosNaoIdentificados: RegistroNaoIdentificado[]
  tabelasOriginais: TabelaPDF[]
}

const REGEX_SEMESTRE = /^\d{4}\.[12]$/
const REGEX_CODIGO = /^[A-Z]{2,3}\d{4}$/i
const REGEX_CODIGO_EM_TEXTO = /\b[A-Z]{2,3}\d{4}\b/i

const MARCADORES: Record<string, string> = {
  '*': 'Componente optativo',
  e: 'Componente equivalente a obrigatório',
  '&': 'Componente equivalente a optativo',
  '#': 'Componente optativo livre',
  '@': 'Atividade obrigatória',
  '§': 'Atividade optativa'
}

const STATUS_CONHECIDOS = [
  'APROVADO MÉDIA',
  'APROVADO',
  'REPROVADO MÉDIA',
  'REPROVADO',
  'MATRICULADO',
  'TRANCADO',
  'CANCELADO',
  'DISPENSADO',
  'REPROVADO POR FALTA',
  'APROVADO POR NOTA'
]

function limpar(valor: unknown): string {
  return String(valor ?? '')
    .replace(/\u00a0/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function normalizarStatus(valor: string): string {
  return limpar(valor)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
}

function numero(valor: unknown): number | null {
  const texto = limpar(valor)

  if (!texto || /^(--|—|-|n\/a)$/i.test(texto)) {
    return null
  }

  // Aceita, por exemplo, "64.00", "64,00" e "64 h".
  const normalizado = texto
    .replace(/\s*h$/i, '')
    .replace('%', '')
    .replace(',', '.')

  const resultado = Number(normalizado)

  return Number.isFinite(resultado) ? resultado : null
}

function ehSemestre(valor: unknown): boolean {
  return REGEX_SEMESTRE.test(limpar(valor))
}

function ehCodigo(valor: unknown): boolean {
  return REGEX_CODIGO.test(limpar(valor))
}

function extrairCodigo(texto: string): string | null {
  return texto.match(REGEX_CODIGO_EM_TEXTO)?.[0]?.toUpperCase() ?? null
}

function extrairDocente(texto: string): string | null {
  const correspondencia = texto.match(/Docente\(s\)\s*:\s*([\s\S]*)/i)

  return correspondencia ? limpar(correspondencia[1]) || null : null
}

function removerDocente(texto: string): string {
  return texto.replace(/Docente\(s\)\s*:[\s\S]*$/i, '').trim()
}

function identificarStatus(valor: unknown): string | null {
  const texto = limpar(valor)
  if (!texto) return null

  const normalizado = normalizarStatus(texto)

  return (
    STATUS_CONHECIDOS.find(
      (status) => normalizarStatus(status) === normalizado
    ) ?? texto
  )
}

function identificarCategoria(situacao: string | null): CategoriaDisciplina {
  const status = normalizarStatus(situacao ?? '')

  if (status.includes('MATRICULADO')) {
    return 'em_andamento'
  }

  if (
    status.includes('APROVADO') ||
    status.includes('REPROVADO') ||
    status.includes('TRANCADO') ||
    status.includes('CANCELADO') ||
    status.includes('DISPENSADO')
  ) {
    return 'cursada'
  }

  return 'nao_identificada'
}

function ehCabecalhoPendencias(linhas: string[][]): boolean {
  return linhas.some((linha) => {
    const texto = normalizarStatus(linha.join(' '))

    return (
      texto.includes('CODIGO') &&
      texto.includes('COMPONENTE CURRICULAR') &&
      texto.includes('CH')
    )
  })
}

function extrairPendencia(
  linha: string[],
  pagina: number
): PendenciaCurricular | null {
  if (linha.length !== 3) return null

  const codigo = limpar(linha[0]).toUpperCase()
  const nomeOriginal = limpar(linha[1])
  const cargaOriginal = limpar(linha[2])

  if (!ehCodigo(codigo) || !nomeOriginal) return null

  const matriculado = /\bmatriculado\b/i.test(nomeOriginal)
  const nome = limpar(nomeOriginal.replace(/\bmatriculado\b/gi, ''))

  return {
    codigo,
    nome,
    cargaHoraria: numero(cargaOriginal),
    matriculado,
    pagina,
    linhaOriginal: linha
  }
}

function extrairDisciplina(
  linha: string[],
  pagina: number,
  tabela: number,
  semestreContexto: string | null
): DisciplinaHistorico | null {
  let codigo: string | null = null
  let nome = ''
  let cargaHoraria: number | null = null
  let turma: string | null = null
  let frequencia: number | null = null
  let nota: number | null = null
  let situacao: string | null = null
  let marcador: string | null = null
  let docente: string | null = null
  let semestre = semestreContexto

  // Formato compacto observado em algumas páginas:
  // [semestre, marcador, "NOME CÓDIGO CH\nDocente(s): ...",
  //  turma, frequência, nota, situação]
  if (linha.length === 7) {
    semestre = ehSemestre(linha[0]) ? limpar(linha[0]) : semestre

    marcador = limpar(linha[1]) || null

    const textoCompleto = limpar(linha[2])
    docente = extrairDocente(textoCompleto)

    const textoDisciplina = removerDocente(textoCompleto)
    const codigoEncontrado = textoDisciplina.match(
      /^([\s\S]*?)\s+([A-Z]{2,3}\d{4})\s+(\d+(?:[.,]\d+)?)\b/i
    )

    if (!codigoEncontrado) return null

    nome = limpar(codigoEncontrado[1])
    codigo = codigoEncontrado[2].toUpperCase()
    cargaHoraria = numero(codigoEncontrado[3])

    turma = limpar(linha[3]) || null
    frequencia = numero(linha[4])
    nota = numero(linha[5])
    situacao = identificarStatus(linha[6])
  }

  // Formato separado observado em outras páginas:
  // [semestre, marcador, código, nome, CH, turma,
  //  frequência, nota, situação]
  else if (linha.length === 9) {
    semestre = ehSemestre(linha[0]) ? limpar(linha[0]) : semestre

    marcador = limpar(linha[1]) || null
    codigo = limpar(linha[2]).toUpperCase()

    if (!ehCodigo(codigo)) return null

    const nomeCompleto = limpar(linha[3])
    docente = extrairDocente(nomeCompleto)
    nome = limpar(removerDocente(nomeCompleto))

    cargaHoraria = numero(linha[4])
    turma = limpar(linha[5]) || null
    frequencia = numero(linha[6])
    nota = numero(linha[7])
    situacao = identificarStatus(linha[8])
  } else {
    return null
  }

  if (!codigo || !nome) return null

  return {
    codigo,
    nome,
    semestre,
    cargaHoraria,
    turma,
    frequencia,
    nota,
    situacao,
    categoria: identificarCategoria(situacao),
    marcador,
    tipoComponente: marcador
      ? (MARCADORES[marcador] ?? 'Marcador não identificado')
      : null,
    docente,
    pagina,
    tabela,
    linhaOriginal: linha
  }
}

function extrairIntegralizacao(tabelas: TabelaPDF[]): Record<string, string> {
  const resultado: Record<string, string> = {}

  const regexValor = /(\d+(?:[.,]\d+)?\s*(?:h|horas|créditos|crédito|%))/i

  for (const tabela of tabelas) {
    for (const linha of tabela.linhas) {
      if (linha.length < 2) continue

      const rotulo = limpar(linha[0])
      const valor = limpar(linha.slice(1).join(' '))

      if (!rotulo || !valor) continue

      const rotuloNormalizado = normalizarStatus(rotulo)

      // Evita registrar cada disciplina como se fosse integralização.
      const pareceResumo =
        /CARGA HORARIA|CREDITOS|INTEGRALIZACAO|OBRIGATORIO|OPTATIVO|EXIGIDO|CUMPRIDO|PENDENTE|TOTAL/.test(
          rotuloNormalizado
        ) &&
        (regexValor.test(valor) || /\d/.test(valor))

      if (pareceResumo) {
        resultado[rotulo] = valor
      }
    }
  }

  return resultado
}

function linhaCargaHoraria(linha: string[]): LinhaCargaHoraria {
  return {
    exigido: numero(linha[1]),
    integralizado: numero(linha[2]),
    computavel: numero(linha[3]),
    pendente: numero(linha[4])
  }
}

function extrairCargaHoraria(tabelas: TabelaPDF[]): CargaHorariaHistorico {
  const resultado: CargaHorariaHistorico = {
    total: null,
    optativa: null,
    atividadesComplementares: null,
    optativosLivres: null,
    tcc: null,
    estagio: null,
    extensao: null
  }

  const mapa: [RegExp, keyof CargaHorariaHistorico][] = [
    [/^CARGA HORARIA TOTAL$/i, 'total'],
    [/^CARGA HORARIA OPTATIVA$/i, 'optativa'],
    [
      /^CARGA HORARIA DE ATIVIDADES COMPLEMENTARES$/i,
      'atividadesComplementares'
    ],
    [/^CARGA HORARIA DE COMPONENTES OPTATIVOS LIVRES$/i, 'optativosLivres'],
    [/^CARGA HORARIA DE TCC$/i, 'tcc'],
    [/^CARGA HORARIA DE ESTAGIO$/i, 'estagio'],
    [/^CARGA HORARIA DE EXTENSAO$/i, 'extensao']
  ]

  for (const tabela of tabelas) {
    for (const linhaOriginal of tabela.linhas) {
      const linha = linhaOriginal.map(limpar)

      if (linha.length < 5) continue

      const chave = mapa.find(([regex]) =>
        regex.test(normalizarStatus(linha[0]))
      )?.[1]

      if (chave && !resultado[chave]) {
        resultado[chave] = linhaCargaHoraria(linha)
      }
    }
  }

  return resultado
}

function extrairDadosAluno(texto: string): DadosAlunoHistorico {
  const correspondencia = texto.match(
    /^\s*(\d{4,})\t(.+?)\tNome: Matrícula:\s*$/m
  )

  if (!correspondencia) {
    return { matricula: null, nome: null }
  }

  return {
    matricula: limpar(correspondencia[1]) || null,
    nome: limpar(correspondencia[2]) || null
  }
}

function extrairDadosCurso(texto: string): DadosCursoHistorico {
  const dados: DadosCursoHistorico = {
    codigo: null,
    nome: null,
    grau: null,
    modalidade: null,
    curriculo: null,
    turno: null,
    status: null,
    unidade: null,
    anoPeriodoInicial: null,
    prazoConclusao: null,
    formaIngresso: null,
    iraIndividual: null,
    iraGeral: null
  }

  if (!texto) return dados

  const linhaCurso = texto.match(/^(.+?)\tCurso:\s*$/m)?.[1]

  if (linhaCurso) {
    const partes = linhaCurso.split(/\s+-\s+/)

    dados.codigo = limpar(partes[0]) || null
    dados.nome = limpar(partes[1]) || null

    const ultimaParte = partes[partes.length - 1]
    const grau = ultimaParte?.split('/').pop()

    dados.grau = limpar(grau) || null
  }

  dados.modalidade =
    limpar(texto.match(/^Modalidade:\s*(.+)$/m)?.[1] ?? '') || null

  dados.grau =
    limpar(texto.match(/^Grau Acadêmico:\s*(.+)$/m)?.[1] ?? '') || dados.grau

  dados.curriculo =
    limpar(texto.match(/Currículo:\s*(\d{4}\.[12])/)?.[1] ?? '') || null

  dados.turno = limpar(texto.match(/^Turno:\s*(.+)$/m)?.[1] ?? '') || null

  dados.status = limpar(texto.match(/^Status:\s*(.+)$/m)?.[1] ?? '') || null

  dados.unidade =
    limpar(texto.match(/^Nome:\s*(.+?)\s+CNPJ:/m)?.[1] ?? '') || null

  const linhaIngresso = texto.match(/^.*Ano\/Período Inicial:.*$/m)?.[0]

  if (linhaIngresso) {
    const periodos = linhaIngresso.match(/\d{4}\.[12]/g) ?? []

    dados.anoPeriodoInicial = periodos[0] ?? null
    dados.prazoConclusao = periodos[periodos.length - 1] ?? null

    const partes = linhaIngresso.split('\t')
    const indiceRotulo = partes.findIndex((parte) => /Ano\/Período/.test(parte))
    const antesDoRotulo = partes
      .slice(0, indiceRotulo >= 0 ? indiceRotulo : partes.length)
      .join(' ')
      .replace(/\d{4}\.[12]/g, '')

    dados.formaIngresso = limpar(antesDoRotulo) || null
  }

  dados.iraIndividual = numero(
    texto.match(/IRA\s*-\s*Individual:\s*([\d.,]+)/i)?.[1]
  )

  dados.iraGeral = numero(texto.match(/IRA\s*-\s*Geral:\s*([\d.,]+)/i)?.[1])

  return dados
}

function definirSemestreAtual(
  disciplinas: DisciplinaHistorico[],
  emAndamento: DisciplinaHistorico[],
  semestreEncontrado: string | null
): string | null {
  const chave = (semestre: string) => {
    const [ano, periodo] = semestre.split('.')

    return Number(ano) * 10 + Number(periodo)
  }

  const ultimoSemestre = (lista: DisciplinaHistorico[]) =>
    lista
      .map(({ semestre }) => semestre)
      .filter((semestre): semestre is string => Boolean(semestre))
      .sort((a, b) => chave(b) - chave(a))[0] ?? null

  return (
    ultimoSemestre(emAndamento) ??
    ultimoSemestre(disciplinas) ??
    semestreEncontrado
  )
}

export function extrairHistoricoSIGAA(
  tabelas: TabelaPDF[],
  textoCompleto = ''
): ResultadoHistorico {
  const disciplinas: DisciplinaHistorico[] = []
  const pendencias: PendenciaCurricular[] = []
  const registrosNaoIdentificados: RegistroNaoIdentificado[] = []

  let semestreAtual: string | null = null

  for (const tabela of tabelas) {
    const tabelaDePendencias = ehCabecalhoPendencias(tabela.linhas)

    for (const linhaOriginal of tabela.linhas) {
      const linha = linhaOriginal.map(limpar)

      if (linha.every((celula) => !celula)) continue

      // O SIGAA pode colocar o semestre isolado em uma célula
      // diferente, dependendo da página e da tabela.
      const semestreNaLinha = linha.find(ehSemestre)

      if (semestreNaLinha) {
        semestreAtual = limpar(semestreNaLinha)
      }

      if (tabelaDePendencias) {
        const pendencia = extrairPendencia(linha, tabela.pagina)

        // Não inclui cabeçalhos nem linhas que não sejam disciplinas.
        if (pendencia && !/^componente curricular$/i.test(pendencia.nome)) {
          pendencias.push(pendencia)
        }

        continue
      }

      // Evita interpretar tabelas de créditos, totais e resumos
      // como disciplinas: exige código, nome e formato reconhecível.
      const disciplina = extrairDisciplina(
        linha,
        tabela.pagina,
        tabela.indice,
        semestreAtual
      )

      if (disciplina) {
        disciplinas.push(disciplina)
      } else if (
        linha.length === 7 ||
        linha.length === 9 ||
        linha.length === 3
      ) {
        const texto = linha.join(' ')

        // Só registra como não identificada se houver conteúdo
        // que possa indicar uma disciplina ou um registro relevante.
        if (
          REGEX_CODIGO_EM_TEXTO.test(texto) ||
          ehSemestre(linha[0]) ||
          ehSemestre(linha[2])
        ) {
          registrosNaoIdentificados.push({
            pagina: tabela.pagina,
            tabela: tabela.indice,
            linhaOriginal: linha,
            motivo:
              'Linha semelhante a registro acadêmico, mas não reconhecida pelo parser.'
          })
        }
      }
    }
  }

  const cursadas = disciplinas.filter(
    (disciplina) => disciplina.categoria === 'cursada'
  )

  const emAndamento = disciplinas.filter(
    (disciplina) => disciplina.categoria === 'em_andamento'
  )

  const aprovadas = cursadas.filter((disciplina) =>
    normalizarStatus(disciplina.situacao ?? '').includes('APROVADO')
  )

  const reprovadas = cursadas.filter((disciplina) =>
    normalizarStatus(disciplina.situacao ?? '').includes('REPROVADO')
  )

  const notasValidas = aprovadas
    .map((disciplina) => disciplina.nota)
    .filter((nota): nota is number => nota !== null)

  const carga = (lista: DisciplinaHistorico[]) =>
    lista.reduce(
      (total, disciplina) => total + (disciplina.cargaHoraria ?? 0),
      0
    )

  const pendenciasNaoMatriculadas = pendencias.filter(
    (pendencia) => !pendencia.matriculado
  )

  return {
    disciplinas,
    cursadas,
    emAndamento,
    pendencias,
    integralizacao: extrairIntegralizacao(tabelas),
    cargaHoraria: extrairCargaHoraria(tabelas),
    dadosAluno: extrairDadosAluno(textoCompleto),
    dadosCurso: extrairDadosCurso(textoCompleto),
    semestreAtual: definirSemestreAtual(
      disciplinas,
      emAndamento,
      semestreAtual
    ),
    resumo: {
      totalDisciplinas: disciplinas.length,
      totalCursadas: cursadas.length,
      totalEmAndamento: emAndamento.length,
      totalPendencias: pendenciasNaoMatriculadas.length,
      totalAprovadas: aprovadas.length,
      totalReprovadas: reprovadas.length,
      cargaHorariaCursada: carga(cursadas),
      cargaHorariaEmAndamento: carga(emAndamento),
      cargaHorariaPendente: pendenciasNaoMatriculadas.reduce(
        (total, pendencia) => total + (pendencia.cargaHoraria ?? 0),
        0
      ),
      mediaNotas:
        notasValidas.length > 0
          ? Number(
              (
                notasValidas.reduce((total, nota) => total + nota, 0) /
                notasValidas.length
              ).toFixed(2)
            )
          : null
    },
    registrosNaoIdentificados,
    tabelasOriginais: tabelas
  }
}
