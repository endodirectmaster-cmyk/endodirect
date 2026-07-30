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

// ---- 5. ⚠️ M1 E M3 SÃO PROPORÇÃO, NUNCA ÁRVORE NEM VALOR FIXO ---------------
// Mudança de 30/07, a pedido do professor: os meses 1 e 3 passaram a ser
// projetados. Continua valendo que as árvores desses tempos NÃO foram publicadas
// (o pipeline tem cinco, a figura traz três), e é isso que este bloco protege.
//
// Os dois defeitos que ele existe para pegar:
//  1. alguém inventar `sophiaM1`/`sophiaM3` como se houvesse árvore;
//  2. alguém fixar 9% e 16% — os valores que a ferramenta oficial mostra NAQUELE
//     paciente. Fixados, valeriam igual para banda e bypass, e numa banda com 16%
//     de perda em 1 ano o mês 3 empataria com o ano inteiro. Por isso a perda
//     precoce é FRAÇÃO da perda de 12 meses: escala com a operação.
{
  ok('não existe função para M1', typeof ctx.sophiaM1 === 'undefined');
  ok('não existe função para M3', typeof ctx.sophiaM3 === 'undefined');
  const v = { sph_peso: '120', sph_alt: '170', sph_idade: '30', sph_interv: '0', sph_fumo: '0', sph_dm: '0', sph_dmdur: '0' };
  const t = C.interp(C.calc(v), v).t;
  ok('a tela mostra 1, 2 e 5 anos', t.indexOf('1 ano') >= 0 && t.indexOf('2 anos') > 0 && t.indexOf('5 anos') > 0, t);
  ok('a nota avisa que as árvores de 1 e 3 meses não existem', /NÃO constam do artigo/.test(C.note));
  ok('a nota diz que os dois tempos são estimados', /estimados como fração da perda de 1 ano/.test(C.note));
  ok('a nota cita a fonte com volume e páginas', /Lancet Digit Health 2023;5:e692-702/.test(C.note));
  ok('a nota diz que reproduz a ferramenta oficial', /ferramenta oficial/.test(C.note));

  // ⚠️ AS SEIS CÉLULAS DOS MESES 1 E 3 BATEM COM A TABELA OFICIAL.
  // Caso de referência (120 kg, 1,70 m, 30 anos, não fumante, bypass, sem DM):
  //   mês 1 → 110 kg · 9% · IMC 37,9 · PEP 22      mês 3 → 100 kg · 16% · IMC 34,7 · PEP 41
  // (o peso e o IMC da tela deles são arredondados; aqui a conferência é contra o
  // valor recuperado da coluna do IMC, que tem dois algarismos a mais)
  const r1 = ctx.sophiaTrajetoria(v);
  ok('mês 1 = 109,5 kg', Math.abs(r1.peso1 - 109.5) < 0.15, r1.peso1.toFixed(2));
  ok('mês 3 = 100,2 kg', Math.abs(r1.peso3 - 100.2) < 0.15, r1.peso3.toFixed(2));
  ok('IMC do mês 1 = 37,9 (igual ao oficial)', r1.imc1.toFixed(1) === '37.9', r1.imc1.toFixed(2));
  ok('IMC do mês 3 = 34,7 (igual ao oficial)', r1.imc3.toFixed(1) === '34.7', r1.imc3.toFixed(2));
  ok('%PPT do mês 1 arredonda para 9 (igual ao oficial)', r1.twl1.toFixed(0) === '9', r1.twl1.toFixed(2));
  ok('%PPT do mês 3 arredonda para 16 (igual ao oficial)', r1.twl3.toFixed(0) === '16', r1.twl3.toFixed(2));

  // ⚠️ AS TRÊS FRAÇÕES FORAM MEDIDAS — NENHUMA É DEDUZIDA DE OUTRA.
  // A primeira versão usava a do bypass para tudo; a segunda mediu a banda e
  // deixou o sleeve herdando o bypass ("operação mais próxima em mecanismo").
  // As duas suposições caíram na medição:
  //   bypass 0,291 / 0,549   sleeve 0,276 / 0,568   banda 0,384 / 0,602
  // O sleeve fica ABAIXO do bypass no mês 1 e ACIMA no mês 3 — não é
  // intermediário entre bypass e banda nem versão escalada de nenhum dos dois.
  // Não havia como deduzir estes dois números; herdar errava ~0,2 de IMC nos dois
  // tempos. Quem "simplificar" isso de volta para uma constante quebra tudo.
  {
    const sleeve = ctx.sophiaTrajetoria(Object.assign({}, v, { sph_interv: '1' }));
    ok('sleeve, mês 1, bate com a tabela oficial (110 kg · 8% · IMC 38,2)',
       sleeve.peso1.toFixed(0) === '110' && sleeve.twl1.toFixed(0) === '8' && sleeve.imc1.toFixed(1) === '38.2',
       sleeve.peso1.toFixed(2) + ' / ' + sleeve.twl1.toFixed(2) + '% / ' + sleeve.imc1.toFixed(2));
    ok('sleeve, mês 3, bate com a tabela oficial (100 kg · 16% · IMC 34,7)',
       sleeve.peso3.toFixed(0) === '100' && sleeve.twl3.toFixed(0) === '16' && sleeve.imc3.toFixed(1) === '34.7',
       sleeve.peso3.toFixed(2) + ' / ' + sleeve.twl3.toFixed(2) + '% / ' + sleeve.imc3.toFixed(2));
    // ⚠️ A ordem entre as operações INVERTE do mês 1 para o mês 3. É isso que
    // torna a herança impossível — e a asserção que pega quem tentar restaurá-la.
    ok('no mês 1 o sleeve perde fração MENOR que o bypass', sleeve.twl1 / sleeve.twl12 < r1.twl1 / r1.twl12,
       (sleeve.twl1 / sleeve.twl12).toFixed(4) + ' vs ' + (r1.twl1 / r1.twl12).toFixed(4));
    ok('no mês 3 o sleeve perde fração MAIOR que o bypass', sleeve.twl3 / sleeve.twl12 > r1.twl3 / r1.twl12,
       (sleeve.twl3 / sleeve.twl12).toFixed(4) + ' vs ' + (r1.twl3 / r1.twl12).toFixed(4));
    // ⚠️ ÁRVORES DE 12 E 24 MESES DO SLEEVE: conferidas contra a tabela oficial
    // pela primeira vez em 30/07. As duas caem em 85 kg / IMC 29,5 — o sleeve é a
    // única operação em que o nadir não desce entre 1 e 2 anos.
    ok('árvore de 12 meses do sleeve = 85 kg (IMC 29,5)', sleeve.imc12.toFixed(1) === '29.5', sleeve.peso12.toFixed(2));
    ok('árvore de 24 meses do sleeve = 85 kg (IMC 29,5)', sleeve.imc24.toFixed(1) === '29.5', sleeve.peso24.toFixed(2));
    ok('no sleeve, 12 e 24 meses caem no mesmo peso', Math.abs(sleeve.peso12 - sleeve.peso24) < 0.01);
    // Sleeve e banda dividem a folha de 60 meses (Figura 3D) — os dois devolvem
    // o mesmo peso, e a tabela oficial confirma: 91 kg / IMC 31,4 nas duas.
    ok('sleeve e banda dividem a folha de 60 meses',
       Math.abs(sleeve.peso60 - ctx.sophiaTrajetoria(Object.assign({}, v, { sph_interv: '2' })).peso60) < 0.01);
  }
  const banda = ctx.sophiaTrajetoria(Object.assign({}, v, { sph_interv: '2' }));
  ok('a perda precoce da banda é MENOR em valor absoluto', banda.twl1 < r1.twl1 && banda.twl3 < r1.twl3,
     banda.twl1.toFixed(1) + '/' + banda.twl3.toFixed(1) + ' vs ' + r1.twl1.toFixed(1) + '/' + r1.twl3.toFixed(1));
  ok('mas a FRAÇÃO da perda de 1 ano é MAIOR na banda que no bypass',
     banda.twl1 / banda.twl12 > r1.twl1 / r1.twl12 + 0.05,
     (banda.twl1 / banda.twl12).toFixed(3) + ' vs ' + (r1.twl1 / r1.twl12).toFixed(3));
  // Banda contra a tabela oficial: 114 kg / 5% / IMC 39,4 / PEP 13 no mês 1.
  ok('banda, mês 1, bate com a tabela oficial',
     banda.peso1.toFixed(0) === '114' && banda.twl1.toFixed(0) === '5' && banda.imc1.toFixed(1) === '39.4',
     banda.peso1.toFixed(2) + ' / ' + banda.twl1.toFixed(2) + '% / ' + banda.imc1.toFixed(2));
  // ⚠️ No mês 3 sobra ~0,2 kg contra os 110,4 kg oficiais, e a causa NÃO é a
  // razão: é a folha de 12 meses da banda, que a Figura 3B publica arredondada
  // (0,13 contra 0,133 internos deles). O mesmo desvio já aparece no próprio mês
  // 12 (104,4 contra 104,0). Ajustar a razão para compensar faria os meses 1 e 3
  // baterem enquanto o mês 12, que vem da árvore de verdade, continuaria fora —
  // seria esconder o arredondamento da figura dentro de um parâmetro que tem
  // outro significado. Por isso a tolerância aqui é de 1 kg, e não zero.
  ok('banda, mês 3, dentro de 1 kg do oficial (folha de 12m arredondada na figura)',
     Math.abs(banda.peso3 - 110.4) < 1.0, banda.peso3.toFixed(2));
  ok('a diferença do mês 3 da banda é a MESMA do mês 12 (mesma origem)',
     Math.abs((banda.peso3 - 110.4) - (banda.peso12 - 104.04) * (0.6016)) < 0.05,
     (banda.peso3 - 110.4).toFixed(3) + ' vs ' + ((banda.peso12 - 104.04) * 0.6016).toFixed(3));

  // ⚠️ TODO RESÍDUO CONTRA A FERRAMENTA OFICIAL CABE NO ARREDONDAMENTO DA FIGURA.
  // As folhas da Figura 3 são impressas com 2 casas, então a folha interna deles
  // pode estar até 0,50 pp longe da que transcrevi. Recuperando a folha interna
  // pelo IMC oficial de cada tempo em que divergimos, a MAIOR diferença é 0,38 pp
  // — ou seja, nenhuma divergência exige explicação além do arredondamento, e
  // nenhuma é erro de transcrição. Esta asserção é a que denuncia se uma folha
  // for transcrita errada no futuro: erro de leitura de ramo dá diferença de
  // vários pontos percentuais, não de décimos.
  [['0', 24, 25.9, 0.38], ['0', 60, 27.7, 0.33],
   ['1', 60, 31.4, 0.24],
   ['2', 12, 36.0, 0.13], ['2', 24, 35.0, 0.16], ['2', 60, 31.4, 0.24]
  ].forEach(function (c) {
    const interna = (120 - c[2] * 1.7 * 1.7) / 120;
    ok('folha ' + c[1] + 'm da operação ' + c[0] + ': figura e ferramenta a menos de 0,5 pp',
       Math.abs(interna - c[3]) < 0.005, ((interna - c[3]) * 100).toFixed(2) + ' pp');
  });
  // Ordem cronológica: nenhum tempo precoce pode passar do seguinte.
  [r1, banda, ctx.sophiaTrajetoria(Object.assign({}, v, { sph_interv: '1' }))].forEach(function (x, i) {
    ok('perda cresce de 1 mês → 3 meses → 1 ano (operação ' + i + ')', x.twl1 < x.twl3 && x.twl3 < x.twl12,
       [x.twl1, x.twl3, x.twl12].map(function (n) { return n.toFixed(1); }).join('/'));
  });

  // A tabela traz os dois tempos novos, marcados como aproximação e SEM faixa —
  // não há desvio publicado para eles, então prometer faixa ali seria inventar.
  const tb = ctx.sophiaTabelaHTML(r1, 120, 170);
  ok('a tabela tem as cinco linhas', ['1 mês', '3 meses', '1 ano', '2 anos', '5 anos'].every(function (h) { return tb.indexOf('>' + h) > 0; }), tb);
  ok('os tempos precoces vêm marcados como aproximação', (tb.match(/\(aprox\.\)/g) || []).length === 2, tb);
  ok('a tabela reproduz o IMC oficial dos dois tempos', tb.indexOf('>37.9<') > 0 && tb.indexOf('>34.7<') > 0, tb);
  ok('a tabela reproduz o %PEP oficial dos dois tempos', tb.indexOf('>22%<') > 0 && tb.indexOf('>41%<') > 0, tb);
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
  // ---- tooltip e forma da curva ---------------------------------------------
  // ⚠️ O TOOLTIP NÃO PODE VOLTAR A SER <title>. O <title> de SVG só abre com o
  // mouse parado por ~1s: no clique e no toque não acontece nada — foi o que o
  // professor relatou em 30/07 ("não está aparecendo esses pontos quando clica
  // em cima"). O <g tabindex="0"> com caixa em :hover/:focus atende os três
  // gestos. Se alguém "simplificar" de volta para <title>, o toque quebra outra
  // vez e ninguém percebe, porque no desktop com mouse continua funcionando.
  ok('cada ponto é um grupo focável, não um <title>',
     (g.match(/<g class="sph-pt" tabindex="0"/g) || []).length === 6 && g.indexOf('<title>') < 0, g);
  ok('o tooltip traz peso e faixa', /<g class="sph-tip">/.test(g) && /faixa 66\.8–82\.0 kg/.test(g), g);
  ok('o ponto tem alvo de toque maior que o círculo desenhado', /r="16" fill="transparent"/.test(g));
  ok('o tooltip também é lido por leitor de tela', /aria-label="1 ano: 84\.0 kg · faixa/.test(g), g);
  ok('o pré-op não promete faixa', g.indexOf('>pré-op: 120.0 kg<') > 0 && g.indexOf('>peso informado<') > 0, g);
  // ⚠️ OS DOIS TRAÇOS SÃO UMA CURVA SÓ, PARTIDA NO MÊS 12. Pontilhado até lá
  // (pré-op medido + os dois meses aproximados), cheio dali em diante (as três
  // árvores). Se alguém calcular cada traço sobre a sua própria lista de pontos,
  // as tangentes deixam de bater e aparece um bico na emenda — o defeito é sutil
  // no desenho e invisível em qualquer asserção que só conte comandos "C".
  {
    const pontilhado = g.match(/<path d="([^"]+)"[^>]*stroke-dasharray/);
    ok('o trecho aproximado é curva, não reta', !!pontilhado && (pontilhado[1].match(/C/g) || []).length === 3, pontilhado && pontilhado[1]);
    const modelado = g.match(/<path d="([^"]+)"[^>]*stroke-width="2\.4"/);
    ok('o trecho das árvores é curva suave (Bézier)', !!modelado && (modelado[1].match(/C/g) || []).length === 2, modelado && modelado[1]);
    ok('o traço cheio começa exatamente onde o pontilhado termina',
       (function () {
         if (!pontilhado || !modelado) return false;
         const fim = pontilhado[1].split('C').pop().split(',').pop().trim();
         const ini = modelado[1].slice(1).split(' C')[0].trim();
         return fim === ini;
       })(), pontilhado && modelado && (pontilhado[1] + ' || ' + modelado[1]));
    // Continuidade de tangente na emenda: o último ponto de controle do trecho
    // pontilhado e o primeiro do trecho cheio têm de ser colineares com o mês 12.
    ok('não há bico no mês 12 (tangentes batem)',
       (function () {
         const c2 = pontilhado[1].split('C').pop().split(',');            // ...,c2x c2y,px py
         const a = c2[1].trim().split(' ').map(Number);                    // controle que CHEGA
         const j = c2[2].trim().split(' ').map(Number);                    // o mês 12
         const b = modelado[1].split('C')[1].split(',')[0].trim().split(' ').map(Number); // controle que SAI
         const cross = (j[0] - a[0]) * (b[1] - j[1]) - (j[1] - a[1]) * (b[0] - j[0]);
         return Math.abs(cross) < 0.5;
       })(), modelado && modelado[1]);
    const area = g.match(/<path d="([^"]+)"[^>]*fill-opacity="\.14"/);
    ok('a área acompanha a mesma curva, sem bicos', !!area && (area[1].match(/C/g) || []).length >= 4, area && area[1]);
  }

  // ---- os dois marcos precoces no desenho -----------------------------------
  // ⚠️ Eles NÃO podem ganhar rótulo impresso: a 14 px um do outro, dois textos de
  // ~45 px se sobrepõem e ilegibilizam os dois. O número sai no toque e na tabela.
  // ⚠️ Conta pela opacidade do rótulo impresso, NÃO por " kg</text>": a primeira
  // linha de cada tooltip também termina em " kg</text>" e a contagem daria 10.
  ok('só quatro pontos têm rótulo impresso', (g.match(/fill-opacity="\.9">/g) || []).length === 4, g);
  ok('os meses 1 e 3 têm marca curta no eixo', g.indexOf('>1m<') > 0 && g.indexOf('>3m<') > 0, g);
  ok('a marca curta vai numa segunda altura', /y="222"[^>]*>1m</.test(g) || /y="222"[^>]*>3m</.test(g), g);
  ok('o ponto aproximado é vazado, o da árvore é cheio',
     (g.match(/fill="var\(--surface\)" stroke="#60a5fa"/g) || []).length === 3
     && (g.match(/fill="#60a5fa" stroke="var\(--surface\)"/g) || []).length === 3, g);
  ok('o toque nos meses precoces diz que é estimativa', (g.match(/>estimativa aproximada</g) || []).length === 2, g);
  ok('o pré-op continua dizendo que é peso informado', g.indexOf('>peso informado<') > 0);
  // O peso sai no toque (não há rótulo impresso) e o rótulo acessível do ponto
  // não pode prometer faixa — não há desvio publicado para 1 e 3 meses.
  ok('o peso do mês 1 sai no toque', g.indexOf('1 mês: 109.5 kg') > 0, g);
  ok('nenhum mês precoce promete faixa',
     (g.match(/aria-label="(1 mês|3 meses)[^"]*"/g) || []).every(function (a) { return a.indexOf('faixa') < 0; }), g);
  ok('a tabela tem a coluna da faixa', t.indexOf('Faixa (kg)') > 0);
  ok('a tabela mostra a faixa calculada', t.indexOf('66.8–82.0') > 0, t);
  ok('a legenda diz que é interquartil e como foi obtida',
     /faixa interquartil/.test(ex) && /Tabela 3/.test(ex) && /aproximação normal/.test(ex));
  ok('a legenda declara a diferença em relação à ferramenta oficial', /simétrica em torno da previsão/.test(ex));
}

console.log(bad ? '\nFALHOU: ' + bad : '\n✓ SOPHIA: 22 folhas, n fechando (948/755/578), 10 valores da tabela oficial (M1/M3 por proporção, M12/M24/M60 por árvore), curva sem bico na emenda');
process.exit(bad ? 1 : 0);
