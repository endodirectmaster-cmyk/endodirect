// Regressão: separar endocrinologia PEDIÁTRICA da de adulto no Analytics.
//
// Pedido do professor (06/08/2026): "deixa também de quantos endocrinopediatras
// ou residentes de endocrinologia pediátrica (se tiver)". Até então o perfil só
// tinha 4 rótulos — Estudante / Residente / Endocrinologista / Outros — e não
// havia como responder: o dado nunca foi perguntado (0 declarados, 53 elegíveis).
//
// O risco desta mudança NÃO é o número, é a LEITURA do número: mostrar "0" seco
// faz parecer "não tenho nenhum endocrinopediatra" quando a verdade é "ainda não
// perguntei". Por isso o teste trava a cobertura junto do total.
const fs=require('fs');
const path=require('path');
const vm=require('vm');

const html=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
const falhas=[];
function ok(cond,msg){if(!cond)falhas.push(msg);}

function varObj(nome){
  const i=html.indexOf('var '+nome+'=');
  if(i<0)throw new Error('var '+nome+' não encontrada no index.html');
  let d=0;
  for(let j=html.indexOf('{',i);j<html.length;j++){
    if(html[j]==='{')d++;
    else if(html[j]==='}'){d--;if(!d)return html.slice(i,j+1)+';';}
  }
  throw new Error('não fechou '+nome);
}
function varArr(nome){
  const i=html.indexOf('var '+nome+'=');
  if(i<0)throw new Error('var '+nome+' não encontrada');
  let d=0;
  for(let j=html.indexOf('[',i);j<html.length;j++){
    if(html[j]==='[')d++;
    else if(html[j]===']'){d--;if(!d)return html.slice(i,j+1)+';';}
  }
  throw new Error('não fechou '+nome);
}
const sandbox={};
vm.createContext(sandbox);
vm.runInContext([varObj('ATUACAO_OPCOES'),varArr('ATUACAO_PEDIATRICA')].join('\n'),sandbox);
const {ATUACAO_OPCOES,ATUACAO_PEDIATRICA}=sandbox;

// --- as opções oferecidas ------------------------------------------------------
ok(ATUACAO_OPCOES.Endocrinologista&&ATUACAO_OPCOES.Residente,
   'Endocrinologista e Residente têm de ter opções de atuação');
ok(!ATUACAO_OPCOES.Estudante&&!ATUACAO_OPCOES.Outros,
   'Estudante e Outros não respondem área de atuação (não faz sentido para eles)');
const valEndo=ATUACAO_OPCOES.Endocrinologista.map(o=>o[0]);
const valRes=ATUACAO_OPCOES.Residente.map(o=>o[0]);
ok(valEndo.indexOf('Pediátrica')>=0,'Endocrinologista tem de poder marcar Pediátrica');
ok(valEndo.indexOf('Adulto e pediátrica')>=0,'quem atende os dois precisa de opção própria — senão some da contagem');
ok(valRes.indexOf('Endocrinologia pediátrica')>=0,'Residente tem de poder marcar Endocrinologia pediátrica');
ok(valRes.indexOf('Pediatria')>=0,'Residente de Pediatria geral precisa de opção — senão marca pediátrica por falta de alternativa');

// --- quem CONTA como endocrinologia pediátrica ---------------------------------
ok(ATUACAO_PEDIATRICA.indexOf('Pediátrica')>=0
   &&ATUACAO_PEDIATRICA.indexOf('Adulto e pediátrica')>=0
   &&ATUACAO_PEDIATRICA.indexOf('Endocrinologia pediátrica')>=0,
   'os três valores pediátricos têm de contar');
ok(ATUACAO_PEDIATRICA.indexOf('Pediatria')<0,
   '⚠️ "Pediatria" (geral) NÃO é endocrinologia pediátrica — não pode entrar na contagem');
ok(ATUACAO_PEDIATRICA.indexOf('Adulto')<0&&ATUACAO_PEDIATRICA.indexOf('Endocrinologia')<0,
   'adulto não pode entrar na contagem pediátrica');
// Toda opção pediátrica declarável tem de estar na lista de contagem, e vice-versa.
const todas=valEndo.concat(valRes);
ATUACAO_PEDIATRICA.forEach(function(v){
  ok(todas.indexOf(v)>=0,'valor "'+v+'" conta como pediátrico mas ninguém pode escolhê-lo');
});
// A lista é explícita justamente para não casar por pedaço de texto:
ok(!/atuacao.*indexOf\('pedi/i.test(html)&&!/atuacao.*\.match\(\/pedi/i.test(html),
   'a contagem não pode voltar a casar "contém pediát" — "Pediatria" entraria errado');

// --- o card do Analytics -------------------------------------------------------
const i=html.indexOf('var admPedHTML=');
ok(i>=0,'admPedHTML não encontrado');
let d=0,corpo='';
for(let j=html.indexOf('{',i);j<html.length;j++){
  if(html[j]==='{')d++;
  else if(html[j]==='}'){d--;if(!d){corpo=html.slice(i,j+1);break;}}
}
ok(/ped_total/.test(corpo),'o card tem de mostrar o total pediátrico');
ok(/atuacao_informaram/.test(corpo)&&/atuacao_elegiveis/.test(corpo),
   '⚠️ o card TEM de mostrar quantos já responderam — "0" sem cobertura faz parecer "não tenho nenhum" em vez de "ainda não perguntei"');
ok(/Editar perfil/.test(corpo),'o card tem de dizer onde quem já entrou pode informar');
ok(/pistas_ped_outros/.test(corpo),'as pistas do texto livre de "Outros" têm de aparecer');
ok(/não entra na contagem/.test(corpo),
   'a pista do texto livre tem de ser marcada como NÃO contabilizada, para não virar número inventado');
ok(html.indexOf('+admPedHTML(pp)')>0,'admPedHTML tem de estar ligado ao card de perfil profissional');

// --- captura: onboarding e Perfil ---------------------------------------------
ok(/id="ob-atuacao"/.test(html),'o onboarding tem de ter o campo de atuação');
ok(/prof\.atuacao=atv/.test(html),'o onboarding tem de GRAVAR a atuação');
ok(/Informe o seu programa de residência|Informe a sua área de atuação/.test(html),
   'o campo tem de ser obrigatório para médicos, com mensagem de erro própria');
ok(/id="pf-atuacao"/.test(html),
   '⚠️ a tela de Perfil TEM de permitir informar depois — sem isso o número só cresce com cadastro novo e os 53 atuais nunca entram');
ok(/if\(atEl\)prof\.atuacao=/.test(html),'o save do Perfil tem de gravar a atuação');

if(falhas.length){
  console.error('✗ endocrinologia pediátrica:');
  falhas.forEach(f=>console.error('  - '+f));
  process.exit(1);
}
console.log('✓ regressão endocrino pediátrica: conta só quem declarou pediátrica + mostra a cobertura da pergunta');
