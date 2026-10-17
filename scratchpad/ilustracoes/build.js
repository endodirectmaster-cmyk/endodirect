'use strict';
// Gera os SVG das ilustrações (ilus/*.js) em figuras/resumos/ilustracoes/.
// Uso: node scratchpad/ilustracoes/build.js [id ...]   (sem id: todas)
const fs = require('fs');
const path = require('path');
const L = require('./lib.js');
const { slugify } = require('../figuras-resumos/render.js');
const RAIZ = path.join(__dirname, '..', '..');
const SAIDA = path.join(RAIZ, 'figuras', 'resumos', 'ilustracoes');
// O mesmo veto das figuras de 16/10: o SVG é servido como arquivo e pode ser aberto
// direto no navegador; nada de script, imagem externa, link ou CSS importado.
const PROIBIDO = ['<image', '<foreignobject', '<script', 'href=', 'xlink:', '@import', 'url(http', 'javascript:', '<style'];
const so = process.argv.slice(2);
fs.mkdirSync(SAIDA, { recursive: true });
const arqs = fs.readdirSync(path.join(__dirname, 'ilus')).filter((f) => f.endsWith('.js')).sort();
const feitos = [];
for (const a of arqs) {
  const ilus = require(path.join(__dirname, 'ilus', a));
  if (so.length && !so.includes(ilus.id)) continue;
  const svg = L.moldura(ilus, ilus.desenhar());
  const baixo = svg.toLowerCase();
  const veto = PROIBIDO.find((p) => baixo.includes(p));
  if (veto) throw new Error(ilus.id + ': elemento proibido no SVG: ' + veto);
  if (ilus.W > 820) throw new Error(ilus.id + ': mais largo que 820 px (a coluna do texto)');
  const nome = slugify(ilus.sub) + '--' + ilus.id + '.svg';
  fs.writeFileSync(path.join(SAIDA, nome), svg);
  feitos.push(path.join(SAIDA, nome));
  console.log('  · ' + nome + ' (' + ilus.W + '×' + ilus.H + ', ' + (svg.length / 1024).toFixed(1) + ' KB)');
}
module.exports = feitos;
if (require.main === module) fs.writeFileSync(path.join(__dirname, '.ultimos.txt'), feitos.join('\n'));
