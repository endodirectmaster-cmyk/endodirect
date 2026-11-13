-- AVISOS AOS ALUNOS NO DASHBOARD (13/11/2026).
--
-- Pedido do professor: "Acho que vale a pena também aqui no dashboard o mural de avisos. Por
-- exemplo, quando for introduzida uma nova videoaula, uma nova aula do Educação Médica
-- Continuada, algum aviso importante de edital, de alguma prova, etc."
--
-- Os avisos escritos pelo professor (edital, prova, aviso geral) moram numa coleção nova do
-- estado global, `avisos_alunos`, gravada pelo painel do professor como as demais. O aluno lê o
-- conteúdo global por `endodirect_member_content_sem_provas()`, que monta a resposta CAMPO A
-- CAMPO: sem esta linha nova, o aviso nunca chegaria a ele. Vai para TODOS (assinantes e
-- degustação), como os podcasts. As videoaulas e aulas da EMC novas NÃO passam por aqui: o
-- painel do aluno as tira das datas (`at`) do que ele já recebe.
--
-- Única mudança em relação à versão anterior (corpo lido do prosrc em 13/11/2026): a chave
-- 'avisos_alunos'. O resto é idêntico, letra por letra.

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
    -- Avisos do professor para o Dashboard (edital, prova, aviso geral): para TODOS
    -- (13/11/2026). Ver supabase/avisos-aos-alunos.sql.
    'avisos_alunos', coalesce((select payload->'avisos_alunos' from g), '[]'::jsonb),
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
