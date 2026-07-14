// Resumos de Endocrinologia Feminina (privados) — síntese própria (não reproduz
// livros); cobertura Vilar 8ed/Williams/Greenspan/SPEED + diretrizes. Cada um:
// resumo md (com tabela) + 10 pts + mapa 3 níveis + 5 flashcards + fluxograma
// fiel ao algoritmo da diretriz. fonte distinta → chave de merge nova (sem clobber).
const FONTE='Síntese Endodirect · Vilar 8ed + Williams/Greenspan + diretrizes';
const R=[

// 1 ─ Síndrome dos ovários policísticos ─────────────────────────────────────
{ sub:'Endocrinologia Feminina', privado:true, titulo:'', ano:'2026', url:'',
  tema:'Síndrome dos Ovários Policísticos (SOP)', fonte:FONTE,
  resumo:`## Conceito
Distúrbio endócrino-metabólico mais comum da mulher em idade reprodutiva, marcado por **hiperandrogenismo**, **disfunção ovulatória** e **morfologia ovariana policística**, frequentemente associado a **resistência à insulina** e risco cardiometabólico.

## Diagnóstico (critérios de Rotterdam)
Exige **2 de 3** critérios, **após excluir outras causas**:
1. **Hiperandrogenismo** clínico (hirsutismo, acne, alopecia) ou bioquímico (testosterona/androgênios livres elevados).
2. **Oligo/anovulação** (ciclos irregulares).
3. **Ovários policísticos à ultrassonografia** (≥ 20 folículos por ovário e/ou volume ≥ 10 mL — usar o corte atualizado com aparelhos de alta resolução).
> Em adolescentes, **não** usar a ultrassonografia isolada; exigir hiperandrogenismo + irregularidade menstrual persistente.

## Exclusão de diferenciais
Antes de firmar SOP, afastar: **hiperplasia adrenal congênita não clássica (17-OH-progesterona)**, **hiperprolactinemia**, **disfunção tireoidiana (TSH)**, **síndrome de Cushing** e **tumores androgênicos** (androgênios muito elevados/virilização rápida).

## Comorbidades a rastrear
**Intolerância à glicose/diabetes** (TOTG/HbA1c), **dislipidemia**, obesidade, **apneia do sono**, esteatose hepática, **risco de hiperplasia/câncer de endométrio** (por anovulação crônica) e transtornos do humor.

## Tratamento (dirigido ao objetivo)
- **Sem desejo de gestar / controle menstrual e hiperandrogenismo:** **contraceptivo hormonal combinado** (1ª linha); antiandrogênio (espironolactona) associado se hirsutismo persistir.
- **Resistência insulínica / metabólico:** **estilo de vida** (base do tratamento) + **metformina** (sobretudo se intolerância à glicose).
- **Desejo de engravidar:** indução de ovulação — **letrozol (1ª linha)**, alternativa clomifeno; gonadotrofinas/segunda linha conforme o caso.
- **Proteção endometrial** em quem não usa contraceptivo: progestagênio cíclico.

## 📊 Tratamento conforme o objetivo
| Objetivo | 1ª linha | Complemento |
| --- | --- | --- |
| Ciclo + hiperandrogenismo | Contraceptivo combinado | Espironolactona |
| Metabólico | Estilo de vida | Metformina |
| Engravidar | Letrozol | Clomifeno / gonadotrofinas |
| Proteger endométrio | Progestagênio cíclico | Contraceptivo combinado |`,
  pts:[
    'SOP é o distúrbio endócrino mais comum da mulher em idade reprodutiva, com base em resistência à insulina.',
    'Diagnóstico de Rotterdam: 2 de 3 — hiperandrogenismo, oligo/anovulação e ovários policísticos ao ultrassom.',
    'O diagnóstico é de exclusão: afastar HAC não clássica, prolactina, tireoide, Cushing e tumor androgênico.',
    'Em adolescentes não usar a ultrassonografia isolada; exigir hiperandrogenismo + irregularidade persistente.',
    'Rastrear comorbidades: intolerância à glicose/diabetes, dislipidemia, apneia, esteatose e humor.',
    'A anovulação crônica aumenta o risco de hiperplasia e câncer de endométrio.',
    'Estilo de vida é a base do tratamento em todas as pacientes.',
    'Sem desejo de gestar: contraceptivo combinado é 1ª linha; associar espironolactona se hirsutismo.',
    'Componente metabólico: metformina, sobretudo com intolerância à glicose.',
    'Desejo de engravidar: letrozol é a 1ª linha para indução de ovulação (alternativa clomifeno).'],
  mapa:{ central:'SOP', nodes:[
    {label:'Critérios (Rotterdam 2 de 3)', children:[
      {label:'Hiperandrogenismo'},{label:'Oligo/anovulação'},{label:'Ovário policístico (US)'}]},
    {label:'Excluir', children:['HAC não clássica (17-OHP)','Prolactina, TSH','Cushing, tumor androgênico']},
    {label:'Comorbidades', children:[
      {label:'Metabólicas',children:['Intolerância à glicose','Dislipidemia, apneia']},
      {label:'Endométrio (anovulação)'}]},
    {label:'Tratamento por objetivo', children:[
      {label:'Ciclo/hiperandrogenismo → contraceptivo ± espironolactona'},
      {label:'Metabólico → estilo de vida + metformina'},
      {label:'Engravidar → letrozol'}]}]},
  flashcards:[
    {q:'Quais são os critérios de Rotterdam para SOP?',a:'Presença de 2 de 3: hiperandrogenismo (clínico ou laboratorial), oligo/anovulação e ovários policísticos à ultrassonografia — sempre após excluir outras causas.'},
    {q:'Por que o diagnóstico de SOP é de exclusão e o que se afasta?',a:'Porque outras doenças mimetizam o quadro: hiperplasia adrenal congênita não clássica (17-OH-progesterona), hiperprolactinemia, disfunção tireoidiana, síndrome de Cushing e tumores produtores de androgênios.'},
    {q:'Qual a particularidade do diagnóstico de SOP na adolescente?',a:'Não se usa a ultrassonografia isoladamente (ovários multifoliculares são comuns na idade); exige-se hiperandrogenismo associado a irregularidade menstrual persistente.'},
    {q:'Qual a primeira linha para induzir ovulação na SOP?',a:'O letrozol (inibidor da aromatase), superior ao clomifeno em taxa de nascidos vivos; gonadotrofinas ficam como segunda linha em casos selecionados.'},
    {q:'Por que a SOP aumenta o risco de câncer de endométrio?',a:'Porque a anovulação crônica expõe o endométrio a estrogênio sem oposição da progesterona, favorecendo hiperplasia — daí a importância da proteção endometrial (contraceptivo ou progestagênio cíclico).'}],
  fluxogramas:[{ titulo:'Diagnóstico e manejo da SOP', fonte:'Algoritmo baseado na Diretriz Internacional Baseada em Evidências para SOP (2023) e critérios de Rotterdam, adaptado ao português', nos:[
    {tipo:'inicio', texto:'Irregularidade menstrual e/ou hiperandrogenismo → afastar diferenciais (17-OHP, prolactina, TSH, Cushing)'},
    {tipo:'decisao', texto:'Preenche 2 de 3 critérios de Rotterdam (após exclusão)?', ramos:[
      {rotulo:'NÃO', tipo:'fim', texto:'SOP não confirmada — investigar/tratar a causa específica'},
      {rotulo:'SIM', tipo:'acao', texto:'SOP confirmada → rastrear metabólico (TOTG/HbA1c, lipídeos) e iniciar estilo de vida'} ]},
    {tipo:'decisao', texto:'Deseja engravidar?', ramos:[
      {rotulo:'SIM', tipo:'fim', texto:'Indução de ovulação com letrozol (1ª linha) ± metformina'},
      {rotulo:'NÃO', tipo:'fim', texto:'Contraceptivo combinado (± espironolactona se hirsutismo); metformina se metabólico'} ]}
  ]}]
},

// 2 ─ Hirsutismo e hiperandrogenismo ────────────────────────────────────────
{ sub:'Endocrinologia Feminina', privado:true, titulo:'', ano:'2026', url:'',
  tema:'Hirsutismo e Hiperandrogenismo', fonte:FONTE,
  resumo:`## Conceito
**Hirsutismo** = pelo terminal com padrão masculino na mulher (buço, mento, tórax, abdome), quantificado pela **escala de Ferriman-Gallwey** (≥ 8 na maioria das populações). Reflete **excesso de androgênios** ou ↑ sensibilidade do folículo. Diferenciar de **hipertricose** (pelo velo difuso, não androgênico).

## Sinais de alarme (androgenização grave)
**Início abrupto**, progressão rápida, **virilização** (clitoromegalia, engrossamento da voz, calvície, ↑massa muscular) → sugerem **tumor** (ovariano ou adrenal) ou **hiperplasia adrenal** — androgênios muito elevados.

## Causas
- **SOP** (a mais comum, ~80%).
- **Hiperplasia adrenal congênita não clássica** (deficiência de 21-hidroxilase; 17-OH-progesterona elevada).
- **Hirsutismo idiopático** (androgênios normais, ciclos regulares).
- **Tumores** virilizantes ovarianos/adrenais; **síndrome de Cushing**; **hiperprolactinemia**; fármacos.

## Avaliação
- **Testosterona total** (e livre); se **muito elevada** → imagem (tumor).
- **17-OH-progesterona** matinal (fase folicular) para HAC não clássica.
- **Prolactina, TSH**, e rastreio de Cushing se suspeita.
- **DHEAS** elevado aponta origem adrenal.

## Tratamento
- **Contraceptivo hormonal combinado** — 1ª linha (↓androgênios ovarianos e ↑SHBG).
- **Antiandrogênio** (**espironolactona**) associado se resposta insuficiente após ~6 meses; exige contracepção (risco de feminização de feto masculino).
- **Medidas cosméticas/depilação** (efeito hormonal demora — o ciclo do pelo leva meses).
- **HAC não clássica:** glicocorticoide em dose baixa em casos selecionados.

## 📊 Origem do hiperandrogenismo
| Pista | Origem provável | Exame-chave |
| --- | --- | --- |
| Ciclos irregulares, US policístico | Ovariana (SOP) | Testosterona |
| 17-OHP elevada | Adrenal (HAC não clássica) | 17-OH-progesterona |
| DHEAS muito alto, virilização | Tumor adrenal | Imagem adrenal |
| Testosterona muito alta, rápida | Tumor ovariano | Imagem/US pélvico |`,
  pts:[
    'Hirsutismo é pelo terminal em padrão masculino na mulher, quantificado por Ferriman-Gallwey (≥ 8).',
    'Diferenciar de hipertricose (pelo velo difuso, não androgênico).',
    'Início abrupto, progressão rápida e virilização sugerem tumor ou hiperplasia adrenal.',
    'A causa mais comum de hirsutismo é a SOP (~80%).',
    'Afastar hiperplasia adrenal congênita não clássica com 17-OH-progesterona matinal.',
    'Testosterona muito elevada indica imagem para excluir tumor virilizante.',
    'DHEAS elevado aponta origem adrenal do excesso androgênico.',
    'Contraceptivo hormonal combinado é a 1ª linha do tratamento.',
    'Espironolactona (antiandrogênio) é associada se resposta insuficiente, sempre com contracepção.',
    'O efeito hormonal sobre o pelo demora meses; medidas cosméticas complementam.'],
  mapa:{ central:'Hirsutismo', nodes:[
    {label:'Definição', children:['Ferriman-Gallwey ≥ 8','vs hipertricose (velo)']},
    {label:'Alarme (virilização)', children:['Início abrupto/rápido','Clitoromegalia, voz','→ tumor / HAC']},
    {label:'Causas', children:[
      {label:'SOP (+ comum)'},{label:'HAC não clássica (17-OHP)'},
      {label:'Idiopático'},{label:'Tumor / Cushing / prolactina'}]},
    {label:'Avaliação', children:['Testosterona (± livre)','17-OHP matinal','DHEAS, prolactina, TSH']},
    {label:'Tratamento', children:[
      {label:'Contraceptivo combinado (1ª)'},
      {label:'Espironolactona (associar)'},
      {label:'Cosmético / depilação'}]}]},
  flashcards:[
    {q:'O que é a escala de Ferriman-Gallwey e para que serve?',a:'É um escore visual que gradua a distribuição de pelo terminal em 9 áreas corporais; um valor ≥ 8 (na maioria das populações) define hirsutismo e permite acompanhar a resposta ao tratamento.'},
    {q:'Quais achados no hirsutismo levantam suspeita de tumor androgênico?',a:'Início abrupto, progressão rápida e sinais de virilização (clitoromegalia, engrossamento da voz, calvície, aumento de massa muscular), geralmente com testosterona muito elevada — indicando imagem ovariana/adrenal.'},
    {q:'Como se rastreia a hiperplasia adrenal congênita não clássica no hirsutismo?',a:'Dosando a 17-OH-progesterona pela manhã na fase folicular; se elevada, confirma-se com teste de estímulo com ACTH.'},
    {q:'Qual a primeira linha e o adjuvante no tratamento do hirsutismo?',a:'A primeira linha é o contraceptivo hormonal combinado (reduz androgênios ovarianos e aumenta a SHBG); associa-se espironolactona (antiandrogênio) quando a resposta é insuficiente após cerca de 6 meses.'},
    {q:'Por que a espironolactona exige contracepção eficaz?',a:'Porque, sendo antiandrogênio, pode prejudicar a diferenciação genital (feminização) de um feto masculino em caso de gravidez.'}],
  fluxogramas:[{ titulo:'Avaliação do hirsutismo', fonte:'Algoritmo baseado na Endocrine Society Clinical Practice Guideline (hirsutismo, 2018), adaptado ao português', nos:[
    {tipo:'inicio', texto:'Hirsutismo (Ferriman-Gallwey ≥ 8) → dosar testosterona total; avaliar ciclos e velocidade de instalação'},
    {tipo:'decisao', texto:'Testosterona muito elevada e/ou virilização rápida?', ramos:[
      {rotulo:'SIM', tipo:'fim', texto:'Suspeita de tumor → imagem ovariana/adrenal e encaminhamento'},
      {rotulo:'NÃO', tipo:'acao', texto:'Dosar 17-OHP matinal, prolactina, TSH (± Cushing)'} ]},
    {tipo:'decisao', texto:'17-OHP elevada?', ramos:[
      {rotulo:'SIM', tipo:'fim', texto:'HAC não clássica → contraceptivo ± glicocorticoide baixo'},
      {rotulo:'NÃO', tipo:'fim', texto:'SOP ou idiopático → contraceptivo combinado ± espironolactona'} ]}
  ]}]
},

// 3 ─ Amenorreia ────────────────────────────────────────────────────────────
{ sub:'Endocrinologia Feminina', privado:true, titulo:'', ano:'2026', url:'',
  tema:'Amenorreia', fonte:FONTE,
  resumo:`## Definições
- **Primária:** ausência de menarca aos **15 anos** com caracteres sexuais secundários, ou aos **13 anos** sem qualquer desenvolvimento puberal.
- **Secundária:** interrupção da menstruação por **≥ 3 ciclos** ou **≥ 6 meses** em mulher previamente menstruada.
> **Sempre excluir gravidez** primeiro (β-hCG).

## Abordagem por compartimento
1. **Hipotálamo (central, hipogonadismo hipogonadotrófico):** amenorreia hipotalâmica funcional (**perda de peso, exercício extremo, estresse**), Kallmann, doença infiltrativa. LH/FSH **baixos**.
2. **Hipófise:** **hiperprolactinemia** (causa comum e tratável), tumor/dano hipofisário, **Sheehan**.
3. **Ovário (hipogonadismo hipergonadotrófico):** **insuficiência ovariana prematura**, disgenesia (**Turner**). FSH **elevado**.
4. **Trato de saída (útero/vagina):** **síndrome de Asherman** (sinequias pós-curetagem), agenesia mülleriana, hímen imperfurado.

## Roteiro diagnóstico (secundária)
- **β-hCG** → **prolactina, TSH, FSH/LH, estradiol**; considerar androgênios se hiperandrogenismo.
- **FSH alto** → causa ovariana (repetir; cariótipo se jovem).
- **FSH/LH baixos ou normais** → central (RM de hipófise se prolactina alta ou sintomas de massa); avaliar amenorreia hipotalâmica funcional (diagnóstico de exclusão).
- **Teste do progestagênio / avaliação do trato de saída** quando se suspeita de causa uterina.

## Tratamento
- **Tratar a causa** (repor peso, tratar prolactinoma, corrigir tireoide, lise de sinequias).
- **Estrogênio–progestagênio** para hipoestrogenismo (proteção óssea) quando não há contraindicação.
- **Amenorreia hipotalâmica funcional:** recuperar balanço energético; abordagem multidisciplinar.

## 📊 Localização pelo eixo hormonal
| FSH/LH | Estradiol | Compartimento | Exemplos |
| --- | --- | --- | --- |
| Baixos/normais | Baixo | Central (hipotálamo/hipófise) | Funcional, prolactinoma, Sheehan |
| Elevados | Baixo | Ovário | Insuficiência ovariana, Turner |
| Normais | Normal | Trato de saída/útero | Asherman, agenesia mülleriana |`,
  pts:[
    'Amenorreia primária: sem menarca aos 15 anos (com caracteres) ou aos 13 sem desenvolvimento puberal.',
    'Amenorreia secundária: parada por ≥ 3 ciclos ou ≥ 6 meses em quem já menstruava.',
    'Sempre excluir gravidez (β-hCG) antes de qualquer investigação.',
    'Avalia-se por compartimentos: hipotálamo, hipófise, ovário e trato de saída.',
    'Central (LH/FSH baixos): amenorreia hipotalâmica funcional, hiperprolactinemia, Sheehan, Kallmann.',
    'Ovariana (FSH elevado): insuficiência ovariana prematura e disgenesias (Turner).',
    'Trato de saída: síndrome de Asherman, agenesia mülleriana, hímen imperfurado.',
    'Exames iniciais: β-hCG, prolactina, TSH, FSH/LH e estradiol.',
    'Prolactina alta ou sintomas de massa indicam RM de hipófise.',
    'Tratamento é da causa; repor estrogênio no hipoestrogenismo para proteção óssea.'],
  mapa:{ central:'Amenorreia', nodes:[
    {label:'Definir/excluir', children:['Primária vs secundária','Excluir gravidez (β-hCG)']},
    {label:'Central (LH/FSH baixo)', children:[
      {label:'Hipotalâmica funcional',children:['Peso, exercício, estresse']},
      {label:'Hiperprolactinemia'},{label:'Sheehan / Kallmann'}]},
    {label:'Ovariana (FSH alto)', children:['Insuficiência ovariana prematura','Turner (cariótipo)']},
    {label:'Trato de saída', children:['Asherman','Agenesia mülleriana']},
    {label:'Conduta', children:['Tratar a causa','Estrogênio se hipoestrogênica']}]},
  flashcards:[
    {q:'Como se definem amenorreia primária e secundária?',a:'Primária: ausência de menarca aos 15 anos com caracteres sexuais presentes (ou aos 13 sem qualquer desenvolvimento puberal). Secundária: interrupção da menstruação por ≥ 3 ciclos ou ≥ 6 meses em mulher previamente menstruada.'},
    {q:'Qual o primeiro exame obrigatório na investigação de amenorreia?',a:'O β-hCG, para excluir gravidez — a causa mais comum de amenorreia secundária — antes de qualquer outra propedêutica.'},
    {q:'Como o FSH ajuda a localizar a causa da amenorreia?',a:'FSH baixo ou normal indica causa central (hipotálamo/hipófise); FSH elevado indica falência ovariana (insuficiência ovariana prematura, disgenesias); com FSH e estradiol normais, pensa-se em causa do trato de saída.'},
    {q:'O que caracteriza a amenorreia hipotalâmica funcional?',a:'É um hipogonadismo hipogonadotrófico (LH/FSH baixos) por déficit energético — perda de peso, exercício extenuante ou estresse —, sendo um diagnóstico de exclusão tratado com recuperação do balanço energético.'},
    {q:'O que é a síndrome de Asherman?',a:'Sinequias (aderências) intrauterinas, geralmente pós-curetagem ou infecção, que causam amenorreia por causa uterina, com eixo hormonal normal; o tratamento é a lise histeroscópica das aderências.'}],
  fluxogramas:[{ titulo:'Investigação da amenorreia secundária', fonte:'Algoritmo baseado em revisões e consensos de endocrinologia reprodutiva, adaptado ao português', nos:[
    {tipo:'inicio', texto:'Amenorreia secundária → β-hCG'},
    {tipo:'decisao', texto:'β-hCG positivo?', ramos:[
      {rotulo:'SIM', tipo:'fim', texto:'Gravidez — conduzir pré-natal'},
      {rotulo:'NÃO', tipo:'acao', texto:'Dosar prolactina, TSH, FSH/LH e estradiol'} ]},
    {tipo:'decisao', texto:'Prolactina alta ou TSH alterado?', ramos:[
      {rotulo:'SIM', tipo:'fim', texto:'Tratar hiperprolactinemia (RM se necessário) / disfunção tireoidiana'},
      {rotulo:'NÃO', tipo:'acao', texto:'Interpretar FSH: alto = ovariana; baixo/normal = central; normal com trato suspeito = uterina'} ]},
    {tipo:'fim', texto:'Tratar a causa; repor estrogênio–progestagênio se hipoestrogenismo'}
  ]}]
},

// 4 ─ Insuficiência ovariana prematura ──────────────────────────────────────
{ sub:'Endocrinologia Feminina', privado:true, titulo:'', ano:'2026', url:'',
  tema:'Insuficiência Ovariana Prematura (IOP)', fonte:FONTE,
  resumo:`## Conceito
Perda da função ovariana **antes dos 40 anos**, com **amenorreia/oligomenorreia** e **hipogonadismo hipergonadotrófico** (FSH elevado, estradiol baixo). Não é sinônimo de menopausa: a função pode ser **flutuante** e há chance (~5–10%) de **gravidez espontânea**.

## Diagnóstico
- **Oligo/amenorreia ≥ 4 meses** + **FSH elevado (faixa menopausal) em 2 dosagens** com pelo menos 4 semanas de intervalo, antes dos 40 anos.
- Estradiol baixo; AMH baixo apoia, mas não define.

## Etiologia (investigar)
- **Genética:** **síndrome de Turner (45,X)**, **pré-mutação do FMR1 (X frágil)** — pesquisar em todas.
- **Autoimune:** ooforite autoimune, frequentemente no contexto de **síndrome poliglandular** (rastrear **adrenal/21-hidroxilase, tireoide, glicemia**).
- **Iatrogênica:** quimioterapia, radioterapia, cirurgia ovariana.
- **Idiopática** (maioria).

## Consequências e rastreio associado
Sintomas de hipoestrogenismo (fogachos, secura vaginal), **↓densidade óssea**, risco **cardiovascular** aumentado e impacto na fertilidade e no humor. Rastrear **tireoide e adrenal** (autoimunidade), cariótipo e FMR1.

## Tratamento
- **Terapia hormonal (estrogênio + progestagênio) até a idade média da menopausa (~50–51 anos)** — não é opcional: previne osteoporose e protege o sistema cardiovascular (esquemas com doses maiores que na menopausa fisiológica).
- **Progestagênio** para proteção endometrial em quem tem útero.
- **Fertilidade:** aconselhamento; **doação de oócitos** é a via mais efetiva; contracepção se não deseja gestar (pela chance residual de ovulação).
- Suporte psicológico e saúde óssea.

## 📊 IOP × menopausa fisiológica
| Aspecto | IOP | Menopausa |
| --- | --- | --- |
| Idade | < 40 anos | ~50 anos |
| Função ovariana | Flutuante | Cessada |
| Gravidez espontânea | Possível (~5–10%) | Não |
| Terapia hormonal | Indicada até ~50 anos | Individualizada por sintomas/risco |
| Investigação etiológica | Cariótipo, FMR1, autoimune | Não necessária |`,
  pts:[
    'IOP é a perda da função ovariana antes dos 40 anos, com FSH elevado e estradiol baixo.',
    'Difere da menopausa: a função pode flutuar e há chance de gravidez espontânea (~5–10%).',
    'Diagnóstico: oligo/amenorreia ≥ 4 meses + FSH menopausal em duas dosagens antes dos 40 anos.',
    'Investigar cariótipo (Turner) e pré-mutação do FMR1 (X frágil) em todas.',
    'Rastrear autoimunidade associada: adrenal (21-hidroxilase), tireoide e glicemia.',
    'Causas ainda incluem quimio/radioterapia, cirurgia e forma idiopática (maioria).',
    'Consequências: hipoestrogenismo, perda óssea e risco cardiovascular aumentado.',
    'Terapia hormonal é indicada até a idade média da menopausa (~50 anos), não é opcional.',
    'Mulher com útero precisa de progestagênio para proteção endometrial.',
    'Fertilidade: a doação de oócitos é a via mais efetiva; usar contracepção se não deseja gestar.'],
  mapa:{ central:'Insuficiência ovariana prematura', nodes:[
    {label:'Diagnóstico', children:['< 40 anos','Oligo/amenorreia ≥ 4 meses','FSH menopausal 2×']},
    {label:'Etiologia', children:[
      {label:'Genética',children:['Turner (45,X)','Pré-mutação FMR1']},
      {label:'Autoimune (poliglandular)'},
      {label:'Iatrogênica (QT/RT)'},{label:'Idiopática'}]},
    {label:'Rastreio associado', children:['Cariótipo, FMR1','Tireoide, adrenal','Densidade óssea']},
    {label:'Tratamento', children:[
      {label:'Terapia hormonal até ~50 anos'},
      {label:'Progestagênio se útero'},
      {label:'Fertilidade → doação de oócitos'}]}]},
  flashcards:[
    {q:'Como se define e confirma a insuficiência ovariana prematura?',a:'Perda de função ovariana antes dos 40 anos: oligo/amenorreia por ≥ 4 meses associada a FSH em faixa menopausal em duas dosagens (intervalo ≥ 4 semanas), com estradiol baixo.'},
    {q:'Por que a IOP não é igual à menopausa precoce em termos de fertilidade?',a:'Porque a função ovariana na IOP é intermitente/flutuante, havendo cerca de 5–10% de chance de ovulação e gravidez espontânea — por isso indica-se contracepção quando não se deseja gestar.'},
    {q:'Quais investigações genéticas e autoimunes são obrigatórias na IOP?',a:'Cariótipo (síndrome de Turner) e pré-mutação do FMR1 (X frágil); e rastreio autoimune de adrenal (anti-21-hidroxilase), tireoide e glicemia, pela associação com síndrome poliglandular.'},
    {q:'Por que a terapia hormonal é mandatória na IOP até cerca dos 50 anos?',a:'Porque o hipoestrogenismo precoce e prolongado aumenta o risco de osteoporose e de doença cardiovascular; a reposição até a idade média da menopausa previne essas complicações.'},
    {q:'Qual a opção mais efetiva para gestação na IOP?',a:'A doação de oócitos (fertilização in vitro com óvulos de doadora), já que a reserva ovariana própria está esgotada ou muito reduzida.'}],
  fluxogramas:[{ titulo:'Diagnóstico e manejo da IOP', fonte:'Algoritmo baseado na ESHRE Guideline on Premature Ovarian Insufficiency (2016), adaptado ao português', nos:[
    {tipo:'inicio', texto:'Mulher < 40 anos com oligo/amenorreia ≥ 4 meses → dosar FSH e estradiol'},
    {tipo:'decisao', texto:'FSH em faixa menopausal em 2 dosagens (≥ 4 semanas)?', ramos:[
      {rotulo:'NÃO', tipo:'fim', texto:'IOP não confirmada — investigar outras causas de amenorreia'},
      {rotulo:'SIM', tipo:'acao', texto:'IOP confirmada → cariótipo, FMR1 e rastreio autoimune (adrenal, tireoide)'} ]},
    {tipo:'acao', texto:'Iniciar terapia hormonal (estrogênio + progestagênio se útero) até ~50 anos; cuidar da saúde óssea'},
    {tipo:'decisao', texto:'Deseja gestar?', ramos:[
      {rotulo:'SIM', tipo:'fim', texto:'Aconselhamento reprodutivo → doação de oócitos'},
      {rotulo:'NÃO', tipo:'fim', texto:'Contracepção (chance residual de ovulação) + manter terapia hormonal'} ]}
  ]}]
},

// 5 ─ Menopausa e terapia hormonal ──────────────────────────────────────────
{ sub:'Endocrinologia Feminina', privado:true, titulo:'', ano:'2026', url:'',
  tema:'Menopausa e Terapia Hormonal', fonte:FONTE,
  resumo:`## Conceito
**Menopausa** = cessação permanente da menstruação por **12 meses**, por depleção folicular (idade média ~51 anos); diagnóstico **clínico** (não requer dosagens na idade típica). A **transição (perimenopausa)** cursa com ciclos irregulares e sintomas.

## Manifestações
- **Vasomotoras** (fogachos, sudorese) — as mais características.
- **Geniturinárias** (secura vaginal, dispareunia, urgência) = **síndrome geniturinária da menopausa**.
- **Ósseas** (aceleração da perda → osteoporose), sono, humor, cardiometabólicas.

## Terapia hormonal (TH) — princípios
- **Melhor indicação: sintomas vasomotores moderados a graves** e síndrome geniturinária; também previne perda óssea.
- **Estrogênio + progestagênio** se **útero presente** (o progestagênio protege o endométrio); **estrogênio isolado** se **histerectomizada**.
- **Sintomas geniturinários isolados:** **estrogênio vaginal em baixa dose** (mínima absorção sistêmica).
- **Janela de oportunidade:** benefício favorável quando iniciada **< 60 anos** ou **< 10 anos de menopausa**; usar menor dose eficaz, reavaliar periodicamente.

## Contraindicações / cautela
Câncer de mama, **tromboembolismo/TVP prévios**, doença coronariana/AVC, hepatopatia ativa, sangramento vaginal não esclarecido. A **via transdérmica** tem menor risco trombótico (preferível em risco vascular/enxaqueca).

## Alternativas não hormonais (quando TH é contraindicada)
**ISRS/IRSN** (paroxetina, venlafaxina), **gabapentina**, e agentes mais novos para fogachos; medidas de estilo de vida. Para saúde óssea, agentes específicos conforme risco.

## 📊 Escolha da terapia hormonal
| Situação | Esquema |
| --- | --- |
| Útero presente | Estrogênio + progestagênio |
| Histerectomizada | Estrogênio isolado |
| Só sintoma geniturinário | Estrogênio vaginal em baixa dose |
| Risco trombótico/enxaqueca | Preferir estrogênio transdérmico |
| Contraindicação à TH | ISRS/IRSN, gabapentina |`,
  pts:[
    'Menopausa é a ausência de menstruação por 12 meses; diagnóstico clínico na idade típica (~51 anos).',
    'A perimenopausa cursa com ciclos irregulares e início dos sintomas.',
    'Sintomas vasomotores (fogachos) são a manifestação mais característica.',
    'A síndrome geniturinária inclui secura vaginal, dispareunia e sintomas urinários.',
    'Melhor indicação da terapia hormonal: sintomas vasomotores moderados a graves.',
    'Com útero presente, associa-se progestagênio ao estrogênio para proteger o endométrio.',
    'Histerectomizada pode usar estrogênio isolado.',
    'Sintoma geniturinário isolado responde a estrogênio vaginal em baixa dose.',
    'Janela de oportunidade: iniciar < 60 anos ou < 10 anos de menopausa, com menor dose eficaz.',
    'Contraindicações incluem câncer de mama e tromboembolismo; via transdérmica tem menor risco trombótico.'],
  mapa:{ central:'Menopausa e TH', nodes:[
    {label:'Definição', children:['12 meses sem menstruar','Clínico (~51 anos)']},
    {label:'Sintomas', children:['Vasomotores (fogachos)','Geniturinários','Ósseos / humor']},
    {label:'Terapia hormonal', children:[
      {label:'Útero → estrogênio + progestagênio'},
      {label:'Histerectomizada → estrogênio só'},
      {label:'Geniturinário → estrogênio vaginal'}]},
    {label:'Segurança', children:[
      {label:'Janela < 60a / < 10a'},
      {label:'Transdérmico se risco vascular'},
      {label:'Contraindicações',children:['CA mama','TVP/coronariana']}]},
    {label:'Não hormonal', children:['ISRS/IRSN','Gabapentina']}]},
  flashcards:[
    {q:'Como se define menopausa e como é o diagnóstico na idade típica?',a:'É a cessação permanente da menstruação confirmada após 12 meses de amenorreia; na idade habitual (~50 anos) o diagnóstico é clínico, sem necessidade de dosagens hormonais.'},
    {q:'Quando se associa progestagênio ao estrogênio na terapia hormonal?',a:'Sempre que a mulher tem útero, pois o progestagênio protege o endométrio contra a hiperplasia e o câncer induzidos pelo estrogênio sem oposição; a histerectomizada pode usar estrogênio isolado.'},
    {q:'O que é a janela de oportunidade da terapia hormonal?',a:'O período em que o balanço risco-benefício é favorável: início antes dos 60 anos ou dentro de 10 anos do início da menopausa, com menor dose eficaz e reavaliação periódica.'},
    {q:'Qual a conduta quando há apenas sintomas geniturinários?',a:'Estrogênio vaginal em baixa dose, que trata a secura e a dispareunia com absorção sistêmica mínima, não exigindo progestagênio associado.'},
    {q:'Quais alternativas não hormonais existem para os fogachos?',a:'Inibidores da recaptação de serotonina/noradrenalina (paroxetina, venlafaxina), gabapentina e novos agentes específicos, além de medidas de estilo de vida — úteis quando a terapia hormonal é contraindicada.'}],
  fluxogramas:[{ titulo:'Decisão da terapia hormonal na menopausa', fonte:'Algoritmo baseado no Position Statement de terapia hormonal da The Menopause Society (NAMS, 2022), adaptado ao português', nos:[
    {tipo:'inicio', texto:'Sintomas de menopausa incomodativos → avaliar tipo (vasomotor × geniturinário) e contraindicações'},
    {tipo:'decisao', texto:'Há contraindicação à terapia hormonal (CA mama, TVP, coronariana)?', ramos:[
      {rotulo:'SIM', tipo:'fim', texto:'Opções não hormonais (ISRS/IRSN, gabapentina); estrogênio vaginal pode ser considerado se só geniturinário'},
      {rotulo:'NÃO', tipo:'acao', texto:'Dentro da janela (< 60 anos / < 10 anos)? Escolher esquema'} ]},
    {tipo:'decisao', texto:'Sintoma apenas geniturinário?', ramos:[
      {rotulo:'SIM', tipo:'fim', texto:'Estrogênio vaginal em baixa dose'},
      {rotulo:'NÃO', tipo:'fim', texto:'TH sistêmica: com útero → estrogênio + progestagênio; sem útero → estrogênio isolado (transdérmico se risco vascular)'} ]}
  ]}]
},

// 6 ─ Infertilidade feminina e anovulação ───────────────────────────────────
{ sub:'Endocrinologia Feminina', privado:true, titulo:'', ano:'2026', url:'',
  tema:'Infertilidade Feminina e Anovulação', fonte:FONTE,
  resumo:`## Conceito
**Infertilidade** = ausência de gravidez após **12 meses** de relações regulares sem contracepção (**6 meses se ≥ 35 anos** ou fator de risco conhecido). Avaliação **do casal** e em paralelo.

## Avaliação da mulher (três eixos)
1. **Ovulação:** história de ciclos regulares; **progesterona na fase lútea** confirma ovulação.
2. **Reserva ovariana:** **AMH** e contagem de folículos antrais; FSH/estradiol no início do ciclo (idade é o fator prognóstico dominante).
3. **Fator tuboperitoneal/uterino:** **histerossalpingografia** (permeabilidade tubária) e avaliação uterina (US/histeroscopia).

## Causas ovulatórias (classificação da OMS)
- **Grupo I — hipogonadotrófico** (hipotalâmico/hipofisário; LH/FSH baixos): amenorreia hipotalâmica funcional → **gonadotrofinas** (ou GnRH pulsátil).
- **Grupo II — normogonadotrófico** (o mais comum; **SOP**): **letrozol** 1ª linha para indução.
- **Grupo III — hipergonadotrófico** (falência ovariana; FSH alto): resposta pobre → **doação de oócitos**.
- **Hiperprolactinemia:** corrigir com **agonista dopaminérgico** restaura a ovulação.

## Tratamento por causa
- **Anovulação por SOP:** estilo de vida + **letrozol** (alternativa clomifeno); gonadotrofinas/2ª linha.
- **Hipotalâmica:** recuperar balanço energético; **gonadotrofinas** se necessário.
- **Fator tubário:** cirurgia selecionada ou **FIV**.
- **Idade avançada/baixa reserva:** FIV; **doação de oócitos** se reserva esgotada.
- Corrigir **tireoide e prolactina** sempre (otimizam a fertilidade).

## 📊 Anovulação (grupos da OMS)
| Grupo | Eixo | Protótipo | Conduta |
| --- | --- | --- | --- |
| I | LH/FSH baixos | Hipotalâmica funcional | Balanço energético; gonadotrofinas/GnRH |
| II | Normogonadotrófico | SOP | Letrozol (1ª linha) |
| III | FSH elevado | Falência ovariana | Doação de oócitos |
| — | Prolactina alta | Prolactinoma | Agonista dopaminérgico |`,
  pts:[
    'Infertilidade: sem gravidez após 12 meses (6 meses se ≥ 35 anos ou fator de risco).',
    'A avaliação é do casal e em paralelo.',
    'A mulher é avaliada em três eixos: ovulação, reserva ovariana e fator tuboperitoneal/uterino.',
    'A progesterona na fase lútea confirma que houve ovulação.',
    'Reserva ovariana: AMH e contagem de folículos antrais; a idade é o fator prognóstico dominante.',
    'Histerossalpingografia avalia a permeabilidade tubária.',
    'OMS grupo I (LH/FSH baixos): hipotalâmica → gonadotrofinas/GnRH pulsátil.',
    'OMS grupo II (normogonadotrófico, SOP): letrozol é a 1ª linha para induzir ovulação.',
    'OMS grupo III (FSH alto, falência ovariana): doação de oócitos.',
    'Corrigir tireoide e hiperprolactinemia sempre otimiza a fertilidade.'],
  mapa:{ central:'Infertilidade feminina', nodes:[
    {label:'Definição', children:['12 meses (6 se ≥ 35a)','Avaliar o casal']},
    {label:'Três eixos', children:[
      {label:'Ovulação',children:['Progesterona lútea']},
      {label:'Reserva ovariana',children:['AMH, folículos antrais','Idade']},
      {label:'Tubo/útero',children:['Histerossalpingografia']}]},
    {label:'Anovulação (OMS)', children:[
      {label:'I — hipotalâmica (LH/FSH baixo)'},
      {label:'II — SOP (normogonadotrófico)'},
      {label:'III — falência ovariana (FSH alto)'},
      {label:'Prolactina alta'}]},
    {label:'Tratamento', children:[
      {label:'SOP → letrozol'},
      {label:'Hipotalâmica → gonadotrofinas'},
      {label:'Falência → doação de oócitos'},
      {label:'Corrigir tireoide/prolactina'}]}]},
  flashcards:[
    {q:'Quando se define infertilidade e quando antecipar a investigação?',a:'Após 12 meses de relações regulares sem contracepção sem gravidez; antecipa-se para 6 meses quando a mulher tem 35 anos ou mais, ou há fator de risco conhecido (ciclos ausentes, doença tubária, etc.).'},
    {q:'Quais são os três eixos da avaliação feminina da infertilidade?',a:'Ovulação (progesterona na fase lútea), reserva ovariana (AMH e contagem de folículos antrais, com a idade como principal preditor) e fator tuboperitoneal/uterino (histerossalpingografia e avaliação uterina).'},
    {q:'Como se classifica a anovulação pela OMS e qual o protótipo de cada grupo?',a:'Grupo I hipogonadotrófico (hipotalâmica funcional), grupo II normogonadotrófico (SOP, o mais comum) e grupo III hipergonadotrófico (falência ovariana); a hiperprolactinemia é uma causa à parte.'},
    {q:'Qual o tratamento de indução de ovulação na SOP e na causa hipotalâmica?',a:'Na SOP, letrozol como primeira linha (alternativa clomifeno); na anovulação hipotalâmica (grupo I), recuperação do balanço energético e, se necessário, gonadotrofinas ou GnRH pulsátil.'},
    {q:'O que oferecer quando a reserva ovariana está esgotada (grupo III)?',a:'A doação de oócitos por fertilização in vitro, já que a indução de ovulação é ineficaz na falência ovariana.'}],
  fluxogramas:[{ titulo:'Abordagem da anovulação/infertilidade feminina', fonte:'Algoritmo baseado na classificação da anovulação da OMS e em consensos de reprodução, adaptado ao português', nos:[
    {tipo:'inicio', texto:'Infertilidade (12 meses; 6 se ≥ 35a) → avaliar ovulação, reserva ovariana e trato genital; corrigir TSH/prolactina'},
    {tipo:'decisao', texto:'Há anovulação?', ramos:[
      {rotulo:'NÃO', tipo:'fim', texto:'Investigar fator tubário/uterino e masculino → cirurgia/FIV conforme achado'},
      {rotulo:'SIM', tipo:'acao', texto:'Classificar pelo eixo (LH/FSH e estradiol)'} ]},
    {tipo:'decisao', texto:'Qual grupo da OMS?', ramos:[
      {rotulo:'II (SOP)', tipo:'fim', texto:'Estilo de vida + letrozol (1ª linha)'},
      {rotulo:'I (hipotalâmica)', tipo:'fim', texto:'Balanço energético; gonadotrofinas/GnRH pulsátil'},
      {rotulo:'III (falência)', tipo:'fim', texto:'Doação de oócitos'} ]}
  ]}]
}
];

// ── SQL (2 lotes) ──
const fs=require('fs');
function mkSql(arr){const j=JSON.stringify(arr);if(j.indexOf('$j$')>=0)throw new Error('$j$');return `UPDATE endodirect_global_state\nSET payload = jsonb_set(payload, '{diretrizes}', coalesce(payload->'diretrizes','[]'::jsonb) || $j$${j}$j$::jsonb)\nWHERE payload ? 'diretrizes';`;}
const b1=R.slice(0,3), b2=R.slice(3);
fs.writeFileSync(__dirname+'/fem1.sql', mkSql(b1));
fs.writeFileSync(__dirname+'/fem2.sql', mkSql(b2));
R.forEach(r=>{ (r.resumo.split('\n').filter(l=>l.trim().startsWith('|'))).forEach(l=>{ l.split('|').slice(1,-1).forEach(c=>{ if(c.trim()==='')throw new Error('célula vazia em '+r.tema); }); }); });
console.log('Feminina:', R.length, 'resumos | lotes', b1.length+'+'+b2.length);
R.forEach((r,i)=>console.log('  '+(i+1)+'.', r.tema, '[pts '+r.pts.length+' fc '+r.flashcards.length+' flux '+r.fluxogramas.length+']'));
