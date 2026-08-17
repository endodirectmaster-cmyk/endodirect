// "Obesidade: Comorbidades e Gestação" no registro formal/técnico.
// Segundo dos três capítulos que a propagação do EndoTEEM 2026 engordou — e o
// PIOR em densidade de jargão (36 ⚠️ / 16.024 chars = 2,25 por mil).
// Mesma calibração e mesmas guardas de reescreve-fisiopatologia.js.
'use strict';
const fs = require('fs'), crypto = require('crypto');

const NOVO = `## Comorbidades

- **HAS:** ativação do **SRAA** (↑ angiotensinogênio/ATII produzidos no tecido adiposo, ↑ aldosterona e reabsorção de Na⁺), **hiperinsulinemia** (retém sódio e água) e **ativação simpática**; a compressão renal pela gordura perirrenal contribui.
- **Dislipidemia** aterogênica: ↑ **TG** (↓ atividade da **LPL** via ApoC3, ↑ **VLDL**), **HDL baixo** (↑ **CETP**) e **LDL pequena e densa** (mais aterogênica).
- **Hipogonadismo hipogonadotrófico funcional** (homem): ↑ **aromatização** de testosterona em estrogênio no tecido adiposo, ↓ **SHBG** e efeito inflamatório central → ↓ testosterona total e livre; melhora com a perda de peso.
- **Eixo HHA:** ↑ atividade da **11β-HSD-1** (regenera cortisol ativo em fígado/tecido adiposo) → acúmulo de **gordura visceral** (fenótipo *pseudo-Cushing*); diferenciar do Cushing verdadeiro quando indicado.
- **DM2/resistência insulínica** (base de grande parte das comorbidades); **renal:** ↓ TFG e **GESF** (glomeruloesclerose segmentar e focal, com albuminúria); **DHGM (MASLD/MASH)** — principal causa de doença hepática crônica; **asma**; **SAHOS** (~**60% das pessoas com obesidade mórbida**); **SOP**; refluxo, colelitíase, osteoartrite e vários **cânceres** (endométrio, mama pós-menopausa, cólon, rim, esôfago, pâncreas, entre outros).

## Síndrome metabólica

Conjunto **pró-trombótico e pró-inflamatório** que eleva o risco cardiovascular e de DM2. **NCEP-ATP III / IDF:** **≥ 3** de — cintura (**≥ 102/88** ou **≥ 94/80**), **TG ≥ 150**, **HDL < 40 (H)/50 (M)**, **PA ≥ 130×85**, **glicemia ≥ 100**. **AACE (2023):** exige alto risco de **resistência insulínica** (IMC ≥ 25 ou cintura elevada) **+ ≥ 2 critérios**. Rastrear **a cada 3 anos** em quem tem ≥ 1 fator de risco. O manejo é a **redução de peso e do risco cardiometabólico global**.

## 📊 Critérios de síndrome metabólica (≥ 3 — NCEP/IDF)

| Parâmetro | Ponto de corte |
| --- | --- |
| Cintura | ≥ 102/88 (NCEP) ou ≥ 94/80 (IDF) |
| Triglicerídeos | ≥ 150 mg/dL ou tratamento |
| HDL | < 40 (H) / < 50 (M) |
| Pressão arterial | ≥ 130 × 85 mmHg |
| Glicemia | ≥ 100 mg/dL ou tratamento |

## Doenças respiratórias

### Asma

A prevalência sobe com o IMC — **HR de 1,4 entre 30 e 35 kg/m² e de 2,5 acima de 50** — e o risco de hospitalização é **2 a 4 vezes maior** que no eutrófico.

**Dois mecanismos.** **Imunometabólico:** proliferação da camada muscular brônquica com espessamento, aumento de eosinófilos e infiltração pulmonar eosinofílica, queda do óxido nítrico, supressão de linfócitos T-helper e aumento da hiper-reatividade. **Mecânico:** a pressão do tecido adiposo sobre a caixa torácica e o diafragma reduz a **capacidade residual funcional**, o **VEF1** e o **volume de reserva expiratório**.

**Dois fenótipos, com resposta terapêutica distinta**

| **Asma COMPLICADA pela obesidade** | **Asma CONSEQUENTE à obesidade** |
| --- | --- |
| Alérgica, de **início precoce (antes dos 12 anos)** | **Início tardio (12 anos ou mais)** |
| Marcadores de inflamação alérgica **elevados** | **Menor** inflamação alérgica |
| Doença **grave** | Menor obstrução do fluxo e menor hiper-responsividade; **menos grave** |
| | Predomínio **feminino** e **menor resposta ao corticoide inalatório**, o que torna o tratamento mais complexo |

### Apneia obstrutiva do sono

**Prevalência:** 17% das mulheres e 34% dos homens nos Estados Unidos, subindo com o IMC. **82% das pessoas com hipertensão resistente e 85% das com DM2 têm SAOS.**

**Fatores de risco:** obesidade, idade avançada, sexo masculino, menopausa, anormalidades craniofaciais e **aumento da circunferência cervical**.

**Fisiopatologia.** *Mecânica:* palato mole alongado, língua aumentada, acúmulo de gordura na parede lateral da faringe, retrognatia e micrognatia — estreitando a via aérea superior. *Imunometabólica:* citocinas inflamatórias, estresse oxidativo e **resistência à leptina**.

**Quadro e diagnóstico.** **Sonolência diurna excessiva em 90%**. Os questionários (STOP-BANG, Berlim, Epworth) têm **baixa sensibilidade**. A polissonografia firma o diagnóstico: **leve 5 a 15**, **moderada 15 a 30**, **grave acima de 30** eventos por hora.

*Critérios da AASM (3ª edição):* **(A + B) ou C**.
- **A** — sintomas: sonolência, sono não restaurador, fadiga ou insônia; ou despertar com sufocamento; **ou** relato do parceiro de ronco habitual e pausas respiratórias; **ou** diagnóstico de hipertensão, transtorno de humor, disfunção cognitiva, doença coronariana, AVC, insuficiência cardíaca, fibrilação atrial ou DM2.
- **B** — **≥ 5 eventos obstrutivos por hora**.
- **C** — **≥ 15 eventos por hora**, critério que estabelece o diagnóstico **na ausência de sintomas**.

**Tratamento.** **A tirzepatida é a primeira medicação aprovada para SAOS**, na doença **moderada a grave associada à obesidade** — e o **SURMOUNT-OSA** recrutou tanto quem usava CPAP quanto quem não usava:

| SURMOUNT-OSA (fase 3, 52 semanas, IMC ≥ 30 e IAH ≥ 15, 469 participantes) | **Redução do IAH** | **Perda de peso** |
| --- | --- | --- |
| **Estudo 1 — sem CPAP** | **−25,3** vs −5,3 eventos/h (placebo) | **17,7%** vs 1,6% |
| **Estudo 2 — com CPAP** | **−29,3** vs −5,5 eventos/h (placebo) | **19,9%** vs 2,3% |

Somam-se **CPAP**; **dispositivos orais** nos casos leves a moderados; **cirurgia** (avanço maxilomandibular) em quem não tolera CPAP; e **investigação de endocrinopatias — hipotireoidismo e acromegalia**.

### Síndrome da hipoventilação da obesidade

Atinge **0,04% da população**, é mais comum em **mulheres** e **90% dos casos se associam a SAOS**.

**Fisiopatologia:** redução da capacidade pulmonar, menor volume corrente e aumento do espaço morto; **redução do estímulo respiratório central**; e a soma de apneia obstrutiva com hipoventilação do sono produzindo **hipercapnia DIURNA** — elemento definidor da síndrome, e não a alteração noturna isolada.

**Diagnóstico de exclusão**, por história e **gasometria**: **pO₂ < 70 mmHg**, **pCO₂ > 45 mmHg** e **bicarbonato elevado**.

**Tratamento:** perda de peso; **CPAP** quando há SAOS grave associada; **ventilação não invasiva** na hipoventilação noturna sem apneia obstrutiva grave. **Prognóstico reservado: mortalidade de 24% em 2 anos e 31,3% em 3 anos.**

### Influenza e COVID-19

**46% mais chance de infecção**, **4 vezes mais tempo de internação**, **88% mais risco de UTI e ventilação mecânica** e maior mortalidade. Além da mecânica respiratória (maior esforço, musculatura torácica ineficiente, mais resistência de vias aéreas, menor complacência e VEF1), há **alteração da resposta dos linfócitos B e T CD8**, com **menor eficácia vacinal e maior período de transmissão do vírus**.

## Doenças cardiovasculares

### Hipertensão

**Fisiopatologia:** desbalanço simpático-vagal com **predomínio SIMPÁTICO**; hiperinsulinemia levando à produção parácrina de **angiotensinogênio, angiotensina II e aldosterona pelos adipócitos**; e **compressão renal** pela gordura intra-abdominal e retroperitoneal, que ativa o SRAA.

**A obesidade visceral aumenta o risco de hipertensão primária em 65 a 75%.**

**O perfil hemodinâmico é característico:** aumento do **débito cardíaco** e do **volume plasmático**, com **resistência periférica NORMAL** — e maior risco de hipertrofia ventricular esquerda e lesão renal que no eutrófico.

**Aferição:** manguito **estreito SUPERESTIMA** e manguito **largo SUBESTIMA** a pressão. Circunferência de braço de **35 a 45 cm → manguito 16 × 36 cm**; de **45 a 52 cm → 16 × 42 cm**.

### Insuficiência cardíaca

Predomina a **ICFEP**, cuja prevalência sobe com o IMC. **O BNP é MENOR na obesidade**, por maior metabolização, o que reduz sua confiabilidade como marcador nesses pacientes.

**Mecanismos:** mais angiotensina do tecido adiposo, ativação simpática, insulina induzindo cardiopatia hipertrófica, **depósito ectópico de gordura miocárdica**, citocinas com disfunção endotelial, queda da adiponectina, e aumento do volume sanguíneo elevando pré e pós-carga.

| Aspecto | Na obesidade |
| --- | --- |
| Remodelamento | **Hipertrofia concêntrica** e dilatação leve do ventrículo esquerdo |
| Função diastólica | **Comprometida** — aumento da rigidez ventricular |
| Função sistólica | **Preservada (ICFEP)** |
| Quadro | Dispneia, intolerância ao exercício e congestão **mesmo com fração de ejeção normal** |

### Paradoxo da obesidade

**Pacientes com sobrepeso ou obesidade E doença cardiovascular estabelecida** — infarto, insuficiência cardíaca, fibrilação atrial, hipertensão — **têm MENOR mortalidade** que pacientes de IMC normal com as mesmas doenças. As explicações discutidas: o IMC normal não distingue massa magra de massa gorda; há **maior catabolismo** nos de IMC normal; e esses pacientes podem apresentar **maior gravidade da doença de base**.

## Transtornos alimentares

| | **Anorexia** | **Bulimia** | **Transtorno de compulsão alimentar** |
| --- | --- | --- | --- |
| Prevalência | 1% | 1% | **3% — o mais frequente** |
| Razão M:H | **10:1** | **6:1** | **3:1** |
| IMC | Reduzido | Geralmente normal | Sobrepeso e obesidade |
| Padrão | Restritivo, **sem compulsão** | Purgativo | **Sem purgação**, com sofrimento marcante |
| Tratamento | Psicoterapia + terapia nutricional | **TCC (1ª escolha)** e ISRS (fluoxetina) | **TCC (1ª escolha)**, ISRS, topiramato e **lisdexanfetamina** |

**Endocrinopatias da anorexia:** **hipogonadismo hipogonadotrófico em 66 a 84%**, por redução da leptina; perda de massa óssea (mais reabsorção e menos formação) com **fratura por estresse**; hipercortisolismo; **GH AUMENTADO com IGF-1 REDUZIDO** (resistência ao GH); TSH normal-baixo com T3 e T4 reduzidos (síndrome do eutireóideo doente); **hiponatremia por SIADH**; leptina baixa e grelina alta.

**Endocrinopatias da bulimia:** **SOP em 45%**, diabetes **3×** (com o fenômeno da **diabulimia**) e **insuficiência adrenal 7×**. Comorbidades: depressão 75%, álcool 60%, tabagismo 40%, TEPT 30%.

**No TCA:** ansiedade 65%, depressão 59%, etilismo 50% — e **aumento da taxa de suicídio**.

**Lisdexanfetamina** — a única aprovada em bula no Brasil para o TCA. Apresentações de **30, 50 e 70 mg**, um comprimido pela manhã, com titulação semanal. **Contraindicada em doença arterial coronariana, hipertensão moderada a grave, hipertireoidismo e glaucoma.**

### Comer noturno × transtorno alimentar relacionado ao sono

| | **Síndrome do comer noturno** | **Transtorno alimentar relacionado ao sono** |
| --- | --- | --- |
| Perfil | 1,5% da população; **2:1 mulheres**; 3ª década | **67% mulheres**; média de 39 anos |
| Tríade | **Hiperfagia vespertina/noturna (> 25% da ingestão diária)**, despertares na madrugada com ingestão e **anorexia matinal**; insônia | Má qualidade do sono, **comer involuntariamente na madrugada** e anorexia matinal |
| **Memória dos episódios** | **HÁ lembrança dos despertares** | **AMNÉSIA total ou parcial dos episódios** |
| Associações | Bulimia 35%, TCA 52% | **Sonambulismo, SAOS, síndrome das pernas inquietas** e uso de **zolpidem** |
| Tratamento | **ISRS (sertralina)** e topiramato | Higiene do sono e tratamento das comorbidades; **agonistas dopaminérgicos** e clonazepam |

## Os eixos endócrinos na obesidade

**Tireotrófico.** Hipotireoidismo em **15%**; a **elevação do TSH é proporcional ao IMC** e **normaliza com a perda de peso**, não constituindo, por si, indicação de levotiroxina. A **leptina estimula a secreção de TRH**, e há **aumento da D2 com redução da D3**, além de aumento da glândula e surgimento de nódulos.

**Corticotrófico — diferenciação com a síndrome de Cushing.**

| Fator | Na obesidade | Por quê |
| --- | --- | --- |
| Secreção de cortisol | Normal ou discretamente aumentada | O estresse metabólico estimula o eixo, mas há compensação |
| **11β-HSD1** | **Aumentada no tecido adiposo visceral** | Converte cortisona em cortisol e **intensifica a ação LOCAL**, favorecendo adipogênese visceral |
| **Depuração de cortisol** | **Aumentada** | Mais metabolização hepática e renal → níveis séricos normais ou baixos |
| **Cortisol livre urinário** | **Reduzido ou normal** | Reflete a depuração aumentada — **não indica hiperprodução** |
| **CBG** | Reduzida | Efeito da hiperinsulinemia; aumenta a fração livre sem hiperatividade global |
| **Teste de 1 mg** | **Supressão PRESERVADA ou aumentada** | Demonstra **ausência de escape do eixo** — é o que diferencia de Cushing |

**Quando dosar cortisol:** apenas com **quadro clínico compatível** ou na **avaliação pré-bariátrica** — **não há rastreio universal na obesidade**. **Como:** supressão com 1 mg overnight; se positivo, cortisol livre urinário e/ou salivar; na dúvida, dexametasona 2 a 8 mg.

**Gonadotrófico.** A infertilidade cresce com o IMC. No **homem**: redução de número, morfologia e mobilidade dos espermatozoides. Na **mulher**: menos ovulação e irregularidade menstrual, **redução da amplitude dos pulsos de LH**, hiperinsulinemia, disfunção e alteração morfológica das mitocôndrias do oócito — e, na fertilização in vitro, **mais aneuploidias e pior qualidade embrionária**.

**Perfil do hipogonadismo hipogonadotrófico funcional:** testosterona total **reduzida**, livre normal ou reduzida, **FSH e LH reduzidos**, **SHBG REDUZIDA** e **estrogênio elevado**. **É reversível com perda de peso superior a 10%, e não constitui indicação de reposição de testosterona.**

## Obesidade e câncer

Risco aumentado para: **pâncreas**, gástrico, **adenocarcinoma de esôfago**, **colorretal**, carcinoma renal de células claras, **hepatocelular**, vesícula biliar, **adenocarcinoma de endométrio**, **mama**, ovário, **tireoide**, **mieloma múltiplo** e **meningioma**.

## Gestação

- Riscos aumentados: **infertilidade, aborto, DHEG (pré-eclâmpsia), DMG**, macrossomia, distocia, **cesárea**, tromboembolismo, defeitos de tubo neural e complicações materno-fetais; puerpério com maior risco de infecção e má cicatrização.
- **Não fazer dieta hipocalórica de restrição durante a gestação** (risco fetal); orientar ganho de peso conforme o IMC pré-gestacional e reduzir a ingestão no **puerpério** (a **amamentação** auxilia na perda).
- Suplementos: **ácido fólico 1 mg/dia** (1º trimestre; doses maiores se antecedente de defeito de tubo neural), **ferro 60 mg/dia a partir da 20ª semana**, **cálcio 1.200–1.400 mg/dia**, **proteína ~1,1 g/kg/dia**; hidratação 1–2 L. Adoçantes: preferir **stevia/sucralose**, evitar sacarina/ciclamato.
- **Pós-bariátrica:** evitar engravidar por **~18 meses** (fase de perda rápida e maior risco nutricional); usar **contracepção** eficaz (**DIU** — a absorção de orais pode ser reduzida) e **reforçar suplementação** e monitorização (B12, ferro, folato, vitamina D); rastrear DMG por curva/glicemias (o teste oral padrão pode causar dumping).

## Desfechos gestacionais na obesidade

**50% das gestantes ganham peso acima do esperado.** A taxa de concepção é menor, e a SOP é frequente.

**Riscos aumentados:** abortamento, **pré-eclâmpsia**, parto pré e pós-termo, **macrossomia fetal**, infecção urinária e **hemorragia pós-parto**. A prevalência de **cesárea** é maior, por desproporção cefalopélvica e distocia. **A probabilidade de amamentar é menor, por atraso na lactogênese**, o que exige apoio ativo à lactação.

## Gestação após cirurgia bariátrica

- **Aguardar 12 a 24 meses** após a cirurgia para engravidar.
- Risco de **restrição de crescimento intrauterino, recém-nascido pequeno para a idade gestacional e parto pré-termo**.
- **Usar métodos NÃO hormonais de contracepção** — a absorção dos orais fica comprometida.
- **NÃO realizar TOTG para rastreio de diabetes gestacional** — usar alternativa, pelo risco de *dumping*.
- **Maior risco de obstrução intestinal na gestação: hérnia interna, intussuscepção e volvo.** Dor abdominal na gestante pós-bariátrica exige investigação, não devendo ser atribuída à gravidez.

## 📊 Suplementação na gestação

| Nutriente | Recomendação |
| --- | --- |
| Ácido fólico | 1 mg/dia (1º trimestre) |
| Ferro | 60 mg/dia a partir da 20ª semana |
| Cálcio | 1.200–1.400 mg/dia |
| Proteína | ~1,1 g/kg/dia |`;

// ── GUARDAS ─────────────────────────────────────────────────────────────────
// histograma do texto ANTIGO medido NO SERVIDOR (nunca transcrito por mim)
const SERV = '0,04x1 1x22 1,1x2 1,4x1 1,5x1 1,6x1 1.200x2 1.400x2 10x2 100x2 102x2 11x2 12x4 130x2 15x5 150x2 16x2 17x1 17,7x1 18x1 19x1 19,9x1 2x12 2,3x1 2,5x1 20x2 2023x1 24x2 25x2 25,3x1 29,3x1 3x13 30x6 31,3x1 34x1 35x3 36x1 39x1 4x3 40x3 42x1 45x4 46x1 469x1 5x2 5,3x1 5,5x1 50x6 52x3 59x1 6x1 60x4 65x2 66x1 67x1 7x1 70x2 75x2 8x2 80x2 82x1 84x1 85x3 88x3 90x2 94x2';
const velho = {}; SERV.split(' ').forEach((p) => { const i = p.lastIndexOf('x'); velho[p.slice(0, i)] = +p.slice(i + 1); });
const novo = {}; (NOVO.match(/\d+(?:[.,]\d+)?/g) || []).forEach((n) => novo[n] = (novo[n] || 0) + 1);
const erros = [];
const perdidos = Object.keys(velho).filter((n) => (novo[n] || 0) < velho[n]).map((n) => n + ' (-' + (velho[n] - (novo[n] || 0)) + ')');
const surgidos = Object.keys(novo).filter((n) => (velho[n] || 0) < novo[n]).map((n) => n + ' (+' + (novo[n] - (velho[n] || 0)) + ')');
if (perdidos.length) erros.push('NÚMERO PERDIDO: ' + perdidos.join(', '));
if (surgidos.length) erros.push('NÚMERO INVENTADO: ' + surgidos.join(', '));

const ESPERADO = { secoes: 12, linhasTab: 51, chars: 16024 };
const secs = (NOVO.match(/^## .+$/gm) || []).length;
const lt = (NOVO.match(/^\|/gm) || []).length;
if (secs !== ESPERADO.secoes) erros.push('SEÇÕES: ' + ESPERADO.secoes + ' → ' + secs);
if (lt !== ESPERADO.linhasTab) erros.push('LINHAS DE TABELA: ' + ESPERADO.linhasTab + ' → ' + lt);

const PROIBIDO = [
  ['⚠️', 'alerta na prosa'],
  ['é isso que a define', 'aforismo'],
  ['Prognóstico ruim', 'adjetivo avaliativo'],
  ['simplesmente', 'coloquialismo'],
  ['O que separa os dois', 'cabeçalho retórico'],
  ['por que a obesidade NÃO é Cushing', 'título retórico'],
  ['e o que muda é a resposta', 'título retórico'],
  ['Números da gestação', 'título informal'],
  ['normal da gravidez', 'coloquialismo entre aspas'],
  ['é próprio:', 'coloquialismo'],
  ['ser mais doentes', 'coloquialismo'],
  ['o mais comum', 'superlativo avaliativo'],
];
PROIBIDO.forEach(([f, m]) => { if (NOVO.includes(f)) erros.push('JARGÃO QUE SOBREVIVEU: "' + f + '" (' + m + ')'); });

const TERMOS = ['SRAA', 'ApoC3', 'CETP', 'SHBG', '11β-HSD', 'GESF', 'MASLD/MASH', 'SAHOS', 'NCEP-ATP III',
  'STOP-BANG', 'Epworth', 'AASM', 'SURMOUNT-OSA', 'IAH', 'CPAP', 'maxilomandibular', 'ICFEP', 'BNP',
  'diabulimia', 'Lisdexanfetamina', 'zolpidem', 'sertralina', 'topiramato', 'eutireóideo', 'SIADH',
  'pseudo-Cushing', 'CBG', 'dumping', 'intussuscepção', 'volvo', 'stevia/sucralose', 'meningioma'];
TERMOS.forEach((t) => { if (!NOVO.includes(t)) erros.push('TERMO CLÍNICO PERDIDO: ' + t); });

if (erros.length) { console.error('✗ NÃO LIBEREI:'); erros.forEach((e) => console.error('   · ' + e)); process.exit(1); }

const md5 = crypto.createHash('md5').update(NOVO, 'utf8').digest('hex');
console.log('✓ números: ' + Object.values(velho).reduce((a, b) => a + b, 0) + ' → ' + Object.values(novo).reduce((a, b) => a + b, 0) + ', 0 perdidos e 0 inventados');
console.log('✓ seções ' + secs + ' · linhas de tabela ' + lt + ' · ⚠️ 36 → ' + (NOVO.split('⚠️').length - 1));
console.log('✓ ' + PROIBIDO.length + ' padrões de jargão e ' + TERMOS.length + ' termos clínicos conferidos');
console.log('✓ chars ' + ESPERADO.chars + ' → ' + NOVO.length);
console.log('\nmd5 do texto auditado: ' + md5);
fs.writeFileSync('/tmp/comorbidades.txt', NOVO);
