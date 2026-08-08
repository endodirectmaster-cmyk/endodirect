#!/usr/bin/env node
/* Mostra a citação literal de um fato, lida do texto-fonte LOCAL.
 *
 * A citação deixou de ser versionada (ver lib/citacao.js): o extrato guarda
 * offset + hash, e o texto fica em `scratchpad/acervo/textos/`, no .gitignore.
 * Quem tem o artigo continua conseguindo ler a prova; quem não tem, não recebe
 * o artigo de graça. Este script é o "quem tem".
 *
 * Uso:
 *   node scripts/mostra-citacao.js <extrato.json> [n]      um fato (ou todos)
 *   node scripts/mostra-citacao.js <extrato.json> --busca "termo"
 */
const fs = require('fs');
const path = require('path');
const CIT = require('../lib/citacao');

const RAIZ = path.join(__dirname, '..');
const DIR = path.join(RAIZ, 'scratchpad', 'acervo');
const alvo = process.argv[2];
if (!alvo) { console.error('uso: node scripts/mostra-citacao.js <extrato.json> [n | --busca "termo"]'); process.exit(1); }

const p = fs.existsSync(alvo) ? alvo : path.join(DIR, 'extratos', alvo.endsWith('.json') ? alvo : alvo + '.json');
if (!fs.existsSync(p)) { console.error('✗ não achei ' + p); process.exit(1); }
const e = JSON.parse(fs.readFileSync(p, 'utf8'));
const pTxt = path.join(DIR, 'textos', String(e.fileId || '') + '.txt');
if (!fs.existsSync(pTxt)) {
  console.error('✗ texto-fonte ausente: ' + pTxt);
  console.error('  Sem ele a citação não pode ser resolvida — é exatamente o ponto: o texto não é versionado.');
  process.exit(1);
}
const bs = CIT.bases(fs.readFileSync(pTxt, 'utf8'));

const iBusca = process.argv.indexOf('--busca');
const termo = iBusca > 0 ? String(process.argv[iBusca + 1] || '').toLowerCase() : '';
const n = !termo && process.argv[3] ? parseInt(process.argv[3], 10) : null;

console.log(String(e.titulo || e.tema || '').slice(0, 100) + '\n');
(e.fatos || []).forEach((f, i) => {
  if (n && i + 1 !== n) return;
  if (termo && !((f.afirmacao || '') + ' ' + (f.secao || '')).toLowerCase().includes(termo)) return;
  const r = CIT.resolver(f, bs);
  console.log(`#${i + 1}  [${f.secao || '—'}]`);
  console.log('  ' + f.afirmacao);
  console.log('  « ' + (r ? r.texto : '⚠️ NÃO RESOLVE — offset ou hash não batem') + ' »\n');
});
