// Endodirect — E-MAIL AO ALUNO QUANDO UM APARELHO NOVO ENTRA NA CONTA (27/11/2026).
//
// Professor, da lista de sugestões: "Faz a 1, 5, 6 e 10" (a 10). Quem enfileira é o BANCO:
// `endodirect_aparelho_entrar` (supabase/aparelhos-cadastrados.sql) grava o alerta na hora do login
// e chama a rota /api/admin/refresh-radar (action 'alertas_aparelho') pelo pg_net. Assim o aviso
// não depende do navegador de quem entrou (um cliente adulterado não deixaria de avisar).
//
// Dois casos:
//   · 'novo': um aparelho nunca visto entrou numa conta que já tinha outro (o 1º não avisa);
//   · 'bloqueado': um 3º aparelho tentou entrar e foi barrado (as 2 vagas estavam ocupadas).
// Limites no banco: até 3 alertas por conta em 24 h; cada alerta é pego uma vez (skip locked) e,
// se o envio falhar, volta à fila até 3 tentativas.
//
// O e-mail diz só o tipo de aparelho e o horário (o que o banco já guarda do aparelho). Nada de IP
// ou local: o projeto não coleta isso.

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://auth.endodirect.com.br';

function serviceKey() { return process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_KEY || ''; }
function serviceHeaders(key) { return { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', Accept: 'application/json' }; }
function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }

// "Chrome no Windows", "Safari no iPhone", "app do Endodirect no iPhone"…
function descreveAparelho(ua) {
  const s = String(ua || '');
  let so = '';
  if (/iPad/.test(s)) so = 'iPad';
  else if (/iPhone|iPod/.test(s)) so = 'iPhone';
  else if (/Android/.test(s)) so = 'Android';
  else if (/CrOS/.test(s)) so = 'Chromebook';
  else if (/Windows/.test(s)) so = 'Windows';
  else if (/Macintosh|Mac OS X/.test(s)) so = 'Mac';
  else if (/Linux/.test(s)) so = 'Linux';
  // O app do iPhone é um WKWebView: tem AppleWebKit e "Mobile/", mas não "Safari/" nem o nome de outro navegador.
  if ((so === 'iPhone' || so === 'iPad') && /AppleWebKit/.test(s) && !/Safari\/|CriOS|FxiOS|EdgiOS|OPiOS/.test(s)) return 'app do Endodirect no ' + so;
  let nav = '';
  if (/Edg(e|A|iOS)?\//.test(s)) nav = 'Edge';
  else if (/OPR\/|OPiOS/.test(s)) nav = 'Opera';
  else if (/SamsungBrowser/.test(s)) nav = 'Samsung Internet';
  else if (/Firefox\/|FxiOS/.test(s)) nav = 'Firefox';
  else if (/Chrome\/|CriOS/.test(s)) nav = 'Chrome';
  else if (/Safari\//.test(s)) nav = 'Safari';
  if (nav && so) return nav + ' no ' + so;
  if (so) return 'navegador no ' + so;
  if (nav) return nav;
  return 'aparelho não identificado';
}

function quandoBR(iso) {
  const d = new Date(iso || Date.now());
  if (isNaN(d.getTime())) return '';
  const f = (o) => new Intl.DateTimeFormat('pt-BR', Object.assign({ timeZone: 'America/Sao_Paulo' }, o)).format(d);
  return f({ day: '2-digit', month: '2-digit', year: 'numeric' }) + ' às ' + f({ hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
}

function primeiroNome(nome) { const p = String(nome || '').trim().split(/\s+/)[0] || ''; return p.length > 1 && p.length <= 30 ? p : ''; }

// O e-mail (assunto, HTML e texto). Exportado para o teste.
function montarEmail(row) {
  const nome = primeiroNome(row && row.nome);
  const aparelho = descreveAparelho(row && row.ua);
  const quando = quandoBR(row && row.criado_em);
  const bloqueado = row && row.tipo === 'bloqueado';
  const subject = bloqueado ? 'Tentativa de entrar na sua conta Endodirect em outro aparelho' : 'Novo aparelho entrou na sua conta Endodirect';
  const abre = bloqueado
    ? 'Alguém tentou entrar na sua conta do Endodirect em um aparelho novo, e o acesso foi <b>barrado</b> porque a conta já está nos 2 aparelhos permitidos.'
    : 'Sua conta do Endodirect acabou de ser acessada em um <b>aparelho novo</b>.';
  const seFoi = bloqueado
    ? 'Se foi você e quer usar esse aparelho, entre por um dos aparelhos atuais e troque em <b>Perfil › Meus aparelhos</b>.'
    : 'Se foi você, não precisa fazer nada.';
  const seNao = 'Se <b>não</b> foi você, troque sua senha agora (na tela de entrada, em "Esqueci minha senha")'
    + (bloqueado ? '' : ' e remova o aparelho que você não reconhece em <b>Perfil › Meus aparelhos</b>') + '. Se precisar de ajuda, é só responder este e-mail.';
  const html = `<!doctype html><html lang="pt-BR"><body style="margin:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:24px 12px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:12px;border:1px solid #e5e7eb">
<tr><td style="padding:18px 24px;border-bottom:1px solid #e5e7eb;font-size:16px;font-weight:700;color:#0f172a">🔐 Endodirect · Segurança da conta</td></tr>
<tr><td style="padding:18px 24px;font-size:15px;line-height:1.6;color:#111827">
<p style="margin:0 0 12px">Olá${nome ? ', ' + esc(nome) : ''}.</p>
<p style="margin:0 0 12px">${abre}</p>
<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 14px;background:#f8fafc;border:1px solid #e5e7eb;border-radius:8px;width:100%"><tr><td style="padding:10px 14px;font-size:14px;color:#374151">
<b>Aparelho:</b> ${esc(aparelho)}<br><b>Quando:</b> ${esc(quando)} (horário de Brasília)</td></tr></table>
<p style="margin:0 0 12px">${seFoi}</p>
<p style="margin:0 0 4px">${seNao}</p>
<p style="margin:16px 0 0;font-size:12px;color:#9ca3af">Você recebe este aviso porque a conta do Endodirect é pessoal: cada aparelho novo é avisado ao dono da conta. — Equipe Endodirect</p>
</td></tr></table></td></tr></table></body></html>`;
  const tira = (t) => t.replace(/<[^>]+>/g, '');
  const text = [`Olá${nome ? ', ' + nome : ''}.`, '', tira(abre), '', 'Aparelho: ' + aparelho, 'Quando: ' + quando + ' (horário de Brasília)', '', tira(seFoi), '', tira(seNao), '', '— Equipe Endodirect'].join('\n');
  return { subject, html, text };
}

async function rpc(key, nome, corpo) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${nome}`, { method: 'POST', headers: serviceHeaders(key), body: JSON.stringify(corpo || {}) });
  if (!r.ok) throw new Error(nome + ' HTTP ' + r.status);
  return r.json().catch(() => null);
}

// Manda os alertas da fila. Fail-safe: nunca lança.
async function processarAlertasAparelho(opts) {
  opts = opts || {};
  const key = serviceKey();
  const RESEND = process.env.RESEND_API_KEY;
  if (!key) return { ok: false, motivo: 'sem chave de serviço' };
  if (!RESEND) return { ok: false, motivo: 'sem RESEND_API_KEY' }; // sem pegar nada: a fila fica para quando houver
  const enviar = opts.enviar || (async (msg) => {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST', headers: { Authorization: `Bearer ${RESEND}`, 'Content-Type': 'application/json' }, body: JSON.stringify(msg)
    });
    return { ok: r.ok, status: r.status };
  });
  let rows = [];
  try { rows = (await rpc(key, 'endodirect_alertas_aparelho_pegar', { p_max: 20 })) || []; }
  catch (e) { console.error('[aparelho-alerta] pegar falhou:', (e && e.message) || e); return { ok: false, motivo: 'pegar' }; }
  const from = process.env.SUPPORT_FROM || 'Endodirect Suporte <suporte@endodirect.com.br>';
  let enviados = 0, falhas = 0;
  for (const row of rows) {
    const email = String((row && row.email) || '').trim();
    let ok = false, resultado = '';
    if (!email || email.indexOf('@') < 1) { ok = true; resultado = 'sem e-mail'; }
    else {
      try {
        const m = montarEmail(row);
        const r = await enviar({ from, to: [email], subject: m.subject, html: m.html, text: m.text });
        ok = !!(r && r.ok); resultado = ok ? 'enviado' : ('Resend HTTP ' + (r && r.status));
      } catch (e) { ok = false; resultado = 'erro: ' + String((e && e.message) || e).slice(0, 120); }
    }
    if (ok && resultado === 'enviado') enviados++; else if (!ok) falhas++;
    try { await rpc(key, 'endodirect_alertas_aparelho_resultado', { p_id: row.id, p_ok: ok, p_resultado: resultado }); }
    catch (e) { console.error('[aparelho-alerta] resultado falhou:', (e && e.message) || e); }
  }
  return { ok: true, pegos: rows.length, enviados, falhas };
}

module.exports = { processarAlertasAparelho, montarEmail, descreveAparelho, quandoBR };
