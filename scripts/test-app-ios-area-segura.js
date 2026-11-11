#!/usr/bin/env node
// ÁREA SEGURA DO IPHONE NO APP (11/11/2026).
//
// O app do iPhone (app-ios/, Capacitor, contentInset "never") desenha o site por baixo
// da barra do relógio e da bateria. No 1º teste pelo TestFlight o professor não conseguia
// tocar no ☰ do painel: a barra do topo começava em y=0, atrás do relógio.
//
// 🧨 Os modos de quebrar isto em silêncio:
//  - tirar viewport-fit=cover (sem ele, env(safe-area-inset-*) vale 0 e nada desce);
//  - reescrever o `padding` das barras do topo sem o env(safe-area-inset-top) (o
//    atalho `padding:0 ...` zera o recuo de cima);
//  - tirar a faixa escura do relógio ou o texto claro do relógio no Info.plist (o
//    relógio some sobre o fundo escuro, ou o conteúdo rola por baixo dele);
//  - mudar o contentInset do Capacitor sem rever estas regras.
'use strict';
const fs = require('fs');
const path = require('path');
const RAIZ = path.join(__dirname, '..');

let bad = 0;
const ok = (nome, cond, det) => { if (cond) return; bad++; console.log('  ✗ ' + nome + (det ? ' — ' + det : '')); };

const html = fs.readFileSync(path.join(RAIZ, 'index.html'), 'utf8');
const css = (html.match(/<style[^>]*>([\s\S]*?)<\/style>/) || [])[1] || '';
const ENV_TOP = /env\(safe-area-inset-top(,0px)?\)/;

// Todas as regras de um seletor exato, na ordem do CSS (inclui as de @media).
const regras = (sel) => {
  const esc = sel.replace(/[.*+?^${}()|[\]\\#]/g, '\\$&');
  return [...css.matchAll(new RegExp('(?:^|[}\\n])\\s*' + esc + '\\{([^}]*)\\}', 'g'))].map((m) => m[1]);
};
// O `padding` de cima de uma declaração (atalho ou padding-top).
const paddingTop = (corpo) => {
  const pt = (corpo.match(/(?:^|;)padding-top:([^;]+)/) || [])[1];
  if (pt) return pt;
  const p = (corpo.match(/(?:^|;)padding:([^;]+)/) || [])[1];
  if (!p) return null;
  const partes = p.trim().match(/(?:max|min|calc|env)\([^()]*(?:\([^()]*\)[^()]*)*\)|\S+/g) || [];
  return partes[0];
};

ok('🧨 viewport-fit=cover no <meta viewport>', /<meta name="viewport" content="[^"]*viewport-fit=cover/.test(html));

// ---- 1. barras do topo ---------------------------------------------------------------------
[['.topbar', 'barra do aluno'], ['#panel-adm .adm-topbar', 'barra do painel do professor']].forEach(([sel, nome]) => {
  const rs = regras(sel);
  ok(nome + ': regras encontradas', rs.length >= 2, sel);
  rs.forEach((r, i) => {
    const temPadding = /(?:^|;)padding(-top)?:/.test(r);
    if (temPadding) {
      ok('🧨 ' + nome + ' (regra ' + (i + 1) + '): padding de cima pelo recuo do relógio', ENV_TOP.test(paddingTop(r) || ''), r.slice(0, 140));
    }
    const altura = (r.match(/(?:^|;)(min-)?height:([^;]+)/g) || []).filter((h) => !/:auto$/.test(h));
    altura.forEach((h) => ok(nome + ' (regra ' + (i + 1) + '): a altura soma o recuo', ENV_TOP.test(h), h));
  });
});

// ---- 2. laterais e janela da Questão do Dia ----------------------------------------------------
ok('🧨 lateral do painel do professor desce pelo recuo', regras('#panel-adm .adm-sidebar').some((r) => /padding-top:env\(safe-area-inset-top/.test(r)));
ok('lateral do aluno desce pelo recuo', regras('.sidebar').some((r) => ENV_TOP.test(paddingTop(r) || '')));
ok('janela da Questão do Dia respeita o recuo', regras('.qotd-overlay').some((r) => ENV_TOP.test(paddingTop(r) || '')));
ok('tela de entrada respeita o recuo no celular', regras('#login-screen').some((r) => ENV_TOP.test(paddingTop(r) || '')));

// ---- 3. faixa do relógio -----------------------------------------------------------------------
const faixa = regras('body::after').join(';');
ok('🧨 faixa fixa do relógio com a altura do recuo', /position:fixed/.test(faixa) && /top:0/.test(faixa) && /height:env\(safe-area-inset-top/.test(faixa) && /pointer-events:none/.test(faixa), faixa.slice(0, 160));
const z = Number((faixa.match(/z-index:(\d+)/) || [])[1]);
ok('faixa acima do conteúdo e das janelas (900) e abaixo da tela de entrada (1000)', z > 900 && z < 1000, 'z-index ' + z);
ok('faixa escura também no tema claro (o relógio é claro)', /html\[data-theme="light"\] body::after\{background:#1a2744\}/.test(css));

// ---- 4. app nativo -------------------------------------------------------------------------------
const cap = JSON.parse(fs.readFileSync(path.join(RAIZ, 'app-ios', 'capacitor.config.json'), 'utf8'));
ok('🧨 Capacitor com contentInset "never" (estas regras supõem o site sob o relógio)', cap.ios && cap.ios.contentInset === 'never', JSON.stringify(cap.ios));
const plist = fs.readFileSync(path.join(RAIZ, 'app-ios', 'ios', 'App', 'App', 'Info.plist'), 'utf8');
ok('🧨 relógio com texto claro (UIStatusBarStyleLightContent)', /<key>UIStatusBarStyle<\/key>\s*<string>UIStatusBarStyleLightContent<\/string>/.test(plist));

if (bad) { console.log('\n' + bad + ' falha(s): área segura do iPhone no app'); process.exit(1); }
console.log('área segura do iPhone: barras do topo, laterais e faixa do relógio abaixo do relógio: ok');
