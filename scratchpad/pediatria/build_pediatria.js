// Resumos de Endocrinologia Pediátrica (privados) — síntese própria (não reproduz
// livros); cobertura Sperling/Nelson Ped Endocrinology + Vilar + ISPAD/ESPE.
// Cada um: resumo md (com tabela) + 10 pts + mapa 3 níveis + 5 flashcards +
// fluxograma fiel ao algoritmo da diretriz. fonte distinta → chave de merge nova.
// ⚠️ sub tem acento ("Pediátrica"): normaliza p/ NFC (lição do clobber Lípides).
const SUB='Endocrinologia Pediátrica'.normalize('NFC');
const FONTE='Síntese Endodirect · Sperling Ped Endocrinology + Vilar + ISPAD/ESPE';
const R=[

// 1 ─ Baixa estatura e deficiência de GH ────────────────────────────────────
{ sub:SUB, privado:true, titulo:'', ano:'2026', url:'',
  tema:'Baixa Estatura e Deficiência de GH', fonte:FONTE,
  resumo:`## Definição e avaliação
**Baixa estatura** = altura **< −2 desvios-padrão** (abaixo do percentil ~2,5) para idade/sexo **ou** **velocidade de crescimento baixa** (queda de canal na curva). Avaliar sempre: **curva de crescimento** seriada, **alvo genético** (estatura-alvo dos pais), **velocidade de crescimento**, **idade óssea** (radiografia de mão/punho) e estágio puberal.

## Variantes normais (não patológicas)
- **Baixa estatura familiar:** pais baixos, **idade óssea = idade cronológica**, velocidade normal, previsão dentro do alvo.
- **Retardo constitucional do crescimento e puberdade:** **idade óssea atrasada**, puberdade tardia, história familiar de "amadurecimento tardio" — prognóstico final normal.

## Causas patológicas
- **Proporcionada:** doenças crônicas (celíaca, DRC, cardiopatia), **desnutrição**, **hipotireoidismo**, **Cushing** (baixo E ganho de peso), **deficiência de GH**, privação psicossocial.
- **Desproporcionada:** displasias esqueléticas, **raquitismo**.
- **Síndrômicas:** **Turner (toda menina baixa → cariótipo!)**, Prader-Willi, Noonan, SHOX.

## Deficiência de GH
Diagnóstico: **IGF-1/IGFBP-3 baixos** + **dois testes de estímulo de GH** (resposta insuficiente; usar priming se pré-púbere) + **RM de hipófise** (excluir lesão). Pode ser congênita ou adquirida (tumor, irradiação).

## Tratamento
**GH recombinante** nas indicações aprovadas: deficiência de GH, **Turner**, **PIG sem catch-up**, Prader-Willi, DRC, **SHOX**, Noonan e baixa estatura idiopática (selecionados). Tratar a causa de base (repor tiroxina, dieta, etc.).

## 📊 Baixa estatura: variante normal × patológica
| Pista | Variante normal | Patológica |
| --- | --- | --- |
| Velocidade de crescimento | Normal | Baixa (cruza canais) |
| Idade óssea | = cronológica (familiar) / atrasada (constitucional) | Variável |
| Proporção corporal | Normal | Pode ser desproporcionada |
| Sinais de doença | Ausentes | Presentes |
| Conduta | Observar | Investigar/tratar |`,
  pts:[
    'Baixa estatura: altura < −2 DP para idade/sexo ou velocidade de crescimento baixa.',
    'Avaliar curva seriada, alvo genético, velocidade de crescimento, idade óssea e puberdade.',
    'Baixa estatura familiar: pais baixos, idade óssea = cronológica, previsão no alvo.',
    'Retardo constitucional: idade óssea atrasada, puberdade tardia, prognóstico final normal.',
    'Causas patológicas: doenças crônicas, desnutrição, hipotireoidismo, Cushing, deficiência de GH.',
    'Cushing causa baixa estatura COM ganho de peso (obesidade que não cresce em altura).',
    'Toda menina com baixa estatura deve fazer cariótipo para excluir síndrome de Turner.',
    'Deficiência de GH: IGF-1/IGFBP-3 baixos + dois testes de estímulo + RM de hipófise.',
    'GH recombinante é indicado em def de GH, Turner, PIG sem catch-up, Prader-Willi, DRC, SHOX e Noonan.',
    'Sempre tratar a causa de base (tiroxina no hipotireoidismo, dieta na desnutrição).'],
  mapa:{ central:'Baixa estatura', nodes:[
    {label:'Avaliação', children:['Curva + velocidade','Alvo genético','Idade óssea']},
    {label:'Variantes normais', children:[
      {label:'Familiar (IO = cronológica)'},
      {label:'Constitucional (IO atrasada)'}]},
    {label:'Patológica', children:[
      {label:'Proporcionada',children:['Crônicas, desnutrição','Hipotireoidismo, Cushing','Deficiência de GH']},
      {label:'Desproporcionada (displasia/raquitismo)'},
      {label:'Turner → cariótipo'}]},
    {label:'Def de GH', children:['IGF-1 baixo','2 testes de estímulo','RM hipófise → GH rhGH']}]},
  flashcards:[
    {q:'Como se define baixa estatura e o que se avalia inicialmente?',a:'Altura abaixo de −2 desvios-padrão para idade e sexo ou velocidade de crescimento reduzida; avalia-se a curva de crescimento seriada, o alvo genético dos pais, a velocidade de crescimento, a idade óssea (radiografia de mão/punho) e o estágio puberal.'},
    {q:'Como diferenciar baixa estatura familiar de retardo constitucional?',a:'Na familiar os pais são baixos e a idade óssea é igual à cronológica (previsão dentro do alvo); no retardo constitucional a idade óssea está atrasada, a puberdade é tardia e há história familiar de amadurecimento tardio, com estatura final normal.'},
    {q:'Por que toda menina com baixa estatura deve fazer cariótipo?',a:'Para excluir a síndrome de Turner (45,X), que frequentemente se apresenta apenas com baixa estatura, mesmo sem os sinais dismórficos clássicos.'},
    {q:'Como se confirma a deficiência de GH?',a:'Com IGF-1 e IGFBP-3 baixos associados a resposta insuficiente em dois testes de estímulo de GH (com priming se pré-púbere), complementados por RM de hipófise para excluir lesão estrutural.'},
    {q:'Qual achado sugere causa endócrina (e não exógena) em criança obesa e baixa?',a:'A combinação de ganho de peso com baixa estatura/velocidade de crescimento reduzida sugere causa endócrina (hipotireoidismo, Cushing, deficiência de GH); a criança obesa e alta costuma ter obesidade exógena.'}],
  fluxogramas:[{ titulo:'Investigação da baixa estatura', fonte:'Algoritmo baseado nos consensos da Growth Hormone Research Society / ESPE, adaptado ao português', nos:[
    {tipo:'inicio', texto:'Baixa estatura (< −2 DP) ou velocidade baixa → curva, alvo genético, idade óssea, exames de triagem'},
    {tipo:'decisao', texto:'Velocidade de crescimento normal e sem sinais de doença?', ramos:[
      {rotulo:'SIM', tipo:'fim', texto:'Provável variante normal (familiar/constitucional) → observar e reavaliar'},
      {rotulo:'NÃO', tipo:'acao', texto:'Investigar: tireoide, celíaca, função renal; cariótipo em toda menina'} ]},
    {tipo:'decisao', texto:'IGF-1 baixo com causas afastadas?', ramos:[
      {rotulo:'SIM', tipo:'fim', texto:'Testes de estímulo de GH + RM de hipófise → GH recombinante se confirmado'},
      {rotulo:'NÃO', tipo:'fim', texto:'Tratar a causa identificada; considerar rhGH nas indicações (Turner, PIG, SHOX...)'} ]}
  ]}]
},

// 2 ─ Puberdade precoce ─────────────────────────────────────────────────────
{ sub:SUB, privado:true, titulo:'', ano:'2026', url:'',
  tema:'Puberdade Precoce', fonte:FONTE,
  resumo:`## Definição
Aparecimento de caracteres sexuais secundários **antes dos 8 anos na menina** e **antes dos 9 anos no menino**. Acelera a idade óssea → risco de **baixa estatura final** e impacto psicossocial.

## Central (verdadeira, dependente de GnRH)
Ativação precoce do **eixo hipotálamo-hipófise-gonadal** → puberdade **isossexual e progressiva**. **LH puberal** (basal/pós-estímulo de GnRH). Causas: **idiopática** (maioria nas meninas), **lesões do SNC** (hamartoma hipotalâmico, tumor, hidrocefalia, irradiação) — **mais preocupante e mais comum como orgânica no menino**.

## Periférica (pseudopuberdade, independente de GnRH)
Esteroides sexuais **sem** ativação central → **LH suprimido**. Causas: **HAC**, tumores (adrenal, gonadal, produtores de hCG), **cistos ovarianos**, **síndrome de McCune-Albright** (+ manchas café com leite, displasia óssea), exposição a esteroides exógenos, hipotireoidismo grave (Van Wyk-Grumbach). Pode ser **isossexual ou contrassexual**.

## Avaliação
**Idade óssea** (avançada), **LH basal e pós-GnRH**, estradiol/testosterona, **US pélvico** (menina), **RM de crânio** (obrigatória no menino e nas centrais), TSH; 17-OHP e andrógenos se suspeita periférica.

## Tratamento
- **Central:** **análogo de GnRH** (leuprolida) — freia a progressão, preserva a **estatura final** e alivia o impacto psicossocial; tratar lesão do SNC.
- **Periférica:** **tratar a causa** (HAC, tumor); bloqueadores esteroidogênicos/antiandrogênios conforme a etiologia.
- **Variantes benignas** (telarca/pubarca isolada, sem progressão nem avanço ósseo): só observar.

## 📊 Puberdade precoce central × periférica
| Característica | Central (GnRH-dependente) | Periférica (GnRH-independente) |
| --- | --- | --- |
| Eixo | Ativado | Não ativado |
| LH (basal/pós-GnRH) | Puberal (elevado) | Suprimido |
| Progressão | Isossexual, ordenada | Iso ou contrassexual |
| Causas | Idiopática, lesão SNC | HAC, tumor, McCune-Albright |
| Tratamento | Análogo de GnRH | Tratar a causa |`,
  pts:[
    'Puberdade precoce: caracteres antes de 8 anos (menina) ou 9 anos (menino).',
    'Central (verdadeira): ativação do eixo, LH puberal, isossexual e progressiva.',
    'Central é idiopática na maioria das meninas; no menino, investigar lesão do SNC (mais orgânica).',
    'Periférica (pseudopuberdade): esteroides sem ativação central, LH suprimido.',
    'Causas periféricas: HAC, tumores, McCune-Albright, exposição exógena.',
    'McCune-Albright: puberdade precoce + manchas café com leite + displasia fibrosa óssea.',
    'Avaliação: idade óssea, LH basal/pós-GnRH, esteroides sexuais, US pélvico, RM de crânio.',
    'RM de crânio é obrigatória no menino e nas formas centrais.',
    'Tratamento central: análogo de GnRH (leuprolida) para preservar a estatura final.',
    'Periférica trata-se a causa; variantes benignas (telarca isolada) só se observam.'],
  mapa:{ central:'Puberdade precoce', nodes:[
    {label:'Definição', children:['< 8 anos menina','< 9 anos menino','Avança idade óssea']},
    {label:'Central (GnRH-dep)', children:[
      {label:'LH puberal'},
      {label:'Idiopática (meninas)'},
      {label:'Lesão SNC (meninos)'}]},
    {label:'Periférica (GnRH-indep)', children:[
      {label:'LH suprimido'},
      {label:'HAC / tumor'},
      {label:'McCune-Albright'}]},
    {label:'Avaliação', children:['Idade óssea','LH pós-GnRH','US pélvico / RM crânio']},
    {label:'Tratamento', children:[
      {label:'Central → análogo de GnRH'},
      {label:'Periférica → tratar causa'}]}]},
  flashcards:[
    {q:'Como se diferencia puberdade precoce central de periférica?',a:'Na central (dependente de GnRH) o eixo hipotálamo-hipófise está ativado e o LH é puberal (basal ou após estímulo de GnRH); na periférica (independente de GnRH) há esteroides sexuais com LH suprimido, por produção autônoma (HAC, tumor, McCune-Albright).'},
    {q:'Por que a puberdade precoce central preocupa mais no menino?',a:'Porque, ao contrário das meninas (em que é majoritariamente idiopática), no menino há maior chance de causa orgânica do sistema nervoso central, tornando a RM de crânio obrigatória.'},
    {q:'O que caracteriza a síndrome de McCune-Albright?',a:'A tríade de puberdade precoce periférica, manchas café com leite (de bordas irregulares) e displasia fibrosa óssea poliostótica, por mutação ativadora de GNAS.'},
    {q:'Qual o tratamento da puberdade precoce central e seu objetivo?',a:'O análogo de GnRH (por exemplo, leuprolida), que dessensibiliza a hipófise e freia a progressão puberal, preservando a estatura final e reduzindo o impacto psicossocial; trata-se também eventual lesão do SNC.'},
    {q:'Quando a puberdade precoce é uma variante benigna que só se observa?',a:'Na telarca ou pubarca isolada sem progressão, sem aceleração da velocidade de crescimento nem avanço significativo da idade óssea — situações que apenas se acompanham.'}],
  fluxogramas:[{ titulo:'Abordagem da puberdade precoce', fonte:'Algoritmo baseado em consensos ESPE/Endocrine Society de puberdade precoce, adaptado ao português', nos:[
    {tipo:'inicio', texto:'Caracteres < 8a (menina) / < 9a (menino) → idade óssea, LH basal/pós-GnRH, esteroides sexuais'},
    {tipo:'decisao', texto:'LH puberal (eixo ativado)?', ramos:[
      {rotulo:'SIM', tipo:'acao', texto:'Central → RM de crânio (obrigatória no menino) → análogo de GnRH'},
      {rotulo:'NÃO (LH suprimido)', tipo:'acao', texto:'Periférica → esteroides sexuais, 17-OHP, US/imagem (excluir HAC, tumor, McCune-Albright)'} ]},
    {tipo:'decisao', texto:'Progressão rápida com avanço da idade óssea?', ramos:[
      {rotulo:'SIM', tipo:'fim', texto:'Tratar (GnRH análogo central / causa na periférica)'},
      {rotulo:'NÃO', tipo:'fim', texto:'Variante benigna (telarca/pubarca isolada) → observar e reavaliar'} ]}
  ]}]
},

// 3 ─ Atraso puberal ────────────────────────────────────────────────────────
{ sub:SUB, privado:true, titulo:'', ano:'2026', url:'',
  tema:'Atraso Puberal', fonte:FONTE,
  resumo:`## Definição
Ausência de caracteres sexuais secundários aos **13 anos na menina** e aos **14 anos no menino** (ou puberdade que não progride).

## Causas
- **Retardo constitucional do crescimento e puberdade (o mais comum, sobretudo em meninos):** variante **normal** — idade óssea atrasada, história familiar de "amadurecimento tardio"; puberdade ocorrerá espontaneamente.
- **Hipogonadismo hipogonadotrófico (central; LH/FSH baixos):** **Kallmann** (+ anosmia), lesão/tumor do SNC, **doença crônica/desnutrição/exercício/transtorno alimentar** (funcional), hiperprolactinemia, pan-hipopituitarismo.
- **Hipogonadismo hipergonadotrófico (gonadal; LH/FSH altos):** **Turner** (menina), **Klinefelter** (menino), falência gonadal (quimio/radioterapia, autoimune).

## Avaliação
**Idade óssea**, **LH/FSH**, **testosterona/estradiol**, **cariótipo** (hipergonadotrófico), prolactina, função tireoidiana e triagem de doença crônica/celíaca; **RM de hipófise** se central com suspeita de lesão. **Olfato** (Kallmann).

## Tratamento
- **Retardo constitucional:** tranquilizar; se grande impacto psicossocial, **curso curto de esteroide sexual em baixa dose** para iniciar a puberdade.
- **Hipogonadismo permanente:** **reposição de esteroides sexuais em doses crescentes** (testosterona/estrogênio), imitando a progressão fisiológica; tratar a causa.

## 📊 Diferenciação do atraso puberal
| Eixo (LH/FSH) | Grupo | Exemplos |
| --- | --- | --- |
| Baixo/normal + idade óssea atrasada | Constitucional (variante normal) | "Late bloomer" |
| Baixo | Hipogonadotrófico (central) | Kallmann, funcional, tumor |
| Elevado | Hipergonadotrófico (gonadal) | Turner, Klinefelter, falência |`,
  pts:[
    'Atraso puberal: sem caracteres aos 13 anos (menina) ou 14 anos (menino).',
    'O retardo constitucional é a causa mais comum, sobretudo em meninos, e é variante normal.',
    'No retardo constitucional a idade óssea está atrasada e há história familiar de amadurecimento tardio.',
    'Hipogonadismo hipogonadotrófico (central): LH/FSH baixos — Kallmann, funcional, lesão do SNC.',
    'Kallmann associa hipogonadismo central a anosmia/hiposmia.',
    'Hipogonadismo hipergonadotrófico (gonadal): LH/FSH altos — Turner e Klinefelter.',
    'Avaliação: idade óssea, LH/FSH, esteroides sexuais, cariótipo e prolactina.',
    'Cariótipo é essencial nas formas hipergonadotróficas (Turner/Klinefelter).',
    'Retardo constitucional: tranquilizar; curso curto de baixa dose se grande impacto.',
    'Hipogonadismo permanente: repor esteroides sexuais em doses crescentes.'],
  mapa:{ central:'Atraso puberal', nodes:[
    {label:'Definição', children:['Sem caracteres 13a menina','14a menino']},
    {label:'Constitucional', children:['Variante normal','Idade óssea atrasada','História familiar']},
    {label:'Central (LH/FSH baixo)', children:[
      {label:'Kallmann (+ anosmia)'},
      {label:'Funcional (crônica/nutrição)'},
      {label:'Tumor / prolactina'}]},
    {label:'Gonadal (LH/FSH alto)', children:[
      {label:'Turner (menina)'},
      {label:'Klinefelter (menino)'}]},
    {label:'Tratamento', children:[
      {label:'Constitucional → observar/baixa dose'},
      {label:'Permanente → repor esteroides'}]}]},
  flashcards:[
    {q:'Como se define atraso puberal?',a:'Ausência de caracteres sexuais secundários aos 13 anos na menina e aos 14 anos no menino, ou puberdade que se inicia mas não progride.'},
    {q:'Qual a causa mais comum de atraso puberal e como reconhecê-la?',a:'O retardo constitucional do crescimento e puberdade, uma variante normal (mais frequente em meninos): idade óssea atrasada, baixa estatura transitória e história familiar de amadurecimento tardio, com puberdade espontânea posterior.'},
    {q:'Como o LH/FSH classifica o hipogonadismo no atraso puberal?',a:'LH/FSH baixos indicam causa central (hipogonadotrófico: Kallmann, funcional, tumor); LH/FSH elevados indicam falência gonadal (hipergonadotrófico: Turner, Klinefelter), que exige cariótipo.'},
    {q:'O que caracteriza a síndrome de Kallmann?',a:'Hipogonadismo hipogonadotrófico congênito (deficiência de GnRH) associado a anosmia ou hiposmia, por defeito na migração dos neurônios de GnRH e do bulbo olfatório.'},
    {q:'Como se trata o hipogonadismo permanente na puberdade?',a:'Com reposição de esteroides sexuais (testosterona no menino, estrogênio e depois estroprogestativo na menina) em doses progressivamente crescentes, imitando a evolução fisiológica da puberdade.'}],
  fluxogramas:[{ titulo:'Investigação do atraso puberal', fonte:'Algoritmo baseado em revisões e consensos de endocrinologia pediátrica, adaptado ao português', nos:[
    {tipo:'inicio', texto:'Atraso puberal → idade óssea, LH/FSH, esteroides sexuais, ± cariótipo/prolactina'},
    {tipo:'decisao', texto:'LH/FSH elevados?', ramos:[
      {rotulo:'SIM', tipo:'fim', texto:'Hipergonadotrófico → cariótipo (Turner/Klinefelter); repor esteroides'},
      {rotulo:'NÃO', tipo:'acao', texto:'LH/FSH baixo/normal → avaliar idade óssea e causas centrais/funcionais'} ]},
    {tipo:'decisao', texto:'Idade óssea atrasada, sem doença, história familiar?', ramos:[
      {rotulo:'SIM', tipo:'fim', texto:'Retardo constitucional → observar (± baixa dose se impacto)'},
      {rotulo:'NÃO', tipo:'fim', texto:'Hipogonadismo central → investigar (RM, prolactina, olfato) e repor esteroides'} ]}
  ]}]
},

// 4 ─ Hipotireoidismo congênito ─────────────────────────────────────────────
{ sub:SUB, privado:true, titulo:'', ano:'2026', url:'',
  tema:'Hipotireoidismo Congênito', fonte:FONTE,
  resumo:`## Importância
É a **causa mais comum de deficiência intelectual prevenível** — daí a **triagem neonatal obrigatória** ("teste do pezinho", TSH ± T4), que permite tratar antes do dano neurológico. O quadro clínico ao nascer costuma ser **sutil** (o diagnóstico clínico já é tardio).

## Etiologia
- **Disgenesia tireoidiana** (a mais comum): **agenesia, hipoplasia ou ectopia** (tireoide lingual).
- **Disormonogênese** (defeitos de síntese hormonal — autossômicos recessivos, podem cursar com bócio).
- **Central** (deficiência de TSH — raro, no hipopituitarismo).
- **Transitório:** excesso/deficiência de iodo, anticorpos maternos, drogas antitireoidianas maternas.

## Quadro clínico (se não tratado)
**Icterícia prolongada**, hipotonia, **macroglossia**, hérnia umbilical, choro rouco, **fontanela posterior ampla**, letargia, dificuldade alimentar, constipação, pele seca/fria, bradicardia; sem tratamento → **cretinismo** (deficiência intelectual, baixa estatura).

## Diagnóstico e tratamento
- Triagem alterada → **confirmar com TSH e T4 livre séricos**; imagem (cintilografia/US) define a etiologia sem atrasar o tratamento.
- **Levotiroxina o mais precoce possível** (idealmente **nas 2 primeiras semanas**), dose inicial **10–15 µg/kg/dia**.
- **Monitorizar** TSH e T4 livre com frequência no 1º ano; manter o T4 na metade superior da normalidade. Os **primeiros 2–3 anos** são críticos para o neurodesenvolvimento.

## 📊 Etiologias do hipotireoidismo congênito
| Categoria | Exemplos | Observação |
| --- | --- | --- |
| Disgenesia | Agenesia, ectopia, hipoplasia | Mais comum; geralmente esporádica |
| Disormonogênese | Defeitos de síntese | Pode dar bócio; recessiva |
| Central | Deficiência de TSH | Parte de hipopituitarismo |
| Transitório | Iodo, anticorpos/drogas maternas | Reavaliar a necessidade de manter |`,
  pts:[
    'Hipotireoidismo congênito é a principal causa de deficiência intelectual prevenível.',
    'A triagem neonatal (teste do pezinho, TSH ± T4) é obrigatória e permite tratar antes do dano.',
    'O quadro clínico ao nascer é sutil — o diagnóstico clínico já seria tardio.',
    'A causa mais comum é a disgenesia tireoidiana (agenesia, hipoplasia ou ectopia).',
    'A disormonogênese pode cursar com bócio e é autossômica recessiva.',
    'Formas transitórias: excesso/falta de iodo, anticorpos e drogas antitireoidianas maternas.',
    'Sinais se não tratado: icterícia prolongada, macroglossia, hérnia umbilical, hipotonia, letargia.',
    'Confirmar a triagem alterada com TSH e T4 livre séricos.',
    'Tratar com levotiroxina precoce (idealmente até 2 semanas), 10–15 µg/kg/dia.',
    'Os primeiros 2–3 anos são críticos; monitorar TSH/T4 e manter T4 na metade superior.'],
  mapa:{ central:'Hipotireoidismo congênito', nodes:[
    {label:'Importância', children:['Deficiência intelectual prevenível','Triagem neonatal obrigatória','Clínica sutil ao nascer']},
    {label:'Etiologia', children:[
      {label:'Disgenesia (+ comum)',children:['Agenesia, ectopia']},
      {label:'Disormonogênese (bócio)'},
      {label:'Central (raro)'},
      {label:'Transitório (iodo/materno)'}]},
    {label:'Clínica (se não tratado)', children:['Icterícia prolongada','Macroglossia, hérnia umbilical','Hipotonia, letargia']},
    {label:'Tratamento', children:[
      {label:'Levotiroxina precoce (< 2 sem)'},
      {label:'10–15 µg/kg/dia'},
      {label:'Monitorar TSH/T4 (1º ano)'}]}]},
  flashcards:[
    {q:'Por que a triagem neonatal do hipotireoidismo congênito é obrigatória?',a:'Porque é a principal causa de deficiência intelectual prevenível e o quadro clínico ao nascer é sutil; a triagem (teste do pezinho, TSH ± T4) permite iniciar o tratamento antes que ocorra dano neurológico irreversível.'},
    {q:'Qual a causa mais comum de hipotireoidismo congênito?',a:'A disgenesia tireoidiana — agenesia, hipoplasia ou ectopia (por exemplo, tireoide lingual) —, geralmente esporádica; a disormonogênese (defeitos de síntese) é a segunda e pode cursar com bócio.'},
    {q:'Quais sinais clínicos sugerem hipotireoidismo congênito não tratado?',a:'Icterícia prolongada, macroglossia, hérnia umbilical, hipotonia, choro rouco, fontanela posterior ampla, letargia, dificuldade alimentar e constipação; sem tratamento evolui para cretinismo.'},
    {q:'Como e quando se inicia o tratamento?',a:'Com levotiroxina o mais precocemente possível (idealmente nas duas primeiras semanas de vida), na dose de 10–15 µg/kg/dia, confirmando antes com TSH e T4 livre séricos, sem atrasar o início pela imagem.'},
    {q:'Como se monitora e por quanto tempo é mais crítico?',a:'Monitorando TSH e T4 livre com frequência no primeiro ano (mantendo o T4 na metade superior da normalidade); os primeiros 2–3 anos são os mais críticos para o neurodesenvolvimento.'}],
  fluxogramas:[{ titulo:'Triagem e manejo do hipotireoidismo congênito', fonte:'Algoritmo baseado no consenso ESPE de screening e manejo do hipotireoidismo congênito, adaptado ao português', nos:[
    {tipo:'inicio', texto:'Triagem neonatal (TSH ± T4 no papel-filtro) para todo recém-nascido'},
    {tipo:'decisao', texto:'Triagem alterada (TSH elevado / T4 baixo)?', ramos:[
      {rotulo:'NÃO', tipo:'fim', texto:'Normal — sem ação (repetir se prematuro/coleta precoce)'},
      {rotulo:'SIM', tipo:'acao', texto:'Confirmar com TSH e T4 livre séricos e iniciar levotiroxina sem esperar a imagem'} ]},
    {tipo:'acao', texto:'Levotiroxina 10–15 µg/kg/dia o mais precoce possível; imagem (US/cintilografia) define etiologia'},
    {tipo:'fim', texto:'Monitorar TSH/T4 livre com frequência no 1º ano; reavaliar formas possivelmente transitórias após ~3 anos'}
  ]}]
},

// 5 ─ Hiperplasia adrenal congênita ─────────────────────────────────────────
{ sub:SUB, privado:true, titulo:'', ano:'2026', url:'',
  tema:'Hiperplasia Adrenal Congênita (HAC)', fonte:FONTE,
  resumo:`## Conceito
Grupo de doenças **autossômicas recessivas** por defeito enzimático da esteroidogênese adrenal. A **deficiência de 21-hidroxilase** responde por **> 90%**: ↓cortisol (**± ↓aldosterona**) → ↑ACTH → **hiperplasia** e **desvio dos precursores para andrógenos** → **↑17-OH-progesterona** (marcador).

## Formas clínicas
- **Clássica perdedora de sal:** deficiência grave → **crise adrenal neonatal** (2ª–3ª semana): vômitos, desidratação, **hiponatremia + hipercalemia**, hipoglicemia, choque. Menina: **virilização/genitália ambígua** ao nascer.
- **Clássica virilizante simples:** virilização sem perda de sal.
- **Não clássica (tardia):** parcial — hiperandrogenismo na infância tardia/adolescência (pubarca precoce, hirsutismo, irregularidade menstrual), **sem** perda de sal; diagnóstico às vezes só na vida adulta.

## Diagnóstico
- **Triagem neonatal: 17-OH-progesterona.** Confirmar com 17-OHP basal e **pós-estímulo de ACTH**; eletrólitos e atividade de renina.
- **Menina com genitália ambígua = HAC até prova em contrário** (excluir a perdedora de sal, com risco de vida).

## Tratamento
- **Glicocorticoide** (hidrocortisona na criança) para repor cortisol e frear os andrógenos; **mineralocorticoide (fludrocortisona) + sal** na perdedora.
- **Doses de estresse** em doença/cirurgia (risco de crise adrenal) e educação familiar.
- Cirurgia genital **individualizada/multidisciplinar**; acompanhamento de crescimento, puberdade e fertilidade.

## 📊 Formas da HAC por 21-hidroxilase
| Forma | Perda de sal | Virilização | 17-OHP |
| --- | --- | --- | --- |
| Clássica perdedora de sal | Sim (crise neonatal) | Sim (menina ambígua) | Muito alta |
| Virilizante simples | Não | Sim | Alta |
| Não clássica | Não | Tardia/leve | Elevada pós-ACTH |`,
  pts:[
    'HAC é autossômica recessiva; a deficiência de 21-hidroxilase responde por mais de 90%.',
    'Há queda de cortisol (± aldosterona) e desvio dos precursores para andrógenos.',
    'A 17-OH-progesterona é o marcador e o exame da triagem neonatal.',
    'Forma perdedora de sal: crise adrenal neonatal com hiponatremia e hipercalemia.',
    'Menina clássica nasce com virilização/genitália ambígua; menino pode passar despercebido até a crise.',
    'Forma não clássica (tardia): hiperandrogenismo sem perda de sal, às vezes diagnosticada no adulto.',
    'Confirmar com 17-OHP basal e pós-estímulo de ACTH, além de eletrólitos e renina.',
    'Menina com genitália ambígua é HAC até prova em contrário (excluir perda de sal).',
    'Tratamento: glicocorticoide (hidrocortisona) + fludrocortisona e sal na perdedora.',
    'Ensinar doses de estresse (risco de crise adrenal); cirurgia genital individualizada.'],
  mapa:{ central:'HAC (21-hidroxilase)', nodes:[
    {label:'Fisiopatologia', children:['↓Cortisol ± ↓aldosterona','↑ACTH → hiperplasia','Desvio p/ andrógenos (↑17-OHP)']},
    {label:'Formas', children:[
      {label:'Perdedora de sal',children:['Crise neonatal','Hipo-Na / hiper-K']},
      {label:'Virilizante simples'},
      {label:'Não clássica (tardia)'}]},
    {label:'Diagnóstico', children:['Triagem: 17-OHP','Pós-ACTH','Menina ambígua = HAC']},
    {label:'Tratamento', children:[
      {label:'Hidrocortisona'},
      {label:'Fludrocortisona + sal'},
      {label:'Doses de estresse'}]}]},
  flashcards:[
    {q:'Qual o defeito mais comum na HAC e seu marcador?',a:'A deficiência de 21-hidroxilase (mais de 90% dos casos), que reduz cortisol e aldosterona e desvia os precursores para andrógenos; o marcador diagnóstico é a 17-OH-progesterona elevada.'},
    {q:'Como se apresenta a forma clássica perdedora de sal?',a:'Com crise adrenal na 2ª–3ª semana de vida: vômitos, desidratação, hiponatremia com hipercalemia, hipoglicemia e choque; nas meninas há virilização/genitália ambígua ao nascimento.'},
    {q:'Por que "menina com genitália ambígua é HAC até prova em contrário"?',a:'Porque a HAC é a causa mais comum e potencialmente fatal de ambiguidade genital no recém-nascido (pela perda de sal), exigindo dosar 17-OHP e eletrólitos e iniciar tratamento com urgência.'},
    {q:'Como se trata a HAC clássica?',a:'Com glicocorticoide (hidrocortisona na criança) para repor o cortisol e frear os andrógenos, associado a mineralocorticoide (fludrocortisona) e suplemento de sal na forma perdedora, além de doses de estresse em intercorrências.'},
    {q:'O que caracteriza a forma não clássica da HAC?',a:'Deficiência parcial de 21-hidroxilase com hiperandrogenismo de início tardio (pubarca precoce, hirsutismo, irregularidade menstrual), sem perda de sal; a 17-OHP pode ser normal em jejum e elevar-se após estímulo com ACTH.'}],
  fluxogramas:[{ titulo:'Diagnóstico e manejo da HAC', fonte:'Algoritmo baseado na Endocrine Society Clinical Practice Guideline (HAC por deficiência de 21-hidroxilase, 2018), adaptado ao português', nos:[
    {tipo:'inicio', texto:'Triagem neonatal (17-OHP) alterada e/ou genitália ambígua / crise perdedora de sal'},
    {tipo:'decisao', texto:'Sinais de perda de sal (hiponatremia, hipercalemia, desidratação)?', ramos:[
      {rotulo:'SIM', tipo:'acao', texto:'Emergência: hidrocortisona + soro/sal + fludrocortisona; confirmar 17-OHP e eletrólitos'},
      {rotulo:'NÃO', tipo:'acao', texto:'Confirmar com 17-OHP basal e pós-ACTH; classificar forma'} ]},
    {tipo:'decisao', texto:'Forma clássica?', ramos:[
      {rotulo:'SIM', tipo:'fim', texto:'Glicocorticoide (± fludrocortisona/sal), doses de estresse, seguimento multidisciplinar'},
      {rotulo:'NÃO (não clássica)', tipo:'fim', texto:'Tratar hiperandrogenismo se sintomático; nem sempre requer glicocorticoide contínuo'} ]}
  ]}]
},

// 6 ─ Distúrbios da diferenciação sexual ────────────────────────────────────
{ sub:SUB, privado:true, titulo:'', ano:'2026', url:'',
  tema:'Distúrbios da Diferenciação Sexual (DDS)', fonte:FONTE,
  resumo:`## Conceito
Condições congênitas em que há **discordância entre o sexo cromossômico, gonadal e fenotípico**. A nomenclatura atual (consenso de Chicago) substitui termos antigos.

## Classificação
- **DDS 46,XX:** cariótipo XX com virilização — **causa mais comum: HAC** (excesso de andrógenos); também exposição androgênica materna.
- **DDS 46,XY:** subvirilização de indivíduo XY — **insensibilidade androgênica** (receptor de andrógeno), **deficiência de 5α-redutase** (↓di-hidrotestosterona), defeitos de síntese de testosterona, disgenesia gonadal.
- **DDS por anomalia dos cromossomos sexuais:** **Turner (45,X)**, **Klinefelter (47,XXY)**, **disgenesia gonadal mista (45,X/46,XY)**, DDS ovotesticular.

## Abordagem do recém-nascido com genitália atípica
- **Urgência médica:** **excluir HAC perdedora de sal** (risco de vida) — dosar **17-OHP e eletrólitos**.
- **Não designar o sexo às pressas nem registrar antes da avaliação**; comunicar a família com cuidado.
- **Equipe multidisciplinar** (endocrinologista pediátrico, cirurgião/urologista, geneticista, psicólogo).

## Avaliação
**Cariótipo**, **17-OHP**, **testosterona e precursores** (± estímulo com hCG), **LH/FSH**, **eletrólitos**, imagem (US/gonadal, útero). Decisões sobre gônadas (risco de tumor em algumas disgenesias), designação de sexo e cirurgia são **individualizadas e compartilhadas**.

## 📊 Categorias de DDS
| Cariótipo | Categoria | Exemplos |
| --- | --- | --- |
| 46,XX | DDS 46,XX (virilização) | HAC, androgênio materno |
| 46,XY | DDS 46,XY (subvirilização) | Insensibilidade androgênica, 5α-redutase |
| Anomalia cromossômica | DDS cromossômico | Turner, Klinefelter, 45,X/46,XY |`,
  pts:[
    'DDS são condições com discordância entre sexo cromossômico, gonadal e fenotípico.',
    'A nomenclatura atual (consenso de Chicago) substituiu termos antigos como hermafroditismo.',
    'DDS 46,XX: cariótipo XX virilizado — causa mais comum é a HAC.',
    'DDS 46,XY: XY subvirilizado — insensibilidade androgênica e deficiência de 5α-redutase.',
    'DDS cromossômico: Turner (45,X), Klinefelter (47,XXY), disgenesia mista (45,X/46,XY).',
    'Recém-nascido com genitália atípica: excluir HAC perdedora de sal (emergência).',
    'Não designar o sexo às pressas; avaliação multidisciplinar antes de decisões.',
    'Avaliação: cariótipo, 17-OHP, testosterona/precursores, LH/FSH, eletrólitos e imagem.',
    'Algumas disgenesias gonadais têm risco de tumor (gonadoblastoma) — considerar gonadectomia.',
    'Designação de sexo e cirurgia são individualizadas e compartilhadas com a família.'],
  mapa:{ central:'DDS', nodes:[
    {label:'Conceito', children:['Discordância cromossomo/gônada/fenótipo','Nomenclatura de Chicago']},
    {label:'46,XX', children:['Virilização','HAC (+ comum)']},
    {label:'46,XY', children:[
      {label:'Insensibilidade androgênica'},
      {label:'Def 5α-redutase'},
      {label:'Disgenesia / síntese'}]},
    {label:'Cromossômico', children:['Turner (45,X)','Klinefelter (47,XXY)','45,X/46,XY']},
    {label:'Conduta RN', children:[
      {label:'Excluir HAC (17-OHP, Na/K)'},
      {label:'Não designar às pressas'},
      {label:'Equipe multidisciplinar'}]}]},
  flashcards:[
    {q:'Como se classificam os DDS pela genética?',a:'Em DDS 46,XX (cariótipo XX com virilização, sobretudo por HAC), DDS 46,XY (cariótipo XY subvirilizado, como insensibilidade androgênica e deficiência de 5α-redutase) e DDS por anomalias dos cromossomos sexuais (Turner, Klinefelter, disgenesia gonadal mista 45,X/46,XY).'},
    {q:'Qual a prioridade médica no recém-nascido com genitália atípica?',a:'Excluir a hiperplasia adrenal congênita perdedora de sal (potencialmente fatal), dosando 17-OH-progesterona e eletrólitos, pois é a causa mais comum e mais perigosa de ambiguidade genital.'},
    {q:'Por que não se deve designar o sexo às pressas nesses casos?',a:'Porque a designação exige o diagnóstico etiológico (cariótipo, hormônios, imagem) e uma avaliação multidisciplinar com a família; uma decisão precipitada pode não corresponder ao melhor desfecho para a criança.'},
    {q:'O que é a síndrome de insensibilidade androgênica?',a:'Um DDS 46,XY em que a mutação do receptor de andrógeno impede a ação da testosterona; na forma completa, o fenótipo é feminino externo, com testículos e ausência de útero (derivados müllerianos regridem pelo hormônio antimülleriano).'},
    {q:'Por que algumas disgenesias gonadais exigem atenção oncológica?',a:'Porque gônadas disgenéticas contendo material do cromossomo Y (por exemplo, 45,X/46,XY) têm risco aumentado de gonadoblastoma/tumor de células germinativas, podendo indicar gonadectomia.'}],
  fluxogramas:[{ titulo:'Abordagem do recém-nascido com DDS', fonte:'Algoritmo baseado no Consenso de Chicago (LWPES/ESPE) sobre DDS, adaptado ao português', nos:[
    {tipo:'inicio', texto:'Recém-nascido com genitália atípica → equipe multidisciplinar; cariótipo, 17-OHP, eletrólitos, testosterona, US'},
    {tipo:'decisao', texto:'17-OHP elevada / sinais de perda de sal (HAC)?', ramos:[
      {rotulo:'SIM', tipo:'fim', texto:'DDS 46,XX por HAC → tratar (hidrocortisona ± fludrocortisona); manejo conforme capítulo de HAC'},
      {rotulo:'NÃO', tipo:'acao', texto:'Classificar pelo cariótipo (46,XX / 46,XY / anomalia cromossômica)'} ]},
    {tipo:'fim', texto:'Definir etiologia (hormônios, imagem, genética); designação de sexo e cirurgia individualizadas e compartilhadas; avaliar risco gonadal'}
  ]}]
},

// 7 ─ Obesidade infantil ────────────────────────────────────────────────────
{ sub:SUB, privado:true, titulo:'', ano:'2026', url:'',
  tema:'Obesidade na Infância e Adolescência', fonte:FONTE,
  resumo:`## Definição (curvas de IMC por idade/sexo)
- **Sobrepeso:** IMC entre **percentil 85 e 95**.
- **Obesidade:** IMC **≥ percentil 95**.
Usar as curvas de IMC para idade e sexo (não os pontos de corte do adulto).

## Exógena × endócrina (pista-chave = estatura)
A **grande maioria é exógena** (poligênica + ambiente) e cursa com **estatura normal ou alta** e crescimento adequado. **Suspeitar de causa endócrina quando há BAIXA estatura/velocidade de crescimento reduzida** associada à obesidade: **hipotireoidismo, síndrome de Cushing, deficiência de GH, lesão hipotalâmica**.

## Sindrômica e monogênica
- **Sindrômica:** **Prader-Willi** (hipotonia neonatal, hiperfagia, hipogonadismo), Bardet-Biedl, etc.
- **Monogênica:** **deficiência de leptina/receptor, MC4R** (obesidade grave e precoce).

## Complicações a rastrear
**DM2 e pré-diabetes**, **esteatose hepática**, dislipidemia, **HAS**, **apneia obstrutiva do sono**, **SOP**, problemas ortopédicos (epifisiólise, Blount), e impacto **psicossocial** (bullying, depressão).

## Tratamento
- **Base: mudança de estilo de vida com a família** (alimentação, atividade física, sono, redução de tela) — intervenção comportamental intensiva.
- **Farmacoterapia** (ex.: análogos de GLP-1 aprovados para adolescentes) e **cirurgia metabólica** em **adolescentes selecionados** com obesidade grave e comorbidades.

## 📊 Sinais que apontam causa endócrina/sindrômica
| Achado | Sugere |
| --- | --- |
| Obesidade + baixa estatura | Endócrina (hipotireoidismo, Cushing, def GH) |
| Hiperfagia + hipotonia neonatal | Prader-Willi |
| Obesidade grave < 5 anos + história familiar | Monogênica (MC4R, leptina) |
| Obesidade + estatura normal/alta | Exógena (a mais comum) |`,
  pts:[
    'Sobrepeso: IMC entre percentil 85 e 95; obesidade: IMC ≥ percentil 95 (curvas por idade/sexo).',
    'A grande maioria é exógena (poligênica + ambiental), com estatura normal ou alta.',
    'Suspeitar de causa endócrina quando há obesidade COM baixa estatura.',
    'Causas endócrinas: hipotireoidismo, síndrome de Cushing, deficiência de GH, lesão hipotalâmica.',
    'Prader-Willi: hipotonia neonatal, hiperfagia, hipogonadismo e obesidade.',
    'Formas monogênicas (MC4R, leptina): obesidade grave e de início muito precoce.',
    'Rastrear DM2/pré-diabetes, esteatose, dislipidemia, HAS, apneia do sono e SOP.',
    'Complicações ortopédicas: epifisiólise da cabeça femoral e doença de Blount.',
    'A base do tratamento é a mudança de estilo de vida com a família.',
    'Farmacoterapia (GLP-1) e cirurgia metabólica em adolescentes selecionados com comorbidades.'],
  mapa:{ central:'Obesidade infantil', nodes:[
    {label:'Definição', children:['Sobrepeso: P85–95','Obesidade: ≥ P95','Curvas por idade/sexo']},
    {label:'Exógena (maioria)', children:['Poligênica + ambiente','Estatura normal/alta']},
    {label:'Endócrina (baixa estatura!)', children:['Hipotireoidismo','Cushing','Def GH / hipotalâmica']},
    {label:'Sindrômica/monogênica', children:['Prader-Willi','MC4R, leptina']},
    {label:'Complicações', children:['DM2, esteatose, dislipidemia','HAS, apneia, SOP','Ortopédicas, psicossocial']},
    {label:'Tratamento', children:[
      {label:'Estilo de vida (família)'},
      {label:'GLP-1 / cirurgia (selecionados)'}]}]},
  flashcards:[
    {q:'Como se define sobrepeso e obesidade na criança?',a:'Pelo IMC ajustado para idade e sexo: sobrepeso entre os percentis 85 e 95 e obesidade igual ou acima do percentil 95 — usam-se as curvas pediátricas, não os cortes do adulto.'},
    {q:'Qual pista clínica ajuda a diferenciar obesidade exógena de endócrina?',a:'A estatura: a obesidade exógena (maioria) cursa com estatura normal ou alta; a obesidade com baixa estatura ou velocidade de crescimento reduzida sugere causa endócrina (hipotireoidismo, Cushing, deficiência de GH).'},
    {q:'O que caracteriza a síndrome de Prader-Willi?',a:'Hipotonia e dificuldade alimentar no período neonatal seguidas de hiperfagia e obesidade, com hipogonadismo, baixa estatura e graus variáveis de deficiência intelectual.'},
    {q:'Quais comorbidades rastrear na obesidade pediátrica?',a:'Diabetes tipo 2/pré-diabetes, esteatose hepática, dislipidemia, hipertensão, apneia obstrutiva do sono, síndrome dos ovários policísticos, complicações ortopédicas (epifisiólise, Blount) e impacto psicossocial.'},
    {q:'Qual a base do tratamento e quando escalar?',a:'A base é a mudança intensiva de estilo de vida envolvendo a família; em adolescentes selecionados com obesidade grave e comorbidades consideram-se farmacoterapia (por exemplo, análogos de GLP-1) e cirurgia metabólica.'}],
  fluxogramas:[{ titulo:'Avaliação da obesidade pediátrica', fonte:'Algoritmo baseado na Endocrine Society Clinical Practice Guideline (pediatric obesity, 2017), adaptado ao português', nos:[
    {tipo:'inicio', texto:'IMC ≥ percentil 95 → história, exame, avaliar estatura/velocidade de crescimento'},
    {tipo:'decisao', texto:'Baixa estatura / desaceleração do crescimento ou dismorfismos?', ramos:[
      {rotulo:'SIM', tipo:'acao', texto:'Investigar causa endócrina (TSH, cortisol, GH) ou síndrome (Prader-Willi, monogênica)'},
      {rotulo:'NÃO', tipo:'acao', texto:'Obesidade exógena provável → rastrear comorbidades (glicemia, lipídeos, PA, transaminases)'} ]},
    {tipo:'fim', texto:'Tratar: estilo de vida com a família; farmacoterapia/cirurgia em adolescentes selecionados com comorbidades'}
  ]}]
},

// 8 ─ Raquitismo ────────────────────────────────────────────────────────────
{ sub:SUB, privado:true, titulo:'', ano:'2026', url:'',
  tema:'Raquitismo', fonte:FONTE,
  resumo:`## Conceito
**Mineralização deficiente da placa de crescimento** na criança (na osteomalácia do adulto o osso já formado é afetado). Divide-se pelo distúrbio mineral predominante em **calciopênico** e **fosfopênico**.

## Calciopênico (o mais comum)
- **Deficiência de vitamina D** (baixa exposição solar, pele escura, aleitamento sem suplementação, má absorção) e **baixa ingestão de cálcio**.
- Laboratório típico: **cálcio normal-baixo, fósforo baixo, fosfatase alcalina alta, PTH alto (secundário)**, **25-OH-vitamina D baixa**.
- Formas hereditárias raras: dependente de vitamina D (defeito da 1α-hidroxilase ou do receptor).

## Fosfopênico
- **Perda renal de fosfato** — o protótipo é o **raquitismo hipofosfatêmico ligado ao X** (excesso de **FGF23**): **fósforo baixo, PTH normal, 25-OH-vitamina D normal**.

## Quadro clínico
**Alargamento de punhos e tornozelos**, **rosário raquítico** (junções costocondrais), **pernas arqueadas (genu varum)**/valgo, **craniotabes**, fechamento tardio das fontanelas, atraso de dentição, **baixa estatura**, dor óssea e fraqueza muscular.

## Diagnóstico e tratamento
- **Laboratório** (Ca, P, FA, PTH, 25-OH-D, 1,25) + **radiografia** (metáfises alargadas, **em taça/desfiadas**).
- **Calciopênico:** **vitamina D + cálcio** (repor e depois manter/profilaxia).
- **Hipofosfatêmico:** **fosfato oral + calcitriol** ou **anticorpo anti-FGF23 (burosumabe)**.

## 📊 Raquitismo calciopênico × fosfopênico
| Exame | Calciopênico (vit. D) | Fosfopênico (hipofosfatêmico) |
| --- | --- | --- |
| Cálcio | Normal-baixo | Normal |
| Fósforo | Baixo | Baixo |
| PTH | Alto (secundário) | Normal |
| 25-OH-vitamina D | Baixa | Normal |
| Tratamento | Vitamina D + cálcio | Fosfato + calcitriol / burosumabe |`,
  pts:[
    'Raquitismo é a mineralização deficiente da placa de crescimento na criança.',
    'Divide-se em calciopênico (mais comum) e fosfopênico.',
    'Calciopênico: deficiência de vitamina D e/ou baixa ingestão de cálcio.',
    'Laboratório do calciopênico: fósforo baixo, fosfatase alcalina alta, PTH alto, 25-OH-D baixa.',
    'Fosfopênico: perda renal de fosfato, protótipo é o hipofosfatêmico ligado ao X (FGF23).',
    'No hipofosfatêmico o fósforo é baixo com PTH e vitamina D normais.',
    'Clínica: alargamento de punhos, rosário raquítico, pernas arqueadas, craniotabes, baixa estatura.',
    'A radiografia mostra metáfises alargadas, em taça e desfiadas.',
    'Calciopênico trata-se com vitamina D e cálcio.',
    'Hipofosfatêmico trata-se com fosfato + calcitriol ou anticorpo anti-FGF23 (burosumabe).'],
  mapa:{ central:'Raquitismo', nodes:[
    {label:'Conceito', children:['Placa de crescimento','Criança (vs osteomalácia adulto)']},
    {label:'Calciopênico (+ comum)', children:[
      {label:'Deficiência de vitamina D'},
      {label:'Baixo cálcio'},
      {label:'Labs',children:['P baixo, FA alta','PTH alto, 25-OH-D baixa']}]},
    {label:'Fosfopênico', children:[
      {label:'Perda renal de fosfato'},
      {label:'Hipofosfatêmico ligado ao X (FGF23)'},
      {label:'PTH e vit. D normais'}]},
    {label:'Clínica', children:['Punhos/rosário','Genu varum','Craniotabes, baixa estatura']},
    {label:'Tratamento', children:[
      {label:'Vitamina D + cálcio'},
      {label:'Fosfato + calcitriol / burosumabe'}]}]},
  flashcards:[
    {q:'O que diferencia raquitismo de osteomalácia?',a:'O raquitismo é a mineralização deficiente da placa de crescimento (cartilagem) na criança em crescimento; a osteomalácia afeta o osso já formado e ocorre também no adulto. Frequentemente coexistem na criança.'},
    {q:'Qual o perfil laboratorial do raquitismo por deficiência de vitamina D?',a:'Cálcio normal ou baixo, fósforo baixo, fosfatase alcalina elevada, PTH elevado (hiperparatireoidismo secundário) e 25-hidroxivitamina D baixa.'},
    {q:'Como o raquitismo hipofosfatêmico ligado ao X difere do calciopênico?',a:'É fosfopênico, por perda renal de fosfato mediada por excesso de FGF23: cursa com fósforo baixo, mas PTH normal e 25-hidroxivitamina D normal, ao contrário do calciopênico (PTH alto, vitamina D baixa).'},
    {q:'Quais são os sinais clínicos clássicos do raquitismo?',a:'Alargamento de punhos e tornozelos, rosário raquítico (junções costocondrais), pernas arqueadas (genu varum) ou valgo, craniotabes, fechamento tardio das fontanelas, baixa estatura e fraqueza muscular.'},
    {q:'Como se trata cada tipo de raquitismo?',a:'O calciopênico com vitamina D e cálcio (reposição e depois manutenção/profilaxia); o hipofosfatêmico com fosfato oral associado a calcitriol ou com o anticorpo anti-FGF23 (burosumabe).'}],
  fluxogramas:[{ titulo:'Investigação do raquitismo', fonte:'Algoritmo baseado no Global Consensus Recommendations on Prevention and Management of Nutritional Rickets (2016), adaptado ao português', nos:[
    {tipo:'inicio', texto:'Sinais clínicos/radiológicos de raquitismo → Ca, P, fosfatase alcalina, PTH, 25-OH-vitamina D; radiografia'},
    {tipo:'decisao', texto:'PTH alto com 25-OH-vitamina D baixa?', ramos:[
      {rotulo:'SIM', tipo:'fim', texto:'Calciopênico (deficiência de vitamina D/cálcio) → vitamina D + cálcio'},
      {rotulo:'NÃO', tipo:'acao', texto:'Fósforo baixo com PTH/vitamina D normais → avaliar perda renal de fosfato'} ]},
    {tipo:'fim', texto:'Hipofosfatêmico (FGF23/ligado ao X) → fosfato + calcitriol ou burosumabe; investigar forma hereditária'}
  ]}]
},

// 9 ─ Diabetes na criança e no adolescente ──────────────────────────────────
{ sub:SUB, privado:true, titulo:'', ano:'2026', url:'',
  tema:'Diabetes na Criança e no Adolescente', fonte:FONTE,
  resumo:`## Panorama
O **DM1** é o tipo mais comum na infância; o **DM2** cresce com a obesidade. É preciso **diferenciar DM1, DM2 e MODY** (monogênico), pois o tratamento difere.

## Diferenciação
- **DM1:** autoimune, magro, **autoanticorpos positivos**, peptídeo C baixo, tendência à cetose; pode **abrir com cetoacidose**.
- **DM2:** sobrepeso/obesidade, **acantose nigricans**, história familiar, sem autoanticorpos, peptídeo C normal/alto.
- **MODY:** história familiar em várias gerações (autossômico dominante), início jovem, sem autoanticorpos, quadro leve.

## Apresentação e diagnóstico
Poliúria, polidipsia, **perda de peso**, enurese recente; **até ~1/3 abre com CAD**. Critérios diagnósticos glicêmicos são os mesmos do adulto; **dosar autoanticorpos e peptídeo C** ajuda a classificar.

## Tratamento do DM1
- **Insulina basal-bólus** (múltiplas doses) ou **bomba**, idealmente com **CGM**; **contagem de carboidratos** e educação intensiva com a família/escola.
- **"Lua de mel"** (remissão parcial) logo após o início — a necessidade de insulina cai temporariamente, mas o tratamento não deve ser suspenso.
- **Metas (ISPAD/ADA):** **HbA1c < 7%** para a maioria, individualizada, com uso de TIR pelo CGM.

## Cuidados adicionais
- **Rastrear autoimunidades** (tireoide, doença celíaca) e **complicações** (retina, rim, pés, lipídeos, PA) conforme a idade/duração.
- **DM2 pediátrico:** estilo de vida + **metformina** ± insulina ± análogo de GLP-1; costuma ser **mais agressivo** que no adulto.
- **Transição planejada** para o serviço de adultos na adolescência tardia.

## 📊 DM1 × DM2 na criança
| Característica | DM1 | DM2 |
| --- | --- | --- |
| Peso | Normal/magro | Sobrepeso/obeso |
| Autoanticorpos | Presentes | Ausentes |
| Peptídeo C | Baixo | Normal/alto |
| Acantose nigricans | Ausente | Frequente |
| Base do tratamento | Insulina | Metformina (± insulina) |`,
  pts:[
    'O DM1 é o diabetes mais comum na infância; o DM2 cresce com a obesidade.',
    'É preciso diferenciar DM1, DM2 e MODY, pois o tratamento difere.',
    'DM1: autoimune, magro, autoanticorpos positivos, peptídeo C baixo, tende à cetose.',
    'DM2: sobrepeso, acantose nigricans, história familiar, sem autoanticorpos.',
    'MODY: história familiar em várias gerações (dominante), sem autoanticorpos, quadro leve.',
    'Até cerca de um terço das crianças com DM1 abre o quadro com cetoacidose.',
    'Tratamento do DM1: insulina basal-bólus ou bomba, com CGM e contagem de carboidratos.',
    'A fase de lua de mel reduz temporariamente a insulina, mas não se suspende o tratamento.',
    'Meta ISPAD/ADA: HbA1c < 7% para a maioria, individualizada, com TIR pelo CGM.',
    'Rastrear tireoide e celíaca; o DM2 pediátrico é mais agressivo (metformina ± insulina/GLP-1).'],
  mapa:{ central:'Diabetes na criança', nodes:[
    {label:'Tipos', children:[
      {label:'DM1 (mais comum)',children:['Autoanticorpos +','Peptídeo C baixo']},
      {label:'DM2 (obesidade)',children:['Acantose nigricans']},
      {label:'MODY (familiar dominante)'}]},
    {label:'Apresentação', children:['Poliúria, perda de peso','~1/3 abre com CAD']},
    {label:'Tratamento DM1', children:[
      {label:'Basal-bólus / bomba + CGM'},
      {label:'Contagem de carboidratos'},
      {label:'Lua de mel (não suspender)'}]},
    {label:'Cuidados', children:[
      {label:'HbA1c < 7% (individualizar)'},
      {label:'Rastrear tireoide/celíaca'},
      {label:'DM2 → metformina ± insulina'},
      {label:'Transição p/ adulto'}]}]},
  flashcards:[
    {q:'Como diferenciar DM1, DM2 e MODY na criança?',a:'DM1: magro, autoanticorpos positivos, peptídeo C baixo, tendência à cetose; DM2: sobrepeso/obesidade, acantose nigricans, sem autoanticorpos, peptídeo C normal/alto; MODY: história familiar em várias gerações (autossômico dominante), início jovem, sem autoanticorpos e quadro geralmente leve.'},
    {q:'Como costuma se apresentar o DM1 na infância?',a:'Com poliúria, polidipsia, perda de peso e enurese de início recente; em cerca de um terço dos casos o diagnóstico se faz já na cetoacidose diabética.'},
    {q:'O que é a fase de lua de mel no DM1?',a:'Um período de remissão parcial logo após o início do tratamento, em que a necessidade de insulina cai por recuperação transitória da célula β; o tratamento não deve ser suspenso, apenas ajustado.'},
    {q:'Qual a meta de HbA1c na criança/adolescente com diabetes?',a:'Menos de 7% para a maioria (ISPAD/ADA), individualizada conforme o risco de hipoglicemia e o contexto, com uso do tempo no alvo (TIR) pelo monitoramento contínuo de glicose.'},
    {q:'Quais rastreamentos associados são recomendados no DM1 pediátrico?',a:'Rastrear doenças autoimunes associadas (tireoidite e doença celíaca) e as complicações crônicas (retina, função renal/albuminúria, pés, perfil lipídico e pressão arterial) conforme a idade e a duração da doença.'}],
  fluxogramas:[{ titulo:'Classificação e manejo do diabetes na criança', fonte:'Algoritmo baseado no ISPAD Clinical Practice Consensus Guidelines e no ADA Standards of Care 2026, adaptado ao português', nos:[
    {tipo:'inicio', texto:'Criança com hiperglicemia → confirmar diagnóstico; dosar autoanticorpos e peptídeo C; avaliar peso/acantose'},
    {tipo:'decisao', texto:'Autoanticorpos positivos / peptídeo C baixo?', ramos:[
      {rotulo:'SIM', tipo:'acao', texto:'DM1 → insulina basal-bólus/bomba + CGM; educação; rastrear tireoide/celíaca'},
      {rotulo:'NÃO', tipo:'acao', texto:'Obesidade + acantose → DM2 (metformina ± insulina); história familiar dominante → investigar MODY'} ]},
    {tipo:'decisao', texto:'Apresentou cetoacidose?', ramos:[
      {rotulo:'SIM', tipo:'fim', texto:'Tratar CAD; depois esquema de insulina + metas (HbA1c < 7%, TIR)'},
      {rotulo:'NÃO', tipo:'fim', texto:'Iniciar tratamento conforme o tipo; planejar transição para o cuidado adulto'} ]}
  ]}]
}
];

// ── SQL (3 lotes) ──
const fs=require('fs');
function mkSql(arr){const j=JSON.stringify(arr);if(j.indexOf('$j$')>=0)throw new Error('$j$');return `UPDATE endodirect_global_state\nSET payload = jsonb_set(payload, '{diretrizes}', coalesce(payload->'diretrizes','[]'::jsonb) || $j$${j}$j$::jsonb)\nWHERE payload ? 'diretrizes';`;}
const b1=R.slice(0,3), b2=R.slice(3,6), b3=R.slice(6);
fs.writeFileSync(__dirname+'/ped1.sql', mkSql(b1));
fs.writeFileSync(__dirname+'/ped2.sql', mkSql(b2));
fs.writeFileSync(__dirname+'/ped3.sql', mkSql(b3));
R.forEach(r=>{ (r.resumo.split('\n').filter(l=>l.trim().startsWith('|'))).forEach(l=>{ l.split('|').slice(1,-1).forEach(c=>{ if(c.trim()==='')throw new Error('célula vazia em '+r.tema); }); }); });
// checagem NFC do sub (á = c3a1, não 61cc81)
const subHex=Buffer.from(SUB,'utf8').toString('hex');
if(subHex.indexOf('61cc81')>=0) throw new Error('sub em NFD! corrigir p/ NFC');
console.log('Pediatria:', R.length, 'resumos | lotes', b1.length+'+'+b2.length+'+'+b3.length, '| sub hex', subHex);
R.forEach((r,i)=>console.log('  '+(i+1)+'.', r.tema, '[pts '+r.pts.length+' fc '+r.flashcards.length+' flux '+r.fluxogramas.length+']'));
