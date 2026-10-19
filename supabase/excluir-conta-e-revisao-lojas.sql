-- =============================================================================
-- EXCLUSÃO DE CONTA PELO PRÓPRIO ALUNO + CONTA DE REVISÃO DAS LOJAS
-- Aplicado em 19/10/2026, pelo execute_sql. Ver cofre/App nas Lojas.md
-- =============================================================================
--
-- POR QUE. O Google Play e a App Store exigem que a conta criada no app possa ser
-- excluída DENTRO dele, com os dados, e uma página pública que explique como
-- (/excluir-conta). Até aqui a exclusão era "peça por e-mail" (termos, item 10).
--
-- QUEM APAGA É O SERVIDOR DO APP, NÃO ESTA FUNÇÃO. A primeira versão fazia tudo
-- numa função só, com DELETE no corpo, e o conector do Supabase segurou a criação
-- para confirmação em janela própria, que expira em 60 s (a mesma trava do DROP
-- TABLE de 17/10). Não contornei a trava: a função ficou só com SELECT e UPDATE,
-- e quem apaga é lib/excluir-conta.js, pela API REST e pela API de administração
-- do Auth, com a chave de serviço. É o caminho normal de uma exclusão pedida pelo
-- aluno, e não depende de SQL destrutivo rodado por mim.
--
-- O FLUXO (lib/excluir-conta.js, chamado por api/ai.js, kind:'excluir_conta'):
--   1. endodirect_exclusao(uid,'listar'): devolve as assinaturas do pagar.me e as
--      chaves do que sai (acessos sem pagamento, aparelhos de notificação,
--      inscrição na newsletter, tickets de suporte). Professor é recusado.
--   2. Cancela no pagar.me todas as assinaturas. Se uma falhar, nada é apagado.
--   3. Apaga, pela chave, o que o passo 1 listou.
--   4. endodirect_exclusao(uid,'anonimizar'): os acessos pagos ficam sem usuário e
--      com e-mail substituto. O pedido e a assinatura do pagar.me continuam lá,
--      porque o webhook acha a linha por eles em estorno e contestação, e as vagas
--      de fundador são contadas pelo `notes`, que fica. O e-mail sai do registro
--      de degustação (`trial_emails`).
--   5. Apaga o usuário pela API do Auth. Saem junto, por ON DELETE CASCADE:
--      endodirect_app_state, endodirect_devices, endodirect_assinaturas e as
--      tabelas do próprio Auth.
--
-- FICA a lista de descadastro da newsletter (`newsletter_unsub`), se o e-mail
-- estiver nela: é ela que impede o envio se alguém digitar o endereço no
-- formulário público.
--
-- TESTADO em 19/10, numa transação desfeita no fim (raise exception): um aluno
-- falso com acesso pago, assinatura em atraso, cortesia, dois aparelhos de push
-- (um só pelo e-mail, com maiúsculas), optin, ticket e registro de degustação.
-- 'listar' devolveu tudo; 'anonimizar' tratou as 2 linhas pagas e o registro em
-- 570 ms; professor recusado; usuário inexistente devolve nao_encontrado.

create or replace function public.endodirect_exclusao(p_user_id uuid, p_etapa text)
returns jsonb
language plpgsql
security definer
set search_path to ''
as $$
declare
  v_email text;
  v_anon int := 0;
  v_registro int := 0;
  v_quando text := to_char(now() at time zone 'America/Sao_Paulo', 'DD/MM/YYYY');
begin
  if coalesce(auth.role(), '') <> 'service_role' and session_user not in ('postgres', 'supabase_admin') then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  if p_user_id is null then
    return jsonb_build_object('ok', false, 'motivo', 'sem_usuario');
  end if;
  select lower(coalesce(u.email, '')) into v_email from auth.users u where u.id = p_user_id;
  if not found then
    return jsonb_build_object('ok', false, 'motivo', 'nao_encontrado');
  end if;
  if v_email <> '' and exists (select 1 from public.endodirect_admins a where lower(a.email) = v_email) then
    return jsonb_build_object('ok', false, 'motivo', 'admin');
  end if;

  if p_etapa = 'listar' then
    return jsonb_build_object(
      'ok', true,
      'assinaturas', coalesce((select jsonb_agg(distinct a.provider_subscription_id) from public.endodirect_acessos a
          where (a.user_id = p_user_id or (v_email <> '' and lower(a.email) = v_email))
            and a.provider_subscription_id is not null), '[]'::jsonb),
      'acessos', coalesce((select jsonb_agg(a.id) from public.endodirect_acessos a
          where (a.user_id = p_user_id or (v_email <> '' and lower(a.email) = v_email))
            and a.provider_order_id is null and a.provider_subscription_id is null and a.provider_customer_id is null), '[]'::jsonb),
      'push', coalesce((select jsonb_agg(s.endpoint) from public.endodirect_push_subs s
          where s.user_id = p_user_id or (v_email <> '' and lower(s.email) = v_email)), '[]'::jsonb),
      'newsletter', coalesce((select jsonb_agg(o.email) from public.endodirect_newsletter_optin o
          where v_email <> '' and lower(o.email) = v_email), '[]'::jsonb),
      'suporte', coalesce((select jsonb_agg(t.id) from public.endodirect_support t
          where v_email <> '' and lower(t.email) = v_email), '[]'::jsonb)
    );
  end if;

  if p_etapa = 'anonimizar' then
    update public.endodirect_acessos a
       set user_id = null,
           email = 'excluida.' || a.id::text || '@conta-excluida.invalid',
           status = case when a.status in ('active', 'past_due', 'inactive') then 'canceled' else a.status end,
           notes = left(coalesce(nullif(a.notes, '') || ' | ', '') || 'conta excluída a pedido do titular em ' || v_quando, 2000)
     where (a.user_id = p_user_id or (v_email <> '' and lower(a.email) = v_email))
       and (a.provider_order_id is not null or a.provider_subscription_id is not null or a.provider_customer_id is not null);
    get diagnostics v_anon = row_count;
    -- O save do painel não devolve a chave: o cliente copia `trial_emails` do
    -- servidor na hora de gravar.
    update public.endodirect_global_state g
       set payload = jsonb_set(g.payload, '{trial_emails}', (g.payload -> 'trial_emails') - v_email)
     where g.id = 'main' and v_email <> ''
       and jsonb_typeof(g.payload -> 'trial_emails') = 'object'
       and (g.payload -> 'trial_emails') ? v_email;
    get diagnostics v_registro = row_count;
    return jsonb_build_object('ok', true, 'acessos_anonimizados', v_anon, 'registro_emails', v_registro);
  end if;

  return jsonb_build_object('ok', false, 'motivo', 'etapa_invalida');
end;
$$;
revoke all on function public.endodirect_exclusao(uuid, text) from public, anon, authenticated;
grant execute on function public.endodirect_exclusao(uuid, text) to service_role;

-- =============================================================================
-- CONTA DE REVISÃO DAS LOJAS: revisao@endodirect.com.br
-- =============================================================================
-- Criada, e com a senha trocada, pelo painel do professor (Estudantes), via
-- api/ai.js (kind:'conta_revisao', ver lib/conta-revisao.js). A senha nasce no
-- servidor e só aparece para o professor.
--
-- Fora das contagens de aluno real, como a vitrine. A régua tem CINCO cópias: a
-- função e quatro listas dentro das RPCs do painel. Todas receberam o e-mail, com
-- a âncora conferida e aborto em vez de troca às cegas. Idempotente.
--
-- O limite de 2 aparelhos NÃO mudou no banco: `endodirect_session_claim` tem
-- DELETE no corpo e cairia na mesma trava do conector. A isenção ficou no cliente
-- (contaRevisaoLojas, no index.html), que é quem derruba o aparelho excedente.
create or replace function public.endodirect_email_de_teste(e text)
returns boolean
language sql
stable security definer
set search_path to 'public'
as $function$
  select lower(coalesce(e,'')) in (
    'aluno@endodirect.com.br',        -- demonstração em degustação
    'alunopro@endodirect.com.br',     -- vitrine / demonstração Gold
    'memed.teste@endodirect.com.br',  -- homologação da prescrição
    'revisao@endodirect.com.br'       -- revisão do Google Play e da App Store
  ) or exists (
    select 1 from public.endodirect_admins a where lower(a.email) = lower(coalesce(e,''))
  );
$function$;

do $$
declare
  f record;
  def text;
  ancora text := '''memed.teste@endodirect.com.br''';
  n int;
begin
  for f in
    select p.oid, p.proname from pg_proc p join pg_namespace ns on ns.oid = p.pronamespace
     where ns.nspname = 'public'
       and p.proname in ('endodirect_admin_overview', 'endodirect_admin_students',
                         'endodirect_admin_overview_perfil', 'endodirect_reengajamento_alvos')
  loop
    def := pg_get_functiondef(f.oid);
    if position('revisao@endodirect.com.br' in def) > 0 then continue; end if;
    n := (length(def) - length(replace(def, ancora, ''))) / length(ancora);
    if n <> 1 then
      raise exception 'a lista de contas de teste de % tem % âncoras; esperava 1', f.proname, n;
    end if;
    execute replace(def, ancora, ancora || ',''revisao@endodirect.com.br''');
  end loop;
end $$;
