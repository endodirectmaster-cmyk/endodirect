'use strict';
// Confere cada ilustração contra o texto do capítulo (cópia local da sessão, nunca no
// repositório): (1) todo trecho do `lastro` está literalmente no capítulo; (2) o ponto
// de inserção `depoisDe` aparece UMA vez (senão a figura cairia no lugar errado); (3) todo
// número escrito na ilustração aparece no capítulo. A conferência de sentido (setas,
// ressalvas, quantificadores) é do revisor independente, como nas figuras de 16/10.
// Uso: node confere-lastro.js <pasta dos capítulos exportados> [id ...]
const fs = require('fs');
const path = require('path');
const L = require('./lib.js');
const pasta = process.argv[2];
if (!pasta) { console.error('uso: node confere-lastro.js <pasta dos capítulos> [id ...]'); process.exit(2); }
const so = process.argv.slice(3);
const norm = (s) => String(s || '').replace(/\s+/g, ' ').trim();
const semMd = (s) => norm(String(s || '').replace(/\*\*|__|`/g, ''));
const caps = {};
for (const f of fs.readdirSync(pasta)) { if (!f.endsWith('.json')) continue; const c = JSON.parse(fs.readFileSync(path.join(pasta, f), 'utf8')); caps[c.tema] = c; }
let falhas = 0;
for (const a of fs.readdirSync(path.join(__dirname, 'ilus')).filter((f) => f.endsWith('.js')).sort()) {
  const ilus = require(path.join(__dirname, 'ilus', a));
  if (so.length && !so.includes(ilus.id)) continue;
  const cap = caps[ilus.tema];
  const erros = [];
  if (!cap) { console.log('✗ ' + ilus.id + ': capítulo "' + ilus.tema + '" não encontrado na pasta'); falhas++; continue; }
  const texto = norm(cap.resumo), textoSem = semMd(cap.resumo);
  // O repositório é público e o texto dos capítulos não entra nele: o trecho longo vai
  // abreviado como "início … fim" (as primeiras e as últimas palavras), e basta achar o
  // início e, logo adiante, o fim. Trecho curto vai inteiro.
  const acha = (t) => {
    const [ini, fim] = norm(t).split(' … ');
    if (fim === undefined) return texto.indexOf(ini) >= 0;
    for (let i = texto.indexOf(ini); i >= 0; i = texto.indexOf(ini, i + 1)) { const j = texto.indexOf(fim, i + ini.length); if (j >= 0 && j - i < 900) return true; }
    return false;
  };
  (ilus.lastro || []).forEach((t) => { if (!acha(t)) erros.push('lastro fora do capítulo: "' + t.slice(0, 80) + '"'); });
  const n = texto.split(norm(ilus.depoisDe)).length - 1;
  if (n !== 1) erros.push('ponto de inserção aparece ' + n + ' vez(es): "' + ilus.depoisDe.slice(0, 60) + '"');
  // números da ilustração (texto visível do SVG)
  const svg = L.moldura(ilus, ilus.desenhar());
  const visivel = [...svg.matchAll(/<text[^>]*>([^<]*)<\/text>/g)].map((m) => m[1].replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')).join(' \n ');
  const nums = new Set((visivel.match(/\d+(?:[,.]\d+)?/g) || []).filter((x) => x.length > 0));
  const faltam = [...nums].filter((x) => !new RegExp('(^|[^\\d,.])' + x.replace(/[.,]/g, '[.,]') + '(?![\\d])').test(textoSem));
  if (faltam.length) erros.push('número na ilustração que não está no capítulo: ' + faltam.join(', '));
  if (erros.length) { falhas++; console.log('✗ ' + ilus.id); erros.forEach((e) => console.log('    ' + e)); }
  else console.log('✓ ' + ilus.id + ': ' + (ilus.lastro || []).length + ' trechos do lastro no capítulo; inserção única; ' + nums.size + ' número(s) conferido(s)');
}
process.exit(falhas ? 1 : 0);
