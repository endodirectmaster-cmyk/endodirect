// Fluxogramas dos resumos de Lípides que têm algoritmo de diretriz, seguindo a
// lógica clínica da fonte (SBC / Endocrine Society / EAS), adaptada ao português.
// "Metabolismo Lipídico e Lipoproteínas" NÃO entra: é esquema fisiológico (não há
// fluxograma de diretriz para ele) — fica como está.
const F = {
'Hipertrigliceridemias Primárias': [{
  titulo:'Abordagem da hipertrigliceridemia primária',
  fonte:'Algoritmo baseado na Endocrine Society (2012) e na Diretriz Brasileira de Dislipidemias (SBC), adaptado ao português',
  nos:[
    {tipo:'inicio', texto:'Triglicérides elevados → confirmar, afastar causas secundárias e avaliar história familiar'},
    {tipo:'decisao', texto:'TG muito alto (≥ 1000 mg/dL) / risco de pancreatite?', ramos:[
      {rotulo:'SIM', tipo:'acao', texto:'Prioridade: reduzir TG — dieta muito pobre em gordura + fibrato/ômega-3 (dieta é a base na quilomicronemia familiar)'},
      {rotulo:'NÃO', tipo:'acao', texto:'Estilo de vida + tratar risco CV (estatina; fibrato se o TG persistir alto)'} ]},
    {tipo:'decisao', texto:'Colesterol e TG ambos altos com xantomas palmares (suspeita de tipo III)?', ramos:[
      {rotulo:'SIM', tipo:'fim', texto:'Investigar apoE2/E2 (disbetalipoproteinemia) → fibrato/estatina e controle dos fatores'},
      {rotulo:'NÃO', tipo:'fim', texto:'Classificar (familiar, combinada) e tratar conforme o risco'} ]}
  ]}],

'Hipertrigliceridemias Secundárias': [{
  titulo:'Abordagem da hipertrigliceridemia secundária',
  fonte:'Algoritmo baseado na Endocrine Society (2012) e na Diretriz Brasileira de Dislipidemias (SBC), adaptado ao português',
  nos:[
    {tipo:'inicio', texto:'Hipertrigliceridemia → rastrear causas (glicemia, TSH, renal/hepático, fármacos, álcool, gestação)'},
    {tipo:'decisao', texto:'Causa secundária identificada?', ramos:[
      {rotulo:'SIM', tipo:'acao', texto:'Tratar/remover a causa (controlar diabetes, tratar hipotireoidismo, trocar fármaco, cessar álcool)'},
      {rotulo:'NÃO', tipo:'fim', texto:'Considerar forma primária → tratar conforme gravidade e risco'} ]},
    {tipo:'decisao', texto:'Triglicérides normalizaram após tratar a causa?', ramos:[
      {rotulo:'SIM', tipo:'fim', texto:'Manter o controle da causa e do risco cardiovascular'},
      {rotulo:'NÃO', tipo:'fim', texto:'Associar fibrato/ômega-3 (± estatina); prevenir pancreatite se TG muito alto'} ]}
  ]}],

'Hipercolesterolemias Primárias': [{
  titulo:'Abordagem da hipercolesterolemia primária / HF',
  fonte:'Algoritmo baseado na Diretriz Brasileira de Dislipidemias (SBC) e no consenso da EAS sobre hipercolesterolemia familiar, adaptado ao português',
  nos:[
    {tipo:'inicio', texto:'LDL muito elevado → afastar causas secundárias; avaliar história familiar e exame físico (xantomas tendíneos, arco corneano precoce)'},
    {tipo:'decisao', texto:'Critérios de HF (LDL alto + história/estigmas ou genética — ex.: Dutch Lipid Clinic Network)?', ramos:[
      {rotulo:'SIM', tipo:'acao', texto:'Hipercolesterolemia familiar → estatina de alta potência + ezetimiba ± anti-PCSK9; rastrear familiares em cascata'},
      {rotulo:'NÃO', tipo:'fim', texto:'Provável poligênica/combinada → estatina conforme o risco cardiovascular'} ]},
    {tipo:'decisao', texto:'Forma homozigótica (LDL extremo, xantomas na infância)?', ramos:[
      {rotulo:'SIM', tipo:'fim', texto:'Terapias adicionais (evinacumabe, lomitapida) e LDL-aférese'},
      {rotulo:'NÃO', tipo:'fim', texto:'Otimizar a terapia (oral/injetável) até a meta de LDL'} ]}
  ]}],

'Hipercolesterolemias Secundárias': [{
  titulo:'Abordagem da hipercolesterolemia secundária',
  fonte:'Algoritmo baseado na Diretriz Brasileira de Dislipidemias (SBC) e na Endocrine Society, adaptado ao português',
  nos:[
    {tipo:'inicio', texto:'Hipercolesterolemia → rastrear causas (TSH, glicemia, função renal/proteinúria, hepático, fármacos, dieta)'},
    {tipo:'decisao', texto:'Causa secundária identificada (ex.: hipotireoidismo, síndrome nefrótica)?', ramos:[
      {rotulo:'SIM', tipo:'acao', texto:'Tratar a causa (repor levotiroxina, tratar a nefropatia, ajustar fármaco) e reavaliar o perfil'},
      {rotulo:'NÃO', tipo:'fim', texto:'Considerar forma primária (avaliar HF) → tratar conforme risco'} ]},
    {tipo:'decisao', texto:'LDL persiste elevado apesar de tratar a causa / alto risco CV?', ramos:[
      {rotulo:'SIM', tipo:'fim', texto:'Estatina (± ezetimiba) até a meta de LDL'},
      {rotulo:'NÃO', tipo:'fim', texto:'Manter o controle da causa e do estilo de vida'} ]}
  ]}],

'Alfalipoproteinemias (Distúrbios do HDL)': [{
  titulo:'Abordagem dos distúrbios do HDL',
  fonte:'Esquema didático baseado em revisões, adaptado ao português',
  nos:[
    {tipo:'inicio', texto:'HDL alterado no perfil lipídico → interpretar no contexto (não é alvo terapêutico isolado)'},
    {tipo:'decisao', texto:'HDL baixo?', ramos:[
      {rotulo:'SIM', tipo:'acao', texto:'Rastrear causas secundárias (TG altos, obesidade, diabetes, tabagismo, fármacos) e otimizar estilo de vida'},
      {rotulo:'NÃO (HDL alto)', tipo:'acao', texto:'Geralmente benigno; se muito alto sem causa, considerar deficiência de CETP'} ]},
    {tipo:'decisao', texto:'HDL extremamente baixo com achados físicos (amígdalas alaranjadas, opacidade corneana)?', ramos:[
      {rotulo:'SIM', tipo:'fim', texto:'Suspeitar de forma genética (Tangier, deficiência de LCAT, deficiência de apoA-I) → avaliação especializada'},
      {rotulo:'NÃO', tipo:'fim', texto:'Tratar o risco cardiovascular pelo LDL/apoB (estatina conforme risco)'} ]}
  ]}]
};

const fs=require('fs');
let cases='';
Object.entries(F).forEach(([tema,flux])=>{
  const j=JSON.stringify(flux);
  if(j.indexOf('$f$')>=0) throw new Error('colisão $f$ em '+tema);
  const temaEsc=tema.replace(/'/g,"''");
  cases+=`      WHEN a->>'sub'='Lípides' AND a->>'privado'='true' AND a->>'tema'='${temaEsc}'\n`+
         `        THEN a || jsonb_build_object('fluxogramas', $f$${j}$f$::jsonb)\n`;
});
const sql=
`-- Fluxogramas de Lípides fiéis ao algoritmo das diretrizes-fonte (SBC/ES/EAS), em português\n`+
`UPDATE endodirect_global_state\n`+
`SET payload = jsonb_set(payload, '{diretrizes}', (\n`+
`  SELECT jsonb_agg(\n    CASE\n`+cases+`      ELSE a\n    END ORDER BY ord)\n`+
`  FROM jsonb_array_elements(payload->'diretrizes') WITH ORDINALITY AS x(a, ord)\n`+
`))\nWHERE payload ? 'diretrizes';`;
fs.writeFileSync(__dirname+'/flux_lip.sql', sql);
console.log('Lípides: fluxogramas atualizados para', Object.keys(F).length, 'temas (Metabolismo mantido). SQL bytes:', sql.length);
Object.keys(F).forEach((t,i)=>console.log('  '+(i+1)+'. '+t));
