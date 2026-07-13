// Resumos de Adrenal (privados) — síntese própria (não reproduz livros),
// cobertura Vilar 8ed/Williams/Greenspan + diretrizes Endocrine Society/ESE.
// Cada um: resumo md (com tabela) + pts + mapa 3 níveis + flashcards + fluxograma.
const FONTE='Síntese Endodirect · Vilar 8ed + Williams/Greenspan + Endocrine Society/ESE';
const R=[
// 1 ─ Insuficiência adrenal e crise adrenal ───────────────────────────────
{ sub:'Adrenal', privado:true, titulo:'', ano:'2026', url:'',
  tema:'Insuficiência Adrenal e Crise Adrenal', fonte:FONTE,
  resumo:`## Definição e causas
Deficiência de **cortisol** (± aldosterona/androgênios). **Primária (Addison)** = falha da adrenal → cortisol↓ e **ACTH↑**; **secundária** = falha hipofisária (ACTH↓); **terciária** = supressão do CRH/eixo (causa mais comum: **suspensão de glicocorticoide exógeno**).
- **Primária:** **adrenalite autoimune** (causa mais comum no ocidente; isolada ou poliglandular), **tuberculose** (mundo), adrenoleucodistrofia, hemorragia/infarto (Waterhouse-Friderichsen, SAF), infiltrativa, fármacos (cetoconazol, etomidato, mitotano, inibidores de checkpoint), bilateral (metástase, HAC).
- **Secundária/terciária:** corticoterapia crônica (a mais comum), tumor/cirurgia/RT selar, apoplexia, Sheehan, hipofisite.

## Quadro clínico
**Crônico:** fadiga, anorexia, perda de peso, hipotensão postural, náusea, mialgia, avidez por sal; **hiperpigmentação** (só na **primária**, por ACTH/MSH↑). **Laboratório:** **hiponatremia**, e na primária também **hipercalemia** e acidose (falta de aldosterona). Na secundária: sem hipercalemia (aldosterona preservada) e sem hiperpigmentação.
- **Crise adrenal (emergência):** hipotensão/choque refratário a volume, dor abdominal, febre, vômitos, rebaixamento — precipitada por infecção, cirurgia, estresse ou suspensão do corticoide.

## Diagnóstico
- **Cortisol basal (8h)** baixo (< 3 µg/dL confirma; > 15–18 exclui). Indeterminado → **teste de estímulo com ACTH (cortrosina 250 µg):** cortisol **< 18 µg/dL aos 30–60 min** confirma.
- **Diferenciar nível:** **ACTH** (alto = primária; baixo/normal = secundária). Na primária: **renina↑/aldosterona↓** e **anti-21-hidroxilase+** (autoimune). Secundária → investigar hipófise.

## Tratamento
- **Reposição:** **hidrocortisona** (15–25 mg/dia divididos, maior de manhã) ou prednisona; na **primária** também **fludrocortisona** (mineralocorticoide).
- **Regras de ouro (doses de estresse):** **dobrar/triplicar** a dose em doença febril; **hidrocortisona parenteral** em vômito/cirurgia; **cartão/pulseira de alerta**.
- **Crise adrenal:** **hidrocortisona 100 mg IV** em bolus + **soro fisiológico** volumoso; tratar o precipitante; **não** esperar exames para tratar.

## 📊 Insuficiência adrenal primária × secundária
| Característica | Primária (Addison) | Secundária |
| --- | --- | --- |
| ACTH | Alto | Baixo/normal |
| Aldosterona | Deficiente | Preservada |
| Hiperpigmentação | Sim | Não |
| Hipercalemia | Sim | Não (Na↓ pode haver) |
| Reposição | Gluco + mineralocorticoide | Só glicocorticoide |`,
  pts:[
    'Primária (Addison): cortisol↓ com ACTH↑; autoimune é a causa mais comum no ocidente, TB no mundo.',
    'Secundária/terciária: ACTH↓; a causa mais comum é a suspensão de glicocorticoide exógeno.',
    'Hiperpigmentação ocorre só na primária (ACTH/MSH elevados).',
    'Laboratório: hiponatremia sempre; hipercalemia e acidose só na primária (falta aldosterona).',
    'Diagnóstico: cortisol basal baixo; teste da cortrosina com cortisol < 18 µg/dL aos 30–60 min confirma.',
    'ACTH diferencia o nível (alto=primária, baixo=secundária); anti-21-hidroxilase confirma autoimune.',
    'Reposição: hidrocortisona; na primária também fludrocortisona (mineralocorticoide).',
    'Doses de estresse: dobrar/triplicar em doença febril; parenteral em vômito/cirurgia.',
    'Crise adrenal: hidrocortisona 100 mg IV + soro fisiológico, sem esperar exames.',
    'Todo paciente deve portar cartão/alerta médico e ser orientado sobre as regras do dia de doença.'
  ],
  mapa:{ central:'Insuficiência adrenal',
    nodes:[
      { label:'Primária (Addison)', children:[
        {label:'ACTH↑', children:['Hiperpigmentação']},
        {label:'Autoimune (anti-21-OH)', children:['+ comum ocidente']},
        {label:'TB / infiltrativa / hemorragia'},
        {label:'Aldosterona↓', children:['Hipercalemia']} ]},
      { label:'Secundária/terciária', children:[
        {label:'ACTH↓'},
        {label:'Suspensão de corticoide (+ comum)'},
        {label:'Tumor/cirurgia selar, Sheehan'},
        {label:'Aldosterona preservada'} ]},
      { label:'Diagnóstico', children:['Cortisol 8h baixo','Cortrosina < 18','ACTH define nível','Na↓ (± K↑ na 1ª)'] },
      { label:'Tratamento', children:[
        {label:'Hidrocortisona'},
        {label:'Fludrocortisona (1ª)'},
        {label:'Doses de estresse'},
        {label:'Crise: 100 mg IV + SF'} ]}
    ]},
  flashcards:[
    {q:'Como diferenciar insuficiência adrenal primária de secundária?',a:'Na primária (Addison) o ACTH está elevado, há deficiência de aldosterona (hipercalemia) e hiperpigmentação; na secundária o ACTH é baixo/normal, a aldosterona é preservada e não há hiperpigmentação.'},
    {q:'Como se confirma o diagnóstico de insuficiência adrenal?',a:'Cortisol basal das 8h baixo (< 3 µg/dL confirma; > 15–18 exclui); se indeterminado, o teste de estímulo com ACTH (cortrosina 250 µg) com cortisol < 18 µg/dL aos 30–60 minutos confirma.'},
    {q:'Qual a causa mais comum de insuficiência adrenal secundária/terciária?',a:'A suspensão de corticoterapia exógena crônica, que suprime o eixo hipotálamo-hipófise-adrenal.'},
    {q:'Como se trata a crise adrenal?',a:'Hidrocortisona 100 mg intravenosa em bolus (depois manutenção) + reposição volêmica com soro fisiológico, tratando o fator precipitante — sem aguardar exames para iniciar.'},
    {q:'Quais as regras do "dia de doença" na insuficiência adrenal?',a:'Dobrar ou triplicar a dose de glicocorticoide em doença febril, usar hidrocortisona parenteral em vômitos/cirurgia e portar cartão/pulseira de alerta médico.'}
  ],
  fluxogramas:[{ titulo:'Diagnóstico da insuficiência adrenal', fonte:'Síntese Endodirect (baseado em Endocrine Society)', nos:[
    {tipo:'inicio', texto:'Suspeita clínica (fadiga, hipotensão, hiponatremia, hiperpigmentação) → cortisol basal 8h + ACTH'},
    {tipo:'decisao', texto:'Cortisol basal claramente baixo ou teste da cortrosina < 18 µg/dL?', ramos:[
      {rotulo:'NÃO', tipo:'fim', texto:'Insuficiência adrenal improvável (cortisol > 15–18) — buscar outra causa'},
      {rotulo:'SIM', tipo:'acao', texto:'Insuficiência adrenal confirmada — avaliar o ACTH'} ]},
    {tipo:'decisao', texto:'ACTH elevado?', ramos:[
      {rotulo:'SIM', tipo:'fim', texto:'Primária (Addison): anti-21-hidroxilase, renina/aldosterona; repor gluco + fludrocortisona'},
      {rotulo:'NÃO (baixo/normal)', tipo:'fim', texto:'Secundária: investigar hipófise (demais eixos, RM); repor só glicocorticoide'} ]}
  ]}]
},
// 2 ─ Síndrome de Cushing ─────────────────────────────────────────────────
{ sub:'Adrenal', privado:true, titulo:'', ano:'2026', url:'',
  tema:'Síndrome de Cushing', fonte:FONTE,
  resumo:`## Conceito e causas
Exposição crônica ao excesso de **cortisol**. Causa mais comum global = **exógena (iatrogênica)** por corticoide. As **endógenas** dividem-se em:
- **ACTH-dependentes (~80%):** **doença de Cushing** (adenoma hipofisário — a mais comum das endógenas) e **secreção ectópica de ACTH** (carcinoide brônquico, carcinoma de pequenas células).
- **ACTH-independentes (~20%):** **adenoma adrenal**, carcinoma adrenocortical, hiperplasia macronodular/PPNAD.

## Quadro clínico
Ganho de peso central, **fácies em lua cheia**, giba, **estrias violáceas largas (> 1 cm)**, pletora, **fragilidade capilar/equimoses**, fraqueza muscular proximal, hipertensão, **intolerância à glicose/DM**, osteoporose, distúrbios psíquicos, hirsutismo/irregularidade menstrual. Achados mais **específicos**: miopatia proximal, estrias largas violáceas, equimoses, pletora.

## Diagnóstico (2 etapas)
**1) Confirmar o hipercortisolismo** — pelo menos **2 testes de rastreio alterados** (excluir corticoide exógeno e pseudo-Cushing):
- **Cortisol salivar noturno** (perde o nadir noturno);
- **Cortisol livre urinário 24h** (≥ 2 amostras);
- **Supressão com 1 mg de dexametasona overnight** (cortisol matinal **> 1,8 µg/dL** = não suprimiu).

**2) Definir a etiologia:**
- **ACTH:** **suprimido** → ACTH-independente (adrenal) → **TC de adrenais**. **Normal/alto** → ACTH-dependente.
- ACTH-dependente → **RM de hipófise**; se dúvida ou lesão pequena, **cateterismo bilateral dos seios petrosos inferiores (BIPSS)** diferencia hipófise × ectópico. Teste de supressão com dose alta e CRH auxiliam.

## Tratamento
- **Cirurgia** da causa: **adenomectomia transesfenoidal** (doença de Cushing), **adrenalectomia** (tumor adrenal), ressecção do tumor ectópico.
- **Adjuvantes:** radioterapia hipofisária; **fármacos** (cetoconazol, metirapona, osilodrostate, pasireotida, mifepristona); **adrenalectomia bilateral** em casos refratários (vigiar **síndrome de Nelson**).

## 📊 Diferenciação etiológica pelo ACTH
| ACTH | Etiologia | Próximo passo |
| --- | --- | --- |
| Suprimido | ACTH-independente (adrenal) | TC de adrenais |
| Normal/alto | Doença de Cushing (hipófise) | RM hipófise ± BIPSS |
| Normal/alto | Secreção ectópica | Imagem tórax/abdome; BIPSS diferencia |`,
  pts:[
    'Causa mais comum global é o corticoide exógeno; entre as endógenas, a doença de Cushing (adenoma hipofisário).',
    'ACTH-dependentes (~80%): doença de Cushing e secreção ectópica; ACTH-independentes (~20%): adrenal.',
    'Achados mais específicos: estrias largas violáceas, miopatia proximal, equimoses e pletora.',
    'Confirmar com ≥2 testes: cortisol salivar noturno, cortisol livre urinário 24h e supressão com 1 mg de dexametasona.',
    'Não suprimir com 1 mg de dexametasona = cortisol matinal > 1,8 µg/dL.',
    'ACTH suprimido → causa adrenal → TC de adrenais.',
    'ACTH normal/alto → ACTH-dependente → RM de hipófise.',
    'Cateterismo dos seios petrosos (BIPSS) diferencia doença de Cushing de secreção ectópica.',
    'Tratamento de escolha é cirúrgico (transesfenoidal ou adrenalectomia).',
    'Adjuvantes: radioterapia e fármacos (cetoconazol, metirapona, osilodrostate, pasireotida); adrenalectomia bilateral refratária pode causar síndrome de Nelson.'
  ],
  mapa:{ central:'Síndrome de Cushing',
    nodes:[
      { label:'Causas', children:[
        {label:'Exógena (+ comum)'},
        {label:'ACTH-dependente', children:['Doença de Cushing','Ectópico']},
        {label:'ACTH-independente', children:['Adenoma adrenal','Carcinoma adrenal']} ]},
      { label:'Clínica específica', children:['Estrias largas violáceas','Miopatia proximal','Equimoses','Pletora'] },
      { label:'Confirmar (2 testes)', children:['Salivar noturno','Cortisol urinário 24h','Dexa 1 mg (>1,8)'] },
      { label:'Etiologia', children:[
        {label:'ACTH suprimido → adrenal (TC)'},
        {label:'ACTH normal/alto → RM hipófise'},
        {label:'BIPSS (hipófise × ectópico)'} ]},
      { label:'Tratamento', children:['Cirurgia da causa','Radioterapia','Fármacos (cetoconazol...)','Adrenalectomia bilateral'] }
    ]},
  flashcards:[
    {q:'Quais os achados clínicos mais específicos da síndrome de Cushing?',a:'Estrias largas (> 1 cm) violáceas, miopatia/fraqueza muscular proximal, equimoses/fragilidade capilar e pletora facial — mais discriminatórios que obesidade e hipertensão isoladas.'},
    {q:'Quais os testes de rastreio para confirmar hipercortisolismo?',a:'Cortisol salivar da meia-noite, cortisol livre urinário de 24h e teste de supressão com 1 mg de dexametasona overnight (cortisol matinal > 1,8 µg/dL indica não supressão); confirma-se com pelo menos dois alterados.'},
    {q:'Como o ACTH orienta a etiologia do Cushing?',a:'ACTH suprimido indica causa adrenal (ACTH-independente) → TC de adrenais; ACTH normal ou alto indica ACTH-dependente (doença de Cushing ou ectópico) → RM de hipófise.'},
    {q:'Para que serve o cateterismo dos seios petrosos inferiores (BIPSS)?',a:'Para diferenciar a doença de Cushing (fonte hipofisária) da secreção ectópica de ACTH quando a RM é duvidosa, comparando o ACTH central com o periférico.'},
    {q:'Qual o tratamento de escolha da doença de Cushing?',a:'A cirurgia transesfenoidal para ressecção do adenoma hipofisário; alternativas/adjuvantes incluem radioterapia e fármacos que bloqueiam a esteroidogênese (cetoconazol, metirapona, osilodrostate).'}
  ],
  fluxogramas:[{ titulo:'Investigação da síndrome de Cushing', fonte:'Síntese Endodirect (baseado em Endocrine Society)', nos:[
    {tipo:'inicio', texto:'Suspeita clínica — excluir corticoide exógeno; realizar testes de rastreio'},
    {tipo:'decisao', texto:'Pelo menos 2 testes de rastreio alterados (salivar/urinário/dexa 1 mg)?', ramos:[
      {rotulo:'NÃO', tipo:'fim', texto:'Hipercortisolismo não confirmado (considerar pseudo-Cushing) — reavaliar'},
      {rotulo:'SIM', tipo:'acao', texto:'Hipercortisolismo confirmado — dosar ACTH'} ]},
    {tipo:'decisao', texto:'ACTH suprimido?', ramos:[
      {rotulo:'SIM', tipo:'fim', texto:'Causa adrenal (ACTH-independente) → TC de adrenais → adrenalectomia'},
      {rotulo:'NÃO (normal/alto)', tipo:'acao', texto:'ACTH-dependente → RM de hipófise'} ]},
    {tipo:'fim', texto:'Adenoma hipofisário claro → cirurgia transesfenoidal; RM duvidosa → BIPSS (hipófise × ectópico) e buscar tumor ectópico'}
  ]}]
},
// 3 ─ Hiperaldosteronismo primário ────────────────────────────────────────
{ sub:'Adrenal', privado:true, titulo:'', ano:'2026', url:'',
  tema:'Hiperaldosteronismo Primário (Conn)', fonte:FONTE,
  resumo:`## Conceito
Produção **autônoma de aldosterona**, independente do sistema renina-angiotensina → **hipertensão** + supressão da renina. É a **causa endócrina mais comum de HAS secundária** (subdiagnosticada). Causas: **hiperplasia adrenal bilateral idiopática** (mais comum) e **adenoma produtor de aldosterona (APA / Conn)**; raras: HAC familiar, carcinoma.

## Quando investigar
- HAS **resistente** (≥ 3 fármacos) ou grave (≥ 160/100); HAS + **hipocalemia** (espontânea ou induzida por diurético); HAS + **incidentaloma adrenal**; HAS + **apneia do sono**; HAS < 40 anos ou com **história familiar** de HAS/AVC precoce; parente de 1º grau com hiperaldo.
- Clínica: muitos são **normocalêmicos**; quando há hipocalemia → fraqueza, câimbras, poliúria. Maior risco cardiovascular/renal que HAS essencial equivalente.

## Rastreio e confirmação
- **Rastreio: relação aldosterona/renina (RAR)** elevada (aldosterona alta + renina suprimida). Ajustar fármacos que interferem (suspender **espironolactona/eplerenona** ~4–6 sem; preferir **verapamil/α-bloqueador** no preparo). Corrigir hipocalemia antes.
- **Confirmação** (se RAR positiva e não for caso inequívoco): **teste de sobrecarga** (salina EV, sobrecarga oral de sódio, fludrocortisona ou captopril) — aldosterona **não suprime**. *Obs.:* hipocalemia espontânea + renina indetectável + aldosterona muito alta pode **dispensar** o teste confirmatório.

## Subtipagem (lateralização)
- **TC de adrenais** (localiza nódulo, exclui carcinoma) — **mas não basta** (adenomas não-funcionantes e hiperplasia são frequentes, sobretudo > 35 anos).
- **Cateterismo de veias adrenais (AVS)** = **padrão-ouro** para lateralizar antes da cirurgia, **quando o paciente deseja/aceita cirurgia**.

## Tratamento
- **Unilateral (APA):** **adrenalectomia laparoscópica** (cura/controla a HAS e a hipocalemia).
- **Bilateral (hiperplasia) ou não-cirúrgico:** **antagonista mineralocorticoide** (espironolactona; eplerenona se efeitos antiandrogênicos).

## 📊 Passos do diagnóstico
| Etapa | Método | Resultado positivo |
| --- | --- | --- |
| Rastreio | Relação aldosterona/renina (RAR) | Aldosterona alta + renina suprimida |
| Confirmação | Sobrecarga salina/oral, fludrocortisona ou captopril | Aldosterona não suprime |
| Subtipagem | TC + cateterismo de veias adrenais (AVS) | Lateralização (unilateral × bilateral) |`,
  pts:[
    'Hiperaldosteronismo primário é a causa endócrina mais comum de hipertensão secundária.',
    'Aldosterona autônoma → HAS com renina suprimida; muitos pacientes são normocalêmicos.',
    'Causas: hiperplasia bilateral idiopática (mais comum) e adenoma produtor (Conn).',
    'Investigar: HAS resistente/grave, HAS+hipocalemia, HAS+incidentaloma, HAS jovem ou com apneia/família.',
    'Rastreio: relação aldosterona/renina (RAR) elevada; ajustar fármacos interferentes antes.',
    'Confirmação: teste de sobrecarga (salina/oral/fludrocortisona/captopril) — aldosterona não suprime.',
    'Hipocalemia espontânea + renina indetectável + aldosterona muito alta pode dispensar a confirmação.',
    'Subtipagem: TC não basta; cateterismo de veias adrenais (AVS) é o padrão-ouro para lateralizar.',
    'AVS é indicado quando o paciente é candidato e deseja cirurgia.',
    'Tratamento: adrenalectomia no unilateral; antagonista mineralocorticoide (espironolactona) no bilateral.'
  ],
  mapa:{ central:'Hiperaldosteronismo primário',
    nodes:[
      { label:'Causas', children:[
        {label:'Hiperplasia bilateral (+ comum)'},
        {label:'Adenoma (Conn)'},
        {label:'Carcinoma / familiar (raros)'} ]},
      { label:'Quando investigar', children:['HAS resistente/grave','HAS + hipocalemia','HAS + incidentaloma','HAS jovem / apneia'] },
      { label:'Diagnóstico', children:[
        {label:'Rastreio: RAR', children:['Aldo alta + renina baixa']},
        {label:'Confirmar: sobrecarga', children:['Não suprime']},
        {label:'Subtipar: AVS', children:['Padrão-ouro','TC não basta']} ]},
      { label:'Tratamento', children:[
        {label:'Unilateral → adrenalectomia'},
        {label:'Bilateral → espironolactona'} ]}
    ]},
  flashcards:[
    {q:'Qual o exame de rastreio do hiperaldosteronismo primário?',a:'A relação aldosterona/renina (RAR) elevada — aldosterona alta com renina suprimida —, com atenção a suspender fármacos interferentes (como espironolactona) e corrigir a hipocalemia antes.'},
    {q:'Quando a confirmação com teste de sobrecarga pode ser dispensada?',a:'Quando há hipocalemia espontânea, renina indetectável e aldosterona muito elevada — quadro bioquímico já inequívoco de hiperaldosteronismo primário.'},
    {q:'Por que a TC de adrenais não basta para decidir a cirurgia?',a:'Porque adenomas não-funcionantes e hiperplasia bilateral são frequentes (sobretudo após os 35 anos), podendo levar a adrenalectomia equivocada; o cateterismo de veias adrenais (AVS) é o padrão-ouro para lateralizar.'},
    {q:'Qual o tratamento conforme a subtipagem?',a:'Doença unilateral (adenoma) → adrenalectomia laparoscópica; doença bilateral (hiperplasia) ou paciente não-cirúrgico → antagonista mineralocorticoide (espironolactona ou eplerenona).'},
    {q:'Quais pacientes hipertensos devem ser rastreados?',a:'HAS resistente ou grave, HAS com hipocalemia, HAS com incidentaloma adrenal, HAS com apneia do sono, HAS antes dos 40 anos ou com história familiar de HAS/AVC precoce, e parentes de portadores.'}
  ],
  fluxogramas:[{ titulo:'Investigação do hiperaldosteronismo primário', fonte:'Síntese Endodirect (baseado em Endocrine Society)', nos:[
    {tipo:'inicio', texto:'HAS com critério de rastreio → relação aldosterona/renina (RAR), com preparo adequado'},
    {tipo:'decisao', texto:'RAR positiva (aldosterona alta + renina suprimida)?', ramos:[
      {rotulo:'NÃO', tipo:'fim', texto:'Hiperaldosteronismo improvável — investigar outras causas de HAS'},
      {rotulo:'SIM', tipo:'acao', texto:'Confirmar com teste de sobrecarga (salvo quadro inequívoco)'} ]},
    {tipo:'decisao', texto:'Aldosterona não suprime (confirmado) e paciente candidato a cirurgia?', ramos:[
      {rotulo:'SIM', tipo:'acao', texto:'Subtipagem: TC + cateterismo de veias adrenais (AVS)'},
      {rotulo:'NÃO', tipo:'fim', texto:'Tratamento clínico com antagonista mineralocorticoide (espironolactona)'} ]},
    {tipo:'decisao', texto:'Lateralização unilateral no AVS?', ramos:[
      {rotulo:'SIM', tipo:'fim', texto:'Adrenalectomia laparoscópica'},
      {rotulo:'NÃO (bilateral)', tipo:'fim', texto:'Antagonista mineralocorticoide'} ]}
  ]}]
},
// 4 ─ Feocromocitoma e paraganglioma ──────────────────────────────────────
{ sub:'Adrenal', privado:true, titulo:'', ano:'2026', url:'',
  tema:'Feocromocitoma e Paraganglioma', fonte:FONTE,
  resumo:`## Conceito
Tumores de **células cromafins** produtores de **catecolaminas**: **feocromocitoma** (medula adrenal) e **paraganglioma** (extra-adrenal, gânglios simpáticos/parassimpáticos). Regra dos "10" clássica está desatualizada — **até ~40% são hereditários** (SDHx, VHL, NEM 2/RET, NF1). Paragangliomas de cabeça/pescoço costumam ser **não-secretores**.

## Quadro clínico
Tríade clássica: **cefaleia + sudorese + palpitação**, em **crises paroxísticas**, com **hipertensão** (sustentada ou paroxística, lábil). Também: palidez, ansiedade/sensação de morte, tremor, perda de peso, hiperglicemia. Crises podem ser desencadeadas por manipulação do tumor, anestesia, contraste, certos fármacos. Risco de **crise hipertensiva/arritmia/cardiomiopatia**.

## Diagnóstico
- **Bioquímico:** **metanefrinas fracionadas plasmáticas livres** e/ou **metanefrinas urinárias 24h** (alta sensibilidade). Cuidar de interferentes (estresse, fármacos — tricíclicos, ISRS, descongestionantes; postura/jejum).
- **Localização (após confirmação bioquímica):** **TC/RM** de abdome/pelve; se dúvida ou doença metastática/hereditária → **imagem funcional** (**PET-DOTATATE**, MIBG).
- **Genética:** oferecer **teste germinativo** (rendimento alto) — orienta rastreio e seguimento.

## Tratamento
- **Cirurgia** (adrenalectomia/ressecção) é curativa, mas exige **PREPARO PRÉ-OPERATÓRIO**: **α-bloqueio** (fenoxibenzamina ou doxazosina) por **10–14 dias**, com **expansão volêmica** e dieta rica em sal; **β-bloqueador só depois do α** (nunca antes — risco de crise hipertensiva por vasoconstrição sem oposição).
- **Seguimento** vitalício (metanefrinas) pelo risco de recorrência/metástase; rastrear familiares se mutação.

## 📊 Regras-chave
| Item | Conduta |
| --- | --- |
| Diagnóstico | Metanefrinas plasmáticas livres e/ou urinárias 24h |
| Localização | TC/RM; funcional (DOTATATE/MIBG) se preciso |
| Preparo cirúrgico | α-bloqueio 10–14 dias + volume; β só após o α |
| Genética | Teste germinativo (até ~40% hereditários) |`,
  pts:[
    'Feocromocitoma (adrenal) e paraganglioma (extra-adrenal) produzem catecolaminas; até ~40% são hereditários.',
    'Tríade: cefaleia + sudorese + palpitação em paroxismos, com hipertensão lábil ou sustentada.',
    'Diagnóstico bioquímico: metanefrinas fracionadas plasmáticas livres e/ou urinárias de 24h.',
    'Atenção a interferentes (fármacos, estresse, postura) que causam falso-positivo.',
    'Localizar só após confirmação bioquímica: TC/RM; funcional (PET-DOTATATE/MIBG) se dúvida ou metástase.',
    'Oferecer teste genético germinativo a todos (SDHx, VHL, RET/NEM 2, NF1).',
    'A cirurgia é curativa mas exige preparo pré-operatório rigoroso.',
    'Preparo: α-bloqueio (fenoxibenzamina/doxazosina) 10–14 dias + expansão volêmica e sal.',
    'β-bloqueador só depois do α — nunca antes (risco de crise hipertensiva).',
    'Seguimento vitalício com metanefrinas pelo risco de recorrência/metástase; rastrear familiares.'
  ],
  mapa:{ central:'Feocromocitoma / paraganglioma',
    nodes:[
      { label:'Conceito', children:[
        {label:'Células cromafins → catecolaminas'},
        {label:'Feo (adrenal) × PGL (extra)'},
        {label:'~40% hereditários', children:['SDHx, VHL','RET/NEM 2, NF1']} ]},
      { label:'Clínica', children:['Cefaleia+sudorese+palpitação','Crises paroxísticas','HAS lábil','Palidez, ansiedade'] },
      { label:'Diagnóstico', children:[
        {label:'Metanefrinas', children:['Plasmáticas livres','Urinárias 24h']},
        {label:'Localizar', children:['TC/RM','DOTATATE/MIBG']},
        {label:'Genética germinativa'} ]},
      { label:'Tratamento', children:[
        {label:'Cirurgia curativa'},
        {label:'Preparo', children:['α-bloqueio 10–14d','Volume + sal','β só após α']},
        {label:'Seguimento vitalício'} ]}
    ]},
  flashcards:[
    {q:'Qual o exame bioquímico de escolha para feocromocitoma?',a:'As metanefrinas fracionadas — plasmáticas livres e/ou urinárias de 24h — pela alta sensibilidade; deve-se controlar interferentes (fármacos, estresse, postura) para evitar falso-positivo.'},
    {q:'Por que o α-bloqueio deve preceder o β-bloqueio no preparo?',a:'Porque bloquear os receptores β antes dos α deixa a vasoconstrição α sem oposição, podendo precipitar crise hipertensiva grave; faz-se α-bloqueio por 10–14 dias com expansão volêmica antes de introduzir o β.'},
    {q:'Qual a tríade clássica de sintomas do feocromocitoma?',a:'Cefaleia, sudorese e palpitação, tipicamente em crises paroxísticas acompanhadas de hipertensão.'},
    {q:'Por que oferecer teste genético a todos os pacientes?',a:'Porque até cerca de 40% dos casos são hereditários (mutações em SDHx, VHL, RET/NEM 2, NF1), e a identificação orienta o rastreio do paciente e dos familiares e o seguimento.'},
    {q:'Qual a ordem correta: localizar ou confirmar bioquimicamente primeiro?',a:'Primeiro confirmar bioquimicamente com metanefrinas; só depois localizar por imagem (TC/RM e, se necessário, imagem funcional), para não valorizar achados incidentais não-funcionantes.'}
  ],
  fluxogramas:[{ titulo:'Abordagem do feocromocitoma/paraganglioma', fonte:'Síntese Endodirect (baseado em Endocrine Society)', nos:[
    {tipo:'inicio', texto:'Suspeita (crises adrenérgicas, HAS lábil, incidentaloma, síndrome hereditária) → metanefrinas'},
    {tipo:'decisao', texto:'Metanefrinas elevadas (confirmado)?', ramos:[
      {rotulo:'NÃO', tipo:'fim', texto:'Feocromocitoma improvável — reavaliar interferentes/outras causas'},
      {rotulo:'SIM', tipo:'acao', texto:'Localizar: TC/RM (± PET-DOTATATE/MIBG) e oferecer teste genético'} ]},
    {tipo:'acao', texto:'Preparo pré-operatório: α-bloqueio 10–14 dias + expansão volêmica e sal (β só após o α)'},
    {tipo:'fim', texto:'Adrenalectomia/ressecção do tumor → seguimento vitalício com metanefrinas'}
  ]}]
},
// 5 ─ Incidentaloma adrenal ───────────────────────────────────────────────
{ sub:'Adrenal', privado:true, titulo:'', ano:'2026', url:'',
  tema:'Incidentaloma Adrenal', fonte:FONTE,
  resumo:`## Conceito
Massa adrenal **≥ 1 cm** descoberta em exame de imagem feito por outro motivo. Comum (aumenta com a idade). Duas perguntas: **é funcionante?** e **é maligno?** A maioria é **adenoma não-funcionante benigno**.

## Avaliação — é maligno? (imagem)
- **TC sem contraste:** **densidade ≤ 10 HU** = **adenoma rico em lípides** (benigno). Densidade alta → avaliar **washout** de contraste ou RM (chemical shift).
- Sinais de **suspeição de malignidade:** **tamanho > 4 cm**, densidade alta/heterogênea, margens irregulares, crescimento, invasão. **Carcinoma adrenocortical** e **metástase** entram no diferencial.

## Avaliação — é funcionante? (hormônios em TODOS)
- **Supressão com 1 mg de dexametasona** (rastrear **hipercortisolismo autônomo** — o mais comum; cortisol matinal **> 1,8 µg/dL** = não suprimiu, com faixa de "secreção autônoma leve" 1,8–5,0).
- **Metanefrinas** (excluir **feocromocitoma**).
- **Relação aldosterona/renina** **se hipertenso/hipocalêmico** (hiperaldosteronismo).
- Androgênios/17-OH-progesterona se sinais de virilização/suspeita de carcinoma.

## Conduta
- **Cirurgia** se: **funcionante** (feo, aldosteronoma, Cushing evidente) ou **suspeito de malignidade** (> 4 cm, características radiológicas).
- **Não funcionante e benigno:** em geral **acompanhar** (a reavaliação hormonal/de imagem é individualizada; muitos protocolos dispensam repetir imagem se claramente benigno < 4 cm e não-funcionante).
- **Secreção autônoma leve de cortisol (MACS):** associada a HAS, DM, osteoporose — considerar cirurgia conforme comorbidades/idade.

## 📊 Rastreio funcional do incidentaloma
| Teste | O que exclui/detecta |
| --- | --- |
| Dexametasona 1 mg overnight | Hipercortisolismo autônomo (o mais comum) |
| Metanefrinas | Feocromocitoma |
| Aldosterona/renina (se HAS/K↓) | Hiperaldosteronismo |
| TC sem contraste (≤ 10 HU) | Adenoma benigno rico em lípides |`,
  pts:[
    'Incidentaloma = massa adrenal ≥ 1 cm achada por acaso; a maioria é adenoma não-funcionante benigno.',
    'Duas perguntas: é funcionante e é maligno.',
    'TC sem contraste ≤ 10 HU indica adenoma benigno rico em lípides.',
    'Suspeição de malignidade: > 4 cm, densidade alta/heterogênea, margens irregulares, crescimento.',
    'Rastreio funcional em todos: supressão com 1 mg de dexametasona (hipercortisolismo é o mais comum).',
    'Dosar metanefrinas em todos para excluir feocromocitoma.',
    'Relação aldosterona/renina se houver hipertensão ou hipocalemia.',
    'Cirurgia se funcionante ou suspeito de malignidade (> 4 cm/características).',
    'Não funcionante e benigno: acompanhamento individualizado.',
    'Secreção autônoma leve de cortisol (MACS) associa-se a HAS/DM/osteoporose e pode justificar cirurgia.'
  ],
  mapa:{ central:'Incidentaloma adrenal',
    nodes:[
      { label:'É maligno?', children:[
        {label:'TC sem contraste', children:['≤ 10 HU = benigno','Alto → washout/RM']},
        {label:'Suspeito', children:['> 4 cm','Irregular/heterogêneo','Cresce']} ]},
      { label:'É funcionante?', children:[
        {label:'Dexa 1 mg', children:['Hipercortisolismo (+ comum)']},
        {label:'Metanefrinas', children:['Feocromocitoma']},
        {label:'Aldo/renina (se HAS/K↓)'} ]},
      { label:'Conduta', children:[
        {label:'Funcionante → cirurgia'},
        {label:'Suspeito (>4 cm) → cirurgia'},
        {label:'Benigno não-func. → acompanhar'},
        {label:'MACS → individualizar'} ]}
    ]},
  flashcards:[
    {q:'Quais as duas perguntas centrais diante de um incidentaloma adrenal?',a:'Se a massa é funcionante (secreta hormônio) e se é maligna; a maioria é adenoma não-funcionante benigno.'},
    {q:'Qual achado de TC sugere adenoma benigno?',a:'Densidade ≤ 10 unidades Hounsfield na TC sem contraste, indicando adenoma rico em lípides.'},
    {q:'Que avaliação hormonal deve ser feita em todo incidentaloma?',a:'Supressão com 1 mg de dexametasona (hipercortisolismo autônomo, o mais frequente) e metanefrinas (feocromocitoma); acrescenta-se a relação aldosterona/renina se houver hipertensão ou hipocalemia.'},
    {q:'Quando indicar cirurgia no incidentaloma?',a:'Quando é funcionante (feocromocitoma, aldosteronoma, Cushing evidente) ou quando há suspeita de malignidade (> 4 cm, densidade alta/heterogênea, margens irregulares ou crescimento).'},
    {q:'O que é a secreção autônoma leve de cortisol (MACS)?',a:'Um hipercortisolismo subclínico (não suprime a dexametasona, mas sem Cushing florido) associado a hipertensão, diabetes e osteoporose, cuja cirurgia é considerada conforme comorbidades e idade.'}
  ],
  fluxogramas:[{ titulo:'Conduta no incidentaloma adrenal', fonte:'Síntese Endodirect (baseado em ESE/ENSAT)', nos:[
    {tipo:'inicio', texto:'Massa adrenal ≥ 1 cm achada incidentalmente → avaliar imagem e função'},
    {tipo:'decisao', texto:'Características de malignidade (> 4 cm, densidade alta/heterogênea, irregular, cresce)?', ramos:[
      {rotulo:'SIM', tipo:'fim', texto:'Considerar adrenalectomia (excluir feocromocitoma antes de operar)'},
      {rotulo:'NÃO', tipo:'acao', texto:'Rastreio funcional: dexametasona 1 mg + metanefrinas (± aldosterona/renina)'} ]},
    {tipo:'decisao', texto:'Funcionante (Cushing, feocromocitoma, aldosteronoma)?', ramos:[
      {rotulo:'SIM', tipo:'fim', texto:'Tratar/operar conforme o hormônio (preparo se feocromocitoma)'},
      {rotulo:'NÃO', tipo:'fim', texto:'Adenoma benigno não-funcionante → acompanhamento individualizado'} ]}
  ]}]
},
// 6 ─ Hiperplasia adrenal congênita ───────────────────────────────────────
{ sub:'Adrenal', privado:true, titulo:'', ano:'2026', url:'',
  tema:'Hiperplasia Adrenal Congênita (HAC)', fonte:FONTE,
  resumo:`## Conceito
Grupo de doenças **autossômicas recessivas** por deficiência de enzimas da **esteroidogênese**; **> 90–95% por deficiência de 21-hidroxilase** (gene *CYP21A2*). O bloqueio reduz **cortisol** (± aldosterona) → **ACTH↑** → **hiperplasia adrenal** e **acúmulo de precursores** desviados para **androgênios** (**17-OH-progesterona↑**).

## Formas (21-hidroxilase)
- **Clássica perdedora de sal:** deficiência grave; **crise adrenal neonatal** (hiponatremia, hipercalemia, desidratação) + **virilização** da genitália feminina (ambiguidade). Emergência.
- **Clássica virilizante simples:** virilização sem perda de sal significativa.
- **Não-clássica (tardia):** a mais comum; manifesta na infância tardia/adolescência/adulto como **hiperandrogenismo** (hirsutismo, acne, irregularidade menstrual, puberdade precoce) — diferencial de SOP.

## Diagnóstico
- **17-OH-progesterona** basal elevada (rastreio); casos duvidosos → **teste de estímulo com ACTH** (17-OHP pós-cortrosina). **Triagem neonatal** (teste do pezinho) detecta a forma clássica.
- Confirmação **genética** (*CYP21A2*); avaliar eletrólitos/renina na forma perdedora de sal.

## Tratamento
- **Clássica:** **glicocorticoide** (hidrocortisona na criança) para repor cortisol e **suprimir o ACTH/androgênios**; **fludrocortisona** (± sal) na perdedora de sal; **doses de estresse** e educação (igual insuficiência adrenal). Manejo da genitália é multidisciplinar.
- **Não-clássica:** tratar se sintomático (hiperandrogenismo/infertilidade) — glicocorticoide baixo e/ou manejo sintomático; muitas assintomáticas não precisam.

## 📊 Formas da deficiência de 21-hidroxilase
| Forma | Apresentação | Perda de sal |
| --- | --- | --- |
| Clássica perdedora de sal | Crise neonatal + virilização feminina | Sim |
| Clássica virilizante simples | Virilização, sem crise | Não |
| Não-clássica (tardia) | Hiperandrogenismo (DDx de SOP) | Não |`,
  pts:[
    'HAC é autossômica recessiva; > 90% por deficiência de 21-hidroxilase (CYP21A2).',
    'Bloqueio → cortisol↓ e ACTH↑ → hiperplasia + acúmulo de androgênios (17-OHP elevada).',
    'Forma clássica perdedora de sal: crise adrenal neonatal + virilização da genitália feminina.',
    'Forma virilizante simples: virilização sem perda de sal.',
    'Forma não-clássica (a mais comum): hiperandrogenismo tardio, diferencial de SOP.',
    'Diagnóstico: 17-OH-progesterona elevada; casos duvidosos com teste da cortrosina.',
    'Triagem neonatal detecta a forma clássica; confirmação genética por CYP21A2.',
    'Tratamento clássico: glicocorticoide (suprime ACTH/androgênios) + fludrocortisona na perdedora de sal.',
    'Doses de estresse e educação são essenciais, como em qualquer insuficiência adrenal.',
    'Forma não-clássica: tratar só se sintomática (hiperandrogenismo/infertilidade).'
  ],
  mapa:{ central:'Hiperplasia adrenal congênita',
    nodes:[
      { label:'Fisiopatologia', children:[
        {label:'21-hidroxilase (CYP21A2)'},
        {label:'Cortisol↓ → ACTH↑'},
        {label:'Androgênios↑ (17-OHP↑)'} ]},
      { label:'Formas', children:[
        {label:'Perdedora de sal', children:['Crise neonatal','Virilização feminina']},
        {label:'Virilizante simples'},
        {label:'Não-clássica', children:['Hiperandrogenismo','DDx SOP']} ]},
      { label:'Diagnóstico', children:['17-OHP elevada','Cortrosina se dúvida','Triagem neonatal','Genética'] },
      { label:'Tratamento', children:[
        {label:'Glicocorticoide (suprime ACTH)'},
        {label:'Fludrocortisona (perde sal)'},
        {label:'Doses de estresse'},
        {label:'Não-clássica: se sintomática'} ]}
    ]},
  flashcards:[
    {q:'Qual a enzima mais comumente deficiente na HAC e o marcador diagnóstico?',a:'A 21-hidroxilase (gene CYP21A2), em mais de 90% dos casos; o marcador é a 17-hidroxiprogesterona elevada (com teste de estímulo com ACTH nos casos duvidosos).'},
    {q:'Como se apresenta a forma clássica perdedora de sal?',a:'Com crise adrenal neonatal (hiponatremia, hipercalemia, desidratação e hipotensão) e virilização da genitália externa feminina — uma emergência.'},
    {q:'O que caracteriza a forma não-clássica da HAC?',a:'É a mais comum; manifesta-se de forma tardia como hiperandrogenismo (hirsutismo, acne, irregularidade menstrual), sendo importante diferencial da síndrome dos ovários policísticos.'},
    {q:'Por que se usa glicocorticoide na HAC clássica?',a:'Para repor o cortisol deficiente e, ao suprimir o ACTH, reduzir o estímulo à produção adrenal de androgênios; na forma perdedora de sal associa-se fludrocortisona.'},
    {q:'A forma não-clássica sempre precisa de tratamento?',a:'Não; trata-se apenas quando sintomática (hiperandrogenismo, infertilidade), muitas vezes com glicocorticoide em baixa dose ou manejo sintomático — casos assintomáticos podem ser apenas acompanhados.'}
  ],
  fluxogramas:[{ titulo:'Diagnóstico da HAC por deficiência de 21-hidroxilase', fonte:'Síntese Endodirect (baseado em Endocrine Society)', nos:[
    {tipo:'inicio', texto:'Suspeita (crise neonatal/ambiguidade genital; ou hiperandrogenismo tardio) → 17-OH-progesterona'},
    {tipo:'decisao', texto:'17-OHP basal muito elevada?', ramos:[
      {rotulo:'SIM', tipo:'fim', texto:'HAC confirmada → glicocorticoide (± fludrocortisona) e confirmação genética'},
      {rotulo:'DUVIDOSA', tipo:'acao', texto:'Teste de estímulo com ACTH (17-OHP pós-cortrosina)'} ]},
    {tipo:'decisao', texto:'17-OHP pós-ACTH elevada?', ramos:[
      {rotulo:'SIM', tipo:'fim', texto:'HAC (provável não-clássica) → tratar se sintomática'},
      {rotulo:'NÃO', tipo:'fim', texto:'HAC afastada — investigar outras causas de hiperandrogenismo (SOP)'} ]}
  ]}]
},
// 7 ─ Carcinoma adrenocortical ────────────────────────────────────────────
{ sub:'Adrenal', privado:true, titulo:'', ano:'2026', url:'',
  tema:'Carcinoma Adrenocortical', fonte:FONTE,
  resumo:`## Conceito
Tumor maligno raro e agressivo do **córtex adrenal**, com distribuição **bimodal** (infância e 4ª–5ª décadas). Pode ser **funcionante (~60%)** — com frequência **misto** (**Cushing + virilização** é sugestivo) — ou não-funcionante (massa/dor). Associa-se a síndromes (**Li-Fraumeni/TP53**, Beckwith-Wiedemann, NEM 1).

## Apresentação e avaliação
- **Funcionante:** Cushing de instalação rápida, virilização (androgênios), às vezes feminização ou hiperaldosteronismo. **Sempre avaliar todos os eixos** (cortisol/dexa, androgênios/17-OHP, metanefrinas para excluir feo, aldosterona/renina) — o perfil orienta e é útil como **marcador de seguimento**.
- **Imagem suspeita:** massa **grande (> 4–6 cm)**, **densidade alta (> 10–20 HU)**, heterogênea, margens irregulares, calcificações, necrose, invasão/linfonodos/metástase (pulmão, fígado). Estadiamento com TC tórax/abdome (± PET).
- **⚠️ Evitar biópsia** de rotina (risco de ruptura/disseminação e baixa acurácia) — **excluir feocromocitoma antes** de qualquer punção/cirurgia.

## Tratamento
- **Cirurgia:** **ressecção completa (R0) em bloco** por equipe experiente (adrenalectomia aberta na doença localizada) — melhor chance de cura.
- **Adjuvante/avançado:** **mitotano** (adrenolítico; monitorar nível e repor glicocorticoide) ± quimioterapia (**EDP-mitotano**); radioterapia em casos selecionados. Prognóstico depende do **estágio** e da ressecção completa.

## 📊 Sinais de alarme na massa adrenal
| Achado | Interpretação |
| --- | --- |
| Tamanho > 4–6 cm | Maior risco de malignidade |
| Densidade > 10–20 HU / heterogênea | Não é adenoma típico |
| Cushing + virilização (misto) | Sugestivo de carcinoma |
| Crescimento / invasão / metástase | Carcinoma adrenocortical |`,
  pts:[
    'Carcinoma adrenocortical é raro e agressivo, com distribuição bimodal (infância e 4ª–5ª décadas).',
    'Cerca de 60% são funcionantes, frequentemente mistos; Cushing + virilização é sugestivo.',
    'Associa-se a síndromes genéticas (Li-Fraumeni/TP53, Beckwith-Wiedemann, NEM 1).',
    'Avaliar todos os eixos hormonais — orienta o diagnóstico e serve de marcador de seguimento.',
    'Imagem suspeita: massa grande (> 4–6 cm), densa (> 10–20 HU), heterogênea, irregular, com invasão/metástase.',
    'Excluir feocromocitoma antes de qualquer punção ou cirurgia.',
    'Evitar biópsia de rotina (risco de disseminação e baixa acurácia).',
    'Tratamento: ressecção cirúrgica completa (R0) em bloco por equipe experiente.',
    'Mitotano (adrenolítico) é o principal adjuvante/paliativo, ± quimioterapia (EDP).',
    'O prognóstico depende do estágio e da ressecção completa.'
  ],
  mapa:{ central:'Carcinoma adrenocortical',
    nodes:[
      { label:'Perfil', children:[
        {label:'Raro, agressivo, bimodal'},
        {label:'~60% funcionante', children:['Cushing + virilização']},
        {label:'Síndromes', children:['Li-Fraumeni (TP53)','Beckwith-Wiedemann']} ]},
      { label:'Avaliação', children:[
        {label:'Todos os eixos (marcador)'},
        {label:'Imagem suspeita', children:['> 4–6 cm','> 10–20 HU','Invasão/metástase']},
        {label:'Excluir feo antes'},
        {label:'Evitar biópsia'} ]},
      { label:'Tratamento', children:[
        {label:'Ressecção R0 em bloco'},
        {label:'Mitotano (± EDP)'},
        {label:'Radioterapia selecionada'},
        {label:'Prognóstico ~ estágio'} ]}
    ]},
  flashcards:[
    {q:'Qual apresentação hormonal sugere carcinoma adrenocortical?',a:'A secreção mista e de instalação rápida, sobretudo síndrome de Cushing associada a virilização (excesso de androgênios), embora possa ser não-funcionante.'},
    {q:'Por que se deve evitar biópsia de rotina de uma massa adrenal suspeita?',a:'Porque tem baixa acurácia e risco de ruptura/disseminação tumoral; além disso é imprescindível excluir feocromocitoma antes de qualquer punção ou cirurgia.'},
    {q:'Quais achados de imagem levantam suspeita de carcinoma adrenocortical?',a:'Massa grande (> 4–6 cm), densidade alta (> 10–20 HU), heterogeneidade, margens irregulares, calcificações/necrose e sinais de invasão, linfonodos ou metástases.'},
    {q:'Qual o tratamento com melhor chance de cura?',a:'A ressecção cirúrgica completa (R0) em bloco, por equipe experiente, na doença localizada.'},
    {q:'Qual o principal fármaco adjuvante/paliativo no carcinoma adrenocortical?',a:'O mitotano (adrenolítico), monitorando o nível sérico e repondo glicocorticoide, podendo ser associado a quimioterapia (esquema EDP-mitotano) na doença avançada.'}
  ],
  fluxogramas:[{ titulo:'Abordagem da massa adrenal suspeita de carcinoma', fonte:'Síntese Endodirect (baseado em ESE/ENSAT)', nos:[
    {tipo:'inicio', texto:'Massa adrenal grande/suspeita → avaliar todos os eixos hormonais e estadiar (TC tórax/abdome)'},
    {tipo:'acao', texto:'Excluir feocromocitoma (metanefrinas) ANTES de qualquer intervenção; evitar biópsia de rotina'},
    {tipo:'decisao', texto:'Doença localizada e ressecável?', ramos:[
      {rotulo:'SIM', tipo:'fim', texto:'Adrenalectomia com ressecção completa (R0) em bloco ± mitotano adjuvante'},
      {rotulo:'NÃO (avançada)', tipo:'fim', texto:'Mitotano ± quimioterapia (EDP); radioterapia selecionada; cuidados de suporte'} ]}
  ]}]
}
];

// ── SQL (2 lotes) ──
const fs=require('fs');
function mkSql(arr){const j=JSON.stringify(arr);if(j.indexOf('$j$')>=0)throw new Error('$j$');return `UPDATE endodirect_global_state\nSET payload = jsonb_set(payload, '{diretrizes}', coalesce(payload->'diretrizes','[]'::jsonb) || $j$${j}$j$::jsonb)\nWHERE payload ? 'diretrizes';`;}
const b1=R.slice(0,4), b2=R.slice(4);
fs.writeFileSync(__dirname+'/adr1.sql', mkSql(b1));
fs.writeFileSync(__dirname+'/adr2.sql', mkSql(b2));
// sanity: tabelas sem célula vazia
R.forEach(r=>{ (r.resumo.split('\n').filter(l=>l.trim().startsWith('|'))).forEach(l=>{ l.split('|').slice(1,-1).forEach(c=>{ if(c.trim()==='')throw new Error('célula vazia em '+r.tema); }); }); });
console.log('Adrenal:', R.length, 'resumos | lotes', b1.length+'+'+b2.length);
R.forEach((r,i)=>console.log('  '+(i+1)+'.', r.tema, '[pts '+r.pts.length+' fc '+r.flashcards.length+' flux '+r.fluxogramas.length+']'));
