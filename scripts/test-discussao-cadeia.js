// Cadeia de discussões do Mural: ordem do disparo, estrangulamento e gatilhos.
//
// O defeito que este teste existe para pegar é de ORDEM, não de lógica. Na
// primeira versão da cadeia, cada invocação gerava a discussão (~40s) e SÓ
// ENTÃO disparava a próxima. No plano da Vercel o teto real de execução é 60s:
// se a geração passasse do teto, a função morria com a próxima nunca disparada
// e a fila parava sem erro, sem log e sem discussão — exatamente o sintoma que
// o professor relatou cinco vezes. Disparar ANTES de gerar é o que sustenta a
// cadeia; trocar as duas linhas de lugar volta a quebrar tudo em silêncio.
//
// O segundo defeito: o recurso dependia de o navegador do professor já ter o
// JavaScript novo. Por isso a partida pega carona em /api/checkout/config, que
// o pacote ANTIGO também chama. Se essa carona sumir, o recurso volta a depender
// de cache de navegador.
'use strict';
const fs = require('fs');
const path = require('path');

let bad = 0;
const ok = (nome, cond, det) => { if (cond) return; bad++; console.log('  ✗ ' + nome + (det ? ' — ' + det : '')); };

const raiz = path.join(__dirname, '..');
const lerSemComentarios = (p) => fs.readFileSync(path.join(raiz, p), 'utf8').replace(/^\s*\/\/.*$/gm, '');

// ---- 1. ⚠️ O DISPARO DA PRÓXIMA VEM ANTES DA GERAÇÃO ------------------------
{
  const src = lerSemComentarios('api/admin/refresh-radar.js');
  const i = src.indexOf("action === 'discussao_cadeia'");
  ok('o ramo discussao_cadeia existe', i > 0);
  const bloco = src.slice(i, i + 2000);
  const iDisparo = bloco.indexOf('dispararCadeia(');
  const iGeracao = bloco.indexOf('gerarDiscussaoDoMural(');
  ok('a cadeia dispara a próxima', iDisparo > 0);
  ok('a cadeia gera a discussão', iGeracao > 0);
  ok('o disparo da próxima vem ANTES da geração', iDisparo > 0 && iGeracao > 0 && iDisparo < iGeracao,
     'disparo em ' + iDisparo + ', geração em ' + iGeracao);
  ok('a lista do que falta é passada adiante (não recalculada)', /dispararCadeia\(\s*\{\s*ids:/.test(bloco));
  ok('o lote da partida tem teto', /LOTE_CADEIA\s*=\s*[1-9]/.test(src));
  ok('não regera artigo que já tem discussão', /jaTemDiscussao\(/.test(bloco));
}

// ---- 2. um só lugar sabe disparar -------------------------------------------
// Havia três cópias da mesma função em api/ (refresh-radar + os dois crons).
['api/admin/refresh-radar.js', 'api/cron/endocrine-radar.js', 'api/cron/healthcheck.js', 'api/checkout/config.js'].forEach((p) => {
  const src = lerSemComentarios(p);
  ok(p + ' não tem cópia própria do disparo', src.indexOf("action: 'discussao_cadeia'") < 0 && src.indexOf('action":"discussao_cadeia') < 0);
});
['api/cron/endocrine-radar.js', 'api/cron/healthcheck.js'].forEach((p) => {
  ok(p + ' dá a partida pela lib', /require\('\.\.\/\.\.\/lib\/discussao-kick'\)/.test(lerSemComentarios(p)) && /dispararCadeia\(\)/.test(lerSemComentarios(p)));
});

// ---- 3. ⚠️ A CARONA NA ROTA QUE O PACOTE ANTIGO JÁ CHAMA --------------------
{
  const cfg = lerSemComentarios('api/checkout/config.js');
  ok('/api/checkout/config dá a partida', /kickSeNecessario\(\)/.test(cfg));
  ok('a partida não derruba o config', /catch/.test(cfg.slice(cfg.indexOf('kickSeNecessario'))));
  const html = fs.readFileSync(path.join(raiz, 'index.html'), 'utf8');
  ok('o index.html chama /api/checkout/config em toda carga', html.indexOf("fetch('/api/checkout/config')") > 0);
}

// ---- 4. estrangulamento (função pura) ---------------------------------------
{
  const { deveKickar } = require('../lib/discussao-kick');
  const J = 10 * 60 * 1000;
  const agora = 1_000_000_000;
  ok('sem histórico nenhum, dispara', deveKickar(0, 0, agora, J) === true);
  ok('esta instância disparou há 1 min, não dispara', deveKickar(agora - 60_000, 0, agora, J) === false);
  ok('esta instância disparou há 11 min, dispara', deveKickar(agora - 11 * 60_000, 0, agora, J) === true);
  // Escrita recente = alguma cadeia está andando agora (grava a cada ~40s).
  ok('cadeia andando (escrita há 2 min), não dispara', deveKickar(0, agora - 2 * 60_000, agora, J) === false);
  ok('escrita há 30 min, dispara', deveKickar(0, agora - 30 * 60_000, agora, J) === true);
}

// ---- 5. o disparo de fato monta a requisição certa --------------------------
async function testeDoDisparo() {
  process.env.CRON_SECRET = 'segredo-de-teste';
  process.env.PUBLIC_BASE_URL = 'https://app.teste';
  process.env.SUPABASE_URL = 'https://db.teste';
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'chave-de-teste';
  delete require.cache[require.resolve('../lib/discussao-kick.js')];
  const kick = require('../lib/discussao-kick.js');

  const chamadas = [];
  const fetchOriginal = global.fetch;
  let escritaEm = new Date(Date.now() - 60 * 60 * 1000).toISOString(); // 1h atrás
  global.fetch = async (url, opts) => {
    chamadas.push({ url: String(url), opts: opts || {} });
    if (String(url).indexOf('endodirect_mural_discussoes') >= 0) {
      return { ok: true, json: async () => [{ updated_at: escritaEm }] };
    }
    return { ok: true, json: async () => ({ ok: true }) };
  };

  const posts = () => chamadas.filter((c) => c.url.indexOf('/api/admin/refresh-radar') >= 0);

  try {
    await kick.dispararCadeia({ ids: ['a', 'b'] });
    const p = posts()[0];
    ok('dispara por POST', !!p && p.opts.method === 'POST');
    ok('autentica com o CRON_SECRET', !!p && p.opts.headers.Authorization === 'Bearer segredo-de-teste');
    const body = p ? JSON.parse(p.opts.body) : {};
    ok('manda a action da cadeia', body.action === 'discussao_cadeia');
    ok('manda a lista do que falta', JSON.stringify(body.ids) === '["a","b"]');

    chamadas.length = 0;
    const r1 = await kick.kickSeNecessario();
    ok('com escrita antiga, dá a partida', r1 === true && posts().length === 1);

    chamadas.length = 0;
    const r2 = await kick.kickSeNecessario();
    ok('segunda carga de página na mesma janela não dispara', r2 === false && posts().length === 0);
    ok('e nem consulta o banco', chamadas.length === 0);

    // Instância nova (cold start) com uma cadeia andando: não dá partida dupla.
    delete require.cache[require.resolve('../lib/discussao-kick.js')];
    const kick2 = require('../lib/discussao-kick.js');
    escritaEm = new Date(Date.now() - 60 * 1000).toISOString(); // 1 min atrás
    chamadas.length = 0;
    const r3 = await kick2.kickSeNecessario();
    ok('cadeia andando: instância nova não dá partida dupla', r3 === false && posts().length === 0);

    // Sem CRON_SECRET não há como autenticar servidor-a-servidor: não dispara.
    delete process.env.CRON_SECRET;
    delete require.cache[require.resolve('../lib/discussao-kick.js')];
    const kick3 = require('../lib/discussao-kick.js');
    chamadas.length = 0;
    ok('sem CRON_SECRET, não dispara', (await kick3.kickSeNecessario()) === false && chamadas.length === 0);
  } finally {
    global.fetch = fetchOriginal;
  }
}

testeDoDisparo().then(function () {
  console.log(bad ? '\nFALHOU: ' + bad : '\n✓ cadeia de discussões: disparo antes da geração, lote com teto, carona no /api/checkout/config, estrangulamento de 10 min');
  process.exit(bad ? 1 : 0);
}, function (e) {
  console.log('  ✗ exceção no teste do disparo — ' + ((e && e.stack) || e));
  process.exit(1);
});
