// Revoga, na Apple, o acesso de quem entrou com a Apple e excluiu a conta (11/11/2026).
//
// POR QUE. A App Store exige que o app que oferece "Entrar com a Apple" use a API REST
// da Apple para revogar os tokens do usuário quando ele exclui a conta (diretriz
// 5.1.1(v) e a página "Offering account deletion in your app").
//
// COMO, SEM GUARDAR TOKEN NENHUM. Na hora da exclusão, o app do iPhone abre a folha da
// Apple de novo (AppleSignInPlugin, já existente) e manda o `authorizationCode` novo,
// que vale 5 minutos e uma vez só. Aqui:
//   1. assina o client_secret (JWT ES256) com a chave "Sign in with Apple" da equipe;
//   2. troca o código por tokens em /auth/token;
//   3. confere que o `sub` do id_token é o da identidade Apple da conta que pediu a
//      exclusão (ninguém revoga a Apple de outra pessoa com um código próprio);
//   4. revoga o refresh_token (ou o access_token) em /auth/revoke.
// Nenhum token é gravado: tudo acontece dentro do pedido de exclusão.
//
// NUNCA LANÇA e nunca impede a exclusão: a conta sai mesmo que a Apple falhe ou que a
// chave ainda não esteja configurada. O resultado vai para o log.
//
// CONFIGURAÇÃO (variáveis de ambiente da Vercel, coladas pelo professor; a chave não
// passa pelo Claude): APPLE_SIWA_KEY_ID e APPLE_SIWA_PRIVATE_KEY (o conteúdo do .p8,
// da linha BEGIN à END). A equipe e o identificador do app têm padrão e podem ser
// trocados por APPLE_TEAM_ID e APPLE_CLIENT_ID.
'use strict';
const crypto = require('crypto');

const APPLE = 'https://appleid.apple.com';
const TIMEOUT_MS = 8000;

function config(env) {
  const e = env || process.env;
  const chave = String(e.APPLE_SIWA_PRIVATE_KEY || '').replace(/\\n/g, '\n').trim();
  return {
    teamId: String(e.APPLE_TEAM_ID || '9Q4Y44Z44C').trim(),
    clientId: String(e.APPLE_CLIENT_ID || 'br.com.endodirect.app').trim(),
    keyId: String(e.APPLE_SIWA_KEY_ID || '').trim(),
    chave,
  };
}

const b64url = (buf) => Buffer.from(buf).toString('base64').replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');

// client_secret da Apple: JWT ES256, válido por 5 minutos (o máximo aceito é 6 meses;
// aqui ele vive só o tempo do pedido).
function clientSecret(cfg, agoraSeg) {
  const iat = Math.floor(agoraSeg != null ? agoraSeg : Date.now() / 1000);
  const cab = b64url(JSON.stringify({ alg: 'ES256', kid: cfg.keyId, typ: 'JWT' }));
  const corpo = b64url(JSON.stringify({ iss: cfg.teamId, iat, exp: iat + 300, aud: APPLE, sub: cfg.clientId }));
  const assinatura = crypto.sign('sha256', Buffer.from(cab + '.' + corpo), { key: crypto.createPrivateKey(cfg.chave), dsaEncoding: 'ieee-p1363' });
  return cab + '.' + corpo + '.' + b64url(assinatura);
}

// Lê o `sub` do id_token que a própria Apple acabou de devolver, por TLS, em resposta
// ao nosso client_secret. A assinatura do id_token não precisa ser conferida aqui.
function subDoIdToken(idToken) {
  try {
    const p = String(idToken || '').split('.')[1] || '';
    const d = JSON.parse(Buffer.from(p.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8'));
    return String(d.sub || '');
  } catch (e) { return ''; }
}

async function postForm(fetchFn, url, campos) {
  const ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
  const to = ctrl ? setTimeout(() => ctrl.abort(), TIMEOUT_MS) : null;
  try {
    return await fetchFn(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' },
      body: new URLSearchParams(campos).toString(),
      signal: ctrl ? ctrl.signal : undefined,
    });
  } finally { if (to) clearTimeout(to); }
}

// codigo: authorizationCode da folha da Apple. subsDaConta: os `sub` das identidades
// Apple da conta (de userFromReq). Devolve { ok, motivo }.
async function revogarApple(codigo, subsDaConta, opts) {
  const o = opts || {};
  const fetchFn = o.fetch || fetch;
  try {
    const subs = (Array.isArray(subsDaConta) ? subsDaConta : []).map(String).filter(Boolean);
    if (!codigo) return { ok: false, motivo: 'sem_codigo' };
    if (!subs.length) return { ok: false, motivo: 'conta_sem_apple' };
    const cfg = config(o.env);
    if (!cfg.keyId || !/BEGIN PRIVATE KEY/.test(cfg.chave)) return { ok: false, motivo: 'sem_chave' };
    const segredo = clientSecret(cfg, o.agoraSeg);

    const rt = await postForm(fetchFn, APPLE + '/auth/token', {
      client_id: cfg.clientId, client_secret: segredo, code: String(codigo), grant_type: 'authorization_code',
    });
    const tok = await rt.json().catch(() => null);
    if (!rt.ok || !tok) return { ok: false, motivo: 'troca_http_' + rt.status + (tok && tok.error ? '_' + tok.error : '') };
    const sub = subDoIdToken(tok.id_token);
    if (!sub || !subs.includes(sub)) return { ok: false, motivo: 'outra_conta_apple' };
    const token = tok.refresh_token || tok.access_token;
    if (!token) return { ok: false, motivo: 'sem_token' };

    const rr = await postForm(fetchFn, APPLE + '/auth/revoke', {
      client_id: cfg.clientId, client_secret: segredo, token, token_type_hint: tok.refresh_token ? 'refresh_token' : 'access_token',
    });
    if (!rr.ok) return { ok: false, motivo: 'revoga_http_' + rr.status };
    return { ok: true };
  } catch (e) {
    return { ok: false, motivo: (e && e.name === 'AbortError') ? 'tempo' : 'erro' };
  }
}

// Teste da configuração, pelo botão do painel do professor: manda à Apple um código
// inválido de propósito. "invalid_grant" quer dizer que a Apple aceitou o client_secret
// (chave, Key ID, equipe e app certos) e só recusou o código; "invalid_client" quer
// dizer chave, Key ID ou vínculo com o app errados. Nada é revogado nem guardado.
async function testarChaveApple(opts) {
  const o = opts || {};
  const fetchFn = o.fetch || fetch;
  try {
    const cfg = config(o.env);
    if (!cfg.keyId || !/BEGIN PRIVATE KEY/.test(cfg.chave)) return { ok: false, motivo: 'sem_chave' };
    let segredo;
    try { segredo = clientSecret(cfg, o.agoraSeg); } catch (e) { return { ok: false, motivo: 'chave_ilegivel' }; }
    const r = await postForm(fetchFn, APPLE + '/auth/token', {
      client_id: cfg.clientId, client_secret: segredo, code: 'teste-endodirect-codigo-invalido', grant_type: 'authorization_code',
    });
    const d = await r.json().catch(() => null);
    const erro = String((d && d.error) || '');
    if (erro === 'invalid_grant') return { ok: true, motivo: 'aceita' };
    if (erro === 'invalid_client') return { ok: false, motivo: 'invalid_client' };
    return { ok: false, motivo: 'resposta_' + r.status + (erro ? '_' + erro : '') };
  } catch (e) {
    return { ok: false, motivo: (e && e.name === 'AbortError') ? 'tempo' : 'erro' };
  }
}

module.exports = { revogarApple, testarChaveApple, clientSecret, subDoIdToken, config };
