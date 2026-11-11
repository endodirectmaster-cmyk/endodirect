#!/usr/bin/env node
// AVANÇAR/VOLTAR DESLIZANDO (11/11/2026).
//
// O professor mandou um vídeo das abas de um prontuário: ao avançar, o conteúdo atual
// sai pela esquerda e o novo entra pela direita; ao voltar, o contrário. Aprovou nestes
// lugares: Simulado (Anterior/Próxima e a grade de questões), Flashcards (sessão de
// estudo e os flashcards das Diretrizes/Resumos), Caderno de erros (Próxima) e as abas
// do Banco de questões e da Prescrição (a marca azul da aba acompanha). Os paginadores
// de lista ficam de fora.
//
// 🧨 Os modos de quebrar isto em silêncio:
//  - animar para quem pediu "reduzir movimento" no aparelho;
//  - a cópia do conteúdo que sai levar id ou name (getElementById acharia a cópia, e um
//    rádio copiado desmarcaria o original);
//  - a cópia sobrar na tela (cliques rápidos seguidos, ou o fim da sessão no meio);
//  - a direção invertida (avançar empurrando para a direita);
//  - um dos lugares perder o palco ou a ligação (volta a troca seca sem ninguém notar);
//  - o flashcard novo mostrar a resposta durante o "desvirar".
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const RAIZ = path.join(__dirname, '..');

let bad = 0;
const ok = (nome, cond, det) => { if (cond) return; bad++; console.log('  ✗ ' + nome + (det ? ' — ' + det : '')); };
const html = fs.readFileSync(path.join(RAIZ, 'index.html'), 'utf8');

// ---- 1. o motor, num DOM de mentira ---------------------------------------------------------
const ini = html.indexOf('var DESL_MS=');
const fim = html.indexOf('function renderStudyCard(){', ini);
ok('bloco do motor encontrado', ini > 0 && fim > ini);
const motor = html.slice(ini, fim);
const ms = +((motor.match(/var DESL_MS=(\d+)/) || [])[1] || 0);
ok('duração curta (0,2 a 0,32 s): o clique de estudo se repete muito', ms >= 200 && ms <= 320, String(ms));

class El {
  constructor(tag, attrs) {
    this.tagName = tag; this.attrs = Object.assign({}, attrs || {}); this.children = []; this.parentNode = null; this.style = {};
    this.cls = new Set(String(this.attrs.class || '').split(' ').filter(Boolean)); delete this.attrs.class;
    this.value = ''; this.checked = false; this.type = this.attrs.type || '';
    this.rect = { left: 10, top: 20, width: 300, height: 120 }; this.anims = []; this.visivel = true;
  }
  get id() { return this.attrs.id || ''; }
  get classList() { const s = this.cls; return { add: (c) => s.add(c), remove: (c) => s.delete(c), contains: (c) => s.has(c) }; }
  removeAttribute(k) { delete this.attrs[k]; }
  setAttribute(k, v) { this.attrs[k] = String(v); }
  appendChild(c) { if (c.parentNode) c.parentNode.removeChild(c); c.parentNode = this; this.children.push(c); return c; }
  removeChild(c) { this.children = this.children.filter((x) => x !== c); c.parentNode = null; }
  todos() { return this.children.reduce((a, c) => a.concat([c], c.todos()), []); }
  querySelectorAll(sel) {
    const d = this.todos();
    if (sel === '[id]') return d.filter((e) => 'id' in e.attrs);
    if (sel === '[name]') return d.filter((e) => 'name' in e.attrs);
    if (sel === 'input,select,textarea') return d.filter((e) => ['input', 'select', 'textarea'].includes(e.tagName));
    throw new Error('seletor não previsto no teste: ' + sel);
  }
  // Como no navegador: a cópia leva os atributos, não o que foi digitado.
  cloneNode() { const c = new El(this.tagName, this.attrs); c.cls = new Set(this.cls); c.type = this.type; c.rect = Object.assign({}, this.rect); this.children.forEach((x) => c.appendChild(x.cloneNode(true))); return c; }
  // Como no navegador: no meio de um movimento, a posição medida vem deslocada.
  getBoundingClientRect() { const mexendo = this.anims.some((a) => !a.cancelado); return mexendo ? Object.assign({}, this.rect, { left: this.rect.left + 150 }) : this.rect; }
  getClientRects() { return this.visivel ? [this.rect] : []; }
  animate(kf, opt) { const a = { kf, opt, cancelado: false, onfinish: null, cancel() { this.cancelado = true; } }; this.anims.push(a); return a; }
}
function montar(reduz) {
  const palco = new El('div', { class: 'desl-palco' });
  palco.rect = { left: 0, top: 0, width: 320, height: 140 };
  const card = palco.appendChild(new El('div', { id: 'study-c', class: 'study-c' }));
  const campo = card.appendChild(new El('input', { id: 'campo', name: 'grupo', type: 'text' }));
  campo.value = 'digitado pelo aluno';
  const radio = card.appendChild(new El('input', { name: 'opcao', type: 'radio' }));
  radio.checked = true;
  const ctx = {
    document: { documentElement: { animate() {} }, hidden: false },
    window: { matchMedia: (q) => ({ matches: !!reduz && /prefers-reduced-motion: reduce/.test(q) }) },
    getComputedStyle: () => ({ position: 'relative' }),
  };
  vm.createContext(ctx);
  vm.runInContext(motor + '\nthis.deslizar=deslizar;this.deslizeDirecao=deslizeDirecao;', ctx);
  return { ctx, palco, card };
}
const fantasmas = (palco) => palco.children.filter((c) => c.cls.has('desl-fantasma'));

{ // reduzir movimento: troca seca
  const { ctx, palco, card } = montar(true);
  let trocou = 0;
  ctx.deslizar(() => card, 1, () => { trocou++; });
  ok('🧨 "reduzir movimento": troca sem animar e sem cópia', trocou === 1 && fantasmas(palco).length === 0 && card.anims.length === 0);
}
{ // direção 0 (mesma aba) e conteúdo fora de um palco
  const { ctx, palco, card } = montar(false);
  let trocou = 0;
  ctx.deslizar(() => card, 0, () => { trocou++; });
  ok('mesma aba (direção 0): só troca', trocou === 1 && fantasmas(palco).length === 0);
  palco.cls.delete('desl-palco');
  ctx.deslizar(() => card, 1, () => { trocou++; });
  ok('🧨 sem palco: só troca (não corta nem empurra a página)', trocou === 2 && fantasmas(palco).length === 0 && card.anims.length === 0);
}
{ // avançar
  const { ctx, palco, card } = montar(false);
  let trocou = 0;
  ctx.deslizar(() => card, 1, () => { trocou++; });
  const f = fantasmas(palco)[0];
  ok('avançar: troca uma vez e põe a cópia por cima', trocou === 1 && !!f && palco.cls.has('desl-ativo'));
  ok('🧨 a cópia não leva id nem name', f && !f.id && f.querySelectorAll('[id]').length === 0 && f.querySelectorAll('[name]').length === 0);
  const ins = f ? f.querySelectorAll('input,select,textarea') : [];
  ok('a cópia mostra o que foi digitado e marcado', ins.length === 2 && ins[0].value === 'digitado pelo aluno' && ins[1].checked === true);
  ok('a cópia é inerte e escondida do leitor de tela', f && f.attrs['aria-hidden'] === 'true' && 'inert' in f.attrs);
  ok('a cópia fica onde o conteúdo estava', f && f.style.left === '10px' && f.style.top === '20px' && f.style.width === '300px');
  const sai = f && f.anims[0], entra = card.anims[0];
  ok('🧨 avançar: o que sai vai para a esquerda e o novo vem da direita',
    sai && entra && sai.kf[1].transform === 'translateX(-100%)' && entra.kf[0].transform === 'translateX(100%)' && entra.kf[1].transform === 'translateX(0)');
  entra.onfinish();
  ok('🧨 ao terminar, a cópia sai e o palco volta ao normal', fantasmas(palco).length === 0 && !palco.cls.has('desl-ativo'));
}
{ // voltar
  const { ctx, palco, card } = montar(false);
  ctx.deslizar(() => card, -1, () => {});
  const f = fantasmas(palco)[0];
  ok('🧨 voltar: o que sai vai para a direita e o novo vem da esquerda',
    f && f.anims[0].kf[1].transform === 'translateX(100%)' && card.anims[0].kf[0].transform === 'translateX(-100%)');
}
{ // cliques seguidos
  const { ctx, palco, card } = montar(false);
  ctx.deslizar(() => card, 1, () => {});
  ctx.deslizar(() => card, 1, () => {});
  ctx.deslizar(() => card, -1, () => {});
  ok('🧨 cliques seguidos: nunca mais de uma cópia na tela', fantasmas(palco).length === 1);
  ok('🧨 cliques seguidos: encerra o movimento anterior antes de medir (a cópia não nasce deslocada)', fantasmas(palco)[0].style.left === '10px', fantasmas(palco)[0].style.left);
  card.anims[card.anims.length - 1].onfinish();
  ok('cliques seguidos: no fim, nenhuma cópia', fantasmas(palco).length === 0 && !palco.cls.has('desl-ativo'));
}
{ // a sessão acabou na troca (o conteúdo novo sumiu)
  const { ctx, palco, card } = montar(false);
  ctx.deslizar(() => card, 1, () => { card.visivel = false; });
  ok('🧨 sessão encerrada na troca: nada sobra na tela', fantasmas(palco).length === 0 && !palco.cls.has('desl-ativo'));
}
{ // direção entre abas
  const { ctx } = montar(false);
  const a = {}, b = {}, c = {};
  ok('direção das abas: para a direita 1, para a esquerda -1, mesma 0',
    ctx.deslizeDirecao([a, b, c], a, c) === 1 && ctx.deslizeDirecao([a, b, c], c, b) === -1 && ctx.deslizeDirecao([a, b, c], b, b) === 0 && ctx.deslizeDirecao([a, b, c], null, b) === 0);
}

// ---- 2. o motor respeita o aparelho -----------------------------------------------------------
ok('🧨 checa "reduzir movimento"', /matchMedia\('\(prefers-reduced-motion: reduce\)'\)\.matches\)return false;/.test(motor));
ok('sem Web Animations (navegador antigo): troca seca', /if\(!document\.documentElement\.animate\)return false;/.test(motor));

// ---- 3. os palcos e o estilo ------------------------------------------------------------------
[['flashcards (estudo)', /<div class="desl-palco"><div class="study-c" id="study-c">/],
 ['simulado', /<div class="desl-palco"><div id="sf-q-corpo">/],
 ['caderno de erros', /<div class="desl-palco"><div id="err-card"><\/div><\/div>/],
 ['banco (abas)', /<div class="desl-palco"><div id="q-modo-corpo">/],
 ['prescrição (abas)', /'<div class="desl-palco"><div class="presc-tab-corpo">'/],
 ['diretrizes (flashcards)', /'<div class="desl-palco"><div class="dir-flip" data-dir-flash="'/]].forEach(([nome, re]) =>
  ok('🧨 palco em ' + nome, re.test(html)));
ok('palco corta só durante o movimento', /\.desl-palco\{position:relative;display:flow-root\}/.test(html) && /\.desl-palco\.desl-ativo\{overflow:hidden\}/.test(html));
ok('o conteúdo segura as margens (a cópia não aparece deslocada)', /\.desl-palco>\*\{display:flow-root\}/.test(html));
ok('cópia sem clique', /\.desl-fantasma\{position:absolute!important;margin:0!important;pointer-events:none/.test(html));

// ---- 4. as ligações ---------------------------------------------------------------------------
const L = (nome, re) => ok('🧨 ' + nome, re.test(html));
L('flashcards: Anterior volta (-1)', /getElementById\('study-prev'\)\.addEventListener\('click',function\(\)\{if\(studyIdx>0\)deslizar\(_pegaStudy,-1,/);
L('flashcards: Próximo avança (1) e o último encerra', /if\(studyIdx<studyCards\.length-1\)\{deslizar\(_pegaStudy,1,function\(\)\{studyIdx\+\+;renderStudyCard\(\);\}\);\}else\{notify\('Fim dos cards!','ok'\);endStudy\(\);\}/);
L('simulado: Anterior volta', /getElementById\('btn-sf-prev'\)\.addEventListener\('click',function\(\)\{if\(sfState\.idx>0\)deslizar\(sfPegaCorpo,-1,/);
L('simulado: Próxima avança', /getElementById\('btn-sf-next'\)\.addEventListener\('click',function\(\)\{if\(sfState\.idx<sfState\.total-1\)deslizar\(sfPegaCorpo,1,/);
L('simulado: a grade de questões desliza para o lado do número escolhido', /deslizar\(sfPegaCorpo,_ni>sfState\.idx\?1:\(_ni<sfState\.idx\?-1:0\),function\(\)\{sfState\.idx=_ni;renderSFQuestion\(\);\}\)/);
L('caderno de erros: Próxima avança', /_be\.addEventListener\('click',function\(\)\{deslizar\(function\(\)\{return document\.getElementById\('err-card'\);\},1,errNext\);\}\)/);
L('diretrizes: flashcards avançam/voltam pelo índice', /deslizar\(function\(\)\{return root\.querySelector\('\[data-dir-flash\^="'\+di\+'-"\]'\);\},cur>antes\?1:\(cur<antes\?-1:0\),function\(\)\{/);
L('banco: a pílula azul acompanha e o conteúdo desliza', /deslizarRealce\(document\.getElementById\('q-mode-row'\),_antes,b,'pilula'\);\s*deslizar\(function\(\)\{return document\.getElementById\('q-modo-corpo'\);\},deslizeDirecao\(_abas,_antes,b\),function\(\)\{/);
L('prescrição: a linha azul acompanha e o conteúdo desliza', /deslizarRealce\(antes\.parentNode,antes,novoB,'tinta'\);\s*deslizar\(function\(\)\{return document\.querySelector\('#presc-tool \.presc-tab-corpo'\);\},deslizeDirecao\(bs,antes,novoB\),function\(\)\{prescSetTab\(t\);\}\);/);
L('prescrição: o clique na aba passa pela animação', /if\(act==='tab'\)\{prescTrocaAba\(t\.dataset\.tab\);return;\}/);
// Fora dos paginadores de lista (combinado com o professor).
const pag = (html.match(/getElementById\('gen-next'\)[^\n]*/) || [''])[0] + (html.match(/var mn=document\.getElementById\('mural-next'\)[^\n]*/) || [''])[0];
ok('paginadores de lista (Banco, Mural) sem deslizar', pag.length > 0 && !/deslizar\(/.test(pag));

// ---- 5. o flashcard novo não mostra a resposta ao desvirar ---------------------------------------
L('flashcard: desvira sem giro ao trocar de card', /if\(sc&&sc\.classList\.contains\('fl'\)&&si\)\{si\.style\.transition='none';sc\.classList\.remove\('fl'\);void si\.offsetWidth;si\.style\.transition='';\}/);

if (bad) { console.log('\n' + bad + ' falha(s): avançar/voltar deslizando'); process.exit(1); }
console.log('avançar/voltar deslizando: Simulado, Flashcards, Caderno de erros e abas do Banco e da Prescrição: ok');
