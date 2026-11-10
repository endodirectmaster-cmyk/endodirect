#!/usr/bin/env node
// BREAKING NEWS: A DATA QUE VALE É A DO EVENTO, NÃO A DO FEED (10/11/2026).
//
// O feed oficial da FDA republicou em 09/11, com <pubDate> novo, duas páginas de 2024:
// "FDA approves selpercatinib for RET fusion-positive thyroid cancer" (12/06/2024) e a
// do carcinoma medular (27/09/2024). O filtro só olhava o <pubDate>, a IA escreveu
// "Em 12 de junho de 2024" no resumo e marcou como breaking mesmo assim, e o item virou
// o push automático das 07:45. O professor recebeu e perguntou: "É de hoje mesmo?".
//
// 🧨 OS MODOS DE QUEBRAR ISTO:
//  - voltar a filtrar só por `isRecent` (data do feed);
//  - tirar a data de hoje e a janela do pedido à IA (ela não sabe que dia é hoje);
//  - o push conferir só `at` e não a data do evento.
'use strict';
const fs = require('fs');
const path = require('path');
const RAIZ = path.join(__dirname, '..');
const news = require(path.join(RAIZ, 'lib', 'news.js'));
const { escolherBreakingParaPush } = require(path.join(RAIZ, 'lib', 'push-breaking.js'));

let bad = 0;
const ok = (nome, cond, det) => { if (cond) return; bad++; console.log('  ✗ ' + nome + (det ? ' — ' + det : '')); };
const DIA = 86400000;
const AGORA = Date.UTC(2026, 10, 10, 10, 45);
const iso = (ms) => (ms ? new Date(ms).toISOString().slice(0, 10) : '(sem data)');

// ---- 1. leitura da data no texto -------------------------------------------------------
const casos = [
  ['On June 12, 2024, the Food and Drug Administration granted traditional approval to selpercatinib (Retevmo, Eli Lilly and Company). Selpercatinib received accelerated approval for this indication in 2020.', '2024-06-12'],
  ['Em 12 de junho de 2024, o FDA concedeu aprovação tradicional ao selpercatinib', '2024-06-12'],
  ['On September 27, 2024, the Food and Drug Administration granted traditional approval', '2024-09-27'],
  ['Dec. 3rd, 2025 launch', '2025-12-03'],
  ['1º de março de 2025', '2025-03-01'],
  ['3 November 2026 — EMA recommends', '2026-11-03'],
  ['Lilly announces FDA approval of Mounjaro for heart failure', '(sem data)']
];
for (const [texto, esperado] of casos) {
  const lido = iso(news.dataDoEvento({ title: '', desc: texto }));
  ok('data do evento: "' + texto.slice(0, 40) + '…"', lido === esperado, 'leu ' + lido + ', esperado ' + esperado);
}
// A MAIS RECENTE das datas citadas: notícia nova que lembra a aprovação anterior continua nova.
ok('vale a data mais recente citada', iso(news.dataDoEvento({ title: '', desc: 'On November 9, 2026, FDA approved orforglipron. Tirzepatide was approved on May 13, 2022.' })) === '2026-11-09');
ok('🧨 a página de 2024 republicada é evento antigo', news.eventoAntigo({ title: 'FDA approves selpercatinib for RET fusion-positive thyroid cancer', desc: casos[0][0] }, AGORA, 30));
ok('notícia de ontem não é antiga', !news.eventoAntigo({ title: 'x', desc: 'On November 9, 2026, the FDA approved' }, AGORA, 30));
ok('sem data no texto não decide (fica com o feed e a IA)', !news.eventoAntigo({ title: 'Lilly announces FDA approval', desc: '' }, AGORA, 30));

// ---- 2. captação, IA e item gravado ----------------------------------------------------
const src = fs.readFileSync(path.join(RAIZ, 'lib', 'news.js'), 'utf8');
ok('🧨 a captação filtra pela data do evento, não só pela do feed',
  /if \(!isRelevant\(it\) \|\| !isRecent\(it\) \|\| eventoAntigo\(it, Date\.now\(\), NEWS_RECENT_DAYS\)\) return;/.test(src));
ok('🧨 a IA recebe a data de hoje e a janela', /Hoje e \$\{new Date\(\)\.toISOString\(\)\.slice\(0, 10\)\}\./.test(src) && /ocorrido nos ultimos \$\{NEWS_RECENT_DAYS\} dias\?/.test(src));
ok('a IA devolve a data do evento e página antiga republicada é breaking false',
  /"data_evento":"<AAAA-MM-DD/.test(src) && /pagina antiga republicada/.test(src));
ok('a data lida pela IA também passa pela janela',
  /const dIa = Date\.parse\(String\(obj\.data_evento \|\| ''\)\.slice\(0, 10\)\);/.test(src) && /if \(dIa > 0 && Date\.now\(\) - dIa > NEWS_RECENT_DAYS \* 86400000\) return \{ breaking: false \};/.test(src));
ok('o item gravado leva dataEvento', /dataEvento: dataDoEvento\(item\) \|\|/.test(src));

// ---- 3. push automático ----------------------------------------------------------------
// O item real do mural de 10/11/2026 (gravado antes da correção, sem dataEvento).
const selper = {
  titulo: 'FDA approves selpercatinib for RET fusion-positive thyroid cancer', breaking: true, official: true,
  fonte: 'FDA / Eli Lilly and Company', at: Date.UTC(2026, 10, 9, 21, 48, 6), sourceId: 'news:selper',
  texto: '🏷️ Tipo: Lancamento/Aprovacao de medicamento\n📝 Resumo: Em 12 de junho de 2024, o FDA concedeu aprovação tradicional ao selpercatinib (Retevmo, Eli Lilly) para pacientes adultos e pediátricos a partir de 2 anos com câncer de tireoide avançado ou metastático com fusão do gene RET.'
};
const novo = { titulo: 'FDA approves orforglipron for obesity', breaking: true, official: true, fonte: 'FDA', at: Date.UTC(2026, 10, 9, 20, 0), sourceId: 'news:novo', texto: '📝 Resumo: O FDA aprovou o orforglipron para obesidade.' };
ok('🧨 o selpercatinibe de 2024 (feed de 09/11) não dispara push', escolherBreakingParaPush([selper], [], AGORA).item === null);
ok('com uma notícia nova junto, sai a nova', (escolherBreakingParaPush([selper, novo], [], AGORA).item || {}).sourceId === 'news:novo');
ok('dataEvento gravado manda (evento de 2024 → não dispara)', escolherBreakingParaPush([{ ...novo, dataEvento: Date.UTC(2024, 5, 12) }], [], AGORA).item === null);
ok('dataEvento de ontem dispara', (escolherBreakingParaPush([{ ...novo, dataEvento: AGORA - DIA }], [], AGORA).item || {}).sourceId === 'news:novo');
ok('item sem data no texto segue disparando (sem regressão)', (escolherBreakingParaPush([novo], [], AGORA).item || {}).sourceId === 'news:novo');

if (bad) { console.log('\n' + bad + ' falha(s): data do evento nas Breaking News'); process.exit(1); }
console.log('breaking news: data do evento lida no texto, na IA e no push: ok');
