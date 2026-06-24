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

module.exports = { sendSupportEmail };
