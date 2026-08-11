// Regressão: o gerador de questões não pode devolver a MESMA questão de novo.
//
// ⚠️ O professor (11/08): "as questões estão saindo praticamente iguais dentro do
// mesmo tema" — três de Endocrinologia Feminina com a mesma vinheta de insuficiência
// ovariana prematura (34 anos, FSH 58→62, estradiol 12, cariótipo 46,XX), mudando só
// a redação e a letra do gabarito. Duas causas:
//   1. cada questão do lote era gerada ISOLADA, sem saber das outras nem do que já
//      estava na fila/pendências — e o modelo converge para o caso mais canônico;
//   2. todas perguntavam "qual a melhor conduta?": mesmo tema + mesmo eixo = mesma
//      questão, por mais que o texto mude.
//
// O limiar de 0,32 foi CALIBRADO NA BASE REAL, não escolhido no olho: a duplicata
// verdadeira (duas de menopausa aos 52 anos) deu 0,400; o par legítimo mais parecido
// (hirsutismo × SOP) deu 0,238; duas de DM2 aos 58 anos clinicamente distintas
// (nefropatia × cetoacidose euglicêmica) deram 0,164.
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const falhas = [];
function ok(cond, msg) { if (!cond) falhas.push(msg); }

function trecho(marca, fim) {
  const i = html.indexOf(marca);
  if (i < 0) throw new Error('não achei ' + marca);
  const j = html.indexOf(fim, i);
  return html.slice(i, j < 0 ? html.length : j);
}
function corpo(nome) {
  const i = html.indexOf('function ' + nome + '(');
  if (i < 0) throw new Error('função ' + nome + ' não encontrada');
  let d = 0;
  for (let j = html.indexOf('{', i); j < html.length; j++) {
    if (html[j] === '{') d++;
    else if (html[j] === '}') { d--; if (!d) return html.slice(i, j + 1); }
  }
  throw new Error('não fechou ' + nome);
}

const sb = {};
vm.createContext(sb);
vm.runInContext([
  trecho('var IG_STOP=', '\nfunction igTokensStem'),
  corpo('igTokensStem'),
  trecho('var IG_SIM_LIMITE=', '\nfunction igJaccard'),
  corpo('igJaccard'),
  corpo('igMaisParecida'),
  corpo('igFichaEvitar'),
  corpo('igBlocoEvitar'),
  corpo('igBlocoEixo'),
].join('\n'), sb);

// ── Enunciados-caso. Reproduzem a ESTRUTURA dos reais (perfil + achados + pergunta);
//    os pares foram escolhidos para bater com a calibração medida na base.
const POI_A = 'Mulher de 34 anos com amenorreia secundária há 8 meses, fogachos e dispareunia por secura vaginal. Nega uso de anticoncepcional. Beta-hCG negativo. FSH 58 mUI/mL [VR 3,5-12,5], repetido após 5 semanas com FSH 62 mUI/mL, estradiol 12 pg/mL [VR 30-120], prolactina 14 ng/mL, TSH 2,1 mUI/mL. Cariótipo 46,XX. Qual a conduta mais adequada?';
const POI_B = 'Mulher de 34 anos com amenorreia secundária há 8 meses, fogachos e dispareunia. Nega gestação (beta-hCG negativo). FSH 58 mUI/mL [VR 3,5-12,5], repetido em 5 semanas com FSH 62 mUI/mL, estradiol 12 pg/mL [VR 30-120]. TSH 2,1 mUI/L, prolactina 14 ng/mL. Cariótipo 46,XX; pré-mutação do FMR1 negativa. Qual a melhor conduta?';
const MENO_A = 'Mulher de 52 anos procura atendimento por fogachos moderados a graves diários que comprometem o sono há 8 meses, além de secura vaginal. Última menstruação há 14 meses. Antecedente de trombose venosa profunda espontânea aos 45 anos. Qual a conduta mais adequada?';
const MENO_B = 'Mulher de 52 anos, última menstruação há 14 meses, procura atendimento por fogachos moderados a graves que comprometem o sono e o trabalho. Nega tromboembolismo prévio. Não fez histerectomia. Mamografia BI-RADS 1. Qual a conduta mais adequada?';
const DM_A = 'Homem de 58 anos com DM2 há 12 anos, em uso de metformina 2 g/dia e glargina 30 U/dia. HbA1c 7,8%, creatinina 1,6 mg/dL, TFGe 42 mL/min, RAC urinária 480 mg/g. Qual a melhor conduta?';
const DM_B = 'Homem de 58 anos com DM2 há 12 anos em uso de metformina e empagliflozina, internado por pneumonia. Sonolento, taquipneico, glicemia capilar 186 mg/dL. Gasometria: pH 7,21, HCO3 12 mEq/L, ânion-gap elevado. Qual o diagnóstico mais provável?';
const HIRS = 'Mulher de 26 anos com hirsutismo de início há 4 meses e amenorreia há 3 meses. Clitoromegalia, Ferriman-Gallwey 18. Testosterona total 285 ng/dL [VR 15-70], SDHEA 180 µg/dL. Qual a investigação seguinte?';

// 1) ⚠️ O CASO DO PROFESSOR: duas vinhetas de IOP quase idênticas têm de ser acusadas.
const simPOI = sb.igJaccard(POI_A, POI_B);
ok(simPOI >= sb.IG_SIM_LIMITE,
   'REGRESSÃO: as duas questões de insuficiência ovariana quase iguais TÊM de ser acusadas (deu ' + simPOI.toFixed(3) + ', limite ' + sb.IG_SIM_LIMITE + ')');

// 2) A duplicata que já estava salva na base (menopausa aos 52 anos): 0,400 medido.
const simMeno = sb.igJaccard(MENO_A, MENO_B);
ok(simMeno >= sb.IG_SIM_LIMITE,
   'as duas de menopausa aos 52 anos são a mesma questão e têm de ser acusadas (deu ' + simMeno.toFixed(3) + ')');

// 3) ⚠️ FALSO POSITIVO É PIOR QUE PASSAR BATIDO: duas questões clinicamente
//    DIFERENTES que compartilham o perfil do paciente NÃO podem ser recusadas.
const simDM = sb.igJaccard(DM_A, DM_B);
ok(simDM < sb.IG_SIM_LIMITE,
   'duas de DM2 aos 58 anos clinicamente distintas (nefropatia × cetoacidose) NÃO podem ser acusadas (deu ' + simDM.toFixed(3) + ')');
const simHirs = sb.igJaccard(HIRS, POI_A);
ok(simHirs < sb.IG_SIM_LIMITE,
   'hirsutismo e insuficiência ovariana são questões diferentes (deu ' + simHirs.toFixed(3) + ')');

// 4) O limiar tem de ficar no VÃO entre os dois grupos — não colado num deles.
ok(Math.min(simPOI, simMeno) > sb.IG_SIM_LIMITE + 0.02 && Math.max(simDM, simHirs) < sb.IG_SIM_LIMITE - 0.02,
   'o limiar precisa de folga dos dois lados (duplicatas ' + simPOI.toFixed(2) + '/' + simMeno.toFixed(2)
   + ' · distintas ' + simDM.toFixed(2) + '/' + simHirs.toFixed(2) + ' · limite ' + sb.IG_SIM_LIMITE + ')');

// 5) Texto igual é 1; texto vazio não quebra nem acusa.
ok(sb.igJaccard(POI_A, POI_A) === 1, 'texto idêntico tem de dar 1');
ok(sb.igJaccard('', POI_A) === 0 && sb.igJaccard(null, null) === 0, 'vazio não pode quebrar nem acusar');

// 6) igMaisParecida devolve a mais próxima da lista.
const m = sb.igMaisParecida(POI_A, [HIRS, DM_A, POI_B]);
ok(m.sim >= sb.IG_SIM_LIMITE && m.com === POI_B, 'igMaisParecida tem de apontar QUAL questão está repetida');

// 7) A ficha do prompt leva o começo da vinheta E a resposta correta — duas questões
//    do mesmo tema com a mesma resposta costumam ser a mesma questão.
const ficha = sb.igFichaEvitar({ stem: POI_A, answer: 'B', options: { B: 'Terapia estroprogestativa até ~50 anos' } });
ok(ficha.indexOf('Mulher de 34 anos') >= 0 && ficha.indexOf('Terapia estroprogestativa') >= 0,
   'a ficha enviada ao modelo precisa do começo do enunciado e da resposta correta');

// 8) Sem nada a evitar, nenhum bloco no prompt (não desperdiça contexto).
ok(sb.igBlocoEvitar([]) === '' && sb.igBlocoEvitar(null) === '', 'sem histórico, o prompt não ganha bloco vazio');
ok(sb.igBlocoEvitar(['• caso X']).indexOf('CLARAMENTE DIFERENTE') >= 0, 'o bloco tem de mandar diferenciar');
ok(sb.igBlocoEixo('o DIAGNÓSTICO mais provável').indexOf('DIAGNÓSTICO') >= 0, 'o eixo tem de chegar ao prompt');
ok(sb.igBlocoEixo('') === '', 'sem eixo, nada é acrescentado');

// ── Ligações no index.html (o que faz a correção valer no produto) ──────────────
ok(/igGenOneUnica\(s,topics\[idx\],lvl,eixos\[idx\],igStemsExistentes\(s\),produzidas\[s\]\)/.test(html),
   'o lote tem de gerar por igGenOneUnica, passando eixo, o que já existe e o que o lote já produziu');
ok(/var IG_EIXOS=\[/.test(html) && (html.match(/var IG_EIXOS=\[[\s\S]*?\]/) || [''])[0].split("',").length >= 5,
   'precisa de uma lista de eixos de pergunta com pelo menos 5 opções');
ok(/it\.repetida\?/.test(html),
   'a questão que continuou repetida tem de aparecer MARCADA na revisão, não sumir');
// ⚠️ 'Endocrinologia Básica' estava em DIR_SUBS e faltava em FC_SUBTOPICS: o seletor
//    de tema vinha vazio e TODO o lote saía sem subtema — o pior caso para repetir.
ok(/'Endocrinologia Básica':\['Hormônios/.test(html),
   'Endocrinologia Básica precisa de temas, senão o lote inteiro sai sem subtema');
const subsDir = (html.match(/var DIR_SUBS=\[([^\]]*)\]/) || ['', ''])[1]
  .split(',').map((s) => s.trim().replace(/^'|'$/g, '')).filter(Boolean);
const semTema = subsDir.filter((s) => html.indexOf("'" + s + "':[") < 0);
ok(semTema.length === 0,
   'toda subespecialidade do gerador precisa de temas — sem eles o lote sai sem subtema e repete: ' + JSON.stringify(semTema));
// Genética (pedido do professor): tem de existir tema de genética onde ela é assunto de prova.
// ⚠️ TODAS, não "quase todas": a 1ª versão desta guarda pedia `>= 8` de 9 áreas e
//    por isso ACEITAVA apagar uma — o mutante que removia a genética de
//    Endocrinologia Feminina passou verde. Guarda com folga embutida não guarda.
const AREAS_GENETICA = ['Tireoide', 'Adrenal', 'Obesidade', 'Neuroendocrinologia', 'Osteometabolismo',
  'Lípides', 'Endocrinologia Pediátrica', 'Endocrinologia Feminina', 'Endocrinologia Masculina'];
const semGenetica = AREAS_GENETICA.filter((s) => {
  const bloco = (html.match(new RegExp("'" + s + "':\\[[^\\]]*\\]")) || [''])[0];
  return !/genétic|NEM2|NEM1|SDHx|Turner|Klinefelter|monogênic|FMR1|predisposiç/i.test(bloco);
});
ok(semGenetica.length === 0,
   'genética precisa ser tema próprio em TODAS as áreas em que é assunto de prova — faltou em: ' + JSON.stringify(semGenetica));
// ⚠️ COMPORTAMENTAL, não textual: a primeira versão desta guarda procurava
//    `\\bnem\\b` no fonte e casou com o COMENTÁRIO que documenta a regra — texto
//    SOBRE o código, não o código. Agora roda a classificação de verdade: "nem" é
//    conjunção portuguesa e não pode disparar o tema de NEM2/NEM1.
{
  const sb2 = {};
  vm.createContext(sb2);
  vm.runInContext([
    trecho('var FC_TEMA_RULES=', '\n// Índice enunciado'),
    corpo('classifyTema'),
  ].join('\n'), sb2);
  const frase = 'paciente sem queixas, nao apresenta nem poliuria nem polidipsia nem perda de peso';
  ok(sb2.classifyTema(frase, 'Tireoide') !== 'Carcinoma medular e NEM2 (RET)',
     'a conjuncao "nem" nao pode classificar como NEM2');
  ok(sb2.classifyTema(frase, 'Neuroendocrinologia') !== 'NEM1 e adenomas familiares',
     'a conjuncao "nem" nao pode classificar como NEM1');
  // E o assunto de verdade continua sendo reconhecido.
  ok(sb2.classifyTema('carcinoma medular de tireoide com mutacao do RET, rastreio de NEM 2A', 'Tireoide')
       === 'Carcinoma medular e NEM2 (RET)',
     'carcinoma medular/RET tem de cair no tema de NEM2');
  ok(sb2.classifyTema('mulher com cariotipo 45,X e disgenesia gonadal', 'Endocrinologia Feminina')
       === 'Turner e pre-mutacao do FMR1'.replace('pre-','pré-').replace('mutacao','mutação'),
     'Turner tem de cair no tema de genetica de Endocrinologia Feminina');
}

if (falhas.length) {
  console.error('✗ questão repetida:');
  falhas.forEach((f) => console.error('  - ' + f));
  process.exit(1);
}
console.log('✓ questão repetida: acusa a duplicata real, aceita a questão só parecida, e o lote sabe o que já existe');
