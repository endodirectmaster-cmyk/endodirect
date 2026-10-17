'use strict';
// ILUSTRAÇÕES DOS RESUMOS (17/10/2026) — biblioteca de elementos em SVG.
//
// Pedido do professor: "a ideia é inserir ilustrações referentes a mecanismos de ação,
// etc, no meio do capítulo" (as figuras de 16/10 ficam no fim e são esquemas). Aqui ficam
// as peças desenhadas à mão — membrana, receptores, proteína G, enzimas, mensageiros,
// núcleo, DNA, setas — com a mesma moldura, fonte e paleta das figuras do fim do
// capítulo (render.js), para as duas conversarem. Cada ilustração (ilus/*.js) monta as
// peças com coordenadas explícitas; build.js grava o SVG em figuras/resumos/ilustracoes/.
//
// ⚠️ NADA DE CONHECIMENTO EXTERNO: tudo o que a ilustração afirma está no texto do
// capítulo (campo `lastro` de cada ilustração, conferido por confere-lastro.js) e passa
// por revisor independente, como as figuras de 16/10. Ilustração própria: não se recorta
// figura de livro (direito da editora).
const { wrap, textW } = require('../figuras-resumos/render.js');

const FONT = "-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";
const P = {
  navy: '#0b2545', ink: '#1f2f45', slate: '#5b6f88', grey: '#94a3b8', line: '#e2e8f0', white: '#ffffff',
  gold: '#d9b652', goldL: '#fdf3d0', cream: '#f6f2e6', red: '#c0392b', redL: '#fdecec', redD: '#8b1e14',
  green: '#2e7d32', greenL: '#e6f4ea', greenD: '#1b5e20', blue: '#2563eb', blueL: '#e8f0fe', blueD: '#1e40af',
  amber: '#b7791f', amberL: '#fff4d6', amberD: '#7c4a03', purple: '#6d28d9', purpleL: '#efe9fe', purpleD: '#4c1d95',
  teal: '#0f766e', tealL: '#e0f2f1', tealD: '#134e4a',
  // biologia
  lipHead: '#efc96a', lipHeadB: '#c9a13f', lipTail: '#f7ead0', cito: '#f4f7fb', nucleo: '#eef0fb', nucleoB: '#7c86c9',
};
const r1 = (n) => Math.round(n * 10) / 10;
const esc = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// ── texto ────────────────────────────────────────────────────────────────────
function txt(x, y, s, o) {
  o = o || {};
  return '<text x="' + r1(x) + '" y="' + r1(y) + '" font-family="' + FONT + '" font-size="' + (o.size || 12) + '"'
    + (o.bold ? ' font-weight="700"' : '') + (o.italic ? ' font-style="italic"' : '')
    + ' fill="' + (o.fill || P.ink) + '" text-anchor="' + (o.anchor || 'middle') + '"'
    + (o.cls ? ' class="' + o.cls + '"' : '') + '>' + esc(s) + '</text>';
}
// Várias linhas, já quebradas na largura máxima. Devolve {svg, h, w}.
function linhas(x, yTop, texto, o) {
  o = o || {};
  const size = o.size || 12, lh = size * (o.lh || 1.3);
  const ls = o.maxW ? wrap(texto, size, !!o.bold, o.maxW) : String(texto).split('\n');
  let svg = '', w = 0;
  ls.forEach((l, i) => { svg += txt(x, yTop + size + i * lh, l, o); w = Math.max(w, textW(l, size, !!o.bold)); });
  return { svg, h: size * 0.25 + ls.length * lh, w, n: ls.length };
}
// Rótulo com fundo (pílula): legível sobre qualquer desenho.
function pilula(x, y, s, o) {
  o = o || {};
  const size = o.size || 11.5, w = textW(s, size, !!o.bold) + 14, h = size + 9;
  return '<rect x="' + r1(x - w / 2) + '" y="' + r1(y - h / 2) + '" width="' + r1(w) + '" height="' + r1(h) + '" rx="' + r1(h / 2) + '" fill="' + (o.f || P.white) + '" stroke="' + (o.b || P.grey) + '" stroke-width="1"/>'
    + txt(x, y + size * 0.36, s, { size, bold: o.bold, fill: o.t || P.ink });
}

// ── moldura comum (a mesma das figuras do fim do capítulo) ───────────────────
function moldura(ilus, corpo) {
  const W = ilus.W, H = ilus.H;
  let s = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + W + ' ' + H + '" width="' + W + '" height="' + H + '" role="img" aria-label="' + esc(ilus.titulo) + '">';
  s += '<title>' + esc(ilus.titulo) + '</title>' + defs();
  s += '<rect x="1" y="1" width="' + (W - 2) + '" height="' + (H - 2) + '" rx="16" fill="' + P.white + '" stroke="' + P.line + '"/>';
  let y = 32;
  wrap(ilus.titulo, 18, true, W - 56).forEach((l) => { s += txt(W / 2, y, l, { size: 18, bold: true, fill: '#0f172a' }); y += 22; });
  if (ilus.subtitulo) wrap(ilus.subtitulo, 12.5, false, W - 56).forEach((l) => { s += txt(W / 2, y - 3, l, { size: 12.5, fill: '#64748b' }); y += 16; });
  return s + corpo + '</svg>';
}
function defs() {
  const m = (id, cor) => '<marker id="' + id + '" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto" markerUnits="userSpaceOnUse"><path d="M1,1 L8,5 L1,9 Z" fill="' + cor + '"/></marker>';
  return '<defs>' + m('a-s', P.slate) + m('a-n', P.navy) + m('a-g', P.green) + m('a-r', P.red) + m('a-b', P.blue) + m('a-p', P.purple) + m('a-t', P.teal) + m('a-a', P.amber)
    // inibição: barra em T
    + '<marker id="i-r" markerWidth="12" markerHeight="14" refX="3" refY="7" orient="auto" markerUnits="userSpaceOnUse"><path d="M3,1 L3,13" stroke="' + P.red + '" stroke-width="3" stroke-linecap="round"/></marker>'
    + '</defs>';
}

// ── setas ────────────────────────────────────────────────────────────────────
const MARCA = { slate: 'a-s', navy: 'a-n', green: 'a-g', red: 'a-r', blue: 'a-b', purple: 'a-p', teal: 'a-t', amber: 'a-a' };
const CORS = { slate: P.slate, navy: P.navy, green: P.green, red: P.red, blue: P.blue, purple: P.purple, teal: P.teal, amber: P.amber };
// d: caminho SVG; o.cor; o.trac (tracejada = deslocamento/translocação); o.inibe (barra em T vermelha)
function seta(d, o) {
  o = o || {};
  const cor = o.inibe ? P.red : (CORS[o.cor] || P.slate);
  const fim = o.inibe ? 'i-r' : (MARCA[o.cor] || 'a-s');
  return '<path d="' + d + '" fill="none" stroke="' + cor + '" stroke-width="' + (o.w || 2) + '"' + (o.trac ? ' stroke-dasharray="5 4"' : '') + ' stroke-linecap="round" marker-end="url(#' + fim + ')"/>';
}

// ── ambiente: meio extracelular, membrana em bicamada, citoplasma ────────────
// Membrana horizontal de x1 a x2, topo em y (espessura h). Cabeças fosfolipídicas nas
// duas faces; caudas como faixa clara entre elas.
function membrana(x1, x2, y, h, buracos) {
  h = h || 30; buracos = buracos || [];
  const livre = (x) => !buracos.some((b) => x > b[0] - 5 && x < b[1] + 5);
  let s = '<rect x="' + r1(x1) + '" y="' + r1(y + 4) + '" width="' + r1(x2 - x1) + '" height="' + r1(h - 8) + '" fill="' + P.lipTail + '"/>';
  for (let x = x1 + 5; x <= x2 - 4; x += 9.5) {
    if (!livre(x)) continue;
    s += '<circle cx="' + r1(x) + '" cy="' + r1(y + 4) + '" r="4.2" fill="' + P.lipHead + '" stroke="' + P.lipHeadB + '" stroke-width="0.8"/>';
    s += '<circle cx="' + r1(x) + '" cy="' + r1(y + h - 4) + '" r="4.2" fill="' + P.lipHead + '" stroke="' + P.lipHeadB + '" stroke-width="0.8"/>';
  }
  return s;
}
function citoplasma(x, y, w, h) {
  return '<rect x="' + r1(x) + '" y="' + r1(y) + '" width="' + r1(w) + '" height="' + r1(h) + '" rx="10" fill="' + P.cito + '"/>';
}
function zona(x, y, s) { return txt(x, y, s, { size: 11, italic: true, fill: P.slate, anchor: 'start' }); }
// Rótulo de zona na vertical, centrado em (x, y): para a margem esquerda.
function zonaV(x, y, s) {
  return '<text x="' + r1(x) + '" y="' + r1(y) + '" font-family="' + FONT + '" font-size="11" font-style="italic" fill="' + P.slate + '" text-anchor="middle" class="rot" transform="rotate(-90 ' + r1(x) + ' ' + r1(y) + ')">' + esc(s) + '</text>';
}

// ── receptores ───────────────────────────────────────────────────────────────
// Receptor de 7 hélices transmembrana (GPCR): sete cilindros cruzando a membrana,
// ligados por alças alternadas fora e dentro. cx = centro; y = topo da membrana.
function receptor7TM(cx, y, h, cor) {
  h = h || 30; cor = cor || P.blue;
  const n = 7, passo = 9, x0 = cx - ((n - 1) * passo) / 2, top = y - 6, bot = y + h + 6;
  let alcas = '';
  for (let i = 0; i < n - 1; i++) {
    const xa = x0 + i * passo, xb = xa + passo, fora = i % 2 === 1; // alças alternadas
    alcas += fora ? '<path d="M' + r1(xa) + ',' + r1(top + 2) + ' C' + r1(xa) + ',' + r1(top - 9) + ' ' + r1(xb) + ',' + r1(top - 9) + ' ' + r1(xb) + ',' + r1(top + 2) + '" fill="none" stroke="' + cor + '" stroke-width="2.2"/>'
      : '<path d="M' + r1(xa) + ',' + r1(bot - 2) + ' C' + r1(xa) + ',' + r1(bot + 9) + ' ' + r1(xb) + ',' + r1(bot + 9) + ' ' + r1(xb) + ',' + r1(bot - 2) + '" fill="none" stroke="' + cor + '" stroke-width="2.2"/>';
  }
  // N-terminal fora (à esquerda) e C-terminal dentro (à direita)
  alcas += '<path d="M' + r1(x0) + ',' + r1(top + 2) + ' C' + r1(x0 - 2) + ',' + r1(top - 12) + ' ' + r1(x0 - 12) + ',' + r1(top - 10) + ' ' + r1(x0 - 14) + ',' + r1(top - 18) + '" fill="none" stroke="' + cor + '" stroke-width="2.2"/>';
  alcas += '<path d="M' + r1(x0 + (n - 1) * passo) + ',' + r1(bot - 2) + ' C' + r1(x0 + (n - 1) * passo + 2) + ',' + r1(bot + 12) + ' ' + r1(x0 + (n - 1) * passo + 10) + ',' + r1(bot + 8) + ' ' + r1(x0 + (n - 1) * passo + 13) + ',' + r1(bot + 15) + '" fill="none" stroke="' + cor + '" stroke-width="2.2"/>';
  let cil = '';
  for (let i = 0; i < n; i++) cil += '<rect x="' + r1(x0 + i * passo - 3.4) + '" y="' + r1(top) + '" width="6.8" height="' + r1(bot - top) + '" rx="3.4" fill="' + cor + '" stroke="' + P.white + '" stroke-width="0.8"/>';
  return alcas + cil;
}

// ── ligantes ─────────────────────────────────────────────────────────────────
// Peptídeo: contas em cadeia. Esteroide: quatro anéis fundidos. Tireoidiano: dois anéis.
function peptideo(x, y, cor, n) {
  cor = cor || P.red; n = n || 4;
  let s = '', px = x, py = y;
  for (let i = 0; i < n; i++) {
    const cx = x + i * 8.5, cy = y + (i % 2 ? -4 : 0);
    if (i) s += '<line x1="' + r1(px) + '" y1="' + r1(py) + '" x2="' + r1(cx) + '" y2="' + r1(cy) + '" stroke="' + cor + '" stroke-width="2"/>';
    px = cx; py = cy;
  }
  for (let i = 0; i < n; i++) s += '<circle cx="' + r1(x + i * 8.5) + '" cy="' + r1(y + (i % 2 ? -4 : 0)) + '" r="4.6" fill="' + cor + '" stroke="' + P.white + '" stroke-width="1"/>';
  return s;
}
function hexagono(cx, cy, r) {
  const pts = [];
  for (let i = 0; i < 6; i++) { const a = Math.PI / 6 + (i * Math.PI) / 3; pts.push(r1(cx + r * Math.cos(a)) + ',' + r1(cy + r * Math.sin(a))); }
  return pts.join(' ');
}
// k: escala (o hormônio preso ao receptor sai menor, 0,75)
function esteroide(x, y, cor, k) {
  cor = cor || P.amber;
  const r = 6 * (k || 1), dx = r * Math.sqrt(3);
  const a = '<polygon points="' + hexagono(x, y, r) + '" fill="' + P.amberL + '" stroke="' + cor + '" stroke-width="1.8"/>'
    + '<polygon points="' + hexagono(x + dx, y, r) + '" fill="' + P.amberL + '" stroke="' + cor + '" stroke-width="1.8"/>'
    + '<polygon points="' + hexagono(x + dx * 1.5, y - r * 1.5, r) + '" fill="' + P.amberL + '" stroke="' + cor + '" stroke-width="1.8"/>';
  // anel de cinco (D)
  const c5x = x + dx * 2.45, c5y = y - r * 1.75, r5 = r * 0.95, p5 = [];
  for (let i = 0; i < 5; i++) { const ang = Math.PI + (i * 2 * Math.PI) / 5; p5.push(r1(c5x + r5 * Math.cos(ang)) + ',' + r1(c5y + r5 * Math.sin(ang))); }
  return a + '<polygon points="' + p5.join(' ') + '" fill="' + P.amberL + '" stroke="' + cor + '" stroke-width="1.8"/>';
}
function tireoidiano(x, y, cor) {
  cor = cor || P.purple;
  return '<polygon points="' + hexagono(x, y, 6) + '" fill="' + P.purpleL + '" stroke="' + cor + '" stroke-width="1.8"/>'
    + '<line x1="' + r1(x + 6) + '" y1="' + r1(y) + '" x2="' + r1(x + 12) + '" y2="' + r1(y) + '" stroke="' + cor + '" stroke-width="1.8"/>'
    + '<polygon points="' + hexagono(x + 18, y, 6) + '" fill="' + P.purpleL + '" stroke="' + cor + '" stroke-width="1.8"/>';
}

// ── proteínas e moléculas sinalizadoras ──────────────────────────────────────
// Bolha com rótulo (proteína genérica): elipse com texto centrado.
function bolha(cx, cy, rx, ry, rotulo, o) {
  o = o || {};
  return '<ellipse cx="' + r1(cx) + '" cy="' + r1(cy) + '" rx="' + r1(rx) + '" ry="' + r1(ry) + '" fill="' + (o.f || P.blueL) + '" stroke="' + (o.b || P.blue) + '" stroke-width="' + (o.sw || 1.6) + '"/>'
    + (rotulo ? txt(cx, cy + (o.size || 11.5) * 0.36, rotulo, { size: o.size || 11.5, bold: o.bold !== false, fill: o.t || P.ink }) : '');
}
// Caixa arredondada (enzima, quinase, efetor).
function caixa(x, y, w, h, rotulo, o) {
  o = o || {};
  const size = o.size || 11.5;
  return '<rect x="' + r1(x) + '" y="' + r1(y) + '" width="' + r1(w) + '" height="' + r1(h) + '" rx="' + r1(o.rx == null ? 8 : o.rx) + '" fill="' + (o.f || P.white) + '" stroke="' + (o.b || P.slate) + '" stroke-width="' + (o.sw || 1.5) + '"/>'
    + (rotulo ? linhasCentro(x + w / 2, y + h / 2, rotulo, size, o.t || P.ink, o.bold !== false) : '');
}
function linhasCentro(cx, cy, rotulo, size, cor, bold) {
  const ls = String(rotulo).split('\n'), lh = size * 1.22, y0 = cy - ((ls.length - 1) * lh) / 2 + size * 0.36;
  return ls.map((l, i) => txt(cx, y0 + i * lh, l, { size, bold, fill: cor })).join('');
}
// Proteína G heterotrimérica presa à face interna: α (com GDP/GTP) e βγ.
// separada=true: α ativa (GTP) afastada do βγ.
// o.beta / o.alfa: [x, y] para posicionar o dímero βγ e a Gα fora do arranjo padrão
function proteinaG(x, y, rotuloAlfa, corAlfa, separada, o) {
  o = o || {};
  const cA = corAlfa || P.green;
  const ax = o.alfa ? o.alfa[0] : separada ? x + 46 : x, ay = o.alfa ? o.alfa[1] : separada ? y + 10 : y;
  const bx = o.beta ? o.beta[0] : x - 24, by = o.beta ? o.beta[1] : y - 2;
  let s = '';
  s += bolha(bx, by, 10, 8, 'β', { f: '#e2e8f0', b: P.grey, size: 10.5 });
  s += bolha(bx - 10, by + 11, 7, 6, 'γ', { f: '#e2e8f0', b: P.grey, size: 9.5 });
  s += bolha(ax, ay, 15, 11, rotuloAlfa, { f: '#ffffff', b: cA, sw: 2, t: cA, size: 11 });
  s += pilula(ax + 4, ay + 18, separada ? 'GTP' : 'GDP', { size: 9.5, bold: true, f: separada ? P.greenL : '#f1f5f9', b: separada ? P.green : P.grey, t: separada ? P.greenD : P.slate });
  return s;
}
// Segundo mensageiro: três pontos e o nome.
function mensageiro(x, y, rotulo, cor) {
  cor = cor || P.gold;
  return '<circle cx="' + r1(x - 9) + '" cy="' + r1(y + 2) + '" r="3.6" fill="' + cor + '"/><circle cx="' + r1(x) + '" cy="' + r1(y - 3) + '" r="3.6" fill="' + cor + '"/><circle cx="' + r1(x + 9) + '" cy="' + r1(y + 2) + '" r="3.6" fill="' + cor + '"/>'
    + txt(x, y + 18, rotulo, { size: 11.5, bold: true, fill: P.ink });
}
// Passo numerado.
function passo(x, y, n) {
  return '<circle cx="' + r1(x) + '" cy="' + r1(y) + '" r="9" fill="' + P.navy + '"/>' + txt(x, y + 4, String(n), { size: 11, bold: true, fill: P.white });
}
// Nota (correlação clínica, ressalva): caixa clara com borda colorida à esquerda.
function nota(x, y, w, texto, o) {
  o = o || {};
  const size = o.size || 11, l = linhas(0, 0, texto, { size, maxW: w - 18 });
  const h = l.h + 12;
  const c = o.cor === 'red' ? [P.redL, P.red] : o.cor === 'green' ? [P.greenL, P.green] : o.cor === 'blue' ? [P.blueL, P.blue] : [P.cream, P.gold];
  const corpo = linhas(x + 11, y + 5, texto, { size, maxW: w - 18, anchor: 'start', fill: P.ink });
  return { svg: '<rect x="' + r1(x) + '" y="' + r1(y) + '" width="' + r1(w) + '" height="' + r1(h) + '" rx="6" fill="' + c[0] + '"/><rect x="' + r1(x) + '" y="' + r1(y) + '" width="3.5" height="' + r1(h) + '" rx="1.5" fill="' + c[1] + '"/>' + corpo.svg, h };
}

// Fosfato (P) preso a uma proteína: a marca da fosforilação.
function fosfato(x, y) {
  return '<circle cx="' + r1(x) + '" cy="' + r1(y) + '" r="6.2" fill="#f59e0b" stroke="#b45309" stroke-width="1"/>' + txt(x, y + 3.3, 'P', { size: 9, bold: true, fill: P.white });
}
// Receptor da insulina (tirosina-quinase): tetrâmero 2α + 2β pré-formado. As α ficam fora,
// unidas por pontes dissulfeto, formando o bolso do ligante; as β atravessam a membrana
// e carregam o domínio quinase (fosfatos nas tirosinas quando ativo).
function receptorInsulina(cx, y, h, ativo) {
  const cor = P.teal, corL = P.tealL;
  let s = '';
  // β: atravessam a membrana
  [-13, 13].forEach((dx) => {
    s += '<rect x="' + r1(cx + dx - 6) + '" y="' + r1(y - 20) + '" width="12" height="' + r1(h + 62) + '" rx="6" fill="' + cor + '"/>';
  });
  // α: fora, em U
  [-19, 19].forEach((dx) => {
    s += '<rect x="' + r1(cx + dx - 11) + '" y="' + r1(y - 70) + '" width="22" height="52" rx="10" fill="' + corL + '" stroke="' + cor + '" stroke-width="1.8"/>';
    s += txt(cx + dx, y - 50, 'α', { size: 11, bold: true, fill: P.tealD });
  });
  // pontes dissulfeto (traços): entre as α e em cada junção α–β, com o rótulo ao lado
  [y - 46, y - 32].forEach((yy) => { s += '<line x1="' + r1(cx - 8) + '" y1="' + r1(yy) + '" x2="' + r1(cx + 8) + '" y2="' + r1(yy) + '" stroke="' + P.amber + '" stroke-width="2.4" stroke-linecap="round"/>'; });
  [-14, 14].forEach((dx) => { s += '<line x1="' + r1(cx + dx) + '" y1="' + r1(y - 26) + '" x2="' + r1(cx + dx) + '" y2="' + r1(y - 12) + '" stroke="' + P.amber + '" stroke-width="2.4" stroke-linecap="round"/>'; });
  s += txt(cx + 34, y - 30, 'S–S', { size: 10, bold: true, fill: P.amberD, anchor: 'start' });
  s += txt(cx + 40, y + h + 26, 'β', { size: 11, bold: true, fill: P.tealD });
  if (ativo) [y + h + 14, y + h + 30].forEach((yy) => { s += fosfato(cx - 25, yy) + fosfato(cx + 25, yy); });
  return s;
}
// Receptor de citocina (GH, prolactina, leptina): duas cadeias de passagem única,
// sem atividade enzimática; o ligante as dimeriza, e a JAK fica presa na face interna.
function receptorCitocina(cx, y, h, cor) {
  cor = cor || P.purple;
  let s = '';
  [-18, 18].forEach((dx) => {
    s += '<rect x="' + r1(cx + dx - 4.5) + '" y="' + r1(y - 34) + '" width="9" height="' + r1(h + 62) + '" rx="4.5" fill="' + cor + '"/>';
    s += '<ellipse cx="' + r1(cx + dx) + '" cy="' + r1(y - 40) + '" rx="13" ry="16" fill="' + P.purpleL + '" stroke="' + cor + '" stroke-width="1.8"/>';
  });
  return s;
}

// ── núcleo e DNA ─────────────────────────────────────────────────────────────
// Núcleo: envelope duplo (traço contínuo + tracejado, que sugere os poros).
function nucleo(x, y, w, h) {
  return '<rect x="' + r1(x) + '" y="' + r1(y) + '" width="' + r1(w) + '" height="' + r1(h) + '" rx="' + r1(Math.min(w, h) / 3) + '" fill="' + P.nucleo + '" stroke="' + P.nucleoB + '" stroke-width="2"/>'
    + '<rect x="' + r1(x + 4) + '" y="' + r1(y + 4) + '" width="' + r1(w - 8) + '" height="' + r1(h - 8) + '" rx="' + r1(Math.min(w, h) / 3 - 3) + '" fill="none" stroke="' + P.nucleoB + '" stroke-width="1" stroke-dasharray="7 4"/>';
}
// DNA: dupla hélice de x1 a x2 na altura y, com degraus.
function dna(x1, x2, y, o) {
  o = o || {};
  const amp = o.amp || 7, per = o.per || 34;
  let a = 'M' + r1(x1) + ',' + r1(y), b = 'M' + r1(x1) + ',' + r1(y), deg = '';
  for (let x = x1; x <= x2; x += 2) {
    const t = ((x - x1) / per) * 2 * Math.PI;
    a += ' L' + r1(x) + ',' + r1(y + amp * Math.sin(t));
    b += ' L' + r1(x) + ',' + r1(y - amp * Math.sin(t));
  }
  for (let x = x1 + 4; x <= x2 - 2; x += per / 4) {
    const t = ((x - x1) / per) * 2 * Math.PI, ya = y + amp * Math.sin(t), yb = y - amp * Math.sin(t);
    if (Math.abs(ya - yb) > 3) deg += '<line x1="' + r1(x) + '" y1="' + r1(ya) + '" x2="' + r1(x) + '" y2="' + r1(yb) + '" stroke="#b9c2d6" stroke-width="1.4"/>';
  }
  return deg + '<path d="' + a + '" fill="none" stroke="' + P.navy + '" stroke-width="2"/><path d="' + b + '" fill="none" stroke="' + P.slate + '" stroke-width="2"/>';
}

module.exports = { P, FONT, r1, esc, txt, linhas, pilula, moldura, seta, membrana, citoplasma, zona, zonaV, receptor7TM, peptideo, esteroide, tireoidiano, bolha, caixa, linhasCentro, proteinaG, mensageiro, passo, nota, nucleo, dna, fosfato, receptorInsulina, receptorCitocina, wrap, textW };
