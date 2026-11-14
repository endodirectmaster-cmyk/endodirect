#!/usr/bin/env node
// PODCASTS: DESCRIÇÃO EM PARÁGRAFOS E JUSTIFICADA (14/11/2026).
//
// Print do professor na aba Podcasts (FD 106, 107 e 108): "Deixar em modo justificado. As frases
// ficaram todas juntas. Separar em parágrafos." O feed do Spotify manda a descrição em HTML (<p>,
// <br>); a importação tirava as tags SEM pôr quebra ("endodirect.com.brReferencias:Davies") e
// cortava em 500 caracteres no meio da palavra ("2026-2.Eri").
//
// 🧨 Os modos de quebrar isto em silêncio:
//  - a importação voltar a colar os parágrafos ou a cortar em 500 no meio da palavra;
//  - a atualização diária reescrever uma descrição editada à mão pelo professor;
//  - a tela voltar a mostrar a descrição corrida, colada na data, sem justificar;
//  - a descrição antiga (já gravada colada) continuar ilegível até a próxima importação.
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const pod = require('../lib/podcasts');
const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
let bad = 0;
const ok = (n, c, d) => { if (!c) { bad++; console.log('  ✗ ' + n + (d ? ' — ' + d : '')); } };
function corpo(nome) {
  const i = html.indexOf('function ' + nome + '(');
  if (i < 0) return '';
  let j = html.indexOf('{', i), n = 0;
  for (; j < html.length; j++) { if (html[j] === '{') n++; else if (html[j] === '}') { n--; if (!n) break; } }
  return html.slice(i, j + 1);
}

// ── 1. Importação do feed ────────────────────────────────────────────────────────────────
const refs = Array.from({ length: 30 }, (_, i) => '<p>Autor ' + i + ' et al., Revista Exemplo de Endocrinologia ' + (1990 + i) + '.</p>').join('');
const xml = '<rss><channel><title>Endodirect</title><item><title>FD 107 - Metformina</title>'
  + '<enclosure url="https://exemplo/fd107.mp3" type="audio/mpeg"/><pubDate>Thu, 29 Oct 2026 10:00:00 GMT</pubDate>'
  + '<description><![CDATA[<p>Neste FD discutimos o SMARTEST trial. Siga @endodirect e acesse: endodirect.com.br</p><p>Referencias:</p>'
  + '<p>Davies MJ, et al. Management of Type 2 Diabetes, 2026.<br>Sociedade Brasileira de Diabetes. Diretriz SBD 2026.</p>' + refs + ']]></description></item>'
  + '<item><title>FD 106</title><enclosure url="https://exemplo/fd106.mp3"/><description>&lt;p&gt;Hipoglicemia artefatual.&lt;/p&gt;&lt;p&gt;Acesse: endodirect.com.br&lt;/p&gt;</description></item>'
  + '</channel></rss>';
const eps = pod.parseFeed(xml).episodes;
const d107 = eps[0].desc;
ok('🧨 cada <p>/<br> do feed vira quebra de linha (nada colado)', /endodirect\.com\.br\nReferencias:\nDavies MJ/.test(d107) && /2026\.\nSociedade/.test(d107), JSON.stringify(d107.slice(0, 200)));
ok('🧨 sem o corte em 500 caracteres: as referências chegam (até ~2.000)', d107.length > 500 && /Autor 29 et al\./.test(d107), String(d107.length));
ok('HTML escapado no feed (&lt;p&gt;) também vira parágrafo', eps[1].desc === 'Hipoglicemia artefatual.\nAcesse: endodirect.com.br', JSON.stringify(eps[1].desc));
const longo = pod.descTexto('<p>' + 'palavra '.repeat(400) + '</p>');
ok('descrição enorme é cortada numa palavra inteira, com "…"', longo.length <= 2001 && /palavra…$/.test(longo), JSON.stringify(longo.slice(-20)));

// ── 2. Atualização diária: conserta a descrição colada, não mexe na editada ─────────────
const velhos = [
  { title: 'FD 107 - Metformina', tipo: 'rss', audio: 'https://exemplo/fd107.mp3', desc: 'Neste FD discutimos o SMARTEST trial. Siga @endodirect e acesse: endodirect.com.brReferencias:Davies MJ, et al. Management of Type 2 Diabetes, 2026.Sociedade Brasileira de Diabetes. Diretriz SBD 2026.Autor 0 et al., Revista Exemplo de Endocrinologia 1990.Autor 1 et al., Rev' },
  { title: 'FD 106', tipo: 'rss', audio: 'https://exemplo/fd106.mp3', desc: 'Texto que o professor reescreveu à mão.' },
  { title: 'Spotify manual', tipo: 'spotify', src: 'https://open.spotify.com/episode/x', desc: 'Hipoglicemia artefatual.Acesse' },
];
const m = pod.mergePodcasts(velhos, eps, '');
ok('🧨 a descrição colada (e cortada) do episódio do feed ganha os parágrafos completos', m.updated === 1 && m.podcasts[0].desc === d107, JSON.stringify(m.podcasts[0].desc.slice(0, 120)));
ok('🧨 descrição editada à mão NÃO é reescrita', m.podcasts[1].desc === 'Texto que o professor reescreveu à mão.');
ok('episódio que não veio do feed não muda; nenhum episódio novo duplicado', m.podcasts[2].desc === 'Hipoglicemia artefatual.Acesse' && m.added === 0 && m.podcasts.length === 3);
const ent = pod.mergePodcasts([{ title: 'FD 1', tipo: 'rss', audio: 'https://exemplo/fd1.mp3', desc: 'Siga.&nbsp;Minutagem:Caso (01:00)Revisão &amp; meta' }],
  [{ title: 'FD 1', audio: 'https://exemplo/fd1.mp3', desc: 'Siga.\nMinutagem:\n• Caso (01:00)\n• Revisão & meta' }], '');
ok('🧨 o texto antigo com &nbsp;, &amp; e sem os "•" das listas conta como o mesmo texto (62 descrições cortadas no print)', ent.updated === 1, JSON.stringify(ent.podcasts[0].desc));
ok('a atualização diária grava quando só a descrição mudou', /merged\.added > 0 \|\| merged\.updated > 0/.test(fs.readFileSync(path.join(__dirname, '..', 'lib', 'podcasts.js'), 'utf8')));
ok('o "Importar episódios" do painel usa a mesma regra (mesmo texto sem as quebras)', /_semEsp\(nova\)\.indexOf\(_semEsp\(velha\)\)!==0/.test(html) && /if\(added\|\|atualizados\)persistPodcasts\(\);/.test(html));

// ── 3. A tela do aluno ───────────────────────────────────────────────────────────────────
const ctx = {};
vm.createContext(ctx);
vm.runInContext(['esc', 'podDescParagrafos', 'podDescHTML'].map(corpo).join('\n'), ctx);
const antigo107 = 'Neste FD discutimos sobre o uso da metformina no tratamento do diabetes tipo 2, as recomendações das atuais diretrizes de tratamento (SBD, ADA/EASD) e o mais recente estudo - SMARTEST trial. Siga @endodirect e acesse: endodirect.com.brReferencias:Davies MJ, et al. Management of Type 2 Diabetes, 2026: A Consensus Report by ADA/EASD. Diabetes Care. 2026. DOI: 10.2337/dci26-0141.Sociedade Brasileira de Diabetes. Manejo do Diabetes Mellitus Tipo 2. Diretriz SBD 2026.';
const antigo106 = 'Neste FD vamos discutir sobre um tema frequente na prática clínica hospitalar: quando a glicemia capilar vem falsamente baixa, também conhecido como hipoglicemia artefatual.Acesse: endodirect.com.br e siga @endodirectReferencias:Cryer et al., J Clin Endocrinol Metab 2009Sacks et al., Clin Chem 2023Gambino et al., Clin Chem 2009';
const p107 = ctx.podDescParagrafos(antigo107), p106 = ctx.podDescParagrafos(antigo106);
ok('🧨 descrição já gravada colada (FD 107 do print) sai em parágrafos', p107.length === 4 && /^Referencias:$/.test(p107[1]) && /^Davies MJ/.test(p107[2]) && /^Sociedade Brasileira/.test(p107[3]), JSON.stringify(p107));
ok('🧨 FD 106 do print: "artefatual." / "Acesse:" / "Referencias:" / uma referência por linha', p106.length === 6 && /artefatual\.$/.test(p106[0]) && /^Acesse:/.test(p106[1]) && /@endodirect$/.test(p106[1]) && /^Cryer .* 2009$/.test(p106[3]) && /^Sacks .* 2023$/.test(p106[4]), JSON.stringify(p106));
ok('não quebra endereço nem "et al."', ctx.podDescParagrafos('Acesse: endodirect.com.br e siga. Davies MJ, et al. Diabetes Care.').length === 1);
ok('descrição nova (com quebras) é respeitada como veio', ctx.podDescParagrafos('A.\nB\n\nC').length === 3);
const h = ctx.podDescHTML(antigo107);
ok('cada parágrafo num <p>, "Referências:" como título', /^<div class="pod-desc"><p>Neste FD/.test(h) && /<p class="pod-desc-ref">Referencias:<\/p>/.test(h), h.slice(0, 160));
ok('texto escapado (sem HTML do feed na tela)', ctx.podDescHTML('<b>x</b>').indexOf('<b>') < 0);
ok('🧨 a lista de podcasts usa podDescHTML, fora da linha da data', /'<\/div>'\+podDescHTML\(p\.desc\)\+podcastPlayerHTML\(p\)/.test(corpo('renderPodcasts')) && !/\+esc\(p\.desc\|\|''\)\+'<\/div>'/.test(corpo('renderPodcasts')));
ok('🧨 justificado (com hifenização), parágrafos separados', /\.pod-desc\{[^}]*text-align:justify[^}]*hyphens:auto/.test(html) && /\.pod-desc p\{margin:0 0 \.4rem\}/.test(html));

if (bad) { console.log('✗ podcasts (descrição): ' + bad + ' falha(s)'); process.exit(1); }
console.log('✓ podcasts: descrição do feed em parágrafos, justificada, e a já gravada consertada sem tocar na editada');
