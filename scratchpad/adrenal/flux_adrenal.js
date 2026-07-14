// Substitui os fluxogramas dos 7 resumos de Adrenal por versões que seguem
// FIELMENTE o algoritmo publicado da diretriz-fonte (Endocrine Society / ESE-ENSAT),
// adaptado ao português. Reproduz a LÓGICA do algoritmo (conduta/fatos), não a
// figura. UPDATE por tema (jsonb_agg+CASE) trocando só o campo `fluxogramas`.
const F = {
'Insuficiência Adrenal e Crise Adrenal': [{
  titulo:'Diagnóstico da insuficiência adrenal (Endocrine Society)',
  fonte:'Algoritmo da Endocrine Society Clinical Practice Guideline (2016), adaptado ao português',
  nos:[
    {tipo:'inicio', texto:'Suspeita clínica (fadiga, hipotensão, hiponatremia, hiperpigmentação) — excluir uso de glicocorticoide exógeno; dosar cortisol sérico matinal (8h) e ACTH'},
    {tipo:'decisao', texto:'Cortisol matinal claramente baixo (ex.: < 5 µg/dL)?', ramos:[
      {rotulo:'SIM', tipo:'acao', texto:'Insuficiência adrenal provável — estadiar pelo ACTH'},
      {rotulo:'INDETERMINADO', tipo:'acao', texto:'Teste de estímulo com ACTH 250 µg (cosintropina): cortisol aos 30–60 min'} ]},
    {tipo:'decisao', texto:'Pico de cortisol < 18 µg/dL (500 nmol/L) após a cosintropina?', ramos:[
      {rotulo:'NÃO', tipo:'fim', texto:'Insuficiência adrenal afastada — investigar outra causa'},
      {rotulo:'SIM', tipo:'acao', texto:'Insuficiência adrenal confirmada — avaliar o ACTH plasmático'} ]},
    {tipo:'decisao', texto:'ACTH acima do limite superior (elevado)?', ramos:[
      {rotulo:'SIM', tipo:'fim', texto:'Primária (Addison): dosar aldosterona/renina e anti-21-hidroxilase; repor glicocorticoide + fludrocortisona'},
      {rotulo:'NÃO (baixo/normal)', tipo:'fim', texto:'Secundária/central: avaliar demais eixos hipofisários e RM de hipófise; repor só glicocorticoide'} ]}
  ]}],

'Síndrome de Cushing': [{
  titulo:'Investigação da síndrome de Cushing (Endocrine Society)',
  fonte:'Algoritmo da Endocrine Society Clinical Practice Guideline (2008), adaptado ao português',
  nos:[
    {tipo:'inicio', texto:'Suspeita clínica — excluir glicocorticoide exógeno; escolher 1 teste de rastreio: cortisol livre urinário 24h, cortisol salivar noturno ou supressão com 1 mg de dexametasona'},
    {tipo:'decisao', texto:'Teste de rastreio alterado?', ramos:[
      {rotulo:'NÃO', tipo:'fim', texto:'Cushing improvável (reavaliar se a suspeita persistir)'},
      {rotulo:'SIM', tipo:'acao', texto:'Confirmar com um segundo teste (dentre os demais)'} ]},
    {tipo:'decisao', texto:'Dois testes concordantes e alterados?', ramos:[
      {rotulo:'NÃO / discordante', tipo:'fim', texto:'Reavaliar (pseudo-Cushing?) e/ou encaminhar a especialista'},
      {rotulo:'SIM', tipo:'acao', texto:'Hipercortisolismo confirmado — dosar ACTH'} ]},
    {tipo:'decisao', texto:'ACTH suprimido?', ramos:[
      {rotulo:'SIM', tipo:'fim', texto:'ACTH-independente (adrenal) → TC de adrenais → adrenalectomia'},
      {rotulo:'NÃO (normal/alto)', tipo:'acao', texto:'ACTH-dependente → RM de hipófise'} ]},
    {tipo:'fim', texto:'Adenoma hipofisário evidente → cirurgia transesfenoidal; RM duvidosa ou lesão < 6 mm → cateterismo dos seios petrosos inferiores (BIPSS ± CRH) para diferenciar doença de Cushing × secreção ectópica'}
  ]}],

'Hiperaldosteronismo Primário (Conn)': [{
  titulo:'Investigação do hiperaldosteronismo primário (Endocrine Society)',
  fonte:'Algoritmo da Endocrine Society Clinical Practice Guideline (2016), adaptado ao português',
  nos:[
    {tipo:'inicio', texto:'HAS com critério de rastreio → corrigir hipocalemia e ajustar anti-hipertensivos interferentes → relação aldosterona/renina (ARR)'},
    {tipo:'decisao', texto:'ARR elevada (aldosterona alta + renina suprimida)?', ramos:[
      {rotulo:'NÃO', tipo:'fim', texto:'Hiperaldosteronismo improvável — investigar outras causas de HAS'},
      {rotulo:'SIM', tipo:'acao', texto:'Teste confirmatório (sobrecarga salina EV/oral, fludrocortisona ou captopril) — dispensável se quadro inequívoco (hipocalemia espontânea + renina indetectável + aldosterona muito alta)'} ]},
    {tipo:'decisao', texto:'Aldosterona não suprime (confirmado) e paciente candidato/deseja cirurgia?', ramos:[
      {rotulo:'NÃO', tipo:'fim', texto:'Tratamento clínico com antagonista mineralocorticoide (espironolactona/eplerenona)'},
      {rotulo:'SIM', tipo:'acao', texto:'TC de adrenais (excluir carcinoma) + cateterismo de veias adrenais (AVS) para lateralizar'} ]},
    {tipo:'decisao', texto:'AVS mostra lateralização unilateral?', ramos:[
      {rotulo:'SIM', tipo:'fim', texto:'Adrenalectomia laparoscópica'},
      {rotulo:'NÃO (bilateral)', tipo:'fim', texto:'Antagonista mineralocorticoide'} ]}
  ]}],

'Feocromocitoma e Paraganglioma': [{
  titulo:'Abordagem do feocromocitoma/paraganglioma (Endocrine Society)',
  fonte:'Algoritmo da Endocrine Society Clinical Practice Guideline (2014), adaptado ao português',
  nos:[
    {tipo:'inicio', texto:'Suspeita (crises adrenérgicas, HAS lábil, incidentaloma, síndrome hereditária) → metanefrinas plasmáticas livres OU metanefrinas urinárias fracionadas'},
    {tipo:'decisao', texto:'Metanefrinas elevadas?', ramos:[
      {rotulo:'NÃO', tipo:'fim', texto:'Feocromocitoma improvável — revisar interferentes/outras causas'},
      {rotulo:'SIM', tipo:'acao', texto:'Confirmado — localizar por TC ou RM de abdome/pelve; oferecer teste genético a todos'} ]},
    {tipo:'decisao', texto:'Doença metastática, multifocal ou hereditária?', ramos:[
      {rotulo:'SIM', tipo:'acao', texto:'Imagem funcional (PET-DOTATATE de preferência; MIBG/FDG conforme) para estadiar'},
      {rotulo:'NÃO', tipo:'acao', texto:'Prosseguir para o preparo cirúrgico'} ]},
    {tipo:'acao', texto:'Preparo pré-operatório: bloqueio α por 7–14 dias + hidratação/dieta rica em sal; adicionar β SOMENTE após o α'},
    {tipo:'fim', texto:'Ressecção do tumor (adrenalectomia/ressecção do paraganglioma) → seguimento vitalício com metanefrinas'}
  ]}],

'Incidentaloma Adrenal': [{
  titulo:'Conduta no incidentaloma adrenal (ESE/ENSAT)',
  fonte:'Algoritmo da ESE/ENSAT Clinical Practice Guideline (2016), adaptado ao português',
  nos:[
    {tipo:'inicio', texto:'Massa adrenal incidental → TC sem contraste (densidade e tamanho) + avaliação hormonal em todos'},
    {tipo:'decisao', texto:'Imagem tipicamente benigna (homogênea, ≤ 10 UH, < 4 cm)?', ramos:[
      {rotulo:'SIM', tipo:'acao', texto:'Provável adenoma — dispensa imagem adicional de rotina; seguir com o rastreio hormonal'},
      {rotulo:'NÃO / indeterminada', tipo:'decisao', texto:'Características de malignidade (> 4 cm, > 10 UH heterogênea, irregular, crescimento)?', ramos:[
        {rotulo:'SIM', tipo:'fim', texto:'Considerar adrenalectomia — excluir feocromocitoma ANTES de operar'},
        {rotulo:'NÃO', tipo:'acao', texto:'Caracterizar (washout/RM ou reimagem) e manter o rastreio hormonal'} ]} ]},
    {tipo:'acao', texto:'Rastreio hormonal: supressão com 1 mg de dexametasona (cortisol > 1,8 µg/dL = secreção autônoma) + metanefrinas; relação aldosterona/renina se HAS ou hipocalemia'},
    {tipo:'decisao', texto:'Funcionante (Cushing, feocromocitoma, aldosteronoma)?', ramos:[
      {rotulo:'SIM', tipo:'fim', texto:'Tratar/operar conforme o hormônio (preparo se feocromocitoma)'},
      {rotulo:'NÃO', tipo:'fim', texto:'Adenoma não funcionante e benigno → acompanhamento individualizado'} ]}
  ]}],

'Hiperplasia Adrenal Congênita (HAC)': [{
  titulo:'Diagnóstico da HAC por deficiência de 21-hidroxilase (Endocrine Society)',
  fonte:'Algoritmo da Endocrine Society Clinical Practice Guideline (2018), adaptado ao português',
  nos:[
    {tipo:'inicio', texto:'Suspeita (ambiguidade genital/perda de sal neonatal; ou hiperandrogenismo tardio) → 17-hidroxiprogesterona basal (pela manhã; fase folicular na mulher)'},
    {tipo:'decisao', texto:'17-OHP basal muito elevada (ex.: > 1000 ng/dL)?', ramos:[
      {rotulo:'SIM', tipo:'fim', texto:'HAC clássica confirmada → glicocorticoide (± fludrocortisona na perdedora de sal) + confirmação genética (CYP21A2)'},
      {rotulo:'INTERMEDIÁRIA / DUVIDOSA', tipo:'acao', texto:'Teste de estímulo com ACTH (17-OHP após cosintropina)'} ]},
    {tipo:'decisao', texto:'17-OHP pós-ACTH elevada?', ramos:[
      {rotulo:'SIM', tipo:'fim', texto:'HAC (provável não-clássica) → tratar apenas se sintomática'},
      {rotulo:'NÃO', tipo:'fim', texto:'HAC afastada — investigar outras causas de hiperandrogenismo (ex.: SOP)'} ]}
  ]}],

'Carcinoma Adrenocortical': [{
  titulo:'Abordagem da massa adrenal suspeita de carcinoma (ESE/ENSAT)',
  fonte:'Algoritmo da ESE/ENSAT Clinical Practice Guideline (2018), adaptado ao português',
  nos:[
    {tipo:'inicio', texto:'Massa adrenal grande/suspeita (> 4 cm, > 10–20 UH, heterogênea, crescimento) → avaliação hormonal completa (cortisol/dexa, DHEAS e androgênios, 17-OHP, estradiol) e estadiamento (TC tórax/abdome ± RM/PET-FDG)'},
    {tipo:'acao', texto:'Excluir feocromocitoma (metanefrinas) ANTES de qualquer intervenção; evitar biópsia (salvo doença metastática sem alvo cirúrgico, após excluir feo)'},
    {tipo:'decisao', texto:'Doença localizada e ressecável?', ramos:[
      {rotulo:'SIM', tipo:'fim', texto:'Adrenalectomia aberta com ressecção completa (R0) em bloco por equipe experiente ± mitotano adjuvante (± radioterapia do leito)'},
      {rotulo:'NÃO (avançada/irressecável)', tipo:'fim', texto:'Mitotano ± quimioterapia (EDP-M); cuidados de suporte'} ]}
  ]}]
};

const fs=require('fs');
let cases='';
Object.entries(F).forEach(([tema,flux])=>{
  const j=JSON.stringify(flux);
  if(j.indexOf('$f$')>=0) throw new Error('colisão $f$ em '+tema);
  const temaEsc=tema.replace(/'/g,"''");
  cases+=`      WHEN a->>'sub'='Adrenal' AND a->>'privado'='true' AND a->>'tema'='${temaEsc}'\n`+
         `        THEN a || jsonb_build_object('fluxogramas', $f$${j}$f$::jsonb)\n`;
});
const sql=
`-- Fluxogramas de Adrenal fiéis ao algoritmo das diretrizes-fonte (ES / ESE-ENSAT), em português\n`+
`UPDATE endodirect_global_state\n`+
`SET payload = jsonb_set(payload, '{diretrizes}', (\n`+
`  SELECT jsonb_agg(\n    CASE\n`+cases+`      ELSE a\n    END ORDER BY ord)\n`+
`  FROM jsonb_array_elements(payload->'diretrizes') WITH ORDINALITY AS x(a, ord)\n`+
`))\nWHERE payload ? 'diretrizes';`;
fs.writeFileSync(__dirname+'/flux_adr.sql', sql);
console.log('Adrenal: fluxogramas atualizados para', Object.keys(F).length, 'temas. SQL bytes:', sql.length);
Object.keys(F).forEach((t,i)=>console.log('  '+(i+1)+'. '+t));
