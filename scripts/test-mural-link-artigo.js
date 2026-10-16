// LINK DO ARTIGO ORIGINAL NOS POSTS AUTOMÁTICOS DO MURAL (16/10/2026).
//
// Pedido do professor: "Colocar o link para o artigo original nos posts
// automáticos do mural. Fica ruim de ter que procurar pelo artigo manualmente."
// O card só linkava o NOME da revista no pé ("Fonte: …"), depois do texto e da
// discussão, e ninguém lia aquilo como o artigo.
//
// 🧨 O QUE ESTE TESTE PRENDE: (1) o botão aparece em todo post do radar com link,
// com o rótulo certo (texto completo no acesso aberto, comunicado oficial na
// breaking news) e sem as marcas de feed (?af=R, utm_*); (2) PubMed ao lado só
// quando há PMID e o link não é do PubMed; (3) aviso escrito pelo professor e link
// que não é http(s) ficam sem botão; (4) o endereço sai escapado; (5) o botão vem
// logo depois da data no card vivo (`muralNoticeCardHTML`), abrindo em aba nova;
// (6) o alvo de toque tem pelo menos 34px.
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const SRC = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const falhas = [];
const ok = (c, m) => { if (!c) falhas.push(m); };
function corpo(nome) {
  const i = SRC.indexOf('\nfunction ' + nome + '(');
  if (i < 0) throw new Error('função não encontrada: ' + nome);
  const f = SRC.indexOf('\nfunction ', i + 1);
  return SRC.slice(i + 1, f < 0 ? SRC.length : f);
}
const ctx = vm.createContext({ URL });
['esc', 'safeHttpUrl', 'muralLinkLimpo', 'muralLinkArtigoHTML'].forEach((n) => vm.runInContext(corpo(n), ctx));
const h = (a) => ctx.muralLinkArtigoHTML(a);
const href = (html, qual) => ((html.match(new RegExp('data-art="' + qual + '"[^>]*href="([^"]+)"')) || [])[1] || null);
const pmc = { auto: true, sourceId: 'pubmed:42877498', tipo: 'Artigo de Revisão', link: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC13662555/', oa: true, pmid: '42877498' };
const wiley = { auto: true, sourceId: 'journalrss:dom.71385', tipo: 'Estudo Original', link: 'https://dom-pubs.onlinelibrary.wiley.com/doi/10.1111/dom.71385?af=R', oa: false };
const jcem = { auto: true, sourceId: 'pubmed:41000001', tipo: 'Ensaio Clínico', link: 'https://doi.org/10.1210/clinem/dgaf001?utm_source=rss&x=1', oa: false, pmid: '41000001' };
const breaking = { auto: true, sourceId: 'news:fda-1', tipo: 'Breaking News', breaking: true, link: 'https://www.fda.gov/news-events/press-announcements/x' };
const pubmedLink = { auto: true, sourceId: 'pubmed:40000002', link: 'https://pubmed.ncbi.nlm.nih.gov/40000002/', pmid: '40000002', oa: false };

// (1) rótulos e limpeza
ok(/Ler o texto completo \(acesso aberto\)/.test(h(pmc)) && href(h(pmc), 'artigo') === pmc.link, '(1) acesso aberto sem o rótulo de texto completo ou com o link errado');
ok(href(h(wiley), 'artigo') === 'https://dom-pubs.onlinelibrary.wiley.com/doi/10.1111/dom.71385' && /Ler o artigo original/.test(h(wiley)), '(1) o ?af=R do feed da Wiley ficou no link: ' + href(h(wiley), 'artigo'));
ok(href(h(jcem), 'artigo') === 'https://doi.org/10.1210/clinem/dgaf001?x=1', '(1) utm_* não saiu (ou levou junto o parâmetro legítimo): ' + href(h(jcem), 'artigo'));
ok(/Abrir o comunicado oficial/.test(h(breaking)), '(1) breaking news devia abrir o comunicado oficial');
ok(/Abrir a publicação original/.test(h({ auto: true, sourceId: 'society:sbem-1', link: 'https://www.endocrino.org.br/x' })), '(1) post de sociedade devia abrir a publicação original');
// (2) PubMed
ok(href(h(jcem), 'pubmed') === 'https://pubmed.ncbi.nlm.nih.gov/41000001/', '(2) com PMID, o PubMed devia vir ao lado');
ok(!href(h(wiley), 'pubmed'), '(2) sem PMID não pode haver botão do PubMed');
ok(!href(h(pubmedLink), 'pubmed'), '(2) link que já é do PubMed não ganha um segundo botão do PubMed');
ok(!href(h(Object.assign({}, jcem, { pmid: '12ab' })), 'pubmed'), '(2) PMID malformado não vira link');
// (3) fora do escopo
ok(h({ tipo: 'Aviso', link: 'https://www.endocrino.org.br/' }) === '', '(3) aviso escrito pelo professor (sem auto) não ganha o botão');
ok(h(Object.assign({}, wiley, { link: 'javascript:alert(1)' })) === '' && h(Object.assign({}, wiley, { link: '' })) === '', '(3) link que não é http(s) não vira botão');
ok(h(Object.assign({}, wiley, { auto: 'true' })) === '', '(3) só auto === true (booleano, como no banco)');
// (4) escape
const ruim = h(Object.assign({}, wiley, { link: 'https://x.org/a"><img src=x onerror=alert(1)>' }));
ok(!/<img/.test(ruim) && !/"><img/.test(ruim), '(4) o endereço não saiu escapado: ' + ruim);
// Endereço que o URL() recusa (host inválido) volta cru de muralLinkLimpo: o esc tem de segurar.
const cru = h(Object.assign({}, wiley, { link: 'https://[x"><img src=x onerror=alert(1)>' }));
ok(cru && !/<img/.test(cru) && /&quot;&gt;&lt;img/.test(cru), '(4) endereço recusado pelo URL() não saiu escapado: ' + cru);
// (5) posição no card vivo e aba nova
const card = corpo('muralNoticeCardHTML');
ok(/\+'<div class="mural-date">'\+dateBR\(a\.at\)\+'<\/div>'\n\s*\+muralLinkArtigoHTML\(a\)\n/.test(card), '(5) o botão não vem logo depois da data no card vivo');
ok(/target="_blank" rel="noopener noreferrer"/.test(h(wiley)) && (h(jcem).match(/target="_blank" rel="noopener noreferrer"/g) || []).length === 2, '(5) os links não abrem em aba nova com noopener');
ok(/muralNoticeCardHTML\(a,false\)/.test(SRC) && /muralNoticeCardHTML\(a,true\)/.test(SRC), '(5) o card vivo deixou de ser o do aluno e o do professor');
// (6) alvo de toque
ok(/\.mural-art-link a\{display:inline-flex;align-items:center;gap:\.35rem;min-height:34px/.test(SRC), '(6) o botão do artigo perdeu a altura mínima de toque');

if (falhas.length) { console.error('test-mural-link-artigo: ' + falhas.length + ' falha(s)'); falhas.forEach((f) => console.error('  ✗ ' + f)); process.exit(1); }
console.log('test-mural-link-artigo: ok (botão do artigo em todo post do radar, PubMed com PMID, sem marcas de feed, escapado, logo depois da data)');
