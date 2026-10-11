// Regressão: o mural mostra o título do artigo em PORTUGUÊS, sem perder o original.
//
// Pedido do professor em 11/10/2026, olhando o mural: "Vamos deixar os títulos
// dos artigos em português". O radar grava o título do PubMed/feed em `titulo`
// (inglês) e passou a gravar a tradução em `titulo_pt`, gerada pela mesma chamada
// de IA que escreve o resumo. O ORIGINAL continua sendo a chave de tudo (dedup
// contra o PubMed e os feeds, radar_hidden, favoritos, newsletter), por isso nunca
// é substituído: o que muda é só o que se lê.
//
// O que este teste prende:
//   1) `muralTitulo` prefere `titulo_pt` e cai no `titulo`; o original aparece numa
//      linha discreta só quando há tradução diferente;
//   2) os três cards do mural (aluno, painel e avisos) usam o helper no <h3> e o
//      favorito guarda o título exibido;
//   3) o editor inline tem o campo do título em português e o save o grava;
//   4) o radar pede `tituloPt` à IA (artigo, feed de revista e sociedade) e grava
//      `titulo_pt` no item, vazio quando a IA repete o original;
//   5) a newsletter e o push usam o título em português quando existe.
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const raiz = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(raiz, 'index.html'), 'utf8');
const falhas = [];
const ok = (cond, msg) => { if (!cond) falhas.push(msg); };

// ── 1. helpers ────────────────────────────────────────────────────────────────
function trecho(nome) {
  const i = html.indexOf('function ' + nome + '(');
  if (i < 0) { falhas.push('não achei function ' + nome); return ''; }
  const j = html.indexOf('\nfunction ', i + 1);
  return html.slice(i, j < 0 ? undefined : j);
}
const ctx = vm.createContext({});
// Cada recorte termina na linha anterior à próxima `function` — que pode ser um
// comentário; o '\n' entre eles impede que o comentário engula a função seguinte.
vm.runInContext(['function esc(s){return String(s==null?"":s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");}', trecho('muralTitulo'), trecho('muralTituloOriginalHTML')].join('\n'), ctx);
const run = (c) => vm.runInContext(c, ctx);
ok(run('muralTitulo({titulo:"Title in English",titulo_pt:"Título em português"})') === 'Título em português', 'muralTitulo não prefere titulo_pt');
ok(run('muralTitulo({titulo:"Title in English"})') === 'Title in English', 'muralTitulo não cai no título original sem tradução');
ok(run('muralTitulo({titulo:"Title in English",titulo_pt:"  "})') === 'Title in English', 'titulo_pt em branco tem de cair no original');
ok(/Title in English/.test(run('muralTituloOriginalHTML({titulo:"Title in English",titulo_pt:"Título em português"})')), 'o original não aparece na linha discreta');
ok(run('muralTituloOriginalHTML({titulo:"Mesmo",titulo_pt:"Mesmo"})') === '' && run('muralTituloOriginalHTML({titulo:"Só original"})') === '', 'a linha do original tem de sumir sem tradução ou quando é igual');
ok(/&lt;b&gt;/.test(run('muralTituloOriginalHTML({titulo:"<b>x</b>",titulo_pt:"y"})')), 'o original tem de sair escapado');

// ── 2. os três cards e o favorito ─────────────────────────────────────────────
const h3 = html.split("'<h3>'+esc(muralTitulo(a)||'Aviso aos alunos')+'</h3>'+muralTituloOriginalHTML(a)").length - 1;
ok(h3 === 3, 'esperava os 3 cards do mural com muralTitulo no <h3>, achei ' + h3);
ok(!/'<h3>'\+esc\(a\.titulo\|\|'Aviso aos alunos'\)/.test(html), 'ainda há card desenhando a.titulo direto no <h3>');
ok(/data-fav-tit="'\+esc\(muralTitulo\(a\)\)\+'"/.test(html), 'o favorito do mural tem de guardar o título exibido');
ok(/\.mural-title-orig\{/.test(html), 'falta o CSS da linha do título original');

// ── 3. editor inline ──────────────────────────────────────────────────────────
ok(/id="mural-inline-titulo-pt"/.test(html), 'o editor inline não tem o campo do título em português');
ok(/titulo_pt:\(\(document\.getElementById\('mural-inline-titulo-pt'\)\|\|\{\}\)\.value\|\|''\)\.trim\(\)/.test(html), 'o save do editor inline não grava titulo_pt');
ok(/var titulo=muralTitulo\(av\);/.test(html) && /var _bnTitulo=muralTitulo\(updatedAv\);/.test(html), 'o push do botão Notificar tem de usar o título exibido');

// ── 4. radar ──────────────────────────────────────────────────────────────────
const radarSrc = fs.readFileSync(path.join(raiz, 'lib', 'radar.js'), 'utf8');
ok((radarSrc.match(/"tituloPt":"<o titulo/g) || []).length === 2, 'o radar tem de pedir tituloPt à IA no artigo/feed E no comunicado de sociedade');
ok((radarSrc.match(/titulo_pt: tituloPtDe\(ai, /g) || []).length === 3, 'o radar tem de gravar titulo_pt nos três montadores (PubMed, feed de revista, sociedade)');
const radar = require(path.join(raiz, 'lib', 'radar.js'));
ok(radar.tituloPtDe({ tituloPt: '  Título  em  português ' }, 'Title') === 'Título em português', 'tituloPtDe não normaliza espaços');
ok(radar.tituloPtDe({ tituloPt: 'Mesmo Título' }, 'mesmo título') === '', 'tituloPtDe tem de devolver vazio quando a IA repete o original');
ok(radar.tituloPtDe(null, 'x') === '', 'tituloPtDe sem IA tem de devolver vazio');
(async () => {
  const fetchOriginal = global.fetch;
  global.fetch = async () => ({ ok: true, json: async () => ({ content: [{ type: 'text', text: JSON.stringify({ semAbstract: false, tituloPt: 'Título traduzido', tipo: 'Ensaio clínico randomizado', subespecialidade: 'Diabetes', tipoMural: 'Ensaio Clínico', resumo: 'Resumo.', porque: 'Na prática.', cautela: 'Cautela.' }) }] }) });
  let item = null;
  try { item = await radar.buildMuralItem({ title: 'Original title', journal: 'JCEM', studyType: '', subespecialidade: 'Diabetes', abstract: 'abstract', link: 'https://pubmed.ncbi.nlm.nih.gov/1/', pmid: '1', publicationDate: '2026 Oct 10' }, 'chave-falsa'); }
  catch (e) { falhas.push('buildMuralItem lançou: ' + (e && e.message)); }
  finally { global.fetch = fetchOriginal; }
  ok(item && item.titulo === 'Original title' && item.titulo_pt === 'Título traduzido', 'buildMuralItem tem de manter o título original e gravar titulo_pt: ' + JSON.stringify(item && { titulo: item.titulo, titulo_pt: item.titulo_pt }));

  // ── 5. newsletter e push ──────────────────────────────────────────────────
  const nl = require(path.join(raiz, 'lib', 'newsletter.js'));
  const itens = nl.muralItems({ radar_avisos: [{ titulo: 'EN title', titulo_pt: 'Título PT', texto: '📝 Resumo: r\n💡 Na prática: p', link: 'https://x/1', fonte: 'JCEM' }] });
  ok(itens.length === 1 && itens[0].titulo_pt === 'Título PT' && itens[0].titulo === 'EN title', 'muralItems da newsletter não carrega titulo_pt');
  const emailHtml = nl.renderEmail(itens, 'a@b.c', 'https://x/unsub', null);
  const iPt = emailHtml.indexOf('Título PT'), iEn = emailHtml.indexOf('EN title');
  ok(iPt >= 0 && iEn > iPt, 'o e-mail tem de mostrar o título em português e o original logo abaixo');
  const push = require(path.join(raiz, 'lib', 'push-breaking.js'));
  ok(push.mensagemPush({ titulo: 'EN', titulo_pt: 'PT' }).body === 'PT' && push.mensagemPush({ titulo: 'EN' }).body === 'EN', 'o push tem de usar o título em português quando existe');

  if (falhas.length) { console.error('✗ títulos do mural em português:'); falhas.forEach((f) => console.error('  - ' + f)); process.exit(1); }
  console.log('✓ mural: título em português exibido, original preservado como chave, radar/newsletter/push alinhados');
})();
