#!/usr/bin/env node
// APP DO IPHONE, VERSÃO 1.2 (16/11/2026). Professor: "Pode fazer" para Face ID + links que abrem
// no app + pedido de avaliação + login do Google sem "Abrir no Endodirect?".
//
// 🧨 Os modos de quebrar isto em silêncio:
//  - o arquivo apple-app-site-association pegar o site inteiro ("/*"): /#planos (preços), /api,
//    /resumo… abririam no app, que não vende;
//  - Face ID que deixa entrar sem o rosto, ou que trava quem acabou de digitar a senha;
//  - "Sair" com Face ID ligado encerrando a sessão no servidor (o rosto não teria o que liberar),
//    ou excluir a conta e o Face ID continuar ligado;
//  - pedir avaliação ao professor, ao revisor da Apple ou a quem quase não usou;
//  - o login do Google na folha da Apple tratar o "Cancelar" como erro, ou perder o Safari de
//    reserva dos apps 1.0/1.1.
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const RAIZ = path.join(__dirname, '..');

let bad = 0;
const ok = (nome, cond, det) => { if (cond) return; bad++; console.log('  ✗ ' + nome + (det ? ' — ' + det : '')); };
const ler = (...p) => fs.readFileSync(path.join(RAIZ, ...p), 'utf8');

// ── 1. projeto do iPhone ─────────────────────────────────────────────────────
const pkg = JSON.parse(ler('app-ios', 'package.json'));
for (const n of ['@capgo/capacitor-native-biometric', '@capacitor-community/in-app-review'])
  ok('plugin ' + n + ' em versão exata', /^\d+\.\d+\.\d+$/.test(pkg.dependencies[n] || ''));
const spm = ler('app-ios', 'ios', 'App', 'CapApp-SPM', 'Package.swift');
ok('🧨 plugins no Package.swift', /"CapgoCapacitorNativeBiometric"/.test(spm) && /"CapacitorCommunityInAppReview"/.test(spm));
const plist = ler('app-ios', 'ios', 'App', 'App', 'Info.plist');
ok('🧨 Info.plist explica o uso do Face ID (sem isso o iOS fecha o app)', /<key>NSFaceIDUsageDescription<\/key>\s*<string>[^<]{20,}<\/string>/.test(plist));
const ent = ler('app-ios', 'ios', 'App', 'App', 'App.entitlements');
ok('🧨 domínios associados: links e senhas do www', /<key>com\.apple\.developer\.associated-domains<\/key>\s*<array>\s*<string>applinks:www\.endodirect\.com\.br<\/string>\s*<string>webcredentials:www\.endodirect\.com\.br<\/string>/.test(ent));
ok('notificações e Entrar com a Apple continuam', /aps-environment/.test(ent) && /com\.apple\.developer\.applesignin/.test(ent));
const pbx = ler('app-ios', 'ios', 'App', 'App.xcodeproj', 'project.pbxproj');
ok('projeto na versão 1.2 ou maior', (pbx.match(/MARKETING_VERSION = ([\d.]+);/g) || []).length === 2 && (pbx.match(/MARKETING_VERSION = ([\d.]+);/g) || []).every((m) => { const v = m.match(/([\d.]+);/)[1].split('.').map(Number); return v[0] > 1 || (v[0] === 1 && (v[1] || 0) >= 2); }));
const wf = ler('.github', 'workflows', 'app-ios.yml');
ok('a rotina confere os domínios associados no app compilado', /grep -q 'applinks:www\.endodirect\.com\.br'/.test(wf));

// ── 2. Universal Links ───────────────────────────────────────────────────────
let aasa = {};
try { aasa = JSON.parse(ler('.well-known', 'apple-app-site-association')); } catch (e) { ok('apple-app-site-association é JSON: ' + e.message, false); }
const equipe = (ler('lib', 'apple-revogar.js').match(/APPLE_TEAM_ID \|\| '([A-Z0-9]{10})'/) || [])[1];
const appId = equipe + '.br.com.endodirect.app';
const det = (((aasa.applinks || {}).details) || [])[0] || {};
ok('🧨 AASA aponta para o app (equipe + identificador)', (det.appIDs || []).length === 1 && det.appIDs[0] === appId, JSON.stringify(det.appIDs));
const comp = det.components || [];
ok('🧨 /#planos (preços) fica no navegador e vem antes da regra geral', comp[0] && comp[0]['/'] === '/' && comp[0]['#'] === 'planos*' && comp[0].exclude === true);
ok('a página principal abre no app', comp.some((c) => c['/'] === '/' && !c.exclude && !c['#']));
ok('🧨 nada de "/*": /api, /resumo, /privacidade e afins continuam no navegador', comp.every((c) => !/\*/.test(c['/'] || '')));
ok('senhas salvas do site no app (webcredentials)', JSON.stringify(((aasa.webcredentials || {}).apps) || []) === JSON.stringify([appId]));
const vj = JSON.parse(ler('vercel.json'));
const hdr = (vj.headers || []).find((h) => h.source === '/.well-known/apple-app-site-association');
ok('AASA servido como application/json', !!hdr && hdr.headers.some((x) => x.key === 'Content-Type' && x.value === 'application/json'));
ok('nenhum rewrite/redirect toca o .well-known', !JSON.stringify(vj.rewrites || []).includes('well-known') && !JSON.stringify(vj.redirects || []).includes('well-known'));

// ── 3. Swift: login do Google na folha da Apple ──────────────────────────────
const sw = ler('app-ios', 'ios', 'App', 'App', 'AppViewController.swift');
ok('WebAuthPlugin registrado', /bridge\?\.registerPluginInstance\(WebAuthPlugin\(\)\)/.test(sw));
ok('🧨 ASWebAuthenticationSession só com https', /ASWebAuthenticationSession\(url: url, callbackURLScheme: esquema\)/.test(sw) && /url\.scheme == "https"/.test(sw));
ok('sessão compartilhada (quem já entrou no Google só escolhe a conta)', /prefersEphemeralWebBrowserSession = false/.test(sw));
ok('"Cancelar" vira CANCELADO', /\.canceledLogin[\s\S]{0,80}"CANCELADO"/.test(sw));

// ── 4. site ───────────────────────────────────────────────────────────────────
const html = ler('index.html');
function corpo(nome) {
  const ini = html.indexOf('\nfunction ' + nome + '(');
  if (ini < 0) { ok('achei function ' + nome, false); return ''; }
  let i = html.indexOf('{', ini), prof = 0, q = null;
  for (; i < html.length; i++) {
    const ch = html[i];
    if (q) { if (ch === '\\') { i++; continue; } if (ch === q) q = null; continue; }
    if (ch === "'" || ch === '"' || ch === '`') { q = ch; continue; }
    if (ch === '/' && html[i + 1] === '/') { i = html.indexOf('\n', i); continue; }
    if (ch === '{') prof++;
    else if (ch === '}') { prof--; if (prof === 0) break; }
  }
  return html.slice(ini + 1, i + 1);
}
const g = corpo('startGoogleOAuth');
ok('🧨 Google: folha da Apple quando o app tem o plugin', /folha\.abrir\(\{url:url,esquema:'br\.com\.endodirect\.app'\}\)/.test(g) && /tratarRetornoLoginApp\(r&&r\.url\)/.test(g));
ok('Google: fechar a folha não vira erro', /e\.code==='CANCELADO'/.test(g));
ok('🧨 Google: o Safari embutido continua para os apps 1.0 e 1.1', /return navegador\.open\(\{url:url\}\);/.test(g));
ok('🧨 links do site: retorno do login primeiro, depois abre o endereço no app', /if\(tratarRetornoLoginApp\(u\)\)return;if\(\/\^https:\/i\.test\(String\(u\|\|''\)\)\)pushNativoAbrir\(u\);/.test(corpo('iniciarRetornoLoginApp')));
const lfs = corpo('loginFromSupabaseSession');
ok('🧨 Face ID: a porta vem antes de qualquer entrada', lfs.indexOf('if(faceIdPrecisa(session)){faceIdMostrarTrava(true);return;}') > 0 && lfs.indexOf('faceIdPrecisa') < lfs.indexOf('isAdminEmail'));
const sair = corpo('doLogout');
ok('🧨 Sair com Face ID ligado não encerra a sessão no servidor', /if\(travarFaceId\)\{faceIdMarcarLiberado\(false\);faceIdAutoFeito=true;\}\s*else if\(client&&client\.auth\)\{try\{client\.auth\.signOut\(\)/.test(sair));
ok('Sair com Face ID ligado mostra a tela do Face ID', /if\(travarFaceId\)faceIdMostrarTrava\(false\);else faceIdEsconderTrava\(\);/.test(sair));
const exc = corpo('contaExcluidaNoAparelho');
ok('🧨 conta excluída: Face ID desligado antes do Sair', exc.indexOf("localStorage.removeItem('endo_faceid_conta')") >= 0 && exc.indexOf("endo_faceid_conta") < exc.indexOf('doLogout()'));
const sa = corpo('startApp');
ok('startApp: convite do Face ID e pedido de avaliação agendados', /faceIdOferecer\(\)/.test(sa) && /appPedirAvaliacao\(\)/.test(sa));
ok('botão do Face ID ligado na tela de entrada', /id="btn-faceid-login"/.test(html) && /bFace\.addEventListener\('click',faceIdEntrar\)/.test(html));
// Professor, 16/11, no TestFlight da 1.2: "Não apareceu aqui a opção de desativar o Face ID" — o
// cartão só existia no Perfil do aluno; o Perfil do professor é outra tela (admPerfilHTML).
ok('🧨 Perfil do professor tem o lugar do cartão do Face ID', /id="adm-perfil-faceid"/.test(corpo('admPerfilHTML')));
const bas = corpo('bindAdmSec'), basPerfil = bas.slice(bas.indexOf("if(sec==='perfil'){"));
ok('🧨 Perfil do professor desenha o cartão ao abrir', basPerfil.startsWith("if(sec==='perfil'){") && /faceIdPerfilRender\(\)/.test(basPerfil.slice(0, basPerfil.indexOf("getElementById('btn-adm-perfil-edit')"))));
ok('Perfil do aluno continua com o cartão', /id="perfil-faceid"/.test(html) && /faceIdPerfilRender\(\)/.test(corpo('renderPerfil')));

// Comportamento, num ambiente mínimo.
function ambiente(opts) {
  opts = opts || {};
  const ls = Object.assign({}, opts.ls || {}), ss = Object.assign({}, opts.ss || {});
  const store = (o) => ({ getItem: (k) => (k in o ? o[k] : null), setItem: (k, v) => { o[k] = String(v); }, removeItem: (k) => { delete o[k]; } });
  const pedidos = [];
  const plugins = {
    NativeBiometric: { isAvailable: () => Promise.resolve({ isAvailable: true, biometryType: 2 }), verifyIdentity: () => (opts.rostoFalha ? Promise.reject(new Error('x')) : Promise.resolve()) },
    InAppReview: { requestReview: () => { pedidos.push(1); return Promise.resolve(); } },
  };
  const cx = {
    window: { Capacitor: { isNativePlatform: () => opts.nativo !== false, getPlatform: () => 'ios', Plugins: {}, isPluginAvailable: (n) => !!plugins[n] && !(opts.sem || []).includes(n), registerPlugin: (n) => plugins[n] } },
    localStorage: store(ls), sessionStorage: store(ss), Date, JSON, Object, String, Array, Math, Promise, Error,
    currentUser: opts.user || null, DB: { act: opts.act || {} }, document: { getElementById: () => null },
  };
  vm.createContext(cx);
  const fns = ['appNativoIOS', 'pluginNativo', 'faceIdPlugin', 'faceIdConta', 'faceIdLiberado', 'faceIdMarcarLiberado', 'faceIdLoginRecente', 'faceIdPrecisa', 'appPedirAvaliacao'];
  vm.runInContext(fns.map(corpo).join('\n'), cx);
  return { cx, ls, ss, pedidos };
}
const sess = (email, minAtras) => ({ user: { email, last_sign_in_at: new Date(Date.now() - minAtras * 60000).toISOString() } });
{
  let a = ambiente();
  ok('Face ID desligado: entra direto', a.cx.faceIdPrecisa(sess('aluno@x.com', 600)) === false);
  a = ambiente({ ls: { endo_faceid_conta: 'aluno@x.com' } });
  ok('🧨 Face ID ligado, sessão guardada: pede o rosto', a.cx.faceIdPrecisa(sess('Aluno@x.com', 600)) === true);
  a = ambiente({ ls: { endo_faceid_conta: 'aluno@x.com' } });
  ok('🧨 acabou de entrar com a senha: não trava de novo', a.cx.faceIdPrecisa(sess('aluno@x.com', 1)) === false && a.ss.endo_faceid_ok === '1');
  a = ambiente({ ls: { endo_faceid_conta: 'aluno@x.com' }, ss: { endo_faceid_ok: '1' } });
  ok('já liberado nesta abertura: não pede de novo', a.cx.faceIdPrecisa(sess('aluno@x.com', 600)) === false);
  a = ambiente({ ls: { endo_faceid_conta: 'aluno@x.com' } });
  ok('outra conta não usa o Face ID da anterior', a.cx.faceIdPrecisa(sess('outro@x.com', 600)) === false);
  a = ambiente({ ls: { endo_faceid_conta: 'aluno@x.com' }, sem: ['NativeBiometric'] });
  ok('app sem o plugin (1.0/1.1): nada muda', a.cx.faceIdPrecisa(sess('aluno@x.com', 600)) === false);
  a = ambiente({ ls: { endo_faceid_conta: 'aluno@x.com' }, nativo: false });
  ok('site: nada muda', a.cx.faceIdPrecisa(sess('aluno@x.com', 600)) === false);
}
async function cartoesPerfil() {
  const caixas = {}, desligou = [];
  let rostoOk = true;
  const caixa = () => { const b = { style: { display: 'none' }, innerHTML: '', botao: null };
    b.querySelector = () => {
      if (!/data-faceid-perfil/.test(b.innerHTML)) return null;
      if (!b.botao) {
        const cls = new Set(/class="faceid-switch on"/.test(b.innerHTML) ? ['faceid-switch', 'on'] : ['faceid-switch']);
        b.botao = { cliques: [], disabled: false, attrs: {}, classList: { toggle: (c, v) => { if (v) cls.add(c); else cls.delete(c); }, has: (c) => cls.has(c) },
          setAttribute(k, v) { this.attrs[k] = v; }, addEventListener(ev, fn) { this.cliques.push(fn); } };
      }
      return b.botao;
    };
    return b; };
  caixas['perfil-faceid'] = caixa(); caixas['adm-perfil-faceid'] = caixa();
  const a = ambiente({ user: { email: 'prof@x.com', role: 'admin' }, ls: { endo_faceid_conta: 'prof@x.com' } });
  const espera = (ms) => new Promise((r) => setTimeout(r, ms));
  Object.assign(a.cx, { setTimeout, esc: (x) => String(x), faceIdNome: 'Face ID',
    document: { getElementById: (id) => caixas[id] || null },
    faceIdDesligar: () => { desligou.push(1); delete a.ls.endo_faceid_conta; },
    faceIdLigar: () => Promise.resolve(rostoOk).then((ok) => { if (ok) a.ls.endo_faceid_conta = 'prof@x.com'; return ok; }) });
  vm.runInContext((html.match(/\nvar FACEID_CARTOES=[^;]+;/) || [''])[0] + ['faceIdDisponivel', 'faceIdPerfilCaixas', 'faceIdPerfilRender', 'faceIdChaveVisual'].map(corpo).join('\n'), a.cx);
  const redesenha = async () => { for (const k in caixas) caixas[k].botao = null; a.cx.faceIdPerfilRender(); await espera(10); };
  await redesenha();
  const prof = caixas['adm-perfil-faceid'], aluno = caixas['perfil-faceid'];
  const chave = (b) => (b.innerHTML.match(/<button class="faceid-switch[^"]*"[^>]*>/) || [''])[0];
  ok('🧨 Perfil do professor: chave do Face ID ligada', prof.style.display === '' && /class="faceid-switch on"/.test(chave(prof)) && /role="switch"/.test(chave(prof)) && /aria-checked="true"/.test(chave(prof)), prof.innerHTML.slice(0, 120));
  ok('e também no Perfil do aluno', aluno.style.display === '' && /aria-checked="true"/.test(chave(aluno)));
  ok('sem os botões antigos "Ligar/Desligar"', !/>Desligar</.test(prof.innerHTML) && !/>Ligar /.test(prof.innerHTML));
  const bt = prof.querySelector();
  ok('🧨 tocar na chave ligada desliga (desliza na hora e grava)', !!bt.cliques[0] && (bt.cliques[0](), desligou.length === 1 && !bt.classList.has('on') && bt.attrs['aria-checked'] === 'false' && bt.disabled === true));
  ok('toque repetido durante a animação não faz nada', (bt.cliques[0](), desligou.length === 1));
  await espera(300); await redesenha();
  ok('depois: chave desligada no redesenho', /aria-checked="false"/.test(chave(prof)) && !/faceid-switch on/.test(chave(prof)));
  rostoOk = false;
  let b2 = prof.querySelector(); b2.cliques[0]();
  ok('ligar: a chave desliza para ligada enquanto o iPhone confere o rosto', b2.classList.has('on'));
  await espera(5);
  ok('🧨 rosto não confirmado: a chave volta para desligada', !b2.classList.has('on') && b2.attrs['aria-checked'] === 'false');
  await espera(300); await redesenha();
  ok('e o Face ID segue desligado', !a.ls.endo_faceid_conta && /aria-checked="false"/.test(chave(prof)));
  rostoOk = true;
  b2 = prof.querySelector(); b2.cliques[0]();
  await espera(300); await redesenha();
  ok('rosto confirmado: chave ligada', a.ls.endo_faceid_conta === 'prof@x.com' && /aria-checked="true"/.test(chave(prof)));
  const css = (html.match(/\.faceid-switch\.on\{background:([^}]+)\}/) || [])[1];
  ok('chave ligada fica verde (como no iPhone)', css === '#34c759', css);
}
{
  const dias = (n) => Object.fromEntries(Array.from({ length: n }, (_, i) => ['2026-11-' + String(i + 1).padStart(2, '0'), 3]));
  const aluno = { email: 'aluno@x.com', role: 'aluno' };
  let a = ambiente({ user: aluno, act: dias(6) });
  ok('⭐ aluno com 6 dias de estudo: pede avaliação', a.cx.appPedirAvaliacao() === true && a.pedidos.length === 1 && !!a.ls.endo_avaliacao_pedida);
  ok('⭐ de novo na mesma semana: não pede', a.cx.appPedirAvaliacao() === false && a.pedidos.length === 1);
  a = ambiente({ user: aluno, act: dias(4) });
  ok('menos de 5 dias de estudo: não pede', a.cx.appPedirAvaliacao() === false);
  a = ambiente({ user: { email: 'prof@x.com', role: 'admin' }, act: dias(30) });
  ok('🧨 professor: não pede', a.cx.appPedirAvaliacao() === false);
  a = ambiente({ user: { email: 'revisao@endodirect.com.br', role: 'aluno' }, act: dias(30) });
  ok('🧨 revisor da Apple: não pede', a.cx.appPedirAvaliacao() === false);
  a = ambiente({ user: aluno, act: dias(30), ls: { endo_avaliacao_pedida: String(Date.now() - 121 * 864e5) } });
  ok('depois de 120 dias: pode pedir de novo', a.cx.appPedirAvaliacao() === true);
  a = ambiente({ user: aluno, act: dias(30), nativo: false });
  ok('site: nunca pede', a.cx.appPedirAvaliacao() === false);
}

cartoesPerfil().then(() => {
  if (bad) { console.log('✗ app do iPhone 1.2: ' + bad + ' falha(s)'); process.exit(1); }
  console.log('✓ app do iPhone 1.2: Face ID com porta e "Sair" que trava, cartão no Perfil do aluno e do professor, links do site no app (sem preços), avaliação sob regras, Google na folha da Apple');
}, (e) => { console.log('✗ app do iPhone 1.2: ' + (e && e.stack || e)); process.exit(1); });
