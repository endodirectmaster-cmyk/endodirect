// "Alunos com atividade" tinha de ganhar JANELA.
//
// ⚠️ O DEFEITO ERA DE LEITURA, NÃO DE CÓDIGO — e por isso passava despercebido.
// O número contava QUALQUER atividade desde sempre: quem respondeu uma questão
// em março e nunca mais voltou continuava somando. Um indicador que só cresce e
// nunca cai não mede engajamento nenhum; e ele ficava exatamente ao lado de
// "última atividade: <hoje>", o que faz qualquer um ler como recente. Medido em
// 06/08/2026: 59 "com atividade", mas só 37 responderam alguma questão nos
// últimos 30 dias e 63 sequer abriram o app na janela.
//
// A regra do número grande agora é ESTUDO na janela (payload->'act', que conta
// respostas por dia), e o acumulado desceu para a linha de apoio.
'use strict';
const fs = require('fs');
const vm = require('vm');
const path = require('path');

const RAIZ = path.join(__dirname, '..');
const APP = fs.readFileSync(path.join(RAIZ, 'index.html'), 'utf8');
let bad = 0;
const ok = (nome, cond, det) => { if (cond) return; bad++; console.log('  ✗ ' + nome + (det ? ' — ' + det : '')); };

// ---- 1. ⚠️ O NÚMERO GRANDE É O DA JANELA, NÃO O ACUMULADO ------------------
{
  ok('⚠️ o KPI mostra quem estudou na janela de 30 dias',
     /kpi\(n\(ov\.ativos_30d\),'Estudaram \(30 dias\)'/.test(APP),
     'com o acumulado no número grande, o indicador só cresce e nunca denuncia queda de uso');
  ok('o acumulado continua visível, como apoio',
     /' já usaram alguma vez'/.test(APP) && /n\(ov\.ativos\)/.test(APP),
     'perder o histórico seria trocar um erro por outro');
  ok('e quem só abriu aparece separado de quem estudou',
     /n\(ov\.abriram_30d\)\+' abriram · '/.test(APP),
     'abrir o app e responder questão não são a mesma coisa');
  ok('⚠️ o rótulo antigo, sem janela, não sobrou em lugar nenhum',
     APP.indexOf("'Alunos com atividade'") < 0,
     'dois rótulos para leituras diferentes do mesmo painel confundem mais do que ajudam');
}

// ---- 2. o KPI aguenta a linha de apoio (e a ausência dela) -----------------
// O mesmo helper desenha os quatro cartões; se a linha extra quebrar quando não
// houver texto, os outros três saem tortos.
{
  // ⚠️ Âncora na função CERTA (`admAnalyticsHTML`). Existem dois helpers `kpi`
  // no arquivo — o do card de Conversão e o do Analytics. Com o nome errado,
  // `indexOf` devolvia -1, a busca começava do início e o teste media o helper
  // do OUTRO card: passava verdinho com o do Analytics quebrado.
  const iFn = APP.indexOf('function admAnalyticsHTML(){');
  ok('achei a função do Analytics', iFn > 0, 'sem ela o teste mede o card errado');
  const i = APP.indexOf('  var kpi=function(val,lbl,cor,sub){', iFn);
  const j = APP.indexOf('\n', APP.indexOf("+'</div></div>';};", i));
  ok('achei o helper de KPI do Analytics', i > 0 && j > i);
  const ctx = {};
  vm.createContext(ctx);
  vm.runInContext(APP.slice(i, j).replace(/^\s*var kpi=/, 'kpi='), ctx);
  const comSub = ctx.kpi(37, 'Estudaram (30 dias)', 'green', '63 abriram · 59 já usaram alguma vez');
  const semSub = ctx.kpi(98, 'Alunos cadastrados', 'blue');
  ok('com linha de apoio, ela aparece', comSub.indexOf('63 abriram') > 0 && comSub.indexOf('37') > 0);
  ok('sem linha de apoio, não sobra div vazia', semSub.indexOf('margin-top:.15rem') < 0, semSub);
  ok('o número grande continua sendo o primeiro conteúdo', /adm-bigstat-n[^>]*>37</.test(comSub));
}

// ---- 3. ⚠️ A JANELA PRECISA DE DADO QUE A COBRE ---------------------------
// `act` é gravado a cada resposta (um contador por dia). Se o cliente parar de
// gravar, o número da janela despenca para 0 sem erro nenhum — e pareceria que
// os alunos sumiram.
{
  ok('⚠️ o cliente registra a atividade do dia a cada resposta',
     /DB\.act\[k\]=\(DB\.act\[k\]\|\|0\)\+1;/.test(APP),
     'é a fonte do número de 30 dias; sem esta linha ele vira 0 e ninguém desconfia');
  ok('e `act` viaja no estado pessoal do aluno',
     /PERSONAL_STATE_KEYS[^]{0,400}'act'/.test(APP) || /'act'[^]{0,200}PERSONAL_STATE_KEYS/.test(APP)
     || /if\(payload\.act&&typeof payload\.act==='object'\)DB\.act=payload\.act;/.test(APP),
     'se não for sincronizado, só conta quem estudou no mesmo navegador');
}

if (bad) { console.error('\n' + bad + ' verificação(ões) do recorte por janela falharam.'); process.exit(1); }
console.log('Ativos na janela de 30 dias: OK');
