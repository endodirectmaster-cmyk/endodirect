// Atualiza o radar do mural sob demanda, acionado pelo PROFESSOR no painel.
//
// ⚠️ TAMBEM SERVE A PREVIA DA NEWSLETTER (action: 'newsletter-teste'), que antes
// era api/newsletter/test.js. A Vercel so aceita 12 funcoes serverless e cada
// arquivo em api/ e uma funcao; o projeto estava no teto. Aquele endpoint estava
// SEM GATILHO NA UI desde 15/06/2026 (o botao foi removido a pedido do
// professor) e so era chamado a mao, entao juntar aqui nao tira nada de ninguem
// — e a autenticacao e a mesma: token de admin ou CRON_SECRET.
// Autenticacao: o front envia Authorization: Bearer <access_token da sessao
// Supabase do admin>. Validamos o token, conferimos que o e-mail esta em
// endodirect_admins e so entao rodamos o radar (lib/radar.js).
const { runRadar } = require('../../lib/radar');
const { sendTestNewsletter } = require('../../lib/newsletter');
const { gerarDiscussao } = require('../../lib/discussao');
const { selecionar } = require('../../lib/discussao-auto');
const { dispararCadeia } = require('../../lib/discussao-kick');
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

  // Previa da newsletter para UM endereco (nao mexe na trava do dia nem na base).
  if (payload && payload.action === 'newsletter-teste') {
    const to = String(payload.to || '').trim().toLowerCase();
    if (!to || to.indexOf('@') < 1) return json(res, 400, { ok: false, error: 'Informe "to" com um e-mail valido.' });
    try {
      const result = await sendTestNewsletter(to);
      return json(res, result && result.sent ? 200 : 500, { ok: !!(result && result.sent), result });
    } catch (error) {
      console.error('[refresh-radar:newsletter-teste] erro:', (error && error.stack) || error);
      return json(res, 500, { ok: false, error: (error && error.message) || 'Falha ao enviar a previa.' });
    }
  }

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
  // { action: 'discussao_cadeia' } → uma invocação, uma discussão.
  //
  // ⚠️ UMA INVOCAÇÃO POR ARTIGO É O ÚNICO JEITO DE SER AUTOMÁTICO. Uma discussão
  // leva ~40s; encadear N delas numa função só é impossível por construção — foi
  // a falha de 29/07, em que a etapa pendurada no fim do cron nunca era alcançada
  // e sumia sem erro nenhum.
  //
  // ⚠️ E É LEQUE, NÃO CORRENTE — aprendido medindo, no mesmo dia. A primeira
  // versão fazia cada invocação disparar a seguinte: com um lote de 6, três
  // discussões saíram e o 4º elo simplesmente nunca foi invocado (sem erro, sem
  // 5xx, sem requisição nos logs). Corrente de N saltos tem N pontos de falha e
  // qualquer um deles engole o resto da fila em silêncio. Agora QUEM RECEBE A
  // PARTIDA dispara todos os outros de uma vez e depois gera o seu: um único
  // ponto de falha, e o que não subir volta na próxima partida.
  if (payload && payload.action === 'discussao_cadeia') {
    try {
      // Com `sourceId` no corpo, esta invocação é uma folha do leque: gera o que
      // mandaram e não dispara nada.
      const folha = String(payload.sourceId || '').trim();
      let alvo = folha;
      let disparados = 0;
      if (!folha) {
        const ids = (await filaDeDiscussoes()).slice(0, LOTE_CADEIA).map((f) => f.sourceId);
        if (!ids.length) return json(res, 200, { ok: true, fim: true, geradas: 0 });
        alvo = ids[0];
        // Em paralelo: são só requisições de abertura, com abort próprio. Sai
        // ANTES da geração — a geração de ~40s não pode ser pré-requisito de
        // ninguém subir.
        const resto = ids.slice(1);
        if (resto.length) await Promise.all(resto.map((id) => dispararCadeia({ sourceId: id })));
        disparados = resto.length;
      }
      // Outra partida pode ter gerado este mesmo artigo. Conferir custa uma
      // consulta; regerar custa uma chamada de IA.
      if (await jaTemDiscussao(alvo)) return json(res, 200, { ok: true, sourceId: alvo, gerou: false, pulado: 'ja_existe', disparados });
      const out = await gerarDiscussaoDoMural(alvo);
      return json(res, 200, { ok: true, sourceId: alvo, gerou: !!out.ok, erro: out.ok ? null : out.error, disparados });
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

// Quantos artigos uma partida põe na cadeia. Como cada elo dispara o seguinte
// ANTES de gerar, os do lote sobem quase juntos — daí o teto: 6 gerações
// simultâneas cabem no plano e nos limites de taxa da IA. O que ficar de fora
// sai na próxima partida (carga de página, cron ou abertura do Mural).
const LOTE_CADEIA = 6;

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

// Este artigo já tem discussão gravada? Consulta de uma linha, uma coluna.
async function jaTemDiscussao(sourceId) {
  try {
    const url = `${SUPABASE_URL}/rest/v1/endodirect_mural_discussoes?source_id=eq.${encodeURIComponent(sourceId)}&select=source_id&limit=1`;
    const r = await fetch(url, { headers: { apikey: SERVICE_ROLE, Authorization: 'Bearer ' + SERVICE_ROLE, Accept: 'application/json' } });
    if (!r.ok) return false;
    const rows = await r.json().catch(() => []);
    return Array.isArray(rows) && rows.length > 0;
  } catch (e) { return false; }
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

// ⚠️ Quem manda no tempo desta função é o `functions` do vercel.json (120s), NÃO
// esta linha: `module.exports.config` é convenção de Next.js e o runtime Node
// puro a ignora. Foi acreditando neste 300 que eu calculei um orçamento de tempo
// que não existia, em 29/07, e a geração automática morria antes de acontecer.
module.exports.config = { maxDuration: 120 };
