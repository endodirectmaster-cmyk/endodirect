// Acrescenta seção COMPLETA sobre Lp(a) e apoB ao capítulo Lípides/Metabolismo.
// Síntese ORIGINAL de fatos (não copyrightável), alinhada a SBC/EAS/ESC.
// Anexa ao `resumo` (markdown) + pts + flashcards do item. Gera lpa_apob.sql.
const fs=require('fs');

const SEC = `

## Lipoproteína(a) — Lp(a)
**O que é.** A Lp(a) é uma partícula **semelhante ao LDL** (núcleo rico em colesterol com **uma apoB-100**) à qual se liga, de forma **covalente (ponte dissulfeto)**, a **apolipoproteína(a) [apo(a)]**. A apo(a) tem **domínios kringle homólogos ao plasminogênio**; o número de repetições **KIV-2** varia entre indivíduos e define o **tamanho da isoforma** — isoformas **menores** cursam com **níveis mais altos** de Lp(a).

**Genética.** O nível plasmático é **~80–90% determinado geneticamente** pelo gene **LPA** (herança **autossômica codominante**), **estável ao longo da vida** e **pouco modificável** por dieta, exercício ou perda de peso. Por isso, na maioria dos adultos, **basta dosar uma vez na vida**.

**Por que é aterogênica e trombogênica.** Três mecanismos somados: (1) **aterogênese** — como o LDL, penetra e fica **retida na íntima**, entregando colesterol; (2) **pró-trombose** — a homologia com o plasminogênio **compete e inibe a fibrinólise**; (3) **pró-inflamação** — carreia **fosfolípides oxidados**. É **fator de risco causal e independente** para **doença aterosclerótica** (IAM, AVC, DAP) e para **estenose aórtica calcífica**.

**Como medir e limiares.** Preferir a dosagem em **nmol/L (molar)**, menos sensível ao tamanho da isoforma que o mg/dL; **não exige jejum**. Em linhas gerais: o risco **aumenta acima de ~30 mg/dL (≈75 nmol/L)**; considera-se **alto acima de ~50 mg/dL (≈125 nmol/L)**, com risco progressivamente maior em níveis muito elevados.

**Quando dosar.** História **familiar de doença aterosclerótica precoce**, evento **precoce pessoal**, **hipercolesterolemia familiar**, eventos **recorrentes apesar de LDL controlado**, **refinamento de risco** no paciente intermediário e **estenose aórtica**.

**Tratamento.** Ainda **não há fármaco aprovado específico** para reduzir a Lp(a). **Estatinas não a reduzem** (podem elevá-la discretamente); **niacina** reduz, mas **sem benefício clínico comprovado**; **inibidores de PCSK9** reduzem ~20–25%; a **aférese de LDL** é opção em níveis muito altos com doença progressiva. Terapias emergentes (**oligonucleotídeo antisense — pelacarsen**; **siRNA — olpasiran, lepodisiran**) estão em **ensaios de desfecho**. Na prática, a Lp(a) alta é um **amplificador de risco**: **intensificar a meta de LDL** e **controlar rigorosamente os demais fatores**.

## ApoB — a "contagem" de partículas aterogênicas
**Conceito-chave.** Cada partícula aterogênica carrega **exatamente uma molécula de apoB**: **apoB-100** no **VLDL, IDL, LDL e Lp(a)**; **apoB-48** nos **quilomícrons e remanescentes** (origem intestinal). Logo, a **apoB plasmática ≈ número total de partículas aterogênicas**.

**Por que importa mais que o LDL-c isolado.** A aterosclerose depende do **número de partículas** que penetram e ficam retidas na íntima — não apenas da **massa de colesterol**. Quando as partículas são **pequenas e densas** (típico de **hipertrigliceridemia, diabetes e síndrome metabólica**), o **LDL-c subestima** o risco: surge **discordância** entre LDL-c e apoB, e a **apoB prediz melhor** o desfecho.

**apoB × não-HDL-c.** O **não-HDL-colesterol** é um bom substituto (soma o colesterol de **todas as partículas com apoB**); a **apoB** é a **contagem direta**. Ambos **superam o LDL-c** quando os **triglicérides estão altos**.

**Como usar.** A apoB é **medida diretamente**, com **ensaio padronizado** e **sem jejum**. Serve como **meta secundária / refinamento de risco**: em **alto risco**, buscar **apoB < 80 mg/dL**; em **muito alto risco**, **< 65 mg/dL** (valores conforme a diretriz). É especialmente útil em **TG alto, diabetes e síndrome metabólica**. O tratamento segue a mesma escada do LDL (**estatina → ezetimiba → iPCSK9**), agora **mirando também o número de partículas**.

## 📊 LDL-c × não-HDL-c × apoB
| Marcador | O que mede | Quando brilha |
| --- | --- | --- |
| LDL-c | Colesterol dentro do LDL | Alvo primário na maioria |
| Não-HDL-c | Colesterol de todas as partículas com apoB | TG alto; dispensa jejum |
| ApoB | Número de partículas aterogênicas | Discordância; diabetes; síndrome metabólica |`;

const PTS = [
  'Lp(a) é uma partícula tipo-LDL (uma apoB-100) ligada à apo(a), homóloga ao plasminogênio — fator de risco causal e independente para aterosclerose e estenose aórtica.',
  'O nível de Lp(a) é ~80–90% genético (gene LPA) e estável na vida: dosar uma vez; risco sobe acima de ~30 mg/dL (≈75 nmol/L), alto acima de ~50 mg/dL (≈125 nmol/L).',
  'Estatina não reduz Lp(a); iPCSK9 reduz ~20–25%; aférese em casos extremos; terapias-alvo (pelacarsen, olpasiran) em ensaios — tratar o risco global e intensificar a meta de LDL.',
  'Cada partícula aterogênica (VLDL, IDL, LDL, Lp(a)) carrega uma apoB-100 (e apoB-48 nos quilomícrons/remanescentes): apoB = número de partículas aterogênicas.',
  'ApoB e não-HDL-c superam o LDL-c quando há TG alto, diabetes ou síndrome metabólica (partículas pequenas e densas); metas de apoB <80 (alto risco) e <65 mg/dL (muito alto).'
];

const FCS = [
  {q:'O que é a Lp(a) e por que é ao mesmo tempo aterogênica e trombogênica?',a:'É uma partícula semelhante ao LDL (com uma apoB-100) ligada covalentemente à apolipoproteína(a), que tem domínios kringle homólogos ao plasminogênio. É aterogênica porque, como o LDL, se retém na íntima entregando colesterol; trombogênica porque compete com o plasminogênio inibindo a fibrinólise; e pró-inflamatória por carrear fosfolípides oxidados — sendo fator de risco causal e independente para IAM, AVC, DAP e estenose aórtica calcífica.'},
  {q:'Por que a Lp(a) só precisa ser dosada uma vez na vida, e como se trata?',a:'Porque seu nível é ~80–90% determinado pelo gene LPA, estável ao longo da vida e pouco modificável por estilo de vida. Não há fármaco aprovado específico: estatinas não a reduzem, niacina reduz sem benefício comprovado, os iPCSK9 reduzem ~20–25% e a aférese é reservada a níveis muito altos com doença progressiva; terapias-alvo (pelacarsen, olpasiran) estão em ensaios. Na prática, trata-se como amplificador de risco, intensificando a meta de LDL e controlando os demais fatores.'},
  {q:'Por que a apoB pode prever o risco cardiovascular melhor que o LDL-c?',a:'Porque cada partícula aterogênica (VLDL, IDL, LDL e Lp(a)) carrega exatamente uma apoB-100, então a apoB reflete o número total de partículas — e a aterosclerose depende do número de partículas retidas na íntima, não só da massa de colesterol. Quando as partículas são pequenas e densas (hipertrigliceridemia, diabetes, síndrome metabólica), o LDL-c subestima o risco e a apoB (ou o não-HDL-c) prediz melhor o desfecho.'}
];

// valida tabela (sem célula vazia)
SEC.split('\n').filter(l=>l.trim().startsWith('|')&&l.indexOf('---')<0).forEach(l=>{
  l.split('|').slice(1,-1).forEach(c=>{ if(c.trim()==='')throw new Error('célula vazia'); });
});
const rq='$r$', pq='$p$', fq='$f$';
if(SEC.indexOf(rq)>=0)throw new Error('collision r');
const jp=JSON.stringify(PTS), jf=JSON.stringify(FCS);
if(jp.indexOf(pq)>=0||jf.indexOf(fq)>=0)throw new Error('collision');

const sql=`UPDATE endodirect_global_state
SET payload = jsonb_set(payload, '{diretrizes}', (
  SELECT jsonb_agg(
    CASE WHEN a->>'privado'='true' AND a->>'sub'='Lípides' AND a->>'tema'='Metabolismo Lipídico e Lipoproteínas'
         THEN a
              || jsonb_build_object('resumo', (a->>'resumo') || ${rq}${SEC}${rq})
              || jsonb_build_object('pts', (a->'pts') || ${pq}${jp}${pq}::jsonb)
              || jsonb_build_object('flashcards', (a->'flashcards') || ${fq}${jf}${fq}::jsonb)
         ELSE a END ORDER BY ord)
  FROM jsonb_array_elements(payload->'diretrizes') WITH ORDINALITY t(a,ord)
))
WHERE payload ? 'diretrizes';`;
fs.writeFileSync(__dirname+'/lpa_apob.sql',sql);
console.log('sec chars:',SEC.length,'| pts+',PTS.length,'| fc+',FCS.length,'| sql bytes:',sql.length);
