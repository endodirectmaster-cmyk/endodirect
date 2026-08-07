// Regressão: o bloco clínico que ancora TODA geração de IA não pode estourar o
// teto — porque estourar CORTA EM SILÊNCIO, e o que se perde é o FIM do bloco.
//
// Descoberto em 07/08/2026, ao planejar a leitura do acervo do Drive: o
// `api/ai.js` faz `parts[0].slice(0, 60000)` no prefixo cacheável. O bloco
// avaliado estava em 59.659 caracteres — 341 de folga. A entrada de MODY que eu
// tinha acabado de acrescentar consumiu ~1.470: antes dela havia ~1.811.
//
// Ou seja: a próxima entrada de tamanho normal derrubaria a última entrada do
// bloco, sem erro, sem log e sem teste falhando. A IA passaria a gerar questão,
// comentário e flashcard sem aquela diretriz, e ninguém notaria.
//
// Este teste mede o bloco JÁ AVALIADO (não o código-fonte, que é maior por causa
// da concatenação `+'…'`) e falha antes do corte.
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const raiz = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(raiz, 'index.html'), 'utf8');
const ai = fs.readFileSync(path.join(raiz, 'api', 'ai.js'), 'utf8');
const falhas = [];
const ok = (cond, msg) => { if (!cond) falhas.push(msg); };

// ── o teto vem do api/ai.js, não é constante deste teste ────────────────────
const mTeto = ai.match(/TETO_NUCLEO\s*=\s*(\d+)/);
ok(!!mTeto, 'não achei TETO_NUCLEO em api/ai.js');
ok(/parts\[0\]\.slice\(0,\s*TETO_NUCLEO\)/.test(ai),
  'o corte do prefixo cacheável tem de usar TETO_NUCLEO — número solto volta a divergir deste teste');
if (!mTeto) { falhas.forEach((f) => console.error('  - ' + f)); process.exit(1); }
const TETO = parseInt(mTeto[1], 10);

// ── a camada PROFUNDA tem de estar ligada, senão o conteúdo extraído dos
//    artigos não chega à IA e o núcleo volta a ser o único limite ────────────
ok(/require\(.*clinical-deep.*\)/.test(ai), 'api/ai.js tem de carregar lib/clinical-deep');
ok(/head\s*=\s*parts\[0\]\.slice\(0,\s*TETO_NUCLEO\)\s*\+\s*profundo/.test(ai),
  'o bloco profundo tem de entrar no MESMO prefixo cacheável do núcleo');
const deep = require(path.join(raiz, 'lib', 'clinical-deep'));
ok(deep.canonArea('Andrologia') === 'Endocrinologia Masculina',
  'a área tem de ser canonizada igual ao index.html (Andrologia = Endocrinologia Masculina)');
ok(deep.canonArea('Cardiologia') === '', 'área fora da endocrinologia não pode receber bloco profundo');
ok(deep.deepFor('Cardiologia') === '', 'sem área canônica, o bloco profundo é vazio');
ok(deep.deepFor('Diabetes').length > 500, 'a área Diabetes já deve ter conteúdo profundo');

// ── avalia CLINICAL_GUIDELINES de verdade ────────────────────────────────────
function valorDaVar(nome) {
  const i = html.indexOf('var ' + nome + '=');
  if (i < 0) throw new Error('var ' + nome + ' não encontrada no index.html');
  const fim = html.indexOf("';", i);
  if (fim < 0) throw new Error('não achei o fim de ' + nome);
  const src = html.slice(i, fim + 2).replace('var ' + nome + '=', 'RESULTADO=');
  const sandbox = {};
  vm.createContext(sandbox);
  vm.runInContext('var RESULTADO;' + src + ';', sandbox);
  return sandbox.RESULTADO;
}

const bloco = valorDaVar('CLINICAL_GUIDELINES');
ok(typeof bloco === 'string' && bloco.length > 1000, 'CLINICAL_GUIDELINES não avaliou para string');

const folga = TETO - bloco.length;
const entradas = (bloco.match(/•/g) || []).length;

// ⚠️ A margem existe para que a falha apareça ANTES do prejuízo. Estourar o teto
// não quebra nada visível: só apaga diretriz da cabeça da IA.
const MARGEM = 500;
ok(bloco.length <= TETO,
  `⚠️ CLINICAL_GUIDELINES tem ${bloco.length} caracteres e o teto de api/ai.js é ${TETO}: ` +
  `${bloco.length - TETO} caracteres estão sendo CORTADOS EM SILÊNCIO de toda chamada de IA. ` +
  `O que se perde é o FIM do bloco.`);
ok(folga >= MARGEM,
  `⚠️ só restam ${folga} caracteres até o corte de ${TETO} (mínimo exigido: ${MARGEM}). ` +
  `Não acrescente diretriz sem antes ampliar o teto em api/ai.js ou mover conteúdo para o nível PROFUNDO por subespecialidade.`);

// ── o sentinela do split tem de bater entre os dois arquivos ─────────────────
const sentIdx = (html.match(/__ENDODIRECT_SYS_SPLIT_[a-z0-9]+__/) || [])[0];
const sentAi = (ai.match(/__ENDODIRECT_SYS_SPLIT_[a-z0-9]+__/) || [])[0];
ok(sentIdx && sentAi && sentIdx === sentAi,
  'o sentinela do split precisa ser idêntico em index.html e api/ai.js — senão o bloco inteiro vira "tail" e é cortado em 8000');

// ── a cauda também tem teto, e é bem menor ──────────────────────────────────
const mTail = ai.match(/parts\.slice\(1\)\.join\(''\)\.slice\(0,\s*(\d+)\)/);
ok(!!mTail, 'não achei o corte da cauda variável em api/ai.js');

if (falhas.length) {
  console.error('✗ teto do bloco clínico:');
  falhas.forEach((f) => console.error('  - ' + f));
  process.exit(1);
}
console.log(`✓ teto do bloco clínico: ${bloco.length}/${TETO} caracteres (${entradas} entradas, folga ${folga})`);
