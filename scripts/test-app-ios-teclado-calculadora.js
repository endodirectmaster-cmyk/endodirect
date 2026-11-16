#!/usr/bin/env node
// TECLADO NUMÉRICO NA CALCULADORA DE REGANHO DA MAYO, NO APP DO IPHONE (16/11/2026).
//
// Professor, com prints da calculadora aberta no app: "Deixar teclado numérico". A calculadora é
// o site dos autores (glp1regainrisk.com) num quadro dentro do Endodirect; os campos são
// <input type="number"> sem inputmode, e o iPhone abre o teclado de números e símbolos. O site
// não deixa mexer de fora (outro domínio); o app, sim: um WKUserScript em todos os quadros
// (AppViewController.swift) que só age nesse site.
//
// 🧨 Os modos de quebrar isto em silêncio:
//  - forMainFrameOnly: true (o script não entra no quadro da calculadora);
//  - tirar a troca da vírgula: no iPhone em português o teclado decimal tem vírgula, e o site lê
//    o campo com parseFloat — "98,5" viraria 98 sem aviso;
//  - registrar o ouvinte sem captura: o do site (no próprio campo) leria antes da troca;
//  - não copiar o estilo do site para os campos que viram texto (ficariam sem borda);
//  - mudar o endereço da calculadora no index.html sem mudar o domínio do script.
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const RAIZ = path.join(__dirname, '..');

let bad = 0;
const ok = (nome, cond, det) => { if (cond) return; bad++; console.log('  ✗ ' + nome + (det ? ' — ' + det : '')); };

const sw = fs.readFileSync(path.join(RAIZ, 'app-ios', 'ios', 'App', 'App', 'AppViewController.swift'), 'utf8');
const html = fs.readFileSync(path.join(RAIZ, 'index.html'), 'utf8');

// ── 1. Swift ─────────────────────────────────────────────────────────────────
ok('import WebKit', /^import WebKit$/m.test(sw));
const did = (sw.match(/override open func capacitorDidLoad\(\) \{([\s\S]*?)\n    \}/) || [])[1] || '';
ok('o plugin do Entrar com a Apple continua registrado', /registerPluginInstance\(AppleSignInPlugin\(\)\)/.test(did));
ok('🧨 script em todos os quadros (forMainFrameOnly: false)', /WKUserScript\(source: AppViewController\.tecladoNumericoCalculadora,\s*injectionTime: \.atDocumentEnd, forMainFrameOnly: false\)/.test(did), did.trim().slice(0, 200));
ok('script adicionado ao userContentController do webView', /webView\?\.configuration\.userContentController\.addUserScript\(teclado\)/.test(did));

const ini = sw.indexOf('#"""\n'), fim = sw.indexOf('\n"""#');
ok('fonte do script em string bruta #"""…"""#', ini > 0 && fim > ini);
const JS = sw.slice(ini + 5, fim);
try { new vm.Script(JS); } catch (e) { ok('🧨 o script não compila: ' + e.message, false); }

// ── 2. o domínio do script é o da calculadora no index.html ──────────────────
const link = (html.match(/link:'(https:\/\/[^']*glp1regainrisk[^']*)'/) || [])[1] || '';
ok('🧨 a calculadora do index.html continua em glp1regainrisk.com', !!link, 'link não encontrado');
ok('o script testa exatamente esse domínio', JS.indexOf('glp1regainrisk\\.com') > 0);

// ── 3. comportamento, num DOM mínimo ─────────────────────────────────────────
function monta(host) {
  const ouvintes = [];
  const campo = (id, step) => {
    const at = { type: 'number', step };
    return { id, value: '', getAttribute: (k) => (k in at ? at[k] : null), setAttribute: (k, v) => { at[k] = String(v); }, get type() { return at.type; }, _at: at };
  };
  const campos = [campo('wt', '0.5'), campo('ht_cm', '0.5'), campo('age', '1'), campo('dur', '1'), campo('nadir', '0.5'), campo('wt3', '0.5'), campo('ht_ft', '1')];
  const regras = [
    { selectorText: '.nrow input[type="number"]', cssText: '.nrow input[type="number"] { border: 1px solid red; }' },
    { selectorText: '.nrow input[type="number"]:focus', cssText: '.nrow input[type="number"]:focus { outline: 0px; }' },
    { selectorText: '.radios input', cssText: '.radios input { width: 15px; }' },
  ];
  const folha = { cssRules: regras, insertRule: (t, i) => { regras.splice(i, 0, { selectorText: t.split('{')[0].trim(), cssText: t }); } };
  const document = {
    readyState: 'complete', styleSheets: [folha],
    querySelectorAll: (sel) => {
      if (sel === 'input[type="number"]') return campos.filter((c) => c._at.type === 'number');
      const m = sel.match(/^input\[([a-z-]+)\]$/); if (m) return campos.filter((c) => m[1] in c._at);
      return [];
    },
    addEventListener: (tipo, fn, cap) => ouvintes.push({ tipo, fn, cap }),
  };
  const window = {};
  const cx = { window, document, location: { hostname: host }, String, RegExp };
  vm.createContext(cx);
  return { cx, campos, regras, ouvintes, roda: () => vm.runInContext(JS, cx) };
}
const pega = (a, id) => a.campos.find((c) => c.id === id);

{ // outro site: nada muda
  const a = monta('www.endodirect.com.br'); a.roda();
  ok('fora da calculadora o script não mexe em nada', a.campos.every((c) => c._at.type === 'number' && !('inputmode' in c._at)) && a.ouvintes.length === 0);
}
for (const host of ['glp1regainrisk.com', 'www.glp1regainrisk.com']) {
  const a = monta(host); a.roda();
  ok(host + ': idade e meses com teclado só de algarismos (numeric), ainda number', ['age', 'dur', 'ht_ft'].every((id) => pega(a, id)._at.inputmode === 'numeric' && pega(a, id)._at.type === 'number'));
  ok(host + ': peso e altura com teclado decimal, como texto', ['wt', 'ht_cm', 'nadir', 'wt3'].every((id) => pega(a, id)._at.inputmode === 'decimal' && pega(a, id)._at.type === 'text' && pega(a, id)._at['data-endodirect-decimal'] === '1'));
  ok(host + ': estilo do site copiado para os campos que viraram texto', a.regras.some((r) => r.cssText === '.nrow input[data-endodirect-decimal] { border: 1px solid red; }') && a.regras.some((r) => /input\[data-endodirect-decimal\]:focus/.test(r.cssText)));
  const ouv = a.ouvintes.find((o) => o.tipo === 'input');
  ok(host + ': 🧨 ouvinte de input em captura no document', !!ouv && ouv.cap === true);
  if (ouv) {
    const wt = pega(a, 'wt');
    const casos = [['98,5', '98.5'], ['98.5', '98.5'], ['1,2,3', '1.23'], ['98,', '98.'], ['abc', ''], ['12 kg', '12']];
    for (const [entra, sai] of casos) { wt.value = entra; ouv.fn({ target: wt }); ok(host + ': "' + entra + '" vira "' + sai + '"', wt.value === sai, 'saiu "' + wt.value + '"'); }
    const age = pega(a, 'age'); age.value = '45'; ouv.fn({ target: age });
    ok(host + ': campo inteiro não é tocado pelo ouvinte', age.value === '45');
  }
  const n = a.regras.length; a.roda();
  ok(host + ': rodar duas vezes não duplica nada', a.regras.length === n && a.ouvintes.length === 1);
}

if (bad) { console.log('✗ teclado numérico da calculadora no app do iPhone: ' + bad + ' falha(s)'); process.exit(1); }
console.log('✓ teclado numérico da calculadora no app do iPhone: só no site da Mayo, vírgula vira ponto antes da leitura, estilo mantido');
