'use strict';
// Hormônios: Classes, Síntese e Transporte — síntese dos hormônios tireoidianos.
const L = require('../lib.js');
const { P } = L;

// Contorno da célula com aberturas nas laterais onde ficam o NIS e a TPO: a linha da
// membrana não passa por trás do rótulo do transportador nem da enzima.
function contorno(x0, y0, x1, y1, r, abreE, abreD, cor) {
  const a = (x, y) => ' A' + r + ',' + r + ' 0 0 1 ' + x + ',' + y;
  const d = 'M' + (x0 + r) + ',' + y0 + ' H' + (x1 - r) + a(x1, y0 + r) + ' V' + abreD[0]
    + ' M' + x1 + ',' + abreD[1] + ' V' + (y1 - r) + a(x1 - r, y1) + ' H' + (x0 + r) + a(x0, y1 - r) + ' V' + abreE[1]
    + ' M' + x0 + ',' + abreE[0] + ' V' + (y0 + r) + a(x0 + r, y0);
  return '<path d="' + d + '" fill="none" stroke="' + cor + '" stroke-width="2"/>';
}
const iodeto = (x, y) => '<circle cx="' + x + '" cy="' + y + '" r="9" fill="#fbbf24" stroke="#b45309" stroke-width="1.2"/>' + L.txt(x, y + 3.4, 'I⁻', { size: 9.5, bold: true, fill: P.amberD });

module.exports = {
  id: 'hormonios-tireoide',
  sub: 'Endocrinologia Básica',
  tema: 'Hormônios: Classes, Síntese e Transporte',
  depoisDe: 'Tionamidas (metimazol/propiltiouracila) bloqueiam a TPO; PTU também inibe a D1.',
  titulo: 'Síntese dos hormônios tireoidianos: do iodeto ao T3 na periferia',
  subtitulo: 'O NIS capta o iodeto; a TPO organifica o iodo na tireoglobulina e acopla MIT e DIT; os hormônios ficam estocados no coloide.',
  legenda: 'Síntese dos hormônios tireoidianos no folículo e ativação periférica do T4.',
  lastro: [
    '**Tireoidianos:** o **NIS** capta iodeto contra … DIT+DIT → **T4**, estocados no **coloide**.',
    'A tireoide secreta predominantemente **T4** (razão … enquanto a **D3** inativa (T4→rT3, T3→T2).',
    'Tionamidas (metimazol/propiltiouracila) bloqueiam a TPO; PTU também inibe a D1.',
  ],
  W: 820,
  H: 492,
  desenhar() {
    let s = '';
    // ── sangue | célula folicular | coloide
    const yT = 84, yB = 330, x0 = 172, x1 = 476, xR = 788, yN = 152;
    s += '<rect x="36" y="' + yT + '" width="96" height="' + (yB - yT) + '" rx="14" fill="#fdecec"/>';
    s += L.txt(84, yT + 20, 'sangue', { size: 11.5, bold: true, fill: P.redD });
    s += '<path d="M' + x1 + ',' + yT + ' H' + (xR - 18) + ' A18,18 0 0 1 ' + xR + ',' + (yT + 18) + ' V' + (yB - 18) + ' A18,18 0 0 1 ' + (xR - 18) + ',' + yB + ' H' + x1 + '" fill="#f5efff" stroke="' + P.purple + '" stroke-width="1.6"/>';
    s += L.txt((x1 + xR) / 2 + 6, yT + 20, 'coloide', { size: 11.5, bold: true, fill: P.purpleD });
    s += '<rect x="' + x0 + '" y="' + yT + '" width="' + (x1 - x0) + '" height="' + (yB - yT) + '" rx="12" fill="' + P.cito + '"/>';
    s += contorno(x0, yT, x1, yB, 12, [yN - 24, yN + 24], [yN - 24, yN + 24], P.slate);
    s += L.txt((x0 + x1) / 2, yT + 20, 'célula folicular', { size: 11.5, bold: true, fill: P.ink });

    // iodeto: do sangue, pelo NIS, atravessa a célula até a TPO
    s += iodeto(58, yN - 18) + iodeto(58, yN + 18) + iodeto(90, yN);
    s += L.seta('M106,' + yN + ' L150,' + yN, { cor: 'teal', w: 2.2 });
    s += '<rect x="' + (x0 - 16) + '" y="' + (yN - 22) + '" width="32" height="44" rx="10" fill="' + P.teal + '"/>';
    s += L.txt(x0, yN + 3.8, 'NIS', { size: 10.5, bold: true, fill: P.white });
    s += L.seta('M' + (x0 + 22) + ',' + yN + ' L' + (x0 + 108) + ',' + yN, { cor: 'teal', w: 2.2 });
    s += iodeto(x0 + 124, yN);
    s += L.seta('M' + (x0 + 140) + ',' + yN + ' L' + (x1 - 34) + ',' + yN, { cor: 'teal', w: 2.2 });
    s += L.linhas(x0 + 24, yN + 14, 'o NIS capta iodeto\ncontra gradiente', { size: 10.8, anchor: 'start', fill: P.ink }).svg;
    // perclorato e tiocianato bloqueiam o NIS
    s += L.caixa(40, yN + 56, 88, 40, 'perclorato\ntiocianato', { f: P.redL, b: P.red, t: P.redD, size: 10, bold: false });
    s += L.seta('M110,' + (yN + 54) + ' C118,' + (yN + 40) + ' 140,' + (yN + 34) + ' ' + (x0 - 8) + ',' + (yN + 28), { inibe: true, w: 2 });

    // TPO na membrana voltada ao coloide
    s += L.caixa(x1 - 28, yN - 20, 56, 40, 'TPO', { f: '#ffffff', b: P.purple, t: P.purpleD, size: 13 });
    // metimazol e PTU bloqueiam a TPO
    s += L.pilula(x1 - 84, yN + 76, 'metimazol, PTU', { size: 9.8, f: P.redL, b: P.red, t: P.redD });
    s += L.seta('M' + (x1 - 58) + ',' + (yN + 64) + ' C' + (x1 - 46) + ',' + (yN + 50) + ' ' + (x1 - 30) + ',' + (yN + 40) + ' ' + (x1 - 16) + ',' + (yN + 28), { inibe: true, w: 2 });

    // organificação: iodo sobre as tirosinas da tireoglobulina (MIT, DIT)
    s += L.seta('M' + (x1 + 32) + ',' + yN + ' L' + (x1 + 90) + ',' + yN, { cor: 'purple', w: 2.2 });
    s += L.txt(x1 + 61, yN - 8, 'organifica', { size: 10.5, italic: true, fill: P.purpleD });
    const t0 = x1 + 96, yC = yN + 10;
    s += '<path d="M' + t0 + ',' + yC + ' C' + (t0 + 20) + ',' + (yC - 7) + ' ' + (t0 + 34) + ',' + (yC + 7) + ' ' + (t0 + 54) + ',' + yC
      + ' S' + (t0 + 88) + ',' + (yC - 7) + ' ' + (t0 + 108) + ',' + yC + ' S' + (t0 + 142) + ',' + (yC + 7) + ' ' + (t0 + 162) + ',' + yC
      + ' S' + (t0 + 190) + ',' + (yC - 6) + ' ' + (t0 + 204) + ',' + yC + '" fill="none" stroke="' + P.purple + '" stroke-width="3.2" stroke-linecap="round"/>';
    [['MIT', t0 + 26], ['DIT', t0 + 78], ['DIT', t0 + 132], ['MIT', t0 + 182]].forEach((q) => {
      s += '<line x1="' + q[1] + '" y1="' + (yC - 2) + '" x2="' + q[1] + '" y2="' + (yN - 12) + '" stroke="' + P.purple + '" stroke-width="1.6"/>';
      s += L.pilula(q[1], yN - 22, q[0], { size: 9.2, bold: true, f: '#ffffff', b: P.purple, t: P.purpleD });
    });
    s += L.txt(t0 + 102, yC + 26, 'tireoglobulina', { size: 10.5, italic: true, fill: P.purpleD });
    // acoplamento
    s += L.seta('M' + (t0 + 102) + ',' + (yC + 34) + ' L' + (t0 + 102) + ',' + (yC + 56), { cor: 'purple', w: 2 });
    s += L.txt(t0 + 112, yC + 50, 'a TPO acopla', { size: 10.5, italic: true, fill: P.purpleD, anchor: 'start' });
    s += L.caixa(t0 + 2, yC + 62, 200, 50, 'MIT + DIT → T3\nDIT + DIT → T4', { f: '#ffffff', b: P.purple, t: P.purpleD, size: 12 });
    s += L.txt(t0 + 102, yC + 132, 'estocados no coloide', { size: 10.8, italic: true, fill: P.purpleD });

    // secreção: sobretudo T4
    const yS = 312;
    s += L.seta('M' + (t0 + 40) + ',' + yS + ' L112,' + yS, { cor: 'navy', w: 2.4 });
    s += L.txt((x0 + x1) / 2, yS - 10, 'secreta sobretudo T4 (T4:T3 ≈ 14–20:1)', { size: 10.8, bold: true, fill: P.navy });

    // ── periferia: desiodases
    const yP = 350;
    s += '<rect x="36" y="' + yP + '" width="752" height="124" rx="14" fill="#f8fafc" stroke="' + P.line + '"/>';
    s += L.txt(56, yP + 24, 'Na periferia: as desiodases geram a maior parte do T3 ativo', { size: 13, bold: true, fill: P.ink, anchor: 'start' });
    const yb = yP + 38, ym = yb + 17;
    s += L.caixa(56, yb, 70, 34, 'T4', { f: P.purpleL, b: P.purple, t: P.purpleD, size: 13 });
    s += L.seta('M130,' + ym + ' L212,' + ym, { cor: 'green', w: 2.4 });
    s += L.txt(171, ym - 8, 'D1 / D2', { size: 11, bold: true, fill: P.greenD });
    s += L.caixa(218, yb, 92, 34, 'T3 ativo', { f: P.greenL, b: P.green, t: P.greenD, size: 12.5 });
    s += L.pilula(171, yb + 60, 'PTU também inibe a D1', { size: 9.8, f: P.redL, b: P.red, t: P.redD });
    s += L.seta('M171,' + (yb + 49) + ' L171,' + (ym + 6), { inibe: true, w: 2 });
    s += L.caixa(356, yb, 70, 34, 'T4', { f: P.purpleL, b: P.purple, t: P.purpleD, size: 13 });
    s += L.seta('M430,' + ym + ' L486,' + ym, { cor: 'red', w: 2.4 });
    s += L.txt(458, ym - 8, 'D3', { size: 11, bold: true, fill: P.redD });
    s += L.caixa(490, yb, 62, 34, 'rT3', { f: '#eef2f7', b: P.grey, t: P.slate, size: 12.5 });
    s += L.caixa(584, yb, 70, 34, 'T3', { f: P.greenL, b: P.green, t: P.greenD, size: 13 });
    s += L.seta('M658,' + ym + ' L714,' + ym, { cor: 'red', w: 2.4 });
    s += L.txt(686, ym - 8, 'D3', { size: 11, bold: true, fill: P.redD });
    s += L.caixa(718, yb, 54, 34, 'T2', { f: '#eef2f7', b: P.grey, t: P.slate, size: 12.5 });
    s += L.txt(564, yb + 64, 'a D3 inativa', { size: 10.8, italic: true, fill: P.redD });
    return s;
  },
};
