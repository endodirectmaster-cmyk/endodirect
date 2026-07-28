// Compara o RESUMO de cada artigo no banco com a fonte local. O verificador que
// existia (check_info_db.js) só olhava o campo `info` — o texto nunca foi
// conferido, e foi por essa fresta que uma divergência viveu desde a inserção.
const crypto=require('crypto'), fs=require('fs');
const P='/home/user/endodirect/scratchpad/artigos/';
const locais={}, pts={};
// ⚠️ Ao criar um lote novo (trials4.js…), acrescente-o AQUI. Um lote fora desta
// lista não é auditado e o script ainda assim imprime ✓ — foi exatamente assim
// que o 2º lote ficou sem conferência no check_info_db.js.
for(const [mod,chave] of [['trials.js','TODOS'],['trials2.js','TODOS2'],['trials3.js','TODOS3'],['trials4.js','TODOS4'],['comparativos.js','COMPARATIVOS']]){
  const m=require(P+mod);
  for(const t of m[chave]){ locais[t.tema]=t.resumo; pts[t.tema]=t.pts||[]; }
}
// normaliza o cabeçalho amarelo: ele foi aplicado DEPOIS, direto no banco, e é
// aprovado — então não conta como divergência de conteúdo.
function amarelar(txt){
  const linhas=txt.split('\n');
  return linhas.map((l,i)=>{
    const prox=linhas[i+1]||'';
    if(!l.startsWith('|')||!/^\|\s*-{3,}/.test(prox)||l.includes('{h:amarelo')) return l;
    const cs=l.split('|').map(c=>c.trim()).filter(Boolean);
    return '| '+cs.map(c=>'{h:amarelo\\|'+c+'}').join(' | ')+' |';
  }).join('\n');
}
const DB=JSON.parse(fs.readFileSync(__dirname+'/db_resumos.json','utf8'));
const md5=s=>crypto.createHash('md5').update(s).digest('hex');
let div=0, conv=0;
// `pts` são os 6 tópicos do card — o que o aluno lê ANTES de abrir o resumo.
// Não eram conferidos por verificador nenhum até 2026-07-28: o check_info_db.js
// só olha `info` e este arquivo só olhava `resumo`. Um `pts` clobbado passaria.
for(const r of DB){
  if(r.pts){
    const p=pts[r.tema];
    if(p===undefined){console.log('  ?? sem pts local: '+r.tema);}
    else if(md5(p.join('\n'))!==r.pts){console.log('  ✗ '+r.tema+' — pts DIVERGEM do banco'); div++;}
  }
  const loc=locais[r.tema];
  if(loc===undefined){console.log('  ?? sem fonte local: '+r.tema); continue;}
  const cands={'igual':loc, 'com cabeçalho amarelo':amarelar(loc)};
  const bate=Object.entries(cands).find(([,v])=>md5(v)===r.hash);
  if(bate) continue;
  // Salvar pelo editor normaliza o texto de forma COSMÉTICA: insere linha em
  // branco depois de cada título e reescreve o separador da tabela (|---| vira
  // | --- |). Nenhuma das duas muda o HTML gerado. Comparo as formas
  // normalizadas para que isso não mascare — nem simule — perda de conteúdo.
  const canon=(t)=>t.split('\n')
    .map(l=>/^\|[\s:|-]+\|$/.test(l.trim()) ? '|SEP|' : l.trim())
    .filter(l=>l!=='').join('\n');
  if(r.canon && md5(canon(loc))===r.canon){ conv++; continue; }
  if(r.canon && md5(canon(amarelar(loc)))===r.canon){ conv++; continue; }
  div++;
  console.log('  ✗ '+r.tema+'  banco '+r.tam+' / local '+loc.length+'  (delta '+(r.tam-loc.length)+')');
}
console.log('\n'+(div
  ? ('DIVERGENTES: '+div+' de '+DB.length)
  : ('✓ '+DB.length+' resumos e tópicos (pts) do banco batem com a fonte local'
     + (conv?(' ('+conv+' com normalização cosmética do editor: linha em branco após título e separador de tabela — nenhum muda o HTML)'):''))));
// ⚠️ Sem este exit o script imprimia "DIVERGENTES: 1" e ainda assim saía com
// código 0 — um hook ou CI que só olhasse o código teria dado tudo por certo.
process.exit(div?1:0);
