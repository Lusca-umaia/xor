-- Dados da vida acadêmica que antes ficavam só no navegador (tarefas,
-- provas, horários, notas, plano de matrícula, playlists, portfólio e
-- preferências). Uma linha por aluno e chave, com o valor em JSON. Assim os
-- dados acompanham o aluno em qualquer dispositivo.
create table public.dados_aluno (
  aluno_id      uuid not null references public.perfis (id) on delete cascade,
  chave         text not null check (chave in (
                  'xor:atividades', 'xor:eventos', 'xor:turmas',
                  'xor:playlists', 'xor:portfolio', 'xor:avaliacoes',
                  'xor:planejador', 'xor:limites-sobrecarga',
                  'xor:consentimento-ia', 'xor:pomodoro:config')),
  valor         jsonb not null,
  atualizado_em timestamptz not null default now(),
  primary key (aluno_id, chave),
  -- Teto de 512 KB por chave: bem acima do uso normal, evita abuso.
  check (octet_length(valor::text) <= 524288)
);

alter table public.dados_aluno enable row level security;
revoke all on public.dados_aluno from anon;
grant select, insert, update, delete on public.dados_aluno to authenticated;

create policy "aluno le os proprios dados"
  on public.dados_aluno for select to authenticated
  using ((select auth.uid()) = aluno_id);

create policy "aluno grava os proprios dados"
  on public.dados_aluno for insert to authenticated
  with check ((select auth.uid()) = aluno_id);

create policy "aluno atualiza os proprios dados"
  on public.dados_aluno for update to authenticated
  using ((select auth.uid()) = aluno_id)
  with check ((select auth.uid()) = aluno_id);

create policy "aluno apaga os proprios dados"
  on public.dados_aluno for delete to authenticated
  using ((select auth.uid()) = aluno_id);
