// O BANCO DE QUESTÕES NÃO FICA MUDO QUANDO A CARGA CAI — E O GOLD NÃO VIRA DEGUSTAÇÃO.
//
// ⚠️ 24/09/2026. Feedback de uma assinante Gold: "as questões não aparecem para
// mim". No servidor a RPC devolvia as 2.085 questões dela sem erro; o que caía
// era a travessia de 12 MB numa resposta só, no celular. O cliente engolia a
// falha num console.warn (sem tentar de novo), o Banco dizia "seu banco tem 0"
// e — pior — os ACESSOS vinham dentro da mesma resposta: sem ela, userAcessos
// ficava vazio e a plataforma tratava a assinante como degustação.
//
// ⚠️ 12/10/2026. As questões saíram do member_content (eram 71% dos 5,43 MB do
// Gold; 5,67 MB sozinhas para quem tem o EndoTEEM) e passaram a vir em páginas
// de 500 por `endodirect_member_provas_pagina`, em paralelo com o conteúdo
// (`endodirect_member_content_sem_provas`).
//
// 🧨 O QUE ESTE TESTE PRENDE: (1) o conteúdo tenta 3× e só então marca
// conteudoErro; (1b) as questões chegam em páginas, cada uma com 3 tentativas,
// nunca se juntam páginas de versões diferentes, nada parcial é aplicado e a
// falha marca provasErro; (2) os acessos têm chamada própria, cache por usuário
// e não vazam entre contas; (3) o Banco tem três estados visíveis — carregando,
// erro com "Tentar de novo", normal — e eles seguem as QUESTÕES; (4)
// hydrateRemoteState não dispara duas cargas para o mesmo usuário; (5) o poll do
// checkout relê só os acessos; (6) o .sql versionado: conteúdo sem diretrizes,
// radar janelado, questões numa função só e o member_content antigo como
// composição.
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const RAIZ = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(RAIZ, 'index.html'), 'utf8');
const sql = fs.readFileSync(path.join(RAIZ, 'supabase', 'provas-em-rpc-propria.sql'), 'utf8');
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
    'var conteudoErro=false;var conteudoEmVoo=null;var provasErro=false;var provasEmVoo=null;',
    'var ACESSOS_GUARDADOS_MS=' + (html.match(/var ACESSOS_GUARDADOS_MS=([^;]+);/) || [, '0'])[1] + ';',
    corpo('esc'), corpo('ldHTML'), corpo('erroDeRede'),
    corpo('contaAtual'), corpo('mesmaContaQue'), corpo('conteudoEmVooDesta'),
    corpo('carregarConteudo'), corpo('recarregarConteudo'),
    corpo('provasEmVooDesta'), corpo('carregarPaginaProvas'), corpo('carregarProvas'), corpo('recarregarProvas'),
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

// Uma promessa que nunca resolve (uma carga presa em voo) faz o Node sair com
// código 0 no meio do teste, sem imprimir nada — e a regressão passaria calada.
let terminou = false;
process.on('exit', (code) => {
  if (!terminou && code === 0) { console.error('test-banco-nao-fica-mudo: o teste parou no meio (alguma carga ficou presa em voo)'); process.exitCode = 1; }
});

(async function () {
  // ── 1. Conteúdo (sem as questões): 3 tentativas, depois conteudoErro ──
  {
    const c = caixa();
    const cli = clienteQueFalha(99, null);
    await vm.runInContext('carregarConteudo(client)', Object.assign(c, { client: cli }));
    ok(cli.chamadas === 3, 'conteúdo: esperava 3 tentativas antes de desistir, fez ' + cli.chamadas);
    ok(c.conteudoErro === true, 'conteúdo: após esgotar, conteudoErro tem de ser true');
    ok(cli.ultimo === 'endodirect_member_content_sem_provas', 'conteúdo: a RPC chamada é endodirect_member_content_sem_provas (veio ' + cli.ultimo + ')');
    ok(c.provasErro === false, 'conteúdo: a falha do conteúdo NÃO marca erro nas questões (são cargas separadas)');
  }
  {
    const c = caixa();
    const cli = clienteQueFalha(2, { podcasts: [{ id: 'p1' }] });
    await vm.runInContext('carregarConteudo(client)', Object.assign(c, { client: cli }));
    ok(cli.chamadas === 3, 'conteúdo: a 3ª tentativa ainda vale (fez ' + cli.chamadas + ')');
    ok(c.conteudoErro === false, 'conteúdo: sucesso na 3ª tentativa limpa conteudoErro');
    ok(c.aplicados.length === 1 && Array.isArray(c.aplicados[0].podcasts), 'conteúdo: o payload que chegou foi aplicado');
  }
  // Só erro de REDE vale repetição: código do PostgREST/4xx não se resolve baixando de novo.
  {
    const c = caixa();
    const cli = { chamadas: 0, rpc() { cli.chamadas++; return Promise.resolve({ data: null, error: { message: 'permission denied', code: '42501' } }); } };
    await vm.runInContext('carregarConteudo(client)', Object.assign(c, { client: cli }));
    ok(cli.chamadas === 1, 'conteúdo: erro com código (42501) NÃO repete (fez ' + cli.chamadas + ')');
    ok(c.conteudoErro === true, 'conteúdo: erro com código ainda marca conteudoErro');
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
    solta({ data: { podcasts: [] }, error: null });
    await p; await new Promise((r) => setImmediate(r));
    ok(c.conteudoEmVoo === null, 'em voo: a guarda é solta ao terminar');
    ok(c.aplicados.length === 1, 'em voo: o payload da carga única foi aplicado uma vez');
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
    pend[0]({ data: { podcasts: [{ id: 'de-A' }] }, error: null });      // resposta de U1 chega tarde
    await pA; await new Promise((r) => setImmediate(r));
    ok(c.aplicados.length === 0, 'troca: a resposta da conta anterior NÃO é aplicada na nova');
    ok(!!(c.conteudoEmVoo && c.conteudoEmVoo.uid === 'U2'), 'troca: a resposta atrasada não solta a guarda da conta nova');
    pend[1]({ data: { podcasts: [{ id: 'de-B' }] }, error: null });
    await pB; await new Promise((r) => setImmediate(r));
    ok(c.aplicados.length === 1 && c.aplicados[0].podcasts[0].id === 'de-B', 'troca: a conta nova recebe o próprio conteúdo');
    ok(c.conteudoEmVoo === null, 'troca: guarda solta ao terminar');
  }
  // recarregarConteudo: zera o erro, tenta de novo e refaz a tela ao terminar
  {
    const c = caixa();
    c.conteudoErro = true;
    c.client = clienteQueFalha(0, { podcasts: [] });
    await vm.runInContext('recarregarConteudo()', c);
    ok(c.conteudoErro === false && c.aplicados.length === 1, 'recarregar conteúdo: carrega e limpa o erro');
    ok(c.refrescou === 1, 'recarregar conteúdo: chama refreshAfterRemoteState uma vez ao terminar');
  }
  // sem sessão real (demo) recarregar não chama nada
  {
    const c = caixa({ currentUser: { role: 'aluno' } });
    c.client = clienteQueFalha(0, {});
    await vm.runInContext('recarregarConteudo()', c);
    ok(c.client.chamadas === 0, 'recarregar conteúdo: conta demo (sem id) não chama a RPC');
  }

  // ── 1b. Questões em páginas: 3 tentativas por página, uma versão só, nada parcial ──
  // Servidor falso de páginas: `banco` é a lista do aluno; `versao` pode mudar
  // entre chamadas (o professor gravando no meio); `falhas[pagina]` derruba a
  // REDE n vezes naquela página; `erro[pagina]` devolve erro com código.
  function servidorDePaginas(banco, opts) {
    opts = opts || {};
    const st = { chamadas: 0, porPagina: {}, nomes: {}, pend: [] };
    const versoes = opts.versoes || [];
    st.rpc = function (nome, args) {
      st.chamadas++;
      st.nomes[nome] = (st.nomes[nome] || 0) + 1;
      if (nome !== 'endodirect_member_provas_pagina') return Promise.resolve({ data: null, error: { message: 'rpc inesperada ' + nome, code: 'X' } });
      const pg = args && args.p_pagina;
      st.porPagina[pg] = (st.porPagina[pg] || 0) + 1;
      const falhas = (opts.falhas || {})[pg] || 0;
      if (st.porPagina[pg] <= falhas) return Promise.reject(new TypeError('Failed to fetch'));
      if (opts.erro && opts.erro[pg]) return Promise.resolve({ data: null, error: opts.erro[pg] });
      if (opts.malformada && opts.malformada[pg]) return Promise.resolve({ data: { versao: 'v', total: banco.length }, error: null });
      // versão vigente: a de índice (nº da chamada à página 0 - 1), se houver troca programada
      const v = typeof opts.versaoDe === 'function' ? opts.versaoDe(st, pg) : 'v1';
      const lista = typeof opts.listaDe === 'function' ? opts.listaDe(v) : banco;
      const por = 500;
      const paginas = opts.paginas || Math.max(1, Math.ceil(lista.length / por));
      const data = { versao: v, total: opts.total != null ? opts.total : lista.length, por_pagina: por, paginas, pagina: pg, itens: lista.slice(pg * por, (pg + 1) * por) };
      if (opts.segura && opts.segura[pg]) return new Promise((r) => st.pend.push(() => r({ data, error: null })));
      return Promise.resolve({ data, error: null });
    };
    return st;
  }
  const banco = (n, pref) => Array.from({ length: n }, (_, i) => ({ code: (pref || 'ED-') + (i + 1), stem: 'q' + (i + 1), inst: 'Endodirect' }));
  {
    const c = caixa();
    const srv = servidorDePaginas(banco(1200));
    await vm.runInContext('carregarProvas(client)', Object.assign(c, { client: srv }));
    ok(srv.nomes.endodirect_member_provas_pagina === 3 && srv.chamadas === 3, 'questões: 1.200 questões = 3 páginas, uma chamada cada (fez ' + JSON.stringify(srv.porPagina) + ')');
    ok(c.provasDB.length === 1200 && c.provasDB[0].code === 'ED-1' && c.provasDB[500].code === 'ED-501' && c.provasDB[1199].code === 'ED-1200', 'questões: as páginas são juntadas NA ORDEM (0, 1, 2)');
    ok(c.aplicados.length === 1 && Object.keys(c.aplicados[0]).join() === 'provas', 'questões: aplicadas UMA vez, só a chave provas');
    ok(c.provasErro === false && c.provasEmVoo === null, 'questões: sem erro e com a guarda solta ao terminar');
  }
  {
    const c = caixa();
    const srv = servidorDePaginas(banco(50));
    await vm.runInContext('carregarProvas(client)', Object.assign(c, { client: srv }));
    ok(srv.chamadas === 1 && c.provasDB.length === 50, 'questões: degustação (50) = uma página só');
  }
  {
    const c = caixa();
    const srv = servidorDePaginas([]);
    await vm.runInContext('carregarProvas(client)', Object.assign(c, { client: srv }));
    ok(srv.chamadas === 1 && c.aplicados.length === 1 && c.provasDB.length === 0 && c.provasErro === false, 'questões: banco vazio de verdade (perfil sem questões) é aplicado como vazio, sem erro');
  }
  {
    const c = caixa();
    const srv = servidorDePaginas(banco(1200), { falhas: { 2: 2 } });
    await vm.runInContext('carregarProvas(client)', Object.assign(c, { client: srv }));
    ok(srv.porPagina[2] === 3 && srv.porPagina[0] === 1 && srv.porPagina[1] === 1, 'questões: a página que caiu é repetida SOZINHA (fez ' + JSON.stringify(srv.porPagina) + ')');
    ok(c.provasDB.length === 1200 && c.provasErro === false, 'questões: a 3ª tentativa da página ainda vale');
  }
  {
    const c = caixa();
    const srv = servidorDePaginas(banco(1200), { falhas: { 1: 99 } });
    await vm.runInContext('carregarProvas(client)', Object.assign(c, { client: srv }));
    ok(srv.porPagina[1] === 3, 'questões: página caída esgota em 3 tentativas (fez ' + srv.porPagina[1] + ')');
    ok(c.provasErro === true, 'questões: página esgotada marca provasErro');
    ok(c.aplicados.length === 0 && c.provasDB.length === 0, 'questões: NADA parcial é aplicado (2 de 3 páginas não viram "seu banco tem 1000")');
  }
  {
    const c = caixa();
    const srv = servidorDePaginas(banco(1200), { falhas: { 0: 99 } });
    await vm.runInContext('carregarProvas(client)', Object.assign(c, { client: srv }));
    ok(srv.porPagina[0] === 3 && !srv.porPagina[1], 'questões: sem a página 0, nenhuma outra é pedida (não se sabe quantas são)');
    ok(c.provasErro === true, 'questões: página 0 esgotada marca provasErro');
  }
  {
    const c = caixa();
    const srv = servidorDePaginas(banco(1200), { erro: { 0: { message: 'Could not find the function', code: 'PGRST202' } } });
    await vm.runInContext('carregarProvas(client)', Object.assign(c, { client: srv }));
    ok(srv.porPagina[0] === 1 && c.provasErro === true, 'questões: erro com código (função ausente) NÃO repete e marca provasErro');
  }
  {
    const c = caixa();
    const srv = servidorDePaginas(banco(1200), { malformada: { 1: true } });
    await vm.runInContext('carregarProvas(client)', Object.assign(c, { client: srv }));
    ok(srv.porPagina[1] === 1 && c.provasErro === true && c.aplicados.length === 0, 'questões: página sem lista é erro (sem repetir, sem aplicar)');
  }
  // Versão muda no meio: a página 1 já vem da versão nova. Recomeça UMA vez,
  // e a segunda volta (tudo na versão nova) é a aplicada.
  {
    const c = caixa();
    const v1 = banco(1200, 'V1-'), v2 = banco(1201, 'V2-');
    const srv = servidorDePaginas(null, {
      versaoDe: (st, pg) => (pg === 0 && st.porPagina[0] === 1 ? 'v1' : 'v2'),
      listaDe: (v) => (v === 'v1' ? v1 : v2),
    });
    await vm.runInContext('carregarProvas(client)', Object.assign(c, { client: srv }));
    ok(srv.porPagina[0] === 2, 'versão: páginas de versões diferentes => a carga recomeça uma vez (página 0 pedida ' + srv.porPagina[0] + '×)');
    ok(c.aplicados.length === 1 && c.provasDB.length === 1201 && c.provasDB.every((q) => q.code.indexOf('V2-') === 0), 'versão: aplicada só a versão nova, inteira — nunca uma colcha das duas');
    ok(c.provasErro === false && c.provasEmVoo === null, 'versão: sem erro e guarda solta depois da segunda volta');
  }
  {
    const c = caixa();
    let n = 0;
    const srv = servidorDePaginas(banco(1200), { versaoDe: () => 'v' + (++n) });
    await vm.runInContext('carregarProvas(client)', Object.assign(c, { client: srv }));
    ok(srv.porPagina[0] === 2, 'versão: muda de novo na segunda volta => não tenta uma terceira');
    ok(c.provasErro === true && c.aplicados.length === 0 && c.provasEmVoo === null, 'versão: vira erro com "Tentar de novo", nada aplicado, guarda solta');
  }
  {
    const c = caixa();
    const srv = servidorDePaginas(banco(1200), { total: 1300 });
    await vm.runInContext('carregarProvas(client)', Object.assign(c, { client: srv }));
    ok(srv.porPagina[0] === 2 && c.provasErro === true && c.aplicados.length === 0, 'total: páginas que não somam o total anunciado não são aplicadas (uma volta a mais, depois erro)');
  }
  {
    const c = caixa();
    const srv = servidorDePaginas(banco(10), { paginas: 1e9, total: 10 });
    await vm.runInContext('carregarProvas(client)', Object.assign(c, { client: srv }));
    ok(srv.chamadas <= 200, 'teto: "paginas" absurdo não vira rajada de pedidos (fez ' + srv.chamadas + ')');
  }
  // Uma carga de questões em voo por vez, e o Banco diz "carregando" enquanto isso.
  {
    const c = caixa();
    const srv = servidorDePaginas(banco(700), { segura: { 0: true } });
    c.client = srv;
    const p = vm.runInContext('carregarProvas(client); carregarProvas(client); recarregarProvas();', c);
    ok(srv.porPagina[0] === 1, 'questões em voo: três pedidos simultâneos = UMA página 0 (fez ' + srv.porPagina[0] + ')');
    ok(!!(c.provasEmVoo && c.provasEmVoo.uid === 'U1'), 'questões em voo: a guarda sabe de que conta é a carga');
    c.remoteStateLoaded = true; // só a carga em voo explica o "carregando" (é o caso do Tentar de novo)
    ok(vm.runInContext('bancoEstado()', c) === 'carregando', 'questões em voo: o Banco diz "carregando" enquanto as páginas não chegam');
    while (srv.pend.length) srv.pend.shift()();
    await p; await new Promise((r) => setImmediate(r));
    ok(c.provasEmVoo === null && c.provasDB.length === 700, 'questões em voo: guarda solta e as 700 aplicadas');
  }
  // Troca de conta no meio: a página da conta anterior é descartada, e a da nova vale.
  {
    const c = caixa();
    const srv = servidorDePaginas(banco(700), { segura: { 0: true } });
    c.client = srv;
    const pA = vm.runInContext('carregarProvas(client)', c);
    c.currentUser = { id: 'U2', role: 'aluno' };
    ok(vm.runInContext('provasEmVooDesta()', c) === false, 'troca (questões): a carga em voo NÃO é desta conta');
    const pB = vm.runInContext('carregarProvas(client)', c);
    ok(srv.porPagina[0] === 2 && !!(c.provasEmVoo && c.provasEmVoo.uid === 'U2'), 'troca (questões): a conta nova faz a própria carga e a guarda é dela');
    srv.pend.shift()(); // a página 0 de U1 chega tarde
    await pA; await new Promise((r) => setImmediate(r));
    ok(c.aplicados.length === 0 && !srv.porPagina[1], 'troca (questões): a resposta da conta anterior não é aplicada nem puxa as outras páginas');
    srv.pend.shift()();
    await pB; await new Promise((r) => setImmediate(r));
    ok(c.provasDB.length === 700 && c.provasEmVoo === null && c.provasErro === false, 'troca (questões): a conta nova recebe as próprias questões');
  }
  {
    const c = caixa();
    c.provasErro = true;
    c.client = servidorDePaginas(banco(3));
    await vm.runInContext('recarregarProvas()', c);
    ok(c.provasErro === false && c.provasDB.length === 3, 'recarregar questões: carrega e limpa o erro');
    ok(c.refrescou === 1, 'recarregar questões: chama refreshAfterRemoteState uma vez ao terminar');
  }
  {
    const c = caixa({ currentUser: { role: 'aluno' } });
    c.client = servidorDePaginas(banco(3));
    await vm.runInContext('recarregarProvas()', c);
    ok(c.client.chamadas === 0, 'recarregar questões: conta demo (sem id) não chama a RPC');
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
    ok(vm.runInContext('bancoEstado()', c) === 'carregando', 'estado: a falha do CONTEÚDO não vira erro no Banco (as questões vêm à parte)');
    c.conteudoErro = false; c.provasErro = true;
    ok(vm.runInContext('bancoEstado()', c) === 'erro', 'estado: provasErro vence tudo enquanto o banco está vazio');
    c.provasErro = false; c.remoteStateLoaded = true;
    ok(vm.runInContext('bancoEstado()', c) === '', 'estado: carga concluída e banco vazio de verdade = normal (sem mensagem falsa)');
    c.remoteStateLoaded = false; c.remoteStateWarned = true;
    ok(vm.runInContext('bancoEstado()', c) === '', 'estado: se o Supabase já avisou falha geral, não fica em "carregando" para sempre');
    c.remoteStateWarned = false; c.provasDB = [{ stem: 'q' }]; c.provasErro = true;
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
    ok(/loads\.push\(carregarProvas\(client\)\);/.test(hyd), 'hydrate: questões em carga própria, em paralelo (não encadeadas no conteúdo)');
    ok(hyd.indexOf('endodirect_member_provas') < 0, 'hydrate: não chama as páginas direto (sem tentativas) — só por carregarProvas');
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
    ok(/client\.rpc\('endodirect_member_content_sem_provas'\)/.test(cc) && cc.indexOf("'endodirect_member_content'") < 0, 'carregarConteudo: chama o conteúdo SEM as questões, não o member_content antigo (que ainda as traz)');
    ok((cc.match(/if\(!mesmaContaQue\(uid\)\)return;/g) || []).length === 2 && /if\(tentativa===1&&conteudoEmVoo&&conteudoEmVoo\.uid===uid\)return conteudoEmVoo\.p;/.test(cc), 'carregarConteudo: guarda por conta na resposta, na falha e na promessa em voo');
    const cp = corpo('carregarProvas');
    ok(/if\(volta===1&&provasEmVoo&&provasEmVoo\.uid===uid\)return provasEmVoo\.p;/.test(cp)
       && /if\(!mesmaContaQue\(uid\)\)return null;/.test(cp)
       && /if\(!pags\|\|!mesmaContaQue\(uid\)\)return;/.test(cp)
       && /\.catch\(function\(e\)\{\s*if\(!mesmaContaQue\(uid\)\)return;\s*provasErro=true;/.test(cp), 'carregarProvas: guarda por conta na promessa em voo, entre as páginas, na aplicação e na falha');
    ok(/applyStatePayload\(\{provas:itens\}\)/.test(cp) && cp.indexOf('applyStatePayload') === cp.lastIndexOf('applyStatePayload'), 'carregarProvas: aplica UMA vez, com a lista inteira');
    ok(/client\.rpc\('endodirect_member_provas_pagina',\{p_pagina:pagina\}\)/.test(corpo('carregarPaginaProvas')), 'carregarPaginaProvas: pede a página pelo nome do parâmetro da RPC (p_pagina)');
    const ca = corpo('carregarAcessos');
    ok((ca.match(/if\(!mesmaContaQue\(uid\)\)return;/g) || []).length === 2, 'carregarAcessos: guarda por conta na resposta e na falha');
    const tr = corpo('tentarResumos');
    ok((tr.match(/if\(!mesmaContaQue\(uid\)\)return;/g) || []).length === 2 && /return tentarResumos\(client,rpc,tentativa,contaAtual\(\)\);/.test(corpo('carregarResumos')), 'Resumos: os capítulos privados de uma conta em voo não são aplicados na sessão da conta seguinte');
    const lo = corpo('doLogout');
    ok(/remoteStateGen\+\+;remoteStateEmVoo=null;conteudoEmVoo=null;conteudoErro=false;provasEmVoo=null;provasErro=false;userAcessos=\[\];/.test(lo), 'doLogout: cargas em voo (conteúdo E questões) ficam órfãs e plano/erros voltam ao zero');
    ok(/carregarConteudo\(client\)\s*\.then\(function\(\)\{return carregarResumos\(client,'endodirect_member_resumos'\);\}\)/.test(hyd), 'hydrate: Resumos seguem vindo depois do conteúdo, sem depender do sucesso dele');
  }
  {
    const poll = corpo('ckStartAutoVerify');
    ok(poll.indexOf('hydrateRemoteState') < 0, 'checkout: o poll NÃO refaz o hydrate inteiro a cada 5 s');
    ok((poll.match(/carregarAcessos\(getSupabaseClient\(\)\)/g) || []).length === 2, 'checkout: o poll relê só os acessos (na largada e a cada volta)');
    const ver = corpo('ckVerify');
    ok(ver.indexOf('hydrateRemoteState') < 0 && /carregarAcessos\(/.test(ver), 'checkout: "Já paguei" relê só os acessos');
    const grant = corpo('ckGrantSuccess');
    ok(/Promise\.all\(\[remoteStateEmVoo\?remoteStateEmVoo\.p:null,conteudoEmVoo\?conteudoEmVoo\.p:null,provasEmVoo\?provasEmVoo\.p:null\]\)\.then\(function\(\)\{remoteStateLoaded=false;hydrateRemoteState\(\);\}\)/.test(grant), 'checkout: liberado o acesso, a carga inteira espera as cargas em voo (hydrate, conteúdo e questões — inclusive um "Tentar de novo" com escopo de degustação)');
  }
  {
    const apl = corpo('applyStatePayload');
    ok(/if\(Array\.isArray\(payload\.acessos\)\)definirAcessos\(payload\.acessos\);/.test(apl), 'applyStatePayload: acessos passam por definirAcessos (cache + badge)');
    // A versão ATIVA de doLogin é a sobrescrita (doLogin=function). Ela restaura o cache.
    const i = html.lastIndexOf('doLogin=function(u){');
    ok(i > 0, 'doLogin sobrescrito existe');
    const dl = html.slice(i, i + 4000);
    ok(/else if\(u\.id\)\{var _acG=acessosGuardados\(u\.id\);userAcessos=_acG\|\|\[\];acessosConhecidos=!!_acG;\}/.test(dl), 'doLogin: aluno real nasce com os acessos guardados neste aparelho — e com NADA (e nada decidido) quando não há cópia desta conta');
    ok(/conteudoErro=false;provasErro=false; \/\/ o erro \(se houve\) era da sessão anterior/.test(dl), 'doLogin: os erros de conteúdo e de questões da sessão anterior não passam para a nova');
  }
  {
    const upi = corpo('updateProvaInfo');
    ok(/var estado=bancoEstado\(\);/.test(upi), 'updateProvaInfo: consulta o estado do banco');
    const iCarr = upi.indexOf("if(estado==='carregando')"), iDeg = upi.indexOf('else if(isDegustacao()&&!acessosPendentes()){');
    ok(iCarr >= 0 && iDeg >= 0 && iCarr < iDeg, 'updateProvaInfo: carregando/erro vêm ANTES da faixa de degustação (sem acessos, um Gold pareceria degustação) — e os dois ramos existem');
    ok(/if\(estado\)\{var rs=document\.getElementById\('q-gen-results'\);if\(rs\)rs\.innerHTML=bancoEstadoHTML\(estado\);\}/.test(upi), 'updateProvaInfo: a área de resultados mostra o estado');
    const rpr = corpo('renderProvaResults');
    ok(/bancoEstado\(\)/.test(rpr) && /bancoEstadoHTML\(_est\)/.test(rpr), 'renderProvaResults: busca vazia durante carga/erro mostra o estado, não "Nenhuma questão encontrada"');
    ok(/document\.getElementById\('q-gen-results'\)\.addEventListener\('click',function\(e\)\{\s*var b=e\.target&&e\.target\.closest\?e\.target\.closest\('#btn-banco-retry'\):null;\s*if\(b\)bancoTentarDeNovo\(b\);/.test(html), 'Banco: o clique em Tentar de novo está ligado (delegado no contêiner)');
    const tdn = corpo('bancoTentarDeNovo');
    ok(/var cargas=\[recarregarProvas\(\)\];/.test(tdn) && /if\(conteudoErro\)cargas\.push\(recarregarConteudo\(\)\);/.test(tdn) && /btn-filter-provas/.test(tdn), 'Tentar de novo: recarrega as questões (e o conteúdo, se também caiu) e refaz a busca do aluno');
    const be = corpo('bancoEstado');
    ok(/if\(provasErro\)return 'erro';/.test(be) && /if\(provasEmVooDesta\(\)\)return 'carregando';/.test(be) && be.indexOf('conteudo') < 0, 'bancoEstado: segue a carga das QUESTÕES, não a do conteúdo');
  }

  // ── 5. O .sql versionado (12/10/2026: questões em páginas; member_content = composição) ──
  {
    const fn = {};
    const re = /create or replace function public\.(\w+)\([^)]*\)[\s\S]*?as \$function\$([\s\S]*?)\$function\$;/g;
    let m; while ((m = re.exec(sql))) fn[m[1]] = m[2];
    const semComent = (t) => (t || '').replace(/--[^\n]*/g, '');
    const sem = semComent(fn.endodirect_member_content_sem_provas), prov = semComent(fn.endodirect_member_provas);
    const pag = semComent(fn.endodirect_member_provas_pagina), mc = semComent(fn.endodirect_member_content);
    ok(!!(sem && prov && pag && mc), 'sql: define as quatro funções (sem_provas, provas, provas_pagina, member_content)');
    ok(!/'provas',/.test(sem) && !/payload->'provas'/.test(sem), 'sql: o conteúdo NÃO leva mais as questões');
    ok(!/'diretrizes',/.test(sem) && !/'diretrizes_temas',/.test(sem), 'sql: diretrizes/diretrizes_temas NÃO saem do conteúdo (vêm de member_resumos)');
    ok(/limit 200\)/.test(sem), 'sql: radar janelado nos 200 mais recentes');
    ok((sem.match(/where not \(\(select hidden from h\) \? coalesce\(v->>'sourceId', v->>'link', v->>'titulo',''\)\)/g) || []).length === 2, 'sql: o filtro de radar_hidden está nas DUAS metades do mural (avisos do professor e radar) — comentário não conta');
    ok(/'radar_hidden', \(select hidden from h\)/.test(sem), 'sql: radar_hidden entregue ao cliente');
    ok(/'acervo_totais', public\.endodirect_acervo_totais\(\)/.test(sem), 'sql: acervo_totais segue (o Dashboard conta com ele)');
    ['podcasts', 'mm_shared', 'fc_shared', 'adm_cursos', 'cursos', 'acessos', 'member'].forEach(function (k) {
      ok(sem.indexOf("'" + k + "',") >= 0, 'sql: chave ' + k + ' segue no conteúdo');
    });
    ok(/endodirect_mural_radar_more/.test(fn.endodirect_member_content_sem_provas || ''), 'sql: documenta de onde vem o resto do radar');
    ok(/@> array\['plano'\]/.test(prov) && /@> array\['curso:endoteem'\]/.test(prov) && /limit 50/.test(prov)
       && /coalesce\(v->>'inst',''\) <> 'TEEM'/.test(prov) && /v->>'inst' = 'TEEM'/.test(prov), 'sql: os ramos das questões (plano, endoteem, degustação 50, TEEM) estão na função da regra');
    ok(prov.indexOf("@> array['plano']") < prov.indexOf("@> array['curso:endoteem']"), "sql: 'plano' vem ANTES de 'curso:endoteem' (quem tem os dois cai no ramo amplo e ainda recebe o TEEM)");
    ok(/public\.endodirect_member_content_sem_provas\(\)/.test(mc) && /jsonb_build_object\('provas', public\.endodirect_member_provas\(\)\)/.test(mc) && !/jsonb_array_elements/.test(mc), 'sql: o member_content antigo é a COMPOSIÇÃO das duas — sem cópia própria da regra');
    ok(/500 as por_pagina/.test(pag) && /'versao',\s+md5\(/.test(pag) && /with ordinality/.test(pag) && /greatest\(1,/.test(pag) && /public\.endodirect_member_provas\(\)/.test(pag), 'sql: a página corta a lista da regra em 500, com versão (md5), total e páginas (mínimo 1)');
    ok(/revoke all on function public\.endodirect_member_provas\(\) from public, anon, authenticated;/.test(sql) && /grant execute on function public\.endodirect_member_provas\(\) to service_role;/.test(sql), 'sql: a lista inteira não é exposta ao app (só service_role; as outras a chamam como dona)');
    ['endodirect_member_provas_pagina(integer)', 'endodirect_member_content_sem_provas()', 'endodirect_member_content()'].forEach(function (f) {
      ok(sql.indexOf('grant execute on function public.' + f + ' to anon, authenticated, service_role;') >= 0 && sql.indexOf('revoke all on function public.' + f + ' from public;') >= 0, 'sql: ' + f + ' com o mesmo ACL do member_content (anon, authenticated, service_role; sem PUBLIC)');
    });
  }

  terminou = true;
  if (falhas.length) {
    console.error('test-banco-nao-fica-mudo: ' + falhas.length + ' falha(s)');
    falhas.forEach((f) => console.error('  ✗ ' + f));
    process.exit(1);
  }
  console.log('test-banco-nao-fica-mudo: ok (conteúdo 3×, questões em páginas com versão única, acessos próprios com cache, 3 estados do Banco, guarda em voo, poll leve, sql em composição)');
})().catch((e) => { console.error(e); process.exit(1); });
