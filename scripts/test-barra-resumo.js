// Regressão do bloco {barra:} no corpo do resumo.
//
// Barra é para COMPARAÇÃO entre categorias independentes ("redução de mortalidade
// 29%, de DM2 83%, de AVC 34%") — dado que não soma 100 e que em pizza viraria
// uma fração inventada de um todo que não existe. Quase todo dado clínico é assim.
//
// ⚠️ A ARMADILHA DESTE RENDERIZADOR É A VÍRGULA. Em português ela separa itens e
// TAMBÉM é o separador decimal: "Semaglutida 2,4 mg" partido na vírgula vira dois
// itens, com o rótulo destruído e o número errado. Por isso o bloco aceita `;`
// quando o rótulo precisa de vírgula — e é isso que este teste guarda primeiro.
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { JSDOM, VirtualConsole } = require('jsdom');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const falhas = [];
function ok(cond, msg) { if (!cond) falhas.push(msg); }

const fonte = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)]
  .map((m) => m[1])
  .find((s) => s.includes('function barraHTML'))
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

const mdToHtml = vm.runInContext('typeof mdToHtml==="function"?mdToHtml:null', ctx);
const htmlToMd = vm.runInContext('typeof htmlToMd==="function"?htmlToMd:null', ctx);
ok(!!mdToHtml && !!htmlToMd, 'mdToHtml e htmlToMd precisam estar declarados no index.html');

function render(md) {
  const d = dom.window.document.createElement('div');
  d.innerHTML = mdToHtml(md + '\n');
  return d;
}
const rots = (d) => [...d.querySelectorAll('.br-rot')].map((x) => x.textContent);
const vals = (d) => [...d.querySelectorAll('.br-val')].map((x) => x.textContent);
const largs = (d) => [...d.querySelectorAll('.br-barra')]
  .map((x) => +(/width:(\d+)%/.exec(x.getAttribute('style') || '') || [])[1]);

if (mdToHtml && htmlToMd) {
  // ⚠️ O caso da vírgula decimal: separador `;`, rótulo com vírgula intacto.
  {
    const BLOCO = '{barra: Tirzepatida (SURMOUNT) −20%; Semaglutida 2,4 mg (STEP) −15%; Liraglutida 3,0 mg (SCALE) −8%}';
    const d = render(BLOCO);
    ok(d.querySelectorAll('.wys-barra').length === 1, 'o bloco {barra:} tem de virar gráfico, não texto solto');
    ok(rots(d).length === 3, 'três itens declarados, três barras (veio ' + rots(d).length + ')');
    ok(rots(d)[1] === 'Semaglutida 2,4 mg (STEP)',
       'REGRESSÃO: a vírgula DECIMAL do rótulo foi tratada como separador de item (veio: ' + JSON.stringify(rots(d)[1]) + ')');
    ok(vals(d)[0] === '−20%' && vals(d)[2] === '−8%',
       'o valor é impresso COMO ESCRITO, com o sinal (veio: ' + JSON.stringify(vals(d)) + ')');
    const L = largs(d);
    ok(L[0] === 100 && L[1] === 75 && L[2] === 40,
       'o comprimento usa o MÓDULO sobre o maior valor: 20/15/8 → 100/75/40 (veio: ' + JSON.stringify(L) + ')');

    // Round-trip do editor WYSIWYG: sem `data-barra`, a primeira edição come o gráfico.
    const volta = htmlToMd(render(BLOCO));
    ok(volta.trim() === BLOCO,
       'REGRESSÃO: o editor WYSIWYG comeu o gráfico de barras (veio: ' + JSON.stringify(volta.trim().slice(0, 90)) + ')');
  }

  // Sem `;` no bloco, a vírgula segue separando — o que já está publicado não pode quebrar.
  {
    const d = render('{barra: Mortalidade geral 29%, DM2 83%, AVC 34%}');
    ok(rots(d).length === 3 && rots(d)[0] === 'Mortalidade geral',
       'sem `;` no bloco a vírgula continua separando itens (compatibilidade)');
    ok(largs(d)[1] === 100, 'a maior barra é a do maior valor, não a da primeira posição');
  }

  // Barra minúscula não pode sumir e deixar um rótulo órfão sem desenho.
  {
    const d = render('{barra: Enorme 100%; Minúscula 0,4%}');
    ok(largs(d)[1] >= 2, 'valor muito pequeno mantém um piso visível de barra (veio: ' + JSON.stringify(largs(d)) + ')');
  }

  // Valor em FAIXA: mostra a faixa e desenha o meio dela. Forçar um ponto onde a
  // fonte deu intervalo é inventar precisão — foi o que saiu da legenda da pizza.
  {
    const d = render('{barra: Tirzepatida 20%; Naltrexona–bupropiona 5–8%}');
    ok(vals(d)[1] === '5–8%',
       'faixa tem de ser impressa COMO FAIXA, não reduzida a um número (veio: ' + JSON.stringify(vals(d)[1]) + ')');
    ok(largs(d)[1] === Math.round(6.5 / 20 * 100),
       'a barra da faixa usa o MEIO dela (6,5 de 20 → 33%) (veio: ' + largs(d)[1] + ')');
    ok(rots(d)[1] === 'Naltrexona–bupropiona',
       'o travessão do NOME do fármaco não pode ser confundido com faixa (veio: ' + JSON.stringify(rots(d)[1]) + ')');
  }

  // Lixo não pode explodir nem virar gráfico vazio: degrada para parágrafo.
  {
    const d = render('{barra: sem número nenhum aqui}');
    ok(!d.querySelector('.wys-barra'), 'bloco sem nenhum valor não vira gráfico vazio');
    ok((d.textContent || '').indexOf('sem número nenhum') >= 0, 'o texto original não pode sumir da tela');
  }
}

if (falhas.length) {
  console.error('✗ gráfico de barras no resumo:');
  falhas.forEach((f) => console.error('  - ' + f));
  process.exit(1);
}
console.log('✓ gráfico de barras: vírgula decimal no rótulo preservada, comprimento pelo módulo e round-trip do editor');
