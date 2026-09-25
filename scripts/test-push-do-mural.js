// Regressão do BOTÃO DE NOTIFICAR do card do mural.
//
// ⚠️ POR QUE ESTE TESTE EXISTE (28/08/2026). O professor pediu para disparar no
// push a aprovação do Mounjaro que o radar tinha deixado passar. O caminho não
// existia: até então o push só saía ao PUBLICAR um aviso MANUAL, com a caixinha
// marcada. Para avisar sobre uma notícia trazida pelo radar seria preciso
// convertê-la em aviso — e a conversão **apaga `sourceId`, `breaking` e `auto`**
// (está no editar), o que quebra a dedup da captação seguinte: a mesma notícia
// voltaria como item novo assim que o feed a trouxesse.
//
// O botão lê o card e NÃO o altera. E, porque envia para todos os aparelhos e
// não tem desfazer, confirma antes com o texto à vista.
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const falhas = [];
const ok = (c, m) => { if (!c) falhas.push(m); };

// ── O botão existe em TODO card, no card que o professor VÊ ─────────────────
// 🧨 25/09/2026. Este teste conferia o card da versão ANTIGA do painel
// (`admMuralSecHTML` base, l.~15964), que é sobrescrita mais abaixo e nunca é
// renderizada. O professor relatou "mudei para breaking news e não gerou push"
// — e a captura de tela dele mostrava o card sem o botão. Código escrito não é
// código alcançável: a âncora agora é o card vivo, `muralNoticeCardHTML(a,true)`.
{
  const i = html.indexOf("+(admin?'<div class=\"mural-card-actions\">");
  ok(i > 0, '⚠️ o card vivo do painel (muralNoticeCardHTML, ramo admin) sumiu');
  // O bloco de ações do card vivo se estende por várias linhas (até o </article>).
  const linha = html.slice(i, html.indexOf('</article>', i));
  ok(/data-adm-pushav="'\+esc\(avisoKeyStr\(a\)\)\+'"/.test(linha),
    '⚠️ o botão de notificar sumiu do card do mural — sem ele, notícia do radar volta a exigir conversão em aviso manual');
  // Fora do ramo `isRadarAuto(a)?...:...`, ou seja: aparece nos dois tipos.
  const antesDoRamo = linha.slice(0, linha.indexOf('isRadarAuto(a)'));
  ok(linha.indexOf('isRadarAuto(a)') > 0 && antesDoRamo.indexOf('data-adm-pushav') >= 0,
    '⚠️ o botão de notificar caiu dentro do ramo de um tipo só — o item do radar (que é o caso do professor) ficaria sem push');
  // E o card vivo é mesmo o que o override do painel usa.
  const iOverride = html.indexOf('admMuralSecHTML=function(){');
  ok(iOverride > 0 && html.indexOf('muralNoticeCardHTML(a,true)', iOverride) > 0,
    '⚠️ o painel do professor deixou de renderizar os cards por muralNoticeCardHTML(a,true) — o botão pode ter voltado a ficar em código morto');
}

// ── Editor do card: tipo virou Breaking News → push proposto e enviado ao salvar ──
// O professor mudou um card de Comunicado para Breaking News esperando o push.
// A caixa marca sozinha quando o tipo MUDA para breaking (não ao reeditar um
// card que já era breaking), e o salvar envia com o mesmo formato do botão.
{
  ok(/id="mural-inline-push"/.test(html), 'o editor do card perdeu a caixa de push');
  const i = html.indexOf("var miTipo=document.getElementById('mural-inline-tipo'),miPush=document.getElementById('mural-inline-push');");
  ok(i > 0, 'o listener do tipo (mural-inline-tipo → caixa de push) sumiu');
  const bloco = html.slice(i, html.indexOf("var miSave=document.getElementById('btn-mural-inline-save')", i));
  // Executa o listener de verdade num mundo de mentira.
  function roda(tipoOrig, novoTipo) {
    const ctx = vm.createContext({ console });
    vm.runInContext(
      'var admAvisos=[{tipo:' + JSON.stringify(tipoOrig) + '}];var muralInlineEdit=0;'
      + 'function muralDisplayType(a){return a.tipo;}'
      + 'var _tipo={value:' + JSON.stringify(tipoOrig) + ',addEventListener:function(ev,fn){this._fn=fn;}};var _push={checked:false};'
      + 'var document={getElementById:function(id){return id==="mural-inline-tipo"?_tipo:(id==="mural-inline-push"?_push:null);}};'
      + bloco
      + '\n_tipo.value=' + JSON.stringify(novoTipo) + ';_tipo._fn();', ctx);
    return ctx._push.checked;
  }
  ok(roda('Comunicado', 'Breaking News') === true, '⚠️ Comunicado → Breaking News não marcou o push (o caso do professor)');
  ok(roda('Comunicado', 'Evento') === false, 'trocar para um tipo comum não pode propor push');
  ok(roda('Breaking News', 'Breaking News') === false, 'reeditar um card que já era Breaking News não re-notifica sozinho');
  ok(roda('Breaking News', 'Comunicado') === false, 'rebaixar de Breaking News não propõe push');
  // O salvar envia quando a caixa está marcada, com corpo = título e link do mural.
  const s = html.indexOf("var miSave=document.getElementById('btn-mural-inline-save')");
  const salvar = html.slice(s, s + 4000);
  ok(/var _wantPush=!!\(_miPush&&_miPush\.checked\);/.test(salvar), 'o salvar não lê a caixa de push');
  ok(/if\(_wantPush\)\{[\s\S]*?admSendPush\(\{title:_bn\?'🚨 Breaking News'/.test(salvar), 'o salvar não envia o push de Breaking News');
  ok(/body:_bnTitulo,url:'https:\/\/www\.endodirect\.com\.br\/#mural'/.test(salvar), 'o push do salvar tem de levar o TÍTULO e apontar para o Mural');
  ok(salvar.indexOf('var _wantPush') < salvar.indexOf("muralInlineEdit=null;persistAdm();renderAdmSec('mural')"),
    'a caixa tem de ser lida ANTES do re-render (renderAdmSec destrói o editor)');
}

// ── O handler: acha o item, confirma, envia, e NÃO altera o card ───────────
{
  const i = html.indexOf("main.querySelectorAll('[data-adm-pushav]')");
  ok(i > 0, 'o listener do botão de notificar sumiu');
  const bloco = html.slice(i, html.indexOf("main.querySelectorAll('[data-adm-hideradar]')", i));

  ok(/\(admAvisos\|\|\[\]\)\.concat\(radarAvisos\|\|\[\]\)/.test(bloco),
    '⚠️ a busca do item deixou de olhar `radarAvisos` — é justamente lá que mora a notícia trazida pelo radar');
  ok(/if\(!confirm\(/.test(bloco) && /Não dá para cancelar depois de enviado/.test(bloco),
    '⚠️ sumiu a confirmação: o envio vai para TODOS os aparelhos e não tem desfazer');
  ok(bloco.indexOf('confirm(') < bloco.indexOf('admSendPush('),
    'a confirmação tem de vir ANTES do envio, não depois');
  ok(/body:titulo/.test(bloco),
    '⚠️ o corpo da notificação deixou de ser o TÍTULO do item — quem recebe precisa saber o que aconteceu, não que "há novidade"');
  ok(/title:bn\?'🚨 Breaking News'/.test(bloco),
    'breaking news perdeu o rótulo próprio na notificação');
  ok(/url:'https:\/\/www\.endodirect\.com\.br\/#mural'/.test(bloco),
    '⚠️ o link do push tem de levar ao MURAL: mandar para o site da farmacêutica tira o aluno da plataforma');

  // ⚠️ O ponto que motivou o botão: notificar NÃO pode mexer no item. Se este
  // handler gravar, volta o defeito que se queria evitar — perder o `sourceId`
  // e ver a mesma notícia entrar de novo na próxima captação.
  ['saveRemoteState(', 'persistAdm(', 'delete av.', 'av.sourceId=', 'radarAvisos='].forEach((t) => {
    ok(bloco.indexOf(t) < 0,
      '⚠️ o botão de notificar passou a ESCREVER (`' + t + '`) — ele só pode ler; alterar o card apaga o `sourceId` e a próxima captação duplica a notícia');
  });
  ok(/b\.disabled=true/.test(bloco) && /b\.disabled=false/.test(bloco),
    'o botão tem de travar durante o envio: dois cliques são duas notificações');
}

// ── A confirmação mostra o texto que vai sair ──────────────────────────────
// Confirmação genérica ("tem certeza?") não protege de nada: o que evita o
// disparo errado é ler o título antes de mandar.
{
  const i = html.indexOf("main.querySelectorAll('[data-adm-pushav]')");
  const bloco = html.slice(i, html.indexOf("main.querySelectorAll('[data-adm-hideradar]')", i));
  ok(/confirm\([^)]*\+titulo\+/.test(bloco),
    '⚠️ a confirmação deixou de mostrar o título — "tem certeza?" sem o texto não impede disparo errado');
}

// ── O envio reaproveita o caminho já gated do painel ───────────────────────
{
  ok(/function admSendPush\(payload\)/.test(html), 'o helper de push do painel sumiu');
  const i = html.indexOf('function admSendPush(payload)');
  const helper = html.slice(i, i + 600);
  ok(/Authorization:'Bearer '\+token/.test(helper) && /action:'push'/.test(helper),
    'o push tem de continuar passando pelo endpoint de admin autenticado');
}

// ── O contrato do servidor não mudou ───────────────────────────────────────
{
  const api = fs.readFileSync(path.join(__dirname, '..', 'api', 'admin', 'refresh-radar.js'), 'utf8');
  ok(/payload\.action === 'push'/.test(api) && /push\.sendToAll\(/.test(api),
    'a rota de push do painel sumiu do servidor');
  ok(/title\.slice\(0, 120\)/.test(api) && /\.slice\(0, 300\)/.test(api),
    'os cortes de título/corpo do push sumiram — payload sem teto estoura no serviço de push');
}

// ── O caminho FUNCIONA, não só está escrito ────────────────────────────────
// ⚠️ Conferir texto no fonte prova que a linha existe, não que ela roda. Aqui o
// handler é executado num mundo de mentira: um card do RADAR entra, o confirm é
// aceito, e o que sai é inspecionado.
{
  const i = html.indexOf("main.querySelectorAll('[data-adm-pushav]')");
  const corpo = html.slice(i, html.indexOf("main.querySelectorAll('[data-adm-hideradar]')", i));
  const ctx = vm.createContext({ console: console, Promise: Promise });
  vm.runInContext(
    'var admAvisos=[];'
    + 'var radarAvisos=[{titulo:"FDA approves Mounjaro to reduce cardiovascular risk",'
      + 'tipo:"Comunicado",breaking:true,sourceId:"news:abc",link:"https://investor.lilly.com/x"}];'
    + 'var antes=JSON.stringify(radarAvisos);'
    + 'function avisoKeyStr(a){return String((a&&(a.sourceId||a.link||a.titulo))||"");}'
    + 'function ldHTML(){return "...";}'
    + 'var _notify=[];function notify(m,t){_notify.push([m,t]);}'
    + 'var _conf=null;function confirm(m){_conf=m;return true;}'
    + 'var _push=null;function admSendPush(p){_push=p;return Promise.resolve({ok:true,push:{sent:3,failed:0}});}'
    + 'var _btn={dataset:{admPushav:"news:abc"},disabled:false,innerHTML:"",addEventListener:function(ev,fn){this._fn=fn;}};'
    + 'var main={querySelectorAll:function(){return [_btn];}};'
    + corpo
    + '\n_btn._fn();', ctx);
  ok(ctx._conf && ctx._conf.indexOf('Mounjaro') >= 0,
    '⚠️ o confirm não mostrou o título que vai ser enviado — confirmação sem o texto não impede disparo errado');
  ok(ctx._push && ctx._push.body === 'FDA approves Mounjaro to reduce cardiovascular risk',
    'o corpo da notificação não é o título do item');
  ok(ctx._push && ctx._push.title === '🚨 Breaking News', 'item breaking não saiu com o rótulo de breaking');
  ok(ctx._push && /#mural$/.test(ctx._push.url), 'a notificação não leva ao mural');
  ok(JSON.stringify(ctx.radarAvisos) === ctx.antes,
    '⚠️ notificar ALTEROU o item do radar — é exatamente o que o botão existe para evitar: mexer no card apaga o `sourceId` e a próxima captação duplica a notícia');
  // Recusar no confirm não pode enviar nada.
  const ctx2 = vm.createContext({ console: console, Promise: Promise });
  vm.runInContext(
    'var admAvisos=[];var radarAvisos=[{titulo:"x",tipo:"Comunicado",sourceId:"news:abc"}];'
    + 'function avisoKeyStr(a){return String((a&&(a.sourceId||a.link||a.titulo))||"");}'
    + 'function ldHTML(){return "...";}function notify(){}'
    + 'function confirm(){return false;}'
    + 'var _push=null;function admSendPush(p){_push=p;return Promise.resolve({ok:true,push:{sent:1}});}'
    + 'var _btn={dataset:{admPushav:"news:abc"},disabled:false,innerHTML:"",addEventListener:function(ev,fn){this._fn=fn;}};'
    + 'var main={querySelectorAll:function(){return [_btn];}};'
    + corpo + '\n_btn._fn();', ctx2);
  ok(ctx2._push === null,
    '⚠️ recusar a confirmação MANDOU a notificação assim mesmo — o aviso vira só um incômodo antes do estrago');
}

if (falhas.length) { console.error('✗ ' + falhas.length + ' falha(s):\n - ' + falhas.join('\n - ')); process.exit(1); }
console.log('✓ push do mural: botão no card VIVO, confirma com o texto à vista, manda o título, não escreve no item; editor propõe o push quando o tipo vira Breaking News');
