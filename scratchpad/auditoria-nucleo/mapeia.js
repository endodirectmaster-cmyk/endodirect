#!/usr/bin/env node
/* Mapa da auditoria: para cada entrada do NÚCLEO, quais extratos verbatim e
 * quais notas do cofre falam do MESMO assunto.
 *
 * Por que existe: auditar "está correto?" exige contra-o-quê. A prova mais forte
 * disponível sem sair do repositório são os 47 extratos — cada fato com `cit`
 * apontando bytes exatos do PDF e `cit_sha`. Onde uma entrada do núcleo e um
 * extrato falam do mesmo assunto, DIVERGÊNCIA é achado, e o lado do extrato é
 * conferível byte a byte.
 *
 * ⚠️ Roda uma vez, ANTES dos agentes. Nenhum agente executa este arquivo —
 * em 08/08 um agente executou o script de outro e duplicou 29 fatos.
 */
'use strict';
const fs = require('fs');
const path = require('path');
const { canonArea } = require('../../lib/clinical-deep.js');

const AQUI = __dirname;
const RAIZ = path.join(AQUI, '..', '..');
const entradas = JSON.parse(fs.readFileSync(path.join(AQUI, 'entradas.json'), 'utf8'));
const extratos = JSON.parse(fs.readFileSync(path.join(AQUI, 'extratos.json'), 'utf8'));
const DIR_COFRE = path.join(RAIZ, 'cofre', 'Diretrizes Clínicas');

const deacc = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

// A área de uma entrada do núcleo: o canonArea da entrada inteira não serve
// (texto longo casa com tudo). Usa-se o PREFIXO até o primeiro ':' — que é o
// rótulo do assunto, escrito por mim justamente para nomear o tema.
function areaDaEntrada(e) {
  const bruto = e.replace(/^\s*•\s*/, '');
  const rotulo = bruto.split(/[:—]/)[0].slice(0, 90);
  return canonArea(rotulo) || canonArea(bruto.slice(0, 160)) || null;
}

// Termos-chave de uma entrada: palavras de ≥5 letras fora das vazias.
const VAZIAS = new Set(('para com que nao dos das uma como quando onde pelo pela sobre '
  + 'entre depois antes ainda porque apenas todos todas cada mais menos muito pouco '
  + 'deve devem pode podem usar usa fazer faz seja sejam esta este isso aquele '
  + 'diretriz diretrizes paciente pacientes tratamento diagnostico').split(/\s+/));
function termos(s) {
  const set = new Set();
  for (const w of deacc(s).split(/[^a-z0-9-]+/)) if (w.length >= 5 && !VAZIAS.has(w)) set.add(w);
  return set;
}

// Notas do cofre, com seus termos.
const notas = fs.readdirSync(DIR_COFRE).filter((f) => f.endsWith('.md') && f !== 'README.md')
  .map((f) => {
    const txt = fs.readFileSync(path.join(DIR_COFRE, f), 'utf8');
    return { arq: f, chars: txt.length, termos: termos(f + ' ' + txt.slice(0, 4000)) };
  });

const sobrepoe = (a, b) => { let n = 0; for (const t of a) if (b.has(t)) n++; return n; };

const mapa = entradas.map((e, i) => {
  const area = areaDaEntrada(e);
  const tE = termos(e);
  const exArea = extratos.filter((x) => {
    const areas = Array.isArray(x.area) ? x.area : String(x.area || '').split(/\s*[;|]\s*/);
    return areas.some((a) => canonArea(a) === area);
  });
  const notasProx = notas.map((n) => ({ arq: n.arq, n: sobrepoe(tE, n.termos) }))
    .filter((n) => n.n >= 4).sort((a, b) => b.n - a.n).slice(0, 3);
  return {
    i,
    rotulo: e.replace(/^\s*•\s*/, '').split(/[:—]/)[0].slice(0, 70),
    chars: e.length,
    temCorte: /[<>≥≤]/.test(e),
    area,
    extratos: exArea.map((x) => ({ arq: x.arq, titulo: x.titulo.slice(0, 60), fatos: x.fatos })),
    notas: notasProx,
  };
});

fs.writeFileSync(path.join(AQUI, 'mapa.json'), JSON.stringify(mapa, null, 1));

const semArea = mapa.filter((m) => !m.area);
const semLastro = mapa.filter((m) => m.area && !m.extratos.length && !m.notas.length);
const porArea = {};
for (const m of mapa) porArea[m.area || '(sem área)'] = (porArea[m.area || '(sem área)'] || 0) + 1;

console.log('ENTRADAS DO NÚCLEO POR ÁREA\n');
for (const a of Object.keys(porArea).sort((x, y) => porArea[y] - porArea[x])) {
  console.log('  ' + String(porArea[a]).padStart(3) + '  ' + a);
}
console.log('\nsem área canônica: ' + semArea.length);
console.log('com área mas SEM extrato e SEM nota (nada contra o que conferir): ' + semLastro.length);
semLastro.forEach((m) => console.log('   · ' + m.rotulo));
console.log('\ncom corte numérico: ' + mapa.filter((m) => m.temCorte).length + ' de ' + mapa.length);
console.log('mapa gravado em scratchpad/auditoria-nucleo/mapa.json');
