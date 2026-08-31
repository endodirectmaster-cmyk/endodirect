-- =============================================================================
-- VITRINE (alunopro) GANHA IDENTIDADE NO SERVIDOR   (aplicado em 31/08/2026)
-- Fecha a pendência aberta em 02/08/2026 — ver cofre/Pendências.md
-- =============================================================================
--
-- O PROBLEMA. `alunopro` era conta LOCAL do bundle: a senha estava em texto puro
-- no index.html, que é servido a qualquer um (um `curl` na home a devolvia), e a
-- conta NÃO tinha sessão no Supabase.
--
-- ⚠️ A CONSEQUÊNCIA ERA ESTRUTURAL, não cosmética: sem sessão, **nenhum gate de
-- servidor conseguia distinguir a vitrine de um visitante qualquer** — qualquer
-- regra que ela passasse, um `curl` também passava. Foi por isso que
-- `endodirect_showcase_resumos()` precisou ficar aberta a `anon`, e com ela
-- 161 itens PRIVADOS de assinante (capítulos e artigos comentados, ~2,9 MB)
-- ficaram legíveis por qualquer um desde 01/08/2026. Medido, não suposto:
--   curl -X POST .../rpc/endodirect_showcase_resumos  -> 200, 2.897.145 bytes,
--   232 diretrizes, 161 privadas.
--
-- A SOLUÇÃO é a registrada no cofre: dar identidade real à vitrine. Com sessão,
-- ela passa pelo `member_content`/`member_resumos` comuns, o acesso vira
-- revogável e auditável, e a rota especial pode ser desligada.
--
-- ⚠️ SEM SENHA AQUI. A senha nasce aleatória e é descartada: nem esta migração,
-- nem o histórico do Supabase, nem o repositório guardam texto que dê acesso.
-- O professor define a dele por "Esqueci minha senha".
--
-- ⚠️ E ELA CONTINUA FORA DAS CONTAGENS. A régua de "conta que não é aluno real"
-- virou função (abaixo) e agora vale também para a apuração da enquete — que
-- não a tinha, e passou a contar a vitrine assim que ela virou Gold de verdade.

-- 1. A conta ------------------------------------------------------------------
do $$
declare uid uuid; ja uuid;
begin
  select id into ja from auth.users where lower(email) = 'alunopro@endodirect.com.br';
  if ja is not null then
    raise notice 'conta da vitrine já existe (%), nada a criar', ja;
    uid := ja;
  else
    uid := gen_random_uuid();
    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
      confirmation_token, recovery_token, email_change_token_new, email_change
    ) values (
      '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
      'alunopro@endodirect.com.br',
      crypt(gen_random_uuid()::text || gen_random_uuid()::text, gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"name":"Aluno Premium","vitrine":true}'::jsonb,
      now(), now(), '', '', '', ''
    );
    insert into auth.identities (
      id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) values (
      gen_random_uuid(), uid,
      jsonb_build_object('sub', uid::text, 'email', 'alunopro@endodirect.com.br', 'email_verified', true),
      'email', uid::text, null, now(), now()
    );
  end if;

  -- Gold + os três cursos de VITRINE. Eles têm `tier` nulo e por isso NÃO vêm de
  -- brinde com o plano (`endodirect_acessos_ativos` só soma curso com tier);
  -- precisam de escopo nominal. `endo_essencial` (tier gold) e o futuro `emc`
  -- chegam pelo próprio plano quando ligados.
  insert into public.endodirect_acessos (user_id, email, scope, status, provider, expires_at, notes)
  select uid, 'alunopro@endodirect.com.br', s, 'active', 'interno', null,
         'Conta de vitrine/demonstração — fora das contagens de aluno real'
  from unnest(array['plano:gold','curso:endoteem','curso:lipides','curso:hiperglicemia']) s
  where not exists (
    select 1 from public.endodirect_acessos a
    where a.user_id = uid and a.scope = s and a.status = 'active'
  );
end $$;

-- 2. A régua de "não é aluno real", num lugar só -------------------------------
-- 🧨 Ela JÁ EXISTIA, em duas cópias (`endodirect_admin_students` e
-- `endodirect_admin_overview`, desde 18/06/2026). A terceira RPC que precisava
-- dela — a apuração da enquete, criada depois — simplesmente NÃO A TINHA. Não
-- foi divergência entre cópias: foi uma cópia que nunca chegou.
create or replace function public.endodirect_email_de_teste(e text)
returns boolean language sql stable security definer set search_path to 'public'
as $$
  select lower(coalesce(e,'')) in (
    'aluno@endodirect.com.br',
    'alunopro@endodirect.com.br',
    'memed.teste@endodirect.com.br'
  ) or exists (select 1 from public.endodirect_admins a where lower(a.email) = lower(coalesce(e,'')));
$$;
revoke all on function public.endodirect_email_de_teste(text) from public, anon, authenticated;

-- A apuração da enquete passa a usá-la nas duas pontas (quem votou e quem é
-- elegível). Efeito medido: `gold_elegiveis` 39 -> 37, e os dois que saíram são
-- exatamente `alunopro@` e `memed.teste@` — nenhum assinante real.
-- (definição completa aplicada na migração `regua_de_conta_de_teste_e_enquete_sem_a_vitrine`)

-- 3. A rota aberta é desligada -------------------------------------------------
-- ⚠️ ORDEM IMPORTA: só depois de o cliente novo estar no ar. Revogar antes
-- deixaria um pacote em cache de service worker chamando função proibida — foi
-- assim que a aba Resumos ficou em branco por um dia em 01/08/2026.
revoke all on function public.endodirect_showcase_resumos() from public, anon, authenticated;
