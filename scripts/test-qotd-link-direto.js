// Regressão: a Questão do Dia chega ao aluno logado, e o link do e-mail abre nela.
//
// O RELATO QUE CRIOU ESTE TESTE (06/10/2026, assinante Gold, pelo Suporte):
// "Não consegui responder a questão do dia diretamente no e-mail (...). E quando
// entra no link para ver a resposta na plataforma não cai nela ao clicar. Além
// disso no sistema não tem questão do dia disponível."
//
// Eram três defeitos, todos medidos em produção:
//   · o `endodirect_member_content` perdeu `ig_stories` na reescrita de 07/08: o
//     aluno que entrou depois disso nunca recebeu a lista (o do relato criou a conta
//     em 02/10) e as respostas à Questão do Dia caíram de 86 por semana para zero;
//   · o botão "Conferir a resposta na plataforma" levava à raiz do site, e o app não
//     lia endereço nenhum: abria no painel de sempre;
//   · a rota pública entregava a fila inteira, com o gabarito das questões que ainda
//     não tinham sido postadas.
//
// O que este teste prende:
//   1) o app pede as publicadas numa RPC própria (`endodirect_qotd_publicadas`), com
//      tentativas, para o aluno logado — e não depende do member_content;
//   2) /#qotd/<id> abre o arquivo da Questão do Dia já naquela questão, o pedido
//      sobrevive ao login (sessionStorage) e o "#" sai do endereço; "#planos" (âncora
//      da landing) e "#access_token=…" (retorno do login) não são tocados;
//   3) o e-mail aponta para /#qotd/<id da questão do e-mail>;
//   4) o SQL versionado entrega só as publicadas, nas duas rotas.
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { JSDOM, VirtualConsole } = require('jsdom');

const raiz = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(raiz, 'index.html'), 'utf8');
const falhas = [];
const ok = (cond, msg) => { if (!cond) falhas.push(msg); };

const fonte = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)]
  .map((m) => m[1])
  .find((s) => s.includes('function renderQotdArchive'));
if (!fonte) { console.error('✗ link direto da Questão do Dia:\n  - não achei o bloco principal no index.html'); process.exit(1); }
// O bloco é uma IIFE: sem o invólucro, as funções e as `var` ficam no escopo global do
// contexto (mesma técnica do test-qotd-arquivo-aluno.js).
const corpo = fonte
  .replace(/^\s*\(function\(\)\{\s*/, '')
  .replace(/^\s*['"]use strict['"];\s*/, '')
  .replace(/\}\)\(\);?\s*$/, '');

function carrega(url) {
  const vc = new VirtualConsole();
  vc.on('jsdomError', function () {});
  const dom = new JSDOM('<body><div id="panel-qotd-body"></div></body>', { url, runScripts: 'outside-only', virtualConsole: vc });
  const ctx = vm.createContext(dom.getInternalVMContext());
  try { vm.runInContext(corpo, ctx); } catch (e) { /* dependências de CDN ausentes: esperado */ }
  return { dom, ctx, run: (c) => vm.runInContext(c, ctx) };
}

// ── 1. o pedido no endereço ────────────────────────────────────────────────────
// `pede` recoloca o "#" e chama a leitura de novo: a chamada da CARGA da página já
// rodou ao montar o contexto (e já limpou o endereço), então cada caso começa do zero.
const pede = (run, hash) => run('history.replaceState(null,"",' + JSON.stringify('/' + hash) + ');sessionStorage.removeItem(LINK_PAINEL_KEY);guardarLinkPainel();');
{
  const { dom, run } = carrega('https://www.endodirect.com.br/#qotd/ig-1727712345678-123456');
  ok(run('typeof guardarLinkPainel') === 'function', 'guardarLinkPainel não existe no index.html');
  // A própria carga já guardou o pedido e tirou o "#" (é o que acontece antes do login).
  const daCarga = run('sessionStorage.getItem(LINK_PAINEL_KEY)');
  ok(daCarga && JSON.parse(daCarga).arg === 'ig-1727712345678-123456' && dom.window.location.hash === '',
    'na CARGA da página o pedido /#qotd/<id> tem de ser guardado e o "#" tem de sair do endereço: ' + daCarga + ' / ' + dom.window.location.hash);
  pede(run, '#qotd/ig-1727712345678-123456');
  const guardado = run('sessionStorage.getItem(LINK_PAINEL_KEY)');
  ok(guardado && JSON.parse(guardado).p === 'qotd' && JSON.parse(guardado).arg === 'ig-1727712345678-123456',
    'o pedido /#qotd/<id> não foi guardado na aba (o login com Google volta sem o "#"): ' + guardado);
  ok(dom.window.location.hash === '', 'o "#qotd/<id>" ficou no endereço — um F5 depois forçaria o painel de novo');
  const l1 = run('JSON.stringify(consumirLinkPainel())');
  const l2 = run('JSON.stringify(consumirLinkPainel())');
  ok(l1 === JSON.stringify({ p: 'qotd', arg: 'ig-1727712345678-123456' }), 'consumirLinkPainel devolveu ' + l1);
  ok(l2 === 'null', 'o pedido tem de valer UMA vez (a 2ª leitura devolveu ' + l2 + ')');
  for (const [hash, porque] of [['#planos', 'âncora da landing'], ['#access_token=abc&type=signup', 'retorno do login'], ['#qotd/<script>', 'id malformado'], ['#adm', 'painel fora da lista']]) {
    pede(run, hash);
    ok(run('sessionStorage.getItem(LINK_PAINEL_KEY)') === null, '"' + hash + '" (' + porque + ') não pode virar pedido de painel');
    ok(dom.window.location.hash !== '', '"' + hash + '" (' + porque + ') não pode sair do endereço');
  }
  pede(run, '#aovivo');
  ok(run('JSON.stringify(consumirLinkPainel())') === JSON.stringify({ p: 'aovivo', arg: '' }), '/#aovivo (e-mail da aula ao vivo) não virou pedido de painel');
}

// ── 2. abrir o painel pedido ───────────────────────────────────────────────────
{
  const { run } = carrega('https://www.endodirect.com.br/');
  run('var __ir=[];goPanel=function(id){__ir.push(id);};canSeePanel=function(){return true;};qotdArchOpen=null;qotdArchAuto=true;qotdArchRolar=false;');
  const abriu = run('abrirPainelDoLink({p:"qotd",arg:"ig-2"})');
  ok(abriu === true && run('__ir.join()') === 'qotd', 'abrirPainelDoLink não abriu o painel da Questão do Dia');
  ok(run('qotdArchOpen') === 'ig-2' && run('qotdArchAuto') === false && run('qotdArchRolar') === true,
    'com o id da questão, o arquivo tem de abrir NELA (e não na "de hoje")');
  run('__ir=[];canSeePanel=function(){return false;};');
  ok(run('abrirPainelDoLink({p:"mural",arg:""})') === false && run('__ir.length') === 0,
    'painel que o aluno não pode ver não pode ser aberto pelo link (cai no painel de sempre)');
  ok(run('abrirPainelDoLink(null)') === false, 'sem pedido, abrirPainelDoLink tem de devolver false');

  // O arquivo abre na questão do link, e só as publicadas aparecem.
  const st = [1, 2, 3].map((i) => ({ id: 'ig-' + i, status: 'posted', postedAt: Date.UTC(2026, 9, i), stem: 'Enunciado ' + i, answer: 'A', options: { A: 'a', B: 'b' }, explanation: 'c' }));
  st.push({ id: 'ig-4', status: 'queued', stem: 'Da fila', answer: 'B', options: { A: 'a', B: 'b' }, explanation: 'c' });
  run('igStories=' + JSON.stringify(st) + ';DB=(typeof DB==="object"&&DB)?DB:{};DB.qotd={};DB.perf=DB.perf||{};qotdArchSort="recent";qotdArchOpen="ig-2";qotdArchAuto=false;renderQotdArchive();');
  const el = run('document.getElementById("panel-qotd-body")');
  const abertas = [...el.querySelectorAll('.qa-item.open [data-qa-toggle]')].map((b) => b.getAttribute('data-qa-toggle'));
  ok(abertas.length === 1 && abertas[0] === 'ig-2', 'o arquivo não abriu na questão do link (abertas: ' + JSON.stringify(abertas) + ')');
  ok(!el.querySelector('[data-qa-toggle="ig-4"]'), 'questão da FILA (não postada) apareceu no arquivo do aluno');
}

// ── 3. o login escolhe o painel do link antes do último painel ────────────────
{
  const m = /var lastP=lsGet\('last_panel'\);\s*\n\s*if\(!abrirPainelDoLink\(consumirLinkPainel\(\)\)\)goPanel\(/.exec(fonte);
  ok(!!m, 'na entrada do aluno (doLogin), o painel do link tem de vir antes do último painel e do homePanel');
  ok(/goPanel\('adm'\);\s*\n\s*consumirLinkPainel\(\);/.test(fonte), 'no login do professor o pedido de painel do aluno tem de ser descartado');
  ok(/\nguardarLinkPainel\(\);\n/.test(fonte), 'o pedido tem de ser lido do endereço na CARGA da página (antes do login)');
  ok(/addEventListener\('hashchange'/.test(fonte), 'com o app aberto, a troca do "#" (clique na notificação) tem de abrir o painel');
}

// ── 4. a lista chega ao aluno logado, por RPC própria ─────────────────────────
{
  const corpo = (fonte.match(/function hydrateRemoteState\(\)\{[\s\S]*?\n\}/) || [''])[0];
  const ramoAluno = corpo.split("if(currentUser.role==='admin'){")[1] || '';
  ok(/loads\.push\(carregarQotd\(client\)\)/.test(ramoAluno), 'o hydrate do aluno não pede a Questão do Dia (carregarQotd)');
  const fn = (fonte.match(/function carregarQotd\([\s\S]*?\n\}/) || [''])[0];
  ok(/client\.rpc\('endodirect_qotd_publicadas'\)/.test(fn), 'carregarQotd não chama endodirect_qotd_publicadas');
  ok(/if\(Array\.isArray\(res\.data\)\)applyStatePayload\(\{ig_stories:res\.data\}\)/.test(fn), 'resposta nula não pode apagar a cópia local (só aplica array)');
  ok(/tentativa<3/.test(fn), 'carregarQotd tem de tentar de novo quando a rede falha');

  const { run } = carrega('https://www.endodirect.com.br/');
  const st = [{ id: 'ig-9', status: 'posted', stem: 'E', answer: 'A', options: { A: 'a', B: 'b' } }];
  run('currentUser={id:"u1",role:"aluno"};igStories=[];var __nomes=[];var __cli={rpc:function(n){__nomes.push(n);return Promise.resolve({data:' + JSON.stringify(st) + ',error:null});}};');
  run('var __fim=false;carregarQotd(__cli).then(function(){__fim=true;});');
  setTimeout(() => {
    ok(run('__nomes.join()') === 'endodirect_qotd_publicadas', 'carregarQotd chamou ' + run('__nomes.join()'));
    ok(run('igStories.length') === 1 && run('igStories[0].id') === 'ig-9', 'a lista da RPC não chegou a igStories');
    run('__nomes=[];__cli.rpc=function(n){__nomes.push(n);return Promise.resolve({data:null,error:null});};carregarQotd(__cli);');
    setTimeout(() => {
      ok(run('igStories.length') === 1, 'resposta nula apagou a lista do aparelho');
      fim();
    }, 50);
  }, 50);
}

function fim() {
  // ── 5. o e-mail aponta para a questão ───────────────────────────────────────
  const nl = require(path.join(raiz, 'lib', 'newsletter.js'));
  const q = { id: 'ig-1727712345678-123456', status: 'posted', stem: 'Enunciado', options: { A: 'a', B: 'b' }, answer: 'A' };
  const href = (nl.renderQotdBlock(q).match(/href="([^"]+)"/) || [])[1] || '';
  ok(/\/#qotd\/ig-1727712345678-123456$/.test(href), 'o botão do e-mail não leva à questão (/#qotd/<id>): ' + href);
  const hrefRuim = (nl.renderQotdBlock(Object.assign({}, q, { id: 'a b"><x' })).match(/href="([^"]+)"/) || [])[1] || '';
  ok(/\/#qotd$/.test(hrefRuim), 'id malformado tem de cair em /#qotd, sem entrar no endereço: ' + hrefRuim);
  const atual = nl.currentQotd({ ig_stories: [Object.assign({}, q, { id: 'x1' }), Object.assign({}, q, { id: 'x2', status: 'queued' }), q] });
  ok(atual && atual.id === q.id, 'a questão do e-mail tem de ser a ÚLTIMA publicada (igual ao app)');

  // ── 6. o SQL versionado entrega só as publicadas ────────────────────────────
  const sql = fs.readFileSync(path.join(raiz, 'supabase', 'questao-do-dia-volta-ao-aluno.sql'), 'utf8');
  const fnSql = (sql.match(/create or replace function public\.endodirect_qotd_publicadas\(\)[\s\S]*?\$function\$;/) || [''])[0];
  ok(/s\.v->>'status' = 'posted'/.test(fnSql), 'endodirect_qotd_publicadas tem de filtrar status = posted');
  ok(/order by s\.o/.test(fnSql), 'endodirect_qotd_publicadas tem de manter a ordem da fila (o app toma a última como a de hoje)');
  ok(/revoke all on function public\.endodirect_qotd_publicadas\(\) from public, anon;/.test(sql), 'a RPC nova é só de quem está logado');
  const pub = (sql.match(/create or replace function public\.endodirect_public_content\(\)[\s\S]*?end \$function\$;/) || [''])[0];
  ok(/'ig_stories', coalesce\(\(select jsonb_agg\(s\.v order by s\.o\)[\s\S]*?where s\.v->>'status' = 'posted'\)/.test(pub),
    'a rota pública tem de entregar só as publicadas');
  ok(!/'ig_stories', coalesce\(p->'ig_stories'/.test(pub), 'a rota pública ainda entrega a fila inteira (com gabarito das não postadas)');

  if (falhas.length) { console.error('✗ link direto e entrega da Questão do Dia:'); falhas.forEach((f) => console.error('  - ' + f)); process.exit(1); }
  console.log('✓ Questão do Dia: chega ao aluno por RPC própria, o link do e-mail abre na questão e a fila não vaza');
}
