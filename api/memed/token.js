// Integração Memed (Sinapse Prescrição) — geração do token do prescritor.
//
// Fluxo: o front (médico logado) envia os dados do prescritor (nome, CRM, UF,
// CPF) + o access_token da sessão Supabase. Validamos a sessão, sincronizamos
// o prescritor na Memed e devolvemos o token que o SDK do front usa para abrir
// o módulo de prescrição.
//
// GATED POR AMBIENTE: enquanto MEMED_API_KEY/MEMED_SECRET não estiverem
// definidas na Vercel, respondemos { configured:false } e o front mantém o
// receituário próprio. Assim nada muda em produção até as chaves chegarem.
//
// Envs necessárias quando a parceria sair:
//   MEMED_API_KEY, MEMED_SECRET     (credenciais de parceiro Memed)
//   MEMED_API_BASE  (opcional; default produção; sandbox conforme o portal)
//   MEMED_COLOR     (opcional; cor do botão/tema, ex.: #0a7d68)
//
// OBS: os nomes exatos de endpoint/campos seguem o padrão público do Sinapse
// Prescrição; confirme com a documentação oficial recebida no onboarding da
// Memed e ajuste getMemedToken() se necessário.
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://auth.endodirect.com.br';
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_KEY;

const MEMED_API_KEY = (process.env.MEMED_API_KEY || '').trim();
const MEMED_SECRET = (process.env.MEMED_SECRET || process.env.MEMED_SECRET_KEY || '').trim();
// Allowlist opcional (homologação): se definida, SÓ esses e-mails veem a Memed;
// os demais ficam no receituário próprio. Em produção (chaves reais), deixe
// MEMED_ALLOW vazia para liberar a todos. Ex.: "memed.teste@endodirect.com.br".
const MEMED_ALLOW = (process.env.MEMED_ALLOW || '').split(',').map(function (s) { return s.trim().toLowerCase(); }).filter(Boolean);
function emailAllowed(email) { return MEMED_ALLOW.length === 0 || MEMED_ALLOW.indexOf(String(email || '').toLowerCase()) >= 0; }
// Base SEM o /v1 (o código já acrescenta /v1 nas rotas). Remove barra e /v1
// finais — assim funciona mesmo se MEMED_API_BASE for setado com o /v1 da doc.
const MEMED_API_BASE = (process.env.MEMED_API_BASE || 'https://integrations.api.memed.com.br').replace(/\/+$/, '').replace(/\/v1$/i, '');
const MEMED_COLOR = process.env.MEMED_COLOR || '#0a7d68';
// SDK do front-end: PRECISA casar com o ambiente da API. Um token de PRODUÇÃO só
// renderiza no SDK de produção; um de homologação só no de homologação — usar o
// SDK errado faz o módulo "abrir" mas a tela travar (iframe não autentica). Por
// isso o default é DERIVADO do MEMED_API_BASE, em vez de fixo no de homologação.
// URLs oficiais (doc Memed → Front-end → Configurações → URLs):
//   homologação: integrations.memed.com.br/.../sinapse-prescricao.min.js
//   produção:    partners.memed.com.br/integration.js
// MEMED_SCRIPT (env) continua sobrescrevendo, se definido.
const MEMED_SCRIPT_HOMOLOG = 'https://integrations.memed.com.br/modulos/plataforma.sinapse-prescricao/build/sinapse-prescricao.min.js';
const MEMED_SCRIPT_PROD = 'https://partners.memed.com.br/integration.js';
const MEMED_IS_SANDBOX = /integrations\.api\.memed/i.test(MEMED_API_BASE);
const MEMED_SCRIPT = process.env.MEMED_SCRIPT || (MEMED_IS_SANDBOX ? MEMED_SCRIPT_HOMOLOG : MEMED_SCRIPT_PROD);

function json(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(body));
}

function parseBody(req) {
  if (!req.body) return {};
  if (typeof req.body === 'string') { try { return JSON.parse(req.body); } catch { return {}; } }
  return req.body;
}

function isConfigured() { return !!(MEMED_API_KEY && MEMED_SECRET); }

async function userFromToken(token) {
  if (!SERVICE_ROLE) return null;
  const r = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: { apikey: SERVICE_ROLE, Authorization: 'Bearer ' + token }
  });
  if (!r.ok) return null;
  return r.json().catch(() => null);
}

// Sincroniza o prescritor na Memed (cadastro de usuário/médico) e devolve o
// token do SDK. Estrutura JSON:API conforme a doc "Cadastrar o prescritor":
// data.attributes com external_id, nome, sobrenome, cpf, board{board_code,
// board_number, board_state}, data_nascimento (DD/MM/YYYY). Token em
// data.attributes.token.
async function getMemedToken(p) {
  const externalId = String(p.externalId || p.cpf || p.crm || '');
  const qs = `api-key=${encodeURIComponent(MEMED_API_KEY)}&secret-key=${encodeURIComponent(MEMED_SECRET)}`;
  const url = `${MEMED_API_BASE}/v1/sinapse-prescricao/usuarios?${qs}`;
  // Divide o nome completo em nome + sobrenome (a Memed exige os dois).
  let nome = (p.nome || '').trim(), sobrenome = (p.sobrenome || '').trim();
  if (!sobrenome) {
    const parts = nome.split(/\s+/);
    if (parts.length > 1) { sobrenome = parts.slice(1).join(' '); nome = parts[0]; }
  }
  // data_nascimento: a Memed exige DD/MM/YYYY (o input <date> envia YYYY-MM-DD).
  let nasc = String(p.dataNascimento || '').trim();
  const mIso = nasc.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (mIso) nasc = mIso[3] + '/' + mIso[2] + '/' + mIso[1];
  const attributes = {
    external_id: externalId,
    nome: nome,
    sobrenome: sobrenome || '.',
    cpf: String(p.cpf || '').replace(/\D/g, ''),
    board: {
      board_code: 'CRM',
      board_number: String(p.crm || '').replace(/\D/g, ''),
      board_state: String(p.uf || '').toUpperCase()
    }
  };
  if (nasc) attributes.data_nascimento = nasc;
  if (p.email) attributes.email = String(p.email);
  if (p.telefone) attributes.telefone = String(p.telefone).replace(/\D/g, '');
  const body = { data: { type: 'usuarios', attributes } };
  const r = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/vnd.api+json' },
    body: JSON.stringify(body)
  });
  const raw = await r.text();
  let data = {};
  try { data = JSON.parse(raw); } catch (e) {}
  if (r.ok) {
    const token = data && data.data && data.data.attributes && data.data.attributes.token;
    if (token) return token;
    throw new Error('Token não retornado pela Memed.');
  }
  // Prescritor JÁ cadastrado para este id externo: em PRODUÇÃO o POST não
  // recria (na homologação era tolerante, por isso nunca víamos esse erro).
  // Recupera o token do prescritor existente via GET por external_id.
  const errText = String(raw || '').toLowerCase();
  const isDuplicate = !!externalId && (r.status === 409 || r.status === 422 || /j[áa]\s*cadastrad|already\s*(registered|exists)|id\s*externo/.test(errText));
  if (isDuplicate) {
    const tok = await getExistingMemedToken(externalId, qs);
    if (tok) return tok;
  }
  // Diagnóstico: status HTTP + corpo cru da Memed (revela a causa real).
  console.log('[memed-resp] status=' + r.status + ' body=' + String(raw).slice(0, 500));
  // 5xx = indisponibilidade da Memed; 4xx = erro específico e acionável.
  if (r.status >= 500) throw new Error('Memed temporariamente indisponível. Tente novamente em instantes.');
  const msg = (data && data.errors && data.errors[0] && (data.errors[0].detail || data.errors[0].title)) || `Erro HTTP ${r.status} da Memed`;
  throw new Error(msg);
}

// Busca o token de um prescritor JÁ cadastrado, pelo external_id (GET).
async function getExistingMemedToken(externalId, qs) {
  const url = `${MEMED_API_BASE}/v1/sinapse-prescricao/usuarios/${encodeURIComponent(externalId)}?${qs}`;
  try {
    const r = await fetch(url, { headers: { Accept: 'application/vnd.api+json' } });
    const raw = await r.text();
    let data = {};
    try { data = JSON.parse(raw); } catch (e) {}
    if (r.ok) {
      const d = data && data.data;
      const node = Array.isArray(d) ? d[0] : d;
      const token = node && node.attributes && node.attributes.token;
      if (token) return token;
    }
    console.log('[memed-getexist] status=' + r.status + ' body=' + String(raw).slice(0, 400));
  } catch (e) {
    console.log('[memed-getexist] erro:', (e && e.message) || e);
  }
  return null;
}

module.exports = async function handler(req, res) {
  // GET = checagem de configuração (o front decide entre Memed e fallback).
  if (req.method === 'GET') {
    return json(res, 200, { ok: true, configured: isConfigured(), color: MEMED_COLOR, script: MEMED_SCRIPT, allow: MEMED_ALLOW });
  }
  if (req.method !== 'POST') { res.setHeader('Allow', 'GET, POST'); return json(res, 405, { ok: false, error: 'Metodo nao permitido.' }); }

  if (!isConfigured()) return json(res, 200, { ok: true, configured: false });
  if (!SERVICE_ROLE) return json(res, 500, { ok: false, error: 'Chave de servico do Supabase ausente no servidor.' });

  const auth = req.headers.authorization || '';
  const token = auth.indexOf('Bearer ') === 0 ? auth.slice(7).trim() : '';
  if (!token) return json(res, 401, { ok: false, error: 'Sessao ausente.' });
  const user = await userFromToken(token);
  const email = user && String(user.email || '').toLowerCase();
  if (!email) return json(res, 401, { ok: false, error: 'Sessao invalida.' });
  // Trava de homologação: fora da allowlist, responde como não-configurado
  // (o front mantém o receituário próprio). Sem allowlist, libera a todos.
  if (!emailAllowed(email)) return json(res, 200, { ok: true, configured: false });

  const b = parseBody(req);
  const crm = String(b.crm || '').trim();
  const uf = String(b.uf || '').trim();
  if (!crm || !uf) return json(res, 400, { ok: false, error: 'Informe CRM e UF do prescritor.' });

  try {
    const memedToken = await getMemedToken({
      externalId: (user && user.id) || email,
      nome: b.nome || (user && user.user_metadata && user.user_metadata.name) || email,
      sobrenome: b.sobrenome || '',
      cpf: String(b.cpf || '').replace(/\D/g, '') || undefined,
      email,
      crm, uf,
      especialidade: b.especialidade ? String(b.especialidade).trim() : undefined,
      dataNascimento: b.nascimento ? String(b.nascimento).trim() : undefined
    });
    return json(res, 200, { ok: true, configured: true, token: memedToken, color: MEMED_COLOR, script: MEMED_SCRIPT });
  } catch (error) {
    // Diagnóstico seguro: só comprimentos das chaves (NUNCA os valores, nem
    // fragmentos) + base. Homologação esperada: api-key=56, secret-key=55.
    console.log('[memed-dbg] keyLen=' + MEMED_API_KEY.length + ' secLen=' + MEMED_SECRET.length + ' base=' + MEMED_API_BASE);
    console.error('[memed-token] erro:', (error && error.message) || error);
    return json(res, 502, { ok: false, error: (error && error.message) || 'Falha ao autenticar na Memed.' });
  }
};

module.exports.config = { maxDuration: 30 };
