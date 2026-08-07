#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import json, sys, io
sys.path.insert(0, '/home/user/endodirect/scratchpad/acervo')
from checkcit import checa

FID = '1uSuX7m8ufiH8u3pmn4oHIei-lY4FDdee'
TXT = f'/home/user/endodirect/scratchpad/acervo/textos/{FID}.txt'
OUT = f'/home/user/endodirect/scratchpad/acervo/extratos/{FID}.json'

F = []
def f(a, c, s):
    F.append({'afirmacao': a, 'citacao': c, 'secao': s})

# ===================== ABSTRACT =====================
f('Os craniofaringiomas sao tumores malformacionais raros de baixa malignidade histologica que surgem ao longo do ducto craniofaringeo.',
  'Craniopharyngiomas are rare malformational tumours of low histological malignancy arising along the craniopharyngeal duct.',
  'Abstract')

f('Os craniofaringiomas adamantinomatosos (ACP) tem pico bimodal de incidencia (5 a 15 anos e 45 a 60 anos), enquanto os papiliferos (PCP) se restringem a adultos, principalmente na quinta e sexta decadas de vida.',
  'ACPs are diagnosed with a bimodal peak of incidence (5–15 years and 45–60 years), whereas PCPs are restricted to adults mainly in the fifth and sixth decades of life.',
  'Abstract')

f('Os ACP sao dirigidos por mutacoes somaticas em CTNNB1 (que codifica a beta-catenina) que afetam a estabilidade da beta-catenina e tem aparencia predominantemente cistica.',
  'ACPs are driven by somatic mutations in CTNNB1 (encoding β- catenin) that affect β- catenin stability and are predominantly cystic in appearance.',
  'Abstract')

f('Os PCP frequentemente albergam mutacoes somaticas BRAFV600E e sao tipicamente tumores solidos.',
  'PCPs frequently harbour somatic BRAFV600E mutations and are typically solid tumours.',
  'Abstract')

f('Manifestacoes clinicas por hipertensao intracraniana, comprometimento visual e deficiencias endocrinas devem motivar investigacao por imagem, preferencialmente RM.',
  'Clinical manifestations due to increased intracranial pressure, visual impairment and endocrine deficiencies should prompt imaging investigations, preferentially MRI.',
  'Abstract')

f('O tratamento do craniofaringioma compreende neurocirurgia e radioterapia; a quimioterapia intracistica e usada no ACP monocistico.',
  'Treatment comprises neurosurgery and radiotherapy; intracystic chemotherapy is used in monocystic ACP.',
  'Abstract')

f('Embora a sobrevida a longo prazo seja alta, a qualidade de vida e a funcao neuropsicologica sao frequentemente prejudicadas pela proximidade anatomica ao quiasma optico, hipotalamo e hipofise.',
  'Although long- term survival is high, quality of life and neuropsychological function are frequently impaired due to the close anatomical proximity to the optic chiasm, hypothalamus and pituitary gland.',
  'Abstract')

f('O envolvimento hipotalamico e as lesoes hipotalamicas relacionadas ao tratamento resultam frequentemente em obesidade hipotalamica, fadiga fisica e deficits psicossociais.',
  'hypothalamic involvement and treatment- related hypothalamic lesions frequently result in hypothalamic obesity, physical fatigue and psychosocial deficits.',
  'Abstract')

# ===================== INTRODUCAO =====================
f('Em criancas, a combinacao de cefaleia, comprometimento visual, retardo de crescimento e poliuria-polidipsia por diabetes insipidus central e altamente indicativa de craniofaringioma.',
  'visual impairment, growth retardation and polyuria–',
  'Introducao')

f('No diabetes insipidus central, a deficiencia de arginina-vasopressina da hipofise ou do hipotalamo leva a producao de urina hipotonica.',
  'deficiency of arginine vasopressin from the pituitary',
  'Introducao')

f('Os craniofaringiomas originam-se de remanescentes do epitelio do ducto craniofaringeo (bolsa de Rathke), uma invaginacao no teto da boca em desenvolvimento que da origem a adeno-hipofise.',
  'epithelium (known as Rathke’s pouch, which is an invagi',
  'Introducao')

f('Os craniofaringiomas localizam-se na sela turcica (intrasselar) ou acima dela (suprasselar).',
  'in the sella turcica (that is, the depression in the sphe',
  'Introducao')

f('Os craniofaringiomas sao tipicamente de baixo grau histologico, isto e, grau I da OMS.',
  'typically of low histological grade (that is, WHO grade I), TN, USA.',
  'Introducao')

f('Embora possam se desenvolver em qualquer ponto do eixo hipofise-hipotalamo, cerca de 50% dos craniofaringiomas originam-se no nivel do assoalho do terceiro ventriculo, no infundibulo e/ou tuber cinereum, e expandem-se predominantemente para a cavidade do terceiro ventriculo.',
  'brain, \\~50% originate at the level of the third ventricle',
  'Introducao')

f('A consciencia adequada do contato proximo entre o craniofaringioma e os nucleos hipotalamicos e fundamental para evitar lesao hipotalamica indevida.',
  'awareness of the close contact between these lesions',
  'Introducao')

f('Muito raramente os craniofaringiomas podem ocorrer em localizacoes diferentes, como o angulo ponto-cerebelar.',
  'occur in different locations such as the cerebellopon',
  'Introducao')

f('Craniofaringiomas foram observados em individuos com sindrome de Gardner, uma polipose autossomica dominante.',
  'CPs have been observed in individuals with Gardner',
  'Introducao')

f('Diferentemente dos tumores malignos, os craniofaringiomas NAO disseminam, mas ha casos documentados de disseminacao espinhal por extravasamento intraoperatorio de material tumoral.',
  'Unlike malignant tumours, CPs do not disseminate',
  'Introducao')

f('A regra dos 90% descreve a imagem do ACP: cerca de 90% dos tumores sao predominantemente cisticos, cerca de 90% mostram calcificacoes tipicamente proeminentes e cerca de 90% captam contraste nas paredes do cisto; os PCP sao mais frequentemente nao calcificados e solidos.',
  'The typical combination of imaging features of ACPs can be described using the so called 90% rule, whereby \\~90% of tumours are predominantly cystic, \\~90% show typically prominent calcifications and \\~90% take up contrast media in the cyst walls14,15; PCPs are more frequently non calcified and ‘solid’.',
  'Introducao')

f('As estrategias de tratamento atuais sao debatidas, indo de cirurgia radical (ressecao total macroscopica e abordagem endoscopica endonasal transesfenoidal estendida) a abordagens cirurgicas limitadas focadas na preservacao da integridade hipotalamica e visual e da qualidade de vida.',
  'ranging from radical surgical strategies such as gross total resection (GTR) and the extended trans sphenoidal endoscopic endonasal approach (EEA) to limited surgical approaches focused on the preserva tion of hypothalamic and visual integrity and quality of life (QOL) after treatment',
  'Introducao')

f('A ressecao total macroscopica segura permanece o objetivo quando factivel, isto e, quando a integridade hipotalamica pode ser preservada, e associa-se a maior sobrevida livre de recorrencia.',
  'However, safe GTR remains the goal when fea sible (that is, when hypothalamic integrity can be pre served) and is associated with the highest recurrence free survival',
  'Introducao')

# ===================== FIGURA 1 =====================
f('A celula de origem tanto do ACP quanto do PCP sao remanescentes embrionarios do epitelio da bolsa de Rathke.',
  '• Cell of origin: embryonic remnants of the Rathke’s pouch epithelium',
  'Figura 1')

f('Na RM, o ACP tem forma em couve-flor com cerca de 90% de calcificacoes, cerca de 90% de realce e cerca de 90% de cistos, contendo liquido oleoso rico em colesterol.',
  '• Appearance on MRI: cauliflower-like shape with \\~90% calcifications, \\~90% enhancement and \\~90% cysts, containing cholesterol-rich oily fluid',
  'Figura 1')

f('Os achados patologicos do ACP incluem epitelio distintivo que forma reticulo estrelado, queratina umida e paliçadas basais.',
  '• Pathological features: distinctive epithelium that forms stellate reticulum, wet keratin and basal palisades',
  'Figura 1')

f('A sintomatologia chave do ACP e comprometimento visual, cefaleia e deficiencias endocrinas.',
  '• Key symptomology: visual impairment, headache and endocrine deficiencies',
  'Figura 1')

f('O PCP apresenta-se aos 40 a 55 anos, e na RM e majoritariamente solido, raramente cistico e sem calcificacoes.',
  '• Age of presentation: 40–55 years',
  'Figura 1')

f('Os achados patologicos do PCP sao nucleos fibrovasculares revestidos por epitelio escamoso nao queratinizante.',
  '• Pathological features: fibrovascular cores lined by non-keratizing squamous epithelium',
  'Figura 1')

f('A sintomatologia chave do PCP e cefaleia e sintomas hipotalamicos, incluindo alteracoes psiquiatricas.',
  '• Key symptomology: headache and hypothalamic symptoms, including psychiatric alterations',
  'Figura 1')

f('Na RM, o PCP e majoritariamente solido, raramente cistico e sem calcificacoes.',
  '• Appearance on MRI: mostly solid, rarely cystic and without calcifications',
  'Figura 1')

# ===================== EPIDEMIOLOGIA =====================
f('Os craniofaringiomas constituem 1,2 a 4,6% de todos os tumores intracranianos, com 0,5 a 2,5 novos casos por 1 milhao de habitantes por ano globalmente.',
  'CPs constitute 1.2–4.6% of all intracranial tumours, accounting for 0.5–2.5 new cases per 1 million popu lation per year globally',
  'Epidemiology')

f('No Japao os craniofaringiomas sao mais frequentes, com incidencia anual de 3,8 casos por 1 milhao de criancas.',
  'with an annual incidence of 3.8 cases per 1 million children',
  'Epidemiology')

f('De todos os pacientes com craniofaringioma, 30 a 50% sao diagnosticados durante a infancia e a adolescencia.',
  'Of patients with CPs, 30–50% are diagnosed during childhood and adolescence',
  'Epidemiology')

f('O craniofaringioma e a neoplasia intracerebral nao neuroepitelial mais comum em criancas (menores de 18 anos), respondendo por 5 a 11% dos tumores intracranianos nessa faixa etaria.',
  'CPs are the most common non neuroepithelial intracerebral neoplasm in children (\\<18 years of age), accounting for 5–11% of intracranial tumours in this age group',
  'Epidemiology')

f('O ACP tem distribuicao etaria bimodal, com picos de incidencia em criancas de 5 a 15 anos e adultos de 45 a 60 anos.',
  'ACP has a bimodal age distribution25,29, with peak incidences in children aged 5–15 years and adults aged 45–60 years.',
  'Epidemiology')

f('Na faixa etaria infantil e adolescente, o tipo histologico adamantinomatoso com formacao de cistos e o mais comum.',
  'In the childhood and adolescent age group, the APC histological type with cyst formation is the most common',
  'Epidemiology')

f('Os PCP ocorrem quase exclusivamente em adultos, com idade media de 40 a 55 anos.',
  'in adults, at a mean patient age of 40–55 years34.',
  'Epidemiology')

f('Em estudos de base populacional nao foram observadas diferencas entre os sexos no craniofaringioma; casos foram relatados em duas familias, mas uma suscetibilidade genetica subjacente nao foi verificada.',
  'In population based studies, no sex differences have been observed23,35. CP cases have been reported within two families36,37, but an underlying genetic susceptibility has not been verified.',
  'Epidemiology')

# ===================== SOBREVIDA E MORBIDADE =====================
f('A mortalidade global no craniofaringioma e relatada como tres a cinco vezes maior do que a observada na populacao geral.',
  'Overall mortality in CP is reported to be three to five times higher than those observed in the general popu lation',
  'Survival and late morbidity')

f('A sobrevida global em coortes pediatricas de craniofaringioma varia de 83% a 96% em 5 anos, de 65% a 100% em 10 anos e e, em media, 62% em 20 anos.',
  'Overall survival described in paediatric cohorts ranges from 83% to 96% at 5 years39, from 65% to 100% at 10 years40,41 and is, on average, 62% at 20 years.',
  'Survival and late morbidity')

f('Em coortes mistas de pacientes pediatricos e adultos, a sobrevida global fica entre 54 e 96% em 5 anos, 40 e 93% em 10 anos e 66 e 85% em 20 anos.',
  'In mixed paediatric and adult patient cohorts, overall survival is in the range 54–96% at 5 years38,42, 40–93% at 10 years38,42,43 and 66–85% at 20 years',
  'Survival and late morbidity')

f('Ainda se debate se a idade ao diagnostico do craniofaringioma e fator prognostico de sobrevida: varios estudos mostram melhor sobrevida nos pacientes mais jovens, mas outros relatam melhores desfechos em pacientes mais velhos ou sobrevida similar.',
  'Whether age at diagnosis of CP is a prognostic factor for survival is still a matter of debate.',
  'Survival and late morbidity')

f('Um melhor prognostico para os PCP do que para os ACP ja foi relatado, mas outros estudos nao replicaram esse achado.',
  'Furthermore, a better prognosis for PCPs than ACPs has been reported46,47, yet other studies have not replicated this finding',
  'Survival and late morbidity')

f('A morbidade a longo prazo associa-se a fatores de risco como doenca progressiva com multiplas recorrencias, doenca cerebrovascular (por exemplo dilatacoes fusiformes da arteria carotida) e deficiencias neuroendocrinas cronicas.',
  'Long term morbidity is associated with tumour related and/or treatment related risk factors such as progressive disease with multiple recurrences, cerebro vascular disease (such as fusiform dilatations of the carotid artery49) and chronic neuroendocrine deficien',
  'Survival and late morbidity')

f('Doenca hepatica gordurosa nao alcoolica levando a cirrose hepatica foi relatada no craniofaringioma associado a obesidade hipotalamica morbida.',
  'ease leading to liver cirrhosis has been reported in CP associated with morbid hypothalamic obesity (obesity caused by damage to the hypothalamus)',
  'Survival and late morbidity')

f('A mortalidade global padronizada variou de 2,88 vezes a 9,28 vezes nos estudos de coorte publicados.',
  'The standardized overall mortality varied from 2.88fold to 9.28fold in published cohort studies;',
  'Survival and late morbidity')

f('Pacientes com craniofaringioma tem taxa de mortalidade cardiovascular associada a sindrome metabolica 3 a 19 vezes maior do que a populacao geral.',
  'patients with CP have a 3fold to 19fold increased rate of cardiovascular mortality associated with metabolic syndrome when compared with the general population',
  'Survival and late morbidity')

f('Um risco cardiovascular ainda maior foi observado em pacientes do sexo feminino com craniofaringioma, potencialmente causado por deficiencia de estrogenio devida a hipogonadismo secundario.',
  'An even higher cardiovascular risk rate was observed in female patients with CP56, potentially caused by oestrogen deficiency due to secondary hypogonadism.',
  'Survival and late morbidity')

# ===================== MECANISMOS ACP =====================
f('Os ACP mostram baixa taxa mutacional, com cerca de 15 mutacoes nao sinonimas por megabase.',
  'ACPs show a low muta tional rate with \\~15 non synonymous mutations per mega base',
  'Mechanisms/pathophysiology')

f('Multiplos estudos relataram falha em detectar mutacoes no exon 3 de CTNNB1 em uma parcela das amostras de ACP, possivelmente pela abordagem de sequenciamento e/ou pela baixa proporcao de tecido tumoral nessas amostras.',
  'Although multiple studies have reported a failure to detect CTNNB1 exon 3 mutations in a proportion of ACP samples, a find ing that may be due to the sequencing approach used and/or the low proportion of tumour tissue within these samples',
  'Mechanisms/pathophysiology')

f('Aberracoes genomicas, sejam perdas ou ganhos amplos, sao raras nos ACP: em um estudo, 5 de 14 tumores ACP mostraram genomas estaveis.',
  'In one study, 5 out of 14 ACP tumours showed stable genomes, with recurrent focal losses and gains observed in the remaining 9 tumours analysed;',
  'Mechanisms/pathophysiology')

f('Estudos imuno-histoquimicos revelaram celulas esporadicas com acumulo nucleocitoplasmatico de beta-catenina, isoladas ou em pequenos grupos chamados clusters celulares; a maioria das celulas tumorais mostra expressao membranosa normal de beta-catenina apesar de carregar mutacoes CTNNB1.',
  'Immunohistochemical studies have revealed the presence of sporadic cells showing nucleocytoplasmic accumulation of β catenin either as single cells through out the tumours or in small groups referred to as cell clusters9,58,59; most of the tumour cells show normal membranous expression of β catenin despite carrying CTNNB1 mutations.',
  'Mechanisms/pathophysiology')

f('As celulas que acumulam beta-catenina NAO foram observadas em nenhum outro tumor da regiao selar, incluindo os PCP, e frequentemente localizam-se na base das protrusoes digitiformes do epitelio tumoral que invadem os tecidos vizinhos.',
  'These β cateninaccumulating cells have not been observed in any other tumour of the sellar region, including PCPs60, and are often located at the base of the finger like protrusions of tumour epithelium that invade surrounding tissues',
  'Mechanisms/pathophysiology')

f('Nos modelos murinos, as celulas-tronco SOX2+ sao a celula de origem dos clusters, mas os tumores nao derivam delas: desenvolvem-se a partir de celulas SOX2-negativas transformadas de maneira paracrina pelas celulas do cluster derivadas de SOX2+.',
  'Surprisingly, the tumours of the inducible model do not derive from the SOX2+ stem cells that express oncogenic β catenin, but rather they develop from SOX2– cells that are transformed in a paracrine manner by the SOX2+ derived cluster cells',
  'Mechanisms/pathophysiology')

f('Os clusters secretam fatores de crescimento e citocinas, incluindo sonic hedgehog (SHH), IL-1, IL-6, EGF, FGF, WNTs, TGF-beta e proteinas morfogeneticas osseas, que ativam vias especificas nas celulas tumorais vizinhas.',
  'secrete a plethora of growth factors and cytokines, including sonic hedgehog (SHH), cytokines (such as IL1 and IL6) and growth factors (such as epidermal growth factor, fibroblast growth factor, WNTs, trans forming growth factor β and bone morphogenetic pro teins), among others, which activate specific pathways in surrounding nearby tumour cells',
  'Mechanisms/pathophysiology')

f('As celulas dos clusters no ACP murino e humano sao molecularmente equivalentes ao no do esmalte, um centro de sinalizacao critico no desenvolvimento dentario, o que explica as semelhancas historicas com o desenvolvimento dentario e a natureza calcificada dos ACP.',
  'cluster cells in both murine and human ACP have been shown to be molecularly equivalent to the enamel knot, a critical signalling centre during tooth development8, providing a molecular rationale for the long observed histologi cal similarities between ACPs, tooth development and dental tumours as well as a potential explanation for the calcified nature of ACPs',
  'Mechanisms/pathophysiology')

f('As celulas dos clusters exibem marcas de senescencia celular: viaveis mas nao proliferativas, expressao de inibidores do ciclo celular p16 (CDKN2A) e p21 (CDKN1A), compartimento lisossomal aumentado, dano de DNA e ativacao do SASP.',
  'cluster cells exhibit the hallmarks of cellular senescence, that is, viable but non proliferative; expression of cell cycle inhibitors such as p16 (encoded by CDKN2A) and p21 (encoded by CDKN1A); increased lysosomal compartment',
  'Mechanisms/pathophysiology')

f('A atenuacao genetica da resposta de senescencia e do SASP resulta em tumorigenese reduzida ou ausente nos modelos murinos de ACP.',
  'results in reduced or absent tumorigenesis85.',
  'Mechanisms/pathophysiology')

f('Os estudos de senescencia dao suporte ao uso de senoliticos, farmacos capazes de matar especificamente celulas senescentes, em pacientes com ACP.',
  'they provide evidence to support the use of ‘senolytics’, that is, drugs capable of specifically killing senescent cells, in patients with ACP',
  'Mechanisms/pathophysiology')

f('Concentracoes particularmente altas das citocinas IL-6, IL-8, CXCL1 e IL-10 foram relatadas no liquido cistico do ACP humano.',
  'ticularly high concen trations of the cytokines IL6, IL8, CXCL1 and IL10 have been reported in the cystic fluid of human ACP',
  'Mechanisms/pathophysiology')

f('O padrao de expressao de citocinas no ACP e compativel com ativacao do inflamassoma, possivelmente desencadeada pelos cristais de colesterol presentes no ACP humano.',
  'the pattern of cytokine expression has been shown to be compatible with inflammasome activation, possibly triggered by the cholesterol crystals present in human ACP',
  'Mechanisms/pathophysiology')

f('Os fatores imunossupressores IL-10, IDO1 e galectina-1 estao elevados no ACP humano, e PD-L1 e seu receptor PD-1 foram relatados no ACP e no PCP, podendo promover escape da vigilancia imune.',
  'the expression of the immunosuppressive factors IL10, indoleamine pyrrole 2,3dioxygenase (encoded by IDO1) and galectin1 (encoded by LGALS1) are elevated in human ACP, and programmed death ligand 1 (PD L1) and its receptor PD1 have been reported in ACP and PCP',
  'Mechanisms/pathophysiology')

# ===================== MECANISMOS PCP =====================
f('Os PCP tambem exibem baixa taxa mutacional (15 mutacoes por megabase) e, ate agora, nenhuma outra mutacao recorrente ou aberracao genomica foi identificada alem das mutacoes somaticas BRAFV600E.',
  'PCPs also exhibit a low mutational rate (15 mutations per megabase). So far, no other recurrent mutations or genomic aberrations have been identified except for somatic BRAFV600E mutations',
  'Mechanisms/pathophysiology')

f('A ativacao da via MAPK no PCP restringe-se a poucas celulas tumorais, as celulas basais que circundam os nucleos fibrovasculares, estruturas com estroma e vasos sanguineos revestidos por epitelio bem definido que sustenta o crescimento tumoral.',
  'but is restricted to a few tumour cells (namely, the basal cells surrounding the fibro vascular cores, which are structures containing stroma and blood vessels surrounded by a well defined lining epithelium that supports tumour growth)',
  'Mechanisms/pathophysiology')

f('Mais de 90% das celulas tumorais proliferativas do PCP (identificadas pela expressao de Ki67) estao contidas na populacao SOX2+, pERK1+/ERK2+.',
  'Interestingly, \\>90% of the proliferative tumour cells (identified by their expression of Ki67) are 0123456789(); contained within the SOX2+, pERK1+/ERK2+ cell popu lation,',
  'Mechanisms/pathophysiology')

f('O achado sugere que celulas-tronco SOX2+ normais da hipofise podem ser transformadas em celulas iniciadoras de PCP pela mutacao BRAFV600E via ativacao de MAPK.',
  'This finding suggests that normal SOX2+ stem cells in the pituitary gland may be transformed into PCP tumour initiating cells by BRAFV600E mutation via MAPK activation.',
  'Mechanisms/pathophysiology')

# ===================== DIAGNOSTICO =====================
f('A investigacao tipica do craniofaringioma deve envolver historia familiar e do paciente, avaliacao bioquimica e avaliacao neurorradiologica detalhada.',
  'Typical work up should involve a family and patient history, biochemical assessment and a detailed neuroradiological imaging assessment.',
  'Diagnosis, screening and prevention')

f('Os diagnosticos diferenciais potenciais do craniofaringioma incluem gliomas de baixo grau, tumores de celulas germinativas e cistos da bolsa de Rathke, frequentemente caracterizados por menores taxas de comprometimento visual, envolvimento hipotalamico e deficiencias endocrinas por menor volume da lesao ao diagnostico.',
  'Potential dif ferential diagnoses include low grade gliomas (LGGs), germ cell tumours (GCTs) and cysts of Rathke’s pouch, which are frequently characterized by lower rates of visual impairment, hypothalamic involvement and endocrine deficiencies due to smaller lesion volume at the time of diagnosis',
  'Diagnosis, screening and prevention')

f('Adenomas hipofisarios secretores tambem entram no diferencial, nos quais os sintomas causados pela hipersecrecao hormonal autonoma sao as manifestacoes clinicas dominantes.',
  'Additionally, secreting pituitary adenomas can be considered, in which symptoms caused by autonomous hormonal hypersecretion are leading clinical manifestations',
  'Diagnosis, screening and prevention')

f('Craniofaringiomas que se apresentam como achados incidentais sao raros, menos de 2% de todos os casos de CP.',
  'CPs presenting as incidental findings are rare (\\<2% of all CP cases)',
  'Clinical presentation')

f('As manifestacoes primarias do craniofaringioma incluem deficits endocrinos em 52 a 87% dos pacientes e comprometimento visual em 62 a 84%.',
  'Further primary manifestations are endocrine deficits (52–87% of patients) and visual impairments (62–84% of patients)',
  'Clinical presentation')

f('O tipo e o grau do comprometimento visual dependem da topografia anatomica do tumor em relacao a distorcao do quiasma optico.',
  'The type and degree of visual impairment depend on the anatomical tumour topography with regard to optic chiasm dis tortion.',
  'Clinical presentation')

f('As deficiencias endocrinas afetam a secrecao de GH em 75% dos pacientes.',
  'that affect growth hor mone (GH) secretion (75% of patients), gonadotropins',
  'Clinical presentation')

f('As deficiencias afetam as gonadotrofinas LH e FSH em 40% dos pacientes, o TSH em 25% e o ACTH em 25%.',
  '(namely, luteinizing hormone and follicle stimulating hormone; 40% of patients), thyroid stimulating hor mone (TSH; 25% of patients) and adrenocorticotropic hormone (ACTH; 25% of patients).',
  'Clinical presentation')

f('Deficits endocrinos sao a primeira manifestacao clinica na historia de 40 a 87% dos pacientes diagnosticados com craniofaringioma, incluindo diabetes insipidus central, observado em 17 a 27% dos pacientes antes do diagnostico.',
  'cits are the first clinical manifestation in the history of 40–87% of patients diagnosed with CP, including cen tral diabetes insipidus, which is observed in 17–27% of patients before diagnosis',
  'Clinical presentation')

f('Taxas de crescimento patologicamente reduzidas antes do diagnostico de ACP foram observadas em pacientes com apenas 12 meses de idade.',
  'Pathologically reduced growth rates before a diagnosis of ACP were observed in patients as young as 12 months of age',
  'Clinical presentation')

f('O ganho de peso significativo, preditivo de obesidade hipotalamica, tende a ocorrer como manifestacao tardia, pouco antes do diagnostico do ACP.',
  'Significant weight gain, predictive of hypothalamic obesity, tends to occur as a later manifestation, shortly before diag nosis of ACP.',
  'Clinical presentation')

f('Na doenca de inicio na idade adulta, a funcao sexual reduzida por deficiencia de gonadotrofinas hipotalamo-hipofisarias e hiperprolactinemia e um sintoma maior, nao observado na populacao pediatrica por causa do status pre-puberal.',
  'In adult onset disease, reduced sexual function, due to hypothalamic–pituitary gonadotropin deficiency and hyperprolactinaemia, is a major symp tom103,104, although not observed in the paediatric popu lation due to their prepubertal status.',
  'Clinical presentation')

f('Os sintomas tipicos do PCP de inicio na idade adulta sao pressao intracraniana alta e sintomas hipotalamicos, incluindo alteracoes psiquiatricas.',
  'typical symptoms of adult onset PCPs are high intra cranial pressure and hypothalamic symptoms, including psychiatric alterations',
  'Clinical presentation')

f('Houve correlacao positiva entre idade ao diagnostico e duracao da historia clinica, enquanto tamanho do tumor, grau de ressecao, envolvimento hipotalamico e IMC ao diagnostico NAO se associaram a duracao da historia.',
  'a positive correlation has been repor ted between patient age at diagnosis and duration of history, whereas tumour size, degree of resection, hypothalamic involvement and body mass index (BMI) at diagnosis were not associated with duration of history',
  'Clinical presentation')

f('Duracao mais curta de historia foi observada em pacientes com ACP que se apresentaram com hidrocefalia ao diagnostico, enquanto pacientes com deficits endocrinos ao diagnostico tiveram historia mais longa.',
  'Shorter duration of history was observed in patients with ACPs presenting with hydrocepha lus (increased intracranial pressure due to obstructed flow of cerebrospinal fluid (CSF) within the brain) at diagnosis. Patients presenting with endocrine deficits at ACP diagnosis had a longer duration of history,',
  'Clinical presentation')

f('A sindrome diencefalica, levando a perda de peso grave e caquexia, ocorre como disturbio hipotalamico raro da composicao corporal no craniofaringioma de inicio na infancia, em 4,3% de 485 pacientes do Registro Alemao de Craniofaringioma Infantil.',
  'diencephalic syn drome leading to severe weight loss and cachexia can also occur as a rare (4.3% of 485 patients recruited in the German Childhood Craniopharyngioma Registry) hypo thalamic disturbance of body composition in childhood onset CP',
  'Clinical presentation')

f('A sindrome diencefalica no momento do diagnostico do craniofaringioma NAO exclui ganho de peso durante o seguimento.',
  'However, diencephalic syn drome at the time of CP diagnosis does not preclude weight gain during follow up',
  'Clinical presentation')

# ===================== IMAGEM =====================
f('Na RM sem contraste, as partes solidas (incluindo tecido calcifico) e as paredes dos cistos podem mostrar sinais T1 variados, de hipointenso a hiperintenso.',
  'On MRI without contrast, the solid parts (including calcific tissue) and cyst walls of CPs, and ACPs in parti cular, may show a variety of T1 signals from hypo intense to hyperintense',
  'Neuroradiological characteristics')

f('Em imagens ponderadas em T2 os tumores sao usualmente hipointensos e hiperintensos, pela distribuicao heterogenea das calcificacoes e pela ampla variacao individual do sinal de RM das calcificacoes.',
  'On T2weighted images, the tumours are usually hypointense and hyperintense owing to the inhomogeneous distribution of calcifi cations and the broad individual variation of the MRI signal of calcifications',
  'Neuroradiological characteristics')

f('Confirmar a presenca ou ausencia de calcificacoes geralmente NAO e possivel por RM nos craniofaringiomas.',
  'Accordingly, confirming the presence or absence of calcifications is usually not possible by MRI in CPs.',
  'Neuroradiological characteristics')

f('As sequencias ideais para identificar calcificacoes sao as ponderadas em T2* ou as ponderadas por susceptibilidade, ambas prejudicadas pelo conteudo aereo dos seios da base do cranio central.',
  'the ideal sequences for the identification of calcifications are T2\\*weighted or susceptibility weighted sequences, both of which are hampered by the air content of the sinuses in the central skull base.',
  'Neuroradiological characteristics')

f('Apesar do desejo de evitar raios X em criancas, a TC e o padrao-ouro para identificar calcificacoes nessa area.',
  'despite the desire to avoid the use of X rays in children, CT is the gold standard for the identification of calcifications in this area',
  'Neuroradiological characteristics')

f('Mesmo que a RM pos-operatoria nao mostre suspeita de tumor residual, uma calcificacao residual pode permanecer nao detectada pela RM.',
  'Even if the postoperative MRI does not show suspi cion of a residual tumour, a residual calcification may remain undetected by MRI.',
  'Neuroradiological characteristics')

f('As diretrizes de imagem do estudo KRANIOPHARYNGEOM 2007 orientam realizar TC pos-operatoria sem contraste apenas da regiao tumoral, evitando os cristalinos, para revelar calcificacao persistente que a RM nao detectou, presumindo que calcificacao residual indica tumor residual.',
  'The guidelines for imaging in the ongoing CP study KRANIOPHARYNGEOM 2007 advise performing a postoperative, unenhanced CT of only the tumour region, avoiding the eye lenses110.',
  'Neuroradiological characteristics')

f('Calcificacoes residuais pequenas, menores que 2 mm, NAO levam necessariamente a taxa aumentada de recidiva em comparacao com sitios pos-operatorios sem calcificacoes residuais.',
  'However, small residual calcifications (\\<2 mm in size) do not necessarily lead to an increased rate of relapse compared with postoperative sites with out residual calcifications',
  'Neuroradiological characteristics')

f('Os cistos do craniofaringioma sao preenchidos por liquido oleoso (coloide) tipicamente secretado pelo epitelio tumoral e, por isso, sao altamente diagnosticos de ACP.',
  'The cysts are filled with an oily fluid (colloid) typically secreted by the tumour epithelium and are, therefore, also highly diagnostic of an ACP',
  'Neuroradiological characteristics')

f('No diferencial por imagem, os PCP sao majoritariamente solidos ou solido-cisticos combinados e arredondados, raramente contem calcificacoes, geralmente nao tem cistos com coloide e ocorrem sobretudo em adultos.',
  'PCPs are mostly solid or combined solid cystic round tumours, rarely contain calcifications, usually lack colloid filled cysts and occur mostly in adults',
  'Neuroradiological characteristics')

f('Poucos relatos descreveram metastase espinhal do craniofaringioma e localizacao ectopica, esta mais frequentemente observada ao longo do corredor da via de acesso cirurgico.',
  'Only few reports in the literature have described spinal metastasis of CP6 (Fig. 3h) and ectopic location, most frequently observed along the corridor of surgical approach',
  'Neuroradiological characteristics')

f('Foi observada metastase espinhal em nivel T12/L1 sete anos apos o diagnostico inicial de craniofaringioma adamantinomatoso.',
  'Spinal MRI reveals a spinal metastasis at level T12/L1 (arrow) 7 years after initial diagnosis of adamantinomatous craniopharyngioma.',
  'Figura 3')

f('Uma RM pre-operatoria acurada e importante para predizer a topografia exata do tumor e o tipo de aderencia ao hipotalamo, permitindo decisao cirurgica adaptada ao risco.',
  'An accurate preoperative MRI assessment is impor tant to predict the exact tumour topography117 and the type of tumour adherence to the hypothalamus for risk adapted decision making on surgical strategy',
  'Neuroradiological characteristics')

f('Sete variaveis fundamentais de RM cumprem esse objetivo: extensao da ocupacao do terceiro ventriculo, grau de distorcao da haste hipofisaria, posicao do hipotalamo em relacao ao tumor, extensao da ocupacao da cisterna quiasmatica, angulo dos corpos mamilares, tipo de distorcao do quiasma e forma do tumor.',
  'Assessment of seven fundamental MRI variables can fulfil this goal: extent of third ventricle occupation by the tumour, degree of pituitary stalk distortion, position of the hypothalamus in relation to the tumour, extent of chi asmatic cistern occupation, the mammillary body angle, the type of chiasm distortion and the tumour shape.',
  'Neuroradiological characteristics')

f('Hipotalamo posicionado em torno da porcao media do tumor, haste hipofisaria amputada pela lesao e forma tumoral eliptica ou multilobulada sao fortes preditores das topografias infundibulo-tuberal e secundariamente intraventricular, caracterizadas por aderencias fortes e extensas ao hipotalamo.',
  'Hypothalamus positioning around the middle portion of the tumour, a pituitary stalk amputated by the lesion and an elliptical or multilobulated tumour shape are strong predictors of the infundibulo tuberal and secon darily intraventricular topographies, characterized by strong and extensive CP adhesions to the hypothalamus.',
  'Neuroradiological characteristics')

f('Nos gliomas hipotalamico-quiasmaticos a idade de pico e cerca de 5 anos, com ambos os sexos afetados aproximadamente igualmente.',
  'for hypothalamic–chiasmatic gliomas, the peak age is \\~5 years, with both sexes being affected approximately equally',
  'LGGs and GCTs')

f('Os tumores de celulas germinativas, mais frequentemente germinomas, tem pico de incidencia na segunda decada de vida, mas tambem podem afetar adultos jovens, com forte predominancia masculina.',
  'GCTs (most frequently germi nomas) have their peak incidence in the second decade',
  'LGGs and GCTs')

f('Os gliomas de baixo grau sao principalmente solidos, podem conter cistos grandes na regiao suprasselar e tem sinal T2 muito hiperintenso com difusividade aumentada; na TC sao usualmente hipodensos ou isodensos.',
  'LGGs are mainly solid, can contain large cysts in the',
  'LGGs and GCTs')

f('O sinal hiperintenso fisiologico da neuro-hipofise (bright spot na RM T1 sem contraste, representando granulos secretores de ocitocina) e usualmente visivel nos gliomas de baixo grau, ao contrario dos craniofaringiomas, nos quais pode estar preservado ou ausente.',
  'pituitary gland (the so called bright spot on unenhanced T1weighted MRI, representing oxytocin secreting granula in the gland) is usually visible in LGGs, in con trast to CPs, in which the hyperintense signal of the posterior pituitary gland may be preserved or missing',
  'LGGs and GCTs')

f('A densidade de um tumor de celulas germinativas ou de um craniofaringioma e visivelmente maior na TC do que a dos gliomas de baixo grau; ambos tambem se associam frequentemente a hipofise atrofica na imagem.',
  'The density of a GCT or CP is visibly higher on CT than that of LGGs. GCTs and CPs are also frequently associated with an atrophic pituitary gland on imaging.',
  'LGGs and GCTs')

f('O sinal hiperintenso fisiologico da neuro-hipofise na RM T1 sem contraste esta usualmente AUSENTE nos tumores de celulas germinativas.',
  'cal hyperintense signal of the posterior pituitary gland on unenhanced T1weighted MRI is usually absent in GCTs',
  'LGGs and GCTs')

f('Os cistos da bolsa de Rathke sao lesoes pequenas, puramente cisticas, intrasselares e/ou suprasselares, que podem ser indistinguiveis de craniofaringiomas pequenos e puramente cisticos.',
  'Another important differential diagnosis for CPs are cysts of Rathke’s pouch, which are small, purely cystic lesions in the intrasellar and/or suprasellar area (Fig. 3l). These tumours may be indistinguishable from small, purely cystic CPs.',
  'Other sellar and parasellar lesions')

f('O xantogranuloma e uma lesao potencialmente pos-inflamatoria e, por isso, NAO esta incluida na classificacao da OMS dos tumores cerebrais; contem produtos de degradacao do sangue como metemoglobina, que torna o sinal T1 hiperintenso.',
  'Another non tumourous lesion in this area is the xanthogranu loma, which is a potentially post inflammatory lesion that is, consequently, not included in the WHO classi fication of brain tumours.',
  'Other sellar and parasellar lesions')

f('O coloide dos craniofaringiomas pequenos tem as mesmas caracteristicas de imagem na RM que o xantogranuloma; a ausencia de calcificacao foi proposta para diferencia-los, mas outros relatos nao confirmaram, lancando duvida sobre a utilidade das calcificacoes nesse diferencial.',
  'A Japanese group has reported that the absence of calcification is a possible means of differentiating xanthogranulomas from CPs127. Conversely, other reports could not confirm this obser vation94, casting doubt on the usefulness of calcifications in the differential diagnosis.',
  'Other sellar and parasellar lesions')

f('Adenomas hipofisarios sao lesoes incomuns na infancia; a idade de pico para microadenomas da adeno-hipofise (diametro menor que 10 mm) e 20 a 50 anos, e para macroadenomas (diametro maior que 10 mm) e 20 a 40 anos.',
  'The peak age for microadenomas of the adenohypophysis (diameter of \\<10 mm) is 20–50 years; for macroadenomas (diameter of \\>10 mm), the peak age is 20–40 years.',
  'Other sellar and parasellar lesions')

f('O principal sinal diagnostico que distingue macroadenomas de craniofaringiomas e a ausencia de identificacao separada da hipofise, ja que a massa e o adenoma da propria glandula.',
  'The main diag nostic sign of macroadenomas that distinguishes these lesions from CPs is the missing separate identification of the pituitary gland owing to the mass being the ade noma of the gland.',
  'Other sellar and parasellar lesions')

f('Macroadenomas maiores nao apenas se estendem superiormente pelo diafragma selar, mas frequentemente resultam em aparencia de boneco de neve causada por uma constricao da massa na abertura do diafragma selar.',
  'not only extend through the sellar diaphragm superiorly but often result in a snowman like appear ance caused by a constriction of the mass at the opening of the sellar diaphragm.',
  'Other sellar and parasellar lesions')

f('Nos microadenomas hipofisarios o sinal diagnostico e a presenca de uma ou mais de tres caracteristicas: rebaixamento do assoalho selar do lado correspondente, elevacao da borda superior da glandula do lado correspondente ou deslocamento em degrau da haste hipofisaria para o outro lado.',
  'the sign for diagnosis is the presence of one or a combination of the three following characteristics: a lowering of the floor of the sella on the respective side, a lifting of the upper border of the gland on the respective side or a ‘sidestep’ displacement of the pituitary stalk to the other side of the gland.',
  'Other sellar and parasellar lesions')

f('Microadenomas usualmente captam menos contraste que a hipofise normal e, por isso, sao mais bem detectados na RM pos-contraste.',
  'Usually, microadenomas take up contrast media 0123456789(); less than the normal pituitary gland and are, therefore, better detected on post contrast MRI128,129.',
  'Other sellar and parasellar lesions')

# ===================== GRADUACAO DE ENVOLVIMENTO HIPOTALAMICO =====================
f('Na anatomia normal, os nucleos do hipotalamo posterior localizam-se nas paredes laterais do terceiro ventriculo, comecando no nivel dos corpos mamilares e posteriormente a eles.',
  'In normal anatomy, the nuclei of the posterior hypothalamus are localized in the lateral walls of the third ventricle, beginning at the level of the mammil lary bodies and posterior to them',
  'Hypothalamic involvement')

f('Como os corpos mamilares sao facilmente identificaveis em cortes axiais e sagitais finos de RM, eles servem como pontos de referencia uteis para definir tamanho e categorizar a localizacao do tumor no pre-operatorio.',
  'As the mammillary bodies are easily identifiable on normal axial and thin sagittal slices on MRI, they provide useful reference points.',
  'Hypothalamic involvement')

f('Nos estudos alemaes KRANIOPHARYNGEOM 2000 e 2007, a RM pre-operatoria definiu tres graus de envolvimento hipotalamico: grau 0 sem contato com o assoalho do terceiro ventriculo.',
  'Grade 0 CPs have no contact with the floor of the third ventricle.',
  'Hypothalamic involvement')

f('Os craniofaringiomas grau 1 tem contato com ou comprimem o hipotalamo anteriormente aos corpos mamilares.',
  'Grade 1 CPs have contact with or compress the hypothal amus anterior to the mammillary bodies.',
  'Hypothalamic involvement')

f('Os craniofaringiomas grau 2 sao aqueles que resultam em deslocamento, compressao ou destruicao do hipotalamo, incluindo os corpos mamilares ou a area dorsal a eles.',
  'Grade 2 CPs are those resulting in a dislocation, compression or destruc tion of the hypothalamus, including the mammillary bodies or the area dorsal to them',
  'Hypothalamic involvement')

f('Uma limitacao dos sistemas de graduacao publicados e a dependencia de criterios subjetivos para diferenciar os graus 1 e 2.',
  'a reliance on subjective criteria for the differentiation between grades 1 and 2 is a limitation',
  'Hypothalamic involvement')

f('Armadilha de classificacao: um craniofaringioma com cisto volumoso no espaco selar pode esconder pequena area calcificada ou solida no infundibulo e ser incorretamente classificado como grau 0; removido o cisto, o grau pode ser refinado para grau 1.',
  'For example, a CP with a voluminous cyst in the sellar space may hide a small calcified or solid area within the infundibulum and may be incorrectly classified as grade 0. Once the cyst is removed, the grade may be refined to grade 1 as there is a slight involvement of the anterior hypothalamus but the remaining hypothalamus is intact.',
  'Hypothalamic involvement')

f('O grau estimado no pre-operatorio precisa ser refinado pelos achados cirurgicos perioperatorios, de modo que a classificacao em tres graus parece requerer maior esclarecimento.',
  'That is, the preoperative estimated grade has to be refined by the perioperative surgical findings. Accordingly, classification in three grades seems to require further clarification.',
  'Hypothalamic involvement')

# ===================== PROGNOSTICO =====================
f('Obesidade grave no craniofaringioma de inicio na infancia foi definida como IMC maior ou igual a 7 desvios-padrao decorrente de sindrome hipotalamica.',
  'patients with childhood onset CP who developed severe obesity (BMI of ≥7 s.d.) due to hypothalamic syndrome received',
  'Prognosis')

f('Os pacientes com obesidade grave receberam mais intervencoes cirurgicas, em media 1,74 (variacao de 1 a 4).',
  'more surgical interventions (mean 1.74; range 1–4)',
  'Prognosis')

f('Os pacientes com peso normal mostraram maior capacidade funcional e receberam em media 1,39 intervencoes cirurgicas (variacao de 1 a 5).',
  'weight patients (mean number of surgical interventions ventions per patient, used as a surrogate for the local 1.39; range 1–5)135.',
  'Prognosis')

f('A estrategia cirurgica poupadora do hipotalamo aumentou a taxa de IMC normal a longo prazo de 17% para 38% em comparacao com a ressecao total macroscopica previamente realizada.',
  'egy increased the rate of ‘normal’ long term BMI from tumours that may be completely resected without neuro 17% to 38% compared with previously performed GTR.',
  'Prognosis')

f('O percentual de ganho de peso clinicamente relevante permaneceu em 62% apos intervencao poupadora do hipotalamo.',
  'gain remained at 62% after a hypothalamus sparing',
  'Prognosis')

f('Cerca de 50% de todos os pacientes, independentemente da intervencao cirurgica, desenvolveram obesidade morbida.',
  'intervention, with \\~50% of all patients (regardless of',
  'Prognosis')

f('Obesidade morbida foi definida como IMC acima de 2 desvios-padrao, durante seguimento medio de 8,5 anos.',
  'of \\>2 s.d.) during a mean follow up of 8.5 years in the',
  'Prognosis')

f('O seguimento medio foi mais curto na coorte poupadora do hipotalamo, de 3 anos, do que na coorte de ressecao total macroscopica.',
  'GTR cohort and 3 years in the hypothalamus sparing',
  'Prognosis')

f('O numero medio de intervencoes cirurgicas por paciente, usado como substituto da taxa de recorrencia local, nao diferiu notavelmente entre os grupos: 1,52 na estrategia poupadora do hipotalamo versus 1,45 no grupo de ressecao total macroscopica.',
  'two groups (1.52 in the hypothalamus sparing strategy type is controversial. Better 5year overall survival has group versus 1.45 in the GTR group).',
  'Prognosis')

f('O seguimento foi marcadamente mais curto no grupo poupador do hipotalamo (media 33 meses) do que no grupo historico tratado por ressecao total macroscopica (media 103 meses).',
  'strategy group (mean 33 months) than in the historical increased perioperative mortality has been described group treated by GTR (mean 103 months).',
  'Prognosis')

f('A sobrevida global em 20 anos foi reduzida em pacientes com craniofaringioma com envolvimento hipotalamico.',
  'In another report, 20year overall sur differences between both histological subtypes42. No vival was shown to be reduced in patients with CP with specific histopathological feature can thus far predict hypothalamic involvement139.',
  'Prognosis')

f('A sobrevida livre de progressao em 20 anos NAO se associou ao grau de ressecao cirurgica nem ao uso adjuvante de radioterapia.',
  'found that 20year progression free survival was not cohort, CPs lacking calcifications have been described to associated with the degree of surgical resection and be associated with more favourable prognoses, reflecting not related with the adjuvant use of radiotherapy, sup',
  'Prognosis')

f('Isso apoia a nocao de que a ressecao total macroscopica NAO traz vantagem em termos de prevenir a recorrencia do craniofaringioma.',
  'porting the notion that GTR has no advantage in terms able calcifications, as mentioned above136. Whether ini of preventing CP recurrence.',
  'Prognosis')

f('Em coorte de craniofaringioma de inicio na idade adulta, os CP sem calcificacoes foram descritos como associados a prognostico mais favoravel, refletindo o maior risco de recorrencia com calcificacoes detectaveis no pos-operatorio.',
  'cohort, CPs lacking calcifications have been described to associated with the degree of surgical resection and be associated with more favourable prognoses, reflecting',
  'Prognosis')

f('Nenhuma caracteristica histopatologica especifica consegue, ate agora, predizer a sobrevida apos craniofaringioma de inicio na infancia.',
  'specific histopathological feature can thus far predict',
  'Prognosis')

f('No ACP de inicio na idade adulta descreveu-se mortalidade perioperatoria aumentada em comparacao ao PCP e ao ACP de inicio na infancia, mas outros relatos nao confirmaram essas diferencas prognosticas entre os subtipos histologicos.',
  'increased perioperative mortality has been described',
  'Prognosis')

# ===================== MANEJO =====================
f('O melhor tratamento para o craniofaringioma e aquele que leva a menor morbidade a longo prazo; pode incluir cirurgia isolada, irradiacao isolada ou, mais comumente, a combinacao das duas.',
  'CP is that which leads to the least long term morbidity.',
  'Management')

f('O tratamento pode incluir cirurgia isolada, irradiacao isolada ou, mais comumente, a combinacao das duas.',
  'Treatment may include surgery alone, irradiation alone',
  'Management')

f('A cirurgia isolada implica ressecao total macroscopica e, portanto, e apropriada para tumores que podem ser completamente ressecados sem lesao neurovascular e sem comprometimento visual.',
  'alone implies GTR and is, therefore, appropriate for',
  'Management')

f('Na populacao pediatrica, o envolvimento hipotalamico pre-operatorio aumenta a probabilidade de obesidade pre e pos-operatoria, e o dano hipotalamico durante a cirurgia aumenta o risco de ganho de peso pos-operatorio.',
  'In the paediatric population, preoperative hypothalamic',
  'Management')

f('Evitar dano hipotalamico irreversivel e um objetivo chave no tratamento do craniofaringioma.',
  'Accordingly, avoiding irreversible hypothalamic damage is a key goal in the treatment of CP.',
  'Management')

f('Uma cirurgia estagiada pode ser considerada em tres situacoes: cisto grande com sinais de hipertensao intracraniana (cateter antes da ressecao); CP desenvolvido abaixo e acima do hipotalamo, exigindo pelo menos duas abordagens; ou crianca com CP grau 2 abaixo da idade razoavel para terapia com protons.',
  'A staged surgery may be considered in three cases: when there is a large cyst with signs of raised intracranial pressure, a catheter can be placed before surgical resection of the remaining CP; when the CP is developed below and above the hypothalamus, leading to at least two different approaches; or when a child with a grade 2 CP is under a reasonable age for proton beam therapy, several surgeries may be necessary to postpone the time for irradiation.',
  'Box 1')

f('A maioria concorda que a primeira tentativa de ressecao e frequentemente o melhor momento para alcancar a ressecao completa.',
  'Most agree that the first attempt at resection is often the best time to achieve complete resection',
  'Box 1')

f('Se a haste hipofisaria puder ser preservada, a ressecao total macroscopica leva a diabetes insipidus em 50% dos pacientes; se a haste for sacrificada, o diabetes insipidus e consequencia inevitavel.',
  'If the pituitary stalk can be preserved, GTR leads to diabetes insipidus in 50% of patients22; if the stalk is sacrificed, diabetes insipidus is an inevitable consequence.',
  'Box 1')

f('Qualquer tumor pode ser removido, porem os riscos podem ser inaceitaveis; o uso apropriado da ressecao total macroscopica depende fortemente da selecao do paciente.',
  'Ultimately, any tumour can be removed; however, the risks may be unacceptable.',
  'Box 1')

# ===================== ABORDAGEM POR GRAU =====================
f('Nos craniofaringiomas grau 0 nao ha envolvimento hipotalamico e a maioria dos tumores ocupa o espaco subdiafragmatico; a abordagem endoscopica endonasal e ideal nesses casos e e comumente usada em adultos.',
  'is no hypothalamus involvement and most tumours',
  'Grade 0 hypothalamic involvement')

f('Em criancas, a abordagem endoscopica endonasal, na qual o tumor e removido pela via nasal transesfenoidal, teve indicacoes ampliadas pelo progresso na cirurgia reconstrutiva, com o uso de retalho nasosseptal que reduz a ocorrencia de fistula liquorica.',
  'structive surgery, whereby the use of a nasoseptal flap decreases the occurrence of CSF leak',
  'Grade 0 hypothalamic involvement')

f('A neuronavegacao superou os problemas de seio esfenoidal nao pneumatizado ou distancia intercarotidea curta, especialmente em criancas.',
  'has overcome the problems of non pneumatized sphe',
  'Grade 0 hypothalamic involvement')

f('Nos craniofaringiomas grau 1 o tumor empurra ou comprime o hipotalamo, e a ressecao total macroscopica pode ser feita se houver plano cirurgico de disseccao a partir do assoalho do terceiro ventriculo, desde que o neurocirurgiao seja habil e a topologia do CP permita.',
  'GTR can be performed if there is a surgical plan for dis',
  'Grade 1 hypothalamic involvement')

f('Para tumores que se desenvolvem no terceiro ventriculo, recomenda-se abordagem transcraniana, especialmente em criancas.',
  'recommended, especially in children100,152.',
  'Grade 1 hypothalamic involvement')

f('Nos craniofaringiomas grau 2 as estruturas hipotalamicas nao podem ser claramente identificadas por causa da invasao tumoral.',
  'the hypothalamic structures cannot be clearly identi',
  'Grade 2 hypothalamic involvement')

f('Os tumores grau 2 representam 40 a 70% dos ACP em diferentes series.',
  'represent 40–70% of ACPs in different series',
  'Grade 2 hypothalamic involvement')

f('As vias transcranianas mais frequentes sao transcalosa, transcortical frontal, pterional e abordagens subfrontais unilaterais ou bilaterais.',
  'The most frequent transcranial routes are transcallosal,',
  'Grade 2 hypothalamic involvement')

f('A abordagem endoscopica endonasal NAO e recomendada para tumores grau 2, exceto em casos raros, porque e muito dificil preservar com seguranca estruturas hipotalamicas invadidas.',
  'The EEA is not recommended for grade 2 tumours, except in some rare cases, because it is very difficult to safely preserve invaded hypothalamic structures159;',
  'Planned surgical resection')

f('Atravessar o assoalho do terceiro ventriculo envolvido parece menos deleterio em adultos do que em criancas.',
  'however, crossing the involved third ventricle floor seems less deleter ious in adults than in children',
  'Planned surgical resection')

f('A endoscopia pode ser usada em combinacao com a microcirurgia para olhar ao redor dos cantos e maximizar a ressecao segura.',
  'However, endoscopy can be used in combination with microsurgery to look ‘around the corners’ and maximize safe resection.',
  'Planned surgical resection')

f('Uma categorizacao abrangente da aderencia do craniofaringioma foi proposta; os CP associados ao pior desfecho foram os com aderencia hipotalamica ao assoalho e as paredes do terceiro ventriculo.',
  'CPs associated with the worst outcome were those that had a hypothalamic adhesion (to the third ventricle floor and its walls).',
  'Management')

# ===================== EMERGENCIA =====================
f('Hipertensao intracraniana e/ou perda visual sao indicacoes de descompressao cirurgica urgente; nesses casos os sinais frequentemente refletem hidrocefalia biventricular pela presenca do tumor no terceiro ventriculo.',
  'Raised intracranial pressure and/or vision loss are indi',
  'Emergency surgery')

f('Havendo componentes cisticos, o problema pode ser corrigido colocando um cateter intracistico e, depois, um reservatorio de Ommaya, para permitir aspiracao repetida do liquido coloide ou administrar terapia intracistica.',
  'of cystic components at this level, the problem can be corrected by placing an intracystic catheter and, later, an',
  'Emergency surgery')

f('Em caso de hidrocefalia, uma derivacao (shunt) deve ser evitada como primeira opcao, pois pode levar a ventriculos em fenda e complicar cirurgia subsequente por via ventricular.',
  'cephalus, a shunt should be avoided as a first option, as',
  'Emergency surgery')

f('Em caso de compressao do quiasma optico com perda visual por componente solido ou calcificado, ou por massa tumoral obstruindo o terceiro ventriculo, a abordagem cirurgica direta e a unica opcao possivel.',
  'In case of optic chiasm compression with visual loss by a',
  'Emergency surgery')

# ===================== TERAPIAS INTRACISTICAS =====================
f('Os tratamentos intracisticos sao alternativa a ressecao cirurgica em pacientes bem selecionados com ACP puro ou principalmente monocistico, sendo particularmente uteis nos pacientes mais jovens para adiar a radioterapia, e devem ser feitos apenas por equipes multidisciplinares experientes.',
  'Intracystic treatments are an alternative option to surgi cal resection in well selected patients with pure or mainly monocystic ACP.',
  'Intracystic therapies')

f('O tratamento intracistico com interferon alfa oferece a melhor relacao beneficio-risco, mas limita-se a porcao cistica, sem efeito sobre o componente solido do tumor.',
  'interferon α (IFNα) provides the best benefit torisk',
  'Intracystic therapies')

f('Uma revisao internacional recente de 56 criancas mostrou progressao em 42 pacientes com tratamento com interferon alfa apos tempo mediano de 14 meses.',
  'national review of 56 children showed progression in 42 patients with IFNα treatment after a median time of 14 months',
  'Intracystic therapies')

f('Agentes de radioterapia (Ytrio-90 e Fosforo-32) ou quimioterapia (bleomicina) podem ser usados por via intracistica.',
  'Additionally, radiotherapy agents (90Yttrium and when planning a surgical strategy. 32Phosphorus) or chemotherapy (bleomycin) can be used intracystically, but these agents may be associated',
  'Intracystic therapies')

f('Esses agentes intracisticos podem associar-se a neurotoxicidade irreversivel ou ate a morte e NAO provaram ser consistentemente eficazes.',
  'with irreversible neurotoxicity or even death and have is no hypothalamus involvement and most tumours not proven to be consistently efficacious.',
  'Intracystic therapies')

f('Em revisao recente, a evidencia disponivel NAO conseguiu sustentar o uso de bleomicina intracistica em criancas.',
  'recent review, the available evidence could not support in these cases and is commonly used in adult patients the use of intracystic bleomycin in children on the basis',
  'Intracystic therapies')

f('Ate o momento, os estudos sobre terapias intracisticas sao pequenos e com poder estatistico insuficiente, com dados limitados para sustentar seu uso.',
  'intracystic therapies are small and underpowered, with',
  'Intracystic therapies')

# ===================== DANO HIPOTALAMICO POS-OPERATORIO =====================
f('A classificacao de de Vile, dividida em tres graus, caracteriza a gravidade do dano hipotalamico pos-operatorio conforme as anormalidades e defeitos no assoalho do terceiro ventriculo.',
  'Divided into three grades, the system characterizes the severity of the damage depending on the post operative abnormalities and defects in the floor of the third ventricle',
  'Postoperative hypothalamic damage')

f('A taxa de obesidade pos-operatoria grave associa-se ao grau de dano hipotalamico.',
  'The rate of severe postoperative obesity is associated with the grade of hypothalamic damage',
  'Postoperative hypothalamic damage')

f('Na graduacao de dano hipotalamico pos-operatorio, ausencia de dano discernivel as estruturas hipotalamicas corresponde a estabilizacao da evolucao ponderal, com IMC de 1,10 desvios-padrao (0,1 a 1,3 DP).',
  'No discernible damage to hypothalamic structures Stabilization of weight development • BMI: 1.10 s.d. (0.1–1.3 s.d.)',
  'Figura 5')

f('Anormalidade do assoalho do terceiro ventriculo e/ou brecha no tuber cinereum corresponde a ganho de peso, com IMC de 2,5 desvios-padrao (1,4 a 3,5 DP).',
  'Abnormality of the floor of the third ventricle and/or a breach in the tuber cinereum Weight gain • BMI: 2.5 s.d. (1.4–3.5 s.d.)',
  'Figura 5')

f('Assoalho do terceiro ventriculo completamente deficiente ou extensamente rompido por tumor residual corresponde a obesidade grave, com IMC de 5,5 desvios-padrao (4,3 a 8,8 DP).',
  'Floor of the third ventricle completely deficient or extensively breached by residual tumour Severe obesity • BMI: 5.5 s.d. (4.3–8.8 s.d.)',
  'Figura 5')

f('No grau 2 de de Vile os defeitos alcancam os corpos mamilares e envolvem o hipotalamo e o tuber cinereum; o dano hipotalamico resulta em ganho de peso e desenvolvimento de obesidade hipotalamica.',
  'For example, in grade 2, the defects reach the mammillary bodies and involve the hypothalamus and tuber cinereum. Hypothalamic damage results in weight gain and the development of hypothalamic obesity.',
  'Figura 5')

f('Apos qualquer cirurgia, ninhos celulares podem ser deslocados do sitio tumoral original para o trajeto de acesso e implantacao, e metastases, embora raras, podem ser a consequencia.',
  'after any surgery, cell nests might be displaced from the original tumour site into the tract of access and implantation, and ‘metastases’, although rare, may be the consequence',
  'Postoperative hypothalamic damage')

# ===================== RADIOTERAPIA =====================
f('A cirurgia isolada pode nao ser apropriada para tumores que invadiram o hipotalamo; nesses casos a radioterapia, tipicamente externa com fotons ou protons, pode ser usada isolada ou combinada a cirurgia limitada.',
  'Surgery alone may not be appropriate for tumours that have invaded the hypothalamus134. Instead, radio therapy — typically with external beam radiotherapy using photons or protons168 — can be used alone or in combination with limited surgery.',
  'Radiotherapy')

f('As taxas de controle tumoral apos radioterapia com cirurgia limitada ou sem cirurgia sao semelhantes as da ressecao total macroscopica ou da ressecao incompleta com radioterapia, com sobrevida global em 10 anos estimada acima de 90% pelos dados SEER dos EUA.',
  'Tumour control rates after radiotherapy with limited or no sur gery are similar to control rates of GTR or incomplete resection with radiotherapy, with a \\> 90% 10year overall survival estimated from US Surveillance, Epidemiology, and End Results (SEER) data',
  'Radiotherapy')

f('A analise dos dados SEER nao correlacionou desfechos funcionais ao tratamento nem incluiu grande proporcao de criancas tratadas com radioterapia definitiva.',
  'the SEER data analysis did not match functional outcomes to treatment or include a large proportion of children treated with definitive radiotherapy.',
  'Radiotherapy')

f('A cirurgia limitada com radioterapia e apropriada para a maioria dos pacientes, independentemente da idade e do tipo tumoral, e inclui ressecao parcial, fenestracao ou aspiracao de cisto (embora o liquido possa reacumular), colocacao de cateter e reservatorio de Ommaya, ou derivacao liquorica.',
  'Limited surgery includes partial resection, cyst fenestration or aspiration (although the fluid may reaccumulate), catheter and Ommaya reser voir placement, or CSF diversion (to restore CSF flow).',
  'Radiotherapy')

f('O diabetes insipidus deve ser considerado uma complicacao nao antecipada da cirurgia limitada.',
  'but diabetes insipidus should be consid ered as an unanticipated complication.',
  'Radiotherapy')

f('A extensao da ressecao pode ser minimizada ao necessario para atingir os objetivos do procedimento, porque a quantidade de tumor residual NAO demonstrou influenciar o controle tumoral apos a radioterapia.',
  'The extent of resection can be minimized to the amount required to achieve the goals of the procedure because the amount of residual tumour has not been shown to influence tumour control after radiotherapy',
  'Radiotherapy')

f('O planejamento da radioterapia requer dispositivos de imobilizacao customizados para posicionar o paciente de forma reprodutivel a cada sessao, TC com ou sem contraste para calcular a matriz de radiacao e, idealmente, RM como base para o tumor cistico e solido.',
  'tion devices to reproducibly position the patient at each',
  'Radiotherapy')

f('Independentemente da modalidade de radioterapia, o eixo hipotalamo-hipofisario, os nervos opticos e o quiasma, os componentes principais da circulacao cerebral e partes do tronco encefalico recebem a dose de prescricao na maioria dos casos.',
  'Regardless of modality, the hypothalamic–pituitary axis, optic nerves and chiasm, the principle components of cere bral circulation, and portions of the brainstem receive',
  'Radiotherapy')

f('Relatos preliminares da terapia com protons de primeira geracao (espalhamento passivo) sugeriram que a taxa e o padrao de falha e as taxas de necrose, vasculopatia e complicacoes neurologicas graves foram equivalentes a terapia com fotons.',
  'preliminary reports of first generation proton beam therapy (passive scatter) suggested that the rate and pattern of failure, and rates of necrosis, vasculopathy and severe neurological complications, were equivalent to photon therapy',
  'Radiotherapy')

f('Corrigidos para a distribuicao de dose no cerebro normal, os tratados com protons nao tiveram mudanca nos escores de desempenho academico (leitura e matematica), enquanto os tratados com fotons mostraram declinio significativo.',
  'those treated with proton therapy had no change in academic achievement scores (reading and math) compared with patients treated with photon therapy, who showed a significant decline',
  'Radiotherapy')

f('A dose total de irradiacao no craniofaringioma e geralmente de 50 a 54 CGE, administrada em doses divididas 5 dias por semana ao longo de 6 semanas.',
  'lowering the total dose of irradiation, which is generally 50–54 CGE administered in divided doses 5 days per week over 6 weeks.',
  'Radiotherapy')

f('Projetar um ensaio para reduzir ou escalonar apropriadamente a dose de radiacao no craniofaringioma e dificultado pelo numero limitado de pacientes e pelo numero ainda menor de eventos apos a irradiacao.',
  'Designing a trial to appropriately reduce or escalate radiation dose in CP is made difficult by the limited number of patients and even smaller number of events after irradiation.',
  'Radiotherapy')

f('Qualquer tratamento, procedimento, complicacao ou medicacao que aumente a pressao intracraniana ou reduza o fluxo sanguineo (cirurgia, colocacao ou revisao de shunt, hidrocefalia, anestesia ou sedacao prolongada) ou que sensibilize o cerebro aos efeitos da radiacao pode aumentar o risco e a gravidade dos efeitos adversos.',
  'Any treatment, procedure, complication or medication that results in increased intracranial pressure or reduced blood flow (surgery, shunt placement or revision, hydrocephalus, prolonged anaesthesia or sedation) or sensitizes the brain to the effects of radiation (certain medications, nutritional supplements or chemotherapy agents) may increase the risk and severity of adverse effects.',
  'Box 3')

f('Os efeitos adversos de curto prazo da radioterapia podem incluir nausea, vomito, cefaleia, fadiga e perda de apetite, alem de queda de cabelo correspondente aos pontos de entrada e saida dos feixes.',
  'Short- term adverse effects may include nausea, vomiting, headache, fatigue and loss of appetite. Hair loss corresponding to the entrance and exit points of radiation beams may occur.',
  'Box 3')

f('Os efeitos adversos de curto prazo geralmente aumentam ao longo do tratamento, podem ser tratados e cedem ao fim dele; porem alguns podem persistir, especialmente a fadiga.',
  'treatment course, can be treated and subside at the completion of treatment; however,',
  'Box 3')

f('A radioterapia pode afetar a funcao cognitiva, especificamente memoria, atencao, aprendizado, comportamento, capacidade academica, inteligencia geral e desempenho global no trabalho ou na escola.',
  'Radiotherapy may affect cognitive function — specifically memory, attention, learning, behaviour, academic ability, general intelligence and overall performance in work or school.',
  'Box 3')

f('Perda auditiva e possivel quando qualquer porcao do aparelho auditivo esta incluida no volume tratado, e perda visual pode ocorrer, ainda que raramente, apesar de doses de radiacao inferiores a tolerancia dos nervos opticos e do quiasma.',
  'can develop, hearing loss is possible when any portion of the hearing apparatus (middle and inner ear or brainstem) is included in the treated volume, and vision loss can occur, although rarely, despite radiation doses being lower than the tolerance of the optic nerves and chiasm.',
  'Box 3')

f('Apesar de as doses de radiacao usadas serem geralmente aceitas como seguras, pode ocorrer necrose levando a dano neurologico permanente ou morte; os riscos de vasculopatia e AVC sao baixos e o risco de neoplasias secundarias nao pode ser evitado.',
  'Although the doses of radiation used are generally accepted as safe, necrosis can occur and lead',
  'Box 3')

# ===================== PCP: MANEJO =====================
f('Os PCP representam apenas 10% de todos os craniofaringiomas, com menos de 25 casos descritos na populacao pediatrica.',
  'Although they represent only 10% of all CPs (with \\<25 cases described in the paediatric population172), the PCP type harbours a few specificities compared with their ACP counterparts,',
  'PCPs')

f('Em estudo retrospectivo com dados cirurgicos de 500 craniofaringiomas, os PCP tipicamente se apresentaram como massas solidas sem calcificacoes ou com calcificacoes raras, com aderencias mais frouxas e insercao predominantemente sessil ou pediculada (63%) no revestimento interno do terceiro ventriculo.',
  'In a retrospective study with surgical data of 500 CPs, PCPs typically presented as solid masses with no or rare calcifications, had more ‘loose’ adhesions and predominantly had a sessile or pedicle attachment (63%) in the inner lining of the third ventricle of the brain, compared with ACPs, which were associated with the widest and strongest adherence',
  'PCPs')

f('Os PCP tem menos aderencia as estruturas hipotalamicas que os ACP, o que poderia, em teoria, favorecer uma ressecao total macroscopica melhor e mais segura.',
  'PCPs are rare tumours, with less adherence to the hypothalamic structures than the ACPs, which could, in theory, favour better and safer GTR.',
  'PCPs')

f('Revisao sistematica e metanalise de adultos com craniofaringioma (34,3% com PCP) mostrou NENHUMA diferenca estatistica nas taxas de recorrencia entre tratados com ressecao total macroscopica (17%) e tratados com ressecao incompleta seguida de radioterapia (27%).',
  'A systematic review and meta analysis of adult patients with CP (34.3% of whom had PCP) showed no statistical difference in rates of recurrence between those treated with GTR (17%) and those treated with incom plete resection followed by with radiotherapy (27%)',
  'PCPs')

f('As opcoes atuais de tratamento para PCP e ACP sao semelhantes, porem a grande maioria dos PCP alberga a mutacao BRAFV600E, que e alvo tratavel e abre perspectivas promissoras.',
  'Indeed, the current treatment options for PCP and ACP are similar. However, the vast major ity of PCPs harbour the BRAFV600E targetable mutation11, which offers new promising perspectives for treatment of this subtype',
  'PCPs')

# ===================== DEFICIENCIAS ENDOCRINAS =====================
f('As deficiencias endocrinas do eixo hipotalamo-hipofisario resultam na necessidade de substituicao hormonal por toda a vida.',
  'axis result in the necessity of lifelong hormonal substitu',
  'Endocrine deficiencies')

f('Deficiencias de hormonios hipofisarios foram relatadas em 54 a 100% dos pacientes com craniofaringioma.',
  'Pituitary hormone deficiencies have been reported in 54–100% of patients177,178;',
  'Endocrine deficiencies')

f('No pos-operatorio, a deficiencia de ACTH ocorre em 55 a 88% dos pacientes, de GH em 88 a 100%, de TSH em 39 a 95%, de gonadotrofinas em 80 a 95% e de arginina-vasopressina em 25 a 86%.',
  'postoperative ACTH defi ciency occurs in 55–88% of patients, GH in 88–100% of patients, TSH in 39–95% of patients, gonadotropins in 80–95% of patients and arginine vasopressin in 25–86% of patients.',
  'Endocrine deficiencies')

f('Em caso de substituicao hormonal insuficiente sao comuns efeitos adversos graves, como baixa estatura (na deficiencia de GH), ou situacoes de emergencia com risco de vida, como crise adrenal com reducoes dramaticas do cortisol (na deficiencia de ACTH).',
  'In case of insufficient hormone substitution, severe adverse effects such as short stature (for GH defi',
  'Endocrine deficiencies')

f('A terapia de substituicao com GH recombinante e segura quanto aos riscos de progressao e recorrencia tumoral.',
  'Substitution therapy with recombinant GH is safe with regard to risks of tumour progression and recur rence',
  'Endocrine deficiencies')

f('A qualidade de vida pareceu estabilizada em pacientes com ACP tratados com GH durante seguimento de curto prazo de 3 anos, enquanto efeitos beneficos do GH sobre o desenvolvimento da obesidade hipotalamica NAO foram observados nos primeiros 3 anos apos o diagnostico.',
  'QOL seemed to be stabilized in GH treated patients with ACP during short term follow up of 3 years, whereas beneficial GH effects on the develop ment of hypothalamic obesity were not observed during the first 3 years after diagnosis',
  'Endocrine deficiencies')

f('No seguimento de longo prazo (avaliado mais de 12 anos apos o diagnostico), pacientes com ACP tratados com GH durante a infancia mostraram melhor qualidade de vida, estatura e evolucao ponderal do que aqueles em que a substituicao de GH foi iniciada na vida adulta.',
  'term follow up (assessed \\>12 years after diagnosis), complications arising from the tumour or previous treatment. Hormone deficiencies',
  'Endocrine deficiencies')

f('A substituicao endocrina dos eixos hipotalamo-hipofisarios deficientes para GH, TSH, gonadotrofinas e ACTH e segura e eficiente em termos de recorrencia tumoral, qualidade de vida e suplementacao hormonal.',
  'tution of deficient hypothalamic–pituitary axes for GH180–182, TSH42, gonadotropins42 and ACTH139 is safe and efficient in terms of tumour recurrence, QOL and hormonal supplementation.',
  'Endocrine deficiencies')

f('Sao prioritarias as deficiencias endocrinas com risco de vida que exigem terapia de reposicao diaria: hipotireoidismo central, insuficiencia adrenal central e diabetes insipidus central.',
  'endocrine deficiencies that require daily replacement',
  'Quality of life')

# ===================== OBESIDADE HIPOTALAMICA =====================
f('Por comprometimento da regulacao da saciedade, do gasto energetico e do fluxo simpatico central, pacientes com craniofaringioma e sindrome hipotalamica tipicamente desenvolvem obesidade morbida.',
  'Due to impairments in satiety regulation, energy expenditure and central sympathetic output, patients with CP who have hypo',
  'Hypothalamic obesity')

f('Esses pacientes podem ter predominancia parassimpatica por ativacao vagal, que se manifesta com reducao da temperatura corporal, reducao da frequencia cardiaca e aumento da sonolencia diurna.',
  'predominance due to vagal activation, which manifests',
  'Hypothalamic obesity')

f('A obesidade hipotalamica e usualmente nao responsiva a esforcos convencionais como modificacoes de estilo de vida e pode, portanto, exigir intervencao farmacologica.',
  'obesity is usually unresponsive to conventional treat',
  'Hypothalamic obesity')

f('As abordagens farmacologicas usadas ate hoje incluem estimulantes como derivados de anfetamina, metilfenidato para aumentar a atividade fisica e agentes que modulam a sensibilidade a insulina.',
  'approaches to date have included stimulants such as',
  'Hypothalamic obesity')

f('NENHUMA das abordagens farmacologicas provou ser eficaz em ensaios randomizados controlados em pacientes com ACP de inicio na infancia e obesidade hipotalamica.',
  'approaches has been proven to be effective in controlled',
  'Hypothalamic obesity')

f('A ocitocina e um hormonio hipotalamico que suprime o apetite em condicoes normais, e a perda de neuronios de ocitocina pode estar envolvida na obesidade hipotalamica de pacientes com dano cirurgico limitado a estruturas hipotalamicas anteriores especificas.',
  'thalamic hormone that suppresses appetite under nor',
  'Hypothalamic obesity')

f('Um pequeno estudo piloto (n = 11) mostrou que uma aplicacao nasal unica de ocitocina foi bem tolerada e aumentou as concentracoes de ocitocina na saliva e na urina.',
  'A small pilot study (n = 11) showed that',
  'Hypothalamic obesity')

f('Os pacientes mostraram melhora na identificacao emocional em comparacao com pacientes com lesoes hipotalamicas anteriores e posteriores combinadas.',
  'to emotional identification compared with patients with',
  'Hypothalamic obesity')

f('O conhecimento atual sobre os efeitos de longo prazo do tratamento com ocitocina no craniofaringioma baseia-se principalmente em poucos relatos de caso.',
  'effects of oxytocin treatment in CP is mainly based on a',
  'Hypothalamic obesity')

f('A ocitocina melhorou o comportamento pro-social observado pelos pais em um caso pediatrico e melhorou hiperfagia com perda de peso em combinacao com naltrexona em outro caso de ACP.',
  'improved prosocial behaviour in a paediatric case189, and',
  'Hypothalamic obesity')

f('Atualmente NENHUM metodo de tratamento bariatrico provou ser eficaz em ensaios clinicos randomizados em pacientes com craniofaringioma e obesidade hipotalamica.',
  'Currently, no bariatric treatment method has been lesions and ACP with anterior and posterior hypo proven to be efficacious in randomized controlled trials',
  'Bariatric treatment')

f('Reducao de IMC a curto prazo com cirurgia bariatrica foi relatada em estudos que analisaram dados de seguimento de 5 a 10 anos em pacientes com ACP de inicio na infancia e obesidade hipotalamica.',
  'with bariatric surgery has been reported in studies psychopathological symptoms such as anxiety, depres analysing 5–10 year follow up data in patients with',
  'Bariatric treatment')

f('Melhora clinicamente significativa do comportamento de compulsao alimentar foi observada imediatamente apos a banda gastrica ajustavel laparoscopica, que foi bem tolerada, mas a reducao de peso a longo prazo NAO foi alcancada apos seguimento mediano de 7,1 anos.',
  'scopic adjustable gastric banding was well tolerated, but quent problems in the daily functioning of those with long term weight reduction was not achieved after a childhood onset CP201,202. median follow up of 7.1 years following bariatric inter',
  'Bariatric treatment')

f('Metanalise com 21 pacientes com ACP relatou que, aos 12 meses apos o procedimento, o bypass gastrico em Y de Roux, a derivacao biliopancreatica e a gastrectomia vertical foram os tratamentos bariatricos mais eficientes na obesidade hipotalamica do craniofaringioma de inicio na infancia.',
  'A meta analysis encompassing 21 patients tional impairments are known risk factors associated with ACP reported that, at 12 months post procedure, with reduced psychosocial and neurocognitive func Roux enY gastric bypass, biliopancreatic diversion tion after treatment. Endocrine, ophthalmological and and sleeve gastrectomy were the most efficient bariatric',
  'Bariatric treatment')

f('O tratamento bariatrico com tecnicas cirurgicas nao reversiveis e controverso na faixa etaria pediatrica por preocupacoes legais, medicas e eticas.',
  'Bariatric treatment with non reversible sur most clinically relevant negative risk factor for impair gical techniques is controversial in the paediatric age ments in body image, social functioning and physi cohort owing to legal, medical and ethical concerns194.',
  'Bariatric treatment')

f('Abordagens de tratamento individualizadas baseadas na avaliacao de dominios clinicos, como o comportamento alimentar afetado pela sindrome hipotalamica, foram recomendadas.',
  'aches based on assessment of clinical domains, such as',
  'Bariatric treatment')

# ===================== NEUROPSICOSSOCIAL =====================
f('Os estudos de funcionalidade fisica e psicossocial no seguimento de longo prazo apos craniofaringioma variam de funcao reduzida em cerca de 50% dos pacientes ate funcao excelente na maioria deles.',
  'able observations, ranging from reduced function in improved hyperphagia and weight loss in combination \\~50% of patients to excellent function in the majority',
  'Neuropsychosocial functioning')

f('As reducoes do funcionamento social e emocional sao os comprometimentos mais frequentes, com os pacientes avaliando seu status psicossocial como pior do que sua saude fisica.',
  'ments, with patients rating their psychosocial status',
  'Neuropsychosocial functioning')

f('Idade mais jovem ao diagnostico e comprometimentos funcionais pre-cirurgicos sao fatores de risco conhecidos associados a funcao psicossocial e neurocognitiva reduzida apos o tratamento.',
  'Younger age at diagnosis and pre surgical func',
  'Neuropsychosocial functioning')

f('A disfuncao hipotalamica e o fator de risco negativo clinicamente mais relevante para comprometimentos de imagem corporal, funcionamento social e capacidade fisica.',
  'most clinically relevant negative risk factor for impair',
  'Neuropsychosocial functioning')

f('As principais complicacoes neurocognitivas de longo prazo apos craniofaringioma incluem problemas cognitivos, particularmente os que afetam atencao, memoria de trabalho, memoria episodica e funcao executiva.',
  'complications after CP include cognitive problems, particularly those affecting attention40, working mem ory204,205, episodic memory204,205 and executive func tion',
  'Neuropsychosocial functioning')

f('Os comprometimentos neurocognitivos relatados incluem instabilidade comportamental, problemas de atencao, disturbios de memoria e lentificacao cognitiva; em ate 82% dos pacientes observou-se funcionamento intelectual intacto.',
  'include behavioural instability, attention problems, memory disturbances and slower cognitive speed201,202,207. In up to 82% of patients, intact intellectual functioning has been observed',
  'Neuropsychosocial functioning')

f('Estudos sobre esforcos intervencionais para tratar deficiencias neurocognitivas sao raros; estudos de caso sugerem que a analise comportamental funcional e a terapia de gerenciamento de metas sao opcoes diagnosticas e terapeuticas uteis para reabilitacao cognitiva.',
  'Case studies suggest that func tional behavioural analysis and goal management therapy are useful diagnostic and therapeutic options for cognitive rehabilitation, compensating for cognitive and psychosocial impairments',
  'Neuropsychosocial functioning')

f('Pacientes com ACP tratados com estrategias cirurgicas radicais como ressecao total macroscopica, que resultaram em lesoes cirurgicas das areas hipotalamicas posteriores, tiveram qualidade de vida significativamente pior nos dominios funcao emocional, imagem corporal, funcao fisica e funcionalidade social.',
  'egies, such as GTR, that resulted in surgical lesions of',
  'Quality of life')

# ===================== OUTLOOK / TERAPIA ALVO =====================
f('A Sociedade de Hipofise publicou criterios para centros de excelencia no tratamento de tumores hipofisarios, e sociedades profissionais e autoridades de saude deveriam apoiar esse esforco para assegurar qualidade diagnostica e terapeutica.',
  'lished criteria for centres of excellence for treatment of pituitary tumours211; professional societies and health authorities should support this effort to assure diagnos tic and therapeutic quality.',
  'Outlook')

f('Como a centralizacao exige limiares altos de infraestrutura nao alcancaveis em todos os sistemas de saude, alternativas como redes multicentricas para avaliacoes de referencia devem ser consideradas.',
  'Alternatives such as multicentre based networks for reference assessments should be considered to assure high standards of treat ment quality',
  'Outlook')

f('ARMADILHA TERAPEUTICA: a inibicao da via SHH (por exemplo com vismodegibe) demonstrou levar a aumento da proliferacao celular e formacao tumoral acelerada no ACP murino e humano, indicando que essa terapia NAO deve ser tentada nesses pacientes.',
  'However, inhibition of the SHH pathway has recently been shown to lead to increased cell proliferation and accelerated tumour formation in both mouse and human ACP, indicating that this therapy should not be attempted in the patients',
  'Targeted therapy')

f('A inibicao da via MAPK com trametinibe, um inibidor especifico de MEK, reduz o indice proliferativo e aumenta a apoptose das celulas tumorais em culturas de explantes de ACP murino e humano.',
  'Another avenue to explore is the inhibition of the MAPK pathway using trametinib, a specific MEK inhibitor216,217, which reduces the proliferative index and increases apoptosis of tumour cells in explant cultures of both mouse and human ACP',
  'Targeted therapy')

f('Em revisao de 56 criancas com ACP mostrou-se que o interferon alfa intracistico retarda a progressao da doenca e e mais seguro do que outras modalidades terapeuticas.',
  'In a review of 56 children with ACP, it was shown that intracystic IFNα delays disease',
  'Targeted therapy')

f('A natureza inflamatoria importante dos ACP sugere que novas terapias que inibam a sinalizacao de citocinas podem ser relevantes; um estudo recente mostrou resultados promissores no tratamento do ACP cistico por administracao sistemica de inibidores de IL-6.',
  'a recent study has shown promising results in treating cystic ACP by sys temic administration of IL6 inhibitors',
  'Targeted therapy')

f('No tratamento do PCP, a identificacao de mutacoes BRAFV600E motivou o uso de terapias combinatorias com inibidores de BRAF e MEK (por exemplo dabrafenibe e trametinibe), com bons resultados.',
  'the identification of BRAFV600E mutations has prompted the use of com binatory therapies with BRAF and MEK inhibitors (for example, dabrafenib and trametinib) with good results',
  'Targeted therapy')

f('Um ensaio nacional de fase II em andamento nos EUA (NCT03224767) analisa seguranca, tolerabilidade e farmacocinetica de vemurafenibe e cobimetinibe em pacientes com PCP positivo para mutacao BRAFV600.',
  'An ongoing US national phase II trial (ClinicalTrials.gov NCT03224767) is currently analysing the safety, tolerability and pharmacokinetics of vemu rafenib and cobimetinib medication in patients with BRAFV600 mutation positive PCP.',
  'Targeted therapy')

f('Como a sindrome hipotalamica e suas sequelas sao causas maiores de qualidade de vida prejudicada, terapias alvo dirigidas contra a progressao tumoral podem NAO ser adequadas para melhorar substancialmente o desfecho em pacientes com envolvimento hipotalamico primario do tumor.',
  'As hypothalamic syndrome and its sequelae are major causes for impaired QOL, targeted therapies aimed against tumour progres sion may not be suitable to substantially improve out come in patients with primary hypothalamic involvement of their tumour',
  'Targeted therapy')

f('A radioterapia externa e eficiente em controlar e prevenir progressao e recorrencias.',
  'External radiotherapy is efficient in controlling and preventing progression and recurrences',
  'Surgery and radiotherapy')

f('Por suas caracteristicas fisicas, a terapia com feixe de protons oferece vantagens sobre a irradiacao com fotons ao poupar o tecido circundante, diminuindo o risco de sequelas, mas faltam estudos de desfecho a longo prazo para provar essa hipotese.',
  'Due to its physical characteristics, proton beam therapy offers advantages over photon irradiation in terms of sparing surrounding tissue, thereby decreasing the risk of seque lae. However, studies on long term outcome after pro ton beam therapy are needed to prove this hypothesis.',
  'Surgery and radiotherapy')

f('Ha debate consideravel sobre se a irradiacao do tumor residual apos ressecao incompleta deve ser feita imediatamente apos a cirurgia ou no momento da progressao, e um ensaio prospectivo randomizado nao conseguiu responder definitivamente a essa questao.',
  'Considerable debate abounds regarding whether irradi ation of the residual tumour after incomplete resection should be performed immediately after surgery or at the time of its progression.',
  'Surgery and radiotherapy')

f('Opcoes terapeuticas eficientes para tratar a sindrome hipotalamica e suas manifestacoes clinicas predominantes (obesidade e deficiencias neuropsicologicas) NAO estao atualmente disponiveis.',
  'However, efficient therapeutic options to treat hypothalamic syndrome and its most predominant clini cal manifestations (obesity and neuropsychological defi ciencies) are currently not available.',
  'Adverse effects')

# ===================== BOX 2: VARIACAO GLOBAL =====================
f('Uma publicacao da Nigeria relatou alta mortalidade pos-cirurgica (32%), nao observada em outras series: 7% na Turquia e 6% na Jordania e no Egito.',
  'A publication from Nigeria228 reported a high postsurgical mortality (32%) that has not been observed in other series (7% in Turkey229 and 6% in Jordan230 and Egypt226).',
  'Box 2')

f('A experiencia jordaniana no tratamento do craniofaringioma de inicio pediatrico relatou sobrevida global em 5 anos.',
  'reported on the Jordanian experience in treating paediatric- onset CP, observing a 5-year overall survival',
  'Box 2')

f('Essa sobrevida global jordaniana foi de 87 ± 7%, semelhante a de paises de alta renda.',
  'of 87 ± 7%, which is similar to that in high- income countries. However, in their study,',
  'Box 2')

f('Apesar da sobrevida semelhante, a qualidade de vida das criancas sobreviventes foi prejudicada por comorbidades e por dificuldades de integracao escolar e, depois, na vida profissional.',
  'the quality of life of surviving children was impaired owing to comorbidities and',
  'Box 2')

f('As dificuldades foram atribuidas a apresentacao tardia, ao encaminhamento a especialistas apenas apos intervencao cirurgica inicial por neurocirurgioes com experiencia limitada em craniofaringioma e a recursos limitados de reabilitacao comunitaria.',
  'The authors attributed these difficulties to delayed presentation, to referral to experts after initial surgical intervention by neurosurgeons with limited expertise in CP and to limited community rehabilitation resources.',
  'Box 2')

f('A abordagem por equipe multidisciplinar e ideal para a tomada de decisao, mas paises de baixa e media renda tem menos probabilidade de dispor de membros experientes, instalacoes especializadas e servicos de suporte.',
  'A multidisciplinary team approach is ideal for decision- making, but low- income and middle- income countries are less likely to have experienced multidisciplinary team members, expert facilities and supportive services',
  'Box 2')

ext = {
    'fileId': FID,
    'titulo': 'Craniopharyngioma (Nature Reviews Disease Primers)',
    'tema': 'craniofaringioma — visao geral: epidemiologia, patogenese molecular, diagnostico diferencial, graduacao hipotalamica, cirurgia, radioterapia e sequelas',
    'fonte': 'Müller HL, Merchant TE, Warmuth-Metz M, Martinez-Barbera JP, Puget S. Craniopharyngioma. Nature Reviews Disease Primers 2019;5:75 (DOI: 10.1038/s41572-019-0125-9)',
    'area': 'Neuroendocrino',
    'tipo': 'revisao',
    'ano': 2019,
    'conflito': (
        'Nao ha conflito com o NUCLEO: a consulta a scripts/nucleo-sobre.js retornou 0 entradas para '
        '"craniofaringioma" e "adamantinomatoso", e a base profunda de Neuroendocrinologia esta vazia — '
        'ou seja, o tema e lacuna real, nao substituicao. O unico ponto do nucleo que toca o artigo '
        '(incidentaloma hipofisario: micro <10 mm vs macro >=10 mm, Pituitary Society 2025) e CONCORDANTE '
        'com o corte de 10 mm citado aqui e o nucleo e mais novo, entao nada deve ser sobrescrito. '
        'CONFLITO ENTRE FONTES DO ACERVO (registrar, nao resolver): sobre sobrevida global em 20 anos, este '
        'Primer 2019 diz "on average, 62% at 20 years" em coortes pediatricas e "66–85% at 20 years" em '
        'coortes mistas, enquanto o outro artigo do mesmo autor (Neuroendocrinology 2020;110:753–766, '
        'fileId 1Z8ODls-kIEaoqjRcOq1RQPi7K6HHo68-) afirma "Overall survival rates at 20 years after '
        'childhood-onset CP are high (87–95%)". Ao ensinar sobrevida em 20 anos, citar a faixa e a fonte, '
        'nunca um numero unico. Divergencia menor adicional: o n do estudo de fenofibrato+metformina aparece '
        'como 22 pacientes no texto do artigo de 2020 e como 10 pacientes na Tabela 2 do mesmo artigo e na '
        'Tabela 1 deste Primer — a tabela (10) e a leitura concordante entre as duas fontes.'
    ),
    'fatos': F,
}

with io.open(OUT, 'w', encoding='utf-8') as fh:
    json.dump(ext, fh, ensure_ascii=False, indent=1)
print('gravado', OUT, len(F), 'fatos')
checa(TXT, F)
