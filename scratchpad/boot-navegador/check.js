// Carrega o index.html em Chromium REAL e mede se o app BOOTA — A/B contra a main.
//
// POR QUE ISTO EXISTE: o cofre registra dois apagões (2026-06) em que o
// `ci-validate` (parse) e um sandbox `vm` PASSARAM e mesmo assim a plataforma
// ficou sem NENHUM botão funcionando em navegador real. A regra que ficou:
// mudança de JS no index.html só entra depois de abrir o preview da Vercel em
// navegador real. Como o proxy deste ambiente não alcança vercel.app, o
// substituto é o mesmo harness contra a `main` e contra o branch — diferença
// entre os dois é culpa do meu diff.
//
// ⚠️ DUAS ARMADILHAS QUE JÁ ME FIZERAM LER UM FALSO APAGÃO:
//  1. Os <script src> de CDN são BLOQUEANTES e aqui o proxy os PENDURA (não
//     recusa). Sem interceptar, o parser para no primeiro e nenhum bloco inline
//     roda — os dois lados medem "zero" e parece que o app não sobe.
//  2. O app inteiro (13.398 linhas, l.2552–15950) é uma IIFE com 'use strict'.
//     As funções NÃO viram propriedades de window, então `typeof goPanel` é
//     'undefined' mesmo com tudo funcionando. Sondar window é medir nada.
//
// A SONDA QUE PRESTA: a última linha do bloco grande liga um listener em
// `#fb-submit`. Se esse listener existe, as 13.398 linhas executaram até o fim —
// que é exatamente o que o apagão quebrava.
'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require(process.env.PLAYWRIGHT_CORE || 'playwright-core');

// main/ e branch/ recebem cada um um index.html (ver README.md ao lado).
const RAIZ = process.env.AB_DIR || __dirname;

// ⚠️⚠️ ESTE HARNESS JÁ APROVOU UM DEPLOY MEDINDO UM RETRATO DE TRÊS DIAS ATRÁS
// (09/08/2026). Ele NÃO copia nada: lê o que estiver em `main/` e `branch/`. Se
// o AB_DIR sobrou de uma rodada anterior, ele roda feliz, imprime "OK" e não
// mediu o diff nenhum — o pior falso verde possível, porque é justamente o
// portão que existe para pegar apagão. Só percebi porque o `maiorScript` do
// branch veio idêntico ao da rodada anterior depois de eu ter somado ~800
// caracteres ao index.html.
// A partir daqui o harness CONFERE que `branch/index.html` é byte a byte o
// index.html da árvore de trabalho, e recusa rodar se não for.
(function conferirFrescor() {
  const doBranch = path.join(RAIZ, 'branch', 'index.html');
  const daArvore = path.join(__dirname, '..', '..', 'index.html');
  let a, b;
  try { a = fs.readFileSync(daArvore); } catch (e) { return; } // fora do repo: não dá para conferir
  try { b = fs.readFileSync(doBranch); } catch (e) {
    console.error(`\n✗ ${doBranch} não existe.\n  Popule antes de medir:\n`
      + `    rm -rf ${RAIZ} && mkdir -p ${RAIZ}/main ${RAIZ}/branch\n`
      + `    git show origin/main:index.html > ${RAIZ}/main/index.html\n`
      + `    cp index.html ${RAIZ}/branch/index.html`);
    process.exit(2);
  }
  if (!a.equals(b)) {
    console.error(`\n✗ RETRATO VELHO: ${doBranch} (${b.length} bytes) difere do index.html da árvore `
      + `(${a.length} bytes). O harness mediria uma versão que você não está entregando.\n`
      + `  Refaça:  cp index.html ${doBranch}`);
    process.exit(2);
  }
})();
const CHROME = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
// Últimos elementos ligados pelo bloco grande, na ordem em que ele os liga.
// `fb-submit` é o ÚLTIMO de todos: se ele tem listener, nada antes abortou.
const SONDAS = ['fb-submit', 'fb-cancel', 'btn-send-chat', 'btn-clear-chat'];

function serve(dir, port) {
  return new Promise((res) => {
    const s = http.createServer((req, r) => {
      const p = path.join(dir, req.url === '/' ? 'index.html' : req.url.split('?')[0]);
      fs.readFile(p, (e, b) => {
        if (e) { r.statusCode = 404; return r.end('nao encontrado'); }
        r.setHeader('Content-Type', p.endsWith('.html') ? 'text/html; charset=utf-8' : 'application/javascript');
        r.end(b);
      });
    });
    s.listen(port, '127.0.0.1', () => res(s));
  });
}

async function ouvintes(cdp, id) {
  const { result } = await cdp.send('Runtime.evaluate', { expression: `document.getElementById(${JSON.stringify(id)})` });
  if (!result || !result.objectId) return -1;   // elemento nem existe
  const { listeners } = await cdp.send('DOMDebugger.getEventListeners', { objectId: result.objectId });
  return (listeners || []).filter((l) => l.type === 'click' || l.type === 'keydown').length;
}

async function medir(browser, url, rotulo) {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  const pageerrors = [];
  page.on('pageerror', (e) => pageerrors.push(String((e && e.message) || e).slice(0, 200)));

  // Armadilha 1: stub imediato para tudo que não é o servidor local.
  await page.route('**', (route) => {
    const u = route.request().url();
    if (u.startsWith('http://127.0.0.1:')) return route.continue();
    return route.fulfill({ status: 200, contentType: 'application/javascript', body: '/* stub offline */' });
  });

  await page.goto(url, { waitUntil: 'load', timeout: 60000 });
  await page.waitForTimeout(3500);

  const cdp = await ctx.newCDPSession(page);
  await cdp.send('DOM.enable');
  await cdp.send('Runtime.enable');
  const bind = {};
  for (const id of SONDAS) bind[id] = await ouvintes(cdp, id);

  const dom = await page.evaluate(() => ({
    nodes: document.querySelectorAll('*').length,
    botoes: document.querySelectorAll('button').length,
    // ⚠️ CONTAR BOTÃO DIZ QUE ALGO SUMIU, NÃO O QUÊ. Em 30/08/2026 o harness
    // reprovou "4 botões a menos" numa mudança que removia 4 botões DE
    // PROPÓSITO (a geração por IA saiu do painel do aluno). Contagem sozinha só
    // deixa a escolha entre desligar a guarda e ignorá-la — as duas ruins.
    // Com os RÓTULOS, a diferença é legível e a remoção pode ser declarada.
    rotulos: [...document.querySelectorAll('button')].map((x) => (x.textContent || '').trim().slice(0, 40)),
    scripts: document.scripts.length,
    maiorScript: Math.max.apply(null, Array.from(document.scripts).map((s) => (s.textContent || '').length)),
    corpoAlto: !!document.body && document.body.getBoundingClientRect().height > 100
  }));

  await ctx.close();
  return { rotulo, ...dom, bind, pageerrors };
}

(async () => {
  const sA = await serve(path.join(RAIZ, 'main'), 8801);
  const sB = await serve(path.join(RAIZ, 'branch'), 8802);
  const browser = await chromium.launch({ executablePath: CHROME, args: ['--no-sandbox'] });

  const a = await medir(browser, 'http://127.0.0.1:8801/', 'main');
  const b = await medir(browser, 'http://127.0.0.1:8802/', 'branch');

  await browser.close(); sA.close(); sB.close();

  const linha = (x) => `${x.rotulo.padEnd(7)} nodes=${x.nodes} botoes=${x.botoes} scripts=${x.scripts} maiorScript=${x.maiorScript} corpoAlto=${x.corpoAlto} pageerrors=${x.pageerrors.length} listeners=${JSON.stringify(x.bind)}`;
  console.log(linha(a));
  console.log(linha(b));
  if (a.pageerrors.length) console.log('  main pageerrors:', a.pageerrors);
  if (b.pageerrors.length) console.log('  branch pageerrors:', b.pageerrors);

  const p = [];
  if (b.bind['fb-submit'] < 1) p.push('#fb-submit sem listener no branch — o bloco grande NAO chegou ao fim (apagao)');
  SONDAS.forEach((id) => { if (b.bind[id] < a.bind[id]) p.push(`#${id}: ${b.bind[id]} listener(s) no branch vs ${a.bind[id]} na main`); });
  if (b.pageerrors.length > a.pageerrors.length) p.push('pageerrors novos no branch: ' + JSON.stringify(b.pageerrors));
  // Botões que existiam na main e sumiram no branch, por rótulo. Renomear um
  // botão some com o rótulo antigo e cria o novo: por isso a conta é por
  // diferença de multiconjunto, e um rótulo que reaparece com outro nome não
  // vira alarme falso enquanto o TOTAL não cair.
  const conta = (xs) => xs.reduce((m, x) => (m[x] = (m[x] || 0) + 1, m), {});
  const ca = conta(a.rotulos || []), cb = conta(b.rotulos || []);
  const sumiram = [];
  Object.keys(ca).forEach((k) => { for (let i = 0; i < ca[k] - (cb[k] || 0); i++) sumiram.push(k); });
  if (sumiram.length) console.log('  botoes que sumiram no branch: ' + JSON.stringify(sumiram));
  // Remoção INTENCIONAL se declara: REMOCOES_ESPERADAS="rótulo|rótulo".
  // Declarar é barato; sumir sem querer é o apagão. Um rótulo declarado que NÃO
  // sumiu também reprova — declaração velha esconderia a próxima perda de vista.
  const declarados = String(process.env.REMOCOES_ESPERADAS || '').split('|').map((x) => x.trim()).filter(Boolean);
  const naoDeclarados = sumiram.filter((k) => !declarados.some((d) => k.indexOf(d) >= 0));
  const semEfeito = declarados.filter((d) => !sumiram.some((k) => k.indexOf(d) >= 0));
  if (naoDeclarados.length) p.push('botoes sumiram SEM declaracao: ' + JSON.stringify(naoDeclarados)
    + ' (se for de proposito, rode com REMOCOES_ESPERADAS="' + naoDeclarados.join('|') + '")');
  if (semEfeito.length) p.push('REMOCOES_ESPERADAS lista botao que NAO sumiu: ' + JSON.stringify(semEfeito)
    + ' — declaracao velha esconde a proxima perda');
  if (!b.corpoAlto) p.push('corpo do branch nao renderizou');

  if (p.length) { console.error('\nREPROVADO:\n- ' + p.join('\n- ')); process.exit(1); }
  console.log('\nOK — em navegador real o branch executa o bloco grande ate a ULTIMA linha (listener de #fb-submit ligado),');
  console.log('   com os mesmos numeros da main e nenhum pageerror novo.');
})().catch((e) => { console.error('erro no harness:', e); process.exit(2); });
