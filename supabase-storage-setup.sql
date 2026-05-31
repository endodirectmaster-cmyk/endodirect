-- Endodirect Storage setup
-- Execute no SQL Editor do projeto Supabase antes de usar uploads reais no painel admin.

create table if not exists public.endodirect_admins (
  email text primary key,
  created_at timestamptz not null default now()
);

insert into public.endodirect_admins (email)
values
  ('nakamura.epm79@gmail.com'),
  ('rodolphomend@gmail.com'),
  ('drrafaelgiorgi@hotmail.com'),
  ('brunosimiao1906@gmail.com'),
  ('endodirectmaster@gmail.com')
on conflict (email) do nothing;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('endodirect-assets', 'endodirect-assets', true, 524288000, null)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "endodirect_assets_public_read" on storage.objects;
create policy "endodirect_assets_public_read"
on storage.objects
for select
using (bucket_id = 'endodirect-assets');

drop policy if exists "endodirect_assets_admin_insert" on storage.objects;
create policy "endodirect_assets_admin_insert"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'endodirect-assets'
  and exists (
    select 1
    from public.endodirect_admins a
    where lower(a.email) = lower(auth.jwt() ->> 'email')
  )
);

drop policy if exists "endodirect_assets_admin_update" on storage.objects;
create policy "endodirect_assets_admin_update"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'endodirect-assets'
  and exists (
    select 1
    from public.endodirect_admins a
    where lower(a.email) = lower(auth.jwt() ->> 'email')
  )
)
with check (
  bucket_id = 'endodirect-assets'
  and exists (
    select 1
    from public.endodirect_admins a
    where lower(a.email) = lower(auth.jwt() ->> 'email')
  )
);

drop policy if exists "endodirect_assets_admin_delete" on storage.objects;
create policy "endodirect_assets_admin_delete"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'endodirect-assets'
  and exists (
    select 1
    from public.endodirect_admins a
    where lower(a.email) = lower(auth.jwt() ->> 'email')
  )
);
