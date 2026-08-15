// Reduz o JSON grande do read-design a texto único: tira boilerplate e slides repetidos.
// uso: node dedup-canva.js <arquivo-json> <saida.txt>
const fs = require('fs');
const raw = fs.readFileSync(process.argv[2], 'utf8');
let j; try { j = JSON.parse(raw); } catch (e) { j = JSON.parse(raw.slice(raw.indexOf('{'))); }
const c = j.design_content || '';
const seen = new Set(); const out = [];
for (const l of c.split('\n')) {
  const t = l.trim();
  if (!t) continue;
  if (/^Orientações para (PROFESSORES|equipe AUDIOVISUAL)/.test(t)) continue;
  const k = t.slice(0, 160);
  if (seen.has(k)) continue;
  seen.add(k); out.push(t);
}
fs.writeFileSync(process.argv[3], out.join('\n'));
console.error('%s · %d páginas · %d → %d chars, %d linhas',
  j.design_metadata && j.design_metadata.title, j.design_metadata && j.design_metadata.page_count,
  c.length, out.join('\n').length, out.length);
