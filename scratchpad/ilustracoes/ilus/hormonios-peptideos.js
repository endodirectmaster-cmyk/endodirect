'use strict';
// Hormônios: Classes, Síntese e Transporte — síntese dos peptídeos: do gene ao grânulo;
// pró-insulina → insulina + peptídeo C.
const L = require('../lib.js');
const { P } = L;

const AZ = '#2563eb', LJ = '#ea7a12', CINZA = '#94a3b8';
const barra = (x, y, w, cor) => '<rect x="' + x + '" y="' + (y - 4.5) + '" width="' + w + '" height="9" rx="4.5" fill="' + cor + '"/>';
const corte = (x, y) => '<path d="M' + (x - 5) + ',' + (y - 9) + ' L' + (x + 5) + ',' + (y + 9) + '" stroke="' + P.red + '" stroke-width="2.2" stroke-linecap="round"/>';
const granulo = (x, y, r) => '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="#e0e7ff" stroke="' + AZ + '" stroke-width="1.6"/><circle cx="' + x + '" cy="' + y + '" r="' + (r * 0.45) + '" fill="' + P.navy + '"/>';

module.exports = {
  id: 'hormonios-peptideos',
  sub: 'Endocrinologia Básica',
  tema: 'Hormônios: Classes, Síntese e Transporte',
  depoisDe: 'e é o marcador da secreção **endógena** de insulina.',
  titulo: 'Hormônios peptídicos: do gene ao grânulo de secreção',
  subtitulo: 'Nascem como pré-pró-hormônio, são clivados no retículo e nas vesículas de secreção, ficam em grânulos e saem por exocitose dependente de cálcio.',
  legenda: 'Hormônios peptídicos: do gene ao grânulo; o exemplo da pró-insulina e do peptídeo C.',
  lastro: [
    '**pré-pró-hormônio** → clivagem no retículo … secreção **regulada** por exocitose (Ca²⁺-dependente)',
    '**Peptídeos:** o gene é transcrito … (PC1/3, PC2)** em vesículas de secreção.',
    '**pró-insulina → insulina + peptídeo C** (equimolares)',
    '**POMC → ACTH + α/β-MSH + β-endorfina + β-lipotropina**',
    '**pró-PTH → PTH(1–84)**',
    '**pró-glucagon** (que gera GLP-1 no intestino)',
    'O **peptídeo C** tem meia-vida maior … secreção **endógena** de insulina.',
  ],
  W: 820,
  H: 548,
  desenhar() {
    let s = '';
    // ── faixa de cima: a célula, do núcleo à membrana
    const yT = 76, yB = 262, yM = 150;
    s += '<rect x="36" y="' + yT + '" width="712" height="' + (yB - yT) + '" rx="14" fill="' + P.cito + '"/>';
    // membrana à direita (bicamada vertical) e o meio de fora
    for (let y = yT + 6; y <= yB - 6; y += 9.5) {
      s += '<circle cx="744" cy="' + y + '" r="4" fill="' + P.lipHead + '" stroke="' + P.lipHeadB + '" stroke-width="0.8"/>';
      s += '<circle cx="764" cy="' + y + '" r="4" fill="' + P.lipHead + '" stroke="' + P.lipHeadB + '" stroke-width="0.8"/>';
    }
    s += '<rect x="748" y="' + yT + '" width="12" height="' + (yB - yT) + '" fill="' + P.lipTail + '" opacity="0.9"/>';
    const lbl = (x, txt) => L.linhas(x, 196, txt, { size: 10.6, fill: P.ink }).svg;
    // 1. núcleo
    s += L.nucleo(56, yT + 30, 100, 62);
    s += L.dna(66, 146, yT + 68, { amp: 5, per: 26 });
    s += L.txt(70, yT + 46, 'núcleo', { size: 10, italic: true, fill: P.nucleoB, anchor: 'start' });
    s += lbl(106, 'o gene é transcrito\ne traduzido');
    // 2. retículo: pré-pró-hormônio perde o peptídeo-sinal
    [yM - 8, yM + 8, yM + 24].forEach((y) => { s += '<path d="M206,' + y + ' q11,-8 22,0 t22,0 t22,0 t22,0" fill="none" stroke="#c2185b" stroke-width="2"/>'; });
    s += barra(212, yM - 30, 16, CINZA) + corte(233, yM - 30) + barra(238, yM - 30, 56, AZ);
    s += L.txt(250, yT + 22, 'retículo', { size: 10, italic: true, fill: '#880e4f' });
    s += lbl(252, 'pré-pró-hormônio:\nsai o peptídeo-sinal\n(pré → pró)');
    // 3. Golgi e vesícula de secreção: as convertases clivam a pró-proteína
    [0, 9, 18, 27].forEach((d, k) => { s += '<path d="M' + (366 + k * 2) + ',' + (yM - 22 + d) + ' q34,-10 68,0" fill="none" stroke="' + P.amber + '" stroke-width="3" stroke-linecap="round"/>'; });
    s += L.txt(400, yT + 22, 'Golgi', { size: 10, italic: true, fill: P.amberD });
    s += '<circle cx="426" cy="' + (yM + 26) + '" r="15" fill="#ffffff" stroke="' + AZ + '" stroke-width="1.6"/>';
    s += barra(414, yM + 26, 10, AZ) + corte(427, yM + 26) + barra(430, yM + 26, 10, LJ);
    s += L.pilula(374, yM + 26, 'PC1/3, PC2', { size: 9.6, bold: true, f: P.redL, b: P.red, t: P.redD });
    s += lbl(400, 'convertases clivam a\npró-proteína na vesícula');
    // 4. grânulos
    [[530, yM - 14], [556, yM - 2], [534, yM + 14], [560, yM + 24], [586, yM + 6]].forEach((q) => { s += granulo(q[0], q[1], 10); });
    s += lbl(556, 'armazenados\nem grânulos');
    // 5. exocitose, dependente de Ca²⁺
    s += '<path d="M744,' + (yM - 16) + ' a16,16 0 0 0 0,32" fill="#e0e7ff" stroke="' + AZ + '" stroke-width="1.6"/>';
    [[776, yM - 12], [782, yM + 2], [776, yM + 16]].forEach((q) => { s += '<circle cx="' + q[0] + '" cy="' + q[1] + '" r="3.6" fill="' + P.navy + '"/>'; });
    [[674, yM - 20], [690, yM - 8], [676, yM + 6]].forEach((q) => { s += '<circle cx="' + q[0] + '" cy="' + q[1] + '" r="4" fill="#0ea5e9"/>'; });
    s += L.txt(700, yM - 30, 'Ca²⁺', { size: 10.5, bold: true, fill: '#0369a1' });
    s += lbl(690, 'exocitose:\nsecreção regulada,\nCa²⁺-dependente');
    // setas entre as estações
    [[158, 200], [302, 358], [450, 512], [600, 652]].forEach((a) => { s += L.seta('M' + a[0] + ',' + (yM + 4) + ' L' + a[1] + ',' + (yM + 4), { cor: 'slate', w: 2 }); });

    // ── embaixo à esquerda: pró-insulina → insulina + peptídeo C
    const y0 = 282;
    s += '<rect x="36" y="' + y0 + '" width="366" height="182" rx="14" fill="#f8fafc" stroke="' + P.line + '"/>';
    s += L.txt(52, y0 + 24, 'Exemplo: pró-insulina', { size: 13, bold: true, fill: P.ink, anchor: 'start' });
    // pró-insulina em U: braços azuis (viram a insulina), alça laranja (peptídeo C)
    const ax = 86, bx = 128, top = y0 + 50, fundo = y0 + 118;
    s += '<path d="M' + ax + ',' + top + ' L' + ax + ',' + fundo + '" stroke="' + AZ + '" stroke-width="7" stroke-linecap="round"/>';
    s += '<path d="M' + bx + ',' + (top + 14) + ' L' + bx + ',' + fundo + '" stroke="' + AZ + '" stroke-width="7" stroke-linecap="round"/>';
    s += '<path d="M' + ax + ',' + (fundo + 6) + ' C' + ax + ',' + (fundo + 46) + ' ' + bx + ',' + (fundo + 46) + ' ' + bx + ',' + (fundo + 6) + '" fill="none" stroke="' + LJ + '" stroke-width="7" stroke-linecap="round"/>';
    s += corte(ax, fundo + 3) + corte(bx, fundo + 3);
    s += L.txt(107, top - 10, 'pró-insulina', { size: 10.5, italic: true, fill: P.slate });
    s += L.pilula(204, fundo + 4, 'PC1/3, PC2', { size: 9.6, bold: true, f: P.redL, b: P.red, t: P.redD });
    s += L.seta('M170,' + (y0 + 92) + ' L222,' + (y0 + 92), { cor: 'slate', w: 2 });
    // produtos
    s += '<path d="M248,' + (top + 6) + ' L248,' + (fundo - 6) + '" stroke="' + AZ + '" stroke-width="7" stroke-linecap="round"/>';
    s += '<path d="M268,' + (top + 18) + ' L268,' + (fundo - 6) + '" stroke="' + AZ + '" stroke-width="7" stroke-linecap="round"/>';
    s += L.txt(258, fundo + 24, 'insulina', { size: 11, bold: true, fill: P.blueD });
    s += '<path d="M310,' + (y0 + 98) + ' q10,-14 20,0 t20,0 t20,0" fill="none" stroke="' + LJ + '" stroke-width="7" stroke-linecap="round"/>';
    s += L.txt(340, fundo + 24, 'peptídeo C', { size: 11, bold: true, fill: '#9a4a06' });
    s += L.txt(290, y0 + 104, '+', { size: 18, bold: true, fill: P.slate });
    s += L.txt(219, y0 + 170, 'equimolares: uma insulina para cada peptídeo C', { size: 10.6, italic: true, fill: P.ink });

    // ── embaixo à direita: meia-vida e o marcador da secreção endógena
    const x1 = 414;
    s += '<rect x="' + x1 + '" y="' + y0 + '" width="370" height="182" rx="14" fill="#f8fafc" stroke="' + P.line + '"/>';
    s += L.txt(x1 + 16, y0 + 24, 'Meia-vida', { size: 13, bold: true, fill: P.ink, anchor: 'start' });
    const bx0 = x1 + 104, esc = 190 / 30; // 30 min → 190 px
    s += L.txt(bx0 - 10, y0 + 62, 'insulina', { size: 11, bold: true, fill: P.blueD, anchor: 'end' });
    s += '<rect x="' + bx0 + '" y="' + (y0 + 50) + '" width="' + (5 * esc) + '" height="16" rx="4" fill="' + AZ + '"/>';
    s += L.txt(bx0 + 5 * esc + 8, y0 + 62, '~4–6 min', { size: 11, fill: P.ink, anchor: 'start' });
    s += L.txt(bx0 - 10, y0 + 94, 'peptídeo C', { size: 11, bold: true, fill: '#9a4a06', anchor: 'end' });
    s += '<rect x="' + bx0 + '" y="' + (y0 + 82) + '" width="' + (30 * esc) + '" height="16" rx="4" fill="' + LJ + '"/>';
    s += L.txt(bx0 + 30 * esc + 8, y0 + 94, '~30 min', { size: 11, fill: P.ink, anchor: 'start' });
    s += L.linhas(x1 + 185, y0 + 116, 'Dura mais que a insulina: o peptídeo C é o\nmarcador da secreção endógena de insulina.', { size: 11, bold: true, fill: P.navy }).svg;

    // ── outros exemplos
    s += L.nota(36, 476, 748, 'Outros exemplos: POMC → ACTH + α/β-MSH + β-endorfina + β-lipotropina; pró-PTH → PTH(1–84); pró-glucagon, que gera GLP-1 no intestino.', { cor: 'gold', size: 11.2 }).svg;
    return s;
  },
};
