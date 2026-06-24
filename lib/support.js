// Formulário de suporte do app: envia a mensagem do aluno para o suporte por
// e-mail (Resend), com reply-to do próprio aluno (a equipe responde direto).
// Módulo de lib/ (NÃO conta como função serverless). Reaproveita o padrão do
// alert.js. NUNCA lança: retorna { sent, code, error } para o endpoint responder.

function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
function clean(s, max) { return String(s == null ? '' : s).replace(/\s+/g, ' ').trim().slice(0, max); }
function validEmail(e) { return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(String(e || '')); }

// Destino do suporte: env SUPPORT_TO (csv) → contato@endodirect.com.br.
function recipients() {
  const env = String(process.env.SUPPORT_TO || '')
    .split(',').map((e) => e.trim().toLowerCase()).filter((e) => e.indexOf('@') > 0);
  return env.length ? env : ['contato@endodirect.com.br'];
}

async function sendSupportEmail(data) {
  try {
    data = data || {};
    const name = clean(data.name, 120);
    const email = clean(data.email, 160);
    const category = clean(data.category, 60);
    const context = clean(data.context, 600);
    // mensagem preserva quebras de linha (até 5000 chars)
    const message = String(data.message == null ? '' : data.message).trim().slice(0, 5000);

    if (!validEmail(email)) return { sent: false, code: 400, error: 'Informe um e-mail válido para retorno.' };
    if (message.length < 5) return { sent: false, code: 400, error: 'Escreva sua mensagem (mínimo algumas palavras).' };

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) { console.error('[support] RESEND_API_KEY ausente; mensagem não enviada.'); return { sent: false, code: 500, error: 'Suporte por formulário indisponível agora. Escreva para contato@endodirect.com.br.' }; }

    // Remetente PRÓPRIO do suporte (antes caía no NEWSLETTER_FROM e chegava como
    // "newsletter" na caixa). Domínio endodirect.com.br já verificado no Resend →
    // qualquer endereço @endodirect.com.br envia. Override por SUPPORT_FROM.
    const from = process.env.SUPPORT_FROM || 'Endodirect Suporte <suporte@endodirect.com.br>';
    const to = recipients();
    const subject = `📨 Suporte${category ? ' [' + category + ']' : ''} — ${name || email}`;
    const msgHtml = esc(message).replace(/\n/g, '<br>');
    // Botão "responder ao aluno" à prova de falhas: 1 clique abre o compose já
    // endereçado ao e-mail do ALUNO (não depende do "Responder"/reply-to do cliente,
    // que às vezes manda a resposta de volta pra própria caixa do suporte).
    // E-mail LITERAL no destinatário do mailto: o Gmail NÃO percent-decodifica o
    // campo "Para" (com %40 no lugar do @, o destinatário saía em BRANCO). Só o
    // subject é percent-encoded. esc()+%22 mantêm o href seguro como atributo HTML.
    const replySubj = encodeURIComponent('Re: sua mensagem ao suporte Endodirect');
    const mailtoStudent = 'mailto:' + email + '?subject=' + replySubj;
    const mailtoHref = esc(mailtoStudent).replace(/"/g, '%22');
    const html = `<!doctype html><html><body style="margin:0;background:#f3f4f6;font-family:Arial,Helvetica,sans-serif;padding:24px 12px">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb">
          <tr><td style="background:#0b1325;padding:18px 24px;color:#fff;font-size:17px;font-weight:800">📨 Nova mensagem de suporte</td></tr>
          <tr><td style="padding:18px 24px">
            <p style="margin:0 0 6px;font-size:14px;color:#374151"><b>Nome:</b> ${esc(name) || '—'}</p>
            <p style="margin:0 0 6px;font-size:14px;color:#374151"><b>E-mail:</b> <a href="${mailtoStudent}" style="color:#0b5cad;font-weight:700;text-decoration:underline">${esc(email)}</a></p>
            ${category ? `<p style="margin:0 0 6px;font-size:14px;color:#374151"><b>Categoria:</b> ${esc(category)}</p>` : ''}
            ${context ? `<p style="margin:0 0 6px;font-size:12px;color:#9ca3af"><b>Contexto:</b> ${esc(context)}</p>` : ''}
            <hr style="border:none;border-top:1px solid #e5e7eb;margin:12px 0">
            <p style="margin:0;font-size:15px;color:#111827;line-height:1.6">${msgHtml}</p>
            <p style="margin:18px 0 0"><a href="${mailtoStudent}" style="display:inline-block;background:#0b1325;color:#fff;text-decoration:none;font-weight:800;font-size:14px;padding:11px 20px;border-radius:9px">↩️ Responder ao aluno</a></p>
            <p style="margin:12px 0 0;font-size:12px;color:#9ca3af">Clique em <b>Responder ao aluno</b> para escrever direto para ${esc(email)}. (O “Responder” normal do e-mail também aponta para o aluno via reply-to.)</p>
          </td></tr>
        </table></td></tr></table></body></html>`;

    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to, subject, html, reply_to: email })
    });
    if (!r.ok) { const t = await r.text().catch(() => ''); console.error('[support] Resend HTTP', r.status, t.slice(0, 200)); return { sent: false, code: 502, error: 'Não consegui enviar agora. Tente de novo ou escreva para contato@endodirect.com.br.' }; }
    return { sent: true };
  } catch (e) {
    console.error('[support] falha:', (e && e.message) || e);
    return { sent: false, code: 500, error: 'Falha ao enviar. Tente novamente em instantes.' };
  }
}

// ---------- Persistência dos tickets (tabela endodirect_support; RLS travada → só service_role) ----------
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://auth.endodirect.com.br';
function serviceKey() {
  return process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_KEY || '';
}
function serviceHeaders(key) {
  return { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', Accept: 'application/json' };
}

// Salva o ticket recebido do formulário. Best-effort: se a tabela/chave faltar,
// NÃO derruba o envio do e-mail de notificação. Retorna { stored, id }.
async function storeSupportTicket(data) {
  try {
    data = data || {};
    const email = clean(data.email, 160);
    const message = String(data.message == null ? '' : data.message).trim().slice(0, 5000);
    if (!validEmail(email) || message.length < 5) return { stored: false };
    const key = serviceKey();
    if (!key) { console.error('[support] service key ausente; ticket não salvo.'); return { stored: false }; }
    const row = {
      name: clean(data.name, 120) || null,
      email,
      category: clean(data.category, 60) || null,
      context: clean(data.context, 600) || null,
      message,
      status: 'new'
    };
    const r = await fetch(`${SUPABASE_URL}/rest/v1/endodirect_support`, {
      method: 'POST',
      headers: { ...serviceHeaders(key), Prefer: 'return=representation' },
      body: JSON.stringify(row)
    });
    if (!r.ok) { const t = await r.text().catch(() => ''); console.error('[support] insert HTTP', r.status, t.slice(0, 200)); return { stored: false }; }
    const rows = await r.json().catch(() => []);
    return { stored: true, id: (rows && rows[0] && rows[0].id) || null };
  } catch (e) {
    console.error('[support] storeSupportTicket falha:', (e && e.message) || e);
    return { stored: false };
  }
}

// Lista os tickets (mais novos primeiro). Só chamado pelo servidor APÓS checar admin.
async function listSupportTickets() {
  try {
    const key = serviceKey();
    if (!key) return [];
    const r = await fetch(`${SUPABASE_URL}/rest/v1/endodirect_support?select=*&order=created_at.desc&limit=500`, { headers: serviceHeaders(key) });
    if (!r.ok) { console.error('[support] list HTTP', r.status); return []; }
    const rows = await r.json().catch(() => []);
    return Array.isArray(rows) ? rows : [];
  } catch (e) {
    console.error('[support] listSupportTickets falha:', (e && e.message) || e);
    return [];
  }
}

// Responde um ticket: envia o e-mail ao aluno (de suporte@) e marca o ticket como
// respondido. Só chamado pelo servidor APÓS checar admin. Retorna { ok, ticket } ou
// { ok:false, code, error }.
async function replySupportTicket(opts) {
  try {
    opts = opts || {};
    const id = String(opts.id || '').trim();
    const reply = String(opts.reply == null ? '' : opts.reply).trim().slice(0, 5000);
    const adminEmail = clean(opts.adminEmail, 160);
    if (!id) return { ok: false, code: 400, error: 'Ticket inválido.' };
    if (reply.length < 2) return { ok: false, code: 400, error: 'Escreva a resposta.' };
    const key = serviceKey();
    if (!key) return { ok: false, code: 500, error: 'Suporte indisponível (config do servidor).' };

    // Carrega o ticket (precisamos do e-mail/mensagem do aluno).
    const gr = await fetch(`${SUPABASE_URL}/rest/v1/endodirect_support?id=eq.${encodeURIComponent(id)}&select=*`, { headers: serviceHeaders(key) });
    if (!gr.ok) return { ok: false, code: 502, error: 'Não consegui carregar o ticket.' };
    const found = await gr.json().catch(() => []);
    const ticket = found && found[0];
    if (!ticket) return { ok: false, code: 404, error: 'Ticket não encontrado.' };
    if (!validEmail(ticket.email)) return { ok: false, code: 400, error: 'E-mail do aluno inválido.' };

    // Envia a resposta por e-mail ao aluno.
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) return { ok: false, code: 500, error: 'Envio de e-mail indisponível (RESEND_API_KEY).' };
    const from = process.env.SUPPORT_FROM || 'Endodirect Suporte <suporte@endodirect.com.br>';
    const replyToInbox = recipients()[0]; // resposta do aluno volta pra caixa monitorada
    const subject = `Re: sua mensagem ao suporte Endodirect${ticket.category ? ' [' + ticket.category + ']' : ''}`;
    const replyHtml = esc(reply).replace(/\n/g, '<br>');
    const origHtml = esc(String(ticket.message || '')).replace(/\n/g, '<br>');
    const firstName = ticket.name ? esc(String(ticket.name).trim().split(/\s+/)[0]) : '';
    const html = `<!doctype html><html><body style="margin:0;background:#f3f4f6;font-family:Arial,Helvetica,sans-serif;padding:24px 12px">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb">
          <tr><td style="background:#0b1325;padding:18px 24px;color:#fff;font-size:17px;font-weight:800">Resposta do suporte Endodirect</td></tr>
          <tr><td style="padding:18px 24px">
            <p style="margin:0 0 10px;font-size:14px;color:#374151">Olá${firstName ? ' ' + firstName : ''},</p>
            <p style="margin:0 0 16px;font-size:15px;color:#111827;line-height:1.6">${replyHtml}</p>
            <hr style="border:none;border-top:1px solid #e5e7eb;margin:14px 0">
            <p style="margin:0 0 4px;font-size:12px;color:#9ca3af">Sua mensagem original:</p>
            <p style="margin:0;font-size:13px;color:#6b7280;line-height:1.5">${origHtml}</p>
            <p style="margin:16px 0 0;font-size:12px;color:#9ca3af">Pode responder este e-mail se precisar de mais ajuda. — Equipe Endodirect</p>
          </td></tr>
        </table></td></tr></table></body></html>`;
    const er = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to: [ticket.email], subject, html, reply_to: replyToInbox })
    });
    if (!er.ok) { const t = await er.text().catch(() => ''); console.error('[support] reply Resend HTTP', er.status, t.slice(0, 200)); return { ok: false, code: 502, error: 'Não consegui enviar a resposta agora.' }; }

    // Marca o ticket como respondido (best-effort: e-mail já foi; se o PATCH falhar,
    // devolvemos o ticket com os campos atualizados localmente).
    const patch = { status: 'answered', reply, answered_at: new Date().toISOString(), answered_by: adminEmail || null };
    const pr = await fetch(`${SUPABASE_URL}/rest/v1/endodirect_support?id=eq.${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: { ...serviceHeaders(key), Prefer: 'return=representation' },
      body: JSON.stringify(patch)
    });
    let updated = Object.assign({}, ticket, patch);
    if (pr.ok) { const prows = await pr.json().catch(() => []); if (prows && prows[0]) updated = prows[0]; }
    else console.error('[support] patch HTTP', pr.status);
    return { ok: true, ticket: updated };
  } catch (e) {
    console.error('[support] replySupportTicket falha:', (e && e.message) || e);
    return { ok: false, code: 500, error: 'Falha ao responder. Tente novamente.' };
  }
}

module.exports = { sendSupportEmail, storeSupportTicket, listSupportTickets, replySupportTicket };
