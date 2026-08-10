# Auditoria do NÚCLEO — área DIABETES (24 entradas)

Auditor clínico Endodirect. Prova = texto-fonte em `scratchpad/acervo/textos/` via
`scratchpad/acervo/extratos/*.json`. Notas do cofre entram como fonte secundária e
estão marcadas como tal em cada achado.

---

## ACHADO 1

**ENTRADA #24 — Doença cardiovascular e manejo de risco no diabetes (ADA Standards of Care 2026)**

**SEVERIDADE:** SÉRIO

**O QUE O NÚCLEO DIZ:**
> "Lípides: DM + DASCV → estatina de alta intensidade, meta de LDL <55 mg/dL, acrescentar ezetimiba ou inibidor de PCSK9 (ou ácido bempedoico/inclisirana) se não atingir; DM 40–75 anos sem DASCV → estatina de intensidade moderada, e de alta intensidade (meta LDL <70) se alto risco CV"

**O QUE A FONTE DIZ:**
> "5.2.4. indivíduos de risco muito alto a meta do ldl-c é < 50 mg/dl, e do não-hdl-c, < 80 mg/dl."
> "em indivíduos de risco cardiovascular extremo, recomenda-se a favor das metas de ldl-c < 40 mg/dl e de não-hdl-c < 70 mg/dl."
> "risco extremo definido como histórico de múltiplos eventos cardiovasculares ateroscleróticos maiores ou 1 evento cardiovascular aterosclerótico maior e pelo menos 2 condições de alto risco."
> "condições de alto risco idade ≥ 65 anos … dm hipertensão arterial doença renal crônica (tfge 15-59 …) tabagismo atual …"
> "em indivíduos de alto risco cardiovascular, recomenda-se a favor da terapia inicial com estatina de alta intensidade e ezetimiba para atingir a meta terapêutica."
> "em indivíduos de risco cardiovascular alto, muito alto ou extremo, recomenda-se a favor de uma redução percentual do ldl-c de pelo menos 50%."

**ONDE:** `1F9LgLNgc8DPmIR4IP5lUI1msIvJQECr-.json` (Diretriz Brasileira de Dislipidemias e Prevenção da Aterosclerose – 2025) fatos 132, 5, 29, 31, 104, 208; conferido também no texto corrido (`textos/1F9LgLNgc8DPmIR4IP5lUI1msIvJQECr-.txt`, offset ~229118, seção 5.2.4).

**CONDUTA QUE SAI DISSO:** o médico brasileiro declara "meta atingida" com LDL 52 mg/dL num diabético que já infartou e não acrescenta ezetimiba/anti-PCSK9 — quando a diretriz nacional vigente exige <50, e <40 se houver mais duas condições de alto risco (o próprio DM conta como uma delas, e hipertensão ou idade ≥65 fecham a conta).

**CORREÇÃO SUGERIDA:** "Lípides (usar a estratificação da Diretriz Brasileira de Dislipidemias 2025): DM é sempre pelo menos risco intermediário — nunca risco baixo. DM + DASCV = risco muito alto → LDL-c <50 mg/dL e não-HDL-c <80, com redução ≥50%; se houver ≥2 condições de alto risco associadas (idade ≥65, DM, hipertensão, DRC 15–59, tabagismo, revascularização prévia, evento <2 anos, LDL ≥100 apesar de estatina máxima + ezetimiba) ou múltiplos eventos maiores = risco extremo → LDL-c <40 e não-HDL-c <70. Terapia INICIAL já combinada: alto risco = estatina de alta intensidade + ezetimiba; muito alto = idem ± anti-PCSK9; extremo = estatina de alta intensidade + ezetimiba + anti-PCSK9."

**Observação anexa (mesma entrada, mesma fonte):** "DM 40–75 anos sem DASCV → estatina de intensidade moderada" é a faixa etária e a intensidade da ADA. Pela fonte brasileira, homem ≥50 / mulher ≥56 com DM2 e 1–2 estratificadores de alto risco já é ALTO risco → meta <70, redução ≥50% e estatina de alta intensidade + ezetimiba como terapia inicial. A meta percentual co-primária (≥30% / ≥50%) não aparece em lugar nenhum da entrada.

---

## ACHADO 2

**ENTRADA #29 — Hiperglicemia em oncologia (NOVIDADE ADA Standards of Care 2026)**

**SEVERIDADE:** GRAVE

**O QUE O NÚCLEO DIZ:**
> "hiperglicemia induzida por drogas em pacientes oncológicos (ex.: glicocorticoides e alguns antineoplásicos) — a metformina é a 1ª linha para essas excursões glicêmicas"

**O QUE A FONTE DIZ:**
> "since gcs significantly reduce hepatic insulin sensitivity, in theory, metformin should be at the foundation of management for gih; however, metformin has a slow onset of action and may not be suitable for use in short courses of gc therapy."
> "in a recent double-blind, placebo-controlled trial of 34 patients without pre-existing diabetes receiving at least 4 weeks of prednisone (median dose 30-35 mg), subjects treated with metformin (850 mg twice daily) had no change in glucose tolerance compared to placebo at 4 weeks."
> "for patients with sustained and severe hyperglycemia (post-prandial glucose ≥200 mg/dl), metformin should be started to improve insulin sensitivity along with nph."
> (caso de dexametasona 12 mg IV semanal em quimioterapia) "given severe hyperglycemia at baseline, insulin therapy is indicated but concurrently metformin should be maximized … and we recommend stopping glyburide due to long duration of action and risk of hypoglycemia."

**ONDE:** `1wlPADpO0MCZhmiBxhbH_JclzDXY5qKYd.json` (Manejo do diabetes e/ou da hiperglicemia induzidos por glicocorticoide) fatos 51, 50, 97, 114, 115.

**CONDUTA QUE SAI DISSO:** paciente oncológico em pulso de dexametasona com glicemias pós-prandiais de 250–350 mg/dL recebe metformina isolada e espera — droga de início lento, sem efeito demonstrado nesse cenário, enquanto a fonte manda insulina (NPH acoplada ao corticoide) com metformina apenas como coadjuvante de sensibilização. Erro na direção de tratar de MENOS, com hiperglicemia sustentada, risco de EHH e adiamento da insulina.

**CORREÇÃO SUGERIDA:** "Hiperglicemia induzida por glicocorticoide/antineoplásico: a escolha depende do GRAU da hiperglicemia pós-prandial e da DURAÇÃO prevista do corticoide. Pós-prandial <200 mg/dL e curso prolongado: metformina (maximizar) ± agente que mira o pós-prandial (iDPP-4, iSGLT2, AR GLP-1 diário, glinida ou sulfonilureia de ação curta). Pós-prandial ≥200 mg/dL ou curso curto/pulsado (padrão da oncologia): INSULINA — NPH acoplada ao corticoide da manhã, ~0,1 U/kg para cada 10 mg de prednisona-equivalente, titulando 10–20% — com a metformina como coadjuvante, não como monoterapia (início lento; ensaio randomizado não mostrou efeito em 4 semanas de prednisona). Evitar sulfonilureia de ação longa (glibenclamida/glimepirida) pelo risco de hipoglicemia de jejum no desmame."

---

## ACHADO 3

**ENTRADA #29 — Hiperglicemia em oncologia (NOVIDADE ADA Standards of Care 2026)**

**SEVERIDADE:** OMISSÃO

**O QUE O NÚCLEO DIZ:**
> "individualizar conforme a função renal, o prognóstico e a intercorrência." (a entrada inteira não diz **quando medir** a glicemia)

**O QUE A FONTE DIZ:**
> "glucocorticoids cause significant post-prandial hyperglycemia and have less impact on fasting bg."
> "however, relying solely on fasting bg values may be a diagnostic pitfall since gcs largely impact the post-prandial glucose metabolism and fasting glucose values could be normal."
> "in another study of patients receiving pulse-dose dexamethasone therapy (40 mg) in the morning for multiple myeloma, peak hyperglycemia occurred between 5-6 p.m. in both patients with and without pre-existing diabetes. fasting glucose was not affected in patients without pre-existing diabetes but doubled in patients with diabetes."

**ONDE:** `1wlPADpO0MCZhmiBxhbH_JclzDXY5qKYd.json` fatos 26, 35, 32 (e fato 111: caso em que a glicemia de jejum, 110 mg/dL, foi a MENOR do dia).

**CONDUTA QUE SAI DISSO:** o médico pede glicemia de jejum, recebe valor normal e libera o paciente — a hiperglicemia do corticoide fica sem diagnóstico porque acontece à tarde/noite, exatamente quando ninguém mediu.

**CORREÇÃO SUGERIDA:** "Rastrear a hiperglicemia induzida por glicocorticoide pela glicemia PÓS-PRANDIAL (sobretudo pós-almoço e fim de tarde): com corticoide de ação intermediária pela manhã a glicemia de jejum pode ser normal — é a menor do dia — e com dexametasona em pulso matinal o pico ocorre por volta das 17–18 h. Glicemia de jejum isolada subestima e pode perder o diagnóstico."

---

## ACHADO 4

**ENTRADA #30 — Diabetes no hospital (ADA Standards of Care 2026)**

**SEVERIDADE:** OMISSÃO

**O QUE O NÚCLEO DIZ:**
> "Rever/ajustar os antidiabéticos orais (suspender metformina conforme contraindicações) e planejar a alta com transição de cuidado."

**O QUE A FONTE DIZ:**
> "(ii) stopping immediately for emergency surgery or any extreme stress event or any situation that might precipitate dka including acute illness;"
> "use of sglt2i use can predispose to the development of ketoacidosis with relatively low or normal levels of blood glucose."
> "the absence of marked hyperglycemia can delay diagnosis and treatment, resulting in potential serious adverse outcomes."

**ONDE:** `1cHPZdqVjnPgv0JHAdTskACDIZFgmBmcL.json` (Euglycemic Ketoacidosis) fatos 68, 2, 1.

**CONDUTA QUE SAI DISSO:** na entrada que o médico lê ao internar um paciente, o único oral nomeado para suspensão é a metformina. O iSGLT2 continua prescrito num paciente agudamente doente — exatamente a situação em que a fonte manda suspendê-lo IMEDIATAMENTE — e a meta de glicemia de 140–180 mg/dL da própria entrada faz o paciente parecer controlado enquanto desenvolve cetoacidose euglicêmica.

**CORREÇÃO SUGERIDA:** "Rever/ajustar os antidiabéticos orais na admissão: suspender metformina conforme contraindicações e SUSPENDER O iSGLT2 imediatamente em doença aguda, cirurgia de emergência ou qualquer situação que possa precipitar cetoacidose (e pelo menos 24 h antes de cirurgia/procedimento eletivo). Atenção: sob iSGLT2 a cetoacidose pode cursar com glicemia dentro da meta hospitalar de 140–180 mg/dL — havendo náusea, vômito, dispneia, dor abdominal ou acidose, pedir cetonemia independentemente da glicemia."

---

## ACHADO 5

**ENTRADA #22 — Metas glicêmicas, hipoglicemia e crises hiperglicêmicas (ADA Standards of Care 2026)**

**SEVERIDADE:** OMISSÃO

**O QUE O NÚCLEO DIZ:**
> "atenção à CAD euglicêmica (<200 mg/dL) … Não descarte o iSGLT2 porque a glicemia está alta, nem a cetoacidose porque está normal: peça cetonemia."
> (a entrada ensina a DETECTAR e a suspender preventivamente o iSGLT2 — mas não diz **o que fazer** com a cetoacidose euglicêmica já instalada)

**O QUE A FONTE DIZ:**
> "the treatment of euka in diabetic individuals is similar to that of hyperglycemic dka. guidelines for the management of dka recommend rapid fluid replacement, followed by continuous intravenous insulin infusion, correction of electrolyte imbalances and dextrose-containing solutions when bg levels are below 250 mg/dl."
> "stop sglt2i, fluid replacement, insulin infusion and intravenous glucose solution" (Tabela 1, linha SGLT2i)
> "in case of euka in non-diabetic individuals, insulin infusion is not necessary, whereas fluid replacement, correction of electrolyte imbalances and intravenous glucose solution are sufficient for the resolution of acidosis."
> "this condition, however, can occur, in the absence of diabetes, in settings such as pregnancy, restriction on caloric intake, glycogen storage diseases or defective gluconeogenesis (alcohol abuse or chronic liver disease), and cocaine abuse."

**ONDE:** `1cHPZdqVjnPgv0JHAdTskACDIZFgmBmcL.json` fatos 72, 73, 75, 3.

**CONDUTA QUE SAI DISSO:** confirmada a cetonemia com glicemia de 160 mg/dL, o médico que só leu esta entrada tem dois reflexos errados disponíveis e nenhuma instrução contra eles — não ligar a insulina "porque a glicemia está normal" (a cetose não resolve) ou ligar a insulina sem dextrose (hipoglicemia, porque a glicemia já está abaixo do limiar em que a dextrose deveria entrar). E, na gestante ou no etilista sem diabetes, pode infundir insulina que a fonte diz não ser necessária.

**CORREÇÃO SUGERIDA:** "Cetoacidose euglicêmica confirmada — tratar: suspender o iSGLT2, repor volume, iniciar insulina IV contínua E dextrose DESDE O INÍCIO (a solução com dextrose entra quando a glicemia está abaixo de 250 mg/dL — na forma euglicêmica ela já está), corrigir eletrólitos e manter até a resolução da acidose e das cetonas, não até a glicemia normalizar. Na cetoacidose euglicêmica de quem NÃO tem diabetes (gestação, jejum/restrição calórica, álcool, hepatopatia, cocaína), a infusão de insulina não é necessária: volume + eletrólitos + glicose IV resolvem a acidose."

---

## ACHADO 6

**ENTRADA #22 — Metas glicêmicas, hipoglicemia e crises hiperglicêmicas (ADA Standards of Care 2026)**

**SEVERIDADE:** IMPRECISO

**O QUE O NÚCLEO DIZ:**
> "⚠️ GRAVIDADE da CAD se mede por ACIDOSE e NÍVEL DE CONSCIÊNCIA — nunca pela glicemia nem pela cetonemia"

**O QUE A FONTE DIZ (a mesma fonte, dois lugares):**
> "note that the severity of diabetic ketoacidosis (dka) is defined by the degree of acidosis and level of consciousness, not by the degree of hyperglycaemia or ketonaemia."
> mas também: "other markers of severity, including ketone concentrations (>6.0 mmol/l), venous ph (<7.0), hypokalaemia on admission (<3.5 mmol/l), systolic blood pressure (<90 mmhg), pulse rate (either >100 bpm or <60 bpm), oxygen saturation (<92% …) and glasgow coma scale score (<12), have been suggested by the uk guidelines."

**ONDE:** `1mLQXSccgHuczjcDnN4GRVe8HxMM2aoMf.json` (Diabetic ketoacidosis, Nat Rev Dis Primers) fatos 12 e 53.

**CONDUTA QUE SAI DISSO:** diante de β-hidroxibutirato 7,5 mmol/L com pH 7,28, o médico classifica como CAD leve e não escala o cuidado — quando a mesma fonte lista cetona >6,0 mmol/L (e hipocalemia de entrada <3,5) entre os marcadores que indicam gravidade e cuidado de maior complexidade.

**CORREÇÃO SUGERIDA:** "A ESTRATIFICAÇÃO de gravidade da CAD (leve/moderada/grave) é feita pelo grau de acidose e pelo nível de consciência — não pelo valor da glicemia nem pelo da cetonemia. Isso não significa ignorar a cetonemia: cetona >6,0 mmol/L, pH venoso <7,0, potássio de entrada <3,5, PAS <90, FC >100 ou <60, SatO2 <92% e Glasgow <12 são marcadores de gravidade que indicam cuidado de maior complexidade."

---

## ACHADO 7

**ENTRADA #22 — Metas glicêmicas, hipoglicemia e crises hiperglicêmicas (ADA Standards of Care 2026)**

**SEVERIDADE:** IMPRECISO

**O QUE O NÚCLEO DIZ:**
> "na dúvida, segure: hipocalemia é a causa provável do excesso de mortalidade na CAD, e 55% dos adultos desenvolvem hipocalemia com insulina a 0,1 U/kg/h."

**O QUE A FONTE DIZ:**
> "a survey of the management of dka in the uk showed that an intravenous insulin infusion rate of 0.1 units/kg/hour was associated with 55% of adults developing hypokalaemia. although no harm was associated with this hypokalaemia, this survey provides support for the practice of reducing the insulin infusion rate to 0.05 units/kg/hour after glucose levels decline."
> "the development of severe hypokalaemia (<2.5 mmol/l) was associated with increased mortality (or 3.17; 95% ci 1.49-6.76) … suggesting that hypokalaemia is most likely the cause of increased mortality"

**ONDE:** `1mLQXSccgHuczjcDnN4GRVe8HxMM2aoMf.json` fatos 95 e 92/96.

**CONDUTA QUE SAI DISSO:** o número dos 55% é verdadeiro mas está apoiando a conclusão errada. Na fonte ele justifica REDUZIR a taxa de infusão para 0,05 U/kg/h depois que a glicemia cai — e vem acompanhado de "nenhum dano foi associado a essa hipocalemia". No núcleo ele vira argumento para ADIAR a insulina, que é a direção oposta: cetoacidose que não resolve. O excesso de mortalidade, na fonte, está amarrado à hipocalemia GRAVE (<2,5 mmol/L), não à hipocalemia em geral.

**CORREÇÃO SUGERIDA:** "Adiar a insulina apenas nas situações que a fonte define: adulto com hipocalemia sintomática (fraqueza muscular, arritmia) até K >3,3 mmol/L; criança com K <3,5 mmol/L até normalizar. Fora disso a insulina não se segura — o que se faz é repor potássio junto e REDUZIR a infusão para 0,02–0,05 U/kg/h com dextrose assim que a glicemia cair para ~200 mg/dL, mantendo-a até a resolução da cetoacidose. A hipocalemia grave (<2,5 mmol/L) nas primeiras 24–48 h associou-se a mortalidade aumentada (OR 3,17) — por isso monitorizar o potássio de 2 em 2 a 4 horas, com monitorização cardíaca contínua sempre que a reposição passar de 10 mmol/hora."

---

## ACHADO 8

**ENTRADA #23 — Tratamento farmacológico da glicemia (ADA Standards of Care 2026)**

**SEVERIDADE:** OMISSÃO

**O QUE O NÚCLEO DIZ:**
> "em quem tem insuficiência cardíaca, doença renal crônica, DASCV estabelecida ou alto risco CV, usar um iSGLT2 ou AR GLP-1 com benefício comprovado INDEPENDENTE da A1C, da metformina e da meta glicêmica (IC → iSGLT2; DRC → iSGLT2 ± AR GLP-1/finerenona; DASCV → AR GLP-1 ou iSGLT2)."
> (a entrada que manda PRESCREVER o iSGLT2 não diz uma palavra sobre cetoacidose nem sobre quando suspendê-lo)

**O QUE A FONTE DIZ:**
> "use of sglt2i use can predispose to the development of ketoacidosis with relatively low or normal levels of blood glucose."
> "to minimize the risk of dka/euka associated with sglt2i, international societies released a position statement that recommend: (i) stopping sglt2i at least 24 h prior to elective surgery, planned invasive procedures, or anticipated severe stressful physical activity; (ii) stopping immediately for emergency surgery or any extreme stress event or any situation that might precipitate dka including acute illness; (iii) avoid stopping insulin or decreasing the dose excessively;"

**ONDE:** `1cHPZdqVjnPgv0JHAdTskACDIZFgmBmcL.json` fatos 2, 67, 68, 69. Corroborado pela nota do cofre "Benefícios Cardiometabólicos e Renais dos iSGLT2 (Nat Rev Endocrinol 2025)", que lista "cetoacidose (inclusive euglicêmica)" entre os efeitos adversos.

**CONDUTA QUE SAI DISSO:** o médico inicia o iSGLT2 (indicação correta) e o paciente sai sem a orientação de suspendê-lo antes de cirurgia ou ao adoecer — a única entrada que carrega essa regra é a #22, que trata de crises hiperglicêmicas e não é a que se lê para prescrever.

**CORREÇÃO SUGERIDA:** acrescentar ao fim da recomendação de iSGLT2: "— ao prescrever iSGLT2, orientar suspensão pelo menos 24 h antes de cirurgia/procedimento eletivo e IMEDIATAMENTE em doença aguda, cirurgia de emergência ou estresse extremo (risco de cetoacidose, inclusive com glicemia normal), e não reduzir excessivamente nem suspender a insulina de quem a usa."

---

## ACHADO 9

**ENTRADAS #0 e #85 — a sigla DRD significa duas doenças diferentes dentro do mesmo núcleo**

**SEVERIDADE:** SÉRIO

**O QUE O NÚCLEO DIZ:**
> #0: "DRD (doença renal do diabetes; NÃO 'nefropatia diabética'): rastreio por RAC (razão albumina/creatinina) + TFGe"
> #85: "RETINOPATIA é mais bem definida como DOENÇA RETINIANA DIABÉTICA (DRD) — acomete toda a retina (neurônios/glia), não só microvasos; rastreio com apoio de IA; anti-VEGF e/ou laser"

**O QUE A FONTE DIZ:** as duas leituras têm respaldo, e é isso que torna a colisão irresolúvel para quem lê.
> Diretriz Brasileira de Dislipidemias 2025, legenda da Tabela 4.7: "DRD: doença renal do diabetes; TFG: taxa de filtração glomerular."
> Nota do cofre "Doença Retiniana Diabética (primer, Nat Rev Dis Primers 2025)": "**DRD** redefine a 'retinopatia diabética': o diabetes afeta **toda a retina**".

**ONDE:** `textos/1F9LgLNgc8DPmIR4IP5lUI1msIvJQECr-.txt`, busca "doença renal do diabetes" (1 ocorrência, legenda da Tabela 4.7); `cofre/Diretrizes Clínicas/Doença Retiniana Diabética (primer, Nat Rev Dis Primers 2025).md`.

**CONDUTA QUE SAI DISSO:** uma pergunta sobre "rastreio da DRD" pode ser respondida com RAC + TFGe quando o médico quer fundo de olho, ou com retinografia quando ele quer albuminúria — e a resposta virá com a autoridade de diretriz nos dois casos. Nenhuma das duas entradas avisa que a sigla está ocupada pela outra.

**CORREÇÃO SUGERIDA:** desambiguar explicitamente nas duas entradas. #0: "Doença renal do diabetes (DRD renal; substitui 'nefropatia diabética')…". #85: "…doença retiniana diabética (DRD retiniana) — atenção: no diabetes a sigla DRD também é usada para doença renal do diabetes; escrever por extenso." Ou eleger uma das duas e escrever a outra sempre por extenso.

---

## ACHADO 10

**ENTRADA #72 — Teplizumabe (TN-10; ensaio PROTECT 2023)**

**SEVERIDADE:** IMPRECISO

**O QUE O NÚCLEO DIZ:**
> "aprovado (FDA 2022) para RETARDAR a progressão do estágio 2 … para o estágio 3 clínico (atraso mediano ~2 anos)"

**O QUE A FONTE DIZ:**
> "of particular interest is the drug teplizumab, an anti-cd3 monoclonal antibody, which delayed progression from stage 2 to stage 3 diabetes by a median of 3 years."

**ONDE:** `1BZXsfVzIvhq7d9wE0eLupFSmebeH46V5.json` (Type 1 diabetes, Lancet Seminar 2023) fato 182; texto-fonte offset ~44791.

**CONDUTA QUE SAI DISSO:** subdimensiona o benefício na conversa em que ele é decidido — uma família que ouve "adia cerca de dois anos" pesa a indicação de forma diferente de quem ouve a faixa real de dois a três anos conforme o seguimento. Erro na direção de indicar de menos.

**CORREÇÃO SUGERIDA:** "…retarda a progressão do estágio 2 para o estágio 3 clínico por uma mediana de cerca de 2 a 3 anos, conforme o tempo de seguimento analisado (Lancet Seminar 2023: mediana de 3 anos)."

**Nota adjacente, sem severidade própria:** a mesma fonte registra que o tratamento "does require 14 days of intravenous infusion" (fato 183) e que a idade da aprovação é "children older than 8 years with stage 2 diabetes" (fato 184). O curso de 14 dias de infusão IV não aparece em nenhuma das duas entradas que tratam do teplizumabe (#35 e #72) e é o dado que define a viabilidade prática do encaminhamento.

---

## ACHADO 11

**ENTRADA #50 — Pré-diabetes (Nat Rev Dis Primers 2025)** *(e, no mesmo ponto, #21)*

**SEVERIDADE:** IMPRECISO

**O QUE O NÚCLEO DIZ:**
> #50: "Base do manejo: mudança de estilo de vida (± metformina em sobrepeso/obesidade com intolerância à glicose); benefício menos claro na GJA isolada e em peso normal."
> #21: "(a perda de peso é o principal preditor de redução do risco)"

**O QUE A FONTE DIZ:**
> "in most randomized clinical trials, the effects of lifestyle modification were primarily mediated by weight loss. two trials, the chinese da qing study and the indian dpp, were exceptions to these findings and did not demonstrate that the effects of lifestyle modification were primarily mediated by weight loss. the results of these latter studies may be explained by a lower bmi among participants at enrollment (mean [sd] bmi of 26 [3.8] in the da qing study and 25.8 [3.5] in the indian dpp study)"
> Da Qing: "cumulative incidence: 65.9% in control vs 47.1% in diet, 44.2% in exercise, and 44.6% in diet and exercise groups" (IMC médio 25,8)
> DPP indiano: "cumulative incidence: 55.0% in control group vs 39.3% in diet and exercise…" (IMC médio 25,8)

**ONDE:** `1c0GoKq_bdLfZOEuJMJpwDZOO62RtoTry.json` (Diagnosis and Management of Prediabetes: A Review) fatos 86, 101, 108.

**CONDUTA QUE SAI DISSO:** duas frases sem sujeito explícito ("benefício menos claro… em peso normal") deixam o médico concluir que o programa de estilo de vida rende pouco em quem tem IMC normal e por isso não o encaminha. Os dois ensaios feitos justamente em populações magras (IMC ~26) reduziram a incidência de diabetes de 65,9% para 44,6% e de 55,0% para 39,3% — sem que o efeito fosse mediado por perda de peso. A ressalva pertence à METFORMINA (cuja eficácia se concentra em IMC ≥35 e em quem teve DMG, e que foi menos eficaz que o placebo acima dos 60 anos), não ao estilo de vida.

**CORREÇÃO SUGERIDA:** "Base do manejo: mudança de estilo de vida para todos — inclusive em peso normal, onde dois ensaios em populações magras (Da Qing e DPP indiano, IMC ~26) reduziram a incidência de diabetes sem que o efeito fosse mediado por perda de peso. A METFORMINA é que tem benefício concentrado no sobrepeso/obesidade com intolerância à glicose (efeito semelhante ao do estilo de vida com IMC ≥35 e em mulheres com DMG prévio) e menos claro na GJA isolada; acima dos 60 anos foi menos eficaz que o placebo."

---

## ACHADO 12

**ENTRADA #21 — Prevenção do diabetes tipo 2 (ADA Standards of Care 2026)**

**SEVERIDADE:** OMISSÃO

**O QUE O NÚCLEO DIZ:**
> "Considerar metformina para prevenção, sobretudo em IMC ≥35 kg/m², idade <60 anos e mulheres com diabetes gestacional prévio."

**O QUE A FONTE DIZ:**
> "metformin therapy assess patients for vitamin b12 deficiency during prolonged metformin therapy"
> "drugs tend to lose their effect on progression to diabetes when discontinued."

**ONDE:** `1c0GoKq_bdLfZOEuJMJpwDZOO62RtoTry.json` fatos 119 e 62.

**CONDUTA QUE SAI DISSO:** a entrada prescreve metformina por tempo indefinido a pessoas que não têm diabetes e não pede nenhuma vigilância. A deficiência de B12 induzida por metformina cursa com parestesia e neuropatia — que, num paciente rotulado como pré-diabético, tende a ser atribuída ao próprio distúrbio glicêmico e não à droga.

**CORREÇÃO SUGERIDA:** acrescentar: "— em uso prolongado, avaliar deficiência de vitamina B12; e informar que o efeito preventivo tende a se perder com a descontinuação."

---

## ACHADO 13

**ENTRADA #2 — Diabetes na gestação (SBD)**

**SEVERIDADE:** OMISSÃO

**O QUE O NÚCLEO DIZ:**
> "metas jejum <95 e 2h pós-prandial <120 mg/dL (1h <140 na automonitorização)."

**O QUE A FONTE DIZ (nota do cofre designada FONTE PREFERENCIAL para DMG):**
> "**Jejum / pré-prandial:** **> 65 e < 95 mg/dL** (se risco de hipoglicemia: 70–99)."

**ONDE:** `cofre/Diretrizes Clínicas/Diabetes na Gestação — Diagnóstico, Metas e Tratamento (SBD).md`, seção "Metas glicêmicas na gestação". ⚠️ Fonte secundária: não há artigo sobre DMG entre os 47 extratos verbatim do acervo — não pude conferir contra texto-fonte.

**CONDUTA QUE SAI DISSO:** a meta chega como um teto sem piso. Quem titula insulina em gestante contra "jejum <95" persegue valores cada vez menores sem um ponto de parada, com hipoglicemia materna. As entradas #47 e #67 repetem a mesma lista de metas; só a #67 traz o limite inferior (">65 e <95"). Como cada entrada chega isolada, duas das três não o têm.

**CORREÇÃO SUGERIDA:** "…metas de automonitorização: jejum/pré-prandial >65 e <95 mg/dL (70–99 se houver risco de hipoglicemia), 1 h pós-prandial <140 e 2 h pós-prandial <120 mg/dL." Uniformizar o limite inferior nas três entradas de gestação (#2, #47, #67).

---

# Entradas sem achado

#18, #25, #26, #27, #28, #34, #35, #47, #51, #67, #73, #79, #85 não geraram achado — em parte porque conferiram com a fonte disponível (#51 e a #85 na parte de hiperparatireoidismo e de neuropatia autonômica), em parte porque não havia fonte para julgá-las (ver abaixo). A #20 e a #67 conferiram nos pontos que puderam ser conferidos.

# O que ficou sem fonte para conferir

**Sem nenhuma fonte no acervo (nem extrato, nem nota):** #18 (tecnologia/AID), #25 (iSGLT2 com eGFR ≥20, finerenona), #27 (metas do idoso), #28 (DM2 do jovem, titulação da metformina até 2.000 mg/dia), #34 (SOUL, SURPASS-CVOT, SUMMIT, STRIDE, ESSENCE), #73 (icodec/efsitora).

Buscas negativas que valem como resultado, feitas em todos os 47 textos-fonte com três grafias cada:
- **"finerenon"** — **zero** ocorrências. As três entradas que a recomendam (#0, #23, #25) não têm prova no acervo.
- **glicemia de 1 h no TOTG** — **zero** ocorrências para `209 mg`, `1-h(our) glucose`, `one-hour glucose`, `1-h OGTT`. O corte de **≥209 mg/dL (diabetes)** e a faixa **155–208 (pré-diabetes)** da entrada #20 não podem ser conferidos aqui. A entrada já se autodeclara "critério SBD/IDF, não contemplado pela ADA 2026", mas apresenta o valor na mesma lista "OU" dos critérios da ADA, sob um título que diz "(ADA Standards of Care 2026)" — quem ler só essa linha diagnostica diabetes por um critério que o corpo da própria linha diz não ser da fonte citada no título. Sem texto-fonte, não atribuo severidade; registro como pendência de verificação prioritária, junto da condição de coleta (preparo de 3 dias com carboidrato livre e jejum de 8 h), que a entrada não traz para nenhum dos cortes do TOTG.
- **icodec / once-weekly insulin** — **zero** ocorrências no acervo.

**Conferidas apenas contra nota do cofre (fonte secundária, sem extrato verbatim):** #2, #26, #47, #67, #79. Nesses casos a nota SUSTENTOU o núcleo, com a exceção do Achado 13. Registro em particular que o corte do teste de supressão com 1 mg de dexametasona da entrada #79 (>1,8 µg/dL) coincide com a nota "Medida do Cortisol na Síndrome de Cushing (JCEM 2026)" — mas o único extrato verbatim de Cushing do acervo (`13_9NRgWgJHDz2gBea-461LRF22zP7fUR`, metanálise JCEM 2020) não contém esse valor.

**Nenhuma nota do cofre do meu lote contradisse um extrato verbatim.** A única contradição encontrada envolvendo nota do cofre é a do Achado 9, e ela é entre duas entradas do núcleo — com cada lado apoiado por uma fonte diferente.

# Sugestões de conteúdo (não são defeitos)

- #35/#72: registrar que o teplizumabe exige **14 dias de infusão intravenosa** (Lancet Seminar 2023, fato 183) — é o que decide a viabilidade do encaminhamento.
- #22: a entrada detalha o potássio com precisão e não traz a dose de insulina nem a transição (0,1 → 0,02–0,05 U/kg/h com dextrose a ~200 mg/dL, mantida até a resolução da cetoacidose), que estão na mesma fonte (fatos 76, 77).
- #22: em criança, a fonte revoga a prática antiga de infundir fluido devagar para prevenir edema cerebral (ensaio PECARN FLUID, fato 71) — e o edema/lesão cerebral é a principal causa de morte pediátrica na CAD (fatos 8 e 55).

---

# Números

- **Entradas examinadas: 24** (todas as do lote)
- **Entradas conferidas contra texto-fonte verbatim: 13** (#0, #20, #21, #22, #23, #24, #29, #30, #35, #50, #51, #72, #85)
- **Entradas sem fonte verbatim para conferir: 11** (#2, #18, #25, #26, #27, #28, #34, #47, #67, #73, #79) — destas, 5 puderam ser conferidas contra nota do cofre (#2, #26, #47, #67, #79) e 6 ficaram sem nenhuma fonte (#18, #25, #27, #28, #34, #73)

**Achados: 13** — 1 GRAVE, 2 SÉRIOS, 4 IMPRECISOS, 6 OMISSÕES.

**Tokens:** não tenho instrumentação para medir o consumo desta sessão. Pela extensão do que foi lido (brief, 24 entradas, ~9 blocos de extratos e 4 leituras de texto-fonte bruto, 6 notas do cofre e 3 buscas negativas em todo o acervo), a estimativa é da ordem de 150–200 mil tokens de entrada e ~15 mil de saída. Trate como estimativa, não como medida.
