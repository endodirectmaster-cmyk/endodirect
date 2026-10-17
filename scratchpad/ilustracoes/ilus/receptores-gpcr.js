'use strict';
// Receptores Hormonais e Transdução de Sinal — receptor acoplado à proteína G: Gs, Gi, Gq.
const L = require('../lib.js');
const { P } = L;

module.exports = {
  id: 'receptores-gpcr',
  sub: 'Endocrinologia Básica',
  tema: 'Receptores Hormonais e Transdução de Sinal',
  // onde entra no texto: logo depois do item que termina com este trecho
  depoisDe: '(TRH, GnRH, ADH-V1, angiotensina II, α1-adrenérgico, receptor sensor de cálcio CaSR).',
  titulo: 'Receptor acoplado à proteína G: as vias Gs, Gi e Gq',
  subtitulo: 'A Gα troca GDP por GTP, solta-se do dímero Gβγ e age sobre o efetor; a atividade GTPásica da própria Gα encerra o sinal.',
  legenda: 'Receptores acoplados à proteína G: as vias Gs, Gi e Gq. Ilustração Endodirect a partir do texto do capítulo.',
  // trechos literais do capítulo que sustentam cada afirmação (conferidos por confere-lastro.js)
  lastro: [
    'receptores com **7 domínios transmembrana**',
    'A ligação troca GDP por GTP … atividade **GTPásica** intrínseca encerra o sinal.',
    '**Gs → adenilil-ciclase → ↑AMPc → PKA** (ACTH, TSH, LH/FSH, glucagon, PTH, ADH-V2, β-adrenérgico)',
    'A **toxina colérica** ADP-ribosila Gs e a mantém ligada (↑AMPc sustentado → diarreia secretora).',
    '**Gi → ↓AMPc** (somatostatina, α2-adrenérgico, dopamina-D2). A **toxina pertussis** inativa Gi.',
    'Ativa canais de Ca²⁺ e **ativa a adenilil ciclase**',
    'Ativa canais de K⁺ e **inibe a adenilil ciclase**',
    'Ativa a **fosfolipase C**',
    '**Gq → fosfolipase C-β → PIP2 … α1-adrenérgico, receptor sensor de cálcio CaSR)',
    'Resposta **rápida** (segundos a minutos), por … existentes (fosforilação), sem depender de transcrição.',
    'O receptor confere ainda **amplificação** — … milhares de moléculas de segundo mensageiro.',
    'A **especificidade** da resposta vem do receptor e da maquinaria intracelular, não do hormônio',
  ],
  W: 820,
  H: 572,
  desenhar() {
    let s = '';
    const yM = 196, hM = 30; // membrana
    const cols = [44, 297, 550], cw = 246;
    // a fosfolipase C-β não atravessa a membrana: fica presa à face interna, um pouco à direita
    const ex = (i) => cols[i] + 146 + (i === 2 ? 10 : 0), ew = 84, ecx = (i) => ex(i) + ew / 2;
    // ambiente: margem esquerda com os nomes das zonas na vertical
    s += L.citoplasma(36, yM + hM - 6, 770, 548 - (yM + hM - 6));
    s += L.membrana(36, 806, yM, hM, [0, 1].map((i) => [ex(i), ex(i) + ew]));
    s += L.zonaV(24, 140, 'meio extracelular');
    s += L.zonaV(24, 360, 'citoplasma');
    // divisórias das colunas
    [cols[1] - 6, cols[2] - 6].forEach((x) => {
      s += '<line x1="' + x + '" y1="84" x2="' + x + '" y2="' + (yM - 10) + '" stroke="' + P.line + '" stroke-width="1.2" stroke-dasharray="4 4"/>';
      s += '<line x1="' + x + '" y1="' + (yM + hM + 10) + '" x2="' + x + '" y2="466" stroke="#dde3ec" stroke-width="1.2" stroke-dasharray="4 4"/>';
    });
    const vias = [
      { nome: 'Gs — estimula', cor: P.green, ac: 'green', alfa: 'αs', ex: 'ACTH, TSH, LH/FSH, glucagon, PTH, ADH (V2), β-adrenérgico', efetor: 'adenilil-\nciclase' },
      { nome: 'Gi — inibe', cor: P.red, ac: 'red', alfa: 'αi', ex: 'somatostatina, α2-adrenérgico, dopamina (D2)', efetor: 'adenilil-\nciclase' },
      { nome: 'Gq — fosfolipase C', cor: P.blue, ac: 'blue', alfa: 'αq', ex: 'TRH, GnRH, ADH (V1), angiotensina II, α1-adrenérgico, CaSR', efetor: 'fosfolipase\nC-β' },
    ];
    vias.forEach((v, i) => {
      const x0 = cols[i], rx = x0 + 52;
      // cabeçalho e exemplos
      s += L.txt(x0 + cw / 2, 92, v.nome, { size: 14, bold: true, fill: v.cor });
      s += L.linhas(x0 + cw / 2, 98, v.ex, { size: 11, fill: P.slate, maxW: cw - 20 }).svg;
      // hormônio chegando ao receptor
      s += L.peptideo(rx - 13, 154, P.red, 4);
      if (i === 0) s += L.txt(rx + 22, 157, 'hormônio', { size: 10.5, italic: true, fill: P.slate, anchor: 'start' });
      s += L.seta('M' + rx + ',162 L' + rx + ',' + (yM - 22), { cor: 'slate', w: 1.6 });
      // receptor de 7 hélices
      s += L.receptor7TM(rx, yM, hM, P.blue);
      // efetor: a adenilil-ciclase atravessa a membrana; a fosfolipase C-β fica na face interna
      const plc = i === 2;
      s += L.caixa(ex(i), plc ? yM + hM - 3 : yM - 12, ew, plc ? 40 : hM + 24, v.efetor, { f: '#ffffff', b: v.cor, sw: 2, size: 11, rx: 9 });
      // proteína G ativada: α com GTP solta do βγ (que fica afastado do receptor) e sua ação no efetor
      const ax = rx + (plc ? 64 : 78), ay = yM + hM + (plc ? 40 : 30);
      s += L.proteinaG(rx + 32, yM + hM + 20, v.alfa, v.cor, true, { beta: [rx - 6, yM + hM + 34], alfa: [ax, ay] });
      const d = plc ? 'M' + (ax + 12) + ',' + (ay - 10) + ' C' + (ax + 20) + ',' + (ay - 22) + ' ' + (ex(i) - 14) + ',' + (yM + hM + 14) + ' ' + (ex(i) - 4) + ',' + (yM + hM + 14)
        : 'M' + (ax + 14) + ',' + (ay - 9) + ' C' + (ax + 26) + ',' + (ay - 22) + ' ' + (ecx(i) - 10) + ',' + (yM + hM + 30) + ' ' + (ecx(i) - 6) + ',' + (yM + hM + 16);
      s += i === 1 ? L.seta(d, { inibe: true, w: 2.2 }) : L.seta(d, { cor: v.ac, w: 2.2 });
    });
    const y1 = yM + hM + 12;
    // ── Gs: AMPc → PKA → resposta
    {
      const c = ecx(0);
      s += L.seta('M' + c + ',' + y1 + ' L' + c + ',' + (y1 + 36), { cor: 'green' });
      s += L.mensageiro(c, y1 + 52, '↑ AMPc', P.gold);
      s += L.seta('M' + c + ',' + (y1 + 76) + ' L' + c + ',' + (y1 + 98), { cor: 'slate' });
      s += L.caixa(c - 30, y1 + 100, 60, 26, 'PKA', { f: P.navy, b: P.navy, t: P.white, size: 12.5 });
      s += L.seta('M' + (c - 30) + ',' + (y1 + 113) + ' C' + (c - 52) + ',' + (y1 + 113) + ' ' + (c - 70) + ',' + (y1 + 120) + ' ' + (c - 74) + ',' + (y1 + 140), { cor: 'slate' });
      s += L.linhas(cols[0] + 74, y1 + 142, 'fosforila proteínas já existentes:\nresposta em segundos a minutos', { size: 11, fill: P.ink }).svg;
      s += L.nota(cols[0] + 4, 418, cw - 8, 'Toxina colérica: ADP-ribosila a Gs e a mantém ligada → ↑AMPc sustentado → diarreia secretora.', { cor: 'red', size: 10.8 }).svg;
    }
    // ── Gi: ↓ AMPc
    {
      const c = ecx(1);
      s += L.seta('M' + c + ',' + y1 + ' L' + c + ',' + (y1 + 36), { cor: 'slate', trac: true });
      s += L.mensageiro(c, y1 + 52, '↓ AMPc', '#e5d39a');
      s += L.nota(cols[1] + 4, 418, cw - 8, 'Toxina pertussis: inativa a Gi.', { cor: 'red', size: 10.8 }).svg;
    }
    // ── Gq: PIP2 → IP3 (libera Ca²⁺ do retículo) + DAG → PKC — começa abaixo da PLC-β
    {
      const x0 = cols[2], c = ecx(2), y1 = yM + hM + 37;
      s += L.seta('M' + c + ',' + y1 + ' L' + c + ',' + (y1 + 22), { cor: 'blue' });
      s += L.pilula(c, y1 + 34, 'PIP2', { size: 11, bold: true, f: P.blueL, b: P.blue, t: P.blueD });
      s += L.seta('M' + (c - 14) + ',' + (y1 + 44) + ' C' + (c - 26) + ',' + (y1 + 60) + ' ' + (c - 62) + ',' + (y1 + 60) + ' ' + (c - 74) + ',' + (y1 + 72), { cor: 'blue' });
      s += L.seta('M' + (c + 6) + ',' + (y1 + 45) + ' L' + (c + 6) + ',' + (y1 + 72), { cor: 'blue' });
      s += L.pilula(c - 82, y1 + 84, 'IP3', { size: 11, bold: true, f: '#ffffff', b: P.blue, t: P.blueD });
      s += L.pilula(c + 6, y1 + 84, 'DAG', { size: 11, bold: true, f: '#ffffff', b: P.blue, t: P.blueD });
      // retículo endoplasmático liberando Ca²⁺
      const rx0 = x0 + 8, ry0 = y1 + 132;
      s += '<path d="M' + rx0 + ',' + ry0 + ' q12,-14 24,0 t24,0 t24,0 t24,0 v14 q-12,14 -24,0 t-24,0 t-24,0 t-24,0 z" fill="#fde7ef" stroke="#c2185b" stroke-width="1.6"/>';
      s += L.txt(rx0 + 48, ry0 + 34, 'retículo', { size: 10.5, italic: true, fill: '#880e4f' });
      s += L.seta('M' + (c - 82) + ',' + (y1 + 96) + ' C' + (c - 84) + ',' + (y1 + 108) + ' ' + (rx0 + 62) + ',' + (y1 + 108) + ' ' + (rx0 + 58) + ',' + (ry0 - 12), { cor: 'blue' });
      [[rx0 + 108, ry0 + 4], [rx0 + 117, ry0 - 6], [rx0 + 125, ry0 + 8]].forEach((p) => { s += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="3.4" fill="#0ea5e9"/>'; });
      s += L.txt(rx0 + 116, ry0 + 30, 'libera Ca²⁺', { size: 11, bold: true, fill: '#0369a1' });
      // DAG → PKC
      s += L.seta('M' + (c + 6) + ',' + (y1 + 96) + ' L' + (c + 6) + ',' + (y1 + 118), { cor: 'slate' });
      s += L.caixa(c - 24, y1 + 120, 60, 26, 'PKC', { f: P.navy, b: P.navy, t: P.white, size: 12.5 });
    }
    // ── rodapé: amplificação e especificidade
    s += L.nota(44, 482, 752, 'Amplificação: uma molécula de hormônio ligada ativa muitas proteínas G e gera milhares de moléculas de segundo mensageiro. A especificidade da resposta vem do receptor e da maquinaria intracelular da célula-alvo, não do hormônio.', { cor: 'blue', size: 11.2 }).svg;
    return s;
  },
};
