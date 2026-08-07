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

function varRe(nome){
  const m=html.match(new RegExp('var '+nome+'=\\/.*?\\/;'));
  if(!m)throw new Error('var '+nome+' (regex) não encontrada');
  return m[0];
}
const sandbox={};
vm.createContext(sandbox);
vm.runInContext([
  varArr('IG_IMG_MODAL'),
  varObj('IG_IMG_STOP'),
  varArr('IG_IMG_MODAL_PT'),
  varArr('IG_IMG_ORGAOS'),
  varRe('IG_IMG_NORMAL'),
  varRe('IG_IMG_NAO_EXAME'),
  trecho('function igImgDeacc(','igImgDeacc'),
  trecho('function igImgHas(','igImgHas'),
  trecho('function igImgHasPref(','igImgHasPref'),
  trecho('function igImgModalDaBusca(','igImgModalDaBusca'),
  trecho('function igImgOrgaos(','igImgOrgaos'),
  trecho('function igImgPedidoCoerente(','igImgPedidoCoerente'),
  trecho('function igImgRelevante(','igImgRelevante')
].join('\n'),sandbox);
const {igImgRelevante,igImgPedidoCoerente}=sandbox;

// --- O ENUNCIADO manda: coerência do pedido antes mesmo de buscar --------------
// Enunciado REAL do print do professor (06/08). A RM é descrita como NORMAL.
const stemPrint='Mulher de 34 anos investiga amenorreia secundária de 8 meses e galactorreia. '
  +'Nega uso de medicamentos, cefaleia ou alteração visual. Exames: prolactina 68 ng/mL [VR 4,8–23,3], '
  +'TSH 2,1 mUI/L [VR 0,4–4,0], beta-hCG negativo. RM de sela sem contraste descreve hipófise de dimensões '
  +'normais, sem imagem sugestiva de adenoma. Repetida a prolactina em nova coleta com diluição seriada, '
  +'mantém-se em 71 ng/mL. Qual o próximo passo mais adequado?';
ok(igImgPedidoCoerente('pituitary MRI microadenoma',stemPrint)===false,
   'REGRESSÃO DO PRINT: enunciado diz que a RM de sela é NORMAL — não pode buscar figura nenhuma');

// Mesmo caso, mas com achado de verdade: aí a figura faz sentido.
const stemAchado='Homem de 42 anos com cefaleia e hemianopsia bitemporal. RM de sela evidencia lesão '
  +'expansiva selar de 2,4 cm com extensão suprasselar. Qual o diagnóstico mais provável?';
ok(igImgPedidoCoerente('pituitary MRI macroadenoma',stemAchado)===true,
   'enunciado com achado de imagem real tem de continuar podendo ilustrar');

// Órgão que o enunciado nem menciona.
ok(igImgPedidoCoerente('adrenal CT pheochromocytoma',stemAchado)===false,
   'busca de ÓRGÃO que o enunciado não cita tem de ser recusada');

// Modalidade que o caso não tem (enunciado tem USG, busca pede TC).
const stemUsg='Mulher de 51 anos com nódulo tireoidiano palpável. USG de tireoide mostra nódulo sólido '
  +'hipoecogênico de 1,8 cm com microcalcificações. Qual a conduta?';
ok(igImgPedidoCoerente('thyroid CT nodule',stemUsg)===false,
   'busca de MODALIDADE que o enunciado não cita tem de ser recusada');
ok(igImgPedidoCoerente('thyroid ultrasound papillary carcinoma',stemUsg)===true,
   'modalidade e órgão batendo com o enunciado tem de passar');

// Sem enunciado (uso antigo), não trava.
ok(igImgPedidoCoerente('thyroid ultrasound nodule','')===true,
   'sem enunciado a coerência não pode bloquear');

// --- a figura tem de citar o órgão DO ENUNCIADO -------------------------------
ok(igImgRelevante('thyroid ultrasound nodule',{
     title:'Ultrasound of the ovary',
     caption:'Transvaginal sonography showing an ovarian cyst.'},stemUsg)===false,
   'figura de outro órgão não passa, mesmo com a modalidade certa');
ok(igImgRelevante('thyroid ultrasound nodule',{
     title:'Thyroid nodule',
     caption:'Sonography of a hypoechoic thyroid nodule with microcalcifications.'},stemUsg)===true,
   'figura do órgão do enunciado, modalidade certa, tem de passar');

// --- o call site precisa MESMO usar o enunciado -------------------------------
const attach=trecho('function igAttachExamImage(','igAttachExamImage');
ok(/igImgPedidoCoerente\(/.test(attach),
   'igAttachExamImage tem de conferir a coerência com o enunciado antes de buscar');
ok(/q\.stem|stem/.test(attach),'igAttachExamImage tem de ler o enunciado da questão');

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

// --- (C) figuras que NÃO são exame -------------------------------------------
// Casos REAIS colhidos do Open-i ao vivo em 06/08/2026, depois que a política de
// rede do ambiente foi aberta. Os três passavam pelo filtro da primeira versão.
const stemGraves='Homem de 29 anos com tireotoxicose. Cintilografia de tireoide com captação difusamente aumentada. Diagnóstico?';
ok(igImgRelevante('thyroid scintigraphy Graves disease',{
     // ⚠️ o TÍTULO do artigo cita a modalidade; a FIGURA é uma curva ROC.
     title:"Prognostic value of (99m)Tc-pertechnetate thyroid scintigraphy in radioiodine therapy in Graves' disease: a pilot clinical study.",
     caption:'ROC curve used to identify cut-off values related to RIT success in patients with GD. (a) Thyroid mass. The area under the curve (AUC) was 0.811.'},
     stemGraves)===false,
   'REAL: curva ROC não pode ilustrar cintilografia — o título do ARTIGO não vale como modalidade');
ok(igImgRelevante('thyroid ultrasound papillary carcinoma',{
     title:'Ultrasound features of papillary thyroid carcinoma: a retrospective study.',
     caption:'Cytological images showing nuclear grooving (A) and intranuclear inclusions (B; arrows) consistent with papillary carcinoma.'},
     stemUsg)===false,
   'REAL: lâmina de citologia não pode entrar no lugar de um ultrassom');
ok(igImgRelevante('bone densitometry osteoporosis',{
     title:'Improvement of treatment rate of osteoporosis after educational intervention.',
     caption:'Bar graph of the osteoporosis treatment rate before and after educations.'},
     'Mulher de 63 anos com fratura por fragilidade. Densitometria óssea com T-score de coluna lombar −2,8. Conduta?')===false,
   'REAL: gráfico de barras não é densitometria');
// E o que é exame de verdade continua passando (também colhido ao vivo):
ok(igImgRelevante('thyroid scintigraphy Graves disease',{
     title:'Ectopic thyroid tissue.',
     caption:'Technetium pertechnetate thyroid scintigraphy showing diffusely increased uptake.'},
     stemGraves)===true,
   'cintilografia de verdade tem de continuar passando');
ok(/var IG_IMG_NAO_EXAME=/.test(html),'a lista de figuras que não são exame tem de existir');

// --- (D) o filtro na ORIGEM (api/ai.js) ---------------------------------------
const ai=fs.readFileSync(path.join(__dirname,'..','api','ai.js'),'utf8');
ok(/OPENI_TIPOS\s*=\s*'[^']*'/.test(ai),'api/ai.js tem de definir os tipos de imagem aceitos no Open-i');
const tipos=(ai.match(/OPENI_TIPOS\s*=\s*'([^']*)'/)||[])[1]||'';
ok(!/(^|,)g(,|$)/.test(tipos),
   '⚠️ o tipo "g" (gráficos) NÃO pode entrar — é o maior balde do Open-i e entrega curva ROC como exame');
ok(!/(^|,)mc(,|$)/.test(tipos),'o tipo "mc" (microscopia) não pode entrar — entrega lâmina no lugar do exame');
ok(/(^|,)(m)(,|$)/.test(tipos)&&/(^|,)(c)(,|$)/.test(tipos)&&/(^|,)(u)(,|$)/.test(tipos),
   'RM, TC e ultrassom precisam estar entre os tipos aceitos');
ok(/it:\s*OPENI_TIPOS/.test(ai),'o parâmetro it= tem de ir na busca do Open-i');

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
