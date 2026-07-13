// Resumos de Tireoide (privados) — síntese própria (não reproduz texto dos livros),
// cobertura baseada em Vilar Endocrinologia Clínica 8ed 2024, Williams, Greenspan,
// Igaz, Endocrine Emergencies (Matfin), atualizada com diretrizes ATA.
// Schema = diretriz privada: {sub,privado,titulo:'',tema,fonte,ano,url:'',resumo(md),pts[],mapa{central,nodes[]},flashcards[{q,a}],fluxogramas[]}.
const FONTE = 'Síntese Endodirect · Vilar 8ed + Williams/Greenspan + ATA';

const RESUMOS = [
// 1 ─────────────────────────────────────────────────────────────────────
{
  sub:'Tireoide', privado:true, titulo:'', ano:'2026', url:'',
  tema:'Tireoide: Avaliação da Função e Imagem',
  fonte:FONTE,
  resumo:`## Eixo e princípio geral
O **TSH hipofisário** responde de forma **log-linear** ao T4 livre: pequenas variações de T4L geram grandes variações de TSH, o que torna o **TSH o teste isolado mais sensível** para disfunção tireoidiana **primária** (com eixo íntegro). A tireoide secreta ~**80% T4** e ~20% T3; a maior parte do **T3 (ativo)** vem da **desiodação periférica** do T4 (desiodases D1/D2).

## Testes de função
- **TSH:** rastreio e monitorização de primeira linha. Alterado precocemente.
- **T4 livre (T4L):** define a gravidade e confirma hipo/hipertireoidismo. Preferir T4L à T4 total (que varia com TBG).
- **T3 (total/livre):** útil na **tireotoxicose** (T3-toxicose) e para gravidade; **não** serve para diagnosticar hipotireoidismo (cai tarde).
- **TBG e proteínas:** gravidez, estrogênio, síndrome nefrótica e hepatopatia alteram a **T4 total** sem alterar a fração livre.

## Anticorpos
- **Anti-TPO** e **anti-tireoglobulina (anti-Tg):** marcadores de **autoimunidade** (Hashimoto, Graves). Anti-TPO é o mais sensível.
- **TRAb (anticorpo anti-receptor de TSH):** confirma **Doença de Graves** (estimulador), útil na gestante e no diagnóstico diferencial da tireotoxicose.
- **Tireoglobulina (Tg):** **marcador tumoral** no seguimento do carcinoma **diferenciado** pós-tireoidectomia (não é teste de função). Sempre dosar **anti-Tg** junto (interfere na dosagem).
- **Calcitonina:** marcador do **carcinoma medular**.

## Padrões laboratoriais (raciocínio)
| TSH | T4L | Interpretação |
| --- | --- | --- |
| ↑ | ↓ | Hipotireoidismo **primário** |
| ↑ | normal | Hipotireoidismo **subclínico** |
| ↓ | ↑ | Hipertireoidismo (tireotoxicose) |
| ↓ | normal | Hipertireoidismo **subclínico** |
| ↓/normal | ↓ | Hipotireoidismo **central** ou doente não-tireoidiano |
| ↑ | ↑ | Resistência a hormônio tireoidiano / TSHoma (raro) |

## Imagem e citologia
- **Ultrassonografia (US):** método de escolha para **nódulos e bócio**; estratifica risco por **TI-RADS** (composição, ecogenicidade, forma mais alta que larga, margens, focos ecogênicos/microcalcificações).
- **PAAF guiada por US:** define conduta do nódulo; laudo pela classificação de **Bethesda** (I–VI).
- **Cintilografia (I-123/Tc-99m) + RAIU (captação de iodo radioativo):** diferencia causas de **tireotoxicose** (captação **alta/difusa** = Graves; **focal** = nódulo autônomo; **baixa/ausente** = tireoidite, iodo, tireotoxicose factícia). **Não** usar em gestante.
- **PET/CT com FDG:** carcinoma diferenciado com Tg elevada e pesquisa de corpo inteiro negativa ("Tg+/PCI−").`,
  pts:[
    'TSH é o teste isolado mais sensível para disfunção PRIMÁRIA (relação log-linear com T4L).',
    'T4 livre define a gravidade; T3 é útil na tireotoxicose, não no hipotireoidismo.',
    'Anti-TPO = marcador de autoimunidade (Hashimoto/Graves); o mais sensível.',
    'TRAb confirma Doença de Graves e orienta o diagnóstico diferencial e a gestação.',
    'Tireoglobulina é marcador tumoral do carcinoma DIFERENCIADO (sempre com anti-Tg junto).',
    'Calcitonina é o marcador do carcinoma MEDULAR.',
    'TSH↑/T4L normal = subclínico; TSH↓/T4L normal = hipertireoidismo subclínico.',
    'TSH baixo/normal com T4L baixo sugere causa CENTRAL ou doente não-tireoidiano.',
    'US + TI-RADS estratifica o nódulo; PAAF é classificada por Bethesda (I–VI).',
    'RAIU/cintilografia diferencia a tireotoxicose (alta=Graves, focal=autonomia, baixa=tireoidite/iodo); contraindicada na gestação.'
  ],
  mapa:{ central:'Avaliação da tireoide',
    nodes:[
      { label:'Função', children:[
        {label:'TSH', children:['1ª linha (primário)','Log-linear com T4L']},
        {label:'T4 livre', children:['Gravidade','Confirma hipo/hiper']},
        {label:'T3', children:['Tireotoxicose (T3-tox)','Não p/ hipotireoidismo']} ]},
      { label:'Autoanticorpos', children:[
        {label:'Anti-TPO', children:['Autoimunidade','Mais sensível']},
        {label:'TRAb', children:['Confirma Graves','Gestante / DDx']} ]},
      { label:'Marcadores tumorais', children:[
        {label:'Tireoglobulina', children:['CA diferenciado','Dosar anti-Tg junto']},
        {label:'Calcitonina', children:['CA medular']} ]},
      { label:'Imagem', children:[
        {label:'US + TI-RADS', children:['Nódulo/bócio','Risco → PAAF']},
        {label:'PAAF (Bethesda)', children:['I a VI']},
        {label:'RAIU/cintilografia', children:['DDx tireotoxicose','Não na gestação']} ]}
    ]},
  flashcards:[
    {q:'Por que o TSH é o melhor teste isolado para disfunção tireoidiana primária?',a:'Porque responde de forma log-linear ao T4 livre: pequenas mudanças de T4L causam grandes variações de TSH, tornando-o muito sensível quando o eixo hipotálamo-hipófise está íntegro.'},
    {q:'Qual padrão define hipotireoidismo subclínico e qual define hipertireoidismo subclínico?',a:'Subclínico hipo = TSH elevado com T4 livre normal. Subclínico hiper = TSH baixo com T4 livre (e T3) normais.'},
    {q:'Qual anticorpo confirma a Doença de Graves?',a:'O TRAb (anticorpo anti-receptor de TSH), do tipo estimulador; útil também na gestante e no diagnóstico diferencial da tireotoxicose.'},
    {q:'Para que serve a tireoglobulina e qual cuidado na dosagem?',a:'É marcador tumoral do carcinoma diferenciado no seguimento pós-tireoidectomia; deve ser dosada junto com o anti-Tg, que interfere no resultado.'},
    {q:'Como a captação de iodo (RAIU) ajuda na tireotoxicose?',a:'Captação alta/difusa sugere Graves; captação focal sugere nódulo autônomo; captação baixa/ausente sugere tireoidite, excesso de iodo ou tireotoxicose factícia. É contraindicada na gestação.'}
  ],
  fluxogramas:[]
},
// 2 ─────────────────────────────────────────────────────────────────────
{
  sub:'Tireoide', privado:true, titulo:'', ano:'2026', url:'',
  tema:'Hipotireoidismo',
  fonte:FONTE,
  resumo:`## Definição e causas
Deficiência de ação dos hormônios tireoidianos. **Primário** (>95%): falha da glândula → **TSH↑**. **Central** (secundário/terciário): falha hipófise/hipotálamo → **TSH baixo ou inapropriadamente normal com T4L baixo**.

- **Primário:** **tireoidite de Hashimoto** (autoimune, causa mais comum em área suficiente em iodo), pós-**tireoidectomia/radioiodo**, **deficiência de iodo** (causa mais comum no mundo), fármacos (**amiodarona, lítio**, inibidores de tirosina-quinase, ICI), tireoidite subaguda (fase transitória), congênito.
- **Central:** tumores/cirurgia/radioterapia selar, Sheehan, hipofisite.

## Quadro clínico
Fadiga, ganho de peso, intolerância ao frio, pele seca, constipação, bradicardia, bradipsiquismo, mialgia, menorragia, **reflexo aquileu lento**, edema (mixedema), dislipidemia, derrame pericárdico. Grave/descompensado → **coma mixedematoso**.

## Diagnóstico
- **Primário:** **TSH↑ + T4L↓**. **Anti-TPO** confirma Hashimoto.
- **Subclínico:** **TSH↑ (geralmente 4,5–10) + T4L normal**. Confirmar com nova dosagem em 2–3 meses (excluir causas transitórias).
- **Central:** T4L↓ com TSH não elevado → investigar hipófise (demais eixos, RM).

## Tratamento
- **Levotiroxina (LT4)** VO em **jejum** (30–60 min antes do café ou ao deitar, longe de cálcio/ferro/inibidores de bomba/soja).
- **Dose plena** ~**1,6 µg/kg/dia** no jovem hígido; **iniciar baixo (12,5–25 µg) e titular** no **idoso e cardiopata** (risco de angina/arritmia).
- **Meta:** TSH na **faixa normal** (ajustar a cada **6–8 semanas**). No **central**, guiar pelo **T4L** (TSH não serve).
- **Gestação:** necessidade sobe ~**30–50%**; alvo TSH por trimestre (**< 2,5 no 1º**); ajustar assim que confirmar gravidez.

## Hipotireoidismo subclínico — tratar?
Considerar LT4 se **TSH ≥ 10**, ou TSH 4,5–10 com **sintomas, anti-TPO+, dislipidemia, gestação/desejo de gestar** ou jovem. No **idoso**, ser conservador (TSH sobe fisiologicamente com a idade).`,
  pts:[
    'Primário (>95%): TSH↑ + T4L↓; Hashimoto é a causa mais comum onde há iodo suficiente; deficiência de iodo é a causa mais comum no mundo.',
    'Central: T4L↓ com TSH baixo/normal-inapropriado → investigar hipófise e demais eixos.',
    'Anti-TPO confirma a etiologia autoimune (Hashimoto).',
    'Subclínico = TSH↑ com T4L normal; reconfirmar em 2–3 meses.',
    'Tratamento = levotiroxina em jejum, longe de cálcio/ferro/IBP.',
    'Dose plena ~1,6 µg/kg/dia no jovem; iniciar baixo e titular no idoso/cardiopata.',
    'Meta é TSH normal; reavaliar a cada 6–8 semanas.',
    'No hipotireoidismo central, guiar a dose pelo T4L, não pelo TSH.',
    'Gestação aumenta a necessidade em ~30–50%; alvo TSH < 2,5 no 1º trimestre.',
    'Tratar subclínico se TSH ≥ 10, ou 4,5–10 com sintomas/anti-TPO+/gestação/jovem.'
  ],
  mapa:{ central:'Hipotireoidismo',
    nodes:[
      { label:'Primário (TSH↑)', children:[
        {label:'Hashimoto (anti-TPO)', children:['+ comum c/ iodo suficiente']},
        {label:'Pós-tireoidectomia/RAI'},
        {label:'Deficiência de iodo', children:['+ comum no mundo']},
        {label:'Fármacos', children:['Amiodarona','Lítio','ICI / TKI']} ]},
      { label:'Central (T4L↓, TSH↓/normal)', children:['Tumor/cirurgia selar','Sheehan','Investigar eixos + RM'] },
      { label:'Clínica', children:['Fadiga, frio, ganho de peso','Bradicardia, pele seca','Reflexo aquileu lento','Grave → coma mixedematoso'] },
      { label:'Tratamento (LT4)', children:[
        {label:'Jejum, longe de cálcio/ferro/IBP'},
        {label:'1,6 µg/kg (jovem)'},
        {label:'Iniciar baixo no idoso/cardiopata'},
        {label:'Meta TSH normal (6–8 sem)'},
        {label:'Central → guiar por T4L'} ]},
      { label:'Gestação', children:['Necessidade ↑30–50%','TSH < 2,5 (1º tri)'] }
    ]},
  flashcards:[
    {q:'Como se diferencia hipotireoidismo primário de central pelo laboratório?',a:'Primário: TSH elevado com T4 livre baixo. Central: T4 livre baixo com TSH baixo ou inapropriadamente normal (falha hipófise/hipotálamo).'},
    {q:'Como se toma e se ajusta a levotiroxina?',a:'Em jejum (30–60 min antes do café ou ao deitar), longe de cálcio, ferro e inibidores de bomba de prótons; dose plena ~1,6 µg/kg/dia no jovem, iniciando baixo no idoso/cardiopata; meta é TSH normal, reavaliando a cada 6–8 semanas.'},
    {q:'Por que no hipotireoidismo central não se usa o TSH para ajustar a dose?',a:'Porque a hipófise está doente e não produz TSH de forma confiável; o ajuste é guiado pelo T4 livre, mantido na metade superior da normalidade.'},
    {q:'Quando tratar o hipotireoidismo subclínico?',a:'Se TSH ≥ 10 mUI/L; ou TSH 4,5–10 com sintomas, anti-TPO positivo, dislipidemia, gestação/desejo de gestar ou paciente jovem. No idoso, ser conservador.'},
    {q:'O que acontece com a necessidade de levotiroxina na gestação?',a:'Aumenta cerca de 30–50%; deve-se elevar a dose assim que a gravidez é confirmada e mirar TSH abaixo de 2,5 no primeiro trimestre.'}
  ],
  fluxogramas:[{
    titulo:'Hipotireoidismo subclínico: tratar ou observar',
    fonte:'Síntese Endodirect (baseado em ATA)',
    nos:[
      {tipo:'inicio', texto:'TSH elevado com T4 livre normal — repetir TSH (+anti-TPO) em 2–3 meses para confirmar'},
      {tipo:'decisao', texto:'TSH ≥ 10 mUI/L confirmado?', ramos:[
        {rotulo:'SIM', tipo:'fim', texto:'Iniciar levotiroxina (maior risco cardiovascular e de progressão)'},
        {rotulo:'NÃO (4,5–10)', tipo:'acao', texto:'Avaliar sintomas, anti-TPO, dislipidemia, idade e desejo de gestar'} ]},
      {tipo:'decisao', texto:'Sintomático, anti-TPO+, jovem, gestante/deseja gestar?', ramos:[
        {rotulo:'SIM', tipo:'fim', texto:'Trial de levotiroxina com meta de TSH normal'},
        {rotulo:'NÃO (idoso assintomático)', tipo:'fim', texto:'Observar e reavaliar em 6–12 meses (TSH sobe com a idade)'} ]}
    ]
  }]
},
// 3 ─────────────────────────────────────────────────────────────────────
{
  sub:'Tireoide', privado:true, titulo:'', ano:'2026', url:'',
  tema:'Tireotoxicose: Abordagem e Diagnóstico Diferencial',
  fonte:FONTE,
  resumo:`## Conceitos
**Tireotoxicose** = síndrome do excesso de hormônio tireoidiano nos tecidos. **Hipertireoidismo** = tireotoxicose por **hiperfunção da glândula** (produção aumentada). Nem toda tireotoxicose é hipertireoidismo (ex.: tireoidite libera hormônio pré-formado; factícia = ingestão exógena).

## Causas
- **Com hiperfunção (RAIU alta):** **Doença de Graves** (mais comum), **bócio multinodular tóxico (Plummer)**, **adenoma tóxico** (nódulo autônomo).
- **Sem hiperfunção (RAIU baixa/ausente):** **tireoidites** (subaguda, silenciosa, pós-parto, por amiodarona tipo 2), **tireotoxicose factícia** (LT4 exógena), excesso de **iodo** (Jod-Basedow), struma ovarii, metástases funcionantes.

## Quadro clínico
Palpitação/taquicardia, perda de peso com apetite preservado, intolerância ao calor, sudorese, tremor fino, ansiedade, hiperdefecação, fraqueza proximal, **fibrilação atrial** (idoso), osteoporose. Sinais de **Graves**: bócio difuso com sopro, **oftalmopatia** e **mixedema pré-tibial**. Idoso → forma **apática** (predomínio cardiovascular).

## Diagnóstico
1. **Confirmar:** **TSH↓** + **T4L e/ou T3↑** (subclínico se T4L/T3 normais).
2. **Definir a causa:**
   - **TRAb** positivo → Graves.
   - **RAIU/cintilografia:** difusa↑ = Graves; focal = adenoma tóxico; heterogênea = BMN tóxico; **baixa** = tireoidite/iodo/factícia.
   - **US com Doppler:** hipervascularização (Graves) × hipovascularização (tireoidite).
   - **Tireoglobulina baixa** sugere **factícia** (glândula suprimida, sem liberação).

## Tratamento — princípios
- **Sintomático:** **betabloqueador** (propranolol) para adrenérgicos e FC.
- **Hipertireoidismo (Graves/nodular):** **antitireoidianos** (metimazol 1ª linha; **propiltiouracil** no 1º trimestre e na crise), **radioiodo** ou **cirurgia** (ver resumos específicos).
- **Tireoidite:** **autolimitada** — betabloqueador ± AINE/corticoide; **não** usar antitireoidiano nem radioiodo.
- **Iodo/factícia:** remover a fonte.`,
  pts:[
    'Tireotoxicose = excesso de hormônio nos tecidos; hipertireoidismo = tireotoxicose por hiperfunção da glândula.',
    'Causas com RAIU alta: Graves, bócio multinodular tóxico, adenoma tóxico.',
    'Causas com RAIU baixa: tireoidites, factícia (LT4), excesso de iodo (Jod-Basedow), struma ovarii.',
    'Clínica: taquicardia, perda de peso com apetite mantido, tremor, calor; idoso → fibrilação atrial e forma apática.',
    'Sinais específicos de Graves: oftalmopatia, mixedema pré-tibial e bócio difuso com sopro.',
    'Confirmar: TSH↓ com T4L/T3↑ (subclínico se hormônios normais).',
    'TRAb+ define Graves; RAIU/cintilografia diferencia hiperfunção de tireoidite.',
    'Tireoglobulina baixa aponta tireotoxicose factícia.',
    'Betabloqueador controla sintomas adrenérgicos em qualquer causa.',
    'Tireoidite é autolimitada: NÃO usar antitireoidiano nem radioiodo.'
  ],
  mapa:{ central:'Tireotoxicose',
    nodes:[
      { label:'RAIU ALTA (hiperfunção)', children:[
        {label:'Doença de Graves', children:['+ comum','TRAb+, difusa']},
        {label:'Bócio multinodular tóxico'},
        {label:'Adenoma tóxico', children:['Captação focal']} ]},
      { label:'RAIU BAIXA', children:[
        {label:'Tireoidites', children:['Subaguda','Silenciosa/pós-parto','Amiodarona tipo 2']},
        {label:'Factícia (LT4)', children:['Tg baixa']},
        {label:'Iodo (Jod-Basedow)'},
        {label:'Struma ovarii'} ]},
      { label:'Clínica', children:['Taquicardia, perda de peso','Tremor, calor, ansiedade','FA no idoso','Forma apática (idoso)'] },
      { label:'Diagnóstico', children:['TSH↓ + T4L/T3↑','TRAb → Graves','RAIU/cintilografia','US Doppler'] },
      { label:'Tratamento', children:[
        {label:'Betabloqueador (sintomas)'},
        {label:'Hiperfunção → ATD/RAI/cirurgia'},
        {label:'Tireoidite → suporte (AINE/corticoide)'} ]}
    ]},
  flashcards:[
    {q:'Qual a diferença entre tireotoxicose e hipertireoidismo?',a:'Tireotoxicose é o excesso de hormônio tireoidiano nos tecidos por qualquer causa; hipertireoidismo é a tireotoxicose causada por hiperfunção da glândula (produção aumentada), como Graves e nódulos autônomos.'},
    {q:'Como a captação de iodo separa as causas de tireotoxicose?',a:'Captação alta indica hiperfunção (Graves difusa, adenoma tóxico focal, bócio multinodular heterogêneo); captação baixa/ausente indica tireoidite, excesso de iodo ou tireotoxicose factícia.'},
    {q:'Como diferenciar tireotoxicose factícia?',a:'Tireoglobulina baixa (glândula suprimida, sem liberação de hormônio) e captação de iodo ausente, num paciente que ingere levotiroxina exógena.'},
    {q:'Por que não se usa antitireoidiano na tireoidite?',a:'Porque a tireoidite libera hormônio pré-formado (não há hiperprodução); é autolimitada e se trata com betabloqueador e anti-inflamatório/corticoide — antitireoidiano e radioiodo não têm papel.'},
    {q:'Como costuma se apresentar a tireotoxicose no idoso?',a:'Forma apática, com predomínio de manifestações cardiovasculares como fibrilação atrial e insuficiência cardíaca, e menos sintomas adrenérgicos clássicos.'}
  ],
  fluxogramas:[{
    titulo:'Diagnóstico diferencial da tireotoxicose',
    fonte:'Síntese Endodirect (baseado em ATA)',
    nos:[
      {tipo:'inicio', texto:'TSH suprimido com T4 livre e/ou T3 elevados'},
      {tipo:'acao', texto:'Avaliar TRAb; se dúvida, captação de iodo (RAIU)/cintilografia — nunca na gestante'},
      {tipo:'decisao', texto:'TRAb positivo e/ou captação difusa aumentada?', ramos:[
        {rotulo:'SIM', tipo:'fim', texto:'Doença de Graves → antitireoidiano, radioiodo ou cirurgia'},
        {rotulo:'NÃO', tipo:'acao', texto:'Analisar o padrão de captação'} ]},
      {tipo:'decisao', texto:'Captação focal ou heterogênea (nódulos)?', ramos:[
        {rotulo:'FOCAL', tipo:'fim', texto:'Adenoma tóxico → radioiodo ou cirurgia'},
        {rotulo:'HETEROGÊNEA', tipo:'fim', texto:'Bócio multinodular tóxico → radioiodo ou cirurgia'},
        {rotulo:'CAPTAÇÃO BAIXA', tipo:'acao', texto:'Tireoidite, excesso de iodo ou factícia'} ]},
      {tipo:'fim', texto:'Captação baixa: tratar de suporte (betabloqueador ± AINE/corticoide) e remover fonte de iodo/hormônio exógeno'}
    ]
  }]
},
// 4 ─────────────────────────────────────────────────────────────────────
{
  sub:'Tireoide', privado:true, titulo:'', ano:'2026', url:'',
  tema:'Doença de Graves e Oftalmopatia',
  fonte:FONTE,
  resumo:`## Patogênese
Doença **autoimune** e causa mais comum de **hipertireoidismo**. Autoanticorpos **TRAb estimuladores** ativam o **receptor de TSH** → hiperprodução hormonal e **bócio difuso**. Predomina em **mulheres (20–50 anos)**. A tríade clássica: **hipertireoidismo + oftalmopatia + dermopatia (mixedema pré-tibial)**.

## Clínica
Tireotoxicose + **bócio difuso com sopro/frêmito**; **oftalmopatia de Graves** (proptose, retração palpebral, diplopia, quemose) em ~25–50%; **mixedema pré-tibial** e **acropaquia** (raros e específicos).

## Diagnóstico
**TSH↓ + T4L/T3↑** com **TRAb positivo**. Se necessário, **RAIU difusa aumentada** e **US com hipervascularização**. Oftalmopatia é diagnóstico clínico (± TC/RM de órbitas).

## Tratamento — 3 opções
1. **Antitireoidianos (tionamidas):** **metimazol** 1ª linha (dose única, menos hepatotóxico); **propiltiouracil (PTU)** reservado ao **1º trimestre** e à **crise tireotóxica**. Curso de **12–18 meses**; **remissão ~40–50%**. Vigiar **agranulocitose** (febre/odinofagia → suspender e hemograma) e **hepatotoxicidade**.
2. **Radioiodo (I-131):** definitivo; evolui para **hipotireoidismo** (tratado com LT4). **Contraindicado** na **gestação/lactação**; pode **piorar oftalmopatia** (usar corticoide profilático em risco); evitar em oftalmopatia moderada-grave.
3. **Tireoidectomia (total):** bócios volumosos, suspeita de malignidade, oftalmopatia grave, gestante sem controle, preferência. Requer **eutireoidismo prévio** (+ **iodeto/Lugol** pré-op para reduzir vascularização).

- **Betabloqueador** para sintomas. **Gestação:** PTU no 1º trimestre → metimazol a partir do 2º; menor dose para T4L no limite superior.

## Oftalmopatia de Graves
Autoimune, associada ao **tabagismo** (fator de risco/piora). Leve → medidas locais e **selênio**; **moderada-grave ativa → glicocorticoide IV** (pulso), ± radioterapia orbitária/**teprotumumabe**; **cirurgia de descompressão** nas sequelas/urgência (neuropatia óptica). **Parar de fumar** é essencial. Evitar radioiodo na doença ativa.`,
  pts:[
    'Graves = autoimune, causa mais comum de hipertireoidismo; TRAb estimula o receptor de TSH.',
    'Tríade: hipertireoidismo + oftalmopatia + mixedema pré-tibial; bócio difuso com sopro.',
    'Diagnóstico: TSH↓/T4L↑ com TRAb+ (RAIU difusa aumentada se preciso).',
    'Metimazol é 1ª linha; PTU só no 1º trimestre e na crise tireotóxica.',
    'Antitireoidiano por 12–18 meses; remissão ~40–50%; vigiar agranulocitose e hepatotoxicidade.',
    'Radioiodo é definitivo mas causa hipotireoidismo e pode piorar a oftalmopatia; contraindicado na gestação.',
    'Tireoidectomia total exige eutireoidismo prévio e Lugol pré-operatório.',
    'Betabloqueador controla os sintomas adrenérgicos.',
    'Oftalmopatia: tabagismo piora; moderada-grave ativa → corticoide IV (± teprotumumabe).',
    'Na gestação: PTU no 1º trimestre, depois metimazol, menor dose visando T4L no limite superior.'
  ],
  mapa:{ central:'Doença de Graves',
    nodes:[
      { label:'Patogênese', children:['Autoimune','TRAb estimula receptor TSH','Mulheres 20–50a'] },
      { label:'Clínica', children:['Tireotoxicose','Bócio difuso c/ sopro','Oftalmopatia','Mixedema pré-tibial'] },
      { label:'Diagnóstico', children:['TSH↓/T4L↑','TRAb+','RAIU difusa ↑'] },
      { label:'Tratamento', children:[
        {label:'Tionamidas', children:['Metimazol 1ª linha','PTU: 1º tri e crise','Agranulocitose/hepato']},
        {label:'Radioiodo', children:['Definitivo → hipotireoidismo','Não na gestação','Piora oftalmopatia']},
        {label:'Cirurgia', children:['Eutireoidismo prévio','Lugol pré-op']} ]},
      { label:'Oftalmopatia', children:['Tabagismo piora','Leve: selênio/local','Grave ativa: corticoide IV','Teprotumumabe / descompressão'] }
    ]},
  flashcards:[
    {q:'Qual autoanticorpo causa a Doença de Graves e o que ele faz?',a:'O TRAb estimulador, que ativa o receptor de TSH nas células foliculares, levando à hiperprodução de hormônio e ao bócio difuso.'},
    {q:'Quando usar propiltiouracil em vez de metimazol?',a:'No primeiro trimestre da gestação (metimazol tem risco teratogênico nesse período) e na crise tireotóxica; fora disso o metimazol é a primeira linha por ser mais cômodo e menos hepatotóxico.'},
    {q:'Qual efeito adverso grave das tionamidas exige suspensão imediata?',a:'A agranulocitose — diante de febre e odinofagia deve-se suspender o fármaco e colher hemograma; também vigiar hepatotoxicidade.'},
    {q:'Por que evitar radioiodo na oftalmopatia de Graves ativa?',a:'Porque pode piorar a oftalmopatia; se indicado em paciente de risco, associar corticoide profilático, e a cessação do tabagismo é essencial.'},
    {q:'Como se trata a oftalmopatia de Graves moderada a grave e ativa?',a:'Glicocorticoide intravenoso em pulsos (± radioterapia orbitária ou teprotumumabe), com descompressão cirúrgica nas sequelas ou na neuropatia óptica, sempre com cessação do tabagismo.'}
  ],
  fluxogramas:[]
},
// 5 ─────────────────────────────────────────────────────────────────────
{
  sub:'Tireoide', privado:true, titulo:'', ano:'2026', url:'',
  tema:'Nódulo Tireoidiano (TI-RADS e Bethesda)',
  fonte:FONTE,
  resumo:`## Epidemiologia
Nódulos são **muito comuns** (palpáveis em ~5%; à US em >50% dos adultos). A maioria é **benigna**; o objetivo é **identificar os malignos** (~5–10%) sem operar todos.

## Avaliação inicial
1. **TSH** em todos. Se **baixo** → **cintilografia**: nódulo **quente (hiperfuncionante)** é quase sempre **benigno** (não puncionar; tratar autonomia). TSH normal/alto → seguir com US.
2. **US com estratificação de risco (TI-RADS/ATA):** avaliar **composição** (sólido), **ecogenicidade** (hipoecoico), **forma** (mais alto que largo), **margens** (irregulares/microlobuladas), **focos ecogênicos** (**microcalcificações**). Achados suspeitos + **linfonodos** aumentam o risco.

## Indicação de PAAF (guiada por US)
Combina o **padrão de risco US** com o **tamanho**: quanto **maior a suspeita**, **menor o limiar** de tamanho para puncionar (ex.: alta suspeita ≥1 cm; muito baixa suspeita geralmente não puncionar). Priorizar sempre **linfonodos suspeitos**.

## Bethesda (citologia) e conduta
| Categoria | Significado | Risco de malignidade | Conduta |
| --- | --- | --- | --- |
| I | Não diagnóstica | — | Repetir PAAF guiada por US |
| II | Benigno | ~0–3% | Seguimento por US |
| III | Atipia de significado indeterminado (AUS) | ~10–30% | Repetir/teste molecular |
| IV | Neoplasia folicular | ~25–40% | Cirurgia (lobectomia)/molecular |
| V | Suspeito de malignidade | ~50–75% | Cirurgia |
| VI | Maligno | ~97–99% | Cirurgia |

- **Testes moleculares** ajudam a refinar categorias indeterminadas (III/IV) e evitar cirurgias desnecessárias.
- **Incidentaloma** (achado em TC/PET): PET-FDG focal tem maior risco → avaliar com US/PAAF.`,
  pts:[
    'Nódulos são comuns (>50% à US) e a maioria é benigna; ~5–10% são malignos.',
    'Dosar TSH em todos: se baixo, cintilografia — nódulo quente é quase sempre benigno e não se punciona.',
    'US estratifica risco (TI-RADS/ATA): sólido, hipoecoico, mais alto que largo, margens irregulares, microcalcificações.',
    'A indicação de PAAF combina padrão de risco US com tamanho: mais suspeito, menor o limiar.',
    'Linfonodos suspeitos são prioridade para punção.',
    'Bethesda II (benigno) → seguimento; V e VI → cirurgia.',
    'Bethesda III e IV (indeterminados) → repetir/teste molecular ou lobectomia.',
    'Bethesda I (não diagnóstica) → repetir PAAF guiada por US.',
    'Testes moleculares reduzem cirurgias desnecessárias em citologia indeterminada.',
    'Nódulo hipercaptante em PET-FDG tem maior risco de malignidade.'
  ],
  mapa:{ central:'Nódulo tireoidiano',
    nodes:[
      { label:'1º passo: TSH', children:[
        {label:'TSH baixo → cintilografia', children:['Quente = benigno','Não puncionar']},
        {label:'TSH normal/alto → US'} ]},
      { label:'US (TI-RADS)', children:[
        {label:'Sólido / hipoecoico'},
        {label:'Mais alto que largo'},
        {label:'Margens irregulares'},
        {label:'Microcalcificações'} ]},
      { label:'PAAF', children:['Risco US + tamanho','Linfonodo suspeito prioritário'] },
      { label:'Bethesda', children:[
        {label:'II benigno → seguir'},
        {label:'III/IV → repetir/molecular'},
        {label:'V/VI → cirurgia'},
        {label:'I → repetir PAAF'} ]}
    ]},
  flashcards:[
    {q:'Qual o primeiro exame na avaliação de um nódulo tireoidiano e por quê?',a:'O TSH. Se estiver baixo, faz-se cintilografia: nódulo hiperfuncionante (quente) é quase sempre benigno e não precisa de punção; se TSH normal ou alto, segue-se com ultrassom.'},
    {q:'Quais características ultrassonográficas aumentam a suspeita de malignidade?',a:'Nódulo sólido e hipoecoico, mais alto que largo, com margens irregulares/microlobuladas e microcalcificações (focos ecogênicos puntiformes), além de linfonodos suspeitos.'},
    {q:'Como se decide indicar a PAAF de um nódulo?',a:'Combinando o padrão de risco ultrassonográfico (TI-RADS/ATA) com o tamanho: quanto maior a suspeita, menor o limiar de tamanho para puncionar; linfonodos suspeitos têm prioridade.'},
    {q:'O que significam Bethesda II, V e VI e suas condutas?',a:'II = benigno (seguimento por ultrassom); V = suspeito de malignidade e VI = maligno, ambos com indicação cirúrgica.'},
    {q:'Como conduzir citologias indeterminadas (Bethesda III e IV)?',a:'Repetir a punção e/ou usar testes moleculares para refinar o risco, ou indicar lobectomia diagnóstica; os testes moleculares ajudam a evitar cirurgias desnecessárias.'}
  ],
  fluxogramas:[{
    titulo:'Abordagem do nódulo tireoidiano',
    fonte:'Síntese Endodirect (baseado em ATA 2015)',
    nos:[
      {tipo:'inicio', texto:'Nódulo tireoidiano detectado — dosar TSH'},
      {tipo:'decisao', texto:'TSH baixo (suprimido)?', ramos:[
        {rotulo:'SIM', tipo:'acao', texto:'Cintilografia: se nódulo quente → tratar autonomia, não puncionar'},
        {rotulo:'NÃO', tipo:'acao', texto:'Ultrassom com estratificação de risco (TI-RADS/ATA)'} ]},
      {tipo:'decisao', texto:'Padrão de risco + tamanho indicam PAAF?', ramos:[
        {rotulo:'NÃO', tipo:'fim', texto:'Seguimento ultrassonográfico conforme o risco'},
        {rotulo:'SIM', tipo:'acao', texto:'PAAF guiada por US → classificar por Bethesda'} ]},
      {tipo:'decisao', texto:'Resultado de Bethesda', ramos:[
        {rotulo:'II (benigno)', tipo:'fim', texto:'Seguimento por US'},
        {rotulo:'III/IV', tipo:'fim', texto:'Repetir PAAF / teste molecular / lobectomia'},
        {rotulo:'V/VI', tipo:'fim', texto:'Cirurgia (lobectomia ou tireoidectomia)'},
        {rotulo:'I', tipo:'fim', texto:'Repetir PAAF guiada por US'} ]}
    ]
  }]
},
// 6 ─────────────────────────────────────────────────────────────────────
{
  sub:'Tireoide', privado:true, titulo:'', ano:'2026', url:'',
  tema:'Bócio e Hipertireoidismo por Autonomia (BMN tóxico e adenoma tóxico)',
  fonte:FONTE,
  resumo:`## Bócio
Aumento da tireoide. **Difuso** (Graves, Hashimoto, deficiência de iodo, gestação) ou **nodular** (**bócio multinodular – BMN**). Pode ser **atóxico** (eutireóideo) ou **tóxico** (com hipertireoidismo). Grandes bócios → **sintomas compressivos** (disfagia, dispneia, rouquidão, **sinal de Pemberton** no bócio mergulhante).

## Deficiência de iodo
Causa mais comum de bócio no mundo; estimula TSH → hiperplasia → bócio → autonomia com o tempo. Iodação do sal reduziu a prevalência.

## Autonomia: BMN tóxico e adenoma tóxico
Com o tempo, nódulos desenvolvem **hiperfunção independente do TSH** (autonomia; mutações ativadoras do **receptor de TSH/GNAS**):
- **Adenoma tóxico:** **um nódulo autônomo** ("quente" na cintilografia, resto suprimido).
- **Bócio multinodular tóxico (Plummer):** **múltiplas áreas autônomas** (captação heterogênea).
- Comuns no **idoso** e após **carga de iodo (Jod-Basedow)**; frequentemente **T3-toxicose** e forma **oligossintomática/apática** (FA, IC). **TRAb negativo** e **sem oftalmopatia** (diferencia de Graves).

## Tratamento
- **Sintomático:** betabloqueador; antitireoidiano para eutireoidismo pré-tratamento definitivo (não induz remissão como no Graves — a autonomia persiste).
- **Definitivo:** **radioiodo** (bom para autonomia; menor risco de oftalmopatia que no Graves) ou **cirurgia** (bócios volumosos, compressão, suspeita de malignidade, preferência).
- **Bócio atóxico:** observar se assintomático; tratar se compressão/estético/suspeita → cirurgia (ou radioiodo para reduzir volume).`,
  pts:[
    'Bócio pode ser difuso ou nodular, atóxico (eutireóideo) ou tóxico (hipertireóideo).',
    'Deficiência de iodo é a causa mais comum de bócio no mundo.',
    'Grandes bócios causam compressão: disfagia, dispneia, rouquidão, sinal de Pemberton.',
    'Autonomia = hiperfunção independente do TSH (mutações do receptor de TSH/GNAS).',
    'Adenoma tóxico = um nódulo quente; bócio multinodular tóxico = múltiplas áreas autônomas.',
    'Autonomia é comum no idoso e após carga de iodo (Jod-Basedow); frequente T3-toxicose.',
    'TRAb negativo e ausência de oftalmopatia diferenciam a autonomia da Doença de Graves.',
    'Antitireoidiano não induz remissão na autonomia (a hiperfunção persiste).',
    'Tratamento definitivo: radioiodo ou cirurgia.',
    'Bócio atóxico assintomático: observar; tratar se compressão, estética ou suspeita.'
  ],
  mapa:{ central:'Bócio e autonomia',
    nodes:[
      { label:'Bócio', children:[
        {label:'Difuso', children:['Graves, Hashimoto','Deficiência de iodo']},
        {label:'Nodular (BMN)'},
        {label:'Compressão', children:['Disfagia/dispneia','Sinal de Pemberton']} ]},
      { label:'Autonomia', children:[
        {label:'Adenoma tóxico', children:['1 nódulo quente']},
        {label:'BMN tóxico (Plummer)', children:['Múltiplas áreas']},
        {label:'Idoso / pós-iodo', children:['Jod-Basedow','T3-toxicose']} ]},
      { label:'Diferencia de Graves', children:['TRAb NEGATIVO','Sem oftalmopatia'] },
      { label:'Tratamento', children:[
        {label:'Betabloqueador / ATD (preparo)'},
        {label:'Radioiodo (definitivo)'},
        {label:'Cirurgia (volume/compressão)'},
        {label:'ATD não dá remissão'} ]}
    ]},
  flashcards:[
    {q:'Qual a causa mais comum de bócio no mundo?',a:'A deficiência de iodo, que eleva o TSH e leva à hiperplasia e crescimento da glândula, com desenvolvimento de autonomia ao longo do tempo.'},
    {q:'O que diferencia a autonomia (adenoma/bócio tóxico) da Doença de Graves?',a:'Na autonomia o TRAb é negativo e não há oftalmopatia nem mixedema pré-tibial; a captação é focal (adenoma) ou heterogênea (bócio multinodular), e não difusa.'},
    {q:'Por que o antitireoidiano não é solução definitiva no adenoma/bócio tóxico?',a:'Porque a hiperfunção é autônoma (independe do TSH) e persiste — o antitireoidiano só prepara o paciente; o tratamento definitivo é radioiodo ou cirurgia.'},
    {q:'O que é o sinal de Pemberton?',a:'Congestão facial, pletora e turgência jugular ao elevar os braços acima da cabeça, indicando compressão do estreito torácico superior por bócio volumoso/mergulhante.'},
    {q:'O que é o fenômeno de Jod-Basedow?',a:'Hipertireoidismo desencadeado por carga de iodo (contraste, amiodarona) em glândula com áreas autônomas, típico de bócio multinodular do idoso.'}
  ],
  fluxogramas:[]
},
// 7 ─────────────────────────────────────────────────────────────────────
{
  sub:'Tireoide', privado:true, titulo:'', ano:'2026', url:'',
  tema:'Carcinoma Diferenciado de Tireoide (papilífero e folicular)',
  fonte:FONTE,
  resumo:`## Visão geral
Câncer endócrino mais comum, geralmente **bom prognóstico**. **Diferenciados (derivados do folículo):** **papilífero (~85%)** e **folicular (~10%)**.
- **Papilífero (CPT):** dissemina por **via linfática** (linfonodos cervicais); multifocal; núcleos característicos ("orphan Annie", pseudoinclusões). Fatores de risco: **radiação** cervical na infância, mutação **BRAF**.
- **Folicular (CFT):** dissemina por **via hematogênica** (pulmão/osso); diagnóstico exige **invasão capsular/vascular** (não se define na PAAF — daí Bethesda IV → cirurgia). Variante **células de Hürthle**.

## Diagnóstico e estadiamento
Via **nódulo** (ver resumo próprio). Confirmação **histológica**. Estadiamento pelo **TNM/AJCC** com peso na **idade (< 55 × ≥ 55 anos)** — idade é forte determinante prognóstico. Estratificação de **risco de recorrência (ATA:** baixo/intermediário/alto) guia a extensão do tratamento.

## Tratamento
- **Cirurgia:** **lobectomia** (tumores baixo risco ≤ 4 cm, unifocais, sem extensão/linfonodos) ou **tireoidectomia total** (tumores maiores, bilaterais, extensão extratireoidiana, linfonodos, história de radiação). **Esvaziamento** cervical se linfonodos comprometidos.
- **Radioiodo (I-131) ablativo:** para risco **intermediário/alto** após tireoidectomia total; capta em tecido residual/metástases. **Não** rotineiro no muito baixo risco.
- **Supressão de TSH com LT4:** manter TSH baixo (o TSH é trófico ao tumor) conforme o risco/resposta.

## Seguimento
- **Tireoglobulina (Tg) + anti-Tg** (marcador após tireoidectomia total ± ablação) e **US cervical**. Tg em elevação → recidiva.
- **Pesquisa de corpo inteiro (PCI) com I-131**; **"Tg+/PCI−"** → **PET-FDG** (doença desdiferenciada).
- Doença avançada refratária ao iodo → **inibidores de tirosina-quinase** (lenvatinibe, sorafenibe); terapias-alvo por mutação (**RET, NTRK, BRAF**).`,
  pts:[
    'Diferenciados: papilífero (~85%) e folicular (~10%); em geral bom prognóstico.',
    'Papilífero dissemina por via linfática (linfonodos cervicais); risco: radiação na infância, BRAF.',
    'Folicular dissemina por via hematogênica (pulmão/osso); diagnóstico exige invasão capsular/vascular.',
    'A PAAF não distingui adenoma de carcinoma folicular (por isso Bethesda IV vai à cirurgia).',
    'Estadiamento TNM valoriza muito a idade (corte em 55 anos).',
    'Cirurgia: lobectomia no baixo risco; tireoidectomia total nos maiores/bilaterais/com linfonodos.',
    'Radioiodo ablativo para risco intermediário/alto após tireoidectomia total.',
    'Supressão de TSH com levotiroxina (o TSH estimula o tumor).',
    'Seguimento com tireoglobulina (+anti-Tg) e US cervical; Tg em elevação = recidiva.',
    'Tg positiva com PCI negativa → PET-FDG; doença refratária ao iodo → inibidores de tirosina-quinase.'
  ],
  mapa:{ central:'CA diferenciado de tireoide',
    nodes:[
      { label:'Papilífero (~85%)', children:[
        {label:'Via linfática', children:['Linfonodos cervicais']},
        {label:'Radiação infância / BRAF'},
        {label:'Multifocal'} ]},
      { label:'Folicular (~10%)', children:[
        {label:'Via hematogênica', children:['Pulmão / osso']},
        'Invasão capsular/vascular','Hürthle' ]},
      { label:'Tratamento', children:[
        {label:'Cirurgia', children:['Lobectomia (baixo risco)','Tireoidectomia total']},
        {label:'Radioiodo ablativo', children:['Risco interm./alto']},
        {label:'Supressão de TSH (LT4)'} ]},
      { label:'Seguimento', children:[
        {label:'Tireoglobulina + anti-Tg'},
        {label:'US cervical'},
        {label:'PCI I-131; Tg+/PCI− → PET'},
        {label:'Refratário → TKI (lenvatinibe)'} ]}
    ]},
  flashcards:[
    {q:'Como o carcinoma papilífero e o folicular disseminam?',a:'O papilífero se dissemina preferencialmente por via linfática (linfonodos cervicais) e o folicular por via hematogênica (pulmão e osso).'},
    {q:'Por que o carcinoma folicular não é diagnosticado na PAAF?',a:'Porque o diagnóstico exige demonstração de invasão capsular ou vascular na histologia; a citologia não separa adenoma de carcinoma folicular — por isso Bethesda IV (neoplasia folicular) é encaminhado à cirurgia.'},
    {q:'Qual o papel da supressão de TSH no seguimento?',a:'O TSH é trófico para o tumor diferenciado; mantém-se o TSH baixo com levotiroxina, ajustando o grau de supressão conforme o risco e a resposta ao tratamento.'},
    {q:'Como se usa a tireoglobulina no seguimento?',a:'Após tireoidectomia total (± ablação), a tireoglobulina (dosada com anti-Tg) funciona como marcador tumoral; níveis em elevação indicam recidiva, junto com o ultrassom cervical.'},
    {q:'O que significa "Tg positiva com pesquisa de corpo inteiro negativa"?',a:'Doença que produz tireoglobulina mas não capta iodo (desdiferenciada); investiga-se com PET-FDG e, se refratária ao iodo, considera-se inibidores de tirosina-quinase.'}
  ],
  fluxogramas:[]
},
// 8 ─────────────────────────────────────────────────────────────────────
{
  sub:'Tireoide', privado:true, titulo:'', ano:'2026', url:'',
  tema:'Carcinoma Medular e Anaplásico de Tireoide',
  fonte:FONTE,
  resumo:`## Carcinoma medular de tireoide (CMT)
Origem nas **células C parafoliculares** (produzem **calcitonina**) — **não** capta iodo nem responde a TSH. **~1–2%** dos cânceres de tireoide.
- **Esporádico (~75%)** ou **hereditário (~25%)** por mutação germinativa do proto-oncogene **RET** → **NEM 2A** (CMT + feocromocitoma + hiperparatireoidismo) e **NEM 2B** (CMT + feocromocitoma + neuromas mucosos + hábito marfanoide; mais agressivo).
- **Marcadores:** **calcitonina** (diagnóstico e seguimento) e **CEA**.
- **Antes de operar:** **excluir feocromocitoma** (metanefrinas) — operar o feocromocitoma primeiro! Rastrear **RET** (e familiares).
- **Tratamento:** **tireoidectomia total + esvaziamento cervical** (não usa radioiodo). Avançado → inibidores de RET (**selpercatinibe, pralsetinibe**) / multiquinase (vandetanibe, cabozantinibe).
- **NEM 2:** **tireoidectomia profilática** em portadores de mutação RET, na infância, conforme o risco do códon.

## Carcinoma anaplásico (indiferenciado)
Um dos **tumores sólidos mais agressivos**; idoso, **crescimento cervical rápido** com sintomas compressivos (dispneia, disfagia, rouquidão). **Não** capta iodo, **não** produz Tg útil.
- **Estágio IV por definição**; prognóstico **muito ruim** (sobrevida em meses).
- **Manejo:** garantir **via aérea**; abordagem multimodal (cirurgia se ressecável + radioterapia + quimioterapia); pesquisar **BRAF V600E** → **dabrafenibe + trametinibe** (resposta significativa em subgrupo).`,
  pts:[
    'Carcinoma medular vem das células C (calcitonina); não capta iodo nem responde a TSH.',
    'Medular é esporádico (~75%) ou hereditário (~25%) por mutação RET (NEM 2A/2B).',
    'Marcadores do medular: calcitonina (diagnóstico/seguimento) e CEA.',
    'Antes de operar o medular, excluir feocromocitoma (metanefrinas) e operá-lo primeiro; rastrear RET.',
    'Tratamento do medular: tireoidectomia total + esvaziamento (sem radioiodo).',
    'Medular avançado: inibidores de RET (selpercatinibe/pralsetinibe).',
    'Portadores de RET: tireoidectomia profilática na infância conforme o risco do códon.',
    'Anaplásico: um dos tumores mais agressivos; idoso com massa cervical de crescimento rápido.',
    'Anaplásico é estágio IV por definição; prioridade é a via aérea; prognóstico muito ruim.',
    'Anaplásico com BRAF V600E responde a dabrafenibe + trametinibe.'
  ],
  mapa:{ central:'Medular e anaplásico',
    nodes:[
      { label:'Medular (células C)', children:[
        {label:'Calcitonina + CEA'},
        {label:'RET → NEM 2A / 2B'},
        {label:'Excluir feocromocitoma antes'},
        {label:'Tireoidectomia total + esvaziamento'},
        {label:'Avançado → inibidor RET'} ]},
      { label:'NEM 2', children:[
        {label:'2A: CMT+feo+hiperpara'},
        {label:'2B: +neuromas, marfanoide'},
        {label:'Tireoidectomia profilática'} ]},
      { label:'Anaplásico', children:[
        {label:'Idoso, crescimento rápido'},
        {label:'Compressão → via aérea'},
        {label:'Estágio IV, prognóstico ruim'},
        {label:'BRAF+ → dabrafenibe+trametinibe'} ]}
    ]},
  flashcards:[
    {q:'De que células vem o carcinoma medular e qual seu marcador?',a:'Das células C parafoliculares, que produzem calcitonina — o principal marcador de diagnóstico e seguimento (junto do CEA); não capta iodo nem responde a TSH.'},
    {q:'O que é imprescindível excluir antes da tireoidectomia por carcinoma medular?',a:'Feocromocitoma (dosar metanefrinas), pela associação com NEM 2 — se presente, opera-se o feocromocitoma primeiro para evitar crise hipertensiva; também se rastreia a mutação RET.'},
    {q:'Quais os componentes da NEM 2A e da NEM 2B?',a:'NEM 2A: carcinoma medular + feocromocitoma + hiperparatireoidismo. NEM 2B: carcinoma medular + feocromocitoma + neuromas mucosos e hábito marfanoide (mais agressiva).'},
    {q:'Por que o radioiodo não é usado no carcinoma medular?',a:'Porque as células C não captam iodo; o tratamento é cirúrgico (tireoidectomia total com esvaziamento) e, na doença avançada, inibidores de RET.'},
    {q:'Quais as características e a urgência no carcinoma anaplásico?',a:'É um dos tumores mais agressivos, do idoso, com massa cervical de crescimento rápido e compressão — a prioridade é garantir a via aérea; é estágio IV por definição e pode responder a dabrafenibe+trametinibe se BRAF V600E positivo.'}
  ],
  fluxogramas:[]
},
// 9 ─────────────────────────────────────────────────────────────────────
{
  sub:'Tireoide', privado:true, titulo:'', ano:'2026', url:'',
  tema:'Tireoidites',
  fonte:FONTE,
  resumo:`Grupo heterogêneo de inflamações da tireoide. Muitas cursam com uma **fase tireotóxica transitória** (liberação de hormônio pré-formado, **RAIU baixa**) seguida de **hipotireoidismo** (transitório ou definitivo) e recuperação.

## Tireoidite de Hashimoto (crônica autoimune)
Causa mais comum de **hipotireoidismo**; **anti-TPO+**; bócio firme ou atrofia. Risco aumentado de **linfoma tireoidiano** (raro). Tratar o hipotireoidismo com LT4.

## Tireoidite subaguda (De Quervain / granulomatosa)
**Dolorosa**, pós-**viral**; tireoide dolorosa à palpação, febre, **VHS/PCR muito elevados**, fase tireotóxica (RAIU baixa) → hipo → recuperação. **Autolimitada**: **AINE**; casos graves **corticoide**; betabloqueador na fase tireotóxica. **Sem** antitireoidiano.

## Tireoidite silenciosa e pós-parto (indolor, autoimune)
**Indolores**, anti-TPO+. A **pós-parto** ocorre no 1º ano após o parto: tireotoxicose → hipotireoidismo (que pode ser definitivo). Suporte; rastrear disfunção residual.

## Tireoidite aguda (supurativa)
**Infecção bacteriana** (rara), tireoide dolorosa, febre, sinais flogísticos; mais comum em imunossuprimidos/fístula do seio piriforme. Tratar com **antibiótico ± drenagem**; geralmente **eutireóidea**.

## Tireoidite de Riedel
Fibrose invasiva rara (espectro **IgG4**); tireoide **pétrea**, aderida, compressiva; pode causar hipotireoidismo/hipoparatireoidismo. Tratar com **glicocorticoide/tamoxifeno**; cirurgia para descompressão.

## Induzida por fármacos
- **Amiodarona:** **AIT tipo 1** (hiperfunção por iodo em glândula anormal → tionamida ± perclorato) × **AIT tipo 2** (tireoidite destrutiva → **corticoide**); US Doppler ajuda a diferenciar. Também causa hipotireoidismo (AIH).
- **Lítio:** hipotireoidismo/bócio.
- **Imunoterapia (inibidores de checkpoint):** tireoidite com tireotoxicose → hipotireoidismo (comum).
- **Interferon, TKI.**`,
  pts:[
    'Muitas tireoidites têm fase tireotóxica transitória (RAIU baixa) seguida de hipotireoidismo e recuperação.',
    'Hashimoto: causa mais comum de hipotireoidismo; anti-TPO+; risco (raro) de linfoma tireoidiano.',
    'Subaguda (De Quervain): dolorosa, pós-viral, VHS/PCR muito altos; trata com AINE/corticoide, sem antitireoidiano.',
    'Silenciosa e pós-parto: indolores, autoimunes; a pós-parto pode evoluir para hipotireoidismo definitivo.',
    'Aguda supurativa: infecção bacteriana, tireoide dolorosa e flogística; antibiótico ± drenagem.',
    'Riedel: fibrose pétrea invasiva (espectro IgG4), compressiva; corticoide/tamoxifeno.',
    'Amiodarona: AIT tipo 1 (iodo-induzido → tionamida) x tipo 2 (destrutiva → corticoide).',
    'Lítio causa hipotireoidismo e bócio.',
    'Imunoterapia (checkpoint) causa tireoidite frequente, evoluindo para hipotireoidismo.',
    'Na fase tireotóxica das tireoidites, o tratamento é de suporte (betabloqueador), não antitireoidiano.'
  ],
  mapa:{ central:'Tireoidites',
    nodes:[
      { label:'Autoimunes', children:[
        {label:'Hashimoto', children:['Anti-TPO+','Hipotireoidismo']},
        {label:'Silenciosa / pós-parto', children:['Indolor','Pode ficar definitiva']} ]},
      { label:'Dolorosas', children:[
        {label:'Subaguda (De Quervain)', children:['Pós-viral','VHS/PCR↑','AINE/corticoide']},
        {label:'Aguda supurativa', children:['Bacteriana','Antibiótico ± drenagem']} ]},
      { label:'Riedel', children:['Fibrose pétrea (IgG4)','Compressiva','Corticoide/tamoxifeno'] },
      { label:'Fármacos', children:[
        {label:'Amiodarona', children:['AIT1: tionamida','AIT2: corticoide']},
        {label:'Lítio (hipo/bócio)'},
        {label:'Checkpoint / interferon'} ]},
      { label:'Regra geral', children:['Fase tóxica → suporte','RAIU baixa','Sem antitireoidiano'] }
    ]},
  flashcards:[
    {q:'Qual o padrão evolutivo comum das tireoidites destrutivas?',a:'Fase tireotóxica transitória (por liberação de hormônio pré-formado, com captação de iodo baixa), seguida de hipotireoidismo (transitório ou definitivo) e, muitas vezes, recuperação.'},
    {q:'Como é a tireoidite subaguda de De Quervain e seu tratamento?',a:'Dolorosa, pós-viral, com tireoide sensível e VHS/PCR muito elevados; é autolimitada e se trata com AINE (corticoide nos casos graves) e betabloqueador na fase tireotóxica, sem antitireoidiano.'},
    {q:'Como diferenciar e tratar AIT tipo 1 e tipo 2 (amiodarona)?',a:'Tipo 1 é hiperfunção iodo-induzida em glândula anormal (bócio/autonomia) e trata-se com tionamida (± perclorato); tipo 2 é tireoidite destrutiva e trata-se com corticoide. O Doppler (vascularização) ajuda a diferenciar.'},
    {q:'Por que não usar antitireoidiano na fase tireotóxica das tireoidites?',a:'Porque não há hiperprodução — o hormônio é liberado por destrução folicular; o tratamento é de suporte (betabloqueador ± anti-inflamatório/corticoide).'},
    {q:'O que caracteriza a tireoidite pós-parto?',a:'Tireoidite autoimune indolor no primeiro ano após o parto (anti-TPO+), com fase de tireotoxicose seguida de hipotireoidismo, que pode se tornar definitivo.'}
  ],
  fluxogramas:[]
},
// 10 ────────────────────────────────────────────────────────────────────
{
  sub:'Tireoide', privado:true, titulo:'', ano:'2026', url:'',
  tema:'Tireoide e Gestação',
  fonte:FONTE,
  resumo:`## Fisiologia
Na gestação há **aumento da TBG** (estrogênio) → **T4 total↑**; o **hCG** tem atividade **TSH-like** → estimula a tireoide no 1º trimestre e **reduz o TSH** (pode ser levemente baixo, fisiológico). A necessidade de hormônio **aumenta ~30–50%**. Usar **faixas de referência por trimestre**; a demanda de **iodo** aumenta.

## Hipotireoidismo na gestação
Associado a **abortamento, pré-eclâmpsia, prematuridade e prejuízo neurocognitivo fetal**.
- **Já em uso de LT4:** **aumentar a dose ~30%** assim que confirmar a gravidez; monitorar TSH a cada 4 semanas na 1ª metade.
- **Diagnóstico novo:** tratar hipotireoidismo franco sempre; no **subclínico**, tratar se **TSH acima da referência do trimestre** (especialmente **anti-TPO+**). Alvo geral **TSH < 2,5** no 1º trimestre.
- **Hipotireoxinemia isolada:** não tratar rotineiramente.

## Hipertireoidismo na gestação
- **Tireotoxicose gestacional transitória** (hCG, associada a **hiperêmese**): autolimitada, **sem TRAb**, não usa antitireoidiano.
- **Doença de Graves:** **PTU no 1º trimestre** (menor teratogenicidade que o metimazol) → **trocar por metimazol** a partir do 2º trimestre; usar a **menor dose** mantendo T4L no **limite superior** (evitar hipotireoidismo fetal). **TRAb** no 3º trimestre (alto → risco de hipertireoidismo neonatal). **Radioiodo é contraindicado**; cirurgia se necessária, no 2º trimestre.

## Pós-parto e rastreamento
- **Tireoidite pós-parto** no 1º ano (ver Tireoidites).
- Rastrear função tireoidiana em gestantes de **risco** (doença tireoidiana/autoimune, bócio, anti-TPO+, DM1, história familiar, idade > 30, obesidade, irradiação, abortos). Suplementar **iodo** conforme recomendação local.`,
  pts:[
    'Gestação: TBG↑ (T4 total↑) e hCG TSH-like (reduz TSH no 1º trimestre — pode ser fisiológico).',
    'A necessidade de hormônio aumenta ~30–50%; usar referências por trimestre.',
    'Hipotireoidismo materno associa-se a aborto, pré-eclâmpsia, prematuridade e prejuízo neurocognitivo fetal.',
    'Quem já usa LT4 deve aumentar ~30% ao confirmar a gravidez, com TSH a cada 4 semanas.',
    'Tratar hipotireoidismo franco sempre; subclínico se TSH acima da referência do trimestre (sobretudo anti-TPO+).',
    'Alvo geral TSH < 2,5 no 1º trimestre.',
    'Tireotoxicose gestacional transitória (hiperêmese, hCG) é autolimitada e não usa antitireoidiano (TRAb negativo).',
    'Graves na gestação: PTU no 1º trimestre, depois metimazol; menor dose para T4L no limite superior.',
    'Dosar TRAb no 3º trimestre (alto → risco de hipertireoidismo neonatal); radioiodo é contraindicado.',
    'Rastrear função tireoidiana em gestantes de risco e garantir aporte de iodo.'
  ],
  mapa:{ central:'Tireoide na gestação',
    nodes:[
      { label:'Fisiologia', children:['TBG↑ → T4 total↑','hCG TSH-like → TSH↓ (1ºT)','Necessidade ↑30–50%','Referências por trimestre'] },
      { label:'Hipotireoidismo', children:[
        {label:'Riscos', children:['Aborto/pré-eclâmpsia','Prematuridade','Neuro fetal']},
        {label:'Já em LT4 → +30%'},
        {label:'Subclínico: TSH > ref. + anti-TPO'},
        {label:'Alvo TSH < 2,5 (1ºT)'} ]},
      { label:'Hipertireoidismo', children:[
        {label:'Gestacional transitória', children:['Hiperêmese','TRAb−, sem ATD']},
        {label:'Graves', children:['PTU 1ºT → metimazol','Menor dose (T4L alto normal)','TRAb 3ºT (neonatal)']} ]},
      { label:'Regras', children:['Radioiodo contraindicado','Tireoidite pós-parto','Iodo suplementar'] }
    ]},
  flashcards:[
    {q:'Por que o TSH pode estar levemente baixo no 1º trimestre?',a:'Porque o hCG tem atividade semelhante ao TSH e estimula a tireoide, reduzindo fisiologicamente o TSH; por isso usam-se faixas de referência específicas por trimestre.'},
    {q:'O que fazer com a levotiroxina de uma gestante já em tratamento?',a:'Aumentar a dose em cerca de 30% assim que a gravidez é confirmada e monitorar o TSH a cada 4 semanas na primeira metade, mirando TSH abaixo de 2,5 no 1º trimestre.'},
    {q:'Como se trata a Doença de Graves na gestação?',a:'Propiltiouracil no primeiro trimestre (metimazol é mais teratogênico nesse período), trocando para metimazol a partir do segundo; usa-se a menor dose possível mantendo o T4 livre no limite superior para não causar hipotireoidismo fetal.'},
    {q:'Por que dosar TRAb no terceiro trimestre em gestante com Graves?',a:'Porque o TRAb atravessa a placenta; níveis altos indicam risco de hipertireoidismo neonatal, exigindo vigilância do recém-nascido.'},
    {q:'O que é a tireotoxicose gestacional transitória?',a:'Hipertireoidismo leve e autolimitado do 1º trimestre causado pelo hCG, associado à hiperêmese gravídica, com TRAb negativo; não requer antitireoidiano.'}
  ],
  fluxogramas:[]
},
// 11 ────────────────────────────────────────────────────────────────────
{
  sub:'Tireoide', privado:true, titulo:'', ano:'2026', url:'',
  tema:'Emergências Tireoidianas: Crise Tireotóxica e Coma Mixedematoso',
  fonte:FONTE,
  resumo:`## Crise tireotóxica ("tempestade tireoidiana")
Exacerbação **potencialmente fatal** da tireotoxicose. **Gatilhos:** cirurgia, infecção, trauma, parto, **carga de iodo/contraste**, suspensão de antitireoidiano, radioiodo. Diagnóstico **clínico** (escala de **Burch-Wartofsky**): **febre alta**, **taquicardia/FA/IC**, **agitação/delirium/coma**, **disfunção GI-hepática** (vômito, diarreia, icterícia). Os hormônios **não** são mais altos que num hipertireoidismo comum — o que muda é a **descompensação sistêmica**.

**Tratamento (ordem importa):**
1. **Betabloqueador** (**propranolol** — controla FC e reduz conversão T4→T3).
2. **Tionamida** (**PTU** preferido: bloqueia síntese **e** conversão periférica) — **antes do iodo**.
3. **Iodo (Lugol/iodeto)** **1 hora após** a tionamida (efeito Wolff-Chaikoff; se dado antes, "alimenta" a síntese).
4. **Glicocorticoide** (hidrocortisona — reduz conversão e trata insuficiência adrenal relativa).
5. **Suporte:** resfriamento (**paracetamol**, não AAS — desloca T4 da proteína), volume, tratar o **fator precipitante**. **Colestiramina** adjuvante.

## Coma mixedematoso
Descompensação grave do **hipotireoidismo** (idoso, inverno, precipitado por **infecção, frio, sedativos, IAM**). **Hipotermia**, **alteração do nível de consciência**, **bradicardia**, **hipoventilação/hipercapnia**, **hiponatremia**, **hipoglicemia**, hipotensão. Mortalidade alta.

**Tratamento (UTI):**
1. **Levotiroxina IV** em dose de ataque (± **T3** em casos selecionados).
2. **Hidrocortisona** **antes/junto** do hormônio (excluir/tratar **insuficiência adrenal** concomitante — repor hormônio tireoidiano isolado pode precipitar crise adrenal).
3. **Suporte:** aquecimento **passivo**, ventilação, correção de **hiponatremia/hipoglicemia**, volume; tratar o **precipitante** (infecção).`,
  pts:[
    'Crise tireotóxica é diagnóstico clínico (Burch-Wartofsky), com descompensação sistêmica — os hormônios não são mais altos que no hipertireoidismo comum.',
    'Gatilhos da crise: cirurgia, infecção, parto, carga de iodo/contraste, suspensão de antitireoidiano.',
    'Sequência da crise: betabloqueador → tionamida (PTU) → iodo 1h depois → glicocorticoide → suporte.',
    'O iodo deve vir DEPOIS da tionamida (se antes, aumenta a síntese hormonal).',
    'PTU é preferido na crise por bloquear também a conversão periférica T4→T3.',
    'Resfriar com paracetamol, não AAS (o AAS desloca T4 da proteína e piora).',
    'Coma mixedematoso: hipotireoidismo grave com hipotermia, rebaixamento, bradicardia e hiponatremia.',
    'Precipitantes do coma: infecção, frio, sedativos, IAM (idoso no inverno).',
    'Tratar o coma com levotiroxina IV em ataque + suporte em UTI.',
    'Dar hidrocortisona antes/junto do hormônio tireoidiano para não precipitar crise adrenal.'
  ],
  mapa:{ central:'Emergências tireoidianas',
    nodes:[
      { label:'Crise tireotóxica', children:[
        {label:'Clínica (Burch-Wartofsky)', children:['Febre alta','Taquicardia/FA/IC','Delirium/coma','Disfunção GI-hepática']},
        {label:'Gatilhos', children:['Cirurgia/infecção/parto','Iodo/contraste']},
        {label:'Tratamento (ordem)', children:['1 Betabloqueador','2 Tionamida (PTU)','3 Iodo 1h depois','4 Glicocorticoide','5 Suporte (paracetamol)']} ]},
      { label:'Coma mixedematoso', children:[
        {label:'Clínica', children:['Hipotermia','Rebaixamento','Bradicardia/hipercapnia','Hipo-Na / hipoglicemia']},
        {label:'Precipitantes', children:['Infecção, frio','Sedativos, IAM']},
        {label:'Tratamento (UTI)', children:['Levotiroxina IV ataque','Hidrocortisona antes','Aquecer passivo, ventilar','Corrigir Na/glicose']} ]}
    ]},
  flashcards:[
    {q:'Qual a sequência correta do tratamento da crise tireotóxica?',a:'Betabloqueador (propranolol) → tionamida (PTU) → iodo (Lugol) 1 hora depois da tionamida → glicocorticoide (hidrocortisona) → suporte, tratando o fator precipitante.'},
    {q:'Por que o iodo só é dado depois da tionamida na crise?',a:'Porque, sem o bloqueio prévio da síntese pela tionamida, o iodo serviria de substrato e aumentaria a produção hormonal; após a tionamida, o iodo bloqueia a liberação (efeito Wolff-Chaikoff).'},
    {q:'Por que se prefere propiltiouracil na crise tireotóxica?',a:'Porque, além de bloquear a síntese, o PTU inibe a conversão periférica de T4 em T3, útil na descompensação aguda; também se usa hidrocortisona, que reduz essa conversão.'},
    {q:'Quais achados caracterizam o coma mixedematoso?',a:'Hipotermia, rebaixamento do nível de consciência, bradicardia, hipoventilação com hipercapnia, hiponatremia e hipoglicemia, geralmente em idoso hipotireóideo precipitado por infecção, frio, sedativos ou IAM.'},
    {q:'Por que dar hidrocortisona antes da levotiroxina no coma mixedematoso?',a:'Porque pode haver insuficiência adrenal concomitante; repor apenas o hormônio tireoidiano aumentaria o metabolismo e poderia precipitar uma crise adrenal.'}
  ],
  fluxogramas:[{
    titulo:'Crise tireotóxica: sequência de tratamento',
    fonte:'Síntese Endodirect (baseado em ATA)',
    nos:[
      {tipo:'inicio', texto:'Tireotoxicose com descompensação sistêmica (febre, taquiarritmia, delirium) — escore de Burch-Wartofsky'},
      {tipo:'acao', texto:'1) Betabloqueador (propranolol) para frequência e sintomas adrenérgicos'},
      {tipo:'acao', texto:'2) Tionamida — propiltiouracil (bloqueia síntese e conversão T4→T3)'},
      {tipo:'acao', texto:'3) Iodo (Lugol/iodeto) 1 hora APÓS a tionamida'},
      {tipo:'acao', texto:'4) Glicocorticoide (hidrocortisona) — reduz conversão e cobre insuficiência adrenal'},
      {tipo:'fim', texto:'5) Suporte: resfriar com paracetamol (não AAS), volume, tratar o precipitante (infecção); considerar colestiramina'}
    ]
  }]
}
];

// ── Geração do SQL (append em payload->'diretrizes') ──
const fs=require('fs');
function mkSql(arr){
  const json=JSON.stringify(arr);
  if(json.indexOf('$j$')>=0)throw new Error('conteúdo contém $j$');
  return `UPDATE endodirect_global_state\n`+
  `SET payload = jsonb_set(payload, '{diretrizes}', coalesce(payload->'diretrizes','[]'::jsonb) || $j$${json}$j$::jsonb)\n`+
  `WHERE payload ? 'diretrizes';`;
}
// Lotes de 4 para inserir com chamadas menores
const batches=[RESUMOS.slice(0,4),RESUMOS.slice(4,8),RESUMOS.slice(8)];
batches.forEach((b,i)=>{ fs.writeFileSync(__dirname+'/insert'+(i+1)+'.sql', mkSql(b)); });
fs.writeFileSync(__dirname+'/insert.sql', mkSql(RESUMOS));
console.log('Lotes:', batches.map(b=>b.length).join('+'), '=', RESUMOS.length);
console.log('Resumos:', RESUMOS.length);
console.log('Temas:'); RESUMOS.forEach((r,i)=>console.log('  '+(i+1)+'. '+r.tema+'  [pts:'+r.pts.length+' fc:'+r.flashcards.length+' flux:'+r.fluxogramas.length+' mapa-nós:'+r.mapa.nodes.length+']'));
console.log('SQL bytes (total):', fs.statSync(__dirname+'/insert.sql').size);
