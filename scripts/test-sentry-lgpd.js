// Sentry no index.html (20/11/2026): só o erro técnico sai do aparelho do aluno.
//
// O bloco do Sentry no <head> recolhe os erros de JavaScript do site e do app do iPhone. A
// limpeza que ele faz antes de enviar é a garantia de LGPD (ver o comentário no index.html e
// cofre/Integrações.md). Este teste roda o próprio script do bloco numa caixa de areia e confere:
//  - sem IP, sem usuário, sem cookies, sem corpo; dos cabeçalhos, só o User-Agent;
//  - endereço sem ?consulta e sem #fragmento (o retorno do login traz código/token ali);
//  - e-mail no texto do erro vira [e-mail]; trilha sem console; clique sem valor de atributo;
//  - teto de 25 envios por carregamento; sem DSN ou fora do nosso domínio, nada é iniciado;
//  - o pacote do SDK existe em vendor/ na versão que o <script> pede.
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

let bad = 0;
const ok = (nome, cond, det) => { if (cond) return; bad++; console.log('  ✗ ' + nome + (det ? ' — ' + det : '')); };

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const ini = html.indexOf('<!-- 🛰️ SENTRY');
ok('bloco do Sentry no <head>', ini > 0 && ini < html.indexOf('</head>'));
const trecho = html.slice(ini, html.indexOf('</script>', ini));
const codigo = trecho.slice(trecho.indexOf('<script>') + 8);
const tag = (html.slice(ini).match(/<script src="\/vendor\/(sentry-[\d.]+\.min\.js)" defer onload="window\.__endoSentryInit&&window\.__endoSentryInit\(\)"><\/script>/) || [])[1];
ok('<script> do SDK com defer e onload', !!tag);
ok('pacote do SDK em vendor/', !!tag && fs.existsSync(path.join(__dirname, '..', 'vendor', tag)), tag);
ok('nenhum SDK do Sentry vindo de CDN de terceiro', !/sentry-cdn\.com|@sentry\/browser@/.test(html));
const dsn = (codigo.match(/var DSN = '([^']*)';/) || [])[1];
ok('DSN declarado', dsn !== undefined);
ok('DSN vazio ou da região UE (de.sentry.io)', dsn === '' || /^https:\/\/[0-9a-f]+@o\d+\.ingest\.de\.sentry\.io\/\d+$/.test(dsn || ''), dsn);

function caixa(host, busca, ua, comDsn) {
  const ouvintes = {};
  const w = { addEventListener: (t, f) => { ouvintes[t] = f; } };
  const loc = { hostname: host, search: busca, href: 'https://' + host + '/' + busca + '#access_token=SEGREDO' };
  const ctx = { window: w, location: loc, navigator: { userAgent: ua }, URL, console };
  vm.createContext(ctx);
  vm.runInContext(comDsn ? codigo.replace("var DSN = '" + dsn + "';", "var DSN = 'https://abc@o1.ingest.de.sentry.io/2';") : codigo, ctx);
  const chamadas = { init: null, capturados: [], mensagens: [] };
  w.Sentry = { init: (o) => { chamadas.init = o; }, captureException: (e) => chamadas.capturados.push(e), captureMessage: (m) => chamadas.mensagens.push(m) };
  return { w, ouvintes, chamadas };
}

// 1. Opções do init (DSN de teste, domínio de produção, app do iPhone).
{
  const c = caixa('www.endodirect.com.br', '?app=ios', 'Mozilla/5.0 EndodirectApp/1.2 (ios)', true);
  c.ouvintes.error({ error: new Error('antes do SDK') });
  c.w.__endoSentryInit();
  const o = c.chamadas.init || {};
  const dc = o.dataCollection || {};
  ok('init chamado com DSN em endodirect.com.br', !!c.chamadas.init);
  ok('sem IP nem usuário (userInfo:false)', dc.userInfo === false);
  ok('sem cookies, corpo, consulta nem variáveis', dc.cookies === false && Array.isArray(dc.httpBodies) && dc.httpBodies.length === 0 && dc.urlQueryParams === false && dc.stackFrameVariables === false);
  ok('cabeçalhos: só o User-Agent na ida, nada na volta', JSON.stringify(dc.httpHeaders) === JSON.stringify({ request: { allow: ['User-Agent'] }, response: false }));
  ok('mensagem real do erro de rede não é alterada', o.enhanceFetchErrorMessages === 'report-only');
  ok('beforeSend e beforeBreadcrumb ligados', typeof o.beforeSend === 'function' && typeof o.beforeBreadcrumb === 'function');
  ok('tag do app do iPhone', o.initialScope && o.initialScope.tags && o.initialScope.tags.plataforma === 'app-ios');
  ok('ambiente produção', o.environment === 'producao');
  ok('erro anterior ao SDK sai no init', c.chamadas.capturados.length === 1 && c.chamadas.capturados[0].message === 'antes do SDK');

  const ev = {
    user: { id: 'u1', email: 'a@b.com', ip_address: '{{auto}}' },
    request: { url: 'https://www.endodirect.com.br/?app=ios&code=SEGREDO#access_token=SEGREDO', headers: { 'User-Agent': 'UA', Referer: 'https://x/?t=SEGREDO', Cookie: 'sb=SEGREDO' } },
    message: 'falhou para aluno@exemplo.com',
    exception: { values: [{ value: 'erro de cedo@exemplo.com', stacktrace: { frames: [{ filename: 'https://www.endodirect.com.br/?code=SEGREDO', abs_path: 'https://www.endodirect.com.br/?code=SEGREDO#x' }] } }] },
    breadcrumbs: [
      { category: 'console', message: 'paciente Maria da Silva' },
      { category: 'ui.click', message: 'button#bt[title="Paciente Maria da Silva"].x' },
      { category: 'fetch', data: { url: 'https://p.supabase.co/rest/v1/t?email=eq.a@b.com&token=SEGREDO' } },
      { category: 'navigation', data: { from: '/?code=SEGREDO', to: '/#access_token=SEGREDO' } },
    ],
  };
  const out = o.beforeSend(JSON.parse(JSON.stringify(ev)));
  const s = JSON.stringify(out);
  ok('nada de SEGREDO, e-mail, nome do paciente, cookie ou referer', !/SEGREDO|@exemplo\.com|a@b\.com|Maria da Silva|Cookie|Referer/.test(s), s.slice(0, 300));
  ok('sem login: nenhum usuário', !('user' in out));
  ok('endereço sem consulta nem fragmento', out.request.url === 'https://www.endodirect.com.br/');
  ok('User-Agent mantido', out.request.headers && out.request.headers['User-Agent'] === 'UA');
  ok('e-mail vira [e-mail]', out.message === 'falhou para [e-mail]' && out.exception.values[0].value === 'erro de [e-mail]');
  ok('quadros da pilha sem consulta', out.exception.values[0].stacktrace.frames[0].filename === 'https://www.endodirect.com.br/');
  ok('trilha sem console', !out.breadcrumbs.some((b) => b.category === 'console'));
  ok('clique sem valor de atributo', out.breadcrumbs.some((b) => b.message === 'button#bt.x'));
  ok('rede sem consulta', out.breadcrumbs.some((b) => b.data && b.data.url === 'https://p.supabase.co/rest/v1/t'));
  ok('beforeBreadcrumb descarta o console', o.beforeBreadcrumb({ category: 'console', message: 'x' }) === null);

  let enviados = 0;
  for (let i = 0; i < 40; i++) if (o.beforeSend({ message: 'laço' })) enviados++;
  ok('teto de 25 envios por carregamento', enviados === 24, enviados + ' (1 já foi acima)');
}
// 1b. Link de teste de ponta a ponta (?sentry-teste=1) manda uma mensagem; sem ele, nada.
{
  const c = caixa('www.endodirect.com.br', '?sentry-teste=1', 'Mozilla/5.0', true);
  c.w.__endoSentryInit();
  ok('?sentry-teste=1 manda a mensagem de teste', c.chamadas.mensagens.length === 1 && /navegador/.test(c.chamadas.mensagens[0]));
  const d = caixa('www.endodirect.com.br', '?app=ios', 'Mozilla/5.0 EndodirectApp/1.2 (ios)', true);
  d.w.__endoSentryInit();
  ok('sem o parâmetro, nenhuma mensagem de teste', d.chamadas.mensagens.length === 0);
}
// 1c. Com login (25/11/2026): só o código interno da conta (uuid), nunca e-mail, nome ou IP.
{
  const c = caixa('www.endodirect.com.br', '', 'Mozilla/5.0', true);
  c.w.__endoSentryInit();
  const o = c.chamadas.init || {};
  const ev = { user: { id: 'u1', email: 'a@b.com', ip_address: '{{auto}}' }, message: 'falhou', request: { url: 'https://www.endodirect.com.br/' } };
  c.w.currentUser = { id: '2F1E6C1A-9B7D-4C3E-8A5F-0123456789AB', email: 'aluno@exemplo.com', name: 'Maria da Silva' };
  const comConta = o.beforeSend(JSON.parse(JSON.stringify(ev)));
  ok('com login: user só com o código interno da conta (uuid, minúsculo)', JSON.stringify(comConta.user) === JSON.stringify({ id: '2f1e6c1a-9b7d-4c3e-8a5f-0123456789ab' }), JSON.stringify(comConta.user));
  ok('com login: nada de e-mail, nome ou IP no evento', !/@exemplo\.com|a@b\.com|Maria da Silva|ip_address/.test(JSON.stringify(comConta)));
  c.w.currentUser = { id: 'demo', email: 'x@y.z' };
  ok('conta de demonstração (id que não é uuid): nenhum usuário', !('user' in o.beforeSend(JSON.parse(JSON.stringify(ev)))));
  c.w.currentUser = null;
}
// 2. Sem DSN: não inicia, e a fila é descartada.
{
  const c = caixa('www.endodirect.com.br', '', 'Mozilla/5.0', false);
  c.ouvintes.error({ error: new Error('x') });
  c.w.__endoSentryInit();
  if (dsn === '') ok('sem DSN não inicia', c.chamadas.init === null && c.chamadas.capturados.length === 0);
}
// 3. Fora do nosso domínio (cópia do site, localhost): não inicia.
{
  const c = caixa('copia-do-site.com', '', 'Mozilla/5.0', true);
  c.w.__endoSentryInit();
  ok('fora de endodirect.com.br / vercel.app não inicia', c.chamadas.init === null);
  const d = caixa('endodirect-git-x.vercel.app', '', 'Mozilla/5.0', true);
  d.w.__endoSentryInit();
  ok('prévia da Vercel inicia como "previa" e "web"', d.chamadas.init && d.chamadas.init.environment === 'previa' && d.chamadas.init.initialScope.tags.plataforma === 'web');
}

if (bad) { console.log(bad + ' falha(s) no teste do Sentry.'); process.exit(1); }
console.log('ok — Sentry: só o erro técnico sai do aparelho (sem IP, e-mail, token nem dado de paciente)');
