const DEFAULT_MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6';
// Modelos que o cliente pode solicitar por requisição (evita abuso/custo).
// Recursos clínicos (prescrição/simulador) pedem Opus; o resto fica no default.
const ALLOWED_MODELS = { 'claude-sonnet-4-6': 1, 'claude-opus-4-8': 1, 'claude-haiku-4-5': 1 };
// Grounding opcional por PubMed (módulo — não conta como função serverless).
const { pubmedGround, formatSources } = require('../lib/pubmed');
// Busca server-side de um link p/ resumo (módulo lib/ — não conta como função).
const { fetchArticleText } = require('../lib/fetch-article');
function pickModel(requested) {
  const m = String(requested || '');
  return ALLOWED_MODELS[m] ? m : DEFAULT_MODEL;
}

function json(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(body));
}

function parseBody(req) {
  if (!req.body) return {};
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }
  return req.body;
}

function clampTokens(value) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) return 1500;
  return Math.max(200, Math.min(parsed, 4000));
}

function extractText(payload) {
  const item = Array.isArray(payload.content) ? payload.content.find((part) => part && part.type === 'text') : null;
  return item && item.text ? item.text : '';
}

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Allow', 'POST, OPTIONS');
    res.statusCode = 204;
    return res.end();
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST, OPTIONS');
    return json(res, 405, { error: 'Metodo nao permitido.' });
  }

  // Proteção contra abuso direto do endpoint (gasta crédito Anthropic): exige
  // que a chamada venha do próprio site. O navegador envia Origin/Referer
  // automaticamente, então o app same-origin passa; chamadas externas de
  // navegador são barradas. (Camada leve; autenticação por sessão é o próximo
  // reforço — ver pendências.)
  // Valida pelo HOSTNAME (não por substring do header, que permitiria
  // "endodirect.com.br.evil.com"). Header ausente passa (clientes não-browser).
  const okHost = function (h) {
    return h === 'endodirect.com.br' || h.endsWith('.endodirect.com.br') || /^endodirect[a-z0-9-]*\.vercel\.app$/.test(h);
  };
  const hostOf = function (s) { try { return new URL(String(s)).hostname.toLowerCase(); } catch (e) { return ''; } };
  const bad = function (s) { if (!s) return false; const h = hostOf(s); return !(h && okHost(h)); };
  if (bad(String(req.headers.origin || '')) || bad(String(req.headers.referer || ''))) {
    return json(res, 403, { error: 'Origem nao autorizada.' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return json(res, 500, {
      error: 'IA nao configurada no servidor. Defina ANTHROPIC_API_KEY nas variaveis de ambiente do Vercel.'
    });
  }

  const body = parseBody(req);
  // Prompt caching (GA) das DIRETRIZES CLÍNICAS (~10,7k tokens) que vão em TODO
  // gerador de IA. Antes o system era cortado em 8000 chars — descartava quase
  // todas as diretrizes. Agora mandamos o bloco inteiro e o marcamos como prefixo
  // cacheável (cache_control ephemeral): a 1ª chamada grava (1,25x) e as seguintes
  // leem a ~0,1x. O cliente (authoringSys) separa as diretrizes ESTÁVEIS do
  // formato/persona VARIÁVEL com um sentinela; system longo e fixo (Chat IA, OSCE,
  // Prescrição) é cacheado inteiro. Tem de ser STRING ou ARRAY de blocos 'text'.
  const SYS_SPLIT = '__ENDODIRECT_SYS_SPLIT_b1f7__'; // sentinela IDENTICA a de authoringSys (index.html)
  const rawSystem = String(body.system || '');
  let system;
  if (rawSystem.indexOf(SYS_SPLIT) !== -1) {
    const parts = rawSystem.split(SYS_SPLIT);
    const head = parts[0].slice(0, 60000);        // diretrizes estáveis = prefixo cacheável (idêntico em todos os geradores)
    const tail = parts.slice(1).join('').slice(0, 8000); // formato JSON/persona variável (não cacheia)
    system = [];
    if (head) system.push({ type: 'text', text: head, cache_control: { type: 'ephemeral' } });
    if (tail) system.push({ type: 'text', text: tail });
    if (!system.length) system = '';
  } else {
    const s = rawSystem.slice(0, 60000);
    // System longo e FIXO entre chamadas (diretrizes embutidas, ~39k chars) vira
    // prefixo cacheável; curtos seguem como string simples. O limiar garante estar
    // bem acima do mínimo cacheável (4096 tokens no Opus) — abaixo seria no-op.
    system = s.length >= 20000 ? [{ type: 'text', text: s, cache_control: { type: 'ephemeral' } }] : s;
  }
  const prompt = String(body.prompt || '').slice(0, 200000);
  const maxTokens = clampTokens(body.maxTokens);
  const documentBase64 = body.documentBase64 ? String(body.documentBase64) : '';
  const ALLOWED_MEDIA = { 'application/pdf': 1, 'image/jpeg': 1, 'image/png': 1, 'image/gif': 1, 'image/webp': 1 };
  const reqMedia = String(body.mediaType || 'application/pdf');
  const mediaType = ALLOWED_MEDIA[reqMedia] ? reqMedia : 'application/pdf';
  const url = body.url ? String(body.url).slice(0, 2000) : '';

  if (!prompt && !documentBase64 && !url) {
    return json(res, 400, { error: 'Envie uma pergunta ou documento para a IA.' });
  }

  // Grounding opcional por PubMed: injeta FONTES verificáveis (PMID/ano) no topo
  // do prompt para a IA citar artigos REAIS. Best-effort — qualquer falha segue
  // sem grounding (a geração continua ancorada nas diretrizes nomeadas).
  let groundQuery = '';
  if (body.grounding) groundQuery = (typeof body.grounding === 'string' ? body.grounding : String(body.grounding.query || '')).trim().slice(0, 300);
  let groundedPrompt = prompt;
  if (groundQuery) {
    try {
      const block = formatSources(await pubmedGround(groundQuery, { max: 4 }));
      if (block) groundedPrompt = block + '\n\n' + prompt;
    } catch (e) { /* best-effort: segue sem grounding */ }
  }

  // Conteúdo de um link (opcional): busca server-side com guarda anti-SSRF e
  // injeta o texto extraído no topo do prompt p/ a IA resumir SÓ o material real.
  if (url) {
    let art;
    try { art = await fetchArticleText(url); }
    catch (e) { return json(res, 400, { error: 'Nao consegui ler o link: ' + (e && e.message ? e.message : 'falha') }); }
    if (!art || !art.text) return json(res, 400, { error: 'O link nao retornou texto utilizavel. Cole o resumo ou anexe um arquivo.' });
    const head = '=== CONTEUDO DO LINK (' + url + ') ===\n' + (art.title ? ('Titulo: ' + art.title + '\n') : '') + art.text + '\n\n';
    groundedPrompt = (head + groundedPrompt).slice(0, 200000);
  }

  // Imagens vão como bloco 'image'; PDF/texto como 'document'. (Antes era sempre
  // 'document', o que a Anthropic rejeita para media_type de imagem.)
  const isImage = /^image\//.test(mediaType);
  const content = documentBase64
    ? [
        {
          type: isImage ? 'image' : 'document',
          source: {
            type: 'base64',
            media_type: mediaType,
            data: documentBase64
          }
        },
        { type: 'text', text: groundedPrompt || 'Analise este documento.' }
      ]
    : groundedPrompt;

  try {
    const upstream = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: pickModel(body.model),
        max_tokens: maxTokens,
        system,
        messages: [{ role: 'user', content }]
      })
    });

    const data = await upstream.json().catch(() => ({}));
    if (!upstream.ok) {
      const message = data && data.error && data.error.message ? data.error.message : `Erro HTTP ${upstream.status}`;
      return json(res, upstream.status, { error: message });
    }

    // usage inclui cache_creation_input_tokens / cache_read_input_tokens —
    // permite conferir o cache de prompt no devtools (Network) sem ler logs.
    return json(res, 200, { text: extractText(data), usage: (data && data.usage) || null });
  } catch (error) {
    return json(res, 500, { error: error && error.message ? error.message : 'Falha ao chamar a IA.' });
  }
};
// Tempo p/ gerar casos clínicos ricos (OSCE/prescrição em Sonnet/Opus) sem
// truncar/expirar + passo opcional de grounding (PubMed). Reforçado em
// vercel.json (functions) que é a fonte autoritativa.
module.exports.config = { maxDuration: 60 };
