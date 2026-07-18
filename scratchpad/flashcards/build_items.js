#!/usr/bin/env node
/* Gera 1 arquivo .sql por item (88), cada um um DO block AUTO-VERIFICÁVEL:
   embute o JSON de flashcards + md5 esperado; o Postgres recusa (raise) se o
   texto chegou corrompido, garantindo byte-exatidão da parte médica crítica.
   Cada UPDATE casa o item por sub+tema+privado e troca só 'flashcards'.
   Idempotente e independente da ordem. */
const fs = require('fs'), path = require('path'), crypto = require('crypto');

const raw = JSON.parse(fs.readFileSync(path.join(__dirname, 'combined.output'), 'utf8'));
const results = Array.isArray(raw) ? raw : raw.result;
const norm = s => String(s == null ? '' : s).replace(/\s+/g, ' ').trim();

const OUT = path.join(__dirname, 'items');
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

// tag dollar-quote seguro: não pode aparecer no conteúdo
function tag(base, content) {
  let t = '$' + base + '$';
  let n = 0;
  while (content.includes(t)) { t = '$' + base + (++n) + '$'; }
  return t;
}

let idx = 0;
const manifest = [];
for (const r of results) {
  const fc = (Array.isArray(r.flashcards) ? r.flashcards : [])
    .map(x => ({ q: norm(x && x.q), a: norm(x && x.a) }))
    .filter(x => x.q && x.a);
  const fcJson = JSON.stringify(fc);          // texto exato embutido e md5-gated
  const md5 = crypto.createHash('md5').update(fcJson).digest('hex');
  const priv = String(r.privado) === 'true';

  const jTag = tag('FC', fcJson);
  const sTag = tag('S', r.sub);
  const tTag = tag('T', r.tema);

  const sql =
`do $$
declare raw text := ${jTag}${fcJson}${jTag};
begin
  if md5(raw) <> '${md5}' then
    raise exception 'md5 mismatch item ${idx} (%): got %', ${sTag}${r.tema}${sTag}, md5(raw);
  end if;
  update endodirect_global_state gs
  set payload = jsonb_set(gs.payload, '{diretrizes}', (
    select jsonb_agg(
      case when d->>'sub' = ${sTag}${r.sub}${sTag}
            and d->>'tema' = ${tTag}${r.tema}${tTag}
            and coalesce((d->>'privado')::boolean, false) = ${priv}
           then jsonb_set(d, '{flashcards}', raw::jsonb)
           else d end)
    from jsonb_array_elements(gs.payload->'diretrizes') d));
end $$;
`;
  const fn = 'item' + String(idx).padStart(2, '0') + '.sql';
  fs.writeFileSync(path.join(OUT, fn), sql);
  manifest.push({ idx, file: fn, sub: r.sub, tema: r.tema, privado: priv, nCards: fc.length, md5, bytes: Buffer.byteLength(sql, 'utf8') });
  idx++;
}
fs.writeFileSync(path.join(OUT, 'manifest.json'), JSON.stringify(manifest, null, 2));
const sizes = manifest.map(m => m.bytes).sort((a, b) => a - b);
console.log('itens:', manifest.length);
console.log('bytes/arquivo — min:', sizes[0], '| p50:', sizes[Math.floor(sizes.length / 2)], '| max:', sizes[sizes.length - 1]);
console.log('total cards:', manifest.reduce((s, m) => s + m.nCards, 0));
