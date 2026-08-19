// Newsletter para quem NÃO abre o app: captação pública + quem recebe a edição.
//
// ⚠️ A REGRA QUE NÃO PODE QUEBRAR É O OPT-OUT. Um formulário público pode ser
// preenchido por qualquer pessoa, com o endereço de qualquer pessoa. Se a lista
// nova entrasse por cima do descadastro, a plataforma passaria a mandar e-mail
// para quem pediu explicitamente para não receber — sem erro nenhum, sem log,
// e a primeira notícia disso seria uma denúncia de spam.
//
// ⚠️ E a rota pública não pode responder de forma diferente para "e-mail novo" e
// "já inscrito": um formulário que diferencia os dois vira consulta de "fulano
// assina?" para quem quiser sondar.
'use strict';
const N = require('../lib/newsletter.js');
const falhas = [];
const conf = (desc, cond) => { if (!cond) falhas.push(desc); };

// ── 1. destinatarios(): a regra pura ────────────────────────────────────────
const r = N.destinatarios({
  membros: ['Aluno@Exemplo.com', ' repetido@exemplo.com '],
  extra: ['manual@exemplo.com'],
  optin: ['leitor@exemplo.com', 'repetido@exemplo.com', 'DESCADASTRADO@exemplo.com'],
  unsub: ['descadastrado@exemplo.com'],
  excluir: new Set(['admin@exemplo.com']),
});
conf('⚠️ mandou para quem se descadastrou — via lista de opt-in público', r.indexOf('descadastrado@exemplo.com') < 0);
conf('perdeu o inscrito público (o produto de quem não abre o app)', r.indexOf('leitor@exemplo.com') >= 0);
conf('perdeu o membro cadastrado', r.indexOf('aluno@exemplo.com') >= 0);
conf('perdeu a lista manual', r.indexOf('manual@exemplo.com') >= 0);
conf('não normalizou maiúsculas/espaços', r.indexOf('Aluno@Exemplo.com') < 0 && r.indexOf('repetido@exemplo.com') >= 0);
conf('duplicou destinatário presente em duas listas', r.filter((e) => e === 'repetido@exemplo.com').length === 1);

const r2 = N.destinatarios({ membros: ['admin@exemplo.com', 'ok@exemplo.com'], excluir: new Set(['admin@exemplo.com']) });
conf('não respeitou a lista de exclusão', r2.length === 1 && r2[0] === 'ok@exemplo.com');
const r3 = N.destinatarios({ membros: ['sem-arroba', '', null, 'bom@exemplo.com'] });
conf('deixou passar endereço sem @', r3.length === 1 && r3[0] === 'bom@exemplo.com');
conf('quebrou com listas ausentes', Array.isArray(N.destinatarios({})) && N.destinatarios({}).length === 0);

// ── 2. a rota pública de inscrição ──────────────────────────────────────────
// ⚠️ A rota de inscrição vive DENTRO de api/publico.js: a Vercel só aceita 12
// funções serverless e cada arquivo em api/ é uma função (guarda em
// test-aula-ao-vivo.js). Um arquivo próprio para isto estouraria o teto.
const handler = require('../api/publico.js');
const ROTA = '/api/publico?rota=inscrever';
function reqFalso(metodo, corpo, comoStream) {
  const base = { method: metodo, url: ROTA };
  if (!comoStream) { base.body = corpo; return base; }
  const buf = Buffer.from(typeof corpo === 'string' ? corpo : JSON.stringify(corpo), 'utf8');
  base[Symbol.asyncIterator] = async function* () { yield buf; };
  return base;
}
function resFalso() {
  const o = { statusCode: 0, headers: {}, corpo: '' };
  o.setHeader = (k, v) => { o.headers[k.toLowerCase()] = v; };
  o.end = (b) => { o.corpo = String(b == null ? '' : b); };
  return o;
}
async function chama(req, env) {
  const guarda = { ...process.env };
  ['SUPABASE_SERVICE_ROLE_KEY', 'SUPABASE_SECRET_KEY', 'SUPABASE_SERVICE_KEY'].forEach((k) => delete process.env[k]);
  Object.assign(process.env, env || {});
  const res = resFalso();
  try { await handler(req, res); } finally {
    Object.keys(process.env).forEach((k) => { if (!(k in guarda)) delete process.env[k]; });
    Object.assign(process.env, guarda);
  }
  return res;
}

(async () => {
  const fetchOriginal = global.fetch;
  const chamadas = [];
  global.fetch = async (url, opts) => {
    chamadas.push({ url: String(url), corpo: JSON.parse((opts && opts.body) || '{}') });
    return { ok: true, json: async () => ({ ok: true }) };
  };
  try {
    // 2a. GET não inscreve ninguém
    const rGet = await chama(reqFalso('GET', {}), { SUPABASE_SERVICE_ROLE_KEY: 'k' });
    conf('GET deveria ser recusado, deu ' + rGet.statusCode, rGet.statusCode === 405);

    // 2b. e-mail inválido não chega ao banco
    const antes = chamadas.length;
    const rMau = await chama(reqFalso('POST', { email: 'nao-e-email' }), { SUPABASE_SERVICE_ROLE_KEY: 'k' });
    conf('e-mail inválido deveria dar 400, deu ' + rMau.statusCode, rMau.statusCode === 400);
    conf('⚠️ e-mail inválido chegou a bater no banco', chamadas.length === antes);

    // 2c. caminho feliz: normaliza e leva a origem
    chamadas.length = 0;
    const rOk = await chama(reqFalso('POST', { email: '  Leitor@Exemplo.COM ', origem: 'resumo:incidentaloma-adrenal' }),
                            { SUPABASE_SERVICE_ROLE_KEY: 'k' });
    conf('inscrição válida não deu 200 (deu ' + rOk.statusCode + ')', rOk.statusCode === 200);
    conf('não chamou a RPC de inscrição', chamadas.length === 1 && /endodirect_newsletter_subscribe/.test(chamadas[0].url));
    conf('não normalizou o e-mail antes de gravar', chamadas[0] && chamadas[0].corpo.p_email === 'leitor@exemplo.com');
    conf('perdeu a origem (é o que diz qual página converte)', chamadas[0] && chamadas[0].corpo.p_origem === 'resumo:incidentaloma-adrenal');

    // 2d. lê corpo em stream também (é como o runtime entrega)
    chamadas.length = 0;
    const rStream = await chama(reqFalso('POST', { email: 'stream@exemplo.com' }, true), { SUPABASE_SERVICE_ROLE_KEY: 'k' });
    conf('não leu o corpo vindo em stream (deu ' + rStream.statusCode + ')', rStream.statusCode === 200);
    conf('stream: e-mail não chegou ao banco', chamadas.length === 1 && chamadas[0].corpo.p_email === 'stream@exemplo.com');

    // 2e. ⚠️ resposta IGUAL para novo e para já inscrito (a RPC devolve ok em ambos)
    const corpoNovo = rOk.corpo;
    chamadas.length = 0;
    const rRepetido = await chama(reqFalso('POST', { email: 'leitor@exemplo.com' }), { SUPABASE_SERVICE_ROLE_KEY: 'k' });
    conf('⚠️ resposta diferente para e-mail já inscrito — vira consulta de "fulano assina?"',
         rRepetido.statusCode === rOk.statusCode && rRepetido.corpo === corpoNovo);

    // 2f. corpo gigante em rota pública é descartado, não processado
    chamadas.length = 0;
    const gigante = JSON.stringify({ email: 'x@y.com', lixo: 'A'.repeat(20000) });
    const rGigante = await chama(reqFalso('POST', gigante, true), { SUPABASE_SERVICE_ROLE_KEY: 'k' });
    conf('⚠️ aceitou corpo de 20 KB numa rota pública', rGigante.statusCode === 400 && chamadas.length === 0);

    // 2g. sem service key: 503, e NUNCA "ok" fingido
    chamadas.length = 0;
    const rSemKey = await chama(reqFalso('POST', { email: 'a@b.com' }), {});
    conf('sem service key deveria dar 503, deu ' + rSemKey.statusCode, rSemKey.statusCode === 503);
    conf('⚠️ respondeu ok sem ter gravado nada', rSemKey.corpo.indexOf('"ok":true') < 0);
  } finally {
    global.fetch = fetchOriginal;
  }

  if (falhas.length) {
    console.error('✗ newsletter (captação pública):');
    falhas.forEach((f) => console.error('  - ' + f));
    process.exit(1);
  }
  console.log('✓ newsletter: opt-out vence toda lista nova, e a rota pública normaliza, não enumera e não finge sucesso');
})();
