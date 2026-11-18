-- USO DAS FERRAMENTAS (18/11/2026) — pedido do professor: "mapear o que os alunos estão usando de
-- ferramentas da plataforma".
--
-- O app_state do aluno só guarda o que a ferramenta precisa (respostas, cartões, simulados...); Chat IA,
-- OSCE, Prescrição, Calculadoras, Resumos, Diretrizes, Podcasts e as videoaulas não deixavam rastro de uso.
-- Agora, a cada tela aberta (no máximo 1 registro por ferramenta a cada 10 min por aparelho), capítulo
-- dos Resumos aberto e videoaula iniciada, o app chama `endodirect_uso_registrar(item)`, que soma 1 no
-- dia (horário de Brasília). O professor vê o resumo em Analytics (`endodirect_uso_admin`).
--
-- Onde fica: na linha `#uso` do próprio aluno em `endodirect_devices` (meta.d = {"AAAA-MM-DD": {item: n}},
-- 120 dias). Mesma tabela da linha `#meta` dos aparelhos, de propósito: ela some com a conta (chave
-- estrangeira em cascata), e o app_state não serve porque o app regrava o payload inteiro a cada salvamento
-- (um contador do servidor ali seria apagado). Linhas com device_id começando em '#' ficam fora de toda a
-- lógica de aparelhos.
--
-- Este arquivo não usa a palavra que o conector do Supabase recusa.
-- Aplicado na base via migration `uso_ferramentas`.

create or replace function public.endodirect_uso_registrar(p_item text)
returns void language plpgsql security definer set search_path = public as $$
declare v_uid uuid := auth.uid();
        v_dia text := to_char((now() at time zone 'America/Sao_Paulo')::date, 'YYYY-MM-DD');
        v_corte text := to_char((now() at time zone 'America/Sao_Paulo')::date - 120, 'YYYY-MM-DD');
begin
  if v_uid is null or p_item is null or p_item !~ '^[a-z0-9_]{2,24}$' then return; end if;
  insert into public.endodirect_devices(user_id, device_id, user_agent, last_seen, created_at, revogado_em,
    revogado_motivo, meta)
  values (v_uid, '#uso', '', now(), now(), now(), 'uso',
    jsonb_build_object('d', jsonb_build_object(v_dia, jsonb_build_object(p_item, 1))))
  on conflict (user_id, device_id) do update set
    meta = jsonb_build_object('d',
      coalesce((select jsonb_object_agg(e.key, e.value)
                  from jsonb_each(coalesce(public.endodirect_devices.meta->'d', '{}'::jsonb)) e
                 where e.key >= v_corte), '{}'::jsonb)
      || jsonb_build_object(v_dia,
           coalesce(public.endodirect_devices.meta->'d'->v_dia, '{}'::jsonb)
           || jsonb_build_object(p_item, coalesce((public.endodirect_devices.meta->'d'->v_dia->>p_item)::int, 0) + 1)));
end; $$;

-- Analytics do professor. `dias`: janela (7 ou 30). `itens`: por ferramenta, alunos que usaram (e quantos
-- deles assinantes), aberturas e dias de uso. `retrato`: o que já estava registrado no app_state antes da
-- contagem (quantos alunos, assinantes ou na degustação, já usaram cada coisa desde sempre).
create or replace function public.endodirect_uso_admin(p_dias int default 30)
returns json language plpgsql stable security definer set search_path = public as $$
declare v_dias int := greatest(1, least(coalesce(p_dias, 30), 120)); v_out json;
begin
  if not public.endodirect_is_admin() then raise exception 'forbidden'; end if;
  with pag as (
    select distinct x.user_id from public.endodirect_acessos x
     where x.status = 'active' and (x.expires_at is null or x.expires_at > now()) and coalesce(x.provider, '') <> 'manual'
  ), u as (
    select d.user_id, e.key::date as dia, f.key as item, (f.value)::int as n
      from public.endodirect_devices d
      join auth.users au on au.id = d.user_id
      cross join lateral jsonb_each(coalesce(d.meta->'d', '{}'::jsonb)) e
      cross join lateral jsonb_each_text(e.value) f
     where d.device_id = '#uso' and not public.endodirect_email_de_teste(au.email)
       and e.key::date > (now() at time zone 'America/Sao_Paulo')::date - v_dias
  ), al as (
    select s.user_id, s.payload, (s.user_id in (select user_id from pag)) as pagante
      from public.endodirect_app_state s
     where s.role = 'aluno' and not public.endodirect_email_de_teste(s.email)
  ), ret as (
    select pagante,
      (coalesce(payload->'perf', '{}'::jsonb) <> '{}'::jsonb or jsonb_array_length(coalesce(payload->'q', '[]'::jsonb)) > 0
        or coalesce(payload->'feitas', '{}'::jsonb) <> '{}'::jsonb) as quest,
      coalesce(payload->'qotd', '{}'::jsonb) <> '{}'::jsonb as qotd,
      exists (select 1 from jsonb_array_elements(coalesce(payload->'fc', '[]'::jsonb)) c where coalesce((c->>'reps')::int, 0) > 0) as flash,
      jsonb_array_length(coalesce(payload->'srs', '[]'::jsonb)) > 0 as sr,
      jsonb_array_length(coalesce(payload->'sf_results', '[]'::jsonb)) > 0 as simfull,
      jsonb_array_length(coalesce(payload->'mm', '[]'::jsonb)) > 0 as mmap,
      jsonb_array_length(coalesce(payload->'notes', '[]'::jsonb)) > 0 as notas,
      coalesce(payload->'cursoProg', '{}'::jsonb) <> '{}'::jsonb as cursos,
      coalesce(payload->'plan', 'null'::jsonb) <> 'null'::jsonb as plano,
      coalesce(payload->'crono', 'null'::jsonb) not in ('null'::jsonb, '{}'::jsonb) as crono,
      jsonb_array_length(coalesce(payload->'presc_emitidas', '[]'::jsonb)) > 0 as rx
    from al
  )
  select json_build_object(
    'dias', v_dias,
    'desde', (select min(e.key) from public.endodirect_devices d cross join lateral jsonb_each(coalesce(d.meta->'d', '{}'::jsonb)) e where d.device_id = '#uso'),
    'alunos', (select count(distinct user_id) from u),
    'pagantes', (select count(distinct u.user_id) from u where u.user_id in (select user_id from pag)),
    'itens', coalesce((select json_agg(row_to_json(t) order by t.alunos desc, t.aberturas desc) from (
        select item, count(distinct user_id) as alunos,
               count(distinct user_id) filter (where user_id in (select user_id from pag)) as pagantes,
               sum(n)::int as aberturas, count(distinct (user_id, dia)) as dias_uso
          from u group by item) t), '[]'::json),
    'retrato', (select json_build_object(
        'pagantes', count(*) filter (where pagante), 'degustacao', count(*) filter (where not pagante),
        'itens', json_build_array(
          json_build_object('item', 'quest',   'pagantes', count(*) filter (where pagante and quest),   'degustacao', count(*) filter (where not pagante and quest)),
          json_build_object('item', 'qotd',    'pagantes', count(*) filter (where pagante and qotd),    'degustacao', count(*) filter (where not pagante and qotd)),
          json_build_object('item', 'sr',      'pagantes', count(*) filter (where pagante and sr),      'degustacao', count(*) filter (where not pagante and sr)),
          json_build_object('item', 'flash',   'pagantes', count(*) filter (where pagante and flash),   'degustacao', count(*) filter (where not pagante and flash)),
          json_build_object('item', 'cursos',  'pagantes', count(*) filter (where pagante and cursos),  'degustacao', count(*) filter (where not pagante and cursos)),
          json_build_object('item', 'plano',   'pagantes', count(*) filter (where pagante and plano),   'degustacao', count(*) filter (where not pagante and plano)),
          json_build_object('item', 'simfull', 'pagantes', count(*) filter (where pagante and simfull), 'degustacao', count(*) filter (where not pagante and simfull)),
          json_build_object('item', 'mmap',    'pagantes', count(*) filter (where pagante and mmap),    'degustacao', count(*) filter (where not pagante and mmap)),
          json_build_object('item', 'notas',   'pagantes', count(*) filter (where pagante and notas),   'degustacao', count(*) filter (where not pagante and notas)),
          json_build_object('item', 'crono',   'pagantes', count(*) filter (where pagante and crono),   'degustacao', count(*) filter (where not pagante and crono)),
          json_build_object('item', 'rx',      'pagantes', count(*) filter (where pagante and rx),      'degustacao', count(*) filter (where not pagante and rx))
        )) from ret)
  ) into v_out;
  return v_out;
end; $$;

revoke all on function public.endodirect_uso_registrar(text) from public, anon;
revoke all on function public.endodirect_uso_admin(int) from public, anon;
grant execute on function public.endodirect_uso_registrar(text) to authenticated;
grant execute on function public.endodirect_uso_admin(int) to authenticated;
