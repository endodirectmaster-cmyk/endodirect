#!/usr/bin/env node
/* O fato que RESTITUI o núcleo envelhece quando o núcleo muda — e ninguém via.
 *
 * ── O CASO QUE CRIOU ESTA PENEIRA (09/08/2026) ──────────────────────────────
 * Corrigi o núcleo numa recomendação de PRESCRIÇÃO da ATA 2026: o marco do PTU
 * na gestante é 16 SEMANAS, não o fim do 1º trimestre, e passado ele a diretriz
 * declara DESCONHECIDA a escolha do antitireoidiano.
 *
 * O `confere-ressalvas.js` seguiu verde, e estava CERTO: ele confere `conflito`
 * e `nucleo_citado`, que são campos DO EXTRATO. Só que 36 fatos, em 11 extratos,
 * restituem o núcleo por escrito DENTRO de `fatos[].afirmacao` — e ali nenhuma
 * peneira olhava. Um deles dizia que "o núcleo manda propiltiouracil no 1º
 * trimestre e metimazol depois". Depois da correção isso virou mentira, e o fato
 * passou a mandar trocar a gestante de volta para metimazol exatamente onde a
 * diretriz se recusa a recomendar. Ficou três dias assim: cabeçalho do extrato
 * certo, fato entregue errado.
 *
 * ── A REGRA, QUE É A MESMA DO `cit_sha` ─────────────────────────────────────
 * Texto que COPIA outro texto precisa de um SELO do que copiou. O `cit_sha`
 * protege a citação do artigo; este protege a restituição do núcleo.
 *
 * Fato que menciona o núcleo tem de carregar `nucleo_sha` igual ao selo do
 * núcleo de HOJE. Mudou o núcleo, todos eles reprovam — e é ISSO que se quer:
 * a reprovação é o pedido de releitura. Reler 36 fatos custa minutos; entregar
 * uma prescrição invertida custou três dias sem ninguém saber.
 *
 * ⚠️ `--selar` NÃO É "consertar". Só carimbe depois de RELER os fatos listados e
 * confirmar que cada um ainda diz a verdade sobre o núcleo de hoje. Carimbar sem
 * ler transforma esta peneira em enfeite — e um enfeite que reprova é pior que
 * peneira nenhuma, porque ensina a ignorar.
 */
'use strict';
const fs = require('fs');
const path = require('path');
const { nucleoTexto, nucleoSha, restituiONucleo } = require('../lib/nucleo');

const DIR = path.join(__dirname, '..', 'scratchpad', 'acervo', 'extratos');
const selar = process.argv.includes('--selar');

const selo = nucleoSha(nucleoTexto());
const arquivos = fs.existsSync(DIR) ? fs.readdirSync(DIR).filter((f) => f.endsWith('.json')) : [];

const pendentes = [];
let comSelo = 0;
let alterados = 0;

for (const nome of arquivos) {
  const p = path.join(DIR, nome);
  let j;
  try { j = JSON.parse(fs.readFileSync(p, 'utf8')); } catch (e) { continue; }
  let mexeu = false;
  (j.fatos || []).forEach((f, i) => {
    if (!restituiONucleo(f)) return;
    if (f.nucleo_sha === selo) { comSelo++; return; }
    if (selar) { f.nucleo_sha = selo; mexeu = true; alterados++; return; }
    pendentes.push({
      arquivo: nome,
      i,
      tinha: f.nucleo_sha || '(sem selo)',
      trecho: String(f.afirmacao || '').replace(/\s+/g, ' ').slice(0, 110),
    });
  });
  if (mexeu) fs.writeFileSync(p, JSON.stringify(j, null, 2) + '\n');
}

if (selar) {
  console.log(`✓ selo do núcleo (${selo}) aplicado a ${alterados} fato(s).`);
  console.log('  ⚠️ Isto só vale se você RELEU cada um. Carimbo sem leitura é enfeite.');
  process.exit(0);
}

if (pendentes.length) {
  console.error(`\n✗ ${pendentes.length} fato(s) restituem o núcleo com selo VELHO ou AUSENTE.`);
  console.error(`  O núcleo de hoje é ${selo}. Estes fatos foram escritos contra outro núcleo,`);
  console.error('  então o que eles atribuem a ele pode já não ser verdade:\n');
  for (const x of pendentes) {
    console.error(`  ${x.arquivo}  fato #${x.i}  [${x.tinha}]`);
    console.error(`     ${x.trecho}…`);
  }
  console.error('\n  RELEIA cada um contra o núcleo de hoje. Confirmados, carimbe:');
  console.error('    node scripts/confere-nucleo-nos-fatos.js --selar');
  process.exit(1);
}

console.log(`✓ núcleo restituído nos fatos: ${comSelo} fato(s) conferido(s) contra o núcleo de hoje (${selo}).`);
