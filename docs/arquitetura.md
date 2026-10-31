# Arquitetura

O XOR é um único app Next.js que faz papel de front-end e de back-end. As telas chamam as rotas de API do próprio Next, e essas rotas falam com o Supabase usando a sessão do aluno. Toda regra de acesso a dados mora no banco, nas políticas de RLS.

## Fluxo de uma requisição

```text
Tela (React)
  └─ hook do React Query        src/hooks/queries | src/hooks/mutations
       └─ service (axios)        src/services/<recurso>/<acao>.ts  →  /api/...
            └─ middleware.ts     renova a sessão, bloqueia rota sem login, checa origem
                 └─ route.ts     src/app/api/...  (handler + zod)
                      └─ lib/api/<recurso>.ts   consultas e regras
                           └─ Supabase (Postgres + RLS)
```

Exemplo, a tela de progressão:

1. [courseProgression/page.tsx](../src/app/(private)/courseProgression/page.tsx) usa `useProgresso()`.
2. [useProgresso](../src/hooks/queries/useProgresso.ts) chama `getProgresso()` com a chave `QUERY_KEYS.PROGRESSO`.
3. [getProgresso](../src/services/progresso/getProgresso.ts) faz `GET /api/progresso`.
4. [api/progresso/route.ts](../src/app/api/progresso/route.ts) chama `requireUser()` e `buscarProgresso()`.
5. [lib/api/progresso.ts](../src/lib/api/progresso.ts) consulta perfil, disciplinas e tentativas e calcula o status de cada disciplina.

## Camadas

### Cliente

- **services/**: uma função por endpoint, sobre a instância axios de [services/api.ts](../src/services/api.ts) (`baseURL: '/api'`). O arquivo também exporta `getErrorMessage` e `getErrorStatus` para transformar erros em mensagens para o usuário.
- **hooks/**: envolvem os services em `useQuery` e `useMutation`. As mutations invalidam as chaves de [queryKeys.ts](../src/hooks/queryKeys.ts) que afetam.
- **ReactQueryProvider**: `staleTime` de 30 s, sem refetch ao focar a janela, sem retry em erro 4xx. Qualquer 401 manda o usuário para `/login`. Mutations em que 401 não quer dizer sessão expirada, como o login, passam `meta: { ignorarNaoAutenticado: true }`.

### Servidor

- **[lib/api/http.ts](../src/lib/api/http.ts)**: utilitários das rotas.
  - `handler(fn)` captura erros. `ApiError` vira `{ error, details }` com o status certo; qualquer outro erro vira 500 sem expor detalhes.
  - `requireUser()` devolve o cliente Supabase e o usuário da sessão, ou lança 401.
  - `parseBody(request, schema)` valida o JSON com zod e descarta campos fora do schema. Corpo inválido dá 400, dados inválidos dão 422.
  - `parseId(params)` valida ids numéricos de rota.
- **[lib/api/schemas.ts](../src/lib/api/schemas.ts)**: schemas zod de todas as entradas da API.
- **lib/api/&lt;recurso&gt;.ts**: consultas ao Supabase e mapeamento das linhas do banco para os tipos de `@types/`.

### Clientes Supabase

| Arquivo | Chave | RLS | Quando usar |
| --- | --- | --- | --- |
| [lib/supabase/server.ts](../src/lib/supabase/server.ts) | publicável + cookie | Vale | Rotas de API e server components. É o padrão |
| [lib/supabase/middleware.ts](../src/lib/supabase/middleware.ts) | publicável + cookie | Vale | Só no middleware |
| [lib/supabase/admin.ts](../src/lib/supabase/admin.ts) | secreta | **Ignorada** | Só quando o cliente do usuário não resolve: criar o perfil logo após o `signUp` e trocar o email depois de conferir a senha |

O cliente admin importa `server-only`, então o build quebra se alguém tentar usá-lo em um componente de cliente.

## Autenticação e sessão

- Login, cadastro e logout passam pelas rotas `/api/auth/*`, que usam o Supabase Auth. A sessão fica em cookie httpOnly gerenciado pelo `@supabase/ssr`. O navegador nunca recebe o token.
- O [middleware](../src/middleware.ts) roda em toda requisição, exceto arquivos estáticos, e faz três coisas:
  1. **CSRF**: em `/api/*`, métodos que alteram estado (`POST`, `PUT`, `PATCH`, `DELETE`) precisam do header `Origin` igual à origem do app. Se não vier, a resposta é 403.
  2. **Sessão**: chama `supabase.auth.getUser()`, que valida e renova o token.
  3. **Rotas**: sem sessão, `/api/*` responde 401 (exceto login e cadastro) e as telas privadas redirecionam para `/login`. Com sessão, `/login` e `/register` redirecionam para `/home`.
- Para trocar email ou senha, o aluno precisa informar a senha atual ([lib/api/perfil.ts](../src/lib/api/perfil.ts)). Assim, quem pegar uma sessão aberta não consegue tomar a conta.

## Cadastro

O cadastro é um wizard controlado pelo [RegisterContext](../src/context/RegisterContext/index.tsx):

1. **Dados pessoais**: nome, email e senha.
2. **Curso**: importação do histórico em PDF ([HistoricoImport](../src/app/(public)/register/components/HistoricoImport.tsx)) ou preenchimento manual.
3. **Semestre atual**: disciplinas que o aluno está cursando.

O PDF é lido **no navegador** com `pdfjs-dist` ([utils/historicoAcademico](../src/utils/historicoAcademico)). O arquivo não sobe para o servidor. Só os dados extraídos (curso, disciplinas e tentativas) vão no corpo do `POST /api/auth/register`.

No servidor, a rota faz o `signUp` e, com o cliente admin, chama a função `registrar_aluno`, que grava perfil, disciplinas e tentativas em uma transação. Se essa etapa falhar, a rota remove o usuário recém-criado. O cliente admin é necessário porque, com confirmação de email ligada, ainda não existe sessão nesse momento.

## Progressão de curso

Não existe catálogo global de disciplinas. Cada aluno tem as próprias, vindas do histórico ou do cadastro manual. Cada vez que o aluno cursa uma disciplina vira uma linha em `tentativas`.

O status exibido é derivado das tentativas ([lib/api/progresso.ts](../src/lib/api/progresso.ts)):

- tem tentativa `APROVADA` → concluída
- senão, tem `ANDAMENTO` → em andamento
- senão → pendente (inclusive se só houver reprovações ou trancamentos)

As operações que mexem em várias linhas ficam em funções do Postgres, para rodar em uma transação: `encerrar_semestre` e `definir_situacao_disciplina`. Veja [banco-de-dados.md](banco-de-dados.md).

## Ambiente de Estudo

O código fica em [lib/api/ambienteEstudo](../src/lib/api/ambienteEstudo).

- **Materiais:** o arquivo vai para o bucket privado `materiais`. O texto é extraído no servidor (PDF por página, PPTX por slide, DOCX e texto puro), quebrado em trechos e gravado em `trechos` com o embedding.
- **Busca:** cada pergunta busca os trechos por similaridade de embedding (`buscar_trechos`, pgvector) e por palavra-chave, e junta os dois resultados. Sem o modelo de embeddings, fica só a palavra-chave.
- **Geração:** chat, resumos, atividades, simulados e correção chamam a IA local em `LM_STUDIO_URL/chat/completions`. Quando a saída é estruturada, o pedido usa `response_format: json_schema` e o resultado passa pelo zod antes de ser salvo. Os prompts mandam ignorar instruções escritas dentro do material ou da resposta do aluno.
- **Citações:** a IA informa o número do trecho usado e o servidor troca pelo material e pela página, que o leitor de PDF abre direto.
- **XP:** cada ação vira uma linha em `xp_eventos`, gravada pelo servidor com o cliente admin e única por tipo e referência, então repetir a mesma ação não rende pontos.

## Questionários

A tela saiu do menu, mas as rotas continuam.

- Criar e editar sempre substitui o questionário inteiro pela função `salvar_questionario`. As resoluções guardam só o placar, então continuam válidas depois da edição.
- A geração por IA ([lib/api/ia.ts](../src/lib/api/ia.ts)) usa a mesma IA local do Ambiente de Estudo, com `response_format: json_schema` e validação com zod. O tempo limite é de 180 s. Sem `LM_STUDIO_URL`, a rota responde 503.
- As questões geradas voltam para o editor e só são salvas quando o aluno confirma.
- O editor trabalha sobre um estado de rascunho ([questoes/components/rascunho.ts](../src/app/(private)/questoes/components/rascunho.ts)), que é convertido e validado com o mesmo schema zod da API antes de salvar.

## Pomodoro

- O timer roda no cliente ([usePomodoro](../src/app/(private)/pomodoro/hooks/usePomodoro.ts)). As configurações (durações, ciclos, meta diária, som, ruído, notificações) são sincronizadas em `dados_aluno` (chave `xor:pomodoro:config`). A disciplina e a tarefa selecionadas ficam só no `localStorage`.
- Só os blocos de foco concluídos vão para o banco (`sessoes_foco`). As estatísticas são calculadas no cliente em [utils/estatisticas.ts](../src/app/(private)/pomodoro/utils/estatisticas.ts).

## Dados sincronizados

Tarefas, calendário, notas, plano de matrícula, playlists e preferências usam o [useSincronizado](../src/hooks/useSincronizado.ts): o `localStorage` funciona como cache e a versão oficial fica em `dados_aluno`, via `/api/dados`. Na primeira vez, o que estava só no navegador sobe para o servidor. Sem conexão, o app continua funcionando só no navegador.

## Convenções do código

- Nomes, mensagens e comentários em português.
- Rotas de API sempre com `handler(...)`, `requireUser()` e `parseBody(...)`. Não acessar `request.json()` direto.
- Novos recursos seguem o padrão: tipo em `@types/`, schema em `lib/api/schemas.ts`, consulta em `lib/api/`, rota em `app/api/`, service em `services/`, hook em `hooks/` e chave em `queryKeys.ts`.
- Mudança de schema entra como nova migração em `supabase/migrations/`, com RLS ligado e políticas por `auth.uid()`.
