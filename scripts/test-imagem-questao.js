// Regressão: a figura da Questão do Dia tem de corresponder à questão.
//
// Em 06/08/2026 o professor mandou o print: uma questão de macroprolactinemia cujo
// ENUNCIADO diz "RM de sela normal, sem imagem sugestiva de adenoma" apareceu com
// uma prancha de 6 painéis de um artigo de oncologia (Oncology Letters, PMID
// 25621029), com setas apontando lesões. "A imagem não tem nada a ver com a questão."
//
// Duas causas independentes, as duas cobertas aqui:
//  (A) o app anexava o PRIMEIRO resultado do Open-i sem conferir nada — e a busca do
//      Open-i casa o TEXTO DO ARTIGO, não a figura;
//  (B) a regra do prompt mandava ilustrar sempre que a vinheta "envolvesse um exame
//      de imagem", inclusive quando o próprio enunciado diz que o exame é normal.
const fs=require('fs');
const path=require('path');
const vm=require('vm');

const html=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
const falhas=[];
function ok(cond,msg){if(!cond)falhas.push(msg);}

function trecho(inicio,nome){
  const i=html.indexOf(inicio);
  if(i<0)throw new Error(nome+' não encontrado no index.html');
  let d=0;
  for(let j=html.indexOf('{',i);j<html.length;j++){
    if(html[j]==='{')d++;
    else if(html[j]==='}'){d--;if(!d)return html.slice(i,j+1);}
  }
  throw new Error('não fechou o corpo de '+nome);
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
function varObj(nome){
  const i=html.indexOf('var '+nome+'=');
  if(i<0)throw new Error('var '+nome+' não encontrada');
  let d=0;
  for(let j=html.indexOf('{',i);j<html.length;j++){
    if(html[j]==='{')d++;
    else if(html[j]==='}'){d--;if(!d)return html.slice(i,j+1)+';';}
  }
  throw new Error('não fechou '+nome);
}

const sandbox={};
vm.createContext(sandbox);
vm.runInContext([
  varArr('IG_IMG_MODAL'),
  varObj('IG_IMG_STOP'),
  trecho('function igImgHas(','igImgHas'),
  trecho('function igImgRelevante(','igImgRelevante')
].join('\n'),sandbox);
const {igImgRelevante}=sandbox;

// --- (A) o caso REAL do print --------------------------------------------------
// A figura que entrou: artigo de oncologia, sem nada de hipófise na legenda.
const oncologia={
  title:'Multiple metastases in a patient with advanced carcinoma',
  caption:'(A) Chest CT; (B) abdominal mass; (C) spinal lesion; (D) skull base; (E and F) brain imaging. Red arrows indicate the lesions.'
};
ok(igImgRelevante('pituitary MRI microadenoma',oncologia)===false,
   'REGRESSÃO DO PRINT: prancha de oncologia NÃO pode ilustrar questão de hipófise');

// Uma figura de hipófise de verdade tem de passar.
const selaOk={
  title:'Pituitary microadenoma on dynamic MRI',
  caption:'Coronal T1-weighted magnetic resonance imaging shows a hypointense pituitary microadenoma.'
};
ok(igImgRelevante('pituitary MRI microadenoma',selaOk)===true,
   'figura de RM de hipófise pertinente tem de continuar sendo aceita');

// --- modalidade trocada ---------------------------------------------------------
ok(igImgRelevante('thyroid ultrasound nodule',{
     title:'Thyroid nodule on computed tomography',
     caption:'Axial CT of the neck demonstrates a thyroid nodule.'})===false,
   'pediram ULTRASSOM e veio TC — tem de recusar');
ok(igImgRelevante('thyroid ultrasound nodule',{
     title:'Ultrasonography of a thyroid nodule',
     caption:'Sonographic appearance of a hypoechoic thyroid nodule with microcalcifications.'})===true,
   'ultrassom de tireoide pertinente tem de passar');

// --- órgão trocado, mesma modalidade -------------------------------------------
ok(igImgRelevante('adrenal CT pheochromocytoma',{
     title:'Computed tomography of the liver',
     caption:'CT scan showing a hepatic lesion.'})===false,
   'mesma modalidade mas ÓRGÃO errado tem de ser recusado');

// --- sem metadado não dá para conferir ------------------------------------------
ok(igImgRelevante('pituitary MRI macroadenoma',{title:'',caption:''})===false,
   'candidato sem título e sem legenda tem de ser recusado (não há como conferir)');

// --- plural/derivação não pode derrubar um acerto legítimo ----------------------
ok(igImgRelevante('adrenal CT adenoma',{
     title:'Adrenal adenomas on computed tomography',
     caption:'Unenhanced CT of bilateral adrenal adenomas.'})===true,
   'plural ("adenomas") não pode reprovar figura correta');

// --- (A) o call site: 1 candidato cego → vários, e o filtro tem de estar no meio -
const fetchBody=trecho('function igFetchExamImage(','igFetchExamImage');
ok(/n:\s*[2-9]/.test(fetchBody),
   'igFetchExamImage tem de pedir VÁRIOS candidatos (n>1) para poder escolher');
ok(/igImgRelevante\(/.test(fetchBody),
   'igFetchExamImage tem de filtrar por relevância — era pegar items[0] cego');
ok(!/var it=d\.items\[0\]/.test(fetchBody),
   'não pode voltar a pegar o primeiro resultado sem conferir');
ok(/return null;\s*\}\)/.test(fetchBody.replace(/\s+/g,m=>m.includes('\n')?'\n':' ')) || /return null/.test(fetchBody),
   'sem candidato aprovado a questão tem de ficar SEM imagem');

// --- (B) a regra do prompt ------------------------------------------------------
const regra=(html.match(/var IG_IMAGEQUERY_RULE='([^']*)'/)||[])[1]||'';
ok(regra.length>200,'IG_IMAGEQUERY_RULE não encontrada');
ok(/normal/i.test(regra),
   'a regra tem de proibir explicitamente ilustrar exame descrito como NORMAL');
ok(/dúvida/i.test(regra)&&/""/.test(regra),
   'a regra tem de mandar usar string vazia na dúvida');
ok(/MODALIDADE/.test(regra)&&/ACHADO/i.test(regra),
   'a regra tem de exigir modalidade + órgão + achado nos termos de busca');
ok(!/SOMENTE se — a vinheta envolver um exame de IMAGEM/.test(regra),
   'a regra frouxa antiga não pode voltar');

if(falhas.length){
  console.error('✗ imagem da Questão do Dia:');
  falhas.forEach(f=>console.error('  - '+f));
  process.exit(1);
}
console.log('✓ regressão imagem da questão: figura conferida contra a busca; exame normal não é ilustrado');
