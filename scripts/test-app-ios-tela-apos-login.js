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

// 4. "Sair" no app recarrega a página limpa (2º print do professor: o painel aparecia aos poucos, ~3 s).
//    🧨 Não pode: recarregar no site; recarregar na trava do Face ID (a sessão tem de ficar); recarregar
//    com a sessão ainda guardada (a página entraria sozinha de novo); esperar para sempre pelo servidor.
async function sair(opts) {
  const ev = [], timers = [];
  const ls = Object.assign({ 'sb-abc-auth-token': '{}', 'endodirect_v1_x': '1', outra: '1' }, opts.ls || {});
  const cx = {
    confirm: () => opts.confirma !== false, isAppLoja: () => !!opts.app,
    doLogout: () => { ev.push('logout'); return !!opts.faceId; },
    localStorage: { get length() { return Object.keys(ls).length; }, key: (i) => Object.keys(ls)[i], removeItem: (k) => { delete ls[k]; } },
    window: { location: { pathname: '/', search: '?app=ios', replace: (u) => ev.push('recarrega ' + u) } },
    setTimeout: (f, ms) => timers.push([ms, f]), Promise,
  };
  vm.createContext(cx);
  vm.runInContext('var ultimoSair=null;\n' + ['confirmLogout', 'appRecomecarLimpo'].map(corpo).join('\n'), cx);
  if (opts.servidor) vm.runInContext('ultimoSair=new Promise(function(r){__fim=r;});', cx);
  cx.confirmLogout();
  await new Promise((r) => setImmediate(r));
  return { ev, timers, ls, cx };
}
(async () => {
  let r = await sair({ app: true, servidor: true });
  ok('app: sai e espera o servidor encerrar a sessão', r.ev.join('|') === 'logout');
  vm.runInContext('__fim()', r.cx); await new Promise((x) => setImmediate(x));
  ok('🧨 app: depois do servidor, recarrega a mesma página (com ?app=ios, sem #)', r.ev.join('|') === 'logout|recarrega /?app=ios', r.ev.join('|'));
  ok('🧨 a sessão sai do aparelho antes de recarregar; o resto fica', !('sb-abc-auth-token' in r.ls) && r.ls.outra === '1' && r.ls.endodirect_v1_x === '1');
  r.timers[0][1]();
  ok('recarrega uma vez só (servidor + prazo)', r.ev.filter((x) => /recarrega/.test(x)).length === 1);
  r = await sair({ app: true, servidor: true });
  ok('🧨 servidor mudo: recarrega no prazo (≤ 2 s)', r.timers.length === 1 && r.timers[0][0] <= 2000 && (r.timers[0][1](), /recarrega/.test(r.ev.join('|'))));
  r = await sair({ app: false });
  ok('🧨 site: "Sair" como sempre, sem recarregar', r.ev.join('|') === 'logout' && !r.timers.length);
  r = await sair({ app: true, faceId: true });
  ok('🧨 trava do Face ID: não recarrega (a sessão fica guardada para o rosto)', r.ev.join('|') === 'logout' && !r.timers.length && 'sb-abc-auth-token' in r.ls);
  r = await sair({ app: true, confirma: false });
  ok('"Cancelar" na pergunta: nada acontece', !r.ev.length);
  ok('🧨 doLogout guarda a promessa do signOut e diz se só travou', /ultimoSair=client\.auth\.signOut\(\)/.test(corpo('doLogout')) && /return travarFaceId;/.test(corpo('doLogout')));
  ok('na volta sem sessão, o app abre no login (e não na landing)', /if\(\(isAppLoja\(\)\|\|__pedeExcl\)&&__lsx&&__lsx\.style\.display!=='flex'\)showLoginScreen\(\);/.test(html));

  if (bad) { console.log('✗ tela depois de entrar no iPhone: ' + bad + ' falha(s)'); process.exit(1); }
  console.log('✓ tela depois de entrar no iPhone: volta ao topo e é redesenhada; "Sair" no app recarrega limpo (sem sessão, no prazo, nunca na trava do Face ID nem no site); sombra do menu fechado fora da tela');
})();
