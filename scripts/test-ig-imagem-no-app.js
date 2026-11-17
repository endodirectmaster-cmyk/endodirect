#!/usr/bin/env node
// ⬇ IMAGEM DOS STORIES NO APP DO IPHONE (16/11/2026). Professor, no painel "Questão do Dia (Stories)":
// "Quando eu clico em imagem, não está aparecendo a imagem para conseguir anexar nos stories do
// Instagram." O WKWebView ignora <a download>: o clique não fazia nada. No app, a arte abre numa tela
// própria, com "📤 Compartilhar" (folha do iPhone) e a dica de tocar e segurar; no site, o download de sempre.
//
// 🧨 Os modos de quebrar isto em silêncio:
//  - igDownload voltar a criar o <a download> direto (no app o botão volta a não fazer nada);
//  - o app baixar em vez de mostrar, ou o site mostrar em vez de baixar;
//  - "Compartilhar" aparecer onde a folha não aceita arquivo (o toque daria erro);
//  - o compartilhamento sair sem o toque do professor (o iPhone recusa: precisa do gesto na hora);
//  - faltar a permissão de salvar na galeria no Info.plist ("Salvar imagem" fecharia o app);
//  - texto do usuário ou nome de arquivo virar HTML na tela.
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const raiz = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(raiz, 'index.html'), 'utf8');
const plist = fs.readFileSync(path.join(raiz, 'app-ios', 'ios', 'App', 'App', 'Info.plist'), 'utf8');
let bad = 0;
const ok = (nome, cond, det) => { if (cond) return; bad++; console.log('  ✗ ' + nome + (det ? ' — ' + det : '')); };
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

// 1. igDownload entrega o PNG por igEntregarPng (e não cria o <a download> por conta própria).
const dl = corpo('igDownload');
ok('🧨 igDownload entrega o PNG por igEntregarPng', /igEntregarPng\(b,filename\)/.test(dl));
ok('🧨 igDownload não baixa direto (o app ignoraria)', !/a\.download/.test(dl));

// 2. Comportamento num DOM mínimo.
function el(tag) {
  const e = { tagName: tag, children: [], attrs: {}, style: {}, _html: '', removed: false, listeners: {}, parent: null,
    setAttribute(k, v) { this.attrs[k] = String(v); }, getAttribute(k) { return k in this.attrs ? this.attrs[k] : null; },
    appendChild(c) { c.parent = this; this.children.push(c); return c; },
    remove() { this.removed = true; if (this.parent) this.parent.children = this.parent.children.filter((x) => x !== this); },
    addEventListener(t, f) { this.listeners[t] = f; }, click() { this.clicked = true; },
    querySelector(sel) { if (sel === 'img') { if (!this._img) this._img = { src: '' }; return this._img; } return null; },
    set innerHTML(v) { this._html = v; }, get innerHTML() { return this._html; } };
  return e;
}
function cenario({ app, canShare = true, share = true }) {
  const ev = [], timers = [], body = el('body');
  const cx = {
    isAppLoja: () => app, appNativoIOS: () => false,
    URL: { createObjectURL: () => 'blob:x', revokeObjectURL: (u) => ev.push('solta ' + u) },
    File: function (partes, nome, o) { this.nome = nome; this.type = o.type; },
    navigator: {}, document: { body, createElement: (t) => el(t) },
    setTimeout: (f, ms) => timers.push([ms, f]), notify: (m) => ev.push('aviso ' + m),
  };
  if (share) cx.navigator.share = (d) => { ev.push('compartilha ' + d.files[0].nome + ' ' + d.files[0].type); return Promise.resolve(); };
  if (share) cx.navigator.canShare = () => canShare;
  vm.createContext(cx);
  vm.runInContext(corpo('igEntregarPng') + '\n' + corpo('igMostrarImagem'), cx);
  cx.igEntregarPng({ blob: 1 }, 'questao-do-dia-2026-11-16.png');
  return { cx, ev, timers, body, tela: body.children.find((c) => c.attrs.role === 'dialog') };
}
{
  const r = cenario({ app: false });
  const a = r.body.children.find((c) => c.tagName === 'a');
  ok('🧨 site: baixa o PNG como sempre', a && a.clicked && a.download === 'questao-do-dia-2026-11-16.png' && !r.tela);
}
{
  const r = cenario({ app: true });
  ok('🧨 app: abre a arte numa tela própria (e não baixa)', r.tela && !r.body.children.some((c) => c.tagName === 'a'));
  ok('app: a tela mostra a imagem gerada', r.tela && r.tela._img && r.tela._img.src === 'blob:x');
  ok('app: tela é um diálogo modal com rótulo', r.tela && r.tela.attrs['aria-modal'] === 'true' && /Story/.test(r.tela.attrs['aria-label'] || ''));
  ok('🧨 app: botão "📤 Compartilhar" e "Fechar"', r.tela && /data-ig-ver="compartilhar">📤 Compartilhar/.test(r.tela._html) && /data-ig-ver="fechar">Fechar/.test(r.tela._html));
  ok('app: a dica diz para escolher Instagram ou Salvar imagem', r.tela && /Instagram/.test(r.tela._html) && /Salvar imagem/.test(r.tela._html));
  ok('🧨 nada é compartilhado antes do toque', !r.ev.some((x) => /compartilha/.test(x)));
  if (!r.tela) { ok('a tela existe para seguir', false); r.tela = { listeners: { click() {} }, _html: '' }; }
  const clica = (q, alvo) => r.tela.listeners.click({ target: alvo || { getAttribute: (k) => (k === 'data-ig-ver' ? q : null) } });
  clica('compartilhar');
  ok('🧨 o toque em Compartilhar manda o PNG (arquivo image/png com o nome certo)', r.ev.includes('compartilha questao-do-dia-2026-11-16.png image/png'), r.ev.join('|'));
  clica('fechar');
  ok('Fechar tira a tela', r.tela.removed);
  const solta = r.timers.find((t) => t[0] >= 100); if (solta) solta[1]();
  ok('Fechar devolve a memória da imagem', r.ev.includes('solta blob:x'));
}
{
  const r = cenario({ app: true });
  r.tela.listeners.click({ target: r.tela });
  ok('toque fora da imagem (no fundo) fecha', r.tela.removed);
}
{
  const r = cenario({ app: true, canShare: false });
  ok('🧨 sem folha que aceite arquivo: sem botão Compartilhar, com a dica de tocar e segurar', r.tela && !/compartilhar"/.test(r.tela._html) && /Toque e segure/.test(r.tela._html));
}
{
  const r = cenario({ app: true, share: false });
  ok('🧨 sem navigator.share: a tela abre mesmo assim, com a dica de tocar e segurar', r.tela && /Toque e segure/.test(r.tela._html));
}
{
  // folha fechada pelo professor: nada de aviso; erro de verdade: aviso para tocar e segurar.
  const rodaErro = async (nome) => {
    const r = cenario({ app: true });
    r.cx.navigator.share = () => Promise.reject(Object.assign(new Error('x'), { name: nome }));
    r.tela.listeners.click({ target: { getAttribute: () => 'compartilhar' } });
    await new Promise((x) => setImmediate(x));
    return r.ev.filter((x) => /aviso/.test(x));
  };
  (async () => {
    ok('fechar a folha (AbortError) não mostra aviso', (await rodaErro('AbortError')).length === 0);
    ok('🧨 erro de verdade avisa para tocar e segurar', /Toque e segure/.test((await rodaErro('NotAllowedError')).join('')));
    fim();
  })();
}

function fim() {
  // 3. Nada de texto do usuário na tela (só texto fixo e o blob).
  const mi = corpo('igMostrarImagem');
  ok('🧨 a tela não monta HTML com o nome do arquivo', !/innerHTML=[^;]*filename/.test(mi));
  // 4. CSS: a tela cobre tudo e respeita o entalhe; a imagem cabe sem cortar.
  ok('CSS da tela (fixa, por cima, com área segura)', /\.ig-ver\{position:fixed;inset:0;z-index:\d+/.test(html) && /\.ig-ver\{[^}]*safe-area-inset-top/.test(html));
  ok('🧨 CSS: "Fechar" claro sobre o fundo escuro (no tema claro o contorno seria escuro)', /\.ig-ver \.btn-outline[^{]*\{[^}]*color:#fff/.test(html));
  ok('CSS: botões da tela com altura de toque (≥ 44 px)', /\.ig-ver \.btn\{min-height:44px/.test(html));
  ok('CSS: imagem inteira, sem cortar', /\.ig-ver img\{[^}]*object-fit:contain/.test(html));
  // 5. Info.plist: permissão de salvar na galeria (sem ela, "Salvar imagem" fecha o app).
  ok('🧨 Info.plist tem NSPhotoLibraryAddUsageDescription com texto', /<key>NSPhotoLibraryAddUsageDescription<\/key>\s*<string>[^<]{20,}<\/string>/.test(plist));
  ok('Info.plist mantém o Face ID', /<key>NSFaceIDUsageDescription<\/key>/.test(plist));
  // 6. Os quatro botões de imagem passam por igDownload.
  const usos = (html.match(/igDownload\(/g) || []).length;
  ok('os botões de imagem (rascunho, pergunta, resposta, divulgação) usam igDownload', usos >= 5, 'usos ' + usos);

  // 7. Grafia da marca (professor, 17/11/2026: "trocar endodireto por endodirect"): nem no nome dos arquivos
  //    baixados nem na arte de divulgação. Vale para o site e para o código do servidor.
  const libDir = path.join(raiz, 'lib');
  const fontes = [['index.html', html]].concat(fs.readdirSync(libDir).filter((f) => f.endsWith('.js')).map((f) => ['lib/' + f, fs.readFileSync(path.join(libDir, f), 'utf8')]));
  const comNomeAntigo = fontes.filter(([, src]) => /endodireto/i.test(src)).map(([n]) => n);
  ok('🧨 a marca é Endodirect: "Endodireto" não aparece em arte, arquivo ou texto', !comNomeAntigo.length, comNomeAntigo.join(', '));
  ok('arquivos baixados com o nome da marca', (html.match(/'endodirect-'\+igFnameSub/g) || []).length >= 4 && /'endodirect-promo-'/.test(html));

  if (bad) { console.log('✗ imagem dos Stories no app: ' + bad + ' falha(s)'); process.exit(1); }
  console.log('✓ imagem dos Stories no app: abre em tela própria com Compartilhar (só no toque) e dica de tocar e segurar; site baixa como sempre; permissão da galeria no Info.plist');
}
