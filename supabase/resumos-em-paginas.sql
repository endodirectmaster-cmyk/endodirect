-- AS DIRETRIZES E OS RESUMOS VÊM EM PÁGINAS (25/10/2026), PRONTAS NUM CACHE.
--
-- `endodirect_member_resumos()` entrega numa resposta só todas as Diretrizes
-- públicas e todos os capítulos/artigos dos Resumos que o aluno pode ver. Em
-- 25/10 eram ~3,2 MB para o assinante (0,77 MB de Diretrizes + 2,42 MB de
-- Resumos). A auditoria das Diretrizes reescreve as 72 a partir do documento
-- original (~54 KB cada, contra ~10 KB antes): só elas passariam a ~3,9 MB, e a
-- resposta inteira a ~6,3 MB — acima do limite empírico de ~5,3 MB em que uma
-- resposta deixa de chegar ao celular (foi o que separou os Resumos do
-- member_content em 21/07 e as questões em 12/10).
--
-- A lista continua sendo a de `endodirect_member_resumos()` — a regra de quem vê
-- o quê (assinante, degustação, rascunho) mora num lugar só; esta função só a
-- fatia. Mesmo desenho de `endodirect_member_provas_pagina`: a página 0 diz o
-- total, quantas páginas são e a `versao` (md5 da lista inteira); o cliente
-- pede as demais em paralelo, nunca junta páginas de versões diferentes e não
-- aplica nada parcial. `diretrizes_temas` vai só na página 0.
--
-- ⚠️ POR QUE O CACHE (2ª versão, 25/10 à noite). A 1ª versão recalculava a lista
-- inteira a cada página: o acervo é um jsonb de 17 MB, e cada página custava
-- ~0,2 s de banco sozinha (1,5–2 s com 11 em paralelo). Às 12h06 UTC as 11
-- páginas de um assinante estouraram o statement_timeout de 8 s do papel
-- `authenticated` (HTTP 500, código 57014). Agora a lista é montada UMA vez por
-- chave e guardada já fatiada; as outras páginas, e as cargas seguintes, só leem
-- a linha pronta.
--
-- A linha do cache é (escopos, página), e a `chave` diz de que versão ela é:
--   * `escopos`: md5 de `endodirect_acessos_ativos()` ordenado — a regra só olha
--     os escopos, então duas pessoas com os mesmos escopos veem a mesma lista;
--   * `chave`: a versão do acervo (`updated_at` de `endodirect_global_state`, que o
--     gatilho `endodirect_global_state_touch_updated_at` renova a cada UPDATE; em
--     microssegundos desde 1970, sem depender do fuso da sessão) e o corpo de
--     `endodirect_member_resumos` e de `endodirect_amostra_espalhada` (mudou a
--     regra, mudou a chave).
-- Chave nova sobrescreve as linhas dos mesmos escopos (`on conflict do update`): a
-- tabela guarda uma versão por conjunto de escopos e não cresce. Não há comando de
-- apagar linhas — o conector do Supabase segura para confirmação qualquer texto
-- com esse comando, até dentro de função (lição de 19/10, repetida em 25/10).
-- Página que sobrou de uma versão mais longa tem chave velha e nunca é servida.
--
-- Na falta, a resposta sai da lista em memória, não da releitura do cache, e a
-- gravação do cache fica num bloco à parte: se ela falhar, a página sai mesmo
-- assim (com um aviso no log do Postgres).
--
-- A tabela tem RLS sem política e nenhum privilégio para anon/authenticated: só
-- esta função (SECURITY DEFINER, dona da tabela) lê e grava nela.
--
-- 20 itens por página: com as Diretrizes completas, ~1,1 MB no pior caso (as
-- públicas vêm primeiro) e ~0,4 MB nas páginas só de Resumos.
--
-- `endodirect_member_resumos()` fica como está para o app antigo em cache.

create table if not exists public.endodirect_resumos_paginas_cache (
  escopos   text        not null,
  pagina    integer     not null,
  chave     text        not null,
  versao    text        not null,
  total     integer     not null,
  paginas   integer     not null,
  itens     jsonb       not null,
  temas     jsonb,
  criado_em timestamptz not null default now(),
  primary key (escopos, pagina)
);
alter table public.endodirect_resumos_paginas_cache enable row level security;
revoke all on table public.endodirect_resumos_paginas_cache from public, anon, authenticated;

create or replace function public.endodirect_member_resumos_pagina(p_pagina integer default 0)
returns jsonb
language plpgsql
volatile security definer
set search_path to 'public'
as $function$
declare
  v_por     constant integer := 20;
  v_pagina  integer := least(greatest(coalesce(p_pagina, 0), 0), 10000);
  v_escopos text;
  v_chave   text;
  v_r       jsonb;
  v_lista   jsonb;
  v_total   integer;
  v_paginas integer;
  v_versao  text;
  v_itens   jsonb;
  v_temas   jsonb;
  v_pronta  boolean;
begin
  v_escopos := md5(coalesce(array_to_string(array(
                 select x from unnest(public.endodirect_acessos_ativos()) x order by x), ','), ''));
  v_chave := coalesce((select floor(extract(epoch from updated_at) * 1000000)::bigint::text
                         from public.endodirect_global_state where id = 'main'), 'sem-acervo')
    || ':' || coalesce((select md5(string_agg(prosrc, '|' order by proname)) from pg_proc
                         where pronamespace = 'public'::regnamespace
                           and proname in ('endodirect_member_resumos', 'endodirect_amostra_espalhada')), '');

  -- Acerto: a página pronta desta chave.
  select c.versao, c.total, c.paginas, c.itens, c.temas
    into v_versao, v_total, v_paginas, v_itens, v_temas
    from public.endodirect_resumos_paginas_cache c
   where c.escopos = v_escopos and c.pagina = v_pagina and c.chave = v_chave;
  v_pronta := found;

  if not v_pronta and v_pagina > 0 then
    -- Página além do fim: a página 0 desta chave basta.
    select c.versao, c.total, c.paginas
      into v_versao, v_total, v_paginas
      from public.endodirect_resumos_paginas_cache c
     where c.escopos = v_escopos and c.pagina = 0 and c.chave = v_chave;
    if found and v_pagina >= v_paginas then
      v_itens  := '[]'::jsonb;
      v_temas  := null;
      v_pronta := true;
    end if;
  end if;

  if not v_pronta then
    -- Falta: monta a lista uma vez, responde da memória e guarda todas as páginas.
    v_r       := public.endodirect_member_resumos();
    v_lista   := coalesce(v_r->'diretrizes', '[]'::jsonb);
    v_total   := jsonb_array_length(v_lista);
    v_paginas := greatest(1, ceil(v_total::numeric / v_por)::integer);
    v_versao  := md5(v_lista::text);
    v_itens   := coalesce((select jsonb_agg(e order by i)
                             from jsonb_array_elements(v_lista) with ordinality x(e, i)
                            where i > v_pagina * v_por and i <= (v_pagina + 1) * v_por), '[]'::jsonb);
    v_temas   := case when v_pagina = 0 then coalesce(v_r->'diretrizes_temas', '[]'::jsonb) end;
    begin
      insert into public.endodirect_resumos_paginas_cache as c
             (escopos, pagina, chave, versao, total, paginas, itens, temas)
      select v_escopos, g, v_chave, v_versao, v_total, v_paginas,
             coalesce((select jsonb_agg(e order by i)
                         from jsonb_array_elements(v_lista) with ordinality x(e, i)
                        where i > g * v_por and i <= (g + 1) * v_por), '[]'::jsonb),
             case when g = 0 then coalesce(v_r->'diretrizes_temas', '[]'::jsonb) end
        from generate_series(0, v_paginas - 1) g
      on conflict (escopos, pagina) do update
         set chave = excluded.chave, versao = excluded.versao, total = excluded.total,
             paginas = excluded.paginas, itens = excluded.itens, temas = excluded.temas,
             criado_em = now()
       where c.chave is distinct from excluded.chave;
    exception when others then
      raise warning 'endodirect_member_resumos_pagina: cache não gravado (%)', sqlerrm;
    end;
  end if;

  return jsonb_build_object(
    'versao',           v_versao,
    'total',            v_total,
    'por_pagina',       v_por,
    'paginas',          v_paginas,
    'pagina',           v_pagina,
    'itens',            v_itens,
    'diretrizes_temas', v_temas
  );
end;
$function$;

revoke all on function public.endodirect_member_resumos_pagina(integer) from public;
grant execute on function public.endodirect_member_resumos_pagina(integer) to anon, authenticated, service_role;

notify pgrst, 'reload schema';
