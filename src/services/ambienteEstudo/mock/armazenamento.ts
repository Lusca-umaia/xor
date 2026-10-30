import {
  AmbienteEstudo,
  Atividade,
  Chat,
  Material,
  MensagemChat,
  ReporteConteudoIA,
  Resumo,
  Simulado,
  TentativaAtividade,
  TentativaSimulado
} from '@/@types/AmbienteEstudo'

const CHAVE = 'xor:ambienteEstudo:v1'
const VERSAO = 1

export interface BancoAmbienteEstudo {
  versao: number
  semeado: boolean
  /** Aluno dono destes dados (id do Supabase). */
  donoId: string | null
  ambientes: AmbienteEstudo[]
  materiais: Material[]
  chats: Chat[]
  mensagens: MensagemChat[]
  resumos: Resumo[]
  atividades: Atividade[]
  tentativasAtividade: TentativaAtividade[]
  simulados: Simulado[]
  tentativasSimulado: TentativaSimulado[]
  reportes: ReporteConteudoIA[]
  /** Miniaturas pequenas (dataURL) de imagens, por materialId. */
  miniaturas: Record<string, string>
}

export class ErroArmazenamentoCheio extends Error {
  constructor() {
    super(
      'O armazenamento do navegador está cheio. Exclua materiais ou restaure os dados de demonstração.'
    )
  }
}

const bancoVazio = (): BancoAmbienteEstudo => ({
  versao: VERSAO,
  semeado: false,
  donoId: null,
  ambientes: [],
  materiais: [],
  chats: [],
  mensagens: [],
  resumos: [],
  atividades: [],
  tentativasAtividade: [],
  simulados: [],
  tentativasSimulado: [],
  reportes: [],
  miniaturas: {}
})

// Cópia em memória: evita reler e reparsear o localStorage a cada operação e
// mantém o app funcionando quando o localStorage está bloqueado.
let cache: BancoAmbienteEstudo | null = null

export function lerBanco(): BancoAmbienteEstudo {
  if (cache) return cache

  try {
    const bruto = window.localStorage.getItem(CHAVE)
    const salvo = bruto ? (JSON.parse(bruto) as BancoAmbienteEstudo) : null
    cache =
      salvo && salvo.versao === VERSAO
        ? { ...bancoVazio(), ...salvo }
        : bancoVazio()
  } catch {
    cache = bancoVazio()
  }

  return cache
}

function persistir(banco: BancoAmbienteEstudo) {
  try {
    window.localStorage.setItem(CHAVE, JSON.stringify(banco))
  } catch (erro) {
    if (erro instanceof DOMException && erro.name === 'QuotaExceededError') {
      throw new ErroArmazenamentoCheio()
    }
    // Armazenamento bloqueado (ex.: modo anônimo restrito): segue só em memória.
  }
}

/** Aplica uma alteração ao banco e persiste. Retorna o valor do alterador. */
export function alterarBanco<T>(alterador: (banco: BancoAmbienteEstudo) => T) {
  const banco = lerBanco()
  const resultado = alterador(banco)
  persistir(banco)
  return resultado
}

export function limparBanco() {
  cache = bancoVazio()
  persistir(cache)
}

export const agora = () => new Date().toISOString()

export const gerarId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`

/** Cópia profunda para que as telas nunca alterem o banco por referência. */
export const clonar = <T>(valor: T): T => structuredClone(valor)
