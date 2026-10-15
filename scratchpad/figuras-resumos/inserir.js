'use strict';
// Gera o SQL que grava o campo `figuras` (url + título + fonte) nos capítulos que
// ainda não têm figura. Só banco: o SVG mora em figuras/resumos/<slug>.svg, servido
// como estático, e o payload recebe ~200 bytes por capítulo (nada de SVG inline).
// Guardas: o item é casado por posição E por tema, e só recebe figura se não tiver.
// Uso: node inserir.js <indice.json dos capítulos exportados> > figuras.sql
const fs = require('fs');
const path = require('path');
const { render, slugDe } = require('./render.js');
const BASE = 'https://www.endodirect.com.br/figuras/resumos/';
const idx = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const porI = {}; idx.forEach((x) => { porI[x.i] = x; });
const specDir = path.join(__dirname, 'specs');
const svgDir = path.join(__dirname, '..', '..', 'figuras', 'resumos');
const mapa = {};
let n = 0;
fs.readdirSync(specDir).filter((f) => f.endsWith('.json')).forEach((f) => {
  const sp = JSON.parse(fs.readFileSync(path.join(specDir, f), 'utf8'));
  const cap = porI[sp.i];
  if (!cap) throw new Error('capítulo não está no índice: ' + f);
  if (cap.tema !== sp.tema) throw new Error('tema diferente do índice em ' + f + ': ' + sp.tema + ' ≠ ' + cap.tema);
  if (cap.fig) throw new Error('capítulo já tem figura: ' + f);
  const slug = slugDe(sp);
  if (!fs.existsSync(path.join(svgDir, slug + '.svg'))) throw new Error('SVG não gerado: ' + slug);
  const fonte = 'Esquema Endodirect — ilustração original a partir do texto do capítulo' + (cap.fonte ? ' (' + cap.fonte + ')' : '') + '.';
  mapa[String(sp.i)] = { tema: sp.tema, figuras: [{ titulo: sp.titulo, url: BASE + slug + '.svg', fonte }] };
  n++;
});
const j = JSON.stringify(mapa);
if (j.indexOf('$j$') >= 0) throw new Error('$j$ no JSON');
const sql = "UPDATE endodirect_global_state SET payload = jsonb_set(payload, '{diretrizes}', (\n"
  + "  SELECT jsonb_agg(CASE WHEN m.value IS NOT NULL AND a->>'tema' = m.value->>'tema' AND NOT (a ? 'figuras')\n"
  + "                        THEN a || jsonb_build_object('figuras', m.value->'figuras') ELSE a END ORDER BY t.ord)\n"
  + "  FROM jsonb_array_elements(payload->'diretrizes') WITH ORDINALITY t(a, ord)\n"
  + "  LEFT JOIN LATERAL (SELECT ($j$" + j + "$j$::jsonb) -> ((t.ord - 1)::text) AS value) m ON true\n"
  + ")), updated_at = now()\nWHERE id = 'main';";
process.stdout.write(sql + '\n');
console.error('capítulos no UPDATE: ' + n);
