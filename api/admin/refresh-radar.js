// Atualiza o radar do mural sob demanda, acionado pelo PROFESSOR no painel.
// Autenticacao: o front envia Authorization: Bearer <access_token da sessao
// Supabase do admin>. Validamos o token, conferimos que o e-mail esta em
// endodirect_admins e so entao rodamos o radar (lib/radar.js).
const { runRadar } = require('../../lib/radar');
const { gerarDiscussao } = require('../../lib/discussao');
const { selecionar } = require('../../lib/discussao-auto');
const { pmcIdFromLink } = require('../../lib/fulltext');
const push = require('../../lib/push');

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://auth.endodirect.com.br';
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_KEY;

function json(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(body));
}

function readRawBody(req) {
  return new Promise((resolve) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', () => resolve(Buffer.from('')));
  });
}

async function userFromToken(token) {
  const r = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: { apikey: SERVICE_ROLE, Authorization: 'Bearer ' + token }
  });
  if (!r.ok) return null;
  return r.json().catch(() => null);
}

async function isAdminEmail(email) {
  const url = `${SUPABASE_URL}/rest/v1/endodirect_admins?email=eq.${encodeURIComponent(email)}&select=email`;
  const r = await fetch(url, { headers: { apikey: SERVICE_ROLE, Authorization: 'Bearer ' + SERVICE_ROLE, Accept: 'application/json' } });
  if (!r.ok) return false;
  const rows = await r.json().catch(() => []);
  return Array.isArray(rows) && rows.length > 0;
}

module.exports = async function handler(req, res) {
  if (req.method === 'GET') {
    return json(res, 200, { ok: true, service: 'endodirect-refresh-radar', ready: !!SERVICE_ROLE, pushReady: push.isConfigured() });
  }
  if (req.method !== 'POST') { res.setHeader('Allow', 'GET, POST'); return json(res, 405, { ok: false, error: 'Metodo nao permitido.' }); }
  if (!SERVICE_ROLE) return json(res, 500, { ok: false, error: 'Chave de servico do Supabase ausente no servidor.' });

  const auth = req.headers.authorization || '';
  const token = auth.indexOf('Bearer ') === 0 ? auth.slice(7).trim() : '';
  if (!token) return json(res, 401, { ok: false, error: 'Sessao ausente.' });

  // Identidade SERVIDOR-A-SERVIDOR: o proprio backend chama este endpoint para
  // gerar as discussoes em cadeia (uma invocacao por artigo). Usa o CRON_SECRET,
  // o mesmo segredo dos crons — nunca chega ao navegador.
  const doServidor = !!process.env.CRON_SECRET && token === process.env.CRON_SECRET;
  if (!doServidor) {
    const user = await userFromToken(token);
    const email = user && String(user.email || '').toLowerCase();
    if (!email) return json(res, 401, { ok: false, error: 'Sessao invalida.' });
    if (!(await isAdminEmail(email))) return json(res, 403, { ok: false, error: 'Apenas administradores podem usar este recurso.' });
  }

  // Corpo opcional. { action: 'push', title, body, url } → dispara a notificação
  // no celular dos alunos inscritos (avisos/breaking news). Sem action → radar.
  let payload = {};
  try { payload = JSON.parse((await readRawBody(req)).toString('utf8') || '{}'); } catch (e) { payload = {}; }

  if (payload && payload.action === 'push') {
    const title = String(payload.title || '').trim();
    if (!title) return json(res, 400, { ok: false, error: 'Titulo do aviso ausente.' });
    if (!push.isConfigured()) return json(res, 503, { ok: false, error: 'Notificacoes nao configuradas no servidor (VAPID_PRIVATE_KEY ausente).' });
    try {
      const result = await push.sendToAll({
        title: title.slice(0, 120),
        body: String(payload.body || '').slice(0, 300),
        url: String(payload.url || 'https://www.endodirect.com.br/').slice(0, 400),
        tag: 'endodirect-aviso'
      });
      return json(res, 200, { ok: true, push: result });
    } catch (error) {
      console.error('[refresh-radar:push] erro:', (error && error.stack) || error);
      return json(res, 500, { ok: false, error: (error && error.message) || 'Falha ao enviar as notificacoes.' });
    }
  }

  // { action: 'discussao', sourceId } → gera a DISCUSSÃO COMPLETA do artigo a
  // partir do texto integral (PMC) e grava em radar_avisos[i].discussao.
  //
  // ⚠️ Está aqui dentro, e não num arquivo próprio em api/, porque o projeto
  // está em 12/12 funções serverless — o teto do plano da Vercel, que o
  // scripts/ci-validate.js barra. Criar api/admin/discussao.js quebraria o build.
  // { action: 'discussao_fila' } → só a LISTA de quem falta, sem gerar nada.
  // É barata (lê o estado e a tabela) e cabe folgado no teto de execução; quem
  // gera é o cliente, chamando `discussao` uma vez por artigo.
  if (payload && payload.action === 'discussao_fila') {
    try {
      const fila = await filaDeDiscussoes();
      return json(res, 200, { ok: true, fila });
    } catch (error) {
      console.error('[refresh-radar:fila] erro:', (error && error.stack) || error);
      return json(res, 500, { ok: false, error: (error && error.message) || 'Falha ao ler a fila.' });
    }
  }
  // { action: 'discussao_cadeia' } → gera UMA discussao pendente e, ao terminar,
  // dispara a PROXIMA invocacao para o proximo artigo.
  //
  // ⚠️ ESTE E O UNICO JEITO DE SER AUTOMATICO DENTRO DO TETO DE 60s. Uma
  // discussao leva ~40s; encadear N delas numa funcao so e impossivel por
  // construcao — foi a falha de 29/07, em que a etapa no fim do cron nunca era
  // alcancada e sumia sem erro. Aqui cada artigo tem a SUA invocacao, com os
  // seus proprios 60s, e a cadeia anda sozinha ate a fila esvaziar.
  if (payload && payload.action === 'discussao_cadeia') {
    try {
      const fila = await filaDeDiscussoes();
      if (!fila.length) return json(res, 200, { ok: true, fim: true, geradas: 0 });
      const alvo = fila[0];
      const out = await gerarDiscussaoDoMural(alvo.sourceId);
      // Dispara a proxima ANTES de responder: depois do res.end() a Vercel pode
      // congelar a funcao e a requisicao nem sair. Nao esperamos a resposta —
      // so que a conexao seja aberta; a invocacao seguinte roda por conta dela.
      if (fila.length > 1) await dispararProxima();
      return json(res, 200, { ok: true, sourceId: alvo.sourceId, gerou: !!out.ok, erro: out.ok ? null : out.error, restam: fila.length - 1 });
    } catch (error) {
      console.error('[refresh-radar:cadeia] erro:', (error && error.stack) || error);
      return json(res, 500, { ok: false, error: (error && error.message) || 'Falha na cadeia.' });
    }
  }
  if (payload && payload.action === 'discussao') {
    const sourceId = String(payload.sourceId || '').trim();
    if (!sourceId) return json(res, 400, { ok: false, error: 'sourceId ausente.' });
    try {
      const out = await gerarDiscussaoDoMural(sourceId);
      return json(res, out.ok ? 200 : 422, out);
    } catch (error) {
      console.error('[refresh-radar:discussao] erro:', (error && error.stack) || error);
      return json(res, 500, { ok: false, error: (error && error.message) || 'Falha ao gerar a discussao.' });
    }
  }

  try {
    const result = await runRadar();
    // ⚠️ A geracao de discussao NAO fica pendurada aqui, e isso foi aprendido
    // caro (2026-07-29): uma discussao leva ~40s e o teto de execucao do plano
    // e de 60s. Radar + newsletter + podcasts + e-mails de degustacao consomem
    // o tempo antes, e a etapa no fim simplesmente NAO ERA ALCANCADA — sem erro,
    // sem log, sem discussao. O professor clicou duas vezes e nada saiu.
    //
    // O caminho certo e UMA INVOCACAO POR DISCUSSAO: o cliente pede a fila aqui
    // (barato) e depois chama `action:'discussao'` um artigo de cada vez, cada
    // chamada com seus proprios 60s. Ver o botao "Gerar discussoes pendentes".
    return json(res, 200, { ok: true, ...result });
  } catch (error) {
    console.error('[refresh-radar] erro:', (error && error.stack) || error);
    return json(res, 500, { ok: false, error: (error && error.message) || 'Falha ao atualizar o radar.' });
  }
};

// Dispara a proxima invocacao da cadeia. NAO espera a resposta: aborta em 2s,
// tempo de sobra para a requisicao sair. O que importa e a invocacao do outro
// lado ter comecado — ela roda ate o fim por conta propria.
async function dispararProxima() {
  const base = process.env.PUBLIC_BASE_URL || 'https://www.endodirect.com.br';
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 2000);
  try {
    await fetch(`${base}/api/admin/refresh-radar`, {
      method: 'POST', signal: ctrl.signal,
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + process.env.CRON_SECRET },
      body: JSON.stringify({ action: 'discussao_cadeia' })
    });
  } catch (e) { /* abort esperado: a requisicao ja saiu */ }
  finally { clearTimeout(t); }
}

// Fila de discussões pendentes: qualifica, ainda não tem, mais novos primeiro.
// Sem IA e sem rede externa além do Supabase — responde em menos de um segundo.
async function filaDeDiscussoes() {
  const base = { apikey: SERVICE_ROLE, Authorization: 'Bearer ' + SERVICE_ROLE };
  const r = await fetch(`${SUPABASE_URL}/rest/v1/endodirect_global_state?id=eq.main&select=payload`, { headers: base });
  if (!r.ok) throw new Error('Nao consegui ler o estado global.');
  const rows = await r.json().catch(() => []);
  const avisos = ((rows && rows[0] && rows[0].payload) || {}).radar_avisos || [];
  const d = await fetch(`${SUPABASE_URL}/rest/v1/endodirect_mural_discussoes?select=source_id`, { headers: base });
  const jaTem = new Set(((await d.json().catch(() => [])) || []).map((x) => x && x.source_id).filter(Boolean));
  return selecionar(avisos, jaTem, 200).map((a) => ({ sourceId: a.sourceId, titulo: a.titulo || '', tipo: a.tipo || '' }));
}

// Lê o item do mural, gera a discussão e grava em endodirect_mural_discussoes.
//
// ⚠️ NÃO grava dentro de payload.radar_avisos, por dois motivos independentes:
//  1. ENTREGA — as RPCs mandam ao aluno os 200 artigos mais recentes. A ~12 KB
//     por discussão, 200 delas somariam ~2,3 MB a um payload já em ~4,6 MB, e o
//     limite empírico deste projeto (~5,3 MB) é o ponto em que a resposta DEIXA
//     de chegar e a tela fica vazia.
//  2. CLOBBER — reescrever o payload aqui atropelaria a aba aberta do professor,
//     como documentado em cofre/Dados e Supabase.
async function gerarDiscussaoDoMural(sourceId) {
  const base = { apikey: SERVICE_ROLE, Authorization: 'Bearer ' + SERVICE_ROLE };
  const r = await fetch(`${SUPABASE_URL}/rest/v1/endodirect_global_state?id=eq.main&select=payload`, { headers: base });
  if (!r.ok) return { ok: false, error: 'Nao consegui ler o estado global.' };
  const rows = await r.json().catch(() => []);
  const pay = (rows && rows[0] && rows[0].payload) || {};
  const lista = Array.isArray(pay.radar_avisos) ? pay.radar_avisos : [];
  const idx = lista.findIndex((a) => a && a.sourceId === sourceId);
  if (idx < 0) return { ok: false, error: 'Artigo nao encontrado no mural.' };

  const item = lista[idx];
  if (!pmcIdFromLink(item.link)) {
    return { ok: false, error: 'Este artigo nao tem texto integral aberto (PMC). Sem ele, uma discussao completa seria inventada a partir do resumo.' };
  }

  const out = await gerarDiscussao(process.env.ANTHROPIC_API_KEY, item);
  if (!out.ok) {
    const motivos = {
      sem_chave_ia: 'Chave da IA ausente no servidor.',
      sem_texto_integral: 'O PMC nao devolveu o texto integral deste artigo (pode ser so o resumo depositado).',
      resposta_curta: 'A IA devolveu texto curto demais para ser uma discussao.',
      erro_rede: 'Falha de rede ao falar com a IA.'
    };
    return { ok: false, error: motivos[out.motivo] || ('Falha: ' + out.motivo) };
  }

  const up = await fetch(`${SUPABASE_URL}/rest/v1/endodirect_mural_discussoes?on_conflict=source_id`, {
    method: 'POST',
    headers: Object.assign({}, base, { 'Content-Type': 'application/json', Prefer: 'resolution=merge-duplicates,return=minimal' }),
    body: JSON.stringify({ source_id: sourceId, markdown: out.markdown, meta: out.meta, updated_at: new Date().toISOString() })
  });
  if (!up.ok) {
    const det = await up.text().catch(() => '');
    console.error('[refresh-radar:discussao] gravacao falhou:', up.status, det.slice(0, 300));
    return { ok: false, error: 'Discussao gerada, mas falhou ao gravar.' };
  }
  return { ok: true, meta: out.meta, chars: out.markdown.length };
}

module.exports.config = { maxDuration: 300 };
