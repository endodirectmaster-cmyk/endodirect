// Trajetória de peso pós-bariátrica (SOPHIA), com as árvores RECORTADAS do
// index.html de verdade.
//
// O que este teste existe para pegar: as árvores foram TRANSCRITAS de figuras do
// apêndice do artigo (Appendix Figure 3). Transcrição de figura erra de dois
// jeitos — trocar o lado de um ramo e trocar o valor de uma folha — e nenhum dos
// dois aparece como erro de execução: aparece como previsão errada.
//
// Duas travas independentes:
//  1. cada folha é conferida percorrendo o caminho à mão;
//  2. a SOMA DOS n DE CADA FOLHA, que consta na figura, tem de fechar com o n da
//     raiz (948 em M12, 755 em M24, 578 em M60). É o que provou que a estrutura
//     estava lida certa antes de qualquer código.
//
// E a trava que vale mais que as duas: a TABELA DE VALORES da ferramenta oficial,
// que o professor rodou em dois pacientes. São seis números exatos, e é o que
// resolveu o ramo ambíguo de M12 por medição em vez de dedução.
'use strict';
const fs = require('fs');
const vm = require('vm');
const path = require('path');

const SRC = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
let bad = 0;
const ok = (nome, cond, det) => { if (cond) return; bad++; console.log('  ✗ ' + nome + (det ? ' — ' + det : '')); };

const i0 = SRC.indexOf('function sophiaM12(');
const i1 = SRC.indexOf('var CALCS=[');
if (i0 < 0 || i1 < 0 || i1 < i0) { console.log('  ✗ não achei o bloco do SOPHIA antes de CALCS'); process.exit(1); }
const ctx = { console };
vm.createContext(ctx);
// `esc` vem junto porque o gráfico escapa o texto do tooltip com ela.
const iEsc = SRC.indexOf('function esc(');
vm.runInContext(SRC.slice(iEsc, SRC.indexOf('\nfunction ', iEsc + 1)) + '\n' + SRC.slice(i0, i1), ctx);

// Recorta também a entrada de CALCS, para conferir o que vai à tela.
const iC = SRC.indexOf("{id:'sophia',name:");
const iN = SRC.indexOf("\n  {id:'", iC + 5);
vm.runInContext('var C=' + SRC.slice(iC, iN).replace(/,\s*$/, '') + ';', ctx);
const C = ctx.C;

const RYGB = 0, SG = 1, AGB = 2, NG = 0, IGT = 1, T2D = 2;
const p = (o) => Object.assign({ interv: RYGB, idade: 40, altura: 170, dm: NG, dmDur: 0, fumo: false }, o);
const m24 = (o) => ctx.sophiaM24(p(o)).twl;
const m60 = (o) => ctx.sophiaM60(p(o)).twl;
const perto = (a, b) => Math.abs(a - b) < 1e-9;

// ---- 1. M24: as 7 folhas da figura, uma por uma ----------------------------
// Figura 3C: 0.16 (n=146) · 0.19 (n=42) · 0.29 (n=80) · 0.27 (n=140) · 0.33 (n=71)
//            · 0.32 (n=68) · 0.38 (n=208)  → soma 755 = n da raiz
{
  const folhas = [
    ['banda', { interv: AGB }, 0.16, 146],
    ['sleeve, idade > 51', { interv: SG, idade: 60 }, 0.19, 42],
    ['sleeve, idade < 51', { interv: SG, idade: 40 }, 0.29, 80],
    ['bypass, T2D duração > 2,5a', { dm: T2D, dmDur: 10 }, 0.27, 140],
    ['bypass, T2D duração < 2,5a', { dm: T2D, dmDur: 1 }, 0.33, 71],
    ['bypass, sem T2D, idade > 49', { dm: NG, idade: 60 }, 0.32, 68],
    ['bypass, sem T2D, idade < 49', { dm: NG, idade: 30 }, 0.38, 208]
  ];
  folhas.forEach(function (f) { ok('M24 ' + f[0] + ' = ' + f[2], perto(m24(f[1]), f[2]), String(m24(f[1]))); });
  ok('M24: os n das folhas somam o n da raiz (755)',
     folhas.reduce(function (a, f) { return a + f[3]; }, 0) === 755);
  // IGT segue o mesmo ramo de "sem diabetes" (a figura rotula "NG or IGT").
  ok('M24 pré-diabetes segue o ramo de NG', perto(m24({ dm: IGT, idade: 30 }), 0.38));
}

// ---- 2. M60: as 8 folhas da figura ------------------------------------------
// Figura 3D: 0.16 (n=72) · 0.22 (n=36) · 0.23 (n=81) · 0.24 (n=104)
//            · 0.24 (n=78) · 0.30 (n=46) · 0.27 (n=42) · 0.33 (n=119) → soma 578
{
  const folhas = [
    ['banda/sleeve, >35a, disglicemia, altura > 161', { interv: SG, idade: 40, dm: T2D, altura: 170 }, 0.16, 72],
    ['banda/sleeve, >35a, disglicemia, altura < 161', { interv: SG, idade: 40, dm: T2D, altura: 155 }, 0.22, 36],
    ['banda/sleeve, >35a, sem diabetes', { interv: SG, idade: 40, dm: NG }, 0.23, 81],
    ['banda/sleeve, <35a', { interv: SG, idade: 30 }, 0.24, 104],
    ['bypass, T2D duração > 2,5a', { dm: T2D, dmDur: 10 }, 0.24, 78],
    ['bypass, T2D duração < 2,5a', { dm: T2D, dmDur: 1 }, 0.30, 46],
    ['bypass, sem T2D, idade > 49', { dm: NG, idade: 60 }, 0.27, 42],
    ['bypass, sem T2D, idade < 49', { dm: NG, idade: 30 }, 0.33, 119]
  ];
  folhas.forEach(function (f) { ok('M60 ' + f[0] + ' = ' + f[2], perto(m60(f[1]), f[2]), String(m60(f[1]))); });
  ok('M60: os n das folhas somam o n da raiz (578)',
     folhas.reduce(function (a, f) { return a + f[3]; }, 0) === 578);
  // ⚠️ Em M60 a BANDA cai no mesmo ramo do SLEEVE — é a única árvore assim.
  ok('M60 banda e sleeve no mesmo ramo', perto(m60({ interv: AGB, idade: 30 }), m60({ interv: SG, idade: 30 })));
  ok('M60 é a única que usa ALTURA',
     !perto(m60({ interv: SG, idade: 40, dm: T2D, altura: 170 }), m60({ interv: SG, idade: 40, dm: T2D, altura: 155 })));
  ok('M24 NÃO usa altura', perto(m24({ altura: 150 }), m24({ altura: 190 })));
}

// ---- 3. ⚠️ OS SEIS VALORES DA TABELA DA FERRAMENTA OFICIAL ----------------
// O professor rodou dois pacientes na ferramenta oficial e mandou a "Tabela de
// valores" — números exatos, não leitura de gráfico. Ambos com 120 kg, 170 cm,
// 30 anos, não fumantes, bypass:
//   sem diabetes  → M12 84 kg / 30% · M24 75 kg / 38% · M60 80 kg / 33%
//   DM2 de 5 anos → M12 84 kg / 30% · M24 87 kg / 27% · M60 91 kg / 24%
// É esta tabela que autoriza publicar M12: os dois casos dão 30%, logo quem NÃO
// tem diabetes cai no mesmo ramo do diabético de curta duração (0,30). A leitura
// alternativa (0,34) daria 79,2 kg e está descartada por medição.
{
  const base = { sph_peso: '120', sph_alt: '170', sph_idade: '30', sph_interv: '0', sph_fumo: '0' };
  const casos = [
    ['sem diabetes', { sph_dm: '0', sph_dmdur: '0' }, [30, 38, 33], [84, 75, 80]],
    ['DM2 de 5 anos', { sph_dm: '2', sph_dmdur: '5' }, [30, 27, 24], [84, 87, 91]]
  ];
  casos.forEach(function (c) {
    const r = ctx.sophiaTrajetoria(Object.assign({}, base, c[1]));
    [['12', 'twl12', 'peso12'], ['24', 'twl24', 'peso24'], ['60', 'twl60', 'peso60']].forEach(function (t, i) {
      ok(c[0] + ': M' + t[0] + ' = ' + c[2][i] + '% de perda', Math.abs(r[t[1]] - c[2][i]) < 1e-9, String(r[t[1]]));
      // A ferramenta arredonda o peso para inteiro; 1 kg de tolerância cobre isso.
      ok(c[0] + ': M' + t[0] + ' = ' + c[3][i] + ' kg', Math.abs(r[t[2]] - c[3][i]) < 1, String(r[t[2]]));
    });
  });
  const r0 = ctx.sophiaTrajetoria(Object.assign({}, base, { sph_dm: '0', sph_dmdur: '0' }));
  // A tabela oficial mostra IMC 25,9 porque calcula sobre o peso JÁ ARREDONDADO
  // (75 kg / 1,70² = 25,95). Aqui o IMC sai do peso exato (74,4 kg → 25,74). A
  // diferença é o arredondamento da tela deles, não divergência de modelo.
  ok('IMC aos 2 anos coerente com a tabela (25,7 vs 25,9 arredondado)', Math.abs(r0.imc24 - 25.9) < 0.3, String(r0.imc24));
  ok('o caminho da árvore é devolvido', r0.caminho24.join(' → ') === 'bypass → sem diabetes → idade < 49 anos', r0.caminho24.join(' → '));
}

// ---- 3b. M12: as 7 folhas da figura (n=948 na raiz) ------------------------
// 0.13 (n=163) · 0.22 (n=80) · 0.28 (n=146) · 0.29 (n=157) · 0.30 (n=129)
// · 0.34 (n=215) · 0.36 (n=58)  → soma 948
{
  const m12 = (o) => ctx.sophiaM12(Object.assign({ interv: RYGB, idade: 40, altura: 170, dm: NG, dmDur: 0, fumo: false }, o)).twl;
  const folhas = [
    ['banda', { interv: AGB }, 0.13, 163],
    ['sleeve, idade > 51', { interv: SG, idade: 60 }, 0.22, 80],
    ['bypass, idade > 51', { idade: 60 }, 0.28, 146],
    ['sleeve, <51, não fumante', { interv: SG }, 0.29, 157],
    ['bypass, <51, não fumante, sem DM2 longo', {}, 0.30, 129],
    ['bypass, <51, não fumante, DM2 > 19 anos', { dm: T2D, dmDur: 25 }, 0.34, 215],
    ['<51, fumante', { fumo: true }, 0.36, 58]
  ];
  folhas.forEach(function (f) { ok('M12 ' + f[0] + ' = ' + f[2], Math.abs(m12(f[1]) - f[2]) < 1e-9, String(m12(f[1]))); });
  ok('M12: os n das folhas somam o n da raiz (948)',
     folhas.reduce(function (a, f) { return a + f[3]; }, 0) === 948);
  // ⚠️ Tabagismo só existe em M12 — e a favor de MAIOR perda no primeiro ano.
  ok('M12 fumante perde mais que não fumante', m12({ fumo: true }) > m12({ fumo: false }));
  ok('M24 ignora tabagismo', Math.abs(m24({}) - ctx.sophiaM24(p({ fumo: true })).twl) < 1e-9);
  ok('M60 ignora tabagismo', Math.abs(m60({}) - ctx.sophiaM60(p({ fumo: true })).twl) < 1e-9);
  // O fumante de mais de 51 anos NÃO passa pelo ramo do tabagismo.
  ok('M12: fumante com > 51 anos segue pelo ramo da idade', Math.abs(m12({ idade: 60, fumo: true }) - 0.28) < 1e-9);
}

// ---- 4. sem os três campos obrigatórios, não há previsão -------------------
[['sph_peso'], ['sph_alt'], ['sph_idade']].forEach(function (falta) {
  const v = { sph_peso: '120', sph_alt: '170', sph_idade: '30', sph_interv: '0', sph_dm: '0', sph_dmdur: '0' };
  delete v[falta[0]];
  ok('sem ' + falta[0] + ' não calcula', ctx.sophiaTrajetoria(v) === null);
  ok('sem ' + falta[0] + ' a interpretação pede o campo', /Preencha/.test(C.interp(NaN, v).t));
});

// ---- 5. ⚠️ M1 E M3 NÃO PODEM APARECER -------------------------------------
// Não foram publicados: o pipeline tem cinco árvores e a figura traz três. Ter
// dois valores da ferramenta oficial (9% e 16% naqueles dois pacientes) não é
// modelo — é dois pontos. Fixá-los como se valessem para sleeve, banda, outras
// idades e outros pesos seria inventar.
{
  ok('não existe função para M1', typeof ctx.sophiaM1 === 'undefined');
  ok('não existe função para M3', typeof ctx.sophiaM3 === 'undefined');
  const v = { sph_peso: '120', sph_alt: '170', sph_idade: '30', sph_interv: '0', sph_fumo: '0', sph_dm: '0', sph_dmdur: '0' };
  const t = C.interp(C.calc(v), v).t;
  ok('a tela não menciona 1 nem 3 meses', t.indexOf('1 mês') < 0 && t.indexOf('3 meses') < 0, t);
  ok('a tela mostra 1, 2 e 5 anos', t.indexOf('1 ano') >= 0 && t.indexOf('2 anos') > 0 && t.indexOf('5 anos') > 0, t);
  ok('a nota avisa que 1 e 3 meses ficaram fora', /NÃO constam do artigo/.test(C.note));
  ok('a nota cita a fonte com volume e páginas', /Lancet Digit Health 2023;5:e692-702/.test(C.note));
  ok('a nota diz que reproduz a ferramenta oficial', /ferramenta oficial/.test(C.note));
}

// ---- 6. gráfico e tabela de valores ---------------------------------------
// ⚠️ O trecho 0→12 do gráfico tem de ser PONTILHADO: as árvores de 1 e 3 meses
// não constam do artigo, e reta cheia ali sugeriria perda linear no primeiro ano.
{
  vm.runInContext([
    SRC.slice(SRC.indexOf('function sophiaGraficoHTML('), SRC.indexOf('function sophiaTrajetoria('))
  ].join('\n'), ctx);
  const v = { sph_peso: '120', sph_alt: '170', sph_idade: '30', sph_interv: '0', sph_fumo: '0', sph_dm: '0', sph_dmdur: '0' };
  const r = ctx.sophiaTrajetoria(v);
  const g = ctx.sophiaGraficoHTML(r, 120);
  ok('o gráfico é SVG', g.indexOf('<svg') === 0 && g.indexOf('</svg>') > 0);
  ok('há um traço pontilhado (trecho não modelado)', /stroke-dasharray="5 4"/.test(g), g.slice(0, 200));
  ok('e um traço cheio no trecho modelado', /stroke-width="2\.4"/.test(g));
  ok('a faixa sombreada marca onde o modelo começa', /<rect x="44"/.test(g));
  ok('os quatro pontos aparecem rotulados com unidade',
     ['120.0 kg', '84.0 kg', '74.4 kg', '80.4 kg'].every(function (t) { return g.indexOf('>' + t + '<') > 0; }), g);
  ok('os marcos de tempo estão no eixo, por extenso',
     ['>pré-op<', '>1 ano<', '>2 anos<', '>5 anos<'].every(function (t) { return g.indexOf(t) > 0; }));
  // ⚠️ As marcas do eixo do peso são REDONDAS (múltiplos de 5). Antes saíam os
  // extremos crus do intervalo — 125/95/66 — que ninguém lê.
  ok('as marcas do eixo do peso são múltiplos de 5',
     (g.match(/fill-opacity="\.55">(\d+)</g) || []).every(function (t) { return Number(t.replace(/\D/g, '')) % 5 === 0; }), g);
  // ⚠️ NÃO pode escalar sem limite: com width:100% e height:auto num viewBox
  // pequeno, o gráfico virava um bloco de mil pixels de altura na tela larga.
  ok('o gráfico tem largura máxima', /max-width:480px/.test(g));

  const t = ctx.sophiaTabelaHTML(r, 120, 170);
  ok('a tabela tem as cinco colunas', ['Peso (kg)', '%PPT', 'IMC', '%PEP'].every(function (h) { return t.indexOf(h) > 0; }));
  ok('a tabela tem as três linhas', ['1 ano', '2 anos', '5 anos'].every(function (h) { return t.indexOf('>' + h + '<') > 0; }));
  // %PEP do 12º mês: (120−84)/(120−72,25) = 75%. É o MESMO valor da tabela oficial,
  // que mostra 75 — o que confirma que a definição de excesso (IMC 25) é a deles.
  ok('%PEP do 1º ano = 75%, igual à tabela oficial', t.indexOf('>75%<') > 0, t);
  ok('a tabela traz os pesos previstos', t.indexOf('>84.0<') > 0 && t.indexOf('>74.4<') > 0 && t.indexOf('>80.4<') > 0);
  // Sem excesso de peso não há %PEP — e a tabela não pode inventar um número.
  const magro = ctx.sophiaTabelaHTML(ctx.sophiaTrajetoria(Object.assign({}, v, { sph_peso: '70' })), 70, 170);
  ok('sem excesso de peso o %PEP sai como travessão', magro.indexOf('>—<') > 0, magro);
  // A calculadora precisa expor o `extra`, senão nada disso chega à tela.
  ok('a entrada de CALCS expõe o extra', typeof C.extra === 'function');
  const ex = C.extra(C.calc(v), v);
  ok('o extra traz gráfico e tabela', ex.indexOf('<svg') > 0 && ex.indexOf('%PEP') > 0);
  ok('o extra explica o pontilhado', /pontilhado/.test(ex));

  // ---- faixa interquartil --------------------------------------------------
  // ⚠️ É a MESMA GRANDEZA que a ferramenta oficial sombreia (IQR do erro), mas
  // obtida por aproximação normal a partir do DESVIO publicado por operação e
  // tempo (Tabela 3) — os percentis empíricos não constam do artigo. Se alguém
  // trocar por outra medida de erro (ex.: os limites de Bland-Altman, ±1,96 DP),
  // a faixa quadruplica de largura, engole o gráfico e deixa de corresponder à
  // faixa da ferramenta. É isso que estas asserções travam.
  ok('o desvio usado é o do BYPASS por tempo (3,2 / 3,9 / 4,5)',
     r.faixa12.dp === 3.2 && r.faixa24.dp === 3.9 && r.faixa60.dp === 4.5,
     [r.faixa12.dp, r.faixa24.dp, r.faixa60.dp].join('/'));
  // 0,6745 × 3,9 × 1,70² = 7,60 kg em torno de 74,4.
  ok('faixa de 2 anos = 66,8–82,0 kg', Math.abs(r.faixa24.lo - 66.8) < 0.1 && Math.abs(r.faixa24.hi - 82.0) < 0.1,
     r.faixa24.lo.toFixed(1) + '–' + r.faixa24.hi.toFixed(1));
  // A largura tem de bater com a da ferramenta oficial (~16 kg aos 2 anos).
  ok('a largura aos 2 anos fica entre 14 e 17 kg', (r.faixa24.hi - r.faixa24.lo) > 14 && (r.faixa24.hi - r.faixa24.lo) < 17,
     (r.faixa24.hi - r.faixa24.lo).toFixed(1));
  ok('a faixa alarga com o tempo',
     (r.faixa60.hi - r.faixa60.lo) > (r.faixa24.hi - r.faixa24.lo) && (r.faixa24.hi - r.faixa24.lo) > (r.faixa12.hi - r.faixa12.lo));
  // O sleeve tem desvio maior que o bypass em todos os tempos — a faixa acompanha.
  {
    const sl = ctx.sophiaTrajetoria(Object.assign({}, v, { sph_interv: '1' }));
    ok('o desvio do sleeve é o dele, não o do bypass', sl.faixa24.dp === 4.8, String(sl.faixa24.dp));
    ok('faixa do sleeve mais larga que a do bypass aos 2 anos',
       (sl.faixa24.hi - sl.faixa24.lo) > (r.faixa24.hi - r.faixa24.lo));
  }
  ok('a faixa nunca fica negativa', ctx.sophiaTrajetoria(Object.assign({}, v, { sph_peso: '60' })).faixa60.lo >= 0);
  ok('o gráfico desenha a área', /fill="#60a5fa" fill-opacity="\.14"/.test(g), g.slice(0, 300));
  // ⚠️ A área NÃO pode começar no pré-op: ali não há modelo nem incerteza.
  ok('a área começa em 1 ano, não no pré-op',
     (function(){ const m = g.match(/<path d="M([\d.]+) /); return m && Math.abs(Number(m[1]) - 128) < 1; })(), g.slice(0, 400));
  ok('cada ponto do modelo tem tooltip com peso e faixa',
     (g.match(/<title>/g) || []).length >= 4 && /faixa provável 66\.8–82\.0 kg/.test(g), g);
  ok('o pré-op não promete faixa', /pré-op: 120\.0 kg \(peso informado\)/.test(g));
  ok('a tabela tem a coluna da faixa', t.indexOf('Faixa (kg)') > 0);
  ok('a tabela mostra a faixa calculada', t.indexOf('66.8–82.0') > 0, t);
  ok('a legenda diz que é interquartil e como foi obtida',
     /faixa interquartil/.test(ex) && /Tabela 3/.test(ex) && /aproximação normal/.test(ex));
  ok('a legenda declara a diferença em relação à ferramenta oficial', /simétrica em torno da previsão/.test(ex));
}

console.log(bad ? '\nFALHOU: ' + bad : '\n✓ SOPHIA: 22 folhas, n fechando (948/755/578), 6 valores da tabela oficial, gráfico com trecho não modelado pontilhado, M1/M3 fora');
process.exit(bad ? 1 : 0);
