-- "VOCÊ FOI MELHOR QUE X% DOS ALUNOS" NO FIM DO SIMULADO (27/11/2026)
--
-- Professor, da lista de sugestões: "Faz a 1, 5, 6 e 10" (a 6: comparação anônima no fim do Simulado).
--
-- Com quem compara: com o APROVEITAMENTO GERAL em questões (Banco + Simulados, o `perf` que o aparelho
-- sincroniza) de cada OUTRO aluno com pelo menos 20 questões respondidas. Por que não só simulados: em
-- 27/11 eram 7 alunos com simulado gravado, pouco para uma porcentagem que signifique algo; com o
-- aproveitamento geral eram 23.
--
-- Anonimato: devolve só a porcentagem (inteira), nunca quem, quantos ou as notas. Com menos de 15 alunos
-- na comparação, devolve {ok:false} e a tela não mostra nada. O % pedido é arredondado para o inteiro,
-- o que limita quanto uma sondagem repetida revela da distribuição (que já é anônima).
create or replace function public.endodirect_simulado_comparar(p_pct numeric)
returns jsonb
language plpgsql
stable security definer
set search_path to 'public'
as $function$
declare
  v_uid uuid := auth.uid();
  v_pct numeric;
  v_n int;
  v_abaixo numeric;
begin
  if v_uid is null or p_pct is null or p_pct < 0 or p_pct > 100 then return jsonb_build_object('ok', false); end if;
  v_pct := round(p_pct);
  with p as (
    select s.user_id, e.value v
      from public.endodirect_app_state s
      cross join lateral jsonb_each(case when jsonb_typeof(s.payload->'perf') = 'object' then s.payload->'perf' else '{}'::jsonb end) e
     where s.user_id <> v_uid
       and coalesce(s.role, 'aluno') = 'aluno'
       and jsonb_typeof(e.value) = 'object'
       and (e.value->>'correct') ~ '^[0-9]{1,7}$'
       and (e.value->>'total') ~ '^[0-9]{1,7}$'
  ), u as (
    select user_id, sum((v->>'correct')::numeric) c, sum((v->>'total')::numeric) t from p group by user_id
  ), a as (
    select 100 * least(c, t) / t pct from u where t >= 20
  )
  select count(*), coalesce(sum(case when pct < v_pct then 1 when pct = v_pct then 0.5 else 0 end), 0)
    into v_n, v_abaixo from a;
  if v_n < 15 then return jsonb_build_object('ok', false); end if;
  return jsonb_build_object('ok', true, 'melhor_que', round(100 * v_abaixo / v_n)::int);
end;
$function$;

revoke all on function public.endodirect_simulado_comparar(numeric) from public, anon;
grant execute on function public.endodirect_simulado_comparar(numeric) to authenticated;
