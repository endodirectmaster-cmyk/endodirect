// Instagram "Questão do Dia" — aviso diário por e-mail (Resend), pegando carona
// no cron do radar (/api/cron/endocrine-radar). É um MÓDULO de lib/ (NÃO conta
// como função Vercel; o plano limita a 12 funções / 2 crons, ambos no teto).
//
// 🆕 16/11/2026: o story do dia vai SOZINHO ao Metricool (ver agendarStoryDoDia, abaixo). Sem a
// chave METRICOOL_USER_TOKEN na Vercel, nada muda. Histórico da rota anterior:
// Rota C — híbrido com aprovação: o sistema NÃO publica sozinho. O professor
// gera/edita a questão no painel (aba "Questão do Dia"), baixa a arte (render
// client-side, SVG→PNG no navegador) e posta o story às 18h BRT. Este módulo só
// MANDA O LEMBRETE do dia, com a legenda pronta para copiar.
//
// Calendário editorial (BRT): Seg/Qua/Sex = QUESTÃO; Ter/Qui/Sáb = GABARITO da
// anterior; Dom = 2 PROMOS das ferramentas. Idempotente por dia (grava
// ig_notice_sent em endodirect_global_state, igual à trava da newsletter).

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://auth.endodirect.com.br';

function serviceKey() {
  return process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_KEY || '';
}
function serviceHeaders(key) {
  return { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', Accept: 'application/json' };
}
function publicBase() {
  return (process.env.PUBLIC_BASE_URL || 'https://www.endodirect.com.br').replace(/\/+$/, '');
}
function esc(s) {
  return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// Dia da semana e data ISO em horário de Brasília (UTC-3), sem dependências.
function brtParts(d) {
  const t = (d ? d.getTime() : Date.now()) - 3 * 3600000;
  const b = new Date(t);
  return { dow: b.getUTCDay(), iso: b.toISOString().slice(0, 10), dayNum: Math.floor(t / 86400000) };
}

// Ferramentas da plataforma para os stories de domingo (promo). Rotação semanal.
const TOOLS = [
  { nome: 'Banco de Questões', cta: 'Milhares de questões comentadas de endocrinologia.' },
  { nome: 'Simulador de Casos', cta: 'Pratique raciocínio clínico em casos guiados por IA.' },
  { nome: 'Calculadoras', cta: 'Escores e fórmulas da endócrino na palma da mão.' },
  { nome: 'Flashcards', cta: 'Revisão espaçada com os dados que caem na prova.' },
  { nome: 'Mapas Mentais', cta: 'Veja a endocrinologia conectada, tema a tema.' },
  { nome: 'Diretrizes', cta: 'Resumos das diretrizes vigentes, sempre atualizados.' },
  { nome: 'Podcasts', cta: 'Estude de ouvido — episódios curtos de endócrino.' },
  { nome: 'Assistente de Prescrição', cta: 'Receituário, LME e mais, com poucos cliques.' },
  { nome: 'Chat com IA', cta: 'Tire dúvidas clínicas com a IA treinada em diretrizes.' },
  { nome: 'Cursos', cta: 'Aulas das subespecialidades com quem é referência.' }
];

const DOW_NAME = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];

// Plano editorial do dia a partir do dia da semana (BRT).
function igTodayPlan(d) {
  // Calendário (ajuste do usuário 2026-06-23): Seg–Sáb = QUESTÃO (a resposta fica
  // no app — não há mais "dia de gabarito"); Dom = 2 PROMOS das ferramentas.
  const { dow, dayNum } = brtParts(d);
  if (dow === 0) { // domingo → 2 promos
    const i = Math.floor(dayNum / 7) % TOOLS.length;
    const j = (i + 1) % TOOLS.length;
    return { kind: 'promo', dow, tools: [TOOLS[i], TOOLS[j]] };
  }
  return { kind: 'question', dow }; // segunda a sábado → questão
}

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

async function adminEmails(key) {
  if (!key) return [];
  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/endodirect_admins?select=email`, { headers: serviceHeaders(key) });
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
// Lembrete da Questão do Dia (arte + legenda p/ postar no Stories) vai SÓ para o
// Rodolpho (dono) — NÃO para os alunos e NÃO para os demais professores.
// Override por IG_NOTICE_TO (lista separada por vírgula).
function igNoticeRecipients() {
  const env = String(process.env.IG_NOTICE_TO || '')
    .split(',').map((e) => e.trim().toLowerCase()).filter((e) => e.indexOf('@') > 0);
  if (env.length) return env;
  return ['rodolphomend@gmail.com'];
}

// Legenda da QUESTÃO (mesma ideia da do painel; o gabarito vai no dia seguinte).
function questionCaption(it) {
  if (!it) return '';
  const op = it.options || {};
  const teem = it.teem ? esc(it.teem).trim() + ' ' : '';
  const lines = [];
  lines.push('🧠 QUESTÃO DO DIA — ' + (it.sub || 'Endocrinologia'));
  lines.push('');
  lines.push(teem + String(it.stem || '').trim());
  lines.push('');
  ['A', 'B', 'C', 'D'].forEach((L) => { if (op[L]) lines.push(L + ') ' + String(op[L]).trim()); });
  lines.push('');
  lines.push('👉 Responda no quiz acima!');
  lines.push('✅ A resposta COMENTADA está no app Endodirect — link na bio. 📲');
  lines.push('');
  lines.push('#endocrinologia #residenciamedica #provadetitulo #endodirect #medicina');
  return lines.join('\n');
}
function answerCaption(it) {
  if (!it) return '';
  const op = it.options || {};
  const L = it.answer || '';
  const lines = [];
  lines.push('🔑 GABARITO — ' + (it.sub || 'Endocrinologia'));
  lines.push('');
  lines.push('Resposta: ' + L + (op[L] ? ') ' + String(op[L]).trim() : ''));
  lines.push('');
  if (it.explanation) { lines.push(String(it.explanation).trim()); lines.push(''); }
  lines.push('Quer treinar com milhares de questões comentadas? Endodirect — link na bio. 📲');
  lines.push('#endocrinologia #residenciamedica #endodirect #medicina');
  return lines.join('\n');
}

// Item da fila a destacar no lembrete: o 1º ainda não postado na ORDEM da fila
// (o professor reordena no painel; topo = próxima a publicar). Sem sort por data.
function nextQueued(list) {
  const arr = (Array.isArray(list) ? list : []).filter((x) => x && x.status !== 'posted');
  return arr[0] || null;
}
// Para o gabarito, o item mais recente (a questão postada na véspera).
function lastForAnswer(list) {
  const arr = (Array.isArray(list) ? list : []).slice();
  arr.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  return arr[0] || null;
}

function emailHTML(plan, body, caption) {
  const panelUrl = publicBase() + '/#stories';
  const capBlock = caption
    ? `<p style="margin:18px 0 6px;font-size:13px;font-weight:700;color:#111827">Legenda pronta (copie e cole):</p>
       <pre style="white-space:pre-wrap;word-break:break-word;background:#0b1325;color:#e8edf6;border-radius:10px;padding:14px 16px;font-family:Menlo,Consolas,monospace;font-size:12.5px;line-height:1.5;margin:0">${esc(caption)}</pre>`
    : '';
  return `<!doctype html><html><body style="margin:0;background:#f3f4f6;font-family:Arial,Helvetica,sans-serif;padding:24px 12px">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#fff;border-radius:14px;overflow:hidden;border:1px solid #e5e7eb">
        <tr><td style="background:#0b1325;padding:20px 24px;color:#f5b32c;font-size:18px;font-weight:800">📲 Story do dia — Endodirect</td></tr>
        <tr><td style="padding:20px 24px">
          ${body}
          ${capBlock}
          <p style="margin:20px 0 0"><a href="${esc(panelUrl)}" style="display:inline-block;background:#f5b32c;color:#0b1325;text-decoration:none;font-weight:800;font-size:14px;padding:12px 22px;border-radius:10px">Abrir o painel → Questão do Dia</a></p>
          <p style="margin:16px 0 0;font-size:12px;color:#9ca3af">Painel → Questão do Dia: gere/edite, baixe a arte (PNG 1080×1920) e poste o story às 18h. Lembrete automático do cron diário.</p>
        </td></tr>
      </table></td></tr></table></body></html>`;
}

// Lembrete diário. Fail-safe: nunca lança (não derruba o cron do radar).
async function sendIgDailyNotice(now) {
  try {
    // Lembrete diário do Story (Questão do Dia) por e-mail ao dono: DESLIGADO por
    // pedido do Rodolpho ("não precisa mais ficar me lembrando", 2026-07-03).
    // Para religar, defina IG_DAILY_NOTICE=on no ambiente (Vercel).
    if (String(process.env.IG_DAILY_NOTICE || 'off').trim().toLowerCase() !== 'on') {
      return { sent: false, reason: 'disabled' };
    }
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) { console.error('[instagram] RESEND_API_KEY ausente; lembrete não enviado.'); return { sent: false, reason: 'no_resend_key' }; }
    const key = serviceKey();
    if (!key) return { sent: false, reason: 'no_service_key' };

    const payload = await loadPayload(key);
    const { iso } = brtParts(now);
    if (payload.ig_notice_sent === iso) return { sent: false, reason: 'already_sent' };

    const plan = igTodayPlan(now);
    const stories = Array.isArray(payload.ig_stories) ? payload.ig_stories : [];
    const dia = DOW_NAME[plan.dow];
    let subject = '';
    let body = '';
    let caption = '';

    if (plan.kind === 'question') {
      const it = nextQueued(stories);
      subject = `📲 ${dia}: poste a Questão do Dia`;
      if (it) {
        caption = questionCaption(it);
        body = `<p style="margin:0;font-size:15px;color:#111827">Hoje (<b>${dia}</b>) é dia de <b>Questão do Dia</b> — subespecialidade <b>${esc(it.sub || 'Endocrinologia')}</b>.</p>
                <p style="margin:10px 0 0;font-size:14px;color:#374151">Abra o painel, baixe a arte (slide da pergunta) e poste o story às <b>18h</b> com o sticker de quiz (4 alternativas). A <b>resposta comentada fica no app</b> — a legenda já chama o seguidor pra responder lá (funil).</p>`;
      } else {
        body = `<p style="margin:0;font-size:15px;color:#111827">Hoje (<b>${dia}</b>) é dia de <b>Questão do Dia</b>, mas <b>a fila está vazia</b>.</p>
                <p style="margin:10px 0 0;font-size:14px;color:#374151">Abra o painel → Questão do Dia, gere uma questão com a IA, revise e aprove. Depois baixe a arte e poste às 18h.</p>`;
      }
    } else if (plan.kind === 'answer') {
      const it = lastForAnswer(stories);
      subject = `🔑 ${dia}: poste o Gabarito`;
      if (it) caption = answerCaption(it);
      body = `<p style="margin:0;font-size:15px;color:#111827">Hoje (<b>${dia}</b>) é dia de <b>Gabarito</b> — poste a resposta da questão de ontem.</p>
              <p style="margin:10px 0 0;font-size:14px;color:#374151">No painel → Questão do Dia, baixe a arte do <b>gabarito</b> do item de ontem e poste às 18h.</p>`;
    } else { // promo (domingo)
      const t = plan.tools || [];
      subject = `📣 ${dia}: 2 stories de divulgação`;
      body = `<p style="margin:0;font-size:15px;color:#111827">Hoje (<b>${dia}</b>) é dia de <b>2 stories de divulgação</b> das ferramentas.</p>
              <p style="margin:10px 0 0;font-size:14px;color:#374151">Sugestões da semana: <b>${esc((t[0] && t[0].nome) || 'Banco de Questões')}</b> e <b>${esc((t[1] && t[1].nome) || 'Simulador de Casos')}</b>. No painel → Questão do Dia → Promos, baixe os fundos e poste às 18h.</p>`;
    }

    const from = process.env.NEWSLETTER_FROM || 'Endodirect <newsletter@endodirect.com.br>';
    const to = igNoticeRecipients(); // só Rodolpho (dono), nunca alunos/outros professores
    const html = emailHTML(plan, body, caption);
    const r = await fetch('https://api.resend.com/emails/batch', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(to.map((dest) => ({ from, to: [dest], subject: `Endodirect — ${subject}`, html })))
    });
    if (!r.ok) { const tx = await r.text().catch(() => ''); console.error('[instagram] Resend HTTP', r.status, tx.slice(0, 200)); return { sent: false, reason: 'resend_error' }; }

    // Trava de idempotência (read-modify-write fresco, como a newsletter).
    try {
      const fresh = await loadPayload(key);
      fresh.ig_notice_sent = iso;
      await savePayload(key, fresh);
    } catch (e) { console.error('[instagram] falha ao gravar ig_notice_sent:', (e && e.message) || e); }

    return { sent: true, kind: plan.kind, count: to.length };
  } catch (e) {
    console.error('[instagram] falha no lembrete diário:', (e && e.stack) || e);
    return { sent: false, reason: 'error' };
  }
}

// ── QUESTÃO DO DIA → BANCO DE QUESTÕES (13/11/2026) ────────────────────────────────────
// Professor: "à medida que elas forem ... postadas, serem incorporadas automaticamente no
// banco de questões". CÓPIA FIEL de qotdNoBanco do index.html (o botão "Postada" do painel
// usa aquela; o robô usa esta). scripts/test-qotd-no-banco.js roda as duas e exige saída
// idêntica — mudou uma, mude a outra.
function qotdNoBanco(s,provas,agora){
  if(!s||!s.id||!s.stem||!s.answer||!s.options||typeof s.options!=='object'||!Array.isArray(provas))return null;
  if(String(s.teem||'').trim())return null;
  var sid='qotd:'+s.id,stem=String(s.stem).trim(),existente=null,max=0;
  for(var i=0;i<provas.length;i++){
    var p=provas[i];if(!p)continue;
    if(p.sourceId===sid){existente=p;continue;}
    if(String(p.stem||'').trim()===stem)return null;
    var m=/^ENDODIRECT-(\d+)$/i.exec(String(p.code||''));if(m&&+m[1]>max)max=+m[1];
  }
  var quando=+s.postedAt||agora;
  var conteudo={stem:s.stem,options:JSON.parse(JSON.stringify(s.options)),answer:s.answer,explanation:s.explanation||'',
    area:s.sub||'',ano:new Date(quando-3*3600000).getUTCFullYear(),img:s.img||'',imgRef:s.img?(s.imgRef||''):'',
    expImg:s.expImg||'',expImgRef:s.expImg?(s.expImgRef||''):'',expImgTema:s.expImg?(s.expImgTema||''):'',expImgOrigem:s.expImg?(s.expImgOrigem||''):''};
  if(existente){
    var mudou=Object.keys(conteudo).some(function(k){return JSON.stringify(existente[k]===undefined?'':existente[k])!==JSON.stringify(conteudo[k]);});
    if(!mudou)return null;
    Object.keys(conteudo).forEach(function(k){existente[k]=conteudo[k];});
    if(!existente.img){delete existente.img;delete existente.imgRef;}
    if(!existente.expImg){delete existente.expImg;delete existente.expImgRef;delete existente.expImgTema;delete existente.expImgOrigem;}
    existente.qotdPostedAt=quando;
    return 'atualizado';
  }
  var it={id:'qotd-'+s.id,code:'ENDODIRECT-'+(max+1),stem:conteudo.stem,options:conteudo.options,answer:conteudo.answer,
    explanation:conteudo.explanation,area:conteudo.area,inst:'Endodirect',instituicao:'Endodirect',banca:'Endodirect',
    ano:conteudo.ano,type:'mc',active:true,free:false,origem:'Questão do Dia',sourceId:sid,qotdPostedAt:quando,
    importedAt:new Date(agora).toISOString()};
  if(conteudo.img){it.img=conteudo.img;if(conteudo.imgRef)it.imgRef=conteudo.imgRef;}
  if(conteudo.expImg){it.expImg=conteudo.expImg;['expImgRef','expImgTema','expImgOrigem'].forEach(function(k){if(conteudo[k])it[k]=conteudo[k];});}
  provas.push(it);
  return 'novo';
}

// Toda postada que ainda não está no Banco entra (a de hoje e qualquer uma que o botão
// "Postada" de uma aba antiga do painel, sem esta regra, tenha deixado de fora). Só ACRESCENTA:
// não reescreve a cópia que já existe (quem atualiza é o professor, ao repostar). Respeita a
// que o professor apagou do Banco (foraDoBanco).
function qotdPostadasNoBanco(payload, agora) {
  const stories = Array.isArray(payload.ig_stories) ? payload.ig_stories : [];
  if (!Array.isArray(payload.provas)) return 0; // sem o Banco em mãos, não mexe (nunca cria um Banco só com estas)
  const ja = new Set(payload.provas.map((p) => p && p.sourceId).filter(Boolean));
  const postadas = stories.filter((s) => s && s.status === 'posted' && s.id && !s.foraDoBanco && !ja.has('qotd:' + s.id))
    .sort((a, b) => (+a.postedAt || 0) - (+b.postedAt || 0));
  let n = 0;
  postadas.forEach((s) => { if (qotdNoBanco(s, payload.provas, agora) === 'novo') n++; });
  return n;
}

// 📲 STORY DO DIA NO METRICOOL (professor, 16/11/2026: "mandar a questão do dia ... diretamente para o
// Metricool, para ele postar diariamente nos stories"; escolheu o caminho automático, às 18h, sem sticker).
// O painel do professor desenha a arte de cada questão da fila e guarda no bucket público com {url,hash}
// (`storyArte`); aqui, depois de a questão do dia ir ao ar na plataforma, agendamos o story dela no
// Metricool para as 18h de Brasília. Regras:
//  - só com METRICOOL_USER_TOKEN na Vercel (o professor põe; nunca no código). IG_STORY_AUTO=off desliga;
//  - só a partir de IG_STORY_AUTO_DESDE (o story de 17/11 foi agendado à mão, como teste);
//  - só se a arte bater com o hash da questão (editou depois de gerar = arte velha = não agenda);
//  - 1 vez por dia: `ig_story_auto` (chave do servidor, preservada pelo painel) guarda o dia agendado.
//    Resposta que não chegou (tempo esgotado) fica "incerto" e NÃO repete — melhor perder um story do que
//    postar dois;
//  - nunca lança: o cron do radar e o healthcheck seguem mesmo se o Metricool cair.
// `igArteHash` é CÓPIA IDÊNTICA da função do index.html (o teste compara as duas).
const IG_STORY_AUTO_DESDE = '2026-11-18';
const IG_STORY_HORA = '18:00:00';
const IG_STORY_LIMITE_MIN = 17 * 60 + 40; // depois das 17h40 de Brasília não dá mais para as 18h
const METRICOOL_API = 'https://app.metricool.com/api';
function igArteHash(it){
  var V='1';it=it||{};var op=it.options||{};
  var s=['v'+V,it.teem||'',it.stem||'',op.A||'',op.B||'',op.C||'',op.D||'',it.img||''].join('\u0001');
  var h=0x811c9dc5;
  for(var i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,0x01000193)>>>0;}
  return ('0000000'+h.toString(16)).slice(-8);
}
function storyArteValida(it) {
  const a = it && it.storyArte;
  if (!a || !a.url || a.hash !== igArteHash(it)) return false;
  return /^https:\/\/[a-z0-9.-]+\/storage\/v1\/object\/public\/endodirect-assets\/stories\/[A-Za-z0-9_-]+\.jpg$/.test(String(a.url));
}
async function mcFetch(url, opts, ms) {
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), ms);
  try { return await fetch(url, Object.assign({}, opts, { signal: ac.signal })); } finally { clearTimeout(t); }
}
// Agenda no Metricool. Devolve { ok:true, postId } | { ok:'incerto' } | lança erro (não agendou).
async function metricoolAgendaStory(urlArte, iso) {
  const token = String(process.env.METRICOOL_USER_TOKEN || '').trim();
  const blogId = String(process.env.METRICOOL_BLOG_ID || '7486030').trim();
  const userId = String(process.env.METRICOOL_USER_ID || '5824452').trim();
  const q = `blogId=${encodeURIComponent(blogId)}&userId=${encodeURIComponent(userId)}`;
  const h = { 'X-Mc-Auth': token, Accept: 'application/json' };
  // A documentação do Metricool pede normalizar a URL da mídia antes de agendar. Se a normalização
  // falhar ou vier num formato inesperado, segue com o endereço público da arte.
  let midia = urlArte;
  try {
    const r = await mcFetch(`${METRICOOL_API}/actions/normalize/image/url?url=${encodeURIComponent(urlArte)}&${q}`, { headers: h }, 10000);
    if (r.ok) {
      const t = (await r.text()).trim();
      let v = t; try { v = JSON.parse(t); } catch (_) {}
      const u = typeof v === 'string' ? v : (v && (v.url || v.data || v.mediaUrl));
      if (typeof u === 'string' && /^https:\/\//.test(u.trim())) midia = u.trim();
    }
  } catch (_) {}
  const corpo = {
    publicationDate: { dateTime: `${iso}T${IG_STORY_HORA}`, timezone: 'America/Sao_Paulo' },
    text: '', firstCommentText: '', providers: [{ network: 'instagram' }], autoPublish: true, draft: false,
    media: [midia], mediaAltText: [], descendants: [], shortener: false, smartLinkData: { ids: [] }, hasNotReadNotes: false,
    instagramData: { type: 'STORY', isAiGenerated: false }
  };
  let r;
  try {
    r = await mcFetch(`${METRICOOL_API}/v2/scheduler/posts?${q}`, { method: 'POST', headers: Object.assign({}, h, { 'Content-Type': 'application/json' }), body: JSON.stringify(corpo) }, 20000);
  } catch (e) {
    if (e && e.name === 'AbortError') return { ok: 'incerto' }; // pode ter agendado: não repetir
    throw e;
  }
  const txt = await r.text();
  if (!r.ok) throw new Error(`Metricool ${r.status}: ${txt.slice(0, 200)}`);
  let j = null; try { j = JSON.parse(txt); } catch (_) {}
  const d = (j && (j.data || j)) || {};
  const semMidia = Array.isArray(d.media) && d.media.filter(Boolean).length === 0;
  return { ok: semMidia ? 'sem_midia' : true, postId: d.id || d.uuid || null };
}
// Agenda o story da questão publicada HOJE. Mexe só em payload.ig_story_auto; devolve { mudou } para o
// chamador gravar. Nunca lança.
async function agendarStoryDoDia(payload, now) {
  try {
    const quando = (now instanceof Date && !isNaN(now.getTime())) ? now : new Date();
    if (String(process.env.IG_STORY_AUTO || 'on').trim().toLowerCase() === 'off') return { agendado: false, motivo: 'desligado' };
    if (!String(process.env.METRICOOL_USER_TOKEN || '').trim()) return { agendado: false, motivo: 'sem_chave' };
    const { iso } = brtParts(quando);
    if (iso < IG_STORY_AUTO_DESDE) return { agendado: false, motivo: 'antes_do_inicio' };
    const st = payload.ig_story_auto;
    if (st && st.iso === iso && (st.ok === true || st.ok === 'incerto' || st.ok === 'sem_midia')) return { agendado: false, motivo: 'ja_agendado' };
    const minutos = Math.floor(((quando.getTime() - 3 * 3600000) % 86400000) / 60000);
    if (minutos > IG_STORY_LIMITE_MIN) return { agendado: false, motivo: 'tarde' };
    const stories = Array.isArray(payload.ig_stories) ? payload.ig_stories : [];
    const hoje = stories.filter((s) => s && s.status === 'posted' && s.postedAt && brtParts(new Date(+s.postedAt)).iso === iso)
      .sort((a, b) => (+b.postedAt || 0) - (+a.postedAt || 0))[0];
    if (!hoje) return { agendado: false, motivo: 'sem_questao_hoje' };
    const at = quando.getTime();
    if (!storyArteValida(hoje)) {
      payload.ig_story_auto = { iso, ok: false, motivo: 'sem_arte', itemId: hoje.id || null, at };
      return { agendado: false, motivo: 'sem_arte', mudou: true };
    }
    try {
      const r = await metricoolAgendaStory(hoje.storyArte.url, iso);
      payload.ig_story_auto = { iso, ok: r.ok, motivo: r.ok === true ? '' : r.ok, itemId: hoje.id || null, postId: r.postId || null, at };
      if (r.ok !== true) console.error('[instagram] story do dia: Metricool sem confirmação clara:', r.ok);
      return { agendado: r.ok === true, motivo: r.ok === true ? '' : r.ok, postId: r.postId || null, mudou: true };
    } catch (e) {
      console.error('[instagram] story do dia: Metricool recusou:', (e && e.message) || e);
      payload.ig_story_auto = { iso, ok: false, motivo: 'erro', erro: String((e && e.message) || e).slice(0, 200), itemId: hoje.id || null, at };
      return { agendado: false, motivo: 'erro', mudou: true };
    }
  } catch (e) {
    console.error('[instagram] story do dia falhou:', (e && e.stack) || e);
    return { agendado: false, motivo: 'erro' };
  }
}

// Publica automaticamente a Questão do Dia NA PLATAFORMA: promove o 1º item da
// FILA (ordem do painel; topo = próximo a publicar) para status 'posted' — mesmo
// efeito de o professor clicar "Postada". A partir daí o item aparece no modal/
// arquivo do aluno (qotdTodays/currentQotd usam a última postada). Roda 1x/dia no
// cron (healthcheck, 13:00 UTC = 10h BRT). Idempotente por dia (qotd_autopost_date,
// preservada no front como as demais chaves de servidor → o save do admin não a
// apaga, evitando postar 2 no mesmo dia). Fail-safe: nunca lança (não derruba o cron).
async function autoPostDailyQotd(now) {
  try {
    const key = serviceKey();
    if (!key) return { posted: false, reason: 'no_service_key' };
    const payload = await loadPayload(key);
    const { iso } = brtParts(now);
    // O carimbo vem do MESMO `now` que decide o dia (14/11/2026): com `Date.now()` aqui, a
    // postada recebia a hora real enquanto a trava olhava o `now` recebido. Em produção dá no
    // mesmo; no teste (dia fixo em 13/11) a regressão do CI passou a falhar assim que o
    // relógio real virou 14/11 em Brasília ("já postada hoje" não reconhecia a postada).
    const agora = (now instanceof Date && !isNaN(now.getTime())) ? now.getTime() : Date.now();
    const stories = Array.isArray(payload.ig_stories) ? payload.ig_stories : [];

    // ⚠️ A trava de 1x/dia é DERIVADA do próprio `ig_stories`, não de uma chave
    // separada. Motivo (bug de 2026-07-27, que fez o dia passar em branco): o
    // save do painel reescreve `ig_stories` a partir da cópia em memória do
    // navegador, mas `qotd_autopost_date` estava na lista de chaves PRESERVADAS
    // do servidor. Resultado: a promoção era desfeita e a trava sobrevivia — o
    // cron seguinte via "já postei hoje" e não repunha. Derivando a trava do
    // mesmo dado que ela protege, os dois nunca divergem: se o clobber desfizer
    // a postagem, a próxima execução reposta sozinha.
    const postadaHoje = stories.some((s) => s && s.status === 'posted' && s.postedAt
      && brtParts(new Date(s.postedAt)).iso === iso);
    // Postada que ficou de fora do Banco entra mesmo nos dias em que não há o que postar.
    const reconcilia = async (motivo, story) => {
      const n = qotdPostadasNoBanco(payload, agora);
      if (n || (story && story.mudou)) await savePayload(key, payload);
      const r = { posted: false, reason: motivo, banco: n };
      if (story) r.story = story;
      return r;
    };
    // Questão já no ar hoje (cron da manhã ou "✓ Postada" do professor): agenda o story se ainda não foi.
    if (postadaHoje) return await reconcilia('already_posted_today', await agendarStoryDoDia(payload, now));

    const idx = stories.findIndex((x) => x && x.status !== 'posted');
    if (idx < 0) return await reconcilia('queue_empty'); // fila vazia: o lembrete diário já avisa o dono
    stories[idx].status = 'posted';
    // Carimba SEMPRE (antes era só se ausente): é o carimbo que sustenta a
    // trava acima. Um item reaberto e repostado precisa da data de hoje.
    stories[idx].postedAt = agora;
    payload.ig_stories = stories;
    payload.qotd_autopost_date = iso; // informativo/observabilidade — NÃO é mais a trava
    // A postada de hoje entra no Banco de Questões no MESMO save (e qualquer outra que faltar).
    const banco = qotdPostadasNoBanco(payload, agora);
    await savePayload(key, payload);
    // Depois de a questão estar gravada no ar: o story dela no Metricool (às 18h). Grava só a marca do dia.
    const story = await agendarStoryDoDia(payload, now);
    if (story.mudou) { try { await savePayload(key, payload); } catch (e) { console.error('[instagram] marca do story não gravou:', (e && e.message) || e); } }
    return { posted: true, id: stories[idx].id || null, sub: stories[idx].sub || null, iso, banco, story };
  } catch (e) {
    console.error('[instagram] auto-post da Questão do Dia falhou:', (e && e.stack) || e);
    return { posted: false, reason: 'error' };
  }
}

module.exports = { sendIgDailyNotice, autoPostDailyQotd, igTodayPlan, questionCaption, answerCaption, TOOLS, qotdNoBanco, qotdPostadasNoBanco, igArteHash, storyArteValida, agendarStoryDoDia, IG_STORY_AUTO_DESDE };
