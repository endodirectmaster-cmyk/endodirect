-- Breaking News do Mural do professor notifica sozinha, uma vez por card (24/11/2026).
-- Aplicada como migração `push_breaking_automatico`. Ver lib/push-breaking.js
-- (pushBreakingDoProfessor) e a rota api/publico?rota=push-breaking.
create table if not exists public.endodirect_push_breaking (
  chave text primary key,
  titulo text,
  enviado_em timestamptz not null default now(),
  origem text not null default 'auto'
);
alter table public.endodirect_push_breaking enable row level security;
revoke all on public.endodirect_push_breaking from anon, authenticated;

-- Breaking News de adm_avisos ainda sem notificação (e sem push automático do radar).
-- A chave é a mesma do painel (breakingChave): sourceId, senão at:<at>, senão link, senão título.
create or replace function public.endodirect_breaking_pendentes()
returns jsonb language sql stable security definer set search_path to 'public' as $f$
  select coalesce(jsonb_agg(jsonb_build_object('chave', x.k, 'titulo', x.t, 'fonte', x.f) order by x.ord desc), '[]'::jsonb)
  from (
    select coalesce(nullif(v->>'sourceId',''), case when coalesce(v->>'at','') <> '' then 'at:'||(v->>'at') end, nullif(v->>'link',''), v->>'titulo') as k,
           coalesce(nullif(v->>'titulo_pt',''), v->>'titulo') as t,
           coalesce(v->>'fonte','') as f,
           o as ord
    from endodirect_global_state g, jsonb_array_elements(coalesce(g.payload->'adm_avisos','[]'::jsonb)) with ordinality e(v,o)
    where g.id = 'main'
      and (v->>'tipo' ~* 'breaking' or v->>'breaking' = 'true')
      and coalesce(nullif(v->>'pushAutoAt',''),'0')::numeric = 0
  ) x
  where x.k is not null and coalesce(x.t,'') <> ''
    and not exists (select 1 from endodirect_push_breaking p where p.chave = x.k);
$f$;

-- Reserva atômica antes do envio: true só para quem gravou a chave primeiro.
create or replace function public.endodirect_breaking_reservar(p_chave text, p_titulo text)
returns boolean language plpgsql security definer set search_path to 'public' as $f$
declare n int;
begin
  if coalesce(p_chave,'') = '' then return false; end if;
  insert into endodirect_push_breaking(chave, titulo) values (p_chave, left(coalesce(p_titulo,''), 300))
  on conflict (chave) do nothing;
  get diagnostics n = row_count;
  return n = 1;
end $f$;

revoke all on function public.endodirect_breaking_pendentes() from public, anon, authenticated;
revoke all on function public.endodirect_breaking_reservar(text, text) from public, anon, authenticated;
grant execute on function public.endodirect_breaking_pendentes() to service_role;
grant execute on function public.endodirect_breaking_reservar(text, text) to service_role;

-- Semente (só na instalação): as Breaking News que já existiam não voltam a notificar;
-- a do ORION-4, de 24/11/2026, ficou de fora para sair pelo caminho novo.
