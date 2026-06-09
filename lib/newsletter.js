// Endodirect — Newsletter diária por e-mail (Resend).
// Envia os 3 artigos mais relevantes do dia (calculados pelo radar) para todos
// os membros. Acionada SÓ pelo cron diário (não pelo refresh manual do admin),
// com trava de idempotência (1 envio por dia) gravada em endodirect_global_state.
//
// Variáveis de ambiente necessárias para o envio:
//   RESEND_API_KEY        — chave da API do Resend (sem ela, o envio é pulado)
//   NEWSLETTER_FROM       — remetente verificado, ex.: "Endodirect <newsletter@endodirect.com.br>"
//   NEWSLETTER_REPLYTO    — (opcional) e-mail de resposta/descadastro
//   SUPABASE_SERVICE_ROLE_KEY — para ler a lista de membros e gravar a trava

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://auth.endodirect.com.br';

function serviceHeaders(key) {
  return { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', Accept: 'application/json' };
}
function dateBR(d) {
  const dt = d || new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${p(dt.getUTCDate())}/${p(dt.getUTCMonth() + 1)}/${dt.getUTCFullYear()}`;
}
function todayISO() { return new Date().toISOString().slice(0, 10); }
function esc(s) {
  return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function chunk(arr, size) { const o = []; for (let i = 0; i < arr.length; i += size) o.push(arr.slice(i, i + size)); return o; }

async function loadPayload(key) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/endodirect_global_state?id=eq.main&select=payload`, { headers: serviceHeaders(key) });
  if (!r.ok) return {};
  const rows = await r.json().catch(() => []);
  return (rows && rows[0] && rows[0].payload) || {};
}
async function savePayload(key, payload) {
  await fetch(`${SUPABASE_URL}/rest/v1/endodirect_global_state?on_conflict=id`, {
    method: 'POST',
    headers: { ...serviceHeaders(key), Prefer: 'resolution=merge-duplicates,return=minimal' },
    body: JSON.stringify({ id: 'main', payload, updated_by: null, updated_at: new Date().toISOString() })
  });
}

// Lista os e-mails de todos os membros via Admin API do Supabase (paginado).
async function getMemberEmails(key) {
  const out = new Set();
  for (let page = 1; page <= 50; page++) {
    const r = await fetch(`${SUPABASE_URL}/auth/v1/admin/users?page=${page}&per_page=200`, { headers: serviceHeaders(key) });
    if (!r.ok) break;
    const data = await r.json().catch(() => ({}));
    const users = Array.isArray(data.users) ? data.users : (Array.isArray(data) ? data : []);
    users.forEach((u) => { const e = (u && u.email || '').trim().toLowerCase(); if (e && e.indexOf('@') > 0) out.add(e); });
    if (users.length < 200) break;
  }
  return [...out];
}

function renderEmail(items, replyTo) {
  const blocos = items.map((a, i) => {
    const tags = [a.subespecialidade, a.tipo].filter(Boolean).map((t) => `<span style="display:inline-block;background:#eef2ff;color:#3730a3;border-radius:10px;padding:2px 8px;font-size:12px;margin-right:6px">${esc(t)}</span>`).join('');
    return `<tr><td style="padding:18px 0;border-top:1px solid #e5e7eb">
      <div style="font-size:13px;color:#6b7280;margin-bottom:6px">${i + 1} de 3${a.data ? ' · ' + esc(a.data) : ''}</div>
      <div style="margin-bottom:8px">${tags}</div>
      <a href="${esc(a.link)}" style="font-size:17px;font-weight:700;color:#1e3a5f;text-decoration:none;line-height:1.35">${esc(a.titulo)}</a>
      <div style="font-size:13px;color:#6b7280;margin:4px 0 10px">${esc(a.fonte)}</div>
      <div style="font-size:14px;color:#111827;line-height:1.6">${esc(a.resumo)}</div>
      ${a.porque ? `<div style="font-size:13px;color:#374151;line-height:1.6;margin-top:8px"><b>Por que importa:</b> ${esc(a.porque)}</div>` : ''}
      <div style="margin-top:10px"><a href="${esc(a.link)}" style="font-size:13px;color:#2563eb;text-decoration:none">Ler o artigo →</a></div>
    </td></tr>`;
  }).join('');
  return `<!doctype html><html><body style="margin:0;background:#f3f4f6;font-family:Arial,Helvetica,sans-serif">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:24px 12px"><tr><td align="center">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb">
      <tr><td style="background:#1e3a5f;padding:22px 28px">
        <div style="color:#fff;font-size:20px;font-weight:800;letter-spacing:.3px">Endodirect</div>
        <div style="color:#cbd5e1;font-size:13px;margin-top:2px">Os 3 artigos mais relevantes do dia · ${dateBR()}</div>
      </td></tr>
      <tr><td style="padding:8px 28px 24px">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${blocos}</table>
      </td></tr>
      <tr><td style="padding:18px 28px;background:#f9fafb;border-top:1px solid #e5e7eb">
        <div style="font-size:12px;color:#6b7280;line-height:1.6">Seleção automática do radar Endodirect entre revistas líderes de endocrinologia e metabolismo. Conteúdo educacional — confira sempre a fonte original.</div>
        <div style="font-size:12px;color:#9ca3af;margin-top:8px">Você recebe este e-mail por ser membro do Endodirect.${replyTo ? ` Para sair, responda a <a href="mailto:${esc(replyTo)}?subject=Descadastrar%20newsletter" style="color:#6b7280">${esc(replyTo)}</a>.` : ''}</div>
      </td></tr>
    </table>
  </td></tr></table></body></html>`;
}

async function sendViaResend(apiKey, from, replyTo, subject, html, recipients) {
  let sent = 0;
  for (const part of chunk(recipients, 100)) {
    const batch = part.map((to) => {
      const m = { from, to: [to], subject, html };
      if (replyTo) m.reply_to = replyTo;
      return m;
    });
    const r = await fetch('https://api.resend.com/emails/batch', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(batch)
    });
    if (r.ok) sent += part.length;
    else { const t = await r.text().catch(() => ''); console.error('[newsletter] Resend HTTP', r.status, t.slice(0, 300)); }
  }
  return sent;
}

// Envia a newsletter do dia. Fail-safe: qualquer pré-condição ausente => pula.
async function sendDailyNewsletter(topArticles) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) { console.log('[newsletter] RESEND_API_KEY ausente — envio pulado.'); return { sent: false, reason: 'no_api_key' }; }
  const items = Array.isArray(topArticles) ? topArticles.filter((a) => a && a.titulo && a.resumo) : [];
  if (items.length < 3) { console.log('[newsletter] menos de 3 artigos com resumo no dia — pulado.'); return { sent: false, reason: 'few_articles' }; }
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_KEY;
  if (!serviceKey) { console.log('[newsletter] service key ausente — pulado.'); return { sent: false, reason: 'no_service_key' }; }

  const payload = await loadPayload(serviceKey);
  const today = todayISO();
  if (payload.newsletter_sent === today) { console.log('[newsletter] já enviada hoje — pulado.'); return { sent: false, reason: 'already_sent' }; }

  const recipients = await getMemberEmails(serviceKey);
  if (!recipients.length) { console.log('[newsletter] sem destinatários — pulado.'); return { sent: false, reason: 'no_recipients' }; }

  const from = process.env.NEWSLETTER_FROM || 'Endodirect <newsletter@endodirect.com.br>';
  const replyTo = process.env.NEWSLETTER_REPLYTO || '';
  const top3 = items.slice(0, 3);
  const subject = `Endodirect — 3 artigos do dia (${dateBR()})`;
  const html = renderEmail(top3, replyTo);
  const sent = await sendViaResend(apiKey, from, replyTo, subject, html, recipients);

  payload.newsletter_sent = today;
  payload.newsletter = { date: today, items: top3 };
  try { await savePayload(serviceKey, payload); } catch (e) { console.error('[newsletter] falha ao gravar trava', e && e.message); }
  console.log(`[newsletter] enviada para ${sent}/${recipients.length} destinatários.`);
  return { sent: true, recipients: recipients.length, delivered: sent };
}

module.exports = { sendDailyNewsletter };
