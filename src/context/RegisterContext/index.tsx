'use client'

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState
} from 'react'

import {
  CadastroAluno,
  CursadaManual,
  DisciplinaManual,
  SemestreManual
} from '@/@types/aluno'
import { CadeiraHistorico, StatusCadeira } from '@/@types/Historico'
import type { CadastroInput } from '@/lib/api/schemas'
import { ResultadoHistorico } from '@/utils/extrairHistoricoSigaa'
import {
  calcularSemestreAtual,
  criarCadeirasHistorico,
  criarPendenciasHistorico,
  normalizarCodigo,
  normalizarTexto
} from '@/utils/historicoAcademico'

export interface Register {
  formData: CadastroAluno
  handleChangeFormData: (
    value: string | number | null,
    path: keyof Register['formData']
  ) => void
  handleChangeNotaCadeiraRealizada: (
    cadeiraId: number,
    notaAtualizada: number
  ) => void
  historico: ResultadoHistorico | null
  importarHistorico: (resultado: ResultadoHistorico) => void
  limparHistorico: () => void
  cadeirasHistorico: CadeiraHistorico[]
  cadeirasPendentes: CadeiraHistorico[]
  // Remove do cadastro a disciplina (com todas as tentativas) lida do histórico.
  removerDisciplinaHistorico: (cadeira: CadeiraHistorico) => void
  restaurarDisciplinasHistorico: () => void
  totalRemovidasHistorico: number
  // Cadastro manual: catálogo de disciplinas + semestres já cursados.
  adicionarDisciplinaManual: (
    disciplina: DadosDisciplina,
    emAndamento?: boolean
  ) => string | null
  alternarAndamento: (codigo: string) => void
  removerDisciplinaManual: (codigo: string) => void
  adicionarSemestreManual: () => void
  atualizarPeriodoSemestre: (semestreId: string, periodo: string) => void
  removerSemestreManual: (semestreId: string) => void
  adicionarCursada: (
    semestreId: string,
    disciplina: DadosDisciplina,
    resultado: Omit<CursadaManual, 'codigo'>
  ) => string | null
  atualizarNotaCursada: (
    semestreId: string,
    codigo: string,
    nota: number | null
  ) => void
  removerCursada: (semestreId: string, codigo: string) => void
  // Disciplinas manuais com alguma aprovação em semestres cursados.
  codigosAprovadosManual: Set<string>
  montarCadastro: () => CadastroInput
}

const initialFormData: Register['formData'] = {
  email: '',
  matricula: '',
  semestreAtual: null,
  senha: '',
  nome: '',
  cursoNome: '',
  cursoCodigo: null,
  cargaOptativaExigida: null,
  disciplinasManuais: [],
  semestresManuais: []
}

export type DadosDisciplina = Omit<DisciplinaManual, 'emAndamento'>

const RegisterContext = createContext<Register | null>(null)

type TentativaCadastro = CadastroInput['tentativas'][number]

const STATUS_TENTATIVA: Partial<
  Record<StatusCadeira, TentativaCadastro['status']>
> = {
  CONCLUIDA: 'APROVADA',
  REPROVADA: 'REPROVADA',
  ANDAMENTO: 'ANDAMENTO'
}

// Disciplinas sem código no histórico ganham um código derivado do nome
// para continuarem identificáveis.
function codigoDaCadeira({ codigo, nome }: CadeiraHistorico) {
  const normalizado = normalizarCodigo(codigo === '---' ? null : codigo)
  return normalizado || `SC-${normalizarCodigo(nome).slice(0, 30)}`
}

function statusTentativaHistorico(
  cadeira: CadeiraHistorico
): TentativaCadastro['status'] | null {
  const status = STATUS_TENTATIVA[cadeira.status]
  if (status) return status

  const situacao = normalizarTexto(cadeira.situacao ?? '')
  if (situacao.includes('trancad') || situacao.includes('cancelad')) {
    return 'TRANCADA'
  }
  return null
}

function cadastroDoHistorico(
  historico: ResultadoHistorico,
  cadeiras: CadeiraHistorico[],
  pendentes: CadeiraHistorico[]
): Pick<CadastroInput, 'disciplinas' | 'tentativas'> {
  const disciplinas = new Map<string, CadastroInput['disciplinas'][number]>()
  const tentativas: TentativaCadastro[] = []

  for (const cadeira of [...cadeiras, ...pendentes]) {
    const codigo = codigoDaCadeira(cadeira)

    if (!disciplinas.has(codigo)) {
      disciplinas.set(codigo, {
        codigo,
        nome: cadeira.nome,
        cargaHoraria: cadeira.cargaHoraria,
        carater: cadeira.carater,
        semestre: null
      })
    }

    const status = statusTentativaHistorico(cadeira)
    if (!status) continue

    // O histórico pode repetir a mesma aprovação (ex.: aproveitamento):
    // mantém só uma aprovação e um andamento por disciplina.
    const repetida =
      (status === 'APROVADA' || status === 'ANDAMENTO') &&
      tentativas.some((t) => t.codigo === codigo && t.status === status)
    if (repetida) continue

    tentativas.push({
      codigo,
      status,
      nota:
        status === 'APROVADA' || status === 'REPROVADA' ? cadeira.nota : null,
      periodo: cadeira.periodo,
      semestre: calcularSemestreAtual(
        historico.dadosCurso.anoPeriodoInicial,
        cadeira.periodo
      )
    })
  }

  return { disciplinas: [...disciplinas.values()], tentativas }
}

function cadastroManual(
  disciplinasManuais: DisciplinaManual[],
  semestresManuais: SemestreManual[],
  semestreAtual: number
): Pick<CadastroInput, 'disciplinas' | 'tentativas'> {
  const cursadas = semestresManuais.flatMap((semestre, indice) =>
    semestre.cursadas.map(
      ({ codigo, status, nota }): TentativaCadastro => ({
        codigo,
        status,
        nota: status === 'TRANCADA' ? null : nota,
        periodo: semestre.periodo.trim() || null,
        semestre: indice + 1
      })
    )
  )

  const andamento = disciplinasManuais
    .filter(({ emAndamento }) => emAndamento)
    .map(
      ({ codigo }): TentativaCadastro => ({
        codigo,
        status: 'ANDAMENTO',
        nota: null,
        periodo: null,
        semestre: semestreAtual
      })
    )

  return {
    disciplinas: disciplinasManuais.map(
      ({ codigo, nome, cargaHoraria, carater }) => ({
        codigo,
        nome,
        cargaHoraria,
        carater,
        semestre: null
      })
    ),
    tentativas: [...cursadas, ...andamento]
  }
}

export const RegisterProvider = ({ children }: { children: ReactNode }) => {
  const [formData, setFormData] = useState<CadastroAluno>(initialFormData)
  const [historico, setHistorico] = useState<ResultadoHistorico | null>(null)
  const [notasAjustadas, setNotasAjustadas] = useState<
    Record<number, number | null>
  >({})
  const [removidasHistorico, setRemovidasHistorico] = useState<Set<string>>(
    new Set()
  )

  const handleChangeFormData = useCallback(
    (value: string | number | null, path: keyof Register['formData']) => {
      setFormData((prevFormData) => ({ ...prevFormData, [path]: value }))
    },
    []
  )

  const handleChangeNotaCadeiraRealizada = useCallback(
    (cadeiraId: number, notaAtualizada: number) => {
      const nota = Number.isNaN(notaAtualizada)
        ? null
        : Math.min(Math.max(notaAtualizada, 0), 10)

      setNotasAjustadas((prevNotas) => ({
        ...prevNotas,
        [cadeiraId]: nota
      }))
    },
    []
  )

  const cadeirasHistorico = useMemo(() => {
    if (!historico) return []

    return criarCadeirasHistorico(historico, null)
      .filter((cadeira) => !removidasHistorico.has(codigoDaCadeira(cadeira)))
      .map((cadeira) =>
        notasAjustadas[cadeira.id] !== undefined
          ? { ...cadeira, nota: notasAjustadas[cadeira.id] }
          : cadeira
      )
  }, [historico, notasAjustadas, removidasHistorico])

  const cadeirasPendentes = useMemo(
    () =>
      historico
        ? criarPendenciasHistorico(historico).filter(
            (cadeira) => !removidasHistorico.has(codigoDaCadeira(cadeira))
          )
        : [],
    [historico, removidasHistorico]
  )

  const removerDisciplinaHistorico = useCallback(
    (cadeira: CadeiraHistorico) => {
      setRemovidasHistorico((prev) =>
        new Set(prev).add(codigoDaCadeira(cadeira))
      )
    },
    []
  )

  const restaurarDisciplinasHistorico = useCallback(() => {
    setRemovidasHistorico(new Set())
  }, [])

  const importarHistorico = useCallback((resultado: ResultadoHistorico) => {
    const semestreAtual = calcularSemestreAtual(
      resultado.dadosCurso.anoPeriodoInicial,
      resultado.semestreAtual
    )

    setHistorico(resultado)
    setNotasAjustadas({})
    setRemovidasHistorico(new Set())
    setFormData((prevFormData) => ({
      ...prevFormData,
      cursoNome: resultado.dadosCurso.nome ?? prevFormData.cursoNome,
      cursoCodigo: resultado.dadosCurso.codigo,
      matricula: resultado.dadosAluno.matricula ?? prevFormData.matricula,
      semestreAtual: semestreAtual ?? prevFormData.semestreAtual,
      cargaOptativaExigida: resultado.cargaHoraria.optativa?.exigido ?? null
    }))
  }, [])

  const limparHistorico = useCallback(() => {
    setHistorico(null)
    setNotasAjustadas({})
    setRemovidasHistorico(new Set())
    setFormData((prevFormData) => ({
      ...prevFormData,
      cursoNome: '',
      cursoCodigo: null,
      semestreAtual: null,
      matricula: '',
      cargaOptativaExigida: null
    }))
  }, [])

  const codigosAprovadosManual = useMemo(
    () =>
      new Set(
        formData.semestresManuais.flatMap(({ cursadas }) =>
          cursadas
            .filter(({ status }) => status === 'APROVADA')
            .map(({ codigo }) => codigo)
        )
      ),
    [formData.semestresManuais]
  )

  const adicionarDisciplinaManual = useCallback(
    (disciplina: DadosDisciplina, emAndamento = false) => {
      const codigo = normalizarCodigo(disciplina.codigo)

      if (!codigo) return 'Informe um código válido'
      if (formData.disciplinasManuais.some((d) => d.codigo === codigo)) {
        return 'Já existe uma disciplina com este código'
      }

      setFormData((prevFormData) => ({
        ...prevFormData,
        disciplinasManuais: [
          ...prevFormData.disciplinasManuais,
          { ...disciplina, codigo, emAndamento }
        ]
      }))
      return null
    },
    [formData.disciplinasManuais]
  )

  const alternarAndamento = useCallback((codigo: string) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      disciplinasManuais: prevFormData.disciplinasManuais.map((d) =>
        d.codigo === codigo ? { ...d, emAndamento: !d.emAndamento } : d
      )
    }))
  }, [])

  const removerDisciplinaManual = useCallback((codigo: string) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      disciplinasManuais: prevFormData.disciplinasManuais.filter(
        (d) => d.codigo !== codigo
      ),
      semestresManuais: prevFormData.semestresManuais.map((semestre) => ({
        ...semestre,
        cursadas: semestre.cursadas.filter((c) => c.codigo !== codigo)
      }))
    }))
  }, [])

  const adicionarSemestreManual = useCallback(() => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      semestresManuais: [
        ...prevFormData.semestresManuais,
        { id: crypto.randomUUID(), periodo: '', cursadas: [] }
      ]
    }))
  }, [])

  const atualizarSemestre = useCallback(
    (
      semestreId: string,
      alterar: (semestre: SemestreManual) => SemestreManual
    ) => {
      setFormData((prevFormData) => ({
        ...prevFormData,
        semestresManuais: prevFormData.semestresManuais.map((semestre) =>
          semestre.id === semestreId ? alterar(semestre) : semestre
        )
      }))
    },
    []
  )

  const atualizarPeriodoSemestre = useCallback(
    (semestreId: string, periodo: string) =>
      atualizarSemestre(semestreId, (semestre) => ({ ...semestre, periodo })),
    [atualizarSemestre]
  )

  // As disciplinas do semestre removido continuam no catálogo (pendentes).
  const removerSemestreManual = useCallback((semestreId: string) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      semestresManuais: prevFormData.semestresManuais.filter(
        ({ id }) => id !== semestreId
      )
    }))
  }, [])

  const adicionarCursada = useCallback(
    (
      semestreId: string,
      disciplina: DadosDisciplina,
      { status, nota }: Omit<CursadaManual, 'codigo'>
    ) => {
      const codigo = normalizarCodigo(disciplina.codigo)
      if (!codigo) return 'Informe um código válido'

      const semestre = formData.semestresManuais.find(
        ({ id }) => id === semestreId
      )
      if (semestre?.cursadas.some((c) => c.codigo === codigo)) {
        return 'Essa disciplina já está neste semestre'
      }
      if (status === 'APROVADA' && codigosAprovadosManual.has(codigo)) {
        return 'Essa disciplina já foi aprovada em outro semestre'
      }

      // Mesma disciplina em outro semestre (ex.: reprovou e refez)
      // reaproveita os dados já cadastrados.
      const existente = formData.disciplinasManuais.some(
        (d) => d.codigo === codigo
      )

      setFormData((prevFormData) => ({
        ...prevFormData,
        disciplinasManuais: existente
          ? prevFormData.disciplinasManuais.map((d) =>
              d.codigo === codigo && status === 'APROVADA'
                ? { ...d, emAndamento: false }
                : d
            )
          : [
              ...prevFormData.disciplinasManuais,
              { ...disciplina, codigo, emAndamento: false }
            ],
        semestresManuais: prevFormData.semestresManuais.map((s) =>
          s.id === semestreId
            ? { ...s, cursadas: [...s.cursadas, { codigo, status, nota }] }
            : s
        )
      }))
      return null
    },
    [
      formData.semestresManuais,
      formData.disciplinasManuais,
      codigosAprovadosManual
    ]
  )

  const atualizarNotaCursada = useCallback(
    (semestreId: string, codigo: string, nota: number | null) =>
      atualizarSemestre(semestreId, (semestre) => ({
        ...semestre,
        cursadas: semestre.cursadas.map((c) =>
          c.codigo === codigo ? { ...c, nota } : c
        )
      })),
    [atualizarSemestre]
  )

  // A disciplina continua no catálogo; sem outras cursadas, vira pendente.
  const removerCursada = useCallback(
    (semestreId: string, codigo: string) =>
      atualizarSemestre(semestreId, (semestre) => ({
        ...semestre,
        cursadas: semestre.cursadas.filter((c) => c.codigo !== codigo)
      })),
    [atualizarSemestre]
  )

  const montarCadastro = useCallback((): CadastroInput => {
    const semestreAtual =
      formData.semestreAtual ?? formData.semestresManuais.length + 1
    const manual = cadastroManual(
      formData.disciplinasManuais,
      formData.semestresManuais,
      semestreAtual
    )
    let academico = manual

    // Com histórico, as disciplinas manuais complementam o que veio do PDF.
    if (historico) {
      const doHistorico = cadastroDoHistorico(
        historico,
        cadeirasHistorico,
        cadeirasPendentes
      )
      const codigos = new Set(doHistorico.disciplinas.map((d) => d.codigo))

      academico = {
        disciplinas: [
          ...doHistorico.disciplinas,
          ...manual.disciplinas.filter((d) => !codigos.has(d.codigo))
        ],
        tentativas: [
          ...doHistorico.tentativas,
          ...manual.tentativas.filter((t) => !codigos.has(t.codigo))
        ]
      }
    }

    return {
      nome: formData.nome,
      email: formData.email,
      senha: formData.senha,
      matricula: formData.matricula,
      cursoNome: formData.cursoNome,
      cursoCodigo: formData.cursoCodigo,
      semestreAtual,
      cargaOptativaExigida: formData.cargaOptativaExigida,
      ...academico
    }
  }, [formData, historico, cadeirasHistorico, cadeirasPendentes])

  return (
    <RegisterContext.Provider
      value={{
        formData,
        handleChangeFormData,
        handleChangeNotaCadeiraRealizada,
        historico,
        importarHistorico,
        limparHistorico,
        cadeirasHistorico,
        cadeirasPendentes,
        removerDisciplinaHistorico,
        restaurarDisciplinasHistorico,
        totalRemovidasHistorico: removidasHistorico.size,
        adicionarDisciplinaManual,
        alternarAndamento,
        removerDisciplinaManual,
        adicionarSemestreManual,
        atualizarPeriodoSemestre,
        removerSemestreManual,
        adicionarCursada,
        atualizarNotaCursada,
        removerCursada,
        codigosAprovadosManual,
        montarCadastro
      }}
    >
      {children}
    </RegisterContext.Provider>
  )
}

export const useRegisterContext = () => {
  const context = useContext(RegisterContext)
  if (!context) {
    throw new Error('useRegisterContext must be used within a RegisterProvider')
  }
  return context
}
