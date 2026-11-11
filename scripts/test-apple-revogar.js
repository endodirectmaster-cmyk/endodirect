#!/usr/bin/env node
// REVOGAÇÃO NA APPLE AO EXCLUIR A CONTA (11/11/2026).
//
// A App Store exige que, ao excluir a conta de quem entrou com a Apple, o app revogue
// o acesso na Apple pela API REST. O app do iPhone manda um código novo da folha da
// Apple; o servidor troca e revoga na hora, sem guardar token (lib/apple-revogar.js).
//
// 🧨 Os modos de quebrar isto em silêncio:
//  - client_secret com algoritmo, emissor, público ou assinatura errados (a Apple
//    responde invalid_client e nada é revogado, só um aviso no log);
//  - revogar sem conferir que o código é da Apple desta conta;
//  - deixar a falha da Apple impedir a exclusão (ou lançar e derrubar o endpoint);
//  - o app parar de mandar o código, ou mandar fora do app do iPhone.
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const crypto = require('crypto');
const RAIZ = path.join(__dirname, '..');

let bad = 0;
const ok = (nome, cond, det) => { if (cond) return; bad++; console.log('  ✗ ' + nome + (det ? ' — ' + det : '')); };
let terminou = false;
process.on('exit', () => { if (!terminou) { console.log('  ✗ o teste não chegou ao fim (promessa pendurada)'); process.exitCode = 1; } });

const { revogarApple, clientSecret, subDoIdToken, config } = require(path.join(RAIZ, 'lib', 'apple-revogar.js'));

const par = crypto.generateKeyPairSync('ec', { namedCurve: 'P-256' });
const pem = par.privateKey.export({ type: 'pkcs8', format: 'pem' });
const ENV = { APPLE_SIWA_KEY_ID: 'ABC123DEFG', APPLE_SIWA_PRIVATE_KEY: pem };
const dec = (s) => JSON.parse(Buffer.from(s.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8'));
const jwtFalso = (corpo) => 'e30.' + Buffer.from(JSON.stringify(corpo)).toString('base64').replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_') + '.x';

function appleFalsa(resp) {
  const chamadas = [];
  const f = async (url, init) => {
    chamadas.push({ url, campos: Object.fromEntries(new URLSearchParams(init.body)) });
    const r = resp[url.replace('https://appleid.apple.com', '')] || { status: 404, body: {} };
    if (r.lanca) throw new Error('rede');
    return { ok: r.status >= 200 && r.status < 300, status: r.status, json: async () => r.body };
  };
  f.chamadas = chamadas;
  return f;
}

(async () => {
  // ---- 1. client_secret -------------------------------------------------------------------
  const cfg = config(ENV);
  ok('padrões: equipe 9Q4Y44Z44C e app br.com.endodirect.app', cfg.teamId === '9Q4Y44Z44C' && cfg.clientId === 'br.com.endodirect.app');
  ok('chave com \\n escapado também é aceita', /\n/.test(config({ APPLE_SIWA_PRIVATE_KEY: pem.replace(/\n/g, '\\n') }).chave));
  const jwt = clientSecret(cfg, 1794400000);
  const [h, c, a] = jwt.split('.');
  const cab = dec(h), corpo = dec(c);
  ok('🧨 cabeçalho ES256 com o Key ID', cab.alg === 'ES256' && cab.kid === 'ABC123DEFG');
  ok('🧨 emissor = equipe, assunto = app, público = Apple', corpo.iss === '9Q4Y44Z44C' && corpo.sub === 'br.com.endodirect.app' && corpo.aud === 'https://appleid.apple.com');
  ok('validade curta (≤ 5 min) e dentro do teto de 6 meses', corpo.iat === 1794400000 && corpo.exp - corpo.iat > 0 && corpo.exp - corpo.iat <= 300);
  const assinou = crypto.verify('sha256', Buffer.from(h + '.' + c), { key: par.publicKey, dsaEncoding: 'ieee-p1363' }, Buffer.from(a.replace(/-/g, '+').replace(/_/g, '/'), 'base64'));
  ok('🧨 assinatura ES256 (P-256, formato JOSE) confere com a chave pública', assinou);
  ok('lê o sub do id_token', subDoIdToken(jwtFalso({ sub: '001.abc' })) === '001.abc' && subDoIdToken('lixo') === '');

  // ---- 2. revogação -------------------------------------------------------------------------
  {
    const f = appleFalsa({ '/auth/token': { status: 200, body: { refresh_token: 'rt-1', access_token: 'at-1', id_token: jwtFalso({ sub: 'A1' }) } }, '/auth/revoke': { status: 200, body: {} } });
    const r = await revogarApple('cod-1', ['A1'], { env: ENV, fetch: f });
    ok('🧨 caminho feliz: troca o código e revoga', r.ok === true && f.chamadas.length === 2, JSON.stringify(r));
    const [t, v] = f.chamadas;
    ok('troca em /auth/token com authorization_code', t.url === 'https://appleid.apple.com/auth/token' && t.campos.grant_type === 'authorization_code' && t.campos.code === 'cod-1' && t.campos.client_id === 'br.com.endodirect.app' && t.campos.client_secret.split('.').length === 3);
    ok('🧨 revoga o refresh_token em /auth/revoke', v && v.url === 'https://appleid.apple.com/auth/revoke' && v.campos.token === 'rt-1' && v.campos.token_type_hint === 'refresh_token' && v.campos.client_id === 'br.com.endodirect.app');
  }
  {
    const f = appleFalsa({ '/auth/token': { status: 200, body: { refresh_token: 'rt-2', id_token: jwtFalso({ sub: 'OUTRO' }) } }, '/auth/revoke': { status: 200, body: {} } });
    const r = await revogarApple('cod-2', ['A1'], { env: ENV, fetch: f });
    ok('🧨 código de outra Conta Apple: não revoga', !r.ok && r.motivo === 'outra_conta_apple' && f.chamadas.length === 1);
  }
  {
    const f = appleFalsa({});
    const r1 = await revogarApple('cod', ['A1'], { env: {}, fetch: f });
    const r2 = await revogarApple('', ['A1'], { env: ENV, fetch: f });
    const r3 = await revogarApple('cod', [], { env: ENV, fetch: f });
    ok('sem chave configurada: não chama a Apple', !r1.ok && r1.motivo === 'sem_chave' && f.chamadas.length === 0);
    ok('sem código: não chama a Apple', !r2.ok && r2.motivo === 'sem_codigo');
    ok('conta sem identidade Apple: não chama a Apple', !r3.ok && r3.motivo === 'conta_sem_apple' && f.chamadas.length === 0);
  }
  {
    const f = appleFalsa({ '/auth/token': { status: 400, body: { error: 'invalid_grant' } } });
    const r = await revogarApple('vencido', ['A1'], { env: ENV, fetch: f });
    ok('código vencido: motivo claro e sem revogar', !r.ok && r.motivo === 'troca_http_400_invalid_grant' && f.chamadas.length === 1);
    const g = appleFalsa({ '/auth/token': { lanca: true } });
    const r2 = await revogarApple('cod', ['A1'], { env: ENV, fetch: g });
    ok('🧨 rede caindo: devolve erro, não lança', !r2.ok && r2.motivo === 'erro');
  }

  // ---- 3. dentro da exclusão ----------------------------------------------------------------
  {
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'chave-de-teste';
    const { excluirConta } = require(path.join(RAIZ, 'lib', 'excluir-conta.js'));
    const ordem = [];
    const fetchOriginal = global.fetch;
    global.fetch = async (url, init) => {
      const u = String(url);
      if (u.includes('/rpc/endodirect_exclusao')) {
        const etapa = JSON.parse(init.body).p_etapa;
        ordem.push('rpc:' + etapa);
        return { ok: true, status: 200, json: async () => (etapa === 'listar' ? { ok: true, assinaturas: [], acessos: [], push: [], newsletter: [], suporte: [] } : { ok: true, acessos_anonimizados: 0 }) };
      }
      if (u.includes('/auth/v1/admin/users/')) { ordem.push('auth:' + init.method); return { ok: true, status: 200, json: async () => ({}) }; }
      return { ok: false, status: 500, json: async () => ({}) };
    };
    const falha = appleFalsa({ '/auth/token': { status: 400, body: { error: 'invalid_client' } } });
    const appleOrdem = async (url, init) => { ordem.push('apple:' + url.split('/').pop()); return falha(url, init); };
    const r = await excluirConta({ id: 'u1', email: 'a@b.c', appleSubs: ['A1'] }, { appleCode: 'cod', apple: { env: ENV, fetch: appleOrdem } });
    ok('🧨 Apple falhando: a conta sai mesmo assim', r.ok === true && ordem.includes('auth:DELETE'), JSON.stringify(r) + ' ' + ordem.join(','));
    ok('a Apple é chamada antes de apagar o usuário', ordem.indexOf('apple:token') >= 0 && ordem.indexOf('apple:token') < ordem.indexOf('auth:DELETE'));
    ordem.length = 0;
    const r2 = await excluirConta({ id: 'u2', email: 'x@y.z', appleSubs: [] }, {});
    ok('conta sem Apple: nada muda na exclusão', r2.ok === true && !ordem.some((x) => x.startsWith('apple')) && ordem.includes('auth:DELETE'));
    global.fetch = fetchOriginal;
  }

  // ---- 4. userFromReq devolve as identidades Apple ------------------------------------------
  {
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'chave-de-teste';
    const { userFromReq } = require(path.join(RAIZ, 'lib', 'admin-auth.js'));
    const fetchOriginal = global.fetch;
    global.fetch = async () => ({ ok: true, status: 200, json: async () => ({ id: 'u9', email: 'P@Q.com', identities: [{ provider: 'google', id: 'g1' }, { provider: 'apple', id: '001.zz', identity_data: { sub: '001.zz' } }] }) });
    const u = await userFromReq({ headers: { authorization: 'Bearer tok' } });
    global.fetch = fetchOriginal;
    ok('🧨 userFromReq traz os sub das identidades Apple', u && u.id === 'u9' && u.email === 'p@q.com' && JSON.stringify(u.appleSubs) === '["001.zz"]', JSON.stringify(u));
  }

  // ---- 5. endpoint e app --------------------------------------------------------------------
  const ai = fs.readFileSync(path.join(RAIZ, 'api', 'ai.js'), 'utf8');
  ok('🧨 o endpoint repassa apple_code à exclusão', /const appleCode = typeof sbody\.apple_code === 'string' \? sbody\.apple_code\.slice\(0, 2000\) : '';\s*const r = await excluirConta\(user, \{ appleCode \}\);/.test(ai));
  const html = fs.readFileSync(path.join(RAIZ, 'index.html'), 'utf8');
  ok('🧨 a exclusão pede o código da Apple antes de chamar o servidor', /return codigoAppleParaExclusao\(\)\.then\(function\(appleCode\)\{\s*var corpo=\{kind:'excluir_conta',confirmar:'EXCLUIR'\};\s*if\(appleCode\)corpo\.apple_code=appleCode;/.test(html));
  ok('fechar a folha da Apple para a exclusão com aviso', /if\(e&&e\.appleCancelado\)\{falha\(e\.message\);return;\}/.test(html));
  const ini = html.indexOf('var EXCLUSAO_APPLE_CANCELADA=');
  const fim = html.indexOf('\n}\n', html.indexOf('function codigoAppleParaExclusao(){')) + 3;
  ok('bloco do código da Apple encontrado', ini > 0 && fim > ini);
  function cliente(disponivel, providers, resposta) {
    const chamadas = [];
    const ctx = {
      appleDisponivel: () => disponivel,
      getSupabaseClient: () => ({ auth: { getSession: () => Promise.resolve({ data: { session: { user: { app_metadata: { providers }, identities: [] } } } }) } }),
      pluginNativo: () => ({ entrar: (a) => { chamadas.push(a); return resposta(); } }),
      Promise, Error, String,
    };
    vm.createContext(ctx);
    vm.runInContext(html.slice(ini, fim) + '\nthis.f=codigoAppleParaExclusao;', ctx);
    return { f: ctx.f, chamadas };
  }
  {
    const c = cliente(true, ['email', 'apple'], () => Promise.resolve({ authorizationCode: 'cod-app' }));
    ok('🧨 app do iPhone + conta Apple: abre a folha e devolve o código', (await c.f()) === 'cod-app' && c.chamadas.length === 1);
    const c2 = cliente(true, ['email'], () => Promise.resolve({ authorizationCode: 'x' }));
    ok('conta sem Apple: não abre a folha', (await c2.f()) === '' && c2.chamadas.length === 0);
    const c3 = cliente(false, ['apple'], () => Promise.resolve({ authorizationCode: 'x' }));
    ok('fora do app do iPhone: não abre a folha', (await c3.f()) === '' && c3.chamadas.length === 0);
    const c4 = cliente(true, ['apple'], () => Promise.reject(Object.assign(new Error('x'), { code: 'CANCELADO' })));
    let e4 = null; try { await c4.f(); } catch (e) { e4 = e; }
    ok('🧨 folha fechada: para com aviso', e4 && e4.appleCancelado === true);
    const c5 = cliente(true, ['apple'], () => Promise.reject(Object.assign(new Error('x'), { code: 'FALHOU' })));
    ok('outra falha da Apple: segue sem código', (await c5.f()) === '');
  }

  terminou = true;
  if (bad) { console.log('\n' + bad + ' falha(s): revogação na Apple ao excluir a conta'); process.exit(1); }
  console.log('revogação na Apple ao excluir a conta: client_secret ES256, conta conferida, exclusão nunca travada: ok');
})().catch((e) => { console.log('  ✗ erro no teste: ' + (e && e.stack || e)); process.exit(1); });
