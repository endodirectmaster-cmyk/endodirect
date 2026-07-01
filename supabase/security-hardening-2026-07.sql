-- Endurecimento de segurança (2026-07-01) — aplicado direto na base via MCP.
-- Mantido aqui como referência versionada (o linter do Supabase apontou os itens).
-- Idempotente: pode ser reaplicado sem efeito colateral.

-- 1) Remove tabela de STAGING órfã `_aulaq_stage` (colunas seq/b64): era o
--    staging de um upload em base64 de um script SQL grande (já executado no
--    passado). Não era referenciada por nenhum código/RPC/view e estava com RLS
--    DESABILITADO → conteúdo exposto pela anon key. Sem valor de dado vivo.
drop table if exists public._aulaq_stage;

-- 2) `endodirect_trial_email_targets()` é SECURITY DEFINER e retorna e-mails de
--    alunos em degustação. O intuito é ser chamada SÓ pelo cron (service role;
--    ver lib/trial-emails.js), mas o EXECUTE público nunca fora revogado → a anon
--    key podia listar e-mails via /rest/v1/rpc. Revoga o acesso público
--    (o service role IGNORA grants, então o cron continua funcionando).
revoke execute on function public.endodirect_trial_email_targets() from anon, authenticated, public;

-- Observações (itens do linter que são POR DESIGN — sem ação):
-- • `endodirect_state_backup` e `endodirect_support`: RLS ON sem policy = só
--   service_role acessa (padrão seguro, intencional).
-- • Demais RPCs SECURITY DEFINER executáveis por anon/authenticated são o modelo
--   do app: conteúdo público/membro (gate por auth.uid()), sessão de dispositivo
--   e as de admin (`endodirect_admin_overview`/`endodirect_admin_students`, que
--   fazem `raise exception 'forbidden'` internamente se o e-mail não for admin).
