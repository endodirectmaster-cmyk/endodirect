// Endodirect — Páginas públicas indexáveis: /resumos, /resumo/<slug>, /sitemap.xml
//
// Renderizadas NO SERVIDOR de propósito. O app é um SPA que monta tudo por
// JavaScript depois de falar com o Supabase; o robô do Google recebe um HTML
// praticamente vazio e um único endereço. Aqui ele recebe o texto pronto, com
// título, descrição, canonical e JSON-LD — um endereço por capítulo.
//
// ⚠️ O conteúdo é EXATAMENTE o que a plataforma já entrega ao visitante anônimo
// (RPC endodirect_public_content: privado <> true, rascunho <> true). As RPCs
// usadas aqui têm execute REVOGADO de anon/authenticated e são chamadas com a
// service role: nenhuma superfície nova para o navegador.
//
// ⚠️ Sem service key, responde 503 e NÃO indexa. Melhor a página não existir do
// que existir vazia: página vazia no índice do Google custa mais que página
// nenhuma, e demora meses para sair.
// ⚠️ A INSCRIÇÃO NA NEWSLETTER MORA AQUI, e não num arquivo próprio, porque a
// Vercel só aceita 12 funções serverless — cada arquivo em api/ é uma função, e
// o projeto já está no teto (guarda em scripts/test-aula-ao-vivo.js). Duas rotas
// novas custariam duas funções; esta função pública serve as quatro.
const {
  paginaCapitulo, paginaIndice, paginaNaoEncontrada, sitemapXml, publicBase,
} = require('../lib/publico');

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://auth.endodirect.com.br';
function serviceKey() {
  return process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_KEY || '';
}
function headers(key) {
  return { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', Accept: 'application/json' };
}
async function rpc(nome, body) {
  const key = serviceKey();
  if (!key) return null;
  const r = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${nome}`, {
    method: 'POST', headers: headers(key), body: JSON.stringify(body || {}),
  });
  if (!r.ok) { console.error('[publico] RPC', nome, 'HTTP', r.status); return null; }
  return r.json().catch(() => null);
}

// Memória do processo: o índice muda quando o professor publica, não a cada
// visita. Em função serverless quente isto evita ler o payload de 4,7 MB a cada
// pedido; o cache de borda (s-maxage) resolve o resto.
let cacheIndice = null;
let cacheEm = 0;
const TTL_MS = 10 * 60 * 1000;
async function indice() {
  const agora = Date.now();
  if (cacheIndice && agora - cacheEm < TTL_MS) return cacheIndice;
  const j = await rpc('endodirect_publico_indice');
  if (!Array.isArray(j)) return cacheIndice;      // falhou: serve o último bom, se houver
  cacheIndice = j; cacheEm = agora;
  return j;
}

function envia(res, status, tipo, corpo, cacheSegundos) {
  res.statusCode = status;
  res.setHeader('Content-Type', tipo);
  if (cacheSegundos) {
    res.setHeader('Cache-Control', `public, max-age=0, s-maxage=${cacheSegundos}, stale-while-revalidate=86400`);
  } else {
    res.setHeader('Cache-Control', 'no-store');
  }
  res.end(corpo);
}

function jsonRes(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(body));
}
async function lerCorpo(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  const chunks = [];
  let total = 0;
  for await (const c of req) {
    total += c.length;
    if (total > 8192) return {};        // corpo gigante em rota pública: descarta
    chunks.push(c);
  }
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}'); } catch (e) { return {}; }
}

// Inscrição na newsletter SEM criar conta — o formulário das páginas públicas.
// Até aqui a newsletter só alcançava quem já tinha cadastro (getMemberEmails lê
// auth.users): quem chegava pelo Google e não queria criar conta ia embora sem
// deixar nada, e a newsletter é justamente o produto de quem não abre o app.
//
// ⚠️ Grava em TABELA PRÓPRIA, nunca no payload de endodirect_global_state:
// aquela é UMA linha de 4,7 MB, e um formulário público que a reescrevesse a
// cada inscrição seria vetor de custo e de lost update.
//
// ⚠️ Responde igual para e-mail novo e para já inscrito. Um formulário público
// que diferencia os dois casos vira consulta de "fulano assina?".
async function inscrever(req, res) {
  if (req.method !== 'POST') return jsonRes(res, 405, { ok: false, erro: 'metodo' });
  const corpo = await lerCorpo(req);
  const email = String(corpo.email || '').trim().toLowerCase();
  const origem = String(corpo.origem || '').trim().slice(0, 80);
  if (!email || email.indexOf('@') < 1 || email.length > 254) return jsonRes(res, 400, { ok: false, erro: 'email_invalido' });
  try {
    const out = await rpc('endodirect_newsletter_subscribe', { p_email: email, p_origem: origem });
    if (out === null) return jsonRes(res, 502, { ok: false, erro: 'falha' });
    if (out && out.ok === false) return jsonRes(res, 400, { ok: false, erro: out.erro || 'falha' });
    return jsonRes(res, 200, { ok: true });
  } catch (e) {
    console.error('[publico:inscrever] erro:', e && e.message);
    return jsonRes(res, 502, { ok: false, erro: 'falha' });
  }
}

module.exports = async function handler(req, res) {
  const base = publicBase();
  // ⚠️ A ROTA VEM PELA QUERY, nao pelo caminho. O vercel.json reescreve
  // /resumo/<slug> para /api/publico?rota=resumo&slug=<slug>; depender de o
  // req.url preservar o caminho original numa reescrita seria apostar num
  // detalhe da plataforma que nao esta no contrato. O caminho fica so como
  // reserva, para chamada direta. O formulario de inscricao chama
  // /api/publico?rota=inscrever direto — sem reescrita, sem falha silenciosa.
  let rota = '', slugQ = '', caminho = '/';
  try {
    const u = new URL(req.url, 'http://localhost');
    rota = String(u.searchParams.get('rota') || '');
    slugQ = String(u.searchParams.get('slug') || '');
    caminho = decodeURIComponent(u.pathname);
  } catch (e) { caminho = '/'; }

  if (!serviceKey()) {
    console.error('[publico] sem service key — 503');
    if (rota === 'inscrever') return jsonRes(res, 503, { ok: false, erro: 'indisponivel' });
    return envia(res, 503, 'text/plain; charset=utf-8', 'Indisponível no momento.');
  }

  try {
    // ⚠️ Dentro do try: `lerCorpo` percorre o corpo do pedido, e um corpo que nao
    // e iteravel estoura antes do try/catch interno do `inscrever`.
    if (rota === 'inscrever') return await inscrever(req, res);
    if (rota === 'sitemap' || /^\/sitemap\.xml\/?$/.test(caminho)) {
      const itens = await indice();
      if (!itens) return envia(res, 503, 'text/plain; charset=utf-8', 'Indisponível no momento.');
      return envia(res, 200, 'application/xml; charset=utf-8', sitemapXml(itens, base), 3600);
    }

    if (rota === 'indice' || /^\/resumos\/?$/.test(caminho)) {
      const itens = await indice();
      if (!itens) return envia(res, 503, 'text/plain; charset=utf-8', 'Indisponível no momento.');
      return envia(res, 200, 'text/html; charset=utf-8', paginaIndice(itens, base), 3600);
    }

    const m = caminho.match(/^\/resumo\/([^/]+)\/?$/);
    if (rota === 'resumo' || m) {
      const slug = String(slugQ || (m && m[1]) || '').toLowerCase();
      if (!slug) return envia(res, 404, 'text/html; charset=utf-8', paginaNaoEncontrada(base), 60);
      const item = await rpc('endodirect_publico_capitulo', { p_slug: slug });
      // ⚠️ 404 de verdade (e sem cache longo): página "não achei" devolvida com
      // 200 é soft-404 — o Google indexa o aviso como se fosse conteúdo.
      if (!item || !item.tema) {
        return envia(res, 404, 'text/html; charset=utf-8', paginaNaoEncontrada(base), 60);
      }
      return envia(res, 200, 'text/html; charset=utf-8', paginaCapitulo(item, base), 3600);
    }

    return envia(res, 404, 'text/html; charset=utf-8', paginaNaoEncontrada(base), 60);
  } catch (e) {
    console.error('[publico] erro:', e && e.message);
    if (rota === 'inscrever') return jsonRes(res, 500, { ok: false, erro: 'falha' });
    return envia(res, 500, 'text/plain; charset=utf-8', 'Erro ao montar a página.');
  }
};
