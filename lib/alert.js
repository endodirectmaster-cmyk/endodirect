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

// ── ALERTA DE FEED MUDO, SEM E-MAIL DIÁRIO ──────────────────────────────────
// O alerta de feed oficial mudo (28/08) fazia o certo — contar o silêncio — mas
// repetia o mesmo e-mail todo dia às 07:30. O professor, em 07/09: "não precisa
// ficar enviando diariamente um email, informando desse erro."
//
// ⚠️ CALAR NÃO É OPÇÃO: foi o silêncio que deixou a Lilly fora de 1.019 itens.
// A saída é avisar por MUDANÇA, não por dia: manda quando o conjunto de feeds
// mudos muda (entrou um novo, mudou o erro), manda quando volta ao ar, e no
// meio-tempo repete no máximo uma vez a cada 30 dias — para que um feed quebrado
// não desapareça de vista por um ano.
const AVISO_KEY = 'radar_feeds_aviso';
const LEMBRETE_MS = 30 * 24 * 60 * 60 * 1000;

// Assinatura estável do conjunto: nome + natureza da falha, em ordem. Muda o
// HTTP de um feed, muda a assinatura, e o professor é avisado de novo.
function assinaturaMudos(feeds) {
  return (Array.isArray(feeds) ? feeds : [])
    .map((f) => String((f && f.nome) || '?') + '|' + (f && f.ok ? '0itens' : 'http' + ((f && f.status) || '?')))
    .sort()
    .join(';');
}
async function lerAviso(key) {
  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/endodirect_global_state?id=eq.main&select=payload`, {
      headers: { apikey: key, Authorization: `Bearer ${key}`, Accept: 'application/json' }
    });
    if (!r.ok) return null;
    const rows = await r.json().catch(() => []);
    const payload = (rows && rows[0] && rows[0].payload) || {};
    return { payload, aviso: payload[AVISO_KEY] || null };
  } catch (e) { return null; }
}
async function gravarAviso(key, payload, aviso) {
  try {
    const novo = Object.assign({}, payload);
    if (aviso) novo[AVISO_KEY] = aviso; else delete novo[AVISO_KEY];
    await fetch(`${SUPABASE_URL}/rest/v1/endodirect_global_state?on_conflict=id`, {
      method: 'POST',
      headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json',
                 Prefer: 'resolution=merge-duplicates,return=minimal' },
      body: JSON.stringify({ id: 'main', payload: novo, updated_by: null, updated_at: new Date().toISOString() })
    });
  } catch (e) { /* fail-safe: não avisar é ruim, derrubar o cron é pior */ }
}
function dataBR(ms) {
  try { return new Date(ms).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' }); }
  catch (e) { return ''; }
}

// Fail-safe como todo o resto: nunca lança.
async function alertarFeedsMudos(feedsMudos) {
  try {
    const sig = assinaturaMudos(feedsMudos);
    const key = serviceKey();
    const st = key ? await lerAviso(key) : null;
    const anterior = (st && st.aviso) || null;
    const agora = Date.now();

    if (!sig) {
      if (!anterior) return { sent: false, reason: 'nada_mudo' };
      const r = await sendAlert('Feeds oficiais do radar voltaram ao ar', [
        'Os feeds que estavam sem entregar nada voltaram a responder nesta rodada.',
        'Estavam assim desde ' + dataBR(anterior.desde || anterior.em) + '.'
      ]);
      if (st) await gravarAviso(key, st.payload, null);
      return Object.assign({ reason: 'recuperado' }, r);
    }

    const mesmo = anterior && anterior.sig === sig;
    if (mesmo && agora - (anterior.em || 0) < LEMBRETE_MS) {
      return { sent: false, reason: 'ja_avisado' };
    }

    const desde = mesmo ? (anterior.desde || anterior.em || agora) : agora;
    const linhas = [
      'Os feeds abaixo são OFICIAIS e não entregaram nada nesta rodada. Enquanto isso durar, o que essa fonte publica só chega ao mural se um veículo confiável repercutir.',
      ...(Array.isArray(feedsMudos) ? feedsMudos : []).filter(Boolean).map((f) => '• ' + ((f.nome) || 'feed sem nome')
        + ' — ' + (f.ok ? 'respondeu, 0 itens' : 'falhou (HTTP ' + (f.status || '?') + (f.erro ? ', ' + f.erro : '') + ')')
        + (f.url ? ' — ' + f.url : ''))
    ];
    if (mesmo) linhas.push('Continua assim desde ' + dataBR(desde) + '.');
    linhas.push('Este aviso não se repete todo dia: volta se a situação mudar, quando os feeds voltarem, ou uma vez por mês enquanto durar.');

    const r = await sendAlert(mesmo ? 'Feed oficial do radar segue sem notícias' : 'Feed oficial do radar sem notícias', linhas);
    if (st) await gravarAviso(key, st.payload, { sig, em: agora, desde });
    return Object.assign({ reason: mesmo ? 'lembrete_mensal' : 'novo' }, r);
  } catch (e) {
    console.error('[alert] alertarFeedsMudos falhou:', (e && e.message) || e);
    return { sent: false, reason: 'error' };
  }
}

module.exports = { sendAlert, alertarFeedsMudos, assinaturaMudos, AVISO_KEY, LEMBRETE_MS };
