---
tags: [cofre, calculadoras]
atualizado: 2026-07-29
---

# Calculadoras

Painel **Calculadoras Clínicas**. Array `CALCS` em `index.html` (~linha 1707). Cada item:
```
{id, name, area, desc, fields:[{id,label,type:'num'|'select',opts,vals}], calc(v)->scalar, interp(s,v)->{t,c}, unit, note}
```
Renderização em `openCalc`/`calcUpdate`. Itens `external:true` apenas linkam para a ferramenta oficial (ex.: FRAX) — padrão de "não reproduzir cálculo proprietário".

## Calculadoras adicionadas (2026-06-10, #170)

### TmP/GFR (limiar renal de fosfato) — Osteometabolismo
- Fórmula de **Payne (1998)**. Calcula TRP = 1 − (P_urin × Cr_sérica)/(P_sérico × Cr_urin); se TRP ≤ 0,86 → TmP/GFR = TRP × P_sérico; senão → [0,3·TRP/(1−0,8·TRP)] × P_sérico.
- Ref. adulto ~2,5–4,2 mg/dL. Útil em hipofosfatemias por perda renal (XLH, TIO/FGF23, Fanconi, hiperPTH).
- Complementa a calculadora **TRP** que já existia.

### Escore-z de estatura/idade — Crescimento
- Método **LMS**: `z = ((x/M)^L − 1)/(L·S)` (ou `ln(x/M)/S` se L≈0). Percentil via CDF normal.
- Bases: **OMS** (WHO 2006 0–5a + WHO 2007 5–19a) e **CDC 2000** (2–20a), por sexo. OMS é o padrão (recomendado no Brasil).
- Dados em **`growth-lms.js`** (raiz do repo), gerado das fontes oficiais. Estrutura: `window.GROWTH_LMS.<cdc|who>.<M|F> = [[idadeMeses, L, M, S], ...]`. Helpers em `index.html`: `_gLMSrow` (interpolação linear), `growthZ`, `zToPct`, `fmtPct`.
- Classifica baixa estatura (z<−2 ≈ P3) e grave (z<−3).

## %PEP e %PPT pós-bariátrica (2026-07-29)
Pedido do Rodolpho a partir da calculadora de Fernanda Mattos. Entrada `id:'pep'` em `CALCS`, área **Antropometria**: peso no dia da cirurgia, altura, peso atual.

- **%PEP = (peso da cirurgia − peso atual) ÷ (peso da cirurgia − peso de IMC 25) × 100.** O denominador é o **excesso sobre o teto da eutrofia** — convenção da literatura bariátrica, e é por isso que o valor **passa de 100%** quando o IMC cai abaixo de 25. Não é bug; é a natureza da métrica.
- **⚠️ O denominador do %PEP é ESCOLHA, não medida.** Trocar IMC 25 por IMC 22 muda o resultado sem mudar o paciente. Por isso o teste confere valores **à mão** (120→96 kg em 1,70 m = 50,3%; chegar a 72,25 kg = exatamente 100%) e a sabotagem do denominador derruba 6 asserções.
- **%PPT sai junto**, na linha de interpretação, com IMC atual e o peso de IMC 25. Os dois juntos de propósito: o %PEP é o número que o operado acompanha, mas infla em quem operou com IMC mais baixo; o %PPT não tem esse arbítrio e é o que as sociedades passaram a preferir. Mostrar só um gera a conversa errada no consultório.
- **Quem operou já abaixo de IMC 25 não tem excesso de peso:** `calc` devolve `NaN` e a interpretação explica, oferecendo o %PPT. Sem essa guarda a divisão daria negativo ou infinito com cara de resultado.
- **Leitura:** <50% do excesso após 12–18 meses é o limiar clássico de resposta insuficiente — que pede investigação (adesão, complicação anatômica, medicação que favorece ganho de peso) antes de rotular o paciente.
- Valores esperados na `note`, com as fontes que a página original cita (Brolin 1989 → Zilberstein 2019).
- Teste `scripts/test-calc-pep.js`, passo 11 do CI. `sw` v155→v156.

## SOPHIA — trajetória de peso pós-bariátrica (2026-07-29)
Entrada `id:'sophia'`. O professor mandou o artigo **e o apêndice**, e isso mudou o que era possível: o apêndice (Appendix Figure 3) **publica as árvores CART** de M12, M24 e M60. Deixou de ser "modelo treinado inacessível" e passou a ser transcrição — legítima e verificável.

**Fonte:** Saux et al., Lancet Digit Health 2023;5:e692-702. Sete variáveis pré-operatórias por LASSO; uma árvore CART por tempo pós-operatório; %TWL na folha; peso previsto = peso pré × (1 − %TWL).

### As três árvores, e o que cada uma usa
- **M12** (Figura 3B, raiz n=948): 7 folhas. **É a única em que TABAGISMO entra** — e a favor: fumante perde mais no primeiro ano (0,36), efeito que o artigo descreve e que desaparece depois.
- **M24** (Figura 3C, raiz n=755): 7 folhas, de 0,16 (banda) a 0,38 (bypass, sem diabetes, <49 anos).
- **M60** (Figura 3D, raiz n=578): 8 folhas. **A única em que banda e sleeve caem no MESMO ramo**, e a única em que a **altura** entra (corte em 161 cm).

### ⚠️ Como a leitura das figuras foi validada — duas travas, e uma que valeu mais
1. **Os `n` das folhas somam o `n` da raiz** em cada figura: 948, 755 e 578. Estrutura lida errada não fecha essa conta. Foi o que autorizou escrever o código.
2. **A tabela de valores da ferramenta oficial.** O professor rodou dois pacientes (120 kg, 170 cm, 30 anos, não fumantes, bypass) e mandou os números **exatos**, não leitura de gráfico:

| | M12 | M24 | M60 |
|---|---|---|---|
| sem diabetes | 84 kg / 30% | 75 kg / 38% | 80 kg / 33% |
| DM2 de 5 anos | 84 kg / 30% | 87 kg / 27% | 91 kg / 24% |

As três árvores reproduzem os **seis** valores.

### ⚠️ Foi a medição que resolveu o nó ambíguo de M12 — e desmentiu o texto do artigo
No nó (bypass, <51 anos, não fumante, n=344) o corte é "duração do DM2 ≷ 19 anos", e a figura **não diz para onde vai quem NÃO tem diabetes**. As duas leituras davam 0,30 e 0,34 — **5 kg num paciente de 120 kg**.

Eu tinha um argumento forte para 0,34: os tamanhos dos grupos (n=215 no lado ">19 anos" só fecharia com os não diabéticos nele, roteados por variável substituta) **e a prosa do artigo**, que afirma que diabetes está *sempre* associado a menor perda. **Estava errado.** Os dois pacientes dão 30% em M12, então o não diabético (duração 0) cai no mesmo ramo do diabético de curta duração, e a folha de 0,34 é só de quem tem mais de 19 anos de doença. **Neste nó, a prosa do artigo não vale.**

Lição além deste caso: quando existe uma implementação de referência acessível, **duas consultas a ela valem mais que qualquer dedução a partir do texto** — inclusive a partir de argumentos que parecem fechar.

### O que continua fora: M1 e M3
Não foram publicados (o pipeline tem cinco árvores, a figura traz três), então a **queda inicial não é reproduzida** e a calculadora entrega três pontos, não uma curva. A tabela oficial mostra 9% e 16% naqueles dois pacientes, mas **dois pontos não são um modelo**: fixá-los valeria para sleeve, banda, outras idades e outros pesos sem base nenhuma. `scripts/test-calc-sophia.js` reprova se aparecer `sophiaM1`/`sophiaM3` ou se a tela mencionar 1 ou 3 meses.

### Detalhes de implementação
- A tela mostra o **caminho percorrido na árvore**. O modelo é interpretável de propósito; expor o caminho é o que permite auditar a previsão em vez de acreditar nela.
- O IMC da tabela oficial (25,9 aos 2 anos) sai do peso **já arredondado** (75 kg); aqui sai do peso exato (74,4 kg → 25,7). Diferença de arredondamento da tela deles, não de modelo.
- `scripts/test-calc-sophia.js` (passo 12 do CI) confere as **22 folhas**, os três fechamentos de `n` e os seis valores oficiais. Trocar o lado de um ramo derruba 6 asserções. `sw` v157→v158.

## Gráfico e tabela de valores nas calculadoras (2026-07-29)
O framework de `CALCS` só renderizava **número + tag**. Ganhou um ponto de extensão: `extra:function(s,v){return html}`, anexado depois da caixa de resultado. Erro dentro do `extra` é engolido — o número, que é o principal, não pode cair por causa de um gráfico.

Primeiro uso: o SOPHIA, com gráfico SVG (gerado por código, como as fichas dos artigos) e tabela de peso/%PPT/IMC/%PEP em 1, 2 e 5 anos.

- **⚠️ O trecho 0→12 meses do gráfico é PONTILHADO.** As árvores de 1 e 3 meses não constam do artigo, então a forma da queda inicial é desconhecida. Reta cheia ali afirmaria perda linear no primeiro ano, o que é falso — a perda real é concentrada nos primeiros meses.
- **O %PEP da tabela usa a mesma definição da ferramenta oficial** (excesso sobre IMC 25): no 12º mês do caso de referência dá 75%, exatamente o que a tabela deles mostra. Confirmação a mais de que a definição é a mesma.
- Sem excesso de peso, o %PEP sai como travessão em vez de número.

## Calculadoras agrupadas por área (2026-07-29)
Pedido do professor. A lista corrida passou de 30 itens e virava varredura visual. Agora `initCalc` agrupa por `c.area`, com contagem por grupo.

- **A ordem dos grupos segue a PRIMEIRA aparição em `CALCS`, não alfabética.** A ordem do array já expressa prioridade (risco cardiovascular e antropometria primeiro), e ordenar por nome jogaria "Adrenal" para o topo sem motivo.
- **⚠️ `grid-column:1/-1` no título e na sub-grade.** O container é `.g3` (3 colunas); sem isso cada título ocuparia uma célula de um terço e a lista sairia intercalada com os cards.
- O card deixou de repetir a área — ela já é o título do grupo.

**Abas de área acima da lista (mesmo dia, segundo pedido).** Agrupar resolveu a leitura, mas com 30 itens ainda era preciso rolar até o grupo. Agora há uma faixa de `pill-tab` — "Todas" + uma por área, com contagem — que filtra o grid.
- **⚠️ Trocar de aba NÃO fecha a calculadora aberta.** `renderCalcGrid` só mexe no grid e nunca toca `activeCalc`; fechar apagaria o resultado que a pessoa está lendo. O teste verifica isso lendo o corpo da função.
- Com uma área filtrada, o título do grupo é omitido — repetiria a aba selecionada.
- Área que deixe de existir em `CALCS` cai de volta em "Todas" em vez de mostrar lista vazia.

## Gráfico do SOPHIA: o que estava errado (2026-07-29)
Primeira versão saía **gigante**: `viewBox` de 320×200 com `width:100%;height:auto` numa tela larga vira um bloco de mais de mil pixels de altura, e as fontes de 8 unidades escalam junto — números enormes, gráfico ilegível.

- **`max-width:480px` e centralizado.** É o teto que faz o texto sair no tamanho pretendido.
- **Marcas do eixo do peso arredondadas para múltiplos de 5**, com o eixo terminando *em cima* das marcas. Antes saíam os extremos crus do intervalo (125 / 95 / 66), que ninguém lê.
- **Eixo do tempo por extenso** (pré-op · 1 ano · 2 anos · 5 anos) em vez de números de mês.
- **Faixa sombreada** sobre o trecho pré-op→1 ano, além do pontilhado, para o olho ver onde o modelo começa.
- **O rótulo do nadir (2 anos) vai ABAIXO do ponto**; acima colidiria com a linha que sobe para os 5 anos.

## Ajuste de framework
`calcUpdate` mostra **`—`** quando `calc()` retorna não-finito (entrada incompleta ou idade fora da faixa) em vez de `NaN`.
- **Campo `type:'date'`** (2026-06-15): o framework de calculadoras agora renderiza `<input type="date">` além de `num`/`select`. Helpers `ageMonthsFromDates(dobStr,domStr)` (idade em meses fracionários; `dom` vazio = hoje; mês médio 30,44 dias) e `ageLabelFromMonths(mo)`.
- **Escore-z de estatura/idade (`zha`)**: passou a receber **Data de nascimento + Data da medida** (em vez de idade em meses, que era pouco prático). A idade é calculada e exibida no resultado (ex.: "idade 8 anos"). Mesma matemática LMS/limites de faixa (OMS 0–228m, CDC 24–240m).

## Também no painel do professor (#277)
As mesmas calculadoras aparecem no admin (seção 🧮 Calculadoras, `admCalcHTML`/`data-asec="calc"`). Para conviver com o painel do aluno sem colisão de IDs, as funções de cálculo são **escopadas a um contêiner ativo** (`calcRoot` via `calcEl(sel)`): `initCalc(root)`/`openCalc`/`closeCalc`/`calcUpdate`. No `bindAdmSec`, `sec==='calc'` reseta `activeCalc` e chama `initCalc(main)`.

## Regenerar `growth-lms.js`
Fontes (hosts permitidos no sandbox: `raw.githubusercontent.com`): CDC `statage.csv` (mirror MITRE/GrowthViz), WHO 2006 (`growthfile_who.csv.gz` do GrowthViz), WHO 2007 (`erik1066/anthstat-statistics` → `src/WHO2007.data.cs`, dicionário `WHO2007_HeightAge`). Validar com z=0 na mediana.

## PREVENT (risco CV) — modelo base + aprimorado (UACR/HbA1c) (2026-06-22)
- `preventRisk(v)` (~linha 2007 do `index.html`) implementa as equações **AHA PREVENT** (Khan, Circulation 2024). **Modelo base** (sexo, idade, CT, HDL, PAS, TFGe, IMC, DM, tabagismo, anti-HTN, estatina) em `PREVENT_COEFS`; saída de 10a e 30a para DASCV, DCV total e IC.
- **Modelo aprimorado:** campos **opcionais** `pv_uacr` (RAC/UACR, mg/g) e `pv_hba1c` (HbA1c, %). Se preenchidos, usa as variantes oficiais **uacr / hba1c / full** em `PREVENT_AUG` — cada modelo é **reajustado** (TODOS os coeficientes mudam; não é só somar termos ao base). Sem zip/SDI no Brasil → **SDI tratado como ausente** (`missing_sdi=1`). Campos vazios → cai no **base** (saída idêntica à anterior). O resultado indica o modelo usado (`+UACR` / `+HbA1c` / `+UACR/HbA1c`).
- **Transforms** (iguais ao pacote `preventr`): `ln_uacr=ln(UACR)`; `hba1c_dm=(HbA1c−5,3)` se DM, senão `hba1c_no_dm`; centralizações idade 55 / não-HDL 3,5 mmol/L / HDL 1,3÷0,3 / PAS 130 / IMC 25 / eGFR 90 (colesterol mg/dL→mmol/L = ×0,02586).
- **Fonte dos coeficientes:** pacote R **`preventr`** (martingmayer), `R/sysdata.rda` lido com `pyreadr` — NÃO transcritos à mão. Tabelas `base/uacr/hba1c/full × 10yr/30yr`.
- **Validação:** referência Python (mesmas tabelas) + harness Node extraindo do `index.html` (24 casos aumentados, dif ≤1e-6; base = legado). **Âncora externa:** masculino, UACR 45 + HbA1c 6,9 → **31,3% DCV total**, igual à calculadora **oficial da AHA**.
- **LIÇÃO:** "PREVENT diferente da AHA" quase sempre é comparação desigual — conferir **sexo** e se o site da AHA usou **UACR/HbA1c/SDI** (full equations) antes de supor bug.
