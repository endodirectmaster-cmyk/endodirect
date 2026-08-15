// Os CINCO capítulos de Transgeneridade atualizados pela aula "Terapia de
// afirmação de gênero" do EndoTEEM 2026 (54 slides, design DAGnvrwo52E).
//
// Os cinco capítulos somavam 6.593 caracteres — os mais magros da plataforma.
// A aula traz o que faltava: o vocabulário completo, a mudança CID-10 → CID-11,
// os critérios do DSM-5, a Resolução CFM nº 2.265/2019 (que é a régua legal no
// Brasil e não estava em NENHUM capítulo), as doses e a monitorização de cada
// apresentação, as contraindicações e a agenda de rastreios.
//
// ⚠️ DIVERGÊNCIAS REGISTRADAS À VISTA, sem escolher um lado:
//   • espironolactona — capítulo dizia 100–300 mg/dia, a aula diz 100–200;
//   • ciproterona — a própria aula contrapõe WPATH 2022 (10 mg/dia) e Endocrine
//     Society 2017 (25–50 mg/dia);
//   • testosterona — capítulo mirava a faixa masculina ~320–1.000 ng/dL, a aula
//     dá a meta de 400–700 ng/dL.
//
// ⚠️ NÃO afirmo gabarito das três questões da aula: os slides de resposta não
// vêm marcados neste deck. Só entrou o que os slides de conteúdo sustentam.
const fs = require('fs');
const path = require('path');

const SUB = 'Transgeneridade';
const caps = {};

// ── 1. Princípios do Cuidado de Afirmação de Gênero ─────────────────────────
caps['Princípios do Cuidado de Afirmação de Gênero'] = {
  resumo: `## Conceitos e vocabulário

- **Sexo biológico:** características físicas e cromossômicas ao nascimento (XX, XY).
- **Identidade de gênero:** a percepção interna de cada pessoa sobre ser homem, mulher, ambos, nenhum ou algo além.
- **Expressão de gênero:** como a identidade é demonstrada externamente — roupas, comportamento, aparência.
- **Orientação sexual:** atração física ou romântica por outras pessoas; é **independente da identidade de gênero**.

**Identidades.** **Cisgênero** — a identidade corresponde ao sexo designado ao nascimento. **Transgênero** — a identidade difere do sexo designado. **Mulher trans**: designada homem ao nascer, identifica-se e vive como mulher. **Homem trans**: designado mulher ao nascer, identifica-se e vive como homem. **Não binário**: não se identifica exclusivamente como homem ou mulher. **Gênero fluido**: a identidade varia ao longo do tempo. Há ainda agênero, bigênero e outras.

## Como as classificações mudaram

| | CID-10 | CID-11 |
| --- | --- | --- |
| Código | **F64** — transtornos da identidade sexual | **HA60** — incongruência de gênero |
| Capítulo | Transtornos mentais e comportamentais | Condições relacionadas à **saúde sexual** |
| Leitura | Abordagem **patologizante** | Identidade trans como parte da **diversidade humana** |

O objetivo da CID-11 é a **despatologização**, reduzindo o estigma. A condição permanece na classificação **não por ser doença**, mas por **demandar cuidados de saúde** — como a gestação.

**Incongruência de gênero na adolescência e vida adulta (CID-11).** Incompatibilidade **persistente** entre o gênero experienciado e o sexo atribuído ao nascimento, geralmente levando ao desejo de transição. ⚠️ O diagnóstico é **restrito a quem já iniciou a puberdade** e apresenta a incongruência de forma consistente e persistente.

**Disforia de gênero (DSM-5).** Exige incongruência acentuada por **pelo menos 6 meses**, manifestada por **no mínimo 2** dos seguintes: incongruência com as características sexuais primárias e/ou secundárias; forte desejo de livrar-se delas; forte desejo pelas características do outro gênero; forte desejo de pertencer a outro gênero; forte desejo de ser tratado como outro gênero; forte convicção de ter sentimentos e reações típicas de outro gênero. **Critério B:** sofrimento clinicamente significativo ou prejuízo funcional. ⚠️ **Nem toda pessoa trans tem disforia**, e a intensidade varia.

## O que a pessoa trans enfrenta

Altos índices de preconceito; elevada prevalência de **ansiedade, depressão e risco de suicídio**, agravados pela falta de apoio social; criminalização, marginalização e violência; altas taxas de desemprego e subemprego. A **expectativa de vida da população trans é inferior à da população geral**.

## Terapia de afirmação de gênero

**Definição.** Conjunto de intervenções **médicas, psicológicas e sociais** destinadas a apoiar pessoas transgênero e não binárias no alinhamento de suas características físicas, sociais e emocionais com a identidade de gênero.

**Objetivos.** Melhora da qualidade de vida, alinhamento com a identidade, redução da disforia de gênero, inclusão e respeito.

**Composição do cuidado.** Equipe **multidisciplinar** (endocrinologia, psicologia, psiquiatria, serviço social e outros); **terapia hormonal**; **intervenções cirúrgicas**, opcionais e conforme a escolha da pessoa; e **suporte psicológico** para disforia, estigma e adaptação social.

## Avaliação inicial

Nome social; identidade de gênero; rede de apoio; presença de transtornos mentais; **risco de suicídio**; uso de substâncias e automedicação; **fertilidade** — em pessoas em idade fértil, questionar o desejo reprodutivo e **informar as opções antes de iniciar a terapia hormonal**; e desejo e expectativas quanto à transição e aos procedimentos.

## Modelo de cuidado e critérios no adulto

Dois modelos coexistem: avaliação por saúde mental (Endocrine Society 2017) e **consentimento informado** (crescentemente adotado, SOC-8), em que o próprio prescritor avalia capacidade e expectativas. Critérios para iniciar hormonização no adulto: **incongruência de gênero persistente e bem documentada**, **capacidade de consentir**, controle razoável de comorbidades clínicas e mentais e compreensão de riscos, benefícios e limites — inclusive de **fertilidade**.

⚠️ Nem tudo é reversível: alguns efeitos são **permanentes** (crescimento mamário na feminilização; engrossamento da voz na masculinização), o que precisa constar do consentimento.

## Resolução CFM nº 2.265/2019 — a régua brasileira

**Critérios:** incongruência de gênero persistente e bem documentada; capacidade de decisão sobre o tratamento (TCLE); idade permitida em legislação — ⚠️ **vedado o início da hormonioterapia cruzada antes dos 16 anos**; e controle de comorbidades clínicas e psiquiátricas.

**Contraindicações:** transtornos psicóticos graves; transtornos de personalidade graves; transtornos globais do desenvolvimento graves.

## Cirurgias de afirmação de gênero

⚠️ **Vedadas antes dos 18 anos.** Devem ser realizadas após **no mínimo 1 ano de acompanhamento** e são contraindicadas em transtornos mentais que inviabilizem o procedimento.

- **Mulher trans:** vaginoplastia, mamoplastia, feminização facial.
- **Homem trans:** faloplastia ou metoidioplastia, mastectomia masculinizadora, histerectomia com remoção de ovários e trompas.`,
  pts: [
    'Identidade de gênero é a percepção interna sobre o próprio gênero e é independente da orientação sexual.',
    'A CID-11 tirou a condição do capítulo de transtornos mentais: F64 (transtorno da identidade sexual) virou HA60 (incongruência de gênero).',
    'A condição permanece na classificação não por ser doença, mas por demandar cuidados de saúde — como a gestação.',
    'O diagnóstico de incongruência de gênero pela CID-11 é restrito a quem já iniciou a puberdade.',
    'A disforia de gênero do DSM-5 exige 6 meses e ao menos 2 de 6 critérios, mais sofrimento ou prejuízo funcional.',
    'Nem toda pessoa trans tem disforia — e a intensidade varia.',
    'A população trans tem expectativa de vida inferior à da população geral, com alta prevalência de ansiedade, depressão e risco de suicídio.',
    'A avaliação inicial inclui nome social, rede de apoio, risco de suicídio, uso de substâncias, automedicação e desejo reprodutivo.',
    'A opção reprodutiva deve ser informada ANTES de iniciar a terapia hormonal.',
    'Resolução CFM nº 2.265/2019: vedada a hormonioterapia cruzada antes dos 16 anos e a cirurgia antes dos 18, com no mínimo 1 ano de acompanhamento.',
  ],
  novos: ['Expressão de gênero', 'HA60', 'F64', 'Gênero fluido', 'no mínimo 2', 'Critério B',
    'expectativa de vida', 'Nome social', 'CFM nº 2.265/2019', '16 anos', '18 anos',
    'metoidioplastia', 'transtornos psicóticos graves'],
  preservados: ['despatologização', 'consentimento informado', 'Endocrine Society 2017',
    'engrossamento da voz na masculinização'],
};

// ── 2. Terapia Hormonal Feminilizante ───────────────────────────────────────
caps['Terapia Hormonal Feminilizante'] = {
  resumo: `## Objetivo

Reduzir os níveis hormonais que sustentam as características sexuais secundárias do gênero designado ao nascimento e administrar hormônios consistentes com a identidade de gênero, seguindo os princípios da reposição usada no **hipogonadismo** — com os níveis mantidos **dentro da faixa fisiológica do gênero afirmado**. Na maioria dos casos a terapia é **mantida ao longo da vida**; ⚠️ **não se sabe** se as doses devem ser reduzidas em pessoas trans mais velhas.

O esquema combina **estrogênio** (feminilização) e **antiandrogênio** (supressão da testosterona endógena).

## Estrogenioterapia

**Função.** Induzir características femininas: crescimento mamário, redistribuição de gordura corporal, pele mais macia.

**Opções e doses**
- **Valerato de estradiol oral:** 2 a 6 mg/dia.
- **Valerato de estradiol injetável:** 5 a 30 mg IM a cada 2 semanas.
- **Estradiol transdérmico:** adesivo ou gel.

**Meta:** estradiol sérico de **100 a 200 pg/mL**, ajustando pela resposta clínica e evitando níveis excessivos.

**O que NÃO prescrever**
- ⚠️ **Etinilestradiol** — mais associado a eventos **tromboembólicos**.
- ⚠️ **Estrogênios conjugados** quando o estradiol estiver disponível — seus níveis sanguíneos **não podem ser medidos adequadamente**.

**Preferir a via transdérmica** em pessoas trans com maior risco de TEV: **idade acima de 45 anos** ou história prévia de tromboembolismo.

**Progesterona.** ⚠️ **Não há dados suficientes** para recomendar a favor ou contra qualquer progestágeno.

**Fertilidade.** O estrogênio causa **atrofia testicular** e redução significativa da contagem de espermatozoides — a preservação se faz por **criopreservação de esperma**, antes de iniciar.

**Contraindicações.** Tromboembolismo venoso não tratado ou recente; doença cardiovascular ou cerebrovascular instável (angina instável, infarto recente, AVC em fase aguda); insuficiência hepática grave; hipertensão não controlada; câncer hormônio-responsivo. **Específicas da via oral:** colelitíase e hipertrigliceridemia.

## Terapia antiandrogênica

**Função.** Suprimir características masculinas reduzindo a testosterona — pelos corporais, densidade capilar facial. **Meta: testosterona sérica < 50 ng/dL.**

- **Espironolactona.** Bloqueia os andrógenos na interação com o receptor androgênico. **Dose: 100 a 200 mg/dia** (algumas referências vão até 300 mg/dia). Efeitos adversos: **hipercalemia**, aumento da frequência urinária e hipotensão.
- **Acetato de ciproterona.** Derivado da progesterona; inibe a secreção de gonadotrofinas e bloqueia a ligação da testosterona ao receptor. ⚠️ **A dose diverge entre as diretrizes: 10 mg/dia pela WPATH 2022 e 25 a 50 mg pela Endocrine Society 2017.** Efeitos adversos: **hiperprolactinemia** e possível associação com **meningioma**.
- **Agonistas de GnRH.** Reduzem a testosterona com eficácia, mas ⚠️ **podem causar osteoporose se o estrogênio não for administrado em dose adequada**.

## Inibidores da 5-alfa-redutase

Reduzem a conversão de testosterona em di-hidrotestosterona. ⚠️ **Não há evidência clara de benefício adicional** em pessoas transfemininas que já estão com testosterona e DHT controladas por estrogênio e antiandrogênio — **não são recomendados para uso rotineiro**. A **finasterida** pode ser usada na alopecia androgenética e no controle de pilificação corporal intensa, com cautela: **pode interferir na libido**.

## Efeitos esperados

Redistribuição de gordura, redução da massa muscular e pele mais macia (3–6 meses, com efeito máximo em 2–3 anos); **crescimento mamário** (3–6 meses até 2–3 anos, **irreversível**); redução da libido, das ereções, do volume testicular e da espermatogênese (reversibilidade incerta); redução lenta e parcial dos pelos corporais. ⚠️ **Não** altera o timbre da voz já grave nem reverte a calvície instalada.`,
  pts: [
    'A meta é manter os níveis dentro da faixa fisiológica do gênero afirmado; a terapia costuma ser mantida por toda a vida.',
    'Valerato de estradiol oral 2 a 6 mg/dia ou injetável 5 a 30 mg IM a cada 2 semanas; meta de estradiol de 100 a 200 pg/mL.',
    'Não prescrever etinilestradiol, pelo risco tromboembólico, nem estrogênios conjugados quando há estradiol disponível — seus níveis não são mensuráveis.',
    'Preferir estradiol transdérmico acima de 45 anos ou com história prévia de tromboembolismo.',
    'Não há dados suficientes para recomendar a favor ou contra qualquer progestágeno na terapia feminilizante.',
    'A meta do antiandrogênio é testosterona abaixo de 50 ng/dL.',
    'Espironolactona 100 a 200 mg/dia — vigiar hipercalemia, frequência urinária e hipotensão.',
    'Acetato de ciproterona: 10 mg/dia pela WPATH 2022 e 25 a 50 mg pela Endocrine Society 2017; causa hiperprolactinemia e tem possível associação com meningioma.',
    'Agonista de GnRH pode causar osteoporose se o estrogênio não estiver em dose adequada.',
    'Inibidores da 5-alfa-redutase não têm uso rotineiro; a finasterida serve à alopecia e à pilificação, mas pode interferir na libido.',
  ],
  novos: ['5 a 30 mg IM', 'Etinilestradiol', 'Estrogênios conjugados', 'acima de 45 anos',
    'Não há dados suficientes', 'criopreservação de esperma', 'colelitíase',
    '100 a 200 mg/dia', '10 mg/dia pela WPATH 2022', 'meningioma', 'hipercalemia',
    'finasterida', 'osteoporose se o estrogênio'],
  preservados: ['100 a 200 pg/mL', '< 50 ng/dL', 'irreversível', 'timbre da voz'],
};

// ── 3. Terapia Hormonal Masculinizante ──────────────────────────────────────
caps['Terapia Hormonal Masculinizante'] = {
  resumo: `## Objetivo

A **testosterona** é a base e costuma dispensar antiandrogênio, pois suprime o eixo e a produção estrogênica. Promove pelos faciais e corporais, aumento da massa muscular e aprofundamento da voz. A dose é ajustada pela **resposta clínica** e pelos níveis séricos, evitando excesso de andrógeno. **Meta: testosterona de 400 a 700 ng/dL.**

## Apresentações, doses e monitorização

**Undecanoato de testosterona — 1.000 mg IM a cada 12 semanas**
- *Vantagens:* liberação prolongada, sem picos e quedas; maior comodidade pela aplicação menos frequente.
- *Desvantagem:* custo mais elevado.
- *Monitorização:* medir testosterona total **antes de cada injeção** (10 a 14 semanas).

**Enantato ou cipionato de testosterona — 100 a 200 mg IM a cada 2 semanas**
- *Vantagem:* baixo custo.
- *Desvantagem:* níveis séricos **altamente variáveis**, com flutuação de humor e libido.
- *Monitorização:* medir testosterona total **na metade do intervalo** entre as aplicações.

**Testosterona gel 1% — 50 a 100 mg/dia** nos ombros, braços ou abdome
- *Vantagens:* estabilidade dos níveis; **causa menos eritrocitose** que a injetável; aplicação fácil.
- *Desvantagens:* custo elevado; irritação cutânea; ⚠️ **risco de transferência acidental para outras pessoas**.
- *Monitorização:* medir testosterona sérica **após 1 semana** de tratamento, a qualquer hora do dia.

## Contraindicações

**Absolutas:** gestação ou amamentação; doença coronariana instável; **hematócrito ≥ 55%**; câncer estrogênio-dependente em atividade (mama, ovário, endométrio).

**Relativas:** apneia obstrutiva do sono não tratada; hipertensão grave; insuficiência cardíaca congestiva grave.

## Fertilidade e contracepção

A **ovulação cessa** poucos meses após o início da testosterona e, em muitos casos, **a fertilidade é restaurada** se a terapia for interrompida. A preservação se faz por **criopreservação de oócitos ou embriões**.

⚠️ **A testosterona não é método contraceptivo.** Em homens trans com possibilidade de gestação, considerar **DIU** ou progestágenos (**desogestrel oral** ou **medroxiprogesterona injetável**).

## Sangramento uterino persistente

Se o sangramento continuar apesar da terapia, considerar a adição de um **agente progestacional** ou a **ablação endometrial**.

## Efeitos esperados

**Cessação da menstruação** em 2 a 6 meses; aumento de pelos faciais e corporais, oleosidade e acne, ganho de massa muscular e aumento da libido (6–12 meses, com efeito máximo em torno de 5 anos); **engrossamento da voz** e **clitoromegalia**, ambos **irreversíveis**; alopecia androgenética em predispostos.

## Osso

A manutenção da massa óssea no homem trans **depende de níveis adequados de testosterona**, e a ação protetora sobre o osso pode se dar por sua **conversão periférica em estradiol**.`,
  pts: [
    'A testosterona é a base da terapia masculinizante e costuma dispensar antiandrogênio; a meta é de 400 a 700 ng/dL.',
    'Undecanoato 1.000 mg IM a cada 12 semanas — dosar a testosterona ANTES de cada injeção, entre 10 e 14 semanas.',
    'Enantato ou cipionato 100 a 200 mg IM a cada 2 semanas — níveis variáveis; dosar na metade do intervalo.',
    'Gel 1% de 50 a 100 mg/dia — causa menos eritrocitose que a injetável, mas há risco de transferência para outras pessoas; dosar após 1 semana, a qualquer hora.',
    'Contraindicações absolutas: gestação ou amamentação, doença coronariana instável, hematócrito de 55% ou mais e câncer estrogênio-dependente em atividade.',
    'Contraindicações relativas: apneia do sono não tratada, hipertensão grave e insuficiência cardíaca grave.',
    'A ovulação cessa poucos meses após o início e a fertilidade costuma ser restaurada com a suspensão; preservar por criopreservação de oócitos ou embriões.',
    'A testosterona NÃO é contraceptivo — considerar DIU, desogestrel oral ou medroxiprogesterona injetável.',
    'Sangramento uterino persistente: acrescentar progestágeno ou considerar ablação endometrial.',
    'A massa óssea do homem trans depende de testosterona adequada, com proteção possivelmente mediada pela conversão periférica em estradiol.',
  ],
  novos: ['400 a 700 ng/dL', '1.000 mg IM a cada 12 semanas', '10 a 14 semanas',
    'na metade do intervalo', 'gel 1%', 'transferência acidental', 'após 1 semana',
    'hematócrito ≥ 55%', 'apneia obstrutiva do sono', 'criopreservação de oócitos',
    'desogestrel', 'ablação endometrial', 'conversão periférica em estradiol'],
  preservados: ['Cessação da menstruação', 'clitoromegalia', 'irreversíveis',
    'não é método contraceptivo'],
};

// ── 4. Monitorização, Riscos e Manejo de Longo Prazo ────────────────────────
caps['Monitorização, Riscos e Manejo de Longo Prazo'] = {
  resumo: `## Acompanhamento

Reavaliar clínica e laboratorialmente a cada **3 meses no 1º ano** e depois **1 a 2 vezes ao ano**, ajustando as doses pelas **metas hormonais** e pela resposta.

## Riscos da feminilização (estrogênio)

- **Tromboembolismo venoso** é o principal risco — maior com **etinilestradiol**, dose alta, tabagismo e idade. Preferir **17β-estradiol transdérmico** em quem tem risco.
- Monitorizar **estradiol, testosterona, potássio** (se em uso de espironolactona), **prolactina** (o estrogênio em dose alta pode elevá-la; a ciproterona também) e **perfil lipídico**.
- **Osso:** manter estrogenização adequada protege a densidade óssea — hipogonadismo pós-gonadectomia **sem reposição** leva a osteoporose.

## Riscos da masculinização (testosterona)

- **Eritrocitose:** acompanhar o **hematócrito**; é **contraindicação absoluta** ao tratamento quando **≥ 55%**. Considerar redução de dose ou flebotomia.
- Monitorizar **testosterona, hematócrito, perfil lipídico** (queda do HDL), peso e pressão arterial.

## Rastreios na mulher trans em terapia hormonal

| Rastreio | Conduta |
| --- | --- |
| **Câncer de mama** | Mamografia a cada **1 a 2 anos, a partir dos 50 anos**, em quem usa terapia hormonal **há pelo menos 5 anos** |
| **Câncer de próstata** | Mesmas diretrizes aplicáveis a homens cisgênero: **PSA e toque retal a partir dos 50 anos** sem fatores de risco, ou **a partir dos 45** com fator de risco |
| **Câncer de testículo** | **Triagem de rotina desnecessária**; ultrassonografia escrotal apenas se houver suspeita de tumor |

**Densitometria óssea.** Sem fatores de risco, a partir dos **65 anos**; com fatores de risco estabelecidos, a partir dos **50 anos**. ⚠️ Se houve **gonadectomia** e se passaram **5 anos sem reposição hormonal**, rastrear **independentemente da idade**.

## Rastreios no homem trans em terapia hormonal

- **Câncer de mama.** A testosterona causa **atrofia mamária, mas não exclui a possibilidade de câncer** — mamografia a cada **1 a 2 anos**, conforme as diretrizes locais para mulheres cisgênero.
- **Câncer de colo do útero.** Colpocitologia oncótica indicada a pessoas **com útero e histórico de atividade sexual com penetração**.
- **Vacinação contra HPV recomendada para todos os homens e mulheres trans.**
- ⚠️ **Não se recomenda ooforectomia ou histerectomia de rotina** apenas para prevenir câncer de ovário ou de colo uterino.

**Densitometria óssea.** Solicitar acima de **65 anos**, ou acima de **60 anos com fatores de risco** — história familiar de osteoporose, alcoolismo, tabagismo, uso de glicocorticoide, artrite reumatoide, **gonadectomia** e **IMC < 20 kg/m²**.

## A regra da referência na DXA

⚠️ Na avaliação por densitometria, adota-se a **referência do gênero de identificação** quando a terapia hormonal está instituída **há 1 ano ou mais**.

## Fertilidade e pós-gonadectomia

Oferecer **preservação de gametas antes** da hormonização — criopreservação de sêmen ou de oócitos. Após a **gonadectomia**, manter a reposição hormonal **contínua**, que protege o osso e o bem-estar.`,
  pts: [
    'Reavaliar a cada 3 meses no primeiro ano e depois 1 a 2 vezes ao ano.',
    'Na feminilização, o tromboembolismo venoso é o principal risco — preferir 17β-estradiol transdérmico em quem tem risco.',
    'Monitorizar estradiol, testosterona, potássio com espironolactona, prolactina e perfil lipídico.',
    'Na masculinização, vigiar o hematócrito: 55% ou mais é contraindicação absoluta.',
    'Mulher trans: mamografia a cada 1 a 2 anos a partir dos 50, se estiver em terapia hormonal há pelo menos 5 anos.',
    'Mulher trans: rastreio de próstata como em homens cisgênero, e ultrassonografia escrotal só diante de suspeita.',
    'Homem trans: a testosterona atrofia a mama mas não exclui câncer — manter a mamografia conforme as diretrizes locais.',
    'Homem trans: colpocitologia se há útero e atividade sexual com penetração; não se faz ooforectomia ou histerectomia de rotina para prevenir câncer.',
    'Vacinação contra HPV recomendada para todos os homens e mulheres trans.',
    'Na DXA, adota-se a referência do gênero de identificação quando a terapia hormonal já dura 1 ano ou mais.',
  ],
  novos: ['a partir dos 50 anos', 'há pelo menos 5 anos', 'toque retal', 'escrotal',
    '5 anos sem reposição hormonal', 'atrofia mamária', 'penetração', 'HPV',
    'ooforectomia ou histerectomia de rotina', 'IMC < 20 kg/m²',
    'referência do gênero de identificação'],
  preservados: ['3 meses no 1º ano', 'Tromboembolismo venoso', '17β-estradiol transdérmico',
    'Eritrocitose', 'preservação de gametas'],
};

// ── 5. Adolescentes: Bloqueio Puberal e Hormonização ────────────────────────
caps['Adolescentes: Bloqueio Puberal e Hormonização'] = {
  resumo: `## Supressão puberal

Indicada quando a puberdade **já iniciou** (**Tanner 2–3**) e há incongruência de gênero, após avaliação por equipe com experiência. **Análogos de GnRH** (leuprolida, histrelina) suprimem o eixo hipotálamo-hipófise-gonadal e **pausam** o desenvolvimento das características sexuais secundárias. O efeito é considerado **reversível**: se interrompido, a puberdade endógena retoma. Objetivo: **ganhar tempo** para amadurecer a decisão e evitar caracteres indesejados (mama, engrossamento da voz).

⚠️ O diagnóstico de **incongruência de gênero pela CID-11 é restrito a quem já iniciou a puberdade** e apresenta a incongruência de forma consistente e persistente — o que sustenta a exigência de Tanner 2–3.

## Hormonização de afirmação de gênero

A introdução de **estrogênio ou testosterona** é feita de forma **gradual** e **individualizada**. A **SOC-8 flexibiliza a idade** conforme maturidade, contexto e avaliação multiprofissional, mas ⚠️ **no Brasil a Resolução CFM nº 2.265/2019 veda o início da hormonioterapia cruzada antes dos 16 anos** — é a régua legal que prevalece aqui, e não uma recomendação flexível.

A resolução exige ainda incongruência de gênero **persistente e bem documentada**, **capacidade de decisão** com termo de consentimento e **controle das comorbidades clínicas e psiquiátricas**; e contraindica o tratamento em transtornos psicóticos graves, transtornos de personalidade graves e transtornos globais do desenvolvimento graves.

Requer **consentimento** do adolescente e **envolvimento dos responsáveis** conforme a legislação local.

## Cirurgia

⚠️ **Vedada antes dos 18 anos**, e realizada apenas após **no mínimo 1 ano de acompanhamento**.

## Cuidados específicos

Monitorizar **crescimento**, **idade óssea** e **densidade mineral óssea** — a supressão prolongada durante a fase de aquisição de massa óssea é a principal preocupação. Nos análogos de GnRH, o risco de perda óssea é maior **se o hormônio de afirmação não for administrado em dose adequada**.

Discutir **preservação de fertilidade antes de iniciar hormônios**: a supressão puberal precoce seguida de hormonização limita a maturação de gametas.`,
  pts: [
    'A supressão puberal com análogo de GnRH é indicada a partir de Tanner 2–3, não antes.',
    'O efeito da supressão é considerado reversível — serve para ganhar tempo enquanto a decisão amadurece.',
    'O diagnóstico de incongruência de gênero pela CID-11 é restrito a quem já iniciou a puberdade.',
    'No Brasil, a Resolução CFM nº 2.265/2019 veda o início da hormonioterapia cruzada antes dos 16 anos.',
    'A resolução também exige incongruência persistente e documentada, termo de consentimento e comorbidades controladas.',
    'São contraindicações da resolução: transtornos psicóticos graves, de personalidade graves e globais do desenvolvimento graves.',
    'A cirurgia é vedada antes dos 18 anos e exige no mínimo 1 ano de acompanhamento.',
    'Vigiar crescimento, idade óssea e densidade mineral óssea — a principal preocupação da supressão prolongada.',
    'O risco ósseo do análogo de GnRH é maior se o hormônio de afirmação não estiver em dose adequada.',
    'Discutir preservação de fertilidade antes de iniciar os hormônios.',
  ],
  novos: ['CID-11 é restrito', 'CFM nº 2.265/2019', '16 anos', 'transtornos psicóticos graves',
    'Vedada antes dos 18 anos', '1 ano de acompanhamento', 'dose adequada'],
  preservados: ['Tanner 2–3', 'leuprolida', 'reversível', 'SOC-8 flexibiliza',
    'densidade mineral óssea', 'preservação de fertilidade'],
};

// ── monta o SQL com um CASE por capítulo ────────────────────────────────────
const q = (s) => "'" + s.replace(/'/g, "''") + "'";
const ramos = [];
let total = 0;
for (const [tema, c] of Object.entries(caps)) {
  const f1 = c.novos.filter((n) => !c.resumo.includes(n));
  const f2 = c.preservados.filter((n) => !c.resumo.includes(n));
  if (f1.length) { console.error('⚠️ [%s] dados novos ausentes: %s', tema, f1.join(' | ')); process.exit(1); }
  if (f2.length) { console.error('⚠️ [%s] conteúdo antigo PERDIDO: %s', tema, f2.join(' | ')); process.exit(1); }
  const patch = JSON.stringify({
    resumo: c.resumo, pts: c.pts,
    fonte: 'Síntese Endodirect · EndoTEEM 2026 (Terapia de afirmação de gênero) + WPATH SOC-8 2022 / Endocrine Society 2017 / CFM 2.265-2019',
  });
  if (patch.includes('$j$')) throw new Error('delimitador colide com o conteúdo: ' + tema);
  ramos.push(`         when d->>'tema' = ${q(tema)} then d || $j$${patch}$j$::jsonb`);
  console.log('  %s — %d caracteres, %d pontos (%d novos, %d preservados)',
    tema, c.resumo.length, c.pts.length, c.novos.length, c.preservados.length);
  total += c.resumo.length;
}

fs.writeFileSync(path.join(__dirname, 'trans-afirmacao.sql'),
`update endodirect_global_state g
set payload = jsonb_set(g.payload, '{diretrizes}', (
  select jsonb_agg(
    case when d->>'sub' <> ${q(SUB)} then d
${ramos.join('\n')}
         else d end
    order by ord)
  from jsonb_array_elements(g.payload->'diretrizes') with ordinality t(d, ord)
))
where g.payload ? 'diretrizes';`);

console.log('✓ 5 capítulos, %d caracteres no total (antes: 6.593)', total);
