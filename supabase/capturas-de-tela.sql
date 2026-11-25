-- CAPTURAS DE TELA NO APP DO IPHONE (versão 1.4, 25/11/2026).
--
-- Professor: "Faz os 3" (proteção da videoaula contra gravação de tela, áudio com a tela bloqueada e
-- widget da Questão do Dia). O app avisa a página quando a tela começa a ser gravada/espelhada e quando
-- alguém tira print; a página pausa a aula e, se havia aula ou Resumo na tela, anota aqui. O painel de
-- contas suspeitas (endodirect_aparelhos_admin) passa a contar essas capturas dos últimos 30 dias.
--
-- Nada aqui remove linhas. A tabela some com a conta (cascata para auth.users), como manda a exclusão.
-- Aplicado na base via migration `capturas_de_tela`.

create table if not exists public.endodirect_capturas (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  tipo text not null check (tipo in ('print', 'gravacao')),
  onde text not null default '' check (char_length(onde) <= 40),
  criado timestamptz not null default now()
);
create index if not exists endodirect_capturas_user_criado on public.endodirect_capturas (user_id, criado desc);
alter table public.endodirect_capturas enable row level security;
revoke all on public.endodirect_capturas from anon, authenticated;

-- O aluno só registra (a própria conta, pela sessão); não lê nem muda nada. No máximo 30 por dia por
-- conta, para um script não encher a tabela.
create or replace function public.endodirect_captura_registrar(p_tipo text, p_onde text default '')
returns boolean language plpgsql security definer set search_path = public as $$
declare v_uid uuid := auth.uid();
begin
  if v_uid is null or p_tipo is null or p_tipo not in ('print', 'gravacao') then return false; end if;
  if (select count(*) from public.endodirect_capturas where user_id = v_uid and criado > now() - interval '1 day') >= 30 then
    return false;
  end if;
  insert into public.endodirect_capturas (user_id, tipo, onde)
  values (v_uid, p_tipo, left(regexp_replace(lower(coalesce(p_onde, '')), '[^a-z0-9_-]', '', 'g'), 40));
  return true;
end; $$;
revoke all on function public.endodirect_captura_registrar(text, text) from public, anon;
grant execute on function public.endodirect_captura_registrar(text, text) to authenticated;

-- Painel de contas suspeitas: + prints e gravações dos últimos 30 dias (2 pontos cada; 3 ou mais já
-- põem a conta na lista).
create or replace function public.endodirect_aparelhos_admin()
returns json language plpgsql stable security definer set search_path = public as $$
begin
  if not public.endodirect_is_admin() then raise exception 'forbidden'; end if;
  return coalesce((
    select json_agg(row_to_json(r) order by r.pontos desc, r.ultimo desc nulls last)
    from (
      select u.id as user_id, u.email,
        coalesce(u.raw_user_meta_data->>'nome', u.raw_user_meta_data->>'name', split_part(u.email, '@', 1)) as nome,
        count(*) filter (where d.revogado_em is null) as ativos,
        count(*) filter (where d.created_at > now() - interval '30 days') as aparelhos_30d,
        (select usadas from public.endodirect_aparelhos_trocas(u.id)) as trocas_30d,
        coalesce(sum(d.bloqueios) filter (where d.bloqueado_em > now() - interval '30 days'), 0)::int as bloqueios_30d,
        count(distinct d.device_id) filter (where d.bloqueado_em > now() - interval '30 days') as aparelhos_bloqueados_30d,
        (select count(*) from public.endodirect_capturas c where c.user_id = u.id and c.tipo = 'print' and c.criado > now() - interval '30 days')::int as prints_30d,
        (select count(*) from public.endodirect_capturas c where c.user_id = u.id and c.tipo = 'gravacao' and c.criado > now() - interval '30 days')::int as gravacoes_30d,
        max(d.last_seen) as ultimo,
        ( (count(*) filter (where d.created_at > now() - interval '30 days')) * 2
          + 3 * coalesce((select usadas from public.endodirect_aparelhos_trocas(u.id)), 0)
          + 4 * count(distinct d.device_id) filter (where d.bloqueado_em > now() - interval '30 days')
          + 2 * (select count(*) from public.endodirect_capturas c where c.user_id = u.id and c.criado > now() - interval '30 days') ) as pontos
      from public.endodirect_devices d
      join auth.users u on u.id = d.user_id
      where left(d.device_id, 1) <> '#' and not public.endodirect_email_de_teste(u.email)
      group by u.id, u.email, u.raw_user_meta_data
      having count(*) filter (where d.created_at > now() - interval '30 days') >= 4
          or coalesce((select usadas from public.endodirect_aparelhos_trocas(u.id)), 0) >= 2
          or count(distinct d.device_id) filter (where d.bloqueado_em > now() - interval '30 days') >= 2
          or (select count(*) from public.endodirect_capturas c where c.user_id = u.id and c.criado > now() - interval '30 days') >= 3
    ) r), '[]'::json);
end; $$;
