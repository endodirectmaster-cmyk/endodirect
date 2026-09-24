// O BANCO DE QUESTÕES NÃO FICA MUDO QUANDO A CARGA CAI — E O GOLD NÃO VIRA DEGUSTAÇÃO.
//
// ⚠️ 24/09/2026. Feedback de uma assinante Gold: "as questões não aparecem para
// mim". No servidor a RPC devolvia as 2.085 questões dela sem erro; o que caía
// era a travessia de 12 MB numa resposta só, no celular. O cliente engolia a
// falha num console.warn (sem tentar de novo), o Banco dizia "seu banco tem 0"
// e — pior — os ACESSOS vinham dentro da mesma resposta: sem ela, userAcessos
// ficava vazio e a plataforma tratava a assinante como degustação.
//
// 🧨 O QUE ESTE TESTE PRENDE: (1) o conteúdo tenta 3× e só então marca
// conteudoErro; (2) os acessos têm chamada própria, cache por usuário e não
// vazam entre contas; (3) o Banco tem três estados visíveis — carregando, erro
// com "Tentar de novo", normal; (4) hydrateRemoteState não dispara duas cargas
// para o mesmo usuário; (5) o poll do checkout relê só os acessos; (6) o .sql
// versionado do member_content deixou de mandar diretrizes e janelou o radar.
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const RAIZ = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(RAIZ, 'index.html'), 'utf8');
const sql = fs.readFileSync(path.join(RAIZ, 'supabase', 'member-content-mais-leve.sql'), 'utf8');
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

// ── Caixa de areia: só o que as funções precisam, nada de DOM real ───────────
function caixa(extra) {
  const ls = {};
  const c = Object.assign({
    console: { warn() {}, log() {} },
    Date, Number, Array, String, Promise, Object,
    setTimeout: (fn) => { fn(); return 0; }, // a espera entre tentativas não conta aqui
    lsGet: (k) => (k in ls ? ls[k] : null),
    lsSet: (k, v) => { ls[k] = v; },
    _ls: ls,
    currentUser: { id: 'U1', role: 'aluno' },
    userAcessos: [],
    remoteStateLoaded: false, remoteStateWarned: false,
    provasDB: [],
    aplicados: [],
    applyStatePayload: function (p) { c.aplicados.push(p); if (Array.isArray(p.provas)) c.provasDB = p.provas; },
    updatePlanBadge() {}, markLockedNavItems() {}, renderDegustacaoBar() {},
    refreshAfterRemoteState() { c.refrescou = (c.refrescou || 0) + 1; },
    isDegustacao: () => false,
    getSupabaseClient: () => c.client,
    client: null,
  }, extra || {});
  vm.createContext(c);
  vm.runInContext([
    'var conteudoErro=false;var conteudoEmVoo=null;',
    'var ACESSOS_GUARDADOS_MS=' + (html.match(/var ACESSOS_GUARDADOS_MS=([^;]+);/) || [, '0'])[1] + ';',
    corpo('esc'), corpo('ldHTML'), corpo('erroDeRede'),
    corpo('contaAtual'), corpo('mesmaContaQue'), corpo('conteudoEmVooDesta'),
    corpo('carregarConteudo'), corpo('recarregarConteudo'),
    corpo('definirAcessos'), corpo('acessosGuardados'), corpo('carregarAcessos'),
    'function provasPool(){return provasDB;}',
    corpo('bancoEstado'), corpo('bancoEstadoHTML'),
  ].join('\n'), c);
  return c;
}
// Cliente falso: falha `falhas` vezes antes de responder `dados`.
function clienteQueFalha(nFalhas, dados) {
  const st = { chamadas: 0 };
  st.rpc = function (nome) {
    st.chamadas++;
    st.ultimo = nome;
    if (st.chamadas <= nFalhas) return Promise.reject(new Error('conexão caiu'));
    return Promise.resolve({ data: dados, error: null });
  };
  return st;
}

(async function () {
  // ── 1. Conteúdo: 3 tentativas, depois conteudoErro ───────────────────────
  {
    const c = caixa();
    const cli = clienteQueFalha(99, null);
    await vm.runInContext('carregarConteudo(client)', Object.assign(c, { client: cli }));
    ok(cli.chamadas === 3, 'conteúdo: esperava 3 tentativas antes de desistir, fez ' + cli.chamadas);
    ok(c.conteudoErro === true, 'conteúdo: após esgotar, conteudoErro tem de ser true');
    ok(cli.ultimo === 'endodirect_member_content', 'conteúdo: a RPC chamada é endodirect_member_content');
  }
  {
    const c = caixa();
    const cli = clienteQueFalha(2, { provas: [{ stem: 'q1' }] });
    await vm.runInContext('carregarConteudo(client)', Object.assign(c, { client: cli }));
    ok(cli.chamadas === 3, 'conteúdo: a 3ª tentativa ainda vale (fez ' + cli.chamadas + ')');
    ok(c.conteudoErro === false, 'conteúdo: sucesso na 3ª tentativa limpa conteudoErro');
    ok(c.aplicados.length === 1 && c.provasDB.length === 1, 'conteúdo: o payload que chegou foi aplicado');
  }
  // Só erro de REDE vale repetição: código do PostgREST/4xx não se resolve baixando de novo.
  {
    const c = caixa();
    const cli = { chamadas: 0, rpc() { cli.chamadas++; return Promise.resolve({ data: null, error: { message: 'permission denied', code: '42501' } }); } };
    await vm.runInContext('carregarConteudo(client)', Object.assign(c, { client: cli }));
    ok(cli.chamadas === 1, 'conteúdo: erro com código (42501) NÃO repete (fez ' + cli.chamadas + ')');
    ok(c.conteudoErro === true, 'conteúdo: erro com código ainda marca conteudoErro (a tela precisa dizer)');
  }
  {
    const c = caixa();
    const cli = { chamadas: 0, rpc() { cli.chamadas++; return Promise.resolve({ data: null, error: { message: 'gateway', code: '504' } }); } };
    await vm.runInContext('carregarConteudo(client)', Object.assign(c, { client: cli }));
    ok(cli.chamadas === 3, 'conteúdo: 5xx (tempo esgotado no gateway) repete até 3× (fez ' + cli.chamadas + ')');
    ok(vm.runInContext('erroDeRede({message:"TypeError: Failed to fetch"})', c) === true, 'erroDeRede: sem código = rede');
    ok(vm.runInContext('erroDeRede({code:"PGRST301"})', c) === false, 'erroDeRede: PGRST não é rede');
    ok(vm.runInContext('erroDeRede(null)', c) === true, 'erroDeRede: erro vazio conta como rede');
  }
  // Uma carga de conteúdo em voo por vez: quem chamar de novo recebe a mesma promessa.
  {
    const c = caixa();
    let solta;
    const cli = { chamadas: 0, rpc() { cli.chamadas++; return new Promise((r) => { solta = r; }); } };
    c.client = cli;
    const p = vm.runInContext('carregarConteudo(client); carregarConteudo(client); recarregarConteudo();', c);
    ok(cli.chamadas === 1, 'em voo: três pedidos simultâneos = UMA chamada (fez ' + cli.chamadas + ')');
    ok(!!(c.conteudoEmVoo && c.conteudoEmVoo.uid === 'U1'), 'em voo: a guarda sabe de que conta é a carga');
    // Só a carga em voo pode explicar o "carregando" aqui: o hydrate já terminou.
    c.remoteStateLoaded = true;
    ok(vm.runInContext('bancoEstado()', c) === 'carregando', 'em voo: o Banco diz "carregando" enquanto a carga não volta (mesmo com o hydrate concluído — é o caso do Tentar de novo)');
    solta({ data: { provas: [{ stem: 'q' }] }, error: null });
    await p; await new Promise((r) => setImmediate(r));
    ok(c.conteudoEmVoo === null, 'em voo: a guarda é solta ao terminar');
    ok(c.provasDB.length === 1, 'em voo: o payload da carga única foi aplicado');
  }
  // Troca de conta com a carga em voo: a conta nova faz a SUA chamada, e a
  // resposta da anterior é descartada — não aplicada, nem contada como erro.
  {
    const c = caixa();
    const pend = [];
    const cli = { chamadas: 0, rpc() { cli.chamadas++; return new Promise((r) => { pend.push(r); }); } };
    c.client = cli;
    const pA = vm.runInContext('carregarConteudo(client)', c);           // conta U1 pede
    c.currentUser = { id: 'U2', role: 'aluno' };                          // sai e entra U2
    ok(vm.runInContext('conteudoEmVooDesta()', c) === false, 'troca: a carga em voo NÃO é desta conta');
    const pB = vm.runInContext('carregarConteudo(client)', c);
    ok(cli.chamadas === 2, 'troca: a conta nova faz a própria chamada (fez ' + cli.chamadas + ')');
    ok(!!(c.conteudoEmVoo && c.conteudoEmVoo.uid === 'U2'), 'troca: a guarda passa a ser da conta nova');
    pend[0]({ data: { provas: [{ stem: 'de-A' }] }, error: null });      // resposta de U1 chega tarde
    await pA; await new Promise((r) => setImmediate(r));
    ok(c.provasDB.length === 0, 'troca: a resposta da conta anterior NÃO é aplicada na nova');
    ok(!!(c.conteudoEmVoo && c.conteudoEmVoo.uid === 'U2'), 'troca: a resposta atrasada não solta a guarda da conta nova');
    pend[1]({ data: { provas: [{ stem: 'de-B' }] }, error: null });
    await pB; await new Promise((r) => setImmediate(r));
    ok(c.provasDB.length === 1 && c.provasDB[0].stem === 'de-B', 'troca: a conta nova recebe o próprio conteúdo');
    ok(c.conteudoEmVoo === null, 'troca: guarda solta ao terminar');
  }
  // recarregarConteudo: zera o erro, tenta de novo e refaz a tela ao terminar
  {
    const c = caixa();
    c.conteudoErro = true;
    c.client = clienteQueFalha(0, { provas: [{ stem: 'q1' }] });
    await vm.runInContext('recarregarConteudo()', c);
    ok(c.conteudoErro === false && c.provasDB.length === 1, 'recarregar: carrega e limpa o erro');
    ok(c.refrescou === 1, 'recarregar: chama refreshAfterRemoteState uma vez ao terminar');
  }
  // sem sessão real (demo) recarregar não chama nada
  {
    const c = caixa({ currentUser: { role: 'aluno' } });
    c.client = clienteQueFalha(0, {});
    await vm.runInContext('recarregarConteudo()', c);
    ok(c.client.chamadas === 0, 'recarregar: conta demo (sem id) não chama a RPC');
  }

  // ── 2. Acessos: chamada própria, cache por usuário, sem vazar entre contas ──
  {
    const c = caixa();
    const cli = clienteQueFalha(1, ['plano', 'plano:gold', 'curso:emc']);
    await vm.runInContext('carregarAcessos(client)', Object.assign(c, { client: cli }));
    ok(cli.ultimo === 'endodirect_acessos_ativos', 'acessos: a RPC chamada é endodirect_acessos_ativos');
    ok(cli.chamadas === 2, 'acessos: tenta de novo após uma falha (fez ' + cli.chamadas + ')');
    ok(JSON.stringify(c.userAcessos) === JSON.stringify(['plano', 'plano:gold', 'curso:emc']), 'acessos: userAcessos definido pela resposta');
    const g = c._ls.acessos;
    ok(g && g.uid === 'u1' && Array.isArray(g.lista) && g.lista.length === 3, 'acessos: guardados no aparelho com o uid do usuário');
    ok(JSON.stringify(vm.runInContext('acessosGuardados("U1")', c)) === JSON.stringify(g.lista), 'acessos: acessosGuardados devolve a lista do mesmo usuário (uid sem distinção de caixa)');
    ok(vm.runInContext('acessosGuardados("U2")', c) === null, 'acessos: outro usuário NÃO herda os acessos guardados');
    ok(vm.runInContext('acessosGuardados("")', c) === null, 'acessos: uid vazio não casa com nada');
    c._ls.acessos = { uid: 'u1', lista: ['plano'], at: Date.now() - 31 * 86400000 };
    ok(vm.runInContext('acessosGuardados("U1")', c) === null, 'acessos: cópia com mais de 30 dias não vale');
    c._ls.acessos = { uid: 'u1', lista: ['plano'] };
    ok(vm.runInContext('acessosGuardados("U1")', c) === null, 'acessos: cópia sem data não vale');
  }
  {
    const c = caixa();
    const cli = clienteQueFalha(99, null);
    await vm.runInContext('carregarAcessos(client)', Object.assign(c, { client: cli }));
    ok(cli.chamadas === 3, 'acessos: esgota em 3 tentativas (fez ' + cli.chamadas + ')');
    ok(c.userAcessos.length === 0, 'acessos: falha total não inventa acesso');
  }
  {
    const c = caixa();
    vm.runInContext('definirAcessos("plano")', c);
    ok(c.userAcessos.length === 0 && !c._ls.acessos, 'definirAcessos: ignora o que não é lista');
  }

  // ── 3. Os três estados do Banco ─────────────────────────────────────────
  {
    const c = caixa();
    c.client = {};
    ok(vm.runInContext('bancoEstado()', c) === 'carregando', 'estado: banco vazio + carga em andamento = carregando');
    c.conteudoErro = true;
    ok(vm.runInContext('bancoEstado()', c) === 'erro', 'estado: conteudoErro vence tudo enquanto o banco está vazio');
    c.conteudoErro = false; c.remoteStateLoaded = true;
    ok(vm.runInContext('bancoEstado()', c) === '', 'estado: carga concluída e banco vazio de verdade = normal (sem mensagem falsa)');
    c.remoteStateLoaded = false; c.remoteStateWarned = true;
    ok(vm.runInContext('bancoEstado()', c) === '', 'estado: se o Supabase já avisou falha geral, não fica em "carregando" para sempre');
    c.remoteStateWarned = false; c.provasDB = [{ stem: 'q' }]; c.conteudoErro = true;
    ok(vm.runInContext('bancoEstado()', c) === '', 'estado: com questões na mão, nenhum aviso — mesmo que a recarga tenha falhado');
    const erro = vm.runInContext('bancoEstadoHTML("erro")', c);
    ok(/id="btn-banco-retry"/.test(erro), 'HTML de erro: tem o botão Tentar de novo');
    ok(/Não foi possível carregar o banco de questões/.test(erro), 'HTML de erro: diz o que houve');
    ok(!/Nenhuma questão/.test(erro), 'HTML de erro: não diz "Nenhuma questão" (as questões existem)');
    ok(/Carregando o banco de questões/.test(vm.runInContext('bancoEstadoHTML("carregando")', c)), 'HTML de carga: diz que está carregando');
    ok(vm.runInContext('bancoEstadoHTML("")', c) === '', 'HTML normal: vazio');
  }

  // ── 4. Fiação no index.html (âncoras literais) ───────────────────────────
  {
    const hyd = corpo('hydrateRemoteState');
    ok(/remoteStateEmVoo&&remoteStateEmVoo\.uid===currentUser\.id\)return remoteStateEmVoo\.p;/.test(hyd), 'hydrate: guarda de carga em voo por usuário');
    ok(/loads\.push\(carregarAcessos\(client\)\)/.test(hyd), 'hydrate: acessos em chamada própria');
    ok(/loads\.push\(carregarConteudo\(client\)/.test(hyd), 'hydrate: conteúdo com tentativas');
    ok(hyd.indexOf("client.rpc('endodirect_member_content')") < 0, 'hydrate: não chama o member_content direto (sem tentativas) em lugar nenhum');
    ok(/remoteStateEmVoo=\{uid:currentUser\.id,p:emVoo\};/.test(hyd), 'hydrate: registra a carga em voo');
    const iSolta = hyd.indexOf('.then(function(){if(remoteStateEmVoo&&remoteStateEmVoo.p===emVoo)remoteStateEmVoo=null;})');
    const iCatchHyd = hyd.indexOf('}).catch(function(e){');
    ok(iSolta > 0 && iCatchHyd > 0 && iSolta > iCatchHyd, 'hydrate: solta a guarda DEPOIS do .catch (sucesso ou falha) — antes dele, uma rejeição deixaria a guarda presa para sempre');
    ok(/var uid=currentUser\.id,gen=\+\+remoteStateGen;/.test(hyd) && /function mesmaConta\(\)\{return gen===remoteStateGen&&contaAtual\(\)===uid;\}/.test(hyd), 'hydrate: a resposta vale só para a mesma conta E a mesma geração de sessão');
    ok((hyd.match(/if\(!mesmaConta\(\)\)return;/g) || []).length >= 2, 'hydrate: o fecho E o .catch conferem a sessão (o .catch decidia o onboarding da conta seguinte)');
    ok(/if\(mesmaConta\(\)&&res\.data&&res\.data\.payload\)applyStatePayload\(res\.data\.payload,true\);/.test(hyd), 'hydrate: app_state só é aplicado à sessão que o pediu');
    const pub = corpo('hydratePublicContent');
    ok(/var gen=\+\+remoteStateGen;/.test(pub) && (pub.match(/mesmaSessao\(\)/g) || []).length >= 3, 'hydratePublicContent (demo): também tem geração de sessão — não liga remoteStateLoaded para uma conta real que entrou no meio');
    const cc = corpo('carregarConteudo');
    ok((cc.match(/if\(!mesmaContaQue\(uid\)\)return;/g) || []).length === 2 && /if\(tentativa===1&&conteudoEmVoo&&conteudoEmVoo\.uid===uid\)return conteudoEmVoo\.p;/.test(cc), 'carregarConteudo: guarda por conta na resposta, na falha e na promessa em voo');
    const ca = corpo('carregarAcessos');
    ok((ca.match(/if\(!mesmaContaQue\(uid\)\)return;/g) || []).length === 2, 'carregarAcessos: guarda por conta na resposta e na falha');
    const tr = corpo('tentarResumos');
    ok((tr.match(/if\(!mesmaContaQue\(uid\)\)return;/g) || []).length === 2 && /return tentarResumos\(client,rpc,tentativa,contaAtual\(\)\);/.test(corpo('carregarResumos')), 'Resumos: os capítulos privados de uma conta em voo não são aplicados na sessão da conta seguinte');
    const lo = corpo('doLogout');
    ok(/remoteStateGen\+\+;remoteStateEmVoo=null;conteudoEmVoo=null;conteudoErro=false;userAcessos=\[\];/.test(lo), 'doLogout: cargas em voo ficam órfãs e plano/erro voltam ao zero');
    ok(/carregarConteudo\(client\)\s*\.then\(function\(\)\{return carregarResumos\(client,'endodirect_member_resumos'\);\}\)/.test(hyd), 'hydrate: Resumos seguem vindo depois do conteúdo, sem depender do sucesso dele');
  }
  {
    const poll = corpo('ckStartAutoVerify');
    ok(poll.indexOf('hydrateRemoteState') < 0, 'checkout: o poll NÃO refaz o hydrate inteiro a cada 5 s');
    ok((poll.match(/carregarAcessos\(getSupabaseClient\(\)\)/g) || []).length === 2, 'checkout: o poll relê só os acessos (na largada e a cada volta)');
    const ver = corpo('ckVerify');
    ok(ver.indexOf('hydrateRemoteState') < 0 && /carregarAcessos\(/.test(ver), 'checkout: "Já paguei" relê só os acessos');
    const grant = corpo('ckGrantSuccess');
    ok(/Promise\.all\(\[remoteStateEmVoo\?remoteStateEmVoo\.p:null,conteudoEmVoo\?conteudoEmVoo\.p:null\]\)\.then\(function\(\)\{remoteStateLoaded=false;hydrateRemoteState\(\);\}\)/.test(grant), 'checkout: liberado o acesso, a carga inteira espera as cargas em voo (hydrate E "Tentar de novo" pedido antes da liberação)');
  }
  {
    const apl = corpo('applyStatePayload');
    ok(/if\(Array\.isArray\(payload\.acessos\)\)definirAcessos\(payload\.acessos\);/.test(apl), 'applyStatePayload: acessos passam por definirAcessos (cache + badge)');
    // A versão ATIVA de doLogin é a sobrescrita (doLogin=function). Ela restaura o cache.
    const i = html.lastIndexOf('doLogin=function(u){');
    ok(i > 0, 'doLogin sobrescrito existe');
    const dl = html.slice(i, i + 4000);
    ok(/else if\(u\.id\)\{var _acG=acessosGuardados\(u\.id\);userAcessos=_acG\|\|\[\];\}/.test(dl), 'doLogin: aluno real nasce com os acessos guardados neste aparelho — e com NADA quando não há cópia desta conta');
    ok(/conteudoErro=false; \/\/ o erro \(se houve\) era da sessão anterior/.test(dl), 'doLogin: o erro de conteúdo da sessão anterior não passa para a nova');
  }
  {
    const upi = corpo('updateProvaInfo');
    ok(/var estado=bancoEstado\(\);/.test(upi), 'updateProvaInfo: consulta o estado do banco');
    const iCarr = upi.indexOf("if(estado==='carregando')"), iDeg = upi.indexOf('else if(isDegustacao()){');
    ok(iCarr >= 0 && iDeg >= 0 && iCarr < iDeg, 'updateProvaInfo: carregando/erro vêm ANTES da faixa de degustação (sem acessos, um Gold pareceria degustação) — e os dois ramos existem');
    ok(/if\(estado\)\{var rs=document\.getElementById\('q-gen-results'\);if\(rs\)rs\.innerHTML=bancoEstadoHTML\(estado\);\}/.test(upi), 'updateProvaInfo: a área de resultados mostra o estado');
    const rpr = corpo('renderProvaResults');
    ok(/bancoEstado\(\)/.test(rpr) && /bancoEstadoHTML\(_est\)/.test(rpr), 'renderProvaResults: busca vazia durante carga/erro mostra o estado, não "Nenhuma questão encontrada"');
    ok(/document\.getElementById\('q-gen-results'\)\.addEventListener\('click',function\(e\)\{\s*var b=e\.target&&e\.target\.closest\?e\.target\.closest\('#btn-banco-retry'\):null;\s*if\(b\)bancoTentarDeNovo\(b\);/.test(html), 'Banco: o clique em Tentar de novo está ligado (delegado no contêiner)');
    const tdn = corpo('bancoTentarDeNovo');
    ok(/recarregarConteudo\(\)/.test(tdn) && /btn-filter-provas/.test(tdn), 'Tentar de novo: recarrega e refaz a busca do aluno');
  }

  // ── 5. O .sql versionado do member_content ──────────────────────────────
  {
    ok(/create or replace function public\.endodirect_member_content\(\)/.test(sql), 'sql: define endodirect_member_content');
    ok(!/'diretrizes',/.test(sql) && !/'diretrizes_temas',/.test(sql), 'sql: diretrizes/diretrizes_temas NÃO saem mais daqui (vêm de member_resumos)');
    ok(/limit 200\)/.test(sql), 'sql: radar janelado nos 200 mais recentes');
    ok((sql.match(/where not \(\(select hidden from h\) \? coalesce\(v->>'sourceId', v->>'link', v->>'titulo',''\)\)/g) || []).length === 2, 'sql: o filtro de radar_hidden está nas DUAS metades do mural (avisos do professor e radar) — comentário não conta');
    ok(/'radar_hidden', \(select hidden from h\)/.test(sql), 'sql: radar_hidden entregue ao cliente');
    ok(/'provas',/.test(sql) && /@> array\['plano'\]/.test(sql) && /@> array\['curso:endoteem'\]/.test(sql) && /limit 50/.test(sql), 'sql: os ramos das questões (plano, endoteem, degustação 50) seguem iguais');
    ok(/'acervo_totais', public\.endodirect_acervo_totais\(\)/.test(sql), 'sql: acervo_totais segue (o Dashboard conta com ele)');
    ['podcasts', 'mm_shared', 'fc_shared', 'adm_cursos', 'cursos', 'acessos', 'member'].forEach(function (k) {
      ok(sql.indexOf("'" + k + "',") >= 0, 'sql: chave ' + k + ' segue na resposta');
    });
    ok(/endodirect_mural_radar_more/.test(sql), 'sql: documenta de onde vem o resto do radar');
  }

  if (falhas.length) {
    console.error('test-banco-nao-fica-mudo: ' + falhas.length + ' falha(s)');
    falhas.forEach((f) => console.error('  ✗ ' + f));
    process.exit(1);
  }
  console.log('test-banco-nao-fica-mudo: ok (conteúdo 3×, acessos próprios com cache, 3 estados do Banco, guarda em voo, poll leve, sql janelado)');
})().catch((e) => { console.error(e); process.exit(1); });
