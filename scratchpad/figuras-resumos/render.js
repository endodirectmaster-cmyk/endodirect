'use strict';
// GERADOR DAS FIGURAS DIDÁTICAS DOS RESUMOS (15/10/2026).
//
// Lê uma especificação JSON (tipos: fluxo, painel, escada, curvas, linha_tempo,
// espectro, ciclo) e devolve um SVG autoral no estilo das figuras já aceitas pelo
// professor (cartão branco, navy + dourado, fonte do sistema). Quem escreve a
// especificação diz O QUE mostrar; posição, quebra de linha e tamanho saem daqui,
// iguais para as 100+ figuras. Nada de <image>, <script>, fonte externa ou link.
//
// Uso: node render.js specs/*.json  → grava figuras/resumos/<slug>.svg e devolve
// avisos de layout (texto fora da caixa, caixas sobrepostas, largura excessiva).
const fs = require('fs');
const path = require('path');

const FONT = "-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";
const P = {
  navy: '#0b2545', ink: '#1f2f45', slate: '#5b6f88', grey: '#94a3b8', line: '#e2e8f0', white: '#ffffff',
  gold: '#d9b652', goldL: '#fdf3d0', cream: '#f6f2e6', red: '#c0392b', redL: '#fdecec', redD: '#8b1e14',
  green: '#2e7d32', greenL: '#e6f4ea', greenD: '#1b5e20', blue: '#2563eb', blueL: '#e8f0fe', blueD: '#1e40af',
  amber: '#b7791f', amberL: '#fff4d6', amberD: '#7c4a03', purple: '#6d28d9', purpleL: '#efe9fe', purpleD: '#4c1d95',
};
// Cor nomeada → {fundo, borda, texto} (painéis, espectro, séries).
const COR = {
  navy: { f: P.navy, b: P.navy, t: P.white, s: P.navy }, gold: { f: P.goldL, b: P.gold, t: P.navy, s: P.gold },
  red: { f: P.redL, b: P.red, t: P.redD, s: P.red }, green: { f: P.greenL, b: P.green, t: P.greenD, s: P.green },
  blue: { f: P.blueL, b: P.blue, t: P.blueD, s: P.blue }, amber: { f: P.amberL, b: P.amber, t: P.amberD, s: P.amber },
  purple: { f: P.purpleL, b: P.purple, t: P.purpleD, s: P.purple }, slate: { f: '#eef2f7', b: P.grey, t: P.ink, s: P.slate },
  cream: { f: P.cream, b: P.gold, t: P.ink, s: P.gold },
};
const cor = (k) => COR[k] || COR.slate;
const SERIES = [P.blue, P.red, P.gold, P.green, P.purple, P.slate];

// ── medida de texto (larguras Helvetica em milésimos de em; margem de 6%) ───
const WR = { ' ': 278, '!': 278, '"': 355, '#': 556, '$': 556, '%': 889, '&': 667, "'": 191, '(': 333, ')': 333, '*': 389, '+': 584, ',': 278, '-': 333, '.': 278, '/': 278, ':': 278, ';': 278, '<': 584, '=': 584, '>': 584, '?': 556, '@': 1015, '[': 278, '\\': 278, ']': 278, '^': 469, '_': 556, '`': 333, '{': 334, '|': 260, '}': 334, '~': 584,
  A: 667, B: 667, C: 722, D: 722, E: 667, F: 611, G: 778, H: 722, I: 278, J: 500, K: 667, L: 556, M: 833, N: 722, O: 778, P: 667, Q: 778, R: 722, S: 667, T: 611, U: 722, V: 667, W: 944, X: 667, Y: 667, Z: 611,
  a: 556, b: 556, c: 500, d: 556, e: 556, f: 278, g: 556, h: 556, i: 222, j: 222, k: 500, l: 222, m: 833, n: 556, o: 556, p: 556, q: 556, r: 333, s: 500, t: 278, u: 556, v: 500, w: 722, x: 500, y: 500, z: 500,
  '–': 556, '—': 1000, '·': 278, '•': 350, '→': 700, '←': 700, '↑': 500, '↓': 500, '↔': 800, '≥': 584, '≤': 584, '≈': 584, '×': 584, '−': 584, '±': 584, '⊣': 584, '°': 400, '%': 889, '/': 278, '⁺': 400, '⁻': 400, '₂': 400, '₃': 400, '₁': 400, '₄': 400 };
const WB = { ' ': 278, a: 556, b: 611, c: 556, d: 611, e: 556, f: 333, g: 611, h: 611, i: 278, j: 278, k: 556, l: 278, m: 889, n: 611, o: 611, p: 611, q: 611, r: 389, s: 556, t: 333, u: 611, v: 556, w: 778, x: 556, y: 556, z: 500,
  A: 722, B: 722, C: 722, D: 722, E: 667, F: 611, G: 778, H: 722, I: 278, J: 556, K: 722, L: 611, M: 833, N: 722, O: 778, P: 667, Q: 778, R: 722, S: 667, T: 611, U: 722, V: 667, W: 944, X: 667, Y: 667, Z: 611, '-': 333, '(': 333, ')': 333, ',': 278, '.': 278, ':': 333, '/': 278, '–': 556, '—': 1000, '→': 700, '↑': 500, '↓': 500 };
function charW(ch, bold) {
  const base = ch.normalize('NFD')[0];
  const t = bold ? WB : WR;
  if (t[ch] != null) return t[ch];
  if (t[base] != null) return t[base];
  if (WR[ch] != null) return WR[ch] * (bold ? 1.08 : 1);
  if (WR[base] != null) return WR[base] * (bold ? 1.08 : 1);
  if (/[0-9]/.test(base)) return 556;
  if (/[A-Z]/.test(base)) return 722;
  if (/[a-z]/.test(base)) return 580;
  return 640;
}
function textW(s, size, bold) { let w = 0; for (const ch of String(s)) w += charW(ch, bold); return (w / 1000) * size * 1.06; }
function wrap(text, size, bold, maxW) {
  const out = [];
  for (const par of String(text == null ? '' : text).split('\n')) {
    const words = par.split(/\s+/).filter(Boolean);
    if (!words.length) { out.push(''); continue; }
    let line = '';
    for (const w of words) {
      const t = line ? line + ' ' + w : w;
      if (!line || textW(t, size, bold) <= maxW) line = t; else { out.push(line); line = w; }
    }
    out.push(line);
  }
  return out;
}
const esc = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const r1 = (n) => Math.round(n * 10) / 10;
function txt(x, y, s, o) {
  o = o || {};
  return '<text x="' + r1(x) + '" y="' + r1(y) + '" font-family="' + FONT + '" font-size="' + (o.size || 13) + '"' + (o.bold ? ' font-weight="700"' : '') + (o.italic ? ' font-style="italic"' : '') + ' fill="' + (o.fill || P.ink) + '"' + (o.anchor ? ' text-anchor="' + o.anchor + '"' : '') + (o.extra || '') + '>' + esc(s) + '</text>';
}
// Bloco de linhas: a 1ª em negrito (título), as demais normais. Devolve {svg, h}.
function bloco(x, yTop, linhas, o) {
  o = o || {};
  const s1 = o.size || 13, s2 = o.size2 || Math.round((s1 - 1) * 10) / 10, lh1 = s1 * 1.25, lh2 = s2 * 1.28;
  let y = yTop, svg = '';
  linhas.forEach((l, i) => {
    const prim = i === 0 && o.boldFirst !== false;
    const size = prim ? s1 : s2, lh = prim ? lh1 : lh2;
    y += lh;
    svg += txt(x, y - lh * 0.28, l, { size, bold: prim && !o.noBold, fill: prim ? (o.fill || P.ink) : (o.fill2 || o.fill || P.ink), anchor: o.anchor || 'middle' });
  });
  return { svg, h: y - yTop };
}
function linhasH(linhas, s1, s2) { if (!linhas.length) return 0; return s1 * 1.25 + (linhas.length - 1) * (s2 || s1 - 1) * 1.28; }
function medidasBloco(texto, s1, maxW, bold1) {
  const partes = String(texto == null ? '' : texto).split('\n');
  const l1 = wrap(partes[0], s1, bold1 !== false, maxW);
  const s2 = Math.round((s1 - 1) * 10) / 10;
  const resto = partes.slice(1).flatMap((p) => wrap(p, s2, false, maxW));
  const linhas = l1.concat(resto);
  let w = 0;
  linhas.forEach((l, i) => { w = Math.max(w, textW(l, i < l1.length ? s1 : s2, i < l1.length && bold1 !== false)); });
  return { linhas, w, h: linhasH(linhas, s1, s2), nTit: l1.length };
}
function blocoMedido(x, yTop, m, s1, o) {
  // desenha um bloco já medido: as linhas do título em negrito, o resto normal
  o = o || {};
  const s2 = Math.round((s1 - 1) * 10) / 10;
  let y = yTop, svg = '';
  m.linhas.forEach((l, i) => {
    const tit = i < m.nTit && o.noBold !== true;
    const size = tit ? s1 : s2, lh = tit ? s1 * 1.25 : s2 * 1.28;
    y += lh;
    svg += txt(x, y - lh * 0.28, l, { size, bold: tit, fill: tit ? (o.fill || P.ink) : (o.fill2 || o.fill || P.ink), anchor: o.anchor || 'middle' });
  });
  return svg;
}

const DEFS = (id) => '<defs>'
  + '<marker id="' + id + '-ag" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto" markerUnits="userSpaceOnUse"><path d="M1,1 L8,5 L1,9 Z" fill="' + P.gold + '"/></marker>'
  + '<marker id="' + id + '-ar" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto" markerUnits="userSpaceOnUse"><path d="M1,1 L8,5 L1,9 Z" fill="' + P.red + '"/></marker>'
  + '<marker id="' + id + '-as" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto" markerUnits="userSpaceOnUse"><path d="M1,1 L8,5 L1,9 Z" fill="' + P.slate + '"/></marker>'
  + '<marker id="' + id + '-av" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto" markerUnits="userSpaceOnUse"><path d="M1,1 L8,5 L1,9 Z" fill="' + P.green + '"/></marker>'
  + '</defs>';

// ── moldura comum: cartão, título, subtítulo ────────────────────────────────
function moldura(spec, W, conteudoH, corpo, topo) {
  const H = topo + conteudoH + 26;
  const id = spec.id || 'f';
  let s = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + W + ' ' + H + '" width="' + W + '" height="' + H + '" role="img" aria-label="' + esc(spec.titulo) + '">';
  s += '<title>' + esc(spec.titulo) + '</title>' + DEFS(id);
  s += '<rect x="1" y="1" width="' + (W - 2) + '" height="' + (H - 2) + '" rx="16" fill="' + P.white + '" stroke="' + P.line + '"/>';
  const tl = wrap(spec.titulo, 18, true, W - 56);
  let y = 32;
  tl.forEach((l) => { s += txt(W / 2, y, l, { size: 18, bold: true, fill: '#0f172a', anchor: 'middle' }); y += 22; });
  if (spec.subtitulo) { wrap(spec.subtitulo, 12.5, false, W - 56).forEach((l) => { s += txt(W / 2, y - 3, l, { size: 12.5, fill: '#64748b', anchor: 'middle' }); y += 16; }); }
  s += corpo + '</svg>';
  return s;
}
function alturaTopo(spec, W) {
  const tl = wrap(spec.titulo, 18, true, W - 56).length;
  let y = 32 + (tl - 1) * 22;
  if (spec.subtitulo) y += 16 * wrap(spec.subtitulo, 12.5, false, W - 56).length - 3;
  return y + 22;
}

// ═══════════════════════════ FLUXO ═══════════════════════════════════════
const TIPO_NO = {
  orgao: { f: P.navy, b: P.navy, t: P.white, t2: '#e9eef7', rx: 10 },
  hormonio: { f: P.goldL, b: P.gold, t: P.navy, t2: P.ink, rx: 999 },
  passo: { f: P.white, b: P.navy, t: P.ink, t2: P.slate, rx: 10 },
  decisao: { f: P.amberL, b: P.amber, t: P.amberD, t2: P.ink, rx: 10, hex: true },
  inicio: { f: P.cream, b: P.gold, t: P.ink, t2: P.slate, rx: 999 },
  fim: { f: P.greenL, b: P.green, t: P.greenD, t2: P.ink, rx: 10 },
  alerta: { f: P.redL, b: P.red, t: P.redD, t2: P.ink, rx: 10 },
  grupo: { f: '#f8fafc', b: P.line, t: P.ink, t2: P.ink, rx: 12, esquerda: true },
};
function layoutFluxo(fl, avisos) {
  const nos = (fl.nos || []).map((n) => Object.assign({}, n));
  const porId = {}; nos.forEach((n) => { if (porId[n.id]) avisos.push('fluxo: id repetido ' + n.id); porId[n.id] = n; });
  const setas = (fl.setas || []).filter((e) => { const ok = porId[e.de] && porId[e.para]; if (!ok) avisos.push('fluxo: seta com nó inexistente ' + e.de + '→' + e.para); return ok; });
  const horizontal = fl.orientacao === 'horizontal';
  // medidas
  nos.forEach((n) => {
    const st = TIPO_NO[n.tipo] || TIPO_NO.passo;
    const s1 = n.tipo === 'grupo' ? 12.5 : 13;
    const maxW = n.largura || (n.tipo === 'grupo' ? 300 : (n.tipo === 'decisao' ? 170 : 200));
    const m = medidasBloco(n.texto, s1, maxW, true);
    n.m = m; n.s1 = s1; n.st = st;
    const padX = st.hex ? 34 : (st.rx === 999 ? 20 : 16);
    n.w = Math.max(n.tipo === 'grupo' ? 160 : 96, m.w + padX * 2);
    n.h = m.h + 18;
  });
  // arestas de volta (feedback): quem aponta para um ancestral
  const adj = {}; nos.forEach((n) => { adj[n.id] = []; });
  setas.forEach((e) => { e.volta = e.tipo === 'feedback'; });
  const estado = {};
  function dfs(u) {
    estado[u] = 1;
    setas.filter((e) => e.de === u && !e.volta).forEach((e) => {
      if (estado[e.para] === 1) e.volta = true; else if (!estado[e.para]) dfs(e.para);
    });
    estado[u] = 2;
  }
  nos.forEach((n) => { if (!estado[n.id]) dfs(n.id); });
  const frente = setas.filter((e) => !e.volta);
  // camadas: caminho mais longo a partir das fontes
  const camada = {};
  const entrada = {}; nos.forEach((n) => { entrada[n.id] = 0; }); frente.forEach((e) => { entrada[e.para]++; });
  const fila = nos.filter((n) => entrada[n.id] === 0).map((n) => n.id);
  fila.forEach((id) => { camada[id] = 0; });
  const ent2 = Object.assign({}, entrada);
  while (fila.length) {
    const u = fila.shift();
    frente.filter((e) => e.de === u).forEach((e) => {
      camada[e.para] = Math.max(camada[e.para] || 0, camada[u] + 1);
      if (--ent2[e.para] === 0) fila.push(e.para);
    });
  }
  nos.forEach((n) => { if (camada[n.id] == null) { camada[n.id] = 0; avisos.push('fluxo: nó sem caminho desde a origem: ' + n.id); } if (n.camada != null) camada[n.id] = n.camada; });
  const nCam = Math.max.apply(null, nos.map((n) => camada[n.id])) + 1;
  const camadas = []; for (let i = 0; i < nCam; i++) camadas.push([]);
  nos.forEach((n) => { camadas[camada[n.id]].push(n); });
  // ordem dentro da camada: baricentro dos pais (2 passagens) — ordem de escrita como desempate
  nos.forEach((n, i) => { n.ord = i; });
  for (let passo = 0; passo < 2; passo++) {
    for (let c = 1; c < nCam; c++) {
      camadas[c].forEach((n) => {
        const pais = frente.filter((e) => e.para === n.id).map((e) => porId[e.de]);
        n.bar = pais.length ? pais.reduce((s, p) => s + p.pos, 0) / pais.length : n.pos;
      });
      camadas[c].sort((a, b) => (a.bar - b.bar) || (a.ord - b.ord)).forEach((n, i) => { n.pos = i; });
    }
    if (passo === 0) camadas.forEach((cam) => cam.forEach((n, i) => { if (n.pos == null) n.pos = i; }));
  }
  camadas.forEach((cam) => cam.sort((a, b) => (a.pos - b.pos) || (a.ord - b.ord)));
  // posições: eixo principal = camadas; eixo cruzado = ordem
  const GAP_C = 30, GAP_P = (frente.some((e) => e.rotulo) ? 62 : 50);
  let larguras = camadas.map((cam) => cam.reduce((s, n) => s + (horizontal ? n.h : n.w), 0) + (cam.length - 1) * GAP_C);
  const extCruz = Math.max.apply(null, larguras);
  let pos = 0;
  camadas.forEach((cam, c) => {
    const alt = Math.max.apply(null, cam.map((n) => (horizontal ? n.w : n.h)));
    let x = (extCruz - larguras[c]) / 2;
    cam.forEach((n) => {
      const tam = horizontal ? n.h : n.w;
      n.cx = x + tam / 2; n.cy = pos + alt / 2; // cx = eixo cruzado, cy = eixo principal
      x += tam + GAP_C;
    });
    pos += alt + GAP_P;
  });
  // alinhar filho único sob pai único (eixo cruzado), sem invadir vizinhos
  for (let c = 1; c < nCam; c++) {
    camadas[c].forEach((n, i) => {
      const pais = frente.filter((e) => e.para === n.id);
      if (pais.length !== 1) return;
      const p = porId[pais[0].de];
      const filhosDoPai = frente.filter((e) => e.de === p.id);
      if (filhosDoPai.length !== 1) return;
      const tam = horizontal ? n.h : n.w;
      const esq = i > 0 ? camadas[c][i - 1].cx + (horizontal ? camadas[c][i - 1].h : camadas[c][i - 1].w) / 2 + GAP_C : -Infinity;
      const dir = i < camadas[c].length - 1 ? camadas[c][i + 1].cx - (horizontal ? camadas[c][i + 1].h : camadas[c][i + 1].w) / 2 - GAP_C : Infinity;
      const alvo = Math.min(Math.max(p.cx, esq + tam / 2), dir - tam / 2);
      if (isFinite(alvo) && alvo + tam / 2 <= extCruz && alvo - tam / 2 >= 0) n.cx = alvo;
    });
  }
  const extPrinc = pos - GAP_P;
  return { nos, porId, setas, frente, camadas, camada, horizontal, extCruz, extPrinc, GAP_P };
}
function desenhaFluxo(spec, avisos) {
  const fl = spec.fluxo || {};
  const L = layoutFluxo(fl, avisos);
  const horizontal = L.horizontal;
  const id = spec.id || 'f';
  // coordenadas reais: vertical → x=cruz, y=principal; horizontal → x=principal, y=cruz
  const X = (n) => horizontal ? n.cy : n.cx, Y = (n) => horizontal ? n.cx : n.cy;
  const notas = (fl.notas || []).filter((t) => { const ok = L.porId[t.no]; if (!ok) avisos.push('fluxo: nota para nó inexistente ' + t.no); return ok; });
  // rótulos de camada à esquerda (só vertical)
  const rotCam = (!horizontal && Array.isArray(fl.rotulos_camadas)) ? fl.rotulos_camadas : null;
  let margEsq = 26, margDir = 26;
  let rotCamW = 0;
  if (rotCam) { rotCamW = Math.max.apply(null, rotCam.map((r) => textW(r, 11, true))); margEsq += rotCamW + 18; }
  // notas: largura reservada por lado
  const notaW = 170;
  notas.forEach((t) => {
    const n = L.porId[t.no]; const cam = L.camadas[L.camada[n.id]];
    const i = cam.indexOf(n);
    t.lado = t.lado || (i === cam.length - 1 ? 'direita' : (i === 0 ? 'esquerda' : 'abaixo'));
    if (horizontal) t.lado = 'abaixo';
    t.m = medidasBloco(t.texto, 11.5, notaW - 16, false);
  });
  if (notas.some((t) => t.lado === 'direita')) margDir += notaW + 14;
  if (notas.some((t) => t.lado === 'esquerda')) margEsq += notaW + 14;
  // canais das setas de volta (lado direito)
  const voltas = L.setas.filter((e) => e.volta);
  let canalW = 0;
  voltas.forEach((e, k) => { e.canal = k; const lw = e.rotulo ? textW(e.rotulo, 11, false) + 10 : 0; e.lw = lw; canalW += 26 + lw; });
  if (voltas.length) margDir += canalW + 6;
  const cruzExt = L.extCruz, princExt = L.extPrinc;
  const contW = horizontal ? princExt : cruzExt, contH = horizontal ? cruzExt : princExt;
  // notas abaixo: acrescentam altura à camada (vertical) — aproximação: reservam espaço no fim
  let extraH = 0;
  notas.filter((t) => t.lado === 'abaixo').forEach((t) => { extraH = Math.max(extraH, 0); });
  const W = Math.max(420, Math.round(margEsq + contW + margDir));
  const topo = alturaTopo(spec, W);
  const ox = margEsq + (W - margEsq - margDir - contW) / 2, oy = topo;
  let s = '';
  const px = (n) => ox + X(n), py = (n) => oy + Y(n);
  // rótulos de camada
  if (rotCam) {
    L.camadas.forEach((cam, c) => {
      if (!rotCam[c]) return;
      const y = oy + cam[0].cy;
      s += txt(14 + rotCamW, y + 4, rotCam[c], { size: 11, bold: true, fill: P.slate, anchor: 'end', extra: ' letter-spacing=".04em"' });
    });
  }
  // setas da frente
  function borda(n, dx, dy) { // ponto da borda da caixa na direção (dx,dy) a partir do centro
    const w = n.w / 2, h = n.h / 2;
    if (Math.abs(dx) < 1e-6) return [px(n), py(n) + (dy > 0 ? h : -h)];
    if (Math.abs(dy) < 1e-6) return [px(n) + (dx > 0 ? w : -w), py(n)];
    const tx = w / Math.abs(dx), ty = h / Math.abs(dy), t = Math.min(tx, ty);
    return [px(n) + dx * t, py(n) + dy * t];
  }
  const rotulos = [];
  L.frente.forEach((e) => {
    const a = L.porId[e.de], b = L.porId[e.para];
    const marker = e.tipo === 'inibe' ? '' : (e.tipo === 'estimula' ? 'av' : (e.tipo === 'fraca' ? 'as' : 'ag'));
    const stroke = e.tipo === 'inibe' ? P.red : (e.tipo === 'estimula' ? P.green : (e.tipo === 'fraca' ? P.grey : P.gold));
    const dash = e.tipo === 'fraca' ? ' stroke-dasharray="5 4"' : '';
    let p1, p2, d, mx, my, anc = 'middle';
    const salto = L.camada[b.id] - L.camada[a.id];
    if (!horizontal) {
      p1 = [px(a), py(a) + a.h / 2]; p2 = [px(b), py(b) - b.h / 2];
      if (salto > 1) {
        // desvia por um corredor lateral, fora das camadas intermediárias
        let maxX = -Infinity, minX = Infinity;
        for (let c = L.camada[a.id] + 1; c < L.camada[b.id]; c++) L.camadas[c].forEach((n) => { maxX = Math.max(maxX, px(n) + n.w / 2); minX = Math.min(minX, px(n) - n.w / 2); });
        const med = (p1[0] + p2[0]) / 2;
        const dir = Math.abs(med - maxX) < Math.abs(med - minX);
        const cx = dir ? maxX + 26 : minX - 26;
        const y1 = p1[1] + 20, y2 = p2[1] - 20;
        d = 'M' + r1(p1[0]) + ',' + r1(p1[1]) + ' C' + r1(p1[0]) + ',' + r1(y1) + ' ' + r1(cx) + ',' + r1(y1) + ' ' + r1(cx) + ',' + r1((y1 + y2) / 2) + ' S' + r1(p2[0]) + ',' + r1(y2) + ' ' + r1(p2[0]) + ',' + r1(p2[1]);
        mx = cx + (dir ? 8 : -8); my = (y1 + y2) / 2; anc = dir ? 'start' : 'end';
      } else if (Math.abs(p1[0] - p2[0]) < 1) {
        d = 'M' + r1(p1[0]) + ',' + r1(p1[1]) + ' L' + r1(p2[0]) + ',' + r1(p2[1]);
        mx = p1[0]; my = (p1[1] + p2[1]) / 2;
      } else {
        const ym = (p1[1] + p2[1]) / 2;
        d = 'M' + r1(p1[0]) + ',' + r1(p1[1]) + ' C' + r1(p1[0]) + ',' + r1(ym) + ' ' + r1(p2[0]) + ',' + r1(ym) + ' ' + r1(p2[0]) + ',' + r1(p2[1]);
        mx = (p1[0] + p2[0]) / 2; my = ym;
      }
    } else {
      p1 = [px(a) + a.w / 2, py(a)]; p2 = [px(b) - b.w / 2, py(b)];
      if (Math.abs(p1[1] - p2[1]) < 1) { d = 'M' + r1(p1[0]) + ',' + r1(p1[1]) + ' L' + r1(p2[0]) + ',' + r1(p2[1]); }
      else { const xm = (p1[0] + p2[0]) / 2; d = 'M' + r1(p1[0]) + ',' + r1(p1[1]) + ' C' + r1(xm) + ',' + r1(p1[1]) + ' ' + r1(xm) + ',' + r1(p2[1]) + ' ' + r1(p2[0]) + ',' + r1(p2[1]); }
      mx = (p1[0] + p2[0]) / 2; my = (p1[1] + p2[1]) / 2;
    }
    s += '<path d="' + d + '" fill="none" stroke="' + stroke + '" stroke-width="2.2"' + dash + (marker ? ' marker-end="url(#' + id + '-' + marker + ')"' : '') + '/>';
    if (e.tipo === 'inibe') { // barra de inibição no destino
      if (!horizontal) s += '<line x1="' + r1(p2[0] - 7) + '" y1="' + r1(p2[1]) + '" x2="' + r1(p2[0] + 7) + '" y2="' + r1(p2[1]) + '" stroke="' + P.red + '" stroke-width="3"/>';
      else s += '<line x1="' + r1(p2[0]) + '" y1="' + r1(p2[1] - 7) + '" x2="' + r1(p2[0]) + '" y2="' + r1(p2[1] + 7) + '" stroke="' + P.red + '" stroke-width="3"/>';
    }
    if (e.rotulo) rotulos.push({ x: mx, y: my, t: e.rotulo, cor: e.tipo === 'inibe' ? P.red : P.slate, anchor: anc });
  });
  // setas de volta pelo corredor da direita
  const direitaMax = ox + contW;
  voltas.forEach((e) => {
    const a = L.porId[e.de], b = L.porId[e.para];
    const chX = direitaMax + 22 + e.canal * 26 + voltas.slice(0, e.canal).reduce((t, v) => t + v.lw, 0);
    const marker = e.tipo === 'inibe' ? '' : 'ar';
    let d, ly;
    if (!horizontal) {
      const ya = py(a), yb = py(b), xa = px(a) + a.w / 2, xb = px(b) + b.w / 2;
      const r = 10;
      d = 'M' + r1(xa) + ',' + r1(ya) + ' H' + r1(chX - r) + ' Q' + r1(chX) + ',' + r1(ya) + ' ' + r1(chX) + ',' + r1(ya - r) + ' V' + r1(yb + r) + ' Q' + r1(chX) + ',' + r1(yb) + ' ' + r1(chX - r) + ',' + r1(yb) + ' H' + r1(xb + 2);
      ly = (ya + yb) / 2;
      if (e.tipo === 'inibe') s += '<line x1="' + r1(xb + 2) + '" y1="' + r1(yb - 7) + '" x2="' + r1(xb + 2) + '" y2="' + r1(yb + 7) + '" stroke="' + P.red + '" stroke-width="3"/>';
    } else {
      const xa = px(a), xb = px(b), ya = py(a) + a.h / 2, yb = py(b) + b.h / 2;
      const chY = oy + contH + 22 + e.canal * 26, r = 10;
      d = 'M' + r1(xa) + ',' + r1(ya) + ' V' + r1(chY - r) + ' Q' + r1(xa) + ',' + r1(chY) + ' ' + r1(xa - r) + ',' + r1(chY) + ' H' + r1(xb + r) + ' Q' + r1(xb) + ',' + r1(chY) + ' ' + r1(xb) + ',' + r1(chY - r) + ' V' + r1(yb + 2);
      ly = chY;
    }
    s += '<path d="' + d + '" fill="none" stroke="' + P.red + '" stroke-width="2" stroke-dasharray="6 5"' + (marker ? ' marker-end="url(#' + id + '-' + marker + ')"' : '') + '/>';
    if (e.rotulo) { if (!horizontal) s += txt(chX + 6, ly + 4, e.rotulo, { size: 11, fill: P.red, anchor: 'start', extra: ' class="lbl"' }); else rotulos.push({ x: (px(a) + px(b)) / 2, y: ly, t: e.rotulo, cor: P.red }); }
  });
  // nós
  L.nos.forEach((n) => {
    const st = n.st, x = px(n) - n.w / 2, y = py(n) - n.h / 2;
    if (st.hex) {
      const k = 16;
      s += '<polygon points="' + [x + k, y, x + n.w - k, y, x + n.w, y + n.h / 2, x + n.w - k, y + n.h, x + k, y + n.h, x, y + n.h / 2].map(r1).join(' ') + '" fill="' + st.f + '" stroke="' + st.b + '" stroke-width="1.5"/>';
    } else {
      s += '<rect x="' + r1(x) + '" y="' + r1(y) + '" width="' + r1(n.w) + '" height="' + r1(n.h) + '" rx="' + Math.min(st.rx, n.h / 2) + '" fill="' + st.f + '" stroke="' + st.b + '" stroke-width="1.5"/>';
    }
    const esq = st.esquerda;
    s += blocoMedido(esq ? x + 14 : px(n), y + 9, n.m, n.s1, { fill: st.t, fill2: st.t2, anchor: esq ? 'start' : 'middle' });
  });
  // rótulos das setas (pílula branca por cima)
  rotulos.forEach((r) => {
    const w = textW(r.t, 11, false) + 10;
    const xr = r.anchor === 'start' ? r.x - 5 : (r.anchor === 'end' ? r.x - w + 5 : r.x - w / 2);
    s += '<rect x="' + r1(xr) + '" y="' + r1(r.y - 8) + '" width="' + r1(w) + '" height="16" rx="8" fill="' + P.white + '" fill-opacity=".92"/>';
    s += txt(r.x, r.y + 4, r.t, { size: 11, fill: r.cor, anchor: r.anchor || 'middle', extra: ' class="lbl"' });
  });
  // notas laterais
  let fimH = contH;
  if (horizontal && voltas.length) fimH = Math.max(fimH, contH + 22 + voltas.length * 26 + 12);
  notas.forEach((t) => {
    const n = L.porId[t.no];
    const h = t.m.h + 12, w = notaW;
    let x, y = py(n) - h / 2;
    if (t.lado === 'direita') { x = ox + contW + 14; s += '<line x1="' + r1(px(n) + n.w / 2) + '" y1="' + r1(py(n)) + '" x2="' + r1(x) + '" y2="' + r1(py(n)) + '" stroke="' + P.grey + '" stroke-width="1" stroke-dasharray="3 3"/>'; }
    else if (t.lado === 'esquerda') { x = ox - 14 - w; s += '<line x1="' + r1(x + w) + '" y1="' + r1(py(n)) + '" x2="' + r1(px(n) - n.w / 2) + '" y2="' + r1(py(n)) + '" stroke="' + P.grey + '" stroke-width="1" stroke-dasharray="3 3"/>'; }
    else { x = px(n) - w / 2; y = py(n) + n.h / 2 + 8; fimH = Math.max(fimH, y + h - oy); }
    s += '<rect x="' + r1(x) + '" y="' + r1(y) + '" width="' + w + '" height="' + r1(h) + '" rx="8" fill="' + P.cream + '" stroke="' + P.gold + '" stroke-width="1"/>';
    s += blocoMedido(x + 8, y + 6, t.m, 11.5, { fill: P.ink, anchor: 'start', noBold: true });
  });
  // legenda opcional
  if (fl.legenda) {
    const ly = oy + fimH + 16;
    s += txt(ox, ly + 10, fl.legenda, { size: 11, italic: true, fill: P.slate, anchor: 'start' });
    fimH += 30;
  }
  return moldura(spec, W, fimH, s, topo);
}

// ═══════════════════════════ PAINEL ══════════════════════════════════════
function desenhaPainel(spec, avisos) {
  const pn = spec.painel || {};
  const cols = pn.colunas || [];
  if (!cols.length) { avisos.push('painel sem colunas'); return ''; }
  const n = cols.length;
  const colW = n <= 2 ? 320 : (n === 3 ? 236 : (n === 4 ? 184 : 160));
  const size = n >= 4 ? 11.5 : 12.5;
  const gap = 14, marg = 24;
  const W = Math.max(420, marg * 2 + n * colW + (n - 1) * gap);
  const topo = alturaTopo(spec, W);
  let s = '', maxH = 0;
  const medidas = cols.map((c) => {
    const tit = wrap(c.titulo, size + 0.5, true, colW - 24);
    const itens = (c.itens || []).map((it) => wrap(it, size, false, colW - 34));
    const hTit = tit.length * (size + 0.5) * 1.3 + 10;
    const hIt = itens.reduce((t, l) => t + l.length * size * 1.3 + 6, 0) + 10;
    return { tit, itens, hTit, hIt };
  });
  medidas.forEach((m) => { maxH = Math.max(maxH, m.hTit + m.hIt); });
  cols.forEach((c, i) => {
    const m = medidas[i], x = marg + i * (colW + gap), y = topo, k = cor(c.cor || ['navy', 'gold', 'green', 'red', 'blue'][i % 5]);
    s += '<rect x="' + x + '" y="' + y + '" width="' + colW + '" height="' + r1(maxH) + '" rx="12" fill="' + P.cream + '" stroke="' + P.line + '"/>';
    s += '<path d="M' + x + ',' + (y + 12) + ' Q' + x + ',' + y + ' ' + (x + 12) + ',' + y + ' H' + (x + colW - 12) + ' Q' + (x + colW) + ',' + y + ' ' + (x + colW) + ',' + (y + 12) + ' V' + r1(y + m.hTit) + ' H' + x + ' Z" fill="' + k.s + '"/>';
    let yy = y + 6;
    m.tit.forEach((l) => { yy += (size + 0.5) * 1.3; s += txt(x + colW / 2, yy - 4, l, { size: size + 0.5, bold: true, fill: (c.cor === 'gold' || c.cor === 'cream') ? P.navy : P.white, anchor: 'middle' }); });
    yy = y + m.hTit + 6;
    m.itens.forEach((linhas) => {
      linhas.forEach((l, j) => { yy += size * 1.3; if (j === 0) s += txt(x + 12, yy - 3, '•', { size, fill: k.s, anchor: 'middle' }); s += txt(x + 22, yy - 3, l, { size, fill: P.ink, anchor: 'start' }); });
      yy += 6;
    });
  });
  let fimH = maxH;
  if (pn.rodape) { wrap(pn.rodape, 11.5, false, W - 2 * marg).forEach((l) => { fimH += 16; s += txt(marg, topo + fimH + 2, l, { size: 11.5, italic: true, fill: P.slate, anchor: 'start' }); }); fimH += 4; }
  return moldura(spec, W, fimH, s, topo);
}

// ═══════════════════════════ ESCADA ══════════════════════════════════════
function desenhaEscada(spec, avisos) {
  const es = spec.escada || {};
  const degs = es.degraus || [];
  if (degs.length < 2) { avisos.push('escada com menos de 2 degraus'); return ''; }
  const n = degs.length, sw = n <= 4 ? 160 : 140, gap = 22, rise = 40, marg = 24, size = n <= 4 ? 12.5 : 12;
  const W = Math.max(420, marg * 2 + n * sw + (n - 1) * gap);
  const topo = alturaTopo(spec, W);
  const med = degs.map((d) => medidasBloco(d.titulo + (d.detalhe ? '\n' + d.detalhe : ''), size + 0.5, sw - 20, true));
  const boxH = Math.max.apply(null, med.map((m) => m.h)) + 16;
  const totalH = boxH + (n - 1) * rise + (es.eixo ? 30 : 8);
  let s = '';
  degs.forEach((d, i) => {
    const x = marg + i * (sw + gap), y = topo + (n - 1 - i) * rise, k = cor(d.cor || (i === n - 1 ? 'navy' : (i === 0 ? 'cream' : 'gold')));
    // degrau: a caixa e o "piso" até a base
    s += '<rect x="' + x + '" y="' + r1(y + boxH) + '" width="' + sw + '" height="' + r1(totalH - (n - 1 - i) * rise - boxH - (es.eixo ? 30 : 8)) + '" fill="' + P.line + '" fill-opacity=".55"/>';
    s += '<rect x="' + x + '" y="' + y + '" width="' + sw + '" height="' + r1(boxH) + '" rx="10" fill="' + k.f + '" stroke="' + k.b + '" stroke-width="1.5"/>';
    s += blocoMedido(x + sw / 2, y + 8, med[i], size + 0.5, { fill: k.t, fill2: k.f === P.navy ? '#e9eef7' : P.ink, anchor: 'middle' });
    if (i < n - 1) s += '<path d="M' + r1(x + sw + 3) + ',' + r1(y + boxH / 2) + ' L' + r1(x + sw + gap - 4) + ',' + r1(y - rise + boxH / 2) + '" fill="none" stroke="' + P.gold + '" stroke-width="2.2" marker-end="url(#' + (spec.id || 'f') + '-ag)"/>';
  });
  if (es.eixo) {
    const y = topo + totalH - 12;
    s += '<line x1="' + marg + '" y1="' + y + '" x2="' + (W - marg) + '" y2="' + y + '" stroke="' + P.slate + '" stroke-width="1.5" marker-end="url(#' + (spec.id || 'f') + '-as)"/>';
    s += txt(W / 2, y - 6, es.eixo, { size: 11.5, italic: true, fill: P.slate, anchor: 'middle' });
  }
  return moldura(spec, W, totalH, s, topo);
}

// ═══════════════════════════ CURVAS ══════════════════════════════════════
function suave(pts) {
  if (pts.length < 3) return 'M' + pts.map((p) => r1(p[0]) + ',' + r1(p[1])).join(' L');
  let d = 'M' + r1(pts[0][0]) + ',' + r1(pts[0][1]);
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6], c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ' C' + r1(c1[0]) + ',' + r1(c1[1]) + ' ' + r1(c2[0]) + ',' + r1(c2[1]) + ' ' + r1(p2[0]) + ',' + r1(p2[1]);
  }
  return d;
}
function desenhaCurvas(spec, avisos) {
  const cv = spec.curvas || {};
  const series = cv.series || [];
  if (!series.length) { avisos.push('curvas sem séries'); return ''; }
  const cats = (cv.x && cv.x.categorias) || [];
  const nPts = cats.length || Math.max.apply(null, series.map((sr) => (sr.valores || []).length));
  const W = cv.largura || 640, marg = { l: 62, r: 26, t: 10, b: 58 };
  const topo = alturaTopo(spec, W);
  const plotH = cv.altura || 230, plotW = W - marg.l - marg.r;
  const x0 = marg.l, x1 = marg.l + plotW, y1 = topo + marg.t, y0 = y1 + plotH;
  const ymin = (cv.y && cv.y.min != null) ? cv.y.min : 0, ymax = (cv.y && cv.y.max != null) ? cv.y.max : 100;
  const X = (i) => x0 + (nPts > 1 ? (i / (nPts - 1)) * plotW : plotW / 2);
  const Y = (v) => y0 - ((v - ymin) / (ymax - ymin)) * plotH;
  let s = '';
  // faixas no eixo y
  (cv.faixas_y || []).forEach((f) => {
    const k = cor(f.cor || 'green');
    s += '<rect x="' + x0 + '" y="' + r1(Y(f.ate)) + '" width="' + plotW + '" height="' + r1(Y(f.de) - Y(f.ate)) + '" fill="' + k.f + '" fill-opacity=".7"/>';
    if (f.rotulo) { const w = textW(f.rotulo, 11, false) + 10; s += '<rect x="' + r1(x1 - 6 - w) + '" y="' + r1(Y(f.ate) + 3) + '" width="' + r1(w) + '" height="15" rx="7" fill="' + P.white + '" fill-opacity=".85"/>'; s += txt(x1 - 11, Y(f.ate) + 14, f.rotulo, { size: 11, fill: k.s, anchor: 'end', italic: true, extra: ' class="lbl"' }); }
  });
  (cv.faixas_x || []).forEach((f) => {
    const k = cor(f.cor || 'slate');
    s += '<rect x="' + r1(X(f.de)) + '" y="' + y1 + '" width="' + r1(X(f.ate) - X(f.de)) + '" height="' + plotH + '" fill="' + k.f + '" fill-opacity=".6"/>';
    if (f.rotulo) s += txt((X(f.de) + X(f.ate)) / 2, y1 + 13, f.rotulo, { size: 11, fill: k.s, anchor: 'middle', italic: true });
  });
  // grade e eixos
  const marcas = (cv.y && cv.y.marcas) || null;
  for (let g = 0; g <= 4; g++) { const yy = y1 + (g * plotH) / 4; s += '<line x1="' + x0 + '" y1="' + r1(yy) + '" x2="' + x1 + '" y2="' + r1(yy) + '" stroke="#eef2f7"/>'; }
  if (marcas) marcas.forEach((m) => { s += txt(x0 - 8, Y(m.v) + 4, m.rotulo != null ? m.rotulo : m.v, { size: 11, fill: P.slate, anchor: 'end' }); s += '<line x1="' + (x0 - 4) + '" y1="' + r1(Y(m.v)) + '" x2="' + x0 + '" y2="' + r1(Y(m.v)) + '" stroke="' + P.grey + '"/>'; });
  s += '<line x1="' + x0 + '" y1="' + y1 + '" x2="' + x0 + '" y2="' + y0 + '" stroke="' + P.grey + '" stroke-width="1.5"/>';
  s += '<line x1="' + x0 + '" y1="' + y0 + '" x2="' + x1 + '" y2="' + y0 + '" stroke="' + P.grey + '" stroke-width="1.5"/>';
  if (cv.y && cv.y.rotulo) s += '<text class="rot" transform="translate(' + (marg.l - 44) + ' ' + r1((y0 + y1) / 2) + ') rotate(-90)" text-anchor="middle" font-family="' + FONT + '" font-size="12" fill="' + P.slate + '">' + esc(cv.y.rotulo) + '</text>';
  cats.forEach((c, i) => { wrap(c, 11, false, plotW / nPts - 4).forEach((l, j) => { s += txt(X(i), y0 + 16 + j * 13, l, { size: 11, fill: P.slate, anchor: 'middle' }); }); });
  if (cv.x && cv.x.rotulo) s += txt((x0 + x1) / 2, y0 + 44, cv.x.rotulo, { size: 12, fill: P.slate, anchor: 'middle' });
  // séries
  series.forEach((sr, k) => {
    const c = sr.cor ? cor(sr.cor).s : SERIES[k % SERIES.length];
    const pts = (sr.valores || []).map((v, i) => (v == null ? null : [X(i), Y(v)])).filter(Boolean);
    s += '<path d="' + (sr.reta ? 'M' + pts.map((p) => r1(p[0]) + ',' + r1(p[1])).join(' L') : suave(pts)) + '" fill="none" stroke="' + c + '" stroke-width="2.6"' + (sr.tracejada ? ' stroke-dasharray="6 5"' : '') + ' stroke-linecap="round"/>';
    if (sr.pontos !== false) pts.forEach((p) => { s += '<circle cx="' + r1(p[0]) + '" cy="' + r1(p[1]) + '" r="3.2" fill="' + P.white + '" stroke="' + c + '" stroke-width="2"/>'; });
  });
  (cv.anotacoes || []).forEach((a) => {
    const sr = series[a.serie || 0]; if (!sr) return; const v = (sr.valores || [])[a.indice]; if (v == null) return;
    const x = X(a.indice), y = Y(v) - 12;
    const w = textW(a.texto, 11, true) + 10;
    s += '<rect x="' + r1(x - w / 2) + '" y="' + r1(y - 12) + '" width="' + r1(w) + '" height="16" rx="8" fill="' + P.white + '" fill-opacity=".9"/>';
    s += txt(x, y, a.texto, { size: 11, bold: true, fill: P.ink, anchor: 'middle', extra: ' class="lbl"' });
  });
  // legenda em linha
  let lx = x0, ly = y0 + (cv.x && cv.x.rotulo ? 62 : 44);
  series.forEach((sr, k) => {
    const c = sr.cor ? cor(sr.cor).s : SERIES[k % SERIES.length];
    s += '<line x1="' + lx + '" y1="' + ly + '" x2="' + (lx + 22) + '" y2="' + ly + '" stroke="' + c + '" stroke-width="3"' + (sr.tracejada ? ' stroke-dasharray="6 5"' : '') + '/>';
    s += txt(lx + 28, ly + 4, sr.nome, { size: 11.5, fill: P.ink, anchor: 'start' });
    lx += 28 + textW(sr.nome, 11.5, false) + 22;
  });
  let fimH = ly + 8 - topo;
  if (cv.legenda) { fimH += 18; s += txt(x0, topo + fimH, cv.legenda, { size: 11, italic: true, fill: P.slate, anchor: 'start' }); }
  return moldura(spec, W, fimH, s, topo);
}

// ═══════════════════════════ LINHA DO TEMPO ══════════════════════════════
function desenhaLinhaTempo(spec, avisos) {
  const lt = spec.linha_tempo || {};
  const marcos = lt.marcos || [];
  if (!marcos.length) { avisos.push('linha_tempo sem marcos'); return ''; }
  const W = lt.largura || 700, marg = 40, size = 11.5;
  const topo = alturaTopo(spec, W);
  const temFaixas = (lt.faixas || []).length > 0;
  const acima = marcos.map((m, i) => (m.lado ? m.lado === 'acima' : (temFaixas ? true : i % 2 === 0)));
  const nMax = Math.max(acima.filter(Boolean).length, acima.filter((a) => !a).length, 1);
  const caixaW = Math.min(170, Math.max(96, Math.floor((W - 2 * marg + 40 - 6 * (nMax - 1)) / nMax)));
  const med = marcos.map((m) => medidasBloco(m.rotulo + (m.detalhe ? '\n' + m.detalhe : ''), size + 0.5, caixaW - 14, true));
  const hA = Math.max.apply(null, med.map((m, i) => (acima[i] ? m.h + 10 : 0)).concat([0]));
  const hB = Math.max.apply(null, med.map((m, i) => (!acima[i] ? m.h + 10 : 0)).concat([0]));
  const yEixo = topo + hA + 34, x0 = marg + 10, x1 = W - marg - 10;
  const X = (p) => x0 + (p / 100) * (x1 - x0);
  let s = '';
  (lt.faixas || []).forEach((f) => {
    const k = cor(f.cor || 'slate');
    s += '<rect x="' + r1(X(f.de)) + '" y="' + r1(yEixo - 7) + '" width="' + r1(X(f.ate) - X(f.de)) + '" height="14" rx="4" fill="' + k.s + '" fill-opacity=".85"/>';
    if (f.rotulo) wrap(f.rotulo, 11, false, X(f.ate) - X(f.de) + 30).forEach((l, j) => { s += txt((X(f.de) + X(f.ate)) / 2, yEixo + 24 + j * 13, l, { size: 11, fill: k.s, anchor: 'middle', bold: true }); });
  });
  s += '<line x1="' + marg + '" y1="' + yEixo + '" x2="' + (W - marg) + '" y2="' + yEixo + '" stroke="' + P.navy + '" stroke-width="2.5" marker-end="url(#' + (spec.id || 'f') + '-as)"/>';
  if (lt.eixo) s += txt(W - marg, yEixo + (temFaixas ? 50 : 20), lt.eixo, { size: 11, italic: true, fill: P.slate, anchor: 'end' });
  const xs = marcos.map((m, i) => X(m.pos != null ? m.pos : (i / Math.max(1, marcos.length - 1)) * 100));
  const bxs = xs.map((x) => Math.min(Math.max(x - caixaW / 2, marg - 20), W - marg + 20 - caixaW));
  [true, false].forEach((lado) => {
    const ids = marcos.map((m, i) => i).filter((i) => acima[i] === lado).sort((a, b) => xs[a] - xs[b]);
    for (let k = 1; k < ids.length; k++) bxs[ids[k]] = Math.max(bxs[ids[k]], bxs[ids[k - 1]] + caixaW + 6);
    if (ids.length) { const sobra = bxs[ids[ids.length - 1]] + caixaW - (W - marg + 20); if (sobra > 0) { for (let k = ids.length - 1; k >= 0; k--) { bxs[ids[k]] -= sobra; if (k > 0 && bxs[ids[k]] - bxs[ids[k - 1]] >= caixaW + 6) break; } } }
  });
  marcos.forEach((m, i) => {
    const x = xs[i], k = cor(m.cor || 'cream');
    s += '<circle cx="' + r1(x) + '" cy="' + yEixo + '" r="6" fill="' + P.white + '" stroke="' + k.s + '" stroke-width="2.5"/>';
    const h = med[i].h + 10;
    let bx = bxs[i], by;
    const xc = bx + caixaW / 2;
    if (acima[i]) { by = yEixo - 20 - h; s += '<line x1="' + r1(x) + '" y1="' + r1(yEixo - 6) + '" x2="' + r1(xc) + '" y2="' + r1(by + h) + '" stroke="' + k.s + '" stroke-width="1.2"/>'; }
    else { by = yEixo + 20 + (temFaixas ? 30 : 0); s += '<line x1="' + r1(x) + '" y1="' + r1(yEixo + 6) + '" x2="' + r1(xc) + '" y2="' + r1(by) + '" stroke="' + k.s + '" stroke-width="1.2"/>'; }
    s += '<rect x="' + r1(bx) + '" y="' + r1(by) + '" width="' + r1(caixaW) + '" height="' + r1(h) + '" rx="8" fill="' + k.f + '" stroke="' + k.b + '" stroke-width="1.2"/>';
    s += blocoMedido(bx + caixaW / 2, by + 5, med[i], size + 0.5, { fill: k.t, fill2: k.f === P.navy ? '#e9eef7' : P.ink, anchor: 'middle' });
  });
  const fimH = hA + 34 + 20 + (temFaixas ? 30 : 0) + hB + 16 + (lt.eixo && !hB ? 10 : 0);
  return moldura(spec, W, fimH, s, topo);
}

// ═══════════════════════════ ESPECTRO ════════════════════════════════════
function desenhaEspectro(spec, avisos) {
  const ep = spec.espectro || {};
  const segs = ep.segmentos || [];
  if (segs.length < 2) { avisos.push('espectro com menos de 2 segmentos'); return ''; }
  const W = ep.largura || 700, marg = 28, barH = 36;
  const topo = alturaTopo(spec, W);
  const pesos = segs.map((g) => g.peso || 1), tot = pesos.reduce((a, b) => a + b, 0);
  const x0 = marg, larg = W - 2 * marg;
  let s = '', x = x0;
  const yMarc = topo + 10, yBar = yMarc + ((ep.marcadores || []).length ? 34 : 0);
  const med = segs.map((g, i) => ({ w: (pesos[i] / tot) * larg, det: g.detalhe ? wrap(g.detalhe, 11.5, false, (pesos[i] / tot) * larg - 10) : [] }));
  const detH = Math.max.apply(null, med.map((m) => m.det.length * 15)) + (med.some((m) => m.det.length) ? 10 : 0);
  segs.forEach((g, i) => {
    const w = med[i].w, k = cor(g.cor || ['green', 'gold', 'amber', 'red', 'navy'][i % 5]);
    s += '<rect x="' + r1(x) + '" y="' + yBar + '" width="' + r1(w) + '" height="' + barH + '" fill="' + k.s + '"' + (i === 0 ? ' rx="8"' : '') + '/>';
    if (i === 0 || i === segs.length - 1) s += '<rect x="' + r1(x) + '" y="' + yBar + '" width="' + r1(w) + '" height="' + barH + '" rx="8" fill="' + k.s + '"/>';
    if (i > 0 && i < segs.length - 1) s += '<rect x="' + r1(x) + '" y="' + yBar + '" width="' + r1(w) + '" height="' + barH + '" fill="' + k.s + '"/>';
    const rot = wrap(g.rotulo, 12, true, w - 8);
    const dentro = rot.length <= 2 && rot.every((l) => textW(l, 12, true) <= w - 8);
    if (dentro) rot.forEach((l, j) => { s += txt(x + w / 2, yBar + barH / 2 + 4 + (j - (rot.length - 1) / 2) * 14, l, { size: 12, bold: true, fill: (g.cor === 'gold' || g.cor === 'cream') ? P.navy : P.white, anchor: 'middle' }); });
    else avisos.push('espectro: rótulo não cabe no segmento "' + g.rotulo + '"');
    med[i].det.forEach((l, j) => { s += txt(x + w / 2, yBar + barH + 18 + j * 15, l, { size: 11.5, fill: P.ink, anchor: 'middle' }); });
    x += w;
  });
  (ep.marcadores || []).forEach((m) => {
    const mx = x0 + (m.pos / 100) * larg;
    s += '<path d="M' + r1(mx) + ',' + (yBar - 4) + ' l-6,-9 h12 z" fill="' + P.navy + '"/>';
    s += txt(mx, yMarc + 8, m.rotulo, { size: 11.5, bold: true, fill: P.navy, anchor: 'middle' });
  });
  let fimH = (yBar - topo) + barH + detH + 10;
  if (ep.eixo) { fimH += 16; s += txt(W / 2, topo + fimH, ep.eixo, { size: 11.5, italic: true, fill: P.slate, anchor: 'middle' }); fimH += 4; }
  return moldura(spec, W, fimH, s, topo);
}

// ═══════════════════════════ CICLO ═══════════════════════════════════════
function desenhaCiclo(spec, avisos) {
  const ci = spec.ciclo || {};
  const et = ci.etapas || [];
  if (et.length < 3 || et.length > 8) { avisos.push('ciclo precisa de 3 a 8 etapas'); return ''; }
  const n = et.length, size = 12.5, boxW = 150;
  const med = et.map((e) => medidasBloco(e.texto, size, boxW - 20, true));
  const R = n <= 4 ? 150 : (n <= 6 ? 185 : 215);
  const W = Math.max(520, 2 * R + boxW + 60);
  const topo = alturaTopo(spec, W);
  const maxH = Math.max.apply(null, med.map((m) => m.h)) + 16;
  const cx = W / 2, cy = topo + R + maxH / 2 + 10;
  let s = '';
  const ang = (i) => -Math.PI / 2 + (i / n) * 2 * Math.PI;
  et.forEach((e, i) => {
    const a1 = ang(i), a2 = ang(i + 1), delta = (2 * Math.PI) / n;
    const d1 = Math.min(delta * 0.36, Math.atan2(maxH * 0.6, R) + 0.18), d2 = d1;
    const p1 = [cx + R * Math.cos(a1 + d1), cy + R * Math.sin(a1 + d1)], p2 = [cx + R * Math.cos(a2 - d2), cy + R * Math.sin(a2 - d2)];
    s += '<path d="M' + r1(p1[0]) + ',' + r1(p1[1]) + ' A' + R + ',' + R + ' 0 0 1 ' + r1(p2[0]) + ',' + r1(p2[1]) + '" fill="none" stroke="' + P.gold + '" stroke-width="2.4" marker-end="url(#' + (spec.id || 'f') + '-ag)"/>';
  });
  et.forEach((e, i) => {
    const a = ang(i), x = cx + R * Math.cos(a), y = cy + R * Math.sin(a), k = cor(e.cor || (i === 0 ? 'navy' : 'cream')), h = med[i].h + 16;
    s += '<rect x="' + r1(x - boxW / 2) + '" y="' + r1(y - h / 2) + '" width="' + boxW + '" height="' + r1(h) + '" rx="10" fill="' + k.f + '" stroke="' + k.b + '" stroke-width="1.5"/>';
    s += blocoMedido(x, y - h / 2 + 8, med[i], size, { fill: k.t, fill2: k.f === P.navy ? '#e9eef7' : P.ink, anchor: 'middle' });
  });
  if (ci.centro) { const m = medidasBloco(ci.centro, 13, 2 * R - boxW - 40, true); s += blocoMedido(cx, cy - m.h / 2, m, 13, { fill: P.navy, fill2: P.ink, anchor: 'middle' }); }
  return moldura(spec, W, 2 * R + maxH + 20, s, topo);
}

// ═══════════════════════════ entrada ═════════════════════════════════════
const PROIBIDO = ['<image', '<foreignobject', '<script', 'href=', 'xlink:', '@import', 'url(http', 'javascript:', '<style'];
function render(spec) {
  const avisos = [];
  if (!spec || !spec.titulo) throw new Error('especificação sem título');
  spec.id = spec.id || 'f' + String(spec.slug || spec.i || 'x').replace(/[^a-z0-9]/gi, '').slice(-10);
  const D = { fluxo: desenhaFluxo, painel: desenhaPainel, escada: desenhaEscada, curvas: desenhaCurvas, linha_tempo: desenhaLinhaTempo, espectro: desenhaEspectro, ciclo: desenhaCiclo };
  if (!D[spec.tipo]) throw new Error('tipo desconhecido: ' + spec.tipo);
  const svg = D[spec.tipo](spec, avisos);
  const low = svg.toLowerCase();
  PROIBIDO.forEach((p) => { if (low.indexOf(p) >= 0) throw new Error('conteúdo proibido no SVG: ' + p); });
  const m = /viewBox="0 0 (\d+(?:\.\d+)?) (\d+(?:\.\d+)?)"/.exec(svg);
  const W = m ? parseFloat(m[1]) : 0, H = m ? parseFloat(m[2]) : 0;
  if (W > 900) avisos.push('largura ' + W + ' > 900 (ruim no celular)');
  if (H > 1100) avisos.push('altura ' + H + ' > 1100');
  if (svg.length > 40000) avisos.push('SVG com ' + svg.length + ' bytes');
  return { svg, avisos, W, H };
}
const slugify = (s) => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
function slugDe(spec) { return spec.slug || (slugify(spec.sub) + '--' + slugify(spec.tema)).slice(0, 90); }
module.exports = { render, slugDe, slugify, wrap, textW };

if (require.main === module) {
  const arqs = process.argv.slice(2);
  const outDir = process.env.SAIDA || path.join(__dirname, '..', '..', 'figuras', 'resumos');
  let erros = 0;
  arqs.forEach((a) => {
    let spec;
    try { spec = JSON.parse(fs.readFileSync(a, 'utf8')); } catch (e) { console.log('✗ ' + a + ': JSON inválido (' + e.message + ')'); erros++; return; }
    try {
      spec.slug = slugDe(spec);
      const r = render(spec);
      fs.writeFileSync(path.join(outDir, spec.slug + '.svg'), r.svg);
      console.log((r.avisos.length ? '⚠ ' : '✓ ') + spec.slug + ' (' + spec.tipo + ', ' + r.W + '×' + r.H + ', ' + (r.svg.length / 1000).toFixed(1) + ' kB)' + (r.avisos.length ? '\n    ' + r.avisos.join('\n    ') : ''));
      if (r.avisos.length) erros++;
    } catch (e) { console.log('✗ ' + a + ': ' + e.message); erros++; }
  });
  process.exit(erros ? 1 : 0);
}
