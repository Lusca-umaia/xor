-- Deixa alguns dos últimos 7 dias sem estudo, para ver a sequência quebrada.
--
-- Como usar: troque o email em v_email, ajuste v_dias (0 = hoje, 1 = ontem...)
-- e rode no SQL Editor do Supabase. Nada é apagado: as sessões de foco e o XP
-- desses dias são movidos para 30 dias antes, então o XP total da cadeira não
-- muda.
--
-- Com o padrão (2, 4 e 5 dias atrás), a semana fica com falhas e a sequência
-- atual passa a contar só hoje e ontem (se houver estudo neles).

do $$
declare
  v_email constant text := 'SEU_EMAIL_AQUI';
  v_dias constant int[] := array[2, 4, 5];
  v_fuso constant text := 'America/Fortaleza';
  v_aluno uuid;
  v_hoje date := (now() at time zone v_fuso)::date;
  v_datas date[];
  v_sessoes int;
  v_eventos int;
begin
  select id into v_aluno from auth.users where lower(email) = lower(v_email);
  if v_aluno is null then
    raise exception 'Nenhuma conta com o email %. Troque v_email no início do script.', v_email;
  end if;

  select array_agg(v_hoje - d) into v_datas from unnest(v_dias) d;

  update public.sessoes_foco
  set iniciada_em = iniciada_em - interval '30 days',
      concluida_em = concluida_em - interval '30 days'
  where aluno_id = v_aluno
    and (iniciada_em at time zone v_fuso)::date = any(v_datas);
  get diagnostics v_sessoes = row_count;

  update public.xp_eventos
  set criado_em = criado_em - interval '30 days'
  where aluno_id = v_aluno
    and (criado_em at time zone v_fuso)::date = any(v_datas);
  get diagnostics v_eventos = row_count;

  raise notice 'Dias sem estudo: %. Movidos % sessões de foco e % eventos de XP.',
    v_datas, v_sessoes, v_eventos;
end $$;
