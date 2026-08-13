// Capítulo "Suplementação Nutricional Pós-Bariátrica" atualizado pela aula 12 do
// EndoTEEM 2026 (27 slides, design DAGnvr3xtXg).
//
// O que a aula acrescenta: cuidados pré-operatórios, desnutrição proteico-energética,
// o bloco de massa óssea (CTX, DMO que segue caindo após o platô, antirreabsortivo
// parenteral), metabolismo e estadiamento do ferro por ferritina, metabolismo da B12
// com o MMA como marcador precoce, a tabela de deficiências por técnica cirúrgica e
// a tabela de micronutrientes com prevalência, RDA e dose de reposição.
const fs = require('fs');
const path = require('path');

const TEMA = 'Suplementação Nutricional Pós-Bariátrica';
const SUB = 'Obesidade';

const resumo = `## Conceito central

Após a cirurgia bariátrica, **a suplementação e a monitorização são vitalícias**. As deficiências decorrem de menor ingestão, intolerâncias alimentares, redução da acidez gástrica e do fator intrínseco e **má absorção** — esta predominante nas técnicas disabsortivas (derivação gástrica em Y de Roux e, sobretudo, derivação biliopancreática). A gastrectomia vertical é predominantemente restritiva, mas também exige reposição, com destaque para a **B12**. A não adesão é a principal causa de complicação nutricional tardia.

## Preparo pré-operatório

Meta de **perda de 10% do peso** antes do procedimento, com déficit de **500–1.000 kcal/dia**. A carência nutricional pode preceder a cirurgia — cálcio, vitamina D, ferro e B12 — e deve ser corrigida antes dela.

## Desnutrição proteico-energética

Complicação do **pós-operatório tardio**, decorrente de restrição proteica e intolerância à carne vermelha. Manifesta-se por diarreia ou esteatorreia, vômitos, perda ponderal, redução de massa magra e **edema por hipoalbuminemia (padrão kwashiorkor)**. Tratamento: suplementação de **60–75 g/dia de proteína**.

## Massa óssea

O **risco de fratura osteoporótica aumenta 2–5 anos após a cirurgia**, com predomínio no bypass e na derivação biliopancreática. Há elevação **precoce dos marcadores de reabsorção (CTX)**, com aumento proporcionalmente menor dos de formação, e deterioração das arquiteturas trabecular e cortical. ⚠️ **A densidade mineral óssea continua a diminuir com o tempo, mesmo após o platô da perda de peso** — a estabilização do peso não encerra a perda óssea. A fisiopatologia combina fatores nutricionais e mecânicos.

- **A DEXA pode subestimar o risco de fratura na obesidade.** Realizar antes da cirurgia e **2 anos após** o procedimento.
- **Cálcio elementar 1.200–1.500 mg/dia** na gastrectomia vertical e no bypass; **1.800–2.400 mg/dia** na derivação biliopancreática. Preferir **citrato de cálcio** e **não ofertar mais de 1 g por tomada**. Calciúria de 24 h em casos selecionados, com meta de **2–4 mg/kg/dia**.
- **Vitamina D** com meta sérica de **30–60 ng/mL**, em dose de **3.000 UI/dia** (2.000–4.000 UI/dia ou 50.000 UI/semana conforme o déficit).
- Quando indicado antirreabsortivo, **preferir a via parenteral** — a absorção oral é imprevisível após o procedimento.

## Ferro

**Metabolismo.** O ferro heme provém da hemoglobina (60%) e da mioglobina (15%); o não heme, de leguminosas e vegetais folhosos. A absorção ocorre no **duodeno e no jejuno proximal**, e o armazenamento no fígado, baço e medula óssea. A **hepcidina** regula o sistema reduzindo o ferro circulante — e **a obesidade estimula sua síntese**, inibindo a liberação de ferro no plasma já antes da cirurgia.

**Deficiência.** Prevalência de até **60%** no pós-operatório. Causas: sangramento, redução da ingestão, desabsorção duodenal, queda do ácido clorídrico e competição com suplementos de cálcio. Interferem na absorção **café, chá verde e cálcio**.

**Grupos de maior risco:** mulheres em idade fértil, gestantes e adolescentes, IMC pré-operatório **≥ 50 kg/m²**, deficiência concomitante de B12, procedimentos disabsortivos e deficiência de ferro já presente no pré-operatório.

| Estádio | Ferritina |
| --- | --- |
| Sem deficiência | ≥ 50 ng/mL |
| Leve | 30–49 ng/mL |
| Moderada | 10–29 ng/mL |
| Grave | < 10 ng/mL |

**Tratamento.** Reposição oral com **200 mg de ferro elementar**; a via **intravenosa é mais eficaz** e preferida nas deficiências moderada e grave. Critério de eficácia: elevação dos **reticulócitos ao fim da primeira semana**, ou aumento de **1 g/dL na hemoglobina e 3% no hematócrito em 1–2 meses**.

## Vitamina B12

**Metabolismo.** Liga-se à **haptocorrina** salivar, transfere-se ao **fator intrínseco** produzido pelas células parietais e é absorvida no **íleo terminal**; circula ligada às transcobalaminas, acumula-se no fígado e sofre **ciclo êntero-hepático**.

**Deficiência.** Prevalência de **33% no bypass** e **20% na gastrectomia vertical**, por redução do fator intrínseco, elevação do pH gástrico, desabsorção ileal e menor ingestão. Além do paciente bariátrico, são de risco vegetarianos e veganos, idosos a partir de 60 anos, gestantes, usuários de inibidores de acidez e de metformina, portadores de doença inflamatória intestinal ou celíaca e imunossuprimidos.

**Quadro clínico:** anemia megaloblástica, fraqueza, glossite e parestesias.

**Diagnóstico:** **< 300 pg/mL indica insuficiência** e **< 200 pg/mL, deficiência**. ⚠️ O **ácido metilmalônico (MMA)** é marcador mais sensível que a B12 sérica e detecta a carência **já nos dois primeiros meses** de pós-operatório.

**Tratamento:** **1.000 µg a cada 7 dias por 4 semanas**, seguidos de manutenção mensal intramuscular. Suplementação de manutenção: 1.000 µg/dia por via oral ou 1.000 µg IM mensais.

## Deficiências por técnica cirúrgica

| Técnica | Deficiências esperadas |
| --- | --- |
| Gastrectomia vertical | B12, cálcio, ferro, zinco |
| Derivação gástrica em Y de Roux | Vitamina D, B12, folato, cálcio, ferro, zinco e cobre |
| Derivação biliopancreática | Proteínas, vitaminas lipossolúveis (A, D, E, K), B1, B12, folato, cálcio, magnésio, ferro, zinco e cobre |

## Micronutrientes: prevalência e reposição

| Nutriente | Prevalência | Manifestação | Suplementação |
| --- | --- | --- | --- |
| Vitamina A | 8–11% (BGYR); > 70% (DBP) | Mancha de Bitot, xerose, cegueira noturna | 5.000–10.000 UI/dia; 10.000 UI/dia na DBP |
| Vitamina D | 25–80% | Hipocalcemia, tetania, doença óssea metabólica | 2.000–4.000 UI/dia ou 50.000 UI/semana |
| Vitamina E | Incomum | Desordem neuromuscular, hemólise | 15 mg (100–400 UI) |
| Vitamina K | Incomum | Coagulopatia | 90–120 µg; 300 µg/dia na DBP |
| Tiamina (B1) | 1–49% | Beribéri; **Wernicke-Korsakoff** | > 12 mg/dia; deficiência: 100 mg VO por 7 dias ou IV |
| Folato (B9) | 18% (GV); 65% (BGYR) | Anemia megaloblástica, defeito de tubo neural | 400–1.000 µg/dia, sem exceder 1 mg/dia |
| Cobalamina (B12) | 20% (GV); 33% (BGYR) | Anemia megaloblástica, neuropatia | 1.000 µg/dia VO ou 1.000 µg IM mensais |
| Ferro | 18% (GV); 20–55% (BGYR); 13–52% (DBP) | Anemia, pica | 45–60 mg/dia de ferro elementar; meta de ferritina > 50 |
| Zinco | 20% (GV); 40% (BGYR); 70% (DBP) | Atraso de crescimento e da maturação sexual, imunodeficiência | 10–15 mg (GV); 15–20 mg (BGYR e DBP) |
| Cobre | 20% (GV); 90% (BGYR) | Anemia, neutropenia, ataxia | 1 mg (GV); 2 mg (BGYR e DBP) |
| Selênio | 20% (BGYR e DBP) | Miopatia, **cardiomiopatia**, macrocitose | > 100 µg/dia; 2 µg/kg/dia se cardiomiopatia |
| Cálcio | 2–10% | Doença óssea, hiperparatireoidismo secundário | 1.200–1.500 mg/dia; 1.800–2.400 mg/dia na DBP |

⚠️ **Manter a proporção de 10 mg de zinco para 1 mg de cobre.** A reposição isolada de zinco induz deficiência de cobre, com anemia e mieloneuropatia.

## Situações especiais e monitorização

- **Tiamina antes de glicose** sempre que houver vômito persistente ou perda muito rápida, sob risco de encefalopatia de Wernicke. A solução de reposição intravenosa **não deve conter glicose** quando há suspeita.
- **Nefrolitíase** por hiperoxalúria entérica, mais frequente nas disabsortivas: hidratação e cálcio às refeições. **Colelitíase** na perda rápida, com profilaxia por ácido ursodesoxicólico.
- **Hipoglicemia hiperinsulinêmica tardia** (dumping tardio): fracionamento das refeições e restrição de carboidratos simples.
- **Gestação:** evitar por cerca de 18 meses e reforçar suplementação e monitorização.
- **Laboratório aos 3, 6 e 12 meses e depois anualmente:** hemograma, ferro e ferritina, B12, folato, 25-OH-vitamina D, cálcio, PTH, zinco, cobre, albumina e, nas disabsortivas, vitaminas A e E e tempo de protrombina.

## Armadilhas de prova

- **O risco de fratura aumenta — não diminui — 2 a 5 anos após a cirurgia**, e a densidade mineral óssea **continua caindo mesmo depois do platô de perda de peso**.
- **Não ofertar mais de 1 g de cálcio por tomada**, e usar citrato em vez de carbonato, cuja absorção depende de acidez gástrica.
- **A meta de vitamina D é 30–60 ng/mL**, e não os 20 ng/mL aceitos na população geral. No tratamento da osteoporose pós-bariátrica, o antirreabsortivo deve ser **parenteral**.
- **O ferro é absorvido no duodeno e no jejuno proximal** — exatamente o segmento excluído pelo bypass. Não é absorvido no íleo terminal, onde se absorve a B12.
- **A redução da acidez gástrica prejudica** a conversão do ferro férrico em ferroso; não a facilita.
- **O MMA sobe antes da B12 sérica cair** e detecta a deficiência já nos primeiros dois meses de pós-operatório.`;

const pts = [
  'A suplementação e a monitorização após a bariátrica são vitalícias; a não adesão é a principal causa de complicação nutricional tardia.',
  'Meta pré-operatória de perda de 10% do peso, com déficit de 500–1.000 kcal/dia.',
  'Desnutrição proteico-energética é complicação tardia e se trata com 60–75 g/dia de proteína; o edema decorre de hipoalbuminemia.',
  'O risco de fratura aumenta 2–5 anos após a cirurgia e a densidade mineral óssea continua a cair mesmo após o platô de perda de peso.',
  'Cálcio 1.200–1.500 mg/dia em citrato, sem exceder 1 g por tomada; vitamina D com meta de 30–60 ng/mL em 3.000 UI/dia.',
  'Densitometria antes da cirurgia e 2 anos após; quando indicado antirreabsortivo, preferir a via parenteral.',
  'O ferro é absorvido no duodeno e jejuno proximal, segmento excluído pelo bypass; a obesidade eleva a hepcidina e reduz o ferro circulante.',
  'Estadiamento por ferritina: sem deficiência ≥ 50, leve 30–49, moderada 10–29 e grave < 10 ng/mL; a via IV é preferida nas formas moderada e grave.',
  'B12 abaixo de 300 pg/mL indica insuficiência e abaixo de 200 pg/mL, deficiência; o ácido metilmalônico é marcador mais sensível e precoce.',
  'Manter a proporção de 10 mg de zinco para 1 mg de cobre — a reposição isolada de zinco induz deficiência de cobre.',
];

const patch = JSON.stringify({
  resumo: resumo, pts: pts,
  fonte: 'Síntese Endodirect · EndoTEEM 2026 (aula 12) + ASMBS 2016 (micronutrientes)',
});
if (patch.includes('$j$')) throw new Error('delimitador colide com o conteúdo');

const q = (s) => "'" + s.replace(/'/g, "''") + "'";
fs.writeFileSync(path.join(__dirname, 'obesidade-12.sql'),
`update endodirect_global_state g
set payload = jsonb_set(g.payload, '{diretrizes}', (
  select jsonb_agg(
    case when d->>'tema' = ${q(TEMA)} and d->>'sub' = ${q(SUB)}
         then d || $j$${patch}$j$::jsonb
         else d end
    order by ord)
  from jsonb_array_elements(g.payload->'diretrizes') with ordinality t(d, ord)
))
where g.payload ? 'diretrizes';`);

console.log('resumo: %d caracteres (antes: 3.148)', resumo.length);
const obrig = ['10% do peso', '60–75 g/dia', '2–5 anos', 'CTX', '1.200–1.500', '1.800–2.400',
  '30–60 ng/mL', '3.000 UI/dia', '2–4 mg/kg/dia', 'hepcidina', '≥ 50 ng/mL', '< 10 ng/mL',
  '200 mg de ferro elementar', '< 300 pg/mL', '< 200 pg/mL', 'metilmalônico', '10 mg de zinco para 1 mg de cobre',
  'íleo terminal', 'parenteral'];
const falta = obrig.filter((n) => !resumo.includes(n));
if (falta.length) { console.error('⚠️ ausentes: ' + falta.join(' | ')); process.exit(1); }
console.log('✓ %d dados-chave da aula presentes', obrig.length);
