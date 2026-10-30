-- =============================================================
-- XOR - schema inicial: perfil do aluno, disciplinas do aluno e
-- tentativas (histórico). Todas as tabelas com RLS ligado.
--
-- Não existe catálogo global: cada aluno tem as próprias
-- disciplinas, vindas do histórico ou do cadastro manual. O código
-- da disciplina identifica a mesma disciplina entre alunos.
-- =============================================================

create table public.perfis (
  id                     uuid primary key references auth.users (id) on delete cascade,
  nome                   text    not null check (char_length(nome) between 1 and 120),
  matricula              text             check (char_length(matricula) <= 30),
  curso_nome             text    not null check (char_length(curso_nome) between 1 and 200),
  curso_codigo           text             check (char_length(curso_codigo) <= 30),
  semestre_atual         integer not null default 1 check (semestre_atual between 1 and 30),
  carga_optativa_exigida integer          check (carga_optativa_exigida >= 0),
  criado_em              timestamptz not null default now(),
  atualizado_em          timestamptz not null default now()
);

create table public.disciplinas (
  id            bigint generated always as identity primary key,
  aluno_id      uuid    not null references public.perfis (id) on delete cascade,
  codigo        text    not null check (char_length(codigo) between 1 and 40),
  nome          text    not null check (char_length(nome) between 1 and 200),
  carga_horaria integer not null check (carga_horaria between 0 and 2000),
  carater       text    not null check (carater in ('OBRIGATORIA', 'OPTATIVA')),
  -- Semestre sugerido na grade, quando conhecido.
  semestre      integer          check (semestre between 1 and 30),
  criado_em     timestamptz not null default now(),
  unique (aluno_id, codigo),
  unique (id, aluno_id)
);

create index disciplinas_codigo_idx on public.disciplinas (codigo);

-- Cada linha é uma vez que o aluno cursou (ou está cursando) a disciplina.
create table public.tentativas (
  id            bigint generated always as identity primary key,
  aluno_id      uuid    not null,
  disciplina_id bigint  not null,
  status        text    not null check (status in ('ANDAMENTO', 'APROVADA', 'REPROVADA', 'TRANCADA')),
  nota          numeric(4, 2) check (nota between 0 and 10),
  periodo       text          check (char_length(periodo) <= 20),
  semestre      integer       check (semestre between 1 and 30),
  criado_em     timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  -- Garante que a tentativa e a disciplina são do mesmo aluno.
  foreign key (disciplina_id, aluno_id)
    references public.disciplinas (id, aluno_id) on delete cascade
);

create index tentativas_aluno_id_idx on public.tentativas (aluno_id);

-- No máximo uma tentativa em andamento e uma aprovação por disciplina.
create unique index tentativas_andamento_unq
  on public.tentativas (disciplina_id) where status = 'ANDAMENTO';
create unique index tentativas_aprovada_unq
  on public.tentativas (disciplina_id) where status = 'APROVADA';

create or replace function public.tocar_atualizado_em()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.atualizado_em := now();
  return new;
end;
$$;

create trigger perfis_atualizado_em
  before update on public.perfis
  for each row execute function public.tocar_atualizado_em();

create trigger tentativas_atualizado_em
  before update on public.tentativas
  for each row execute function public.tocar_atualizado_em();

-- RLS ----------------------------------------------------------

alter table public.perfis      enable row level security;
alter table public.disciplinas enable row level security;
alter table public.tentativas  enable row level security;

create policy "aluno le o proprio perfil"
  on public.perfis for select to authenticated
  using ((select auth.uid()) = id);

create policy "aluno atualiza o proprio perfil"
  on public.perfis for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

create policy "aluno le as proprias disciplinas"
  on public.disciplinas for select to authenticated
  using ((select auth.uid()) = aluno_id);

create policy "aluno cria as proprias disciplinas"
  on public.disciplinas for insert to authenticated
  with check ((select auth.uid()) = aluno_id);

create policy "aluno edita as proprias disciplinas"
  on public.disciplinas for update to authenticated
  using ((select auth.uid()) = aluno_id)
  with check ((select auth.uid()) = aluno_id);

create policy "aluno le as proprias tentativas"
  on public.tentativas for select to authenticated
  using ((select auth.uid()) = aluno_id);

create policy "aluno cria as proprias tentativas"
  on public.tentativas for insert to authenticated
  with check ((select auth.uid()) = aluno_id);

create policy "aluno edita as proprias tentativas"
  on public.tentativas for update to authenticated
  using ((select auth.uid()) = aluno_id)
  with check ((select auth.uid()) = aluno_id);

-- Perfis são criados só pelo cadastro (registrar_aluno).
revoke insert, delete on public.perfis from anon, authenticated;
revoke update on public.perfis from authenticated;
grant update (nome, matricula, curso_nome, semestre_atual, carga_optativa_exigida)
  on public.perfis to authenticated;

revoke delete on public.disciplinas, public.tentativas from anon, authenticated;
revoke update on public.disciplinas from authenticated;
grant update (nome, carga_horaria, carater, semestre) on public.disciplinas to authenticated;
revoke update on public.tentativas from authenticated;
grant update (status, nota, periodo) on public.tentativas to authenticated;

-- Cadastro -----------------------------------------------------
-- Chamada pela API com a chave secreta logo após o signUp, para que
-- funcione mesmo com confirmação de email ligada (sem sessão ainda).
-- Tudo em uma transação: se falhar, a API remove o usuário criado.
--
-- p_dados: {
--   nome, matricula, curso_nome, curso_codigo, semestre_atual, carga_optativa_exigida,
--   disciplinas: [{ codigo, nome, carga_horaria, carater, semestre }],
--   tentativas:  [{ codigo, status, nota, periodo, semestre }]
-- }

create or replace function public.registrar_aluno(p_aluno uuid, p_dados jsonb)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.perfis (
    id, nome, matricula, curso_nome, curso_codigo, semestre_atual, carga_optativa_exigida
  )
  values (
    p_aluno,
    p_dados ->> 'nome',
    nullif(p_dados ->> 'matricula', ''),
    p_dados ->> 'curso_nome',
    nullif(p_dados ->> 'curso_codigo', ''),
    coalesce((p_dados ->> 'semestre_atual')::integer, 1),
    (p_dados ->> 'carga_optativa_exigida')::integer
  );

  insert into public.disciplinas (aluno_id, codigo, nome, carga_horaria, carater, semestre)
  select p_aluno,
         upper(trim(d ->> 'codigo')),
         trim(d ->> 'nome'),
         coalesce((d ->> 'carga_horaria')::integer, 0),
         d ->> 'carater',
         (d ->> 'semestre')::integer
  from jsonb_array_elements(coalesce(p_dados -> 'disciplinas', '[]'::jsonb)) as d
  on conflict (aluno_id, codigo) do nothing;

  insert into public.tentativas (aluno_id, disciplina_id, status, nota, periodo, semestre)
  select p_aluno,
         disc.id,
         t ->> 'status',
         case when t ->> 'status' in ('APROVADA', 'REPROVADA')
              then (t ->> 'nota')::numeric end,
         nullif(t ->> 'periodo', ''),
         (t ->> 'semestre')::integer
  from jsonb_array_elements(coalesce(p_dados -> 'tentativas', '[]'::jsonb)) as t
  join public.disciplinas disc
    on disc.aluno_id = p_aluno and disc.codigo = upper(trim(t ->> 'codigo'));
end;
$$;

revoke execute on function public.registrar_aluno(uuid, jsonb) from public, anon, authenticated;
grant execute on function public.registrar_aluno(uuid, jsonb) to service_role;

-- Encerramento de semestre ------------------------------------
-- Roda com os privilégios do aluno (RLS vale) e em uma transação só.
--   p_resultados: [{ "disciplina_id": 1, "status": "APROVADA", "nota": 8.5 }, ...]
--   p_proximas:   ids das disciplinas (do aluno) do próximo semestre

create or replace function public.encerrar_semestre(p_resultados jsonb, p_proximas bigint[])
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_aluno     uuid := auth.uid();
  v_sem       integer;
  v_andamento integer;
  v_cobertas  integer;
begin
  if v_aluno is null then
    raise exception 'nao autenticado' using errcode = '42501';
  end if;

  select semestre_atual into v_sem from public.perfis where id = v_aluno;

  if v_sem is null then
    raise exception 'Perfil não encontrado' using errcode = 'P0001';
  end if;

  if exists (
    select 1 from jsonb_array_elements(p_resultados) r
    where r ->> 'status' not in ('APROVADA', 'REPROVADA', 'TRANCADA')
  ) then
    raise exception 'Status inválido' using errcode = 'P0001';
  end if;

  select count(*) into v_andamento
  from public.tentativas
  where aluno_id = v_aluno and status = 'ANDAMENTO';

  select count(distinct t.id) into v_cobertas
  from public.tentativas t
  join jsonb_array_elements(p_resultados) r
    on (r ->> 'disciplina_id')::bigint = t.disciplina_id
  where t.aluno_id = v_aluno and t.status = 'ANDAMENTO';

  if v_cobertas <> v_andamento or jsonb_array_length(p_resultados) <> v_andamento then
    raise exception 'Informe o resultado de todas as disciplinas em andamento'
      using errcode = 'P0001';
  end if;

  update public.tentativas t
  set status = r ->> 'status',
      nota   = case when r ->> 'status' = 'TRANCADA' then null
                    else (r ->> 'nota')::numeric end
  from jsonb_array_elements(p_resultados) r
  where t.aluno_id = v_aluno
    and t.status = 'ANDAMENTO'
    and t.disciplina_id = (r ->> 'disciplina_id')::bigint;

  update public.perfis set semestre_atual = v_sem + 1 where id = v_aluno;

  insert into public.tentativas (aluno_id, disciplina_id, status, semestre)
  select v_aluno, d.id, 'ANDAMENTO', v_sem + 1
  from public.disciplinas d
  where d.aluno_id = v_aluno
    and d.id = any (coalesce(p_proximas, '{}'))
    and not exists (
      select 1 from public.tentativas t
      where t.disciplina_id = d.id and t.status in ('APROVADA', 'ANDAMENTO')
    );
end;
$$;

revoke execute on function public.encerrar_semestre(jsonb, bigint[]) from public, anon;
grant execute on function public.encerrar_semestre(jsonb, bigint[]) to authenticated;
