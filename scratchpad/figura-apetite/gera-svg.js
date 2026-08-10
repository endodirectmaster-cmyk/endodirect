// Diagrama do controle hipotalâmico do apetite — ilustração própria, em português.
//
// ⚠️ NÃO é a figura do livro. O professor usou a Figura 2.2 de "Clinical Management
// of Obesity" (Apovian/Aronne/Barenbaum, 3ª ed., 2025) como REFERÊNCIA do que
// queria. A página de créditos daquele livro proíbe reprodução sem autorização
// escrita da editora, e a Endodirect é produto pago — então o que se reaproveita é
// a FISIOLOGIA (fato, não autoria), redesenhada do zero.
//
// ⚠️ POR QUE A PRIMEIRA VERSÃO FICOU RUIM (e o professor tinha razão): eu desenhei
// CAIXAS RETANGULARES onde o original tem ILUSTRAÇÃO ANATÔMICA. Um retângulo escrito
// "AgRP / NPY" não ensina nada que a frase já não diga; o que faz a figura valer é
// ver o NEURÔNIO — corpo celular, axônio que sobe, receptor cravado na membrana — e
// o órgão que secreta o hormônio. Esta versão desenha as formas.
//
// ⚠️ FUNDO PRÓPRIO, não `currentColor`: uma prancha anatômica precisa de fundo claro
// para os tecidos terem cor. Fica igual nos dois temas, como uma figura impressa
// colada na página — e foi outro motivo do aspecto apagado da versão anterior, que
// era só contorno sobre fundo escuro.
'use strict';
const fs = require('fs');
const path = require('path');

const C = {
  papel: '#FBF7F1', tinta: '#17263A', tinta2: '#4A5A70',
  nucleo: '#FBE3C4', nucleoBorda: '#E8C79B',
  roxo: '#C3B6E8', roxoB: '#6B5FA8',
  verde: '#A6DACD', verdeB: '#2A9D8F',
  laranja: '#F5CDA3', laranjaB: '#D08A4E',
  ventr: '#F0A868',
  estomago: '#E9A9AC', estomagoB: '#C0727A',
  pancreas: '#E9C07A', pancreasB: '#C1913F',
  adiposo: '#F3CE62', adiposoB: '#C9A227',
  pilula: '#FAEEA8', pilulaB: '#C9A227',
  seta: '#3E4C5E',
};

const defs = `<defs>
  <marker id="ap-p" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 1 L9 5 L0 9 z" fill="${C.seta}"/></marker>
  <marker id="ap-x" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 1 L9 5 L0 9 z" fill="${C.roxoB}"/></marker>
  <marker id="ap-v" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 1 L9 5 L0 9 z" fill="${C.verdeB}"/></marker>
</defs>`;

function txt(x, y, s, tam, peso, anchor, cor, extra) {
  return `<text x="${x}" y="${y}" text-anchor="${anchor || 'middle'}" font-size="${tam || 12.5}" font-weight="${peso || 400}" fill="${cor || C.tinta}"${extra || ''}>${s}</text>`;
}

// Receptor cravado na membrana: barril com estrias, girado para ficar perpendicular
// à superfície do corpo celular (é assim que se lê "proteína transmembrana").
function receptor(cx, cy, ang, cor) {
  const w = 13, h = 22;
  return `<g transform="translate(${(+cx).toFixed(1)} ${(+cy).toFixed(1)}) rotate(${((ang % 360) + 360) % 360})">
    <rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="3.5" fill="#fff" stroke="${cor}" stroke-width="1.8"/>
    <line x1="${-w / 2 + 4.3}" y1="${-h / 2 + 2}" x2="${-w / 2 + 4.3}" y2="${h / 2 - 2}" stroke="${cor}" stroke-width="1.4"/>
    <line x1="${w / 2 - 4.3}" y1="${-h / 2 + 2}" x2="${w / 2 - 4.3}" y2="${h / 2 - 2}" stroke="${cor}" stroke-width="1.4"/>
  </g>`;
}
// ⚠️ O rótulo do receptor tem de sair do MESMO ângulo do receptor. Na 1ª versão eu
// escrevi as coordenadas na mão e o "MC3R" foi parar solto no meio do núcleo, sem
// ligação visível com nada. Aqui o texto é empurrado pelo raio, e o alinhamento
// (start/middle/end) vem do próprio ângulo.
function receptorRot(cx, cy, rx, ry, grau, rotulo, cor, fator) {
  const p = naBorda(cx, cy, rx, ry, grau);
  const q = naBorda(cx, cy, rx * (fator || 2.05), ry * (fator || 2.05), grau);
  const cos = Math.cos((grau * Math.PI) / 180);
  const anchor = cos > 0.35 ? 'start' : cos < -0.35 ? 'end' : 'middle';
  const dx = anchor === 'start' ? 6 : anchor === 'end' ? -6 : 0;
  // ⚠️ A guia PARA ANTES do texto. Na 1ª tentativa ela terminava no ponto do rótulo e
  // atravessava a palavra — o verificador acusou as cinco. Aqui ela anda pelo raio e
  // recua 16 px do texto, deixando o respiro que uma linha de chamada precisa ter.
  const ux = q.x - p.x, uy = q.y - p.y, un = Math.hypot(ux, uy) || 1;
  const g1x = p.x + (ux / un) * 13, g1y = p.y + (uy / un) * 13;
  const g2x = q.x - (ux / un) * 16, g2y = q.y - (uy / un) * 16;
  const guia = un < 34 ? '' : `<line x1="${g1x.toFixed(1)}" y1="${g1y.toFixed(1)}" x2="${g2x.toFixed(1)}" y2="${g2y.toFixed(1)}" stroke="${C.tinta2}" stroke-width="1.1" opacity="0.7"/>`;
  return receptor(p.x, p.y, grau + 90, cor) + guia + txt((q.x + dx).toFixed(1), (q.y + 4).toFixed(1), rotulo, 12, 700);
}
// posição na borda de uma elipse, no ângulo dado (0° = direita, cresce horário)
function naBorda(cx, cy, rx, ry, grau) {
  const a = (grau * Math.PI) / 180;
  return { x: cx + rx * Math.cos(a), y: cy + ry * Math.sin(a), ang: grau + 90 };
}

// Corpo celular com dendritos curtos: é o que faz parecer neurônio, e não bolha.
function soma(cx, cy, rx, ry, fill, stroke, dendritos) {
  let d = '';
  (dendritos || []).forEach((g) => {
    const p = naBorda(cx, cy, rx, ry, g);
    const q = naBorda(cx, cy, rx * 1.55, ry * 1.55, g);
    const m = naBorda(cx, cy, rx * 1.3, ry * 1.3, g + 7);
    d += `<path d="M${p.x.toFixed(1)} ${p.y.toFixed(1)} Q${m.x.toFixed(1)} ${m.y.toFixed(1)} ${q.x.toFixed(1)} ${q.y.toFixed(1)}" fill="none" stroke="${stroke}" stroke-width="3" stroke-linecap="round"/>`;
  });
  return d + `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" stroke="${stroke}" stroke-width="2.2"/>`;
}

function sinal(x, y, mais) {
  return `<g><circle cx="${x}" cy="${y}" r="10" fill="#fff" stroke="${mais ? C.verdeB : C.estomagoB}" stroke-width="2"/>
    <line x1="${x - 5}" y1="${y}" x2="${x + 5}" y2="${y}" stroke="${mais ? C.verdeB : C.estomagoB}" stroke-width="2.4" stroke-linecap="round"/>
    ${mais ? `<line x1="${x}" y1="${y - 5}" x2="${x}" y2="${y + 5}" stroke="${C.verdeB}" stroke-width="2.4" stroke-linecap="round"/>` : ''}</g>`;
}

function pilula(cx, cy, w, rotulo) {
  return `<g><rect x="${cx - w / 2}" y="${cy - 15}" width="${w}" height="30" rx="15" fill="${C.pilula}" stroke="${C.pilulaB}" stroke-width="1.8"/>
    ${txt(cx, cy + 5, rotulo, 13.5, 700)}</g>`;
}

// ---- órgãos ----------------------------------------------------------------
const estomago = (x, y) => `<g transform="translate(${x} ${y}) scale(0.86)">
  <path d="M-10 -54 C-44 -50, -64 -18, -58 14 C-53 44, -24 64, 10 58 C30 52, 48 34, 56 18 C61 8, 52 2, 46 10 C40 18, 26 21, 10 16 C-6 11, -15 0, -15 -16 C-15 -34, -12 -45, -10 -54 Z"
    fill="${C.estomago}" stroke="${C.estomagoB}" stroke-width="2.2" stroke-linejoin="round"/></g>`;

const pancreas = (x, y) => `<g transform="translate(${x} ${y})">
  <path d="M-58 6 C-40 -14, -8 -18, 16 -10 C34 -4, 48 6, 56 2 C64 -2, 62 14, 48 18 C30 24, 10 14, -8 12 C-28 10, -42 22, -54 20 C-64 19, -66 12, -58 6 Z"
    fill="${C.pancreas}" stroke="${C.pancreasB}" stroke-width="2.2" stroke-linejoin="round"/>
  <path d="M-30 8 C-14 2, 6 4, 24 8" fill="none" stroke="${C.pancreasB}" stroke-width="1.4" opacity="0.7"/></g>`;

const adiposo = (x, y) => {
  const bolas = [[0, 0, 20], [34, -8, 17], [-32, -6, 16], [17, 22, 15], [-16, 22, 14], [40, 16, 12]];
  return `<g transform="translate(${x} ${y})">` + bolas.map(([dx, dy, r]) =>
    `<circle cx="${dx}" cy="${dy}" r="${r}" fill="${C.adiposo}" stroke="${C.adiposoB}" stroke-width="2"/>
     <circle cx="${dx - r * 0.42}" cy="${dy - r * 0.42}" r="${(r * 0.2).toFixed(1)}" fill="${C.adiposoB}" opacity="0.55"/>`).join('') + '</g>';
};

const encefalo = (x, y) => `<g transform="translate(${x} ${y}) scale(0.92)">
  <path d="M-58 6 C-64 -22, -44 -46, -16 -50 C10 -54, 44 -44, 56 -20 C66 0, 58 20, 40 26 C30 30, 22 26, 16 30 C8 36, 2 44, -8 42 C-18 40, -20 30, -30 28 C-46 25, -54 20, -58 6 Z"
    fill="${C.laranja}" stroke="${C.laranjaB}" stroke-width="2.2" stroke-linejoin="round"/>
  <path d="M-34 -30 C-22 -18, -6 -20, 4 -30 M10 -38 C22 -28, 34 -26, 44 -32 M-40 -6 C-24 2, -8 0, 4 -8 M14 -4 C26 4, 38 2, 46 -6"
    fill="none" stroke="${C.laranjaB}" stroke-width="1.5" opacity="0.75"/>
  <path d="M22 30 C34 34, 44 30, 48 22 C40 34, 30 40, 20 40 Z" fill="${C.laranja}" stroke="${C.laranjaB}" stroke-width="1.8"/>
  <circle cx="-4" cy="12" r="13" fill="none" stroke="${C.tinta}" stroke-width="2"/></g>`;

// ---- montagem ---------------------------------------------------------------
const A = { cx: 432, cy: 335, rx: 292, ry: 212 };          // núcleo arqueado
const N2 = { cx: 428, cy: 196, rx: 46, ry: 40 };            // neurônio de 2ª ordem
const NA = { cx: 282, cy: 402, rx: 56, ry: 47 };            // AgRP/NPY
const NP = { cx: 552, cy: 408, rx: 58, ry: 48 };            // POMC/CART

const svg = `<svg viewBox="0 0 900 858" width="100%" style="max-width:900px;height:auto;font-family:inherit" role="img" aria-label="Controle hipotalâmico do apetite: no núcleo arqueado, o neurônio AgRP/NPY (orexígeno) e o neurônio POMC/CART (anorexígeno) projetam-se para o neurônio de segunda ordem com receptor MC4R; grelina do estômago estimula o AgRP/NPY, enquanto insulina do pâncreas e leptina do tecido adiposo estimulam o POMC/CART e inibem o AgRP/NPY">
${defs}
<rect x="0" y="0" width="900" height="858" rx="14" fill="${C.papel}"/>

<!-- encéfalo com o hipotálamo circulado, e as linhas que ampliam a região -->
${encefalo(770, 92)}
${txt(770, 34, 'hipotálamo', 12.5, 700, 'middle', C.tinta)}
<path d="M754 118 L700 150" stroke="${C.tinta}" stroke-width="1.4" stroke-dasharray="5 4" fill="none"/>
<path d="M772 122 L706 205" stroke="${C.tinta}" stroke-width="1.4" stroke-dasharray="5 4" fill="none"/>

<!-- núcleo arqueado -->
<ellipse cx="${A.cx}" cy="${A.cy}" rx="${A.rx}" ry="${A.ry}" fill="${C.nucleo}" stroke="${C.nucleoBorda}" stroke-width="2.5"/>
${txt(612, 152, 'Hipotálamo', 15, 700, 'middle', C.tinta, ' transform="rotate(-19 612 152)"')}
<ellipse cx="417" cy="406" rx="212" ry="88" fill="none" stroke="${C.tinta2}" stroke-width="1.8" stroke-dasharray="7 6" opacity="0.75"/>
${txt(417, 516, 'núcleo arqueado', 12.5, 700, 'middle', C.tinta)}

<!-- terceiro ventrículo, encostado na borda do núcleo -->
<path d="M86 232 C76 268, 78 320, 84 360 C90 400, 88 440, 82 470 L112 470 C106 440, 108 400, 114 360 C120 320, 118 268, 116 232 Z"
  fill="${C.ventr}" stroke="#C9803F" stroke-width="1.8"/>
${txt(99, 500, 'Terceiro', 12, 400, 'middle', C.tinta2)}
${txt(99, 515, 'ventrículo', 12, 400, 'middle', C.tinta2)}

<!-- ============ NEURÔNIO DE 2ª ORDEM ============ -->
${soma(N2.cx, N2.cy, N2.rx, N2.ry, C.laranja, C.laranjaB, [200, 250, 300, 340])}
${receptor(naBorda(N2.cx, N2.cy, N2.rx, N2.ry, 62).x, naBorda(N2.cx, N2.cy, N2.rx, N2.ry, 62).y, 62 + 90, C.laranjaB)}
${txt(500, 250, 'MC4R', 12.5, 700, 'start')}
<path d="M494 246 L${(naBorda(N2.cx, N2.cy, N2.rx, N2.ry, 62).x + 9).toFixed(1)} ${(naBorda(N2.cx, N2.cy, N2.rx, N2.ry, 62).y + 5).toFixed(1)}" stroke="${C.tinta2}" stroke-width="1.2" fill="none"/>
<path d="M196 150 L196 232" stroke="${C.tinta}" stroke-width="1.6" fill="none"/>
<path d="M196 150 L212 150 M196 232 L212 232" stroke="${C.tinta}" stroke-width="1.6" fill="none"/>
${txt(190, 176, 'Neurônio de', 13.5, 700, 'end')}
${txt(190, 194, '2ª ordem', 13.5, 700, 'end')}
${txt(190, 212, '(núcleo paraventricular)', 11, 400, 'end', C.tinta2)}

<!-- ============ NEURÔNIOS DE 1ª ORDEM ============ -->
${soma(NA.cx, NA.cy, NA.rx, NA.ry, C.roxo, C.roxoB, [140, 190, 235])}
${txt(NA.cx, NA.cy - 4, 'AgRP /', 13.5, 700)}
${txt(NA.cx, NA.cy + 13, 'NPY', 13.5, 700)}
${soma(NP.cx, NP.cy, NP.rx, NP.ry, C.verde, C.verdeB, [300, 345, 30])}
${txt(NP.cx, NP.cy - 4, 'POMC /', 13.5, 700)}
${txt(NP.cx, NP.cy + 13, 'CART', 13.5, 700)}

<!-- axônios que sobem até o neurônio de 2ª ordem, com botão terminal -->
<path d="M${(NA.cx + 20)} ${(NA.cy - NA.ry + 4)} C300 320, 330 250, 396 218" fill="none" stroke="${C.roxoB}" stroke-width="7" stroke-linecap="round" opacity="0.85"/>
<circle cx="396" cy="218" r="7" fill="${C.roxoB}"/>
${txt(300, 262, 'NPY /', 12.5, 700, 'end', C.roxoB)}
${txt(300, 278, 'AgRP', 12.5, 700, 'end', C.roxoB)}
<path d="M${(NP.cx - 18)} ${(NP.cy - NP.ry + 4)} C516 322, 496 250, 460 218" fill="none" stroke="${C.verdeB}" stroke-width="7" stroke-linecap="round" opacity="0.85"/>
<circle cx="460" cy="218" r="7" fill="${C.verdeB}"/>
${txt(556, 262, 'α-MSH /', 12.5, 700, 'start', C.verdeB)}
${txt(556, 278, 'β-endorfina', 12.5, 700, 'start', C.verdeB)}

<!-- inibição de um neurônio sobre o outro -->
<path d="M${NA.cx + NA.rx + 4} ${NA.cy + 6} L${NP.cx - NP.rx - 12} ${NP.cy + 4}" stroke="${C.estomagoB}" stroke-width="2.4" fill="none"/>
<path d="M${NP.cx - NP.rx - 12} ${NP.cy - 6} L${NP.cx - NP.rx - 12} ${NP.cy + 14}" stroke="${C.estomagoB}" stroke-width="3.2" fill="none" stroke-linecap="round"/>
${txt(405, 396, 'Inibição', 12.5, 700, 'middle', C.estomagoB)}

<!-- receptores na membrana (rótulo sai pelo mesmo raio do receptor) -->
${receptorRot(NA.cx, NA.cy, NA.rx, NA.ry, 190, 'GHSR', C.roxoB, 2.0)}
${receptorRot(NA.cx, NA.cy, NA.rx, NA.ry, 135, 'LEPR', C.roxoB, 2.05)}
${receptorRot(NA.cx, NA.cy, NA.rx, NA.ry, 322, 'MC3R', C.roxoB, 2.0)}
${receptorRot(NP.cx, NP.cy, NP.rx, NP.ry, 62, 'LEPR', C.verdeB, 2.05)}
${receptorRot(NP.cx, NP.cy, NP.rx, NP.ry, 216, 'Y₁R', C.verdeB, 2.05)}
${receptorRot(NP.cx, NP.cy, NP.rx, NP.ry, 350, 'MC3R', C.verdeB, 2.0)}

<path d="M700 350 L700 452" stroke="${C.tinta}" stroke-width="1.6" fill="none"/>
<path d="M700 350 L684 350 M700 452 L684 452" stroke="${C.tinta}" stroke-width="1.6" fill="none"/>
${txt(710, 394, 'Neurônio de', 13.5, 700, 'start')}
${txt(710, 412, '1ª ordem', 13.5, 700, 'start')}

<!-- ============ PERIFERIA ============ -->
${estomago(214, 690)}
${txt(214, 754, 'Estômago', 12.5, 700)}
${pilula(214, 596, 96, 'Grelina')}
${pancreas(636, 636)}
${txt(636, 674, 'Pâncreas', 12.5, 700)}
${adiposo(660, 748)}
${txt(748, 754, 'Tecido adiposo', 12.5, 700, 'start')}
${pilula(452, 622, 168, 'Insulina · Leptina')}

<!-- grelina sobe e estimula o AgRP/NPY -->
<path d="M214 581 C206 520, 212 452, 226 404" fill="none" stroke="${C.roxoB}" stroke-width="2.4" marker-end="url(#ap-x)"/>
${sinal(186, 512, true)}
<!-- insulina e leptina: estimulam o POMC/CART e inibem o AgRP/NPY -->
<path d="M486 606 C516 574, 556 508, 578 458" fill="none" stroke="${C.verdeB}" stroke-width="2.4" marker-end="url(#ap-v)"/>
${sinal(528, 528, true)}
<path d="M372 612 C336 590, 300 520, 258 458" fill="none" stroke="${C.estomagoB}" stroke-width="2.4" stroke-dasharray="7 5" marker-end="url(#ap-p)"/>
${sinal(306, 544, false)}
<!-- órgãos que alimentam as pílulas -->
<path d="M556 622 L544 622" fill="none" stroke="${C.seta}" stroke-width="1.8" marker-end="url(#ap-p)"/>
<path d="M596 636 C580 634, 566 628, 558 624" fill="none" stroke="${C.seta}" stroke-width="1.8" marker-end="url(#ap-p)"/>
<path d="M600 742 C540 730, 500 690, 470 644" fill="none" stroke="${C.seta}" stroke-width="1.8" marker-end="url(#ap-p)"/>
<path d="M214 640 L214 616" fill="none" stroke="${C.seta}" stroke-width="1.8" marker-end="url(#ap-p)"/>

${txt(452, 792, 'Hormônios periféricos que agem sobre os neurônios de 1ª e 2ª ordem', 12.5, 400, 'middle', C.tinta2)}
${txt(452, 812, 'AgRP, peptídeo relacionado ao agouti · CART, transcrito regulado por cocaína e anfetamina · GHSR, receptor do secretagogo do GH', 11, 400, 'middle', C.tinta2)}
${txt(452, 828, 'LEPR, receptor de leptina · MC3R/MC4R, receptor de melanocortina 3 e 4 · NPY, neuropeptídeo Y · POMC, pró-opiomelanocortina', 11, 400, 'middle', C.tinta2)}
${txt(452, 844, 'Y₁R, receptor Y₁ do NPY · α-MSH, hormônio estimulador de melanócitos alfa', 11, 400, 'middle', C.tinta2)}
</svg>`;

const saida = path.join(__dirname, 'apetite.svg');
fs.writeFileSync(saida, svg.replace(/\n\s*\n/g, '\n'));
console.log('SVG gravado: ' + saida + ' (' + fs.statSync(saida).size + ' bytes)');
