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

// ── Envio para UMA inscrição ──
async function sendPush(subscription, payloadObj, opts) {
  opts = opts || {};
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
  if (!isConfigured()) return { ok: false, sent: 0, failed: 0, total: 0, error: 'VAPID não configurado.' };
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
  if (!isConfigured()) return { ok: false, sent: 0, failed: 0, total: 0, error: 'VAPID não configurado.' };
  const subs = await listSubscriptionsByEmail(email);
  if (!subs.length) return { ok: true, sent: 0, failed: 0, total: 0, removed: 0 };
  let sent = 0, failed = 0, removed = 0;
  const CONC = 8;
  for (let i = 0; i < subs.length; i += CONC) {
    const batch = subs.slice(i, i + CONC);
    const results = await Promise.all(batch.map(s => sendPush({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, payloadObj, opts)));
    for (const res of results) {
      if (res.ok) sent++;
      else { failed++; if (res.gone) { removed++; await deleteSubscription(res.endpoint); } }
    }
  }
  return { ok: true, sent: sent, failed: failed, total: subs.length, removed: removed };
}

module.exports = {
  isConfigured,
  publicKey: VAPID_PUBLIC_KEY,
  sendPush,
  sendToAll,
  sendToEmail,
  listSubscriptions,
  listSubscriptionsByEmail,
  // exportados para teste local:
  encryptPayload,
  buildVapidJWT,
  b64urlEncode,
  b64urlDecode
};
