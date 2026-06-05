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

create or replace function public.endodirect_is_active_member()
returns boolean language sql security definer set search_path = public stable as $$
  select coalesce((
    select true from public.endodirect_admins a
    where lower(a.email) = lower(auth.jwt() ->> 'email') limit 1
  ), false)
  or coalesce((
    select true from public.endodirect_assinaturas s
    where s.user_id = auth.uid()
      and s.status = 'active'
      and (s.current_period_end is null or s.current_period_end > now())
    limit 1
  ), false);
$$;
revoke all on function public.endodirect_is_active_member() from public;
grant execute on function public.endodirect_is_active_member() to anon, authenticated;

create or replace function public.endodirect_member_content()
returns jsonb language sql security definer set search_path = public stable as $$
  select case when public.endodirect_is_active_member() then
    jsonb_build_object(
      'member', true,
      'provas',     coalesce(payload->'provas',     '[]'::jsonb),
      'adm_avisos', coalesce(payload->'adm_avisos', '[]'::jsonb),
      'podcasts',   coalesce(payload->'podcasts',   '[]'::jsonb),
      'adm_cursos', coalesce(payload->'adm_cursos', '[]'::jsonb),
      'mm_shared',  coalesce(payload->'mm_shared',  '[]'::jsonb)
    )
  else
    jsonb_build_object('member', false, 'adm_avisos', coalesce(payload->'adm_avisos', '[]'::jsonb))
  end
  from public.endodirect_global_state where id = 'main';
$$;
revoke all on function public.endodirect_member_content() from public;
grant execute on function public.endodirect_member_content() to anon, authenticated;
