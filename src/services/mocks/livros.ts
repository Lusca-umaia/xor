// Seleção inicial de livros de acesso gratuito, cada um com o link do site oficial do autor
// ou da instituição. Só entram obras cujo link respondeu (HTTP 200) em 29/10/2026.
// A licença abaixo é o que a própria página (ou o repositório) do livro declarava na
// mesma data. Gratuito para ler NÃO é o mesmo que licença aberta: confira os termos no
// site oficial antes de copiar ou redistribuir.
// Disciplinas = códigos da matriz de CC 2024.1 a que o livro se relaciona.
export type TipoLicenca =
  // Licença que permite reuso, inclusive comercial (ex.: CC BY, CC BY-SA).
  | 'ABERTA'
  // Licença com restrições (ex.: NonCommercial, NoDerivatives).
  | 'RESTRITA'
  // Gratuito para ler, sem licença aberta declarada na página.
  | 'GRATUITA'
  // Não foi possível confirmar a licença.
  | 'NAO_VERIFICADA'

export interface LivroAberto {
  id: string
  titulo: string
  autores: string
  area: string
  idioma: string
  url: string
  disciplinas: string[]
  licenca: { tipo: TipoLicenca; texto: string }
}

export const LIVROS_ABERTOS: LivroAberto[] = [
  {
    id: 'ostep',
    titulo: 'Operating Systems: Three Easy Pieces',
    autores: 'Remzi H. Arpaci-Dusseau, Andrea C. Arpaci-Dusseau',
    area: 'Sistemas Operacionais',
    idioma: 'Inglês',
    url: 'https://pages.cs.wisc.edu/~remzi/OSTEP/',
    disciplinas: ['CK0234'],
    licenca: {
      tipo: 'GRATUITA',
      texto:
        'O site diz que o PDF é e sempre será gratuito, mas não declara licença aberta.'
    }
  },
  {
    id: 'ods',
    titulo: 'Open Data Structures',
    autores: 'Pat Morin',
    area: 'Estruturas de Dados',
    idioma: 'Inglês',
    url: 'https://opendatastructures.org/',
    disciplinas: ['CK0209'],
    licenca: {
      tipo: 'ABERTA',
      texto: 'CC BY 2.5 (Canadá), segundo o site do livro.'
    }
  },
  {
    id: 'algoritmos-erickson',
    titulo: 'Algorithms',
    autores: 'Jeff Erickson',
    area: 'Algoritmos',
    idioma: 'Inglês',
    url: 'https://jeffe.cs.illinois.edu/teaching/algorithms/',
    disciplinas: ['CK0111', 'CK0203'],
    licenca: {
      tipo: 'ABERTA',
      texto:
        'O livro é CC BY 4.0, segundo o site. As notas de aula têm licença mais restritiva (CC BY-NC-SA 4.0).'
    }
  },
  {
    id: 'think-python',
    titulo: 'Think Python (2ª edição)',
    autores: 'Allen B. Downey',
    area: 'Programação',
    idioma: 'Inglês',
    url: 'https://greenteapress.com/wp/think-python-2e/',
    disciplinas: ['CK0211', 'CK0226'],
    licenca: {
      tipo: 'RESTRITA',
      texto: 'CC BY-NC 3.0: uso não comercial, segundo o site.'
    }
  },
  {
    id: 'mcs',
    titulo: 'Mathematics for Computer Science',
    autores: 'Eric Lehman, F. Thomson Leighton, Albert R. Meyer',
    area: 'Matemática Discreta',
    idioma: 'Inglês',
    url: 'https://courses.csail.mit.edu/6.042/spring18/mcs.pdf',
    disciplinas: ['CB0661'],
    licenca: {
      tipo: 'NAO_VERIFICADA',
      texto:
        'Não consegui confirmar a licença neste PDF. Veja a página de direitos do próprio documento.'
    }
  },
  {
    id: 'open-logic',
    titulo: 'Open Logic Project',
    autores: 'Open Logic Project (autoria coletiva)',
    area: 'Lógica',
    idioma: 'Inglês',
    url: 'https://openlogicproject.org/',
    disciplinas: ['CK0220'],
    licenca: {
      tipo: 'ABERTA',
      texto: 'CC BY 4.0, segundo o site do projeto.'
    }
  },
  {
    id: 'systems-approach',
    titulo: 'Computer Networks: A Systems Approach',
    autores: 'Larry Peterson, Bruce Davie',
    area: 'Redes de Computadores',
    idioma: 'Inglês',
    url: 'https://book.systemsapproach.org/',
    disciplinas: ['CK0249'],
    licenca: {
      tipo: 'NAO_VERIFICADA',
      texto: 'Não consegui confirmar a licença. Veja o site do livro.'
    }
  },
  {
    id: 'crafting-interpreters',
    titulo: 'Crafting Interpreters',
    autores: 'Robert Nystrom',
    area: 'Compiladores e Linguagens',
    idioma: 'Inglês',
    url: 'https://craftinginterpreters.com/',
    disciplinas: ['CK0202', 'CK0115'],
    licenca: {
      tipo: 'RESTRITA',
      texto:
        'Texto e arquivos do repositório sob CC BY-NC-ND 4.0: sem uso comercial e sem derivações.'
    }
  },
  {
    id: 'd2l',
    titulo: 'Dive into Deep Learning',
    autores: 'Aston Zhang, Zachary C. Lipton, Mu Li, Alexander J. Smola',
    area: 'Inteligência Artificial',
    idioma: 'Inglês',
    url: 'https://d2l.ai/',
    disciplinas: ['CK0248'],
    licenca: {
      tipo: 'ABERTA',
      texto:
        'CC BY-SA 4.0, segundo o arquivo de licença do repositório do livro.'
    }
  },
  {
    id: 'slp3',
    titulo: 'Speech and Language Processing (3ª edição, rascunho)',
    autores: 'Dan Jurafsky, James H. Martin',
    area: 'Inteligência Artificial',
    idioma: 'Inglês',
    url: 'https://web.stanford.edu/~jurafsky/slp3/',
    disciplinas: ['CK0248'],
    licenca: {
      tipo: 'GRATUITA',
      texto:
        'Rascunho gratuito online. Não encontrei licença aberta declarada na página.'
    }
  }
]
