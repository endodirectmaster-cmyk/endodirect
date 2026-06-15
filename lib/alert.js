// Alerta operacional por e-mail (Resend) aos admins. 100% fail-safe: nunca lança.
// Usado pelos crons para avisar NA HORA quando algo crítico falha (radar diário,
// newsletter, healthcheck) — em vez de descobrir dias depois pelo aluno.
// Destinatários: env ALERT_TO/HEALTHCHECK_TO (csv) → tabela endodirect_admins →
// fallback endodirectmaster@gmail.com. Módulo de lib/ (não conta como função Vercel).

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://auth.endodirect.com.br';

function serviceKey() {
  return process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_KEY || '';
}
function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

async function adminEmails() {
  const key = serviceKey();
  if (!key) return [];
  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/endodirect_admins?select=email`, {
      headers: { apikey: key, Authorization: `Bearer ${key}`, Accept: 'application/json' }
    });
    if (!r.ok) return [];
    const rows = await r.json().catch(() => []);
    return rows.map((x) => String(x.email || '').trim().toLowerCase()).filter((e) => e.indexOf('@') > 0);
  } catch (e) { return []; }
}

function recipients(adm) {
  const env = String(process.env.ALERT_TO || process.env.HEALTHCHECK_TO || '')
    .split(',').map((e) => e.trim().toLowerCase()).filter((e) => e.indexOf('@') > 0);
  if (env.length) return env;
  if (adm && adm.length) return adm;
  return ['endodirectmaster@gmail.com'];
}

// subject: linha curta. lines: string ou array de strings (detalhes). Fail-safe:
// nunca lança e nunca derruba quem chamou.
async function sendAlert(subject, lines) {
  try {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) { console.error('[alert] RESEND_API_KEY ausente; alerta não enviado:', subject); return { sent: false, reason: 'no_resend_key' }; }
    const from = process.env.NEWSLETTER_FROM || 'Endodirect <newsletter@endodirect.com.br>';
    const to = recipients(await adminEmails());
    const body = (Array.isArray(lines) ? lines : [lines]).filter(Boolean)
      .map((l) => `<p style="margin:0 0 8px;font-size:14px;color:#374151">${esc(l)}</p>`).join('');
    const html = `<!doctype html><html><body style="margin:0;background:#f3f4f6;font-family:Arial,Helvetica,sans-serif;padding:24px 12px">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb">
          <tr><td style="background:#7f1d1d;padding:18px 24px;color:#fff;font-size:17px;font-weight:800">🔴 Alerta — Endodirect</td></tr>
          <tr><td style="padding:18px 24px"><p style="margin:0 0 12px;font-size:15px;font-weight:700;color:#111827">${esc(subject)}</p>${body}
            <p style="margin:14px 0 0;font-size:12px;color:#9ca3af">Alerta automático de cron. Verifique os logs da Vercel e o painel admin.</p>
          </td></tr>
        </table></td></tr></table></body></html>`;
    const r = await fetch('https://api.resend.com/emails/batch', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(to.map((dest) => ({ from, to: [dest], subject: `🔴 Endodirect — ${subject}`, html })))
    });
    if (!r.ok) { const t = await r.text().catch(() => ''); console.error('[alert] Resend HTTP', r.status, t.slice(0, 200)); return { sent: false, reason: 'resend_error' }; }
    return { sent: true, count: to.length };
  } catch (e) { console.error('[alert] falha ao enviar alerta:', (e && e.message) || e); return { sent: false, reason: 'error' }; }
}

module.exports = { sendAlert };
