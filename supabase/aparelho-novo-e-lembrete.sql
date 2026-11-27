-- E-MAIL DE APARELHO NOVO NA CONTA + LEMBRETE DIÁRIO DE ESTUDO (27/11/2026)
--
-- Professor, da lista de sugestões: "Faz a 1, 5, 6 e 10".
--   10: e-mail ao aluno quando um aparelho novo entra na conta (e quando um 3º aparelho é barrado).
--    5: lembrete no celular na hora que o aluno escolher ("Hora das suas 10 questões").
--
-- POR QUE O BANCO CHAMA O SERVIDOR. A Vercel do projeto aceita 2 crons e só diários (e já usa os
-- dois), e está em 12/12 funções. O lembrete precisa de um relógio de hora em hora, e o alerta de
-- aparelho precisa sair na hora do login, sem depender do navegador (um cliente adulterado
-- simplesmente não chamaria rota nenhuma). Então:
--   · pg_net: o próprio `endodirect_aparelho_entrar` (supabase/aparelhos-cadastrados.sql) enfileira o
--     alerta e chama a rota existente /api/admin/refresh-radar (action 'alertas_aparelho');
--   · pg_cron: de hora em hora chama a mesma rota (action 'tarefas_hora'), que manda os lembretes da
--     hora e reenvia alerta que tenha ficado na fila.
-- A rota confere um TOKEN que nasce e mora no Vault do banco (ninguém o digita nem o vê; nem a Vercel
-- o guarda): ela pergunta ao banco, com a chave de serviço, se o token confere. E esse token só abre
-- essas duas ações (não dispara aviso para todos, por exemplo).

create extension if not exists pg_net;
create extension if not exists pg_cron;

-- 1. O token (64 hex), criado uma vez.
do $$
begin
  if not exists (select 1 from vault.secrets where name = 'endodirect_tarefas_token') then
    perform vault.create_secret(
      replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', ''),
      'endodirect_tarefas_token',
      'Chamadas do banco ao servidor: alertas de aparelho novo e lembretes de estudo (27/11/2026)');
  end if;
end $$;

-- A rota pergunta "este token confere?" (só a chave de serviço pode perguntar).
create or replace function public.endodirect_tarefas_token_confere(p_token text)
returns boolean
language sql
stable security definer
set search_path to 'public'
as $function$
  select coalesce(length(p_token) = 64 and p_token = (
    select decrypted_secret from vault.decrypted_secrets where name = 'endodirect_tarefas_token' limit 1), false);
$function$;
revoke all on function public.endodirect_tarefas_token_confere(text) from public, anon, authenticated;
grant execute on function public.endodirect_tarefas_token_confere(text) to service_role;

-- O banco chama a rota (assíncrono: o pg_net manda depois do commit; nunca trava quem chamou).
create or replace function public.endodirect_chamar_tarefa(p_action text)
returns void
language plpgsql
security definer
set search_path to 'public'
as $function$
declare v_token text;
begin
  if p_action not in ('alertas_aparelho', 'tarefas_hora') then return; end if;
  select decrypted_secret into v_token from vault.decrypted_secrets where name = 'endodirect_tarefas_token' limit 1;
  if v_token is null then return; end if;
  perform net.http_post(
    url := 'https://www.endodirect.com.br/api/admin/refresh-radar',
    body := jsonb_build_object('action', p_action),
    headers := jsonb_build_object('Content-Type', 'application/json', 'Authorization', 'Bearer ' || v_token),
    timeout_milliseconds := 60000);
exception when others then
  return; -- sem rede ou sem pg_net: o cron da hora seguinte reenvia o que ficou na fila
end;
$function$;
revoke all on function public.endodirect_chamar_tarefa(text) from public, anon, authenticated;

-- 2. A fila dos alertas de aparelho. Sai com a conta (cascade). Ninguém lê pela API.
create table if not exists public.endodirect_alertas_aparelho (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  tipo text not null check (tipo in ('novo', 'bloqueado')),
  ua text not null default '',
  criado_em timestamptz not null default now(),
  enviado_em timestamptz,
  tentativas int not null default 0,
  resultado text
);
create index if not exists endodirect_alertas_aparelho_pend on public.endodirect_alertas_aparelho (criado_em) where enviado_em is null;
create index if not exists endodirect_alertas_aparelho_user on public.endodirect_alertas_aparelho (user_id, criado_em);
alter table public.endodirect_alertas_aparelho enable row level security;
revoke all on public.endodirect_alertas_aparelho from anon, authenticated;
revoke all on sequence public.endodirect_alertas_aparelho_id_seq from anon, authenticated;

-- Enfileira (no máximo 3 por conta em 24 h: um ladrão insistente não vira enxurrada de e-mail) e chama.
create or replace function public.endodirect_alerta_aparelho_registrar(p_uid uuid, p_tipo text, p_ua text)
returns void
language plpgsql
security definer
set search_path to 'public'
as $function$
begin
  if p_uid is null or p_tipo not in ('novo', 'bloqueado') then return; end if;
  if (select count(*) from public.endodirect_alertas_aparelho
       where user_id = p_uid and criado_em > now() - interval '24 hours') >= 3 then return; end if;
  insert into public.endodirect_alertas_aparelho(user_id, tipo, ua) values (p_uid, p_tipo, left(coalesce(p_ua, ''), 300));
  perform public.endodirect_chamar_tarefa('alertas_aparelho');
exception when others then
  return; -- o alerta nunca impede o login
end;
$function$;
revoke all on function public.endodirect_alerta_aparelho_registrar(uuid, text, text) from public, anon, authenticated;

-- A rota pega os pendentes (marcando-os, para duas chamadas ao mesmo tempo não mandarem em dobro)…
create or replace function public.endodirect_alertas_aparelho_pegar(p_max int default 20)
returns table(id bigint, tipo text, ua text, criado_em timestamptz, email text, nome text)
language plpgsql
security definer
set search_path to 'public'
as $function$
begin
  return query
  with alvo as (
    select a.id from public.endodirect_alertas_aparelho a
     where a.enviado_em is null and a.tentativas < 3 and a.criado_em > now() - interval '2 days'
     order by a.id
     limit greatest(1, least(coalesce(p_max, 20), 50))
     for update skip locked
  ), marcado as (
    update public.endodirect_alertas_aparelho a set enviado_em = now(), tentativas = a.tentativas + 1, resultado = 'enviando'
      from alvo where a.id = alvo.id
    returning a.id, a.tipo, a.ua, a.criado_em, a.user_id
  )
  select m.id, m.tipo, m.ua, m.criado_em, u.email::text,
         coalesce(nullif(trim(u.raw_user_meta_data->>'full_name'), ''), nullif(trim(u.raw_user_meta_data->>'name'), ''), '')::text
    from marcado m join auth.users u on u.id = m.user_id;
end;
$function$;
revoke all on function public.endodirect_alertas_aparelho_pegar(int) from public, anon, authenticated;
grant execute on function public.endodirect_alertas_aparelho_pegar(int) to service_role;

-- …e devolve o resultado (falhou: volta para a fila, até 3 tentativas).
create or replace function public.endodirect_alertas_aparelho_resultado(p_id bigint, p_ok boolean, p_resultado text)
returns void
language sql
security definer
set search_path to 'public'
as $function$
  update public.endodirect_alertas_aparelho
     set resultado = left(coalesce(p_resultado, ''), 200),
         enviado_em = case when p_ok then enviado_em else null end
   where id = p_id;
$function$;
revoke all on function public.endodirect_alertas_aparelho_resultado(bigint, boolean, text) from public, anon, authenticated;
grant execute on function public.endodirect_alertas_aparelho_resultado(bigint, boolean, text) to service_role;

-- 3. Lembrete diário: quem pediu (user_profile.lembrete.on), com aparelho que recebe notificação.
--    Vai só o necessário: a preferência e a contagem de estudo dos últimos 3 dias (act).
create or replace function public.endodirect_lembrete_candidatos()
returns table(user_id uuid, lembrete jsonb, act jsonb)
language sql
stable security definer
set search_path to 'public'
as $function$
  select s.user_id, s.payload->'user_profile'->'lembrete',
         coalesce((select jsonb_object_agg(e.key, e.value)
                     from jsonb_each(case when jsonb_typeof(s.payload->'act') = 'object' then s.payload->'act' else '{}'::jsonb end) e
                    where e.key >= to_char(current_date - 2, 'YYYY-MM-DD')), '{}'::jsonb)
    from public.endodirect_app_state s
   where jsonb_typeof(s.payload->'user_profile'->'lembrete') = 'object'
     and (s.payload->'user_profile'->'lembrete'->>'on') = 'true'
     and exists (select 1 from public.endodirect_push_subs p where p.user_id = s.user_id);
$function$;
revoke all on function public.endodirect_lembrete_candidatos() from public, anon, authenticated;
grant execute on function public.endodirect_lembrete_candidatos() to service_role;

-- Uma vez por dia (do aluno): a reserva é atômica, então duas chamadas na mesma hora não mandam em dobro.
create table if not exists public.endodirect_lembretes_enviados (
  user_id uuid not null references auth.users(id) on delete cascade,
  dia date not null,
  enviado_em timestamptz not null default now(),
  primary key (user_id, dia)
);
alter table public.endodirect_lembretes_enviados enable row level security;
revoke all on public.endodirect_lembretes_enviados from anon, authenticated;

create or replace function public.endodirect_lembrete_reservar(p_users uuid[], p_dias date[])
returns setof uuid
language sql
security definer
set search_path to 'public'
as $function$
  insert into public.endodirect_lembretes_enviados(user_id, dia)
  select u, d from unnest(p_users, p_dias) as t(u, d) where u is not null and d is not null
  on conflict (user_id, dia) do nothing
  returning user_id;
$function$;
revoke all on function public.endodirect_lembrete_reservar(uuid[], date[]) from public, anon, authenticated;
grant execute on function public.endodirect_lembrete_reservar(uuid[], date[]) to service_role;

-- 4. O relógio: de hora em hora, no minuto 0.
select cron.schedule('endodirect-tarefas-hora', '0 * * * *', $$select public.endodirect_chamar_tarefa('tarefas_hora')$$);
