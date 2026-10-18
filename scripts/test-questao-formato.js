// Regressão: o lote da Questão do Dia mistura casos clínicos (com figura) e questões
// diretas, e as alternativas são três difíceis e uma um pouco mais fácil.
//
// ⚠️ Pedido do professor (18/10/2026): "Estão sendo geradas questões somente com
// texto, mas sem nenhuma imagem contextualizando os casos clínicos. Portanto, gerar
// questões também com imagens no enunciado. Além disso, deixar as alternativas um
// pouco mais difíceis, mais ou menos três difíceis e uma um pouco mais fácil. Na
// geração das questões também, inclua questões mais diretas, sem necessariamente
// serem casos clínicos."
//
// Os testes RODAM as funções (plano do lote, instrução, nível, geração com aiRequest
// falso), em vez de procurar texto no fonte: guarda textual já casou com comentário.
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const falhas = [];
function ok(cond, msg) { if (!cond) falhas.push(msg); }

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
function linhaVar(nome) {
  const m = html.match(new RegExp('\\nvar ' + nome + "='(?:[^'\\\\]|\\\\.)*';"));
  if (!m) throw new Error('var ' + nome + ' não encontrada');
  return m[0];
}
function varArr(nome) {
  const i = html.indexOf('var ' + nome + '=[');
  if (i < 0) throw new Error('var ' + nome + ' não encontrada');
  let d = 0;
  for (let j = html.indexOf('[', i); j < html.length; j++) {
    if (html[j] === '[') d++;
    else if (html[j] === ']') { d--; if (!d) return html.slice(i, j + 1) + ';'; }
  }
  throw new Error('não fechou ' + nome);
}

const sb = { chamadas: [], anexos: 0, resposta: '' };
vm.createContext(sb);
vm.runInContext([
  linhaVar('IG_IMAGEQUERY_RULE'), linhaVar('IG_ALTERNATIVAS_RULE'), linhaVar('IG_FORMATO_DIRETA'),
  linhaVar('IG_CASO_COM_IMAGEM'), varArr('IG_EIXOS'), varArr('IG_EIXOS_DIRETA'),
  corpo('igShuffle'), corpo('igPlanoLote'), corpo('igBlocoEixo'), corpo('igBlocoEvitar'),
  corpo('igNivelDesc'), corpo('igSysQuestao'), corpo('igGenOne'), corpo('igShuffleMCQ'),
  // dublês: a instrução de sistema completa e a rede não interessam aqui
  'var AI_MODEL_CLINICO="modelo";',
  'function authoringSys(x){return x;}',
  'function parseJ(s){return JSON.parse(s);}',
  'function aiRequest(o){chamadas.push(o);return Promise.resolve(resposta);}',
  'function igAttachExamImage(q,d){anexos++;q.pediuImagem=d.imageQuery;return Promise.resolve(q);}',
].join('\n'), sb);

// ── 1) Plano do lote ─────────────────────────────────────────────────────────────
for (const n of [1, 3, 5, 7, 10]) {
  for (let rep = 0; rep < 20; rep++) {   // o embaralhamento não pode mudar as contas
    const p = sb.igPlanoLote(n, 'misto');
    const dir = p.filter((x) => x.formato === 'direta').length;
    const img = p.filter((x) => x.imagem).length;
    ok(p.length === n, 'misto, n=' + n + ': o plano tem de ter uma entrada por questão');
    ok(dir === Math.round(n * 0.3), 'misto, n=' + n + ': cerca de 30% diretas (veio ' + dir + ')');
    ok(img === Math.round((n - dir) * 2 / 3), 'misto, n=' + n + ': 2 em cada 3 casos com figura (veio ' + img + ')');
    ok(p.every((x) => !(x.formato === 'direta' && x.imagem)), 'misto, n=' + n + ': questão direta não leva figura');
  }
}
ok(sb.igPlanoLote(5, 'misto').some((x) => x.formato === 'direta'), 'o lote padrão de 5 tem de trazer questão direta');
ok(sb.igPlanoLote(5, 'misto').some((x) => x.imagem), 'o lote padrão de 5 tem de pedir figura em algum caso');
ok(sb.igPlanoLote(5, 'caso').every((x) => x.formato === 'caso'), '"Só casos clínicos" não pode trazer direta');
ok(sb.igPlanoLote(5, 'direta').every((x) => x.formato === 'direta' && !x.imagem), '"Só diretas": todas diretas e sem figura');
ok(sb.igPlanoLote(5, undefined).some((x) => x.formato === 'direta'), 'sem seletor (valor ausente), vale o misto');

// ── 2) Instrução de sistema ──────────────────────────────────────────────────────
const caso = sb.igSysQuestao('Tireoide', 'o DIAGNÓSTICO mais provável', { formato: 'caso' });
const casoImg = sb.igSysQuestao('Tireoide', 'o DIAGNÓSTICO mais provável', { formato: 'caso', imagem: true });
const direta = sb.igSysQuestao('Tireoide', 'um CRITÉRIO diagnóstico ou VALOR DE CORTE', { formato: 'direta' });
ok(caso.indexOf(sb.IG_ALTERNATIVAS_RULE) >= 0 && direta.indexOf(sb.IG_ALTERNATIVAS_RULE) >= 0,
   'as duas formas de questão têm de levar a regra das alternativas');
ok(caso.indexOf(sb.IG_IMAGEQUERY_RULE) >= 0, 'o caso clínico tem de levar a regra da figura');
ok(casoImg.indexOf(sb.IG_CASO_COM_IMAGEM) >= 0 && caso.indexOf(sb.IG_CASO_COM_IMAGEM) < 0,
   'só o caso marcado no plano é montado em torno de um achado visual');
ok(direta.indexOf(sb.IG_FORMATO_DIRETA) >= 0, 'a direta tem de levar a instrução de formato direto');
ok(direta.indexOf('Inclua os valores laboratoriais') < 0 && direta.indexOf(sb.IG_IMAGEQUERY_RULE) < 0,
   'a direta não pode receber a instrução de vinheta (exames inline, figura)');
ok(/"stem":"pergunta direta de 1 a 2 frases, sem caso clínico/.test(direta) && /"imageQuery":"string vazia"/.test(direta),
   'o JSON pedido na direta tem de descrever pergunta curta e imageQuery vazio');
ok(direta.indexOf('um CRITÉRIO diagnóstico ou VALOR DE CORTE') >= 0, 'o eixo da direta tem de chegar à instrução');

// ── 3) Regra das alternativas: três difíceis e uma um pouco mais fácil ──────────
const alt = sb.IG_ALTERNATIVAS_RULE;
ok(/TRÊS difíceis e UMA um pouco mais fácil/.test(alt), 'a regra tem de dizer "três difíceis e uma um pouco mais fácil"');
ok(/nunca absurdo/.test(alt), 'o distrator mais fácil continua plausível: nunca absurdo');
ok(/não pode ser a mais longa/.test(alt), 'a correta não pode se denunciar pelo tamanho');

// ── 4) Nível: a direta não recebe "evite questões diretas" ───────────────────────
for (const lv of ['titulo', 'muito_avancado']) {
  const d = sb.igNivelDesc(lv, 'direta');
  ok(!/questões óbvias\/diretas|óbvias, diretas/.test(d), 'nível ' + lv + ' da direta não pode proibir questão direta: ' + d);
  ok(/distratores/.test(d), 'nível ' + lv + ' da direta tem de cobrar distratores plausíveis');
}
ok(/evitando questões óbvias\/diretas/.test(sb.igNivelDesc('titulo')), 'o nível do caso clínico continua como era');

// ── 5) Geração: a direta não busca figura; o caso busca ──────────────────────────
const resp = JSON.stringify({ stem: 'Qual é o principal mecanismo de ação da tirzepatida?', options: { A: 'a', B: 'b', C: 'c', D: 'd' }, answer: 'A', explanation: 'x', imageQuery: 'acanthosis nigricans neck' });
sb.resposta = resp;
Promise.all([
  sb.igGenOne('Diabetes', '', 'titulo', 'eixo', [], { formato: 'direta' }),
  sb.igGenOne('Diabetes', '', 'titulo', 'eixo', [], { formato: 'caso', imagem: true }),
]).then(([qd, qc]) => {
  ok(qd && qd.formato === 'direta', 'a questão direta tem de sair marcada como direta (etiqueta na revisão)');
  ok(qc && qc.pediuImagem === 'acanthosis nigricans neck', 'o caso clínico tem de seguir para a busca da figura');
  ok(sb.anexos === 1, 'só o caso busca figura; a direta não, mesmo que o modelo preencha imageQuery (buscas: ' + sb.anexos + ')');
  ok(sb.chamadas.length === 2 && sb.chamadas[0].system.indexOf(sb.IG_FORMATO_DIRETA) >= 0
     && sb.chamadas[1].system.indexOf(sb.IG_CASO_COM_IMAGEM) >= 0,
     'cada chamada tem de levar a instrução do seu formato');
  ok(sb.chamadas[0].prompt.indexOf('PROÍBA questões óbvias, diretas') < 0 && sb.chamadas[0].prompt.indexOf('evitando questões óbvias/diretas') < 0,
     'o pedido da direta não pode trazer o nível que proíbe questão direta');

  // ── 6) Ligações no index.html ──────────────────────────────────────────────────
  ok(/igPlanoLote\(n,\(document\.getElementById\('ig-lote-formato'\)\|\|\{\}\)\.value\|\|'misto'\)/.test(html),
     'o botão do lote tem de montar o plano pelo seletor de formato');
  ok(/<select id="ig-lote-formato"><option value="misto" selected>Casos e diretas<\/option><option value="caso">Só casos clínicos<\/option><option value="direta">Só diretas<\/option><\/select>/.test(html),
     'o seletor de formato tem de existir no lote, com "Casos e diretas" como padrão');
  ok(/var sys=igSysQuestao\(sub,'',\{formato:'caso'\}\);/.test(html),
     'o "Gerar 1 com IA" do formulário tem de usar a mesma instrução do lote');
  ok(/it\.formato==='direta'\?' <span class="tag">❓ direta<\/span>'/.test(html),
     'a revisão do lote tem de marcar a questão direta');

  if (falhas.length) {
    console.error('✗ formato do lote da Questão do Dia:');
    falhas.forEach((f) => console.error('  - ' + f));
    process.exit(1);
  }
  console.log('✓ lote da Questão do Dia: casos com figura, questões diretas e alternativas três difíceis e uma mais fácil');
}).catch((e) => { console.error(e); process.exit(1); });
