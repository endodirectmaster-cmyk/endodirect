#!/usr/bin/env node
// MAPA MENTAL: A PINÇA AMPLIA EM VOLTA DOS DEDOS (13/11/2026).
//
// Vídeo do professor no iPhone: "Quando aproxime, fica desconfigurado". O zoom crescia a partir
// do canto superior esquerdo do mapa e não mexia na rolagem: o trecho que estava entre os dedos
// saía da tela a cada pinça (no Chromium, a caixa do meio foi de (396, 489) para (1134, 1113)).
// E, com o mapa ampliado, editar uma caixa redesenhava as linhas fora do lugar, porque as
// medidas da tela já vêm multiplicadas pelo zoom.
//
// 🧨 Os modos de quebrar isto em silêncio:
//  - a pinça voltar a ampliar a partir do canto (o ponto entre os dedos "foge");
//  - arrastar com dois dedos deixar de mover o mapa;
//  - o zoom passar dos limites (0,5× a 3×);
//  - as linhas voltarem a ser desenhadas sem dividir pelo zoom.
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
let bad = 0;
const ok = (n, c) => { if (!c) { bad++; console.log('  ✗ ' + n); } };

function corpo(nome) {
  const i = html.indexOf('function ' + nome + '(');
  if (i < 0) return '';
  let j = html.indexOf('{', i), n = 0;
  for (; j < html.length; j++) { if (html[j] === '{') n++; else if (html[j] === '}') { n--; if (!n) break; } }
  return html.slice(i, j + 1);
}

// ── A pinça, rodando, com um "layout" simulado ───────────────────────────────────────────
// O editor fica 10 px à direita e abaixo do canto da área rolável; a tela mostra o editor
// deslocado pela rolagem e multiplicado pelo zoom (como o navegador faz com transform: scale).
const ouvintes = {};
const wrap = {
  scrollLeft: 0, scrollTop: 0, __pz: false, __scale: 1,
  addEventListener(tipo, f) { ouvintes[tipo] = f; },
};
const editor = {
  offsetWidth: 1200, offsetHeight: 800, style: {},
  getBoundingClientRect() { return { left: 10 - wrap.scrollLeft, top: 110 - wrap.scrollTop }; },
};
const stage = { style: {} };
// requestAnimationFrame de verdade é assíncrono: guarda o quadro e roda depois do evento.
let fila = [];
const ctx = {
  Math,
  window: { requestAnimationFrame: (f) => { fila.push(f); return fila.length; } },
  document: { getElementById: (id) => ({ 'mm-svg-wrap': wrap, 'mm-editor': editor, 'mm-svg': stage })[id] || null },
};
vm.createContext(ctx);
const limites = (html.match(/var MM_ZOOM_MIN=[\d.]+,MM_ZOOM_MAX=[\d.]+;/) || [''])[0];
ok('limites do zoom declarados (MM_ZOOM_MIN/MM_ZOOM_MAX)', !!limites);
vm.runInContext(limites + '\n' + corpo('setupMMPinchZoom'), ctx);
vm.runInContext('setupMMPinchZoom()', ctx);
ok('a pinça escuta touchstart, touchmove, touchend e touchcancel',
  ['touchstart', 'touchmove', 'touchend', 'touchcancel'].every((t) => typeof ouvintes[t] === 'function'));
ok('Safari: gesturestart/gesturechange bloqueados no mapa', typeof ouvintes.gesturestart === 'function' && typeof ouvintes.gesturechange === 'function');

const toque = (tipo, pts) => {
  let parou = false;
  ouvintes[tipo]({ touches: pts.map(([x, y]) => ({ clientX: x, clientY: y })), preventDefault() { parou = true; } });
  const q = fila; fila = []; q.forEach((f) => f()); // o quadro roda
  return parou;
};
const escala = () => wrap.__scale;
// Ponto do mapa (sem zoom) que está sob a tela em (x, y).
const pontoSob = (x, y) => { const r = editor.getBoundingClientRect(); return [(x - r.left) / escala(), (y - r.top) / escala()]; };

const M = [200, 400];
const alvo = pontoSob(...M);
ok('touchstart com dois dedos impede o zoom da página', toque('touchstart', [[160, 400], [240, 400]]));
toque('touchmove', [[120, 400], [280, 400]]); // distância 80 → 160
ok('🧨 a pinça dobra o zoom quando a distância entre os dedos dobra (veio ' + escala() + ')', Math.abs(escala() - 2) < 1e-9);
const depois = pontoSob(...M);
ok('🧨 o ponto que estava entre os dedos continua entre os dedos (antes ' + alvo + ', depois ' + depois.map((v) => +v.toFixed(3)) + ')',
  Math.abs(depois[0] - alvo[0]) < 1e-6 && Math.abs(depois[1] - alvo[1]) < 1e-6);
ok('o editor recebe transform: scale com origem no canto', editor.style.transform === 'scale(2)' && editor.style.transformOrigin === '0 0');
ok('a área de rolagem cresce com o zoom', stage.style.width === '2400px' && stage.style.height === '1600px');

// Arrastar os dois dedos juntos, sem mudar a distância, move o mapa junto.
toque('touchmove', [[70, 340], [230, 340]]); // meio passa de (200,400) para (150,340)
const pan = pontoSob(150, 340);
ok('🧨 arrastar com dois dedos leva o mapa junto', Math.abs(pan[0] - alvo[0]) < 1e-6 && Math.abs(pan[1] - alvo[1]) < 1e-6 && Math.abs(escala() - 2) < 1e-9);

toque('touchmove', [[0, 340], [2000, 340]]);
ok('zoom máximo 3×', escala() === 3);
toque('touchend', [[0, 340]]);
toque('touchstart', [[100, 300], [300, 300]]);
toque('touchmove', [[199, 300], [201, 300]]);
ok('zoom mínimo 0,5×', escala() === 0.5);
toque('touchcancel', []);
const antes = escala();
toque('touchmove', [[0, 0], [900, 0]]);
ok('depois de soltar, um toque solto não mexe no zoom', escala() === antes);

// ── As linhas do mapa ampliado ───────────────────────────────────────────────────────────
const linhas = corpo('drawMMConnections');
ok('🧨 drawMMConnections lê o zoom da pinça', /__scale/.test(linhas));
ok('🧨 drawMMConnections divide as medidas da tela pelo zoom',
  /sx=\(cr\.right-er\.left\)\/zs/.test(linhas) && /l:\(r\.left-er\.left\)\/zs/.test(linhas) && /m:\(r\.top-er\.top\+r\.height\/2\)\/zs/.test(linhas));

if (bad) { console.log('✗ pinça do mapa mental: ' + bad + ' falha(s)'); process.exit(1); }
console.log('✓ pinça do mapa mental: amplia em volta dos dedos, arrasta, respeita 0,5×–3× e as linhas seguem as caixas');
