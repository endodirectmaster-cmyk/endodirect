# -*- coding: utf-8 -*-
import json, re, sys

SRC = '/home/user/endodirect/scratchpad/acervo/textos/hipo-1.txt'
OUT = '/home/user/endodirect/scratchpad/acervo/extratos/hipo-1.json'

raw = open(SRC, encoding='utf-8').read()
flat = re.sub(r'\s+', ' ', raw)

# ---- facts: (secao, afirmacao, start_anchor, end_anchor) ----
F = []
def a(sec, af, s, e):
    F.append((sec, af, s, e))

# ============ ABSTRACT ============
a("Abstract",
  "A hiponatremia é o distúrbio eletrolítico mais comum, particularmente em idosos; a alta prevalência nessa população é impulsionada por condições subjacentes como insuficiência cardíaca e renal e por fatores como polifarmácia e desnutrição.",
  "Hyponatremia is the most common electrolyte disorder, particularly in older adults", "polypharmacy and malnutrition")
a("Abstract",
  "O aumento das temperaturas globais também foi associado a maiores taxas de hiponatremia.",
  "Rising global temperatures have also been", "increased hyponatremia rates")
a("Abstract",
  "A hiponatremia crônica associa-se a risco elevado de quedas, osteoporose, fraturas, comprometimento cognitivo e muscular e mortalidade.",
  "Chronic hyponatremia is associated with elevated risks of falls", "and mortality")
a("Abstract",
  "Apesar desses desfechos adversos, a condição é frequentemente subdiagnosticada e subtratada, em parte pela complexidade da sua avaliação; algoritmos diagnósticos simplificados, passo a passo, em diretrizes futuras podem ajudar a corrigir essa lacuna.",
  "Despite these adverse outcomes, the condition is often underdiagnosed", "may help address this gap")
a("Abstract",
  "Evidências crescentes apoiam o benefício clínico de corrigir a hiponatremia; entre as novas terapias, os inibidores de SGLT2 e a suplementação proteica são especialmente promissores, com eficácia tanto em elevar o sódio plasmático quanto em oferecer benefícios de saúde mais amplos.",
  "Evidence increasingly supports the clinical benefits", "broader health benefits")

# ============ INTRODUCTION ============
a("Introduction",
  "A hiponatremia é o distúrbio eletrolítico mais comum tanto em pacientes internados quanto ambulatoriais, com risco que aumenta acentuadamente com a idade; entre pacientes geriátricos institucionalizados a prevalência chega a 50%.",
  "Hyponatremia is the most common electrolyte disorder in both inpatient", "prevalence can reach up to 50 %")
a("Introduction",
  "A síndrome da antidiurese inapropriada (SIAD) é a principal causa de hiponatremia nas populações mais velhas, frequentemente desencadeada por polifarmácia e por uma gama de doenças associadas à idade.",
  "tidiuresis (SIAD) is the leading cause in older populations", "age-associated disorders")
a("Introduction",
  "Outras causas comuns são doença cardíaca, hepática e renal crônica, além de desnutrição — todas predispõem à hiponatremia.",
  "Other common causes include chronic heart", "predispose to hyponatremia")
a("Introduction",
  "A prevalência de hiponatremia sobe nos meses de verão, particularmente em idosos, e projeta-se que aumente substancialmente com o aquecimento global.",
  "Prevalence rises during summer months", "increase substantially with global warming")
a("Introduction",
  "A hiponatremia associa-se significativamente a maior mortalidade global e a pior desfecho; foi ligada a comprometimentos neurocognitivos e neuromusculares e à redução da qualidade óssea, o que em conjunto explica o aumento do risco de quedas, fraturas e déficits de atenção nessa população.",
  "Hyponatremia is significantly associated with higher overall mortality", "attention deficits [12] in this population")
a("Introduction",
  "A correção da hiponatremia demonstrou melhorar esses comprometimentos e aumentar a qualidade de vida.",
  "Correction of hyponatremia has been shown to improve", "enhance quality of life")
a("Introduction",
  "Apesar desses dados, a hiponatremia crônica frequentemente permanece sem tratamento; a complexidade do diagnóstico correto, ainda mais difícil por medicamentos interferentes e comorbidades, é certamente um fator importante.",
  "Despite these data, chronic hyponatremia often remains untreated", "is certainly an important factor here")
a("Introduction",
  "Novas opções de tratamento surgiram com os inibidores da proteína transportadora de sódio-glicose 2 (SGLT2), a empagliflozina, e com a suplementação proteica, para corrigir a hiponatremia induzida pela SIAD.",
  "new options using the sodium-glucose transport protein 2", "to correct SIAD-induced hyponatremia")

# ============ PREVALENCE / PATHOPHYSIOLOGY ============
S1 = "Prevalence, causes and pathophysiology of hyponatremia in the elderly"
a(S1, "A idade por si só é forte fator de risco para hiponatremia: a partir dos 50 anos o risco sobe progressivamente.",
  "Age per se is a strong risk factor for hyponatremia", "rises progressively")
a(S1, "Em pacientes hospitalizados, indivíduos com mais de 80 anos têm risco 10 vezes maior de desenvolver hiponatremia profunda em comparação com pacientes mais jovens.",
  "This association is especially pronounced in hospitalized patients", "compared to younger patients")
a(S1, "O número de comorbidades também é fator de risco, e a prevalência de hiponatremia varia entre departamentos, com as maiores taxas na terapia intensiva e nas enfermarias de medicina interna.",
  "Since the number of comorbidities is", "intensive care and internal medicine wards")
a(S1, "As taxas de hiponatremia são elevadas em casas de repouso geriátricas, com prevalência de até 50%.",
  "Hyponatremia rates are also elevated in geriatric nursing", "prevalence of up to 50 %")
a(S1, "Em termos etiológicos, a SIAD é a causa mais comum de hiponatremia, seguida de hipovolemia e hipervolemia.",
  "In terms of etiology SIAD is the most common cause", "followed by hypovolemia and hypervolemia")
a(S1, "Em pacientes hospitalizados a prevalência de hiponatremia aumenta no verão: temperaturas externas médias acima de 20°C marcam um limiar além do qual as taxas sobem acentuadamente.",
  "In hospitalized patients, hyponatremia prevalence increases during summer", "rates rise sharply")
a(S1, "Modelos climáticos demonstram que as taxas de hospitalização por hiponatremia aumentarão 6,3% com uma elevação de 1°C e 13,9% com elevação de 2°C, esperando-se ainda aumento de dois terços na prevalência de hiponatremia profunda.",
  "climate models impressively demonstrate", "profound hyponatremia is expected")
a(S1, "Os idosos são especialmente vulneráveis à hiponatremia induzida pelo calor; outros fatores de risco são doença renal crônica e medicamentos como diuréticos e antidepressivos.",
  "Elderly patients are especially", "diuretics and antidepressants")
a(S1, "Os mecanismos da hiponatremia induzida pelo calor incluem ingestão desproporcional de fluidos hipotônicos em relação à perda de sal pelo suor, estresse induzido pelo calor e liberação não osmótica de arginina-vasopressina por vasodilatação.",
  "Mechanisms for heat-induced hyponatremia include", "due to vasodilation")
a(S1, "Uma mudança da idade é que a sensação de sede — normalmente disparada por osmolalidade sanguínea alta ou volume sanguíneo baixo — é mais fraca do que em pessoas jovens.",
  "For one, thirst-sensation", "than in younger people")
a(S1, "Ao mesmo tempo, no idoso a liberação de arginina-vasopressina (AVP) é mais sensível a aumentos da osmolalidade.",
  "At the same time, arginine vasopressin (AVP) release is more sensitive", "increases in osmolality")
a(S1, "A função renal também se altera com a idade: tanto a capacidade de concentrar quanto a de diluir a urina estão reduzidas.",
  "Kidney function is also altered", "urine is reduced")
a(S1, "Os idosos têm menos massa magra, de modo que mesmo pequenas mudanças na água corporal total podem causar variações maiores do sódio plasmático.",
  "In addition, older adults", "shifts in plasma sodium levels")
a(S1, "Esses fatores explicam por que a hiponatremia é causada principalmente por excesso de água livre, e não por depleção de sódio.",
  "These factors also explain why hyponatremia is mainly caused", "rather than sodium depletion")

# ============ DIAGNOSTIC CHALLENGES ============
S2 = "Diagnostic challenges in the assessment of hyponatremia in the elderly"
a(S2, "O primeiro passo na avaliação da hiponatremia é medir a osmolalidade plasmática e, confirmada a hiponatremia hipotônica, a osmolalidade urinária — esta reflete diretamente a atividade da AVP e ajuda a determinar a causa.",
  "The first step in assessing hyponatremia is to measure plasma osmolality", "helpful to determine the cause")
a(S2, "Osmolalidade urinária baixa (≤100 mOsm/kg) aponta para AVP suprimida, como na polidipsia primária, na baixa ingestão de solutos ou na potomania da cerveja (consumo pesado de cerveja com nutrição pobre).",
  "Low (≤100 mOsm/kg) urine", "with poor nutrition)")
a(S2, "⚠️ No idoso, porém, como os rins diluem a urina de forma menos eficiente, um limiar de ≤200 mOsm/kg pode ser mais apropriado.",
  "However, in older adults - because kidneys dilute urine less efficiently", "may be more appropriate")
a(S2, "Osmolalidade urinária elevada (>100–200 mOsm/kg) indica atividade aumentada da AVP, que pode ser apropriada (hipovolemia ou condições com baixo volume arterial efetivo, como insuficiência cardíaca e cirrose) ou inapropriada, como na SIAD.",
  "Elevated (> 100–200 mOsm/kg) urine osmolality", "such as in SIAD")
a(S2, "⚠️ Medir a AVP diretamente ou seu marcador substituto estável, a copeptina, não se mostrou útil nessa diferenciação.",
  "Unfortunately, measuring AVP directly or its stable surrogate marker copeptin", "in this differentiation")
a(S2, "O passo seguinte recomendado é medir o sódio urinário, que reflete o sistema renina-angiotensina-aldosterona e a atividade dos peptídeos natriuréticos.",
  "Accordingly, it is generally advised to measure urine sodium as a next step", "natriuretic peptide activity")
a(S2, "Sódio urinário baixo (≤30 mmol/l) sugere hipovolemia verdadeira ou baixo volume sanguíneo arterial efetivo, enquanto nível elevado (>30 mmol/l) indica atividade aumentada da AVP, como na insuficiência adrenal ou na SIAD.",
  "A low (≤30 mmol/l) level suggests", "such as in adrenal insufficiency or SIAD")
a(S2, "⚠️ Os diuréticos — droga comum no idoso — aumentam artificialmente o sódio urinário e podem mascarar a real causa da hiponatremia; recomenda-se então medir e calcular a excreção fracionada de ureia e de ácido úrico, menos influenciadas pelos diuréticos.",
  "However, diuretics – a common drug in the elderly", "less influenced by diuretics")
a(S2, "Excreção fracionada de ureia e de ácido úrico baixas (<35% e <8%, respectivamente) sugerem hipovolemia, enquanto valores elevados (>55% e >12%, respectivamente) indicam SIAD.",
  "Low fractional urea and uric acid levels", "respectively) indicate SIAD")
a(S2, "⚠️ Embora a avaliação do estado volêmico seja rotineira, ela tem baixa sensibilidade e especificidade, sobretudo para distinguir euvolemia de hipovolemia leve — desafio adicional no idoso, que frequentemente tem hipotensão ortostática não hipovolêmica e turgor cutâneo reduzido inespecífico; o ultrassom à beira do leito pode ajudar.",
  "Although volume status assessment is routinely performed in clinical care", "point-of-care ultrasound might")
a(S2, "Além da maior sensibilidade à AVP, da menor capacidade renal de concentração e do uso de múltiplos medicamentos que complicam o diagnóstico correto, os idosos sofrem mais frequentemente de hiponatremia multifatorial; por isso recomenda-se reavaliação regular nos casos sem resposta à terapia.",
  "In addition to increased AVP sensitivity, reduced renal concentrating ability", "in cases of non-response to therapy")

# ============ FIG 1 ============
a("Fig. 1 — Pathophysiology of the most common hyponatremia etiologies",
  "Hiponatremia euvolêmica (SIAD): caracterizada por secreção inapropriada de arginina-vasopressina (AVP) levando à retenção de água, resultando em hiponatremia dilucional.",
  "• Euvolemic hyponatremia (SIAD): Characterized by inappropriate arginine", "resulting in dilutional hypo")
a("Fig. 1 — Pathophysiology of the most common hyponatremia etiologies",
  "Hiponatremia hipervolêmica: o baixo volume sanguíneo arterial efetivo estimula mecanismos neuro-hormonais, incluindo AVP e ativação do sistema renina-angiotensina-aldosterona (SRAA), resultando em retenção excessiva de fluido e diluição do sódio.",
  "• Hypervolemic hyponatremia: Low effective arterial blood volume", "fluid retention and sodium dilution")
a("Fig. 1 — Pathophysiology of the most common hyponatremia etiologies",
  "Hiponatremia hipovolêmica: a perda extensa de fluido extracelular dispara retenção de água mediada pela AVP e ativação do SRAA para conservar sal e água.",
  "• Hypovolemic hyponatremia: extensive extracellular fluid loss", "to conserve salt and water")

# ============ SIAD ============
S3 = "Aetiologies of hyponatremia — Syndrome of inappropriate antidiuresis (SIAD)"
a(S3, "A SIAD caracteriza-se por atividade inadequada da AVP apesar de osmolalidade plasmática normal ou baixa e volume sanguíneo normal; essa atividade persistente faz os rins reabsorverem água livre, levando à retenção hídrica e discreta expansão do fluido extracelular.",
  "SIAD is characterized by an inadequate AVP activity", "expansion of the extracellular fluid")
a(S3, "O corpo responde à expansão aumentando a excreção de sódio (natriurese secundária), o que reduz o sódio corporal total; como o volume extracelular depende de sódio e água, a perda de sódio compensa a água extra e o paciente parece clinicamente euvolêmico em vez de francamente hipervolêmico — o efeito líquido é diluição do sódio plasmático, produzindo hiponatremia hipotônica.",
  "The body responds to this expansion by increasing sodium excretion", "producing hypotonic hyponatremia")
a(S3, "A SIAD pode ser secundária a ampla gama de condições, incluindo neoplasias, doenças pulmonares, doenças do sistema nervoso central e estressores fisiológicos como dor ou náusea, além de poder ser desencadeada por medicamentos.",
  "SIAD can develop secondary to a wide range of conditions", "triggered by certain medications")
a(S3, "⚠️ Os medicamentos que causam SIAD incluem análogos da AVP (desmopressina), que agem nos receptores de vasopressina-2 dos ductos coletores renais; drogas que aumentam a liberação central de AVP (vincristina, ifosfamida); e agentes que estimulam diretamente os receptores de vasopressina-2 (inibidores seletivos da recaptação de serotonina, carbamazepina).",
  "These include AVP analogues (desmopressine)", "carbamazepine) [53]")
a(S3, "Os idosos são particularmente vulneráveis à SIAD por sua frequente polimorbidade e polimedicação, e — preocupantemente — a consciência desses efeitos colaterais medicamentosos é baixa.",
  "Older adults are particularly vulnerable to SIAD", "awareness of these medication side effects is low")
a(S3, "⚠️ A SIAD é um diagnóstico de exclusão que exige a presença de níveis normais de cortisol — particularmente relevante diante do alto uso de todo tipo de corticoide (cremes, inaladores, injeções, comprimidos etc.) em pacientes idosos.",
  "It is important to note, that SIAD is a diagnosis of exclusion", "in elderly patients")
a(S3, "Quando nenhum fator desencadeante é identificado — a chamada SIAD idiopática — recomenda-se investigação diagnóstica incluindo avaliação de possível neoplasia.",
  "In case no triggering factor can be identified", "is recommended (Fig. 2)")

# ============ HYPOVOLEMIC ============
S4 = "Aetiologies of hyponatremia — Hypovolemic hyponatremia"
a(S4, "A hiponatremia hipovolêmica ocorre quando o corpo perde mais sódio do que água, por exemplo em gastroenterite, sangramento ou desvios de fluido para o terceiro espaço (queimaduras, sepse).",
  "Hypovolemic hyponatremia occurs when the body loses more sodium than water", "third-space fluid shifts (i.e.burns, sepsis)")
a(S4, "⚠️ Os diuréticos tiazídicos e similares aos tiazídicos são causa comum de hiponatremia, que ocorre em até 20% dos pacientes que os usam.",
  "Thiazide and thiazide-like diuretics are a common cause of", "of the patients taking them")
a(S4, "⚠️ A hiponatremia induzida por tiazídico geralmente se desenvolve dentro de semanas, mas ocorrências mais tardias também são possíveis.",
  "While thiazide induced hyponatremia usually", "more delayed occurrences are possible")
a(S4, "Além da idade, o sexo feminino é fator de risco para hiponatremia por tiazídico.",
  "Again, age in addition to female sex is a risk factor", "Re-exposure should be avoided")
a(S4, "⚠️ A reexposição ao tiazídico deve ser evitada, pois a maioria dos pacientes volta a ficar hiponatrêmica.",
  "Re-exposure should be avoided since most patients", "become again hyponatremic")
a(S4, "Pacientes com hiponatremia associada a tiazídico podem estar euvolêmicos ou hipovolêmicos, pois a etiologia é multifatorial: pode resultar da perda de sódio urinário levando a depleção volêmica leve e da capacidade reduzida do túbulo contorcido distal de diluir a urina.",
  "Patients with thiazide-associated", "distal convoluted tubule to dilute urine")
a(S4, "Adicionalmente, uma mutação genética no transportador de prostaglandinas do ducto coletor pode elevar a prostaglandina E2 urinária, aumentando a atividade da aquaporina 2 sem envolver a AVP, o que amplia a reabsorção renal de água e leva a hiponatremia dilucional.",
  "Additionally, a genetic", "leading to dilutional hyponatremia")

# ============ HIGH WATER / LOW SOLUTE ============
S5 = "Aetiologies of hyponatremia — High water and low solute intake"
a(S5, "A hiponatremia por alta ingestão de água ocorre quando a ingestão excede o volume urinário máximo excretável, determinado pela ingestão de solutos — por isso pacientes com baixa ingestão de solutos têm risco maior.",
  "Hyponatremia due to high water Intake occurs when water ingestion exceeds", "at higher risk of developing hyponatremia")
a(S5, "Isso se aplica a todos os pacientes com desnutrição, como anorexia relacionada a doença crônica, potomania da cerveja e a chamada “síndrome do chá com torrada” (tea and toast syndrome), frequente em idosos.",
  "This applies to all patients with malnutrition", "often occurring in elderly patients")
a(S5, "Na síndrome do chá com torrada, a ingestão insuficiente de sal e de proteína somada à capacidade reduzida de diluição dos rins envelhecidos prejudica a excreção de água; por isso, uma história nutricional detalhada deve fazer parte do exame de rotina do paciente com hiponatremia.",
  "In the latter, insufficient salt and protein intake", "patients with hyponatremia")

# ============ HYPERVOLEMIC ============
S6 = "Aetiologies of hyponatremia — Hypervolemic hyponatremia"
a(S6, "A hiponatremia hipervolêmica envolve aumento global do sódio corporal total acompanhado de excesso de água relativamente maior, movido por ativação do sistema renina-angiotensina-aldosterona em resposta à redução do volume sanguíneo arterial efetivo, junto de retenção de água mediada pela AVP e filtração glomerular reduzida.",
  "Hypervolemic hyponatremia involves an overall increase in total body sodium", "reduced glomerular filtration")
a(S6, "Ocorre tipicamente em pacientes com insuficiência cardíaca ou cirrose hepática, com os pacientes mais velhos em maior risco devido às mudanças relacionadas à idade.",
  "This typically occurs in", "due to the age-related changes described above")
a(S6, "O tratamento da insuficiência cardíaca e da cirrose inclui diuréticos de alça e antagonistas do receptor mineralocorticoide, o que pode reduzir ainda mais o volume arterial efetivo e perturbar a homeostase do sódio, especialmente com ingestão excessiva de fluido hipotônico.",
  "The treatment of heart failure and liver cirrhosis includes loop diuretics", "excessive intake of hypotonic fluid")
a(S6, "Em resumo, os idosos têm risco aumentado de hiponatremia por qualquer causa, por mudanças fisiológicas da idade e maior carga de comorbidades, sendo a SIAD a causa subjacente mais frequente.",
  "In summary, older adults are at heightened risk for hyponatremia due to any cause", "being the most frequent underlying cause")

# ============ EFFECTS ============
S7 = "Effects of hyponatremia and its correction"
a(S7, "Os sintomas clínicos da hiponatremia são determinados principalmente pela velocidade de queda do sódio: nos casos agudos (<48 h) a capacidade cerebral de se adaptar ao gradiente osmótico é superada, a água desloca-se para o tecido cerebral e resulta em edema cerebral, podendo elevar a pressão intracraniana com cefaleia, inquietação e confusão, e progredir para herniação cerebral e morte se não tratado prontamente.",
  "Clinical symptoms of hyponatremia are mainly determined by the rate of sodium decline", "if not promptly treated")
a(S7, "Em contraste, quando a hiponatremia se desenvolve gradualmente ao longo de vários dias, o cérebro se adapta expelindo sódio e, em seguida, osmólitos orgânicos, reduzindo a osmolalidade intracerebral e o risco de edema — por isso a hiponatremia crônica frequentemente parece clinicamente silenciosa.",
  "In contrast, when hyponatremia develops gradually", "often appears clinically silent")
a(S7, "⚠️ Apesar da aparente ausência de sintomas agudos, evidências crescentes ligam a hiponatremia crônica a comprometimentos neurocognitivos e neuromusculares, saúde óssea reduzida, maior incidência de quedas e fraturas e pior qualidade de vida.",
  "Despite this apparent lack of", "diminished quality of life")
a(S7, "É digno de nota que a maioria das populações estudadas tinha idade média em torno de 70 anos, o que enfatiza a suscetibilidade da população idosa a essa condição.",
  "Also noteworthy is", "population to this condition")
a(S7, "Embora a maior parte dos dados de apoio seja observacional, a correção ativa da hiponatremia tem sido associada à reversão de muitos desses desfechos adversos.",
  "Moreover, although most supporting data are observational", "reversal of many of these adverse outcomes")

# ============ NEUROCOGNITIVE ============
S8 = "Effects of hyponatremia and its correction — Neurocognitive and neuromuscular function"
a(S8, "⚠️ No estudo de Renneboog et al., 122 idosos com hiponatremia crônica leve a moderada clinicamente silenciosa admitidos no pronto-socorro tiveram quedas muito mais frequentes do que os pares com sódio normal, e o risco esteve elevado independentemente da gravidade da hiponatremia.",
  "A well-known example is the study by Renneboog", "regardless of hyponatremia severity")
a(S8, "Outras pesquisas confirmaram o padrão: mesmo a hiponatremia leve foi ligada a probabilidade substancialmente maior de quedas, tanto em pacientes hospitalizados quanto em pessoas vivendo independentemente na comunidade.",
  "Other research has confirmed", "living independently in the community")
a(S8, "⚠️ O aumento de risco associado à hiponatremia leve foi comparável ao efeito de mais de uma década de envelhecimento.",
  "In fact, the increased risk associated with mild hyponatremia was comparable", "more than a decade of ageing")
a(S8, "⚠️ Em um estudo caso-controle com 16 pacientes com hiponatremia leve a moderada, os pacientes tiveram pior desempenho em testes de marcha, com resultados comparáveis aos de controles normonatrêmicos levemente intoxicados por álcool; após a normalização do sódio, as anormalidades de equilíbrio se resolveram.",
  "The impact of correcting hyponatremia was strikingly shown in a small case control study", "balance abnormalities resolved")
a(S8, "Um estudo de seguimento do mesmo grupo destacou que idosos com hiponatremia moderada apresentaram maior comprometimento de marcha e de desempenho cognitivo do que indivíduos mais jovens, ressaltando a vulnerabilidade aumentada do cérebro envelhecido às flutuações do sódio.",
  "A follow-up", "to sodium fluctua")
a(S8, "Um pequeno estudo ambulatorial mostrou que indivíduos com hiponatremia leve a moderada apresentavam cefaleia, confusão e instabilidade de marcha, além de pior desempenho em testes neurocognitivos e musculares comparados a pares saudáveis; o tratamento melhorou os sintomas em todos os pacientes, mas os ganhos em função neurocognitiva foram mínimos.",
  "One small outpatient study", "gains in neurocognitive function were minimal")
a(S8, "Em outro estudo com catorze pacientes com hiponatremia e cirrose hepática tratados com o antagonista do receptor de vasopressina tolvaptana, houve melhora em cognição, qualidade de vida e achados de ressonância magnética cerebral.",
  "In another study of fourteen patients with hyponatremia", "and brain MRI findings")
a(S8, "Pesquisas observacionais mais recentes mostraram que corrigir a hiponatremia moderada a grave pode melhorar o desempenho cognitivo e produzir mudanças mensuráveis na estrutura cerebral e na atividade neuronal.",
  "More recent observational research has similarly shown", "brain structure and neuronal activity")
a(S8, "Nos ensaios SALT, pacientes que receberam o antagonista da vasopressina tolvaptana tiveram tanto elevação do sódio quanto melhora notável nos escores de saúde mental em comparação com placebo.",
  "In the SALT trials", "compared with placebo")
a(S8, "⚠️ O estudo INSIGHT, que avaliou o impacto da tolvaptana sobre cognição e estabilidade postural em pessoas com hiponatremia clinicamente assintomática, encontrou apenas uma tendência a melhor desempenho neurocognitivo junto da correção do sódio.",
  "The INSIGHT study", "alongside sodium correction")
a(S8, "⚠️ Em um ensaio cruzado com o inibidor de SGLT2 empagliflozina na hiponatremia crônica relacionada à SIAD, o sódio melhorou após quatro semanas de tratamento, mas não houve efeito sobre a marcha e os ganhos cognitivos foram mínimos.",
  "Another crossover trial tested the SGLT2 inhibitor empagliflozin", "cognitive gains were minimal")
a(S8, "A falta de evidência mais forte provavelmente reflete a natureza observacional de boa parte da pesquisa, o fato de muitos participantes não atingirem a normonatremia e a inexistência, até hoje, de ensaio randomizado desenhado especificamente para detectar mudanças na função neurocognitiva ou neuromuscular.",
  "The lack of stronger", "or neuromuscular function")

# ============ BONE ============
S9 = "Effects of hyponatremia and its correction — Bone health"
a(S9, "Múltiplos estudos e metanálises mostraram ligação consistente entre hiponatremia crônica e maior risco de osteoporose e fraturas.",
  "Multiple studies and meta-analyses have shown a consistent link", "osteoporosis and fractures")
a(S9, "⚠️ Em idosos, o aumento do risco de fratura persiste mesmo quando a densidade óssea é semelhante à de indivíduos com sódio normal, sugerindo que outros mecanismos estão envolvidos.",
  "Research in older adults has found that this increased fracture risk persists", "suggesting other mechanisms are involved")
a(S9, "Uma metanálise também ligou a hiponatremia a maior probabilidade de quedas, com a instabilidade de marcha provavelmente contribuindo para o risco elevado de fratura.",
  "One meta-analysis also", "contributing to the elevated fracture risk")
a(S9, "⚠️ Tanto a gravidade quanto a duração da hiponatremia elevam ainda mais o risco de osteoporose e de fraturas por fragilidade.",
  "Additional evidence indicates that both the severity and duration", "osteoporosis and fragility fractures")
a(S9, "Além das quedas, a própria perda óssea pode ser promovida diretamente pela hiponatremia, já que o osso é o maior reservatório corporal de sódio osmoticamente inativo; estudos experimentais em ratos apoiam essa ideia, mostrando perda óssea marcada e aumento da atividade osteoclástica após hiponatremia prolongada.",
  "Beyond falls, bone loss itself may be directly promoted by hyponatremia", "after prolonged hyponatremia")
a(S9, "No ensaio INSIGHT, o tratamento com a tolvaptana associou-se a aumento da osteocalcina, marcador de formação óssea.",
  "In the INSIGHT trial", "a marker of bone formation")
a(S9, "⚠️ Em dois estudos com o inibidor de SGLT2 empagliflozina, os pacientes cujo sódio se normalizou mostraram aumento de marcadores de atividade osteoblástica, enquanto os que permaneceram hiponatrêmicos não.",
  "Similar results were seen in two studies involving the SGLT2 inhibitor", "remained hyponatremic did not")
a(S9, "⚠️ Uma análise transversal recente em idosos encontrou que mesmo a hiponatremia leve associou-se independentemente a menor densidade mineral óssea no quadril, embora sem alterações na estrutura trabecular.",
  "A recent cross-sectional analysis in older adults", "without changes in trabecular structure")
a(S9, "Além da saúde óssea, a hiponatremia também foi ligada a sarcopenia e redução da força muscular em pacientes idosos; trabalhos experimentais em ratos envelhecidos mostram que a hiponatremia pode acelerar a perda de massa magra e associa-se a maiores taxas de hipogonadismo e cardiomiopatia, fatores que aceleram as mudanças ligadas à idade.",
  "Beyond bone health, hyponatremia has also been linked to sarcopenia", "accelerate the age-related changes")

# ============ MORBIDITY / MORTALITY ============
S10 = "Effects of hyponatremia and its correction — Morbidity and mortality"
a(S10, "A hiponatremia foi ligada a piores desfechos em ampla gama de condições médicas, com múltiplos estudos mostrando associação com maior mortalidade, o que provavelmente reflete interação complexa de doenças subjacentes e fatores fisiológicos.",
  "Hyponatremia has been linked to poorer outcomes across a wide range", "underlying disorders and")
a(S10, "Em pacientes com SIAD, o tratamento ativo associou-se a maior correção do sódio e a internações mais curtas do que o cuidado padrão.",
  "For example, in", "compared with")
a(S10, "⚠️ Em pacientes com insuficiência cardíaca, a falha em corrigir a hiponatremia foi ligada a maior probabilidade de reinternação ou óbito.",
  "In heart failure patients, failure to correct hyponatremia", "readmission or")
a(S10, "⚠️ Uma metanálise de 15 estudos observacionais indicou que a melhora da hiponatremia se correlaciona com redução da mortalidade global, particularmente em idosos e naqueles com hiponatremia mais pronunciada.",
  "A meta-analysis of 15 observational studies", "more pronounced hyponatremia")
a(S10, "⚠️ Ensaios clínicos randomizados, todos usando antagonistas do receptor de vasopressina (vaptanos), não demonstraram benefício claro sobre mortalidade ou reinternação — o que pode dever-se ao risco de sobrecorreção e eventos adversos associados, bem como à natureza heterogênea da hiponatremia, que provavelmente exige abordagem mais individualizada.",
  "Randomized controlled trials, all using vasopressin receptor antagonists", "individualized treatment ap")
a(S10, "Permanece incerto se a ligação entre hiponatremia e maus desfechos clínicos é causal ou apenas associativa; resultados de um grande ensaio randomizado avaliando o impacto do tratamento direcionado da hiponatremia sobre mortalidade e reinternação em 30 dias devem ser publicados em breve.",
  "Whether the link between hyponatremia and poor clinical outcomes", "in the near future")

# ============ TREATMENT — GENERAL ============
S11 = "Hyponatremia treatment options"
a(S11, "Como o quadro clínico depende do início da hiponatremia, o tratamento também se divide nessas categorias: nos casos agudos com manifestações graves, a correção rápida com salina hipertônica tem prioridade sobre a investigação diagnóstica ou a terapia específica da causa.",
  "Since the clinical picture depends on hyponatremia onset", "or cause-specific")
a(S11, "⚠️ Na hiponatremia crônica, o manejo foca em tratar a causa subjacente elevando o sódio gradualmente para permitir a reversão das adaptações cerebrais — máximo de 10 mmol/l nas primeiras 24 h e de 18 mmol/l nas primeiras 48 h.",
  "In chronic hyponatremia, management focuses on addressing the underlying cause", "in the first 48 h")
a(S11, "⚠️ Em pacientes com hiponatremia profunda, hipocalemia, alcoolismo, doença hepática avançada ou desnutrição, que têm alto risco de síndrome de desmielinização osmótica — complicação neurológica potencialmente devastadora causada por dano à mielina pelo estresse osmótico —, recomendam-se taxas de correção ainda mais lentas, de 6–8 mmol/l em 24 h.",
  "In patients with profound hyponatremia, hypokalemia, alcoholism", "within 24 h are recommended")
a(S11, "⚠️ Se os limites de correção forem excedidos, podem-se usar medidas como ingestão oral de água, fluidos hipotônicos intravenosos ou desmopressina para rebaixar o sódio.",
  "If correction limits are exceeded", "to re-lower sodium levels")

# ============ HYPERTONIC SALINE ============
S12 = "Hyponatremia treatment options — Hypertonic saline infusion"
a(S12, "A hiponatremia aguda gravemente sintomática é emergência médica que exige tratamento imediato com salina hipertônica.",
  "Acute, severely symptomatic hyponatremia is a medical emergency", "immediate treatment with hypertonic saline")
a(S12, "⚠️ As diretrizes americana e europeia diferem levemente na dose (100 ml de salina a 3% em 10 min versus 150 ml de salina a 3% em 20 min, respectivamente), mas ambas visam a uma elevação rápida e modesta do sódio de 5 mmol para melhorar os sintomas.",
  "American and European guidelines", "rise in sodium to improve symptoms")
a(S12, "A diretriz europeia recomenda ajuste de dose para 2 ml/kg em pacientes nos extremos de tamanho corporal, propensos a sobre ou subcorreção.",
  "The European guidelines", "prone to over- or under")
a(S12, "⚠️ Cautela extra é recomendada em indivíduos idosos ou frágeis, que têm risco aumentado de sobrecorreção pela massa magra e pela água corporal total frequentemente menores.",
  "Extra caution is also advised in older or frail individuals", "total body water")
a(S12, "A administração em bólus parece mais segura e preferível à infusão contínua, e ambas podem ser feitas por acesso venoso periférico.",
  "Overall, bolus administration appears safer and preferable to continuous infusion", "peripheral venous access")
a(S12, "Alguns centros usam o “clamp de desmopressina”, administrando desmopressina junto com a salina hipertônica para reduzir o risco de correção rápida demais; dados observacionais apoiam a abordagem, mas faltam ensaios randomizados.",
  "Some centres also use a “desmopressin clamp,”", "randomized trials are lacking")

# ============ ISOTONIC SALINE ============
S13 = "Hyponatremia treatment options — Isotonic saline infusion"
a(S13, "A salina isotônica, geralmente cloreto de sódio a 0,9%, é o pilar do tratamento da hiponatremia hipovolêmica: repõe água e sódio ao mesmo tempo em que suprime a ativação do SRAA e da AVP, o que pode disparar diurese aquosa — tornando essencial a monitorização rigorosa do sódio nos pacientes com hiponatremia grave.",
  "Isotonic saline, usually 0.9 % sodium chloride", "in patients with severe hyponatremia")
a(S13, "⚠️ Em contraste, a salina isotônica deve ser evitada na SIAD, pois a água infundida não pode ser adequadamente excretada e pode reduzir ainda mais o sódio.",
  "In contrast, isotonic saline should be avoided in SIAD", "further lower sodium levels")

# ============ FLUID RESTRICTION ============
S14 = "Hyponatremia treatment options — Fluid restriction"
a(S14, "A restrição hídrica é o tratamento de primeira linha da SIAD crônica não gravemente sintomática.",
  "Fluid restriction is the first-line treatment for chronic", "non-severely symptomatic SIAD")
a(S14, "⚠️ Dois ensaios randomizados em pacientes majoritariamente idosos mostraram melhora apenas modesta do sódio com a restrição hídrica (3 e 4 mmol/l após 4 dias), e a efetividade no mundo real é frequentemente menor.",
  "Two randomized trials in mainly", "real-world effectiveness is often lower")
a(S14, "⚠️ A restrição hídrica é particularmente pouco efetiva em pacientes com urina muito concentrada (>500 mOsm/kg) ou com sódio urinário alto (>130 mmol/l).",
  "This is particularly the case in patients with highly concentrated urine", "have been reported")
a(S14, "Embora geralmente segura, casos ocasionais de lesão renal aguda e hipotensão foram relatados com a restrição hídrica.",
  "While generally safe, occasional cases of acute kidney injury", "have been reported")
a(S14, "As recomendações típicas são limitar a ingestão de fluidos a cerca de meio litro a um litro por dia, ou a meio litro a menos do que o débito urinário diário.",
  "Typical recommendations are to limit fluid intake", "than daily urine output")
a(S14, "A razão eletrólitos urina/plasma pode ajudar a guiar o nível de restrição, com valores mais altos indicando limites mais estritos.",
  "The urine-to-plasma electrolyte ratio", "indicating stricter limits")
a(S14, "⚠️ Manter restrição hídrica estrita ao longo do tempo é difícil, e um limite mais moderado pode bastar em pacientes cuja urina é menos concentrada — o que raramente é o caso em pacientes idosos, por sua sensação de sede frequentemente reduzida e consequente menor ingestão de líquidos.",
  "Maintaining strict fluid restriction over time can be challenging", "consequently lower fluid intake")

# ============ LOOP DIURETICS ============
S15 = "Hyponatremia treatment options — Loop diuretics"
a(S15, "Os diuréticos de alça são o pilar do manejo da hiponatremia hipervolêmica, reduzindo a capacidade renal de reabsorver água e levando a aquarese.",
  "Loop diuretics are the mainstay in managing hypervolemic hyponatremia", "thereby leading to aquaresis")
a(S15, "As diretrizes europeias listam diuréticos de alça em baixa dose com comprimidos de cloreto de sódio como opção de segunda linha para SIAD moderada a grave.",
  "European guidelines list low-dose loop diuretics with sodium chloride tablets", "for moderate to severe SIAD")
a(S15, "⚠️ Um ensaio, porém, mostrou que acrescentar diuréticos de alça — isolados ou com comprimidos de sal — à restrição hídrica não trouxe vantagem sobre a restrição hídrica isolada para elevar o sódio.",
  "However, one trial found that adding loop diuretics", "over fluid restriction alone in raising sodium levels")

# ============ VAPTANS ============
S16 = "Hyponatremia treatment options — Vasopressin receptor antagonists"
a(S16, "Os vaptanos promovem excreção de água sem perda de sódio, reduzindo a capacidade renal de reabsorver água pelos canais de aquaporina 2; a tolvaptana, oral, está disponível na Europa e nos EUA, enquanto a conivaptana é opção intravenosa usada apenas nos EUA.",
  "Vaptans promote water excretion without sodium loss", "an intravenous option used only in the")
a(S16, "Grandes ensaios clínicos mostraram que a tolvaptana eleva efetivamente o sódio em pacientes com SIAD, insuficiência cardíaca ou cirrose hepática, levando à sua aprovação para SIAD na Europa e para hiponatremia euvolêmica e hipervolêmica nos EUA.",
  "Large clinical trials showed that tolvaptan effectively raises sodium levels", "hypervolemic hyponatremia in the US")
a(S16, "Em 2013, a FDA restringiu o uso da tolvaptana na cirrose hepática depois que doses mais altas foram ligadas a toxicidade hepática grave em pacientes tratados por doença renal policística.",
  "However, in 2013 the FDA restricted its use in liver cirrhosis", "treated for polycystic kidney disease")
a(S16, "⚠️ A principal preocupação com a tolvaptana é o risco de correção rápida demais do sódio, especialmente na hiponatremia profunda, motivo pelo qual o tratamento costuma ser iniciado no hospital; começar com dose menor (7,5 mg/dia) ajuda a reduzir esse risco, mas mesmo assim houve elevação rápida do sódio em um em cada cinco pacientes em estudo recentemente publicado.",
  "A key concern with tolvaptan is the risk of overly rapid sodium correction", "in a recently published study")
a(S16, "⚠️ É preciso cautela extra em quem usa inibidores ou indutores da CYP3A4 pelas possíveis interações medicamentosas, problema comum em idosos com múltiplos medicamentos.",
  "Extra caution is needed in those taking CYP3A4 inhibitors or inducers", "with multiple medications")
a(S16, "⚠️ O tratamento com tolvaptana também exige que o paciente possa beber livremente e tenha sensação de sede intacta, o que pode estar diminuído no idoso.",
  "Treatment also requires that patients can drink freely", "may be diminished in the elderly")
a(S16, "O alto custo diário da tolvaptana pode limitar ainda mais seu uso, particularmente em idosos com restrições financeiras; ainda assim, houve sucesso a longo prazo em casos cuidadosamente monitorados, tornando-a opção potente em pacientes idosos criteriosamente selecionados.",
  "The high daily cost of tolvaptan can further limit its use", "carefully selected older patients")

# ============ SALT TABLETS ============
S17 = "Hyponatremia treatment options — Salt tablets"
a(S17, "⚠️ Usar comprimidos de sal isoladamente para tratar SIAD costuma ser inefetivo, pois cada comprimido fornece apenas pequena carga osmótica, sendo necessários muitos para aumentar significativamente o débito urinário; um estudo prospectivo não encontrou benefício adicional dos comprimidos de sal combinados à restrição hídrica.",
  "Using salt tablets alone to treat SIAD is often ineffective", "combined with fluid restriction")

# ============ UREA ============
S18 = "Hyponatremia treatment options — Oral urea"
a(S18, "A administração de ureia oral em pó leva a diurese osmótica por sua forte carga osmótica; na maioria dos países europeus a ureia é fornecida por farmácias como alimento médico manipulado, enquanto nos EUA há formulações aromatizadas prontas para uso e aprovadas pela FDA.",
  "Administration of oral urea powder leads to osmotic diuresis", "approved [135]")
a(S18, "As diretrizes europeias recomendam a ureia para SIAD moderada a grave refratária à restrição hídrica.",
  "European guidelines recommend its use for moderate to severe", "refractory SIAD")
a(S18, "⚠️ Embora se recomende dose ajustada ao peso corporal (0,25–0,50 g/kg por dia), costuma-se usar dose inicial de 30 g por dia, que pode ser aumentada para 60 ou 90 g por dia se necessário.",
  "Although a", "if needed")
a(S18, "⚠️ Em pacientes idosos frágeis ou com alto risco de sobrecorreção, deve-se escolher dose inicial menor, de 15 g por dia.",
  "In frail elderly patients or patients at high risk for overcorrection", "should be chosen")
a(S18, "A ureia mostrou-se efetiva em ampla gama de pacientes com SIAD: um estudo prospectivo a considerou segura, bem tolerada e tão efetiva quanto a tolvaptana quando os pacientes receberam cada tratamento por um ano em sequência.",
  "Urea has been shown to be effective in a wide range of patients with SIAD", "each treatment for a year in sequence")
a(S18, "Não há ensaios controlados randomizados com ureia, mas metanálises recentes apoiam sua segurança e eficácia.",
  "Although no randomized", "support its safety and efficacy")
a(S18, "⚠️ O uso de ureia também foi relatado na hiponatremia hipervolêmica por insuficiência cardíaca; contudo, seu benefício é duvidoso em pacientes com ureia basal alta e, na cirrose hepática, deve ser usada apenas com extrema cautela pela evidência limitada e pelo risco de encefalopatia hepática.",
  "The use of urea has also been reported", "risk of hepatic encephalopathy")
a(S18, "Um problema comum da ureia é a má palatabilidade, que pode ser melhorada dissolvendo-a em bebida de sabor forte, como suco de laranja, quando não houver preparação aromatizada pronta; de resto é bem tolerada e segura.",
  "A common issue when using urea is its poor palatability", "well tolerated and safe")
a(S18, "⚠️ A ureia pode também proteger contra a síndrome de desmielinização osmótica: em estudo com ratos, causou menos mortes e menos dano neurológico do que os vaptanos ou a salina hipertônica após correção rápida do sódio.",
  "Urea may", "hypertonic saline solution after rapid sodium correction")

# ============ PROTEIN ============
S19 = "Hyponatremia treatment options — Protein supplementation"
a(S19, "As proteínas são fonte natural de ureia, pois são degradadas em nitrogênio, que o fígado converte em ureia para excreção: cerca de 10 g de proteína produzem 50 mmol de ureia.",
  "Proteins are a natural source of urea", "produces 50 mmol of urea")
a(S19, "Em modelos de SIAD em ratos, tanto a dieta hiperproteica quanto a dieta hipoproteica suplementada com ureia oral elevaram o sódio plasmático, reduziram a natriurese e aumentaram a ureia medular em comparação com a dieta hipoproteica isolada.",
  "In rat models of SIAD", "low-protein diet alone")
a(S19, "⚠️ Um estudo clínico prospectivo recente com dezessete pacientes ambulatoriais com SIAD crônica confirmou esses achados: consumir 90 g de proteína por dia por sete dias aumentou os níveis de sódio e de ureia na mesma medida que consumir 30 g de ureia por dia.",
  "A recent prospective clinical study involving seventeen outpatients", "of urea per day")
a(S19, "⚠️ Um efeito colateral positivo da dieta hiperproteica é o aumento de massa e força musculares, o que poderia reduzir o risco de quedas nesse grupo frágil — mas os resultados precisam ser confirmados em estudo maior e de longo prazo.",
  "A positive side effect of a high-protein diet", "larger and longer-term study")

# ============ SGLT2 ============
S20 = "Hyponatremia treatment options — SGLT2 inhibitors"
a(S20, "Os inibidores de SGLT2 promovem excreção urinária de glicose, levando a diurese osmótica e à excreção de água livre de eletrólitos; originalmente desenvolvidos como antidiabéticos orais, também retardam a progressão da doença renal crônica e oferecem proteção cardiovascular inclusive em pessoas sem diabetes.",
  "SGLT2 inhibitors promote glucose excretion in the urine", "in people without diabetes")
a(S20, "⚠️ Em dois ensaios controlados por placebo em pacientes com SIAD, acrescentar a empagliflozina melhorou os níveis de sódio; o primeiro estudo foi em pacientes hospitalizados, limitado a quatro dias e com restrição hídrica associada, e o segundo em pacientes ambulatoriais por quatro semanas e sem restrição hídrica, com aumento moderado do sódio (4 mmol/l) e boa tolerabilidade.",
  "In two placebo-controlled trials in patients with SIAD adding the", "the treatment was well tolerated")
a(S20, "A possibilidade de tratar a SIAD com inibidores de SGLT2 é interessante pelo efeito cardiorrenal protetor, que pode impactar positivamente as comorbidades comuns em pacientes idosos com SIAD; faltam dados de outros inibidores de SGLT2, mas pode-se presumir efeito semelhante ao da empagliflozina.",
  "In addition, the possibility of treating SIAD with SGLT2 inhibitors is interesting", "as empagliflozin treatment can be assumed")
a(S20, "⚠️ Devem-se considerar os efeitos adversos potenciais dos inibidores de SGLT2, incluindo infecções geniturinárias e cetoacidose, como em qualquer outra indicação.",
  "Potential adverse effects of SGLT2 inhibitors", "for any other indication")

# ============ CONCLUSIONS ============
S21 = "Conclusions"
a(S21, "A SIAD é hoje a principal causa de hiponatremia, impulsionada por polifarmácia e múltiplas comorbidades, embora as formas hipervolêmica e hipovolêmica também precisem ser consideradas.",
  "SIAD is now the leading cause, driven by", "must also be considered")
a(S21, "⚠️ Embora antes considerada assintomática, a hiponatremia crônica é hoje ligada a comprometimento neurocognitivo e neuromuscular, densidade óssea reduzida, maior risco de fratura, pior qualidade de vida, mais reinternações e maior mortalidade.",
  "Although once considered asymptomatic, chronic hyponatremia is now linked", "and greater mortality")
a(S21, "Estudos observacionais sugerem que esses desfechos podem melhorar com a correção do sódio, embora os dados de ensaios randomizados permaneçam limitados; até haver evidência mais forte, o manejo da hiponatremia crônica deve ser visto como parte do suporte ao envelhecimento saudável.",
  "Observational", "part of supporting healthy ageing")
a(S21, "O diagnóstico diferencial apropriado é pré-requisito, já que o tratamento adequado difere conforme a etiologia da hiponatremia.",
  "Appropriate differential diagnosis is a prerequisite", "aetiologies of hyponatremia")
a(S21, "Os pilares do tratamento da hiponatremia crônica são: salina isotônica na hiponatremia hipovolêmica; restrição hídrica e diuréticos de alça na hipervolêmica; e restrição hídrica, ureia ou vaptanos nos pacientes com SIAD.",
  "Several treatment modalities of chronic hyponatremia are available", "with SIAD")
a(S21, "A suplementação proteica e os inibidores de SGLT2 surgiram nos últimos anos como alternativas de tratamento atraentes e holísticas, especialmente em pacientes idosos.",
  "In addition, protein supplementation and SGLT2 inhibitors have appeared", "especially in older patients")

# ============ PRACTICE POINTS ============
S22 = "Practice Points"
a(S22, "Os idosos enfrentam risco aumentado de hiponatremia por mudanças relacionadas à idade na regulação da AVP e na capacidade de concentração urinária, além de maiores taxas de comorbidades, polifarmácia e desnutrição.",
  "• Older adults face a heightened risk of hyponatremia due to age-related changes", "polypharmacy, and malnutrition")
a(S22, "A hiponatremia crônica está ligada a maior mortalidade e morbidade, incluindo declínio neuromuscular e cognitivo e osteoporose.",
  "• Chronic hyponatremia is linked to higher mortality and morbidity", "as well as")
a(S22, "Há evidência de que corrigir a hiponatremia pode melhorar a função neuromuscular e neurocognitiva e beneficiar a saúde óssea, e uma abordagem diagnóstica passo a passo é útil na avaliação da hiponatremia.",
  "• Evidence suggests that correcting hyponatremia may improve", "when evaluating hyponatremia")
a(S22, "Há nova evidência para o tratamento da SIAD, com inibidores de SGLT2 e suplementação proteica oferecendo benefícios de saúde mais amplos na população idosa.",
  "• New evidence is available for SIAD treatment", "benefits in the elderly population")

# ============ RESEARCH AGENDA ============
S23 = "Research Agenda"
a(S23, "A agenda de pesquisa inclui biomarcadores para auxiliar no diagnóstico diferencial da hiponatremia, biomarcadores para detecção precoce da síndrome de desmielinização osmótica que guiem a taxa de correção do sódio, o possível papel protetor da ureia contra essa síndrome e ensaios prospectivos sobre a reversibilidade dos déficits neurocognitivos e neuromusculares.",
  "• Biomarkers to aid in the differential diagnosis of hyponatremia", "in hyponatremic patients")

# ---------- build ----------
erros = []
fatos = []
for sec, af, s, e in F:
    i = flat.find(s)
    if i < 0:
        erros.append(('START NAO ENCONTRADO', s[:70], af[:50])); continue
    j = flat.find(e, i)
    if j < 0:
        erros.append(('END NAO ENCONTRADO', e[:70], af[:50])); continue
    cit = flat[i:j+len(e)]
    if flat.count(s) > 1:
        erros.append(('START AMBIGUO (%d)' % flat.count(s), s[:70], af[:50]))
    fatos.append({'afirmacao': af, 'citacao': cit, 'secao': sec})

if erros:
    for t in erros:
        print('ERRO:', t[0], '|', t[1], '|', t[2])
    print('TOTAL ERROS:', len(erros))
    sys.exit(1)

print('fatos construidos:', len(fatos))
json.dump({'fatos': fatos}, open('/home/user/endodirect/scratchpad/work/fatos.json','w',encoding='utf-8'), ensure_ascii=False, indent=1)
