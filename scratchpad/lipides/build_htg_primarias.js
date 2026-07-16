// Aprofunda SQF (quilomicronemia familiar) e disbetalipoproteinemia (tipo III)
// no capítulo Lípides/Hipertrigliceridemias Primárias. Síntese ORIGINAL de fatos.
const fs=require('fs');

const SEC=`

## Aprofundando — Síndrome de quilomicronemia familiar (SQF)
**Genética e mecanismo.** Doença **monogênica autossômica recessiva** (rara, ~1–2/milhão): perda de função **bialélica** da **LPL** (a mais comum) ou de seus parceiros — **apoC-II** (ativador da LPL), **GPIHBP1** (ancora a LPL no endotélio), **LMF1** (maturação da LPL) e **apoA-V**. Sem LPL funcionante, os **quilomícrons não são hidrolisados** → **quilomicronemia de jejum maciça**, com TG em geral **> 1000 (frequentemente > 2000) mg/dL desde a infância**.

**Clínica.** **Pancreatite aguda recorrente** (principal causa de morbimortalidade), **xantomas eruptivos**, **lipemia retinalis**, **hepatoesplenomegalia**, dor abdominal e, na criança, baixo ganho ponderal. **Curiosamente, não costuma cursar com aterosclerose precoce** — os quilomícrons são partículas grandes demais para penetrar na íntima —, ao contrário do tipo III.

**SQF × quilomicronemia multifatorial (MCS).** A **MCS** é **muito mais comum**: base **poligênica** somada a **fatores secundários** (diabetes, álcool, obesidade, estrogênio), com **LPL parcialmente funcionante** → início no **adulto** e **boa resposta** a fibrato/perda de peso. A **SQF** é monogênica, de **início na infância** e **responde pouco** aos fármacos habituais. Escores clínicos ajudam a separar as duas.

**Tratamento.** A base é **dieta muito pobre em gordura** (~10–15% das calorias, ~20 g/dia), com **TCM (triglicérides de cadeia média)** — absorvidos direto pela veia porta, sem formar quilomícron —, **abstinência de álcool e de açúcares simples** e reposição de **vitaminas lipossolúveis**. Fibratos, ômega-3 e estatina **têm pouco efeito** (agem via LPL). **Terapias-alvo:** **anti-apoC-III (volanesorsena; olezarsena)** e **anti-ANGPTL3 (evinacumabe)** reduzem TG por vias **independentes da LPL**. A **gestação** é de alto risco (o estrogênio eleva o TG) → dieta rígida ± **aférese**. Na crise: **jejum, hidratação, insulina em infusão (ativa a LPL) ± plasmaférese**.

## Aprofundando — Disbetalipoproteinemia (tipo III)
**Genética e "dois hits".** Também chamada **doença da remoção de remanescentes** ("broad beta disease"). Quase sempre exige o genótipo **apoE2/E2** — a isoforma **E2 liga-se mal ao receptor de LDL/LRP**. Mas **E2/E2 é comum (~1% da população) e só uma minoria adoece**: é preciso um **segundo fator** (obesidade, **diabetes**, **hipotireoidismo**, menopausa/deficiência de estrogênio, álcool, doença renal ou um segundo gene lipídico). Existem formas **dominantes raras** (ex.: apoE Leiden).

**Mecanismo e laboratório.** A apoE2 defeituosa **prejudica a captação hepática dos remanescentes** (de quilomícron e de VLDL/IDL, as "β-VLDL") → acúmulo de **remanescentes ricos em colesterol**, com **colesterol total e triglicérides elevados de forma aproximadamente proporcional** (p.ex., ambos ~300–500 mg/dL). **Pista-chave:** a **apoB é relativamente BAIXA** para o nível de colesterol (poucas partículas, porém ricas em colesterol) — discordância útil. Razões como **VLDL-colesterol/TG > 0,3** e a eletroforese (**banda beta larga**) reforçam; a **genotipagem de apoE (E2/E2)** confirma.

**Clínica.** **Xantomas palmares** (estrias amarelo-alaranjadas nas pregas das mãos — **quase patognomônicos**) e **xantomas tuberosos** (cotovelos/joelhos). **Aterosclerose precoce**, tipicamente **coronariana E periférica** (a doença arterial periférica é proeminente).

**Tratamento.** É das dislipidemias **mais tratáveis**: corrigir o **fator precipitante** (perder peso, controlar diabetes/hipotireoidismo, suspender álcool/estrogênio) e usar **estatina e/ou fibrato** — resposta em geral **excelente**, com normalização frequente do perfil.

## 📊 SQF (tipo I) × Disbetalipoproteinemia (tipo III)
| Aspecto | SQF (tipo I) | Disbetalipoproteinemia (tipo III) |
| --- | --- | --- |
| Defeito | LPL / apoC-II / GPIHBP1 (recessivo) | apoE2/E2 + fator precipitante |
| Lípides | TG muito alto (quilomícrons) | Colesterol e TG elevados (remanescentes) |
| ApoB | Alta (muitas partículas) | Baixa para o colesterol |
| Xantomas | Eruptivos | Palmares e tuberosos |
| Risco principal | Pancreatite | Aterosclerose precoce (coronária/DAP) |
| Resposta a fibrato | Pobre | Excelente |`;

const PTS=[
  'SQF (quilomicronemia familiar, tipo I) é monogênica recessiva (LPL/apoC-II/GPIHBP1/LMF1/apoA-V), com TG >1000 desde a infância, pancreatite recorrente e resposta pobre a fibrato.',
  'Diferenciar a SQF (monogênica, início na infância, não responde) da quilomicronemia multifatorial (poligênica + fatores secundários, adulto, responde a fibrato/dieta/perda de peso).',
  'Disbetalipoproteinemia (tipo III) = apoE2/E2 + fator precipitante → remanescentes com colesterol e TG proporcionalmente altos, apoB baixa, xantomas palmares e aterosclerose coronária e periférica; responde muito bem a fibrato ± estatina.'
];

const FCS=[
  {q:'Quais defeitos genéticos causam a síndrome de quilomicronemia familiar (SQF) e como ela difere da quilomicronemia multifatorial?',a:'A SQF é monogênica autossômica recessiva, por perda de função bialélica da LPL (ou de apoC-II, GPIHBP1, LMF1, apoA-V), com TG muito altos desde a infância e resposta pobre a fibratos; a quilomicronemia multifatorial é poligênica somada a fatores secundários (diabetes, álcool, obesidade), começa no adulto, tem LPL parcialmente funcionante e responde a fibrato, dieta e perda de peso.'},
  {q:'Por que a SQF cursa com pancreatite mas geralmente não com aterosclerose precoce, e qual a base do tratamento?',a:'Porque os quilomícrons acumulados são partículas grandes demais para penetrar na íntima (pouco aterogênicas), mas a quilomicronemia extrema desencadeia pancreatite; o tratamento é dieta muito pobre em gordura (~10–15% das calorias) com triglicérides de cadeia média, evitando álcool e açúcar, já que fibratos, ômega-3 e estatina agem via LPL e têm pouco efeito — restando as terapias anti-apoC-III (volanesorsena/olezarsena) e anti-ANGPTL3 (evinacumabe).'},
  {q:'Como se reconhece e trata a disbetalipoproteinemia (tipo III)?',a:'Suspeita-se quando colesterol total e triglicérides estão elevados de forma proporcional, com apoB relativamente baixa, xantomas palmares (quase patognomônicos) e tuberosos, e aterosclerose precoce coronariana e periférica; o genótipo apoE2/E2 associado a um fator precipitante (diabetes, hipotireoidismo, obesidade, estrogênio) confirma. É muito tratável: corrigir o fator precipitante e usar estatina e/ou fibrato, com resposta em geral excelente.'}
];

SEC.split('\n').filter(l=>l.trim().startsWith('|')&&l.indexOf('---')<0).forEach(l=>{
  l.split('|').slice(1,-1).forEach(c=>{ if(c.trim()==='')throw new Error('célula vazia'); });
});
const jp=JSON.stringify(PTS), jf=JSON.stringify(FCS);
['$r$','$p$','$f$'].forEach((d,i)=>{ if([SEC,jp,jf][i].indexOf(d)>=0)throw new Error('collision '+d); });

const sql=`UPDATE endodirect_global_state
SET payload = jsonb_set(payload, '{diretrizes}', (
  SELECT jsonb_agg(
    CASE WHEN a->>'privado'='true' AND a->>'sub'='Lípides' AND a->>'tema'='Hipertrigliceridemias Primárias'
         THEN a
              || jsonb_build_object('resumo', (a->>'resumo') || $r$${SEC}$r$)
              || jsonb_build_object('pts', (a->'pts') || $p$${jp}$p$::jsonb)
              || jsonb_build_object('flashcards', (a->'flashcards') || $f$${jf}$f$::jsonb)
         ELSE a END ORDER BY ord)
  FROM jsonb_array_elements(payload->'diretrizes') WITH ORDINALITY t(a,ord)
))
WHERE payload ? 'diretrizes';`;
fs.writeFileSync(__dirname+'/htg_primarias.sql',sql);
console.log('sec chars:',SEC.length,'| pts+',PTS.length,'| fc+',FCS.length,'| sql bytes:',sql.length);
