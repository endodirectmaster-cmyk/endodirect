#!/usr/bin/env node
// MAPA MENTAL: ABRE COM A RAIZ E OS RAMOS, TOCAR ABRE OS SEGUINTES, "EDITAR" NO TOPO (13/11/2026).
//
// Vídeo do professor no iPhone: "quando eu clico em um mapa mental, ele abre desfocado. A ideia é
// que ele abrisse já aparecendo todo o mapa mental. Como ele ia ficar muito pequeno, a letra, a
// minha ideia é que apenas o segundo ramo, até no máximo o segundo ramo, ficassem abertos. E à
// medida que você fosse clicando em cada caixa subsequente, fossem abrindo os ramos."
// E, logo depois: "A ideia seria um botão de 'editar' ao lado de 'Salvar'. Não ficaria aparecendo
// em cada caixa de texto. Normalmente sem clicar em editar, ao clicar na caixa de texto, abriria o
// nó subsequente."
// E, com print do mapa de Hipotireoidismo: "abrisse apenas o primeiro, no caso é o de
// hipotireoidismo, e os nós subsequentes, que é manifestação clínica, laboratório, só abrisse
// esses. E se o aluno quisesse, à medida que ele fosse clicando em uma dessas caixas, abririam os
// nós subsequentes."
//
// 🧨 Os modos de quebrar isto em silêncio:
//  - o mapa voltar a abrir sem encaixar na tela (num trecho do meio, sem a raiz);
//  - abrir com mais do que a raiz e os ramos principais (letra minúscula, mapa "desfocado");
//  - tocar numa caixa abrir o teclado (caixa editável) em vez de abrir os ramos dela;
//  - o botão de editar voltar para dentro de cada caixa, ou sumir do topo;
//  - remover uma caixa e o "aberto/fechado" das irmãs de baixo ficar trocado;
//  - linhas desenhadas para caixas escondidas (ramo fechado) riscando o mapa;
//  - fechar um nó e as linhas da raiz saírem do meio da tela (rolagem puxada no meio da medição);
//  - o editor do professor (fora da tela cheia) passar a fechar ramos ou travar a edição.
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
const declEstado = (html.match(/var mmAberto=\{\},mmAjustar=false,[^\n]*\n/) || [''])[0];
const declZoom = (html.match(/var MM_ZOOM_MIN=[\d.]+,MM_ZOOM_MAX=[\d.]+;/) || [''])[0];
ok('estado do mapa declarado (mmAberto, mmEditando, larguras)', /mmEditando=false/.test(declEstado) && /MM_LARGURAS=\['','mm-l1','mm-l2'\]/.test(declEstado));

// ── 1. O que abre por padrão e o deslocamento ao remover ─────────────────────────────────
{
  const ctx = { Object };
  vm.createContext(ctx);
  vm.runInContext(declEstado + ['mmLinhaAberta', 'mmDeslocaAberto'].map(corpo).join('\n'), ctx);
  const ab = (k) => vm.runInContext('mmLinhaAberta(' + JSON.stringify(k) + ')', ctx);
  ok('🧨 ramo principal abre FECHADO: o mapa abre só com a raiz e os ramos ("só abrisse esses")', ab('2') === false);
  ok('🧨 subramos e netos também abrem fechados', ab('2-1') === false && ab('2-1-0') === false);
  vm.runInContext("mmAberto={'2':false,'1-3':true}", ctx);
  ok('o que o aluno abriu ou fechou vale mais que o padrão', ab('2') === false && ab('1-3') === true);
  vm.runInContext("mmAberto={'1-0':true,'1-1':false,'1-2':true,'1-2-0':true,'1-3':true,'2-0':true,'1':false}", ctx);
  vm.runInContext("mmDeslocaAberto('1-1')", ctx);
  const est = JSON.parse(vm.runInContext('JSON.stringify(mmAberto)', ctx));
  ok('🧨 remover o subramo 1-1 sobe o estado das irmãs de baixo (1-2→1-1, 1-2-0→1-1-0, 1-3→1-2) e não mexe no resto (' + JSON.stringify(est) + ')',
    est['1-0'] === true && est['1-1'] === true && est['1-1-0'] === true && est['1-2'] === true && !('1-3' in est) && est['2-0'] === true && est['1'] === false);
  vm.runInContext("mmAberto={'0':false,'1':true,'2':false,'2-0':true}", ctx);
  vm.runInContext("mmDeslocaAberto('1')", ctx);
  const est2 = JSON.parse(vm.runInContext('JSON.stringify(mmAberto)', ctx));
  ok('remover o ramo 1 leva o estado do ramo 2 (e dos subramos dele) para o 1', est2['0'] === false && est2['1'] === false && est2['1-0'] === true && !('2' in est2));
}

// ── 2. O HTML do mapa: leitura × edição × editor do professor ────────────────────────────
function renderiza({ telaCheia, editando, aberto = {} }) {
  let capturado = '';
  const stage = { style: {}, set innerHTML(v) { capturado = v; }, get innerHTML() { return capturado; } };
  const editor = { style: { setProperty() {} }, classList: { add() {}, remove() {}, toggle() {}, contains() { return false; } }, addEventListener() {}, querySelector() { return null; }, querySelectorAll() { return []; } };
  const wrap = { scrollLeft: 0, scrollTop: 0, __scale: 1 };
  const ctx = {
    Object, Math, JSON, String, Array, parseInt, isNaN,
    curMM: {
      topic: 'Tema',
      data: { root: 'Raiz <b>', branches: [
        { label: 'Ramo A', leaves: [{ label: 'Sub A1', children: ['Neto 1', { label: 'Neto 2', children: ['Bisneto'] }] }, 'Sub A2'] },
        { label: 'Ramo B', leaves: ['Sub B1'] },
      ] },
    },
    BCOLORS: ['#8b5cf6', '#3b82f6'],
    normalizeMMData: (d) => d,
    drawMMConnections() {}, syncMMFromDOM() {}, setTimeout() {},
    document: {
      body: { classList: { contains: (c) => c === 'mm-tela-cheia' && telaCheia } },
      getElementById: (id) => ({ 'mm-svg': stage, 'mm-svg-wrap': wrap, 'mm-editor': editor })[id] || null,
      querySelectorAll() { return []; },
    },
    getComputedStyle: () => ({}),
  };
  vm.createContext(ctx);
  vm.runInContext(declZoom + declEstado + ['esc', 'mmHex2', 'mmMix', 'mmLeafStyle', 'mmLeitura', 'mmLinhaAberta', 'mmLeafHTML', 'mmAplicaEscala', 'mmFocaCaixa', 'mmMostra', 'renderMMEditor'].map(corpo).join('\n')
    + '\n' + (html.match(/var MM_BOTOES_EDITAR=[^\n]*\n/) || [''])[0], ctx);
  vm.runInContext('mmEditando=' + !!editando + ';mmAberto=' + JSON.stringify(aberto) + ';mmAjustar=false;renderMMEditor()', ctx);
  return capturado;
}
const linha = (h, k) => (h.match(new RegExp('<div class="(mm-(?:leaf|branch)-row[^"]*)"[^>]*data-mm-row="' + k + '"')) || [, ''])[1];
const ce = (h) => (h.match(/contenteditable="(true|false)"/g) || []).map((x) => x.slice(17, -1));
{
  const h = renderiza({ telaCheia: true, editando: false });
  ok('o HTML do mapa foi gerado (renderMMEditor rodou)', h.includes('data-mm-root') && h.includes('Raiz &lt;b&gt;'));
  ok('🧨 leitura: nenhuma caixa editável (tocar abre os ramos, não o teclado)', ce(h).length > 0 && ce(h).every((v) => v === 'false'));
  ok('🧨 leitura: os ramos principais vêm fechados (só raiz e ramos à vista), e o que vem abaixo também',
    /mm-fechado/.test(linha(h, '0')) && /mm-fechado/.test(linha(h, '1')) && /mm-fechado/.test(linha(h, '0-0')) && /mm-fechado/.test(linha(h, '0-0-1')));
  ok('🧨 sem "+N" ao lado das caixas (o professor pediu para tirar)', !/mm-qtd/.test(h) && !/>\+\d+</.test(h));
  ok('🧨 caixa com ramos para abrir é marcada (mm-tem-filhos); a última caixa não',
    /mm-tem-filhos/.test(linha(h, '0')) && /mm-tem-filhos/.test(linha(h, '0-0')) && /mm-tem-filhos/.test(linha(h, '0-0-1')) && !/mm-tem-filhos/.test(linha(h, '0-1')));
  ok('subramo sem filhos não leva "fechado"', !/mm-fechado/.test(linha(h, '0-1')));
  ok('🧨 nenhum botão de editar dentro das caixas ("não ficaria aparecendo em cada caixa")', !/class="mm-edit"/.test(h) && !/✏️/.test(h));
  const h2 = renderiza({ telaCheia: true, editando: false, aberto: { '0': true, '0-0': true, '1': false } });
  ok('o que o aluno abriu ou fechou sobrevive a um redesenho (+ ou ×)', !/mm-fechado/.test(linha(h2, '0')) && !/mm-fechado/.test(linha(h2, '0-0')) && /mm-fechado/.test(linha(h2, '1')));
  const he = renderiza({ telaCheia: true, editando: true });
  ok('🧨 "Editar" ligado: todas as caixas viram editáveis e o editor ganha mm-modo-edicao',
    ce(he).length > 0 && ce(he).every((v) => v === 'true') && /class="mm-editor[^"]*mm-modo-edicao/.test(he));
  const ha = renderiza({ telaCheia: false, editando: false });
  ok('🧨 editor do professor (fora da tela cheia): caixas editáveis como antes', ce(ha).length > 0 && ce(ha).every((v) => v === 'true') && !/mm-modo-edicao/.test(ha));
  ok('editor do professor mantém "+ subramo" e "+ Adicionar ramo"', /data-mmaddsub="0">\+ subramo</.test(ha) && /mm-add-branch" data-mmaddbranch>\+ Adicionar ramo/.test(ha));
}

// ── 3. O encaixe na tela, com um layout simulado ─────────────────────────────────────────
// Cada largura (normal, mm-l1, mm-l2) dá um tamanho ao mapa.
function encaixa(tamanhos) {
  const classes = new Set();
  const med = () => tamanhos[classes.has('mm-l2') ? 'mm-l2' : classes.has('mm-l1') ? 'mm-l1' : ''];
  const editor = {
    style: { setProperty() {} },
    classList: { add: (x) => classes.add(x), remove: (x) => classes.delete(x) },
    get offsetWidth() { return med()[0]; }, get offsetHeight() { return med()[1]; },
    querySelector: () => null, querySelectorAll: () => [],
  };
  const wrap = { clientWidth: 374, clientHeight: 802, scrollLeft: 50, scrollTop: 50 };
  const stage = { style: {} };
  const ctx = {
    Math, parseFloat, Object,
    document: { getElementById: (id) => ({ 'mm-svg-wrap': wrap, 'mm-editor': editor, 'mm-svg': stage })[id] || null },
    getComputedStyle: () => ({ paddingLeft: '0', paddingRight: '0', paddingTop: '0', paddingBottom: '0' }),
  };
  vm.createContext(ctx);
  vm.runInContext(declZoom + declEstado + ['mmAplicaEscala', 'mmMelhorLargura', 'mmEncaixa'].map(corpo).join('\n'), ctx);
  vm.runInContext('mmEncaixa()', ctx);
  return { wrap, stage, classes: [...classes], aberto: JSON.parse(vm.runInContext('JSON.stringify(mmAberto)', ctx)), larg: vm.runInContext('mmLarg', ctx) };
}
{
  const r = encaixa({ '': [900, 600], 'mm-l1': [600, 800], 'mm-l2': [480, 1000] });
  const sc = r.wrap.__scale;
  ok('🧨 o mapa aparece INTEIRO na tela (zoom ' + (sc && sc.toFixed(3)) + ', mapa ' + r.stage.style.width + ' × ' + r.stage.style.height + ' numa tela 374 × 802)',
    Math.abs(sc - 0.779) < 0.002 && parseFloat(r.stage.style.width) <= 374.5 && parseFloat(r.stage.style.height) <= 802.5);
  ok('🧨 escolhe a largura que deixa a letra maior (mm-l2 aqui)', r.larg === 'mm-l2' && r.classes.includes('mm-l2') && !r.classes.includes('mm-l1'));
  ok('abre do começo: rolagem zerada', r.wrap.scrollLeft === 0 && r.wrap.scrollTop === 0);
  ok('encaixar não abre nem fecha ramos (isso é só do toque)', Object.keys(r.aberto).length === 0);
  ok('a pinça pode afastar até o zoom do encaixe', r.wrap.__min <= 0.5);
  ok('🧨 nunca amplia além de 1× (raiz + ramos cabem no tamanho real)', encaixa({ '': [300, 400], 'mm-l1': [280, 420], 'mm-l2': [260, 440] }).wrap.__scale === 1);
  ok('mapa enorme: zoom não desce abaixo do mínimo do encaixe (0,3) e abre com a raiz à vista (meio da altura)',
    (() => { const x = encaixa({ '': [3000, 4000], 'mm-l1': [3000, 4000], 'mm-l2': [3000, 4000] }); return x.wrap.__scale === 0.3 && x.wrap.scrollTop === Math.max(0, (4000 * 0.3 - 802) / 2); })());
}

// ── 4. Tocar numa caixa: abre os ramos e a caixa fica parada na tela ─────────────────────
{
  const wrap = { scrollLeft: 0, scrollTop: 0, __scale: 0.8, getBoundingClientRect: () => ({ left: 0, top: 0, right: 2000, bottom: 2000 }) };
  const rowC = new Set(['mm-fechado']);
  // Abrir a linha empurra a caixa 60 px para baixo no layout (o mapa cresce e se recentra).
  const box = { getBoundingClientRect: () => { const dy = rowC.has('mm-fechado') ? 0 : 60; return { left: 100 - wrap.scrollLeft, right: 200 - wrap.scrollLeft, top: 300 + dy - wrap.scrollTop, bottom: 330 + dy - wrap.scrollTop }; } };
  const filhos = { getBoundingClientRect: () => ({ left: 230 - wrap.scrollLeft, right: 400 - wrap.scrollLeft, top: 280 - wrap.scrollTop, bottom: 420 - wrap.scrollTop }) };
  const row = { getAttribute: () => '1-0', querySelector: () => filhos, classList: { contains: (c) => rowC.has(c), toggle: (c, on) => (on ? rowC.add(c) : rowC.delete(c)) } };
  box.closest = () => row;
  let linhas = 0;
  const ctx = {
    Math, Object,
    document: { getElementById: (id) => ({ 'mm-svg-wrap': wrap, 'mm-editor': { offsetWidth: 500, offsetHeight: 700, style: { setProperty() {} } }, 'mm-svg': { style: {} } })[id] || null },
    drawMMConnections: () => { linhas++; },
  };
  vm.createContext(ctx);
  vm.runInContext(declEstado + ['mmAplicaEscala', 'mmMostra', 'mmAlterna'].map(corpo).join('\n'), ctx);
  const antes = box.getBoundingClientRect();
  ctx.__box = box;
  vm.runInContext('mmAlterna(__box)', ctx);
  const depois = box.getBoundingClientRect();
  ok('🧨 tocar numa caixa fechada abre os ramos dela', !rowC.has('mm-fechado') && vm.runInContext("mmAberto['1-0']", ctx) === true);
  ok('🧨 a caixa tocada fica parada na tela (antes ' + [antes.left, antes.top] + ', depois ' + [depois.left, depois.top] + ')', depois.left === antes.left && depois.top === antes.top);
  ok('as linhas são redesenhadas depois de abrir', linhas > 0);
  vm.runInContext('mmAlterna(__box)', ctx);
  ok('tocar de novo fecha', rowC.has('mm-fechado') && vm.runInContext("mmAberto['1-0']", ctx) === false);
}

// ── 4b. Fechar: as linhas acompanham a rolagem que o navegador puxa (14/11/2026) ─────────
// Print do professor ("quando eu abro um nó e fecho, está acontecendo isso daí, essa
// desconfiguração"): depois de fechar, as linhas da raiz saíam de um ponto no meio da tela e a
// raiz sumia. O SVG velho das linhas (largo, do ramo aberto) segurava a área rolável; ao ser
// redimensionado, o navegador puxava a rolagem para trás NO MEIO da medição, e o retângulo do
// editor lido antes não valia mais. Modelo: toda leitura de medida recalcula a rolagem dentro da
// área rolável de agora (o maior entre o editor e o SVG).
{
  const wrap = { clientWidth: 374, scrollLeft: 197, scrollTop: 0, __scale: 1 };
  const edW = 352; // o ramo acabou de fechar: o editor já encolheu, o SVG ainda tem 568
  const svg = { w: 568, style: {}, innerHTML: '', setAttribute(k, v) { if (k === 'width') this.w = +v; } };
  const layout = () => { wrap.scrollLeft = Math.max(0, Math.min(wrap.scrollLeft, Math.max(edW, svg.w) + 16 - wrap.clientWidth)); };
  const caixa = (dx, larg, top, alt) => ({ getBoundingClientRect() { layout(); const l = 16 - wrap.scrollLeft + dx; return { left: l, right: l + larg, top, bottom: top + alt, width: larg, height: alt }; } });
  const editor = Object.assign(caixa(0, edW, 100, 400), { get scrollWidth() { layout(); return edW; }, offsetWidth: edW, scrollHeight: 400, offsetHeight: 400 });
  const raiz = caixa(8, 160, 250, 80), ramo = caixa(194, 150, 120, 40);
  const linha = { querySelector: (s) => (/mm-subs-block/.test(s) ? { getClientRects: () => [] } : ramo) };
  const ctx = {
    Math, BCOLORS: ['#8b5cf6'],
    document: {
      getElementById: (id) => ({ 'mm-editor': editor, 'mm-conn-layer': svg, 'mm-svg-wrap': wrap })[id] || null,
      querySelector: (s) => (s === '[data-mm-root]' ? raiz : null),
      querySelectorAll: (s) => (s === '[data-mm-branch-row]' ? [linha] : []),
    },
  };
  vm.createContext(ctx);
  vm.runInContext(corpo('drawMMConnections'), ctx);
  vm.runInContext('drawMMConnections()', ctx);
  const n = (svg.innerHTML.match(/d="M([\d.-]+) [\d.-]+ C[^"]* ([\d.-]+) [\d.-]+"/) || []).slice(1).map(Number);
  ok('🧨 depois de fechar, a linha da raiz sai da borda da raiz (x 168) e chega ao ramo (x 194): saiu de ' + n.join(' a '),
    n.length === 2 && Math.abs(n[0] - 168) < 0.01 && Math.abs(n[1] - 194) < 0.01);
  ok('o SVG das linhas fica do tamanho do mapa fechado', svg.w === edW);
  const alt = corpo('mmAlterna');
  ok('🧨 ao tocar, as linhas são redesenhadas ANTES de segurar a caixa tocada no lugar (redesenhar depois puxava a rolagem de novo)',
    alt.indexOf('drawMMConnections()') > 0 && alt.indexOf('drawMMConnections()') < alt.indexOf('w.scrollLeft+=r1.left-r0.left'));
}

// ── 5. Ligações no código ────────────────────────────────────────────────────────────────
const render = corpo('renderMMEditor');
ok('🧨 sem "Editar", tocar na caixa abre/fecha os ramos; com "Editar", não (põe o cursor)',
  /if\(mmEditando\)return;[^\n]*\n\s*var box=t\.closest\('\[data-mm-branch\],\[data-mm-leaf\]'\);\s*if\(box\)mmAlterna\(box\);/.test(render));
ok('🧨 "mãozinha" só nas caixas com ramos para abrir (e não no modo de edição)',
  /body\.mm-tela-cheia \[data-mm-branch\],body\.mm-tela-cheia \[data-mm-leaf\]\{cursor:default;/.test(html)
  && /body\.mm-tela-cheia \.mm-editor:not\(\.mm-modo-edicao\) \.mm-tem-filhos>\.mm-node-wrap>\[data-mm-branch\],body\.mm-tela-cheia \.mm-editor:not\(\.mm-modo-edicao\) \.mm-tem-filhos>\.mm-node-wrap>\[data-mm-leaf\]\{cursor:pointer\}/.test(html));
ok('🧨 abrir um mapa (do professor, salvo ou novo) pede o encaixe', ['viewMM', 'viewMMShared', 'newBlankMM'].every((f) => /mmNovaAbertura\(\)/.test(corpo(f))));
ok('mapa novo, feito à mão, já abre no modo de edição', /mmNovaAbertura\(\);\s*mmEditando=true;mmBotaoEditar\(\);/.test(corpo('newBlankMM')));
ok('o editor do professor também começa do zero ao abrir', /mmNovaAbertura\(\);\s*renderMMEditor\(\);/.test(html));
ok('🧨 botão "✏️ Editar" no topo, ao lado de "Salvar"', /<button[^>]*id="btn-mm-editar"[^>]*>✏️ Editar<\/button><button[^>]*id="btn-mm-save"/.test(html));
ok('🧨 o botão liga e desliga o modo de edição', /getElementById\('btn-mm-editar'\)\.addEventListener\('click',function\(\)\{mmModoEdicao\(!mmEditando\);\}\)/.test(html));
ok('o botão diz o que faz: "✏️ Editar" ↔ "✓ Concluir"', /mmEditando\?'✓ Concluir':'✏️ Editar'/.test(corpo('mmBotaoEditar')));
ok('concluir a edição grava o texto no mapa (syncMMFromDOM)', /syncMMFromDOM\(\)/.test(corpo('mmModoEdicao')));
ok('o botão "Editar" só aparece na tela cheia', /\n\.mm-editar\{display:none\}/.test(html) && /body\.mm-tela-cheia \.mm-editar\{display:inline-flex/.test(html));
ok('🧨 esconder os filhos de um ramo fechado SÓ na tela cheia (o editor do professor mostra tudo)',
  /body\.mm-tela-cheia \.mm-fechado>\.mm-children/.test(html) && !/\n\.mm-fechado>/.test(html));
ok('🧨 ligações pulam caixas escondidas (ramo fechado)', /if\(!container\|\|!container\.getClientRects\(\)\.length\)return;/.test(corpo('drawMMConnections')));
ok('linha da raiz aos ramos visível no fundo azul-marinho (não é mais #1a2744)', !/stroke="#1a2744"/.test(corpo('drawMMConnections')));
ok('🧨 + cria a caixa e já põe o cursor nela; × leva o aberto/fechado das irmãs junto',
  /mmEditarDepois='\[data-mm-leaf="'\+pA\+'-'/.test(html) && /mmDeslocaAberto\(mmdl\.dataset\.mmdelleaf\)/.test(html) && /mmDeslocaAberto\(String\(parseInt\(mmdb\.dataset\.mmdelbranch,10\)\)\)/.test(html));
ok('virar o celular reencaixa, mas não com o cursor numa caixa', /a&&a\.isContentEditable/.test(html) && /w\.clientWidth===w\.__larg/.test(html));
// Print do professor (14/11/2026), na tela de Mapas Mentais: "Pode tirar essa legenda onde tem
// o mapa, entra com o tema." A dica "💡 O mapa abre com o tema e os ramos principais..." saiu.
ok('🧨 sem a legenda "💡 O mapa abre com o tema..." embaixo do campo Tema', !/class="mm-help"/.test(html) && !/O mapa abre com o tema e os ramos principais/.test(html));
ok('a pinça respeita o mínimo do encaixe', /Math\.max\(wrap\.__min\|\|MM_ZOOM_MIN,/.test(corpo('setupMMPinchZoom')));

ok('🧨 Voltar, Editar e Salvar maiores na tela cheia (pedido do professor: "ligeiramente maiores")',
  /body\.mm-tela-cheia #mm-live \.mm-live-head \.btn\{font-size:\.8rem;font-weight:600;padding:\.45rem \.8rem;min-height:36px;/.test(html)
  && /@media \(min-width:900px\)\{body\.mm-tela-cheia #mm-live \.mm-live-head \.btn\{font-size:\.88rem;padding:\.55rem 1\.05rem;min-height:40px\}/.test(html));

if (bad) { console.log('✗ abertura do mapa mental: ' + bad + ' falha(s)'); process.exit(1); }
console.log('✓ mapa mental: abre com a raiz e os ramos, encaixado; tocar abre os seguintes; "Editar" no topo');
