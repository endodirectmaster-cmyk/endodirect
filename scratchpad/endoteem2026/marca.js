// Marca itens da fila pelo design id: node marca.js <design> [<design> ...] [--estado feito]
const fs = require('fs');
const p = __dirname + '/fila.json';
const f = JSON.parse(fs.readFileSync(p, 'utf8'));
const args = process.argv.slice(2);
const iEst = args.indexOf('--estado');
const estado = iEst >= 0 ? args[iEst + 1] : 'feito';
const ids = (iEst >= 0 ? args.slice(0, iEst) : args);
const hoje = new Date().toISOString().slice(0, 10);
let n = 0;
for (const a of f.areas) for (const i of a.itens) {
  if (ids.includes(i.design)) { i.estado = estado; i.quando = hoje; n++; }
}
if (n !== ids.length) { console.error('⚠️ esperados %d, marcados %d', ids.length, n); process.exit(1); }
fs.writeFileSync(p, JSON.stringify(f, null, 1) + '\n');
let tot = 0, feito = 0, sc = 0;
for (const a of f.areas) for (const i of a.itens) { tot++; if (i.estado === 'feito') feito++; else if (i.estado === 'sem_capitulo') sc++; }
console.log('✓ %d marcados como %s · fila: %d/%d feitos, %d sem capítulo, %d pendentes', n, estado, feito, tot, sc, tot - feito - sc);
