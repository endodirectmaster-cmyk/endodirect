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
//     raiz (755 em M24, 578 em M60). É o que provou que a estrutura estava lida
//     certa antes de qualquer código.
//
// E o caso de referência: 120 kg, 170 cm, 30 anos, sem diabetes, bypass — o
// mesmo que o professor rodou na ferramenta oficial, cujo gráfico mostra nadir
// em ~74 kg e ~80 kg aos 5 anos.
'use strict';
const fs = require('fs');
const vm = require('vm');
const path = require('path');

const SRC = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
let bad = 0;
const ok = (nome, cond, det) => { if (cond) return; bad++; console.log('  ✗ ' + nome + (det ? ' — ' + det : '')); };

const i0 = SRC.indexOf('var SOPHIA_INTERV=');
const i1 = SRC.indexOf('var CALCS=[');
if (i0 < 0 || i1 < 0 || i1 < i0) { console.log('  ✗ não achei o bloco do SOPHIA antes de CALCS'); process.exit(1); }
const ctx = { console };
vm.createContext(ctx);
vm.runInContext(SRC.slice(i0, i1), ctx);

// Recorta também a entrada de CALCS, para conferir o que vai à tela.
const iC = SRC.indexOf("{id:'sophia',name:");
const iN = SRC.indexOf("\n  {id:'", iC + 5);
vm.runInContext('var C=' + SRC.slice(iC, iN).replace(/,\s*$/, '') + ';', ctx);
const C = ctx.C;

const RYGB = 0, SG = 1, AGB = 2, NG = 0, IGT = 1, T2D = 2;
const p = (o) => Object.assign({ interv: RYGB, idade: 40, altura: 170, dm: NG, dmDur: 0 }, o);
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

// ---- 3. ⚠️ O CASO CONFERIDO NA FERRAMENTA OFICIAL --------------------------
// 120 kg, 170 cm, 30 anos, sem diabetes, bypass. Gráfico oficial: nadir ~74 kg,
// ~80 kg aos 5 anos.
{
  const v = { sph_peso: '120', sph_alt: '170', sph_idade: '30', sph_interv: '0', sph_dm: '0', sph_dmdur: '0' };
  const r = ctx.sophiaTrajetoria(v);
  ok('caso de referência: 38% de perda aos 2 anos', Math.abs(r.twl24 - 38) < 1e-9, String(r.twl24));
  ok('caso de referência: 74,4 kg aos 2 anos', Math.abs(r.peso24 - 74.4) < 0.05, String(r.peso24));
  ok('caso de referência: 80,4 kg aos 5 anos', Math.abs(r.peso60 - 80.4) < 0.05, String(r.peso60));
  ok('caso de referência: IMC 25,7 aos 2 anos', Math.abs(r.imc24 - 25.74) < 0.05, String(r.imc24));
  ok('o caminho da árvore é devolvido', r.caminho24.join(' → ') === 'bypass → sem diabetes → idade < 49 anos', r.caminho24.join(' → '));
}

// ---- 4. sem os três campos obrigatórios, não há previsão -------------------
[['sph_peso'], ['sph_alt'], ['sph_idade']].forEach(function (falta) {
  const v = { sph_peso: '120', sph_alt: '170', sph_idade: '30', sph_interv: '0', sph_dm: '0', sph_dmdur: '0' };
  delete v[falta[0]];
  ok('sem ' + falta[0] + ' não calcula', ctx.sophiaTrajetoria(v) === null);
  ok('sem ' + falta[0] + ' a interpretação pede o campo', /Preencha/.test(C.interp(NaN, v).t));
});

// ---- 5. ⚠️ M12, M1 E M3 NÃO PODEM APARECER --------------------------------
// M1 e M3 não foram publicados; no M12 o ramo de duração do DM2 é ambíguo para
// quem não tem diabetes (0,30 vs 0,34 = 5 kg num paciente de 120 kg). Publicar
// qualquer um dos três seria número inventado com cara de previsão validada.
{
  ok('não existe função para M12', typeof ctx.sophiaM12 === 'undefined');
  const v = { sph_peso: '120', sph_alt: '170', sph_idade: '30', sph_interv: '0', sph_dm: '0', sph_dmdur: '0' };
  const t = C.interp(C.calc(v), v).t;
  ok('a tela não menciona 12 meses', t.indexOf('12 mes') < 0 && t.indexOf('1 ano') < 0, t);
  ok('a tela mostra só 2 e 5 anos', t.indexOf('2 anos') >= 0 && t.indexOf('5 anos') > 0, t);
  ok('a nota avisa que 1, 3 e 12 meses ficaram fora', /NÃO foram publicados/.test(C.note) && /ambígua/.test(C.note));
  ok('a nota cita a fonte com volume e páginas', /Lancet Digit Health 2023;5:e692-702/.test(C.note));
}

console.log(bad ? '\nFALHOU: ' + bad : '\n✓ SOPHIA: 15 folhas conferidas, n fechando com a raiz (755 e 578), caso da ferramenta oficial batendo, M1/M3/M12 fora');
process.exit(bad ? 1 : 0);
