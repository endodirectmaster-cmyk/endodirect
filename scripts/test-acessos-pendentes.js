// O ASSINANTE NÃO É JULGADO ANTES DE A LISTA DE ACESSOS CHEGAR.
//
// ⚠️ 05/10/2026. Feedback de um Gold de 46 dias (3/5): "toda vez que faço login
// aparece que meu período de teste de 7 dias já foi encerrado" — e o link da
// Questão do Dia no e-mail caía na mesma tela. No banco ele é Gold anual até
// 08/2027 e a RPC devolve o plano certo. O defeito é de ORDEM no cliente: o
// painel inicial é escolhido no startApp, antes de `endodirect_acessos_ativos`
// responder; sem a cópia local dos acessos, `userAcessos` vazio significava
// "degustação", e o `__start` da degustação de junho dizia "encerrada". Daí
// homePanel() não achava painel permitido, caía em 'flash' e mostrava o cartão
// "Degustação de 7 dias encerrada". Quando os acessos chegavam, ninguém
// reavaliava a tela — o aluno ficava preso até clicar em outro item.
//
// 🧨 O QUE ESTE TESTE PRENDE: (1) enquanto a lista não veio (`acessosPendentes`),
// nada decide contra o aluno — painéis abrem, nada expira, cota não é debitada,
// janela e faixa de degustação não aparecem, o banco não vira amostra;
// (2) quando a lista chega, `definirAcessos` reavalia o painel aberto (sai da
// tela de bloqueio) e só então a janela de degustação pode aparecer; (3) uma
// degustação REALMENTE vencida continua bloqueada depois que a lista vem vazia;
// (4) a fiação: doLogin/doLogout zeram o estado, e o hydrate só refaz a tela
// depois de a chamada dos acessos terminar.
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
// `var NOME=...;` literal do index.html (objetos de uma linha ou até a linha `};`).
function decl(nome) {
  const i = html.indexOf('var ' + nome + '=');
  if (i < 0) throw new Error('declaração ausente: ' + nome);
  // Uma linha: até o primeiro `;` (o comentário à direita fica de fora).
  // Várias linhas (objeto aberto na linha do var): até a linha `};`.
  const abre = html.indexOf('{', i), linha = html.indexOf('\n', i);
  const multi = abre > 0 && abre < linha && html.indexOf('}', abre) > linha;
  return multi ? html.slice(i, html.indexOf('\n};', i) + 3) : html.slice(i, html.indexOf(';', i) + 1);
}

const DIA = 86400000;
function documentoFalso(cfg) {
  cfg = cfg || {};
  const modalBody = { innerHTML: '' };
  return {
    modalBody,
    querySelector(sel) {
      if (sel === '.sb-item[data-p].on') return cfg.painel ? { dataset: { p: cfg.painel } } : null;
      return null;
    },
    querySelectorAll() { return []; },
    getElementById(id) {
      if (id === 'panel-locked') return cfg.bloqueado ? { classList: { contains: (c) => c === 'on' } } : null;
      if (id === 'trial-modal-body') return modalBody;
      return null;
    },
  };
}
function caixa(extra) {
  const ls = {};
  const c = Object.assign({
    console: { warn() {}, log() {} },
    Date, Number, Array, String, Promise, Object, Math, parseInt, JSON,
    setTimeout: (fn) => { fn(); return 0; },
    lsGet: (k) => (k in ls ? ls[k] : null),
    lsSet: (k, v) => { ls[k] = v; },
    _ls: ls,
    currentUser: { id: 'U1', role: 'aluno', email: 'u1@x' },
    userAcessos: [],
    degTrials: { __start: Date.now() - 100 * DIA }, // degustação de 3 meses atrás, "vencida"
    provasDB: [],
    chamadas: { goPanel: [], assine: 0, modal: 0, quest: 0, notify: [] },
    queueRemoteStateSave() {}, markLockedNavItems() {}, updatePlanBadge() {}, renderDegustacaoBar() {},
    notify(m) { c.chamadas.notify.push(m); },
    showAssineScreen() { c.chamadas.assine++; },
    goPanel(id) { c.chamadas.goPanel.push(id); },
    applyQuestDegustacao() { c.chamadas.quest++; }, populateInst() {}, updateProvaInfo() {},
    trialModalEl() { c.chamadas.modal++; return { style: {} }; },
    prescAllowed: () => true, // Consultório: regra de perfil (médico), fora do escopo daqui
    document: documentoFalso(),
  }, extra || {});
  vm.createContext(c);
  vm.runInContext([
    'var acessosConhecidos=false;var trialModalSeen=false;',
    decl('DEG_DIAS'), decl('DEG_MURAL_DIAS'), decl('TRIAL_LIMIT'),
    decl('DEGUSTACAO_PANELS'), decl('TRIAL_PANELS'), decl('PANEL_SCOPE'), decl('PANEL_MIN_TIER'), decl('PANEL_LABELS'),
    decl('ACESSOS_GUARDADOS_MS'),
    corpo('acessosPendentes'), corpo('reavaliarPainelAtual'), corpo('definirAcessos'), corpo('acessosGuardados'),
    corpo('isAdminUser'), corpo('hasScope'), corpo('isDegustacao'), corpo('currentPlanKey'), corpo('planRank'),
    corpo('trialUsed'), corpo('trialLeft'), corpo('degStart'), corpo('degDiasRestantes'), corpo('degExpired'),
    corpo('muralDegDiasRestantes'), corpo('muralTrialActive'), corpo('consumeTrial'), corpo('canSeePanel'),
    corpo('homePanel'), corpo('maybeTrialModal'), corpo('degHash'), corpo('provasPool'),
  ].join('\n'), c);
  return c;
}
const run = (c, codigo) => vm.runInContext(codigo, c);

// ── 1. Enquanto a lista não chega, nada decide contra o aluno ────────────────
{
  const c = caixa();
  for (let i = 0; i < 60; i++) c.provasDB.push({ code: 'E' + i, stem: 'q' + i, inst: 'Endodirect' });
  for (let i = 0; i < 5; i++) c.provasDB.push({ code: 'T' + i, stem: 't' + i, inst: 'TEEM' });
  ok(run(c, 'acessosPendentes()') === true, 'pendente: aluno real sem lista = acessos pendentes');
  ok(run(c, 'isDegustacao()') === true, 'pendente: isDegustacao continua a semântica antiga (lista vazia) — o que muda é quem a consulta');
  ok(run(c, 'degExpired()') === false, 'pendente: a degustação NÃO está vencida enquanto não se sabe se há degustação');
  ['dash', 'quest', 'qotd', 'flash', 'sim', 'mural', 'resu', 'presc'].forEach((p) => {
    ok(run(c, 'canSeePanel("' + p + '")') === true, 'pendente: o painel ' + p + ' abre (o conteúdo em si já vem filtrado do servidor)');
  });
  ok(run(c, 'homePanel()') === 'dash', 'pendente: a tela inicial é o Dashboard, não o cartão de bloqueio');
  ok(run(c, 'consumeTrial("sim")') === true && c.degTrials.sim === undefined, 'pendente: a cota de degustação não é debitada (nem bloqueia)');
  run(c, 'maybeTrialModal()');
  ok(c.trialModalSeen === false && c.chamadas.modal === 0, 'pendente: a janela "sua degustação terminou" não aparece');
  ok(run(c, 'provasPool().length') === 65, 'pendente: o banco não vira a amostra de 50 (o servidor já mandou só o que o aluno pode ver)');
  ok(c.chamadas.assine === 0, 'pendente: ninguém foi mandado para a tela de assinatura');
}
// degExpired não pode "inventar" o início da degustação enquanto pendente:
// degStart() grava __start=agora se não houver — para um Gold sem lista ainda,
// isso contaminaria o app_state dele com uma degustação que nunca existiu.
{
  const c = caixa({ degTrials: {} });
  ok(run(c, 'degExpired()') === false && c.degTrials.__start === undefined, 'pendente: degExpired não chama degStart (não grava um início de degustação falso)');
}
// Admin e conta demo nunca ficam "pendentes".
{
  const c = caixa({ currentUser: { id: 'A1', role: 'admin', email: 'a@x' } });
  ok(run(c, 'acessosPendentes()') === false, 'admin: nunca pendente');
  const d = caixa({ currentUser: { role: 'aluno', email: 'demo@x' } });
  ok(run(d, 'acessosPendentes()') === false, 'demo (sem id): nunca pendente — os acessos vêm embutidos no login');
}

// ── 2. A lista chega: Gold ───────────────────────────────────────────────────
{
  const c = caixa({ document: documentoFalso({ painel: 'dash' }) });
  run(c, 'definirAcessos(["plano","plano:gold","curso:emc"])');
  ok(c.acessosConhecidos === true && run(c, 'acessosPendentes()') === false, 'Gold: a lista chegou → não está mais pendente');
  ok(run(c, 'isDegustacao()') === false && run(c, 'canSeePanel("sim")') === true, 'Gold: não é degustação e abre o OSCE');
  ok(c._ls.acessos && c._ls.acessos.uid === 'u1' && c._ls.acessos.lista.length === 3, 'Gold: a lista é guardada no aparelho para o próximo boot');
  ok(c.chamadas.goPanel.length === 0, 'Gold no Dashboard: o painel aberto era permitido → não navega de novo (não arranca o aluno do que estava fazendo)');
  ok(c.trialModalSeen === false, 'Gold: nenhuma janela de degustação');
}
// Preso na tela de bloqueio (o caso do feedback): a lista chega → sai dela.
{
  const c = caixa({ document: documentoFalso({ painel: 'flash', bloqueado: true }) });
  run(c, 'definirAcessos(["plano:gold"])');
  ok(JSON.stringify(c.chamadas.goPanel) === JSON.stringify(['flash']), 'bloqueado → Gold: reavalia e reabre o painel que estava marcado no menu (goPanel("flash")), não um painel arbitrário');
}
{
  const c = caixa({ document: documentoFalso({ bloqueado: true }) }); // bloqueio sem item de menu aceso
  run(c, 'definirAcessos(["plano:gold"])');
  ok(JSON.stringify(c.chamadas.goPanel) === JSON.stringify(['dash']), 'bloqueado sem item aceso → Gold: volta para a tela inicial (homePanel)');
}
// No Banco de questões, a lista chegando refaz o que depende do plano.
{
  const c = caixa({ document: documentoFalso({ painel: 'quest' }), degTrials: { __start: Date.now() } });
  run(c, 'definirAcessos([])'); // degustação recém-começada: o Banco continua permitido
  ok(c.chamadas.goPanel.length === 0 && c.chamadas.quest === 1, 'quest + degustação vigente: não navega, mas reaplica a amostra/abas da degustação');
}

// ── 3. A lista chega VAZIA e a degustação está mesmo vencida: bloqueia ───────
{
  const c = caixa({ document: documentoFalso({ painel: 'qotd' }) });
  run(c, 'definirAcessos([])');
  ok(run(c, 'acessosPendentes()') === false && run(c, 'isDegustacao()') === true, 'vencida: lista vazia conhecida = degustação de verdade');
  ok(run(c, 'degExpired()') === true, 'vencida: 100 dias depois do início, está encerrada');
  ok(run(c, 'canSeePanel("qotd")') === false && run(c, 'canSeePanel("dash")') === false, 'vencida: Questão do Dia e Dashboard fecham');
  ok(run(c, 'canSeePanel("perfil")') === true && run(c, 'canSeePanel("support")') === true && run(c, 'canSeePanel("aovivo")') === true, 'vencida: Perfil, Suporte e Aula ao vivo continuam abertos (decisão de 06/08)');
  ok(JSON.stringify(c.chamadas.goPanel) === JSON.stringify(['qotd']), 'vencida: o painel aberto deixou de ser permitido → goPanel refaz a navegação (que mostra o cartão de bloqueio)');
  ok(c.trialModalSeen === true && c.chamadas.modal >= 1 && /Sua degustação terminou/.test(c.document.modalBody.innerHTML), 'vencida: a janela "sua degustação terminou" aparece AGORA (foi adiada enquanto pendente)');
  ok(run(c, 'canSeePanel("sim")') === false && run(c, 'canSeePanel("flash")') === false, 'vencida: OSCE e Flashcards fecham (o portão é canSeePanel; a cota nem chega a ser consultada)');
}
// Lista vazia com degustação em curso (começou hoje): abre o que a degustação libera.
{
  const c = caixa({ degTrials: { __start: Date.now() - 1 * DIA }, document: documentoFalso({ painel: 'dash' }) });
  run(c, 'definirAcessos([])');
  ok(run(c, 'canSeePanel("dash")') === true && run(c, 'canSeePanel("sim")') === true && run(c, 'canSeePanel("art")') === false, 'degustação em curso: Dashboard e OSCE (cota) abrem; o Resumidor (só pacotes) não');
  ok(c.chamadas.goPanel.length === 0, 'degustação em curso no Dashboard: não navega');
  ok(c.trialModalSeen === false, 'degustação em curso com 6 dias restantes: sem janela (só na reta final)');
}

// ── 4. Fiação no index.html ──────────────────────────────────────────────────
{
  const i = html.lastIndexOf('doLogin=function(u){');
  const dl = html.slice(i, i + 4000);
  ok(/acessosConhecidos=false;\s*if\(Array\.isArray\(u\.acessos\)\)\{userAcessos=u\.acessos\.slice\(\);acessosConhecidos=true;\}/.test(dl), 'doLogin: zera o estado e a conta demo nasce com a lista conhecida');
  ok(/else if\(u\.id\)\{var _acG=acessosGuardados\(u\.id\);userAcessos=_acG\|\|\[\];acessosConhecidos=!!_acG;\}/.test(dl), 'doLogin: aluno real só tem a lista "conhecida" se havia cópia DESTA conta no aparelho');
  const lo = corpo('doLogout');
  ok(/userAcessos=\[\];acessosConhecidos=false;/.test(lo), 'doLogout: a próxima sessão começa sem lista e sem decisão');
  const csp = corpo('canSeePanel');
  const iCursos = csp.indexOf("if(id==='cursos')return true;"), iPend = csp.indexOf('if(acessosPendentes())return true;'), iDeg = csp.indexOf('if(isDegustacao()){');
  ok(iCursos > 0 && iPend > iCursos && iDeg > iPend, 'canSeePanel: a guarda de pendência vem ANTES do ramo da degustação (e depois de cursos)');
  ok(/function degExpired\(\)\{return !acessosPendentes\(\)&&isDegustacao\(\)&&/.test(html), 'degExpired: pendente nunca está vencido — e a guarda vem primeiro (não chama degStart)');
  ok(/function consumeTrial\(id\)\{\s*if\(!isDegustacao\(\)\|\|acessosPendentes\(\)\)return true;/.test(html), 'consumeTrial: pendente não debita cota');
  ok(/function maybeTrialModal\(\)\{\s*if\(trialModalSeen\|\|acessosPendentes\(\)\|\|!isDegustacao\(\)\)return;/.test(html), 'maybeTrialModal: pendente não mostra a janela');
  ok(/if\(isDegustacao\(\)&&!acessosPendentes\(\)\)\{\s*if\(!bar\)\{/.test(corpo('renderDegustacaoBar')), 'renderDegustacaoBar: pendente não mostra a faixa amarela');
  ok(/var label=k\?labels\[k\]:\(acessosPendentes\(\)\?'…':'Degustação'\);/.test(corpo('updatePlanBadge')), 'updatePlanBadge: pendente mostra "…", não "Degustação"');
  ok(/function applyQuestDegustacao\(\)\{\s*if\(!isDegustacao\(\)\|\|acessosPendentes\(\)\)return;/.test(html), 'applyQuestDegustacao: pendente não força as abas da degustação');
  ok(/function provasPool\(\)\{\s*if\(!isDegustacao\(\)\|\|acessosPendentes\(\)\)return provasDB;/.test(html), 'provasPool: pendente não corta o banco em 50');
  const upi = corpo('updateProvaInfo');
  ok(/var hideAno=\(isDegustacao\(\)&&!acessosPendentes\(\)\)\|\|inst==='Endodirect';/.test(upi) && /else if\(isDegustacao\(\)&&!acessosPendentes\(\)\)\{/.test(upi), 'updateProvaInfo: pendente não escreve "Degustação: mostrando…" nem esconde o ano');
  ok(/if\(isDegustacao\(\)&&!acessosPendentes\(\)\)\{showAssineScreen/.test(corpo('explicarAlternativas')), 'explicarAlternativas: pendente não manda para a tela de assinatura');
  const da = corpo('definirAcessos');
  ok(/acessosConhecidos=true;/.test(da) && /reavaliarPainelAtual\(\)/.test(da) && /maybeTrialModal\(\)/.test(da), 'definirAcessos: marca a lista como conhecida, reavalia o painel e só então oferece a janela de degustação');
  ok(da.indexOf('reavaliarPainelAtual()') < da.indexOf('maybeTrialModal()'), 'definirAcessos: reavaliar o painel vem antes da janela (a janela pode cobrir o cartão de bloqueio)');
  // O hydrate: a tela só é refeita (refreshAfterRemoteState → maybeTrialModal)
  // depois de carregarAcessos terminar — e carregarAcessos nunca rejeita.
  const hyd = corpo('hydrateRemoteState');
  ok(/loads\.push\(carregarAcessos\(client\)\)/.test(hyd) && /Promise\.all\(loads\)/.test(hyd) && hyd.indexOf('refreshAfterRemoteState()') > hyd.indexOf('Promise.all(loads)'), 'hydrate: refreshAfterRemoteState roda depois de a chamada dos acessos terminar');
  const ca = corpo('carregarAcessos');
  const iCatch = ca.indexOf('.catch(function(e){');
  ok(iCatch > 0 && ca.slice(iCatch).indexOf('throw') < 0, 'carregarAcessos: a falha é engolida (3 tentativas, depois warn) — nunca rejeita o Promise.all do hydrate');
  ok(/try\{maybeTrialModal\(\);\}catch\(e\)\{\}/.test(corpo('refreshAfterRemoteState')), 'refreshAfterRemoteState: ainda chama maybeTrialModal (caminho normal, lista já conhecida)');
  // reavaliarPainelAtual só mexe na navegação do aluno (nunca do admin) e lê o item ACESO do menu.
  const rp = corpo('reavaliarPainelAtual');
  ok(/if\(!currentUser\|\|currentUser\.role==='admin'\)return;/.test(rp) && /querySelector\('\.sb-item\[data-p\]\.on'\)/.test(rp) && /getElementById\('panel-locked'\)/.test(rp), 'reavaliarPainelAtual: só aluno; lê o item aceso e a tela de bloqueio');
  ok(/if\(naTelaDeBloqueio\|\|\(id&&!canSeePanel\(id\)\)\)\{goPanel\(id\|\|homePanel\(\)\);return;\}/.test(rp), 'reavaliarPainelAtual: navega de novo só se estava bloqueado ou o painel deixou de ser permitido');
  ok(/if\(bloq&&bloq\.classList\.contains\('on'\)\)/.test(corpo('showLockedPanel').replace(/\s+/g, ' ')) || /p\.classList\.add\('on'\)/.test(corpo('showLockedPanel')), 'showLockedPanel: o cartão de bloqueio é o painel #panel-locked com classe on (é o que reavaliarPainelAtual procura)');
}

if (falhas.length) {
  console.error('test-acessos-pendentes: ' + falhas.length + ' falha(s)');
  falhas.forEach((f) => console.error('  ✗ ' + f));
  process.exit(1);
}
console.log('test-acessos-pendentes: ok (pendente não decide contra o aluno; lista chega → reavalia o painel; degustação vencida de verdade continua bloqueada; fiação)');
