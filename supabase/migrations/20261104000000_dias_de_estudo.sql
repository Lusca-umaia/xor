-- Dias (no fuso de Fortaleza) em que o aluno ganhou XP em qualquer ambiente,
-- nos últimos 90 dias. Junto com as sessões de foco, forma a sequência de
-- estudo da tela inicial. Agrega no banco para não esbarrar no limite de
-- linhas por consulta. Roda com as permissões do aluno (security invoker).
create or replace function public.dias_de_estudo()
returns table (dia date)
language sql
stable
security invoker
set search_path = ''
as $$
  select distinct (e.criado_em at time zone 'America/Fortaleza')::date
  from public.xp_eventos e
  where e.criado_em >= now() - interval '90 days'
  order by 1 desc;
$$;

revoke execute on function public.dias_de_estudo from public, anon;
grant execute on function public.dias_de_estudo to authenticated;
