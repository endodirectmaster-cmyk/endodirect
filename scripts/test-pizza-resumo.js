// Regressão do bloco {pizza:} no corpo do resumo.
//
// O editor do resumo é WYSIWYG: o corpo é um contenteditable com o markdown já
// renderizado (mdToHtml) e, ao Salvar, htmlToMd converte de volta. Todo bloco
// que não seja markdown puro precisa de uma MARCA que o htmlToMd saiba desfazer
// — é por isso que as imagens carregam `wys-img`. Sem esse par, a PRIMEIRA
// edição do resumo come o gráfico, e some sem erro nenhum: o professor salva um
// ajuste de texto e o gráfico simplesmente não volta.
//
// Este teste roda o mdToHtml/htmlToMd REAIS do index.html num DOM (jsdom) e
// cobre os dois lados: o desenho e a sobrevivência ao round-trip do editor.
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { JSDOM, VirtualConsole } = require('jsdom');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const falhas = [];
function ok(cond, msg) { if (!cond) falhas.push(msg); }

// O app inteiro vive dentro de um `(function(){'use strict'; ... })()`. Contar
// chaves para extrair só o mdToHtml não funciona (há chaves dentro de string e
// de regex — a extração ingênua morre com "Unexpected end of input"). Então
// desembrulho o IIFE e o 'use strict': aí as declarações de função sobem para o
// escopo do contexto já na instanciação, mesmo que o corpo quebre adiante por
// falta das dependências de CDN (supabase, hls, tus), que aqui não existem.
function fontesDoApp() {
  const bloco = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)]
    .map((m) => m[1])
    .find((s) => s.includes('function mdToHtml'));
  if (!bloco) throw new Error('não achei o <script> que define mdToHtml');
  return bloco
    .replace(/^\s*\(function\(\)\{\s*/, '')
    .replace(/^\s*['"]use strict['"];\s*/, '')
    .replace(/\}\)\(\);?\s*$/, '');
}

// O app registra um DOMContentLoaded que monta a tela inteira; num <body> vazio
// ele estoura depois das asserções. Isso é ESPERADO (só quero as duas funções de
// markdown), então o erro do jsdom é engolido de propósito — sem isso o teste
// passa cuspindo um stack trace, e teste que grita à toa vira paisagem.
const virtualConsole = new VirtualConsole();
virtualConsole.on('jsdomError', function () {});
const dom = new JSDOM('<body></body>', {
  url: 'https://www.endodirect.com.br/',
  runScripts: 'outside-only', // só o código que ESTE teste injeta; nada do HTML roda
  virtualConsole,
});
const ctx = vm.createContext(dom.getInternalVMContext());
try { vm.runInContext(fontesDoApp(), ctx); } catch (e) { /* dependências de CDN ausentes: esperado */ }

const mdToHtml = vm.runInContext('typeof mdToHtml==="function"?mdToHtml:null', ctx);
const htmlToMd = vm.runInContext('typeof htmlToMd==="function"?htmlToMd:null', ctx);
ok(!!mdToHtml, 'mdToHtml precisa estar declarado no index.html');
ok(!!htmlToMd, 'htmlToMd precisa estar declarado no index.html');

if (mdToHtml && htmlToMd) {
  const BLOCO = '{pizza: Metabolismo basal (60–75%) 70, Atividade física (15–30%) 20, Termogênese alimentar (~10%) 10}';
  const MD = '## Balanço e gasto energético\n\n'
    + '- Componentes do gasto: **metabolismo basal 60–75%** + atividade física 15–30%.\n'
    + '- O **principal determinante do gasto de repouso é a massa magra**.\n\n'
    + BLOCO + '\n\n## Microbiota e sono\n';

  const out = mdToHtml(MD);
  const div = dom.window.document.createElement('div');
  div.innerHTML = out;

  ok(!!div.querySelector('svg'), 'o bloco {pizza:} tem de virar SVG, não texto solto');
  ok(div.querySelectorAll('svg path').length === 3,
     'três fatias declaradas têm de virar três fatias desenhadas');

  // O rótulo carrega a FAIXA publicada e a fatia usa um valor representativo: o
  // ÚLTIMO número é o peso, o resto é rótulo.
  //
  // ⚠️ Com o percentual fora da legenda, o texto não prova mais qual número o
  // parser leu. Então o caso abaixo é montado para discriminar: os rótulos dizem
  // 90% e 10%, e os pesos dizem o CONTRÁRIO (10 e 90). Se o parser voltar a pegar
  // o primeiro número, a fatia grande troca de lado — e o large-arc-flag do
  // caminho (1 = mais de meia volta) acusa.
  {
    const h = mdToHtml('{pizza: Fatia A (90%) 10, Fatia B (10%) 90}');
    const d2 = dom.window.document.createElement('div');
    d2.innerHTML = h;
    const paths = [...d2.querySelectorAll('svg path')].map((p) => p.getAttribute('d'));
    // "A R R 0 <grande> 1" — o 5º campo do comando de arco
    const grande = paths.map((d) => (/A\d+ \d+ 0 (\d)/.exec(d) || [])[1]);
    ok(paths.length === 2, 'duas fatias declaradas, duas desenhadas');
    ok(grande[0] === '0' && grande[1] === '1',
       'o PESO é o último número: com "(90%) 10" e "(10%) 90" a fatia grande tem de ser a SEGUNDA (veio: ' + JSON.stringify(grande) + ')');
  }

  const leg = [...div.querySelectorAll('.pz-leg li')].map((li) => li.textContent);
  ok(leg.length === 3, 'a legenda tem de nomear as três fatias');
  ok(leg.some((t) => /60–75%/.test(t)),
     'o rótulo tem de manter a FAIXA da fonte (60–75%)');

  // ⚠️ A legenda NÃO mostra o percentual calculado (pedido do professor em
  // 10/08/2026): "70%" ao lado de "(60–75%)" dava à conta uma precisão que a
  // fonte não dá. O peso segue existindo — só para desenhar a fatia.
  ok(!div.querySelector('.pz-val') && !leg.some((t) => /\b70\s*%/.test(t)),
     'a legenda não pode exibir o percentual calculado da fatia, só o rótulo');

  // A lista de bullets acima não pode ser partida em duas pelo bloco.
  const listas = div.querySelectorAll('ul:not(.pz-leg)');
  ok(listas.length === 1 && listas[0].children.length === 2,
     'o bloco não pode quebrar a lista de bullets vizinha em duas');

  // ⚠️ O teste que importa: sobreviver ao editor. htmlToMd recebe o NÓ do
  // contenteditable (não uma string) e tem de devolver o {pizza:} intacto.
  const volta = htmlToMd(div);
  ok(/\{pizza:/.test(volta),
     'REGRESSÃO: o editor WYSIWYG comeu o gráfico — htmlToMd não devolveu o bloco {pizza:}');
  const antes = MD.match(/\{pizza:[^}]*\}/)[0];
  const depois = (volta.match(/\{pizza:[^}]*\}/) || [''])[0];
  ok(antes === depois,
     'o bloco tem de voltar IDÊNTICO do editor (veio: ' + JSON.stringify(depois.slice(0, 80)) + ')');

  // E o segundo render tem de ser igual ao primeiro (round-trip estável).
  ok(mdToHtml(volta) === out,
     'render → editor → render tem de ser estável, senão o gráfico muda a cada salvamento');
}

if (falhas.length) {
  console.error('✗ gráfico de pizza no resumo:');
  falhas.forEach((f) => console.error('  - ' + f));
  process.exit(1);
}
console.log('✓ gráfico de pizza: desenha 3 fatias, mantém a faixa da fonte e sobrevive ao editor WYSIWYG');
