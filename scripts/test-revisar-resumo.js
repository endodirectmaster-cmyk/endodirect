#!/usr/bin/env node
// "📖 REVISAR NO RESUMO" AO ERRAR (27/11/2026).
//
// Professor: "Faz a 1, 5, 6 e 10." A sugestão 1: ao errar uma questão no Banco ou no Simulado,
// um botão "📖 Revisar no Resumo" leva ao capítulo dos Resumos que trata do assunto.
//
// 🧨 Os modos de quebrar isto em silêncio:
//  - o botão aparecer na questão CERTA ou na ANULADA (só faz sentido no erro);
//  - o capítulo ser de OUTRA subespecialidade, ou o de título parecido mas assunto errado;
//  - o botão aparecer para quem não vê os Resumos (degustação vencida, por exemplo);
//  - o botão aparecer com um capítulo qualquer quando nada casa (melhor não mostrar);
//  - área do banco com nome diferente do Resumo ("Básica") nunca achar capítulo;
//  - o clique não abrir o capítulo (o botão fica dentro da questão, que tem clique próprio);
//  - no Simulado, a questão deixada em branco ficar sem o botão.
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const raiz = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(raiz, 'index.html'), 'utf8');
let bad = 0;
const ok = (n, c) => { if (!c) { bad++; console.log('  ✗ ' + n); } };
function corpo(nome) {
  const i = html.indexOf('function ' + nome + '(');
  if (i < 0) return '';
  let j = html.indexOf('{', i), n = 0;
  for (; j < html.length; j++) { if (html[j] === '{') n++; else if (html[j] === '}') { n--; if (!n) break; } }
  return html.slice(i, j + 1);
}
function linha(re) { const m = html.match(re); return m ? m[0] : ''; }

// ── 1. A escolha do capítulo ────────────────────────────────────────────────────────────
const cap = (sub, ti, txt) => ({ t: 'resumo', ti, sub, txt, ref: { sub, tema: ti, tipo: 'capitulo', priv: true } });
const itens = [
  cap('Tireoide', 'Doença de Graves (Hipertireoidismo)', 'A doença de Graves é causada pelo TRAb que estimula o receptor do TSH. O tratamento usa metimazol, iodo radioativo ou tireoidectomia. O metimazol é a droga de escolha; propiltiouracil no primeiro trimestre da gestação. Agranulocitose é efeito raro do metimazol. Tireoide difusa e bócio.'),
  cap('Tireoide', 'Nódulo Tireoidiano (TI-RADS e Bethesda)', 'Todo nódulo da tireoide é avaliado por ultrassonografia com TI-RADS; a punção aspirativa (PAAF) segue o tamanho e a classificação. O laudo citológico usa Bethesda, de I a VI. Nódulo Bethesda III pede repetir a punção ou teste molecular. Tireoide e TSH.'),
  cap('Tireoide', 'Hipotireoidismo', 'O hipotireoidismo primário tem TSH alto e T4 livre baixo; a causa mais comum é a tireoidite de Hashimoto, com anti-TPO positivo. A levotiroxina é tomada em jejum. Tireoide e TSH no seguimento.'),
  cap('Tireoide', 'Tireoidites', 'Tireoidite subaguda dolorosa após infecção viral, com VHS alta e captação baixa; tireoidite pós-parto; tireoidite silenciosa. Tireoide e TSH.'),
  cap('Tireoide', 'Carcinoma Diferenciado de Tireoide', 'Carcinoma papilífero e folicular: tireoidectomia, estadiamento, tireoglobulina e radioiodo conforme o risco de recidiva. Tireoide e TSH.'),
  cap('Tireoide', 'Tireoide e Gestação', 'Na gestação, o TSH tem alvo por trimestre; a levotiroxina sobe 25 a 30% ao confirmar a gravidez. Hipertireoidismo gestacional transitório pelo hCG. Tireoide.'),
  cap('Endocrinologia Básica', 'Receptores Hormonais', 'Receptores de membrana acoplados à proteína G e receptores nucleares. Segundo mensageiro AMP cíclico. Hormônios esteroides atravessam a membrana.'),
  cap('Endocrinologia Básica', 'Eixos Hipotálamo-Hipófise', 'Retroalimentação negativa entre hipotálamo, hipófise e glândula-alvo; CRH, ACTH, TRH e GnRH.'),
  cap('Endocrinologia Básica', 'Métodos de Dosagem Hormonal', 'Imunoensaio, espectrometria de massas, efeito gancho e interferência por biotina e anticorpos heterófilos.'),
  cap('Endocrinologia Básica', 'Ritmo Circadiano dos Hormônios', 'O cortisol tem pico matinal; o núcleo supraquiasmático comanda o ritmo. Melatonina à noite.'),
  { t: 'questao', ti: 'x', sub: 'Tireoide', txt: 'metimazol metimazol metimazol', q: 0 },
];
const ctx = {
  console, Math, Object, String, Array, JSON, Number, parseInt, setTimeout: (f) => f(),
  diretrizes: [], buscaCache: { chave: 'k1' }, _abriu: null, _uso: [], _ver: true,
  canSeePanel: (id) => id === 'resu' && ctx._ver,
  esc: (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'),
  usoRegistrar: (x) => ctx._uso.push(x),
  buscaAbre: (ref, termos) => { ctx._abriu = { ref, termos }; },
};
ctx.buscaIndice = () => itens.map((x) => Object.assign({}, x, { n: ctx.estNorm(x.ti + ' ' + x.txt), nt: ctx.estNorm(x.ti) }));
vm.createContext(ctx);
const varLinha = linha(/var REVISA_AREA=\{[\s\S]*?\};\nvar REVISA_MIN=[^\n]*\n/);
ok('as constantes do recurso existem (REVISA_AREA, REVISA_MIN, revisaRefs)', /var REVISA_MIN=\d+,revisaCache=null,revisaRefs=\{\};/.test(varLinha));
vm.runInContext([corpo('estNorm'), varLinha, corpo('revisaPalavras'), corpo('revisaRadical'), corpo('revisaSub'),
  corpo('capituloParaQuestao'), corpo('revisaBotaoHTML'), corpo('revisaAbrir')].join('\n'), ctx);

const graves = { area: 'Tireoide', stem: 'Mulher de 30 anos com bócio difuso, TSH suprimido e TRAb positivo inicia metimazol. Três semanas depois tem febre e dor de garganta.', explanation: 'Agranulocitose é efeito raro do metimazol (e do propiltiouracil); suspender a droga e pedir hemograma. Na doença de Graves, as alternativas são o iodo radioativo e a tireoidectomia.' };
const r1 = ctx.capituloParaQuestao(graves);
ok('🧨 a questão de Graves leva ao capítulo de Graves', r1 && r1.titulo === 'Doença de Graves (Hipertireoidismo)');
ok('o capítulo vem com a referência que a busca abre (Resumos, capítulo, tema)', r1 && r1.ref.priv === true && r1.ref.tipo === 'capitulo' && r1.ref.tema === r1.titulo && r1.ref.sub === 'Tireoide');
ok('o termo para levar ao ponto do texto é uma palavra inteira que está no capítulo', r1 && r1.termo && ctx.estNorm(itens[0].txt).indexOf(r1.termo) >= 0);
const nodulo = { area: 'Tireoide', stem: 'Nódulo de 1,8 cm TI-RADS 4 com punção Bethesda III. Qual a conduta?', explanation: 'Bethesda III: repetir a PAAF ou teste molecular.' };
ok('🧨 a questão de nódulo leva ao capítulo de nódulo (não ao de Graves)', (ctx.capituloParaQuestao(nodulo) || {}).titulo === 'Nódulo Tireoidiano (TI-RADS e Bethesda)');
ok('🧨 área "Básica" do banco acha o capítulo de "Endocrinologia Básica"',
  (ctx.capituloParaQuestao({ area: 'Básica', stem: 'Sobre o ritmo circadiano do cortisol, com pico matinal, e o núcleo supraquiasmático, assinale.', explanation: 'O ritmo circadiano do cortisol é comandado pelo núcleo supraquiasmático; a melatonina sobe à noite.' }) || {}).titulo === 'Ritmo Circadiano dos Hormônios');
ok('🧨 sem capítulo na subespecialidade, nada (não usa capítulo de outra área)', ctx.capituloParaQuestao({ area: 'Adrenal', stem: 'metimazol TRAb Graves', explanation: '' }) === null);
ok('🧨 quando nada casa de verdade, nada (não chuta um capítulo qualquer)', ctx.capituloParaQuestao({ area: 'Tireoide', stem: 'Qual alternativa abaixo está correta sobre este caso clínico?', explanation: '' }) === null);
ok('questão sem enunciado ou sem área: nada', ctx.capituloParaQuestao({ area: 'Tireoide' }) === null && ctx.capituloParaQuestao({ stem: 'metimazol' }) === null && ctx.capituloParaQuestao(null) === null);
ok('flashcard e questão do índice da busca não contam como capítulo', ctx.revisaSub('Tireoide').caps.length === 6);
ok('o índice da subespecialidade é guardado (o 2º erro não refaz)', ctx.revisaSub('Tireoide') === ctx.revisaSub('Tireoide'));

// ── 2. O botão e o clique ───────────────────────────────────────────────────────────────
const b = ctx.revisaBotaoHTML('gen:7', graves);
ok('o botão diz "📖 Revisar no Resumo" e o nome do capítulo', /^<button type="button" class="btn btn-outline btn-sm q-revisa" data-revisa="gen:7">📖 Revisar no Resumo <span class="q-revisa-cap">Doença de Graves \(Hipertireoidismo\)<\/span><\/button>$/.test(b));
ctx.revisaAbrir('gen:7');
ok('🧨 o clique abre o capítulo pela busca, no termo da questão', ctx._abriu && ctx._abriu.ref.tema === 'Doença de Graves (Hipertireoidismo)' && ctx._abriu.termos.length === 1 && ctx._abriu.termos[0] === r1.termo);
ok('o uso é contado no Analytics (revisar_resumo)', ctx._uso[0] === 'revisar_resumo' && /revisar_resumo:'Revisar no Resumo \(após errar questão\)'/.test(html));
ctx._abriu = null; ctx.revisaAbrir('inexistente');
ok('chave desconhecida não abre nada', ctx._abriu === null);
ctx._ver = false;
ok('🧨 quem não vê os Resumos não recebe o botão', ctx.revisaBotaoHTML('gen:8', graves) === '');
ctx._ver = true;
ok('sem capítulo, sem botão', ctx.revisaBotaoHTML('gen:9', { area: 'Adrenal', stem: 'x', explanation: '' }) === '');

// ── 3. Banco: o botão só no erro (marcaResposta de verdade, com DOM falso) ───────────────
const fb = { innerHTML: '', querySelector: function (s) { return s === '.q-revisa' && this.innerHTML.indexOf('q-revisa') >= 0 ? {} : null; } };
ctx.document = { querySelectorAll: () => [], getElementById: (id) => (id === 'qfb-gen-3' ? fb : null) };
vm.runInContext(corpo('marcaResposta'), ctx);
fb.innerHTML = ''; ctx.marcaResposta('B', 'C', 'comentário', 'gen', 3, graves);
ok('🧨 errou no Banco: aparece o botão, depois do comentário', /✗ Incorreto — Gabarito: C[\s\S]*<\/div><button type="button" class="btn btn-outline btn-sm q-revisa" data-revisa="gen:3">/.test(fb.innerHTML));
ok('o botão aparece uma vez só', fb.innerHTML.split('q-revisa"').length === 2);
fb.innerHTML = ''; ctx.marcaResposta('C', 'C', 'comentário', 'gen', 3, graves);
ok('🧨 acertou: sem botão', /✓ Correto!/.test(fb.innerHTML) && fb.innerHTML.indexOf('q-revisa') < 0);
fb.innerHTML = ''; ctx.marcaResposta('B', '', 'comentário', 'gen', 3, graves);
ok('🧨 anulada: sem botão', /anulada/.test(fb.innerHTML) && fb.innerHTML.indexOf('q-revisa') < 0);
const mr = corpo('marcaResposta');
ok('o cálculo vem um instante depois (setTimeout), para não atrasar a marcação', /if\(!ok&&q\)setTimeout\(function\(\)\{/.test(mr));

// ── 4. Simulado: lugar do botão em cada questão errada ou em branco ─────────────────────
const sf = corpo('submitSF');
ok('🧨 Simulado: cada questão não certa (errada ou em branco) ganha o lugar do botão', /\(!ok\?'<div class="sf-revisa" data-sf-revisa="'\+i\+'"><\/div>':''\)/.test(sf));
ok('🧨 Simulado: os lugares são preenchidos depois de o relatório estar na tela',
  /innerHTML=fbPontualHTML\(\)\+html;\n  fbPontualLigar\(\);\n  var sfQs=sfState\.qs;\n  setTimeout\(function\(\)\{\n    document\.querySelectorAll\('#sf-report-content \[data-sf-revisa\]'\)\.forEach\(function\(el\)\{\n      var i=\+el\.getAttribute\('data-sf-revisa'\);el\.innerHTML=revisaBotaoHTML\('sf:'\+i,sfQs\[i\]\);/.test(sf));

// ── 5. Clique e aparência ───────────────────────────────────────────────────────────────
const iClick = html.indexOf("var rvr=c('[data-revisa]');"), iRow = html.indexOf("var qrow=c('.q-row');");
ok('🧨 o clique no botão é tratado antes do clique da questão', iClick > 0 && iRow > iClick && iRow - iClick < 200
  && /if\(rvr\)\{revisaAbrir\(rvr\.getAttribute\('data-revisa'\)\);return;\}/.test(html.slice(iClick, iRow)));
ok('o botão tem estilo próprio (quebra a linha no celular) e o lugar vazio do Simulado não ocupa espaço',
  /\.q-revisa\{display:inline-flex;flex-wrap:wrap;/.test(html) && /\.q-revisa-cap\{/.test(html) && /\.sf-revisa:not\(:empty\)\{/.test(html));

if (bad) { console.log(`\n${bad} verificação(ões) do "Revisar no Resumo" falharam.`); process.exit(1); }
console.log('Revisar no Resumo: ok');
