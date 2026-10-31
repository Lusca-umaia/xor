-- Dados de exemplo para demonstrar o XOR com uma conta real.
--
-- Como usar: troque o email em v_email e rode tudo no SQL Editor do Supabase.
-- Pode rodar de novo: cadeiras que já têm ambiente são puladas e os itens de
-- exemplo da agenda são substituídos, não duplicados. Para desfazer, use
-- limpar_exemplo.sql.
--
-- Para cada cadeira em andamento sem ambiente, cria um ambiente com
-- materiais, chat, resumo, atividades (quiz, verdadeiro ou falso e
-- flashcards), simulados, XP e sessões de foco. Na agenda da vida acadêmica
-- (dados_aluno), soma tarefas, provas, horários de aula, notas e portfólio.
-- As cadeiras recebem situações diferentes (prova próxima, prazo amanhã,
-- simulado pela metade, ponto fraco) para a tela inicial mostrar cada caso.
--
-- Se a conta não tiver nenhuma cadeira em andamento, cria quatro cadeiras de
-- exemplo (código EXEMPLO-n).

do $$
declare
  v_email constant text := 'SEU_EMAIL_AQUI';
  -- Marca dos ambientes de exemplo; o script de limpeza usa este texto.
  v_marca constant text := 'Ambiente de exemplo (dados de demonstração).';
  v_cores constant text[] := array['azul', 'verde', 'roxo', 'laranja', 'ciano', 'rosa', 'ambar'];
  v_topicos constant text[] := array['Fundamentos', 'Conceitos centrais', 'Aplicações', 'Resolução de problemas'];
  v_fuso constant text := 'America/Fortaleza';

  v_aluno uuid;
  v_hoje date := (now() at time zone v_fuso)::date;
  r record;
  i int := 0;
  n int;
  d int;
  v_situacao int;

  v_amb uuid;
  v_mat1 uuid;
  v_mat2 uuid;
  v_chat uuid;
  v_res uuid;
  v_quiz uuid;
  v_vf uuid;
  v_flash uuid;
  v_sim uuid;
  v_treino uuid;
  v_tent uuid;

  v_texto1 text;
  v_texto2 text;
  v_questoes jsonb;
  v_respostas jsonb;
  v_vfs jsonb;
  v_cards jsonb;
  v_sim_questoes jsonb;
  v_nota numeric;

  v_tarefas jsonb := '[]';
  v_eventos jsonb := '[]';
  v_turmas jsonb := '[]';
  v_aval jsonb := '{}';
  v_portfolio jsonb;
begin
  select id into v_aluno from auth.users where lower(email) = lower(v_email);
  if v_aluno is null then
    raise exception 'Nenhuma conta com o email %. Troque v_email no início do script.', v_email;
  end if;
  if not exists (select 1 from public.perfis where id = v_aluno) then
    raise exception 'A conta % ainda não tem perfil (termine o cadastro no app).', v_email;
  end if;

  -- Sem cadeira em andamento: cria quatro de exemplo.
  if not exists (
    select 1 from public.tentativas where aluno_id = v_aluno and status = 'ANDAMENTO'
  ) then
    with novas as (
      insert into public.disciplinas (aluno_id, codigo, nome, carga_horaria, carater, semestre)
      values
        (v_aluno, 'EXEMPLO-1', 'Estruturas de Dados', 96, 'OBRIGATORIA', 2),
        (v_aluno, 'EXEMPLO-2', 'Cálculo Diferencial e Integral II', 96, 'OBRIGATORIA', 2),
        (v_aluno, 'EXEMPLO-3', 'Banco de Dados', 64, 'OBRIGATORIA', 3),
        (v_aluno, 'EXEMPLO-4', 'Engenharia de Software', 64, 'OBRIGATORIA', 3)
      on conflict (aluno_id, codigo) do update set nome = excluded.nome
      returning id
    )
    insert into public.tentativas (aluno_id, disciplina_id, status, periodo)
    select v_aluno, id, 'ANDAMENTO', to_char(v_hoje, 'YYYY') || '.2' from novas;
  end if;

  for r in
    select distinct on (d.codigo) d.id, d.codigo, d.nome
    from public.disciplinas d
    join public.tentativas t on t.disciplina_id = d.id and t.status = 'ANDAMENTO'
    where d.aluno_id = v_aluno
      and not exists (
        select 1 from public.ambientes a
        where a.aluno_id = v_aluno and a.disciplina_codigo = d.codigo and not a.arquivado
      )
    order by d.codigo
  loop
    -- 0: prova em 3 dias · 1: prazo amanhã e flashcards · 2: simulado pela
    -- metade · 3: ponto fraco nos simulados.
    v_situacao := i % 4;

    insert into public.ambientes (aluno_id, nome, descricao, cor, origem, disciplina_codigo)
    values (v_aluno, left(r.nome, 80), v_marca, v_cores[1 + i % array_length(v_cores, 1)], 'CADEIRA', r.codigo)
    returning id into v_amb;

    -- ---------- Materiais (texto) ----------
    v_texto1 := format(
      E'Notas de aula — %1$s\n\n1. Fundamentos\nOs fundamentos de %1$s reúnem as definições e a notação usadas no resto da disciplina. Antes de resolver exercícios, vale revisar cada definição e escrever um exemplo próprio para ela.\n\n2. Conceitos centrais\nOs conceitos centrais ligam as definições entre si. Um bom teste de entendimento é explicar, com suas palavras, por que cada conceito é necessário e o que daria errado sem ele.\n\n3. Aplicações\nAs aplicações mostram onde %1$s aparece na prática. Para cada aplicação, identifique quais conceitos estão sendo usados e quais hipóteses foram assumidas.',
      r.nome);
    v_texto2 := format(
      E'Lista de exercícios comentada — %1$s\n\nExercício 1 (Fundamentos): reescreva as definições principais sem olhar o material.\n\nExercício 2 (Conceitos centrais): compare dois conceitos parecidos e aponte uma diferença essencial.\n\nExercício 3 (Resolução de problemas): resolva um problema do início ao fim, explicando cada passo. Erros comuns: pular a verificação das hipóteses e não conferir o resultado com um caso simples.',
      r.nome);

    insert into public.materiais (aluno_id, ambiente_id, nome, tipo, tamanho_bytes, status, conteudo_texto, criado_em)
    values (v_aluno, v_amb, 'Notas de aula.txt', 'TEXTO', octet_length(v_texto1), 'PRONTO', v_texto1, now() - interval '9 days')
    returning id into v_mat1;
    insert into public.materiais (aluno_id, ambiente_id, nome, tipo, tamanho_bytes, status, conteudo_texto, criado_em)
    values (v_aluno, v_amb, 'Lista de exercícios comentada.txt', 'TEXTO', octet_length(v_texto2), 'PRONTO', v_texto2, now() - interval '7 days')
    returning id into v_mat2;

    insert into public.trechos (aluno_id, material_id, ordem, texto)
    select v_aluno, v_mat1, ordem - 1, trecho
    from unnest(string_to_array(v_texto1, E'\n\n')) with ordinality as t(trecho, ordem);
    insert into public.trechos (aluno_id, material_id, ordem, texto)
    select v_aluno, v_mat2, ordem - 1, trecho
    from unnest(string_to_array(v_texto2, E'\n\n')) with ordinality as t(trecho, ordem);

    -- ---------- Chat ----------
    insert into public.chats (aluno_id, ambiente_id, titulo, material_ids, criado_em, atualizado_em)
    values (v_aluno, v_amb, 'Dúvidas sobre os conceitos centrais', array[v_mat1],
            now() - make_interval(days => i % 2, hours => 3), now() - make_interval(days => i % 2, hours => 2))
    returning id into v_chat;

    insert into public.mensagens (aluno_id, chat_id, papel, conteudo, criado_em) values
      (v_aluno, v_chat, 'ALUNO', format('Qual a diferença entre os fundamentos e os conceitos centrais de %s?', r.nome),
       now() - make_interval(days => i % 2, hours => 3)),
      (v_aluno, v_chat, 'ASSISTENTE', E'Pelas notas de aula, os **fundamentos** são as definições e a notação, e os **conceitos centrais** são o que liga essas definições entre si.\n\nUma forma de fixar: para cada conceito central, tente apontar quais definições ele usa.',
       now() - make_interval(days => i % 2, hours => 3) + interval '20 seconds'),
      (v_aluno, v_chat, 'ALUNO', 'Pode me dar um exercício para treinar isso?',
       now() - make_interval(days => i % 2, hours => 2, mins => 30)),
      (v_aluno, v_chat, 'ASSISTENTE', E'Claro! Escolha dois conceitos parecidos da disciplina e escreva:\n\n1. Uma definição curta de cada um;\n2. Uma diferença essencial entre eles;\n3. Um exemplo em que só um dos dois se aplica.\n\nDepois me mande sua resposta que eu comento.',
       now() - make_interval(days => i % 2, hours => 2, mins => 30) + interval '25 seconds');

    -- ---------- Resumo ----------
    insert into public.resumos (aluno_id, ambiente_id, titulo, formato, material_ids, conteudo, status, criado_em, atualizado_em)
    values (v_aluno, v_amb, 'Resumo das notas de aula', 'TOPICOS', array[v_mat1],
      format(E'## %s\n\n### Fundamentos\n- Definições e notação usadas em toda a disciplina\n- Revise cada definição com um exemplo próprio\n\n### Conceitos centrais\n- Ligam as definições entre si\n- Teste: explicar por que cada conceito é necessário\n\n### Aplicações\n- Onde a disciplina aparece na prática\n- Identifique os conceitos e as hipóteses de cada aplicação', r.nome),
      'PRONTO', now() - interval '5 days', now() - interval '5 days')
    returning id into v_res;

    -- ---------- Quiz (5 questões) ----------
    select jsonb_agg(jsonb_build_object(
      'id', 'q' || k,
      'tipo', 'MULTIPLA_ESCOLHA',
      'enunciado', format('Sobre %s em %s, qual alternativa está correta?', lower(v_topicos[1 + (k - 1) % 4]), r.nome),
      'dificuldade', (array['FACIL', 'MEDIA', 'DIFICIL'])[1 + k % 3],
      'topico', v_topicos[1 + (k - 1) % 4],
      'citacoes', '[]'::jsonb,
      'origem', 'IA',
      'opcoes', jsonb_build_array(
        jsonb_build_object('id', 'a', 'texto', 'Deve ser entendido a partir das definições e de exemplos próprios.', 'justificativa', 'Correta: é o que as notas de aula recomendam.'),
        jsonb_build_object('id', 'b', 'texto', 'Pode ser decorado sem relação com os outros tópicos.', 'justificativa', 'Incorreta: os tópicos dependem uns dos outros.'),
        jsonb_build_object('id', 'c', 'texto', 'Só aparece na prova final.', 'justificativa', 'Incorreta: aparece ao longo de toda a disciplina.'),
        jsonb_build_object('id', 'd', 'texto', 'Dispensa verificar as hipóteses.', 'justificativa', 'Incorreta: verificar hipóteses é um erro comum a evitar.')),
      'opcaoCorretaId', 'a'))
    into v_questoes
    from generate_series(1, 5) k;

    insert into public.atividades (aluno_id, ambiente_id, titulo, tipo, material_ids, questoes, status, criado_em)
    values (v_aluno, v_amb, 'Quiz: revisão geral', 'QUIZ', array[v_mat1, v_mat2], v_questoes, 'PRONTO', now() - interval '4 days')
    returning id into v_quiz;

    -- 4 de 5 certas (erra a última).
    select jsonb_object_agg('q' || k, jsonb_build_object('tipo', 'MULTIPLA_ESCOLHA', 'opcaoId', case when k = 5 then 'b' else 'a' end))
    into v_respostas
    from generate_series(1, 5) k;

    insert into public.tentativas_atividade (aluno_id, atividade_id, respostas, confirmadas, indice_atual, acertos, total, iniciada_em, concluida_em)
    values (v_aluno, v_quiz, v_respostas, '["q1","q2","q3","q4","q5"]', 4, 4, 5,
            now() - interval '4 days' - interval '15 minutes', now() - interval '4 days');

    -- ---------- Verdadeiro ou falso (sem tentativa) ----------
    select jsonb_agg(jsonb_build_object(
      'id', 'v' || k,
      'tipo', 'VERDADEIRO_FALSO',
      'enunciado', (array[
        'Os conceitos centrais podem ser estudados sem os fundamentos.',
        'Explicar um conceito com suas palavras ajuda a verificar o entendimento.',
        'Conferir o resultado com um caso simples é uma boa prática.',
        'Verificar as hipóteses de um problema é opcional.'])[k],
      'dificuldade', 'FACIL',
      'topico', v_topicos[k],
      'citacoes', '[]'::jsonb,
      'origem', 'IA',
      'resposta', k in (2, 3),
      'justificativa', 'Veja as notas de aula e a lista comentada.'))
    into v_vfs
    from generate_series(1, 4) k;

    insert into public.atividades (aluno_id, ambiente_id, titulo, tipo, material_ids, questoes, status, criado_em)
    values (v_aluno, v_amb, 'Verdadeiro ou falso: fundamentos', 'VERDADEIRO_FALSO', array[v_mat1], v_vfs, 'PRONTO', now() - interval '2 days')
    returning id into v_vf;

    -- ---------- Flashcards (na situação 1, quatro vencidos) ----------
    select jsonb_agg(jsonb_build_object(
      'id', 'f' || k,
      'frente', (array['O que são os fundamentos?', 'O que são os conceitos centrais?', 'Para que servem as aplicações?',
                       'Qual o erro mais comum nos exercícios?', 'Como testar se entendeu um conceito?', 'O que conferir ao terminar um problema?'])[k],
      'verso', (array['As definições e a notação usadas na disciplina.', 'O que liga as definições entre si.', 'Mostrar onde a disciplina aparece na prática.',
                      'Pular a verificação das hipóteses.', 'Explicar com suas palavras por que ele é necessário.', 'Se o resultado bate com um caso simples.'])[k],
      'citacoes', '[]'::jsonb,
      'revisao', jsonb_build_object(
        'repeticoes', 1,
        'intervaloDias', 1,
        'facilidade', 2.5,
        'proximaRevisao', to_jsonb(case
          when v_situacao = 1 and k <= 4 then now() - interval '1 day'
          else now() + make_interval(days => 2 + k) end))))
    into v_cards
    from generate_series(1, 6) k;

    insert into public.atividades (aluno_id, ambiente_id, titulo, tipo, material_ids, flashcards, status, criado_em)
    values (v_aluno, v_amb, 'Flashcards: definições principais', 'FLASHCARDS', array[v_mat1], v_cards, 'PRONTO', now() - interval '3 days')
    returning id into v_flash;

    -- ---------- Simulados ----------
    select jsonb_agg(q || jsonb_build_object('id', 's' || ord))
    into v_sim_questoes
    from jsonb_array_elements(v_questoes || v_vfs) with ordinality as e(q, ord);

    insert into public.simulados (aluno_id, ambiente_id, titulo, config, questoes, status, criado_em)
    values (v_aluno, v_amb, 'Simulado 1', jsonb_build_object(
        'materialIds', jsonb_build_array(v_mat1, v_mat2), 'quantidadeQuestoes', 9,
        'tiposQuestao', jsonb_build_array('MULTIPLA_ESCOLHA', 'VERDADEIRO_FALSO'),
        'dificuldade', 'MISTA', 'duracaoMinutos', 30, 'embaralharOpcoes', true),
      v_sim_questoes, 'PRONTO', now() - interval '3 days')
    returning id into v_sim;

    -- Na situação 3, "Resolução de problemas" fica bem abaixo dos outros.
    v_nota := case when v_situacao = 3 then 5.6 else 7.8 end;
    -- Respostas coerentes com o resultado: certas nas posições escolhidas.
    select jsonb_object_agg(q ->> 'id', case
      when q ->> 'tipo' = 'MULTIPLA_ESCOLHA' then jsonb_build_object('tipo', 'MULTIPLA_ESCOLHA',
        'opcaoId', case when certa then 'a' else 'b' end)
      else jsonb_build_object('tipo', 'VERDADEIRO_FALSO',
        'valor', case when certa then (q ->> 'resposta')::boolean else not (q ->> 'resposta')::boolean end) end)
    into v_respostas
    from (
      select q, ord = any(case when v_situacao = 3 then array[1, 2, 6, 7, 8] else array[1, 2, 3, 4, 6, 7, 8] end) as certa
      from jsonb_array_elements(v_sim_questoes) with ordinality as e(q, ord)
    ) x;
    insert into public.tentativas_simulado (aluno_id, simulado_id, iniciada_em, prazo_final, entregue_em, respostas, resultado)
    values (v_aluno, v_sim, now() - interval '2 days' - interval '25 minutes', now() - interval '2 days' + interval '5 minutes',
      now() - interval '2 days', v_respostas,
      jsonb_build_object(
        'acertos', case when v_situacao = 3 then 5 else 7 end,
        'totalObjetivas', 9,
        'notaDiscursivas', null, 'notaMaximaDiscursivas', null,
        'notaFinal', v_nota,
        'porTopico', case when v_situacao = 3 then jsonb_build_array(
            jsonb_build_object('topico', 'Fundamentos', 'acertos', 2, 'total', 3),
            jsonb_build_object('topico', 'Conceitos centrais', 'acertos', 2, 'total', 2),
            jsonb_build_object('topico', 'Aplicações', 'acertos', 1, 'total', 1),
            jsonb_build_object('topico', 'Resolução de problemas', 'acertos', 0, 'total', 3))
          else jsonb_build_array(
            jsonb_build_object('topico', 'Fundamentos', 'acertos', 3, 'total', 3),
            jsonb_build_object('topico', 'Conceitos centrais', 'acertos', 2, 'total', 2),
            jsonb_build_object('topico', 'Aplicações', 'acertos', 1, 'total', 1),
            jsonb_build_object('topico', 'Resolução de problemas', 'acertos', 1, 'total', 3)) end,
        'correcoesDiscursivas', '{}'::jsonb));

    -- Na situação 2, um treino sem cronômetro ficou pela metade.
    if v_situacao = 2 then
      insert into public.simulados (aluno_id, ambiente_id, titulo, config, questoes, status, criado_em)
      values (v_aluno, v_amb, 'Treino rápido', jsonb_build_object(
          'materialIds', jsonb_build_array(v_mat2), 'quantidadeQuestoes', 4,
          'tiposQuestao', jsonb_build_array('VERDADEIRO_FALSO'),
          'dificuldade', 'FACIL', 'duracaoMinutos', null, 'embaralharOpcoes', false),
        (select jsonb_agg(q || jsonb_build_object('id', 't' || ord))
           from jsonb_array_elements(v_vfs) with ordinality as e(q, ord)),
        'PRONTO', now() - interval '1 day')
      returning id into v_treino;
      insert into public.tentativas_simulado (aluno_id, simulado_id, iniciada_em, respostas)
      values (v_aluno, v_treino, now() - interval '20 hours',
              '{"t1":{"tipo":"VERDADEIRO_FALSO","valor":false},"t2":{"tipo":"VERDADEIRO_FALSO","valor":true}}');
    end if;

    -- ---------- XP (as mesmas regras do servidor) ----------
    insert into public.xp_eventos (aluno_id, ambiente_id, tipo, referencia, xp, criado_em) values
      (v_aluno, v_amb, 'MATERIAL', v_mat1::text, 20, now() - interval '9 days'),
      (v_aluno, v_amb, 'MATERIAL', v_mat2::text, 20, now() - interval '7 days'),
      (v_aluno, v_amb, 'RESUMO', v_res::text, 15, now() - interval '5 days'),
      (v_aluno, v_amb, 'ATIVIDADE', v_quiz::text, 30, now() - interval '4 days'),
      (v_aluno, v_amb, 'SIMULADO', v_sim::text || ':1', 30, now() - interval '2 days'),
      (v_aluno, v_amb, 'SIMULADO_NOTA', v_sim::text || ':1', round(v_nota * 5)::int, now() - interval '2 days')
    on conflict do nothing;
    for d in 1..3 loop
      insert into public.xp_eventos (aluno_id, ambiente_id, tipo, referencia, xp, criado_em)
      values (v_aluno, v_amb, 'FLASHCARD', v_flash::text || ':f' || d || ':exemplo', 2, now() - make_interval(days => d))
      on conflict do nothing;
    end loop;
    insert into public.xp_eventos (aluno_id, ambiente_id, tipo, referencia, xp, criado_em)
    select v_aluno, v_amb, 'MENSAGEM', m.id::text, 2, m.criado_em
    from public.mensagens m where m.chat_id = v_chat and m.papel = 'ASSISTENTE'
    on conflict do nothing;

    -- ---------- Sessões de foco (dia sim, dia não, na última semana) ----------
    for d in 0..6 loop
      if (d + i) % 2 = 0 then
        insert into public.sessoes_foco (aluno_id, disciplina_id, tarefa, duracao_segundos, iniciada_em, concluida_em)
        values (v_aluno, r.id, format('Estudar %s (exemplo)', left(r.nome, 150)), 1500,
          ((v_hoje - d) + time '19:00' + make_interval(mins => 30 * i)) at time zone v_fuso,
          ((v_hoje - d) + time '19:25' + make_interval(mins => 30 * i)) at time zone v_fuso);
      end if;
    end loop;

    -- ---------- Agenda da vida acadêmica ----------
    v_tarefas := v_tarefas || jsonb_build_array(
      jsonb_build_object('id', format('exemplo-%s-lista', r.codigo), 'codigo', r.codigo,
        'titulo', 'Lista de exercícios 2', 'tipo', 'LISTA', 'prioridade', 'ALTA',
        'prazo', to_char(v_hoje + case when v_situacao = 1 then 1 else 9 + i end, 'YYYY-MM-DD'),
        'horas', 3, 'feita', false),
      jsonb_build_object('id', format('exemplo-%s-trabalho', r.codigo), 'codigo', r.codigo,
        'titulo', 'Trabalho prático', 'tipo', 'TRABALHO', 'prioridade', 'MEDIA',
        'prazo', to_char(v_hoje + 16 + i, 'YYYY-MM-DD'), 'horas', 8, 'feita', false),
      jsonb_build_object('id', format('exemplo-%s-leitura', r.codigo), 'codigo', r.codigo,
        'titulo', 'Leitura do capítulo 3', 'tipo', 'LEITURA', 'prioridade', 'BAIXA',
        'prazo', to_char(v_hoje - 2, 'YYYY-MM-DD'), 'horas', 2, 'feita', true));

    v_eventos := v_eventos || jsonb_build_array(
      jsonb_build_object('id', format('exemplo-%s-p1', r.codigo), 'codigo', r.codigo,
        'titulo', 'AP1 · ' || r.nome, 'tipo', 'PROVA',
        'data', to_char(v_hoje + case when v_situacao = 0 then 3 else 18 + i end, 'YYYY-MM-DD'),
        'inicio', '08:00', 'fim', '10:00', 'horas', 6));

    v_turmas := v_turmas || jsonb_build_array(
      jsonb_build_object('id', format('exemplo-%s-turma', r.codigo), 'codigo', r.codigo,
        'dias', case when i % 2 = 0 then '[1,3]'::jsonb else '[2,4]'::jsonb end,
        'inicio', (array['08:00', '10:00', '13:30', '15:30'])[1 + (i / 2) % 4],
        'fim', (array['10:00', '12:00', '15:30', '17:30'])[1 + (i / 2) % 4]));

    v_aval := v_aval || jsonb_build_object(r.codigo, jsonb_build_array(
      jsonb_build_object('nome', 'AP1', 'peso', 1, 'nota', case when v_situacao = 3 then 5.5 else 7.5 end, 'exemplo', true),
      jsonb_build_object('nome', 'AP2', 'peso', 1, 'nota', null, 'exemplo', true),
      jsonb_build_object('nome', 'Trabalho', 'peso', 1, 'nota', null, 'exemplo', true)));

    i := i + 1;
  end loop;

  v_portfolio := jsonb_build_array(
    jsonb_build_object('id', 'exemplo-portfolio-1', 'tipo', 'PROJETO', 'titulo', 'Aplicativo de organização de estudos',
      'descricao', 'Projeto desenvolvido em grupo na disciplina de Engenharia de Software.',
      'data', to_char(v_hoje - 60, 'YYYY-MM-DD'), 'horas', 40, 'link', null),
    jsonb_build_object('id', 'exemplo-portfolio-2', 'tipo', 'MONITORIA', 'titulo', 'Monitoria de Programação',
      'descricao', 'Atendimento semanal a alunos do primeiro semestre.',
      'data', to_char(v_hoje - 120, 'YYYY-MM-DD'), 'horas', 60, 'link', null));

  -- Soma aos dados do aluno, trocando só os itens de exemplo de antes.
  insert into public.dados_aluno (aluno_id, chave, valor)
  select v_aluno, chave, valor
  from (values
    ('xor:atividades', v_tarefas),
    ('xor:eventos', v_eventos),
    ('xor:turmas', v_turmas),
    ('xor:portfolio', v_portfolio)) as novos(chave, valor)
  where jsonb_array_length(valor) > 0
  on conflict (aluno_id, chave) do update set
    valor = coalesce((
      select jsonb_agg(item) from jsonb_array_elements(public.dados_aluno.valor) item
      where coalesce(item ->> 'id', '') not like 'exemplo-%'
    ), '[]'::jsonb) || excluded.valor,
    atualizado_em = now();

  -- Notas: as que o aluno já tinha para a mesma cadeira têm prioridade.
  if v_aval <> '{}'::jsonb then
    insert into public.dados_aluno (aluno_id, chave, valor)
    values (v_aluno, 'xor:avaliacoes', v_aval)
    on conflict (aluno_id, chave) do update set
      valor = excluded.valor || public.dados_aluno.valor,
      atualizado_em = now();
  end if;

  raise notice 'Pronto: % cadeira(s) com dados de exemplo para %.', i, v_email;
end $$;
