'use strict';
// Receptores Hormonais e Transdução de Sinal — receptores nucleares: tipo I × tipo II.
const L = require('../lib.js');
const { P } = L;

module.exports = {
  id: 'receptores-nucleares',
  sub: 'Endocrinologia Básica',
  tema: 'Receptores Hormonais e Transdução de Sinal',
  depoisDe: 'O receptor de T3 exige a conversão prévia de **T4 em T3** pelas deiodinases.',
  titulo: 'Receptores nucleares: o hormônio entra e o complexo vira fator de transcrição',
  subtitulo: 'O complexo hormônio-receptor age sobre elementos responsivos no DNA (HRE); a resposta é lenta, de horas a dias, porque depende de nova síntese proteica.',
  legenda: 'Receptores nucleares: tipo I (esteroides) e tipo II (T3, vitamina D, ácido retinoico, PPAR). Ilustração Endodirect a partir do texto do capítulo.',
  lastro: [
    'O hormônio **atravessa a membrana**, liga-se … (HRE) → altera a expressão gênica.',
    'Resposta **lenta** (horas a dias), pois depende de nova síntese proteica.',
    'Estrutura conservada: domínio N-terminal (AF-1), **domínio … domínio de ligação ao ligante (AF-2).',
    '**Tipo I (esteroides):** GR, MR, AR, … e ligam sequências palindrômicas (repetições invertidas).',
    '**Tipo II (T3, vitamina D, ácido … com o ligante, trocam por **coativadores**.',
    'O receptor de T3 exige a conversão prévia de **T4 em T3** pelas deiodinases.',
    'Resposta **rápida** (segundos a minutos), por … existentes (fosforilação), sem depender de transcrição.',
    '| **Acoplados à proteína G** — … celulares** | **Segundos a minutos** |',
  ],
  W: 820,
  H: 588,
  desenhar() {
    let s = '';
    const yM = 152, hM = 28;
    s += L.citoplasma(36, yM + hM - 6, 770, 466 - (yM + hM - 6));
    s += L.membrana(36, 806, yM, hM);
    s += L.zonaV(24, 128, 'fora');
    s += L.zonaV(24, 250, 'citoplasma');
    s += '<line x1="420" y1="84" x2="420" y2="' + (yM - 8) + '" stroke="' + P.line + '" stroke-width="1.2" stroke-dasharray="4 4"/>';
    s += '<line x1="420" y1="' + (yM + hM + 8) + '" x2="420" y2="458" stroke="#dde3ec" stroke-width="1.2" stroke-dasharray="4 4"/>';

    // ── ESQUERDA: tipo I (esteroides) ──
    s += L.txt(228, 92, 'Tipo I — esteroides', { size: 14, bold: true, fill: P.amber });
    s += L.txt(228, 110, 'GR, MR, AR, PR, ER (cortisol, aldosterona, andrógenos…)', { size: 11, fill: P.slate });
    s += L.esteroide(56, 132, P.amber);
    s += L.seta('M74,140 C86,156 92,172 104,194', { cor: 'amber', trac: true });
    s += L.txt(124, 138, 'atravessa a membrana', { size: 10.5, italic: true, fill: P.amberD, anchor: 'start' });
    const cy = 222;
    // 1. receptor preso à HSP90
    s += L.passo(60, cy - 30, 1);
    s += L.bolha(84, cy, 22, 11, 'HSP90', { f: '#e2e8f0', b: P.grey, t: P.slate, size: 9 });
    s += L.bolha(124, cy, 18, 13, 'R', { f: P.purpleL, b: P.purple, t: P.purpleD, size: 11 });
    s += L.txt(104, cy + 30, 'preso à HSP90', { size: 10.5, fill: P.ink });
    // 2. liga o hormônio e solta a HSP
    s += L.seta('M146,' + cy + ' L176,' + cy, { cor: 'slate' });
    s += L.passo(186, cy - 30, 2);
    s += L.bolha(212, cy, 18, 13, 'R', { f: P.purpleL, b: P.purple, t: P.purpleD, size: 11 });
    s += L.esteroide(203, cy - 19, P.amber, 0.75);
    s += L.bolha(252, cy - 26, 22, 11, 'HSP90', { f: '#e2e8f0', b: P.grey, t: P.slate, size: 9 });
    s += L.txt(212, cy + 30, 'solta a HSP', { size: 10.5, fill: P.ink });
    // 3. homodímero
    s += L.seta('M236,' + cy + ' L268,' + cy, { cor: 'slate' });
    s += L.passo(376, cy - 24, 3);
    s += L.bolha(306, cy, 18, 13, 'R', { f: P.purpleL, b: P.purple, t: P.purpleD, size: 11 });
    s += L.bolha(342, cy, 18, 13, 'R', { f: P.purpleL, b: P.purple, t: P.purpleD, size: 11 });
    s += L.esteroide(297, cy - 19, P.amber, 0.75) + L.esteroide(333, cy - 19, P.amber, 0.75); // o complexo hormônio-receptor
    s += L.txt(324, cy + 30, 'homodímero', { size: 10.5, fill: P.ink });
    // 4. entra no núcleo
    s += L.seta('M324,' + (cy + 38) + ' L324,' + (cy + 106), { cor: 'purple', trac: true });
    s += L.passo(342, cy + 64, 4);
    s += L.nucleo(56, 318, 344, 136);
    s += L.txt(76, 346, 'núcleo', { size: 10.5, italic: true, fill: P.nucleoB, anchor: 'start' });
    s += L.dna(70, 386, 408, { amp: 6, per: 30 });
    // 5. dímero no HRE (repetições invertidas)
    s += L.bolha(306, 384, 18, 12, 'R', { f: P.purpleL, b: P.purple, t: P.purpleD, size: 10.5 });
    s += L.bolha(342, 384, 18, 12, 'R', { f: P.purpleL, b: P.purple, t: P.purpleD, size: 10.5 });
    s += L.esteroide(297, 366, P.amber, 0.75) + L.esteroide(333, 366, P.amber, 0.75);
    s += L.seta('M300,430 L318,430', { cor: 'amber', w: 2.4 }) + L.seta('M348,430 L330,430', { cor: 'amber', w: 2.4 });
    s += L.txt(292, 434, 'HRE (repetições invertidas)', { size: 10.5, bold: true, fill: P.amberD, anchor: 'end' });
    s += L.passo(372, 380, 5);
    s += L.seta('M282,392 C252,380 212,368 182,368', { cor: 'green' });
    s += L.linhas(126, 350, 'transcrição →\nnova proteína', { size: 10.8, bold: true, fill: P.greenD }).svg;

    // ── DIREITA: tipo II (T3, vitamina D, ácido retinoico, PPAR) ──
    s += L.txt(612, 92, 'Tipo II — T3, vitamina D, ácido retinoico, PPAR', { size: 14, bold: true, fill: P.purple });
    s += L.txt(612, 110, 'já no núcleo, ligado ao DNA como heterodímero com o RXR', { size: 11, fill: P.slate });
    s += L.pilula(624, 130, 'pré-requisito: T4 → T3 pelas deiodinases', { size: 10.5, f: P.purpleL, b: P.purple, t: P.purpleD });
    s += L.tireoidiano(440, 134, P.purple);
    s += L.txt(470, 138, 'T3', { size: 11, bold: true, fill: P.purpleD, anchor: 'start' });
    s += L.seta('M448,144 C468,236 640,232 690,320', { cor: 'purple', trac: true });
    s += L.nucleo(436, 318, 360, 136);
    s += L.txt(776, 346, 'núcleo', { size: 10.5, italic: true, fill: P.nucleoB, anchor: 'end' });
    s += L.dna(450, 782, 408, { amp: 6, per: 30 });
    // sem ligante: correpressor
    s += L.bolha(500, 388, 17, 12, 'TR', { f: P.purpleL, b: P.purple, t: P.purpleD, size: 10 });
    s += L.bolha(534, 388, 17, 12, 'RXR', { f: P.tealL, b: P.teal, t: P.tealD, size: 9.5 });
    s += L.bolha(517, 360, 42, 12, 'correpressor', { f: P.redL, b: P.red, t: P.redD, size: 9.5 });
    s += L.txt(517, 436, 'sem T3: gene silenciado', { size: 10.5, bold: true, fill: P.redD });
    // com ligante: coativador
    s += L.seta('M582,378 L628,378', { cor: 'slate' });
    s += L.txt(605, 370, 'T3 liga', { size: 10, italic: true, fill: P.slate });
    s += L.bolha(676, 388, 17, 12, 'TR', { f: P.purpleL, b: P.purple, t: P.purpleD, size: 10 });
    s += L.tireoidiano(664, 370, P.purple);
    s += L.bolha(710, 388, 17, 12, 'RXR', { f: P.tealL, b: P.teal, t: P.tealD, size: 9.5 });
    s += L.bolha(744, 360, 38, 12, 'coativador', { f: P.greenL, b: P.green, t: P.greenD, size: 9.5 });
    s += L.txt(700, 436, 'com T3: transcrição', { size: 10.5, bold: true, fill: P.greenD });

    // ── estrutura comum (barra de domínios)
    s += L.txt(44, 489, 'Estrutura conservada', { size: 11.5, bold: true, fill: P.ink, anchor: 'start' });
    const bx = 190, by = 475, bh = 22;
    s += L.caixa(bx, by, 150, bh, 'AF-1 (N-terminal)', { f: '#eef2f7', b: P.grey, t: P.ink, size: 10.5, rx: 6, bold: false });
    s += L.caixa(bx + 154, by, 236, bh, 'ligação ao DNA (dois dedos de zinco)', { f: P.blueL, b: P.blue, t: P.blueD, size: 10.5, rx: 6, bold: false });
    s += L.caixa(bx + 394, by, 212, bh, 'ligação ao ligante (AF-2)', { f: P.purpleL, b: P.purple, t: P.purpleD, size: 10.5, rx: 6, bold: false });

    // ── rodapé
    s += L.nota(44, 514, 752, 'Resposta lenta (horas a dias): o efeito depende de nova síntese proteica. Do outro lado, os receptores acoplados à proteína G respondem em segundos a minutos, modificando proteínas que já existem.', { cor: 'blue', size: 11.2 }).svg;
    return s;
  },
};
