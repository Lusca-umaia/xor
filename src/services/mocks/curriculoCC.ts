import type { DisciplinaCurriculo } from '@/@types/Academico'

// Matriz curricular de Ciência da Computação (UFC), currículo 2024.1, só obrigatórias.
// Fonte: https://cc.ufc.br/pt/sobre-o-curso/matriz-curricular/ (consultada em 29/10/2026).
// ATENÇÃO: transcrita por leitura automática da página; conferir com o PPC antes de
// citar no memorial. A página diz 31 obrigatórias, mas a tabela lista 32 (inclui CCP0001).
// Optativas ficam fora por ora: alguns pré-requisitos delas citam códigos (ex.: CK0114)
// que não aparecem na matriz obrigatória.
const linhas: [string, string, number, number, string[]][] = [
  ['CB0534', 'Cálculo Diferencial e Integral I', 96, 1, []],
  ['CK0253', 'Seminários em Computação', 32, 1, []],
  ['CB0661', 'Matemática Discreta', 96, 1, []],
  ['CK0211', 'Fundamentos de Programação', 64, 1, []],
  ['CK0169', 'Circuitos Digitais', 64, 1, []],
  ['CB0535', 'Cálculo Diferencial e Integral II', 96, 2, ['CB0534']],
  ['CB0589', 'Álgebra Linear', 64, 2, []],
  ['CK0209', 'Estruturas de Dados', 64, 2, ['CB0661', 'CK0211']],
  ['CK0226', 'Programação', 64, 2, ['CK0211']],
  ['CK0170', 'Transmissão de Dados', 64, 2, []],
  ['CK0220', 'Lógica para Ciência da Computação', 96, 3, ['CB0661']],
  ['CC0261', 'Introdução à Probabilidade e à Estatística', 64, 3, ['CB0534']],
  ['CK0111', 'Algoritmos em Grafos', 64, 3, ['CK0209']],
  ['CK0235', 'Técnicas de Programação I', 64, 3, ['CK0209', 'CK0226']],
  ['CK0195', 'Arquitetura de Computadores', 64, 3, ['CK0169']],
  ['CK0203', 'Construção e Análise de Algoritmos', 64, 4, ['CK0111']],
  ['CK0047', 'Métodos Numéricos I', 64, 4, ['CK0226', 'CB0534']],
  ['CK0245', 'Computação Gráfica I', 64, 4, ['CB0589', 'CK0226']],
  ['CK0443', 'Fundamentos de Bancos de Dados', 64, 4, ['CK0211']],
  ['CK0115', 'Linguagens de Programação I', 96, 4, ['CK0211']],
  ['CK0247', 'Engenharia de Software I', 64, 5, ['CK0226']],
  ['CK0048', 'Métodos Numéricos II', 64, 5, ['CK0047', 'CB0535', 'CB0589']],
  ['CK0249', 'Redes de Computadores I', 64, 5, ['CK0170']],
  ['CK0095', 'Sistemas de Gerenciamento de Bancos de Dados', 64, 5, ['CK0443']],
  ['CK0248', 'Inteligência Artificial', 64, 6, ['CK0209', 'CC0261']],
  ['CK0234', 'Sistemas Operacionais', 96, 6, ['CK0195']],
  ['CK0192', 'Análise e Projeto de Sistemas I', 64, 6, ['CK0235']],
  ['CK0118', 'Autômatos e Linguagens Formais', 64, 6, ['CK0220']],
  ['CK0202', 'Construção de Compiladores', 96, 7, ['CK0115', 'CK0195']],
  ['CK0096', 'Teoria da Computação', 64, 7, ['CK0118']],
  ['CK0212', 'Informática e Sociedade', 32, 7, []],
  ['CCP0001', 'Atividades Complementares', 64, 8, []]
]

export const CURRICULO_CC: DisciplinaCurriculo[] = linhas.map(
  ([codigo, nome, cargaHoraria, semestre, prerequisitos]) => ({
    codigo,
    nome,
    cargaHoraria,
    semestre,
    prerequisitos
  })
)
