// Regressão: busca única (pedido do professor, 17/11/2026: "Uma caixa que procura ao mesmo tempo em
// Resumos, Diretrizes, artigos, flashcards e questões").
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const falhas = [];
function ok(cond, msg) { if (!cond) falhas.push(msg); }
function corpo(nome) {
  const i = html.indexOf('\nfunction ' + nome + '(');
  if (i < 0) throw new Error('função ' + nome + ' não encontrada');
  let d = 0;
  for (let j = html.indexOf('{', i); j < html.length; j++) {
    if (html[j] === '{') d++;
    else if (html[j] === '}') { d--; if (!d) return html.slice(i, j + 1); }
  }
  throw new Error('não fechou ' + nome);
}
const ctx = vm.createContext({});
vm.runInContext(`
  var diretrizes=[
    {sub:'Tireoide',tema:'Hipotireoidismo',privado:true,resumo:'## Diagnóstico\\nO **TSH** elevado com T4 livre normal define o hipotireoidismo subclínico.',pts:['Levotiroxina em dose plena']},
    {sub:'Tireoide',tema:'TRUST (2017)',privado:true,tipo:'artigo',resumo:'Levotiroxina no hipotireoidismo subclínico do idoso não melhorou sintomas.',pts:[]},
    {sub:'Tireoide',tema:'Rascunho de Tireoide',privado:true,rascunho:true,resumo:'hipotireoidismo escondido'},
    {sub:'Tireoide',tema:'Diretriz ATA de hipotireoidismo',privado:false,resumo:'Recomendações sobre hipotireoidismo.'},
    {sub:'Adrenal',tema:'Feocromocitoma',privado:true,resumo:'Metanefrinas plasmáticas.'}
  ];
  var provasDB=[{stem:'Paciente com TSH 7 e T4 livre normal. Qual a conduta no hipotireoidismo subclínico?',options:{A:'Observar',B:'Levotiroxina'},answer:'A',explanation:'No idoso, observar.',area:'Tireoide'},{stem:'Questão sobre outra coisa',options:['A) x'],answer:'A',area:'Adrenal'}];
  var DB={fc:[{front:'Hipotireoidismo subclínico: definição?',back:'TSH alto com T4 livre normal.',sub:'Tireoide'}]};
  function esc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
  function dirIsRascunho(d){return !!(d&&d.rascunho);}
  function dirTipoOf(d){return (d&&d.tipo==='artigo')?'artigo':'capitulo';}
  function dirTemaOf(d){return d.tema;}
  function estSubDe(d){return String((d&&d.sub)||'Geral').trim()||'Geral';}
  function subOf(c){return c.sub||'Geral';}
`, ctx);
const ini = html.indexOf('var buscaCache=null');
ok(ini > 0, 'o bloco da busca sumiu');
vm.runInContext(html.slice(ini, html.indexOf('\nfunction buscaPlano(')) + ['estNorm', 'buscaPlano', 'buscaOpcoes', 'buscaIndice', 'buscaRodar', 'buscaRealce', 'buscaTrecho', 'buscaItemHTML', 'buscaResultadosHTML'].map(corpo).join('\n'), ctx);
const run = (c) => vm.runInContext(c, ctx);
const R = JSON.parse(run('JSON.stringify((function(){var r=buscaRodar("hipotireoidismo subclinico");var o={};Object.keys(r.res).forEach(function(k){o[k]=r.res[k].map(function(x){return x.x.ti;});});return o;})())'));
ok(R.resumo.length === 1 && R.resumo[0] === 'Hipotireoidismo', 'capítulo dos Resumos, sem acento, todas as palavras: ' + JSON.stringify(R.resumo));
ok(R.artigo.length === 1 && R.artigo[0] === 'TRUST (2017)', 'artigo: ' + JSON.stringify(R.artigo));
ok(R.diretriz.length === 0, 'a diretriz pública não tem "subclínico": ' + JSON.stringify(R.diretriz));
ok(R.flash.length === 1 && R.questao.length === 1, 'flashcard e questão encontrados: ' + JSON.stringify([R.flash, R.questao]));
ok(JSON.stringify(R).indexOf('Rascunho') < 0, 'rascunho nunca aparece na busca');
const R2 = JSON.parse(run('JSON.stringify(buscaRodar("HIPOTIREOIDISMO").res.diretriz.map(function(x){return x.x.ti;}))'));
ok(R2.length === 1 && /Diretriz ATA/.test(R2[0]), 'diretriz pública aparece no grupo Diretrizes, sem diferença de maiúsculas: ' + JSON.stringify(R2));
const ordem = JSON.parse(run('JSON.stringify(buscaRodar("hipotireoidismo").res.resumo.map(function(x){return x.x.ti;}))'));
ok(ordem[0] === 'Hipotireoidismo', 'o termo no título vem primeiro: ' + JSON.stringify(ordem));
ok(run('buscaRodar("a")') === null, 'menos de 2 letras não busca');
ok(run('buscaRealce("O TSH elevado",["tsh"])') === 'O <mark>TSH</mark> elevado', 'o termo é realçado no trecho');
ok(/<mark>subclínico<\/mark>/.test(run('buscaRealce("hipotireoidismo subclínico",["subclinico"])')), 'realce funciona com acento no texto e sem acento na busca');
ok(run('JSON.stringify(buscaOpcoes({options:["A) x","B) y"]}))') === '[["A","x"],["B","y"]]', 'alternativas em lista também funcionam');
const h = run('buscaResultadosHTML("hipotireoidismo subclinico")');
ok(/📚 Capítulos dos Resumos/.test(h) && /🔬 Artigos/.test(h) && /🃏 Flashcards/.test(h) && /❓ Questões/.test(h) && /4 resultados/.test(h), 'grupos e total na tela: ' + h.slice(0, 300));
ok(/data-busca-ir="resumo:0"/.test(h) && /data-busca-tog="questao:0"/.test(h), 'capítulo abre; questão expande ali mesmo');
ok(!/\*\*|##/.test(h), 'markdown cru no trecho');
run('buscaAbertos={"questao:0":true,"flash:0":true}');
const h2 = run('buscaResultadosHTML("hipotireoidismo subclinico")');
ok(/class="certa"><span class="busca-l">A<\/span> Observar <b>✓ gabarito<\/b>/.test(h2) && /<span class="busca-l">B<\/span> Levotiroxina/.test(h2) && /No idoso, observar\./.test(h2), 'questão aberta mostra alternativas, gabarito e comentário: ' + h2.slice(h2.indexOf('busca-alts'), h2.indexOf('busca-alts') + 300));
ok(/TSH alto com T4 livre normal\./.test(h2) && /data-busca-fc="0"/.test(h2), 'flashcard aberto mostra o verso e o caminho para o tema');
ok(/Nada encontrado/.test(run('buscaResultadosHTML("zzzz yyyy")')), 'sem resultado, diz isso');
// fiação
ok(/id="btn-busca"/.test(html) && /getElementById\('btn-busca'\)\.addEventListener\('click',abrirBusca\)/.test(html), 'falta o botão 🔍 no topo ou o clique');
ok(/renderDiretrizesInto\(root\)/.test(corpo('buscaAbre')) && /goPanel\(ref\.priv\?'resu':'ref'\)/.test(corpo('buscaAbre')), 'abrir o resultado não leva ao capítulo certo');
ok(/\.busca-topo input\{[^}]*font-size:16px/.test(html), 'o campo de busca precisa de 16 px (senão o iPhone dá zoom)');

if (falhas.length) {
  console.error('✗ busca única:');
  falhas.forEach((f) => console.error('  - ' + f));
  process.exit(1);
}
console.log('✓ busca única: Resumos, artigos, Diretrizes, flashcards e questões, sem acento, sem rascunho, com realce e abertura no ponto');
