-- A Questão do Dia volta ao aluno logado, numa RPC própria e leve (10/10/2026).
--
-- O RELATO QUE CRIOU ESTE ARQUIVO (06/10/2026, assinante Gold, pelo Suporte):
-- "Não consegui responder a questão do dia diretamente no e-mail (...). E quando
-- entra no link para ver a resposta na plataforma não cai nela ao clicar. Além
-- disso no sistema não tem questão do dia disponível."
--
-- O que estava errado no servidor, medido em produção:
--   · `endodirect_member_content` não devolvia mais `ig_stories` desde a reescrita
--     `member_content_capa_do_curso` (07/08): o corpo novo foi escrito a partir de
--     um texto sem a chave, que tinha entrado em 23/06 (`add_ig_stories_to_content_
--     rpcs`). O aluno que entrou depois disso nunca recebeu a lista (o assinante do
--     relato criou a conta em 02/10); quem tinha a cópia local ficou parado nela.
--     As respostas à Questão do Dia caíram de 86 por semana (22 alunos, fim de
--     junho) para zero a três por semana desde meados de agosto.
--   · `endodirect_public_content` entregava a lista INTEIRA, inclusive a fila ainda
--     não publicada, com gabarito e comentário: qualquer visitante lia as questões
--     dos próximos dias com a resposta.
--
-- A correção:
--   1) `endodirect_qotd_publicadas()` — só as publicadas (status 'posted'), na
--      ordem da fila (o app toma a última como "a de hoje"). ~280 KB hoje. O
--      cliente chama em paralelo com o member_content, com 3 tentativas
--      (`carregarQotd` no index.html), como já faz com os acessos e os Resumos.
--      ⚠️ A lista NÃO voltou ao member_content de propósito: ele tem ~5,2 MB
--      (medido hoje com a conta do relato) e o cofre registra desde julho que
--      respostas perto de ~5,3 MB deixam de chegar ao celular — foi o que levou a
--      separar os Resumos (`endodirect_member_resumos`). Se a lista passar de
--      ~1 MB (cresce ~3 KB por dia), janelar aqui, não no cliente.
--   2) `endodirect_public_content` passa a entregar só as publicadas. Corpo
--      COMPLETO abaixo, lido do `prosrc` em produção hoje (regra do cofre: patch
--      parcial em função sem o corpo inteiro versionado perde o que veio antes).
--
-- O professor continua lendo a fila inteira pelo próprio estado global (o painel
-- dele lê `endodirect_global_state` direto), e o e-mail diário também.

create or replace function public.endodirect_qotd_publicadas()
returns jsonb
language sql
stable security definer
set search_path to 'public'
as $function$
  select coalesce(jsonb_agg(s.v order by s.o), '[]'::jsonb)
  from public.endodirect_global_state g,
       jsonb_array_elements(coalesce(g.payload->'ig_stories', '[]'::jsonb)) with ordinality s(v, o)
  where g.id = 'main' and s.v->>'status' = 'posted';
$function$;

revoke all on function public.endodirect_qotd_publicadas() from public, anon;
grant execute on function public.endodirect_qotd_publicadas() to authenticated, service_role;

create or replace function public.endodirect_public_content()
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $function$
declare p jsonb; hidden jsonb;
begin
  select payload into p from public.endodirect_global_state where id='main';
  hidden := coalesce(p->'radar_hidden','[]'::jsonb);
  return jsonb_build_object(
    'acervo_totais', public.endodirect_acervo_totais(),
    -- Amostra livre: as mesmas 50 questoes proprias que o cadastrado sem plano ve.
    'provas', coalesce((select jsonb_agg(v) from (
                 select v from jsonb_array_elements(coalesce(p->'provas','[]'::jsonb)) v
                 where v->>'inst'='Endodirect' order by md5(v::text) limit 50) s), '[]'::jsonb),
    -- radar_hidden = itens que o professor apagou do mural. Filtrar aqui e o que
    -- faz a exclusao valer para o ALUNO.
    'adm_avisos', coalesce((select jsonb_agg(v) from jsonb_array_elements(coalesce(p->'adm_avisos','[]'::jsonb)) v
                     where not (hidden ? coalesce(v->>'sourceId', v->>'link', v->>'titulo',''))), '[]'::jsonb)
                  || coalesce((select jsonb_agg(s.v order by s.ord desc) from (
                      select v, (case when v->>'at' ~ '^[0-9]+$' then (v->>'at')::bigint else 0 end) as ord
                      from jsonb_array_elements(coalesce(p->'radar_avisos','[]'::jsonb)) v
                      where not (hidden ? coalesce(v->>'sourceId', v->>'link', v->>'titulo',''))
                      order by (case when v->>'at' ~ '^[0-9]+$' then (v->>'at')::bigint else 0 end) desc
                      limit 200) s), '[]'::jsonb),
    -- Entregue ao cliente para ele limpar a PROPRIA copia em cache.
    'radar_hidden', hidden,
    -- Questao do Dia: so as PUBLICADAS (10/10/2026). Ate entao ia a fila inteira,
    -- com gabarito das que ainda nao tinham sido postadas.
    'ig_stories', coalesce((select jsonb_agg(s.v order by s.o)
                    from jsonb_array_elements(coalesce(p->'ig_stories','[]'::jsonb)) with ordinality s(v, o)
                    where s.v->>'status' = 'posted'), '[]'::jsonb),
    'diretrizes', public.endodirect_amostra_espalhada(
                       coalesce((select jsonb_agg(v) from jsonb_array_elements(coalesce(p->'diretrizes','[]'::jsonb)) v
                                 where coalesce(v->>'privado','') <> 'true' and coalesce(v->>'rascunho','') <> 'true'), '[]'::jsonb), 10),
    'diretrizes_temas', coalesce(p->'diretrizes_temas','[]'::jsonb),
    -- Podcast e beneficio de plano: sem escopo, nenhum.
    'podcasts', coalesce(p->'podcasts', '[]'::jsonb),
    -- Aula de curso: so as marcadas como gratuitas.
    'adm_cursos', coalesce((select jsonb_agg(v) from jsonb_array_elements(coalesce(p->'adm_cursos','[]'::jsonb)) v where coalesce(v->>'free','')='true'), '[]'::jsonb),
    -- Mapa mental e flashcard: so o que nao e tier:member.
    'mm_shared', public.endodirect_amostra_espalhada(coalesce(p->'mm_shared','[]'::jsonb), 10),
    'fc_shared', public.endodirect_amostra_espalhada(coalesce(p->'fc_shared','[]'::jsonb),
                      greatest(1, (jsonb_array_length(coalesce(p->'fc_shared','[]'::jsonb)) / 10))),
    'cursos', coalesce((select jsonb_agg(jsonb_build_object('slug',slug,'nome',nome,'descricao',descricao,
                 'preco_avulso_cents',preco_avulso_cents,'tier',tier,'incluso_no_plano',incluso_no_plano,
                 'ativo',ativo,'ordem',ordem) order by ordem, nome) from public.endodirect_cursos where ativo), '[]'::jsonb)
  );
end $function$;

-- Conferência sugerida depois de aplicar:
--   select jsonb_array_length(public.endodirect_qotd_publicadas());            -- = publicadas
--   select count(*) from jsonb_array_elements(public.endodirect_public_content()->'ig_stories') v
--    where v->>'status' <> 'posted';                                            -- = 0
