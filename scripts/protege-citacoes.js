#!/usr/bin/env node
/* Migração única: troca o TEXTO da citação por uma REFERÊNCIA conferível.
 *
 * Ver o cabeçalho de lib/citacao.js para o porquê (72% de um artigo Elsevier por
 * assinatura reconstituível verbatim num repositório público).
 *
 * O que faz, extrato por extrato, fato por fato:
 *   1. localiza a `citacao` no texto-fonte local (a mesma busca que o
 *      verificador já faz, incluindo elisão declarada `[…]`);
 *   2. grava `cit` (offsets) e `cit_sha` (hash do texto resolvido);
 *   3. apaga `citacao`.
 *
 * ⚠️ RECUSA-SE a migrar um fato cuja citação não seja localizável. Sem offset
 * não há prova, e um fato sem prova não pode ficar na base — é a mesma regra de
 * sempre, só que agora ela vale na migração também. Nada é inventado, nada é
 * apagado em silêncio: os não-localizáveis são listados e o arquivo não é
 * gravado até que estejam todos resolvidos.
 *
 * Uso:  node scripts/protege-citacoes.js [--dir scratchpad/acervo] [--dry]
 */
const fs = require('fs');
const path = require('path');
const C = require('../lib/citacao');

const RAIZ = path.join(__dirname, '..');
const arg = (n, p) => { const i = process.argv.indexOf(n); return i > 0 && process.argv[i + 1] ? process.argv[i + 1] : p; };
const DIR = path.resolve(arg('--dir', path.join(RAIZ, 'scratchpad', 'acervo')));
const DRY = process.argv.includes('--dry');

const dirExt = path.join(DIR, 'extratos');
const dirTxt = path.join(DIR, 'textos');
if (!fs.existsSync(dirExt)) { console.error('✗ não existe ' + dirExt); process.exit(1); }

let migrados = 0, jaOk = 0, fatosMig = 0;
const semTexto = [];
const naoLocalizados = [];

for (const arq of fs.readdirSync(dirExt).filter((f) => f.endsWith('.json'))) {
  const p = path.join(dirExt, arq);
  const e = JSON.parse(fs.readFileSync(p, 'utf8'));
  const pTxt = path.join(dirTxt, String(e.fileId || '') + '.txt');
  if (!fs.existsSync(pTxt)) { semTexto.push(arq); continue; }
  const bs = C.bases(fs.readFileSync(pTxt, 'utf8'));

  let mudou = false, pendentes = 0;
  (e.fatos || []).forEach((f, i) => {
    if (Array.isArray(f.cit) && f.cit.length) return; // já migrado
    const texto = String(f.citacao || '').trim();
    if (!texto) { naoLocalizados.push(`${arq} #${i + 1}: sem citação`); pendentes++; return; }
    const ref = C.referenciar(texto, bs);
    if (!ref) {
      naoLocalizados.push(`${arq} #${i + 1}: citação não localizada no texto-fonte → "${texto.slice(0, 70)}…"`);
      pendentes++;
      return;
    }
    f.cit = ref.cit;
    f.cit_sha = ref.cit_sha;
    delete f.citacao;
    mudou = true; fatosMig++;
  });

  if (pendentes) continue;         // arquivo com pendência não é gravado
  if (!mudou) { jaOk++; continue; }
  if (!DRY) fs.writeFileSync(p, JSON.stringify(e, null, 1) + '\n');
  migrados++;
  console.log(`✓ ${arq}  — ${(e.fatos || []).length} fato(s)`);
}

if (semTexto.length) {
  console.log(`\n(${semTexto.length} extrato(s) sem texto-fonte local — não migrados: ${semTexto.join(', ')})`);
}
if (jaOk) console.log(`(${jaOk} extrato(s) já estavam migrados)`);

if (naoLocalizados.length) {
  console.error(`\n✗ ${naoLocalizados.length} fato(s) com citação NÃO localizável — os arquivos deles NÃO foram gravados:`);
  naoLocalizados.slice(0, 20).forEach((s) => console.error('   · ' + s));
  if (naoLocalizados.length > 20) console.error(`   … e mais ${naoLocalizados.length - 20}`);
  console.error('\nSem offset não há prova. Corrija a citação (ou o fato) antes de migrar.');
  process.exit(1);
}

console.log(`\n${DRY ? '[dry] ' : ''}✓ ${migrados} extrato(s) migrados · ${fatosMig} fato(s) agora referenciam o texto-fonte em vez de copiá-lo.`);
