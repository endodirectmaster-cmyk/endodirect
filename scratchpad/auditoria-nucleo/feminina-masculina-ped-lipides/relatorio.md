# Auditoria do núcleo — Feminina / Masculina / Pediátrica / Lípides + as 4 sem área

Lote: 16 entradas (`i` = 1, 5, 10, 11, 15, 36, 43, 48, 53, 59, 60, 77, 80, 81, 82, 83).
Data: 2026-08-10. Nada foi editado — nem `index.html`, nem extratos, nem notas do cofre.

---

## 0. O estado da prova neste lote (isto é parte do achado)

O lote chegou com 3 extratos. Fui procurar prova no acervo inteiro, não só na "minha"
área — prova é o texto-fonte, onde quer que esteja. O resultado, medido:

| assunto do lote | artigo no acervo? |
|---|---|
| Dislipidemia / metas de LDL / FCS | **sim** — `1F9LgLNgc8DPmIR4IP5lUI1msIvJQECr-` (SBC 2025, 584 fatos) |
| SOP, hirsutismo | **sim** — `1lExtghh9pvtQfYx7OIucuc-d4uo5AV2q` (256) e `1LxKtV5ecDeyqGbZoxE1apav1h8R1N-qo` (154) |
| HAC / 21-hidroxilase | **sim** — `1N2A6cHWpimOuBeHvjqMlu8vaipe-WDVf` (NEJM 2020, 115 fatos), arquivado em *Adrenal* |
| Hipogonadismo masculino, TRT | **não** |
| TRAVERSE | **não** — 0 ocorrências como ensaio nos 47 textos e 0 no cofre |
| Transgeneridade | **não** — `WPATH` = 0 ocorrências nos 47 textos |
| Puberdade precoce | **não** (só 1 menção lateral, dentro do artigo de HAC) |
| PIG/SGA, GH pediátrico, GH semanal | **não** — `somapacitan`/`lonapeg`/`somatrogon` = 0 |
| Acondroplasia / vosoritida | **não** — `vosoritid` = 0 nos textos e 0 no cofre |
| Menopausa: TH, fezolinetante, elinzanetante | **não** — `fezolinetant`/`elinzanetant`/`neurokinin` = 0 nos textos |
| POI / Turner | **não** |
| Vitamina D (diretriz ES 2024) | **não** |

Buscas feitas em três formas por termo (termo inteiro, radical de 4–7 letras, sinônimo/número),
conforme o brief — "zero ocorrências" aqui é achado, não falha de busca.

**Consequência:** 5 das 16 entradas puderam ser conferidas contra texto-fonte literal;
6 só têm nota do cofre atrás delas; 5 não têm nada. Onde núcleo e nota do cofre
concordam, **os dois podem estar errados juntos** — a nota é resumo, não citação — e
isso está marcado entrada por entrada abaixo.

---

## 1. ACHADOS COM FONTE VERBATIM

---

**ENTRADA #15 — Dislipidemia e prevenção da aterosclerose (Diretriz Brasileira SBC 2025)**
**SEVERIDADE: OMISSÃO**
**O QUE O NÚCLEO DIZ:** "metas de LDL-c por risco — risco EXTREMO … <40, muito alto <50, alto <70, intermediário <100, baixo <115 mg/dL … Tratamento por terapia combinada precoce"
**O QUE A FONTE DIZ:** « em indivíduos de risco cardiovascular baixo ou intermediário, com ldl-c ou não-hdl-c persistentemente ≥ 30 mg/dl acima da meta, recomenda-se a favor do início ou intensificação da terapia farmacológica associada a medidas de estilo de vida. » (FORTE, certeza ALTA)
**ONDE:** `1F9LgLNgc8DPmIR4IP5lUI1msIvJQECr-.json` fato 212
**CONDUTA QUE SAI DISSO:** o médico estatiniza um paciente de baixo risco com LDL 120 (meta <115) — quando a própria diretriz só manda iniciar a partir de LDL ≈145.
**CORREÇÃO SUGERIDA:** acrescentar após as metas: "em risco baixo/intermediário, a meta é alvo de acompanhamento — inicia-se ou intensifica-se fármaco quando LDL-c ou não-HDL-c está persistentemente ≥30 mg/dL acima dela (FORTE/ALTA)."

---

**ENTRADA #15 — Dislipidemia e prevenção da aterosclerose (SBC 2025)**
**SEVERIDADE: OMISSÃO**
**O QUE O NÚCLEO DIZ:** "estratificar o risco CV … Tratamento por terapia combinada precoce: estatina de alta intensidade + ezetimiba (alto risco)…" (nada sobre diálise)
**O QUE A FONTE DIZ:** « em indivíduos com drc em programa de diálise, sem doença cardiovascular estabelecida, recomenda-se **contra** o início de estatinas. forte alta »
**ONDE:** mesmo extrato, fato 313
**CONDUTA QUE SAI DISSO:** o dialítico é classificado como alto/muito alto risco pela própria régua da entrada (DRC é condição de alto risco, fato 31) e recebe estatina — exatamente o que a diretriz recomenda contra, com a força máxima que ela usa.
**CORREÇÃO SUGERIDA:** acrescentar: "exceção: DRC em programa de diálise SEM doença cardiovascular estabelecida — recomenda-se CONTRA iniciar estatina (FORTE/ALTA); quem já usa e entra em diálise é decisão à parte."

---

**ENTRADA #15 — Dislipidemia e prevenção da aterosclerose (SBC 2025)**
**SEVERIDADE: OMISSÃO**
**O QUE O NÚCLEO DIZ:** "Dosar Lp(a) uma vez na vida em todos os adultos (ensaio em nmol/L, independente de isoforma)."
**O QUE A FONTE DIZ:** « a medida da lp(a) por ensaio não independente da isoforma, ou seja, que mede unidades de massa (mg/dl), pode ser usada quando for a única disponível. » (FORTE, certeza ALTA)
**ONDE:** mesmo extrato, fato 83
**CONDUTA QUE SAI DISSO:** no Brasil o ensaio em mg/dL é o comum; lida sozinha, a entrada faz o médico **deixar de pedir** Lp(a) por não ter o ensaio "certo" — a diretriz manda pedir assim mesmo.
**CORREÇÃO SUGERIDA:** "… preferir ensaio independente da isoforma (nmol/L); quando só houver o ensaio em massa (mg/dL), usá-lo — não converter entre unidades."

---

**ENTRADA #1 — Dislipidemia no DM (SBD)**
**SEVERIDADE: SÉRIO**
**O QUE O NÚCLEO DIZ:** "estatina de alta intensidade → ezetimiba → iPCSK9"
**O QUE A FONTE DIZ:** « em indivíduos de alto risco cardiovascular, recomenda-se a favor da **terapia inicial** com estatina de alta intensidade **e** ezetimiba… » (fato 104); « em indivíduos de extremo risco… terapia **inicial** com estatina de alta intensidade, ezetimiba **e** terapia anti-pcsk9… » (fato 106); « a terapia combinada passa a ser recomendada como **primeira linha** de tratamento nesses grupos » (fato 222). Todas FORTE/ALTA.
**ONDE:** `1F9LgLNgc8DPmIR4IP5lUI1msIvJQECr-.json` fatos 104, 105, 106, 222
**CONDUTA QUE SAI DISSO:** a seta lê-se como escada — dá estatina, espera, reavalia, só então soma ezetimiba, só depois iPCSK9. É inércia terapêutica em diabético de alto risco, meses de LDL acima da meta.
**CORREÇÃO SUGERIDA:** trocar as setas por "terapia combinada desde o início: estatina de alta intensidade + ezetimiba no alto risco; + anti-PCSK9 no muito alto/extremo (a escada sequencial foi abandonada)".
**Ressalva de prova:** o documento da SBD **não está no acervo**. O que está provado é o que a diretriz brasileira que ESTÁ no acervo (SBC 2025) recomenda, com força máxima — e que a entrada #15 do próprio núcleo já diz "terapia combinada precoce". As duas entradas do núcleo se contradizem entre si.

---

**ENTRADA #1 — Dislipidemia no DM (SBD)**
**SEVERIDADE: IMPRECISO**
**O QUE O NÚCLEO DIZ:** "muito alto <50, alto <70, intermediário/baixo <100 mg/dL"
**O QUE A FONTE DIZ:** « em indivíduos de risco cardiovascular baixo, recomenda-se a favor das metas de ldl-c < 115 mg/dl e de não-hdl-c < 145 mg/dl » (fato 1); « baixo risco < 115 ≥ 30% < 145 < 100 » (Tabela 5.1, fato 6); e no diabetes « a diretriz classifica o risco cardiovascular em **quatro** categorias — intermediário, alto, muito alto e extremo » (fato 54).
**ONDE:** mesmo extrato, fatos 1, 6, 54; categoria extremo em 5, 10, 29, 30
**CONDUTA QUE SAI DISSO:** duas coisas. (a) o "/baixo" não tem referente: pela SBC ninguém com diabetes é de baixo risco, e fora do diabetes a meta de baixo risco é <115, não <100. (b) falta a categoria de risco EXTREMO — o diabético com múltiplos eventos ateroscleróticos tem meta <40 pela entrada #15 e <50 por esta, no mesmo prompt.
**CORREÇÃO SUGERIDA:** "no DM a estratificação vai de intermediário a extremo (não há 'baixo'): extremo <40, muito alto <50, alto <70, intermediário <100 mg/dL — e cite a fonte junto do número, porque SBD, SBC 2025 e ADA 2026 trazem números vizinhos e diferentes."

---

**ENTRADA #60 — Síndrome de quilomicronemia familiar (FCS)** *(e, por tabela, #15)*
**SEVERIDADE: OMISSÃO**
**O QUE O NÚCLEO DIZ:** "novas terapias anti-apoC-III (volanesorsen, olezarsen) reduzem TG." (#15: "quilomicronemia familiar → volanesorsena")
**O QUE A FONTE DIZ:** « …a volanesorsena reduziu a chance de pancreatite em 82%… apesar de resultados promissores, **a trombocitopenia emergiu como evento adverso frequente**. » (fato 483); e « a olezarsena quanto a plozasirana **estão em fase de testes e não estão aprovadas para uso no brasil**. » (fato 488) — enquanto a volanesorsena « está aprovada no brasil para adultos com síndrome da quilomicronemia familiar » (fato 484).
**ONDE:** mesmo extrato, fatos 483, 484, 488
**CONDUTA QUE SAI DISSO:** prescreve-se volanesorsena sem plaquetas de base nem monitorização (o evento adverso frequente é justamente trombocitopenia), e oferece-se ao paciente uma droga — olezarsena — que ele não tem como comprar no Brasil.
**CORREÇÃO SUGERIDA:** "volanesorsena (aprovada no Brasil para adulto com FCS) — monitorar plaquetas, trombocitopenia é evento adverso frequente; olezarsena e plozasirana ainda em ensaio, não aprovadas no Brasil."

---

**ENTRADA #43 — Síndrome dos ovários policísticos (Diretriz Internacional 2023)**
**SEVERIDADE: OMISSÃO**
**O QUE O NÚCLEO DIZ:** "diagnóstico em adultas por Rotterdam (2 de 3: …)" — e nada mais sobre excluir outras causas.
**O QUE A FONTE DIZ:** « …two of the following: i) clinical/biochemical hyperandrogenism; ii) ovulatory dysfunction; and iii) polycystic ovaries on ultrasound… **exclusion of other aetiologies.** » (fato 1) e, no algoritmo: « exclusion of other causes = **tsh, prolactin, 17-oh progesterone, fsh** or if clinically indicated exclude other causes (eg, cushing's syndrome, adrenal tumours). » (fato 10)
**ONDE:** `1lExtghh9pvtQfYx7OIucuc-d4uo5AV2q.json` fatos 1 e 10
**CONDUTA QUE SAI DISSO:** mulher com hirsutismo + ciclo irregular sai com rótulo de SOP e vai para anticoncepcional — sem 17-OHP (HAC não clássica), sem prolactina (prolactinoma), sem TSH, sem pensar em tumor produtor de androgênio. É o diagnóstico que se perde, não o que se erra.
**CORREÇÃO SUGERIDA:** acrescentar ao critério: "2 de 3 **e exclusão de outras causas: TSH, prolactina, 17-OH-progesterona, FSH — e, se indicado, Cushing e tumor adrenal/ovariano**."

---

**ENTRADA #43 — Síndrome dos ovários policísticos (Diretriz Internacional 2023)**
**SEVERIDADE: OMISSÃO**
**O QUE O NÚCLEO DIZ:** "metformina e AR GLP-1 para peso/metabolismo; letrozol é 1ª linha para anovulação/infertilidade."
**O QUE A FONTE DIZ:** « healthcare professionals should ensure **concurrent effective contraception** when pregnancy is possible for women who take glp-1 receptor agonists, **as pregnancy safety data are lacking**. »
**ONDE:** mesmo extrato, fato 150 (ver também 152: alto risco de reganho ao parar, sem dados de segurança de longo prazo)
**CONDUTA QUE SAI DISSO:** a mesma linha manda AR GLP-1 e, adiante, letrozol para engravidar. Prescreve-se semaglutida a uma mulher que está tentando conceber, sem contracepção concomitante — na população em que a gravidez é o desfecho buscado.
**CORREÇÃO SUGERIDA:** "…AR GLP-1 para peso/metabolismo **exigindo contracepção eficaz concomitante enquanto houver possibilidade de gravidez (faltam dados de segurança na gestação) e suspensão programada antes de tentar conceber**."

---

**ENTRADA #43 — Síndrome dos ovários policísticos (Diretriz Internacional 2023)**
**SEVERIDADE: OMISSÃO**
**O QUE O NÚCLEO DIZ:** "contraceptivo hormonal combinado para irregularidade/hiperandrogenismo"
**O QUE A FONTE DIZ:** « the 35 μg ethinyl oestradiol plus cyproterone acetate preparations should be considered as **second-line therapy** over other cocps, balancing benefits and adverse effects, **including venous thromboembolic risks**. » (fato 133); e « não há vantagem clínica em usar etinilestradiol em dose alta (≥30 μg) em vez de dose baixa (<30 μg) no tratamento do hirsutismo » (fato 131); preferir 20–30 µg ou estrogênio natural (fato 135).
**ONDE:** mesmo extrato, fatos 131, 133, 135
**CONDUTA QUE SAI DISSO:** no Brasil "COC para SOP/hirsutismo" é reflexo de EE 35 µg + acetato de ciproterona. A entrada, lida sozinha, autoriza esse reflexo — a diretriz rebaixa essa formulação a segunda linha justamente por tromboembolismo venoso.
**CORREÇÃO SUGERIDA:** "…contraceptivo combinado, preferindo a menor dose eficaz de estrogênio (20–30 µg de EE ou estrogênio natural); **EE 35 µg + acetato de ciproterona é 2ª linha, por risco tromboembólico venoso**."

---

**ENTRADA #43 — Síndrome dos ovários policísticos (Diretriz Internacional 2023)**
**SEVERIDADE: IMPRECISO**
**O QUE O NÚCLEO DIZ:** "Nomenclatura: o termo oficial segue sendo SOP, mas há uma TENDÊNCIA (ainda não oficial) de renomear a condição … (ex.: 'Síndrome Ovariana Metabólica Poliendócrina, **SOMP**')"
**O QUE A FONTE DIZ:** nada. Busca no texto-fonte da diretriz de 2023, em três formas: `nomenclat` = 0, `terminolog` = 0, `polyendocrine` = 0, `metabolic ovarian` = 0, `new name` = 0, `name change` = 0. A única ocorrência de `renam` está no **título de uma referência** ("…on features of PCOS and renaming the syndrome. JCEM 2014").
**ONDE:** `scratchpad/acervo/textos/1lExtghh9pvtQfYx7OIucuc-d4uo5AV2q.txt` — 6 buscas, 0 ocorrências no corpo
**CONDUTA QUE SAI DISSO:** o modelo devolve, com o crachá "Diretriz Internacional 2023", uma sigla que a diretriz de 2023 não propõe. Pior: a sigla **SOMP não existe em fonte alguma do repositório** — a nota do cofre usa **PMOS** (*polyendocrine metabolic ovarian syndrome*, Nat Rev Endocrinol 2026). Um médico que procure "SOMP" na literatura não acha nada.
**CORREÇÃO SUGERIDA:** tirar a sentença de dentro da entrada rotulada 2023 e, se ela for mantida, escrevê-la com a sigla que a literatura usa e a fonte certa: "há proposta de renomear SOP → **PMOS** (*polyendocrine metabolic ovarian syndrome*, revisão Nat Rev Endocrinol 2026); o termo oficial da diretriz de 2023 segue sendo SOP/PCOS."

---

**ENTRADA #77 — Crinecerfonte para hiperplasia adrenal congênita clássica**
**SEVERIDADE: OMISSÃO**
**O QUE O NÚCLEO DIZ:** "permitindo **BAIXAR** a dose de glicocorticoide (redução ~27% mantendo o controle da androstenediona) rumo a doses fisiológicas."
**O QUE A FONTE DIZ:** « **throughout the life span, the primary goal of therapy for each patient is to replace the adrenal insufficiency of cah** in order to maintain normal plasma volume and physiological balance » (fato 95); « patients should be provided with detailed information about **stress glucocorticoid dosing**, medical alert identification, and **emergency use of hydrocortisone injection** » (fato 96); e « na hac, pacientes de todas as idades correm risco de morte por crise adrenal » (fato 46).
**ONDE:** `1N2A6cHWpimOuBeHvjqMlu8vaipe-WDVf.json` fatos 46, 95, 96
**CONDUTA QUE SAI DISSO:** a única direção que a entrada dá é "descer a dose". Sem o piso — a reposição da insuficiência adrenal não é negociável — e sem a regra da dose de estresse, desce-se o glicocorticoide de um paciente que continua adrenal-insuficiente. O desfecho dessa direção é crise adrenal, que na HAC mata em todas as idades.
**CORREÇÃO SUGERIDA:** acrescentar: "**é adjuvante, não substituto**: a reposição da insuficiência adrenal continua sendo o objetivo primário por toda a vida, e a redução do glicocorticoide vai até a dose fisiológica de reposição, nunca abaixo — mantidas a orientação de dose de estresse, a identificação de alerta médico e a hidrocortisona injetável de emergência."
**Ressalva de prova (importante):** as afirmações específicas do crinecerfonte — CAHtalyst, redução ~27%, aprovação FDA dez/2024, ≥4 anos — **não têm fonte no repositório**. O texto do NEJM 2020 tem `crinecerfont` = 0 ocorrências; o que o extrato traz sobre isso é uma anotação editorial que, no campo `conflito`, **cita o próprio núcleo** como razão ("O NÚCLEO PREVALECE nesse ponto"). Isso é circular: o núcleo não confirma o núcleo. Precisa de conferência humana contra os ensaios CAHtalyst e a bula.

---

**ENTRADA #48 — Puberdade precoce central (Endocrine Society 2026)**
**SEVERIDADE: OMISSÃO**
**O QUE O NÚCLEO DIZ:** "parte das crianças dentro dessa definição **pode não exigir a mesma extensão de investigação/tratamento** — individualizar (idade, ritmo de progressão, previsão de estatura)."
**O QUE A FONTE DIZ:** o acervo não tem artigo de puberdade precoce. O que existe, verbatim, é a via secundária: « elevated circulating levels of adrenal sex steroids accelerate skeletal maturation and **may trigger an early onset of central puberty** » (HAC, fato 59).
**ONDE:** `1N2A6cHWpimOuBeHvjqMlu8vaipe-WDVf.json` fato 59 — conferência **parcial**, por falta de fonte do próprio assunto
**CONDUTA QUE SAI DISSO:** a entrada é a única coisa que o modelo tem sobre o tema e a sua única recomendação operacional é **investigar menos**. Ela não nomeia uma única coisa que a investigação procura — nem causa central, nem causa periférica dirigindo a puberdade central (HAC é uma delas, documentada acima). Encurtar a investigação sem dizer do que se está abrindo mão é uma instrução de fazer menos sem critério.
**CORREÇÃO SUGERIDA:** manter a individualização, mas nomeando o que não se abre mão: "individualizar a extensão da investigação **pelo ritmo de progressão e pela idade — sem dispensar a busca de causa (lesão do SNC; causas periféricas que disparam puberdade central, como HAC), que é o que a investigação existe para achar**."

---

## 2. ACHADOS APOIADOS SÓ EM NOTA DO COFRE
*(a nota é resumo, não citação; onde núcleo e nota concordam, **os dois estão inconferidos** — o
PDF do documento não está em `scratchpad/acervo/textos/`)*

---

**ENTRADA #59 — Hipogonadismo feminino (síntese de diretrizes 2025)**
**SEVERIDADE: SÉRIO**
**O QUE O NÚCLEO DIZ:** "insuficiência ovariana prematura (POI: **amenorreia + FSH elevado** antes dos 40 anos)"
**O QUE A NOTA DIZ:** "Critérios (ESHRE/NICE): **distúrbio menstrual (amenorreia/oligomenorreia ≥ 4 meses)** + **FSH elevado (> 25 IU/L [ESHRE] ou > 30 IU/L [NICE])** em **2 ocasiões com ≥ 4 semanas de intervalo**."
**ONDE:** `cofre/Diretrizes Clínicas/Insuficiência Ovariana Prematura (revisão, Endocrine Reviews 2025).md` — **sem extrato verbatim; núcleo e nota não foram conferidos contra o artigo**
**CONDUTA QUE SAI DISSO:** erra para os dois lados. Sem o número e sem a repetição, um FSH único de 20 vira "elevado" e a mulher recebe diagnóstico de falência ovariana e reposição por décadas; e como só "amenorreia" conta, a mulher com oligomenorreia de 5 meses e FSH 30 não é investigada — perde-se a proteção óssea e cardiovascular que a própria entrada diz existir.
**CORREÇÃO SUGERIDA:** "POI = **distúrbio menstrual (amenorreia OU oligomenorreia ≥4 meses) + FSH >25 IU/L (ESHRE; >30 pelo NICE) confirmado em 2 dosagens com ≥4 semanas de intervalo**, antes dos 40 anos."

---

**ENTRADA #36 — Vitamina D para prevenção de doenças (Endocrine Society 2024)**
**SEVERIDADE: OMISSÃO**
**O QUE O NÚCLEO DIZ:** "NÃO rastrear 25-OH-vitamina D de rotina na população geral saudável … Fora desses grupos, não dosar 25OHD sem indicação nem usar doses altas de rotina."
**O QUE A NOTA DIZ:** "**Escopo — NÃO se aplica a:** condições que alteram a fisiologia da vit. D (má-absorção, bypass/cirurgia bariátrica, DII, DRC, síndrome nefrótica), indicação estabelecida de dosar 25(OH)D (ex.: hipocalcemia), **alto risco de fratura** e **< 1 ano**."
**ONDE:** `cofre/Diretrizes Clínicas/Vitamina D para Prevenção de Doenças (Endocrine Society 2024).md` — **sem extrato verbatim**
**CONDUTA QUE SAI DISSO:** a entrada é lida como regra geral. O paciente com osteoporose de alto risco de fratura, o pós-bariátrico, o DRC e o com má-absorção estão **fora** do escopo da diretriz — e a entrada os empurra para "não dosar". Não medir 25OHD antes de um antirreabsortivo potente é o erro com desfecho imediato (hipocalcemia).
**CORREÇÃO SUGERIDA:** abrir a entrada pelo escopo: "vale para **indivíduos saudáveis sem indicação estabelecida**; **não se aplica** a má-absorção/bariátrica/DII, DRC e síndrome nefrótica, alto risco de fratura, indicação estabelecida de dosar (ex.: hipocalcemia) e menores de 1 ano — nesses, dosar e tratar segue valendo."

---

**ENTRADA #36 — Vitamina D para prevenção de doenças (Endocrine Society 2024)**
**SEVERIDADE: IMPRECISO**
**O QUE O NÚCLEO DIZ:** "suplementação empírica … tem benefício apenas em grupos específicos — … e **pré-diabetes** (reduz progressão para DM2)."
**O QUE A NOTA DIZ:** "**Pré-diabetes de alto risco (2–3 critérios glicêmicos da ADA) + estilo de vida:** suplementar." E, no cabeçalho: "Todas as recomendações são **condicionais (grau 2)**, certeza baixa–moderada."
**ONDE:** mesma nota — **sem extrato verbatim**
**CONDUTA QUE SAI DISSO:** suplementa-se todo pré-diabético (uma população enorme) com dose acima da IDR, quando o grupo estudado era o de alto risco glicêmico e a recomendação é condicional, não forte. A entrada também converte "sugere-se contra" em "NÃO rastrear", categórico.
**CORREÇÃO SUGERIDA:** "…**pré-diabetes de alto risco (2–3 critérios glicêmicos da ADA), somado à intervenção no estilo de vida**"; e marcar que **todas** as recomendações desta diretriz são condicionais, de certeza baixa a moderada.

---

**ENTRADA #5 — Hipogonadismo masculino (SBEM/SBU/ABEMSS 2026)**
**SEVERIDADE: OMISSÃO**
**O QUE O NÚCLEO DIZ:** "Contraindicações ABSOLUTAS: … CA de próstata ativo/suspeito **sem avaliação urológica** …"
**O QUE A NOTA DIZ:** "câncer de próstata ativo ou suspeito sem avaliação urológica (Classe I/B; **toque + PSA antes em 55–69 anos, ou 40–69 se risco aumentado**)"
**ONDE:** `cofre/Diretrizes Clínicas/Hipogonadismo Masculino — Posicionamento SBEM-SBU-ABEMSS (Int Braz J Urol 2026).md` — **sem extrato verbatim; a nota diz ter sido conferida contra o PDF, mas o PDF não está no acervo**
**CONDUTA QUE SAI DISSO:** "avaliação urológica" sem dizer o que é vira nada. Começa-se testosterona sem toque retal nem PSA basal na faixa em que eles são exigidos — e o PSA de acompanhamento (3/6/12 meses, que a entrada tem) passa a não ter linha de base contra a qual medir velocidade.
**CORREÇÃO SUGERIDA:** "…CA de próstata ativo/suspeito — **antes de iniciar, toque retal + PSA nos homens de 55–69 anos (ou 40–69 com risco aumentado)**."

---

**ENTRADA #5 — Hipogonadismo masculino (SBEM/SBU/ABEMSS 2026)**
**SEVERIDADE: OMISSÃO**
**O QUE O NÚCLEO DIZ:** "PSA em 3/6/12 meses; encaminhar ao urologista se velocidade >0,75 ng/mL/ano ou alta >1,4 ng/mL em 12 meses."
**O QUE A NOTA DIZ:** "…**alta de até ~1,0 ng/mL nos primeiros 3–6 meses é esperada**; urologista se velocidade > 0,75 ng/mL/ano ou alta > 1,4 ng/mL em 12 meses; **cortes por idade > 2,5 (40–49), > 3,5 (50–59), > 4,0 (≥ 60)**."
**ONDE:** mesma nota — **sem extrato verbatim**
**CONDUTA QUE SAI DISSO:** dois erros de sinal opostos. Sem os cortes absolutos por idade, um PSA de 5,0 num homem de 45 anos que subiu devagar não dispara encaminhamento. E sem a informação de que a subida inicial de até ~1,0 é esperada, suspende-se a reposição por um achado fisiológico.
**CORREÇÃO SUGERIDA:** acrescentar as duas coisas: a alta esperada de até ~1,0 ng/mL nos primeiros 3–6 meses e os cortes absolutos por idade (>2,5 / >3,5 / >4,0).

---

**ENTRADA #5 — Hipogonadismo masculino (SBEM/SBU/ABEMSS 2026)**
**SEVERIDADE: IMPRECISO**
**O QUE O NÚCLEO DIZ:** "<264 ng/dL apoia, **>350 ng/dL exclui**, 264–350 = zona cinzenta"
**O QUE A NOTA DIZ:** "> 350 ng/dL | **tipicamente** exclui"
**ONDE:** mesma nota, tabela dos três patamares — **sem extrato verbatim**
**CONDUTA QUE SAI DISSO:** o homem sintomático com testosterona de 380 recebe "excluído" em vez de "tipicamente excluído, reavalie clinicamente" — e a investigação para por aí.
**CORREÇÃO SUGERIDA:** devolver o qualificador: ">350 ng/dL tipicamente exclui".

---

**ENTRADA #82 — Cuidado de pessoas transgênero (WPATH SOC-8, 2022)**
**SEVERIDADE: OMISSÃO**
**O QUE O NÚCLEO DIZ:** "Usar a SOC-8 (2022) como referência atual, **ao lado das metas laboratoriais/monitorização da ES**." — e não traz uma única meta ou item de monitorização.
**O QUE A NOTA DIZ:** estradiol **100–200 pg/mL**, testosterona **<50 ng/dL** na mulher trans; testosterona **≈400–700 ng/dL** no homem trans, medida no meio do intervalo; **evitar etinilestradiol** (risco tromboembólico e não se consegue dosar); "estrogênio → **risco MUITO ALTO de tromboembolismo**"; "testosterona → **risco MUITO ALTO: eritrocitose (Hct > 50%)**"; hematócrito basal e periódico; **prolactina** na mulher trans; avaliação a cada 3 meses no 1º ano.
**ONDE:** `cofre/Diretrizes Clínicas/Tratamento Endócrino de Pessoas Transgênero (Endocrine Society 2017).md` — **sem extrato verbatim**
**CONDUTA QUE SAI DISSO:** a entrada é um ponteiro para um documento que o modelo não tem. Lida sozinha, ela manda "usar a SOC-8" e devolve o resto por memória, sem âncora — e o que fica de fora é justamente a parte que mata: tromboembolismo com estrogênio, eritrocitose com testosterona, etinilestradiol. **Medido:** a área `Transgeneridade` existe no roteador e tem **0 blocos** na base profunda; não há reforço vindo de lugar nenhum.
**CORREÇÃO SUGERIDA:** ou a entrada carrega os números que ela promete (alvos de estradiol/testosterona, hematócrito, prolactina, evitar etinilestradiol, risco tromboembólico muito alto), ou ela não deve prometer "ao lado das metas da ES" — porque essas metas não estão em lugar nenhum do sistema.

---

## 3. ⚠️ SUSPEITAS QUE NÃO PUDE CONFERIR (não são achados — precisam de conferência humana)

Registro-as porque o brief pede direção de erro, mas **não tenho fonte** e não vou classificá-las
numa severidade que eu não posso sustentar.

1. **#81 (TH da menopausa)** — "a TH é o tratamento MAIS eficaz para os sintomas vasomotores **e
   para a síndrome geniturinária**". A nota do cofre sustenta a primeira metade ("TRH = a mais
   eficaz para SVM"), **não** a segunda; ela não fala de síndrome geniturinária. Lida sozinha, a
   frase manda terapia hormonal sistêmica para uma mulher com queixa geniturinária isolada.
   Conferir contra o posicionamento NAMS/The Menopause Society 2022 (o documento não está no
   repositório).
2. **#81** — "Individualizar por risco de câncer de mama, TEV e AVC" é a única coisa que a entrada
   diz sobre contraindicação. "Individualizar" e "contraindicado" são condutas diferentes.
   Conferir se o posicionamento traz contraindicações formais e, se traz, nomeá-las.
3. **#83 (TRAVERSE)** — "em homens com hipogonadismo (**T <300 ng/dL**)". Esse é o critério de
   entrada do ensaio, não um corte diagnóstico — mas a entrada não diz isso, e a entrada #5 do
   mesmo núcleo usa 264 / 264–350 / 350. São dois números de testosterona no mesmo prompt.
   Conferir contra o NEJM 2023 (não está no acervo; `TRAVERSE` = 0 ocorrências como ensaio).
4. **#80 (fogachos)** — "ELINZANETANTE (duplo NK1/NK3; FDA out/2025)" e "FEZOLINETANTE … 45 mg/dia"
   não têm fonte alguma no repositório (`elinzanetant` = 0 no acervo e no cofre). A entrada já traz
   a ressalva honesta "(Verificar status ANVISA.)" — mantê-la.

---

## 4. ROTEAMENTO — MEDIDO, não deduzido

Rodei `canonArea`/`deepFor` de `lib/clinical-deep.js` sobre perguntas reais
(`mede-roteamento-auditor-fmpl.js`, nesta pasta). Duas coisas precisam ficar separadas:

- **O núcleo chega sempre.** Ele vai em toda chamada; nenhuma entrada deste lote deixa de chegar
  ao modelo por falta de área. Não é disso que se trata abaixo.
- **A base PROFUNDA é que não chega.** É o reforço com citação verificada que some.

### As 4 entradas sem área canônica — assunto de cada uma, e o que acontece

| `i` | assunto | `canonArea` da pergunta típica | base profunda entregue |
|---|---|---|---|
| **11** | **GH de ação prolongada** (lonapegsomatropina, somapacitana, somatrogon; semanal × diário; IGF-1 e farmacocinética) | "GH de ação prolongada" → **nenhuma**; "hormônio de crescimento semanal…" → **Neuroendocrinologia** | vazio, ou **11.932 chars de acromegalia/craniofaringioma/prolactinoma** — conteúdo de adulto para uma pergunta pediátrica |
| **36** | **Vitamina D para prevenção** (não rastrear; suplementação só em grupos específicos) | "vitamina D" → **nenhuma**; "colecalciferol em pré-diabetes" → **Diabetes** | vazio, ou 11.906 chars de Diabetes **sem uma linha de vitamina D** |
| **53** | **Acondroplasia — vosoritida** (análogo do CNP; seleção, início, monitorização, suspensão) | **nenhuma**, em todas as formulações testadas | vazio |
| **82** | **Cuidado de pessoas transgênero** (SOC-8; hormonização de afirmação; adolescentes) | "transgeneridade" → **Transgeneridade** (0 blocos); "pessoa transgênero"/"disforia de gênero" → **nenhuma**; "homem trans em testosterona" → **Endocrinologia Masculina** (0 blocos) | vazio em todas |

### Duas classificações erradas, medidas

1. **#59 "Hipogonadismo feminino" → `canonArea` = "Endocrinologia Masculina".** A chave
   `hipogonadismo` está mapeada para Masculina (`lib/clinical-deep.js:965`) e o adjetivo "feminino"
   não desempata. A entrada sobre POI/Turner é classificada como andrologia — e Masculina tem
   **0 blocos**, então a pergunta cai em silêncio em vez de cair, ao menos, em Feminina.
2. **#77 "hiperplasia adrenal congênita" → `canonArea` = "Endocrinologia Feminina".** Medido: a
   pergunta "crinecerfonte para hiperplasia adrenal congênita clássica" recebe 11.857 chars de
   **SOP + hirsutismo**, e o artigo dedicado de HAC (Merke & Auchus, 115 fatos, arquivado em
   *Adrenal*) **não vai junto** — testei a presença do bloco no texto entregue: falso. O artigo que
   responde à pergunta é o único que não chega.

### Cobertura da base profunda, nas áreas deste lote

`Lípides` 3 blocos · `Endocrinologia Feminina` 2 · **`Endocrinologia Masculina` 0 · `Endocrinologia
Pediátrica` 0 · `Transgeneridade` 0**. Perguntas que caem em silêncio, medidas:
"hipogonadismo masculino", "testosterona baixa", "puberdade precoce", "baixa estatura na criança",
"insuficiência ovariana prematura", "síndrome de Turner", "pequeno para a idade gestacional",
"vitamina D", "acondroplasia", "vosoritida". O comentário em `clinical-deep.js:1541` lista Lípides
como área sem artigo — está desatualizado, Lípides já tem 3 blocos; Masculina, Pediátrica e
Transgeneridade continuam zeradas.

---

## 5. ENTRADAS SEM FONTE NENHUMA PARA CONFERIR

Não há artigo no acervo nem nota no cofre sobre o assunto destas. Não as aprovo e não as reprovo —
não pude ler a fonte. Ordem de prioridade para trazer o PDF, pelo dano que uma linha errada faria:

| `i` | entrada | por que urge |
|---|---|---|
| **83** | Testosterona e segurança cardiovascular (TRAVERSE) | é a linha que autoriza repor testosterona em homem de alto risco CV; carrega um segundo corte de testosterona (<300) que colide com o da #5 |
| **10** | PIG/baixo peso ao nascer (Consenso SGA 2023) | dá gatilho de tratamento (<-2,5 DP, 3–4 anos) e manda "considerar associar análogo de GnRH" sem idade, duração ou ressalva |
| **48** | Puberdade precoce central (ES 2026) | a única instrução operacional é investigar menos (ver achado parcial na seção 1) |
| **53** | Acondroplasia — vosoritida | diz que "o consenso orienta seleção, início, monitorização e suspensão" e não traz nenhum dos quatro |
| **11** | GH de ação prolongada (JCEM 2025) | "dose inicial por peso" sem a dose; "monitorar IGF-1 atentando ao tempo desde a última aplicação" sem o intervalo |

Todas as cinco compartilham o mesmo defeito de forma: **nomeiam a existência de um critério sem
entregar o critério**. Lidas sozinhas, prometem uma régua que não está lá — e o modelo preenche a
régua de memória, com a autoridade de "diretriz".

---

## 6. Achados menores (uma linha cada, não desenvolvidos)

- **#43**: a lista de rastreio ("DM2, dislipidemia, risco CV, esteatose, apneia, saúde mental") omite
  o risco de hiperplasia/câncer de endométrio, que é o único da lista com ação preventiva própria —
  regularizar ciclo e progestagênio regular (extrato SOP, fatos 89 e 90).
- **#60**: a suspeita de FCS é descrita só qualitativamente; a diretriz recomenda **escore clínico**
  (Moulin, ≥10 = muito provável, TG >885 mg/dL em ≥3 dosagens) e **teste genético** com painel de
  LPL/GPIHBP1/LMF1/APOA5/APOC2 (fatos 248–250, 386–389).
- **#15**: a entrada não traz o que o extrato registra como lacuna útil — tetos de dose com
  imunossupressor e antirretroviral, conduta na gestação, e a posição brasileira que **freia** a
  recomendação europeia de fitosteróis.

---

## NÚMEROS

- **Entradas examinadas: 16** (i = 1, 5, 10, 11, 15, 36, 43, 48, 53, 59, 60, 77, 80, 81, 82, 83)
- **Conferidas contra fonte verbatim: 5** — #1 (parcial: SBD ausente, conferida contra SBC 2025),
  #15, #43, #60 (integrais) e #77 (parcial: contexto de HAC sim, as afirmações do crinecerfonte não).
  A #48 recebeu só uma conferência tangencial (um fato do artigo de HAC) — está contada abaixo,
  entre as sem fonte, e não entre estas cinco.
- **Só com nota do cofre: 6** — #5, #36, #59, #80, #81, #82. Onde núcleo e nota concordam, **os dois
  estão inconferidos**: nenhum dos PDFs (SBEM/SBU/ABEMSS 2026, Endocrine Society 2024 de vitamina D,
  Endocrine Reviews 2025 de POI, Nat Rev 2026 de sintomas vasomotores, Endocrine Society 2017 de
  pessoas transgênero) está em `scratchpad/acervo/textos/`.
- **Sem fonte nenhuma: 5** — #10, #11, #48, #53, #83.

Achados: **19 graduados** — **0 GRAVE · 2 SÉRIO · 13 OMISSÃO · 4 IMPRECISO** — mais 4 suspeitas
declaradamente não confirmadas (seção 3) e 3 achados menores (seção 6).
Nenhum GRAVE: nenhuma entrada deste lote inverte uma prescrição ou um corte. O padrão do lote é
outro e é consistente — **a entrada dá o número e cala a condição que o valida**, ou dá a direção
("baixar a dose", "investigar menos", "dosar Lp(a) só em nmol/L") sem o limite que a torna segura.

**Tokens:** não tenho medidor nesta sessão. Pela massa de texto lida (brief, 16 entradas, metadados
e ~1.000 fatos filtrados de 3 extratos, 5 notas do cofre, citações literais, medições de roteamento)
e escrita, a estimativa grosseira é da ordem de **100–130 mil tokens** acumulados.
