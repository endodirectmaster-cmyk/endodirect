// Regressão: campo malformado NÃO pode derrubar o resumo inteiro.
//
// Em 10/08/2026 o professor clicou em "Fisiopatologia da Obesidade" e o capítulo
// simplesmente não abriu. Sem erro na tela, sem nada no F12, e o Ctrl+Shift+R não
// resolvia — o clique parecia morto. A causa: um script meu gravou o `pts` como
// STRING de JSON (`"[\"ponto um\", ...]"`) em vez de array, em 5 capítulos.
//
// O `dirCardHTML` testava `if(d.pts && d.pts.length)`. **String também tem
// `.length`** — então a checagem passava e o `.map()` seguinte estourava com
// `d.pts.map is not a function`, levando junto o card inteiro. O resto do arquivo
// já usava `Array.isArray`; eram três linhas que faltavam.
//
// A regra que este teste fixa: um campo com o tipo errado pode custar a SEÇÃO
// dele, nunca o resumo. O texto tem de continuar aparecendo.
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { JSDOM, VirtualConsole } = require('jsdom');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const falhas = [];
function ok(cond, msg) { if (!cond) falhas.push(msg); }

// O app inteiro vive num `(function(){'use strict'; ... })()`. Extrair função por
// contagem de chaves não funciona (chaves dentro de string e de regex). Desembrulho
// o IIFE: as declarações sobem para o escopo do contexto já na instanciação, mesmo
// que o corpo estoure adiante por falta das dependências de CDN.
const fonte = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)]
  .map((m) => m[1])
  .find((s) => s.includes('function dirCardHTML'))
  .replace(/^\s*\(function\(\)\{\s*/, '')
  .replace(/^\s*['"]use strict['"];\s*/, '')
  .replace(/\}\)\(\);?\s*$/, '');

const virtualConsole = new VirtualConsole();
virtualConsole.on('jsdomError', function () {});
const dom = new JSDOM('<body></body>', {
  url: 'https://www.endodirect.com.br/',
  runScripts: 'outside-only',
  virtualConsole,
});
const ctx = vm.createContext(dom.getInternalVMContext());
try { vm.runInContext(fonte, ctx); } catch (e) { /* dependências de CDN ausentes: esperado */ }

const dirCardHTML = vm.runInContext('typeof dirCardHTML==="function"?dirCardHTML:null', ctx);
ok(!!dirCardHTML, 'dirCardHTML precisa estar declarado no index.html');

if (dirCardHTML) {
  const base = {
    fonte: 'Vilar', ano: '2024', sub: 'Obesidade',
    tema: 'Fisiopatologia da Obesidade', titulo: 'Fisiopatologia da Obesidade',
    resumo: '## Balanço energético\n\n- O gasto de repouso depende da massa magra.\n',
  };
  function render(extra) {
    try { return { ok: true, html: dirCardHTML(Object.assign({}, base, extra), 0) }; }
    catch (e) { return { ok: false, erro: e.constructor.name + ': ' + e.message }; }
  }

  // 1) O caminho normal continua desenhando os pontos-chave.
  const bom = render({ pts: ['ponto um', 'ponto dois'] });
  ok(bom.ok, 'render normal não pode quebrar: ' + (bom.erro || ''));
  ok(bom.ok && /Pontos-chave/.test(bom.html) && /ponto um/.test(bom.html),
     'com `pts` array de verdade os pontos-chave têm de aparecer');

  // 2) ⚠️ O caso que derrubou o capítulo do professor.
  const strPts = render({ pts: '["ponto um", "ponto dois"]' });
  ok(strPts.ok,
     'REGRESSÃO 10/08: `pts` como STRING derrubou o card inteiro (' + (strPts.erro || '') + ')');
  ok(strPts.ok && /gasto de repouso depende da massa magra/.test(strPts.html),
     'com `pts` malformado o TEXTO do resumo tem de continuar aparecendo — perder a seção é aceitável, perder o capítulo não');
  ok(strPts.ok && !/Pontos-chave/.test(strPts.html),
     '`pts` malformado não pode fingir que tem pontos-chave: a seção é omitida');

  // 3) Os dois vizinhos que tinham a mesma checagem por truthiness.
  const strFig = render({ figuras: '[{"url":"x"}]' });
  ok(strFig.ok, '`figuras` como STRING não pode derrubar o card (' + (strFig.erro || '') + ')');
  const strFlx = render({ fluxogramas: '[{"titulo":"x"}]' });
  ok(strFlx.ok, '`fluxogramas` como STRING não pode derrubar o card (' + (strFlx.erro || '') + ')');

  // 4) E os tipos errados mais comuns de um JSON vindo torto.
  [['número', 42], ['objeto', { 0: 'a' }], ['booleano', true], ['nulo', null]].forEach(function (par) {
    const r = render({ pts: par[1] });
    ok(r.ok, '`pts` como ' + par[0] + ' não pode derrubar o card (' + (r.erro || '') + ')');
  });
}

if (falhas.length) {
  console.error('✗ resumo com campo malformado:');
  falhas.forEach((f) => console.error('  - ' + f));
  process.exit(1);
}
console.log('✓ campo malformado custa a seção, não o resumo: `pts`/`figuras`/`fluxogramas` fora do tipo não derrubam o capítulo');
