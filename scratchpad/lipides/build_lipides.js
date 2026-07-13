// Resumos de Lípides (privados) — síntese própria (não reproduz livros);
// cobertura Vilar 8ed/Williams + diretrizes SBC/EAS/AHA-ACC. Cada um: resumo md
// (com tabela) + pts + mapa 3 níveis + flashcards + fluxograma. fonte distinta →
// chave de merge nova (imune ao clobber do cliente).
const FONTE='Síntese Endodirect · Vilar 8ed + Williams + SBC/EAS/AHA-ACC';
const R=[
// 1 ─ Metabolismo lipídico e lipoproteínas ─────────────────────────────────
{ sub:'Lípides', privado:true, titulo:'', ano:'2026', url:'',
  tema:'Metabolismo Lipídico e Lipoproteínas', fonte:FONTE,
  resumo:`## Lipoproteínas e apolipoproteínas
Os lípides (colesterol, triglicérides) circulam em **lipoproteínas** (núcleo lipídico + apolipoproteínas). Da maior/menos densa à menor/mais densa: **quilomícron → VLDL → IDL → LDL → HDL**. Apolipoproteínas-chave: **apoB-48** (quilomícron), **apoB-100** (VLDL/IDL/LDL — 1 por partícula, marcador de nº de partículas aterogênicas), **apoA-I** (HDL), **apoC-II** (ativa a LPL), **apoE** (ligação a receptores).

## Três vias
- **Exógena (dietética):** gordura absorvida → **quilomícrons** (intestino) → a **lipoproteína lipase (LPL)** (ativada por apoC-II) libera ácidos graxos aos tecidos → remanescentes captados pelo fígado (via apoE).
- **Endógena (hepática):** fígado exporta **VLDL** (rica em TG) → LPL → **IDL** → **LDL** (rica em colesterol), captada por **receptores de LDL (LDLR)** hepáticos (regulados por **PCSK9**, que degrada o receptor).
- **Transporte reverso do colesterol:** **HDL** retira colesterol dos tecidos (via **ABCA1/ABCG1**), esterifica com a **LCAT**, e entrega ao fígado (direto via SR-BI ou trocando por TG com VLDL/LDL pela **CETP**).

## Relevância clínica
- **Partículas com apoB (LDL, VLDL, remanescentes, Lp(a)) são aterogênicas**; o **LDL-colesterol** é o alvo primário; **não-HDL** e **apoB** refinam o risco (úteis se TG alto).
- **PCSK9** ↑ → menos receptores → LDL alto (alvo dos inibidores de PCSK9); **LDLR** defeituoso → hipercolesterolemia familiar. **LPL/apoC-II** deficientes → hipertrigliceridemia grave (quilomícrons).

## 📊 Principais lipoproteínas
| Lipoproteína | Origem | Rica em | Apo principal |
| --- | --- | --- | --- |
| Quilomícron | Intestino | Triglicérides (dieta) | apoB-48 |
| VLDL | Fígado | Triglicérides | apoB-100 |
| LDL | Metab. da VLDL | Colesterol | apoB-100 |
| HDL | Fígado/intestino | Colesterol (reverso) | apoA-I |`,
  pts:[
    'Lípides circulam em lipoproteínas: quilomícron, VLDL, IDL, LDL e HDL, com apolipoproteínas específicas.',
    'apoB-100 existe em uma cópia por partícula aterogênica (VLDL/IDL/LDL) — marca o número de partículas.',
    'Via exógena: quilomícrons levam a gordura da dieta; a LPL (ativada por apoC-II) libera ácidos graxos.',
    'Via endógena: o fígado exporta VLDL, que vira IDL e depois LDL, captada pelo receptor de LDL.',
    'PCSK9 degrada o receptor de LDL; sua inibição aumenta os receptores e reduz o LDL.',
    'Transporte reverso: o HDL retira colesterol dos tecidos (ABCA1) e o leva ao fígado.',
    'LCAT esterifica o colesterol no HDL; a CETP troca colesterol do HDL por triglicérides das partículas apoB.',
    'Partículas com apoB (LDL, remanescentes, Lp(a)) são aterogênicas; o LDL-c é o alvo primário.',
    'Não-HDL-colesterol e apoB refinam o risco, sobretudo quando os triglicérides estão altos.',
    'Defeitos no LDLR causam hipercolesterolemia familiar; defeitos na LPL/apoC-II causam hipertrigliceridemia grave.'
  ],
  mapa:{ central:'Metabolismo lipídico',
    nodes:[
      { label:'Lipoproteínas', children:[
        {label:'Quilomícron (apoB-48)'},
        {label:'VLDL/IDL/LDL (apoB-100)'},
        {label:'HDL (apoA-I)'} ]},
      { label:'Vias', children:[
        {label:'Exógena', children:['Quilomícron → LPL','apoC-II ativa a LPL']},
        {label:'Endógena', children:['VLDL → IDL → LDL','LDLR / PCSK9']},
        {label:'Reverso (HDL)', children:['ABCA1, LCAT','CETP, SR-BI']} ]},
      { label:'Clínica', children:[
        {label:'apoB = aterogênicas'},
        {label:'LDL-c alvo; não-HDL/apoB'},
        {label:'PCSK9 → alvo terapêutico'},
        {label:'LDLR/LPL → doenças genéticas'} ]}
    ]},
  flashcards:[
    {q:'Qual a função da apoC-II e o que ocorre na sua deficiência?',a:'A apoC-II ativa a lipoproteína lipase (LPL), enzima que hidrolisa os triglicérides dos quilomícrons e da VLDL; sua deficiência (como a da própria LPL) causa hipertrigliceridemia grave com acúmulo de quilomícrons e risco de pancreatite.'},
    {q:'Por que a apoB-100 é um bom marcador de partículas aterogênicas?',a:'Porque há exatamente uma molécula de apoB-100 por partícula de VLDL, IDL ou LDL; assim, a dosagem de apoB reflete o número total de partículas aterogênicas, complementando o LDL-colesterol.'},
    {q:'Qual o papel do PCSK9 no metabolismo do LDL?',a:'O PCSK9 liga-se ao receptor de LDL e promove sua degradação, reduzindo a captação de LDL; níveis/atividade aumentados elevam o LDL, e seus inibidores aumentam os receptores e baixam o LDL-colesterol.'},
    {q:'Em que consiste o transporte reverso do colesterol?',a:'É a remoção do colesterol dos tecidos periféricos pelo HDL (via transportadores ABCA1/ABCG1), sua esterificação pela LCAT e a entrega ao fígado, diretamente (SR-BI) ou após troca por triglicérides com partículas apoB pela CETP.'},
    {q:'Qual apolipoproteína caracteriza os quilomícrons e qual a VLDL/LDL?',a:'Os quilomícrons contêm apoB-48 (origem intestinal), enquanto VLDL, IDL e LDL contêm apoB-100 (origem hepática).'}
  ],
  fluxogramas:[{ titulo:'Vias do metabolismo das lipoproteínas', fonte:'Síntese Endodirect (didático)', nos:[
    {tipo:'inicio', texto:'Gordura da dieta absorvida pelo intestino'},
    {tipo:'acao', texto:'Via exógena: quilomícrons (apoB-48) → LPL (ativada por apoC-II) libera ácidos graxos → remanescentes ao fígado'},
    {tipo:'acao', texto:'Via endógena: fígado exporta VLDL → LPL → IDL → LDL (colesterol), captada pelo LDLR (regulado por PCSK9)'},
    {tipo:'decisao', texto:'Colesterol em excesso nos tecidos periféricos?', ramos:[
      {rotulo:'SIM', tipo:'fim', texto:'Transporte reverso: HDL (ABCA1/LCAT) leva colesterol ao fígado (SR-BI/CETP)'},
      {rotulo:'NÃO', tipo:'fim', texto:'Equilíbrio mantido; excesso de partículas apoB favorece aterosclerose'} ]}
  ]}]
},
// 2 ─ Hipertrigliceridemias primárias ──────────────────────────────────────
{ sub:'Lípides', privado:true, titulo:'', ano:'2026', url:'',
  tema:'Hipertrigliceridemias Primárias', fonte:FONTE,
  resumo:`## Conceito
Elevação dos **triglicérides (TG)** de base **genética**. Classificação prática por gravidade: **leve-moderada 150–499**, **grave 500–999**, **muito grave ≥ 1000 mg/dL** (risco de **pancreatite aguda**). Fenótipos de Fredrickson úteis: acúmulo de **quilomícrons (I)**, **VLDL (IV)**, ambos (**V**) ou **remanescentes (III)**.

## Principais formas
- **Síndrome de quilomicronemia familiar (SQF, tipo I):** rara, **autossômica recessiva**, deficiência de **LPL ou apoC-II** (ou GPIHBP1/LMF1/apoA-V). TG **muito altos** desde a infância → **pancreatite recorrente**, xantomas eruptivos, lipemia retinalis, hepatoesplenomegalia. Responde **pouco a fibratos** (pilar é dieta pobre em gordura).
- **Hipertrigliceridemia familiar (tipo IV):** comum, **autossômica dominante**, VLDL aumentada; TG moderados, piora com fatores secundários.
- **Hiperlipidemia familiar combinada:** muito comum, **apoB alta**, colesterol e/ou TG elevados variáveis entre familiares; alto risco cardiovascular.
- **Disbetalipoproteinemia (tipo III):** **apoE2/E2** + fator precipitante; acúmulo de **remanescentes** → colesterol e TG ambos altos, **xantomas palmares (estrias) e tuberosos**, aterosclerose precoce.

## Diagnóstico e tratamento
- Perfil lipídico (jejum se TG muito alto), afastar **causas secundárias** (essenciais!), história familiar; **soro leitoso** sugere quilomícrons. apoB e relação CT/TG ajudam no tipo III.
- **Objetivos:** prevenir **pancreatite** (TG muito alto) e reduzir risco CV. **Base: dieta** (↓gordura na SQF; ↓açúcar/álcool), atividade física, controle de peso/diabetes. **Fibratos** (1ª linha para TG muito alto, exceto SQF), **ômega-3** em dose alta, estatina se risco CV/colesterol alto. **Volanesorbe/novas terapias anti-apoC-III** na SQF.

## 📊 Formas primárias de hipertrigliceridemia
| Forma | Defeito | Lípide | Marca clínica |
| --- | --- | --- | --- |
| Quilomicronemia familiar (I) | LPL/apoC-II | Quilomícrons (TG muito alto) | Pancreatite, xantoma eruptivo |
| Hipertrigliceridemia familiar (IV) | VLDL↑ | TG moderado | Piora com fator secundário |
| Familiar combinada | apoB↑ | Colesterol e/ou TG | Alto risco CV |
| Disbetalipoproteinemia (III) | apoE2/E2 | Remanescentes (CT e TG↑) | Xantoma palmar/tuberoso |`,
  pts:[
    'Hipertrigliceridemias primárias têm base genética; classificam-se por gravidade e por fenótipo de Fredrickson.',
    'TG ≥ 1000 mg/dL define risco importante de pancreatite aguda.',
    'Síndrome de quilomicronemia familiar (tipo I): deficiência de LPL ou apoC-II, TG muito altos desde a infância.',
    'Na quilomicronemia familiar há pancreatite recorrente, xantomas eruptivos e lipemia retinalis.',
    'A quilomicronemia familiar responde pouco a fibratos; a base é dieta muito pobre em gordura.',
    'Hipertrigliceridemia familiar (tipo IV) aumenta a VLDL e piora com fatores secundários.',
    'Hiperlipidemia familiar combinada cursa com apoB alta e é de alto risco cardiovascular.',
    'Disbetalipoproteinemia (tipo III): genótipo apoE2/E2 com colesterol e triglicérides ambos elevados.',
    'O tipo III cursa com xantomas palmares (estrias) e tuberosos e aterosclerose precoce.',
    'Tratamento: dieta, atividade física, fibratos e ômega-3; novas terapias anti-apoC-III na quilomicronemia.'
  ],
  mapa:{ central:'Hipertrigliceridemia primária',
    nodes:[
      { label:'Gravidade/fenótipo', children:[
        {label:'Grave ≥ 500 / muito grave ≥ 1000'},
        {label:'Fredrickson I, IV, V, III'} ]},
      { label:'Formas', children:[
        {label:'Quilomicronemia familiar (I)', children:['LPL/apoC-II','Pancreatite, xantoma eruptivo']},
        {label:'Hipertrigliceridemia familiar (IV)', children:['VLDL↑']},
        {label:'Familiar combinada', children:['apoB↑, risco CV']},
        {label:'Disbeta (III)', children:['apoE2/E2','Xantoma palmar']} ]},
      { label:'Manejo', children:[
        {label:'Prevenir pancreatite'},
        {label:'Dieta / peso / álcool'},
        {label:'Fibrato, ômega-3'},
        {label:'Anti-apoC-III (SQF)'} ]}
    ]},
  flashcards:[
    {q:'Qual o principal risco da hipertrigliceridemia muito grave (TG ≥ 1000 mg/dL)?',a:'A pancreatite aguda, decorrente do acúmulo de quilomícrons; a prioridade terapêutica passa a ser reduzir os triglicérides para prevení-la.'},
    {q:'Qual o defeito e o tratamento de base da síndrome de quilomicronemia familiar (tipo I)?',a:'Deficiência da lipoproteína lipase (LPL) ou de seu ativador apoC-II, com TG muito elevados desde a infância; como responde mal a fibratos, a base é uma dieta muito pobre em gordura, havendo terapias anti-apoC-III para casos selecionados.'},
    {q:'Como se caracteriza a disbetalipoproteinemia (tipo III)?',a:'Pelo genótipo apoE2/E2 (somado a um fator precipitante) com acúmulo de remanescentes, elevando igualmente colesterol e triglicérides, e cursando com xantomas palmares (estrias amareladas) e tuberosos e aterosclerose precoce.'},
    {q:'O que distingue a hiperlipidemia familiar combinada?',a:'É muito comum, cursa com apoB elevada e fenótipo lipídico variável (colesterol e/ou triglicérides altos, inclusive entre familiares), conferindo alto risco cardiovascular.'},
    {q:'Quais os pilares do tratamento das hipertrigliceridemias primárias?',a:'Mudança de estilo de vida (dieta com restrição de gordura na quilomicronemia, redução de açúcar e álcool, atividade física, controle de peso e do diabetes) e, conforme o caso, fibratos, ômega-3 em dose alta e estatina quando há risco cardiovascular.'}
  ],
  fluxogramas:[{ titulo:'Abordagem da hipertrigliceridemia primária', fonte:'Síntese Endodirect (baseado em Endocrine Society/SBC)', nos:[
    {tipo:'inicio', texto:'Triglicérides elevados → confirmar, afastar causas secundárias e avaliar história familiar'},
    {tipo:'decisao', texto:'TG muito alto (≥ 1000 mg/dL) / risco de pancreatite?', ramos:[
      {rotulo:'SIM', tipo:'acao', texto:'Prioridade: reduzir TG — dieta muito pobre em gordura + fibrato/ômega-3 (dieta é a base na quilomicronemia familiar)'},
      {rotulo:'NÃO', tipo:'acao', texto:'Estilo de vida + tratar risco CV (estatina; fibrato se TG persistir alto)'} ]},
    {tipo:'decisao', texto:'Colesterol e TG ambos altos com xantomas palmares (suspeita de tipo III)?', ramos:[
      {rotulo:'SIM', tipo:'fim', texto:'Investigar apoE2/E2 (disbetalipoproteinemia) → fibrato/estatina e controle de fatores'},
      {rotulo:'NÃO', tipo:'fim', texto:'Classificar (familiar, combinada) e tratar conforme risco'} ]}
  ]}]
},
// 3 ─ Hipertrigliceridemias secundárias ────────────────────────────────────
{ sub:'Lípides', privado:true, titulo:'', ano:'2026', url:'',
  tema:'Hipertrigliceridemias Secundárias', fonte:FONTE,
  resumo:`## Conceito
Elevação dos **triglicérides** por **causa adquirida**, frequentemente **somada** a uma predisposição genética (o que agrava o quadro). Investigar **sempre** antes de rotular como primária — muitas são reversíveis.

## Causas principais
- **Metabólicas:** **diabetes mal controlado** (sobretudo tipo 2 e cetoacidose), **resistência à insulina/síndrome metabólica**, **obesidade**.
- **Dieta/hábitos:** **álcool**, dieta rica em **açúcar/carboidratos refinados**.
- **Endócrinas:** **hipotireoidismo**, síndrome de Cushing, gestação (3º trimestre — TG sobem fisiologicamente).
- **Renais/hepáticas:** **doença renal crônica/síndrome nefrótica**, hepatopatia.
- **Fármacos:** **estrogênio oral/tamoxifeno**, **corticoides**, **retinoides (isotretinoína)**, **betabloqueadores** (não seletivos), **tiazídicos**, **antirretrovirais/inibidores de protease**, **antipsicóticos atípicos**, **imunossupressores** (sirolimo, ciclosporina).

## Diagnóstico e tratamento
- Perfil lipídico + rastrear as causas: **glicemia/HbA1c**, **TSH**, **função renal/proteinúria**, **hepático**, revisar **fármacos** e **álcool**, considerar gravidez.
- **Tratar/remover a causa** frequentemente **normaliza** os TG: controlar o diabetes, tratar hipotireoidismo, suspender/trocar o fármaco, cessar álcool, perder peso.
- Persistindo TG altos ou muito altos → **fibrato/ômega-3** e manejo do risco cardiovascular (estatina). Atenção especial ao risco de **pancreatite** quando TG muito elevados.

## 📊 Causas secundárias e conduta
| Categoria | Exemplos | Conduta |
| --- | --- | --- |
| Metabólica | Diabetes, obesidade, resistência insulínica | Controlar glicemia/peso |
| Endócrina | Hipotireoidismo, Cushing, gestação | Tratar a doença de base |
| Renal/hepática | Nefrótica, DRC | Tratar; ajustar |
| Fármacos | Estrogênio, corticoide, retinoide, tiazídico | Suspender/substituir |
| Hábitos | Álcool, açúcar | Cessar/reduzir |`,
  pts:[
    'Hipertrigliceridemias secundárias têm causa adquirida e muitas vezes somam-se a uma predisposição genética.',
    'Devem ser investigadas antes de rotular a dislipidemia como primária, pois são reversíveis.',
    'Causas metabólicas: diabetes mal controlado, resistência à insulina/síndrome metabólica e obesidade.',
    'Hábitos: consumo de álcool e dieta rica em açúcar e carboidratos refinados.',
    'Causas endócrinas: hipotireoidismo, síndrome de Cushing e a gestação (terceiro trimestre).',
    'Causas renais/hepáticas: doença renal crônica, síndrome nefrótica e hepatopatia.',
    'Fármacos: estrogênio oral, corticoides, retinoides, betabloqueadores, tiazídicos, antirretrovirais, antipsicóticos.',
    'Rastreio: glicemia/HbA1c, TSH, função renal/proteinúria, hepático, revisão de fármacos e álcool.',
    'Tratar ou remover a causa costuma normalizar os triglicérides.',
    'Se persistirem altos: fibrato/ômega-3 e manejo do risco cardiovascular, atento à pancreatite.'
  ],
  mapa:{ central:'Hipertrigliceridemia secundária',
    nodes:[
      { label:'Causas', children:[
        {label:'Metabólica', children:['Diabetes','Obesidade/resistência']},
        {label:'Endócrina', children:['Hipotireoidismo','Cushing, gestação']},
        {label:'Renal/hepática', children:['Nefrótica, DRC']},
        {label:'Fármacos', children:['Estrogênio, corticoide','Retinoide, tiazídico']},
        {label:'Hábitos', children:['Álcool, açúcar']} ]},
      { label:'Investigar', children:['Glicemia/HbA1c','TSH','Renal/proteinúria','Revisar fármacos/álcool'] },
      { label:'Tratamento', children:[
        {label:'Tratar/remover a causa'},
        {label:'Normaliza os TG'},
        {label:'Fibrato/ômega-3 se persistir'},
        {label:'Prevenir pancreatite'} ]}
    ]},
  flashcards:[
    {q:'Por que investigar causas secundárias antes de tratar uma hipertrigliceridemia como primária?',a:'Porque muitas são reversíveis — controlar o diabetes, tratar o hipotireoidismo, suspender um fármaco ou cessar o álcool costuma normalizar os triglicérides — e porque frequentemente elas se somam a uma predisposição genética, agravando o quadro.'},
    {q:'Quais fármacos elevam classicamente os triglicérides?',a:'Estrogênio oral/tamoxifeno, corticoides, retinoides (isotretinoína), betabloqueadores não seletivos, diuréticos tiazídicos, inibidores de protease/antirretrovirais, antipsicóticos atípicos e imunossupressores como sirolimo e ciclosporina.'},
    {q:'Quais causas endócrinas devem ser rastreadas na hipertrigliceridemia?',a:'Hipotireoidismo (com TSH), síndrome de Cushing e o diabetes/resistência insulínica; a gestação no terceiro trimestre também eleva fisiologicamente os triglicérides.'},
    {q:'Qual a conduta inicial na hipertrigliceridemia secundária?',a:'Identificar e tratar/remover a causa de base (controle glicêmico e de peso, tratamento do hipotireoidismo, suspensão do álcool, troca do fármaco culpado), reavaliando o perfil lipídico depois.'},
    {q:'Quando associar fármacos hipolipemiantes na hipertrigliceridemia secundária?',a:'Quando os triglicérides permanecem elevados apesar do controle da causa — usando fibratos e ômega-3, sobretudo se muito altos (risco de pancreatite) — e estatina conforme o risco cardiovascular.'}
  ],
  fluxogramas:[{ titulo:'Abordagem da hipertrigliceridemia secundária', fonte:'Síntese Endodirect (baseado em Endocrine Society)', nos:[
    {tipo:'inicio', texto:'Hipertrigliceridemia → rastrear causas (glicemia, TSH, renal/hepático, fármacos, álcool, gestação)'},
    {tipo:'decisao', texto:'Causa secundária identificada?', ramos:[
      {rotulo:'SIM', tipo:'acao', texto:'Tratar/remover a causa (controlar diabetes, tratar hipotireoidismo, trocar fármaco, cessar álcool)'},
      {rotulo:'NÃO', tipo:'fim', texto:'Considerar forma primária → tratar conforme gravidade e risco'} ]},
    {tipo:'decisao', texto:'Triglicérides normalizaram após tratar a causa?', ramos:[
      {rotulo:'SIM', tipo:'fim', texto:'Manter controle da causa e do risco cardiovascular'},
      {rotulo:'NÃO', tipo:'fim', texto:'Associar fibrato/ômega-3 (± estatina); prevenir pancreatite se TG muito alto'} ]}
  ]}]
},
// 4 ─ Hipercolesterolemias primárias ───────────────────────────────────────
{ sub:'Lípides', privado:true, titulo:'', ano:'2026', url:'',
  tema:'Hipercolesterolemias Primárias', fonte:FONTE,
  resumo:`## Conceito
Elevação do **LDL-colesterol** de base **genética**. A forma monogênica mais importante é a **hipercolesterolemia familiar (HF)**; há também formas **poligênicas** (as mais comuns) e a **hiperlipidemia familiar combinada**.

## Hipercolesterolemia familiar (HF)
- **Genética:** autossômica **dominante** (codominante); mutação em **LDLR** (receptor de LDL — mais comum), **APOB** (ligante) ou **ganho de função de PCSK9**. Raro homozigoto/duplo-heterozigoto (grave).
- **Quadro:** **LDL muito alto desde o nascimento** → **aterosclerose precoce** (doença coronariana em idade jovem). Sinais: **xantomas tendíneos** (tendão de Aquiles, extensores), **arco corneano < 45 anos**, xantelasma. Homozigoto: LDL extremo, xantomas na infância, doença CV muito precoce.
- **Diagnóstico clínico:** critérios (ex.: **Dutch Lipid Clinic Network**) somando LDL, história familiar/pessoal precoce, exame físico e genética. **Rastreamento em cascata** dos familiares.

## Outras primárias
- **Hipercolesterolemia poligênica:** somatório de variantes + ambiente; a causa mais comum de LDL alto, sem os estigmas da HF.
- **Hiperlipidemia familiar combinada:** apoB alta, colesterol e/ou TG variáveis.
- **Sitosterolemia** (rara, ABCG5/G8): acúmulo de esteróis vegetais, xantomas.

## Tratamento
- **Estatina de alta potência** é a base (metas de LDL agressivas por serem de alto/muito alto risco). Associar **ezetimiba** e, se necessário, **inibidor de PCSK9** (ou **ácido bempedoico/inclisirana**). Na **HF homozigótica**: terapias adicionais (lomitapida, evinacumabe, **LDL-aférese**). Início precoce e rastreamento familiar são cruciais.

## 📊 Formas de hipercolesterolemia primária
| Forma | Gene/defeito | Estigma | Tratamento-chave |
| --- | --- | --- | --- |
| HF heterozigótica | LDLR/APOB/PCSK9 | Xantoma tendíneo, arco precoce | Estatina alta + ezetimiba ± anti-PCSK9 |
| HF homozigótica | LDLR (2 alelos) | Xantomas na infância | Anti-PCSK9, evinacumabe, aférese |
| Poligênica | Múltiplas variantes | Sem estigmas | Estatina conforme risco |
| Familiar combinada | apoB↑ | Variável | Estatina ± outros |`,
  pts:[
    'Hipercolesterolemias primárias elevam o LDL por base genética; a mais importante é a hipercolesterolemia familiar.',
    'A HF é autossômica dominante por mutação em LDLR (mais comum), APOB ou ganho de função de PCSK9.',
    'Na HF o LDL é muito alto desde o nascimento, levando a aterosclerose e doença coronariana precoces.',
    'Sinais físicos da HF: xantomas tendíneos, arco corneano antes dos 45 anos e xantelasma.',
    'A forma homozigótica é grave, com LDL extremo, xantomas na infância e doença CV muito precoce.',
    'O diagnóstico clínico usa critérios (Dutch Lipid Clinic Network) e confirma-se com genética.',
    'O rastreamento em cascata dos familiares é essencial na HF.',
    'A hipercolesterolemia poligênica é a causa mais comum de LDL alto, sem os estigmas da HF.',
    'Tratamento: estatina de alta potência com metas agressivas, associando ezetimiba e inibidor de PCSK9.',
    'Na HF homozigótica usam-se terapias adicionais (lomitapida, evinacumabe) e LDL-aférese.'
  ],
  mapa:{ central:'Hipercolesterolemia primária',
    nodes:[
      { label:'HF (monogênica)', children:[
        {label:'Genes', children:['LDLR (+ comum)','APOB','PCSK9 (ganho)']},
        {label:'Clínica', children:['LDL muito alto desde nascer','Aterosclerose precoce']},
        {label:'Sinais', children:['Xantoma tendíneo','Arco < 45 anos']} ]},
      { label:'Diagnóstico', children:['Critérios Dutch','Genética','Rastreio em cascata'] },
      { label:'Outras', children:[
        {label:'Poligênica (+ comum, sem estigma)'},
        {label:'Familiar combinada (apoB↑)'},
        {label:'Sitosterolemia (rara)'} ]},
      { label:'Tratamento', children:[
        {label:'Estatina alta potência'},
        {label:'+ Ezetimiba'},
        {label:'+ Anti-PCSK9 / bempedoico'},
        {label:'Homozigoto: aférese, evinacumabe'} ]}
    ]},
  flashcards:[
    {q:'Qual a herança e os genes envolvidos na hipercolesterolemia familiar?',a:'É autossômica dominante (codominante), causada por mutações no receptor de LDL (LDLR, o mais comum), na apoB (APOB) ou por ganho de função do PCSK9.'},
    {q:'Quais sinais físicos sugerem hipercolesterolemia familiar?',a:'Xantomas tendíneos (especialmente no tendão de Aquiles e extensores das mãos), arco corneano antes dos 45 anos e xantelasmas, em um paciente com LDL muito elevado e história familiar de doença coronariana precoce.'},
    {q:'Por que o rastreamento em cascata é importante na HF?',a:'Porque, sendo dominante, cada parente de primeiro grau tem 50% de chance de ser afetado; identificar e tratar precocemente os familiares previne eventos cardiovasculares prematuros.'},
    {q:'Qual a base do tratamento da hipercolesterolemia familiar heterozigótica?',a:'Estatina de alta potência com metas de LDL agressivas, associando ezetimiba e, se necessário, um inibidor de PCSK9 (ou ácido bempedoico/inclisirana), além de início precoce e controle dos demais fatores de risco.'},
    {q:'Como diferenciar a hipercolesterolemia poligênica da familiar?',a:'A poligênica resulta do somatório de várias variantes com o ambiente, é a causa mais comum de LDL alto e não apresenta os estigmas (xantomas tendíneos) nem o LDL tão extremo nem o padrão dominante claro da forma familiar monogênica.'}
  ],
  fluxogramas:[{ titulo:'Abordagem da hipercolesterolemia primária/HF', fonte:'Síntese Endodirect (baseado em SBC/EAS)', nos:[
    {tipo:'inicio', texto:'LDL muito elevado → afastar causas secundárias; avaliar história familiar e exame físico (xantomas, arco)'},
    {tipo:'decisao', texto:'Critérios de HF (LDL alto + história/estigmas ou genética)?', ramos:[
      {rotulo:'SIM', tipo:'acao', texto:'Hipercolesterolemia familiar → estatina alta potência + ezetimiba ± anti-PCSK9; rastrear familiares em cascata'},
      {rotulo:'NÃO', tipo:'fim', texto:'Provável poligênica/combinada → estatina conforme o risco cardiovascular'} ]},
    {tipo:'decisao', texto:'Forma homozigótica (LDL extremo, xantomas na infância)?', ramos:[
      {rotulo:'SIM', tipo:'fim', texto:'Terapias adicionais (evinacumabe, lomitapida) e LDL-aférese'},
      {rotulo:'NÃO', tipo:'fim', texto:'Otimizar terapia oral/injetável até a meta de LDL'} ]}
  ]}]
},
// 5 ─ Hipercolesterolemias secundárias ─────────────────────────────────────
{ sub:'Lípides', privado:true, titulo:'', ano:'2026', url:'',
  tema:'Hipercolesterolemias Secundárias', fonte:FONTE,
  resumo:`## Conceito
Elevação do **colesterol (LDL/colesterol total)** por **causa adquirida**. Devem ser **investigadas e tratadas** antes/junto do manejo lipídico, pois muitas revertem com o tratamento da doença de base e alteram a resposta aos hipolipemiantes.

## Causas principais
- **Hipotireoidismo:** causa clássica — reduz a expressão do **receptor de LDL** → LDL sobe; **sempre dosar TSH** antes de rotular hipercolesterolemia primária e antes de iniciar/ajustar estatina (o hipotireoidismo também aumenta o risco de miopatia por estatina).
- **Colestase / doença hepática colestática** (cirrose biliar primária): colesterol alto, xantomas.
- **Síndrome nefrótica:** proteinúria intensa → aumento da síntese hepática → LDL/colesterol elevados.
- **Diabetes** (padrão misto, mas pode elevar LDL/partículas), **síndrome de Cushing**, **obesidade**, **dieta** rica em gordura saturada/trans e colesterol.
- **Fármacos:** **diuréticos**, **glicocorticoides**, **ciclosporina**, **anabolizantes/androgênios**, alguns **antirretrovirais** e **anticonvulsivantes**, **amiodarona**; **progestágenos**.
- Gravidez (elevação fisiológica), anorexia nervosa.

## Diagnóstico e tratamento
- Rastrear: **TSH**, **glicemia/HbA1c**, **função renal e proteinúria**, **hepático (colestase)**, revisar **fármacos** e **dieta**.
- **Tratar a causa** (repor tiroxina, controlar diabetes, tratar a nefropatia, ajustar fármacos) frequentemente **melhora o perfil**. Persistindo LDL alto ou risco elevado → **estatina** (base) ± ezetimiba conforme a meta.

## 📊 Causas secundárias de hipercolesterolemia
| Causa | Mecanismo | Conduta |
| --- | --- | --- |
| Hipotireoidismo | ↓ receptores de LDL | Dosar TSH; repor levotiroxina |
| Síndrome nefrótica | ↑ síntese hepática | Tratar a nefropatia |
| Colestase | Retenção de colesterol | Tratar a hepatopatia |
| Fármacos | Diurético, corticoide, ciclosporina | Revisar/substituir |
| Dieta | Gordura saturada/trans | Ajuste dietético |`,
  pts:[
    'Hipercolesterolemias secundárias elevam o LDL/colesterol por causa adquirida e muitas revertem ao tratar a base.',
    'O hipotireoidismo é a causa clássica: reduz os receptores de LDL e eleva o LDL.',
    'Sempre dosar TSH antes de rotular hipercolesterolemia primária e antes de iniciar/ajustar estatina.',
    'O hipotireoidismo também aumenta o risco de miopatia induzida por estatina.',
    'Síndrome nefrótica eleva o colesterol por aumento da síntese hepática secundário à proteinúria.',
    'Colestase e cirrose biliar primária cursam com colesterol alto e xantomas.',
    'Diabetes, Cushing, obesidade e dieta rica em gordura saturada/trans também elevam o colesterol.',
    'Fármacos: diuréticos, glicocorticoides, ciclosporina, androgênios, alguns antirretrovirais e a amiodarona.',
    'Rastreio: TSH, glicemia, função renal/proteinúria, hepático, revisão de fármacos e dieta.',
    'Tratar a causa costuma melhorar o perfil; persistindo LDL alto, usar estatina conforme a meta.'
  ],
  mapa:{ central:'Hipercolesterolemia secundária',
    nodes:[
      { label:'Causas', children:[
        {label:'Hipotireoidismo', children:['↓ receptor LDL','Dosar TSH sempre']},
        {label:'Síndrome nefrótica', children:['↑ síntese hepática']},
        {label:'Colestase / hepatopatia'},
        {label:'Diabetes, Cushing, obesidade'},
        {label:'Fármacos', children:['Diurético, corticoide','Ciclosporina, androgênio']} ]},
      { label:'Investigar', children:['TSH','Glicemia/HbA1c','Renal/proteinúria','Hepático, dieta, fármacos'] },
      { label:'Tratamento', children:[
        {label:'Tratar a causa (melhora o perfil)'},
        {label:'Repor levotiroxina'},
        {label:'Estatina se persistir/alto risco'} ]}
    ]},
  flashcards:[
    {q:'Por que sempre dosar TSH em um paciente com hipercolesterolemia?',a:'Porque o hipotireoidismo é uma causa secundária clássica de LDL elevado (por reduzir os receptores de LDL) e, além disso, aumenta o risco de miopatia por estatina; tratá-lo pode normalizar o colesterol e evita rotular erroneamente uma forma primária.'},
    {q:'Como a síndrome nefrótica eleva o colesterol?',a:'A perda proteica maciça estimula a síntese hepática de lipoproteínas, elevando o LDL e o colesterol total; o tratamento da nefropatia de base melhora o perfil lipídico.'},
    {q:'Quais fármacos podem elevar o colesterol?',a:'Diuréticos, glicocorticoides, ciclosporina, androgênios/anabolizantes, alguns antirretrovirais e anticonvulsivantes, a amiodarona e progestágenos, entre outros.'},
    {q:'Qual a conduta geral na hipercolesterolemia secundária?',a:'Identificar e tratar a causa de base (repor levotiroxina, controlar diabetes, tratar a nefropatia/colestase, ajustar fármacos, corrigir a dieta) e, se o LDL permanecer alto ou o risco for elevado, associar estatina conforme a meta.'},
    {q:'Que doença hepática cursa com hipercolesterolemia e xantomas?',a:'As colestáticas, como a cirrose biliar primária (colangite biliar primária), pela retenção de colesterol.'}
  ],
  fluxogramas:[{ titulo:'Abordagem da hipercolesterolemia secundária', fonte:'Síntese Endodirect (baseado em SBC/Endocrine Society)', nos:[
    {tipo:'inicio', texto:'Hipercolesterolemia → rastrear causas (TSH, glicemia, renal/proteinúria, hepático, fármacos, dieta)'},
    {tipo:'decisao', texto:'Causa secundária identificada (ex.: hipotireoidismo, nefrótica)?', ramos:[
      {rotulo:'SIM', tipo:'acao', texto:'Tratar a causa (repor levotiroxina, tratar nefropatia, ajustar fármaco) e reavaliar o perfil'},
      {rotulo:'NÃO', tipo:'fim', texto:'Considerar forma primária (avaliar HF) → tratar conforme risco'} ]},
    {tipo:'decisao', texto:'LDL persiste elevado apesar de tratar a causa / alto risco CV?', ramos:[
      {rotulo:'SIM', tipo:'fim', texto:'Estatina (± ezetimiba) até a meta de LDL'},
      {rotulo:'NÃO', tipo:'fim', texto:'Manter controle da causa e do estilo de vida'} ]}
  ]}]
},
// 6 ─ Alfalipoproteinemias (distúrbios do HDL) ─────────────────────────────
{ sub:'Lípides', privado:true, titulo:'', ano:'2026', url:'',
  tema:'Alfalipoproteinemias (Distúrbios do HDL)', fonte:FONTE,
  resumo:`## Conceito
Distúrbios do **HDL** (a "alfalipoproteína"), com **HDL baixo (hipoalfalipoproteinemia)** ou **HDL alto (hiperalfalipoproteinemia)**. O HDL faz o **transporte reverso do colesterol**. ⚠️ O HDL é um **marcador de risco**, mas elevá-lo farmacologicamente **não** reduziu eventos — foco no LDL/apoB e nos fatores de base.

## HDL baixo (hipoalfa)
- **Secundário (comum):** obesidade/resistência à insulina, **triglicérides altos** (o HDL cai quando o TG sobe), tabagismo, sedentarismo, dieta, fármacos (esteroides anabolizantes, betabloqueador), diabetes.
- **Genético (raro):** **doença de Tangier** (defeito de **ABCA1** → HDL quase ausente, **amígdalas alaranjadas**, hepatoesplenomegalia, neuropatia), **deficiência de apoA-I**, **deficiência de LCAT** (peixe-olho/opacidade corneana, anemia, doença renal). Aumentam (variavelmente) o risco cardiovascular.

## HDL alto (hiperalfa)
- Geralmente **benigno** (exercício, estrogênio, álcool moderado). **Genético:** **deficiência de CETP** (HDL muito alto — a CETP normalmente transfere colesterol do HDL para partículas apoB). Nem sempre protetor; HDL **muito** alto/disfuncional pode até associar-se a risco.

## Diagnóstico e conduta
- Perfil lipídico; se HDL extremamente baixo/alto **sem** causa secundária → suspeitar de forma genética (achados físicos ajudam: amígdalas alaranjadas, opacidade corneana).
- **Não há tratamento farmacológico para "subir o HDL" com benefício comprovado.** Conduta: **estilo de vida** (exercício, cessar tabaco, perder peso), **controlar triglicérides e diabetes**, e **tratar o risco cardiovascular pelo LDL/apoB** (estatina conforme risco). Formas genéticas: manejo especializado e do risco global.

## 📊 Distúrbios do HDL
| Distúrbio | Defeito | Achado | Observação |
| --- | --- | --- | --- |
| Doença de Tangier | ABCA1 | HDL quase ausente, amígdalas alaranjadas | Neuropatia, hepatoesplenomegalia |
| Deficiência de LCAT | LCAT | Opacidade corneana, anemia, nefropatia | Colesterol não esterificado |
| Deficiência de apoA-I | APOA1 | HDL muito baixo | Aterosclerose precoce |
| Deficiência de CETP | CETP | HDL muito alto | Benefício não definido |`,
  pts:[
    'Alfalipoproteinemias são distúrbios do HDL, com HDL baixo (hipoalfa) ou alto (hiperalfa).',
    'O HDL realiza o transporte reverso do colesterol e é um marcador de risco.',
    'Elevar o HDL farmacologicamente não reduziu eventos — o foco terapêutico é o LDL/apoB e os fatores de base.',
    'HDL baixo é mais comumente secundário: obesidade, resistência insulínica, triglicérides altos, tabagismo.',
    'Quando os triglicérides sobem, o HDL tende a cair (relação inversa).',
    'Doença de Tangier (defeito de ABCA1): HDL quase ausente, amígdalas alaranjadas, neuropatia, hepatoesplenomegalia.',
    'Deficiência de LCAT: opacidade corneana (peixe-olho), anemia e doença renal.',
    'Deficiência de apoA-I cursa com HDL muito baixo e aterosclerose precoce.',
    'HDL alto costuma ser benigno; a deficiência de CETP eleva muito o HDL, com benefício não definido.',
    'Conduta: estilo de vida, controlar triglicérides e diabetes e tratar o risco cardiovascular pelo LDL.'
  ],
  mapa:{ central:'Distúrbios do HDL',
    nodes:[
      { label:'HDL baixo (hipoalfa)', children:[
        {label:'Secundário', children:['Obesidade/resistência','TG altos, tabagismo']},
        {label:'Genético', children:['Tangier (ABCA1)','Deficiência de LCAT','Deficiência de apoA-I']} ]},
      { label:'HDL alto (hiperalfa)', children:[
        {label:'Benigno (exercício, estrogênio)'},
        {label:'Deficiência de CETP', children:['HDL muito alto','Benefício incerto']} ]},
      { label:'Conceito-chave', children:[
        {label:'HDL = marcador'},
        {label:'Subir HDL não reduz eventos'},
        {label:'Foco no LDL/apoB'} ]},
      { label:'Conduta', children:[
        {label:'Estilo de vida'},
        {label:'Controlar TG/diabetes'},
        {label:'Tratar risco pelo LDL'} ]}
    ]},
  flashcards:[
    {q:'Por que não se trata o HDL baixo com fármacos para "elevá-lo"?',a:'Porque os ensaios clínicos que aumentaram farmacologicamente o HDL não reduziram eventos cardiovasculares; o HDL é um marcador de risco, e o tratamento eficaz foca em reduzir o LDL/apoB e controlar os fatores de base (triglicérides, peso, tabagismo, diabetes).'},
    {q:'Quais os achados da doença de Tangier?',a:'Defeito no transportador ABCA1 com HDL quase ausente, amígdalas aumentadas e alaranjadas (por depósito de ésteres de colesterol), hepatoesplenomegalia e neuropatia periférica.'},
    {q:'Qual a causa mais comum de HDL baixo na prática?',a:'As causas secundárias — obesidade e resistência à insulina, triglicérides elevados (relação inversa com o HDL), tabagismo, sedentarismo e certos fármacos —, e não os defeitos genéticos, que são raros.'},
    {q:'O que causa a deficiência de LCAT e como se manifesta?',a:'A deficiência da lecitina-colesterol-aciltransferase, que esterifica o colesterol no HDL; manifesta-se com opacidade corneana ("olho de peixe"), anemia hemolítica e doença renal, com acúmulo de colesterol não esterificado.'},
    {q:'O HDL muito alto (por exemplo, na deficiência de CETP) é sempre protetor?',a:'Não; embora o HDL alto costume ser benigno, a elevação extrema ou de HDL disfuncional nem sempre confere proteção e, em alguns casos, pode associar-se a risco — reforçando que a conduta se baseia no risco global e no LDL/apoB.'}
  ],
  fluxogramas:[{ titulo:'Abordagem dos distúrbios do HDL', fonte:'Síntese Endodirect (didático/baseado em revisões)', nos:[
    {tipo:'inicio', texto:'HDL alterado no perfil lipídico → interpretar no contexto (não é alvo terapêutico isolado)'},
    {tipo:'decisao', texto:'HDL baixo?', ramos:[
      {rotulo:'SIM', tipo:'acao', texto:'Rastrear causas secundárias (TG, obesidade, diabetes, tabagismo, fármacos) e otimizar estilo de vida'},
      {rotulo:'NÃO (HDL alto)', tipo:'acao', texto:'Geralmente benigno; se muito alto sem causa, considerar deficiência de CETP'} ]},
    {tipo:'decisao', texto:'HDL extremamente baixo com achados físicos (amígdalas alaranjadas, opacidade corneana)?', ramos:[
      {rotulo:'SIM', tipo:'fim', texto:'Suspeitar de forma genética (Tangier, LCAT, apoA-I) → avaliação especializada'},
      {rotulo:'NÃO', tipo:'fim', texto:'Tratar o risco cardiovascular pelo LDL/apoB (estatina conforme risco)'} ]}
  ]}]
}
];

// ── SQL (2 lotes) ──
const fs=require('fs');
function mkSql(arr){const j=JSON.stringify(arr);if(j.indexOf('$j$')>=0)throw new Error('$j$');return `UPDATE endodirect_global_state\nSET payload = jsonb_set(payload, '{diretrizes}', coalesce(payload->'diretrizes','[]'::jsonb) || $j$${j}$j$::jsonb)\nWHERE payload ? 'diretrizes';`;}
const b1=R.slice(0,3), b2=R.slice(3);
fs.writeFileSync(__dirname+'/lip1.sql', mkSql(b1));
fs.writeFileSync(__dirname+'/lip2.sql', mkSql(b2));
// sanity: tabelas sem célula vazia
R.forEach(r=>{ (r.resumo.split('\n').filter(l=>l.trim().startsWith('|'))).forEach(l=>{ l.split('|').slice(1,-1).forEach(c=>{ if(c.trim()==='')throw new Error('célula vazia em '+r.tema); }); }); });
console.log('Lípides:', R.length, 'resumos | lotes', b1.length+'+'+b2.length);
R.forEach((r,i)=>console.log('  '+(i+1)+'.', r.tema, '[pts '+r.pts.length+' fc '+r.flashcards.length+' flux '+r.fluxogramas.length+']'));
