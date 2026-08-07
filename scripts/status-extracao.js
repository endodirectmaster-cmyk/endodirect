#!/usr/bin/env node
/* Quanto da varredura do acervo já está feito.
 *
 * POR QUE ISTO EXISTE: o professor pediu acompanhamento do percentual, e número
 * recalculado à mão a cada vez é número que muda de sentido no meio do caminho.
 * Já aconteceu: eu relatei "17 de 259 = 6,6%" somando ao acervo do Drive os 5
 * artigos de hiponatremia que ele mandou por fora — que NÃO estão nos 259. O
 * denominador e o numerador têm de sair do mesmo lugar, sempre.
 *
 * Duas contagens, de propósito:
 *   ACERVO DO DRIVE  — os 259 artigos únicos catalogados (unicos.json). É o que
 *                      "extração dos artigos" significa para o professor.
 *   BASE PROFUNDA    — tudo que hoje ancora a IA, incluindo artigos que ele
 *                      mandou direto. É o que a plataforma de fato ganhou.
 *
 * Uso:  node scripts/status-extracao.js [--json]
 */
const fs = require('fs');
const path = require('path');

const RAIZ = path.join(__dirname, '..');
const DIR = path.join(RAIZ, 'scratchpad', 'acervo');
const JSON_OUT = process.argv.includes('--json');

// ⚠️ Canoniza a área como o montador faz. Sem isto o relatório MENTE: o extrato
// grava "Neuroendocrino", o montador arquiva em "Neuroendocrinologia", e a
// primeira versão deste script listou Neuroendocrinologia como "sem nenhum
// bloco" — sendo que ela tem dois artigos. É o mesmo erro que o cofre já
// registra em `cruza-acervo-nucleo.js`: ferramenta minha inventando buraco.
const { canonArea } = require(path.join(RAIZ, 'lib', 'clinical-deep.js'));

function lerLista(arq) {
  const p = path.join(DIR, arq);
  if (!fs.existsSync(p)) return [];
  const v = JSON.parse(fs.readFileSync(p, 'utf8'));
  return Array.isArray(v) ? v : (v.itens || v.fila || Object.values(v).find(Array.isArray) || []);
}

function main() {
  const unicos = lerLista('unicos.json');
  const fila = lerLista('fila-extracao.json');
  const idsAcervo = new Set(unicos.map((x) => x.id).filter(Boolean));

  const dirExt = path.join(DIR, 'extratos');
  const extratos = fs.existsSync(dirExt) ? fs.readdirSync(dirExt).filter((f) => f.endsWith('.json')) : [];

  let fatos = 0;
  const porArea = {};
  const doAcervo = [];
  const deFora = [];
  for (const arq of extratos) {
    const e = JSON.parse(fs.readFileSync(path.join(dirExt, arq), 'utf8'));
    const n = (e.fatos || []).length;
    fatos += n;
    const area = canonArea(e.area || '') || (e.area || '?');
    porArea[area] = porArea[area] || { artigos: 0, fatos: 0 };
    porArea[area].artigos++;
    porArea[area].fatos += n;
    (idsAcervo.has(e.fileId) ? doAcervo : deFora).push({ id: e.fileId, fatos: n, area: e.area });
  }

  // Quanto FALTA, e o que falta que mais importa.
  const feitos = new Set(doAcervo.map((x) => x.id));
  const pend = fila.filter((x) => !feitos.has(x.id));
  const pendAlto = pend.filter((x) => x.valor_ancoragem === 'alto');

  const pct = (a, b) => (b ? (a / b * 100).toFixed(1) + '%' : '—');
  const dados = {
    acervo: { total: unicos.length, extraidos: doAcervo.length, pct: pct(doAcervo.length, unicos.length) },
    fila: { total: fila.length, pendentes: pend.length, pendentes_alta_ancoragem: pendAlto.length },
    base_profunda: { artigos: extratos.length, fatos, de_fora_do_acervo: deFora.length },
    por_area: porArea
  };

  if (JSON_OUT) { console.log(JSON.stringify(dados, null, 1)); return; }

  console.log('ACERVO DO DRIVE (o que "extração dos artigos" significa)');
  console.log(`  ${doAcervo.length} de ${unicos.length} artigos únicos  ·  ${dados.acervo.pct}`);
  console.log(`  faltam ${pend.length} na fila, dos quais ${pendAlto.length} de ALTA ancoragem\n`);

  console.log('BASE PROFUNDA (tudo que hoje ancora a IA)');
  console.log(`  ${extratos.length} artigos · ${fatos} fatos com citação conferida`);
  if (deFora.length) console.log(`  (${deFora.length} vieram por fora do acervo — enviados direto pelo professor)`);
  console.log();

  console.log('POR SUBESPECIALIDADE');
  const areas = Object.keys(porArea).sort((a, b) => porArea[b].fatos - porArea[a].fatos);
  for (const a of areas) console.log(`  ${a.padEnd(26)} ${String(porArea[a].artigos).padStart(2)} artigo(s) · ${String(porArea[a].fatos).padStart(4)} fatos`);

  // ⚠️ Área sem bloco nenhum = a IA gera aquela subespecialidade SÓ com o núcleo,
  // sem aprofundamento. É o buraco que mais importa e o que menos aparece num
  // percentual global — por isso vai listado.
  const CANON = ['Diabetes', 'Obesidade', 'Tireoide', 'Adrenal', 'Neuroendocrinologia', 'Osteometabolismo',
    'Lípides', 'Endocrinologia Pediátrica', 'Endocrinologia Feminina', 'Endocrinologia Masculina',
    'Endocrinologia do Esporte', 'Transgeneridade', 'Endocrinopatias'];
  const vazias = CANON.filter((a) => !porArea[a]);
  if (vazias.length) {
    console.log('\n⚠️ SEM NENHUM BLOCO (a IA gera essas áreas só com o núcleo):');
    vazias.forEach((a) => console.log('   · ' + a));
  }
}

main();
