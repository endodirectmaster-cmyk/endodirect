// EndoTEEM 2026 · Hipotireoidismo (DAG3TUpNEGc, 38 slides)
// -> Hipotireoidismo + Tireoide: Avaliação da Função e Imagem + Emergências Tireoidianas
const fs = require('fs');

const A1 = '## 📊 Principais causas de hipotireoidismo';
const A2 = '## Interferências e armadilhas de ensaio';
const A3 = '## 📊 Crise tireotóxica × Coma mixedematoso';

const B1 = `## 📊 Classificação por padrão laboratorial

| Tipo | Etiologias | Padrão |
|---|---|---|
| **Primário** | Autoimune; pós-radioiodo ou radioterapia cervical; pós-tireoidectomia; deficiência de iodo; fármacos (**amiodarona, tionamidas, lítio**); pós-tireoidites; congênito (agenesia, disgenesia); erros inatos | **TSH↑ · T4↓** |
| **Secundário / terciário** (hipófise ou hipotálamo) | Cirurgia hipotalâmico-hipofisária; radioterapia de SNC; tumores; hipofisite (autoimune ou por **inibidor de checkpoint**); doenças infiltrativas (metástase, hemocromatose, sarcoidose, tuberculose) | **TSH normal, baixo ou discretamente ALTO · T4↓** |
| **Consumptivo** — produção excessiva de **D3**, que inativa T4 e T3 em **T3 reverso** | **Hemangiomas hepáticos**, sarcomas — mais comum em **crianças** | **TSH↑ · T4↓ · T3 reverso↑** |

⚠️ **O hipotireoidismo central pode cursar com TSH discretamente elevado** — o TSH
secretado é biologicamente inativo. Não é o número do TSH que exclui.

## Em quem rastrear

- Disfunção tireoidiana prévia.
- Radioterapia de cabeça/pescoço, cirurgia cervical.
- Cirurgia hipotalâmica ou hipofisária.
- Comorbidades autoimunes: DM1, insuficiência adrenal, doença celíaca.
- **Síndrome de Down** e **síndrome de Turner**.
- Fármacos: **amiodarona, lítio, interferon, inibidores de tirosina-quinase e de
  checkpoint**.
- **SBEM**: TSH **a cada 5 anos a partir dos 35 anos**, e em **gestante no 1º
  trimestre**.

## O algoritmo diagnóstico

1. População de risco ou suspeita → **TSH**.
2. Alterado → **repetir o TSH e solicitar T4 livre**.
3. **TSH↑ + T4L↓ = franco** → iniciar levotiroxina **1,6–1,8 mcg/kg/dia** (**25–50
   mcg/dia** se idoso ou cardiopata).
4. **TSH↑ + T4L normal = subclínico** → seguir o algoritmo do subclínico.
5. **TSH baixo/normal + T4L↓ = central** → ⚠️ **solicitar os demais eixos
   hipofisários (atenção ao CORTISOL) e RM de sela ANTES de iniciar o tratamento.**
6. **TSH e T4L em 6 semanas** para conferir a meta.

⚠️ **Anti-TG, anti-TPO e ultrassom NÃO são necessários de rotina.**

## Quadro clínico — sinais e sintomas

| Sinais | Sintomas |
|---|---|
| **Lentificação do reflexo tendinoso** (fase de relaxamento) | Fadiga |
| Edema/mixedema, macroglossia, derrames cavitários | Sonolência |
| **Bradicardia, hipertensão diastólica** | Constipação |
| Alopecia, unhas frágeis, **madarose**, pele seca e opaca | **Ganho de peso discreto — 3 a 4 kg no máximo, por retenção hídrica** |
| Hipotermia e bradipneia (casos graves) | Parestesias / **síndrome do túnel do carpo** |
| Bócio, aumento cervical, rouquidão, disfagia | Alteração menstrual — **77% sem alteração**, 16% oligo/amenorreia, 7% metrorragia |
| Baixa estatura (na infância) | |

## Alterações laboratoriais que acompanham

- **Anemia** normo/normo, hipo/micro **ou macrocítica**.
- **Síndrome de von Willebrand adquirida** — estado **pró-hemorrágico**.
- **Hipercolesterolemia** (↑LDL, por redução dos receptores B/E hepáticos).
- **↓SHBG** → **testosterona total baixa** (sem hipogonadismo verdadeiro).
- **Hiperprolactinemia** — a queda de T4/T3 estimula o TRH, que sobe TSH **e** PRL.
- **Miopatia com ↑CPK**; casos graves chegam à **rabdomiólise**.
- **Hiponatremia** — só no hipotireoidismo franco, geralmente com **TSH >50**.
- **Anti-TPO** é o mais prevalente e mais específico; **anti-TG** é menos prevalente
  e inespecífico.

## Quando o ultrassom é indicado

Não é rotina. Indica-se se: alteração ao exame físico (nódulo palpável, bócio);
suspeita de alteração congênita (agenesia, disgenesia, tireoide ectópica); sintomas
compressivos; nódulo achado em outro exame (TC, PET-CT); ou **etiologia não
identificada com anticorpos negativos**.

Quando feito, o padrão da **tireoidite de Hashimoto** é: ecotextura heterogênea,
formações **pseudonodulares hipoecogênicas** e, na fase crônica, **tireoide
atrófica**.

## Metas e titulação

- **Adulto jovem: TSH 0,5–2,5** — 95% dos jovens eutireóideos estão nessa faixa.
- **Idoso: 4–6** (tolerável 3–6).
- Jovem pode começar com **~1 mcg/kg/dia** e titular pelo TSH.
- **Idoso/cardiopata**: começar com **12,5–25 mcg/dia** e progredir 12,5–25 mcg
  **por semana**.
- ⚠️ **O primeiro exame a normalizar é o T4 livre**; o **TSH cai cerca de 50% por
  semana** e leva semanas para normalizar.
- ⚠️ **T4L normal com TSH ainda elevado no seguimento = pensar em má aderência**
  (o paciente tomou nos dias que antecederam a coleta).

## Cuidados com a levotiroxina

- **30–60 minutos de jejum**; ou, se à noite, no mínimo **3 h após a última
  refeição**. Em dieta enteral: pausar **3 h** antes e religar **1 h** depois.
- ⚠️ **Não tomar no dia da coleta** — há pico de T4L logo após a ingestão.
- **Não administrar junto** com sulfato ferroso, carbonato de cálcio,
  colestiramina, hidróxido de alumínio ou sevelamer.
- **IBP** reduz a acidez gástrica e a absorção de forma crônica — a dose tende a
  subir com o tempo. **Estrogênio (TRH)** aumenta a TBG e a necessidade de dose.

### Hipotireoidismo refratário e o teste de absorção

Antes de tudo: má aderência, doença disabsortiva (gastrite atrófica, doença celíaca,
doença inflamatória), interferentes e uso incorreto.

**Teste de absorção de levotiroxina**

1. **1.000 mcg** de levotiroxina no dia do teste (sem tomar a dose habitual).
2. Dosagem seriada de T4 livre ou total nos tempos **0 e 2 h** (protocolos vão até 6 h).
3. **Aumento esperado: >60% do T4L em 2 h.** **<60% sugere disabsorção.**
4. Confirmada, investigar com endoscopia e tratar a causa. Considerar **levotiroxina
   por via retal**.

### Sintomático apesar de exames normais — e o T4+T3

- Primeiro: **outra doença explicando sintomas inespecíficos**.
- **ATA não recomenda** a combinação T4+T3 em quem está insatisfeito com a
  monoterapia — os ensaios não mostraram melhora significativa.
- Um **trial** é possível em quem persiste sintomático. Relação fisiológica
  **T4:T3 de 13–16:1**.
- **Candidatos**: tireoidectomizados totais ou pós-ablação com radioiodo; ou
  Hashimoto com TSH e T4 na meta e **T3 total baixo ou no limite inferior**.
- ⚠️ **Evitar** em idosos, cardiopatas, portadores de arritmia, osteoporose/alto
  risco de fratura e **gestantes**.

## ⚠️ Pegadinhas de prova

- **O hipotireoidismo consumptivo é causado pela desiodase tipo 3 (D3)**, não pela
  D2. Associa-se a tumores hepáticos vasculares, é mais comum em crianças e exige
  **doses altas de T4**, às vezes com T3 (TEEM 2019, q. 6).
- **TSH 15 com T4L baixo é hipotireoidismo FRANCO**, não subclínico — e o anti-TPO
  confirma Hashimoto. A dose é 1,6 mcg/kg/dia **sem** associar T3 (TEEM 2020, q. 36).
- **No coma mixedematoso o TSH NÃO precisa estar acima de 100.** O diagnóstico é
  clínico (TEEM 2019, q. 14).

${A1}`;

const B2 = `## Síndrome do eutireóideo doente (síndrome do T3 baixo)

Conjunto de alterações da função tireoidiana em **quem era eutireóideo**, durante
doença inflamatória **aguda ou crônica**.

- **Fase aguda**: o excesso de citocinas **suprime o TSH** (ativação da **D2
  central**), derruba T4 e T3 e **eleva o T3 reverso** (ativação da **D3
  periférica**).
- **Fase de recuperação**: **TSH sobe — podendo chegar a 20 mU/L** —, T4 e T3 sobem
  e o T3 reverso cai.
- ⚠️ **Não indica tratamento.** Repetir a função tireoidiana **após 2 semanas**.
- ⚠️ **Exceção**: os extremos — **TSH <0,1 ou TSH >20** — são suspeitos de doença
  primária da tireoide e pedem investigação e eventual tratamento.

**Na prática de prova**: paciente em UTI, séptico, com **TSH normal ou baixo, T4
livre no limite inferior e T3 total francamente baixo** é síndrome do T3 baixo — não
é hipotireoidismo central nem efeito de amiodarona, e a conduta é **reavaliar
ambulatorialmente** (TEEM 2025 q. 31; TEEM 2019 q. 13).

${A2}`;

const B3 = `## O estado mixedematoso em detalhe

Extremo de gravidade do hipotireoidismo, com **mortalidade de 30%**.

**Os dois marcadores clínicos**: **rebaixamento do nível de consciência** (confusão,
letargia, coma) **+ hipotermia**.

Outros achados: **bradipneia com hipercapnia**, bradicardia, **derrames cavitários —
inclusive tamponamento cardíaco**, hiponatremia, hipoglicemia, hipotensão e choque.

**Quase sempre há fator precipitante**: infecção, pós-operatório, infarto,
**sedativos, opioides**, frio extremo.

⚠️ **O diagnóstico é clínico — não existe exame confirmatório.** Há escore
diagnóstico, de **alta sensibilidade e baixa especificidade**. E **o TSH não precisa
estar acima de 100**.

**Tratamento**

- **Suporte intensivo.**
- **Suporte térmico passivo** (mantas). ⚠️ **Aquecimento ativo corre risco de
  vasodilatação de rebote e piora do choque.**
- ⚠️ **Hidrocortisona 100 mg IV + 50 mg IV a cada 6 h — ANTES do hormônio
  tireoidiano**: a levotiroxina pode desmascarar insuficiência adrenal relativa, e o
  hipotireoidismo pode ser central, com múltiplos déficits.
- **Hormônio tireoidiano — no Brasil**: levotiroxina VO/SNE/**via retal**
  **3–5 mcg/kg/dia** (o dobro ou o triplo da dose de reposição) por **3–7 dias**,
  seguindo com 1,6–1,8 mcg/kg/dia. **Nos EUA**: T3 IV 5–20 mcg de ataque + 2,5–10
  mcg a cada 8 h, com T4 200–400 mcg de ataque + 50–100 mcg/dia IV.
- **Seguimento**: T4 e T3 **a cada 48 h**, procurando a curva ascendente.

**Piora o prognóstico**: idade avançada, hiponatremia, rebaixamento do sensório e
disfunção de múltiplos órgãos. E **vigiar o sangramento digestivo** — causa
importante de óbito, junto com a insuficiência respiratória e a sepse.

${A3}`;

const P1 = [
  'Hipotireoidismo central pode cursar com TSH discretamente ELEVADO (TSH bioinativo) — o número do TSH não exclui',
  'Hipotireoidismo consumptivo: excesso de D3 em hemangioma hepático/sarcoma, mais comum em criança, com T3 reverso alto',
  'Antes de tratar hipotireoidismo central: demais eixos hipofisários (sobretudo CORTISOL) e RM de sela',
  'SBEM: TSH a cada 5 anos a partir dos 35 anos e em toda gestante no 1º trimestre',
  'Rastrear em Down, Turner e em uso de amiodarona, lítio, interferon, inibidor de tirosina-quinase e de checkpoint',
  'Anti-TG, anti-TPO e ultrassom NÃO são de rotina no hipotireoidismo',
  'Ganho de peso no hipotireoidismo é discreto — 3 a 4 kg no máximo, por retenção hídrica',
  'Alteração menstrual: 77% não têm nenhuma; 16% oligo/amenorreia; 7% metrorragia',
  'Hipotireoidismo cursa com von Willebrand adquirido, ↓SHBG (testosterona total baixa), hiperprolactinemia e ↑CPK',
  'Hiponatremia só no franco, geralmente com TSH >50',
  'Ultrassom no hipotireoidismo só se bócio/nódulo, suspeita congênita, sintoma compressivo, achado em outro exame ou etiologia indefinida com anticorpos negativos',
  'Meta de TSH: 0,5–2,5 no adulto jovem e 4–6 no idoso',
  'Idoso/cardiopata: iniciar 12,5–25 mcg/dia e progredir 12,5–25 mcg por semana',
  'O primeiro exame a normalizar é o T4 livre; o TSH cai ~50% por semana',
  'T4L normal com TSH ainda alto no seguimento = má aderência',
  'Levotiroxina: 30–60 min de jejum, ou 3 h após a última refeição à noite; não tomar no dia da coleta',
  'Interferentes na absorção: ferro, cálcio, colestiramina, hidróxido de alumínio, sevelamer, IBP; estrogênio aumenta a TBG e a dose',
  'Teste de absorção: 1.000 mcg, T4L em 0 e 2 h — aumento <60% sugere disabsorção',
  'ATA não recomenda T4+T3 de rotina; trial possível em tireoidectomizado/pós-radioiodo ou Hashimoto com T3 total baixo',
  'Evitar T4+T3 em idoso, cardiopata, arritmia, osteoporose e gestante',
  'Consumptivo é D3, não D2 — pegadinha clássica',
];
const P2 = [
  'Síndrome do T3 baixo: citocinas suprimem TSH (D2 central), caem T4/T3 e sobe T3 reverso (D3 periférica)',
  'Na recuperação o TSH sobe, podendo chegar a 20 mU/L — repetir a função em 2 semanas, sem tratar',
  'Extremos (TSH <0,1 ou >20) fogem da síndrome do doente eutireóideo e pedem investigação',
];
const P3 = [
  'Coma mixedematoso: mortalidade 30%, marcado por rebaixamento de consciência + hipotermia, quase sempre com precipitante',
  'O TSH NÃO precisa estar acima de 100 — o diagnóstico é clínico, sem exame confirmatório',
  'Hidrocortisona 100 mg IV + 50 mg 6/6 h ANTES do hormônio tireoidiano (risco de desmascarar insuficiência adrenal)',
  'Levotiroxina 3–5 mcg/kg/dia por 3–7 dias (Brasil), depois 1,6–1,8; seguir T4/T3 a cada 48 h',
  'Aquecimento ativo é perigoso — vasodilatação de rebote e piora do choque; usar mantas e aquecimento passivo',
  'Vigiar sangramento digestivo: causa importante de óbito no coma mixedematoso',
];

const G = {
  B1: ['Classificação por padrão laboratorial', 'T3 reverso', 'inibidor de checkpoint',
    'Síndrome de Down', 'a cada 5 anos a partir dos 35 anos', '1,6–1,8 mcg/kg/dia',
    'RM de sela', 'NÃO são necessários de rotina', 'madarose', '3 a 4 kg',
    '77% sem alteração', 'von Willebrand', 'SHBG', 'TSH >50',
    'pseudonodulares hipoecogênicas', '0,5–2,5', '12,5–25 mcg/dia',
    '50% por\n  semana', 'má aderência', 'sevelamer', 'TBG',
    '1.000 mcg', '>60% do T4L em 2 h', 'via retal', '13–16:1',
    'Pegadinhas de prova', 'desiodase tipo 3 (D3)', 'TEEM 2020, q. 36'],
  B2: ['eutireóideo doente', 'D2\n  central', 'D3\n  periférica', '20 mU/L',
    'após 2 semanas', 'TSH <0,1 ou TSH >20', 'TEEM 2025 q. 31'],
  B3: ['mortalidade de 30%', 'hipotermia', 'tamponamento cardíaco', 'sedativos, opioides',
    'baixa especificidade', 'vasodilatação de rebote', 'Hidrocortisona 100 mg IV',
    '3–5 mcg/kg/dia', 'a cada 48 h', 'sangramento digestivo'],
};
const blocos = { B1, B2, B3 }, ancoras = { B1: A1, B2: A2, B3: A3 };
let erros = [];
for (const k of Object.keys(G)) {
  for (const n of G[k]) if (!blocos[k].includes(n)) erros.push(k + ' NOVO ausente: ' + JSON.stringify(n));
  if (!blocos[k].endsWith(ancoras[k])) erros.push(k + ' não termina na âncora');
}
if (erros.length) { console.error(erros.join('\n')); process.exit(1); }

const q = (t, s) => '$' + t + '$' + s + '$' + t + '$';
const F = 'Síntese Endodirect · EndoTEEM 2026 (Hipotireoidismo) + SBEM / ATA';
const ramo = (tag, tema, anc, blk, pts) => `      when d->>'tema' = ${q(tag + 'T', tema)} then
        jsonb_set(
          jsonb_set(d, '{resumo}', to_jsonb(replace(d->>'resumo', ${q(tag + 'A', anc)}, ${q(tag + 'B', blk)}))),
          '{pts}', (d->'pts') || ${q(tag + 'P', JSON.stringify(pts))}::jsonb
        ) || ${q(tag + 'F', JSON.stringify({ fonte: F }))}::jsonb`;

const sql = `-- EndoTEEM 2026 · Hipotireoidismo -> 3 capítulos de Tireoide
update endodirect_global_state g
set payload = jsonb_set(g.payload, '{diretrizes}', (
  select jsonb_agg(
    case
      when d->>'sub' not ilike '%ireoid%' or coalesce(d->>'privado','') <> 'true' then d
${ramo('hh', 'Hipotireoidismo', A1, B1, P1)}
${ramo('ff', 'Tireoide: Avaliação da Função e Imagem', A2, B2, P2)}
${ramo('mm', 'Emergências Tireoidianas: Crise Tireotóxica e Coma Mixedematoso', A3, B3, P3)}
      else d
    end order by ord)
  from jsonb_array_elements(g.payload->'diretrizes') with ordinality t(d, ord)
))
where g.payload ? 'diretrizes';
`;
fs.writeFileSync(__dirname + '/tir-hipo.sql', sql);
console.log('OK · B1 %dc/%dpts · B2 %dc/%dpts · B3 %dc/%dpts', B1.length, P1.length, B2.length, P2.length, B3.length, P3.length);
