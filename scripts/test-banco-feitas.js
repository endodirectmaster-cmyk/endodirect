// O BANCO DE QUESTÕES LEMBRA O QUE O ALUNO JÁ RESPONDEU.
//
// ⚠️ 05/10/2026. Dúvida de um assinante Gold (dia seguinte à assinatura): quer
// fazer "cerca de 5 questões por dia" por subespecialidade; "as questões que eu
// já fiz voltam como se eu ainda não tivesse realizado"; "as alternativas
// incorretas possuem alguma explicação?". Antes: o estado "respondida" vivia em
// `genAnswered`, zerado a cada Buscar; o banco só tem o comentário do gabarito.
//
// 🧨 O QUE ESTE TESTE PRENDE: (1) `DB.feitas` — chave estável (a mesma do
// caderno de erros), pessoal, persistida e sincronizada (persist, PERSONAL_STATE_KEYS,
// userStatePayload, applyStatePayload com união pela data, limpa ao trocar de
// conta); (2) o selo "Acertou/Errou em dd/mm" no card e a contagem no painel;
// (3) "Mostrar só as que ainda não respondi" respeita os filtros e exclui as
// feitas (o "Sortear 5" saiu em 11/11/2026, a pedido do professor: a caixa
// já faz isso); (4) o botão "Por que as outras alternativas estão incorretas?"
// (IA, 04/10/2026) saiu em 11/11/2026, a pedido do professor: a análise das
// demais alternativas é parte do comentário de cada questão. O teste prende a ausência.
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const RAIZ = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(RAIZ, 'index.html'), 'utf8');
const falhas = [];
const ok = (c, m) => { if (!c) falhas.push(m); };
function corpo(nome) {
  const i = html.indexOf('function ' + nome + '(');
  if (i < 0) throw new Error('função ausente no index.html: ' + nome);
  let j = html.indexOf('{', i), n = 0;
  for (let k = j; k < html.length; k++) {
    if (html[k] === '{') n++;
    else if (html[k] === '}') { n--; if (!n) return html.slice(i, k + 1); }
  }
  throw new Error('chaves não fecham em ' + nome);
}

function elemento(extra) { return Object.assign({ innerHTML: '', outerHTML: '', textContent: '', style: {}, disabled: false }, extra || {}); }
function caixa(extra) {
  const dom = { 'q-inst': { value: '' }, 'q-ano': { value: '' }, 'q-parea': { value: '' }, 'q-ptype': { value: '' } };
  const c = Object.assign({
    console: { warn() {}, log() {} },
    Date, Number, Array, String, Promise, Object, Math, parseInt, JSON,
    setTimeout: (fn) => { fn(); return 0; },
    DB: { feitas: {}, q: [] },
    genQs: [],
    provasDB: [],
    CLINICAL_GUIDELINES: '\n\nDIRETRIZES RECENTES (teste)',
    AI_MODEL_CLINICO: 'modelo-clinico',
    chamadas: { persist: 0, info: 0, assine: 0, ia: [], notify: [] },
    persist() { c.chamadas.persist++; },
    updateProvaInfo() { c.chamadas.info++; },
    showAssineScreen() { c.chamadas.assine++; },
    isAdminUser: () => false,
    scopes: ['plano', 'plano:gold'],
    hasScope(sc) { return !sc || c.scopes.indexOf(sc) >= 0; },
    isDegustacao() { return !c.scopes.length; },
    acessosPendentes: () => false,
    notify(m) { c.chamadas.notify.push(m); },
    acessosRetentarSePendente() { c.chamadas.retenta = (c.chamadas.retenta || 0) + 1; },
    currentUser: { id: 'U1', role: 'aluno', email: 'u1@x' },
    iaResposta: null, // Promise devolvida por callAIJson
    callAIJson(sys, usr, maxTok, retries, model) { c.chamadas.ia.push({ sys, usr, maxTok, retries, model }); return c.iaResposta || Promise.resolve({ itens: [] }); },
    dom,
    document: {
      getElementById(id) { if (!(id in dom)) dom[id] = elemento(); return dom[id]; },
    },
  }, extra || {});
  vm.createContext(c);
  vm.runInContext([
    // App das lojas (19/10/2026): aqui é o site, sem a marca do app.
    "var APP_LOJA='';", corpo('isAppLoja'), corpo('textoCompra'),
    corpo('esc'), corpo('ldHTML'), corpo('srsKey'), corpo('groundSys'), corpo('blockIfDegustacao'), corpo('planoAindaNaoConfirmado'), corpo('genCode'),
    'function provasPool(){return provasDB;}',
    corpo('filterProvas'),
    corpo('feitaChave'), corpo('mesclarFeitas'), corpo('feitaDe'), corpo('feitaRegistrar'), corpo('feitaSeloHTML'),
  ].join('\n'), c);
  return c;
}
const run = (c, codigo) => vm.runInContext(codigo, c);
const dataBR = (t) => new Date(t).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
const Q = { code: 'ADR-01', stem: 'Paciente com hipercortisolismo…', area: 'Adrenal', inst: 'Endodirect', answer: 'B',
  options: { A: 'Cortisol sérico matinal', B: 'Cortisol salivar à meia-noite', C: 'ACTH basal', D: 'Teste de supressão com 8 mg' },
  explanation: 'Cortisol salivar noturno é um dos testes de rastreio de primeira linha.' };

(async function () {
  // ── 1. Chave, registro e selo ──────────────────────────────────────────────
  {
    const c = caixa();
    ok(run(c, 'feitaChave(' + JSON.stringify(Q) + ')') === 'adr-01', 'chave: a mesma do caderno de erros (srsKey → código em minúsculas)');
    ok(run(c, 'feitaChave({stem:"  Enunciado Sem Código "})') === 'enunciado sem código', 'chave: sem código, usa o enunciado');
    ok(run(c, 'feitaDe(' + JSON.stringify(Q) + ')') === null, 'feitaDe: nunca respondida = null');
    ok(run(c, 'feitaSeloHTML(' + JSON.stringify(Q) + ',"gen",3)') === '<span id="qfeita-gen-3"></span>', 'selo: nunca respondida = âncora vazia (para o registro trocar na hora)');
    c.genQs = [Q];
    const antes = Date.now();
    run(c, 'feitaRegistrar(genQs[0],true,"gen",0)');
    const f = c.DB.feitas['adr-01'];
    ok(f && f.ok === 1 && Number(f.at) >= antes, 'registrar: grava {ok:1, at:agora} na chave da questão');
    ok(c.chamadas.persist === 1 && c.chamadas.info === 1, 'registrar: persiste (local + servidor) e refaz a contagem do painel');
    ok(/class="tag tag-grn"/.test(c.dom['qfeita-gen-0'].outerHTML) && new RegExp('Acertou em ' + dataBR(f.at)).test(c.dom['qfeita-gen-0'].outerHTML), 'registrar: o selo do card vira "Acertou em dd/mm" sem redesenhar a lista');
    run(c, 'feitaRegistrar(genQs[0],false,"gen",0)');
    ok(c.DB.feitas['adr-01'].ok === 0 && /tag-red/.test(c.dom['qfeita-gen-0'].outerHTML) && /Errou em/.test(c.dom['qfeita-gen-0'].outerHTML), 'registrar de novo: a última resposta vale (Errou)');
    ok(run(c, 'feitaSeloHTML(genQs[0],"gen",7)').indexOf('id="qfeita-gen-7"') > 0, 'selo: carrega o id com a fonte e o índice do card');
    run(c, 'feitaRegistrar({},true,"gen",0)');
    ok(Object.keys(c.DB.feitas).length === 1, 'registrar: questão sem chave (sem código nem enunciado) é ignorada');
    run(c, 'feitaRegistrar({code:"T-AN"},null,"gen",1,"anulada")');
    ok(c.DB.feitas['t-an'] && c.DB.feitas['t-an'].ok === null && c.DB.feitas['t-an'].tipo === 'anulada', 'registrar: anulada entra como vista (ok null, tipo anulada) — não volta no sorteio');
    ok(/tag-pur/.test(run(c, 'feitaSeloHTML({code:"T-AN"},"gen",1)')) && /Anulada · vista em/.test(run(c, 'feitaSeloHTML({code:"T-AN"},"gen",1)')), 'selo: anulada = "Anulada · vista em dd/mm"');
    run(c, 'feitaRegistrar({code:"T-DI"},null,"gen",2,"disc")');
    ok(/Respondida em/.test(run(c, 'feitaSeloHTML({code:"T-DI"},"gen",2)')) && c.DB.feitas['t-di'].tipo === 'disc', 'registrar/selo: discursiva avaliada = "Respondida em dd/mm"');
    c.DB.feitas = null;
    run(c, 'feitaRegistrar(genQs[0],true,"gen",0)');
    ok(c.DB.feitas && c.DB.feitas['adr-01'], 'registrar: DB.feitas corrompido (null) é recriado, não derruba a resposta');
  }
  // União servidor × aparelho: por questão fica o registro mais recente.
  {
    const c = caixa();
    const r = run(c, 'mesclarFeitas({A:{ok:1,at:200},C:{ok:0,at:10}},{A:{ok:0,at:100},B:{ok:1,at:50}})');
    ok(r.A.ok === 1 && r.A.at === 200, 'mesclar: o servidor é mais novo em A → vale o servidor (outro aparelho respondeu depois)');
    ok(r.B && r.B.ok === 1 && r.C && r.C.ok === 0, 'mesclar: o que só existe de um lado é mantido');
    const r2 = run(c, 'mesclarFeitas({A:{ok:1,at:100}},{A:{ok:0,at:100}})');
    ok(r2.A.ok === 0, 'mesclar: empate de data → vale o aparelho (é o que o aluno acabou de responder)');
    const r3 = run(c, 'mesclarFeitas(null,{A:{ok:1,at:1},X:"lixo",Y:null})');
    ok(r3.A && !('X' in r3) && !('Y' in r3), 'mesclar: lado ausente e entradas inválidas não quebram');
  }

  // ── 4b. genCode não repete depois de uma exclusão ─────────────────────────
  {
    const c = caixa();
    c.DB.q = [{ code: 'DM001' }, { code: 'DM003' }, { code: 'ADR-01' }];
    ok(run(c, 'genCode("Diabetes")') === 'DM004', 'genCode: maior sufixo + 1 (não contagem) — excluir DM002 e salvar outra não repete DM003');
    ok(run(c, 'genCode("Adrenal")') === 'ADR001', 'genCode: código original de prova (ADR-01) não é lido como sufixo');
  }

  // ── 5. Fiação no index.html ───────────────────────────────────────────────
  {
    ok(/feitas:lsGet\('feitas'\)\|\|\{\},/.test(html), 'DB: nasce da cópia local');
    ok(/\['q','fc','mm','notes','crono','sf_results','perf','perfTema','act','srs','srNew','goal','cursoProg','feitas','plan','acervoVisto'\]\.forEach\(function\(k\)\{lsSet\(k,DB\[k\]\);\}\);/.test(html), 'persist: feitas vai para o aparelho');
    ok(/var PERSONAL_STATE_KEYS=\[[^\]]*'feitas'[^\]]*\];/.test(html), 'PERSONAL_STATE_KEYS: feitas é pessoal (nunca conteúdo global)');
    ok(/qotd:DB\.qotd,feitas:DB\.feitas,/.test(corpo('userStatePayload')), 'userStatePayload: feitas vai para o app_state do aluno');
    ok(/if\(payload\.feitas&&typeof payload\.feitas==='object'\)DB\.feitas=mesclarFeitas\(payload\.feitas,DB\.feitas\);/.test(corpo('applyStatePayload')), 'applyStatePayload: união pela data (servidor × aparelho)');
    const clr = corpo('clearLocalUserData');
    ok(/'perf','feitas','ck_billing'/.test(clr) && /DB\.feitas=\{\};/.test(clr), 'clearLocalUserData: trocar de conta no mesmo navegador não herda as respondidas da conta anterior');
    const so = corpo('selectOpt');
    ok(/if\(q\)\{try\{feitaRegistrar\(q,anulada\?null:ok,src,idx,anulada\?'anulada':''\);\}catch\(e\)\{\}\}/.test(so), 'selectOpt: toda resposta registra a questão como feita — anulada inclusive (como vista)');
    ok(!/data-exp-alt|qalt-|function explicarAlternativas|var altMemo|outras alternativas estão incorretas\?<\/button>/.test(html), '🧨 sem o botão "Por que as outras alternativas estão incorretas?" (saiu em 11/11/2026, pedido do professor), nem o código que chamava a IA');
    ok(/O botão "Por que as outras alternativas estão incorretas\?" \(IA, 04\/10\/2026\) saiu/.test(so), 'selectOpt: comentário registra por que o botão saiu');
    ok(/try\{feitaRegistrar\(q,null,src,i,'disc'\);\}catch\(e\)\{\}/.test(corpo('evalDisc')), 'evalDisc: discursiva avaliada vira respondida');
    ok(/margin-bottom:\.45rem">'\+feitaSeloHTML\(q,src,i\)\+\(q\.code\?/.test(corpo('qFullHTML')), 'qFullHTML: o selo entra nas etiquetas do card (objetivas e discursivas)');
    ok(/align-items:center">'\+feitaSeloHTML\(q,'saved',i\)\+\(q\.code\?/.test(corpo('renderSavedQ')), 'renderSavedQ: o banco salvo também mostra o selo');
    // 13/11/2026: "Salvar todas" saiu com a lista paginada (o Banco passou a "Estudar" uma por vez);
    // fica o "💾 Salvar" de cada questão.
    ok(/\{code:q\.code\|\|genCode\(q\.area\),type:qtype,at:Date\.now\(\)\}/.test(corpo('saveOneQ')) && !/function saveAllQ\(/.test(html), 'salvar: a cópia preserva o código original — responder no banco salvo marca a mesma questão do Banco');
    ok(/lsSet\(k,k==='feitas'\?DB\.feitas:payload\[k\]\)/.test(corpo('applyStatePayload')), 'applyStatePayload: a cópia local recebe a UNIÃO, não o payload cru do servidor');
    const iDl = html.lastIndexOf('doLogin=function(u){');
    ok(/if\(!ownLocal\)\{try\{DB\.feitas=\{\};lsSet\('feitas',null\);\}catch\(e\)\{\}\}/.test(html.slice(iDl, iDl + 2500)), 'doLogin: trocou a conta neste navegador (qualquer papel) → as respondidas da anterior não se unem às desta');
    ok(/<input type="checkbox" id="q-naofeitas"[^>]*> Mostrar só as que ainda não respondi<\/label>/.test(html), 'tela: caixa "Mostrar só as que ainda não respondi"');
    ok(!/btn-sortear-5|function sortearNaoFeitas|Sortear 5 não respondidas/.test(html), '🧨 tela: sem o botão "Sortear 5 não respondidas" (a caixa já mostra só as não respondidas)');
    const upi = corpo('updateProvaInfo');
    ok(/var feitasN=lista\.filter\(function\(q\)\{return !!feitaDe\(q\);\}\)\.length;/.test(upi) && /var n=soNao\?\(lista\.length-feitasN\):lista\.length;/.test(upi), 'updateProvaInfo: conta as respondidas e desconta quando a caixa está marcada');
    ok(/' · '\+feitasN\+' já respondida'\+\(feitasN===1\?'':'s'\)\+\(soNao\?' \(ocultas\)':''\)/.test(upi), 'updateProvaInfo: "N já respondidas (ocultas)"');
    ok(/Todas as '\+lista\.length\+' questões desses filtros já foram respondidas\. Desmarque a opção para revê-las\./.test(upi), 'updateProvaInfo: quando tudo já foi respondido, diz isso em vez de "Nenhuma questão"');
    const iBind = html.indexOf("document.getElementById('btn-filter-provas').addEventListener('click',function(){");
    const bind = html.slice(iBind, iBind + 2600);
    ok(/if\(soNao&&soNao\.checked\)qs=qs\.filter\(function\(q\)\{return !feitaDe\(q\);\}\);\s*renderProvaResults\(qs\);/.test(bind), 'Buscar: com a caixa marcada, tira as respondidas da lista');
    ok(/_soNao\.addEventListener\('change',updateProvaInfo\)/.test(bind), 'caixa: marcar/desmarcar refaz a contagem na hora');
    // O Simulado continua usando filterProvas com a semântica de sempre (sem feitas).
    ok(/function filterProvas\(inst,ano,area,type\)\{\s*return provasPool\(\)\.filter\(/.test(html), 'filterProvas: inalterada (o Simulado depende dela)');
  }

  if (falhas.length) {
    console.error('test-banco-feitas: ' + falhas.length + ' falha(s)');
    falhas.forEach((f) => console.error('  ✗ ' + f));
    process.exit(1);
  }
  console.log('test-banco-feitas: ok (respondidas persistidas e sincronizadas, selo no card, filtro das não feitas, sem o botão das outras alternativas)');
})().catch((e) => { console.error(e); process.exit(1); });
