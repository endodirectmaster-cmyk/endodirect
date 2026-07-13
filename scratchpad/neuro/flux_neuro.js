// Fluxogramas dos 7 resumos de Neuroendocrinologia, seguindo o algoritmo da
// diretriz-fonte de cada tema, adaptado ao português. Reproduz a lógica clínica
// do algoritmo (conduta/fatos), não a figura. UPDATE por tema trocando `fluxogramas`.
const F = {
'Hipopituitarismo': [{
  titulo:'Investigação do hipopituitarismo',
  fonte:'Algoritmo baseado na Endocrine Society Clinical Practice Guideline (2016), adaptado ao português',
  nos:[
    {tipo:'inicio', texto:'Suspeita (doença selar, sintomas de deficiência hormonal) → dosar cada eixo (hormônio-alvo + trófico) e RM de hipófise'},
    {tipo:'decisao', texto:'Hormônio-alvo baixo com trófico inapropriadamente normal/baixo (padrão central)?', ramos:[
      {rotulo:'NÃO', tipo:'fim', texto:'Eixo preservado — reavaliar/monitorar conforme a causa'},
      {rotulo:'SIM', tipo:'acao', texto:'Confirmar a deficiência (testes de estímulo se necessário) e repor'} ]},
    {tipo:'acao', texto:'Repor na ordem: glicocorticoide → levotiroxina → esteroides sexuais → GH (se indicado)'},
    {tipo:'fim', texto:'Educar sobre doses de estresse; tratar/seguir a causa estrutural (RM)'}
  ]}],

'Hiperprolactinemia e Prolactinoma': [{
  titulo:'Investigação da hiperprolactinemia',
  fonte:'Algoritmo da Endocrine Society Clinical Practice Guideline (2011), adaptado ao português',
  nos:[
    {tipo:'inicio', texto:'Prolactina elevada confirmada → excluir gravidez, fármacos, hipotireoidismo e insuficiência renal (pesquisar macroprolactina se assintomático)'},
    {tipo:'decisao', texto:'Causa secundária identificada?', ramos:[
      {rotulo:'SIM', tipo:'fim', texto:'Tratar/retirar a causa (ajustar fármaco, tratar hipotireoidismo) e reavaliar'},
      {rotulo:'NÃO', tipo:'acao', texto:'RM de hipófise (atenção ao efeito gancho: diluir a amostra se macroadenoma com PRL baixa)'} ]},
    {tipo:'decisao', texto:'Prolactinoma na RM?', ramos:[
      {rotulo:'SIM', tipo:'fim', texto:'Agonista dopaminérgico (cabergolina, 1ª linha, mesmo em macroadenoma); cirurgia se resistência/intolerância/apoplexia/compressão persistente'},
      {rotulo:'NÃO (massa não-prolactinoma)', tipo:'fim', texto:'Considerar efeito haste; conduzir conforme a lesão selar'} ]}
  ]}],

'Acromegalia': [{
  titulo:'Diagnóstico e manejo da acromegalia',
  fonte:'Algoritmo da Endocrine Society Clinical Practice Guideline (2014) e da Pituitary Society, adaptado ao português',
  nos:[
    {tipo:'inicio', texto:'Suspeita clínica (crescimento de extremidades, traços grosseiros, comorbidades) → dosar IGF-1'},
    {tipo:'decisao', texto:'IGF-1 elevado para idade/sexo?', ramos:[
      {rotulo:'NÃO', tipo:'fim', texto:'Acromegalia improvável — buscar outra causa dos sintomas'},
      {rotulo:'SIM', tipo:'acao', texto:'Confirmar: GH não suprime no TOTG (75 g) → RM de hipófise'} ]},
    {tipo:'decisao', texto:'Doença cirurgicamente ressecável?', ramos:[
      {rotulo:'SIM', tipo:'acao', texto:'Cirurgia transesfenoidal → reavaliar IGF-1/GH'},
      {rotulo:'NÃO', tipo:'fim', texto:'Fármacos (análogo de somatostatina/pegvisomanto/cabergolina) ± radioterapia'} ]},
    {tipo:'decisao', texto:'IGF-1/GH normalizados no pós-operatório?', ramos:[
      {rotulo:'SIM', tipo:'fim', texto:'Controle bioquímico — seguimento e manejo das comorbidades'},
      {rotulo:'NÃO', tipo:'fim', texto:'Terapia adjuvante: análogo de somatostatina → pegvisomanto/cabergolina ± radioterapia'} ]}
  ]}],

'Incidentaloma Hipofisário e Adenoma Não Funcionante': [{
  titulo:'Conduta no incidentaloma hipofisário',
  fonte:'Algoritmo da Endocrine Society Clinical Practice Guideline (2011), adaptado ao português',
  nos:[
    {tipo:'inicio', texto:'Lesão selar incidental → rastreio de hipersecreção (prolactina, IGF-1; Cushing se sinais) e de hipopituitarismo; campo visual se a lesão toca/comprime o quiasma'},
    {tipo:'decisao', texto:'Prolactina muito elevada (prolactinoma)?', ramos:[
      {rotulo:'SIM', tipo:'fim', texto:'Tratar com agonista dopaminérgico (não operar de rotina)'},
      {rotulo:'NÃO', tipo:'acao', texto:'Avaliar compressão do quiasma (campimetria) e os demais eixos'} ]},
    {tipo:'decisao', texto:'Déficit visual, crescimento, apoplexia ou outro tumor hipersecretor?', ramos:[
      {rotulo:'SIM', tipo:'fim', texto:'Cirurgia transesfenoidal + reposição dos eixos deficientes'},
      {rotulo:'NÃO', tipo:'fim', texto:'Adenoma não funcionante → acompanhamento (imagem + hormônios), repor deficiências'} ]}
  ]}],

'Apoplexia Hipofisária e Hipofisite': [{
  titulo:'Manejo da apoplexia hipofisária',
  fonte:'Algoritmo baseado no UK Guidelines for the Management of Pituitary Apoplexy (2011), adaptado ao português',
  nos:[
    {tipo:'inicio', texto:'Cefaleia súbita intensa ± déficit visual/oftalmoplegia → suspeitar de apoplexia; RM de urgência e dosar eixos (cortisol!)'},
    {tipo:'acao', texto:'Glicocorticoide em dose de estresse imediato + suporte hidroeletrolítico (não esperar os exames)'},
    {tipo:'decisao', texto:'Déficit visual grave/progressivo ou rebaixamento do sensório?', ramos:[
      {rotulo:'SIM', tipo:'fim', texto:'Descompressão cirúrgica (transesfenoidal) urgente'},
      {rotulo:'NÃO', tipo:'fim', texto:'Manejo conservador com observação e reposição; reavaliar hipopituitarismo depois'} ]}
  ]}],

'Diabetes Insípido (Deficiência de AVP)': [{
  titulo:'Investigação da poliúria hipotônica (deficiência × resistência à AVP)',
  fonte:'Algoritmo baseado no consenso internacional de diabetes insipidus / deficiência de AVP (2022), adaptado ao português',
  nos:[
    {tipo:'inicio', texto:'Poliúria hipotônica confirmada (urina diluída) → excluir glicosúria/diurético; teste de restrição hídrica (± copeptina), sempre supervisionado'},
    {tipo:'decisao', texto:'A urina concentra com a restrição?', ramos:[
      {rotulo:'SIM', tipo:'fim', texto:'Polidipsia primária provável (concentrou espontaneamente)'},
      {rotulo:'NÃO', tipo:'acao', texto:'Administrar desmopressina e reavaliar a osmolaridade urinária'} ]},
    {tipo:'decisao', texto:'A urina concentra após a desmopressina?', ramos:[
      {rotulo:'SIM', tipo:'fim', texto:'Central (deficiência de AVP) → desmopressina; RM de hipófise e buscar a causa'},
      {rotulo:'NÃO', tipo:'fim', texto:'Nefrogênico (resistência à AVP) → remover a causa, tiazídico + dieta hipossódica'} ]}
  ]}],

'SIADH e Hiponatremia': [{
  titulo:'Abordagem da hiponatremia',
  fonte:'Algoritmo baseado no European Clinical Practice Guideline on Hyponatraemia (2014), adaptado ao português',
  nos:[
    {tipo:'inicio', texto:'Hiponatremia → confirmar hipotonicidade (excluir hiperglicemia e pseudo-hiponatremia)'},
    {tipo:'decisao', texto:'Sintomas neurológicos graves (convulsão/coma)?', ramos:[
      {rotulo:'SIM', tipo:'acao', texto:'Salina hipertônica 3% controlada (corrigir ≤ 8–10 mEq/L nas primeiras 24 h)'},
      {rotulo:'NÃO', tipo:'acao', texto:'Avaliar volemia, osmolaridade urinária e sódio urinário'} ]},
    {tipo:'decisao', texto:'Euvolêmico, urina concentrada, Na urinário alto, tireoide/adrenal normais?', ramos:[
      {rotulo:'SIM', tipo:'fim', texto:'SIADH → restrição hídrica (± ureia/vaptano) e tratar a causa'},
      {rotulo:'NÃO', tipo:'fim', texto:'Classificar por volemia (hipo/hipervolêmica) e tratar conforme a causa'} ]}
  ]}]
};

const fs=require('fs');
let cases='';
Object.entries(F).forEach(([tema,flux])=>{
  const j=JSON.stringify(flux);
  if(j.indexOf('$f$')>=0) throw new Error('colisão $f$ em '+tema);
  const temaEsc=tema.replace(/'/g,"''");
  cases+=`      WHEN a->>'sub'='Neuroendocrinologia' AND a->>'privado'='true' AND a->>'tema'='${temaEsc}'\n`+
         `        THEN a || jsonb_build_object('fluxogramas', $f$${j}$f$::jsonb)\n`;
});
const sql=
`-- Fluxogramas de Neuroendocrinologia fiéis ao algoritmo das diretrizes-fonte, em português\n`+
`UPDATE endodirect_global_state\n`+
`SET payload = jsonb_set(payload, '{diretrizes}', (\n`+
`  SELECT jsonb_agg(\n    CASE\n`+cases+`      ELSE a\n    END ORDER BY ord)\n`+
`  FROM jsonb_array_elements(payload->'diretrizes') WITH ORDINALITY AS x(a, ord)\n`+
`))\nWHERE payload ? 'diretrizes';`;
fs.writeFileSync(__dirname+'/flux_neu.sql', sql);
console.log('Neuro: fluxogramas atualizados para', Object.keys(F).length, 'temas. SQL bytes:', sql.length);
Object.keys(F).forEach((t,i)=>console.log('  '+(i+1)+'. '+t));
