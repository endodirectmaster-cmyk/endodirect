-- As questões saem do member_content e passam a vir em páginas, numa RPC própria
-- (12/10/2026).
--
-- POR QUE AGORA. Medido em 12/10 com um Gold ativo (JWT simulado, a mesma
-- chamada que o app faz): o `endodirect_member_content` respondia 5.426.825
-- bytes, dos quais `provas` 3.875.392 (2.135 questões, 71% da resposta). O cofre
-- registra desde 23/07 que respostas perto de ~5,3 MB deixam de chegar ao
-- celular — foi o que levou a separar os Resumos (`endodirect_member_resumos`,
-- 21/07) e a Questão do Dia (`endodirect_qotd_publicadas`, 10/10). Com as
-- questões dentro, cada lote novo empurrava a resposta inteira para cima.
--
-- POR QUE EM PÁGINAS, e não numa RPC só. O ensaio de 12/10 mediu, por perfil,
-- só o array de questões: Gold e Standard 3,88 MB (2.135); Gold com EndoTEEM
-- 5,67 MB (3.015) — e a resposta inteira dele era de 7,2 MB, acima do limite
-- desde antes deste lote; só EndoTEEM 5,17 MB (2.761). Uma RPC só com as
-- questões já nasceria acima do limite para quem tem o TEEM, e voltaria a
-- crescer a cada lote para todos. Em páginas de 500 (~0,9 MB cada), o lote novo
-- aumenta o NÚMERO de páginas, não o tamanho de nenhuma resposta.
--
-- O DESENHO (sem quebrar quem ainda tem o app antigo em cache):
--   1) `endodirect_member_provas()` — a REGRA: o array de questões do aluno,
--      com as mesmas regras de escopo de antes (plano, curso:endoteem,
--      degustação, TEEM), movidas sem alteração. Só o servidor a chama.
--   2) `endodirect_member_provas_pagina(p_pagina)` — o que o app chama: uma
--      página de 500 da lista acima, com `total`, `paginas` e `versao` (md5 da
--      lista inteira). O app pede a página 0, depois as demais em paralelo, cada
--      uma com 3 tentativas; se a `versao` mudar no meio (o professor gravou o
--      banco durante a carga), recomeça uma vez — nunca junta páginas de duas
--      versões.
--   3) `endodirect_member_content_sem_provas()` — tudo o que o member_content
--      entregava, menos `provas`. ~1,55 MB para o Gold em 12/10.
--   4) `endodirect_member_content()` passa a ser a COMPOSIÇÃO de 1 e 3. O app
--      antigo, preso no cache do service worker até atualizar, continua
--      recebendo exatamente a mesma resposta (conferido por igualdade de jsonb,
--      em ensaio com rollback, para cada perfil de acesso). E a regra das
--      questões fica num lugar só.
--
-- 🧨 CORPO COMPLETO, lido do `prosrc` em produção em 12/10 (md5 do prosrc
-- 7b3003463783fe435efc997096ad955a). Regra do cofre: patch parcial em função sem
-- o corpo inteiro versionado já perdeu a janela do radar, o filtro do
-- `radar_hidden` e a chave `ig_stories`. Antes de reescrever qualquer uma
-- destas, ler o `prosrc` de produção — este arquivo substitui, como referência,
-- o `member-content-mais-leve.sql` (24/09).
--
-- ACL: 2, 3 e 4 como o member_content sempre esteve — `anon`, `authenticated` e
-- `service_role`, sem PUBLIC (o anônimo cai no ramo de degustação, 50 questões
-- do Endodirect, o mesmo que a rota pública entrega). A 1 fica só com o
-- `service_role`: as funções acima a chamam como dona (SECURITY DEFINER), e o
-- app não tem motivo para pedir a lista inteira de uma vez.

create or replace function public.endodirect_member_provas()
returns jsonb
language sql
stable security definer
set search_path to 'public'
as $function$
  with a as (select public.endodirect_acessos_ativos() as scopes),
       g as (select payload from public.endodirect_global_state where id = 'main')
  -- Banco de questoes por instituicao. A ORDEM DOS RAMOS IMPORTA: 'plano' vem
  -- antes de 'curso:endoteem' de proposito, para que quem tem os dois caia no
  -- ramo mais amplo e ainda receba o TEEM pela concatenacao abaixo.
  --   plano ................. Endodirect + TODAS as de residencia (tudo != TEEM).
  --   curso:endoteem s/plano  so Endodirect (+ TEEM, somado abaixo).
  --   DEGUSTACAO (sem acesso) amostra FIXA de 50 do Endodirect (ordem md5).
  --   TEEM (prova de titulo)  somente com curso:endoteem.
  -- ⚠️ coalesce no inst: `null <> 'TEEM'` e NULL, nao true, e a questao sumiria
  -- em silencio se algum item ficasse sem instituicao.
  select (case
            when (select scopes from a) @> array['plano']
              then coalesce((select jsonb_agg(v) from jsonb_array_elements(coalesce((select payload->'provas' from g), '[]'::jsonb)) v where coalesce(v->>'inst','') <> 'TEEM'), '[]'::jsonb)
            when (select scopes from a) @> array['curso:endoteem']
              then coalesce((select jsonb_agg(v) from jsonb_array_elements(coalesce((select payload->'provas' from g), '[]'::jsonb)) v where v->>'inst' = 'Endodirect'), '[]'::jsonb)
            when coalesce(array_length((select scopes from a), 1), 0) = 0
              then coalesce((select jsonb_agg(v) from (
                     select v from jsonb_array_elements(coalesce((select payload->'provas' from g), '[]'::jsonb)) v
                     where v->>'inst' = 'Endodirect' order by md5(v::text) limit 50
                   ) s), '[]'::jsonb)
            else '[]'::jsonb end)
         ||
         (case when (select scopes from a) @> array['curso:endoteem']
            then coalesce((select jsonb_agg(v) from jsonb_array_elements(coalesce((select payload->'provas' from g), '[]'::jsonb)) v where v->>'inst' = 'TEEM'), '[]'::jsonb)
            else '[]'::jsonb end);
$function$;

-- O que o app chama. Página fora do intervalo (ou negativa) devolve `itens`
-- vazio com os mesmos metadados; `paginas` é no mínimo 1, para a página 0 sempre
-- existir. A lista é montada UMA vez por chamada (CTE referenciada várias vezes
-- é materializada).
create or replace function public.endodirect_member_provas_pagina(p_pagina integer default 0)
returns jsonb
language sql
stable security definer
set search_path to 'public'
as $function$
  with k as (select 500 as por_pagina, coalesce(p_pagina, 0) as pagina),
       t as (select public.endodirect_member_provas() as lista),
       n as (select jsonb_array_length((select lista from t)) as total)
  select jsonb_build_object(
    'versao',     md5((select lista from t)::text),
    'total',      (select total from n),
    'por_pagina', (select por_pagina from k),
    'paginas',    greatest(1, ceil((select total from n)::numeric / (select por_pagina from k))::int),
    'pagina',     (select pagina from k),
    'itens',      coalesce((select jsonb_agg(e order by i)
                              from jsonb_array_elements((select lista from t)) with ordinality x(e, i)
                             where i >  (select pagina from k)      * (select por_pagina from k)
                               and i <= ((select pagina from k) + 1) * (select por_pagina from k)), '[]'::jsonb)
  );
$function$;

create or replace function public.endodirect_member_content_sem_provas()
returns jsonb
language sql
stable security definer
set search_path to 'public'
as $function$
  with a as (select public.endodirect_acessos_ativos() as scopes),
       g as (select payload from public.endodirect_global_state where id = 'main'),
       h as (select coalesce((select payload->'radar_hidden' from g), '[]'::jsonb) as hidden)
  select jsonb_build_object(
    'acervo_totais', public.endodirect_acervo_totais(),
    'member',  coalesce(array_length((select scopes from a), 1), 0) > 0,
    'acessos', to_jsonb((select scopes from a)),
    'cursos',  coalesce((select jsonb_agg(jsonb_build_object(
                  'slug', slug, 'nome', nome, 'descricao', descricao, 'capa', capa,
                  'preco_avulso_cents', preco_avulso_cents, 'tier', tier,
                  'incluso_no_plano', incluso_no_plano, 'ativo', ativo, 'ordem', ordem
                ) order by ordem, nome) from public.endodirect_cursos where ativo), '[]'::jsonb),
    -- Mural: avisos do professor + radar JANELADO nos 200 mais recentes (o resto
    -- vem por endodirect_mural_radar_more, "Carregar artigos mais antigos"), ambos
    -- sem o que o professor apagou (radar_hidden) — a mesma regra do public_content.
    -- 24/09/2026: a janela de 23/07 e o filtro de 03/08 tinham sido perdidos pela
    -- reescrita member_content_capa_do_curso (07/08). Corpo completo versionado em
    -- supabase/provas-em-rpc-propria.sql — antes de reescrever, ler o prosrc.
    'adm_avisos', coalesce((select jsonb_agg(v) from jsonb_array_elements(coalesce((select payload->'adm_avisos' from g), '[]'::jsonb)) v
                     where not ((select hidden from h) ? coalesce(v->>'sourceId', v->>'link', v->>'titulo',''))), '[]'::jsonb)
                  || coalesce((select jsonb_agg(s.v order by s.ord desc) from (
                      select v, (case when v->>'at' ~ '^[0-9]+$' then (v->>'at')::bigint else 0 end) as ord
                      from jsonb_array_elements(coalesce((select payload->'radar_avisos' from g), '[]'::jsonb)) v
                      where not ((select hidden from h) ? coalesce(v->>'sourceId', v->>'link', v->>'titulo',''))
                      order by (case when v->>'at' ~ '^[0-9]+$' then (v->>'at')::bigint else 0 end) desc
                      limit 200) s), '[]'::jsonb),
    -- Entregue ao cliente para ele limpar a PRÓPRIA cópia em cache (igual ao public_content).
    'radar_hidden', (select hidden from h),
    -- Diretrizes e Resumos NÃO vêm mais daqui: o cliente busca em
    -- endodirect_member_resumos (RPC própria, 3 tentativas, tela de erro).
    -- Questões também NÃO (12/10/2026): vêm em páginas de
    -- endodirect_member_provas_pagina, em paralelo, cada uma com 3 tentativas.
    -- Podcasts: liberados para TODOS (professor, 31/08/2026).
    'podcasts',   coalesce((select payload->'podcasts' from g), '[]'::jsonb),
    -- Mapas mentais: com plano, tudo; sem plano, amostra espalhada de 10.
    'mm_shared',  case
                     when (select scopes from a) @> array['plano']
                       then coalesce((select payload->'mm_shared' from g), '[]'::jsonb)
                     when coalesce(array_length((select scopes from a), 1), 0) = 0
                       then public.endodirect_amostra_espalhada(coalesce((select payload->'mm_shared' from g), '[]'::jsonb), 10)
                     else '[]'::jsonb end,
    -- Flashcards publicados pelo professor: igual mm_shared (amostra de 10%).
    'fc_shared',  case
                     when (select scopes from a) @> array['plano']
                       then coalesce((select payload->'fc_shared' from g), '[]'::jsonb)
                     when coalesce(array_length((select scopes from a), 1), 0) = 0
                       then public.endodirect_amostra_espalhada(
                              coalesce((select payload->'fc_shared' from g), '[]'::jsonb),
                              greatest(1, (jsonb_array_length(coalesce((select payload->'fc_shared' from g), '[]'::jsonb)) / 10)))
                     else '[]'::jsonb end,
    'adm_cursos', (
                    -- aulas marcadas como amostra gratis (free=true) vao para qualquer
                    -- usuario (inclusive degustacao); membros recebem tambem as aulas
                    -- do(s) curso(s) que possuem (e aulas sem curso definido).
                    select coalesce(jsonb_agg(v), '[]'::jsonb)
                    from jsonb_array_elements(coalesce((select payload->'adm_cursos' from g), '[]'::jsonb)) v
                    where coalesce(v->>'free','') = 'true'
                       or (coalesce(array_length((select scopes from a), 1), 0) > 0
                           and (coalesce(v->>'curso', '') = ''
                                or (select scopes from a) @> array['curso:' || (v->>'curso')]))
                  )
  );
$function$;

-- O app antigo (cache do service worker) segue chamando esta: a resposta é a
-- mesma de antes, montada pelas duas acima. Não reescrever com um corpo próprio:
-- duas cópias da regra das questões divergiriam no primeiro ajuste.
create or replace function public.endodirect_member_content()
returns jsonb
language sql
stable security definer
set search_path to 'public'
as $function$
  select public.endodirect_member_content_sem_provas()
         || jsonb_build_object('provas', public.endodirect_member_provas());
$function$;

revoke all on function public.endodirect_member_provas() from public, anon, authenticated;
grant execute on function public.endodirect_member_provas() to service_role;
revoke all on function public.endodirect_member_provas_pagina(integer) from public;
grant execute on function public.endodirect_member_provas_pagina(integer) to anon, authenticated, service_role;
revoke all on function public.endodirect_member_content_sem_provas() from public;
grant execute on function public.endodirect_member_content_sem_provas() to anon, authenticated, service_role;
revoke all on function public.endodirect_member_content() from public;
grant execute on function public.endodirect_member_content() to anon, authenticated, service_role;
