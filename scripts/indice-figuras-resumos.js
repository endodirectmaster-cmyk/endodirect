// Índice do TEXTO dos esquemas dos Resumos: figuras/resumos/textos.json.
//
// A figura do comentário da Questão do Dia (21/10/2026) é escolhida pela legenda.
// O esquema de cada capítulo (campo `figuras`) chega ao app só com o TÍTULO, e o que
// decide a escolha está dentro do desenho: a meta de renina no esquema de Conn
// ("APR > 1 ng/mL/h"), o K ≤ 4,8 da finerenona, a CAD euglicêmica. Na simulação com
// as questões reais, as duas figuras certas que ficaram de fora eram esquemas que
// só tinham o título. Este índice leva os rótulos de cada SVG ao app, sem baixar os
// 116 desenhos: { "<caminho a partir de figuras/resumos>": "rótulo · rótulo · …" }.
//
// Uso: node scripts/indice-figuras-resumos.js           (regrava o índice)
//      node scripts/indice-figuras-resumos.js --check   (falha se estiver desatualizado)
'use strict';
const fs = require('fs');
const path = require('path');

const DIR = path.join(__dirname, '..', 'figuras', 'resumos');
const SAIDA = path.join(DIR, 'textos.json');
const TETO = 900; // caracteres por figura: o bastante para a escolha, sem inflar o índice

function desescapa(s) {
  return s.replace(/&#x([0-9a-f]+);/gi, (m, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (m, d) => String.fromCodePoint(parseInt(d, 10)))
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, '&');
}
function textoDoSvg(svg) {
  const vistos = new Set(), partes = [];
  for (const m of svg.matchAll(/<text\b[^>]*>([\s\S]*?)<\/text>/g)) {
    const t = desescapa(m[1].replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
    if (t && !vistos.has(t)) { vistos.add(t); partes.push(t); }
  }
  let out = partes.join(' · ');
  if (out.length > TETO) out = out.slice(0, TETO).replace(/\s+\S*$/, '') + '…';
  return out;
}
function monta() {
  const idx = {};
  const varre = (rel) => {
    const abs = path.join(DIR, rel);
    fs.readdirSync(abs, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name)).forEach((e) => {
      const r = rel ? rel + '/' + e.name : e.name;
      if (e.isDirectory()) varre(r);
      else if (/\.svg$/i.test(e.name)) {
        const t = textoDoSvg(fs.readFileSync(path.join(DIR, r), 'utf8'));
        if (t) idx[r] = t;
      }
    });
  };
  varre('');
  return JSON.stringify(idx, null, 1) + '\n';
}

const novo = monta();
if (process.argv.includes('--check')) {
  const atual = fs.existsSync(SAIDA) ? fs.readFileSync(SAIDA, 'utf8') : '';
  if (atual !== novo) {
    console.error('✗ figuras/resumos/textos.json desatualizado: rode `node scripts/indice-figuras-resumos.js` e commite.');
    process.exit(1);
  }
  console.log('✓ índice do texto dos esquemas dos Resumos em dia (' + Object.keys(JSON.parse(novo)).length + ' figuras)');
} else {
  fs.writeFileSync(SAIDA, novo);
  console.log('gravado ' + path.relative(path.join(__dirname, '..'), SAIDA) + ': ' + Object.keys(JSON.parse(novo)).length + ' figuras, ' + novo.length + ' caracteres');
}
