// Fluxogramas dos 7 resumos de Osteometabolismo, seguindo o algoritmo da
// diretriz-fonte de cada tema, adaptado ao português (lógica clínica, não figura).
const F = {
'Osteoporose: Diagnóstico e Tratamento': [{
  titulo:'Abordagem da osteoporose',
  fonte:'Algoritmo baseado nas diretrizes AACE/ACE (2020) e Endocrine Society (2019), adaptado ao português',
  nos:[
    {tipo:'inicio', texto:'Risco (idade, fratura prévia, fatores) → densitometria (DXA) + investigar causas secundárias'},
    {tipo:'decisao', texto:'T-score ≤ −2,5 ou fratura por fragilidade (quadril/vértebra)?', ramos:[
      {rotulo:'SIM', tipo:'acao', texto:'Osteoporose → tratar (cálcio/vitamina D + fármaco)'},
      {rotulo:'NÃO (osteopenia)', tipo:'decisao', texto:'FRAX de alto risco?', ramos:[
        {rotulo:'SIM', tipo:'acao', texto:'Tratar como osteoporose'},
        {rotulo:'NÃO', tipo:'fim', texto:'Medidas gerais e reavaliação periódica'} ]} ]},
    {tipo:'decisao', texto:'Muito alto risco / fratura grave?', ramos:[
      {rotulo:'SIM', tipo:'fim', texto:'Anabólico (teriparatida/abaloparatida/romosozumabe) → seguir com antirreabsortivo'},
      {rotulo:'NÃO', tipo:'fim', texto:'Antirreabsortivo (bisfosfonato/denosumabe); reavaliar duração'} ]}
  ]}],

'Hiperparatireoidismo Primário': [{
  titulo:'Investigação do hiperparatireoidismo primário',
  fonte:'Algoritmo baseado no International Workshop on Primary Hyperparathyroidism, adaptado ao português',
  nos:[
    {tipo:'inicio', texto:'Hipercalcemia → dosar PTH, cálcio iônico e corrigir por albumina'},
    {tipo:'decisao', texto:'PTH inapropriadamente normal/alto (PTH-dependente)?', ramos:[
      {rotulo:'NÃO (suprimido)', tipo:'fim', texto:'Hipercalcemia PTH-independente → investigar malignidade/outras causas'},
      {rotulo:'SIM', tipo:'acao', texto:'Calciúria 24h e clearance Ca/Cr para excluir HHF'} ]},
    {tipo:'decisao', texto:'Calciúria baixa e clearance Ca/Cr < 0,01 (HHF)?', ramos:[
      {rotulo:'SIM', tipo:'fim', texto:'HHF → não operar; orientar'},
      {rotulo:'NÃO', tipo:'acao', texto:'Hiperpara primário confirmado → avaliar critérios cirúrgicos'} ]},
    {tipo:'decisao', texto:'Preenche critério de cirurgia (cálcio > 1 mg/dL acima; < 50 anos; osteoporose/fratura; TFG < 60; cálculo; calciúria > 400)?', ramos:[
      {rotulo:'SIM', tipo:'fim', texto:'Localizar (sestamibi/US) → paratireoidectomia'},
      {rotulo:'NÃO', tipo:'fim', texto:'Monitorar; cinacalcete/antirreabsortivo conforme necessidade'} ]}
  ]}],

'Hipoparatireoidismo e Hipocalcemia': [{
  titulo:'Investigação da hipocalcemia',
  fonte:'Algoritmo baseado no consenso internacional de hipoparatireoidismo, adaptado ao português',
  nos:[
    {tipo:'inicio', texto:'Hipocalcemia confirmada (cálcio corrigido/iônico) → dosar PTH, fósforo, magnésio e 25-OH-vitamina D; ECG'},
    {tipo:'decisao', texto:'Sintomas graves (tetania, convulsão, QT longo)?', ramos:[
      {rotulo:'SIM', tipo:'acao', texto:'Gluconato de cálcio IV monitorado + corrigir magnésio'},
      {rotulo:'NÃO', tipo:'acao', texto:'Definir a causa pelo PTH'} ]},
    {tipo:'decisao', texto:'PTH baixo/inapropriado com fósforo alto?', ramos:[
      {rotulo:'SIM', tipo:'fim', texto:'Hipoparatireoidismo → cálcio oral + calcitriol (alvo de cálcio no limite inferior)'},
      {rotulo:'NÃO (PTH alto)', tipo:'fim', texto:'Deficiência de vitamina D, DRC ou resistência (pseudo-hipopara) → tratar a causa'} ]}
  ]}],

'Hipercalcemia: Diagnóstico e Manejo': [{
  titulo:'Abordagem da hipercalcemia',
  fonte:'Algoritmo baseado em consensos/revisões de hipercalcemia, adaptado ao português',
  nos:[
    {tipo:'inicio', texto:'Hipercalcemia confirmada (cálcio corrigido/iônico) → dosar PTH'},
    {tipo:'decisao', texto:'PTH alto/inapropriado?', ramos:[
      {rotulo:'SIM', tipo:'fim', texto:'PTH-dependente → hiperpara primário, HHF ou lítio (avaliar cirurgia/causa)'},
      {rotulo:'NÃO (suprimido)', tipo:'acao', texto:'Investigar PTHrP, vitamina D (25-OH e 1,25), eletroforese/cadeias leves e neoplasia'} ]},
    {tipo:'decisao', texto:'Hipercalcemia grave/sintomática?', ramos:[
      {rotulo:'SIM', tipo:'fim', texto:'Soro fisiológico + bisfosfonato IV (± calcitonina; glicocorticoide se mediada por calcitriol) e tratar a causa'},
      {rotulo:'NÃO', tipo:'fim', texto:'Tratar a causa de base e monitorar'} ]}
  ]}],

'Deficiência e Metabolismo da Vitamina D': [{
  titulo:'Avaliação e reposição da vitamina D',
  fonte:'Algoritmo baseado na Endocrine Society Clinical Practice Guideline (2011), adaptado ao português',
  nos:[
    {tipo:'inicio', texto:'Grupo de risco ou doença óssea → dosar 25-OH-vitamina D (± cálcio, PTH, fósforo, FA)'},
    {tipo:'decisao', texto:'25-OH-vitamina D baixa (deficiência/insuficiência)?', ramos:[
      {rotulo:'NÃO', tipo:'fim', texto:'Status suficiente — manter ingestão adequada e reavaliar conforme risco'},
      {rotulo:'SIM', tipo:'acao', texto:'Repor vitamina D e garantir cálcio'} ]},
    {tipo:'decisao', texto:'DRC ou hipoparatireoidismo (falha na 1α-hidroxilação)?', ramos:[
      {rotulo:'SIM', tipo:'fim', texto:'Usar forma ativa (calcitriol/alfacalcidol)'},
      {rotulo:'NÃO', tipo:'fim', texto:'Colecalciferol (ataque + manutenção); reavaliar 25-OH-D em ~3 meses'} ]}
  ]}],

'Doença de Paget Óssea': [{
  titulo:'Abordagem da doença de Paget óssea',
  fonte:'Algoritmo baseado na Endocrine Society Clinical Practice Guideline (2014), adaptado ao português',
  nos:[
    {tipo:'inicio', texto:'Fosfatase alcalina elevada isolada ou achado radiológico/dor óssea → suspeitar de Paget'},
    {tipo:'acao', texto:'Confirmar com radiografia e cintilografia óssea; excluir outras causas de FA alta (hepática)'},
    {tipo:'decisao', texto:'Sintomático ou sítio de risco (crânio, osso de carga, próximo a articulação)?', ramos:[
      {rotulo:'SIM', tipo:'fim', texto:'Bisfosfonato (ácido zoledrônico IV) + cálcio/vitamina D; seguir pela fosfatase alcalina'},
      {rotulo:'NÃO', tipo:'fim', texto:'Assintomático de baixo risco → monitorar (fosfatase alcalina) e analgesia se necessário'} ]}
  ]}],

'Osteomalácia e Raquitismo': [{
  titulo:'Investigação da osteomalácia/raquitismo',
  fonte:'Algoritmo baseado em revisões e consensos de doença óssea metabólica, adaptado ao português',
  nos:[
    {tipo:'inicio', texto:'Dor óssea/fraqueza/pseudofraturas (adulto) ou deformidades/atraso (criança) → dosar cálcio, fósforo, FA, PTH, 25-OH-D'},
    {tipo:'decisao', texto:'25-OH-vitamina D baixa com PTH alto (padrão carencial)?', ramos:[
      {rotulo:'SIM', tipo:'fim', texto:'Osteomalácia/raquitismo por vitamina D → repor vitamina D + cálcio (calcitriol na DRC/vit-D-dependente)'},
      {rotulo:'NÃO', tipo:'acao', texto:'Fósforo baixo com vitamina D/cálcio normais → investigar perda renal de fosfato (FGF23)'} ]},
    {tipo:'fim', texto:'Forma hipofosfatêmica → fosfato + calcitriol; burosumabe (anti-FGF23) no ligado ao X/oncogênica; ressecar tumor na oncogênica'}
  ]}]
};

const fs=require('fs');
let cases='';
Object.entries(F).forEach(([tema,flux])=>{
  const j=JSON.stringify(flux);
  if(j.indexOf('$f$')>=0) throw new Error('colisão $f$ em '+tema);
  const temaEsc=tema.replace(/'/g,"''");
  cases+=`      WHEN a->>'sub'='Osteometabolismo' AND a->>'privado'='true' AND a->>'tema'='${temaEsc}'\n`+
         `        THEN a || jsonb_build_object('fluxogramas', $f$${j}$f$::jsonb)\n`;
});
const sql=
`-- Fluxogramas de Osteometabolismo fiéis ao algoritmo das diretrizes-fonte, em português\n`+
`UPDATE endodirect_global_state\n`+
`SET payload = jsonb_set(payload, '{diretrizes}', (\n`+
`  SELECT jsonb_agg(\n    CASE\n`+cases+`      ELSE a\n    END ORDER BY ord)\n`+
`  FROM jsonb_array_elements(payload->'diretrizes') WITH ORDINALITY AS x(a, ord)\n`+
`))\nWHERE payload ? 'diretrizes';`;
fs.writeFileSync(__dirname+'/flux_ost.sql', sql);
console.log('Osteo: fluxogramas atualizados para', Object.keys(F).length, 'temas. SQL bytes:', sql.length);
Object.keys(F).forEach((t,i)=>console.log('  '+(i+1)+'. '+t));
