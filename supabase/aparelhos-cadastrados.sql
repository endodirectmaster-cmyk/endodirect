-- APARELHOS CADASTRADOS (18/11/2026) — contra conta compartilhada em revezamento.
--
-- Professor, 18/11, com print da lista de Estudantes: "Provavelmente fizeram uma assinatura para várias
-- pessoas ao mesmo tempo compartilharem. Vamos tentar aumentar nosso mecanismo de segurança para tentar
-- blindar, bloquear ao máximo esse tipo de acesso coletivo." Escolheu: "Bloquear e trocar no Perfil" e
-- "Painel de contas suspeitas".
--
-- Antes (device-session-limit.sql): até 2 aparelhos AO MESMO TEMPO; o 3º derrubava o mais antigo e a
-- linha era apagada. Um grupo que entrasse em horários diferentes revezava a conta sem limite, e não
-- sobrava histórico para ver isso.
--
-- Agora:
--   * Os aparelhos ficam CADASTRADOS (até 2). Aparelho novo com as 2 vagas ocupadas NÃO entra: o aluno
--     escolhe um dos cadastrados para remover (tela de bloqueio ou Perfil > Meus aparelhos).
--   * Cada remoção é uma TROCA; no máximo 2 trocas a cada 30 dias. O professor pode liberar as trocas
--     de um aluno (e desconectar os aparelhos dele) no painel.
--   * Vaga sem uso há 30 dias volta sozinha (troca de celular, navegador limpo), sem gastar troca.
--   * "Sair" não libera a vaga (senão o revezamento voltava).
--   * Nada é apagado: o aparelho removido fica marcado (revogado_em/revogado_motivo), e a tentativa de
--     entrar com as vagas cheias também (bloqueios/bloqueado_em). É o histórico do painel.
--   * Contas de teste (endodirect_email_de_teste: demonstração, vitrine, revisão das lojas, admins) e o
--     professor ficam fora do limite.
--
-- A linha `#meta` de cada aluno (device_id começando com '#') guarda as trocas (meta.trocas, datas) e a
-- data em que o professor as liberou (meta.zerado_em). Fica na mesma tabela de propósito: ela já some
-- com a conta (chave estrangeira em cascata para auth.users), como manda a exclusão de conta.
--
-- Este arquivo não usa a palavra que o conector do Supabase recusa: nada aqui remove linhas.
-- Aplicado na base via migration `aparelhos_cadastrados`.

alter table public.endodirect_devices add column if not exists revogado_em timestamptz;
alter table public.endodirect_devices add column if not exists revogado_motivo text;
alter table public.endodirect_devices add column if not exists bloqueios int not null default 0;
alter table public.endodirect_devices add column if not exists bloqueado_em timestamptz;
alter table public.endodirect_devices add column if not exists meta jsonb;

-- O aluno só LÊ os próprios registros pela API; mudar, só pelas funções abaixo. (Antes ele podia remover
-- as próprias linhas direto pela API — com o cadastro, isso liberaria vaga sem gastar troca.)
revoke all on public.endodirect_devices from authenticated, anon;
grant select on public.endodirect_devices to authenticated;

create or replace function public.endodirect_aparelhos_isento(p_uid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce((select public.endodirect_email_de_teste(u.email) from auth.users u where u.id = p_uid), false);
$$;

-- Trocas que contam (últimos 30 dias, depois da última liberação do professor).
create or replace function public.endodirect_aparelhos_trocas(p_uid uuid)
returns table(usadas int, mais_antiga timestamptz) language sql stable security definer set search_path = public as $$
  with m as (
    select coalesce(meta, '{}'::jsonb) meta from public.endodirect_devices where user_id = p_uid and device_id = '#meta'
  ), t as (
    select (x)::timestamptz t
    from m, jsonb_array_elements_text(coalesce(m.meta->'trocas', '[]'::jsonb)) x
    where (x)::timestamptz > now() - interval '30 days'
      and (x)::timestamptz > coalesce((m.meta->>'zerado_em')::timestamptz, '-infinity'::timestamptz)
  )
  select count(*)::int, min(t) from t;
$$;

-- Entrar com este aparelho: 'ok' (cadastrado ou havia vaga), 'cheio' (2 cadastrados; aparelho não
-- entra), 'sem_conta' (o servidor ainda não viu o login: o cliente tenta de novo).
create or replace function public.endodirect_aparelho_entrar(p_device_id text, p_ua text default null)
returns text language plpgsql security definer set search_path = public as $$
declare v_uid uuid := auth.uid(); v_limite int := 2; v_ativos int; v_ua text := left(coalesce(p_ua, ''), 300);
  v_novo boolean; v_bloq_antes timestamptz;
begin
  if v_uid is null then return 'sem_conta'; end if;
  if p_device_id is null or length(p_device_id) < 8 or left(p_device_id, 1) = '#' then return 'sem_conta'; end if;
  perform pg_advisory_xact_lock(hashtext('endodirect_aparelhos:' || v_uid::text));
  if public.endodirect_aparelhos_isento(v_uid) then
    insert into public.endodirect_devices(user_id, device_id, user_agent, last_seen)
    values (v_uid, p_device_id, v_ua, now())
    on conflict (user_id, device_id) do update set last_seen = now(), user_agent = excluded.user_agent,
      revogado_em = null, revogado_motivo = null;
    return 'ok';
  end if;
  -- Vaga sem uso há 30 dias volta sozinha.
  update public.endodirect_devices set revogado_em = now(), revogado_motivo = 'inativo'
   where user_id = v_uid and revogado_em is null and left(device_id, 1) <> '#'
     and last_seen < now() - interval '30 days';
  -- Já cadastrado e ativo.
  update public.endodirect_devices set last_seen = now(), user_agent = v_ua
   where user_id = v_uid and device_id = p_device_id and revogado_em is null;
  if found then return 'ok'; end if;
  select count(*) into v_ativos from public.endodirect_devices
   where user_id = v_uid and revogado_em is null and left(device_id, 1) <> '#';
  if v_ativos < v_limite then
    insert into public.endodirect_devices(user_id, device_id, user_agent, last_seen, created_at)
    values (v_uid, p_device_id, v_ua, now(), now())
    on conflict (user_id, device_id) do update set revogado_em = null, revogado_motivo = null,
      last_seen = now(), user_agent = excluded.user_agent
    returning (xmax = 0) into v_novo;
    -- 27/11/2026: aparelho NUNCA visto entrou numa conta que já tinha outro → e-mail ao aluno
    -- (supabase/aparelho-novo-e-lembrete.sql). O 1º aparelho da conta não avisa (é o cadastro).
    if v_novo and exists (select 1 from public.endodirect_devices d
                           where d.user_id = v_uid and d.device_id <> p_device_id and left(d.device_id, 1) <> '#') then
      perform public.endodirect_alerta_aparelho_registrar(v_uid, 'novo', v_ua);
    end if;
    return 'ok';
  end if;
  -- Vagas cheias: fica registrada a tentativa (uma a cada 10 min por aparelho) e o aparelho não entra.
  select bloqueado_em into v_bloq_antes from public.endodirect_devices where user_id = v_uid and device_id = p_device_id;
  insert into public.endodirect_devices(user_id, device_id, user_agent, last_seen, created_at,
    revogado_em, revogado_motivo, bloqueios, bloqueado_em)
  values (v_uid, p_device_id, v_ua, now(), now(), now(), 'bloqueado', 1, now())
  on conflict (user_id, device_id) do update set
    bloqueios = public.endodirect_devices.bloqueios
      + case when public.endodirect_devices.bloqueado_em is null
               or public.endodirect_devices.bloqueado_em < now() - interval '10 minutes' then 1 else 0 end,
    bloqueado_em = now(), user_agent = excluded.user_agent;
  -- 27/11/2026: a tentativa barrada também vai por e-mail (a mesma janela de 10 min da contagem).
  if v_bloq_antes is null or v_bloq_antes < now() - interval '10 minutes' then
    perform public.endodirect_alerta_aparelho_registrar(v_uid, 'bloqueado', v_ua);
  end if;
  return 'cheio';
end; $$;

-- Compatível com o app antigo (o cliente de antes espera boolean): true só com o aparelho cadastrado.
create or replace function public.endodirect_session_claim(p_device_id text, p_ua text default null)
returns boolean language sql security definer set search_path = public as $$
  select public.endodirect_aparelho_entrar(p_device_id, p_ua) = 'ok';
$$;

-- Batida de coração: true se este aparelho segue cadastrado; false se foi removido (troca em outro
-- aparelho, professor) — aí o cliente encerra a sessão neste aparelho.
create or replace function public.endodirect_session_check(p_device_id text)
returns boolean language plpgsql security definer set search_path = public as $$
declare v_uid uuid := auth.uid();
begin
  if v_uid is null or p_device_id is null then return false; end if;
  update public.endodirect_devices set last_seen = now()
   where user_id = v_uid and device_id = p_device_id and revogado_em is null;
  return found;
end; $$;

-- Perfil > Meus aparelhos e a tela de bloqueio. `ref` identifica o aparelho sem expor o device_id.
create or replace function public.endodirect_aparelhos_meus(p_device_id text default null)
returns json language plpgsql stable security definer set search_path = public as $$
declare v_uid uuid := auth.uid(); v_usadas int; v_antiga timestamptz;
begin
  if v_uid is null then return null; end if;
  select usadas, mais_antiga into v_usadas, v_antiga from public.endodirect_aparelhos_trocas(v_uid);
  return json_build_object(
    'limite', 2, 'trocas_max', 2, 'trocas_usadas', coalesce(v_usadas, 0),
    'proxima_troca', case when coalesce(v_usadas, 0) >= 2 then v_antiga + interval '30 days' end,
    'isento', public.endodirect_aparelhos_isento(v_uid),
    'este_ativo', exists (select 1 from public.endodirect_devices
                          where user_id = v_uid and device_id = p_device_id and revogado_em is null),
    'aparelhos', coalesce((
      select json_agg(json_build_object('ref', md5(d.device_id), 'ua', d.user_agent, 'desde', d.created_at,
                                        'visto', d.last_seen, 'este', d.device_id = p_device_id)
                      order by (d.device_id = p_device_id) desc, d.last_seen desc)
      from public.endodirect_devices d
      where d.user_id = v_uid and d.revogado_em is null and left(d.device_id, 1) <> '#'), '[]'::json));
end; $$;

-- Remover um aparelho cadastrado (gasta 1 troca). Vale também a partir do aparelho bloqueado.
create or replace function public.endodirect_aparelho_remover(p_device_id text, p_ref text)
returns json language plpgsql security definer set search_path = public as $$
declare v_uid uuid := auth.uid(); v_usadas int; v_antiga timestamptz; v_lista jsonb;
begin
  if v_uid is null or p_ref is null then return json_build_object('ok', false, 'motivo', 'sem_conta'); end if;
  perform pg_advisory_xact_lock(hashtext('endodirect_aparelhos:' || v_uid::text));
  select usadas, mais_antiga into v_usadas, v_antiga from public.endodirect_aparelhos_trocas(v_uid);
  if coalesce(v_usadas, 0) >= 2 then
    return json_build_object('ok', false, 'motivo', 'limite', 'proxima_troca', v_antiga + interval '30 days');
  end if;
  update public.endodirect_devices set revogado_em = now(), revogado_motivo = 'troca'
   where user_id = v_uid and revogado_em is null and left(device_id, 1) <> '#'
     and md5(device_id) = p_ref and device_id is distinct from p_device_id;
  if not found then return json_build_object('ok', false, 'motivo', 'nao_encontrado'); end if;
  select coalesce(jsonb_agg(x), '[]'::jsonb) into v_lista
    from public.endodirect_devices d, jsonb_array_elements(coalesce(d.meta->'trocas', '[]'::jsonb)) x
   where d.user_id = v_uid and d.device_id = '#meta' and (x #>> '{}')::timestamptz > now() - interval '30 days';
  insert into public.endodirect_devices(user_id, device_id, user_agent, last_seen, created_at, revogado_em,
    revogado_motivo, meta)
  values (v_uid, '#meta', '', now(), now(), now(), 'meta', jsonb_build_object('trocas', jsonb_build_array(now())))
  on conflict (user_id, device_id) do update set
    meta = jsonb_set(coalesce(public.endodirect_devices.meta, '{}'::jsonb), '{trocas}', v_lista || to_jsonb(now()));
  return json_build_object('ok', true, 'trocas_usadas', coalesce(v_usadas, 0) + 1);
end; $$;

-- Painel do professor: contas com sinal de uso coletivo nos últimos 30 dias.
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
        max(d.last_seen) as ultimo,
        ( (count(*) filter (where d.created_at > now() - interval '30 days')) * 2
          + 3 * coalesce((select usadas from public.endodirect_aparelhos_trocas(u.id)), 0)
          + 4 * count(distinct d.device_id) filter (where d.bloqueado_em > now() - interval '30 days') ) as pontos
      from public.endodirect_devices d
      join auth.users u on u.id = d.user_id
      where left(d.device_id, 1) <> '#' and not public.endodirect_email_de_teste(u.email)
      group by u.id, u.email, u.raw_user_meta_data
      having count(*) filter (where d.created_at > now() - interval '30 days') >= 4
          or coalesce((select usadas from public.endodirect_aparelhos_trocas(u.id)), 0) >= 2
          or count(distinct d.device_id) filter (where d.bloqueado_em > now() - interval '30 days') >= 2
    ) r), '[]'::json);
end; $$;

-- Professor: liberar as trocas de um aluno e, se pedir, desconectar todos os aparelhos dele.
create or replace function public.endodirect_aparelhos_admin_liberar(p_user uuid, p_desconectar boolean default false)
returns json language plpgsql security definer set search_path = public as $$
declare v_n int := 0;
begin
  if not public.endodirect_is_admin() then raise exception 'forbidden'; end if;
  if p_user is null then return json_build_object('ok', false); end if;
  perform pg_advisory_xact_lock(hashtext('endodirect_aparelhos:' || p_user::text));
  insert into public.endodirect_devices(user_id, device_id, user_agent, last_seen, created_at, revogado_em,
    revogado_motivo, meta)
  values (p_user, '#meta', '', now(), now(), now(), 'meta', jsonb_build_object('zerado_em', now()))
  on conflict (user_id, device_id) do update set
    meta = jsonb_set(coalesce(public.endodirect_devices.meta, '{}'::jsonb), '{zerado_em}', to_jsonb(now()));
  if p_desconectar then
    update public.endodirect_devices set revogado_em = now(), revogado_motivo = 'professor'
     where user_id = p_user and revogado_em is null and left(device_id, 1) <> '#';
    get diagnostics v_n = row_count;
  end if;
  return json_build_object('ok', true, 'desconectados', v_n);
end; $$;

revoke all on function public.endodirect_aparelhos_isento(uuid) from public, anon, authenticated;
revoke all on function public.endodirect_aparelhos_trocas(uuid) from public, anon, authenticated;
revoke all on function public.endodirect_aparelho_entrar(text, text) from public, anon;
revoke all on function public.endodirect_aparelhos_meus(text) from public, anon;
revoke all on function public.endodirect_aparelho_remover(text, text) from public, anon;
revoke all on function public.endodirect_aparelhos_admin() from public, anon;
revoke all on function public.endodirect_aparelhos_admin_liberar(uuid, boolean) from public, anon;
grant execute on function public.endodirect_aparelho_entrar(text, text) to authenticated;
grant execute on function public.endodirect_aparelhos_meus(text) to authenticated;
grant execute on function public.endodirect_aparelho_remover(text, text) to authenticated;
grant execute on function public.endodirect_aparelhos_admin() to authenticated;
grant execute on function public.endodirect_aparelhos_admin_liberar(uuid, boolean) to authenticated;
grant execute on function public.endodirect_session_claim(text, text) to authenticated;
grant execute on function public.endodirect_session_check(text) to authenticated;
