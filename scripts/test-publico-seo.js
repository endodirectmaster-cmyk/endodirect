// Páginas públicas indexáveis: o que elas PODEM e o que elas NÃO PODEM mostrar.
//
// ⚠️ A INVARIANTE COMERCIAL É A MAIS SÉRIA DAQUI, e é a que não dá erro nenhum
// se quebrar. A página pública serve o resumo e os pontos-chave — o mesmo que a
// plataforma já entrega ao visitante anônimo. Flashcards, mapa mental,
// fluxogramas e figuras são o que o assinante paga para ter: se um dia alguém
// passar o item inteiro para `paginaCapitulo`, eles apareceriam no Google sem
// nenhuma falha visível, e a exclusividade acabaria em silêncio.
//
// ⚠️ E A DE SEGURANÇA: o texto vem do payload e é renderizado como HTML. Sem
// escape, um `<script>` no resumo vira script executado na página pública.
'use strict';
const P = require('../lib/publico.js');
const falhas = [];
const conf = (desc, cond) => { if (!cond) falhas.push(desc); };

const BASE = 'https://www.endodirect.com.br';

// ── 1. slug: o espelho em JS tem de bater com o do banco ────────────────────
// (a tabela abaixo veio de `select public.endodirect_slug(...)` rodado no banco)
[
  ['Hipogonadismo masculino — Posicionamento SBEM/SBU/ABEMSS (2026)', 'hipogonadismo-masculino-posicionamento-sbem-sbu-abemss-2026'],
  ['Hiperaldosteronismo primário', 'hiperaldosteronismo-primario'],
  ['Hiperplasia adrenal congênita (deficiência de 21-hidroxilase)', 'hiperplasia-adrenal-congenita-deficiencia-de-21-hidroxilase'],
  ['Nódulo tireoidiano e câncer diferenciado', 'nodulo-tireoidiano-e-cancer-diferenciado'],
  ['Incidentaloma adrenal', 'incidentaloma-adrenal'],
].forEach(([tema, esperado]) => {
  conf('slug divergiu do banco para "' + tema + '": ' + P.slug(tema), P.slug(tema) === esperado);
});

// ── 2. markdown → HTML, com escape ──────────────────────────────────────────
const veneno = '## Título\n\nTexto com <script>alert(1)</script> e **negrito**.\n\n- item um\n- item dois\n\n| A | B |\n|---|---|\n| 1 | 2 |\n';
const h = P.mdToHtml(veneno);
conf('⚠️ NÃO escapou HTML do payload — script vivo na página pública', h.indexOf('<script>') < 0);
conf('escapou demais: perdeu o negrito', h.indexOf('<strong>negrito</strong>') > 0);
conf('não montou o cabeçalho', /<h2>Título<\/h2>/.test(h));
conf('não montou a lista', /<ul><li>item um<\/li>/.test(h));
conf('não montou a tabela', /<table>[\s\S]*<th>A<\/th>/.test(h));
conf('⚠️ o markdown virou <h1> — o <h1> da página é o tema, e dois h1 confundem o índice', h.indexOf('<h1>') < 0);

// ── 3. a página de um capítulo ──────────────────────────────────────────────
const ITEM = {
  slug: 'hiperaldosteronismo-primario',
  tema: 'Hiperaldosteronismo primário',
  sub: 'Adrenal',
  ano: '2025',
  fonte: 'Endocrine Society (JCEM)',
  url: 'https://academic.oup.com/jcem/exemplo',
  resumo: '## Quando rastrear\nRastrear **todo** hipertenso com hipocalemia espontânea.\n\n- relação aldosterona/renina\n- confirmação com teste de supressão\n',
  pts: ['A relação aldosterona/renina é o teste de rastreio.', 'Hipocalemia não é obrigatória.'],
  // ⚠️ Estes NÃO podem sair na página pública, mesmo vindo no objeto:
  flashcards: [{ f: 'frente secreta do assinante', v: 'verso secreto do assinante' }],
  mapa: 'mapa mental secreto do assinante',
  fluxogramas: ['fluxograma secreto do assinante'],
  figuras: ['data:image/png;base64,AAAA'],
};
const pag = P.paginaCapitulo(ITEM, BASE);
conf('sem <title>', /<title>Hiperaldosteronismo primário — Endodirect<\/title>/.test(pag));
conf('sem meta description preenchida', /<meta name="description" content="[^"]{40,}"/.test(pag));
conf('sem canonical apontando para a própria URL',
     pag.indexOf('<link rel="canonical" href="' + BASE + '/resumo/hiperaldosteronismo-primario">') > 0);
conf('sem JSON-LD', pag.indexOf('application/ld+json') > 0 && pag.indexOf('MedicalWebPage') > 0);
conf('sem h1 com o tema', /<h1>Hiperaldosteronismo primário<\/h1>/.test(pag));
conf('não trouxe o corpo do resumo', pag.indexOf('hipertenso com hipocalemia espontânea') > 0);
conf('não trouxe os pontos-chave', pag.indexOf('A relação aldosterona/renina é o teste de rastreio.') > 0);
conf('não linkou o documento original', pag.indexOf('academic.oup.com/jcem/exemplo') > 0);
conf('sem lang pt-BR', pag.indexOf('<html lang="pt-BR">') === 0 || pag.indexOf('<html lang="pt-BR">') > 0);

// ⚠️ O bloco que protege o benefício do assinante:
['frente secreta do assinante', 'verso secreto do assinante', 'mapa mental secreto do assinante',
 'fluxograma secreto do assinante', 'data:image/png;base64'].forEach((proibido) => {
  conf('⚠️ VAZOU material de assinante na página pública: "' + proibido + '"', pag.indexOf(proibido) < 0);
});

// ── 4. captação de e-mail: existe e aponta para o lugar certo ───────────────
conf('a página não capta e-mail — tráfego sem captura é tráfego perdido',
     pag.indexOf('/api/publico?rota=inscrever') > 0 && /<input[^>]+type="email"/.test(pag));

// ── 5. índice e sitemap ─────────────────────────────────────────────────────
const ITENS = [
  { slug: 'a-um', tema: 'A um', sub: 'Adrenal', ano: '2025' },
  { slug: 'b-dois', tema: 'B dois', sub: 'Tireoide', ano: '2026' },
  { slug: 'c-tres', tema: 'C três', sub: 'Adrenal', ano: '' },
];
const ix = P.paginaIndice(ITENS, BASE);
ITENS.forEach((it) => conf('índice não linka ' + it.slug, ix.indexOf('/resumo/' + it.slug) > 0));
conf('índice não agrupa por subespecialidade', ix.indexOf('<h2>Adrenal</h2>') > 0 && ix.indexOf('<h2>Tireoide</h2>') > 0);

const xml = P.sitemapXml(ITENS, BASE);
const locs = (xml.match(/<loc>([^<]+)<\/loc>/g) || []).map((x) => x.replace(/<\/?loc>/g, ''));
conf('sitemap sem declaração XML', xml.indexOf('<?xml version="1.0" encoding="UTF-8"?>') === 0);
conf('sitemap não tem uma URL por capítulo (+ home + índice)', locs.length === ITENS.length + 2);
conf('⚠️ sitemap com URL relativa — o Google descarta a entrada', locs.every((l) => l.indexOf('https://') === 0));
conf('⚠️ sitemap com URL repetida', new Set(locs).size === locs.length);

// ── 6. o roteamento: a rota vem pela QUERY, que é o que o vercel.json entrega ─
const handler = require('../api/publico.js');
function resFalso() {
  const r = { statusCode: 0, headers: {}, corpo: '' };
  r.setHeader = (k, v) => { r.headers[k.toLowerCase()] = v; };
  r.end = (b) => { r.corpo = String(b == null ? '' : b); };
  return r;
}
async function chama(url, env) {
  const antes = { ...process.env };
  Object.assign(process.env, env || {});
  const r = resFalso();
  try { await handler({ url, method: 'GET' }, r); } finally {
    Object.keys(process.env).forEach((k) => { if (!(k in antes)) delete process.env[k]; });
    Object.assign(process.env, antes);
  }
  return r;
}

(async () => {
  // 6a. sem service key: 503 e NADA indexável. Página vazia no índice do Google
  //     custa mais que página nenhuma, e demora meses para sair de lá.
  const semKey = { ...process.env };
  delete semKey.SUPABASE_SERVICE_ROLE_KEY; delete semKey.SUPABASE_SECRET_KEY; delete semKey.SUPABASE_SERVICE_KEY;
  const guardaEnv = { ...process.env };
  ['SUPABASE_SERVICE_ROLE_KEY', 'SUPABASE_SECRET_KEY', 'SUPABASE_SERVICE_KEY'].forEach((k) => delete process.env[k]);
  const r503 = resFalso();
  await handler({ url: '/api/publico?rota=indice', method: 'GET' }, r503);
  Object.assign(process.env, guardaEnv);
  conf('sem service key deveria dar 503, deu ' + r503.statusCode, r503.statusCode === 503);

  // 6b. com key e RPC respondendo: as três rotas saem pelo parâmetro `rota`
  const fetchOriginal = global.fetch;
  global.fetch = async (url, opts) => {
    const corpo = JSON.parse((opts && opts.body) || '{}');
    const nome = String(url).split('/rpc/')[1] || '';
    if (nome === 'endodirect_publico_indice') return { ok: true, json: async () => ITENS };
    if (nome === 'endodirect_publico_capitulo') {
      return { ok: true, json: async () => (corpo.p_slug === ITEM.slug ? ITEM : null) };
    }
    return { ok: false, status: 404, json: async () => null };
  };
  try {
    const rIx = await chama('/api/publico?rota=indice', { SUPABASE_SERVICE_ROLE_KEY: 'k' });
    conf('rota=indice não deu 200 (deu ' + rIx.statusCode + ')', rIx.statusCode === 200);
    conf('rota=indice não devolveu HTML', /text\/html/.test(rIx.headers['content-type'] || ''));

    const rSm = await chama('/api/publico?rota=sitemap', { SUPABASE_SERVICE_ROLE_KEY: 'k' });
    conf('rota=sitemap não deu 200', rSm.statusCode === 200);
    conf('sitemap não saiu como XML', /application\/xml/.test(rSm.headers['content-type'] || ''));

    const rOk = await chama('/api/publico?rota=resumo&slug=' + ITEM.slug, { SUPABASE_SERVICE_ROLE_KEY: 'k' });
    conf('capítulo conhecido não deu 200 (deu ' + rOk.statusCode + ')', rOk.statusCode === 200);
    conf('capítulo conhecido não trouxe o tema', rOk.corpo.indexOf('Hiperaldosteronismo primário') > 0);

    // ⚠️ SLUG DESCONHECIDO PRECISA DE 404 DE VERDADE. Devolver a página de "não
    // achei" com status 200 é soft-404: o Google indexa o aviso como conteúdo.
    const r404 = await chama('/api/publico?rota=resumo&slug=nao-existe', { SUPABASE_SERVICE_ROLE_KEY: 'k' });
    conf('slug inexistente deveria dar 404, deu ' + r404.statusCode, r404.statusCode === 404);
  } finally {
    global.fetch = fetchOriginal;
  }

  if (falhas.length) {
    console.error('✗ páginas públicas (SEO):');
    falhas.forEach((f) => console.error('  - ' + f));
    process.exit(1);
  }
  console.log('✓ páginas públicas: escapam HTML, não vazam material de assinante, captam e-mail e roteiam por 200/404');
})();
