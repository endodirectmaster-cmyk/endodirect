// Os 12 fluxogramas de Tireoide já seguem o algoritmo da ATA/EUGOGO (feitos no
// batch anterior). Aqui apenas TORNO A CITAÇÃO EXPLÍCITA: cada fluxograma passa
// a nomear a diretriz-fonte específica (ATA 2015/2016/2017/2021; EUGOGO), deixando
// claro que o fluxograma vem da diretriz original, adaptado ao português.
// jsonb_set no caminho {fluxogramas,0,fonte} — não altera os nós do algoritmo.
const FONTE = {
'Tireoide: Avaliação da Função e Imagem':'Abordagem baseada nas recomendações da American Thyroid Association (TSH como teste inicial), adaptada ao português',
'Hipotireoidismo':'Algoritmo baseado nas diretrizes ATA/AACE de hipotireoidismo, adaptado ao português',
'Tireotoxicose: Abordagem e Diagnóstico Diferencial':'Algoritmo baseado nas ATA Guidelines 2016 (hipertireoidismo e tireotoxicose), adaptado ao português',
'Doença de Graves (Hipertireoidismo)':'Algoritmo baseado nas ATA Guidelines 2016 (hipertireoidismo e tireotoxicose), adaptado ao português',
'Bócio e Hipertireoidismo por Autonomia (BMN tóxico e adenoma tóxico)':'Algoritmo baseado nas ATA Guidelines 2016 (hipertireoidismo e tireotoxicose), adaptado ao português',
'Nódulo Tireoidiano (TI-RADS e Bethesda)':'Algoritmo baseado nas ATA Guidelines 2015 (nódulos tireoidianos) e no sistema Bethesda, adaptado ao português',
'Carcinoma Diferenciado de Tireoide (papilífero e folicular)':'Algoritmo baseado nas ATA Guidelines 2015 (câncer diferenciado de tireoide), adaptado ao português',
'Carcinoma Medular e Anaplásico de Tireoide':'Algoritmo baseado nas ATA Guidelines de carcinoma medular (2015) e anaplásico (2021), adaptado ao português',
'Tireoidites':'Algoritmo baseado nas ATA Guidelines 2016 (diagnóstico diferencial da tireotoxicose/tireoidites), adaptado ao português',
'Tireoide e Gestação':'Algoritmo baseado nas ATA Guidelines 2017 (doença tireoidiana na gestação e pós-parto), adaptado ao português',
'Emergências Tireoidianas: Crise Tireotóxica e Coma Mixedematoso':'Algoritmo baseado nas ATA Guidelines 2016 e nos critérios de Burch-Wartofsky (crise tireotóxica), adaptado ao português',
'Oftalmopatia de Graves (Doença Ocular Tireoidiana)':"Algoritmo baseado no consenso EUGOGO (European Group on Graves' Orbitopathy), adaptado ao português"
};

const fs=require('fs');
let cases='';
Object.entries(FONTE).forEach(([tema,fonte])=>{
  const jv=JSON.stringify(fonte); // string JSON (com aspas)
  if(jv.indexOf('$f$')>=0) throw new Error('colisão $f$ em '+tema);
  const temaEsc=tema.replace(/'/g,"''");
  cases+=`      WHEN a->>'sub'='Tireoide' AND a->>'privado'='true' AND a->>'tema'='${temaEsc}'\n`+
         `        THEN jsonb_set(a, '{fluxogramas,0,fonte}', $f$${jv}$f$::jsonb)\n`;
});
const sql=
`-- Tireoide: citação explícita da diretriz-fonte em cada fluxograma (não altera os nós)\n`+
`UPDATE endodirect_global_state\n`+
`SET payload = jsonb_set(payload, '{diretrizes}', (\n`+
`  SELECT jsonb_agg(\n    CASE\n`+cases+`      ELSE a\n    END ORDER BY ord)\n`+
`  FROM jsonb_array_elements(payload->'diretrizes') WITH ORDINALITY AS x(a, ord)\n`+
`))\nWHERE payload ? 'diretrizes';`;
fs.writeFileSync(__dirname+'/flux_tir.sql', sql);
console.log('Tireoide: citação de diretriz atualizada em', Object.keys(FONTE).length, 'fluxogramas. SQL bytes:', sql.length);
