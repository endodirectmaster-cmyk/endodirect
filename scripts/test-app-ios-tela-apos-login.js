#!/usr/bin/env node
// TELA PELA METADE DEPOIS DE ENTRAR, NO IPHONE (16/11/2026). Professor, com print do app: "quando eu
// desloguei da minha conta e abri na conta do aluno Pro ... quando entra pela primeira vez, fica desse
// jeito. Aí eu fecho o aplicativo, reabro, ele volta para o normal." O topo do painel ficou em branco e
// uma faixa cinza aparecia na beira esquerda.
//
// 🧨 Os modos de quebrar isto em silêncio:
//  - startApp mostrar o painel sem pedir o redesenho (telaRepintar) — a metade de cima volta a ficar
//    em branco no iPhone até fechar e abrir o app;
//  - telaRepintar não voltar ao topo, ou só redesenhar antes de iosDesfazZoom devolver a escala;
//  - o redesenho rodar fora do iPhone (no computador, à toa);
//  - o menu lateral fechado ficar perto demais da borda e a sombra dele vazar na tela.
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
let bad = 0;
const ok = (nome, cond, det) => { if (cond) return; bad++; console.log('  ✗ ' + nome + (det ? ' — ' + det : '')); };
function corpo(nome) {
  const ini = html.indexOf('\nfunction ' + nome + '(');
  if (ini < 0) { ok('achei function ' + nome, false); return ''; }
  let i = html.indexOf('{', ini), prof = 0, q = null;
  for (; i < html.length; i++) {
    const ch = html[i];
    if (q) { if (ch === '\\') { i++; continue; } if (ch === q) q = null; continue; }
    if (ch === "'" || ch === '"' || ch === '`') { q = ch; continue; }
    if (ch === '/' && html[i + 1] === '/') { i = html.indexOf('\n', i); continue; }
    if (ch === '{') prof++;
    else if (ch === '}') { prof--; if (prof === 0) break; }
  }
  return html.slice(ini + 1, i + 1);
}

// 1. startApp pede o redesenho logo depois de mostrar o painel (aluno e professor).
const sa = corpo('startApp');
const mostra = sa.indexOf("app.style.display=isAdmin?'block':'flex';"), pede = sa.indexOf('telaRepintar();');
ok('🧨 startApp redesenha a tela depois de mostrar o painel', mostra > 0 && pede > mostra, 'mostra ' + mostra + ', pede ' + pede);

// 2. Comportamento: volta ao topo, redesenha no quadro seguinte e depois de iosDesfazZoom (400 ms).
function roda(ios) {
  const ev = [], timers = [], quadros = [];
  const body = { style: { _d: '' }, get offsetHeight() { ev.push('mede'); return 1; } };
  Object.defineProperty(body.style, 'display', { get() { return this._d; }, set(v) { this._d = v; ev.push('display=' + v); } });
  const cx = {
    IOS_TOQUE: ios, document: { body }, window: { scrollTo: (x, y) => ev.push('topo ' + x + ',' + y) },
    requestAnimationFrame: (f) => quadros.push(f), setTimeout: (f, ms) => timers.push([ms, f]),
  };
  vm.createContext(cx);
  vm.runInContext(corpo('telaRepintar'), cx);
  cx.telaRepintar();
  return { ev, timers, quadros, body };
}
{
  const r = roda(true);
  ok('volta ao topo na hora', r.ev[0] === 'topo 0,0');
  while (r.quadros.length) r.quadros.shift()();
  ok('🧨 no quadro seguinte: topo e corpo desenhado de novo', r.ev.join('|') === 'topo 0,0|topo 0,0|display=none|mede|display=', r.ev.join('|'));
  ok('🧨 e de novo depois de o zoom ser devolvido (> 400 ms)', r.timers.length === 1 && r.timers[0][0] > 400);
  r.ev.length = 0; r.timers[0][1]();
  ok('o segundo redesenho também mede entre esconder e mostrar', r.ev.join('|') === 'display=none|mede|display=', r.ev.join('|'));
  ok('o corpo termina sem estilo próprio (volta ao da folha de estilo)', r.body.style.display === '');
  const zoom = corpo('iosDesfazZoom');
  ok('iosDesfazZoom devolve a escala em 400 ms (o redesenho vem depois)', /setTimeout\(function\(\)\{vp\.setAttribute\('content',orig\);\},400\)/.test(zoom));
}
{
  const r = roda(false);
  ok('fora do iPhone: só volta ao topo, sem redesenhar', r.ev.join('|') === 'topo 0,0' && !r.quadros.length && !r.timers.length, r.ev.join('|'));
}

// 3. Menu lateral do celular, fechado: longe o bastante da borda para a sombra não aparecer.
const sb = (html.match(/\n  \.sidebar\{width:min\(82vw,310px\)[^}]*\}/) || [''])[0];
const desl = (sb.match(/transform:translateX\(calc\(-100% - (\d+)px\)\)/) || [])[1];
const sombra = sb.match(/box-shadow:(\d+)px 0 (\d+)px/);
ok('🧨 menu fechado fica além da sombra (deslocamento ≥ alcance da sombra)', !!desl && !!sombra && +desl >= (+sombra[1] + +sombra[2]), 'deslocamento ' + desl + ', sombra ' + (sombra && sombra[0]));
ok('menu aberto continua na tela', /body\.mobile-nav-open \.sidebar\{transform:translateX\(0\)\}/.test(html));

if (bad) { console.log('✗ tela depois de entrar no iPhone: ' + bad + ' falha(s)'); process.exit(1); }
console.log('✓ tela depois de entrar no iPhone: volta ao topo e é redesenhada (no quadro seguinte e depois do zoom); sombra do menu fechado fora da tela');
