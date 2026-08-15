// Gera a inserção de UM capítulo em passos PEQUENOS (cada statement < ~2,5 KB),
// porque o cofre registra truncagem silenciosa em blocos grandes de execute_sql.
// uso: node gera-sql.js <arquivo-do-capitulo> <tema-do-irmao> [--passo N]
const crypto = require('crypto');
const path = require('path');
const md5 = (s) => crypto.createHash('md5').update(s, 'utf8').digest('hex');
const item = require(path.resolve(process.argv[2]));
const irmao = process.argv[3];
const iPasso = process.argv.indexOf('--passo');
const soPasso = iPasso >= 0 ? Number(process.argv[iPasso + 1]) : null;

const q = (s) => "'" + String(s).replace(/'/g, "''") + "'";
const TAG = '$CAP$';
const dq = (s) => { if (String(s).includes('CAP$')) throw new Error('colisao de tag'); return TAG + s + TAG; };

// Alvo SEMPRE filtrado por tema E privado booleano true (regra do cofre).
const ALVO = `d->>'tema' = ${q(item.tema)} and jsonb_typeof(d->'privado') = 'boolean' and coalesce(d->>'privado','') = 'true'`;

const setCampo = (campo, valorSql) => `update endodirect_global_state g
set payload = jsonb_set(g.payload, '{diretrizes}', (
  select jsonb_agg(case when ${ALVO} then jsonb_set(d, '{${campo}}', ${valorSql}) else d end order by ord)
  from jsonb_array_elements(g.payload->'diretrizes') with ordinality t(d, ord)))
where g.id = 'main';`;

const passos = [];

// -- passo 1: item base, com os campos grandes VAZIOS e `privado` HERDADO do irmão
const base = {
  ano: item.ano, pts: [], sub: item.sub, url: item.url,
  mapa: { nodes: [] }, tema: item.tema, fonte: item.fonte,
  resumo: '', titulo: item.titulo, flashcards: [], fluxogramas: []
};
passos.push({ nome: 'base + privado herdado', sql: `update endodirect_global_state g
set payload = jsonb_set(g.payload, '{diretrizes}',
  (g.payload->'diretrizes') || jsonb_build_array(
    ${dq(JSON.stringify(base))}::jsonb
    || jsonb_build_object('privado', (
         select d->'privado' from jsonb_array_elements(g.payload->'diretrizes') d
         where d->>'tema' = ${q(irmao)} and jsonb_typeof(d->'privado') = 'boolean'
           and coalesce(d->>'privado','') = 'true' limit 1))))
where g.id = 'main'
  and not exists (select 1 from jsonb_array_elements(g.payload->'diretrizes') d
                  where d->>'tema' = ${q(item.tema)})
  and exists (select 1 from jsonb_array_elements(g.payload->'diretrizes') d
              where d->>'tema' = ${q(irmao)} and jsonb_typeof(d->'privado') = 'boolean'
                and coalesce(d->>'privado','') = 'true');` });

// -- passos 2..: campos estruturados, um por vez (partindo arrays grandes em metades)
const emPedacos = (campo, arr) => {
  const txt = JSON.stringify(arr);
  if (txt.length < 2300) { passos.push({ nome: campo, sql: setCampo(campo, `${dq(txt)}::jsonb`) }); return; }
  const meio = Math.ceil(arr.length / 2);
  passos.push({ nome: campo + ' (1/2)', sql: setCampo(campo, `${dq(JSON.stringify(arr.slice(0, meio)))}::jsonb`) });
  passos.push({ nome: campo + ' (2/2)', sql: setCampo(campo, `(d->'${campo}') || ${dq(JSON.stringify(arr.slice(meio)))}::jsonb`) });
};
emPedacos('pts', item.pts);
emPedacos('flashcards', item.flashcards);
passos.push({ nome: 'mapa', sql: setCampo('mapa', `${dq(JSON.stringify(item.mapa))}::jsonb`) });
if (item.fluxogramas.length) {
  const t = JSON.stringify(item.fluxogramas);
  if (t.length < 2300) passos.push({ nome: 'fluxogramas', sql: setCampo('fluxogramas', `${dq(t)}::jsonb`) });
  else {
    const nos = item.fluxogramas[0].nos, meio = Math.ceil(nos.length / 2);
    passos.push({ nome: 'fluxogramas (1/2)', sql: setCampo('fluxogramas', `${dq(JSON.stringify([{ nos: nos.slice(0, meio) }]))}::jsonb`) });
    passos.push({ nome: 'fluxogramas (2/2)', sql: setCampo('fluxogramas',
      `jsonb_build_array(jsonb_build_object('nos', (d->'fluxogramas'->0->'nos') || ${dq(JSON.stringify(nos.slice(meio)))}::jsonb))`) });
  }
}

// -- resumo, concatenado em pedaços de ~1.900 chars, cortando em quebra de linha
const pedacosResumo = [];
{
  let resto = item.resumo;
  while (resto.length) {
    if (resto.length <= 1900) { pedacosResumo.push(resto); break; }
    let corte = resto.lastIndexOf('\n', 1900);
    if (corte < 800) corte = 1900;
    pedacosResumo.push(resto.slice(0, corte));
    resto = resto.slice(corte);
  }
}
pedacosResumo.forEach((p, i) => passos.push({
  nome: `resumo (${i + 1}/${pedacosResumo.length})`,
  sql: setCampo('resumo', `to_jsonb((d->>'resumo') || ${dq(p)})`)
}));

// -- conferência final
const confere = `select
  (select jsonb_array_length(payload->'diretrizes') from endodirect_global_state) as total_itens,
  (select count(*) from jsonb_object_keys(d)) as n_chaves,
  jsonb_typeof(d->'privado') as tp_privado, d->>'privado' as privado,
  jsonb_array_length(d->'pts') as n_pts, jsonb_array_length(d->'flashcards') as n_fc,
  jsonb_array_length(d->'mapa'->'nodes') as n_mapa, jsonb_array_length(d->'fluxogramas') as n_flux,
  length(d->>'resumo') as chars, md5(d->>'resumo') as md5_resumo,
  md5((select string_agg(v, chr(182) order by o) from jsonb_array_elements_text(d->'pts') with ordinality t(v,o))) as md5_pts,
  md5((select string_agg((f->>'q')||'~'||(f->>'a'), chr(182) order by o) from jsonb_array_elements(d->'flashcards') with ordinality t(f,o))) as md5_fc,
  md5((select string_agg((n->>'label')||'~'||coalesce((select string_agg(c,'^' order by o2) from jsonb_array_elements_text(n->'children') with ordinality t2(c,o2)),''), chr(182) order by o)
       from jsonb_array_elements(d->'mapa'->'nodes') with ordinality t(n,o))) as md5_mapa,
  coalesce(md5((select string_agg((select string_agg(concat_ws('|', no->>'tipo', no->>'texto',
        coalesce((select string_agg(concat_ws('/', r->>'tipo', r->>'rotulo', r->>'texto'),'&' order by o3) from jsonb_array_elements(no->'ramos') with ordinality t3(r,o3)),'')), chr(167) order by o2)
      from jsonb_array_elements(fx->'nos') with ordinality t2(no,o2)), chr(182) order by o)
    from jsonb_array_elements(d->'fluxogramas') with ordinality t(fx,o))), md5('')) as md5_flux
from endodirect_global_state, jsonb_array_elements(payload->'diretrizes') d
where d->>'tema' = ${q(item.tema)};`;

const esperado = {
  tema: item.tema, sub: item.sub, n_chaves: 12, tp_privado: 'boolean', privado: 'true',
  n_pts: item.pts.length, n_fc: item.flashcards.length,
  n_mapa: item.mapa.nodes.length, n_flux: item.fluxogramas.length,
  chars: item.resumo.length,
  md5_resumo: md5(item.resumo),
  md5_pts: md5(item.pts.join('¶')),
  md5_fc: md5(item.flashcards.map(f => f.q + '~' + f.a).join('¶')),
  md5_mapa: md5(item.mapa.nodes.map(n => n.label + '~' + n.children.join('^')).join('¶')),
  md5_flux: item.fluxogramas.length
    ? md5(item.fluxogramas.map(fx => fx.nos.map(n => [n.tipo, n.texto,
        (n.ramos || []).map(r => [r.tipo, r.rotulo, r.texto].join('/')).join('&')].join('|')).join('§')).join('¶'))
    : md5('')
};

if (soPasso === 0) { console.log(confere); }
else if (soPasso) { const p = passos[soPasso - 1]; if (!p) throw new Error('passo inexistente'); console.log(p.sql); }
else {
  console.log('PASSOS (%d) — tamanhos em bytes:', passos.length);
  passos.forEach((p, i) => console.log('  %d. %s — %d', i + 1, p.nome, Buffer.byteLength(p.sql, 'utf8')));
  console.log('\nESPERADO:\n' + JSON.stringify(esperado, null, 1));
}
