import { Material } from '@/@types/AmbienteEstudo'
import api from '../api'
import { dados } from './erros'

export const EXTENSOES_ACEITAS =
  '.pdf,.docx,.pptx,.png,.jpg,.jpeg,.webp,.txt,.md'
export const TAMANHO_MAXIMO_BYTES = 25 * 1024 * 1024

/** URL do arquivo original (a rota redireciona para uma URL assinada). */
export const urlDoArquivo = (materialId: string) =>
  `/api/materiais/${materialId}/arquivo`

export const listarMateriais = (ambienteId: string) =>
  dados(api.get<Material[]>(`/ambientes/${ambienteId}/materiais`))

/** Envia o arquivo; o texto é extraído no servidor e o status vira PRONTO. */
export function enviarMaterial(
  ambienteId: string,
  arquivo: File,
  origem: Material['origem'] = 'UPLOAD'
) {
  const formulario = new FormData()
  formulario.append('arquivo', arquivo)
  formulario.append('origem', origem)
  return dados(
    api.post<Material>(`/ambientes/${ambienteId}/materiais`, formulario, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  )
}

export const criarMaterialTexto = (
  ambienteId: string,
  conteudo: { nome: string; texto: string }
) =>
  dados(
    api.post<Material>(`/ambientes/${ambienteId}/materiais/texto`, conteudo)
  )

export const renomearMaterial = (id: string, nome: string) =>
  dados(api.patch<Material>(`/materiais/${id}`, { nome }))

/** Remove o material e a referência a ele nos chats. */
export const excluirMaterial = async (id: string) => {
  await dados(api.delete(`/materiais/${id}`))
}
