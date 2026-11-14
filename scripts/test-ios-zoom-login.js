// IPHONE: O ZOOM QUE O SISTEMA FAZ AO DIGITAR NÃO PODE FICAR PRESO DEPOIS DO LOGIN.
//
// 🧨 POR QUE ESTE TESTE EXISTE (14/11/2026). Print do professor no app de testes do iPhone,
// logo depois de entrar na conta alunopro: a tela ~5% maior e cortada à direita ("fica assim
// desconfigurado"); fechando e abrindo o app, voltava ao normal. É o iOS: tocar num campo com
// letra abaixo de 16 px AMPLIA a página, e o sistema não desfaz ao terminar. O login usava
// .95rem (15,2 px). Travar o zoom (maximum-scale fixo) não serve: tiraria a pinça do
// ampliador de figuras. Então: login a 16 px e, ao sair do campo e ao entrar no app, um
// `maximum-scale=1` de um instante que devolve a 1× e some.
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const falhas = [];
const ok = (c, m) => { if (!c) falhas.push(m); };
function corpo(nome) {
  const i = html.indexOf('function ' + nome + '(');
  if (i < 0) throw new Error('função ausente no index.html: ' + nome);
  let j = html.indexOf('{', i), n = 0;
  for (let k = j; k < html.length; k++) {
    if (html[k] === '{') n++;
    else if (html[k] === '}') { n--; if (!n) return html.slice(i, k + 1); }
  }
  throw new Error('chaves não fecham em ' + nome);
}

// ── 1. Os campos do login têm 16 px (abaixo disso o iPhone amplia ao tocar) ──
{
  const m = html.match(/\.login-body \.fld input\{[^}]*font-size:([^;]+);/);
  ok(m && m[1] === '16px', '🧨 os campos do login voltaram a ter letra abaixo de 16 px (' + (m && m[1]) + ') — o iPhone amplia a tela ao digitar e o zoom fica');
}

// ── 2. iosDesfazZoom: maximum-scale=1 por um instante e volta ao original ──
{
  const attrs = { content: 'width=device-width, initial-scale=1.0, viewport-fit=cover' };
  const meta = { getAttribute: (k) => (k in attrs ? attrs[k] : null), setAttribute: (k, v) => { attrs[k] = String(v); } };
  const timers = [];
  const cx = { IOS_TOQUE: true, document: { querySelector: (s) => (/viewport/.test(s) ? meta : null) }, setTimeout: (f) => timers.push(f), RegExp };
  vm.createContext(cx);
  vm.runInContext(corpo('iosDesfazZoom'), cx);
  cx.iosDesfazZoom();
  ok(/maximum-scale=1/.test(attrs.content), '🧨 iosDesfazZoom não força a volta a 1× (sem maximum-scale=1 por um instante)');
  timers.forEach((f) => f());
  ok(attrs.content === 'width=device-width, initial-scale=1.0, viewport-fit=cover',
    '🧨 depois de desfazer o zoom o viewport não voltou ao original — a pinça das figuras ficaria travada: ' + attrs.content);
  cx.iosDesfazZoom(); timers.forEach((f) => f());
  ok(attrs.content === 'width=device-width, initial-scale=1.0, viewport-fit=cover', '⚠️ chamar duas vezes acumulou maximum-scale no viewport');
  cx.IOS_TOQUE = false; const antes = attrs.content; cx.iosDesfazZoom();
  ok(attrs.content === antes, '⚠️ fora do iPhone/iPad o viewport foi mexido');
}

// ── 3. Ligações: ao entrar no app e ao sair de um campo ──
ok(/iosDesfazZoom\(\)/.test(corpo('startApp')), '🧨 entrar no app não desfaz mais o zoom deixado pelo login');
ok(/addEventListener\('focusout'[^]*?iosDesfazZoom\(\)/.test(html), '🧨 sair de um campo (teclado fechando) não desfaz mais o zoom');
ok(/<meta name="viewport" content="width=device-width, initial-scale=1\.0, viewport-fit=cover">/.test(html),
  '⚠️ o viewport fixo mudou — se ganhou maximum-scale, a pinça do ampliador de figuras morre no app');

if (falhas.length) { console.error('✗ ' + falhas.length + ' falha(s):\n - ' + falhas.join('\n - ')); process.exit(1); }
console.log('✓ iPhone: login a 16 px e o zoom de digitação desfeito ao sair do campo e ao entrar (a pinça segue livre)');
