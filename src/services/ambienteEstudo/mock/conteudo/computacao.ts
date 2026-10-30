import { m, PacoteConteudo } from './tipos'

export const pacoteComputacao: PacoteConteudo = {
  chave: 'computacao',
  palavrasChave: /dados|algoritm|program|comput|software|robot|sistema/,
  materiaisDemonstracao: [
    {
      nome: 'Aula 03 - Listas, Pilhas e Filas.pdf',
      tipo: 'PDF',
      paginas: 24,
      tamanhoBytes: 1_840_000
    },
    {
      nome: 'Aula 05 - Árvores Binárias de Busca.pptx',
      tipo: 'PPTX',
      paginas: 31,
      tamanhoBytes: 3_200_000
    }
  ],
  trechos: [
    {
      material: 0,
      pagina: 4,
      texto:
        'Uma pilha é uma estrutura LIFO (Last In, First Out): o último elemento inserido é o primeiro a ser removido. As operações básicas são push (empilhar) e pop (desempilhar), ambas em O(1).'
    },
    {
      material: 0,
      pagina: 9,
      texto:
        'Uma fila segue a política FIFO (First In, First Out). Elementos são inseridos no final (enqueue) e removidos do início (dequeue). Com lista encadeada e ponteiros para início e fim, as duas operações custam O(1).'
    },
    {
      material: 0,
      pagina: 14,
      texto:
        'Em uma lista encadeada, cada nó armazena o dado e uma referência para o próximo nó. A inserção no início é O(1), mas o acesso ao i-ésimo elemento exige percorrer a lista, custando O(n).'
    },
    {
      material: 0,
      pagina: 18,
      texto:
        'Vetores permitem acesso aleatório em O(1) por índice, porém inserir ou remover no meio exige deslocar elementos, com custo O(n).'
    },
    {
      material: 1,
      pagina: 7,
      texto:
        'Em uma árvore binária de busca (ABB), para todo nó, as chaves da subárvore esquerda são menores e as da subárvore direita são maiores que a chave do nó.'
    },
    {
      material: 1,
      pagina: 15,
      texto:
        'A busca em uma ABB custa O(h), onde h é a altura. Em uma árvore balanceada h = O(log n); no pior caso, quando as inserções chegam ordenadas, a árvore degenera em lista e h = O(n).'
    },
    {
      material: 1,
      pagina: 22,
      texto:
        'O percurso em ordem (esquerda, raiz, direita) visita as chaves de uma ABB em ordem crescente.'
    },
    {
      material: 1,
      pagina: 27,
      texto:
        'Árvores AVL mantêm o fator de balanceamento de cada nó entre -1 e 1, aplicando rotações após inserções e remoções para garantir altura O(log n).'
    }
  ],
  questoes: [
    {
      tipo: 'MULTIPLA_ESCOLHA',
      enunciado: 'Qual estrutura de dados segue a política **LIFO**?',
      dificuldade: 'FACIL',
      topico: 'Pilhas e filas',
      trecho: 0,
      opcaoCorretaId: 'b',
      opcoes: [
        {
          id: 'a',
          texto: 'Fila',
          justificativa:
            'A fila segue FIFO: o primeiro elemento a entrar é o primeiro a sair.'
        },
        {
          id: 'b',
          texto: 'Pilha',
          justificativa:
            'Na pilha, o último elemento empilhado é o primeiro a ser desempilhado (LIFO).'
        },
        {
          id: 'c',
          texto: 'Lista circular',
          justificativa:
            'Uma lista circular não define, por si só, uma política de remoção.'
        },
        {
          id: 'd',
          texto: 'Árvore binária de busca',
          justificativa:
            'A ABB organiza as chaves por ordem, não pela ordem de inserção.'
        }
      ]
    },
    {
      tipo: 'MULTIPLA_ESCOLHA',
      enunciado:
        'Em uma fila implementada com lista encadeada que mantém ponteiros para o início e o fim, qual é o custo de **enqueue** e **dequeue**, respectivamente?',
      dificuldade: 'MEDIA',
      topico: 'Pilhas e filas',
      trecho: 1,
      opcaoCorretaId: 'a',
      opcoes: [
        {
          id: 'a',
          texto: '$O(1)$ e $O(1)$',
          justificativa:
            'Com os dois ponteiros, inserir no fim e remover do início não exigem percorrer a lista.'
        },
        {
          id: 'b',
          texto: '$O(n)$ e $O(1)$',
          justificativa:
            'Seria $O(n)$ só se não houvesse ponteiro para o fim da fila.'
        },
        {
          id: 'c',
          texto: '$O(1)$ e $O(n)$',
          justificativa: 'Remover do início de uma lista encadeada é $O(1)$.'
        },
        {
          id: 'd',
          texto: m`$O(\log n)$ e $O(\log n)$`,
          justificativa:
            'Custos logarítmicos aparecem em árvores balanceadas, não em filas.'
        }
      ]
    },
    {
      tipo: 'MULTIPLA_ESCOLHA',
      enunciado:
        'Qual é o custo de acessar o *i*-ésimo elemento de uma lista encadeada simples?',
      dificuldade: 'FACIL',
      topico: 'Listas e vetores',
      trecho: 2,
      opcaoCorretaId: 'c',
      opcoes: [
        {
          id: 'a',
          texto: '$O(1)$',
          justificativa:
            'Acesso em $O(1)$ por índice é característica de vetores.'
        },
        {
          id: 'b',
          texto: m`$O(\log n)$`,
          justificativa:
            'Não há divisão do espaço de busca: a lista é percorrida nó a nó.'
        },
        {
          id: 'c',
          texto: '$O(n)$',
          justificativa:
            'É preciso seguir as referências desde o primeiro nó até o *i*-ésimo.'
        },
        {
          id: 'd',
          texto: '$O(n^2)$',
          justificativa:
            'Cada nó é visitado no máximo uma vez, então não é quadrático.'
        }
      ]
    },
    {
      tipo: 'MULTIPLA_ESCOLHA',
      enunciado:
        'Em qual situação uma árvore binária de busca degenera e a busca passa a custar $O(n)$?',
      dificuldade: 'MEDIA',
      topico: 'Árvores binárias de busca',
      trecho: 5,
      opcaoCorretaId: 'a',
      opcoes: [
        {
          id: 'a',
          texto: 'Quando as chaves são inseridas em ordem crescente',
          justificativa:
            'Cada nova chave vira filho direito da anterior, e a árvore vira uma lista.'
        },
        {
          id: 'b',
          texto: 'Quando é inserida uma chave repetida',
          justificativa:
            'Chaves repetidas exigem uma convenção, mas não degeneram a árvore por si só.'
        },
        {
          id: 'c',
          texto: 'Quando a raiz é removida',
          justificativa:
            'A remoção da raiz substitui o nó pelo sucessor e preserva a estrutura.'
        },
        {
          id: 'd',
          texto: 'Quando a árvore tem um número par de nós',
          justificativa: 'A paridade do número de nós não afeta a altura.'
        }
      ]
    },
    {
      tipo: 'MULTIPLA_ESCOLHA',
      enunciado:
        'Qual percurso visita as chaves de uma ABB em **ordem crescente**?',
      dificuldade: 'FACIL',
      topico: 'Árvores binárias de busca',
      trecho: 6,
      opcaoCorretaId: 'b',
      opcoes: [
        {
          id: 'a',
          texto: 'Pré-ordem',
          justificativa: 'A pré-ordem visita a raiz antes das subárvores.'
        },
        {
          id: 'b',
          texto: 'Em ordem',
          justificativa:
            'Esquerda, raiz, direita: pela propriedade da ABB, isso produz as chaves ordenadas.'
        },
        {
          id: 'c',
          texto: 'Pós-ordem',
          justificativa: 'A pós-ordem visita a raiz depois das subárvores.'
        },
        {
          id: 'd',
          texto: 'Em largura',
          justificativa: 'O percurso em largura visita os nós nível a nível.'
        }
      ]
    },
    {
      tipo: 'MULTIPLA_ESCOLHA',
      enunciado:
        'Qual é o intervalo permitido para o **fator de balanceamento** de cada nó em uma árvore AVL?',
      dificuldade: 'DIFICIL',
      topico: 'Árvores balanceadas',
      trecho: 7,
      opcaoCorretaId: 'a',
      opcoes: [
        {
          id: 'a',
          texto: 'Entre $-1$ e $1$',
          justificativa:
            'As alturas das subárvores de cada nó podem diferir em no máximo uma unidade.'
        },
        {
          id: 'b',
          texto: 'Entre $0$ e $2$',
          justificativa:
            'O fator pode ser negativo quando a subárvore direita é mais alta.'
        },
        {
          id: 'c',
          texto: 'Entre $-2$ e $2$',
          justificativa:
            'Um fator $\\pm 2$ indica desbalanceamento e dispara uma rotação.'
        },
        {
          id: 'd',
          texto: 'Qualquer valor, desde que a altura total seja par',
          justificativa:
            'A AVL restringe o fator de cada nó, não a paridade da altura.'
        }
      ]
    },
    {
      tipo: 'VERDADEIRO_FALSO',
      enunciado: 'Inserir um elemento no meio de um vetor custa $O(1)$.',
      dificuldade: 'FACIL',
      topico: 'Listas e vetores',
      trecho: 3,
      resposta: false,
      justificativa:
        'É preciso deslocar os elementos seguintes para abrir espaço, o que custa $O(n)$.'
    },
    {
      tipo: 'VERDADEIRO_FALSO',
      enunciado:
        'Em uma ABB, todas as chaves da subárvore esquerda de um nó são menores que a chave desse nó.',
      dificuldade: 'FACIL',
      topico: 'Árvores binárias de busca',
      trecho: 4,
      resposta: true,
      justificativa: 'Essa é exatamente a propriedade que define uma ABB.'
    },
    {
      tipo: 'VERDADEIRO_FALSO',
      enunciado:
        'A operação pop em uma pilha remove o primeiro elemento que foi inserido.',
      dificuldade: 'FACIL',
      topico: 'Pilhas e filas',
      trecho: 0,
      resposta: false,
      justificativa:
        'Pop remove o elemento do topo, que é o último inserido. Remover o primeiro é comportamento de fila.'
    },
    {
      tipo: 'VERDADEIRO_FALSO',
      enunciado: m`Rotações em árvores AVL servem para manter a altura em $O(\log n)$.`,
      dificuldade: 'MEDIA',
      topico: 'Árvores balanceadas',
      trecho: 7,
      resposta: true,
      justificativa:
        'As rotações restauram o fator de balanceamento e, com ele, a altura logarítmica.'
    },
    {
      tipo: 'LACUNAS',
      enunciado: 'Complete com a política de cada estrutura.',
      dificuldade: 'FACIL',
      topico: 'Pilhas e filas',
      trecho: 1,
      texto:
        'A pilha segue a política {{l1}}, enquanto a fila segue a política {{l2}}.',
      lacunas: [
        { id: 'l1', respostasAceitas: ['LIFO'] },
        { id: 'l2', respostasAceitas: ['FIFO'] }
      ],
      justificativa:
        'Pilha: último a entrar, primeiro a sair (LIFO). Fila: primeiro a entrar, primeiro a sair (FIFO).'
    },
    {
      tipo: 'LACUNAS',
      enunciado: 'Complete com o nome do percurso.',
      dificuldade: 'MEDIA',
      topico: 'Árvores binárias de busca',
      trecho: 6,
      texto:
        'O percurso {{l1}} visita as chaves de uma ABB em ordem crescente.',
      lacunas: [
        {
          id: 'l1',
          respostasAceitas: ['em ordem', 'in-order', 'inorder', 'simétrico']
        }
      ],
      justificativa:
        'O percurso em ordem (simétrico) visita esquerda, raiz e direita.'
    },
    {
      tipo: 'LACUNAS',
      enunciado: 'Complete com a complexidade.',
      dificuldade: 'MEDIA',
      topico: 'Árvores balanceadas',
      trecho: 5,
      texto: 'Em uma árvore balanceada com $n$ nós, a altura é O({{l1}}).',
      lacunas: [{ id: 'l1', respostasAceitas: ['log n', 'lg n', 'log2 n'] }],
      justificativa:
        'O balanceamento garante que a altura cresça de forma logarítmica no número de nós.'
    },
    {
      tipo: 'DISCURSIVA',
      enunciado:
        'Compare **vetores** e **listas encadeadas** quanto ao custo de acesso por índice e de inserção no meio. Em que situação você escolheria cada um?',
      dificuldade: 'MEDIA',
      topico: 'Listas e vetores',
      trecho: 3,
      rubrica: [
        {
          id: 'c1',
          descricao:
            'Explica o acesso por índice: $O(1)$ no vetor e $O(n)$ na lista.',
          pontos: 3
        },
        {
          id: 'c2',
          descricao:
            'Explica a inserção no meio: deslocamento $O(n)$ no vetor e ajuste de referências na lista.',
          pontos: 3
        },
        {
          id: 'c3',
          descricao: 'Justifica a escolha com um cenário de uso concreto.',
          pontos: 2
        },
        {
          id: 'c4',
          descricao: 'Usa os termos técnicos corretamente e com clareza.',
          pontos: 2
        }
      ],
      respostaModelo:
        'No vetor, o acesso por índice é $O(1)$, porque a posição é calculada diretamente; na lista encadeada é $O(n)$, pois é preciso percorrer os nós. Para inserir no meio, o vetor precisa deslocar os elementos seguintes ($O(n)$), enquanto a lista só ajusta referências depois de chegar à posição. Eu usaria um vetor para dados consultados por posição com poucas inserções, como uma tabela de notas, e uma lista encadeada para uma coleção com muitas inserções e remoções, como uma fila de tarefas.'
    },
    {
      tipo: 'DISCURSIVA',
      enunciado:
        'Explique por que a **ordem de inserção** afeta o desempenho de uma ABB e como as árvores **AVL** resolvem esse problema.',
      dificuldade: 'DIFICIL',
      topico: 'Árvores balanceadas',
      trecho: 5,
      rubrica: [
        {
          id: 'c1',
          descricao:
            'Relaciona o custo das operações à altura da árvore ($O(h)$).',
          pontos: 3
        },
        {
          id: 'c2',
          descricao:
            'Mostra que inserções ordenadas degeneram a árvore em lista ($h = O(n)$).',
          pontos: 3
        },
        {
          id: 'c3',
          descricao: m`Explica o fator de balanceamento e as rotações da AVL, que garantem $h = O(\log n)$.`,
          pontos: 2
        },
        {
          id: 'c4',
          descricao: 'Organiza o raciocínio com clareza.',
          pontos: 2
        }
      ],
      respostaModelo: m`Busca, inserção e remoção em uma ABB custam $O(h)$. Se as chaves chegam ordenadas, cada uma vira filho direito da anterior e a árvore se torna uma lista, com $h = O(n)$. A AVL controla o fator de balanceamento de cada nó (entre $-1$ e $1$) e, quando ele sai desse intervalo após uma inserção ou remoção, aplica rotações que redistribuem os nós. Assim a altura fica sempre em $O(\log n)$, independentemente da ordem de inserção.`
    }
  ],
  flashcards: [
    {
      frente: 'O que significa LIFO?',
      verso:
        'Last In, First Out: o último a entrar é o primeiro a sair. É a política da pilha.',
      trecho: 0
    },
    {
      frente: 'O que significa FIFO?',
      verso:
        'First In, First Out: o primeiro a entrar é o primeiro a sair. É a política da fila.',
      trecho: 1
    },
    {
      frente: 'Custo de acesso por índice: vetor × lista encadeada',
      verso: 'Vetor: $O(1)$. Lista encadeada: $O(n)$.',
      trecho: 2
    },
    {
      frente: 'Propriedade de uma árvore binária de busca',
      verso:
        'Para todo nó: chaves à esquerda são menores e chaves à direita são maiores.',
      trecho: 4
    },
    {
      frente: 'Qual percurso lista as chaves de uma ABB ordenadas?',
      verso: 'O percurso **em ordem**: esquerda, raiz, direita.',
      trecho: 6
    },
    {
      frente: 'Fator de balanceamento permitido em uma AVL',
      verso: m`Entre $-1$ e $1$. Fora disso, uma rotação restaura o balanceamento e a altura $O(\log n)$.`,
      trecho: 7
    }
  ],
  resumos: {
    TOPICOS: {
      trechos: [0, 1, 2, 3, 5, 6, 7],
      conteudo: m`## Estruturas lineares
- **Pilha (LIFO):** push e pop em $O(1)$.
- **Fila (FIFO):** enqueue no fim e dequeue no início, ambos em $O(1)$ com ponteiros de início e fim.
- **Lista encadeada:** inserção no início em $O(1)$; acesso por índice em $O(n)$.
- **Vetor:** acesso por índice em $O(1)$; inserção ou remoção no meio em $O(n)$.

## Árvores binárias de busca
- Para todo nó: esquerda < nó < direita.
- Busca, inserção e remoção custam $O(h)$.
- Balanceada: $h = O(\log n)$. Inserções ordenadas: $h = O(n)$.
- O percurso **em ordem** devolve as chaves ordenadas.

## Árvores AVL
- Fator de balanceamento entre $-1$ e $1$.
- Rotações após inserções e remoções garantem $h = O(\log n)$.

| Estrutura | Acesso por índice | Inserção no início |
|---|---|---|
| Vetor | $O(1)$ | $O(n)$ |
| Lista encadeada | $O(n)$ | $O(1)$ |`
    },
    CORRIDO: {
      trechos: [0, 1, 3, 5, 7],
      conteudo: m`As estruturas lineares diferem principalmente na **ordem de acesso**. A pilha segue a política LIFO, em que o último elemento inserido é o primeiro a sair, enquanto a fila segue FIFO, atendendo primeiro quem chegou antes. Ambas oferecem operações em $O(1)$ quando bem implementadas.

Vetores e listas encadeadas representam um compromisso: o vetor permite acesso direto por índice em $O(1)$, mas inserir no meio exige deslocar elementos ($O(n)$); a lista encadeada insere facilmente ajustando referências, mas precisa ser percorrida para acessar uma posição.

Nas árvores binárias de busca, o desempenho depende da **altura**. Se as chaves chegam ordenadas, a árvore degenera em lista e a busca passa a $O(n)$. As árvores AVL evitam esse problema mantendo o fator de balanceamento de cada nó entre $-1$ e $1$ por meio de rotações, o que garante altura $O(\log n)$.`
    },
    GLOSSARIO: {
      trechos: [0, 1, 2, 4, 6, 7],
      conteudo: m`- **Pilha**: estrutura LIFO com as operações push e pop.
- **Fila**: estrutura FIFO com as operações enqueue e dequeue.
- **Lista encadeada**: sequência de nós em que cada nó guarda o dado e uma referência para o próximo.
- **Vetor**: bloco contíguo de memória com acesso por índice em $O(1)$.
- **Árvore binária de busca**: árvore em que, para todo nó, as chaves à esquerda são menores e as à direita são maiores.
- **Altura**: maior número de arestas entre a raiz e uma folha.
- **Percurso em ordem**: visita esquerda, raiz e direita; numa ABB, produz as chaves ordenadas.
- **Fator de balanceamento**: diferença entre as alturas das subárvores esquerda e direita de um nó.
- **Rotação**: reorganização local de nós que restaura o balanceamento de uma AVL.`
    },
    MAPA_MENTAL: {
      trechos: [0, 1, 4, 7],
      conteudo: `mindmap
  root((Estruturas de Dados))
    Lineares
      Pilha LIFO
      Fila FIFO
      Lista encadeada
      Vetor
    Árvores
      Árvore binária de busca
        Custo depende da altura
        Percurso em ordem
      AVL
        Fator entre -1 e 1
        Rotações`
    }
  },
  chat: {
    tutor: [
      {
        trechos: [0, 1],
        conteudo:
          'Boa pergunta! Antes de eu responder, pense comigo: se você empilha os livros A, B e C, nessa ordem, **qual livro sai primeiro** quando você retira um? 🤔\n\nAgora compare com uma fila de banco: quem é atendido primeiro? Tente me dizer, com suas palavras, a diferença entre as duas estruturas.'
      },
      {
        trechos: [4, 5],
        conteudo:
          'Vamos por partes. Imagine uma ABB com raiz **20** e filho esquerdo **10**. Onde ficaria a chave **15**?\n\n1. Compare 15 com a raiz.\n2. Desça para o lado indicado.\n3. Repita até encontrar uma posição vazia.\n\nQual caminho você seguiria? Me conte e conferimos juntos.'
      },
      {
        trechos: [2, 3],
        conteudo:
          'Pense em um caso concreto: você precisa acessar o **milésimo** elemento de uma coleção. Em qual estrutura você chega lá direto, e em qual precisa passar por todos os anteriores?\n\nCom essa resposta, você consegue dizer qual delas tem acesso por índice mais barato?'
      }
    ],
    explicacao: [
      {
        trechos: [0, 1],
        conteudo:
          'A diferença está na **ordem de remoção**:\n\n| | Pilha | Fila |\n|---|---|---|\n| Política | LIFO | FIFO |\n| Inserção | push (topo) | enqueue (fim) |\n| Remoção | pop (topo) | dequeue (início) |\n| Custo | $O(1)$ | $O(1)$ |\n\nUse pilha quando o mais recente deve ser tratado primeiro (desfazer ações, chamadas de função) e fila quando a ordem de chegada importa (atendimento, impressão).'
      },
      {
        trechos: [4, 5],
        conteudo: m`Na ABB, a busca compara a chave procurada com o nó atual e desce para a esquerda se ela for menor ou para a direita se for maior. Cada comparação desce um nível, então o custo é $O(h)$, onde $h$ é a altura.

- Árvore balanceada: $h = O(\log n)$.
- Inserções em ordem: a árvore vira uma lista e $h = O(n)$.

Por isso estruturas como a AVL rebalanceiam a árvore com rotações.`
      },
      {
        trechos: [2, 3],
        conteudo:
          'O **vetor** guarda os elementos em posições contíguas, então o endereço do elemento *i* é calculado diretamente: acesso em $O(1)$. A **lista encadeada** só conhece o próximo nó, então chegar ao elemento *i* exige percorrer *i* nós: $O(n)$.\n\nEm troca, a lista insere no início em $O(1)$, enquanto o vetor precisa deslocar elementos.'
      }
    ],
    dicas: [
      'Dica: preste atenção na **ordem de saída** dos elementos. É ela que diferencia LIFO de FIFO.',
      'Dica: o custo das operações em uma ABB depende da **altura** da árvore, não só da quantidade de nós.',
      'Dica: pense em **como o computador encontra** a posição *i*: ele calcula o endereço ou precisa caminhar até lá?'
    ]
  },
  explicacoesAlternativas: [
    'Pense em uma **pilha de pratos**: você sempre coloca e retira pelo topo. Já uma **fila de cinema** atende quem chegou primeiro. Essa diferença de “por onde sai” é o que separa as estruturas.',
    'Imagine uma **lista telefônica** (vetor): você abre direto na página certa. Agora imagine uma **caça ao tesouro** (lista encadeada): cada pista só diz onde está a próxima, então é preciso seguir todas até chegar ao destino.',
    'Uma ABB é como um jogo de **“maior ou menor”**: a cada pergunta você descarta metade das possibilidades, mas só se a árvore estiver equilibrada. Se ela virar uma fila indiana, você pergunta uma a uma.'
  ]
}
