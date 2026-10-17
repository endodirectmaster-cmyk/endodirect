'use strict';
// Hormônios: Classes, Síntese e Transporte — modos de ação: endócrino, parácrino, autócrino.
const L = require('../lib.js');
const { P } = L;

const mol = (x, y, cor) => '<circle cx="' + x + '" cy="' + y + '" r="4.6" fill="' + cor + '" stroke="#ffffff" stroke-width="1"/>';
// célula: elipse clara com núcleo
function celula(cx, cy, rx, ry, cor, corL, rotulo) {
  return '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + rx + '" ry="' + ry + '" fill="' + corL + '" stroke="' + cor + '" stroke-width="1.8"/>'
    + '<circle cx="' + (cx - rx * 0.3) + '" cy="' + (cy + ry * 0.1) + '" r="' + Math.min(rx, ry) * 0.32 + '" fill="' + P.nucleo + '" stroke="' + P.nucleoB + '" stroke-width="1.2"/>'
    + (rotulo ? L.txt(cx + rx * 0.28, cy + 4.5, rotulo, { size: 12.5, bold: true, fill: cor }) : '');
}
// receptor: concha na superfície, aberta para fora (ang em graus: 0 = direita, -90 = em cima)
function receptor(cx, cy, ang, cor) {
  return '<g transform="translate(' + cx + ',' + cy + ') rotate(' + (ang + 90) + ')"><path d="M-6,-1 L-6,-8 M6,-1 L6,-8 M-6,-1 Q0,4 6,-1" fill="none" stroke="' + cor + '" stroke-width="2.6" stroke-linecap="round"/></g>';
}

module.exports = {
  id: 'hormonios-modos',
  sub: 'Endocrinologia Básica',
  tema: 'Hormônios: Classes, Síntese e Transporte',
  depoisDe: '**Autócrino:** age na própria célula que o secretou (IGF-1 em alguns tumores).',
  titulo: 'Modos de ação dos hormônios: endócrino, parácrino e autócrino',
  subtitulo: 'O endócrino cai no sangue e age à distância; o parácrino age na célula vizinha; o autócrino, na própria célula que o secretou.',
  legenda: 'Modos de ação dos hormônios: endócrino, parácrino e autócrino.',
  lastro: [
    '**Endócrino:** cai na corrente sanguínea e age à distância (insulina do pâncreas no músculo).',
    '**Parácrino:** age na célula vizinha (somatostatina das células δ inibindo células α e β na ilhota).',
    '**Autócrino:** age na própria célula que o secretou (IGF-1 em alguns tumores).',
    'A especificidade da resposta é … só produz efeito onde há TR nuclear.',
  ],
  W: 820,
  H: 384,
  desenhar() {
    let s = '';
    const yT = 72, yB = 300;
    const painel = (x0, cor, titulo, def, ex) => '<rect x="' + x0 + '" y="' + yT + '" width="240" height="' + (yB - yT) + '" rx="14" fill="#f8fafc" stroke="' + P.line + '"/>'
      + L.txt(x0 + 120, yT + 24, titulo, { size: 15, bold: true, fill: cor })
      + L.txt(x0 + 120, yT + 42, def, { size: 11, fill: P.slate })
      + L.txt(x0 + 120, yB - 14, ex, { size: 11, italic: true, fill: P.ink });

    // ── 1. endócrino: pâncreas → sangue → músculo
    {
      const x0 = 36, yc = yT + 98, yv = yT + 158;
      s += painel(x0, P.red, 'Endócrino', 'cai no sangue e age à distância', 'insulina do pâncreas no músculo');
      s += L.txt(x0 + 56, yT + 68, 'pâncreas', { size: 10.5, italic: true, fill: P.amberD });
      s += celula(x0 + 56, yc, 34, 20, P.amber, '#fff4d6');
      s += L.seta('M' + (x0 + 56) + ',' + (yc + 22) + ' L' + (x0 + 56) + ',' + (yv - 4), { cor: 'amber', w: 2 });
      s += '<rect x="' + (x0 + 14) + '" y="' + yv + '" width="212" height="28" rx="14" fill="#fdecec" stroke="#e7a3a0" stroke-width="1.4"/>';
      s += L.txt(x0 + 36, yv + 18, 'sangue', { size: 10, italic: true, fill: P.redD });
      [80, 106, 132].forEach((dx, k) => { s += mol(x0 + dx, yv + 14 + (k % 2 ? -3 : 3), P.red); });
      s += L.seta('M' + (x0 + 148) + ',' + (yv + 14) + ' L' + (x0 + 214) + ',' + (yv + 14), { cor: 'red', w: 2 });
      s += L.txt(x0 + 186, yT + 68, 'músculo', { size: 10.5, italic: true, fill: P.blueD });
      s += celula(x0 + 186, yc, 34, 20, P.blue, P.blueL);
      // receptor na face de baixo do músculo, com o hormônio chegando do sangue
      s += receptor(x0 + 196, yc + 19, 90, P.blue);
      s += L.seta('M' + (x0 + 196) + ',' + (yv - 2) + ' L' + (x0 + 196) + ',' + (yc + 34), { cor: 'red', w: 2 });
    }
    // ── 2. parácrino: célula δ inibe α e β na ilhota
    {
      const x0 = 290, cy = yT + 128;
      s += painel(x0, P.teal, 'Parácrino', 'age na célula vizinha', 'somatostatina das células δ na ilhota');
      s += '<ellipse cx="' + (x0 + 120) + '" cy="' + cy + '" rx="108" ry="56" fill="none" stroke="' + P.grey + '" stroke-width="1.3" stroke-dasharray="5 4"/>';
      s += L.txt(x0 + 120, yT + 64, 'ilhota', { size: 10.5, italic: true, fill: P.slate });
      s += celula(x0 + 120, cy, 26, 22, P.teal, P.tealL, 'δ');
      s += celula(x0 + 40, cy, 24, 20, P.slate, '#eef2f7', 'α');
      s += celula(x0 + 200, cy, 24, 20, P.slate, '#eef2f7', 'β');
      s += mol(x0 + 82, cy - 14, P.teal) + mol(x0 + 158, cy - 14, P.teal);
      s += L.seta('M' + (x0 + 92) + ',' + cy + ' L' + (x0 + 70) + ',' + cy, { inibe: true, w: 2.2 });
      s += L.seta('M' + (x0 + 148) + ',' + cy + ' L' + (x0 + 170) + ',' + cy, { inibe: true, w: 2.2 });
      s += L.txt(x0 + 120, cy + 44, 'inibe as células α e β', { size: 10.5, italic: true, fill: P.redD });
    }
    // ── 3. autócrino: a célula responde ao que ela mesma secreta
    {
      const x0 = 544, cx = x0 + 120, cy = yT + 140;
      s += painel(x0, P.purple, 'Autócrino', 'age na própria célula que o secretou', 'IGF-1 em alguns tumores');
      s += celula(cx, cy, 52, 34, P.purple, P.purpleL);
      // secreta pela face de cima à esquerda e o hormônio volta ao receptor da própria célula
      s += receptor(cx + 26, cy - 30, -64, P.purple);
      s += L.seta('M' + (cx - 30) + ',' + (cy - 30) + ' C' + (cx - 40) + ',' + (cy - 82) + ' ' + (cx + 40) + ',' + (cy - 90) + ' ' + (cx + 32) + ',' + (cy - 46), { cor: 'purple', w: 2.2 });
      s += mol(cx - 26, cy - 62, P.purple) + mol(cx + 2, cy - 74, P.purple) + mol(cx + 28, cy - 70, P.purple);
      s += L.txt(cx, cy + 50, 'célula tumoral', { size: 10.5, italic: true, fill: P.purpleD });
    }
    // ── especificidade: é do receptor
    s += L.nota(36, 314, 748, 'A especificidade da resposta vem do receptor, não do hormônio: o T3 circula por todo o corpo, mas só produz efeito onde há receptor nuclear (TR).', { cor: 'blue', size: 11.2 }).svg;
    return s;
  },
};
