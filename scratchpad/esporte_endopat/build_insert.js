#!/usr/bin/env node
// Valida os 14 capítulos gerados e monta o SQL que os INSERE (append) no array
// payload->'diretrizes' como resumos PRIVADOS (privado:true), com fonte distinta
// das diretrizes públicas. Preserva tudo o mais.
const fs = require('fs');
const path = require('path');
const OUT = process.argv[2] || '/tmp/claude-0/-home-user-endodirect/e01a6b7b-c80e-5daa-bda4-d192aa1099f9/tasks/w3rpodhf3.output';
const chapters = JSON.parse(fs.readFileSync(OUT, 'utf8')).result;

function emptyTableCells(md) {
  const bad = [];
  for (const line of md.split('\n')) {
    const t = line.trim();
    if (!t.startsWith('|')) continue;
    if (/^\|[\s:|-]+\|$/.test(t)) continue;
    const cells = t.replace(/^\|/, '').replace(/\|$/, '').split('|').map(c => c.trim());
    if (cells.some(c => c === '')) bad.push(t);
  }
  return bad;
}
function mapaOk(m) {
  if (!m || typeof m !== 'object' || !m.central || !Array.isArray(m.nodes) || !m.nodes.length) return false;
  // pelo menos um ramo com children (2º nível)
  return m.nodes.some(n => n && n.label && Array.isArray(n.children) && n.children.length);
}

let allOk = true;
const items = [];
for (const c of chapters) {
  const md = String(c.resumo || '');
  const issues = [];
  if (md.length < 4000) issues.push('curto ' + md.length);
  if (!/^##\s/m.test(md)) issues.push('sem ##');
  if (!/##\s*📊/.test(md)) issues.push('sem tabela 📊');
  const empt = emptyTableCells(md); if (empt.length) issues.push('células vazias:' + empt.length);
  if (/\bPMID[:\s]*\d/i.test(md) || /\b10\.\d{4,9}\/\S+/.test(md)) issues.push('PMID/DOI?');
  if (/https?:\/\//.test(md)) issues.push('link http');
  if (!Array.isArray(c.pts) || c.pts.length < 8) issues.push('pts<8');
  const fc = Array.isArray(c.flashcards) ? c.flashcards.filter(x => x && x.q && x.a) : [];
  if (fc.length < 4) issues.push('fc<4');
  if (!mapaOk(c.mapa)) issues.push('mapa inválido');
  if (issues.length) { allOk = false; console.log('⚠️ ' + c.tema + ' → ' + issues.join(' | ')); }
  items.push({
    sub: c.sub, tema: c.tema, fonte: c.fonte, titulo: '', privado: true,
    resumo: md,
    pts: (c.pts || []).map(String),
    flashcards: fc.map(x => ({ q: String(x.q), a: String(x.a) })),
    mapa: c.mapa
  });
}

// SQL IDEMPOTENTE: append só dos itens cujo (sub,tema) ainda não existe no array
// (re-executar não duplica). Dollar-quoted JSON.
const jsonArr = JSON.stringify(items);
const TAG = '$items$';
if (jsonArr.includes(TAG)) throw new Error('delimitador colide');
const sql =
`update endodirect_global_state gs
set payload = jsonb_set(
  gs.payload, '{diretrizes}',
  coalesce(gs.payload->'diretrizes','[]'::jsonb) || (
    select coalesce(jsonb_agg(elem), '[]'::jsonb)
    from jsonb_array_elements(${TAG}${jsonArr}${TAG}::jsonb) elem
    where not exists (
      select 1 from jsonb_array_elements(coalesce(gs.payload->'diretrizes','[]'::jsonb)) d
      where d->>'sub' = elem->>'sub' and d->>'tema' = elem->>'tema'
    )
  )
);`;

fs.writeFileSync(path.join(__dirname, 'insert.sql'), sql);
console.log('\n=== RESUMO ===');
console.log('itens:', items.length, '| bytes SQL:', Buffer.byteLength(sql, 'utf8'));
console.log('validação global:', allOk ? 'TUDO OK' : 'há avisos (revisar acima)');
// contagem por sub
const bySub = {}; items.forEach(i => bySub[i.sub] = (bySub[i.sub] || 0) + 1);
console.log('por sub:', JSON.stringify(bySub));
