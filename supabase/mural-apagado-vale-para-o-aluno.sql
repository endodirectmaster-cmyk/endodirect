-- ⚠️🐛 "APAGUEI A NOTÍCIA DO MURAL E O ALUNO CONTINUA VENDO" — 2026-08-03
--
-- Registro das migrações `apagar_do_mural_passa_a_valer_para_o_aluno_trigger` e
-- `conteudo_do_aluno_respeita_radar_hidden`, aplicadas na base. Como o resto das
-- RPCs de conteúdo, o corpo AUTORITATIVO vive no banco (mantido por migration);
-- este arquivo guarda o diagnóstico e as duas travas, para a correção não se
-- perder no histórico do painel do Supabase.
--
-- O DEFEITO, em três passos:
--   1. o professor apaga um card do Mural → o cliente tira o item de
--      `radar_avisos` e manda a chave para `radar_hidden`;
--   2. o gatilho `endodirect_global_preserve_server_keys` (que existe para um
--      save com cópia velha NÃO apagar o que o cron acabou de trazer)
--      restaurava `radar_avisos` do OLD **incondicionalmente** → o item voltava
--      ao banco no mesmo UPDATE;
--   3. `endodirect_public_content()` / `endodirect_member_content()` juntavam
--      `adm_avisos + radar_avisos` **sem olhar `radar_hidden`** → o item seguia
--      sendo entregue a todo aluno.
-- Na tela do professor ele sumia (o cliente filtra por `radar_hidden` na
-- leitura), então não havia sintoma nenhum do lado de quem apagou. Medido em
-- 03/08 antes da correção: **4 itens apagados ainda visíveis ao aluno**, entre
-- eles as duas notícias falsas de "FC Bayern" que o professor apagou de manhã.
--
-- Chave do item = sourceId || link || titulo — a MESMA regra do `avisoKeyStr`
-- (index.html) e do `keyOf` (lib/radar.js). Se ela mudar em um lugar, tem de
-- mudar nos três.

-- ---------------------------------------------------------------------------
-- 1. O gatilho preserva o radar do servidor, MENOS o que o professor apagou.
-- ---------------------------------------------------------------------------
create or replace function public.endodirect_global_preserve_server_keys()
returns trigger
language plpgsql
set search_path to ''
as $function$
declare
  k text;
  server_keys text[] := array['radar_avisos','newsletter_extra','newsletter_unsub','newsletter_sent','newsletter','newsletter_recent'];
  preservado jsonb;
  ocultos jsonb;
begin
  if current_user in ('authenticated','anon') then
    foreach k in array server_keys loop
      if old.payload ? k then
        preservado := old.payload -> k;
        if k = 'radar_avisos' then
          ocultos := coalesce(new.payload -> 'radar_hidden', old.payload -> 'radar_hidden', '[]'::jsonb);
          if jsonb_typeof(preservado) = 'array'
             and jsonb_typeof(ocultos) = 'array'
             and jsonb_array_length(ocultos) > 0 then
            select coalesce(jsonb_agg(it), '[]'::jsonb) into preservado
              from jsonb_array_elements(old.payload -> k) it
             where not (ocultos ? coalesce(it ->> 'sourceId', it ->> 'link', it ->> 'titulo', ''));
          end if;
        end if;
        new.payload := jsonb_set(coalesce(new.payload, '{}'::jsonb), array[k], preservado, true);
      else
        new.payload := coalesce(new.payload, '{}'::jsonb) - k;
      end if;
    end loop;
  end if;
  return new;
end;
$function$;

-- ---------------------------------------------------------------------------
-- 2. As RPCs de conteúdo filtram `radar_hidden` (segunda trava — vale mesmo que
--    o item sobre no payload por qualquer outro caminho). Fragmento aplicado em
--    `endodirect_public_content()` e `endodirect_member_content()`, nas DUAS
--    metades do `adm_avisos` (avisos manuais e radar):
--
--      where not (coalesce(payload->'radar_hidden','[]'::jsonb)
--                 ? coalesce(v->>'sourceId', v->>'link', v->>'titulo',''))
--
--    (no member_content o `radar_hidden` vem do CTE `h`, porque o payload já
--    está em outro CTE).

-- ---------------------------------------------------------------------------
-- 2b. ⚠️ TERCEIRA TRAVA (aplicada depois, quando o card CONTINUOU na tela com o
--     banco já limpo): as RPCs passam a DEVOLVER `radar_hidden` ao cliente.
--     O app semeia o mural com a cópia do localStorage
--     (`admAvisos = mergeRadarAvisos(lsGet('adm_avisos'))`) e essa semente só é
--     filtrada por `radarHidden` — que, para o aluno, era SEMPRE vazio porque
--     nenhuma RPC mandava a lista. O filtro existia e nunca recebia o dado.
--     Nada sensível: são chaves (URL/título) de notícias públicas removidas.
--
--       'radar_hidden', coalesce(payload->'radar_hidden', '[]'::jsonb),
--
--     No cliente (index.html): `var radarHidden=lsGet('radar_hidden')||[]`
--     declarado ANTES de `var admAvisos=…` (senão a semente é filtrada por uma
--     lista vazia) e `lsSet('radar_hidden', …)` no applyStatePayload, para a
--     próxima abertura já nascer sem o que foi apagado, mesmo offline.

-- ---------------------------------------------------------------------------
-- 3. Limpeza do resíduo (roda como service_role/postgres, sem passar pelo
--    gatilho). Idempotente: pode rodar de novo a qualquer momento.
-- ---------------------------------------------------------------------------
update public.endodirect_global_state g
   set payload = jsonb_set(g.payload, '{radar_avisos}', (
         select coalesce(jsonb_agg(it), '[]'::jsonb)
           from jsonb_array_elements(g.payload->'radar_avisos') it
          where not (coalesce(g.payload->'radar_hidden','[]'::jsonb)
                     ? coalesce(it->>'sourceId', it->>'link', it->>'titulo',''))
       ), true),
       updated_at = now()
 where g.id='main';

-- Conferência (tem de dar 0):
--   select count(*) from public.endodirect_global_state g,
--     lateral jsonb_array_elements(g.payload->'radar_avisos') it
--    where g.id='main'
--      and (coalesce(g.payload->'radar_hidden','[]'::jsonb)
--           ? coalesce(it->>'sourceId', it->>'link', it->>'titulo',''));
