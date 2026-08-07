# -*- coding: utf-8 -*-
import json

F = []
def f(a, c, s):
    F.append({"afirmacao": a, "citacao": c, "secao": s})

# ---------------- Précis / quadro clínico ----------------
f("O cenário clínico típico da crise tireotóxica é paciente com bócio, taquicardia, sinais de hiperatividade autonômica (fezes amolecidas, hiperreflexia), febre e delirium agitado.",
  "Patients presenting with goiter, tachycardia, signs of autonomic hyperactivity (i.e., loose stools, hyperreflexia), fever, excited delirium.", "Précis")

f("A tempestade tireoidiana é uma forma emergencial de hipertireoidismo grave; o diagnóstico é CLÍNICO e NÃO se baseia na magnitude dos níveis de T4 ou T3. O escore de Burch-Wartofsky indica tempestade iminente com pontuação acima de 25.",
  "Thyroid storm is an emergent type of severe hyperthyroidism. Diagnosis is based on clinical features and not on the severity of T4 nor T3 lev- els. The Burch and Wartofsky assessment indicates impending thyroid storm at point values above 25.", "Précis")

f("Conduta imediata (1): inibir a síntese e liberação de hormônio tireoidiano com propiltiouracil (PTU) 400 mg por via oral a cada 6 horas.",
  "Inhibit thyroid hormone synthesis and release with propylthiouracil (PTU) 400 mg by mouth every 6 hours.", "Précis")

f("Conduta imediata (2): antagonizar os efeitos periféricos e biológicos dos hormônios tireoidianos com propranolol 80 mg por via oral a cada 6 horas e hidrocortisona 100 mg IV a cada 8 horas.",
  "Counteract the peripheral and biologic effects of thyroid hormones with pro- pranolol 80 mg by mouth every 6 hours and hydrocortisone 100 mg IV every 8 hours.", "Précis")

f("Conduta imediata (3 e 4): suporte com fluidos IV suplementados com tiamina e tratamento dos fatores precipitantes, como infecção.",
  "Provide supportive therapy with IV fluids supplemented with thiamine. (d) Treat precipitating factors such as infection.", "Précis")

# ---------------- Patogênese ----------------
f("A patogênese da tempestade tireoidiana não é totalmente compreendida: em geral NÃO há diferença nos níveis de hormônio tireoidiano entre pacientes com tireotoxicose 'não complicada' e aqueles em crise tireotóxica.",
  "The pathogenesis of thyroid storm is still not fully understood as there is usually no difference in thyroid hormone levels between patients with \u201cuncomplicated\u201d thyro- toxicosis and those undergoing a thyrotoxic crisis", "Patogênese")

f("Uma hipótese para a patogênese é o aumento da densidade de receptores β-adrenérgicos na célula-alvo ou modificações pós-receptor nas vias de sinalização, levando a maior sensibilidade às catecolaminas.",
  "One hypothesis that may explain the pathogenesis of thyroid storm is a possible increase in target cell \u03b2 (beta)-adrenergic receptor density or post-receptor modifi- cations in signaling pathways", "Patogênese")

f("Outra hipótese é o aumento dos hormônios livres: comparando seis pacientes com tempestade tireoidiana a 15 com tireotoxicose típica, Brooks e colaboradores acharam T4 livre médio MAIOR na tempestade, enquanto o T4 total era semelhante nos dois grupos.",
  r"In one study comparing six subjects with thyroid storm to 15 subjects with more typical thyrotoxicosis, Brooks and colleagues \[6\] found that the mean free thyroxine (FT4) concentration was higher in subjects with thyroid storm, whereas the total thyroxine (TT4) concentration was similar in both groups.", "Patogênese")

# ---------------- Etiologia ----------------
f("A doença de Graves é a causa mais comum de crise tireotóxica/tempestade tireoidiana, mediada por anticorpos contra o receptor de TSH que estimulam síntese e secreção excessivas e descontroladas de T4 e T3.",
  "Graves\u2019 disease remains the most common cause of thyrotoxic crisis/thyroid storm. Graves\u2019 disease is mediated by the thyrotropin (TSH) receptor antibodies that stim- ulate excess and uncontrolled synthesis and secretion of thyroid hormones", "Etiologia")

f("A tempestade também pode ocorrer com adenoma tóxico solitário ou bócio multinodular tóxico; causas raras incluem carcinoma tireoidiano hipersecretor (especialmente folicular), adenoma hipofisário secretor de TSH, struma ovarii/teratoma e mola hidatiforme secretora de hCG.",
  "Thyroid storm can also occur with a solitary toxic adenoma or toxic multinodular goiter. Rare causes of thyrotoxicosis that can lead to thyroid storm include hyperse- cretory thyroid carcinoma (specially follicular thyroid carcinoma), thyrotropin- secreting pituitary adenoma, struma ovarii/teratoma, and human chorionic gonadotropin-secreting hydatidiform mole.", "Etiologia")

f("É muito raro que a ingestão de excesso de T4 e/ou T3 exógenos se associe a tempestade tireoidiana.",
  "It is very rare for ingestion of excess exogenous T4 and/or T3 to be associated with thyroid storm.", "Etiologia")

f("Interferon-α e interleucina-2 podem causar tireotoxicose (por tireoidite destrutiva) durante o tratamento de hepatite viral e infecção por HIV.",
  "interferon-\u03b1 (alpha) (IFN-\u03b1) and inter- leukin- 2 (IL-2) can cause thyrotoxicosis (via destructive thyroiditis) during treat- ment for viral hepatitis and HIV infection", "Etiologia")

f("A amiodarona contém 70–75 mg de iodo por comprimido de 200 mg, e cerca de 10% disso (7–7,5 mg) é liberado como iodeto livre no metabolismo — aumento de 35 a 50 vezes em relação à ingestão ideal recomendada de 0,15–0,20 mg.",
  "Amiodarone contains 70\u201375 mg iodine per 200 mg tablet, and about 10% of it (7\u20137.5 mg) is released as free iodide during amiodarone metabolism (about a 35- to 50-fold increase when compared with the recommended optimal intake of 0.15\u20130.20 mg)", "Etiologia")

f("O hipertireoidismo pode ser agravado por exposição ao iodo, o que ocorre após administração intravenosa de contraste radiológico ou durante/após uso de amiodarona.",
  "Of relevance is hyperthyroidism aggravated by iodine exposure, which can occur following the intravenous adminis- tration of radiocontrast dye or during or after amiodarone administration.", "Etiologia")

f("Um evento precipitante geralmente causa a transição de tireotoxicose para tempestade: cirurgia, trauma, infarto do miocárdio, tromboembolismo pulmonar, cetoacidose diabética, parto ou infecção grave.",
  "A precipitating event usually causes the transition from thyrotoxicosis to thyroid storm. Triggering events include systemic insults such as surgery, trauma, myocar- dial infarction, pulmonary thromboembolism, diabetic ketoacidosis, parturition, or severe infection", "Etiologia")

f("Outros gatilhos relatados: suspensão de antitireoidianos, ingestão excessiva ou administração intravenosa de iodo (amiodarona, contrastes), radioiodoterapia e até uso de pseudoefedrina e salicilatos (que podem aumentar desproporcionalmente os hormônios livres).",
  "Thyroid storm has also been reported to be precipitated by the discontinuation of antithyroid drugs, excessive ingestion, intravenous administra- tion of iodine (e.g., amiodarone, radiocontrast dyes), radioiodine therapy, and even pseudoephedrine and salicylate use (salicylates may increase free thyroid hormone levels disproportionately)", "Etiologia")

f("A causa precipitante mais comum de tempestade tireoidiana atualmente parece ser a INFECÇÃO, embora seja difícil saber se os relatos publicados espelham a frequência real.",
  "The most common precipitating cause of thyroid storm currently seems to be infection, although it is difficult to know if published reports mirror actual frequen- cies", "Etiologia")

# ---------------- Escore de Burch-Wartofsky ----------------
f("Escore de Burch-Wartofsky — disfunção termorregulatória (temperatura): 37,2–37,7 °C = 5 pontos; 37,8–38,2 °C = 10; 38,3–38,8 °C = 15; 38,9–39,4 °C = 20; 39,5–39,9 °C = 25; ≥40,0 °C = 30 pontos.",
  "Thermoregulatory dysfunction Temperature (\u00b0F)/(\u00b0C) 99.0\u201399.9/37.2\u201337.7 5 100.0\u2013100.9/37.8\u201338.2 10 101.0\u2013101.9/38.3\u201338.8 15 102.0\u2013102.9/38.9\u201339.4 20 103.0\u2013103.9/39.5\u201339.9 25 \u2265104.0/\u226540.0 30", "Tabela 9.2 — escore de Burch-Wartofsky")

f("Escore de Burch-Wartofsky — taquicardia (bpm): 100–109 = 5 pontos; 110–119 = 10; 120–129 = 15; 130–139 = 20; ≥140 = 25 pontos.",
  "Cardiovascular Tachycardia (beats/min) 100\u2013109 5 110\u2013119 10 120\u2013129 15 130\u2013139 20 \u2265140 25", "Tabela 9.2 — escore de Burch-Wartofsky")

f("Escore de Burch-Wartofsky — fibrilação atrial: ausente = 0, presente = 10 pontos. Insuficiência cardíaca congestiva: ausente = 0; leve (edema de membros) = 5; moderada (estertores bibasais) = 10; grave (edema pulmonar) = 20 pontos.",
  "Atrial fibrillation Absent 0 Present 10 Congestive heart failure Absent 0 Mild (pedal edema) 5 Moderate (bibasilar rales) 10 Severe (pulmonary edema) 20", "Tabela 9.2 — escore de Burch-Wartofsky")

f("Escore de Burch-Wartofsky — disfunção gastrointestinal-hepática: ausente = 0; moderada (diarreia, dor abdominal, náusea/vômito) = 10; grave (icterícia inexplicada) = 20 pontos.",
  "Gastrointestinal-hepatic dysfunction Absent 0 Moderate (diarrhea, abdominal pain, nausea/vomit) 10 Severe (unexplained jaundice) 20", "Tabela 9.2 — escore de Burch-Wartofsky")

f("Escore de Burch-Wartofsky — distúrbio do sistema nervoso central: ausente = 0; leve (agitação) = 10; moderado (delirium, psicose, letargia extrema) = 20; grave (convulsão, coma) = 30 pontos.",
  "Central nervous system disturbance Absent 0 Mild (agitation) 10 Moderate (delirium, psychosis, extreme lethargy) 20 Severe (seizure, coma) 30", "Tabela 9.2 — escore de Burch-Wartofsky")

f("Escore de Burch-Wartofsky — história de fator precipitante: ausente = 0, presente = 10 pontos. INTERPRETAÇÃO DO TOTAL: ≥45 = tempestade tireoidiana; 25–44 = tempestade iminente; <25 = tempestade improvável.",
  r"Precipitating history Absent 0 Present 10 Total score: \u226545, thyroid storm; 25\u201344, impending thyroid storm; \<25, unlikely thyroid storm".replace(r"\u226545", "\u226545").replace(r"\u201344", "\u201344"),
  "Tabela 9.2 — escore de Burch-Wartofsky")

f("Apesar de útil, a classificação por pontos não deve travar a conduta: é prudente, na maioria das circunstâncias, assumir que quem tem tireotoxicose grave está em tempestade iminente e tratar agressivamente, em vez de focar em definições específicas.",
  "Although this classification is helpful clinically, it is pru- dent, in most circumstances, to assume that someone with severe thyrotoxicosis has impending thyroid storm, and to treat them aggressively, rather than focus on spe- cific definitions.", "Apresentação clínica")

# ---------------- Apresentação clínica ----------------
f("A tempestade tireoidiana faz parte de um contínuo que começa com tireotoxicose descompensada; o ponto exato em que a tireotoxicose vira tempestade não é claro e é relativamente subjetivo.",
  "Thyroid storm is part of a continuum that begins with the development of decom- pensated thyrotoxicosis. The point at which thyrotoxicosis transforms to thyroid storm is not clear and is relatively subjective.", "Apresentação clínica")

f("Idosos podem não manifestar sintomas típicos e apresentar tireotoxicose 'apática': perda de peso, palpitações, fraqueza, tontura, síncope ou perda de memória, com taquicardia sinusal ou fibrilação atrial ao exame.",
  "Older individuals may not manifest the typical symptoms of thyrotoxicosis. They may present with \u201capathetic\u201d thyrotoxicosis, with symptoms including weight loss, palpitations, weakness, dizziness, syncope, or memory loss, and physical find- ings of sinus tachycardia or atrial fibrillation", "Apresentação clínica")

f("Manifestação constitucional: perda de peso apesar de ingestão calórica igual ou maior, pelo estado hipermetabólico que desequilibra produção e uso de energia, com aumento da produção e eliminação de calor.",
  "Weight loss, despite having the same or greater caloric intake: due to the hypermetabolic state that results in an imbalance between energy production and use, resulting in increased heat production and elimination", "Tabela 9.3 — manifestações clínicas")

f("Manifestações neuropsiquiátricas: labilidade emocional, inquietação, ansiedade, agitação, confusão, psicose e até coma; desempenho ruim em testes de memória e concentração proporcional ao grau de tireotoxicose; perda muscular, hiperreflexia, tremor fino e paralisia periódica.",
  "Emotional lability, restlessness, anxiety, agitation, confusion, psychosis, and even coma Behavioral studies reveal poor performance in memory and concentration testing proportional to the degree of thyrotoxicosis Muscle wasting, hyperreflexia, fine tremor, periodic paralysis", "Tabela 9.3 — manifestações clínicas")

f("Acometimento hepático: elevação de AST e ALT foi relatada em 27% e 37% dos pacientes, respectivamente, e a maioria não mostrava outras características clínicas ou bioquímicas de comprometimento hepático.",
  "Increase in the aspartate aminotransferase (AST) and alanine aminotransferase (ALT) was reported in 27% and 37% of patients, respectively. The majority of these patients showed no other clinical or biochemical features of liver impairment", "Tabela 9.3 — manifestações clínicas")

f("O mecanismo da lesão hepática parece ser hipóxia relativa nas regiões perivenulares, por aumento da demanda de oxigênio hepático sem aumento proporcional do fluxo sanguíneo hepático, associado ao início da insuficiência cardíaca (muitas vezes precipitada por arritmias).",
  "The mechanism of injury appears to be relative hypoxia in the perivenular regions, due to an increase in hepatic oxygen demand without an appropriate increase in hepatic blood flow generally associated with the onset of heart failure (often precipitated by arrhythmias)", "Tabela 9.3 — manifestações clínicas")

f("Lesão colestática: fosfatase alcalina sérica elevada (origem óssea ou hepática) é vista em 64% dos pacientes com tireotoxicose; gama-GT elevada em 17% e bilirrubina em 5% como indicadores de colestase.",
  "Elevated serum alkaline phosphatase (bone or liver origin) is seen in 64% of patients with thyrotoxicosis Elevations in gamma-glutamyl transpeptidase (17%) and bilirubin (5%) as indicators of cholestasis", "Tabela 9.3 — manifestações clínicas")

f("Icterícia é incomum; quando ocorre, é preciso excluir complicações da tireotoxicose (insuficiência cardíaca/sepse) ou doença hepática intrínseca.",
  "Jaundice is uncommon, but when it occurs, complications of thyrotoxicosis (heart failure/sepsis) or intrinsic liver disease need to be excluded", "Tabela 9.3 — manifestações clínicas")

f("Na grande maioria dos casos as alterações hepáticas associadas ao hipertireoidismo são reversíveis com o reconhecimento e tratamento precoces do distúrbio.",
  "In the vast majority of cases, the hepatic abnormalities associated with hyperthyroidism are reversible, following the early recognition and treatment of the disorder", "Tabela 9.3 — manifestações clínicas")

# ---------------- Diagnóstico laboratorial ----------------
f("A distinção entre tireotoxicose grave e tireotoxicose ameaçadora à vida é juízo clínico; é mais prudente tratar agressivamente o suspeito do que investigar em excesso se o caso preenche critérios. Esses pacientes exigem monitorização clínica estreita, geralmente em unidade de terapia intensiva.",
  "However, it is most prudent to treat a patient suspected of having thyroid storm aggressively for his/her hyperthyroidism/thyrotoxicosis rather than excessively investigate whether this case really meets the criteria for thyroid storm. These patients require close clinical monitoring usually in an intensive care unit.", "Diagnóstico")

f("NÃO existe ponto de corte de T4 ou T3 séricos que discrimine tireotoxicose grave de tempestade. Além disso, doentes sistemicamente graves têm capacidade REDUZIDA de converter T4 em T3 — portanto um T3 minimamente elevado ou até 'normal' pode ser considerado inapropriadamente elevado nesse contexto.",
  "There is no arbitrary serum T4 or T3 cutoff that discriminates severe thyrotoxi- cosis from thyroid storm. Brooks et al. found no significant difference in the levels of serum triiodothyronine among patients with thyroid storm vs. uncomplicated thyrotoxicosis \\[2\\]. Also, systemically ill patients have decreased ability to convert T4 to T3. Therefore, a minimally elevated T3 or even a \u201cnormal\u201d T3 may be consid- ered inappropriately elevated in this context.", "Diagnóstico")

f("Na tempestade, o padrão de T4 livre e T3 livre elevados com TSH deprimido (menos de 0,05 mU/mL em ensaios de terceira geração) pode ser comparável ao da tireotoxicose 'não complicada' (na qual o TSH é sempre indetectável).",
  "In thyroid storm, the pattern of elevated free T4 and free T3 with a depressed thyrotropin (TSH) (less than 0.05 mU/mL (in third-generation TSH assays)) can be comparable to the levels seen in \u201cuncomplicated\u201d thyrotoxicosis (the TSH is always undetectable).", "Diagnóstico")

f("A tireoide secreta todo o T4 circulante; cerca de 80% do T3 circulante vem da monodesiodação do T4 em tecidos periféricos pelas desiodases tipo I (D1) e II (D2), e apenas cerca de 20% vem da secreção tireoidiana direta.",
  "The thyroid gland secretes all of the circulating T4. Approximately 80% of cir- culating T3 is derived from monodeiodination of T4 in peripheral tissues by types I (D1) and II (D2) deiodinases, whereas only about 20% comes from direct thyroi- dal secretion.", "Diagnóstico")

f("Apenas uma pequena fração dos hormônios circula livre e não ligada — 0,025% do T4 e 0,35% do T3 — e é ela que está disponível aos tecidos para ação biológica.",
  "Only a small fraction of the hormones, 0.025% of T4 and 0.35% of T3, are free and unbound", "Diagnóstico")

f("Condições que aumentam a TBG (e portanto T4 e T3 totais) incluem hepatite infecciosa, gravidez, estrogênios e opiáceos; heparina, furosemida, fenitoína, carbamazepina, diazepam, salicilatos e AINEs interferem na ligação proteica — por isso as concentrações de hormônio LIVRE são preferíveis no diagnóstico de tireotoxicose.",
  "Conditions that increase TBG (and as a result total T4 and T3) include infectious hepatitis, pregnancy, estrogens, and opiates. In addition, many drugs interfere with protein binding, including heparin, furosemide, phenytoin, carbam- azepine, diazepam, salicylates, and nonsteroidal anti-inflammatory drugs. Therefore, free hormone concentrations are preferable in the diagnosis of thyro- toxicosis", "Diagnóstico")

f("Em menos de 5% dos pacientes com tireotoxicose há aumento do T3 livre com T4 livre 'normal' — a chamada T3-toxicose.",
  "In less than 5% of patients who have thyrotoxicosis, there can be an increase in serum-free T3 while having a \u201cnor- mal\u201d free T4 (\u201cT3 toxicosis\u201d)", "Diagnóstico")

f("A razão T3/T4 ajuda a distinguir a etiologia: na doença de Graves e no bócio nodular tóxico a razão T3/T4 costuma ser MAIOR que 20; na tireotoxicose por tireoidite, exposição a iodo ou levotiroxina exógena, a razão T3/T4 é MENOR que 15.",
  "The T3/T4 ratio may be helpful in distin- guishing the etiology of thyrotoxicosis. With Graves\u2019 disease and toxic nodular goiter, as there tends to be a higher proportion of T3, the T3/T4 ratio is usually greater than 20. With thyrotoxicosis caused by thyroiditis, iodine exposure, or exogenous levothyroxine intake, there is generally a greater proportion of T4, with a T3/T4 ratio of less than 15", "Diagnóstico")

f("Outros achados laboratoriais na tireotoxicose: hiperglicemia (inibição da liberação de insulina por catecolaminas e aumento da glicogenólise), hipercalcemia leve (reabsorção óssea estimulada pelo hormônio tireoidiano), fosfatase alcalina levemente elevada, leucocitose e transaminases elevadas.",
  "Other laboratory findings that may be associated with thyrotoxicosis include hyperglycemia (due to catecholamine-induced inhibition of insulin release and increased glycogenolysis), mild hypercalcemia (due to enhanced thyroid hormone- stimulated bone resorption), mildly elevated alkaline phosphatase (both form liver and bone origin), leukocytosis, and elevated liver enzymes (ALT, AST)", "Diagnóstico")

f("A tireotoxicose acelera o metabolismo do cortisol endógeno e exógeno ao estimular a etapa limitante da degradação dos glicocorticoides (enzimas hepáticas D4,5-esteroide-redutases), acelerando também a depuração de corticosterona, desoxicorticosterona e aldosterona.",
  "Thyrotoxicosis accelerates the metabolism of endogenous or exogenous cortisol by stimulating the rate-limiting step in the degradation of glucocorticoids (accomplished by the hepatic enzymes, D4,5 steroid reductases). Therefore, steroids, including cortisol, corticos- terone, deoxycorticosterone, and aldosterone, are metabolized at an accelerated rate", "Diagnóstico")

f("Na tireotoxicose tanto a degradação quanto a produção de cortisol estão aceleradas, resultando em cortisol circulante normal a elevado — mas, dada a condição de estresse da tempestade, um cortisol NORMAL pode ser interpretado como insuficiência adrenal RELATIVA.",
  "However, in thyrotoxicosis, both degradation and production of cortisol are accelerated, resulting in a normal to increased circulating cortisol level. Given the stressful condition of thyroid storm, a normal cortisol level may be interpreted as a relative adrenal insufficiency.", "Diagnóstico")

f("A resposta do cortisol ao teste de estímulo com ACTH deve ser normal; porém, na tireotoxicose grave e de longa duração, a reserva adrenocortical pode estar diminuída.",
  "Serum cortisol response to a corticotropin (ACTH) stimulation test should be normal. However, in long-standing, severe thyrotoxicosis, adrenocortical reserve can be diminished", "Diagnóstico")

f("Tsatsoulis e colaboradores avaliaram a reserva adrenocortical em dez pacientes com tireotoxicose grave e prolongada (4–6 meses) com teste de estímulo com ACTH em baixa dose (0,1 μg/kg em bolus IV) e encontraram resposta de cortisol significativamente reduzida no estado tireotóxico em comparação ao estado eutireóideo.",
  "Tsatsoulis and colleagues \\[19\\] assessed adrenocortical reserve in ten subjects with severe, long-standing (4\u20136 months) thyrotoxicosis with a low-dose corticotropin (ACTH) stimulation test (0.1 \u03bcg/kg of ACTH given as IV bolus) and found that the cortisol response decreased significantly when subjects were thyrotoxic, compared with the cortisol response in the euthyroid state.", "Diagnóstico")

f("Exames de imagem seccionais não são necessários para diagnosticar tireotoxicose ou tempestade, mas radiografia de tórax (ou TC de tórax SEM contraste iodado) ajuda a identificar foco infeccioso precipitante.",
  "However, in the evaluation of thyroid storm, a chest X-ray (or chest CT without iodinated contrast) would be helpful to determine a pos- sible infectious source as a precipitant.", "Diagnóstico")

f("O radiocontraste IV contém iodo em quantidade significativa e pode agravar o hipertireoidismo, sobretudo em pacientes não bloqueados; a cintilografia/captação de radioiodo geralmente NÃO é feita inicialmente pela urgência do contexto clínico.",
  "The IV radiocontrast contains significant 78iodine and may aggravate the hyperthyroidism, especially in unblocked patients. Nuclear medicine imaging (radioactive iodine uptake and scan) is usually not per- formed initially given the urgency and clinical context.", "Diagnóstico")

f("A ultrassonografia de tireoide com Doppler é teste não invasivo e disponível: a glândula hipersecretora costuma estar aumentada e com fluxo Doppler exuberante, enquanto na tireoidite subaguda/pós-parto/silenciosa ou nas causas exógenas a glândula é pequena e com fluxo Doppler reduzido.",
  "A noninvasive readily available test is a thyroid ultrasound with Doppler flow to assess thyroid gland size, vascularity, and the presence of nodules. Typically, a thyroid gland secreting excessive hormones would be enlarged and have enhanced Doppler flow. On the other hand, in the setting of subacute, postpartum, or silent thyroiditis or exogenous causes of hyperthyroidism, the thyroid gland would be expected to be small, with decreased Doppler flow.", "Diagnóstico")

f("No eletrocardiograma da tireotoxicose observam-se taquicardia sinusal (40%) e fibrilação atrial (10–20%), mais frequentes em pacientes com mais de 60 anos, que têm maior chance de cardiopatia estrutural ou doença arterial coronariana subjacentes.",
  "Electrocardiogram manifestations of thyrotoxicosis include sinus tachycardia (40%) and atrial fibrillation (10\u201320%), occurring more commonly in patients older than 60, who are more likely to have underlying structural heart disease or coronary artery disease", "Diagnóstico")

# ---------------- Tratamento: princípios e ORDEM ----------------
f("O tratamento medicamentoso da tempestade baseia-se em três princípios: inibição da síntese e liberação de hormônio tireoidiano; antagonismo dos efeitos periféricos e biológicos dos hormônios; e tratamento das complicações sistêmicas. Essas medidas devem produzir melhora clínica em 12–24 h.",
  "Medical treatment of thyroid storm is based on three principles: (1) inhibition of thyroid hormone synthesis and release; (2) counteracting the peripheral, biologic effects of thyroid hormones; and (3) treatment of systemic complications. These measures should bring about clinical improvement within 12\u201324 h", "Tratamento")

f("A ORDEM da terapia importa: a inibição da síntese de novo hormônio com uma TIONAMIDA deve ser iniciada ANTES da terapia com iodo, para evitar a estimulação de nova síntese hormonal que ocorre quando o iodo é dado primeiro. O intervalo entre o antitireoidiano e a administração de iodo é de PELO MENOS 60 minutos.",
  r"the order of therapy is important: Inhibition of thyroid gland synthesis of new thyroid hormone with a thionamide should be initiated before iodine therapy, to prevent the stimulation of new thyroid hormone synthesis that can occur when iodine is given initially \[3, 7, 16\]. The time delay between antithyroid medications and iodine administration is at least 60 minutes.", "Tratamento")

f("Na tabela de manejo, a nota reforça: administrar o iodo pelo menos 1 h APÓS a tionamida, e usar UM agente de cada grupo conforme indicado clinicamente.",
  "Administer at least 1 h after thionamide cUse one agent of each group as clinically indicated", "Tabela 9.4 — manejo da tempestade")

f("Doses de tionamida na tabela de manejo da tempestade: metimazol 20–30 mg VO a cada 6 h; propiltiouracil 200–400 mg VO a cada 6–8 h (o PTU também diminui a conversão periférica de T4 em T3).",
  "Methimazole 20\u201330 mg PO q6 h Propylthiouracil 200\u2013400 mg PO q6\u20138 h Decrease peripheral T4 \u2192 T3 conversion", "Tabela 9.4 — manejo da tempestade")

f("Doses de iodeto na tempestade: SSKI 5 gotas VO a cada 6 h (SSKI 1 g/mL contém 76,4% de iodo; 20 gotas/mL = 764 mg de iodo), ou 5–10 gotas por via retal a cada 6–8 h, ou 8 gotas sublinguais a cada 8 h — sempre APÓS o antitireoidiano.",
  "SSKId 5 drops PO q6 h or SSKI 1 g/mL contains 76.4% iodine, 20 drops/ 5\u201310 drops per rectum q6\u20138 h or mL = 764 mg iodine After antithyroid medications given 8 drops sublingual q8 h", "Tabela 9.4 — manejo da tempestade")

f("Solução de Lugol na tempestade: 4–8 gotas VO a cada 6–8 h, ou 5–10 gotas por via retal a cada 6–8 h, ou 5–10 gotas IV a cada 6–8 h.",
  "Lugol\u2019s solutiond 4\u20138 drops PO q6\u20138 h or 5\u201310 drops per rectum q6\u20138 h or 5\u201310 drops IVd q6\u20138 h", "Tabela 9.4 — manejo da tempestade")

f("A solução de Lugol contém 125 mg/mL de iodo total: 100 mL equivalem a 5 g de iodo e 10 g de iodeto de potássio; deve ser dada após os antitireoidianos.",
  "125 mg/mL of total iodine, 100 mL = 5 g of iodine and 10 g potassium iodide After antithyroid medications given", "Tabela 9.4 — manejo da tempestade")

# ---------------- Tionamidas ----------------
f("As duas classes de antitireoidianos são os tiouracis e os imidazóis: o propiltiouracil é um tiouracil, enquanto metimazol e carbimazol são imidazóis. O carbimazol não está disponível nos EUA, é mais usado na Europa e é rapidamente metabolizado a metimazol.",
  "The two specific antithyroid agent classes are thiouracils and imidazoles. Propylthiouracil (PTU) is a thiouracil, whereas methimazole (MMI) and carbima- zole are imidazoles. Carbimazole is not available in the United States and is more commonly used in Europe. Carbimazole is metabolized rapidly to MMI", "Antitireoidianos (tionamidas)")

f("As tionamidas interferem no acoplamento catalisado pela tireoperoxidase que une resíduos de iodotirosina para formar T4 e T3; o PTU, mas NÃO o metimazol, também inibe a conversão periférica de T4 em T3.",
  "Thionamides interfere with the thyroperoxidase-catalyzed coupling process by which iodotyrosine residues are combined to form T4 and T3. Thionamides may also have an inhibitory effect on thyroid follicular cell function and growth \\[20\\]. PTU, but not MMI, also inhibits the peripheral conversion of T4 to T3.", "Antitireoidianos (tionamidas)")

f("As tionamidas ainda têm efeitos imunossupressores clinicamente relevantes: reduzem os títulos de anticorpo antirreceptor de TSH ao longo do tempo e diminuem moléculas imunologicamente importantes como a molécula de adesão intracelular 1 e a interleucina-2 solúvel.",
  "Thionamides may also have clinically relevant immunosuppressive effects, including decreasing antithyrotropin-receptor antibody titers over time and decreasing levels and activi- ties of other immunologically important molecules, such as intracellular adhesion molecule 1 and soluble interleukin-2 (IL-2).", "Antitireoidianos (tionamidas)")

f("O metimazol circula livre no soro, enquanto 80–90% do propiltiouracil está ligado à albumina; acredita-se que o metimazol tenha duração de ação mais longa que o PTU.",
  "MMI circulates free or unbound in the serum, whereas 80\u201390% of propylthio- uracil is bound to albumin \\[20, 22\\]. Both agents are concentrated within the thy- roid gland where they exert their major actions. It is believed that MMI has a longer duration of action as compared to PTU.", "Antitireoidianos (tionamidas)")

f("Dose de PTU na tempestade tireoidiana: 800 a 1200 mg/dia em doses divididas de 200 ou 300 mg a cada 6 h. Dose de metimazol: 80 a 120 mg/dia em doses divididas de 20–30 mg a cada 6 h; uma vez estável o paciente, a frequência pode cair para 1–2 vezes ao dia e as doses podem ser reduzidas.",
  "The dosing of PTU in thyroid storm is 800 to 1200 mg daily in divided doses of 200 or 300 mg every 6 h. The dosing for MMI is 80 to 120 mg daily in divided doses of 20\u201330 mg every 6 h (once the patient is stable, the frequency of dosing can be decreased to once or twice daily, and the dose of these agents can be decreased)", "Antitireoidianos (tionamidas)")

f("Tanto o metimazol quanto o propiltiouracil podem ser administrados por via RETAL — via mais relevante para pacientes com problemas gastrointestinais graves que impedem a via oral ou com má absorção grave.",
  "Typically, administration has been orally; however, both MMI and propylthiouracil can be administered rectally \\[23\u201327\\]. The rectal administration is most relevant to patients with severe GI issues in which they cannot take medication orally or if they have severe malabsorption.", "Antitireoidianos (tionamidas)")

f("Não há formulação parenteral de tionamida comercialmente disponível, mas há relatos de caso de metimazol administrado por via intravenosa quando as vias oral e retal não puderam ser usadas.",
  "Although there are no commercially available parenteral formulations of the thionamides, there are case reports of MMI being administered intravenously when the oral and rectal routes could not be used", "Antitireoidianos (tionamidas)")

f("Formulação IV improvisada de metimazol descrita na literatura: 500 mg de pó em NaCl 0,9% até volume total de 50 mL (metimazol 10 mg/mL), infundido filtrado por filtro de 0,22 μm em 2 minutos seguido de flush salino, na dose de 20–40 mg a cada 6–8 h.",
  "Methimazole 500 mg powder 0.9% NaCl total volume of 50 mL (methimazole 10 mg/mL) IV filtered through a 0.22 \u03bcm filter over 2 min, followed by saline flusha 20\u201340 mg every 6\u20138 h", "Tabela 9.5 — formulações não orais")

f("Enema de propiltiouracil descrito na literatura: 600 mg em 90 mL de água estéril, na dose de 400–600 mg a cada 6 h.",
  "Propylthiouracil 600 mg 90 mL sterile water Enemab 400- 600 mg every 6 h", "Tabela 9.5 — formulações não orais")

f("Preparo do enema: entregar por cateter de Foley inserido no reto e insuflar o balão para prevenir vazamento.",
  "For enema preparation, deliver by Foley catheter inserted into the rectum and inflate balloon to prevent leakage", "Tabela 9.5 — formulações não orais")

f("Jongjaroenprasert e colaboradores demonstraram que a forma de ENEMA de PTU tem melhor biodisponibilidade que a de supositório, embora ambas tenham efeito terapêutico comparável.",
  "Jongjaroenprasert et al. demonstrated that the enema form of PTU provided bet- ter bioavailability than the suppository form. However, both preparations proved to have comparable therapeutic effect", "Antitireoidianos (tionamidas)")

f("Efeitos adversos possíveis do metimazol e do PTU: alteração do paladar, prurido, urticária, febre e artralgias; mais raros porém graves são agranulocitose, hepatotoxicidade e vasculite.",
  "Possible adverse effects of MMI and PTU include abnormal sense of taste, pru- ritus, urticaria, fever, and arthralgias. More rare but serious adverse effects include agranulocytosis, hepatotoxicity, and vasculitis.", "Antitireoidianos (tionamidas)")

f("Agranulocitose grave (<500/mm3) ocorreu em 0,37% dos que receberam propiltiouracil e 0,35% dos que receberam metimazol em um estudo; a maioria dos casos ocorre nos primeiros 3 meses de tratamento.",
  "A serious side effect is agranulocytosis. 0.37% of subjects receiving propylthio- uracil and 0.35% of subjects receiving MMI develop severe agranulocytosis (\\<500/ mm3) in one study \\[31\\]. Most cases of agranulocytosis occur in the first 3 months of", "Antitireoidianos (tionamidas)")

f("Com metimazol, a agranulocitose tende a ser DOSE-DEPENDENTE, sobretudo em doses acima de 40 mg/dia; com propiltiouracil ela NÃO parece ser dose-dependente. Pode ocorrer a qualquer momento com qualquer das duas drogas, e a monitorização estreita é obrigatória.",
  "When MMI is the culprit, agranulocytosis tends to be dose-related, especially at doses more than 40 mg daily. However, agranulocy- tosis does not appear to be dose-related with propylthiouracil use \\[21, 22\\]. Nonetheless, agranulocytosis can occur at any time with either MMI or PTU, and close monitoring is mandatory.", "Antitireoidianos (tionamidas)")

f("O G-CSF parece efetivo em encurtar o tempo de recuperação da agranulocitose induzida por antitireoidianos se a contagem de granulócitos estiver acima de 0,1 × 109/L, embora outro estudo não tenha demonstrado esse benefício; seu uso pode ser recomendado considerando o contexto individual.",
  "The use of granulocyte colony-stimulating factor (G-CSF) for treatment of agranulocytosis induced by antithyroid medications seems to be effective in shortening the recovery time if the granulocyte count was above 0.1 \u00d7 109/L \\[32, 33\\]. Another study, however, did not demonstrate this beneficial effect \\[34\\]. Therefore, the use of G-CSF can be recommended for treatment of anti- thyroid drug-induced agranulocytosis, with consideration of the individual con- text", "Antitireoidianos (tionamidas)")

f("A hepatotoxicidade ocorre em 0,1–0,2% dos pacientes em uso de antitireoidianos: a induzida por PTU tende a ser hepatite alérgica com lesão hepatocelular, enquanto a induzida por metimazol tende a ser colestática.",
  "Hepatotoxicity can occur in 0.1\u20130.2% of patients using antithyroid drugs. PTU- induced hepatotoxicity tends to be an allergic hepatitis with evidence of hepatocel- lular injury, whereas MMI-induced hepatotoxicity tends to result in a cholestatic process", "Antitireoidianos (tionamidas)")

f("A vasculite associa-se mais ao propiltiouracil que ao metimazol e vem com marcadores sorológicos p-ANCA e anti-mieloperoxidase; a positividade do ANCA associa-se a insuficiência renal aguda, artrite, ulcerações cutâneas, rash vasculítico, alterações neurológicas e possivelmente sinusite ou hemoptise.",
  "Vasculitis is associated more commonly with propylthiouracil than with MMI, and is associated with serologic markers: perinuclear antineutrophil cytoplasmic antibodies (p-ANCA) and anti-myeloperoxidase (anti-MPO) antibodies. Antineutrophil cytoplasmic antibody (ANCA) positivity is associated with acute renal failure, arthritis, skin ulcerations, vasculitic rash, neurological changes, and possibly sinusitis or hemoptysis", "Antitireoidianos (tionamidas)")

f("O metimazol é mais efetivo que o PTU no controle do hipertireoidismo grave.",
  "And finally, MMI is more effec- tive than PTU in controlling severe hyperthyroidism", "Antitireoidianos (tionamidas)")

f("O PTU é o tratamento preferido para hipertireoidismo no PRIMEIRO TRIMESTRE da gestação: recomenda-se trocar metimazol por PTU se a gravidez for confirmada no primeiro trimestre e considerar a volta ao metimazol depois do primeiro trimestre.",
  "However PTU is the pre- ferred treatment for hyperthyroidism in the first trimester of pregnancy. It is recommended that patients on MMI be switched to PTU if pregnancy is confirmed in the first trimester. Following the first trimester, consideration should be given to switching to MMI", "Antitireoidianos (tionamidas)")

# ---------------- Iodo ----------------
f("A terapia com iodo complementa a tionamida ao bloquear a liberação do hormônio pré-formado e reduzir o transporte e a oxidação do iodeto nas células foliculares; essa queda da organificação por doses crescentes de iodeto inorgânico é o efeito Wolff-Chaikoff.",
  "Iodine therapy complements the effects of thionamide therapy by blocking the release of pre-stored thyroid hormone and decreasing iodide transport and oxida- tion in follicular cells. This decrease in organification due to increasing doses of inorganic iodide is known as the \u201cWolff-Chaikoff\u201d effect.", "Terapia com iodo")

f("Apesar da manutenção de doses altas de iodeto, a tireoide ESCAPA dessa inibição aproximadamente após 48–72 h, ao adaptar o sistema de transporte de iodeto modulando a atividade do simportador sódio-iodeto — o chamado 'escape do efeito Wolff-Chaikoff'.",
  "However, despite maintenance of high doses of iodide, the thyroid gland eventually escapes this inhibition, approximately after 48\u201372 h, as the iodide transport system adapts to the higher concentration of iodide by modulating the activity of the sodium-iodide symporter", "Terapia com iodo")

f("Embora o iodeto seja rápido e eficaz em reduzir os hormônios tireoidianos, a maioria dos pacientes escapa da inibição e volta ao hipertireoidismo em 2–3 semanas; por isso o uso a longo prazo de iodo exógeno para hipertireoidismo é desencorajado.",
  "Although iodide is rapid and effective in reducing serum thyroid hormone levels, most patients escape the inhi- bition, returning to hyperthyroidism within 2\u20133 weeks. This increase in T4 and T3 synthesis and secretion can occur at variable time intervals and can also occur in patients being treated with PTU or MMI. As a result, the long-term use of exog- enous iodine for hyperthyroidism is discouraged.", "Terapia com iodo")

f("Dar iodo ANTES da tionamida pode estimular nova síntese hormonal na fase aguda; e, depois da fase aguda, o uso prévio de iodo exógeno aumenta o risco cirúrgico (por enriquecer os estoques hormonais) e obriga a adiar a ablação com radioiodo até a depuração adequada da carga de iodo.",
  "can stimulate new hormone synthesis if given prior to thionamide treatment. After the acute phase, when planning definitive therapy for thyrotoxicosis, the prior use of exogenous iodine can predispose a patient to increased surgical risk because of the enrichment of thyroid hormone stores. It can also cause postponement of radioio- dine ablation until an adequate clearance of the iodine load occurs", "Terapia com iodo")

f("Doses de iodo inorgânico na tempestade: 0,2–2 g por dia, sendo 4–8 gotas de solução de Lugol (20 gotas/mL e 6–8 mg de iodo/gota) a cada 6–8 h, ou 5 gotas de SSKI (20 gotas/mL e 38 mg de iodeto/gota) a cada 6 h.",
  "The dosing for these preparations in thyroid storm is 0.2\u20132 g daily, with 4\u20138 drops of Lugol\u2019s solution (assuming 20 drops/mL and 6\u20138 mg iodine/drop) every 6\u20138 h and 5 drops of SSKI (with 20 drops/mL and 38 mg iodide/drop) every 6 h", "Terapia com iodo")

# ---------------- Betabloqueio ----------------
f("O propranolol é provavelmente o betabloqueador mais usado na tempestade: 60–80 mg VO a cada 4 h, com máximo de 120 mg a cada 4 h. Doses altas são necessárias pelo metabolismo acelerado da droga na tireotoxicose e por maior quantidade de receptores β-adrenérgicos cardíacos.",
  "Propranolol is probably the most common \u03b2-blocker prescribed for management of thyroid storm. It is dosed usually at 60\u201380 mg orally every 4 h, with a maximum of 120 mg every 4 h. Large doses can be required in the setting of thyrotoxicosis because of the faster metabolism of the drug and possibly because of a greater quan- tity of cardiac \u03b2-adrenergic receptors", "Betabloqueio")

f("O início de ação do propranolol oral é de cerca de 1 h; em doses altas (acima de 160 mg/dia) ele reduz o T3 em até 30% pela inibição da 5′monodesiodase, efeito lento, mediado ao longo de 7–10 dias.",
  "The onset of action after oral dosing is approximately 1 h. Propranolol in large doses (greater than 160 mg daily) can decrease T3 levels by as much as 30% via the inhibition of 5\u2032monodeiodinase, which is mediated slowly over 7\u201310 days.", "Betabloqueio")

f("Na tabela de manejo, o propranolol é dosado 60–80 mg VO a cada 4 h, ou 80–120 mg VO a cada 6 h, ou 0,5–1 mg IV em 10–15 min a cada poucas horas conforme necessário.",
  "Propranolol 60\u201380 mg PO q4 h or 80\u2013120 mg PO q6 h or 0.5\u20131 mg IV over 10\u201315 min every few hours as needed", "Tabela 9.4 — manejo da tempestade")

f("Doses de propranolol acima de 160 mg/dia podem ter algum efeito de redução da conversão periférica de T4 em T3.",
  "At doses of \\>160 mg/day can have some effect on decreasing peripheral T4 \u2192 T3 conversion", "Tabela 9.4 — manejo da tempestade")

f("Betabloqueadores alternativos por via oral na tempestade: atenolol 50–200 mg/dia (em 1 ou 2 tomadas), metoprolol 100–200 mg/dia (em 1 ou 2 tomadas) e nadolol 40–80 mg/dia.",
  "Other oral \u03b2-blockers used alternatively in the management of thyroid storm include atenolol at 50\u2013200 mg daily (divided once or twice daily) \\[21\\], metoprolol at 100\u2013200 mg daily (divided once or twice daily), and nadolol at 40\u201380 mg daily", "Betabloqueio")

f("Betabloqueio intravenoso: propranolol em bolus inicial de 0,5–1 mg em 10 min seguido de 1–3 mg em 10 min, a cada poucas horas; a administração IV deve ser feita em ambiente monitorizado.",
  "\u03b2-Blockers can also be administered intravenously: propranolol at an initial bolus of 0.5\u20131 mg over 10 min followed by 1\u20133 mg over 10 min, every few hours \\[4, 40\\] and esmolol at 50\u2013100 mg/kg/min (after an initial loading dose of 250\u2013500 \u03bcg/ kg) \\[20\\] (see Table 9.4). Intravenous administration of \u03b2-blockers should be per- formed in a monitored setting.", "Betabloqueio")

f("Esmolol na tempestade: dose de ataque de 250–500 μg/kg IV, seguida de 50–100 μg/kg/min IV.",
  "Esmolol Loading dose of 250- 500 \u03bcg/kg IV, then 50\u2013100 \u03bcg/kg/min IV", "Tabela 9.4 — manejo da tempestade")

f("A insuficiência cardíaca congestiva moderada a grave pode ser exacerbada agudamente pelo betabloqueador; se a causa da IC for a taquicardia, o betabloqueio pode ser particularmente útil; quando a causa não é facilmente determinada, usar apenas droga de ação curta (bomba de esmolol) sob monitorização hemodinâmica estreita.",
  "Moderate to severe congestive heart failure can be exacerbated in the acute set- ting by the administration of \u03b2-blockers. However, if the cause of the heart failure was considered to be underlying tachycardia, then \u03b2-blockade might be particularly useful. In situations in which the cause of the heart failure cannot be ascertained easily, \u03b2-blockade should only be administered with a short-acting drug (esmolol drip), under close hemodynamic monitoring", "Betabloqueio")

f("Em pacientes com doença reativa ou obstrutiva das vias aéreas, pode-se considerar com cautela o uso de betabloqueadores cardiosseletivos (metoprolol, atenolol).",
  "In patients with reactive or obstructive airway disease, the use of cardio-selective \u03b2-blockers (metoprolol, atenolol) can be considered carefully", "Betabloqueio")

f("A fibrilação atrial ocorre em 10–35% dos casos de tempestade tireoidiana e deve ser manejada conforme as diretrizes vigentes.",
  "Atrial fibrillation which occurs in 10\u201335% of thyroid storm cases \\[41\\] must be managed according to current guidelines.", "Betabloqueio")

# ---------------- Corticoide ----------------
f("Os glicocorticoides (principalmente hidrocortisona e dexametasona) são adjuvantes na tempestade porque inibem a conversão periférica de T4 em T3 (relevância clínica desse efeito menor é desconhecida) e tratam possível insuficiência adrenal relativa; alguns estudos encontraram MELHORA DA SOBREVIDA com glicocorticoide, já que esses pacientes podem ter cortisol inapropriadamente normal.",
  "Glucocorticoids, mainly hydrocortisone and dexamethasone, have been used as adju- vant therapy in the treatment of thyroid storm, as they each have an inhibitory effect on peripheral conversion of T4 to T3, although the clinical relevance of this relatively minor effect is unknown. An added benefit for the use of steroids in thyroid storm is to treat possible relative adrenal insufficiency. Some studies have found improved survival in patients treated with glucocorticoids, as patients with thyroid storm may have inappropriately normal levels of serum cortisol", "Corticoides")

f("O tratamento com glicocorticoide virou prática padrão na tempestade tireoidiana pela possibilidade de insuficiência adrenal relativa ou insuficiência adrenal não diagnosticada.",
  "Therefore, treatment with glucocorticoids has become a standard practice in patients with thyroid storm because of the possibility of relative adrenal insufficiency or undiagnosed adrenal insufficiency", "Corticoides")

f("Dose do corticoide na tempestade: hidrocortisona 100 mg IV a cada 8 h OU dexametasona 2 mg IV a cada 6 h, com desmame e suspensão à medida que o paciente melhora clinicamente.",
  "Hydrocortisone is generally utilized at a dose of 100 mg intrave- nously every 8 h or dexamethasone at 2 mg intravenously every 6 h, with tapering and discontinuation as the patient improves clinically.", "Corticoides")

f("Na tabela de manejo, os corticoides listados são hidrocortisona 100 mg IV a cada 8 h (trata a presumida insuficiência adrenal relativa), dexametasona 2 mg IV a cada 6 h e betametasona 0,5 mg IV ou IM a cada 6 h; os esteroides também ajudam na estabilidade vasomotora.",
  "Steroidsc Hydrocortisone 100 mg IV q8 h Treats presumed relative adrenal insufficiency Dexamethasone 2 mg IV q6 h Betamethasone 0.5 mg IV or IM q6 h 4. Supportive therapy Steroids As above Helps in vasomotor stability", "Tabela 9.4 — manejo da tempestade")

# ---------------- Terapias alternativas ----------------
f("As terapias alternativas ou suplementares são consideradas quando as de primeira linha (tionamidas, iodeto, betabloqueadores e glicocorticoides) são menos eficazes que o desejado ou não podem ser usadas por toxicidade, alergia ou intolerância.",
  "Alternative or supplemental therapeutic options can be considered in the manage- ment of thyrotoxicosis crisis or thyroid storm when first-line therapies (thionamides, iodide, \u03b2-blockers, and glucocorticoids) are less effective than desired or cannot be used due to toxicity, allergy, or intolerance.", "Terapias alternativas")

f("O lítio é concentrado ativamente na célula folicular tireoidiana e inibe a liberação de hormônio; diminui diretamente a secreção hormonal, aumentando o conteúdo intratireoidiano de iodo e inibindo o acoplamento dos resíduos de iodotirosina que formam T4 e T3. Pode ser combinado a PTU ou metimazol.",
  "Lithium appears to be actively concentrated in the thyroid follicular cell \\[43\\] and inhibits thyroid hormone release \\[44\\]. It can be used in combination with PTU or MMI \\[45\\]. Lithium decreases directly thyroid hormone secretion, thereby increas- ing intrathyroidal iodine content and inhibiting coupling of iodotyrosine residues that form iodothyronines (T4 and T3)", "Terapias alternativas — lítio")

f("Na tempestade, o lítio pode ser usado a 300 mg a cada 8 h, com litemia monitorada regularmente (diariamente no início) para manter concentração de 0,6–1,0 mEq/L; conforme o paciente fica eutireóideo, a litemia pode mudar.",
  "In thyroid storm, lithium can be used at a dose of 300 mg every 8 h \\[20\\]. Lithium levels should be monitored regularly (daily at first) to maintain a concentration of 0.6\u20131.0 mEq/L", "Terapias alternativas — lítio")

f("Boehm e colaboradores mostraram que iodo e lítio juntos têm inibição ADITIVA da liberação tireoidiana APENAS se o iodo for administrado primeiro; se o lítio for usado antes, a combinação não parece ser mais eficaz que o lítio isolado.",
  "Boehm et al. compared the relative therapeutic efficacy of iodine (I) and lithium (Li) in thyrotoxicosis and demon- strated that I and Li together displayed additive inhibition of thyroidal release only if I is administered initially, but the combination, if Li is used first, does not appear to be more effective than Li alone", "Terapias alternativas — lítio")

f("O ânion perclorato (ClO4−) é inibidor competitivo do transporte de iodeto, mas caiu em desuso por possíveis efeitos de anemia aplásica e síndrome nefrótica.",
  "The perchlorate anion, ClO4 \u2212, is a competitive inhibitor of iodide transport \\[20\\]. However, historically due to possible side effects of aplastic anemia \\[49\u201351\\] and nephrotic syndrome, its use fell out of favor.", "Terapias alternativas — perclorato")

f("O esquema de perclorato de potássio (1 g/dia) com metimazol (30–50 mg/dia) normalizou os hormônios tireoidianos com duração média de tratamento de 4 semanas; nessa dose e duração, anemia aplásica e síndrome nefrótica não ocorreram em vários estudos.",
  "The regimen of potassium perchlorate (1 g daily) and MMI (30\u201350 mg daily) has been found to normalize thyroid hor- mone levels successfully, with an average duration of treatment of 4 weeks. At this dose and duration, aplastic anemia and nephrotic syndrome did not occur in several studies", "Terapias alternativas — perclorato")

f("A reserpina é um alcaloide que depleta os estoques de catecolaminas nos terminais nervosos simpáticos e no SNC; a guanetidina também inibe a liberação de catecolaminas. Efeitos colaterais incluem hipotensão e diarreia, e a reserpina pode ter efeito depressor central.",
  "Reserpine is an alkaloid agent that depletes catecholamine stores in sympathetic nerve terminals and the central nervous system. Guanethidine also inhibits the release of catecholamines. Side effects of these medications include hypotension and diarrhea. Reserpine can also have central nervous system depressant effects.", "Terapias alternativas — antiadrenérgicos")

f("Doses antiadrenérgicas de exceção: guanetidina 30–40 mg VO a cada 6 h e reserpina 2,5–5 mg IM a cada 4 h; esses agentes são usados raríssimas vezes, dada a utilidade dos betabloqueadores.",
  "Guanethidine can be used in thyroid storm at 30\u201340 mg orally every 6 h and reser- pine at 2.5\u20135 mg intramuscularly every 4 h \\[16\\]. These agents are used extremely rarely given the utility of \u03b2-blockers.", "Terapias alternativas — antiadrenérgicos")

f("Na tireotoxicose há aumento da circulação êntero-hepática dos hormônios tireoidianos; a colestiramina, resina de troca aniônica, é usada reduzindo a reabsorção do hormônio a partir dessa circulação êntero-hepática.",
  "In states of thyrotoxicosis, there is increased enterohepatic circulation of thyroid hormones. Cholestyramine, an anion exchange resin, has also been used in the treatment of thyrotoxicosis, by decreasing the reabsorption of thyroid hormone from the enterohepatic circulation", "Terapias alternativas — colestiramina")

f("Em vários ensaios, a colestiramina combinada a metimazol ou PTU causou queda mais rápida dos hormônios que a tionamida isolada; Solomon e colaboradores avaliaram 15 pacientes tireotóxicos em estudo duplo-cego cruzado controlado por placebo e acharam queda mais rápida de todos os hormônios tireoidianos no grupo colestiramina (P < 0,01).",
  "In several trials, cholestyramine therapy, in combination with MMI or propylthiouracil, caused a more rapid decline in thyroid hormone levels than standard therapy with thionamides alone. Solomon et al. evaluated 15 thyrotoxic patients in a double-blind placebo-controlled cross- over study and found that the cholestyramine-treated group had a more rapid decline in all thyroid hormone levels (P \\< 0.01) than the placebo group", "Terapias alternativas — colestiramina")

f("A colestiramina foi dosada a 4 g por via oral a cada 6 h; seu efeito é em geral mínimo ou moderado, ela não deve ser administrada junto com outros medicamentos (inibe a absorção deles) e não se associa a efeitos adversos significativos.",
  "Cholestyramine has been dosed at 4 g orally every 6 h \\[55\u201358\\]. The effect of cho- lestyramine is generally minimal or moderate, and it should not be administered at the same time as other medications because it may inhibit their absorption. On the other hand, cholestyramine is generally not associated with significant adverse effects.", "Terapias alternativas — colestiramina")

f("Na tabela de terapias alternativas (uso incomum) constam: carbonato de lítio 300 mg VO a cada 8 h (suprime a função tireoidiana), colestiramina 4 g VO ao dia (reduz a circulação êntero-hepática do hormônio) e perclorato de potássio 1 g VO ao dia (alerta: anemia aplásica, síndrome nefrótica).",
  "Alternative therapies: uncommonly used Lithium carbonate 300 mg PO q8 h Suppresses thyroid function Cholestyramine 4 g PO qday Reduces enterohepatic circulation of thyroid hormone Potassium perchlorate 1 g PO qday Warning: aplastic anemia, nephrotic syndrome", "Tabela 9.4 — manejo da tempestade")

# ---------------- Plasmaférese / escalonamento ----------------
f("A REMOÇÃO do hormônio tireoidiano da circulação deve ser considerada quando há deterioração clínica PROGRESSIVA apesar do tratamento clínico agressivo: plasmaférese, hemoperfusão com carvão, hemoperfusão com resina e plasma exchange foram eficazes em reduzir rapidamente os níveis hormonais na tempestade.",
  "Removal of thyroid hormone from circulation must be considered when there is progressive clinical deterioration despite aggressive medical management. Plasmapheresis, charcoal hemoperfusion, resin hemoperfusion, and plasma exchange have been effective in rapidly reducing thyroid hormone levels in thyroid storm", "Plasmaférese, carvão e hemoperfusão")

f("A plasmaférese age possivelmente removendo a globulina ligadora de tiroxina com os hormônios ligados; a disponibilidade de TBG não ocupada explica a queda dos níveis livres e ligados. A remoção de autoanticorpos circulantes contra a tireoide é outro mecanismo possível.",
  "Plasmapheresis possibly works by removing thyroxine-binding globulin with bound thyroid hormones. The availability of unbound thyroxine-binding globulin can explain the lowering of free and bound hormone levels after plasmapheresis. In addition, removal of circulating autoantibodies against the thyroid gland could be a possible mechanism for decreased thyrotoxicosis.", "Plasmaférese, carvão e hemoperfusão")

f("O efeito da plasmaférese sobre a tireotoxicose é TRANSITÓRIO e dura cerca de 24–48 h; por isso pode ser necessário repetir a terapia até que se realize o tratamento definitivo, como a intervenção cirúrgica.",
  "It is important to realize, however, that the effect of plasmapheresis on thyrotoxicosis is transient and lasts for approximately 24\u201348 h. Hence, repeat therapy may be necessary until definitive therapy such as surgical intervention is performed", "Plasmaférese, carvão e hemoperfusão")

f("Plasmaférese e hemoperfusão foram usadas com sucesso em tireotoxicose por overdose de medicação tireoidiana, hipertireoidismo por radiocontraste iodado, hipertireoidismo por amiodarona, tireotoxicose por gravidez molar, hepatotoxicidade e coma induzidos por antitireoidianos, e no manejo peri-operatório de tireotoxicose grave.",
  "Plasmapheresis and hemoperfu- sion have been successfully used to diminish thyrotoxicosis due to thyroid medica- tion overdose \\[63\\], iodinated radiocontrast-induced hyperthyroidism, amiodarone-induced hyperthyroidism, and thyrotoxicosis induced by molar preg- nancy, as well as in cases of hepatotoxicity and coma induced by antithyroid drugs and in the preoperative and postoperative management of thyroid hormone in patients with severe thyrotoxicosis.", "Plasmaférese, carvão e hemoperfusão")

f("Em cães tornados tireotóxicos, a hemoperfusão com resina Amberlite neutra por 2 h reduziu T3, T4 e T4 livre médios em 39%, 35% e 46%, respectivamente.",
  "Burman et al. \\[60\\] evaluated the ability of an extracorporeal hemoperfusion sys- tem employing neutral Amberlite® resin to bind thyroid hormone and to decrease circulating levels in dogs made thyrotoxic by the intramuscular administration of thyroid hormone. The mean serum T3, T4, and FT4 decreased during 2 h of resin hemoperfusion by 39%, 35%, and 46%, respectively.", "Plasmaférese, carvão e hemoperfusão")

# ---------------- Suporte ----------------
f("A hiperpirexia é muito comum na tireotoxicose grave: o antitérmico de escolha é o ACETAMINOFENO. SALICILATOS devem ser EVITADOS, pois reduzem a ligação proteica e aumentam os hormônios tireoidianos livres.",
  "Hyperpyrexia is very common in patients with severe thyrotoxicosis. Antipyretics are indicated in this setting, and acetaminophen is the agent of choice. Salicylates should be avoided as they can decrease thyroid protein binding, causing an increase in free thyroid hormone levels", "Suporte clínico")

f("Medidas de resfriamento externo — banho com álcool, bolsas de gelo ou manta térmica — podem ser implementadas conforme apropriado.",
  "External cooling measures, such as alcohol sponging, ice packs, or a cooling blanket, can also be implemented as appropriate.", "Suporte clínico")

f("Dose de acetaminofeno na tempestade: 325–650 mg VO ou retal a cada 4–6 h se necessário; evitar salicilatos pelo deslocamento do T4 da globulina ligadora, que aumenta o T4 livre.",
  "Acetaminophen 325\u2013650 mg PO/PR q4\u20136 h prn Avoid salicylates (due to displacement of T4 from binding globulin, increasing free T4). Can be given as enema", "Tabela 9.4 — manejo da tempestade")

f("O desequilíbrio hidroeletrolítico é comum na tireotoxicose grave, pela combinação de febre, sudorese, vômitos e diarreia; a solução preferida para repor os estoques de glicogênio é fluido intravenoso com dextrose (soro fisiológico isotônico com 5 ou 10% de dextrose).",
  "Fluid and electrolyte imbalance are also common in severe thyrotoxicosis. The fluid depletion can be secondary from the combination of fever, diaphoresis, vomit- ing, and diarrhea. Intravenous fluids with dextrose (isotonic saline with 5 or 10% dextrose) are the preferred solution to replenish glycogen stores", "Suporte clínico")

f("A tiamina deve ser administrada NA ADMISSÃO para prevenir encefalopatia de Wernicke, que pode resultar da administração de dextrose intravenosa.",
  "Thiamine should be administered on admission to prevent Wernicke\u2019s encepha- lopathy, which could result from the administration of intravenous dextrose in the", "Suporte clínico")

f("A deficiência de tiamina na tempestade tireoidiana ocorre pelo aumento da degradação metabólica de nutrientes.",
  "Thiamine deficiency occurs due to increased metabolic nutrient degradation from thyroid storm.", "Suporte clínico")

f("Na tabela de manejo, a tiamina é dada a 100 mg IV para prevenir a encefalopatia de Wernicke, e os fluidos são soro glicosado a 5% ou 10% em salina.",
  "Thiamine 100 mg IV To prevent Wernicke\u2019s encephalopathy Fluids D5%NS or D10%NS", "Tabela 9.4 — manejo da tempestade")

f("Princípio fundamental do manejo é procurar e tratar a causa precipitante: se não houver fator aparente, buscar foco infeccioso no tireotóxico febril (hemoculturas, urocultura, cultura de escarro e radiografia de tórax ou TC sem contraste). ANTIBIÓTICO EMPÍRICO NÃO é recomendado sem foco identificado. Outros precipitantes: cetoacidose diabética, infarto do miocárdio e embolia pulmonar.",
  "Given that the most common precipitant is thought to be infection, if a precipitating factor is not apparent, a search for an infec- tious source would be warranted in the febrile thyrotoxic patient (blood, urine, and sputum cultures and chest radiograph or noncontrast CT). However, empiric antibi- otics are not recommended without an identified source of infection. Other possible precipitants include diabetic ketoacidosis, myocardial infarction, and pulmonary embolism.", "Suporte clínico")

# ---------------- Perioperatório ----------------
f("Para procedimentos eletivos/não urgentes, o padrão é atingir o eutireoidismo antes da cirurgia; a tionamida é recomendada e em geral leva várias semanas para alcançar o eutireoidismo.",
  "The standard course of therapy in this setting would be to achieve euthyroidism before surgery. Thionamide therapy would be recommended and would generally achieve euthyroidism within several weeks", "Manejo perioperatório")

f("Um estudo retrospectivo comparando desfechos cirúrgicos em 42 pacientes hipertireóideos submetidos a tireoidectomia subtotal com propranolol isolado ou propranolol mais iodo não mostrou benefício em perda sanguínea intraoperatória; logo, no cenário NÃO urgente, o iodo pode ser indicado apenas se as tionamidas não puderem ser toleradas.",
  "However, one retrospective study that com- pared surgical outcomes in 42 hyperthyroid patients who underwent subtotal thy- roidectomy with propranolol treatment alone, or propranolol and iodine treatment, revealed no benefit in terms of intraoperative blood loss \\[67\\]. Therefore, it seems reasonable to recommend that in the nonurgent setting, iodine use may be indicated only if thionamides cannot be tolerated.", "Manejo perioperatório")

f("Preparo rápido para cirurgia de emergência no tireotóxico: tionamida (metimazol 20–30 mg VO a cada 4 h, ou propiltiouracil 200–400 mg VO a cada 4 h) — parar após tireoidectomia total ou quase total, e continuar após cirurgia não tireoidiana.",
  "Thionamidea Methimazole 20\u201330 mg PO q4 h Stop after total or near-total thyroidectomy. Propylthiouracil 200\u2013400 mg PO q4 h Continue after non-thyroidal surgery", "Tabela 9.6 — preparo rápido para cirurgia de emergência")

f("No preparo rápido para cirurgia de emergência, a hidrocortisona 100 mg IV a cada 8 h é desmamada em 72 h ou conforme indicação clínica; alternativas são dexametasona 2 mg IV a cada 6 h e betametasona 0,5 mg VO, IM ou IV a cada 6 h.",
  "Steroidsa Hydrocortisone 100 mg IV q8 h Taper over 72 h or as clinically indicated Dexamethasone 2 mg IV q6 h Betamethasone 0.5 mg PO, IM or IV q6 h", "Tabela 9.6 — preparo rápido para cirurgia de emergência")

f("No preparo rápido para cirurgia de emergência, o iodo (SSKI 5 gotas VO a cada 6 h ou solução de Lugol 4–8 gotas VO a cada 6–8 h) deve ser SUSPENSO no pós-operatório.",
  "Iodinea SSKI 5 drops PO q6 h Stop Lugol\u2019s solution 4\u20138 drops PO q6\u20138 h", "Tabela 9.6 — preparo rápido para cirurgia de emergência")

f("No preparo rápido para cirurgia de emergência, o propranolol (60–80 mg VO a cada 4 h ou 80–120 mg VO a cada 6 h) é CONTINUADO no pós-operatório, e o esmolol 50–100 \u03bcg/kg/min IV é trocado por agente oral.",
  "Beta-blockera Propranolol 60\u201380 mg PO q4 h or Continue 80\u2013120 mg PO q6 h Esmolol 50\u2013100 \u03bcg/kg/min IV Change to oral agent", "Tabela 9.6 — preparo rápido para cirurgia de emergência")

f("Em um estudo, a tireoidectomia foi realizada no 6º dia após uso pré-operatório de betametasona, ácido iopanoico (não mais disponível) e propranolol, com queda rápida dos hormônios tireoidianos e bons desfechos cirúrgicos.",
  "In one study, thyroidectomy was performed on the 6th day after preoperative use of betamethasone, iopanoic acid (no longer available), and propranolol. Rapid low- ering of thyroid hormone levels occurred with good surgical outcomes", "Manejo perioperatório")

f("Após a tireoidectomia no paciente tireotóxico, o betabloqueador ainda pode ser necessário por um curto período porque a meia-vida do T4 é de 7–8 dias; a tionamida, porém, costuma poder ser suspensa no pós-operatório, presumindo que reste pouco tecido tireoidiano.",
  "Following thyroidectomy in thyrotoxic patients, treatment with \u03b2-blockers may still be required for a short period of time because the half-life of T4 is 7\u20138 days. However, thionamide therapy usually can be stopped postoperatively, assuming that there is little thyroid tissue remaining.", "Manejo perioperatório")

f("O objetivo do preparo pré-operatório do tireotóxico é atingir estado eutireóideo antes da cirurgia, reduzindo significativamente a morbidade e a mortalidade de cirurgias tireoidianas e não tireoidianas.",
  "Preoperative management of thyrotoxic patients aims to achieve a euthyroid sta- tus before surgery, hence decreasing significantly morbidity and mortality due to thyroid or non-thyroid surgery", "Manejo perioperatório")

# ---------------- Terapia definitiva ----------------
f("Após controlar os aspectos ameaçadores à vida, a terapia com tionamida em doses gradualmente decrescentes costuma ser necessária por semanas a meses depois da tempestade para atingir o eutireoidismo, e o betabloqueio é mantido enquanto o paciente ainda estiver tireotóxico.",
  "Thionamide therapy, at gradually decreasing doses, usually is required for weeks to months after thyroid storm, to attain euthyroidism. \u03b2-Adrenergic receptor blockade is also needed while the patient is still thyrotoxic.", "Terapia definitiva")

f("A ablação com radioiodo pode ficar indisponível por semanas ou meses após o tratamento com iodo inorgânico para a tempestade; a tireoidectomia pode ser feita quando o paciente estiver eutireóideo, preferindo-se deixá-lo eutireóideo por várias semanas antes da cirurgia para reduzir os estoques teciduais de hormônio.",
  "Radioactive iodine ablation may not be able to be used for weeks or months fol- lowing treatment with inorganic iodine for thyroid storm. Thyroidectomy can be performed once the patient is euthyroid; it is preferable to allow the patient to be euthyroid for several weeks prior to surgery to decrease tissue stores of thyroid hormones.", "Terapia definitiva")

f("O objetivo da terapia definitiva é prevenir recorrência futura de tireotoxicose grave.",
  "The goal of definitive therapy is to prevent a future recurrence of severe", "Terapia definitiva")

f("Radioiodo e tireoidectomia geralmente resultam em hipotireoidismo permanente, e o paciente será colocado em levotiroxina exógena com monitorização periódica.",
  "Usually radioactive iodine and thyroidectomy result in permanent hypothyroidism, and the patient will be placed on exogenous levothyroxine and have periodic monitoring.", "Terapia definitiva")

out = {
    "fileId": "1R37X3uQn1reXfmyHWVPEfcelgeKSF9PS",
    "titulo": "Thyrotoxic Crisis: Thyroid Storm (Chapter 9)",
    "tema": "crise tireotóxica — diagnóstico (escore de Burch-Wartofsky), ordem dos fármacos, doses e escalonamento na emergência",
    "fonte": "Reyes-Castano JJ, Burman K. Thyrotoxic Crisis: Thyroid Storm. In: Loriaux L, Vanek C (eds.). Endocrine Emergencies. Contemporary Endocrinology. Springer Nature Switzerland AG; 2021. Chapter 9, p. 71-92 (https://doi.org/10.1007/978-3-030-67455-7_9)",
    "area": "Tireoide",
    "tipo": "revisao",
    "ano": 2021,
    "conflito": (
        "Não é conflito de conteúdo, é conflito de LEITURA: a entrada do núcleo (ETA 2022, Graves pediátrica) resume a "
        "tempestade como \'iodo + glicocorticoide + betabloqueador + ATD\' — uma ENUMERAÇÃO que, se lida como sequência, "
        "inverte a regra explícita deste capítulo: \'Inhibition of thyroid gland synthesis of new thyroid hormone with a "
        "thionamide should be initiated before iodine therapy, to prevent the stimulation of new thyroid hormone synthesis "
        "that can occur when iodine is given initially\' e \'The time delay between antithyroid medications and iodine "
        "administration is at least 60 minutes.\' A TIONAMIDA VEM PRIMEIRO, e o iodo pelo menos 60 min depois. O núcleo é "
        "mais novo (2022) e não foi sobrescrito; registra-se aqui apenas a precisão de ordem."
    ),
    "fatos": F,
}
import io
with io.open("/home/user/endodirect/scratchpad/acervo/extratos/1R37X3uQn1reXfmyHWVPEfcelgeKSF9PS.json", "w", encoding="utf-8") as fh:
    json.dump(out, fh, ensure_ascii=False, indent=1)
print("fatos:", len(F))
