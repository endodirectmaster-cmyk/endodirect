#!/usr/bin/env node
/* Monta lib/clinical-deep-data.js a partir dos extratos VERIFICADOS.
 *
 * Cadeia completa da varredura do acervo:
 *   1. agente lê o PDF          → scratchpad/acervo/textos/<id>.txt
 *   2. agente extrai com citação → scratchpad/acervo/extratos/<id>.json
 *   3. scripts/verifica-extracao.js confere CADA citação contra o texto
 *   4. este script monta o módulo que o api/ai.js entrega à IA
 *
 * ⚠️ Ele RECUSA gerar se qualquer extrato reprovar na etapa 3. Não existe modo
 * "gera assim mesmo": conteúdo sem citação conferida não entra na base clínica.
 *
 * ⚠️ ORDEM IMPORTA. `deepFor` corta a área ao atingir o teto, e o que se perde é
 * o FIM. Por isso os blocos saem ordenados por AUTORIDADE e RECÊNCIA: diretriz
 * antes de revisão, revisão antes de estudo isolado, e mais novo antes de mais
 * velho. Se algo tiver de cair, cai o menos forte — nunca a diretriz vigente.
 *
 * Uso:  node scripts/monta-base-profunda.js [--dir scratchpad/acervo] [--dry]
 */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const RAIZ = path.join(__dirname, '..');
const argDir = (() => {
  const i = process.argv.indexOf('--dir');
  return i > 0 && process.argv[i + 1] ? process.argv[i + 1] : path.join('scratchpad', 'acervo');
})();
const DRY = process.argv.includes('--dry');
const DIR_EXTRATOS = path.join(RAIZ, argDir, 'extratos');
const SAIDA = path.join(RAIZ, 'lib', 'clinical-deep-data.js');

// Peso por tipo de documento: quanto MENOR, mais cedo entra no bloco (e mais
// protegido fica do corte por teto).
const PESO_TIPO = { diretriz: 0, consenso: 0, posicionamento: 0, revisao: 1, metanalise: 2, ensaio: 3, observacional: 4, caso: 5, outro: 6 };

function canonizar(area) {
  const { canonArea } = require(path.join(RAIZ, 'lib', 'clinical-deep.js'));
  return canonArea(area);
}

function main() {
  // ── etapa 3: a verificação é PRÉ-REQUISITO, não opcional ──────────────────
  try {
    execFileSync(process.execPath, [path.join(RAIZ, 'scripts', 'verifica-extracao.js'), '--dir', path.join(RAIZ, argDir)], { stdio: 'pipe' });
  } catch (e) {
    const out = (e.stdout ? e.stdout.toString() : '') + (e.stderr ? e.stderr.toString() : '');
    console.error('✗ A verificação das citações REPROVOU — nada será gerado.\n');
    console.error(out);
    process.exit(1);
  }

  if (!fs.existsSync(DIR_EXTRATOS)) { console.error('✗ não existe ' + DIR_EXTRATOS); process.exit(1); }
  const arquivos = fs.readdirSync(DIR_EXTRATOS).filter((f) => f.endsWith('.json'));
  if (!arquivos.length) { console.error('✗ nenhum extrato em ' + DIR_EXTRATOS); process.exit(1); }

  const porArea = {};
  const semArea = [];
  for (const arq of arquivos) {
    const e = JSON.parse(fs.readFileSync(path.join(DIR_EXTRATOS, arq), 'utf8'));
    const canon = canonizar(e.area || '');
    if (!canon) { semArea.push(`${arq} (area=${JSON.stringify(e.area)})`); continue; }
    const fatos = (Array.isArray(e.fatos) ? e.fatos : []).map((f) => String(f.afirmacao || '').trim()).filter(Boolean);
    if (!fatos.length) continue;
    // ⚠️ A RESSALVA VAI NA FRENTE, e isso é deliberado.
    // O extrator registra em `conflito` quando o artigo CONTRARIA o núcleo — em
    // geral porque o artigo é mais antigo. Caso real: a revisão de diabetes
    // pós-transplante de 2016 manda EVITAR iSGLT2 e AR GLP-1, enquanto o núcleo
    // carrega o ADA 2026, que os recomenda. Até 07/08 o montador DESCARTAVA esse
    // campo: a IA recebia a conduta de 2016 sem saber que fora superada.
    // Fica no INÍCIO do texto porque `deepFor` corta pelo fim — uma ressalva que
    // o truncamento apaga é pior do que inútil, dá falsa sensação de proteção.
    const ressalva = String(e.conflito || '').trim();
    const corpo = fatos.join(' ');
    (porArea[canon] = porArea[canon] || []).push({
      tema: String(e.tema || e.titulo || '').trim(),
      fonte: String(e.fonte || '').trim(),
      texto: ressalva ? ('⚠️ RESSALVA — o núcleo prevalece sobre esta fonte nos pontos a seguir: ' + ressalva + ' | CONTEÚDO: ' + corpo) : corpo,
      _peso: PESO_TIPO[String(e.tipo || 'outro').toLowerCase()] != null ? PESO_TIPO[String(e.tipo || 'outro').toLowerCase()] : 6,
      _ano: Number(e.ano) || 0,
      _fatos: fatos.length
    });
  }

  // ordena: autoridade primeiro, depois mais recente, depois mais denso
  for (const a of Object.keys(porArea)) {
    porArea[a].sort((x, y) => (x._peso - y._peso) || (y._ano - x._ano) || (y._fatos - x._fatos));
  }

  // ── relatório e aviso de corte ────────────────────────────────────────────
  const TETO_AREA = 120000; // mesmo teto de api/ai.js (TETO_PROFUNDO)
  let totalBlocos = 0, totalFatos = 0;
  console.log('Base profunda por área:');
  for (const a of Object.keys(porArea).sort()) {
    const blocos = porArea[a];
    const tam = blocos.reduce((n, b) => n + b.tema.length + b.fonte.length + b.texto.length + 6, 0);
    totalBlocos += blocos.length;
    totalFatos += blocos.reduce((n, b) => n + b._fatos, 0);
    const alerta = tam > TETO_AREA
      ? `  ⚠️ ${tam} chars ULTRAPASSA o teto de ${TETO_AREA}: os últimos blocos (menos autoritativos) não chegarão à IA`
      : '';
    console.log(`  ${a.padEnd(28)} ${String(blocos.length).padStart(3)} bloco(s) · ${String(tam).padStart(6)} chars${alerta}`);
  }
  if (semArea.length) {
    console.log('\n⚠️ extratos SEM área canônica (ignorados — corrija o campo `area`):');
    semArea.forEach((s) => console.log('   · ' + s));
  }
  console.log(`\ntotal: ${totalBlocos} bloco(s) de ${arquivos.length} extrato(s) · ${totalFatos} fato(s) verificado(s)`);

  if (DRY) { console.log('\n(--dry: nada foi escrito)'); return; }

  // ── gera o módulo ─────────────────────────────────────────────────────────
  const limpo = {};
  for (const a of Object.keys(porArea).sort()) {
    limpo[a] = porArea[a].map((b) => ({ tema: b.tema, fonte: b.fonte, texto: b.texto }));
  }
  const cabecalho = `// GERADO — não editar à mão. Produzido por scripts/monta-base-profunda.js a
// partir dos extratos verificados em ${argDir}/extratos/, cada fato com citação
// literal conferida contra o PDF por scripts/verifica-extracao.js.
//
// Separado de lib/clinical-deep.js de propósito: lá fica a LÓGICA (canonização de
// área, montagem do bloco, tetos), aqui só o CONTEÚDO. Assim o conteúdo pode
// crescer para centenas de KB sem que ninguém precise reler a lógica, e um erro
// de geração nunca corrompe o código que decide o que vai para a IA.
//
// Ordem dentro de cada área: diretriz antes de revisão, revisão antes de estudo
// isolado, mais novo antes de mais velho — porque \`deepFor\` corta pelo FIM.
//
// ${totalBlocos} bloco(s) · ${totalFatos} fato(s) verificado(s).
module.exports = `;
  fs.writeFileSync(SAIDA, cabecalho + JSON.stringify(limpo, null, 1) + ';\n');
  console.log('\n✓ gerado ' + path.relative(RAIZ, SAIDA));
}

main();
