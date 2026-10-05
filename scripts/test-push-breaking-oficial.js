// O RADAR NOTIFICA SOZINHO AS BREAKING NEWS DE FONTE OFICIAL — E SÓ ELAS, UMA POR DIA.
//
// Decisão do professor (05/10/2026), entre "manual", "oficial" e "todas": oficial.
// Até então o radar nunca disparava push; só o botão 📲 do card e a caixa do
// editor (25/09). Medido: ~1 breaking por semana, 2 de fonte oficial em 8 semanas.
//
// 🧨 O QUE ESTE TESTE PRENDE: (1) só `breaking` + `isBreakingTrusted` (feed
// oficial ou origem na allowlist), (2) só no PRIMEIRO aparecimento (`fresh`),
// nunca o que já estava gravado, (3) teto de um por dia civil de Brasília, com a
// marca `pushAutoAt` no próprio item (sem chave nova no payload), (4) item com
// mais de 7 dias não dispara, (5) envio falho ou recusado não marca, (6) o
// formato é o do botão do painel (corpo = título, link = mural), (7) a fiação:
// antes do save, marca no mesmo write, resultado exposto, e a mescla do radar
// preserva a marca quando o feed traz o item de novo.
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const RAIZ = path.join(__dirname, '..');
const { escolherBreakingParaPush, pushBreakingOficial, mensagemPush, diaBRT, PUBLICACAO_MAX_MS } = require(path.join(RAIZ, 'lib', 'push-breaking.js'));
const { isBreakingTrusted } = require(path.join(RAIZ, 'lib', 'news.js'));
const falhas = [];
const ok = (c, m) => { if (!c) falhas.push(m); };

const H = 3600000, DIA = 86400000;
// 05/10/2026 10:30 BRT = 13:30 UTC
const AGORA = Date.UTC(2026, 9, 5, 13, 30, 0);
const oficial = (extra) => Object.assign({ titulo: 'FDA aprova X para Y', breaking: true, official: true, fonte: 'FDA', sourceId: 'fda:x', link: 'https://www.fda.gov/x', at: AGORA - 2 * H, tipo: 'Comunicado' }, extra || {});
const naoOficial = (extra) => Object.assign({ titulo: 'Blog: lançamento de Z', breaking: true, official: false, fonte: 'Google News', sourceId: 'gn:z', link: 'https://exemplo.com/z', sourceUrl: 'https://blog-qualquer.com/z', at: AGORA - 1 * H, tipo: 'Comunicado' }, extra || {});
const artigo = (extra) => Object.assign({ titulo: 'Ensaio clínico sobre W', breaking: false, fonte: 'NEJM', sourceId: 'pm:1', link: 'https://pubmed/1', at: AGORA - 1 * H, tipo: 'Artigo' }, extra || {});

(async function () {
  // ── 1. Quem dispara ───────────────────────────────────────────────────────
  ok(isBreakingTrusted(oficial()) === true && isBreakingTrusted(naoOficial()) === false, 'premissa: a allowlist de lib/news.js distingue oficial de não oficial');
  {
    const e = escolherBreakingParaPush([oficial(), naoOficial(), artigo()], [oficial(), naoOficial(), artigo()], AGORA);
    ok(e.item && e.item.sourceId === 'fda:x', 'escolhe a Breaking News OFICIAL que entrou neste run');
  }
  ok(escolherBreakingParaPush([naoOficial(), artigo()], [], AGORA).item === null, 'não oficial e artigo comum não disparam');
  ok(escolherBreakingParaPush([], [oficial()], AGORA).item === null, '🧨 o que JÁ ESTAVA gravado (sem ser fresh) não dispara — só o primeiro aparecimento');
  ok(escolherBreakingParaPush([oficial({ pushAutoAt: AGORA - 3 * DIA })], [], AGORA).item === null, 'item já notificado (marca) não dispara de novo');
  ok(escolherBreakingParaPush([oficial({ at: AGORA - 8 * DIA })], [], AGORA).item === null && PUBLICACAO_MAX_MS === 7 * DIA, 'publicado há mais de 7 dias (feed voltando de pane) não dispara');
  ok(escolherBreakingParaPush([oficial({ at: 0 })], [], AGORA).item !== null, 'sem data de publicação, dispara (a data é opcional no item)');
  {
    const velho = oficial({ sourceId: 'fda:velho', at: AGORA - 20 * H }), novo = oficial({ sourceId: 'fda:novo', at: AGORA - 1 * H });
    ok(escolherBreakingParaPush([velho, novo], [], AGORA).item.sourceId === 'fda:novo', 'dois oficiais no mesmo run: vai o mais recente (o outro fica para o botão do professor)');
  }
  // ── 2. Teto diário (dia civil de Brasília) ────────────────────────────────
  ok(diaBRT(Date.UTC(2026, 9, 5, 2, 0, 0)) === '2026-10-04' && diaBRT(Date.UTC(2026, 9, 5, 3, 30, 0)) === '2026-10-05', 'o dia é o de Brasília (UTC−3), não o UTC');
  {
    const jaHoje = [artigo({ pushAutoAt: AGORA - 2 * H })];
    const e = escolherBreakingParaPush([oficial()], jaHoje, AGORA);
    ok(e.item === null && /teto diário/.test(e.motivo), 'já houve push automático hoje → não dispara, e diz por quê');
    const ontem = [artigo({ pushAutoAt: AGORA - 20 * H })]; // 05/10 10:30 − 20h = 04/10 14:30 BRT
    ok(escolherBreakingParaPush([oficial()], ontem, AGORA).item !== null, 'push de ontem não conta no teto de hoje');
  }
  // ── 3. Mensagem no formato do botão do painel ─────────────────────────────
  {
    const m = mensagemPush(oficial(), 'https://www.endodirect.com.br/');
    ok(m.title === '🚨 Breaking News · FDA' && m.body === 'FDA aprova X para Y' && m.url === 'https://www.endodirect.com.br/#mural' && m.tag === 'endodirect-aviso', 'título com o órgão, corpo = título do item, link = mural, mesma tag do botão', m);
    ok(mensagemPush(oficial({ fonte: '', sourceName: '' })).url === 'https://www.endodirect.com.br/#mural' && mensagemPush(oficial({ fonte: '' })).title === '🚨 Breaking News', 'sem órgão e sem base: título simples e base padrão');
    ok(mensagemPush(oficial({ titulo: 'x'.repeat(500) })).body.length === 300, 'corpo limitado a 300 caracteres (limite do endpoint)');
  }
  // ── 4. Execução: envia, marca; falha não marca ────────────────────────────
  {
    const envios = [];
    const avisos = [oficial(), artigo()];
    const r = await pushBreakingOficial({ fresh: [avisos[0]], avisos, agora: AGORA, enviar: async (m) => { envios.push(m); return { ok: true, sent: 18, failed: 0 }; }, configurado: () => true });
    ok(r.sent === true && envios.length === 1 && envios[0].body === 'FDA aprova X para Y', 'envia uma vez, com o título do item no corpo');
    ok(r.avisos[0].pushAutoAt === AGORA && r.avisos[1].pushAutoAt === undefined, 'marca SÓ o item enviado, com a hora do envio');
    ok(avisos[0].pushAutoAt === undefined, 'não altera a lista original (devolve uma nova)');
    const r2 = await pushBreakingOficial({ fresh: [oficial({ sourceId: 'fda:2' })], avisos: r.avisos, agora: AGORA + H, enviar: async () => { throw new Error('não devia enviar'); }, configurado: () => true });
    ok(r2.sent === false && /teto diário/.test(r2.motivo), 'segundo oficial no mesmo dia: não envia (teto)');
  }
  {
    const r = await pushBreakingOficial({ fresh: [oficial()], avisos: [oficial()], agora: AGORA, enviar: async () => { throw new Error('rede'); }, configurado: () => true });
    ok(r.sent === false && /envio falhou: rede/.test(r.motivo) && !r.avisos[0].pushAutoAt, 'envio lançou: não marca (tenta de novo quando o item voltar como novo)');
    const r2 = await pushBreakingOficial({ fresh: [oficial()], avisos: [oficial()], agora: AGORA, enviar: async () => ({ ok: false, error: 'VAPID' }), configurado: () => true });
    ok(r2.sent === false && /envio recusado/.test(r2.motivo) && !r2.avisos[0].pushAutoAt, 'envio recusado: não marca');
    let chamado = false;
    const r3 = await pushBreakingOficial({ fresh: [oficial()], avisos: [oficial()], agora: AGORA, enviar: async () => { chamado = true; return { ok: true }; }, configurado: () => false });
    ok(r3.sent === false && !chamado && /VAPID/.test(r3.motivo), 'sem VAPID no servidor: não tenta enviar');
    const r4 = await pushBreakingOficial({ fresh: [], avisos: [], agora: AGORA, enviar: async () => { chamado = true; return { ok: true }; }, configurado: () => true });
    ok(r4.sent === false && !chamado, 'nada novo: não envia');
  }
  // ── 5. Fiação no radar ────────────────────────────────────────────────────
  {
    const radar = fs.readFileSync(path.join(RAIZ, 'lib', 'radar.js'), 'utf8');
    ok(/const \{ pushBreakingOficial \} = require\('\.\/push-breaking'\);/.test(radar) && /const push = require\('\.\/push'\);/.test(radar), 'radar.js importa o módulo e o push');
    const iCall = radar.indexOf('pushAuto = await pushBreakingOficial({'), iSave = radar.indexOf('await saveGlobalPayload(serviceKey, merged.payload);');
    ok(iCall > 0 && iSave > iCall, '🧨 o push roda ANTES do save do payload (a marca vai no mesmo write)');
    ok(/fresh: merged\.fresh, avisos: merged\.payload\.radar_avisos/.test(radar), 'candidatos = o que entrou neste run; lista = a mesclada que vai ao banco');
    ok(/enviar: \(m\) => push\.sendToAll\(m\), configurado: \(\) => push\.isConfigured\(\)/.test(radar), 'envia pelo sendToAll real, respeitando a configuração do VAPID');
    ok(/if \(pushAuto\.sent\) \{\s*merged\.payload = \{ \.\.\.merged\.payload, radar_avisos: pushAuto\.avisos \};/.test(radar), 'enviado → a lista marcada substitui a que vai ao banco');
    ok(/pushAuto: \{ sent: !!pushAuto\.sent, motivo: pushAuto\.motivo \|\| '', titulo: pushAuto\.item \? pushAuto\.item\.titulo : '' \}/.test(radar), 'o resultado do run expõe o que saiu (painel e log do cron)');
    const iTry = radar.indexOf('try {\n    pushAuto = await pushBreakingOficial(');
    ok(iTry > 0 && /catch \(e\) \{ console\.error\('\[radar\] push automático falhou:'/.test(radar), 'fail-safe: erro no push nunca derruba o radar');
    // A mescla preserva a marca quando o feed traz o MESMO item de novo (spread do item antes do replacement).
    const iMerge = radar.indexOf('function mergeMuralItems(');
    const corpo = radar.slice(iMerge, radar.indexOf('\n}\n', iMerge) + 3);
    const ctx = vm.createContext({ Date, Number, Map, Set, Array, String, Boolean, isBreakingTrusted, AUTO_ITEM_TTL_MS: 90 * DIA, MAX_MURAL_ITEMS: 500 });
    vm.runInContext(corpo, ctx);
    const antes = { radar_avisos: [oficial({ pushAutoAt: AGORA - H })], radar_hidden: [] };
    const depois = ctx.mergeMuralItems(antes, [oficial({ titulo: 'FDA aprova X para Y (atualizado)' })]);
    ok(depois.fresh.length === 0 && depois.payload.radar_avisos[0].pushAutoAt === AGORA - H && depois.payload.radar_avisos[0].titulo === 'FDA aprova X para Y (atualizado)', '🧨 mergeMuralItems: o item que volta pelo feed mantém a marca pushAutoAt (e não é "fresh" de novo)');
  }
  if (falhas.length) {
    console.error('test-push-breaking-oficial: ' + falhas.length + ' falha(s)');
    falhas.forEach((f) => console.error('  ✗ ' + f));
    process.exit(1);
  }
  console.log('test-push-breaking-oficial: ok (só oficial, só no primeiro aparecimento, um por dia, marca no item, formato do botão, fiação antes do save)');
})().catch((e) => { console.error(e); process.exit(1); });
