'use strict';
// Galeria de revisão: todas as figuras geradas, agrupadas por subespecialidade, com
// o tema do capítulo e o tipo da figura. Uso: node galeria.js <saida.html> [pasta dos svg]
const fs = require('fs');
const path = require('path');
const saida = process.argv[2];
const svgDir = process.argv[3] || path.join(__dirname, '..', '..', 'figuras', 'resumos');
const specDir = path.join(__dirname, 'specs');
const ORD = ['Endocrinologia Básica', 'Diabetes', 'Tireoide', 'Adrenal', 'Obesidade', 'Lípides', 'Osteometabolismo', 'Neuroendocrinologia', 'Endocrinologia Feminina', 'Endocrinologia Masculina', 'Transgeneridade', 'Endocrinologia Pediátrica', 'Endocrinologia do Esporte', 'Endocrinopatias'];
const { slugDe } = require('./render.js');
const specs = fs.readdirSync(specDir).filter((f) => f.endsWith('.json')).map((f) => JSON.parse(fs.readFileSync(path.join(specDir, f), 'utf8')));
specs.sort((a, b) => (ORD.indexOf(a.sub) - ORD.indexOf(b.sub)) || String(a.tema).localeCompare(String(b.tema), 'pt'));
const esc = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
let html = '<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Figuras dos Resumos</title><style>body{margin:0;background:#0f172a;color:#e2e8f0;font-family:-apple-system,"Segoe UI",Roboto,Helvetica,Arial,sans-serif}main{max-width:980px;margin:0 auto;padding:24px 16px}h1{font-size:1.4rem}h2{font-size:1.05rem;margin:2rem 0 .6rem;color:#d9b652;text-transform:uppercase;letter-spacing:.05em}figure{margin:0 0 1.6rem;background:#16233f;border-radius:14px;padding:14px}figcaption{font-size:.85rem;color:#cbd5e1;margin-bottom:.5rem}figcaption b{color:#fff}figure img{width:100%;height:auto;border-radius:10px;background:#fff}.tipo{font-size:.7rem;color:#94a3b8;margin-left:.4rem}nav{font-size:.8rem;line-height:1.9}nav a{color:#93c5fd;margin-right:.7rem}</style></head><body><main><h1>Figuras didáticas dos Resumos · ' + specs.length + ' capítulos</h1><nav>' + ORD.filter((s) => specs.some((x) => x.sub === s)).map((s) => '<a href="#' + esc(s) + '">' + esc(s) + ' (' + specs.filter((x) => x.sub === s).length + ')</a>').join('') + '</nav>';
let sub = '';
specs.forEach((sp) => {
  if (sp.sub !== sub) { sub = sp.sub; html += '<h2 id="' + esc(sub) + '">' + esc(sub) + '</h2>'; }
  const slug = slugDe(sp);
  const arq = path.join(svgDir, slug + '.svg');
  const svg = fs.existsSync(arq) ? fs.readFileSync(arq, 'utf8') : '';
  html += '<figure><figcaption><b>' + esc(sp.tema) + '</b> — ' + esc(sp.titulo) + '<span class="tipo">' + esc(sp.tipo) + '</span></figcaption>' + (svg ? '<img alt="' + esc(sp.titulo) + '" src="data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg) + '">' : '<p>(sem SVG)</p>') + '</figure>';
});
html += '</main></body></html>';
fs.writeFileSync(saida, html);
console.log('galeria: ' + specs.length + ' figuras → ' + saida + ' (' + (html.length / 1024).toFixed(0) + ' kB)');
