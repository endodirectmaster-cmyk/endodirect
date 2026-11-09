// BUSCA NO GOOGLE: A HOME E OS DETALHES DAS PÁGINAS PÚBLICAS (09/11/2026).
//
// Pedido do professor: "ver como está o motor de busca no google da nossa plataforma. Acho que
// nunca mexemos nisso". As páginas públicas existem desde 19/08/2026 (test-publico-seo.js), mas a
// home nunca tinha sido tratada.
//
// 🧨 OS MODOS DE QUEBRAR ISTO são todos silenciosos: o Google não avisa que a description sumiu,
// que o JSON-LD não parseia ou que o favicon voltou a ser retangular. Só cai o resultado de busca.
'use strict';
const fs = require('fs');
const path = require('path');

const RAIZ = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(RAIZ, 'index.html'), 'utf8');
const head = html.slice(0, html.indexOf('</head>'));
let bad = 0;
const ok = (nome, cond, det) => { if (cond) return; bad++; console.log('  ✗ ' + nome + (det ? ' — ' + det : '')); };
const meta = (re) => { const m = head.match(re); return m ? m[1] : null; };

// ---- 1. a home ------------------------------------------------------------------------------
const titulos = head.match(/<title>[^<]*<\/title>/g) || [];
ok('um só <title>', titulos.length === 1, String(titulos.length));
const titulo = meta(/<title>([^<]*)<\/title>/) || '';
ok('título diz Endocrinologia (e "Endodirect" sozinho é de uma empresa de endodontia)', /Endocrinologia/.test(titulo) && /Endodirect/.test(titulo), titulo);
ok('título até 60 caracteres', titulo.length <= 60, String(titulo.length));
const desc = meta(/<meta name="description" content="([^"]*)">/) || '';
ok('meta description existe, entre 120 e 160 caracteres', desc.length >= 120 && desc.length <= 160, desc.length + ': ' + desc);
// Os números da description são os da landing: se a landing mudar, a description não pode mentir.
const hero = (html.match(/<section class="lp-hero">[\s\S]*?<\/p>/) || [''])[0];
ok('números da description são os da landing', /Mais de 3 mil questões comentadas, mais de 2 mil flashcards/.test(hero) && /3 mil questões/.test(desc) && /2 mil flashcards/.test(desc));
ok('canonical na raiz do domínio com www', /<link rel="canonical" href="https:\/\/www\.endodirect\.com\.br\/">/.test(head));
['og:type', 'og:site_name', 'og:locale', 'og:url', 'og:title', 'og:description', 'og:image'].forEach((p) => {
  ok('Open Graph: ' + p, new RegExp('<meta property="' + p + '" content="[^"]+">').test(head));
});
const ld = meta(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
let grafo = null;
try { grafo = JSON.parse(ld); } catch (e) { grafo = null; }
ok('JSON-LD parseia', !!grafo);
const tipos = grafo && Array.isArray(grafo['@graph']) ? grafo['@graph'].map((x) => x['@type']) : [];
ok('JSON-LD: Organization e WebSite', tipos.indexOf('Organization') >= 0 && tipos.indexOf('WebSite') >= 0, tipos.join());
// Favicon: o Google só mostra ícone QUADRADO (múltiplo de 48 px). O antigo tinha 951x1064.
const icone = meta(/<link rel="icon"[^>]*href="([^"]+)"/) || '';
ok('favicon é o quadrado de /icons', icone === '/icons/icon-192.png', icone);
const png = fs.readFileSync(path.join(RAIZ, 'icons', 'icon-192.png'));
ok('icon-192.png é 192x192', png.readUInt32BE(16) === 192 && png.readUInt32BE(20) === 192);
ok('o favicon retangular saiu do <head>', !/rel="(shortcut )?icon"[^>]*Icone%20-%20MD%202\.png/.test(head));
ok('home sem noindex', !/name="robots"[^>]*noindex/.test(head));

// ---- 2. páginas públicas ----------------------------------------------------------------------
const P = require('../lib/publico');
const d1 = P.descricao('Hiperplasia: nódulos adrenais bilaterais > 1 cm e cortisol > 1,8 µg/dL.');
ok('description mantém o ">" do texto (muda o sentido médico)', /bilaterais > 1 cm/.test(d1) && /cortisol > 1,8/.test(d1), d1);
ok('description tira o ">" de citação no início da linha', P.descricao('> Citação da diretriz.\nTexto.') === 'Citação da diretriz. Texto.', P.descricao('> Citação da diretriz.\nTexto.'));
const sm = P.sitemapXml([{ slug: 'a' }, { slug: 'b' }], 'https://www.endodirect.com.br');
ok('sitemap só com <loc> (o Google ignora changefreq e priority)', !/changefreq|priority/.test(sm) && (sm.match(/<loc>/g) || []).length === 4, sm);
const src = fs.readFileSync(path.join(RAIZ, 'lib', 'publico.js'), 'utf8');
ok('hub com og:type website; capítulo segue article', /ogType: 'website'/.test(src.slice(src.indexOf('function paginaIndice'))) && /ogType === 'website' \? 'website' : 'article'/.test(src));
ok('páginas públicas com og:image', /<meta property="og:image" content="https:\/\/www\.endodirect\.com\.br\/icons\/icon-512\.png">/.test(src));

if (bad) { console.log('\n' + bad + ' falha(s) na busca do Google'); process.exit(1); }
console.log('busca no Google: home com título, description, canonical, Open Graph, JSON-LD e favicon quadrado; páginas públicas sem distorcer ">"');
