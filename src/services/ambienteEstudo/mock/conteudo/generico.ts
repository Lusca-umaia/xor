import { PacoteConteudo } from './tipos'

/** Usado quando o nome do ambiente não corresponde a nenhuma área conhecida. */
export const pacoteGenerico: PacoteConteudo = {
  chave: 'generico',
  palavrasChave: /$^/,
  materiaisDemonstracao: [
    {
      nome: 'Material de apoio - Como aprender melhor.pdf',
      tipo: 'PDF',
      paginas: 14,
      tamanhoBytes: 760_000
    }
  ],
  trechos: [
    {
      material: 0,
      pagina: 2,
      texto:
        'A recuperação ativa consiste em tentar lembrar o conteúdo sem consultá-lo, por exemplo respondendo questões. Ela fortalece a memória mais do que reler o material.'
    },
    {
      material: 0,
      pagina: 4,
      texto:
        'A repetição espaçada distribui as revisões em intervalos crescentes. Revisar logo antes de esquecer consolida a memória de longo prazo.'
    },
    {
      material: 0,
      pagina: 6,
      texto:
        'A prática intercalada alterna tipos diferentes de problemas na mesma sessão, o que ajuda a reconhecer qual estratégia usar em cada situação.'
    },
    {
      material: 0,
      pagina: 8,
      texto:
        'A elaboração consiste em explicar com as próprias palavras por que e como algo funciona, conectando o conteúdo novo ao que já se sabe.'
    },
    {
      material: 0,
      pagina: 10,
      texto:
        'A curva do esquecimento, descrita por Ebbinghaus, mostra que a maior parte do que aprendemos é esquecida nos primeiros dias se não houver revisão.'
    },
    {
      material: 0,
      pagina: 12,
      texto:
        'Metacognição é a capacidade de monitorar o próprio aprendizado: perceber o que já se domina e o que ainda precisa de estudo.'
    }
  ],
  questoes: [
    {
      tipo: 'MULTIPLA_ESCOLHA',
      enunciado:
        'Qual estratégia fortalece mais a memória, segundo o material?',
      dificuldade: 'FACIL',
      topico: 'Recuperação ativa',
      trecho: 0,
      opcaoCorretaId: 'b',
      opcoes: [
        {
          id: 'a',
          texto: 'Reler o material várias vezes',
          justificativa:
            'A releitura dá sensação de familiaridade, mas pouco esforço de lembrança.'
        },
        {
          id: 'b',
          texto: 'Tentar lembrar o conteúdo sem consultá-lo',
          justificativa:
            'Essa é a recuperação ativa, que exige esforço e fortalece a memória.'
        },
        {
          id: 'c',
          texto: 'Grifar as partes importantes',
          justificativa: 'Grifar sozinho é uma atividade passiva.'
        },
        {
          id: 'd',
          texto: 'Estudar tudo na véspera da prova',
          justificativa:
            'Concentrar o estudo prejudica a retenção de longo prazo.'
        }
      ]
    },
    {
      tipo: 'MULTIPLA_ESCOLHA',
      enunciado: 'O que caracteriza a **repetição espaçada**?',
      dificuldade: 'FACIL',
      topico: 'Repetição espaçada',
      trecho: 1,
      opcaoCorretaId: 'c',
      opcoes: [
        {
          id: 'a',
          texto: 'Revisar tudo no mesmo dia, várias vezes',
          justificativa: 'Isso é prática concentrada, o oposto do espaçamento.'
        },
        {
          id: 'b',
          texto: 'Estudar um assunto por vez até dominá-lo',
          justificativa: 'Isso descreve prática em bloco.'
        },
        {
          id: 'c',
          texto: 'Revisar em intervalos cada vez maiores',
          justificativa:
            'Os intervalos crescem conforme a memória se consolida.'
        },
        {
          id: 'd',
          texto: 'Trocar de matéria a cada 5 minutos',
          justificativa: 'Trocar de assunto é intercalação, não espaçamento.'
        }
      ]
    },
    {
      tipo: 'MULTIPLA_ESCOLHA',
      enunciado: 'Para que serve a **prática intercalada**?',
      dificuldade: 'MEDIA',
      topico: 'Prática intercalada',
      trecho: 2,
      opcaoCorretaId: 'a',
      opcoes: [
        {
          id: 'a',
          texto: 'Aprender a escolher a estratégia certa para cada problema',
          justificativa:
            'Alternar tipos de problema obriga a decidir qual método usar.'
        },
        {
          id: 'b',
          texto: 'Reduzir o tempo total de estudo',
          justificativa:
            'O objetivo é a qualidade da aprendizagem, não o tempo.'
        },
        {
          id: 'c',
          texto: 'Evitar erros durante a prática',
          justificativa:
            'A intercalação costuma gerar mais erros no começo, e isso é produtivo.'
        },
        {
          id: 'd',
          texto: 'Memorizar fórmulas mais rápido',
          justificativa: 'O foco é a discriminação entre estratégias.'
        }
      ]
    },
    {
      tipo: 'MULTIPLA_ESCOLHA',
      enunciado: 'O que a **curva do esquecimento** mostra?',
      dificuldade: 'MEDIA',
      topico: 'Memória',
      trecho: 4,
      opcaoCorretaId: 'd',
      opcoes: [
        {
          id: 'a',
          texto: 'Que esquecemos de forma constante ao longo dos anos',
          justificativa: 'A queda é mais acentuada logo no início.'
        },
        {
          id: 'b',
          texto: 'Que o esquecimento não pode ser evitado',
          justificativa: 'A revisão reduz o esquecimento.'
        },
        {
          id: 'c',
          texto: 'Que só esquecemos o que não entendemos',
          justificativa: 'Mesmo o que foi entendido é esquecido sem revisão.'
        },
        {
          id: 'd',
          texto: 'Que a maior parte é esquecida nos primeiros dias sem revisão',
          justificativa:
            'Por isso as primeiras revisões são as mais importantes.'
        }
      ]
    },
    {
      tipo: 'MULTIPLA_ESCOLHA',
      enunciado: 'O que é **metacognição**?',
      dificuldade: 'DIFICIL',
      topico: 'Metacognição',
      trecho: 5,
      opcaoCorretaId: 'b',
      opcoes: [
        {
          id: 'a',
          texto: 'Memorizar grandes quantidades de informação',
          justificativa: 'Isso descreve capacidade de memória.'
        },
        {
          id: 'b',
          texto: 'Monitorar o próprio aprendizado',
          justificativa:
            'É perceber o que já domina e o que ainda precisa estudar.'
        },
        {
          id: 'c',
          texto: 'Estudar em grupo',
          justificativa: 'Estudar em grupo pode ajudar, mas não é a definição.'
        },
        {
          id: 'd',
          texto: 'Usar mapas mentais',
          justificativa: 'Mapas mentais são uma técnica de organização.'
        }
      ]
    },
    {
      tipo: 'VERDADEIRO_FALSO',
      enunciado:
        'Reler o material é mais eficaz do que responder questões sobre ele.',
      dificuldade: 'FACIL',
      topico: 'Recuperação ativa',
      trecho: 0,
      resposta: false,
      justificativa:
        'Responder questões é recuperação ativa, que fortalece mais a memória.'
    },
    {
      tipo: 'VERDADEIRO_FALSO',
      enunciado:
        'Explicar um conteúdo com as próprias palavras é uma forma de elaboração.',
      dificuldade: 'FACIL',
      topico: 'Elaboração',
      trecho: 3,
      resposta: true,
      justificativa: 'A elaboração conecta o conteúdo novo ao que você já sabe.'
    },
    {
      tipo: 'VERDADEIRO_FALSO',
      enunciado:
        'Na repetição espaçada, os intervalos entre revisões diminuem com o tempo.',
      dificuldade: 'MEDIA',
      topico: 'Repetição espaçada',
      trecho: 1,
      resposta: false,
      justificativa:
        'Os intervalos aumentam à medida que a memória se consolida.'
    },
    {
      tipo: 'LACUNAS',
      enunciado: 'Complete com o nome da técnica.',
      dificuldade: 'FACIL',
      topico: 'Recuperação ativa',
      trecho: 0,
      texto: 'Tentar lembrar o conteúdo sem consultá-lo é chamado de {{l1}}.',
      lacunas: [
        {
          id: 'l1',
          respostasAceitas: ['recuperação ativa', 'recuperacao ativa']
        }
      ],
      justificativa: 'A recuperação ativa exige esforço de lembrança.'
    },
    {
      tipo: 'LACUNAS',
      enunciado: 'Complete com o nome do pesquisador.',
      dificuldade: 'MEDIA',
      topico: 'Memória',
      trecho: 4,
      texto: 'A curva do esquecimento foi descrita por {{l1}}.',
      lacunas: [
        { id: 'l1', respostasAceitas: ['Ebbinghaus', 'Hermann Ebbinghaus'] }
      ],
      justificativa:
        'Hermann Ebbinghaus estudou a memória no fim do século XIX.'
    },
    {
      tipo: 'DISCURSIVA',
      enunciado:
        'Monte um plano de estudo de uma semana para uma prova usando **recuperação ativa** e **repetição espaçada**. Justifique cada escolha.',
      dificuldade: 'MEDIA',
      topico: 'Planejamento',
      trecho: 1,
      rubrica: [
        {
          id: 'c1',
          descricao:
            'Inclui atividades de recuperação ativa (questões, flashcards, explicar sem consultar).',
          pontos: 3
        },
        {
          id: 'c2',
          descricao:
            'Distribui as revisões em intervalos crescentes ao longo da semana.',
          pontos: 3
        },
        {
          id: 'c3',
          descricao: 'Justifica as escolhas com base nas técnicas.',
          pontos: 2
        },
        {
          id: 'c4',
          descricao: 'Apresenta o plano de forma organizada.',
          pontos: 2
        }
      ],
      respostaModelo:
        'Dia 1: estudo o conteúdo novo e, no fim, respondo 10 questões sem consultar. Dia 2: revisão com flashcards dos pontos que errei. Dia 4: novo bloco de questões misturando os tópicos. Dia 7: simulado completo. Os intervalos crescentes (1, 2 e 3 dias) seguem a repetição espaçada, e as questões e flashcards são recuperação ativa, que fortalece mais a memória do que reler.'
    }
  ],
  flashcards: [
    {
      frente: 'O que é recuperação ativa?',
      verso:
        'Tentar lembrar o conteúdo sem consultá-lo, por exemplo respondendo questões.',
      trecho: 0
    },
    {
      frente: 'O que é repetição espaçada?',
      verso: 'Revisar em intervalos crescentes, logo antes de esquecer.',
      trecho: 1
    },
    {
      frente: 'O que é prática intercalada?',
      verso: 'Alternar tipos diferentes de problemas na mesma sessão.',
      trecho: 2
    },
    {
      frente: 'O que é elaboração?',
      verso: 'Explicar com as próprias palavras por que e como algo funciona.',
      trecho: 3
    },
    {
      frente: 'O que é metacognição?',
      verso: 'Monitorar o próprio aprendizado: o que já domino e o que falta.',
      trecho: 5
    }
  ],
  resumos: {
    TOPICOS: {
      trechos: [0, 1, 2, 3, 4, 5],
      conteudo: `## Técnicas com evidência de eficácia
- **Recuperação ativa:** lembrar sem consultar (questões, flashcards).
- **Repetição espaçada:** revisões em intervalos crescentes.
- **Prática intercalada:** alternar tipos de problema.
- **Elaboração:** explicar com as próprias palavras.

## Por que funcionam
- A **curva do esquecimento** mostra perda rápida nos primeiros dias sem revisão.
- A **metacognição** ajuda a decidir o que estudar a seguir.`
    },
    CORRIDO: {
      trechos: [0, 1, 4, 5],
      conteudo:
        'Aprender bem depende menos do tempo gasto e mais de **como** se estuda. Tentar lembrar o conteúdo sem consultá-lo, a chamada recuperação ativa, fortalece a memória mais do que reler. Distribuir essas tentativas em intervalos crescentes aproveita a curva do esquecimento: revisar logo antes de esquecer consolida o conhecimento. Por fim, acompanhar o próprio progresso, a metacognição, permite investir o tempo naquilo que ainda não se domina.'
    },
    GLOSSARIO: {
      trechos: [0, 1, 2, 3, 4, 5],
      conteudo: `- **Recuperação ativa**: esforço de lembrar sem consultar o material.
- **Repetição espaçada**: revisões distribuídas em intervalos crescentes.
- **Prática intercalada**: alternância de tipos de problema numa sessão.
- **Elaboração**: explicação do conteúdo com as próprias palavras.
- **Curva do esquecimento**: perda de memória ao longo do tempo sem revisão.
- **Metacognição**: monitoramento do próprio aprendizado.`
    },
    MAPA_MENTAL: {
      trechos: [0, 1, 2, 5],
      conteudo: `mindmap
  root((Aprender melhor))
    Recuperação ativa
      Questões
      Flashcards
    Repetição espaçada
      Curva do esquecimento
    Prática intercalada
    Elaboração
    Metacognição`
    }
  },
  chat: {
    tutor: [
      {
        trechos: [0],
        conteudo:
          'Vamos descobrir juntos. Sem olhar o material, tente me explicar em duas ou três frases a ideia principal do conteúdo. Depois comparamos com a fonte e vemos o que ficou de fora. 😉'
      },
      {
        trechos: [5],
        conteudo:
          'Pergunta rápida: de 0 a 10, quanto você acha que domina esse assunto? Agora responda uma questão sobre ele. Sua nota bateu com a sua estimativa? Essa comparação é ótima para decidir o que estudar a seguir.'
      }
    ],
    explicacao: [
      {
        trechos: [0, 1],
        conteudo:
          'As duas técnicas com mais evidência são:\n\n1. **Recuperação ativa:** responder questões ou flashcards sem consultar o material.\n2. **Repetição espaçada:** revisar em intervalos crescentes (1 dia, 3 dias, 1 semana...).\n\nCombinadas, elas aproveitam a curva do esquecimento e consolidam a memória de longo prazo.'
      },
      {
        trechos: [3],
        conteudo:
          'Para entender de verdade, use a **elaboração**: explique com suas palavras **por que** e **como** o conceito funciona e relacione com algo que você já sabe. Se travar em algum ponto, é exatamente ali que vale voltar ao material.'
      }
    ],
    dicas: [
      'Dica: tente responder **sem consultar** o material primeiro.',
      'Dica: pense em **quando** você revisou esse assunto pela última vez.'
    ]
  },
  explicacoesAlternativas: [
    'Pense na memória como uma **trilha na mata**: cada vez que você a percorre (lembra), ela fica mais marcada. Reler é olhar a trilha de longe; lembrar é caminhar por ela.',
    'Revisar no momento certo é como **regar uma planta**: regar tudo de uma vez não adianta, mas regar um pouco antes de secar mantém a planta viva.'
  ]
}
