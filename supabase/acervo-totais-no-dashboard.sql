-- =============================================================================
-- TAMANHO DO ACERVO PARA A FAIXA DO DASHBOARD DO ALUNO  (aplicado em 31/08/2026)
-- =============================================================================
--
-- POR QUE ISTO EXISTE. O card "Questões no banco" mostrava 50 no lugar de 2.965.
-- O professor viu e disse: "questões no banco está errado, são quase 3 mil".
--
-- NÃO ERA ERRO DE CONTAGEM. `provasDB`, no navegador, é o que AQUELE aluno tem
-- direito de ver:
--   · assinante (plano) ........ tudo, menos TEEM;
--   · curso:endoteem sem plano . só Endodirect (+ TEEM);
--   · degustação / conta demo .. amostra FIXA de 50 (ordem md5).
-- O total da PLATAFORMA nunca chegava ao cliente, e não havia como ele deduzi-lo.
--
-- ⚠️ O QUE ESTA FUNÇÃO DEVOLVE SÃO SÓ CONTAGENS — nenhum conteúdo. É por isso
-- que ela pode ser servida a quem não é assinante sem vazar nada: o tamanho do
-- acervo é fato público da plataforma; o conteúdo continua atrás do mesmo portão.
--
-- ⚠️ OS FILTROS SÃO OS MESMOS DAS ABAS (`dirIsVisible`, no index.html):
-- rascunho fora; `privado` separa Resumos de Diretrizes; `tipo` separa capítulo
-- de artigo. Contar por outro critério faria a faixa anunciar um número que a
-- aba de destino não mostra — e quem clicasse veria menos do que o prometido.
-- Conferido na aplicação: SQL e JS deram os mesmos 2.965 / 71 / 118 / 43 / 199.

create or replace function public.endodirect_acervo_totais()
returns jsonb
language sql
stable
security definer
set search_path to 'public'
as $$
  with g as (select payload as p from public.endodirect_global_state where id = 'main'),
       d as (select v from g, jsonb_array_elements(coalesce(g.p->'diretrizes','[]'::jsonb)) v),
       pub as (select v from d where coalesce(v->>'rascunho','') not in ('true','t','1'))
  select jsonb_build_object(
    'provas',     coalesce((select jsonb_array_length(coalesce(p->'provas','[]'::jsonb)) from g), 0),
    'diretrizes', (select count(*) from pub where coalesce(v->>'privado','') <> 'true'
                                              and coalesce(v->>'tipo','capitulo') <> 'artigo'),
    'resumos',    (select count(*) from pub where v->>'privado' = 'true'
                                              and coalesce(v->>'tipo','capitulo') = 'capitulo'),
    'artigos',    (select count(*) from pub where v->>'privado' = 'true'
                                              and coalesce(v->>'tipo','capitulo') = 'artigo'),
    'podcasts',   coalesce((select jsonb_array_length(coalesce(p->'podcasts','[]'::jsonb)) from g), 0)
  );
$$;

-- Chamada de dentro das duas RPCs de conteúdo (ambas SECURITY DEFINER); não
-- precisa — nem deve — existir como rota própria.
revoke all on function public.endodirect_acervo_totais() from public, anon, authenticated;

-- -----------------------------------------------------------------------------
-- Liga a função às DUAS rotas de conteúdo, de forma ADITIVA (uma chave a mais no
-- objeto devolvido; cliente antigo a ignora).
--
-- ⚠️ AS DUAS PRECISAM DELA porque o aluno chega por caminhos diferentes: membro
-- real passa por `member_content`; visitante, degustação e a conta demo
-- (alunopro, sem id remoto) passam por `public_content` — e era justamente a
-- demo que mostrava 50.
--
-- O bloco reescreve as funções a partir da própria definição atual, para não
-- congelar aqui uma cópia que envelhece. Se a âncora não existir, ABORTA em vez
-- de corromper. É idempotente: rodar de novo não faz nada.
-- -----------------------------------------------------------------------------
do $mig$
declare
  def_member text;
  def_public text;
begin
  select pg_get_functiondef(p.oid) into def_member
  from pg_proc p join pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'public' and p.proname = 'endodirect_member_content';

  select pg_get_functiondef(p.oid) into def_public
  from pg_proc p join pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'public' and p.proname = 'endodirect_public_content';

  if def_member is null or def_public is null then
    raise exception 'RPC de conteúdo não encontrada — migração abortada';
  end if;

  if position('acervo_totais' in def_member) = 0 then
    if position('''member'',  coalesce(' in def_member) = 0 then
      raise exception 'âncora não encontrada em member_content — a função mudou; abortando em vez de corromper';
    end if;
    def_member := replace(def_member,
      '''member'',  coalesce(',
      '''acervo_totais'', public.endodirect_acervo_totais(),' || chr(10) || '    ''member'',  coalesce(');
    execute def_member;
  end if;

  if position('acervo_totais' in def_public) = 0 then
    if position('  return jsonb_build_object(' in def_public) = 0 then
      raise exception 'âncora não encontrada em public_content — a função mudou; abortando em vez de corromper';
    end if;
    def_public := replace(def_public,
      '  return jsonb_build_object(',
      '  return jsonb_build_object(' || chr(10) || '    ''acervo_totais'', public.endodirect_acervo_totais(),');
    execute def_public;
  end if;
end
$mig$;

-- Conferência rápida:
--   select public.endodirect_public_content()->'acervo_totais';
--   -> {"provas":2965,"artigos":43,"resumos":118,"podcasts":199,"diretrizes":71}
