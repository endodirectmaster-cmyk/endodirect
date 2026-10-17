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
// oficial e o escape; (5) a fiação do painel do professor e o app do aluno fechado
// por enquanto (chave BULARIO_ALUNOS, 17/10/2026); (6) a faixa de preço (17/10/2026):
// preço de fábrica a preço máximo ao consumidor, com o de fábrica sempre abaixo;
// (7) as fichas por princípio ativo (bulario-fichas.json, protótipo de 17/10/2026, no
// modelo de bula por seções que o professor mandou).
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
  // (6) Preço de fábrica (a[5], desde 17/10/2026). A CMED dá PF a toda apresentação e PMC
  // a toda que não é de uso hospitalar; o PMC sai do PF por um fator de 1,34 a 1,38.
  // PF acima do PMC, ou longe desse fator, é coluna trocada ou lida errada.
  const aprs = P.flatMap((p) => p[9] || []);
  ok(aprs.every((a) => Array.isArray(a) && a.length === 6 && typeof a[5] === 'number'), '(6) apresentação sem o preço de fábrica (6º campo)');
  const comPf = aprs.filter((a) => a[5] > 0).length;
  ok(comPf >= 0.95 * aprs.length, '(6) poucas apresentações com preço de fábrica: ' + comPf + ' de ' + aprs.length);
  const foraFator = aprs.filter((a) => a[1] > 0 && a[5] > 0 && !(a[1] / a[5] >= 1.2 && a[1] / a[5] <= 1.6));
  ok(foraFator.length <= 5, '(6) preço de fábrica fora da proporção esperada do teto (PF trocado com PMC?): ' + foraFator.length + ', ex. ' + JSON.stringify(foraFator.slice(0, 2)));
  ok(aprs.filter((a) => a[3] && !(a[1] > 0)).every((a) => a[5] > 0) || aprs.filter((a) => a[3] && !(a[1] > 0) && !(a[5] > 0)).length <= 5, '(6) uso hospitalar sem nenhum preço');
  // (2) referências
  const acha = (re) => P.find((p) => re.test(p[0]));
  const gx = acha(/^Glifage XR$/);
  ok(gx && /metformina/.test(gx[1]) && gx[9].length >= 2 && gx[9].some((a) => a[1] > 0 && a[4] === 1), '(2) Glifage XR sem apresentações à venda com preço');
  ok(gx && gx[9].every((a) => a[5] > 0 && a[5] < a[1]), '(6) Glifage XR sem preço de fábrica abaixo do teto');
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
['esc', 'bulaNorm', 'bulaLinkOficial', 'bulaPreco', 'bulaFaixa', 'bulaTitSec', 'bulaBases', 'bulaFichaDe', 'bulaFichaHTML', 'bulaVenc', 'bulaDetalheHTML', 'bulaRank', 'bulaFiltrar'].forEach((n) => vm.runInContext(corpo(n), ctx));
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
ok(/target="_blank" rel="noopener noreferrer">📄 Bula do profissional e do paciente ↗<\/a>/.test(corpo('bulaDetalheHTML')) && /href="'\+esc\(bulaLinkOficial\(p\[0\]\)\)\+'"/.test(corpo('bulaDetalheHTML')), '(4) o botão da bula oficial não abre em aba nova, não escapa o endereço ou não diz que leva à bula do profissional');
// (6) Faixa de preço na tela. O espaço entre "R$" e o valor é o do toLocaleString do
// próprio app (bulaPreco); o teste compara com a mesma função.
const R = (v) => ctx.bulaPreco(v);
ok(ctx.bulaFaixa(['x', 1314.37, 0, 0, 1, 979.8]) === R(979.8) + ' a ' + R(1314.37) && /^R\$ 979,80 a R\$ 1\.314,37$/.test(ctx.bulaFaixa(['x', 1314.37, 0, 0, 1, 979.8])), '(6) faixa do Ozivy 3 mL (PF 979,80; PMC 1.314,37): ' + ctx.bulaFaixa(['x', 1314.37, 0, 0, 1, 979.8]));
ok(ctx.bulaFaixa(['x', 1314.37, 0, 0, 1]) === 'até ' + R(1314.37), '(6) arquivo antigo, sem preço de fábrica: tem de mostrar "até" o teto, e não "undefined"');
ok(ctx.bulaFaixa(['x', 0, 0, 1, 1, 250.5]) === R(250.5) + ' de fábrica', '(6) uso hospitalar (só PF): ' + ctx.bulaFaixa(['x', 0, 0, 1, 1, 250.5]));
ok(ctx.bulaFaixa(['x', 0, 0, 0, 0, 0]) === '—', '(6) sem preço nenhum tem de mostrar travessão');
ok(/<span class="bula-apr-preco">'\+bulaFaixa\(a\)\+'<\/span>/.test(corpo('bulaDetalheHTML')) && /do preço de fábrica ao máximo ao consumidor/.test(corpo('bulaDetalheHTML')), '(6) a apresentação não mostra a faixa, ou o título não diz o que é cada valor');
ok(/O primeiro valor é o preço de fábrica/.test(corpo('bulaDetalheHTML')) && /genérico pode sair abaixo/.test(corpo('bulaDetalheHTML')), '(6) a nota não explica a faixa (fábrica, teto, genérico abaixo)');
ok(/'<span class="bula-nome">'\+esc\(p\[0\]\)\+'<\/span>'/.test(corpo('bulaItemHTML')), '(4) o nome do medicamento não sai escapado');
// (7) Fichas por princípio ativo. O texto é nosso (a bula é do fabricante); a ficha vale
// para todos os produtos do mesmo princípio ativo, depois de tirar sal e hidratação.
let FX = null;
try { FX = JSON.parse(fs.readFileSync(path.join(raiz, 'bulario-fichas.json'), 'utf8')); } catch (e) { falhas.push('(7) bulario-fichas.json ausente ou inválido: ' + e.message); }
const SECOES = vm.runInContext('BULA_SECOES.map(function(s){return s[0];})', ctx);
ok(JSON.stringify(SECOES) === JSON.stringify(['indicacao', 'mecanismo', 'resultados', 'uso', 'contraindicacoes', 'precaucoes', 'adversas', 'interacoes', 'populacoes', 'superdose']), '(7) seções da ficha fora da ordem combinada: ' + SECOES.join(', '));
const bases = (pa) => JSON.stringify(vm.runInContext('bulaBases(' + JSON.stringify(pa) + ')', ctx));
ok(bases('cloridrato de sibutramina monoidratado') === '["sibutramina"]', '(7) sal e hidratação não saíram: ' + bases('cloridrato de sibutramina monoidratado'));
ok(bases('cloridrato de sibutramina, cloridrato de sibutramina monoidratado') === '["sibutramina"]', '(7) o mesmo princípio ativo em dois sais virou associação');
ok(bases('cloridrato de bupropiona, cloridrato de naltrexona di-hidratado') === '["bupropiona","naltrexona"]', '(7) associação não separou os princípios ativos: ' + bases('cloridrato de bupropiona, cloridrato de naltrexona di-hidratado'));
ok(bases('levotiroxina sódica') === '["levotiroxina"]' && bases('fosfato de sitagliptina monoidratado') === '["sitagliptina"]', '(7) sal com acento ou fosfato não saiu');
const tit = (t, f) => vm.runInContext('bulaTitSec(' + JSON.stringify(t) + ',' + JSON.stringify(f) + ')', ctx);
ok(tit('Quando %o %n é contraindicad%o?', { nome: 'sibutramina', artigo: 'a' }) === 'Quando a sibutramina é contraindicada?' && tit('Quando %o %n é contraindicad%o?', { nome: 'orlistate', artigo: 'o' }) === 'Quando o orlistate é contraindicado?', '(7) concordância do título com o artigo da ficha');
ok(tit('Quais as reações adversas %d %n?', { nome: 'orlistate', artigo: 'o' }) === 'Quais as reações adversas do orlistate?', '(7) contração "do/da" no título');
// Montagem: seções na ordem combinada (não na do arquivo), texto escapado, rascunho avisado.
ctx.mdToHtml = (m) => '<p>' + ctx.esc(m) + '</p>';
const montada = vm.runInContext('bulaFichaHTML(' + JSON.stringify({ nome: 'teste', artigo: 'o', status: 'rascunho', fonte: 'Fonte <img src=x onerror=alert(1)>', secoes: { uso: 'Dose <b>x</b>', indicacao: 'Serve <script>alert(1)</script>', inexistente: 'não aparece' } }) + ',[["apresentacoes","Apresentações e preços","<ul class=\\"a\\"></ul>"],["vazio","Vazio",""]])', ctx);
ok(!/<img|<script|<b>/.test(montada), '(7) texto da ficha ou da fonte entrou sem escape');
ok(montada.indexOf('data-bula-sec="indicacao"') < montada.indexOf('data-bula-sec="uso"') && !/inexistente|não aparece/.test(montada), '(7) seções fora da ordem combinada ou seção desconhecida exibida');
ok(/data-bula-ir="apresentacoes"/.test(montada) && !/data-bula-ir="vazio"/.test(montada), '(7) bloco extra sem conteúdo ganhou atalho, ou o de apresentações não ganhou');
ok(/class="bula-rascunho"/.test(montada) && !/class="bula-rascunho"/.test(vm.runInContext('bulaFichaHTML({nome:"t",artigo:"o",status:"aprovada",secoes:{uso:"x"}},[])', ctx)), '(7) o aviso de rascunho não segue o status da ficha');
ok(/<div class="bula-nav-vaga"><\/div><nav class="bula-nav"/.test(montada), '(7) a barra perdeu a vaga que segura a altura quando ela fica fixa no celular');
if (FX && d) {
  ok(FX.meta && FX.meta.v === 1 && FX.fichas && typeof FX.fichas === 'object', '(7) bulario-fichas.json sem meta.v = 1 ou sem fichas');
  ctx.BULA.fichas = FX.fichas;
  for (const [k, f] of Object.entries(FX.fichas || {})) {
    ok(bases(k) === JSON.stringify([k]), '(7) chave "' + k + '" não é o princípio ativo limpo (' + bases(k) + ')');
    ok(f.nome && (f.artigo === 'a' || f.artigo === 'o') && (f.status === 'rascunho' || f.status === 'aprovada') && typeof f.fonte === 'string' && f.fonte.length > 20, '(7) ficha "' + k + '" sem nome, artigo, status ou fonte');
    const sec = Object.keys(f.secoes || {});
    ok(sec.length >= 5 && sec.every((x) => SECOES.includes(x) && typeof f.secoes[x] === 'string' && f.secoes[x].trim()), '(7) ficha "' + k + '" com seção desconhecida ou vazia: ' + sec.join(', '));
    ok(sec.every((x) => !/<[a-z\/]/i.test(f.secoes[x])), '(7) ficha "' + k + '" com HTML no texto (o texto é markdown)');
    const prods = d.p.filter((p) => vm.runInContext('bulaFichaDe(' + JSON.stringify(p) + ')', ctx) === null ? false : vm.runInContext('bulaFichaDe(' + JSON.stringify(p) + ').nome', ctx) === f.nome);
    ok(prods.length >= 1, '(7) a ficha "' + k + '" não casa com nenhum produto do Bulário');
    if (k === 'sibutramina') ok(prods.length >= 10 && prods.some((p) => p[0] === 'Biomag'), '(7) a ficha da sibutramina devia valer para o Biomag e os genéricos: ' + prods.length);
  }
  const gx = d.p.find((p) => p[0] === 'Glifage XR');
  ok(gx && vm.runInContext('bulaFichaDe(' + JSON.stringify(gx) + ')', ctx) === null, '(7) Glifage XR ganhou ficha sem haver ficha de metformina');
  // Associação: mesmo com ficha de um dos componentes (aqui, uma de teste da bupropiona),
  // o produto não herda a ficha; o detalhe só aponta que ela existe.
  const assoc = d.p.find((p) => /bupropiona/.test(p[1]) && /naltrexona/.test(p[1]));
  ctx.BULA.fichas = Object.assign({}, FX.fichas, { bupropiona: Object.assign({}, FX.fichas.sibutramina, { nome: 'bupropiona' }) });
  ok(assoc && vm.runInContext('bulaFichaDe(' + JSON.stringify(assoc) + ')', ctx) === null, '(7) associação ganhou a ficha de um dos componentes como se fosse dela');
  const detAssoc = assoc ? vm.runInContext('bulaDetalheHTML(' + JSON.stringify(assoc) + ')', ctx) : '';
  ok(/Associação\. Há ficha de <strong>bupropiona<\/strong>/.test(detAssoc) && !/bula-nav/.test(detAssoc), '(7) a associação não aponta a ficha do componente, ou abriu a ficha dele');
  ctx.BULA.fichas = FX.fichas;
}
ok(/var f=bulaFichaDe\(p\);\s*if\(f\)return '<div class="bula-det">'\+bulaFichaHTML\(f,/.test(corpo('bulaDetalheHTML')), '(7) o detalhe do produto não usa a ficha quando ela existe');
ok(/fetch\('bulario-fichas\.json'\)[\s\S]{0,260}\.catch\(function\(\)\{BULA\.fichas=null;\}\)/.test(corpo('bulaCarregar')), '(7) falha ao carregar as fichas tem de deixar o Bulário funcionando, sem ficha');
ok(/mdToHtml\(f\.secoes\[s\[0\]\]\)/.test(corpo('bulaFichaHTML')) && /esc\(f\.fonte\)/.test(corpo('bulaFichaHTML')), '(7) a ficha precisa passar o texto pelo mdToHtml (que escapa) e a fonte pelo esc');
// (5) fiação
ok(/<button class="sb-item" data-p="bula" id="sb-bula" style="display:none">💊 Bulário<\/button>/.test(SRC) && /<div class="panel" id="panel-bula">/.test(SRC), '(5) o painel do aluno saiu do corpo, ou o item do menu não nasce escondido');
// 17/10/2026, pedido do professor: "não libera o bulário para os alunos; apenas por enquanto para
// os professores". A chave BULARIO_ALUNOS governa o item do menu e o desvio no goPanel.
ok(/var BULARIO_ALUNOS=false;/.test(SRC), '(5) o Bulário voltou para os alunos sem o professor pedir (17/10: só professores, por enquanto)');
ok(/if\(id==='bula'&&!BULARIO_ALUNOS\)id='dash';/.test(corpo('goPanel')), '(5) goPanel não desvia o aluno do Bulário fechado (link ou último painel salvo)');
ok(/getElementById\('sb-bula'\);if\(b&&BULARIO_ALUNOS\)b\.style\.display='';/.test(SRC), '(5) a chave não religa o item do menu');
ok(/<button class="adm-nav" data-asec="bula">💊 Bulário<\/button>/.test(SRC) && /else if\(sec==='bula'\)m\.innerHTML=admBulaHTML\(\);/.test(SRC) && /if\(sec==='bula'\)\{ initBulario\(main\.querySelector\('\.bula-raiz'\)\); \}/.test(SRC), '(5) o painel do professor não está ligado');
ok(/if\(id==='bula'\)initBulario\(\);/.test(SRC), '(5) goPanel não inicia o bulário');
ok(/support:1,calc:1,bula:1,/.test(SRC), '(5) o bulário saiu da degustação (mesmo acesso das calculadoras)');
ok(/fetch\('bulario\.json'\)/.test(corpo('bulaCarregar')) && /BULA\.erro=/.test(corpo('bulaCarregar')), '(5) o carregamento não avisa a falha de rede');

if (falhas.length) { console.error('test-bulario: ' + falhas.length + ' falha(s)'); falhas.forEach((f) => console.error('  ✗ ' + f)); process.exit(1); }
console.log('test-bulario: ok (' + (d ? d.p.length + ' produtos; ' : '') + 'busca sem acento por nome, princípio ativo e fabricante; áreas; faixa de preço de fábrica ao teto; fichas por princípio ativo; link da bula oficial; painéis ligados)');
