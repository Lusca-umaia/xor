-- Ambientes de estudo só existem quando o aluno os cria. As cadeiras do
-- histórico sem ambiente passam a ser mostradas pelo front, a partir do
-- progresso, sem linha no banco.
--
-- Remove os ambientes criados automaticamente no primeiro acesso que nunca
-- foram usados: origem CADEIRA, criados junto com a linha de ambientes_config,
-- nunca alterados (o trigger muda atualizado_em a cada update) e sem nenhum
-- conteúdo. Ambientes com qualquer material, chat, resumo, atividade ou
-- simulado não são tocados.

delete from public.ambientes a
using public.ambientes_config c
where c.aluno_id = a.aluno_id
  and a.origem = 'CADEIRA'
  and a.atualizado_em = a.criado_em
  and abs(extract(epoch from a.criado_em - c.semeado_em)) < 60
  and not exists (select 1 from public.materiais m where m.ambiente_id = a.id)
  and not exists (select 1 from public.chats ch where ch.ambiente_id = a.id)
  and not exists (select 1 from public.resumos r where r.ambiente_id = a.id)
  and not exists (select 1 from public.atividades at where at.ambiente_id = a.id)
  and not exists (select 1 from public.simulados s where s.ambiente_id = a.id);

-- A tabela só marcava que a criação automática já tinha rodado.
drop table public.ambientes_config;
