// Os dois blocos de PAGANTES EM RISCO nascem FECHADOS, e abrem no clique.
//
// O CASO (19/08/2026). O professor abriu Estudantes, viu 11 + 13 nomes empilhados
// empurrando o painel inteiro para baixo da dobra e disse: "Minimiza".
//
// ⚠️ O QUE PODE QUEBRAR EM SILÊNCIO, e é por isso que este teste existe:
//   1. o bloco voltar a nascer ABERTO — some com o resto do painel de novo;
//   2. a CONTAGEM sair do cabeçalho — fechado e sem número, o bloco deixa de
//      informar e vira só um traço na tela. O número é o que ele lê todo dia;
//   3. ⚠️⚠️ o estado de aberto viver no DOM. `admRiscoHTML()` é renderizado DUAS
//      vezes: uma com "Apurando risco…" e outra quando a RPC responde. Se o que
//      ele abriu morasse no DOM, fecharia sozinho meio segundo depois — sem erro
//      nenhum, e ele acharia que o clique não funcionou.
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { JSDOM, VirtualConsole } = require('jsdom');

const raiz = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(raiz, 'index.html'), 'utf8');
const falhas = [];
const ok = (cond, msg) => { if (!cond) falhas.push(msg); };

const bloco = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)]
  .map((m) => m[1]).find((s) => s.includes('function admRiscoHTML'));
if (!bloco) { console.error('✗ não achei admRiscoHTML no index.html'); process.exit(1); }
const corpo = bloco.replace(/^\s*\(function\(\)\{\s*/, '').replace(/\}\)\(\);?\s*$/, '');

const vc = new VirtualConsole(); vc.on('jsdomError', function () {});
const dom = new JSDOM('<body><div id="alvo"></div></body>',
  { runScripts: 'outside-only', virtualConsole: vc, url: 'https://www.endodirect.com.br/' });
const ctx = vm.createContext(dom.getInternalVMContext());
vm.runInContext('window.matchMedia=function(){return{matches:false,addListener:function(){},removeListener:function(){}};};', ctx);
try { vm.runInContext(corpo, ctx); } catch (e) { /* CDN ausente: esperado */ }

vm.runInContext(`
  esc = function (s) { return String(s == null ? '' : s); };
  admRiscoErr = '';
  admRiscoData = {
    total_pagantes: 37, pagantes_ativos_7d: 3,
    sem_uso_nenhum: [{ nome: 'Fulano de Tal', email: 'f@x.com', dias_desde_cadastro: 63, nunca_logou: false },
                     { nome: '', email: 'g@x.com', dias_desde_cadastro: 9, nunca_logou: true }],
    parou_cedo: [{ nome: 'Beltrana', email: 'b@x.com', dias_estudados: 1, ultimo_estudo: '2026-06-29' }]
  };
  document.getElementById('alvo').innerHTML = admRiscoHTML();
`, ctx);

const d = dom.window.document;
const cabSem = d.querySelector('[data-risco-tog="sem"]');
const cabCedo = d.querySelector('[data-risco-tog="cedo"]');
const bodySem = d.getElementById('risco-body-sem');
const bodyCedo = d.getElementById('risco-body-cedo');

// ── 1. nascem FECHADOS ──────────────────────────────────────────────────────
ok(!!cabSem && !!cabCedo, 'sumiu o cabeçalho clicável de um dos blocos de risco');
ok(!!bodySem && !!bodyCedo, 'sumiu o corpo colapsável de um dos blocos de risco');
if (bodySem) ok(bodySem.style.display === 'none',
  '⚠️ o bloco "nunca estudaram" nasceu ABERTO — era exatamente o que o professor pediu para minimizar');
if (bodyCedo) ok(bodyCedo.style.display === 'none',
  '⚠️ o bloco "estudaram uma vez e sumiram" nasceu ABERTO');

// ── 2. a CONTAGEM continua visível com tudo fechado ─────────────────────────
if (cabSem) ok(/\(2 de 37\)/.test(cabSem.textContent),
  '⚠️ a contagem saiu do cabeçalho — fechado e sem número, o bloco não informa nada');
if (cabCedo) ok(/\(1\)/.test(cabCedo.textContent), '⚠️ a contagem do 2º bloco saiu do cabeçalho');

// ── 3. os NOMES não aparecem enquanto está fechado ──────────────────────────
if (bodySem) ok(bodySem.textContent.indexOf('Fulano de Tal') >= 0,
  'o nome deveria estar no corpo (escondido), não fora dele');
if (cabSem) ok(cabSem.textContent.indexOf('Fulano de Tal') < 0,
  '⚠️ nome de aluno vazou para o cabeçalho — some o efeito de minimizar');

// ── 4. o CLIQUE abre, e o galho vira ────────────────────────────────────────
if (cabSem && bodySem) {
  cabSem.dispatchEvent(new dom.window.Event('click', { bubbles: true }));
  ok(bodySem.style.display !== 'none', '⚠️ o clique no cabeçalho não abriu a lista');
  const chev = cabSem.querySelector('[data-risco-chev]');
  ok(chev && chev.textContent === '▾', 'o indicador de aberto/fechado não acompanhou o clique');
  // e fecha de novo
  cabSem.dispatchEvent(new dom.window.Event('click', { bubbles: true }));
  ok(bodySem.style.display === 'none', 'o segundo clique não fechou de volta');
}

// ── 5. ⚠️ O ESTADO SOBREVIVE AO RE-RENDER (a armadilha real) ────────────────
// A RPC responde DEPOIS da 1ª pintura. Se o "aberto" morasse no DOM, o que ele
// acabou de abrir fecharia sozinho, e pareceria que o clique não pegou.
if (cabSem) {
  cabSem.dispatchEvent(new dom.window.Event('click', { bubbles: true }));   // abre
  vm.runInContext("document.getElementById('alvo').innerHTML = admRiscoHTML();", ctx);
  const novo = d.getElementById('risco-body-sem');
  ok(novo && novo.style.display !== 'none',
    '⚠️ o bloco que o professor abriu FECHOU sozinho ao re-renderizar — o estado não pode viver no DOM');
}

// ── 6. o estado é POR BLOCO, não global ─────────────────────────────────────
{
  const c2 = d.querySelector('[data-risco-tog="cedo"]');
  const b2 = d.getElementById('risco-body-cedo');
  if (c2 && b2) ok(b2.style.display === 'none',
    'abrir um bloco abriu o outro junto — o estado tem de ser por bloco');
}

if (falhas.length) {
  console.error('✗ blocos de risco minimizados:');
  falhas.forEach((f) => console.error('  - ' + f));
  process.exit(1);
}
console.log('✓ pagantes em risco: nascem fechados com a contagem à vista, abrem no clique e sobrevivem ao re-render');
