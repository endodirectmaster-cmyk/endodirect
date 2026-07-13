// Resumos de Neuroendocrinologia (privados) — síntese própria (não reproduz
// livros); cobertura Vilar 8ed/Williams/Melmed + consensos Pituitary Society/
// Endocrine Society/ESE. Cada um: resumo md (com tabela) + pts + mapa 3 níveis
// + flashcards + fluxograma. fonte distinta → chave de merge nova (sem clobber).
const FONTE='Síntese Endodirect · Vilar 8ed + Williams/Melmed + Pituitary Society/Endocrine Society';
const R=[
// 1 ─ Hipopituitarismo ─────────────────────────────────────────────────────
{ sub:'Neuroendocrinologia', privado:true, titulo:'', ano:'2026', url:'',
  tema:'Hipopituitarismo', fonte:FONTE,
  resumo:`## Conceito e causas
Deficiência de **um ou mais hormônios** da adeno-hipófise (pan-hipopituitarismo = todos). Causas: **tumores selares** (adenoma, craniofaringioma) e seu tratamento (**cirurgia/radioterapia**), **apoplexia**, **Sheehan** (necrose pós-parto), **hipofisite** (autoimune ou por imunoterapia), doenças infiltrativas (sarcoidose, hemocromatose, histiocitose), TCE, infecções, genético.

## Ordem de perda e quadro clínico
A perda costuma seguir a sequência **GH → LH/FSH → TSH → ACTH** (o **eixo corticotrófico é o mais crítico**, por risco de crise adrenal). Manifestações por eixo:
- **GH:** fadiga, ↓massa muscular, dislipidemia (adulto); baixa estatura (criança).
- **LH/FSH (hipogonadismo central):** amenorreia, disfunção erétil, ↓libido, infertilidade.
- **TSH (central):** hipotireoidismo com **T4 livre baixo e TSH baixo/normal**.
- **ACTH (central):** insuficiência adrenal **sem** hipercalemia nem hiperpigmentação (aldosterona preservada).
- **Prolactina:** ↓ na maioria; **↑ discreta** se compressão de haste (perda da inibição dopaminérgica).

## Diagnóstico
- **Dosar hormônio-alvo + trófico juntos:** T4L com TSH; cortisol 8h (± estímulo/ACTH) com ACTH; testosterona/estradiol com LH/FSH; IGF-1 (± testes de estímulo para GH). Um **hormônio-alvo baixo com trófico inapropriadamente normal/baixo** = origem central.
- **RM de hipófise** para a causa estrutural.

## Tratamento
- **Repor cada eixo deficiente.** **Regra de ouro: repor glicocorticoide ANTES da levotiroxina** — iniciar T4 antes pode precipitar crise adrenal. Sequência: hidrocortisona → levotiroxina → esteroides sexuais → GH (se indicado).
- **Doses de estresse** de glicocorticoide e educação, como em qualquer insuficiência adrenal.

## 📊 Deficiências centrais × laboratório
| Eixo | Hormônio-alvo | Trófico | Reposição |
| --- | --- | --- | --- |
| Corticotrófico | Cortisol baixo | ACTH baixo/normal | Hidrocortisona (1º) |
| Tireotrófico | T4 livre baixo | TSH baixo/normal | Levotiroxina (após corticoide) |
| Gonadotrófico | Testosterona/estradiol baixo | LH/FSH baixo/normal | Esteroides sexuais |
| Somatotrófico | IGF-1 baixo | GH baixo | GH (se indicado) |`,
  pts:[
    'Hipopituitarismo é a deficiência de um ou mais hormônios da adeno-hipófise.',
    'Causas comuns: tumores selares e seu tratamento (cirurgia/RT), apoplexia, Sheehan, hipofisite, infiltrativas.',
    'A perda costuma seguir GH → LH/FSH → TSH → ACTH.',
    'O eixo corticotrófico é o mais crítico pelo risco de crise adrenal.',
    'Hipotireoidismo central: T4 livre baixo com TSH baixo ou inapropriadamente normal.',
    'Insuficiência adrenal central: sem hipercalemia e sem hiperpigmentação (aldosterona preservada).',
    'Compressão de haste pode elevar discretamente a prolactina (perda da inibição dopaminérgica).',
    'Diagnóstico: dosar o hormônio-alvo junto com o trófico; alvo baixo + trófico não elevado = central.',
    'Repor glicocorticoide ANTES da levotiroxina para não precipitar crise adrenal.',
    'Educar sobre doses de estresse; RM de hipófise busca a causa estrutural.'
  ],
  mapa:{ central:'Hipopituitarismo',
    nodes:[
      { label:'Causas', children:[
        {label:'Tumor selar / tratamento'},
        {label:'Apoplexia / Sheehan'},
        {label:'Hipofisite (autoimune/imunoterapia)'},
        {label:'Infiltrativa / TCE / genética'} ]},
      { label:'Eixos (ordem de perda)', children:[
        {label:'GH → IGF-1 baixo'},
        {label:'LH/FSH → hipogonadismo'},
        {label:'TSH → T4L baixo, TSH não alto'},
        {label:'ACTH → insuf. adrenal central'} ]},
      { label:'Diagnóstico', children:['Alvo + trófico juntos','Trófico não elevado = central','RM de hipófise'] },
      { label:'Tratamento', children:[
        {label:'Glicocorticoide 1º'},
        {label:'Levotiroxina depois'},
        {label:'Esteroides sexuais'},
        {label:'GH se indicado'},
        {label:'Doses de estresse'} ]}
    ]},
  flashcards:[
    {q:'Por que se repõe glicocorticoide antes da levotiroxina no hipopituitarismo?',a:'Porque iniciar levotiroxina isoladamente acelera o metabolismo do cortisol e aumenta a demanda, podendo precipitar crise adrenal em quem tem deficiência de ACTH; por isso repõe-se o glicocorticoide primeiro.'},
    {q:'Como se caracteriza o hipotireoidismo central no laboratório?',a:'T4 livre baixo com TSH baixo ou inapropriadamente normal — ao contrário do primário, em que o TSH está elevado.'},
    {q:'Qual a ordem habitual de perda dos eixos hipofisários?',a:'GH primeiro, depois gonadotrofinas (LH/FSH), em seguida TSH e por fim ACTH; o eixo corticotrófico é o mais crítico pelo risco de crise adrenal.'},
    {q:'Por que a prolactina pode estar elevada em uma lesão selar com hipopituitarismo?',a:'Porque a compressão da haste hipofisária interrompe a chegada da dopamina inibitória, elevando discretamente a prolactina (efeito haste), diferente do prolactinoma, em que a elevação costuma ser bem maior.'},
    {q:'Como se diferencia a insuficiência adrenal central da primária?',a:'Na central o ACTH é baixo/normal, a aldosterona é preservada (sem hipercalemia) e não há hiperpigmentação; na primária o ACTH é alto, há deficiência de aldosterona e hiperpigmentação.'}
  ],
  fluxogramas:[{ titulo:'Investigação do hipopituitarismo', fonte:'Síntese Endodirect (baseado em Endocrine Society)', nos:[
    {tipo:'inicio', texto:'Suspeita (doença selar, sintomas de deficiência hormonal) → dosar cada eixo (alvo + trófico) e RM'},
    {tipo:'decisao', texto:'Hormônio-alvo baixo com trófico não elevado (padrão central)?', ramos:[
      {rotulo:'NÃO', tipo:'fim', texto:'Eixo preservado — reavaliar/monitorar conforme a causa'},
      {rotulo:'SIM', tipo:'acao', texto:'Confirmar deficiência (testes de estímulo se necessário) e repor'} ]},
    {tipo:'acao', texto:'Repor na ordem: glicocorticoide → levotiroxina → esteroides sexuais → GH (se indicado)'},
    {tipo:'fim', texto:'Educar sobre doses de estresse; tratar/seguir a causa estrutural (RM)'}
  ]}]
},
// 2 ─ Hiperprolactinemia e prolactinoma ────────────────────────────────────
{ sub:'Neuroendocrinologia', privado:true, titulo:'', ano:'2026', url:'',
  tema:'Hiperprolactinemia e Prolactinoma', fonte:FONTE,
  resumo:`## Causas
A **prolactina** é regulada por **inibição tônica da dopamina**. Hiperprolactinemia por:
- **Fisiológica:** gestação, lactação, estresse, exercício, sono.
- **Farmacológica** (muito comum): **antipsicóticos** (risperidona), **metoclopramida/domperidona**, antidepressivos, opioides, verapamil, estrogênio.
- **Patológica:** **prolactinoma** (causa tumoral mais comum), **efeito haste** (qualquer massa selar que interrompe a dopamina — eleva a PRL geralmente **< 100–150 ng/mL**), hipotireoidismo primário (TRH↑), doença renal/hepática.

## Quadro clínico
Mulher: **galactorreia**, **amenorreia/oligomenorreia**, infertilidade. Homem: **↓libido, disfunção erétil**, infertilidade, ginecomastia (diagnóstico costuma ser mais tardio → macroadenomas). Massa: cefaleia, **hemianopsia bitemporal**, hipopituitarismo.

## Diagnóstico
- **Prolactina** (basal, sem garroteamento/estresse). **Nível orienta:** **> 250 ng/mL** sugere fortemente prolactinoma; valores moderados podem ser fármaco/haste.
- Excluir gravidez, hipotireoidismo, fármacos e insuficiência renal. **Efeito gancho (hook):** macroprolactinoma volumoso pode dar PRL falsamente baixa → **repetir diluído**. **Macroprolactina** (agregado biologicamente inativo) explica hiperPRL assintomática.
- **RM de hipófise** se descartadas causas secundárias.

## Tratamento
- **Agonistas dopaminérgicos são a 1ª linha**, mesmo em macroadenomas (reduzem PRL e tumor): **cabergolina** (preferida, mais eficaz e melhor tolerada) > bromocriptina (preferida na gestação por mais dados).
- **Cirurgia transesfenoidal** se: intolerância/resistência ao fármaco, apoplexia, preferência, ou compressão que não regride. Radioterapia é reservada.
- Microprolactinoma assintomático pode ser apenas acompanhado.

## 📊 Interpretação da prolactina
| Nível de PRL | Interpretação provável |
| --- | --- |
| Leve (< 100 ng/mL) | Fármaco, efeito haste, fisiológica |
| Moderada (100–250) | Avaliar caso (micro, fármaco) |
| Alta (> 250 ng/mL) | Prolactinoma provável |
| Baixa com macroadenoma | Suspeitar efeito gancho → repetir diluído |`,
  pts:[
    'A prolactina é regulada pela inibição dopaminérgica; perder essa inibição eleva a PRL.',
    'Causas: fisiológicas, fármacos (antipsicóticos, metoclopramida), prolactinoma, efeito haste, hipotireoidismo.',
    'Prolactinoma é a causa tumoral mais comum; PRL > 250 ng/mL sugere fortemente prolactinoma.',
    'Efeito haste (massa não-prolactinoma) costuma elevar a PRL de forma modesta (< 100–150).',
    'Clínica: galactorreia/amenorreia na mulher; hipogonadismo na mulher e no homem.',
    'Excluir gravidez, hipotireoidismo, fármacos e insuficiência renal antes de imagem.',
    'Efeito gancho: macroprolactinoma pode dar PRL falsamente baixa — repetir a amostra diluída.',
    'Macroprolactina explica hiperprolactinemia assintomática (agregado inativo).',
    'Tratamento de 1ª linha é o agonista dopaminérgico (cabergolina), mesmo em macroadenomas.',
    'Cirurgia transesfenoidal se resistência/intolerância, apoplexia ou compressão persistente.'
  ],
  mapa:{ central:'Hiperprolactinemia',
    nodes:[
      { label:'Causas', children:[
        {label:'Fisiológica (gravidez, estresse)'},
        {label:'Fármacos', children:['Antipsicóticos','Metoclopramida']},
        {label:'Prolactinoma (PRL > 250)'},
        {label:'Efeito haste (PRL < 100–150)'},
        {label:'Hipotireoidismo / renal'} ]},
      { label:'Clínica', children:['Galactorreia','Amenorreia / hipogonadismo','↓libido, DE (homem)','Massa: campo visual'] },
      { label:'Diagnóstico', children:[
        {label:'PRL basal'},
        {label:'Excluir gravidez/fármaco/TSH'},
        {label:'Efeito gancho → diluir'},
        {label:'RM de hipófise'} ]},
      { label:'Tratamento', children:[
        {label:'Agonista dopaminérgico (1ª linha)', children:['Cabergolina','Bromocriptina (gestação)']},
        {label:'Cirurgia se resistência/apoplexia'},
        {label:'Micro assintomático: observar'} ]}
    ]},
  flashcards:[
    {q:'Qual o tratamento de primeira linha do prolactinoma, mesmo quando macroadenoma?',a:'Os agonistas dopaminérgicos (cabergolina de preferência; bromocriptina na gestação), que reduzem tanto a prolactina quanto o volume tumoral — a cirurgia fica para resistência, intolerância, apoplexia ou compressão persistente.'},
    {q:'O que é o efeito gancho (hook) na dosagem de prolactina?',a:'Em macroprolactinomas com PRL muito elevada, o excesso de antígeno satura o ensaio e resulta em valor falsamente baixo; suspeita-se diante de grande massa selar com PRL desproporcionalmente baixa e confirma-se repetindo a amostra diluída.'},
    {q:'Como diferenciar prolactinoma de efeito haste pelo nível de prolactina?',a:'Prolactina acima de ~250 ng/mL sugere fortemente prolactinoma, enquanto o efeito haste (compressão por outra massa que interrompe a dopamina) costuma elevar a PRL de forma modesta, geralmente abaixo de 100–150 ng/mL.'},
    {q:'Que causas secundárias devem ser excluídas antes de atribuir a hiperprolactinemia a um tumor?',a:'Gravidez, uso de fármacos (antipsicóticos, metoclopramida, antidepressivos, opioides), hipotireoidismo primário e insuficiência renal/hepática.'},
    {q:'O que é a macroprolactina?',a:'Um agregado de prolactina (frequentemente ligado a IgG) biologicamente inativo que eleva o valor medido sem causar sintomas — deve ser pesquisado em hiperprolactinemia assintomática para evitar investigação e tratamento desnecessários.'}
  ],
  fluxogramas:[{ titulo:'Investigação da hiperprolactinemia', fonte:'Síntese Endodirect (baseado em Endocrine Society)', nos:[
    {tipo:'inicio', texto:'PRL elevada confirmada → excluir gravidez, fármacos, hipotireoidismo e insuficiência renal'},
    {tipo:'decisao', texto:'Causa secundária identificada?', ramos:[
      {rotulo:'SIM', tipo:'fim', texto:'Tratar/retirar a causa (ajustar fármaco, tratar hipotireoidismo) e reavaliar'},
      {rotulo:'NÃO', tipo:'acao', texto:'RM de hipófise (atenção ao efeito gancho: diluir se macroadenoma com PRL baixa)'} ]},
    {tipo:'decisao', texto:'Prolactinoma na RM?', ramos:[
      {rotulo:'SIM', tipo:'fim', texto:'Agonista dopaminérgico (cabergolina); cirurgia se resistência/intolerância/apoplexia'},
      {rotulo:'NÃO (massa não-prolactinoma)', tipo:'fim', texto:'Considerar efeito haste; conduzir conforme a lesão selar'} ]}
  ]}]
},
// 3 ─ Acromegalia ──────────────────────────────────────────────────────────
{ sub:'Neuroendocrinologia', privado:true, titulo:'', ano:'2026', url:'',
  tema:'Acromegalia', fonte:FONTE,
  resumo:`## Conceito
Excesso de **GH** (quase sempre por **adenoma hipofisário somatotrófico**) → **IGF-1↑**. Antes do fechamento das epífises causa **gigantismo**; no adulto, **acromegalia**. Raro: secreção ectópica de GHRH.

## Quadro clínico
Instalação **insidiosa** (anos): **crescimento de extremidades** (mãos, pés — troca de anel/calçado), **prognatismo** e alargamento de traços faciais, **macroglossia**, espessamento de partes moles, **sudorese**, artralgia, **síndrome do túnel do carpo**, apneia do sono. **Comorbidades**: **HAS, diabetes/intolerância à glicose**, cardiomiopatia, **pólipos/câncer de cólon**, bócio. Massa: cefaleia, alteração campimétrica, hipopituitarismo. Aumento de mortalidade cardiovascular se não tratada.

## Diagnóstico
- **IGF-1** elevado para idade/sexo = melhor rastreio (não usar GH isolado, que é pulsátil).
- **Confirmação: GH não suprime durante o TOTG** (GH não cai abaixo do limite após 75 g de glicose).
- **RM de hipófise** para localizar o adenoma; avaliar demais eixos, campo visual, cólon e coração.

## Tratamento
- **Cirurgia transesfenoidal é a 1ª linha** (potencialmente curativa, sobretudo microadenoma).
- **Doença persistente/inoperável — fármacos:** **análogos de somatostatina** (octreotida/lanreotida; pasireotida), **antagonista do receptor de GH (pegvisomanto)** — normaliza IGF-1, e **agonista dopaminérgico** (cabergolina) em casos leves.
- **Radioterapia** adjuvante em casos refratários. **Meta:** normalizar **IGF-1** e **GH**, controlar massa e comorbidades.

## 📊 Passos diagnósticos e terapêuticos
| Etapa | Conduta |
| --- | --- |
| Rastreio | IGF-1 elevado para idade/sexo |
| Confirmação | GH não suprime no TOTG |
| Localização | RM de hipófise |
| 1ª linha | Cirurgia transesfenoidal |
| Persistência | Análogo de somatostatina / pegvisomanto / cabergolina; RT |`,
  pts:[
    'Acromegalia decorre de excesso de GH, quase sempre por adenoma hipofisário somatotrófico, elevando o IGF-1.',
    'Antes do fechamento epifisário causa gigantismo; no adulto, acromegalia.',
    'Clínica insidiosa: crescimento de extremidades, prognatismo, macroglossia, sudorese, túnel do carpo.',
    'Comorbidades: hipertensão, diabetes, cardiomiopatia, apneia do sono, pólipos/câncer de cólon.',
    'Rastreio pelo IGF-1 (não pelo GH isolado, que é pulsátil).',
    'Confirmação: ausência de supressão do GH durante o TOTG.',
    'RM de hipófise localiza o adenoma; avaliar campo visual e demais eixos.',
    'Cirurgia transesfenoidal é a primeira linha, potencialmente curativa.',
    'Doença persistente: análogos de somatostatina, pegvisomanto (antagonista do GH), cabergolina; RT adjuvante.',
    'A meta é normalizar IGF-1 e GH e controlar massa e comorbidades, reduzindo a mortalidade.'
  ],
  mapa:{ central:'Acromegalia',
    nodes:[
      { label:'Causa', children:[
        {label:'Adenoma somatotrófico → GH↑'},
        {label:'IGF-1↑'},
        {label:'Ectópico GHRH (raro)'} ]},
      { label:'Clínica', children:[
        {label:'Extremidades / prognatismo'},
        {label:'Macroglossia, sudorese, túnel do carpo'},
        {label:'Comorbidades', children:['HAS, diabetes','Cólon, apneia, coração']} ]},
      { label:'Diagnóstico', children:[
        {label:'IGF-1 (rastreio)'},
        {label:'GH não suprime no TOTG'},
        {label:'RM de hipófise'} ]},
      { label:'Tratamento', children:[
        {label:'Cirurgia transesfenoidal (1ª)'},
        {label:'Fármacos', children:['Somatostatina','Pegvisomanto','Cabergolina']},
        {label:'Radioterapia (refratário)'} ]}
    ]},
  flashcards:[
    {q:'Qual o melhor exame de rastreio da acromegalia e por que não usar o GH isolado?',a:'A dosagem de IGF-1 (ajustada para idade e sexo), porque reflete a produção integrada de GH; o GH isolado é pulsátil e pode estar normal ou elevado sem doença, sendo inadequado para rastreio.'},
    {q:'Como se confirma o diagnóstico de acromegalia?',a:'Pela ausência de supressão do GH durante o teste oral de tolerância à glicose (75 g): normalmente a glicose suprime o GH, o que não ocorre na acromegalia.'},
    {q:'Qual o tratamento de primeira linha da acromegalia?',a:'A cirurgia transesfenoidal para ressecção do adenoma, potencialmente curativa sobretudo em microadenomas.'},
    {q:'Quais fármacos são usados na acromegalia persistente após cirurgia?',a:'Análogos de somatostatina (octreotida, lanreotida, pasireotida), o antagonista do receptor de GH pegvisomanto (que normaliza o IGF-1) e agonistas dopaminérgicos (cabergolina) em casos leves; a radioterapia é adjuvante nos refratários.'},
    {q:'Quais comorbidades exigem rastreio na acromegalia?',a:'Hipertensão, diabetes/intolerância à glicose, cardiomiopatia, apneia obstrutiva do sono e pólipos/câncer de cólon (colonoscopia), entre outras.'}
  ],
  fluxogramas:[{ titulo:'Diagnóstico e manejo da acromegalia', fonte:'Síntese Endodirect (baseado em Pituitary Society)', nos:[
    {tipo:'inicio', texto:'Suspeita clínica (crescimento de extremidades, traços grosseiros, comorbidades) → dosar IGF-1'},
    {tipo:'decisao', texto:'IGF-1 elevado para idade/sexo?', ramos:[
      {rotulo:'NÃO', tipo:'fim', texto:'Acromegalia improvável — buscar outra causa dos sintomas'},
      {rotulo:'SIM', tipo:'acao', texto:'Confirmar: GH não suprime no TOTG → RM de hipófise'} ]},
    {tipo:'decisao', texto:'Doença cirurgicamente ressecável?', ramos:[
      {rotulo:'SIM', tipo:'acao', texto:'Cirurgia transesfenoidal → reavaliar IGF-1/GH'},
      {rotulo:'NÃO', tipo:'fim', texto:'Fármacos (somatostatina/pegvisomanto/cabergolina) ± radioterapia'} ]},
    {tipo:'decisao', texto:'IGF-1/GH normalizados no pós-operatório?', ramos:[
      {rotulo:'SIM', tipo:'fim', texto:'Controle bioquímico — seguimento e manejo das comorbidades'},
      {rotulo:'NÃO', tipo:'fim', texto:'Terapia adjuvante (fármacos ± radioterapia)'} ]}
  ]}]
},
// 4 ─ Incidentaloma hipofisário e adenomas não funcionantes ────────────────
{ sub:'Neuroendocrinologia', privado:true, titulo:'', ano:'2026', url:'',
  tema:'Incidentaloma Hipofisário e Adenoma Não Funcionante', fonte:FONTE,
  resumo:`## Conceito
**Incidentaloma hipofisário** = lesão selar descoberta em imagem feita por outro motivo. **Microadenoma < 10 mm**; **macroadenoma ≥ 10 mm**. Muitos são **adenomas não funcionantes (clinicamente silenciosos)**; o diferencial inclui cisto de Rathke, craniofaringioma, meningioma, metástase. Três perguntas: **secreta hormônio? comprime estruturas? há hipopituitarismo?**

## Avaliação
- **Rastreio hormonal de hipersecreção** (mesmo "não funcionante"): **prolactina** (excluir prolactinoma — tratável clinicamente, evita cirurgia), **IGF-1** (acromegalia) e, se houver sinais, rastreio de **Cushing**.
- **Avaliar hipopituitarismo** (deficiências): sobretudo em **macroadenomas** (cortisol/ACTH, T4L/TSH, gonadotrofinas/esteroides, IGF-1).
- **Campo visual (campimetria)** se a lesão **toca/comprime o quiasma** (risco de hemianopsia bitemporal).
- Lembrar do **efeito gancho** ao interpretar prolactina em grandes massas.

## Conduta
- **Cirurgia transesfenoidal** se: **déficit visual** por compressão do quiasma, **crescimento** documentado, apoplexia, ou tumor **hipersecretor** (exceto prolactinoma, que é clínico).
- **Acompanhamento** (imagem + hormônios) se **não funcionante, sem compressão e sem déficit**: RM e reavaliação em intervalos que **espaçam** se estável; macro reavalia mais cedo/frequente que micro.
- **Repor** eixos deficientes identificados.

## 📊 Micro × macroadenoma (conduta)
| Aspecto | Microadenoma (< 10 mm) | Macroadenoma (≥ 10 mm) |
| --- | --- | --- |
| Risco de compressão | Baixo | Maior (quiasma) |
| Campimetria | Se sintomas | Se toca o quiasma |
| Hipopituitarismo | Incomum | Avaliar sempre |
| Seguimento por imagem | Espaçado se estável | Mais precoce/frequente |
| Cirurgia | Raramente | Se compressão/déficit/crescimento |`,
  pts:[
    'Incidentaloma hipofisário é uma lesão selar achada em imagem feita por outro motivo.',
    'Microadenoma < 10 mm; macroadenoma ≥ 10 mm; muitos são adenomas não funcionantes.',
    'Três perguntas: secreta hormônio, comprime estruturas, causa hipopituitarismo.',
    'Rastrear hipersecreção mesmo se parece silencioso: prolactina, IGF-1 e Cushing se houver sinais.',
    'Excluir prolactinoma é essencial — é tratável clinicamente e dispensa cirurgia.',
    'Avaliar hipopituitarismo, sobretudo nos macroadenomas.',
    'Campimetria se a lesão toca ou comprime o quiasma (risco de hemianopsia bitemporal).',
    'Atenção ao efeito gancho ao interpretar a prolactina em grandes massas.',
    'Cirurgia se déficit visual, crescimento, apoplexia ou tumor hipersecretor (exceto prolactinoma).',
    'Não funcionante sem compressão: acompanhamento com imagem e hormônios, espaçando se estável.'
  ],
  mapa:{ central:'Incidentaloma hipofisário',
    nodes:[
      { label:'Três perguntas', children:['Secreta hormônio?','Comprime (quiasma)?','Há hipopituitarismo?'] },
      { label:'Avaliação', children:[
        {label:'Hipersecreção', children:['Prolactina','IGF-1','Cushing se sinais']},
        {label:'Hipopituitarismo (macro)'},
        {label:'Campimetria (toca quiasma)'},
        {label:'Efeito gancho (PRL)'} ]},
      { label:'Conduta', children:[
        {label:'Cirurgia', children:['Déficit visual','Crescimento','Hipersecretor (≠ prolactinoma)']},
        {label:'Observar se não-func./estável'},
        {label:'Repor eixos deficientes'} ]}
    ]},
  flashcards:[
    {q:'Por que é fundamental dosar prolactina em todo incidentaloma hipofisário?',a:'Para identificar um prolactinoma, que é tratado clinicamente com agonista dopaminérgico e não requer cirurgia — evitando uma operação desnecessária; deve-se atentar ao efeito gancho em grandes massas.'},
    {q:'Quando indicar cirurgia em um adenoma hipofisário não funcionante?',a:'Quando há déficit de campo visual por compressão do quiasma, crescimento documentado da lesão, apoplexia ou, no caso de tumores hipersecretores (exceto prolactinoma), controle inadequado.'},
    {q:'Qual a diferença de tamanho entre micro e macroadenoma e sua implicação?',a:'Microadenoma mede menos de 10 mm e macroadenoma 10 mm ou mais; os macroadenomas têm maior risco de compressão do quiasma e de hipopituitarismo, exigindo campimetria e avaliação hormonal completa.'},
    {q:'Que avaliação hormonal deve ser feita além do rastreio de hipersecreção?',a:'A pesquisa de hipopituitarismo (deficiências de ACTH/cortisol, TSH/T4L, gonadotrofinas e GH/IGF-1), sobretudo em macroadenomas.'},
    {q:'Como se acompanha um incidentaloma não funcionante sem compressão?',a:'Com reavaliações periódicas de imagem (RM) e da função hormonal, espaçando os intervalos se a lesão permanecer estável; macroadenomas são reavaliados mais cedo e com mais frequência que microadenomas.'}
  ],
  fluxogramas:[{ titulo:'Conduta no incidentaloma hipofisário', fonte:'Síntese Endodirect (baseado em Endocrine Society)', nos:[
    {tipo:'inicio', texto:'Lesão selar incidental → rastreio de hipersecreção (PRL, IGF-1, Cushing se sinais) e de hipopituitarismo'},
    {tipo:'decisao', texto:'Prolactina muito elevada (prolactinoma)?', ramos:[
      {rotulo:'SIM', tipo:'fim', texto:'Tratar com agonista dopaminérgico (não operar de rotina)'},
      {rotulo:'NÃO', tipo:'acao', texto:'Avaliar compressão do quiasma (campimetria) e demais eixos'} ]},
    {tipo:'decisao', texto:'Déficit visual, crescimento, apoplexia ou outro tumor hipersecretor?', ramos:[
      {rotulo:'SIM', tipo:'fim', texto:'Cirurgia transesfenoidal + reposição dos eixos deficientes'},
      {rotulo:'NÃO', tipo:'fim', texto:'Adenoma não funcionante → acompanhamento (imagem + hormônios), repor deficiências'} ]}
  ]}]
},
// 5 ─ Apoplexia hipofisária e hipofisite ───────────────────────────────────
{ sub:'Neuroendocrinologia', privado:true, titulo:'', ano:'2026', url:'',
  tema:'Apoplexia Hipofisária e Hipofisite', fonte:FONTE,
  resumo:`## Apoplexia hipofisária
**Infarto ou hemorragia aguda** de um adenoma (ou glândula), uma **emergência neuroendócrina**. Fatores precipitantes: hipertensão, cirurgia, anticoagulação, teste dinâmico, gravidez (**Sheehan** = infarto pós-parto por hipotensão).
- **Quadro:** **cefaleia súbita e intensa**, náusea/vômito, **déficit visual** (queda de acuidade, hemianopsia), **oftalmoplegia** (III, IV, VI no seio cavernoso), rebaixamento; **insuficiência adrenal aguda** (deficiência súbita de ACTH → hipotensão/choque) é a maior ameaça à vida.
- **Diagnóstico:** clínica + **RM** (TC pode não mostrar). Dosar eixos (cortisol!).
- **Tratamento:** **glicocorticoide em dose de estresse imediato** (não esperar exame), suporte hidroeletrolítico; **descompressão cirúrgica** se déficit visual grave/progressivo ou rebaixamento; casos leves e estáveis podem ser conservadores. Reavaliar hipopituitarismo depois.

## Hipofisite
**Inflamação da hipófise** → aumento glandular e **hipopituitarismo** (± diabetes insípido por acometimento posterior/haste).
- **Formas:** **linfocítica** (autoimune, associada a gestação/pós-parto e a outras autoimunidades), granulomatosa, IgG4, e a crescente **hipofisite por inibidores de checkpoint** (imunoterapia oncológica — causa cada vez mais frequente).
- **Diagnóstico:** RM (realce/espessamento de haste, glândula aumentada, "massa" que pode simular adenoma) + avaliação hormonal completa. Contexto (pós-parto, imunoterapia) é chave.
- **Tratamento:** **reposição hormonal** dos eixos deficientes (glicocorticoide primeiro!); glicocorticoide em dose anti-inflamatória em casos selecionados com efeito de massa/compressão. Na induzida por checkpoint: repor eixos e manter/ajustar imunoterapia conforme protocolo.

## 📊 Apoplexia × hipofisite
| Aspecto | Apoplexia hipofisária | Hipofisite |
| --- | --- | --- |
| Início | Agudo (emergência) | Subagudo/crônico |
| Gatilho típico | HAS, cirurgia, pós-parto (Sheehan) | Pós-parto, imunoterapia (checkpoint) |
| Achado-chave | Cefaleia súbita + déficit visual | Aumento glandular + hipopituitarismo |
| Risco maior | Insuficiência adrenal aguda | Insuficiência adrenal / diabetes insipidus |
| Conduta inicial | Glicocorticoide + avaliar cirurgia | Repor eixos (glicocorticoide 1º) |`,
  pts:[
    'Apoplexia hipofisária é infarto/hemorragia aguda de adenoma — emergência neuroendócrina.',
    'Quadro: cefaleia súbita intensa, déficit visual, oftalmoplegia, náusea, rebaixamento.',
    'A maior ameaça à vida é a insuficiência adrenal aguda por deficiência súbita de ACTH.',
    'Diagnóstico por clínica + RM (a TC pode não mostrar); dosar cortisol e demais eixos.',
    'Tratar com glicocorticoide em dose de estresse imediatamente, sem esperar exames.',
    'Cirurgia descompressiva se déficit visual grave/progressivo ou rebaixamento; casos leves conservadores.',
    'Síndrome de Sheehan é o infarto hipofisário pós-parto por hipotensão.',
    'Hipofisite é inflamação da hipófise causando hipopituitarismo, às vezes com diabetes insipidus.',
    'Formas: linfocítica (autoimune, pós-parto), granulomatosa, IgG4 e por inibidores de checkpoint (imunoterapia).',
    'Tratamento da hipofisite: repor os eixos deficientes (glicocorticoide primeiro); corticoide anti-inflamatório em casos com efeito de massa.'
  ],
  mapa:{ central:'Apoplexia e hipofisite',
    nodes:[
      { label:'Apoplexia', children:[
        {label:'Infarto/hemorragia de adenoma'},
        {label:'Cefaleia súbita + déficit visual'},
        {label:'Insuf. adrenal aguda (ACTH↓)'},
        {label:'RM + glicocorticoide já'},
        'Sheehan (pós-parto)' ] },
      { label:'Hipofisite', children:[
        {label:'Linfocítica (pós-parto)'},
        {label:'Checkpoint (imunoterapia)'},
        {label:'IgG4 / granulomatosa'},
        {label:'± diabetes insipidus'} ]},
      { label:'Conduta', children:[
        {label:'Glicocorticoide 1º (ambos)'},
        {label:'Apoplexia: cirurgia se visual grave'},
        {label:'Hipofisite: repor eixos'},
        {label:'Reavaliar hipopituitarismo'} ]}
    ]},
  flashcards:[
    {q:'Qual a complicação mais ameaçadora à vida na apoplexia hipofisária e como conduzir?',a:'A insuficiência adrenal aguda por queda súbita de ACTH, que causa hipotensão/choque; deve-se administrar glicocorticoide em dose de estresse imediatamente, sem aguardar os exames hormonais.'},
    {q:'Como se confirma a apoplexia hipofisária e por que não bastar a TC?',a:'Pela clínica (cefaleia súbita, déficit visual, oftalmoplegia) associada à ressonância magnética, que demonstra a hemorragia/infarto; a TC pode ser normal ou inconclusiva nas primeiras horas.'},
    {q:'O que é a síndrome de Sheehan?',a:'O infarto isquêmico da hipófise no pós-parto, precipitado por hemorragia/hipotensão, levando a hipopituitarismo (classicamente com falha na lactação e amenorreia).'},
    {q:'Qual causa de hipofisite vem se tornando cada vez mais frequente?',a:'A hipofisite induzida por inibidores de checkpoint imunológico (imunoterapia oncológica), que deve ser lembrada em pacientes oncológicos com novo hipopituitarismo.'},
    {q:'Qual o pilar do tratamento da hipofisite?',a:'A reposição dos eixos hormonais deficientes (repondo o glicocorticoide primeiro); glicocorticoide em dose anti-inflamatória é reservado a casos selecionados com efeito de massa/compressão.'}
  ],
  fluxogramas:[{ titulo:'Manejo da apoplexia hipofisária', fonte:'Síntese Endodirect (baseado em consenso de apoplexia)', nos:[
    {tipo:'inicio', texto:'Cefaleia súbita intensa ± déficit visual/oftalmoplegia → suspeitar de apoplexia; RM de urgência'},
    {tipo:'acao', texto:'Glicocorticoide em dose de estresse imediato + suporte hidroeletrolítico (não esperar exames)'},
    {tipo:'decisao', texto:'Déficit visual grave/progressivo ou rebaixamento do sensório?', ramos:[
      {rotulo:'SIM', tipo:'fim', texto:'Descompressão cirúrgica (transesfenoidal) urgente'},
      {rotulo:'NÃO', tipo:'fim', texto:'Manejo conservador com observação e reposição; reavaliar hipopituitarismo'} ]}
  ]}]
},
// 6 ─ Diabetes insípido (deficiência de AVP) ───────────────────────────────
{ sub:'Neuroendocrinologia', privado:true, titulo:'', ano:'2026', url:'',
  tema:'Diabetes Insípido (Deficiência de AVP)', fonte:FONTE,
  resumo:`## Conceito
Incapacidade de concentrar a urina por falta de ação da **vasopressina (ADH/AVP)** → **poliúria hipotônica** e **polidipsia**. Nomenclatura atual: **deficiência de AVP** (antes DI central) e **resistência à AVP** (antes DI nefrogênico).
- **Central (deficiência de AVP):** falta de produção/secreção — cirurgia/tumor selar, **apoplexia**, trauma, hipofisite, doenças infiltrativas, idiopático.
- **Nefrogênico (resistência à AVP):** rim não responde — **lítio**, **hipercalcemia**, hipocalemia, doença renal, hereditário.
- Diferencial importante: **polidipsia primária** (ingestão excessiva de água).

## Quadro e laboratório
Poliúria volumosa (> 3 L/dia), noctúria, sede intensa. **Osmolaridade urinária baixa** com **osmolaridade/sódio plasmáticos no limite alto** (se acesso à água limitado → **hipernatremia**). Urina diluída apesar de plasma concentrado.

## Diagnóstico
- **Teste de restrição hídrica** (± desmopressina): DI não concentra a urina com a restrição; após **desmopressina**, a **osmolaridade urinária sobe no central** (responde) e **não sobe no nefrogênico**. **Copeptina** (basal e estimulada) vem substituindo/aperfeiçoando o teste clássico. **Sempre supervisionar** (risco de desidratação).
- RM de hipófise no central (perda do "ponto brilhante" da neuro-hipófise; buscar causa).

## Tratamento
- **Central:** **desmopressina (dDAVP)** — cuidado com **hiponatremia dilucional** por excesso; permitir "escape" periódico. Tratar a causa.
- **Nefrogênico:** **remover o agente** (ex.: lítio), corrigir cálcio/potássio; **dieta hipossódica + tiazídico** (± amilorida no induzido por lítio), AINE em casos selecionados.

## 📊 Central × nefrogênico × polidipsia primária
| Aspecto | Central (defic. AVP) | Nefrogênico (resist.) | Polidipsia primária |
| --- | --- | --- | --- |
| Defeito | ↓ produção de AVP | Rim não responde | Ingestão excessiva |
| Sódio plasmático | Alto/limite | Alto/limite | Baixo/normal |
| Resposta à desmopressina | Concentra a urina | Não concentra | Já concentrava |
| Tratamento | Desmopressina | Remover causa; tiazídico | Reduzir ingestão |`,
  pts:[
    'Diabetes insípido é a incapacidade de concentrar a urina por falta de ação da vasopressina.',
    'Nomenclatura atual: deficiência de AVP (central) e resistência à AVP (nefrogênico).',
    'Central: cirurgia/tumor selar, apoplexia, trauma, hipofisite, infiltrativas, idiopático.',
    'Nefrogênico: lítio, hipercalcemia, hipocalemia, doença renal, hereditário.',
    'Diferencial importante é a polidipsia primária (ingestão excessiva de água).',
    'Laboratório: urina diluída (osmolaridade baixa) com plasma no limite alto; hipernatremia se falta acesso à água.',
    'Diagnóstico pelo teste de restrição hídrica com desmopressina; copeptina vem aperfeiçoando isso.',
    'Após desmopressina, a urina concentra no central e não concentra no nefrogênico.',
    'Central: tratar com desmopressina, atento à hiponatremia dilucional por excesso.',
    'Nefrogênico: remover o agente (lítio), corrigir eletrólitos, dieta hipossódica + tiazídico.'
  ],
  mapa:{ central:'Diabetes insípido',
    nodes:[
      { label:'Tipos', children:[
        {label:'Central (deficiência de AVP)', children:['Tumor/cirurgia, apoplexia','Trauma, hipofisite']},
        {label:'Nefrogênico (resistência)', children:['Lítio','Hipercalcemia/hipocalemia']},
        {label:'DDx: polidipsia primária'} ]},
      { label:'Laboratório', children:['Urina diluída','Plasma no limite alto / Na↑','Poliúria hipotônica'] },
      { label:'Diagnóstico', children:[
        {label:'Restrição hídrica + desmopressina'},
        {label:'Central concentra / nefrogênico não'},
        {label:'Copeptina'},
        {label:'RM (perda do ponto brilhante)'} ]},
      { label:'Tratamento', children:[
        {label:'Central: desmopressina', children:['Cuidar hiponatremia']},
        {label:'Nefrogênico', children:['Remover causa','Tiazídico + hipossódica']} ]}
    ]},
  flashcards:[
    {q:'Como o teste de restrição hídrica com desmopressina diferencia o DI central do nefrogênico?',a:'Após a restrição, ambos mantêm urina diluída; ao administrar desmopressina, a osmolaridade urinária sobe no diabetes insípido central (que responde à AVP exógena) e não sobe no nefrogênico (rim resistente).'},
    {q:'Quais as principais causas de diabetes insípido nefrogênico?',a:'Uso de lítio, hipercalcemia, hipocalemia, doenças renais e formas hereditárias — o rim não responde adequadamente à vasopressina.'},
    {q:'Qual o achado laboratorial típico do diabetes insípido?',a:'Poliúria hipotônica: urina inapropriadamente diluída (osmolaridade urinária baixa) apesar de osmolaridade e sódio plasmáticos no limite superior ou francamente elevados quando o acesso à água é limitado.'},
    {q:'Qual o risco do tratamento do DI central com desmopressina?',a:'A hiponatremia dilucional por retenção hídrica excessiva; por isso ajusta-se a dose e costuma-se permitir um "escape" periódico para eliminar água livre.'},
    {q:'Como se trata o diabetes insípido nefrogênico?',a:'Removendo o agente causal (por exemplo, lítio) e corrigindo distúrbios do cálcio/potássio, além de dieta hipossódica associada a diurético tiazídico (paradoxalmente antidiurético), podendo-se usar amilorida no induzido por lítio.'}
  ],
  fluxogramas:[{ titulo:'Investigação da poliúria hipotônica (diabetes insípido)', fonte:'Síntese Endodirect (baseado em consenso internacional)', nos:[
    {tipo:'inicio', texto:'Poliúria hipotônica confirmada (urina diluída) → excluir glicosúria/diurético; teste de restrição hídrica supervisionado'},
    {tipo:'decisao', texto:'A urina concentra com a restrição?', ramos:[
      {rotulo:'SIM', tipo:'fim', texto:'Polidipsia primária provável (concentrou espontaneamente)'},
      {rotulo:'NÃO', tipo:'acao', texto:'Administrar desmopressina e reavaliar a osmolaridade urinária'} ]},
    {tipo:'decisao', texto:'A urina concentra após a desmopressina?', ramos:[
      {rotulo:'SIM', tipo:'fim', texto:'DI central (deficiência de AVP) → desmopressina; RM e buscar causa'},
      {rotulo:'NÃO', tipo:'fim', texto:'DI nefrogênico (resistência) → remover causa, tiazídico + dieta hipossódica'} ]}
  ]}]
},
// 7 ─ SIADH e hiponatremia ─────────────────────────────────────────────────
{ sub:'Neuroendocrinologia', privado:true, titulo:'', ano:'2026', url:'',
  tema:'SIADH e Hiponatremia', fonte:FONTE,
  resumo:`## Conceito
**SIADH** = secreção **inapropriada de ADH** → retenção de água livre → **hiponatremia hipotônica euvolêmica** com **urina concentrada**. É a causa mais comum de hiponatremia euvolêmica. Causas: **neoplasias** (pequenas células do pulmão), **doenças do SNC**, **pneumopatias**, **fármacos** (ISRS, carbamazepina, antipsicóticos, quimioterápicos), dor/náusea, pós-operatório.

## Abordagem da hiponatremia (passo a passo)
1. **Confirmar hipotonicidade** (osmolaridade plasmática baixa) — excluir **pseudo-hiponatremia** (hiperlipidemia/proteínas) e hiponatremia hipertônica (**hiperglicemia**).
2. **Osmolaridade urinária:** baixa (< 100) → polidipsia/baixa ingesta de soluto; alta → ADH atuando.
3. **Sódio urinário + volemia:** **hipovolêmica** (Na urinário baixo, perdas), **euvolêmica** (SIADH, hipotireoidismo, insuf. adrenal — **sempre excluir!**), **hipervolêmica** (ICC, cirrose, renal).

## Critérios de SIADH
Hiponatremia hipotônica **euvolêmica**, **osmolaridade urinária > 100** (inapropriadamente concentrada), **sódio urinário > 30**, com **função tireoidiana e adrenal normais** e sem diuréticos/hipovolemia.

## Tratamento
- **Hiponatremia aguda/sintomática grave** (convulsão, coma): **salina hipertônica 3%** em bolus controlado.
- **⚠️ Corrigir devagar:** não ultrapassar **~8–10 mEq/L em 24 h** — correção rápida causa **desmielinização osmótica (mielinólise pontina)**.
- **SIADH crônico:** **restrição hídrica** (1ª linha); adjuvantes: ureia, sal + diurético de alça, **antagonistas de vasopressina (vaptanos)** em casos selecionados. Tratar a causa de base.

## 📊 Diagnóstico diferencial da hiponatremia por volemia
| Volemia | Exemplos | Na urinário | Conduta-chave |
| --- | --- | --- | --- |
| Hipovolêmica | Vômito, diurético, perda renal | Variável | Repor volume (salina) |
| Euvolêmica | SIADH, hipotireoidismo, insuf. adrenal | > 30 (SIADH) | Restrição hídrica; excluir tireoide/adrenal |
| Hipervolêmica | ICC, cirrose, renal | Baixo (ávido) | Tratar doença + restrição |`,
  pts:[
    'SIADH é a secreção inapropriada de ADH causando hiponatremia hipotônica euvolêmica com urina concentrada.',
    'É a causa mais comum de hiponatremia euvolêmica; causas: neoplasias, SNC, pneumopatias, fármacos.',
    'Primeiro confirmar hipotonicidade e excluir pseudo-hiponatremia e hiperglicemia.',
    'A osmolaridade urinária indica se o ADH está atuando (alta) ou não (baixa).',
    'Classificar por volemia: hipovolêmica, euvolêmica (SIADH) e hipervolêmica.',
    'Sempre excluir hipotireoidismo e insuficiência adrenal antes de firmar SIADH.',
    'Critérios de SIADH: euvolemia, osmolaridade urinária > 100, sódio urinário > 30, eixos normais.',
    'Hiponatremia aguda sintomática grave: salina hipertônica a 3% de forma controlada.',
    'Não corrigir mais que ~8–10 mEq/L em 24 h para evitar desmielinização osmótica (mielinólise pontina).',
    'SIADH crônico: restrição hídrica em 1ª linha; ureia, sal/diurético ou vaptanos em casos selecionados.'
  ],
  mapa:{ central:'SIADH e hiponatremia',
    nodes:[
      { label:'Passos', children:[
        {label:'Confirmar hipotonicidade', children:['Excluir pseudo / hiperglicemia']},
        {label:'Osmolaridade urinária'},
        {label:'Volemia + Na urinário'} ]},
      { label:'SIADH', children:[
        {label:'Euvolêmica + urina concentrada'},
        {label:'Na urinário > 30'},
        {label:'Tireoide/adrenal normais'},
        {label:'Causas', children:['Neoplasia (pulmão)','SNC, pulmão, fármacos']} ]},
      { label:'Tratamento', children:[
        {label:'Aguda grave: salina 3%'},
        {label:'Corrigir devagar (≤ 8–10/24h)', children:['Risco mielinólise']},
        {label:'Crônico: restrição hídrica'},
        {label:'Vaptano/ureia; tratar causa'} ]}
    ]},
  flashcards:[
    {q:'Quais os critérios diagnósticos do SIADH?',a:'Hiponatremia hipotônica com euvolemia clínica, osmolaridade urinária inapropriadamente alta (> 100 mOsm/kg), sódio urinário elevado (> 30 mEq/L) e função tireoidiana e adrenal normais, na ausência de diuréticos e hipovolemia.'},
    {q:'Por que não se deve corrigir a hiponatremia rápido demais?',a:'Porque a elevação rápida do sódio (acima de ~8–10 mEq/L em 24 horas) pode causar síndrome de desmielinização osmótica (mielinólise pontina), uma lesão neurológica grave e muitas vezes irreversível.'},
    {q:'Qual o tratamento da hiponatremia aguda com sintomas neurológicos graves?',a:'Salina hipertônica a 3% em bolus controlado para elevar o sódio o suficiente para reverter os sintomas (convulsão/coma), respeitando o limite diário de correção.'},
    {q:'Que causas de hiponatremia euvolêmica devem ser excluídas antes de diagnosticar SIADH?',a:'Hipotireoidismo e insuficiência adrenal (secundária), que também cursam com hiponatremia euvolêmica e precisam ser afastados com função tireoidiana e cortisol.'},
    {q:'Qual o tratamento de primeira linha do SIADH crônico?',a:'A restrição hídrica; como adjuvantes podem ser usados ureia, sal associado a diurético de alça e os antagonistas do receptor de vasopressina (vaptanos) em casos selecionados, sempre tratando a causa de base.'}
  ],
  fluxogramas:[{ titulo:'Abordagem da hiponatremia', fonte:'Síntese Endodirect (baseado em guideline europeu de hiponatremia)', nos:[
    {tipo:'inicio', texto:'Hiponatremia → confirmar hipotonicidade (excluir hiperglicemia e pseudo-hiponatremia)'},
    {tipo:'decisao', texto:'Sintomas neurológicos graves (convulsão/coma)?', ramos:[
      {rotulo:'SIM', tipo:'acao', texto:'Salina hipertônica 3% controlada (corrigir ≤ 8–10 mEq/L/24h)'},
      {rotulo:'NÃO', tipo:'acao', texto:'Avaliar volemia, osmolaridade e sódio urinários'} ]},
    {tipo:'decisao', texto:'Euvolêmico, urina concentrada, Na urinário alto, tireoide/adrenal normais?', ramos:[
      {rotulo:'SIM', tipo:'fim', texto:'SIADH → restrição hídrica (± ureia/vaptano) e tratar a causa'},
      {rotulo:'NÃO', tipo:'fim', texto:'Classificar por volemia (hipo/hipervolêmica) e tratar conforme a causa'} ]}
  ]}]
}
];

// ── SQL (2 lotes) ──
const fs=require('fs');
function mkSql(arr){const j=JSON.stringify(arr);if(j.indexOf('$j$')>=0)throw new Error('$j$');return `UPDATE endodirect_global_state\nSET payload = jsonb_set(payload, '{diretrizes}', coalesce(payload->'diretrizes','[]'::jsonb) || $j$${j}$j$::jsonb)\nWHERE payload ? 'diretrizes';`;}
const b1=R.slice(0,4), b2=R.slice(4);
fs.writeFileSync(__dirname+'/neu1.sql', mkSql(b1));
fs.writeFileSync(__dirname+'/neu2.sql', mkSql(b2));
// sanity: tabelas sem célula vazia
R.forEach(r=>{ (r.resumo.split('\n').filter(l=>l.trim().startsWith('|'))).forEach(l=>{ l.split('|').slice(1,-1).forEach(c=>{ if(c.trim()==='')throw new Error('célula vazia em '+r.tema); }); }); });
console.log('Neuro:', R.length, 'resumos | lotes', b1.length+'+'+b2.length);
R.forEach((r,i)=>console.log('  '+(i+1)+'.', r.tema, '[pts '+r.pts.length+' fc '+r.flashcards.length+' flux '+r.fluxogramas.length+']'));
