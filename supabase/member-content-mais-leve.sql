-- O member_content deixa de mandar o que o aluno não usa: 12,3 MB viram ~5,3 MB.
--
-- 24/09/2026. Uma assinante Gold escreveu no feedback: "as questões não aparecem
-- para mim". No servidor, a RPC devolve as 2.085 questões dela sem erro — mas
-- devolve tudo numa resposta só de 12,3 MB, medida hoje com o user_id dela:
--
--     adm_avisos   4,77 MB   1.622 itens do radar, sem corte
--     provas       3,79 MB   2.085 questões
--     diretrizes   2,90 MB   232 itens
--     adm_cursos   0,34 MB   38 aulas
--     mm_shared    0,19 MB · fc_shared 0,15 MB · podcasts 0,14 MB
--
-- No celular, uma resposta desse tamanho cai no meio com frequência (o cofre
-- registra desde 05/08 que ~1,8 MB já caía). Quando cai, o cliente fica sem as
-- questões e a tela do Banco diz "seu banco tem 0" sem explicar nada — isso é
-- corrigido no index.html (tentativas + aviso + "Tentar de novo"). Aqui, a
-- parte do servidor: a resposta perde 7 MB sem tirar nada que o aluno veja.
--
-- 1) `diretrizes` e `diretrizes_temas` SAEM. O cliente sempre chamou
--    `endodirect_member_resumos` logo depois do member_content e sobrescrevia
--    a lista (comentário em hydrateRemoteState: "ordem determinística"). A cópia
--    do member_content era descartada em todo carregamento — 2,9 MB por abertura
--    do app, para nada. `member_resumos` tem 3 tentativas e tela própria de erro.
--
-- 2) O radar VOLTA a ser janelado nos 200 mais recentes, como em
--    `endodirect_public_content` e como o cliente espera: o `lib/radar.js`
--    documenta que "a entrega ao aluno é janelada nos 200 mais recentes pelas
--    RPCs; o resto vem sob demanda via endodirect_mural_radar_more" e o Mural
--    tem o botão "Carregar artigos mais antigos" (MURAL_RADAR_WINDOW=200).
--    🧨 A JANELA EXISTIU E FOI PERDIDA. O cofre registra em 23/07/2026 a migração
--    `member_content_window_radar_200` — com a medida, já naquele dia, de que
--    "member_content falha perto de 5,3 MB". Um `create or replace` posterior
--    reescreveu a função a partir de um corpo sem a janela, e ninguém percebeu:
--    o assinante voltou a receber o radar inteiro (1.622 itens hoje) e o botão
--    de "carregar mais" nunca aparecia para ele, porque a condição é "carregou
--    ≥200 e o servidor ainda tem mais". Código escrito não é código alcançável;
--    e patch parcial numa função sem o corpo inteiro versionado perde o que
--    veio antes — por isso este arquivo traz o corpo COMPLETO.
--    Medido hoje: 200 itens = 0,59 MB e cobrem 9 dias; o restante continua
--    disponível, lote a lote, pelo mesmo botão que o visitante já usa.
--
-- 3) `radar_hidden` passa a ser filtrado AQUI também, como no public_content.
--    O cliente filtra pela cópia local de radar_hidden, mas o member_content não
--    a envia: em aparelho novo a lista local é vazia e um item que o professor
--    apagou voltava a aparecer. Hoje não há nenhum item oculto (0 de 1.622), então
--    a mudança não altera o que se vê; fecha a porta para quando houver.
--
-- O que NÃO muda: provas, podcasts, mm_shared, fc_shared, adm_cursos, cursos,
-- acessos, member e acervo_totais seguem iguais, com as mesmas regras de escopo.
--
-- 🧨 A DEFINIÇÃO FOI LIDA DO `prosrc` EM PRODUÇÃO, não de um .sql do repositório:
-- os seis arquivos que definem esta função no repositório estão todos datados
-- (o mais novo é de 31/08 e nenhum tem `acervo_totais`, que entrou depois).

create or replace function public.endodirect_member_content()
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
    -- Banco de questoes por instituicao. A ORDEM DOS RAMOS IMPORTA: 'plano' vem
    -- antes de 'curso:endoteem' de proposito, para que quem tem os dois caia no
    -- ramo mais amplo e ainda receba o TEEM pela concatenacao abaixo.
    --   plano ................. Endodirect + TODAS as de residencia (tudo != TEEM).
    --   curso:endoteem s/plano  so Endodirect (+ TEEM, somado abaixo).
    --   DEGUSTACAO (sem acesso) amostra FIXA de 50 do Endodirect (ordem md5).
    --   TEEM (prova de titulo)  somente com curso:endoteem.
    -- ⚠️ coalesce no inst: `null <> 'TEEM'` e NULL, nao true, e a questao sumiria
    -- em silencio se algum item ficasse sem instituicao.
    'provas',     (case
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
                     else '[]'::jsonb end),
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

-- Conferência sugerida depois de aplicar (com o user_id de uma conta Gold):
--   select set_config('request.jwt.claims', '{"sub":"<uuid>","role":"authenticated"}', true);
--   select k, pg_column_size((p->k)::text) from public.endodirect_member_content() p, jsonb_object_keys(p) k order by 2 desc;
