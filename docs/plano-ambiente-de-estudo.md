# Plano — Ambiente de Estudo (fase 1: front-end)

> Responsável: Andrey. Status: **fases F1 a F9 implementadas** na branch `feat/ambiente-estudo` (aguardando revisão).
> Relacionado ao [BACKLOG.md](BACKLOG.md): E2 (Ambientes de estudo), parte de E6 (rótulos de IA, citações, reporte) e T4.10 (sem mecânicas punitivas).

## Notas da implementação

O que mudou em relação ao plano abaixo:

- **Rota extra** `/ambientes/[ambienteId]/simulados/[simuladoId]`: tela de instruções e histórico de tentativas. Só ela cria a tentativa, e o cronômetro começa a partir daí.
- **Componentes agrupados por domínio** em vez de uma pasta por componente: `Questoes/`, `Chat/`, `Resumo/` e `Simulado/`. Os componentes compartilhados seguem o padrão `Nome/Nome.tsx`.
- **`ModoQuestao` tem um terceiro estado, `BLOQUEADA`**: a resposta fica congelada sem revelar o gabarito. É usado quando o tempo esgota e durante a correção de uma discursiva.
- **Consulta periódica** (`consultarEnquanto` + `refetchIntervalInBackground: true`): acompanha upload, geração e correção, e continua se o aluno trocar de aba. Com o back real, o mesmo mecanismo serve para jobs assíncronos.
- **Conteúdo de demonstração** em `services/ambienteEstudo/mock/conteudo/`: pacotes de cálculo, computação e redação, mais um genérico, escolhidos pelo nome do ambiente. O banco é pequeno de propósito: as telas avisam quando o pedido supera o que existe.
- **Contrato com o back**: os tipos em `src/@types/AmbienteEstudo` e as assinaturas em `src/services/ambienteEstudo/*.ts` (tabela da seção 6.3). `restaurarDemonstracao()` só existe no mock.
- **Pendências** (não fazem parte desta fase): testes automatizados no repositório dependem do T0.6 (Vitest); as verificações desta fase foram feitas com um script descartável e com navegação real no navegador.

## 1. Objetivo e escopo

Criar a aba **Ambientes de estudo**: um espaço por cadeira (ou tema livre) onde o aluno:

1. guarda materiais (PDF, DOCX, PPTX, imagens, texto colado);
2. conversa com a IA em **vários chats**, cada um usando os materiais que escolher;
3. gera **resumos**;
4. pratica com **atividades de reforço**: quiz rápido, verdadeiro ou falso, lacunas, discursiva com rubrica e flashcards;
5. faz **simulados com cronômetro**.

**Nesta fase só existe o front.** Toda chamada de dados passa por uma camada de serviços com **implementação mock**, que simula a latência e persiste em `localStorage`. Os tipos e assinaturas dessa camada **são o contrato com o back**: quando ele ficar pronto, só a implementação dos serviços muda, e telas e hooks continuam iguais.

### Decisões tomadas

| Tema | Decisão |
|---|---|
| Dados | Serviços mock + `localStorage`, com contrato tipado (seção 6) |
| Páginas atuais | `/chat` e `/questoes` **continuam existindo**. O ambiente é uma aba nova e reaproveita código delas extraindo componentes, sem alterar o comportamento das páginas antigas. |
| Ambientes × cadeiras | No primeiro acesso, é criado um ambiente para cada cadeira **em andamento**. O aluno pode criar quantos ambientes livres quiser, com ou sem vínculo a uma cadeira. |
| Materiais | **Biblioteca por ambiente.** Cada chat, resumo, atividade e simulado escolhe quais materiais usar. Um arquivo anexado no chat entra automaticamente na biblioteca. |
| Atividades | Quiz rápido, verdadeiro ou falso, lacunas, discursiva com rubrica e flashcards |
| Cronômetro | Tempo total, **sem pausa**; avisos aos 10 e aos 5 minutos; entrega automática ao zerar; sobrevive a recarregar a página. Modo **treino** opcional, sem cronômetro. |
| Dependências | Poucas e justificadas (seção 9) |

### Fora do escopo desta fase
- IA real, processamento real de arquivos (extração de texto, OCR, embeddings), autenticação e sincronização entre dispositivos.
- XP e gamificação: as ações importantes chamam um `registrarEventoEstudo()` que nesta fase não faz nada (seção 6.4), para ligar a gamificação depois sem mexer nas telas.
- Mudanças nas páginas `/chat` e `/questoes`.

## 2. O que existe hoje e o que será reaproveitado

| Origem | O que aproveitar | Como |
|---|---|---|
| [chat/page.tsx](../src/app/(private)/chat/page.tsx) | Balões de mensagem, textarea que cresce, Enter/Shift+Enter, indicador de "digitando", auto-scroll | Copiar a lógica para componentes novos (`MensagemChat`, `CampoMensagem`) trocando os SVGs inline por `react-icons`. A página antiga não é alterada. |
| [responder-questionario/page.tsx](../src/app/(private)/questoes/responder-questionario/page.tsx) | Estilo dos radios, destaque verde/vermelho (`ring-green-500` / `ring-red-500`), placar de acertos | Base visual de `QuestaoMultiplaEscolha`. A correção vira a função pura `corrigirQuestao()`. |
| [Header](../src/components/Header/Header.tsx) | Título, descrição, voltar e ações | Usado em todas as páginas novas. |
| [utils/historicoAcademico](../src/utils/historicoAcademico/index.ts) | `normalizarTexto()` | Comparar respostas de lacunas ignorando acentos e caixa. |
| [utils/mockData.ts](../src/utils/mockData.ts) | `mockDataDisciplinas` com `status: 'ANDAMENTO'` | Fonte das cadeiras atuais para criar os primeiros ambientes, por meio de um adaptador (`obterCadeirasAtuais()`) que depois passa a ler o histórico real (T1.1). |
| [Navbar.tsx](../src/components/Navbar/Navbar.tsx) | Array `options` | Novo item "Ambientes de estudo" em `/ambientes`. |

**Padrões do repositório a seguir:** páginas `'use client'`; Tailwind v4 com paleta preto, branco e cinza; cards `bg-white border border-gray-100 rounded-2xl shadow-lg`; botão primário `bg-black text-white rounded-md`; componentes em `src/components/<Nome>/<Nome>.tsx`; tipos em `src/@types/<Dominio>/index.ts`; serviços em `src/services/<dominio>/`; nomes em português com camelCase; React Query para dados.

## 3. Rotas

Todas ficam em `src/app/(private)/ambientes/`.

```
/ambientes                                     Lista de ambientes + criar
/ambientes/[ambienteId]                        Visão geral (layout com abas)
/ambientes/[ambienteId]/materiais              Biblioteca
/ambientes/[ambienteId]/chats                  Lista de chats (abre o mais recente no desktop)
/ambientes/[ambienteId]/chats/[chatId]         Conversa
/ambientes/[ambienteId]/resumos                Lista + gerar resumo
/ambientes/[ambienteId]/resumos/[resumoId]     Ler / editar resumo
/ambientes/[ambienteId]/atividades             Lista + gerar atividade
/ambientes/[ambienteId]/atividades/[atividadeId]   Realizar atividade (player por tipo)
/ambientes/[ambienteId]/simulados              Lista + histórico de tentativas
/ambientes/[ambienteId]/simulados/novo         Configurar simulado
/ambientes/[ambienteId]/simulados/[simuladoId]/tentativas/[tentativaId]            Realização (cronômetro)
/ambientes/[ambienteId]/simulados/[simuladoId]/tentativas/[tentativaId]/resultado  Resultado e revisão
```

- `ambientes/[ambienteId]/layout.tsx` mostra o `Header` com nome, cor e cadeira do ambiente, e a barra de abas: **Visão geral · Materiais · Chats · Resumos · Atividades · Simulados**. No mobile, a barra rola na horizontal.
- A tela de **realização do simulado** esconde as abas (modo foco). Isso é feito por um layout próprio em `tentativas/[tentativaId]/` ou por uma condição no layout pai com base em `useSelectedLayoutSegments()`.
- Os parâmetros são lidos com `useParams()`, porque as páginas são client components, como no resto do repositório.

## 4. Estrutura de pastas

```
src/
├── @types/AmbienteEstudo/index.ts              # Todos os tipos do domínio (seção 5)
├── services/ambienteEstudo/
│   ├── ambientes.ts                            # Funções públicas (contrato)
│   ├── materiais.ts
│   ├── chats.ts
│   ├── resumos.ts
│   ├── atividades.ts
│   ├── simulados.ts
│   ├── eventos.ts                              # registrarEventoEstudo() — sem efeito nesta fase
│   └── mock/
│       ├── armazenamento.ts                    # Wrapper tipado de localStorage, versionado
│       ├── atraso.ts                           # Latência e falha simuladas
│       ├── semente.ts                          # Ambientes iniciais a partir das cadeiras atuais
│       ├── conteudoDemonstracao.ts             # Banco fixo de questões, resumos e respostas
│       └── geradores.ts                        # "IA" fake: monta conteúdo a partir do banco
├── hooks/ambienteEstudo/
│   ├── chavesConsulta.ts                       # Fábrica de query keys do React Query
│   ├── useAmbientes.ts, useMateriais.ts, useChats.ts, useResumos.ts,
│   ├── useAtividades.ts, useSimulados.ts
│   ├── useCronometro.ts                        # Tempo restante derivado de prazoFinal
│   └── useAtalhosTeclado.ts
├── utils/ambienteEstudo/
│   ├── corrigirQuestao.ts                      # Correção pura (MC, V/F, lacunas)
│   ├── calcularResultado.ts                    # Nota, acertos, desempenho por tópico, tempo
│   ├── revisaoEspacada.ts                      # SM-2 para flashcards
│   └── formatarTempo.ts
├── components/AmbienteEstudo/
│   ├── (compartilhados) AbasAmbiente, CardAmbiente, ModalAmbiente, EstadoVazio,
│   │   Esqueleto, SeloIA, ChipCitacao, PainelCitacao, SeletorMateriais,
│   │   Markdown, ModalConfirmacao, BotaoReportar
│   ├── (materiais) ZonaUpload, ListaMateriais, ItemMaterial, VisualizadorMaterial
│   ├── (chats) ListaChats, JanelaChat, MensagemChat, CampoMensagem,
│   │   AlternadorModo, BarraContexto, AcoesRapidasChat
│   ├── (questões) QuestaoMultiplaEscolha, QuestaoVerdadeiroFalso, QuestaoLacunas,
│   │   QuestaoDiscursiva, RenderizadorQuestao, FeedbackQuestao, CorrecaoRubrica
│   ├── (atividades) FormGerarAtividade, CardAtividade, PlayerQuestoes,
│   │   PlayerFlashcards, ResultadoAtividade
│   ├── (resumos) FormGerarResumo, CardResumo, VisualizadorResumo, EditorResumo, MapaMental
│   └── (simulados) FormNovoSimulado, Cronometro, NavegadorQuestoes,
│       ModalEntregar, ResultadoSimulado, CardTentativa
└── app/(private)/ambientes/...                 # Rotas (seção 3)
```

Cada componente fica em `components/AmbienteEstudo/<Nome>/<Nome>.tsx`, no mesmo padrão do resto do projeto.

## 5. Modelo de dados (tipos do front = contrato)

`src/@types/AmbienteEstudo/index.ts`. Todas as datas são strings ISO 8601 e os IDs são strings (UUID).

```ts
export type StatusGeracao = 'GERANDO' | 'PRONTO' | 'ERRO'
export type Dificuldade = 'FACIL' | 'MEDIA' | 'DIFICIL'

export interface AmbienteEstudo {
  id: string
  nome: string
  descricao: string | null
  cor: string // token da paleta (ex.: 'azul'), não hex livre
  origem: 'CADEIRA' | 'LIVRE'
  disciplinaCodigo: string | null // vínculo opcional com a cadeira
  arquivado: boolean
  criadoEm: string
  atualizadoEm: string
}

export type TipoMaterial = 'PDF' | 'DOCX' | 'PPTX' | 'IMAGEM' | 'TEXTO'
export interface Material {
  id: string
  ambienteId: string
  nome: string
  tipo: TipoMaterial
  tamanhoBytes: number
  paginas: number | null
  status: 'ENVIANDO' | 'PROCESSANDO' | 'PRONTO' | 'ERRO'
  mensagemErro: string | null
  origem: 'UPLOAD' | 'CHAT'
  conteudoTexto: string | null // só para tipo TEXTO (colado)
  criadoEm: string
}

/** Referência ao trecho do material que sustenta uma afirmação da IA. */
export interface Citacao {
  materialId: string
  materialNome: string
  pagina: number | null
  trecho: string
}

export type ModoChat = 'TUTOR' | 'EXPLICACAO'
export interface Chat {
  id: string
  ambienteId: string
  titulo: string
  materialIds: string[] // contexto selecionado
  modo: ModoChat
  fixado: boolean
  criadoEm: string
  atualizadoEm: string
}

export interface MensagemChat {
  id: string
  chatId: string
  papel: 'ALUNO' | 'ASSISTENTE'
  conteudo: string // markdown
  anexoIds: string[] // materialIds enviados junto com a mensagem
  citacoes: Citacao[]
  foraDoMaterial: boolean // a resposta usou conhecimento geral
  status: 'TRANSMITINDO' | 'CONCLUIDA' | 'ERRO'
  criadoEm: string
}

export type FormatoResumo = 'TOPICOS' | 'CORRIDO' | 'GLOSSARIO' | 'MAPA_MENTAL'
export interface Resumo {
  id: string
  ambienteId: string
  titulo: string
  formato: FormatoResumo
  materialIds: string[]
  conteudo: string // markdown; em MAPA_MENTAL, código Mermaid
  citacoes: Citacao[]
  editadoPeloAluno: boolean
  status: StatusGeracao
  criadoEm: string
  atualizadoEm: string
}

// ---------- Questões (união discriminada por `tipo`) ----------
interface QuestaoBase {
  id: string
  enunciado: string // markdown (aceita fórmulas)
  dificuldade: Dificuldade
  topico: string | null
  citacoes: Citacao[]
  origem: 'IA' | 'MANUAL'
}
export interface QuestaoMultiplaEscolha extends QuestaoBase {
  tipo: 'MULTIPLA_ESCOLHA'
  opcoes: { id: string; texto: string; justificativa: string }[]
  opcaoCorretaId: string
}
export interface QuestaoVerdadeiroFalso extends QuestaoBase {
  tipo: 'VERDADEIRO_FALSO'
  resposta: boolean
  justificativa: string
}
export interface QuestaoLacunas extends QuestaoBase {
  tipo: 'LACUNAS'
  /** Texto com marcadores {{id}}; ex.: "A {{l1}} transforma energia luminosa em {{l2}}." */
  texto: string
  lacunas: { id: string; respostasAceitas: string[] }[]
  justificativa: string
}
export interface QuestaoDiscursiva extends QuestaoBase {
  tipo: 'DISCURSIVA'
  rubrica: { id: string; descricao: string; pontos: number }[]
  respostaModelo: string
}
export type Questao =
  | QuestaoMultiplaEscolha
  | QuestaoVerdadeiroFalso
  | QuestaoLacunas
  | QuestaoDiscursiva
export type TipoQuestao = Questao['tipo']

export type Resposta =
  | { tipo: 'MULTIPLA_ESCOLHA'; opcaoId: string }
  | { tipo: 'VERDADEIRO_FALSO'; valor: boolean }
  | { tipo: 'LACUNAS'; valores: Record<string, string> }
  | { tipo: 'DISCURSIVA'; texto: string }

export interface CorrecaoDiscursiva {
  questaoId: string
  status: StatusGeracao
  criterios: { criterioId: string; pontosObtidos: number; justificativa: string }[]
  nota: number
  notaMaxima: number
  feedbackGeral: string
}

// ---------- Atividades ----------
export type TipoAtividade =
  | 'QUIZ'
  | 'VERDADEIRO_FALSO'
  | 'LACUNAS'
  | 'DISCURSIVA'
  | 'FLASHCARDS'

export interface Flashcard {
  id: string
  frente: string
  verso: string
  citacoes: Citacao[]
  revisao: {
    repeticoes: number
    intervaloDias: number
    facilidade: number // fator SM-2, começa em 2.5
    proximaRevisao: string
  }
}

export interface Atividade {
  id: string
  ambienteId: string
  titulo: string
  tipo: TipoAtividade
  materialIds: string[]
  dificuldade: Dificuldade | 'MISTA'
  questoes: Questao[] // vazio quando tipo = FLASHCARDS
  flashcards: Flashcard[] // vazio nos demais tipos
  origemChatId: string | null // criada a partir de um chat
  status: StatusGeracao
  criadoEm: string
}

export interface TentativaAtividade {
  id: string
  atividadeId: string
  respostas: Record<string, Resposta> // por questaoId
  correcoesDiscursivas: Record<string, CorrecaoDiscursiva>
  acertos: number
  total: number
  iniciadaEm: string
  concluidaEm: string | null
}

// ---------- Simulados ----------
export interface ConfigSimulado {
  materialIds: string[]
  quantidadeQuestoes: number
  tiposQuestao: TipoQuestao[]
  dificuldade: Dificuldade | 'MISTA'
  duracaoMinutos: number | null // null = modo treino (sem cronômetro)
  embaralharOpcoes: boolean
}

export interface Simulado {
  id: string
  ambienteId: string
  titulo: string
  config: ConfigSimulado
  questoes: Questao[]
  status: StatusGeracao
  criadoEm: string
}

export interface TentativaSimulado {
  id: string
  simuladoId: string
  iniciadaEm: string
  prazoFinal: string | null // iniciadaEm + duração; null no treino
  entregueEm: string | null
  entregaAutomatica: boolean
  respostas: Record<string, Resposta>
  marcadasParaRevisao: string[]
  tempoPorQuestaoSeg: Record<string, number>
  resultado: ResultadoSimulado | null
}

export interface ResultadoSimulado {
  acertos: number
  totalObjetivas: number
  notaDiscursivas: number | null
  notaMaximaDiscursivas: number | null
  notaFinal: number // 0 a 10
  porTopico: { topico: string; acertos: number; total: number }[]
  correcoesDiscursivas: Record<string, CorrecaoDiscursiva>
}

export interface ReporteConteudoIA {
  id: string
  alvo: { tipo: 'MENSAGEM' | 'RESUMO' | 'QUESTAO' | 'FLASHCARD' | 'CORRECAO'; id: string }
  motivo: 'INCORRETO' | 'SEM_FONTE' | 'ENVIESADO' | 'OFENSIVO' | 'OUTRO'
  comentario: string | null
  criadoEm: string
}
```

## 6. Camada de serviços (mock) e contrato com o back

### 6.1 Regras
- As telas **nunca** acessam o `localStorage` diretamente: tudo passa por `services/ambienteEstudo/*`, consumido pelos hooks do React Query.
- Cada função do serviço é `async` e recebe e devolve os tipos da seção 5. Hoje ela chama o mock; quando o back existir, chama `api` (axios, `src/services/api.ts`).
- Uma flag `NEXT_PUBLIC_AMBIENTE_MOCK` (padrão `true`) escolhe a implementação. Nesta fase só existe o mock.

### 6.2 Mock
- **`armazenamento.ts`**: lê e grava um único objeto em `localStorage['xor:ambienteEstudo:v1']`, com `try/catch` (modo anônimo e cota cheia) e um número de versão para migrações futuras. **Nunca guarda o conteúdo binário de arquivos**, só os metadados, para não estourar o limite de cerca de 5 MB. Para imagens, guarda no máximo uma miniatura `dataURL` de até ~150 KB.
- **`atraso.ts`**: `await atraso(400, 1200)` simula latência. A taxa de falha é configurável (0 por padrão) para testar os estados de erro.
- **`semente.ts`**: no primeiro acesso, chama `obterCadeirasAtuais()` (hoje filtra `mockDataDisciplinas` por `status === 'ANDAMENTO'`) e cria um ambiente `origem: 'CADEIRA'` para cada uma, com conteúdo de demonstração (2 materiais, 1 chat, 1 resumo, 1 atividade). Um botão "Restaurar dados de demonstração" em `/ambientes` refaz a semente.
- **`geradores.ts`**: a "IA" fake. Monta questões, resumos, flashcards, respostas de chat e correções a partir de `conteudoDemonstracao.ts`, um banco fixo de conteúdo em português com fórmulas, tabelas e citações apontando para os materiais do ambiente. O conteúdo sai com `status: 'GERANDO'` e passa a `PRONTO` depois de um atraso, para exercitar os estados de carregamento.
- **Streaming do chat**: `enviarMensagem()` devolve um `AsyncIterable<string>` que emite pedaços do texto com `setTimeout`, simulando o streaming. O hook acumula o texto na mensagem do assistente. Quando o back chegar, a implementação passa a ler o stream HTTP com a mesma interface.
- **Upload**: `enviarMaterial(ambienteId, arquivo)` lê os metadados do `File`, cria o material com status `ENVIANDO`, avança para `PROCESSANDO` e depois `PRONTO`. Arquivos com mais de 25 MB ou de tipo não suportado viram `ERRO` com mensagem. A pré-visualização de PDFs e imagens usa `URL.createObjectURL` só durante a sessão; depois de recarregar, aparece um aviso "pré-visualização disponível após integração com o servidor".

### 6.3 Contrato REST previsto (para o time de back)

| Função do serviço | Método e rota sugeridos |
|---|---|
| `listarAmbientes()` / `criarAmbiente(d)` | `GET` / `POST /ambientes` |
| `obterAmbiente(id)` / `atualizarAmbiente(id, d)` / `excluirAmbiente(id)` | `GET` / `PATCH` / `DELETE /ambientes/:id` |
| `listarMateriais(ambId)` / `enviarMaterial(ambId, arquivo)` | `GET` / `POST (multipart) /ambientes/:id/materiais` |
| `excluirMaterial(id)` / `renomearMaterial(id, nome)` | `DELETE` / `PATCH /materiais/:id` |
| `listarChats(ambId)` / `criarChat(ambId, d)` | `GET` / `POST /ambientes/:id/chats` |
| `atualizarChat(id, d)` / `excluirChat(id)` | `PATCH` / `DELETE /chats/:id` |
| `listarMensagens(chatId)` | `GET /chats/:id/mensagens` |
| `enviarMensagem(chatId, conteudo, anexoIds)` | `POST /chats/:id/mensagens` → **stream** |
| `gerarResumo(ambId, {materialIds, formato})` | `POST /ambientes/:id/resumos` |
| `listarResumos` / `obterResumo` / `atualizarResumo` / `excluirResumo` | `GET /ambientes/:id/resumos`, `GET`/`PATCH`/`DELETE /resumos/:id` |
| `gerarAtividade(ambId, config)` | `POST /ambientes/:id/atividades` |
| `listarAtividades` / `obterAtividade` / `excluirAtividade` | `GET /ambientes/:id/atividades`, `GET`/`DELETE /atividades/:id` |
| `salvarTentativaAtividade(t)` | `PUT /atividades/:id/tentativas/:tid` |
| `corrigirDiscursiva(questaoId, texto)` | `POST /questoes/:id/correcoes` |
| `avaliarFlashcard(atividadeId, cardId, nota)` | `POST /atividades/:id/flashcards/:cid/revisoes` |
| `gerarSimulado(ambId, config)` | `POST /ambientes/:id/simulados` |
| `iniciarTentativa(simId)` | `POST /simulados/:id/tentativas` (o servidor define `prazoFinal`) |
| `salvarRespostas(tid, parcial)` | `PATCH /tentativas/:tid` |
| `entregarTentativa(tid, automatica)` | `POST /tentativas/:tid/entrega` |
| `explicarDeOutroJeito(questaoId)` | `POST /questoes/:id/explicacoes` |
| `reportarConteudo(r)` | `POST /reportes` |

> Com back real, o **servidor é a fonte da verdade do prazo** do simulado e recusa respostas depois de `prazoFinal`. No mock, o front simula isso.

### 6.4 Eventos para gamificação futura
`registrarEventoEstudo(tipo, dados)` é chamado em: atividade concluída, questão respondida, simulado entregue, flashcards revisados e reporte enviado. Nesta fase a função não faz nada (só registra no console em desenvolvimento). O motor de XP do T4.1 vai consumir esses eventos.

## 7. Telas e comportamento

### 7.1 `/ambientes` — Lista
- Grade de `CardAmbiente`: nome, cor, cadeira vinculada (se houver), contadores de materiais, chats e atividades, e última atividade.
- Seções "Minhas cadeiras" (origem CADEIRA) e "Outros ambientes" (LIVRE), mais um filtro "Arquivados".
- "Novo ambiente" abre o `ModalAmbiente`: nome (obrigatório), descrição, cor e um **select opcional de cadeira** (cadeiras atuais + "Nenhuma"). Validação com react-hook-form + zod, como no cadastro.
- Menu do card: editar, arquivar e excluir. Excluir pede confirmação e informa quantos itens serão apagados.
- Estado vazio com chamada para criar o primeiro ambiente.

### 7.2 `/ambientes/[id]` — Visão geral
- "Continuar de onde parou": último chat, atividade ou simulado.
- Atalhos: **Enviar material · Novo chat · Gerar resumo · Gerar atividade · Novo simulado**.
- Cards com flashcards pendentes de revisão hoje (vindos do SM-2) e desempenho recente (acertos nas últimas atividades e simulados por tópico).

### 7.3 Materiais
- `ZonaUpload`: arrastar e soltar (API nativa, sem biblioteca), clique para selecionar e **colar texto** (cria um material tipo TEXTO). Aceita `.pdf, .docx, .pptx, .png, .jpg, .jpeg, .webp, .txt, .md`. Vários arquivos de uma vez.
- `ListaMateriais`: ícone por tipo, nome, tamanho, páginas, status (barra ou spinner em ENVIANDO/PROCESSANDO, mensagem e "tentar de novo" em ERRO) e origem (selo "do chat").
- Ações: renomear, excluir (avisa que chats e atividades que usam o material perdem a referência) e visualizar (`VisualizadorMaterial` em um painel lateral).
- Aviso de privacidade fixo: "Seus materiais são usados apenas para gerar conteúdo de estudo para você."

### 7.4 Chats
- **Desktop:** coluna esquerda com `ListaChats` (busca, fixados no topo, renomear e excluir) e a conversa à direita. **Mobile:** a lista é uma tela e a conversa é outra.
- "Novo chat" pergunta, de forma opcional, quais materiais usar (`SeletorMateriais`, com todos os prontos marcados por padrão) e o modo.
- `BarraContexto` no topo da conversa mostra os materiais em uso como chips, com botão para editar a seleção.
- `AlternadorModo`: **Tutor** (padrão; guia com perguntas e dicas) e **Explicação** (resposta direta). Um tooltip explica a diferença. O modo é salvo por chat.
- `CampoMensagem`: textarea que cresce, Enter envia e Shift+Enter quebra linha (como no chat atual), **botão de anexo**, **colar imagem com Ctrl+V** e arrastar arquivo para a conversa. Os anexos aparecem como chips antes do envio e entram na biblioteca com `origem: 'CHAT'`.
- `MensagemChat`: markdown com tabelas, fórmulas e código; **chips de citação** ("Aula 3.pdf · p. 12") que abrem o `PainelCitacao` com o trecho; selo "fora do material" quando `foraDoMaterial = true`; ações copiar, **reportar** e, no modo Tutor, "me dê uma dica" ou "mostrar resposta completa".
- O streaming tem botão "parar". Em caso de erro, a mensagem mostra "tentar de novo".
- `AcoesRapidasChat`: "**Gerar quiz desta conversa**", "**Gerar flashcards desta conversa**" e "Resumir conversa". Criam uma atividade ou um resumo com `origemChatId` e mostram um link para ela.
- O título do chat é gerado a partir da primeira mensagem (no mock, as primeiras palavras) e pode ser editado.

### 7.5 Resumos
- `FormGerarResumo` (modal): materiais (obrigatório, pelo menos 1), formato (Tópicos, Corrido, Glossário ou Mapa mental) e título opcional.
- Lista com cards. Enquanto o status é GERANDO, o card mostra um esqueleto animado.
- `VisualizadorResumo`: markdown com chips de citação. O formato MAPA_MENTAL é renderizado com Mermaid (`MapaMental`, carregado sob demanda), e o formato GLOSSARIO vira uma lista de termos com busca.
- `EditorResumo`: alterna entre editar (textarea com markdown) e visualizar. Ao salvar, o resumo fica com `editadoPeloAluno = true` e mostra o selo "Editado por você".
- Ações: copiar, imprimir (`window.print` com CSS de impressão), **gerar flashcards a partir deste resumo**, reportar e excluir.
- `SeloIA` no topo: "Gerado por IA a partir dos seus materiais — confira as fontes."

### 7.6 Atividades
- `FormGerarAtividade` (modal): tipo (quiz, verdadeiro ou falso, lacunas, discursiva, flashcards), materiais, quantidade (5 a 30; de 1 a 5 para discursiva), dificuldade e tópico opcional.
- A lista mostra cards com tipo, quantidade, melhor resultado e data. Os flashcards mostram quantos estão "para revisar hoje".
- **`PlayerQuestoes`** (quiz, V/F, lacunas, discursiva): uma questão por vez com barra de progresso.
  - **Quiz, V/F e lacunas:** feedback **imediato** depois de confirmar. `FeedbackQuestao` mostra certo ou errado, a justificativa da alternativa escolhida e da correta, o chip de citação e os botões "**Explique de outro jeito**" (o mock devolve uma explicação alternativa) e reportar.
  - **Lacunas:** inputs inline no texto; a correção normaliza acentos, caixa e espaços (`normalizarTexto`) e aceita qualquer item de `respostasAceitas`.
  - **Discursiva:** textarea com contador de palavras e a **rubrica visível antes de responder**. Ao enviar, aparece `CorrecaoRubrica`: pontuação por critério com justificativa, nota, feedback geral, a resposta modelo (expansível) e o rótulo fixo **"Avaliação formativa gerada por IA — não substitui a avaliação do docente"**, além do botão "contestar correção" (que gera um reporte).
  - `ResultadoAtividade`: acertos, desempenho por tópico, lista das erradas e "Refazer só as erradas".
- **`PlayerFlashcards`:** o cartão vira com clique ou espaço; avaliação **De novo · Difícil · Bom · Fácil** (teclas 1 a 4) atualiza `revisao` com SM-2 (`revisaoEspacada.ts`). Modos "Revisar pendentes" e "Estudar todos". Na tela final, mostra quantos cartões voltam amanhã.
- A tentativa em andamento é salva a cada resposta; ao sair e voltar, o aluno pode continuar ou recomeçar.

### 7.7 Simulados
- **`/simulados/novo` (`FormNovoSimulado`):** materiais, quantidade (5 a 60), tipos de questão (multiselect; padrão: múltipla escolha), dificuldade e **duração**.
  - A duração tem um valor sugerido (2 min por objetiva + 10 min por discursiva) e pode ser editada.
  - Um toggle "Modo treino (sem cronômetro)" deixa `duracaoMinutos = null`.
  - Ao gerar: tela de espera, depois uma tela de **instruções** (número de questões, duração, "não é possível pausar", entrega automática ao fim do tempo e atalhos de teclado) com o botão "**Iniciar simulado**". Só esse botão cria a tentativa.
- **Realização (modo foco, sem abas):**
  - `Cronometro` fixo no topo, com o tempo restante **derivado de `prazoFinal - Date.now()`** (não é um contador decrementado). Isso torna o tempo correto mesmo com a aba em segundo plano, o navegador estrangulando timers ou a página recarregada.
  - Atualiza a cada segundo; fica âmbar com **10 min** e vermelho com **5 min**, com toast e anúncio `aria-live` só nesses momentos.
  - Ao zerar: congela a interface, mostra "Tempo esgotado" e **entrega automaticamente** (`entregaAutomatica = true`).
  - `NavegadorQuestoes`: grade numerada com os estados não respondida, respondida, marcada para revisão e atual. É uma lateral no desktop e uma folha inferior no mobile.
  - Navegação anterior e próxima, "Marcar para revisão" e **sem feedback durante a prova**.
  - Respostas e `tempoPorQuestaoSeg` são salvos a cada alteração (com debounce de 500 ms) e na troca de questão.
  - `beforeunload` avisa ao tentar fechar a aba. Ao voltar para uma tentativa em andamento, ela é retomada com o tempo correto. Se o prazo já passou, ela é entregue automaticamente ao abrir.
  - `ModalEntregar` lista as questões em branco e as marcadas para revisão antes de confirmar.
  - Atalhos: A a E ou 1 a 5 escolhem a alternativa, V e F respondem V/F, ← e → navegam, M marca para revisão.
- **Resultado (`ResultadoSimulado`):**
  - Nota de 0 a 10, acertos, tempo total e médio por questão, desempenho por tópico (barras) e se a entrega foi automática.
  - As discursivas aparecem como "corrigindo..." até a correção (mock) ficar pronta; depois, a nota final é recalculada.
  - Revisão questão a questão com `FeedbackQuestao`.
  - Ações: "Refazer simulado" (nova tentativa com as mesmas questões), "**Gerar atividade com as questões que errei**" e "Novo simulado".
- A lista de simulados mostra o histórico de tentativas (data, nota, duração) e uma tentativa em andamento com o botão "Continuar".

## 8. Componentes compartilhados importantes

| Componente | Responsabilidade |
|---|---|
| `RenderizadorQuestao` | Recebe `questao`, `resposta`, `onResponder` e `modo: 'RESPONDENDO' \| 'CORRIGIDA' \| 'REVISAO'`, e delega ao componente do tipo. **É usado tanto por atividades quanto por simulados.** |
| `corrigirQuestao(questao, resposta)` | Função pura que retorna `{ correta: boolean, detalhes }` para MC, V/F e lacunas. A discursiva é corrigida pelo serviço. |
| `SeletorMateriais` | Lista com checkbox dos materiais prontos, com busca e "selecionar todos". Usado em chat, resumo, atividade e simulado. |
| `Markdown` | `react-markdown` + `remark-gfm` + `remark-math` + `rehype-katex`, com estilos de tipografia do projeto. Usado em chat, resumos e enunciados. |
| `SeloIA`, `ChipCitacao`, `PainelCitacao`, `BotaoReportar` | Transparência: todo conteúdo gerado é rotulado e mostra a fonte; tudo pode ser reportado (o mock grava `ReporteConteudoIA`). |
| `useCronometro(prazoFinal, onEsgotar)` | Retorna `{ restanteSeg, estado: 'NORMAL' \| 'ALERTA_10' \| 'ALERTA_5' \| 'ESGOTADO' }` e dispara `onEsgotar` uma única vez. |

## 9. Novas dependências

| Pacote | Motivo |
|---|---|
| `remark-gfm` | Tabelas, listas de tarefas e tachado no markdown gerado pela IA |
| `remark-math` + `rehype-katex` + `katex` | Fórmulas matemáticas. Essencial para cadeiras de exatas (Cálculo, Física, Estatística) |
| `mermaid` | Mapas mentais nos resumos. Carregado com `import()` dinâmico só quando o formato é MAPA_MENTAL, para não pesar no bundle |
| `sonner` | Toasts acessíveis (avisos do cronômetro, erros, "atividade criada"). O projeto ainda não tem sistema de notificação |

Todas instaladas com `npm install` e o `package-lock.json` commitado. Não serão adicionadas bibliotecas de drag-and-drop nem de estado global: as APIs nativas e o React Query bastam.

## 10. Ética e acessibilidade na interface

**Ética** (alinhado aos critérios do edital):
- Selo de IA e citações em **todo** conteúdo gerado.
- Selo "fora do material" quando a resposta não vem dos documentos.
- Modo Tutor como padrão.
- Correção discursiva rotulada como formativa e contestável.
- Botão reportar em mensagens, resumos, questões, flashcards e correções.
- Nenhuma mensagem de culpa ou punição (ex.: "Você errou 8!" vira "8 questões para revisar").

**Acessibilidade:**
- Tudo operável por teclado, com foco visível.
- `aria-live` apenas nos avisos do cronômetro e na chegada de respostas do chat.
- Radios e checkboxes nativos estilizados (como em `responder-questionario`).
- Contraste AA: verde e vermelho sempre acompanhados de ícone e texto, nunca só de cor.
- `prefers-reduced-motion` desliga a animação de virar o flashcard.

## 11. Fases de implementação (PRs)

Cada fase é um merge request separado em `develop`, com `npm run lint`, `npm run tsc` e `npm run build` passando.

### F1 — Fundação
- [ ] Tipos em `@types/AmbienteEstudo`.
- [ ] `mock/armazenamento.ts`, `atraso.ts`, `semente.ts`, `conteudoDemonstracao.ts` (versão inicial) e `geradores.ts`.
- [ ] Serviços com todas as funções da seção 6.3 (assinaturas completas; implementação mock).
- [ ] `chavesConsulta.ts` e os hooks React Query, com invalidações corretas após mutações.
- [ ] Dependências da seção 9; componentes `Markdown`, `SeloIA`, `ChipCitacao`, `PainelCitacao`, `EstadoVazio`, `Esqueleto`, `ModalConfirmacao` e `BotaoReportar`; `<Toaster />` no layout privado.
- [ ] Item "Ambientes de estudo" na Navbar (desktop e mobile).

**Aceite:** a navegação até `/ambientes` funciona; no primeiro acesso, existe um ambiente por cadeira em andamento; recarregar a página mantém os dados.

### F2 — Ambientes
- [ ] `/ambientes`: lista, criação com cadeira opcional, edição, arquivamento, exclusão e "restaurar demonstração".
- [ ] `[ambienteId]/layout.tsx` com cabeçalho e `AbasAmbiente`; página de visão geral com atalhos.

**Aceite:** é possível criar um ambiente livre e um vinculado a uma cadeira; o ambiente arquivado sai da lista principal; ambiente inexistente mostra uma página "não encontrado".

### F3 — Materiais
- [ ] `ZonaUpload` (arrastar, selecionar, colar texto), `ListaMateriais` com todos os status, renomear, excluir e `VisualizadorMaterial`.
- [ ] `SeletorMateriais`.

**Aceite:** enviar 3 arquivos de uma vez mostra as transições de status; arquivo grande demais ou de tipo inválido vira ERRO com mensagem; nada binário vai para o `localStorage`.

### F4 — Renderizadores de questão (base de F5 e F7)
- [ ] `corrigirQuestao`, `calcularResultado` e `formatarTempo`.
- [ ] `QuestaoMultiplaEscolha`, `QuestaoVerdadeiroFalso`, `QuestaoLacunas`, `QuestaoDiscursiva`, `RenderizadorQuestao`, `FeedbackQuestao` e `CorrecaoRubrica`, nos três modos.
- [ ] Se o Vitest já estiver configurado (T0.6), testes unitários para `corrigirQuestao` e `calcularResultado`.

**Aceite:** os quatro tipos funcionam por teclado e por mouse; lacuna "fotossintese" é aceita para "fotossíntese".

### F5 — Atividades
- [ ] `FormGerarAtividade`, lista, `PlayerQuestoes` (feedback imediato), `PlayerFlashcards` com SM-2 e `ResultadoAtividade`.
- [ ] Retomar uma tentativa em andamento; "refazer só as erradas"; "explique de outro jeito".

**Aceite:** os cinco tipos podem ser gerados e realizados do início ao fim; a próxima revisão de um flashcard muda conforme a avaliação; a discursiva mostra a rubrica antes e a correção depois, com o rótulo formativo.

### F6 — Chats
- [ ] `ListaChats`, `JanelaChat`, `MensagemChat`, `CampoMensagem` (anexo, colar imagem, arrastar), `BarraContexto`, `AlternadorModo` e streaming mock com "parar".
- [ ] Citações, "fora do material", dica e resposta completa no modo Tutor, reportar.
- [ ] `AcoesRapidasChat` (gerar quiz, flashcards ou resumo a partir da conversa).

**Aceite:** vários chats por ambiente, cada um com o próprio contexto e modo; o anexo enviado no chat aparece na biblioteca; a ação rápida cria uma atividade com `origemChatId`; o layout funciona no mobile.

### F7 — Simulados
- [ ] `FormNovoSimulado` com duração sugerida e modo treino; tela de instruções.
- [ ] Realização em modo foco: `Cronometro` (`useCronometro`), `NavegadorQuestoes`, marcar para revisão, autosave, `beforeunload`, atalhos e `ModalEntregar`.
- [ ] Entrega automática; retomada depois de recarregar; entrega ao abrir uma tentativa vencida.
- [ ] `ResultadoSimulado` com correção discursiva assíncrona, desempenho por tópico e "gerar atividade com as erradas".

**Aceite:**
- Simulado de 1 minuto: aviso de 10/5 min não aparece (duração menor), entrega automática ao zerar.
- Simulado de 15 minutos: recarregar a página no meio mantém as respostas e o tempo correto.
- Fechar a aba e reabrir depois do prazo mostra o resultado com "entregue automaticamente".
- O modo treino não tem cronômetro.

### F8 — Resumos
- [ ] `FormGerarResumo`, lista, `VisualizadorResumo` nos quatro formatos (Mermaid sob demanda), `EditorResumo`, impressão e "gerar flashcards deste resumo".

**Aceite:** o mapa mental renderiza sem travar a página; editar e salvar mostra o selo "Editado por você"; a impressão sai sem a navbar.

### F9 — Polimento
- [ ] Revisão de responsividade (360 px, 768 px e 1280 px), acessibilidade (axe no navegador, sem violações críticas) e estados de erro (forçar a taxa de falha do mock).
- [ ] Conteúdo de demonstração rico em ao menos 2 áreas (uma de exatas, com fórmulas; uma de humanas) para gravar o vídeo do prêmio.
- [ ] `docs/ambiente-de-estudo-contrato.md` gerado a partir da seção 6.3 e dos tipos, para o time de back.

A ordem sugerida é F1 → F2 → F3 → F4 → F5 → F6 → F7 → F8 → F9. F8 (resumos) só depende de F3 e pode andar em paralelo a partir daí, caso alguém da equipe ajude.

## 12. Riscos e cuidados

| Risco | Mitigação |
|---|---|
| Limite de ~5 MB do `localStorage` | Não guardar binários; miniaturas pequenas; tratar `QuotaExceededError` com um toast e a opção de limpar dados de demonstração |
| Divergência de hidratação (SSR × localStorage) | Ler dados só no cliente (React Query em client components) e mostrar o esqueleto na primeira renderização |
| Cronômetro impreciso em aba de fundo | Tempo derivado de `prazoFinal`, nunca um contador decrementado |
| Conteúdo mock parecer "IA de verdade" no vídeo | Selo "dados de demonstração" visível enquanto `NEXT_PUBLIC_AMBIENTE_MOCK=true` |
| Contrato mudar quando o back começar | Tipos e assinaturas revisados com o time de back **ao fim da F1**, antes das telas grandes |
| Mermaid pesado | Import dinâmico e só no formato mapa mental |
