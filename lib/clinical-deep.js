// Endodirect — BASE CLÍNICA PROFUNDA, por subespecialidade.
//
// ── O TETO MORA AQUI, E SÓ AQUI ──────────────────────────────────────────────
// Até 09/08/2026 o número 120000 estava repetido em `api/ai.js`, em
// `monta-base-profunda.js` e em três lugares de cada teste, amarrados por um
// COMENTÁRIO dizendo "mesmo teto de api/ai.js". Comentário não é garantia: se um
// deles mudasse sozinho, o teste passaria a medir uma configuração que ninguém
// roda, e o aviso de corte do montador apontaria para o teto errado. Agora todos
// importam daqui.
//
// ⚠️ SUBIDO DE 120k PARA 400k EM 09/08/2026, por decisão do professor, para
// parar a evicção em Tireoide — que a 120k entregava só 3,7 dos seus 9 blocos
// inteiros por pergunta. Medido: 3,7/9 → 9/9, e o bloco profundo passa de ~29k
// para ~96k tokens NAS ÁREAS GRANDES. Adrenal, Osteometabolismo, Feminina e
// Esporte já cabiam em 120k e não mudam em nada.
//
// ⚠️ ERREI A CONTA NA PRIMEIRA TENTATIVA e o registro fica como aviso: pus 360k
// olhando os 357k de Tireoide, mas 357k é a soma dos `texto` — o que sai de
// verdade inclui `tema` e `fonte` de cada bloco, e são 383.665. Teto de área se
// mede pelo EMITIDO, não pelo conteúdo.
//
// ⚠️⚠️ ISTO COMPRA POUCO TEMPO. Tireoide ocupa 383.665 de 400.000 — 96% do teto,
// folga de 16.335 caracteres. UM artigo de tireoide a mais e a evicção volta, e
// aí não há para onde subir: 400k já é o `TETO_MAXIMO`. A saída seguinte é
// DIVIDIR a subespecialidade (gestação à parte), não subir de novo. O teste
// `test-teto-diretrizes.js` reprova quando uma área passa do teto, para que essa
// volta seja BARULHENTA — foi assim que a evicção passou despercebida até hoje.
const TETO_PROFUNDO = 400000;
const TETO_MAXIMO = 400000;   // trava: nenhum chamador pede mais que o teto de operação
// Teto quando o pedido carrega ANEXO (PDF em `documentBase64` ou texto baixado
// por URL, até 120k chars): os dois viajam no mesmo pedido, e somar 400k a um PDF
// de diretriz estoura o contexto — a importação falha inteira e o usuário perde o
// trabalho. 120k é o valor que conviveu com anexo o tempo todo sem incidente.
// ⚠️ Mora AQUI e não em api/ai.js pelo mesmo motivo dos outros dois: eu tinha
// acabado de centralizar o teto e deixei este número solto no meio do caminho.
const TETO_COM_ANEXO = 120000;
//
// POR QUE ISTO EXISTE (07/08/2026). O `CLINICAL_GUIDELINES` do index.html é o
// NÚCLEO: uma linha por tema, o que a IA nunca pode errar, enviado em TODA
// geração. Ele é o prefixo cacheável e o `api/ai.js` o corta em um teto fixo.
// Ao planejar a leitura do acervo de artigos do Drive, medi o bloco: **59.659 de
// 60.000 caracteres — 341 de folga**. A entrada de MODY que eu tinha acabado de
// acrescentar consumira ~1.470. Ou seja, o núcleo estava a UMA entrada de começar
// a ser cortado em silêncio, perdendo o FIM do bloco em toda chamada de IA.
//
// Um acervo inteiro de endocrinologia não cabe — e nem deveria caber — num único
// bloco enviado em toda chamada. Daí os dois níveis:
//
//   NÚCLEO  (index.html, CLINICAL_GUIDELINES) → sempre presente, curto, canônico.
//   PROFUNDO (este arquivo)                   → detalhe extraído dos artigos
//                                               primários, anexado SÓ quando o
//                                               gerador é daquela subespecialidade.
//
// ⚠️ Fica no SERVIDOR, e não no index.html, por dois motivos:
//   1. o index.html já tem 1,4 MB e o cofre registra dois apagões causados por
//      mudança de JS nele — engordá-lo em centenas de KB é risco desnecessário;
//   2. este conteúdo não precisa trafegar até o navegador do aluno: ele só existe
//      para ancorar a chamada à IA, que acontece aqui.
//
// ⚠️ REGRA DE ENTRADA, inegociável: nada é escrito aqui sem CITAÇÃO LITERAL do
// artigo de origem. Cada fato carrega `fonte` (com ano e periódico) e a extração
// é conferida contra o texto do PDF. Foi assim que o posicionamento de
// hipogonadismo revelou dois erros que a IA vinha repetindo — e é o oposto de
// escrever de memória, que é onde a alucinação entra.
//
// O cache de prompt continua funcionando: o prefixo passa a ser
// `núcleo + profundo(área)`, estável por subespecialidade, então cada área tem a
// sua entrada de cache reaproveitada em todas as gerações daquela área.

// Sinônimos → nome canônico. Espelha AREA_CANON/MURAL_SUBSPECIALTY_FILTERS do
// index.html; um nome fora desta lista simplesmente não recebe bloco profundo.
const CANON = {
  'diabetes': 'Diabetes',
  'obesidade': 'Obesidade',
  'tireoide': 'Tireoide',
  'tireóide': 'Tireoide',
  'adrenal': 'Adrenal',
  'neuroendocrinologia': 'Neuroendocrinologia',
  'neuroendocrino': 'Neuroendocrinologia',
  'osteometabolismo': 'Osteometabolismo',
  'osso': 'Osteometabolismo',
  'lipides': 'Lípides',
  'lípides': 'Lípides',
  'dislipidemia': 'Lípides',
  // ⚠️ HIPOGLICEMIA VIRA SUBESPECIALIDADE PRÓPRIA (19/08/2026) — é a DIVISÃO que
  // o cabeçalho deste arquivo manda fazer quando a área enche, e Diabetes encheu:
  // 370.219 de 400.000, com o compêndio de hipoglicemia da ADA 2026 pesando
  // ~65k. Não havia como caber, e 400k já é o TETO_MAXIMO.
  //
  // A divisão só é honesta porque a palavra ROTEIA: "hipoglicemia" é específica,
  // ao contrário de "criança + obesidade", que é co-ocorrência e o roteador não
  // sabe expressar. E o que se ganha não é só caber — uma pergunta de
  // hipoglicemia recebia 370k de Diabetes, dos quais a parte de hipoglicemia era
  // uma fração; agora recebe 65k inteiramente sobre o assunto perguntado.
  //
  // ⚠️ O QUE ESTA CHAVE PODE ROUBAR foi medido, não presumido: "hipoglicemia"
  // aparece em Diabetes(88), Esporte(76), Obesidade(49) e Adrenal(13). Ela vence
  // por comprimento (3000+12) quem tiver termo mais curto — e PERDE, como tem de
  // perder, para `bypass gastrico`(3015), `insuficiencia adrenal`(3021) e os
  // demais nomes de doença mais longos. Ver a varredura diferencial no cofre.
  'hipoglicemia': 'Hipoglicemia',
  'hipoglicemias': 'Hipoglicemia',

  // ⚠️ DIABETES PÓS-TRANSPLANTE VIRA ÁREA PRÓPRIA (2026-08-21) — mesma divisão
  // que Hipoglicemia sofreu acima, pelo mesmo motivo: Diabetes encheu de novo.
  // Com as três diretrizes SBD 2026 de 21/08 (DMPT, neuropatia periférica e
  // perioperatório) a área foi a 415.302 de 400.000 — ESTOUROU, e 400k já é o
  // TETO_MAXIMO. Sai o DMPT (43.328 = o review de PTDM com 109 fatos + a
  // diretriz SBD 2026 com 36), e Diabetes volta a 371.974 (93%).
  //
  // NADA FOI APAGADO. A pendência do cofre apontava consolidar os quatro blocos
  // de crise hiperglicêmica como alternativa mais barata que dividir — mas ao
  // conferir, dois deles têm tema E fonte IDÊNTICOS e são "parte 1/2" e
  // "parte 2/2" do MESMO consenso (Umpierrez 2024), partido por caber. Não é
  // duplicata: consolidar ali significaria descartar artigo auditado.
  //
  // ⚠️ A DIVISÃO SÓ É HONESTA PORQUE A PALAVRA ROTEIA, e isso foi medido, não
  // presumido: `transplant` aparece 140× em Diabetes contra no máximo 31 em
  // qualquer outra área (Obesidade 31, Lípides 13, Osteometabolismo 13). É
  // termo de doença, não co-ocorrência.
  //
  // ⚠️ E POR ISSO O PERIOPERATÓRIO **NÃO** VIROU ÁREA, embora tenha entrado no
  // mesmo lote: `perioperat` está espalhado — Neuroendocrinologia 35, Obesidade
  // 27, Diabetes 25, Adrenal 11. A palavra não distingue a área, então dividir
  // por ela roubaria pergunta de cirurgia hipofisária e de bariátrica. O bloco
  // do perioperatório fica em Diabetes.
  'diabetes pos-transplante': 'Diabetes pós-transplante',
  'diabetes pós-transplante': 'Diabetes pós-transplante',
  'diabetes pos transplante': 'Diabetes pós-transplante',
  'dmpt': 'Diabetes pós-transplante',
  'ptdm': 'Diabetes pós-transplante',
  'endocrinologia pediatrica': 'Endocrinologia Pediátrica',
  'endocrinologia pediátrica': 'Endocrinologia Pediátrica',
  'endocrinologia feminina': 'Endocrinologia Feminina',
  'endocrinologia masculina': 'Endocrinologia Masculina',
  'andrologia': 'Endocrinologia Masculina',
  'endocrinologia do esporte': 'Endocrinologia do Esporte',
  'endocrinologia esportiva': 'Endocrinologia do Esporte',
  'transgeneridade': 'Transgeneridade',
  'endocrinopatias': 'Endocrinopatias',
  'endocrinologia basica': 'Endocrinologia Básica',
  'endocrinologia básica': 'Endocrinologia Básica'
};

// ⚠️ TERMO CLÍNICO → área. Espelho do CANON, mas para o que o MÉDICO escreve.
//
// POR QUE ISTO EXISTE (07/08/2026). A auditoria da hipofosfatasia/osteogênese
// imperfeita mediu o roteamento e achou o pior resultado possível: a pergunta
// "osteoporose refratária, fosfatase alcalina baixa, posso dar bisfosfonato?"
// canonizava para NADA — bloco profundo de 0 caractere. O único texto que casava
// com Osteometabolismo era a palavra "Osteometabolismo", que nenhum médico
// digita. O artigo que diz `bisphosphonates are contraindicated` estava na base,
// verificado, e não chegava a quem perguntava exatamente por ele.
//
// Regra de entrada: só termo que pertence a UMA subespecialidade sem ambiguidade.
// Nome de doença, de exame ou de classe terapêutica; nunca sintoma genérico
// ("fadiga", "ganho de peso") nem palavra que aparece em outra área.
const TERMOS = {
  // Osteometabolismo
  'osteoporose': 'Osteometabolismo', 'osteopenia': 'Osteometabolismo',
  'osteomalacia': 'Osteometabolismo', 'osteogenese imperfeita': 'Osteometabolismo',
  'hipofosfatasia': 'Osteometabolismo', 'fosfatase alcalina': 'Osteometabolismo',
  'bisfosfonato': 'Osteometabolismo', 'alendronato': 'Osteometabolismo',
  'zoledronato': 'Osteometabolismo', 'risedronato': 'Osteometabolismo',
  'denosumabe': 'Osteometabolismo', 'romosozumabe': 'Osteometabolismo',
  'teriparatida': 'Osteometabolismo', 'abaloparatida': 'Osteometabolismo',
  'asfotase': 'Osteometabolismo', 'densitometria': 'Osteometabolismo',
  // ⚠️ A OSTEOGÊNESE IMPERFEITA SÓ ERA ALCANÇÁVEL PELO PRÓPRIO NOME (09/08/2026).
  // Medido: das 7 formas naturais de perguntar por ela, 6 caíam em NENHUMA área
  // — o sinal ("escleras azuladas"), a classificação (Sillence), o gene (COL1A1),
  // o achado associado (dentinogênese imperfeita) e a apresentação (fragilidade
  // óssea). Quem já sabe o diagnóstico chegava; quem estava DIAGNOSTICANDO, não.
  // Cada chave foi contada antes de entrar — `esclera` 12 em Osteometabolismo
  // contra 1 em toda a base ("esclerose" e "esclerodermia" não casam, divergem
  // na 7ª letra), `col1a1` 11×0, `dentinogenese` 8×0, `sillence` 4×0,
  // `fragilidade ossea` 6×0, `antirreabsortivo` 5×0.
  // ❌ `perda auditiva` FICOU DE FORA apesar de dominar (7 contra 1): é sintoma
  // genérico, e chave genérica é como área é sequestrada. Domínio não basta
  // quando o termo pertence à clínica inteira.
  'esclera': 'Osteometabolismo', 'sillence': 'Osteometabolismo',
  'col1a1': 'Osteometabolismo', 'dentinogenese': 'Osteometabolismo',
  'fragilidade ossea': 'Osteometabolismo', 'antirreabsortivo': 'Osteometabolismo',
  // Hipoparatireoidismo (diretriz internacional 2022, entrou em 09/08/2026).
  // ⚠️ `hipocalcemia` conserta um ROUBO: "hipocalcemia após tireoidectomia
  // total" caía em Tireoide, porque `tireoidectomia` é CAT_FARMACO (2000) e nada
  // levava para cá. Chave simples vale 3000 e ganha — a pergunta é da paratireoide,
  // não da tireoide, mesmo tendo a cirurgia da tireoide como causa.
  // Contado antes de entrar (Osteometabolismo × resto): `hipercalciuria` 12×0,
  // `nefrocalcinose` 8×0, `apeced` 4×0, `cinacalcete` 2×0, `calcitriol` 1×0,
  // `paratireoidectomia` 1×0. `hipocalcemia` é 8×4 — dominância de só 2:1, mas os
  // controles de tireoide e diabetes seguem na área certa (medido).
  'hipocalcemia': 'Osteometabolismo', 'calcitriol': 'Osteometabolismo',
  'hipercalciuria': 'Osteometabolismo', 'nefrocalcinose': 'Osteometabolismo',
  'paratireoidectomia': 'Osteometabolismo', 'cinacalcete': 'Osteometabolismo',
  'apeced': 'Osteometabolismo',
  // `paratireoide` (8×0) resolve sozinha o autotransplante e a glândula removida
  // por engano na cirurgia. Conferido que ela NÃO casa dentro de
  // "hipoparatireoidismo" nem de "hiperparatireoidismo" — são palavras distintas.
  // ❌ `autotransplante` sozinha ficou de fora: é 2×0 hoje, mas autotransplante
  // de ILHOTAS é assunto de Diabetes e está na fila de extração. Chave que só é
  // exclusiva por enquanto é colisão marcada para depois.
  'paratireoide': 'Osteometabolismo',
  // ── Adrenal, leva de 09/08/2026 (hiperaldosteronismo + HAC). Contado no base
  // montada, alvo × resto: `genitalia ambigua` 1×0, `genitalia atipica` 3×0,
  // `perdedor de sal` 1×0, `perdedora de sal` 5×1, `21-hidroxilase` 22×2,
  // `adenoma produtor de aldosterona` 28×0, `cateterismo de veias adrenais` 12×0,
  // `kcnj5` 22×0, `eplerenona` 7×0, `lateralizacao` 11×0.
  //
  // ⚠️ O QUE ESTAS CHAVES CONSERTAM, medido antes: *"recém-nascido com genitália
  // ambígua e hiponatremia, penso em HAC?"* caía em **Endocrinopatias** — o
  // bloco da hiponatremia — e *"crise perdedora de sal no lactente com
  // 21-hidroxilase"* não caía em área nenhuma. É a emergência neonatal da HAC.
  //
  // ⚠️ `21-hidroxilase` tem 2 ocorrências em Endocrinologia Feminina (bloco do
  // hirsutismo). Conferido que a pergunta do hirsutismo CONTINUA lá — ela traz
  // `hirsutismo`, que é chave da área. E de propósito NÃO movi
  // `hiperplasia adrenal congenita` nem `17-hidroxiprogesterona`: mover roubaria
  // o rastreio da forma não clássica de Feminina, onde está o corte de 170–200
  // ng/dL que ESTE artigo não tem.
  // ⚠️ AS TRÊS QUE FALTAVAM ERAM AS DA APRESENTAÇÃO, não as do diagnóstico já
  // sabido (medido em 09/08/2026, teste de ordem da leva): *"HAC não clássica na
  // adolescente"*, *"hipertensão resistente com hipocalemia, rastreio?"* e
  // *"poliúria hipotônica de 6 L/dia"* caíam em **NENHUMA área** — silêncio, que
  // é o pior desfecho. A segunda é o gatilho clássico de rastreio do
  // hiperaldosteronismo, e a revisão que acabou de entrar defende rastrear TODO
  // hipertenso. Contado: `hac` 133×12, `poliuria hipotonica` 12×0,
  // `hipertensao resistente` 2×0, `hipertensao secundaria` 1×0.
  // ⚠️ `hac` tem 3 letras e vive da fronteira de palavra do `bate()`.
  // ❌ `nao classica` (24×13) NÃO entrou: roubaria de Endocrinologia Feminina o
  // rastreio da forma não clássica, onde está o corte de 170–200 ng/dL que o
  // artigo de HAC não tem. ❌ `hipocalemia` também não: 10 aqui contra 35 fora
  // (Diabetes 18 na CAD, Endocrinopatias 11) — a medição confirma a recusa.
  // Síndrome de Cushing (metanálise de acurácia, entrou em 09/08/2026).
  // ⚠️ MEDIDO ANTES: `cushing`, `cortisol` e `dexametasona` JÁ levam a Adrenal, e
  // com o tema novo o bloco de Cushing vence sozinho em "suspeita de Cushing,
  // que exame peço", "cortisol salivar da meia-noite" e "teste de 1 mg" — as
  // chaves que o extrator sugeriu (`cortisol salivar` 21×0, `cortisol livre
  // urinario` 27×0) seriam redundantes, e chave redundante é peso escondido.
  // Entrou só `cushingoide` (5×1), que era o buraco real: a pergunta pelo
  // FENÓTIPO caía em NENHUMA área.
  // ❌ `estrias violaceas`, `giba`, `face em lua cheia`, `fragilidade capilar`
  // têm ZERO ocorrência em toda a base — rotear para elas seria prometer o que
  // não se entrega. É lacuna de acervo, não de roteamento: o artigo que temos
  // responde QUAL EXAME, não QUANDO SUSPEITAR.
  // Feocromocitoma e paraganglioma (NEJM 2019, entrou em 09/08/2026).
  // ⚠️ EU EXTRAÍ O ARTIGO E ESQUECI DE LIGAR O ROTEAMENTO — o bloco ficou
  // inalcançável pelas perguntas que mais o caracterizam. Medido no teste de
  // ordem: *"metanefrinas plasmáticas elevadas, próximo passo"*, *"bloqueio alfa
  // antes da cirurgia, por quantos dias"* e *"SDHB positivo, com que frequência
  // rastreio"* caíam as três em NENHUMA área. É "extração verificada não é
  // entrega" na forma mais crua: o artigo estava na base e não chegava a ninguém.
  // Contado (Adrenal × resto), todos ZERO fora: `paraganglioma` 77, `metanefrina`
  // 30, `bloqueio alfa` 12, `dotatate` 11, `sdhd` 13, `sdhb` 12, `vhl` 12,
  // `sdha` 10, `sdhaf2` 7, `tmem127` 7, `sdhc` 6, `sdhx` 6, `mibg` 5,
  // `normetanefrina` 3, `corpo carotideo` 3, `cromafim` 3, `fenoxibenzamina` 2,
  // `doxazosina` 2, `zuckerkandl` 2.
  // ❌ `catecolamina` (16×7) ficou de fora: a crise tireotóxica tem 4 e a
  // pergunta dela não pode vir para cá. ❌ `cintilografia` também — 2 aqui contra
  // 20 fora (Tireoide 16, e `sestamibi` é de Osteometabolismo).
  'paraganglioma': 'Adrenal', 'metanefrina': 'Adrenal',
  'normetanefrina': 'Adrenal', 'bloqueio alfa': 'Adrenal',
  'fenoxibenzamina': 'Adrenal', 'doxazosina': 'Adrenal',
  'mibg': 'Adrenal', 'dotatate': 'Adrenal',
  'sdhb': 'Adrenal', 'sdhd': 'Adrenal', 'sdha': 'Adrenal', 'sdhc': 'Adrenal',
  'sdhaf2': 'Adrenal', 'sdhx': 'Adrenal', 'vhl': 'Adrenal', 'tmem127': 'Adrenal',
  'zuckerkandl': 'Adrenal', 'corpo carotideo': 'Adrenal', 'cromafim': 'Adrenal',
  'cushingoide': 'Adrenal',
  'hac': 'Adrenal', 'hipertensao resistente': 'Adrenal',
  'hipertensao secundaria': 'Adrenal',
  'genitalia ambigua': 'Adrenal', 'genitalia atipica': 'Adrenal',
  'perdedor de sal': 'Adrenal', 'perdedora de sal': 'Adrenal',
  '21-hidroxilase': 'Adrenal',
  'adenoma produtor de aldosterona': 'Adrenal',
  'cateterismo de veias adrenais': 'Adrenal', 'kcnj5': 'Adrenal',
  'eplerenona': 'Adrenal', 'lateralizacao': 'Adrenal',
  // ── Neuroendocrinologia, diabetes insipidus central (09/08/2026).
  // `adipsia` 4×0, `adipsico` 29×0, `vasopressinase` 6×0, `deficiencia de avp`
  // 10×0, `resposta trifasica` 7×0, `teste de restricao hidrica` 26×0.
  // ❌ FICARAM DE FORA, e o extrator mediu por quê: `desmopressina` (89 aqui ×
  // 35 na hiponatremia — mover roubaria o resgate da supracorreção),
  // `restricao hidrica` solta (27 × 36, Endocrinopatias domina: é 1ª linha da
  // SIAD), e `poliuria`/`polidipsia` soltas — uma chave dessas roubaria
  // "poliúria e polidipsia com glicemia 400" de Diabetes.
  // Acromegalia (revisão Lancet 2022, entrou em 09/08/2026). A chave
  // `acromegalia` já existia; faltavam as formas em que o médico DESCREVE o
  // paciente sem nomear a doença, e elas caíam em NENHUMA área.
  // Contado (Neuroendocrinologia × resto): `igf-1` 91×1, `pegvisomanto` 26×0,
  // `gigantismo` 8×0, `prognatismo` 3×0, `macroglossia` 3×0, `somatotrofo` 3×0.
  // ❌ `totg` FICOU DE FORA: 19 aqui contra 8 fora (Diabetes 5, Feminina 3), e a
  // colisão é REAL — o TOTG 75 g é o rastreio do diabetes GESTACIONAL. Entra só
  // o composto `nadir de gh`, que não pertence a mais ninguém.
  // ⚠️ O extrator relatou que `totg` e `prognatismo` já chegavam ao bloco pelo
  // tema. Conferi e NÃO chegavam: ele mediu o ranking DENTRO da área e esqueceu
  // que, sem chave, `canonArea` não devolve área nenhuma e não há bloco algum.
  // Pontuação de tema só existe depois que a área foi resolvida.
  'igf-1': 'Neuroendocrinologia', 'igf1': 'Neuroendocrinologia',
  'gigantismo': 'Neuroendocrinologia', 'prognatismo': 'Neuroendocrinologia',
  'macroglossia': 'Neuroendocrinologia', 'somatotrofo': 'Neuroendocrinologia',
  'pegvisomanto': 'Neuroendocrinologia', 'nadir de gh': 'Neuroendocrinologia',
  'poliuria hipotonica': 'Neuroendocrinologia',
  'adipsia': 'Neuroendocrinologia', 'adipsico': 'Neuroendocrinologia',
  'vasopressinase': 'Neuroendocrinologia', 'deficiencia de avp': 'Neuroendocrinologia',
  'resposta trifasica': 'Neuroendocrinologia',
  'teste de restricao hidrica': 'Neuroendocrinologia',
  // ⚠️ `fratura` SOZINHA NÃO ERA CHAVE — só os compostos (`fratura de quadril`,
  // `fratura por fragilidade`, `fratura vertebral`). Medido em 09/08/2026:
  // *"paciente em prednisona há 4 meses, previno fratura?"* ia para **Adrenal**,
  // porque `prednisona` é chave de lá e nada da pergunta puxava para cá — o
  // médico que quer PREVENIR FRATURA recebia insuficiência adrenal.
  // Contado: `fratura` é 329 de 352 em Osteometabolismo (**93%**, 14:1).
  // Os controles que valem a pena: "crise adrenal após suspender prednisona" e
  // "desmame de prednisona" têm de CONTINUAR em Adrenal, e continuam — a
  // palavra `fratura` não aparece nelas.
  'fratura': 'Osteometabolismo',
  // Manual Brasileiro de Osteoporose 2021 (entrou em 09/08/2026). A área tinha
  // só hipofosfatasia e osteogênese imperfeita — duas doenças RARAS —, e
  // osteoporose, a doença óssea mais comum, não tinha bloco nenhum. Estas chaves
  // são o que torna os capítulos alcançáveis. Contagem própria (Osteometabolismo
  // × resto da base), conferida depois de montar:
  'frax': 'Osteometabolismo',                    // 24×0
  'escore t': 'Osteometabolismo',                // 17×1 — o médico brasileiro
  'escore z': 'Osteometabolismo',                // 5×0    escreve assim, não "T-score"
  'fratura de quadril': 'Osteometabolismo',      // 19×0
  'fratura atipica': 'Osteometabolismo',         // 5×0
  'subtrocanterica': 'Osteometabolismo',         // 6×0
  'trauma de baixa energia': 'Osteometabolismo', // 4×0
  'queda da propria altura': 'Osteometabolismo', // 2×0
  'perda de altura': 'Osteometabolismo',         // 5×0
  'fratura por insuficiencia': 'Osteometabolismo',
  'fratura de colles': 'Osteometabolismo',
  'fratura vertebral': 'Osteometabolismo',       // 18×2
  'dor ossea': 'Osteometabolismo',               // 4×0 — específico o bastante
  //   (`dor` sozinha seria de todo mundo; "dor óssea" é desta área)
  'remodelacao ossea': 'Osteometabolismo',       // 8×0
  'massa ossea': 'Osteometabolismo',             // 30×3
  'p1np': 'Osteometabolismo',                    // 5×0
  'ctx': 'Osteometabolismo',                     // 4×0 — sigla de 3 letras, vive
  'rank-l': 'Osteometabolismo',                  //       da fronteira de `bordas()`
  'esclerostina': 'Osteometabolismo',            // 4×0
  'genant': 'Osteometabolismo', 'vertebroplastia': 'Osteometabolismo',
  'cifoplastia': 'Osteometabolismo', 'abrasso': 'Osteometabolismo',
  // ❌ MEDIDOS E RECUSADOS: `sarcopenia` (5 aqui × 21 fora — Obesidade tem 11,
  // Diabetes 7) e `artefato` (3 × 27 — Tireoide tem 26). Os dois são do
  // vocabulário de outras áreas; entrariam roubando. `dor lombar` e
  // `hipovitaminose d` idem, por serem de todo mundo.
  // ⚠️ A LINHA É ENTRE APRESENTAÇÃO E CRISE, e ela foi traçada MEDINDO.
  // Estas três roteiam porque a pergunta que as usa é DIAGNÓSTICA ("isto é
  // hipoparatireoidismo?"), e é justamente o que a diretriz de 2022 responde:
  // como confirmar, quando chamar de permanente, PTH de 12-24 h. Zero colisão —
  // `parestesia`, `formigamento` e `perioral` não existem em NENHUM bloco da
  // base, e `cirurgia cervical` é 4×0, palavra da própria fonte.
  // E o que me convenceu não foi o raciocínio, foi a entrega: conferi que o
  // texto que chega à IA declara sozinho o que a fonte NÃO responde ("não
  // responde", "o que infundir", "emergênc" aparecem no bloco entregue).
  'parestesia perioral': 'Osteometabolismo', 'formigamento perioral': 'Osteometabolismo',
  'cirurgia cervical': 'Osteometabolismo',
  // ❌ `tetania`, `chvostek` e `trousseau` FICARAM DE FORA,
  // e a razão não é dominância — é DANO. Conferi na fonte: a diretriz de 2022 tem
  // ZERO ocorrência de tetany, Chvostek, Trousseau, paresthesia, cramp e tingling,
  // e ZERO de cálcio intravenoso, gluconato, infusão, ECG e emergency. Ela é de
  // manejo CRÔNICO e manda mirar a metade INFERIOR da faixa normal. Rotear a
  // pergunta de tetania para cá entregaria conselho de manutenção a quem tem um
  // doente em crise — o mesmo acidente da hiponatremia aguda, que recebia o bloco
  // da correção lenta. Entram quando existir fonte de hipocalcemia AGUDA.
  //
  // ⚠️ MEDIDO DEPOIS, e o dado enfraquece a recusa sem derrubá-la (09/08/2026):
  // eu supus que a alternativa a rotear era o SILÊNCIO. Não é. *"paciente com
  // tetania e sinal de Chvostek pós-tireoidectomia"* roteia hoje para
  // **Tireoide** — `tireoidectomia` puxa — e o primeiro bloco entregue é a ATA
  // da GESTAÇÃO, com intervalo de referência de TSH. Zero relação com a
  // pergunta. Já *"tetania e espasmo carpopedal"* sozinha roteia para NENHUMA
  // área, que é o silêncio que eu tinha em mente.
  //
  // Contado (Osteometabolismo × resto): `tetania`, `chvostek`, `trousseau`,
  // `espasmo carpopedal` e `laringoespasmo` são **1×0** cada — exclusivos, mas
  // com UMA ocorrência: a própria ressalva de escopo que escrevi no bloco, que
  // diz que *"esse paciente precisa de cálcio parenteral"* e que a fonte não dá
  // dose, velocidade nem ECG. A base inteira menciona tetania uma vez, e é para
  // avisar que a resposta não está aqui.
  //
  // Por que continuo NÃO roteando, apesar disso: o conserto de verdade é a
  // FONTE que falta, e ela é pendência do professor. Trocar "conteúdo errado de
  // tireoide" por "guia crônico com aviso" mexe no que a IA recebe numa
  // emergência com base numa ressalva minha, não numa diretriz — e o cabeçalho
  // do bloco manda *"prefira-os a lembranças gerais"*, que é exatamente o que
  // não se quer dizer a quem tem um doente em tetania agora. Fica medido e
  // escrito para a decisão dele.
  // ✅ `pth` ENTROU EM 09/08/2026, e a condição que eu mesma escrevi acima é a
  // razão: ela dizia "entra junto do artigo de hiperparatireoidismo". Os DOIS
  // lados do PTH chegaram na mesma leva — hiperparatireoidismo primário
  // (PTH-dependente) e hipercalcemia PTH-independente —, então "hipercalcemia
  // com PTH inapropriadamente normal" já encontra bloco, e não só área.
  // Contado na base montada: `pth` 344×2, `hipercalcemia` 211×3.
  // ⚠️ `pth` tem 3 letras e vive da fronteira de `bordas()`: sem ela casaria
  // dentro de `pthrp`, que é justamente o outro lado do diferencial.
  'pth': 'Osteometabolismo', 'pthrp': 'Osteometabolismo',
  'hipercalcemia': 'Osteometabolismo', 'hipocalciurica': 'Osteometabolismo',
  // ⚠️ E O MÉDICO NEM SEMPRE ESCREVE O NOME DA CONDIÇÃO. "cálcio alto achado por
  // acaso no exame" continuava sem área depois de `hipercalcemia` entrar, porque
  // a pergunta não usa a palavra — e ela é a formulação mais comum de todas,
  // já que hipercalcemia costuma ser achado de exame de rotina.
  'calcio alto': 'Osteometabolismo', 'calcio elevado': 'Osteometabolismo',
  'crise hipercalcemica': 'Osteometabolismo', 'calciuria': 'Osteometabolismo',
  'sarcoidose': 'Osteometabolismo', 'mieloma': 'Osteometabolismo',
  'metastase ossea': 'Osteometabolismo', 'imobilizacao': 'Osteometabolismo',
  'osteite fibrosa': 'Osteometabolismo', 'dmo': 'Osteometabolismo',
  'giop': 'Osteometabolismo', 'raloxifeno': 'Osteometabolismo',
  'zoledronico': 'Osteometabolismo', 'pamidronato': 'Osteometabolismo',
  // ⚠️ ERRO DE ROTA, NÃO BURACO: "cintilografia de paratireoide" caía em
  // TIREOIDE. `cintilografia` (13 letras → 3013) ganhava de `paratireoide`
  // (12 → 3012) por UM PONTO no desempate por comprimento. `sestamibi` sozinho
  // (9 → 3009) não conserta — perde para `cintilografia`. Só a frase inteira,
  // que é mais longa, ganha.
  'cintilografia de paratireoide': 'Osteometabolismo',
  'cintilografia com sestamibi': 'Osteometabolismo',
  'sestamibi': 'Osteometabolismo',
  // ❌ MEDIDOS E RECUSADOS nesta leva, cada um por dono legítimo em outra área:
  // `tiazidico` 29×19 — os dois agentes o propuseram como exclusivo, e NÃO é:
  //   hiponatremia por tiazídico é pergunta de Endocrinopatias. Contei antes de
  //   aplicar, e foi o que salvou.
  // `calcitonina` 11×9 — Tireoide é dona (marcador do carcinoma medular).
  // `granulomatos` 13×4 e `perda ossea` 19×5 — espalhados pela clínica inteira.
  // `glicocorticoide`/`corticoide`/`prednisona` — Adrenal domina de longe, e a
  //   pergunta típica ("osteoporose por corticoide") já roteia por `osteoporose`.
  'hiperparatireoidismo': 'Osteometabolismo', 'hipoparatireoidismo': 'Osteometabolismo',
  'paratormonio': 'Osteometabolismo', 'raquitismo': 'Osteometabolismo',
  'paget': 'Osteometabolismo', 'fratura por fragilidade': 'Osteometabolismo',
  'osteodistrofia': 'Osteometabolismo',
  // Neuroendocrinologia
  'prolactinoma': 'Neuroendocrinologia', 'hiperprolactinemia': 'Neuroendocrinologia',
  // ⚠️ MACRO E MICRO NÃO CASAVAM `prolactinoma` (08/08/2026). `bate` exige
  // FRONTEIRA de palavra — o `o` de "macro" é alfanumérico — então
  // `macroprolactinoma` (45 ocorrências) e `microprolactinoma` (39) devolviam
  // `""`, 84 no total. E macro x micro é A distinção clínica da doença: decide
  // alvo de tratamento, necessidade de imagem de controle e conduta na gestação.
  // Achado varrendo termos DISTINTIVOS do conteúdo que não têm nenhuma rota.
  'macroprolactinoma': 'Neuroendocrinologia', 'microprolactinoma': 'Neuroendocrinologia',
  // `cabergolina` estava no mapa; a CLASSE, não. 86 ocorrências — é o
  // tratamento de primeira linha do prolactinoma, e "quando suspender o
  // agonista dopaminérgico?" é a pergunta de seguimento da doença.
  'agonista dopaminergico': 'Neuroendocrinologia',
  'agonistas dopaminergicos': 'Neuroendocrinologia',
  'macroprolactina': 'Neuroendocrinologia', 'cabergolina': 'Neuroendocrinologia',
  'acromegalia': 'Neuroendocrinologia', 'craniofaringioma': 'Neuroendocrinologia',
  'hipofise': 'Neuroendocrinologia', 'hipofisario': 'Neuroendocrinologia',
  'hipofisite': 'Neuroendocrinologia', 'apoplexia hipofisaria': 'Neuroendocrinologia',
  'hipopituitarismo': 'Neuroendocrinologia', 'macroadenoma': 'Neuroendocrinologia',
  // ⚠️ ERRO DE ROTA COM CONSEQUÊNCIA CLÍNICA (08/08/2026, auditoria do
  // craniofaringioma). `obesidade hipotalamica` casava em `obesidade`(CANON,
  // 3009) e entregava a diretriz de obesidade COMUM — estilo de vida primeiro —
  // exatamente onde os dois artigos de craniofaringioma dizem que isso NÃO
  // funciona. E "criança com síndrome hipotalâmica e hiperfagia grave" devolvia
  // ZERO. O composto (22 chars) vence a palavra solta por construção.
  'obesidade hipotalamica': 'Neuroendocrinologia',
  'sindrome hipotalamica': 'Neuroendocrinologia',
  'hiperfagia': 'Neuroendocrinologia',
  'adamantinomatoso': 'Neuroendocrinologia',
  'craniofaringioma papilifero': 'Neuroendocrinologia',
  // grafia que aparece muito na clínica brasileira
  'craniofaringeoma': 'Neuroendocrinologia',
  'haste hipofisaria': 'Neuroendocrinologia', 'corpos mamilares': 'Neuroendocrinologia',
  'ocitocina': 'Neuroendocrinologia', 'oxitocina': 'Neuroendocrinologia',
  'radiocirurgia': 'Neuroendocrinologia',
  // `radiocirurgia`(3) estava no mapa e `radioterapia`(32) não. Medido:
  // Neuroendocrinologia 32, Adrenal 1, Lípides 1 — dominância clara.
  'radioterapia': 'Neuroendocrinologia',
  // ⚠️ `papilifero` e `braf` NÃO entram, e é decisão medida: os dois são
  // marcadores do carcinoma PAPILÍFERO DE TIREOIDE, incomparavelmente mais
  // comum que o craniofaringioma papilífero. Roteá-los para a hipófise trocaria
  // um buraco por um erro. Só o composto com `craniofaringioma` entra.
  'microadenoma': 'Neuroendocrinologia', 'adenoma hipofisario': 'Neuroendocrinologia',
  // ⚠️ ERRO DE ROTA, não buraco — e é o pior tipo (08/08/2026). `diabetes
  // insipidus` casava só em `diabetes`(3008, substring do CANON) e ia para
  // DIABETES MELLITUS. O conteúdo está em Neuroendocrinologia (8 ocorrências) e
  // Endocrinopatias (2): poliúria, sede e sódio, nada a ver com glicemia. Quem
  // perguntasse recebia o bloco de diabetes com toda a confiança do mundo.
  // Nome composto (18 chars) vence a palavra solta por construção.
  // ⚠️ O DIFERENCIAL DA MASSA SELAR ERA INALCANÇÁVEL INTEIRO (08/08/2026,
  // auditoria do craniofaringioma). Quinze termos com conteúdo em
  // Neuroendocrinologia e `canonArea` devolvendo "" para todos: quem via uma
  // massa selar e queria o diferencial não chegava a lugar nenhum, e a via de
  // acesso cirúrgico (transesfenoidal, endoscópica endonasal) também não.
  //
  // ⚠️ `celulas germinativas` SOLTO ficou de fora: tumor de células germinativas
  // TESTICULAR é bem mais comum, e a área masculina está vazia — mandá-lo para a
  // hipófise seria trocar buraco por erro. `germinoma` entra porque, sem outro
  // qualificador, é do SNC.
  'germinoma': 'Neuroendocrinologia', 'xantogranuloma': 'Neuroendocrinologia',
  'bolsa de rathke': 'Neuroendocrinologia', 'cisto da bolsa de rathke': 'Neuroendocrinologia',
  'tuber cinereum': 'Neuroendocrinologia', 'sela turcica': 'Neuroendocrinologia',
  'terceiro ventriculo': 'Neuroendocrinologia', 'glioma': 'Neuroendocrinologia',
  'transesfenoidal': 'Neuroendocrinologia', 'endoscopica endonasal': 'Neuroendocrinologia',
  'ressecao total macroscopica': 'Neuroendocrinologia',
  'ctnnb1': 'Neuroendocrinologia', 'beta-catenina': 'Neuroendocrinologia',
  'ommaya': 'Neuroendocrinologia',
  // grafia sem hífen, mesma família do `craniofaringeoma`
  'panhipopituitarismo': 'Neuroendocrinologia',
  // ACHADO: `velocidade de crescimento` reduzida é sinal de apresentação do
  // craniofaringioma, mas é achado pediátrico geral — cede para qualquer doença.
  'velocidade de crescimento': 'Neuroendocrinologia',
  'diabetes insipidus': 'Neuroendocrinologia',
  'diabetes insipido': 'Neuroendocrinologia',
  'deficiencia de gh': 'Neuroendocrinologia',
  'hormonio de crescimento': 'Neuroendocrinologia',
  // Adrenal
  'insuficiencia adrenal': 'Adrenal', 'addison': 'Adrenal', 'cushing': 'Adrenal',
  'feocromocitoma': 'Adrenal', 'hiperaldosteronismo': 'Adrenal',
  'incidentaloma adrenal': 'Adrenal', 'cortisol': 'Adrenal',
  'cosintropina': 'Adrenal', 'hidrocortisona': 'Adrenal', 'glicocorticoide': 'Adrenal',
  'adrenalectomia': 'Adrenal',
  // Tireoide
  'hipotireoidismo': 'Tireoide', 'hipertireoidismo': 'Tireoide', 'tireotoxicose': 'Tireoide',
  // ⚠️ O ARTIGO DO EUTIREOIDIANO DOENTE SÓ ERA ALCANÇÁVEL PELO PRÓPRIO NOME
  // (09/08/2026). Medido: *"T3 baixo e T4 normal em paciente de UTI, trato?"* e
  // *"T3 reverso alto no doente grave"* caíam em **NENHUMA área** — nenhuma
  // palavra da apresentação era chave. Só "síndrome do eutireoidiano doente"
  // funcionava, e quem já sabe o nome não precisa do artigo.
  // Contado na base montada: `t3 reverso` 4×0, `eutireoidiano` 3×0, `ntis` 53×0.
  't3 reverso': 'Tireoide', 'eutireoidiano': 'Tireoide', 'ntis': 'Tireoide',
  // ⚠️ `t3` e `t4` entram com PESO DE ACHADO (CAT_ACHADO, 1000), não de doença.
  // A dominância é enorme — `t3` 184×4 e `t4` 268×5 —, mas a colisão que importa
  // não está na base e sim na PERGUNTA: "fratura vertebral em T3" é nível
  // vertebral, não hormônio. Com peso de achado, `fratura` (doença, 3000) ganha
  // e o hormônio só decide quando nada mais casa, que é exatamente o caso da
  // vinheta da UTI.
  't3': 'Tireoide', 't4': 'Tireoide',
  // sintoma clássico e inequívoco da área, e só aparece aqui na base inteira.
  // ⚠️ `taquicardia`, `tremor` e `sudorese` NÃO entram: domínio até existe
  // (taquicardia 10 em Tireoide), mas pertencem à clínica inteira — mesma
  // recusa de `perda auditiva` em Osteometabolismo.
  'intolerancia ao calor': 'Tireoide',
  'graves': 'Tireoide', 'hashimoto': 'Tireoide', 'tireoidite': 'Tireoide',
  'levotiroxina': 'Tireoide', 'metimazol': 'Tireoide', 'propiltiouracil': 'Tireoide',
  'radioiodo': 'Tireoide', 'eutireoidiano doente': 'Tireoide',
  'tempestade tireoidiana': 'Tireoide', 'tempestade tireotoxica': 'Tireoide',
  'crise tireotoxica': 'Tireoide', 'tireoidectomia': 'Tireoide',
  // ⚠️ TIREOIDE ERA A ÁREA MAIS COMUM COM A COBERTURA MAIS RARA (08/08/2026):
  // dois artigos, ambos de quadro raro (doente eutireoidiano e tempestade).
  // Entraram hipertireoidismo (Lancet 2023) e efeitos de fármacos (NEJM 2019),
  // e com eles este vocabulário, cada termo medido no conteúdo antes de entrar.
  'carbimazol': 'Tireoide', 'tiamazol': 'Tireoide', 'ptu': 'Tireoide',
  'antitireoidiano': 'Tireoide', 'tionamida': 'Tireoide',
  'agranulocitose': 'Tireoide', 'adenoma toxico': 'Tireoide',
  'nodulo toxico': 'Tireoide', 'cintilografia': 'Tireoide', 'raiu': 'Tireoide',
  'jod-basedow': 'Tireoide', 'wolff-chaikoff': 'Tireoide',
  'orbitopatia': 'Tireoide', 'oftalmopatia': 'Tireoide', 'exoftalmia': 'Tireoide',
  'struma ovarii': 'Tireoide', 'tireotoxicose facticia': 'Tireoide',
  'tbg': 'Tireoide', 'globulina ligadora de tiroxina': 'Tireoide',
  // ⚠️ `biotina` É O ARTEFATO QUE IMITA GRAVES, e por isso vale mais que a
  // contagem sugere: TSH falsamente baixo, T4 livre falsamente alto e TRAb
  // falso-positivo — o NEJM registra que os testes "exactly mimicked the
  // biochemical findings of Graves' disease". Rota ausente aqui faz tratar
  // hipertireoidismo que não existe.
  'biotina': 'Tireoide',
  // ⚠️ `litio` fica em TIREOIDE por MEDIÇÃO, não por palpite: na base profunda
  // ele tem 26 ocorrências e TODAS em Tireoide (bócio, hipotireoidismo,
  // tireoidite indolor). O núcleo o cita uma vez, no diferencial de
  // hipercalcemia — mas núcleo é outra camada, e `hipercalcemia` é termo de
  // DOENÇA, então "lítio e hipercalcemia" continua indo para Osteometabolismo.
  'litio': 'Tireoide', 'litio e tireoide': 'Tireoide',
  // Peso de ACHADO: espalhados por várias áreas, cedem para a doença nomeada.
  'captacao': 'Tireoide',
  // ⚠️ `checkpoint` e `inibidor de checkpoint` MUDARAM DE ÁREA em 09/08/2026,
  // porque o conteúdo chegou. Medido na base montada: `inibidor de checkpoint`
  // é **102 em Endocrinopatias contra 9 em Tireoide**, e `checkpoint` 119 × 24.
  // Enquanto apontavam para Tireoide, a endocrinopatia por imunoterapia — que
  // atravessa QUATRO eixos — só alcançava o braço tireoidiano. Medido antes de
  // mexer: *"diabetes por inibidor de checkpoint"* e *"insuficiência adrenal por
  // inibidor de checkpoint"* caíam as duas em **Tireoide**.
  // O bloco novo cobre o braço tireoidiano inteiro do ICI (tireoidite destrutiva
  // → hipotireoidismo, LT4 1,6 µg/kg, TSH >10, rastreio de 8/8 semanas), então
  // mover não perde conteúdo de tireoide — ganha os outros três eixos.
  // ❌ `hipofisite` (33×5 a favor daqui) NÃO se move: é assunto da hipófise e a
  // pergunta por ela deve continuar em Neuroendocrinologia. ❌ `imunoterapia`
  // também não — 4 aqui contra 8 em Tireoide, eu perco. ❌ `ipilimumabe` 12×10 é
  // quase empate e mexeria com a hipófise.
  // ⚠️ `mmi` FICOU DE FORA, medido: Diabetes 8, Obesidade 3 e Tireoide só 2 —
  // a sigla do metimazol perde para ocorrências de outras áreas. `metimazol`
  // por extenso já roteia e é o que o médico escreve na receita.
  'bocio': 'Tireoide', 'nodulo tireoidiano': 'Tireoide',
  // ⚠️ Amiodarona aparece em três áreas (Tireoide 4, Lípides 5, Endocrinopatias 1)
  // e o trade foi MEDIDO, não presumido.
  //
  //   GANHO: "paciente em amiodarona há 6 meses com palpitações e perda de peso"
  //          era VAZIO e agora vai para Tireoide. É justamente o caso em que o
  //          roteamento serve para alguma coisa: o médico ainda não suspeitou da
  //          tireoide, então não escreveu nenhuma palavra tireoidiana.
  //   CUSTO: as perguntas de INTERAÇÃO com estatina saem de Lípides. A pior
  //          delas — o teto de dose da sinvastatina, que é segurança de
  //          prescrição — está protegida pelos nomes de estatina abaixo, que são
  //          mais longos que `amiodarona`(10) e vencem dentro da categoria.
  //
  // ⚠️ LIMITE CONHECIDO E ACEITO: "amiodarona e estatina: interação", com a
  // classe escrita genericamente, vai para Tireoide (`estatina`=2008 perde para
  // `amiodarona`=2010 por dois caracteres). Não forcei: para consertar eu teria
  // de inventar peso para `estatina`, e isso quebraria o desempate de fármacos
  // em todo o resto do mapa por causa de uma frase.
  'amiodarona': 'Tireoide', 'propranolol': 'Tireoide',
  'nivolumabe': 'Tireoide', 'pembrolizumabe': 'Tireoide',
  'tirosina-quinase': 'Tireoide',
  // `tireoide` roteava e `tireoidiano` não — `bate` só tolera plural, não o
  // sufixo adjetivo. 52 ocorrências atrás de uma letra.
  'tireoidiano': 'Tireoide', 'hormonio tireoidiano': 'Tireoide',
  // Diabetes pós-transplante — área própria desde 2026-08-21 (ver o CANON acima).
  //
  // ⚠️ NÃO BASTA PÔR NO `CANON`: aquele mapa casa o NOME DA SUBESPECIALIDADE, e
  // nenhum médico escreve "diabetes pós-transplante" como rótulo — escreve
  // "receptor de transplante renal em tacrolimo com hiperglicemia". Medido: com
  // as chaves só no CANON, as três perguntas de teste devolviam os 372k de
  // Diabetes inteiros, e nenhuma chegava ao bloco do assunto perguntado.
  //
  // ⚠️ `tacrolimo` e `ciclosporina` entram porque são o que identifica o caso na
  // prática, mas `enxerto` NÃO: sozinha ela pega enxerto ósseo e vascular.
  'diabetes pos-transplante': 'Diabetes pós-transplante',
  'diabetes pós-transplante': 'Diabetes pós-transplante',
  'diabetes pos transplante': 'Diabetes pós-transplante',
  'diabetes mellitus pos-transplante': 'Diabetes pós-transplante',
  'pos-transplante': 'Diabetes pós-transplante',
  'pós-transplante': 'Diabetes pós-transplante',
  'transplante renal': 'Diabetes pós-transplante',
  'transplante de orgao solido': 'Diabetes pós-transplante',
  'receptor de transplante': 'Diabetes pós-transplante',
  'dmpt': 'Diabetes pós-transplante', 'ptdm': 'Diabetes pós-transplante',
  'tacrolimo': 'Diabetes pós-transplante', 'ciclosporina': 'Diabetes pós-transplante',
  'imunossupressor': 'Diabetes pós-transplante', 'belatacept': 'Diabetes pós-transplante',
  // Diabetes
  'cetoacidose': 'Diabetes', 'hipoglicemia': 'Diabetes', 'insulina': 'Diabetes',
  // ⚠️ NENHUM iSGLT2 roteava (08/08/2026). "Paciente em uso de empagliflozina,
  // artroplastia eletiva: com quanta antecedência suspender?" — a recomendação
  // mais acionável do artigo de cetoacidose euglicêmica — devolvia bloco VAZIO.
  // A classe inteira estava fora do mapa, e ela é hoje das mais prescritas.
  'isglt2': 'Diabetes', 'sglt2': 'Diabetes', 'inibidor de sglt2': 'Diabetes',
  'gliflozina': 'Diabetes', 'empagliflozina': 'Diabetes', 'dapagliflozina': 'Diabetes',
  'canagliflozina': 'Diabetes', 'ertugliflozina': 'Diabetes',
  'cetonemia': 'Diabetes', 'cetonuria': 'Diabetes', 'beta-hidroxibutirato': 'Diabetes',
  'anion gap': 'Diabetes',
  // ⚠️ `ptdm` — a SIGLA do artigo inteiro de diabetes pós-transplante, com 67
  // ocorrências — devolvia "". O bloco só era alcançável pelos nomes dos
  // imunossupressores (`tacrolimo`, `ciclosporina`). `celulas beta`(25) e
  // `transplante renal`(26) idem.
  'ptdm': 'Diabetes', 'diabetes pos-transplante': 'Diabetes',
  // ⚠️ `pos-transplante` DESCEU PARA PESO DE ACHADO (08/08/2026) — erro meu, de
  // hoje. Eu o pus em Diabetes junto com `ptdm`, e como doença (3015) ele passou
  // a vencer `nash`(3004): "NASH pós-transplante hepático" ia para DIABETES, e
  // os 7 fatos de esteato-hepatite no enxerto ficavam inalcançáveis pela
  // pergunta natural. Medido: `pos-transplante` está DIVIDIDO (Obesidade 8,
  // Diabetes 7, Lípides 2) — não é chave de uma área só. Como achado, cede para
  // a doença nomeada nos dois sentidos: `ptdm`(68 ocorrências, todas em
  // Diabetes) e `diabetes pos-transplante` seguram o lado diabetológico.
  'pos-transplante': 'Diabetes', 'transplante renal': 'Diabetes',
  'celulas beta': 'Diabetes', 'celula beta': 'Diabetes',
  // ⚠️ O VOCABULÁRIO DE CGM NÃO TINHA ROTA NENHUMA (08/08/2026), e é tecnologia
  // de uso diário: `cgm` devolvia "" tendo 45 ocorrências em Esporte e 14 aqui.
  //
  // PELA REGRA DO CONTEÚDO ele iria para Esporte — e eu cheguei a pôr, medi, e
  // VOLTEI. Chave de Esporte não é só um peso: é GATILHO da promoção condicional
  // (ver `areasOrdenadas`), desenhada para "maratonista com diabetes tipo 1".
  // CGM é DISPOSITIVO, não esporte, e transformá-lo em gatilho alargou uma regra
  // que foi escrita estreita de propósito. Medido depois de alargar:
  //   "tempo no alvo no CGM: qual a meta?"  → Esporte   ← as metas estão AQUI
  //   "CGM no diabetes tipo 2 em insulina"  → Esporte   ← nada a ver com esporte
  // Em Diabetes com peso de ACHADO, a pergunta de exercício continua chegando em
  // Esporte pela palavra `exercicio`(1009), que vence `cgm`(1003) — o gatilho
  // volta a ser o esporte, que é o que ele sempre foi.
  'cgm': 'Diabetes', 'sensor de glicose': 'Diabetes',
  'glicose intersticial': 'Diabetes', 'monitorizacao continua de glicose': 'Diabetes',
  'tempo no alvo': 'Diabetes',
  // ⚠️ `cetogenica` SAIU DAQUI E FOI PARA OBESIDADE (08/08/2026). Medido: a
  // palavra "cetogênica" tem ZERO ocorrência em todo o conteúdo de Diabetes, e a
  // única existe no Posicionamento Nutricional da ABESO, arquivado em Obesidade
  // — que é justamente o que diz que a VLCKD é potencialmente DELETÉRIA no DM1.
  // Ou seja: "dieta cetogênica no diabético tipo 1" roteava para Diabetes e
  // voltava sem a advertência, que estava do outro lado. A rota da CAD não se
  // perde: `cetoacidose`(11) é mais longa que `cetogenica`(10) e continua vencendo
  // na mesma categoria, e `cetonemia`/`cetonuria`/`beta-hidroxibutirato` seguem aqui.
  // ⚠️ O artigo de DM1 (227 fatos) era INALCANÇÁVEL pela pergunta mais específica
  // dele — "2 autoanticorpos e disglicemia, cabe teplizumabe?" devolvia 0 chars.
  'teplizumabe': 'Diabetes', 'autoanticorpo': 'Diabetes', 'disglicemia': 'Diabetes',
  // ⚠️ NOVE ASSUNTOS DO SEMINAR DE DM1 SEM NENHUMA ROTA (08/08/2026). Conferi um
  // a um: os nove têm conteúdo na base profunda e `canonArea` devolvia "" para
  // todos. O mais grave é `alca fechada` — o núcleo diz que a alça fechada é o
  // método PREFERIDO no DM1 em todas as idades (ADA 2026), e a pergunta sobre
  // ela não chegava a lugar nenhum.
  //
  // ⚠️ E o relato do auditor errou para MENOS: ele deu `glucagon nasal`,
  // `lua de mel` e `remissao parcial` como "já roteiam corretamente". Os três
  // devolviam vazio. Medir, sempre — inclusive o que o agente diz estar bom.
  'dasiglucagon': 'Diabetes', 'pramlintida': 'Diabetes', 'golimumabe': 'Diabetes',
  'glucagon nasal': 'Diabetes', 'insulite': 'Diabetes', 'trialnet': 'Diabetes',
  'alca fechada': 'Diabetes', 'pancreas artificial': 'Diabetes',
  'pancreas bionico': 'Diabetes', 'bomba de insulina': 'Diabetes',
  // Fase da doença, com peso de ACHADO (ver CAT_ACHADO): `remissao parcial`
  // sozinha, com peso de doença, roubaria "remissão parcial da acromegalia após
  // cirurgia" — `remissao parcial`(3016) passa na frente de `acromegalia`(3011).
  // Como achado, só decide quando nenhuma doença é nomeada.
  'lua de mel': 'Diabetes', 'remissao parcial': 'Diabetes',
  'anti-gad': 'Diabetes', 'anti-ia2': 'Diabetes', 'peptideo c': 'Diabetes',
  'pre-diabetes': 'Diabetes', 'prediabetes': 'Diabetes',
  'intolerancia a glicose': 'Diabetes', 'glicemia de jejum alterada': 'Diabetes',
  // ⚠️ LIMITE CONHECIDO, irmão do de Esporte. Hiperglicemia por corticoide também
  // vive na INTERSEÇÃO: a pergunta nomeia um corticoide (fármaco→Adrenal) e um
  // achado glicêmico. "Paciente em prednisona 40 mg, glicemia 280 à tarde" ainda
  // roteia para Adrenal, porque `prednisona`(10) vence `insulina`(8) por dois
  // caracteres — desempate arbitrário. Não forcei: `prednisona`→Diabetes quebraria
  // a pergunta de desmame e supressão do eixo, que é o outro lado do mesmo
  // paciente. As formas compostas abaixo pegam quem nomeia o quadro.
  'hiperglicemia induzida por glicocorticoide': 'Diabetes',
  'diabetes induzido por glicocorticoide': 'Diabetes',
  'hiperglicemia por corticoide': 'Diabetes', 'diabetes por corticoide': 'Diabetes',
  // ⚠️ O ESQUEMA DE INSULINA ERA MUDO, E ELE É A RESPOSTA (08/08/2026, auditoria
  // do capítulo de hiperglicemia por corticoide). "Quanta NPH começar para
  // prednisona 40 mg?" caía em Adrenal, porque `prednisona`(fármaco, 2010)
  // vencia e nenhuma palavra do ESQUEMA existia no mapa. O paciente é o mesmo; a
  // pergunta é de dose de insulina. `nph` e `basal-bolus` são inequívocos — a
  // diretriz do eixo adrenal nunca prescreve nem um nem outro.
  'nph': 'Diabetes', 'basal-bolus': 'Diabetes', 'basal bolus': 'Diabetes',
  'insulina regular': 'Diabetes', 'insulina basal': 'Diabetes', 'esquema de insulina': 'Diabetes',
  // ⚠️ AS EMERGÊNCIAS HIPERGLICÊMICAS NÃO TINHAM NOME (08/08/2026, auditoria da
  // cetoacidose). `CAD` é o que o médico brasileiro escreve, e devolvia "".
  // Pior: o extrato da CAD é o ÚNICO da base com conteúdo de estado
  // hiperosmolar, e NENHUMA grafia de EHH chegava até ele.
  'cad': 'Diabetes', 'ehh': 'Diabetes',
  'estado hiperglicemico hiperosmolar': 'Diabetes', 'estado hiperosmolar': 'Diabetes',
  'coma hiperosmolar': 'Diabetes', 'sindrome hiperosmolar': 'Diabetes',
  'crise hiperglicemica': 'Diabetes', 'emergencia hiperglicemica': 'Diabetes',
  'cetoacidose alcoolica': 'Diabetes',
  'metformina': 'Diabetes', 'retinopatia': 'Diabetes', 'nefropatia diabetica': 'Diabetes',
  'neuropatia diabetica': 'Diabetes', 'pe diabetico': 'Diabetes', 'mody': 'Diabetes',
  // Obesidade / Lípides
  // ⚠️ O MAPA DE OBESIDADE TINHA 13 CHAVES E NENHUM ANTIOBESIDÊNICO CLÁSSICO
  // (08/08/2026). Nem `orlistate`, nem `sibutramina`, nem `fentermina`, nem
  // `naltrexona-bupropiona` — e nem `sobrepeso`, que é metade do nome da área.
  // Conferido nos extratos: todos têm conteúdo (o de farmacoterapia sozinho traz
  // fentermina 22x, naltrexona/bupropiona 17x, orlistate 12x).
  //
  // ⚠️ `topiramato` e `bupropiona` SOLTOS foram evitados: o primeiro é fármaco
  // de neurologia (enxaqueca, epilepsia) e o segundo de cessação de tabagismo e
  // depressão. Entram as formas COMPOSTAS, que são inequivocamente de obesidade.
  // ⚠️ NOME COMERCIAL NÃO ROTEAVA (08/08/2026). O médico e, sobretudo, o
  // PACIENTE escrevem "Ozempic", "Mounjaro", "Saxenda" — não "semaglutida".
  // Todos devolviam "" com a base cheia: semaglutida tem 88 ocorrências em
  // Obesidade, tirzepatida 29 (mais 26 no núcleo), liraglutida 44.
  // Mesma família do `CAD`, do `EHH` e do `Lp(a)`: o conteúdo existe, a palavra
  // que se digita não está no mapa, e o buraco é invisível para quem lê o código.
  // Entram com peso de FÁRMACO, então cedem para qualquer doença nomeada.
  'ozempic': 'Obesidade', 'wegovy': 'Obesidade', 'rybelsus': 'Obesidade',
  'saxenda': 'Obesidade', 'victoza': 'Obesidade',
  'mounjaro': 'Obesidade', 'zepbound': 'Obesidade',
  'trulicity': 'Obesidade', 'contrave': 'Obesidade', 'xenical': 'Obesidade',
  // ⚠️ CORREÇÃO DE UMA DECISÃO MINHA (08/08/2026). Eu tinha mandado `exenatida`
  // e as marcas Byetta/Bydureon para Diabetes, raciocinando pela indicação em
  // bula. O auditor da farmacoterapia MEDIU o conteúdo e me desmentiu:
  // `exenatid` tem 15 ocorrências em Obesidade contra 3 em Diabetes, porque é na
  // metanálise de antiobesidade que ela é discutida. Indicação de bula não é o
  // critério — onde está o CONTEÚDO é.
  // Peso de fármaco, então "exenatida no DM2" continua indo para Diabetes.
  'byetta': 'Obesidade', 'bydureon': 'Obesidade',
  'qsymia': 'Obesidade',
  'lorcasserina': 'Obesidade', 'lorcaserina': 'Obesidade',
  // ⚠️ O ROTEADOR NÃO TINHA UMA ÚNICA PALAVRA HEPÁTICA (08/08/2026). Zero
  // ocorrências de `hepat`, `esteatos`, `nafld`, `masld`, `nash`, `figado`,
  // `fibrose` ou `cirrose` no mapa inteiro, e 16 de 16 termos testados devolviam
  // "". A doença hepática gordurosa é a interseção de obesidade, diabetes e
  // lípides — e era invisível pelas três.
  //
  // ⚠️ AS DUAS NOMENCLATURAS ENTRAM. O artigo é de 2023, na virada de NAFLD/NASH
  // para MASLD/MASH, e os critérios NÃO são iguais (MASLD exige cardiometabólico;
  // NAFLD exigia excluir álcool). O médico digita as duas, e a ressalva do
  // extrato é que avisa da diferença.
  'esteatose hepatica': 'Obesidade', 'esteatose': 'Obesidade',
  'doenca hepatica gordurosa': 'Obesidade', 'figado gorduroso': 'Obesidade',
  'gordura no figado': 'Obesidade', 'esteato-hepatite': 'Obesidade',
  'dhgna': 'Obesidade', 'nafld': 'Obesidade', 'masld': 'Obesidade',
  'nash': 'Obesidade', 'mash': 'Obesidade',
  'fib-4': 'Obesidade', 'elastografia': 'Obesidade', 'fibroscan': 'Obesidade',
  'fibrose hepatica': 'Obesidade', 'biopsia hepatica': 'Obesidade',
  'pioglitazona': 'Obesidade', 'resmetirom': 'Obesidade',
  // "quando encaminho ao hepatologista?" é a pergunta mais acionável do artigo
  // e devolvia vazio.
  'hepatologista': 'Obesidade', 'hepatologia': 'Obesidade',
  // Lacunas achadas pelo auditor da DHGNA e conferidas por contagem antes de
  // entrar. Todas de Obesidade sem disputa, salvo as duas de peso de ACHADO.
  'carcinoma hepatocelular': 'Obesidade', 'chc': 'Obesidade',
  'gordura hepatica': 'Obesidade', 'fibrose avancada': 'Obesidade',
  'transplante hepatico': 'Obesidade', 'transplantado hepatico': 'Obesidade',
  'esteatohepatite': 'Obesidade', 'ehna': 'Obesidade',
  'mri-pdff': 'Obesidade', 'pdff': 'Obesidade', 'lsm': 'Obesidade',
  'elf': 'Obesidade', 'nfs': 'Obesidade',
  // ⚠️ `cirrose` FICOU FORA DO MAPA, e a tentativa de incluí-la reprovou na
  // hora. O conteúdo está EMPATADO — Endocrinopatias 25 (é causa clássica de
  // hiponatremia hipervolêmica) contra Obesidade 24 — e mesmo com peso de
  // ACHADO ela vence `sodio`(1005) por comprimento, mandando "cirrose com sódio
  // de 120" para Obesidade. Fora do mapa, quem decide é o resto da frase, e as
  // DUAS rotas acertam: "cirrose com sódio de 120" → Endocrinopatias pelo
  // `sodio`; "cirrose na esteatose hepática" → Obesidade pela `esteatose`.
  // Termo genuinamente empatado é melhor mudo que árbitro.
  // `enzimas hepaticas` tem 8 em Lípides (monitorização de estatina) contra 3
  // aqui, e entra junto de `transaminases`/`tgo`/`tgp`, que já eram achado — com
  // `estatina`(fármaco, 2008) vencendo quando a pergunta é de estatina.
  'enzimas hepaticas': 'Obesidade', 'figado': 'Obesidade',
  // ⚠️ `ct1` FICOU DE FORA de propósito: 9 ocorrências aqui, mas "cT1" é também
  // o estádio T1 clínico do TNM, e a chave de 3 letras com fronteira de palavra
  // casaria o estadiamento do câncer de tireoide. Parâmetro de imagem citado
  // num caso só não vale o risco de sequestrar estadiamento oncológico.
  // `hepatopatia`(4) e `provas hepaticas`(2) também ficam: contagem baixa
  // demais para decidir área.
  // ACHADO: enzima alterada é achado cru e cede para qualquer doença nomeada.
  'transaminases': 'Obesidade', 'aminotransferases': 'Obesidade',
  'tgo': 'Obesidade', 'tgp': 'Obesidade', 'alt': 'Obesidade', 'ast': 'Obesidade',
  'sobrepeso': 'Obesidade', 'antiobesidade': 'Obesidade', 'anti-obesidade': 'Obesidade',
  'orlistate': 'Obesidade', 'orlistat': 'Obesidade', 'sibutramina': 'Obesidade',
  'fentermina': 'Obesidade', 'fentermina-topiramato': 'Obesidade',
  'naltrexona': 'Obesidade', 'naltrexona-bupropiona': 'Obesidade',
  'levocarnitina': 'Obesidade', 'glp-1': 'Obesidade', 'ar glp-1': 'Obesidade',
  'agonista de glp-1': 'Obesidade',
  // Peso de ACHADO (ver CAT_ACHADO): ajudam quando nada mais casa e cedem para
  // qualquer doença nomeada.
  'emagrecer': 'Obesidade', 'emagrecimento': 'Obesidade',
  // ⚠️ Mesma falha de FORMA VERBAL que pegou o Esporte: `emagrecer` era chave e
  // `emagrece` não, então "qual remédio emagrece mais" — frase que está VERBATIM
  // no tema do bloco de farmacoterapia — caía em nenhuma área. E `abeso`, a sigla
  // da sociedade que assina as duas diretrizes da área, também não era chave.
  // Contado: `emagrece` 3×0, `abeso` 161 em Obesidade contra 1 em Diabetes.
  'emagrece': 'Obesidade', 'abeso': 'Obesidade',
  'reganho de peso': 'Obesidade', 'reganho': 'Obesidade',
  'manutencao do peso': 'Obesidade', 'meta de perda de peso': 'Obesidade',
  'circunferencia da cintura': 'Obesidade', 'indice de massa corporal': 'Obesidade',
  // `apneia obstrutiva do sono` estava no mapa por extenso; `apneia do sono`,
  // que é como se fala, não. E `bypass` sozinho (85 em Obesidade contra 4 em
  // Neuroendocrinologia) só roteava como `bypass gastrico` — "bypass em Y de
  // Roux", o nome da operação no Brasil, devolvia vazio.
  'apneia do sono': 'Obesidade', 'apneia': 'Obesidade', 'bypass': 'Obesidade',
  'banda gastrica': 'Obesidade',
  // Lacunas achadas pelo auditor da ABESO, cada uma medida antes de entrar.
  'rygb': 'Obesidade', 'derivacao biliopancreatica': 'Obesidade',
  'duodenal switch': 'Obesidade', 'bpd/ds': 'Obesidade',
  'cafe da manha': 'Obesidade', 'desjejum': 'Obesidade',
  'gordura de coco': 'Obesidade', 'dieta hipocalorica': 'Obesidade',
  'fast-food': 'Obesidade', 'plano alimentar': 'Obesidade',
  'ma-huang': 'Obesidade',
  // ⚠️ `efedrina` ENTRA AGORA, revertendo uma exclusão MINHA de hoje de manhã.
  // Eu a tinha deixado fora por aparecer em três áreas (Obesidade 5,
  // Neuroendocrino 1, Tireoide 1) — "simpaticomimético não é assunto de uma área
  // só". A exclusão custou caro: "efedrina para perda de peso" devolvia NENHUMA
  // área, e o fato 81 da ABESO é o ÚNICO lugar da base que registra que ela
  // aumenta 2 a 3,5× o risco de eventos psiquiátricos, gastrintestinais e
  // cardíacos INCLUINDO AVC. Buraco em fato de SEGURANÇA é pior que impureza de
  // rota, e o tier de FÁRMACO resolve as duas pontas: com doença nomeada na
  // pergunta ela cede, sozinha ela entrega a advertência.
  //
  // ⚠️ O TIER AQUI FOI ESCOLHIDO POR CATEGORIA, NÃO POR MEDIÇÃO, e registro isso
  // porque a diferença é real. Testei achado (1008), fármaco (2008) e doença
  // (3008) contra cinco perguntas realistas — "efedrina no hipertireoidismo",
  // "com TSH baixo", "no feocromocitoma", "com T4 livre alto", "na
  // tireotoxicose" — e as três dão EXATAMENTE o mesmo resultado, porque as
  // doenças que acompanham a efedrina têm nome longo e os achados que a
  // acompanham são todos de peso 1000. Nenhum teste discrimina. Então vale a
  // regra do arquivo — "doença > FÁRMACO/procedimento > exame/achado" — e
  // efedrina é substância, como sibutramina e orlistate ao lado.
  'efedrina': 'Obesidade',
  // ⚠️ FICARAM DE FORA, medidos: `tiamina` (Obesidade 5, Tireoide 5,
  // Endocrinopatias 3 — empate de três), `suplementacao` (espalhado por OITO
  // áreas), `bebida acucarada` e `sindrome de realimentacao` (zero e uma
  // ocorrência). E `perda de peso` continua fora pela razão de sempre: aparece
  // em oito áreas e perda de peso INVOLUNTÁRIA é bandeira vermelha de
  // hipertireoidismo, insuficiência adrenal e neoplasia — o auditor pediu, mas
  // roteá-la para Obesidade responderia a pergunta mais grave com o bloco mais
  // inofensivo.
  'apneia obstrutiva do sono': 'Obesidade',
  // ⚠️ `perda de peso` FICOU DE FORA, e é decisão medida: ela aparece em OITO
  // áreas (Diabetes 15, Adrenal 6, Neuro 5, Feminina 4, Tireoide 2…), porque
  // perda de peso INVOLUNTÁRIA é bandeira vermelha de hipertireoidismo, de
  // insuficiência adrenal e de neoplasia. Roteá-la para Obesidade responderia a
  // pergunta mais grave com o bloco mais inofensivo. `emagrecer` entra no lugar
  // dela porque carrega a INTENÇÃO, que "perda de peso" não carrega.
  'exenatida': 'Obesidade', 'pramlintida': 'Obesidade',
  'semaglutida': 'Obesidade', 'tirzepatida': 'Obesidade', 'liraglutida': 'Obesidade',
  // ⚠️ DOIS AR GLP-1 SEM ROTA, E UM DELES COM A MARCA JÁ NO MAPA (08/08/2026).
  // Achado varrendo bloco a bloco as áreas acima do teto: "diarreia persistente
  // com dulaglutida" devolvia `""` — nenhuma área. `trulicity` estava aqui desde
  // o lote das marcas, mas o NOME GENÉRICO, que é o que o médico prescreve e
  // escreve, não. Medido: `dulaglutida` tem 10 ocorrências na base (Obesidade 7,
  // Diabetes 3) e `lixisenatida` 9 (Diabetes 5, Obesidade 4) — as duas no artigo
  // de eventos adversos gastrintestinais dos AR GLP-1, que é o que responde.
  // Peso de fármaco, como as irmãs: "dulaglutida no DM2" continua indo para
  // Diabetes. `albiglutida`, `retatrutida`, `survodutida`, `orforglipron`,
  // `beinaglutida` e `efpeglenatida` ficam FORA — conferidas uma a uma, têm
  // ZERO conteúdo na base, e rota para conteúdo que não existe devolve vazio.
  'dulaglutida': 'Obesidade', 'lixisenatida': 'Obesidade',
  // ⚠️ `cirurgia bariatrica` SAIU DE CAT_FARMACO (08/08/2026) — a frase inteira,
  // e só ela. Como procedimento (2000) ela cedia a QUALQUER doença nomeada, e o
  // resultado medido era o pior sequestro da base: "indico cirurgia bariátrica
  // para IMC 38 com diabetes tipo 2?" ia para Diabetes, que tem UMA ocorrência
  // de "bariátric" em toda a base profunda, contra 172 em Obesidade — onde mora
  // o bloco chamado, literalmente, "indico cirurgia bariátrica? qual cirurgia
  // escolher". A cirurgia metabólica no DM2 é das decisões mais caras da
  // especialidade e a pergunta chegava na área que não a discute.
  // Em tier de doença, `cirurgia bariatrica`(3019) vence `diabetes tipo 2`(3015).
  // `bariatrica` SOZINHA fica no tier de procedimento de propósito: menção de
  // passagem ("gastroparesia após bariátrica em diabético") não deve sequestrar
  // a pergunta — só a cirurgia NOMEADA por extenso, que é quando ela é o assunto.
  'cirurgia bariatrica': 'Obesidade', 'bariatrica': 'Obesidade',
  'dumping': 'Obesidade', 'gastrectomia': 'Obesidade',
  // ⚠️ A HIPOGLICEMIA PÓS-BARIÁTRICA PRECISA DO COMPOSTO, e a razão é uma
  // decisão anterior que continua certa: `bypass gastrico` JÁ é chave (linha
  // ~1206) e está em CAT_FARMACO de propósito — menção de PROCEDIMENTO não
  // sequestra a pergunta, e por isso ela pesa 2015 e perde para
  // `hipoglicemia`(3012). Reclassificá-la para tier de doença consertaria este
  // caso e estragaria o que aquela decisão protege.
  //
  // O composto resolve sem mexer em nada: ele só casa quando a pergunta é
  // EXATAMENTE sobre hipoglicemia depois da cirurgia, e aí a resposta é o
  // consenso de DUMPING, que mora em Obesidade — não o compêndio de
  // hipoglicemia no diabetes, que declara essa causa fora do seu escopo.
  'hipoglicemia pos-bariatrica': 'Obesidade',
  'hipoglicemia apos bypass': 'Obesidade',
  'hipoglicemia apos cirurgia bariatrica': 'Obesidade',
  'hipoglicemia pos-bypass': 'Obesidade',
  // ⚠️ A BASE NÃO TINHA UMA ÚNICA ROTA PARA DIETA (08/08/2026). O Posicionamento
  // Nutricional da ABESO entrou com 138 fatos e, medido termo a termo, VINTE E
  // QUATRO assuntos dele não tinham NENHUMA rota: `canonArea` devolvia "" para
  // "jejum intermitente funciona", "dieta do mediterrâneo", "adoçante faz mal",
  // "óleo de coco emagrece", "balão intragástrico", "telenutrição". A pergunta
  // que o paciente mais faz ao endocrinologista — O QUE COMER — era a que a base
  // não sabia responder, com o documento inteiro pronto e mudo.
  //
  // Cada chave abaixo foi medida por contagem de ocorrência em TODOS os extratos
  // antes de entrar; nenhuma entrou por parecer razoável.
  'dieta cetogenica': 'Obesidade', 'cetogenica': 'Obesidade', 'vlckd': 'Obesidade',
  'vlcd': 'Obesidade', 'dieta de muito baixas calorias': 'Obesidade',
  'jejum intermitente': 'Obesidade', 'janela alimentar': 'Obesidade',
  'low carb': 'Obesidade', 'atkins': 'Obesidade',
  'dieta mediterranea': 'Obesidade', 'dieta do mediterraneo': 'Obesidade',
  'dash': 'Obesidade',
  'dieta vegetariana': 'Obesidade', 'dieta vegana': 'Obesidade', 'plant-based': 'Obesidade',
  'substitutos de refeicao': 'Obesidade', 'substituto de refeicao': 'Obesidade',
  'adocante': 'Obesidade', 'edulcorante': 'Obesidade', 'aspartame': 'Obesidade',
  'sucralose': 'Obesidade', 'stevia': 'Obesidade', 'sacarina': 'Obesidade',
  'ciclamato': 'Obesidade', 'acessulfame': 'Obesidade', 'eritritol': 'Obesidade',
  'whey': 'Obesidade', 'oleo de coco': 'Obesidade',
  'garcinia': 'Obesidade', 'garcinia cambogia': 'Obesidade', 'quitosana': 'Obesidade',
  'sinefrina': 'Obesidade', 'ioimbina': 'Obesidade', 'faseolamina': 'Obesidade',
  'porangaba': 'Obesidade', 'cha verde': 'Obesidade',
  'balao intragastrico': 'Obesidade', 'telenutricao': 'Obesidade',
  'escore-z': 'Obesidade', 'dietas da moda': 'Obesidade',
  'densidade energetica': 'Obesidade',
  // Peso de ACHADO (ver CAT_ACHADO) — aparecem em mais de uma área, ou são
  // genéricas demais para vencer uma doença nomeada. `compulsao alimentar` é o
  // caso que explica a regra: com "obesidade" na pergunta vai para Obesidade
  // (5 ocorrências), com "craniofaringioma" vai para Neuroendocrino (1) — e as
  // duas rotas estão certas, porque a compulsão é sintoma dos dois quadros.
  'ultraprocessado': 'Obesidade', 'probiotico': 'Obesidade', 'microbiota': 'Obesidade',
  'indice glicemico': 'Obesidade', 'deficit calorico': 'Obesidade',
  'cafeina': 'Obesidade', 'termogenico': 'Obesidade',
  'compulsao alimentar': 'Obesidade', 'entrevista motivacional': 'Obesidade',
  'mindful eating': 'Obesidade',
  // ⚠️ FICARAM DE FORA, e cada exclusão é medida, não escrúpulo:
  // · `efedrina` — 3 em Obesidade, mas 1 em Tireoide e 1 em Neuroendocrino;
  //   simpaticomimético não é assunto de uma área só.
  // · `psyllium` — 1 em Lípides contra 1 em Obesidade. Empate não roteia.
  // · `xilitol` — a única ocorrência fora da ABESO está num extrato de área
  //   dupla (Obesidade,Diabetes); a chave não separaria nada.
  // · `fitoterapico`, `nutrigenetica`, `carga glicemica` (grafia sem acento),
  //   `time restricted`, `percentil do imc` — ZERO ocorrência na base inteira.
  //   Rota para conteúdo que não existe é rota que devolve bloco vazio.
  // ⚠️ TRÊS BURACOS MEDIDOS EM 09/08/2026 no teste de caminho da única área com
  // UM artigo só. `apolipoproteína B` roteava e **`ApoB` não** — e é a sigla que
  // o médico escreve, além de estar VERBATIM no tema da parte 2 ("1.6. Sumário
  // de recomendações – ApoB"). `xantoma` é o sinal clássico da
  // hipercolesterolemia familiar, e caía em NENHUMA área. `ácido bempedoico` é
  // fármaco da própria diretriz. Contado: `apob` 36×0, `xantoma` 1×0,
  // `bempedoico` 16×0 — exclusividade perfeita nos três.
  'apob': 'Lípides', 'xantoma': 'Lípides', 'bempedoico': 'Lípides',
  // ⚠️ ENDOCRINOLOGIA FEMININA — três sinais cardinais do hiperandrogenismo
  // caíam em NENHUMA área (09/08/2026): *"acne resistente em mulher adulta"*,
  // *"alopecia androgenética feminina"* e *"AMH elevado em mulher jovem"*.
  // `hiperandrogenismo`, `sop`, `hirsutismo` e `ferriman` já eram chaves — o que
  // faltava era o resto do quadro.
  // Contado (Feminina × resto): `alopecia` 9×3, `amh` 15×3.
  // ❌ `acne` (9×4) FICOU DE FORA depois de eu TENTAR e MEDIR o estrago:
  // *"acne grave em adolescente com HAC"* passava a cair em Feminina, porque
  // `acne` (4 letras → peso 3004) vence `hac` (3 letras → 3003) no desempate por
  // comprimento DENTRO da categoria. Uma pergunta que NOMEIA a doença perdia
  // para um sinal, por uma letra. É a mesma armadilha do `cintilografia` 3013 ×
  // `paratireoide` 3012, e some a dominância de 2,25:1 já era a mais fraca das
  // três. Acne pertence à dermatologia, à adrenal e à ginecologia — chave
  // genérica é como área é sequestrada.
  // ⚠️ `amh` tem 3 letras e vive da fronteira de palavra do `bate()`.
  'alopecia': 'Endocrinologia Feminina', 'amh': 'Endocrinologia Feminina',
  'hipercolesterolemia': 'Lípides', 'estatina': 'Lípides', 'ezetimiba': 'Lípides',
  // ⚠️ DOIS ALVOS LIPÍDICOS SEM ROTA (08/08/2026). `nao-hdl` tem 44 ocorrências
  // na Diretriz e é META CO-PRIMÁRIA junto do LDL — a pergunta "meu paciente
  // está na meta de LDL mas o não-HDL está alto" não alcançava nada.
  // `triglicerides` tem 65 (contra 3 em Obesidade e 1 em Diabetes): só
  // `hipertrigliceridemia` roteava, e não é a palavra que o médico digita ao
  // olhar um exame. Triglicérides muito alto é risco de pancreatite.
  'nao-hdl': 'Lípides', 'colesterol nao-hdl': 'Lípides', 'nao-hdl-c': 'Lípides',
  // ⚠️ SINTOMA MUSCULAR DE ESTATINA — das perguntas mais feitas sobre a classe —
  // não tinha rota. `sintomas musculares`(24) e `miopatia`(25 aqui contra 6
  // somadas nas outras cinco áreas) entram; `rabdomiolise`(10 x 3) também.
  // `mialgia` SOZINHA fica FORA: 3 aqui contra 5 espalhadas em Adrenal,
  // Diabetes, Obesidade e Osteometabolismo — mialgia é sintoma de todo mundo.
  'sintomas musculares': 'Lípides', 'miopatia': 'Lípides', 'rabdomiolise': 'Lípides',
  'risco extremo': 'Lípides',
  'triglicerides': 'Lípides', 'triglicerideos': 'Lípides', 'triglicerideo': 'Lípides',
  'apolipoproteina': 'Lípides',
  // ⚠️ A CLASSE INTEIRA DOS INIBIDORES DE PCSK9 ESTAVA FORA DO MAPA, com 46
  // ocorrências na Diretriz de Dislipidemias (08/08/2026). Mesmo padrão dos
  // iSGLT2 de ontem: classe cara, muito perguntada, conteúdo pronto e mudo.
  // Nomes de estatina: mais longos que `amiodarona`(10), protegem a pergunta
  // do TETO DE DOSE na interação, que é segurança de prescrição.
  // Composto de 24 chars: vence `diabetes tipo 2`(3015), que sequestrava
  // "dislipidemia aterogênica no DM2" para o bloco de diabetes. O substantivo da
  // pergunta é a dislipidemia; o diabetes é o contexto.
  // ⚠️ `Lp(a)` — a grafia que o médico ESCREVE — não roteava, com 45
  // ocorrências na base. `lipoproteina(a)` roteava, mas ninguém digita isso.
  // Entra como ACHADO, igual a `lipoproteina`, para não sequestrar a pergunta
  // que nomeia uma doença junto.
  'lp(a)': 'Lípides',
  'dislipidemia aterogenica': 'Lípides',
  'sinvastatina': 'Lípides', 'atorvastatina': 'Lípides', 'rosuvastatina': 'Lípides',
  'pravastatina': 'Lípides', 'fluvastatina': 'Lípides', 'pitavastatina': 'Lípides',
  'pcsk9': 'Lípides', 'evolocumabe': 'Lípides', 'alirocumabe': 'Lípides',
  'inclisirana': 'Lípides',
  // Quilomicronemia (24 ocorrências) é a entidade do risco de PANCREATITE — a
  // pergunta que mais precisa chegar dentro de lípides.
  'quilomicronemia': 'Lípides', 'sindrome da quilomicronemia familiar': 'Lípides',
  'hipertrigliceridemia': 'Lípides', 'lipoproteina': 'Lípides', 'ldl': 'Lípides',
  // Feminina / Masculina / Pediátrica
  'ovarios policisticos': 'Endocrinologia Feminina', 'hirsutismo': 'Endocrinologia Feminina',
  'sop': 'Endocrinologia Feminina', 'hiperandrogenismo': 'Endocrinologia Feminina',
  'anticoncepcional': 'Endocrinologia Feminina', 'contraceptivo oral': 'Endocrinologia Feminina',
  'espironolactona': 'Endocrinologia Feminina', 'acetato de ciproterona': 'Endocrinologia Feminina',
  'hiperplasia adrenal congenita': 'Endocrinologia Feminina', '17-hidroxiprogesterona': 'Endocrinologia Feminina',
  // ⚠️ A FORMA CLÁSSICA VAI PARA ADRENAL, A FRASE NUA FICA AQUI (10/08/2026).
  // A decisão de 09/08 de deixar `hiperplasia adrenal congenita` em Feminina está
  // registrada acima e continua certa: mover roubaria o rastreio da forma NÃO
  // CLÁSSICA, onde está o corte de 170–200 ng/dL que o artigo de HAC não tem.
  // O que mudou desde então é que entrou no acervo um artigo DEDICADO à HAC
  // (Merke & Auchus, NEJM 2020, 115 fatos, arquivado em Adrenal) — e a auditoria
  // mediu que a pergunta que NOMEIA a doença clássica não alcançava o artigo da
  // doença clássica: "crinecerfonte para hiperplasia adrenal congênita clássica"
  // recebia 11.857 chars de SOP + hirsutismo.
  // Chave composta resolve sem quebrar nada: ela só casa quando a pergunta diz
  // "clássica", e vence a frase nua por comprimento dentro da mesma categoria
  // (3000 + 38 contra 3000 + 29). `crinecerfonte` é 2×0 no acervo, mas sozinho
  // não bastaria — fármaco pesa 2000 e perderia para a doença, que pesa 3000.
  'hiperplasia adrenal congenita classica': 'Adrenal', 'hac classica': 'Adrenal',
  'crinecerfonte': 'Adrenal',
  'amenorreia': 'Endocrinologia Feminina', 'amenorreica': 'Endocrinologia Feminina',
  'endometriose': 'Endocrinologia Feminina', 'shbg': 'Endocrinologia Feminina',
  // "ciclo irregular" é como a paciente e o clínico dizem; `amenorreia` acima só
  // pega a ausência total. Sem isto, "mulher com ciclos irregulares e acne" caía
  // em NENHUMA área, com o artigo de SOP (48k) parado ao lado (09/08/2026).
  'ciclo irregular': 'Endocrinologia Feminina', 'ciclos irregulares': 'Endocrinologia Feminina',
  'irregularidade menstrual': 'Endocrinologia Feminina',
  // "ciclo MENSTRUAL irregular" tem palavra no meio e não casa com a chave acima —
  // chave é substring, não conjunto de palavras. Erro fácil de não perceber.
  'menstrual irregular': 'Endocrinologia Feminina',
  // 'infertilidade' entra como ACHADO: a feminina tem 30 ocorrências, mas
  // infertilidade MASCULINA existe e essa área ainda não tem artigo. Com peso
  // de achado ela ajuda quando nada mais casa e cede para qualquer doença.
  'infertilidade': 'Endocrinologia Feminina', 'menopausa': 'Endocrinologia Feminina',
  'hipogonadismo': 'Endocrinologia Masculina', 'testosterona': 'Endocrinologia Masculina',
  'ginecomastia': 'Endocrinologia Masculina',
  'puberdade precoce': 'Endocrinologia Pediátrica', 'baixa estatura': 'Endocrinologia Pediátrica',
  // Endocrinopatias (miscelânea do acervo)
  'hiponatremia': 'Endocrinopatias',
  'checkpoint': 'Endocrinopatias', 'inibidor de checkpoint': 'Endocrinopatias',
  // `irae` é exclusiva (8×0) e é como o oncologista escreve. `endocrinopatia` no
  // SINGULAR não casava a chave plural e caía em vazio (23 × 5).
  'irae': 'Endocrinopatias', 'endocrinopatia': 'Endocrinopatias',
  // ⚠️ SIGLA INGLESA DA EMERGÊNCIA — medido em 14/08/2026, com o consenso
  // ADA/EASD 2024 já na base. "DKA", "HHS", "conduta na DKA" e "o que e HHS"
  // caíam em NENHUMA área: o médico recebia zero conteúdo profundo.
  //
  // ⚠️ E a medição desmente metade do pedido: vinheta REAL já roteava sozinha
  // ("DKA com pH 7,1: quando comeco a insulina?" e "HHS em idoso com glicemia
  // 900" já iam para Diabetes pelas outras palavras). O buraco é só a sigla nua.
  // `UTI` NÃO entra: tem 3 letras, é filtrada, e "paciente na UTI com
  // hiperglicemia" já roteia. O corpus não tem as siglas (dka 1x, hhs 0x) — elas
  // entram pela clínica, não pela contagem, e roubam ZERO das 349 perguntas.
  'dka': 'Diabetes', 'hhs': 'Diabetes',
  // ⚠️ TRÊS FRASES NATURAIS NÃO ROTEAVAM PARA NENHUMA ÁREA (14/08/2026), e o
  // bloco dedicado (Endocrinopatias, 39k, "ENDOCRINOPATIA INDUZIDA POR INIBIDOR
  // DE CHECKPOINT") era inalcançável por elas: "imunoterapia oncológica:
  // rastreio endócrino antes de cada ciclo", "toxicidade endócrina da
  // imunoterapia: quais eixos?" e "efeito adverso endócrino de anti-PD1".
  //
  // ⚠️ `imunoterapia` SOZINHA foi TESTADA E REJEITADA. Ela não rouba nenhuma das
  // 349 perguntas do teste, mas ROUBA `imunoterapia e tireoide` de Tireoide — e
  // a medição do que cada área entrega deu EMPATE COM TROCA DE LADO: Tireoide
  // traz `tionamida` e não traz `crise adrenal`; Endocrinopatias traz `crise
  // adrenal` e não traz `tionamida`. Trocar um pelo outro em silêncio não é
  // conserto. Por isso entram as FRASES específicas, que não disputam com o
  // órgão nomeado.
  'imunoterapia oncologica': 'Endocrinopatias',
  'toxicidade endocrina': 'Endocrinopatias',
  // ⚠️ `anti-pd` sozinho NÃO casa "anti-PD1": o `bate()` exige fronteira não
  // alfanumérica depois da chave, e `1` é alfanumérico. Daí as grafias separadas.
  // `ici` ficou de fora de propósito: sigla de três letras não paga o risco.
  'anti-pd1': 'Endocrinopatias', 'anti-pd-1': 'Endocrinopatias',
  'anti-pd-l1': 'Endocrinopatias',
  // ⚠️ `hipernatremia` MUDOU DE ÁREA em 09/08/2026, e o motivo é que o conteúdo
  // chegou. Ela apontava para Endocrinopatias, onde a contagem é **ZERO** — os
  // cinco blocos de lá são todos de HIPOnatremia. Com o artigo de diabetes
  // insipidus central, `hipernatremia` passou a 21 ocorrências em
  // Neuroendocrinologia (21×0). Enquanto apontava para Endocrinopatias, a
  // pergunta de hipernatremia recebia os blocos do distúrbio OPOSTO, cuja
  // mensagem inteira é "corrija devagar, cuidado com a desmielinização".
  // O núcleo continua cobrindo o caso geral ("déficit de água livre → repor água
  // livre"); o bloco profundo acrescenta a profundidade do eixo da vasopressina.
  'hipernatremia': 'Neuroendocrinologia',
  // `supracorrecao` (38 ocorrências, só aqui) é a palavra que o médico
  // brasileiro escreve para a correção rápida demais do sódio, e é assunto de
  // SEGURANÇA: só `desmielinizacao osmotica` roteava, que é a consequência, não
  // o erro que se quer evitar.
  // `restricao hidrica`(37) é o tratamento de PRIMEIRA LINHA do SIADH e não
  // tinha rota; `agua livre`(28) e `debito urinario`(25) são o vocabulário com
  // que se acompanha a correção.
  'restricao hidrica': 'Endocrinopatias', 'agua livre': 'Endocrinopatias',
  'debito urinario': 'Endocrinopatias',
  'supracorrecao': 'Endocrinopatias', 'supracorrigir': 'Endocrinopatias',
  'desmielinizacao osmotica': 'Endocrinopatias', 'copeptina': 'Endocrinopatias',
  'tolvaptan': 'Endocrinopatias', 'siad': 'Endocrinopatias', 'siadh': 'Endocrinopatias',
  // 'dumping' fica em OBESIDADE, não aqui: é complicação de cirurgia gástrica e
  // é o único conteúdo profundo que a área de obesidade tem. Um agente o moveu
  // para Endocrinopatias em 08/08/2026 — defensável em tese, mas ESVAZIOU a
  // subespecialidade inteira, e o mapa de termos tem de concordar com o extrato.

  // ⚠️ O QUE O MÉDICO ESCREVE, e não o nome do diagnóstico (08/08/2026).
  //
  // Medido com 21 perguntas clínicas realistas: 7 não roteavam para lugar
  // nenhum. As TRÊS de hiponatremia falharam — logo a área onde mais corrigi
  // conduta hoje (5 extratos, 638 fatos, o teto lido como meta, o gatilho da
  // desmielinização). "Idoso de 78 anos com sódio de 118, confuso. Qual o
  // limite de correção?" devolvia bloco de 0 caractere, porque o mapa acima só
  // conhecia a palavra "hiponatremia" — que é justamente a que o médico NÃO
  // escreve. Ele escreve o ACHADO: o eletrólito e o número, o analito e o
  // valor, a sigla. Quem já sabe o nome do diagnóstico não precisa perguntar.
  'sodio': 'Endocrinopatias', 'natremia': 'Endocrinopatias', 'osmolalidade': 'Endocrinopatias',
  'salina hipertonica': 'Endocrinopatias', 'desmopressina': 'Endocrinopatias',
  'prolactina': 'Neuroendocrinologia', 'selar': 'Neuroendocrinologia',
  // ⚠️ A TRÍADE CLÁSSICA CAÍA EM ENDOCRINOLOGIA FEMININA (08/08/2026).
  // "Prolactina de 90 com amenorreia e galactorreia" — a apresentação de manual
  // do prolactinoma — devolvia o bloco de Feminina, porque `amenorreia`(3010)
  // vence `prolactina`, que é ACHADO e vale 1010. E `galactorreia` não existia
  // no mapa: "galactorreia isolada" devolvia bloco VAZIO, com 386 fatos de
  // prolactinoma na base. Galactorreia é das poucas queixas cujo diferencial JÁ
  // É a hiperprolactinemia, então entra com peso de doença — só ela, porque
  // `amenorreia` sozinha continua sendo pergunta de Feminina.
  'galactorreia': 'Neuroendocrinologia',
  'suprasselar': 'Neuroendocrinologia', 'quiasma': 'Neuroendocrinologia',
  // ⚠️ A ÁREA VAZIA DEIXOU DE SER VAZIA, E O EMPRÉSTIMO VIROU ROUBO (19/08/2026).
  //
  // O comentário da vinheta de craniofaringioma em `test-teto-diretrizes.js` já
  // avisava: "a área vazia venceu a área que tem o conteúdo". Enquanto
  // Endocrinologia Pediátrica não tinha bloco nenhum, `deepFor` descia para a
  // segunda colocada e a vinheta chegava em Neuroendocrinologia POR ACIDENTE. No
  // dia em que a pediatria recebeu o primeiro artigo (Posicionamento ABESO/SBP
  // 2026 de obesidade pediátrica), a descida parou de acontecer e a menina de 9
  // anos com calcificação suprasselar passou a receber 53k de OBESIDADE
  // PEDIÁTRICA no lugar dos 295k de craniofaringioma — o assunto exato da
  // pergunta. É o mesmo defeito que o arquivo já registra para a área masculina.
  //
  // A causa: `baixa estatura` (14 letras, peso de doença) vencia `suprasselar`
  // (11 letras, peso de achado). MEDIDO em 14 perguntas, entre duas correções:
  //   · reclassificar `baixa estatura` como ACHADO — NÃO resolve (os dois viram
  //     achado e o desempate por comprimento continua dando 1014 x 1011) e ainda
  //     move "baixa estatura após transplante e corticoide" para Adrenal;
  //   · a chave COMPOSTA abaixo — resolve as duas vinhetas e não muda mais nada.
  // Ficou a que mede. Calcificação suprasselar é o achado de imagem clássico do
  // craniofaringioma adamantinomatoso; não é chave genérica.
  'calcificacao suprasselar': 'Neuroendocrinologia',
  'calcificacao supra-selar': 'Neuroendocrinologia',
  // ⚠️ A RELAÇÃO CINTURA-ESTATURA ENTROU NA BASE E NÃO TINHA COMO SER PERGUNTADA
  // (19/08/2026). O Posicionamento ABESO/SBP 2026 recomenda acrescentá-la ao IMC
  // (>0,5 como limiar primário, >0,55 em contexto selecionado) e é a ÚNICA fonte
  // da base que fala dela. Medido: "relação cintura-estatura em criança, qual o
  // corte?" e "RCEst maior que 0,5 em adolescente" canonizavam para NENHUMA área
  // — zero caractere de bloco profundo, com a resposta parada ao lado.
  //
  // Contado antes de entrar, que é a regra: `cintura-estatura` e `rcest` aparecem
  // SÓ neste extrato (4 e 3 ocorrências, nas duas áreas em que ele está) e em
  // NENHUM outro bloco da base. Não há de quem roubar.
  //
  // Vai para Obesidade, e não para a pediatria, porque o bloco pediátrico está
  // declarado nas DUAS áreas: por Obesidade o médico recebe a resposta pediátrica
  // e ainda o contexto de obesidade do adulto; pela pediatria receberia só o
  // primeiro. Escolher a área mais generosa quando as duas contêm a resposta.
  'relacao cintura-estatura': 'Obesidade',
  'cintura-estatura': 'Obesidade',
  // grafia sem hífen, que é como metade das pessoas escreve; ZERO ocorrência em
  // toda a base, então não tira nada de ninguém.
  'cintura estatura': 'Obesidade',
  'rcest': 'Obesidade',
  'campo visual': 'Neuroendocrinologia', 'knosp': 'Neuroendocrinologia',
  'fosfatase alcalina baixa': 'Osteometabolismo', 'densidade mineral ossea': 'Osteometabolismo',
  't-score': 'Osteometabolismo', 'dxa': 'Osteometabolismo', 'fratura de fragilidade': 'Osteometabolismo',
  'fratura vertebral': 'Osteometabolismo', 'esfoliacao': 'Osteometabolismo',
  'dentes deciduos': 'Osteometabolismo', 'metatarso': 'Osteometabolismo',
  'perda precoce de dentes': 'Osteometabolismo',
  'cortisol matinal': 'Adrenal', 'cosintropina': 'Adrenal', 'prednisona': 'Adrenal',
  'dexametasona': 'Adrenal', 'metirapona': 'Adrenal',
  // ⚠️ PROTEÇÕES DO EIXO. Estas existem porque a correção do lado do DIABETES
  // (acima) sobe o peso de `insulina`, e sem elas o eixo perderia perguntas que
  // hoje acerta. São o outro prato da balança, não enfeite: o teste de
  // tolerância à insulina é do EIXO, não do diabetes, e "acelerar o desmame" é a
  // pergunta de supressão adrenal por excelência.
  'teste de tolerancia a insulina': 'Adrenal',
  'acelerar o desmame': 'Adrenal', 'apressar o desmame': 'Adrenal',
  'cushing exogeno': 'Adrenal', 'sindrome de cushing exogena': 'Adrenal',
  'cushing iatrogenico': 'Adrenal', 'supressao do eixo': 'Adrenal',

  // ⚠️ A INSUFICIÊNCIA ADRENAL SÓ CHEGAVA A QUEM ESCREVIA "ADRENAL" (08/08/2026).
  //
  // A chave que salvava quase todas as perguntas desta área era o `CANON`
  // 'adrenal' — ou seja, o médico tinha de digitar a palavra "adrenal" para
  // receber o Seminar da Lancet e a diretriz ESE/ES 2024. Medindo 12 perguntas
  // realistas, 4 devolviam bloco de 0 caractere, e as 4 eram justamente as que
  // um endocrinologista escreve sem nomear a glândula:
  //
  //   · "preciso aumentar a FLUDROCORTISONA no terceiro trimestre?"  → ''
  //   · "fadiga, hipotensão postural e HIPERPIGMENTAÇÃO das dobras"  → ''
  //   · "em OPIOIDE crônico, pode ser supressão do eixo?"            → ''
  //   · "ajustar o CORTICOIDE para cirurgia em paciente ADDISONIANO" → ''
  //
  // O último é o mais claro: 'addison' já estava no mapa, mas o sufixo tolerado
  // é só plural (s|es|as|os), então "addisoniano" não casa; e 'glicocorticoide'
  // não cobre "corticoide" porque a fronteira de palavra exige limite à
  // esquerda. Duas palavras que o médico escreve todo dia, e nenhuma chegava.
  //
  // Categorias: fludrocortisona/corticoide/opioide são FÁRMACO (cenário);
  // hiperpigmentação e avidez por sal são ACHADO — ficam abaixo de qualquer
  // doença nomeada, então só decidem quando nada mais decide, que é o caso da
  // vinheta de Addison sem diagnóstico. 'addisoniano' é DOENÇA.
  'fludrocortisona': 'Adrenal', 'corticoide': 'Adrenal', 'corticosteroide': 'Adrenal',
  'corticoterapia': 'Adrenal', 'opioide': 'Adrenal', 'opiaceo': 'Adrenal',
  'addisoniano': 'Adrenal', 'addisoniana': 'Adrenal',
  'hiperpigmentacao': 'Adrenal', 'avidez por sal': 'Adrenal',
  // O médico nem sempre escreve o termo técnico. A vinheta clássica de Addison
  // que continuava devolvendo bloco vazio era "fadiga, hipotensão postural e
  // ESCURECIMENTO DAS DOBRAS da mão" — nenhuma palavra do mapa aparecia ali.
  // Não é sintoma genérico (que a regra de entrada proíbe): é o achado, escrito
  // como se fala. Como ACHADO, perde para qualquer doença nomeada na frase.
  'escurecimento da pele': 'Adrenal', 'escurecimento das dobras': 'Adrenal',
  'burch-wartofsky': 'Tireoide', 'tsh': 'Tireoide', 't4 livre': 'Tireoide',
  'tiroxina': 'Tireoide', 'trab': 'Tireoide',
  'hemoglobina glicada': 'Diabetes', 'hba1c': 'Diabetes', 'tacrolimo': 'Diabetes',
  'ciclosporina': 'Diabetes', 'glicemia de jejum': 'Diabetes',
  'hiperglicemia': 'Diabetes', 'glicemia': 'Diabetes',
  // Etilismo como ACHADO (peso 1000), de propósito. A cetoacidose alcoólica do
  // paciente SEM diabetes está na base, mas a vinheta que não diz "cetoacidose"
  // — "etilista, dor abdominal, ânion gap alto" — não tinha por onde chegar.
  // Peso de achado porque etilismo não é a doença endócrina perguntada: ele
  // ajuda quando nada mais casa e cede para qualquer diagnóstico nomeado.
  'etilismo': 'Diabetes', 'etilista': 'Diabetes', 'alcoolismo': 'Diabetes',
  'hiperosmolar': 'Diabetes',
  // ⚠️ A abreviação que o médico realmente escreve. Sem ela, "DM2 descompensado
  // após pulso de corticoide" casava só em 'corticoide' e ia para Adrenal —
  // o termo novo sequestrava a pergunta de diabetes. `diabetes` não casa "DM2".
  'dm2': 'Diabetes', 'dm1': 'Diabetes', 'dm tipo 2': 'Diabetes', 'dm tipo 1': 'Diabetes',
  'diabetes tipo 2': 'Diabetes', 'diabetes tipo 1': 'Diabetes',
  // "diabético" não é flexão de "diabetes" — o sufixo tolerado é só plural.
  'diabetico': 'Diabetes', 'diabetica': 'Diabetes',
  'imc': 'Obesidade', 'bypass gastrico': 'Obesidade', 'gastroplastia': 'Obesidade',
  'sleeve': 'Obesidade', 'hipoglicemia pos-prandial': 'Obesidade',
  'testosterona total': 'Endocrinologia Masculina', 'espermograma': 'Endocrinologia Masculina',
  'ferriman': 'Endocrinologia Feminina', 'virilizacao': 'Endocrinologia Feminina',
  // `anovulacao`(3) roteava e `ovulacao`(29) não; `letrozol`(6) roteava e
  // `clomifeno`(19) não. Indução da ovulação é conduta central da SOP.
  'ovulacao': 'Endocrinologia Feminina', 'inducao da ovulacao': 'Endocrinologia Feminina',
  'clomifeno': 'Endocrinologia Feminina', 'citrato de clomifeno': 'Endocrinologia Feminina',
  'anovulacao': 'Endocrinologia Feminina', 'letrozol': 'Endocrinologia Feminina',

  // ⚠️ ENDOCRINOLOGIA DO ESPORTE — a área que só existia pelo nome (08/08/2026).
  //
  // Entrou o primeiro artigo da subespecialidade (position statement EASD/ISPAD
  // 2020, exercício no DM1 com CGM/isCGM, 147 fatos). Antes dele o único texto
  // que canonizava para cá era a própria expressão "endocrinologia do esporte",
  // que nenhum médico digita — e todas as perguntas de exercício caíam em
  // Diabetes, onde não existe nada sobre carboidrato por seta de tendência,
  // redução de bolus por tipo de exercício ou hipoglicemia noturna pós-treino.
  //
  // A disputa aqui é diferente das outras áreas: a pergunta de esporte SEMPRE
  // menciona diabetes. Por isso as chaves precisam ser mais longas que as do
  // vizinho — 'hipoglicemia' pesa 3012 e 'diabetes tipo 1' pesa 3015, então
  // 'exercicio' sozinho (3009) perde. As formas compostas ("exercicio
  // aerobico", "hipoglicemia pos-exercicio") existem exatamente para ganhar
  // esse desempate, e são honestas: quem escreve "exercício" na frase está
  // perguntando de exercício.
  //
  // ⚠️ LIMITE CONHECIDO, que este mapa NÃO resolve: a palavra "diabetes" solta
  // aciona `CANON` com peso 4008, acima de qualquer chave de TERMOS. Uma
  // pergunta escrita como "paciente com diabetes tipo 1 que corre maratona"
  // continua indo para Diabetes. Quem escreve "DM1" (ou não nomeia a doença)
  // chega aqui. Consertar isso exigiria mexer no bônus do CANON, que existe
  // para o caso legítimo de `area` DECLARADA — decisão de quem cuida do
  // roteador, não deste mapa.
  //
  // Regra de entrada respeitada: nenhuma destas palavras pertence a outra
  // subespecialidade. Ficaram DE FORA de propósito, por ambiguidade:
  // 'bomba de insulina' e 'cgm'/'sensor de glicose' (tecnologia de diabetes em
  // geral, não de esporte), 'academia' (colide com "Academia Americana de…"),
  // 'sedentarismo' e 'perda de peso' (obesidade), 'cetonemia' (cetoacidose).
  //
  // ⚠️ E ficaram de fora 'atleta', 'corredor' e 'esportista' — medidos e
  // REPROVADOS. Eles descrevem a PESSOA, não o assunto, e por isso são cenário
  // pela regra que este arquivo já usa (exame/achado perde para doença).
  // "Atleta com TSH de 8 e T4 livre normal: trato?" roteava para o Esporte por
  // causa de 'atleta' — uma pergunta de tireoide recebendo o bloco de exercício
  // no DM1. Nomes de MODALIDADE ('maratona', 'musculacao', 'futebol') ficam,
  // porque nomeiam a ATIVIDADE, que é o assunto; e perdem para qualquer doença
  // nomeada na frase ('osteoporose' 3011 > 'musculacao' 3010).
  'exercicio': 'Endocrinologia do Esporte',
  'exercicio fisico': 'Endocrinologia do Esporte',
  'atividade fisica': 'Endocrinologia do Esporte',
  // Nome de esporte: sinal inequívoco de pergunta de exercício. NÃO entram
  // 'musculacao' nem 'treino resistido' — o arquivo já registra que empatam com
  // 'osteoporose' e roubariam a pergunta de osso.
  //
  // ⚠️ LIMITE CONHECIDO, e deliberado. Endocrinologia do Esporte só existe na
  // INTERSEÇÃO: toda pergunta dela nomeia também uma doença. Então
  // "adolescente com diabetes tipo 1, futebol à tarde, hipoglicemia noturna"
  // roteia para Diabetes — `diabetes tipo 1`(15) vence `futebol`(7) por
  // comprimento dentro da mesma categoria.
  //
  // NÃO promovi o esporte acima de doença de propósito: hoje a área tem UM
  // artigo (exercício no DM1), e promover faria "maratonista com
  // hipotireoidismo" receber conteúdo de DM1 — trocar uma resposta incompleta
  // por uma errada. A regra certa é composta (esporte E diabetes), e o esquema
  // de pesos não a expressa. Reavaliar quando a área tiver mais de um artigo:
  // aí dá para medir entrega real em vez de adivinhar peso.
  'futebol': 'Endocrinologia do Esporte', 'corrida': 'Endocrinologia do Esporte',
  'maratona': 'Endocrinologia do Esporte', 'natacao': 'Endocrinologia do Esporte',
  'ciclismo': 'Endocrinologia do Esporte', 'triatlo': 'Endocrinologia do Esporte',
  'endurance': 'Endocrinologia do Esporte',
  'exercicio aerobico': 'Endocrinologia do Esporte',
  'exercicio anaerobico': 'Endocrinologia do Esporte',
  'exercicio resistido': 'Endocrinologia do Esporte',
  'exercicio intervalado': 'Endocrinologia do Esporte',
  // ⚠️ 'treino resistido' (16 chars → 3016) foi medido e REPROVADO: passava na
  // frente de 'prolactinoma' (3012) e mandava "prolactinoma em paciente que faz
  // treino resistido" para o Esporte. As formas curtas abaixo pegam a mesma
  // frase com peso baixo, então só decidem quando nenhuma doença é nomeada —
  // que é justamente o caso da pergunta de esporte de verdade.
  'resistido': 'Endocrinologia do Esporte',
  'intervalado': 'Endocrinologia do Esporte',
  'antes do exercicio': 'Endocrinologia do Esporte',
  'durante o exercicio': 'Endocrinologia do Esporte',
  'apos o exercicio': 'Endocrinologia do Esporte',
  'depois do exercicio': 'Endocrinologia do Esporte',
  'pre-exercicio': 'Endocrinologia do Esporte',
  'pos-exercicio': 'Endocrinologia do Esporte',
  'hipoglicemia pos-exercicio': 'Endocrinologia do Esporte',
  'hipoglicemia no exercicio': 'Endocrinologia do Esporte',
  'hipoglicemia durante o exercicio': 'Endocrinologia do Esporte',
  'hipoglicemia induzida pelo exercicio': 'Endocrinologia do Esporte',
  'hipoglicemia noturna pos-exercicio': 'Endocrinologia do Esporte',
  'aerobico': 'Endocrinologia do Esporte', 'anaerobico': 'Endocrinologia do Esporte',
  'limiar anaerobico': 'Endocrinologia do Esporte', 'hiit': 'Endocrinologia do Esporte',
  'treino': 'Endocrinologia do Esporte', 'treinamento': 'Endocrinologia do Esporte',
  'esporte': 'Endocrinologia do Esporte', 'endurance': 'Endocrinologia do Esporte',
  'maratona': 'Endocrinologia do Esporte', 'meia-maratona': 'Endocrinologia do Esporte',
  'corrida': 'Endocrinologia do Esporte',
  'ciclismo': 'Endocrinologia do Esporte', 'natacao': 'Endocrinologia do Esporte',
  'musculacao': 'Endocrinologia do Esporte', 'futebol': 'Endocrinologia do Esporte',
  // ⚠️ A LISTA TINHA OS SUBSTANTIVOS E NENHUM VERBO — e o médico escreve o verbo.
  // Medido em 09/08/2026 pelo teste de caminho:
  //   "corrida com diabetes tipo 1"  → Esporte    "correr com diabetes tipo 1"  → Diabetes
  //   "natacao ..."                  → Esporte    "nadar com diabetes tipo 1"   → Diabetes
  //                                               "pedalar com diabetes tipo 1" → Diabetes
  // A promoção condicional do Esporte exige que ALGUMA chave da área case; com só
  // os substantivos, a vinheta escrita em verbo ("o paciente vai correr 10 km")
  // nunca acionava a exceção e caía no sequestro por `diabetes tipo 1`.
  // ⚠️ `correr` e `caminhar` só são seguros porque `bate()` casa por PALAVRA
  // INTEIRA: por substring, `correr` casaria dentro de "ocorrer"/"decorrer"
  // (95 ocorrências na base, ZERO como palavra) e `caminhar` dentro de
  // "encaminhar". Conferido nos dois.
  'correr': 'Endocrinologia do Esporte', 'nadar': 'Endocrinologia do Esporte',
  'pedalar': 'Endocrinologia do Esporte', 'caminhar': 'Endocrinologia do Esporte',
  'treinar': 'Endocrinologia do Esporte', 'exercitar': 'Endocrinologia do Esporte',
  'triatlo': 'Endocrinologia do Esporte',
  // ⚠️ 'atleta' foi MEDIDO E REJEITADO. Como achado (1006) ele passa na frente
  // de 'tsh' (1003) e mandava "atleta com TSH de 8: trato?" para o Esporte —
  // justamente o sentinela que este arquivo já registra. E não fazia falta: o
  // caso que motivou a ideia ("atleta amenorreica…") é resolvido por
  // 'amenorreica'. Palavra que descreve QUEM é o paciente, e não do que ele
  // sofre, não deve competir com o exame que nomeia a doença.
  'baixa disponibilidade energetica': 'Endocrinologia do Esporte'
};

function deacc(s) {
  return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim();
}

// ⚠️ FRONTEIRA DE PALAVRA, e não `includes`. Enquanto `canonArea` só recebia
// NOME DE ÁREA, casar por substring era inofensivo. Ao passar a receber a
// PERGUNTA do médico (o grounding do chat), vira armadilha: a chave 'osso' está
// dentro de "posso" e de "nosso", e "posso dar bisfosfonato?" roteava para
// Osteometabolismo por acidente — acertando o destino pelo motivo errado, o que
// é pior do que errar, porque a próxima frase com "nosso paciente" leva junto.
// O sufixo opcional preserva o plural e a flexão simples ("dislipidemias",
// "bisfosfonatos", "estatinas") que o `includes` pegava de graça.
const RE_CACHE = new Map();
// ⚠️ NEGADO NÃO CONTA (08/08/2026). "IMC 31, IAM há 2 anos, SEM diabetes:
// posso dar semaglutida?" roteava para Diabetes — a palavra estava lá, dentro de
// "sem diabetes". O roteador lia a presença do termo e ignorava que a frase o
// NEGA, mandando a pergunta de obesidade para a área que ela acabou de excluir.
// Só conta a ocorrência que NÃO vem logo depois de uma negação.
const NEGADO_ANTES = /(^|[^a-z0-9])(sem|nao|nem|exceto|salvo|descartad[oa]|afastad[oa]|excluid[oa])\s+(historia\s+de\s+|diagnostico\s+de\s+|quadro\s+de\s+)?$/;
function bate(hay, chave) {
  let re = RE_CACHE.get(chave);
  if (!re) {
    re = new RegExp('(^|[^a-z0-9])' + chave.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(s|es|as|os)?([^a-z0-9]|$)', 'g');
    RE_CACHE.set(chave, re);
  }
  re.lastIndex = 0;
  let m;
  while ((m = re.exec(hay)) !== null) {
    const ini = m.index + (m[1] ? m[1].length : 0);
    if (!NEGADO_ANTES.test(hay.slice(Math.max(0, ini - 40), ini))) return true;
    if (re.lastIndex <= m.index) re.lastIndex = m.index + 1;
  }
  return false;
}

// ⚠️ CATEGORIA ANTES DE COMPRIMENTO (08/08/2026, 2ª correção do mesmo desempate).
//
// Comprimento era um proxy grosseiro de especificidade e falha nos dois sentidos.
// A auditoria do hirsutismo achou o contraexemplo que faltava:
//
//   "Mulher de 30 anos com testosterona total NORMAL: trato o hirsutismo?"
//     testosterona(12) > hirsutismo(10) → ia para Endocrinologia MASCULINA
//   "A metformina trata hirsutismo?"
//     metformina(10) = hirsutismo(10) → empate resolvido pela ORDEM DA CHAVE → PTDM
//
// Hoje isso não dói só porque a área masculina está VAZIA e o `deepFor` desce
// para a próxima com conteúdo. No dia em que entrar o primeiro artigo de
// hipogonadismo, a pergunta de hirsutismo passa a receber hipogonadismo
// masculino — uma bomba-relógio armada por um acidente de ortografia.
//
// O sinal certo não é o tamanho da palavra, é O QUE ELA É. Numa vinheta clínica
// o EXAME e o FÁRMACO são quase sempre cenário; a DOENÇA é o assunto. Isso
// também explica o contraexemplo anterior sem precisar de comprimento:
// "IMC 38 pós-sleeve investigando hiperaldosteronismo" — imc e sleeve são
// cenário, hiperaldosteronismo é o assunto.
//
// Ordem: área declarada > doença/síndrome > fármaco/procedimento > exame/achado.
// Comprimento só desempata DENTRO da mesma categoria.
// Condições cuja AUSÊNCIA na pergunta manda o bloco "induzido por X" para trás
// no desempate (ver `exigidaAusente`, no deepFor). Só entra condição com
// sinônimo FECHADO — o médico escreve "prednisona", não "glicocorticoide".
const CONDICAO_EXIGIDA = {
  glicocorticoide: ['glicocorticoide', 'corticoide', 'corticosteroide', 'corticoterapia',
    'corticoide cronico', 'prednisona', 'prednisolona', 'metilprednisolona', 'dexametasona',
    'hidrocortisona', 'budesonida', 'deflazacorte', 'esteroide', 'giop'],
};

const CAT_ACHADO = new Set(['sodio', 'natremia', 'osmolalidade', 'prolactina', 'cortisol',
  'fosfatase alcalina', 'fosfatase alcalina baixa', 't-score', 'dxa', 'densitometria', 'densidade mineral ossea',
  'tsh', 't4 livre', 't3 livre', 't3', 't4', 'trab', 'hemoglobina glicada', 'hba1c', 'glicemia de jejum',
  'imc', 'testosterona', 'testosterona total', 'espermograma', 'copeptina', 'paratormonio', 'ldl',
  'lipoproteina', 'campo visual', 'knosp', 'burch-wartofsky', 'ferriman', 'selar', 'suprasselar', 'quiasma',
  'macroprolactina', '17-hidroxiprogesterona', 'autoanticorpo', 'anti-gad', 'anti-ia2', 'peptideo c', 'hiperpigmentacao', 'avidez por sal',
  'escurecimento da pele', 'escurecimento das dobras',
  'etilismo', 'etilista', 'alcoolismo', 'hiperosmolar',
  'lua de mel', 'remissao parcial', 'infertilidade', 'lp(a)', 'shbg',
  'velocidade de crescimento', 'reganho', 'meta de perda de peso',
  'transaminases', 'aminotransferases', 'tgo', 'tgp', 'alt', 'ast',
  'pos-transplante', 'enzimas hepaticas', 'figado',
  'emagrecer', 'emagrecimento', 'reganho de peso', 'manutencao do peso',
  'circunferencia da cintura', 'indice de massa corporal', 'apneia obstrutiva do sono',
  'captacao',
  'cgm', 'sensor de glicose', 'glicose intersticial',
  'monitorizacao continua de glicose', 'tempo no alvo',
  'ultraprocessado', 'probiotico', 'microbiota', 'indice glicemico',
  'deficit calorico', 'cafeina', 'termogenico', 'compulsao alimentar',
  'entrevista motivacional', 'mindful eating']);
const CAT_FARMACO = new Set(['bisfosfonato', 'alendronato', 'zoledronato', 'risedronato', 'denosumabe',
  'romosozumabe', 'teriparatida', 'abaloparatida', 'asfotase', 'cabergolina', 'hidrocortisona', 'prednisona',
  'dexametasona', 'metirapona', 'cosintropina', 'glicocorticoide', 'levotiroxina', 'metimazol', 'tiroxina',
  'propiltiouracil', 'radioiodo', 'tireoidectomia', 'insulina', 'metformina', 'tacrolimo', 'ciclosporina',
  'carbimazol', 'tiamazol', 'ptu', 'antitireoidiano', 'tionamida', 'propranolol', 'litio',
  'nivolumabe', 'pembrolizumabe', 'tirosina-quinase',
  'semaglutida', 'tirzepatida', 'liraglutida', 'bariatrica', 'gastrectomia',
  'empagliflozina', 'dapagliflozina', 'canagliflozina', 'ertugliflozina', 'gliflozina',
  'isglt2', 'sglt2', 'inibidor de sglt2',
  'dasiglucagon', 'pramlintida', 'golimumabe', 'glucagon nasal',
  'alca fechada', 'pancreas artificial', 'pancreas bionico', 'bomba de insulina',
  'bypass gastrico', 'gastroplastia', 'sleeve', 'estatina', 'ezetimiba', 'tolvaptan', 'desmopressina',
  // ⚠️ RADIOTERAPIA É PROCEDIMENTO, e classificá-la como doença criou erro de
  // rota na hora: "radioterapia no câncer de tireoide" ia para
  // Neuroendocrinologia — o artigo de craniofaringioma — porque `radioterapia`
  // (3012) vencia `tireoide` (3008). Tireoide não tem conteúdo de radioterapia,
  // então nenhuma das duas responde; mas buraco avisa e erro de rota não.
  // No tier de procedimento, a doença nomeada volta a mandar e a pergunta de
  // craniofaringioma continua chegando pela própria doença.
  'radioterapia', 'radiocirurgia', 'bypass',
  'salina hipertonica', 'letrozol', 'espironolactona', 'anticoncepcional', 'contraceptivo oral',
  'fludrocortisona', 'corticoide', 'corticosteroide', 'corticoterapia', 'opioide', 'opiaceo',
  'amiodarona', 'evolocumabe', 'alirocumabe', 'inclisirana',
  'ozempic', 'wegovy', 'rybelsus', 'saxenda', 'victoza', 'mounjaro', 'zepbound',
  'trulicity', 'contrave', 'xenical', 'byetta', 'bydureon', 'dulaglutida', 'lixisenatida',
  'efedrina',
  'qsymia', 'lorcasserina', 'lorcaserina', 'exenatida', 'pramlintida',
  'pioglitazona', 'resmetirom',
  'orlistate', 'orlistat', 'sibutramina', 'fentermina', 'fentermina-topiramato',
  'naltrexona', 'naltrexona-bupropiona', 'levocarnitina', 'glp-1', 'ar glp-1',
  'agonista de glp-1', 'exenatida',
  'sinvastatina', 'atorvastatina', 'rosuvastatina', 'pravastatina',
  'fluvastatina', 'pitavastatina']);
// ⚠️ UM QUARTO DEGRAU, ENTRE FÁRMACO E DOENÇA (08/08/2026, auditoria da
// hiperglicemia por corticoide).
//
// Cinco perguntas do capítulo novo caíam em Adrenal porque o corticoide é um
// FÁRMACO (2000) e a glicemia é um ACHADO (1000): "paciente em corticoide em
// dose alta, em que horário medir a glicemia?" ia para o eixo adrenal, e a
// resposta errada dessa pergunta — medir o jejum — é justamente a armadilha que
// o capítulo documenta.
//
// A saída óbvia era promover `glicemia` a peso de doença. **Medi, e ela cobra
// caro**: "hiperglicemia em paciente com acromegalia" virava Diabetes, perdendo
// o bloco que explica que quem trata essa hiperglicemia é o tratamento da
// acromegalia. Trocar um acerto por um erro não é conserto.
//
// O degrau expressa a regra que faltava, e ela é estreita de propósito:
//
//   um achado glicêmico vence o FÁRMACO que o causou, e nunca vence uma DOENÇA
//   nomeada na mesma frase.
//
// 2500 fica acima de qualquer fármaco (chave mais longa ≈ 2020) e abaixo de
// qualquer doença (3000+). `cortisol matinal` entra aqui pelo motivo espelhado:
// é o TESTE NOMEADO do eixo, não um achado cru, e precisa vencer o corticoide
// que o paciente está tomando.
//
// ⚠️ `insulina` FICOU DE FORA, e isso foi medido, não presumido. Promovê-la
// fechava a última pergunta da bateria ("equivalência de dexametasona para
// prednisona para dimensionar a insulina") e QUEBRAVA duas de obesidade —
// "obeso em insulina: indico cirurgia bariátrica?" virava Diabetes, que é
// resposta errada para uma pergunta de indicação cirúrgica. A pergunta que
// deixei em aberto é ambígua de verdade: os dois extratos têm tabela de
// equivalência e elas DIVERGEM (1:6,25 para dimensionar insulina, 1:10 de
// potência fisiológica), então Adrenal não é resposta errada ali. Trocar um
// acerto ambíguo por dois erros claros seria mau negócio.
const CAT_ACHADO_FORTE = new Set(['glicemia', 'hiperglicemia', 'cortisol matinal']);

// ⚠️ MODALIDADE DE TREINO NÃO É DOENÇA (08/08/2026).
//
// Toda chave que aponta para o Esporte entra como ACHADO, montada do próprio
// TERMOS para não haver duas listas para esquecer de sincronizar.
//
// O arquivo já registrava a tentativa anterior de conter o vazamento — manter
// só as formas CURTAS (`resistido`, `treino`) porque as longas empatavam com
// doença. A contenção era parcial e eu medi o buraco: `exercicio resistido`
// (3018) vencia `osteoporose` (3011), e **"osteoporose grave: libero o
// exercício resistido?" ia para o Esporte** — pergunta de osso respondida com
// o artigo de DM1. `hipoglicemia induzida pelo exercicio` (3035) vencia tudo.
//
// Com a promoção CONDICIONAL (ver `areasOrdenadas`), nenhuma chave de Esporte
// precisa mais vencer por peso: pergunta só de exercício chega porque é a única
// área que casou, e a interseção com diabetes é resolvida pela regra. Peso alto
// virou só o vazamento, sem benefício.
const CAT_ESPORTE = new Set(Object.keys(TERMOS).filter((k) => TERMOS[k] === 'Endocrinologia do Esporte'));
const PESO_CAT = (k) => (CAT_ACHADO.has(k) || CAT_ESPORTE.has(k) ? 1000 : CAT_ACHADO_FORTE.has(k) ? 2500 : CAT_FARMACO.has(k) ? 2000 : 3000);

// ⚠️ O TERMO MAIS ESPECÍFICO VENCE — e não o que aparece mais vezes.
//
// Cheguei a escrever aqui a regra oposta (a área citada por MAIS termos vence,
// comprimento só desempata), achando que convergência fosse melhor sinal. O
// teste por mutação mostrou que ela era inerte — quem consertava o caso do
// craniofaringioma era o fallback lá embaixo, não o desempate — e um contra-
// exemplo mostrou que ela é pior:
//
//   "Paciente com IMC 38 pós-sleeve, investigando hiperaldosteronismo"
//     Obesidade: imc(3) + sleeve(6)     → 2 termos, curtos e INCIDENTAIS
//     Adrenal:   hiperaldosteronismo(19) → 1 termo, longo e ESPECÍFICO
//
// A pergunta é sobre hiperaldosteronismo; o IMC e o sleeve são pano de fundo.
// Contar termos premia o pano de fundo. Comprimento é um proxy grosseiro de
// ESPECIFICIDADE, e especificidade é o que separa o assunto do cenário — numa
// vinheta clínica o comorbidário sempre aparece, e quase sempre com palavras
// curtas e genéricas.
//
// Nome de ÁREA declarado ganha de qualquer termo clínico (bônus de 100): quem
// preenche `area: "Tireoide"` já disse o que quer, e uma palavra solta na
// vinheta não pode derrubar isso.
//
// Devolve a lista ordenada; `canonArea` fica com a primeira, e `deepFor` pode
// descer para a próxima QUE TENHA CONTEÚDO.
// Temas diabetológicos que NÃO são exercício. Se algum aparece na pergunta, ela
// não é interseção pura com Esporte — é uma pergunta de diabetes que por acaso
// menciona treino, e o bloco de Diabetes é a resposta certa.
const OUTRO_TEMA_DIABETES = ['cetoacidose', 'cad', 'ehh', 'hiperosmolar', 'teplizumabe',
  'autoanticorpo', 'anti-gad', 'anti-ia2', 'peptideo c', 'mody', 'retinopatia',
  'nefropatia diabetica', 'neuropatia diabetica', 'pe diabetico', 'isglt2', 'sglt2',
  'gliflozina', 'empagliflozina', 'dapagliflozina', 'canagliflozina', 'ertugliflozina',
  'metformina', 'hba1c', 'hemoglobina glicada', 'pre-diabetes', 'prediabetes',
  'disglicemia', 'tacrolimo', 'ciclosporina', 'corticoide', 'glicocorticoide',
  'prednisona', 'dexametasona'];

function areasOrdenadas(area) {
  const a = deacc(area);
  if (!a) return [];
  if (CANON[a]) return [{ area: CANON[a], peso: a.length + 4000 }];
  if (TERMOS[a]) return [{ area: TERMOS[a], peso: a.length + PESO_CAT(a) }];
  const por = {};
  const somar = (mapa, cat) => {
    for (const k of Object.keys(mapa)) {
      if (!bate(a, k)) continue;
      const dest = mapa[k];
      const p = k.length + (cat != null ? cat : PESO_CAT(k));
      if (!por[dest] || p > por[dest].peso) por[dest] = { area: dest, peso: p };
    }
  };
  // ⚠️ O bônus de área DECLARADA vale só no casamento EXATO, lá em cima. Aqui é
  // substring dentro de texto livre, e aí a palavra vale o mesmo que qualquer
  // doença — senão ela sequestra a pergunta inteira.
  //
  // Medido em 08/08/2026: `'diabetes'` em CANON pegava +4000 por aparecer no meio
  // da vinheta, e como TODA pergunta sobre exercício no DM1 contém "diabetes tipo
  // 1", a subespecialidade Endocrinologia do Esporte ficava INALCANÇÁVEL — o
  // artigo que a tira do zero nunca chegaria a quem pergunta por ele.
  //   "durante o exercicio aerobico prolongado"           → Esporte
  //   "diabetes durante o exercicio aerobico prolongado"  → Diabetes  ← o sequestro
  somar(CANON, 3000);
  somar(TERMOS, null);  // doença > fármaco > exame, comprimento desempata dentro da categoria
  const ordem = Object.values(por).sort((x, y) => y.peso - x.peso);

  // ⚠️ PROMOÇÃO CONDICIONAL DO ESPORTE — a única exceção ao peso, e ela é estreita.
  //
  // O problema, medido: 3 de 4 vinhetas realistas sobre exercício no DM1 não
  // alcançavam o artigo que é a razão de a área existir. "Maratonista com
  // diabetes tipo 1: alvo de glicose antes do treino" ia para Diabetes, porque
  // `diabetes tipo 1`(3015) vence qualquer chave de Esporte.
  //
  // Já foi tentado o caminho óbvio, e ele NÃO funciona: qualquer chave longa o
  // bastante para vencer `diabetes tipo 1` também vence `osteoporose`(3011) e
  // `prolactinoma`(3012). O esquema de pesos não consegue vencer diabetes sem
  // vencer todo mundo — por isso a exceção é de REGRA, não de peso.
  //
  // As quatro condições existem cada uma por um contraexemplo real:
  //   1. o topo é EXATAMENTE Diabetes → "maratonista com hipotireoidismo" e
  //      "atleta com TSH de 8" continuam em Tireoide por construção;
  //   2. alguma chave de Esporte casou (óbvio, mas explícito);
  //   3. só DUAS áreas casaram no total → "DM1 E osteoporose que faz musculação"
  //      não é interseção pura, é uma terceira doença nomeada;
  //   4. nenhum termo de OUTRO tema diabetológico casou → "DM1 em cetoacidose
  //      após treino intenso" fica em Diabetes, que é onde tem de ficar.
  //
  // ⚠️ `cetonemia`/`cetonuria` ficaram DE FORA do veto de propósito: o valor de
  // cetona é variável de decisão DESTE artigo (é o eixo das linhas de
  // hiperglicemia das tabelas), e vetá-lo derrubaria a vinheta do treino
  // resistido com sensor em 235 e cetonemia 0,8.
  //
  // Reavaliar quando a área tiver um SEGUNDO artigo: hoje ela responde a uma
  // pergunta só, e a regra 1 é o que impede que ela responda às dos outros.
  // ⚠️ CRIAR `Hipoglicemia` QUASE MATOU ESTA REGRA (19/08/2026), e o teste pegou.
  //
  // "hipoglicemia no exercicio aerobico prolongado no DM1" casava três áreas
  // (Hipoglicemia, Diabetes, Esporte) em vez de duas, e o topo passou a ser
  // Hipoglicemia — as duas condições da regra falharam de uma vez e a pergunta
  // perdeu o consenso de exercício no DM1, que é o assunto EXATO dela.
  //
  // A condição "só DUAS áreas" existe para não sequestrar quando uma TERCEIRA
  // DOENÇA é nomeada ("DM1 e osteoporose que faz musculação"). Hipoglicemia não
  // é uma terceira doença: é o mesmo aglomerado do diabetes, partido por teto de
  // área. Por isso a regra passa a olhar o CONJUNTO — se tudo que casou está
  // dentro de {Diabetes, Hipoglicemia, Esporte} e Esporte casou, é interseção
  // pura e o Esporte sobe. O veto por OUTRO_TEMA_DIABETES continua igual.
  const CLUSTER_DIABETES = ['Diabetes', 'Hipoglicemia', 'Endocrinologia do Esporte'];
  if (ordem.length >= 2 && ordem.every((r) => CLUSTER_DIABETES.indexOf(r.area) >= 0)
      && ordem[0].area !== 'Endocrinologia do Esporte') {
    const esporte = ordem.find((r) => r.area === 'Endocrinologia do Esporte');
    if (esporte && !OUTRO_TEMA_DIABETES.some((k) => bate(a, k))) {
      return [esporte].concat(ordem.filter((r) => r.area !== 'Endocrinologia do Esporte'));
    }
  }
  return ordem;
}

// A área pode chegar como "Diabetes", "Diabetes — pé diabético", o texto de
// grounding ("Tireoide nódulo") ou a PERGUNTA CRUA do chat.
function canonArea(area) {
  const r = areasOrdenadas(area);
  return r.length ? r[0].area : '';
}

// ── CONTEÚDO ────────────────────────────────────────────────────────────────
// O conteúdo vive em lib/clinical-deep-data.js, GERADO a partir dos extratos
// verificados. Cada área é um array de blocos; um bloco = um artigo primário
// lido, com { tema, fonte, texto }. Nada é escrito ali sem citação literal
// conferida contra o PDF (scripts/verifica-extracao.js).
const DEEP = require('./clinical-deep-data');

// Palavras que não distinguem nada dentro de uma subespecialidade.
const VAZIAS = new Set(['para', 'como', 'quando', 'sobre', 'entre', 'pelo', 'pela', 'dos', 'das', 'com', 'sem',
  'diagnostico', 'tratamento', 'manejo', 'clinica', 'clinico', 'doenca', 'sindrome', 'paciente', 'terapia',
  'endocrinologia', 'geral', 'avaliacao', 'conduta', 'caso', 'casos', 'questao', 'prova',
  // ⚠️ PALAVRA DE PERGUNTA VALIA 3 PONTOS (08/08/2026). Medido em "dumping
  // tardio dois anos após bypass: como investigo?": o bloco cujo tema é
  // literalmente "Síndrome de dumping" (129 chars, 78 ocorrências da palavra)
  // PERDIA para dois blocos que pontuavam em `apos`, `anos` e `dois` — porque
  // essas palavras caem dentro de temas longos e lá valem +3 cada. O artigo
  // inteiro de dumping não era entregue à pergunta que diz "dumping".
  // Nenhuma delas distingue um bloco de outro; são cola de frase.
  // ⚠️ `indico`, `indicar`, `investigo` e `uso` FORAM TIRADOS desta lista depois
  // de entrarem nela: a bateria reprovou na hora. O tema do bloco de cirurgia é
  // escrito como pergunta — "indico cirurgia bariátrica? qual cirurgia
  // escolher" — e ali `indico` DISCRIMINA. Cola de frase é o que nunca
  // distingue um bloco de outro; verbo de conduta, às vezes, é o assunto.
  'apos', 'antes', 'depois', 'anos', 'ano', 'dois', 'duas', 'mais', 'menos',
  'qual', 'quais', 'pode', 'posso', 'deve', 'devo', 'fazer', 'faco', 'tenho',
  'ainda']);

// ⚠️ SELEÇÃO POR TEMA — a razão de existir desta função.
// A extração do acervo é EXAUSTIVA de propósito: 10 artigos já renderam 1.325
// fatos, e os 245 da fila devem passar de 6 MB. Um único artigo de
// craniofaringioma tem 249 fatos. Mandar a área inteira em toda geração não cabe
// (Osteometabolismo sozinho passaria 7x do teto) e nem faria sentido: questão de
// cetoacidose não precisa da tabela de doses da hipofosfatasia.
//
// Então: ARQUIVO completo, ENTREGA selecionada. Os blocos são ordenados por
// quantas palavras do tema pedido eles contêm; empate desfeito pela ordem de
// autoridade que o montador já gravou (diretriz > revisão > estudo; mais novo
// antes). Bloco sem relação com o tema entra por último, se sobrar espaço.
function deepFor(area, limite, tema) {
  // ⚠️ Desce para a próxima área classificada QUE TENHA BLOCO. Cinco das treze
  // subespecialidades ainda não têm nenhum artigo extraído (Lípides, Pediátrica,
  // Masculina, Esporte, Transgeneridade), e parar na primeira colocada quando ela
  // está vazia entrega silêncio — mesmo havendo, logo abaixo, a área que responde
  // a pergunta. Não é preferir conteúdo a correção: a área vazia não tem o que
  // dizer, então a segunda colocada é a melhor resposta que existe hoje.
  const canon = (areasOrdenadas(area).find((r) => DEEP[r.area] && DEEP[r.area].length) || {}).area || '';
  if (!canon || !DEEP[canon] || !DEEP[canon].length) return '';
  const teto = Math.max(2000, Math.min(limite || TETO_PROFUNDO, TETO_MAXIMO));

  // Termos do tema, tirando o próprio nome da área (que não discrimina nada).
  //
  // ⚠️ AQUI MORAVA UMA CEGUEIRA, e ela apagava justamente a palavra mais
  // discriminante da pergunta (08/08/2026, auditoria do pré-diabetes).
  //
  // Era `deacc(tema).replace(deacc(canon), ' ')` — `String.replace` com padrão
  // de texto, que casa SUBSTRING e troca só a PRIMEIRA ocorrência. Em Diabetes:
  //
  //   "pre-diabetes pode reverter sozinho?" → "pre-  pode reverter sozinho?"
  //
  // e o que sobrava, `pre`, morria no filtro de 4 caracteres. Resultado: a
  // escolha do bloco pontuava por "reverter" e "sozinho", e a palavra
  // `pre-diabetes` — a única que distingue este artigo dos outros seis blocos da
  // área — valia ZERO. Três vinhetas realistas de pré-diabetes não recebiam o
  // bloco (a área estava certa; o bloco, não).
  //
  // Conserto: tokenizar PRESERVANDO o hífen e derrubar o nome da área só quando
  // ele é um token inteiro. `pre-diabetes` sobrevive como termo próprio, e o
  // `diabetes` de dentro dele cai por ser igual ao nome da área — mesmo efeito
  // pretendido, sem mutilar a palavra composta.
  //
  // ⚠️ Cada composto também entra PARTIDO. Sem isso a correção seria uma troca,
  // não um ganho: antes `basal-bolus` virava os termos `basal` e `bolus`, e um
  // bloco que escreve "basal e bolus" deixaria de casar. Emitindo o composto e
  // as partes, tudo o que casava antes continua casando.
  const nomeArea = deacc(canon);
  const cru = deacc(tema || area).replace(/[^a-z0-9-]+/g, ' ').split(/\s+/)
    .map((w) => w.replace(/^-+|-+$/g, '')).filter(Boolean);
  const vistos = new Set();
  for (const w of cru) {
    vistos.add(w);
    if (w.indexOf('-') >= 0) for (const p of w.split('-')) if (p) vistos.add(p);
  }
  // ⚠️ A SIGLA CLÍNICA NUNCA PONTUAVA (08/08/2026). O filtro de 4 caracteres é
  // para tirar ruído ("com", "de", "em"), mas ele derrubava junto **as siglas
  // que decidem a pergunta**: `EHH`, `CAD`, `SOP`, `PTH`, `GH`, `T4`.
  //
  // Medido: "EHH em idoso com glicemia 900" pontuava só em `idoso` e `glicemia`.
  // QUATRO blocos empatavam em 4 pontos e o desempate era a ordem de autoridade
  // — o bloco certo vinha em primeiro **por acaso**, e parou de vir assim que
  // outro bloco entrou na frente dele na ordem. O teste de caminho pegou isso.
  //
  // Conserto: um token curto passa quando é TERMO CLÍNICO CONHECIDO (está em
  // TERMOS ou em CANON). Palavra que o mapa reconhece nunca é ruído, tenha o
  // tamanho que tiver — e ruído genérico de 3 letras continua fora, porque não
  // está no mapa.
  const conhecido = (w) => Object.prototype.hasOwnProperty.call(TERMOS, w)
    || Object.prototype.hasOwnProperty.call(CANON, w);

  // ⚠️ "SEM SINTOMA" PONTUAVA O BLOCO SINTOMÁTICO — e essa é a direção do
  // acidente que já aconteceu nesta área (09/08/2026, teste de caminho).
  //
  // O roteador de ÁREA já sabia negar: `bate()` roda `NEGADO_ANTES` e ignora a
  // ocorrência precedida de "sem"/"não"/"exceto". A pontuação de BLOCO não
  // sabia. Resultado medido: *"sódio 120 sem sintomas, velocidade de correção"*
  // recebia em primeiro o bloco da hiponatremia AGUDA SINTOMÁTICA — bolus de
  // salina hipertônica — para um paciente que a pergunta declara assintomático.
  // É o inverso exato do acidente já documentado (o doente convulsionando que
  // recebia o bloco crônico da "correção lenta"): mesma área, mesmo par de
  // blocos, mesma consequência trocada de lado.
  //
  // O termo cai quando TODAS as ocorrências dele na pergunta estão negadas —
  // mesma regra do `bate()`, que devolve verdadeiro se ALGUMA escapa. Assim
  // "sem sintomas, mas com sintoma neurológico" continua pontuando.
  const perg = deacc(tema || area);
  const negado = (w) => {
    const re = new RegExp('(^|[^a-z0-9])' + w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(s|es|as|os)?([^a-z0-9]|$)', 'g');
    let m, achou = false;
    while ((m = re.exec(perg)) !== null) {
      const ini = m.index + (m[1] ? m[1].length : 0);
      achou = true;
      if (!NEGADO_ANTES.test(perg.slice(Math.max(0, ini - 40), ini))) return false;
      if (re.lastIndex <= m.index) re.lastIndex = m.index + 1;
    }
    return achou; // só nega o que de fato apareceu negado; token derivado (parte de composto) passa
  };

  const termos = [...vistos].filter((w) => (w.length >= 4 || conhecido(w)) && !VAZIAS.has(w)
    && w !== nomeArea && !negado(w));

  // Fronteira de palavra para token curto, com cache — a pontuação roda por bloco
  // e por termo, e recompilar regex ali dentro custa.
  const _bordas = new Map();
  const bordas = (w) => {
    let re = _bordas.get(w);
    // ⚠️ O escape estava CORROMPIDO desde que nasceu (3b88e03): a string de
    // substituição era uma linha de código colada por engano no lugar de `$&`.
    // Não explodiu até hoje porque o tokenizador já derruba tudo que não seja
    // `[a-z0-9-]` — a classe de metacaracteres nunca casava, então o `replace`
    // era no-op. Continua sendo no-op com o escape certo; a diferença é que
    // agora ele SEGURA se o tokenizador afrouxar, em vez de montar uma regex
    // com um pedaço de fonte dentro.
    if (!re) { re = new RegExp("(^|[^a-z0-9])" + w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "(s|es)?([^a-z0-9]|$)"); _bordas.set(w, re); }
    return re;
  };

  const pontuados = DEEP[canon].map((b, i) => {
    const hay = deacc(b.tema + ' ' + b.texto);
    let pts = 0;
    for (const t of termos) {
      // radical curto tolera plural e flexão ("nodulo"/"nodulos", "adrenal"/"adrenais")
      const raiz = t.length > 6 ? t.slice(0, t.length - 2) : t;
      // ⚠️ SIGLA PRECISA DE FRONTEIRA DE PALAVRA, e isto foi aprendido quebrando.
      // Ao deixar `CAD` e `EHH` pontuarem, o casamento por SUBSTRING passou a
      // achar `cad` dentro de "cadeia", "década" e "aplicador" — e "paciente com
      // CAD e pH 7,1" devolveu o bloco de DM1 em primeiro. Token de 3 letras num
      // texto de 40 mil casa em quase tudo. Com fronteira, `cad` só casa `cad`.
      // Termo longo continua por substring, que é o que permite a flexão acima.
      const achou = raiz.length <= 4 ? bordas(raiz).test(hay) : hay.indexOf(raiz) >= 0;
      if (!achou) continue;
      const noTema = b.tema
        ? (raiz.length <= 4 ? bordas(raiz).test(deacc(b.tema)) : deacc(b.tema).indexOf(raiz) >= 0)
        : false;
      pts += noTema ? 3 : 1;
    }
    return { b, pts, i };
  });
  // relevância primeiro; empate mantém a ordem de autoridade do montador
  //
  // ⚠️ TENTEI DESEMPATAR POR TEMA MAIS CURTO EM 08/08/2026 E DESISTI DEPOIS DE
  // MEDIR. A motivação era boa: os temas dos blocos de Obesidade vão de 129 a
  // 2.466 caracteres, o tema longo é uma LISTA de 60 assuntos, e cada palavra
  // dessa lista vale +3 igual à palavra do tema que descreve UM assunto.
  //
  // Mas a varredura diferencial em 25 perguntas realistas mostrou 4 mudanças e
  // **DUAS ERAM PIORES**, o que faz disso cara-ou-coroa, não conserto:
  //   · "náusea com semaglutida" perdia o artigo que É sobre eventos adversos
  //     gastrintestinais dos AR GLP-1 (tema longo) para o de farmacoterapia;
  //   · "hiponatremia de 118" trocava o ALGORITMO diagnóstico pelo bloco do
  //     IDOSO — estreitando a população num caso em que a idade não foi dita,
  //     que é exatamente o dano que a auditoria da tabela pediátrica achou.
  //
  // O que consertou o caso que motivou tudo (o artigo de dumping não chegava à
  // pergunta que diz "dumping") foi a outra metade, medida e mantida: tirar as
  // palavras de pergunta de `VAZIAS`. Ficou o que mede; saiu o que empata.
  // ⚠️ BLOCO "INDUZIDO POR X" VENCENDO A PERGUNTA QUE NÃO CITA X (09/08/2026).
  //
  // Medido: *"fratura de quadril após queda da própria altura"* — paciente sem
  // corticoide nenhum — recebia em primeiro o bloco do **GIOP**. Os dois
  // empatavam em **18 pontos**, com exatamente os mesmos seis termos no tema
  // (`fratura`, `quadril`, `após`, `queda`, `própria`, `altura`), e o desempate
  // era a ordem do array. O empate é LEGÍTIMO — a diretriz do ACR discute mesmo
  // fratura por fragilidade e quadril; o tema não está inflado.
  //
  // O conserto é de DESEMPATE, não de peso, e a estreiteza é o ponto: mexer na
  // pontuação reordenaria blocos de notas diferentes, que é como se entrega
  // conteúdo da área certa e do assunto errado. Aqui, com pontos iguais, o bloco
  // que exige uma condição que a pergunta não menciona vai para trás. Nada mais.
  //
  // Só vale para condição do mapa abaixo. `induzida por MEDICAMENTO` (fármaco e
  // tireoide) ficou de fora de propósito: "medicamento" não tem sinônimo
  // fechado, e exigir a palavra derrubaria a pergunta que nomeia o fármaco —
  // que é justamente quem deve chegar lá.
  const exigidaAusente = (b) => {
    const t = deacc(b.tema);
    for (const cond of Object.keys(CONDICAO_EXIGIDA)) {
      if (t.indexOf('induzid') < 0 || t.indexOf(cond) < 0) continue;
      if (!CONDICAO_EXIGIDA[cond].some((s) => bate(perg, s))) return 1;
    }
    return 0;
  };
  for (const p of pontuados) p.semCond = exigidaAusente(p.b);
  pontuados.sort((x, y) => (y.pts - x.pts) || (x.semCond - y.semCond) || (x.i - y.i));

  const cabecalho =
    `\n\nAPROFUNDAMENTO — ${canon.toUpperCase()} (extraído dos artigos primários do acervo, ` +
    `com os dados conferidos no texto original; prefira-os a lembranças gerais):\n`;
  // Corta um bloco no limite de frase, declarando o corte.
  const cortar = (b, espaco) => {
    const cabeca = `• ${b.tema} — ${b.fonte}: `;
    const cabe = espaco - cabeca.length - 60;
    if (cabe < 400) return '';
    let t = b.texto.slice(0, cabe);
    const c = Math.max(t.lastIndexOf('. '), t.lastIndexOf('; '));
    if (c > cabe * 0.5) t = t.slice(0, c + 1);
    return cabeca + t + ' […cortado por limite de tamanho]';
  };

  let out = cabecalho;
  let usados = 0;
  // ⚠️ O bloco MAIS RELEVANTE tem prioridade absoluta, mesmo que não caiba inteiro.
  // Sem isto acontecia o pior caso silencioso: pedindo "diabetes pós-transplante",
  // o bloco do tema (grande) era PULADO por não caber e entrava o de MODY (pequeno)
  // no lugar — a IA recebia conteúdo da área certa e do assunto errado, sem
  // qualquer sinal de que o tema pedido tinha ficado de fora.
  const inicio = pontuados[0];
  if (inicio && inicio.pts > 0) {
    const linha = `• ${inicio.b.tema} — ${inicio.b.fonte}: ${inicio.b.texto}`;
    if (out.length + linha.length + 1 <= teto) { out += linha + '\n'; usados++; }
    else {
      const parcial = cortar(inicio.b, teto - out.length);
      if (parcial) { out += parcial + '\n'; usados++; }
    }
    pontuados.shift();
  }
  for (const p of pontuados) {
    const linha = `• ${p.b.tema} — ${p.b.fonte}: ${p.b.texto}`;
    if (out.length + linha.length + 1 > teto) continue; // tenta o próximo, menor
    out += linha + '\n';
    usados++;
  }
  // ⚠️ Nenhum bloco INTEIRO coube. Um artigo bem extraído passa de 40 mil
  // caracteres, então isto acontece de verdade sempre que o teto é apertado — e
  // devolver vazio seria o pior resultado: a IA perderia o tema mais relevante
  // justamente quando ele foi pedido. Entrega o mais relevante CORTADO, num
  // limite de frase, e diz que foi cortado.
  if (!usados && pontuados.length) {
    const b = pontuados[0].b;
    const cabeca = `• ${b.tema} — ${b.fonte}: `;
    const espaco = teto - out.length - cabeca.length - 60;
    if (espaco > 400) {
      let t = b.texto.slice(0, espaco);
      const corte = Math.max(t.lastIndexOf('. '), t.lastIndexOf('; '));
      if (corte > espaco * 0.5) t = t.slice(0, corte + 1);
      out += cabeca + t + ' […cortado por limite de tamanho]\n';
      usados = 1;
    }
  }
  return usados ? out : '';
}

// Quantos blocos existem por área (usado pelo teste e pelo relatório de cobertura).
function coberturaDeep() {
  const o = {};
  for (const k of Object.keys(DEEP)) o[k] = DEEP[k].length;
  return o;
}

module.exports = { deepFor, canonArea, coberturaDeep, DEEP, TETO_PROFUNDO, TETO_MAXIMO, TETO_COM_ANEXO };
