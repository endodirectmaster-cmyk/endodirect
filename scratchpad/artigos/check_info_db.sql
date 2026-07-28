-- Espelho SQL da função hash() do check_info_db.js.
--
-- ⚠️ Este arquivo existe porque a expressão vinha sendo reescrita à mão a cada
-- lote e nunca ficou no repositório — o que tornava a "prova" de que o banco
-- bate com a fonte local irreprodutível. Agora é: rode este SQL, cole os hashes
-- no mapa DB do check_info_db.js, rode o JS.
--
-- COMO SE PROVA QUE O ESPELHO ESTÁ CERTO: ele tem de reproduzir, sem alterar
-- uma vírgula, os hashes dos lotes ANTERIORES que já estavam no check_info_db.js.
-- Se um hash antigo mudar, o errado é o espelho — não o banco.
--
-- Nota sobre números: `->>` devolve a forma textual do jsonb, que preserva zero
-- à direita (8.0 continua "8.0"), enquanto String(8.0) em JS dá "8". O
-- `::float8::text` normaliza os dois lados. Sem ele, um valor digitado como 2.0
-- no INSERT diverge de um 2.0 escrito em JS, sem nenhuma diferença real.
with art as (
  select d->>'tema' as tema, d->'info' as f
  from jsonb_array_elements((select payload->'diretrizes' from endodirect_global_state where id='main')) d
  where d ? 'info'
),
desf as (
  select a.tema, x.i,
    concat_ws(':',
      x.d->>'lab', x.d->>'nome', x.d->>'dir', (x.d->>'escala')::float8::text,
      case when x.d ? 'barras' then (
        select coalesce(string_agg(concat_ws(',', b->>'n', b->>'t',
                 (b->>'v')::float8::text, (b->>'i')::float8::text), ';' order by bi), '')
        from jsonb_array_elements(x.d->'barras') with ordinality tb(b, bi)) end,
      -- curva: entrou no hash em 2026-07-28 (ver comentário equivalente no .js)
      case when x.d ? 'curva' then concat_ws(',',
        (x.d->'curva'->>'dur')::float8::text, x.d->'curva'->>'un',
        case when coalesce((x.d->'curva'->>'real')::boolean, false) then '1' else '0' end,
        x.d->'curva'->>'fig',
        (select coalesce(string_agg((
             select string_agg((e#>>'{}')::float8::text, '@' order by ej)
             from jsonb_array_elements(p) with ordinality te(e, ej)), '+' order by pk), '')
         from jsonb_array_elements(x.d->'curva'->'pts') with ordinality tpc(p, pk))) end,
      x.d->'efeito'->>'k', x.d->'efeito'->>'v', x.d->'efeito'->>'p',
      (x.d->'forest'->>'e')::float8::text, (x.d->'forest'->>'lo')::float8::text,
      (x.d->'forest'->>'hi')::float8::text, x.d->'forest'->>'fav', x.d->'forest'->>'des',
      case when x.d ? 'grupos' then concat_ws(',',
        x.d->'grupos'->'bracos'->>0, x.d->'grupos'->'bracos'->>1,
        x.d->'grupos'->>'eixo', x.d->'grupos'->>'fig',
        (select coalesce(string_agg(concat_ws('/', c->>'k', nullif((
             select coalesce(string_agg((v#>>'{}')::float8::text, '/' order by vi), '')
             from jsonb_array_elements(c->'vs') with ordinality tv(v, vi)), '')), ';' order by ci), '')
         from jsonb_array_elements(x.d->'grupos'->'cats') with ordinality tc(c, ci)),
        x.d->'grupos'->>'nota') end,
      case when x.d ? 'series' then (
        select string_agg(concat_ws(',', se->>'tit', se->>'eixo', se->>'fig',
                 (se->>'min')::float8::text, (se->>'max')::float8::text,
                 (select coalesce(string_agg((tk#>>'{}')::float8::text, '+' order by ki), '')
                    from jsonb_array_elements(se->'ticks') with ordinality tk_(tk, ki)),
                 (se->>'dec')::float8::text,
                 (select coalesce(string_agg((tp#>>'{}')::float8::text, '+' order by pi), '')
                    from jsonb_array_elements(se->'tempos') with ordinality tp_(tp, pi)),
                 (select coalesce(string_agg(concat_ws('/', l->>'n', (
                      select coalesce(string_agg((p->>0)::float8::text || '@' || (p->>1)::float8::text,
                                                 '+' order by pj), '')
                      from jsonb_array_elements(l->'pts') with ordinality tp2(p, pj))), '!' order by li), '')
                    from jsonb_array_elements(se->'linhas') with ordinality tl(l, li)),
                 se->>'nota'), '#' order by si)
        from jsonb_array_elements(x.d->'series') with ordinality ts(se, si)) end
    ) as s
  from art a, jsonb_array_elements(a.f->'desfechos') with ordinality x(d, i)
),
partes as (
  select a.tema,
    (select string_agg(s, '~' order by i) from desf where desf.tema = a.tema) as desfechos,
    (select string_agg(concat_ws(',', t->>'v', t->>'k', t->>'t'), '~' order by ti)
       from jsonb_array_elements(a.f->'tiles') with ordinality tt(t, ti)) as tiles,
    (select string_agg(c#>>'{}', '~' order by ci)
       from jsonb_array_elements(a.f->'chips') with ordinality tc(c, ci)) as chips,
    a.f as f
  from art a
)
select tema, md5(concat_ws('|',
    f->>'desenho', f->>'pergunta', f->>'seg', f->>'prat', f->>'segIco',
    coalesce(chips, ''),
    f->'bracos'->'int'->>'n', f->'bracos'->'int'->>'s',
    f->'bracos'->'ctl'->>'n', f->'bracos'->'ctl'->>'s',
    nullif(desfechos, ''), nullif(tiles, ''))) as hash
from partes
order by tema;
