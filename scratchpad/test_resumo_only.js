// RESUMOS_ONLY_SUBS: 'Endocrinologia Básica' some das DIRETRIZES e continua nos RESUMOS.
//
// O defeito que este teste existe para pegar NÃO é "esqueci de filtrar" — é
// "filtrei sem olhar o modo". Diretrizes e Resumos compartilham DIR_SUBS e
// dirSubList(); um filtro incondicional em qualquer um dos 3 pontos esconderia a
// subespecialidade dos Resumos também, que é o contrário do que foi pedido.
// Por isso cada asserção exige a guarda de modo, não só a presença do filtro.
'use strict';
const fs = require('fs');
const SRC = fs.readFileSync('/home/user/endodirect/index.html', 'utf8');

let bad = 0;
const ok = (nome, cond, detalhe) => {
  if (cond) return;
  bad++;
  console.log('  ✗ ' + nome + (detalhe ? ' — ' + detalhe : ''));
};

// ---- 1. a constante existe e contém a subespecialidade -----------------------
const mConst = SRC.match(/var RESUMOS_ONLY_SUBS=(\[[^\]]*\]);/);
ok('constante RESUMOS_ONLY_SUBS declarada', !!mConst);
const lista = mConst ? JSON.parse(mConst[1].replace(/'/g, '"')) : [];
ok('inclui Endocrinologia Básica', lista.indexOf('Endocrinologia Básica') >= 0,
   'lista: ' + JSON.stringify(lista));

// ---- 2. os 3 pontos de corte, cada um com guarda de modo ---------------------
// Cada entrada: [nome, regex do filtro, regex da guarda que DEVE estar dentro dele]
const PONTOS = [
  ['grade do aluno (Diretrizes vs Resumos)',
   /\.filter\(function\(s\)\{return refPrivadoMode\|\|RESUMOS_ONLY_SUBS\.indexOf\(s\.sub\)<0;\}\)/],
  ['grade do painel do admin',
   /\.filter\(function\(s\)\{return admRefMode==='res'\|\|RESUMOS_ONLY_SUBS\.indexOf\(s\.sub\)<0;\}\)/],
  ['select de subespecialidade do formulário do admin',
   /DIR_SUBS\.filter\(function\(x\)\{return admRefMode==='res'\|\|RESUMOS_ONLY_SUBS\.indexOf\(x\)<0;\}\)/]
];
PONTOS.forEach(([nome, re]) => ok(nome + ': filtra COM guarda de modo', re.test(SRC)));

// ---- 3. TODO uso é de um dos dois cortes conhecidos -------------------------
// Guarda-chuva: pega um 4º ponto acrescentado no futuro sem guarda nenhuma,
// que esconderia a subespecialidade dos Resumos também.
// São dois cortes legítimos, e só dois:
//   • por CONTAGEM, dentro de dirSubList  → `…indexOf(o.sub)>=0&&o.count===0`
//   • por MODO, nos pontos de renderização → `refPrivadoMode||…` / `admRefMode==='res'||…`
const usos = SRC.match(/[^\n]*RESUMOS_ONLY_SUBS\.indexOf[^\n]*/g) || [];
ok('há 4 pontos de uso (1 por contagem + 3 por modo)', usos.length === 4, 'achei ' + usos.length);
let porContagem = 0, porModo = 0;
usos.forEach((linha, i) => {
  const trechos = linha.split('RESUMOS_ONLY_SUBS.indexOf');
  for (let k = 1; k < trechos.length; k++) {
    const antes = trechos[k - 1].slice(-90), depois = trechos[k].slice(0, 40);
    if (/\(o\.sub\)>=0&&o\.count===0/.test(depois)) { porContagem++; continue; }
    if (/(refPrivadoMode|admRefMode==='res')\s*\|\|\s*$/.test(antes)) { porModo++; continue; }
    ok('uso ' + (i + 1) + ' é um dos dois cortes conhecidos', false,
       'nem contagem nem modo — contexto: …' + antes.slice(-55) + '⟨aqui⟩' + depois.slice(0, 25));
  }
});
ok('exatamente 1 corte por contagem', porContagem === 1, 'achei ' + porContagem);
ok('exatamente 3 cortes por modo', porModo === 3, 'achei ' + porModo);

// ---- 4. a exceção da HbA1c está nos DOIS prompts ----------------------------
const regraVR = /valores de referência \(ex\.: FSH 2,1 mUI\/mL \[VR 3,5–12,5\]\)/g;
const comExcecao = /EXCEÇÃO: a hemoglobina glicada \(HbA1c\) NÃO leva valor de referência — cite só o valor \(ex\.: HbA1c 8,2%\)/g;
const nVR = (SRC.match(regraVR) || []).length;
const nExc = (SRC.match(comExcecao) || []).length;
ok('todo prompt que pede VR inline tem a exceção da HbA1c', nVR === nExc && nExc >= 2,
   nVR + ' prompt(s) com regra de VR, ' + nExc + ' com a exceção');

// ---- 5. a exceção vem DEPOIS da regra geral, no mesmo prompt ----------------
// Se viesse antes, a regra geral a sobrescreveria na leitura do modelo.
let ordemOk = true;
SRC.split('authoringSys(').forEach((bloco) => {
  const iVR = bloco.search(regraVR);
  const iEx = bloco.search(comExcecao);
  if (iVR >= 0 && iEx >= 0 && iEx < iVR) ordemOk = false;
});
ok('a exceção aparece depois da regra geral em cada prompt', ordemOk);

// ---- 6. COMPORTAMENTO, não só texto ----------------------------------------
// As regex acima provam o que está escrito. Isto executa o predicado de cada
// ponto de corte com os dois modos e confere quem sobra.
const AMOSTRA = [{ sub: 'Endocrinologia Básica' }, { sub: 'Diabetes' }, { sub: 'Tireoide' }];
[['refPrivadoMode', 's', 's.sub'], ["admRefMode==='res'", 's', 's.sub'], ["admRefMode==='res'", 'x', 'x']]
  .forEach(([guarda, arg, acesso], i) => {
    const pred = new Function('RESUMOS_ONLY_SUBS', 'refPrivadoMode', 'admRefMode', arg,
      'return ' + guarda + '||RESUMOS_ONLY_SUBS.indexOf(' + acesso + ')<0;');
    const roda = (modoResumo) => AMOSTRA
      .filter((s) => pred(lista, modoResumo, modoResumo ? 'res' : 'dir', acesso === 'x' ? s.sub : s))
      .map((s) => s.sub);
    const emDiretrizes = roda(false), emResumos = roda(true);
    ok('ponto ' + (i + 1) + ': Endocrinologia Básica FORA das Diretrizes',
       emDiretrizes.indexOf('Endocrinologia Básica') < 0, JSON.stringify(emDiretrizes));
    ok('ponto ' + (i + 1) + ': Endocrinologia Básica DENTRO dos Resumos',
       emResumos.indexOf('Endocrinologia Básica') >= 0, JSON.stringify(emResumos));
    ok('ponto ' + (i + 1) + ': as demais não são afetadas',
       emDiretrizes.join() === 'Diabetes,Tireoide' && emResumos.length === 3,
       JSON.stringify({ emDiretrizes, emResumos }));
  });

console.log(bad ? '\nFALHOU: ' + bad : '\n✓ RESUMOS_ONLY_SUBS e exceção da HbA1c conferidos');
process.exit(bad ? 1 : 0);
