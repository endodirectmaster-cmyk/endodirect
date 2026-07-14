// Resumos de Diabetes (privados) — síntese própria (não reproduz livros);
// cobertura Vilar 8ed/Williams/Greenspan + ADA Standards of Care 2026 + SBD.
// Cada um: resumo md (com tabela) + 10 pts + mapa 3 níveis + 5 flashcards +
// fluxograma fiel ao algoritmo da diretriz. fonte distinta → chave de merge nova.
const FONTE='Síntese Endodirect · Vilar 8ed + Williams/Greenspan + ADA 2026/SBD';
const R=[

// 1 ─ Diagnóstico e classificação ───────────────────────────────────────────
{ sub:'Diabetes', privado:true, titulo:'', ano:'2026', url:'',
  tema:'Diagnóstico e Classificação do Diabetes', fonte:FONTE,
  resumo:`## Critérios diagnósticos (ADA 2026 / SBD)
Qualquer um confirma diabetes; **repetir o mesmo teste** (ou dois testes distintos alterados na mesma amostra) para confirmar, **exceto** hiperglicemia inequívoca com sintomas clássicos:
- **HbA1c ≥ 6,5%** (método padronizado/NGSP-DCCT).
- **Glicemia de jejum ≥ 126 mg/dL** (jejum ≥ 8 h).
- **Glicemia de 2 h ≥ 200 mg/dL** no TOTG com 75 g.
- **Glicemia aleatória ≥ 200 mg/dL** + sintomas clássicos (poliúria, polidipsia, perda de peso).

## Pré-diabetes (risco aumentado)
- **HbA1c 5,7–6,4%**; **glicemia de jejum alterada (GJA) 100–125 mg/dL**; **intolerância à glicose (ITG) 2 h 140–199 mg/dL**.

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
| 2 h TOTG (mg/dL) | < 140 | 140–199 | ≥ 200 |
| Aleatória + sintomas | — | — | ≥ 200 |`,
  pts:[
    'Diagnóstico de diabetes: HbA1c ≥ 6,5%, jejum ≥ 126, 2 h no TOTG ≥ 200 ou aleatória ≥ 200 com sintomas.',
    'Confirmar repetindo o teste, salvo hiperglicemia inequívoca com sintomas clássicos.',
    'Pré-diabetes: HbA1c 5,7–6,4%, jejum 100–125 (GJA) ou 2 h 140–199 (ITG).',
    'Rastrear todo adulto a partir dos 35 anos; mais cedo se sobrepeso/obesidade + fator de risco.',
    'Repetir o rastreamento a cada 3 anos se normal (antes se risco elevado).',
    'Tipo 1: destruição autoimune com deficiência absoluta de insulina (inclui LADA).',
    'Tipo 2: resistência à insulina + falência secretora; responde por ~90–95% dos casos.',
    'Diabetes gestacional é o diagnosticado na gravidez sem diabetes prévio franco.',
    'Tipos específicos: MODY, doença pancreática, endocrinopatias e fármaco-induzido.',
    'A HbA1c pode ser falseada por anemia, hemoglobinopatias, gravidez e uremia — usar glicemia nesses casos.'],
  mapa:{ central:'Diagnóstico e classificação', nodes:[
    {label:'Critérios', children:[
      {label:'HbA1c ≥ 6,5%'},{label:'Jejum ≥ 126'},
      {label:'2 h TOTG ≥ 200'},{label:'Aleatória ≥ 200 + sintomas'}]},
    {label:'Pré-diabetes', children:['HbA1c 5,7–6,4%','GJA 100–125','ITG 140–199']},
    {label:'Rastreamento', children:[
      {label:'≥ 35 anos (todos)'},
      {label:'Antes se sobrepeso + fator de risco'}]},
    {label:'Classificação', children:[
      {label:'Tipo 1 (autoimune / LADA)'},
      {label:'Tipo 2 (resistência)'},
      {label:'Gestacional'},
      {label:'Específicos',children:['MODY','Fármaco/pancreático']}]}]},
  flashcards:[
    {q:'Quais são os quatro critérios diagnósticos de diabetes?',a:'HbA1c ≥ 6,5%; glicemia de jejum ≥ 126 mg/dL; glicemia de 2 h ≥ 200 mg/dL no TOTG de 75 g; ou glicemia aleatória ≥ 200 mg/dL com sintomas clássicos. Confirmar com repetição, exceto hiperglicemia inequívoca sintomática.'},
    {q:'Como se define pré-diabetes?',a:'HbA1c entre 5,7 e 6,4%, glicemia de jejum alterada (100–125 mg/dL) ou intolerância à glicose (2 h de 140–199 mg/dL no TOTG).'},
    {q:'A partir de que idade se rastreia diabetes em adultos assintomáticos?',a:'A partir dos 35 anos em todos; mais cedo em quem tem sobrepeso ou obesidade associados a pelo menos um fator de risco (história familiar, HAS, dislipidemia, SOP, DCV, DMG prévio).'},
    {q:'Quando a HbA1c pode dar resultado falso e o que usar?',a:'Em anemias, hemoglobinopatias, gestação, hemólise e uremia a HbA1c é pouco confiável; nesses casos usa-se a glicemia (jejum ou TOTG) para diagnóstico.'},
    {q:'O que é o LADA e em que categoria se enquadra?',a:'É o diabetes autoimune latente do adulto — uma forma de diabetes tipo 1 de evolução lenta, com autoanticorpos positivos, que inicialmente se comporta como tipo 2 mas progride para dependência de insulina.'}],
  fluxogramas:[{ titulo:'Rastreamento e diagnóstico do diabetes', fonte:'Algoritmo baseado no ADA Standards of Care in Diabetes 2026 e nas Diretrizes SBD, adaptado ao português', nos:[
    {tipo:'inicio', texto:'Adulto ≥ 35 anos ou < 35 com sobrepeso + fator de risco → HbA1c e/ou glicemia de jejum (± TOTG)'},
    {tipo:'decisao', texto:'Algum critério de diabetes (A1c ≥ 6,5% / jejum ≥ 126 / 2 h ≥ 200 / aleatória ≥ 200 + sintomas)?', ramos:[
      {rotulo:'SIM', tipo:'acao', texto:'Confirmar (repetir teste) salvo hiperglicemia sintomática inequívoca → classificar (tipo 1/2/específico)'},
      {rotulo:'NÃO', tipo:'decisao', texto:'Faixa de pré-diabetes?', ramos:[
        {rotulo:'SIM', tipo:'fim', texto:'Pré-diabetes → estilo de vida ± metformina; reavaliar anualmente'},
        {rotulo:'NÃO', tipo:'fim', texto:'Normal → repetir rastreamento em 3 anos'} ]} ]},
    {tipo:'fim', texto:'Diabetes confirmado → iniciar tratamento e rastrear complicações'}
  ]}]
},

// 2 ─ DM tipo 1 e LADA ──────────────────────────────────────────────────────
{ sub:'Diabetes', privado:true, titulo:'', ano:'2026', url:'',
  tema:'Diabetes Tipo 1 e LADA', fonte:FONTE,
  resumo:`## Conceito
Destruição **autoimune** das células β (associação a HLA e a autoanticorpos) → **deficiência absoluta de insulina** e tendência à **cetose**. Pico na infância/adolescência, mas ocorre em qualquer idade.

## Estágios (história natural)
- **Estágio 1:** autoimunidade (≥ 2 autoanticorpos) + **normoglicemia**, assintomático.
- **Estágio 2:** autoanticorpos + **disglicemia** (pré-diabetes), assintomático.
- **Estágio 3:** hiperglicemia **clínica** (sintomas).
> Autoanticorpos: **anti-GAD, anti-IA2, anti-ZnT8, anti-insulina (IAA), ICA**.

## LADA (diabetes autoimune latente do adulto)
Adulto com **anti-GAD positivo**, que **não precisa de insulina nos primeiros 6 meses** e progride mais lentamente para insulinodependência. Suspeitar em "DM2" magro, sem síndrome metabólica, com controle que se deteriora rápido.

## Diagnóstico e diferenciação do DM2
- Clínica de **início rápido, cetose, magro, jovem**; confirmar com **autoanticorpos** e **peptídeo C baixo** (reserva secretora).
- **Peptídeo C** ajuda: baixo/indetectável = tipo 1; normal/alto = tipo 2.

## Tratamento
- **Insulinoterapia é obrigatória e vitalícia** — esquema **basal-bólus** (múltiplas doses) ou **bomba de infusão**, idealmente com **monitorização contínua (CGM)**.
- **Contagem de carboidratos**, educação e ajuste por glicemia/atividade.
- Rastrear **doenças autoimunes associadas** (tireoidite de Hashimoto, doença celíaca, insuficiência adrenal).
- LADA: iniciar insulina **precocemente** (preserva função β); evitar sulfonilureias.

## 📊 Tipo 1 × Tipo 2 (diferenciação)
| Característica | Tipo 1 / LADA | Tipo 2 |
| --- | --- | --- |
| Idade típica | Jovem (LADA: adulto) | Adulto/idoso |
| Peso | Normal/magro | Sobrepeso/obeso |
| Autoanticorpos | Presentes | Ausentes |
| Peptídeo C | Baixo | Normal/alto |
| Cetose | Frequente | Rara |
| Tratamento | Insulina obrigatória | Estilo de vida + orais/injetáveis |`,
  pts:[
    'DM1 é destruição autoimune da célula β com deficiência absoluta de insulina e tendência à cetose.',
    'A história natural tem 3 estágios: autoimunidade normoglicêmica, disglicemia e hiperglicemia clínica.',
    'Autoanticorpos: anti-GAD, anti-IA2, anti-ZnT8, anti-insulina e ICA.',
    'LADA é DM1 de evolução lenta no adulto, anti-GAD positivo, sem insulina nos primeiros 6 meses.',
    'Suspeitar de LADA em "DM2" magro, sem síndrome metabólica, com deterioração rápida do controle.',
    'Peptídeo C baixo aponta tipo 1; normal/alto aponta tipo 2.',
    'O tratamento do DM1 é insulina vitalícia em esquema basal-bólus ou bomba, idealmente com CGM.',
    'Contagem de carboidratos e educação são pilares do manejo.',
    'Rastrear autoimunidades associadas: tireoidite, doença celíaca e insuficiência adrenal.',
    'No LADA inicia-se insulina precocemente e evitam-se sulfonilureias.'],
  mapa:{ central:'DM tipo 1 e LADA', nodes:[
    {label:'Fisiopatologia', children:['Autoimune (HLA)','Deficiência absoluta de insulina','Cetose']},
    {label:'Estágios', children:['1: autoanticorpos + normoglicemia','2: disglicemia','3: hiperglicemia clínica']},
    {label:'LADA', children:['Adulto, anti-GAD+','Sem insulina 6 meses','Progressão lenta']},
    {label:'Diagnóstico', children:['Autoanticorpos','Peptídeo C baixo']},
    {label:'Tratamento', children:[
      {label:'Insulina basal-bólus / bomba'},
      {label:'CGM + contagem de carboidratos'},
      {label:'Rastrear autoimunidades'}]}]},
  flashcards:[
    {q:'Quais são os estágios da história natural do DM1?',a:'Estágio 1: dois ou mais autoanticorpos com normoglicemia (assintomático); estágio 2: autoanticorpos com disglicemia (assintomático); estágio 3: hiperglicemia clínica com sintomas.'},
    {q:'O que caracteriza o LADA e como diferi-lo do DM2?',a:'É diabetes autoimune do adulto, com anti-GAD positivo e progressão lenta, sem necessidade de insulina nos primeiros 6 meses; suspeita-se em adultos magros rotulados como DM2 mas sem síndrome metabólica e com piora rápida do controle.'},
    {q:'Como o peptídeo C ajuda a classificar o diabetes?',a:'Reflete a reserva secretora de insulina: valores baixos ou indetectáveis indicam tipo 1 (falência da célula β); valores normais ou altos indicam tipo 2.'},
    {q:'Qual o esquema de insulinização preferido no DM1?',a:'O esquema basal-bólus (insulina basal + bólus prandiais por contagem de carboidratos) ou a bomba de infusão contínua, idealmente com monitorização contínua de glicose (CGM).'},
    {q:'Quais autoimunidades rastrear no paciente com DM1?',a:'Tireoidite de Hashimoto (TSH/anti-TPO), doença celíaca (antitransglutaminase) e insuficiência adrenal autoimune, pela associação no espectro poliglandular.'}],
  fluxogramas:[{ titulo:'Diferenciação e manejo inicial do DM tipo 1 / LADA', fonte:'Algoritmo baseado no ADA Standards of Care 2026 e no consenso ISPAD/Immunology of Diabetes Society, adaptado ao português', nos:[
    {tipo:'inicio', texto:'Hiperglicemia → avaliar fenótipo (idade, peso, cetose) e dosar autoanticorpos + peptídeo C'},
    {tipo:'decisao', texto:'Autoanticorpos positivos (ex.: anti-GAD) e/ou peptídeo C baixo?', ramos:[
      {rotulo:'NÃO', tipo:'fim', texto:'DM2 provável → algoritmo de tratamento do DM2'},
      {rotulo:'SIM', tipo:'acao', texto:'Diabetes autoimune (tipo 1 / LADA) → iniciar insulina'} ]},
    {tipo:'decisao', texto:'Apresentação com cetose/cetoacidose?', ramos:[
      {rotulo:'SIM', tipo:'fim', texto:'Tratar CAD; depois basal-bólus + CGM + educação'},
      {rotulo:'NÃO (LADA)', tipo:'fim', texto:'Insulina precoce (preservar célula β); evitar sulfonilureia; rastrear autoimunidades' } ]}
  ]}]
},

// 3 ─ Tratamento do DM2 ─────────────────────────────────────────────────────
{ sub:'Diabetes', privado:true, titulo:'', ano:'2026', url:'',
  tema:'Tratamento do Diabetes Tipo 2 (ADA 2026 / SBD)', fonte:FONTE,
  resumo:`## Princípio central (abordagem centrada na pessoa)
O manejo do DM2 tem **dois eixos paralelos**: **(1) controle glicêmico** e **(2) proteção cardiorrenal e do peso** — decididos **simultaneamente**, não em sequência.

## Base
- **Estilo de vida** (dieta, atividade física, sono, cessação do tabagismo) e **educação** em todas as etapas.
- **Metformina** permanece agente de 1ª linha para a glicemia na maioria (barata, eficaz, segura), salvo contraindicação (TFG < 30).

## Proteção cardiorrenal (independe da HbA1c e da metformina)
Em quem tem — ou tem alto risco de — **doença aterosclerótica, insuficiência cardíaca ou doença renal crônica**, usar preferencialmente, **independentemente da meta de A1c ou do uso de metformina**:
- **Doença aterosclerótica / alto risco CV:** **GLP-1 RA** com benefício comprovado e/ou **SGLT2i**.
- **Insuficiência cardíaca (FE reduzida ou preservada):** **SGLT2i**.
- **Doença renal crônica (albuminúria/TFG reduzida):** **SGLT2i** (até TFG ~20); **finerenona** se albuminúria persistente sob IECA/BRA + SGLT2i; **GLP-1 RA** (semaglutida) também renoprotetor.

## Peso
Priorizar **agentes de alta eficácia em peso**: **GLP-1 RA (semaglutida)** e **agonista duplo GIP/GLP-1 (tirzepatida)**; considerar cirurgia metabólica em obesidade.

## Intensificação glicêmica
Se acima da meta, combinar por **eficácia** e comorbidades; **insulina** quando houver hiperglicemia acentuada, catabolismo (perda de peso, cetose) ou falha dos demais.

## 📊 Escolha do 2º agente conforme comorbidade dominante
| Comorbidade | Preferência | Observação |
| --- | --- | --- |
| Aterosclerose/alto risco CV | GLP-1 RA e/ou SGLT2i | Independe da A1c |
| Insuficiência cardíaca | SGLT2i | FE reduzida ou preservada |
| Doença renal crônica | SGLT2i (± finerenona) | GLP-1 RA também protege |
| Obesidade | GLP-1 RA / tirzepatida | Maior perda de peso |
| Custo/acesso | Sulfonilureia, pioglitazona | Menor proteção de órgão |`,
  pts:[
    'O manejo do DM2 tem dois eixos paralelos: controle glicêmico e proteção cardiorrenal/peso.',
    'Estilo de vida e educação acompanham todas as etapas do tratamento.',
    'Metformina segue como 1ª linha para a glicemia na maioria (contraindicada se TFG < 30).',
    'Com aterosclerose ou alto risco CV, preferir GLP-1 RA e/ou SGLT2i, independentemente da A1c.',
    'Na insuficiência cardíaca (FE reduzida ou preservada), usar SGLT2i.',
    'Na doença renal crônica, usar SGLT2i (até TFG ~20) e considerar finerenona.',
    'A proteção cardiorrenal independe do uso de metformina e da meta de A1c.',
    'Para peso, priorizar GLP-1 RA (semaglutida) e o agonista duplo tirzepatida.',
    'Insulina entra na hiperglicemia acentuada, catabolismo (perda de peso/cetose) ou falha dos demais.',
    'Combinar agentes por eficácia e comorbidades, de forma centrada na pessoa.'],
  mapa:{ central:'Tratamento do DM2', nodes:[
    {label:'Base', children:['Estilo de vida + educação','Metformina (1ª linha glicêmica)']},
    {label:'Proteção cardiorrenal (independe da A1c)', children:[
      {label:'Aterosclerose → GLP-1 RA / SGLT2i'},
      {label:'IC → SGLT2i'},
      {label:'DRC → SGLT2i ± finerenona'}]},
    {label:'Peso', children:['GLP-1 RA','Tirzepatida','Cirurgia metabólica']},
    {label:'Intensificação', children:[
      {label:'Combinar por eficácia'},
      {label:'Insulina se catabolismo/hiperglicemia acentuada'}]}]},
  flashcards:[
    {q:'Qual o princípio central do tratamento do DM2 nas diretrizes atuais?',a:'Uma abordagem centrada na pessoa com dois eixos paralelos e simultâneos: o controle glicêmico e a redução do risco cardiorrenal com manejo do peso — não se trata primeiro a glicemia e depois o resto.'},
    {q:'Quando usar SGLT2i ou GLP-1 RA independentemente da HbA1c?',a:'Quando há doença aterosclerótica, insuficiência cardíaca ou doença renal crônica (ou alto risco delas): esses agentes são indicados pela proteção de órgão, independentemente da meta de A1c e do uso de metformina.'},
    {q:'Qual agente preferir na insuficiência cardíaca associada ao DM2?',a:'Um inibidor de SGLT2, que reduz hospitalização e desfechos tanto na fração de ejeção reduzida quanto na preservada.'},
    {q:'Como se protege o rim no DM2 com doença renal crônica?',a:'Com inibidor de SGLT2 (eficaz até TFG em torno de 20), associado a IECA/BRA; acrescenta-se finerenona se persiste albuminúria, e o GLP-1 RA (semaglutida) também tem efeito renoprotetor.'},
    {q:'Quais agentes priorizar quando o controle do peso é objetivo importante?',a:'Os de maior eficácia sobre o peso: GLP-1 RA (como a semaglutida) e o agonista duplo GIP/GLP-1 (tirzepatida); a cirurgia metabólica é opção na obesidade.'}],
  fluxogramas:[{ titulo:'Algoritmo de tratamento do DM2', fonte:'Algoritmo baseado no ADA Standards of Care 2026 (abordagem centrada na pessoa) e nas Diretrizes SBD, adaptado ao português', nos:[
    {tipo:'inicio', texto:'DM2 confirmado → estilo de vida + educação; metformina se sem contraindicação'},
    {tipo:'decisao', texto:'Há doença aterosclerótica, insuficiência cardíaca ou doença renal crônica (ou alto risco)?', ramos:[
      {rotulo:'SIM', tipo:'acao', texto:'Adicionar GLP-1 RA e/ou SGLT2i pela proteção de órgão (independe da A1c) — SGLT2i se IC/DRC'},
      {rotulo:'NÃO', tipo:'acao', texto:'Escolher 2º agente por peso/hipoglicemia/custo (GLP-1 RA se obesidade)'} ]},
    {tipo:'decisao', texto:'HbA1c ainda acima da meta?', ramos:[
      {rotulo:'SIM', tipo:'fim', texto:'Combinar agentes por eficácia; insulina se catabolismo ou hiperglicemia acentuada'},
      {rotulo:'NÃO', tipo:'fim', texto:'Manter e monitorar; reavaliar comorbidades periodicamente'} ]}
  ]}]
},

// 4 ─ Insulinoterapia ───────────────────────────────────────────────────────
{ sub:'Diabetes', privado:true, titulo:'', ano:'2026', url:'',
  tema:'Insulinoterapia', fonte:FONTE,
  resumo:`## Tipos de insulina (perfil de ação)
- **Ultrarrápida/rápida (prandial/bólus):** análogos ultrarrápidos (lispro, asparte, glulisina) e regular — cobrem a refeição.
- **Intermediária:** NPH.
- **Basal (longa/ultralonga):** glargina, detemir, **degludeca** (mais estável, menor hipoglicemia noturna).
- **Pré-misturas:** combinações fixas basal + prandial.

## Quando iniciar
- **DM1:** sempre, desde o diagnóstico.
- **DM2:** hiperglicemia acentuada/sintomática (**A1c muito alta, glicemia ≥ 300**), **catabolismo** (perda de peso, cetose), gravidez, internação/estresse agudo, ou falha dos demais agentes.

## Esquemas
- **Basal simples** (adicionada aos orais no DM2): iniciar ~**10 U** ou 0,1–0,2 U/kg à noite; titular pela **glicemia de jejum**.
- **Basal-bólus** (fisiológico; padrão no DM1): basal + bólus prandiais (contagem de carboidratos) + correção.
- **Basal-plus:** basal + 1 bólus na maior refeição (transição no DM2).

## Titulação e segurança
- Ajustar a basal por **glicemia de jejum**; os bólus pela **glicemia pós-prandial**.
- **Hipoglicemia** é o principal efeito adverso; ganho de peso é comum.
- **Rotação dos locais** de aplicação previne **lipo-hipertrofia** (que altera a absorção).
- Ao intensificar insulina no DM2, **reavaliar sulfonilureia** (risco de hipoglicemia) e manter agentes com proteção de órgão (SGLT2i/GLP-1 RA).

## 📊 Perfil das insulinas
| Tipo | Exemplos | Papel |
| --- | --- | --- |
| Ultrarrápida | Lispro, asparte, glulisina | Bólus prandial |
| Rápida | Regular | Bólus / infusão IV |
| Intermediária | NPH | Basal (mais variável) |
| Longa/ultralonga | Glargina, detemir, degludeca | Basal estável |`,
  pts:[
    'Insulinas prandiais (bólus): análogos ultrarrápidos e regular; basais: glargina, detemir e degludeca.',
    'A degludeca é ultralonga e estável, com menor hipoglicemia noturna.',
    'No DM1 a insulina é iniciada desde o diagnóstico.',
    'No DM2 inicia-se insulina na hiperglicemia acentuada, catabolismo, gravidez ou falha dos demais.',
    'Basal simples: ~10 U ou 0,1–0,2 U/kg à noite, titulada pela glicemia de jejum.',
    'O esquema basal-bólus é o mais fisiológico e é padrão no DM1.',
    'A basal ajusta-se pela glicemia de jejum; os bólus pela glicemia pós-prandial.',
    'Hipoglicemia é o principal efeito adverso; ganho de peso é comum.',
    'A rotação dos locais de aplicação previne lipo-hipertrofia, que altera a absorção.',
    'Ao intensificar insulina no DM2, reavaliar a sulfonilureia e manter SGLT2i/GLP-1 RA.'],
  mapa:{ central:'Insulinoterapia', nodes:[
    {label:'Tipos', children:[
      {label:'Bólus',children:['Ultrarrápida','Regular']},
      {label:'Basal',children:['NPH','Glargina/detemir/degludeca']}]},
    {label:'Quando iniciar', children:[
      {label:'DM1: sempre'},
      {label:'DM2',children:['Hiperglicemia acentuada','Catabolismo/cetose','Gravidez / falha']}]},
    {label:'Esquemas', children:['Basal simples','Basal-plus','Basal-bólus (DM1)']},
    {label:'Segurança', children:['Titular pela glicemia','Hipoglicemia / peso','Rodízio (lipo-hipertrofia)']}]},
  flashcards:[
    {q:'Qual a diferença entre insulina basal e prandial (bólus)?',a:'A basal (NPH ou análogos de ação longa como glargina, detemir e degludeca) cobre a necessidade contínua entre refeições e à noite; a prandial/bólus (ultrarrápidas ou regular) cobre a elevação glicêmica das refeições.'},
    {q:'Quando iniciar insulina no DM2?',a:'Na hiperglicemia acentuada e sintomática (por exemplo, A1c muito alta ou glicemia ≥ 300), em estado catabólico (perda de peso, cetose), na gravidez, em internação/estresse agudo, ou quando os demais agentes falham.'},
    {q:'Como se titula a insulina basal?',a:'Ajustando a dose pela glicemia de jejum, aumentando gradualmente até atingir o alvo, com cuidado para evitar hipoglicemias (especialmente noturnas).'},
    {q:'O que é lipo-hipertrofia e como preveni-la?',a:'É o espessamento do tecido subcutâneo por aplicação repetida no mesmo local, que torna a absorção da insulina errática; previne-se com o rodízio sistemático dos locais de aplicação.'},
    {q:'Qual a vantagem da insulina degludeca?',a:'Por ter ação ultralonga e perfil muito estável, reduz a variabilidade e a hipoglicemia noturna em comparação com basais mais curtas.'}],
  fluxogramas:[{ titulo:'Início e intensificação da insulina no DM2', fonte:'Algoritmo baseado no ADA Standards of Care 2026 e nas Diretrizes SBD, adaptado ao português', nos:[
    {tipo:'inicio', texto:'DM2 com indicação de insulina → iniciar basal (~10 U ou 0,1–0,2 U/kg) à noite; manter SGLT2i/GLP-1 RA'},
    {tipo:'acao', texto:'Titular a basal pela glicemia de jejum até o alvo'},
    {tipo:'decisao', texto:'A1c acima da meta apesar da glicemia de jejum controlada?', ramos:[
      {rotulo:'SIM', tipo:'acao', texto:'Adicionar bólus na maior refeição (basal-plus) → depois basal-bólus se necessário'},
      {rotulo:'NÃO', tipo:'fim', texto:'Manter basal; monitorar e reavaliar' } ]},
    {tipo:'fim', texto:'Ajustar bólus pela glicemia pós-prandial; reavaliar sulfonilureia (hipoglicemia)'}
  ]}]
},

// 5 ─ Metas e monitorização ─────────────────────────────────────────────────
{ sub:'Diabetes', privado:true, titulo:'', ano:'2026', url:'',
  tema:'Metas Glicêmicas e Monitorização (CGM)', fonte:FONTE,
  resumo:`## Metas de HbA1c (individualizadas)
- **< 7%** para a maioria dos adultos não gestantes.
- **Mais rígida (< 6,5%)** se alcançável com segurança (curta duração, longa expectativa, sem DCV).
- **Mais flexível (< 8%)** em idosos frágeis, hipoglicemia grave prévia, comorbidades avançadas, expectativa de vida limitada.
- Reavaliar a A1c a cada **3 meses** (fora da meta) ou **6 meses** (estável no alvo).

## Monitorização contínua (CGM) — métricas
- **Tempo no alvo (TIR, 70–180 mg/dL): > 70%** para a maioria.
- **Tempo abaixo do alvo (TBR):** **< 4%** abaixo de 70 mg/dL e **< 1%** abaixo de 54 mg/dL.
- **Tempo acima (TAR):** < 25% acima de 180.
- **Indicador de gestão da glicose (GMI)** e **variabilidade glicêmica (CV ≤ 36%)**.
- Alvos mais **frouxos** para idosos/alto risco (TIR > 50%, TBR < 1%).

## Automonitorização (glicemia capilar)
Útil sobretudo em quem usa insulina/secretagogos; frequência conforme o esquema. CGM é preferível no DM1 e em DM2 insulinizado.

## Outras metas do cuidado
- **PA < 130/80 mmHg**; **estatina** conforme risco cardiovascular; considerar antiagregante em prevenção secundária.
- **Rastreio anual** de complicações (retina, TFG/albuminúria, pés, perfil lipídico).

## 📊 Alvos de HbA1c por perfil
| Perfil | Meta de HbA1c |
| --- | --- |
| Maioria dos adultos | < 7% |
| Jovem, sem DCV, baixo risco de hipoglicemia | < 6,5% |
| Idoso frágil / comorbidades / hipoglicemia | < 8% |
| Gestação | < 6% (ver capítulo próprio) |`,
  pts:[
    'A meta geral de HbA1c é < 7% para a maioria dos adultos não gestantes.',
    'Meta mais rígida (< 6,5%) se alcançável com segurança; mais flexível (< 8%) em idosos frágeis.',
    'Reavaliar a A1c a cada 3 meses fora da meta e a cada 6 meses se estável no alvo.',
    'CGM: tempo no alvo (70–180) > 70% para a maioria.',
    'Tempo abaixo do alvo: < 4% abaixo de 70 e < 1% abaixo de 54 mg/dL.',
    'Buscar variabilidade glicêmica com coeficiente de variação ≤ 36%.',
    'Alvos de CGM são mais frouxos em idosos/alto risco (TIR > 50%, TBR < 1%).',
    'A automonitorização capilar é mais útil em quem usa insulina ou secretagogos.',
    'Metas associadas: PA < 130/80 e estatina conforme risco cardiovascular.',
    'Rastreio anual de retina, função renal/albuminúria, pés e lipídeos.'],
  mapa:{ central:'Metas e monitorização', nodes:[
    {label:'HbA1c', children:[
      {label:'< 7% (maioria)'},
      {label:'< 6,5% se seguro'},
      {label:'< 8% (frágil)'}]},
    {label:'CGM', children:[
      {label:'TIR 70–180 > 70%'},
      {label:'TBR < 4% (<70) / <1% (<54)'},
      {label:'CV ≤ 36%'}]},
    {label:'Outras metas', children:['PA < 130/80','Estatina por risco','Rastreio anual de complicações']}]},
  flashcards:[
    {q:'Qual a meta geral de HbA1c e quando individualizá-la?',a:'Menos de 7% para a maioria dos adultos não gestantes; adota-se meta mais rígida (< 6,5%) quando alcançável com segurança e mais flexível (< 8%) em idosos frágeis, com hipoglicemia grave prévia ou comorbidades e expectativa de vida limitada.'},
    {q:'Quais os alvos de tempo no alvo (TIR) e tempo abaixo (TBR) no CGM?',a:'Tempo no alvo (70–180 mg/dL) acima de 70%; tempo abaixo do alvo menor que 4% abaixo de 70 mg/dL e menor que 1% abaixo de 54 mg/dL, para a maioria dos pacientes.'},
    {q:'Com que frequência se reavalia a HbA1c?',a:'A cada 3 meses quando o paciente está fora da meta ou após mudança de tratamento, e a cada 6 meses quando estável dentro do alvo.'},
    {q:'O que mede o coeficiente de variação no CGM e qual o alvo?',a:'Mede a variabilidade glicêmica; um coeficiente de variação de até 36% indica glicemia estável, valores maiores associam-se a maior risco de hipoglicemia.'},
    {q:'Além da glicemia, quais metas fazem parte do cuidado do diabético?',a:'Pressão arterial abaixo de 130/80 mmHg, estatina conforme o risco cardiovascular, eventual antiagregante em prevenção secundária e rastreamento anual de retinopatia, função renal/albuminúria, pés e perfil lipídico.'}],
  fluxogramas:[{ titulo:'Definição de metas e uso do CGM', fonte:'Algoritmo baseado no ADA Standards of Care 2026 (metas glicêmicas e CGM) e nas Diretrizes SBD, adaptado ao português', nos:[
    {tipo:'inicio', texto:'Definir meta de HbA1c pelo perfil (idade, comorbidades, risco de hipoglicemia, expectativa de vida)'},
    {tipo:'decisao', texto:'Paciente usa insulina/secretagogo ou tem hipoglicemias?', ramos:[
      {rotulo:'SIM', tipo:'acao', texto:'Preferir CGM → avaliar TIR, TBR e variabilidade (não só a A1c)'},
      {rotulo:'NÃO', tipo:'acao', texto:'HbA1c periódica ± automonitorização conforme o esquema'} ]},
    {tipo:'decisao', texto:'Dentro da meta (A1c e/ou TIR)?', ramos:[
      {rotulo:'SIM', tipo:'fim', texto:'Manter; reavaliar em 6 meses + rastreio anual de complicações'},
      {rotulo:'NÃO', tipo:'fim', texto:'Intensificar tratamento; reavaliar em 3 meses' } ]}
  ]}]
},

// 6 ─ Complicações crônicas ─────────────────────────────────────────────────
{ sub:'Diabetes', privado:true, titulo:'', ano:'2026', url:'',
  tema:'Complicações Crônicas do Diabetes', fonte:FONTE,
  resumo:`## Microvasculares
- **Retinopatia diabética:** principal causa de cegueira em adultos. Rastrear **fundo de olho ao diagnóstico no DM2** e **em 5 anos no DM1**, depois anual (menos frequente se estável/sem retinopatia). Tratamento: controle gl, **fotocoagulação/anti-VEGF** na forma proliferativa/edema macular.
- **Doença renal do diabetes (nefropatia):** rastrear **TFG estimada + relação albumina/creatinina urinária (RAC)** anualmente. Manejo: controle glicêmico e pressórico, **IECA/BRA** se albuminúria/HAS, **SGLT2i** (renoproteção) e **finerenona** se albuminúria persistente.
- **Neuropatia:** a **polineuropatia distal simétrica** é a mais comum → **exame anual dos pés** (monofilamento 10 g, sensibilidade vibratória). Autonômica (gastroparesia, hipotensão postural, disfunção erétil). Dor neuropática: duloxetina, pregabalina, gabapentina.

## Macrovasculares
Doença **aterosclerótica** (coronariana, cerebrovascular, arterial periférica) — principal causa de morte. Reduzir risco global: **estatina**, PA < 130/80, cessação do tabagismo, **SGLT2i/GLP-1 RA** com benefício cardiovascular.

## Pé diabético
Interação de **neuropatia + doença arterial + infecção**. **Exame anual** (ou mais frequente se risco); educação, calçado adequado, cuidado de úlceras e equipe multidisciplinar previnem amputação.

## Prevenção (base de tudo)
Controle glicêmico, pressórico e lipídico + antiagregante quando indicado + rastreamento sistemático.

## 📊 Rastreamento das complicações
| Complicação | Exame | Início / periodicidade |
| --- | --- | --- |
| Retinopatia | Fundo de olho | DM2: ao diagnóstico; DM1: 5 anos; depois anual |
| Doença renal | TFGe + RAC urinária | Anual (desde o diagnóstico no DM2) |
| Neuropatia / pé | Monofilamento + vibratória | Anual (mais se risco) |
| Macrovascular | Perfil lipídico, PA, risco CV | Contínuo |`,
  pts:[
    'As complicações microvasculares são retinopatia, doença renal e neuropatia.',
    'A retinopatia é a principal causa de cegueira em adultos; rastrear com fundo de olho.',
    'Rastreio de retina: ao diagnóstico no DM2 e em 5 anos no DM1, depois anual.',
    'A doença renal do diabetes rastreia-se com TFG estimada + relação albumina/creatinina urinária anual.',
    'No manejo renal usam-se IECA/BRA, SGLT2i (renoproteção) e finerenona se albuminúria persistente.',
    'A polineuropatia distal simétrica é a neuropatia mais comum; exige exame anual dos pés.',
    'A dor neuropática trata-se com duloxetina, pregabalina ou gabapentina.',
    'A doença macrovascular (aterosclerótica) é a principal causa de morte no diabetes.',
    'Reduzir risco global: estatina, PA < 130/80, não fumar e SGLT2i/GLP-1 RA com benefício CV.',
    'O pé diabético resulta de neuropatia + doença arterial + infecção; o exame anual previne amputação.'],
  mapa:{ central:'Complicações crônicas', nodes:[
    {label:'Microvasculares', children:[
      {label:'Retinopatia',children:['Fundo de olho','Anti-VEGF/fotocoagulação']},
      {label:'Doença renal',children:['TFGe + RAC','IECA/BRA, SGLT2i, finerenona']},
      {label:'Neuropatia',children:['Polineuropatia distal','Autonômica']}]},
    {label:'Macrovasculares', children:['Coronariana/AVC/DAP','Estatina, PA, SGLT2i/GLP-1']},
    {label:'Pé diabético', children:['Neuropatia + isquemia + infecção','Exame anual, equipe']},
    {label:'Prevenção', children:['Controle gli/PA/lipídeo','Rastreamento sistemático']}]},
  flashcards:[
    {q:'Quando iniciar o rastreamento de retinopatia no DM1 e no DM2?',a:'No DM2, com fundo de olho já ao diagnóstico (pois a hiperglicemia costuma preceder o diagnóstico); no DM1, após 5 anos de doença; depois, exames anuais (menos frequentes se estáveis e sem retinopatia).'},
    {q:'Como se rastreia a doença renal do diabetes?',a:'Anualmente, com a taxa de filtração glomerular estimada e a relação albumina/creatinina em amostra de urina, para detectar queda de função e albuminúria precocemente.'},
    {q:'Quais fármacos protegem o rim no diabetes com albuminúria?',a:'IECA ou BRA (controle da albuminúria e da pressão), inibidor de SGLT2 (renoproteção) e finerenona quando persiste albuminúria apesar de IECA/BRA e SGLT2i.'},
    {q:'Qual a neuropatia diabética mais comum e como rastreá-la?',a:'A polineuropatia distal simétrica; rastreia-se no exame anual dos pés com monofilamento de 10 g e teste de sensibilidade vibratória, além da avaliação de reflexos e pulsos.'},
    {q:'Quais os três componentes que levam ao pé diabético?',a:'Neuropatia (perda de sensibilidade protetora), doença arterial periférica (isquemia) e infecção; sua interação leva à ulceração e ao risco de amputação, prevenível com exame e cuidado regulares.'}],
  fluxogramas:[{ titulo:'Rastreamento e manejo das complicações crônicas', fonte:'Algoritmo baseado no ADA Standards of Care 2026, KDIGO e IWGDF, adaptado ao português', nos:[
    {tipo:'inicio', texto:'Diabetes estabelecido → rastreio periódico: fundo de olho, TFGe + RAC, exame dos pés, perfil lipídico'},
    {tipo:'decisao', texto:'Albuminúria e/ou queda da TFGe?', ramos:[
      {rotulo:'SIM', tipo:'acao', texto:'IECA/BRA + SGLT2i; finerenona se albuminúria persistente; otimizar PA e glicemia'},
      {rotulo:'NÃO', tipo:'acao', texto:'Manter controle e rastreio anual'} ]},
    {tipo:'decisao', texto:'Perda de sensibilidade protetora / úlcera ou retinopatia avançada?', ramos:[
      {rotulo:'SIM', tipo:'fim', texto:'Encaminhar (equipe do pé / oftalmologia: anti-VEGF/fotocoagulação); intensificar cuidado'},
      {rotulo:'NÃO', tipo:'fim', texto:'Prevenção: controle glicêmico/PA/lipídeo, estatina e cuidado dos pés' } ]}
  ]}]
},

// 7 ─ Emergências hiperglicêmicas ───────────────────────────────────────────
{ sub:'Diabetes', privado:true, titulo:'', ano:'2026', url:'',
  tema:'Emergências Hiperglicêmicas — CAD e EHH', fonte:FONTE,
  resumo:`## Definições
- **Cetoacidose diabética (CAD):** hiperglicemia (**glicemia ≥ 200 mg/dL**, ou qualquer valor em diabético conhecido) + **cetose** (β-hidroxibutirato ≥ 3,0 mmol/L ou cetonúria) + **acidose** (pH < 7,3 ou bicarbonato < 18). Mais típica do **DM1**.
- **Estado hiperglicêmico hiperosmolar (EHH):** **glicemia > 600 mg/dL**, **osmolaridade efetiva > 320 mOsm/kg**, **sem cetoacidose significativa** (pH > 7,3, bicarbonato > 18), **desidratação profunda** e rebaixamento. Mais típico do **DM2/idoso**.
> **CAD euglicêmica:** glicemia pode ser < 200 (uso de **SGLT2i**, gestação, jejum) — não descartar CAD pela glicemia.

## Precipitantes
Infecção, **omissão/insuficiência de insulina**, primo-descompensação, evento agudo (IAM, AVC), fármacos (glicocorticoide, SGLT2i).

## Pilares do tratamento
1. **Hidratação** com cristaloide (corrige volume e reduz a glicemia).
2. **Potássio:** repor cedo; **não iniciar insulina se K < 3,3 mmol/L** (repor antes) — a insulina baixa o K.
3. **Insulina** IV regular (0,1 U/kg/h, com ou sem bólus); **reduzir/adicionar glicose (SG)** quando a glicemia chegar a ~200–250 para permitir a resolução da cetose sem hipoglicemia.
4. Tratar o **precipitante**; monitorar eletrólitos, pH e ânion-gap.

## Resolução e transição
CAD resolvida: **cetose/acidose corrigidas** (ânion-gap normal, bicarbonato ≥ 15–18, pH > 7,3). Fazer **sobreposição** com insulina subcutânea antes de suspender a IV (evita rebote).

## 📊 CAD × EHH
| Parâmetro | CAD | EHH |
| --- | --- | --- |
| Glicemia | ≥ 200 (pode ser normal) | > 600 |
| Cetose | Marcante | Ausente/mínima |
| pH / bicarbonato | Baixos (acidose) | Normais |
| Osmolaridade | Variável | > 320 (muito alta) |
| Perfil típico | DM1 | DM2 / idoso |`,
  pts:[
    'CAD: hiperglicemia + cetose (β-OH-butirato ≥ 3,0) + acidose (pH < 7,3 ou bicarbonato < 18).',
    'EHH: glicemia > 600, osmolaridade efetiva > 320, sem cetoacidose e com desidratação profunda.',
    'CAD é mais típica do DM1; EHH do DM2/idoso.',
    'CAD euglicêmica ocorre com SGLT2i, gestação e jejum — não descartar pela glicemia normal.',
    'Precipitantes: infecção, omissão de insulina, primo-descompensação e eventos agudos.',
    'Hidratação com cristaloide é o primeiro pilar do tratamento.',
    'Não iniciar insulina se potássio < 3,3; repor potássio antes (a insulina baixa o K).',
    'Insulina regular IV 0,1 U/kg/h corrige a cetose.',
    'Adicionar soro glicosado quando a glicemia chega a ~200–250 para resolver a cetose sem hipoglicemia.',
    'Sobrepor insulina subcutânea antes de suspender a IV, para evitar rebote.'],
  mapa:{ central:'CAD e EHH', nodes:[
    {label:'CAD', children:['Hiperglicemia (pode ser euglicêmica)','Cetose','Acidose (pH<7,3)']},
    {label:'EHH', children:['Glicemia > 600','Osm > 320','Sem cetoacidose']},
    {label:'Precipitantes', children:['Infecção','Omissão de insulina','IAM/AVC, fármacos']},
    {label:'Tratamento', children:[
      {label:'1. Hidratação'},
      {label:'2. Potássio (K<3,3 → repor antes)'},
      {label:'3. Insulina IV + glicose a ~200–250'},
      {label:'4. Tratar precipitante'}]}]},
  flashcards:[
    {q:'Quais os três critérios diagnósticos da cetoacidose diabética?',a:'Hiperglicemia (glicemia ≥ 200 mg/dL, ou qualquer valor em diabético conhecido), cetose (β-hidroxibutirato ≥ 3,0 mmol/L ou cetonúria) e acidose metabólica (pH < 7,3 ou bicarbonato < 18 mEq/L).'},
    {q:'O que é CAD euglicêmica e em quem ocorre?',a:'É a cetoacidose com glicemia pouco elevada ou normal (< 200 mg/dL), observada em usuários de inibidores de SGLT2, gestantes e em jejum prolongado; alerta para não excluir CAD apenas pela glicemia.'},
    {q:'Por que não se deve iniciar insulina se o potássio estiver < 3,3 mmol/L?',a:'Porque a insulina desloca potássio para dentro da célula e pode causar hipocalemia grave e arritmia; repõe-se potássio primeiro e só então se inicia a insulina.'},
    {q:'Quando e por que se adiciona soro glicosado no tratamento da CAD?',a:'Quando a glicemia cai para cerca de 200–250 mg/dL; adiciona-se glicose para manter a insulina em curso (necessária para resolver a cetose) sem provocar hipoglicemia.'},
    {q:'Como diferenciar o EHH da CAD?',a:'No EHH há glicemia muito alta (> 600), osmolaridade efetiva > 320 e desidratação profunda, sem cetoacidose significativa (pH e bicarbonato normais); a CAD cursa com cetose e acidose, sendo mais típica do DM1.'}],
  fluxogramas:[{ titulo:'Manejo das emergências hiperglicêmicas', fonte:'Algoritmo baseado no consenso ADA/EASD de crises hiperglicêmicas (2024) e no ADA Standards of Care 2026, adaptado ao português', nos:[
    {tipo:'inicio', texto:'Hiperglicemia grave → avaliar cetonas, pH/bicarbonato, osmolaridade e potássio; buscar precipitante'},
    {tipo:'acao', texto:'Iniciar hidratação com cristaloide'},
    {tipo:'decisao', texto:'Potássio < 3,3 mmol/L?', ramos:[
      {rotulo:'SIM', tipo:'acao', texto:'Repor potássio antes da insulina'},
      {rotulo:'NÃO', tipo:'acao', texto:'Iniciar insulina IV 0,1 U/kg/h (repor K se 3,3–5,3)'} ]},
    {tipo:'decisao', texto:'Glicemia ~200 (CAD) / ~250–300 (EHH)?', ramos:[
      {rotulo:'SIM', tipo:'fim', texto:'Adicionar soro glicosado e manter insulina até resolver cetose/hiperosmolaridade; depois transição SC'},
      {rotulo:'NÃO', tipo:'fim', texto:'Continuar insulina + hidratação; reavaliar eletrólitos e ânion-gap' } ]}
  ]}]
},

// 8 ─ Hipoglicemia ──────────────────────────────────────────────────────────
{ sub:'Diabetes', privado:true, titulo:'', ano:'2026', url:'',
  tema:'Hipoglicemia no Diabetes', fonte:FONTE,
  resumo:`## Classificação (ADA / SBD)
- **Nível 1 (alerta):** glicose **< 70 e ≥ 54 mg/dL**.
- **Nível 2 (clinicamente significativa):** glicose **< 54 mg/dL**.
- **Nível 3 (grave):** comprometimento **cognitivo/físico** que exige **ajuda de terceiros** (independe do valor).

## Sintomas
- **Autonômicos (adrenérgicos):** tremor, sudorese, palpitação, fome — sinais de alerta.
- **Neuroglicopênicos:** confusão, alteração de comportamento, visão turva, convulsão, coma.
- **Hipoglicemia assintomática (unawareness):** perda dos sinais de alerta por hipoglicemias repetidas → risco maior; **relaxar metas** e evitar novas hipoglicemias por semanas restaura a percepção.

## Fatores de risco
Uso de **insulina/sulfonilureia**, omissão de refeições, exercício, álcool, insuficiência renal/hepática, idade avançada, metas muito rígidas.

## Tratamento
- **Consciente (regra dos 15):** **15 g de carboidrato de absorção rápida** (glicose oral) → reavaliar em 15 min → repetir se ainda < 70; depois refeição/lanche.
- **Grave/inconsciente:** **glucagon** (IM/SC ou intranasal) por leigo treinado; no hospital, **glicose IV**.
- Após o evento: **rever a causa** e **ajustar o tratamento** (reduzir insulina/secretagogo, revisar metas).

## Prevenção
Educação, **CGM com alarmes**, esquemas com menor risco (basais estáveis, evitar sulfonilureia em idoso), metas individualizadas.

## 📊 Níveis de hipoglicemia
| Nível | Glicose | Conduta |
| --- | --- | --- |
| 1 (alerta) | < 70 e ≥ 54 | 15 g de carboidrato, reavaliar |
| 2 (significativa) | < 54 | Tratar prontamente; revisar terapia |
| 3 (grave) | Precisa de terceiros | Glucagon / glicose IV |`,
  pts:[
    'Hipoglicemia nível 1 (alerta): glicose < 70 e ≥ 54 mg/dL.',
    'Nível 2 (clinicamente significativa): glicose < 54 mg/dL.',
    'Nível 3 (grave): compromete cognição/física e exige ajuda de terceiros, independentemente do valor.',
    'Sintomas autonômicos (tremor, sudorese, palpitação) alertam; neuroglicopênicos indicam gravidade.',
    'A hipoglicemia assintomática (unawareness) decorre de episódios repetidos e aumenta o risco.',
    'Evitar novas hipoglicemias por semanas restaura a percepção dos sinais de alerta.',
    'Principais fatores de risco: insulina/sulfonilureia, omissão de refeição, álcool e insuficiência renal.',
    'Consciente: regra dos 15 — 15 g de carboidrato rápido, reavaliar em 15 minutos.',
    'Grave/inconsciente: glucagon (IM/SC ou intranasal) ou glicose IV no hospital.',
    'Após o episódio, rever a causa e ajustar insulina/secretagogo e as metas.'],
  mapa:{ central:'Hipoglicemia', nodes:[
    {label:'Níveis', children:['1: < 70 e ≥ 54','2: < 54','3: grave (ajuda de terceiros)']},
    {label:'Sintomas', children:[
      {label:'Autonômicos (alerta)'},
      {label:'Neuroglicopênicos'},
      {label:'Unawareness (perda do alerta)'}]},
    {label:'Fatores de risco', children:['Insulina/sulfonilureia','Omissão de refeição, álcool','Insuficiência renal, idade']},
    {label:'Tratamento', children:[
      {label:'Consciente: regra dos 15'},
      {label:'Grave: glucagon / glicose IV'},
      {label:'Rever causa e metas'}]}]},
  flashcards:[
    {q:'Como se classificam os níveis de hipoglicemia?',a:'Nível 1 (alerta): glicose < 70 e ≥ 54 mg/dL; nível 2 (clinicamente significativa): < 54 mg/dL; nível 3 (grave): alteração cognitiva ou física que exige assistência de terceiros, independentemente do valor.'},
    {q:'O que é a hipoglicemia assintomática (unawareness) e como revertê-la?',a:'É a perda dos sintomas autonômicos de alerta após hipoglicemias repetidas, aumentando o risco de episódios graves; reverte-se relaxando as metas e evitando novas hipoglicemias por algumas semanas.'},
    {q:'Em que consiste a regra dos 15?',a:'No paciente consciente, administrar 15 g de carboidrato de absorção rápida, reavaliar a glicemia em 15 minutos e repetir se ainda estiver abaixo de 70 mg/dL, seguindo-se de refeição ou lanche.'},
    {q:'Como tratar a hipoglicemia grave em quem não consegue ingerir?',a:'Com glucagon (intramuscular, subcutâneo ou intranasal), que pode ser aplicado por um cuidador treinado; no ambiente hospitalar, administra-se glicose intravenosa.'},
    {q:'Quais medidas previnem hipoglicemias recorrentes?',a:'Educação, uso de CGM com alarmes, escolha de esquemas de menor risco (basais estáveis, evitar sulfonilureias em idosos), individualização das metas e revisão do tratamento após cada episódio.'}],
  fluxogramas:[{ titulo:'Manejo da hipoglicemia', fonte:'Algoritmo baseado no ADA Standards of Care 2026 e nas Diretrizes SBD, adaptado ao português', nos:[
    {tipo:'inicio', texto:'Suspeita de hipoglicemia → confirmar glicemia (< 70 mg/dL)'},
    {tipo:'decisao', texto:'Paciente consciente e capaz de deglutir?', ramos:[
      {rotulo:'SIM', tipo:'acao', texto:'Regra dos 15: 15 g de carboidrato rápido, reavaliar em 15 min, repetir se < 70'},
      {rotulo:'NÃO', tipo:'acao', texto:'Glucagon (IM/SC/intranasal) ou glicose IV no hospital'} ]},
    {tipo:'acao', texto:'Após recuperar: refeição/lanche'},
    {tipo:'fim', texto:'Rever causa e ajustar terapia/metas (reduzir insulina ou secretagogo)'}
  ]}]
},

// 9 ─ Diabetes e gestação ───────────────────────────────────────────────────
{ sub:'Diabetes', privado:true, titulo:'', ano:'2026', url:'',
  tema:'Diabetes e Gestação', fonte:FONTE,
  resumo:`## Dois cenários
- **Diabetes mellitus gestacional (DMG):** intolerância à glicose **diagnosticada na gravidez** (geralmente 2º–3º trimestre), sem diabetes franco prévio.
- **Diabetes pré-gestacional (DM1/DM2):** anterior à gestação — maior risco de **malformações** (organogênese) → exige **planejamento**.

## Rastreamento e diagnóstico do DMG
- **24–28 semanas**, com TOTG 75 g. Critérios (**um** valor alterado, IADPSG): **jejum ≥ 92**, **1 h ≥ 180**, **2 h ≥ 153 mg/dL**. (Estratégia de dois passos é alternativa.)
- Rastreio **precoce** (1ª consulta) se fatores de risco, para detectar diabetes preexistente.

## Metas glicêmicas na gestação (mais rígidas)
- **Jejum < 95 mg/dL**; **1 h pós-prandial < 140**; **2 h pós-prandial < 120**.
- **HbA1c < 6%** (ou < 7% se risco de hipoglicemia).

## Tratamento
- **Dieta e atividade física** primeiro; se não atinge metas, **insulina é o tratamento de escolha** (não atravessa a placenta de forma relevante).
- **Metformina e glibenclamida atravessam a placenta** — não são 1ª linha; usar conforme julgamento/limitações de acesso.
- No **pré-gestacional:** meta de **A1c < 6,5% na concepção**, ácido fólico, revisar fármacos (**suspender IECA/BRA, estatina**), avaliar retina e rim.

## Pós-parto
- DMG: **reclassificar com TOTG 75 g em 4–12 semanas** (risco elevado de DM2 futuro; rastrear a cada 1–3 anos). Estimular amamentação e estilo de vida.

## 📊 Metas glicêmicas na gestação
| Momento | Alvo |
| --- | --- |
| Jejum | < 95 mg/dL |
| 1 h pós-prandial | < 140 mg/dL |
| 2 h pós-prandial | < 120 mg/dL |
| HbA1c | < 6% (< 7% se hipoglicemia) |`,
  pts:[
    'DMG é a intolerância à glicose diagnosticada na gravidez, sem diabetes franco prévio.',
    'Diabetes pré-gestacional aumenta o risco de malformações e exige planejamento.',
    'Rastrear DMG entre 24 e 28 semanas com TOTG de 75 g.',
    'Critérios IADPSG (um valor basta): jejum ≥ 92, 1 h ≥ 180, 2 h ≥ 153 mg/dL.',
    'Rastreamento precoce na 1ª consulta se há fatores de risco (detecta diabetes preexistente).',
    'Metas na gestação: jejum < 95, 1 h < 140 e 2 h < 120 mg/dL.',
    'HbA1c alvo < 6% na gravidez (ou < 7% se risco de hipoglicemia).',
    'A insulina é o tratamento de escolha quando dieta e exercício não bastam.',
    'Metformina e glibenclamida atravessam a placenta e não são primeira linha.',
    'Pós-parto: reclassificar o DMG com TOTG em 4–12 semanas (risco alto de DM2 futuro).'],
  mapa:{ central:'Diabetes e gestação', nodes:[
    {label:'Cenários', children:[
      {label:'DMG (diagnóstico na gravidez)'},
      {label:'Pré-gestacional (DM1/DM2)',children:['Risco de malformação','Planejar concepção']}]},
    {label:'Rastreio DMG', children:['24–28 semanas, TOTG 75 g','IADPSG: 92 / 180 / 153','Precoce se risco']},
    {label:'Metas', children:['Jejum < 95','1 h < 140 / 2 h < 120','HbA1c < 6%']},
    {label:'Tratamento', children:[
      {label:'Dieta + exercício'},
      {label:'Insulina (escolha)'},
      {label:'Suspender IECA/BRA e estatina'}]},
    {label:'Pós-parto', children:['Reclassificar (TOTG 4–12 sem)','Rastrear DM2 1–3 anos']}]},
  flashcards:[
    {q:'Quando e como se rastreia o diabetes gestacional?',a:'Entre 24 e 28 semanas, com TOTG de 75 g; pelos critérios IADPSG, basta um valor alterado — jejum ≥ 92, 1 hora ≥ 180 ou 2 horas ≥ 153 mg/dL. Rastreia-se precocemente na primeira consulta quando há fatores de risco.'},
    {q:'Quais são as metas glicêmicas na gestação?',a:'Jejum abaixo de 95 mg/dL, 1 hora pós-prandial abaixo de 140 e 2 horas abaixo de 120 mg/dL, com HbA1c alvo abaixo de 6% (ou abaixo de 7% se houver risco de hipoglicemia).'},
    {q:'Qual o tratamento farmacológico de escolha no diabetes na gravidez?',a:'A insulina, por não atravessar a placenta de forma relevante; metformina e glibenclamida atravessam a placenta e não são primeira linha.'},
    {q:'Que cuidados o diabetes pré-gestacional exige antes da concepção?',a:'Planejamento com HbA1c abaixo de 6,5%, uso de ácido fólico, suspensão de fármacos teratogênicos (IECA/BRA, estatinas) e avaliação de retina e função renal, para reduzir malformações e complicações.'},
    {q:'O que fazer no pós-parto de uma mulher com DMG?',a:'Reclassificar com TOTG de 75 g entre 4 e 12 semanas pós-parto, pois há risco elevado de desenvolver DM2; manter rastreamento a cada 1–3 anos e estimular amamentação e estilo de vida saudável.'}],
  fluxogramas:[{ titulo:'Rastreamento e manejo do diabetes na gestação', fonte:'Algoritmo baseado no ADA Standards of Care 2026 (manejo na gravidez) e nas Diretrizes SBD, adaptado ao português', nos:[
    {tipo:'inicio', texto:'Gestante → 1ª consulta: rastrear diabetes preexistente se fatores de risco'},
    {tipo:'decisao', texto:'Diabetes franco já na 1ª consulta?', ramos:[
      {rotulo:'SIM', tipo:'acao', texto:'Tratar como diabetes pré-gestacional (insulina; suspender IECA/BRA e estatina)'},
      {rotulo:'NÃO', tipo:'acao', texto:'TOTG 75 g em 24–28 semanas (IADPSG: 92 / 180 / 153)'} ]},
    {tipo:'decisao', texto:'Metas atingidas com dieta e exercício?', ramos:[
      {rotulo:'SIM', tipo:'fim', texto:'Manter estilo de vida; monitorar glicemias e crescimento fetal'},
      {rotulo:'NÃO', tipo:'fim', texto:'Iniciar insulina; no pós-parto reclassificar o DMG com TOTG em 4–12 semanas'} ]}
  ]}]
}
];

// ── SQL (3 lotes) ──
const fs=require('fs');
function mkSql(arr){const j=JSON.stringify(arr);if(j.indexOf('$j$')>=0)throw new Error('$j$');return `UPDATE endodirect_global_state\nSET payload = jsonb_set(payload, '{diretrizes}', coalesce(payload->'diretrizes','[]'::jsonb) || $j$${j}$j$::jsonb)\nWHERE payload ? 'diretrizes';`;}
const b1=R.slice(0,3), b2=R.slice(3,6), b3=R.slice(6);
fs.writeFileSync(__dirname+'/dm1.sql', mkSql(b1));
fs.writeFileSync(__dirname+'/dm2.sql', mkSql(b2));
fs.writeFileSync(__dirname+'/dm3.sql', mkSql(b3));
R.forEach(r=>{ (r.resumo.split('\n').filter(l=>l.trim().startsWith('|'))).forEach(l=>{ l.split('|').slice(1,-1).forEach(c=>{ if(c.trim()==='')throw new Error('célula vazia em '+r.tema); }); }); });
console.log('Diabetes:', R.length, 'resumos | lotes', b1.length+'+'+b2.length+'+'+b3.length);
R.forEach((r,i)=>console.log('  '+(i+1)+'.', r.tema, '[pts '+r.pts.length+' fc '+r.flashcards.length+' flux '+r.fluxogramas.length+']'));
