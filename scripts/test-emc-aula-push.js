// Aula nova de Educação Médica Continuada → notificação no celular (07/11/2026).
//
// Pedido do professor: "Quando tiver uma aula nova de educação médica continuada, avisar os
// alunos como post de notificação no celular."
//
// O que este teste prende:
//   1. a mensagem: título fixo do programa, corpo com o título da aula e link
//      /#cursos/emc-<at>, pelo mesmo canal dos avisos do mural (admSendPush, action 'push');
//   2. o aviso só sai DEPOIS de a aula estar gravada no servidor (queueRemoteStateSave(true)),
//      só para aula NOVA do curso `emc` e só com a caixa "🔔 Avisar" marcada; falhou o save ou
//      o envio, o professor é avisado e a aula não fica marcada como avisada;
//   3. o card da aula da EMC tem o botão 🔔 (reenvio pede confirmação);
//   4. o link: /#cursos/<curso>-<at> vira pedido de painel; o curso abre quando fica
//      acessível (ou com aula-amostra), na subespecialidade da aula liberada; o pedido vale
//      uma vez e não fica preso se o curso não abre para o aluno.
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const SRC = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
let bad = 0;
const ok = (nome, cond, det) => { if (cond) return; bad++; console.log('  ✗ ' + nome + (det ? ' — ' + det : '')); };

function extrai(nome) {
  const i = SRC.indexOf('function ' + nome + '(');
  if (i < 0) return '';
  let nivel = 0;
  for (let k = SRC.indexOf('{', i); k < SRC.length; k++) {
    if (SRC[k] === '{') nivel++;
    else if (SRC[k] === '}') { nivel--; if (!nivel) return SRC.slice(i, k + 1); }
  }
  return '';
}

// ---- 1 e 2. a mensagem e o envio ---------------------------------------------------------
const NOMES = ['emcPushPayload', 'avisarAulaEmc', 'aplicarCursoLinkPendente', 'lerLinkDoEndereco', 'abrirPainelDoLink', 'abrirLinkNoPainelDoProfessor'];
const ctx = { String, Math, Array, Object, Promise, Date, JSON };
vm.createContext(ctx);
vm.runInContext(NOMES.map(extrai).join('\n') + `
  var EMC_SLUG='emc';var LINK_PAINEIS={qotd:1,mural:1,aovivo:1,'excluir-conta':1,cursos:1};
  var avisos=[],enviados=[],salvos=0,repintou=[],respostaPush={ok:true,push:{sent:3}};
  var admCurrentSec='cursos',admCursoSubtab='ver';
  function notify(m,t){avisos.push([t,m]);}
  function persistCursos(){salvos++;}
  function renderAdmSec(s){repintou.push(s);}
  function admSendPush(p){enviados.push(p);return respostaPush instanceof Error?Promise.reject(respostaPush):Promise.resolve(respostaPush);}
  var cursoFilter='',cursoMod='',cursoLinkPendente=null,acessos=[],pendentes=false,admCursos=[],painel=[];
  var window={location:{hash:''}};
  function cursoAcessivel(s){return acessos.indexOf(s)>=0;}
  function aulaLiberada(c){return !!(c&&(cursoAcessivel(c.curso)||c.free));}
  function cursoTemLiberada(s){return admCursos.some(function(c){return c&&c.curso===s&&aulaLiberada(c);});}
  function acessosPendentes(){return pendentes;}
  function canSeePanel(){return true;}
  function goPanel(p){painel.push(p);}
  var perfilRolarExclusao=false,qotdArchOpen=null,qotdArchAuto=true,qotdArchRolar=false;
`, ctx);
NOMES.forEach((f) => ok(f + ' foi extraída', vm.runInContext('typeof ' + f, ctx) === 'function'));
const run = (c) => vm.runInContext(c, ctx);

const msg = run(`emcPushPayload({title:'Análogo do GLP-1 no Diabetes tipo 1',at:1794055306289})`);
ok('título do programa', msg.title === '🎓 Nova aula · Educação Médica Continuada', msg.title);
ok('corpo = título da aula', msg.body === 'Análogo do GLP-1 no Diabetes tipo 1', msg.body);
ok('link abre o curso na aula', msg.url === 'https://www.endodirect.com.br/#cursos/emc-1794055306289', msg.url);
ok('aula sem título ainda tem corpo', run(`emcPushPayload({}).body`).length > 10);

(async () => {
  run(`var aula={title:'X',curso:'emc',at:1794055306289};`);
  const r1 = await run(`avisarAulaEmc(aula)`);
  ok('envio ok: devolve true, usa admSendPush e marca pushAt', r1 === true && run('enviados.length') === 1 && run('typeof aula.pushAt') === 'number' && run('salvos') === 1);
  ok('envio ok: diz quantos celulares', /3 celulares/.test(run('avisos[avisos.length-1][1]')), run('avisos[avisos.length-1][1]'));
  ok('envio ok: repinta a lista (botão vira "Avisada em")', run('repintou.join()') === 'cursos');
  run(`repintou=[];admCursoSubtab='importar';aula2={title:'Y',curso:'emc',at:2};`);
  await run(`avisarAulaEmc(aula2)`);
  ok('no formulário não repinta (apagaria o que está sendo digitado)', run('repintou.length') === 0);
  run(`respostaPush={ok:false,error:'VAPID ausente'};aula3={title:'Z',curso:'emc',at:3};salvos=0;`);
  const r3 = await run(`avisarAulaEmc(aula3)`);
  ok('servidor recusou: false, sem pushAt, aviso de erro', r3 === false && run('aula3.pushAt') === undefined && run('salvos') === 0 && run('avisos[avisos.length-1][0]') === 'err');
  run(`respostaPush=new Error('rede');aula4={title:'W',curso:'emc',at:4};`);
  const r4 = await run(`avisarAulaEmc(aula4)`);
  ok('rede caiu: false, sem pushAt, aviso de erro', r4 === false && run('aula4.pushAt') === undefined && /rede/.test(run('avisos[avisos.length-1][1]')));

  // O gancho no "+ Adicionar aula".
  const add = SRC.slice(SRC.indexOf("var bAddCurso=document.getElementById('btn-adm-addcurso');"), SRC.indexOf("var cCancelCurso=document.getElementById('btn-adm-cancelcurso');"));
  ok('adicionar: só aula nova do curso emc, com a caixa marcada', /if\(nova\.curso===EMC_SLUG&&pushEl&&pushEl\.checked\)\{/.test(add));
  ok('adicionar: grava no servidor primeiro e só então avisa', /Promise\.resolve\(queueRemoteStateSave\(true\)\)\.then\(function\(salvo\)\{\s*if\(salvo\)return avisarAulaEmc\(nova\);/.test(add));
  ok('adicionar: save falhou → explica e aponta o botão 🔔', /o aviso no celular não saiu\. Quando aparecer “Salvo”, use o botão 🔔 Avisar no celular/.test(add));
  ok('editar aula não avisa', add.indexOf("persistCursos();notify('Aula atualizada!','ok');") > 0 && add.indexOf('avisarAulaEmc') > add.indexOf("notify('Aula atualizada!','ok')"));
  const form = extrai('admCursosHTML');
  ok('formulário: caixa 🔔 só para aula nova, marcada, visível quando o curso é a EMC',
    form.indexOf(`+(ed?'':'<label id="adm-curso-push-row" style="display:'+((admCursoFiltro||'')===EMC_SLUG?'flex':'none')`) > 0 && form.indexOf('<input type="checkbox" id="adm-curso-push" checked>') > 0);
  ok('formulário: trocar o curso mostra/esconde a caixa', SRC.indexOf("cSelCurso.addEventListener('change',function(){cPushRow.style.display=cSelCurso.value===EMC_SLUG?'flex':'none';});") > 0);

  // ---- 3. o botão no card ---------------------------------------------------------------
  ok('card: botão 🔔 só nas aulas da EMC', /\(c\.curso===EMC_SLUG\?'<button class="btn btn-outline btn-sm" data-adm-pushcurso="'\+i\+'"/.test(form));
  ok('card: reenvio pede confirmação', SRC.indexOf("if(c.pushAt&&!confirm('Esta aula já foi avisada em '") > 0 && SRC.indexOf('avisarAulaEmc(c,b);') > 0);
  ok('canal: o mesmo dos avisos do mural', /function admSendPush\(payload\)\{[\s\S]{0,300}JSON\.stringify\(Object\.assign\(\{action:'push'\},payload\|\|\{\}\)\)/.test(SRC));

  // ---- 4. o link ---------------------------------------------------------------------------
  run(`window.location.hash='#cursos/emc-1794055306289';`);
  ok('/#cursos/emc-<at> vira pedido', JSON.stringify(run('lerLinkDoEndereco()')) === JSON.stringify({ p: 'cursos', arg: 'emc-1794055306289' }));
  run(`window.location.hash='#cursos/<x>';`);
  ok('link malformado não vira pedido', run('lerLinkDoEndereco()') === null);
  run(`painel=[];abrirPainelDoLink({p:'cursos',arg:'emc-1794055306289'});`);
  ok('abre o painel Cursos com o pedido guardado', run('painel.join()') === 'cursos' && JSON.stringify(run('cursoLinkPendente')) === JSON.stringify({ slug: 'emc', at: 1794055306289 }));
  // Gold: o curso e a subespecialidade da aula.
  run(`admCursos=[{curso:'emc',at:1,free:true,modulo:'Obesidade'},{curso:'emc',at:1794055306289,modulo:'Diabetes'}];acessos=['emc'];aplicarCursoLinkPendente();`);
  ok('Gold: abre a EMC na subespecialidade da aula nova', run('cursoFilter') === 'emc' && run('cursoMod') === 'Diabetes' && run('cursoLinkPendente') === null);
  run(`cursoFilter='';cursoMod='';aplicarCursoLinkPendente();`);
  ok('o pedido vale uma vez', run('cursoFilter') === '');
  // Sem Gold, com aula-amostra: abre o curso (a amostra e o convite), sem a subespecialidade da aula trancada.
  run(`acessos=[];cursoLinkPendente={slug:'emc',at:1794055306289};aplicarCursoLinkPendente();`);
  ok('sem Gold: abre o curso pela amostra, sem entrar na aula trancada', run('cursoFilter') === 'emc' && run('cursoMod') === '' && run('cursoLinkPendente') === null);
  // Acessos ainda chegando: espera; depois de conhecidos e sem acesso: desiste.
  run(`cursoFilter='';admCursos=[];pendentes=true;cursoLinkPendente={slug:'emc',at:5};aplicarCursoLinkPendente();`);
  ok('acessos chegando: o pedido espera', run('cursoFilter') === '' && run('cursoLinkPendente') !== null);
  run(`pendentes=false;aplicarCursoLinkPendente();`);
  ok('sem acesso e sem amostra: o pedido sai e o aluno fica na grade de cursos', run('cursoFilter') === '' && run('cursoLinkPendente') === null);
  ok('renderCursosAluno aplica o pedido antes de tudo', /function renderCursosAluno\(\)\{\s*try\{aplicarCursoLinkPendente\(\);\}catch\(e\)\{\}/.test(SRC));
  ok('professor que toca o link cai em Cursos do painel', /if\(l\.p==='cursos'\)\{admCursoSubtab='ver';renderAdmSec\('cursos'\);return true;\}/.test(extrai('abrirLinkNoPainelDoProfessor')));

  if (bad) { console.log('\n' + bad + ' falha(s) no aviso de aula da EMC'); process.exit(1); }
  console.log('aviso de aula nova da EMC: ok');
})().catch((e) => { console.log('  ✗ erro: ' + (e && e.stack || e)); process.exit(1); });
