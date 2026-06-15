const DEFAULT_MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6';
// Modelos que o cliente pode solicitar por requisição (evita abuso/custo).
// Recursos clínicos (prescrição/simulador) pedem Opus; o resto fica no default.
const ALLOWED_MODELS = { 'claude-sonnet-4-6': 1, 'claude-opus-4-8': 1, 'claude-haiku-4-5': 1 };
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
  const system = String(body.system || '').slice(0, 8000);
  const prompt = String(body.prompt || '').slice(0, 200000);
  const maxTokens = clampTokens(body.maxTokens);
  const documentBase64 = body.documentBase64 ? String(body.documentBase64) : '';
  const ALLOWED_MEDIA = { 'application/pdf': 1, 'image/jpeg': 1, 'image/png': 1, 'image/gif': 1, 'image/webp': 1 };
  const reqMedia = String(body.mediaType || 'application/pdf');
  const mediaType = ALLOWED_MEDIA[reqMedia] ? reqMedia : 'application/pdf';

  if (!prompt && !documentBase64) {
    return json(res, 400, { error: 'Envie uma pergunta ou documento para a IA.' });
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
        { type: 'text', text: prompt || 'Analise este documento.' }
      ]
    : prompt;

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

    return json(res, 200, { text: extractText(data) });
  } catch (error) {
    return json(res, 500, { error: error && error.message ? error.message : 'Falha ao chamar a IA.' });
  }
};
