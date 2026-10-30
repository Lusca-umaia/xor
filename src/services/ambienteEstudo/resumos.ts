import { ConfigResumo, Resumo } from '@/@types/AmbienteEstudo'
import { ROTULO_FORMATO_RESUMO } from '@/utils/ambienteEstudo/rotulos'
import { exigir } from './erros'
import {
  agora,
  alterarBanco,
  clonar,
  gerarId,
  lerBanco
} from './mock/armazenamento'
import { agendar } from './mock/atraso'
import { gerarConteudoResumo } from './mock/geradores'
import {
  materiaisUtilizaveis,
  pacoteDoAmbiente,
  preparar,
  tocarAmbiente
} from './mock/preparar'

export async function listarResumos(ambienteId: string): Promise<Resumo[]> {
  await preparar(150, 400)
  return clonar(
    lerBanco()
      .resumos.filter((resumo) => resumo.ambienteId === ambienteId)
      .sort((a, b) => b.criadoEm.localeCompare(a.criadoEm))
  )
}

export async function obterResumo(id: string): Promise<Resumo> {
  await preparar(100, 300)
  return clonar(
    exigir(
      lerBanco().resumos.find((r) => r.id === id),
      'Resumo'
    )
  )
}

/** Cria o resumo como GERANDO; o conteúdo chega de forma assíncrona. */
export async function gerarResumo(
  ambienteId: string,
  config: ConfigResumo
): Promise<Resumo> {
  await preparar()

  const resumo = alterarBanco((banco) => {
    const materiais = materiaisUtilizaveis(banco, config.materialIds)
    const nomeBase = materiais[0]?.nome.replace(/\.[^.]+$/, '') ?? 'materiais'
    const novo: Resumo = {
      id: gerarId(),
      ambienteId,
      titulo:
        config.titulo?.trim() ||
        `${ROTULO_FORMATO_RESUMO[config.formato]} — ${nomeBase}${materiais.length > 1 ? ` e mais ${materiais.length - 1}` : ''}`,
      formato: config.formato,
      materialIds: config.materialIds,
      conteudo: '',
      citacoes: [],
      editadoPeloAluno: false,
      origemChatId: config.origemChatId ?? null,
      status: 'GERANDO',
      criadoEm: agora(),
      atualizadoEm: agora()
    }
    banco.resumos.push(novo)
    tocarAmbiente(banco, ambienteId)
    return novo
  })

  agendar(2000 + Math.random() * 1500, () =>
    alterarBanco((banco) => {
      const salvo = banco.resumos.find(({ id }) => id === resumo.id)
      if (!salvo) return
      Object.assign(
        salvo,
        gerarConteudoResumo(
          pacoteDoAmbiente(banco, ambienteId),
          materiaisUtilizaveis(banco, config.materialIds),
          config.formato
        ),
        { status: 'PRONTO', atualizadoEm: agora() }
      )
    })
  )

  return clonar(resumo)
}

export async function atualizarResumo(
  id: string,
  dados: { titulo?: string; conteudo?: string }
): Promise<Resumo> {
  await preparar()
  return clonar(
    alterarBanco((banco) => {
      const resumo = exigir(
        banco.resumos.find((r) => r.id === id),
        'Resumo'
      )
      if (dados.titulo !== undefined)
        resumo.titulo = dados.titulo.trim() || resumo.titulo
      if (dados.conteudo !== undefined && dados.conteudo !== resumo.conteudo) {
        resumo.conteudo = dados.conteudo
        resumo.editadoPeloAluno = true
      }
      resumo.atualizadoEm = agora()
      return resumo
    })
  )
}

export async function excluirResumo(id: string): Promise<void> {
  await preparar()
  alterarBanco((banco) => {
    banco.resumos = banco.resumos.filter((resumo) => resumo.id !== id)
  })
}
