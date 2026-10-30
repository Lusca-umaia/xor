import { m, PacoteConteudo } from './tipos'

export const pacoteCalculo: PacoteConteudo = {
  chave: 'calculo',
  palavrasChave: /calcul|matem|deriv|integr|fisic|algebra|estat|serie/,
  materiaisDemonstracao: [
    {
      nome: 'Lista 2 - Técnicas de Integração.pdf',
      tipo: 'PDF',
      paginas: 12,
      tamanhoBytes: 980_000
    },
    {
      nome: 'Notas de aula - Séries.pdf',
      tipo: 'PDF',
      paginas: 20,
      tamanhoBytes: 1_450_000
    }
  ],
  trechos: [
    {
      material: 0,
      pagina: 2,
      texto: m`Integração por partes: $\int u\,dv = uv - \int v\,du$. Uma boa escolha de $u$ segue a ordem LIATE: logarítmicas, inversas trigonométricas, algébricas, trigonométricas e exponenciais.`
    },
    {
      material: 0,
      pagina: 5,
      texto: m`Na substituição $u = g(x)$, temos $du = g'(x)\,dx$, e a integral $\int f(g(x))\,g'(x)\,dx$ torna-se $\int f(u)\,du$.`
    },
    {
      material: 0,
      pagina: 8,
      texto: m`A integral imprópria $\int_1^{\infty} \frac{1}{x^p}\,dx$ converge se, e somente se, $p > 1$.`
    },
    {
      material: 0,
      pagina: 10,
      texto:
        'Frações parciais decompõem uma função racional própria em uma soma de frações mais simples, cujos denominadores são os fatores do denominador original.'
    },
    {
      material: 1,
      pagina: 3,
      texto: m`A série geométrica $\sum_{n=0}^{\infty} ar^n$ converge para $\frac{a}{1-r}$ quando $|r| < 1$ e diverge quando $|r| \geq 1$.`
    },
    {
      material: 1,
      pagina: 7,
      texto: m`Teste do termo geral: se $\lim_{n\to\infty} a_n \neq 0$, então $\sum a_n$ diverge. A recíproca é falsa: na série harmônica $a_n \to 0$ e, mesmo assim, ela diverge.`
    },
    {
      material: 1,
      pagina: 12,
      texto: m`A série-$p$ $\sum \frac{1}{n^p}$ converge se $p > 1$ e diverge se $p \leq 1$.`
    },
    {
      material: 1,
      pagina: 16,
      texto: m`Teste da razão: seja $L = \lim_{n\to\infty} \left|\frac{a_{n+1}}{a_n}\right|$. Se $L < 1$, a série converge absolutamente; se $L > 1$, diverge; se $L = 1$, o teste é inconclusivo.`
    }
  ],
  questoes: [
    {
      tipo: 'MULTIPLA_ESCOLHA',
      enunciado: m`Usando integração por partes, qual é o valor de $\int x e^x\,dx$?`,
      dificuldade: 'MEDIA',
      topico: 'Integração por partes',
      trecho: 0,
      opcaoCorretaId: 'a',
      opcoes: [
        {
          id: 'a',
          texto: '$e^x(x - 1) + C$',
          justificativa: m`Com $u = x$ e $dv = e^x dx$: $xe^x - \int e^x dx = xe^x - e^x + C$.`
        },
        {
          id: 'b',
          texto: '$xe^x + C$',
          justificativa: m`Faltou subtrair $\int v\,du = \int e^x dx$.`
        },
        {
          id: 'c',
          texto: m`$\frac{x^2}{2}e^x + C$`,
          justificativa:
            'Integrar os dois fatores separadamente não é válido para um produto.'
        },
        {
          id: 'd',
          texto: '$e^x(x + 1) + C$',
          justificativa: m`O sinal está trocado: a fórmula é $uv - \int v\,du$.`
        }
      ]
    },
    {
      tipo: 'MULTIPLA_ESCOLHA',
      enunciado: m`Qual substituição é mais adequada para calcular $\int 2x\cos(x^2)\,dx$?`,
      dificuldade: 'FACIL',
      topico: 'Substituição',
      trecho: 1,
      opcaoCorretaId: 'a',
      opcoes: [
        {
          id: 'a',
          texto: '$u = x^2$',
          justificativa: m`Então $du = 2x\,dx$, e a integral vira $\int \cos u\,du$.`
        },
        {
          id: 'b',
          texto: m`$u = \cos x$`,
          justificativa: m`O argumento do cosseno é $x^2$, não $x$.`
        },
        {
          id: 'c',
          texto: '$u = 2x$',
          justificativa: m`$du = 2\,dx$ não elimina o $x^2$ dentro do cosseno.`
        },
        {
          id: 'd',
          texto: m`$u = \cos(x^2)$`,
          justificativa: m`$du = -2x\sin(x^2)\,dx$, que não aparece no integrando.`
        }
      ]
    },
    {
      tipo: 'MULTIPLA_ESCOLHA',
      enunciado: m`Para quais valores de $p$ a integral $\int_1^{\infty} \frac{dx}{x^p}$ converge?`,
      dificuldade: 'MEDIA',
      topico: 'Integrais impróprias',
      trecho: 2,
      opcaoCorretaId: 'a',
      opcoes: [
        {
          id: 'a',
          texto: '$p > 1$',
          justificativa: m`Para $p > 1$, $\frac{x^{1-p}}{1-p}$ tende a $0$ quando $x \to \infty$.`
        },
        {
          id: 'b',
          texto: m`$p \geq 1$`,
          justificativa: m`Em $p = 1$ a integral vale $\lim \ln x = \infty$.`
        },
        {
          id: 'c',
          texto: '$p < 1$',
          justificativa: m`Para $p < 1$, $x^{1-p} \to \infty$ e a integral diverge.`
        },
        {
          id: 'd',
          texto: 'Para todo $p > 0$',
          justificativa: m`O caso $0 < p \leq 1$ diverge.`
        }
      ]
    },
    {
      tipo: 'MULTIPLA_ESCOLHA',
      enunciado: m`Qual é a soma da série $\sum_{n=0}^{\infty} \left(\frac{1}{3}\right)^n$?`,
      dificuldade: 'FACIL',
      topico: 'Séries geométricas',
      trecho: 4,
      opcaoCorretaId: 'a',
      opcoes: [
        {
          id: 'a',
          texto: m`$\frac{3}{2}$`,
          justificativa: m`$\frac{a}{1-r} = \frac{1}{1 - 1/3} = \frac{3}{2}$.`
        },
        {
          id: 'b',
          texto: m`$\frac{1}{3}$`,
          justificativa: 'Esse é o valor da razão, não da soma.'
        },
        {
          id: 'c',
          texto: '$3$',
          justificativa: m`Seria a soma se a razão fosse $\frac{2}{3}$.`
        },
        {
          id: 'd',
          texto: 'A série diverge',
          justificativa: m`Como $|r| = \frac{1}{3} < 1$, a série converge.`
        }
      ]
    },
    {
      tipo: 'MULTIPLA_ESCOLHA',
      enunciado: m`Sobre a série harmônica $\sum \frac{1}{n}$, é correto afirmar que:`,
      dificuldade: 'MEDIA',
      topico: 'Testes de convergência',
      trecho: 5,
      opcaoCorretaId: 'a',
      opcoes: [
        {
          id: 'a',
          texto: m`Diverge, embora $\frac{1}{n} \to 0$`,
          justificativa:
            'É o contraexemplo clássico: termo geral tendendo a zero não garante convergência.'
        },
        {
          id: 'b',
          texto: 'Converge para $1$',
          justificativa:
            'As somas parciais crescem sem limite, como o logaritmo.'
        },
        {
          id: 'c',
          texto: 'Converge, pois o termo geral tende a zero',
          justificativa:
            'O teste do termo geral só serve para provar divergência, nunca convergência.'
        },
        {
          id: 'd',
          texto: 'Converge pelo teste da razão',
          justificativa: 'O teste da razão dá $L = 1$, que é inconclusivo.'
        }
      ]
    },
    {
      tipo: 'MULTIPLA_ESCOLHA',
      enunciado: m`Ao aplicar o teste da razão à série $\sum \frac{n!}{n^n}$, o que se conclui?`,
      dificuldade: 'DIFICIL',
      topico: 'Testes de convergência',
      trecho: 7,
      opcaoCorretaId: 'a',
      opcoes: [
        {
          id: 'a',
          texto: m`Converge, pois $L = \frac{1}{e} < 1$`,
          justificativa: m`$\frac{a_{n+1}}{a_n} = \left(\frac{n}{n+1}\right)^n \to \frac{1}{e}$.`
        },
        {
          id: 'b',
          texto: '$L = e$, logo diverge',
          justificativa: m`O limite de $\left(\frac{n}{n+1}\right)^n$ é $\frac{1}{e}$, não $e$.`
        },
        {
          id: 'c',
          texto: '$L = 1$, teste inconclusivo',
          justificativa: m`O limite é $\frac{1}{e} \approx 0{,}37$.`
        },
        {
          id: 'd',
          texto: 'Diverge pelo teste do termo geral',
          justificativa: m`$\frac{n!}{n^n} \to 0$, então esse teste não conclui nada.`
        }
      ]
    },
    {
      tipo: 'VERDADEIRO_FALSO',
      enunciado: m`A série $\sum \frac{1}{n^2}$ converge.`,
      dificuldade: 'FACIL',
      topico: 'Testes de convergência',
      trecho: 6,
      resposta: true,
      justificativa: 'É uma série-$p$ com $p = 2 > 1$.'
    },
    {
      tipo: 'VERDADEIRO_FALSO',
      enunciado: m`Se $a_n \to 0$, então $\sum a_n$ converge.`,
      dificuldade: 'MEDIA',
      topico: 'Testes de convergência',
      trecho: 5,
      resposta: false,
      justificativa:
        'A série harmônica é um contraexemplo: o termo geral tende a zero e a série diverge.'
    },
    {
      tipo: 'VERDADEIRO_FALSO',
      enunciado: m`A série geométrica de razão $r = 2$ converge para $\frac{a}{1-2}$.`,
      dificuldade: 'FACIL',
      topico: 'Séries geométricas',
      trecho: 4,
      resposta: false,
      justificativa: m`A fórmula $\frac{a}{1-r}$ só vale para $|r| < 1$; com $r = 2$ a série diverge.`
    },
    {
      tipo: 'VERDADEIRO_FALSO',
      enunciado: m`Na substituição $u = g(x)$, vale $du = g'(x)\,dx$.`,
      dificuldade: 'FACIL',
      topico: 'Substituição',
      trecho: 1,
      resposta: true,
      justificativa: 'É a regra da cadeia lida ao contrário.'
    },
    {
      tipo: 'LACUNAS',
      enunciado: 'Complete a fórmula da integração por partes.',
      dificuldade: 'FACIL',
      topico: 'Integração por partes',
      trecho: 0,
      texto: m`Na integração por partes, $\int u\,dv$ = {{l1}} $- \int v\,du$.`,
      lacunas: [{ id: 'l1', respostasAceitas: ['uv', 'u v', 'vu'] }],
      justificativa: m`A fórmula é $\int u\,dv = uv - \int v\,du$.`
    },
    {
      tipo: 'LACUNAS',
      enunciado: 'Complete o critério da série-$p$.',
      dificuldade: 'FACIL',
      topico: 'Testes de convergência',
      trecho: 6,
      texto: 'A série-$p$ converge quando $p$ é {{l1}} que 1.',
      lacunas: [
        { id: 'l1', respostasAceitas: ['maior', 'estritamente maior'] }
      ],
      justificativa: 'Converge para $p > 1$ e diverge para $p \\leq 1$.'
    },
    {
      tipo: 'LACUNAS',
      enunciado: 'Complete sobre o teste da razão.',
      dificuldade: 'MEDIA',
      topico: 'Testes de convergência',
      trecho: 7,
      texto: 'No teste da razão, se $L = 1$, o teste é {{l1}}.',
      lacunas: [
        { id: 'l1', respostasAceitas: ['inconclusivo', 'inconclusiva'] }
      ],
      justificativa:
        'Com $L = 1$ há séries que convergem e séries que divergem, então é preciso outro teste.'
    },
    {
      tipo: 'DISCURSIVA',
      enunciado: m`Explique quando é vantajoso usar integração por partes e resolva $\int x \ln x\,dx$, justificando a escolha de $u$ e $dv$.`,
      dificuldade: 'MEDIA',
      topico: 'Integração por partes',
      trecho: 0,
      rubrica: [
        {
          id: 'c1',
          descricao: 'Enuncia corretamente a fórmula de integração por partes.',
          pontos: 2
        },
        {
          id: 'c2',
          descricao: m`Escolhe $u = \ln x$ e $dv = x\,dx$ e justifica a escolha (LIATE ou derivada mais simples).`,
          pontos: 3
        },
        {
          id: 'c3',
          descricao: m`Chega a $\frac{x^2}{2}\ln x - \frac{x^2}{4} + C$.`,
          pontos: 3
        },
        {
          id: 'c4',
          descricao: 'Organiza os passos com clareza.',
          pontos: 2
        }
      ],
      respostaModelo: m`A integração por partes é útil quando o integrando é um produto em que um dos fatores fica mais simples ao ser derivado. Pela regra LIATE, escolhemos $u = \ln x$ (logarítmica) e $dv = x\,dx$. Assim, $du = \frac{1}{x}dx$ e $v = \frac{x^2}{2}$. Então $\int x\ln x\,dx = \frac{x^2}{2}\ln x - \int \frac{x^2}{2}\cdot\frac{1}{x}dx = \frac{x^2}{2}\ln x - \frac{x^2}{4} + C$.`
    },
    {
      tipo: 'DISCURSIVA',
      enunciado:
        'Diferencie o **teste do termo geral** do **teste da razão** e explique por que a série harmônica é um contraexemplo importante.',
      dificuldade: 'DIFICIL',
      topico: 'Testes de convergência',
      trecho: 5,
      rubrica: [
        {
          id: 'c1',
          descricao:
            'Explica que o teste do termo geral só prova divergência ($a_n \\not\\to 0$).',
          pontos: 3
        },
        {
          id: 'c2',
          descricao:
            'Descreve o teste da razão e os três casos ($L < 1$, $L > 1$, $L = 1$).',
          pontos: 3
        },
        {
          id: 'c3',
          descricao:
            'Usa a série harmônica para mostrar que $a_n \\to 0$ não garante convergência.',
          pontos: 2
        },
        { id: 'c4', descricao: 'Clareza e rigor na argumentação.', pontos: 2 }
      ],
      respostaModelo: m`O teste do termo geral diz que, se $\lim a_n \neq 0$, a série diverge; ele nunca prova convergência. O teste da razão calcula $L = \lim \left|\frac{a_{n+1}}{a_n}\right|$: se $L < 1$, converge absolutamente; se $L > 1$, diverge; se $L = 1$, não conclui. A série harmônica $\sum \frac{1}{n}$ tem termo geral tendendo a zero e, mesmo assim, diverge; além disso, o teste da razão dá $L = 1$. Ela mostra que nenhum dos dois testes basta sozinho.`
    }
  ],
  flashcards: [
    {
      frente: 'Fórmula da integração por partes',
      verso: m`$\int u\,dv = uv - \int v\,du$`,
      trecho: 0
    },
    {
      frente: 'O que significa LIATE?',
      verso:
        'Ordem de preferência para escolher $u$: Logarítmicas, Inversas trigonométricas, Algébricas, Trigonométricas, Exponenciais.',
      trecho: 0
    },
    {
      frente: m`Quando $\int_1^\infty \frac{dx}{x^p}$ converge?`,
      verso: 'Se, e somente se, $p > 1$.',
      trecho: 2
    },
    {
      frente: 'Soma da série geométrica',
      verso: m`$\sum_{n=0}^\infty ar^n = \frac{a}{1-r}$, para $|r| < 1$.`,
      trecho: 4
    },
    {
      frente: 'O teste do termo geral prova convergência?',
      verso: 'Não. Ele só prova divergência, quando $a_n$ não tende a zero.',
      trecho: 5
    },
    {
      frente: 'Teste da razão: o que significa $L = 1$?',
      verso: 'O teste é inconclusivo; é preciso usar outro critério.',
      trecho: 7
    }
  ],
  resumos: {
    TOPICOS: {
      trechos: [0, 1, 2, 4, 5, 6, 7],
      conteudo: m`## Técnicas de integração
- **Por partes:** $\int u\,dv = uv - \int v\,du$. Escolha $u$ pela ordem LIATE.
- **Substituição:** com $u = g(x)$ e $du = g'(x)\,dx$, $\int f(g(x))g'(x)\,dx = \int f(u)\,du$.
- **Frações parciais:** decompõem funções racionais próprias em frações simples.

## Integrais impróprias
- $\int_1^\infty \frac{dx}{x^p}$ converge $\iff p > 1$.

## Séries
- **Geométrica:** $\sum ar^n = \frac{a}{1-r}$ se $|r| < 1$; diverge se $|r| \geq 1$.
- **Série-$p$:** $\sum \frac{1}{n^p}$ converge se $p > 1$.
- **Termo geral:** se $a_n \not\to 0$, diverge. A recíproca é falsa (série harmônica).
- **Razão:** $L < 1$ converge, $L > 1$ diverge, $L = 1$ inconclusivo.

| Teste | Prova convergência? | Prova divergência? |
|---|---|---|
| Termo geral | Não | Sim |
| Razão | Sim ($L<1$) | Sim ($L>1$) |`
    },
    CORRIDO: {
      trechos: [0, 1, 4, 5, 7],
      conteudo: m`As técnicas de integração transformam integrais difíceis em outras mais simples. A **substituição** desfaz a regra da cadeia: ao escolher $u = g(x)$, o fator $g'(x)\,dx$ vira $du$. A **integração por partes**, $\int u\,dv = uv - \int v\,du$, é a regra do produto ao contrário e funciona melhor quando $u$ fica mais simples ao ser derivado, como orienta a regra LIATE.

No estudo das séries, a pergunta central é se a soma infinita tem um valor finito. A série geométrica é o caso mais simples: converge para $\frac{a}{1-r}$ quando $|r| < 1$. Para outras séries, usamos testes. O teste do termo geral só detecta divergência, e a série harmônica mostra que um termo geral que tende a zero não basta. O teste da razão compara termos consecutivos e decide a convergência quando o limite $L$ é diferente de $1$.`
    },
    GLOSSARIO: {
      trechos: [0, 1, 2, 4, 5, 6, 7],
      conteudo: m`- **Integração por partes**: técnica baseada em $\int u\,dv = uv - \int v\,du$.
- **LIATE**: regra prática para escolher $u$ na integração por partes.
- **Substituição**: troca de variável $u = g(x)$ que simplifica o integrando.
- **Integral imprópria**: integral com limite infinito ou integrando ilimitado.
- **Série geométrica**: série $\sum ar^n$, com soma $\frac{a}{1-r}$ quando $|r| < 1$.
- **Série harmônica**: $\sum \frac{1}{n}$, que diverge.
- **Série-p**: $\sum \frac{1}{n^p}$, convergente para $p > 1$.
- **Teste da razão**: critério baseado em $L = \lim \left|\frac{a_{n+1}}{a_n}\right|$.`
    },
    MAPA_MENTAL: {
      trechos: [0, 1, 4, 7],
      conteudo: `mindmap
  root((Cálculo II))
    Integração
      Por partes
        Regra LIATE
      Substituição
      Frações parciais
      Integrais impróprias
    Séries
      Geométrica
      Série p
      Testes
        Termo geral
        Razão`
    }
  },
  chat: {
    tutor: [
      {
        trechos: [0],
        conteudo: m`Vamos pensar juntos. Na integral $\int x e^x\,dx$, temos um **produto** de dois fatores.

1. Qual dos dois fica **mais simples** quando você deriva?
2. E qual dos dois você sabe **integrar** sem dificuldade?

Com essas respostas, você consegue escolher $u$ e $dv$. Qual escolha você faria?`
      },
      {
        trechos: [4, 5],
        conteudo:
          'Boa! Antes de aplicar qualquer fórmula, olhe para a série e responda:\n\n- Ela tem a forma $ar^n$? Se sim, quanto vale $r$?\n- O que acontece com os termos quando $n$ cresce?\n\nMe diga o que você observou e decidimos qual teste usar.'
      }
    ],
    explicacao: [
      {
        trechos: [0],
        conteudo: m`Use $u = x$ (fica mais simples ao derivar) e $dv = e^x\,dx$:

- $du = dx$
- $v = e^x$

Aplicando $\int u\,dv = uv - \int v\,du$:

$$\int x e^x\,dx = xe^x - \int e^x\,dx = e^x(x - 1) + C$$`
      },
      {
        trechos: [4, 6, 7],
        conteudo: m`Um roteiro para decidir a convergência:

1. **É geométrica?** Converge se $|r| < 1$, com soma $\frac{a}{1-r}$.
2. **É série-$p$?** Converge se $p > 1$.
3. **O termo geral tende a zero?** Se não, diverge.
4. **Tem fatoriais ou potências de $n$?** Tente o teste da razão.

$$L = \lim_{n\to\infty}\left|\frac{a_{n+1}}{a_n}\right|$$`
      }
    ],
    dicas: [
      'Dica: na integração por partes, escolha como $u$ o fator que **simplifica ao derivar**.',
      'Dica: antes de qualquer teste, verifique se a série é **geométrica** ou uma **série-$p$**.',
      'Dica: fatoriais costumam se simplificar bem no **teste da razão**.'
    ]
  },
  explicacoesAlternativas: [
    'Pense na integração por partes como **trocar um problema difícil por um mais fácil**: você “paga” derivando um fator e integrando o outro, e o que sobra precisa ser mais simples do que o original.',
    'Uma série geométrica é como **andar metade do caminho** que falta até a parede, de novo e de novo: você dá infinitos passos, mas a distância total percorrida é finita.',
    'O teste da razão pergunta: **cada termo é uma fração fixa do anterior?** Se essa fração for menor que 1 no longo prazo, os termos encolhem rápido o bastante para a soma ser finita.'
  ]
}
