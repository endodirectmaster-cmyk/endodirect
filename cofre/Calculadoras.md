---
tags: [cofre, calculadoras]
atualizado: 2026-06-22
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
