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
