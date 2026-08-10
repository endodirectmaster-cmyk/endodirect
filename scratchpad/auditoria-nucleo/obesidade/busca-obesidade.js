#!/usr/bin/env node
/* Auditoria OBESIDADE — busca literal no texto-fonte, com contexto que atravessa
 * quebra de linha. Escrito por este auditor; não toca em nada fora desta pasta.
 * uso: node busca-obesidade.js <fileId|todos> "<termo>" [contexto]
 */
const fs = require('fs');
const path = require('path');
const DIR = path.join(__dirname, '..', '..', 'acervo', 'textos');
const alvo = process.argv[2];
const termo = String(process.argv[3] || '');
const ctx = parseInt(process.argv[4] || '260', 10);
const ids = alvo === 'todos'
  ? ['14UWdnDelBLCbzBKUL7Yoq-4twRn2DnB3', '1G_tUIJx7G_Kabz-UB0yD7af1hz9qQ-wW',
     '1IEs1avdteLT9bZudHHTxeEBIjB77dCli', '1VVjAEFg5xhs5WgiHYyV1hdo7dLnJcDhN',
     '1aTQRBGfXP56X1QlWEPb8M5VFmD-ZTcrX', '1t-D25dItwmu-Qkjj6xaBsqrvYq1uRybW',
     '1w6SQlCHJ-gqXdzUxXK0xfmS2BrdezsyK']
  : [alvo];
const norm = (s) => s.toLowerCase();
for (const id of ids) {
  const p = path.join(DIR, id + '.txt');
  if (!fs.existsSync(p)) { console.log('(sem texto) ' + id); continue; }
  const t = fs.readFileSync(p, 'utf8');
  const h = norm(t), q = norm(termo);
  let i = 0, n = 0;
  while ((i = h.indexOf(q, i)) !== -1) {
    n++;
    const trecho = t.slice(Math.max(0, i - ctx), i + q.length + ctx).replace(/\s+/g, ' ');
    console.log('### ' + id + ' @' + i + '\n' + trecho + '\n');
    i += q.length;
    if (n > 12) { console.log('… (mais ocorrências)'); break; }
  }
  if (!n) console.log('### ' + id + ': 0 ocorrências de "' + termo + '"');
}
