#!/usr/bin/env node
// ENTRAR COM A APPLE NO APP DO IPHONE (10/11/2026).
//
// O app oferece login com Google, e a diretriz 4.8 da App Store exige oferecer também o
// "Entrar com a Apple". É nativo: o plugin AppleSignIn do próprio app (Swift, em
// app-ios/ios/App/App/) abre a folha da Apple e devolve o identityToken; o site troca o
// token por sessão no Supabase (signInWithIdToken), com nonce.
//
// 🧨 O QUE NÃO PODE QUEBRAR, e nada disso dá erro visível:
//  - o botão aparecer no site ou no Android (lá não há plugin, e a Apple não exige);
//  - o nonce: a Apple recebe o SHA-256, o Supabase recebe o cru. Trocados, o Supabase
//    recusa todo login com "nonces mismatch";
//  - o nome do plugin e do método no JS e no Swift (AppleSignIn / entrar) divergirem;
//  - o plugin não ser registrado (AppViewController) ou o app não usar esse controlador;
//  - o entitlement sumir do projeto: a folha da Apple falha com erro 1000 no aparelho.
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const nodeCrypto = require('crypto');

const RAIZ = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(RAIZ, 'index.html'), 'utf8');
const IOS = path.join(RAIZ, 'app-ios', 'ios', 'App');
let bad = 0;
const ok = (nome, cond, det) => { if (cond) return; bad++; console.log('  ✗ ' + nome + (det ? ' — ' + det : '')); };

function corpo(nome) {
  const i = html.indexOf('function ' + nome + '(');
  if (i < 0) throw new Error('função ausente no index.html: ' + nome);
  let n = 0;
  for (let k = html.indexOf('{', i); k < html.length; k++) {
    if (html[k] === '{') n++;
    else if (html[k] === '}') { n--; if (!n) return html.slice(i, k + 1); }
  }
  throw new Error('chaves não fecham em ' + nome);
}
let terminou = false;
process.on('exit', (code) => { if (!terminou && code === 0) { console.error('test-login-apple-app-ios: o teste parou no meio'); process.exitCode = 1; } });
// O SHA-256 do webcrypto roda fora da fila de microtarefas: espera o fluxo assentar.
const esvazia = async () => { for (let i = 0; i < 8; i++) await new Promise((r) => setTimeout(r, 15)); };

const FONTE = ["'use strict';", 'var loggingOut=true;', 'var appleEmAndamento=false;',
  ...['appNativoIOS', 'pluginNativo', 'nonceAleatorio', 'sha256Hex', 'appleDisponivel', 'mostrarBotaoApple', 'startAppleSignIn'].map(corpo)].join('\n');

// plataforma: null (site), 'ios' ou 'android'. apple: undefined (sem plugin) ou o
// comportamento do plugin. modoPlugin: 'Plugins' (já em Capacitor.Plugins) ou
// 'registro' (só anunciado pelo nativo, pego pelo registerPlugin).
function pagina(o) {
  o = o || {};
  const reg = { pedidos: [], idtoken: [], update: [], erros: [], limpou: 0, registrou: [] };
  const botao = { style: { display: 'none' } };
  const client = { auth: {
    signInWithIdToken(x) { reg.idtoken.push(x); return Promise.resolve(o.sbErro ? { data: {}, error: { message: o.sbErro } } : { data: { session: {} }, error: null }); },
    updateUser(x) { reg.update.push(x); return Promise.resolve({ data: {}, error: null }); },
  } };
  const plugin = o.apple ? { entrar(arg) { reg.pedidos.push(arg); return o.apple(arg); } } : null;
  const win = {};
  if (o.plataforma) {
    const Plugins = {};
    if (plugin && o.modoPlugin !== 'registro') Plugins.AppleSignIn = plugin;
    win.Capacitor = {
      isNativePlatform: () => true,
      getPlatform: () => o.plataforma,
      isPluginAvailable: (n) => n === 'AppleSignIn' && !!plugin,
      registerPlugin: (n) => { reg.registrou.push(n); return n === 'AppleSignIn' ? plugin : null; },
      Plugins,
    };
  }
  const ctx = {
    window: win, crypto: nodeCrypto.webcrypto, TextEncoder, Uint8Array, Promise, String, Array,
    console: { warn() {}, log() {} },
    document: { getElementById: (id) => (id === 'btn-apple-login' ? botao : null) },
    getSupabaseClient: () => client,
    showLoginError: (m) => reg.erros.push(String(m)),
    clearLoginError: () => { reg.limpou++; },
  };
  vm.createContext(ctx);
  vm.runInContext(FONTE, ctx);
  return { ctx, reg, botao };
}
const sha = (t) => nodeCrypto.createHash('sha256').update(t).digest('hex');
const okApple = (arg) => Promise.resolve({ identityToken: 'eyJ.tok.en', authorizationCode: 'c1', user: '001.abc', email: 'x@privaterelay.appleid.com', givenName: 'Ana', familyName: 'Souza' });

(async () => {
  // ── 1. onde o botão aparece ───────────────────────────────────────────────────
  for (const [nome, o, esperado] of [
    ['🧨 site (navegador e PWA)', {}, 'none'],
    ['🧨 app do Android', { plataforma: 'android', apple: okApple }, 'none'],
    ['iPhone sem o plugin (app antigo)', { plataforma: 'ios' }, 'none'],
    ['iPhone com o plugin em Capacitor.Plugins', { plataforma: 'ios', apple: okApple }, 'flex'],
    ['iPhone com o plugin só anunciado pelo nativo', { plataforma: 'ios', apple: okApple, modoPlugin: 'registro' }, 'flex'],
  ]) {
    const { ctx, botao } = pagina(o);
    ctx.mostrarBotaoApple();
    ok(nome + ': botão ' + esperado, botao.style.display === esperado, 'ficou ' + botao.style.display);
  }

  // ── 2. login completo, com o nonce certo em cada ponta ───────────────────────
  {
    const { ctx, reg } = pagina({ plataforma: 'ios', apple: okApple, modoPlugin: 'registro' });
    ctx.startAppleSignIn();
    await esvazia();
    const ped = reg.pedidos[0] || {}, sb = reg.idtoken[0] || {};
    ok('pediu à Apple uma vez', reg.pedidos.length === 1);
    ok('🧨 a Apple recebe o SHA-256 do nonce que o Supabase recebe cru', /^[0-9a-f]{64}$/.test(ped.nonce || '') && /^[0-9a-f]{64}$/.test(sb.nonce || '') && ped.nonce === sha(sb.nonce) && ped.nonce !== sb.nonce,
      JSON.stringify({ apple: ped.nonce, supabase: sb.nonce }));
    ok('Supabase: provider apple com o identityToken', sb.provider === 'apple' && sb.token === 'eyJ.tok.en');
    ok('o nome do primeiro login vai para o perfil', reg.update.length === 1 && reg.update[0].data.full_name === 'Ana Souza');
    ok('sem erro no caminho feliz', reg.erros.length === 0, reg.erros.join(' | '));
    ok('o plugin anunciado pelo nativo foi registrado uma vez', reg.registrou.length === 1 && reg.registrou[0] === 'AppleSignIn');
    ok('libera o SIGNED_IN (loggingOut=false)', vm.runInContext('loggingOut', ctx) === false);
    const dois = pagina({ plataforma: 'ios', apple: okApple });
    dois.ctx.startAppleSignIn(); dois.ctx.startAppleSignIn();
    await esvazia();
    ok('clique duplo não abre duas folhas', dois.reg.pedidos.length === 1);
    const tres = pagina({ plataforma: 'ios', apple: okApple });
    tres.ctx.startAppleSignIn(); await esvazia();
    tres.ctx.startAppleSignIn(); await esvazia();
    ok('nonce novo a cada login', tres.reg.pedidos.length === 2 && tres.reg.pedidos[0].nonce !== tres.reg.pedidos[1].nonce);
  }
  {
    const { ctx, reg } = pagina({ plataforma: 'ios', apple: () => Promise.resolve({ identityToken: 'tok2', givenName: '', familyName: '' }) });
    ctx.startAppleSignIn(); await esvazia();
    ok('login seguinte (sem nome) não mexe no perfil', reg.idtoken.length === 1 && reg.update.length === 0);
  }

  // ── 3. cancelar e errar ─────────────────────────────────────────────────────────
  {
    const cancel = pagina({ plataforma: 'ios', apple: () => Promise.reject(Object.assign(new Error('Login com a Apple cancelado.'), { code: 'CANCELADO' })) });
    cancel.ctx.startAppleSignIn(); await esvazia();
    ok('cancelar a folha da Apple não mostra erro', cancel.reg.erros.length === 0 && cancel.reg.idtoken.length === 0);
    const falha = pagina({ plataforma: 'ios', apple: () => Promise.reject(Object.assign(new Error('The operation couldn’t be completed. (1000)'), { code: 'ERRO_APPLE' })) });
    falha.ctx.startAppleSignIn(); await esvazia();
    ok('erro da Apple vira mensagem com saída por e-mail e senha', falha.reg.erros.length === 1 && /entrar com e-mail e senha/.test(falha.reg.erros[0]));
    const sb = pagina({ plataforma: 'ios', apple: okApple, sbErro: 'Provider (issuer "https://appleid.apple.com") is not enabled' });
    sb.ctx.startAppleSignIn(); await esvazia();
    ok('Supabase sem o provedor Apple: mensagem clara', sb.reg.erros.length === 1 && /is not enabled/.test(sb.reg.erros[0]));
    const semPlugin = pagina({ plataforma: 'ios' });
    semPlugin.ctx.startAppleSignIn(); await esvazia();
    ok('app sem o plugin: pede para atualizar', semPlugin.reg.erros.length === 1 && /Atualize o app/.test(semPlugin.reg.erros[0]));
  }

  // ── 4. a página ─────────────────────────────────────────────────────────────────
  ok('botão no login, escondido por padrão (CSS display:none)', /<button class="login-apple" id="btn-apple-login" type="button"/.test(html) && /\.login-apple\{[^}]*display:none/.test(html));
  ok('botão antes do Google, com o texto da Apple', html.indexOf('id="btn-apple-login"') < html.indexOf('id="btn-google-login"') && />Continuar com a Apple<\/button>/.test(html));
  ok('ligado ao clique e mostrado na abertura', /bApple\.addEventListener\('click',startAppleSignIn\)/.test(html) && /mostrarBotaoApple\(\); \/\/ app do iPhone/.test(html));

  // ── 5. o lado nativo concorda com o JS ──────────────────────────────────────────
  const swift = fs.readFileSync(path.join(IOS, 'App', 'AppleSignInPlugin.swift'), 'utf8');
  const vc = fs.readFileSync(path.join(IOS, 'App', 'AppViewController.swift'), 'utf8');
  const scene = fs.readFileSync(path.join(IOS, 'App', 'SceneDelegate.swift'), 'utf8');
  const story = fs.readFileSync(path.join(IOS, 'App', 'Base.lproj', 'Main.storyboard'), 'utf8');
  const pbx = fs.readFileSync(path.join(IOS, 'App.xcodeproj', 'project.pbxproj'), 'utf8');
  const ent = fs.readFileSync(path.join(IOS, 'App', 'App.entitlements'), 'utf8');
  ok('🧨 Swift: jsName AppleSignIn e método entrar (os nomes que o site chama)', /public let jsName = "AppleSignIn"/.test(swift) && /CAPPluginMethod\(name: "entrar", returnType: CAPPluginReturnPromise\)/.test(swift) && /@objc func entrar\(_ call: CAPPluginCall\)/.test(swift));
  ok('Swift: nonce repassado à Apple, nome e e-mail pedidos', /pedido\.nonce = nonce/.test(swift) && /requestedScopes = \[\.fullName, \.email\]/.test(swift));
  ok('Swift: devolve identityToken e trata o cancelamento com o código CANCELADO', /"identityToken": token/.test(swift) && /\.canceled[\s\S]{0,80}"CANCELADO"/.test(swift));
  ok('🧨 plugin registrado no controlador do app', /class AppViewController: CAPBridgeViewController/.test(vc) && /bridge\?\.registerPluginInstance\(AppleSignInPlugin\(\)\)/.test(vc));
  ok('🧨 o app usa esse controlador (SceneDelegate e storyboard)', /rootViewController = AppViewController\(\)/.test(scene) && /customClass="AppViewController" customModule="App"/.test(story));
  ok('🧨 os dois .swift estão no target (fase Sources)', /\/\* AppleSignInPlugin\.swift in Sources \*\/,/.test(pbx) && /\/\* AppViewController\.swift in Sources \*\/,/.test(pbx));
  ok('🧨 entitlement do Entrar com a Apple no projeto (Debug e Release)', (pbx.match(/CODE_SIGN_ENTITLEMENTS = App\/App\.entitlements;/g) || []).length === 2
    && /<key>com\.apple\.developer\.applesignin<\/key>\s*<array>\s*<string>Default<\/string>/.test(ent));

  terminou = true;
  if (bad) { console.log('\n' + bad + ' falha(s): Entrar com a Apple no app do iPhone'); process.exit(1); }
  console.log('Entrar com a Apple no app do iPhone: só no iPhone, nonce certo, plugin registrado, entitlement no projeto: ok');
})().catch((e) => { console.error(e); process.exit(1); });
