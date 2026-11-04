-- Lembrete da enquete de Educação Médica Continuada (04/11/2026).
--
-- Pedido do professor: "essa enquete já está rolando para os demais alunos que
-- ainda não responderam. Acho que vale a pena uma nova cobrança." Os 20 que já
-- responderam não são cobrados ("não precisam responder novamente").
--
-- 1. `endodirect_enquete_cme_pendentes()`: e-mails dos assinantes Gold ATIVOS que
--    ainda não votaram, sem contas de teste nem admins (`endodirect_email_de_teste`,
--    a mesma régua da apuração) e sem quem saiu da lista (`newsletter_unsub`).
--    Só o servidor chama (service_role): devolve e-mail de aluno.
-- 2. `enquete_lembrete_sent` entra nas chaves do servidor do gatilho
--    `endodirect_global_preserve_server_keys`, como `aovivo_sent`: sem isso, um save
--    do painel apagaria o registro do envio e o lembrete sairia de novo.

create or replace function public.endodirect_enquete_cme_pendentes()
returns table(email text)
language sql
stable
security definer
set search_path to 'public'
as $function$
  with gold as (
    select distinct lower(a.email) as email
      from public.endodirect_acessos a
     where a.status = 'active'
       and (a.scope = 'plano:gold' or a.scope = 'plano')
       and (a.expires_at is null or a.expires_at > now())
       and not public.endodirect_email_de_teste(a.email)
  ),
  votou as (
    select distinct lower(s.email) as email
      from public.endodirect_app_state s
     where jsonb_typeof(s.payload->'enquete_cme'->'temas') = 'array'
       and coalesce((s.payload->'enquete_cme'->>'em')::bigint, 0) > 0
  ),
  unsub as (
    select distinct lower(x) as email
      from public.endodirect_global_state g,
           jsonb_array_elements_text(coalesce(g.payload->'newsletter_unsub', '[]'::jsonb)) x
     where g.id = 'main'
  )
  select g.email from gold g
   where g.email like '%@%'
     and g.email not in (select email from votou)
     and g.email not in (select email from unsub)
   order by g.email;
$function$;

revoke all on function public.endodirect_enquete_cme_pendentes() from public;
revoke all on function public.endodirect_enquete_cme_pendentes() from anon;
revoke all on function public.endodirect_enquete_cme_pendentes() from authenticated;
grant execute on function public.endodirect_enquete_cme_pendentes() to service_role;

create or replace function public.endodirect_global_preserve_server_keys()
returns trigger
language plpgsql
set search_path to ''
as $function$
declare
  k text;
  server_keys text[] := array['radar_avisos','newsletter_extra','newsletter_unsub','newsletter_sent','newsletter','newsletter_recent','aovivo_sent','radar_feeds_aviso','enquete_lembrete_sent'];
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
