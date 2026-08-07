// Regressão: aula ao vivo dentro da plataforma.
//
// Pedido do professor (06/08/2026): "é possível fazer uma transmissão ao vivo
// dentro da plataforma? A ideia seria chamar mais pessoas para entrar na
// plataforma e assistir a aula dentro dela." E as duas regras que ele definiu:
//
//   1. AO VIVO → aberta a quem ENTRAR na plataforma, ou seja, exige cadastro de
//      quem não é aluno. Visitante não logado NÃO pode receber o link do stream.
//   2. GRAVAÇÃO → só assinante.
//
// A regra 1 é a que precisa de trava de verdade: se o link do stream saísse para
// o visitante, a aula deixaria de trazer alguém para dentro — que é o objetivo
// inteiro da funcionalidade. Por isso o corte é NO SERVIDOR (RPC), e este teste
// falha se ele voltar a ser só de tela.
const fs=require('fs');
const path=require('path');
const vm=require('vm');

const html=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
const falhas=[];
function ok(cond,msg){if(!cond)falhas.push(msg);}

function corpo(nome){
  const i=html.indexOf('function '+nome+'(');
  if(i<0)throw new Error('função '+nome+' não encontrada no index.html');
  let d=0;
  for(let j=html.indexOf('{',i);j<html.length;j++){
    if(html[j]==='{')d++;
    else if(html[j]==='}'){d--;if(!d)return html.slice(i,j+1);}
  }
  throw new Error('não fechou o corpo de '+nome);
}

// --- as fases derivam do relógio, com override manual --------------------------
const sandbox={Date};
vm.createContext(sandbox);
vm.runInContext('var aoVivoAgoraSkew=0;\n'+corpo('aoVivoAgora')+'\n'+corpo('aoVivoFase'),sandbox);
const {aoVivoFase}=sandbox;

const min=60000;
const emBreve={inicio:new Date(Date.now()+2*3600*1000).toISOString(),duracaoMin:90};
const agora={inicio:new Date(Date.now()-10*min).toISOString(),duracaoMin:90};
const passada={inicio:new Date(Date.now()-5*3600*1000).toISOString(),duracaoMin:90};

ok(aoVivoFase(null).fase==='nenhuma','sem aula, fase "nenhuma"');
ok(aoVivoFase(emBreve).fase==='agendada','aula futura = agendada');
ok(aoVivoFase(agora).fase==='ao_vivo','dentro da janela = ao vivo');
ok(aoVivoFase(passada).fase==='encerrada','depois da duração = encerrada');
ok(aoVivoFase({inicio:emBreve.inicio,duracaoMin:90,forcar:'ao_vivo'}).fase==='ao_vivo',
   'o professor precisa poder abrir ANTES da hora (a aula atrasa ou adianta)');
ok(aoVivoFase({inicio:agora.inicio,duracaoMin:90,forcar:'encerrada'}).fase==='encerrada',
   'o professor precisa poder encerrar ANTES do fim previsto');
ok(aoVivoFase({inicio:'não é data',duracaoMin:90}).fase==='nenhuma','data inválida não pode virar "ao vivo"');
ok(aoVivoFase(emBreve).falta>0,'a fase agendada precisa devolver quanto falta (contagem regressiva)');

// --- REGRA 1: o visitante não recebe o link — e o corte é no SERVIDOR ----------
const sql=fs.readFileSync(path.join(__dirname,'..','supabase','aula-ao-vivo.sql'),'utf8');
ok(/auth\.uid\(\)\s*is\s*not\s*null/.test(sql),
   'a RPC tem de decidir pelo auth.uid() se o chamador está logado');
ok(/a\s*:=\s*a\s*-\s*'src'/.test(sql),
   '⚠️ a RPC TEM de remover o link do stream para quem não está autenticado — sem isso a aula não traz ninguém para dentro');
ok(/grant execute on function public\.endodirect_aovivo\(\) to anon, authenticated/.test(sql),
   'a RPC precisa ser chamável por anon (faixa da landing) e por autenticado');
ok(/arquivada/.test(sql),'o professor tem de conseguir arquivar a aula');

// --- REGRA 1 (parte 2): quem se cadastrou assiste, mesmo em degustação ---------
const cansee=corpo('canSeePanel');
ok(/DEGUSTACAO_PANELS=\{aovivo:1/.test(html),
   'a degustação precisa enxergar o painel da aula ao vivo');
ok(/degExpired\(\)\)return id==='perfil'\|\|id==='support'\|\|id==='aovivo'/.test(cansee),
   '⚠️ quem já esgotou a degustação TEM de continuar vendo a aula ao vivo — é a isca para voltar');

// --- REGRA 2: a gravação é de assinante ---------------------------------------
const render=corpo('renderAoVivo');
ok(/currentPlanKey\(\)/.test(render),
   'a tela de "acabou" tem de distinguir assinante de não-assinante');
ok(/Assinar para ver a gravação/.test(render),
   'quem não assina tem de ver o convite para assinar, não a gravação');
ok(!/gravacao.*src|src.*gravacao/i.test(render),
   'a gravação NÃO pode ser servida por este painel — ela vira aula normal em Cursos, onde o acesso por pacote já existe');

// --- fonte agnóstica: Bunny (HLS), Vimeo, YouTube ------------------------------
const player=corpo('aoVivoPlayerHTML');
ok(/m3u8/.test(player),'tem de aceitar HLS (.m3u8) — é o que o Bunny entrega e o que já tocamos na landing');
ok(/vimeoId\(/.test(player)&&/ytId\(/.test(player),'tem de aceitar Vimeo e YouTube também');
const hls=corpo('aoVivoMontarHls');
ok(/canPlayType\('application\/vnd\.apple\.mpegurl'\)/.test(hls),'Safari toca HLS nativo — não pode forçar a biblioteca');
ok(/window\.Hls&&window\.Hls\.isSupported\(\)/.test(hls),'os demais navegadores precisam do hls.js');

// --- a aula começa com a plataforma ABERTA ------------------------------------
ok(/function aoVivoIniciarPoll\(/.test(html)&&/setInterval\(function\(\)\{carregarAoVivo\(\);\},\s*60000\)/.test(html),
   '⚠️ sem reconsulta periódica o aluno só veria a aula depois de um F5 — e ninguém dá F5 esperando aula começar');
const carregar=corpo('carregarAoVivo');
ok(/aoVivoAgoraSkew=t-Date\.now\(\)/.test(carregar),
   'o horário tem de vir do SERVIDOR: relógio errado no aparelho do aluno não pode adiantar nem atrasar a aula');

// --- o aviso automático não pode repetir --------------------------------------
const lib=fs.readFileSync(path.join(__dirname,'..','lib','aovivo.js'),'utf8');
ok(/aovivo_sent/.test(lib),'o envio tem de ser registrado para não repetir');
ok(/ja avisado/.test(lib),'o envio repetido tem de ser barrado explicitamente');
ok(/ini < agora/.test(lib)||/ini\s*<\s*agora/.test(lib),
   'não pode convidar para aula que já começou/passou');
ok(/sendToAll/.test(lib),'o aviso tem de sair também por notificação no celular');
ok(/List-Unsubscribe/.test(lib),'o e-mail precisa de descadastro de 1 clique');
ok(/aovivo_sent/.test(sql)&&/server_keys/.test(sql),
   '⚠️ aovivo_sent tem de estar nas chaves do servidor — senão um save do painel apaga o registro e o aviso sai de novo');

// --- o cron não pode cair por causa disto -------------------------------------
const cron=fs.readFileSync(path.join(__dirname,'..','api','cron','endocrine-radar.js'),'utf8');
const i=cron.indexOf('sendAvisoAoVivo()');
ok(i>0,'o cron tem de chamar o aviso da aula ao vivo');
ok(/try \{ aovivo = await sendAvisoAoVivo\(\); \}\s*\n\s*catch/.test(cron),
   'a chamada tem de estar em try/catch — falha no aviso não pode derrubar o radar e a newsletter');

// --- limite de 12 funções serverless da Vercel --------------------------------
function contaApi(dir){
  let n=0;
  for(const f of fs.readdirSync(dir,{withFileTypes:true})){
    if(f.isDirectory())n+=contaApi(path.join(dir,f.name));
    else if(f.name.endsWith('.js'))n++;
  }
  return n;
}
const nApi=contaApi(path.join(__dirname,'..','api'));
ok(nApi<=12,'⚠️ a Vercel só aceita 12 funções serverless e agora são '+nApi+' — o aviso tem de pegar carona num cron existente, não virar função nova');

if(falhas.length){
  console.error('✗ aula ao vivo:');
  falhas.forEach(f=>console.error('  - '+f));
  process.exit(1);
}
console.log('✓ regressão aula ao vivo: link só para quem tem conta (no servidor); gravação só p/ assinante; aviso não repete');
