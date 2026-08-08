// Endodirect — BASE CLÍNICA PROFUNDA, por subespecialidade.
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
  'hiperparatireoidismo': 'Osteometabolismo', 'hipoparatireoidismo': 'Osteometabolismo',
  'paratormonio': 'Osteometabolismo', 'raquitismo': 'Osteometabolismo',
  'paget': 'Osteometabolismo', 'fratura por fragilidade': 'Osteometabolismo',
  // Neuroendocrinologia
  'prolactinoma': 'Neuroendocrinologia', 'hiperprolactinemia': 'Neuroendocrinologia',
  'macroprolactina': 'Neuroendocrinologia', 'cabergolina': 'Neuroendocrinologia',
  'acromegalia': 'Neuroendocrinologia', 'craniofaringioma': 'Neuroendocrinologia',
  'hipofise': 'Neuroendocrinologia', 'hipofisario': 'Neuroendocrinologia',
  'hipofisite': 'Neuroendocrinologia', 'apoplexia hipofisaria': 'Neuroendocrinologia',
  'hipopituitarismo': 'Neuroendocrinologia',
  // Adrenal
  'insuficiencia adrenal': 'Adrenal', 'addison': 'Adrenal', 'cushing': 'Adrenal',
  'feocromocitoma': 'Adrenal', 'hiperaldosteronismo': 'Adrenal',
  'incidentaloma adrenal': 'Adrenal', 'cortisol': 'Adrenal',
  'cosintropina': 'Adrenal', 'hidrocortisona': 'Adrenal', 'glicocorticoide': 'Adrenal',
  // Tireoide
  'hipotireoidismo': 'Tireoide', 'hipertireoidismo': 'Tireoide', 'tireotoxicose': 'Tireoide',
  'graves': 'Tireoide', 'hashimoto': 'Tireoide', 'tireoidite': 'Tireoide',
  'levotiroxina': 'Tireoide', 'metimazol': 'Tireoide', 'propiltiouracil': 'Tireoide',
  'radioiodo': 'Tireoide', 'eutireoidiano doente': 'Tireoide',
  'tempestade tireoidiana': 'Tireoide', 'tempestade tireotoxica': 'Tireoide',
  'crise tireotoxica': 'Tireoide', 'tireoidectomia': 'Tireoide',
  'bocio': 'Tireoide', 'nodulo tireoidiano': 'Tireoide',
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
  'anion gap': 'Diabetes', 'cetogenica': 'Diabetes',
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
  'semaglutida': 'Obesidade', 'tirzepatida': 'Obesidade', 'liraglutida': 'Obesidade',
  'cirurgia bariatrica': 'Obesidade', 'bariatrica': 'Obesidade',
  'dumping': 'Obesidade', 'gastrectomia': 'Obesidade',
  'hipercolesterolemia': 'Lípides', 'estatina': 'Lípides', 'ezetimiba': 'Lípides',
  'hipertrigliceridemia': 'Lípides', 'lipoproteina': 'Lípides', 'ldl': 'Lípides',
  // Feminina / Masculina / Pediátrica
  'ovarios policisticos': 'Endocrinologia Feminina', 'hirsutismo': 'Endocrinologia Feminina',
  'sop': 'Endocrinologia Feminina', 'hiperandrogenismo': 'Endocrinologia Feminina',
  'anticoncepcional': 'Endocrinologia Feminina', 'contraceptivo oral': 'Endocrinologia Feminina',
  'espironolactona': 'Endocrinologia Feminina', 'acetato de ciproterona': 'Endocrinologia Feminina',
  'hiperplasia adrenal congenita': 'Endocrinologia Feminina', '17-hidroxiprogesterona': 'Endocrinologia Feminina',
  'amenorreia': 'Endocrinologia Feminina', 'amenorreica': 'Endocrinologia Feminina', 'menopausa': 'Endocrinologia Feminina',
  'hipogonadismo': 'Endocrinologia Masculina', 'testosterona': 'Endocrinologia Masculina',
  'ginecomastia': 'Endocrinologia Masculina',
  'puberdade precoce': 'Endocrinologia Pediátrica', 'baixa estatura': 'Endocrinologia Pediátrica',
  // Endocrinopatias (miscelânea do acervo)
  'hiponatremia': 'Endocrinopatias', 'hipernatremia': 'Endocrinopatias',
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
const CAT_ACHADO = new Set(['sodio', 'natremia', 'osmolalidade', 'prolactina', 'cortisol',
  'fosfatase alcalina', 'fosfatase alcalina baixa', 't-score', 'dxa', 'densitometria', 'densidade mineral ossea',
  'tsh', 't4 livre', 'trab', 'hemoglobina glicada', 'hba1c', 'glicemia de jejum',
  'imc', 'testosterona', 'testosterona total', 'espermograma', 'copeptina', 'paratormonio', 'ldl',
  'lipoproteina', 'campo visual', 'knosp', 'burch-wartofsky', 'ferriman', 'selar', 'suprasselar', 'quiasma',
  'macroprolactina', '17-hidroxiprogesterona', 'autoanticorpo', 'anti-gad', 'anti-ia2', 'peptideo c', 'hiperpigmentacao', 'avidez por sal',
  'escurecimento da pele', 'escurecimento das dobras',
  'etilismo', 'etilista', 'alcoolismo', 'hiperosmolar',
  'lua de mel', 'remissao parcial']);
const CAT_FARMACO = new Set(['bisfosfonato', 'alendronato', 'zoledronato', 'risedronato', 'denosumabe',
  'romosozumabe', 'teriparatida', 'abaloparatida', 'asfotase', 'cabergolina', 'hidrocortisona', 'prednisona',
  'dexametasona', 'metirapona', 'cosintropina', 'glicocorticoide', 'levotiroxina', 'metimazol', 'tiroxina',
  'propiltiouracil', 'radioiodo', 'tireoidectomia', 'insulina', 'metformina', 'tacrolimo', 'ciclosporina',
  'semaglutida', 'tirzepatida', 'liraglutida', 'cirurgia bariatrica', 'bariatrica', 'gastrectomia',
  'empagliflozina', 'dapagliflozina', 'canagliflozina', 'ertugliflozina', 'gliflozina',
  'isglt2', 'sglt2', 'inibidor de sglt2',
  'dasiglucagon', 'pramlintida', 'golimumabe', 'glucagon nasal',
  'alca fechada', 'pancreas artificial', 'pancreas bionico', 'bomba de insulina',
  'bypass gastrico', 'gastroplastia', 'sleeve', 'estatina', 'ezetimiba', 'tolvaptan', 'desmopressina',
  'salina hipertonica', 'letrozol', 'espironolactona', 'anticoncepcional', 'contraceptivo oral',
  'fludrocortisona', 'corticoide', 'corticosteroide', 'corticoterapia', 'opioide', 'opiaceo']);
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
  if (ordem.length === 2 && ordem[0].area === 'Diabetes') {
    const esporte = ordem.find((r) => r.area === 'Endocrinologia do Esporte');
    if (esporte && !OUTRO_TEMA_DIABETES.some((k) => bate(a, k))) {
      return [esporte, ordem.find((r) => r.area === 'Diabetes')];
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
  'endocrinologia', 'geral', 'avaliacao', 'conduta', 'caso', 'casos', 'questao', 'prova']);

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
  const teto = Math.max(2000, Math.min(limite || 120000, 400000));

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
  const termos = [...vistos].filter((w) => w.length >= 4 && !VAZIAS.has(w) && w !== nomeArea);

  const pontuados = DEEP[canon].map((b, i) => {
    const hay = deacc(b.tema + ' ' + b.texto);
    let pts = 0;
    for (const t of termos) {
      // radical curto tolera plural e flexão ("nodulo"/"nodulos", "adrenal"/"adrenais")
      const raiz = t.length > 6 ? t.slice(0, t.length - 2) : t;
      if (hay.indexOf(raiz) >= 0) pts += (b.tema && deacc(b.tema).indexOf(raiz) >= 0) ? 3 : 1;
    }
    return { b, pts, i };
  });
  // relevância primeiro; empate mantém a ordem de autoridade do montador
  pontuados.sort((x, y) => (y.pts - x.pts) || (x.i - y.i));

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

module.exports = { deepFor, canonArea, coberturaDeep, DEEP };
