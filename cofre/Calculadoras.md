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
Entrada `id:'sophia'`. O professor mandou o artigo e o **apêndice**, e isso muda o que era possível: o apêndice (Appendix Figure 3) **publica as árvores CART** de M12, M24 e M60. Deixa de ser "modelo treinado inacessível" e passa a ser transcrição — que é legítima e verificável.

**Fonte:** Saux et al., Lancet Digit Health 2023;5:e692-702. Sete variáveis pré-operatórias por LASSO; uma árvore CART por tempo pós-operatório; %TWL na folha; peso previsto = peso pré × (1 − %TWL).

### O que foi implementado: M24 e M60, e só
- **M24** (Figura 3C, raiz n=755): 7 folhas, de 0,16 (banda) a 0,38 (bypass, sem diabetes, <49 anos).
- **M60** (Figura 3D, raiz n=578): 8 folhas. **É a única em que banda e sleeve caem no MESMO ramo**, e a única em que a **altura** entra (corte em 161 cm).
- **O que provou a leitura antes de qualquer código:** os `n` das folhas de cada figura **somam exatamente o n da raiz** — 146+42+80+140+71+68+208 = 755 e 72+36+81+104+78+46+42+119 = 578. Estrutura lida errada não fecha.
- **Conferência contra a ferramenta oficial**, no caso que o professor rodou (120 kg, 170 cm, 30 anos, sem diabetes, bypass): M24 = 0,38 → **74,4 kg**, M60 = 0,33 → **80,4 kg**. O gráfico oficial mostra nadir em ~74 kg e ~80 kg aos 5 anos. Bate nos dois pontos.
- **A tela mostra o caminho percorrido na árvore.** O modelo é interpretável de propósito; expor o caminho é o que permite ao professor auditar a previsão em vez de acreditar nela.

### ⚠️ M1, M3 e M12 ficaram FORA, e o motivo é diferente em cada caso
- **M1 e M3 não foram publicados.** O diagrama do pipeline (Figura 3A) mostra cinco árvores; a figura publica três. Sem elas não há a parte inicial da curva — por isso a calculadora entrega **dois pontos, não uma curva**.
- **M12 tem um ramo ambíguo.** No nó (bypass, <51 anos, não fumante, n=344) o corte é "duração do DM2 ≷ 19 anos", e a figura **não diz para onde vai quem NÃO tem diabetes**. As duas leituras dão 0,30 e 0,34 de %TWL — **5 kg num paciente de 120 kg**.
  - **Argumento para 0,34:** os tamanhos dos grupos. n=215 no lado ">19 anos" só fecha se os não diabéticos estiverem nele (duração ausente, roteada por variável substituta — o artigo diz que a árvore usa surrogates). E a prosa do artigo diz que diabetes está **sempre** associado a menor perda, o que combina com diabéticos em 0,30.
  - **Argumento para 0,30:** a curva da ferramenta oficial no caso de referência passa mais perto de 84 kg (0,30) do que de 79,2 kg (0,34) no 12º mês.
  - **Não resolvi, e por isso não publiquei.** Resolve-se com uma comparação na ferramenta oficial: mesmo paciente, uma vez sem diabetes e uma vez com DM2 de 5 anos, lendo o 12º mês. Se o sem-diabetes perder MAIS, a leitura 0,34 está certa.
- `scripts/test-calc-sophia.js` (passo 12 do CI) **barra a volta dos três**: reprova se aparecer `sophiaM12` ou se a tela mencionar 12 meses. Sabotar o lado de um ramo derruba 6 asserções.

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
