// Atualiza o resumo "Diagnóstico e Classificação do Diabetes" para incluir o
// TOTG de 1 hora (ADA 2026 / IDF 2024). UPDATE por tema (jsonb_agg + CASE),
// preservando a ordem e trocando só esse item.
const FONTE='Síntese Endodirect · Vilar 8ed + Williams/Greenspan + ADA 2026/SBD';
const OBJ = { sub:'Diabetes', privado:true, titulo:'', ano:'2026', url:'',
  tema:'Diagnóstico e Classificação do Diabetes', fonte:FONTE,
  resumo:`## Critérios diagnósticos (ADA 2026 / SBD)
Qualquer um confirma diabetes; **repetir o mesmo teste** (ou dois testes distintos alterados na mesma amostra) para confirmar, **exceto** hiperglicemia inequívoca com sintomas clássicos:
- **HbA1c ≥ 6,5%** (método padronizado/NGSP-DCCT).
- **Glicemia de jejum ≥ 126 mg/dL** (jejum ≥ 8 h).
- **Glicemia de 2 h ≥ 200 mg/dL** no TOTG com 75 g.
- **Glicemia aleatória ≥ 200 mg/dL** + sintomas clássicos (poliúria, polidipsia, perda de peso).

## TOTG de 1 hora (novo — ADA 2026 / IDF)
A glicemia de **1 hora** no TOTG de 75 g é mais **sensível e precoce** que a de 2 h para detectar disglicemia:
- **1 h ≥ 209 mg/dL (11,6 mmol/L) → diabetes.**
- **1 h de 155–208 mg/dL (8,6–11,5) → hiperglicemia intermediária** (pré-diabetes/alto risco), indicando intervenção no estilo de vida.

## Pré-diabetes (risco aumentado)
- **HbA1c 5,7–6,4%**; **glicemia de jejum alterada (GJA) 100–125 mg/dL**; **intolerância à glicose (ITG) 2 h 140–199 mg/dL** (e o corte de **1 h 155–208** acima).

## Rastreamento
- **Todo adulto a partir dos 35 anos**; mais cedo se **sobrepeso/obesidade + ≥ 1 fator de risco** (história familiar, sedentarismo, HAS, dislipidemia, SOP, DCV, DMG prévio). Repetir a cada 3 anos se normal (antes se risco alto).
- Crianças/adolescentes com sobrepeso + fator de risco a partir da puberdade.

## Classificação (etiológica)
- **Tipo 1** (destruição autoimune da célula β → deficiência absoluta de insulina; inclui **LADA**).
- **Tipo 2** (resistência à insulina + falência secretora progressiva; o mais comum, ~90–95%).
- **Diabetes gestacional** (diagnosticado na gravidez, não francamente prévio).
- **Tipos específicos:** monogênico (**MODY**, neonatal), doenças do pâncreas exócrino, endocrinopatias (Cushing, acromegalia), **fármaco-induzido** (glicocorticoide), pós-transplante.

## 📊 Pontos de corte diagnósticos
| Teste | Normal | Pré-diabetes | Diabetes |
| --- | --- | --- | --- |
| HbA1c (%) | < 5,7 | 5,7–6,4 | ≥ 6,5 |
| Jejum (mg/dL) | < 100 | 100–125 | ≥ 126 |
| 1 h TOTG (mg/dL) | < 155 | 155–208 | ≥ 209 |
| 2 h TOTG (mg/dL) | < 140 | 140–199 | ≥ 200 |
| Aleatória + sintomas | — | — | ≥ 200 |`,
  pts:[
    'Diagnóstico de diabetes: HbA1c ≥ 6,5%, jejum ≥ 126, 2 h no TOTG ≥ 200 ou aleatória ≥ 200 com sintomas.',
    'Novidade ADA 2026/IDF: TOTG de 1 h — ≥ 209 mg/dL diagnostica diabetes (mais sensível que a de 2 h).',
    'TOTG de 1 h entre 155 e 208 mg/dL indica hiperglicemia intermediária (pré-diabetes/alto risco).',
    'Confirmar repetindo o teste, salvo hiperglicemia inequívoca com sintomas clássicos.',
    'Pré-diabetes: HbA1c 5,7–6,4%, jejum 100–125 (GJA) ou 2 h 140–199 (ITG).',
    'Rastrear todo adulto a partir dos 35 anos; mais cedo se sobrepeso/obesidade + fator de risco.',
    'Tipo 1: destruição autoimune com deficiência absoluta de insulina (inclui LADA).',
    'Tipo 2: resistência à insulina + falência secretora; responde por ~90–95% dos casos.',
    'Diabetes gestacional é o diagnosticado na gravidez sem diabetes prévio franco.',
    'A HbA1c pode ser falseada por anemia, hemoglobinopatias, gravidez e uremia — usar glicemia nesses casos.'],
  mapa:{ central:'Diagnóstico e classificação', nodes:[
    {label:'Critérios', children:[
      {label:'HbA1c ≥ 6,5%'},{label:'Jejum ≥ 126'},
      {label:'1 h TOTG ≥ 209 (novo)'},{label:'2 h TOTG ≥ 200'},{label:'Aleatória ≥ 200 + sintomas'}]},
    {label:'Pré-diabetes', children:['HbA1c 5,7–6,4%','GJA 100–125','ITG 140–199','1 h 155–208']},
    {label:'Rastreamento', children:[
      {label:'≥ 35 anos (todos)'},
      {label:'Antes se sobrepeso + fator de risco'}]},
    {label:'Classificação', children:[
      {label:'Tipo 1 (autoimune / LADA)'},
      {label:'Tipo 2 (resistência)'},
      {label:'Gestacional'},
      {label:'Específicos',children:['MODY','Fármaco/pancreático']}]}]},
  flashcards:[
    {q:'Quais são os critérios diagnósticos glicêmicos de diabetes?',a:'HbA1c ≥ 6,5%; glicemia de jejum ≥ 126 mg/dL; glicemia de 2 h ≥ 200 mg/dL no TOTG de 75 g; ou glicemia aleatória ≥ 200 mg/dL com sintomas clássicos. Confirmar com repetição, exceto hiperglicemia inequívoca sintomática.'},
    {q:'O que muda com o TOTG de 1 hora (ADA 2026/IDF)?',a:'A glicemia de 1 hora no TOTG de 75 g é mais sensível e precoce: valor ≥ 209 mg/dL (11,6 mmol/L) diagnostica diabetes e valores de 155–208 mg/dL indicam hiperglicemia intermediária (pré-diabetes/alto risco), permitindo intervenção mais cedo.'},
    {q:'Como se define pré-diabetes?',a:'HbA1c entre 5,7 e 6,4%, glicemia de jejum alterada (100–125 mg/dL) ou intolerância à glicose (2 h de 140–199 mg/dL no TOTG); pelo critério de 1 h, valores de 155–208 mg/dL também caracterizam risco aumentado.'},
    {q:'Quando a HbA1c pode dar resultado falso e o que usar?',a:'Em anemias, hemoglobinopatias, gestação, hemólise e uremia a HbA1c é pouco confiável; nesses casos usa-se a glicemia (jejum ou TOTG) para diagnóstico.'},
    {q:'O que é o LADA e em que categoria se enquadra?',a:'É o diabetes autoimune latente do adulto — uma forma de diabetes tipo 1 de evolução lenta, com autoanticorpos positivos, que inicialmente se comporta como tipo 2 mas progride para dependência de insulina.'}],
  fluxogramas:[{ titulo:'Rastreamento e diagnóstico do diabetes', fonte:'Algoritmo baseado no ADA Standards of Care in Diabetes 2026 (inclui TOTG de 1 h) e nas Diretrizes SBD, adaptado ao português', nos:[
    {tipo:'inicio', texto:'Adulto ≥ 35 anos ou < 35 com sobrepeso + fator de risco → HbA1c e/ou glicemia de jejum (± TOTG com leitura de 1 h e 2 h)'},
    {tipo:'decisao', texto:'Algum critério de diabetes (A1c ≥ 6,5% / jejum ≥ 126 / 1 h ≥ 209 / 2 h ≥ 200 / aleatória ≥ 200 + sintomas)?', ramos:[
      {rotulo:'SIM', tipo:'acao', texto:'Confirmar (repetir teste) salvo hiperglicemia sintomática inequívoca → classificar (tipo 1/2/específico)'},
      {rotulo:'NÃO', tipo:'decisao', texto:'Faixa de pré-diabetes (inclui 1 h 155–208)?', ramos:[
        {rotulo:'SIM', tipo:'fim', texto:'Pré-diabetes → estilo de vida ± metformina; reavaliar anualmente'},
        {rotulo:'NÃO', tipo:'fim', texto:'Normal → repetir rastreamento em 3 anos'} ]} ]},
    {tipo:'fim', texto:'Diabetes confirmado → iniciar tratamento e rastrear complicações'}
  ]}]
};

const fs=require('fs');
const j=JSON.stringify(OBJ);
if(j.indexOf('$j$')>=0) throw new Error('$j$');
// validação de tabela (sem célula vazia)
OBJ.resumo.split('\n').filter(l=>l.trim().startsWith('|')).forEach(l=>{ l.split('|').slice(1,-1).forEach(c=>{ if(c.trim()==='') throw new Error('célula vazia'); }); });
const sql=`UPDATE endodirect_global_state
SET payload = jsonb_set(payload, '{diretrizes}', (
  SELECT jsonb_agg(CASE WHEN a->>'tema'='Diagnóstico e Classificação do Diabetes' AND a->>'privado'='true'
                        THEN $j$${j}$j$::jsonb ELSE a END ORDER BY ord)
  FROM jsonb_array_elements(payload->'diretrizes') WITH ORDINALITY t(a,ord)
))
WHERE payload ? 'diretrizes';`;
fs.writeFileSync(__dirname+'/totg1h.sql', sql);
console.log('totg1h.sql gerado. bytes:', sql.length, '| pts', OBJ.pts.length, 'fc', OBJ.flashcards.length);
