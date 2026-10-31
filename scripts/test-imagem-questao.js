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
  varArr('IG_IMG_SINAIS'),
  varRe('IG_IMG_NORMAL'),
  varRe('IG_IMG_NAO_EXAME'),
  varRe('IG_IMG_NAO_FOTO'),
  trecho('function igImgDeacc(','igImgDeacc'),
  trecho('function igImgHas(','igImgHas'),
  trecho('function igImgHasPref(','igImgHasPref'),
  trecho('function igImgModalDaBusca(','igImgModalDaBusca'),
  trecho('function igImgOrgaos(','igImgOrgaos'),
  trecho('function igImgSinalDaBusca(','igImgSinalDaBusca'),
  trecho('function igImgTipoDaBusca(','igImgTipoDaBusca'),
  trecho('function igImgNotaFoto(','igImgNotaFoto'),
  trecho('function igImgPedidoCoerente(','igImgPedidoCoerente'),
  trecho('function igImgRelevante(','igImgRelevante')
].join('\n'),sandbox);
const {igImgRelevante,igImgPedidoCoerente,igImgTipoDaBusca,igImgSinalDaBusca,igImgNotaFoto}=sandbox;

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
ok(/it:\s*tipo === 'foto' \? OPENI_TIPOS_FOTO : OPENI_TIPOS/.test(ai),'o parâmetro it= tem de ir na busca do Open-i (exame por padrão; foto só quando pedida)');
// Foto clínica (18/10): balde à parte, só fotografia — nunca gráfico nem microscopia.
const tiposFoto=(ai.match(/OPENI_TIPOS_FOTO\s*=\s*'([^']*)'/)||[])[1];
ok(tiposFoto==='ph','o tipo da foto clínica tem de ser só "ph" (fotografia), e veio '+JSON.stringify(tiposFoto));
ok(/openiSearch\(q, sbody\.n, sbody\.tipo === 'foto' \? 'foto' : 'exame', sbody\.livres === true\)/.test(ai),
   'o handler tem de repassar o tipo pedido (foto ou exame) à busca');

// --- (E) FOTO CLÍNICA de sinal visível (pedido do professor, 18/10) -------------
// "Estão sendo geradas questões somente com texto, sem nenhuma imagem
// contextualizando os casos clínicos." Parte da endocrinologia se vê na pele, no
// rosto e nos pés: acantose, estrias, exoftalmia, mixedema pré-tibial. As legendas
// abaixo são REAIS, colhidas no Open-i (tipo ph) em 18/10/2026.
ok(igImgTipoDaBusca('acanthosis nigricans neck')==='foto','sinal da lista sem modalidade é FOTO');
ok(igImgTipoDaBusca('thyroid ultrasound goiter')==='exame','com modalidade na busca é EXAME, mesmo citando um sinal');
ok(igImgTipoDaBusca('pituitary MRI macroadenoma')==='exame','exame de imagem continua sendo exame');
const stemAcantose='Mulher de 24 anos com ciclos menstruais irregulares, IMC de 34 kg/m² e acantose nigricans em região cervical e axilas. '
  +'Glicemia de jejum 98 mg/dL [VR 70–99]. Qual a melhor conduta?';
ok(igImgPedidoCoerente('acanthosis nigricans neck',stemAcantose,'foto')===true,
   'enunciado que DESCREVE a acantose pode receber a foto');
ok(igImgPedidoCoerente('acanthosis nigricans neck',stemAcantose.replace('e acantose nigricans','sem acantose nigricans'),'foto')===false,
   '"sem acantose" não é acantose: a foto contradiria o enunciado');
ok(igImgPedidoCoerente('acanthosis nigricans neck','Homem de 50 anos, ao exame sem bócio, acantose nigricans em nuca. Qual o diagnóstico?','foto')===true,
   'a negação de OUTRO achado ("sem bócio,") não pode apagar a acantose descrita depois da vírgula');
ok(igImgPedidoCoerente('proptosis thyroid eye disease',stemAcantose,'foto')===false,
   'sinal que o enunciado nem menciona não pode ser ilustrado');
ok(igImgPedidoCoerente('facial rash cheeks',stemAcantose,'foto')===false,
   'foto só de sinal da lista IG_IMG_SINAIS');
ok(igImgRelevante('acanthosis nigricans neck',{title:'Insulin resistance in adolescents',
     caption:'Remarkable <b>acanthosis</b> <b>nigricans</b> over the <b>neck</b>'},stemAcantose,'foto')===true,
   'REAL: foto com a legenda citando o sinal passa — mesmo com o realce <b> do Open-i no meio do termo');
ok(igImgRelevante('acanthosis nigricans neck',{title:'Acanthosis nigricans in obese adolescents',
     caption:'Distribution of body mass index by group.'},stemAcantose,'foto')===false,
   'o TÍTULO do artigo citar o sinal não basta: a LEGENDA da foto tem de citá-lo');
const stemPe='Homem de 61 anos com DM2 há 15 anos e neuropatia, com úlcera indolor na cabeça do 1º metatarso. Qual a conduta?';
ok(igImgRelevante('diabetic foot ulcer',{title:'Artificial intelligence for diabetic foot',
     caption:'Diabetic <b>foot</b> <b>ulcer</b> assessment framework. This framework symbolizes the integration of advanced technology with clinical practice.'},stemPe,'foto')===false,
   'REAL: esquema de modelo de IA não é foto do pé');
ok(igImgRelevante('diabetic foot ulcer',{title:'Topical therapy in diabetic wounds',
     caption:'Photographic image of wistar rats: Untreated <b>foot</b> <b>ulcer</b> (a)–(c), untreated foot ulcer with diabetes (d)–(f).'},stemPe,'foto')===false,
   'REAL: foto de rato não ilustra caso clínico');
const stemMix='Mulher de 45 anos com doença de Graves, exoftalmia e placas endurecidas em casca de laranja na face anterior das pernas (mixedema pré-tibial). Qual o tratamento?';
ok(igImgRelevante('pretibial myxedema',{title:'Teprotumumab for thyroid dermopathy',
     caption:'<b>Pretibial</b> <b>myxedema</b> before and after treatment with teprotumumab. A, at its worst before therapy.'},stemMix,'foto')===false,
   'REAL: o antes e depois do tratamento mostra a lesão sumindo — não ilustra o caso');
ok(igImgRelevante('pretibial myxedema',{title:'Thyroid dermopathy',
     caption:'Photograph of the patient’s lower legs demonstrating bilateral <b>pretibial</b> <b>myxedema</b>'},stemMix,'foto')===true,
   'REAL: foto das pernas com mixedema pré-tibial tem de passar');
// Mais legendas REAIS da 2ª rodada ao vivo (18/10), todas recusadas:
const stemNecro='Mulher de 29 anos com DM1 e placas amarelo-acastanhadas atróficas na região pré-tibial, sugestivas de necrobiose lipoídica. Qual a conduta?';
ok(igImgRelevante('necrobiosis lipoidica shin',{title:'Squamous cell carcinoma in necrobiosis lipoidica',
     caption:'(A and B) Large ulcerating squamous cell carcinoma arising in an area of <b>necrobiosis</b> <b>lipoidica</b> diabeticorum.'},stemNecro,'foto')===false,
   'REAL: carcinoma nascido sobre a necrobiose não é a necrobiose do caso');
ok(igImgRelevante('eruptive xanthoma',{title:'Familial chylomicronemia',
     caption:'Resolved <b>eruptive</b> <b>xanthoma</b> after 30 days on extensor surface of the arm (A)'},'Homem de 41 anos com pápulas amareladas em nádegas e cotovelos (xantomas eruptivos). Conduta?','foto')===false,
   'REAL: a lesão já resolvida não ilustra o xantoma do caso');
ok(igImgRelevante('purple striae Cushing syndrome',{title:'Primary pigmented nodular adrenocortical disease',
     caption:'Clinical characteristics and imaging of the patient. (A) Mild facial plethora; (B) Pigmented spots on lips; (C) <b>Purple</b> <b>striae</b> on the abdomen; (D–I) CT.'},
     'Mulher de 33 anos com ganho de peso central e estrias violáceas largas no abdome. Qual o próximo exame?','foto')===false,
   'REAL: prancha que junta foto e TC não é a foto do sinal');
ok(igImgRelevante('acanthosis nigricans neck',{title:'Insulin resistance',
     caption:'<b>Acanthosis</b> <b>nigricans</b> on the <b>neck</b> one month after onset and neck wound progress at four months of treatment'},stemAcantose,'foto')===false,
   'REAL: legenda que fala de tratamento mostra evolução, não o sinal');
// Entre as aprovadas, a que mostra SÓ o sinal: o painel (a) da prancha EMO é exoftalmia.
const emo={caption:'Pretherapeutic clinical appearance of a 64-year-old patient consistent with the diagnosis of EMO syndrome, exophthalmus (a), combined lymphatic and <b>pretibial</b> <b>myxedema</b> (b).'};
const pernas={caption:'Photograph of the patient’s lower legs demonstrating bilateral <b>pretibial</b> <b>myxedema</b>'};
ok(igImgRelevante('pretibial myxedema',emo,stemMix,'foto')===true&&igImgRelevante('pretibial myxedema',pernas,stemMix,'foto')===true,
   'as duas legendas citam o sinal e passam pelo filtro');
ok(igImgNotaFoto('pretibial myxedema',pernas)<igImgNotaFoto('pretibial myxedema',emo),
   'REAL: entre as aprovadas, ganha a foto só das pernas, não a prancha com exoftalmia no painel (a)');
const fetchCorpo=trecho('function igFetchExamImage(','igFetchExamImage');
ok(/igImgNotaFoto\(query,it\)/.test(fetchCorpo),'a busca de foto tem de escolher a melhor aprovada pela nota, não a primeira');

// O call site escolhe o tipo pela busca e o repassa à coerência e à busca.
ok(/igImgPedidoCoerente\(iq,stem,tipo\)/.test(attach)&&/igFetchExamImage\(iq,stem,tipo\)/.test(attach)&&/igImgTipoDaBusca\(iq\)/.test(attach),
   'igAttachExamImage tem de decidir exame × foto pela busca e repassar o tipo');
ok(/tipo:\(tipo==='foto'\?'foto':'exame'\)/.test(fetchBody)&&/igImgRelevante\(query,it,stem,tipo\)/.test(fetchBody),
   'igFetchExamImage tem de pedir o tipo ao servidor e conferir a figura pelo mesmo tipo');

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

// Os sinais que a regra oferece ao modelo têm de estar TODOS no mapa — sinal que o
// mapa não conhece vira pedido recusado em silêncio, e a questão perde a figura.
const listaSinais=(regra.match(/só desta lista: ([^(]*) \(ex\.:/)||[])[1]||'';
const sinaisRegra=listaSinais.split(',').map((x)=>x.trim()).filter(Boolean);
ok(sinaisRegra.length>=15,'a regra tem de listar os sinais aceitos para foto (achei '+sinaisRegra.length+')');
const foraDoMapa=sinaisRegra.filter((x)=>igImgSinalDaBusca(x)<0);
ok(foraDoMapa.length===0,'sinais da regra que o mapa IG_IMG_SINAIS não reconhece: '+JSON.stringify(foraDoMapa));
ok(/CASO CLÍNICO/.test(regra)&&/DESCRITO no enunciado/.test(regra),
   'a regra tem de pedir figura nos casos com achado visual e exigir o achado escrito no enunciado');

if(falhas.length){
  console.error('✗ imagem da Questão do Dia:');
  falhas.forEach(f=>console.error('  - '+f));
  process.exit(1);
}
console.log('✓ regressão imagem da questão: figura conferida contra a busca; exame normal não é ilustrado');
