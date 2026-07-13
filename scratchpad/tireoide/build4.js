// (A) Adiciona FLUXOGRAMA aos 6 resumos de Tireoide que ainda não tinham
//     (Avaliação, Graves, Bócio, CA diferenciado, Tireoidites, Gestação).
// (B) EXPANDE o capítulo "Carcinoma Medular e Anaplásico" (resumo/pts/mapa/
//     flashcards/tabela/fluxograma) — pedido do professor.
// Schema fluxograma: {titulo,fonte,nos:[{tipo,texto,ramos?:[{rotulo,texto,tipo}]}]}.
const FSRC='Síntese Endodirect (baseado em ATA)';

const FLUXOS = {
'Tireoide: Avaliação da Função e Imagem':[{
  titulo:'Interpretação do TSH alterado', fonte:FSRC, nos:[
  {tipo:'inicio', texto:'Suspeita de disfunção tireoidiana → dosar TSH'},
  {tipo:'decisao', texto:'TSH elevado?', ramos:[
    {rotulo:'SIM', tipo:'fim', texto:'Dosar T4 livre: baixo = hipotireoidismo primário; normal = subclínico (anti-TPO). TSH muito alto + T4L alto = raro (resistência/TSHoma)'},
    {rotulo:'NÃO', tipo:'acao', texto:'Avaliar se TSH está baixo/suprimido'} ]},
  {tipo:'decisao', texto:'TSH baixo/suprimido?', ramos:[
    {rotulo:'SIM', tipo:'fim', texto:'Dosar T4L/T3: altos = tireotoxicose (definir causa por TRAb/RAIU); normais = hipertireoidismo subclínico; baixos = central ou doente não-tireoidiano'},
    {rotulo:'NÃO', tipo:'fim', texto:'TSH normal → função normal; se nódulo/bócio, seguir com ultrassom'} ]}
]}],

'Doença de Graves (Hipertireoidismo)':[{
  titulo:'Escolha do tratamento na Doença de Graves', fonte:FSRC, nos:[
  {tipo:'inicio', texto:'Graves confirmada (TRAb+) — betabloqueador para sintomas'},
  {tipo:'decisao', texto:'Gestante, oftalmopatia ativa moderada-grave ou preferência por não-definitivo?', ramos:[
    {rotulo:'SIM', tipo:'fim', texto:'Antitireoidiano (metimazol; PTU no 1º trimestre) por 12–18 meses'},
    {rotulo:'NÃO', tipo:'acao', texto:'Considerar terapia definitiva'} ]},
  {tipo:'decisao', texto:'Bócio volumoso/compressivo, nódulo suspeito ou necessidade de controle rápido?', ramos:[
    {rotulo:'SIM', tipo:'fim', texto:'Tireoidectomia total (após eutireoidismo + Lugol pré-op)'},
    {rotulo:'NÃO', tipo:'fim', texto:'Radioiodo (evitar na oftalmopatia ativa; repor levotiroxina após o hipotireoidismo)'} ]}
]}],

'Bócio e Hipertireoidismo por Autonomia (BMN tóxico e adenoma tóxico)':[{
  titulo:'Bócio nodular com TSH suprimido', fonte:FSRC, nos:[
  {tipo:'inicio', texto:'Bócio nodular com TSH suprimido — cintilografia'},
  {tipo:'decisao', texto:'Nódulo(s) hipercaptante(s) "quente(s)"?', ramos:[
    {rotulo:'SIM', tipo:'acao', texto:'Autonomia (adenoma tóxico = focal; BMN tóxico = heterogêneo) — betabloqueador ± antitireoidiano para preparo'},
    {rotulo:'NÃO', tipo:'fim', texto:'Captação difusa/baixa → reavaliar (Graves ou tireoidite): ver diagnóstico diferencial da tireotoxicose'} ]},
  {tipo:'decisao', texto:'Bócio volumoso/compressivo ou suspeita de malignidade?', ramos:[
    {rotulo:'SIM', tipo:'fim', texto:'Tireoidectomia'},
    {rotulo:'NÃO', tipo:'fim', texto:'Radioiodo (tratamento definitivo da autonomia)'} ]}
]}],

'Carcinoma Diferenciado de Tireoide (papilífero e folicular)':[{
  titulo:'Conduta pós-tireoidectomia no carcinoma diferenciado', fonte:'Síntese Endodirect (baseado em ATA 2015)', nos:[
  {tipo:'inicio', texto:'Carcinoma diferenciado ressecado — estratificar risco de recorrência (ATA: baixo/intermediário/alto)'},
  {tipo:'decisao', texto:'Risco intermediário/alto após tireoidectomia total?', ramos:[
    {rotulo:'SIM', tipo:'acao', texto:'Radioiodo ablativo (I-131)'},
    {rotulo:'NÃO', tipo:'acao', texto:'Baixo risco: radioiodo não é rotineiro'} ]},
  {tipo:'acao', texto:'Levotiroxina com grau de supressão do TSH conforme risco e resposta'},
  {tipo:'decisao', texto:'Tireoglobulina em elevação no seguimento?', ramos:[
    {rotulo:'SIM', tipo:'fim', texto:'Investigar recidiva: US cervical + PCI com I-131; se Tg+/PCI− → PET-FDG (± inibidor de tirosina-quinase)'},
    {rotulo:'NÃO', tipo:'fim', texto:'Seguimento com tireoglobulina (+anti-Tg) e ultrassom cervical'} ]}
]}],

'Tireoidites':[{
  titulo:'Tireotoxicose com captação de iodo baixa', fonte:FSRC, nos:[
  {tipo:'inicio', texto:'Tireotoxicose com RAIU baixa (padrão destrutivo)'},
  {tipo:'decisao', texto:'Tireoide dolorosa com VHS/PCR muito elevados?', ramos:[
    {rotulo:'SIM', tipo:'fim', texto:'Tireoidite subaguda (De Quervain) → AINE ou corticoide + betabloqueador'},
    {rotulo:'NÃO', tipo:'acao', texto:'Indolor — avaliar o contexto'} ]},
  {tipo:'decisao', texto:'Pós-parto (até 1 ano) ou anti-TPO+?', ramos:[
    {rotulo:'SIM', tipo:'fim', texto:'Tireoidite silenciosa/pós-parto → suporte; vigiar evolução para hipotireoidismo'},
    {rotulo:'NÃO', tipo:'acao', texto:'Uso de amiodarona, carga de iodo ou levotiroxina exógena?'} ]},
  {tipo:'fim', texto:'Amiodarona tipo 2 (destrutiva) → corticoide; excesso de iodo ou factícia (Tg baixa) → remover a fonte'}
]}],

'Tireoide e Gestação':[{
  titulo:'Disfunção tireoidiana na gestação', fonte:FSRC, nos:[
  {tipo:'inicio', texto:'Gestante — avaliar TSH (rastrear se fator de risco) com referência por trimestre'},
  {tipo:'decisao', texto:'TSH acima da referência do trimestre?', ramos:[
    {rotulo:'SIM', tipo:'fim', texto:'Hipotireoidismo: tratar o franco sempre; subclínico se anti-TPO+ ou TSH alto. Quem já usa LT4 → +30% e alvo TSH < 2,5 (1º tri)'},
    {rotulo:'NÃO', tipo:'acao', texto:'TSH baixo? avaliar hormônios e TRAb'} ]},
  {tipo:'decisao', texto:'TSH suprimido com T4L/T3 altos e TRAb+?', ramos:[
    {rotulo:'SIM', tipo:'fim', texto:'Doença de Graves → PTU no 1º tri → metimazol depois; menor dose (T4L no limite superior); TRAb no 3º trimestre'},
    {rotulo:'NÃO', tipo:'fim', texto:'TSH baixo isolado (hCG/hiperêmese) → tireotoxicose gestacional transitória: só suporte, sem antitireoidiano'} ]}
]}]
};

// (B) Carcinoma Medular e Anaplásico — versão EXPANDIDA (substitui o objeto)
const CA_MED = {
  sub:'Tireoide', privado:true, titulo:'', ano:'2026', url:'',
  tema:'Carcinoma Medular e Anaplásico de Tireoide',
  fonte:'Síntese Endodirect · Vilar 8ed + Williams/Greenspan + ATA',
  resumo:`## Carcinoma medular de tireoide (CMT)
Tumor **neuroendócrino** das **células C parafoliculares** (produzem **calcitonina**) — origem **diferente** do folículo, por isso **não capta iodo** nem responde a TSH. Representa **~1–2%** dos cânceres de tireoide, mas responde por parcela desproporcional da mortalidade.

### Esporádico × hereditário
- **Esporádico (~75%):** nódulo solitário, geralmente 5ª–6ª décadas; **mutação RET somática** frequente (M918T = pior prognóstico).
- **Hereditário (~25%):** mutação **germinativa do proto-oncogene RET** (autossômica dominante) → síndromes **NEM 2**:
  - **NEM 2A** (códon **634**): CMT + **feocromocitoma** + **hiperparatireoidismo primário**.
  - **NEM 2B** (códon **918**): CMT (precoce e agressivo) + feocromocitoma + **neuromas mucosos** + **ganglioneuromatose intestinal** + **hábito marfanoide**; **não** tem hiperparatireoidismo.
  - **CMT familiar (FMTC):** só CMT.

### Diagnóstico e marcadores
- **Calcitonina** (diagnóstico e seguimento; o nível se **correlaciona com a massa tumoral**) e **CEA**. Calcitonina basal muito alta sugere doença extensa.
- **PAAF** (± imuno-histoquímica/calcitonina no lavado) confirma. **Dosar calcitonina** em nódulos suspeitos.
- **Antes de operar:** **excluir feocromocitoma** (metanefrinas plasmáticas/urinárias) — se presente, **operar o feocromocitoma PRIMEIRO** (risco de crise hipertensiva); rastrear **hiperparatireoidismo**; **testar RET germinativo** (e familiares de 1º grau).

### Tratamento e seguimento
- **Tireoidectomia total + esvaziamento cervical central** (± lateral conforme doença/calcitonina). **Não usa radioiodo** (não capta) nem supressão de TSH.
- **Seguimento:** calcitonina e CEA seriados; o **tempo de duplicação (doubling time)** desses marcadores é **forte fator prognóstico**.
- **Doença avançada/metastática:** **inibidores seletivos de RET** (**selpercatinibe, pralsetinibe** — grande eficácia em RET-mutado) ou multiquinase (vandetanibe, cabozantinibe).
- **Portadores de mutação RET:** **tireoidectomia profilática** na infância, com **idade guiada pelo risco do códon** (mais precoce na NEM 2B).

## Carcinoma anaplásico (indiferenciado)
Um dos **tumores sólidos mais agressivos** que existem; idoso, **massa cervical de crescimento rápido** com sintomas compressivos (dispneia, disfagia, **rouquidão**, estridor). Surge **de novo** ou por **desdiferenciação** de um carcinoma diferenciado. **Não** capta iodo, **não** produz tireoglobulina útil.
- **Estágio IV por definição** (IVA/B/C); prognóstico **muito ruim** (sobrevida mediana em **meses**).
- **Diagnóstico:** biópsia (core/incisional); avaliar **BRAF V600E** (guia terapia-alvo) e outras mutações.
- **Manejo:** prioridade é a **via aérea** (avaliar traqueostomia — decisão individualizada); abordagem **multimodal** (cirurgia se ressecável + **radioterapia** + **quimioterapia**). **BRAF V600E+** → **dabrafenibe + trametinibe** (resposta significativa em subgrupo, inclusive neoadjuvante). Cuidados **paliativos** têm papel central.`,
  pts:[
    'Carcinoma medular vem das células C parafoliculares (calcitonina); não capta iodo nem responde a TSH.',
    'Esporádico (~75%) ou hereditário (~25%) por mutação germinativa RET (NEM 2A/2B, FMTC).',
    'NEM 2A (códon 634): CMT + feocromocitoma + hiperparatireoidismo; NEM 2B (códon 918): + neuromas mucosos e hábito marfanoide, mais agressivo.',
    'Marcadores: calcitonina (correlaciona com a massa) e CEA; o tempo de duplicação é prognóstico.',
    'Antes de operar o medular, excluir feocromocitoma (metanefrinas) e operá-lo primeiro; rastrear RET e hiperparatireoidismo.',
    'Tratamento do medular: tireoidectomia total + esvaziamento central (sem radioiodo nem supressão de TSH).',
    'Medular avançado: inibidores seletivos de RET (selpercatinibe/pralsetinibe).',
    'Portadores de RET: tireoidectomia profilática na infância, com idade guiada pelo risco do códon.',
    'Anaplásico: tumor muito agressivo do idoso, massa cervical de crescimento rápido; estágio IV por definição, prognóstico em meses.',
    'Anaplásico: prioridade é a via aérea; manejo multimodal; BRAF V600E+ responde a dabrafenibe + trametinibe.'
  ],
  mapa:{ central:'Medular e anaplásico',
    nodes:[
      { label:'Medular (células C)', children:[
        {label:'Calcitonina + CEA', children:['Correlaciona c/ massa','Doubling time = prognóstico']},
        {label:'RET', children:['Esporádico (M918T)','Germinativo → NEM 2']},
        {label:'Antes de operar', children:['Excluir feocromocitoma','Rastrear RET/hiperpara']},
        {label:'Tireoidectomia + esvaziamento'},
        {label:'Avançado → inibidor de RET'} ]},
      { label:'NEM 2', children:[
        {label:'2A (códon 634)', children:['CMT+feo+hiperpara']},
        {label:'2B (códon 918)', children:['+neuromas, marfanoide','Mais agressivo']},
        {label:'FMTC (só CMT)'},
        {label:'Tireoidectomia profilática'} ]},
      { label:'Anaplásico', children:[
        {label:'Idoso, crescimento rápido'},
        {label:'De novo ou desdiferenciação'},
        {label:'Estágio IV, prognóstico ruim'},
        {label:'Via aérea + multimodal'},
        {label:'BRAF+ → dabrafenibe+trametinibe'} ]}
    ]},
  flashcards:[
    {q:'De que células vem o carcinoma medular e qual seu marcador?',a:'Das células C parafoliculares, que produzem calcitonina — o principal marcador de diagnóstico e seguimento (junto do CEA); não capta iodo nem responde a TSH.'},
    {q:'O que é imprescindível excluir antes da tireoidectomia por carcinoma medular?',a:'Feocromocitoma (dosar metanefrinas), pela associação com NEM 2 — se presente, opera-se o feocromocitoma primeiro para evitar crise hipertensiva; também se rastreia a mutação RET e o hiperparatireoidismo.'},
    {q:'Quais os componentes e códons da NEM 2A e da NEM 2B?',a:'NEM 2A (códon 634): carcinoma medular + feocromocitoma + hiperparatireoidismo. NEM 2B (códon 918): carcinoma medular (precoce/agressivo) + feocromocitoma + neuromas mucosos e hábito marfanoide, sem hiperparatireoidismo.'},
    {q:'Por que o radioiodo não é usado no carcinoma medular e qual o tratamento?',a:'Porque as células C não captam iodo; o tratamento é cirúrgico (tireoidectomia total com esvaziamento central) e, na doença avançada, inibidores seletivos de RET (selpercatinibe/pralsetinibe).'},
    {q:'Qual o valor prognóstico do seguimento com calcitonina/CEA no medular?',a:'O tempo de duplicação (doubling time) da calcitonina e do CEA é um forte fator prognóstico — quanto mais curto, mais agressiva a doença.'},
    {q:'Quais as características e a urgência no carcinoma anaplásico?',a:'É um dos tumores mais agressivos, do idoso, com massa cervical de crescimento rápido e compressão — a prioridade é garantir a via aérea; é estágio IV por definição, com manejo multimodal, e responde a dabrafenibe+trametinibe se BRAF V600E positivo.'}
  ],
  fluxogramas:[{
    titulo:'Abordagem do carcinoma medular de tireoide', fonte:FSRC, nos:[
    {tipo:'inicio', texto:'Nódulo suspeito de CMT ou calcitonina elevada'},
    {tipo:'acao', texto:'Confirmar (PAAF/calcitonina), dosar CEA, EXCLUIR feocromocitoma (metanefrinas) e testar mutação RET germinativa'},
    {tipo:'decisao', texto:'Feocromocitoma presente?', ramos:[
      {rotulo:'SIM', tipo:'fim', texto:'Operar o feocromocitoma PRIMEIRO (evitar crise), depois a tireoide'},
      {rotulo:'NÃO', tipo:'acao', texto:'Tireoidectomia total + esvaziamento cervical central'} ]},
    {tipo:'fim', texto:'Seguimento com calcitonina e CEA (tempo de duplicação = prognóstico); doença avançada → inibidores de RET (selpercatinibe/pralsetinibe)'}
  ]}]
};

// A tabela "## 📊 Diferenciado × Medular × Anaplásico" já foi anexada ao resumo antigo;
// como reescrevemos o resumo, re-anexamos a tabela ao novo texto.
CA_MED.resumo += `

## 📊 Diferenciado × Medular × Anaplásico
| Característica | Diferenciado | Medular | Anaplásico |
| --- | --- | --- | --- |
| Célula de origem | Folicular | Parafolicular (C) | Indiferenciada |
| Marcador | Tireoglobulina | Calcitonina / CEA | Nenhum útil |
| Capta iodo | Sim | Não | Não |
| Genética | BRAF/RAS | RET (NEM 2) | BRAF em subgrupo |
| Prognóstico | Bom | Intermediário | Muito ruim |`;

// ── SQL ──
const fs=require('fs');
function jq(v,tag){const j=JSON.stringify(v);if(j.indexOf('$'+tag+'$')>=0)throw new Error('colisão '+tag);return '$'+tag+'$'+j+'$'+tag+'$';}

let cases='';
Object.entries(FLUXOS).forEach(([tema,flux],i)=>{
  const tag='f'+i;
  cases+=`      WHEN a->>'sub'='Tireoide' AND a->>'privado'='true' AND a->>'tema'='${tema.replace(/'/g,"''")}'\n`+
         `        THEN a || jsonb_build_object('fluxogramas', ${jq(flux,tag)}::jsonb)\n`;
});
// CA medular: substitui o objeto inteiro
cases+=`      WHEN a->>'sub'='Tireoide' AND a->>'privado'='true' AND a->>'tema'='Carcinoma Medular e Anaplásico de Tireoide'\n`+
       `        THEN ${jq(CA_MED,'cm')}::jsonb\n`;

const sql=
`-- Fluxogramas em 6 resumos de Tireoide + expansão do CA medular/anaplásico\n`+
`UPDATE endodirect_global_state\n`+
`SET payload = jsonb_set(payload, '{diretrizes}', (\n`+
`  SELECT jsonb_agg(\n    CASE\n`+cases+`      ELSE a\n    END ORDER BY ord)\n`+
`  FROM jsonb_array_elements(payload->'diretrizes') WITH ORDINALITY AS x(a, ord)\n))\n`+
`WHERE payload ? 'diretrizes';`;
fs.writeFileSync(__dirname+'/build4.sql', sql);
console.log('Fluxogramas adicionados a', Object.keys(FLUXOS).length, 'resumos + CA medular reescrito. SQL bytes:', sql.length);
