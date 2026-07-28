// Parser de JATS (texto integral do PMC) — lib/fulltext.js
//
// ⚠️ POR QUE ISTO É UM TESTE COM FIXTURE, E NÃO CONTRA UM ARTIGO REAL:
// desta sessão o proxy bloqueia `eutils.ncbi.nlm.nih.gov` e `ebi.ac.uk` (403 no
// CONNECT). A produção alcança — é de lá que o radar puxa os abstracts todo dia.
// Então o parser é exercitado aqui contra um JATS montado à mão, cobrindo as
// formas que aparecem de verdade, e a primeira validação contra artigo real
// acontece em produção, com o professor olhando o resultado.
'use strict';
const F = require('/home/user/endodirect/lib/fulltext.js');

let bad = 0;
const ok = (nome, cond, det) => { if (cond) return; bad++; console.log('  ✗ ' + nome + (det !== undefined ? ' — ' + det : '')); };

const XML = `<?xml version="1.0"?>
<article xmlns:xlink="http://www.w3.org/1999/xlink">
<front><article-meta><permissions>
  <license license-type="open-access" xlink:href="https://creativecommons.org/licenses/by/4.0/">
  <license-p>This is an open-access article distributed under the terms of the CC BY 4.0 license.</license-p></license>
</permissions></article-meta></front>
<body>
<sec id="s1"><title>Introduction</title>
<p>A obesidade associa-se a maior densidade mineral &#243;ssea, e ainda assim o risco de fratura em s&#237;tios perif&#233;ricos &#233; maior <xref ref-type="bibr" rid="B1">1</xref>. ${'Este par&#225;grafo precisa passar de quarenta caracteres. '.repeat(40)}</p>
<p>curto</p>
</sec>
<sec id="s2"><title>Bone microarchitecture</title>
<p>${'A DXA mede densidade projetada e n&#227;o distingue compartimento cortical de trabecular. '.repeat(40)}</p>
<fig id="F1"><label>Figure 1</label><caption><title>Density-fragility paradox.</title>
<p>Rela&#231;&#227;o entre IMC e risco de fratura por s&#237;tio esquel&#233;tico.</p></caption>
<graphic xlink:href="fendo-16-1234-g001"/></fig>
<table-wrap id="T1"><label>Table 1</label><caption><p>Risco de fratura por s&#237;tio.</p></caption>
<table><thead><tr><th>S&#237;tio</th><th>IMC &lt; 25</th><th>IMC &#8805; 30</th></tr></thead>
<tbody>
<tr><td>Tornozelo</td><td>1,00</td><td>1,54</td></tr>
<tr><td>&#218;mero</td><td>1,00</td><td>1,28</td></tr>
<tr><td>Quadril | proximal</td><td>1,00</td><td>0,80</td></tr>
</tbody></table>
<table-wrap-foot><p>IMC em kg/m&#178;. Valores como raz&#227;o de risco.</p></table-wrap-foot>
</table-wrap>
</sec>
<sec id="s3"><title>Conclusion</title><p>${'Reconhecer o paradoxo orienta avalia&#231;&#227;o mais individualizada. '.repeat(40)}</p></sec>
</body></article>`;

const ft = F.parseJats(XML);

// ---- 1. o artigo foi aceito e as seções saíram -----------------------------
ok('parseJats devolve objeto', !!ft);
ok('3 seções', ft && ft.secoes.length === 3, ft && ft.secoes.map((s) => s.titulo).join(' / '));
ok('títulos preservados', ft && ft.secoes[1].titulo === 'Bone microarchitecture', ft && ft.secoes[1].titulo);
ok('parágrafo curto descartado', ft && ft.secoes[0].paragrafos.length === 1, ft && ft.secoes[0].paragrafos.length);

// ---- 2. entidades e tags inline --------------------------------------------
ok('entidades numéricas viram acento', ft && /óssea/.test(ft.secoes[0].paragrafos[0]), ft && ft.secoes[0].paragrafos[0].slice(0, 60));
ok('<xref> vira o número da citação, não some', ft && / 1\./.test(ft.secoes[0].paragrafos[0]));

// ---- 3. licença -------------------------------------------------------------
ok('licença reconhecida como CC BY', ft && ft.licenca.cc === 'CC BY', ft && ft.licenca.cc);
ok('licença marcada como redistribuível', ft && ft.licenca.redistribuivel === true);
ok('licença ausente NÃO é redistribuível',
   F.parseLicense('<permissions><license><license-p>All rights reserved.</license-p></license></permissions>').redistribuivel === false);

// ---- 4. figura --------------------------------------------------------------
ok('1 figura', ft && ft.figuras.length === 1, ft && ft.figuras.length);
ok('rótulo da figura', ft && ft.figuras[0].rotulo === 'Figure 1', ft && ft.figuras[0].rotulo);
ok('legenda junta título e corpo', ft && /paradox/i.test(ft.figuras[0].legenda) && /esquelético/.test(ft.figuras[0].legenda),
   ft && ft.figuras[0].legenda);

// ---- 5. tabela → markdown ---------------------------------------------------
const t = ft && ft.tabelas[0];
ok('1 tabela', ft && ft.tabelas.length === 1, ft && ft.tabelas.length);
ok('cabeçalho + separador + 3 linhas', t && t.markdown.split('\n').length === 5, t && t.markdown.split('\n').length);
ok('valores exatos preservados', t && /\| 1,54 \|/.test(t.markdown), t && t.markdown);
ok('pipe dentro da célula é escapado (senão quebra a coluna)',
   t && /Quadril \\\| proximal/.test(t.markdown), t && (t.markdown.match(/Quadril[^\n]*/) || [''])[0]);
ok('rodapé da tabela capturado (define as abreviaturas)', t && /kg\/m²/.test(t.nota), t && t.nota);

// ---- 6. o que o parser tem de RECUSAR ---------------------------------------
// Este é o ponto do teste: aceitar um registro sem corpo produziria uma
// "discussão completa" escrita em cima de nada.
ok('sem <body> → null', F.parseJats('<article><front><article-meta/></front></article>') === null);
ok('corpo curto (resumo estendido) → null',
   F.parseJats('<article><body><sec><title>T</title><p>' + 'palavra '.repeat(80) + '</p></sec></body></article>') === null);
ok('xml vazio → null', F.parseJats('') === null);
ok('tabela de 1 coluna não vira tabela',
   F.tableToMarkdown('<table><tr><td>só isso</td></tr><tr><td>e isso</td></tr></table>') === '');

// ---- 7. o link -------------------------------------------------------------
ok('PMC id do link', F.pmcIdFromLink('https://www.ncbi.nlm.nih.gov/pmc/articles/PMC13395687/') === 'PMC13395687');
ok('link sem PMC devolve vazio', F.pmcIdFromLink('https://doi.org/10.1210/clinem/dgae123') === '');

// ---- 8. o texto que vai para a IA ------------------------------------------
const prompt = ft && F.fullTextForPrompt(ft);
ok('prompt traz as tabelas por extenso (são elas que têm os números)',
   prompt && prompt.includes('| 1,54 |'));
ok('prompt traz as legendas das figuras', prompt && /Figure 1: /.test(prompt));
ok('prompt separa as seções', prompt && (prompt.match(/^## /gm) || []).length >= 5);
ok('truncagem respeita o teto e avisa', (() => {
  const p = F.fullTextForPrompt(ft, 400);
  return p.length <= 460 && /texto truncado/.test(p);
})(), ft && F.fullTextForPrompt(ft, 400).length);

console.log(bad ? '\nFALHOU: ' + bad : '\n✓ parser de JATS: seções, licença, figuras, tabelas→markdown e as recusas');
process.exit(bad ? 1 : 0);
