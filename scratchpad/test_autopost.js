// autoPostDailyQotd: a trava de 1x/dia tem de ser DERIVADA de ig_stories.
//
// O bug que este teste existe para pegar (aconteceu em 2026-07-27): o cron
// promoveu a questão e gravou; o save do painel desfez a promoção mas a trava
// `qotd_autopost_date` sobreviveu (está na lista de chaves preservadas do
// servidor). O cron seguinte leu a trava, achou que já tinha postado e o dia
// passou em branco.
'use strict';
const fs = require('fs');
const SRC = fs.readFileSync('/home/user/endodirect/lib/instagram.js', 'utf8');

// Extrai SÓ brtParts + autoPostDailyQotd (o resto do arquivo já declara
// loadPayload/savePayload/serviceKey de verdade e colidiria com os dublês).
const trecho = (ini, fim) => SRC.slice(SRC.indexOf(ini), SRC.indexOf(fim));
const corpo = trecho('function brtParts', '// Ferramentas da plataforma')
  + '\n' + trecho('async function autoPostDailyQotd', '\nmodule.exports');
let bad = 0;
const ok = (nome, cond, det) => { if (cond) return; bad++; console.log('  ✗ ' + nome + (det ? ' — ' + det : '')); };

const DIA = 86400000;
function montar(payload) {
  let salvo = null;
  const fns = new Function('estado', 'onSave', `
    ${corpo.replace(/async function autoPostDailyQotd/, 'async function _auto')}
    const serviceKey = () => 'k';
    const loadPayload = async () => JSON.parse(JSON.stringify(estado));
    const savePayload = async (k, p) => { onSave(p); };
    return _auto;
  `);
  return { rodar: fns(payload, (p) => { salvo = p; }), get salvo() { return salvo; } };
}

// ---- 1. fila com item novo → posta -----------------------------------------
(async () => {
  const agora = Date.UTC(2026, 6, 28, 13, 0); // 13h UTC = 10h BRT
  let h = montar({ ig_stories: [{ id: 'a', status: 'queued' }] });
  let r = await h.rodar(new Date(agora));
  ok('posta quando há item na fila', r.posted === true, JSON.stringify(r));
  ok('carimba postedAt', h.salvo && h.salvo.ig_stories[0].postedAt > 0);

  // ---- 2. já postada HOJE → não posta de novo -------------------------------
  h = montar({ ig_stories: [
    { id: 'a', status: 'posted', postedAt: agora - 3600000 }, // hoje, 1h atrás
    { id: 'b', status: 'queued' }
  ] });
  r = await h.rodar(new Date(agora));
  ok('não posta 2 no mesmo dia', r.posted === false && r.reason === 'already_posted_today', JSON.stringify(r));

  // ---- 3. postada ONTEM → posta a de hoje -----------------------------------
  h = montar({ ig_stories: [
    { id: 'a', status: 'posted', postedAt: agora - DIA },
    { id: 'b', status: 'queued' }
  ] });
  r = await h.rodar(new Date(agora));
  ok('posta de novo no dia seguinte', r.posted === true && r.id === 'b', JSON.stringify(r));

  // ---- 4. O CASO DO BUG ------------------------------------------------------
  // A trava antiga diz que já postou hoje, mas ig_stories mostra que a promoção
  // foi desfeita (nada com postedAt de hoje). Tem de REPOR.
  h = montar({
    qotd_autopost_date: '2026-07-28',           // trava velha sobreviveu ao clobber
    ig_stories: [
      { id: 'a', status: 'posted', postedAt: agora - DIA }, // a de ontem
      { id: 'b', status: 'queued' }                          // a de hoje voltou p/ fila
    ]
  });
  r = await h.rodar(new Date(agora));
  ok('REPÕE quando o clobber desfez a postagem (trava velha ignorada)',
     r.posted === true && r.id === 'b', JSON.stringify(r));

  // ---- 5. fila vazia ---------------------------------------------------------
  h = montar({ ig_stories: [{ id: 'a', status: 'posted', postedAt: agora - DIA }] });
  r = await h.rodar(new Date(agora));
  ok('avisa fila vazia', r.posted === false && r.reason === 'queue_empty', JSON.stringify(r));

  // ---- 6. item reaberto com postedAt ANTIGO é recarimbado --------------------
  // Sem isto a trava derivada nunca enxergaria a postagem de hoje.
  // (o carimbo usa Date.now() real — o `now` injetado só alimenta o brtParts)
  const antigo = agora - 5 * DIA;
  h = montar({ ig_stories: [{ id: 'a', status: 'queued', postedAt: antigo }] });
  const t0 = Date.now();
  r = await h.rodar(new Date(agora));
  const carimbo = h.salvo && h.salvo.ig_stories[0].postedAt;
  ok('recarimba postedAt de item reaberto', r.posted === true
     && carimbo !== antigo && carimbo >= t0 && carimbo <= Date.now(),
     'antigo=' + antigo + ' novo=' + carimbo);

  console.log(bad ? '\nFALHOU: ' + bad : '\n✓ autopost da Questão do Dia: trava derivada de ig_stories');
  process.exit(bad ? 1 : 0);
})();
