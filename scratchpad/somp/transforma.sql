-- Transformação SOP → SOMP no servidor (Postgres 17: lookbehind ok; repetição máx. 255).
-- Funções em pg_temp: valem só na sessão; cada consulta de prévia ou de gravação começa
-- com este bloco. A troca é feita em cada VALOR de texto do jsonb (somp_j percorre
-- objetos e listas): no texto JSON, "\nSOP" vira "\\nSOP" e o \m não casa.
-- PONTE (só nos campos longos: diretrizes.resumo, provas.explanation, adm_cursos.resumo):
--   a 1ª menção ganha "antiga síndrome dos ovários policísticos (SOP)"; pula o texto que
--   já cita o nome antigo. GLOBAL (todo texto-alvo): nome por extenso e sigla, com os
--   nomes antigos e os títulos de documento ("SOP 2023") protegidos; a frente de
--   Rotterdam leva "(antiga SOP)", igual à amostra embutida no index.html (sompTxt).
-- Antes, reescrever à mão as notas sobre PMOS (diretrizes pos 11, provas pos 3008).
create or replace function pg_temp.somp_sop() returns text language sql immutable as $f$
  select '(?<!antiga )(?<!termo )(?<![Dd]iretriz de )(?<![Dd]iretriz [Ii]nternacional de )(?<![Dd]iretrizes [Ii]nternacionais de )(?<![Gg]uidelines de )(?<!policísticos \()\mSOP\M(?! ?20\d\d)'::text $f$;
create or replace function pg_temp.somp_ponte(t text) returns text language sql immutable as $f$
  select case when t ~ 'antiga (SOP|síndrome dos ovários)' then t
    when t ~ '[Ss]índrome d(os|e) [Oo]vários [Pp]olicísticos \(SOP\)' then regexp_replace(t, '([Ss])índrome d(?:os|e) [Oo]vários [Pp]olicísticos \(SOP\)', '\1índrome ovariana metabólica poliendócrina (SOMP), antiga síndrome dos ovários policísticos (SOP)')
    when t ~ '[Ss]índrome d(os|e) [Oo]vários [Pp]olicísticos' then regexp_replace(t, '([Ss])índrome d(?:os|e) [Oo]vários [Pp]olicísticos', '\1índrome ovariana metabólica poliendócrina (SOMP), antiga síndrome dos ovários policísticos')
    when t ~ pg_temp.somp_sop() then regexp_replace(t, pg_temp.somp_sop(), 'SOMP (antiga SOP)')
    else t end $f$;
create or replace function pg_temp.somp_glob(t text) returns text language sql immutable as $f$
  select regexp_replace(regexp_replace(regexp_replace(regexp_replace(regexp_replace(t,
    'Critérios de Rotterdam para SOP\?', 'Critérios de Rotterdam para SOMP (antiga SOP)?', 'g'),
    'SÍNDROME D(OS|E) OVÁRIOS POLICÍSTICOS', 'SÍNDROME OVARIANA METABÓLICA POLIENDÓCRINA', 'g'),
    '(?<!antiga )Síndrome d(?:os|e) Ovários Policísticos', 'Síndrome Ovariana Metabólica Poliendócrina', 'g'),
    '(?<!antiga )([Ss])índrome d(?:os|e) ovários policísticos', '\1índrome ovariana metabólica poliendócrina', 'g'),
    pg_temp.somp_sop(), 'SOMP', 'g') $f$;
create or replace function pg_temp.somp_j(j jsonb, ponte boolean default false) returns jsonb language plpgsql immutable as $f$
declare r jsonb;
begin
  if j is null then return null; end if;
  case jsonb_typeof(j)
    when 'string' then
      return to_jsonb(pg_temp.somp_glob(case when ponte then pg_temp.somp_ponte(j #>> '{}') else j #>> '{}' end));
    when 'array' then
      select coalesce(jsonb_agg(pg_temp.somp_j(e) order by i), '[]'::jsonb) into r from jsonb_array_elements(j) with ordinality a(e, i);
      return r;
    when 'object' then
      select coalesce(jsonb_object_agg(key, pg_temp.somp_j(value)), '{}'::jsonb) into r from jsonb_each(j);
      return r;
    else return j;
  end case;
end $f$;
-- Amostras (todas as linhas devem vir com ok = true).
with amostra(j, ponte, esperado) as (values
  (to_jsonb('**Síndrome dos ovários policísticos (SOP)** é comum. Na SOP, o LH sobe.'::text), true,
   to_jsonb('**Síndrome ovariana metabólica poliendócrina (SOMP), antiga síndrome dos ovários policísticos (SOP)** é comum. Na SOMP, o LH sobe.'::text)),
  (to_jsonb('A SOP é a causa mais comum.'::text), true, to_jsonb('A SOMP (antiga SOP) é a causa mais comum.'::text)),
  (to_jsonb('excluir síndrome dos ovários policísticos.'::text), true, to_jsonb('excluir síndrome ovariana metabólica poliendócrina (SOMP), antiga síndrome dos ovários policísticos.'::text)),
  (to_jsonb('Diretriz Internacional de SOP 2023; o termo SOP; ovários policísticos ao US.'::text), true, to_jsonb('Diretriz Internacional de SOP 2023; o termo SOP; ovários policísticos ao US.'::text)),
  (to_jsonb('SOMP (antiga SOP) e SOP'::text), true, to_jsonb('SOMP (antiga SOP) e SOMP'::text)),
  (to_jsonb('escore ≥ 4–6 (SOP 2023) na SOP'::text), true, to_jsonb('escore ≥ 4–6 (SOP 2023) na SOMP (antiga SOP)'::text)),
  (to_jsonb('Critérios de Rotterdam para SOP?'::text), false, to_jsonb('Critérios de Rotterdam para SOMP (antiga SOP)?'::text)),
  ('{"front":"Ovário\nSOP (~80%)","tags":["SOP","Síndrome dos Ovários Policísticos"],"n":3}'::jsonb, false,
   '{"front":"Ovário\nSOMP (~80%)","tags":["SOMP","Síndrome Ovariana Metabólica Poliendócrina"],"n":3}'::jsonb)
)
select pg_temp.somp_j(j, ponte) = esperado as ok, j as antes, pg_temp.somp_j(j, ponte) as depois from amostra;
