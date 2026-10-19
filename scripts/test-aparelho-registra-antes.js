// O APARELHO NOVO NÃO É DERRUBADO NO PRÓPRIO LOGIN — E A DERRUBADA DE VERDADE NÃO GRAVA NADA.
//
// ⚠️ 12/10/2026, na conferência pós-deploy das questões em páginas. O limite de
// 2 aparelhos responde false no `endodirect_session_check` a aparelho SEM
// registro — é assim que o 3º cai. Mas o doLogin navega para o painel inicial, a
// navegação dispara a checagem (deviceTickThrottled), e o claimDeviceSlot só era
// chamado depois: num aparelho novo, a checagem chegava ao servidor antes do
// registro e o aluno era derrubado logo após entrar. Nos logs de borda: 11/10
// 18:21:13 (check 8 ms antes do claim) e 12/10 12:42:40 — 2 de ~12 logins de
// aluno em 24 h. E, depois do signOut da derrubada, o que ainda estava em voo
// voltava como ANÔNIMO: a página seguinte das questões trazia a lista da
// degustação, aplicada e gravada no aparelho.
//
// 🧨 O QUE ESTE TESTE PRENDE: (1) a checagem só sai depois de o registro deste
// login voltar true — na ordem real do enterAsMember (navegação antes do
// claimDeviceSlot); (2) registro que falhou é refeito, sem checar; (3) registro
// confirmado não se refaz (um aparelho derrubado que se registrasse de novo
// derrubaria o outro); (4) a derrubada de verdade continua derrubando; (5)
// depois dela, nenhuma resposta da rede vale (mesmaContaQue false, geração nova).
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
// Uma promessa que nunca resolve faz o Node sair com código 0 no meio do teste.
let terminou = false;
process.on('exit', (code) => {
  if (!terminou && code === 0) { console.error('test-aparelho-registra-antes: o teste parou no meio'); process.exitCode = 1; }
});

// Servidor falso do limite: o claim registra o aparelho; o check responde se ele
// está registrado. A ORDEM DE CHEGADA é a ordem em que o teste solta os pedidos.
function servidor(opts) {
  opts = opts || {};
  const st = { registrados: new Set(opts.registrados || []), ordem: [], pend: [], derrubar: false, saiu: 0 };
  st.rpc = function (nome, args) {
    const curto = nome.replace('endodirect_session_', '');
    st.ordem.push(curto);
    const responde = () => {
      if (opts.claimCai && curto === 'claim') throw new TypeError('Failed to fetch');
      if (opts.claimFalso && curto === 'claim') return { data: false, error: null }; // sem uid no servidor: não registra
      if (curto === 'claim') { st.registrados.add(args.p_device_id); return { data: true, error: null }; }
      if (curto === 'check') return { data: !st.derrubar && st.registrados.has(args.p_device_id), error: null };
      return { data: null, error: null };
    };
    return new Promise((res, rej) => st.pend.push(() => { try { res(responde()); } catch (e) { rej(e); } }));
  };
  st.auth = { signOut() { st.saiu++; return Promise.resolve({ error: null }); } };
  // Entrega os pedidos pendentes, um por vez, na ordem em que saíram.
  st.soltaTudo = async function () { while (st.pend.length) { st.pend.shift()(); await new Promise((r) => setImmediate(r)); } };
  return st;
}
function caixa(srv) {
  const ls = {};
  const c = {
    console: { warn() {}, log() {} },
    Date, Math, Number, String, Promise, Object, Array, TypeError,
    navigator: { userAgent: 'teste' },
    window: {},
    document: {
      hidden: false,
      getElementById: (id) => (id === 'evicted-ov' ? c.overlay || null : null),
      createElement: () => ({ style: {} }),
      body: { appendChild: (o) => { c.overlay = o; } },
      addEventListener() {},
    },
    location: { reload() {} },
    lsGet: (k) => (k in ls ? ls[k] : null),
    lsSet: (k, v) => { ls[k] = v; },
    currentUser: { id: 'U1', role: 'aluno', email: 'aluna@exemplo.com' },
    getSupabaseClient: () => srv,
    setInterval: () => 1, clearInterval: () => {},
    acessosRetentarSePendente() {},
    remoteStateGen: 0,
    overlay: null,
  };
  vm.createContext(c);
  const declSlot = (html.match(/var deviceSlot=\{uid:null,ok:false,emVoo:false\};/) || [''])[0];
  const declEnc = (html.match(/var sessaoEncerrada=false;/) || [''])[0];
  vm.runInContext([
    declEnc, declSlot,
    'var deviceWatcher=null,lastDeviceTickAt=0;',
    corpo('getDeviceId'), corpo('contaRevisaoLojas'), corpo('claimDeviceSlot'), corpo('deviceTick'), corpo('deviceTickThrottled'),
    corpo('startDeviceWatcher'), corpo('onSessionEvicted'), corpo('contaAtual'), corpo('mesmaContaQue'),
  ].join('\n'), c);
  return c;
}
const roda = (c, js) => vm.runInContext(js, c);

(async function () {
  ok(/var deviceSlot=\{uid:null,ok:false,emVoo:false\};/.test(html), 'estado do registro do aparelho declarado (deviceSlot)');
  ok(/var sessaoEncerrada=false;/.test(html), 'marca de sessão derrubada declarada (sessaoEncerrada)');

  // ── 1. Aparelho novo, na ordem real do enterAsMember ─────────────────────
  // doLogin navega (deviceTickThrottled) ANTES de claimDeviceSlot();startDeviceWatcher().
  {
    const srv = servidor();
    const c = caixa(srv);
    roda(c, 'deviceTickThrottled(); claimDeviceSlot(); startDeviceWatcher();');
    ok(srv.ordem.join() === 'claim', 'aparelho novo: no boot sai SÓ o registro, uma vez — nenhuma checagem antes dele (saiu: ' + srv.ordem.join() + ')');
    await srv.soltaTudo();
    ok(roda(c, 'deviceSlot.ok') === true, 'aparelho novo: o registro voltou true e ficou confirmado');
    roda(c, 'deviceTick();');
    await srv.soltaTudo();
    ok(srv.ordem.join() === 'claim,check', 'aparelho novo: a checagem sai depois do registro (ordem: ' + srv.ordem.join() + ')');
    ok(srv.saiu === 0 && !c.overlay && roda(c, 'sessaoEncerrada') === false, 'aparelho novo: NÃO é derrubado no próprio login');
  }
  // Mesmo com a checagem pedida enquanto o registro está em voo (o heartbeat de
  // 5 s, um foco de janela): ela espera; não corre contra o registro.
  {
    const srv = servidor();
    const c = caixa(srv);
    roda(c, 'claimDeviceSlot(); deviceTick(); deviceTick();');
    ok(srv.ordem.join() === 'claim', 'registro em voo: checagens pedidas no meio não saem nem duplicam o registro (saiu: ' + srv.ordem.join() + ')');
    await srv.soltaTudo();
    ok(srv.saiu === 0 && !c.overlay, 'registro em voo: ninguém derrubado');
  }
  // ── 2. Registro que falhou (rede) é refeito, sem checar ──────────────────
  {
    const srv = servidor({ claimCai: true });
    const c = caixa(srv);
    roda(c, 'claimDeviceSlot();');
    await srv.soltaTudo();
    ok(roda(c, 'deviceSlot.ok') === false && roda(c, 'deviceSlot.emVoo') === false, 'registro caído: nem confirmado, nem em voo');
    roda(c, 'deviceTick();');
    ok(srv.ordem.join() === 'claim,claim', 'registro caído: a vez seguinte refaz o REGISTRO, não checa (saiu: ' + srv.ordem.join() + ')');
    await srv.soltaTudo();
    ok(srv.saiu === 0 && !c.overlay, 'registro caído: ninguém derrubado');
  }
  // Registro que voltou false (o servidor não viu a conta: token ainda não pronto)
  // não conta como registro: a checagem derrubaria o aparelho.
  {
    const srv = servidor({ claimFalso: true });
    const c = caixa(srv);
    roda(c, 'claimDeviceSlot();');
    await srv.soltaTudo();
    roda(c, 'deviceTick();');
    ok(srv.ordem.join() === 'claim,claim', 'registro false: não confirma; a vez seguinte refaz o registro (saiu: ' + srv.ordem.join() + ')');
    await srv.soltaTudo();
    ok(srv.saiu === 0 && !c.overlay, 'registro false: ninguém derrubado');
  }
  // ── 3. Registro confirmado não se refaz ─────────────────────────────────
  {
    const srv = servidor();
    const c = caixa(srv);
    roda(c, 'claimDeviceSlot();');
    await srv.soltaTudo();
    roda(c, 'claimDeviceSlot(); claimDeviceSlot();');
    ok(srv.ordem.join() === 'claim', 'confirmado: chamar o registro de novo não sai (um aparelho derrubado se registrando de novo derrubaria o outro)');
  }
  // ── 4. A derrubada de verdade continua derrubando ───────────────────────
  {
    const srv = servidor();
    const c = caixa(srv);
    roda(c, 'claimDeviceSlot();');
    await srv.soltaTudo();
    srv.derrubar = true; // um 3º aparelho entrou e este saiu da lista no servidor
    const gen0 = roda(c, 'remoteStateGen');
    roda(c, 'deviceTick();');
    await srv.soltaTudo();
    await new Promise((r) => setImmediate(r));
    ok(srv.saiu === 1 && !!c.overlay, 'derrubada: o check false encerra a sessão e mostra o aviso');
    // ── 5. … e, depois dela, nenhuma resposta da rede vale ──────────────
    ok(roda(c, 'sessaoEncerrada') === true, 'derrubada: a aba fica marcada como encerrada');
    ok(roda(c, 'remoteStateGen') === gen0 + 1, 'derrubada: a geração sobe (o hydrate em voo não fecha a carga)');
    ok(roda(c, "mesmaContaQue('U1')") === false, 'derrubada: a resposta pedida pela conta deixa de valer');
    ok(roda(c, 'mesmaContaQue(null)') === false, 'derrubada: nem a pedida "sem conta" (era o furo: null===null)');
  }
  // Throttle: duas navegações em menos de 4 s = uma checagem só.
  {
    const srv = servidor();
    const c = caixa(srv);
    roda(c, 'claimDeviceSlot();');
    await srv.soltaTudo();
    roda(c, 'deviceTickThrottled(); deviceTickThrottled();');
    ok(srv.ordem.filter((x) => x === 'check').length === 1, 'throttle: duas navegações seguidas = uma checagem');
    await srv.soltaTudo();
  }

  // ── 6. Fiação no index.html ─────────────────────────────────────────────
  {
    const eam = corpo('enterAsMember');
    ok(/doLogin\(\{[^]*?\}\);\s*claimDeviceSlot\(\);startDeviceWatcher\(\);/.test(eam), 'enterAsMember: registra o aparelho e liga o vigia ao entrar');
    const lo = corpo('doLogout');
    ok(/deviceSlot=\{uid:null,ok:false,emVoo:false\};/.test(lo), 'doLogout: o registro do aparelho volta ao zero (o próximo login registra de novo)');
    const ev = corpo('onSessionEvicted');
    const iMarca = ev.indexOf('sessaoEncerrada=true;remoteStateGen++;'), iSai = ev.indexOf('signOut(');
    ok(iMarca > 0 && iSai > iMarca, 'onSessionEvicted: marca a aba como encerrada ANTES do signOut');
    const i = html.lastIndexOf('doLogin=function(u){');
    ok(i > 0 && /sessaoEncerrada=false;/.test(html.slice(i, i + 1500)), 'doLogin: um login novo na aba volta a aceitar respostas');
    ok(/function mesmaContaQue\(uid\)\{return !sessaoEncerrada&&contaAtual\(\)===\(uid\|\|null\);\}/.test(html), 'mesmaContaQue: recusa tudo depois da derrubada');
  }

  terminou = true;
  if (falhas.length) {
    console.error('test-aparelho-registra-antes: ' + falhas.length + ' falha(s)');
    falhas.forEach((f) => console.error('  ✗ ' + f));
    process.exit(1);
  }
  console.log('test-aparelho-registra-antes: ok (registro antes da checagem, registro refeito na falha, derrubada de verdade preservada, nada aplicado depois dela)');
})().catch((e) => { console.error(e); process.exit(1); });
