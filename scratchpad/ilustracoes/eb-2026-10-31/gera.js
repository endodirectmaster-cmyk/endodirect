'use strict';
// Ilustrações próprias dos capítulos 149 e 152 (31/10/2026).
// Usa (só leitura) as primitivas e a moldura de scratchpad/ilustracoes/lib.js do repositório,
// as mesmas que geraram endocrinologia-basica--receptores-nucleares.svg.
// Uso: node gera.js   → grava os SVG em figuras/resumos/ilustracoes/
const fs = require('fs');
const path = require('path');
const L = require('/home/user/endodirect/scratchpad/ilustracoes/lib.js');
const { P } = L;
const SAIDA = '/home/user/endodirect/figuras/resumos/ilustracoes';

// ── peças comuns ─────────────────────────────────────────────────────────────
const cartao = (x, y, w, h) => '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="14" fill="#f8fafc" stroke="' + P.line + '"/>';
const T = (x, y, s, o) => L.txt(x, y, s, o);
const bloco = (x, yTop, s, o) => L.linhas(x, yTop, s, o).svg;
const MAT = { c: P.purple, l: P.purpleL, d: P.purpleD }; // alelo materno
const PAT = { c: P.teal, l: P.tealL, d: P.tealD }; // alelo paterno
const LJ = '#ea7a12', LJD = '#9a4a06';

// Hormônio (bolinha) e carreadora (proteína com o hormônio encaixado).
const hormonio = (x, y) => '<circle cx="' + x + '" cy="' + y + '" r="5" fill="' + P.amber + '" stroke="#ffffff" stroke-width="1"/>';
const carreadora = (x, y) => '<ellipse cx="' + x + '" cy="' + y + '" rx="15" ry="9" fill="' + P.blueL + '" stroke="' + P.blue + '" stroke-width="1.6"/>' + hormonio(x + 8, y - 7);

// Alelo (barra de gene). tipo: 'normal' | 'mutante' | 'ativo' | 'silenciado' | 'perdido'
function alelo(x, y, w, tipo, rotulo, cor) {
  const h = 16;
  let f = '#eef2f7', b = P.slate, t = P.ink, extra = '', dash = '';
  if (tipo === 'ativo') { f = P.greenL; b = P.green; t = P.greenD; }
  if (tipo === 'silenciado') { f = '#eef2f7'; b = P.grey; t = P.slate; }
  if (tipo === 'perdido') { f = '#ffffff'; b = P.red; t = P.redD; dash = ' stroke-dasharray="4 3"'; }
  if (cor) { f = cor.l; b = cor.c; t = cor.d; }
  if (tipo === 'mutante') {
    const mx = x + w / 2;
    extra = '<rect x="' + (mx - 7) + '" y="' + y + '" width="14" height="' + h + '" fill="' + P.red + '"/>'
      + '<path d="M' + (mx - 4) + ',' + (y + 4) + ' L' + (mx + 4) + ',' + (y + 12) + ' M' + (mx + 4) + ',' + (y + 4) + ' L' + (mx - 4) + ',' + (y + 12) + '" stroke="#ffffff" stroke-width="1.8" stroke-linecap="round"/>';
  }
  return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="8" fill="' + f + '" stroke="' + b + '" stroke-width="1.5"' + dash + '/>' + extra
    + (rotulo ? T(x + w / 2, y + 12, rotulo, { size: 11, bold: true, fill: t }) : '');
}

// ═════════════════════════════════════════════════════════════════════════════
// 149 — Transporte no sangue (nova)
// ═════════════════════════════════════════════════════════════════════════════
const transporte = {
  arquivo: 'endocrinologia-basica--hormonios-transporte.svg',
  titulo: 'Transporte no sangue: só a fração livre é biologicamente ativa',
  subtitulo: 'Os hormônios lipossolúveis viajam ligados a carreadoras;\no pool ligado é um reservatório que tampona oscilações e prolonga a meia-vida.',
  W: 820, H: 606,
  desenhar() {
    let s = '';
    // ── cartão da esquerda: o equilíbrio no sangue
    s += cartao(36, 84, 400, 210);
    s += T(52, 108, 'No sangue', { size: 13, bold: true, anchor: 'start' });
    s += '<rect x="52" y="120" width="252" height="158" rx="14" fill="' + P.redL + '" stroke="#e7a3a0" stroke-width="1.4"/>';
    s += T(64, 138, 'sangue', { size: 11, italic: true, fill: P.redD, anchor: 'start' });
    [[92, 178], [140, 160], [124, 210]].forEach((c) => { s += carreadora(c[0], c[1]); });
    s += bloco(118, 228, 'pool ligado:\nreservatório', { size: 11, fill: P.blueD, bold: true });
    // equilíbrio ligado ⇄ livre
    s += L.seta('M172,180 L214,180', { cor: 'slate' }) + L.seta('M214,194 L172,194', { cor: 'slate' });
    s += hormonio(238, 172) + hormonio(254, 196) + hormonio(234, 210);
    s += bloco(246, 228, 'fração\nlivre', { size: 11, fill: P.amberD, bold: true });
    // célula-alvo com receptor
    // lipossolúvel: entra na célula e age no receptor nuclear
    s += '<ellipse cx="376" cy="190" rx="44" ry="34" fill="' + P.tealL + '" stroke="' + P.teal + '" stroke-width="1.8"/>';
    s += '<circle cx="386" cy="192" r="19" fill="' + P.nucleo + '" stroke="' + P.nucleoB + '" stroke-width="1.4"/>';
    s += L.bolha(388, 192, 11, 9, 'R', { f: P.purpleL, b: P.purple, t: P.purpleD, size: 11 });
    s += L.seta('M266,190 L373,191', { cor: 'amber', w: 2.2 });
    s += T(376, 146, 'célula-alvo', { size: 11, italic: true, fill: P.tealD });
    s += bloco(376, 230, 'só a livre é\nbiologicamente\nativa', { size: 11, bold: true, fill: P.greenD });

    // ── cartão da direita: carreadoras e frações livres
    s += cartao(450, 84, 334, 210);
    s += T(466, 108, 'Carreadoras', { size: 13, bold: true, anchor: 'start' });
    const lin = [['TBG', 'tireoidianos (T4/T3)'], ['CBG/transcortina', 'cortisol'], ['SHBG', 'testosterona e estradiol'], ['DBP', 'vitamina D'], ['albumina/TTR', 'menor afinidade, alta capacidade']];
    lin.forEach((l, i) => {
      const y = 132 + i * 22;
      s += T(466, y, l[0], { size: 11.5, bold: true, fill: P.blueD, anchor: 'start' });
      s += T(582, y, l[1], { size: 11.5, fill: P.ink, anchor: 'start' });
    });
    s += '<line x1="466" y1="238" x2="768" y2="238" stroke="' + P.line + '" stroke-width="1.2"/>';
    s += T(466, 256, 'Fração livre (a que age)', { size: 11.5, bold: true, fill: P.greenD, anchor: 'start' });
    s += L.pilula(512, 276, 'T4 ≈ 0,03%', { size: 11, f: P.greenL, b: P.green, t: P.greenD });
    s += L.pilula(620, 276, 'testosterona ≈ 2%', { size: 11, f: P.greenL, b: P.green, t: P.greenD });
    s += L.pilula(723, 276, 'cortisol ≈ 5%', { size: 11, f: P.greenL, b: P.green, t: P.greenD });

    // ── regra de ouro: três situações
    s += T(36, 326, 'Regra de ouro: o que muda a carreadora muda o total, não o livre', { size: 14, bold: true, fill: P.navy, anchor: 'start' });
    s += T(784, 326, 'esquema fora de escala', { size: 11, italic: true, fill: P.slate, anchor: 'end' });
    const paineis = [
      { x: 36, tit: 'Carreadora normal', cor: P.navy, sub: 'situação de base', n: 3, tot: ['total', '#eef2f7', P.slate, P.ink], ex: 'o eixo mantém o livre\nconstante por feedback' },
      { x: 290, tit: 'Carreadora ↑', cor: P.blueD, sub: 'gravidez, estrogênio/ACO', n: 5, tot: ['total ↑', P.blueL, P.blue, P.blueD], ex: 'ex.: TBG ↑ → T4 total ↑,\nT4 livre normal' },
      { x: 544, tit: 'Carreadora ↓', cor: P.redD, sub: 'síndrome nefrótica (perda na urina)', n: 1, tot: ['total ↓', P.redL, P.red, P.redD], ex: 'ex.: T4 total e 25(OH)D\ntotal baixos' },
    ];
    const pos = [[44, 0], [84, -8], [124, 6], [64, 22], [104, 26]];
    paineis.forEach((p) => {
      const x = p.x, y = 340;
      s += cartao(x, y, 240, 204);
      s += T(x + 120, y + 24, p.tit, { size: 13, bold: true, fill: p.cor });
      if (p.sub) s += T(x + 120, y + 42, p.sub, { size: 11, fill: P.slate });
      s += '<rect x="' + (x + 14) + '" y="' + (y + 54) + '" width="212" height="76" rx="12" fill="' + P.redL + '" stroke="#e7a3a0" stroke-width="1.2"/>';
      for (let i = 0; i < p.n; i++) s += carreadora(x + pos[i][0], y + 88 + pos[i][1]);
      s += hormonio(x + 172, y + 78) + hormonio(x + 192, y + 98);
      s += T(x + 182, y + 122, 'livre', { size: 11, italic: true, fill: P.amberD });
      s += L.pilula(x + 72, y + 148, p.tot[0], { size: 11.5, bold: true, f: p.tot[1], b: p.tot[2], t: p.tot[3] });
      s += L.pilula(x + 168, y + 148, 'livre =', { size: 11.5, bold: true, f: P.greenL, b: P.green, t: P.greenD });
      s += bloco(x + 120, y + 162, p.ex, { size: 11, fill: P.ink });
    });
    s += L.nota(36, 558, 748, 'Com a carreadora alterada, dose frações livres, cortisol salivar ou índices (ex.: testosterona livre calculada pela equação de Vermeulen).', { cor: 'blue', size: 11.2 }).svg;
    return s;
  },
};

// ═════════════════════════════════════════════════════════════════════════════
// 149 — Peptídeo C (correção da antiga hormonios-peptideos.svg)
// ═════════════════════════════════════════════════════════════════════════════
const AZ = P.blue;
const corte = (x, y) => '<path d="M' + (x - 5) + ',' + (y - 9) + ' L' + (x + 5) + ',' + (y + 9) + '" stroke="' + P.red + '" stroke-width="2.2" stroke-linecap="round"/>';
const peptideoC = {
  arquivo: 'endocrinologia-basica--hormonios-peptideos.svg',
  titulo: 'Peptídeo C: o marcador da secreção endógena de insulina',
  subtitulo: 'As convertases clivam a pró-insulina em insulina e peptídeo C, equimolares; o peptídeo C tem meia-vida maior que a insulina.',
  W: 820, H: 490,
  desenhar() {
    let s = '';
    const y0 = 70;
    // ── esquerda: pró-insulina → insulina + peptídeo C (desenho da versão de 17/10)
    s += cartao(36, y0, 366, 196);
    s += T(52, y0 + 24, 'Da pró-insulina à insulina', { size: 13, bold: true, anchor: 'start' });
    const ax = 86, bx = 128, top = y0 + 56, fundo = y0 + 120;
    s += T(107, top - 10, 'pró-insulina', { size: 11, italic: true, fill: P.slate });
    s += '<path d="M' + ax + ',' + top + ' L' + ax + ',' + fundo + '" stroke="' + AZ + '" stroke-width="7" stroke-linecap="round"/>';
    s += '<path d="M' + bx + ',' + (top + 14) + ' L' + bx + ',' + fundo + '" stroke="' + AZ + '" stroke-width="7" stroke-linecap="round"/>';
    s += '<path d="M' + ax + ',' + (fundo + 6) + ' C' + ax + ',' + (fundo + 46) + ' ' + bx + ',' + (fundo + 46) + ' ' + bx + ',' + (fundo + 6) + '" fill="none" stroke="' + LJ + '" stroke-width="7" stroke-linecap="round"/>';
    s += corte(ax, fundo + 3) + corte(bx, fundo + 3);
    s += L.seta('M170,' + (y0 + 92) + ' L222,' + (y0 + 92), { cor: 'slate' });
    s += L.pilula(196, y0 + 116, 'PC1/3, PC2', { size: 11, bold: true, f: P.redL, b: P.red, t: P.redD });
    s += '<path d="M248,' + (top + 6) + ' L248,' + (fundo - 6) + '" stroke="' + AZ + '" stroke-width="7" stroke-linecap="round"/>';
    s += '<path d="M268,' + (top + 18) + ' L268,' + (fundo - 6) + '" stroke="' + AZ + '" stroke-width="7" stroke-linecap="round"/>';
    s += T(258, fundo + 20, 'insulina', { size: 11.5, bold: true, fill: P.blueD });
    s += T(292, y0 + 98, '+', { size: 18, bold: true, fill: P.slate });
    s += '<path d="M314,' + (y0 + 92) + ' q10,-14 20,0 t20,0 t20,0" fill="none" stroke="' + LJ + '" stroke-width="7" stroke-linecap="round"/>';
    s += T(344, fundo + 20, 'peptídeo C', { size: 11.5, bold: true, fill: LJD });
    s += T(219, y0 + 182, 'equimolares: uma insulina para cada peptídeo C', { size: 11, italic: true, fill: P.ink });

    // ── direita: meia-vida
    const x1 = 414;
    s += cartao(x1, y0, 370, 196);
    s += T(x1 + 16, y0 + 24, 'Meia-vida', { size: 13, bold: true, anchor: 'start' });
    const bx0 = x1 + 104, k = 190 / 30; // 30 min → 190 px
    s += T(bx0 - 10, y0 + 62, 'insulina', { size: 11.5, bold: true, fill: P.blueD, anchor: 'end' });
    s += '<rect x="' + bx0 + '" y="' + (y0 + 50) + '" width="' + (5 * k).toFixed(1) + '" height="16" rx="4" fill="' + AZ + '"/>';
    s += T(bx0 + 5 * k + 8, y0 + 62, '~4–6 min', { size: 11.5, fill: P.ink, anchor: 'start' });
    s += T(bx0 - 10, y0 + 94, 'peptídeo C', { size: 11.5, bold: true, fill: LJD, anchor: 'end' });
    s += '<rect x="' + bx0 + '" y="' + (y0 + 82) + '" width="' + (30 * k).toFixed(1) + '" height="16" rx="4" fill="' + LJ + '"/>';
    s += T(bx0 + 30 * k + 8, y0 + 94, '~30 min', { size: 11.5, fill: P.ink, anchor: 'start' });
    s += bloco(x1 + 185, y0 + 120, 'Dura mais que a insulina: o peptídeo C é o\nmarcador da secreção endógena de insulina.', { size: 11.5, bold: true, fill: P.navy });

    // ── embaixo: na prática, hipoglicemia com insulina alta
    const y1 = y0 + 210;
    s += cartao(36, y1, 748, 190);
    s += T(52, y1 + 24, 'Na prática: hipoglicemia com insulina alta', { size: 13, bold: true, anchor: 'start' });
    const caso = (x, cAlto, res, resCor, extra) => {
      let c = '';
      const base = y1 + 150;
      // barras: insulina e peptídeo C
      c += '<line x1="' + (x - 6) + '" y1="' + base + '" x2="' + (x + 134) + '" y2="' + base + '" stroke="' + P.grey + '" stroke-width="1.4"/>';
      c += '<rect x="' + (x + 8) + '" y="' + (base - 76) + '" width="40" height="76" rx="4" fill="' + AZ + '"/>';
      c += T(x + 28, base - 84, 'alta', { size: 11, bold: true, fill: P.blueD });
      c += T(x + 28, base + 16, 'insulina', { size: 11, bold: true, fill: P.blueD });
      const hC = cAlto ? 76 : 12;
      c += '<rect x="' + (x + 86) + '" y="' + (base - hC) + '" width="40" height="' + hC + '" rx="4" fill="' + LJ + '"/>';
      c += T(x + 106, base - hC - 8, cAlto ? 'alto' : 'baixo/suprimido', { size: 11, bold: true, fill: LJD });
      c += T(x + 106, base + 16, 'peptídeo C', { size: 11, bold: true, fill: LJD });
      // seta e resultado
      c += L.seta('M' + (x + 142) + ',' + (base - 44) + ' L' + (x + 172) + ',' + (base - 44), { cor: 'slate' });
      c += L.caixa(x + 178, base - 74, 150, 60, res, { f: resCor[0], b: resCor[1], t: resCor[2], size: 12 });
      if (extra) c += bloco(x + 253, base - 6, extra, { size: 11, italic: true, fill: P.ink });
      return c;
    };
    s += caso(56, false, 'insulina exógena\n(factícia)', [P.redL, P.red, P.redD]);
    s += '<line x1="410" y1="' + (y1 + 44) + '" x2="410" y2="' + (y1 + 176) + '" stroke="' + P.line + '" stroke-width="1.2" stroke-dasharray="4 4"/>';
    s += caso(430, true, 'insulinoma ou\nsecretagogo\n(sulfonilureia)', [P.amberL, P.amber, P.amberD], 'diferenciados pela pesquisa de\nsulfonilureia no plasma/urina');
    return s;
  },
};

// ═════════════════════════════════════════════════════════════════════════════
// 152 — Tipos de mutação (nova)
// ═════════════════════════════════════════════════════════════════════════════
const mutacoes = {
  arquivo: 'endocrinologia-basica--tipos-de-mutacao.svg',
  titulo: 'Tipos de mutação: perda de função, ganho de função e dominante-negativo',
  subtitulo: 'O raciocínio de prova segue a cadeia:\nfenótipo característico → gene → tipo de mutação (perda × ganho de função) → padrão de herança.',
  W: 820, H: 560,
  desenhar() {
    let s = '';
    const y = 84, H = 400;
    const col = [
      { x: 36, tit: 'Perda de função', cor: P.red, sub: 'inativadora · costuma ser recessiva', al: ['mutante', 'mutante'],
        res: 'exige os dois alelos\ncomprometidos', ex: ['Enzima: CYP21A2 → HAC por deficiência de 21-hidroxilase', 'Receptor de andrógeno (ligado ao X) → insensibilidade androgênica'] },
      { x: 290, tit: 'Ganho de função', cor: P.green, sub: 'ativadora · costuma ser dominante', al: ['normal', 'mutante'],
        res: 'ativa a via\nsem estímulo', ex: ['Receptor de TSH → hipertireoidismo congênito não autoimune, adenoma tóxico', 'Receptor de PTH/PTHrP → condrodisplasia de Jansen', 'GNAS (Gsα) → McCune-Albright'] },
      { x: 544, tit: 'Dominante-negativo', cor: P.purple, sub: 'proteínas que dimerizam', al: ['normal', 'mutante'],
        res: 'o alelo mutante inativa o\nproduto do alelo normal', ex: ['Resistência ao hormônio tireoidiano β: o TRβ mutante bloqueia o TRβ normal → T4L/T3 elevados com TSH normal ou aumentado'] },
    ];
    col.forEach((c, k) => {
      const x = c.x, cx = x + 120;
      s += cartao(x, y, 240, H);
      s += T(cx, y + 26, c.tit, { size: 15, bold: true, fill: c.cor });
      s += T(cx, y + 44, c.sub, { size: 11, fill: P.slate });
      // alelos
      s += alelo(cx - 92, y + 60, 80, c.al[0] === 'mutante' ? 'mutante' : 'normal');
      s += alelo(cx + 12, y + 60, 80, c.al[1] === 'mutante' ? 'mutante' : 'normal');
      s += T(cx - 52, y + 92, 'alelo ' + c.al[0], { size: 11, fill: c.al[0] === 'mutante' ? P.redD : P.slate });
      s += T(cx + 52, y + 92, 'alelo ' + c.al[1], { size: 11, fill: c.al[1] === 'mutante' ? P.redD : P.slate });
      const yP = y + 104; // topo da área do produto
      if (k === 0) {
        s += L.seta('M' + (cx - 52) + ',' + yP + ' L' + (cx - 22) + ',' + (yP + 30), { cor: 'slate' });
        s += L.seta('M' + (cx + 52) + ',' + yP + ' L' + (cx + 22) + ',' + (yP + 30), { cor: 'slate' });
        s += '<ellipse cx="' + cx + '" cy="' + (yP + 60) + '" rx="52" ry="24" fill="none" stroke="' + P.grey + '" stroke-width="1.8" stroke-dasharray="5 4"/>';
        s += T(cx, yP + 64, 'produto', { size: 11.5, italic: true, fill: P.grey });
        s += T(cx, yP + 104, 'reduz quantidade/atividade', { size: 11, fill: P.redD });
      } else if (k === 1) {
        // receptor na membrana, sem hormônio, mas com a via ligada
        s += L.seta('M' + (cx + 52) + ',' + yP + ' L' + (cx + 14) + ',' + (yP + 22), { cor: 'slate' });
        s += L.membrana(x + 20, x + 220, yP + 40, 24, [[cx - 10, cx + 10]]);
        s += T(x + 220, yP + 34, 'fora', { size: 11, italic: true, fill: P.slate, anchor: 'end' });
        s += '<rect x="' + (cx - 7) + '" y="' + (yP + 32) + '" width="14" height="40" rx="7" fill="' + P.green + '"/>';
        s += '<path d="M' + (cx - 14) + ',' + (yP + 18) + ' L' + (cx - 14) + ',' + (yP + 32) + ' Q' + cx + ',' + (yP + 42) + ' ' + (cx + 14) + ',' + (yP + 32) + ' L' + (cx + 14) + ',' + (yP + 18) + '" fill="none" stroke="' + P.green + '" stroke-width="3" stroke-linecap="round"/>';
        s += T(cx - 22, yP + 28, 'sem estímulo', { size: 11, italic: true, fill: P.slate, anchor: 'end' });
        s += L.seta('M' + cx + ',' + (yP + 74) + ' L' + cx + ',' + (yP + 92), { cor: 'green', w: 2.6 });
        s += T(cx, yP + 108, 'via ativada', { size: 11, bold: true, fill: P.greenD });
      } else {
        // dímero normal + mutante
        s += L.seta('M' + (cx - 52) + ',' + yP + ' L' + (cx - 28) + ',' + (yP + 22), { cor: 'slate' });
        s += L.seta('M' + (cx + 52) + ',' + yP + ' L' + (cx + 28) + ',' + (yP + 22), { cor: 'slate' });
        s += L.bolha(cx - 20, yP + 44, 22, 15, 'TRβ', { f: P.purpleL, b: P.purple, t: P.purpleD, size: 11 });
        s += L.bolha(cx + 20, yP + 44, 22, 15, '', { f: P.purpleL, b: P.red, sw: 2 });
        s += '<rect x="' + (cx + 34) + '" y="' + (yP + 37) + '" width="6" height="14" rx="2" fill="' + P.red + '"/>';
        s += T(cx + 16, yP + 48, 'TRβ', { size: 11, bold: true, fill: P.redD });
        s += T(cx - 70, yP + 48, 'dímero', { size: 11, italic: true, fill: P.slate, anchor: 'end' });
        s += L.seta('M' + cx + ',' + (yP + 62) + ' L' + cx + ',' + (yP + 88), { inibe: true, w: 2.6 });
        s += T(cx, yP + 108, 'sem ação', { size: 11, bold: true, fill: P.redD });
      }
      // resultado
      s += bloco(cx, y + 222, c.res, { size: 12, bold: true, fill: c.cor === P.red ? P.redD : c.cor === P.green ? P.greenD : P.purpleD });
      s += '<line x1="' + (x + 14) + '" y1="' + (y + 266) + '" x2="' + (x + 226) + '" y2="' + (y + 266) + '" stroke="' + P.line + '" stroke-width="1.2"/>';
      s += T(x + 14, y + 284, 'Exemplos', { size: 11, bold: true, fill: P.slate, anchor: 'start' });
      let yy = y + 290;
      c.ex.forEach((e) => { const l = L.linhas(x + 14, yy, e, { size: 11, maxW: 212, anchor: 'start', fill: P.ink }); s += l.svg; yy += l.h + 4; });
    });
    s += L.nota(36, 498, 748, 'Sensor alterado — CaSR (sensor de cálcio da paratireoide e do rim): perda de função → hipercalcemia hipocalciúrica familiar (HHF); ganho de função → hipocalcemia autossômica dominante.', { cor: 'blue', size: 11.2 }).svg;
    return s;
  },
};

// ═════════════════════════════════════════════════════════════════════════════
// 152 — Imprinting genômico (nova)
// ═════════════════════════════════════════════════════════════════════════════
// Cromossomo (barra vertical com centrômero); regiao: 'ok' | 'perdida'
function cromossomo(cx, y, cor, regiao) {
  const w = 16, p = 14, q = 70;
  let s = '<rect x="' + (cx - w / 2) + '" y="' + y + '" width="' + w + '" height="' + p + '" rx="7" fill="' + cor.l + '" stroke="' + cor.c + '" stroke-width="1.6"/>';
  s += '<rect x="' + (cx - w / 2) + '" y="' + (y + p + 4) + '" width="' + w + '" height="' + q + '" rx="7" fill="' + cor.l + '" stroke="' + cor.c + '" stroke-width="1.6"/>';
  const ry = y + p + 10;
  if (regiao === 'perdida') s += '<rect x="' + (cx - w / 2 - 3) + '" y="' + ry + '" width="' + (w + 6) + '" height="16" fill="#ffffff" stroke="' + P.red + '" stroke-width="1.6" stroke-dasharray="3 2"/>';
  else s += '<rect x="' + (cx - w / 2) + '" y="' + ry + '" width="' + w + '" height="16" fill="' + P.amber + '" opacity="0.85"/>';
  return s;
}
const imprinting = {
  arquivo: 'endocrinologia-basica--imprinting.svg',
  titulo: 'Imprinting genômico: a expressão depende da origem parental do alelo',
  subtitulo: 'Expressão monoalélica: só o alelo materno ou só o paterno é ativado.\nA doença aparece quando o alelo funcional é deletado ou mutado — o silenciado não compensa.',
  W: 820, H: 520,
  desenhar() {
    let s = '';
    const y = 84, H = 352;
    // ── 1. o princípio
    let x = 36, cx = x + 120;
    s += cartao(x, y, 240, H);
    s += T(cx, y + 26, 'O princípio', { size: 15, bold: true, fill: P.navy });
    s += T(cx, y + 44, 'mecanismo epigenético', { size: 11, fill: P.slate });
    s += T(x + 16, y + 74, 'Expressão normal', { size: 11.5, bold: true, fill: P.greenD, anchor: 'start' });
    s += alelo(x + 16, y + 84, 112, 'ativo', 'alelo ativo');
    s += L.seta('M' + (x + 134) + ',' + (y + 92) + ' L' + (x + 160) + ',' + (y + 92), { cor: 'green' });
    s += T(x + 164, y + 96, 'expressão', { size: 11, bold: true, fill: P.greenD, anchor: 'start' });
    s += alelo(x + 16, y + 110, 112, 'silenciado', 'alelo silenciado');
    s += T(x + 16, y + 150, 'um vem da mãe, o outro do pai', { size: 11, italic: true, fill: P.slate, anchor: 'start' });
    s += '<line x1="' + (x + 14) + '" y1="' + (y + 168) + '" x2="' + (x + 226) + '" y2="' + (y + 168) + '" stroke="' + P.line + '" stroke-width="1.2"/>';
    s += T(x + 16, y + 194, 'Doença', { size: 11.5, bold: true, fill: P.redD, anchor: 'start' });
    s += alelo(x + 16, y + 204, 136, 'perdido', 'deletado ou mutado');
    s += T(x + 160, y + 216, 'sem', { size: 11, bold: true, fill: P.redD, anchor: 'start' });
    s += T(x + 160, y + 230, 'expressão', { size: 11, bold: true, fill: P.redD, anchor: 'start' });
    s += alelo(x + 16, y + 230, 112, 'silenciado', 'alelo silenciado');
    s += T(x + 16, y + 272, 'o silenciado não compensa', { size: 11.5, bold: true, italic: true, fill: P.redD, anchor: 'start' });

    // ── 2. 15q11-q13
    x = 290; cx = x + 120;
    s += cartao(x, y, 240, H);
    s += T(cx, y + 26, '15q11-q13', { size: 15, bold: true, fill: P.navy });
    s += T(cx, y + 44, 'perda paterna × perda materna', { size: 11, fill: P.slate });
    const par = (yy, perde, sind, det) => {
      let c = '';
      c += T(x + 34, yy, 'mãe', { size: 11, bold: true, fill: MAT.d }) + T(x + 70, yy, 'pai', { size: 11, bold: true, fill: PAT.d });
      c += cromossomo(x + 34, yy + 8, MAT, perde === 'mae' ? 'perdida' : 'ok');
      c += cromossomo(x + 70, yy + 8, PAT, perde === 'pai' ? 'perdida' : 'ok');
      c += T(x + 102, yy + 22, perde === 'pai' ? 'perda paterna' : 'perda materna', { size: 11.5, bold: true, fill: perde === 'pai' ? PAT.d : MAT.d, anchor: 'start' });
      c += L.seta('M' + (x + 104) + ',' + (yy + 32) + ' L' + (x + 104) + ',' + (yy + 46), { cor: 'slate' });
      c += T(x + 102, yy + 62, sind, { size: 13, bold: true, fill: P.ink, anchor: 'start' });
      if (det) c += bloco(x + 102, yy + 66, det, { size: 11, fill: P.ink, anchor: 'start' });
      return c;
    };
    s += par(y + 74, 'pai', 'Prader-Willi', 'hipotonia neonatal,\nhiperfagia/obesidade,\nhipogonadismo');
    s += '<line x1="' + (x + 14) + '" y1="' + (y + 196) + '" x2="' + (x + 226) + '" y2="' + (y + 196) + '" stroke="' + P.line + '" stroke-width="1.2"/>';
    s += par(y + 222, 'mae', 'Angelman', '');
    s += '<rect x="' + (x + 16) + '" y="' + (y + 330) + '" width="12" height="10" fill="' + P.amber + '" opacity="0.85"/>';
    s += T(x + 34, y + 339, 'região 15q11-q13', { size: 11, fill: P.slate, anchor: 'start' });

    // ── 3. GNAS
    x = 544; cx = x + 120;
    s += cartao(x, y, 240, H);
    s += T(cx, y + 26, 'GNAS', { size: 15, bold: true, fill: P.navy });
    s += T(cx, y + 44, 'mutação no alelo de qual dos pais?', { size: 11, fill: P.slate });
    const gnas = (yy, mutM, sind, det) => {
      let c = '';
      c += alelo(x + 16, yy, 100, mutM ? 'mutante' : 'normal', '', MAT);
      c += alelo(x + 124, yy, 100, mutM ? 'normal' : 'mutante', '', PAT);
      c += T(x + 66, yy + 30, 'materno', { size: 11, bold: true, fill: MAT.d }) + T(x + 174, yy + 30, 'paterno', { size: 11, bold: true, fill: PAT.d });
      c += bloco(x + 16, yy + 36, sind, { size: 12.5, bold: true, fill: P.ink, anchor: 'start', lh: 1.2 });
      c += bloco(x + 16, yy + 36 + (sind.split('\n').length * 15) + 2, det, { size: 11, fill: P.ink, anchor: 'start', maxW: 210 });
      return c;
    };
    s += gnas(y + 62, true, 'Pseudo-hipoparatireoidismo\ntipo 1a', 'resistência a PTH/TSH + osteodistrofia hereditária de Albright; hipocalcemia e PTH elevado');
    s += '<line x1="' + (x + 14) + '" y1="' + (y + 196) + '" x2="' + (x + 226) + '" y2="' + (y + 196) + '" stroke="' + P.line + '" stroke-width="1.2"/>';
    s += gnas(y + 214, false, 'Pseudopseudo-\nhipoparatireoidismo', 'só o fenótipo ósseo; cálcio e PTH normais');

    s += L.nota(36, 450, 748, 'Diagnóstico: análise de metilação (Prader-Willi, pseudo-hipoparatireoidismo).\nOutros exemplos de imprinting: diabetes neonatal transitória e pseudo-hipoparatireoidismo tipo 1B.', { cor: 'blue', size: 11.2 }).svg;
    return s;
  },
};

// ── gravação ─────────────────────────────────────────────────────────────────
const PROIBIDO = ['<image', '<foreignobject', '<script', 'href=', 'xlink:', '@import', 'url(http', 'javascript:', '<style'];
const todas = [transporte, peptideoC, mutacoes, imprinting];
const so = process.argv.slice(2);
for (const il of todas) {
  if (so.length && !so.some((k) => il.arquivo.includes(k))) continue;
  const svg = L.moldura(il, il.desenhar());
  const veto = PROIBIDO.find((p) => svg.toLowerCase().includes(p));
  if (veto) throw new Error(il.arquivo + ': proibido ' + veto);
  fs.writeFileSync(path.join(SAIDA, il.arquivo), svg);
  console.log('· ' + il.arquivo + ' ' + il.W + '×' + il.H + ' ' + (svg.length / 1024).toFixed(1) + ' KB');
}
