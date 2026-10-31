-- XP total e último dia de estudo de cada ambiente do aluno, numa consulta
-- só. Alimenta o resumo das cadeiras na tela inicial. Roda com as permissões
-- do aluno (security invoker): só soma as linhas que o RLS deixa ele ver.
create or replace function public.xp_por_ambiente()
returns table (ambiente_id uuid, xp bigint, ultimo_em timestamptz)
language sql
stable
security invoker
set search_path = ''
as $$
  select e.ambiente_id, sum(e.xp)::bigint, max(e.criado_em)
  from public.xp_eventos e
  group by e.ambiente_id;
$$;

revoke execute on function public.xp_por_ambiente from public, anon;
grant execute on function public.xp_por_ambiente to authenticated;
