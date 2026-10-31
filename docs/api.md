# API

As rotas ficam em [src/app/api](../src/app/api) e são servidas em `/api`. Os schemas de entrada estão em [lib/api/schemas.ts](../src/lib/api/schemas.ts), e os tipos de resposta, em [src/@types](../src/@types).

## Regras gerais

- **Autenticação**: cookie de sessão do Supabase. Sem sessão, toda rota responde `401`, exceto `POST /api/auth/login` e `POST /api/auth/register`.
- **CSRF**: `POST`, `PUT`, `PATCH` e `DELETE` precisam do header `Origin` igual à origem do app. Se não vier, a resposta é `403`. O navegador envia esse header sozinho, mas chamadas por `curl` precisam incluí-lo.
- **Corpo**: JSON. Campos fora do schema são descartados.
- **Erros**: sempre no formato abaixo. `details` só aparece em erro de validação.

  ```json
  { "error": "Dados inválidos", "details": { "nome": ["Nome é obrigatório"] } }
  ```

| Status | Quando |
| --- | --- |
| 400 | JSON malformado ou id de rota inválido |
| 401 | Sem sessão |
| 403 | Origem não permitida |
| 404 | Recurso não encontrado ou de outro aluno |
| 409 | Conflito (email já cadastrado, código de disciplina repetido) |
| 422 | Falha na validação do zod ou regra de negócio |
| 502 / 503 | IA indisponível ou não configurada |
| 500 | Erro inesperado. O detalhe só aparece no log do servidor |

## Autenticação

| Método | Rota | Descrição |
| --- | --- | --- |
| POST | `/api/auth/register` | Cria a conta e o perfil acadêmico (dados pessoais, curso, disciplinas e tentativas) |
| POST | `/api/auth/login` | `{ email, senha }`. Abre a sessão |
| POST | `/api/auth/logout` | Encerra a sessão |
| GET | `/api/me` | Dados resumidos do aluno logado (nome, curso, semestre) |

## Perfil

| Método | Rota | Descrição |
| --- | --- | --- |
| GET | `/api/perfil` | Perfil completo |
| PATCH | `/api/perfil` | Atualiza nome, matrícula, curso, semestre atual e carga optativa exigida |
| PUT | `/api/perfil/email` | Troca o email. Exige a senha atual |
| PUT | `/api/perfil/senha` | Troca a senha. Exige a senha atual |

## Progressão de curso

| Método | Rota | Descrição |
| --- | --- | --- |
| GET | `/api/progresso` | Perfil e disciplinas com status derivado e histórico de tentativas |
| POST | `/api/progresso/disciplinas` | Adiciona uma disciplina |
| PATCH | `/api/progresso/disciplinas/:id` | Edita código, nome, carga horária, caráter e semestre |
| DELETE | `/api/progresso/disciplinas/:id` | Exclui a disciplina e as tentativas dela |
| PUT | `/api/progresso/disciplinas/:id/situacao` | `{ status, nota, periodo }` com status `PENDENTE`, `ANDAMENTO`, `APROVADA`, `REPROVADA` ou `TRANCADA`. Chama `definir_situacao_disciplina` |
| DELETE | `/api/progresso/tentativas/:id` | Remove uma tentativa do histórico |
| POST | `/api/progresso/encerrar-semestre` | Resultados das disciplinas em andamento e ids das próximas. Chama `encerrar_semestre` |

## Questionários

| Método | Rota | Descrição |
| --- | --- | --- |
| GET | `/api/questionarios` | Lista os questionários do aluno com resumo das resoluções |
| POST | `/api/questionarios` | Cria um questionário com as questões |
| GET | `/api/questionarios/:id` | Questionário com questões e histórico de resoluções |
| PATCH | `/api/questionarios/:id` | Substitui o questionário inteiro |
| DELETE | `/api/questionarios/:id` | Exclui o questionário, as questões e as resoluções |
| POST | `/api/questionarios/:id/resolucoes` | Registra uma resolução. O placar é calculado no servidor a partir das respostas |
| POST | `/api/questionarios/gerar` | Gera questões com IA a partir de tema, quantidade, dificuldade, número de alternativas, disciplina, instruções e material. **Não salva**: devolve as questões para o editor |

## Pomodoro

| Método | Rota | Descrição |
| --- | --- | --- |
| GET | `/api/pomodoro/sessoes` | Sessões de foco do aluno |
| POST | `/api/pomodoro/sessoes` | Registra um bloco de foco concluído |
| DELETE | `/api/pomodoro/sessoes/:id` | Exclui uma sessão |

## Ambiente de Estudo

Todas as rotas de IA usam o modelo local (`LM_STUDIO_URL`). Os ids são `uuid`.

### Ambientes

| Método | Rota | Descrição |
| --- | --- | --- |
| GET | `/api/ambientes` | Ambientes do aluno |
| POST | `/api/ambientes` | Cria um ambiente, opcionalmente ligado a uma disciplina |
| GET | `/api/ambientes/:id` | Ambiente com contagens |
| PATCH | `/api/ambientes/:id` | Renomeia, troca a cor ou arquiva |
| DELETE | `/api/ambientes/:id` | Exclui o ambiente e tudo o que está dentro dele |
| GET | `/api/ambientes/:id/progresso` | XP do ambiente e os eventos dos últimos 60 dias |
| GET | `/api/ambientes/resumo` | Nível, revisões pendentes e o que retomar em cada cadeira, para a tela inicial |
| GET | `/api/ambientes/dias` | Dias com estudo nos últimos 90 dias, para a sequência de estudo |
| GET | `/api/ia/status` | Se a IA local responde e tem os modelos instalados |

### Materiais

| Método | Rota | Descrição |
| --- | --- | --- |
| GET | `/api/ambientes/:id/materiais` | Materiais do ambiente |
| POST | `/api/ambientes/:id/materiais` | Envia um arquivo (PDF, DOCX, PPTX ou texto). A extração e os embeddings rodam em seguida |
| POST | `/api/ambientes/:id/materiais/texto` | Cria um material a partir de texto colado |
| PATCH | `/api/materiais/:id` | Renomeia |
| DELETE | `/api/materiais/:id` | Exclui o material, os trechos e o arquivo |
| GET | `/api/materiais/:id/arquivo` | Redireciona para uma URL assinada e temporária do Storage |

### Chats

| Método | Rota | Descrição |
| --- | --- | --- |
| GET, POST | `/api/ambientes/:id/chats` | Lista ou cria chats, com os materiais de contexto e o modo (explicação ou tutor) |
| GET, PATCH, DELETE | `/api/chats/:id` | Chat, renomeia ou troca os materiais, exclui |
| GET | `/api/chats/:id/mensagens` | Histórico |
| POST | `/api/chats/:id/mensagens` | Pergunta. A resposta vem em streaming (`text/plain`): a primeira linha é um JSON com as duas mensagens e o resto é o texto do assistente. Se o cliente abortar, o que chegou até ali é salvo |

### Resumos, atividades e simulados

| Método | Rota | Descrição |
| --- | --- | --- |
| GET, POST | `/api/ambientes/:id/resumos` | Lista ou gera um resumo (tópicos, texto, glossário ou mapa mental) |
| GET, PATCH, DELETE | `/api/resumos/:id` | Resumo, edição e exclusão |
| GET, POST | `/api/ambientes/:id/atividades` | Lista ou gera uma atividade (quiz, V/F, lacunas, discursiva ou flashcards) |
| GET, DELETE | `/api/atividades/:id` | Atividade e exclusão |
| GET, POST | `/api/atividades/:id/tentativas` | Tentativas da atividade |
| PUT | `/api/atividades/:id/tentativas/:tid` | Salva o andamento ou conclui a tentativa |
| POST | `/api/atividades/:id/flashcards/:cid/revisoes` | Aplica a avaliação do aluno à revisão espaçada (SM-2) |
| POST | `/api/questoes/:id/correcoes` | Corrige uma resposta discursiva pela rubrica, com feedback |
| POST | `/api/questoes/:id/explicacoes` | Explica uma questão |
| GET, POST | `/api/ambientes/:id/simulados` | Lista ou gera um simulado |
| GET, DELETE | `/api/simulados/:id` | Simulado e exclusão |
| POST | `/api/simulados/:id/tentativas` | Começa uma tentativa. O prazo é definido no servidor |
| GET, PATCH | `/api/tentativas-simulado/:id` | Tentativa e respostas parciais. Com o prazo vencido, é entregue automaticamente; depois disso, `PATCH` responde 409 |
| POST | `/api/tentativas-simulado/:id/entrega` | Entrega e calcula o resultado |
| POST | `/api/reportes-ia` | Reporta um conteúdo gerado pela IA |

## Dados da vida acadêmica

Tarefas, provas, horários, plano de matrícula, playlists e preferências, guardados em `dados_aluno`.

| Método | Rota | Descrição |
| --- | --- | --- |
| GET | `/api/dados` | Todas as chaves do aluno numa resposta |
| PUT | `/api/dados/:chave` | Substitui o valor de uma chave |
| DELETE | `/api/dados` | `{ chaves }`. Apaga as chaves pedidas (tela de privacidade) |

## Chat antigo

| Método | Rota | Descrição |
| --- | --- | --- |
| POST | `/api/chat` | `{ messages: [{ role, content }] }`. Streaming pela Together AI (`TOGETHER_API_KEY`). A tela saiu do menu; o chat atual é o do Ambiente de Estudo |

## Como criar uma rota

```ts
// src/app/api/exemplo/route.ts
import { handler, ok, parseBody, requireUser } from '@/lib/api/http'
import { exemploSchema } from '@/lib/api/schemas'

export const POST = handler(async (request: Request) => {
  const { supabase, user } = await requireUser()
  const dados = await parseBody(request, exemploSchema)
  // consulta com `supabase`: o RLS garante que só as linhas do aluno são afetadas
  return ok({ ... }, 201)
})
```

Depois, crie o service em `src/services/`, o hook em `src/hooks/` e a chave em [queryKeys.ts](../src/hooks/queryKeys.ts).
