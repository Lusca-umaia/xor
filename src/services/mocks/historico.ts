import type { Avaliacao, TentativaHistorico } from '@/@types/Academico'

// DADOS FICTÍCIOS: histórico de um "Aluno Exemplo". Não representa estudante real.
// As disciplinas são as da matriz oficial de CC; períodos, notas e horários são inventados
// só para demonstração. Trocar pelo retorno da API quando o banco for integrado.
export const ALUNO_DEMO = { nome: 'Aluno Exemplo', periodoAtual: '2026.2' }

const t = (
  codigo: string,
  periodo: string,
  status: TentativaHistorico['status'],
  nota: number | null
): TentativaHistorico => ({ codigo, periodo, status, nota })

export const HISTORICO_DEMO: TentativaHistorico[] = [
  t('CB0534', '2024.1', 'APROVADA', 8.1),
  t('CK0253', '2024.1', 'APROVADA', 9.5),
  t('CB0661', '2024.1', 'APROVADA', 7.4),
  t('CK0211', '2024.1', 'APROVADA', 8.8),
  t('CK0169', '2024.1', 'APROVADA', 6.9),
  t('CB0535', '2024.2', 'REPROVADA', 4.2),
  t('CB0589', '2024.2', 'APROVADA', 7.8),
  t('CK0209', '2024.2', 'APROVADA', 8.0),
  t('CK0226', '2024.2', 'APROVADA', 9.0),
  t('CK0170', '2024.2', 'TRANCADA', null),
  t('CB0535', '2025.1', 'APROVADA', 7.1),
  t('CK0170', '2025.1', 'APROVADA', 7.0),
  t('CK0220', '2025.1', 'APROVADA', 7.5),
  t('CC0261', '2025.1', 'APROVADA', 6.8),
  t('CK0111', '2025.1', 'APROVADA', 8.2),
  t('CK0235', '2025.1', 'APROVADA', 8.6),
  t('CK0195', '2025.1', 'APROVADA', 7.7),
  t('CK0203', '2025.2', 'APROVADA', 7.9),
  t('CK0047', '2025.2', 'APROVADA', 6.5),
  t('CK0245', '2025.2', 'APROVADA', 8.4),
  t('CK0443', '2025.2', 'APROVADA', 9.1),
  t('CK0115', '2025.2', 'APROVADA', 7.2),
  t('CK0247', '2026.1', 'APROVADA', 8.3),
  t('CK0048', '2026.1', 'APROVADA', 6.2),
  t('CK0249', '2026.1', 'APROVADA', 7.6),
  t('CK0095', '2026.1', 'APROVADA', 8.9),
  t('CK0248', '2026.2', 'ANDAMENTO', null),
  t('CK0234', '2026.2', 'ANDAMENTO', null),
  t('CK0192', '2026.2', 'ANDAMENTO', null),
  t('CK0118', '2026.2', 'ANDAMENTO', null)
]

// Avaliações fictícias do semestre em andamento (nota null = ainda não lançada).
export const AVALIACOES_DEMO: Record<string, Avaliacao[]> = {
  CK0248: [
    { nome: 'Prova 1', peso: 1, nota: 6 },
    { nome: 'Prova 2', peso: 1, nota: null },
    { nome: 'Projeto', peso: 1, nota: null }
  ],
  CK0234: [
    { nome: 'Prova 1', peso: 1, nota: 5 },
    { nome: 'Prova 2', peso: 1, nota: null }
  ],
  CK0192: [
    { nome: 'Prova 1', peso: 1, nota: 8 },
    { nome: 'Projeto', peso: 2, nota: null }
  ],
  CK0118: [
    { nome: 'Prova 1', peso: 1, nota: 3.5 },
    { nome: 'Prova 2', peso: 1, nota: null },
    { nome: 'Listas', peso: 1, nota: 7 }
  ]
}
