-- =============================================================
-- Ambiente de Estudo: um espaço por cadeira (ou tema livre) com
-- materiais, chats com IA, resumos, atividades e simulados.
--
-- Os ids são uuid porque o contrato do front usa ids string.
-- Estruturas aninhadas (questões, flashcards, citações, respostas,
-- resultado) ficam em jsonb, no mesmo formato dos tipos do front
-- (src/@types/AmbienteEstudo). As tabelas filhas referenciam o pai
-- por (id, aluno_id), como no resto do schema.
-- =============================================================

-- Marca que os ambientes iniciais (um por cadeira em andamento) já
-- foram criados, para não recriá-los depois que o aluno excluir.
create table public.ambientes_config (
  aluno_id   uuid primary key references public.perfis (id) on delete cascade,
  semeado_em timestamptz not null default now()
);

create table public.ambientes (
  id                uuid primary key default gen_random_uuid(),
  aluno_id          uuid not null references public.perfis (id) on delete cascade,
  nome              text not null check (char_length(nome) between 1 and 80),
  descricao         text          check (char_length(descricao) <= 300),
  cor               text not null default 'azul' check (cor in
                      ('cinza', 'azul', 'verde', 'roxo', 'laranja', 'rosa', 'ciano', 'ambar')),
  origem            text not null default 'LIVRE' check (origem in ('CADEIRA', 'LIVRE')),
  disciplina_codigo text          check (char_length(disciplina_codigo) <= 30),
  arquivado         boolean not null default false,
  criado_em         timestamptz not null default now(),
  atualizado_em     timestamptz not null default now(),
  unique (id, aluno_id)
);

create index ambientes_aluno_idx on public.ambientes (aluno_id, atualizado_em desc);

create table public.materiais (
  id             uuid primary key default gen_random_uuid(),
  aluno_id       uuid not null,
  ambiente_id    uuid not null,
  nome           text not null check (char_length(nome) between 1 and 255),
  tipo           text not null check (tipo in ('PDF', 'DOCX', 'PPTX', 'IMAGEM', 'TEXTO')),
  tamanho_bytes  bigint not null default 0 check (tamanho_bytes >= 0),
  paginas        integer check (paginas >= 0),
  status         text not null default 'PROCESSANDO'
                   check (status in ('ENVIANDO', 'PROCESSANDO', 'PRONTO', 'ERRO')),
  mensagem_erro  text,
  origem         text not null default 'UPLOAD' check (origem in ('UPLOAD', 'CHAT')),
  -- Só para material do tipo TEXTO (texto colado pelo aluno).
  conteudo_texto text check (char_length(conteudo_texto) <= 100000),
  -- Caminho no bucket "materiais": <aluno_id>/<material_id>/<nome>.
  storage_path   text,
  criado_em      timestamptz not null default now(),
  unique (id, aluno_id),
  foreign key (ambiente_id, aluno_id)
    references public.ambientes (id, aluno_id) on delete cascade
);

create index materiais_ambiente_idx on public.materiais (ambiente_id, criado_em desc);

-- Texto extraído dos materiais, por página, usado como contexto da IA.
create table public.trechos (
  id          bigint generated always as identity primary key,
  aluno_id    uuid    not null,
  material_id uuid    not null,
  pagina      integer check (pagina >= 1),
  ordem       integer not null check (ordem >= 0),
  texto       text    not null,
  foreign key (material_id, aluno_id)
    references public.materiais (id, aluno_id) on delete cascade
);

create index trechos_material_idx on public.trechos (material_id, ordem);

create table public.chats (
  id            uuid primary key default gen_random_uuid(),
  aluno_id      uuid not null,
  ambiente_id   uuid not null,
  titulo        text not null check (char_length(titulo) between 1 and 120),
  material_ids  uuid[] not null default '{}',
  modo          text not null default 'TUTOR' check (modo in ('TUTOR', 'EXPLICACAO')),
  fixado        boolean not null default false,
  criado_em     timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  unique (id, aluno_id),
  foreign key (ambiente_id, aluno_id)
    references public.ambientes (id, aluno_id) on delete cascade
);

create index chats_ambiente_idx on public.chats (ambiente_id, atualizado_em desc);

create table public.mensagens (
  id               uuid primary key default gen_random_uuid(),
  aluno_id         uuid not null,
  chat_id          uuid not null,
  papel            text not null check (papel in ('ALUNO', 'ASSISTENTE')),
  conteudo         text not null default '',
  anexo_ids        uuid[] not null default '{}',
  citacoes         jsonb not null default '[]'::jsonb,
  fora_do_material boolean not null default false,
  status           text not null default 'CONCLUIDA'
                     check (status in ('TRANSMITINDO', 'CONCLUIDA', 'ERRO')),
  criado_em        timestamptz not null default clock_timestamp(),
  foreign key (chat_id, aluno_id)
    references public.chats (id, aluno_id) on delete cascade
);

create index mensagens_chat_idx on public.mensagens (chat_id, criado_em);

create table public.resumos (
  id                 uuid primary key default gen_random_uuid(),
  aluno_id           uuid not null,
  ambiente_id        uuid not null,
  titulo             text not null check (char_length(titulo) between 1 and 200),
  formato            text not null check (formato in ('TOPICOS', 'CORRIDO', 'GLOSSARIO', 'MAPA_MENTAL')),
  material_ids       uuid[] not null default '{}',
  conteudo           text not null default '',
  citacoes           jsonb not null default '[]'::jsonb,
  editado_pelo_aluno boolean not null default false,
  origem_chat_id     uuid,
  status             text not null default 'GERANDO' check (status in ('GERANDO', 'PRONTO', 'ERRO')),
  mensagem_erro      text,
  criado_em          timestamptz not null default now(),
  atualizado_em      timestamptz not null default now(),
  foreign key (ambiente_id, aluno_id)
    references public.ambientes (id, aluno_id) on delete cascade
);

create index resumos_ambiente_idx on public.resumos (ambiente_id, criado_em desc);

create table public.atividades (
  id               uuid primary key default gen_random_uuid(),
  aluno_id         uuid not null,
  ambiente_id      uuid not null,
  titulo           text not null check (char_length(titulo) between 1 and 200),
  tipo             text not null check (tipo in ('QUIZ', 'VERDADEIRO_FALSO', 'LACUNAS', 'DISCURSIVA', 'FLASHCARDS')),
  material_ids     uuid[] not null default '{}',
  dificuldade      text not null default 'MISTA' check (dificuldade in ('FACIL', 'MEDIA', 'DIFICIL', 'MISTA')),
  topico           text check (char_length(topico) <= 200),
  questoes         jsonb not null default '[]'::jsonb,
  flashcards       jsonb not null default '[]'::jsonb,
  origem_chat_id   uuid,
  origem_resumo_id uuid,
  status           text not null default 'GERANDO' check (status in ('GERANDO', 'PRONTO', 'ERRO')),
  mensagem_erro    text,
  criado_em        timestamptz not null default now(),
  unique (id, aluno_id),
  foreign key (ambiente_id, aluno_id)
    references public.ambientes (id, aluno_id) on delete cascade
);

create index atividades_ambiente_idx on public.atividades (ambiente_id, criado_em desc);

create table public.tentativas_atividade (
  id                    uuid primary key default gen_random_uuid(),
  aluno_id              uuid not null,
  atividade_id          uuid not null,
  respostas             jsonb not null default '{}'::jsonb,
  correcoes_discursivas jsonb not null default '{}'::jsonb,
  confirmadas           jsonb not null default '[]'::jsonb,
  indice_atual          integer not null default 0 check (indice_atual >= 0),
  acertos               integer not null default 0 check (acertos >= 0),
  total                 integer not null default 0 check (total >= 0),
  iniciada_em           timestamptz not null default now(),
  concluida_em          timestamptz,
  foreign key (atividade_id, aluno_id)
    references public.atividades (id, aluno_id) on delete cascade
);

create index tentativas_atividade_idx on public.tentativas_atividade (atividade_id, iniciada_em desc);

create table public.simulados (
  id            uuid primary key default gen_random_uuid(),
  aluno_id      uuid not null,
  ambiente_id   uuid not null,
  titulo        text not null check (char_length(titulo) between 1 and 200),
  config        jsonb not null,
  questoes      jsonb not null default '[]'::jsonb,
  status        text not null default 'GERANDO' check (status in ('GERANDO', 'PRONTO', 'ERRO')),
  mensagem_erro text,
  criado_em     timestamptz not null default now(),
  unique (id, aluno_id),
  foreign key (ambiente_id, aluno_id)
    references public.ambientes (id, aluno_id) on delete cascade
);

create index simulados_ambiente_idx on public.simulados (ambiente_id, criado_em desc);

create table public.tentativas_simulado (
  id                 uuid primary key default gen_random_uuid(),
  aluno_id           uuid not null,
  simulado_id        uuid not null,
  iniciada_em        timestamptz not null default now(),
  -- Definido pelo servidor; nulo no modo treino.
  prazo_final        timestamptz,
  entregue_em        timestamptz,
  entrega_automatica boolean not null default false,
  respostas          jsonb not null default '{}'::jsonb,
  marcadas           jsonb not null default '[]'::jsonb,
  tempo_por_questao  jsonb not null default '{}'::jsonb,
  resultado          jsonb,
  foreign key (simulado_id, aluno_id)
    references public.simulados (id, aluno_id) on delete cascade
);

create index tentativas_simulado_idx on public.tentativas_simulado (simulado_id, iniciada_em desc);

create table public.reportes_ia (
  id         uuid primary key default gen_random_uuid(),
  aluno_id   uuid not null references public.perfis (id) on delete cascade,
  alvo_tipo  text not null check (alvo_tipo in ('MENSAGEM', 'RESUMO', 'QUESTAO', 'FLASHCARD', 'CORRECAO')),
  alvo_id    text not null check (char_length(alvo_id) <= 100),
  motivo     text not null check (motivo in ('INCORRETO', 'SEM_FONTE', 'ENVIESADO', 'OFENSIVO', 'OUTRO')),
  comentario text check (char_length(comentario) <= 2000),
  criado_em  timestamptz not null default now()
);

create trigger ambientes_atualizado_em
  before update on public.ambientes
  for each row execute function public.tocar_atualizado_em();

create trigger resumos_atualizado_em
  before update on public.resumos
  for each row execute function public.tocar_atualizado_em();

-- RLS ----------------------------------------------------------
-- Todas as tabelas seguem a mesma regra: o aluno só enxerga e altera
-- as próprias linhas. As políticas são criadas em laço para não
-- repetir o mesmo texto onze vezes.

do $$
declare
  tabela text;
  operacao text;
  tabelas text[] := array[
    'ambientes_config', 'ambientes', 'materiais', 'trechos', 'chats',
    'mensagens', 'resumos', 'atividades', 'tentativas_atividade',
    'simulados', 'tentativas_simulado', 'reportes_ia'
  ];
begin
  foreach tabela in array tabelas loop
    execute format('alter table public.%I enable row level security', tabela);
    execute format('revoke all on public.%I from anon', tabela);

    foreach operacao in array array['select', 'insert', 'update', 'delete'] loop
      execute format(
        'create policy %I on public.%I for %s to authenticated %s',
        'aluno ' || operacao || ' proprias linhas',
        tabela,
        operacao,
        case operacao
          when 'insert' then 'with check ((select auth.uid()) = aluno_id)'
          when 'update' then 'using ((select auth.uid()) = aluno_id) with check ((select auth.uid()) = aluno_id)'
          else 'using ((select auth.uid()) = aluno_id)'
        end
      );
    end loop;

    -- O update é concedido coluna a coluna logo abaixo.
    execute format('revoke update on public.%I from authenticated', tabela);
    execute format('grant select, insert, delete on public.%I to authenticated', tabela);
  end loop;
end
$$;

grant update (nome, descricao, cor, origem, disciplina_codigo, arquivado, atualizado_em)
  on public.ambientes to authenticated;
grant update (nome, paginas, status, mensagem_erro, storage_path)
  on public.materiais to authenticated;
grant update (titulo, material_ids, modo, fixado, atualizado_em)
  on public.chats to authenticated;
grant update (conteudo, citacoes, fora_do_material, status)
  on public.mensagens to authenticated;
grant update (titulo, conteudo, citacoes, editado_pelo_aluno, status, mensagem_erro)
  on public.resumos to authenticated;
grant update (questoes, flashcards, status, mensagem_erro)
  on public.atividades to authenticated;
grant update (respostas, correcoes_discursivas, confirmadas, indice_atual, acertos, total, concluida_em)
  on public.tentativas_atividade to authenticated;
grant update (questoes, status, mensagem_erro)
  on public.simulados to authenticated;
grant update (respostas, marcadas, tempo_por_questao, entregue_em, entrega_automatica, resultado)
  on public.tentativas_simulado to authenticated;
-- ambientes_config, trechos e reportes_ia não são editados.

-- Storage ------------------------------------------------------
-- Bucket privado. Cada aluno só acessa a própria pasta (<aluno_id>/...).

insert into storage.buckets (id, name, public)
values ('materiais', 'materiais', false)
on conflict (id) do nothing;

create policy "aluno le os proprios arquivos de material"
  on storage.objects for select to authenticated
  using (bucket_id = 'materiais' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "aluno envia os proprios arquivos de material"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'materiais' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "aluno exclui os proprios arquivos de material"
  on storage.objects for delete to authenticated
  using (bucket_id = 'materiais' and (storage.foldername(name))[1] = (select auth.uid())::text);
