-- Os temas dos Resumos passam a chegar a todo aluno, por subespecialidade.
--
-- 25/09/2026. Pedido do professor: "Nas ferramentas de OSCE e Prescrição
-- Comentada, colocar filtro para o aluno escolher também o tema de cada
-- subespecialidade. Os temas podem ser os mesmos já presentes nos resumos."
-- Sugestão de um assinante Gold (Luis, 16/09): "seria melhor poder escolher o
-- tema a ser abordado e não somente a grande área."
--
-- O cliente monta a lista de temas a partir do que TEM: para o assinante, todos
-- os capítulos privados (member_resumos); para a degustação, só 1 capítulo por
-- subespecialidade e tipo — a lista ficaria com um tema por área. Os NOMES dos
-- temas não são conteúdo de assinante (a página pública de Resumos já os lista),
-- então passam a vir em `endodirect_acervo_totais()`, que as duas rotas de
-- conteúdo (member_content e public_content) já embutem. Só nomes, ~8 KB.
--
-- `temas` = { "Diabetes": ["Diagnóstico e Classificação do Diabetes", …], … }
--   • capítulos privados publicados (privado=true, não rascunho, tipo capitulo),
--     na ORDEM do array (a ordem em que o professor os mantém nos Resumos);
--   • depois os temas criados pelo professor ainda sem capítulo
--     (`diretrizes_temas`, tipo capitulo), como no painel dele;
--   • sem repetição dentro da subespecialidade.
--
-- 🧨 CORPO COMPLETO, lido do `prosrc` em produção antes de reescrever (regra de
-- 24/09: patch parcial já perdeu duas migrações do member_content). O que já
-- existia — provas, diretrizes, resumos, artigos, mapas, podcasts — segue igual.

create or replace function public.endodirect_acervo_totais()
returns jsonb
language sql
stable security definer
set search_path to 'public'
as $function$
  with g as (select payload as p from public.endodirect_global_state where id = 'main'),
       d as (select v from g, jsonb_array_elements(coalesce(g.p->'diretrizes','[]'::jsonb)) v),
       pub as (select v from d where coalesce(v->>'rascunho','') not in ('true','t','1')),
       -- Temas por subespecialidade: capítulos privados publicados, na ordem do
       -- array, mais os temas extras do professor; um nome só aparece uma vez.
       tema_src as (
         select coalesce(nullif(trim(v->>'sub'),''),'Geral') as sub,
                coalesce(nullif(trim(v->>'tema'),''), nullif(trim(v->>'titulo'),''), 'Geral') as tema,
                o as ord
         from g, jsonb_array_elements(coalesce(g.p->'diretrizes','[]'::jsonb)) with ordinality as t(v,o)
         where v->>'privado' = 'true'
           and coalesce(v->>'rascunho','') not in ('true','t','1')
           and coalesce(v->>'tipo','capitulo') = 'capitulo'
         union all
         select coalesce(nullif(trim(x->>'sub'),''),'Geral'),
                nullif(trim(x->>'tema'),''),
                1000000 + o
         from g, jsonb_array_elements(coalesce(g.p->'diretrizes_temas','[]'::jsonb)) with ordinality as e(x,o)
         where coalesce(x->>'tipo','capitulo') = 'capitulo'
           and nullif(trim(x->>'tema'),'') is not null
       ),
       tema_uniq as (
         select distinct on (sub, lower(tema)) sub, tema, ord from tema_src order by sub, lower(tema), ord
       ),
       temas as (
         select sub, jsonb_agg(tema order by ord) as lista from tema_uniq group by sub
       )
  select jsonb_build_object(
    'provas',     coalesce((select jsonb_array_length(coalesce(p->'provas','[]'::jsonb)) from g), 0),
    'diretrizes', (select count(*) from pub where coalesce(v->>'privado','') <> 'true'
                                              and coalesce(v->>'tipo','capitulo') <> 'artigo'),
    'resumos',    (select count(*) from pub where v->>'privado' = 'true'
                                              and coalesce(v->>'tipo','capitulo') = 'capitulo'),
    'artigos',    (select count(*) from pub where v->>'privado' = 'true'
                                              and coalesce(v->>'tipo','capitulo') = 'artigo'),
    'mapas',      coalesce((select jsonb_array_length(coalesce(p->'mm_shared','[]'::jsonb)) from g), 0),
    'podcasts',   coalesce((select jsonb_array_length(coalesce(p->'podcasts','[]'::jsonb)) from g), 0),
    'temas',      coalesce((select jsonb_object_agg(sub, lista) from temas), '{}'::jsonb)
  );
$function$;

-- Conferência sugerida depois de aplicar:
--   select k, jsonb_array_length(v) from public.endodirect_acervo_totais()->'temas' t, jsonb_each(t) as e(k,v) order by 1;
--   (Diabetes deve listar os temas na ordem em que aparecem nos Resumos.)
