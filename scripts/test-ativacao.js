// Ativação da primeira sessão + meta que o aluno escolhe.
//
// O QUE MOTIVOU (medido em 19/08/2026, `scratchpad/engajamento/funil.sql`):
//   · de 112 cadastrados, 58 NUNCA responderam nada — e 53 DELES fizeram login.
//     Entraram, olharam e saíram. Só 5 nunca nem entraram.
//   · dos 91 alunos com meta semanal gravada, TODOS OS 91 tinham exatamente 50 —
//     o valor com que `DB` nasce (linha `goal:lsGet('goal')||{weekly:50}`).
//     NENHUM aluno jamais tocou no seletor.
//
// ⚠️ O modal da Questão do Dia JÁ existia no Mural e responder ali JÁ contava
// como estudo. O que faltava não era a questão: era um convite que (a) não some
// com um clique em "Agora não" e (b) fala com quem nunca respondeu nada.
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { JSDOM, VirtualConsole } = require('jsdom');

const raiz = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(raiz, 'index.html'), 'utf8');
const falhas = [];
const ok = (cond, msg) => { if (!cond) falhas.push(msg); };

const fonte = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)]
  .map((m) => m[1]).find((s) => s.includes('function renderAtivacao'));
ok(!!fonte, 'não achei renderAtivacao no index.html');
if (!fonte) { console.error('✗ ativação:\n  - ' + falhas[0]); process.exit(1); }
const corpo = fonte.replace(/^\s*\(function\(\)\{\s*/, '').replace(/^\s*['"]use strict['"];\s*/, '').replace(/\}\)\(\);?\s*$/, '');

const vc = new VirtualConsole(); vc.on('jsdomError', function () {});
// ⚠️ SOBROU UM PONTO DE ENTREGA: A JANELA DE ENTRADA (31/08/2026). O professor
// tirou o convite do Dashboard ("isso não era para aparecer no dashboard") e,
// em seguida, também do Mural: "só devem aparecer naquela janela inicial de
// entrada na plataforma".
//
// 🧨 O QUE ISSO CUSTA, REGISTRADO: este card nasceu em 19/08/2026 porque o modal
// que existia antes "sumia com um clique e nunca mais voltava na sessão", e a
// medida era dura — 53 de 112 cadastrados fizeram login sem responder nada. Com
// só a janela, o clique de dispensa volta a existir. O que segura a ponta é a
// fila (`filaEntradaVista`): a marca é de SESSÃO, então quem fechar sem
// responder recebe a janela DE NOVO na próxima vez que abrir a plataforma. O
// item 4 abaixo cobra exatamente isso.
//
// O DOM é o de hoje: montar um host que a plataforma não tem faria este teste
// aprovar um render que ninguém vê.
const dom = new JSDOM('<body>'
  + '<div id="ativa-card-modal"></div>'
  + '<div id="streak-card"></div></body>',
  { url: 'https://www.endodirect.com.br/', runScripts: 'outside-only', virtualConsole: vc });
const ctx = vm.createContext(dom.getInternalVMContext());
try { vm.runInContext(corpo, ctx); } catch (e) { /* CDN ausente: esperado */ }
['renderAtivacao', 'precisaAtivacao', 'renderStreakCard'].forEach((f) => {
  ok(vm.runInContext('typeof ' + f + '==="function"', ctx), f + ' não ficou disponível');
});
if (falhas.length) { console.error('✗ ativação:'); falhas.forEach((f) => console.error('  - ' + f)); process.exit(1); }

const QUESTAO = {
  id: 'q1', status: 'posted', postedAt: 1, sub: 'Diabetes', stem: 'Enunciado da questão',
  answer: 'A', options: { A: 'alternativa A', B: 'alternativa B' }, explanation: 'comentário',
};
vm.runInContext('__persists=0;persist=function(){__persists++;};notify=function(){};goPanel=function(){};'
  + 'renderPerfBars=function(){};updateDashRec=function(){};refreshDash=function(){};srsAdd=function(){};'
  + 'classifyTema=function(){return "Geral";};', ctx);

function monta(user, act, goal, perf) {
  vm.runInContext('currentUser=' + JSON.stringify(user) + ';', ctx);
  vm.runInContext('igStories=' + JSON.stringify([QUESTAO]) + ';', ctx);
  vm.runInContext('DB=(typeof DB==="object"&&DB)?DB:{};DB.act=' + JSON.stringify(act || {})
    + ';DB.qotd={};DB.perf=' + JSON.stringify(perf || {})
    + ';DB.perfTema={};DB.goal=' + JSON.stringify(goal === undefined ? { weekly: 50 } : goal) + ';__persists=0;', ctx);
  const d = dom.window.document;
  ['ativa-card-modal', 'streak-card'].forEach((id) => { d.getElementById(id).innerHTML = ''; });
  vm.runInContext('ativacaoFeitaAgora=false;renderAtivacao();', ctx);
  return d.getElementById('ativa-card-modal');
}
const janela = () => dom.window.document.getElementById('ativa-card-modal');
const alts = (el) => [...el.querySelectorAll('[data-qotd-opt]')];

// ── 1. ⚠️ APARECE PARA QUEM NUNCA ESTUDOU, NO PONTO QUE SOBROU ──────────────
// A medida que originou tudo isto continua valendo: 53 dos 112 cadastrados
// fizeram login e nunca responderam nada. O que mudou foi ONDE o convite mora.
{
  const el = monta({ role: 'aluno' }, {});
  ok(el.style.display !== 'none' && alts(el).length >= 2,
    '⚠️ o convite não apareceu para quem tem ZERO atividade — é exatamente o grupo dos 53 que logaram e não estudaram');
  ok(alts(janela()).length >= 2,
    '⚠️ a ativação não chega à JANELA DE ENTRADA — hoje é o ÚNICO ponto de entrega; sem ela o convite não existe em lugar nenhum');
  // ⚠️ NA JANELA O TÍTULO É DO MODAL. O card omite o próprio cabeçalho de
  // propósito (`emJanela`): moldura dentro de moldura e o mesmo título duas
  // vezes na mesma tela. Então a apresentação é cobrada nos dois pedaços — o
  // rótulo, no cabeçalho da janela; a explicação, no corpo.
  ok(html.indexOf('👋 Comece por aqui') > 0,
    '⚠️ a janela de entrada perdeu o rótulo "Comece por aqui" no cabeçalho');
  ok(/Responda .{0,20}uma questão.{0,20} para começar/i.test(el.textContent.replace(/\s+/g, ' ')),
    'o convite não explica ao aluno o que ele ganha respondendo — era o defeito do modal antigo, que só mostrava alternativas');
}

// ── 1b. ⚠️ E NÃO VOLTA AO DASHBOARD ─────────────────────────────────────────
// "Isso não era para aparecer no dashboard" (professor, 31/08/2026). O
// Dashboard é painel: mostra estado, não faz pedido. Cobrado no markup, porque
// é lá que a volta aconteceria.
{
  ['ativa-card', 'cme-card', 'ativa-card-mural', 'cme-card-mural'].forEach((id) => {
    ok(html.indexOf('id="' + id + '"') < 0,
      '⚠️ o host `' + id + '` voltou — os dois convites só podem aparecer na janela inicial de entrada');
  });
  ok(/\['ativa-card-modal'\]/.test(html) && /\['cme-card-modal'\]/.test(html),
    '⚠️ a lista de alvos voltou a citar um host que não existe — o render sairia para o vazio');
  // 🧨 A COMPENSAÇÃO TEM DE EXISTIR. Sem o card não-dispensável, o que impede o
  // "some com um clique e nunca mais volta" é a marca de SESSÃO da fila: no
  // próximo carregamento ela está limpa e a janela volta. Se alguém gravar essa
  // marca em localStorage ou no DB, o defeito de 19/08/2026 volta inteiro.
  ok(/var filaEntradaVista=\{\};/.test(html),
    '🧨 a marca de "já mostrei" da fila deixou de ser de sessão — quem fechar a janela sem responder nunca mais a veria');
  ['lsSet(\'filaEntrada', 'DB.filaEntrada'].forEach((t2) => {
    ok(html.indexOf(t2) < 0,
      '🧨 a marca da fila passou a ser PERSISTIDA (`' + t2 + '`) — a janela some com um clique para sempre, que é o defeito que o card existia para consertar');
  });
}

// ── 2. ⚠️ NÃO É DISPENSÁVEL — é a diferença para o modal que já existia ─────
{
  const el = monta({ role: 'aluno' }, {});
  const txt = el.textContent.toLowerCase();
  ok(!/agora n[ãa]o/.test(txt) && !el.querySelector('[data-qotd-close]') && !el.querySelector('#qotd-skip'),
    '⚠️ o card de ativação ganhou um jeito de ser dispensado — era esse o defeito do modal, que some com um clique e nunca mais volta na sessão');
}

// ── 3. some sozinho depois da primeira atividade (e não volta a incomodar) ──
{
  const el = monta({ role: 'aluno' }, { '2026-08-19': 3 });
  ok(el.style.display === 'none' && el.innerHTML === '',
    'quem já estudou não pode continuar vendo "Comece por aqui"');
}

// ── 3b. ⚠️ CONTA ANTIGA: TEM QUESTÕES EM `perf` E `act` VAZIO ───────────────
// Sete contas reais estão assim: responderam entre 25/06 e 05/07/2026, ANTES de
// studyEvent() existir (25/07/2026, commit e633bca), então nunca registraram um
// dia de atividade. Se a ativação olhar só para `act`, essas pessoas veem
// "Comece por aqui" para sempre — inclusive quem já respondeu 41 questões.
{
  const el = monta({ role: 'aluno' }, {}, undefined, { Adrenal: { total: 41, correct: 36 } });
  ok(el.innerHTML === '',
    '⚠️ a ativação apareceu para quem tem questões em DB.perf e `act` vazio — é a conta legada, e para ela o card nunca mais sairia da tela');
}
{
  // e `perf` zerado não pode ser confundido com atividade
  const el = monta({ role: 'aluno' }, {}, undefined, { Adrenal: { total: 0, correct: 0 } });
  ok(el.innerHTML !== '', 'perf com total 0 foi tratado como estudo — quem nunca respondeu deixaria de ver o card');
}

// ── 4. admin não é público-alvo ─────────────────────────────────────────────
ok(monta({ role: 'admin' }, {}).innerHTML === '', 'a ativação apareceu para a conta da casa');
ok(monta(null, {}).innerHTML === '', 'a ativação apareceu para visitante sem login');

// ── 5. ⚠️ RESPONDER ALI CONTA COMO ESTUDO — é o que tira do balde ──────────
{
  const el = monta({ role: 'aluno' }, {});
  alts(el)[0].dispatchEvent(new dom.window.Event('click', { bubbles: true }));
  const act = JSON.parse(vm.runInContext('JSON.stringify(DB.act||{})', ctx));
  ok(Object.keys(act).length === 1 && Object.values(act)[0] === 1,
    '⚠️ responder no card NÃO registrou atividade (DB.act=' + JSON.stringify(act) + ') — sem isso o aluno continua contando como "nunca estudou"');
  ok(vm.runInContext('__persists', ctx) >= 1, 'a resposta não foi persistida');
  ok(/primeira quest[ãa]o/i.test(el.textContent), 'depois de responder, o card devia confirmar o feito');
}

// ── 6. o modal da QdD não pode abrir por cima da ativação ───────────────────
const codigo = html.split('\n').filter((l) => !/^\s*\/\//.test(l)).join('\n');
ok(/precisaAtivacao\(\)\)\{m\.style\.display='none';return;\}/.test(codigo.replace(/\s+/g, '')) ||
   /if\(precisaAtivacao\(\)\)/.test(codigo),
  '⚠️ renderQotd não suprime o modal durante a ativação — o aluno veria a MESMA questão duas vezes, e o modal ainda traz "Agora não"');

// ── 7. ⚠️ A META TEM DE SER ESCOLHIDA, NÃO HERDADA ─────────────────────────
{
  // sem atividade: não se pergunta nada (o aluno nem começou)
  monta({ role: 'aluno' }, {});
  vm.runInContext('renderStreakCard();', ctx);
  const st = dom.window.document.getElementById('streak-card');
  ok(!st.querySelector('#streak-escolher'),
    'não se pergunta a meta a quem ainda não respondeu nada — primeiro a questão, depois o compromisso');

  // com atividade e SEM escolha: pergunta, e não mostra barra de progresso
  monta({ role: 'aluno' }, { '2026-08-19': 15 }, { weekly: 50 });
  vm.runInContext('renderStreakCard();', ctx);
  ok(!!st.querySelector('#streak-escolher'),
    '⚠️ a meta de 50 continua sendo imposta em silêncio — foi assim que 91 de 91 alunos ficaram com um número que nunca escolheram');
  ok(!/%/.test(st.textContent),
    '⚠️ está mostrando porcentagem contra uma meta que o aluno não escolheu — quem respondeu 15 vê "30%" e lê "você está atrás"');

  // escolheu: grava a marca e volta ao card normal, com progresso
  // ⚠️ Sem esta trava, quando a pergunta de meta some o teste estoura um
  // TypeError em vez de dizer o que quebrou. Falha tem de explicar-se.
  const btMeta = st.querySelector('#streak-escolher');
  if (!btMeta) { console.error('✗ ativação da primeira sessão:'); falhas.forEach((f) => console.error('  - ' + f)); process.exit(1); }
  btMeta.dispatchEvent(new dom.window.Event('click', { bubbles: true }));
  const g = JSON.parse(vm.runInContext('JSON.stringify(DB.goal||{})', ctx));
  ok(g.escolhida === true,
    '⚠️ a escolha não ficou marcada (`escolhida`) — sem essa marca não dá para distinguir meta do aluno de valor padrão, que é a origem do problema');
  vm.runInContext('renderStreakCard();', ctx);
  ok(!st.querySelector('#streak-escolher'), 'depois de escolher, não se pergunta de novo');
}

if (falhas.length) {
  console.error('✗ ativação da primeira sessão:');
  falhas.forEach((f) => console.error('  - ' + f));
  process.exit(1);
}
console.log('✓ ativação: convite só na janela de entrada (e ela volta na próxima sessão), responder conta como estudo, e a meta é escolhida — não herdada');
