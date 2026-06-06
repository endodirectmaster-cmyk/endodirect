-- Endodirect Supabase setup
-- Execute este arquivo no Supabase SQL Editor do projeto endodirect.

create or replace function public.endodirect_touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.endodirect_app_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  role text not null default 'aluno' check (role in ('aluno', 'admin')),
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.endodirect_global_state (
  id text primary key default 'main',
  payload jsonb not null default '{}'::jsonb,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint endodirect_global_state_singleton check (id = 'main')
);

create table if not exists public.endodirect_admins (
  email text primary key,
  name text not null,
  created_at timestamptz not null default now()
);

insert into public.endodirect_admins (email, name) values
  ('nakamura.epm79@gmail.com', 'Nakamura'),
  ('rodolphomend@gmail.com', 'Rodolpho Mendonca'),
  ('drrafaelgiorgi@hotmail.com', 'Rafael Giorgi'),
  ('brunosimiao1906@gmail.com', 'Bruno Simiao'),
  ('endodirectmaster@gmail.com', 'Endodirect Master')
on conflict (email) do update set name = excluded.name;

drop trigger if exists endodirect_app_state_touch_updated_at on public.endodirect_app_state;
create trigger endodirect_app_state_touch_updated_at
before update on public.endodirect_app_state
for each row execute function public.endodirect_touch_updated_at();

drop trigger if exists endodirect_global_state_touch_updated_at on public.endodirect_global_state;
create trigger endodirect_global_state_touch_updated_at
before update on public.endodirect_global_state
for each row execute function public.endodirect_touch_updated_at();

alter table public.endodirect_app_state enable row level security;
alter table public.endodirect_global_state enable row level security;
alter table public.endodirect_admins enable row level security;

drop policy if exists "endodirect_app_state_select_own" on public.endodirect_app_state;
create policy "endodirect_app_state_select_own"
on public.endodirect_app_state
for select to authenticated
using (auth.uid() = user_id);

drop policy if exists "endodirect_app_state_insert_own" on public.endodirect_app_state;
create policy "endodirect_app_state_insert_own"
on public.endodirect_app_state
for insert to authenticated
with check (
  auth.uid() = user_id
  and (
    role = 'aluno'
    or lower(email) in (
      'nakamura.epm79@gmail.com',
      'rodolphomend@gmail.com',
      'drrafaelgiorgi@hotmail.com',
      'brunosimiao1906@gmail.com',
      'endodirectmaster@gmail.com'
    )
  )
);

drop policy if exists "endodirect_app_state_update_own" on public.endodirect_app_state;
create policy "endodirect_app_state_update_own"
on public.endodirect_app_state
for update to authenticated
using (auth.uid() = user_id)
with check (
  auth.uid() = user_id
  and (
    role = 'aluno'
    or lower(email) in (
      'nakamura.epm79@gmail.com',
      'rodolphomend@gmail.com',
      'drrafaelgiorgi@hotmail.com',
      'brunosimiao1906@gmail.com',
      'endodirectmaster@gmail.com'
    )
  )
);

drop policy if exists "endodirect_global_state_read_authenticated" on public.endodirect_global_state;
create policy "endodirect_global_state_read_authenticated"
on public.endodirect_global_state
for select to authenticated
using (true);

drop policy if exists "endodirect_global_state_write_admins" on public.endodirect_global_state;
create policy "endodirect_global_state_write_admins"
on public.endodirect_global_state
for all to authenticated
using (
  lower(auth.jwt() ->> 'email') in (
    'nakamura.epm79@gmail.com',
    'rodolphomend@gmail.com',
    'drrafaelgiorgi@hotmail.com',
    'brunosimiao1906@gmail.com',
    'endodirectmaster@gmail.com'
  )
)
with check (
  lower(auth.jwt() ->> 'email') in (
    'nakamura.epm79@gmail.com',
    'rodolphomend@gmail.com',
    'drrafaelgiorgi@hotmail.com',
    'brunosimiao1906@gmail.com',
    'endodirectmaster@gmail.com'
  )
);

drop policy if exists "endodirect_admins_read_self" on public.endodirect_admins;
create policy "endodirect_admins_read_self"
on public.endodirect_admins
for select to authenticated
using (lower(auth.jwt() ->> 'email') = lower(email));

grant usage on schema public to anon, authenticated;
grant select, insert, update on public.endodirect_app_state to authenticated;
grant select, insert, update on public.endodirect_global_state to authenticated;
grant select on public.endodirect_admins to authenticated;

-- Public, read-only content for students who have no Supabase session.
-- Returns ONLY non-sensitive content (questions, mural, podcasts, courses);
-- intentionally excludes adm_estudantes (student roster) and adm_perfil (admin PII).
create or replace function public.endodirect_public_content()
returns jsonb
language sql
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'provas',     coalesce(payload->'provas',     '[]'::jsonb),
    'adm_avisos', coalesce(payload->'adm_avisos', '[]'::jsonb),
    'podcasts',   coalesce(payload->'podcasts',   '[]'::jsonb),
    'adm_cursos', coalesce(payload->'adm_cursos', '[]'::jsonb)
  )
  from public.endodirect_global_state
  where id = 'main';
$$;

revoke all on function public.endodirect_public_content() from public;
grant execute on function public.endodirect_public_content() to anon, authenticated;

-- =====================================================================
-- FASE 1 (acesso pago): assinaturas + conteudo restrito a membros ativos
-- Aditivo e nao destrutivo. O bloqueio efetivo do conteudo publico
-- (reduzir endodirect_public_content a um teaser) sera ativado na virada
-- de go-live, junto com o pagar.me (Fase 2).
-- =====================================================================

create table if not exists public.endodirect_assinaturas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  email text not null,
  status text not null default 'inactive' check (status in ('active','inactive','canceled','past_due','expired')),
  plano text,
  tipo text check (tipo in ('recorrente','avulso')),
  current_period_end timestamptz,
  provider text not null default 'pagarme',
  provider_customer_id text,
  provider_subscription_id text,
  provider_order_id text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists endodirect_assinaturas_email_uniq on public.endodirect_assinaturas (lower(email));
create index if not exists endodirect_assinaturas_user_idx on public.endodirect_assinaturas (user_id);

drop trigger if exists endodirect_assinaturas_touch_updated_at on public.endodirect_assinaturas;
create trigger endodirect_assinaturas_touch_updated_at
before update on public.endodirect_assinaturas
for each row execute function public.endodirect_touch_updated_at();

alter table public.endodirect_assinaturas enable row level security;

drop policy if exists "endodirect_assinaturas_select" on public.endodirect_assinaturas;
create policy "endodirect_assinaturas_select"
on public.endodirect_assinaturas
for select to authenticated
using (
  user_id = auth.uid()
  or exists (select 1 from public.endodirect_admins a where lower(a.email) = lower(auth.jwt() ->> 'email'))
);
-- Sem policies de insert/update/delete: somente o service role (webhook) escreve.

grant select on public.endodirect_assinaturas to authenticated;

-- =====================================================================
-- ETAPA 1 (cursos + acessos com escopo)
-- Modelo de acesso granular: a assinatura ("plano") e cada curso avulso
-- ("curso:<slug>") sao "escopos". Um aluno pode ter varios escopos ativos,
-- cada um com sua validade. O app decide o que cada escopo libera.
--
--   plano                -> simulador, flashcards, mapas, podcasts + cursos
--                           marcados como incluso_no_plano (hoje: Lipides).
--                           NAO inclui o banco de questoes.
--   curso:lipides        -> curso avulso Lipides (1 ano)
--   curso:endoteem       -> curso avulso EndoTEEM (1 ano)
--   curso:endo_essencial -> curso avulso Endocrinologia Essencial (1 ano)
--
-- Aditivo: a tabela legada endodirect_assinaturas continua valendo e e
-- lida como o escopo "plano" (o checkout atual segue funcionando).
-- =====================================================================

-- Catalogo de cursos (editavel pelo admin; visivel para todos como vitrine)
create table if not exists public.endodirect_cursos (
  slug text primary key,
  nome text not null,
  descricao text not null default '',
  preco_avulso_cents integer not null default 0,
  incluso_no_plano boolean not null default false,
  ativo boolean not null default true,
  ordem integer not null default 0,
  conteudo jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists endodirect_cursos_touch_updated_at on public.endodirect_cursos;
create trigger endodirect_cursos_touch_updated_at
before update on public.endodirect_cursos
for each row execute function public.endodirect_touch_updated_at();

insert into public.endodirect_cursos (slug, nome, incluso_no_plano, ordem) values
  ('lipides',        'Lípides',                   true,  1),
  ('endoteem',       'EndoTEEM',                  false, 2),
  ('endo_essencial', 'Endocrinologia Essencial',  false, 3)
on conflict (slug) do nothing;

alter table public.endodirect_cursos enable row level security;

drop policy if exists "endodirect_cursos_read" on public.endodirect_cursos;
create policy "endodirect_cursos_read"
on public.endodirect_cursos
for select to anon, authenticated
using (true);

drop policy if exists "endodirect_cursos_write_admins" on public.endodirect_cursos;
create policy "endodirect_cursos_write_admins"
on public.endodirect_cursos
for all to authenticated
using (exists (select 1 from public.endodirect_admins a where lower(a.email) = lower(auth.jwt() ->> 'email')))
with check (exists (select 1 from public.endodirect_admins a where lower(a.email) = lower(auth.jwt() ->> 'email')));

grant select on public.endodirect_cursos to anon, authenticated;

-- Acessos por escopo: uma linha por (email, escopo). Somente o service role
-- (webhook/checkout) escreve; o aluno le os seus, o admin le todos.
create table if not exists public.endodirect_acessos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  email text not null,
  scope text not null,
  status text not null default 'inactive' check (status in ('active','inactive','canceled','past_due','expired')),
  tipo text check (tipo in ('recorrente','avulso')),
  expires_at timestamptz,
  provider text not null default 'pagarme',
  provider_customer_id text,
  provider_subscription_id text,
  provider_order_id text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists endodirect_acessos_email_scope_uniq on public.endodirect_acessos (lower(email), scope);
create index if not exists endodirect_acessos_user_idx on public.endodirect_acessos (user_id);

drop trigger if exists endodirect_acessos_touch_updated_at on public.endodirect_acessos;
create trigger endodirect_acessos_touch_updated_at
before update on public.endodirect_acessos
for each row execute function public.endodirect_touch_updated_at();

alter table public.endodirect_acessos enable row level security;

drop policy if exists "endodirect_acessos_select" on public.endodirect_acessos;
create policy "endodirect_acessos_select"
on public.endodirect_acessos
for select to authenticated
using (
  user_id = auth.uid()
  or exists (select 1 from public.endodirect_admins a where lower(a.email) = lower(auth.jwt() ->> 'email'))
);
-- Sem policies de insert/update/delete: somente o service role escreve.

grant select on public.endodirect_acessos to authenticated;

-- Escopos ativos do usuario atual (admin => todos). Inclui legado de
-- endodirect_assinaturas como "plano" e expande "plano" para os cursos
-- marcados como incluso_no_plano.
create or replace function public.endodirect_acessos_ativos()
returns text[]
language plpgsql security definer set search_path = public stable as $$
declare
  is_admin boolean;
  base text[];
  result text[];
begin
  is_admin := exists (
    select 1 from public.endodirect_admins a
    where lower(a.email) = lower(auth.jwt() ->> 'email')
  );
  if is_admin then
    return array['plano']::text[]
      || coalesce((select array_agg('curso:' || slug) from public.endodirect_cursos where ativo), '{}');
  end if;

  select coalesce(array_agg(distinct scope), '{}') into base from (
    select scope from public.endodirect_acessos
      where user_id = auth.uid()
        and status = 'active'
        and (expires_at is null or expires_at > now())
    union all
    select 'plano' from public.endodirect_assinaturas
      where user_id = auth.uid()
        and status = 'active'
        and (current_period_end is null or current_period_end > now())
  ) s;

  result := base;
  if 'plano' = any(base) then
    result := result
      || coalesce((select array_agg('curso:' || slug) from public.endodirect_cursos where ativo and incluso_no_plano), '{}');
  end if;

  return (select coalesce(array_agg(distinct x), '{}') from unnest(result) x);
end;
$$;
revoke all on function public.endodirect_acessos_ativos() from public;
grant execute on function public.endodirect_acessos_ativos() to anon, authenticated;

create or replace function public.endodirect_is_active_member()
returns boolean language sql security definer set search_path = public stable as $$
  select coalesce(array_length(public.endodirect_acessos_ativos(), 1), 0) > 0;
$$;
revoke all on function public.endodirect_is_active_member() from public;
grant execute on function public.endodirect_is_active_member() to anon, authenticated;

-- Conteudo do membro, ja filtrado por escopo (gating no servidor):
--   provas (banco de questoes) -> curso:endoteem
--   podcasts, mm_shared (mapas) -> plano
--   adm_cursos (videoaulas)     -> qualquer membro (gating por curso vira na Etapa 2)
--   adm_avisos                  -> todos (mural)
-- O catalogo de cursos (vitrine) e os escopos ativos vao sempre.
create or replace function public.endodirect_member_content()
returns jsonb language sql security definer set search_path = public stable as $$
  with a as (select public.endodirect_acessos_ativos() as scopes),
       g as (select payload from public.endodirect_global_state where id = 'main')
  select jsonb_build_object(
    'member',  coalesce(array_length((select scopes from a), 1), 0) > 0,
    'acessos', to_jsonb((select scopes from a)),
    'cursos',  coalesce((select jsonb_agg(jsonb_build_object(
                  'slug', slug, 'nome', nome, 'descricao', descricao,
                  'preco_avulso_cents', preco_avulso_cents,
                  'incluso_no_plano', incluso_no_plano, 'ativo', ativo, 'ordem', ordem
                ) order by ordem, nome) from public.endodirect_cursos where ativo), '[]'::jsonb),
    'adm_avisos', coalesce((select payload->'adm_avisos' from g), '[]'::jsonb),
    'provas',     case when 'curso:endoteem' = any((select scopes from a))
                       then coalesce((select payload->'provas' from g), '[]'::jsonb) else '[]'::jsonb end,
    'podcasts',   case when 'plano' = any((select scopes from a))
                       then coalesce((select payload->'podcasts' from g), '[]'::jsonb) else '[]'::jsonb end,
    'mm_shared',  case when 'plano' = any((select scopes from a))
                       then coalesce((select payload->'mm_shared' from g), '[]'::jsonb) else '[]'::jsonb end,
    'adm_cursos', case when coalesce(array_length((select scopes from a), 1), 0) > 0
                       then coalesce((select payload->'adm_cursos' from g), '[]'::jsonb) else '[]'::jsonb end
  );
$$;
revoke all on function public.endodirect_member_content() from public;
grant execute on function public.endodirect_member_content() to anon, authenticated;
