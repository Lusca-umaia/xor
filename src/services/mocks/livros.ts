// Seleção inicial de livros de acesso livre, cada um com o link do site oficial do autor
// ou da instituição. Só entram obras cujo link respondeu (HTTP 200) em 29/10/2026.
// O app não afirma licenças: confira os termos de uso no site oficial antes de redistribuir.
// Disciplinas = códigos da matriz de CC 2024.1 a que o livro se relaciona.
export interface LivroAberto {
  id: string
  titulo: string
  autores: string
  area: string
  idioma: string
  url: string
  disciplinas: string[]
}

export const LIVROS_ABERTOS: LivroAberto[] = [
  {
    id: 'ostep',
    titulo: 'Operating Systems: Three Easy Pieces',
    autores: 'Remzi H. Arpaci-Dusseau, Andrea C. Arpaci-Dusseau',
    area: 'Sistemas Operacionais',
    idioma: 'Inglês',
    url: 'https://pages.cs.wisc.edu/~remzi/OSTEP/',
    disciplinas: ['CK0234']
  },
  {
    id: 'ods',
    titulo: 'Open Data Structures',
    autores: 'Pat Morin',
    area: 'Estruturas de Dados',
    idioma: 'Inglês',
    url: 'https://opendatastructures.org/',
    disciplinas: ['CK0209']
  },
  {
    id: 'algoritmos-erickson',
    titulo: 'Algorithms',
    autores: 'Jeff Erickson',
    area: 'Algoritmos',
    idioma: 'Inglês',
    url: 'https://jeffe.cs.illinois.edu/teaching/algorithms/',
    disciplinas: ['CK0111', 'CK0203']
  },
  {
    id: 'think-python',
    titulo: 'Think Python (2ª edição)',
    autores: 'Allen B. Downey',
    area: 'Programação',
    idioma: 'Inglês',
    url: 'https://greenteapress.com/wp/think-python-2e/',
    disciplinas: ['CK0211', 'CK0226']
  },
  {
    id: 'mcs',
    titulo: 'Mathematics for Computer Science',
    autores: 'Eric Lehman, F. Thomson Leighton, Albert R. Meyer',
    area: 'Matemática Discreta',
    idioma: 'Inglês',
    url: 'https://courses.csail.mit.edu/6.042/spring18/mcs.pdf',
    disciplinas: ['CB0661']
  },
  {
    id: 'open-logic',
    titulo: 'Open Logic Project',
    autores: 'Open Logic Project (autoria coletiva)',
    area: 'Lógica',
    idioma: 'Inglês',
    url: 'https://openlogicproject.org/',
    disciplinas: ['CK0220']
  },
  {
    id: 'systems-approach',
    titulo: 'Computer Networks: A Systems Approach',
    autores: 'Larry Peterson, Bruce Davie',
    area: 'Redes de Computadores',
    idioma: 'Inglês',
    url: 'https://book.systemsapproach.org/',
    disciplinas: ['CK0249']
  },
  {
    id: 'crafting-interpreters',
    titulo: 'Crafting Interpreters',
    autores: 'Robert Nystrom',
    area: 'Compiladores e Linguagens',
    idioma: 'Inglês',
    url: 'https://craftinginterpreters.com/',
    disciplinas: ['CK0202', 'CK0115']
  },
  {
    id: 'd2l',
    titulo: 'Dive into Deep Learning',
    autores: 'Aston Zhang, Zachary C. Lipton, Mu Li, Alexander J. Smola',
    area: 'Inteligência Artificial',
    idioma: 'Inglês',
    url: 'https://d2l.ai/',
    disciplinas: ['CK0248']
  },
  {
    id: 'slp3',
    titulo: 'Speech and Language Processing (3ª edição, rascunho)',
    autores: 'Dan Jurafsky, James H. Martin',
    area: 'Inteligência Artificial',
    idioma: 'Inglês',
    url: 'https://web.stanford.edu/~jurafsky/slp3/',
    disciplinas: ['CK0248']
  }
]
