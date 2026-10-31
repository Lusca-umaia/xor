-- Busca semântica nos materiais do ambiente de estudo.
-- Cada trecho ganha um embedding (nomic-embed-text-v2-moe, 768 dimensões) gerado
-- pelo servidor. A busca roda com as permissões do aluno (security invoker),
-- então o RLS de trechos continua valendo.

create extension if not exists vector with schema extensions;

alter table public.trechos
  add column embedding extensions.vector(768),
  -- Modelo que gerou o vetor: trocar de modelo exige gerar tudo de novo.
  add column modelo_embedding text;

create index trechos_embedding_idx on public.trechos
  using hnsw (embedding extensions.vector_cosine_ops);

-- Trechos antigos recebem o embedding depois, sob demanda.
grant update (embedding, modelo_embedding) on public.trechos to authenticated;

create or replace function public.buscar_trechos(
  p_material_ids uuid[],
  p_consulta extensions.vector(768),
  p_modelo text,
  p_limite integer default 40
)
returns table (id bigint, similaridade double precision)
language sql
stable
security invoker
set search_path = ''
as $$
  select t.id, 1 - (t.embedding operator(extensions.<=>) p_consulta)
  from public.trechos t
  where t.material_id = any (p_material_ids)
    and t.modelo_embedding = p_modelo
    and t.embedding is not null
  order by t.embedding operator(extensions.<=>) p_consulta
  limit least(greatest(p_limite, 1), 200);
$$;

revoke execute on function public.buscar_trechos from public, anon;
grant execute on function public.buscar_trechos to authenticated;
