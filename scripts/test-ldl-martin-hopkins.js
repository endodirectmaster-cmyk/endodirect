// LDL-c PELA EQUAÇÃO DE MARTIN/HOPKINS (24/10/2026): a tabela de 180 células, a
// calculadora "LDL (Martin/Hopkins)" (antes, Friedewald) e o LDL-c estimado na
// "Risco CV e metas — SBC 2025" quando o laudo não traz LDL-c.
//
// Decisão do professor (24/10): a Diretriz Brasileira de Dislipidemias 2025
// "recomenda-se a favor do uso da equação de Martin/Hopkins para cálculo de LDL-c
// para todos os indivíduos" (FORTE/MODERADA) e, com triglicérides acima de 800,
// "os resultados de LDL-c pela fórmula de Martin podem estar subestimados.
// Recomenda-se a avaliação do não-HDL-c".
//
// 🧨 O QUE ESTE TESTE PRENDE:
// (1) a tabela inteira — 180 fatores, as 30 faixas de TG e os 5 cortes de
//     não-HDL-c — contra a referência abaixo; as células que o texto publicado
//     confirma; e o desenho da tabela (o fator não sobe com o não-HDL-c nem cai com
//     o TG, com UMA exceção, que está igual em todas as fontes);
// (2) exemplos: o publicado (PMC8101115), contas à mão e as 180 células pela
//     referência;
// (3) as fronteiras: o piso de cada faixa já é dela (TG 50 → 50–56; não-HDL-c 100
//     → 100–129) — justo onde o LDLcalc erra;
// (4) TG acima de 800 (o limite da diretriz): o valor sai, com o aviso; 800 ainda
//     sem aviso; fora da tabela (< 7 ou > 13.975), a linha da ponta, marcada;
// (5) entrada inválida → NaN;
// (6) a calculadora 'ldl': o id mantido, nome, campos, nada de Friedewald, o aviso
//     e o não-HDL-c na tela, a conta à vista;
// (7) a calculadora de risco CV: desde 31/10/2026 (pedido do professor, como a fórmula
//     original) ela não pede triglicérides e não estima o LDL-c — vale o do laudo; a
//     estimativa fica nesta calculadora;
// (8) mutações que cada asserção tem de pegar;
// (9) os cartões de Lípides: Friedewald com a Martin/Hopkins e Lp(a) uma vez na vida, com
//     a frente mantida (o cartão semente casa pela frente).
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const falhas = [];
const ok = (c, m) => { if (!c) falhas.push(m); };

function corpo(nome, fonte) {
  const src = fonte || html;
  const marca = '\nfunction ' + nome + '(';
  const i = src.indexOf(marca);
  if (i < 0) throw new Error('função não encontrada: ' + nome);
  const f = src.indexOf('\nfunction ', i + marca.length);
  return src.slice(i + 1, f < 0 ? src.length : f);
}
function trechoVar(nome, fim, fonte) {
  const src = fonte || html;
  const i = src.indexOf('\nvar ' + nome + '=');
  if (i < 0) throw new Error('var não encontrada: ' + nome);
  return src.slice(i + 1, src.indexOf(fim, i) + fim.length);
}
function linhaVar(nome, fonte) {
  const src = fonte || html;
  const i = src.indexOf('\nvar ' + nome + '=');
  if (i < 0) throw new Error('var não encontrada: ' + nome);
  return src.slice(i + 1, src.indexOf('\n', i + 1));
}

// ───────────────────── A REFERÊNCIA ─────────────────────
// LDLcalc 2.1 (CRAN; github.com/cran/LDLcalc @ fd32807b28ad29d7e914cc16fde50b41a5d87b94,
// R/sysdata.rda: `dfCell180`, `TGRanges180`, `nonHDLRanges180`), lida por programa
// (o .rda é binário e o R não está na máquina) e conferida célula a célula contra:
// EBMcalc v23.1 build 269824 (Foundation Internet Services; a calculadora "Martin
// Equation for LDL-C" dos MSD Manuals — a matriz `NF` e a tabela da página; cópia em
// github.com/Eeviriyi-ECNU/LangChain-DSM-V @ 814c80a); alperyayla1/Low-Density-
// Lipoproteins-Estimation-App-Kotlin @ 1f2aeba (as linhas de TG < 400 e a de ≥ 800 da
// tabela estendida); pkarinaas/CALCULADORAS-LABORATORIO @ 6a77eb9;
// rodrigovoigt/medicina @ 0f5de89; nmillrr/outlabs @ a8bcdc1; e
// xergio1625/consensuslab @ e344347 — 180 de 180 em todas, e as faixas de TG e os
// cortes de não-HDL-c onde a fonte os traz. A Figura 2 do artigo (Martin SS et al.,
// JAMA 2013;310(19):2061-8) não abriu: o proxy barra o PMC, o Europe PMC e a JAMA.
// ⚠️ Por COLUNA (não-HDL-c), como o data.frame do pacote; a tabela do app é por
// linha (TG). A conferência transpõe: uma cópia não é colagem da outra.
const REF_COLUNAS = [
  /* < 100   */ [3.5, 4.0, 4.3, 4.5, 4.7, 4.8, 4.9, 5.0, 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 6.0, 6.1, 6.2, 6.3, 6.5, 6.7, 6.8, 7.0, 7.3, 7.6, 8.0, 8.5, 9.5, 11.9],
  /* 100–129 */ [3.4, 3.9, 4.1, 4.3, 4.4, 4.6, 4.6, 4.8, 4.8, 4.9, 5.0, 5.1, 5.2, 5.3, 5.4, 5.5, 5.5, 5.7, 5.8, 5.9, 6.0, 6.2, 6.3, 6.5, 6.7, 6.9, 7.2, 7.6, 8.3, 10.0],
  /* 130–159 */ [3.3, 3.7, 4.0, 4.1, 4.3, 4.4, 4.5, 4.6, 4.6, 4.7, 4.8, 4.8, 5.0, 5.0, 5.1, 5.2, 5.3, 5.3, 5.4, 5.6, 5.7, 5.8, 5.9, 6.0, 6.2, 6.4, 6.6, 7.0, 7.5, 8.8],
  /* 160–189 */ [3.3, 3.6, 3.9, 4.0, 4.2, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.7, 4.7, 4.8, 4.9, 5.0, 5.0, 5.1, 5.2, 5.3, 5.4, 5.4, 5.5, 5.7, 5.8, 6.0, 6.2, 6.5, 7.0, 8.1],
  /* 190–219 */ [3.2, 3.6, 3.8, 3.9, 4.1, 4.2, 4.3, 4.3, 4.4, 4.4, 4.5, 4.5, 4.6, 4.6, 4.7, 4.8, 4.8, 4.9, 5.0, 5.0, 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.9, 6.1, 6.5, 7.5],
  /* ≥ 220   */ [3.1, 3.4, 3.6, 3.9, 3.9, 4.1, 4.2, 4.2, 4.3, 4.3, 4.4, 4.3, 4.5, 4.5, 4.5, 4.6, 4.6, 4.7, 4.7, 4.8, 4.8, 4.9, 5.0, 5.1, 5.2, 5.3, 5.4, 5.6, 5.9, 6.7],
];
const REF_NHDL_ROT = ['< 100', '100–129', '130–159', '160–189', '190–219', '≥ 220'];
// TGRanges180: [piso, teto] de cada faixa de TG, em sequência.
const REF_TG = [7, 49, 50, 56, 57, 61, 62, 66, 67, 71, 72, 75, 76, 79, 80, 83, 84, 87, 88, 92, 93, 96, 97, 100, 101, 105, 106, 110, 111, 115,
  116, 120, 121, 126, 127, 132, 133, 138, 139, 146, 147, 154, 155, 163, 164, 173, 174, 185, 186, 201, 202, 220, 221, 247, 248, 292, 293, 399, 400, 13975];
// nonHDLRanges180
const REF_NHDL = [0, 99, 100, 129, 130, 159, 160, 189, 190, 219, 220, 99999];
const PISOS = REF_TG.filter((_, k) => k % 2 === 0), TETOS = REF_TG.filter((_, k) => k % 2 === 1);
const REF = (i, j) => REF_COLUNAS[j][i];

// O mundo: a conta, a calculadora de risco CV inteira (o mesmo recorte de
// test-risco-cv-sbc.js) e a entrada 'ldl' de CALCS, tudo recortado do index.html.
const FUNCOES = ['ldlMartinHopkins', 'ldlMartinFaixas', 'ldlMartinExtraHTML', 'ckdEpi2021', 'preventRisk', 'sbcN', 'sbcRenalDM', 'sbcEstratifica',
  'sbcDadosDoPrevent', 'sbcCategoria', 'sbcPendenciasHTML', 'ldlConduta', 'ldlEsquemaNivel', 'ldlEsquemaPelaReducao', 'ldlDosesHTML', 'sbcAlvoLDL',
  'ldlCondutaHTML', 'ldlFaixaEscore', 'ldlQuadroHTML', 'ldlAlvoHTML', 'fib4Calc', 'fib4Faixa', 'rcvDados', 'rcvSeg', 'rcvChips', 'rcvNum',
  'rcvFormHTML', 'rcvVisivel', 'rcvSemEscore', 'rcvDestaqueHTML', 'rcvCategoriaHTML', 'rcvPreventHTML', 'rcvMetasHTML', 'rcvEstrategiasHTML', 'rcvCartoesHTML', 'rcvVazio',
  'rcvResultadoHTML', 'rcvResumoDados'];
function itemLdl(fonte) {
  const src = fonte || html;
  const i0 = src.indexOf("{id:'ldl',name:");
  const i1 = src.indexOf("\n  {id:'", i0 + 5);
  if (i0 < 0 || i1 < 0) throw new Error("não achei a entrada {id:'ldl'} em CALCS");
  return src.slice(i0, i1).replace(/,\s*$/, '');
}
function mundo(fonte) {
  const ctx = vm.createContext({});
  vm.runInContext(
    'function esc(s){return String(s||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");}\n'
    + linhaVar('MARTIN_TG', fonte) + '\n' + linhaVar('MARTIN_NHDL', fonte) + '\n' + trechoVar('MARTIN_FATOR', '\n];', fonte) + '\n'
    + linhaVar('PREVENT_COEFS', fonte) + '\n' + trechoVar('PREVENT_AUG', '\n};', fonte) + '\n'
    + trechoVar('LDL_METAS', '\n};', fonte) + '\n' + linhaVar('SBC_ORD', fonte) + '\n' + linhaVar('SBC_COR', fonte) + '\n'
    + linhaVar('LDL_FAIXA_F', fonte) + '\n' + linhaVar('LDL_COLS', fonte) + '\n' + trechoVar('LDL_DOSES', '\n];', fonte) + '\n'
    + trechoVar('RCV_ESTRATEGIAS', '\n];', fonte) + '\n' + linhaVar('RCV_META_PA', fonte) + '\n'
    + FUNCOES.map((n) => corpo(n, fonte)).join('\n')
    + '\nvar LDLC=' + itemLdl(fonte) + ';'
    + '\nthis.MARTIN_TG=MARTIN_TG;this.MARTIN_NHDL=MARTIN_NHDL;this.MARTIN_FATOR=MARTIN_FATOR;this.LDLC=LDLC;', ctx);
  return ctx;
}
const M = mundo();

// ───────────────────── (1) a tabela contra a fonte ─────────────────────
// Cada conferência é uma função do "mundo": roda no app de verdade e, na seção
// (8), nos mutantes — que têm de cair nela.
function celulasIguais(W) {
  const T = W.MARTIN_FATOR, dif = [];
  let iguais = 0;
  for (let i = 0; i < 30; i++) for (let j = 0; j < 6; j++) {
    if (T[i] && T[i][j] === REF(i, j)) iguais++;
    else dif.push('TG ' + PISOS[i] + '–' + TETOS[i] + ' × não-HDL-c ' + REF_NHDL_ROT[j] + ': app ' + (T[i] && T[i][j]) + ', fonte ' + REF(i, j));
  }
  return { iguais, dif };
}
{
  const T = M.MARTIN_FATOR;
  ok(Array.isArray(T) && T.length === 30 && T.every((l) => Array.isArray(l) && l.length === 6), '(1) a tabela tem de ter 30 linhas (TG) × 6 colunas (não-HDL-c)');
  const c = celulasIguais(M);
  ok(c.iguais === 180, '(1) ⚠️ fatores diferentes da fonte (' + c.iguais + '/180 iguais): ' + c.dif.slice(0, 5).join(' | '));
  // As faixas: o piso de cada uma, e o teto é o piso da seguinte menos 1; a última
  // vai até 13.975 (o maior TG dos dados de Martin).
  ok(JSON.stringify(M.MARTIN_TG) === JSON.stringify(PISOS), '(1) os pisos das 30 faixas de TG não são os da fonte: ' + JSON.stringify(M.MARTIN_TG));
  ok(TETOS.every((t, k) => (k === 29 ? t === 13975 : t === PISOS[k + 1] - 1)), '(1) a referência tem buraco ou sobreposição entre faixas de TG');
  ok(JSON.stringify(M.MARTIN_NHDL) === JSON.stringify(REF_NHDL.filter((_, k) => k % 2 === 0).slice(1)) && JSON.stringify(M.MARTIN_NHDL) === '[100,130,160,190,220]',
    '(1) os cortes de não-HDL-c têm de ser 100, 130, 160, 190 e 220: ' + JSON.stringify(M.MARTIN_NHDL));
  // O que o texto publicado confirma, sem depender de implementação nenhuma.
  const plano = [].concat(...T);
  ok(Math.min(...plano) === 3.1 && Math.max(...plano) === 11.9, '(1) SBC 2025 (§3.1.1.2.2.3): "x varia de 3,1 a 11,9"');
  ok(JSON.stringify(T[29]) === JSON.stringify([11.9, 10.0, 8.8, 8.1, 7.5, 6.7]), '(1) PMC10623527: TG de 400 a 13.975 → 11,9; 10,0; 8,8; 8,1; 7,5; 6,7 por faixa de não-HDL-c');
  ok(T[0][0] === 3.5, '(1) PMC4732787: TG < 50 com não-HDL-c < 100 é 3,5 "in Martin et al.\'s study"');
  // O desenho da tabela (Martin 2013): o fator cai com o não-HDL-c e sobe com o TG,
  // e um erro de digitação quase sempre quebra isso. A única exceção — TG 97–100
  // com não-HDL-c ≥ 220, 4,3 depois do 4,4 da faixa 93–96 — está nas sete fontes.
  const sobe = [], cai = [];
  for (let i = 0; i < 30; i++) for (let j = 0; j < 5; j++) if (T[i][j + 1] > T[i][j]) sobe.push(i + ',' + j);
  for (let j = 0; j < 6; j++) for (let i = 0; i < 29; i++) if (T[i + 1][j] < T[i][j]) cai.push((i + 1) + ',' + j);
  ok(sobe.length === 0 && JSON.stringify(cai) === '["11,5"]', '(1) o desenho da tabela mudou — sobe com o não-HDL-c em [' + sobe + '], cai com o TG em [' + cai + ']');
}

// ───────────────────── (2) exemplos ─────────────────────
{
  const L = M.ldlMartinHopkins;
  // Publicado: Lipids Health Dis 2021 (PMC8101115), o "illustrative example": TG
  // 1986, CT 299 e HDL-C 21 mg/dL → "LDL-M −18.418 mg/dL" (Friedewald −119,2).
  const p = L(299, 21, 1986);
  ok(Math.abs(p.ldl - (-18.418)) < 0.0005 && p.fator === 6.7 && p.tgAlto && /subestimado/.test(p.aviso) && /não-HDL-c/.test(p.aviso),
    '(2) o exemplo publicado (PMC8101115): −18,418 mg/dL com fator 6,7, e o aviso de TG acima de 800: veio ' + p.ldl + ' / ' + p.fator);
  ok(Math.abs((299 - 21 - 1986 / 5) - (-119.2)) < 1e-9, '(2) controle da leitura do exemplo: o Friedewald dele é −119,2');
  // À mão, cada um numa célula: [CT, HDL-c, TG, fator, LDL-c].
  const MAO = [
    [200, 50, 150, 5.7, 123.684],  // não-HDL-c 150 (130–159) × TG 147–154; Friedewald daria 120
    [150, 40, 250, 7.6, 77.105],   // 110 (100–129) × 248–292; Friedewald daria 60
    [180, 45, 100, 4.8, 114.167],  // 135 (130–159) × 97–100
    [300, 40, 60, 3.6, 243.333],   // 260 (≥ 220) × 57–61
    [140, 60, 30, 3.5, 71.429],    // 80 (< 100) × 7–49
    [250, 30, 500, 6.7, 145.373],  // 220 (≥ 220) × 400–13.975, ainda sem o aviso
    [265, 40, 150, 4.8, 193.75],   // 225 (≥ 220) × 147–154
  ];
  for (const [ct, hdl, tg, f, esp] of MAO) {
    const r = L(ct, hdl, tg);
    ok(r.fator === f && Math.abs(r.ldl - esp) < 0.0005 && Math.abs(r.nhdl - (ct - hdl)) < 1e-9 && !r.tgAlto && r.aviso === '',
      '(2) CT ' + ct + ', HDL-c ' + hdl + ', TG ' + tg + ': esperava fator ' + f + ' e LDL-c ' + esp + ', veio ' + r.fator + ' e ' + r.ldl);
  }
  // As 180 células, pela referência: o meio de cada faixa de TG (a última, 500) e de
  // não-HDL-c (≥ 220: 250), com HDL-c de 50.
  const NH = [80, 115, 145, 175, 205, 250], ruins = [];
  for (let i = 0; i < 30; i++) for (let j = 0; j < 6; j++) {
    const tg = i === 29 ? 500 : Math.floor((PISOS[i] + TETOS[i]) / 2), r = L(50 + NH[j], 50, tg);
    if (!(r.linha === i && r.coluna === j && r.fator === REF(i, j) && Math.abs(r.ldl - (NH[j] - tg / REF(i, j))) < 1e-9)) ruins.push(i + ',' + j);
  }
  ok(ruins.length === 0, '(2) ⚠️ a conta em cada uma das 180 células tem de usar o fator da fonte: ' + ruins.slice(0, 6).join(' '));
}

// ───────────────────── (3) as fronteiras ─────────────────────
function errosFronteira(W) {
  const L = W.ldlMartinHopkins, e = [];
  const linha = (tg) => L(200, 50, tg).linha;     // não-HDL-c 150
  PISOS.forEach((p, i) => {
    if (linha(p) !== i) e.push('TG ' + p + ' → linha ' + linha(p) + ' (esperava ' + i + ')');
    if (i > 0 && linha(p - 1) !== i - 1) e.push('TG ' + (p - 1) + ' → linha ' + linha(p - 1));
    if (i > 0 && linha(p - 0.01) !== i - 1) e.push('TG ' + (p - 0.01) + ' → linha ' + linha(p - 0.01));
  });
  const col = (nh) => L(50 + nh, 50, 150).coluna;
  [100, 130, 160, 190, 220].forEach((c, k) => {
    if (col(c) !== k + 1) e.push('não-HDL-c ' + c + ' → coluna ' + col(c) + ' (esperava ' + (k + 1) + ')');
    if (col(c - 1) !== k) e.push('não-HDL-c ' + (c - 1) + ' → coluna ' + col(c - 1));
    if (col(c - 0.01) !== k) e.push('não-HDL-c ' + (c - 0.01) + ' → coluna ' + col(c - 0.01));
  });
  return e;
}
{
  const e = errosFronteira(M);
  ok(e.length === 0, '(3) ⚠️ fronteiras: o piso de cada faixa é dela, e o que fica logo abaixo é da anterior: ' + e.slice(0, 4).join(' | '));
  const L = M.ldlMartinHopkins;
  // O que o LDLcalc erra (o piso caindo na faixa de baixo), aqui não: TG 50 com
  // não-HDL-c 100 é a célula 50–56 × 100–129, fator 3,9 — não 3,5.
  ok(L(150, 50, 50).fator === 3.9 && L(150, 50, 49).fator === 3.4 && L(149.99, 50, 50).fator === 4.0, '(3) TG 50 e não-HDL-c 100: fator 3,9 (50–56 × 100–129)');
  const f = M.ldlMartinFaixas(L(200, 50, 150)), u = M.ldlMartinFaixas(L(300, 40, 500)), b = M.ldlMartinFaixas(L(100, 40, 30));
  ok(f.tg === '147–154' && f.nhdl === '130–159' && u.tg === '400–13.975' && u.nhdl === '≥ 220' && b.tg === '7–49' && b.nhdl === '< 100', '(3) os rótulos das faixas da célula usada');
}

// ───────────────────── (4) TG acima de 800 e fora da tabela ─────────────────────
function tg800(W) {
  // A diretriz: "Quando os valores de triglicérides estão ACIMA de 800 mg/dL" (">800").
  const L = W.ldlMartinHopkins, a = L(250, 40, 800), b = L(250, 40, 801);
  return !a.tgAlto && a.aviso === '' && isFinite(a.ldl) && b.tgAlto && isFinite(b.ldl) && Math.abs(b.ldl - (210 - 801 / REF(29, 4))) < 1e-9
    && /^TG acima de 800 mg\/dL: o LDL-c pela equação de Martin\/Hopkins pode estar subestimado; avalie o não-HDL-c/.test(b.aviso);
}
{
  const L = M.ldlMartinHopkins;
  ok(tg800(M), '(4) ⚠️ TG 800 sem aviso (a diretriz diz "acima de 800"); TG 801: o valor sai (não NaN), com o aviso de "pode estar subestimado" e de avaliar o não-HDL-c');
  const c = L(250, 40, 13975), d = L(250, 40, 20000), e = L(200, 150, 5);
  ok(c.linha === 29 && c.fora === '' && c.tgAlto, '(4) TG de 13.975 ainda está na tabela (última faixa), com o aviso');
  ok(d.linha === 29 && d.fora === 'acima' && d.tgAlto && isFinite(d.ldl), '(4) TG acima de 13.975: a linha da ponta, marcada, com o aviso');
  ok(e.linha === 0 && e.fora === 'abaixo' && isFinite(e.ldl) && !e.tgAlto && L(250, 40, 7).fora === '', '(4) TG abaixo de 7: a primeira linha, marcada; 7 já está na tabela');
  ok(/fora da tabela, e vale a linha da ponta/.test(M.ldlMartinExtraHTML(d)) && /abaixo de 7 mg\/dL/.test(M.ldlMartinExtraHTML(e)), '(4) a conta à vista diz quando o TG está fora da tabela');
}

// ───────────────────── (5) entrada inválida ─────────────────────
{
  const L = M.ldlMartinHopkins;
  const INV = [[NaN, 50, 150], ['', 50, 150], [null, 50, 150], [undefined, 50, 150], ['abc', 50, 150], [Infinity, 50, 150], [200, 0, 150], [200, -5, 150],
    [200, 50, 0], [200, 50, -1], [200, 200, 150], [200, 210, 150], [0, 0, 0], [200, 50, ''], ['200', '50', ' '], [true, 50, 150]];
  const ruins = INV.filter((a) => { const r = L(...a); return !(Number.isNaN(r.ldl) && Number.isNaN(r.fator) && Number.isNaN(r.nhdl) && !r.tgAlto && r.aviso === ''); });
  ok(ruins.length === 0, '(5) entrada inválida (vazio, texto, ≤ 0, HDL-c ≥ CT) tem de dar NaN: ' + JSON.stringify(ruins));
  ok(Math.abs(L('200,5', '50', '150').ldl - (150.5 - 150 / 5.7)) < 1e-9 && Math.abs(L(' 200 ', '50', '150').ldl - (150 - 150 / 5.7)) < 1e-9, '(5) o texto do campo, com vírgula decimal, é número');
  ok(M.ldlMartinExtraHTML(L('', 50, 150)) === '', '(5) sem conta, a conta à vista não aparece');
}

// ───────────────────── (6) a calculadora 'ldl' ─────────────────────
{
  const C = M.LDLC, item = itemLdl();
  const v = (ct, hdl, tg) => ({ ldl_ct: String(ct), ldl_hdl: String(hdl), ldl_tg: String(tg) });
  ok(C.id === 'ldl' && C.name === 'LDL (Martin/Hopkins)' && C.area === 'Lípides' && C.unit === 'mg/dL', '(6) id mantido, nome "LDL (Martin/Hopkins)", área e unidade');
  ok((html.match(/\{id:'ldl',/g) || []).length === 1, "(6) uma entrada {id:'ldl'} só (test-risco-cv-sbc.js recorta por ela)");
  ok(C.fields.map((f) => f.id).join(',') === 'ldl_ct,ldl_hdl,ldl_tg' && C.fields.every((f) => f.type === 'num'), '(6) os mesmos três campos (CT, HDL, TG)');
  const calcs = html.slice(html.indexOf('var CALCS=['), html.indexOf('\n];', html.indexOf('var CALCS=[')));
  ok(!/Friedewald|\/\s*5\b/.test(item) && !/(name|desc|note):'[^']*Friedewald/.test(calcs), '(6) ⚠️ nada de Friedewald (nem TG/5) na calculadora');
  ok(/ldlMartinHopkins\(v\.ldl_ct,v\.ldl_hdl,v\.ldl_tg\)/.test(C.calc.toString()), '(6) a conta é a ldlMartinHopkins, a mesma da calculadora de risco CV');
  ok(C.calc(v(200, 50, 150)) === 124 && Number.isNaN(C.calc(v('', 50, 150))) && Number.isNaN(C.calc(v(200, 210, 150))), '(6) o número grande: 124 (inteiro, como no laudo); sem dado, NaN');
  const n = C.interp(124, v(200, 50, 150));
  ok(n.t === 'Fator 5,7 · não-HDL-c 150 mg/dL' && n.c === 'tag-blue', '(6) a interpretação mostra o fator e o não-HDL-c ao lado: ' + JSON.stringify(n));
  const a = C.interp(C.calc(v(250, 40, 900)), v(250, 40, 900));
  ok(a.c === 'tag-red' && a.t === 'TG > 800: avalie o não-HDL-c (210 mg/dL)' && isFinite(C.calc(v(250, 40, 900))),
    '(6) ⚠️ TG acima de 800: o número sai, com o aviso e o não-HDL-c: ' + JSON.stringify(a));
  const z = C.interp(C.calc(v(100, 70, 600)), v(100, 70, 600));
  ok(z.c === 'tag-red' && z.t === 'Sem valor: avalie o não-HDL-c (30 mg/dL)', '(6) estimativa ≤ 0: sem valor, avalie o não-HDL-c: ' + JSON.stringify(z));
  ok(C.interp(NaN, v(200, '', 150)).c === 'tag-gold' && C.interp(NaN, v(200, '', 150)).t === 'Preencha CT, HDL e triglicérides.'
    && C.interp(NaN, v(200, 210, 150)).t === 'Confira: valores > 0 e HDL < CT.' && C.interp(NaN, v(200, 50, 0)).t === 'Confira: valores > 0 e HDL < CT.',
    '(6) faltando campo: "Preencha"; HDL-c ≥ CT ou valor ≤ 0: "Confira"');
  // ⚠️ `.tag` não quebra linha: a 360 px o que passa de ~40 caracteres é cortado
  // (medido no Chromium; o aviso de TG acima de 800 por extenso saía "— ava…").
  const etiquetas = [[200, 50, 150], [250, 40, 900], [1300, 40, 900], [100, 70, 600], [200, '', 150], [200, 210, 150]].map((c) => C.interp(C.calc(v(...c)), v(...c)).t);
  ok(etiquetas.every((t) => t.length <= 41), '(6) etiqueta curta (≤ 41 caracteres, ou o celular corta): ' + JSON.stringify(etiquetas.filter((t) => t.length > 41)));
  const x = C.extra(124, v(200, 50, 150));
  ok(x.indexOf('LDL-c = CT − HDL-c − TG ÷ fator = 200 − 50 − 150 ÷ 5,7 = <b>123,7 mg/dL</b>') >= 0 && /TG 147–154 × não-HDL-c 130–159 mg\/dL/.test(x)
    && x.indexOf('Não-HDL-c = CT − HDL-c = <b>150 mg/dL</b>') >= 0 && /Risco CV e metas — SBC 2025/.test(x) && !/⚠️/.test(x) && !/§4\.1/.test(x),
    '(6) a conta à vista: a fórmula com os números, a célula da tabela e o não-HDL-c');
  ok(/^<div[^>]*><b>⚠️ TG acima de 800 mg\/dL: o LDL-c pela equação de Martin\/Hopkins pode estar subestimado; avalie o não-HDL-c \(SBC 2025, rec\. §3\)\.<\/b><br>LDL-c = /.test(C.extra(0, v(250, 40, 900))),
    '(6) ⚠️ TG acima de 800: o aviso por extenso abre a conta à vista, logo abaixo da etiqueta');
  ok(/^<div[^>]*><b>⚠️ Estimativa de 0 ou menos/.test(C.extra(-20, v(100, 70, 600))), '(6) estimativa ≤ 0: o aviso abre a conta à vista');
  const x190 = C.extra(194, v(265, 40, 150)), x160 = C.extra(170, v(220, 30, 120)), x150 = C.extra(150, v(200, 30, 120));
  ok(/LDL-c ≥ 190 sem tratamento: risco no mínimo alto, e investigar hipercolesterolemia familiar \(SBC 2025, §4\.1\)/.test(x190)
    && /LDL-c de 160–189 sem tratamento: risco no mínimo intermediário/.test(x160) && !/§4\.1/.test(x150), '(6) LDL-c de 160 ou mais: o corte da SBC 2025 que não depende da categoria (§4.1)');
  ok(!/<[^>]*\sstyle="[^"]*"[^>]*\sstyle="/.test(x + x190), '(6) um style por elemento');
  ok(/Martin\/Hopkins/.test(C.note) && /Diretriz Brasileira de Dislipidemias 2025/.test(C.note) && /acima de 800 mg\/dL/.test(C.note) && /não-HDL-c/.test(C.note) && /JAMA 2013/.test(C.note) && !/Friedewald/.test(C.note),
    '(6) a nota: a equação, a fonte, a recomendação da SBC 2025 e o aviso de TG acima de 800');
  ok(/Martin\/Hopkins/.test(C.desc) && /não-HDL-c/.test(C.desc), '(6) a descrição do cartão');
}

// ───────────────────── (7) a calculadora de risco CV ─────────────────────
// 31/10/2026: a "Risco CV e metas — SBC 2025" ficou como a fórmula original — sem
// triglicérides e sem estimar o LDL-c. Vale o LDL-c do laudo; a estimativa por
// Martin/Hopkins continua aqui, na calculadora própria.
{
  const B = { sexo: 'M', idade: '25', peso: '80', altura: '178', pas: '120', cr: '1', tab: 'nao', ahas: 'nao', has: 'nao', dm: 'nao', ev: 'nao', est: 'nao', lpa_un: 'nd' };
  const ex = (o) => Object.assign({}, B, o);
  const x1 = M.rcvDados(ex({ ct: '230', hdl: '40', tg: '150' }), 2026);
  ok(Number.isNaN(x1.d.ldl) && x1.d.ldlEstimado === undefined && x1.ldlMH === undefined, '(7) laudo vazio + CT/HDL-c/TG: a calculadora de risco CV não estima o LDL-c');
  const x2 = M.rcvDados(ex({ ct: '230', hdl: '40', ldl: '150' }), 2026);
  ok(x2.d.ldl === 150 && x2.cat.k === 'baixo', '(7) vale o LDL-c do laudo');
  const f = M.rcvFormHTML({}), h = M.rcvResultadoHTML(ex({ ct: '230', hdl: '40', tg: '150' }));
  ok(!/data-rcv-k="tg"/.test(f) && !/Martin\/Hopkins|Triglicérides/.test(f + h) && !/data-rcv-calc="ldlmh"/.test(f), '(7) nem o formulário nem o resultado falam em triglicérides ou em Martin/Hopkins');
  ok(/Informe o LDL-c para calcular a redução necessária/.test(h), '(7) sem LDL-c, a tela pede o LDL-c');
  const calc = corpo('rcvDados');
  ok(!/ldlMartinHopkins|ldlMH|n\('tg'\)/.test(calc), '(7) o rcvDados não lê TG nem chama a Martin/Hopkins');
}

// ───────────────────── (9) os cartões de Lípides (FC_MEMBER) ─────────────────────
// Decisão do professor (24/10): o cartão do Friedewald cita a Martin/Hopkins, e o da Lp(a)
// diz "uma vez na vida em todos os adultos" (SBC 2025). ⚠️ Só o verso muda: o app casa o
// cartão semente pela FRENTE (seedFlashcards → reconcile, que propaga o verso novo), e uma
// frente nova viraria cartão duplicado no baralho de quem já tem o antigo (o caso do SOMP, #876).
function versoDe(frente, fonte) {
  const m = (fonte || html).match(new RegExp('\\["' + frente.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '","([^"]*)"\\]'));
  return m && m[1];
}
{
  const fw = versoDe('Fórmula de Friedewald e sua limitação?'), lpa = versoDe('Relevância da lipoproteína(a)?');
  ok(fw && /Martin\/Hopkins/.test(fw) && /SBC 2025/.test(fw) && /TG\/5/.test(fw), '(9) o verso do Friedewald tem de manter a fórmula e citar a Martin/Hopkins da SBC 2025: ' + fw);
  ok(lpa && /uma vez na vida em todos os adultos/.test(lpa) && /SBC 2025/.test(lpa) && !/em risco aumentado/.test(lpa), '(9) o verso da Lp(a) tem de dizer "uma vez na vida em todos os adultos": ' + lpa);
}

// ───────────────────── (8) mutações ─────────────────────
function mutante(fn, de, para) {
  const alvo = corpo(fn);
  if (alvo.indexOf(de) < 0) throw new Error('mutação não se aplica (o código mudou): ' + fn + ': ' + de);
  return mundo(html.replace(alvo, alvo.replace(de, para)));
}
function mutanteVar(nome, fim, de, para) {
  const alvo = fim ? trechoVar(nome, fim) : linhaVar(nome);
  if (alvo.indexOf(de) < 0) throw new Error('mutação não se aplica (o código mudou): ' + nome + ': ' + de);
  return mundo(html.replace(alvo, alvo.replace(de, para)));
}
ok(celulasIguais(mutanteVar('MARTIN_FATOR', '\n];', '[5.4,5.1,4.8,4.7,4.5,4.3], // TG 97–100', '[5.4,5.1,4.8,4.7,4.5,4.4], // TG 97–100')).iguais === 179,
  'MUTAÇÃO: "consertar" a célula 97–100 × ≥ 220 (4,3 → 4,4) tinha de aparecer na conferência da tabela');
ok(celulasIguais(mutanteVar('MARTIN_FATOR', '\n];', '[6.2,5.8,5.4,5.2,5.0,4.7]', '[6.2,5.8,5.4,5.2,5.0,4.8]')).iguais === 179, 'MUTAÇÃO: um décimo a mais numa célula tinha de aparecer');
ok(errosFronteira(mutanteVar('MARTIN_TG', null, ',97,101,', ',97,102,')).length > 0, 'MUTAÇÃO: mexer no piso de uma faixa de TG (101 → 102) tinha de aparecer');
ok(errosFronteira(mutante('ldlMartinHopkins', 'tg>=MARTIN_TG[i+1]', 'tg>MARTIN_TG[i+1]')).length > 0, 'MUTAÇÃO: o piso da faixa de TG caindo na faixa de baixo (o erro do LDLcalc) tinha de aparecer');
ok(errosFronteira(mutante('ldlMartinHopkins', 'nhdl>=MARTIN_NHDL[j]', 'nhdl>MARTIN_NHDL[j]')).length > 0, 'MUTAÇÃO: não-HDL-c 100 caindo em < 100 tinha de aparecer');
ok(!tg800(mutante('ldlMartinHopkins', 'tgAlto=tg>800', 'tgAlto=tg>=800')), 'MUTAÇÃO: "≥ 800" no lugar de "> 800" (a diretriz diz "acima de 800") tinha de aparecer');

if (falhas.length) { console.error('test-ldl-martin-hopkins: ' + falhas.length + ' falha(s)'); falhas.forEach((f) => console.error('  ✗ ' + f)); process.exit(1); }
console.log('test-ldl-martin-hopkins: ok (180 fatores e faixas contra a fonte, exemplo publicado e contas à mão, fronteiras, TG acima de 800 com aviso, entrada inválida, calculadora sem Friedewald, a de risco CV só com o LDL-c do laudo, mutações e os cartões de Lípides)');
