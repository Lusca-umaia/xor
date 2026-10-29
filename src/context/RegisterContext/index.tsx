'use client'

import { Disciplina } from '@/@types/Grade'
import { Curso } from '@/@types/Curso'

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState
} from 'react'

import { CadastroAluno } from '@/@types/aluno'
import { CadeiraHistorico } from '@/@types/Historico'
import { ResultadoHistorico } from '@/utils/extrairHistoricoSigaa'
import {
  calcularSemestreAtual,
  criarCadeirasHistorico,
  criarPendenciasHistorico,
  encontrarCurso
} from '@/utils/historicoAcademico'
import { cursosMock } from '@/utils/mockData'

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
  CADEIRAS_REALIZADAS: Record<
    string,
    {
      id: number
      nota: number | null
    }
  >
  CADEIRAS_ATIVAS: Record<string, number>
  handleChangeCadeiraAtiva: (cadeiraId: number) => void
  handleChangeCadeiraRealizada: (cadeiraId: number) => void
  optativas: Disciplina[]
  obrigatorias: Partial<Record<number, Disciplina[]>>
  optativasInativas: Disciplina[]
  obrigatoriasInativas: Partial<Record<number, Disciplina[]>>
  historico: ResultadoHistorico | null
  curso: Curso | null
  importarHistorico: (resultado: ResultadoHistorico) => void
  limparHistorico: () => void
  cadeirasHistorico: CadeiraHistorico[]
  cadeirasPendentes: CadeiraHistorico[]
}

const initialFormData: Register['formData'] = {
  email: '',
  matricula: '',
  semestreAtual: null,
  senha: '',
  nome: '',
  cursoNome: '',
  cursoId: null,
  gradeId: null,
  cadeirasAtivas: [],
  cadeirasRealizadas: []
}

const RegisterContext = createContext<Register | null>(null)

function montarCadeirasDoHistorico(
  resultado: ResultadoHistorico,
  curso: Curso | null
) {
  const cadeiras = criarCadeirasHistorico(resultado, curso)
  const realizadasPorId = new Map<number, number | null>()
  const ativas = new Set<number>()

  for (const cadeira of cadeiras) {
    if (cadeira.id <= 0) continue

    if (cadeira.status === 'CONCLUIDA' || cadeira.status === 'REPROVADA') {
      const notaAtual = realizadasPorId.get(cadeira.id)

      if (notaAtual === undefined || (cadeira.nota ?? -1) > (notaAtual ?? -1)) {
        realizadasPorId.set(cadeira.id, cadeira.nota)
      }
    }

    if (cadeira.status === 'ANDAMENTO') {
      ativas.add(cadeira.id)
    }
  }

  return {
    cadeirasRealizadas: [...realizadasPorId].map(([id, nota]) => ({
      id,
      nota
    })),
    cadeirasAtivas: [...ativas]
  }
}

export const RegisterProvider = ({ children }: { children: ReactNode }) => {
  const [formData, setFormData] = useState<CadastroAluno>(initialFormData)
  const [historico, setHistorico] = useState<ResultadoHistorico | null>(null)
  const [notasAjustadas, setNotasAjustadas] = useState<
    Record<number, number | null>
  >({})

  const handleChangeFormData = useCallback(
    (value: string | number | null, path: keyof Register['formData']) => {
      if (path === 'cursoNome' && historico) {
        setNotasAjustadas({})
      }

      setFormData((prevFormData) => {
        const proximoFormData = { ...prevFormData, [path]: value }

        if ((path === 'cursoId' || path === 'cursoNome') && historico) {
          const cursoSelecionado =
            path === 'cursoId'
              ? (cursosMock.find(({ id }) => id === value) ?? null)
              : encontrarCurso(cursosMock, String(value ?? ''))

          const { cadeirasRealizadas, cadeirasAtivas } =
            montarCadeirasDoHistorico(historico, cursoSelecionado)

          proximoFormData.cursoId = cursoSelecionado?.id ?? null
          proximoFormData.cadeirasRealizadas = cadeirasRealizadas
          proximoFormData.cadeirasAtivas = cadeirasAtivas
        }

        return proximoFormData
      })
    },
    [historico]
  )

  const curso = useMemo(
    () => cursosMock.find(({ id }) => id === formData.cursoId) ?? null,
    [formData.cursoId]
  )

  const disciplinas = curso?.disciplinas

  const CADEIRAS_REALIZADAS = useMemo(() => {
    return formData.cadeirasRealizadas.reduce<
      Record<string, Register['formData']['cadeirasRealizadas'][number]>
    >((acc, cur) => {
      acc[cur.id.toString()] = cur
      return acc
    }, {})
  }, [formData.cadeirasRealizadas])

  const CADEIRAS_ATIVAS = useMemo(() => {
    return formData.cadeirasAtivas.reduce<
      Record<string, Register['formData']['cadeirasAtivas'][number]>
    >((acc, cur) => {
      acc[cur.toString()] = cur
      return acc
    }, {})
  }, [formData.cadeirasAtivas])

  const handleAddCadeiraRealizada = useCallback((cadeiraId: number) => {
    setFormData(({ cadeirasRealizadas, ...prevFormData }) => ({
      ...prevFormData,
      cadeirasRealizadas: [...cadeirasRealizadas, { id: cadeiraId, nota: 7 }]
    }))
  }, [])

  const handleRemoveCadeiraRealizada = useCallback((cadeiraId: number) => {
    setFormData(({ cadeirasRealizadas, ...prevFormData }) => ({
      ...prevFormData,
      cadeirasRealizadas: cadeirasRealizadas.filter(
        ({ id }) => id !== cadeiraId
      )
    }))
  }, [])

  const handleAddCadeiraAtiva = useCallback((cadeiraId: number) => {
    setFormData(({ cadeirasAtivas, ...prevFormData }) => ({
      ...prevFormData,
      cadeirasAtivas: [...cadeirasAtivas, cadeiraId]
    }))
  }, [])

  const handleRemoveCadeiraAtiva = useCallback((cadeiraId: number) => {
    setFormData(({ cadeirasAtivas, ...prevFormData }) => ({
      ...prevFormData,
      cadeirasAtivas: cadeirasAtivas.filter((id) => id !== cadeiraId)
    }))
  }, [])

  const handleChangeNotaCadeiraRealizada = useCallback(
    (cadeiraId: number, notaAtualizada: number) => {
      const nota = notaAtualizada
        ? Math.min(Math.max(notaAtualizada, 0), 10)
        : null

      setNotasAjustadas((prevNotas) => ({
        ...prevNotas,
        [cadeiraId]: nota
      }))

      setFormData(({ cadeirasRealizadas, ...prevFormData }) => ({
        ...prevFormData,
        cadeirasRealizadas: cadeirasRealizadas.map((cadeira) =>
          cadeira.id === cadeiraId ? { ...cadeira, nota } : cadeira
        )
      }))
    },
    []
  )

  const handleChangeCadeiraRealizada = (cadeiraId: number) => {
    if (CADEIRAS_REALIZADAS[cadeiraId.toString()]) {
      return handleRemoveCadeiraRealizada(cadeiraId)
    }
    handleAddCadeiraRealizada(cadeiraId)
  }

  const handleChangeCadeiraAtiva = (cadeiraId: number) => {
    if (CADEIRAS_ATIVAS[cadeiraId.toString()]) {
      return handleRemoveCadeiraAtiva(cadeiraId)
    }
    handleAddCadeiraAtiva(cadeiraId)
  }

  const optativas =
    disciplinas?.filter(({ carater }) => carater === 'OPTATIVA') ?? []

  const obrigatorias =
    Object.groupBy(
      disciplinas?.filter(({ carater }) => carater === 'OBRIGATORIA') ?? [],
      ({ semestre }) => semestre
    ) ?? []

  const obrigatoriasInativas =
    Object.groupBy(
      disciplinas?.filter(
        ({ carater, id }) =>
          carater === 'OBRIGATORIA' && !CADEIRAS_REALIZADAS[id.toString()]
      ) ?? [],
      ({ semestre }) => semestre
    ) ?? []

  const optativasInativas = optativas.filter(
    ({ id }) => !CADEIRAS_REALIZADAS[id.toString()]
  )

  const cadeirasHistorico = useMemo(() => {
    if (!historico) return []

    return criarCadeirasHistorico(historico, curso).map((cadeira) =>
      notasAjustadas[cadeira.id] !== undefined
        ? { ...cadeira, nota: notasAjustadas[cadeira.id] }
        : cadeira
    )
  }, [historico, curso, notasAjustadas])

  const cadeirasPendentes = useMemo(
    () => (historico ? criarPendenciasHistorico(historico) : []),
    [historico]
  )

  const importarHistorico = useCallback((resultado: ResultadoHistorico) => {
    const cursoEncontrado = encontrarCurso(
      cursosMock,
      resultado.dadosCurso.nome
    )

    const semestreAtual = calcularSemestreAtual(
      resultado.dadosCurso.anoPeriodoInicial,
      resultado.semestreAtual
    )

    const { cadeirasRealizadas, cadeirasAtivas } = montarCadeirasDoHistorico(
      resultado,
      cursoEncontrado
    )

    setHistorico(resultado)
    setNotasAjustadas({})
    setFormData((prevFormData) => ({
      ...prevFormData,
      cursoNome:
        resultado.dadosCurso.nome ??
        cursoEncontrado?.nome ??
        prevFormData.cursoNome,
      cursoId: cursoEncontrado?.id ?? prevFormData.cursoId,
      matricula: resultado.dadosAluno.matricula ?? prevFormData.matricula,
      semestreAtual: semestreAtual ?? prevFormData.semestreAtual,
      cadeirasRealizadas,
      cadeirasAtivas
    }))
  }, [])

  const limparHistorico = useCallback(() => {
    setHistorico(null)
    setNotasAjustadas({})
    setFormData((prevFormData) => ({
      ...prevFormData,
      cursoNome: '',
      cursoId: null,
      semestreAtual: null,
      matricula: '',
      cadeirasRealizadas: [],
      cadeirasAtivas: []
    }))
  }, [])

  return (
    <RegisterContext.Provider
      value={{
        formData,
        handleChangeFormData,
        handleChangeNotaCadeiraRealizada,
        handleChangeCadeiraRealizada,
        CADEIRAS_REALIZADAS,
        CADEIRAS_ATIVAS,
        handleChangeCadeiraAtiva,
        obrigatorias,
        optativas,
        optativasInativas,
        obrigatoriasInativas,
        historico,
        curso,
        importarHistorico,
        limparHistorico,
        cadeirasHistorico,
        cadeirasPendentes
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
