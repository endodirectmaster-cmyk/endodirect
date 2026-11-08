-- E-MAIL DE DEGUSTAÇÃO SÓ PARA QUEM NUNCA PAGOU (08/11/2026)
--
-- Pergunta do professor: "A automação de aviso de vencimento do modo degustação está
-- funcionando?". Está: o cron roda todo dia, o Resend aceitou todos os lotes, e nas últimas
-- semanas todo aluno que chegou ao 5º dia recebeu o aviso e todo que passou do 7º recebeu o
-- convite. A conferência achou um único defeito, e ele está aqui.
--
-- 🧨 O DEFEITO. A RPC tirava da lista só quem tem plano ATIVO hoje. Todo assinante entrou
-- pela degustação (os 48 pagantes ativos têm `deg_trials.__start`), então, no dia em que o
-- plano de um deles vence ou a cobrança recorrente falha, ele "volta" a ser um aluno no
-- dia 100+ da degustação e recebe "Sua degustação de 7 dias terminou". Aconteceu com dois
-- recorrentes com cobrança em atraso (27/08 e 24/10/2026). Ficariam na fila 41 assinantes,
-- a maioria das anuais vencendo entre 06/2027 e 11/2027.
--
-- ✅ A REGRA. Quem já teve acesso PAGO (qualquer linha de `endodirect_acessos` de provedor de
-- pagamento, em qualquer status, ou qualquer linha de `endodirect_assinaturas`) saiu do
-- funil da degustação para sempre. Para essa pessoa existe o aviso de renovação
-- (`endodirect_renovacao_alvos`), que fala do plano e não de uma degustação de meses atrás.
-- Acesso `manual`/`interno` (cortesia do professor) continua contando só enquanto ativo,
-- como antes: cortesia vencida não é compra.
--
-- Fica igual: aviso no dia 5–6 (`warn`, com os dias que faltam), convite a partir do dia 7
-- (`winback`), admins fora, e só o service role executa (devolve e-mails).
create or replace function public.endodirect_trial_email_targets()
 returns table(email text, kind text, days_left integer)
 language sql
 stable security definer
 set search_path to 'public'
as $function$
  with cand as (
    select lower(a.email) as email,
      floor(extract(epoch from (now() - to_timestamp(((a.payload->'deg_trials'->>'__start')::bigint)/1000.0))) / 86400)::int as day
    from public.endodirect_app_state a
    where (a.payload->'deg_trials'->>'__start') ~ '^[0-9]+$'
      and coalesce(a.email,'') <> ''
      and position('@' in a.email) > 1
      and lower(a.email) not in (select lower(email) from public.endodirect_admins)
      -- acesso ativo hoje (pago ou cortesia): ainda não é hora de nenhum dos dois e-mails
      and not exists (select 1 from public.endodirect_acessos x
                      where x.user_id = a.user_id and x.status = 'active'
                        and (x.expires_at is null or x.expires_at > now()))
      and not exists (select 1 from public.endodirect_assinaturas s
                      where s.user_id = a.user_id and s.status = 'active'
                        and (s.current_period_end is null or s.current_period_end > now()))
      -- já pagou alguma vez: não é mais degustação, seja qual for o status de hoje
      and not exists (select 1 from public.endodirect_acessos p
                      where p.user_id = a.user_id
                        and coalesce(p.provider, '') not in ('manual', 'interno'))
      and not exists (select 1 from public.endodirect_assinaturas q
                      where q.user_id = a.user_id)
  )
  select email,
    case when day >= 7 then 'winback' else 'warn' end as kind,
    greatest(0, 7 - day) as days_left
  from cand
  where day >= 5;
$function$;

revoke execute on function public.endodirect_trial_email_targets() from anon, authenticated, public;
