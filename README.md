# XOR — Progressão de curso para alunos da UFC

O XOR ajuda o aluno da Universidade Federal do Ceará a acompanhar a própria graduação. O aluno importa o histórico do SIGAA (ou cadastra as disciplinas à mão) e passa a ver o que já cursou, o que está cursando e o que falta. Junto disso, o app oferece um Pomodoro com estatísticas, questionários para revisão (criados à mão ou gerados por IA) e um chat com IA.

## Funcionalidades

| Módulo | O que faz |
| --- | --- |
| **Cadastro** | Cria a conta e monta o perfil acadêmico a partir do PDF do histórico do SIGAA ou de cadastro manual. |
| **Progressão de curso** | Lista disciplinas pendentes, em andamento e concluídas; permite adicionar, editar, excluir e mudar a situação de cada uma; encerra o semestre registrando as notas e abrindo as disciplinas do próximo. |
| **Pomodoro** | Temporizador configurável. Cada bloco de foco concluído é salvo, com disciplina e tarefa opcionais, e alimenta as estatísticas (meta diária, histórico do dia, gráfico da semana, tempo por disciplina). |
| **Questionários** | Questões de múltipla escolha criadas à mão ou geradas por IA a partir de um tema ou material. O aluno resolve, vê o placar e o histórico de resoluções. |
| **Perfil** | Edita dados gerais e troca email ou senha (exige a senha atual). |
| **Chat com IA** | Assistente para dúvidas acadêmicas. |

## Stack

- **Next.js 15** (App Router) + **React 19** + **TypeScript**
- **Supabase**: Auth e Postgres com RLS
- **TanStack React Query** e **axios** no cliente
- **zod** e **react-hook-form** para validação
- **Tailwind CSS 4** e Headless UI
- **pdfjs-dist** para ler o histórico do SIGAA no navegador
- **LM Studio** (API compatível com OpenAI) para gerar questões; **Together AI** para o chat
- ESLint, Prettier e Husky

## Como rodar

Pré-requisitos: Node.js 18 ou superior, npm e um projeto no Supabase.

1. Instale as dependências:

   ```bash
   npm install
   ```

2. Crie o arquivo `.env.local` na raiz (ele já está no `.gitignore` e nunca deve ser commitado):

   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://<projeto>.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<chave publicável>
   SUPABASE_SECRET_KEY=<chave secreta>

   # Opcionais
   NEXT_PUBLIC_SITE_URL=https://<domínio do app>
   LM_STUDIO_URL=http://localhost:1234/v1
   LM_STUDIO_MODEL=<modelo carregado no LM Studio>
   TOGETHER_API_KEY=<chave da Together AI>
   ```

   | Variável | Onde é usada | Obrigatória |
   | --- | --- | --- |
   | `NEXT_PUBLIC_SUPABASE_URL` | Cliente Supabase (servidor e middleware) | Sim |
   | `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Cliente Supabase com a sessão do usuário | Sim |
   | `SUPABASE_SECRET_KEY` | Cliente admin, só no servidor (cadastro e troca de email) | Sim |
   | `NEXT_PUBLIC_SITE_URL` | Links absolutos do Open Graph (prévia ao compartilhar o link) | Não. O padrão é `http://localhost:3000` |
   | `LM_STUDIO_URL` | Geração de questões com IA | Não. Sem ela, a geração responde 503 |
   | `LM_STUDIO_MODEL` | Modelo usado pelo LM Studio | Não |
   | `TOGETHER_API_KEY` | Chat com IA | Só para o chat |

   A chave secreta ignora o RLS. Ela nunca pode ganhar o prefixo `NEXT_PUBLIC_`, senão vai parar no bundle do navegador.

3. Aplique as migrações de [supabase/migrations](supabase/migrations) no banco, em ordem, pelo Supabase CLI (`supabase db push`) ou pelo SQL Editor.

4. Suba o servidor de desenvolvimento:

   ```bash
   npm run dev
   ```

   O app fica em `http://localhost:3000`.

## Scripts

| Comando | O que faz |
| --- | --- |
| `npm run dev` | Servidor de desenvolvimento com Turbopack |
| `npm run build` | Build de produção |
| `npm run start` | Sobe o build de produção |
| `npm run lint` | ESLint |
| `npm run tsc` | Checagem de tipos sem emitir arquivos |

O hook [.husky/pre-push](.husky/pre-push) roda `tsc`, `lint` e `build`, e o push só sai se os três passarem. Para ativá-lo, rode `npx husky` uma vez depois do `npm install`.

## Estrutura

```text
src/
├── app/
│   ├── (public)/          # Login e cadastro (só para quem está deslogado)
│   ├── (private)/         # Telas autenticadas: home, courseProgression, pomodoro,
│   │                      # questoes, perfil, chat, extrator
│   └── api/               # Rotas de API (backend do app)
├── components/            # Componentes de UI compartilhados
├── context/               # RegisterContext (fluxo de cadastro) e ReactQueryProvider
├── hooks/
│   ├── queries/           # useQuery por recurso
│   ├── mutations/         # useMutation por recurso
│   └── queryKeys.ts       # Chaves de cache do React Query
├── services/              # Funções axios que chamam /api (uma por endpoint)
├── lib/
│   ├── api/               # Regras do backend: http.ts, schemas zod, IA, consultas
│   └── supabase/          # Clientes Supabase: server, middleware e admin
├── utils/                 # Extrator do histórico do SIGAA, helpers de questionário
├── helpers/consts/        # Constantes de UI
├── @types/                # Tipos compartilhados entre front e API
└── middleware.ts          # Sessão, proteção de rotas e CSRF
supabase/migrations/       # Schema do banco, RLS e funções
```

## Documentação

- [Arquitetura](docs/arquitetura.md): fluxo de uma requisição, autenticação, camadas e convenções
- [Banco de dados](docs/banco-de-dados.md): tabelas, RLS e funções do Postgres
- [API](docs/api.md): endpoints, entradas e respostas

## Convenções

- Código, nomes e mensagens em português.
- Commits no padrão [Conventional Commits](https://www.conventionalcommits.org/pt-br/), por exemplo `feat(pomodoro): ...` ou `fix(auth): ...`.
- Prettier sem ponto e vírgula e com aspas simples. Veja [.prettierrc](.prettierrc).
