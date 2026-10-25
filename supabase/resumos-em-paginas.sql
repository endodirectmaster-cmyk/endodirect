-- AS DIRETRIZES E OS RESUMOS VÊM EM PÁGINAS (25/10/2026).
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
-- 20 itens por página: com as Diretrizes completas, ~1,1 MB no pior caso (as
-- públicas vêm primeiro) e ~0,4 MB nas páginas só de Resumos.
--
-- `endodirect_member_resumos()` fica como está para o app antigo em cache.

create or replace function public.endodirect_member_resumos_pagina(p_pagina integer default 0)
returns jsonb
language sql
stable security definer
set search_path to 'public'
as $function$
  with k as (select 20 as por_pagina, coalesce(p_pagina, 0) as pagina),
       t as (select public.endodirect_member_resumos() as r),
       l as (select coalesce((select r->'diretrizes' from t), '[]'::jsonb) as lista),
       n as (select jsonb_array_length((select lista from l)) as total)
  select jsonb_build_object(
    'versao',     md5((select lista from l)::text),
    'total',      (select total from n),
    'por_pagina', (select por_pagina from k),
    'paginas',    greatest(1, ceil((select total from n)::numeric / (select por_pagina from k))::int),
    'pagina',     (select pagina from k),
    'itens',      coalesce((select jsonb_agg(e order by i)
                              from jsonb_array_elements((select lista from l)) with ordinality x(e, i)
                             where i >  (select pagina from k)      * (select por_pagina from k)
                               and i <= ((select pagina from k) + 1) * (select por_pagina from k)), '[]'::jsonb),
    'diretrizes_temas', case when (select pagina from k) = 0
                             then coalesce((select r->'diretrizes_temas' from t), '[]'::jsonb) end
  );
$function$;

revoke all on function public.endodirect_member_resumos_pagina(integer) from public;
grant execute on function public.endodirect_member_resumos_pagina(integer) to anon, authenticated, service_role;
