// LOGIN COM GOOGLE NO APP DO IPHONE: abre no navegador do sistema e volta ao app.
//
// ⚠️ POR QUE ESTE TESTE EXISTE (30/10/2026). O Google recusa login dentro da
// janela embutida de um app (WKWebView: "disallowed_useragent"). No app do
// iPhone (Capacitor, pasta app-ios/), o startGoogleOAuth pede ao Supabase só o
// endereço do login (skipBrowserRedirect), abre esse endereço no navegador do
// sistema (plugin Browser) e espera a volta por
// br.com.endodirect.app://login-callback#access_token=…&refresh_token=…, que
// vira sessão pelo setSession.
//
// 🧨 O QUE NÃO PODE QUEBRAR. O site (navegador e PWA) e o app do Android seguem
// no redirect de sempre: qualquer desvio ali derruba o login de todos os
// alunos. E as quatro pontas do app têm de concordar entre si: o endereço de
// retorno no index.html, o esquema registrado no Info.plist, os plugins no
// package.json e a marca do app no user agent. Uma divergência não dá erro em
// lugar nenhum: o login só não volta para o app.
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const RAIZ = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(RAIZ, 'index.html'), 'utf8');
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
// Uma promessa que nunca resolve faz o Node sair com código 0 no meio do teste.
let terminou = false;
process.on('exit', (code) => {
  if (!terminou && code === 0) { console.error('test-login-google-app-ios: o teste parou no meio'); process.exitCode = 1; }
});
const esvazia = () => new Promise((r) => setImmediate(r));

const mRetorno = /var APP_IOS_RETORNO_LOGIN='([^']+)';/.exec(html);
if (!mRetorno) { console.error('test-login-google-app-ios: APP_IOS_RETORNO_LOGIN ausente do index.html'); process.exit(1); }
const RETORNO = mRetorno[1];
const URL_LOGIN = 'https://auth.endodirect.com.br/auth/v1/authorize?provider=google&redirect_to=x';

// O código do site roda num IIFE com 'use strict': o teste roda igual.
const FONTE = [
  "'use strict';",
  mRetorno[0],
  "var retornoLoginAppFeito='';",
  'var loggingOut=true;',
  ...['authBaseURL', 'appNativoIOS', 'pluginNativo', 'lerRetornoLoginApp', 'tratarRetornoLoginApp', 'iniciarRetornoLoginApp', 'startGoogleOAuth'].map(corpo),
].join('\n');

// Monta a página: `plataforma` é null (site), 'ios' ou 'android'; `plugins`, os
// plugins que o app injeta em Capacitor.Plugins.
function pagina(opts) {
  opts = opts || {};
  const reg = { oauth: [], abriu: [], fechou: 0, sessoes: [], erros: [], limpou: 0, ouvintes: [] };
  const client = {
    auth: {
      signInWithOAuth(o) {
        reg.oauth.push(o);
        if (opts.oauthErro) return Promise.resolve({ data: { provider: 'google', url: null }, error: { message: opts.oauthErro } });
        return Promise.resolve({ data: { provider: 'google', url: URL_LOGIN }, error: null });
      },
      setSession(s) {
        reg.sessoes.push(s);
        if (opts.sessaoErro) return Promise.resolve({ data: { session: null }, error: { message: opts.sessaoErro } });
        return Promise.resolve({ data: { session: { user: { id: 'u1' } } }, error: null });
      },
    },
  };
  const Plugins = {};
  const plugins = opts.plugins || [];
  if (plugins.indexOf('Browser') >= 0) {
    Plugins.Browser = {
      open(o) { reg.abriu.push(o); return Promise.resolve(); },
      close() { reg.fechou++; return Promise.reject(new Error('No active window to close!')); },
    };
  }
  if (plugins.indexOf('App') >= 0) {
    Plugins.App = { addListener(ev, cb) { reg.ouvintes.push({ ev, cb }); return { remove() {} }; } };
  }
  const win = {};
  if (opts.plataforma) {
    win.Capacitor = {
      isNativePlatform: () => true,
      getPlatform: () => opts.plataforma,
      isPluginAvailable: (n) => Object.prototype.hasOwnProperty.call(Plugins, n),
      Plugins,
    };
  }
  const ctx = {
    window: win,
    location: { hostname: 'www.endodirect.com.br', origin: 'https://www.endodirect.com.br' },
    URLSearchParams,
    console: { warn() {}, log() {} },
    getSupabaseClient: () => client,
    showLoginError: (m) => reg.erros.push(String(m)),
    clearLoginError: () => { reg.limpou++; },
  };
  vm.createContext(ctx);
  vm.runInContext(FONTE, ctx);
  return { ctx, reg };
}

const WEB_OPCOES = JSON.stringify({ provider: 'google', options: { redirectTo: 'https://www.endodirect.com.br/', queryParams: { prompt: 'select_account' } } });
const TOKENS = RETORNO + '#access_token=AT1&expires_at=1&expires_in=3600&provider_token=pt&refresh_token=RT1&token_type=bearer';

(async () => {
  // ── 1. 🧨 O SITE NÃO MUDA: redirect de sempre, nenhum plugin tocado ───────
  {
    const casos = [
      ['site (navegador e PWA)', {}],
      ['app do Android', { plataforma: 'android', plugins: ['Browser', 'App'] }],
      ['iPhone sem o plugin Browser', { plataforma: 'ios', plugins: ['App'] }],
    ];
    for (const [nome, o] of casos) {
      const { ctx, reg } = pagina(o);
      ctx.startGoogleOAuth();
      await esvazia();
      ok(reg.oauth.length === 1 && JSON.stringify(reg.oauth[0]) === WEB_OPCOES,
        '🧨 ' + nome + ': o login com Google saiu do redirect de sempre — opções: ' + JSON.stringify(reg.oauth));
      ok(reg.abriu.length === 0, nome + ': abriu o navegador do app fora do iPhone');
      ok(reg.erros.length === 0, nome + ': mostrou erro no caminho normal: ' + reg.erros.join(' | '));
    }
  }

  // ── 2. NO IPHONE: pede só o endereço e abre no navegador do sistema ─────────
  {
    const { ctx, reg } = pagina({ plataforma: 'ios', plugins: ['Browser', 'App'] });
    ctx.startGoogleOAuth();
    await esvazia();
    const o = reg.oauth[0] || {};
    const op = o.options || {};
    ok(reg.oauth.length === 1 && o.provider === 'google', 'iPhone: não pediu o login do Google ao Supabase');
    ok(op.redirectTo === RETORNO, 'iPhone: o retorno não é o endereço do app (' + op.redirectTo + ')');
    ok(op.skipBrowserRedirect === true, '🧨 iPhone: sem skipBrowserRedirect o supabase-js navega a própria janela do app até o Google, que recusa o login');
    ok(op.queryParams && op.queryParams.prompt === 'select_account', 'iPhone: perdeu a escolha de conta do Google');
    ok(reg.abriu.length === 1 && reg.abriu[0].url === URL_LOGIN, 'iPhone: não abriu o endereço do login no navegador do sistema: ' + JSON.stringify(reg.abriu));
    ok(reg.limpou === 1 && reg.erros.length === 0, 'iPhone: o erro de uma tentativa anterior não foi limpo, ou apareceu erro à toa');
  }
  {
    const { ctx, reg } = pagina({ plataforma: 'ios', plugins: ['Browser'], oauthErro: 'provider is not enabled' });
    ctx.startGoogleOAuth();
    await esvazia();
    ok(reg.abriu.length === 0, 'iPhone: abriu o navegador mesmo com erro do Supabase');
    ok(reg.erros.length === 1 && /provider is not enabled/.test(reg.erros[0]), 'iPhone: o erro do Supabase não chegou à tela de login');
  }

  // ── 3. LEITURA DO RETORNO ──────────────────────────────────────────────────
  {
    const { ctx } = pagina({ plataforma: 'ios', plugins: ['Browser', 'App'] });
    const l = (u) => ctx.lerRetornoLoginApp(u);
    const t = l(TOKENS);
    ok(t && t.access_token === 'AT1' && t.refresh_token === 'RT1', 'retorno: não leu os tokens do "#": ' + JSON.stringify(t));
    const b = l(RETORNO + '/#access_token=A&refresh_token=R');
    ok(b && b.access_token === 'A' && b.refresh_token === 'R', 'retorno: não leu o endereço com barra no fim');
    const e = l(RETORNO + '?error=access_denied&error_code=403&error_description=O+usu%C3%A1rio+cancelou');
    ok(e && e.error === 'access_denied' && e.error_description === 'O usuário cancelou', 'retorno: não leu o erro do "?": ' + JSON.stringify(e));
    const e2 = l(RETORNO + '#error=server_error&error_description=Erro%20no%20Google');
    ok(e2 && e2.error_description === 'Erro no Google', 'retorno: não leu o erro do "#"');
    [
      'https://www.endodirect.com.br/#access_token=A&refresh_token=R',
      RETORNO + 'x#access_token=A&refresh_token=R',
      RETORNO.replace('login-callback', 'outra') + '#access_token=A&refresh_token=R',
      '', undefined, null,
    ].forEach((u) => ok(l(u) === null, 'retorno: aceitou um endereço que não é o retorno do login: ' + u));
  }

  // ── 4. O RETORNO VIRA SESSÃO (uma vez só) E FECHA O NAVEGADOR ─────────────
  {
    const { ctx, reg } = pagina({ plataforma: 'ios', plugins: ['Browser', 'App'] });
    ok(ctx.tratarRetornoLoginApp(TOKENS) === true, 'retorno: não reconheceu o retorno do login');
    await esvazia();
    ok(reg.sessoes.length === 1 && reg.sessoes[0].access_token === 'AT1' && reg.sessoes[0].refresh_token === 'RT1',
      'retorno: não entrou com os tokens devolvidos: ' + JSON.stringify(reg.sessoes));
    ok(reg.fechou === 1, 'retorno: o navegador do login ficou aberto por cima do app');
    ok(ctx.loggingOut === false, '🧨 retorno: depois de um "Sair" na mesma aba, o SIGNED_IN do login novo seria ignorado (loggingOut ficou true)');
    ok(reg.erros.length === 0, 'retorno: mostrou erro num login que deu certo: ' + reg.erros.join(' | '));
    ctx.tratarRetornoLoginApp(TOKENS);
    await esvazia();
    ok(reg.sessoes.length === 1, 'retorno: o mesmo retorno entrou duas vezes');
  }
  {
    const { ctx, reg } = pagina({ plataforma: 'ios', plugins: ['Browser', 'App'] });
    ctx.tratarRetornoLoginApp(RETORNO + '?error=access_denied&error_description=O+usu%C3%A1rio+cancelou');
    await esvazia();
    ok(reg.sessoes.length === 0, 'retorno com erro: tentou entrar mesmo assim');
    ok(reg.erros.length === 1 && /O usuário cancelou/.test(reg.erros[0]), 'retorno com erro: a explicação do Supabase não chegou à tela');
    ok(reg.fechou === 1, 'retorno com erro: o navegador do login ficou aberto');
  }
  {
    const { ctx, reg } = pagina({ plataforma: 'ios', plugins: ['Browser', 'App'] });
    ctx.tratarRetornoLoginApp(RETORNO + '#access_token=SO_O_ACESSO');
    await esvazia();
    ok(reg.sessoes.length === 0 && reg.erros.length === 1, 'retorno incompleto: sem refresh_token, tem de avisar e não entrar');
  }
  {
    const { ctx, reg } = pagina({ plataforma: 'ios', plugins: ['Browser', 'App'], sessaoErro: 'Invalid Refresh Token' });
    ctx.tratarRetornoLoginApp(TOKENS);
    await esvazia();
    ok(reg.erros.length === 1 && /Invalid Refresh Token/.test(reg.erros[0]), 'retorno: a recusa do setSession não chegou à tela de login');
  }
  {
    const { ctx, reg } = pagina({ plataforma: 'ios', plugins: ['Browser', 'App'] });
    ok(ctx.tratarRetornoLoginApp('https://www.endodirect.com.br/#qotd') === false, 'outro link: foi tratado como retorno do login');
    await esvazia();
    ok(reg.fechou === 0 && reg.sessoes.length === 0 && reg.erros.length === 0, 'outro link: mexeu no navegador, na sessão ou na tela de login');
  }

  // ── 5. O OUVINTE SÓ EXISTE NO IPHONE ──────────────────────────────────────
  {
    const site = pagina({});
    site.ctx.iniciarRetornoLoginApp();
    const android = pagina({ plataforma: 'android', plugins: ['Browser', 'App'] });
    android.ctx.iniciarRetornoLoginApp();
    ok(android.reg.ouvintes.length === 0, 'Android: registrou o ouvinte do retorno do iPhone');
    const ios = pagina({ plataforma: 'ios', plugins: ['Browser', 'App'] });
    ios.ctx.iniciarRetornoLoginApp();
    ok(ios.reg.ouvintes.length === 1 && ios.reg.ouvintes[0].ev === 'appUrlOpen', 'iPhone: não ouviu o appUrlOpen');
    if (ios.reg.ouvintes[0]) ios.reg.ouvintes[0].cb({ url: TOKENS });
    await esvazia();
    ok(ios.reg.sessoes.length === 1, 'iPhone: o appUrlOpen não chegou ao setSession');
  }

  // ── 6. 🧨 AS QUATRO PONTAS DO APP CONCORDAM ───────────────────────────────
  {
    const iW = html.indexOf('startSupabaseAuthWatcher();\n');
    ok(iW > 0 && /^\s*iniciarRetornoLoginApp\(\);/.test(html.slice(iW + 'startSupabaseAuthWatcher();\n'.length)),
      '🧨 o ouvinte do retorno não é ligado junto com o watcher do Supabase: o login volta e nada acontece');

    const esquema = RETORNO.split('://')[0];
    const plist = fs.readFileSync(path.join(RAIZ, 'app-ios/ios/App/App/Info.plist'), 'utf8');
    const iTipos = plist.indexOf('<key>CFBundleURLSchemes</key>');
    ok(iTipos > 0 && plist.slice(iTipos, plist.indexOf('</array>', iTipos)).indexOf('<string>' + esquema + '</string>') > 0,
      '🧨 o esquema ' + esquema + ' não está no Info.plist: o iPhone não devolve o login ao app');

    const cfg = JSON.parse(fs.readFileSync(path.join(RAIZ, 'app-ios/capacitor.config.json'), 'utf8'));
    ok(cfg.server && /^https:\/\/www\.endodirect\.com\.br\/\?app=ios$/.test(cfg.server.url),
      'capacitor.config.json: o app não abre o site com ?app=ios (sem a marca, o app mostraria preços)');
    ok(cfg.ios && /EndodirectApp\/[\d.]+ \(ios\)/.test(cfg.ios.appendUserAgent || ''),
      'capacitor.config.json: a marca EndodirectApp/<versão> (ios) saiu do user agent (o APP_LOJA a usa)');

    const pkg = JSON.parse(fs.readFileSync(path.join(RAIZ, 'app-ios/package.json'), 'utf8'));
    ['@capacitor/app', '@capacitor/browser', '@capacitor/ios'].forEach((d) =>
      ok(pkg.dependencies && pkg.dependencies[d], 'app-ios/package.json: falta ' + d + ' (o login nativo depende dele)'));

    const vi = fs.readFileSync(path.join(RAIZ, '.vercelignore'), 'utf8');
    ok(/^app-ios\/?$/m.test(vi), '.vercelignore: a pasta do app do iPhone iria para o site publicado');
  }

  terminou = true;
  if (falhas.length) {
    console.error('test-login-google-app-ios: ' + falhas.length + ' falha(s)');
    falhas.forEach((f) => console.error('  ✗ ' + f));
    process.exit(1);
  }
  console.log('test-login-google-app-ios: ok (site e Android no redirect de sempre; iPhone abre o navegador do sistema, lê o retorno, entra uma vez e fecha; Info.plist, config e plugins concordam)');
})().catch((e) => { console.error(e); process.exit(1); });
