// Diagrama do controle hipotalâmico do apetite, REDESENHADO em português.
//
// ⚠️ NÃO é a figura do livro. O professor mandou a Figura 2.2 de um PDF como
// REFERÊNCIA do que queria; copiar a arte seria reproduzir material protegido —
// e o repositório é público. O que se reaproveita é a FISIOLOGIA (núcleo arqueado,
// neurônios de 1ª e 2ª ordem, hormônios periféricos), que é fato, não autoria.
//
// ⚠️ TEMA: texto e traços neutros usam `currentColor` e herdam a cor do card, então
// o desenho funciona no tema escuro e no claro. Só os acentos são fixos (verde
// estimula, coral inibe, roxo AgRP/NPY), e todos têm contraste nos dois fundos.
//
// ⚠️ DIAGRAMAÇÃO: a primeira versão tinha rótulo em cima da borda tracejada, seta
// terminando no ar e legenda por cima da caixa da grelina. As faixas verticais
// abaixo são reservadas de propósito, e há um teste que confere sobreposição de
// caixas de texto — num diagrama, colisão é defeito, não estilo.
//
//   18–100  neurônio de 2ª ordem      205–445  núcleo arqueado (caixa tracejada)
//  140–175  rótulos das projeções     285–365  neurônios de 1ª ordem
//  460–510  faixa livre p/ rótulos    545–607  órgãos periféricos
//  630–650  nota do tracejado         670+     legenda de siglas
'use strict';
const fs = require('fs');
const path = require('path');

const VERDE = '#2A9D8F';   // estimula / POMC-CART
const CORAL = '#E76F51';   // inibe
const ROXO = '#7C6BB0';    // AgRP/NPY
const AMAR = '#E9C46A';    // segunda ordem
const AZUL = '#457B9D';    // periferia

const defs = `<defs>
  <marker id="ap-sv" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="${VERDE}"/></marker>
  <marker id="ap-sr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="${ROXO}"/></marker>
  <marker id="ap-barra" viewBox="0 0 10 10" refX="2" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M2 0 L2 10" stroke="${CORAL}" stroke-width="3" fill="none"/></marker>
</defs>`;

function caixa(x, y, w, h, cor, titulo, sub) {
  return `<g>
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12" fill="${cor}" fill-opacity="0.16" stroke="${cor}" stroke-width="2"/>
    <text x="${x + w / 2}" y="${y + (sub ? h / 2 - 3 : h / 2 + 5)}" text-anchor="middle" font-size="15" font-weight="700" fill="currentColor">${titulo}</text>
    ${sub ? `<text x="${x + w / 2}" y="${y + h / 2 + 16}" text-anchor="middle" font-size="12.5" fill="currentColor" fill-opacity="0.85">${sub}</text>` : ''}
  </g>`;
}
function receptor(x, y, texto, cor) {
  const w = texto.length * 7.6 + 14;
  return `<g><rect x="${x - w / 2}" y="${y - 10}" width="${w}" height="20" rx="10" fill="${cor}"/>
    <text class="ap-rec" x="${x}" y="${y + 4.5}" text-anchor="middle" font-size="11.5" font-weight="700" fill="#0f1f2b">${texto}</text></g>`;
}
function seta(d, cor, marker, tracejado) {
  return `<path d="${d}" fill="none" stroke="${cor}" stroke-width="2.2"${tracejado ? ' stroke-dasharray="7 5"' : ''} marker-end="url(#${marker})"/>`;
}
function rot(x, y, texto, tam, peso, anchor, op) {
  return `<text x="${x}" y="${y}" text-anchor="${anchor || 'middle'}" font-size="${tam || 12.5}" font-weight="${peso || 400}" fill="currentColor"${op ? ` fill-opacity="${op}"` : ''}>${texto}</text>`;
}

const svg = `<svg viewBox="0 0 880 760" width="100%" style="max-width:880px;height:auto;color:inherit;font-family:inherit" role="img" aria-label="Controle hipotalâmico do apetite: neurônios AgRP/NPY e POMC/CART do núcleo arqueado, o neurônio de segunda ordem com receptor MC4R, e os hormônios periféricos grelina, insulina e leptina">
${defs}

<!-- ===== NEURÔNIO DE 2ª ORDEM ===== -->
${caixa(320, 18, 250, 64, AMAR, 'Neurônio de 2ª ordem', 'núcleo paraventricular')}
${receptor(445, 82, 'MC4R', AMAR)}
${rot(600, 44, '↑ MC4R → ↓ fome e ↑ gasto', 12.5, 700, 'start')}
${rot(600, 62, 'o AgRP bloqueia esse mesmo receptor', 12, 400, 'start', 0.85)}

<!-- projeções que chegam ao MC4R -->
${seta('M262 285 C262 200, 300 132, 412 96', CORAL, 'ap-barra')}
${rot(238, 150, 'NPY / AgRP', 12.5, 700, 'end')}
${rot(238, 168, 'antagoniza o MC4R', 12, 400, 'end', 0.85)}
${seta('M617 285 C617 200, 578 132, 478 96', VERDE, 'ap-sv')}
${rot(650, 150, 'α-MSH / β-endorfina', 12.5, 700, 'start')}
${rot(650, 168, 'agonista do MC4R', 12, 400, 'start', 0.85)}

<!-- ===== NÚCLEO ARQUEADO ===== -->
<rect x="110" y="205" width="660" height="240" rx="26" fill="none" stroke="currentColor" stroke-opacity="0.35" stroke-width="2" stroke-dasharray="8 6"/>
${rot(440, 234, 'NÚCLEO ARQUEADO (hipotálamo)', 13, 700)}
${rot(440, 252, 'neurônios de 1ª ordem', 12, 400, 'middle', 0.85)}

<rect x="70" y="250" width="22" height="170" rx="8" fill="${AZUL}" fill-opacity="0.30" stroke="${AZUL}" stroke-width="1.5"/>
${rot(81, 440, 'Terceiro', 11.5, 400, 'middle', 0.85)}
${rot(81, 454, 'ventrículo', 11.5, 400, 'middle', 0.85)}

${caixa(155, 285, 215, 80, ROXO, 'AgRP / NPY', 'orexígeno — ↑ fome')}
${receptor(195, 285, 'GHSR', ROXO)}
${receptor(330, 285, 'LEPR', ROXO)}
${receptor(195, 365, 'MC3R', ROXO)}

${caixa(510, 285, 215, 80, VERDE, 'POMC / CART', 'anorexígeno — ↓ fome')}
${receptor(550, 285, 'LEPR', VERDE)}
${receptor(685, 285, 'Y₁R', VERDE)}
${receptor(550, 365, 'MC3R', VERDE)}

${seta('M370 325 L502 325', CORAL, 'ap-barra')}
${rot(436, 313, 'inibição', 12, 700)}

<!-- ===== HORMÔNIOS PERIFÉRICOS ===== -->
${caixa(140, 545, 210, 62, AZUL, 'Grelina', 'estômago (células oxínticas)')}
${caixa(530, 545, 210, 62, AZUL, 'Insulina · Leptina', 'pâncreas · tecido adiposo')}

<!-- estímulo: cada hormônio sobe reto para o seu neurônio -->
${seta('M245 545 L245 382', ROXO, 'ap-sr')}
${rot(258, 470, '＋ estimula', 12, 700, 'start')}
${seta('M635 545 L635 382', VERDE, 'ap-sv')}
${rot(622, 470, '＋ estimula', 12, 700, 'end')}

<!-- inibição cruzada: cada hormônio freia o neurônio oposto -->
${seta('M350 545 L522 374', CORAL, 'ap-barra', true)}
${seta('M530 545 L358 374', CORAL, 'ap-barra', true)}

<!-- ===== NOTAS E LEGENDA ===== -->
${rot(440, 645, 'Tracejado = ação inibitória cruzada: a grelina freia o POMC/CART; insulina e leptina freiam o AgRP/NPY.', 12, 400, 'middle', 0.9)}
<line x1="60" y1="672" x2="820" y2="672" stroke="currentColor" stroke-opacity="0.25" stroke-width="1"/>
${rot(60, 694, 'AgRP, peptídeo relacionado ao agouti; CART, transcrito regulado por cocaína e anfetamina; GHSR, receptor do secretagogo do GH;', 11.5, 400, 'start', 0.85)}
${rot(60, 712, 'LEPR, receptor de leptina; MC3R/MC4R, receptor de melanocortina 3 e 4; NPY, neuropeptídeo Y; POMC, pró-opiomelanocortina;', 11.5, 400, 'start', 0.85)}
${rot(60, 730, 'Y₁R, receptor Y₁ do NPY; α-MSH, hormônio estimulador de melanócitos alfa.', 11.5, 400, 'start', 0.85)}
</svg>`;

const saida = path.join(__dirname, 'apetite.svg');
fs.writeFileSync(saida, svg.replace(/\n\s*\n/g, '\n'));
console.log('SVG gravado: ' + saida + ' (' + fs.statSync(saida).size + ' bytes)');
