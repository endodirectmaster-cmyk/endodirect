// Nova subespecialidade/tema "Endocrinologia Básica" (privado) — capítulos
// fundamentais (hormônios, receptores, fisiologia dos eixos, biologia
// molecular, avaliação laboratorial). Conteúdo é SÍNTESE ORIGINAL de fatos de
// fisiologia/biologia molecular (não copyrightável); nenhuma reprodução de
// texto ou figura de livro. Append (subespecialidade nova → grupo novo).
const SUB='Endocrinologia Básica';
const FONTE='Síntese Endodirect · bases de fisiologia e biologia molecular endócrina';
const R=[

// ───────────────────────────── 1. Hormônios ─────────────────────────────
{ sub:SUB, privado:true, titulo:'', ano:'2026', url:'',
  tema:'Hormônios: Classes, Síntese e Transporte', fonte:FONTE,
  resumo:`## Conceito
**Hormônio** é uma molécula sinalizadora secretada por uma célula que age sobre células-alvo que expressam o **receptor** correspondente. A ação pode ser **endócrina** (via corrente sanguínea, à distância), **parácrina** (célula vizinha), **autócrina** (a própria célula) ou **intrácrina** (dentro da própria célula, sem secreção).

## Três grandes classes químicas
As propriedades químicas determinam **síntese, armazenamento, transporte, tipo de receptor e meia-vida**.

- **Peptídicos/proteicos** (insulina, GH, PTH, ACTH, TSH, LH/FSH): sintetizados como **pré-pró-hormônio** → clivagem no retículo/Golgi → **armazenados em grânulos** → secreção regulada por exocitose. São **hidrossolúveis**, circulam **livres**, têm **meia-vida curta** (minutos) e agem em **receptores de membrana**.
- **Esteroides** (cortisol, aldosterona, testosterona, estradiol, progesterona; a vitamina D é um secosteroide): derivados do **colesterol**, sintetizados **sob demanda** (não estocados), **lipossolúveis**, circulam **ligados a proteínas carreadoras**, têm meia-vida mais longa e agem em **receptores nucleares**.
- **Aminas** — derivadas de aminoácidos: as **catecolaminas** (tirosina) comportam-se como peptídeos (estocadas, receptores de membrana, meia-vida curta); os **hormônios tireoidianos** (T4/T3, também da tirosina) são lipossolúveis, muito ligados a proteínas e agem em **receptor nuclear**.

## Síntese e armazenamento
- **Peptídeos:** o gene é transcrito e traduzido num **pré-pró-hormônio**; o peptídeo-sinal é removido (pré→pró) e a **pró-proteína** é processada por pró-hormônio-convertases (ex.: **pró-insulina → insulina + peptídeo C**; **POMC → ACTH, MSH, β-endorfina**). Ficam prontos em grânulos para liberação rápida.
- **Esteroides:** a etapa **limitante** é a entrada do colesterol na mitocôndria pela proteína **StAR** e a conversão a **pregnenolona** pela **CYP11A1 (desmolase)**; enzimas **CYP** e **HSD** definem o produto final de cada tecido (córtex adrenal, gônada, placenta).

## Transporte no sangue
- Hormônios **lipossolúveis** viajam ligados a carreadores: **CBG** (cortisol), **SHBG** (testosterona/estradiol), **TBG** (tireoidianos), **DBP** (vitamina D). Só a **fração livre** é biologicamente ativa; o pool ligado é um **reservatório** que tampona oscilações e prolonga a meia-vida.
- Mudanças na **proteína carreadora** (gravidez e estrogênio ↑TBG/CBG/SHBG) alteram o hormônio **total** sem mudar o **livre** — daí a importância de dosar frações livres ou índices.

## Meia-vida e depuração
Peptídeos e catecolaminas são degradados rápido (peptidases, MAO/COMT) → **meia-vida de minutos**, útil para controle fino e pulsátil. Esteroides e tireoidianos, protegidos pelas carreadoras, têm meia-vida de **horas a dias** (T4 ≈ 7 dias) → efeito mais estável.

## 📊 Comparação das classes
| Propriedade | Peptídicos | Esteroides | Tireoidianos |
| --- | --- | --- | --- |
| Precursor | Pré-pró-proteína | Colesterol | Tirosina + iodo |
| Estoque | Grânulos | Não estoca | Coloide (tireoglobulina) |
| Solubilidade | Hidrossolúvel | Lipossolúvel | Lipossolúvel |
| Transporte | Livre | Ligado (CBG/SHBG) | Ligado (TBG) |
| Receptor | Membrana | Nuclear | Nuclear |
| Meia-vida | Minutos | Horas | Dias |`,
  pts:[
    'Hormônio é molécula sinalizadora com ação endócrina, parácrina, autócrina ou intrácrina, conforme a distância do alvo.',
    'Três classes químicas: peptídicos/proteicos, esteroides e aminas (catecolaminas e hormônios tireoidianos).',
    'Peptídeos são hidrossolúveis, estocados em grânulos, circulam livres, têm meia-vida curta e agem em receptores de membrana.',
    'Esteroides derivam do colesterol, são sintetizados sob demanda, lipossolúveis, ligados a carreadoras e agem em receptores nucleares.',
    'Peptídeos são feitos como pré-pró-hormônio e processados por convertases (pró-insulina→insulina+peptídeo C; POMC→ACTH).',
    'A etapa limitante da esteroidogênese é a entrada do colesterol na mitocôndria (StAR) e a CYP11A1 (desmolase) → pregnenolona.',
    'Só a fração livre é ativa; o pool ligado a CBG/SHBG/TBG é reservatório que tampona e prolonga a meia-vida.',
    'Estrogênio/gravidez elevam TBG/CBG/SHBG e aumentam o hormônio total sem mudar o livre.',
    'Catecolaminas comportam-se como peptídeos (grânulos, receptor de membrana, meia-vida curta); tireoidianos, como esteroides.',
    'Meia-vida curta (peptídeos/catecolaminas) permite controle pulsátil fino; longa (esteroides/T4) dá efeito estável.'],
  mapa:{ central:'Hormônios', nodes:[
    {label:'Classes', children:[
      {label:'Peptídicos',children:['Grânulos','Receptor de membrana','Meia-vida curta']},
      {label:'Esteroides',children:['Do colesterol','Sob demanda','Receptor nuclear']},
      {label:'Aminas',children:['Catecolaminas (como peptídeo)','Tireoidianos (como esteroide)']}]},
    {label:'Síntese', children:[
      {label:'Peptídeo: pré-pró → convertases'},
      {label:'Esteroide: StAR → CYP11A1'}]},
    {label:'Transporte', children:['CBG (cortisol)','SHBG (esteroides sexuais)','TBG (tireoidianos)','Fração livre = ativa']},
    {label:'Meia-vida', children:['Minutos (peptídeo)','Horas–dias (esteroide/T4)']}]},
  flashcards:[
    {q:'Quais são as três grandes classes químicas de hormônios e o que as diferencia?',a:'Peptídicos/proteicos (hidrossolúveis, estocados em grânulos, receptor de membrana, meia-vida curta), esteroides (derivados do colesterol, lipossolúveis, sintetizados sob demanda, receptor nuclear) e aminas — catecolaminas (comportam-se como peptídeos) e hormônios tireoidianos (comportam-se como esteroides).'},
    {q:'Como um hormônio peptídico é processado desde o gene até a forma ativa?',a:'É traduzido como um pré-pró-hormônio; o peptídeo-sinal é removido (pré→pró) e a pró-proteína é clivada por pró-hormônio-convertases, gerando o hormônio ativo — por exemplo pró-insulina em insulina + peptídeo C, e POMC em ACTH, MSH e β-endorfina.'},
    {q:'Qual é a etapa limitante da esteroidogênese?',a:'O transporte do colesterol para dentro da mitocôndria pela proteína StAR e sua conversão a pregnenolona pela enzima de clivagem da cadeia lateral (CYP11A1/desmolase); as enzimas CYP e HSD subsequentes definem o esteroide final de cada tecido.'},
    {q:'Por que o hormônio total pode subir sem que o hormônio livre mude?',a:'Porque hormônios lipossolúveis circulam ligados a proteínas carreadoras (CBG, SHBG, TBG) e só a fração livre é ativa; situações como gravidez e uso de estrogênio aumentam essas carreadoras, elevando o total sem alterar a fração livre — por isso se dosam frações livres ou índices.'},
    {q:'Por que a meia-vida curta dos peptídeos é fisiologicamente útil?',a:'Porque permite controle rápido e pulsátil da sinalização (o nível cai em minutos quando a secreção cessa), ao contrário dos esteroides e tireoidianos, que — protegidos pelas carreadoras — têm meia-vida de horas a dias e produzem efeito mais estável.'}],
  fluxogramas:[] },

// ─────────────────────── 2. Receptores e sinalização ───────────────────────
{ sub:SUB, privado:true, titulo:'', ano:'2026', url:'',
  tema:'Receptores Hormonais e Transdução de Sinal', fonte:FONTE,
  resumo:`## Conceito
O hormônio só age onde há **receptor**. A **especificidade** vem do receptor, não do hormônio: a mesma molécula produz efeitos diferentes conforme o receptor e a maquinaria de sinalização da célula-alvo. Dois grandes grupos: **receptores de membrana** (hormônios hidrossolúveis) e **receptores nucleares** (hormônios lipossolúveis).

## Receptores de membrana (hormônios hidrossolúveis)
O hormônio não entra na célula; liga-se à superfície e a mensagem é transmitida por **segundos mensageiros**. Resposta **rápida** (segundos a minutos).

- **Acoplados à proteína G (GPCR):**
  - **Gs → adenilil-ciclase → ↑AMPc → PKA** (ACTH, TSH, LH/FSH, glucagon, PTH, ADH-V2, β-adrenérgico).
  - **Gi → ↓AMPc** (somatostatina, α2-adrenérgico).
  - **Gq → fosfolipase C → IP3 (↑Ca²⁺) + DAG → PKC** (TRH, GnRH, ADH-V1, angiotensina II, α1-adrenérgico).
- **Tirosina-quinase (RTK):** o receptor tem atividade enzimática própria — **insulina e IGF-1** (autofosforilação → IRS → PI3K/AKT e MAPK).
- **Associados a quinases (JAK-STAT):** o receptor recruta quinases citoplasmáticas — **GH, prolactina, leptina, eritropoetina** (JAK fosforila STAT, que vai ao núcleo).
- **Guanilil-ciclase → GMPc:** peptídeos natriuréticos (ANP/BNP), NO.

## Receptores nucleares (hormônios lipossolúveis)
O hormônio **atravessa a membrana**, liga-se a um receptor intracelular/nuclear e o complexo atua como **fator de transcrição**, ligando-se a **elementos responsivos** no DNA → muda a expressão gênica. Resposta **lenta** (horas), pois depende de nova síntese proteica. Exemplos: **cortisol, aldosterona, andrógenos, estrógenos, progesterona, T3, vitamina D, ácido retinoico**.

## Regulação da resposta
- **Down-regulation:** exposição prolongada/alta → menos receptores ou dessensibilização (ex.: agonista contínuo de GnRH suprime as gonadotrofinas — base terapêutica).
- **Up-regulation:** baixa exposição → mais receptores (ex.: estrogênio aumenta seus próprios receptores e os de progesterona).
- **Agonista** ativa; **antagonista** bloqueia (ex.: espironolactona no receptor mineralocorticoide; tamoxifeno no de estrogênio).

## Resistência hormonal
Defeito no receptor ou pós-receptor → hormônio **alto**, porém **ação baixa**. Exemplos: **resistência à insulina**, **síndrome de insensibilidade androgênica**, **pseudo-hipoparatireoidismo** (resistência ao PTH, via Gs/GNAS), **resistência ao hormônio tireoidiano** (TRβ).

## 📊 Vias de sinalização
| Via | Segundo mensageiro | Exemplos de hormônios |
| --- | --- | --- |
| Gs | ↑AMPc → PKA | ACTH, TSH, LH/FSH, PTH, glucagon |
| Gq | IP3/Ca²⁺ + DAG → PKC | TRH, GnRH, ADH-V1, angiotensina II |
| RTK | Autofosforilação → PI3K/AKT | Insulina, IGF-1 |
| JAK-STAT | STAT → núcleo | GH, prolactina, leptina |
| Nuclear | Transcrição gênica | Esteroides, T3, vitamina D |`,
  pts:[
    'A especificidade da ação hormonal vem do receptor, não do hormônio: sem receptor não há efeito.',
    'Hormônios hidrossolúveis usam receptores de membrana e segundos mensageiros (resposta rápida).',
    'GPCR-Gs ativa adenilil-ciclase → AMPc → PKA (ACTH, TSH, LH/FSH, PTH, glucagon).',
    'GPCR-Gq ativa fosfolipase C → IP3/Ca²⁺ + DAG → PKC (TRH, GnRH, ADH-V1, angiotensina II).',
    'Insulina e IGF-1 agem por receptor tirosina-quinase (autofosforilação → IRS → PI3K/AKT e MAPK).',
    'GH, prolactina e leptina usam receptores associados a JAK-STAT.',
    'Hormônios lipossolúveis (esteroides, T3, vitamina D) usam receptores nucleares e atuam como fatores de transcrição (resposta lenta).',
    'Down-regulation reduz receptores com exposição alta/prolongada (base do agonista contínuo de GnRH que suprime gonadotrofinas).',
    'Agonista ativa e antagonista bloqueia o receptor (espironolactona no MR; tamoxifeno no de estrogênio).',
    'Resistência hormonal cursa com hormônio alto e ação baixa (resistência à insulina, insensibilidade androgênica, pseudo-hipoparatireoidismo).'],
  mapa:{ central:'Receptores e sinalização', nodes:[
    {label:'Membrana (hidrossolúvel)', children:[
      {label:'GPCR',children:['Gs → AMPc/PKA','Gi → ↓AMPc','Gq → IP3/Ca²⁺·DAG/PKC']},
      {label:'Tirosina-quinase',children:['Insulina','IGF-1']},
      {label:'JAK-STAT',children:['GH','Prolactina','Leptina']}]},
    {label:'Nuclear (lipossolúvel)', children:['Esteroides','T3','Vitamina D','Fator de transcrição']},
    {label:'Regulação', children:['Down-regulation','Up-regulation','Agonista × antagonista']},
    {label:'Resistência', children:['Insulina','Androgênica','PTH (pseudo-hipopara)','T3 (TRβ)']}]},
  flashcards:[
    {q:'Por que se diz que a especificidade da ação hormonal está no receptor?',a:'Porque um hormônio só produz efeito em células que expressam seu receptor; a mesma molécula pode gerar respostas diferentes conforme o tipo de receptor e a maquinaria de sinalização da célula-alvo — sem receptor, não há resposta, mesmo com hormônio circulante alto.'},
    {q:'Compare a via Gs e a via Gq dos receptores acoplados à proteína G.',a:'A via Gs ativa a adenilil-ciclase, elevando o AMPc e ativando a PKA (ACTH, TSH, LH/FSH, PTH, glucagon); a via Gq ativa a fosfolipase C, gerando IP3 (que libera Ca²⁺) e DAG (que ativa a PKC) — usada por TRH, GnRH, ADH-V1 e angiotensina II.'},
    {q:'Quais hormônios sinalizam por receptor tirosina-quinase e quais por JAK-STAT?',a:'Por receptor tirosina-quinase agem a insulina e o IGF-1 (autofosforilação do receptor, com ativação de IRS, PI3K/AKT e MAPK); por receptores associados a JAK-STAT agem o GH, a prolactina, a leptina e a eritropoetina.'},
    {q:'Como funcionam os receptores nucleares e por que sua resposta é lenta?',a:'O hormônio lipossolúvel atravessa a membrana, liga-se a um receptor intracelular/nuclear e o complexo atua como fator de transcrição, ligando-se a elementos responsivos no DNA e alterando a expressão gênica; a resposta é lenta (horas) porque depende de nova transcrição e síntese proteica.'},
    {q:'O que é resistência hormonal e cite exemplos.',a:'É um defeito no receptor ou em etapa pós-receptor que leva a hormônio circulante alto mas ação biológica reduzida; exemplos incluem resistência à insulina, síndrome de insensibilidade androgênica, pseudo-hipoparatireoidismo (resistência ao PTH pela via Gs/GNAS) e resistência ao hormônio tireoidiano (TRβ).'}],
  fluxogramas:[] },

// ─────────────────────── 3. Fisiologia dos eixos ───────────────────────
{ sub:SUB, privado:true, titulo:'', ano:'2026', url:'',
  tema:'Fisiologia Endócrina: Eixos e Feedback', fonte:FONTE,
  resumo:`## Organização em eixos
A maior parte da endocrinologia se organiza em **eixos hierárquicos**: **hipotálamo → hipófise → glândula-alvo → hormônio periférico**, com **alça de retroalimentação (feedback)** que estabiliza os níveis em torno de um **set point**.

- **Hipotálamo:** libera hormônios liberadores/inibidores na circulação **porta-hipofisária** (CRH, TRH, GnRH, GHRH, somatostatina, dopamina).
- **Adeno-hipófise:** secreta os **tróficos** (ACTH, TSH, LH, FSH, GH, prolactina).
- **Neuro-hipófise:** armazena e libera **ADH (vasopressina)** e **ocitocina**, produzidos no hipotálamo.

## Feedback negativo (regra geral)
O hormônio periférico **inibe** os andares superiores, mantendo o sistema estável:
- **Eixo HHA:** CRH → ACTH → **cortisol**; o cortisol inibe CRH e ACTH.
- **Eixo tireoidiano:** TRH → TSH → **T4/T3**; T3/T4 inibem TSH e TRH.
- **Eixo gonadal:** GnRH → LH/FSH → **esteroides sexuais/inibina**; retroalimentam a hipófise.

Esse desenho explica a **lógica diagnóstica**: hormônio-alvo **baixo** com trófico **alto** = falência **primária** (na glândula); hormônio-alvo **baixo** com trófico **baixo/normal-inapropriado** = causa **central** (secundária/hipofisária ou terciária/hipotalâmica).

## Feedback positivo (exceção)
No meio do ciclo menstrual, o **estradiol elevado e sustentado** deixa de inibir e passa a **estimular** o eixo → **pico de LH** → ovulação. É transitório e serve a um evento específico.

## Padrões temporais de secreção
- **Pulsátil:** o GnRH é liberado em **pulsos**; a frequência codifica a resposta (pulsos rápidos favorecem LH; lentos, FSH). Perder a pulsatilidade (agonista contínuo) **desliga** o eixo.
- **Circadiano:** cortisol tem **pico matinal** e nadir à meia-noite; GH e prolactina têm picos no **sono**; TSH tem pico noturno.
- **Cíclico:** eixo gonadal feminino segue o ciclo menstrual (~28 dias).
- **Responsivo a estímulos:** glicose→insulina, cálcio→PTH, osmolaridade→ADH.

## Implicações práticas
- Dosar hormônios respeitando o ritmo (cortisol **matinal**; testosterona **manhã**).
- Um único valor pode enganar em hormônios pulsáteis (GH, LH) → preferir **testes dinâmicos** (estímulo/supressão).
- Reposição ideal imita o padrão fisiológico quando possível (ex.: hidrocortisona fracionada).

## 📊 Localização da lesão pelo padrão hormonal
| Situação | Hormônio-alvo | Hormônio trófico | Interpretação |
| --- | --- | --- | --- |
| Primária | Baixo | Alto | Falência da glândula periférica |
| Secundária/terciária | Baixo | Baixo ou "normal" inapropriado | Causa central (hipófise/hipotálamo) |
| Tumor autônomo | Alto | Suprimido | Produção independente do eixo |`,
  pts:[
    'A endocrinologia se organiza em eixos hierárquicos: hipotálamo → hipófise → glândula-alvo → hormônio periférico.',
    'O hipotálamo age via sistema porta-hipofisário (CRH, TRH, GnRH, GHRH, somatostatina, dopamina).',
    'A adeno-hipófise secreta os tróficos (ACTH, TSH, LH, FSH, GH, prolactina); a neuro-hipófise libera ADH e ocitocina.',
    'A regra é o feedback negativo: o hormônio periférico inibe os andares superiores e estabiliza o set point.',
    'Alvo baixo + trófico alto = falência primária; alvo baixo + trófico baixo/normal-inapropriado = causa central.',
    'A exceção é o feedback positivo do estradiol no meio do ciclo, que gera o pico de LH e a ovulação.',
    'O GnRH é pulsátil e a frequência codifica a resposta; agonista contínuo perde a pulsatilidade e desliga o eixo.',
    'Há ritmo circadiano: cortisol com pico matinal; GH e prolactina no sono; TSH à noite.',
    'Dosar respeitando o ritmo (cortisol e testosterona pela manhã) e preferir testes dinâmicos em hormônios pulsáteis.',
    'A reposição ideal imita o padrão fisiológico quando possível (ex.: hidrocortisona fracionada).'],
  mapa:{ central:'Eixos e feedback', nodes:[
    {label:'Hierarquia', children:['Hipotálamo (porta)','Adeno-hipófise (tróficos)','Neuro-hipófise (ADH/ocitocina)','Glândula-alvo']},
    {label:'Feedback negativo', children:['HHA: cortisol ⊣ ACTH','Tireoide: T3/T4 ⊣ TSH','Gonadal: esteroides ⊣ LH/FSH']},
    {label:'Feedback positivo', children:['Estradiol → pico de LH → ovulação']},
    {label:'Ritmos', children:['Pulsátil (GnRH)','Circadiano (cortisol/GH/TSH)','Cíclico (menstrual)','Responsivo (glicose, Ca, osmol)']},
    {label:'Diagnóstico', children:['Primária: alvo↓ trófico↑','Central: alvo↓ trófico↓','Autônomo: alvo↑ trófico↓']}]},
  flashcards:[
    {q:'Como está organizado, em linhas gerais, um eixo endócrino clássico?',a:'Em uma hierarquia: o hipotálamo libera fatores na circulação porta-hipofisária, a adeno-hipófise secreta hormônios tróficos, a glândula-alvo produz o hormônio periférico, e este retroalimenta (feedback) os andares superiores mantendo os níveis em torno de um set point.'},
    {q:'Como o padrão do hormônio trófico ajuda a localizar a lesão?',a:'Se o hormônio-alvo está baixo e o trófico está alto, a falência é primária (na glândula periférica); se o hormônio-alvo está baixo e o trófico está baixo ou "normal" de modo inapropriado, a causa é central (secundária hipofisária ou terciária hipotalâmica).'},
    {q:'Qual é a principal exceção à regra do feedback negativo?',a:'O feedback positivo do estradiol no meio do ciclo menstrual: níveis altos e sustentados de estradiol deixam de inibir e passam a estimular a hipófise, gerando o pico de LH que desencadeia a ovulação — um mecanismo transitório com finalidade específica.'},
    {q:'Por que a pulsatilidade do GnRH importa clinicamente?',a:'Porque a frequência dos pulsos codifica a resposta hipofisária (pulsos rápidos favorecem LH; lentos, FSH); a administração contínua de um agonista de GnRH elimina a pulsatilidade e, após estímulo inicial, dessensibiliza e desliga o eixo gonadal — princípio usado em terapias de supressão.'},
    {q:'Que cuidados o ritmo circadiano impõe à dosagem hormonal?',a:'É preciso dosar respeitando o ritmo: o cortisol tem pico matinal e nadir à meia-noite (dosar de manhã, ou o cortisol salivar da meia-noite para investigar hipercortisolismo), e a testosterona também é maior pela manhã; para hormônios pulsáteis como GH e LH, um valor isolado pode enganar, sendo preferíveis testes dinâmicos.'}],
  fluxogramas:[{ titulo:'Raciocínio: primária × central pelo par alvo/trófico', fonte:'Esquema Endodirect de raciocínio diagnóstico a partir do feedback dos eixos endócrinos', nos:[
    {tipo:'inicio', texto:'Suspeita de disfunção de eixo → dosar o hormônio-alvo e o trófico correspondentes (ex.: T4L + TSH, cortisol + ACTH)'},
    {tipo:'decisao', texto:'Hormônio-alvo está baixo?', ramos:[
      {rotulo:'NÃO (alto)', tipo:'acao', texto:'Se trófico suprimido → produção autônoma/tumor; se trófico alto → tumor secretor de trófico ou resistência'},
      {rotulo:'SIM (baixo)', tipo:'decisao', texto:'Como está o hormônio trófico?', ramos:[
        {rotulo:'Alto', tipo:'fim', texto:'Falência PRIMÁRIA da glândula-alvo'},
        {rotulo:'Baixo/normal inapropriado', tipo:'fim', texto:'Causa CENTRAL (hipófise/hipotálamo) → investigar sela e demais eixos'} ]} ]}
  ]}] },

// ─────────────────────── 4. Biologia molecular ───────────────────────
{ sub:SUB, privado:true, titulo:'', ano:'2026', url:'',
  tema:'Biologia Molecular e Genética em Endocrinologia', fonte:FONTE,
  resumo:`## Por que importa
Grande parte das endocrinopatias tem base **molecular/genética**: mutações em **enzimas, receptores, fatores de transcrição** ou vias de sinalização produzem síndromes reconhecíveis. Entender o mecanismo orienta diagnóstico, aconselhamento e, cada vez mais, **terapia-alvo**.

## Do gene ao hormônio
**Transcrição** (DNA→RNAm, regulada por fatores de transcrição e elementos responsivos) → **processamento/splicing** → **tradução** (RNAm→proteína) → **modificações pós-traducionais** (clivagem, glicosilação) → hormônio ativo. Hormônios **esteroides e tireoidianos** agem justamente **nesse nível**, ligando-se a receptores nucleares que regulam a transcrição.

## Tipos de mutação e efeito
- **Perda de função (inativadora):** reduz produto/atividade. Geralmente **recessiva** quando exige dois alelos.
  - *Enzima:* **HAC por deficiência de 21-hidroxilase (CYP21A2)**.
  - *Receptor:* **insensibilidade androgênica** (receptor de andrógeno), **resistência ao T3 (TRβ)**.
  - *Trófico/subunidade:* hipogonadismo hipogonadotrófico.
- **Ganho de função (ativadora):** ativa a via sem estímulo → costuma ser **dominante**.
  - *Receptor:* mutação ativadora do **receptor de TSH** (hipertireoidismo/nódulo autônomo), do **receptor de PTH/PTHrP** (condrodisplasia de Jansen).
  - *Proteína G:* **GNAS** ativador → **McCune-Albright** (mosaicismo: puberdade precoce, displasia óssea, manchas café-com-leite).
- **Sensor alterado:** o **CaSR** (sensor de cálcio) — perda de função dá **hipercalcemia hipocalciúrica familiar**; ganho de função dá **hipocalcemia**.

## Padrões de herança e conceitos-chave
- **Autossômico dominante:** NEM 1 (**MEN1/menina**), NEM 2 (**RET**), feocromocitoma/paraganglioma (**SDHx, VHL**).
- **Autossômico recessivo:** maioria das HAC e defeitos enzimáticos.
- **Ligado ao X:** insensibilidade androgênica, algumas formas de hipoparatireoidismo.
- **Imprinting (expressão dependente da origem parental):** explica o contraste entre **pseudo-hipoparatireoidismo tipo 1a** (alelo materno de GNAS) e **osteodistrofia hereditária de Albright** isolada / pseudopseudo (alelo paterno).
- **Mosaicismo:** mutação pós-zigótica presente só em parte das células (McCune-Albright).

## Aplicações clínicas
- **Teste genético** confirma diagnóstico, define prognóstico e orienta **rastreamento familiar** (ex.: **RET** na NEM 2 → tireoidectomia profilática).
- **Terapia-alvo** guiada por biologia molecular: **inibidor de BRAF** no craniofaringioma papilífero e em carcinomas, **inibidores de tirosina-quinase** no câncer de tireoide avançado.

## 📊 Mecanismo molecular × doença
| Mecanismo | Alvo | Exemplo |
| --- | --- | --- |
| Perda de função (enzima) | CYP21A2 | HAC clássica |
| Perda de função (receptor) | Receptor de andrógeno | Insensibilidade androgênica |
| Ganho de função (receptor) | Receptor de TSH | Nódulo tóxico autônomo |
| Ganho de função (proteína G) | GNAS | McCune-Albright |
| Sensor alterado | CaSR | Hipercalcemia hipocalciúrica familiar |
| Oncogene herdado | RET | NEM 2 |`,
  pts:[
    'Muitas endocrinopatias têm base molecular: mutações em enzimas, receptores, fatores de transcrição ou vias de sinalização.',
    'Do gene ao hormônio: transcrição → splicing → tradução → modificações pós-traducionais; esteroides e T3 agem regulando a transcrição.',
    'Mutações de perda de função reduzem produto/atividade e costumam ser recessivas (ex.: 21-hidroxilase, insensibilidade androgênica).',
    'Mutações de ganho de função ativam a via sem estímulo e costumam ser dominantes (receptor de TSH, GNAS).',
    'GNAS ativador em mosaico causa a síndrome de McCune-Albright (puberdade precoce, displasia óssea, manchas café-com-leite).',
    'O CaSR ilustra os dois sentidos: perda de função → hipercalcemia hipocalciúrica familiar; ganho → hipocalcemia.',
    'Herança: NEM 1 (MEN1), NEM 2 (RET) e feo/paraganglioma (SDHx, VHL) são autossômicos dominantes.',
    'Imprinting (origem parental do alelo GNAS) explica pseudo-hipoparatireoidismo 1a versus pseudopseudo-hipoparatireoidismo.',
    'O teste genético confirma diagnóstico, define prognóstico e orienta rastreamento familiar (RET → tireoidectomia profilática na NEM 2).',
    'A biologia molecular guia terapia-alvo (inibidor de BRAF, inibidores de tirosina-quinase).'],
  mapa:{ central:'Biologia molecular endócrina', nodes:[
    {label:'Gene → hormônio', children:['Transcrição','Splicing','Tradução','Pós-traducional']},
    {label:'Perda de função', children:['CYP21A2 (HAC)','Receptor de andrógeno','TRβ (resistência T3)']},
    {label:'Ganho de função', children:['Receptor de TSH','GNAS (McCune-Albright)','Jansen (PTH1R)']},
    {label:'Herança', children:['AD: MEN1, RET, SDHx/VHL','AR: HAC','Ligado ao X','Imprinting (GNAS)','Mosaicismo']},
    {label:'Aplicação', children:['Teste genético/rastreio','Terapia-alvo (BRAF, TKI)']}]},
  flashcards:[
    {q:'Qual a diferença entre mutação de perda e de ganho de função, com exemplos endócrinos?',a:'A perda de função reduz a quantidade ou atividade do produto e costuma ser recessiva (ex.: deficiência de 21-hidroxilase na HAC, insensibilidade androgênica por defeito do receptor); o ganho de função ativa a via sem estímulo e costuma ser dominante (ex.: mutação ativadora do receptor de TSH em nódulo autônomo, GNAS ativador).'},
    {q:'O que é a síndrome de McCune-Albright do ponto de vista molecular?',a:'É causada por uma mutação ativadora pós-zigótica (em mosaico) do gene GNAS, que codifica a subunidade Gsα; a ativação constitutiva da via do AMPc em parte das células produz a tríade de puberdade precoce (ou outras endocrinopatias autônomas), displasia fibrosa óssea e manchas café-com-leite.'},
    {q:'Como o receptor sensor de cálcio (CaSR) ilustra os dois sentidos de mutação?',a:'A perda de função do CaSR faz a paratireoide "achar" que o cálcio está baixo, causando hipercalcemia hipocalciúrica familiar (PTH normal/alto com hipercalcemia e hipocalciúria); já o ganho de função faz o sensor superestimar o cálcio, suprimindo o PTH e causando hipocalcemia.'},
    {q:'O que é imprinting e como explica o pseudo-hipoparatireoidismo tipo 1a?',a:'Imprinting é a expressão de um gene dependente da origem parental do alelo; no locus GNAS, a expressão do alelo materno predomina em certos tecidos (como o túbulo renal), de modo que a mutação herdada da mãe causa pseudo-hipoparatireoidismo tipo 1a (resistência ao PTH + fenótipo de Albright), enquanto a herdada do pai gera apenas o fenótipo (pseudopseudo-hipoparatireoidismo).'},
    {q:'Cite uma aplicação clínica direta do teste genético em endocrinologia.',a:'Na neoplasia endócrina múltipla tipo 2, a identificação de uma mutação germinativa do proto-oncogene RET confirma o diagnóstico, orienta o rastreamento dos familiares e indica tireoidectomia profilática precoce para prevenir o carcinoma medular de tireoide.'}],
  fluxogramas:[] },

// ─────────────────────── 5. Avaliação laboratorial ───────────────────────
{ sub:SUB, privado:true, titulo:'', ano:'2026', url:'',
  tema:'Bases da Avaliação Laboratorial em Endocrinologia', fonte:FONTE,
  resumo:`## Princípio central
O laboratório em endocrinologia é **interpretado dentro do eixo**, não isoladamente. Um hormônio "normal" pode ser **inadequado** para o contexto (ex.: TSH "normal" com T4 baixo é inapropriado). Sempre pareie o hormônio-alvo com o trófico e com a clínica.

## Testes basais × dinâmicos
- **Basal:** dosagem única, útil quando o hormônio é estável e o par alvo/trófico é informativo (ex.: **TSH + T4 livre**; **cortisol + ACTH matinais**).
- **Dinâmicos — regra de ouro:**
  - Para confirmar **excesso** → teste de **supressão** (se não suprime, é autônomo). Ex.: **supressão com dexametasona** (Cushing), **TOTG com GH** (acromegalia).
  - Para confirmar **deficiência** → teste de **estímulo** (se não responde, há falência). Ex.: **cortrosina/ACTH** (insuficiência adrenal), **teste de tolerância à insulina/glucagon** para GH e ACTH.

## Hormônio livre × total
Só a **fração livre** é ativa. Quando a **proteína carreadora** varia (gravidez, estrogênio, síndrome nefrótica, doença hepática), o **total** engana → dosar **frações livres** (T4 livre, testosterona livre/biodisponível ou índice via SHBG) ou usar índices.

## Interferências do imunoensaio (fundamentais)
A maioria dos hormônios é medida por **imunoensaio**, sujeito a artefatos que causam resultados **falsos** — reconhecê-los evita erro grave:
- **Biotina** (suplementos): interfere em ensaios com estreptavidina-biotina → pode simular **Graves** (TSH falso baixo, T4/T3/TRAb falso altos) ou outros padrões; **suspender biotina 48–72 h** antes.
- **Efeito gancho (hook):** analito **muito alto** satura o ensaio e dá resultado **falsamente baixo** (clássico em **prolactinoma gigante** com prolactina "normal") → pedir **diluição**.
- **Anticorpos heterófilos/HAMA:** ligam os reagentes e falseiam (para cima ou para baixo) — suspeitar quando o resultado **não bate com a clínica**.
- **Macro-hormônios:** complexos hormônio-imunoglobulina de alto peso, biologicamente **inativos** mas medidos → **macroprolactina** (hiperprolactinemia sem sintomas) e **macro-TSH**.
- **Anticorpos anti-hormônio** (ex.: anti-insulina) e reação cruzada também distorcem.

## Pré-analítica (erros evitáveis)
- **Horário/ritmo:** cortisol e testosterona **pela manhã**.
- **Jejum/posição:** renina/aldosterona dependem de postura e sódio; PTH e cálcio devem ser dosados juntos.
- **Pulsatilidade:** LH, GH e prolactina oscilam → cuidado com valor isolado.
- **Medicamentos/condições:** estrogênio↑carreadoras; corticoide exógeno suprime o eixo; doença aguda muda tireoide (**síndrome do eutireóideo doente**) — evitar dosar tireoide no paciente agudamente enfermo.

## Regra de ouro
**Resultado que não bate com a clínica → pensar em interferência ou erro pré-analítico antes de mudar conduta**; repetir, dosar fração livre, diluir ou trocar de método.

## 📊 Escolha do teste dinâmico
| Objetivo | Estratégia | Exemplo |
| --- | --- | --- |
| Confirmar excesso | Suprimir | Dexametasona (Cushing); TOTG-GH (acromegalia) |
| Confirmar deficiência | Estimular | Cortrosina (adrenal); ITT/glucagon (GH/ACTH) |
| Autonomia nodular | Trófico suprimido | TSH suprimido em nódulo tóxico |`,
  pts:[
    'O laboratório endócrino é interpretado dentro do eixo: pareie sempre o hormônio-alvo com o trófico e a clínica.',
    'Para confirmar excesso hormonal usa-se teste de supressão; para confirmar deficiência, teste de estímulo.',
    'Exemplos: dexametasona e TOTG-GH (excesso); cortrosina e teste de tolerância à insulina/glucagon (deficiência).',
    'Só a fração livre é ativa; quando a carreadora varia (gravidez, estrogênio, nefrótica), dose frações livres ou índices.',
    'Biotina interfere em imunoensaios e pode simular Graves (TSH baixo, T4/T3/TRAb altos); suspender 48–72 h antes.',
    'Efeito gancho (hook): analito muito alto dá resultado falsamente baixo (prolactinoma gigante) → pedir diluição.',
    'Anticorpos heterófilos/HAMA falseiam para cima ou para baixo; suspeitar quando o resultado não bate com a clínica.',
    'Macroprolactina e macro-TSH são complexos inativos que elevam a dosagem sem repercussão clínica.',
    'Cuidados pré-analíticos: horário (cortisol/testosterona de manhã), postura/sódio (renina/aldosterona), PTH com cálcio.',
    'Regra de ouro: resultado incoerente com a clínica → pensar em interferência/erro antes de mudar a conduta.'],
  mapa:{ central:'Avaliação laboratorial', nodes:[
    {label:'Basal × dinâmico', children:[
      {label:'Excesso → suprimir',children:['Dexametasona','TOTG-GH']},
      {label:'Deficiência → estimular',children:['Cortrosina','ITT/glucagon']}]},
    {label:'Livre × total', children:['Fração livre = ativa','Carreadora varia → dosar livre']},
    {label:'Interferências', children:['Biotina','Efeito gancho (hook)','Heterófilos/HAMA','Macro-hormônios']},
    {label:'Pré-analítica', children:['Ritmo/horário','Postura/sódio','Pulsatilidade','Eutireóideo doente']},
    {label:'Regra de ouro', children:['Não bate com a clínica → interferência/erro']}]},
  flashcards:[
    {q:'Qual a regra para escolher entre teste de supressão e de estímulo?',a:'Para confirmar excesso hormonal usa-se um teste de supressão (se o eixo não suprime, a produção é autônoma — ex.: supressão com dexametasona no Cushing, TOTG com GH na acromegalia); para confirmar deficiência usa-se um teste de estímulo (se não há resposta, há falência — ex.: cortrosina na insuficiência adrenal, teste de tolerância à insulina ou glucagon para GH/ACTH).'},
    {q:'Como a biotina pode simular doença de Graves nos exames?',a:'Muitos imunoensaios usam o sistema estreptavidina-biotina; o excesso de biotina de suplementos compete no ensaio e produz TSH falsamente baixo com T4, T3 e TRAb falsamente altos, imitando hipertireoidismo de Graves — por isso se recomenda suspender a biotina por 48–72 h antes da coleta.'},
    {q:'O que é o efeito gancho (hook) e onde é classicamente relevante?',a:'É a saturação do imunoensaio por concentrações muito altas do analito, que paradoxalmente gera um resultado falsamente baixo; é clássico no prolactinoma gigante, em que a prolactina pode vir "normal" apesar do tumor volumoso — a solução é solicitar a dosagem com diluição da amostra.'},
    {q:'O que é macroprolactina e por que importa?',a:'É um complexo de prolactina ligada a imunoglobulina, de alto peso molecular e biologicamente inativo, que é detectado pelo imunoensaio; causa hiperprolactinemia laboratorial sem sintomas, e reconhecê-la (por precipitação com PEG) evita investigação e tratamento desnecessários — o mesmo raciocínio vale para o macro-TSH.'},
    {q:'Qual é a "regra de ouro" diante de um resultado hormonal que não bate com a clínica?',a:'Suspeitar de interferência do imunoensaio (biotina, efeito gancho, anticorpos heterófilos, macro-hormônios) ou de erro pré-analítico (horário, postura, medicação, doença aguda) antes de mudar a conduta; confirmar repetindo o exame, dosando a fração livre, pedindo diluição ou trocando o método analítico.'}],
  fluxogramas:[{ titulo:'Resultado hormonal discordante da clínica', fonte:'Esquema Endodirect para triagem de interferências laboratoriais em endocrinologia', nos:[
    {tipo:'inicio', texto:'Resultado hormonal que NÃO corresponde ao quadro clínico'},
    {tipo:'decisao', texto:'Usa suplemento de biotina ou ensaio biotina-estreptavidina?', ramos:[
      {rotulo:'SIM', tipo:'acao', texto:'Suspender biotina 48–72 h e repetir'},
      {rotulo:'NÃO', tipo:'decisao', texto:'Valor suspeito de estar falsamente BAIXO com tumor/estímulo intenso?', ramos:[
        {rotulo:'SIM', tipo:'acao', texto:'Pedir diluição (excluir efeito gancho) — ex.: prolactina no macroadenoma'},
        {rotulo:'NÃO', tipo:'acao', texto:'Investigar macro-hormônio (PEG), anticorpos heterófilos/HAMA e erros pré-analíticos; trocar de método'} ]} ]},
    {tipo:'fim', texto:'Confirmar com fração livre / método alternativo antes de mudar conduta'}
  ]}] }

];

const fs=require('fs');
function mkSql(arr){const j=JSON.stringify(arr);if(j.indexOf('$j$')>=0)throw new Error('$j$');return `UPDATE endodirect_global_state\nSET payload = jsonb_set(payload, '{diretrizes}', coalesce(payload->'diretrizes','[]'::jsonb) || $j$${j}$j$::jsonb)\nWHERE payload ? 'diretrizes';`;}
// valida tabelas markdown (sem célula vazia) e NFC no sub
R.forEach(r=>{
  if(r.sub!==r.sub.normalize('NFC'))throw new Error('sub não-NFC em '+r.tema);
  (r.resumo.split('\n').filter(l=>l.trim().startsWith('|')&&l.indexOf('---')<0)).forEach(l=>{
    l.split('|').slice(1,-1).forEach(c=>{ if(c.trim()==='')throw new Error('célula vazia em '+r.tema); });
  });
});
fs.writeFileSync(__dirname+'/basica.sql', mkSql(R));
console.log('Endocrinologia Básica +'+R.length+':', R.map(r=>r.tema).join(' | '));
R.forEach(r=>console.log('  -',r.tema,'| resumo',r.resumo.length,'ch | pts',r.pts.length,'| fc',r.flashcards.length,'| flux',r.fluxogramas.length));
