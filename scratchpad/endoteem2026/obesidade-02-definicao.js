// Capítulo "Obesidade: Definição e Epidemiologia" atualizado pela aula 2 do
// EndoTEEM 2026 (12 slides, design DAGnvjtRyZI).
//
// A aula é curta e o capítulo já era bom: a atualização é CIRÚRGICA. Troco só a
// definição (que ganha metainflamação e lesão multissistêmica) e o bloco de
// epidemiologia, que estava com dados de 2019 e um Brasil "mais de 20%" vago.
// A aula traz World Obesity Atlas 2024/2025 e Vigitel 2023 com números exatos.
// Todo o resto — distribuição de gordura, IMC na criança, cintura, impacto da
// perda, classificação por resposta da ABESO e as três tabelas — fica intacto.
const fs = require('fs');
const path = require('path');

const TEMA = 'Obesidade: Definição e Epidemiologia';
const SUB = 'Obesidade';

// Blocos NOVOS (substituem os antigos).
const conceito = `## Conceito central

Obesidade é **doença crônica, progressiva e recidivante**, caracterizada por **acúmulo disfuncional de tecido adiposo**, **inflamação de baixo grau (metainflamação)** e **lesão multissistêmica**. Decorre de balanço energético positivo sustentado pela interação gene–ambiente. É formalmente reconhecida como doença (ABESO/OMS) — o que legitima o tratamento continuado — e está ligada a **13 tipos de câncer**. Não é falha de comportamento, mas condição de fisiopatologia complexa e forte componente neuro-hormonal.`;

const epidemio = `## Epidemiologia

**Mundo (World Obesity Atlas).** Em adultos, o excesso de peso atingia **2,2 bilhões de pessoas em 2020 (42% da população)**, com projeção de **2,9 bilhões em 2030 (54%)**. Entre os **jovens de 5 a 19 anos**, eram **430 milhões em 2020 (22%)**, com projeção de **770 milhões em 2035 (39%)** — o crescimento proporcional é maior na faixa jovem.

**Brasil (Vigitel 2023).**

| Indicador | Geral | Homens | Mulheres |
| --- | --- | --- | --- |
| Excesso de peso | **61,4%** | 63,4% | 59,6% |
| Obesidade | **24,3%** | 24,8% | 23,8% |

**Impacto econômico.** Projeção de **US$ 4,32 trilhões em 2035**, equivalentes a **3% do PIB global** — custos diretos com o tratamento das doenças relacionadas e indiretos com a queda de produtividade por absenteísmo.

**Distribuição da carga.** Os **países de renda média são os mais afetados**: concentravam **65% dos adultos com obesidade em 2020**, proporção projetada para **70% em 2035**, com a maior parte das mortes e doenças atribuíveis ocorrendo nessas regiões.

A relação **mortalidade × IMC** tem forma de **curva em U** — há excesso de risco tanto no baixo peso quanto na obesidade —, o que exige cautela ao interpretar o IMC isoladamente.`;

// Lê o capítulo atual do arquivo de apoio e substitui só os dois blocos.
const atual = fs.readFileSync(path.join(__dirname, 'obesidade-02-atual.md'), 'utf8');
const iConceito = atual.indexOf('## Conceito central');
const iEpi = atual.indexOf('## Epidemiologia');
const iDist = atual.indexOf('## Distribuição da gordura');
if (iConceito !== 0 || iEpi < 0 || iDist < 0) throw new Error('âncoras de seção não encontradas');

const resumo = conceito + '\n\n' + epidemio + '\n\n' + atual.slice(iDist);

const pts = [
  'Obesidade é doença crônica, progressiva e recidivante, com acúmulo disfuncional de tecido adiposo, metainflamação e lesão multissistêmica.',
  'Mundo: 2,2 bilhões de adultos com excesso de peso em 2020 (42%), com projeção de 2,9 bilhões em 2030 (54%).',
  'Jovens de 5 a 19 anos: 430 milhões em 2020 (22%), com projeção de 770 milhões em 2035 (39%).',
  'Brasil (Vigitel 2023): excesso de peso em 61,4% e obesidade em 24,3% dos adultos.',
  'O custo projetado é de US$ 4,32 trilhões em 2035, equivalentes a 3% do PIB global.',
  'Países de renda média concentravam 65% dos adultos com obesidade em 2020, com projeção de 70% em 2035.',
  'A relação entre mortalidade e IMC tem forma de curva em U, com excesso de risco também no baixo peso.',
  'A gordura central associa-se a risco cardiovascular e metabólico; a periférica parece protetora — por isso a cintura complementa o IMC.',
  'Perda acima de 5–7% melhora glicemia, pressão e perfil lipídico; acima de 10% reduz eventos cardiovasculares e promove remissão do DM2.',
  'A classificação da ABESO estadia pela resposta ao tratamento, não pelo IMC absoluto: reduzida 5–10% e controlada acima de 10% quando o IMC máximo era 30–40.',
];

const patch = JSON.stringify({
  resumo: resumo, pts: pts,
  fonte: 'Síntese Endodirect · EndoTEEM 2026 (aula 2) + World Obesity Atlas 2025 / Vigitel 2023 / ABESO',
});
if (patch.includes('$j$')) throw new Error('delimitador colide com o conteúdo');

const q = (s) => "'" + s.replace(/'/g, "''") + "'";
fs.writeFileSync(path.join(__dirname, 'obesidade-02.sql'),
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

console.log('resumo: %d caracteres (antes: %d)', resumo.length, atual.length);
const novos = ['metainflamação', '2,2 bilhões', '2,9 bilhões', '430 milhões', '770 milhões',
  '61,4%', '24,3%', '4,32 trilhões', '3% do PIB', '65% dos adultos', '70% em 2035'];
const preservados = ['## Distribuição da gordura', '## IMC (índice de Quetelet)', 'P97',
  '## Medidas complementares', '## Impacto da perda de peso', 'Classificação por resposta (ABESO)',
  'Obesidade grau III', 'IDF | ≥ 90 cm'];
const f1 = novos.filter((n) => !resumo.includes(n));
const f2 = preservados.filter((n) => !resumo.includes(n));
if (f1.length) { console.error('⚠️ dados novos ausentes: ' + f1.join(' | ')); process.exit(1); }
if (f2.length) { console.error('⚠️ conteúdo antigo PERDIDO: ' + f2.join(' | ')); process.exit(1); }
console.log('✓ %d dados novos da aula entraram; %d seções antigas preservadas', novos.length, preservados.length);
