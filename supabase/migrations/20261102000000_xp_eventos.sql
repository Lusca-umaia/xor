-- XP do ambiente de estudo como registro de eventos.
--
-- Cada ação de estudo concede XP uma única vez (unique por aluno, tipo e
-- referência) e o XP nunca é retirado: excluir um chat ou um material não
-- tira pontos. Só o servidor grava, com a chave secreta; o aluno apenas lê
-- os próprios eventos. Assim o XP não pode ser inventado pelo navegador.

create table public.xp_eventos (
  id          bigint generated always as identity primary key,
  aluno_id    uuid not null references public.perfis (id) on delete cascade,
  ambiente_id uuid not null references public.ambientes (id) on delete cascade,
  tipo        text not null check (tipo in (
                'MATERIAL', 'MENSAGEM', 'RESUMO', 'ATIVIDADE',
                'FLASHCARD', 'SIMULADO', 'SIMULADO_NOTA')),
  referencia  text not null check (char_length(referencia) <= 120),
  xp          integer not null check (xp between 1 and 200),
  criado_em   timestamptz not null default now(),
  unique (aluno_id, tipo, referencia)
);

create index xp_eventos_ambiente_idx
  on public.xp_eventos (ambiente_id, criado_em desc);

alter table public.xp_eventos enable row level security;
revoke all on public.xp_eventos from anon, authenticated;
grant select on public.xp_eventos to authenticated;

create policy "aluno le o proprio xp"
  on public.xp_eventos for select to authenticated
  using ((select auth.uid()) = aluno_id);

-- Soma do XP por tipo. Roda com as permissões do aluno (security invoker),
-- então só soma as linhas que o RLS deixa ele ver.
create or replace function public.xp_do_ambiente(p_ambiente_id uuid)
returns table (tipo text, xp bigint)
language sql
stable
security invoker
set search_path = ''
as $$
  select e.tipo, sum(e.xp)::bigint
  from public.xp_eventos e
  where e.ambiente_id = p_ambiente_id
  group by e.tipo;
$$;

revoke execute on function public.xp_do_ambiente from public, anon;
grant execute on function public.xp_do_ambiente to authenticated;

-- Preenchimento retroativo ---------------------------------------
-- Concede o XP do que o aluno já fez antes desta migração, com as mesmas
-- regras do servidor e a data original de cada ação.

insert into public.xp_eventos (aluno_id, ambiente_id, tipo, referencia, xp, criado_em)
select aluno_id, ambiente_id, 'MATERIAL', id::text, 20, criado_em
from public.materiais
where status = 'PRONTO'
on conflict do nothing;

insert into public.xp_eventos (aluno_id, ambiente_id, tipo, referencia, xp, criado_em)
select m.aluno_id, c.ambiente_id, 'MENSAGEM', m.id::text, 2, m.criado_em
from public.mensagens m
join public.chats c on c.id = m.chat_id
where m.papel = 'ASSISTENTE' and m.status = 'CONCLUIDA' and m.conteudo <> ''
on conflict do nothing;

insert into public.xp_eventos (aluno_id, ambiente_id, tipo, referencia, xp, criado_em)
select aluno_id, ambiente_id, 'RESUMO', id::text, 15, criado_em
from public.resumos
where status = 'PRONTO'
on conflict do nothing;

-- Atividade: a primeira tentativa concluída; acertos limitados ao número
-- de questões da atividade.
insert into public.xp_eventos (aluno_id, ambiente_id, tipo, referencia, xp, criado_em)
select distinct on (a.id)
  a.aluno_id, a.ambiente_id, 'ATIVIDADE', a.id::text,
  10 + 5 * least(t.acertos, jsonb_array_length(a.questoes), 30),
  t.concluida_em
from public.atividades a
join public.tentativas_atividade t on t.atividade_id = a.id
where t.concluida_em is not null
order by a.id, t.concluida_em
on conflict do nothing;

-- Flashcard: um evento por cartão já revisado (2 XP por repetição, até 5).
insert into public.xp_eventos (aluno_id, ambiente_id, tipo, referencia, xp, criado_em)
select
  a.aluno_id, a.ambiente_id, 'FLASHCARD', (c ->> 'id') || ':retroativo',
  2 * least((c -> 'revisao' ->> 'repeticoes')::int, 5),
  (c -> 'revisao' ->> 'proximaRevisao')::timestamptz
    - make_interval(days => (c -> 'revisao' ->> 'intervaloDias')::int)
from public.atividades a
cross join lateral jsonb_array_elements(a.flashcards) c
where (c -> 'revisao' ->> 'repeticoes')::int > 0
on conflict do nothing;

-- Simulado: a primeira entrega de cada simulado vale mais que as refeitas.
with entregas as (
  select
    t.id, t.aluno_id, s.ambiente_id, t.entregue_em,
    coalesce((t.resultado ->> 'notaFinal')::numeric, 0) as nota,
    row_number() over (partition by t.simulado_id order by t.entregue_em) as ordem
  from public.tentativas_simulado t
  join public.simulados s on s.id = t.simulado_id
  where t.entregue_em is not null and t.resultado is not null
)
insert into public.xp_eventos (aluno_id, ambiente_id, tipo, referencia, xp, criado_em)
select aluno_id, ambiente_id, 'SIMULADO', id::text,
       case when ordem = 1 then 30 else 10 end, entregue_em
from entregas
union all
select aluno_id, ambiente_id, 'SIMULADO_NOTA', id::text,
       round(nota * case when ordem = 1 then 5 else 2 end)::int, entregue_em
from entregas
where round(nota * case when ordem = 1 then 5 else 2 end) >= 1
on conflict do nothing;
