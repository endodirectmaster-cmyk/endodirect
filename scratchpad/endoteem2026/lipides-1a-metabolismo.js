// Capítulo "Metabolismo Lipídico e Lipoproteínas" atualizado pela aula Lípides 1a do
// EndoTEEM 2026 ("Metabolismo e Dosagem do perfil", 36 slides, design DAGnvm9Raso).
//
// O capítulo já era forte em vias metabólicas, Lp(a) e ApoB. O buraco era a metade
// da aula que trata de DOSAGEM: quando pedir o perfil (incluindo a pediatria), jejum
// × sem jejum pela SBPC/ML e a classificação das dislipidemias. Isso entra inteiro.
// Também entram os números da Lp(a) que a aula quantifica e que o capítulo trazia
// só de forma qualitativa.
//
// ⚠️ UMA DIVERGÊNCIA MANTIDA À VISTA: o capítulo dizia que os iPCSK9 reduzem a Lp(a)
// em ~20–25%; a aula diz 30%. Registrei a faixa "20–30%" em vez de escolher um lado,
// porque as duas cifras circulam na literatura e nenhuma das fontes está errada.
const fs = require('fs');
const path = require('path');

const TEMA = 'Metabolismo Lipídico e Lipoproteínas';
const SUB = 'Lípides';

const atual = fs.readFileSync(path.join(__dirname, 'lipides-1a-atual.md'), 'utf8');

// ── 1. Blocos NOVOS, inseridos antes da seção de Lp(a) ──
const dosagem = `## Quando solicitar o perfil lipídico

| Faixa etária | Conduta |
| --- | --- |
| < 2 anos | Sem indicação |
| 2–8 e 12–16 anos | **Rastreamento seletivo** por fator de risco |
| 9–11 e 17–21 anos | **Triagem universal** |

Fatores que indicam o rastreamento seletivo: história familiar de hipercolesterolemia ou de doença arterial coronariana precoce, sobrepeso ou obesidade, diabetes, hipertensão e tabagismo.

## Jejum: quando é realmente necessário

**Apenas os triglicerídeos se alteram no estado pós-prandial.** A coleta sem jejum reflete melhor o risco cardiovascular, é mais conveniente em portadores de diabetes, gestantes, crianças e idosos, e reduz o congestionamento dos laboratórios.

| Sem jejum | Com jejum |
| --- | --- |
| Avaliação inicial do perfil lipídico | Triglicerídeos sem jejum **> 440 mg/dL** |
| Avaliação de risco cardiovascular | Pancreatite por hipertrigliceridemia |
| Internação por síndrome coronariana aguda | Uso de medicações que cursam com hipertrigliceridemia |
| Diabetes, crianças e idosos | Associação a exames que exigem jejum |
| Preferência do paciente | |

*Consenso EAS/EFLM e recomendações da SBPC/ML (2017).*

## Classificação das dislipidemias

**Por tipo**
- **Hipercolesterolemia isolada:** LDL > 160 mg/dL.
- **Hipertrigliceridemia isolada:** TG > 150 mg/dL em jejum, ou **> 175 mg/dL sem jejum**.
- **Hiperlipidemia mista:** LDL > 160 mg/dL **e** TG > 150 mg/dL.

**Por etiologia:** primárias e secundárias.

**Por gravidade da hipertrigliceridemia**

| Grau | Triglicerídeos |
| --- | --- |
| Moderada | 150–499 mg/dL |
| Grave | 500–1.000 mg/dL |
| Muito grave | > 1.000 mg/dL |

*Posicionamento Brasileiro sobre Síndrome da Quilomicronemia Familiar, 2023.*

`;

// ── 2. Enriquecimento da Lp(a) — epidemiologia e risco quantificado ──
const lpaEpi = `**Prevalência.** É a **alteração lipídica monogênica mais prevalente do mundo**, atingindo cerca de **1,4 bilhão de pessoas**. Até **25% da população global** tem Lp(a) acima de **50 mg/dL**, com níveis mais elevados em populações africanas e concentrações **5–10% maiores em mulheres**. A depuração é predominantemente hepática.

**Magnitude do risco.** A associação é independente e causal: **infarto 2 vezes maior** com Lp(a) ≥ 47 mg/dL; **AVC 16% maior** com Lp(a) ≥ 70 mg/dL; **estenose aórtica calcificada 3 vezes maior** com Lp(a) > 90 mg/dL. Soma-se ainda insuficiência cardíaca e aumento da mortalidade geral e cardiovascular.

**Estabilidade.** Os níveis são estáveis ao longo da vida — as exceções são a transição menopausal, a gestação, o uso de contraceptivo oral e a alteração da função renal.

`;

// ── 3. Substituições cirúrgicas ──
let resumo = atual;

const iLpa = resumo.indexOf('## Lipoproteína(a) — Lp(a)');
if (iLpa < 0) throw new Error('âncora da Lp(a) não encontrada');
resumo = resumo.slice(0, iLpa) + dosagem + resumo.slice(iLpa);

// insere o bloco de epidemiologia logo após o parágrafo "O que é"
const ancGen = '**Genética.** O nível plasmático';
if (!resumo.includes(ancGen)) throw new Error('âncora da genética da Lp(a) não encontrada');
resumo = resumo.replace(ancGen, lpaEpi + ancGen);

// estatinas: o capítulo dizia "podem elevá-la discretamente"; a aula quantifica
const antesEst = '**Estatinas não a reduzem** (podem elevá-la discretamente)';
if (!resumo.includes(antesEst)) throw new Error('âncora das estatinas não encontrada');
resumo = resumo.replace(antesEst, '**Estatinas não a reduzem — podem elevá-la em 8,5% a 24%**');

// iPCSK9: registra a faixa em vez de escolher entre 20–25% (capítulo) e 30% (aula)
const antesPcsk = '**inibidores de PCSK9** reduzem ~20–25%';
if (!resumo.includes(antesPcsk)) throw new Error('âncora do iPCSK9 não encontrada');
resumo = resumo.replace(antesPcsk, '**inibidores de PCSK9** reduzem cerca de **20–30%**, por mecanismo não esclarecido e com benefício clínico ainda incerto');

// ApoB: acrescenta o corte de risco da aula
const antesApo = 'É especialmente útil em **TG alto, diabetes e síndrome metabólica**.';
if (!resumo.includes(antesApo)) throw new Error('âncora do uso da apoB não encontrada');
resumo = resumo.replace(antesApo, 'É especialmente útil em **TG alto, diabetes e síndrome metabólica**. Como marcador de risco, **apoB > 130 mg/dL caracteriza alto risco cardiovascular**.');

const pts = [
  'Da menos à mais densa: quilomícron, VLDL, IDL, LDL e HDL; toda partícula com apoB é aterogênica.',
  'Perfil lipídico na pediatria: sem indicação abaixo de 2 anos, rastreamento seletivo aos 2–8 e 12–16 anos e triagem universal aos 9–11 e 17–21 anos.',
  'Apenas os triglicerídeos se alteram no pós-prandial — a coleta sem jejum é a regra e reflete melhor o risco cardiovascular.',
  'Exige jejum: triglicerídeos sem jejum acima de 440 mg/dL, pancreatite por hipertrigliceridemia e uso de fármacos que elevam triglicerídeos.',
  'Hipertrigliceridemia isolada: TG acima de 150 mg/dL em jejum ou de 175 mg/dL sem jejum; a gravidade é moderada, grave ou muito grave acima de 1.000 mg/dL.',
  'A Lp(a) é a alteração lipídica monogênica mais prevalente do mundo, com cerca de 1,4 bilhão de pessoas acometidas e determinação genética de aproximadamente 90%.',
  'Lp(a): infarto 2 vezes maior acima de 47 mg/dL, AVC 16% maior acima de 70 mg/dL e estenose aórtica calcificada 3 vezes maior acima de 90 mg/dL.',
  'Não há tratamento específico para a Lp(a): as estatinas podem elevá-la em 8,5% a 24% e os inibidores de PCSK9 a reduzem em 20–30%, com benefício clínico incerto.',
  'A apoB conta as partículas aterogênicas e supera o LDL-c quando os triglicerídeos estão altos; acima de 130 mg/dL indica alto risco.',
  'O LDL calculado por Friedewald perde acurácia com triglicerídeos acima de 400 mg/dL — usar não-HDL ou apoB nesse cenário.',
];

const patch = JSON.stringify({
  resumo: resumo, pts: pts,
  fonte: 'Síntese Endodirect · EndoTEEM 2026 (Lípides 1a) + SBPC/ML 2017 / EAS-EFLM / SBC',
});
if (patch.includes('$j$')) throw new Error('delimitador colide com o conteúdo');

const q = (s) => "'" + s.replace(/'/g, "''") + "'";
fs.writeFileSync(path.join(__dirname, 'lipides-1a.sql'),
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

console.log('resumo: %d → %d caracteres', atual.length, resumo.length);
const novos = ['Triagem universal', '> 440 mg/dL', '> 175 mg/dL sem jejum', '500–1.000 mg/dL',
  '1,4 bilhão', '≥ 47 mg/dL', '≥ 70 mg/dL', '> 90 mg/dL', '8,5% a 24%', '20–30%', '> 130 mg/dL'];
const mantidos = ['## Três vias', 'PCSK9', 'Friedewald', '## 📊 Principais lipoproteínas',
  'kringle', 'pelacarsen', '## 📊 LDL-c × não-HDL-c × apoB', 'apoB < 80 mg/dL'];
const f1 = novos.filter((n) => !resumo.includes(n));
const f2 = mantidos.filter((n) => !resumo.includes(n));
if (f1.length) { console.error('⚠️ novos ausentes: ' + f1.join(' | ')); process.exit(1); }
if (f2.length) { console.error('⚠️ conteúdo PERDIDO: ' + f2.join(' | ')); process.exit(1); }
console.log('✓ %d dados novos entraram; %d âncoras antigas preservadas', novos.length, mantidos.length);
