// Regressão: mapa mental não pode aparecer VAZIO por causa do formato do `data`.
//
// Em 10/08/2026 seis mapas publicados (`mm_shared`) estavam com o `data` gravado
// como STRING de JSON em vez de objeto. O `normalizeMMData` fazia `data=data||{}`
// — string é truthy, então passava adiante como string, `data.root` e
// `data.branches` davam `undefined`, e a função devolvia um mapa em branco com o
// título genérico **"Tema"**. Sem erro, sem aviso: 30 ramos e 107 folhas
// invisíveis no ar, e ninguém tinha notado.
//
// Perder conteúdo em silêncio é pior que quebrar — pelo menos quebrar avisa.
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { JSDOM, VirtualConsole } = require('jsdom');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const falhas = [];
function ok(cond, msg) { if (!cond) falhas.push(msg); }

const fonte = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)]
  .map((m) => m[1])
  .find((s) => s.includes('function normalizeMMData'))
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

const normalizeMMData = vm.runInContext('typeof normalizeMMData==="function"?normalizeMMData:null', ctx);
ok(!!normalizeMMData, 'normalizeMMData precisa estar declarado no index.html');

if (normalizeMMData) {
  const mapa = {
    root: 'Hipotireoidismo',
    branches: [
      { label: 'Diagnóstico', leaves: ['TSH elevado', 'T4 livre baixo'] },
      { label: 'Tratamento', leaves: ['Levotiroxina em jejum'] },
    ],
  };

  const comObjeto = normalizeMMData(mapa);
  ok(comObjeto.root === 'Hipotireoidismo' && comObjeto.branches.length === 2,
     'o caminho normal (objeto) tem de continuar funcionando');

  // ⚠️ O caso que deixou seis mapas em branco no ar.
  const comString = normalizeMMData(JSON.stringify(mapa));
  ok(comString.root === 'Hipotireoidismo',
     'REGRESSÃO 10/08: `data` como STRING de JSON tem de ser lido, não virar o mapa genérico "Tema" (veio: ' + JSON.stringify(comString.root) + ')');
  ok(comString.branches.length === 2,
     '`data` como STRING não pode perder os ramos (veio ' + comString.branches.length + ')');
  ok(comString.branches[0] && comString.branches[0].leaves.length === 2,
     '`data` como STRING não pode perder as folhas dos ramos');

  // String que NÃO é JSON não pode explodir — degrada para o mapa vazio.
  const lixo = normalizeMMData('isto não é json {{{');
  ok(lixo && lixo.root && Array.isArray(lixo.branches),
     'string inválida degrada para mapa vazio, sem lançar');

  // E os vazios de sempre seguem tolerados.
  [null, undefined, 0, false, []].forEach(function (v) {
    let r = null;
    try { r = normalizeMMData(v); } catch (e) { /* cai na asserção abaixo */ }
    ok(r && Array.isArray(r.branches), 'normalizeMMData(' + JSON.stringify(v) + ') não pode lançar');
  });
}

if (falhas.length) {
  console.error('✗ forma do mapa mental:');
  falhas.forEach((f) => console.error('  - ' + f));
  process.exit(1);
}
console.log('✓ mapa mental: `data` como string de JSON é lido em vez de virar mapa vazio "Tema"');
