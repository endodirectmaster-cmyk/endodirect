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
-- ⚠️ PODCASTS SÃO GATED POR **TER CONTA**, não por "sem escopo". `member_content`
-- é chamável por `anon`, e "degustação" é o aluno CADASTRADO sem pacote — não um
-- visitante qualquer. Sem essa distinção, os 199 podcasts sairiam para quem
-- tivesse a chave pública, e o cadastro deixaria de valer alguma coisa. É hoje a
-- ÚNICA diferença entre visitante e degustação, e é deliberada.
--
-- 🧨 E O VISITANTE NÃO PODE RECEBER MAIS QUE O CADASTRADO. Sem alinhar o
-- `public_content`, ele ficaria com 71 diretrizes e 353 flashcards contra 10 e 53
-- de quem se cadastrou — a mesma inversão que eu tinha acabado de corrigir nos
-- mapas mentais, repetida no mesmo dia. (Definições completas nas migrações
-- `degustacao_dez_diretrizes_publicas`,
-- `degustacao_todos_os_podcasts_e_dez_por_cento_dos_flashcards` e
-- `public_content_alinhado_a_degustacao`.)
--
-- ⚠️ Os 10% dos flashcards SUPERAM a trava por tier decidida em 2026-06-22, que
-- nunca chegou a valer no `member_content` — a degustação recebia os 533,
-- inclusive os 180 marcados como exclusivos de assinante. O professor foi
-- direto: "libera somente 10% do total". 53 de 533 é mais restrito que os 353
-- que a trava por tier daria.

-- 3. Medido depois, nos três perfis -------------------------------------------
--                   dir.púb.  privadas  questões  flashcards  mapas  podcasts
--   VISITANTE          10         0        50         53        41       0
--   DEGUSTAÇÃO         10        18        50         53        41     199
--   GOLD               71       161      2965        533        82     199
--
-- (A linha da degustação foi medida com o `sub` de um aluno REAL sem escopo, não
--  com uma chamada anônima — anônimo e degustação diferem justamente nos
--  podcasts, e medir o errado teria escondido isso.)
