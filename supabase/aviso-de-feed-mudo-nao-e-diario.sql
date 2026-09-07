-- O aviso de feed oficial mudo deixa de ser diário.
--
-- 07/09/2026. O alerta criado em 28/08 (feed oficial que não entrega nada vira
-- e-mail) fazia o certo — contar o silêncio, depois de a Lilly ficar fora de
-- 1.019 itens sem ninguém perceber — mas repetia o MESMO e-mail toda manhã.
-- Pedido do professor: "não precisa ficar enviando diariamente um email,
-- informando desse erro."
--
-- A trava do aviso passa a ser a chave `radar_feeds_aviso` no payload, gravada
-- pelo cron: guarda a assinatura do conjunto de feeds mudos e a data. O e-mail
-- só volta quando a assinatura MUDA, quando os feeds voltam ao ar, ou uma vez
-- por mês enquanto durar.
--
-- ⚠️ POR QUE ESTA MIGRAÇÃO EXISTE. A chave é escrita pelo SERVIDOR e o painel do
-- professor salva o payload INTEIRO a partir da cópia do navegador — que não
-- conhece essa chave. Sem entrar na lista do gatilho, cada "Salvar" no painel
-- apagaria a trava e o e-mail voltaria no dia seguinte. É a mesma armadilha que
-- já custou a postagem da Questão do Dia em 27/07 e o mural em 30/08.
-- 🧨 A LISTA FOI LIDA DO BANCO, NÃO DO ARQUIVO. O .sql anterior no repositório
-- (`mural-apagado-vale-para-o-aluno.sql`) está DESATUALIZADO: não tem
-- `aovivo_sent`, que foi acrescentado depois direto na função. Copiar a lista de
-- lá teria derrubado em silêncio a trava do aviso da aula ao vivo. Antes de
-- reescrever a função, conferi o `prosrc` em produção.
create or replace function public.endodirect_global_preserve_server_keys()
returns trigger
language plpgsql
set search_path to ''
as $function$
declare
  k text;
  server_keys text[] := array['radar_avisos','newsletter_extra','newsletter_unsub','newsletter_sent','newsletter','newsletter_recent','aovivo_sent','radar_feeds_aviso'];
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
