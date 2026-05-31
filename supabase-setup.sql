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
