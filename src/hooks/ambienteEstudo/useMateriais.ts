import { useQuery } from '@tanstack/react-query'
import { Material } from '@/@types/AmbienteEstudo'
import {
  criarMaterialTexto,
  enviarMaterial,
  excluirMaterial,
  listarMateriais,
  renomearMaterial
} from '@/services/ambienteEstudo/materiais'
import {
  chavesAmbiente,
  consultarEnquanto,
  repetirConsulta
} from './chavesConsulta'
import { useMutacaoAmbiente } from './useMutacaoAmbiente'

const emProcessamento = (materiais: Material[]) =>
  materiais.some(
    ({ status }) => status === 'ENVIANDO' || status === 'PROCESSANDO'
  )

export function useMateriais(ambienteId: string) {
  return useQuery({
    queryKey: chavesAmbiente.materiais(ambienteId),
    queryFn: () => listarMateriais(ambienteId),
    retry: repetirConsulta,
    refetchIntervalInBackground: true,
    refetchInterval: consultarEnquanto(emProcessamento, 800)
  })
}

export function useEnviarMateriais(ambienteId: string) {
  return useMutacaoAmbiente(
    ({ arquivos, origem }: { arquivos: File[]; origem?: Material['origem'] }) =>
      Promise.all(
        arquivos.map((arquivo) => enviarMaterial(ambienteId, arquivo, origem))
      )
  )
}

export function useCriarMaterialTexto(ambienteId: string) {
  return useMutacaoAmbiente(
    (dados: { nome: string; texto: string }) =>
      criarMaterialTexto(ambienteId, dados),
    { mensagemSucesso: 'Texto adicionado à biblioteca.' }
  )
}

export function useRenomearMaterial() {
  return useMutacaoAmbiente(({ id, nome }: { id: string; nome: string }) =>
    renomearMaterial(id, nome)
  )
}

export function useExcluirMaterial() {
  return useMutacaoAmbiente(excluirMaterial, {
    mensagemSucesso: 'Material excluído.'
  })
}
