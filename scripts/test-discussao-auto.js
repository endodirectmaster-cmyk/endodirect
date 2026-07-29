// Seleção dos artigos que ganham discussão completa AUTOMÁTICA.
//
// O defeito que este teste existe para pegar: o pedido do professor foi
// "metanálise, diretriz, ensaio clínico e consenso". Só olhar o campo `tipo`
// atenderia o pedido no papel e não no efeito — o classificador do radar NÃO
// emite "Consenso" (o prompt manda tratar consenso como "Diretriz"), então
// nenhum artigo que o radar traz teria esse rótulo. O reconhecimento por título
// é o que faz o pedido valer para o conteúdo que chega sozinho.
//
// O outro defeito: gerar para tudo. Estudo observacional aberto é a maioria
// (56 dos 81 em 28/07) e é justamente onde a discussão não rende.
'use strict';
const { selecionar, qualifica, TIPOS_QUE_RENDEM } = require('../lib/discussao-auto');

let bad = 0;
const ok = (nome, cond, det) => { if (cond) return; bad++; console.log('  ✗ ' + nome + (det ? ' — ' + det : '')); };

const PMC = 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC13395687/';
const DOI = 'https://doi.org/10.1210/clinem/dgag208';
const art = (o) => Object.assign({ sourceId: 'pubmed:1', titulo: '', tipo: 'Estudo Original', link: PMC, at: 1 }, o);

// ---- 1. os quatro tipos pedidos passam ---------------------------------------
TIPOS_QUE_RENDEM.forEach((t) => ok('tipo "' + t + '" qualifica', qualifica(art({ tipo: t })) === true));
ok('os 5 tipos pedidos estão na lista',
   ['Metanálise', 'Diretriz', 'Consenso', 'Ensaio Clínico', 'Artigo de Revisão'].every((t) => TIPOS_QUE_RENDEM.indexOf(t) >= 0),
   TIPOS_QUE_RENDEM.join(', '));

// ---- 2. o que NÃO rende fica de fora ----------------------------------------
ok('Estudo Original comum NÃO qualifica', qualifica(art({ titulo: 'Serum irisin in obese adults: a cross-sectional study' })) === false);
// Revisão narrativa PASSOU a qualificar em 28/07, a pedido do professor.
ok('Artigo de Revisão qualifica', qualifica(art({ tipo: 'Artigo de Revisão', titulo: 'Obesity and bone health: a narrative review' })) === true);
ok('Estudo Genético NÃO qualifica', qualifica(art({ tipo: 'Estudo Genético', titulo: 'Notch biallelic variants in congenital hypothyroidism' })) === false);

// ---- 3. sem texto integral aberto, nunca ------------------------------------
ok('sem PMC não qualifica, mesmo sendo metanálise', qualifica(art({ tipo: 'Metanálise', link: DOI })) === false);
ok('link vazio não qualifica', qualifica(art({ tipo: 'Diretriz', link: '' })) === false);

// ---- 4. ⚠️ CONSENSO pelo TÍTULO — o motivo de o teste existir ---------------
// O radar rotula consenso como "Diretriz"; um consenso que ele classificou como
// "Estudo Original" só entra se o título for lido.
ok('consensus no título qualifica apesar do rótulo Estudo Original',
   qualifica(art({ titulo: 'Expert consensus on the management of primary aldosteronism' })) === true);
ok('consenso em português no título qualifica',
   qualifica(art({ titulo: 'Consenso brasileiro sobre rastreamento do nódulo tireoidiano' })) === true);
ok('position statement qualifica', qualifica(art({ titulo: 'ATA position statement on thyroid nodules' })) === true);
ok('guideline no título qualifica', qualifica(art({ titulo: 'Clinical practice guideline for adrenal incidentaloma' })) === true);
ok('standards of care qualifica', qualifica(art({ titulo: 'Standards of Medical Care in Diabetes 2026' })) === true);

// ---- 5. ensaio randomizado escondido em "Estudo Original" -------------------
ok('randomized no título qualifica',
   qualifica(art({ titulo: 'A randomized, double-blind trial of semaglutide in NAFLD' })) === true);
ok('placebo-controlled qualifica', qualifica(art({ titulo: 'Placebo-controlled study of vitamin D in fractures' })) === true);
// Falso positivo que importa evitar: falar SOBRE um ensaio não é ser um ensaio.
ok('"consensus" não casa dentro de outra palavra', qualifica(art({ titulo: 'Consensual pupillary reflex in pituitary disease' })) === false);

// ---- 6. fila: dedup, ordem e limite -----------------------------------------
const avisos = [
  art({ sourceId: 'a', tipo: 'Metanálise', at: 100 }),
  art({ sourceId: 'b', tipo: 'Metanálise', at: 300 }),
  art({ sourceId: 'c', tipo: 'Estudo Original', titulo: 'nada demais', at: 400 }),
  art({ sourceId: 'd', tipo: 'Ensaio Clínico', at: 200 }),
  art({ sourceId: 'e', tipo: 'Diretriz', link: DOI, at: 500 })
];
const fila = selecionar(avisos, new Set(['b']), 10);
ok('exclui o que já tem discussão', fila.every((x) => x.sourceId !== 'b'));
ok('exclui o que não rende e o sem PMC', fila.map((x) => x.sourceId).join(',') === 'd,a', fila.map((x) => x.sourceId).join(','));
ok('mais novos primeiro', fila[0].sourceId === 'd');
ok('respeita o limite', selecionar(avisos, new Set(), 1).length === 1);
ok('limite 0 devolve vazio', selecionar(avisos, new Set(), 0).length === 0);
// (com `d` já gerado, sobram as duas metanálises — `b` é mais nova que `a`)
ok('aceita objeto além de Set', selecionar(avisos, { d: true }, 10).map((x) => x.sourceId).join(',') === 'b,a',
   selecionar(avisos, { d: true }, 10).map((x) => x.sourceId).join(','));
ok('lista ausente não quebra', selecionar(null, new Set(), 5).length === 0);
ok('item sem sourceId é ignorado', selecionar([art({ sourceId: '', tipo: 'Metanálise' })], new Set(), 5).length === 0);

// ---- 7. o modelo é Opus 4.8, e a env legada NÃO o sequestra ------------------
// A primeira discussão em produção saiu com `claude-sonnet-4-6` — id retirado em
// 13/07 — porque lib/discussao.js lia process.env.ANTHROPIC_MODEL cru.
delete require.cache[require.resolve('../lib/discussao.js')];
process.env.ANTHROPIC_MODEL = 'claude-sonnet-4-6';
delete process.env.DISCUSSAO_MODEL;
{
  // Tira os comentários antes de procurar: a explicação do porquê CITA o nome da
  // env, e casar no comentário faria o teste reprovar o código correto.
  const src = require('fs').readFileSync(require.resolve('../lib/discussao.js'), 'utf8');
  const codigo = src.replace(/^\s*\/\/.*$/gm, '');
  ok('discussao.js NÃO lê ANTHROPIC_MODEL (fora de comentário)', codigo.indexOf('process.env.ANTHROPIC_MODEL') < 0);
  ok('o padrão é Opus 4.8', /normModel\(process\.env\.DISCUSSAO_MODEL\)\s*\|\|\s*'claude-opus-4-8'/.test(src));
  ok('a env própria passa por allowlist', /LEGACY_MODEL_MAP/.test(src) && /ALLOWED_MODELS/.test(src));
}

console.log(bad ? '\nFALHOU: ' + bad : '\n✓ seleção da discussão automática: 5 tipos + consenso/ensaio por título, Opus 4.8 fixo');
process.exit(bad ? 1 : 0);
