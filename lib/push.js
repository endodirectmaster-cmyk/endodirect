// Web Push (notificações no celular) SEM dependências externas — só o módulo
// `crypto` nativo do Node. Implementa:
//   • VAPID (RFC 8292): JWT ES256 assinado com a chave privada do servidor.
//   • Criptografia do payload (RFC 8291 / RFC 8188, esquema "aes128gcm").
//   • Envio HTTP para o endpoint da inscrição (fetch nativo).
//   • sendToAll(): lê as inscrições em endodirect_push_subs (service role) e
//     dispara para todas; remove as que voltarem 404/410 (inscrição morta).
// Módulo de lib/ → NÃO conta como função serverless. NUNCA lança no caminho de
// envio em lote: erros por inscrição são capturados e retornados no resumo.

const crypto = require('crypto');

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://auth.endodirect.com.br';
function serviceKey() {
  return process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_KEY || '';
}

// Chave PÚBLICA do VAPID (não é segredo — também vai hardcoded no frontend).
// Pode ser sobrescrita por env. A PRIVADA vem SÓ do env (segredo).
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || 'BEyscFEW1gPewjFPkzpmEzl12i8cKij79AWvbZ8horMbbaWCHlGrJUMGyGVJczJvaSe3e6SqyiORvFbPsKRle-Q';
function vapidPrivateKey() { return process.env.VAPID_PRIVATE_KEY || ''; }
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:endodirectmaster@gmail.com';

function b64urlEncode(buf) {
  return Buffer.from(buf).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function b64urlDecode(str) {
  str = String(str || '').replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) str += '=';
  return Buffer.from(str, 'base64');
}

// Está configurado? (precisa da chave privada para assinar o VAPID)
function isConfigured() { return !!vapidPrivateKey() && !!VAPID_PUBLIC_KEY; }

// ── VAPID JWT (ES256) ──
function vapidKeyObject() {
  const pub = b64urlDecode(VAPID_PUBLIC_KEY); // 65 bytes: 0x04 || X(32) || Y(32)
  if (pub.length !== 65) throw new Error('VAPID_PUBLIC_KEY inválida (esperado 65 bytes).');
  const jwk = {
    kty: 'EC', crv: 'P-256',
    x: b64urlEncode(pub.slice(1, 33)),
    y: b64urlEncode(pub.slice(33, 65)),
    d: String(vapidPrivateKey()).replace(/=+$/, '') // base64url sem padding
  };
  return crypto.createPrivateKey({ key: jwk, format: 'jwk' });
}

function buildVapidJWT(audience, expSeconds) {
  const header = b64urlEncode(JSON.stringify({ typ: 'JWT', alg: 'ES256' }));
  const payload = b64urlEncode(JSON.stringify({ aud: audience, exp: expSeconds, sub: VAPID_SUBJECT }));
  const signingInput = header + '.' + payload;
  const sig = crypto.sign('sha256', Buffer.from(signingInput), { key: vapidKeyObject(), dsaEncoding: 'ieee-p1363' });
  return signingInput + '.' + b64urlEncode(sig);
}

// ── Criptografia aes128gcm (RFC 8291 + RFC 8188) ──
// Retorna o corpo binário pronto para enviar (header RFC 8188 || ciphertext).
function encryptPayload(plaintext, uaPublicB64, authSecretB64) {
  const uaPublic = b64urlDecode(uaPublicB64);     // 65 bytes
  const authSecret = b64urlDecode(authSecretB64); // 16 bytes
  if (uaPublic.length !== 65) throw new Error('p256dh inválida.');

  // Par efêmero do servidor (ECDH).
  const ecdh = crypto.createECDH('prime256v1');
  ecdh.generateKeys();
  const asPublic = ecdh.getPublicKey();           // 65 bytes
  const shared = ecdh.computeSecret(uaPublic);    // 32 bytes

  // IKM = HKDF(Extract(auth, shared), info="WebPush: info\0"||ua||as, 32)
  const keyInfo = Buffer.concat([Buffer.from('WebPush: info\0', 'utf8'), uaPublic, asPublic]);
  const IKM = Buffer.from(crypto.hkdfSync('sha256', shared, authSecret, keyInfo, 32));

  const salt = crypto.randomBytes(16);
  const CEK = Buffer.from(crypto.hkdfSync('sha256', IKM, salt, Buffer.from('Content-Encoding: aes128gcm\0', 'utf8'), 16));
  const NONCE = Buffer.from(crypto.hkdfSync('sha256', IKM, salt, Buffer.from('Content-Encoding: nonce\0', 'utf8'), 12));

  // Registro único: conteúdo || 0x02 (delimitador do último registro).
  const data = Buffer.concat([Buffer.from(plaintext, 'utf8'), Buffer.from([0x02])]);
  const cipher = crypto.createCipheriv('aes-128-gcm', CEK, NONCE);
  const ct = Buffer.concat([cipher.update(data), cipher.final()]);
  const tag = cipher.getAuthTag();
  const ciphertext = Buffer.concat([ct, tag]);

  // Header RFC 8188: salt(16) || rs(4, BE) || idlen(1) || keyid(=as_public, 65)
  const rs = Buffer.alloc(4); rs.writeUInt32BE(4096, 0);
  const idlen = Buffer.from([asPublic.length]);
  const header = Buffer.concat([salt, rs, idlen, asPublic]);
  return Buffer.concat([header, ciphertext]);
}

// ── APNs: notificações do app do iPhone (versão 1.1, 16/11/2026) ──
// O app 1.1 grava o token do aparelho em endodirect_push_subs com endpoint "apns:<token>"
// (p256dh/auth = 'apns'). sendPush manda esses pela Apple (HTTP/2, JWT ES256 assinado com a
// chave "Endodirect Push"); todo o resto (breaking news, Questão do Dia, avisos, suporte,
// ofensiva) passa por aqui sem mudar nada. Sem função serverless nova (Vercel 12/12).
// CONFIGURAÇÃO (Vercel, Production): APNS_PRIVATE_KEY = conteúdo do .p8, colado pelo
// professor (a chave não passa pelo Claude). Key ID, equipe, tópico e host têm padrão e
// podem ser trocados por APNS_KEY_ID, APPLE_TEAM_ID, APNS_TOPIC e APNS_HOST.
const APNS_PREFIXO = 'apns:';
function apnsConfig(env) {
  const e = env || process.env;
  return {
    keyId: String(e.APNS_KEY_ID || '3JT8BL5MU9').trim(),
    teamId: String(e.APPLE_TEAM_ID || '9Q4Y44Z44C').trim(),
    topic: String(e.APNS_TOPIC || 'br.com.endodirect.app').trim(),
    host: String(e.APNS_HOST || 'https://api.push.apple.com').trim(),
    chave: String(e.APNS_PRIVATE_KEY || '').replace(/\\n/g, '\n').trim(),
  };
}
function apnsConfigured(env) { return !!apnsConfig(env).chave; }
function isApnsEndpoint(endpoint) { return typeof endpoint === 'string' && endpoint.indexOf(APNS_PREFIXO) === 0; }

// O token de autenticação da Apple vale 1 h, e ela recusa trocas mais de 1 vez a cada 20 min:
// o mesmo é reaproveitado por 40 min dentro da instância.
let apnsJwtCache = null;
function apnsJWT(cfg, agoraSeg) {
  const agora = Math.floor(agoraSeg != null ? agoraSeg : Date.now() / 1000);
  if (apnsJwtCache && apnsJwtCache.keyId === cfg.keyId && apnsJwtCache.teamId === cfg.teamId && agora - apnsJwtCache.iat >= 0 && agora - apnsJwtCache.iat < 2400) return apnsJwtCache.jwt;
  const cab = b64urlEncode(Buffer.from(JSON.stringify({ alg: 'ES256', kid: cfg.keyId })));
  const corpo = b64urlEncode(Buffer.from(JSON.stringify({ iss: cfg.teamId, iat: agora })));
  const ass = crypto.sign('sha256', Buffer.from(cab + '.' + corpo), { key: crypto.createPrivateKey(cfg.chave), dsaEncoding: 'ieee-p1363' });
  const jwt = cab + '.' + corpo + '.' + b64urlEncode(ass);
  apnsJwtCache = { jwt: jwt, iat: agora, keyId: cfg.keyId, teamId: cfg.teamId };
  return jwt;
}

// Mesmo conteúdo do web push (título, texto, endereço). O app abre o endereço no toque.
function apnsCorpo(payloadObj) {
  const p = payloadObj || {};
  const aps = { alert: { title: String(p.title || 'Endodirect'), body: String(p.body || '') }, sound: 'default' };
  if (p.tag) aps['thread-id'] = String(p.tag).slice(0, 64);
  const corpo = { aps: aps };
  if (p.url) corpo.url = String(p.url);
  return JSON.stringify(corpo);
}

// Um POST HTTP/2 à Apple. Nunca lança: devolve { status, motivo } ou { status: 0, erro }.
function apnsPost(cfg, token, corpo, cabecalhos, timeoutMs) {
  const http2 = require('http2');
  return new Promise((resolve) => {
    let fim = false, cliente = null, relogio = null;
    const acaba = (r) => { if (fim) return; fim = true; if (relogio) clearTimeout(relogio); try { if (cliente) cliente.close(); } catch (e) { /* nada */ } resolve(r); };
    try { cliente = http2.connect(cfg.host); } catch (e) { return acaba({ status: 0, erro: (e && e.message) || String(e) }); }
    cliente.on('error', (e) => acaba({ status: 0, erro: (e && e.message) || String(e) }));
    relogio = setTimeout(() => { try { cliente.destroy(); } catch (e) { /* nada */ } acaba({ status: 0, erro: 'tempo esgotado' }); }, timeoutMs || 10000);
    let req;
    try { req = cliente.request(Object.assign({ ':method': 'POST', ':path': '/3/device/' + token }, cabecalhos)); }
    catch (e) { return acaba({ status: 0, erro: (e && e.message) || String(e) }); }
    let status = 0, dados = '';
    req.on('response', (h) => { status = Number(h[':status']) || 0; });
    req.setEncoding('utf8');
    req.on('data', (c) => { dados += c; });
    req.on('end', () => { let motivo = ''; try { motivo = (JSON.parse(dados || '{}').reason) || ''; } catch (e) { /* corpo vazio */ } acaba({ status: status, motivo: motivo }); });
    req.on('error', (e) => acaba({ status: 0, erro: (e && e.message) || String(e) }));
    req.end(corpo);
  });
}

// Token que a Apple diz não existir mais (app apagado, aparelho trocado): sai da tabela.
const APNS_TOKEN_MORTO = ['BadDeviceToken', 'Unregistered', 'DeviceTokenNotForTopic', 'ExpiredToken'];
async function sendApns(endpoint, payloadObj, opts) {
  opts = opts || {};
  const cfg = apnsConfig(opts.env);
  if (!cfg.chave) return { ok: false, status: 0, endpoint: endpoint, error: 'APNs não configurado (defina APNS_PRIVATE_KEY).' };
  const token = String(endpoint || '').slice(APNS_PREFIXO.length).replace(/[^0-9a-fA-F]/g, '').toLowerCase();
  if (!token) return { ok: false, status: 0, endpoint: endpoint, error: 'Token APNs vazio.' };
  const agora = Math.floor((opts.now || Date.now()) / 1000);
  let jwt;
  try { jwt = apnsJWT(cfg, agora); }
  catch (e) { return { ok: false, status: 0, endpoint: endpoint, error: 'Chave APNs inválida: ' + ((e && e.message) || e) }; }
  const cab = {
    authorization: 'bearer ' + jwt,
    'apns-topic': cfg.topic,
    'apns-push-type': 'alert',
    'apns-priority': '10',
    'apns-expiration': String(agora + (opts.ttl || 86400)),
    'content-type': 'application/json'
  };
  const r = await (opts.transporte || apnsPost)(cfg, token, apnsCorpo(payloadObj), cab, opts.timeoutMs || 10000);
  const status = Number(r && r.status) || 0;
  const motivo = (r && r.motivo) || '';
  // Token de autenticação recusado: o próximo envio assina outro.
  if (status === 403) apnsJwtCache = null;
  const gone = status === 410 || (status === 400 && APNS_TOKEN_MORTO.indexOf(motivo) >= 0);
  const ok = status === 200;
  return { ok: ok, status: status, endpoint: endpoint, gone: gone, error: ok ? undefined : (motivo || (r && r.erro) || ('HTTP ' + status)) };
}

// ── Envio para UMA inscrição ──
async function sendPush(subscription, payloadObj, opts) {
  opts = opts || {};
  if (subscription && isApnsEndpoint(subscription.endpoint)) return sendApns(subscription.endpoint, payloadObj, opts);
  if (!isConfigured()) return { ok: false, status: 0, error: 'VAPID não configurado (defina VAPID_PRIVATE_KEY).' };
  const endpoint = subscription && subscription.endpoint;
  const keys = (subscription && subscription.keys) || {};
  const p256dh = keys.p256dh || subscription.p256dh;
  const auth = keys.auth || subscription.auth;
  if (!endpoint || !p256dh || !auth) return { ok: false, status: 0, error: 'Inscrição incompleta.' };

  let body;
  try { body = encryptPayload(JSON.stringify(payloadObj || {}), p256dh, auth); }
  catch (e) { return { ok: false, status: 0, endpoint: endpoint, error: 'Falha ao cifrar: ' + ((e && e.message) || e) }; }

  let aud;
  try { aud = new URL(endpoint).origin; } catch (e) { return { ok: false, status: 0, endpoint: endpoint, error: 'Endpoint inválido.' }; }
  const exp = Math.floor((opts.now || Date.now()) / 1000) + 12 * 3600;
  const jwt = buildVapidJWT(aud, exp);

  try {
    const r = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': 'vapid t=' + jwt + ', k=' + VAPID_PUBLIC_KEY,
        'Content-Encoding': 'aes128gcm',
        'Content-Type': 'application/octet-stream',
        'TTL': String(opts.ttl || 86400),
        'Urgency': opts.urgency || 'normal'
      },
      body: body
    });
    const gone = (r.status === 404 || r.status === 410);
    return { ok: r.status >= 200 && r.status < 300, status: r.status, endpoint: endpoint, gone: gone };
  } catch (e) {
    return { ok: false, status: 0, endpoint: endpoint, error: (e && e.message) || String(e) };
  }
}

// ── Lê todas as inscrições (service role) ──
async function listSubscriptions() {
  const key = serviceKey();
  if (!key) return [];
  const url = `${SUPABASE_URL}/rest/v1/endodirect_push_subs?select=endpoint,p256dh,auth`;
  try {
    const r = await fetch(url, { headers: { apikey: key, Authorization: 'Bearer ' + key, Accept: 'application/json' } });
    if (!r.ok) return [];
    const rows = await r.json().catch(() => []);
    return Array.isArray(rows) ? rows : [];
  } catch (e) { console.error('[push] listSubscriptions falha:', (e && e.message) || e); return []; }
}

async function deleteSubscription(endpoint) {
  const key = serviceKey();
  if (!key || !endpoint) return;
  const url = `${SUPABASE_URL}/rest/v1/endodirect_push_subs?endpoint=eq.${encodeURIComponent(endpoint)}`;
  try { await fetch(url, { method: 'DELETE', headers: { apikey: key, Authorization: 'Bearer ' + key } }); }
  catch (e) { /* silencioso */ }
}

// ── Dispara para TODOS os inscritos. Remove os mortos (404/410). ──
async function sendToAll(payloadObj, opts) {
  opts = opts || {};
  if (!isConfigured() && !apnsConfigured()) return { ok: false, sent: 0, failed: 0, total: 0, error: 'VAPID não configurado.' };
  const subs = await listSubscriptions();
  if (!subs.length) return { ok: true, sent: 0, failed: 0, total: 0, removed: 0 };

  let sent = 0, failed = 0, removed = 0;
  const errors = [];
  const CONC = 8;
  for (let i = 0; i < subs.length; i += CONC) {
    const batch = subs.slice(i, i + CONC);
    const results = await Promise.all(batch.map(s => sendPush({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, payloadObj, opts)));
    for (const res of results) {
      if (res.ok) sent++;
      else {
        failed++;
        if (errors.length < 5) errors.push(res.error ? ('erro: ' + res.error) : ('HTTP ' + res.status));
        if (res.gone) { removed++; await deleteSubscription(res.endpoint); }
      }
    }
  }
  return { ok: true, sent: sent, failed: failed, total: subs.length, removed: removed, errors: errors };
}

// ── Inscrições de UM e-mail (ex.: o professor responsável por uma dúvida). ──
async function listSubscriptionsByEmail(email) {
  const key = serviceKey();
  const e = String(email || '').trim().toLowerCase();
  if (!key || !e) return [];
  const url = `${SUPABASE_URL}/rest/v1/endodirect_push_subs?email=eq.${encodeURIComponent(e)}&select=endpoint,p256dh,auth`;
  try {
    const r = await fetch(url, { headers: { apikey: key, Authorization: 'Bearer ' + key, Accept: 'application/json' } });
    if (!r.ok) return [];
    const rows = await r.json().catch(() => []);
    return Array.isArray(rows) ? rows : [];
  } catch (e2) { console.error('[push] listSubscriptionsByEmail falha:', (e2 && e2.message) || e2); return []; }
}

// ── Dispara para os aparelhos de UM e-mail (1 professor). Remove os mortos. ──
async function sendToEmail(email, payloadObj, opts) {
  opts = opts || {};
  if (!isConfigured() && !apnsConfigured()) return { ok: false, sent: 0, failed: 0, total: 0, error: 'VAPID não configurado.' };
  const subs = await listSubscriptionsByEmail(email);
  if (!subs.length) return { ok: true, sent: 0, failed: 0, total: 0, removed: 0 };
  let sent = 0, failed = 0, removed = 0, iphone = 0;
  const errors = [];
  const CONC = 8;
  for (let i = 0; i < subs.length; i += CONC) {
    const batch = subs.slice(i, i + CONC);
    const results = await Promise.all(batch.map(s => sendPush({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, payloadObj, opts)));
    for (const res of results) {
      if (res.ok) { sent++; if (isApnsEndpoint(res.endpoint)) iphone++; }
      else {
        failed++;
        if (errors.length < 5) errors.push((isApnsEndpoint(res.endpoint) ? 'iPhone: ' : 'navegador: ') + (res.error || ('HTTP ' + res.status)));
        if (res.gone) { removed++; await deleteSubscription(res.endpoint); }
      }
    }
  }
  return { ok: true, sent: sent, failed: failed, total: subs.length, removed: removed, iphone: iphone, errors: errors };
}

// ── Lembrete diário de OFENSIVA (streak) ──
// Push para quem tem sequência ativa (streak>=1) e ainda NÃO estudou hoje.
// O streak é calculado a partir de endodirect_app_state.payload.act (mapa
// {YYYY-MM-DD:n} que o cliente sincroniza). Dias em BRT (UTC-3). Roda 1x/dia
// no cron. Fail-safe: nunca lança.
function brtKey(ms) { return new Date((ms || Date.now()) - 3 * 3600000).toISOString().slice(0, 10); }
function actStreakServer(act, now) {
  if (!act || typeof act !== 'object') return 0;
  var day = now || Date.now();
  if (!(act[brtKey(day)] > 0)) day -= 86400000; // hoje ainda não estudou: começa de ontem
  var s = 0, g = 0;
  while (act[brtKey(day)] > 0 && g < 4000) { s++; day -= 86400000; g++; }
  return s;
}
async function sendStreakReminders(opts) {
  opts = opts || {};
  if (!isConfigured() && !apnsConfigured()) return { ok: false, reason: 'not_configured' };
  const key = serviceKey();
  if (!key) return { ok: false, reason: 'no_service_key' };
  const hdr = { apikey: key, Authorization: 'Bearer ' + key, Accept: 'application/json' };
  let subs = [];
  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/endodirect_push_subs?select=endpoint,p256dh,auth,user_id`, { headers: hdr });
    if (r.ok) subs = await r.json().catch(() => []);
  } catch (e) { return { ok: false, reason: 'subs_error' }; }
  if (!Array.isArray(subs) || !subs.length) return { ok: true, sent: 0, total: 0, eligible: 0 };
  const actMap = {};
  try {
    const r2 = await fetch(`${SUPABASE_URL}/rest/v1/endodirect_app_state?select=user_id,act:payload->act`, { headers: hdr });
    if (r2.ok) { const rows = await r2.json().catch(() => []); (rows || []).forEach((x) => { if (x && x.user_id) actMap[x.user_id] = x.act; }); }
  } catch (e) { return { ok: false, reason: 'state_error' }; }
  const now = opts.now || Date.now();
  const today = brtKey(now);
  const targets = subs.filter((s) => {
    const act = s.user_id && actMap[s.user_id];
    if (!act) return false;
    if (act[today] > 0) return false; // já estudou hoje → ofensiva garantida
    return actStreakServer(act, now) >= 1;
  });
  let sent = 0, failed = 0, removed = 0;
  const url = (process.env.PUBLIC_BASE_URL || 'https://www.endodirect.com.br').replace(/\/+$/, '');
  const CONC = 8;
  for (let i = 0; i < targets.length; i += CONC) {
    const batch = targets.slice(i, i + CONC);
    const results = await Promise.all(batch.map((s) => {
      const st = actStreakServer(actMap[s.user_id], now);
      const body = (st === 1 ? 'Você estudou ontem' : 'Você está há ' + st + ' dias seguidos') + ' — estude hoje para manter sua ofensiva! 🔥';
      return sendPush({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, { title: '🔥 Mantenha sua ofensiva!', body: body, url: url, tag: 'endodirect-streak' }, opts);
    }));
    results.forEach((res) => { if (res.ok) sent++; else { failed++; if (res.gone) { removed++; deleteSubscription(res.endpoint); } } });
  }
  return { ok: true, sent: sent, failed: failed, total: subs.length, eligible: targets.length, removed: removed };
}

module.exports = {
  isConfigured,
  publicKey: VAPID_PUBLIC_KEY,
  sendPush,
  sendApns,
  apnsConfigured,
  sendToAll,
  sendToEmail,
  sendStreakReminders,
  listSubscriptions,
  listSubscriptionsByEmail,
  // exportados para teste local:
  apnsConfig,
  apnsJWT,
  apnsCorpo,
  encryptPayload,
  buildVapidJWT,
  b64urlEncode,
  b64urlDecode
};
