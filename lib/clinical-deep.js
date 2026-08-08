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
  'amenorreia': 'Endocrinologia Feminina', 'menopausa': 'Endocrinologia Feminina',
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
  'suprasselar': 'Neuroendocrinologia', 'quiasma': 'Neuroendocrinologia',
  'campo visual': 'Neuroendocrinologia', 'knosp': 'Neuroendocrinologia',
  'fosfatase alcalina baixa': 'Osteometabolismo', 'densidade mineral ossea': 'Osteometabolismo',
  't-score': 'Osteometabolismo', 'dxa': 'Osteometabolismo', 'fratura de fragilidade': 'Osteometabolismo',
  'fratura vertebral': 'Osteometabolismo', 'esfoliacao': 'Osteometabolismo',
  'dentes deciduos': 'Osteometabolismo', 'metatarso': 'Osteometabolismo',
  'perda precoce de dentes': 'Osteometabolismo',
  'cortisol matinal': 'Adrenal', 'cosintropina': 'Adrenal', 'prednisona': 'Adrenal',
  'dexametasona': 'Adrenal', 'metirapona': 'Adrenal',

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
  // 2020, exercício no DM1 com CGM/isCGM, 116 fatos). Antes dele o único texto
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
  'exercicio': 'Endocrinologia do Esporte',
  'exercicio fisico': 'Endocrinologia do Esporte',
  'atividade fisica': 'Endocrinologia do Esporte',
  'exercicio aerobico': 'Endocrinologia do Esporte',
  'exercicio anaerobico': 'Endocrinologia do Esporte',
  'exercicio resistido': 'Endocrinologia do Esporte',
  'exercicio intervalado': 'Endocrinologia do Esporte',
  'treino resistido': 'Endocrinologia do Esporte',
  'treino intervalado': 'Endocrinologia do Esporte',
  'treinamento resistido': 'Endocrinologia do Esporte',
  'treinamento intervalado': 'Endocrinologia do Esporte',
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
  'atleta': 'Endocrinologia do Esporte', 'esporte': 'Endocrinologia do Esporte',
  'esportista': 'Endocrinologia do Esporte', 'endurance': 'Endocrinologia do Esporte',
  'maratona': 'Endocrinologia do Esporte', 'meia-maratona': 'Endocrinologia do Esporte',
  'corrida': 'Endocrinologia do Esporte', 'corredor': 'Endocrinologia do Esporte',
  'ciclismo': 'Endocrinologia do Esporte', 'natacao': 'Endocrinologia do Esporte',
  'musculacao': 'Endocrinologia do Esporte', 'futebol': 'Endocrinologia do Esporte',
  'triatlo': 'Endocrinologia do Esporte'
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
function bate(hay, chave) {
  let re = RE_CACHE.get(chave);
  if (!re) {
    re = new RegExp('(^|[^a-z0-9])' + chave.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(s|es|as|os)?([^a-z0-9]|$)');
    RE_CACHE.set(chave, re);
  }
  return re.test(hay);
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
const CAT_ACHADO = new Set(['sodio', 'natremia', 'osmolalidade', 'prolactina', 'cortisol', 'cortisol matinal',
  'fosfatase alcalina', 'fosfatase alcalina baixa', 't-score', 'dxa', 'densitometria', 'densidade mineral ossea',
  'tsh', 't4 livre', 'trab', 'hemoglobina glicada', 'hba1c', 'glicemia', 'glicemia de jejum', 'hiperglicemia',
  'imc', 'testosterona', 'testosterona total', 'espermograma', 'copeptina', 'paratormonio', 'ldl',
  'lipoproteina', 'campo visual', 'knosp', 'burch-wartofsky', 'ferriman', 'selar', 'suprasselar', 'quiasma',
  'macroprolactina', '17-hidroxiprogesterona', 'hiperpigmentacao', 'avidez por sal',
  'escurecimento da pele', 'escurecimento das dobras']);
const CAT_FARMACO = new Set(['bisfosfonato', 'alendronato', 'zoledronato', 'risedronato', 'denosumabe',
  'romosozumabe', 'teriparatida', 'abaloparatida', 'asfotase', 'cabergolina', 'hidrocortisona', 'prednisona',
  'dexametasona', 'metirapona', 'cosintropina', 'glicocorticoide', 'levotiroxina', 'metimazol', 'tiroxina',
  'propiltiouracil', 'radioiodo', 'tireoidectomia', 'insulina', 'metformina', 'tacrolimo', 'ciclosporina',
  'semaglutida', 'tirzepatida', 'liraglutida', 'cirurgia bariatrica', 'bariatrica', 'gastrectomia',
  'bypass gastrico', 'gastroplastia', 'sleeve', 'estatina', 'ezetimiba', 'tolvaptan', 'desmopressina',
  'salina hipertonica', 'letrozol', 'espironolactona', 'anticoncepcional', 'contraceptivo oral',
  'fludrocortisona', 'corticoide', 'corticosteroide', 'corticoterapia', 'opioide', 'opiaceo']);
const PESO_CAT = (k) => (CAT_ACHADO.has(k) ? 1000 : CAT_FARMACO.has(k) ? 2000 : 3000);

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
  somar(CANON, 4000);   // área declarada ganha de tudo
  somar(TERMOS, null);  // doença > fármaco > exame, comprimento desempata dentro da categoria
  return Object.values(por).sort((x, y) => y.peso - x.peso);
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
  const alvo = deacc(tema || area).replace(deacc(canon), ' ');
  const termos = alvo.replace(/[^a-z0-9 ]+/g, ' ').split(/\s+/)
    .filter((w) => w.length >= 4 && !VAZIAS.has(w));

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
