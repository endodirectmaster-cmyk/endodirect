'use strict';
// Busca server-side de um link para resumo por IA (usado por api/ai.js quando
// o admin pede "gerar texto" a partir de um link no Mural). Módulo em lib/ →
// NÃO conta como função serverless (respeita o limite do plano).
//
// Guarda anti-SSRF (mesmo espírito de lib/podcasts.js): só HTTPS público;
// bloqueia loopback/privado/link-local; revalida o destino A CADA redirect
// (um redirect para 127.0.0.1/169.254.x não fura a checagem).
const dns = require('dns').promises;

const MAX_BYTES = 2 * 1024 * 1024; // 2 MB baixados
const MAX_CHARS = 120000;          // texto extraído enviado à IA
const MAX_REDIRECTS = 4;

function isSafeUrl(u) {
  let url;
  try { url = new URL(u); } catch (e) { return false; }
  if (url.protocol !== 'https:') return false;
  const h = url.hostname.toLowerCase();
  if (h === 'localhost' || h === '0.0.0.0' || h.endsWith('.local')) return false;
  if (/^(127\.|10\.|192\.168\.|169\.254\.)/.test(h)) return false;
  if (/^172\.(1[6-9]|2\d|3[01])\./.test(h)) return false;
  if (h === '::1' || h.startsWith('fe80') || h.startsWith('fc') || h.startsWith('fd')) return false;
  return true;
}

function isPrivateIp(ip) {
  const s = String(ip || '');
  if (/^127\./.test(s) || /^10\./.test(s) || /^192\.168\./.test(s) || /^169\.254\./.test(s)) return true;
  if (/^172\.(1[6-9]|2\d|3[01])\./.test(s)) return true;
  if (/^100\.(6[4-9]|[7-9]\d|1[01]\d|12[0-7])\./.test(s)) return true; // CGNAT 100.64.0.0/10
  if (s === '::1' || /^fe80/i.test(s) || /^f[cd]/i.test(s)) return true;
  const m = s.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/i);
  if (m) return isPrivateIp(m[1]);
  return false;
}

async function hostResolvesPrivate(host) {
  if (isPrivateIp(host)) return true;
  try {
    const addrs = await dns.lookup(host, { all: true });
    return addrs.some((a) => isPrivateIp(a.address));
  } catch (e) { return true; } // não resolveu = trata como inseguro
}

function decodeEntities(s) {
  return String(s)
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .replace(/&#(\d+);/g, function (_, n) { try { return String.fromCharCode(+n); } catch (e) { return ''; } });
}

function htmlToText(html) {
  let h = String(html);
  const title = (h.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1] || '';
  h = h.replace(/<script[\s\S]*?<\/script>/gi, ' ')
       .replace(/<style[\s\S]*?<\/style>/gi, ' ')
       .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ')
       .replace(/<!--[\s\S]*?-->/g, ' ');
  h = h.replace(/<\/(p|div|h[1-6]|li|br|tr|section|article)>/gi, '\n');
  h = h.replace(/<[^>]+>/g, ' ');
  h = decodeEntities(h).replace(/[ \t\f\r]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim();
  return { title: decodeEntities(title).replace(/\s+/g, ' ').trim(), text: h };
}

// fetch com redirect manual: revalida cada hop contra a guarda anti-SSRF.
async function safeFetch(url, depth) {
  if (depth > MAX_REDIRECTS) throw new Error('redirecionamentos demais');
  if (!isSafeUrl(url)) throw new Error('use um link https público');
  if (await hostResolvesPrivate(new URL(url).hostname)) throw new Error('endereço não permitido');
  const ctrl = (typeof AbortController !== 'undefined') ? new AbortController() : null;
  const timer = ctrl ? setTimeout(function () { ctrl.abort(); }, 12000) : null;
  let r;
  try {
    r = await fetch(url, {
      redirect: 'manual',
      signal: ctrl ? ctrl.signal : undefined,
      headers: { 'User-Agent': 'EndodirectMuralBot/1.0', Accept: 'text/html,application/xhtml+xml,text/plain,*/*' }
    });
  } finally { if (timer) clearTimeout(timer); }
  if (r.status >= 300 && r.status < 400) {
    const loc = r.headers.get('location');
    if (!loc) throw new Error('redirecionamento inválido');
    return safeFetch(new URL(loc, url).toString(), depth + 1);
  }
  return r;
}

async function fetchArticleText(rawUrl) {
  const r = await safeFetch(String(rawUrl || '').trim(), 0);
  if (!r.ok) throw new Error('o site respondeu HTTP ' + r.status);
  const ct = String(r.headers.get('content-type') || '').toLowerCase();
  if (!/text\/html|text\/plain|application\/xhtml/.test(ct)) {
    throw new Error('tipo de conteúdo não suportado (' + (ct || 'desconhecido') + '). Baixe e anexe o arquivo.');
  }
  const len = Number(r.headers.get('content-length') || 0);
  if (len && len > MAX_BYTES) throw new Error('página muito grande');
  let body = await r.text();
  if (body.length > MAX_BYTES) body = body.slice(0, MAX_BYTES);
  const out = /text\/plain/.test(ct) ? { title: '', text: body } : htmlToText(body);
  out.text = String(out.text || '').slice(0, MAX_CHARS);
  if (!out.text || out.text.replace(/\s/g, '').length < 40) throw new Error('não consegui extrair texto do link');
  return out;
}

module.exports = { fetchArticleText, isSafeUrl, isPrivateIp };
