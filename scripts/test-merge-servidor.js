// Regressão: o save do painel NÃO pode desfazer edição feita direto no servidor.
//
// Em 06/08/2026 as tabelas do posicionamento de hipogonadismo foram gravadas no
// banco às ~12:30 e sumiram às 12:48, quando o painel do professor (aberto desde
// antes) salvou. Sem erro e sem aviso: `mergeConcurrent` só ACRESCENTAVA itens de
// chave nova e descartava qualquer alteração em item que o painel já tinha — que é
// exatamente o que uma edição server-side é.
//
// Este teste extrai stableStr/itemSig/mergeConcurrent do index.html e cobre os
// quatro caminhos: adota a edição do servidor, respeita a exclusão do professor,
// mantém a versão dele no conflito real, e segue acrescentando o que é novo.
const fs=require('fs');
const path=require('path');
const vm=require('vm');

const html=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
const falhas=[];
function ok(cond,msg){if(!cond)falhas.push(msg);}

// --- extrai as funções do index.html (sem executar o app) --------------------
function corpo(nome){
  const i=html.indexOf('function '+nome+'(');
  if(i<0)throw new Error('função '+nome+' não encontrada no index.html');
  let d=0,j=html.indexOf('{',i);
  const ini=j;
  for(;j<html.length;j++){
    if(html[j]==='{')d++;
    else if(html[j]==='}'){d--;if(!d)return html.slice(i,j+1);}
  }
  throw new Error('não fechou o corpo de '+nome+' (a partir de '+ini+')');
}
// Literal de objeto no topo (`var NOME={...};`) — mesma contagem de chaves.
function objeto(nome){
  const i=html.indexOf('var '+nome+'={');
  if(i<0)throw new Error('objeto '+nome+' não encontrado no index.html');
  let d=0;
  for(let j=html.indexOf('{',i);j<html.length;j++){
    if(html[j]==='{')d++;
    else if(html[j]==='}'){d--;if(!d)return html.slice(i,j+1)+';';}
  }
  throw new Error('não fechou o objeto '+nome);
}
const sandbox={};
vm.createContext(sandbox);
vm.runInContext(['var globalBaseline={};',objeto('GLOBAL_MERGE_KEYS'),
  corpo('stableStr'),corpo('itemSig'),corpo('mergeConcurrent'),
  corpo('captureGlobalBaseline')].join('\n'),sandbox);
const {stableStr,itemSig,mergeConcurrent,captureGlobalBaseline,GLOBAL_MERGE_KEYS}=sandbox;

// --- assinatura canônica -----------------------------------------------------
ok(itemSig({a:1,b:2})===itemSig({b:2,a:1}),
   'itemSig deve ignorar a ordem das chaves (JSONB do servidor x objeto do painel)');
ok(itemSig({a:{x:1,y:2}})===itemSig({a:{y:2,x:1}}),
   'a ordem tem de ser ignorada em TODO nível, não só no topo');
ok(itemSig({a:[1,2]})!==itemSig({a:[2,1]}),
   'ordem de ARRAY é conteúdo (alternativas de questão) e deve mudar a assinatura');
ok(itemSig({resumo:'x'})!==itemSig({resumo:'x '}),
   'diferença de conteúdo tem de mudar a assinatura');
ok(typeof itemSig({a:1})==='string'&&itemSig({a:1}).length>1,
   'itemSig devolve string não vazia (o baseline usa truthiness)');

// --- o caso real: capítulo editado no servidor, intocado no painel -----------
const chave=it=>(it.fonte||'')+'|'+(it.tema||it.titulo||'')+'|'+(it.sub||'');
const antigo={fonte:'SBEM',tema:'Hipogonadismo masculino',sub:'Masculina',resumo:'texto antigo'};
const comTabelas={fonte:'SBEM',tema:'Hipogonadismo masculino',sub:'Masculina',resumo:'texto antigo\n\n## Tabela 1'};
const base={};base[chave(antigo)]=itemSig(antigo);

let rep={added:0,updated:0,conflicts:[]};
let out=mergeConcurrent([comTabelas],[antigo],base,chave,rep);
ok(out.length===1&&/## Tabela 1/.test(out[0].resumo),
   'REGRESSÃO 12:48: o painel intocado tem de ADOTAR a edição do servidor, não descartá-la');
ok(rep.updated===1&&rep.conflicts.length===0,
   'adoção silenciosa deve contar como "atualizado", sem conflito');

// --- conflito real: os dois lados mexeram no mesmo item ----------------------
const meuEditado={fonte:'SBEM',tema:'Hipogonadismo masculino',sub:'Masculina',resumo:'o professor reescreveu'};
rep={added:0,updated:0,conflicts:[]};
out=mergeConcurrent([comTabelas],[meuEditado],base,chave,rep);
ok(out.length===1&&out[0].resumo==='o professor reescreveu',
   'no conflito real a versão do PROFESSOR prevalece (é ele quem está olhando a tela)');
ok(rep.conflicts.length===1&&rep.updated===0,
   'conflito real tem de ser REGISTRADO para virar aviso — perder em silêncio é o bug');
// O conflito leva junto o ITEM (a versão do professor, que é a que está na tela
// dele). Sem isso o aviso só tem a chave para se virar — e quando a chave é um
// `id` (provas), o professor leria "teem-2024-007" em vez do enunciado.
ok(rep.conflicts[0]&&rep.conflicts[0].item&&rep.conflicts[0].item.resumo==='o professor reescreveu',
   'o conflito tem de carregar o ITEM do professor para o aviso conseguir nomeá-lo');

// --- exclusão do professor continua respeitada -------------------------------
rep={added:0,updated:0,conflicts:[]};
out=mergeConcurrent([comTabelas],[],base,chave,rep);
ok(out.length===0,'item apagado pelo professor NÃO pode voltar por causa da edição no servidor');

// --- adição de outro editor continua entrando --------------------------------
const novo={fonte:'SBU',tema:'Capítulo novo',sub:'Masculina',resumo:'x'};
rep={added:0,updated:0,conflicts:[]};
out=mergeConcurrent([antigo,novo],[antigo],base,chave,rep);
ok(out.length===2&&rep.added===1,'item novo no servidor (fora do baseline) segue sendo acrescentado');

// --- servidor sem mudança: nada acontece -------------------------------------
rep={added:0,updated:0,conflicts:[]};
out=mergeConcurrent([antigo],[antigo],base,chave,rep);
ok(rep.added===0&&rep.updated===0&&rep.conflicts.length===0,
   'sem mudança no servidor o merge tem de ser inerte');

// --- baseline em formato antigo (chave→1) não pode quebrar -------------------
const baseVelho={};baseVelho[chave(antigo)]=1;
rep={added:0,updated:0,conflicts:[]};
out=mergeConcurrent([comTabelas],[antigo],baseVelho,chave,rep);
ok(out.length===1&&rep.conflicts.length===0,
   'baseline sem assinatura (sessão antiga) degrada para o comportamento antigo, sem erro');

// --- o call site do index.html precisa passar o report E a coleção -----------
// ⚠️ A coleção entrou em 10/08/2026. Sem ela, o aviso de conflito nomeava o item
// pelo 2º campo da chave de merge — e em `provas` esse campo é a RESPOSTA. O
// professor viu "mantive a SUA versão: C · D" enquanto olhava a aba Resumos, sem
// como saber que o conflito era de duas QUESTÕES, em outra aba.
const chamada=html.match(/p\[coll\]=mergeConcurrent\([^)]*\)/);
ok(chamada&&/\brep\b/.test(chamada[0]),
   'o save tem de passar o objeto de report para mergeConcurrent, senão nada é avisado');
ok(chamada&&/,\s*coll\s*\)/.test(chamada[0]),
   'o save tem de passar a COLEÇÃO para mergeConcurrent, senão o aviso não sabe de que aba fala');
ok(/report\.conflicts\.push\(\{coll:/.test(html),
   'cada conflito tem de registrar a coleção junto da chave');

// --- ⚠️🐛 CONFLITO FANTASMA: o aviso que voltava a cada save (10/08/2026) --------
//
// O professor via, toda vez que salvava: "Mudou no servidor e aqui ao mesmo tempo —
// mantive a SUA versão de 4 item(ns) ... Provas & Questões". Ninguém tinha editado
// nada, e nenhum F5 resolvia — não havia o que resolver.
//
// Eram 4 questões que caem REPETIDAS em anos diferentes (TEEM 2024/2026 e três da
// USP-SP 2024/2025). A chave de merge de `provas` era `stem|answer|inst`, SEM o ano:
// as duas viravam a MESMA chave. O baseline guardava a assinatura da ÚLTIMA e o
// merge casava a chave com a PRIMEIRA → os dois lados pareciam divergir → conflito.
// Todo save, para sempre. Um alarme que sempre toca ensina a ignorar o alarme — e
// este existe para avisar perda de conteúdo de verdade.
{
  // 1) A identidade da questão é o `id`, que distingue os homônimos.
  const kp=GLOBAL_MERGE_KEYS.provas;
  const stem='Em relação aos exames complementares na Doença de Paget óssea, assinale...';
  const q24={id:'teem-2024-007',ano:'2024',stem,answer:'C',inst:'TEEM'};
  const q26={id:'teem-2026-002',ano:'2026',stem,answer:'C',inst:'TEEM'};
  ok(kp(q24)!==kp(q26),
     'REGRESSÃO: questão repetida em anos diferentes tem de ter chave DIFERENTE (era o conflito fantasma)');
  ok(kp({stem:'sem id',answer:'A',inst:'X'}).indexOf('sem id')>=0,
     'questão sem id continua com chave pelo enunciado — nada pode ficar sem identidade');

  // 2) Chave ambígua (aqui: dois temas homônimos) guarda TODAS as assinaturas.
  const ch=GLOBAL_MERGE_KEYS.diretrizes_temas;
  const t1={sub:'Obesidade',tema:'Farmacoterapia',ordem:1};
  const t2={sub:'Obesidade',tema:'Farmacoterapia',ordem:2};
  captureGlobalBaseline({diretrizes_temas:[t1,t2]});
  const baseAmb=sandbox.globalBaseline.diretrizes_temas[ch(t1)];
  ok(Array.isArray(baseAmb)&&baseAmb.length===2,
     'chave repetida tem de guardar as DUAS assinaturas; guardar só a última é o que criava o fantasma');

  // 3) Nada mudou dos dois lados → NENHUM aviso. Este é o teste do sintoma.
  let r={added:0,updated:0,conflicts:[]};
  let o=mergeConcurrent([t1,t2],[t1,t2],sandbox.globalBaseline.diretrizes_temas,ch,r,'diretrizes_temas');
  ok(r.conflicts.length===0,
     'REGRESSÃO 10/08: sem ninguém editar nada, o merge NÃO pode acusar conflito (veio '+r.conflicts.length+')');
  ok(o.length===2,'e o conteúdo tem de sair intacto');

  // 4) Mudança REAL em chave ambígua: avisa, mas não adota às cegas.
  r={added:0,updated:0,conflicts:[]};
  o=mergeConcurrent([t1,{sub:'Obesidade',tema:'Farmacoterapia',ordem:9}],[t1,t2],
                    sandbox.globalBaseline.diretrizes_temas,ch,r,'diretrizes_temas');
  ok(r.conflicts.length===1,
     'mudança de verdade em chave ambígua tem de AVISAR — perder em silêncio é o defeito original');
  ok(o.length===2&&o[1].ordem===2,
     'na chave ambígua não se adota às cegas: sobrescreveria o homônimo errado');

  // 5) Chave duplicada mas com itens IDÊNTICOS não é ambiguidade — segue o caminho normal.
  captureGlobalBaseline({diretrizes_temas:[t1,{sub:'Obesidade',tema:'Farmacoterapia',ordem:1}]});
  ok(typeof sandbox.globalBaseline.diretrizes_temas[ch(t1)]==='string',
     'itens idênticos com a mesma chave são intercambiáveis: baseline segue simples');
}

// --- o rótulo do conflito não pode nomear a questão pela ALTERNATIVA ----------
{
  const rot=html.match(/function rotuloConflito\(c\)\{[\s\S]*?\n\}/);
  ok(!!rot,'rotuloConflito tem de existir para nomear o item em conflito');
  if(rot){
    const fn=new Function('MERGE_ABAS','MERGE_ROTULOS','MERGE_ITEM_ROTULO','return '+rot[0].replace(/^function /,'function '))
      ({provas:'Provas & Questões',diretrizes:'Diretrizes/Resumos'},
       {provas:function(pr){return pr[0]||'';},diretrizes:function(pr){return pr[1]||pr[0]||'';}},
       {provas:function(it){return it.stem||'';},diretrizes:function(it){return it.tema||it.titulo||'';}});
    const rProva=fn({coll:'provas',key:'Qual o corte de HbA1c para diabetes?|C|SBD 2024'});
    ok(/Provas/.test(rProva)&&/HbA1c/.test(rProva)&&!/^\s*C\s*$/.test(rProva),
       'conflito em prova nomeia a ABA e o ENUNCIADO, nunca só a alternativa');
    const rDir=fn({coll:'diretrizes',key:'Vilar 8ed|Obesidade: Definição e Epidemiologia|Obesidade'});
    ok(/Diretrizes/.test(rDir)&&/Defini/.test(rDir),
       'conflito em diretriz/resumo nomeia a ABA e o TEMA');
    // ⚠️ Com a chave virando `id`, ler o rótulo da CHAVE passaria a mostrar
    // "teem-2024-007" — que não diz nada a quem está olhando a tela. O nome tem de
    // sair do ITEM.
    const rId=fn({coll:'provas',key:'teem-2024-007',
                  item:{id:'teem-2024-007',stem:'Doença de Paget óssea: qual exame?',answer:'C'}});
    ok(/Paget/.test(rId)&&!/teem-2024-007/.test(rId),
       'com chave por id, o aviso tem de nomear a questão pelo ENUNCIADO do item, não pelo id');
  }
}
ok(/rep\.conflicts\.length/.test(html)&&/notify\(/.test(html.slice(html.indexOf('rep.conflicts.length'),html.indexOf('rep.conflicts.length')+900)),
   'conflito real tem de disparar notify visível para o professor');
// Comportamental em vez de textual: o que importa é o baseline sair com a
// ASSINATURA do item (é ela que distingue "o servidor editou" de "eu editei"),
// não a forma como a linha está escrita.
{
  const it0={fonte:'SBEM',tema:'Tema X',sub:'Y',resumo:'z'};
  captureGlobalBaseline({diretrizes:[it0]});
  const v=sandbox.globalBaseline.diretrizes[GLOBAL_MERGE_KEYS.diretrizes(it0)];
  ok(v===itemSig(it0),
     'captureGlobalBaseline tem de guardar a ASSINATURA do item, não apenas a chave');
}

if(falhas.length){
  console.error('✗ merge com o servidor:');
  falhas.forEach(f=>console.error('  - '+f));
  process.exit(1);
}
console.log('✓ regressão merge com o servidor: edição server-side sobrevive ao save do painel; conflito real avisa');
