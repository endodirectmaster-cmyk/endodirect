// Enquete do programa de Educação Médica Continuada: SÓ Gold, e voto só ao Enviar.
//
// PEDIDO (2026-08-17): "Para os assinantes do plano gold, joga uma enquete na tela
// inicial de quais aulas eles têm interesse... Disponível apenas para os
// assinantes do plano gold."
//
// ⚠️ A INVARIANTE QUE ESTE TESTE PROTEGE É A EXCLUSIVIDADE. "Só para Gold" é a
// própria promessa comercial do plano: se a enquete aparecer para Standard ou
// para quem está na degustação, o benefício exclusivo deixa de ser exclusivo — e
// isso não dá erro nenhum, some da tela do professor e só o cliente enxerga.
//
// ⚠️ E O DEFEITO QUE EU MESMA INTRODUZI NA PRIMEIRA VERSÃO: o clique no chip
// gravava a seleção PARCIAL em `DB.enqueteCme`. Como `persist()` é chamado por
// dezenas de outras ações do app (responder questão, revisar flashcard, salvar
// nota), meio voto seria enviado ao servidor sem o aluno ter clicado em Enviar, e
// entraria na apuração como voto de verdade. A seleção em andamento passou a
// viver fora de `DB`; só o Enviar escreve.
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
  .map((m) => m[1]).find((s) => s.includes('function renderEnqueteCme'));
ok(!!fonte, 'não achei renderEnqueteCme no index.html');
if (!fonte) { console.error('✗ enquete EMC:\n  - ' + falhas[0]); process.exit(1); }

const corpo = fonte.replace(/^\s*\(function\(\)\{\s*/, '').replace(/^\s*['"]use strict['"];\s*/, '').replace(/\}\)\(\);?\s*$/, '');
const vc = new VirtualConsole(); vc.on('jsdomError', function () {});
// ⚠️ UM ALVO SÓ, A JANELA DE ENTRADA (31/08/2026). O professor tirou a enquete
// do Dashboard e depois do Mural: "só devem aparecer naquela janela inicial de
// entrada na plataforma". O DOM abaixo é o de hoje — montar hosts que a
// plataforma não tem faria este teste aprovar um render que ninguém vê.
const dom = new JSDOM('<body><div id="cme-card-modal"></div></body>',
  { url: 'https://www.endodirect.com.br/', runScripts: 'outside-only', virtualConsole: vc });
const ctx = vm.createContext(dom.getInternalVMContext());
try { vm.runInContext(corpo, ctx); } catch (e) { /* CDN ausente: esperado */ }
ok(vm.runInContext('typeof renderEnqueteCme==="function"', ctx), 'renderEnqueteCme não ficou disponível');
if (falhas.length) { console.error('✗ enquete EMC:'); falhas.forEach((f) => console.error('  - ' + f)); process.exit(1); }

// conta os persist() para provar que seleção parcial NÃO grava
vm.runInContext('__persists=0;persist=function(){__persists++;};', ctx);
function monta(acessos, voto) {
  vm.runInContext('userAcessos=' + JSON.stringify(acessos) + ';', ctx);
  vm.runInContext('DB=(typeof DB==="object"&&DB)?DB:{};DB.enqueteCme=' + JSON.stringify(voto || null) + ';', ctx);
  vm.runInContext('cmeSel=null;cmeEditando=false;cmeOutroRascunho="";__persists=0;', ctx);
  const el = dom.window.document.getElementById('cme-card-modal');
  el.innerHTML = ''; el.style.display = '';
  vm.runInContext('renderEnqueteCme();', ctx);
  return el;
}
const chips = (el) => [...el.querySelectorAll('[data-cme-tema]')];

// ── 1. ⚠️ NÃO-GOLD NÃO VÊ A ENQUETE ─────────────────────────────────────────
[
  [[], 'sem plano (degustação)'],
  [['plano:standard'], 'plano Standard'],
  [['curso:endo'], 'só curso avulso, sem plano'],
].forEach(([acessos, nome]) => {
  const el = monta(acessos, null);
  ok(el.style.display === 'none',
    '⚠️ VAZOU: a enquete do Gold apareceu para ' + nome + ' — é benefício exclusivo do plano');
  ok(el.innerHTML === '' && chips(el).length === 0,
    '⚠️ VAZOU: sobrou marcação da enquete no DOM de ' + nome + ' (esconder por CSS não basta)');
});

// ── 2. Gold vê, com todos os temas da casa ──────────────────────────────────
const SUBS = vm.runInContext('Array.isArray(DIR_SUBS)?DIR_SUBS.length:0', ctx);
ok(SUBS >= 10, 'DIR_SUBS não foi lido do index.html (veio ' + SUBS + ')');
[['plano:gold', 'plano:gold'], ['plano', 'escopo legado "plano"']].forEach(([escopo, nome]) => {
  const el = monta([escopo], null);
  ok(el.style.display !== 'none', 'assinante Gold (' + nome + ') NÃO viu a enquete');
  ok(chips(el).length === SUBS,
    'esperava ' + SUBS + ' temas para o Gold (' + nome + '), vieram ' + chips(el).length);
  ok(/Gold/.test(el.textContent) && /mensais/.test(el.textContent),
    'o card não diz que as aulas são mensais e exclusivas do Gold');
});

// ── 3. ⚠️ TETO DE 3 — e marcar não pode gravar nada ─────────────────────────
{
  const el = monta(['plano:gold'], null);
  for (let i = 0; i < 4; i++) {
    const livre = chips(dom.window.document.getElementById('cme-card-modal')).find((b) => !b.hasAttribute('disabled') && !/^✓/.test(b.textContent));
    if (livre) livre.dispatchEvent(new dom.window.Event('click', { bubbles: true }));
  }
  const marcados = chips(el).filter((b) => b.className.includes('on'));
  ok(marcados.length === 3, '⚠️ o teto de 3 escolhas não segurou: ' + marcados.length + ' marcados');
  const bloqueados = chips(el).filter((b) => b.hasAttribute('disabled'));
  ok(bloqueados.length === SUBS - 3, 'os temas não escolhidos deviam ficar bloqueados no teto (' + bloqueados.length + ')');

  ok(vm.runInContext('__persists', ctx) === 0,
    '⚠️ MARCAR CHIP CHAMOU persist() — seleção parcial não pode ir para o servidor');
  ok(vm.runInContext('DB.enqueteCme===null||DB.enqueteCme===undefined', ctx),
    '⚠️ MARCAR CHIP ESCREVEU EM DB.enqueteCme — outro persist() do app gravaria meio voto como se fosse voto');

  // ── 4. Enviar grava, uma vez só ───────────────────────────────────────────
  // ⚠️ Busca por prefixo: os ids por alvo (`cme-enviar-<alvo>`) são o que
  // permitiu servir Dashboard, Mural e janela sem um formulário mexer no outro, isto não acha o botão e o teste diz o porquê, em vez
  // de estourar um TypeError que não explica nada a quem for consertar.
  const btEnviar = dom.window.document.getElementById('cme-card-modal').querySelector('[id^="cme-enviar-"]');
  ok(!!btEnviar,
    '⚠️ não achei o botão Enviar com id por alvo (cme-enviar-<alvo>) dentro da janela de entrada — '
    + 'se os ids voltaram a ser fixos, interagir no card do Mural mexeria no formulário do Dashboard');
  if (!btEnviar) { console.error('✗ enquete EMC:'); falhas.forEach((f) => console.error('  - ' + f)); process.exit(1); }
  btEnviar.dispatchEvent(new dom.window.Event('click', { bubbles: true }));
  ok(vm.runInContext('__persists', ctx) === 1, 'o Enviar tinha de chamar persist() exatamente 1×');
  const v = vm.runInContext('JSON.stringify(DB.enqueteCme||null)', ctx);
  const voto = JSON.parse(v);
  ok(!!voto && voto.temas.length === 3, 'o voto gravado não tem os 3 temas: ' + v);
  ok(Number(voto.em) > 0, 'o voto gravado não tem carimbo de tempo — a apuração o descarta');
  ok(!('parcial' in voto), 'o voto gravado ainda carrega a marca "parcial"');
  ok(/registrada/i.test(el.textContent), 'depois de enviar, o card devia confirmar o registro');
}

// ── 5. quem já votou volta e vê a confirmação, não a enquete em branco ──────
{
  const el = monta(['plano:gold'], { temas: ['Diabetes', 'Tireoide'], outro: 'Nódulo adrenal', em: 1 });
  ok(chips(el).length === 0, 'quem já votou não deve reabrir na lista de chips');
  ok(/Diabetes/.test(el.textContent) && /Tireoide/.test(el.textContent), 'a confirmação não mostra os temas escolhidos');
  ok(/Nódulo adrenal/.test(el.textContent), 'a sugestão livre sumiu da confirmação');
  ok(!!el.querySelector('[id^="cme-editar"]'), 'faltou o botão de alterar o voto');
}

// ── 6. o voto tem de SAIR do navegador e VOLTAR ─────────────────────────────
const codigo = html.split('\n').filter((l) => !/^\s*\/\//.test(l)).join('\n');
ok(/enquete_cme:\s*DB\.enqueteCme/.test(codigo),
  '⚠️ `enquete_cme` não está na lista de campos de userStatePayload() — o voto morreria no navegador e a apuração ficaria sempre em zero');
ok(/payload\.enquete_cme/.test(codigo),
  '⚠️ o hydrate não lê `payload.enquete_cme` — quem votou no celular veria a enquete em branco no computador');
ok(/endodirect_admin_enquete_cme/.test(codigo),
  'o painel do professor não chama a RPC de apuração');
ok(!/from\s+endodirect_app_state/i.test(codigo),
  '⚠️ o cliente não pode varrer `endodirect_app_state` direto — a apuração é da RPC admin-gated');

// ── 7. ⚠️ A ENQUETE VIVE NA JANELA DE ENTRADA — E SÓ NELA ───────────────────
// HISTÓRICO, porque a guarda mudou de alvo duas vezes e cada mudança teve razão:
//  · nasceu só no Dashboard, supondo que fosse a tela inicial. Não era, e a
//    pergunta do professor ("aparece na janela de entrada, certo?") expôs isso;
//  · ganhou o Mural, que era a tela de entrada de então;
//  · em 31/08/2026 o professor tirou dos dois: "só devem aparecer naquela janela
//    inicial de entrada na plataforma".
// A guarda que sobrevive a todas essas mudanças é a que cobra o ALVO DE HOJE,
// não a que lista os alvos de ontem.
{
  const el = monta(['plano:gold'], null);
  ok(chips(el).length === SUBS,
    '⚠️ a enquete não é desenhada na JANELA DE ENTRADA — hoje é o único ponto de entrega');
  ok(el.style.display !== 'none', 'o host da janela ficou escondido para um Gold sem voto');
  ['cme-card', 'cme-card-mural'].forEach((id) => {
    ok(html.indexOf('id="' + id + '"') < 0,
      '⚠️ o host `' + id + '` voltou ao markup — a enquete só pode aparecer na janela de entrada');
  });

  // ⚠️ IDS POR ALVO CONTINUAM OBRIGATÓRIOS. Hoje há um alvo só, mas foi essa
  // regra que permitiu servir Dashboard, Mural e janela sem um formulário mexer
  // no outro — e é o que permitirá acrescentar outro alvo sem quebrar nada.
  const ids = [...dom.window.document.querySelectorAll('[id^="cme-outro-"],[id^="cme-enviar-"]')].map((n) => n.id);
  ok(new Set(ids).size === ids.length,
    '⚠️ ids repetidos entre alvos (' + ids.join(', ') + ') — getElementById devolveria sempre o primeiro');
  ok(ids.length === 2, 'esperava 2 campos no alvo único, vieram ' + ids.length);
  ok(ids.every((x) => /-modal$/.test(x)),
    '⚠️ os ids do formulário deixaram de ser sufixados pelo alvo: ' + ids.join(', '));
}

// ── 8. e o não-Gold não vê a enquete NEM na janela ──────────────────────────
{
  const el = monta(['plano:standard'], null);
  ok(chips(el).length === 0 && el.innerHTML === '',
    '⚠️ VAZOU NA JANELA: assinante Standard viu a enquete exclusiva do Gold');
  ok(el.style.display === 'none', '⚠️ o host da enquete ficou visível para quem não é Gold');
}

// ── 9. quem desenha a enquete é a FILA, antes de abrir a janela ─────────────
// ⚠️ Antes o gancho era `goPanel` ('mural'||'dash'), porque os cards moravam nos
// painéis. Os cards saíram; se ninguém chamar `renderEnqueteCme()` antes de
// `display='flex'`, a janela abre VAZIA — e o teste anterior continuaria
// passando, porque cobrava um gancho que já não tem o que desenhar.
const codigoFila = html.slice(html.indexOf('function filaEntradaProxima('), html.indexOf('function filaEntradaAgendar('));
ok(codigoFila.indexOf('renderEnqueteCme();') >= 0 && codigoFila.indexOf('renderAtivacao();') >= 0,
  '⚠️ a fila abre a janela sem desenhar o conteúdo antes — a janela apareceria vazia');
ok(codigoFila.indexOf('renderEnqueteCme();') < codigoFila.indexOf("mc.style.display='flex'"),
  '⚠️ a fila mostra a janela ANTES de desenhar — o aluno veria a caixa vazia por um instante');

if (falhas.length) {
  console.error('✗ enquete EMC:');
  falhas.forEach((f) => console.error('  - ' + f));
  process.exit(1);
}
console.log('✓ enquete EMC: só Gold enxerga, teto de 3 respeitado, marcar não grava, Enviar grava uma vez e o voto trafega até o servidor');
