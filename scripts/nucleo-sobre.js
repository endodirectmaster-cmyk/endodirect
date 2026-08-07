#!/usr/bin/env node
/* Imprime o que o NÚCLEO clínico (CLINICAL_GUIDELINES do index.html) já diz
 * sobre um termo — e o que a base PROFUNDA já tem para aquela área.
 *
 * Serve para o agente extrator comparar antes de escrever: o professor pediu
 * "se já tiver alguma informação mais atualizada, desconsiderar a antiga", e o
 * cruzamento mostrou que o núcleo costuma ser MAIS NOVO que o PDF do acervo.
 * Extrair sem olhar isto rebaixaria o que a IA sabe hoje.
 *
 * Uso: node scripts/nucleo-sobre.js "acromegalia" ["ovários policísticos" ...]
 *      node scripts/nucleo-sobre.js --area Diabetes
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const RAIZ = path.join(__dirname, '..');

function nucleo() {
  const html = fs.readFileSync(path.join(RAIZ, 'index.html'), 'utf8');
  const i = html.indexOf('var CLINICAL_GUIDELINES=');
  const fim = html.indexOf("';", i);
  const sb = {};
  vm.createContext(sb);
  vm.runInContext('var R;' + html.slice(i, fim + 2).replace('var CLINICAL_GUIDELINES=', 'R=') + ';', sb);
  return sb.R;
}
const deacc = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

const args = process.argv.slice(2);
const iArea = args.indexOf('--area');
if (iArea >= 0) {
  const area = args[iArea + 1] || '';
  const { deepFor, canonArea } = require(path.join(RAIZ, 'lib', 'clinical-deep.js'));
  const b = deepFor(area);
  console.log(`ÁREA CANÔNICA: ${JSON.stringify(canonArea(area))}`);
  console.log(b ? `BASE PROFUNDA JÁ EXISTENTE (${b.length} chars):\n${b}` : 'BASE PROFUNDA: vazia para esta área.');
  process.exit(0);
}
if (!args.length) { console.error('uso: node scripts/nucleo-sobre.js "termo" ["outro termo"]'); process.exit(1); }

const N = nucleo();
const Nd = deacc(N);
// Entradas do núcleo são separadas por "•".
const entradas = N.split('•').map((e) => e.trim()).filter(Boolean);
let achouAlgum = false;
for (const termo of args) {
  const t = deacc(termo);
  const hits = entradas.filter((e) => deacc(e).includes(t));
  console.log(`\n=== NÚCLEO sobre "${termo}" — ${hits.length} entrada(s)`);
  hits.forEach((h) => { achouAlgum = true; console.log('• ' + h.replace(/\s+/g, ' ').trim() + '\n'); });
  if (!hits.length) console.log('  (o núcleo NÃO menciona este termo — possível lacuna real)');
}
if (!achouAlgum) console.log('\nNenhum termo encontrado. Tente sinônimos: o núcleo escreve por extenso ("síndrome dos ovários policísticos", não "SOP").');
