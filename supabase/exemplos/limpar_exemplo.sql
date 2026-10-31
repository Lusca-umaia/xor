-- Desfaz o popular_exemplo.sql para uma conta.
--
-- Como usar: troque o email em v_email e rode no SQL Editor do Supabase.
-- Apaga só o que o script de exemplo criou: os ambientes marcados (com todo o
-- conteúdo e o XP deles), as sessões de foco "(exemplo)", os itens de agenda
-- com id "exemplo-...", as notas marcadas como exemplo e as cadeiras
-- EXEMPLO-n. O resto da conta não é tocado.

do $$
declare
  v_email constant text := 'SEU_EMAIL_AQUI';
  v_marca constant text := 'Ambiente de exemplo (dados de demonstração).';
  v_aluno uuid;
  v_ambientes int;
begin
  select id into v_aluno from auth.users where lower(email) = lower(v_email);
  if v_aluno is null then
    raise exception 'Nenhuma conta com o email %. Troque v_email no início do script.', v_email;
  end if;

  -- Materiais, chats, resumos, atividades, simulados e XP saem em cascata.
  delete from public.ambientes where aluno_id = v_aluno and descricao = v_marca;
  get diagnostics v_ambientes = row_count;

  delete from public.sessoes_foco where aluno_id = v_aluno and tarefa like '% (exemplo)';

  update public.dados_aluno set
    valor = coalesce((
      select jsonb_agg(item) from jsonb_array_elements(valor) item
      where coalesce(item ->> 'id', '') not like 'exemplo-%'
    ), '[]'::jsonb),
    atualizado_em = now()
  where aluno_id = v_aluno
    and chave in ('xor:atividades', 'xor:eventos', 'xor:turmas', 'xor:portfolio');

  -- Remove as cadeiras cujas notas são todas de exemplo.
  update public.dados_aluno set
    valor = coalesce((
      select jsonb_object_agg(codigo, notas) from jsonb_each(valor) as n(codigo, notas)
      where exists (
        select 1 from jsonb_array_elements(notas) nota
        where not coalesce((nota ->> 'exemplo')::boolean, false))
    ), '{}'::jsonb),
    atualizado_em = now()
  where aluno_id = v_aluno and chave = 'xor:avaliacoes';

  delete from public.disciplinas where aluno_id = v_aluno and codigo like 'EXEMPLO-%';

  raise notice 'Removidos % ambiente(s) de exemplo de %.', v_ambientes, v_email;
end $$;
