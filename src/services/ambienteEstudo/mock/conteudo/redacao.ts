import { PacoteConteudo } from './tipos'

export const pacoteRedacao: PacoteConteudo = {
  chave: 'redacao',
  palavrasChave:
    /texto|leitura|reda|portug|letra|lingu|filosof|comunica|escrita|literat/,
  materiaisDemonstracao: [
    {
      nome: 'Texto 1 - Coesão e Coerência.pdf',
      tipo: 'PDF',
      paginas: 10,
      tamanhoBytes: 620_000
    },
    {
      nome: 'Guia - Texto Dissertativo-Argumentativo.docx',
      tipo: 'DOCX',
      paginas: 6,
      tamanhoBytes: 210_000
    }
  ],
  trechos: [
    {
      material: 0,
      pagina: 2,
      texto:
        'Coesão é a conexão entre as partes do texto, feita por mecanismos linguísticos como pronomes, conjunções e sinônimos. Coerência é a unidade de sentido: as ideias precisam ser compatíveis entre si e com o mundo.'
    },
    {
      material: 0,
      pagina: 4,
      texto:
        'A coesão referencial retoma ou antecipa termos do texto por meio de pronomes, sinônimos, hiperônimos e elipses, evitando repetições.'
    },
    {
      material: 0,
      pagina: 6,
      texto:
        'A coesão sequencial estabelece relações lógicas entre orações e parágrafos por meio de conectivos: adição (além disso), oposição (no entanto), causa (porque) e conclusão (portanto).'
    },
    {
      material: 0,
      pagina: 8,
      texto:
        'Um texto pode ser coeso e, ainda assim, incoerente: os conectivos estão corretos, mas as ideias se contradizem.'
    },
    {
      material: 1,
      pagina: 1,
      texto:
        'O texto dissertativo-argumentativo apresenta uma tese, o ponto de vista defendido, e a sustenta com argumentos organizados em introdução, desenvolvimento e conclusão.'
    },
    {
      material: 1,
      pagina: 3,
      texto:
        'Cada parágrafo de desenvolvimento deve conter um tópico frasal, que anuncia a ideia central, seguido de fundamentação: dados, exemplos, citações de autoridade ou relações de causa e consequência.'
    },
    {
      material: 1,
      pagina: 4,
      texto:
        'O argumento por autoridade recorre à opinião de um especialista reconhecido; o argumento por exemplificação usa casos concretos; o argumento por dados estatísticos apoia-se em números de fontes confiáveis.'
    },
    {
      material: 1,
      pagina: 5,
      texto:
        'A conclusão retoma a tese e pode propor uma intervenção, indicando agente, ação, meio e finalidade.'
    }
  ],
  questoes: [
    {
      tipo: 'MULTIPLA_ESCOLHA',
      enunciado: 'Qual conectivo expressa **oposição**?',
      dificuldade: 'FACIL',
      topico: 'Coesão sequencial',
      trecho: 2,
      opcaoCorretaId: 'a',
      opcoes: [
        {
          id: 'a',
          texto: 'No entanto',
          justificativa: 'Introduz uma ideia que contrasta com a anterior.'
        },
        {
          id: 'b',
          texto: 'Além disso',
          justificativa: 'Expressa adição de argumentos.'
        },
        {
          id: 'c',
          texto: 'Portanto',
          justificativa: 'Expressa conclusão.'
        },
        {
          id: 'd',
          texto: 'Porque',
          justificativa: 'Expressa causa.'
        }
      ]
    },
    {
      tipo: 'MULTIPLA_ESCOLHA',
      enunciado:
        'Em “Maria chegou cedo. **Ela** queria pegar um bom lugar.”, o pronome destacado é um exemplo de:',
      dificuldade: 'FACIL',
      topico: 'Coesão referencial',
      trecho: 1,
      opcaoCorretaId: 'b',
      opcoes: [
        {
          id: 'a',
          texto: 'Coesão sequencial',
          justificativa:
            'A coesão sequencial liga ideias por conectivos, não por retomada de termos.'
        },
        {
          id: 'b',
          texto: 'Coesão referencial',
          justificativa: '“Ela” retoma “Maria”, evitando a repetição do nome.'
        },
        {
          id: 'c',
          texto: 'Incoerência',
          justificativa:
            'As ideias são compatíveis entre si; não há contradição.'
        },
        {
          id: 'd',
          texto: 'Argumento por autoridade',
          justificativa: 'Não há citação de especialista no trecho.'
        }
      ]
    },
    {
      tipo: 'MULTIPLA_ESCOLHA',
      enunciado: 'O que é a **tese** em um texto dissertativo-argumentativo?',
      dificuldade: 'FACIL',
      topico: 'Estrutura dissertativa',
      trecho: 4,
      opcaoCorretaId: 'c',
      opcoes: [
        {
          id: 'a',
          texto: 'O resumo do texto, apresentado na conclusão',
          justificativa:
            'A conclusão retoma a tese, mas a tese não é um resumo.'
        },
        {
          id: 'b',
          texto: 'Um dado estatístico que abre a introdução',
          justificativa:
            'Dados podem fundamentar argumentos, mas não são a tese.'
        },
        {
          id: 'c',
          texto: 'O ponto de vista que o autor defende',
          justificativa: 'Todo o texto se organiza para sustentar essa posição.'
        },
        {
          id: 'd',
          texto: 'O título do texto',
          justificativa:
            'O título pode sugerir o tema, mas não expressa a tese.'
        }
      ]
    },
    {
      tipo: 'MULTIPLA_ESCOLHA',
      enunciado:
        '“Segundo a OMS, a depressão afeta mais de 300 milhões de pessoas.” Que tipo de argumento é esse?',
      dificuldade: 'MEDIA',
      topico: 'Tipos de argumento',
      trecho: 6,
      opcaoCorretaId: 'd',
      opcoes: [
        {
          id: 'a',
          texto: 'Exemplificação',
          justificativa:
            'Exemplificação narra casos concretos, não números agregados.'
        },
        {
          id: 'b',
          texto: 'Causa e consequência',
          justificativa: 'O trecho não estabelece relação causal.'
        },
        {
          id: 'c',
          texto: 'Analogia',
          justificativa: 'Não há comparação entre situações.'
        },
        {
          id: 'd',
          texto: 'Dados estatísticos de fonte confiável',
          justificativa:
            'O número vem de uma instituição reconhecida (que também reforça a autoridade).'
        }
      ]
    },
    {
      tipo: 'MULTIPLA_ESCOLHA',
      enunciado: 'Qual é a função do **tópico frasal**?',
      dificuldade: 'MEDIA',
      topico: 'Estrutura dissertativa',
      trecho: 5,
      opcaoCorretaId: 'a',
      opcoes: [
        {
          id: 'a',
          texto: 'Anunciar a ideia central do parágrafo',
          justificativa:
            'O tópico frasal orienta o leitor sobre o que será desenvolvido em seguida.'
        },
        {
          id: 'b',
          texto: 'Encerrar o texto com uma proposta',
          justificativa: 'Essa é uma função da conclusão.'
        },
        {
          id: 'c',
          texto: 'Substituir os conectivos',
          justificativa: 'Os conectivos continuam necessários para a coesão.'
        },
        {
          id: 'd',
          texto: 'Citar a bibliografia usada',
          justificativa: 'Referências não fazem parte do tópico frasal.'
        }
      ]
    },
    {
      tipo: 'MULTIPLA_ESCOLHA',
      enunciado:
        'Uma proposta de intervenção completa, segundo o guia, deve indicar:',
      dificuldade: 'DIFICIL',
      topico: 'Conclusão',
      trecho: 7,
      opcaoCorretaId: 'b',
      opcoes: [
        {
          id: 'a',
          texto: 'Tema, tese e título',
          justificativa: 'Esses elementos pertencem à introdução.'
        },
        {
          id: 'b',
          texto: 'Agente, ação, meio e finalidade',
          justificativa:
            'Quem faz, o que faz, como faz e para quê: esses elementos tornam a proposta concreta.'
        },
        {
          id: 'c',
          texto: 'Dados, exemplos e citações',
          justificativa: 'São estratégias de fundamentação do desenvolvimento.'
        },
        {
          id: 'd',
          texto: 'Apenas a retomada da tese',
          justificativa:
            'A retomada é importante, mas não constitui uma intervenção.'
        }
      ]
    },
    {
      tipo: 'VERDADEIRO_FALSO',
      enunciado: 'Um texto coeso é sempre coerente.',
      dificuldade: 'MEDIA',
      topico: 'Coesão e coerência',
      trecho: 3,
      resposta: false,
      justificativa:
        'É possível usar conectivos corretamente e, ainda assim, apresentar ideias contraditórias.'
    },
    {
      tipo: 'VERDADEIRO_FALSO',
      enunciado: '“Portanto” é um conectivo de conclusão.',
      dificuldade: 'FACIL',
      topico: 'Coesão sequencial',
      trecho: 2,
      resposta: true,
      justificativa: 'Introduz a consequência lógica do que foi dito antes.'
    },
    {
      tipo: 'VERDADEIRO_FALSO',
      enunciado:
        'O uso de sinônimos para retomar um termo é um recurso de coesão referencial.',
      dificuldade: 'FACIL',
      topico: 'Coesão referencial',
      trecho: 1,
      resposta: true,
      justificativa: 'Sinônimos retomam o termo e evitam repetições.'
    },
    {
      tipo: 'VERDADEIRO_FALSO',
      enunciado:
        'A conclusão do texto dissertativo-argumentativo deve apresentar uma nova tese.',
      dificuldade: 'MEDIA',
      topico: 'Conclusão',
      trecho: 7,
      resposta: false,
      justificativa:
        'A conclusão retoma a tese já defendida; uma tese nova quebraria a coerência.'
    },
    {
      tipo: 'LACUNAS',
      enunciado: 'Complete com os conceitos.',
      dificuldade: 'FACIL',
      topico: 'Coesão e coerência',
      trecho: 0,
      texto:
        'A {{l1}} é a conexão entre as partes do texto, enquanto a {{l2}} é a unidade de sentido.',
      lacunas: [
        { id: 'l1', respostasAceitas: ['coesão', 'coesao'] },
        { id: 'l2', respostasAceitas: ['coerência', 'coerencia'] }
      ],
      justificativa:
        'Coesão trata das ligações linguísticas; coerência, da compatibilidade das ideias.'
    },
    {
      tipo: 'LACUNAS',
      enunciado: 'Complete com o tipo de relação.',
      dificuldade: 'MEDIA',
      topico: 'Coesão sequencial',
      trecho: 2,
      texto:
        'O conectivo “além disso” expressa {{l1}}, e “porque” expressa {{l2}}.',
      lacunas: [
        { id: 'l1', respostasAceitas: ['adição', 'adicao', 'acréscimo'] },
        { id: 'l2', respostasAceitas: ['causa', 'causalidade', 'explicação'] }
      ],
      justificativa:
        '“Além disso” acrescenta um argumento; “porque” introduz a causa.'
    },
    {
      tipo: 'LACUNAS',
      enunciado: 'Complete a estrutura do parágrafo.',
      dificuldade: 'MEDIA',
      topico: 'Estrutura dissertativa',
      trecho: 5,
      texto:
        'Cada parágrafo de desenvolvimento começa com um {{l1}}, seguido de fundamentação.',
      lacunas: [
        { id: 'l1', respostasAceitas: ['tópico frasal', 'topico frasal'] }
      ],
      justificativa:
        'O tópico frasal anuncia a ideia que o parágrafo vai desenvolver.'
    },
    {
      tipo: 'DISCURSIVA',
      enunciado:
        'Explique a diferença entre **coesão** e **coerência** e dê um exemplo de frase coesa, porém incoerente.',
      dificuldade: 'MEDIA',
      topico: 'Coesão e coerência',
      trecho: 3,
      rubrica: [
        {
          id: 'c1',
          descricao:
            'Define coesão como a ligação linguística entre as partes.',
          pontos: 3
        },
        {
          id: 'c2',
          descricao:
            'Define coerência como a unidade e compatibilidade de sentido.',
          pontos: 3
        },
        {
          id: 'c3',
          descricao: 'Apresenta um exemplo válido de frase coesa e incoerente.',
          pontos: 2
        },
        { id: 'c4', descricao: 'Escreve com clareza e correção.', pontos: 2 }
      ],
      respostaModelo:
        'Coesão é a conexão entre as partes do texto, construída com pronomes, sinônimos e conectivos. Coerência é a unidade de sentido: as ideias precisam ser compatíveis entre si e com o mundo. Um texto pode ser coeso e incoerente, como em “Choveu muito durante toda a manhã; portanto, o chão continuou seco.” O conectivo está bem empregado, mas a conclusão contradiz a premissa.'
    },
    {
      tipo: 'DISCURSIVA',
      enunciado:
        'Escreva um parágrafo de desenvolvimento sobre o uso de IA na universidade, com **tópico frasal** e pelo menos um **argumento** identificável.',
      dificuldade: 'DIFICIL',
      topico: 'Estrutura dissertativa',
      trecho: 5,
      rubrica: [
        {
          id: 'c1',
          descricao: 'Apresenta um tópico frasal claro no início do parágrafo.',
          pontos: 3
        },
        {
          id: 'c2',
          descricao:
            'Fundamenta com um tipo de argumento identificável (dado, exemplo, autoridade ou causa e consequência).',
          pontos: 3
        },
        {
          id: 'c3',
          descricao: 'Usa conectivos adequados para ligar as ideias.',
          pontos: 2
        },
        {
          id: 'c4',
          descricao: 'Mantém coerência com o tema proposto.',
          pontos: 2
        }
      ],
      respostaModelo:
        'A inteligência artificial pode ampliar a autonomia dos estudantes, desde que usada com senso crítico. Ferramentas que geram exercícios a partir do material da disciplina permitem que o aluno pratique no próprio ritmo e identifique suas lacunas antes das avaliações. No entanto, esse benefício só se concretiza quando o estudante verifica as fontes e não delega o raciocínio à máquina. Portanto, a universidade deve orientar o uso dessas ferramentas, e não apenas proibi-las ou liberá-las sem critério.'
    }
  ],
  flashcards: [
    {
      frente: 'Coesão × coerência',
      verso:
        'Coesão: ligações linguísticas entre as partes. Coerência: unidade e compatibilidade de sentido.',
      trecho: 0
    },
    {
      frente: 'O que é coesão referencial?',
      verso:
        'Retomar ou antecipar termos com pronomes, sinônimos, hiperônimos ou elipses.',
      trecho: 1
    },
    {
      frente: 'Conectivos de oposição',
      verso: 'No entanto, porém, contudo, todavia, entretanto.',
      trecho: 2
    },
    {
      frente: 'O que é a tese?',
      verso: 'O ponto de vista defendido pelo autor ao longo do texto.',
      trecho: 4
    },
    {
      frente: 'Função do tópico frasal',
      verso: 'Anunciar a ideia central do parágrafo de desenvolvimento.',
      trecho: 5
    },
    {
      frente: 'Elementos de uma proposta de intervenção',
      verso: 'Agente, ação, meio e finalidade.',
      trecho: 7
    }
  ],
  resumos: {
    TOPICOS: {
      trechos: [0, 1, 2, 3, 4, 5, 6, 7],
      conteudo: `## Coesão e coerência
- **Coesão:** ligação entre as partes do texto por pronomes, sinônimos e conectivos.
- **Coerência:** unidade de sentido; as ideias não podem se contradizer.
- Um texto pode ser **coeso e incoerente**.

### Tipos de coesão
- **Referencial:** retoma termos (pronomes, sinônimos, hiperônimos, elipse).
- **Sequencial:** relaciona ideias por conectivos.

| Relação | Conectivos |
|---|---|
| Adição | além disso, também |
| Oposição | no entanto, porém |
| Causa | porque, pois |
| Conclusão | portanto, logo |

## Texto dissertativo-argumentativo
- **Introdução:** apresenta o tema e a tese.
- **Desenvolvimento:** tópico frasal + fundamentação (dados, exemplos, autoridade, causa e consequência).
- **Conclusão:** retoma a tese e propõe intervenção (agente, ação, meio, finalidade).`
    },
    CORRIDO: {
      trechos: [0, 3, 4, 5, 7],
      conteudo: `Um bom texto depende de duas qualidades complementares. A **coesão** diz respeito às ligações visíveis entre as partes, como pronomes que retomam termos e conectivos que indicam relações de adição, oposição, causa ou conclusão. A **coerência** diz respeito ao sentido: as ideias precisam ser compatíveis entre si. Por isso, um texto pode estar bem amarrado e, ainda assim, ser incoerente.

No texto dissertativo-argumentativo, essas qualidades sustentam uma **tese**. A introdução apresenta o ponto de vista; cada parágrafo de desenvolvimento abre com um tópico frasal e o fundamenta com dados, exemplos ou argumentos de autoridade; a conclusão retoma a tese e pode propor uma intervenção concreta, indicando quem age, o que faz, por qual meio e com que finalidade.`
    },
    GLOSSARIO: {
      trechos: [0, 1, 2, 4, 5, 6, 7],
      conteudo: `- **Coesão**: conexão linguística entre as partes do texto.
- **Coerência**: unidade e compatibilidade de sentido entre as ideias.
- **Coesão referencial**: retomada de termos por pronomes, sinônimos, hiperônimos ou elipse.
- **Coesão sequencial**: encadeamento de ideias por conectivos.
- **Conectivo**: palavra ou expressão que estabelece relação lógica entre ideias.
- **Tese**: ponto de vista defendido no texto.
- **Tópico frasal**: frase que anuncia a ideia central de um parágrafo.
- **Argumento por autoridade**: fundamentação baseada na opinião de especialista reconhecido.
- **Proposta de intervenção**: solução que indica agente, ação, meio e finalidade.`
    },
    MAPA_MENTAL: {
      trechos: [0, 2, 4, 7],
      conteudo: `mindmap
  root((Produção de Texto))
    Coesão
      Referencial
        Pronomes
        Sinônimos
      Sequencial
        Conectivos
    Coerência
      Unidade de sentido
    Dissertação
      Introdução e tese
      Desenvolvimento
        Tópico frasal
        Argumentos
      Conclusão
        Intervenção`
    }
  },
  chat: {
    tutor: [
      {
        trechos: [0, 3],
        conteudo:
          'Vamos testar a ideia com um exemplo. Leia esta frase:\n\n> “Estudei a semana inteira; **portanto**, não sabia nada da matéria.”\n\nO conectivo está bem empregado do ponto de vista gramatical? E a ideia faz sentido? Com base nisso, como você explicaria a diferença entre coesão e coerência?'
      },
      {
        trechos: [5, 6],
        conteudo:
          'Antes de escrever o parágrafo, responda para si mesmo:\n\n1. Qual é a **única ideia** que este parágrafo vai defender?\n2. Que **prova** você tem para ela: um dado, um exemplo ou a fala de um especialista?\n\nEscreva só o tópico frasal primeiro e me mostre. Eu te ajudo a fundamentá-lo.'
      }
    ],
    explicacao: [
      {
        trechos: [0, 3],
        conteudo:
          '**Coesão** é a costura do texto: pronomes, sinônimos e conectivos que ligam as partes. **Coerência** é o sentido: as ideias precisam combinar entre si.\n\nExemplo coeso e incoerente:\n\n> “Estudei a semana inteira; portanto, não sabia nada da matéria.”\n\nO “portanto” está gramaticalmente correto, mas a conclusão contradiz a premissa.'
      },
      {
        trechos: [4, 5, 7],
        conteudo:
          'Estrutura do texto dissertativo-argumentativo:\n\n| Parte | Função |\n|---|---|\n| Introdução | Apresenta o tema e a **tese** |\n| Desenvolvimento | Tópico frasal + argumentos |\n| Conclusão | Retoma a tese e propõe **intervenção** |\n\nNa intervenção, indique **agente, ação, meio e finalidade**.'
      }
    ],
    dicas: [
      'Dica: pergunte-se se as ideias **combinam** entre si, independentemente dos conectivos usados.',
      'Dica: comece pelo **tópico frasal** e só depois pense nos argumentos que o sustentam.',
      'Dica: na conclusão, responda: **quem** deve agir, **o quê** fazer, **como** e **para quê**?'
    ]
  },
  explicacoesAlternativas: [
    'Pense em um **colar**: a coesão é o fio que liga as contas; a coerência é o desenho que elas formam juntas. Um fio perfeito não salva um desenho sem sentido.',
    'O texto dissertativo é como um **julgamento**: a tese é o que você quer provar, os argumentos são as provas e a conclusão é o veredito com uma recomendação.',
    'Conectivos são **placas de trânsito** do texto: “no entanto” avisa que vem uma curva, “portanto” avisa que você chegou ao destino.'
  ]
}
