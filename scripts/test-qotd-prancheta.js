// A Questão do Dia na PRANCHETA e a aba "COMO O ALUNO VÊ" do professor (17/10/2026).
//
// Pedido do professor: "Deixe a questão do dia aparecendo no perfil do professor de
// forma semelhante como aparece para o aluno. Deixa uma aba ao lado de 'postados'" e
// "Vamos deixar mais didático a visualização da questão do dia", com a figura de uma
// prancheta (prendedor, folha branca, "Questão do dia", o caso).
//
// ⚠️ 11/11/2026: a PRANCHETA SAIU. O professor, com print do celular: "Deixando o formato
// anterior, sem esse desenho de fundo, pois ficou muito apertado o enunciado". Voltou o
// cartão simples de antes (fundo do tema, borda dourada, título dourado à esquerda). O
// resto ficou: pergunta em destaque, letras, gabarito com figura, aba do professor.
//
// O que este teste segura:
//   1. o cartão é SIMPLES (sem prendedor, sem madeira), com o caso e a PERGUNTA FINAL em
//      destaque — e nunca corta o enunciado no meio ("ex.", frase sem "?");
//   2. depois de responder: certa em verde, a marcada em vermelho, o resto apagado, e
//      o gabarito comentado na folha;
//   3. ⚠️ sem papel branco, o texto do cartão segue o TEMA (tinta fixa escura no fundo
//      escuro sumiria); só as caixas claras (alternativas, gabarito, figura) têm tinta fixa;
//   4. ⚠️ a aba do professor mostra só as publicadas, abre a de hoje e a resposta dele
//      é de TESTE: não toca em DB.qotd nem chama qotdSaveAns (senão ele entraria nas
//      estatísticas de quem respondeu);
//   5. a aba fica logo depois de "Postados".
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { JSDOM, VirtualConsole } = require('jsdom');

const raiz = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(raiz, 'index.html'), 'utf8');
const falhas = [];
const ok = (cond, msg) => { if (!cond) falhas.push(msg); };

const fonte = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((m) => m[1]).find((s) => s.includes('function renderAdmQotdAluno'));
ok(!!fonte, 'não achei renderAdmQotdAluno no index.html (a aba "Como o aluno vê" sumiu?)');
if (!fonte) { console.error('✗ prancheta da Questão do Dia:\n  - ' + falhas[0]); process.exit(1); }
const corpo = fonte.replace(/^\s*\(function\(\)\{\s*/, '').replace(/^\s*['"]use strict['"];\s*/, '').replace(/\}\)\(\);?\s*$/, '');
const vc = new VirtualConsole();
vc.on('jsdomError', function () {});
const dom = new JSDOM('<body><div id="adm-qotd-aluno"></div><div id="cartao"></div></body>', { url: 'https://www.endodirect.com.br/', runScripts: 'outside-only', virtualConsole: vc });
const ctx = vm.createContext(dom.getInternalVMContext());
try { vm.runInContext(corpo, ctx); } catch (e) { /* dependências de CDN ausentes: esperado */ }
const run = (c) => vm.runInContext(c, ctx);
const doc = dom.window.document;

// ── 1. caso + pergunta, sem nunca cortar no lugar errado ──────────────────────
const partes = (s) => JSON.parse(run('JSON.stringify(qotdPartes(' + JSON.stringify(s) + '))'));
{
  const p = partes('Mulher de 34 anos, com sarcoidose. Exames: cálcio total 11,8 mg/dL [VR 8,5–10,5]. TC de abdome: nefrocalcinose medular bilateral. Qual a melhor conduta inicial?');
  ok(p.perg === 'Qual a melhor conduta inicial?' && /bilateral\.$/.test(p.caso), 'o caso e a pergunta final não se separaram: ' + JSON.stringify(p));
  const ex = partes('Homem de 45 anos com bócio multinodular e TSH suprimido. Considerando o caso acima, qual a conduta (ex. iniciar metimazol)?');
  ok(ex.perg === '', '⚠️ cortou a pergunta no "ex." — o enunciado tinha de ir inteiro: ' + JSON.stringify(ex));
  const sem = partes('Paciente de 40 anos com TSH 8 mUI/L e T4 livre normal, assintomática. Assinale a alternativa correta.');
  ok(sem.perg === '', 'sem "?" no fim, o enunciado tinha de ir inteiro');
  const longa = partes('Homem de 40 anos com feocromocitoma bilateral e hemangioblastoma de cerebelo. Considerando o padrão de manifestações da síndrome de von Hippel-Lindau e a necessidade de vigilância ao longo da vida, qual complicação DEVE ser incluída no rastreio periódico por imagem deste paciente?');
  ok(longa.perg.length > 200, 'a pergunta final longa (203 caracteres, caso real do banco) não se separou');
}

// ── 2. o cartão simples, antes e depois de responder ─────────────────────────
const Q = { id: 'ig-3', status: 'posted', postedAt: 3, sub: 'Osteometabolismo', stem: 'Mulher de 34 anos, com sarcoidose pulmonar e cutânea, assintomática. TC de abdome: nefrocalcinose medular bilateral. Qual a melhor conduta inicial?', options: { A: 'Suspender vitamina D', B: 'Paratireoidectomia', C: 'Tiazídico', D: 'Pamidronato' }, answer: 'A', explanation: 'Hipercalcemia mediada por 1,25(OH)2D.' };
{
  doc.getElementById('cartao').innerHTML = run('qotdCardHTML(' + JSON.stringify(Q) + ',null)');
  const qp = doc.querySelector('#cartao .qp');
  ok(!!qp && !qp.querySelector('.qp-clip'), '⚠️ o prendedor da prancheta voltou (o professor pediu o cartão simples em 11/11/2026)');
  ok(qp && (qp.querySelector('.qp-tit') || {}).textContent === '🧠 Questão do Dia', 'o título do cartão não é "🧠 Questão do Dia" (o de antes da prancheta)');
  ok(qp && (qp.querySelector('.qp-perg') || {}).textContent === 'Qual a melhor conduta inicial?', 'a pergunta final não está em destaque na folha');
  ok(qp && qp.querySelectorAll('.qp-opt .qp-letra').length === 4, 'as 4 alternativas não vieram com a letra');
  ok(qp && ![...qp.querySelectorAll('[data-qotd-opt]')].some((b) => b.disabled), 'antes de responder, as alternativas não podem estar desativadas');
  ok(qp && qp.hasAttribute('data-fav-tit'), 'o cartão perdeu o data-fav-tit (a estrela de favorito depende dele)');

  doc.getElementById('cartao').innerHTML = run('qotdCardHTML(' + JSON.stringify(Q) + ',{letter:"C",ok:false})');
  const cls = [...doc.querySelectorAll('#cartao .qp-opt')].map((b) => b.className.replace('qp-opt', '').trim());
  ok(JSON.stringify(cls) === '["certa","apagada","errada","apagada"]', 'marcação errada depois de responder: ' + JSON.stringify(cls));
  const fb = doc.querySelector('#cartao .qp-fb');
  ok(fb && fb.classList.contains('err') && /Resposta correta: A/.test(fb.textContent) && /1,25\(OH\)2D/.test(fb.textContent), 'o gabarito comentado não apareceu no cartão');
  ok([...doc.querySelectorAll('#cartao [data-qotd-opt]')].every((b) => b.disabled), 'depois de responder, as alternativas têm de ficar desativadas');
}

// ── 3. ⚠️ o cartão segue o tema; as caixas claras têm tinta fixa ──────────────────
{
  const css = [...html.matchAll(/<style>([\s\S]*?)<\/style>/g)].map((m) => m[1]).join('\n');
  const regra = (sel) => { const m = css.match(new RegExp('(^|\\n)' + sel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\{([^}]*)\\}')); return m ? m[2] : ''; };
  ok(!/\.qp-clip/.test(css) && !/#c69c6d/.test(css), '⚠️ o desenho da prancheta (prendedor ou madeira) voltou ao CSS');
  ok(/background:var\(--surface\)/.test(regra('.qp')) && /border:1px solid var\(--gold\)/.test(regra('.qp')), 'o cartão não é o de antes (fundo do tema e borda dourada)');
  ['.qp-folha', '.qp-caso', '.qp-perg'].forEach((sel) => ok(/color:var\(--tx\)/.test(regra(sel)), '⚠️ ' + sel + ' com tinta fixa: no tema escuro o texto sumiria no fundo escuro'));
  ok(/color:var\(--gold\)/.test(regra('.qp-tit')), 'o título não é dourado como antes');
  // caixas claras: fundo claro fixo e tinta fixa escura (nada de var(--tx) dentro delas)
  [['.qp-opt', /background:#f8fafc/], ['.qp-fb.ok', /background:#ecfdf3/], ['.qp-fb.err', /background:#fef2f2/], ['.qp-expfig', /background:#fff/]].forEach(([sel, fundo]) =>
    ok(fundo.test(regra(sel)) && !/color:var\(--/.test(regra(sel)), sel + ': caixa clara com tinta do tema (no escuro, texto claro no fundo claro)'));
  ok(!/color:var\(--/.test(regra('.qp-fb')) && /color:#1f2937/.test(regra('.qp-fb')), 'o texto do gabarito deixou de ter tinta fixa escura');
  ok(/@media\(max-width:600px\)\{\.qp\{padding:\.85rem \.8rem\}\}/.test(css), 'no celular, o cartão perdeu a margem enxuta (o enunciado ficava apertado)');
}

// ── 4. ⚠️ a aba do professor: só publicadas, a de hoje aberta, resposta de TESTE ──
{
  const DIA = 86400000, base = Date.UTC(2026, 9, 14);
  const st = [1, 2, 3].map((i) => Object.assign({}, Q, { id: 'ig-' + i, postedAt: base + i * DIA }));
  st.push({ id: 'ig-9', status: 'queued', stem: 'Na fila. Qual?', options: { A: 'a', B: 'b' }, answer: 'A' });
  run('igStories=' + JSON.stringify(st) + ';DB=(typeof DB==="object"&&DB)?DB:{};DB.qotd={};DB.perf=DB.perf||{};');
  run('var __salvas=0;qotdSaveAns=function(){__salvas++;};');
  run('admQotdAlunoOpen=null;admQotdAlunoAuto=true;admQotdAlunoAns={};admQotdAlunoSort="recent";renderAdmQotdAluno();');
  const el = doc.getElementById('adm-qotd-aluno');
  const ids = [...el.querySelectorAll('[data-admqal-toggle]')].map((b) => b.getAttribute('data-admqal-toggle'));
  ok(JSON.stringify(ids) === '["ig-3","ig-2","ig-1"]', 'a aba devia listar só as publicadas, da mais recente: ' + JSON.stringify(ids));
  const abertas = [...el.querySelectorAll('.qa-item.open [data-admqal-toggle]')].map((b) => b.getAttribute('data-admqal-toggle'));
  ok(JSON.stringify(abertas) === '["ig-3"]', 'a de hoje não abriu sozinha na aba do professor');
  ok(!!el.querySelector('.qa-item.open .qp'), 'a questão aberta na aba não está no cartão');
  ok(!el.querySelector('[data-qa-toggle]') && !el.querySelector('#qa-sort'), 'a aba do professor usa os mesmos ids do painel do aluno (as duas telas se cruzariam)');
  el.querySelector('.qa-item.open [data-qotd-opt="B"]').click();
  ok(run('JSON.stringify(DB.qotd)') === '{}', '⚠️ a resposta de teste do professor foi GRAVADA em DB.qotd');
  ok(run('__salvas') === 0, '⚠️ a resposta de teste do professor chamou qotdSaveAns (entraria nas estatísticas)');
  ok(dom.window.localStorage.getItem('qotd_answered') === null, '⚠️ a resposta de teste do professor foi para qotd_answered');
  ok(/1 de 3 respondida/.test(el.textContent), 'o contador da aba não contou a resposta de teste');
  ok(!!el.querySelector('.qa-item.open .qp-fb.err'), 'a aba não mostrou o gabarito depois da resposta de teste');
}

// ── 5. a aba fica logo depois de "Postados" ────────────────────────────────────
ok(/nb\('postados','✅ Postados \('\+nPosted\+'\)'\)\+nb\('aluno','👁 Como o aluno vê'\)/.test(html), 'a aba "👁 Como o aluno vê" não está logo depois de "Postados"');
ok(/\['lote','manual','fila','postados','aluno','promo'\]/.test(html), 'stShowView não conhece a aba "aluno" (o botão não alternaria)');

if (falhas.length) {
  console.error('✗ cartão da Questão do Dia / aba "Como o aluno vê":');
  falhas.forEach((f) => console.error('  - ' + f));
  process.exit(1);
}
console.log('✓ Questão do Dia: cartão simples (sem prancheta) com caso e pergunta em destaque, cores do tema e caixas claras legíveis, e a aba "Como o aluno vê" do professor só lê (não grava)');
