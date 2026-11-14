-- Videoaulas dos Resumos: o Gold vê todas; Standard e degustação, UMA por subespecialidade
-- (degustação: 07/11/2026; Standard: 14/11/2026).
--
-- Pedido do professor: "Para o pessoal do plano Gold, obviamente, eles terão acesso a
-- todas essas videoaulas. (...) Para o pessoal do modo degustação, a ideia é que eles
-- tenham acesso a uma videoaula de cada subespecialidade. Então, por exemplo, pode
-- escolher uma videoaula de obesidade para deixar liberado para eles. E também assim
-- das outras subespecialidades."
--
-- Como o vídeo fica liberado: o professor marca, no painel (Resumos › capítulo ›
-- 🎬 Videoaulas), "🎁 Liberar na degustação". Isso grava `degustacao: true` no vídeo
-- (`diretrizes[i].videos[j]`), e marcar outro da mesma subespecialidade desmarca o
-- anterior. Esta função é a segunda barreira: mesmo com dois marcados, entrega UM por
-- subespecialidade (o do 1º tema em ordem alfabética, depois o 1º da lista).
--
-- O que muda para quem NÃO tem plano (degustação):
--   1. o capítulo-amostra de cada (subespecialidade, tipo) continua vindo inteiro,
--      mas `videos` traz SÓ o vídeo liberado (se estiver nele), e `videos_total` diz
--      quantos o capítulo tem (para o cliente mostrar "mais N para assinantes");
--   2. o capítulo que tem o vídeo liberado e NÃO é a amostra vem como um item só de
--      vídeo: { sub, tema, titulo, tipo, privado, so_video: true, videos: [o liberado] },
--      sem resumo, pontos-chave, flashcards, mapa, figuras nem referências. O cliente
--      tira esses itens da lista de capítulos (separarSoVideo) e os mostra só como a
--      "videoaula liberada" da subespecialidade.
-- Nenhum outro link de vídeo chega à degustação: o `src` é público no Storage, então
-- o que não é entregue é o que não pode ser assistido.
--
-- SÓ GOLD (14/11/2026). Perguntado se o Standard também via todas, o professor respondeu
-- "só Gold". Agora:
--   - Gold (e Premium, e o escopo antigo `plano` sem `plano:standard`, e o admin): tudo, como antes;
--   - Standard: todos os capítulos (resumo, flashcards, mapas), mas em cada capítulo `videos` traz
--     só o vídeo liberado na degustação (se estiver nele) e `videos_total` diz quantos há, como na
--     amostra da degustação. Os links dos outros vídeos não chegam ao Standard;
--   - sem plano: igual a antes (amostra + item só de vídeo).
-- As públicas (aba Diretrizes) seguem a mesma regra de antes: com plano, todas; sem, amostra de 10.
--
-- O cache de `endodirect_member_resumos_pagina` se renova sozinho: a chave dele leva o
-- md5 do corpo desta função.
create or replace function public.endodirect_member_resumos()
 returns jsonb
 language sql
 stable security definer
 set search_path to 'public'
as $function$
  -- gold: Gold, Premium, o escopo antigo `plano` (sem `plano:standard`) e o admin.
  with a as (select x.s as scopes,
                    (x.s && array['plano:gold','plano:premium']::text[])
                    or (x.s @> array['plano'] and not x.s @> array['plano:standard']) as gold
               from (select public.endodirect_acessos_ativos() as s) x),
       g as (select payload from public.endodirect_global_state where id = 'main'),
       publicas as (
         select coalesce(jsonb_agg(v), '[]'::jsonb) as j
         from jsonb_array_elements(coalesce((select payload->'diretrizes' from g), '[]'::jsonb)) v
         where coalesce(v->>'privado','') <> 'true' and coalesce(v->>'rascunho','') <> 'true'
       ),
       privadas as (
         select v, o
         from jsonb_array_elements(coalesce((select payload->'diretrizes' from g), '[]'::jsonb)) with ordinality x(v, o)
         where coalesce(v->>'privado','') = 'true' and coalesce(v->>'rascunho','') <> 'true'
       ),
       -- Amostra da degustação: um capítulo por (subespecialidade, tipo), a mesma
       -- ordem de antes (o 1º tema em ordem alfabética).
       amostra as (
         select distinct on (v->>'sub', coalesce(v->>'tipo','capitulo')) v, o
         from privadas
         order by v->>'sub', coalesce(v->>'tipo','capitulo'), v->>'tema' nulls last, v->>'titulo' nulls last
       ),
       -- A videoaula liberada na degustação: no máximo UMA por subespecialidade.
       vid_deg as (
         select distinct on (p.v->>'sub') p.o, e.video
         from privadas p
         cross join lateral jsonb_array_elements(
                case when jsonb_typeof(p.v->'videos') = 'array' then p.v->'videos' else '[]'::jsonb end
              ) with ordinality e(video, vo)
         where coalesce(p.v->>'tipo','capitulo') = 'capitulo'
           and jsonb_typeof(e.video) = 'object'
           and e.video->>'degustacao' = 'true'
           and coalesce(e.video->>'src','') <> ''
         order by p.v->>'sub', p.v->>'tema' nulls last, p.o, e.vo
       )
  select jsonb_build_object(
    'diretrizes', (
      -- PÚBLICAS: assinante vê todas; degustação vê uma amostra espalhada de 10.
      (case when (select scopes from a) @> array['plano']
              then (select j from publicas)
              else public.endodirect_amostra_espalhada((select j from publicas), 10)
       end)
      ||
      (case
         -- PRIVADAS no Gold: tudo, vídeos inclusive, na ordem do acervo.
         when (select gold from a)
           then coalesce((select jsonb_agg(v order by o) from privadas), '[]'::jsonb)
         -- PRIVADAS no Standard: todos os capítulos, com os vídeos reduzidos ao liberado.
         when (select scopes from a) @> array['plano']
           then coalesce((select jsonb_agg(
                  case when jsonb_typeof(p.v->'videos') = 'array'
                       then jsonb_set(p.v, '{videos}',
                              coalesce((select jsonb_agg(d.video) from vid_deg d where d.o = p.o), '[]'::jsonb))
                            || jsonb_build_object('videos_total',
                              (select count(*) from jsonb_array_elements(p.v->'videos') e
                                where jsonb_typeof(e) = 'object' and coalesce(e->>'src','') <> ''))
                       else p.v end
                  order by p.o)
                from privadas p), '[]'::jsonb)
         -- Sem plano: a amostra, com os vídeos reduzidos ao liberado...
         else coalesce((select jsonb_agg(
                  case when jsonb_typeof(s.v->'videos') = 'array'
                       then jsonb_set(s.v, '{videos}',
                              coalesce((select jsonb_agg(d.video) from vid_deg d where d.o = s.o), '[]'::jsonb))
                            || jsonb_build_object('videos_total',
                              (select count(*) from jsonb_array_elements(s.v->'videos') e
                                where jsonb_typeof(e) = 'object' and coalesce(e->>'src','') <> ''))
                       else s.v end
                  order by s.v->>'sub', coalesce(s.v->>'tipo','capitulo'), s.v->>'tema' nulls last, s.v->>'titulo' nulls last)
                from amostra s), '[]'::jsonb)
              -- ...e o item só de vídeo do capítulo liberado que não é a amostra.
              || coalesce((select jsonb_agg(jsonb_build_object(
                    'sub', p.v->'sub', 'tema', p.v->'tema', 'titulo', p.v->'titulo',
                    'tipo', 'capitulo', 'privado', true, 'so_video', true,
                    'videos', jsonb_build_array(d.video)) order by p.o)
                  from vid_deg d join privadas p on p.o = d.o
                  where d.o not in (select o from amostra)), '[]'::jsonb)
       end)
    ),
    'diretrizes_temas', coalesce((select payload->'diretrizes_temas' from g), '[]'::jsonb)
  );
$function$;
