const DEFAULT_MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-20250514';

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

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return json(res, 500, {
      error: 'IA nao configurada no servidor. Defina ANTHROPIC_API_KEY nas variaveis de ambiente do Vercel.'
    });
  }

  const body = parseBody(req);
  const system = String(body.system || '').slice(0, 8000);
  const prompt = String(body.prompt || '').slice(0, 24000);
  const maxTokens = clampTokens(body.maxTokens);
  const documentBase64 = body.documentBase64 ? String(body.documentBase64) : '';
  const mediaType = String(body.mediaType || 'application/pdf');

  if (!prompt && !documentBase64) {
    return json(res, 400, { error: 'Envie uma pergunta ou documento para a IA.' });
  }

  const content = documentBase64
    ? [
        {
          type: 'document',
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
        model: DEFAULT_MODEL,
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
