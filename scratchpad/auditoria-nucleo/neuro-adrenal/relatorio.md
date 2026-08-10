# Auditoria do NÚCLEO — lote NEUROENDOCRINOLOGIA + ADRENAL (16 entradas)

Entradas do lote: `i` = 6, 7, 8, 37, 38, 39, 40, 41, 42, 52, 54, 57, 61, 62, 63, 64.
Prova usada: `scratchpad/acervo/extratos/*.json` + os textos-fonte em `scratchpad/acervo/textos/`.
Notas do cofre auditadas: as citadas no lote (`cofre/Diretrizes Clínicas/`).

Nota de escopo: **copeptina/deficiência de AVP (i=68) e HAC/crinecerfonte (i=77) NÃO estão neste
lote** — pelo `mapa.json`, i=68 é do lote `osso-tireoide` e i=77 do lote
`feminina-masculina-ped-lipides`. Auditei i=68 assim mesmo, a pedido, e o achado está isolado na
seção final para não ser contado duas vezes por quem consolidar. **"Crise adrenal e dose de
estresse" não existe como entrada própria no núcleo** — busquei "hidrocortisona" (1 linha),
"dose de estresse" (0), "Addison" (0), "fludrocortisona" (0). O assunto só encosta em i=37, e é
lá que está o maior achado deste lote.

---

## ACHADOS

### ENTRADA #37 — Insuficiência adrenal induzida por glicocorticoide
**SEVERIDADE: OMISSÃO**

**O QUE O NÚCLEO DIZ:** "⚠️ INÍCIO de indutor forte do CYP3A4 (…) pode PRECIPITAR CRISE ADRENAL;
(…) O paciente pode ser assintomático no basal e descompensar sob estresse."
— e a entrada termina aí. Nomeia a crise adrenal duas vezes e **não diz uma palavra sobre o que
fazer**: não há dose de estresse, não há regra de dia de doença, não há tratamento da crise.

**O QUE A FONTE DIZ:** « R 3.1—We recommend that patients with current or recent glucocorticoid use
who did not undergo biochemical testing to rule out glucocorticoid-induced adrenal insufficiency
should receive stress dose coverage when they are exposed to stress. » ; « if not on daily
glucocorticoids: give hydrocortisone 40 mg total daily dose, to be given in three divided doses
(eg, 20 mg on rising, 10 mg 12 midday, 10 mg 5pm). continue for 2-5 days until well » ; « if an
established or impending adrenal crisis is suspected, the patient should immediately receive an
injection of 100 mg hydrocortisone intravenously or intramuscularly followed by rapid volume
resuscitation » ; « treatment must not be delayed by laboratory or imaging investigations » ;
« adrenal crisis can occur not only in patients treated with oral glucocorticoids but also in
patients receiving only inhaled, topical, intra-articular, or other glucocorticoid formulations »

**ONDE:** `17gypfzRnYoQF_qvbqeV5e7qy5jaFkRFK.json` fatos 111, 112, 113, 114, 117, 125, 127, 128,
129, 130, 131, 139, 141 (é a mesma diretriz que a entrada cita como fonte). O conteúdo também já
está escrito no cofre: `Insuficiência Adrenal Induzida por Glicocorticoides (ESE-ES 2024).md`,
seções "Doses de estresse / sick-day rules" e "Crise adrenal" — ou seja, **perdeu-se na passagem
da nota para o núcleo**.

**CONDUTA QUE SAI DISSO:** o médico que está desmamando prednisona e recebe esse paciente com
gastroenterite, febre ou cirurgia marcada não aumenta a dose nem aplica hidrocortisona, porque a
única entrada do núcleo sobre o assunto não diz que se deve — e a fonte registra 15,1 crises por
100 pessoas-ano justamente nesse grupo.

**CORREÇÃO SUGERIDA:** acrescentar ao fim da entrada: "⚠️ COBERTURA SOB ESTRESSE (R3.1): quem usa
ou usou glicocorticoide e não testou o eixo deve receber cobertura quando exposto a estresse —
via ORAL no estresse menor (febre, infecção com antibiótico, luto, anestesia local): hidrocortisona
40 mg/dia em 3 tomadas (20-10-10) por 2–5 dias ou até melhorar; equivalente com prednisona 10 mg/dia
ou dexametasona 1 mg/dia. Via PARENTERAL no estresse moderado/maior, anestesia geral ou regional,
jejum, vômito/diarreia persistentes ou instabilidade hemodinâmica. ⚠️ CRISE ADRENAL é diagnóstico
CLÍNICO (hipotensão/choque + náusea-vômito, fadiga intensa, febre ou rebaixamento) e ocorre também
com inalatório, tópico e intra-articular isolados: hidrocortisona 100 mg IV ou IM IMEDIATAMENTE +
soro fisiológico 0,9%, depois 200 mg/24 h (infusão contínua ou 50 mg 6/6 h). Não atrasar por exame
— tratar mesmo que o diagnóstico seja depois descartado. Fornecer cartão de emergência de
corticoide e educar sobre a regra do dia de doença."

---

### ENTRADA #6 — Hiperaldosteronismo primário / PA
**SEVERIDADE: OMISSÃO**

**O QUE O NÚCLEO DIZ:** "RASTREIO = aldosterona + renina (relação aldosterona/renina, ARR), pela
manhã, sentado, SEM restringir sódio; dosar potássio junto (hipocalemia reduz a aldosterona e dá
falso-negativo)."

**O QUE A FONTE DIZ:** « the diagnosis of primary aldosteronism is based on an increased aldosterone
to renin ratio, calculated from the activity of aldosterone and renin in plasma or the direct
plasma concentration of renin, **at normal dietary salt intake and serum levels of potassium, and
without antihypertensive drugs affecting the renin-angiotensin-aldosterone system**. »

**ONDE:** `13LROrA3r7NiLEWSjL1hIY5iiRandvdzt.json` fato 7.

**CONDUTA QUE SAI DISSO:** a entrada apresenta uma lista de condições de coleta que *parece
completa* (horário, postura, sódio, potássio) e deixa de fora a única que a fonte disponível nomeia
como condição do exame — o anti-hipertensivo que age no eixo renina-angiotensina-aldosterona. A
mesma entrada manda "RASTREAR TODOS os hipertensos" e, mais adiante, "tratar empiricamente com
MRA": o paciente já em espironolactona tem a renina desbloqueada, a ARR cai e o rastreio sai
negativo — diagnóstico perdido em quem tem a maior probabilidade pré-teste (hipertenso resistente).
Do outro lado, betabloqueador suprime a renina e infla a ARR: falso-positivo.

**CORREÇÃO SUGERIDA:** acrescentar após "dosar potássio junto": "⚠️ ANOTE O QUE O PACIENTE TOMA
ANTES DE INTERPRETAR: a condição descrita para a ARR é sódio da dieta normal, potássio sérico normal
e ausência de anti-hipertensivo que atue no eixo renina-angiotensina-aldosterona. Antagonista do
receptor mineralocorticoide e diuréticos elevam a renina e podem produzir ARR falsamente normal
(diagnóstico perdido); betabloqueador suprime a renina e eleva a ARR (falso-positivo). ARR normal
sob MRA/diurético NÃO afasta a doença. A decisão de suspender ou não o anti-hipertensivo — em
especial no hipertenso grave ou resistente — é da diretriz vigente, não se improvisa."

---

### ENTRADA #42 — Feocromocitoma e paraganglioma
**SEVERIDADE: OMISSÃO**

**O QUE O NÚCLEO DIZ:** "diagnóstico bioquímico por metanefrinas plasmáticas livres ou metanefrinas
urinárias fracionadas, depois imagem (TC/RM ± funcional)."

**O QUE A FONTE DIZ:** « mild elevations in the levels of fractionated metanephrines and
catecholamines in plasma and urine are common in persons who do not have pheochromocytoma. » ;
« to effectively screen for catecholamine secreting tumors, tricyclic antidepressants and other
psychoactive agents should be tapered and discontinued at least 2 weeks before any hormonal
assessments are performed » ; « clinical circumstances (e.g., acute illness) could lead to false
positive test results »

**ONDE:** `1f8uBBrbni5PPB15ffR_uLCxTg5jZ1k9B.json` fatos 10 e 11.

**CONDUTA QUE SAI DISSO:** metanefrinas pedidas em quem toma tricíclico, antipsicótico, inibidor de
recaptação ou levodopa — ou durante doença aguda — voltam levemente altas, e o paciente entra em
cascata de TC com contraste, imagem funcional e teste genético por um resultado do fármaco. O erro
tem direção: **sobre-diagnóstico**.

**CORREÇÃO SUGERIDA:** acrescentar: "⚠️ CONDIÇÃO DE COLETA — elevações LEVES de metanefrinas são
comuns em quem NÃO tem o tumor. Antidepressivos tricíclicos e outros agentes psicoativos devem ser
reduzidos e suspensos pelo menos 2 SEMANAS antes de qualquer dosagem hormonal; inibidores de
recaptação e levodopa elevam as catecolaminas endógenas; e doença aguda produz falso-positivo. Só
elevação inequívoca (catecolaminas fracionadas >2× o LSN são diagnósticas) fecha o diagnóstico
bioquímico."

---

### ENTRADA #42 — Feocromocitoma e paraganglioma (preparo pré-operatório)
**SEVERIDADE: OMISSÃO**

**O QUE O NÚCLEO DIZ:** "SEMPRE fazer bloqueio alfa-adrenérgico pré-operatório (betabloqueio só
depois) antes de operar; ressecção cirúrgica e seguimento prolongado guiado pelo genótipo."

**O QUE A FONTE DIZ:** « adrenergic blockade should be accompanied by a high sodium diet (e.g.,
5000 mg per day) and generous fluid intake (e.g., 2.5 liters per day) » ; « usually started at
least 7 days before surgery » ; « postoperative sustained hypotension can be a complication of
preoperative adrenergic blockade »

**ONDE:** `1f8uBBrbni5PPB15ffR_uLCxTg5jZ1k9B.json` fatos 28, 29, 32.

**CONDUTA QUE SAI DISSO:** a ordem alfa→beta está certa e é o que mais importa, mas a entrada
descreve o preparo como se ele fosse só o comprimido. O bloqueio alfa sem repleção de sal e volume,
começado na véspera, entrega à sala um paciente vasodilatado e hipovolêmico — instabilidade
intraoperatória e hipotensão sustentada no pós-operatório.

**CORREÇÃO SUGERIDA:** trocar por: "SEMPRE fazer bloqueio alfa-adrenérgico pré-operatório, iniciado
em geral PELO MENOS 7 DIAS antes da cirurgia (fenoxibenzamina 10 mg 2×/dia até 30 mg 3×/dia, alvo
de PA no limite inferior da normalidade para a idade; ou doxazosina 1 mg/dia até 10 mg 2×/dia) e
SEMPRE ACOMPANHADO de dieta rica em sódio (~5000 mg/dia) e ingestão hídrica generosa (~2,5 L/dia).
O betabloqueador entra só DEPOIS que o alfa normalizou a PA, para controlar taquicardia (metoprolol
de liberação prolongada 25 mg/dia até 100 mg 2×/dia, alvo de FC média 80 bpm) — betabloqueio
isolado ou antes do alfa causa hipertensão grave ou descompensação cardiopulmonar por estimulação
alfa sem oposição. Vigiar hipotensão sustentada no pós-operatório."

---

### ENTRADA #52 — Feocromocitoma/paraganglioma na criança e no adolescente
**SEVERIDADE: OMISSÃO**

**O QUE O NÚCLEO DIZ:** "Mantêm-se os princípios do adulto (metanefrinas para o diagnóstico,
bloqueio alfa-adrenérgico pré-operatório, ressecção), com seguimento prolongado guiado pelo
genótipo."

**O QUE A FONTE DIZ:** « with β adrenergic blockade alone, severe hypertension or cardiopulmonary
decompensation may occur as a result of unopposed α adrenergic stimulation »

**ONDE:** `1f8uBBrbni5PPB15ffR_uLCxTg5jZ1k9B.json` fato 30 (e 27).

**CONDUTA QUE SAI DISSO:** a entrada enumera "os princípios do adulto" em três itens e o item que
mata não está entre eles. Lida sozinha — que é como ela chega —, ela autoriza um betabloqueador
para a taquicardia do adolescente sem alfa prévio.

**CORREÇÃO SUGERIDA:** trocar o parêntese por: "(metanefrinas com as mesmas condições de coleta do
adulto; bloqueio ALFA-adrenérgico pré-operatório com sal e volume, e betabloqueador SOMENTE depois
que o alfa normalizou a PA — nunca antes nem isolado; ressecção)".

---

### ENTRADA #41 — Síndrome de Cushing (diagnóstico e manejo)
**SEVERIDADE: OMISSÃO**

**O QUE O NÚCLEO DIZ:** "rastrear hipercortisolismo com ≥2 testes alterados — cortisol salivar
noturno, cortisol livre urinário de 24h e/ou supressão com 1 mg de dexametasona (overnight)".
Nenhuma palavra sobre em quem testar, nem sobre o que invalida cada um dos três exames.

**O QUE A FONTE DIZ:** « most guidelines (including those of the endocrine society) recommend that
only patients with features of cs be tested for this condition » ; « for tests utilizing
dexamethasone, it is important to consider that estrogens increase corticosteroid-binding protein
and thus total serum cortisol levels; therefore, these tests are generally not used in patients on
combined oral contraceptives » ; « the lnsc and msc rely on a normal circadian rhythm, and thus
results may not be applicable to shift workers or those who have recently changed time zones » ;
« for ufc, large urine volumes or the presence of renal disease may influence results » ; e a
metanálise **excluiu** de propósito « studies that screened all individuals with a specific
disorder (type 2 diabetes mellitus, hypertension, obesity, hyperandrogenism) ».

**ONDE:** `13_9NRgWgJHDz2gBea-461LRF22zP7fUR.json` fatos 51, 40, 43, 42, 4 (e fato 7: prevalência de
39 a 79 por milhão).

**CONDUTA QUE SAI DISSO:** "rastrear" sem o filtro clínico convida a testar obeso, diabético e
hipertenso sem fenótipo — população em que, com especificidade de 90–93% e doença de 39–79 por
milhão, quase todo positivo é falso. E os três exames são pedidos sem as condições que os anulam:
mulher em anticoncepcional combinado não suprime a dexametasona; trabalhador de turno não tem nadir
noturno; grande ingesta hídrica ou doença renal derrubam o cortisol livre urinário. Direção:
**sobre-diagnóstico** e investigação hipofisária desnecessária.

**CORREÇÃO SUGERIDA:** trocar a abertura por: "Testar apenas quem tem FENÓTIPO clínico compatível —
e excluir antes o hipercortisolismo EXÓGENO (corticoide por qualquer via, incluindo progestágeno em
dose alta). Confirmar com ≥2 testes alterados: cortisol salivar noturno (não interpretável em
trabalhador de turno ou mudança recente de fuso; falso-positivo com tabagismo e alcaçuz), cortisol
livre urinário de 24 h (não interpretável com grande volume urinário ou doença renal; conferir
volume e creatinina da coleta) e/ou supressão com 1 mg de dexametasona overnight (não usar em uso
de anticoncepcional combinado ou estrogênio oral, que elevam a CBG e o cortisol total; indutores de
CYP3A4 e má-absorção também dão falso-positivo). Um teste positivo isolado não fecha o diagnóstico."

---

### ENTRADA #7 — Incidentaloma adrenal
**SEVERIDADE: OMISSÃO**

**O QUE O NÚCLEO DIZ:** "Rastreio hormonal em todos: teste de 1 mg de dexametasona (cortisol
≤1,8 µg/dL exclui secreção autônoma; usar 'MACS', não 'Cushing subclínico')."

**O QUE A FONTE DIZ:** « estrogens increase corticosteroid-binding protein and thus total serum
cortisol levels; therefore, these tests are generally not used in patients on combined oral
contraceptives » (JCEM 2020) ; « serum cortisol concentrations can be elevated in patients with
elevated cortisol-binding globulin, such as seen during pregnancy and in women on oral estrogens »
(ESE/ES 2024).

**ONDE:** `13_9NRgWgJHDz2gBea-461LRF22zP7fUR.json` fato 40; `17gypfzRnYoQF_qvbqeV5e7qy5jaFkRFK.json`
fato 74.

**CONDUTA QUE SAI DISSO:** "rastreio hormonal em TODOS" com um corte de exclusão e nenhuma condição
de validade. A mulher em idade fértil com incidentaloma e anticoncepcional combinado não suprime,
é rotulada como MACS e passa a carregar um diagnóstico que muda seguimento e pode levar a
adrenalectomia — por causa da CBG.

**CORREÇÃO SUGERIDA:** acrescentar depois do corte: "— ⚠️ o teste não se interpreta em uso de
estrogênio oral/anticoncepcional combinado nem na gestação (CBG alta eleva o cortisol total e
produz falso-positivo); indutores de CYP3A4, má-absorção e não adesão também elevam o resultado.
Suspender/trocar o estrogênio ou usar outro teste antes de rotular MACS."

---

### ENTRADA #38 — Prolactinoma
**SEVERIDADE: OMISSÃO**

**O QUE O NÚCLEO DIZ:** "Knosp ≥2 → cabergolina (forte). (…) Rastrear valvopatia por
ecocardiograma, com intervalo pela dose (>2,0 mg/semana a cada 2–3 anos; ≤2,0 mg/semana em 5–6
anos)." — o único dano vigiado é a valva.

**O QUE A FONTE DIZ:** « dopamine agonist adverse effects of impulse control disorders are more
frequently observed in men than in women and an informative discussion with patients and their
partners and families is needed before initiating treatment **(strong)** » ; « mood changes or
impulse control disorders can occur with dopamine agonist therapy use in patients with no previous
psychiatric disorder » ; « screening for mood changes and impulse control disorders with the
patient health questionnaire 9 and barratt impulsiveness scale is useful »

**ONDE:** `1Y0gTSFmCKB4iK9YVEDjkM-7SImB0glo8.json` fatos 263, 182, 187. O cofre também traz a seção
inteira (`Prolactinoma — … Best Practice 2026.md`, "Transtornos do controle de impulso").

**CONDUTA QUE SAI DISSO:** a entrada tem recomendação FRACA (a valvopatia) e não tem a FORTE. O
paciente começa cabergolina sem que ninguém — ele, o parceiro, a família — tenha sido avisado de
jogo patológico, hipersexualidade e compras compulsivas; quando surgem, não se atribuem à droga e
o agonista não é reduzido nem suspenso.

**CORREÇÃO SUGERIDA:** acrescentar antes do trecho do ecocardiograma: "⚠️ ANTES de iniciar o
agonista dopaminérgico, conversa informativa com o paciente e com parceiro/família sobre
TRANSTORNOS DO CONTROLE DE IMPULSOS — jogo patológico, hipersexualidade, compras e alimentação
compulsivas —, mais frequentes em homens e possíveis em quem nunca teve doença psiquiátrica
(recomendação forte). Perguntar ativamente a cada consulta (PHQ-9 e escala de impulsividade de
Barratt são úteis); se surgirem, reduzir ou suspender o agonista e considerar cirurgia."

---

### ENTRADA #40 — Acromegalia (desfechos terapêuticos)
**SEVERIDADE: OMISSÃO**

**O QUE O NÚCLEO DIZ:** "Medicamentos: ligantes do receptor de somatostatina (octreotida/lanreotida;
pasireotida em resistentes), antagonista do receptor de GH (pegvisomanto…)" — a pasireotida entra
como item intercambiável da classe.

**O QUE A FONTE DIZ:** « unlike other srls, pasireotide lar is associated with greater frequency and
degree of hyperglycaemia-related adverse events » ; « hyperglycaemia-related adverse events were
more common in those treated with pasireotide lar (57·3%) than with octreotide lar (21·7%); in
another study of patients who switched to pasireotide lar (…) new-onset hyperglycaemia was observed
in 42% of patients and diabetes in 24% » ; « baseline glycaemic assessment and proactive monitoring
for adverse effects is advocated, especially in the first 3 months of therapy or with dose
escalation »

**ONDE:** `19YhZVKhCrfilgshjJXSCbsl7PetIrNzU.json` fatos 170, 171, 172.

**CONDUTA QUE SAI DISSO:** troca-se octreotida por pasireotida num acromegálico que, pela própria
entrada #61, tem grande chance de já ter diabetes ou intolerância — sem glicemia basal e sem
vigilância nos primeiros 3 meses. É o mesmo padrão do romosozumabe: fármaco listado como
equivalente da classe, com o dano que o distingue da classe fora do texto.

**CORREÇÃO SUGERIDA:** trocar o trecho por: "ligantes do receptor de somatostatina
(octreotida/lanreotida; ⚠️ pasireotida nos resistentes — ao contrário dos demais SRLs, causa
hiperglicemia com frequência e gravidade maiores: 57,3% de eventos hiperglicêmicos contra 21,7% do
octreotide LAR, e 42% de hiperglicemia nova com 24% de diabetes novo em quem troca. Avaliar a
glicemia ANTES de iniciar e monitorar ativamente, sobretudo nos primeiros 3 meses e a cada aumento
de dose; metformina isolada ou combinada costuma ser necessária), antagonista do receptor de GH
(pegvisomanto — normaliza o IGF-1 sem reduzir o tumor: volume estável em ~70% e aumento em 3–7%,
então manter imagem de vigilância; elevação transitória de aminotransferases >3× o LSN em 3%)".

---

### ENTRADA #39 — Acromegalia (diagnóstico) — condições que mudam o IGF-1 e o TOTG
**SEVERIDADE: OMISSÃO**

**O QUE O NÚCLEO DIZ:** "o IGF-1 para idade/sexo é o exame de escolha; num paciente com FENÓTIPO
TÍPICO, IGF-1 > 1,3× o limite superior da normalidade (LSN) para a idade CONFIRMA o diagnóstico —
o TOTG NÃO é obrigatório."

**O QUE A FONTE DIZ:** « oral oestrogen and selective oestrogen receptor modulators reduce igf-1
concentrations as do anorexia, malnutrition, liver and renal disease, uncontrolled diabetes, and
acute illness. higher igf-1 concentrations are observed during pregnancy and late-stage
adolescence, and with hyperthyroidism » ; « inadequately established reference ranges and assay
interference commonly lead to falsely elevated igf-1 concentrations » ; « up to 28% of patients
with mild acromegaly (typically microadenomas with baseline growth hormone concentrations of
<4·3 ng/ml) had growth hormone concentrations less than 0·4 ng/ml on ogtt » ; « healthy, lean
individuals and female individuals taking oral oestrogen might not exhibit growth hormone
concentrations less than 0·4 ng/ml » ; « about 25-30% of patients exhibit a paradoxical increase in
growth hormone after glucose load »

**ONDE:** `19YhZVKhCrfilgshjJXSCbsl7PetIrNzU.json` fatos 42, 41, 46, 47, 48.

**CONDUTA QUE SAI DISSO:** duas direções, ambas frequentes no Brasil. (1) Diabetes descompensado,
doença hepática/renal, desnutrição e estrogênio oral **derrubam** o IGF-1 — o acromegálico com
diabetes mal controlado, que é o que mais aparece, tem IGF-1 lido como normal e a doença é
descartada. (2) Gestação e hipertireoidismo **elevam** o IGF-1, e interferência de ensaio eleva
falsamente — e a entrada dispensa o TOTG quando o IGF-1 passa de 1,3× o LSN, de modo que um número
errado por qualquer dessas causas fecha o diagnóstico sozinho.

**CORREÇÃO SUGERIDA:** acrescentar: "⚠️ ANTES DE INTERPRETAR O IGF-1, SAIBA O QUE O ABAIXA E O QUE
O ELEVA: reduzem o IGF-1 o estrogênio oral e os SERMs, a anorexia e a desnutrição, a doença
hepática e renal, o diabetes descompensado, a doença aguda e a obesidade grave — nesses casos um
IGF-1 'normal' NÃO afasta acromegalia. Elevam-no a gestação, a adolescência tardia e o
hipertireoidismo, e faixas de referência mal estabelecidas e interferência de ensaio produzem
elevação falsa. ⚠️ O TOTG erra dos dois lados no mesmo corte: até 28% das acromegalias LEVES
(microadenomas, GH basal <4,3 ng/mL) suprimem abaixo de 0,4 ng/mL, e indivíduos magros saudáveis e
mulheres em estrogênio oral podem NÃO suprimir abaixo de 0,4; 25–30% ainda têm aumento paradoxal do
GH após a glicose. Em dúvida, repetir e acompanhar os sintomas."

---

### ENTRADA #39 — Acromegalia (diagnóstico) — o exemplo do nadir de 0,7
**SEVERIDADE: IMPRECISO**

**O QUE O NÚCLEO DIZ:** "com ensaio moderno o corte sugerido é <0,4 ng/mL (faixa revista de 0,4–1,0
conforme o ensaio). Ou seja, **um nadir de 0,7 ng/mL é 'suprimido' pela régua antiga e NÃO suprimido
pela nova**"

**O QUE A FONTE DIZ:** « a growth hormone nadir cutoff of less than 1 ng/ml on ogtt for acromegaly
diagnosis was established before ultrasensitive growth hormone assays became available. as more
modern assays can now detect lower growth hormone concentrations, **the revised suggested cutoff is
0·4-1·0 ng/ml, depending on the assay used** »

**ONDE:** `19YhZVKhCrfilgshjJXSCbsl7PetIrNzU.json` fato 45.

**CONDUTA QUE SAI DISSO:** a fonte entrega uma FAIXA dependente do ensaio; a entrada escolhe o piso
da faixa, chama-o de "a régua nova" e conclui categoricamente sobre um valor (0,7) que está dentro
da própria faixa — para vários ensaios, 0,7 é o corte, e o resultado é suprimido. Como o exemplo é o
que fica na memória, ele empurra para chamar de "não suprimido" quem suprimiu.

**CORREÇÃO SUGERIDA:** trocar a frase do exemplo por: "Ou seja, um nadir de 0,7 ng/mL cai DENTRO da
faixa revista (0,4–1,0) e só o ensaio do laboratório diz se é suprimido ou não — pergunte qual
ensaio foi usado e qual o corte dele antes de interpretar; não transporte um corte de um ensaio para
outro."

---

### ENTRADA #57 — Macroprolactinemia
**SEVERIDADE: OMISSÃO**

**O QUE O NÚCLEO DIZ:** "diante de hiperprolactinemia, sobretudo ASSINTOMÁTICA ou **sem imagem
condizente**, pesquisar macroprolactina (precipitação com PEG) antes de investigar/tratar (…)
(Diferente do efeito gancho, que SUBestima a prolactina em macroprolactinomas.)"

**O QUE A FONTE DIZ:** « imaging results inconsistent with clinical findings should prompt
investigation for **non-prolactinoma stalk effect**, or high-dose hook effect » ; « parasellar or
intrasellar masses impinging on the pituitary stalk, including non-secreting pituitary adenomas,
can compromise dopamine flow » ; « if shrinkage is not demonstrated with dopamine agonists and the
initial serum level of prolactin is not unequivocally indicative of prolactinoma, a stalk effect due
to a non-functioning adenoma should be reconsidered »

**ONDE:** `1Y0gTSFmCKB4iK9YVEDjkM-7SImB0glo8.json` fatos 94, 44, 110 (e 255).

**CONDUTA QUE SAI DISSO:** esta é a entrada dedicada à "hiperprolactinemia que não é prolactinoma" e
ela cobre duas das três armadilhas — macroprolactina e efeito gancho — e omite exatamente a que
custa uma cirurgia. Paciente com massa selar volumosa e prolactina modestamente alta: pesquisa-se
macroprolactina, dá negativo, e conclui-se macroprolactinoma → cabergolina. Se for adenoma NÃO
funcionante com efeito haste, o tumor não encolhe e a descompressão do quiasma é adiada enquanto o
campo visual se perde.

**CORREÇÃO SUGERIDA:** acrescentar ao parêntese final: "(Diferente do efeito gancho, que SUBestima a
prolactina em macroprolactinomas — nesse caso, repetir diluída. E diferente do EFEITO HASTE:
prolactina apenas modestamente elevada com massa selar/parasselar volumosa costuma ser compressão
da haste por adenoma NÃO funcionante ou outra massa, não prolactinoma — não responde a agonista
dopaminérgico e o tratamento é cirúrgico. Imagem que não bate com a prolactina obriga a considerar
efeito haste antes de tratar; se não houver redução tumoral com o agonista, reconsiderar o
diagnóstico.)"

---

### ENTRADA #61 — Acromegalia (manejo das complicações)
**SEVERIDADE: IMPRECISO**

**O QUE O NÚCLEO DIZ:** "Reavaliar as comorbidades periodicamente, pois **muitas melhoram com o
controle da doença**." — dito logo depois de listar artropatia e fraturas vertebrais.

**O QUE A FONTE DIZ:** « biochemical control **reduces but does not eliminate fracture risk**, and
20% of patients show further decrease in vertebral height **despite igf-1 normalisation** » ;
« biochemical control might help reduce cartilage thickness, especially in early arthropathy, but
**degenerative disease persists and worsens over time despite normalisation of growth hormone and
igf-1** »

**ONDE:** `19YhZVKhCrfilgshjJXSCbsl7PetIrNzU.json` fatos 96 e 88.

**CONDUTA QUE SAI DISSO:** a generalização é desmentida pela fonte justamente nas duas comorbidades
musculoesqueléticas que a entrada acabou de nomear. O médico que normalizou o IGF-1 afrouxa a
morfometria vertebral e atribui a dor articular persistente a outra causa — enquanto 20% seguem
perdendo altura vertebral e a artropatia progride.

**CORREÇÃO SUGERIDA:** trocar por: "Reavaliar as comorbidades periodicamente: várias melhoram com o
controle bioquímico, mas ⚠️ o esqueleto e a articulação não seguem o IGF-1 — o controle reduz mas
não elimina o risco de fratura (20% perdem mais altura vertebral apesar do IGF-1 normal) e a doença
articular degenerativa persiste e piora com o tempo mesmo com GH e IGF-1 normais. Manter a
morfometria vertebral e o cuidado da artropatia depois do controle. FRAX não é confiável aqui."

---

### ENTRADA #64 — Tratamento medicamentoso da síndrome de Cushing
**SEVERIDADE: OMISSÃO** — *achado por divergência núcleo × nota do cofre; sem extrato verbatim para
adjudicar (ver ressalva)*

**O QUE O NÚCLEO DIZ:** "bloqueador do receptor de glicocorticoide (mifepristona, útil na
hiperglicemia). Estratégias de titulação ou block-and-replace; **monitorar cortisol**, eletrólitos,
QT e eixo."

**O QUE A NOTA DO COFRE DIZ (mesma fonte que a entrada cita):** "**Mifepristona** 300–1200 mg/dia
(melhora glicemia/PA; **o cortisol NÃO cai** → monitorar a clínica, não o cortisol)" ; "**Cetoconazol**
(…) ⚠️ **Hepatotoxicidade** (monitorar transaminases)" ; "**Educar TODO paciente** sobre sinais de
**insuficiência adrenal** (risco com qualquer inibidor)".

**ONDE:** `cofre/Diretrizes Clínicas/Tratamento Medicamentoso da Síndrome de Cushing (revisão,
Endocrine Reviews 2026).md`. **Ressalva honesta: não há extrato verbatim deste artigo no acervo**
(os 6 extratos adrenais do lote são outros artigos), então não pude confirmar contra o texto-fonte —
relato a divergência, não o veredito.

**CONDUTA QUE SAI DISSO:** "monitorar cortisol" como regra única da entrada é falso para a
mifepristona, que bloqueia o receptor e não baixa o cortisol: o médico lê cortisol alto e conclui
falha terapêutica (troca ou sobe a dose), ou lê cortisol "normal" e não enxerga a insuficiência
adrenal que o fármaco está produzindo. E o único fármaco da lista com hepatotoxicidade relevante —
o cetoconazol, o mais usado no Brasil — sai sem transaminases na lista de monitorização.

**CORREÇÃO SUGERIDA:** trocar o fecho por: "Estratégias de titulação ou block-and-replace. Monitorar
eletrólitos (hipocalemia com osilodrostate e metirapona), QT (osilodrostate), transaminases
(⚠️ cetoconazol/levocetoconazol) e o cortisol para titular os INIBIDORES DE ESTEROIDOGÊNESE —
⚠️ mas NÃO com mifepristona, em que o cortisol não cai (e pode subir): ali a titulação é pela
clínica e pelos parâmetros metabólicos. Educar TODO paciente sobre os sinais de insuficiência
adrenal, risco de qualquer inibidor da esteroidogênese."

---

## ACHADOS NAS NOTAS DO COFRE

### NOTA — `Insuficiência Adrenal Induzida por Glicocorticoides (ESE-ES 2024).md`
**SEVERIDADE: IMPRECISO**

**O QUE A NOTA DIZ:** "Excede o risco quando AMBOS: duração ≥ 3–4 semanas E dose > equivalente a
15–25 mg de hidrocortisona/dia (…). **Via oral é a de maior risco.**"

**O QUE A FONTE DIZ:** « a meta-analysis of the risk of developing biochemical
glucocorticoid-induced adrenal insufficiency stratified by glucocorticoid route of administration
showed pooled percentages of 4.2% for nasal administration, 48.7% for oral use, and **52.2% for
intra-articular administration** » ; e « glucocorticoids can be detected in the urine for months
after injections (…) we suggest that (…) healthcare professionals have a low threshold for testing
especially within 2 months of injections »

**ONDE:** `17gypfzRnYoQF_qvbqeV5e7qy5jaFkRFK.json` fatos 12 e 20. Busquei "highest risk", "greatest
risk", "most at risk" e construções com "oral … highest" no texto-fonte inteiro: **zero
ocorrências** — a diretriz não faz esse ranking em lugar nenhum, e o único número que ela publica
por via coloca a intra-articular ACIMA da oral.

**CONDUTA QUE SAI DISSO:** quem lê "via oral é a de maior risco" descarta a hipótese no paciente que
só recebeu infiltrações — exatamente o grupo para o qual a diretriz pede limiar BAIXO de teste até
2 meses após a injeção. A própria nota se contradiz três linhas abaixo, onde lista oral e
intra-articular juntas no grupo de risco alto.

**CORREÇÃO SUGERIDA:** trocar por: "Qualquer via pode suprimir o eixo. Pelos percentuais agrupados
da própria diretriz: intra-articular 52,2%, oral 48,7%, nasal 4,2% — e o uso concomitante de várias
vias soma. Ter limiar baixo para testar até 2 meses após injeção intra-articular e em quem recebe
injeções múltiplas em curto período."

---

### NOTA — `Medida do Cortisol na Síndrome de Cushing (revisão, JCEM 2026).md`
**SEVERIDADE: IMPRECISO**

**O QUE A NOTA DIZ:** "**Supressão com 1 mg de dexametasona (overnight DST):** (…) **sens 98,6% /
espec 90,6%** (**o mais sensível**; **útil em incidentaloma adrenal**)."

**O QUE A FONTE DIZ (o artigo de onde esse par 98,6/90,6 vem):** « **studies that screened adrenal
incidentalomas for subclinical cs were excluded**, as the definition and natural history of this
condition remain controversial » ; « although the point estimates are slightly different, **the cis
overlap significantly** » ; « for the 2d dst (p = 0.061) and dst (p = 0.0062), there was asymmetry
of the plots, **suggestive of publication bias** » ; « most of these studies **optimized the
sensitivity** of this test, as opposed to finding the cut-off that maximized diagnostic accuracy »

**ONDE:** `13_9NRgWgJHDz2gBea-461LRF22zP7fUR.json` fatos 5, 17, 45, 46 (o par numérico é o do fato
13; o corte de 50 nmol/L, o do fato 19).

**CONDUTA QUE SAI DISSO:** o superlativo "o mais sensível" **é sustentado** para sensibilidade entre
os testes de 1ª linha (metarregressão p=0,00042) — mas a fonte diz na mesma página que os intervalos
de confiança de todos os testes se sobrepõem, que nenhum está provado superior, e que essa
sensibilidade é o número mais suspeito de viés de publicação de toda a metanálise. E o par de
acurácia é apresentado colado a "útil em incidentaloma adrenal", cenário do qual a metanálise
**excluiu deliberadamente os estudos** — os 98,6/90,6 não foram validados para MACS. Quem lê escolhe
o teste pela superioridade numérica e transporta a acurácia para o incidentaloma.

**CORREÇÃO SUGERIDA:** trocar o parêntese por: "(a maior sensibilidade entre os de 1ª linha na
metarregressão, mas com intervalos de confiança sobrepostos a todos os outros — nenhum teste de 1ª
linha está provado superior — e com viés de publicação detectado justamente nos testes com
dexametasona; serve sobretudo para EXCLUIR. ⚠️ Estes números vêm de metanálise que EXCLUIU os
estudos de incidentaloma adrenal: para secreção autônoma de cortisol no incidentaloma, a referência
é a diretriz de incidentaloma, não esta acurácia.)"

---

## FORA DO LOTE — verificado a pedido (não contar em duplicidade)

### ENTRADA #68 — Distúrbios do sódio e da água (copeptina / deficiência de AVP) — lote `osso-tireoide`
**SEVERIDADE: OMISSÃO**

Confirmei, contra o texto-fonte, o que já foi corrigido duas vezes — e as duas correções estão
**certas**: a condição de coleta (« the diagnostic accuracy of copeptin was predicated upon a single
plasma sample derived once plasma sodium **exceeded 150 mmol/l** », fato 64) e a ordem de leitura,
com o basal como porteiro (« a plasma copeptin **>21.4 pmol/l** diagnostic of ndi », fato 95) e a
citação literal que a entrada reproduz sem erro (« patients with ndi or pp respond to osmotic
stimulation with normal plasma avp concentrations »). O corte da arginina (3,5 pmol/L aos 60 min,
fato 73) também confere.

**O QUE FICOU:** a entrada trata 21,4 e 4,9 pmol/L como números universais.
**O QUE A FONTE DIZ:** « the choice of copeptin assay is important; a review of available commercial
assays showed the highest diagnostic accuracy with the **kryptor (98%)** and line immunoassay
platforms, with results from the **enzyme-linked immunosorbent assay platforms significantly
inferior (55%)** » ; « this makes an assumption that copeptin assays will perform in a similar
fashion in every institution » ; « the diagnosis of cdi can be dependent on a single hormonal cut
off point, **which may vary according to the assay used and the laboratory** ».
**ONDE:** `1w-2-UmiscpCLQmoRodNaQtONVgg_gjuL.json` fatos 63, 95, 169.
**CONDUTA QUE SAI DISSO:** aplicar 21,4 e 4,9 a um resultado de ELISA — plataforma com 55% de
acurácia diagnóstica na revisão citada — e decidir desmopressina para o resto da vida em cima disso.
**CORREÇÃO SUGERIDA:** acrescentar após os dois cortes: "⚠️ Estes cortes pressupõem o ensaio em que
foram derivados: a acurácia diagnóstica vai de 98% (KRYPTOR e imunoensaio em linha) a 55% (ELISA).
Confirme qual plataforma o laboratório usa antes de aplicar o número; a fonte adverte que o corte
varia com o ensaio e com o laboratório."

**Não pude verificar:** o corte de **4,9 pmol/L** do teste de salina hipertônica. Procurei de três
formas (`4[.,·]9`, "cut off of 4", "copeptin … pmol") no texto-fonte da revisão de DI central:
**zero ocorrências**. Os únicos cortes de copeptina publicados nessa fonte são 2,5 (pós-operatório),
3,5 (arginina, 60 min) e 21,4 (basal). O 4,9 vem de Fenske (NEJM 2018), que **não está no acervo** —
o número não está errado por isso, mas não está provado por nada que eu tenha.

---

## O QUE NÃO PUDE CONFERIR (sem fonte no acervo)

Não há extrato para as diretrizes que estas entradas citam. Registro para quem consolidar:

- **i=6** — todo o bloco de cortes (PRA ≤1 ng/mL/h; renina direta ≤8,2 mU/L; aldo ≥10 ng/dL por
  imunoensaio e ≥7,5 por LC-MS/MS; ARR >20 e "cerca de 25% menor por LC-MS/MS"), a postura e o
  horário da coleta ("pela manhã, sentado"), "hipocalemia dá falso-negativo", a restrição de sódio
  <5 g/dia, a preferência do MRA sobre amilorida/triantereno, as doses de espironolactona
  (12,5–25 → 50–100 mg/dia), "queda discreta da TFG = eficácia" e os inibidores da
  aldosterona-sintase. A única fonte de PA do acervo (revisão Nat Rev Endocrinol 2020) declara
  explicitamente que **não publica valor de corte de ARR nem unidade, não define postura nem
  horário, e não traz dose de fármaco** (fatos 1, 7, 8, 45) — logo ela nem confirma nem refuta.
  Registro ainda duas divergências com essa fonte, sem julgá-las (a entrada cita também um primer de
  2026 que não tenho): a prevalência ("~5–14% na atenção primária, até ~30% em centros de
  referência" contra « approximately 5% (…) in primary care and 10-20% (…) referred to specialist
  care », fato 2) e a dispensa do teste confirmatório (contra « confirmation of primary aldosteronism
  requires one or more different confirmatory tests », fato 8; sequência confirma→subtipa, fato 9).
- **i=7** — o corte ≤1,8 µg/dL do teste de 1 mg no incidentaloma, o termo MACS, os limiares de
  cirurgia (≥4 cm, HU >20) e a dispensa de seguimento de imagem no adenoma HU ≤10. A regra dos 10 HU
  para dispensar metanefrinas, essa sim, está provada (fato 15 do extrato de feocromocitoma).
- **i=8, i=54, i=62, i=63** — não há fonte no acervo para Pituitary Society 2025 (incidentaloma
  hipofisário), consenso 2024 de adenomas na infância, diretriz ESE 2025 de tumores agressivos, nem
  GH Research Society 2025. Examinei as quatro e não achei contradição com o que tenho; simplesmente
  não tenho como confirmá-las.
- **i=39** — o corte de **1,3× o LSN** do IGF-1: `1·3` tem **zero ocorrências** no texto-fonte da
  revisão de acromegalia. Vem do consenso da Pituitary Society 2023, ausente do acervo.
- **i=52** — os 70–80% de hereditariedade na criança. A fonte de feocromocitoma que tenho dá
  « more than 40% » para o conjunto dos pacientes, sem recorte pediátrico.
- **i=64** — sem extrato do artigo de Endocrine Reviews 2026 (ver ressalva no achado).

---

## O QUE FOI CONFERIDO E ESTÁ CERTO (registro, não é achado)

Para poupar recontagem de quem consolidar: conferi contra o texto-fonte e **batem** — os cortes de
cortisol matinal de i=37 (>300 / 150–300 / <150 nmol/L) e sua condição de coleta (8–9 h, ≥24 h sem a
dose, exceto dexametasona, e só depois de chegar à dose fisiológica), os percentuais por via
(52,2 / 48,7 / 4,2), os do inalatório (2,4→21,5%; 1,4→27,4%; fluticasona >500 e beclometasona padrão
>1000 µg/dia), os 10% de sintomáticos, o desmame acima de 30 mg e o 1 mg a cada 4 semanas em 5 mg,
"na síndrome de retirada o teste não é recomendado" e a lista de indutores do CYP3A4; a decisão pelo
grau de Knosp e os intervalos de ecocardiograma de i=38, mais o teto de 2 mg/semana aprovado pelo
FDA; a regra dos 10 HU de i=7; a ordem alfa→beta de i=42; a morfometria vertebral de i=61; e, nas
notas, o pico <500 nmol/L do teste de 250 µg de ACTH e o "não usar fludrocortisona" da nota de
insuficiência adrenal.

---

## NÚMEROS

- **Entradas examinadas: 16** (i = 6, 7, 8, 37, 38, 39, 40, 41, 42, 52, 54, 57, 61, 62, 63, 64).
- **Entradas conferidas contra texto-fonte: 12** (6, 7, 37, 38, 39, 40, 41, 42, 52, 57, 61 — e 64
  apenas contra nota do cofre, contada aqui como conferida em parte).
- **Entradas sem fonte no acervo para conferir: 4** (8, 54, 62, 63).
- Achados: **13 no núcleo** + **2 em notas do cofre** + **1 fora do lote** (i=68, a pedido).
- Tokens gastos: não tenho contador exato nesta sessão. Estimativa por volume de contexto lido
  (brief, 16 entradas, ~450 fatos resolvidos em 5 extratos, 4 notas do cofre e buscas no texto-fonte)
  — da ordem de **300–400 mil tokens de entrada** e ~25 mil de saída.
