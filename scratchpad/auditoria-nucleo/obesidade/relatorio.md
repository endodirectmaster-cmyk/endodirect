# Auditoria do NÚCLEO — área OBESIDADE (18 entradas)

Lote: `scratchpad/auditoria-nucleo/obesidade/entradas.json` (índices 4, 9, 14, 16, 17, 19,
33, 49, 55, 56, 65, 66, 70, 71, 74, 75, 76, 84).

## O que serviu de prova

Os 7 extratos da área, com citação byte-exata:

| arquivo | documento | tipo/ano |
|---|---|---|
| `1t-D25dItwmu-Qkjj6xaBsqrvYq1uRybW` | Diretriz Brasileira 2025 de obesidade e risco CV (ABESO/SBD/SBC/SBEM/ABS) | diretriz 2025, 164 fatos |
| `1w6SQlCHJ-gqXdzUxXK0xfmS2BrdezsyK` | Posicionamento de Tratamento Nutricional — Dep. Nutrição ABESO | posicionamento 2022, 142 fatos |
| `14UWdnDelBLCbzBKUL7Yoq-4twRn2DnB3` | Eventos adversos gastrintestinais dos AR GLP-1 (consenso espanhol, J Clin Med 2023) | consenso 2023, 77 fatos |
| `1VVjAEFg5xhs5WgiHYyV1hdo7dLnJcDhN` | Benefits and Risks of Bariatric Surgery in Adults (JAMA 2020) | revisão 2020, 138 fatos |
| `1aTQRBGfXP56X1QlWEPb8M5VFmD-ZTcrX` | Farmacoterapia da obesidade — metanálise em rede de 143 ECR (Lancet 2021) | metanálise 2021, 69 fatos |
| `1IEs1avdteLT9bZudHHTxeEBIjB77dCli` | Approach to the Patient With NAFLD (JCEM 2023) | revisão 2023, 97 fatos |
| `1G_tUIJx7G_Kabz-UB0yD7af1hz9qQ-wW` | Consenso internacional de síndrome de dumping | diretriz 2020, 86 fatos |

Mais as notas do cofre citadas no lote (Descontinuação de GLP-1RA/Tirzepatida; Incretinas,
Massa Magra e CRF; MASLD primer; Obesidade e Exercício; Paradoxo da Obesidade).

**O que o acervo NÃO tem** — e por isso o que não pôde ser conferido: AAP 2023 de obesidade
pediátrica, consenso IFSO 2024, ADA Standards of Care, consenso SOGLI ESPEN/EASO de obesidade
sarcopênica, e os artigos primários de ESSENCE, SOUL, SUMMIT, SURMOUNT-5, REDEFINE, ATTAIN,
STRIDE e do consenso de hiperferritinemia metabólica. Onde SOUL, SUMMIT, SURMOUNT-1, SELECT,
FLOW, SURMOUNT-OSA, SCALE, STEP 1 e XENDOS aparecem **dentro** da Diretriz Brasileira 2025,
foi possível conferir; fora disso, não.

---

## ACHADOS

### ENTRADA #4 — Obesidade (ABESO 2026): sibutramina só contraindicada na doença já estabelecida
SEVERIDADE: SÉRIO
O QUE O NÚCLEO DIZ: "sibutramina contraindicada em DCV aterosclerótica (SCOUT)"
O QUE A FONTE DIZ: "dessa forma, este painel considera que a utilização de sibutramina em
pessoas com obesidade e **risco dascv alto** ou dac crônica não é recomendado."
ONDE: `1t-D25dItwmu-Qkjj6xaBsqrvYq1uRybW.json` fato 59 (busca "SCOUT")
CONDUTA QUE SAI DISSO: o médico prescreve sibutramina para quem está em prevenção primária de
alto risco (PREVENT ≥20%, CAC alto, Lp(a) alta, DM2 longo) porque "ainda não tem doença
aterosclerótica" — exatamente a faixa em que a fonte não recomenda, e num fármaco cujo ensaio
mostrou razão de risco 1,16 para o desfecho CV primário.
CORREÇÃO SUGERIDA: "sibutramina não recomendada no risco DASCV ALTO ou na DAC crônica (SCOUT:
RR 1,16 para o desfecho CV) — não basta ausência de doença estabelecida". A entrada #56 tem a
mesma falha, em versão ainda mais frouxa ("evitar em DCV").

---

### ENTRADA #14 — Lp(a) >50 sem unidade
SEVERIDADE: SÉRIO
O QUE O NÚCLEO DIZ: "alto >20% (ou DASCV estabelecida, DM2 >10a, DRC 3b, CAC >100/>10,
**Lp(a) >50**, LDL >190)"
O QUE A FONTE DIZ: "• escore de cálcio coronário (cac) \> 100 ag (sem diabetes) e cac \> 10 ag
(com diabetes), **lp (a) \> 50 mg/dl ou lp(a) \> 125 nmol/l**, hf ou ldl \> 190 mg/dl."
ONDE: `1t-D25dItwmu-Qkjj6xaBsqrvYq1uRybW.json` fato 20 (busca "cálcio")
CONDUTA QUE SAI DISSO: laboratório que reporta em nmol/L (comum) devolve "Lp(a) 70 nmol/L" —
cerca de 28 mg/dL, abaixo do corte — e o paciente é reclassificado como risco ALTO, com meta
de perda de 10%, farmacoterapia e reestratificação que a fonte não pedia. O erro é para o lado
de tratar demais, mas o corte, como está, não decide nada.
CORREÇÃO SUGERIDA: "Lp(a) >50 mg/dL (ou >125 nmol/L)". A fonte traz as duas unidades; a entrada
apagou as duas.

---

### ENTRADA #14 — "CAC >100/>10" não diz qual corte é de quem
SEVERIDADE: SÉRIO
O QUE O NÚCLEO DIZ: "CAC >100/>10"
O QUE A FONTE DIZ: "as pessoas com cac \> 100 ag (**sem diabetes**) e as com cac \> 10 ag
(**com diabetes**) devem ser estratificadas para risco alto. **pessoas com cac = zero continuam
no risco moderado se houver diabetes.**"
ONDE: `1t-D25dItwmu-Qkjj6xaBsqrvYq1uRybW.json` fato 15 (busca "cálcio")
CONDUTA QUE SAI DISSO: o corte de 100 é aplicado ao diabético (é o número que vem primeiro e é
o mais "familiar"), e o diabético com CAC 40 fica em risco moderado quando a fonte já o põe em
risco alto — erra para o lado de tratar menos exatamente em quem mais se beneficia. E, na ponta
oposta, o diabético com CAC zero é rebaixado a risco baixo, o que a fonte proíbe explicitamente.
CORREÇÃO SUGERIDA: "CAC >100 Ag em quem NÃO tem diabetes, ou CAC >10 Ag em quem TEM diabetes,
reclassifica para alto; no diabético, CAC = 0 mantém em risco moderado (não rebaixa)."

---

### ENTRADA #14 — "DRC 3b" perde a albuminúria
SEVERIDADE: OMISSÃO
O QUE O NÚCLEO DIZ: "DM2 >10a, **DRC 3b**"
O QUE A FONTE DIZ: "pacientes que apresentam diabetes tipo 2 há mais de 10 anos ou doença renal
crônica (taxa de filtração glomerular estimada (tfg) \< 45 ml/min/1,73m2 **e/ou albuminúria, com
relação albumina/creatinina (rac) na urina \> 30 mg/g**) devem ser considerados de risco alto,
independentemente do escore prevent."
ONDE: `1t-D25dItwmu-Qkjj6xaBsqrvYq1uRybW.json` fato 16 (busca "PREVENT"); a própria Tabela 3
escreve "doença renal crônica 3b (**ver nota importante 1**)" — e é a nota 1 que traz o critério
completo (fato 20).
CONDUTA QUE SAI DISSO: o paciente com TFG preservada e RAC 80 mg/g fica em risco moderado; não
recebe a meta de 10% nem a intensificação que a fonte lhe daria. Erra para o lado de tratar menos.
CORREÇÃO SUGERIDA: "DRC (TFG <45 ml/min/1,73 m² **e/ou** RAC >30 mg/g)".

---

### ENTRADA #14 — meta de 10% sem dizer 10% DE QUÊ
SEVERIDADE: SÉRIO
O QUE O NÚCLEO DIZ: "Metas: perda ≥5% (risco moderado, reduz fatores de risco) e ≥10% (risco
moderado/alto, reduz eventos CV; também na fibrilação atrial)"
O QUE A FONTE DIZ: "deve ser considerada a redução sustentada de pelo […] menos 10% **do peso
máximo já atingido na vida**, em indivíduos adultos, com sobrepeso ou obesidade com risco dascv
moderado/alto, para redução de eventos cv."
ONDE: `1t-D25dItwmu-Qkjj6xaBsqrvYq1uRybW.json` fato 30 (busca "peso máximo")
CONDUTA QUE SAI DISSO: a meta é calculada sobre o peso de hoje. Quem pesou 130 kg na vida e está
com 100 kg já cumpriu a meta da fonte (117 kg) e é declarado não respondedor pela do núcleo
(90 kg) — troca-se ou escala-se fármaco, ou se indica cirurgia, num paciente que atingiu o alvo.
CORREÇÃO SUGERIDA: "≥5% do peso atual (risco moderado, reduz fatores de risco) e ≥10% **do maior
peso já atingido na vida** (risco moderado/alto, reduz eventos CV; ≥10% também na FA)". A entrada
#4 repete o mesmo defeito em versão ainda mais curta ("meta de perda ≥10%").

---

### ENTRADA #14 — reestratificar pelo CAC sem a condição que autoriza o exame
SEVERIDADE: IMPRECISO
O QUE O NÚCLEO DIZ: "reestratificando o moderado pelo CAC"
O QUE A FONTE DIZ: "pessoas com risco moderado pelo escore prevent, **com necessidade de
reestratificar o risco dascv por história familiar de dac precoce**, devem realizar o escore de
cálcio coronário (cac), medido por meio de tomografia computadorizada do tórax."
ONDE: `1t-D25dItwmu-Qkjj6xaBsqrvYq1uRybW.json` fato 14 (busca "cálcio")
CONDUTA QUE SAI DISSO: tomografia de tórax para todo risco moderado, quando a fonte a
condiciona à história familiar de doença coronariana precoce. Erra para o lado de investigar mais.
CORREÇÃO SUGERIDA: "no risco moderado com história familiar de DAC precoce, reestratificar pelo
escore de cálcio coronário".

---

### ENTRADA #14 — "farmacoterapia preferencial = AR GLP-1 ou tirzepatida" sem a ressalva da ICFEr
SEVERIDADE: OMISSÃO
O QUE O NÚCLEO DIZ: "Estilo de vida para todos. Farmacoterapia preferencial = AR GLP-1 ou
tirzepatida; semaglutida 2,4 mg reduz eventos na DASCV estabelecida (SELECT) e melhora a ICFEp;
SGLT2 na IC"
O QUE A FONTE DIZ: "**pode ser considerado** o uso de ar glp-1 em pacientes com obesidade e ic
com fração de ejeção reduzida (icfer), para redução do peso, **com exceção da ic em classe IV
(nyha)**" (R21, IIb B) — e, no sumário: "em pacientes com ic com fração de ejeção reduzida
(icfer), as evidências para o tratamento da obesidade com ar glp-1 são **insuficientes e sua
segurança ainda é discutida**"; "no estudo fight, pacientes com hospitalização recente por icfer
(fe média de 27%) randomizados para liraglutida apresentaram um **aumento numérico** […] nas
hospitalizações por ic"; "restrição calórica deve ser realizada com monitorização clínica
cuidadosa, pelo risco potencial de piora do estado catabólico […] desenvolvimento de caquexia e
consequente aumento da mortalidade".
ONDE: `1t-D25dItwmu-Qkjj6xaBsqrvYq1uRybW.json` fatos 80, 155, 87 e 83 (busca "reduzida")
CONDUTA QUE SAI DISSO: o obeso com ICFEr em classe IV recebe AR GLP-1 como "farmacoterapia
preferencial" e uma dieta de déficit calórico — as duas coisas que a fonte exclui e restringe
nesse subgrupo. A entrada distingue a ICFEp mas nunca diz que existe uma ICFEr com regra própria.
CORREÇÃO SUGERIDA: acrescentar "⚠️ ICFEr é outra história: AR GLP-1 apenas PODE SER CONSIDERADO
(IIb), EXCETO em NYHA IV; evidência insuficiente e segurança em discussão (FIGHT: aumento
numérico de hospitalizações com liraglutida); restrição calórica sob monitorização, pelo risco
de caquexia."

---

### ENTRADA #16 — os centímetros da panturrilha se subtraem de onde?
SEVERIDADE: IMPRECISO
O QUE O NÚCLEO DIZ: "na ausência, circunferência da panturrilha com corte por sexo (<33 cm
mulher, <34 cm homem) AJUSTADO ao IMC (−3 cm sobrepeso, −7 cm obesidade I–II, −12 cm obesidade
III)"
O QUE A FONTE DIZ: **não pude conferir** — o consenso SOGLI ESPEN/EASO não está no acervo, e
nenhum dos 7 extratos da área traz corte de panturrilha (busca "panturrilha", "calf" e "33 cm":
zero ocorrências nos sete textos).
ONDE: núcleo, entrada #16 (lida contra si mesma)
CONDUTA QUE SAI DISSO: as duas leituras possíveis classificam pacientes opostos. Subtraindo do
valor MEDIDO, a mulher com obesidade grau II e panturrilha de 38 cm vira 31 cm → massa muscular
baixa. Subtraindo do CORTE (33−7 = 26 cm), a mesma mulher fica normal. É a diferença entre
diagnosticar e não diagnosticar obesidade sarcopênica.
CORREÇÃO SUGERIDA: dizer a operação por extenso — p.ex. "subtrair do valor MEDIDO da panturrilha
3 cm (sobrepeso), 7 cm (obesidade I–II) ou 12 cm (obesidade III) antes de comparar com o corte
(<33 cm mulher, <34 cm homem)" — **depois de conferir a direção no consenso SOGLI**, que não
está no acervo.

---

### ENTRADA #17 — "suspender antes da cirurgia" sem quando parar nem quando voltar
SEVERIDADE: OMISSÃO
O QUE O NÚCLEO DIZ: "ANTES da cirurgia, suspender as medicações modernas (semaglutida/tirzepatida)
pelo risco anestésico/perioperatório (sem indicação de uso rotineiro pré-operatório)"
O QUE A FONTE DIZ: o consenso IFSO 2024 não está no acervo. O consenso de eventos GI dos AR GLP-1
não menciona anestesia (buscas "anesth", "anaesth", "aspiration": **zero ocorrências**); a
revisão de bariátrica do JAMA 2020 é anterior a essas drogas. A nota do cofre *Descontinuação de
GLP-1RA e Tirzepatida (Nat Rev Endocrinol 2026)* diz: "**Consequências da parada:** reganho de
peso + piora do controle glicêmico + perda das melhoras cardiometabólicas […] o risco CV pode
subir, sobretudo **logo após** a interrupção."
ONDE: `14UWdnDelBLCbzBKUL7Yoq-4twRn2DnB3.txt` (busca "anesth"/"aspiration" = 0);
`cofre/Diretrizes Clínicas/Descontinuação de GLP-1RA e Tirzepatida (revisão, Nat Rev Endocrinol 2026).md`
CONDUTA QUE SAI DISSO: sem intervalo, "suspender antes da cirurgia" tanto autoriza parar na
véspera (não reduz o risco que motiva a suspensão) quanto parar meses antes (reganho e piora
cardiometabólica no pré-operatório). E a entrada não diz quando reintroduzir — no mesmo parágrafo
em que manda associar medicação depois da cirurgia.
CORREÇÃO SUGERIDA: fixar o intervalo de suspensão pré-operatória **a partir do IFSO 2024** (que
precisa entrar no acervo) e acrescentar "retomar no pós-operatório conforme o item seguinte —
parar é reversão dos ganhos, não desmame".

---

### ENTRADA #19 — manda vigiar hipoglicemia pós-bariátrica e não diz o que ela é nem o que fazer
SEVERIDADE: OMISSÃO
O QUE O NÚCLEO DIZ: "monitorar hipoglicemia pós-cirúrgica com CGM"
O QUE A FONTE DIZ: "**o valor da monitorização contínua de glicose para diagnosticar a síndrome
de dumping não foi estabelecido**: sua acurácia diagnóstica nunca foi comparada com a dos testes
provocativos ou dos questionários" (fato 56). E o consenso dá o que falta: "níveis plasmáticos
espontâneos de glicose abaixo de 2,8 mmol/l (50 mg/dl) são indicativos de dumping tardio"
(fato 38); "após cirurgia bariátrica são necessários **3 meses a 1 ano** para que os sinais
clínicos de hipoglicemia apareçam" (fato 21); e o algoritmo em degraus "medidas dietéticas
primeiro; nos que não respondem à dieta, **acarbose** […]; nos que não respondem à dieta e/ou à
acarbose, **análogos de somatostatina**" (fato 86).
ONDE: `1G_tUIJx7G_Kabz-UB0yD7af1hz9qQ-wW.json` fatos 56, 38, 21 e 86. A palavra **"dumping" tem
zero ocorrências em todo o núcleo** (`nucleo.txt`).
CONDUTA QUE SAI DISSO: pede-se um exame cuja acurácia a fonte declara não estabelecida, e quando
ele aponta hipoglicemia não há corte para confirmar (50 mg/dL + tríade de Whipple) nem degrau
terapêutico — o paciente sai com "evite doce" e sem acarbose.
CORREÇÃO SUGERIDA: "hipoglicemia pós-bariátrica = dumping tardio; aparece de 3 meses a 1 ano
após a cirurgia; confirmar com glicose <50 mg/dL sintomática (Whipple) — o CGM ainda não tem
acurácia estabelecida para esse diagnóstico; tratar em degraus: dieta → acarbose 50–100 mg 3x/dia
→ análogo de somatostatina."

---

### ENTRADA #19 — cirurgia bariátrica indicada em três entradas, contraindicada em nenhuma
SEVERIDADE: OMISSÃO
O QUE O NÚCLEO DIZ: "Cirurgia metabólica: considerar no DM2 com IMC ≥30 (≥27,5 em
asiático-americanos) em bons candidatos" (e, em #14, "Cirurgia bariátrica se IMC ≥35 + risco
moderado/alto"; em #17, cirurgia e cirurgia revisional)
O QUE A FONTE DIZ: "contraindications for bariatric surgery include severe heart failure,
unstable coronary artery disease, end-stage lung disease, active cancer, cirrhosis with portal
hypertension, **uncontrolled drug or alcohol dependency**, crohn disease, severely impaired
intellectual capacity, or **current or planned pregnancy within the next 1 to 2 years**."
ONDE: `1VVjAEFg5xhs5WgiHYyV1hdo7dLnJcDhN.json` fato 15. Reforço na diretriz brasileira: a
segurança da cirurgia na IC "ainda não foi totalmente estabelecida […] a decisão deve ser
individualizada" (`1t-D25…json` fato 99). Em todo o `nucleo.txt`, "bariátric" aparece 4 vezes e
"cirurgia metabólica" 2 — cinco entradas distintas (#9, #14, #16, #17, #19) — e nenhuma delas
vem acompanhada de contraindicação.
CONDUTA QUE SAI DISSO: encaminha-se para cirurgia a paciente que planeja engravidar no ano
seguinte, ou o paciente com dependência alcoólica não controlada — os dois casos que a fonte
lista como contraindicação. "Bons candidatos" não é critério: é a palavra que substituiu a lista.
CORREÇÃO SUGERIDA: acrescentar uma vez, na entrada que a cirurgia aparece: "contraindicações:
IC grave, DAC instável, pneumopatia terminal, câncer ativo, cirrose com hipertensão portal,
dependência não controlada de álcool/droga, doença de Crohn, capacidade intelectual gravemente
comprometida, gestação atual ou planejada nos próximos 1–2 anos."

---

### ENTRADA #19 — indica cirurgia e não repõe nada depois dela
SEVERIDADE: OMISSÃO
O QUE O NÚCLEO DIZ: "Cirurgia metabólica: considerar no DM2 com IMC ≥30 (≥27,5 em
asiático-americanos) em bons candidatos — reduz eventos CV e mortalidade; monitorar hipoglicemia
pós-cirúrgica com CGM." (é todo o pós-operatório que o núcleo tem)
O QUE A FONTE DIZ: "o acompanhamento pré e pós-operatório (po) **ao longo da vida do paciente** —
classe de recomendação i, nível de evidência c" (fato 103); as deficiências pós-operatórias
"tiamina (1 a 49%), vitamina b12 (\<20% rygb, 4 a 20% sg), ácido fólico (até 65%), ferro (13 a
62% bpd, 8 a 50% ds, **20 a 55% rygb**, \<18% sg […]), **vitamina d (até 100%)**, vitamina a
(até 70%), zinco […], cobre […]" (fato 111); e a suplementação de rotina, por micronutriente —
ferro "multivitamínico contendo 18mg de fe/dia […] mulheres que menstruam: 45-60mg de fe
elementar" (IIa A, fato 112), B12 "multivitamínico contendo pelo menos 400-800µg/dia […] mulheres
em idade fértil: 800-1.000 µg/dia" (IIa B, fato 113), **tiamina** com os gatilhos "vômitos
prolongados • perda de peso muito acelerada • ingestão insuficiente • alcoolismo • sintomas de
neuropatia" e reposição parenteral (I C), vitamina D 3.000 UI/dia (IIa C) — Tabela 5; e o
calendário da Tabela 4 ("bioquímica: trimestral até o final do 1º ano, anual a partir do 2º").
A revisão do JAMA confirma que "deficiências nutricionais e vitamínicas" são complicação TARDIA
(≥30 dias, sem limite superior) do bypass e do sleeve (`1VVjA…json` fatos 121 e 125).
ONDE: `1w6SQlCHJ-gqXdzUxXK0xfmS2BrdezsyK.json` fatos 103, 110, 111, 112, 113 (busca "bariátric");
tabelas 4 e 5 no texto-fonte em `textos/1w6SQlCHJ…txt` @505861 e @509955 (busca "Ferritina").
Medição no núcleo: "tiamina", "multivitam", "pós-operatório", "pós-bariátric" → **zero
ocorrências**; "B12" → 1 ocorrência, num parágrafo de fosfatase alcalina, sem relação com cirurgia.
CONDUTA QUE SAI DISSO: o paciente é operado e sai sem reposição obrigatória e sem calendário de
exames — com deficiência de ferro em até 55% no bypass e de vitamina D em até 100%. Pior no
cenário que o próprio núcleo cria: a única vigilância que ele manda fazer é de hipoglicemia, e o
vômito prolongado — gatilho de deficiência de tiamina nesta fonte — não dispara nada.
CORREÇÃO SUGERIDA: acrescentar "pós-operatório: acompanhamento nutricional vitalício;
suplementação obrigatória (multivitamínico com ≥18 mg de ferro/dia — 45–60 mg de ferro elementar
na mulher que menstrua; B12 400–800 µg/dia, 800–1.000 µg na idade fértil; vitamina D 3.000 UI/dia;
tiamina, com reposição parenteral se vômito prolongado, perda muito rápida, ingestão insuficiente
ou neuropatia); bioquímica trimestral até o fim do 1º ano e anual depois."

---

### ENTRADA #33 × ENTRADA #76 — dois números para o mesmo ensaio
SEVERIDADE: IMPRECISO
O QUE O NÚCLEO DIZ: #33 — "A combinação cagrilintida+semaglutida (CagriSema, REDEFINE 1) levou a
**−20,4%** vs −3,0% com placebo"; #76 — "CAGRISEMA (cagrilintida […] + semaglutida; REDEFINE
**~23%** de perda)"
O QUE A FONTE DIZ: **não pude conferir** — REDEFINE não está no acervo (busca "cagri" nos sete
textos: zero ocorrências).
ONDE: núcleo, entradas #33 e #76 (contradição interna, verificável no próprio `nucleo.txt`)
CONDUTA QUE SAI DISSO: as duas linhas chegam juntas em toda chamada; o modelo escolhe uma das
duas ao aconselhar sobre magnitude esperada de perda com CagriSema, e a diferença entre 20% e
23% é a diferença entre estimandos distintos do mesmo ensaio, não entre dois ensaios.
CORREÇÃO SUGERIDA: um número só, com o estimando e a semana explícitos, repetido igual nas duas
entradas — depois de conferir no artigo do REDEFINE, que precisa entrar no acervo.

---

### ENTRADA #49 — MASLD sem nenhum limite de álcool
SEVERIDADE: OMISSÃO
O QUE O NÚCLEO DIZ: "MASLD = esteatose hepática + ≥1 critério cardiometabólico
(sobrepeso/obesidade, disglicemia, HAS, dislipidemia)"
O QUE A FONTE DIZ: "significant alcohol consumption is defined as ingestion of **more than 21
standard drinks per week in men and more than 14 standard drinks per week in women** over a
2-year period preceding baseline liver histology"; e, na avaliação inicial, "patients should then
undergo a standard medical history that **includes screening for alcohol use**".
ONDE: `1IEs1avdteLT9bZudHHTxeEBIjB77dCli.json` fatos 43 e 24 (busca "álcool")
CONDUTA QUE SAI DISSO: o paciente com obesidade, hipertensão e consumo pesado de álcool recebe o
rótulo MASLD — porque preenche "esteatose + 1 critério cardiometabólico" — e sai com "perder
peso" em vez de com a abordagem do álcool. A nota do cofre `MASLD — primer (Nat Rev Dis Primers
2025)` repete a mesma definição sem limiar algum de álcool, de modo que o núcleo e a nota erram
juntos. Registro a ressalva que a própria fonte faz: no sistema MASLD o diagnóstico é POSITIVO e
não depende de excluir outras causas — mas é justamente o limiar de álcool que separa MASLD de
doença hepática relacionada ao álcool, e ele não está em lugar nenhum.
CORREÇÃO SUGERIDA: acrescentar "rastrear consumo de álcool em toda suspeita e registrar o limiar
usado — acima dele o quadro não é MASLD pura" (o limiar exato deve vir do documento de
nomenclatura de 2023, que não está no acervo; o limite que a fonte disponível define é >21 doses
padrão/semana em homens e >14 em mulheres).

---

### ENTRADA #49 — "FIB-4 e elastografia" sem um único corte
SEVERIDADE: OMISSÃO
O QUE O NÚCLEO DIZ: "Estadiamento não invasivo com FIB-4 e elastografia."
O QUE A FONTE DIZ: "people with a fib-4 less than **1.3** can be excluded from having advanced
fibrosis […] and should not need further evaluation" (fato 30); "patients with fib-4 greater than
**2.67** are at high risk for advanced fibrosis […] and should be referred to hepatology clinics"
(fato 32); "a higher advanced fibrosis cutoff (**2.0**) has been suggested in people aged **65
years and older**" (fato 31); "if lsm is less than **8.0 kpa**, there is a low risk […] and lsm
should be repeated in 2 to 3 years" (fato 34), com encaminhamento acima de 12,0 kPa e na faixa
8–12 kPa (fatos 35 e 36).
ONDE: `1IEs1avdteLT9bZudHHTxeEBIjB77dCli.json` fatos 30, 31, 32, 34, 35, 36
CONDUTA QUE SAI DISSO: nomear os exames sem os cortes deixa a decisão que importa — quem vai ao
hepatologista — sem régua; e no idoso, aplicar 1,3 em vez de 2,0 transforma idade em fibrose
avançada e enche a fila de encaminhamento com falso-positivo.
CORREÇÃO SUGERIDA: "FIB-4 <1,3 exclui fibrose avançada (no ≥65 anos, usar 2,0); >2,67 encaminha;
1,3–2,67 → elastografia: <8,0 kPa acompanha e repete em 2–3 anos, 8–12 kPa e >12 kPa encaminham."

---

### ENTRADA #56 — tirzepatida dada como não aprovada, e a semaglutida coroada como a mais eficaz
SEVERIDADE: SÉRIO
O QUE O NÚCLEO DIZ: "Aprovados no Brasil: sibutramina […], orlistate, liraglutida 3,0 mg,
**semaglutida 2,4 mg (maior perda de peso entre os disponíveis)** e bupropiona/naltrexona;
**tirzepatida com aprovação prevista**."
O QUE A FONTE DIZ: "tabela 4 - resumo dos principais efeitos dos medicamentos antiobesidade
**aprovados no brasil** sibutramina orlistate liraglutida semaglutida **tirzepatida**
naltrexona/bupropiona" (fato 101), com a linha "**tirzepatida (10 e 15 mg/semana)**" na Tabela 5
(fato 107). E os números: SURMOUNT-1 em 3 anos, "-12,3%, -18,7% e -19,7%" com tirzepatida 5, 10 e
15 mg (fato 52) contra STEP 1, "os participantes do grupo semaglutida 2,4 mg perderam 16,9% do
peso" (fato 50).
ONDE: `1t-D25dItwmu-Qkjj6xaBsqrvYq1uRybW.json` fatos 101, 107, 52 e 50 (busca "aprovad")
CONDUTA QUE SAI DISSO: pergunta-se qual o mais eficaz disponível no Brasil e a resposta é
semaglutida, porque a tirzepatida "ainda não foi aprovada" — deixa-se de oferecer o fármaco mais
eficaz a quem já pode recebê-lo. Pior: a entrada #4 do mesmo núcleo diz "eficácia tirzepatida >
semaglutida > liraglutida". As duas chegam juntas, e se contradizem.
CORREÇÃO SUGERIDA: "Aprovados no Brasil: sibutramina, orlistate, liraglutida 3,0 mg, semaglutida
2,4 mg, **tirzepatida 10 e 15 mg/semana** e bupropiona/naltrexona; maior perda de peso entre os
disponíveis = tirzepatida > semaglutida > liraglutida (Diretriz Brasileira 2025)."

---

### ENTRADA #65 — o núcleo prescreve AR GLP-1 em sete entradas e nunca diz que dá náusea
SEVERIDADE: OMISSÃO
O QUE O NÚCLEO DIZ: "Seguimento: mensal nos 3 primeiros meses, depois a cada 3 meses no 1º ano e
3–6 meses a seguir." (e, em #4, "tratamento crônico"; em #56, "escolher o fármaco conforme
comorbidades […] e contraindicações")
O QUE A FONTE DIZ: "gi aes usually develop in **40-70%** of treated patients, although they have
sometimes been reported in up to 85%" (fato 4); na semaglutida 2,4 mg da obesidade, "14-58"
náusea, "22-27" vômito, "10-36" diarreia, "12-37" constipação (fato 13); "**if drugs to mitigate
nausea (or other gi aes) are needed for over a month** when the maintenance glp-1 ra dose has been
reached, **a dose reduction should be considered**" (fato 40); as cinco manobras de escalonamento,
incluindo "in the case of persistent tolerability limitations **set a dose lower than the maximum
one** recommended by the technical data sheet as a maintenance dose" (fato 34); "**start a
differential diagnosis procedure** to rule out underlying conditions" (fato 36); e o risco biliar
"rr 2.29 (95% ci, 1.64-3.18) in trials focused on people with **obesity**" (fato 54).
ONDE: `14UWdnDelBLCbzBKUL7Yoq-4twRn2DnB3.json` fatos 4, 13, 34, 36, 40, 54. Medição no núcleo:
"náusea", "nausea", "vômito", "gastrintestin", "gastrointestin", "gastr", "advers", "colater",
"escalona", "constipa", "diarreia", "colelit", "vesícula" → **zero ocorrências** em
`nucleo.txt`; "titula" aparece 6 vezes, nenhuma sobre AR GLP-1.
CONDUTA QUE SAI DISSO: o paciente liga na terceira semana com náusea e vômito; sem nenhuma regra
de dose no núcleo, ou se suspende o fármaco (a fonte mostra que a maioria das interrupções é
temporária e recuperável) ou se sustenta a dose plena com antiemético crônico — que é justamente
o que a fonte manda trocar por redução de dose depois de um mês. E a colelitíase, cujo risco
quase dobra na obesidade, não é procurada.
CORREÇÃO SUGERIDA: acrescentar à entrada de farmacoterapia: "Evento gastrintestinal é a regra
(40–70%, até 85%): iniciar na menor dose e subir devagar; se surgir ao subir, voltar à dose
anterior, estender o escalonamento ou pausar temporariamente; se for preciso antiemético por mais
de um mês já na dose de manutenção, REDUZIR a dose (dose eficaz menor que a máxima é conduta
legítima); sintoma intenso ou persistente exige diagnóstico diferencial antes de culpar o
fármaco; vigiar doença biliar (risco quase dobrado na obesidade)."

---

### ENTRADA #71 — o SOUL foi no DM2, e a frase final tira o resultado do DM2
SEVERIDADE: IMPRECISO
O QUE O NÚCLEO DIZ: "reduziu eventos cardiovasculares maiores em ~14% (HR 0,86) em DM2 com DCV
aterosclerótica e/ou DRC […] indicação de redução de risco CV ampliada à formulação oral.
**Reforça que a via oral também protege, não só a injetável (SELECT).**"
O QUE A FONTE DIZ: "o estudo soul […] avaliou a eficácia cv do semaglutida oral em 9.650 pacientes
**com diabetes tipo 2** e dascv, doença renal crônica (drc) ou ambas" (fato 67) — enquanto o
SELECT, na mesma diretriz, é "17.604 adultos com sobrepeso ou obesidade […] a população estudada
**não apresentava diagnóstico prévio de diabetes**" (fato 60).
ONDE: `1t-D25dItwmu-Qkjj6xaBsqrvYq1uRybW.json` fatos 67 e 60 (busca "5%")
CONDUTA QUE SAI DISSO: encostar SOUL em SELECT sugere que a semaglutida oral protege na população
do SELECT — obesidade sem diabetes —, onde ela não foi testada; prescreve-se semaglutida oral
14 mg para redução de risco CV a um obeso não diabético.
CORREÇÃO SUGERIDA: trocar a frase final por "benefício demonstrado **na população do SOUL** (DM2
com DASCV e/ou DRC); não há ensaio de desfecho CV com semaglutida oral em obesidade sem diabetes".

---

### NOTA DO COFRE × EXTRATO — de onde vem o peso que se perde com AR GLP-1
SEVERIDADE: IMPRECISO
O QUE A NOTA DIZ: "**Perda de massa magra com incretinas:** ~**25–40% do peso perdido** é FFM —
ritmo muito acima da perda relacionada à idade (~0,8%/ano). Ex.: STEP/semaglutida FFM ≈ 40% da
perda; SURMOUNT-1/tirzepatida gordura −17 kg / magra −6 kg (~10,9%)"
(`cofre/Diretrizes Clínicas/Incretinas, Massa Magra e Fitness Cardiorrespiratória (revisão, JCEM 2025).md`)
O QUE O EXTRATO DIZ: "although, as said above, **weight loss induced by glp-1 ras comes mainly
from reductions in fat mass rather than lean mass**, nutritional advice and exercise programmes
to achieve muscle strengthening are recommended to minimize sarcopenic risk"
ONDE: `scratchpad/acervo/textos/14UWdnDelBLCbzBKUL7Yoq-4twRn2DnB3.txt` @31165 (busca "lean")
QUE LADO A FONTE SUSTENTA: a nota e o núcleo (#16, "no STEP 1, ~38% do peso perdido foi massa
magra"). O extrato é um consenso de opinião de 2023 **financiado pela Novo Nordisk** (declarado
no próprio extrato), a frase não traz número, e o mesmo texto se contradiz duas páginas adiante:
"the sharp weight loss in the elderly **may be in part at the expense of lean mass**"
(@38911). Não é achado contra o núcleo — é aviso de que essa frase do extrato não pode ser
servida como se dispensasse a vigilância de massa magra.
CORREÇÃO SUGERIDA: nenhuma no núcleo. Marcar a frase no extrato como não utilizável isolada.

---

## O QUE EXAMINEI E NÃO CONSEGUI JULGAR (sem fonte no acervo)

- **#9 (obesidade pediátrica)** — a parte OMS/ABESO confere palavra por palavra com
  `1w6SQlCHJ…json` fatos 126 e 142: "no brasil, preconiza-se a utilização das curvas de imc […]
  elaboradas pela organização mundial da saúde", "valores críticos de diagnóstico nutricional
  para crianças até 19 anos", sobrepeso >85 e <97, obesidade >97, obesidade grave >99,9. A entrada
  já nomeia as duas réguas e avisa da faixa P95–P97: **sem achado**. Não pude conferir a metade
  AAP/CDC (classes 2 e 3, IHBLT ≥26 h, fármaco aos 12 anos, cirurgia aos 13) — a AAP 2023 não está
  no acervo. Fica registrado o ponto que eu conferiria primeiro se ela entrasse: "cirurgia
  metabólica/bariátrica a partir dos 13 anos **quando indicado**" é a única indicação da entrada
  sem limiar numérico, enquanto todas as outras têm.
- **#16 (obesidade sarcopênica)** — consenso SOGLI ESPEN/EASO e Prado 2024 ausentes; conferi só o
  ponto da panturrilha (acima) e o de massa magra (nota do cofre, acima).
- **#17 (IFSO 2024)** — o consenso não está no acervo. O que deu para conferir foi o número:
  SURMOUNT-1 em 3 anos, "-19,7%" com tirzepatida 15 mg e diabetes "1,3% vs. 13,3%; razão de risco
  0,07" (`1t-D25…json` fatos 52 e 51) — o "~20%" e o "~93%" da entrada **conferem**.
- **#55 (hiperferritinemia metabólica)** — o consenso de definição não está no acervo. A palavra
  "ferritina" aparece em um único dos sete textos (Posicionamento ABESO 2022), e só como exame de
  rotina do seguimento pós-bariátrico; "sobrecarga de ferro" tem zero ocorrências nos sete. Nada
  sobre hiperferritinemia metabólica, flebotomia ou depleção de ferro. Não julgada.
- **#65 e #66 (ADA)** — ADA ausente. Confirmei o que era conferível: a escada de eficácia de #65
  bate com a metanálise em rede (fentermina-topiramato −7,97%, semaglutida post-hoc −11,41%,
  liraglutida −4,68%, naltrexona-bupropiona −4,11%, orlistate −3,16% — `1aTQ…json` fatos 30, 32,
  24, 25); e de #66, "37% [orlistate]" bate com o XENDOS ("redução de risco de 37,3%") e "93%
  [tirzepatida]" com a razão de risco 0,07 do SURMOUNT-1 (`1t-D25…json`, busca "XENDOS").
- **#70 (ESSENCE)**, **#74 (SUMMIT)**, **#75 (orforglipron/ATTAIN)**, **#76 (pipeline)**,
  **#84 (STRIDE + coorte TriNetX)** — artigos primários ausentes. De #74 pude conferir apenas que
  a diretriz descreve o SUMMIT em "ic classe ii a iv, fração de ejeção ≥ 50% e imc ≥ 30 kg/m²"
  (fato 86), compatível com a entrada. De #71, a diretriz confirma HR 0,86 e 14% (fato 67).

## SUGESTÕES (não são achados)

- Nenhuma entrada da área traz **dose de tirzepatida**, embora ela seja o fármaco que o núcleo
  põe em primeiro na eficácia em quatro entradas. A fonte de 2025 traz: "tirzepatida (10 e 15
  mg/semana)". A correção da entrada #56 acima já a incorpora.
- A entrada #16 faz a triagem depender de "circunferência da cintura elevados (cortes étnicos)" e
  o núcleo inteiro não tem nenhum valor de circunferência (2 menções, nenhuma com número).
  Nenhum dos sete extratos traz corte — o Posicionamento ABESO 2022 diz apenas que a cintura
  "é importante para complementar o diagnóstico realizado através do IMC". Precisaria de fonte
  nova antes de virar número.
- A Diretriz Brasileira 2025 traz um corte de exclusão de IC ajustado à obesidade (NT-proBNP
  <125 ng/L tem sensibilidade de 67% com IMC >35, sugerindo corte de 50 ng/L) que o núcleo não
  cobre. É conteúdo novo, não defeito do que está escrito.

---

## NÚMEROS

- **Entradas examinadas: 18**
- **Entradas conferidas contra texto-fonte (extrato ou nota, com citação literal): 12**
  (#4, #9, #14, #16, #17, #19, #49, #56, #65, #66, #71, #74)
- **Entradas que ficaram sem fonte para conferir: 6** (#33, #55, #70, #75, #76, #84 — a #33 só
  pôde ser confrontada com a própria #76, dentro do núcleo)
- Achados: **19** — 5 SÉRIO, 9 OMISSÃO, 5 IMPRECISO, 0 GRAVE.

Distribuição por entrada: #4 (1), #14 (6), #16 (1), #17 (1), #19 (3), #33/#76 (1), #49 (2),
#56 (1), #65 (1), #71 (1), nota do cofre × extrato (1).

Entradas sem achado: 7 — **#9, #66 e #74** conferidas contra fonte e sustentadas (a #9 confere
palavra por palavra com o Posicionamento ABESO 2022 na metade OMS, e já nomeia as duas réguas);
**#55, #70, #75 e #84** sem achado porque não tive fonte para julgá-las — silêncio de auditor,
não aprovação.
