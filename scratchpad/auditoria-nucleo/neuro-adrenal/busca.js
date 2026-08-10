#!/usr/bin/env node
/* Busca robusta a quebras de PDF no texto-fonte.
 * uso: node busca.js <fileIdOuArquivo> "<regex>" [ctx]
 *      node busca.js --all "<regex>" [ctx]   (varre todos os textos)
 * Normaliza: junta hifenização de fim de linha, colapsa espaços/quebras.
 */
const fs = require('fs');
const path = require('path');
const DIR = '/home/user/endodirect/scratchpad/acervo/textos';

function norm(s) {
  return s
    .replace(/-\s*\n\s*/g, '')      // hifenização de fim de linha
    .replace(/\s+/g, ' ');          // qualquer espaço vira um só
}

const args = process.argv.slice(2);
const alvo = args[0];
const pad = args[1];
const ctx = parseInt(args[2] || '220', 10);
const re = new RegExp(pad, 'gi');

function varre(file) {
  const p = path.join(DIR, file);
  const t = norm(fs.readFileSync(p, 'utf8'));
  let m, achou = 0;
  re.lastIndex = 0;
  while ((m = re.exec(t)) !== null) {
    achou++;
    const ini = Math.max(0, m.index - ctx);
    const fim = Math.min(t.length, m.index + m[0].length + ctx);
    console.log(`--- ${file} @${m.index} ---`);
    console.log(t.slice(ini, fim).replace(/\s+/g, ' '));
    console.log('');
    if (achou > 40) { console.log('(...cortado em 40)'); break; }
    if (m.index === re.lastIndex) re.lastIndex++;
  }
  return achou;
}

if (alvo === '--all') {
  let total = 0;
  fs.readdirSync(DIR).filter(f => f.endsWith('.txt')).forEach(f => { total += varre(f); });
  console.log('TOTAL OCORRÊNCIAS: ' + total);
} else {
  const file = alvo.endsWith('.txt') ? alvo : alvo + '.txt';
  const n = varre(file);
  console.log('OCORRÊNCIAS em ' + file + ': ' + n);
}
