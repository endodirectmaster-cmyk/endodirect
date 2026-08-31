-- =============================================================================
-- O QUE A DEGUSTAÇÃO RECEBE   (aplicado em 31/08/2026)
-- =============================================================================
--
-- Pedidos do professor: "na degustação, libera todos os podcasts e das
-- diretrizes 10 de 71" e "flashcards, libera somente 10% do total".
--
-- ⚠️ MUDANÇA SÓ DE SERVIDOR. O `index.html` não foi tocado: a faixa do Dashboard
-- lê o que a conta recebeu e o total da plataforma, então "10 de 71" e
-- "53 de 533" aparecem sozinhos. Também não precisa de deploy nem de bump do
-- `sw.js` — vale no próximo carregamento de quem já está logado.

-- 1. A amostra: estável e espalhada ------------------------------------------
-- ⚠️ ESTÁVEL: ordenada por `md5(v::text)`, como a amostra de 50 questões que já
--    existia. Amostra que muda a cada carregamento faria o aluno perder de vista
--    o que já tinha lido.
-- ⚠️ ESPALHADA: `row_number() over (partition by sub)` põe UMA de cada
--    subespecialidade primeiro. Sem isso, 10 sorteadas ao acaso poderiam sair
--    todas de Diabetes, e o seletor de subespecialidade da degustação apareceria
--    quase vazio — pareceria defeito, não amostra.
--    Medido: as 10 diretrizes cobrem 10 subespecialidades; os 53 flashcards
--    cobrem as 12.
create or replace function public.endodirect_amostra_espalhada(itens jsonb, n int)
returns jsonb language sql immutable as $$
  select coalesce(jsonb_agg(s.v order by s.rn, s.ord), '[]'::jsonb)
  from (
    select v,
           row_number() over (partition by v->>'sub' order by md5(v::text)) as rn,
           md5(v::text) as ord
    from jsonb_array_elements(coalesce(itens, '[]'::jsonb)) v
    order by rn, ord
    limit greatest(n, 0)
  ) s;
$$;
revoke all on function public.endodirect_amostra_espalhada(jsonb, int) from public, anon, authenticated;

-- 2. Onde cada regra foi ligada ----------------------------------------------
--  · `endodirect_member_resumos`  → públicas: com plano, todas; sem, amostra de 10.
--      (é a função que o `member_content` chama e o cliente também: uma política,
--       um lugar)
--  · `endodirect_member_content`  → podcasts: `plano OU auth.uid() is not null`;
--                                   fc_shared: com plano, tudo; sem, 10% do total.
--  · `endodirect_public_content`  → diretrizes e fc_shared alinhados às mesmas
--                                   amostras.
--
-- ⚠️ CORRIGIDO NO MESMO DIA PELO PROFESSOR: "lembrando que visitante/degustação
-- é a mesma coisa. Neles, deixa mapas 10/82. Podcast liberado pra todo mundo."
--
-- 🧨 EU TINHA INVENTADO UM DEGRAU QUE O PRODUTO NÃO TEM. Liberei os podcasts por
-- `auth.uid() is not null`, raciocinando sozinha que "o cadastro precisa valer
-- alguma coisa". Não é assim que a plataforma é pensada: visitante e degustação
-- são o MESMO nível de acesso. A regra que fica é dura e vale além daqui —
-- **inferir o modelo de produto a partir do código é inventar requisito**. Era
-- para eu ter perguntado, ou simplesmente não ter criado o degrau.
--
-- Agora os dois níveis são IDÊNTICOS em tudo, e os podcasts saem sem portão.
-- (Migração `visitante_e_degustacao_sao_o_mesmo_mapas_dez_podcasts_todos`.)
--
-- ⚠️ Os 10% dos flashcards e os 10 mapas SUPERAM a trava por tier de 2026-06-22,
-- que nunca chegou a valer no `member_content`. O professor foi direto, e os
-- limites por contagem são mais restritos que a trava por tier daria
-- (53 contra 353 nos flashcards; 10 contra 41 nos mapas).

-- 3. Medido depois — visitante e degustação são a MESMA linha ------------------
--                        dir.púb.  privadas  questões  flashcards  mapas  podcasts
--   VISITANTE = DEGUSTAÇÃO   10        18*       50         53       10      199
--   GOLD                     71       161      2965        533       82      199
--
--   * o visitante pelo `public_content` recebe 0 privadas; pelo `member_content`
--     (que também é chamável sem sessão) recebe as 18 da amostra freemium. As
--     duas rotas convergem no resto.
--
--   As amostras cobrem a plataforma em largura: 10 diretrizes em 10
--   subespecialidades, 10 mapas em 10, 53 flashcards nas 12.
--
--   (A linha da degustação foi medida com o `sub` de um aluno REAL sem escopo,
--    não por chamada anônima.)
