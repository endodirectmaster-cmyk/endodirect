#!/usr/bin/env node
// NOTIFICAÇÕES NATIVAS NO APP DO IPHONE, VERSÃO 1.1 (16/11/2026).
//
// O WKWebView não tem web push. O app 1.1 traz o plugin PushNotifications do Capacitor: os
// mesmos botões do site ("Ativar avisos" do Mural, das novidades, do cartão de ativação e do
// suporte do professor) pedem a permissão do iPhone, registram o aparelho e gravam o token em
// endodirect_push_subs com endpoint "apns:<token>". O servidor (lib/push.js) manda esses pela
// Apple (HTTP/2, JWT ES256 com a chave "Endodirect Push"), e todo envio que já existia passa
// a chegar também no iPhone.
//
// 🧨 Os modos de quebrar isto em silêncio:
//  - sendPush tratar "apns:" como web push (cairia em "Inscrição incompleta" ou no VAPID);
//  - JWT fora do formato da Apple (alg/kid/iss/iat) ou assinatura DER no lugar de P-1363;
//  - trocar o JWT a cada envio (a Apple recusa mais de 1 troca a cada 20 min);
//  - não apagar o token que a Apple dá por morto (410, BadDeviceToken…);
//  - no app, gravar o token sem a marca 'apns' (colunas obrigatórias) ou sem a conta;
//  - abrir no toque um endereço de fora do site;
//  - tirar do projeto do iPhone o plugin, a permissão aps-environment ou o repasse do token.
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const crypto = require('crypto');
const http2 = require('http2');
const RAIZ = path.join(__dirname, '..');

let bad = 0;
const ok = (nome, cond, det) => { if (cond) return; bad++; console.log('  ✗ ' + nome + (det ? ' — ' + det : '')); };

// ── 1. projeto do iPhone ─────────────────────────────────────────────────────
const IOS = path.join(RAIZ, 'app-ios');
const pkg = JSON.parse(fs.readFileSync(path.join(IOS, 'package.json'), 'utf8'));
ok('plugin @capacitor/push-notifications fixado em versão exata', /^\d+\.\d+\.\d+$/.test(pkg.dependencies['@capacitor/push-notifications'] || ''));
const spm = fs.readFileSync(path.join(IOS, 'ios', 'App', 'CapApp-SPM', 'Package.swift'), 'utf8');
ok('🧨 plugin no Package.swift do app', /\.product\(name: "CapacitorPushNotifications", package: "CapacitorPushNotifications"\)/.test(spm));
const ent = fs.readFileSync(path.join(IOS, 'ios', 'App', 'App', 'App.entitlements'), 'utf8');
ok('🧨 permissão aps-environment (production) no App.entitlements', /<key>aps-environment<\/key>\s*<string>production<\/string>/.test(ent));
ok('permissão do Entrar com a Apple continua', /com\.apple\.developer\.applesignin/.test(ent));
const del = fs.readFileSync(path.join(IOS, 'ios', 'App', 'App', 'AppDelegate.swift'), 'utf8');
ok('🧨 AppDelegate repassa o token ao Capacitor', /didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data\) \{\s*NotificationCenter\.default\.post\(name: \.capacitorDidRegisterForRemoteNotifications, object: deviceToken\)/.test(del));
ok('AppDelegate repassa a falha do registro', /didFailToRegisterForRemoteNotificationsWithError error: Error\) \{\s*NotificationCenter\.default\.post\(name: \.capacitorDidFailToRegisterForRemoteNotifications, object: error\)/.test(del));
const capCfg = JSON.parse(fs.readFileSync(path.join(IOS, 'capacitor.config.json'), 'utf8'));
const pres = (((capCfg.plugins || {}).PushNotifications || {}).presentationOptions) || [];
ok('notificação aparece também com o app aberto (presentationOptions com alert)', pres.indexOf('alert') >= 0);
const pbx = fs.readFileSync(path.join(IOS, 'ios', 'App', 'App.xcodeproj', 'project.pbxproj'), 'utf8');
ok('projeto na versão 1.1 ou maior', (pbx.match(/MARKETING_VERSION = ([\d.]+);/g) || []).every((m) => { const v = m.match(/([\d.]+);/)[1].split('.').map(Number); return v[0] > 1 || (v[0] === 1 && (v[1] || 0) >= 1); }));

// ── 2. servidor: lib/push.js ─────────────────────────────────────────────────
const push = require(path.join(RAIZ, 'lib', 'push.js'));
const { privateKey, publicKey } = crypto.generateKeyPairSync('ec', { namedCurve: 'prime256v1' });
const pem = privateKey.export({ type: 'pkcs8', format: 'pem' }).toString();
const env = { APNS_PRIVATE_KEY: pem.replace(/\n/g, '\\n') }; // como fica quando colado numa linha só
const b64d = (s) => Buffer.from(String(s).replace(/-/g, '+').replace(/_/g, '/'), 'base64');

async function servidor() {
  const T0 = 1794800000000;
  const chamadas = [];
  let resposta = { status: 200 };
  const transporte = async (cfg, token, corpo, cab) => { chamadas.push({ cfg, token, corpo, cab }); return resposta; };
  const sub = { endpoint: 'apns:AABB01ff', keys: { p256dh: 'apns', auth: 'apns' } };
  const msg = { title: '🔔 Breaking News', body: 'Texto', url: '/#mural', tag: 'endodirect-breaking' };

  delete process.env.VAPID_PRIVATE_KEY;
  let r = await push.sendPush(sub, msg, { env, transporte, now: T0 });
  ok('🧨 "apns:" vai pela Apple mesmo sem VAPID', r.ok === true && chamadas.length === 1, JSON.stringify(r));
  const c = chamadas[0] || { cab: {}, corpo: '{}' };
  ok('token só em hexadecimal minúsculo', c.token === 'aabb01ff', c.token);
  ok('tópico = identificador do app', c.cab['apns-topic'] === 'br.com.endodirect.app');
  ok('tipo alert, prioridade 10, validade de 1 dia', c.cab['apns-push-type'] === 'alert' && c.cab['apns-priority'] === '10' && c.cab['apns-expiration'] === String(T0 / 1000 + 86400));
  const corpo = JSON.parse(c.corpo);
  ok('corpo: título, texto, endereço e agrupamento', corpo.aps && corpo.aps.alert.title === msg.title && corpo.aps.alert.body === 'Texto' && corpo.url === '/#mural' && corpo.aps['thread-id'] === 'endodirect-breaking' && corpo.aps.sound === 'default');
  const jwt = String(c.cab.authorization || '').replace(/^bearer /, '');
  const [h, p, s] = jwt.split('.');
  let cab = {}, carga = {};
  try { cab = JSON.parse(b64d(h)); carga = JSON.parse(b64d(p)); } catch (e) { /* cai nos ok abaixo */ }
  ok('🧨 JWT: ES256 com o Key ID da chave', cab.alg === 'ES256' && cab.kid === '3JT8BL5MU9', JSON.stringify(cab));
  ok('🧨 JWT: equipe e hora', carga.iss === '9Q4Y44Z44C' && carga.iat === T0 / 1000, JSON.stringify(carga));
  let verifica = false;
  try { verifica = crypto.verify('sha256', Buffer.from(h + '.' + p), { key: publicKey, dsaEncoding: 'ieee-p1363' }, b64d(s)); } catch (e) { /* falso */ }
  ok('🧨 JWT assinado em P-1363 (64 bytes) com a chave', verifica && b64d(s).length === 64);

  await push.sendPush(sub, msg, { env, transporte, now: T0 + 1000 * 1000 });
  ok('o mesmo JWT é reaproveitado dentro de 40 min', chamadas[1].cab.authorization === c.cab.authorization);
  await push.sendPush(sub, msg, { env, transporte, now: T0 + 2500 * 1000 });
  ok('depois de 40 min sai outro JWT', chamadas[2].cab.authorization !== c.cab.authorization);

  resposta = { status: 410, motivo: 'Unregistered' };
  r = await push.sendPush(sub, msg, { env, transporte, now: T0 + 2600 * 1000 });
  ok('🧨 410 Unregistered: token morto (sai da tabela)', r.ok === false && r.gone === true);
  resposta = { status: 400, motivo: 'BadDeviceToken' };
  r = await push.sendPush(sub, msg, { env, transporte, now: T0 + 2600 * 1000 });
  ok('400 BadDeviceToken: token morto', r.gone === true);
  resposta = { status: 400, motivo: 'PayloadTooLarge' };
  r = await push.sendPush(sub, msg, { env, transporte, now: T0 + 2600 * 1000 });
  ok('400 por outro motivo não apaga o aparelho', r.gone === false && r.error === 'PayloadTooLarge');
  const antes = chamadas[chamadas.length - 1].cab.authorization;
  resposta = { status: 403, motivo: 'ExpiredProviderToken' };
  await push.sendPush(sub, msg, { env, transporte, now: T0 + 2600 * 1000 });
  resposta = { status: 200 };
  await push.sendPush(sub, msg, { env, transporte, now: T0 + 2601 * 1000 });
  ok('403 da Apple: o próximo envio assina outro JWT', chamadas[chamadas.length - 1].cab.authorization !== antes);

  const n = chamadas.length;
  r = await push.sendPush(sub, msg, { env: {}, transporte, now: T0 });
  ok('sem APNS_PRIVATE_KEY: não envia e diz o porquê', r.ok === false && /APNS_PRIVATE_KEY/.test(r.error) && chamadas.length === n);
  r = await push.sendPush({ endpoint: 'https://fcm.googleapis.com/x', keys: { p256dh: 'a', auth: 'b' } }, msg, { env, transporte });
  ok('web push continua no caminho do VAPID', chamadas.length === n && /VAPID/.test(r.error || ''));

  // Transporte de verdade (HTTP/2) contra uma "Apple" local.
  const vistos = [];
  const srv = http2.createServer();
  srv.on('stream', (st, hd) => {
    let b = ''; st.setEncoding('utf8'); st.on('data', (d) => { b += d; });
    st.on('end', () => {
      vistos.push({ path: hd[':path'], method: hd[':method'], topic: hd['apns-topic'], auth: hd.authorization, body: b });
      if (hd[':path'].indexOf('dead') >= 0 || hd[':path'].endsWith('/dd')) { st.respond({ ':status': 410, 'content-type': 'application/json' }); st.end(JSON.stringify({ reason: 'Unregistered' })); }
      else { st.respond({ ':status': 200 }); st.end(); }
    });
  });
  await new Promise((res) => srv.listen(0, '127.0.0.1', res));
  const host = 'http://127.0.0.1:' + srv.address().port;
  const envLocal = Object.assign({ APNS_HOST: host }, env);
  r = await push.sendApns('apns:00ff', msg, { env: envLocal, now: T0 + 9000 * 1000 });
  ok('🧨 HTTP/2 de verdade: POST /3/device/<token> com tópico e JWT', r.ok === true && vistos[0] && vistos[0].method === 'POST' && vistos[0].path === '/3/device/00ff' && vistos[0].topic === 'br.com.endodirect.app' && /^bearer /.test(vistos[0].auth), JSON.stringify([r, vistos[0]]));
  r = await push.sendApns('apns:dd', msg, { env: envLocal, now: T0 + 9000 * 1000 });
  ok('HTTP/2 de verdade: lê o motivo da recusa', r.status === 410 && r.gone === true && r.error === 'Unregistered', JSON.stringify(r));
  srv.close();
  r = await push.sendApns('apns:00ff', msg, { env: Object.assign({}, env, { APNS_HOST: 'http://127.0.0.1:1' }), now: T0, timeoutMs: 3000 });
  ok('Apple fora do ar: devolve erro, não lança', r.ok === false && r.status === 0 && !!r.error);
}

// ── 3. app: index.html ───────────────────────────────────────────────────────
const html = fs.readFileSync(path.join(RAIZ, 'index.html'), 'utf8');
// Corpo de uma função de topo, contando chaves (ignora as de dentro de textos).
function corpo(nome) {
  const ini = html.indexOf('\nfunction ' + nome + '(');
  if (ini < 0) { ok('achei function ' + nome, false); return ''; }
  let i = html.indexOf('{', ini), prof = 0, q = null;
  for (; i < html.length; i++) {
    const ch = html[i];
    if (q) { if (ch === '\\') { i++; continue; } if (ch === q) q = null; continue; }
    if (ch === "'" || ch === '"' || ch === '`') { q = ch; continue; }
    if (ch === '{') prof++;
    else if (ch === '}') { prof--; if (prof === 0) break; }
  }
  return html.slice(ini + 1, i + 1);
}
ok('🧨 startApp liga as notificações nativas', /startSessionWatcher\(\);\n  try\{pushNativoIniciar\(\);\}catch\(e\)\{\}/.test(corpo('startApp')));
ok('mesmo prefixo no app e no servidor', /var PUSH_APNS_PREFIXO='apns:';/.test(html) && /const APNS_PREFIXO = 'apns:';/.test(fs.readFileSync(path.join(RAIZ, 'lib', 'push.js'), 'utf8')));

const FUNCS = ['pushSupported', 'pushNativo', 'pushPermDeNativo', 'pushPerm', 'pushNativoDesligado', 'pushNativoTokenSalvo', 'pushAtivoAgora', 'pushNativoPermAtualizar', 'pushNativoAbrir', 'pushNativoOuvintes', 'pushNativoRegistrar', 'pushNativoIniciar', 'pushGetSubscription', 'pushSaveSub', 'pushEnable', 'pushDisable', 'pushTimeout', 'pluginNativo'];
const VARS = (html.match(/var PUSH_APNS_PREFIXO=[\s\S]*?var pushOuvintesNativos=false;/) || [''])[0];
ok('variáveis do push nativo', !!VARS);

function monta(opts) {
  opts = opts || {};
  const ouv = {}, gravados = [], apagados = [], ls = {};
  let unreg = 0, registros = 0;
  const plugin = {
    estado: opts.estado || 'prompt',
    concede: opts.concede || 'granted',
    checkPermissions() { return Promise.resolve({ receive: this.estado }); },
    requestPermissions() { this.estado = this.concede; return Promise.resolve({ receive: this.concede }); },
    register() { registros++; setTimeout(() => { if (ouv.registration) ouv.registration({ value: 'AABBCC' + registros }); }, 0); return Promise.resolve(); },
    unregister() { unreg++; return Promise.resolve(); },
    addListener(ev, fn) { ouv[ev] = fn; return Promise.resolve({ remove() {} }); },
  };
  const cliente = { from: () => ({
    upsert: (row, o) => { gravados.push({ row, o }); return Promise.resolve({ error: null }); },
    delete: () => ({ eq: (k, v) => { apagados.push([k, v]); return Promise.resolve({ error: null }); } }),
  }) };
  const location = { href: 'https://www.endodirect.com.br/?app=ios', origin: 'https://www.endodirect.com.br' };
  const cx = {
    APP_LOJA: opts.loja === undefined ? 'ios' : opts.loja,
    window: { Capacitor: { Plugins: {}, isPluginAvailable: (n) => n === 'PushNotifications' && opts.semPlugin !== true, registerPlugin: () => plugin } },
    localStorage: { getItem: (k) => (k in ls ? ls[k] : null), setItem: (k, v) => { ls[k] = String(v); }, removeItem: (k) => { delete ls[k]; } },
    navigator: { userAgent: 'EndodirectApp/1.1 (ios)' },
    location, URL, Promise, setTimeout, clearTimeout, Error, String, Object,
    currentUser: { id: 'u1', email: 'aluno@exemplo.com' },
    getSupabaseClient: () => cliente,
  };
  vm.createContext(cx);
  vm.runInContext(VARS + '\n' + FUNCS.map(corpo).join('\n'), cx);
  return { cx, plugin, ouv, gravados, apagados, ls, location, get unreg() { return unreg; }, get registros() { return registros; } };
}

async function app() {
  // site e app 1.0: nada nativo
  ok('site: sem caminho nativo', monta({ loja: '' }).cx.pushNativo() === null);
  ok('🧨 app 1.0 (sem o plugin): botões continuam escondidos', monta({ semPlugin: true }).cx.pushSupported() === false);

  const a = monta();
  ok('app 1.1: notificações disponíveis', a.cx.pushSupported() === true && a.cx.pushPerm() === 'default');
  const sub = await a.cx.pushEnable();
  const g = a.gravados[0] || { row: {}, o: {} };
  ok('🧨 ativar grava "apns:<token>" com a marca nas colunas obrigatórias e a conta', sub.endpoint === 'apns:aabbcc1' && g.row.endpoint === 'apns:aabbcc1' && g.row.p256dh === 'apns' && g.row.auth === 'apns' && g.row.user_id === 'u1' && g.row.email === 'aluno@exemplo.com' && g.o.onConflict === 'endpoint', JSON.stringify(g));
  ok('permissão e token guardados', a.cx.pushPerm() === 'granted' && a.ls.endo_apns_token === 'aabbcc1' && a.cx.pushAtivoAgora() === true);
  const s2 = await a.cx.pushGetSubscription();
  ok('inscrição deste aparelho', s2 && s2.endpoint === 'apns:aabbcc1');
  await a.cx.pushDisable();
  ok('🧨 desativar: tira o registro do iPhone e apaga a linha', a.unreg === 1 && a.apagados.length === 1 && a.apagados[0][0] === 'endpoint' && a.apagados[0][1] === 'apns:aabbcc1');
  ok('desativado fica desativado', (await a.cx.pushGetSubscription()) === null && a.ls.endo_apns_off === '1' && a.cx.pushAtivoAgora() === false);
  a.cx.pushNativoIniciar();
  await new Promise((r) => setTimeout(r, 20));
  ok('no login, desativado não volta sozinho', a.registros === 1);
  await a.cx.pushEnable();
  ok('ativar de novo limpa a marca de desativado', !('endo_apns_off' in a.ls) && a.gravados.length === 2);

  const b = monta({ estado: 'granted' });
  b.cx.pushNativoIniciar();
  await new Promise((r) => setTimeout(r, 20));
  ok('🧨 no login, com avisos ligados: renova o token e grava com a conta', b.registros === 1 && b.gravados.length === 1 && b.gravados[0].row.endpoint === 'apns:aabbcc1');

  const c = monta({ concede: 'denied' });
  let msg = '';
  try { await c.cx.pushEnable(); } catch (e) { msg = e.message; }
  ok('negado: explica onde ligar no iPhone', /Ajustes › Notificações › Endodirect/.test(msg) && c.gravados.length === 0, msg);

  // toque na notificação
  const d = monta();
  d.cx.pushNativoOuvintes(d.plugin);
  d.ouv.pushNotificationActionPerformed({ notification: { data: { url: '/#aovivo' } } });
  ok('toque abre o endereço do aviso dentro do app', d.location.href === 'https://www.endodirect.com.br/?app=ios#aovivo', d.location.href);
  d.location.href = 'https://www.endodirect.com.br/?app=ios';
  d.ouv.pushNotificationActionPerformed({ notification: { data: { url: 'https://exemplo.com/golpe' } } });
  ok('🧨 toque nunca abre endereço de fora do site', d.location.href === 'https://www.endodirect.com.br/?app=ios');
}

(async () => {
  await servidor();
  await app();
  if (bad) { console.log('✗ notificações nativas do app do iPhone: ' + bad + ' falha(s)'); process.exit(1); }
  console.log('✓ notificações nativas do app do iPhone: token "apns:" gravado pelo app, enviado pela Apple com JWT ES256, mortos removidos');
})().catch((e) => { console.log('✗ erro no teste: ' + (e && e.stack || e)); process.exit(1); });
