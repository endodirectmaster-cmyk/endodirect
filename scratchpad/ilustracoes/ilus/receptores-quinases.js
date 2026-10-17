'use strict';
// Receptores Hormonais e Transdução de Sinal — receptores ligados a quinases:
// insulina (tirosina-quinase) × GH (JAK-STAT).
const L = require('../lib.js');
const { P } = L;

module.exports = {
  id: 'receptores-quinases',
  sub: 'Endocrinologia Básica',
  tema: 'Receptores Hormonais e Transdução de Sinal',
  depoisDe: 'forma **solúvel** ativada pelo **NO** (nitratos; sildenafila inibe a PDE5 e eleva o GMPc).',
  titulo: 'Receptores ligados a quinases: insulina (tirosina-quinase) e GH (JAK-STAT)',
  subtitulo: 'No primeiro, a atividade enzimática é do próprio receptor; no segundo, o receptor não a tem e recruta quinases do citoplasma.',
  legenda: 'Receptores ligados a quinases: insulina (tirosina-quinase) e GH (JAK-STAT).',
  lastro: [
    '**Tirosina-quinase (RTK):** o receptor tem atividade enzimática própria.',
    '**Insulina e IGF-1** — o receptor … metabólica) e **RAS/MAPK** (crescimento e mitogênese).',
    '**Associados a quinases (JAK-STAT):** o receptor não tem atividade enzimática e recruta quinases citoplasmáticas.',
    '**GH, prolactina, leptina, eritropoetina e citocinas** … Ex.: GH → JAK2/STAT5 → IGF-1.',
    '| **Ligados a quinases** | **Minutos a horas** |',
    '**Insulina e IGF-1** = RTK, **não** … e leptina** = JAK-STAT, **não** RTK.',
  ],
  W: 820,
  H: 556,
  desenhar() {
    let s = '';
    const yM = 196, hM = 30;
    s += L.citoplasma(36, yM + hM - 6, 770, 470 - (yM + hM - 6));
    s += L.membrana(36, 806, yM, hM, [[64, 76], [181, 193], [207, 219], [554, 562], [590, 598]]);
    s += L.zonaV(24, 140, 'meio extracelular');
    s += L.zonaV(24, 345, 'citoplasma');
    s += '<line x1="420" y1="84" x2="420" y2="' + (yM - 10) + '" stroke="' + P.line + '" stroke-width="1.2" stroke-dasharray="4 4"/>';
    s += '<line x1="420" y1="' + (yM + hM + 10) + '" x2="420" y2="462" stroke="#dde3ec" stroke-width="1.2" stroke-dasharray="4 4"/>';

    // ── ESQUERDA: receptor da insulina (tirosina-quinase) ──
    s += L.txt(228, 92, 'Tirosina-quinase — insulina, IGF-1', { size: 14, bold: true, fill: P.teal });
    s += L.txt(228, 110, 'a atividade enzimática é do próprio receptor', { size: 11, fill: P.slate });
    const rc = 200;
    s += L.peptideo(rc - 13, 124, P.red, 4);
    s += L.txt(rc + 38, 124, 'insulina', { size: 10.5, italic: true, fill: P.slate, anchor: 'start' });
    s += L.receptorInsulina(rc, yM, hM, true);
    s += L.txt(rc + 58, yM + hM + 46, 'autofosforilação', { size: 10.5, italic: true, fill: P.amberD, anchor: 'start' });
    s += L.txt(rc + 58, yM + hM + 60, 'em tirosinas', { size: 10.5, italic: true, fill: P.amberD, anchor: 'start' });
    // IRS-1/2
    s += L.seta('M' + rc + ',' + (yM + hM + 38) + ' L' + rc + ',' + (yM + hM + 70), { cor: 'teal' });
    s += L.bolha(rc, yM + hM + 86, 34, 14, 'IRS-1/2', { f: P.tealL, b: P.teal, size: 11 });
    // dois braços
    s += L.seta('M' + (rc - 22) + ',' + (yM + hM + 98) + ' C' + (rc - 40) + ',' + (yM + hM + 112) + ' ' + (rc - 52) + ',' + (yM + hM + 118) + ' ' + (rc - 56) + ',' + (yM + hM + 130), { cor: 'teal' });
    s += L.seta('M' + (rc + 22) + ',' + (yM + hM + 98) + ' C' + (rc + 46) + ',' + (yM + hM + 112) + ' ' + (rc + 86) + ',' + (yM + hM + 118) + ' ' + (rc + 94) + ',' + (yM + hM + 130), { cor: 'teal' });
    s += L.caixa(rc - 98, yM + hM + 132, 86, 28, 'PI3K → AKT', { f: P.navy, b: P.navy, t: P.white, size: 11.5 });
    s += L.caixa(rc + 50, yM + hM + 132, 92, 28, 'RAS → MAPK', { f: P.navy, b: P.navy, t: P.white, size: 11.5 });
    s += L.linhas(rc - 55, yM + hM + 164, 'síntese de glicogênio\nação metabólica', { size: 10.8, fill: P.ink }).svg;
    s += L.linhas(rc + 96, yM + hM + 164, 'crescimento\ne mitogênese', { size: 10.8, fill: P.ink }).svg;
    // GLUT4: vesícula sobe à membrana
    const vx = 70, vy = yM + hM + 74;
    s += '<circle cx="' + vx + '" cy="' + vy + '" r="15" fill="#ffffff" stroke="' + P.green + '" stroke-width="1.8"/>';
    [[vx - 6, vy - 4], [vx + 5, vy + 3]].forEach((q) => { s += '<rect x="' + (q[0] - 3.5) + '" y="' + (q[1] - 5) + '" width="7" height="10" rx="2" fill="' + P.green + '"/>'; });
    s += L.seta('M' + vx + ',' + (vy - 18) + ' L' + vx + ',' + (yM + hM + 6), { cor: 'green', trac: true });
    s += '<rect x="' + (vx - 6) + '" y="' + (yM - 2) + '" width="12" height="' + (hM + 4) + '" rx="3" fill="' + P.green + '"/>';
    s += L.txt(vx, yM - 10, 'GLUT4', { size: 10.5, bold: true, fill: P.greenD });
    s += L.seta('M' + (rc - 98) + ',' + (yM + hM + 142) + ' C' + (rc - 118) + ',' + (yM + hM + 138) + ' ' + (vx + 2) + ',' + (vy + 36) + ' ' + vx + ',' + (vy + 19), { cor: 'green' });
    s += L.txt(vx + 22, vy - 16, 'translocação', { size: 10.5, italic: true, fill: P.greenD, anchor: 'start' });
    s += L.txt(vx + 22, vy - 3, 'de GLUT4', { size: 10.5, italic: true, fill: P.greenD, anchor: 'start' });

    // ── DIREITA: receptor de citocina (GH) — JAK-STAT ──
    s += L.txt(612, 92, 'JAK-STAT — GH, prolactina, leptina', { size: 14, bold: true, fill: P.purple });
    s += L.txt(612, 110, 'o receptor não tem atividade enzimática: recruta a JAK', { size: 11, fill: P.slate });
    const gc = 576;
    s += L.receptorCitocina(gc, yM, hM, P.purple);
    s += L.bolha(gc, yM - 66, 16, 12, 'GH', { f: P.redL, b: P.red, t: P.redD, size: 11 });
    s += L.txt(gc + 44, yM - 62, 'a ligação dimeriza', { size: 10.5, italic: true, fill: P.slate, anchor: 'start' });
    s += L.txt(gc + 44, yM - 49, 'o receptor', { size: 10.5, italic: true, fill: P.slate, anchor: 'start' });
    // JAK2 nas faces internas
    s += L.bolha(gc - 30, yM + hM + 34, 22, 13, 'JAK2', { f: '#ffffff', b: P.purple, t: P.purpleD, size: 10.5 });
    s += L.bolha(gc + 30, yM + hM + 34, 22, 13, 'JAK2', { f: '#ffffff', b: P.purple, t: P.purpleD, size: 10.5 });
    // JAK fosforila STAT
    s += L.seta('M' + (gc + 52) + ',' + (yM + hM + 38) + ' C' + (gc + 80) + ',' + (yM + hM + 42) + ' ' + (gc + 96) + ',' + (yM + hM + 54) + ' ' + (gc + 102) + ',' + (yM + hM + 68), { cor: 'purple' });
    s += L.bolha(gc + 112, yM + hM + 84, 26, 13, 'STAT5', { f: P.purpleL, b: P.purple, t: P.purpleD, size: 10.5 });
    s += L.fosfato(gc + 138, yM + hM + 76);
    s += L.txt(gc + 146, yM + hM + 104, 'fosforilada', { size: 10.5, italic: true, fill: P.purpleD, anchor: 'middle' });
    // migra ao núcleo
    s += L.seta('M' + (gc + 112) + ',' + (yM + hM + 112) + ' L' + (gc + 112) + ',' + (yM + hM + 146), { cor: 'purple', trac: true });
    s += L.txt(gc + 120, yM + hM + 132, 'migra ao núcleo', { size: 10.5, italic: true, fill: P.purpleD, anchor: 'start' });
    s += L.nucleo(gc + 6, yM + hM + 150, 218, 84);
    s += L.txt(gc + 196, yM + hM + 168, 'núcleo', { size: 10.5, italic: true, fill: P.nucleoB, anchor: 'end' });
    // GH → JAK2/STAT5 → IGF-1 (o capítulo não detalha o passo no núcleo)
    s += L.bolha(gc + 70, yM + hM + 196, 28, 12, 'STAT5', { f: P.purpleL, b: P.purple, t: P.purpleD, size: 10.5 });
    s += L.seta('M' + (gc + 104) + ',' + (yM + hM + 196) + ' L' + (gc + 140) + ',' + (yM + hM + 196), { cor: 'purple', w: 2.2 });
    s += L.pilula(gc + 168, yM + hM + 196, 'IGF-1', { size: 11.5, bold: true, f: '#ffffff', b: P.purple, t: P.purpleD });
    // SOCS: o capítulo diz só que fazem o feedback negativo (sem dizer sobre qual elemento)
    s += L.bolha(gc - 100, yM + hM + 34, 24, 13, 'SOCS', { f: P.redL, b: P.red, t: P.redD, size: 10.5 });
    s += L.linhas(gc - 100, yM + hM + 50, 'feedback negativo\nda via JAK-STAT', { size: 10.5, italic: true, fill: P.redD }).svg;

    // ── rodapé
    s += L.nota(44, 476, 752, 'Resposta em minutos a horas. Insulina e IGF-1 usam tirosina-quinase, não proteína G; GH, prolactina e leptina usam JAK-STAT, não tirosina-quinase.', { cor: 'gold', size: 11.2 }).svg;
    return s;
  },
};
