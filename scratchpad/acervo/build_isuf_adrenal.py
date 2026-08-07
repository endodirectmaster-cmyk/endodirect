import sys
sys.path.insert(0, "/home/user/endodirect/scratchpad/acervo")
from _lib_cite import Fonte, grava

FID = "18mp6OOizefDwe5jMezUdcwmAo7Gr6zyr"
F = Fonte("/home/user/endodirect/scratchpad/acervo/textos/%s.txt" % FID)

fatos = []
falhas = []
def f(afirmacao, start, end=None, secao=""):
    try:
        fatos.append({"afirmacao": afirmacao, "citacao": F.q(start, end), "secao": secao})
    except LookupError as e:
        falhas.append(str(e))

RES = "Resumo"
INT = "Introdução"
PAT = "Fisiopatologia e genética"
EPI = "Epidemiologia"
CLI = "Apresentação clínica"
CRI = "Crise adrenal"
DIA = "Diagnóstico"
TRA = "Tratamento"
PAN = "Painel: tratamento da insuficiência adrenal e da crise adrenal"
FUT = "Perspectivas futuras"

# ================= VISÃO GERAL =================
f("A insuficiência adrenal pode surgir de doença adrenal primária, ser secundária à deficiência de ACTH, ou decorrer da supressão do ACTH por glicocorticoide exógeno ou por opioides.",
  "Adrenal insufficiency can arise from a primary adrenal disorder, secondary to adrenocorticotropic hormone deficiency", "or by suppression of adrenocorticotropic hormone by exogenous glucocorticoid or opioid medications", secao=RES)

f("Os achados clínicos característicos da insuficiência adrenal são perda de peso não intencional, anorexia, hipotensão postural, fadiga profunda, dor muscular e abdominal e hiponatremia; além disso, pacientes com insuficiência adrenal primária costumam desenvolver hiperpigmentação cutânea e avidez por sal.",
  "clinical features are unintentional weight loss, anorexia, postural hypotension, profound fatigue, muscle and abdominal pain, and hyponatraemia", "usually develop skin hyperpigmentation and crave salt", secao=RES)

f("O diagnóstico de insuficiência adrenal costuma ser tardio porque a apresentação inicial é frequentemente inespecífica; é preciso melhorar a percepção dos médicos para evitar a crise adrenal.",
  "Diagnosis of adrenal insufficiency is usually delayed because the initial presentation is often non-specific; physician awareness must be improved to avoid adrenal crisis", secao=RES)

f("Apesar da terapia de reposição esteroide de última geração, relatam-se qualidade de vida e capacidade de trabalho reduzidas e mortalidade aumentada nos pacientes com insuficiência adrenal primária ou secundária.",
  "Despite state-of-the-art steroid", "increased mortality is reported in patients with", secao=RES)

f("A crise adrenal ocorre em cerca de 50% dos pacientes com insuficiência adrenal após o diagnóstico, e a prevenção exige educação ativa e repetida do paciente sobre como aumentar a medicação durante doença intercorrente, procedimentos médicos ou odontológicos e estresse profundo.",
  "Active and repeated patient education on managing adrenal insufficiency, including advice on how to increase medication during intercurrent illness", "after diagnosis", secao=RES)

f("É boa prática fornecer ao paciente um cartão de esteroide, hidrocortisona parenteral e treinamento para administrar hidrocortisona parenteral, em caso de vômitos ou doença grave.",
  "It is good practice for physicians to provide patients with a steroid card, parenteral hydrocortisone", "in case of vomiting or severe illness", secao=RES)

f("A insuficiência adrenal divide-se em formas primária (adrenal), secundária (hipofisária) e terciária (hipotalâmica), cada uma com causas distintas e implicações para o tratamento e o seguimento.",
  "Adrenal insufficiency is a common condition with multiple", "causes with implications for treatment and follow-up", secao=INT)

f("A insuficiência adrenal terciária causada por tratamento com esteroide exógeno é forma comum e facilmente perdida, por causa de sinais e sintomas inespecíficos indistinguíveis das manifestações da doença de base.",
  "ment is a common form of adrenal insufficiency, and is easily missed due to its non-specific signs and symptoms that can be indistinguish able from manifestations of the", "underlying condition", secao=INT)

f("A insuficiência adrenal secundária é rara e decorre de defeitos da função hipofisária, causados frequentemente por adenomas hipofisários ou por seu tratamento; a insuficiência adrenal primária ocorre com menos frequência que a secundária ou a terciária e é causada por patologia intrínseca da adrenal, comumente autoimunidade destrutiva ou erro inato da esteroidogênese.",
  "rare, and occurs due to defects of pituitary gland function, which is often caused by pituitary adenomas or by their treatment", "commonly destructive autoimmunity or inborn error of steroidogenesis", secao=INT)

f("A insuficiência adrenal pode se manifestar em qualquer idade, mas frequentemente se apresenta entre 20 e 50 anos.",
  "Adrenal insufficiency can manifest at any age, but", "often presents between the ages of 20 years and", "50 years", secao=INT) if False else f(
  "A insuficiência adrenal pode se manifestar em qualquer idade, mas frequentemente se apresenta entre os 20 e os 50 anos.",
  "Adrenal insufficiency can manifest at any age, but", "50 years. Despite substantial advances", secao=INT)

f("A insuficiência adrenal secundária apresenta-se em duas formas principais: como componente de insuficiência hipofisária, seja como defeito isolado da secreção de ACTH, seja como deficiência de ACTH combinada a outros hormônios hipofisários. Já a insuficiência adrenal terciária é mais comumente consequência de tratamento farmacológico com glicocorticoides ou de uso ilícito de opiáceos.",
  "insufficiency (table 2) presents in two major forms;", "corticoids or illicit use of opiates", secao=INT)

# ================= FISIOPATOLOGIA =================
f("A regulação do eixo produz um ritmo de cortisol circadiano e ultradiano robusto porém adaptável (pulsação com frequência menor que 24 h), caracterizado por surtos secretórios a cada 60–90 min; a produção de aldosterona é regulada principalmente pelo sistema renina-angiotensina, mas o eixo hipotálamo-hipófise-adrenal também causa variação circadiana da aldosterona.",
  "The result of this regulation is a robust", "variation of aldosterone", secao=PAT)

f("A forma hereditária mais comum de insuficiência adrenal primária é a hiperplasia adrenal congênita, e mais de 95% dos casos de hiperplasia adrenal congênita são causados por mutações recessivas no gene CYP21A2, que codifica a esteroide 21-hidroxilase, enzima-chave da biossíntese de cortisol e aldosterona.",
  "Notably, the most common inherited form of primary adrenal insufficiency is congenital adrenal hyperplasia", "a key enzyme in cortisol and aldosterone biosynthesis", secao=PAT)

f("A insuficiência adrenal primária adquirida é tipicamente causada por autoimunidade, infecções, hemorragia, metástases ou adrenalectomia bilateral.",
  "Acquired primary adrenal insufficiency is typically caused by", "bilateral adrenalectomy (table 1)", secao=PAT)

f("A insuficiência adrenal primária autoimune caracteriza-se pela destruição autoimune do córtex adrenal, com o sistema imune tendo a 21-hidroxilase como alvo.",
  "Autoimmune primary adrenal insufficiency is char", "lase", secao=PAT)

f("A insuficiência adrenal primária autoimune pode se apresentar em qualquer idade, mas a maioria dos indivíduos é diagnosticada entre 20 e 50 anos, com discreto predomínio em mulheres.",
  "individuals are diagnosed between the ages of 20 years and 50 years, with a slight preponderance in women", secao=PAT)

f("A insuficiência adrenal primária autoimune é isolada em até 40% dos pacientes, podendo, nos demais, aparecer em combinação com uma ou mais endocrinopatias autoimunes órgão-específicas, como doença tireoidiana autoimune, diabetes tipo 1 e insuficiência ovariana prematura.",
  "Autoimmune primary adrenal insufficiency can be isolated in up to 40% of patients", "premature ovarian insufficiency", secao=PAT)

f("Outras doenças autoimunes órgão-específicas ocorrem frequentemente com a insuficiência adrenal primária, incluindo gastrite autoimune com anemia perniciosa, doença celíaca, vitiligo ou alopecia; todas essas combinações podem ser classificadas como síndrome poliendócrina autoimune tipo 2.",
  "adrenal insufficiency, including autoimmune gastritis", "immune polyendocrine syndrome type 2", secao=PAT)

f("A síndrome poliendócrina autoimune tipo 1 é doença monogênica caracterizada por insuficiência adrenal primária com início na infância ou adolescência (dos 2 aos 20 anos de idade) em combinação com hipoparatireoidismo e candidíase mucocutânea crônica.",
  "monogenic disease that is char acterised by primary adrenal insufficiency with onset during childhood or adolescence", "didiasis", secao=PAT)

f("Pacientes com síndrome poliendócrina autoimune tipo 1 apresentam outras manifestações autoimunes órgão-específicas, incluindo insuficiência ovariana prematura (antes da puberdade, mas tipicamente antes dos 30 anos), alopecia e vitiligo graves, gastrite, hepatite e pneumonite autoimunes, febre com exantema, ceratite e distrofia ungueal puntiforme; a hipoplasia do esmalte dos dentes permanentes está entre as manifestações mais comuns.",
  "premature ovarian insufficiency (before puberty, but typically before the age of 30 years)", "is a clinical indication to", secao=PAT)

f("O primeiro sinal de adrenalite em curso é a presença de autoanticorpos anti-21-hidroxilase; em seguimento prospectivo, 28 (25%) de 114 indivíduos desenvolveram insuficiência adrenal manifesta ao longo de 10 anos de acompanhamento.",
  "an ongoing adrenalitis is the presence of autoantibodies", "insufficiency during a follow-up of 10 years", secao=PAT)

f("A causa mais comum de insuficiência adrenal secundária é um tumor na hipófise ou em suas imediações, com a deficiência de ACTH causada pelo próprio tumor ou por seu tratamento (cirurgia ou radioterapia); craniofaringiomas, meningiomas e outros tumores intrasselares também podem se apresentar com insuficiência adrenal secundária.",
  "The most common cause of secondary adrenal insuf", "present with secondary adrenal insufficiency", secao=PAT)

# ================= EPIDEMIOLOGIA =================
f("A insuficiência adrenal primária é rara: a maior prevalência foi relatada nos países nórdicos, de 15–22 indivíduos por 100 000; outros países europeus têm números em torno de dez por 100 000, e um levantamento da Coreia do Sul relatou prevalência de apenas 0·4 por 100 000, com tumores e tuberculose como principais causas.",
  "Primary adrenal insufficiency is rare; the highest", "tumours and tuberculosis as the main causes", secao=EPI)

f("A insuficiência adrenal secundária é relatada em cerca de 14–28 indivíduos por 100 000, segundo dados da Espanha e do Reino Unido, representando mistura de deficiência isolada de ACTH e de deficiência de ACTH combinada a outras deficiências hipofisárias.",
  "Secondary adrenal insufficiency is reported in about", "14–28 indivi", "combination with other pituitary hormone deficiencies", secao=EPI) if False else f(
  "A insuficiência adrenal secundária é relatada em cerca de 14–28 indivíduos por 100 000, segundo dados da Espanha e do Reino Unido, representando mistura de deficiência isolada de ACTH e de deficiência de ACTH combinada a outras deficiências hipofisárias.",
  "14–28 individuals per 100 000 according to the numbers", "isolated ACTH insufficiency and ACTH insufficiency in", secao=EPI)

f("Cerca de 1% da população do Reino Unido e dos EUA é tratada com glicocorticoides para condições inflamatórias ou imunomediadas.",
  "Around 1% of the population from the UK and the USA are treated with glucocorticoids for inflammatory or", secao=EPI)

f("O uso diário de 5 mg ou mais de prednisolona por mais de 3 semanas pode levar à insuficiência adrenal terciária, em relação com a dose e a duração, por causa da deficiência de ACTH resultante.",
  "Daily use of 5 mg or more of prednisolone for longer than 3 weeks might lead to tertiary adrenal insufficiency in relation to dose and duration, on account of the resultant ACTH deficiency", secao=EPI)

f("Os opiáceos também podem suprimir a liberação de ACTH e levar a falência adrenal funcional, observada em 10–20% dos indivíduos que usam doses diárias equivalentes a 100 mg ou mais de morfina.",
  "Opiates can also suppress ACTH release and lead to functional adrenal failure, which is noted in 10–20% of individuals using daily morphine-equivalent doses of 100 mg or more", secao=EPI)

# ================= APRESENTAÇÃO CLÍNICA =================
f("Condições genéticas são a causa mais comum de insuficiência adrenal primária em recém-nascidos (0–4 semanas), lactentes (0–2 anos) e crianças (2–12 anos), incluindo hiperplasia adrenal congênita, adrenoleucodistrofia e hipoplasia adrenal congênita; adrenoleucodistrofia e hipoplasia adrenal congênita estão ligadas ao cromossomo X e afetam apenas meninos.",
  "Genetic conditions are the most common cause of primary", "the X chromosome and only affect boys", secao=CLI)

f("Na síndrome poliendócrina autoimune tipo 1, a insuficiência adrenal primária autoimune apresenta-se a partir de cerca dos 3 anos de idade; a maioria desses pacientes exibe autoanticorpos contra 21-hidroxilase e contra interferon alfa ou interferon ômega.",
  "primary adrenal insufficiency presents from about the age", "or interferon omega", secao=CLI)

f("Após a puberdade, a autoimunidade é a principal causa de insuficiência adrenal primária na Europa e na América do Norte; em outras partes do mundo as infecções têm papel maior, especialmente a tuberculose.",
  "After puberty, autoimmunity is the", "have been reported", secao=CLI)

f("Em indivíduos com 20 anos ou mais, causam insuficiência adrenal primária a hemorragia por anticoagulação, trauma ou síndrome antifosfolípide, tumores primários (por exemplo linfoma) ou metástases, e doenças infiltrativas (hemocromatose, doença de Erdheim-Chester e amiloidose). Outros agentes infecciosos incluem HIV, Treponema pallidum, Cryptococcus spp e histoplasmose; apesar do tratamento, a insuficiência adrenal após infecções é frequentemente irreversível.",
  "In individuals aged 20 years or", "infections is often irreversible", secao=CLI)

f("A insuficiência adrenal primária autoimune tem tipicamente início insidioso, com sintomas como diminuição do apetite, perda de peso não intencional, náusea e dor em abdome, articulações e músculos; fadiga e letargia são proeminentes.",
  "Autoimmune primary adrenal insufficiency typically has an insidious start", "Fatigue and lethargy are prominent", secao=CLI)

f("Pela perda de sal na urina e consequente redução do volume sanguíneo, a pressão arterial cai e surge hipotensão ortostática junto com avidez por sal; a deficiência de glicocorticoide pode às vezes levar a hipoglicemia grave, especialmente em crianças.",
  "Due to salt loss through the urine and the ensuing reduction in blood volume", "especially in children", secao=CLI)

f("O achado mais distintivo da insuficiência adrenal primária autoimune é o aumento da pigmentação da pele e das mucosas, sobretudo em áreas expostas ao sol e sujeitas a atrito, como articulações dos dedos, pregas das mãos e cotovelos; a hiperpigmentação é causada por altas concentrações de ACTH circulante, que estimulam receptores dérmicos de melanocortina.",
  "The most distinctive feature of autoimmune primary adrenal insufficiency is increased pigmentation of the skin and mucous membranes", "which stimulate dermal melanocortin receptors", secao=CLI)

f("Os sintomas progridem ao longo de meses, às vezes anos, e infelizmente muitos pacientes com insuficiência adrenal só são diagnosticados quando desenvolvem uma crise adrenal potencialmente fatal; é particularmente perigoso presumir transtorno alimentar primário em mulher jovem com perda de peso inexplicada, sem considerar causa física.",
  "Symptoms progress over the course of months, sometimes even years", "loss", secao=CLI)

f("Doença tireoidiana autoimune (tireoidite de Hashimoto e doença de Graves) ocorre em 50% dos pacientes com insuficiência adrenal primária; diabetes tipo 1 está presente em 10–15% desses pacientes nos países escandinavos, sendo menos frequente em outros lugares. (Citação de PDF em duas colunas: o texto da coluna vizinha aparece intercalado.)",
  "occurs in 50% of patients with primary adrenal insuf", "patients in Scandinavian countries but is less frequent", secao=CLI)

f("Doença celíaca está presente em cerca de 5% dos pacientes com insuficiência adrenal primária, e gastrite autoimune com deficiência de vitamina B12 ocorre em cerca de 10% desses pacientes.",
  "Coeliac disease is present in about 5% of", "around 10% of those patients", secao=CLI)

f("Mulheres com insuficiência adrenal primária têm risco de insuficiência ovariana primária, que pode surgir já na adolescência (mas geralmente aos vinte ou trinta anos); no conjunto, esse distúrbio está presente em cerca de 10% das pacientes com insuficiência adrenal primária.",
  "Women with primary", "adrenal insufficiency", secao=CLI) if False else f(
  "Mulheres com insuficiência adrenal primária têm risco de insuficiência ovariana primária, que pode surgir já na adolescência (mas geralmente aos vinte ou trinta anos); no conjunto, esse distúrbio está presente em cerca de 10% das pacientes com insuficiência adrenal primária.",
  "insufficiency that can appear as early as the teenage years", "disorder is present in about 10% of patients with primary", secao=CLI)

f("Ao contrário, o hipogonadismo em homens é raro; se presente, deve-se considerar variante leve de adrenoleucodistrofia em homens com anticorpos anti-21-hidroxilase negativos. A presença de hipoparatireoidismo ou de infecções por candida deve motivar investigação de síndrome poliendócrina autoimune tipo 1.",
  "By contrast, hypogonadism in male indi viduals is rare", "type 1 (figure 4)", secao=CLI)

f("Registros nacionais indicam aproximadamente o dobro da taxa de mortalidade em pacientes com insuficiência adrenocortical primária; parte do excesso relaciona-se a crises adrenais agudas, especialmente entre homens com menos de 30 anos.",
  "Data from national registries indicate an approximate", "among male individuals younger than 30 years", secao=CLI)

f("Em estudo de 2017, pacientes com insuficiência adrenal primária e diabetes tiveram taxa de mortalidade quase quatro vezes maior do que pacientes apenas com diabetes; outra grande causa de morte na insuficiência adrenal primária é a doença cardiovascular, especialmente em mulheres, ligada a altas doses de corticosteroide de reposição.",
  "study,68 patients with primary adrenal insufficiency", "to high doses of corticosteroid replacement therapy", secao=CLI)

f("Outras complicações associadas à insuficiência adrenal primária são osteoporose e fraturas; vários estudos mostraram baixa densidade mineral óssea, especialmente nos tratados com esteroides sintéticos, podendo manifestar-se como osteoporose vertebral estabelecida com deformidade e fratura vertebral, apesar de densidade mineral óssea do quadril relativamente preservada.",
  "Other possible complications associated with primary", "despite relatively preserved hip bone mineral density", secao=CLI)

f("Se o excesso de reposição com glicocorticoide for evitado, a densidade mineral óssea costuma ser minimamente afetada, mas recomenda-se medida periódica da densidade mineral óssea em todos os pacientes com insuficiência adrenal primária.",
  "If over-replacement with glucocorticoids is avoided, bone mineral density is often minimally affected, but periodic bone mineral density measurement is recommended in all patients with primary adrenal insufficiency", secao=CLI)

f("A insuficiência adrenal secundária costuma ser mais branda que a primária, no sentido de que a produção mineralocorticoide está intacta e a insuficiência adrenal é parcial; contudo, deficiências hormonais além do ACTH podem influenciar e até dominar o quadro clínico.",
  "Secondary adrenal insufficiency is usually milder than", "clinical picture", secao=CLI)

f("Estudo do Reino Unido relatou razão de mortalidade padronizada de 1·87 na insuficiência adrenal secundária, relacionada a doenças cardiovascular, cerebrovascular e respiratória, enquanto o registro KIMS mostrou razão de mortalidade padronizada menor, mas ainda significativamente aumentada, de 1·13 em indivíduos com deficiência de hormônio de crescimento.",
  "A study from the UK reported a standardised mortality ratio of", "individuals with growth hormone deficiency", secao=CLI)

f("A razão de mortalidade padronizada foi maior em pacientes com adenoma hipofisário não funcionante que necessitavam de mais de 20 mg de hidrocortisona por dia do que naqueles que precisavam de 20 mg por dia ou de nenhuma hidrocortisona, sugerindo possível papel do excesso de reposição de glicocorticoide na mortalidade.",
  "The standardised mortality ratio was higher in patients with", "in mortality", secao=CLI)

f("A insuficiência adrenal secundária ao tratamento com esteroide é grupo heterogêneo, pois muitos indivíduos paradoxalmente têm aspecto cushingoide como consequência do tratamento farmacológico com esteroide; a administração concomitante de drogas que inibem o metabolismo do glicocorticoide (por exemplo ritonavir e itraconazol) pode levar a supressão adrenal profunda, mesmo com uso de esteroides locais e tópicos.",
  "Adrenal insufficiency secondary to steroid treatment is a", "even with use of local and topical steroids", secao=CLI)

f("A retirada gradual do esteroide ao longo de vários meses permite que muitos indivíduos recuperem a função adrenal, e o teste padrão de estímulo com cosintropina (ACTH1–24) pode ser usado para avaliar a chance de recuperação do eixo hipotálamo-hipófise-adrenal.",
  "Gradual steroid withdrawal", "axis recovery", secao=CLI)

# ================= CRISE ADRENAL =================
f("A crise adrenal aguda é emergência potencialmente fatal que exige diagnóstico e tratamento imediatos; a frequência entre pacientes com insuficiência adrenal primária ou secundária é de três a 11 por 100 pessoas-ano, mesmo entre os que receberam educação sobre o manejo da insuficiência adrenal.",
  "Acute adrenal crisis is a life-threatening emergency that requires immediate diagnosis and treatment", "about managing adrenal insufficiency", secao=CRI)

f("Gastroenterite ou intoxicação alimentar são as causas mais frequentes de crise adrenal, seguidas de infecções, procedimentos cirúrgicos e odontológicos, lesões, infarto do miocárdio, reações alérgicas, hipoglicemia grave em pacientes com diabetes, estresse psicológico grave e abstenção do tratamento em pacientes mal educados sobre o manejo ou não aderentes.",
  "Gastroenteritis or food poisoning are the most frequent causes of adrenal crisis", "are poorly educated in managing adrenal insufficiency or not compliant", secao=CRI)

f("Os sintomas da crise adrenal aguda são mal-estar profundo, fadiga, náusea, vômitos, dor abdominal (às vezes com irritação peritoneal), cefaleia, dor ou câimbras musculares e desidratação, que levam a hipotensão e choque; disfunção cognitiva, incluindo confusão, perda de consciência e coma, é comum durante a crise.",
  "Symptoms of acute adrenal crisis are profound malaise", "is common during adrenal crisis", secao=CRI)

f("São típicos da crise adrenal: hiponatremia, hipercalemia, aumento da creatinina por insuficiência pré-renal, hipoglicemia (especialmente em crianças) e, às vezes, hipercalcemia leve. Pacientes gravemente enfermos podem apresentar potássio e sódio séricos normais, por vômitos intensos com perda de potássio e desidratação.",
  "Hyponatraemia, hyperkalaemia, and increased concentrations of creatinine caused by prerenal failure", "with loss of potassium and dehydration", secao=CRI)

# ================= DIAGNÓSTICO =================
f("O principal desafio na avaliação da função adrenocortical é a vigilância constante do médico para a insuficiência adrenal; uma vez suspeitada, é geralmente fácil confirmar ou refutar clinicamente a suspeita.",
  "The primary challenge in evaluating adrenocortical", "confirm or refute the clinical suspicion", secao=DIA)

f("Em levantamento com pacientes com insuficiência adrenal ainda não diagnosticada, a hiponatremia estava presente em 207 (84%) de 247 indivíduos, o TSH estava aumentado em 79 (52%) de 153 e a hipercalemia estava presente em 82 (34%) de 242; assim, hiponatremia inexplicada deve sempre disparar a consideração de insuficiência adrenal.",
  "A survey indicated that hyponatraemia was present in 207 (84%) of 247 individuals with undiagnosed", "always trigger the consideration of adrenal insufficiency", secao=DIA)

f("Em muitos casos, a dosagem pareada de cortisol sérico e ACTH mostrando cortisol baixo (frequentemente menor que 100 nmol/L) e ACTH com concentração igual ao dobro do limite superior de referência é suficiente para diagnosticar insuficiência adrenal.",
  "a paired assay of serum cortisol and ACTH indicating low cortisol concentration (often less than 100 nmol/L) and an ACTH concentration double the upper reference limit is sufficient to diagnose adrenal insufficiency", secao=DIA)

f("Aldosterona baixa com renina alta ou atividade de renina plasmática alta, e sulfato de de-hidroepiandrosterona baixo, são também indicações úteis de insuficiência adrenal.",
  "Furthermore, low aldosterone and high renin concentra", "are also helpful indications of adrenal insufficiency", secao=DIA)

f("Na insuficiência adrenal secundária e terciária, uma concentração de cortisol matinal menor que 83 nmol/L é considerada diagnóstica; entretanto, concentrações entre 83 nmol/L e 400 nmol/L devem levar ao teste de estímulo com cosintropina.",
  "In secondary and tertiary adrenal insufficiency, a morning cortisol concentration of less than 83 nmol/L is considered diagnostic; however, concentrations between 83 nmol/L and 400 nmol/L should prompt cosyntropin stimulation testing", secao=DIA)

f("Os autores recomendam o teste padrão com 250 µg de cosintropina, medindo o cortisol aos 30 min e aos 60 min.",
  "We recommend the standard 250 µg test, measuring cortisol samples at 30 min and 60 min", secao=DIA)

f("Concentrações de cortisol sérico de 412 nmol/L aos 30 min e de 485 nmol/L aos 60 min são definidas como os limites inferiores de uma resposta normal quando se usa cromatografia líquida acoplada a espectrometria de massas em tandem.",
  "Serum cortisol concentrations of 412 nmol/L at 30 min and 485 nmol/L at 60 min are defined as the lower limits of a normal response with liquid chromatography tandem mass spectrometry", secao=DIA)

f("Muitos indivíduos que não atingem o limiar aos 30 min o atingem aos 60 min; por isso recomenda-se testar aos 30 min e aos 60 min após a cosintropina, para evitar sobrediagnóstico de insuficiência adrenal. Quando se usam imunoensaios, o limiar frequentemente adotado é de 500 nmol/L de cortisol.",
  "Many individuals who did not reach the threshold at 30 min will do so at 60 min", "500 nmol/L of cortisol is often used as the threshold", secao=DIA)

f("Uma armadilha potencial é a gestação e o tratamento com estrogênio oral, que aumentam a globulina ligadora de corticosteroide e podem mascarar a insuficiência adrenal; inversamente, inflamação, sepse, cirrose e polimorfismos no gene SERPINA6 reduzem a concentração dessa globulina.",
  "A potential pitfall is pregnancy and oral oestrogen treatment", "corticosteroid-binding globulin", secao=DIA)

f("Uma vez diagnosticada a insuficiência adrenal, é obrigatório determinar a causa; nos casos de insuficiência adrenal primária adquirida, recomenda-se testar autoanticorpos anti-21-hidroxilase, que estão comercialmente disponíveis, e, se positivos, o diagnóstico de insuficiência adrenal primária autoimune está estabelecido.",
  "Once adrenal insufficiency is diagnosed, it is mandatory to determine the cause", "lished", secao=DIA)

f("O ensaio de autoanticorpos por imunofluorescência é menos sensível e menos específico que o ensaio de autoanticorpos anti-21-hidroxilase, além de não ser padronizado.",
  "Autoantibody assay by immu nofluorescence is less sensi tive and less specific than the 21-hydroxylase autoantibody assay, and not standardised", secao=DIA)

f("Os pacientes devem ser rastreados para condições relacionadas, como doença tireoidiana autoimune, diabetes tipo 1, doença celíaca e gastrite autoimune, ao diagnóstico e em seguimentos anuais; em pacientes com menos de 20 anos deve-se sempre considerar a síndrome poliendócrina autoimune tipo 1.",
  "Patients should be screened for related conditions", "type 1 should always be considered", secao=DIA)

f("Autoanticorpos contra a enzima de clivagem da cadeia lateral do colesterol associam-se a insuficiência ovariana prematura autoimune, e sua presença pode indicar risco de desenvolver insuficiência ovariana.",
  "Steroid side-chain cleavage enzyme autoantibodies are associated with autoimmune premature ovarian insufficiency, and the", "presence of these autoantibodies might indicate a risk of developing ovarian insufficiency", secao=DIA)

f("Se os autoanticorpos anti-21-hidroxilase estiverem ausentes, usa-se abordagem diagnóstica mais ampla guiada pela apresentação clínica; a tomografia é útil para diagnosticar infecções, tumores e sangramento, cada um com achados de imagem específicos.",
  "If autoantibodies against 21-hydroxylase are absent, a broader diagnostic approach", "have specific imaging features", secao=DIA)

f("Todos os indivíduos do sexo masculino devem ter os ácidos graxos de cadeia muito longa dosados no soro para diagnosticar adrenoleucodistrofia ou adrenomieloneuropatia, causadas por defeitos no gene ABCD1.",
  "All male individuals should have their serum tested for very long-chain fatty acids to diag nose adreno leukodys", "gene", secao=DIA)

f("Condições com fenótipos clínicos claros, como hipoplasia adrenal congênita ligada ao X por mutações em NR0B1, síndrome do triplo A (com acalasia e alacrimia) e síndrome de Kearns-Sayre (com oftalmoplegia e miopatia), podem ser diagnosticadas pelo sequenciamento dos genes relevantes; como alterações genéticas podem ter fenótipos sobrepostos, painéis de sequenciamento de nova geração ou mesmo sequenciamento do genoma completo são cada vez mais usados.",
  "Conditions with clear clinical pheno types", "are increasingly used", secao=DIA)

f("Se a insuficiência adrenal secundária for diagnosticada, é preciso avaliar o status dos demais hormônios hipofisários junto com ressonância magnética da região hipofisária, para detectar tumor ou outros processos infiltrativos; a deficiência isolada de ACTH é diagnóstico de exclusão, e todos os pacientes precisarão de ressonância magnética.",
  "If secondary adrenal insufficiency is diagnosed, the status of other pituitary hormones must be assessed", "all patients will require an MRI", secao=DIA)

f("Na insuficiência adrenal induzida por droga, nem todos os casos são imediatamente evidentes, exigindo história detalhada, incluindo uso de esteroides dérmicos, inalados e injetáveis; os opiáceos são a segunda classe de drogas que mais causa insuficiência adrenal, e usuários recreativos dificilmente obtêm essas drogas por prescrição.",
  "For drug-induced adrenal insufficiency, not all cases", "unlikely to be accessing these drugs on prescription", secao=DIA)

f("Um terço dos pacientes tratados com adrenalectomia unilateral por adenoma produtor de aldosterona desenvolve insuficiência adrenal secundária no pós-operatório, provavelmente por secreção autônoma concomitante de cortisol.",
  "However, it is less known that a third of patients treated", "autonomous cortisol secretion", secao=DIA)

f("Cerca de 3% dos indivíduos tratados com ipilimumabe desenvolvem hipofisite, que frequentemente se apresenta com cefaleia e hiponatremia; a hipofisite tornou-se evento adverso mais frequentemente observado com os inibidores de checkpoint imunológico.",
  "Hypophysitis has become a more frequently observed", "headache and hyponatraemia", secao=DIA)

# ================= TRATAMENTO =================
f("Pacientes com insuficiência adrenal primária são deficientes em glicocorticoides e mineralocorticoides e precisam repor ambos, junto com ingestão de sal conforme a necessidade; já os indivíduos com deficiência de ACTH por disfunção hipofisária ou hipotalâmica, ou após uso de esteroide exógeno, geralmente precisam apenas de reposição de glicocorticoide.",
  "Patients with primary adrenal insufficiency are deficient in glucocorticoids and mineralocorticoids", "usually require only glucocorticoid replace", secao=TRA)

f("A escolha padrão do glicocorticoide é hidrocortisona ou acetato de cortisona por via oral; o acetato de cortisona tem início de ação discretamente retardado por precisar ser ativado a hidrocortisona pela 11-beta-hidroxiesteroide desidrogenase (11βHSD) tipo 1.",
  "The standard choice of glucocorticoid treatment is oral hydrocortisone or cortisone acetate", "hepatic 11β-hydroxysteroid dehydrogenase (11βHSD) type 1", secao=TRA)

f("A hidrocortisona é a medicação preferida para tratar insuficiência adrenal na maioria dos países: no registro europeu EU-AIR, 1029 (87%) de 1166 pacientes europeus com insuficiência adrenal primária ou secundária usavam esse tratamento.",
  "Hydrocortisone is the preferred medication to treat adrenal insufficiency in most countries", "were using this treatment", secao=TRA)

f("Adrenais normais produzem entre 5 mg e 10 mg de cortisol por m² de superfície corporal por dia, o que, considerando a absorção intestinal incompleta, equivale a uma dose oral de reposição de 15–25 mg de hidrocortisona por dia para um adulto; em crianças, a dose ótima baseada na superfície corporal é de 8–10 mg/m² por dia.",
  "Normal functioning adrenal glands produce between 5 mg and 10 mg of cortisol per m2 body surface area in a day", "an optimal dose based on body surface area is 8–10 mg/m² per day", secao=TRA)

f("Doses pequenas e frequentes produzem perfil plasmático de cortisol mais fisiológico; a maioria dos adultos toma duas ou três doses diárias de hidrocortisona, mas alguns preferem quatro ou mais.",
  "Small and frequent dosing gives a more physiological plasma cortisol profile", "but some prefer four or even more", secao=TRA)

f("A primeira e maior dose de hidrocortisona deve ser tomada assim que o paciente acorda, e a última dose deve ser tomada 4–6 h antes de deitar, para evitar distúrbios do sono; a administração noturna de hidrocortisona associou-se a resistência à insulina e deve ser evitada.",
  "The first and largest dose should be taken as soon as the patient is awake", "should be avoided (panel)", secao=TRA)

f("O aumento da área sob a curva e da concentração sérica máxima de cortisol com o aumento da dose é linear mas não proporcional; assim, há pouca vantagem em tomar dose matinal de hidrocortisona maior que 10 mg, porque as concentrações sanguíneas de cortisol não aumentam substancialmente com doses únicas acima disso.",
  "The increase in area under the curve and maximum serum concentrations of cortisol with increasing doses is linear but not proportional", "single doses higher than this", secao=TRA)

f("A hidrocortisona de liberação modificada uma vez ao dia (15–25 mg) pode ser considerada para pacientes que não se sentem bem apesar das tentativas de otimizar a terapia convencional; efeitos metabólicos benéficos sobre peso, pressão arterial e glicemia foram relatados com essa formulação.",
  "Treatment with modified-release hydrocortisone once daily (15–25 mg) might be considered for patients who do not feel well", "taking modified- release hydrocortisone", secao=TRA)

f("O tratamento da insuficiência adrenal com prednisolona pode resultar em mais dislipidemia e menor conteúdo mineral ósseo do que a reposição padrão com hidrocortisona, embora se argumente que a prednisolona não tenha perfil metabólico pior se dada em doses de 3–5 mg ao dia; em muitas partes do mundo a prednisolona é atualmente a única opção de tratamento.",
  "Conversely, treatment of adrenal insufficiency with prednisolone might result in", "the only treatment option for adrenal insufficiency", secao=TRA)

f("A dexametasona não é indicada como terapia de reposição por causa da sua meia-vida longa e do alto risco associado de efeitos colaterais cushingoides.",
  "methasone is not indicated for replacement therapy due", "to its long half-life and associated high risk of Cushingoid side-effects", secao=TRA)

f("As concentrações de ACTH plasmático e de cortisol sérico não são parâmetros úteis para avaliar a adequação da reposição de glicocorticoide.",
  "Concentrations of plasma ACTH and serum cortisol are not useful parameters to assess the adequacy of glucocorticoid replacement", secao=TRA)

f("De modo geral, náusea, apetite ruim, perda de peso e aumento da pigmentação cutânea sugerem reposição insuficiente de glicocorticoide; em contraste, ganho de peso, insônia, infecções cutâneas e intolerância à glicose indicam excesso de reposição.",
  "Generally, nausea, poor appetite, weight loss, and increased skin pigmentation suggest under-replacement with glucocorticoid", "indicate over-replacement", secao=TRA)

f("Mudar o horário das doses (idealmente o mais cedo possível pela manhã, até 2–3 h antes de levantar) e dividir em doses menores e mais frequentes pode ser eficaz para quem relata pouca resistência, fadiga, cefaleia ou sonolência apenas em certos horários do dia.",
  "Some people report poor stamina, fatigue, headache, or somnolence only at certain times of the day", "can be effective", secao=TRA)

f("Como mesmo uma superdosagem sutil de glicocorticoide predispõe a complicações como obesidade, diabetes tipo 2 e osteoporose a longo prazo, vale explorar se as doses podem ser reduzidas com segurança.",
  "Given that even subtle overdosing with glucocorticoids predisposes to complications", "doses could be safely reduced", secao=TRA)

f("Quando se suspeita de má absorção, curvas de concentração diária de cortisol sérico ou de cortisona salivar podem ser úteis para guiar a dose; por fim, o tratamento com bomba subcutânea é uma opção e é a única forma eficaz de reconstituir a variação circadiana do cortisol.",
  "In cases when malabsorption is suspected, serum cortisol", "the only effective way of reconstituting the circadian variation in cortisol", secao=TRA)

# --------- MINERALOCORTICOIDE ---------
f("A maioria dos pacientes com insuficiência adrenal primária precisará de reposição de mineralocorticoide e de sal para corrigir a depleção de sódio, que se manifesta como tontura e avidez por sal, hipotensão postural, hiponatremia e hipercalemia.",
  "Most patients with primary adrenal insufficiency will require mineralocorticoid and salt replacement", "hyponatraemia, and hyperkalaemia", secao=TRA)

f("A deficiência de aldosterona é tratada com fludrocortisona em dose única matinal, tipicamente de 0·05–0·20 mg, embora crianças pequenas precisem de doses relativas maiores por superfície corporal, por resistência relativa à aldosterona.",
  "Aldosterone deficiency is treated with fludrocortisone replacement, in", "due to relative aldosterone resistance", secao=TRA)

f("Pessoas fisicamente ativas frequentemente precisam de doses maiores de fludrocortisona que idosos sedentários, e os pacientes devem ser orientados a ingerir sal conforme necessário e a ignorar recomendações de saúde para evitar sal; indivíduos com deficiência de ACTH por doença hipofisária ou hipotalâmica, ou por supressão após esteroides exógenos, não precisam de reposição mineralocorticoide.",
  "People who are physically active frequently need higher", "do not need mineralocorticoid replacement", secao=TRA)

f("A reposição insuficiente de fludrocortisona é comum e às vezes é compensada por excesso de reposição de glicocorticoide, o que pode predispor o paciente às comorbidades do hipercortisolismo.",
  "Fludrocortisone under-replacement is common", "comorbidities of hypercortisolaemia", secao=TRA)

f("A reposição mineralocorticoide é avaliada clinicamente perguntando ao paciente sobre avidez persistente por sal ou tontura, medindo a pressão arterial em decúbito e em pé e identificando a presença de edema periférico.",
  "coid replacement is evaluated clinically by asking the patient about persistent salt cravings or light", "the presence of peripheral oedema", secao=TRA)

f("É comum medir renina ou atividade de renina plasmática para avaliar a dose de mineralocorticoide, mirando um valor entre o limite superior da referência e o dobro desse limite; contudo, a relação entre dose de mineralocorticoide e atividade de renina é complexa e depende de hora do dia, posição do corpo e ingestão de medicamentos, de modo que os valores de renina frequentemente não ajudam na avaliação individual.",
  "It is common to measure con", "helpful to evaluate an individual patient", secao=TRA)

f("Diuréticos e drogas que afetam a pressão arterial e os eletrólitos podem interagir com a fludrocortisona; alcaçuz e suco de toranja potencializam o efeito mineralocorticoide da hidrocortisona e devem ser evitados.",
  "Diuretics and drugs that affect blood pressure and", "corticoid effect of hydrocortisone and should be avoided", secao=TRA)

f("A hipertensão essencial em paciente com insuficiência adrenal primária deve ser tratada com inibidor da enzima conversora de angiotensina ou bloqueador de canal de cálcio, e não com a suspensão da reposição mineralocorticoide, embora se deva considerar uma redução de dose.",
  "Essential hypertension in a patient with primary adrenal insufficiency should be treated with an angiotensin-converting enzyme inhibitor or a calcium channel blocker, not by stopping the mineralocorticoid replacement, although a dose reduction should be considered", secao=TRA)

# --------- ANDROGÊNIO ---------
f("A deficiência de androgênio adrenal ocorre na insuficiência adrenal primária e na secundária e leva à perda de pelo sexual secundário nas mulheres; no conjunto, os efeitos subjetivos benéficos da de-hidroepiandrosterona são pequenos, mas doses de 10 mg a 25 mg ao dia poderiam melhorar libido e bem-estar emocional e mental.",
  "Adrenal androgen deficiency occurs in primary adrenal insufficiency and secondary adrenal insufficiency", "emotional and mental wellbeing", secao=TRA)

f("A de-hidroepiandrosterona também é convertida em estrogênio, com risco não quantificado de cânceres estrogênio-sensíveis, doença cardiovascular e embolia venosa; os dados de segurança a longo prazo são insuficientes e uma diretriz recente da Endocrine Society recomenda contra seu uso rotineiro.",
  "droepiandrosterone is also converted to oestrogen", "recommends against routine use", secao=TRA)

# ================= TRATAMENTO DA CRISE =================
f("O tratamento de pacientes que se apresentam com possível crise adrenal não deve ser retardado por procedimentos diagnósticos: deve-se colher sódio, potássio, creatinina, ureia, glicose, cortisol e ACTH séricos e outros exames para causas precipitantes, se possível, mas a terapia precisa ser iniciada imediatamente, mesmo que os exames não possam ser feitos.",
  "Treatment of patients who present with a possible adrenal crisis should not be delayed by diagnostic", "even if tests cannot be carried out (panel)", secao=CRI)

f("A administração intravenosa rápida de 100 mg de hidrocortisona é importante para saturar a 11βHSD tipo 2 e assim obter o efeito mineralocorticoide desejado; a administração de salina a 0·9% (inicialmente 1 L em 1 h) e o tratamento de qualquer condição precipitante são igualmente importantes.",
  "Fast intravenous administration of 100 mg hydro cortisone is important to saturate 11βHSD type 2", "is equally important", secao=CRI)

f("A infusão de salina em ritmo mais lento, com hidrocortisona parenteral administrada em infusão intravenosa contínua de 200 mg por dia (ou como 50 mg quatro vezes ao dia), deve ser mantida por 24–48 h até que o paciente possa tomar medicação oral; a infusão contínua parece mimetizar melhor a resposta do cortisol ao estresse maior.",
  "Saline infusion at a slower rate with parenteral hydrocortisone administered as a continuous intravenous infusion of 200 mg per day", "response to major stress", secao=CRI)

f("Para prevenir crises adrenais futuras é importante determinar as causas médicas e comportamentais que precipitaram cada crise, incluindo adesão ao tratamento e consumo de sal.",
  "To prevent future adrenal crises, it is important to determine the medical and behavioural causes precipi", "including treatment compliance and salt consumption", secao=CRI)

f("Os pacientes devem ser orientados a receber imunização anual contra influenza, vacinação contra pneumococo quando com mais de 60 anos, e a informar sempre os profissionais de saúde sobre sua dependência de esteroide durante qualquer procedimento médico ou odontológico.",
  "Additionally, patients should be advised to have an annual influenza immunisation, vaccination for pneumococci when older than 60 years", "during any medical or dental procedures", secao=CRI)

f("A introdução de cursos de educação para pacientes com insuficiência adrenal, o fornecimento de hidrocortisona parenteral diretamente aos pacientes e a criação de um cartão europeu de emergência para deficiência de cortisol para crianças e adultos são medidas importantes para reduzir os riscos de crise adrenal.",
  "The introduction of education courses for patients with adrenal insuf", "are important measures to reduce the risks of adrenal crisis", secao=CRI)

# ================= SICK DAY RULES =================
f("Pacientes com insuficiência adrenal dependentes de esteroide por qualquer razão precisam ajustar a dose diária de glicocorticoide durante doença intercorrente ou estresse psicológico grave.",
  "Patients with adrenal insufficiency who are steroid dependent for any reason need to adjust their daily dose of glucocorticoid during intercurrent illness or severe psychological stress", secao="Ajustes de dose e regras do dia de doença")

f("Regra do dia de doença: em infecção com temperatura acima de 38·5°C, quadro gripal, diarreia ou infecção de vias aéreas superiores, a dose diária de glicocorticoide deve ser dobrada por 24 h nos adultos e aumentada para 30 mg/m² por dia (divididos em quatro doses) nas crianças.",
  "In the case of an infection causing a temperature greater than 38·5°C, flu-like illness, diarrhoea, or an upper respiratory tract infection, the daily dose of glucocorticoid should be doubled over 24 h in adults and increased to 30 mg/m2 per day (divided in four doses) in children", secao="Ajustes de dose e regras do dia de doença")

f("Vômitos ou diarreia grave representam risco importante para pacientes com insuficiência adrenal, que podem não conseguir reter a medicação diária necessária tempo suficiente para absorvê-la.",
  "Vomiting or severe diarrhoea also represent important hazards to patients with adrenal insufficiency who might not be able to keep down their necessary daily medication long enough to absorb it", secao="Ajustes de dose e regras do dia de doença")

f("Pacientes com insuficiência adrenal precisam aumentar as doses de esteroide durante cirurgias e procedimentos médicos de acordo com o grau de estresse induzido.",
  "Patients with adrenal insufficiency need to increase their steroid doses during surgery and medical procedures according to the degree of stress induced", secao="Reposição de esteroide na cirurgia e em procedimentos")

# ================= GESTAÇÃO =================
f("A gestação associa-se a aumento fisiológico gradual, porém pronunciado, da globulina ligadora de corticosteroide e do cortisol sérico total; as concentrações de cortisol livre sobem no terceiro trimestre, resultando em necessidade aumentada de hidrocortisona (de 2·5 mg a 10·0 mg por dia).",
  "Pregnancy is associated with a gradual, but pronounced, physiological increase in corticosteroid-binding globulin and total serum cortisol concentrations", "daily", secao="Reposição de esteroide na gestação")

f("A progesterona sérica tem efeitos antimineralocorticoides, e por isso a dose de fludrocortisona frequentemente precisa ser aumentada no terceiro trimestre.",
  "Serum progesterone has anti-mineralocorticoid effects, and hence the fludro", "cortisone dose often needs to be increased in the third trimester", secao="Reposição de esteroide na gestação")

f("A atividade de renina plasmática não é bom parâmetro para ajustar a dose de fludrocortisona na gestação, porque ela aumenta fisiologicamente na gravidez, restando a avaliação da avidez por sal, da pressão arterial e dos eletrólitos séricos como melhor forma de monitorar a dose.",
  "Plasma renin activity is not a good parameter for fludrocortisone dose adjust ment in this scenario", "as the best means for dosage monitoring", secao="Reposição de esteroide na gestação")

f("Levantamento de 2020 sobre gestações na insuficiência adrenal mostrou que, embora a dose de glicocorticoide tenha sido aumentada em 78 (66%) de 128 gestantes durante o segundo e o terceiro trimestres, para muitas isso não ocorreu; a maioria das mulheres não precisou aumentar a reposição mineralocorticoide.",
  "A 2020 survey of pregnancies in adrenal insufficiency showed that", "Most women did not need to increase mineralocorticoid replacement", secao="Reposição de esteroide na gestação")

f("Durante o parto deve-se administrar dose em bolus de 100 mg de hidrocortisona parenteral, seguida de bolus de 50 mg ou infusão contínua a cada 6 h.",
  "During delivery, a bolus dose of 100 mg parenteral hydrocortisone should be given and continued with 50 mg boluses or continuous infusion every 6 h", secao="Reposição de esteroide na gestação")

# ================= DOSES EM SITUAÇÕES DIVERSAS =================
f("Não há evidência de que doses extras melhorem a atividade física, mas muitos pacientes relatam necessidade de dose extra em situações estressantes e atividade física prolongada; nesses casos, 2·5–5·0 mg de hidrocortisona antes do início do exercício e doses repetidas a cada 2–4 h durante o esforço podem ser úteis.",
  "No evidence exists to show that extra dosing improves physical activity", "during the exertion can be useful", secao="Doses em situações diversas")

f("Atletas de endurance podem precisar aumentar a dose de fludrocortisona ou tomar sal adicional durante esforço prolongado, particularmente em climas quentes; do mesmo modo, pacientes que viajam para ambientes quentes podem necessitar de doses maiores de fludrocortisona ou de maior ingestão de sal.",
  "Endurance athletes might also need to increase fludro", "increased salt intake, or both", secao="Doses em situações diversas")

f("Pacientes que trabalham em turnos noturnos precisam ajustar o esquema de doses ao padrão de trabalho, por exemplo tomando 10 mg ao acordar antes do trabalho, e não no horário matinal habitual.",
  "Furthermore, patients who work night shifts need to adjust their dose schedule according to the work pattern", "and not at the usual morning time", secao="Doses em situações diversas")

# ================= INTERAÇÕES =================
f("Azóis como o cetoconazol e o anestésico etomidato inibem a esteroidogênese; vários inibidores de tirosinoquinase também reduzem a concentração de cortisol, o que deve motivar monitoramento dos pacientes em uso dessas drogas.",
  "Azoles, such as ketoconazole, and the anaesthetic drug etomidate inhibit steroidogenesis", "monitoring of patients on these drugs", secao="Interações medicamentosas")

f("O metabolismo hepático dos esteroides pode ser influenciado por carbamazepina, fenitoína, topiramato e rifampicina ou rifabutina, que induzem a enzima CYP3A4 e aceleram o metabolismo do cortisol.",
  "Hepatic steroid metabolism might be influenced by carbamazepine, phenytoin, topiramate, and rifampicin or rifabutin, which all induce the CYP3A4 enzyme, accelerating cortisol metabolism", secao="Interações medicamentosas")

f("Indivíduos que tomam o antirretroviral ritonavir comumente desenvolvem aspecto cushingoide e supressão adrenal com doses muito modestas de esteroide, por exemplo ao usar um inalador de esteroide.",
  "ritonavir commonly develop Cushingoid features and adrenal suppression by very modest doses of steroid (eg, when using a steroid inhaler)", secao="Interações medicamentosas")

f("O acetato de abiraterona usado no câncer de próstata pode causar deficiência de glicocorticoide e excesso de mineralocorticoide.",
  "Abiraterone acetate used in prostate cancer can cause glucocorticoid deficiency and mineralocorticoid excess", secao="Interações medicamentosas")

f("O alcaçuz inibe a 11βHSD tipo 2, que protege o receptor mineralocorticoide renal do cortisol, e seu uso concomitante com glicocorticoides pode levar a edema, hipertensão e hipocalemia; o suco de toranja inibe o citocromo P450 3A4 e induz transportadores intestinais de drogas, aumentando a disponibilidade da hidrocortisona e potencializando seus efeitos.",
  "Liquorice inhibits 11βHSD type 2", "enhancing its effects", secao="Interações medicamentosas")

# ================= PAINEL: DOSES =================
f("Painel de tratamento: hidrocortisona em comprimidos para adultos (18 anos ou mais), 10–25 mg ao dia, em esquemas fracionados (por exemplo 10·0 mg + 5·0 mg; 7·5 mg + 5·0 mg + 2·5 mg; 10·0 mg + 10·0 mg).",
  "Adults (18 years or older): 10–25 mg daily (eg,", "10·0 mg + 5·0 mg + 5·0 mg + 5·0 mg)", secao=PAN)

f("Painel de tratamento: hidrocortisona está disponível em comprimidos comuns, em formulação de liberação modificada para dose única diária (5 mg e 20 mg) e em cápsulas para crianças (0·5 mg, 1·0 mg, 2·0 mg e 5·0 mg).",
  "Hydrocortisone (hydrocortisone is available in regular tablets,", "2·0 mg, and 5·0 mg capsules\\])", secao=PAN)

f("Painel de tratamento: em crianças e adolescentes até 18 anos, hidrocortisona 8–10 mg/m² divididos em três a quatro doses, com 50–66% administrados na dose matinal; hidrocortisona de liberação modificada em adultos, 15–25 mg uma vez ao dia.",
  "Children and adolescents (up to 18 years of age):", "Adults (18 years or older): 15–25 mg once daily", secao=PAN)

f("Painel de tratamento: acetato de cortisona em comprimidos para adultos (18 anos ou mais), 12·5–37·5 mg ao dia.",
  "Cortisone acetate tablets", "Adults (18 years or older): 12·5–37·5 mg daily", secao=PAN)

f("Painel de tratamento: fludrocortisona em comprimidos (apenas na insuficiência adrenal primária) para adultos, 0·05–0·20 mg uma vez ao dia, mais comumente 0·1 mg.",
  "Fludrocortisone tablets (only in primary adrenal insufficiency)", "(most commonly 0·1 mg)", secao=PAN)

f("Painel de tratamento: doses de fludrocortisona em pediatria — crianças maiores e adolescentes (6–17 anos), 0·075–0·100 mg/m² uma vez ao dia; crianças de 1–12 anos, 0·100–0·150 mg/m² uma vez ao dia; lactentes até 2 anos, 0·150 mg/m² uma vez ao dia.",
  "Older children and adolescents (aged 6–17 years):", "Infants (up to the age of 2 years): 0·150 mg/m² once daily", secao=PAN)

f("Painel de tratamento da crise adrenal: em adultos (18 anos ou mais), hidrocortisona 100 mg em bolus intravenoso imediato, seguida de 200 mg/dia em infusão contínua, ou bolus intravenosos ou intramusculares frequentes de 50 mg a cada 6 h.",
  "Adults (18 years or older): 100 mg bolus intravenously given immediately, followed by 200 mg/day continuous infusion, or frequent intravenous or intramuscular boluses of 50 mg every 6 h", secao=PAN)

f("Painel de tratamento da crise adrenal em pediatria: até 1 ano, bolus de 25 mg e 25–30 mg/dia; de 1 a 6 anos, bolus de 50 mg e 50–60 mg/dia; acima de 6 anos, bolus de 100 mg e 100 mg/dia (a citação vem do painel em duas colunas, com o texto da coluna vizinha intercalado).",
  "≤1 years: 25 mg bolus, 25–30 mg/day, procedure as", "\\>6 years: 100 mg bolus, 100 mg/day, procedure as", secao=PAN)

f("Painel de tratamento da crise adrenal: reposição volêmica intravenosa em adultos com 3–4 L de salina a 0·9% ou glicose a 5% em salina isotônica, com velocidade inicial de infusão de aproximadamente 1 L por hora, exigindo monitoramento hemodinâmico frequente e medida de eletrólitos séricos para evitar sobrecarga de volume (a citação vem do painel em duas colunas, com texto intercalado).",
  "Adults (18 years or older): 3–4 L of 0·9% saline or", "required to avoid fluid overload", secao=PAN)

f("Painel de tratamento da crise adrenal em crianças e adolescentes até 18 anos: cloreto de sódio a 0·9%, bolus intravenoso de 20 mL/kg em 30–60 min, repetido até restaurar a circulação; o déficit remanescente é reposto com fluido de manutenção ao longo de 24–48 h (com cloreto de sódio a 0·9% e glicose a 5%). A citação vem do painel em duas colunas, com texto intercalado.",
  "Children and adolescents (up to 18 years of age):", "chloride and 5% glucose) 8–10 mg/m² (in three to four doses, 50–66% as", secao=PAN)

f("Painel de tratamento da crise adrenal: a hipoglicemia pode ser tratada com bolus intravenoso de glicose a 10% na dose de 2–5 mL/kg, com monitoramento da glicemia.",
  "Hypoglycaemia can be treated with an intravenous", "monitoring", secao=PAN)

f("Painel — prevenção da crise adrenal: ensinar a autoadministração de esteroides parenterais (por exemplo injeção intramuscular de hidrocortisona), vacinar contra influenza e contra pneumococo (acima de 60 anos) e fornecer cartão de esteroide a cada paciente.",
  "Teach self-administration of parenteral steroids", "Provide steroid card to each patient", secao=PAN)

f("Painel: a causa da crise adrenal deve ser diagnosticada e tratada, se pertinente, e deve-se considerar internação em unidade de terapia intensiva ou de cuidados semi-intensivos.",
  "The cause of adrenal crisis should be diagnosed and", "high-dependency unit should be considered", secao=PAN)

# ================= PERSPECTIVAS =================
f("Pacientes ainda morrem de crise adrenal, o que deveria ser inteiramente prevenível, e muitos provavelmente desenvolvem crise adrenal antes de a insuficiência adrenal ser reconhecida; por isso os médicos precisam ser educados para reconhecer a insuficiência adrenal mais cedo.",
  "Patients still die of adrenal crisis, which should be", "before a crisis develops", secao=FUT)

f("Há relatos de que cerca de 15–30% dos pacientes retêm alguma produção de corticosteroide mesmo anos após o diagnóstico, embora o significado clínico disso ainda não esteja claro.",
  "There are reports that around 15–30% of patients retain some corticosteroid production, even years after diag", "currently unclear", secao=FUT)

extrato = {
    "fileId": FID,
    "titulo": "Adrenal insufficiency",
    "tema": "insuficiência adrenal — classificação (primária, secundária, terciária), etiologias, diagnóstico com teste de estímulo e cortes de cortisol, reposição de glico e mineralocorticoide, regras do dia de doença, manejo da crise adrenal e ajustes na gestação",
    "fonte": "Husebye ES, Pearce SH, Krone NP, Kämpe O. Adrenal insufficiency (Seminar). The Lancet. Published Online January 20, 2021 (doi:10.1016/S0140-6736(21)00136-7)",
    "area": "Adrenal",
    "tipo": "revisao",
    "ano": 2021,
    "fatos": fatos,
}

if falhas:
    print("FALHAS DE BUSCA (%d):" % len(falhas))
    for x in falhas: print("  -", x)
    raise SystemExit(1)
from _lib_cite import grava
grava(extrato, F, "/home/user/endodirect/scratchpad/acervo/extratos/%s.json" % FID)
