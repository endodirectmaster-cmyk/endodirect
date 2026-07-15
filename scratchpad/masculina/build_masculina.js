// Resumos de Endocrinologia Masculina (privados) — síntese própria (não reproduz
// livros); cobertura Vilar 8ed/Williams/Greenspan + Endocrine Society. Cada um:
// resumo md (com tabela) + 10 pts + mapa 3 níveis + 5 flashcards + fluxograma
// fiel ao algoritmo da diretriz. fonte distinta → chave de merge nova (sem clobber).
const FONTE='Síntese Endodirect · Vilar 8ed + Williams/Greenspan + Endocrine Society';
const R=[
// 1 ─ Hipogonadismo masculino ──────────────────────────────────────────────
{ sub:'Endocrinologia Masculina', privado:true, titulo:'', ano:'2026', url:'',
  tema:'Hipogonadismo Masculino', fonte:FONTE,
  resumo:`## Conceito e classificação
Síndrome clínica por **deficiência de testosterona** com sintomas/sinais consistentes. Divide-se pelo nível do eixo:
- **Primário (hipergonadotrófico):** falha testicular → testosterona↓ e **LH/FSH↑**. Causas: **síndrome de Klinefelter (47,XXY — a mais comum)**, criptorquidia, orquite (caxumba), trauma/torção, quimio/radioterapia, envelhecimento.
- **Secundário (hipogonadotrófico):** falha hipotálamo-hipofisária → testosterona↓ com **LH/FSH baixos/inapropriadamente normais**. Causas: **hiperprolactinemia**, tumor/doença selar, **Kallmann** (hipogonadismo congênito + anosmia), doença sistêmica, **opioides e glicocorticoides**, obesidade, hemocromatose (ferro), Prader-Willi.

## Quadro clínico
Adulto: **↓libido, disfunção erétil**, fadiga, ↓massa/força muscular, ginecomastia, ↓pelos corporais, ↓densidade óssea, humor. Pré-puberal: **hábito eunucoide**, micropênis, ausência de virilização.

## Diagnóstico
- **Testosterona total matinal (jejum), baixa em ≥ 2 ocasiões** (variabilidade e ritmo circadiano). Se limítrofe ou **SHBG alterada** (obesidade, idade, doença hepática) → **testosterona livre/biodisponível**.
- Confirmado o hipogonadismo, **dosar LH/FSH** para classificar. **Primário** → cariótipo (Klinefelter). **Secundário** → prolactina, ferritina/saturação de transferrina, demais eixos hipofisários e **RM de hipófise** (se T muito baixa, sintomas de massa ou prolactina alta).

## Tratamento
- Tratar a **causa** (retirar opioide/glicocorticoide, tratar prolactinoma, perder peso).
- **Reposição de testosterona** quando sintomático e sem contraindicação (ver capítulo próprio). **Se deseja fertilidade**, não usar testosterona (suprime a espermatogênese) — usar **gonadotrofinas/clomifeno**.

## 📊 Hipogonadismo primário × secundário
| Característica | Primário | Secundário |
| --- | --- | --- |
| Local | Testículo | Hipotálamo/hipófise |
| LH e FSH | Elevados | Baixos/normais |
| Exemplo típico | Klinefelter | Hiperprolactinemia, Kallmann |
| Próximo passo | Cariótipo | Prolactina, ferro, RM de hipófise |
| Fertilidade | Geralmente difícil | Responde a gonadotrofinas |`,
  pts:[
    'Hipogonadismo = testosterona baixa + sintomas; classifica-se em primário e secundário pelo LH/FSH.',
    'Primário (hipergonadotrófico): falha testicular com LH/FSH elevados; Klinefelter (47,XXY) é a causa mais comum.',
    'Secundário (hipogonadotrófico): falha central com LH/FSH baixos ou inapropriadamente normais.',
    'Causas secundárias: hiperprolactinemia, doença selar, Kallmann, opioides, glicocorticoides, obesidade, hemocromatose.',
    'Clínica: ↓libido, disfunção erétil, fadiga, ↓massa muscular, ginecomastia, ↓pelos, osteoporose.',
    'Diagnóstico: testosterona total matinal baixa em duas ocasiões; usar T livre se a SHBG estiver alterada.',
    'Após confirmar, dosar LH/FSH para classificar o nível do eixo.',
    'Primário → cariótipo; secundário → prolactina, ferro e RM de hipófise.',
    'Tratar a causa e repor testosterona se sintomático e sem contraindicação.',
    'Quem deseja fertilidade não deve usar testosterona (suprime espermatogênese) — usar gonadotrofinas/clomifeno.'
  ],
  mapa:{ central:'Hipogonadismo masculino',
    nodes:[
      { label:'Primário (LH/FSH↑)', children:[
        {label:'Klinefelter (+ comum)'},
        {label:'Criptorquidia, orquite'},
        {label:'QT/RT, trauma, idade'} ]},
      { label:'Secundário (LH/FSH baixo)', children:[
        {label:'Hiperprolactinemia / selar'},
        {label:'Kallmann (+ anosmia)'},
        {label:'Opioides, glicocorticoide, obesidade'},
        {label:'Hemocromatose'} ]},
      { label:'Diagnóstico', children:['T total matinal (2×)','T livre se SHBG alterada','LH/FSH classifica','Cariótipo / prolactina / RM'] },
      { label:'Tratamento', children:[
        {label:'Tratar a causa'},
        {label:'Repor testosterona'},
        {label:'Fertilidade → gonadotrofinas/clomifeno'} ]}
    ]},
  flashcards:[
    {q:'Como se diferencia hipogonadismo primário de secundário?',a:'Pelo LH/FSH: no primário (falha testicular) estão elevados (hipergonadotrófico); no secundário (falha hipotálamo-hipofisária) estão baixos ou inapropriadamente normais (hipogonadotrófico).'},
    {q:'Qual a causa mais comum de hipogonadismo primário no homem?',a:'A síndrome de Klinefelter (47,XXY); por isso o cariótipo é indicado na investigação do hipogonadismo primário.'},
    {q:'Como se confirma o diagnóstico laboratorial de hipogonadismo?',a:'Testosterona total matinal (em jejum) baixa em pelo menos duas ocasiões; quando a SHBG está alterada (obesidade, idade, hepatopatia), avalia-se a testosterona livre ou biodisponível.'},
    {q:'Que investigação se faz no hipogonadismo secundário?',a:'Prolactina, ferritina/saturação de transferrina (hemocromatose), avaliação dos demais eixos hipofisários e RM de hipófise, sobretudo se a testosterona for muito baixa ou houver sintomas de massa selar.'},
    {q:'Por que não usar testosterona em quem deseja ter filhos?',a:'Porque a testosterona exógena suprime a secreção de gonadotrofinas e a espermatogênese; nesses casos, usa-se gonadotrofinas (hCG/FSH) ou clomifeno para estimular a produção própria.'}
  ],
  fluxogramas:[{ titulo:'Investigação do hipogonadismo masculino', fonte:'Algoritmo baseado na Endocrine Society Clinical Practice Guideline (testosterona, 2018), adaptado ao português', nos:[
    {tipo:'inicio', texto:'Sintomas sugestivos → testosterona total matinal (jejum); repetir se baixa (2 dosagens)'},
    {tipo:'decisao', texto:'Testosterona confirmadamente baixa (usar T livre se SHBG alterada)?', ramos:[
      {rotulo:'NÃO', tipo:'fim', texto:'Hipogonadismo não confirmado — reavaliar sintomas/causas'},
      {rotulo:'SIM', tipo:'acao', texto:'Dosar LH e FSH para classificar'} ]},
    {tipo:'decisao', texto:'LH/FSH elevados?', ramos:[
      {rotulo:'SIM', tipo:'fim', texto:'Primário → cariótipo (Klinefelter); tratar/repor testosterona'},
      {rotulo:'NÃO (baixo/normal)', tipo:'fim', texto:'Secundário → prolactina, ferro e RM de hipófise; tratar a causa'} ]}
  ]}]
},
// 2 ─ Reposição de testosterona ────────────────────────────────────────────
{ sub:'Endocrinologia Masculina', privado:true, titulo:'', ano:'2026', url:'',
  tema:'Terapia de Reposição de Testosterona', fonte:FONTE,
  resumo:`## Quando indicar
**Somente no hipogonadismo confirmado** (sintomas consistentes **+** testosterona baixa em ≥ 2 dosagens matinais). **Não** repor apenas por idade, sintoma inespecífico ou testosterona normal. Sempre tratar/afastar causas reversíveis antes (opioides, obesidade, prolactinoma).

## Formulações
- **Transdérmica (gel):** níveis estáveis; risco de transferência por contato.
- **Intramuscular:** cipionato/enantato (a cada 1–2 semanas, com picos e vales) ou **undecilato de longa ação** (a cada ~10–14 semanas).
- **Oral (undecilato):** absorção linfática; formulações mais novas.

## Contraindicações / cautela
Câncer de **próstata ou mama**, **PSA elevado não investigado** ou nódulo prostático, **hematócrito > 54%**, insuficiência cardíaca descompensada, **apneia obstrutiva grave não tratada**, trombofilia/evento tromboembólico recente e **desejo de fertilidade** (suprime a espermatogênese).

## Monitorização
- **Testosterona:** alvo na faixa média do normal; ajustar dose/intervalo.
- **Hematócrito:** basal, 3–6 e 12 meses e depois anual — suspender/reduzir se **> 54%** (eritrocitose).
- **Próstata:** PSA e toque retal na linha de base, 3–12 meses e depois conforme idade/risco; avaliar urologia se aumento significativo do PSA.
- Sintomas, adesão e densidade óssea quando indicado.

## Alternativa se deseja fertilidade
**hCG** (± FSH) ou **clomifeno/inibidor da aromatase** estimulam a produção testicular própria, preservando a espermatogênese.

## 📊 Monitorização da reposição de testosterona
| Parâmetro | Quando | Conduta se alterado |
| --- | --- | --- |
| Testosterona | Basal, 3–6 meses, anual | Ajustar dose/intervalo |
| Hematócrito | Basal, 3–6, 12 meses, anual | Suspender/reduzir se > 54% |
| PSA / toque | Basal, 3–12 meses, depois anual | Urologia se ↑ significativo |
| Sintomas | Cada consulta | Reavaliar indicação |`,
  pts:[
    'Repor testosterona só no hipogonadismo confirmado (sintomas + testosterona baixa em duas dosagens matinais).',
    'Não repor apenas por idade, sintoma inespecífico ou testosterona normal; afastar causas reversíveis antes.',
    'Formulações: gel transdérmico, IM (cipionato/enantato ou undecilato de longa ação) e oral (undecilato).',
    'Contraindicações: câncer de próstata/mama, PSA alto não investigado, hematócrito > 54%, ICC descompensada.',
    'Também são cautela: apneia grave não tratada, trombofilia e desejo de fertilidade.',
    'Monitorar testosterona com alvo na faixa média do normal.',
    'Monitorar hematócrito (basal, 3–6, 12 meses e anual); suspender/reduzir se > 54% (eritrocitose).',
    'Monitorar próstata (PSA e toque) na linha de base, 3–12 meses e depois anual.',
    'A testosterona exógena suprime a espermatogênese.',
    'Quem deseja fertilidade usa hCG ± FSH ou clomifeno, não testosterona.'
  ],
  mapa:{ central:'Reposição de testosterona',
    nodes:[
      { label:'Indicação', children:[
        {label:'Hipogonadismo confirmado', children:['Sintomas + T baixa (2×)']},
        {label:'Afastar causas reversíveis'} ]},
      { label:'Formulações', children:['Gel transdérmico','IM (cipionato/undecilato)','Oral (undecilato)'] },
      { label:'Contraindicações', children:[
        {label:'CA de próstata/mama'},
        {label:'PSA alto não investigado'},
        {label:'Hematócrito > 54%'},
        {label:'Desejo de fertilidade'} ]},
      { label:'Monitorização', children:[
        {label:'Testosterona (alvo médio)'},
        {label:'Hematócrito'},
        {label:'PSA/toque'} ]}
    ]},
  flashcards:[
    {q:'Qual o pré-requisito para indicar reposição de testosterona?',a:'Hipogonadismo confirmado: sintomas consistentes associados a testosterona baixa em pelo menos duas dosagens matinais, após afastar causas reversíveis — não se repõe apenas por idade ou sintoma inespecífico.'},
    {q:'Quais as principais contraindicações à reposição de testosterona?',a:'Câncer de próstata ou de mama, PSA elevado não investigado/nódulo prostático, hematócrito acima de 54%, insuficiência cardíaca descompensada, apneia obstrutiva grave não tratada, trombofilia e desejo de fertilidade.'},
    {q:'Como se monitora o hematócrito durante a reposição?',a:'Dosa-se na linha de base, aos 3–6 e 12 meses e depois anualmente; se ultrapassar 54% (eritrocitose), reduz-se a dose, troca-se a formulação ou suspende-se pelo risco trombótico.'},
    {q:'Que exames prostáticos acompanham a reposição de testosterona?',a:'PSA e toque retal na linha de base, entre 3 e 12 meses e depois conforme idade/risco; um aumento significativo do PSA indica avaliação urológica.'},
    {q:'Qual a alternativa à testosterona no homem que deseja fertilidade?',a:'Estimular a produção testicular própria com hCG (associado ou não a FSH) ou com clomifeno/inibidor da aromatase, preservando a espermatogênese.'}
  ],
  fluxogramas:[{ titulo:'Reposição de testosterona: indicação e monitorização', fonte:'Algoritmo baseado na Endocrine Society Clinical Practice Guideline (testosterona, 2018), adaptado ao português', nos:[
    {tipo:'inicio', texto:'Hipogonadismo confirmado e sintomático → avaliar contraindicações (próstata/mama, PSA, hematócrito, fertilidade)'},
    {tipo:'decisao', texto:'Há contraindicação ou desejo de fertilidade?', ramos:[
      {rotulo:'SIM', tipo:'fim', texto:'Não iniciar testosterona — investigar/tratar (urologia; gonadotrofinas se fertilidade)'},
      {rotulo:'NÃO', tipo:'acao', texto:'Iniciar testosterona (gel/IM) com alvo na faixa média'} ]},
    {tipo:'acao', texto:'Monitorar: testosterona, hematócrito e PSA/toque (basal, 3–6, 12 meses e anual)'},
    {tipo:'decisao', texto:'Hematócrito > 54% ou aumento significativo do PSA?', ramos:[
      {rotulo:'SIM', tipo:'fim', texto:'Reduzir/suspender e avaliar (urologia); reavaliar risco'},
      {rotulo:'NÃO', tipo:'fim', texto:'Manter e seguir monitorização periódica'} ]}
  ]}]
},
// 3 ─ Ginecomastia ─────────────────────────────────────────────────────────
{ sub:'Endocrinologia Masculina', privado:true, titulo:'', ano:'2026', url:'',
  tema:'Ginecomastia', fonte:FONTE,
  resumo:`## Conceito
Proliferação **benigna do tecido glandular** mamário masculino por **desequilíbrio na relação estrogênio/androgênio** (↑ estrogênio ou ↓ androgênio, ou ↑ da ação estrogênica). Diferenciar de **pseudoginecomastia/lipomastia** (tecido adiposo, sem disco glandular) e de **câncer de mama** (massa dura, excêntrica, fixa, retração, linfonodo → mamografia/biópsia).

## Causas
- **Fisiológica:** neonatal (estrogênio materno), **puberal** (transitória, autolimitada) e senil.
- **Patológica:** hipogonadismo, **hipertireoidismo**, cirrose/desnutrição (e renutrição), doença renal crônica, **tumores** (testicular produtor de hCG, adrenal/testicular feminizante), **fármacos**.
- **Fármacos frequentes:** espironolactona, cimetidina, cetoconazol, antiandrogênios, **anabolizantes/abuso de testosterona** (aromatização), antirretrovirais, bloqueadores de canal de cálcio, IBP, e o álcool/maconha.

## Avaliação
- História (fármacos, tempo de evolução, dor, rapidez), exame diferenciando **glandular × adiposo × sinais de malignidade**.
- Laboratório conforme suspeita: **testosterona, LH, estradiol, β-hCG** (tumor testicular), **TSH**, função hepática/renal e **prolactina**. Ultrassom/mamografia se assimetria dura ou dúvida; imagem testicular se hCG/estradiol elevados.

## Conduta
- **Tratar a causa** e **suspender o fármaco** culpado.
- **Puberal:** observar (regride na maioria).
- **Recente e doloroso:** ensaio com **tamoxifeno** (fase proliferativa responde melhor).
- **Crônica/fibrótica ou volumosa:** **cirurgia**.

## 📊 Sinais que sugerem malignidade (vs ginecomastia benigna)
| Achado | Ginecomastia | Suspeito de câncer |
| --- | --- | --- |
| Localização | Central, simétrico | Excêntrico, unilateral |
| Consistência | Elástica | Dura/irregular |
| Fixação/pele | Móvel | Fixo, retração, úlcera |
| Linfonodo axilar | Ausente | Pode haver |
| Conduta | Investigar causa | Mamografia + biópsia |`,
  pts:[
    'Ginecomastia é proliferação benigna do tecido glandular por desequilíbrio estrogênio/androgênio.',
    'Diferenciar de pseudoginecomastia (adiposa) e de câncer de mama (massa dura, excêntrica, fixa).',
    'Fisiológica: neonatal, puberal (autolimitada) e senil.',
    'Patológica: hipogonadismo, hipertireoidismo, cirrose/desnutrição, DRC, tumores e fármacos.',
    'Fármacos: espironolactona, cimetidina, cetoconazol, antiandrogênios, anabolizantes, antirretrovirais, BCC, IBP.',
    'Tumor testicular produtor de hCG e tumores feminizantes são causas importantes a excluir.',
    'Avaliação: testosterona, LH, estradiol, β-hCG, TSH, função hepática/renal e prolactina.',
    'Sinais de alarme (unilateral, duro, fixo, retração) exigem mamografia e biópsia.',
    'Conduta: tratar a causa/suspender o fármaco; puberal observar.',
    'Recente/doloroso responde a tamoxifeno; crônico/fibrótico é cirúrgico.'
  ],
  mapa:{ central:'Ginecomastia',
    nodes:[
      { label:'Diferenciais', children:[
        {label:'Glandular (verdadeira)'},
        {label:'Adiposa (pseudo)'},
        {label:'Câncer de mama', children:['Duro, excêntrico, fixo']} ]},
      { label:'Causas', children:[
        {label:'Fisiológica', children:['Neonatal','Puberal','Senil']},
        {label:'Endócrina', children:['Hipogonadismo','Hipertireoidismo']},
        {label:'Sistêmica', children:['Cirrose/desnutrição','DRC']},
        {label:'Tumor (hCG/feminizante)'},
        {label:'Fármacos'} ]},
      { label:'Avaliação', children:['T, LH, estradiol','β-hCG, TSH','Hepático/renal, prolactina','Imagem se dúvida'] },
      { label:'Conduta', children:[
        {label:'Tratar causa / suspender fármaco'},
        {label:'Puberal: observar'},
        {label:'Recente/doloroso: tamoxifeno'},
        {label:'Crônica: cirurgia'} ]}
    ]},
  flashcards:[
    {q:'Como diferenciar ginecomastia verdadeira de pseudoginecomastia e de câncer de mama?',a:'A ginecomastia verdadeira tem disco glandular firme e concêntrico sob a aréola; a pseudoginecomastia é só tecido adiposo, sem disco; o câncer costuma ser uma massa dura, unilateral, excêntrica, fixa, com retração de pele ou linfonodo — exigindo mamografia e biópsia.'},
    {q:'Quais fármacos causam ginecomastia com frequência?',a:'Espironolactona, cimetidina, cetoconazol, antiandrogênios, anabolizantes/abuso de testosterona (por aromatização), antirretrovirais, bloqueadores de canal de cálcio e inibidores da bomba de prótons, além de álcool e maconha.'},
    {q:'Que causa tumoral não pode passar despercebida na ginecomastia?',a:'Tumores produtores de hCG (por exemplo, testicular) e tumores feminizantes adrenais/testiculares; por isso dosam-se β-hCG e estradiol, com imagem testicular se elevados.'},
    {q:'Qual a conduta na ginecomastia puberal?',a:'Observação, pois regride espontaneamente na maioria dos adolescentes em 1–2 anos; investiga-se se for volumosa, progressiva ou persistente.'},
    {q:'Quando indicar tamoxifeno e quando indicar cirurgia na ginecomastia?',a:'O tamoxifeno é útil na fase recente e dolorosa (proliferativa); a cirurgia é reservada para os casos crônicos, fibróticos ou volumosos que não respondem ao tratamento clínico.'}
  ],
  fluxogramas:[{ titulo:'Abordagem da ginecomastia', fonte:'Algoritmo baseado em revisões e consensos, adaptado ao português', nos:[
    {tipo:'inicio', texto:'Aumento mamário → exame: glandular × adiposo × sinais de malignidade'},
    {tipo:'decisao', texto:'Achados suspeitos de câncer (unilateral, duro, fixo, retração)?', ramos:[
      {rotulo:'SIM', tipo:'fim', texto:'Mamografia + biópsia (excluir câncer de mama)'},
      {rotulo:'NÃO', tipo:'acao', texto:'Ginecomastia verdadeira → rever fármacos e dosar T, LH, estradiol, β-hCG, TSH, hepático/renal'} ]},
    {tipo:'decisao', texto:'Causa identificada (fármaco, endócrina, tumor)?', ramos:[
      {rotulo:'SIM', tipo:'fim', texto:'Tratar a causa/suspender o fármaco'},
      {rotulo:'NÃO', tipo:'fim', texto:'Puberal → observar; recente/doloroso → tamoxifeno; crônica/volumosa → cirurgia'} ]}
  ]}]
},
// 4 ─ Infertilidade masculina ──────────────────────────────────────────────
{ sub:'Endocrinologia Masculina', privado:true, titulo:'', ano:'2026', url:'',
  tema:'Infertilidade Masculina', fonte:FONTE,
  resumo:`## Conceito
O **fator masculino** contribui em cerca de **metade** dos casais inférteis. A avaliação começa em paralelo à da parceira.

## Investigação inicial
- **Espermograma** (2 amostras, 2–7 dias de abstinência) segundo parâmetros da **OMS** (concentração, motilidade, morfologia, volume).
- História (criptorquidia, caxumba, QT/RT, cirurgia, medicamentos, anabolizantes) e exame (**volume testicular**, varicocele, presença dos ductos deferentes).

## Classificação
- **Pré-testicular (endócrina):** hipogonadismo **secundário** (LH/FSH baixos) — responde a gonadotrofinas.
- **Testicular:** Klinefelter, criptorquidia, **varicocele**, QT/RT, orquite, idiopática (FSH↑, testículos pequenos).
- **Pós-testicular:** obstrução (ausência congênita de deferentes — associada a **mutações do CFTR**), pós-vasectomia; disfunção ejaculatória.

## Azoospermia
- **Obstrutiva:** FSH e testículos **normais** → recuperação espermática (TESE/PESA) viável.
- **Não obstrutiva:** **FSH alto**, testículos pequenos → falência da espermatogênese; investigar **cariótipo, microdeleções do cromossomo Y**; TESE pode recuperar focos.

## Investigação hormonal e genética
- **FSH, LH, testosterona** (± prolactina se secundário). Oligozoospermia grave/azoospermia → **cariótipo, microdeleções do Y e CFTR**.

## Tratamento
- **Hipogonadismo secundário:** **gonadotrofinas (hCG/FSH)** — **nunca testosterona** (suprime a espermatogênese).
- **Varicocele** sintomática/alterada: varicocelectomia em casos selecionados.
- **Reprodução assistida:** ICSI; recuperação cirúrgica de espermatozoides (TESE) na azoospermia.

## 📊 Azoospermia obstrutiva × não obstrutiva
| Característica | Obstrutiva | Não obstrutiva |
| --- | --- | --- |
| FSH | Normal | Elevado |
| Volume testicular | Normal | Reduzido |
| Mecanismo | Bloqueio da via | Falência da produção |
| Genética | CFTR (deferentes ausentes) | Cariótipo, microdeleção do Y |
| Conduta | Recuperação (PESA/TESE) | TESE (focos) ± ICSI |`,
  pts:[
    'O fator masculino contribui em cerca de metade dos casais inférteis.',
    'A investigação começa pelo espermograma (2 amostras, parâmetros da OMS) e por história/exame.',
    'Classifica-se em pré-testicular (endócrina), testicular e pós-testicular (obstrutiva).',
    'Pré-testicular = hipogonadismo secundário (LH/FSH baixos), que responde a gonadotrofinas.',
    'Testicular: Klinefelter, criptorquidia, varicocele, QT/RT e idiopática (FSH alto, testículos pequenos).',
    'Pós-testicular: obstrução, incluindo ausência de deferentes por mutação do CFTR.',
    'Azoospermia obstrutiva tem FSH e testículos normais; a não obstrutiva tem FSH alto e testículos pequenos.',
    'Oligo grave/azoospermia exigem cariótipo, microdeleções do cromossomo Y e pesquisa de CFTR.',
    'No hipogonadismo secundário usa-se gonadotrofina (hCG/FSH), nunca testosterona.',
    'A reprodução assistida (ICSI) e a recuperação espermática (TESE) tratam muitos casos.'
  ],
  mapa:{ central:'Infertilidade masculina',
    nodes:[
      { label:'Avaliação inicial', children:['Espermograma (2×, OMS)','História e exame','Volume testicular, varicocele'] },
      { label:'Classificação', children:[
        {label:'Pré-testicular (endócrina)', children:['Hipogonadismo secundário']},
        {label:'Testicular', children:['Klinefelter, varicocele','QT/RT, idiopática']},
        {label:'Pós-testicular', children:['Obstrução / CFTR']} ]},
      { label:'Azoospermia', children:[
        {label:'Obstrutiva', children:['FSH e testículo normais']},
        {label:'Não obstrutiva', children:['FSH alto, testículo pequeno','Cariótipo, microdeleção Y']} ]},
      { label:'Tratamento', children:[
        {label:'Secundário → gonadotrofinas'},
        {label:'Varicocelectomia selecionada'},
        {label:'ICSI / TESE'} ]}
    ]},
  flashcards:[
    {q:'Como se diferencia azoospermia obstrutiva de não obstrutiva?',a:'Na obstrutiva o FSH e o volume testicular são normais (a produção existe, mas há bloqueio da via); na não obstrutiva o FSH está elevado e os testículos são pequenos (falência da espermatogênese), indicando investigação genética.'},
    {q:'Quais exames genéticos se pedem na azoospermia/oligozoospermia grave?',a:'Cariótipo (Klinefelter), pesquisa de microdeleções do cromossomo Y e, quando há ausência de deferentes, mutações do gene CFTR.'},
    {q:'Por que não se trata a infertilidade por hipogonadismo secundário com testosterona?',a:'Porque a testosterona exógena suprime as gonadotrofinas e a espermatogênese; usa-se hCG (associado ou não a FSH) para estimular a produção testicular própria.'},
    {q:'Como se faz a avaliação inicial da infertilidade masculina?',a:'Com espermograma em duas amostras (2–7 dias de abstinência) segundo os parâmetros da OMS, associado a história (criptorquidia, caxumba, quimioterapia, anabolizantes) e exame físico (volume testicular, varicocele, deferentes).'},
    {q:'Qual o papel da varicocele na infertilidade e quando corrigir?',a:'A varicocele pode prejudicar a espermatogênese; a varicocelectomia é considerada em casos selecionados (varicocele palpável com alteração seminal e infertilidade), não em todos.'}
  ],
  fluxogramas:[{ titulo:'Investigação da infertilidade masculina', fonte:'Algoritmo baseado em revisões e consensos, adaptado ao português', nos:[
    {tipo:'inicio', texto:'Casal infértil → espermograma do homem (2 amostras, OMS) + história e exame'},
    {tipo:'decisao', texto:'Espermograma alterado (oligo/azoospermia)?', ramos:[
      {rotulo:'NÃO', tipo:'fim', texto:'Fator masculino pouco provável — seguir investigação da parceira'},
      {rotulo:'SIM', tipo:'acao', texto:'Dosar FSH, LH e testosterona (± prolactina)'} ]},
    {tipo:'decisao', texto:'FSH/LH baixos (hipogonadismo secundário)?', ramos:[
      {rotulo:'SIM', tipo:'fim', texto:'Tratar com gonadotrofinas (hCG/FSH); investigar hipófise'},
      {rotulo:'NÃO', tipo:'acao', texto:'Testicular/obstrutiva → cariótipo, microdeleção do Y, CFTR conforme o caso'} ]},
    {tipo:'fim', texto:'Conduzir: varicocelectomia selecionada; recuperação espermática (TESE) e ICSI conforme padrão'}
  ]}]
},
// 5 ─ Disfunção erétil ─────────────────────────────────────────────────────
{ sub:'Endocrinologia Masculina', privado:true, titulo:'', ano:'2026', url:'',
  tema:'Disfunção Erétil', fonte:FONTE,
  resumo:`## Conceito
Incapacidade **persistente** de obter/manter ereção suficiente para atividade sexual satisfatória. É **marcador precoce de doença cardiovascular** (disfunção endotelial) — a avaliação do risco CV é parte do manejo.

## Causas
- **Vascular** (a mais comum orgânica): aterosclerose, **diabetes**, hipertensão, dislipidemia, tabagismo, obesidade.
- **Neurogênica:** neuropatia diabética, lesão medular, **pós-prostatectomia**.
- **Hormonal:** hipogonadismo, hiperprolactinemia, disfunção tireoidiana.
- **Psicogênica:** ansiedade de desempenho, depressão.
- **Farmacológica:** anti-hipertensivos (tiazídicos, betabloqueadores), antidepressivos, antiandrogênios.

## Avaliação
- **História** distingue padrões: início **súbito**, situacional, com **ereções matinais/noturnas preservadas** → sugere **psicogênico**; início **gradual e progressivo** → **orgânico**.
- Rastrear **fatores cardiovasculares** e revisar fármacos; exame (genital, pulsos, sinais de hipogonadismo).
- Laboratório: **glicemia/HbA1c, perfil lipídico, testosterona total matinal** (± prolactina e TSH se indicados).

## Tratamento
- **Estilo de vida** e controle dos fatores CV (fundamental); ajustar fármacos culpados; **tratar hipogonadismo** (a testosterona melhora a resposta aos inibidores da PDE5).
- **1ª linha: inibidores da PDE5** (sildenafila, tadalafila) — **contraindicados com nitratos** (hipotensão grave) e cautela com α-bloqueadores.
- **2ª linha:** injeção intracavernosa (alprostadil), dispositivo de vácuo.
- **Refratário:** **prótese peniana**. Encaminhar para avaliação cardiovascular.

## 📊 Disfunção erétil orgânica × psicogênica
| Característica | Orgânica | Psicogênica |
| --- | --- | --- |
| Início | Gradual, progressivo | Súbito |
| Ereções matinais/noturnas | Reduzidas/ausentes | Preservadas |
| Situação | Todas as situações | Situacional |
| Fatores associados | DM, HAS, tabagismo | Ansiedade, relacionamento |
| Conduta | Fatores CV + PDE5 | Apoio psicológico + PDE5 |`,
  pts:[
    'Disfunção erétil é a incapacidade persistente de obter/manter ereção; é marcador precoce de doença cardiovascular.',
    'A causa orgânica mais comum é a vascular (diabetes, hipertensão, dislipidemia, tabagismo).',
    'Outras causas: neurogênica (pós-prostatectomia, neuropatia), hormonal, psicogênica e farmacológica.',
    'Início súbito com ereções matinais preservadas sugere causa psicogênica.',
    'Início gradual e progressivo, em todas as situações, sugere causa orgânica.',
    'Avaliar fatores cardiovasculares e revisar fármacos (anti-hipertensivos, antidepressivos).',
    'Laboratório: glicemia/HbA1c, lipídeos e testosterona total matinal (± prolactina, TSH).',
    'Base do tratamento: estilo de vida, controle de fatores CV e tratamento do hipogonadismo.',
    'Primeira linha: inibidores da PDE5, contraindicados com nitratos.',
    'Segunda linha: injeção intracavernosa/vácuo; refratário: prótese peniana; encaminhar avaliação CV.'
  ],
  mapa:{ central:'Disfunção erétil',
    nodes:[
      { label:'Causas', children:[
        {label:'Vascular (+ comum)', children:['DM, HAS, tabagismo']},
        {label:'Neurogênica', children:['Pós-prostatectomia']},
        {label:'Hormonal', children:['Hipogonadismo, prolactina']},
        {label:'Psicogênica'},
        {label:'Fármacos'} ]},
      { label:'Avaliação', children:[
        {label:'História (padrão)', children:['Matinais preservadas → psicogênico']},
        {label:'Fatores CV / fármacos'},
        {label:'Labs', children:['Glicemia, lipídeos','Testosterona matinal']} ]},
      { label:'Tratamento', children:[
        {label:'Estilo de vida + fatores CV'},
        {label:'Tratar hipogonadismo'},
        {label:'PDE5 (não com nitrato)'},
        {label:'Intracavernoso / vácuo → prótese'} ]}
    ]},
  flashcards:[
    {q:'Por que a disfunção erétil é considerada um marcador de risco cardiovascular?',a:'Porque reflete disfunção endotelial e frequentemente antecede eventos coronarianos; sua presença justifica rastrear e tratar fatores de risco cardiovascular e, muitas vezes, encaminhar para avaliação cardiológica.'},
    {q:'Como a história diferencia disfunção erétil orgânica de psicogênica?',a:'A orgânica tem início gradual, ocorre em todas as situações e cursa com redução das ereções matinais/noturnas; a psicogênica tem início súbito, é situacional e preserva as ereções matinais.'},
    {q:'Qual a primeira linha de tratamento e sua principal contraindicação?',a:'Os inibidores da PDE5 (sildenafila, tadalafila), contraindicados em uso de nitratos pelo risco de hipotensão grave, com cautela também em associação a α-bloqueadores.'},
    {q:'Qual a relação entre testosterona e resposta ao tratamento da disfunção erétil?',a:'No homem com hipogonadismo, corrigir a testosterona melhora a libido e a resposta aos inibidores da PDE5; por isso a testosterona total matinal faz parte da avaliação.'},
    {q:'Quais as opções após falha dos inibidores da PDE5?',a:'Segunda linha com injeção intracavernosa de alprostadil ou dispositivo de vácuo e, nos casos refratários, a prótese peniana.'}
  ],
  fluxogramas:[{ titulo:'Abordagem da disfunção erétil', fonte:'Algoritmo baseado em revisões e consensos, adaptado ao português', nos:[
    {tipo:'inicio', texto:'Queixa de disfunção erétil → história (padrão), fatores CV, fármacos e labs (testosterona, glicemia, lipídeos)'},
    {tipo:'acao', texto:'Otimizar estilo de vida e fatores CV; ajustar fármacos culpados; tratar hipogonadismo se presente'},
    {tipo:'decisao', texto:'Sem contraindicação a inibidor da PDE5 (não usa nitrato)?', ramos:[
      {rotulo:'SIM', tipo:'acao', texto:'Iniciar inibidor da PDE5 (sildenafila/tadalafila)'},
      {rotulo:'NÃO', tipo:'acao', texto:'Evitar PDE5 → considerar 2ª linha diretamente'} ]},
    {tipo:'decisao', texto:'Resposta adequada?', ramos:[
      {rotulo:'SIM', tipo:'fim', texto:'Manter; seguir controle cardiovascular'},
      {rotulo:'NÃO', tipo:'fim', texto:'2ª linha: injeção intracavernosa/vácuo → prótese peniana se refratário'} ]}
  ]}]
}
];

// ── SQL (2 lotes) ──
const fs=require('fs');
function mkSql(arr){const j=JSON.stringify(arr);if(j.indexOf('$j$')>=0)throw new Error('$j$');return `UPDATE endodirect_global_state\nSET payload = jsonb_set(payload, '{diretrizes}', coalesce(payload->'diretrizes','[]'::jsonb) || $j$${j}$j$::jsonb)\nWHERE payload ? 'diretrizes';`;}
const b1=R.slice(0,3), b2=R.slice(3);
fs.writeFileSync(__dirname+'/masc1.sql', mkSql(b1));
fs.writeFileSync(__dirname+'/masc2.sql', mkSql(b2));
R.forEach(r=>{ (r.resumo.split('\n').filter(l=>l.trim().startsWith('|'))).forEach(l=>{ l.split('|').slice(1,-1).forEach(c=>{ if(c.trim()==='')throw new Error('célula vazia em '+r.tema); }); }); });
console.log('Masculina:', R.length, 'resumos | lotes', b1.length+'+'+b2.length);
R.forEach((r,i)=>console.log('  '+(i+1)+'.', r.tema, '[pts '+r.pts.length+' fc '+r.flashcards.length+' flux '+r.fluxogramas.length+']'));
