// Artigos (resumos estruturados de estudos) — lote piloto Diabetes + Obesidade.
// Formato de card padronizado: pergunta/população, intervenção vs comparador,
// desfecho primário + resultado-chave, segurança, e "o que muda na prática".
// ⚠️ Conteúdo para REVISÃO do professor antes de publicar (números de trial).
'use strict';

const A = (o) => Object.assign({ tipo: 'artigo', privado: true, titulo: '' }, o);

// ───────────────────────────── DIABETES ─────────────────────────────
const DIABETES = [

A({ sub:'Diabetes', tema:'UKPDS 33 (1998)', fonte:'The Lancet', ano:'1998',
  url:'https://doi.org/10.1016/S0140-6736(98)07019-6',
  pts:[
    '**Pergunta / população** — Em DM2 **recém-diagnosticado** (n=3.867), o controle glicêmico intensivo reduz complicações?',
    '**Intervenção vs comparador** — Intensivo com **sulfonilureia ou insulina** (alvo glicemia de jejum <108 mg/dL) vs **convencional** (dieta, medicação só se sintomas/glicemia >270 mg/dL). Mediana de 10 anos.',
    '**Desfecho primário** — Três compostos: qualquer desfecho relacionado ao diabetes, mortes relacionadas ao diabetes e morte por qualquer causa.',
    '**Resultado-chave** — HbA1c média **7,0% vs 7,9%**. Qualquer desfecho relacionado ao diabetes **RR 0,88** (IC95% 0,79–0,99; p=0,029) — redução de 12%, **dirigida pelo componente microvascular** (RR 0,75; p=0,0099, sobretudo fotocoagulação retiniana). IAM RR 0,84 (p=0,052) — **não significativo** no estudo original.',
    '**Segurança** — Mais **hipoglicemia** e **ganho de peso** no braço intensivo (maior com insulina). Sem excesso de mortalidade.',
    '💡 **O que muda na prática** — Fundou a ideia de que *controle glicêmico protege a microvasculatura*. O benefício macrovascular só apareceu no **seguimento pós-estudo de 10 anos (UKPDS 80, 2008)** — o **efeito legado/memória metabólica** —, base para tratar o DM2 de forma agressiva **desde o diagnóstico**.'
  ],
  resumo:`## Por que este estudo importa
O UKPDS é o **estudo fundador do tratamento do DM2**. Antes dele não havia prova randomizada de que baixar a glicemia mudasse desfechos clínicos nesse tipo de diabetes (o DCCT havia respondido isso para o DM1, em 1993).

## Desenho
- **3.867 adultos** com DM2 **recém-diagnosticado**, após 3 meses de dieta.
- Randomizados para **controle intensivo** (sulfonilureia — clorpropamida, glibenclamida — ou insulina) ou **convencional** (dieta isolada, com fármaco apenas se hiperglicemia sintomática).
- Mediana de seguimento de **10 anos**.

## Resultados
- Separação glicêmica modesta e realista: **HbA1c 7,0% no intensivo vs 7,9% no convencional**.
- **Qualquer desfecho relacionado ao diabetes: RR 0,88** (IC95% 0,79–0,99; p=0,029).
- O ganho concentrou-se no **desfecho microvascular: RR 0,75** (p=0,0099) — em boa parte menos necessidade de **fotocoagulação retiniana**.
- **IAM: RR 0,84 (p=0,052)** — a famosa "quase significância", que na época alimentou o debate sobre haver ou não proteção macrovascular.
- Sem diferença em mortalidade **durante** o estudo.

## Segurança
**Hipoglicemia** e **ganho de peso** foram maiores no braço intensivo — mais pronunciados com insulina do que com sulfonilureia. É a contrapartida clássica das terapias glicocêntricas antigas.

## O legado (UKPDS 80, 2008)
Dez anos após o fim da randomização — com as curvas de HbA1c já **sobrepostas** entre os grupos — o braço originalmente intensivo manteve redução de **IAM (15%)** e **morte por qualquer causa (13%)**. É o **efeito legado** (ou *memória metabólica*): o controle precoce deixa um benefício que persiste mesmo quando o controle posterior se iguala.

## O que muda na prática
- Justifica **tratar bem desde o diagnóstico**, e não "esperar piorar".
- Explica por que as diretrizes recomendam **metas mais rígidas em quem tem doença curta e pouca comorbidade**, e mais frouxas em idosos frágeis com longa duração — nesse grupo, os estudos posteriores (ACCORD, ADVANCE, VADT) não repetiram o benefício e o ACCORD mostrou **dano** com metas muito agressivas.
- Atenção ao interpretar: o UKPDS **não** prova benefício macrovascular imediato. Esse é um erro clássico de prova.`,
  flashcards:[
    {q:'Qual foi a diferença de HbA1c entre os braços do UKPDS 33 e o principal desfecho beneficiado?',a:'HbA1c 7,0% (intensivo) vs 7,9% (convencional). O benefício foi **microvascular** (RR 0,75), principalmente menos fotocoagulação retiniana; o desfecho composto "qualquer evento relacionado ao diabetes" caiu 12% (RR 0,88).'},
    {q:'O UKPDS 33 demonstrou redução significativa de infarto durante o estudo?',a:'Não. IAM teve RR 0,84 com p=0,052 — não significativo. A redução de IAM (15%) só apareceu no seguimento observacional de 10 anos (UKPDS 80, 2008).'},
    {q:'O que é "efeito legado" (memória metabólica) no UKPDS?',a:'A persistência do benefício do controle glicêmico precoce mesmo depois que as HbA1c dos grupos se igualaram — sustenta tratar o DM2 de forma intensiva desde o diagnóstico.'},
    {q:'Quais os efeitos adversos mais frequentes no braço intensivo do UKPDS?',a:'Hipoglicemia e ganho de peso, mais acentuados com insulina do que com sulfonilureia.'}
  ]}),

A({ sub:'Diabetes', tema:'EMPA-REG OUTCOME (2015)', fonte:'NEJM', ano:'2015',
  url:'https://doi.org/10.1056/NEJMoa1504720',
  pts:[
    '**Pergunta / população** — Em DM2 com **doença cardiovascular estabelecida** (n=7.020), a empagliflozina é segura — e talvez benéfica — do ponto de vista cardiovascular?',
    '**Intervenção vs comparador** — **Empagliflozina 10 mg ou 25 mg** vs **placebo**, somadas ao tratamento padrão. Mediana de 3,1 anos.',
    '**Desfecho primário** — **MACE-3**: morte cardiovascular, IAM não fatal ou AVC não fatal.',
    '**Resultado-chave** — MACE **10,5% vs 12,1%** — **HR 0,86** (IC95% 0,74–0,99; p=0,04 para superioridade). O ganho veio quase todo da **morte cardiovascular: 3,7% vs 5,9% (HR 0,62)**. **Hospitalização por insuficiência cardíaca HR 0,65** e **morte por qualquer causa HR 0,68**.',
    '**Segurança** — Aumento de **infecção genital micótica** (6,4% vs 1,8%). Sem excesso de cetoacidose, fratura ou amputação nesta coorte.',
    '💡 **O que muda na prática** — Primeiro antidiabético a **reduzir mortalidade cardiovascular**. Inaugurou a era dos iSGLT2 e deslocou a escolha do 2º fármaco de "quanto baixa a A1c" para "qual protege o coração e o rim".'
  ],
  resumo:`## Contexto
Depois da rosiglitazona, a FDA passou a exigir **estudos de segurança cardiovascular** para todo antidiabético novo. O EMPA-REG nasceu para provar **não inferioridade** — e acabou provando superioridade, com um resultado que reorganizou a diabetologia.

## Desenho
- **7.020 adultos** com DM2 e **doença cardiovascular aterosclerótica estabelecida**.
- **Empagliflozina 10 mg ou 25 mg** (agrupadas na análise primária) vs **placebo**, sobre terapia padrão.
- Mediana de seguimento: **3,1 anos**.

## Resultados
- **MACE-3: 10,5% vs 12,1% — HR 0,86** (IC95% 0,74–0,99); p=0,04 para superioridade.
- **Morte cardiovascular: 3,7% vs 5,9% — HR 0,62** (IC95% 0,49–0,77). É o componente que carrega o resultado.
- **Morte por qualquer causa: HR 0,68**.
- **Hospitalização por insuficiência cardíaca: HR 0,65**.
- **IAM não fatal e AVC não fatal**: sem redução significativa — o AVC chegou a ter tendência numérica desfavorável (HR 1,18; IC cruzando 1).

## O padrão do achado
O benefício apareceu **cedo** (curvas separam em semanas) e **não** no território aterotrombótico clássico. Isso aponta para mecanismos **hemodinâmicos e metabólicos** — natriurese, redução de pré e pós-carga, queda da pressão arterial e do peso, mudança do substrato energético miocárdico — e não para regressão de placa. É a origem do conceito de que **iSGLT2 é fármaco cardiorrenal** que também baixa glicemia.

## Segurança
- **Infecção genital micótica**: 6,4% vs 1,8% — o evento adverso característico da classe.
- Sem aumento de infecção urinária grave, fratura ou amputação nesta coorte (a sinalização de amputação veio depois, no CANVAS, com canagliflozina, e não se confirmou em estudos subsequentes).
- **Cetoacidose euglicêmica** é rara, mas é o evento que exige atenção: suspender em jejum prolongado, cirurgia ou doença aguda.

## O que muda na prática
- Em **DM2 com doença aterosclerótica estabelecida**, iSGLT2 passou a ser escolha preferencial **independentemente da HbA1c**.
- Junto com o DAPA-HF e o EMPEROR, abriu caminho para os iSGLT2 na **insuficiência cardíaca com ou sem diabetes**.
- Ponto de prova frequente: o desfecho que sustenta o EMPA-REG é **morte cardiovascular**, não infarto.`,
  flashcards:[
    {q:'Qual componente do MACE explicou o resultado do EMPA-REG OUTCOME?',a:'Morte cardiovascular (3,7% vs 5,9%; HR 0,62). IAM e AVC não fatais não foram significativamente reduzidos.'},
    {q:'Quais os HR de hospitalização por IC e de morte por qualquer causa no EMPA-REG?',a:'Hospitalização por insuficiência cardíaca HR 0,65; morte por qualquer causa HR 0,68.'},
    {q:'Qual o evento adverso mais característico observado com empagliflozina no EMPA-REG?',a:'Infecção genital micótica (6,4% vs 1,8% com placebo).'},
    {q:'Por que se atribui o benefício do EMPA-REG a mecanismos hemodinâmicos e não antiateroscleróticos?',a:'Porque as curvas separaram precocemente (semanas) e o ganho foi em morte CV e insuficiência cardíaca, não em eventos aterotrombóticos (IAM/AVC).'}
  ]}),

A({ sub:'Diabetes', tema:'LEADER (2016)', fonte:'NEJM', ano:'2016',
  url:'https://doi.org/10.1056/NEJMoa1603827',
  pts:[
    '**Pergunta / população** — Em DM2 com **alto risco cardiovascular** (n=9.340; ~81% com doença CV estabelecida), a liraglutida reduz eventos cardiovasculares?',
    '**Intervenção vs comparador** — **Liraglutida até 1,8 mg/dia SC** vs **placebo**, sobre terapia padrão. Mediana de 3,8 anos.',
    '**Desfecho primário** — **MACE-3**: morte cardiovascular, IAM não fatal ou AVC não fatal.',
    '**Resultado-chave** — MACE **13,0% vs 14,9%** — **HR 0,87** (IC95% 0,78–0,97; p=0,01 para superioridade). **Morte cardiovascular HR 0,78** e **morte por qualquer causa HR 0,85**. Desfecho renal composto **HR 0,78**, dirigido por **macroalbuminúria nova**.',
    '**Segurança** — **Eventos gastrointestinais** (náusea) foram a causa mais comum de descontinuação. Mais **colelitíase**. **Sem** aumento de pancreatite ou de carcinoma medular de tireoide.',
    '💡 **O que muda na prática** — Primeiro GLP-1 a demonstrar benefício cardiovascular. Estabeleceu os GLP-1 como opção preferencial na **doença aterosclerótica**, com padrão de benefício diferente do dos iSGLT2 (aterosclerótico e mais tardio).'
  ],
  resumo:`## Desenho
- **9.340 adultos** com DM2 e alto risco cardiovascular: idade ≥50 anos com **doença CV, cerebrovascular, arterial periférica, DRC ≥3 ou IC** (≈81% em prevenção secundária), ou ≥60 anos com fatores de risco.
- **Liraglutida titulada até 1,8 mg/dia** vs **placebo**, sobre o tratamento padrão.
- Mediana de seguimento: **3,8 anos**.

## Resultados
- **MACE-3: 13,0% vs 14,9% — HR 0,87** (IC95% 0,78–0,97); p=0,01 para superioridade e p<0,001 para não inferioridade.
- **Morte cardiovascular: 4,7% vs 6,0% — HR 0,78** (IC95% 0,66–0,93).
- **Morte por qualquer causa: HR 0,85** (IC95% 0,74–0,97).
- IAM não fatal (HR 0,88) e AVC não fatal (HR 0,89): reduções numéricas **sem significância isolada**.
- **Desfecho renal composto: HR 0,78** — quase todo explicado por **surgimento de macroalbuminúria**, sem efeito claro sobre queda de TFG ou diálise.

## O padrão do achado
Diferentemente do EMPA-REG, as curvas do LEADER **separaram tardiamente** (após ~12–18 meses) e o benefício distribuiu-se pelos componentes **ateroscleróticos**. Isso sustenta o modelo de que **GLP-1 age sobre a placa** (efeito anti-inflamatório e antiaterogênico, além de peso, pressão e glicemia), enquanto **iSGLT2 age sobre a hemodinâmica**. Daí a lógica clínica de que as classes são **complementares**, não intercambiáveis.

## Segurança
- **Náusea e outros eventos gastrointestinais**: causa mais frequente de descontinuação.
- **Colelitíase** mais frequente — efeito de classe, ligado à perda de peso e à redução da motilidade da vesícula.
- **Pancreatite aguda**: sem excesso (na verdade numericamente menor).
- **Carcinoma medular de tireoide**: sem sinal em humanos; a contraindicação em NEM2/CMT familiar vem de roedores.

## O que muda na prática
- Em **DM2 com doença aterosclerótica estabelecida**, GLP-1 e iSGLT2 são as classes com desfecho comprovado — a escolha se orienta pelo fenótipo: **IC ou DRC → iSGLT2**; **aterosclerose predominante, obesidade → GLP-1**.
- O benefício renal dos GLP-1 no LEADER é **de albuminúria**; a prova de proteção renal "dura" só veio com o **FLOW (2024)**.`,
  flashcards:[
    {q:'Qual o resultado primário do LEADER e o HR de morte cardiovascular?',a:'MACE-3 13,0% vs 14,9% (HR 0,87; p=0,01 para superioridade); morte cardiovascular HR 0,78 e morte por qualquer causa HR 0,85.'},
    {q:'Como difere o padrão temporal do benefício entre LEADER (GLP-1) e EMPA-REG (iSGLT2)?',a:'No LEADER as curvas separam tardiamente (~12–18 meses) com benefício aterosclerótico; no EMPA-REG separam em semanas com benefício em morte CV e insuficiência cardíaca (hemodinâmico).'},
    {q:'O desfecho renal do LEADER foi dirigido por qual componente?',a:'Pelo surgimento de macroalbuminúria — sem efeito claro sobre queda de TFG ou terapia renal substitutiva.'},
    {q:'A liraglutida aumentou pancreatite ou câncer medular de tireoide no LEADER?',a:'Não. Houve aumento de colelitíase e de eventos gastrointestinais; pancreatite não foi mais frequente e não houve sinal de CMT em humanos.'}
  ]}),

A({ sub:'Diabetes', tema:'SUSTAIN-6 (2016)', fonte:'NEJM', ano:'2016',
  url:'https://doi.org/10.1056/NEJMoa1607141',
  pts:[
    '**Pergunta / população** — Em DM2 de alto risco cardiovascular (n=3.297), a semaglutida subcutânea é **cardiovascularmente segura**?',
    '**Intervenção vs comparador** — **Semaglutida SC 0,5 mg ou 1,0 mg/semana** vs **placebo**. Seguimento de **104 semanas**.',
    '**Desfecho primário** — **MACE-3** (morte cardiovascular, IAM não fatal, AVC não fatal), com desenho de **não inferioridade**.',
    '**Resultado-chave** — MACE **6,6% vs 8,9%** — **HR 0,74** (IC95% 0,58–0,95); p<0,001 para não inferioridade. A redução foi dirigida por **AVC não fatal (HR 0,61)**. ⚠️ Estudo **de segurança, com poder limitado**: a superioridade é *nominal*.',
    '**Segurança** — ⚠️ **Complicações de retinopatia diabética aumentaram: 3,0% vs 1,8% — HR 1,76** (IC95% 1,11–2,78). Mais eventos gastrointestinais e descontinuação por náusea.',
    '💡 **O que muda na prática** — Consolidou o benefício CV dos GLP-1, mas trouxe o alerta da retinopatia: em quem tem **retinopatia proliferativa ou muito avançada e HbA1c muito alta**, avaliar o fundo de olho e evitar quedas glicêmicas abruptas.'
  ],
  resumo:`## Desenho
- **3.297 adultos** com DM2 e alto risco cardiovascular (≥50 anos com doença CV/DRC estabelecida, ou ≥60 anos com fatores de risco).
- **Semaglutida SC 0,5 mg ou 1,0 mg por semana** vs **placebo**.
- Seguimento de **104 semanas**. Desenho **pré-aprovação, de não inferioridade**, com número relativamente pequeno de eventos.

## Resultados
- **MACE-3: 6,6% vs 8,9% — HR 0,74** (IC95% 0,58–0,95); p<0,001 para não inferioridade.
- **AVC não fatal: HR 0,61** — o componente que dirige o resultado.
- **IAM não fatal: HR 0,74** (não significativo isoladamente).
- **Morte cardiovascular: HR 0,98** — praticamente neutra, ao contrário de LEADER e EMPA-REG.
- Redução de nova ou piora de **nefropatia: HR 0,64**, novamente à custa de **macroalbuminúria**.

⚠️ **Como interpretar**: o SUSTAIN-6 foi desenhado para *segurança*, não para provar superioridade. O IC95% de 0,58–0,95 é largo e o número de eventos, pequeno. A confirmação robusta do benefício CV da semaglutida veio depois — no **SELECT** (obesidade sem diabetes) e no **SOUL** (semaglutida oral).

## O achado da retinopatia
**Complicações de retinopatia diabética** (hemorragia vítrea, cegueira, necessidade de fotocoagulação ou anti-VEGF): **3,0% vs 1,8% — HR 1,76** (IC95% 1,11–2,78).

A leitura mais aceita é a de **piora precoce por melhora glicêmica rápida** — o mesmo fenômeno já descrito no DCCT com insulinização intensiva — e não de um efeito tóxico direto da droga: o risco concentrou-se em quem tinha **retinopatia preexistente** e **HbA1c basal alta com queda acentuada** nas primeiras 16 semanas.

## Segurança geral
Eventos **gastrointestinais** (náusea, vômito, diarreia) foram a principal causa de descontinuação — padrão de classe.

## O que muda na prática
- Antes de iniciar GLP-1 potente em paciente com **HbA1c muito elevada**, vale documentar o **fundo de olho**; havendo **retinopatia proliferativa**, tratar a retina e evitar redução glicêmica abrupta.
- Não é contraindicação — é vigilância.`,
  flashcards:[
    {q:'Qual o achado de segurança mais importante do SUSTAIN-6?',a:'Aumento de complicações de retinopatia diabética: 3,0% vs 1,8% (HR 1,76; IC95% 1,11–2,78).'},
    {q:'Qual componente do MACE dirigiu o resultado do SUSTAIN-6?',a:'AVC não fatal (HR 0,61). A morte cardiovascular foi neutra (HR 0,98).'},
    {q:'Por que a "superioridade" do SUSTAIN-6 deve ser lida com cautela?',a:'Porque era um estudo de não inferioridade, pré-aprovação, com poucos eventos e IC largo (0,58–0,95) — a superioridade é nominal. A confirmação veio com SELECT e SOUL.'},
    {q:'Qual a explicação mais aceita para a piora de retinopatia com semaglutida?',a:'Piora precoce induzida por queda glicêmica rápida em quem já tinha retinopatia e HbA1c alta — o mesmo fenômeno do DCCT — e não toxicidade direta.'}
  ]}),

A({ sub:'Diabetes', tema:'DECLARE-TIMI 58 (2019)', fonte:'NEJM', ano:'2019',
  url:'https://doi.org/10.1056/NEJMoa1812389',
  pts:[
    '**Pergunta / população** — Em DM2 de amplo espectro (n=17.160) — **59% em prevenção primária**, apenas 41% com doença CV estabelecida —, a dapagliflozina reduz eventos?',
    '**Intervenção vs comparador** — **Dapagliflozina 10 mg/dia** vs **placebo**. Mediana de 4,2 anos.',
    '**Desfecho primário** — **Dois co-primários**: MACE-3 e o composto **morte cardiovascular ou hospitalização por insuficiência cardíaca**.',
    '**Resultado-chave** — **MACE: HR 0,93** (IC95% 0,84–1,03) — **não significativo**. **Morte CV/hospitalização por IC: 4,9% vs 5,8% — HR 0,83** (IC95% 0,73–0,95), **dirigido pela hospitalização por IC (HR 0,73)**, sem efeito sobre morte CV (HR 0,98).',
    '**Segurança** — **Cetoacidose diabética mais frequente: 0,3% vs 0,1%** (p=0,02). Mais infecção genital. **Gangrena de Fournier**: rara, numericamente menor com dapagliflozina.',
    '💡 **O que muda na prática** — Mostrou que, fora da prevenção secundária, o ganho dos iSGLT2 está na **insuficiência cardíaca e no rim**, não na aterosclerose. Sustenta indicar iSGLT2 por **fenótipo de IC/DRC**, mesmo sem doença coronariana.'
  ],
  resumo:`## Por que este estudo é diferente
EMPA-REG e CANVAS recrutaram sobretudo **prevenção secundária**. O DECLARE foi o maior estudo da classe e incluiu a maioria (**59%**) apenas com **fatores de risco** — mais parecido com o paciente de ambulatório.

## Desenho
- **17.160 adultos** com DM2 e doença CV estabelecida (41%) **ou** múltiplos fatores de risco (59%).
- **Dapagliflozina 10 mg/dia** vs **placebo**. Mediana de **4,2 anos**.
- **Dois desfechos co-primários**: MACE-3 e o composto **morte CV ou hospitalização por IC**.

## Resultados
- **MACE-3: 8,8% vs 9,4% — HR 0,93** (IC95% 0,84–1,03); **p=0,17 — negativo**.
- **Morte CV ou hospitalização por IC: 4,9% vs 5,8% — HR 0,83** (IC95% 0,73–0,95); p=0,005.
  - **Hospitalização por IC: HR 0,73** (IC95% 0,61–0,88) — é o que carrega o composto.
  - **Morte cardiovascular: HR 0,98** — neutra.
- **Desfecho renal** (queda ≥40% da TFG, doença renal terminal ou morte renal): **HR 0,53** — benefício robusto e consistente com o resto da classe.
- Morte por qualquer causa: HR 0,93 (IC95% 0,82–1,04) — não significativa.

## Como conciliar com o EMPA-REG
Não é contradição, é **população diferente**. Em prevenção primária há pouco evento aterotrombótico para prevenir, e o efeito da classe — que é **hemodinâmico e renal** — se manifesta onde ele de fato atua: **insuficiência cardíaca e função renal**. As metanálises da classe mostram exatamente isso: benefício de **IC e rim consistente em todo o espectro**, e benefício de MACE concentrado em quem já tem aterosclerose.

## Segurança
- **Cetoacidose diabética: 0,3% vs 0,1%** (p=0,02) — pequeno em termos absolutos, mas real. Lembrar da forma **euglicêmica** e suspender o fármaco em jejum prolongado, cirurgia, doença aguda ou dieta cetogênica.
- **Infecção genital** mais frequente (efeito de classe).
- **Gangrena de Fournier**: 0,6/1.000 vs 1,0/1.000 — eventos raríssimos, numericamente **menos** com dapagliflozina.
- Sem excesso de amputação ou fratura.

## O que muda na prática
- iSGLT2 para **proteção de IC e rim** vale mesmo **sem doença aterosclerótica**.
- Em prevenção primária, não prometer redução de infarto — a prova não existe.
- Este estudo pavimentou o **DAPA-HF** e o **DAPA-CKD**, que levaram a classe para além do diabetes.`,
  flashcards:[
    {q:'O DECLARE-TIMI 58 atingiu seu desfecho de MACE?',a:'Não. MACE-3 HR 0,93 (IC95% 0,84–1,03), não significativo. O co-primário positivo foi morte CV/hospitalização por IC (HR 0,83).'},
    {q:'Qual componente carregou o co-primário positivo do DECLARE?',a:'A hospitalização por insuficiência cardíaca (HR 0,73). A morte cardiovascular foi neutra (HR 0,98).'},
    {q:'Qual o principal achado de segurança do DECLARE?',a:'Aumento de cetoacidose diabética (0,3% vs 0,1%; p=0,02), além de infecção genital. Gangrena de Fournier foi rara e numericamente menor com dapagliflozina.'},
    {q:'Por que o DECLARE foi "negativo" para MACE se o EMPA-REG foi positivo?',a:'Porque 59% do DECLARE era prevenção primária. O efeito dos iSGLT2 é hemodinâmico/renal — consistente em IC e rim em todo o espectro — enquanto o ganho de MACE se concentra em quem já tem aterosclerose.'}
  ]}),

A({ sub:'Diabetes', tema:'CREDENCE (2019)', fonte:'NEJM', ano:'2019',
  url:'https://doi.org/10.1056/NEJMoa1811744',
  pts:[
    '**Pergunta / população** — Em DM2 com **doença renal crônica albuminúrica** (n=4.401; TFG 30–90 mL/min/1,73m² e RAC 300–5.000 mg/g), a canagliflozina protege o rim?',
    '**Intervenção vs comparador** — **Canagliflozina 100 mg/dia** vs **placebo**, **todos com IECA ou BRA em dose máxima tolerada**. Mediana de 2,6 anos.',
    '**Desfecho primário** — Composto **renal**: doença renal terminal, duplicação da creatinina sérica, ou morte de causa renal ou cardiovascular.',
    '**Resultado-chave** — **HR 0,70** (IC95% 0,59–0,82; p=0,00001) — **redução de 30%**. O estudo foi **interrompido precocemente por eficácia**. Desfecho renal "puro" (DRT, duplicação de creatinina, morte renal) **HR 0,66**; **doença renal terminal HR 0,68**; hospitalização por IC **HR 0,61**.',
    '**Segurança** — **Sem** aumento de **amputação** (HR 1,11) ou **fratura** (HR 0,98) — ao contrário do sinal do CANVAS. Cetoacidose mais frequente, porém rara (2,2 vs 0,2 por 1.000 pacientes-ano).',
    '💡 **O que muda na prática** — Primeiro estudo com **desfecho renal primário** positivo desde o RENAAL/IDNT. Tornou o iSGLT2 **terapia de base da nefropatia diabética**, somado ao bloqueio do SRAA.'
  ],
  resumo:`## Contexto
Até 2019, a proteção renal no DM2 apoiava-se no bloqueio do sistema renina-angiotensina (RENAAL e IDNT, 2001). Os desfechos renais de EMPA-REG, CANVAS e DECLARE eram **secundários e exploratórios**. O CREDENCE foi o primeiro desenhado **para o rim**.

## Desenho
- **4.401 adultos** com DM2 e **DRC albuminúrica**: TFGe **30–90 mL/min/1,73m²** e **relação albumina/creatinina 300–5.000 mg/g**.
- **Todos** em **IECA ou BRA** na maior dose tolerada — ou seja, o benefício é **incremental ao padrão-ouro**.
- **Canagliflozina 100 mg/dia** vs **placebo**. Mediana de **2,6 anos** (interrompido precocemente).

## Resultados
- **Primário composto: HR 0,70** (IC95% 0,59–0,82); p=0,00001 — **NNT ≈ 22** em 2,5 anos.
- **Componente renal isolado** (DRT, duplicação de creatinina, morte renal): **HR 0,66**.
- **Doença renal terminal: HR 0,68**.
- **Morte CV ou hospitalização por IC: HR 0,69**; **hospitalização por IC isolada: HR 0,61**.
- **MACE: HR 0,80** — também positivo nesta população de altíssimo risco.

## Segurança — o ponto do CANVAS
O CANVAS (2017), com a mesma droga, havia mostrado **dobro de amputações de membros inferiores** (6,3 vs 3,4/1.000 pacientes-ano) e mais **fraturas**. No CREDENCE, com monitoramento dirigido:
- **Amputação: HR 1,11** (IC95% 0,79–1,56) — sem excesso.
- **Fratura: HR 0,98** — sem excesso.
- **Cetoacidose**: 2,2 vs 0,2 por 1.000 pacientes-ano — mais frequente, mas rara.

O consenso atual é que o sinal do CANVAS **não se confirmou**; ainda assim, cuidado com pé diabético ativo e depleção de volume é conduta prudente.

## O que muda na prática
- Em **DM2 com albuminúria e TFG ≥30**, iSGLT2 entra **junto** com IECA/BRA — não como alternativa.
- A queda inicial da TFG ("*dip*" hemodinâmico de até ~30%) nas primeiras semanas é **esperada e reversível**; não é motivo para suspender.
- Completa o tripé da nefroproteção moderna: **bloqueio do SRAA + iSGLT2 + finerenona** (FIDELIO/FIGARO), com os GLP-1 somando-se depois pelo FLOW.`,
  flashcards:[
    {q:'Qual a população e o desfecho primário do CREDENCE?',a:'DM2 com DRC albuminúrica (TFG 30–90 e RAC 300–5.000 mg/g), todos em IECA/BRA. Primário: composto de doença renal terminal, duplicação da creatinina ou morte renal/cardiovascular — HR 0,70 (p=0,00001).'},
    {q:'O CREDENCE confirmou o sinal de amputação do CANVAS?',a:'Não. Amputação HR 1,11 e fratura HR 0,98 — sem excesso, com monitoramento dirigido.'},
    {q:'A queda de TFG nas primeiras semanas de iSGLT2 indica suspensão?',a:'Não. O "dip" hemodinâmico inicial (até ~30%) é esperado e reversível, e precede a preservação da função renal a longo prazo.'},
    {q:'Por que o CREDENCE é considerado um marco?',a:'Foi o primeiro estudo com desfecho renal primário positivo no DM2 desde RENAAL/IDNT (2001), e mostrou benefício incremental ao bloqueio do SRAA já otimizado.'}
  ]}),

A({ sub:'Diabetes', tema:'SURPASS-2 (2021)', fonte:'NEJM', ano:'2021',
  url:'https://doi.org/10.1056/NEJMoa2107519',
  pts:[
    '**Pergunta / população** — Em DM2 **não controlado com metformina** (n=1.879; HbA1c basal ~8,3%; IMC ~34), a tirzepatida é superior à semaglutida?',
    '**Intervenção vs comparador** — **Tirzepatida 5, 10 ou 15 mg/semana** vs **semaglutida 1,0 mg/semana** (comparador ativo). **40 semanas**, aberto para o injetável e cego para a dose.',
    '**Desfecho primário** — Variação da **HbA1c** em 40 semanas (não inferioridade da tirzepatida 5 mg, seguida de teste de superioridade).',
    '**Resultado-chave** — **HbA1c: −2,01 / −2,24 / −2,30 pontos** (5/10/15 mg) vs **−1,86** com semaglutida — **superioridade em todas as doses**. **Peso: −7,6 / −9,3 / −11,2 kg** vs **−5,7 kg**. Alvo composto (HbA1c ≤6,5% + perda ≥10% sem hipoglicemia): **32% / 51% / 60%** vs **22%**.',
    '**Segurança** — Eventos **gastrointestinais** semelhantes entre os grupos (náusea, diarreia, vômito), predominantes na titulação. **Hipoglicemia grave rara** em ambos.',
    '💡 **O que muda na prática** — Primeira demonstração head-to-head de que o **agonismo duplo GIP/GLP-1** supera o GLP-1 isolado em glicemia e peso. Note que o comparador foi **semaglutida 1,0 mg**, não 2,0 mg.'
  ],
  resumo:`## Desenho
- **1.879 adultos** com DM2 **inadequadamente controlado com metformina** (≥1.500 mg/dia).
- HbA1c basal média **8,28%**; IMC médio ~34 kg/m²; duração média do diabetes ~8,6 anos.
- **Tirzepatida 5, 10 ou 15 mg/semana** vs **semaglutida 1,0 mg/semana**, por **40 semanas**.

## Resultados
**HbA1c (variação estimada do basal):**
| Grupo | Δ HbA1c |
|---|---|
| Tirzepatida 5 mg | **−2,01 pontos** |
| Tirzepatida 10 mg | **−2,24 pontos** |
| Tirzepatida 15 mg | **−2,30 pontos** |
| Semaglutida 1,0 mg | −1,86 pontos |

Todas as doses de tirzepatida foram **superiores** (p<0,001).

**Peso corporal:** **−7,6 kg / −9,3 kg / −11,2 kg** vs **−5,7 kg** com semaglutida. A dose de 15 mg produziu praticamente **o dobro** da perda de peso do comparador.

**Alvo composto** (HbA1c ≤6,5% **e** perda ≥10% do peso **sem** hipoglicemia <54 mg/dL): **32%, 51% e 60%** com tirzepatida vs **22%** com semaglutida.

Importante: **a perda de peso não havia atingido platô** em nenhum braço às 40 semanas.

## Segurança
- **Eventos gastrointestinais** foram os mais comuns e **semelhantes entre os grupos** — náusea, diarreia e vômito, concentrados na fase de escalonamento de dose.
- Descontinuação por eventos adversos: comparável entre tirzepatida e semaglutida.
- **Hipoglicemia grave**: rara em ambos (efeito glicose-dependente das incretinas).

## Limitações que caem em prova
1. O comparador foi **semaglutida 1,0 mg** — a dose máxima aprovada para diabetes **à época**. Depois vieram a dose de 2,0 mg (SUSTAIN FORTE) e a de 2,4 mg para obesidade, o que torna a comparação **não definitiva** para a molécula.
2. Desfecho **substituto** (HbA1c e peso), não desfecho duro. A prova cardiovascular da tirzepatida ficou para o **SURPASS-CVOT**.
3. Apenas **40 semanas**.

## O que muda na prática
- Quando o objetivo é **HbA1c e peso simultaneamente**, a tirzepatida tem a maior eficácia demonstrada em comparação direta.
- A escolha entre as classes deve considerar também **desfecho cardiovascular comprovado**, custo e disponibilidade — não só potência.`,
  flashcards:[
    {q:'Quais as reduções de HbA1c da tirzepatida 5/10/15 mg vs semaglutida 1 mg no SURPASS-2?',a:'−2,01 / −2,24 / −2,30 pontos com tirzepatida vs −1,86 ponto com semaglutida 1,0 mg (superioridade em todas as doses), em 40 semanas.'},
    {q:'Qual a perda de peso no SURPASS-2?',a:'−7,6 kg (5 mg), −9,3 kg (10 mg) e −11,2 kg (15 mg) vs −5,7 kg com semaglutida 1,0 mg — sem platô às 40 semanas.'},
    {q:'Qual a principal limitação do SURPASS-2 ao comparar as duas moléculas?',a:'O comparador foi semaglutida 1,0 mg (máxima aprovada para diabetes à época), não 2,0 mg; além disso o desfecho é substituto e o seguimento, de apenas 40 semanas.'},
    {q:'Os eventos gastrointestinais foram mais frequentes com tirzepatida no SURPASS-2?',a:'Não — foram semelhantes entre os grupos, concentrados na fase de titulação.'}
  ]}),

A({ sub:'Diabetes', tema:'FLOW (2024)', fonte:'NEJM', ano:'2024',
  url:'https://doi.org/10.1056/NEJMoa2403347',
  pts:[
    '**Pergunta / população** — Em DM2 com **doença renal crônica** (n=3.533), a semaglutida protege o rim?',
    '**Intervenção vs comparador** — **Semaglutida SC 1,0 mg/semana** vs **placebo**, sobre terapia padrão (a maioria com IECA/BRA). Mediana de **3,4 anos**.',
    '**Desfecho primário** — Composto renal: **queda persistente ≥50% da TFGe**, doença renal terminal (TFGe <15 ou terapia renal substitutiva), **morte renal** ou **morte cardiovascular**.',
    '**Resultado-chave** — **5,8 vs 7,5 eventos por 100 pessoas-ano — HR 0,76** (IC95% 0,66–0,88; p=0,0003): **redução de 24%**. O estudo foi **interrompido precocemente por eficácia**. **Morte cardiovascular HR 0,71**; **morte por qualquer causa HR 0,80**.',
    '**Segurança** — Perfil conhecido da classe: eventos **gastrointestinais** e mais descontinuações por eles. Sem sinal de segurança novo.',
    '💡 **O que muda na prática** — Primeiro GLP-1 com **desfecho renal primário** positivo. Coloca a semaglutida ao lado dos iSGLT2 e da finerenona na proteção renal do DM2 — e sustenta a **terapia combinada** na nefropatia diabética.'
  ],
  resumo:`## Por que este estudo importa
Os GLP-1 já haviam mostrado redução de **albuminúria** (LEADER, SUSTAIN-6), mas isso é um marcador — não prova preservação de função. O FLOW foi o primeiro a testar **desfecho renal duro como primário** para a classe.

## Desenho
- **3.533 adultos** com DM2 e DRC — TFGe **50–75 com RAC >300**, ou TFGe **25–50 com RAC >100**.
- **Semaglutida SC 1,0 mg/semana** vs **placebo**, sobre o tratamento padrão (a grande maioria já em **IECA/BRA**).
- Mediana de seguimento: **3,4 anos**. **Interrompido precocemente por eficácia** em análise interina.

## Resultados
- **Primário: 331 vs 410 eventos — 5,8 vs 7,5 por 100 pessoas-ano — HR 0,76** (IC95% 0,66–0,88); p=0,0003.
- **Componente renal isolado: HR 0,79**.
- **Declínio anual da TFGe**: mais lento com semaglutida (diferença de ~1,16 mL/min/1,73m²/ano).
- **Morte cardiovascular: HR 0,71** (IC95% 0,56–0,89).
- **MACE: HR 0,82**.
- **Morte por qualquer causa: HR 0,80** (IC95% 0,67–0,95).

Ou seja: o benefício foi simultaneamente **renal, cardiovascular e de mortalidade** — um resultado incomum em nefrologia.

## Interação com iSGLT2
Cerca de **15,6%** dos participantes usavam iSGLT2 no início. A análise de subgrupo **não mostrou heterogeneidade** significativa: o benefício da semaglutida apareceu **com e sem** iSGLT2 concomitante, o que apoia — sem provar definitivamente — o uso **combinado** das duas classes.

## Segurança
Perfil já conhecido: **eventos gastrointestinais** foram a causa mais frequente de descontinuação. Nenhum sinal novo. Vale lembrar que a população tinha TFG reduzida e ainda assim tolerou bem a droga — **GLP-1 não exige ajuste de dose por função renal**.

## O que muda na prática
- Em **DM2 com DRC**, a semaglutida passa a ter indicação com **desfecho renal comprovado**, e não apenas efeito sobre albuminúria.
- Reforça o modelo de **terapia de quatro pilares** na nefropatia diabética: **IECA/BRA + iSGLT2 + finerenona + GLP-1**, cada um com prova própria.
- Ponto de prova: o FLOW é o **primeiro GLP-1 com primário renal**; CREDENCE é o equivalente para iSGLT2.`,
  flashcards:[
    {q:'Qual o desfecho primário e o resultado do FLOW?',a:'Composto renal (queda ≥50% da TFGe, doença renal terminal, morte renal ou morte CV): 5,8 vs 7,5 por 100 pessoas-ano — HR 0,76 (redução de 24%; p=0,0003). O estudo foi interrompido precocemente por eficácia.'},
    {q:'O FLOW mostrou benefício além do rim?',a:'Sim: morte cardiovascular HR 0,71, MACE HR 0,82 e morte por qualquer causa HR 0,80.'},
    {q:'O benefício da semaglutida no FLOW depende do uso de iSGLT2?',a:'Não houve heterogeneidade significativa entre quem usava (≈15,6%) e quem não usava iSGLT2 — o que apoia o uso combinado das classes.'},
    {q:'Qual a importância histórica do FLOW?',a:'É o primeiro GLP-1 com desfecho renal primário positivo — antes havia apenas redução de albuminúria (marcador) em LEADER e SUSTAIN-6.'}
  ]}),

A({ sub:'Diabetes', tema:'SOUL (2025)', fonte:'NEJM', ano:'2025',
  url:'https://doi.org/10.1056/NEJMoa2501006',
  pts:[
    '**Pergunta / população** — Em DM2 de alto risco (n=9.650; ≥50 anos, HbA1c 6,5–10%, com **doença aterosclerótica, DRC ou ambas**), a **semaglutida oral** reduz eventos cardiovasculares?',
    '**Intervenção vs comparador** — **Semaglutida oral até 14 mg/dia** vs **placebo**, sobre terapia padrão. Seguimento médio de **47,5 meses**.',
    '**Desfecho primário** — **MACE-3**: morte cardiovascular, IAM não fatal ou AVC não fatal (tempo até o primeiro evento), com desenho de **superioridade**.',
    '**Resultado-chave** — MACE **12,0% vs 13,8% — HR 0,86** (IC95% 0,77–0,96; p=0,006): **redução de 14%**.',
    '**Segurança** — Perfil de classe: eventos **gastrointestinais**. Sem sinal novo de segurança.',
    '💡 **O que muda na prática** — Estende o benefício cardiovascular comprovado à **formulação oral** da semaglutida — opção para quem não aceita ou não pode usar injetável. Confirma, com desenho adequado de superioridade, o que o SUSTAIN-6 só sugeriu.'
  ],
  resumo:`## Contexto
O **PIONEER 6** (2019) testou a semaglutida oral em DM2 de alto risco, mas era um estudo de **não inferioridade**, com poucos eventos e seguimento curto (~16 meses): HR 0,79, com IC cruzando 1 para superioridade. Ficou a dúvida se a via oral entregaria o mesmo benefício da subcutânea. O SOUL foi desenhado para responder isso.

## Desenho
- **9.650 adultos**, **≥50 anos**, DM2 com **HbA1c 6,5–10,0%** e **doença aterosclerótica estabelecida, DRC, ou ambas**.
- **Semaglutida oral, dose máxima de 14 mg/dia** vs **placebo** (1:1), somada ao tratamento padrão.
- Estudo **duplo-cego, dirigido por eventos, de superioridade**.
- Seguimento médio **47,5 ± 10,9 meses** (mediana 49,5 meses) — cerca de **4 anos**.

## Resultados
- **MACE-3: 12,0% vs 13,8% — HR 0,86** (IC95% 0,77–0,96); **p=0,006**.
- Redução relativa de **14%**, consistente com o observado para a classe em prevenção secundária.
- O tamanho amostral e a duração dão ao SOUL o poder que faltava ao PIONEER 6.

## Por que a via oral é um detalhe relevante
A semaglutida oral depende do **SNAC** (salcaprozato de sódio) para absorção gástrica, o que impõe condições de uso rígidas: **em jejum, com no máximo 120 mL de água, aguardando 30 minutos** antes de qualquer alimento, líquido ou outro medicamento. A biodisponibilidade é baixa e variável — por isso a dúvida legítima sobre se o efeito clínico se manteria. O SOUL mostra que **sim**, desde que a adesão ao ritual de tomada seja respeitada.

## Segurança
Perfil consistente com a classe: **eventos gastrointestinais** (náusea, vômito, diarreia), sobretudo na titulação. Sem sinal de segurança novo.

## O que muda na prática
- Em DM2 com doença aterosclerótica ou DRC, a **semaglutida oral** é alternativa com **benefício cardiovascular comprovado** — útil para quem recusa injeção.
- Não substitui a discussão de potência: para **perda de peso**, as doses injetáveis (2,4 mg) e a tirzepatida seguem superiores.
- A adesão às instruções de administração **não é detalhe** — é condição para o efeito.`,
  flashcards:[
    {q:'Qual o desfecho primário e o resultado do SOUL?',a:'MACE-3 (morte CV, IAM não fatal ou AVC não fatal): 12,0% vs 13,8% — HR 0,86 (IC95% 0,77–0,96; p=0,006), redução de 14%, em ~4 anos de seguimento.'},
    {q:'Qual a diferença entre PIONEER 6 e SOUL?',a:'PIONEER 6 era de não inferioridade, curto (~16 meses) e sem poder para superioridade; o SOUL foi desenhado para superioridade, com 9.650 pacientes e ~4 anos, confirmando o benefício da semaglutida oral.'},
    {q:'Como deve ser tomada a semaglutida oral e por quê?',a:'Em jejum, com no máximo 120 mL de água, aguardando 30 minutos antes de alimentos, líquidos ou outros medicamentos — a absorção depende do SNAC e é baixa e variável.'},
    {q:'Qual a população do SOUL?',a:'DM2 com ≥50 anos, HbA1c 6,5–10,0% e doença aterosclerótica estabelecida, doença renal crônica, ou ambas.'}
  ]}),

];

// ───────────────────────────── OBESIDADE ─────────────────────────────
const OBESIDADE = [

A({ sub:'Obesidade', tema:'STEP-1 (2021)', fonte:'NEJM', ano:'2021',
  url:'https://doi.org/10.1056/NEJMoa2032183',
  pts:[
    '**Pergunta / população** — Em adultos **com obesidade e sem diabetes** (n=1.961; IMC ≥30, ou ≥27 com comorbidade), qual a eficácia da semaglutida 2,4 mg na perda de peso?',
    '**Intervenção vs comparador** — **Semaglutida 2,4 mg/semana SC** vs **placebo**, ambos com aconselhamento de estilo de vida. **68 semanas**.',
    '**Desfecho primário** — Variação percentual do **peso corporal** e proporção com perda **≥5%**.',
    '**Resultado-chave** — **−14,9% vs −2,4%** — diferença de **−12,4 pontos percentuais** (≈ **−15,3 kg**). Perda **≥5%: 86,4% vs 31,5%**; **≥10%: 69,1% vs 12,0%**; **≥15%: 50,5% vs 4,9%**.',
    '**Segurança** — **Náusea e diarreia** foram os eventos mais comuns (transitórios, na titulação); descontinuação por eventos adversos **7,0% vs 3,1%**. Mais **colelitíase**.',
    '💡 **O que muda na prática** — Marcou a entrada da farmacoterapia da obesidade em um patamar antes só alcançado por cirurgia. Perda de ~15% passou a ser meta realista com medicamento.'
  ],
  resumo:`## Por que este estudo é um divisor de águas
Antes do STEP-1, os fármacos antiobesidade entregavam **5–10%** de perda de peso. O STEP-1 dobrou esse teto e reposicionou a obesidade como **doença crônica farmacologicamente tratável**, não como falha de força de vontade.

## Desenho
- **1.961 adultos** com **IMC ≥30**, ou **≥27 com pelo menos uma comorbidade** relacionada ao peso.
- **Excluídos os que tinham diabetes tipo 2** — ponto essencial: a eficácia é maior em quem não tem diabetes.
- **Semaglutida 2,4 mg/semana SC** vs **placebo**, ambos com intervenção de estilo de vida (déficit de 500 kcal/dia e 150 min/semana de atividade física).
- **68 semanas**.

## Resultados
- **Peso: −14,9% vs −2,4%** — diferença de **−12,4 pontos percentuais** (IC95% −13,4 a −11,5); em valor absoluto, **−15,3 kg vs −2,6 kg**.
- **Perda ≥5%: 86,4% vs 31,5%**
- **Perda ≥10%: 69,1% vs 12,0%**
- **Perda ≥15%: 50,5% vs 4,9%** — metade dos pacientes atingiu o patamar antes reservado à cirurgia bariátrica.
- Melhora de **circunferência abdominal, pressão arterial sistólica, HbA1c, PCR e perfil lipídico**.
- Melhora significativa em escores de **função física**.

## Segurança
- **Eventos gastrointestinais** (náusea, diarreia, vômito, constipação): mais frequentes, em geral **leves a moderados e transitórios**, concentrados na titulação.
- **Descontinuação por eventos adversos: 7,0% vs 3,1%**.
- **Colelitíase** mais frequente — relacionada à magnitude e à velocidade da perda de peso.

## O que o estudo não responde
1. **Manutenção**: o **STEP-4** mostrou que suspender a droga leva a **reganho progressivo** — a obesidade se comporta como hipertensão, exigindo tratamento continuado.
2. **Desfechos duros**: ficou para o **SELECT** (2023), que provou redução de eventos cardiovasculares.
3. **Composição corporal**: parte da perda é de **massa magra** — daí a ênfase atual em proteína e treino resistido durante o tratamento.

## O que muda na prática
- Meta de **10–15% de perda** passa a ser realista com farmacoterapia, o que altera o limiar de indicação cirúrgica em muitos pacientes.
- Tratar obesidade **cronicamente**: retirar a droga é reintroduzir a doença.`,
  flashcards:[
    {q:'Qual a perda de peso da semaglutida 2,4 mg no STEP-1?',a:'−14,9% vs −2,4% com placebo em 68 semanas (diferença de −12,4 pontos percentuais, ≈ −15,3 kg), em adultos com obesidade SEM diabetes.'},
    {q:'Que proporção alcançou perda ≥10% e ≥15% no STEP-1?',a:'≥10%: 69,1% vs 12,0%. ≥15%: 50,5% vs 4,9%.'},
    {q:'O que acontece ao suspender a semaglutida (STEP-4)?',a:'Há reganho progressivo do peso — a obesidade exige tratamento continuado, como a hipertensão.'},
    {q:'Por que a eficácia do STEP-1 não se aplica diretamente a quem tem diabetes tipo 2?',a:'Porque pacientes com DM2 foram excluídos; nessa população (STEP-2) a perda de peso é consistentemente menor.'}
  ]}),

A({ sub:'Obesidade', tema:'SURMOUNT-1 (2022)', fonte:'NEJM', ano:'2022',
  url:'https://doi.org/10.1056/NEJMoa2206038',
  pts:[
    '**Pergunta / população** — Em adultos **com obesidade e sem diabetes** (n=2.539; IMC ≥30, ou ≥27 com comorbidade), qual a eficácia da tirzepatida?',
    '**Intervenção vs comparador** — **Tirzepatida 5, 10 ou 15 mg/semana SC** vs **placebo**, com estilo de vida. **72 semanas**.',
    '**Desfecho primário** — Variação percentual do **peso** e proporção com perda **≥5%**.',
    '**Resultado-chave** — **−15,0% / −19,5% / −20,9%** (5/10/15 mg) vs **−3,1%** com placebo. Perda **≥5%: 85–91% vs 35%**; **≥20%: 50% e 57%** nas doses de 10 e 15 mg. Perda absoluta de até **−23,6 kg**.',
    '**Segurança** — **Gastrointestinais** predominantes (náusea, diarreia, constipação), em geral leves a moderados e ligados à titulação; descontinuação por eventos adversos **4,3–7,1%** vs 2,6%.',
    '💡 **O que muda na prática** — O agonismo duplo **GIP/GLP-1** aproximou a farmacoterapia dos resultados da **cirurgia bariátrica** (gastrectomia vertical), com perda média superior a 20%.'
  ],
  resumo:`## Desenho
- **2.539 adultos** com **IMC ≥30**, ou **≥27 com pelo menos uma comorbidade** relacionada ao peso.
- **Sem diabetes tipo 2** (o equivalente em DM2 é o SURMOUNT-2).
- **Tirzepatida 5, 10 ou 15 mg/semana** vs **placebo**, com aconselhamento de estilo de vida.
- **72 semanas**.

## Resultados
| Grupo | Perda de peso |
|---|---|
| Tirzepatida 5 mg | **−15,0%** |
| Tirzepatida 10 mg | **−19,5%** |
| Tirzepatida 15 mg | **−20,9%** |
| Placebo | −3,1% |

- **Perda ≥5%: 85%, 89% e 91%** vs **35%**.
- **Perda ≥20%: 30%, 50% e 57%** vs **3%**.
- Perda absoluta de até **−23,6 kg** na dose de 15 mg.
- Melhora de **circunferência abdominal, pressão arterial, lipídios e insulinemia de jejum**.
- Entre os participantes com **pré-diabetes**, a maioria **reverteu para normoglicemia**.

## Comparação com o STEP-1
As comparações entre estudos são **indiretas** e devem ser feitas com cautela (populações e durações diferentes: 72 vs 68 semanas). Ainda assim, a magnitude — **~21% vs ~15%** — antecipava o que o **SURMOUNT-5** viria a confirmar em comparação **direta** (2025).

## Segurança
- **Eventos gastrointestinais** foram os mais comuns: náusea (até ~31%), diarreia, constipação e vômito — em geral **leves a moderados**, na fase de escalonamento.
- **Descontinuação por eventos adversos: 4,3% a 7,1%** conforme a dose, vs **2,6%** com placebo.
- Sem sinal de pancreatite; colelitíase relacionada à perda de peso, como na classe.

## O que muda na prática
- Perda média **>20%** coloca a tirzepatida em faixa antes atribuída à **gastrectomia vertical** — o que muda a conversa sobre indicação cirúrgica em parte dos pacientes.
- Como no STEP-1, o tratamento é **crônico**: o **SURMOUNT-4** mostrou reganho após a suspensão.
- Atenção à **perda de massa magra**: recomendar aporte proteico adequado e treino resistido durante o tratamento.`,
  flashcards:[
    {q:'Qual a perda de peso com tirzepatida no SURMOUNT-1?',a:'−15,0% (5 mg), −19,5% (10 mg) e −20,9% (15 mg) vs −3,1% com placebo, em 72 semanas, em adultos com obesidade sem diabetes.'},
    {q:'Que proporção atingiu perda ≥20% no SURMOUNT-1?',a:'50% com 10 mg e 57% com 15 mg (vs 3% com placebo) — faixa antes atribuída à cirurgia bariátrica.'},
    {q:'Pode-se afirmar que a tirzepatida é superior à semaglutida com base em SURMOUNT-1 e STEP-1?',a:'Não diretamente — são estudos distintos (comparação indireta). A superioridade foi demonstrada em comparação direta pelo SURMOUNT-5 (2025).'},
    {q:'Qual o principal grupo de eventos adversos da tirzepatida no SURMOUNT-1?',a:'Gastrointestinais (náusea, diarreia, constipação, vômito), em geral leves a moderados e concentrados na titulação; descontinuação por EA de 4,3–7,1%.'}
  ]}),

A({ sub:'Obesidade', tema:'SELECT (2023)', fonte:'NEJM', ano:'2023',
  url:'https://doi.org/10.1056/NEJMoa2307563',
  pts:[
    '**Pergunta / população** — Em adultos **com sobrepeso/obesidade e doença cardiovascular estabelecida, mas SEM diabetes** (n=17.604; ≥45 anos, IMC ≥27), a semaglutida reduz eventos cardiovasculares?',
    '**Intervenção vs comparador** — **Semaglutida 2,4 mg/semana SC** vs **placebo**, sobre terapia padrão. Seguimento médio de **39,8 meses** (~3,3 anos).',
    '**Desfecho primário** — **MACE-3**: morte cardiovascular, IAM não fatal ou AVC não fatal.',
    '**Resultado-chave** — **6,5% vs 8,0% — HR 0,80** (IC95% 0,72–0,90; p<0,001): **redução de 20%**. Perda de peso de **−9,4% vs −0,9%**. As curvas separaram **precocemente**, antes da perda máxima de peso.',
    '**Segurança** — **Descontinuação por eventos adversos: 16,6% vs 8,2%**, majoritariamente **gastrointestinais**. Sem aumento de pancreatite ou de neoplasia.',
    '💡 **O que muda na prática** — Primeira prova de que **tratar a obesidade reduz eventos cardiovasculares**, independentemente do diabetes. Reposiciona a semaglutida como **cardioprotetora**, e não apenas como redutora de peso.'
  ],
  resumo:`## Por que é um marco
Até 2023, nenhum tratamento farmacológico da obesidade havia demonstrado **redução de desfechos cardiovasculares duros**. O histórico da área era ruim: sibutramina foi retirada após o **SCOUT** mostrar **aumento** de eventos; rimonabanto saiu por efeitos psiquiátricos. O SELECT quebrou esse padrão.

## Desenho
- **17.604 adultos**, **≥45 anos**, com **IMC ≥27** e **doença cardiovascular estabelecida** (IAM prévio, AVC prévio ou doença arterial periférica sintomática).
- **Critério de exclusão essencial: diabetes** (HbA1c ≥6,5% ou diagnóstico prévio) — o desfecho não pode ser atribuído ao controle glicêmico.
- **Semaglutida 2,4 mg/semana** vs **placebo**, sobre terapia cardiovascular otimizada (estatina, antiagregante etc.).
- Seguimento médio de **39,8 meses**.

## Resultados
- **MACE-3: 6,5% vs 8,0% — HR 0,80** (IC95% 0,72–0,90); p<0,001. **NNT ≈ 67** em ~3 anos.
- **Morte cardiovascular: HR 0,85** (IC95% 0,71–1,01) — não significativa isoladamente.
- **IAM não fatal: HR 0,72** — o componente mais claramente reduzido.
- **Morte por qualquer causa: HR 0,81**.
- **Peso: −9,4% vs −0,9%**; também melhoraram PCR, pressão arterial, cintura e lipídios.

## O detalhe mecanístico que cai em prova
**As curvas de eventos separaram antes de a perda de peso atingir o máximo.** Isso sugere que o benefício **não é apenas consequência do emagrecimento**: efeitos anti-inflamatórios (queda expressiva de PCR), sobre a função endotelial, a pressão arterial e diretamente sobre a placa parecem contribuir. É o mesmo raciocínio do LEADER, agora em população sem diabetes.

## Segurança
- **Descontinuação por eventos adversos: 16,6% vs 8,2%** — quase o dobro, quase toda por **eventos gastrointestinais**. É um número alto e relevante para a conversa com o paciente.
- **Sem** aumento de pancreatite, neoplasia pancreática ou câncer de tireoide.
- Colelitíase, como esperado da classe.

## O que muda na prática
- Em **obesidade + doença cardiovascular estabelecida sem diabetes**, a semaglutida 2,4 mg passa a ter indicação **cardiovascular**, não apenas estética ou metabólica.
- Fortalece o argumento de **cobertura por planos e sistemas de saúde**: o desfecho agora é evento cardiovascular evitado.
- Ponto de prova: no SELECT, o componente mais reduzido foi **IAM não fatal**; a morte CV isolada **não** alcançou significância.`,
  flashcards:[
    {q:'Qual a população e o resultado primário do SELECT?',a:'Adultos ≥45 anos com IMC ≥27 e doença CV estabelecida, SEM diabetes (n=17.604). MACE-3: 6,5% vs 8,0% — HR 0,80 (redução de 20%; p<0,001).'},
    {q:'Por que o SELECT sugere benefício além da perda de peso?',a:'Porque as curvas de eventos separaram precocemente, antes da perda máxima de peso — apontando efeitos anti-inflamatórios (queda de PCR), endoteliais e diretos sobre a placa.'},
    {q:'Qual componente do MACE foi mais claramente reduzido no SELECT?',a:'IAM não fatal (HR 0,72). Morte cardiovascular isolada não atingiu significância (HR 0,85; IC 0,71–1,01).'},
    {q:'Qual a taxa de descontinuação por eventos adversos no SELECT?',a:'16,6% com semaglutida vs 8,2% com placebo, majoritariamente por eventos gastrointestinais.'}
  ]}),

A({ sub:'Obesidade', tema:'STEP-HFpEF (2023)', fonte:'NEJM', ano:'2023',
  url:'https://doi.org/10.1056/NEJMoa2306963',
  pts:[
    '**Pergunta / população** — Em **insuficiência cardíaca com fração de ejeção preservada relacionada à obesidade** (n=529; FE ≥45%, IMC ≥30), **sem diabetes**, a semaglutida melhora sintomas?',
    '**Intervenção vs comparador** — **Semaglutida 2,4 mg/semana SC** vs **placebo**. **52 semanas**.',
    '**Desfecho primário** — **Dois co-primários**: variação do **KCCQ-CSS** (escore de sintomas e limitação física) e **variação percentual do peso**.',
    '**Resultado-chave** — **KCCQ-CSS: +16,6 vs +8,7 pontos** — diferença de **+7,8 pontos** (IC95% 4,8–10,9). **Peso: −13,3% vs −2,6%** — diferença de **−10,7 pontos percentuais**. Ambos **p<0,001**. **Teste de caminhada de 6 minutos: +21,5 m** de diferença; **PCR −43,5%**.',
    '**Segurança** — Menos eventos adversos graves com semaglutida (**13,3% vs 26,7%**), à custa de menos eventos cardíacos. Gastrointestinais mais frequentes.',
    '💡 **O que muda na prática** — Definiu a **ICFEp da obesidade** como fenótipo próprio, tratável com perda de peso farmacológica. Ganho sintomático **maior do que o de qualquer outra terapia** já testada nessa população.'
  ],
  resumo:`## O problema clínico
A **ICFEp** responde por metade dos casos de insuficiência cardíaca e, por muito tempo, não teve tratamento modificador. A obesidade não é apenas comorbidade nesse cenário — o fenótipo **obesidade-ICFEp** tem fisiopatologia própria: expansão de volume plasmático, inflamação sistêmica, gordura epicárdica e restrição pericárdica.

## Desenho
- **529 pacientes** com **IC sintomática (classe II–IV), FE ≥45%** e **IMC ≥30**.
- **Sem diabetes** (o STEP-HFpEF DM, publicado depois, respondeu para quem tem DM2, com resultados concordantes).
- **Semaglutida 2,4 mg/semana** vs **placebo**, por **52 semanas**.

## Resultados
**Co-primário 1 — KCCQ-CSS** (0–100; quanto maior, melhor):
- **+16,6 vs +8,7 pontos** — diferença estimada de **+7,8 pontos** (IC95% 4,8–10,9); p<0,001.
- Para calibrar: uma diferença de **5 pontos** já é considerada clinicamente relevante. O efeito aqui é **maior que o de espironolactona, sacubitril-valsartana ou iSGLT2** nessa população.

**Co-primário 2 — Peso:**
- **−13,3% vs −2,6%** — diferença de **−10,7 pontos percentuais**; p<0,001.

**Secundários:**
- **Teste de caminhada de 6 minutos: +21,5 m** de diferença (p<0,001).
- **PCR: −43,5%** em relação ao placebo — magnitude que reforça o componente inflamatório.
- Desfecho hierárquico composto (morte, eventos de IC, KCCQ, 6MWD) **favoreceu semaglutida**.

## Segurança
Contraintuitivamente, **eventos adversos graves foram menos frequentes** com semaglutida: **13,3% vs 26,7%** — diferença explicada por **menos eventos cardíacos** no braço ativo. Eventos gastrointestinais foram mais comuns, como esperado.

## Limitações
- **Sintomas e peso são desfechos co-primários** — não há poder para **mortalidade ou hospitalização**.
- Amostra pequena (n=529) e seguimento de apenas 1 ano.
- Parte do ganho no KCCQ pode refletir simplesmente **carregar menos peso**, e não melhora cardíaca direta — embora a queda de PCR e o ganho no 6MWD sugiram algo além disso.

## O que muda na prática
- Em **ICFEp com obesidade**, perda de peso farmacológica passa a ser estratégia terapêutica legítima, e não apenas "orientação geral".
- Combina com o arsenal já estabelecido de iSGLT2 na ICFEp (EMPEROR-Preserved, DELIVER).`,
  flashcards:[
    {q:'Quais os desfechos co-primários e resultados do STEP-HFpEF?',a:'KCCQ-CSS: +16,6 vs +8,7 pontos (diferença +7,8; IC95% 4,8–10,9) e peso −13,3% vs −2,6% (diferença −10,7 pp); ambos p<0,001, em 52 semanas.'},
    {q:'Qual a população do STEP-HFpEF?',a:'529 pacientes com IC sintomática, FE ≥45% e IMC ≥30, SEM diabetes (o STEP-HFpEF DM avaliou os com DM2).'},
    {q:'Como interpretar a magnitude do ganho no KCCQ-CSS do STEP-HFpEF?',a:'Uma diferença de 5 pontos já é clinicamente relevante; os 7,8 pontos observados superam o efeito de espironolactona, sacubitril-valsartana ou iSGLT2 nessa população.'},
    {q:'Qual a principal limitação do STEP-HFpEF?',a:'Os co-primários são sintomas e peso — não há poder para mortalidade ou hospitalização; amostra pequena (n=529) e apenas 52 semanas.'}
  ]}),

A({ sub:'Obesidade', tema:'SURMOUNT-OSA (2024)', fonte:'NEJM', ano:'2024',
  url:'https://doi.org/10.1056/NEJMoa2404881',
  pts:[
    '**Pergunta / população** — Em adultos com **apneia obstrutiva do sono moderada a grave e obesidade** (n=469, em dois estudos paralelos: **sem CPAP** e **em uso de CPAP**), a tirzepatida reduz a gravidade da apneia?',
    '**Intervenção vs comparador** — **Tirzepatida até 15 mg/semana SC** vs **placebo**. **52 semanas**.',
    '**Desfecho primário** — Variação do **IAH (índice de apneia-hipopneia)** em 52 semanas.',
    '**Resultado-chave** — **Estudo 1 (sem CPAP): −27,4 vs −4,8 eventos/hora**. **Estudo 2 (com CPAP): −30,4 vs −6,0 eventos/hora**. Em termos relativos, **−55,0%** e **−62,8%** vs ~5–6% no placebo. Até **51,5%** atingiram critério de remissão da doença.',
    '**Segurança** — Perfil da classe: **eventos gastrointestinais** (diarreia, náusea, vômito), em geral leves e na titulação.',
    '💡 **O que muda na prática** — Primeiro fármaco aprovado para **AOS associada à obesidade**. Oferece alternativa (ou complemento) ao CPAP, cuja adesão é notoriamente baixa — tratando a **causa** e não só a consequência mecânica.'
  ],
  resumo:`## O problema clínico
A **AOS** afeta a maioria dos pacientes com obesidade grave e associa-se a hipertensão resistente, fibrilação atrial, eventos cardiovasculares e sonolência diurna. O **CPAP** é eficaz, mas a **adesão a longo prazo é baixa** (frequentemente <50%) e ele **não trata a causa**. Até 2024 não havia farmacoterapia aprovada.

## Desenho
- **469 adultos** com **AOS moderada a grave** (IAH ≥15) e **obesidade**, sem diabetes.
- **Dois estudos paralelos**, conduzidos sob o mesmo protocolo:
  - **Estudo 1**: participantes **que não usavam** terapia com pressão positiva (PAP).
  - **Estudo 2**: participantes **em uso** de PAP, que o mantiveram.
- **Tirzepatida titulada até 15 mg/semana** vs **placebo**, por **52 semanas**.
- Desfecho medido por **polissonografia**.

## Resultados
| Δ do IAH em 52 semanas | Tirzepatida | Placebo |
|---|---|---|
| **Estudo 1 — sem PAP** | **−27,4 eventos/h** | −4,8 eventos/h |
| **Estudo 2 — em uso de PAP** | **−30,4 eventos/h** | −6,0 eventos/h |

- Redução **percentual** do IAH: **−55,0%** (Estudo 1) e **−62,8%** (Estudo 2), vs **−5,0%** e **−6,4%** com placebo.
- Até **51,5%** dos participantes atingiram critérios de **remissão ou doença leve** (IAH <5, ou IAH 5–14 sem sonolência diurna significativa).
- Também melhoraram **peso, pressão arterial sistólica, hsPCR** e **sonolência** relatada.

## Segurança
Perfil típico da classe: **diarreia, náusea e vômito**, em geral leves a moderados e concentrados na fase de escalonamento. Sem sinal novo.

## Limitações
- Desfecho **fisiológico** (IAH), não desfecho clínico duro — não há dados sobre eventos cardiovasculares ou mortalidade.
- **52 semanas** de seguimento.
- Não é comparação direta com CPAP; no Estudo 2 a tirzepatida foi **somada** ao PAP.

## O que muda na prática
- Em **AOS + obesidade**, a tirzepatida é opção terapêutica com prova de eficácia — especialmente para quem **não tolera ou não adere ao CPAP**.
- Reforça o modelo de tratar a obesidade como **causa comum** de múltiplas comorbidades, e não cada uma isoladamente.
- Não substitui o CPAP em doença grave sintomática sem antes reavaliar a polissonografia após a perda de peso.`,
  flashcards:[
    {q:'Qual o desfecho primário e o resultado do SURMOUNT-OSA?',a:'Variação do IAH em 52 semanas: −27,4 vs −4,8 eventos/h (sem PAP) e −30,4 vs −6,0 eventos/h (com PAP) — reduções relativas de 55,0% e 62,8%.'},
    {q:'Como foram organizados os dois estudos do SURMOUNT-OSA?',a:'Estudo 1 com participantes que não usavam terapia com pressão positiva (PAP) e Estudo 2 com participantes em uso de PAP, que o mantiveram durante o estudo.'},
    {q:'Qual a principal limitação do SURMOUNT-OSA?',a:'O desfecho é fisiológico (IAH), não clínico duro — sem dados de eventos cardiovasculares ou mortalidade — e o seguimento foi de 52 semanas.'},
    {q:'Que proporção atingiu remissão ou doença leve com tirzepatida no SURMOUNT-OSA?',a:'Até 51,5% dos participantes.'}
  ]}),

A({ sub:'Obesidade', tema:'SURMOUNT-5 (2025)', fonte:'NEJM', ano:'2025',
  url:'https://doi.org/10.1056/NEJMoa2416394',
  pts:[
    '**Pergunta / população** — Em adultos **com obesidade e sem diabetes** (n=751), a tirzepatida é superior à semaglutida **em comparação direta**?',
    '**Intervenção vs comparador** — **Tirzepatida** (dose máxima tolerada, 10 ou 15 mg) vs **semaglutida 2,4 mg** (dose máxima tolerada) — estudo **aberto, com comparador ativo**. **72 semanas**.',
    '**Desfecho primário** — Variação percentual do **peso corporal** em 72 semanas.',
    '**Resultado-chave** — **−20,2% vs −13,7%** — ou seja, **−22,8 kg vs −15,0 kg**. Tirzepatida também superior em **circunferência abdominal**, pressão arterial sistólica e diastólica, HbA1c, insulina de jejum, triglicerídeos e HDL.',
    '**Segurança** — Perfil semelhante entre os grupos. **Descontinuação por eventos gastrointestinais foi MENOR com tirzepatida: 2,7% vs 5,6%**.',
    '💡 **O que muda na prática** — Encerra a comparação indireta entre STEP-1 e SURMOUNT-1: na **dose máxima de ambos**, a tirzepatida entrega **~6,5 pontos percentuais a mais** de perda de peso.'
  ],
  resumo:`## Por que este estudo era necessário
A comparação entre tirzepatida (~21% no SURMOUNT-1) e semaglutida (~15% no STEP-1) circulava amplamente, mas era **indireta** — estudos diferentes, populações diferentes, durações diferentes. O SURMOUNT-5 fez o teste **head-to-head**, com a dose de obesidade de ambos.

## Desenho
- **751 adultos** com **obesidade e sem diabetes**.
- **Tirzepatida** na **dose máxima tolerada** (10 ou 15 mg/semana) vs **semaglutida 2,4 mg/semana** — a dose aprovada para obesidade, e não a de 1,0 mg usada no SURPASS-2.
- **Aberto** (open-label), com comparador ativo. **72 semanas**.

## Resultados
- **Peso: −20,2% com tirzepatida vs −13,7% com semaglutida** — diferença de **~6,5 pontos percentuais**.
- Em valor absoluto: **−22,8 kg vs −15,0 kg**.\n- **Proporção que atinge cada meta de perda** (Figura 1B e Tabela 2): **≥10%: 81,6% vs 60,5%**; **≥15%: 64,6% vs 40,1%**; **≥20%: 48,4% vs 27,3%**; **≥25%: 31,6% vs 16,1%**. Como desfecho exploratório, **≥30%: 19,7% vs 6,9%**. A vantagem relativa **cresce com a exigência da meta** (razão de risco da Tabela 2): **1,3** em ≥10%, **1,6** em ≥15%, **1,8** em ≥20%, **2,0** em ≥25% e **2,8** em ≥30%.
- **Circunferência abdominal: −18,4 cm vs −13,0 cm** (diferença de **5,4 cm**; IC 95% −7,1 a −3,6).\n- **Pressão arterial sistólica e diastólica**, **HbA1c**, **insulina de jejum**, **triglicerídeos** e **HDL**: todos favoreceram tirzepatida de forma significativa.

## Segurança — o achado que surpreende
Apesar da maior perda de peso, a **descontinuação por eventos gastrointestinais foi menor com tirzepatida: 2,7% vs 5,6%**. Os perfis de eventos adversos foram, no geral, semelhantes — predominantemente gastrointestinais e ligados à titulação em ambos.

## Limitações
- **Desenho aberto**: sem cegamento, com desfecho parcialmente influenciável por expectativa (embora peso seja medida objetiva).
- Desfecho **substituto**: perda de peso, não evento clínico. A semaglutida tem prova cardiovascular (**SELECT**); a tirzepatida aguardava o **SURPASS-CVOT** e equivalentes na obesidade.
- **72 semanas** — não informa sobre manutenção a longo prazo.

## O que muda na prática
- Quando o objetivo principal é **magnitude de perda de peso**, a tirzepatida é a escolha com melhor evidência direta.
- Quando o objetivo é **redução comprovada de eventos cardiovasculares em obesidade com doença CV estabelecida**, a semaglutida tem o SELECT — argumento que a potência isolada não substitui.
- Tolerabilidade **não** é motivo para preferir semaglutida: neste estudo, a descontinuação por eventos GI foi menor com tirzepatida.`,
  flashcards:[
    {q:'Qual o resultado primário do SURMOUNT-5?',a:'Perda de peso em 72 semanas: −20,2% com tirzepatida vs −13,7% com semaglutida 2,4 mg (−22,8 kg vs −15,0 kg), em adultos com obesidade sem diabetes.'},
    {q:'Qual a diferença de comparador entre SURPASS-2 e SURMOUNT-5?',a:'No SURPASS-2 o comparador foi semaglutida 1,0 mg (dose de diabetes); no SURMOUNT-5 foi semaglutida 2,4 mg (dose de obesidade) — comparação mais justa.'},
    {q:'A maior perda de peso da tirzepatida no SURMOUNT-5 veio com pior tolerabilidade?',a:'Não. A descontinuação por eventos gastrointestinais foi menor com tirzepatida (2,7%) do que com semaglutida (5,6%).'},
    {q:'Qual a principal limitação do SURMOUNT-5?',a:'Desenho aberto (open-label) e desfecho substituto (peso), sem eventos clínicos — e apenas 72 semanas.'}
  ]}),

A({ sub:'Obesidade', tema:'ESSENCE (2025)', fonte:'NEJM', ano:'2025',
  url:'https://doi.org/10.1056/NEJMoa2413258',
  pts:[
    '**Pergunta / população** — Em **MASH (esteato-hepatite associada à disfunção metabólica) com fibrose F2–F3** confirmada por biópsia (n=1.197 randomizados; análise interina dos primeiros **800**), a semaglutida melhora a histologia hepática?',
    '**Intervenção vs comparador** — **Semaglutida 2,4 mg/semana SC** vs **placebo**, randomização **2:1**. Análise planejada em **72 semanas** (estudo segue até 240 semanas).',
    '**Desfecho primário** — **Dois co-primários**: (1) **resolução da esteato-hepatite sem piora da fibrose**; (2) **melhora da fibrose (≥1 estágio) sem piora da esteato-hepatite**.',
    '**Resultado-chave** — **Resolução da MASH: 62,9% vs 34,3%** — diferença de **+28,7 pontos percentuais** (IC95% 21,1–36,2). **Melhora da fibrose: 36,8% vs 22,4%** — diferença de **+14,4 pontos** (IC95% 7,5–21,3). Ambos **p<0,001**. Desfecho combinado (resolução **e** melhora da fibrose): **32,7% vs 16,1%**.',
    '**Segurança** — Perfil de classe: **eventos gastrointestinais** mais frequentes. Sem sinal hepático novo.',
    '💡 **O que muda na prática** — Coloca a semaglutida como opção com **prova histológica** na MASH com fibrose significativa — doença até então praticamente órfã de tratamento farmacológico.'
  ],
  resumo:`## O problema clínico
A **MASLD** (antiga DHGNA) é a hepatopatia mais prevalente do mundo e sua forma inflamatória, a **MASH**, é a que progride para cirrose e carcinoma hepatocelular. O que determina prognóstico é o **estágio de fibrose** — não a esteatose. Até recentemente, o tratamento se resumia a perda de peso e controle metabólico; o **resmetirom** foi o primeiro fármaco aprovado (MAESTRO-NASH, 2024), e o ESSENCE trouxe a semaglutida para o mesmo território.

## Desenho
- **1.197 adultos randomizados** com **MASH confirmada por biópsia** e **fibrose estágio F2 ou F3** (classificação NASH CRN).
- **Semaglutida 2,4 mg/semana** vs **placebo**, randomização **2:1**.
- Estudo planejado para **240 semanas**; a publicação de 2025 é a **análise interina pré-especificada de 72 semanas**, nos **primeiros 800 randomizados**.

## Resultados (72 semanas)
**Co-primário 1 — Resolução da esteato-hepatite sem piora da fibrose:**
- **62,9% vs 34,3%** — diferença estimada de **+28,7 pontos percentuais** (IC95% 21,1–36,2); p<0,001.

**Co-primário 2 — Melhora da fibrose (≥1 estágio) sem piora da esteato-hepatite:**
- **36,8% vs 22,4%** — diferença de **+14,4 pontos** (IC95% 7,5–21,3); p<0,001.

**Secundário confirmatório — ambos simultaneamente:**
- **32,7% vs 16,1%** — diferença de **+16,5 pontos** (IC95% 10,2–22,8); p<0,001.

Note a **alta taxa de resposta no placebo** (34,3% de resolução): é um fenômeno conhecido nos estudos de MASH, ligado à variabilidade da leitura histológica e às mudanças de estilo de vida induzidas pela participação no estudo. Por isso o que importa é a **diferença entre grupos**, não o número absoluto.

## Marcadores não invasivos (Figura 2)\n- **Escore ELF** (semanas 0 · 24 · 48 · 72): semaglutida **9,95 → 9,38 → 9,34 → 9,33**; placebo **9,95 → 9,9 → 9,9 → 9,92**. Queda média de **0,62** com semaglutida, e o efeito já está posto na semana 24. Redução ≥0,5 em **55,8% vs 25,5%**.\n- **Rigidez hepática por elastografia**, em kPa (semanas 0 · 48 · 72): semaglutida **11,45 → 8,12 → 7,63**; placebo **11,57 → 10,63 → 10**. Quedas de **33%** e **14%**. Redução ≥30% em **52,0% vs 30,3%**.\n- São médias observadas lidas da figura; a rigidez é **média geométrica**, por isso menor que os 12,8 e 12,9 kPa da tabela basal, que são médias aritméticas.\n- Importam porque **biópsia não é rotina**: é por estes exames que a resposta será acompanhada no consultório.\n\n## Segurança
Perfil esperado da classe: **eventos gastrointestinais** (náusea, diarreia, vômito, constipação) mais frequentes com semaglutida. Sem sinal de hepatotoxicidade.

## Limitações
- **Análise interina** — o desfecho clínico (cirrose, descompensação, transplante, morte) virá com o seguimento de **240 semanas**.
- Exclui **cirrose (F4)**, onde a necessidade terapêutica é maior.
- Histologia depende de **biópsia**, com variabilidade inter-observador.

## O que muda na prática
- Em paciente com **obesidade/DM2 e MASH F2–F3**, a semaglutida trata simultaneamente peso, glicemia, risco cardiovascular e **agora também a histologia hepática**.
- Reforça a lógica de **rastrear fibrose** (FIB-4, elastografia) em quem tem diabetes e obesidade — porque agora existe conduta a oferecer.`,
  flashcards:[
    {q:'Quais os desfechos co-primários e resultados do ESSENCE em 72 semanas?',a:'Resolução da esteato-hepatite sem piora da fibrose: 62,9% vs 34,3% (+28,7 pp). Melhora da fibrose ≥1 estágio sem piora da esteato-hepatite: 36,8% vs 22,4% (+14,4 pp). Ambos p<0,001.'},
    {q:'Qual a população do ESSENCE?',a:'Adultos com MASH confirmada por biópsia e fibrose F2–F3 (NASH CRN); a cirrose F4 foi excluída.'},
    {q:'Por que a taxa de resposta no placebo do ESSENCE foi alta (34,3%)?',a:'É um fenômeno conhecido nos estudos de MASH — variabilidade da leitura histológica e mudanças de estilo de vida induzidas pela participação. Por isso importa a diferença entre grupos.'},
    {q:'O ESSENCE já demonstrou redução de desfechos clínicos hepáticos?',a:'Não. A publicação de 2025 é análise interina de 72 semanas com desfecho histológico; os desfechos clínicos virão no seguimento de 240 semanas.'}
  ]}),

];

module.exports = { DIABETES, OBESIDADE, TODOS: DIABETES.concat(OBESIDADE) };
