// BULÁRIO (16/10/2026): o arquivo de dados e a tela.
//
// Pedido do professor: "ferramenta de Bulário atualizada na plataforma, se possível
// de todas as medicações disponíveis no Brasil". O arquivo bulario.json é refeito
// toda semana por .github/workflows/bulario.yml, que roda ESTE teste antes de gravar:
// um formato novo da ANVISA ou da CMED que quebre a leitura não chega aos alunos.
//
// 🧨 O QUE ESTE TESTE PRENDE: (1) o arquivo tem o formato e o volume esperados
// (milhares de produtos, apresentações com preço, endocrinologia separada por área);
// (2) medicamentos de referência estão lá com o que importa (Glifage XR com
// apresentações e preço, levotiroxina na Tireoide, semaglutida no Diabetes);
// (3) a busca do app (sem acento, por nome, princípio ativo ou fabricante) acha e
// ordena certo, e sem busca nem área não lista os 12 mil; (4) o link da bula
// oficial e o escape; (5) a fiação do painel no app do aluno e no do professor.
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const raiz = path.join(__dirname, '..');
const falhas = [];
const ok = (c, m) => { if (!c) falhas.push(m); };

// (1) arquivo
let d = null, bruto = '';
try { bruto = fs.readFileSync(path.join(raiz, 'bulario.json'), 'utf8'); d = JSON.parse(bruto); } catch (e) { falhas.push('(1) bulario.json ausente ou inválido: ' + e.message); }
// (1b) Codificação. O CSV da ANVISA é Windows-1252; na 1ª atualização semanal (16/10)
// o Node 20 do GitHub leu travessão e apóstrofo como caractere de controle invisível
// ("D’orto" virou "Dorto"). A leitura agora usa tabela própria, e o arquivo não passa
// com caractere de controle.
const { decodificar1252 } = require('./bulario/construir.js');
ok(decodificar1252(Buffer.from([0x44, 0x92, 0x6f, 0x20, 0x96, 0x20, 0xe9, 0x81])) === 'D\u2019o \u2013 \u00e9', '(1b) leitura do CSV: 0x92, 0x96 e 0xE9 deveriam virar ’, – e é');
ok(!/[\u0080-\u009f]/.test(bruto), '(1b) bulario.json com caractere de controle (U+0080 a U+009F) no lugar de travessão ou apóstrofo');
if (d) {
  const t = d.tab, P = d.p;
  ok(d.meta && d.meta.v === 1 && /^\d{4}-\d{2}-\d{2}$/.test(d.meta.gerado || ''), '(1) meta sem versão ou data');
  ok(Array.isArray(P) && P.length >= 8000, '(1) poucos produtos: ' + (P && P.length));
  const nApr = P.reduce((s, p) => s + (p[9] || []).length, 0);
  ok(nApr >= 15000, '(1) poucas apresentações: ' + nApr);
  ok(P.filter((p) => (p[9] || []).some((a) => a[1] > 0)).length >= 5000, '(1) poucos produtos com preço');
  ok(t && Array.isArray(t.area) && t.area.length === 8 && t.area[0] === 'Diabetes', '(1) tabela de áreas fora do esperado');
  const porArea = {}; P.forEach((p) => { if (p[7] >= 0) porArea[t.area[p[7]]] = (porArea[t.area[p[7]]] || 0) + 1; });
  ['Diabetes', 'Lípides', 'Tireoide', 'Osso e cálcio', 'Hormônios sexuais'].forEach((a) => ok((porArea[a] || 0) >= 5, '(1) área ' + a + ' quase vazia: ' + (porArea[a] || 0)));
  ok(P.every((p) => Array.isArray(p) && p.length === 10 && typeof p[0] === 'string' && Array.isArray(p[9])), '(1) produto fora do formato de 10 campos');
  // (2) referências
  const acha = (re) => P.find((p) => re.test(p[0]));
  const gx = acha(/^Glifage XR$/);
  ok(gx && /metformina/.test(gx[1]) && gx[9].length >= 2 && gx[9].some((a) => a[1] > 0 && a[4] === 1), '(2) Glifage XR sem apresentações à venda com preço');
  ok(P.some((p) => /levotiroxina/.test(p[1]) && t.area[p[7]] === 'Tireoide'), '(2) levotiroxina fora da área Tireoide');
  ok(P.some((p) => /semaglutida/.test(p[1]) && t.area[p[7]] === 'Diabetes'), '(2) semaglutida fora da área Diabetes');
  ok(P.some((p) => /atorvastatina|rosuvastatina/.test(p[1]) && t.area[p[7]] === 'Lípides'), '(2) estatina fora da área Lípides');
  ok(!P.some((p) => /\b(Xr|S\/a|Ltda\.?\s*$)/.test(p[0])), '(2) capitalização quebrou sigla em nome de produto');
}

// (3)–(5) código do app
const SRC = fs.readFileSync(path.join(raiz, 'index.html'), 'utf8');
function corpo(nome) {
  const i = SRC.indexOf('\nfunction ' + nome + '(');
  if (i < 0) throw new Error('função não encontrada: ' + nome);
  const f = SRC.indexOf('\nfunction ', i + 1);
  return SRC.slice(i + 1, f < 0 ? SRC.length : f);
}
const ctx = vm.createContext({});
vm.runInContext("var BULA={d:null,carregando:false,erro:'',q:'',area:-1,aberto:-1,lim:40,root:null,idx:null};", ctx);
['esc', 'bulaNorm', 'bulaLinkOficial', 'bulaRank', 'bulaFiltrar'].forEach((n) => vm.runInContext(corpo(n), ctx));
if (d) {
  ctx.__d = d;
  vm.runInContext("BULA.d=__d;BULA.idx=__d.p.map(function(p){return bulaNorm(p[0]+' '+p[1]+' '+(__d.tab.emp[p[4]]||''));});", ctx);
  const busca = (q, area) => { ctx.BULA.q = q; ctx.BULA.area = area == null ? -1 : area; return vm.runInContext('bulaFiltrar()', ctx).map((i) => d.p[i]); };
  ok(busca('', -1).length === 0, '(3) sem busca e sem área, a lista tem de vir vazia (não os 12 mil)');
  const met = busca('METFÓRMINA');
  ok(met.length >= 10 && met.every((p) => /metformina/i.test(p[0] + ' ' + p[1])), '(3) busca sem acento e sem caixa falhou para metformina');
  const gl = busca('glifage xr');
  ok(gl.length >= 1 && gl[0][0] === 'Glifage XR', '(3) "glifage xr" não veio em primeiro: ' + (gl[0] || [])[0]);
  const ozi = busca('ozempic');
  ok(ozi.length >= 1 && /^Ozempic/.test(ozi[0][0]), '(3) busca por nome comercial (Ozempic) falhou');
  const nn = busca('novo nordisk');
  ok(nn.length >= 3, '(3) busca pelo fabricante falhou');
  const tir = busca('', d.tab.area.indexOf('Tireoide'));
  ok(tir.length >= 5 && tir.every((p) => d.tab.area[p[7]] === 'Tireoide'), '(3) filtro de área sem busca falhou');
  // Ordem: nome que começa com a busca vem antes do que só tem o princípio ativo.
  // Em ordem alfabética pura, Euthyrox viria antes de Levotiroxina Sódica.
  const lev = busca('levotiroxina');
  ok(lev.length >= 3 && /^Levotiroxina/.test(lev[0][0]) && lev.some((p) => !/^Levotiroxina/.test(p[0])), '(3) a busca não pôs o nome que começa com o termo em primeiro: ' + lev.slice(0, 3).map((p) => p[0]).join(', '));
}
// (4) link e escape
ok(ctx.bulaLinkOficial('Glifage XR') === 'https://consultas.anvisa.gov.br/#/bulario/q/?nomeProduto=GLIFAGE%20XR', '(4) link da bula oficial: ' + ctx.bulaLinkOficial('Glifage XR'));
ok(/target="_blank" rel="noopener noreferrer">📄 Bula oficial na ANVISA ↗<\/a>/.test(corpo('bulaDetalheHTML')) && /href="'\+esc\(bulaLinkOficial\(p\[0\]\)\)\+'"/.test(corpo('bulaDetalheHTML')), '(4) o botão da bula oficial não abre em aba nova ou não escapa o endereço');
ok(/'<span class="bula-nome">'\+esc\(p\[0\]\)\+'<\/span>'/.test(corpo('bulaItemHTML')), '(4) o nome do medicamento não sai escapado');
// (5) fiação
ok(/<button class="sb-item" data-p="bula">💊 Bulário<\/button>/.test(SRC) && /<div class="panel" id="panel-bula">/.test(SRC), '(5) o painel do aluno não está no menu ou no corpo');
ok(/<button class="adm-nav" data-asec="bula">💊 Bulário<\/button>/.test(SRC) && /else if\(sec==='bula'\)m\.innerHTML=admBulaHTML\(\);/.test(SRC) && /if\(sec==='bula'\)\{ initBulario\(main\.querySelector\('\.bula-raiz'\)\); \}/.test(SRC), '(5) o painel do professor não está ligado');
ok(/if\(id==='bula'\)initBulario\(\);/.test(SRC), '(5) goPanel não inicia o bulário');
ok(/support:1,calc:1,bula:1,/.test(SRC), '(5) o bulário saiu da degustação (mesmo acesso das calculadoras)');
ok(/fetch\('bulario\.json'\)/.test(corpo('bulaCarregar')) && /BULA\.erro=/.test(corpo('bulaCarregar')), '(5) o carregamento não avisa a falha de rede');

if (falhas.length) { console.error('test-bulario: ' + falhas.length + ' falha(s)'); falhas.forEach((f) => console.error('  ✗ ' + f)); process.exit(1); }
console.log('test-bulario: ok (' + (d ? d.p.length + ' produtos; ' : '') + 'busca sem acento por nome, princípio ativo e fabricante; áreas; link da bula oficial; painéis ligados)');
