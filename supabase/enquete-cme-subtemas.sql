-- Enquete de Educação Médica Continuada: apuração também dos TEMAS dentro de cada
-- subespecialidade (04/11/2026).
--
-- Pedido do professor: "quando ele clicar na subespecialidade, abre uma opção de
-- temas sugeridos. Por exemplo, ao clicar em endocrinologia feminina --> SOMP,
-- menopausa, falência ovariana, etc". O voto (no app_state do aluno) ganhou
-- `subtemas`: { "<subespecialidade>": ["<tema>", ...] }, com até 3 por
-- subespecialidade. Esta versão da RPC devolve, além do que já devolvia,
-- `subtemas`: [{tema, subtema, votos, votos_gold}].
--
-- Só conta tema de subespecialidade que está no próprio voto (`temas`), e só texto
-- de até 80 caracteres: o voto vem do cliente.
create or replace function public.endodirect_admin_enquete_cme()
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v jsonb;
begin
  if not public.endodirect_is_admin() then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  with votos as (
    select s.email,
           s.payload->'enquete_cme' as voto,
           to_timestamp(((s.payload->'enquete_cme'->>'em')::bigint)/1000) as votado_em
      from public.endodirect_app_state s
     where jsonb_typeof(s.payload->'enquete_cme'->'temas') = 'array'
       and coalesce((s.payload->'enquete_cme'->>'em')::bigint, 0) > 0
       and not public.endodirect_email_de_teste(s.email)
  ),
  -- ⚠️ Plano ATUAL, não o do momento do voto: quem votou Gold e caiu para
  -- Standard não deve pesar no calendário de um programa exclusivo do Gold.
  gold as (
    select distinct lower(a.email) as email
      from public.endodirect_acessos a
     where a.status = 'active'
       and (a.scope = 'plano:gold' or a.scope = 'plano')
       and (a.expires_at is null or a.expires_at > now())
       and not public.endodirect_email_de_teste(a.email)
  ),
  marcados as (
    select v.email, jsonb_array_elements_text(v.voto->'temas') as tema,
           (g.email is not null) as eh_gold
      from votos v left join gold g on g.email = lower(v.email)
  ),
  sub_marcados as (
    select distinct v.email, k.key as tema, st.subtema, (g.email is not null) as eh_gold
      from votos v
      left join gold g on g.email = lower(v.email)
      cross join lateral jsonb_each(case when jsonb_typeof(v.voto->'subtemas') = 'object' then v.voto->'subtemas' else '{}'::jsonb end) k
      cross join lateral jsonb_array_elements_text(case when jsonb_typeof(k.value) = 'array' then k.value else '[]'::jsonb end) st(subtema)
     where length(st.subtema) between 1 and 80
       and exists (select 1 from jsonb_array_elements_text(v.voto->'temas') t(x) where t.x = k.key)
  )
  select jsonb_build_object(
    'ranking', coalesce((
      select jsonb_agg(jsonb_build_object('tema', tema, 'votos', n, 'votos_gold', n_gold) order by n_gold desc, n desc, tema)
        from (select tema, count(*) as n, count(*) filter (where eh_gold) as n_gold
                from marcados group by tema) t
    ), '[]'::jsonb),
    'subtemas', coalesce((
      select jsonb_agg(jsonb_build_object('tema', tema, 'subtema', subtema, 'votos', n, 'votos_gold', n_gold) order by tema, n_gold desc, n desc, subtema)
        from (select tema, subtema, count(*) as n, count(*) filter (where eh_gold) as n_gold
                from sub_marcados group by tema, subtema) s
    ), '[]'::jsonb),
    'sugestoes_livres', coalesce((
      select jsonb_agg(jsonb_build_object('texto', v.voto->>'outro', 'email', v.email, 'em', v.votado_em) order by v.votado_em desc)
        from votos v
       where coalesce(nullif(trim(v.voto->>'outro'), ''), null) is not null
    ), '[]'::jsonb),
    'total_votantes',      (select count(*) from votos),
    'votantes_gold',       (select count(*) from votos v join gold g on g.email = lower(v.email)),
    'gold_elegiveis',      (select count(*) from gold),
    'ultimo_voto',         (select max(votado_em) from votos)
  ) into v;
  return v;
end;
$function$;
