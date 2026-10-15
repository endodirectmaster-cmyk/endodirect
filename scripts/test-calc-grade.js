// A GRADE DAS CALCULADORAS: layout, busca e teclado (14/10/2026).
//
// Pedido do professor, olhando a tela: "Melhora o layout pra deixar mais bonito
// e organizado". O que entrou: colunas que seguem a largura da tela (auto-fill,
// em vez de 3 cartões esticados), cartão com nome, descrição, a unidade do
// resultado e o convite "Abrir", régua ao lado do título de cada grupo, busca
// por nome ao lado das abas e acesso por teclado.
//
// 🧨 O QUE ESTE TESTE PRENDE: (1) as colunas por auto-fill, e o colapso em uma
// coluna no celular continua; (2) o cartão tem as três partes e a unidade (ou a
// marca de ferramenta oficial); (3) a busca existe, é sem acento e sem caixa, e
// esconde cartão e grupo sem redesenhar; (4) Enter e espaço abrem o cartão;
// (5) a mensagem de busca vazia; (6) o que já valia (classe de cor, data-calc,
// borda com fallback) segue valendo.
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const SRC = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const falhas = [];
const ok = (c, m) => { if (!c) falhas.push(m); };
function corpo(nome) {
  const i = SRC.indexOf('\nfunction ' + nome + '(');
  if (i < 0) throw new Error('função não encontrada: ' + nome);
  const f = SRC.indexOf('\nfunction ', i + 1);
  return SRC.slice(i + 1, f < 0 ? SRC.length : f);
}

// (1) colunas
ok(/\.calc-area-grid\{grid-column:1\/-1;display:grid;grid-template-columns:repeat\(auto-fill,minmax\(248px,1fr\)\);gap:12px;align-items:stretch\}/.test(SRC), '(1) a sub-grade não usa auto-fill com mínimo de 248px');
ok(/\.g2,\.g3,\.g4,\.calc-area-grid\{grid-template-columns:1fr\}/.test(SRC), '(1) o colapso em uma coluna no celular sumiu');
ok(/\.calc-area-tit::after\{content:'';flex:1 1 auto;height:1px;background:var\(--bd\)/.test(SRC), '(1) a régua ao lado do título do grupo sumiu');
ok(/\.calc-area-grid \.calc-card\{display:flex;flex-direction:column/.test(SRC) && /\.calc-card-ft\{margin-top:auto/.test(SRC), '(1) o cartão não é coluna flex com rodapé alinhado embaixo');

// (2) o cartão
const card = corpo('calcCardHTML');
ok(/class="card calc-card'\+meta\.card\+'" data-calc="'\+c\.id\+'" role="button" tabindex="0"/.test(card), '(2) o cartão perdeu a classe de cor, o data-calc ou o papel de botão');
ok(/class="calc-card-nm">'\+esc\(c\.name\)/.test(card) && /class="calc-card-ds">'\+esc\(c\.desc\)/.test(card), '(2) nome e descrição não estão nas partes do cartão');
ok(/c\.external\?'<span class="calc-unit calc-ext">Ferramenta oficial ↗<\/span>'/.test(card), '(2) a ferramenta externa não é marcada');
ok(/c\.unit\?'<span class="calc-unit" title="Resultado em '\+esc\(c\.unit\)\+'">'\+esc\(c\.unit\)\+'<\/span>'/.test(card), '(2) a unidade do resultado não aparece no cartão');
ok(/<span class="calc-go">Abrir →<\/span>/.test(card), '(2) o convite "Abrir" sumiu');
ok(/data-busca="'\+esc\(calcNormaliza\(c\.name\+' '\+c\.desc\+' '\+\(c\.area\|\|''\)\)\)\+'"/.test(card), '(2) o texto de busca do cartão não cobre nome, descrição e área');
ok(!/#[0-9a-f]{3}\b|#[0-9a-f]{6}\b/i.test(card), '(2) cor literal dentro do cartão: a cor vem de muralSubMeta');

// (3) busca
const grid = corpo('renderCalcGrid');
ok(/<input type="search" id="calc-busca" placeholder="Buscar calculadora"/.test(grid), '(3) o campo de busca sumiu da grade');
ok(/\.calc-busca input\[type=search\]\{width:100%;box-sizing:border-box;padding:\.5rem \.85rem \.5rem 2\.1rem/.test(SRC), '(3) a regra do campo de busca perdeu o [type=search]: a regra global de inputs volta a vencer e a lupa cobre o texto');
ok(/value="'\+esc\(calcBusca\)\+'"/.test(grid), '(3) a busca não sobrevive ao redesenho (trocar de aba apagaria o que foi digitado)');
ok(/campo\.addEventListener\('input',function\(\)\{calcBusca=campo\.value;calcAplicarBusca\(el\);\}\)/.test(grid), '(3) digitar não filtra, ou redesenha a grade (perderia o foco)');
ok(/calcAplicarBusca\(el\);\n\}/.test(grid), '(3) a busca não é aplicada ao desenhar a grade');
const ctx = vm.createContext({});
vm.runInContext(corpo('calcNormaliza'), ctx);
ok(ctx.calcNormaliza('Lípides — Na⁺ Corrigido') === 'lipides — na⁺ corrigido', '(3) a normalização não tira acento e caixa: ' + ctx.calcNormaliza('Lípides — Na⁺ Corrigido'));
const aplica = corpo('calcAplicarBusca');
ok(/card\.classList\.toggle\('calc-oculto',!ok\)/.test(aplica) && /g\.classList\.toggle\('calc-oculto',!vis\)/.test(aplica) && /tit\.classList\.toggle\('calc-oculto',!vis\)/.test(aplica), '(3) a busca não esconde cartão, grupo e título do grupo');
ok(/\.calc-oculto\{display:none!important\}/.test(SRC), '(3) a classe que esconde não vence o display da grade');

// (4) teclado
ok(/if\(e\.key==='Enter'\|\|e\.key===' '\)\{e\.preventDefault\(\);openCalc\(card\.getAttribute\('data-calc'\)\);\}/.test(grid), '(4) Enter e espaço não abrem o cartão');
ok(/\.calc-area-grid \.calc-card:focus-visible\{box-shadow:0 0 0 2px var\(--blue\)/.test(SRC), '(4) o foco por teclado não é visível');

// (5) busca vazia
ok(/<div class="calc-vazio">Nenhuma calculadora com esse nome\./.test(grid) && /vazio\.classList\.toggle\('calc-oculto',algum\)/.test(aplica), '(5) a mensagem de busca sem resultado sumiu');
ok(/\.calc-vazio\{grid-column:1\/-1/.test(SRC), '(5) a mensagem de busca vazia não ocupa a linha inteira da grade');

// (6) o que já valia
ok(/\.calc-card\{border-left:3px solid var\(--bd2\)\}/.test(SRC), '(6) a borda do cartão com fallback neutro sumiu');
ok(/var meta=muralSubMeta\(a\);/.test(grid) && /calcCardHTML\(c,meta\)/.test(grid), '(6) o cartão deixou de receber a cor da subespecialidade');
ok(/\.calc-pills-wrap\{grid-column:1\/-1;min-width:0\}/.test(SRC) && /\.calc-pills-wrap\{display:flex;flex-wrap:wrap/.test(SRC) && /\.calc-pills\{flex:1 1 32rem;min-width:0\}/.test(SRC), '(6) a faixa das abas perdeu o min-width:0 (estourava a página no iPhone) ou deixou de ser linha flex com a busca');

if (falhas.length) { console.error('test-calc-grade: ' + falhas.length + ' falha(s)'); falhas.forEach((f) => console.error('  ✗ ' + f)); process.exit(1); }
console.log('test-calc-grade: ok (auto-fill, cartão com unidade e Abrir, busca sem acento que esconde sem redesenhar, Enter/espaço abrem, busca vazia avisa)');
