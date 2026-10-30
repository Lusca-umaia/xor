import { Material, TipoMaterial } from '@/@types/AmbienteEstudo'
import { exigir } from './erros'
import {
  agora,
  alterarBanco,
  clonar,
  gerarId,
  lerBanco
} from './mock/armazenamento'
import { agendar } from './mock/atraso'
import { preparar, tocarAmbiente } from './mock/preparar'

export const EXTENSOES_ACEITAS =
  '.pdf,.docx,.pptx,.png,.jpg,.jpeg,.webp,.txt,.md'
export const TAMANHO_MAXIMO_BYTES = 25 * 1024 * 1024
const LIMITE_TEXTO = 20_000

const TIPO_POR_EXTENSAO: Record<string, TipoMaterial> = {
  pdf: 'PDF',
  docx: 'DOCX',
  pptx: 'PPTX',
  png: 'IMAGEM',
  jpg: 'IMAGEM',
  jpeg: 'IMAGEM',
  webp: 'IMAGEM',
  txt: 'TEXTO',
  md: 'TEXTO'
}

// Pré-visualizações valem só durante a sessão: o mock não guarda binários.
const previewsSessao = new Map<string, string>()

export function obterPreviewSessao(materialId: string) {
  return previewsSessao.get(materialId) ?? null
}

export function obterMiniatura(materialId: string) {
  return lerBanco().miniaturas[materialId] ?? null
}

function tipoDoArquivo(nome: string): TipoMaterial | null {
  const extensao = nome.split('.').pop()?.toLowerCase() ?? ''
  return TIPO_POR_EXTENSAO[extensao] ?? null
}

/** No mock, estima o número de páginas pelo tamanho do arquivo. */
function estimarPaginas(tipo: TipoMaterial, bytes: number) {
  const bytesPorPagina: Partial<Record<TipoMaterial, number>> = {
    PDF: 80_000,
    DOCX: 40_000,
    PPTX: 100_000
  }
  const divisor = bytesPorPagina[tipo]
  return divisor
    ? Math.min(400, Math.max(1, Math.round(bytes / divisor)))
    : null
}

async function criarMiniatura(arquivo: File): Promise<string | null> {
  try {
    const imagem = await createImageBitmap(arquivo)
    const escala = Math.min(1, 320 / Math.max(imagem.width, imagem.height))
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(imagem.width * escala)
    canvas.height = Math.round(imagem.height * escala)
    canvas
      .getContext('2d')
      ?.drawImage(imagem, 0, 0, canvas.width, canvas.height)
    const dataUrl = canvas.toDataURL('image/jpeg', 0.7)
    return dataUrl.length < 150_000 ? dataUrl : null
  } catch {
    return null
  }
}

/** Simula o processamento no servidor: ENVIANDO → PROCESSANDO → PRONTO. */
function simularProcessamento(materialId: string, atrasoMs: number) {
  const mudarStatus = (status: Material['status']) =>
    alterarBanco((banco) => {
      const material = banco.materiais.find(({ id }) => id === materialId)
      if (material && material.status !== 'ERRO') material.status = status
    })

  agendar(atrasoMs, () => mudarStatus('PROCESSANDO'))
  agendar(atrasoMs + 1500 + Math.random() * 1500, () => mudarStatus('PRONTO'))
}

export async function listarMateriais(ambienteId: string): Promise<Material[]> {
  await preparar(150, 400)
  return clonar(
    lerBanco()
      .materiais.filter((material) => material.ambienteId === ambienteId)
      .sort((a, b) => b.criadoEm.localeCompare(a.criadoEm))
  )
}

export async function enviarMaterial(
  ambienteId: string,
  arquivo: File,
  origem: Material['origem'] = 'UPLOAD'
): Promise<Material> {
  await preparar(200, 500)

  const tipo = tipoDoArquivo(arquivo.name)
  const mensagemErro = !tipo
    ? 'Formato não suportado. Envie PDF, DOCX, PPTX, imagem ou texto.'
    : arquivo.size > TAMANHO_MAXIMO_BYTES
      ? 'Arquivo maior que 25 MB.'
      : null

  const material: Material = {
    id: gerarId(),
    ambienteId,
    nome: arquivo.name,
    tipo: tipo ?? 'PDF',
    tamanhoBytes: arquivo.size,
    paginas: tipo ? estimarPaginas(tipo, arquivo.size) : null,
    status: mensagemErro ? 'ERRO' : 'ENVIANDO',
    mensagemErro,
    origem,
    conteudoTexto:
      tipo === 'TEXTO' && !mensagemErro
        ? (await arquivo.text()).slice(0, LIMITE_TEXTO)
        : null,
    criadoEm: agora()
  }

  const miniatura =
    tipo === 'IMAGEM' && !mensagemErro ? await criarMiniatura(arquivo) : null
  if (!mensagemErro && (tipo === 'IMAGEM' || tipo === 'PDF')) {
    previewsSessao.set(material.id, URL.createObjectURL(arquivo))
  }

  alterarBanco((banco) => {
    banco.materiais.push(material)
    if (miniatura) banco.miniaturas[material.id] = miniatura
    tocarAmbiente(banco, ambienteId)
  })
  if (!mensagemErro) simularProcessamento(material.id, 600)

  return clonar(material)
}

export async function criarMaterialTexto(
  ambienteId: string,
  dados: { nome: string; texto: string }
): Promise<Material> {
  await preparar(200, 400)
  const material: Material = {
    id: gerarId(),
    ambienteId,
    nome: dados.nome.trim() || 'Anotação',
    tipo: 'TEXTO',
    tamanhoBytes: new Blob([dados.texto]).size,
    paginas: null,
    status: 'PROCESSANDO',
    mensagemErro: null,
    origem: 'UPLOAD',
    conteudoTexto: dados.texto.slice(0, LIMITE_TEXTO),
    criadoEm: agora()
  }
  alterarBanco((banco) => {
    banco.materiais.push(material)
    tocarAmbiente(banco, ambienteId)
  })
  agendar(1200, () =>
    alterarBanco((banco) => {
      const salvo = banco.materiais.find(({ id }) => id === material.id)
      if (salvo) salvo.status = 'PRONTO'
    })
  )
  return clonar(material)
}

export async function renomearMaterial(
  id: string,
  nome: string
): Promise<Material> {
  await preparar()
  return clonar(
    alterarBanco((banco) => {
      const material = exigir(
        banco.materiais.find((item) => item.id === id),
        'Material'
      )
      material.nome = nome.trim() || material.nome
      return material
    })
  )
}

/** Remove o material e a referência a ele nos chats. As citações já geradas mantêm o nome. */
export async function excluirMaterial(id: string): Promise<void> {
  await preparar()
  alterarBanco((banco) => {
    banco.materiais = banco.materiais.filter((material) => material.id !== id)
    banco.chats.forEach((chat) => {
      chat.materialIds = chat.materialIds.filter(
        (materialId) => materialId !== id
      )
    })
    delete banco.miniaturas[id]
  })
  const preview = previewsSessao.get(id)
  if (preview) URL.revokeObjectURL(preview)
  previewsSessao.delete(id)
}
