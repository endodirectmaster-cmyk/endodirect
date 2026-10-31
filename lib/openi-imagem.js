// Imagens do Open-i (PubMed Central): licença e cópia própria (31/10/2026).
//
// Por quê:
//  - O Open-i ficou fora do ar de 25 a 31/10/2026, e toda figura ligada direto a
//    ele quebrou (capítulos 111 e 113 e 10 Questões do Dia). Regra do cofre
//    ([[Dados e Supabase]]): figura de artigo que vai para o produto fica em cópia
//    própria, em `endodirect-assets/resumos/pmc/`.
//  - Só entra imagem de licença livre: CC BY, CC0 ou domínio público (regra de
//    16/07). O servidor lia `license`/`Rights`, campos que o Open-i não manda; a
//    licença real vem em `ccLicense` ("by", "byncnd"...) e `licenseURL`. Das 10
//    figuras das Questões do Dia, só 3 eram CC BY.
//
// O navegador não alcança o Open-i (CORS), por isso o servidor baixa a imagem e a
// devolve em base64; quem sobe para o bucket é o navegador do professor, com a
// própria sessão (a política do Storage só deixa admin gravar em
// endodirect-assets). Módulo de lib/ (não conta como função serverless).

const HOST_OPENI = 'openi.nlm.nih.gov';
const TETO_BYTES = 3 * 1024 * 1024; // a resposta da Vercel tem teto de 4,5 MB, e o base64 cresce 1/3
const TIPOS_IMAGEM = /^image\/(png|jpeg|gif|webp)$/;

// Rótulo da licença a partir dos campos do Open-i, e se ela é livre para o produto.
function licencaOpeni(it) {
  it = it || {};
  const cc = String(it.ccLicense || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const url = String(it.licenseURL || '').toLowerCase();
  let rotulo = '';
  if (cc === 'cc0' || /publicdomain\/zero/.test(url)) rotulo = 'CC0';
  else if (cc === 'pd' || /publicdomain\/mark/.test(url)) rotulo = 'Domínio público';
  else {
    let cod = '';
    if (/^by/.test(cc)) cod = cc;
    else {
      const m = url.match(/creativecommons\.org\/licenses\/([a-z-]+)\//);
      if (m) cod = m[1].replace(/-/g, '');
    }
    if (/^by/.test(cod)) {
      rotulo = 'CC BY' + (/nc/.test(cod) ? '-NC' : '') + (/sa/.test(cod) ? '-SA' : '') + (/nd/.test(cod) ? '-ND' : '');
    }
  }
  return { licenca: rotulo, livre: rotulo === 'CC BY' || rotulo === 'CC0' || rotulo === 'Domínio público' };
}

// Só URL de imagem do próprio Open-i, em https, na pasta /imgs/.
function urlOpeniValida(u) {
  try {
    const x = new URL(String(u || ''));
    return x.protocol === 'https:' && x.hostname === HOST_OPENI && x.pathname.indexOf('/imgs/') === 0 && !x.username && !x.password && !x.port;
  } catch (e) {
    return false;
  }
}

// Baixa a imagem e devolve { ok, tipo, base64, bytes } ou { ok:false, code, error }.
// `fetchImpl` existe para o teste; em produção é o fetch global.
async function baixarImagemOpeni(u, fetchImpl) {
  const f = fetchImpl || fetch;
  if (!urlOpeniValida(u)) return { ok: false, code: 400, error: 'Endereço de imagem do Open-i inválido.' };
  const ctrl = typeof AbortController === 'function' ? new AbortController() : null;
  const timer = ctrl ? setTimeout(() => ctrl.abort(), 20000) : null;
  try {
    const r = await f(String(u), { redirect: 'error', signal: ctrl ? ctrl.signal : undefined, headers: { Accept: 'image/*' } });
    if (!r || !r.ok) return { ok: false, code: 502, error: 'O Open-i não entregou a imagem (HTTP ' + (r ? r.status : '?') + ').' };
    const tipo = String((r.headers && r.headers.get && r.headers.get('content-type')) || '').split(';')[0].trim().toLowerCase();
    // Em manutenção, o Open-i responde 200 com uma página HTML: isso não é imagem.
    if (!TIPOS_IMAGEM.test(tipo)) return { ok: false, code: 502, error: 'O Open-i não devolveu uma imagem (' + (tipo || 'sem tipo') + ').' };
    const buf = Buffer.from(await r.arrayBuffer());
    if (!buf.length) return { ok: false, code: 502, error: 'Imagem vazia.' };
    if (buf.length > TETO_BYTES) return { ok: false, code: 413, error: 'Imagem grande demais (mais de 3 MB).' };
    return { ok: true, tipo: tipo, base64: buf.toString('base64'), bytes: buf.length };
  } catch (e) {
    return { ok: false, code: 502, error: 'Falha ao baixar a imagem do Open-i.' };
  } finally {
    if (timer) clearTimeout(timer);
  }
}

module.exports = { licencaOpeni, urlOpeniValida, baixarImagemOpeni, TETO_BYTES };
