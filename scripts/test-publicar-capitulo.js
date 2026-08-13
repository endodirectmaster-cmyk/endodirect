// Regressão: o botão "📢 Publicar" não pode voltar aos cards de Resumos, e o selo
// do item privado não pode voltar a dizer que ele está escondido.
//
// O QUE ACONTECEU (2026-08-13). O card do capítulo mostrava "🔒 Resumo privado" e,
// ao lado, "📢 Publicar". O professor perguntou: "esses resumos já estão disponíveis
// para os alunos, certo? Se sim, não tem sentido esse botão de publicar."
//
// Ele estava certo nas DUAS pontas:
//   1. `privado` NUNCA significou "escondido". Significa "vive na aba Resumos, dos
//      assinantes". A RPC `endodirect_member_resumos` entrega os itens privados a
//      quem tem o escopo `plano` — ou seja, o capítulo JÁ ESTÁ NO AR. O cadeado
//      mentia, e um comentário no próprio index.html (em admRefMode) ainda dizia
//      "os alunos nunca recebem itens privados", o que também está errado.
//   2. O botão não publicava nada: MOVIA o capítulo para a aba Diretrizes — que é
//      destino de recomendação de sociedade, não de capítulo de estudo. Publicar
//      tirava o capítulo de onde o assinante o procura. Era o estado errado a um
//      clique de distância, exatamente como já tinha acontecido com os ARTIGOS em
//      2026-08-01.
//
// Este teste falha se qualquer uma das duas voltar.
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { JSDOM, VirtualConsole } = require('jsdom');

const raiz = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(raiz, 'index.html'), 'utf8');
const falhas = [];
const ok = (cond, msg) => { if (!cond) falhas.push(msg); };

// ⚠️ COMENTÁRIO NÃO É CÓDIGO. Este arquivo e o próprio index.html EXPLICAM o botão
// removido citando o texto dele; procurar a string no arquivo inteiro casaria com a
// explicação e o teste ficaria vermelho para sempre. Mede-se só o código.
const codigo = html.split('\n').filter((l) => !/^\s*\/\//.test(l)).join('\n');

// ── 1. o botão não existe mais ──────────────────────────────────────────────
ok(!/data-adm-reftoggle/.test(codigo),
  '⚠️ VOLTOU o atributo data-adm-reftoggle: o botão que move capítulo para as Diretrizes foi reintroduzido');
ok(!/>\s*📢 Publicar\s*</.test(codigo),
  '⚠️ VOLTOU o botão "📢 Publicar" nos cards de Resumos — ele MOVE o capítulo para as Diretrizes e o tira da aba dos assinantes');
ok(!/admReftoggle/.test(codigo),
  '⚠️ VOLTOU o handler admReftoggle — handler órfão é armadilha: basta um data-attr num template para o estado errado voltar a ser alcançável');

// ── 2. o selo diz a verdade ─────────────────────────────────────────────────
// Não basta "não dizer privado": tem de DIZER onde o item aparece. Guarda que só
// proíbe a palavra antiga aceita um selo vazio.
ok(/📗 Resumo · no ar para assinantes/.test(codigo),
  '⚠️ o selo do item privado não diz mais que ele está NO AR para os assinantes — sem isso o cadeado volta a sugerir que o aluno não vê');
ok(!/🔒 Resumo privado/.test(codigo),
  '⚠️ VOLTOU o selo "🔒 Resumo privado": `privado` significa "aba Resumos, dos assinantes", e o cadeado faz o professor achar que o capítulo está escondido');

// ── 3. a transição que DEVE continuar existindo ─────────────────────────────
// Rascunho → Resumos é real (rascunho é de fato invisível ao aluno). Se este some,
// não há mais como tirar um capítulo da curadoria.
ok(/data-adm-refliberar/.test(codigo) && /👁 Liberar para os alunos/.test(codigo),
  '⚠️ sumiu o botão "Liberar para os alunos" — sem ele o rascunho fica preso na curadoria para sempre');

// ── 4. comportamento: o filtro de artigo não pode engolir as Diretrizes reais ──
// ⚠️ A tentação, ao remover o botão do capítulo, é estender dirSoNosResumos() para
// 'capitulo' — "se capítulo não vai para Diretrizes, filtra". Isso APAGARIA as 65
// diretrizes verdadeiras (ABESO, AASLD, ATA…), que também são do tipo 'capitulo' e
// vivem justamente na aba Diretrizes. Este bloco roda as funções de verdade.
const fonte = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)]
  .map((m) => m[1])
  .find((s) => s.includes('function dirSoNosResumos'))
  .replace(/^\s*\(function\(\)\{\s*/, '')
  .replace(/^\s*['"]use strict['"];\s*/, '')
  .replace(/\}\)\(\);?\s*$/, '');
const vc = new VirtualConsole();
vc.on('jsdomError', function () {});
const dom = new JSDOM('<body></body>', { url: 'https://www.endodirect.com.br/', runScripts: 'outside-only', virtualConsole: vc });
const ctx = vm.createContext(dom.getInternalVMContext());
try { vm.runInContext(fonte, ctx); } catch (e) { /* dependências de CDN ausentes: esperado */ }
const soResumos = vm.runInContext('typeof dirSoNosResumos==="function"?dirSoNosResumos:null', ctx);
const isVisible = vm.runInContext('typeof dirIsVisible==="function"?dirIsVisible:null', ctx);
ok(!!soResumos && !!isVisible, 'não consegui extrair dirSoNosResumos/dirIsVisible do index.html');

if (soResumos && isVisible) {
  ok(soResumos({ tipo: 'artigo' }) === true, 'artigo tem de continuar fora da aba Diretrizes');
  ok(soResumos({ tipo: 'capitulo' }) === false,
    '⚠️ dirSoNosResumos passou a barrar CAPÍTULO — isso apaga as 65 diretrizes reais da aba Diretrizes, que também são do tipo capitulo');
  ok(soResumos({}) === false, 'item sem `tipo` conta como capítulo e não pode ser barrado');

  // A diretriz de verdade (sem `privado`) aparece na aba Diretrizes…
  vm.runInContext('refPrivadoMode=false;', ctx);
  ok(isVisible({ fonte: 'Diretriz ABESO' }) === true,
    '⚠️ uma diretriz pública sumiu da aba Diretrizes');
  ok(isVisible({ privado: true }) === false, 'capítulo de assinante não pode vazar para a aba Diretrizes');
  // …e o capítulo privado aparece na aba Resumos.
  vm.runInContext('refPrivadoMode=true;refTipoSel="capitulo";', ctx);
  ok(isVisible({ privado: true }) === true,
    '⚠️ o capítulo dos assinantes sumiu da aba Resumos — é exatamente onde ele deve estar');
  ok(isVisible({ privado: true, rascunho: true }) === false, 'rascunho não pode chegar ao aluno');
}

if (falhas.length) {
  console.error('✗ publicar/capítulo:');
  falhas.forEach((f) => console.error('  - ' + f));
  process.exit(1);
}
console.log('✓ publicar/capítulo: botão removido, selo diz "no ar para assinantes", Liberar preservado e as diretrizes reais seguem visíveis');
