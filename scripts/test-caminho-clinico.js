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

  // ⚠️ QUEM JÁ SABE O DIAGNÓSTICO CHEGAVA; QUEM ESTAVA DIAGNOSTICANDO, NÃO.
  // A osteogênese imperfeita (30k) só era alcançável pelo PRÓPRIO NOME: das 7
  // formas naturais de perguntar por ela, 6 caíam em NENHUMA área — o sinal, a
  // classificação, o gene, o achado associado e a apresentação. Achado em
  // 09/08/2026 varrendo as 4 áreas que CABEM no teto: elas não podem sofrer
  // evicção, mas sofrem o defeito anterior a ela, que é não ser consultada.
  // Cada chave foi contada antes de entrar (`esclera` 12 na área contra 1 em
  // toda a base; as outras, exclusivas). `perda auditiva` ficou de fora de
  // propósito, apesar de dominar 7 a 1: sintoma genérico sequestra área — e a
  // última linha deste bloco é a prova viva disso.
  ['crianca com fraturas de repeticao e escleras azuladas', 'Osteometabolismo'],
  ['classificacao de Sillence: como uso?', 'Osteometabolismo'],
  ['mutacao em COL1A1: qual doenca?', 'Osteometabolismo'],
  ['dentinogenese imperfeita: qual a doenca de base?', 'Osteometabolismo'],
  ['crianca com fragilidade ossea e perda auditiva', 'Osteometabolismo'],
  ['antirreabsortivo esta contraindicado em quem?', 'Osteometabolismo'],
  ['perda auditiva no hipotireoidismo', 'Tireoide'], // guarda: `esclera` não pode virar `perda auditiva`

  // ⚠️ HIPOPARATIREOIDISMO (diretriz internacional 2022, extraída em 09/08/2026).
  // O roubo era de área: "hipocalcemia após tireoidectomia total" caía em
  // TIREOIDE, porque `tireoidectomia` é CAT_FARMACO (2000) e nada levava para
  // Osteometabolismo. A pergunta é da PARATIREOIDE — a cirurgia da tireoide é só
  // a causa. `hipocalcemia` vale 3000 e ganha.
  ['hipocalcemia apos tireoidectomia total', 'Osteometabolismo'],
  ['hipoparatireoidismo pos-cirurgico: como manejo?', 'Osteometabolismo'],
  ['hipercalciuria no hipoparatireoidismo: uso tiazidico?', 'Osteometabolismo'],
  ['autotransplante de paratireoide: quando indico?', 'Osteometabolismo'],
  ['APECED e gene AIRE', 'Osteometabolismo'],
  // …e os controles que a chave nova poderia ter sequestrado:
  ['tireoidectomia total por cancer: qual a extensao?', 'Tireoide'],
  ['crise tireotoxica apos tireoidectomia', 'Tireoide'],
  ['hipoglicemia grave no diabetico', 'Diabetes'],
  // ⚠️⚠️ SENTINELA DE UMA OMISSÃO DELIBERADA, e a razão não é dominância — é DANO.
  // `tetania`, `chvostek` e `trousseau` NÃO podem rotear enquanto a base só tiver
  // a diretriz CRÔNICA de 2022. Conferi na fonte: ZERO ocorrência de tetany,
  // Chvostek, Trousseau, paresthesia, cramp e tingling, e ZERO de cálcio
  // intravenoso, gluconato, infusão, ECG e emergency. Ela manda mirar a metade
  // INFERIOR da faixa normal — conselho de manutenção. Entregá-lo a quem tem um
  // doente em tetania repete o acidente da hiponatremia aguda, que recebia o
  // bloco da correção LENTA. Quem trouxer fonte de hipocalcemia AGUDA remove
  // estas duas linhas; até lá, roteá-las é regressão.
  ['tetania com Chvostek positivo', '(vazio)'],
  ['sinal de Trousseau: o que investigo?', '(vazio)'],
  // …mas a APRESENTAÇÃO chega, e a linha entre as duas coisas foi medida, não
  // argumentada: "formigamento perioral após cirurgia de pescoço" é a pergunta
  // DIAGNÓSTICA ("isto é hipoparatireoidismo?"), que é exatamente o que a
  // diretriz de 2022 responde. O que me convenceu foi ler a ENTREGA: o bloco
  // que chega à IA declara sozinho o que a fonte não cobre ("não responde",
  // "o que infundir", "emergênc"). Sem essa declaração no texto entregue, estas
  // duas linhas teriam de sair junto com as de cima.
  ['formigamento perioral e caimbras apos cirurgia de pescoco', 'Osteometabolismo'],
  ['parestesia perioral apos cirurgia cervical', 'Osteometabolismo'],
  // sentinela: a parestesia do DIABÉTICO é neuropatia, não hipocalcemia
  ['parestesia nos pes do diabetico', 'Diabetes'],
  ['formigamento nos pes e queimacao a noite no diabetico', 'Diabetes'],

  // ⚠️ OSTEOPOROSE (Manual Brasileiro 2021, extraído em 09/08/2026). A área
  // tinha só hipofosfatasia e osteogênese imperfeita — duas doenças RARAS —, e a
  // doença óssea MAIS COMUM não tinha bloco. Era a mesma distorção que fez
  // Diabetes ser a primeira da fila (130 fatos, 109 de pós-transplante).
  ['FRAX de 22% em risco maior: trato?', 'Osteometabolismo'],
  ['escore T de -2,7 no femur: e osteoporose?', 'Osteometabolismo'],
  ['fratura de quadril apos queda da propria altura', 'Osteometabolismo'],
  ['fratura atipica de femur com dor subtrocanterica', 'Osteometabolismo'],
  ['perda de altura de 4 cm no idoso: investigo?', 'Osteometabolismo'],
  ['CTX e P1NP: para que servem?', 'Osteometabolismo'],
  ['dor ossea com fratura sem trauma no idoso', 'Osteometabolismo'],
  // …e os dois termos que MEDI E RECUSEI, cada um com sentinela na área que os
  // domina: `sarcopenia` é de Obesidade (5 contra 21 fora) e `artefato` é de
  // Tireoide (3 contra 27). Chave exclusiva hoje pode ser roubo amanhã.
  ['sarcopenia na obesidade do idoso', 'Obesidade'],
  ['artefato de ensaio por biotina no TSH', 'Tireoide'],

  // ⚠️ HIPERCALCEMIA — os DOIS lados do PTH entraram juntos em 09/08/2026, e a
  // regra que eu tinha escrito exigia isso: `pth` ficara de fora porque levaria
  // "hipercalcemia com PTH inapropriadamente normal" a uma área cujo único bloco
  // de paratireoide era o de HIPOpara — área certa, bloco errado.
  ['hipercalcemia com PTH inapropriadamente normal', 'Osteometabolismo'],
  ['hipercalcemia da malignidade: como trato?', 'Osteometabolismo'],
  ['PTHrP elevado em paciente oncologico', 'Osteometabolismo'],
  ['crise hipercalcemica: hidratacao e depois?', 'Osteometabolismo'],
  ['calciuria de 24 horas de 450 mg', 'Osteometabolismo'],
  // ⚠️ E O MÉDICO NEM SEMPRE ESCREVE O NOME DA CONDIÇÃO. Esta continuava sem
  // área DEPOIS de `hipercalcemia` entrar, e é a formulação mais comum de todas
  // — hipercalcemia costuma ser achado de exame de rotina.
  ['calcio alto achado por acaso no exame', 'Osteometabolismo'],
  // ⚠️ ERRO DE ROTA, não buraco: caía em TIREOIDE porque `cintilografia` (13
  // letras → 3013) ganhava de `paratireoide` (12 → 3012) por UM PONTO no
  // desempate por comprimento. `sestamibi` sozinho não conserta — só a frase.
  ['cintilografia de paratireoide', 'Osteometabolismo'],
  ['cintilografia com sestamibi', 'Osteometabolismo'],
  ['osteoporose induzida por glicocorticoide: quem trato?', 'Osteometabolismo'],
  // …e as sentinelas do que NÃO pode ter sido roubado. `tiazidico` foi proposto
  // como exclusivo por DOIS agentes e não é: 29 aqui contra 19 fora, porque
  // hiponatremia por tiazídico é de Endocrinopatias. Contei antes de aplicar.
  ['hiponatremia por tiazidico na idosa', 'Endocrinopatias'],
  ['cintilografia de tireoide com captacao alta', 'Tireoide'],
  ['hipotireoidismo induzido por litio', 'Tireoide'],

  // ⚠️ O ACERVO É DE MANEJO, NÃO DE DIAGNÓSTICO — medido em 09/08/2026 com 25
  // apresentações escritas como o médico pergunta quando AINDA NÃO tem o
  // diagnóstico. 18 das 25 não chegavam a área nenhuma. Fui ver a causa e na
  // maioria NÃO é roteamento: 12 assuntos grandes não têm um único bloco na
  // base (hipotireoidismo, nódulo, Cushing, feocromocitoma, hiperaldosteronismo,
  // hipercalcemia, hipoparatireoidismo, osteoporose, menopausa, baixa estatura).
  // Rotear esses para uma área sem o artigo entregaria o artigo errado — pior
  // que não rotear. Ficam como LACUNA DE ACERVO, não como chave faltando.
  // Só entraram as duas em que o artigo EXISTE e estava parado ao lado.
  ['mulher com ciclos irregulares e acne', 'Endocrinologia Feminina'],
  ['ciclo menstrual irregular ha um ano', 'Endocrinologia Feminina'],
  ['intolerancia ao calor e sudorese', 'Tireoide'],

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

  // ⚠️ ERRO DE ROTA QUE EU MESMA CRIEI HOJE, achado pelo auditor da DHGNA. Pus
  // `pos-transplante` em Diabetes junto com `ptdm`, e como DOENÇA (3015) ele
  // passou a vencer `nash`(3004): "NASH pós-transplante hepático" ia para
  // Diabetes e os 7 fatos de esteato-hepatite no enxerto ficavam inalcançáveis.
  // Medido: `pos-transplante` está DIVIDIDO (Obesidade 8, Diabetes 7) — não é
  // chave de uma área só. Virou ACHADO; as duas rotas abaixo guardam os dois
  // lados, e `ptdm`(68 ocorrências) segura o lado diabetológico sozinho.
  ['NASH pos-transplante hepatico', 'Obesidade'],
  ['esteato-hepatite recorrente apos transplante hepatico', 'Obesidade'],
  ['diabetes pos-transplante com tacrolimo', 'Diabetes'],
  // Vocabulário hepático que o auditor achou mudo, cada termo medido antes:
  // Sem "DHGNA" na frase: ela já roteava sozinha e carregava o teste.
  ['carcinoma hepatocelular: quando rastrear?', 'Obesidade'],
  ['fibrose avancada: encaminho?', 'Obesidade'],
  ['LSM de 11 kPa', 'Obesidade'],
  ['enzimas hepaticas elevadas', 'Obesidade'],
  // ...e a sentinela que impede `enzimas hepaticas` de roubar a estatina:
  ['enzimas hepaticas em uso de estatina', 'Lípides'],
  // ⚠️ `cirrose` FICOU FORA DO MAPA e estas duas guardam a decisão. O conteúdo
  // está EMPATADO (Endocrinopatias 25 x Obesidade 24) e, mesmo com peso de
  // achado, `cirrose`(7 chars) vence `sodio`(5) por comprimento — mandando a
  // hiponatremia da cirrose para Obesidade. Fora do mapa, quem decide é o resto
  // da frase e as DUAS acertam. Termo empatado é melhor mudo que árbitro.
  ['cirrose com sodio de 120', 'Endocrinopatias'],
  ['cirrose na esteatose hepatica', 'Obesidade'],
  // ⚠️ `ct1` ficou de fora: 9 ocorrências em Obesidade, mas "cT1" é o estádio
  // T1 clínico do TNM e a chave de 3 letras casaria estadiamento oncológico.
  ['estadiamento cT1 do carcinoma de tireoide', 'Tireoide'],

  // ⚠️ `efedrina` REVERTE UMA EXCLUSÃO MINHA DE HOJE DE MANHÃ. Eu a deixara fora
  // por aparecer em três áreas (Obesidade 5, Neuroendocrino 1, Tireoide 1). A
  // exclusão custou caro: "efedrina para perda de peso" devolvia NENHUMA área, e
  // o fato 81 da ABESO é o ÚNICO lugar da base que registra que ela aumenta 2 a
  // 3,5× o risco de eventos psiquiátricos, gastrintestinais e cardíacos
  // INCLUINDO AVC. Buraco em fato de SEGURANÇA é pior que impureza de rota.
  // A segunda linha guarda a outra ponta: com doença nomeada, ela cede.
  ['efedrina para perda de peso', 'Obesidade'],
  ['efedrina no hipertireoidismo', 'Tireoide'],
  // Vocabulário bariátrico e nutricional que o auditor achou mudo:
  ['suplementacao de calcio apos derivacao biliopancreatica', 'Obesidade'],
  ['RYGB: qual a reposicao de ferro?', 'Obesidade'],
  // Sem "emagrecer": ela já roteava sozinha e carregava o teste.
  ['pular o cafe da manha: o que diz a evidencia?', 'Obesidade'],
  ['gordura de coco emagrece?', 'Obesidade'],
  // ⚠️ `perda de peso` CONTINUA FORA, e esta linha guarda a decisão contra o
  // pedido do auditor: aparece em oito áreas, e perda de peso INVOLUNTÁRIA é
  // bandeira vermelha de hipertireoidismo, insuficiência adrenal e neoplasia.
  // Roteá-la para Obesidade responderia a pergunta mais grave com o bloco mais
  // inofensivo. Se alguém a acrescentar, esta reprova.
  ['perda de peso involuntaria com TSH suprimido', 'Tireoide'],

  // ⚠️ TIREOIDE ERA A ÁREA MAIS COMUM COM A COBERTURA MAIS RARA: dois artigos, os
  // dois de quadro raro (doente eutireoidiano e tempestade). Entraram
  // hipertireoidismo (Lancet 2023) e efeitos de fármacos (NEJM 2019).
  // Sem `metimazol`/`tsh`/`tireotoxicose`/`tireoidite` nas quatro abaixo: as
  // primeiras versões tinham, e passavam com o conserto desfeito.
  ['agranulocitose: quando suspeitar?', 'Tireoide'],
  // Separadas: juntas na mesma frase, `ptu` carregava `carbimazol`.
  ['carbimazol: qual a dose inicial?', 'Tireoide'],
  ['PTU no primeiro trimestre', 'Tireoide'],
  ['captacao de 24 horas baixa', 'Tireoide'],
  ['adenoma toxico: radioiodo ou cirurgia?', 'Tireoide'],
  ['propranolol na tempestade tireoidiana', 'Tireoide'],
  // ⚠️ `biotina` é o ARTEFATO QUE IMITA GRAVES — TSH falsamente baixo, T4 livre
  // falsamente alto e TRAb falso-positivo. O NEJM registra que os testes
  // "exactly mimicked the biochemical findings of Graves' disease". Sem rota,
  // trata-se hipertireoidismo que não existe.
  ['paciente em uso de biotina: os exames sao confiaveis?', 'Tireoide'],
  ['inibidor de checkpoint: qual disfuncao endocrina?', 'Tireoide'],
  // ...e a sentinela do outro lado do checkpoint, que é de outra área:
  ['hipofisite por checkpoint', 'Neuroendocrinologia'],
  // ✅ O MARCADOR DE BURACO DE ACERVO DISPAROU, E FOI ATENDIDO (09/08/2026).
  // Esta linha esperava `Tireoide` e trazia escrita a própria condição de
  // validade: *"quando entrar artigo de hipercalcemia, ela deve mudar para
  // Osteometabolismo"*. Em 08/08 a base profunda NÃO respondia hipercalcemia
  // (1 ocorrência em Osteometabolismo, 1 em Adrenal, 2 em Tireoide), e mandar
  // para Osteometabolismo entregaria hipofosfatasia e osteogênese imperfeita —
  // as duas doenças RARAS que eram todo o acervo da área.
  //
  // Entraram os dois lados do PTH: hiperparatireoidismo primário e hipercalcemia
  // PTH-independente. Medido AGORA para esta pergunta: Osteometabolismo entrega
  // **231 menções de hipercalcemia** e 13 de lítio; Tireoide entrega **2**. A
  // rota mudou porque a base mudou, não porque afrouxei o teste.
  // ⚠️ E a metade tireoidiana do lítio continua onde deve: `litio causa bocio?`,
  // `hipotireoidismo induzido por litio` e `bocio por litio` seguem em Tireoide.
  ['litio causa bocio?', 'Tireoide'],
  ['litio no diferencial de hipercalcemia', 'Osteometabolismo'],

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
  const txt = area ? deep.deepFor(area, deep.TETO_PROFUNDO, pergunta) : '';
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
];

for (const [pergunta, esperado] of PRIMEIRO) {
  const area = deep.canonArea(pergunta);
  const txt = area ? deep.deepFor(area, deep.TETO_PROFUNDO, pergunta) : '';
  const cab = ((txt.match(/• ([^\n]{0,80})/) || [])[1] || '(nenhum bloco)').toLowerCase();
  ok(cab.includes(esperado),
    `"${pergunta}" → o PRIMEIRO bloco é "${cab.slice(0, 56)}", esperado um que contenha "${esperado}"`);
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. COMPLETUDE — o artigo que responde chega INTEIRO, não em migalhas
// ─────────────────────────────────────────────────────────────────────────────
// ⚠️ ESTE BLOCO SUBSTITUI UMA ASSERÇÃO DE ORDEM QUE SE PROVOU FRÁGIL, e a troca
// é uma correção de MEDIDA, não um afrouxamento.
//
// O defeito original (08/08/2026) era EVICÇÃO: "dumping tardio dois anos após
// bypass" recebia 6 menções de dumping em vez de 85, porque o artigo inteiro
// era cortado pelo teto. Escrevi a asserção como "qual bloco vem PRIMEIRO", que
// pegava o defeito — mas mede uma coisa mais estreita que o dano.
//
// Horas depois corrigi o `tipo` do Posicionamento da ABESO (estava caindo em
// "outro" por string fora do vocabulário) e a ordem do montador mudou: o bloco
// nutricional subiu de último para 2º. A asserção de ordem reprovou, e o
// conteúdo de dumping continuava chegando INTEIRO — 100% do bloco, 85 menções.
// Ou seja: ela reprovava uma mudança que era melhoria.
//
// Tentei os dois desempates estruturais possíveis e MEDI os dois:
//   · por tema mais CURTO  → 5 perguntas melhores, 2 piores;
//   · por MENOS assuntos reivindicados no tema → mesmo problema.
// Os dois erram no mesmo lugar: o bloco de eventos adversos dos AR GLP-1
// reivindica 60 assuntos e É a resposta certa para "náusea com semaglutida";
// e "hiponatremia de 118" troca o algoritmo pelo bloco do IDOSO, estreitando a
// população sem que a idade tenha sido dita. Tema-lista não é sinal de
// irrelevância — um posicionamento de 260 páginas cobre 90 assuntos mesmo.
//
// Então não enviei heurística nenhuma e passei a medir O DANO, que é
// independente de ordem: o artigo que responde chega quase inteiro?
const COMPLETUDE = [
  // pergunta, área, ÂNCORA (trecho do tema que identifica o bloco-alvo), PALAVRA
  // contada na entrega, % mínimo do bloco que tem de chegar, e mínimo de
  // ocorrências daquela palavra.
  //
  // ⚠️ ÂNCORA E PALAVRA SÃO CAMPOS SEPARADOS DESDE 09/08/2026, e a separação
  // nasceu de um erro DESTA SONDA. Eu tinha um campo só, e usei `tireotoxica`
  // para "tempestade tireoidiana com Burch-Wartofsky 55". A sonda reprovou
  // acusando 3% de chegada — mas o bloco da crise tireotóxica chegava INTEIRO
  // (100%, 15 menções de "burch"). `tireotoxica` casa com 7 dos 9 blocos da
  // área, e o `find` pegou o PRIMEIRO: o artigo da GESTAÇÃO. A sonda mediu um
  // artigo pelo outro — âncora ambígua dentro do meu próprio teste.
  //
  // Ao consertar, achei o mesmo defeito DORMINDO em dois casos que passavam:
  // `dumping` casa com o artigo do dumping E com o da cirurgia bariátrica, e
  // `prolactinoma` com dois blocos. Passavam porque o `find` calhava de pegar o
  // certo — acerto emprestado, igual ao que já me mordeu no roteamento. Agora a
  // âncora que casa com DOIS ARTIGOS reprova por ambiguidade, antes de medir.
  //
  // ⚠️ TIREOIDE ENTROU AQUI EM 09/08/2026 e trouxe um LIMITE MEDIDO. A área foi
  // de 218 para 768 fatos e está em 357k contra teto de 120k — só DOIS blocos
  // cabem por pergunta. O artigo de síndrome do eutireoidiano doente (19,8k,
  // tema de 161 chars) estava sendo EXPULSO por três artigos novos com temas de
  // ~3.000 caracteres, que pontuam +3 em toda palavra genérica de tireoide.
  //
  // Enriqueci o tema do NTIS DUAS VEZES, e só com o que o texto entrega
  // (conferido por contagem: `uti` 11, `rT3` 17, `levotiroxina` 6, `sepse` 4,
  // `jejum` 6, `tsh` 21, `hipotireoidismo` 13). Ganhou a pergunta ACIONÁVEL —
  // "devo repor levotiroxina no doente grave?" foi de 1% para 100%.
  //
  // ⚠️ E NÃO GANHOU a de enquadramento: "paciente em UTI com T3 baixo e TSH
  // normal: é doença tireoidiana?" segue em 1%. PAREI DE PROPÓSITO. Mais
  // palavras no tema seria escrever para vencer a sonda, não para descrever o
  // artigo — o defeito espelho do que consertei no dumping. Fica registrado: o
  // artigo é alcançável pelo NOME da síndrome, por `rT3` e pela pergunta de
  // conduta; não é alcançável por descrição do painel laboratorial. Quem chegar
  // aqui com teto maior, ou com a área dividida, deve retestar aquela frase.
  ['dumping tardio dois anos apos bypass: como investigo?', 'Obesidade', 'dumping apos cirurgia', 'dumping', 90, 50],  // medido: 100%, 85
  ['esteatose hepatica com FIB-4 de 2,1: encaminho?', 'Obesidade', 'hepatica gordurosa', 'hepatica', 90, 40],          // medido: 100%, 88
  ['PTDM: quando rastrear?', 'Diabetes', 'ptdm', 'ptdm', 90, 40],
  ['prolactina de 80 com macroprolactina: e prolactinoma?', 'Neuroendocrinologia', 'prolactinoma', 'prolactinoma', 90, 80], // medido: 100%, 187
  ['devo repor levotiroxina no doente grave com T3 baixo?', 'Tireoide', 'eutireoidiano', 'eutireoidiano', 90, 2],
  ['tempestade tireoidiana com Burch-Wartofsky 55', 'Tireoide', 'crise tireotoxica — diagnostico', 'burch', 90, 10],
  // ⚠️ ESTE É O CASO EM QUE A EVICÇÃO FAZIA MAL, e não só omitia (09/08/2026).
  // Endocrinopatias hoje é hiponatremia inteira: 5 blocos, 170k contra teto de
  // 120k. O bloco da hiponatremia AGUDA SINTOMÁTICA chegava a 1% na pergunta do
  // paciente convulsionando — e no lugar dele chegavam o algoritmo, a
  // fisiopatologia e o bloco da hiponatremia CRÔNICA, cuja mensagem é corrigir
  // DEVAGAR por medo de desmielinização. O médico com um doente convulsionando
  // recebia a recomendação oposta à que precisava: o bloco certo traz bolus de
  // salina hipertônica (43 menções de "bolus" na entrega de hoje).
  //
  // Conserto no DADO: o tema tinha 43 chars — "hiponatremia aguda sintomática —
  // tratamento" — e perdia para vizinhos mais descritivos. Enriquecido só com o
  // que o texto ENTREGA e DOMINA na área (medido bloco a bloco: `bolus` 40 vs
  // ≤3, `salina hipertonica` 19 vs ≤4, `desmopressina` 22 vs ≤4, `edema
  // cerebral` 9 vs ≤3, `150 ml` 6 vs ≤1, `glasgow` 4 vs 0).
  // Conferido nos dois sentidos: 1 pergunta subiu de 1% para 100% e as outras 7
  // do assunto seguem em 100% — enriquecer o tema certo não expulsou vizinho.
  ['hiponatremia com convulsao: quanto de salina hipertonica?', 'Endocrinopatias', 'aguda sintomatica', 'bolus', 90, 20],
  // Diabetes é a área de maior tráfego e está em 2,32x o teto (8 blocos, ~3
  // cabem). Varrida bloco a bloco em 09/08/2026: 9 dos 10 assuntos chegam
  // inteiros. Esta asserção trava o par cuja confusão é perigosa — o bloco da
  // cetoacidose EUGLICÊMICA contra o da CAD clássica: quem pergunta por acidose
  // com glicemia de 180 e recebe só a CAD clássica pode ler o corte de glicemia
  // como motivo para AFASTAR o diagnóstico, que é a armadilha que o próprio
  // núcleo alerta ("glicemia normal não afasta cetoacidose").
  ['paciente em dapagliflozina com acidose e glicemia de 180: e cetoacidose?', 'Diabetes', 'cetoacidose euglicemica', 'euglicemica', 90, 20],
  // ⚠️ AQUI QUEM EXPULSAVA ERA A DIRETRIZ DA GESTAÇÃO, e o risco é de POPULAÇÃO.
  // "doença de Graves: metimazol por quanto tempo?" chegava a 7% no artigo do
  // ADULTO, e 60% da entrega vinha da ATA 2026 de gestação — cuja resposta para
  // antitireoidiano é outra (PTU até 16 semanas). A pergunta não disse gestante.
  //
  // Medi antes de mexer, porque a suspeita óbvia era distorção sistêmica: a ATA
  // ocupa 188k dos 357k da área. NÃO É — em 8 de 10 perguntas não-gestacionais a
  // gestação ocupa só 0–8% da entrega (o pedaço de 3k, que cabe na sobra). O
  // defeito era de UMA pergunta, e a causa era omissão no tema do ADULTO: o
  // artigo é o ÚNICO da área com "18 meses" (2 contra 0 em todos os outros) e
  // seu tema não dizia nada sobre duração. Acrescentado o que ele entrega —
  // 12–18 meses, quando suspender, remissão, recorrência, TBII antes de parar.
  // Resultado: 7% → 100%, com "18 meses" 4x, "remissão" 7x e "TBII" 12x na
  // entrega; as 3 perguntas de gestação seguem em 100%.
  // âncora no trecho que existe ANTES e DEPOIS do conserto, de propósito: se eu
  // ancorasse na frase que acabei de escrever no tema, a asserção reprovaria na
  // árvore antiga por "não achei bloco" — provaria que editei o tema, não que a
  // entrega melhorou. Ancorada assim, ela reprova medindo 7%.
  ['doenca de Graves: metimazol por quanto tempo?', 'Tireoide', 'hipertireoidismo e tireotoxicose no adulto', 'remissao', 90, 4],
];

for (const [pergunta, areaEsperada, ancora, palavra, pctMin, ocorrMin] of COMPLETUDE) {
  const area = deep.canonArea(pergunta);
  const txt = area ? deep.deepFor(area, deep.TETO_PROFUNDO, pergunta) : '';
  const semAcento = (x) => String(x).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  // o montador quebra artigo grande em "(parte N/M — seções)" (monta-base-profunda.js);
  // pedaços do MESMO artigo não são âncoras concorrentes, então o sufixo sai antes de
  // comparar. Dois artigos DIFERENTES sob a mesma âncora, sim, são ambiguidade.
  const temaBase = (t) => semAcento(t).replace(/\s*\(parte \d+\/\d+[\s\S]*$/, '');
  const candidatos = (deep.DEEP[areaEsperada] || []).filter((b) => semAcento(b.tema).includes(ancora));
  if (!candidatos.length) { ok(false, `COMPLETUDE: não achei bloco com "${ancora}" em ${areaEsperada}`); continue; }
  const artigos = new Set(candidatos.map((b) => temaBase(b.tema)));
  if (artigos.size > 1) {
    ok(false, `COMPLETUDE: âncora ambígua — "${ancora}" casa com ${artigos.size} artigos diferentes em `
      + `${areaEsperada}; a medida cairia no artigo errado. Use um trecho do tema que só o alvo tenha`);
    continue;
  }
  // artigo partido pelo montador: mede o maior pedaço, que é o que carrega o conteúdo
  const alvo = candidatos.reduce((a, b) => (b.texto.length > a.texto.length ? b : a));
  // maior prefixo do bloco presente na entrega = quanto dele sobreviveu ao corte
  let lo = 0; let hi = alvo.texto.length;
  while (lo < hi) {
    const m = Math.ceil((lo + hi) / 2);
    if (txt.indexOf(alvo.texto.slice(0, m)) >= 0) lo = m; else hi = m - 1;
  }
  const pct = Math.round((100 * lo) / alvo.texto.length);
  const ocorr = semAcento(txt).split(palavra).length - 1;
  ok(area === areaEsperada && pct >= pctMin && ocorr >= ocorrMin,
    `"${pergunta}" → ${area}: o bloco de "${ancora}" chegou a ${pct}% (mín ${pctMin}%) `
    + `com ${ocorr} ocorrência(s) de "${palavra}" (mín ${ocorrMin}) — artigo cortado é artigo que não existe`);
}

if (falhas) {
  console.error(`\n✗ caminho clínico: ${falhas} falha(s) de ${CAMINHO.length + CHEGADA.length + PRIMEIRO.length + COMPLETUDE.length} medição(ões).`);
  process.exit(1);
}
console.log(`✓ caminho clínico: ${CAMINHO.length} roteamento(s) + ${CHEGADA.length} chegada(s) + ${PRIMEIRO.length} ordem(ns) + ${COMPLETUDE.length} completude(s)`);
