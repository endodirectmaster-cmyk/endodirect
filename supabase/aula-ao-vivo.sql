-- Aula ao vivo dentro da plataforma (migration `aula_ao_vivo`, aplicada 06/08/2026).
--
-- Pedido do professor: "é possível fazer uma transmissão ao vivo dentro da
-- plataforma? A ideia seria chamar mais pessoas para entrar na plataforma e
-- assistir a aula dentro dela." E as regras que ele definiu:
--   • AO VIVO  → aberta a quem ENTRAR na plataforma (exige cadastro de quem não
--                é aluno), inclusive degustação e degustação já expirada.
--   • GRAVAÇÃO → só assinante. Ela não vive aqui: o professor publica depois como
--                aula normal em adm_cursos, onde o controle por pacote já existe.
--
-- ⚠️ POR QUE UMA RPC PRÓPRIA, e não uma chave a mais no endodirect_public_content
-- / endodirect_member_content: aqueles payloads já andam por ~5 MB (o
-- member_content chegou a NÃO CARREGAR por tamanho — ver [[Dados e Supabase]]), e
-- a aula ao vivo precisa ser reconsultada a cada minuto, porque ela começa com a
-- página do aluno já aberta. Mesmo precedente do endodirect_member_resumos.
--
-- ⚠️ O CORTE DE ACESSO É AQUI, NÃO NA TELA. O visitante recebe título, horário e
-- descrição (é o que o convence a criar conta) mas NÃO recebe `src`, o link da
-- transmissão. Se esse corte fosse só no navegador, bastaria abrir o DevTools
-- para assistir sem se cadastrar — e a aula deixaria de trazer alguém para
-- dentro, que é o objetivo inteiro.

create or replace function public.endodirect_aovivo()
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  a jsonb;
  autenticado boolean := (auth.uid() is not null);
begin
  select payload->'aovivo' into a from endodirect_global_state where id='main';
  if a is null or jsonb_typeof(a) <> 'object' then
    return jsonb_build_object('aovivo', null);
  end if;
  -- Aula arquivada pelo professor some para todo mundo.
  if coalesce((a->>'arquivada')::boolean, false) then
    return jsonb_build_object('aovivo', null);
  end if;
  if not autenticado then
    a := a - 'src' - 'chat';
  end if;
  -- `agora` do SERVIDOR: a contagem regressiva e a virada para "ao vivo" não
  -- podem depender do relógio do aparelho do aluno.
  return jsonb_build_object('aovivo', a, 'agora', to_char(now() at time zone 'utc','YYYY-MM-DD"T"HH24:MI:SS"Z"'));
end;
$function$;

revoke all on function public.endodirect_aovivo() from public;
grant execute on function public.endodirect_aovivo() to anon, authenticated;

-- O cron grava em `aovivo_sent` (ledger dos avisos já enviados). Sem entrar na
-- lista de chaves do servidor, um save do painel do professor apagaria o ledger e
-- o aviso sairia de novo — mesmo caso do newsletter_sent.
create or replace function public.endodirect_global_preserve_server_keys()
returns trigger
language plpgsql
set search_path to ''
as $function$
declare
  k text;
  server_keys text[] := array['radar_avisos','newsletter_extra','newsletter_unsub','newsletter_sent','newsletter','newsletter_recent','aovivo_sent'];
  preservado jsonb;
  ocultos jsonb;
begin
  if current_user in ('authenticated','anon') then
    foreach k in array server_keys loop
      if old.payload ? k then
        preservado := old.payload -> k;
        if k = 'radar_avisos' then
          -- Chave do item = sourceId || link || titulo (mesma regra do
          -- avisoKeyStr no index.html e do keyOf em lib/radar.js).
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
