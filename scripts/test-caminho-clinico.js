#!/usr/bin/env node
/* A pergunta do médico chega ao artigo que a responde?
 *
 * POR QUE ISTO EXISTE. Extração verificada não é entrega. Este projeto já perdeu
 * artigos inteiros por ROTEAMENTO, com o conteúdo certo na base e inalcançável:
 *
 *   · `bisphosphonates are contraindicated` na hipofosfatasia — a pergunta
 *     "osteoporose refratária, fosfatase alcalina baixa, posso dar bisfosfonato?"
 *     devolvia bloco de ZERO caractere;
 *   · 154 fatos de hirsutismo arquivados em Adrenal, inalcançáveis;
 *   · a área de Esporte sequestrada pela palavra "diabetes";
 *   · `CAD` — o que o médico brasileiro escreve — devolvendo "".
 *
 * Cada um desses foi achado por MEDIÇÃO, não por leitura do código. Este arquivo
 * transforma essas medições em regressão, para que o próximo a mexer nos pesos
 * tenha rede.
 *
 * ⚠️ COMO ESTE ARQUIVO PODE MENTIR, e a proteção contra isso. Rotear certo não
 * basta: se o bloco devolvido não contém o assunto, a pergunta chegou na área
 * certa e no artigo errado. Medido em 08/08/2026: "EHH em idoso com glicemia
 * 900" roteava para Diabetes e o bloco voltava SEM a palavra "hiperosmolar",
 * porque o `tema` do extrato não a trazia e Diabetes está em 232k contra teto de
 * 120k — bloco não escolhido é bloco que não existe. Daí o bloco CHEGADA no fim.
 */
'use strict';
const deep = require('../lib/clinical-deep');

let falhas = 0;
const ok = (cond, msg) => { if (!cond) { falhas++; console.error('  - ' + msg); } };

// ─────────────────────────────────────────────────────────────────────────────
// 1. ROTEAMENTO — a pergunta cai na subespecialidade certa?
// ─────────────────────────────────────────────────────────────────────────────
const CAMINHO = [
  // Os defeitos históricos, cada um com o seu nome no cofre.
  ['osteoporose refrataria com fosfatase alcalina baixa: posso dar bisfosfonato?', 'Osteometabolismo'],
  ['mulher de 30 anos com testosterona total normal: trato o hirsutismo?', 'Endocrinologia Feminina'],
  ['DM2 descompensado apos pulso de corticoide', 'Diabetes'],

  // Emergências hiperglicêmicas: `CAD` e `EHH` devolviam "" até 08/08/2026, e o
  // extrato da CAD é o ÚNICO da base com conteúdo de estado hiperosmolar.
  ['paciente com CAD, pH 7,1: quando comeco a insulina?', 'Diabetes'],
  ['EHH em idoso com glicemia 900', 'Diabetes'],
  ['estado hiperglicemico hiperosmolar: qual a reposicao de volume?', 'Diabetes'],
  ['crise hiperglicemica na emergencia', 'Diabetes'],

  // Hiperglicemia por corticoide vive na INTERSEÇÃO fármaco × achado. A resposta
  // errada de "em que horário medir" (medir o jejum) é a armadilha do capítulo.
  ['paciente em corticoide em dose alta: em que horario medir a glicemia?', 'Diabetes'],
  ['quanta NPH comecar para prednisona 40 mg em paciente de 80 kg?', 'Diabetes'],
  ['esquema basal-bolus para paciente em dexametasona: como dividir?', 'Diabetes'],
  ['NPH com prednisona em reducao: como ajustar a insulina no desmame?', 'Diabetes'],

  // O EIXO ADRENAL é o outro prato da balança: não pode quebrar para o diabetes
  // ganhar. Estas quatro são as que a promoção do achado glicêmico ameaçava.
  ['em corticoide cronico, glicemia normal exclui supressao do eixo?', 'Adrenal'],
  ['paciente em insulina e prednisona 5 mg: ja posso dosar o cortisol matinal?', 'Adrenal'],
  ['posso acelerar o desmame do corticoide se o paciente esta bem?', 'Adrenal'],
  ['teste de tolerancia a insulina para avaliar o eixo hipofise-adrenal', 'Adrenal'],

  // Esporte só existe na INTERSEÇÃO com diabetes, e a promoção é condicional.
  ['maratonista com diabetes tipo 1: alvo de glicose antes do treino', 'Endocrinologia do Esporte'],
  ['adolescente com diabetes tipo 1, futebol a tarde, hipoglicemia noturna', 'Endocrinologia do Esporte'],
  ['quanto reduzir a basal para o exercicio no diabetes tipo 1', 'Endocrinologia do Esporte'],
  ['durante o exercicio aerobico prolongado', 'Endocrinologia do Esporte'],
  // …e as condições da promoção, uma sentinela para cada:
  ['maratonista com hipotireoidismo', 'Tireoide'],                       // topo ≠ Diabetes
  ['atleta com TSH de 8: trato?', 'Tireoide'],                           // idem
  ['prolactinoma em quem faz treino resistido', 'Neuroendocrinologia'],  // idem
  ['osteoporose grave: libero o exercicio resistido?', 'Osteometabolismo'],
  ['mulher com DM1 e osteoporose que faz musculacao: bisfosfonato?', 'Osteometabolismo'], // 3 áreas
  ['DM1 em cetoacidose apos treino intenso', 'Diabetes'],                // outro tema diabetológico
  ['DM1 em uso de dapagliflozina que treina: risco de cetoacidose', 'Diabetes'],
  ['pre-diabetes: exercicio previne a progressao?', 'Diabetes'],

  // Prolactinoma: a tríade clássica caía em Feminina porque `amenorreia`(3010)
  // vencia `prolactina`, que é ACHADO (1010).
  ['prolactina de 90 com amenorreia e galactorreia', 'Neuroendocrinologia'],
  ['galactorreia isolada com prolactina normal', 'Neuroendocrinologia'],
  ['amenorreia secundaria em atleta', 'Endocrinologia Feminina'],
  ['atleta amenorreica com baixa disponibilidade energetica', 'Endocrinologia Feminina'],

  // ⚠️ Nove assuntos do Seminar de DM1 devolviam "" com conteúdo na base. O mais
  // grave é `alça fechada`: o núcleo diz que ela é o método PREFERIDO no DM1
  // (ADA 2026) e a pergunta não chegava a lugar nenhum. Os três últimos desta
  // lista o auditor havia dado como "já roteiam corretamente" — não roteavam.
  // ⚠️ NÃO "CONSERTE" ESTA LINHA PARA ESPORTE. Eu quase o fiz em 08/08/2026, e
  // a contagem de ocorrências dizia que sim: "alça fechada" aparece SEIS vezes
  // em Endocrinologia do Esporte e ZERO no bloco que Diabetes entrega.
  //
  // Fui ler as seis. Todas são CLÁUSULA DE EXCLUSÃO — "estas recomendações NÃO
  // se aplicam a sistemas híbridos de alça fechada". O artigo de exercício não
  // ensina nada sobre alça fechada; ele repete que as tabelas dele não valem
  // para quem a usa. Diabetes não tem a expressão, mas tem o conteúdo vizinho
  // que serve (CSII, incrementos de 0,025 U/h, bomba aumentada por sensor), e o
  // NÚCLEO carrega a recomendação da ADA 2026 de que a alça fechada é o método
  // preferido no DM1.
  //
  // CONTAR OCORRÊNCIA NÃO É MEDIR CONTEÚDO. Seis menções que só dizem "isto não
  // se aplica a você" valem menos que zero menção com conteúdo adjacente útil.
  ['alca fechada', 'Diabetes'],
  ['bomba de insulina', 'Diabetes'],
  ['dasiglucagon', 'Diabetes'],
  // ⚠️ `pramlintida` e `exenatida` MUDARAM DE ÁREA (08/08/2026), e a mudança
  // corrigiu uma decisão minha. Eu as tinha mandado para Diabetes raciocinando
  // pela indicação em bula; o auditor da farmacoterapia MEDIU o conteúdo e me
  // desmentiu — `exenatid` tem 15 ocorrências em Obesidade contra 3 em Diabetes,
  // `pramlintida` 4 contra 2. Indicação de bula não é o critério: onde está o
  // CONTEÚDO é. Peso de fármaco, então a doença nomeada continua vencendo.
  ['pramlintida', 'Obesidade'],
  ['exenatida emagrece?', 'Obesidade'],
  ['exenatida no DM2', 'Diabetes'],
  ['pramlintida no DM1', 'Diabetes'],
  ['reganho apos suspender a medicacao', 'Obesidade'],
  ['lorcaserina foi retirada do mercado?', 'Obesidade'],
  ['reganho de peso apos tireoidectomia', 'Tireoide'],
  ['insulite', 'Diabetes'],
  ['glucagon nasal', 'Diabetes'],
  ['lua de mel', 'Diabetes'],
  ['remissao parcial', 'Diabetes'],
  // …e a sentinela que impede `remissao parcial` de virar peso de doença:
  ['remissao parcial da acromegalia apos cirurgia', 'Neuroendocrinologia'],
  ['alca fechada durante o exercicio no DM1', 'Endocrinologia do Esporte'],

  // ⚠️ ERRO DE ROTA, não buraco: `diabetes insipidus` casava só em `diabetes`
  // (substring do CANON) e ia para DIABETES MELLITUS. Poliúria, sede e sódio
  // respondidos com o bloco de glicemia — e com toda a confiança do mundo.
  ['diabetes insipidus com poliuria e sodio 150', 'Neuroendocrinologia'],
  ['diabetes insipido apos cirurgia de hipofise', 'Neuroendocrinologia'],
  ['diabetes tipo 2 descompensado', 'Diabetes'],

  // A classe dos inibidores de PCSK9 estava fora do mapa, com 46 ocorrências na
  // Diretriz de Dislipidemias — mesmo padrão dos iSGLT2.
  ['inibidor de PCSK9 no LDL residual', 'Lípides'],
  ['evolocumabe apos infarto', 'Lípides'],
  ['sindrome da quilomicronemia familiar e pancreatite', 'Lípides'],

  // Amiodarona × estatina: o trade está documentado em `lib/clinical-deep.js`.
  // O nome da estatina protege a pergunta do TETO DE DOSE, que é segurança de
  // prescrição; a forma genérica "amiodarona e estatina" é limite aceito.
  ['paciente em amiodarona ha 6 meses com palpitacoes e perda de peso', 'Tireoide'],
  ['sinvastatina com amiodarona: qual a dose maxima?', 'Lípides'],
  ['atorvastatina em paciente com hipotireoidismo', 'Tireoide'],
  ['adrenalectomia unilateral no hiperaldosteronismo', 'Adrenal'],

  // ⚠️ SIGLA E GRAFIA QUE O MÉDICO ESCREVE. `Lp(a)` não roteava, com 45
  // ocorrências na base — `lipoproteina(a)` roteava, mas ninguém digita isso.
  // Mesma família do `CAD` e do `EHH`: o conteúdo existe, a palavra real não
  // está no mapa, e o buraco é invisível para quem lê o código.
  ['Lp(a) elevada: muda a conduta?', 'Lípides'],
  ['Lp(a) de 120 nmol/L em prevencao primaria', 'Lípides'],
  ['Lp(a) alta em paciente com hipotireoidismo', 'Tireoide'],
  ['macroadenoma hipofisario com hemianopsia', 'Neuroendocrinologia'],
  ['adenoma adrenal com secrecao autonoma de cortisol', 'Adrenal'],
  ['SHBG na sindrome dos ovarios policisticos', 'Endocrinologia Feminina'],

  // ⚠️ ERRO DE ROTA COM CONSEQUÊNCIA CLÍNICA. `obesidade hipotalamica` casava em
  // `obesidade` (CANON) e entregava a diretriz de obesidade COMUM — estilo de
  // vida primeiro — exatamente onde os dois artigos de craniofaringioma dizem
  // que isso não funciona. "Criança com síndrome hipotalâmica e hiperfagia"
  // devolvia ZERO.
  ['obesidade hipotalamica', 'Neuroendocrinologia'],
  ['Adolescente com obesidade hipotalamica apos cirurgia de tumor selar', 'Neuroendocrinologia'],
  ['Crianca com sindrome hipotalamica e hiperfagia grave', 'Neuroendocrinologia'],
  ['craniofaringeoma em adulto', 'Neuroendocrinologia'],
  ['craniofaringioma adamantinomatoso na infancia', 'Neuroendocrinologia'],
  // …e as sentinelas que impediram `papilifero` e `braf` de entrarem soltos: os
  // dois são marcadores do carcinoma PAPILÍFERO DE TIREOIDE, muito mais comum.
  ['carcinoma papilifero de tireoide com mutacao BRAF', 'Tireoide'],
  ['nodulo tireoidiano Bethesda V com BRAF positivo', 'Tireoide'],
  ['obesidade grau III: indico bariatrica?', 'Obesidade'],
  ['reganho de peso apos sleeve', 'Obesidade'],

  // ⚠️ O MAPA DE OBESIDADE NÃO TINHA NENHUM ANTIOBESIDÊNICO CLÁSSICO — nem
  // `orlistate`, nem `sibutramina`, nem `fentermina`, nem `naltrexona-bupropiona`
  // — e nem `sobrepeso`, que é metade do nome da área.
  ['orlistate: ainda tem lugar?', 'Obesidade'],
  ['naltrexona-bupropiona em quem?', 'Obesidade'],
  ['fentermina-topiramato: quanto emagrece?', 'Obesidade'],
  ['sibutramina e risco cardiovascular', 'Obesidade'],
  ['paciente com sobrepeso e IMC 27: trato?', 'Obesidade'],
  ['reganho de peso apos suspender a medicacao', 'Obesidade'],
  ['quero emagrecer: por onde comeco?', 'Obesidade'],
  // ⚠️ A SENTINELA QUE MANTÉM `perda de peso` FORA DO MAPA. Perda de peso
  // INVOLUNTÁRIA é bandeira vermelha de hipertireoidismo, insuficiência adrenal
  // e neoplasia — mapeá-la para Obesidade responderia a pergunta mais grave com
  // o bloco mais inofensivo. `emagrecer` entrou no lugar porque carrega a
  // INTENÇÃO, que "perda de peso" não carrega.
  ['perda de peso com hiperpigmentacao e avidez por sal', 'Adrenal'],
  ['AR GLP-1 no DM2 com doenca renal cronica', 'Diabetes'],

  // ⚠️ NOME COMERCIAL. O médico e, sobretudo, o PACIENTE escrevem "Ozempic",
  // "Mounjaro", "Saxenda" — não "semaglutida". Todos devolviam "" com a base
  // cheia (semaglutida 88 ocorrências em Obesidade, tirzepatida 29). Mesma
  // família do `CAD`, do `EHH` e do `Lp(a)`.
  ['Ozempic: quanto tempo para fazer efeito?', 'Obesidade'],
  ['Mounjaro causa mais nausea que Ozempic?', 'Obesidade'],
  ['paciente tomando Saxenda com constipacao', 'Obesidade'],
  ['Xenical ainda se usa?', 'Obesidade'],
  ['Byetta no DM2', 'Diabetes'],
  // …e as sentinelas: a marca cede para a doença nomeada.
  ['Ozempic em paciente com DM2 e doenca renal cronica', 'Diabetes'],
  ['Saxenda em paciente com hipotireoidismo', 'Tireoide'],

  // ⚠️ O DIFERENCIAL DA MASSA SELAR ERA INALCANÇÁVEL INTEIRO: quinze termos com
  // conteúdo em Neuroendocrinologia e `canonArea` devolvendo "" para todos.
  // Quem via uma massa selar e queria o diferencial não chegava a lugar nenhum,
  // e a via de acesso cirúrgico também não.
  ['massa selar: penso em germinoma?', 'Neuroendocrinologia'],
  ['cisto da bolsa de Rathke incidental', 'Neuroendocrinologia'],
  ['ressecao total macroscopica ou parcial no craniofaringioma?', 'Neuroendocrinologia'],
  ['via transesfenoidal ou transcraniana?', 'Neuroendocrinologia'],
  ['mutacao CTNNB1 no adamantinomatoso', 'Neuroendocrinologia'],
  ['panhipopituitarismo apos cirurgia', 'Neuroendocrinologia'],
  // ⚠️ A sentinela que manteve `celulas germinativas` SOLTO fora do mapa: tumor
  // de células germinativas TESTICULAR é bem mais comum, e a área masculina está
  // vazia — mandá-lo para a hipófise seria trocar buraco por erro.
  ['tumor de celulas germinativas testicular com beta-hCG', '(vazio)'],
  ['velocidade de crescimento reduzida com hipotireoidismo', 'Tireoide'],

  // ⚠️ O ROTEADOR NÃO TINHA UMA ÚNICA PALAVRA HEPÁTICA. Zero ocorrências de
  // `hepat`, `esteatos`, `nafld`, `masld`, `nash`, `figado`, `fibrose` ou
  // `cirrose` no mapa inteiro, e 16 de 16 termos testados devolviam "". A doença
  // hepática gordurosa é a interseção de obesidade, diabetes e lípides — e era
  // invisível pelas três. As DUAS nomenclaturas entram: o artigo é da virada de
  // NAFLD/NASH para MASLD/MASH e o médico digita as duas.
  ['esteatose hepatica em paciente obeso: preciso investigar fibrose?', 'Obesidade'],
  ['FIB-4 de 1,8: o que faco?', 'Obesidade'],
  ['NASH tem tratamento aprovado?', 'Obesidade'],
  ['MASLD: qual o criterio diagnostico?', 'Obesidade'],
  ['quando encaminho ao hepatologista?', 'Obesidade'],
  ['elastografia hepatica com 14 kPa', 'Obesidade'],

  // ⚠️ A BASE NÃO SABIA RESPONDER "O QUE COMER" (08/08/2026). Entrou o
  // Posicionamento Nutricional da ABESO (138 fatos) e, medido termo a termo,
  // 24 assuntos dele não tinham NENHUMA rota. Estas são as que a medição pegou.
  // ⚠️ NENHUMA DELAS PODE CONTER "emagrecer" NEM "obesidade". Escrevi as 15
  // primeiras com essas palavras, conferi por mutação e SEIS passavam com o
  // conserto desfeito — `emagrecer` e `obesidade` já roteavam sozinhas e as
  // chaves novas não estavam sendo medidas em nada. Acerto emprestado outra vez.
  // Cada pergunta abaixo devolvia "(vazio)" antes do conserto.
  ['posso indicar jejum intermitente?', 'Obesidade'],
  ['dieta low carb tem risco?', 'Obesidade'],
  ['dieta do mediterraneo: qual a evidencia?', 'Obesidade'],
  ['dieta DASH', 'Obesidade'],
  ['adocante aspartame faz mal?', 'Obesidade'],
  // Sem `adocante` na frase, senão a chave genérica carrega o adoçante nomeado
  // e o mapa de edulcorantes fica sem medição nenhuma.
  ['aspartame causa cancer?', 'Obesidade'],
  ['indice glicemico dos alimentos', 'Obesidade'],
  ['substitutos de refeicao funcionam?', 'Obesidade'],
  ['whey protein emagrece?', 'Obesidade'],
  ['oleo de coco emagrece?', 'Obesidade'],
  ['garcinia cambogia emagrece?', 'Obesidade'],
  ['balao intragastrico', 'Obesidade'],
  ['telenutricao', 'Obesidade'],
  ['densidade energetica da dieta', 'Obesidade'],
  ['VLCD dieta de muito baixas calorias', 'Obesidade'],
  // Sem "IMC" na frase: `imc` é chave antiga e roteava sozinha, deixando
  // `escore-z` sem medição — foi o que a mutação pegou.
  ['escore-Z de 2,5 na crianca', 'Obesidade'],
  // ⚠️ `cetogenica` APONTAVA PARA DIABETES e a palavra tem ZERO ocorrência em
  // todo o conteúdo de Diabetes. A única está na ABESO, em Obesidade — e é
  // justamente a que diz que a VLCKD é potencialmente DELETÉRIA no DM1. A
  // pergunta mais perigosa das duas ia para o lado que não tem a advertência.
  ['dieta cetogenica para emagrecer', 'Obesidade'],
  ['dieta cetogenica no diabetes tipo 1 e segura?', 'Obesidade'],
  // A chave CURTA `cetogenica` existe separada da frase `dieta cetogenica`, e
  // esta é a única pergunta que a mede: sem "dieta" colado, a frase longa não
  // casa e só a chave curta segura a rota.
  ['cetogenica funciona?', 'Obesidade'],
  // ⚠️ LIMITE CONHECIDO, registrado em vez de contornado. "alimentação
  // cetogênica no diabetes tipo 1" vai para DIABETES: `cetogenica`(3010) perde
  // para `diabetes tipo 1`(3015) e só a frase `dieta cetogenica`(3016) vence.
  // NÃO inflei o peso da chave curta, pelo motivo já medido no caso do Esporte
  // (ver `areasOrdenadas`): qualquer peso que vença `diabetes tipo 1` vence
  // junto `osteoporose`(3011) e `prolactinoma`(3012), e aí a cetogênica passa a
  // sequestrar a base inteira. O grafismo padrão em português é "dieta
  // cetogênica", que está coberto; esta linha existe para que o dia em que
  // alguém resolver o resto saiba exatamente o que estava quebrado.
  ['alimentacao cetogenica no diabetes tipo 1 e segura?', 'Diabetes'],
  // O outro prato: a rota da cetoacidose não pode ter sido levada junto.
  ['paciente com cetoacidose diabetica: reposicao de volume', 'Diabetes'],
  // `compulsao alimentar` entrou com peso de ACHADO justamente para que as DUAS
  // rotas abaixo estejam certas — a compulsão é sintoma dos dois quadros.
  ['compulsao alimentar: como abordo?', 'Obesidade'],
  ['compulsao alimentar no craniofaringioma', 'Neuroendocrinologia'],

  // ⚠️ `cirurgia bariatrica` ERA PROCEDIMENTO (2000) e cedia a qualquer doença
  // nomeada. Medido: Diabetes tem UMA ocorrência de "bariátric" em toda a base
  // profunda contra 172 em Obesidade, e a pergunta ia para Diabetes.
  ['indico cirurgia bariatrica para IMC 38 com diabetes tipo 2?', 'Obesidade'],
  ['cirurgia bariatrica no diabetes tipo 2', 'Obesidade'],
  // ...e `bariatrica` SOZINHA continua cedendo, de propósito: menção de
  // passagem não é o assunto. Estas duas guardam a metade conservadora do
  // conserto — se alguém promover a chave curta junto, elas reprovam.
  ['gastroparesia apos bariatrica em diabetico', 'Diabetes'],
  ['bariatrica e diabetes', 'Diabetes'],

  // ⚠️ DOIS AR GLP-1 SEM ROTA, UM DELES COM A MARCA JÁ NO MAPA (08/08/2026).
  // "diarreia persistente com dulaglutida" devolvia "" — nenhuma área — porque
  // `trulicity` estava no mapa e `dulaglutida` não. O nome genérico é o que o
  // médico prescreve. As duas têm conteúdo (10 e 9 ocorrências) no artigo de
  // eventos adversos gastrintestinais, que é exatamente o que responde.
  ['diarreia persistente com dulaglutida: o que faco?', 'Obesidade'],
  ['lixisenatida causa nausea?', 'Obesidade'],
  // Peso de fármaco: com a doença nomeada, a doença continua vencendo.
  ['dulaglutida no diabetes tipo 2', 'Diabetes'],
  // ⚠️ ESTA É A LINHA QUE MEDE O TIER, e escrevi só depois de a mutação passar:
  // tirar as duas de CAT_FARMACO não reprovava nada, porque `diabetes tipo 2`
  // (15 chars) vence a dulaglutida nos dois tiers. Com uma sigla CURTA de doença
  // a diferença aparece — `sop`(3) só ganha do fármaco se ele for fármaco. E o
  // destino está conferido: Feminina responde (177 "SOP", 4 "GLP-1"), Obesidade
  // não tem SOP nenhuma. GLP-1 na SOP é pergunta de consultório, não hipótese.
  ['dulaglutida na SOP', 'Endocrinologia Feminina'],
  // ⚠️ SENTINELA DE ROTA VAZIA. `albiglutida`, `retatrutida`, `survodutida`,
  // `orforglipron` e `beinaglutida` foram conferidas uma a uma e têm ZERO
  // conteúdo na base. Rota para conteúdo que não existe devolve bloco vazio com
  // cara de resposta — pior que buraco. Se alguém acrescentar o termo sem
  // acrescentar o artigo, esta linha reprova.
  ['albiglutida', '(vazio)'],

  // ⚠️ VARREDURA DE "CONTEÚDO SEM ROTA" (08/08/2026). Em vez de sondar bloco a
  // bloco, listei os termos DISTINTIVOS de cada área (≥85% das ocorrências numa
  // área só) e perguntei quais não têm nenhuma rota. Deu 137. Estes são os que
  // um médico digita de verdade — cada um conferido por contagem antes de entrar.
  //
  // MACRO e MICRO não casavam `prolactinoma`: `bate` exige fronteira de palavra
  // e o "o" de macro é alfanumérico. 84 ocorrências mudas, e macro x micro é A
  // distinção clínica da doença.
  // Sem `cabergolina` na frase: ela é chave antiga de Neuro e roteava sozinha.
  ['macroprolactinoma de 2 cm: opero?', 'Neuroendocrinologia'],
  ['microprolactinoma na gestacao: suspendo a cabergolina?', 'Neuroendocrinologia'],
  // Alvo co-primário do LDL, 44 ocorrências, nenhuma rota. E `triglicerides` —
  // a palavra que se lê no exame — só roteava como `hipertrigliceridemia`.
  // Sem "LDL": `ldl` é chave antiga e carregava o teste inteiro.
  ['nao-HDL alto: o que faco?', 'Lípides'],
  ['triglicerides de 800: risco de pancreatite?', 'Lípides'],
  ['apolipoproteina B na estratificacao de risco', 'Lípides'],
  // `supracorrecao` (38) é a palavra do ERRO que se quer evitar; só
  // `desmielinizacao osmotica`, que é a consequência, tinha rota.
  // Sem "sódio": `sodio` é chave antiga de Endocrinopatias.
  ['supracorrecao: qual o limite em 24 h?', 'Endocrinopatias'],
  // `anovulacao`(3) roteava e `ovulacao`(29) não; `letrozol`(6) sim, `clomifeno`(19) não.
  ['inducao da ovulacao na SOP: letrozol ou clomifeno?', 'Endocrinologia Feminina'],
  ['clomifeno falhou: qual o proximo passo?', 'Endocrinologia Feminina'],
  // `apneia obstrutiva do sono` estava por extenso; `apneia do sono`, como se
  // fala, não. `bypass` sozinho idem — "bypass em Y de Roux" devolvia vazio.
  ['apneia do sono no obeso: como rastreio?', 'Obesidade'],
  ['bypass em Y de Roux: qual a reposicao de ferro?', 'Obesidade'],
  // ⚠️ RADIOTERAPIA VIROU PROCEDIMENTO depois de criar erro de rota como doença:
  // "radioterapia no câncer de tireoide" ia para o artigo de CRANIOFARINGIOMA,
  // porque `radioterapia`(3012) vencia `tireoide`(3008). Tireoide não tem
  // conteúdo de radioterapia — nenhuma das duas responde — mas buraco avisa e
  // erro de rota não. Estas duas guardam os dois lados.
  ['radioterapia no cancer de tireoide', 'Tireoide'],
  ['radioterapia apos ressecao de craniofaringioma', 'Neuroendocrinologia'],
  // ⚠️ CGM: o vocabulário inteiro estava mudo. Ele ficou em DIABETES e não em
  // Esporte, contra a regra do conteúdo (45 ocorrências lá, 14 aqui) — porque
  // chave de Esporte é GATILHO da promoção condicional, e transformar um
  // DISPOSITIVO em gatilho de esporte alargou uma regra escrita estreita de
  // propósito. As duas primeiras linhas abaixo são as que reprovavam quando eu
  // tinha posto em Esporte; as duas últimas garantem que o esporte não se perdeu.
  ['tempo no alvo no CGM: qual a meta?', 'Diabetes'],
  ['CGM no diabetes tipo 2 em insulina', 'Diabetes'],
  ['como interpreto o CGM?', 'Diabetes'],
  ['CGM durante o exercicio aerobico', 'Endocrinologia do Esporte'],

  // ⚠️ SEGUNDA PASSADA DA MESMA VARREDURA, agora em FRASES (bigramas e
  // trigramas distintivos, ≥90% numa área) em vez de palavras soltas. A lista de
  // palavras era ruidosa; a de frases trouxe as entidades clínicas de verdade.
  // Cada pergunta abaixo devolvia "(vazio)" antes — conferido contra a árvore
  // antiga, porque `siadh`, `estatina` e `dm2` estavam carregando três delas.
  ['quando suspendo o agonista dopaminergico?', 'Neuroendocrinologia'],
  ['restricao hidrica: quantos ml por dia?', 'Endocrinopatias'],
  ['como calculo o deficit de agua livre?', 'Endocrinopatias'],
  ['debito urinario alto durante a correcao', 'Endocrinopatias'],
  ['sintomas musculares: suspendo o remedio?', 'Lípides'],
  ['miopatia com CK 10 vezes o normal', 'Lípides'],
  ['paciente de risco extremo: qual a meta?', 'Lípides'],
  ['banda gastrica ainda se usa?', 'Obesidade'],
  ['PTDM: quando rastrear?', 'Diabetes'],
  ['hormonio tireoidiano no idoso', 'Tireoide'],
  ['funcao das celulas beta se recupera?', 'Diabetes'],
  // ⚠️ `mialgia` SOZINHA ficou de fora e estas duas guardam a decisão: 3
  // ocorrências em Lípides contra 5 espalhadas por Adrenal, Diabetes, Obesidade
  // e Osteometabolismo. Mialgia é sintoma de todo mundo; sintoma muscular DE
  // ESTATINA é assunto de Lípides. Se alguém promover `mialgia`, elas reprovam.
  ['mialgia na insuficiencia adrenal', 'Adrenal'],
  ['miopatia por hipotireoidismo', 'Tireoide'],

  // Sentinelas de outras áreas — o achado glicêmico não pode sequestrá-las.
  ['hiperglicemia em paciente com acromegalia', 'Neuroendocrinologia'],
  ['obeso em insulina: indico cirurgia bariatrica?', 'Obesidade'],
  ['hipoglicemia pos-prandial dois anos apos bypass gastrico', 'Obesidade'],
  ['paciente em insulina com nodulo tireoidiano de 2 cm', 'Tireoide'],
  ['tempestade tireoidiana com Burch-Wartofsky 55', 'Tireoide'],
  ['crise adrenal: dose de hidrocortisona', 'Adrenal'],
  ['LDL 190 sem doenca cardiovascular: estatina de alta potencia?', 'Lípides'],
  ['hiponatremia de 118 com osmolalidade urinaria alta', 'Endocrinopatias'],
  ['craniofaringioma com obesidade hipotalamica apos cirurgia', 'Neuroendocrinologia'],
  ['etilista cronico, dor abdominal e anion gap alto: o que penso?', 'Diabetes'],
];

for (const [pergunta, esperado] of CAMINHO) {
  const veio = deep.canonArea(pergunta) || '(vazio)';
  ok(veio === esperado, `"${pergunta}" → esperado ${esperado}, veio ${veio}`);
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. CHEGADA — o bloco devolvido contém mesmo o assunto?
// ─────────────────────────────────────────────────────────────────────────────
// Rotear certo e receber o bloco errado é falha silenciosa: a IA responde com
// conteúdo da área certa e do assunto errado, sem nenhum sinal.
const CHEGADA = [
  ['EHH em idoso com glicemia 900', 'hiperosmolar'],
  ['paciente em corticoide em dose alta: em que horario medir a glicemia?', 'corticoide'],
  ['cetoacidose alcoolica em paciente sem diabetes: preciso de insulina?', 'alcool'],
  ['osteoporose refrataria com fosfatase alcalina baixa: posso dar bisfosfonato?', 'bisfosfonato'],
  ['maratonista com diabetes tipo 1: alvo de glicose antes do treino', 'exerc'],
  ['FIB-4 de 1,8: o que faco?', 'fib-4'],
  ['quando encaminho ao hepatologista?', 'hepatolog'],
  // ⚠️ Obesidade passou de 68k (2 blocos) para 148k (4 blocos) em 08/08/2026 e
  // ATRAVESSOU o teto de 120k. A partir daqui, bloco não escolhido é bloco que
  // não existe — a mesma condição que escondeu o conteúdo de estado hiperosmolar
  // em Diabetes. Estas três sondam o conteúdo dos blocos NOVOS.
  ['orlistate: ainda tem lugar?', 'orlistat'],
  ['fentermina-topiramato em quem?', 'fentermina'],
  ['indico cirurgia bariatrica: quais os riscos?', 'bariátric'],
];

for (const [pergunta, marca] of CHEGADA) {
  const area = deep.canonArea(pergunta);
  const txt = area ? deep.deepFor(area, 120000, pergunta) : '';
  ok(txt.toLowerCase().includes(marca),
    `"${pergunta}" roteia para ${area || '(vazio)'} mas o bloco (${(txt.length / 1000).toFixed(0)}k) `
    + `NÃO contém "${marca}" — área certa, assunto errado`);
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. QUAL BLOCO VEM PRIMEIRO — a peneira mais fina das três
// ─────────────────────────────────────────────────────────────────────────────
// ⚠️ ESTE BLOCO EXISTE PORQUE O TESTE ACIMA NÃO BASTOU. Consertei uma cegueira
// real do `deepFor` (o nome da área era removido como SUBSTRING, e
// "pre-diabetes" virava "pre-", morrendo no filtro de 4 letras), reintroduzi o
// defeito por mutação para conferir a rede — e as 46 medições acima passaram
// alegremente. Peneira que não pega o defeito que acabou de ser consertado não
// é rede, é enfeite.
//
// O que discrimina é a ORDEM. Diabetes tem 232k de conteúdo contra teto de
// 120k, então o que importa não é o bloco existir, é ele ser escolhido. Com a
// cegueira, "Pré-diabetes pode reverter sozinho?" devolvia o bloco de
// hiperglicemia por CORTICOIDE em primeiro e o de pré-diabetes sumia inteiro.
const PRIMEIRO = [
  ['Pre-diabetes pode reverter sozinho?', 'pré-diabetes'],
  ['Como confirmo prediabetes?', 'pré-diabetes'],
  ['paciente com CAD e pH 7,1: quando comeco a insulina?', 'cetoacidose'],
  ['maratonista com diabetes tipo 1: alvo de glicose antes do treino', 'exerc'],
  // ⚠️ EM OBESIDADE A CHEGADA NÃO DISCRIMINA MAIS, e por isso estas vieram para
  // cá. A área passou a 338k contra teto de 120k e o bloco nutricional sozinho
  // ocupa 62k: qualquer pergunta que o eleja recebe um texto que contém TODAS as
  // palavras de dieta, então "o bloco contém a palavra" volta verdadeiro mesmo
  // quando a escolha foi por acaso. Medido: 18 perguntas de nutrição devolviam
  // 113 265 chars — o MESMO número nas 18. O que ainda discrimina é a ORDEM.
  ['posso indicar jejum intermitente?', 'tratamento nutricional'],
  ['adocante aspartame faz mal?', 'tratamento nutricional'],
  ['whey protein emagrece?', 'tratamento nutricional'],
  ['dieta cetogenica no diabetes tipo 1 e segura?', 'tratamento nutricional'],
  // A contraprova do mesmo teto: dentro de Obesidade, a cirurgia tem de vencer
  // o bloco nutricional — senão a promoção de `cirurgia bariatrica` só trocou
  // um sequestro por outro, agora dentro da própria área.
  ['indico cirurgia bariatrica para IMC 38 com diabetes tipo 2?', 'cirurgia bariátrica'],
  // ⚠️ O ARTIGO INTEIRO DE DUMPING NÃO CHEGAVA À PERGUNTA QUE DIZ "DUMPING"
  // (08/08/2026). O bloco tem 78 ocorrências da palavra e tema de 129 chars —
  // "Síndrome de dumping após cirurgia gástrica…" — e perdia para dois blocos de
  // tema-lista (1.804 e 2.466 chars) que pontuavam +3 em `apos`, `anos` e
  // `dois`. Chegavam 6 menções de dumping em vez de 85. Duas causas somadas:
  // palavra de pergunta valendo 3 pontos, e empate desfeito pela ordem do
  // montador em vez de pela especificidade do tema.
  ['dumping tardio dois anos apos bypass: como investigo?', 'dumping'],
];

for (const [pergunta, esperado] of PRIMEIRO) {
  const area = deep.canonArea(pergunta);
  const txt = area ? deep.deepFor(area, 120000, pergunta) : '';
  const cab = ((txt.match(/• ([^\n]{0,80})/) || [])[1] || '(nenhum bloco)').toLowerCase();
  ok(cab.includes(esperado),
    `"${pergunta}" → o PRIMEIRO bloco é "${cab.slice(0, 56)}", esperado um que contenha "${esperado}"`);
}

if (falhas) {
  console.error(`\n✗ caminho clínico: ${falhas} falha(s) de ${CAMINHO.length + CHEGADA.length + PRIMEIRO.length} medição(ões).`);
  process.exit(1);
}
console.log(`✓ caminho clínico: ${CAMINHO.length} roteamento(s) + ${CHEGADA.length} chegada(s) + ${PRIMEIRO.length} ordem(ns)`);
