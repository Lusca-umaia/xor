import { Curso } from '@/@types/Curso'
import { STATUS_KEYS } from '@/components/CourseCard/CourseCard'

export interface Disciplina {
  id: number
  nomeCadeira: string
  semestreCadeira: number
  codigo: string
  cargaHoraria: number
  status: keyof typeof STATUS_KEYS
  nota?: number
  carater: 'OBRIGATÓRIA' | 'OPTATIVA'
}

export const mockDataDisciplinas: Disciplina[] = [
  {
    id: 1,
    nomeCadeira: 'Cálculo I',
    cargaHoraria: 64,
    semestreCadeira: 1,
    codigo: 'SEM1-MAT001',
    status: 'CONCLUIDA',
    nota: 5.6,
    carater: 'OBRIGATÓRIA'
  },
  {
    id: 2,
    nomeCadeira: 'Introdução à Computação',
    cargaHoraria: 64,
    semestreCadeira: 1,
    codigo: 'SEM1-INF001',
    status: 'CONCLUIDA',
    nota: 7.6,
    carater: 'OBRIGATÓRIA'
  },
  {
    id: 3,
    nomeCadeira: 'Leitura e Produção de Texto',
    cargaHoraria: 64,
    semestreCadeira: 1,
    codigo: 'SEM1-LET001',
    status: 'ANDAMENTO',
    carater: 'OBRIGATÓRIA'
  },
  {
    id: 4,
    nomeCadeira: 'Fundamentos de Matemática',
    cargaHoraria: 64,
    semestreCadeira: 1,
    codigo: 'SEM1-MAT002',
    status: 'PENDENTE',
    carater: 'OBRIGATÓRIA'
  },
  {
    id: 5,
    nomeCadeira: 'Cálculo II',
    cargaHoraria: 64,
    semestreCadeira: 2,
    codigo: 'SEM2-MAT003',
    status: 'ANDAMENTO',
    carater: 'OBRIGATÓRIA'
  },
  {
    id: 6,
    nomeCadeira: 'Programação I',
    cargaHoraria: 64,
    semestreCadeira: 2,
    codigo: 'SEM2-INF002',
    status: 'CONCLUIDA',
    nota: 5.6,
    carater: 'OBRIGATÓRIA'
  },
  {
    id: 7,
    nomeCadeira: 'Álgebra Linear',
    cargaHoraria: 64,
    semestreCadeira: 2,
    codigo: 'SEM2-MAT004',
    status: 'PENDENTE',
    carater: 'OBRIGATÓRIA'
  },
  {
    id: 8,
    nomeCadeira: 'Física Geral I',
    cargaHoraria: 64,
    semestreCadeira: 2,
    codigo: 'SEM2-FIS001',
    status: 'CONCLUIDA',
    nota: 5.6,
    carater: 'OBRIGATÓRIA'
  },
  {
    id: 9,
    nomeCadeira: 'Estrutura de Dados',
    cargaHoraria: 64,
    semestreCadeira: 3,
    codigo: 'SEM3-INF003',
    status: 'ANDAMENTO',
    carater: 'OBRIGATÓRIA'
  },
  {
    id: 10,
    nomeCadeira: 'Cálculo III',
    cargaHoraria: 64,
    semestreCadeira: 3,
    codigo: 'SEM3-MAT005',
    status: 'PENDENTE',
    carater: 'OBRIGATÓRIA'
  },
  {
    id: 11,
    nomeCadeira: 'Física Geral II',
    cargaHoraria: 64,
    semestreCadeira: 3,
    codigo: 'SEM3-FIS002',
    status: 'CONCLUIDA',
    nota: 5.6,
    carater: 'OBRIGATÓRIA'
  },
  {
    id: 12,
    nomeCadeira: 'Lógica Matemática',
    cargaHoraria: 64,
    semestreCadeira: 3,
    codigo: 'SEM3-MAT006',
    status: 'PENDENTE',
    nota: 5.6,
    carater: 'OBRIGATÓRIA'
  },
  {
    id: 13,
    nomeCadeira: 'Oficina de Robótica',
    cargaHoraria: 64,
    semestreCadeira: 0,
    codigo: 'OPT-ROB001',
    status: 'CONCLUIDA',
    nota: 5.6,
    carater: 'OPTATIVA'
  },
  {
    id: 14,
    nomeCadeira: 'Tópicos Especiais em Computação I',
    cargaHoraria: 64,
    semestreCadeira: 0,
    codigo: 'OPT-INF099',
    status: 'ANDAMENTO',
    carater: 'OPTATIVA'
  },
  {
    id: 15,
    nomeCadeira: 'Introdução à Filosofia da Ciência',
    cargaHoraria: 64,
    semestreCadeira: 0,
    codigo: 'OPT-FIL001',
    status: 'PENDENTE',
    carater: 'OPTATIVA'
  },
  {
    id: 16,
    nomeCadeira: 'Design de Interfaces',
    cargaHoraria: 64,
    semestreCadeira: 0,
    codigo: 'OPT-DES001',
    status: 'CONCLUIDA',
    nota: 5.6,
    carater: 'OPTATIVA'
  }
]

export const cursosMock: Curso[] = [
  {
    id: 1,
    nome: 'Bacharelado em Ciência da Computação',
    email: 'coord.computacao@universidade.edu',
    unidade: 'Instituto de Ciências Exatas',
    codigo: 'BCC001',
    disciplinas: [
      {
        id: 1,
        codigo: 'INF101',
        nome: 'Introdução à Programação',
        cargaHoraria: 60,
        carater: 'OBRIGATORIA',
        semestre: 1
      },
      {
        id: 2,
        codigo: 'INF102',
        nome: 'Fundamentos de Computação',
        cargaHoraria: 60,
        carater: 'OBRIGATORIA',
        semestre: 1
      },
      {
        id: 3,
        codigo: 'INF103',
        nome: 'Matemática Discreta',
        cargaHoraria: 60,
        carater: 'OBRIGATORIA',
        semestre: 1
      },
      {
        id: 4,
        codigo: 'INF104',
        nome: 'Cálculo I',
        cargaHoraria: 60,
        carater: 'OBRIGATORIA',
        semestre: 1
      },
      {
        id: 5,
        codigo: 'INF201',
        nome: 'Algoritmos e Estruturas de Dados I',
        cargaHoraria: 60,
        carater: 'OBRIGATORIA',
        semestre: 2
      },
      {
        id: 6,
        codigo: 'INF202',
        nome: 'Lógica Computacional',
        cargaHoraria: 60,
        carater: 'OBRIGATORIA',
        semestre: 2
      },
      {
        id: 7,
        codigo: 'INF203',
        nome: 'Cálculo II',
        cargaHoraria: 60,
        carater: 'OBRIGATORIA',
        semestre: 2
      },
      {
        id: 8,
        codigo: 'INF301',
        nome: 'Algoritmos e Estruturas de Dados II',
        cargaHoraria: 60,
        carater: 'OBRIGATORIA',
        semestre: 3
      },
      {
        id: 9,
        codigo: 'INF302',
        nome: 'Programação Orientada a Objetos',
        cargaHoraria: 60,
        carater: 'OBRIGATORIA',
        semestre: 3
      },
      {
        id: 10,
        codigo: 'INF303',
        nome: 'Álgebra Linear',
        cargaHoraria: 60,
        carater: 'OBRIGATORIA',
        semestre: 3
      },
      {
        id: 11,
        codigo: 'INF401',
        nome: 'Estruturas de Computadores',
        cargaHoraria: 60,
        carater: 'OBRIGATORIA',
        semestre: 4
      },
      {
        id: 12,
        codigo: 'INF402',
        nome: 'Banco de Dados I',
        cargaHoraria: 60,
        carater: 'OBRIGATORIA',
        semestre: 4
      },
      {
        id: 13,
        codigo: 'INF403',
        nome: 'Probabilidade e Estatística',
        cargaHoraria: 60,
        carater: 'OBRIGATORIA',
        semestre: 4
      },
      {
        id: 14,
        codigo: 'INF501',
        nome: 'Redes de Computadores',
        cargaHoraria: 60,
        carater: 'OBRIGATORIA',
        semestre: 5
      },
      {
        id: 15,
        codigo: 'INF502',
        nome: 'Engenharia de Software I',
        cargaHoraria: 60,
        carater: 'OBRIGATORIA',
        semestre: 5
      },
      {
        id: 16,
        codigo: 'INF503',
        nome: 'Sistemas Operacionais',
        cargaHoraria: 60,
        carater: 'OBRIGATORIA',
        semestre: 5
      },
      {
        id: 17,
        codigo: 'INF601',
        nome: 'Computação Gráfica',
        cargaHoraria: 60,
        carater: 'OPTATIVA',
        semestre: 6
      },
      {
        id: 18,
        codigo: 'INF602',
        nome: 'Inteligência Artificial',
        cargaHoraria: 60,
        carater: 'OPTATIVA',
        semestre: 6
      },
      {
        id: 19,
        codigo: 'INF603',
        nome: 'Compiladores',
        cargaHoraria: 60,
        carater: 'OPTATIVA',
        semestre: 6
      },
      {
        id: 20,
        codigo: 'INF701',
        nome: 'Segurança da Informação',
        cargaHoraria: 60,
        carater: 'OPTATIVA',
        semestre: 7
      },
      {
        id: 21,
        codigo: 'INF702',
        nome: 'Desenvolvimento Web',
        cargaHoraria: 60,
        carater: 'OPTATIVA',
        semestre: 7
      },
      {
        id: 22,
        codigo: 'INF703',
        nome: 'Tópicos Avançados em Programação',
        cargaHoraria: 60,
        carater: 'OPTATIVA',
        semestre: 7
      },
      {
        id: 23,
        codigo: 'INF801',
        nome: 'Estágio Supervisionado',
        cargaHoraria: 120,
        carater: 'OBRIGATORIA',
        semestre: 8
      },
      {
        id: 24,
        codigo: 'INF802',
        nome: 'Trabalho de Conclusão de Curso',
        cargaHoraria: 60,
        carater: 'OBRIGATORIA',
        semestre: 8
      }
    ]
  },
  {
    id: 2,
    nome: 'Licenciatura em Matemática',
    email: 'coord.matematica@universidade.edu',
    unidade: 'Instituto de Matemática e Estatística',
    codigo: 'MAT001',
    disciplinas: [
      {
        id: 101,
        codigo: 'MAT101',
        nome: 'Cálculo I',
        cargaHoraria: 60,
        carater: 'OBRIGATORIA',
        semestre: 1
      },
      {
        id: 102,
        codigo: 'MAT102',
        nome: 'Geometria Analítica',
        cargaHoraria: 60,
        carater: 'OBRIGATORIA',
        semestre: 1
      },
      {
        id: 103,
        codigo: 'MAT103',
        nome: 'Álgebra Linear I',
        cargaHoraria: 60,
        carater: 'OBRIGATORIA',
        semestre: 1
      },
      {
        id: 104,
        codigo: 'MAT201',
        nome: 'Cálculo II',
        cargaHoraria: 60,
        carater: 'OBRIGATORIA',
        semestre: 2
      },
      {
        id: 105,
        codigo: 'MAT202',
        nome: 'Lógica Matemática',
        cargaHoraria: 60,
        carater: 'OBRIGATORIA',
        semestre: 2
      },
      {
        id: 106,
        codigo: 'MAT203',
        nome: 'Didática da Matemática',
        cargaHoraria: 60,
        carater: 'OBRIGATORIA',
        semestre: 2
      },
      {
        id: 107,
        codigo: 'MAT301',
        nome: 'Equações Diferenciais',
        cargaHoraria: 60,
        carater: 'OBRIGATORIA',
        semestre: 3
      },
      {
        id: 108,
        codigo: 'MAT302',
        nome: 'Estatística e Probabilidade',
        cargaHoraria: 60,
        carater: 'OBRIGATORIA',
        semestre: 3
      },
      {
        id: 109,
        codigo: 'MAT303',
        nome: 'Álgebra Moderna',
        cargaHoraria: 60,
        carater: 'OBRIGATORIA',
        semestre: 3
      },
      {
        id: 110,
        codigo: 'MAT401',
        nome: 'Geometria Euclidiana e Não Euclidiana',
        cargaHoraria: 60,
        carater: 'OBRIGATORIA',
        semestre: 4
      },
      {
        id: 111,
        codigo: 'MAT402',
        nome: 'Matemática Financeira',
        cargaHoraria: 60,
        carater: 'OPTATIVA',
        semestre: 4
      },
      {
        id: 112,
        codigo: 'MAT403',
        nome: 'Teoria dos Números',
        cargaHoraria: 60,
        carater: 'OPTATIVA',
        semestre: 4
      },
      {
        id: 113,
        codigo: 'MAT501',
        nome: 'História da Matemática',
        cargaHoraria: 60,
        carater: 'OBRIGATORIA',
        semestre: 5
      },
      {
        id: 114,
        codigo: 'MAT502',
        nome: 'Estágio Supervisionado I',
        cargaHoraria: 60,
        carater: 'OBRIGATORIA',
        semestre: 6
      },
      {
        id: 115,
        codigo: 'MAT601',
        nome: 'Estágio Supervisionado II',
        cargaHoraria: 60,
        carater: 'OBRIGATORIA',
        semestre: 7
      },
      {
        id: 116,
        codigo: 'MAT701',
        nome: 'Trabalho de Conclusão de Curso',
        cargaHoraria: 60,
        carater: 'OBRIGATORIA',
        semestre: 8
      }
    ]
  }
]
