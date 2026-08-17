// "Obesidade: Avaliação Clínica e Diagnóstico" no registro formal/técnico.
// Terceiro e último dos capítulos que a propagação do EndoTEEM 2026 engordou
// (15 ⚠️ / 10.062 chars = 1,49 por mil). Mesmas guardas dos dois anteriores.
'use strict';
const fs = require('fs'), crypto = require('crypto');

const NOVO = `## Conceito central

O diagnóstico atual combina **adiposidade + distribuição + composição + impacto orgânico** — **não se resume ao IMC**. O objetivo é identificar quem tem **doença atribuível à adiposidade**, e não apenas classificar por peso.

## Antropometria

- **IMC** (triagem populacional): obesidade **≥ 30 kg/m²**; interpretar com **cautela** em atletas (massa magra), idosos (a sarcopenia superestima a adequação do peso), edema/ascite e diferenças **étnicas**. É medida barata e reprodutível, mas **não distingue gordura de massa magra nem informa distribuição**.
- **Circunferência da cintura** (marcador de gordura **visceral** e risco cardiometabólico): NCEP **> 102 (H)/88 (M)**; IDF **≥ 90 (H)/80 (M)**, ajustada por população. Medir no ponto médio entre a última costela e a crista ilíaca.
- **Relação cintura-quadril:** **melhor correlação com risco cardiovascular**; a relação cintura-estatura (> 0,5) também é útil e simples.

## Composição corporal

- **Bioimpedância (BIA):** prática e barata; estima massa gorda/magra e água; o **ângulo de fase** menor indica pior integridade celular/prognóstico. Preparo: **jejum 4 h, sem exercício 12 h, sem álcool 24 h, sem diurético 7 dias**; sofre influência do estado de hidratação.
- **DXA:** alta acurácia (precisão ~**1% para osso, ~3% para gordura**), avalia massa gorda, magra e óssea e a gordura androide/ginoide; **limitada em pacientes com elevado IMC/excesso de peso** (tamanho da mesa/campo).
- **TC/RM:** **padrão-ouro** para quantificar gordura **visceral/subcutânea e ectópica** (segmentar); alto custo e **radiação na TC** restringem o uso à pesquisa/casos selecionados.
- **Pesagem hidrostática** (referência laboratorial) e **dobras cutâneas** (baixo custo, **baixa acurácia** e dependente do operador).

## Populações especiais

- **Idosos:** **sarcopenia** + centralização da gordura → o IMC subestima adiposidade; preferir **TC/RM/DXA** e medidas de força/função.
- **Asiáticos:** mais gordura para o mesmo IMC → **pontos de corte menores** (sobrepeso ≥ 23, obesidade ≥ 27,5); **negros** tendem a ter mais massa óssea/proteica para o mesmo IMC.

## Estadiamento

- **EOSS (Edmonton, 0–4):** integra **comorbidade, limitação funcional e impacto psicológico** — **prediz mortalidade melhor que o IMC** e orienta a agressividade do tratamento.
- **Comissão Lancet 2025:** distingue **obesidade clínica** (disfunção de órgão/tecido **atribuível à adiposidade**, ex.: DM2, SAHOS, MASH) de **obesidade pré-clínica** (função preservada, com **risco aumentado**) — deslocando o foco do peso para a repercussão orgânica.

## Avaliação global

- **História do peso** (trajetória, gatilhos, tentativas prévias) e **fármacos que engordam**; **comorbidades** com exames dirigidos (**glicemia/HbA1c**, perfil **lipídico**, **PA**, **TSH**, função **hepática**/rastreio de MASLD, rastreio de **apneia**); avaliação do **comportamento alimentar e psicológico** (compulsão, depressão, imagem corporal); definição de **metas centradas em saúde**, e não restritas ao peso aferido, e identificação de barreiras.

## Anamnese e exame físico

**História clínica.** Cronologia do surgimento da obesidade; fatores desencadeantes; **peso máximo**, que é a referência da classificação por resposta; padrão alimentar; medicações prévias e atuais; histórico familiar; hábitos de vida.

**Exame físico.** Antropometria básica (peso, altura, IMC); **distribuição da gordura** (circunferência abdominal, razão cintura/estatura); sinais vitais; avaliação cardiopulmonar; exame abdominal (hepatomegalia, hérnia); avaliação **musculoesquelética e funcional** (mobilidade articular e força); e exame cutâneo — **acantose nigricans, estrias violáceas, hirsutismo**.

## IMC: cortes e limites

**Adultos ≥ 30 kg/m²**; **asiáticos > 27,5 kg/m²**; **crianças e adolescentes ≥ p97 ou escore-Z ≥ +2**.

**Vantagem:** é ferramenta de saúde pública para avaliação nutricional.

**Desvantagens:** **30% dos indivíduos com IMC normal têm excesso de massa gorda**; não reflete a **distribuição** da gordura; **não distingue massa magra de massa gorda**; e tem limitações em crianças, idosos, atletas e em quem está perdendo peso. A relação com a mortalidade tem forma **em U**.

## 📊 Medidas de gordura visceral

São **indicadores mais precisos do risco cardiometabólico do que o IMC isolado**.

| Medida | Homens | Mulheres |
| --- | --- | --- |
| **Circunferência da cintura** | **> 94 cm** | **> 80 cm** |
| **Relação cintura-quadril** | **> 1,0** | **> 0,85** |
| **Relação cintura-estatura** | **≥ 0,5** — o mesmo corte para os dois sexos | |

**Os cortes da circunferência variam conforme a referência adotada:** 94/80 cm nesta aula (OMS/IDF), **102/88 cm pelo NCEP** e **90/80 cm pela IDF para populações asiáticas**. A referência empregada deve ser sempre explicitada.

## Classificação por resposta ao tratamento (SBEM/ABESO, 2022)

A referência é o **peso máximo**, e a faixa é definida pelo **IMC MÁXIMO** — não pelo atual.

| IMC máximo | Inalterada | Reduzida | Controlada |
| --- | --- | --- | --- |
| **30 a 40 kg/m²** | perda < 5% | perda de **5 a 10%** | perda **> 10%** |
| **40 a 50 kg/m²** | perda < 10% | perda de **10 a 15%** | perda **> 15%** |

**Situações em que a classificação NÃO se aplica:** pós-operatório de cirurgia bariátrica; sobrepeso; menores de 18 anos; e pacientes com doenças terminais (doença renal crônica em estágio final, câncer metastático). **O peso máximo da gestação deve ser desconsiderado.**

## Obesidade pré-clínica × clínica (Lancet Commission, 2025)

| | **Pré-clínica** | **Clínica** |
| --- | --- | --- |
| Definição | Excesso de gordura corporal **sem disfunção observável** de órgãos ou tecidos | Excesso de gordura **COM disfunção de órgão ou tecido**, ou **limitação significativa das atividades diárias** (banhar-se, vestir-se, locomover-se) |
| Risco | Aumentado para DM2, doença cardiovascular, câncer e transtornos mentais | Já há sinais, sintomas ou exames demonstrando prejuízo funcional |
| Conduta | **Medidas preventivas** | **Tratar** — remissão ou melhora das manifestações e prevenção de danos maiores |

**Confirmação do excesso de adiposidade exigida pela Comissão** — o IMC isolado não é suficiente:
- **medição direta da gordura corporal** (DEXA, bioimpedância); **ou**
- **IMC + uma medida antropométrica** (cintura, cintura-quadril ou cintura-estatura); **ou**
- **duas medidas antropométricas**.

## Gordura visceral (VAT)

Tecido adiposo intra-abdominal — em torno de fígado, pâncreas, rins e intestinos —, **metabolicamente mais ativo e inflamatório** que o subcutâneo.

**Como medir:** **tomografia é o padrão-ouro**, no corte **L4-L5**, expressa em cm²; a **ressonância** é a alternativa sem radiação, de alto custo; a **DXA** em versões modernas dá estimativa indireta.

**VAT ≥ 100 cm² indica risco cardiometabólico aumentado.**

## Métodos de composição corporal em detalhe

**Pesagem hidrostática.** Baseada no **princípio de Arquimedes**. Alta reprodutibilidade e boa precisão, validada em várias populações — mas é **cara, exclusivamente laboratorial**, não avalia distribuição e é inviável em crianças, idosos e pacientes com doença respiratória.

**Antropometria e pregas.** Barata, simples e prática, correlaciona-se com a **gordura subcutânea** e permite acompanhar ao longo do tempo. **Baixa acurácia e baixa reprodutibilidade, e não avalia gordura visceral.**

**Bioimpedância.** Corrente elétrica de **baixa intensidade** através dos tecidos; estima massa magra, massa gorda, percentual de gordura e taxa metabólica basal. Portátil, rápida, reprodutível, barata e **não operador-dependente**, o que favorece a adesão ao acompanhamento.
- *Limites:* acurácia variável com etnia, sexo, idade e técnica; avaliação segmentar limitada; **não avalia VAT nem gordura ectópica**; **subestima a massa gorda em indivíduos magros (~5 kg)** e a **massa magra em idosos**.
- *Contraindicações:* **marca-passo, gestação e implantes metálicos**. Cuidado com variáveis pré-analíticas: TPM, diuréticos e objetos metálicos.

**DXA — padrão-ouro de composição corporal.** Não invasiva, rápida, com alta acurácia e reprodutibilidade: **erro de 1% para massa óssea e 3% para massa gorda**. *Limites:* limite de peso do equipamento nos superobesos; radiação (1 a 10% de uma radiografia); **imprecisa para VAT**; contraindicada na gestação; e **as marcas (Hologic, GE-Lunar) não são comparáveis entre si**.

**Ultrassonografia.** Simples, barata e reprodutível, e **avalia gordura ectópica — hepática, epicárdica e intramuscular**. É **examinador-dependente** e avalia apenas a gordura segmentar abdominal.

**Tomografia e ressonância — padrão-ouro da gordura abdominal segmentar.** Boa precisão para VAT e avaliam **gordura ectópica**; caras, e a tomografia expõe a radiação alta.

| | **BIA** | **DXA** | **TC** | **RM** |
| --- | --- | --- | --- | --- |
| Massa gorda total | Sim | Sim | Sim | Sim |
| Massa magra total | Sim | Sim | Sim | Sim |
| **VAT** | **Não** | Aproximado | **Sim** | **Sim** |
| Volume muscular segmentar | Não | Não | Sim | Sim |
| **Gordura ectópica** | **Não** | **Não** | **Sim** | **Sim** |
| Radiação | Não | Sim | Sim | **Não** |

## Populações especiais

**Idosos.** Perda de massa muscular e óssea reduz a massa livre de gordura; a gordura **centraliza** no abdome, com perda de subcutâneo e ganho troncular e **ectópico**. **Os métodos de escolha nessa faixa são TC/RM e DXA** — a bioimpedância subestima a massa magra justamente no idoso.

**Negros.** Maior massa óssea e proteica; maior comprimento dos membros em relação ao tronco.

**Asiáticos.** Maior quantidade de massa gorda para o mesmo IMC, o que fundamenta o corte de 27,5 kg/m².

## 📊 Métodos de composição corporal

| Método | Vantagem | Limitação |
| --- | --- | --- |
| Bioimpedância | Prática e barata | Acurácia variável; depende da hidratação (ângulo de fase) |
| DXA | Alta acurácia (gordura, magra e óssea) | Limite de peso/tamanho; radiação baixa |
| TC / RM | Padrão-ouro (gordura visceral/abdominal) | Alto custo; radiação (TC) |
| Dobras cutâneas | Baixo custo | Baixa acurácia; dependente do operador |`;

const SERV = '0x1 0,5x2 0,85x1 1x4 1,0x1 10x5 100x1 102x2 12x1 15x2 18x1 2x3 2022x1 2025x2 23x1 24x1 27,5x3 3x2 30x4 4x3 40x2 5x4 50x1 7x1 80x4 88x2 90x2 94x2 97x1';
const velho = {}; SERV.split(' ').forEach((p) => { const i = p.lastIndexOf('x'); velho[p.slice(0, i)] = +p.slice(i + 1); });
const novo = {}; (NOVO.match(/\d+(?:[.,]\d+)?/g) || []).forEach((n) => novo[n] = (novo[n] || 0) + 1);
const erros = [];
const perdidos = Object.keys(velho).filter((n) => (novo[n] || 0) < velho[n]).map((n) => n + ' (-' + (velho[n] - (novo[n] || 0)) + ')');
const surgidos = Object.keys(novo).filter((n) => (velho[n] || 0) < novo[n]).map((n) => n + ' (+' + (novo[n] - (velho[n] || 0)) + ')');
if (perdidos.length) erros.push('NÚMERO PERDIDO: ' + perdidos.join(', '));
if (surgidos.length) erros.push('NÚMERO INVENTADO: ' + surgidos.join(', '));

const secs = (NOVO.match(/^## .+$/gm) || []).length, lt = (NOVO.match(/^\|/gm) || []).length;
if (secs !== 15) erros.push('SEÇÕES: 15 → ' + secs);
if (lt !== 28) erros.push('LINHAS DE TABELA: 28 → ' + lt);

const PROIBIDO = [['⚠️', 'alerta na prosa'], ['Diga sempre', 'imperativo coloquial'],
  ['o número na balança', 'coloquialismo'], ['O que perguntar e o que examinar', 'título retórico'],
  ['um a um', 'título informal'], ['não basta', 'coloquialismo'], ['aqui são', 'coloquialismo'],
  ['daí o corte', 'conectivo coloquial'], ['peso saudável', 'coloquialismo entre aspas'],
  ['Onde ela NÃO se aplica', 'título retórico'], ['Como a Comissão manda', 'coloquialismo'],
  ['régua está usando', 'metáfora coloquial'], ['boa para engajamento', 'adjetivo avaliativo']];
PROIBIDO.forEach(([f, m]) => { if (NOVO.includes(f)) erros.push('JARGÃO QUE SOBREVIVEU: "' + f + '" (' + m + ')'); });

const TERMOS = ['EOSS', 'Edmonton', 'Lancet', 'SAHOS', 'MASH', 'MASLD', 'HbA1c', 'acantose nigricans',
  'estrias violáceas', 'hirsutismo', 'escore-Z', 'ângulo de fase', 'Arquimedes', 'Hologic', 'GE-Lunar',
  'L4-L5', 'VAT', 'DXA', 'SBEM/ABESO', 'androide/ginoide', 'cintura-estatura', 'NCEP', 'IDF'];
TERMOS.forEach((t) => { if (!NOVO.includes(t)) erros.push('TERMO CLÍNICO PERDIDO: ' + t); });

if (erros.length) { console.error('✗ NÃO LIBEREI:'); erros.forEach((e) => console.error('   · ' + e)); process.exit(1); }
console.log('✓ números: ' + Object.values(velho).reduce((a, b) => a + b, 0) + ' → ' + Object.values(novo).reduce((a, b) => a + b, 0) + ', 0 perdidos e 0 inventados');
console.log('✓ seções ' + secs + ' · linhas de tabela ' + lt + ' · ⚠️ 15 → ' + (NOVO.split('⚠️').length - 1));
console.log('✓ ' + PROIBIDO.length + ' padrões de jargão e ' + TERMOS.length + ' termos clínicos conferidos');
console.log('✓ chars 10062 → ' + NOVO.length);
console.log('\nmd5 do texto auditado: ' + crypto.createHash('md5').update(NOVO, 'utf8').digest('hex'));
