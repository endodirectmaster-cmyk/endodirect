-- Limite de dispositivos por aluno (anti-compartilhamento de login).
-- Aplicado na base via migration `device_session_limit`. Mantido aqui como
-- referência versionada. Política: máx. 2 dispositivos/sessões simultâneos;
-- ao entrar num 3º, o mais antigo é removido e cai no próximo heartbeat.
-- Vale só para alunos (o cliente só chama os RPCs para role 'aluno').

create table if not exists public.endodirect_devices (
  user_id    uuid not null references auth.users(id) on delete cascade,
  device_id  text not null,
  user_agent text,
  last_seen  timestamptz not null default now(),
  created_at timestamptz not null default now(),
  primary key (user_id, device_id)
);
alter table public.endodirect_devices enable row level security;

drop policy if exists endodirect_devices_select_own on public.endodirect_devices;
create policy endodirect_devices_select_own on public.endodirect_devices
  for select to authenticated using (user_id = auth.uid());
drop policy if exists endodirect_devices_delete_own on public.endodirect_devices;
create policy endodirect_devices_delete_own on public.endodirect_devices
  for delete to authenticated using (user_id = auth.uid());
grant select, delete on public.endodirect_devices to authenticated;

-- Registra/atualiza o dispositivo atual e mantém só os 2 mais recentes.
create or replace function public.endodirect_session_claim(p_device_id text, p_ua text default null)
returns boolean language plpgsql security definer set search_path = public as $$
declare v_uid uuid := auth.uid(); v_limit int := 2;
begin
  if v_uid is null or p_device_id is null or length(p_device_id) < 8 then return false; end if;
  insert into public.endodirect_devices(user_id, device_id, user_agent, last_seen)
  values (v_uid, p_device_id, left(coalesce(p_ua,''),300), now())
  on conflict (user_id, device_id) do update set last_seen = now(), user_agent = left(coalesce(p_ua,''),300);
  delete from public.endodirect_devices d
  where d.user_id = v_uid
    and d.device_id not in (
      select device_id from public.endodirect_devices
      where user_id = v_uid order by last_seen desc limit v_limit
    );
  return true;
end; $$;

-- Heartbeat: true se este dispositivo ainda tem vaga; false se foi removido.
create or replace function public.endodirect_session_check(p_device_id text)
returns boolean language plpgsql security definer set search_path = public as $$
declare v_uid uuid := auth.uid();
begin
  if v_uid is null or p_device_id is null then return false; end if;
  update public.endodirect_devices set last_seen = now()
    where user_id = v_uid and device_id = p_device_id;
  return found;
end; $$;

grant execute on function public.endodirect_session_claim(text, text) to authenticated;
grant execute on function public.endodirect_session_check(text) to authenticated;
