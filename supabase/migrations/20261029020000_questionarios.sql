-- =============================================================
-- Questionários do aluno: questões de múltipla escolha, criadas à
-- mão ou geradas por IA, e o histórico de resoluções.
--
-- As alternativas ficam em jsonb na própria questão. Editar um
-- questionário substitui todas as questões; as resoluções guardam
-- só o placar, então continuam válidas depois da edição.
-- =============================================================

create table public.questionarios (
  id            bigint generated always as identity primary key,
  aluno_id      uuid not null references public.perfis (id) on delete cascade,
  disciplina_id bigint,
  titulo        text not null check (char_length(titulo) between 1 and 200),
  descricao     text          check (char_length(descricao) <= 1000),
  dificuldade   text          check (dificuldade in ('FACIL', 'MEDIA', 'DIFICIL')),
  origem        text not null default 'MANUAL' check (origem in ('MANUAL', 'IA')),
  criado_em     timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  unique (id, aluno_id),
  -- A disciplina precisa ser do mesmo aluno; excluí-la só desvincula.
  foreign key (disciplina_id, aluno_id)
    references public.disciplinas (id, aluno_id) on delete set null (disciplina_id)
);

create index questionarios_aluno_idx on public.questionarios (aluno_id, atualizado_em desc);
create index questionarios_disciplina_idx on public.questionarios (disciplina_id);

create table public.questoes (
  id              bigint generated always as identity primary key,
  aluno_id        uuid    not null,
  questionario_id bigint  not null,
  ordem           integer not null check (ordem >= 0),
  enunciado       text    not null check (char_length(enunciado) between 1 and 4000),
  -- ["texto da alternativa A", "texto da B", ...]
  alternativas    jsonb   not null check (
    case when jsonb_typeof(alternativas) = 'array'
         then jsonb_array_length(alternativas) between 2 and 6
         else false end
  ),
  -- Índice (a partir de 0) da alternativa correta.
  correta         smallint not null,
  explicacao      text     check (char_length(explicacao) <= 4000),
  check (correta >= 0 and correta < jsonb_array_length(alternativas)),
  foreign key (questionario_id, aluno_id)
    references public.questionarios (id, aluno_id) on delete cascade
);

create index questoes_questionario_idx on public.questoes (questionario_id, ordem);

create table public.resolucoes (
  id               bigint generated always as identity primary key,
  aluno_id         uuid    not null,
  questionario_id  bigint  not null,
  acertos          integer not null check (acertos >= 0),
  em_branco        integer not null default 0 check (em_branco >= 0),
  total            integer not null check (total > 0),
  duracao_segundos integer check (duracao_segundos >= 0),
  -- [{ "questao_id": 1, "alternativa": 2, "correta": 2 }, ...]
  respostas        jsonb   not null default '[]'::jsonb,
  criado_em        timestamptz not null default now(),
  check (acertos + em_branco <= total),
  foreign key (questionario_id, aluno_id)
    references public.questionarios (id, aluno_id) on delete cascade
);

create index resolucoes_questionario_idx on public.resolucoes (questionario_id, criado_em desc);

create trigger questionarios_atualizado_em
  before update on public.questionarios
  for each row execute function public.tocar_atualizado_em();

-- RLS ----------------------------------------------------------

alter table public.questionarios enable row level security;
alter table public.questoes      enable row level security;
alter table public.resolucoes    enable row level security;

create policy "aluno le os proprios questionarios"
  on public.questionarios for select to authenticated
  using ((select auth.uid()) = aluno_id);

create policy "aluno cria os proprios questionarios"
  on public.questionarios for insert to authenticated
  with check ((select auth.uid()) = aluno_id);

create policy "aluno edita os proprios questionarios"
  on public.questionarios for update to authenticated
  using ((select auth.uid()) = aluno_id)
  with check ((select auth.uid()) = aluno_id);

create policy "aluno exclui os proprios questionarios"
  on public.questionarios for delete to authenticated
  using ((select auth.uid()) = aluno_id);

create policy "aluno le as proprias questoes"
  on public.questoes for select to authenticated
  using ((select auth.uid()) = aluno_id);

create policy "aluno cria as proprias questoes"
  on public.questoes for insert to authenticated
  with check ((select auth.uid()) = aluno_id);

create policy "aluno exclui as proprias questoes"
  on public.questoes for delete to authenticated
  using ((select auth.uid()) = aluno_id);

create policy "aluno le as proprias resolucoes"
  on public.resolucoes for select to authenticated
  using ((select auth.uid()) = aluno_id);

create policy "aluno registra as proprias resolucoes"
  on public.resolucoes for insert to authenticated
  with check ((select auth.uid()) = aluno_id);

revoke update on public.questionarios from anon, authenticated;
grant update (disciplina_id, titulo, descricao, dificuldade, origem)
  on public.questionarios to authenticated;

-- Questões são substituídas por salvar_questionario; resoluções são
-- imutáveis e somem junto com o questionário.
revoke update on public.questoes from anon, authenticated;
revoke update, delete on public.resolucoes from anon, authenticated;

-- Salvar questionário -----------------------------------------
-- Cria (p_questionario nulo) ou substitui o questionário inteiro em
-- uma transação. Roda como o próprio aluno (RLS vale).
--
-- p_dados: {
--   titulo, descricao, disciplina_id, dificuldade, origem,
--   questoes: [{ enunciado, alternativas: [text], correta, explicacao }]
-- }

create or replace function public.salvar_questionario(p_questionario bigint, p_dados jsonb)
returns bigint
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_aluno uuid   := auth.uid();
  v_id    bigint := p_questionario;
begin
  if v_aluno is null then
    raise exception 'nao autenticado' using errcode = '42501';
  end if;

  if v_id is null then
    insert into public.questionarios (aluno_id, disciplina_id, titulo, descricao, dificuldade, origem)
    values (
      v_aluno,
      (p_dados ->> 'disciplina_id')::bigint,
      p_dados ->> 'titulo',
      nullif(p_dados ->> 'descricao', ''),
      p_dados ->> 'dificuldade',
      coalesce(p_dados ->> 'origem', 'MANUAL')
    )
    returning id into v_id;
  else
    update public.questionarios
    set disciplina_id = (p_dados ->> 'disciplina_id')::bigint,
        titulo        = p_dados ->> 'titulo',
        descricao     = nullif(p_dados ->> 'descricao', ''),
        dificuldade   = p_dados ->> 'dificuldade',
        origem        = coalesce(p_dados ->> 'origem', origem)
    where id = v_id and aluno_id = v_aluno;

    if not found then
      raise exception 'Questionário não encontrado' using errcode = 'P0002';
    end if;

    delete from public.questoes where questionario_id = v_id;
  end if;

  insert into public.questoes (aluno_id, questionario_id, ordem, enunciado, alternativas, correta, explicacao)
  select v_aluno,
         v_id,
         (q.ordem - 1)::integer,
         q.valor ->> 'enunciado',
         q.valor -> 'alternativas',
         (q.valor ->> 'correta')::smallint,
         nullif(q.valor ->> 'explicacao', '')
  from jsonb_array_elements(coalesce(p_dados -> 'questoes', '[]'::jsonb))
       with ordinality as q (valor, ordem);

  return v_id;
end;
$$;

revoke execute on function public.salvar_questionario(bigint, jsonb) from public, anon;
grant execute on function public.salvar_questionario(bigint, jsonb) to authenticated;
