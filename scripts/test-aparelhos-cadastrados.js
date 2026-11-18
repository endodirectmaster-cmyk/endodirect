// Regressão: aparelhos cadastrados (professor, 18/11/2026: "Provavelmente fizeram uma assinatura para várias
// pessoas ao mesmo tempo compartilharem ... bloquear ao máximo esse tipo de acesso coletivo"; escolheu
// "Bloquear e trocar no Perfil" e "Painel de contas suspeitas").
// A conta fica em até 2 aparelhos cadastrados; num 3º, o aparelho não entra: o aluno remove um dos
// cadastrados (tela de bloqueio ou Perfil > Meus aparelhos), no máximo 2 trocas a cada 30 dias. O professor
// vê as contas com sinal de uso coletivo nos Estudantes e libera trocas ou desconecta aparelhos.
// As regras são do servidor (supabase/aparelhos-cadastrados.sql, testadas no banco numa transação desfeita
// em 18/11); aqui ficam presos o arquivo SQL, a tela e a fiação.
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { JSDOM, VirtualConsole } = require('jsdom');

const raiz = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(raiz, 'index.html'), 'utf8');
const sql = fs.readFileSync(path.join(raiz, 'supabase', 'aparelhos-cadastrados.sql'), 'utf8');
const falhas = [];
function ok(cond, msg) { if (!cond) falhas.push(msg); }
function corpo(nome) {
  const i = html.indexOf('\nfunction ' + nome + '(');
  if (i < 0) throw new Error('função ' + nome + ' não encontrada');
  let d = 0;
  for (let j = html.indexOf('{', i); j < html.length; j++) {
    if (html[j] === '{') d++;
    else if (html[j] === '}') { d--; if (!d) return html.slice(i, j + 1); }
  }
  throw new Error('não fechou ' + nome);
}

// 1) SQL: regras no servidor, sem a palavra que o conector recusa, sem brecha pela API
ok(!/delete/i.test(sql), 'o SQL não pode ter a palavra DELETE (o conector do Supabase recusa; e nada é apagado: o histórico é do painel)');
ok(/revoke all on public\.endodirect_devices from authenticated, anon;\s*grant select on public\.endodirect_devices to authenticated;/.test(sql),
  'o aluno não pode mexer na tabela de aparelhos pela API (antes podia apagar a própria linha e liberar vaga sem gastar troca)');
['endodirect_aparelho_entrar', 'endodirect_session_claim', 'endodirect_session_check', 'endodirect_aparelhos_meus', 'endodirect_aparelho_remover',
  'endodirect_aparelhos_admin', 'endodirect_aparelhos_admin_liberar'].forEach((f) => ok(new RegExp('create or replace function public\\.' + f + '\\(').test(sql), 'SQL sem a função ' + f));
const entrar = sql.slice(sql.indexOf('function public.endodirect_aparelho_entrar('), sql.indexOf('function public.endodirect_session_claim('));
ok(/v_limite int := 2/.test(entrar) && /return 'cheio';/.test(entrar) && /if v_ativos < v_limite then/.test(entrar), 'servidor: 2 vagas; com as 2 ocupadas, o aparelho novo recebe "cheio"');
ok(/revogado_motivo = 'inativo'[\s\S]*?last_seen < now\(\) - interval '30 days'/.test(entrar), 'servidor: vaga parada há 30 dias volta sozinha');
ok(/endodirect_aparelhos_isento\(v_uid\)/.test(entrar) && /endodirect_email_de_teste\(u\.email\)/.test(sql), 'servidor: contas de demonstração/revisão e professores fora do limite');
ok(/pg_advisory_xact_lock/.test(entrar), 'servidor: dois logins ao mesmo tempo não ocupam a mesma vaga');
const remover = sql.slice(sql.indexOf('function public.endodirect_aparelho_remover('), sql.indexOf('function public.endodirect_aparelhos_admin('));
ok(/if coalesce\(v_usadas, 0\) >= 2 then/.test(remover) && /'motivo', 'limite'/.test(remover), 'servidor: no máximo 2 trocas a cada 30 dias');
ok(/device_id is distinct from p_device_id/.test(remover), 'servidor: o aparelho não remove a si mesmo (troca é para tirar OUTRO)');
ok(/interval '30 days'/.test(sql.slice(sql.indexOf('function public.endodirect_aparelhos_trocas('), sql.indexOf('function public.endodirect_aparelho_entrar('))), 'servidor: trocas contadas em 30 dias');
ok(/raise exception 'forbidden'/.test(sql.slice(sql.indexOf('function public.endodirect_aparelhos_admin('))), 'servidor: painel e liberação só para o professor');
ok(/'zerado_em'/.test(sql) && /revogado_motivo = 'professor'/.test(sql), 'servidor: o professor libera as trocas e desconecta aparelhos');

// 2) Tela (jsdom)
const vc = new VirtualConsole(); vc.on('jsdomError', function () {});
const dom = new JSDOM('<body><div id="perfil-aparelhos" style="display:none"></div></body>', { url: 'https://www.endodirect.com.br/', runScripts: 'outside-only', virtualConsole: vc });
const ctx = vm.createContext(dom.getInternalVMContext());
vm.runInContext(`
  var currentUser={id:'u1',role:'aluno',email:'a@b.c'},deviceSlot={uid:null,ok:false,emVoo:false},chamadas=[],avisos=[],saiu=0,confirma=true;
  var respostas={};
  function esc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
  function getDeviceId(){return 'dev_este_123456';}
  function notify(m,t){avisos.push(m);}
  function doLogout(){saiu++;}
  function confirm(){return confirma;}
  function claimDeviceSlot(){chamadas.push(['claim']);}
  function getSupabaseClient(){return {rpc:function(n,a){chamadas.push([n,a]);var r=respostas[n];return Promise.resolve(typeof r==='function'?r(a):r);}};}
`, ctx);
['aparelhoNome', 'aparelhoData', 'aparelhoDia', 'aparelhosListaHTML', 'aparelhosTrocasHTML', 'aparelhosCarregar', 'aparelhoRemover', 'aparelhoBloqueadoFechar',
  'aparelhoBloqueadoMostrar', 'aparelhosPerfilRender'].forEach((n) => vm.runInContext(corpo(n), ctx));
const run = (c) => vm.runInContext(c, ctx);
const doc = dom.window.document;
const espera = () => new Promise((r) => setTimeout(r, 0));

const nomes = {
  'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 EndodirectApp/1.3 (ios)': 'iPhone · app Endodirect',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.7 Mobile/15E148 Safari/604.1': 'iPhone · Safari',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36': 'Windows · Chrome',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0': 'Windows · Edge',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Safari/605.1.15': 'Mac · Safari',
  'Mozilla/5.0 (Linux; Android 15; SM-S921B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36': 'Android · Chrome',
  '': 'Aparelho · navegador',
};
Object.keys(nomes).forEach((ua) => ok(run('aparelhoNome(' + JSON.stringify(ua) + ')') === nomes[ua], 'nome do aparelho: ' + nomes[ua] + ' (veio ' + run('aparelhoNome(' + JSON.stringify(ua) + ')') + ')'));

const dados = {
  limite: 2, trocas_max: 2, trocas_usadas: 1, proxima_troca: null, isento: false, este_ativo: false,
  aparelhos: [
    { ref: 'r1', ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) EndodirectApp/1.3 (ios)', visto: '2026-11-17T23:40:00Z', este: false },
    { ref: 'r"2<', ua: 'Mozilla/5.0 (Windows NT 10.0) Chrome/142.0.0.0 Safari/537.36', visto: '2026-11-16T10:00:00Z', este: false },
  ],
};
ctx.__d = dados;
let h = run('aparelhosListaHTML(__d,true)');
ok((h.match(/data-aparelho-remover=/g) || []).length === 2 && /Remover e entrar aqui/.test(h), 'tela de bloqueio: cada aparelho cadastrado tem "Remover e entrar aqui"');
ok(/data-aparelho-remover="r&quot;2&lt;"/.test(h) && !/r"2</.test(h), 'referência do aparelho escapada no HTML');
ok(/iPhone · app Endodirect/.test(h) && /Windows · Chrome/.test(h) && /Último uso:/.test(h), 'lista com nome legível e último uso');
ok(/1 de 2<\/b> nos últimos 30 dias/.test(run('aparelhosTrocasHTML(__d,true)')), 'mostra as trocas usadas no mês');
run('__d.trocas_usadas=2;__d.proxima_troca="2026-12-10T12:00:00Z"');
h = run('aparelhosListaHTML(__d,true)');
ok(!/data-aparelho-remover/.test(h), 'sem trocas no mês: nenhum botão de remover');
ok(/A próxima fica disponível em <b>10\/12<\/b>/.test(run('aparelhosTrocasHTML(__d,true)')), 'sem trocas: diz quando volta a poder trocar');
run('__d.trocas_usadas=1;__d.proxima_troca=null;__d.aparelhos[0].este=true');
h = run('aparelhosListaHTML(__d,false)');
ok(/Este aparelho/.test(h) && (h.match(/data-aparelho-remover=/g) || []).length === 1 && /Remover</.test(h), 'Perfil: "Este aparelho" sem botão; o outro com "Remover"');

(async () => {
  // Tela de bloqueio: carrega, remove (confirmado) e pede vaga de novo
  run('__d.aparelhos[0].este=false;respostas.endodirect_aparelhos_meus={data:__d};respostas.endodirect_aparelho_remover={data:{ok:true,trocas_usadas:2}};chamadas.length=0');
  run('aparelhoBloqueadoMostrar()');
  await espera(); await espera();
  const ov = doc.getElementById('aparelho-bloq-ov');
  ok(!!ov && /Sua conta já está em 2 aparelhos/.test(ov.textContent) && ov.querySelectorAll('[data-aparelho-remover]').length === 2, 'tela de bloqueio: título e os 2 aparelhos com botão de remover');
  ok(/contato@endodirect\.com\.br/.test(ov.textContent) && !!doc.getElementById('aparelho-bloq-sair'), 'tela de bloqueio: Sair e o contato do suporte');
  ok(run("chamadas[0][0]==='endodirect_aparelhos_meus'&&chamadas[0][1].p_device_id==='dev_este_123456'"), 'tela de bloqueio: busca os aparelhos com o id deste aparelho');
  ov.querySelector('[data-aparelho-remover="r1"]').click();
  await espera(); await espera();
  ok(run("chamadas.some(function(c){return c[0]==='endodirect_aparelho_remover'&&c[1].p_ref==='r1'&&c[1].p_device_id==='dev_este_123456';})"), 'remover: manda a referência do aparelho escolhido');
  ok(run("chamadas[chamadas.length-1][0]==='claim'") && run('deviceSlot.ok===false&&deviceSlot.emVoo===false'), 'depois de remover, este aparelho pede a vaga de novo (registro zerado)');
  run('confirma=false;chamadas.length=0');
  ov.querySelector('[data-aparelho-remover]') && ov.querySelector('[data-aparelho-remover]').click();
  await espera();
  ok(run('chamadas.length') === 0, 'sem confirmar, nada é removido');
  doc.getElementById('aparelho-bloq-sair').click();
  ok(run('saiu') === 1, 'Sair na tela de bloqueio encerra a sessão');
  run('aparelhoBloqueadoFechar()');
  ok(!doc.getElementById('aparelho-bloq-ov'), 'a tela de bloqueio fecha');
  // Remoção recusada pelo limite: avisa a data
  run("confirma=true;respostas.endodirect_aparelho_remover={data:{ok:false,motivo:'limite',proxima_troca:'2026-12-10T12:00:00Z'}};avisos.length=0");
  run('aparelhoRemover("r1",function(){})');
  await espera();
  ok(run('avisos[0]') && /2 trocas/.test(run('avisos[0]')) && /10\/12/.test(run('avisos[0]')), 'limite de trocas: o aluno vê quando poderá trocar');

  // Perfil
  run('respostas.endodirect_aparelhos_meus={data:__d}');
  run('aparelhosPerfilRender()');
  await espera(); await espera();
  const box = doc.getElementById('perfil-aparelhos');
  ok(box.style.display === '' && /Meus aparelhos/.test(box.textContent) && /Sair da conta não libera a vaga/.test(box.textContent), 'Perfil: cartão "Meus aparelhos" com a regra');
  run("respostas.endodirect_aparelhos_meus={data:{isento:true,aparelhos:[]}}");
  run('aparelhosPerfilRender()');
  await espera(); await espera();
  ok(/sem limite de aparelhos/.test(box.textContent), 'conta de demonstração: sem limite');
  run("currentUser.role='admin';document.getElementById('perfil-aparelhos').innerHTML='';document.getElementById('perfil-aparelhos').style.display='none'");
  run('aparelhosPerfilRender()');
  ok(box.innerHTML === '', 'professor: sem o cartão');

  // 3) Painel do professor
  vm.runInContext('var admCurrentSec="estudantes";' + html.slice(html.indexOf('var admAparData=null'), html.indexOf('function admAparelhosRedesenha(')), ctx);
  run('admAparData=[]');
  ok(/Nenhuma conta com sinal de compartilhamento/.test(run('admAparelhosHTML()')), 'painel: lista vazia diz que está tudo bem');
  run("admAparData=[{user_id:'u9',email:'x@y.z',nome:'<b>Grupo</b>',aparelhos_30d:6,trocas_30d:2,aparelhos_bloqueados_30d:3,bloqueios_30d:5,ultimo:'2026-11-18T01:00:00Z'}]");
  h = run('admAparelhosHTML()');
  ok(/data-apar-liberar="u9"/.test(h) && /data-apar-desconectar="u9"/.test(h), 'painel: Liberar trocas e Desconectar aparelhos');
  ok(/&lt;b&gt;Grupo/.test(h) && !/<b>Grupo/.test(h), 'painel: nome escapado');
  ok(/Aparelhos diferentes: <b>6<\/b>/.test(h) && /Trocas: <b>2<\/b>/.test(h) && /Aparelhos barrados: <b>3<\/b> \(5 tentativas\)/.test(h), 'painel: números do mês');

  // 4) Fiação
  const claim = corpo('claimDeviceSlot');
  ok(/client\.rpc\('endodirect_aparelho_entrar'/.test(claim) && /st==='cheio'&&deviceSlot===meu\)\{meu\.bloqueado=true;try\{aparelhoBloqueadoMostrar\(\);/.test(claim), 'registro: usa a RPC nova e mostra a tela de troca com as vagas cheias');
  ok(/if\(deviceSlot\.bloqueado&&deviceSlot\.uid===currentUser\.id\)return;/.test(corpo('deviceTick')), 'aparelho barrado: a batida de coração não fica pedindo vaga');
  ok(/signOut\(\{scope:'local'\}\)/.test(corpo('onSessionEvicted')), 'aparelho removido: sai só dele');
  ok(/try\{aparelhoBloqueadoFechar\(\);\}catch\(e\)\{\}/.test(corpo('doLogout')), 'Sair fecha a tela de bloqueio');
  ok(/<div id="perfil-aparelhos" style="display:none;margin-top:1rem"><\/div>/.test(corpo('renderPerfil')) && /aparelhosPerfilRender\(\)/.test(corpo('renderPerfil')), 'Perfil: lugar do cartão e desenho');
  ok(/'<div id="adm-aparelhos">'\+admAparelhosHTML\(\)\+'<\/div>/.test(html) && /carregaAdmAparelhos\(admAparelhosRedesenha,true\)/.test(html), 'Estudantes: painel de contas suspeitas carregado');
  ok(/client\.rpc\('endodirect_aparelhos_admin_liberar',\{p_user:uid,p_desconectar:desc\}\)/.test(html), 'painel: botões chamam a liberação');
  // FAQ (professor, 18/11: "frisar isso também no FAQ ... até no máximo 2 dispositivos e que não é permitido compartilhar usuário e senha")
  const faqLp = (html.match(/<details><summary>Em quantos aparelhos posso usar\? Posso compartilhar a conta\?<\/summary><p>[\s\S]*?<\/p><\/details>/) || [''])[0];
  const faqSup = (html.match(/<div class="faq-q">Em quantos aparelhos posso usar\? Posso compartilhar a conta\? <span>▾<\/span><\/div><div class="faq-a">[\s\S]*?<\/div><\/div>/) || [''])[0];
  [['página inicial', faqLp], ['Suporte', faqSup]].forEach(([onde, f]) => ok(/não é permitido compartilhar usuário e senha/.test(f) && /até <b>2 aparelhos<\/b>/.test(f) && /Perfil &gt; Meus aparelhos/.test(f) && /2 vezes a cada 30 dias/.test(f), 'FAQ (' + onde + '): 2 aparelhos, sem compartilhar usuário e senha, troca no Perfil'));

  if (falhas.length) {
    console.error('✗ Aparelhos cadastrados:');
    falhas.forEach((f) => console.error('  - ' + f));
    process.exit(1);
  }
  console.log('✓ Aparelhos cadastrados: 2 por conta, aparelho novo barrado com troca (até 2 por mês), Perfil > Meus aparelhos e painel de contas suspeitas para o professor');
})().catch((e) => { console.error('✗ Aparelhos cadastrados: ' + (e && e.stack || e)); process.exit(1); });
