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
const sandbox={};
vm.createContext(sandbox);
vm.runInContext([corpo('stableStr'),corpo('itemSig'),corpo('mergeConcurrent')].join('\n'),sandbox);
const {stableStr,itemSig,mergeConcurrent}=sandbox;

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

// --- o call site do index.html precisa passar o report -----------------------
const chamada=html.match(/p\[coll\]=mergeConcurrent\([^)]*\)/);
ok(chamada&&/,\s*rep\s*\)/.test(chamada[0]),
   'o save tem de passar o objeto de report para mergeConcurrent, senão nada é avisado');
ok(/rep\.conflicts\.length/.test(html)&&/notify\(/.test(html.slice(html.indexOf('rep.conflicts.length'),html.indexOf('rep.conflicts.length')+900)),
   'conflito real tem de disparar notify visível para o professor');
ok(/s\[fn\(it\)\]=itemSig\(it\)/.test(html),
   'captureGlobalBaseline tem de guardar a ASSINATURA, não apenas a chave');

if(falhas.length){
  console.error('✗ merge com o servidor:');
  falhas.forEach(f=>console.error('  - '+f));
  process.exit(1);
}
console.log('✓ regressão merge com o servidor: edição server-side sobrevive ao save do painel; conflito real avisa');
