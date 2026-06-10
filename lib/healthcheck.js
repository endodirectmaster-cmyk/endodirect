// Endodirect — Health check semanal da plataforma.
// Verifica os pontos críticos (Supabase, banco de questões, radar/mural,
// newsletter, chaves de pagamento/IA/e-mail) e envia um relatório por e-mail
// aos admins via Resend. Acionado pelo cron semanal (/api/cron/healthcheck).
// 100% fail-safe: nunca lança; em erro, registra o check como falha.

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://auth.endodirect.com.br';

function serviceKey() {
  return process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_KEY || '';
}
function sh(key) { return { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', Accept: 'application/json' }; }
function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
function daysSince(ms) { return ms ? Math.floor((Date.now() - ms) / 86400000) : null; }

async function loadPayload(key) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/endodirect_global_state?id=eq.main&select=payload`, { headers: sh(key) });
  if (!r.ok) throw new Error('global_state HTTP ' + r.status);
  const rows = await r.json().catch(() => []);
  return (rows && rows[0] && rows[0].payload) || {};
}
async function countTable(key, table) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=*`, { headers: { ...sh(key), Prefer: 'count=exact', Range: '0-0' } });
  const cr = r.headers.get('content-range') || '';
  const i = cr.indexOf('/');
  return i >= 0 ? parseInt(cr.slice(i + 1), 10) : NaN;
}
async function adminEmails(key) {
  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/endodirect_admins?select=email`, { headers: sh(key) });
    if (!r.ok) return [];
    const rows = await r.json().catch(() => []);
    return rows.map((x) => String(x.email || '').trim().toLowerCase()).filter((e) => e.indexOf('@') > 0);
  } catch (e) { return []; }
}

function recipients(adm) {
  const env = String(process.env.HEALTHCHECK_TO || '').split(',').map((e) => e.trim().toLowerCase()).filter((e) => e.indexOf('@') > 0);
  if (env.length) return env;
  if (adm.length) return adm;
  return ['endodirectmaster@gmail.com'];
}

function reportHtml(checks, resumo) {
  const dot = (s) => s === 'ok' ? '🟢' : (s === 'warn' ? '🟡' : '🔴');
  const linhas = checks.map((c) => `<tr>
    <td style="padding:8px 10px;border-top:1px solid #e5e7eb;font-size:14px">${dot(c.status)} <b>${esc(c.nome)}</b></td>
    <td style="padding:8px 10px;border-top:1px solid #e5e7eb;font-size:13px;color:#374151">${esc(c.detalhe)}</td>
  </tr>`).join('');
  return `<!doctype html><html><body style="margin:0;background:#f3f4f6;font-family:Arial,Helvetica,sans-serif">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:24px 12px"><tr><td align="center">
    <table role="presentation" width="640" cellpadding="0" cellspacing="0" style="max-width:640px;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb">
      <tr><td style="background:#1e3a5f;padding:20px 26px">
        <div style="color:#fff;font-size:19px;font-weight:800">Endodirect — Health check semanal</div>
        <div style="color:#cbd5e1;font-size:13px;margin-top:3px">${esc(resumo)}</div>
      </td></tr>
      <tr><td style="padding:6px 26px 20px">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${linhas}</table>
        <div style="font-size:12px;color:#9ca3af;margin-top:14px">Verificação automática semanal. 🟢 ok · 🟡 atenção · 🔴 falha. Investigue os itens marcados.</div>
      </td></tr>
    </table>
  </td></tr></table></body></html>`;
}

async function sendReport(checks, resumo, to) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { sent: false, reason: 'no_resend_key' };
  const from = process.env.NEWSLETTER_FROM || 'Endodirect <newsletter@endodirect.com.br>';
  const worst = checks.some((c) => c.status === 'fail') ? '🔴' : (checks.some((c) => c.status === 'warn') ? '🟡' : '🟢');
  const r = await fetch('https://api.resend.com/emails/batch', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(to.map((dest) => ({ from, to: [dest], subject: `${worst} Endodirect — Health check semanal`, html: reportHtml(checks, resumo) })))
  });
  if (!r.ok) { const t = await r.text().catch(() => ''); console.error('[healthcheck] Resend HTTP', r.status, t.slice(0, 200)); return { sent: false, reason: 'resend_error' }; }
  return { sent: true, count: to.length };
}

async function runHealthcheck() {
  const checks = [];
  const add = (nome, status, detalhe) => checks.push({ nome, status, detalhe });
  const key = serviceKey();

  // 1) Supabase + payload
  let payload = null;
  if (!key) { add('Supabase (service role)', 'fail', 'SUPABASE_SERVICE_ROLE_KEY ausente — checks de banco pulados.'); }
  else {
    try { payload = await loadPayload(key); add('Supabase', 'ok', 'endodirect_global_state acessível.'); }
    catch (e) { add('Supabase', 'fail', 'Falha ao ler global_state: ' + ((e && e.message) || e)); }
  }

  if (payload) {
    // 2) Banco de questões
    const nq = Array.isArray(payload.provas) ? payload.provas.length : 0;
    add('Banco de questões', nq >= 100 ? 'ok' : (nq > 0 ? 'warn' : 'fail'), nq + ' questões no banco.');

    // 3) Radar / mural (atualização diária)
    const radar = Array.isArray(payload.radar_avisos) ? payload.radar_avisos : [];
    const maxAt = radar.reduce((m, a) => Math.max(m, Number((a && a.at) || 0)), 0);
    const d = daysSince(maxAt);
    add('Radar / mural', d == null ? 'warn' : (d <= 2 ? 'ok' : (d <= 5 ? 'warn' : 'fail')),
      d == null ? 'Sem artigos automáticos no mural.' : `Último artigo há ${d} dia(s) · ${radar.length} no mural.`);

    // 4) Newsletter diária
    const ns = payload.newsletter_sent || null;
    const nd = ns ? Math.floor((Date.now() - Date.parse(ns + 'T12:00:00Z')) / 86400000) : null;
    add('Newsletter diária', nd == null ? 'warn' : (nd <= 2 ? 'ok' : 'warn'),
      ns ? `Último envio: ${ns} (há ${nd} dia(s)).` : 'Sem registro de envio recente.');
  }

  // 5) Usuários (app_state)
  if (key) {
    try { const n = await countTable(key, 'endodirect_app_state'); add('Usuários (app_state)', Number.isFinite(n) ? 'ok' : 'warn', Number.isFinite(n) ? n + ' contas com estado salvo.' : 'Não foi possível contar.'); }
    catch (e) { add('Usuários (app_state)', 'warn', 'Falha ao contar app_state.'); }
  }

  // 6) Chaves / integrações (presença de env)
  add('IA (Anthropic)', process.env.ANTHROPIC_API_KEY ? 'ok' : 'fail', process.env.ANTHROPIC_API_KEY ? 'ANTHROPIC_API_KEY presente.' : 'ANTHROPIC_API_KEY ausente — IA não funciona.');
  add('E-mail (Resend)', process.env.RESEND_API_KEY ? 'ok' : 'warn', process.env.RESEND_API_KEY ? 'RESEND_API_KEY presente.' : 'RESEND_API_KEY ausente — newsletter/relatórios não enviam.');
  // 7) pagar.me + modo
  const pk = process.env.PAGARME_PUBLIC_KEY || '';
  const sk = process.env.PAGARME_SECRET_KEY || '';
  if (!pk || !sk) add('Pagamentos (pagar.me)', 'fail', 'Chave pública/secreta do pagar.me ausente — checkout não processa.');
  else add('Pagamentos (pagar.me)', /^pk_live_/.test(pk) ? 'ok' : 'warn', /^pk_live_/.test(pk) ? 'Modo LIVE (vendas reais).' : 'Modo TESTE (pk_test) — pagamentos não são reais.');

  const fail = checks.filter((c) => c.status === 'fail').length;
  const warn = checks.filter((c) => c.status === 'warn').length;
  const resumo = fail ? `${fail} falha(s) e ${warn} alerta(s) — ação necessária.` : (warn ? `${warn} alerta(s) — vale revisar.` : 'Tudo operacional ✅');

  const to = recipients(await adminEmails(key));
  let email = { sent: false, reason: 'skipped' };
  try { email = await sendReport(checks, resumo, to); } catch (e) { console.error('[healthcheck] envio falhou', (e && e.message) || e); email = { sent: false, reason: 'error' }; }

  return { ok: fail === 0, resumo, checks, email, recipients: to.length };
}

module.exports = { runHealthcheck };
