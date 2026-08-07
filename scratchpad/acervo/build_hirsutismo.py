import sys
sys.path.insert(0, "/home/user/endodirect/scratchpad/acervo")
from _lib_cite import Fonte, grava

FID = "1LxKtV5ecDeyqGbZoxE1apav1h8R1N-qo"
F = Fonte("/home/user/endodirect/scratchpad/acervo/textos/%s.txt" % FID)
q = F.q

fatos = []
def f(afirmacao, start, end=None, secao=""):
    fatos.append({"afirmacao": afirmacao, "citacao": q(start, end), "secao": secao})

S1 = "Definição, patogênese e etiologia"
S2 = "1.0 Diagnóstico do hirsutismo"
S3 = "2.0 Tratamento"
S4 = "3.0 Tratamentos farmacológicos"
S5 = "4.0 Métodos de remoção direta de pelos"
S6 = "5.0 Comentários sobre a dosagem de androgênios"

# ---------------- DEFINIÇÃO / ESCORE ----------------
f("Hirsutismo é definido como pelo terminal excessivo com distribuição em padrão masculino na mulher (pelo em áreas androgênio-dependentes, isto é, pelo sexual).",
  "Hirsutism is excessive terminal hair that appears in a male", "pattern in women", secao=S1)

f("O diagnóstico clínico habitual de hirsutismo é um escore de Ferriman-Gallwey acima do percentil 95 para a população.",
  "clinicians commonly diagnose hirsutism", "centile for the population", secao=S1)

f("Cortes do escore total de Ferriman-Gallwey que definem hirsutismo em mulheres em idade reprodutiva, por etnia: mulheres negras ou brancas dos EUA e do Reino Unido, ≥8; mulheres mediterrâneas, hispânicas e do Oriente Médio, ≥9 a 10; sul-americanas, ≥6; asiáticas, variando de ≥2 (chinesas Han) a ≥7 (chinesas do sul). No texto o símbolo '≥' aparece transcrito como '$'.",
  "Gallwey total scores that define hirsutism in women of", "for Southern Chinese women", secao=S1)

f("O escore modificado de Ferriman-Gallwey é o padrão-ouro para avaliar hirsutismo: nove áreas corporais mais sensíveis a androgênio recebem escore de 0 (sem pelo) a 4 (francamente viril), e a soma fornece o escore hormonal de hirsutismo.",
  "The modified Ferriman–Gallwey score is", "provide a hormonal hirsutism score", secao=S1)

f("Hirsutismo generalizado (escore ≥8) é anormal na população geral dos EUA, enquanto crescimento piloso localmente excessivo (escore <8) é variante normal comum; o escore normal é menor em algumas populações asiáticas e maior em populações mediterrâneas.",
  "Generalized hirsutism (score", "higher in Mediterranean populations", secao=S1)

f("Limitações do escore de Ferriman-Gallwey: natureza subjetiva, não valorizar escore alto localizado que não eleva o total, e não considerar áreas androgênio-sensíveis como as costeletas (laterais da face da linha do cabelo até abaixo da orelha) e as nádegas.",
  "this scoring system has its limitations", "the hairline to below the ear (sideburns) and the buttocks", secao=S1)

f("A autoavaliação do escore pelo paciente pode ser clinicamente útil, mas correlaciona-se apenas modestamente com a pontuação feita por observador treinado.",
  "Self-scoring can be clinically useful", "modestly with scoring by a trained observer", secao=S1)

f("Escores de Ferriman-Gallwey baixos podem ter importância clínica: em estudo com 633 mulheres brancas e negras não selecionadas, cerca de 70% daquelas com escore ≥3 (e muitas com escores menores) consideravam-se hirsutas e a maioria usava algum tratamento cosmético.",
  "In one study of 633 unselected white and black", "some form of cosmetic treatment", secao=S1)

f("Mesmo graus mínimos de pelo indesejado associam-se com frequência a hiperandrogenemia quando há irregularidade menstrual.",
  "It  has also been shown that even minimal", "when menstrual irregularity is present", secao=S1)

f("Hirsutismo deve ser distinguido de hipertricose: crescimento piloso excessivo generalizado, hereditário ou por medicamentos (por exemplo fenitoína, ciclosporina), com distribuição não sexual (predominante em antebraços ou pernas) e não causado por excesso de androgênio.",
  "Hirsutism must be distinguished", "caused by excess androgen", secao=S1)

f("Hirsutismo idiopático é o hirsutismo sem hiperandrogenemia nem outros sinais ou sintomas indicativos de doença endócrina hiperandrogênica.",
  "Idiopathic hirsutism This is hirsutism without", "hyperandrogenic endocrine disorder", secao=S1)

f("Hirsutismo de importância para a paciente ('patient-important hirsutism') é o crescimento de pelo sexual indesejado de qualquer grau que cause sofrimento suficiente para a mulher buscar tratamento adicional.",
  "Unwanted sexual hair growth of any", "women to seek additional treatment", secao=S1)

# ---------------- PATOGÊNESE ----------------
f("O crescimento do pelo sexual depende inteiramente da presença de androgênio, que induz folículos velos em áreas sexo-específicas a se transformarem em pelos terminais, maiores e mais pigmentados.",
  "The growth of sexual hair is entirely", "larger and more heavily pigmented", secao=S1)

f("A fase de crescimento (anágena) do pelo, que varia conforme a área corporal, dura cerca de 4 meses para o pelo facial; por causa do longo ciclo de crescimento, são necessários cerca de 6 meses para detectar os efeitos da terapia hormonal.",
  "(which varies with body area) is", "to detect the effects of hormonal therapy and", secao=S1)

f("São necessários cerca de 9 meses para que os efeitos da terapia hormonal sobre o hirsutismo se tornem máximos; o hirsutismo resulta da interação entre os androgênios plasmáticos e a sensibilidade aparente do folículo piloso ao androgênio.",
  "9 months for these effects to become maximal", "apparent sensitivity of the hair follicle to androgen", secao=S1)

f("A sensibilidade do folículo piloso é determinada em parte pelo metabolismo local de androgênios, sobretudo pela conversão de testosterona em di-hidrotestosterona pela enzima 5-alfa-redutase e subsequente ligação ao receptor androgênico.",
  "The sensitivity of the hair follicle is de", "binding of these molecules to the androgen  receptor", secao=S1)

f("O escore de hirsutismo não se correlaciona bem com o nível de androgênio, aparentemente porque a resposta do folículo pilossebáceo ao androgênio varia consideravelmente.",
  "The hirsutism score does not correlate well with", "androgen varies considerably", secao=S1)

# ---------------- ETIOLOGIA ----------------
f("A maioria dos casos de hirsutismo decorre de excesso de androgênio (≥80%), e a maioria das mulheres com hirsutismo (70% a 80%) tem síndrome dos ovários policísticos.",
  "The majority of hirsutism is due to androgen excess", "to 80%) have PCOS", secao=S1)

f("A SOP é definida pela presença de dois de três achados: hiperandrogenismo crônico sem outra explicação, oligo-ovulação e morfologia ovariana policística à ultrassonografia.",
  "PCOS is defined by the", "ultrasonographic polycystic ovarian  morphology", secao=S1)

f("O hiperandrogenismo ovariano funcional gonadotropina-dependente é a fonte da hiperandrogenemia na maioria dos casos de SOP, podendo vir acompanhado de hiperandrogenismo adrenal funcional ACTH-dependente leve, que numa minoria dos casos ocorre isoladamente.",
  "Gonadotropin-dependent functional", "form of adrenal hyper- androgenism may occur in isolation", secao=S1)

f("O hirsutismo idiopático corresponde a 5% a 20% das mulheres hirsutas.",
  "ism constitutes 5% to 20% of hirsute women", secao=S1)

f("Entre mulheres eumenorreicas com hirsutismo leve (escore de Ferriman-Gallwey de 8 a 15 nos EUA), aproximadamente metade tem hirsutismo idiopático.",
  "Available data suggest that among eumenorrheic women", "approximately half have  idiopathic hirsutism", secao=S1)

f("A testosterona total sérica é semelhante e correlaciona-se bem com a bioatividade androgênica sérica em mulheres jovens com e sem SOP (r = 0,7 a 0,8); assim, o hirsutismo não pode ser considerado sinônimo de evidência clínica de hiperandrogenismo se testosterona total e livre forem normais.",
  "Serum total testosterone is similar to and", "total and free testosterone are normal", secao=S1)

f("A maioria das mulheres com elevação de duas vezes ou mais dos níveis séricos de androgênio apresenta algum grau de hirsutismo ou outra resposta pilossebácea, como acne vulgar excessiva, seborreia ou alopecia de padrão feminino ou masculino.",
  "Most women with a twofold or greater", "pattern alopecia", secao=S1)

f("A hiperplasia adrenal congênita não clássica é a mais comum das demais causas de superprodução androgênica, presente em 4,2% das mulheres hiperandrogênicas no mundo.",
  "NCCAH, the most common of these", "although specific ethnic groups are at lower or", secao=S1)

f("Tumores secretores de androgênio estão presentes em cerca de 0,2% das mulheres hiperandrogênicas, e mais da metade deles é maligna.",
  "Androgen-secreting tumors are present in", "over half are malignant", secao=S1)

f("No diagnóstico diferencial do hirsutismo deve-se considerar síndrome de Cushing, acromegalia, hipotireoidismo e (raramente) hiperprolactinemia, embora as pacientes costumem apresentar os achados específicos dessas doenças; também uso de androgênio tópico pelo parceiro, androgênios exógenos ou esteroides anabolizantes, e ácido valproico.",
  "Clinicians must consider Cushing syndrome, acromegaly", "valproic acid when evaluating patients with hirsutism", secao=S1)

# ---------------- DIAGNÓSTICO ----------------
f("Recomendação: dosar androgênios em todas as mulheres com escore de hirsutismo anormal; quando a testosterona total sérica for normal, se o crescimento de pelo sexual for moderado/grave, ou leve mas com evidência clínica de doença endócrina hiperandrogênica (como distúrbio menstrual ou progressão apesar do tratamento), medir testosterona total e livre séricas em amostra do início da manhã por ensaio especializado confiável.",
  "all women with an abnormal hirsutism score (2", "tosterone by a reliable specialty assay", secao=S2)

f("Recomendação: rastrear HAC não clássica por deficiência de 21-hidroxilase nas mulheres hiperandrogenêmicas medindo 17-hidroxiprogesterona no início da manhã, na fase folicular, ou em dia aleatório nas com amenorreia ou menstruações infrequentes.",
  "We suggest screening hyperandrogenemic women  for NCCAH due to 21-hydroxylase deficiency by", "for those with amenorrhea or infrequent menses", secao=S2)

f("Nas pacientes hirsutas com alto risco de hiperplasia adrenal congênita (história familiar positiva, pertencer a grupo étnico de alto risco), sugere-se fazer esse rastreamento mesmo se testosterona total e livre séricas forem normais.",
  "In hirsute patients with a high risk of  congenital adrenal hyperplasia (positive family  history, member of a high-risk ethnic group), we  suggest this screening even if serum total and free  testosterone are normal", secao=S2)

f("Recomendação: não dosar androgênios em mulheres eumenorreicas com crescimento piloso local indesejado (isto é, sem escore de hirsutismo anormal), pela baixa probabilidade de identificar doença que mude a conduta ou o desfecho.",
  "in the absence of an abnormal hirsutism score) because of the low", "change management or outcome", secao=S2)

f("O hirsutismo é um diagnóstico clínico, e seu manejo é em grande medida independente da etiologia; ainda assim, é indicador potencial de doença hiperandrogênica subjacente que pode exigir tratamento específico e ter implicações para fertilidade, riscos médicos e aconselhamento genético.",
  "Hirsutism is a clinical diagnosis. The management of", "medical risks, and genetic counseling", secao=S2)

f("Na investigação de androgênios, sugere-se medir primeiro a testosterona total sérica por ensaio especializado confiável.",
  "When testing for elevated androgen levels, we suggest  first measuring serum total testosterone levels using a re", secao=S2)

f("Sugerem doença endócrina hiperandrogênica: irregularidade menstrual, infertilidade, galactorreia, obesidade central, acantose nigricans, clitoromegalia, hirsutismo de início súbito ou de progressão rápida, ou progressão do hirsutismo apesar do tratamento.",
  "Menstrual irregularity, infertility, galactorrhea, central  obesity, acanthosis nigricans, clitoromegaly, sudden-onset  or rapid-progression hirsutism, or hirsutism progression in  spite of therapy suggests the presence of a hyperandrogenic  endocrine disorder", secao=S2)

f("Ritmo rápido de desenvolvimento ou progressão do hirsutismo, progressão apesar da terapia, ou sinais de virilização (clitoromegalia, engrossamento da voz, aumento da musculatura) apontam maior probabilidade de neoplasia secretora de androgênio; contudo, alguns tumores que produzem excesso apenas moderado de androgênio têm apresentação indolente.",
  "A rapid pace of development or pro", "erately excessive androgen have indolent presenta- tions", secao=S2)

f("Como os ensaios convencionais não detectam drogas androgênicas, deve-se pesquisar ativamente o uso de esteroides anabolizantes ou androgênicos, sobretudo em atletas e em pacientes com endometriose, disfunção sexual ou parceiros que usem gel de testosterona. O ácido valproico é o único anticonvulsivante que eleva os níveis plasmáticos de testosterona.",
  "Because standard assays fail to detect androgenic", "terone levels", secao=S2)

f("Pela alta frequência de SOP, deve-se investigar em toda mulher hirsuta evidência de anovulação (irregularidade menstrual) ou disfunção ovariana mais sutil que se apresente como infertilidade, obesidade central, metabolismo anormal de carboidratos e lipídios, acantose nigricans ou história familiar de diabetes melito tipo 2.",
  "Because of the high frequency of PCOS, clinicians", "abetes mellitus", secao=S2)

f("Pode-se diagnosticar SOP ovulatória em mulheres eumenorreicas com hirsutismo, morfologia ovariana policística e níveis normais de testosterona.",
  "Clinicians can make a diagnosis of  ovulatory PCOS in eumenorrheic women with hirsut", "testosterone", secao=S2)

f("A avaliação da mulher hiperandrogenêmica pode incluir: teste de gravidez nas pacientes com amenorreia; dosagem de sulfato de de-hidroepiandrosterona (DHEAS) para rastrear hiperandrogenismo adrenal; investigação de síndrome de Cushing, disfunção tireoidiana, acromegalia e hiperprolactinemia se houver achados sugestivos (todas causas incomuns de hirsutismo); e ultrassonografia pélvica, preferencialmente transvaginal, para detectar neoplasia ovariana em mulheres com hiperandrogenismo grave ou progressivo.",
  "The evaluation of hyperandrogenemic women may include", "androgenism", secao=S2)

f("Alguns tumores ovarianos secretores de androgênio são pequenos demais para serem detectados pela ultrassonografia transvaginal.",
  "Of note, some androgen-secreting ovar- ian tumors are too small to be detected by transvaginal  ultrasound", secao=S2)

f("Investigação adicional da origem do excesso androgênico pode incluir: androstenediona sérica (precursor imediato da testosterona) ou outros intermediários esteroides; resposta ao cosintropina de 17-hidroxiprogesterona, DHEA, 17-hidroxipregnenolona e 11-desoxicortisol, e/ou genotipagem para excluir formas raras de HAC; metabólitos corticoides urinários por espectrometria de massa para excluir deficiência aparente de cortisona redutase; teste de supressão com dexametasona; tomografia de adrenais, ultrassonografia ovariana ou exames de imagem mais especializados se houver suspeita de tumor secretor de androgênio; e avaliação da resposta supressiva ao contraceptivo oral combinado ou a agonista de GnRH.",
  "Further workup to identify the origin of androgen", "nist", secao=S2)

f("A ultrassonografia transvaginal também é útil quando se suspeita de hipertecose ovariana: a ausência de folículos e/ou da morfologia ovariana policística apoia esse diagnóstico.",
  "Lastly, transvaginal ultrasound is also helpful", "the diagnosis of hyperthecosis", secao=S2)

f("A testosterona total deve ser avaliada por ensaio acurado e específico, como espectrometria de massa; os valores de referência são padronizados para o início da manhã, quando os níveis são mais altos, e para os dias 4 a 10 do ciclo menstrual.",
  "An accurate and specific assay, such as mass  spectrometry, is the best choice for assessing serum total testosterone concentrations", "the  most comparable to that of women with hyperandrogenic anovulation", secao=S2)

f("A avaliação da testosterona livre com ensaios de qualidade de testosterona e SHBG, ou por diálise de equilíbrio com intervalos de referência bem definidos, é o marcador isolado mais útil e clinicamente sensível de excesso androgênico na mulher.",
  "Assessing free testosterone levels using high-quality  testosterone and SHBG or equilibrium dialysis assays with well-defined reference intervals is the single most useful, clinically sensitive marker of  androgen excess in women", secao=S2)

f("A progressão do hiperandrogenismo na vigência de testosterona livre sérica normal é muito incomum e obriga a reavaliação minuciosa da paciente.",
  "Progression of hyperandrogenism in the presence of a normal  serum-free testosterone is very unusual, and clinicians should thoroughly reevaluate these patients", secao=S2)

f("Mulheres com hirsutismo leve, testosterona total normal, ultrassonografia pélvica com morfologia ovariana normal (quando realizada) e sem evidência clínica de outras doenças endócrinas hiperandrogênicas têm hirsutismo idiopático, que pode responder à terapia com contraceptivo oral.",
  "Women with mild hirsutism, a normal total testosterone level, a pelvic ultrasound showing normal ovarian morphology (if  performed), and no clinical evidence of other hyperandrogenic endocrine disorders have idiopathic hirsutism, which may be responsive to OC  therapy", secao=S2)

# ---------------- TRATAMENTO GERAL ----------------
f("Recomendação: para a maioria das mulheres com hirsutismo de importância clínica apesar de medidas cosméticas, iniciar com terapia farmacológica, acrescentando métodos de remoção direta de pelo para quem desejar benefício cosmético adicional; para mulheres com hirsutismo leve e sem evidência de doença endócrina, qualquer das duas abordagens é aceitável.",
  "For most women with patient-important hirsutism  despite cosmetic measures, we suggest starting", "we suggest either  approach", secao=S3)

f("Recomendação forte: para mulheres hirsutas com obesidade, incluindo as com SOP, recomenda-se também mudanças de estilo de vida.",
  "For hirsute women with obesity, including those  with PCOS, we also recommend lifestyle changes", secao=S3)

f("Há duas abordagens principais de manejo do hirsutismo, isoladas ou combinadas: terapias farmacológicas que atuam sobre a produção e a ação androgênica, e métodos de remoção direta de pelo (eletrólise e fotoepilação).",
  "there are two main approaches to the management of hirsutism", "(electrolysis and photoepilation)", secao=S3)

f("A classificação da gravidade pelo escore de Ferriman-Gallwey usa hirsutismo leve com escore de 8 a 15 e grave com escore acima de 15, mas essa abordagem tem limitações: muitos clínicos não sabem calcular o escore, a maioria das mulheres já usa medidas cosméticas antes da consulta (o que impede o cálculo acurado) e a decisão terapêutica deve ser proporcional ao impacto do pelo no bem-estar da paciente.",
  "Although experts have often made treatment recom", "ism than other women who may be less bothered, despite  having higher hirsutism scores", secao=S3)

f("Depilação remove a haste do pelo da superfície da pele (por exemplo, barbear); epilação extrai o pelo acima do bulbo (arrancar, cera). O barbear não altera a taxa nem a duração da fase anágena nem o diâmetro do pelo, mas produz ponta romba que dá a ilusão de pelo mais grosso.",
  "Shaving does not affect the rate or duration of the anagen", "the illusion of thicker hair", secao=S3)

f("Em metanálise de quatro estudos com 132 participantes, mudanças de estilo de vida (dieta, exercício, terapia comportamental ou combinação) produziram perda de peso, queda da testosterona sérica e da insulina de jejum e melhora pequena do escore de Ferriman-Gallwey, com diferença média de 1,19 ponto (IC 95%), mas o estilo de vida não deve ser considerado terapia primária do hirsutismo porque o impacto não é clinicamente significativo, sobretudo comparado aos contraceptivos orais.",
  "In a meta-analysis of four studies", "ticularly when compared with OCs", secao=S3)

# ---------------- FARMACOLÓGICO ----------------
f("Recomendação: para a maioria das mulheres com hirsutismo que não buscam fertilidade, usar contraceptivos orais como terapia inicial do hirsutismo de importância clínica.",
  "For the majority of women with hirsutism who are not seeking fertility, we suggest OCs as initial therapy for treating patient-important hirsutism", secao=S4)

f("Recomendação: evitar monoterapia com antiandrogênio como terapia inicial pelo potencial teratogênico, a menos que a mulher use contracepção adequada; para mulheres sem atividade sexual, esterilizadas ou em uso de contracepção reversível de longa duração, pode-se usar contraceptivo oral ou antiandrogênio como terapia inicial.",
  "For most women with hirsutism, we suggest  against antiandrogen monotherapy as initial", "regarding efficacy, side effects, and cost", secao=S4)

f("Recomendação: não há preferência por um contraceptivo oral sobre outro como terapia inicial, pois todos parecem igualmente eficazes para hirsutismo e o risco de efeitos adversos é baixo.",
  "For most women, we do not suggest one OC over  another as initial therapy, as all OCs appear to be  equally effective for hirsutism, and the risk of side  effects is low", secao=S4)

f("Recomendação: em mulheres com hirsutismo e risco aumentado de tromboembolismo venoso (por exemplo, obesas ou com mais de 39 anos), iniciar com contraceptivo oral contendo a menor dose eficaz de etinilestradiol (habitualmente 20 mcg) e um progestogênio de baixo risco.",
  "For women with hirsutism at higher risk for VTE", "and a low-risk progestin", secao=S4)

f("Recomendação: se o hirsutismo de importância clínica persistir apesar de 6 meses de monoterapia com contraceptivo oral, acrescentar um antiandrogênio.",
  "If patient-important hirsutism remains despite  6 months of monotherapy with an OC, we suggest  adding an antiandrogen", secao=S4)

f("Recomendação: não há preferência entre os antiandrogênios; contudo, recomenda-se contra o uso de flutamida pelo potencial de hepatotoxicidade (recomendação forte).",
  "We do not suggest one antiandrogen over an", "against the use of flutamide because of its po- tential hepatotoxicity", secao=S4)

f("Recomendação: para todas as terapias farmacológicas do hirsutismo, manter o tratamento por pelo menos 6 meses antes de mudar dose, trocar de medicação ou associar outra droga.",
  "For all pharmacologic therapies for hirsutism, we  suggest a trial of at least 6 months before making  changes in dose, switching to a new medication,  or adding medication", secao=S4)

f("Recomendação: em pacientes com hirsutismo grave causando sofrimento emocional e/ou naquelas que já usaram contraceptivo oral sem melhora suficiente, iniciar terapia combinada de contraceptivo oral com antiandrogênio; mas não se sugere a terapia combinada como abordagem padrão de primeira linha.",
  "In patients with severe hirsutism causing emo", "nation therapy as a standard first-line approach", secao=S4)

f("Recomendação: não usar drogas hipoglicemiantes/redutoras de insulina com a indicação isolada de tratar hirsutismo.",
  "We suggest against using insulin-lowering drugs  for the sole indication of treating hirsutism", secao=S4)

f("Recomendação: não usar agonistas de GnRH, exceto em mulheres com formas graves de hiperandrogenemia (como hipertecose ovariana) com resposta subótima a contraceptivos orais e antiandrogênios.",
  "We suggest against using GnRH agonists except  in women with severe forms of hyperandro", "androgens", secao=S4)

f("Recomendação: não usar terapia antiandrogênica tópica para hirsutismo.",
  "We suggest against the use of topical anti- androgen therapy for hirsutism", secao=S4)

f("Nesta diretriz, contraceptivo oral refere-se apenas aos contraceptivos combinados orais de estrogênio-progestogênio contendo etinilestradiol, e não às formulações mais novas com 17-beta-estradiol ou valerato de estradiol combinadas a progestogênios muito potentes, cujas doses de estrogênio dificilmente suprimem os androgênios ovarianos; contraceptivos orais só de progestogênio são ineficazes para hirsutismo.",
  "Of note, in this guideline, OCs refers only to", "which are ineffective for hirsutism", secao=S4)

f("A maioria dos progestogênios deriva da 19-nortestosterona e apresenta graus variáveis de androgenicidade: baixa androgenicidade (norgestimato, desogestrel, gestodeno), média (noretindrona) e relativamente alta (norgestrel e levonorgestrel); acetato de ciproterona e drospirenona não têm relação estrutural com a testosterona e funcionam como antagonistas fracos do receptor androgênico.",
  "Most progestins are derived from 19-nortestoster", "weak androgen receptor antagonists", secao=S4)

f("Em bioensaios, 3 mg de drospirenona (a dose usada em contraceptivos orais) equivaleram a apenas 9 a 10 mg de espironolactona, enquanto a dose terapêutica de espironolactona para hirsutismo é de 100 a 200 mg; 2 mg de acetato de ciproterona (dose usada em contraceptivos) equivaleram a cerca de 50 mg de espironolactona.",
  "In bioassays, 3 mg DSP (the dose used in OCs) was", "50 mg spi", secao=S4)

f("Estudo de 12 meses comparando contraceptivos orais com 3 mg de drospirenona ou 2 mg de acetato de ciproterona mostrou reduções semelhantes nos escores de hirsutismo, sugerindo que a eficácia se deve substancialmente à supressão ovariana.",
  "A 12-month trial comparing OCs  containing either 3 mg DSP or 2 mg CPA showed", "pression", secao=S4)

f("Os contraceptivos orais reduzem o hiperandrogenismo por vários mecanismos: supressão da secreção de LH (e portanto da secreção androgênica ovariana), estímulo à produção hepática de SHBG (aumentando a ligação de androgênio no soro e reduzindo o androgênio livre), leve redução da secreção adrenal de androgênio e da ligação de androgênios a seus receptores; progestogênios androgênicos também aumentam a depuração metabólica da testosterona.",
  "OC therapy reduces hyperandrogenism via a number", "increase the metabolic clearance of testosterone", secao=S4)

f("Os contraceptivos orais combinados acarretam risco de tromboembolismo venoso cerca de três vezes maior em usuárias de primeira vez; o risco relaciona-se de forma significativa mas fraca com a dose de estrogênio e pode diminuir com a duração do uso.",
  "Combination OCs carry about a threefold increased", "duration of estrogen use", secao=S4)

f("Contraceptivos orais com progestogênios de baixa androgenicidade de gerações recentes (desogestrel, gestodeno) e com antagonistas do receptor androgênico (ciproterona, drospirenona) podem conferir risco de tromboembolismo venoso 50% a 100% maior que os que contêm levonorgestrel, progestogênio de segunda geração.",
  "The use of OCs containing some", "of large-scale comparative analyses", secao=S4)

f("O risco de tromboembolismo venoso em mulheres com mais de 39 anos em uso de contraceptivo oral é cerca de quatro vezes maior que em mulheres mais jovens (100 versus 25 por 100.000 mulheres-ano); em obesas em uso de contraceptivo oral, estima-se risco 2 a 10 vezes maior que em não obesas.",
  "The risk in women  over age 39 years taking OCs is approximately fourfold", "nonobese women taking OCs", secao=S4)

f("Tabela de risco de TEV por progestogênio: noretindrona 0,5–1,0 mg (1ª geração, androgenicidade média) tem risco relativo 2,6 e risco absoluto 7 casos extras.",
  "Medium 2.6 7 Norethindrone 0.5–1.0 mg 20, 35", secao=S4)

f("Tabela de risco de TEV por progestogênio: levonorgestrel 0,15 mg (2ª geração, alta androgenicidade) tem risco relativo 2,4 e risco absoluto 6 casos extras.",
  "High 2.4 6 Levonorgestrel 0.15 mg 20, 30", secao=S4)

f("Tabela de risco de TEV por progestogênio: desogestrel 0,15 mg (3ª geração, baixa androgenicidade) tem risco relativo 4,3 e risco absoluto 14 casos extras.",
  "Low 4.3 14 Desogestrel 0.15 mg 20, 30", secao=S4)

f("Tabela de risco de TEV por progestogênio: drospirenona 3 mg (4ª geração, antiandrogênica) tem risco relativo 4,1 e risco absoluto 13 casos extras; acetato de ciproterona 2 mg tem risco relativo 4,3 e absoluto 14 (contraceptivos com ciproterona não estão disponíveis nos EUA).",
  "Antiandrogen 4.1 13 DSP 3 mg 20, 30", "OCs containing CPA are not available in the United States", secao=S4)

f("O risco absoluto tabelado corresponde a casos extras de tromboembolismo venoso por 10.000 mulheres tratadas com contraceptivo oral por ano.",
  "Extra cases VTE per 10,000 women treated with OCs per year", secao=S4)

f("Em metanálise de 42 estudos, a supressão das concentrações séricas de testosterona total e livre foi semelhante com contraceptivos contendo 20 versus 30/35 mcg de etinilestradiol.",
  "In a meta-analysis  of 42 studies, the suppression of serum total and free  testosterone concentrations was similar with OCs con", "mcg EE", secao=S4)

f("Análise combinada dos ensaios associou a terapia com contraceptivo oral a maior redução dos escores de hirsutismo, com diferença média ponderada de 7,20 pontos (IC 95%).",
  "A combined analysis of", "211.96 to 22.52", secao=S4)

f("Contraceptivos com progestogênios antiandrogênicos (ciproterona e drospirenona) associaram-se a escores de Ferriman-Gallwey discretamente menores que outros contraceptivos, com diferença média ponderada de 2,86 pontos, diferença provavelmente sem importância clínica.",
  "OCs containing anti- androgenic progestins (one trial using CPA and one", "portant", secao=S4)

f("Embora o levonorgestrel tenha menor risco de tromboembolismo venoso, há preocupação com seus efeitos adversos em biomarcadores metabólicos, e os autores tendem a evitá-lo em mulheres com SOP, população que já tem preocupações metabólicas de base.",
  "Whereas a potential  benefit of OCs containing levonorgestrel is their lower  VTE risk, an important concern is the adverse effects of  levonorgestrel on metabolic biomarkers", "with metabolic concerns at baseline", secao=S4)

# ---------------- ANTIANDROGÊNIOS ----------------
f("Em análises de antiandrogênios isolados contra placebo, espironolactona 100 mg/dia, finasterida 2,5 a 5 mg/dia e flutamida 500 mg/dia mostraram, cada uma, redução significativa dos escores de hirsutismo; agrupados como classe, os antiandrogênios foram significativamente mais eficazes que placebo, com diferença média ponderada de 7,02 pontos de Ferriman-Gallwey, sem diferença estatisticamente significativa entre os três.",
  "In analyses of individual anti- androgens compared with placebo, spironolactone 100 mg/d", "among the three antiandrogens", secao=S4)

f("Doses dos antiandrogênios usados no hirsutismo: acetato de ciproterona 50–100 mg/dia nos dias 5–15 do ciclo menstrual, com etinilestradiol 20–35 mcg nos dias 5–25.",
  "50–100 mg/d on menstrual cycle days 5–15, with EE 20–35 mg on days 5–25", secao=S4)

f("Doses dos antiandrogênios usados no hirsutismo: espironolactona 100–200 mg/dia em doses divididas (duas vezes ao dia); finasterida 2,5–5 mg/dia; flutamida 250–500 mg/dia (dose alta) ou 62,5 até 250 mg/dia (dose baixa), sendo a flutamida não recomendada por hepatotoxicidade.",
  "100–200 mg/d", "Flutamide not recommended because of hepatotoxicity", secao=S4)

f("A espironolactona é antagonista da aldosterona que exerce inibição competitiva dose-dependente do receptor androgênico e inibe a atividade da 5-alfa-redutase; é geralmente bem tolerada, mas não deve ser usada em insuficiência renal.",
  "Spironolactone, an aldosterone an", "should not be used if there is renal  impairment", secao=S4)

f("A espironolactona pode associar-se de modo dose-dependente a irregularidade menstrual, a menos que a paciente use contraceptivo oral concomitante; raramente causa hipercalemia e pode causar aumento da diurese e, ocasionalmente, hipotensão postural e tontura no início do tratamento.",
  "Spironolactone may have a dose-dependent", "dizziness early in treatment", secao=S4)

f("Contraceptivos orais contendo drospirenona têm efeito mineralocorticoide leve e não devem ser usados com diurético poupador de potássio.",
  "OCs containing DSP have a  mild mineralocorticoid effect and should not be used  with a potassium-sparing diuretic", secao=S4)

f("Como todos os antiandrogênios, se a espironolactona for usada inadvertidamente no início da gravidez há risco de feminização de feto masculino, pela extrema sensibilidade da genitália fetal à exposição a hormônios sexuais sintéticos maternos, embora o risco absoluto seja desconhecido.",
  "As with all anti- androgens, if a patient inadvertently uses spironolactone", "absolute risk of this is not known", secao=S4)

f("O acetato de ciproterona é usado mundialmente para hirsutismo e acne, mas não está disponível nos Estados Unidos; é composto progestogênico com atividade antiandrogênica por inibir o receptor androgênico e, em menor grau, a 5-alfa-redutase, além de suprimir gonadotrofinas e androgênios séricos.",
  "Clinicians worldwide use CPA to treat hirsutism and", "levels", secao=S4)

f("Em uma revisão sistemática, o contraceptivo com acetato de ciproterona 2 mg associado a 35 mcg de etinilestradiol foi semelhante à terapia antiandrogênica e mais eficaz que placebo.",
  "In one systematic review, the OC CPA (2 mg) with  35 mcg EE was similar to antiandrogen therapy and more  effective than placebo", secao=S4)

f("A finasterida inibe a 5-alfa-redutase tipo 2; como o hirsutismo provavelmente envolve as enzimas tipo 1 e tipo 2, espera-se apenas efeito inibitório parcial. Uma revisão relatou redução dos escores de hirsutismo de 30% a 60% e diminuição do diâmetro das hastes pilosas.",
  "Finasteride inhibits type 2 5a-reductase activity", "reduced hair shaft diameters as well", secao=S4)

f("Embora 5 mg seja a dose mais usada de finasterida, alguns dados sugerem que 7,5 mg seja mais eficaz e que as doses de 2,5 e 5 mg pareçam igualmente eficazes.",
  "Although  5 mg finasteride is the most commonly used dose, some", "appear to be equally effective", secao=S4)

f("A dutasterida, que inibe ambas as isoenzimas (tipo 1 e tipo 2), foi aprovada para o tratamento de homens com câncer de próstata; embora pareça opção atraente para o hirsutismo, não há dados clínicos que apoiem seu uso.",
  "Dutasteride has been approved for the", "this time", secao=S4)

f("A flutamida é antiandrogênio 'puro' com inibição dose-resposta do receptor androgênico; a dose mais usada em ensaios randomizados é 500 mg/dia, e alguns especialistas sugerem eficácia igual com 250 e 500 mg/dia.",
  "Flutamide is a “pure” antiandrogen with a dose", "250 and 500 mg/d", secao=S4)

f("Estudo de vigilância de 10 anos com 203 mulheres recebendo flutamida em doses de 62,5 ou 125 mg identificou 22 (11%) com elevação de alanina aminotransferase e/ou aspartato aminotransferase.",
  "A 10-year surveillance  study of 203 women receiving flutamide at doses of 62.5 or  125 mg identified 22 (11%) who experienced elevated  serum concentrations of alanine aminotransferase and/or  aspartate aminotransferase", secao=S4)

f("Em estudo retrospectivo de 414 mulheres com hirsutismo em uso de flutamida em dose baixa, isolada ou com contraceptivo oral, 6% interromperam a terapia por elevação de transaminases (todas usavam 125 a 250 mg e todos os casos ocorreram no primeiro ano de tratamento).",
  "In a retrospective study of  414 women with hirsutism receiving low-dose flutamide", "occurred in the first year of therapy", secao=S4)

f("Um centro relatou série de sete mulheres que desenvolveram hepatotoxicidade em uso de flutamida (150 a 250 mg/dia) para acne ou hirsutismo; cinco necessitaram transplante hepático de urgência e quatro das cinco sobreviveram.",
  "one  center reported a series of seven women who developed", "and four of five survived", secao=S4)

f("Com base na evidência emergente de hepatotoxicidade, na eficácia não comprovada para hirsutismo e na disponibilidade de antiandrogênios alternativos, a diretriz recomenda também contra o uso de flutamida em dose baixa (até 250 mg), além da dose padrão (acima de 250 mg).",
  "In our 2008 guideline, we suggested against standard", "also recommend against the use of low-dose flutamide", secao=S4)

f("Cinco ensaios randomizados de antiandrogênio associado a contraceptivo oral versus contraceptivo isolado mostraram que a adição do antiandrogênio foi discretamente mais eficaz, com redução incremental do escore de hirsutismo (diferença média ponderada de 1,73 ponto).",
  "Our 2008 updated systematic reviews  identified five RCTs of antiandrogens combined with", "21.73", secao=S4)

f("No único ensaio randomizado comparando contraceptivo oral (com ciproterona 2 mg, antiandrogênio em dose baixa) com um antiandrogênio (finasterida), não houve diferença significativa no escore de hirsutismo após 9 meses de tratamento.",
  "In the only RCT comparing an OC to an anti", "group receiving this OC", secao=S4)

# ---------------- GLICOCORTICOIDE / NCCAH ----------------
f("Na HAC clássica por deficiência de 21-hidroxilase, os glicocorticoides ajudam a prevenir ou manejar o hirsutismo e são eficazes para manter ciclos ovulatórios normais; na forma não clássica, são eficazes para indução de ovulação, mas seu papel no manejo do hirsutismo é menos claro.",
  "Clinicians administer glucocorticoids long-term to", "management of hirsutism is less clear", secao=S4)

f("Em pacientes com hiperandrogenismo adrenal puro, mesmo naqueles muito sensíveis a glicocorticoides, a supressão dos androgênios adrenais resulta em apenas melhora discreta do hirsutismo, embora esses pacientes possam obter remissão prolongada após a retirada da terapia.",
  "In patients with pure adrenal hyperandrogenism, even", "achieve prolonged remission after therapy withdrawal", secao=S4)

f("A abordagem do hirsutismo na HAC não clássica é a mesma da SOP: iniciar com contraceptivo oral e acrescentar antiandrogênio após 6 meses se necessário; o antiandrogênio pode ser inicial se a mulher não busca gravidez e tem contracepção confiável.",
  "Our approach to treating hirsutism in women with  NCCAH is the same as for women with PCOS", "has a reliable form of contraception", secao=S4)

f("Glicocorticoides só são sugeridos para o hirsutismo em mulheres com resposta subótima a contraceptivos orais e/ou antiandrogênios, ou que não os toleram; para hirsutismo usa-se prednisona 4 a 6 mg por dia ou dexametasona 0,25 mg/dia.",
  "We  only suggest glucocorticoids for the management of", "methasone 0.25 mg/d", secao=S4)

f("Para indução da ovulação na HAC não clássica sugere-se terapia com glicocorticoide, iniciando tipicamente com prednisona 5 mg por dia; se não houver ovulação, a dose pode ser aumentada para 7,5 mg, acrescentando-se citrato de clomifeno se ainda não ocorrer ovulação.",
  "For ovulation induction, we", "with prednisone alone", secao=S4)

f("Não se sugere dexametasona na indução de ovulação porque ela não é inativada pela 11-beta-hidroxiesteroide desidrogenase tipo 2 placentária, ou seja, ocorre exposição fetal.",
  "We do not suggest dexametha", "exposure occurs", secao=S4)

f("Em estudo de mulheres com hirsutismo de origem adrenal ou por deficiência enzimática randomizadas para contraceptivo oral (ciproterona com etinilestradiol) ou dexametasona, DHEA e DHEAS caíram no grupo dexametasona mas não no do contraceptivo; entretanto, mais mulheres tiveram redução significativa do hirsutismo no grupo do contraceptivo (10 de 15 pacientes; 66%) que no grupo da dexametasona (4 de 13 pacientes; 31%).",
  "In a study of  women with hirsutism of adrenal origin or enzyme de", "of 13 patients; 31%)", secao=S4)

f("Em ensaio com mulheres com HAC não clássica recebendo acetato de ciproterona ou hidrocortisona, as tratadas com ciproterona tiveram queda significativamente maior do escore de hirsutismo (54%) após 1 ano que as tratadas com hidrocortisona (26%); em contraste, os níveis de androgênio normalizaram apenas no subgrupo da hidrocortisona.",
  "In a trial of women with NCCAH receiving CPA or", "ceptivity to androgens", secao=S4)

f("Mesmo em doses recomendadas pode ocorrer discreta superdosagem de glicocorticoide, independentemente da administração diária ou em dias alternados, associada a atrofia adrenal, aumento da pressão arterial, ganho de peso, estrias cushingoides (particularmente com dexametasona) e redução da densidade mineral óssea; o DHEAS indica o grau de supressão adrenal, com nível-alvo em torno de 70 mcg/dL.",
  "Slight overdosing can occur even at recommended", "70 mcg/dL", secao=S4)

# ---------------- OUTRAS DROGAS ----------------
f("Em metanálise de oito ensaios randomizados de 2008 a metformina não foi mais eficaz que placebo para tratar hirsutismo, resultado confirmado na revisão sistemática atualizada de nove ensaios; troglitazona e rosiglitazona também não tiveram efeito significativo sobre o hirsutismo.",
  "In our 2008 meta-analysis of eight RCTs, metformin was no more", "no significant effect on hirsutism", secao=S4)

f("Como os agonistas de GnRH isolados causam hipoestrogenismo grave e perda óssea, prescrevem-se baixas doses de estrogênio, ou estrogênio mais progestogênio nas mulheres com útero, como terapia de add-back.",
  "Because GnRH agonists alone", "back therapy", secao=S4)

f("A terapia com agonista de GnRH é mais eficaz que placebo ou nenhuma terapia para hirsutismo, mas não tem vantagens sobre contraceptivos orais e antiandrogênios, além de ser cara, exigir injeções e causar deficiência estrogênica grave com sintomas menopausais se não se acrescentar estrogênio.",
  "Although GnRH agonist therapy is more effective than", "such as hot flashes and bone loss", secao=S4)

f("Cremes com antiandrogênios têm eficácia limitada: creme com canrenona (metabólito ativo da espironolactona) teve resultados de benefício e de ausência de benefício, e a finasterida tópica teve resultados inconsistentes, com benefício a 0,25% e ausência de benefício a 0,5%. A eflornitina, aprovada como tratamento tópico, não é antiandrogênio.",
  "Creams with antiandrogens appear to have lim", "ment below)", secao=S4)

# ---------------- REMOÇÃO DIRETA ----------------
f("Recomendação: para mulheres que optam por remoção de pelo, sugere-se fotoepilação para pelos castanho-avermelhados, castanhos ou pretos, e eletrólise para pelos brancos ou loiros.",
  "For women who choose hair removal therapy, we  suggest photoepilation for those whose un", "suggest electrolysis for those with white or blonde  hair", secao=S5)

f("Recomendação: para mulheres de pele escura que optam por fotoepilação, usar fonte de luz de comprimento de onda longo e pulso longo, como Nd:YAG ou laser de diodo, com resfriamento cutâneo adequado; deve-se alertar mulheres mediterrâneas e do Oriente Médio com hirsutismo facial sobre o risco aumentado de hipertricose paradoxal, preferindo-se tratamento tópico ou eletrólise nesses casos.",
  "For women of color who choose photoepilation  treatment, we suggest using a long-wavelength", "ysis over photoepilation with these patients", secao=S5)

f("Recomendação: para mulheres que desejam resposta mais rápida à fotoepilação, acrescentar creme tópico de eflornitina durante o tratamento.",
  "For women who desire more rapid response to  photoepilation, we suggest adding eflornithine  topical cream during treatment", secao=S5)

f("Recomendação: em mulheres com hiperandrogenemia conhecida que optam por remoção de pelo, associar terapia farmacológica para minimizar o novo crescimento piloso.",
  "For women with known hyperandrogenemia  who choose hair removal therapy, we suggest  pharmacologic therapy to minimize hair regrowth", secao=S5)

f("A FDA define redução permanente de pelo como alcançar redução de pelo menos 30% dos pelos terminais e sustentá-la por período maior que o ciclo completo de crescimento dos folículos (4 a 12 meses, conforme o sítio corporal).",
  "They define permanent hair reduction as", "depending on body site", secao=S5)

f("A fotoepilação trata rapidamente grandes áreas mas exige pelo terminal pigmentado; a eletrólise limita-se em geral a pequenas áreas e não depende da pigmentação do pelo.",
  "Photoepilation is a method  capable of rapidly treating large areas", "depend on hair pigmentation", secao=S5)

f("Na eletrólise, corrente elétrica passa por um eletrodo de fio fino inserido manualmente em cada folículo: a técnica galvânica usa corrente contínua com reações eletroquímicas que liberam produtos tóxicos no folículo, e a termólise usa corrente alternada de maior intensidade para produzir calor ao redor do eletrodo.",
  "Electrical current is passed", "surrounding the wire electrode", secao=S5)

f("A fotoepilação usa pulsos de luz absorvidos pela melanina da haste e do folículo para causar fototermólise seletiva dos folículos terminais pigmentados, com lesão seletiva conforme comprimento de onda, duração do pulso e fluência (energia aplicada por área de pele).",
  "Photoepilation uses pulses of light absorbed by mel", "per area of skin surface", secao=S5)

f("As fontes de fotoepilação incluem quatro tipos de laser (rubi, alexandrita, diodo e Nd:YAG) e diversas fontes de luz intensa pulsada emitindo comprimentos de onda entre 500 e 1200 nm absorvidos pela melanina.",
  "Photoepilation sources include", "absorbs", secao=S5)

f("Em estudo com 12 mulheres que receberam três tratamentos com laser de alexandrita na axila esquerda e quatro sessões de eletrólise na direita, o laser foi 60 vezes mais rápido (30 segundos versus 30 minutos) e, seis meses após o tratamento inicial, houve redução de 74% na contagem de pelos terminais após o laser e de 35% após a eletrólise.",
  "12 women received three alexan", "35% after  electrolysis", secao=S5)

f("Ocorre alopecia completa ou quase completa por 4 a 6 semanas após cada sessão de fotoepilação, seguida de recrescimento gradual de pelo terminal tipicamente reduzido em número em relação ao basal.",
  "Complete or nearly complete alopecia occurs", "typically reduced in number compared with baseline", secao=S5)

f("Metanálise de 24 ensaios prospectivos publicados entre 1998 e 2003 encontrou redução pilosa pelo menos 6 meses após o último tratamento de, em média, 57,5% para diodo, 54,0% para alexandrita, 52,8% para rubi e 42,3% para Nd:YAG, sem diferença estatisticamente significativa entre os quatro lasers.",
  "A meta-analysis of 24 prospective trials published", "not statistically significant", secao=S5)

f("A eficácia da fotoepilação aumenta com o número de tratamentos, mas raramente atinge 100% de remoção; em relato retrospectivo com mais de 2000 pacientes consecutivos tratados com laser de alexandrita, a redução média foi de cerca de 80% seis meses após o tratamento final.",
  "Efficacy increases with", "the final treatment", secao=S5)

f("Pelo naturalmente branco ou loiro não é passível de fotoepilação porque o pigmento melanina é necessário; pacientes com pele bronzeada ou muito pigmentada têm maior risco de lesão térmica não intencional da epiderme, com inflamação, queimaduras, bolhas, hiperpigmentação, hipopigmentação e/ou cicatriz (raramente).",
  "Because melanin pigment is necessary for photo", "and/or scarring (rarely)", secao=S5)

f("Resfriamento da pele, menor fluência, maior duração de pulso e/ou maior comprimento de onda reduzem o risco relativo de lesão cutânea durante a fotoepilação.",
  "Skin cooling,  lower fluence, longer pulse duration, and/or longer  wavelength can reduce the relative risk of skin injury  during photoepilation", secao=S5)

f("Efeitos adversos por lesão epidérmica não intencional são mais prováveis com pele mais pigmentada, fluência maior e/ou resfriamento inadequado, e incluem dor forte, bolhas, erosões, crostas, alterações pigmentares transitórias ou prolongadas (em até cerca de 10% dos pacientes) e cicatrizes (muito raras).",
  "Side effects related to unintentional epidermal", "and scarring (very rare)", secao=S5)

f("Em série retrospectiva de 2541 pacientes do Oriente Médio tratados com luz intensa pulsada por pelo menos oito sessões, ocorreram alterações pigmentares em cerca de 5%, bolhas ou erosões em cerca de 4% e cicatrizes em cerca de 0,01%.",
  "In a retrospective  series of 2541 Middle Eastern patients treated for at least  eight sessions with IPL", "0.01%", secao=S5)

f("Em série retrospectiva de 346 pacientes consecutivos tratados com laser de rubi, a frequência global de efeitos pigmentares foi de 9%, chegando a 24% nos indivíduos com os tipos de pele mais escuros (fototipos de Fitzpatrick V a VI).",
  "In a retrospective series of 346 consec", "types V to VI)", secao=S5)

f("Lasers Nd:YAG de 1064 nm são eficazes para fotoepilação em pele muito pigmentada por causa do menor risco de lesão epidérmica e de efeitos pigmentares.",
  "Nd:YAG (1064 nm) lasers (which have the same cost", "pigmentary side effects", secao=S5)

f("A hipertricose paradoxal é efeito adverso infrequente, mas psicologicamente profundo, duradouro e potencialmente permanente da fotoepilação: ocorre crescimento de pelo em vez da remoção esperada; mulheres com hiperandrogenismo aparentemente têm maior risco e não há relatos em homens.",
  "PH is an infrequent, but psychologically profound", "Studies have  not reported PH in men", secao=S5)

f("A hipertricose paradoxal ocorre mais comumente na face e no pescoço e é aparentemente mais provável em pacientes de origem mediterrânea ou do Oriente Médio; a prevalência relatada varia de 0,6% a 10%.",
  "It occurs most commonly on the", "to 10%", secao=S5)

f("Como a maior concentração de melanina do corpo está na retina e na úvea, elas podem ser danificadas por luz que atravessa a pálpebra fechada ou os tecidos moles ao redor do olho; a colocação adequada de protetores esclerais opacos e totalmente oclusivos previne essa lesão.",
  "Because the highest concentration of melanin in the", "prevent this injury", secao=S5)

f("A eflornitina reduz a velocidade de crescimento do pelo por inibição irreversível da ornitina descarboxilase, enzima que catalisa a etapa limitante da síntese de poliaminas foliculares; o creme de cloridrato de eflornitina a 13,9% é aprovado pela FDA para pelo facial indesejado em mulheres.",
  "Eflornithine reduces the rate of hair growth by irre", "ment of unwanted facial hair in women", secao=S5)

f("Os resultados perceptíveis da eflornitina levam cerca de 6 a 8 semanas; após a suspensão, os pelos voltam aos níveis pré-tratamento em cerca de 8 semanas. A absorção sistêmica é extremamente baixa e os efeitos adversos de uso clínico incluem prurido e pele seca.",
  "Noticeable re- sults take", "side effects include  itching and dry skin", secao=S5)

f("A sugestão de usar fotoepilação em vez de eletrólise para a maioria das mulheres com pelo pigmentado indesejado baseia-se em maior eficácia e conveniência, menos dor e menor custo global pelo número de sessões necessárias.",
  "Our suggestion to use photoepilation over electrolysis", "necessary in most  women", secao=S5)

# ---------------- DOSAGEM DE ANDROGÊNIOS ----------------
f("A testosterona é o androgênio-chave a ser medido por ser o principal androgênio circulante; seus níveis variam episódica e diurnamente, sendo mais altos no início da manhã e variando cerca de 25% em torno da média, e em mulheres ovulatórias atingem um pico no meio do ciclo.",
  "Testosterone is the key androgen to measure because it is", "levels reach a midcycle zenith", secao=S6)

f("A testosterona livre (ou biodisponível) sérica está elevada com mais frequência que a testosterona total nas mulheres hirsutas e é mais sensível que a total para detectar produção androgênica excessiva, porque mulheres hirsutas costumam ter nível relativamente baixo de SHBG.",
  "The serum  free (or bioavailable) testosterone level is more often", "relatively low level of SHBG", secao=S6)

f("A SHBG é o principal determinante da fração de testosterona plasmática livre ou ligada a outras proteínas; seus níveis são elevados pelo estrogênio e suprimidos por androgênio, obesidade com resistência à insulina e hipotireoidismo.",
  "SHBG is  the main determinant of the fraction of plasma testos", "and hypothyroidism", secao=S6)

f("Os imunoensaios automatizados disponíveis na maioria dos laboratórios hospitalares em geral não são adequados para medir testosterona com acurácia em mulheres; a utilidade diagnóstica depende de ensaio acurado e específico.",
  "The diagnostic utility of", "androgen excess", secao=S6)

f("A diretriz recomenda contra a dosagem de testosterona salivar, porque diferenças metodológicas levaram a valores muito divergentes entre laboratórios, e contra a medida de testosterona urinária (glicuronídeo de testosterona), que não é metabólito exclusivo da testosterona sérica.",
  "Sali- vary testosterone, although not a simple ultrafiltrate", "circulating testosterone", secao=S6)

f("O ensaio direto de testosterona livre sérica não é confiável; os métodos mais confiáveis calculam a testosterona livre a partir da testosterona total e da SHBG, ou como o produto da testosterona total pela fração livre por diálise de equilíbrio ou não ligada à SHBG. A SHBG baixa é, por si só, marcador útil de resistência à insulina.",
  "Direct assay of serum-free testos", "common in PCOS", secao=S6)

f("O DHEAS está aumentado em até 17% das mulheres hirsutas com testosterona total e livre normais, e um DHEAS discretamente elevado com testosterona livre normal dificilmente muda a conduta.",
  "DHEAS is  increased in", "is unlikely to affect management", secao=S6)

f("A magnitude do nível de androgênio tem baixo valor preditivo para tumores, embora testosterona muito alta (faixa de homem adulto) ou DHEAS acima de 700 (impresso como 'mg/dL' no artigo, correspondendo a µg/dL) seja sugestiva; níveis de DHEAS têm sensibilidade limitada para rastrear HAC não clássica.",
  "The magnitude  of the androgen level is of poor predictive value for tu", "NCCAH", secao=S6)

f("Reconheceu-se recentemente que androgênios adrenais atípicos, como os esteroides 11-oxi-C19, podem contribuir significativamente para a ação androgênica; estimativas da potência da 11-cetotestosterona em relação à testosterona variam de 20% a 75%.",
  "It has recently been recognized that atypical adrenal", "range from 20% to 75%", secao=S6)

f("A prevalência mundial de HAC não clássica é de 4,2%, mas varia com a população entre as mulheres hiperandrogênicas: 1% a 2% entre brancas e hispânicas dos EUA, relativamente incomum entre afro-americanas, 3% a 6% na Espanha, França, Itália e Canadá, e 5% a 10% no Oriente Médio.",
  "A meta-analysis indicates that the worldwide preva", "in the Middle East", secao=S6)

f("Estão sob risco particularmente alto de HAC não clássica quem tem história familiar positiva e certos grupos étnicos, notadamente judeus asquenazes, nos quais a prevalência é 37 vezes maior que na população caucasiana geral.",
  "At particularly high  risk are those with a positive family history and certain", "population", secao=S6)

f("Um valor de 17-hidroxiprogesterona acima de 170 a 200 ng/dL (5,15 a 6,0 nmol/L) é aproximadamente 95% sensível e 90% específico para HAC não clássica.",
  "A 17-hydroxyprogesterone  value", "specific for NCCAH", secao=S6)

f("O diagnóstico definitivo de HAC não clássica exige 17-hidroxiprogesterona de 1000 a 1500 ng/dL ou mais (30 a 45 nmol/L), basal ou em resposta ao teste de estímulo com cosintropina, sendo os valores entre 1000 e 1500 confirmados por análise genética molecular do gene CYP21A2.",
  "Definitive diagnosis requires demonstrating a", "CYP21A2", secao=S6)

# ---------------- MUDANÇAS DESDE A DIRETRIZ ANTERIOR ----------------
f("Mudança em relação à diretriz de 2008: a sugestão de dosar testosterona total sérica foi ampliada para todas as mulheres com hirsutismo, e a de dosar testosterona livre foi ampliada para as hirsutas com testosterona total normal na presença de hirsutismo moderado a grave ou de outra evidência clínica de hiperandrogenemia, como crescimento progressivo de pelo em áreas androgênio-dependentes.",
  "We have broadened the suggestion for determining the", "(sexual hair)", secao="Mudanças desde a diretriz anterior")

f("Mudança em relação à diretriz anterior: passou-se a sugerir eletrólise em vez de fotoepilação em mulheres com pelo loiro ou branco que optam por remoção direta, e foi acrescentada orientação sobre o uso da fotoepilação e suas complicações em mulheres de pele escura.",
  "We added a suggestion for electrolysis rather than", "in women of color", secao="Mudanças desde a diretriz anterior")

extrato = {
    "fileId": FID,
    "titulo": "Evaluation and Treatment of Hirsutism in Premenopausal Women: An Endocrine Society Clinical Practice Guideline",
    "tema": "hirsutismo — avaliação diagnóstica (escore de Ferriman-Gallwey, dosagem de androgênios, rastreio de HAC não clássica) e tratamento farmacológico e de remoção direta de pelos na mulher pré-menopausada",
    "fonte": "Martin KA, Anderson RR, Chang RJ, Ehrmann DA, Lobo RA, Murad MH, Pugeat MM, Rosenfield RL. Evaluation and Treatment of Hirsutism in Premenopausal Women: An Endocrine Society Clinical Practice Guideline. J Clin Endocrinol Metab. 2018;103(4):1233-1257 (doi:10.1210/jc.2018-00241)",
    "area": "Adrenal",
    "tipo": "diretriz",
    "ano": 2018,
    "fatos": fatos,
}

from _lib_cite import grava
grava(extrato, F, "/home/user/endodirect/scratchpad/acervo/extratos/%s.json" % FID)
