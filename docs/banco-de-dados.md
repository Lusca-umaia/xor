# Banco de dados

O banco é o Postgres do Supabase. O schema fica versionado em [supabase/migrations](../supabase/migrations):

| Migração | Conteúdo |
| --- | --- |
| `20261029000000_init.sql` | `perfis`, `disciplinas`, `tentativas`, `registrar_aluno`, `encerrar_semestre` |
| `20261029010000_edicao_disciplinas.sql` | Exclusão e troca de código de disciplinas, `definir_situacao_disciplina` |
| `20261029020000_questionarios.sql` | `questionarios`, `questoes`, `resolucoes`, `salvar_questionario` |
| `20261029020000_sessoes_foco.sql` | `sessoes_foco` (Pomodoro) |
| `20261030000000_ambiente_estudo.sql` | Ambiente de Estudo: `ambientes`, `materiais`, `trechos`, `chats`, `mensagens`, `resumos`, `atividades`, `simulados`, tentativas, `reportes_ia` e o bucket `materiais` |
| `20261031000000_embeddings_trechos.sql` | `pgvector`: colunas `embedding` e `modelo_embedding` em `trechos`, índice HNSW e a função `buscar_trechos` |
| `20261101000000_ambientes_sob_demanda.sql` | Remove os ambientes criados automaticamente e nunca usados e a tabela `ambientes_config` |

## Princípios

- **RLS ligado em todas as tabelas.** As políticas liberam só as linhas em que `aluno_id = auth.uid()` (em `perfis`, `id = auth.uid()`). O papel `anon` não lê nada.
- **Permissões por coluna.** O `update` é revogado e concedido de volta só nas colunas editáveis. Por exemplo, o aluno não consegue mudar o `aluno_id` de uma linha.
- **Chaves compostas `(id, aluno_id)`.** As tabelas filhas referenciam o pai por `(id, aluno_id)`. Assim, o banco garante que uma tentativa, questão ou sessão sempre aponta para um registro do mesmo aluno.
- **Funções `security invoker` por padrão.** Elas rodam como o aluno, então o RLS continua valendo. A única exceção é `registrar_aluno` (`security definer`), que só o `service_role` pode executar.
- **`search_path = ''`** em todas as funções, com nomes sempre qualificados (`public.tabela`).

## Tabelas

### `perfis`

Um por usuário do Supabase Auth (`id` = `auth.users.id`).

| Coluna | Tipo | Observação |
| --- | --- | --- |
| `id` | uuid | PK, FK para `auth.users`, cascade |
| `nome` | text | 1 a 120 caracteres |
| `matricula` | text | opcional |
| `curso_nome` | text | obrigatório |
| `curso_codigo` | text | opcional, não editável |
| `semestre_atual` | integer | 1 a 30 |
| `carga_optativa_exigida` | integer | horas de optativas exigidas pelo curso |
| `criado_em`, `atualizado_em` | timestamptz | `atualizado_em` é mantido por trigger |

O perfil só é criado por `registrar_aluno`. O aluno não pode inserir nem excluir o próprio perfil.

### `disciplinas`

As disciplinas de cada aluno. Não há catálogo global. O `codigo` identifica a mesma disciplina entre alunos.

| Coluna | Tipo | Observação |
| --- | --- | --- |
| `id` | bigint | identity |
| `aluno_id` | uuid | FK para `perfis` |
| `codigo` | text | único por aluno, gravado em maiúsculas |
| `nome` | text | |
| `carga_horaria` | integer | 0 a 2000 |
| `carater` | text | `OBRIGATORIA` ou `OPTATIVA` |
| `semestre` | integer | semestre sugerido na grade |

### `tentativas`

Cada vez que o aluno cursou ou está cursando uma disciplina.

| Coluna | Tipo | Observação |
| --- | --- | --- |
| `disciplina_id`, `aluno_id` | | FK composta para `disciplinas`, cascade |
| `status` | text | `ANDAMENTO`, `APROVADA`, `REPROVADA` ou `TRANCADA` |
| `nota` | numeric(4,2) | 0 a 10 |
| `periodo` | text | ex.: `2025.1` |
| `semestre` | integer | semestre do aluno em que foi cursada |

Índices únicos parciais garantem **no máximo uma tentativa em andamento e uma aprovação por disciplina**.

### `questionarios`, `questoes`, `resolucoes`

- `questionarios`: título, descrição, `dificuldade` (`FACIL`, `MEDIA`, `DIFICIL`), `origem` (`MANUAL` ou `IA`) e disciplina opcional. Se a disciplina for excluída, o questionário perde o vínculo, mas continua existindo.
- `questoes`: `enunciado`, `alternativas` (array jsonb com 2 a 6 itens), `correta` (índice a partir de 0, validado contra o tamanho do array) e `explicacao`. Ordenadas por `ordem`.
- `resolucoes`: `acertos`, `em_branco`, `total`, `duracao_segundos` e `respostas` (jsonb). Não podem ser editadas e são excluídas junto com o questionário.

### `sessoes_foco`

Um bloco de foco concluído no Pomodoro.

| Coluna | Tipo | Observação |
| --- | --- | --- |
| `disciplina_id` | bigint | opcional. Se a disciplina for excluída, vira `null` |
| `tarefa` | text | até 200 caracteres |
| `duracao_segundos` | integer | 60 a 14400 |
| `iniciada_em`, `concluida_em` | timestamptz | `concluida_em >= iniciada_em` |

O aluno pode ler, criar e excluir as próprias sessões, mas não editá-las.

### Ambiente de Estudo

Um ambiente por cadeira (ou tema livre), com o conteúdo de estudo gerado pela IA. Diferente das outras tabelas, os ids são `uuid`, porque o contrato do front usa ids string. Estruturas aninhadas ficam em `jsonb`, no mesmo formato dos tipos de [src/@types/AmbienteEstudo](../src/@types/AmbienteEstudo/index.ts).

| Tabela | Conteúdo |
| --- | --- |
| `ambientes` | Nome, cor, disciplina vinculada (`disciplina_codigo`, opcional) e `arquivado` |
| `materiais` | Arquivos enviados ou texto colado. `status` vai de `PROCESSANDO` a `PRONTO` (ou `ERRO`) depois da extração do texto. O arquivo fica no Storage em `storage_path` |
| `trechos` | Texto extraído dos materiais, por página, usado como contexto da IA, com o embedding (768 dimensões) para a busca semântica |
| `chats`, `mensagens` | Conversas com a IA. `chats.material_ids` são os materiais usados como contexto; `mensagens.citacoes` guarda as fontes |
| `resumos` | Resumos gerados. `status` `GERANDO` enquanto a IA trabalha |
| `atividades`, `tentativas_atividade` | Quiz, V/F, lacunas, discursiva e flashcards (`questoes` e `flashcards` em jsonb) e o andamento de cada tentativa |
| `simulados`, `tentativas_simulado` | Simulados e tentativas. `prazo_final` é definido pelo servidor; o `resultado` (jsonb) é calculado na entrega |
| `reportes_ia` | Conteúdo gerado pela IA que o aluno reportou (só leitura e inserção) |

As tabelas filhas referenciam o pai por `(id, aluno_id)` e são apagadas em cascata com o ambiente. O RLS segue a regra das demais tabelas, e o `update` é concedido só nas colunas que mudam (status, conteúdo gerado, respostas).

**Storage:** bucket privado `materiais`, com os arquivos em `<aluno_id>/<material_id>/<nome>`. As políticas de `storage.objects` só deixam o aluno ler, enviar e excluir dentro da própria pasta.

## Funções

### `registrar_aluno(p_aluno uuid, p_dados jsonb)`

Cria perfil, disciplinas e tentativas em uma transação. É `security definer` e só o `service_role` pode executá-la. É chamada por `POST /api/auth/register` com o cliente admin, logo após o `signUp`.

```json
{
  "nome": "...", "matricula": "...", "curso_nome": "...", "curso_codigo": "...",
  "semestre_atual": 5, "carga_optativa_exigida": 256,
  "disciplinas": [{ "codigo": "CK0101", "nome": "...", "carga_horaria": 64, "carater": "OBRIGATORIA", "semestre": 1 }],
  "tentativas":  [{ "codigo": "CK0101", "status": "APROVADA", "nota": 8.5, "periodo": "2024.1", "semestre": 1 }]
}
```

### `encerrar_semestre(p_resultados jsonb, p_proximas bigint[])`

1. Exige um resultado (`APROVADA`, `REPROVADA` ou `TRANCADA`) para **cada** tentativa em andamento.
2. Grava os resultados. `TRANCADA` não tem nota.
3. Avança `perfis.semestre_atual`.
4. Abre tentativas `ANDAMENTO` para as disciplinas em `p_proximas` que ainda não estão aprovadas nem em andamento.

### `definir_situacao_disciplina(p_disciplina, p_status, p_nota, p_periodo)`

Muda a situação de uma disciplina sem deixar o histórico incoerente:

| `p_status` | Efeito |
| --- | --- |
| `PENDENTE` | Remove andamento e aprovação. As reprovações ficam no histórico |
| `ANDAMENTO` | Abre uma tentativa no semestre atual. Falha se a disciplina já estiver aprovada |
| `APROVADA`, `REPROVADA`, `TRANCADA` | Encerra a tentativa em andamento. Se não houver, corrige a aprovação existente ou registra uma tentativa nova |

### `salvar_questionario(p_questionario bigint, p_dados jsonb)`

Com `p_questionario` nulo, cria o questionário. Com id, atualiza os dados e **substitui todas as questões**. Devolve o id.

## Como alterar o schema

1. Crie um arquivo novo em `supabase/migrations/` com prefixo de data e hora **único** (`AAAAMMDDHHMMSS_descricao.sql`). Não edite uma migração que já foi aplicada.
2. Ligue o RLS em toda tabela nova e escreva as políticas por `auth.uid()`.
3. Revogue `update` e conceda só nas colunas editáveis.
4. Funções novas: `security invoker` e `set search_path = ''`, com `revoke execute ... from public, anon`.
