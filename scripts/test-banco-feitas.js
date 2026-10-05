// O BANCO DE QUESTÕES LEMBRA O QUE O ALUNO JÁ RESPONDEU — E EXPLICA AS OUTRAS ALTERNATIVAS.
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
// (3) "Mostrar só as que ainda não respondi" e "Sortear 5 não respondidas"
// respeitam os filtros e excluem as feitas; (4) o botão "Por que as outras
// alternativas estão incorretas?" pede à IA no registro técnico, identifica a
// alternativa pelo texto (nunca pela letra), memoriza por questão, trata erro e
// respeita a degustação (sem bloquear enquanto os acessos não chegaram).
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
    'var altMemo={};',
    corpo('esc'), corpo('ldHTML'), corpo('srsKey'), corpo('groundSys'), corpo('blockIfDegustacao'), corpo('planoAindaNaoConfirmado'), corpo('genCode'),
    'function provasPool(){return provasDB;}',
    corpo('filterProvas'),
    corpo('feitaChave'), corpo('mesclarFeitas'), corpo('feitaDe'), corpo('feitaRegistrar'), corpo('feitaSeloHTML'),
    corpo('sortearNaoFeitas'), corpo('explicarAlternativasPrompt'), corpo('explicarAlternativas'),
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

  // ── 2. Sorteio das não respondidas, dentro dos filtros ────────────────────
  {
    const c = caixa();
    for (let i = 1; i <= 8; i++) c.provasDB.push({ code: 'A' + i, stem: 'a' + i, area: 'Adrenal', inst: 'Endodirect', options: { A: 'x', B: 'y' }, answer: 'A' });
    for (let i = 1; i <= 3; i++) c.provasDB.push({ code: 'D' + i, stem: 'd' + i, area: 'Diabetes', inst: 'Endodirect', options: { A: 'x', B: 'y' }, answer: 'A' });
    c.DB.feitas = { a1: { ok: 1, at: 1 }, a2: { ok: 0, at: 1 } };
    c.dom['q-parea'].value = 'Adrenal';
    const vistos = {};
    for (let t = 0; t < 20; t++) {
      const s = run(c, 'sortearNaoFeitas(5)');
      ok(s.length === 5, 'sortear: devolve 5 (há 6 não respondidas em Adrenal)');
      ok(s.every((q) => q.area === 'Adrenal'), 'sortear: respeita o filtro de subespecialidade');
      ok(!s.some((q) => q.code === 'A1' || q.code === 'A2'), 'sortear: exclui as já respondidas');
      ok(new Set(s.map((q) => q.code)).size === 5, 'sortear: sem repetição');
      s.forEach((q) => { vistos[q.code] = 1; });
    }
    ok(Object.keys(vistos).length === 6, 'sortear: em 20 sorteios, todas as 6 não respondidas aparecem (é sorteio, não as 5 primeiras)');
    c.DB.feitas = { a1: {}, a2: {}, a3: {}, a4: {}, a5: {}, a6: {} };
    ok(run(c, 'sortearNaoFeitas(5)').length === 2, 'sortear: só 2 restantes → devolve as 2');
    for (let i = 7; i <= 8; i++) c.DB.feitas['a' + i] = {};
    ok(run(c, 'sortearNaoFeitas(5)').length === 0, 'sortear: nada restante → lista vazia (o botão avisa)');
    c.dom['q-parea'].value = '';
    ok(run(c, 'sortearNaoFeitas(5)').length === 3 && run(c, 'sortearNaoFeitas(5)').every((q) => q.area === 'Diabetes'), 'sortear: sem filtro de área, sobram as 3 de Diabetes');
    ok(run(c, 'sortearNaoFeitas(0)').length === 1, 'sortear: pedido de 0 vira 1 (nunca devolve "nada" por engano)');
  }

  // ── 3. O pedido à IA: técnico, pelo texto da alternativa, com o gabarito ──
  {
    const c = caixa();
    const p = run(c, 'explicarAlternativasPrompt(' + JSON.stringify(Q) + ')');
    const SENT = '__ENDODIRECT_SYS_SPLIT_b1f7__';
    ok(p.sys.indexOf(c.CLINICAL_GUIDELINES + SENT) === 0, 'prompt: diretrizes recentes no NÚCLEO (prefixo cacheável) + sentinela — sem ela o servidor cortaria o system em 60 mil caracteres');
    const persona = p.sys.slice(p.sys.indexOf(SENT) + SENT.length);
    ok(/registro técnico e formal/.test(persona) && /nunca pela letra/.test(persona) && /Responda somente com JSON/.test(persona), 'prompt: registro técnico, identifica pela alternativa (nunca pela letra), JSON');
    ok(!/\bvocê\b/i.test(persona) && !/[A-ZÁ-Ú]{4,}/.test(persona.replace(/JSON/g, '')), 'prompt: sem segunda pessoa nem ênfase em caixa alta (regra do professor: sem jargão)');
    ok(p.usr.indexOf('Enunciado: ' + Q.stem) === 0, 'pedido: começa pelo enunciado');
    ok(p.usr.indexOf('Cortisol sérico matinal | Cortisol salivar à meia-noite | ACTH basal | Teste de supressão com 8 mg') > 0, 'pedido: as alternativas vão pelo texto, sem letras');
    ok(/Gabarito: Cortisol salivar à meia-noite/.test(p.usr) && !/Gabarito: B/.test(p.usr), 'pedido: o gabarito vai pelo texto da alternativa certa, não pela letra');
    ok(/Comentário do professor: Cortisol salivar noturno/.test(p.usr), 'pedido: leva o comentário do professor (para não repeti-lo)');
    const semExp = run(c, 'explicarAlternativasPrompt(' + JSON.stringify(Object.assign({}, Q, { explanation: '' })) + ')');
    ok(/\(sem comentário\)/.test(semExp.usr), 'pedido: questão sem comentário diz isso em vez de mandar vazio');
  }

  // ── 4. O botão: degustação, pendência, memória, erro ──────────────────────
  {
    const c = caixa({ scopes: [] });
    c.genQs = [Q];
    run(c, 'explicarAlternativas("gen","0",document.getElementById("btn"))');
    ok(c.chamadas.assine === 1 && c.chamadas.ia.length === 0 && /exclusiva dos pacotes/.test(c.chamadas.notify[0] || ''), 'degustação: aviso + tela de pacotes, sem gastar IA');
  }
  {
    const c = caixa({ scopes: ['curso:endoteem'] });
    c.genQs = [Q];
    run(c, 'explicarAlternativas("gen","0",document.getElementById("btn"))');
    ok(c.chamadas.assine === 1 && c.chamadas.ia.length === 0, 'curso avulso (sem pacote): mesma regra dos outros geradores de IA — bloqueado');
  }
  {
    const c = caixa({ acessosPendentes: () => true, scopes: [] });
    c.genQs = [Q];
    run(c, 'explicarAlternativas("gen","0",document.getElementById("btn"))');
    await new Promise((r) => setImmediate(r));
    ok(c.chamadas.assine === 0 && c.chamadas.ia.length === 0 && /Confirmando o seu plano/.test(c.chamadas.notify[0] || '') && c.chamadas.retenta === 1, 'acessos pendentes: nem assina nem gasta IA — espera a confirmação e pede a lista de novo');
  }
  {
    const c = caixa();
    c.genQs = [Q];
    c.iaResposta = Promise.resolve({ itens: [
      { alternativa: 'Cortisol sérico matinal', motivo: 'Sofre variação circadiana e não distingue hipercortisolismo.' },
      { alternativa: 'ACTH basal', motivo: 'Serve à etiologia, não ao rastreio.' },
      { alternativa: '', motivo: '' }, // item vazio é descartado
    ] });
    const btn = c.document.getElementById('btn');
    run(c, 'explicarAlternativas("gen","0",document.getElementById("btn"))');
    ok(btn.disabled === true && /Analisando as alternativas/.test(btn.innerHTML), 'botão: desabilita e mostra que está analisando');
    await new Promise((r) => setImmediate(r));
    const ia = c.chamadas.ia[0];
    ok(ia && ia.maxTok === 1100 && ia.retries === 0 && ia.model === 'modelo-clinico', 'IA: callAIJson(sys, usr, 1100, 0 retentativas, modelo clínico)');
    const box = c.dom['qalt-gen-0'];
    ok(/<b>Cortisol sérico matinal<\/b>: Sofre variação circadiana/.test(box.innerHTML) && /<b>ACTH basal<\/b>/.test(box.innerHTML), 'resultado: lista cada alternativa pelo texto, com o motivo');
    ok((box.innerHTML.match(/<li>/g) || []).length === 2, 'resultado: o item vazio não vira linha');
    ok(!/gerado por IA/i.test(box.innerHTML), 'resultado: SEM rótulo "gerado por IA" (decisão do professor, 05/10/2026)');
    ok(btn.style.display === 'none', 'resultado: o botão some');
    ok(c.altMemo['adr-01'] && c.altMemo['adr-01'].length === 2, 'memória: guarda por questão');
    // Segunda vez (outra busca, outro card): sem nova chamada.
    const btn2 = c.document.getElementById('btn2');
    run(c, 'explicarAlternativas("gen","0",document.getElementById("btn2"))');
    ok(c.chamadas.ia.length === 1 && btn2.style.display === 'none' && /ACTH basal/.test(c.dom['qalt-gen-0'].innerHTML), 'memória: a mesma questão não paga a IA de novo na sessão');
  }
  {
    const c = caixa();
    c.genQs = [Q];
    c.iaResposta = Promise.reject(new Error('Tempo esgotado.'));
    const btn = c.document.getElementById('btn');
    run(c, 'explicarAlternativas("gen","0",document.getElementById("btn"))');
    await new Promise((r) => setImmediate(r));
    ok(/Não foi possível comentar as alternativas agora: Tempo esgotado\./.test(c.dom['qalt-gen-0'].innerHTML), 'erro: explica na caixa');
    ok(btn.disabled === false && btn.textContent === 'Por que as outras alternativas estão incorretas?', 'erro: o botão volta a ficar clicável com o rótulo original');
    ok(!c.altMemo['adr-01'], 'erro: nada memorizado');
  }
  {
    const c = caixa();
    c.genQs = [Q];
    c.iaResposta = Promise.resolve({ itens: [] });
    run(c, 'explicarAlternativas("gen","0",document.getElementById("btn"))');
    await new Promise((r) => setImmediate(r));
    ok(/Resposta vazia/.test(c.dom['qalt-gen-0'].innerHTML), 'IA sem itens: tratado como erro, não como "tudo certo"');
  }
  {
    const c = caixa();
    c.DB.q = [Q];
    c.iaResposta = Promise.resolve({ itens: [{ alternativa: 'ACTH basal', motivo: 'm' }] });
    run(c, 'explicarAlternativas("saved","0",null)');
    await new Promise((r) => setImmediate(r));
    ok(c.chamadas.ia.length === 1 && /ACTH basal/.test(c.dom['qalt-saved-0'].innerHTML), 'banco salvo: a mesma função atende a fonte "saved" (DB.q) e sem botão');
    run(c, 'explicarAlternativas("gen","9",null)');
    ok(c.chamadas.ia.length === 1, 'índice inexistente: não chama a IA');
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
    ok(/if\(!anulada&&q&&q\.options&&fb&&\(src==='gen'\|\|src==='saved'\)&&\(hasScope\('plano'\)\|\|acessosPendentes\(\)\)\)\{\s*fb\.innerHTML\+=.*data-exp-alt="'\+esc\(src\)\+'\|'\+esc\(String\(idx\)\)\+'".*Por que as outras alternativas estão incorretas\?/.test(so), 'selectOpt: depois de responder, oferece "Por que as outras alternativas estão incorretas?" só a quem tem pacote (ou enquanto não se sabe)');
    ok(/try\{feitaRegistrar\(q,null,src,i,'disc'\);\}catch\(e\)\{\}/.test(corpo('evalDisc')), 'evalDisc: discursiva avaliada vira respondida');
    ok(/id="qalt-'\+esc\(src\)\+'-'\+esc\(String\(idx\)\)\+'"/.test(so), 'selectOpt: cria a caixa onde a explicação aparece');
    ok(/margin-bottom:\.45rem">'\+feitaSeloHTML\(q,src,i\)\+\(q\.code\?/.test(corpo('qFullHTML')), 'qFullHTML: o selo entra nas etiquetas do card (objetivas e discursivas)');
    ok(/align-items:center">'\+feitaSeloHTML\(q,'saved',i\)\+\(q\.code\?/.test(corpo('renderSavedQ')), 'renderSavedQ: o banco salvo também mostra o selo');
    ok((html.match(/\{code:q\.code\|\|genCode\(q\.area\),type:qtype,at:Date\.now\(\)\}/g) || []).length === 2, 'salvar: a cópia preserva o código original — responder no banco salvo marca a mesma questão do Banco');
    ok(/lsSet\(k,k==='feitas'\?DB\.feitas:payload\[k\]\)/.test(corpo('applyStatePayload')), 'applyStatePayload: a cópia local recebe a UNIÃO, não o payload cru do servidor');
    const iDl = html.lastIndexOf('doLogin=function(u){');
    ok(/if\(!ownLocal\)\{try\{DB\.feitas=\{\};lsSet\('feitas',null\);\}catch\(e\)\{\}\}/.test(html.slice(iDl, iDl + 2500)), 'doLogin: trocou a conta neste navegador (qualquer papel) → as respondidas da anterior não se unem às desta');
    ok(/<input type="checkbox" id="q-naofeitas"[^>]*> Mostrar só as que ainda não respondi<\/label>/.test(html), 'tela: caixa "Mostrar só as que ainda não respondi"');
    ok(/<button class="btn btn-outline" id="btn-sortear-5"[^>]*>Sortear 5 não respondidas<\/button>/.test(html), 'tela: botão "Sortear 5 não respondidas"');
    const upi = corpo('updateProvaInfo');
    ok(/var feitasN=lista\.filter\(function\(q\)\{return !!feitaDe\(q\);\}\)\.length;/.test(upi) && /var n=soNao\?\(lista\.length-feitasN\):lista\.length;/.test(upi), 'updateProvaInfo: conta as respondidas e desconta quando a caixa está marcada');
    ok(/' · '\+feitasN\+' já respondida'\+\(feitasN===1\?'':'s'\)\+\(soNao\?' \(ocultas\)':''\)/.test(upi), 'updateProvaInfo: "N já respondidas (ocultas)"');
    ok(/Todas as '\+lista\.length\+' questões desses filtros já foram respondidas\. Desmarque a opção para revê-las\./.test(upi), 'updateProvaInfo: quando tudo já foi respondido, diz isso em vez de "Nenhuma questão"');
    const iBind = html.indexOf("document.getElementById('btn-filter-provas').addEventListener('click',function(){");
    const bind = html.slice(iBind, iBind + 2600);
    ok(/if\(soNao&&soNao\.checked\)qs=qs\.filter\(function\(q\)\{return !feitaDe\(q\);\}\);\s*renderProvaResults\(qs\);/.test(bind), 'Buscar: com a caixa marcada, tira as respondidas da lista');
    ok(/_soNao\.addEventListener\('change',updateProvaInfo\)/.test(bind), 'caixa: marcar/desmarcar refaz a contagem na hora');
    ok(/if\(bancoEstado\(\)\)\{renderProvaResults\(\[\]\);return;\}/.test(bind) && /if\(!filterProvas\(inst,ano,area,type\)\.length\)\{notify\('Nenhuma questão com esses filtros\.','info'\);return;\}/.test(bind), 'Sortear 5: banco carregando/erro mostra o estado; filtro vazio diz "nenhuma questão" (não "todas respondidas")');
    ok(/var qs=sortearNaoFeitas\(5\);\s*if\(!qs\.length\)\{notify\('Todas as questões desses filtros já foram respondidas\. Troque o filtro para sortear outras\.','info'\);return;\}\s*renderProvaResults\(qs\);/.test(bind), 'Sortear 5: monta a sessão curta ou avisa que não sobrou nada');
    ok(/var ea=c\('\[data-exp-alt\]'\);\s*if\(ea\)\{var _p=String\(ea\.dataset\.expAlt\|\|''\)\.split\('\|'\);explicarAlternativas\(_p\[0\],_p\[1\],ea\);return;\}/.test(html), 'clique: o botão das alternativas está ligado (delegação global)');
    // O Simulado continua usando filterProvas com a semântica de sempre (sem feitas).
    ok(/function filterProvas\(inst,ano,area,type\)\{\s*return provasPool\(\)\.filter\(/.test(html), 'filterProvas: inalterada (o Simulado depende dela)');
  }

  if (falhas.length) {
    console.error('test-banco-feitas: ' + falhas.length + ' falha(s)');
    falhas.forEach((f) => console.error('  ✗ ' + f));
    process.exit(1);
  }
  console.log('test-banco-feitas: ok (respondidas persistidas e sincronizadas, selo no card, sorteio das não feitas, explicação das alternativas pela IA)');
})().catch((e) => { console.error(e); process.exit(1); });
