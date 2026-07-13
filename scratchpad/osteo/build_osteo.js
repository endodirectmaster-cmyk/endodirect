// Resumos de Osteometabolismo (privados) — síntese própria (não reproduz
// livros); cobertura Vilar 8ed/Williams + consensos Endocrine Society/IOF/AACE/
// workshops de hiperpara e hipopara. Cada um: resumo md (com tabela) + pts +
// mapa 3 níveis + flashcards + fluxograma. fonte distinta → chave nova (sem clobber).
const FONTE='Síntese Endodirect · Vilar 8ed + Williams + Endocrine Society/IOF/AACE';
const R=[
// 1 ─ Osteoporose ──────────────────────────────────────────────────────────
{ sub:'Osteometabolismo', privado:true, titulo:'', ano:'2026', url:'',
  tema:'Osteoporose: Diagnóstico e Tratamento', fonte:FONTE,
  resumo:`## Conceito e diagnóstico
Doença esquelética sistêmica com **↓massa óssea** e deterioração da microarquitetura → **fragilidade** e **fraturas**. Diagnóstico por **um** dos critérios:
- **Densitometria (DXA):** **T-score ≤ −2,5** em coluna, colo do fêmur ou fêmur total (em mulheres pós-menopausa/homens ≥ 50 anos). *Osteopenia:* T entre −1,0 e −2,5. Em pré-menopausa/jovens usar **Z-score** (≤ −2,0 = "abaixo do esperado").
- **Fratura por fragilidade** (quadril ou vértebra) **independentemente do T-score**; fratura de outros sítios com osteopenia.

## Avaliação
- **Rastrear causas secundárias**: hiperpara, hipertireoidismo, Cushing, hipogonadismo, mieloma, doença celíaca, deficiência de vitamina D, corticoide. Exames: cálcio, PTH, 25-OH-vitamina D, TSH, função renal/hepática, eletroforese se indicado.
- **FRAX** estima o risco de fratura em 10 anos (ajuda a decidir tratar osteopenia).

## Tratamento
- **Medidas gerais:** **cálcio + vitamina D**, exercício com carga, cessar tabaco/álcool, prevenir quedas.
- **Antirreabsortivos (1ª linha):** **bisfosfonatos** (alendronato, risedronato, zoledronato) e **denosumabe**. ⚠️ **Não interromper denosumabe sem terapia sequencial** (efeito rebote → fraturas vertebrais múltiplas).
- **Anabólicos** (alto risco/fratura grave): **teriparatida/abaloparatida** (análogos do PTH), **romosozumabe**; seguir com antirreabsortivo.
- Considerar cálcio/vitamina D adequados e **avaliar duração/"drug holiday"** dos bisfosfonatos (raras osteonecrose de mandíbula e fratura atípica de fêmur).

## 📊 Interpretação da densitometria (DXA)
| Categoria | T-score |
| --- | --- |
| Normal | ≥ −1,0 |
| Osteopenia (baixa massa óssea) | Entre −1,0 e −2,5 |
| Osteoporose | ≤ −2,5 |
| Osteoporose estabelecida | ≤ −2,5 + fratura por fragilidade |`,
  pts:[
    'Osteoporose reduz a massa óssea e deteriora a microarquitetura, aumentando o risco de fratura.',
    'Diagnóstico por T-score ≤ −2,5 (DXA) em coluna, colo ou fêmur total, ou por fratura de fragilidade.',
    'Fratura de quadril ou vértebra por fragilidade define osteoporose independentemente do T-score.',
    'Em jovens/pré-menopausa usa-se o Z-score (≤ −2,0 = abaixo do esperado), não o T-score.',
    'Sempre rastrear causas secundárias (hiperpara, tireoide, Cushing, celíaca, mieloma, vitamina D).',
    'O FRAX estima o risco de fratura em 10 anos e ajuda a decidir tratar a osteopenia.',
    'Medidas gerais: cálcio e vitamina D, exercício com carga, parar tabaco/álcool, prevenir quedas.',
    'Primeira linha: antirreabsortivos (bisfosfonatos e denosumabe).',
    'Não suspender denosumabe sem terapia sequencial pelo risco de rebote com fraturas vertebrais.',
    'Alto risco: anabólicos (teriparatida/abaloparatida, romosozumabe) seguidos de antirreabsortivo.'
  ],
  mapa:{ central:'Osteoporose',
    nodes:[
      { label:'Diagnóstico', children:[
        {label:'DXA T ≤ −2,5'},
        {label:'Fratura de fragilidade', children:['Quadril/vértebra']},
        {label:'Z-score em jovens'} ]},
      { label:'Avaliação', children:[
        {label:'Causas secundárias', children:['Cálcio, PTH, vitamina D','TSH, Cushing, mieloma']},
        {label:'FRAX (risco 10 anos)'} ]},
      { label:'Tratamento', children:[
        {label:'Gerais', children:['Cálcio + vitamina D','Exercício, quedas']},
        {label:'Antirreabsortivo (1ª)', children:['Bisfosfonato','Denosumabe (não parar sem seguir)']},
        {label:'Anabólico (alto risco)', children:['Teriparatida','Romosozumabe']} ]}
    ]},
  flashcards:[
    {q:'Quais os critérios diagnósticos de osteoporose?',a:'T-score ≤ −2,5 na densitometria (coluna, colo do fêmur ou fêmur total) em mulheres pós-menopausa/homens ≥ 50 anos, OU a ocorrência de fratura por fragilidade (especialmente quadril ou vértebra) independentemente do T-score.'},
    {q:'Por que não se deve suspender o denosumabe sem terapia sequencial?',a:'Porque sua interrupção provoca um efeito rebote com rápida perda óssea e risco de fraturas vertebrais múltiplas; ao descontinuar, deve-se emendar com um bisfosfonato.'},
    {q:'Quando se usa o Z-score em vez do T-score?',a:'Em mulheres na pré-menopausa, homens com menos de 50 anos e crianças; um Z-score ≤ −2,0 indica massa óssea abaixo do esperado para a idade, e o diagnóstico não se baseia apenas na densitometria.'},
    {q:'Qual a primeira linha de tratamento farmacológico da osteoporose?',a:'Os antirreabsortivos — bisfosfonatos (alendronato, risedronato, zoledronato) e denosumabe —, associados a cálcio e vitamina D adequados.'},
    {q:'Quando indicar terapia anabólica na osteoporose?',a:'Em pacientes de muito alto risco ou com fraturas graves/múltiplas, usando teriparatida, abaloparatida ou romosozumabe, sempre seguidos de um antirreabsortivo para manter o ganho ósseo.'}
  ],
  fluxogramas:[{ titulo:'Abordagem da osteoporose', fonte:'Síntese Endodirect (baseado em AACE/IOF)', nos:[
    {tipo:'inicio', texto:'Risco (idade, fratura prévia, DXA solicitada) → densitometria + investigar causas secundárias'},
    {tipo:'decisao', texto:'T-score ≤ −2,5 ou fratura por fragilidade (quadril/vértebra)?', ramos:[
      {rotulo:'SIM', tipo:'acao', texto:'Osteoporose → tratar (cálcio/vitamina D + fármaco)'},
      {rotulo:'NÃO (osteopenia)', tipo:'decisao', texto:'FRAX de alto risco?', ramos:[
        {rotulo:'SIM', tipo:'acao', texto:'Tratar como osteoporose'},
        {rotulo:'NÃO', tipo:'fim', texto:'Medidas gerais e reavaliação periódica'} ]} ]},
    {tipo:'decisao', texto:'Muito alto risco / fratura grave?', ramos:[
      {rotulo:'SIM', tipo:'fim', texto:'Anabólico (teriparatida/romosozumabe) → seguir com antirreabsortivo'},
      {rotulo:'NÃO', tipo:'fim', texto:'Antirreabsortivo (bisfosfonato/denosumabe); reavaliar duração'} ]}
  ]}]
},
// 2 ─ Hiperparatireoidismo primário ────────────────────────────────────────
{ sub:'Osteometabolismo', privado:true, titulo:'', ano:'2026', url:'',
  tema:'Hiperparatireoidismo Primário', fonte:FONTE,
  resumo:`## Conceito
Secreção **autônoma e excessiva de PTH** → **hipercalcemia**. Causa mais comum de hipercalcemia no **ambulatório**. Etiologia: **adenoma único de paratireoide (~80–85%)**, hiperplasia das 4 glândulas (associada a **NEM 1 e NEM 2A**), raramente carcinoma de paratireoide.

## Quadro clínico
Hoje a maioria é **assintomática** (achado de hipercalcemia). Quando sintomático: **"ossos, cálculos, gemidos e transtornos psíquicos"** — osteíte fibrosa cística/osteoporose, **nefrolitíase/nefrocalcinose**, dor abdominal/constipação/úlcera/pancreatite, fadiga/depressão. **Poliúria** e desidratação na hipercalcemia significativa.

## Diagnóstico
- **Cálcio elevado com PTH inapropriadamente normal ou alto** (chave!). Confirmar com **cálcio iônico**, corrigir para albumina.
- **Excluir hipercalcemia hipocalciúrica familiar (HHF):** **calciúria 24h** (baixa na HHF) e **relação clearance cálcio/creatinina < 0,01** sugere HHF (contraindica cirurgia).
- Avaliar repercussão: **25-OH-vitamina D** (repor se baixa), **função renal**, **DXA** (predomínio em osso cortical — 1/3 do rádio), **imagem renal** (litíase). Localização (cintilografia sestamibi/US) **só após** indicação cirúrgica.

## Tratamento
- **Paratireoidectomia** é o único tratamento curativo. **Indicações de cirurgia:** cálcio > 1 mg/dL acima do limite; **< 50 anos**; osteoporose (T ≤ −2,5) ou fratura vertebral; **TFG < 60**, cálculo/nefrocalcinose ou **calciúria > 400 mg/24h**.
- **Não operados:** monitorar (cálcio, função renal, DXA), hidratação, evitar tiazídicos/lítio, repor vitamina D com cautela; **cinacalcete** baixa o cálcio; antirreabsortivo para o osso.

## 📊 Hiperpara primário × HHF
| Aspecto | Hiperpara primário | HHF (benigna) |
| --- | --- | --- |
| Cálcio | Alto | Alto |
| PTH | Normal/alto | Normal/levemente alto |
| Calciúria 24h | Normal/alta | Baixa |
| Clearance Ca/Cr | > 0,02 | < 0,01 |
| Conduta | Cirurgia se indicada | Não operar |`,
  pts:[
    'Hiperparatireoidismo primário é a secreção autônoma de PTH causando hipercalcemia.',
    'É a causa mais comum de hipercalcemia no ambulatório; adenoma único responde por ~80–85%.',
    'Hiperplasia das quatro glândulas associa-se a NEM 1 e NEM 2A.',
    'Hoje a maioria é assintomática; sintomas clássicos: ossos, cálculos, gemidos e transtornos psíquicos.',
    'Chave diagnóstica: cálcio elevado com PTH inapropriadamente normal ou alto.',
    'Sempre excluir hipercalcemia hipocalciúrica familiar (calciúria baixa, clearance Ca/Cr < 0,01).',
    'Avaliar repercussão: vitamina D, função renal, DXA (osso cortical, rádio) e imagem renal.',
    'Localização (sestamibi/US) só após a decisão de operar.',
    'Paratireoidectomia é o único tratamento curativo; há critérios objetivos de indicação cirúrgica.',
    'Não operados: monitorar, hidratar, evitar tiazídico/lítio; cinacalcete baixa o cálcio.'
  ],
  mapa:{ central:'Hiperpara primário',
    nodes:[
      { label:'Causas', children:[
        {label:'Adenoma único (~80–85%)'},
        {label:'Hiperplasia', children:['NEM 1','NEM 2A']},
        {label:'Carcinoma (raro)'} ]},
      { label:'Diagnóstico', children:[
        {label:'Cálcio↑ + PTH não suprimido'},
        {label:'Excluir HHF', children:['Calciúria 24h','Clearance Ca/Cr < 0,01']},
        {label:'Repercussão', children:['DXA (rádio)','Renal, vitamina D']} ]},
      { label:'Tratamento', children:[
        {label:'Paratireoidectomia (cura)', children:['Critérios objetivos']},
        {label:'Não operar', children:['Monitorar','Cinacalcete','Evitar tiazídico/lítio']} ]}
    ]},
  flashcards:[
    {q:'Qual o achado laboratorial que define o hiperparatireoidismo primário?',a:'Hipercalcemia com PTH inapropriadamente normal ou elevado — em condições normais a hipercalcemia deveria suprimir o PTH, e a ausência dessa supressão indica secreção autônoma.'},
    {q:'Como diferenciar o hiperpara primário da hipercalcemia hipocalciúrica familiar (HHF)?',a:'Pela calciúria: na HHF a excreção urinária de cálcio é baixa e a relação clearance cálcio/creatinina fica abaixo de 0,01, enquanto no hiperpara primário a calciúria é normal ou alta; reconhecer a HHF é essencial porque não se opera.'},
    {q:'Quais as principais indicações de paratireoidectomia no hiperpara primário assintomático?',a:'Cálcio mais de 1 mg/dL acima do limite superior, idade abaixo de 50 anos, osteoporose (T ≤ −2,5) ou fratura vertebral, TFG < 60 mL/min, nefrolitíase/nefrocalcinose ou calciúria acima de 400 mg/24h.'},
    {q:'Em que sítio ósseo o hiperpara primário predomina na densitometria e por quê?',a:'No osso cortical, avaliado no terço distal do rádio, porque o excesso de PTH atua preferencialmente sobre o osso cortical.'},
    {q:'Quando se solicita a cintilografia com sestamibi no hiperpara primário?',a:'Somente após a indicação cirúrgica, para localizar o adenoma e planejar a abordagem (por exemplo, paratireoidectomia minimamente invasiva) — não é exame diagnóstico da doença.'}
  ],
  fluxogramas:[{ titulo:'Investigação do hiperparatireoidismo primário', fonte:'Síntese Endodirect (baseado no Workshop Internacional)', nos:[
    {tipo:'inicio', texto:'Hipercalcemia → dosar PTH, cálcio iônico e corrigir por albumina'},
    {tipo:'decisao', texto:'PTH inapropriadamente normal/alto (PTH-dependente)?', ramos:[
      {rotulo:'NÃO (PTH suprimido)', tipo:'fim', texto:'Hipercalcemia PTH-independente → investigar malignidade/outras causas'},
      {rotulo:'SIM', tipo:'acao', texto:'Calciúria 24h e clearance Ca/Cr para excluir HHF'} ]},
    {tipo:'decisao', texto:'Calciúria baixa e clearance Ca/Cr < 0,01 (HHF)?', ramos:[
      {rotulo:'SIM', tipo:'fim', texto:'HHF → não operar; orientar'},
      {rotulo:'NÃO', tipo:'acao', texto:'Hiperpara primário confirmado → avaliar critérios cirúrgicos'} ]},
    {tipo:'decisao', texto:'Preenche critério de cirurgia?', ramos:[
      {rotulo:'SIM', tipo:'fim', texto:'Localizar (sestamibi/US) → paratireoidectomia'},
      {rotulo:'NÃO', tipo:'fim', texto:'Monitorar; cinacalcete/antirreabsortivo conforme necessidade'} ]}
  ]}]
},
// 3 ─ Hipoparatireoidismo e hipocalcemia ───────────────────────────────────
{ sub:'Osteometabolismo', privado:true, titulo:'', ano:'2026', url:'',
  tema:'Hipoparatireoidismo e Hipocalcemia', fonte:FONTE,
  resumo:`## Conceito e causas
**Hipocalcemia** por deficiência ou resistência ao **PTH** (ou por vitamina D). **Hipoparatireoidismo**: PTH baixo/inapropriado com **cálcio baixo e fósforo alto**.
- **Causas de hipopara:** **pós-cirúrgica** (a mais comum — tireoidectomia/paratireoidectomia), autoimune (isolada ou **poliglandular tipo 1**), infiltrativa, hipomagnesemia (bloqueia secreção/ação do PTH), agenesia (**DiGeorge**), pós-radiação.
- **Outras hipocalcemias:** deficiência de vitamina D (PTH **alto** compensatório), doença renal crônica, **pseudo-hipoparatireoidismo** (resistência ao PTH → PTH alto), pancreatite, sepse, fármacos.

## Quadro clínico
Depende da rapidez. **Neuromuscular:** parestesias periorais/extremidades, **cãibras**, **tetania**, **sinais de Chvostek e Trousseau**, **laringoespasmo**, **convulsões**; **QT longo/arritmia**. Crônico: catarata, calcificação de núcleos da base, alterações dentárias.

## Diagnóstico
- **Cálcio (corrigido/iônico) baixo** + avaliar **PTH** (baixo/inapropriado = hipopara; alto = deficiência de vitamina D, DRC ou resistência), **fósforo**, **magnésio** (corrigir!), **25-OH-vitamina D**, função renal. ECG.

## Tratamento
- **Hipocalcemia aguda sintomática (tetania/convulsão/QT longo):** **gluconato de cálcio IV** com monitorização; **corrigir magnésio**.
- **Crônico (hipopara):** **cálcio oral + calcitriol** (vitamina D ativa, pois falta PTH para 1α-hidroxilar). Alvo: cálcio no **limite inferior** da normalidade (evitar hipercalciúria/nefrolitíase); monitorar calciúria. **PTH recombinante** em casos selecionados/refratários. Tiazídico pode reduzir a calciúria.

## 📊 Diferenciação da hipocalcemia pelo PTH e fósforo
| Condição | PTH | Fósforo | Pista |
| --- | --- | --- | --- |
| Hipoparatireoidismo | Baixo/inapropriado | Alto | Pós-cirúrgico frequente |
| Deficiência de vitamina D | Alto (secundário) | Baixo/normal | 25-OH-D baixa |
| Pseudo-hipoparatireoidismo | Alto | Alto | Resistência ao PTH |
| Hipomagnesemia | Baixo/normal | Variável | Corrigir o magnésio |`,
  pts:[
    'Hipoparatireoidismo cursa com cálcio baixo, fósforo alto e PTH baixo ou inapropriadamente normal.',
    'A causa mais comum de hipopara é a pós-cirúrgica (tireoidectomia/paratireoidectomia).',
    'A hipomagnesemia bloqueia a secreção e a ação do PTH e deve sempre ser corrigida.',
    'Deficiência de vitamina D causa hipocalcemia com PTH alto (secundário), não hipopara.',
    'Pseudo-hipoparatireoidismo é resistência ao PTH: cálcio baixo, fósforo alto e PTH alto.',
    'Clínica neuromuscular: parestesias, tetania, sinais de Chvostek e Trousseau, laringoespasmo, convulsão.',
    'A hipocalcemia pode alargar o QT e causar arritmias.',
    'Aguda sintomática: gluconato de cálcio intravenoso monitorado, corrigindo o magnésio.',
    'Crônica no hipopara: cálcio oral + calcitriol (vitamina D ativa), pois falta PTH para ativar a vitamina D.',
    'Alvo de cálcio no limite inferior para evitar hipercalciúria/nefrolitíase; monitorar a calciúria.'
  ],
  mapa:{ central:'Hipocalcemia / hipopara',
    nodes:[
      { label:'Causas', children:[
        {label:'Hipopara', children:['Pós-cirúrgico (+ comum)','Autoimune','Hipomagnesemia']},
        {label:'Vitamina D baixa (PTH↑)'},
        {label:'Pseudo-hipopara (resistência)'} ]},
      { label:'Clínica', children:[
        {label:'Tetania, cãibras, parestesia'},
        {label:'Chvostek / Trousseau'},
        {label:'Laringoespasmo, convulsão'},
        {label:'QT longo'} ]},
      { label:'Diagnóstico', children:['Cálcio iônico baixo','PTH (define causa)','Fósforo, magnésio','25-OH-vitamina D'] },
      { label:'Tratamento', children:[
        {label:'Aguda: gluconato de cálcio IV'},
        {label:'Corrigir magnésio'},
        {label:'Crônico', children:['Cálcio oral + calcitriol','Alvo no limite inferior','PTH recombinante']} ]}
    ]},
  flashcards:[
    {q:'Qual o perfil bioquímico típico do hipoparatireoidismo?',a:'Cálcio baixo, fósforo alto e PTH baixo ou inapropriadamente normal (deveria estar elevado diante da hipocalcemia).'},
    {q:'Qual a causa mais comum de hipoparatireoidismo?',a:'A pós-cirúrgica, sobretudo após tireoidectomia (ou paratireoidectomia), por remoção/lesão/desvascularização das paratireoides.'},
    {q:'Por que se usa calcitriol (e não vitamina D comum) no hipoparatireoidismo?',a:'Porque, sem PTH, a hidroxilação renal da vitamina D na posição 1α fica prejudicada; o calcitriol é a forma já ativa (1,25-di-hidroxivitamina D), dispensando essa ativação.'},
    {q:'Por que sempre avaliar o magnésio na hipocalcemia?',a:'Porque a hipomagnesemia inibe tanto a secreção quanto a ação periférica do PTH, causando hipocalcemia refratária que só corrige após a reposição de magnésio.'},
    {q:'Como se trata a hipocalcemia aguda sintomática?',a:'Com gluconato de cálcio intravenoso sob monitorização cardíaca (risco de arritmia), corrigindo simultaneamente a hipomagnesemia e iniciando cálcio oral + calcitriol para manutenção.'}
  ],
  fluxogramas:[{ titulo:'Investigação da hipocalcemia', fonte:'Síntese Endodirect (baseado em consenso de hipoparatireoidismo)', nos:[
    {tipo:'inicio', texto:'Hipocalcemia confirmada (cálcio corrigido/iônico) → dosar PTH, fósforo, magnésio e 25-OH-vitamina D; ECG'},
    {tipo:'decisao', texto:'Sintomas graves (tetania, convulsão, QT longo)?', ramos:[
      {rotulo:'SIM', tipo:'acao', texto:'Gluconato de cálcio IV monitorado + corrigir magnésio'},
      {rotulo:'NÃO', tipo:'acao', texto:'Definir a causa pelo PTH'} ]},
    {tipo:'decisao', texto:'PTH baixo/inapropriado (com fósforo alto)?', ramos:[
      {rotulo:'SIM', tipo:'fim', texto:'Hipoparatireoidismo → cálcio oral + calcitriol (alvo no limite inferior)'},
      {rotulo:'NÃO (PTH alto)', tipo:'fim', texto:'Deficiência de vitamina D, DRC ou resistência (pseudo-hipopara) → tratar a causa'} ]}
  ]}]
},
// 4 ─ Hipercalcemia ────────────────────────────────────────────────────────
{ sub:'Osteometabolismo', privado:true, titulo:'', ano:'2026', url:'',
  tema:'Hipercalcemia: Diagnóstico e Manejo', fonte:FONTE,
  resumo:`## Conceito e causas
**Cálcio sérico elevado** (confirmar com cálcio corrigido pela albumina ou **iônico**). Duas grandes categorias pelo **PTH**:
- **PTH-dependente (PTH alto/inapropriado):** **hiperparatireoidismo primário** (causa ambulatorial mais comum), terciário, **HHF**, lítio.
- **PTH-independente (PTH suprimido):** **malignidade** (causa mais comum em internados — **PTHrP** [tumores sólidos], metástases osteolíticas, mieloma, linfoma via calcitriol), intoxicação por **vitamina D/A**, **granulomatoses** (sarcoidose — calcitriol↑), hipertireoidismo, imobilização, **síndrome leite-álcali**, diuréticos tiazídicos.

## Quadro clínico
"**Ossos, cálculos, gemidos e transtornos psíquicos**": fadiga, fraqueza, **poliúria/polidipsia** e desidratação, náusea/constipação, **nefrolitíase**, confusão; **encurtamento do QT**. Gravidade e velocidade determinam sintomas (**crise hipercalcêmica** se cálcio muito alto).

## Diagnóstico
- **Cálcio (corrigido/iônico) + PTH** definem a via. PTH suprimido → dosar **PTHrP**, **25-OH e 1,25-vitamina D**, **eletroforese/cadeias leves** (mieloma), TSH, rastreio de neoplasia/imagem.

## Tratamento (hipercalcemia grave/sintomática)
1. **Hidratação com soro fisiológico** volumosa (restaura volume e aumenta a excreção renal de cálcio) — pilar inicial.
2. **Bisfosfonato IV** (zoledronato/pamidronato) — inibe reabsorção óssea (efeito em 2–4 dias); **denosumabe** se refratário/DRC.
3. **Calcitonina** (efeito rápido e transitório, para "ganhar tempo").
4. **Glicocorticoide** nas hipercalcemias por **calcitriol** (granuloma, linfoma, intoxicação por vitamina D).
5. Diálise em casos extremos/renais. Furosemida só após euvolemia (não de rotina). **Tratar a causa de base.**

## 📊 Via da hipercalcemia pelo PTH
| PTH | Categoria | Exemplos |
| --- | --- | --- |
| Alto/inapropriado | PTH-dependente | Hiperpara primário, HHF, lítio |
| Suprimido | Malignidade | PTHrP, metástase, mieloma |
| Suprimido | Vitamina D/granuloma | Sarcoidose, intoxicação por vitamina D |`,
  pts:[
    'Confirmar a hipercalcemia com cálcio corrigido pela albumina ou cálcio iônico.',
    'O PTH divide as causas: PTH-dependente (alto) e PTH-independente (suprimido).',
    'Hiperparatireoidismo primário é a causa ambulatorial mais comum de hipercalcemia.',
    'Malignidade é a causa mais comum em pacientes internados (PTHrP, metástases, mieloma).',
    'Granulomatoses (sarcoidose) e intoxicação por vitamina D elevam o calcitriol.',
    'Clínica: ossos, cálculos, gemidos e transtornos psíquicos; poliúria e encurtamento do QT.',
    'Investigação com PTH suprimido: PTHrP, vitamina D, eletroforese/cadeias leves e rastreio de neoplasia.',
    'O pilar inicial do tratamento é a hidratação vigorosa com soro fisiológico.',
    'Bisfosfonato IV inibe a reabsorção óssea; calcitonina age rápido mas transitoriamente.',
    'Glicocorticoide é útil nas hipercalcemias mediadas por calcitriol (granuloma, linfoma, vitamina D).'
  ],
  mapa:{ central:'Hipercalcemia',
    nodes:[
      { label:'PTH-dependente', children:[
        {label:'Hiperpara primário'},
        {label:'HHF'},
        {label:'Lítio'} ]},
      { label:'PTH-independente', children:[
        {label:'Malignidade', children:['PTHrP','Metástase/mieloma']},
        {label:'Vitamina D / granuloma', children:['Sarcoidose']},
        {label:'Hipertireoidismo, imobilização'} ]},
      { label:'Clínica', children:['Poliúria, desidratação','Constipação, náusea','Confusão','QT curto'] },
      { label:'Tratamento', children:[
        {label:'Soro fisiológico (pilar)'},
        {label:'Bisfosfonato IV'},
        {label:'Calcitonina (rápido)'},
        {label:'Corticoide (calcitriol)'},
        {label:'Tratar a causa'} ]}
    ]},
  flashcards:[
    {q:'Qual o primeiro passo para classificar uma hipercalcemia?',a:'Dosar o PTH junto ao cálcio (corrigido/iônico): PTH alto ou inapropriadamente normal indica causa PTH-dependente (hiperpara primário, HHF, lítio); PTH suprimido aponta para causas PTH-independentes, como malignidade e intoxicação por vitamina D.'},
    {q:'Qual a causa mais comum de hipercalcemia no paciente internado?',a:'A malignidade, seja por secreção de PTHrP (tumores sólidos), metástases osteolíticas ou produção de calcitriol/citocinas (mieloma, linfoma).'},
    {q:'Qual o pilar inicial do tratamento da hipercalcemia grave?',a:'A hidratação vigorosa com soro fisiológico, que corrige a desidratação e aumenta a excreção renal de cálcio; depois associam-se bisfosfonato intravenoso e, se necessário, calcitonina.'},
    {q:'Em que situações o glicocorticoide é especialmente útil na hipercalcemia?',a:'Nas hipercalcemias mediadas por excesso de calcitriol — doenças granulomatosas (sarcoidose), linfomas e intoxicação por vitamina D —, pois reduz a produção de 1,25-di-hidroxivitamina D.'},
    {q:'Por que a furosemida não é usada de rotina na hipercalcemia?',a:'Porque só deve ser considerada após a correção da volemia; usada precocemente, pode piorar a desidratação — o benefício calciúrico é modesto e não substitui a hidratação e os antirreabsortivos.'}
  ],
  fluxogramas:[{ titulo:'Abordagem da hipercalcemia', fonte:'Síntese Endodirect (baseado em revisões e consensos)', nos:[
    {tipo:'inicio', texto:'Hipercalcemia confirmada (cálcio corrigido/iônico) → dosar PTH'},
    {tipo:'decisao', texto:'PTH alto/inapropriado?', ramos:[
      {rotulo:'SIM', tipo:'fim', texto:'PTH-dependente → hiperpara primário, HHF ou lítio (avaliar cirurgia/causa)'},
      {rotulo:'NÃO (suprimido)', tipo:'acao', texto:'Investigar PTHrP, vitamina D, eletroforese e neoplasia'} ]},
    {tipo:'decisao', texto:'Hipercalcemia grave/sintomática?', ramos:[
      {rotulo:'SIM', tipo:'fim', texto:'Soro fisiológico + bisfosfonato IV (± calcitonina; corticoide se calcitriol) e tratar a causa'},
      {rotulo:'NÃO', tipo:'fim', texto:'Tratar a causa de base e monitorar'} ]}
  ]}]
},
// 5 ─ Deficiência e metabolismo da vitamina D ──────────────────────────────
{ sub:'Osteometabolismo', privado:true, titulo:'', ano:'2026', url:'',
  tema:'Deficiência e Metabolismo da Vitamina D', fonte:FONTE,
  resumo:`## Metabolismo
A **vitamina D** vem da pele (**colecalciferol/D3** por UVB) e da dieta (D2/D3). É hidroxilada no **fígado → 25-OH-vitamina D** (forma de estoque, **usada para avaliar o status**) e no **rim → 1,25-di-hidroxivitamina D (calcitriol)**, a forma ativa (estimulada por **PTH**; inibida por FGF23/fósforo). Ações: **absorção intestinal de cálcio e fósforo**, mineralização óssea, modulação do PTH.

## Status e causas de deficiência
- **Avaliar pela 25-OH-vitamina D.** Faixas usuais: **deficiência < 20 ng/mL**, insuficiência 20–29, suficiência ≥ 30 (variam por diretriz; rastreio direcionado a grupos de risco, não populacional).
- **Causas/risco:** baixa exposição solar/pele escura/idoso, **má absorção** (celíaca, bariátrica, colestase), obesidade (sequestro), doença hepática/renal, fármacos (anticonvulsivantes, glicocorticoide), baixa ingestão.

## Consequências e diagnóstico
- Deficiência → **↓cálcio/fósforo** → **hiperparatireoidismo secundário** (PTH↑) → desmineralização: **osteomalácia** no adulto e **raquitismo** na criança; agrava osteoporose e quedas.
- Laboratório típico: **25-OH-D baixa, PTH alto, cálcio normal/baixo, fósforo normal/baixo, FA↑**.

## Tratamento
- **Repor colecalciferol (D3)**: **ataque** (ex.: doses semanais altas por 6–8 semanas) e **manutenção** diária; garantir **cálcio** adequado. Ajustar dose em obesos/má absorção (doses maiores).
- Em **DRC** e **hipoparatireoidismo** usar **forma ativa (calcitriol/alfacalcidol)**, pois a 1α-hidroxilação está comprometida. Reavaliar a 25-OH-D após ~3 meses.

## 📊 Formas e usos da vitamina D
| Forma | Onde | Uso clínico |
| --- | --- | --- |
| 25-OH-vitamina D | Fígado | Medir o status (estoque) |
| 1,25-di-OH (calcitriol) | Rim | Forma ativa; repor em DRC/hipopara |
| Colecalciferol (D3) | Pele/dieta | Reposição habitual |`,
  pts:[
    'A vitamina D é hidroxilada no fígado (25-OH, forma de estoque) e no rim (calcitriol, forma ativa).',
    'O status é avaliado pela 25-OH-vitamina D, não pelo calcitriol.',
    'O calcitriol é estimulado pelo PTH e inibido por FGF23/fósforo; aumenta a absorção intestinal de cálcio.',
    'Deficiência costuma ser definida como 25-OH-D < 20 ng/mL (faixas variam por diretriz).',
    'Fatores de risco: pouca exposição solar, pele escura, idoso, má absorção, obesidade, fármacos.',
    'A deficiência gera hiperparatireoidismo secundário (PTH alto) e desmineralização óssea.',
    'No adulto causa osteomalácia; na criança, raquitismo; e agrava a osteoporose e as quedas.',
    'Laboratório típico: 25-OH-D baixa, PTH alto, cálcio/fósforo normais ou baixos, fosfatase alcalina alta.',
    'Reposição habitual com colecalciferol (D3), com dose de ataque e manutenção, garantindo cálcio.',
    'Em DRC e hipoparatireoidismo usa-se a forma ativa (calcitriol), pois falta a 1α-hidroxilação.'
  ],
  mapa:{ central:'Vitamina D',
    nodes:[
      { label:'Metabolismo', children:[
        {label:'Pele/dieta → D3'},
        {label:'Fígado → 25-OH (estoque)'},
        {label:'Rim → calcitriol (ativa)', children:['PTH estimula','FGF23 inibe']} ]},
      { label:'Deficiência', children:[
        {label:'Medir 25-OH-D'},
        {label:'Risco', children:['Sol/pele escura/idoso','Má absorção, obesidade']},
        {label:'Consequência', children:['PTH↑ (secundário)','Osteomalácia/raquitismo']} ]},
      { label:'Tratamento', children:[
        {label:'Colecalciferol (ataque + manutenção)'},
        {label:'Garantir cálcio'},
        {label:'Calcitriol em DRC/hipopara'},
        {label:'Reavaliar em ~3 meses'} ]}
    ]},
  flashcards:[
    {q:'Qual metabólito reflete o status corporal de vitamina D e por quê?',a:'A 25-hidroxivitamina D, porque é a forma de estoque, tem meia-vida longa e reflete tanto a produção cutânea quanto a ingestão; o calcitriol (1,25-di-OH) não serve para isso, pois é regulado e pode estar normal mesmo na deficiência.'},
    {q:'Que perfil laboratorial sugere deficiência de vitamina D?',a:'25-OH-vitamina D baixa com PTH elevado (hiperparatireoidismo secundário), cálcio e fósforo normais ou baixos e fosfatase alcalina elevada.'},
    {q:'Quando se deve usar a forma ativa da vitamina D (calcitriol) em vez do colecalciferol?',a:'Na doença renal crônica e no hipoparatireoidismo, situações em que a 1α-hidroxilação renal (dependente de rim e de PTH) está comprometida, exigindo a vitamina D já ativada.'},
    {q:'Quais grupos têm maior risco de deficiência de vitamina D?',a:'Idosos, pessoas de pele escura ou com baixa exposição solar, portadores de má absorção (doença celíaca, cirurgia bariátrica, colestase), obesos e usuários de anticonvulsivantes ou glicocorticoides.'},
    {q:'Como a deficiência de vitamina D leva à doença óssea?',a:'A menor absorção intestinal de cálcio e fósforo reduz o cálcio, estimulando o PTH (hiperparatireoidismo secundário) e a reabsorção óssea, o que prejudica a mineralização e causa osteomalácia no adulto e raquitismo na criança.'}
  ],
  fluxogramas:[{ titulo:'Avaliação e reposição da vitamina D', fonte:'Síntese Endodirect (baseado em Endocrine Society)', nos:[
    {tipo:'inicio', texto:'Grupo de risco ou doença óssea → dosar 25-OH-vitamina D (± cálcio, PTH, fósforo, FA)'},
    {tipo:'decisao', texto:'25-OH-vitamina D baixa (deficiência/insuficiência)?', ramos:[
      {rotulo:'NÃO', tipo:'fim', texto:'Status suficiente — manter ingestão adequada e reavaliar conforme risco'},
      {rotulo:'SIM', tipo:'acao', texto:'Repor vitamina D e garantir cálcio'} ]},
    {tipo:'decisao', texto:'DRC ou hipoparatireoidismo (falha na 1α-hidroxilação)?', ramos:[
      {rotulo:'SIM', tipo:'fim', texto:'Usar forma ativa (calcitriol/alfacalcidol)'},
      {rotulo:'NÃO', tipo:'fim', texto:'Colecalciferol (ataque + manutenção); reavaliar 25-OH-D em ~3 meses'} ]}
  ]}]
},
// 6 ─ Doença de Paget óssea ────────────────────────────────────────────────
{ sub:'Osteometabolismo', privado:true, titulo:'', ano:'2026', url:'',
  tema:'Doença de Paget Óssea', fonte:FONTE,
  resumo:`## Conceito
Distúrbio focal do **remodelamento ósseo**: fase **osteoclástica** (reabsorção aumentada e desorganizada) seguida de formação óssea **desorganizada** → osso **aumentado, mas frágil e deformado**. Acomete um (**monostótica**) ou vários ossos (**poliostótica**); sítios típicos: **pelve, crânio, fêmur, tíbia, vértebras**. Mais comum em idosos; componente genético (SQSTM1) e possível gatilho viral.

## Quadro clínico
Muitos **assintomáticos** (achado de **fosfatase alcalina elevada** ou alteração radiológica). Sintomas: **dor óssea**, **deformidades** (arqueamento de ossos longos, aumento do crânio), **fraturas**, artrose secundária. **Complicações por local:** crânio → **surdez** (compressão do VIII par), cefaleia; compressões neurológicas; **insuficiência cardíaca de alto débito** (doença extensa); raramente **degeneração sarcomatosa (osteossarcoma)**.

## Diagnóstico
- **Fosfatase alcalina (total e óssea) elevada** = principal marcador de atividade (**cálcio e fósforo normais**; cálcio pode subir com imobilização).
- **Radiografia** (lesões líticas/escleróticas, espessamento cortical, "osso soprado") e **cintilografia óssea** (mapeia a extensão/atividade). Correlação clínica.

## Tratamento
- **Bisfosfonatos** (o de escolha: **ácido zoledrônico IV** dose única, muito eficaz) — indicados quando **sintomático** ou em sítios de risco (crânio, próximo a articulações, ossos de carga) para prevenir complicações; normalizam a fosfatase alcalina.
- Analgesia, garantir **cálcio/vitamina D** (evitar hipocalcemia com bisfosfonato), reabilitação/ortopedia conforme deformidade/fratura. Seguir pela fosfatase alcalina.

## 📊 Achados-chave da doença de Paget
| Item | Achado |
| --- | --- |
| Marcador de atividade | Fosfatase alcalina elevada |
| Cálcio/fósforo | Normais (cálcio↑ se imobilizado) |
| Imagem | RX (osso espessado/deformado) + cintilografia |
| Complicação clássica | Surdez (acometimento do crânio) |
| Tratamento | Ácido zoledrônico IV (bisfosfonato) |`,
  pts:[
    'A doença de Paget é um distúrbio focal do remodelamento com osso aumentado, porém frágil e deformado.',
    'Tem fase osteoclástica (reabsorção) seguida de formação óssea desorganizada.',
    'Sítios típicos: pelve, crânio, fêmur, tíbia e vértebras; mais comum em idosos.',
    'Muitos são assintomáticos, descobertos por fosfatase alcalina elevada ou achado radiológico.',
    'Sintomas: dor óssea, deformidades, fraturas e artrose secundária.',
    'Acometimento do crânio pode causar surdez por compressão do VIII par; doença extensa pode dar ICC de alto débito.',
    'A fosfatase alcalina é o principal marcador de atividade; cálcio e fósforo costumam ser normais.',
    'Radiografia e cintilografia óssea definem lesões e extensão/atividade.',
    'O tratamento de escolha é o bisfosfonato, sobretudo ácido zoledrônico IV em dose única.',
    'Tratar quando sintomático ou em sítios de risco; garantir cálcio e vitamina D e seguir pela fosfatase alcalina.'
  ],
  mapa:{ central:'Doença de Paget',
    nodes:[
      { label:'Fisiopatologia', children:[
        {label:'Remodelamento focal desorganizado'},
        {label:'Osteoclástica → formação frágil'},
        {label:'Pelve, crânio, fêmur, tíbia'} ]},
      { label:'Clínica', children:[
        {label:'Assintomático (FA↑ / RX)'},
        {label:'Dor, deformidade, fratura'},
        {label:'Complicações', children:['Surdez (crânio)','ICC alto débito','Sarcoma (raro)']} ]},
      { label:'Diagnóstico', children:['Fosfatase alcalina (atividade)','Cálcio/fósforo normais','RX + cintilografia'] },
      { label:'Tratamento', children:[
        {label:'Bisfosfonato', children:['Zoledronato IV']},
        {label:'Cálcio/vitamina D'},
        {label:'Seguir pela FA'} ]}
    ]},
  flashcards:[
    {q:'Qual o principal marcador bioquímico de atividade da doença de Paget?',a:'A fosfatase alcalina (total e a fração óssea) elevada, que reflete a intensidade do remodelamento; cálcio e fósforo costumam ser normais.'},
    {q:'Qual complicação clássica decorre do acometimento do crânio na doença de Paget?',a:'A surdez, geralmente por compressão do oitavo par craniano (nervo vestibulococlear); podem ocorrer também cefaleia e outras compressões neurológicas.'},
    {q:'Qual o tratamento de escolha da doença de Paget?',a:'Os bisfosfonatos, com destaque para o ácido zoledrônico intravenoso em dose única, que é altamente eficaz e costuma normalizar a fosfatase alcalina.'},
    {q:'Quando indicar tratamento farmacológico na doença de Paget?',a:'Quando há sintomas (dor, complicações) ou envolvimento de sítios de risco — crânio, ossos próximos a articulações e ossos de carga — para prevenir deformidades, fraturas e complicações neurológicas.'},
    {q:'Quais exames de imagem são usados no diagnóstico e estadiamento da doença de Paget?',a:'A radiografia simples (mostra lesões líticas/escleróticas, espessamento cortical e deformidade) e a cintilografia óssea, que mapeia a extensão e a atividade das lesões.'}
  ],
  fluxogramas:[{ titulo:'Abordagem da doença de Paget óssea', fonte:'Síntese Endodirect (baseado em Endocrine Society)', nos:[
    {tipo:'inicio', texto:'Fosfatase alcalina elevada isolada ou achado radiológico/dor óssea → suspeitar de Paget'},
    {tipo:'acao', texto:'Confirmar com radiografia e cintilografia óssea; excluir outras causas de FA alta (hepática)'},
    {tipo:'decisao', texto:'Sintomático ou sítio de risco (crânio, carga, próximo a articulação)?', ramos:[
      {rotulo:'SIM', tipo:'fim', texto:'Bisfosfonato (ácido zoledrônico IV) + cálcio/vitamina D; seguir pela fosfatase alcalina'},
      {rotulo:'NÃO', tipo:'fim', texto:'Assintomático de baixo risco → monitorar (fosfatase alcalina) e analgesia se necessário'} ]}
  ]}]
},
// 7 ─ Osteomalácia e raquitismo ────────────────────────────────────────────
{ sub:'Osteometabolismo', privado:true, titulo:'', ano:'2026', url:'',
  tema:'Osteomalácia e Raquitismo', fonte:FONTE,
  resumo:`## Conceito
Defeito de **mineralização** da matriz óssea (osteoide) por deficiência de **vitamina D, cálcio ou fósforo**. **Raquitismo** = na **criança** (afeta também a placa de crescimento → deformidades); **osteomalácia** = no **adulto** (osso já formado). Diferente da osteoporose (esta é perda de massa com mineralização normal).

## Causas
- **Deficiência/alteração da vitamina D:** falta de sol/ingestão, **má absorção** (celíaca, bariátrica), doença hepática, **DRC** (falha de 1α-hidroxilação), raquitismos vitamina-D-dependentes (tipo 1: defeito da 1α-hidroxilase; tipo 2: resistência ao receptor).
- **Hipofosfatêmicas:** perda renal de fosfato — **raquitismo hipofosfatêmico ligado ao X** e **osteomalácia oncogênica** (tumor produtor de **FGF23**), acidose tubular renal, síndrome de Fanconi.

## Quadro e laboratório
Dor óssea difusa, **fraqueza muscular proximal**, marcha anserina, fraturas/**pseudofraturas (zonas de Looser)**. Criança: **alargamento de metáfises**, rosário raquítico, arqueamento de membros, atraso de crescimento.
- **Laboratório (por deficiência de vitamina D):** **cálcio baixo/normal, fósforo baixo, PTH alto, 25-OH-D baixa, fosfatase alcalina alta**. Nas hipofosfatêmicas: **fósforo baixo com vitamina D/cálcio normais** (avaliar FGF23, fosfatúria).

## Tratamento
- **Corrigir a causa:** repor **vitamina D + cálcio** na forma carencial; **forma ativa (calcitriol)** nos raquitismos vitamina-D-dependentes e na DRC.
- **Hipofosfatêmicas:** repor **fosfato + calcitriol**; no raquitismo hipofosfatêmico ligado ao X e na osteomalácia oncogênica, **burosumabe** (anti-FGF23); ressecar o tumor na oncogênica. Acompanhar cálcio, fósforo, PTH e fosfatase alcalina.

## 📊 Osteomalácia/raquitismo × osteoporose
| Aspecto | Osteomalácia / raquitismo | Osteoporose |
| --- | --- | --- |
| Defeito | Mineralização deficiente | Massa óssea reduzida |
| Fosfatase alcalina | Elevada | Normal |
| Cálcio/fósforo | Frequentemente baixos | Normais |
| Achado típico | Pseudofraturas (Looser) | Fratura por fragilidade |
| Base do tratamento | Vitamina D/cálcio ou fosfato | Antirreabsortivo/anabólico |`,
  pts:[
    'Osteomalácia e raquitismo são defeitos de mineralização da matriz óssea (osteoide).',
    'Raquitismo ocorre na criança (afeta a placa de crescimento); osteomalácia no adulto.',
    'Diferem da osteoporose, que é perda de massa óssea com mineralização normal.',
    'Causas principais: deficiência/alteração da vitamina D e perdas renais de fosfato.',
    'Osteomalácia oncogênica e o raquitismo ligado ao X decorrem de excesso de FGF23.',
    'Clínica: dor óssea, fraqueza proximal, pseudofraturas (zonas de Looser); na criança, deformidades.',
    'Laboratório carencial: cálcio baixo/normal, fósforo baixo, PTH alto, 25-OH-D baixa, fosfatase alcalina alta.',
    'Nas formas hipofosfatêmicas o fósforo é baixo com vitamina D e cálcio normais.',
    'Tratamento carencial: repor vitamina D e cálcio; forma ativa na DRC e nos raquitismos vitamina-D-dependentes.',
    'Formas hipofosfatêmicas: fosfato + calcitriol; burosumabe (anti-FGF23) no ligado ao X e na oncogênica.'
  ],
  mapa:{ central:'Osteomalácia / raquitismo',
    nodes:[
      { label:'Conceito', children:[
        {label:'Mineralização deficiente'},
        {label:'Criança = raquitismo'},
        {label:'Adulto = osteomalácia'} ]},
      { label:'Causas', children:[
        {label:'Vitamina D', children:['Carência/má absorção','DRC, vit-D-dependentes']},
        {label:'Hipofosfatêmicas', children:['Ligado ao X','Oncogênica (FGF23)']} ]},
      { label:'Clínica/lab', children:[
        {label:'Dor, fraqueza proximal'},
        {label:'Pseudofraturas (Looser)'},
        {label:'FA↑, fósforo↓, PTH↑ (carencial)'} ]},
      { label:'Tratamento', children:[
        {label:'Vitamina D + cálcio (carencial)'},
        {label:'Calcitriol (DRC/vit-D-dependente)'},
        {label:'Fosfato + calcitriol / burosumabe'} ]}
    ]},
  flashcards:[
    {q:'Qual a diferença essencial entre osteomalácia e osteoporose?',a:'Na osteomalácia há defeito de mineralização do osteoide (osso "mole", com fosfatase alcalina alta e frequentemente cálcio/fósforo baixos), enquanto na osteoporose a mineralização é normal e o problema é a redução da massa óssea, com bioquímica geralmente normal.'},
    {q:'O que são as zonas de Looser (pseudofraturas)?',a:'Faixas radiotransparentes perpendiculares à cortical do osso, típicas da osteomalácia, correspondendo a áreas de osteoide não mineralizado que simulam fraturas.'},
    {q:'Qual o perfil laboratorial da osteomalácia por deficiência de vitamina D?',a:'Cálcio baixo ou normal, fósforo baixo, PTH elevado (hiperparatireoidismo secundário), 25-OH-vitamina D baixa e fosfatase alcalina elevada.'},
    {q:'Qual o mecanismo da osteomalácia oncogênica e do raquitismo hipofosfatêmico ligado ao X?',a:'O excesso de FGF23, que aumenta a perda renal de fosfato e reduz o calcitriol, causando hipofosfatemia e defeito de mineralização; podem ser tratados com fosfato/calcitriol e com o anticorpo anti-FGF23 (burosumabe).'},
    {q:'Como se trata a osteomalácia/raquitismo carencial e quando usar a forma ativa da vitamina D?',a:'Repondo vitamina D (colecalciferol) e cálcio nas formas carenciais; a forma ativa (calcitriol) é indicada na doença renal crônica e nos raquitismos vitamina-D-dependentes, em que a 1α-hidroxilação está comprometida.'}
  ],
  fluxogramas:[{ titulo:'Investigação da osteomalácia/raquitismo', fonte:'Síntese Endodirect (baseado em revisões e consensos)', nos:[
    {tipo:'inicio', texto:'Dor óssea/fraqueza/pseudofraturas (adulto) ou deformidades/atraso (criança) → dosar cálcio, fósforo, FA, PTH, 25-OH-D'},
    {tipo:'decisao', texto:'25-OH-vitamina D baixa com PTH alto (padrão carencial)?', ramos:[
      {rotulo:'SIM', tipo:'fim', texto:'Osteomalácia/raquitismo por vitamina D → repor vitamina D + cálcio (calcitriol na DRC/vit-D-dependente)'},
      {rotulo:'NÃO', tipo:'acao', texto:'Fósforo baixo com vitamina D/cálcio normais → investigar perda renal de fosfato (FGF23)'} ]},
    {tipo:'fim', texto:'Forma hipofosfatêmica → fosfato + calcitriol; burosumabe (anti-FGF23) no ligado ao X/oncogênica; ressecar tumor na oncogênica'}
  ]}]
}
];

// ── SQL (2 lotes) ──
const fs=require('fs');
function mkSql(arr){const j=JSON.stringify(arr);if(j.indexOf('$j$')>=0)throw new Error('$j$');return `UPDATE endodirect_global_state\nSET payload = jsonb_set(payload, '{diretrizes}', coalesce(payload->'diretrizes','[]'::jsonb) || $j$${j}$j$::jsonb)\nWHERE payload ? 'diretrizes';`;}
const b1=R.slice(0,4), b2=R.slice(4);
fs.writeFileSync(__dirname+'/ost1.sql', mkSql(b1));
fs.writeFileSync(__dirname+'/ost2.sql', mkSql(b2));
// sanity: tabelas sem célula vazia
R.forEach(r=>{ (r.resumo.split('\n').filter(l=>l.trim().startsWith('|'))).forEach(l=>{ l.split('|').slice(1,-1).forEach(c=>{ if(c.trim()==='')throw new Error('célula vazia em '+r.tema); }); }); });
console.log('Osteo:', R.length, 'resumos | lotes', b1.length+'+'+b2.length);
R.forEach((r,i)=>console.log('  '+(i+1)+'.', r.tema, '[pts '+r.pts.length+' fc '+r.flashcards.length+' flux '+r.fluxogramas.length+']'));
