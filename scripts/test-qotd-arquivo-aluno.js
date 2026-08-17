// Regressão: a Questão do Dia tem de estar NO TOPO do arquivo do aluno.
//
// A RECLAMAÇÃO QUE CRIOU ESTE TESTE (15/08/2026, aluno assinante, pelo Suporte):
// "Questões diárias não estão mais aparecendo para serem respondidas desde o dia
// 5 de agosto."
//
// Nada estava quebrado na PUBLICAÇÃO: o cron promoveu uma questão por dia, sem
// falhar um único dia (medido no `ig_stories` de produção — 01/08 a 16/08, todos
// os dias presentes). O defeito era de ORDENAÇÃO, na tela do aluno:
//
//   · `renderQotdArchive()` renderizava `qotdPublished()` na ORDEM CRUA DO ARRAY,
//     que é a de publicação — MAIS ANTIGA PRIMEIRO. Com 52 questões acumuladas, a
//     de hoje era a 52ª linha, abaixo de 51 outras.
//   · o modal do mural só aparece NO MURAL, 1x por sessão; quem entra pela aba
//     "🧠 Questão do Dia" nunca o vê.
//
// O rastro do aluno prova o efeito: até 06/08 ele respondia a questão DO DIA no
// próprio dia; a partir de 10/08 passou a responder as posições 1, 2, 3, 4… do
// array — questões de JUNHO —, uma por dia. Ele encontrou a lista, começou do
// topo, e nunca chegou à de hoje.
//
// ⚠️ E o arquivo do PROFESSOR já ordenava por data, com padrão 'recent'. Da tela
// dele a questão de hoje era a primeira linha e o defeito era invisível. Este
// teste existe porque as duas telas divergiam.
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
  .map((m) => m[1])
  .find((s) => s.includes('function renderQotdArchive'));
ok(!!fonte, 'não achei o bloco com renderQotdArchive no index.html');
if (!fonte) { console.error('✗ arquivo da Questão do Dia:\n  - ' + falhas[0]); process.exit(1); }

const corpo = fonte
  .replace(/^\s*\(function\(\)\{\s*/, '')
  .replace(/^\s*['"]use strict['"];\s*/, '')
  .replace(/\}\)\(\);?\s*$/, '');

const vc = new VirtualConsole();
vc.on('jsdomError', function () {});
const dom = new JSDOM('<body><div id="panel-qotd-body"></div></body>',
  { url: 'https://www.endodirect.com.br/', runScripts: 'outside-only', virtualConsole: vc });
const ctx = vm.createContext(dom.getInternalVMContext());
try { vm.runInContext(corpo, ctx); } catch (e) { /* dependências de CDN ausentes: esperado */ }

const temFn = (n) => vm.runInContext('typeof ' + n + '==="function"', ctx);
ok(temFn('renderQotdArchive'), 'renderQotdArchive não ficou disponível no contexto');
ok(temFn('qotdTodays'), 'qotdTodays não ficou disponível no contexto');
if (falhas.length) { console.error('✗ arquivo da Questão do Dia:'); falhas.forEach((f) => console.error('  - ' + f)); process.exit(1); }

// 52 questões publicadas, uma por dia, na ordem em que o cron as promove:
// o array cresce do mais ANTIGO para o mais RECENTE (foi assim que o defeito nasceu).
const DIA = 86400000;
const base = Date.UTC(2026, 5, 26, 11, 0, 0); // 26/06/2026
const stories = [];
for (let i = 0; i < 52; i++) {
  stories.push({
    id: 'q' + i, status: 'posted', postedAt: base + i * DIA, sub: 'Diabetes',
    stem: 'Enunciado da questão ' + i, answer: 'A',
    options: { A: 'alternativa A', B: 'alternativa B' }, explanation: 'comentário',
  });
}
const HOJE = 'q51';   // a mais recente (16/08/2026)
const ANTIGA = 'q0';  // a mais antiga (26/06/2026)

function monta(respostas) {
  vm.runInContext('igStories=' + JSON.stringify(stories) + ';', ctx);
  vm.runInContext('DB=(typeof DB==="object"&&DB)?DB:{};DB.qotd=' + JSON.stringify(respostas || {}) + ';DB.perf=DB.perf||{};', ctx);
  vm.runInContext('qotdArchOpen=null;qotdArchAuto=true;qotdArchSort="recent";', ctx);
  vm.runInContext('renderQotdArchive();', ctx);
  return dom.window.document.getElementById('panel-qotd-body');
}
const idsNaTela = (el) => [...el.querySelectorAll('[data-qa-toggle]')].map((b) => b.getAttribute('data-qa-toggle'));

// ── 1. ⚠️ O DEFEITO: a de hoje tem de ser a PRIMEIRA, não a última ──────────
{
  const el = monta({});
  const ids = idsNaTela(el);
  ok(ids.length === 52, 'esperava as 52 publicadas na tela, vieram ' + ids.length);
  ok(ids[0] === HOJE,
    '⚠️ a QUESTÃO DE HOJE não é a primeira linha do arquivo do aluno (veio "' + ids[0] + '", esperado "' + HOJE + '"). '
    + 'Foi exatamente assim que o aluno de 15/08/2026 parou de responder a do dia: ela caía no fim da lista.');
  ok(ids[ids.length - 1] === ANTIGA,
    'com "mais recentes primeiro" a questão mais ANTIGA tem de ser a última (veio "' + ids[ids.length - 1] + '")');

  // ── 2. o selo "De hoje" aponta a MESMA questão que o modal do mural ───────
  const daTela = vm.runInContext('(qotdTodays()||{}).id', ctx);
  ok(daTela === HOJE, 'qotdTodays() devolveu "' + daTela + '" e não "' + HOJE + '" — a fonte da verdade mudou');
  const linhaHoje = el.querySelector('[data-qa-toggle="' + HOJE + '"]');
  ok(!!linhaHoje && /De hoje/.test(linhaHoje.textContent),
    '⚠️ a questão de hoje não está marcada com o selo "🧠 De hoje" — sem marca visível ela some no meio de dezenas de linhas iguais');
  const comSelo = [...el.querySelectorAll('.qa-badge.hoje')];
  ok(comSelo.length === 1, 'o selo "De hoje" tem de marcar UMA questão só, marcou ' + comSelo.length);

  // ── 3. ela abre sozinha na 1ª entrada do painel, se não respondida ────────
  const abertas = [...el.querySelectorAll('.qa-item.open [data-qa-toggle]')].map((b) => b.getAttribute('data-qa-toggle'));
  ok(abertas.length === 1 && abertas[0] === HOJE,
    '⚠️ a questão de hoje não abre sozinha ao entrar no painel (abertas: ' + JSON.stringify(abertas) + '). '
    + 'O modal do mural só aparece NO MURAL — quem entra pela aba "Questão do Dia" depende disto.');
  ok(el.querySelectorAll('[data-qotd-opt]').length >= 2,
    'a questão aberta tem de mostrar as alternativas clicáveis');
}

// ── 4. já respondida: NÃO abre sozinha (não reabre gabarito na cara do aluno) ──
{
  const el = monta({ [HOJE]: { letter: 'A', ok: true, at: Date.now() } });
  const abertas = [...el.querySelectorAll('.qa-item.open')];
  ok(abertas.length === 0,
    'a questão de hoje JÁ RESPONDIDA não pode abrir sozinha — o painel abriria direto no gabarito');
  const linhaHoje = el.querySelector('[data-qa-toggle="' + HOJE + '"]');
  ok(!!linhaHoje && /Acertou/.test(linhaHoje.textContent), 'o selo de acerto sumiu da questão respondida');
  ok(/1 de 52 respondida/.test(el.textContent), 'o contador "N de 52 respondidas" não bate: ' + el.textContent.slice(0, 60));
}

// ── 5. o aluno ainda PODE estudar do começo — só não é mais o padrão ────────
// (era o que ele estava fazendo à força: posições 1,2,3… do array, de junho)
{
  const el = monta({});
  vm.runInContext('qotdArchSort="old";renderQotdArchive();', ctx);
  const ids = idsNaTela(dom.window.document.getElementById('panel-qotd-body'));
  ok(ids[0] === ANTIGA && ids[ids.length - 1] === HOJE,
    '⚠️ sumiu a opção "mais antigas primeiro" — quem quer varrer o arquivo em ordem cronológica perdeu o caminho');
  ok(!!el.querySelector('#qa-sort'), 'o seletor de ordenação #qa-sort não está na tela do aluno');
}

// ── 6. o professor não pode voltar a divergir do aluno ─────────────────────
const codigo = html.split('\n').filter((l) => !/^\s*\/\//.test(l)).join('\n');
ok(/var qotdArchSort='recent'/.test(codigo),
  "⚠️ o padrão do arquivo do ALUNO deixou de ser 'recent' — foi a divergência com o painel do professor que escondeu o defeito por 10 dias");
ok(/var admQotdArchSort='recent'/.test(codigo),
  "⚠️ o padrão do arquivo do PROFESSOR deixou de ser 'recent' — as duas telas têm de ordenar igual");

if (falhas.length) {
  console.error('✗ arquivo da Questão do Dia (aluno):');
  falhas.forEach((f) => console.error('  - ' + f));
  process.exit(1);
}
console.log('✓ arquivo da Questão do Dia: a de hoje é a 1ª linha, vem marcada, abre sozinha se não respondida, e a ordem cronológica continua disponível');
