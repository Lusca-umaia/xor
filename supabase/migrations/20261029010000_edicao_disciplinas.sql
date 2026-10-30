-- =============================================================
-- Edição de disciplinas pelo aluno: excluir disciplinas/tentativas,
-- trocar o código e definir a situação atual de uma disciplina.
-- =============================================================

create policy "aluno exclui as proprias disciplinas"
  on public.disciplinas for delete to authenticated
  using ((select auth.uid()) = aluno_id);

create policy "aluno exclui as proprias tentativas"
  on public.tentativas for delete to authenticated
  using ((select auth.uid()) = aluno_id);

grant delete on public.disciplinas, public.tentativas to authenticated;
grant update (codigo) on public.disciplinas to authenticated;

-- Define a situação atual da disciplina, mantendo o histórico coerente:
--   PENDENTE  -> remove andamento/aprovação (reprovações ficam no histórico)
--   ANDAMENTO -> abre uma tentativa no semestre atual
--   APROVADA / REPROVADA / TRANCADA -> encerra a tentativa em andamento,
--     ou corrige a aprovação existente, ou registra uma nova tentativa.
-- Roda como o próprio aluno (RLS vale) e em uma transação só.

create or replace function public.definir_situacao_disciplina(
  p_disciplina bigint,
  p_status     text,
  p_nota       numeric,
  p_periodo    text
)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_aluno uuid := auth.uid();
  v_sem   integer;
  v_nota  numeric := case when p_status = 'TRANCADA' then null else p_nota end;
begin
  if v_aluno is null then
    raise exception 'nao autenticado' using errcode = '42501';
  end if;

  if p_status not in ('PENDENTE', 'ANDAMENTO', 'APROVADA', 'REPROVADA', 'TRANCADA') then
    raise exception 'Situação inválida' using errcode = 'P0001';
  end if;

  if not exists (
    select 1 from public.disciplinas where id = p_disciplina and aluno_id = v_aluno
  ) then
    raise exception 'Disciplina não encontrada' using errcode = 'P0001';
  end if;

  select semestre_atual into v_sem from public.perfis where id = v_aluno;

  if p_status = 'PENDENTE' then
    delete from public.tentativas
    where disciplina_id = p_disciplina and status in ('ANDAMENTO', 'APROVADA');
    return;
  end if;

  if p_status = 'ANDAMENTO' then
    if exists (
      select 1 from public.tentativas
      where disciplina_id = p_disciplina and status = 'APROVADA'
    ) then
      raise exception 'A disciplina já está concluída. Marque como pendente antes de cursá-la de novo'
        using errcode = 'P0001';
    end if;

    insert into public.tentativas (aluno_id, disciplina_id, status, periodo, semestre)
    values (v_aluno, p_disciplina, 'ANDAMENTO', nullif(p_periodo, ''), v_sem)
    on conflict do nothing;
    return;
  end if;

  -- Encerrar a tentativa em andamento, se houver.
  update public.tentativas
  set status  = p_status,
      nota    = v_nota,
      periodo = coalesce(nullif(p_periodo, ''), periodo)
  where disciplina_id = p_disciplina and status = 'ANDAMENTO';

  if found then
    return;
  end if;

  if p_status = 'APROVADA' then
    -- Corrigir uma aprovação já registrada.
    update public.tentativas
    set nota    = v_nota,
        periodo = coalesce(nullif(p_periodo, ''), periodo)
    where disciplina_id = p_disciplina and status = 'APROVADA';

    if found then
      return;
    end if;
  else
    -- Reprovar/trancar algo que estava como aprovado é uma correção.
    delete from public.tentativas
    where disciplina_id = p_disciplina and status = 'APROVADA';
  end if;

  insert into public.tentativas (aluno_id, disciplina_id, status, nota, periodo)
  values (v_aluno, p_disciplina, p_status, v_nota, nullif(p_periodo, ''));
end;
$$;

revoke execute on function public.definir_situacao_disciplina(bigint, text, numeric, text) from public, anon;
grant execute on function public.definir_situacao_disciplina(bigint, text, numeric, text) to authenticated;
