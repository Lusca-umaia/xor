-- =============================================================
-- Pomodoro: cada linha é um bloco de foco concluído pelo aluno,
-- opcionalmente ligado a uma disciplina e a uma tarefa.
-- =============================================================

create table public.sessoes_foco (
  id               bigint generated always as identity primary key,
  aluno_id         uuid    not null references public.perfis (id) on delete cascade,
  disciplina_id    bigint,
  tarefa           text    check (char_length(tarefa) <= 200),
  duracao_segundos integer not null check (duracao_segundos between 60 and 14400),
  iniciada_em      timestamptz not null,
  concluida_em     timestamptz not null,
  criado_em        timestamptz not null default now(),
  check (concluida_em >= iniciada_em),
  -- Disciplina do mesmo aluno; se for excluída, a sessão fica sem disciplina.
  foreign key (disciplina_id, aluno_id)
    references public.disciplinas (id, aluno_id) on delete set null (disciplina_id)
);

create index sessoes_foco_aluno_iniciada_idx
  on public.sessoes_foco (aluno_id, iniciada_em desc);

-- RLS ----------------------------------------------------------

alter table public.sessoes_foco enable row level security;

create policy "aluno le as proprias sessoes de foco"
  on public.sessoes_foco for select to authenticated
  using ((select auth.uid()) = aluno_id);

create policy "aluno cria as proprias sessoes de foco"
  on public.sessoes_foco for insert to authenticated
  with check ((select auth.uid()) = aluno_id);

create policy "aluno exclui as proprias sessoes de foco"
  on public.sessoes_foco for delete to authenticated
  using ((select auth.uid()) = aluno_id);

revoke all on public.sessoes_foco from anon;
revoke update on public.sessoes_foco from authenticated;
grant select, insert, delete on public.sessoes_foco to authenticated;
