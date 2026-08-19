#!/usr/bin/env node
/* Hipoglicemia virou subespecialidade própria — e isso mexe no roteamento de todos.
 *
 * POR QUE ISTO EXISTE (19/08/2026). O compêndio da ADA 2026 sobre hipoglicemia
 * (172 fatos, ~64k) não cabia em Diabetes: a área estava em 370.219 de 400.000,
 * e 400k é o `TETO_MAXIMO`. A saída documentada em lib/clinical-deep.js é
 * DIVIDIR a subespecialidade, e aqui a divisão é honesta porque a palavra
 * "hipoglicemia" ROTEIA sozinha — ao contrário de "criança + obesidade", que é
 * co-ocorrência e o roteador só sabe casar substring.
 *
 * ⚠️ MAS A PALAVRA APARECE EM TODO LUGAR: medido no corpus, "hipoglicemia" tem
 * 88 ocorrências em Diabetes, 76 em Endocrinologia do Esporte, 49 em Obesidade e
 * 13 em Adrenal. Criar a área sem medir seria trocar um problema de teto por um
 * problema de resposta errada. Este guarda fixa as duas pontas: o que a área NOVA
 * tem de receber, e o que ela NÃO pode roubar.
 *
 * ⚠️ O QUE A VARREDURA DIFERENCIAL PEGOU, e teria passado despercebido: criar a
 * área quebrou a PROMOÇÃO CONDICIONAL DO ESPORTE. A pergunta "hipoglicemia no
 * exercício aeróbico prolongado no DM1" passou a casar TRÊS áreas em vez de duas,
 * e as duas condições da regra (`ordem.length === 2` e topo igual a Diabetes)
 * falharam juntas — a pergunta perdeu o consenso de exercício no DM1, que é o
 * assunto exato dela. Consertado tratando Hipoglicemia como parte do mesmo
 * aglomerado do diabetes, não como uma terceira doença.
 *
 * Uso:  node scripts/test-hipoglicemia.js
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const deep = require('../lib/clinical-deep');

const RAIZ = path.join(__dirname, '..');
const falhas = [];
const ok = (c, m) => { if (!c) falhas.push(m); };

// ── 1. o compêndio CHEGA a quem pergunta por hipoglicemia ───────────────────
// Confere o CONTEÚDO, não a área: teste de roteamento que aceita qualquer coisa
// da área certa mede meia coisa.
const CHEGA = [
  ['hipoglicemia grave, quando prescrever glucagon?', /dasiglucagon/i, 'as formulações prontas de glucagon'],
  ['regra dos 15 para tratar hipoglicemia', /8 a 10 g/i, 'a dose menor em usuário de sistema automatizado'],
  ['hipoglicemia sem sintomas de alerta, o que fazer?', /Gold|Clarke/, 'os instrumentos de percepção prejudicada'],
  ['paciente com hipoglicemia noturna em insulina NPH', /bradicardia/i, 'a bradicardia da hipoglicemia noturna'],
  ['idoso em sulfonilureia com hipoglicemia de repeticao', /Beers/, 'os Critérios de Beers'],
  ['hipoglicemia e direcao de veiculo', /70 a 90 mg\/dL/, 'a regra de não iniciar viagem longa na faixa baixa'],
  ['socorrista tratando hipoglicemia grave: dextrose qual?', /D10|dextrose a 10%/i, 'a preferência por D10 sobre D50']
];
for (const [q, re, oque] of CHEGA) {
  const b = deep.deepFor(q, deep.TETO_PROFUNDO, q);
  ok(re.test(b), `⚠️ "${q.slice(0, 46)}…" NÃO recebeu ${oque} — o compêndio de hipoglicemia não está chegando a quem pergunta por ele`);
}

// ── 2. e NÃO rouba de quem responde melhor ──────────────────────────────────
const NAO_ROUBA = [
  ['hipoglicemia no exercicio aerobico prolongado no DM1', 'Endocrinologia do Esporte'],
  ['exercicio aerobico no DM1: como ajustar a bomba', 'Endocrinologia do Esporte'],
  ['maratonista com diabetes tipo 1: alvo de glicose antes do treino', 'Endocrinologia do Esporte'],
  ['hipoglicemia apos bypass gastrico', 'Obesidade'],
  ['hipoglicemia pos-bariatrica', 'Obesidade'],
  ['hipoglicemia na insuficiencia adrenal', 'Adrenal'],
  ['tratamento da cetoacidose diabetica', 'Diabetes'],
  ['DM1 em cetoacidose apos treino intenso', 'Diabetes'],
  ['metas de A1C no idoso com diabetes', 'Diabetes'],
  ['maratonista com hipotireoidismo', 'Tireoide']
];
for (const [q, esperado] of NAO_ROUBA) {
  const a = deep.canonArea(q);
  ok(a === esperado, `⚠️ "${q.slice(0, 46)}…" foi para ${a || 'NENHUMA'} e devia ir para ${esperado} — a área Hipoglicemia está roubando de quem tem a resposta`);
}

// ── 3. a área existe com conteúdo e Diabetes segue abaixo do teto ───────────
{
  const h = (deep.DEEP['Hipoglicemia'] || []).reduce((s, b) => s + String(b.texto || '').length, 0);
  ok(h > 40000, `⚠️ a área Hipoglicemia tem ${h} caracteres — o compêndio saiu da base?`);
  const d = (deep.DEEP['Diabetes'] || []).reduce((s, b) => s + String(b.texto || '').length + String(b.tema || '').length, 0);
  ok(d < deep.TETO_PROFUNDO, `⚠️ Diabetes voltou a estourar o teto (${d}/${deep.TETO_PROFUNDO}) — foi para lá o que devia ficar em Hipoglicemia?`);
}

// ── 4. a qualificação do 15-15 no NÚCLEO não pode sumir ─────────────────────
// ⚠️ Ela vale porque o núcleo viaja em TODA chamada: sem ela, o núcleo ensina
// 15 g a quem usa sistema automatizado, e ali 15 g dão hiperglicemia de rebote.
{
  const html = fs.readFileSync(path.join(RAIZ, 'index.html'), 'utf8');
  const i = html.indexOf('var CLINICAL_GUIDELINES=');
  const f = html.indexOf("';", i);
  const sb = {};
  vm.createContext(sb);
  vm.runInContext('var R;' + html.slice(i, f + 2).replace('var CLINICAL_GUIDELINES=', 'R=') + ';', sb);
  const N = String(sb.R || '');
  ok(/regra 15-15/.test(N) && /AID bastam 8–10 g/.test(N),
    '⚠️ o núcleo perdeu a ressalva do 15-15 para usuário de AID — sem ela ele manda dar 15 g a quem já teve a insulina suspensa pelo algoritmo, e isso é hiperglicemia de rebote');
}

if (falhas.length) {
  console.error('✗ hipoglicemia como subespecialidade:');
  falhas.forEach((f) => console.error('  - ' + f));
  process.exit(1);
}
console.log('✓ hipoglicemia: o compêndio chega a quem pergunta, não rouba de Esporte/Obesidade/Adrenal/Diabetes, e a ressalva do AID segue no núcleo');
