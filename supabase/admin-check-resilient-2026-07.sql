-- Fix (2026-07-08): sessões passaram a receber JWT SEM o claim `email` (só `sub`/uid).
-- Sintoma: painel do professor com Analytics "forbidden" e "Não foi possível salvar
-- no Supabase" — porque TODA checagem de admin lia `auth.jwt() ->> 'email'`.
-- Diagnóstico: `auth.uid()` continua válido (o UPDATE em app_state falhava no
-- WITH CHECK, não no USING → uid casava com user_id). Só o `email` sumiu do token.
-- Correção (aditiva, não afrouxa): reconhecer admin por e-mail OU por uid (via
-- auth.users). Aplicado direto na base (migration `admin_check_resilient_to_missing_email_claim`).
-- Idempotente.

create or replace function public.endodirect_is_admin()
returns boolean
language sql
stable
security definer
set search_path to 'public'
as $fn$
  select
    exists (
      select 1 from public.endodirect_admins a
      where lower(a.email) = lower(auth.jwt() ->> 'email')
    )
    or exists (
      select 1
      from public.endodirect_admins a
      join auth.users u on lower(u.email) = lower(a.email)
      where u.id = auth.uid()
    );
$fn$;

grant execute on function public.endodirect_is_admin() to anon, authenticated;

-- Políticas de escrita usam o helper (e-mail OU uid).
alter policy endodirect_global_state_write_admins on public.endodirect_global_state
  using (public.endodirect_is_admin())
  with check (public.endodirect_is_admin());

alter policy endodirect_app_state_insert_own on public.endodirect_app_state
  with check ((auth.uid() = user_id) and ((role = 'aluno') or public.endodirect_is_admin()));

alter policy endodirect_app_state_update_own on public.endodirect_app_state
  using (auth.uid() = user_id)
  with check ((auth.uid() = user_id) and ((role = 'aluno') or public.endodirect_is_admin()));

-- As RPCs endodirect_admin_overview() e endodirect_admin_students() tiveram a guarda
-- trocada de `select exists(... auth.jwt()->>'email' ...); if not ... raise 'forbidden'`
-- para `if not public.endodirect_is_admin() then raise 'forbidden'` (corpos inalterados).
-- (Ver a definição viva via pg_get_functiondef; migration acima é canônica.)

-- CAUSA-RAIZ (a investigar no lado do Supabase Auth): por que o token OAuth do Google
-- deixou de trazer o claim `email` (~2026-07-08 21:13). Suspeitas: migração para as
-- novas JWT Signing Keys, custom access token hook, ou mudança de claims. O app não
-- depende mais desse claim para autorização de admin — mas convém verificar a config.
