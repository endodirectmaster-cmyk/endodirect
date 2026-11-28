// Regressão: filtro de TEMA dentro da subespecialidade no Banco de questões (aluno e painel do professor).
// Professor, 28/11/2026: "no banco de questões, tanto do painel do professor como do aluno, após ele escolher a
// subespecialidade, por exemplo, adrenal, deixar um filtro também para escolher a opção de qual tipo de questão da
// subespecialidade. Por exemplo, ao escolher adrenal, se ele quer treinar hiperaldosteronismo, se ele quer treinar
// Cushing, se ele quer treinar incidentaloma adrenal, se ele quer treinar carcinoma adrenocortical".
// Nomes pedidos por ele: em Adrenal, "Síndrome de Cushing" e "Miscelânea" (o resto); em Neuro, "Doença de Cushing".
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const falhas = [];
function ok(cond, msg) { if (!cond) falhas.push(msg); }
function corpo(nome) {
  const i = html.indexOf('\nfunction ' + nome + '(');
  if (i < 0) throw new Error('função ausente no index.html: ' + nome);
  let n = 0;
  for (let k = html.indexOf('{', i); k < html.length; k++) {
    if (html[k] === '{') n++;
    else if (html[k] === '}') { n--; if (!n) return html.slice(i + 1, k + 1); }
  }
  throw new Error('chaves não fecham em ' + nome);
}
function trecho(inicio, fim) {
  const i = html.indexOf(inicio);
  if (i < 0) throw new Error('trecho ausente no index.html: ' + inicio);
  const j = html.indexOf(fim, i);
  if (j < 0) throw new Error('fim do trecho ausente: ' + fim);
  return html.slice(i, j + fim.length);
}

let pool = [];
const ctx = vm.createContext({
  WeakMap, Object, String, RegExp, Math,
  esc: (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])),
  nBR: (n) => String(n),
  provasPool: () => pool,
});
vm.runInContext([
  trecho('var QB_TEMAS={', '\n};\n'),
  "var QB_TEMA_MISC='Miscelânea';var qbTemaRegras=null;var qbTemaMemo=(typeof WeakMap==='function')?new WeakMap():null;",
  corpo('canonSub'), corpo('qbTemaCompila'), corpo('qbTemaDe'), corpo('qbTemaOpcoes'), corpo('qbTemaSelectHTML'), corpo('filterProvas'),
].join('\n'), ctx);

const T = ctx.QB_TEMAS;
const temaDe = ctx.qbTemaDe;
const nomes = (sub) => Array.from(new Set(T[sub].map((r) => r[0])));

// Nomes dos temas (pedido do professor).
ok(nomes('Adrenal').includes('Síndrome de Cushing'), 'Adrenal tem o tema "Síndrome de Cushing"');
ok(nomes('Adrenal').includes('Miscelânea'), 'Adrenal tem o tema "Miscelânea"');
ok(!nomes('Adrenal').some((t) => /massas adrenais|outras massas|fisiologia adrenal|de origem adrenal/i.test(t)), 'Adrenal sem "outras massas", "fisiologia" ou "Cushing de origem adrenal"');
ok(nomes('Neuroendocrinologia').includes('Doença de Cushing'), 'Neuroendocrinologia tem o tema "Doença de Cushing"');
ok(nomes('Neuroendocrinologia').includes('Miscelânea') && !nomes('Neuroendocrinologia').some((t) => /craniofaring/i.test(t)), 'Neuro: "Craniofaringioma e outras lesões selares" virou "Miscelânea" (professor, 28/11/2026)');
['Hiperaldosteronismo primário', 'Incidentaloma adrenal', 'Carcinoma adrenocortical', 'Feocromocitoma e paraganglioma', 'Insuficiência adrenal', 'Hiperplasia adrenal congênita']
  .forEach((t) => ok(nomes('Adrenal').includes(t), 'Adrenal tem o tema "' + t + '"'));
ok(Object.keys(T).length === 14, 'as 14 subespecialidades das Diretrizes têm temas (tem ' + Object.keys(T).length + ')');

// Todas as regras compilam e nenhuma usa lookbehind (quebraria o script no Safari do iOS 12).
const regras = ctx.qbTemaCompila();
let total = 0, compiladas = 0, lookbehind = 0;
Object.keys(T).forEach((s) => { total += T[s].length; compiladas += (regras[s] || []).length; (regras[s] || []).forEach((r) => { if (/\(\?<[=!]/.test(r[1].source)) lookbehind++; }); });
ok(compiladas === total, 'todas as ' + total + ' regras compilam (' + compiladas + ')');
ok(lookbehind === 0, 'nenhuma regra compilada usa lookbehind (' + lookbehind + ')');

// Classificação.
const casos = [
  [{ area: 'Adrenal', stem: 'Mulher de 45 anos, hipertensa, potássio 3,1 mEq/L e relação aldosterona/renina elevada. Qual o próximo passo?' }, 'Hiperaldosteronismo primário'],
  [{ area: 'Adrenal', stem: 'Homem de 50 anos com obesidade central, estrias violáceas e cortisol salivar noturno elevado em duas amostras.' }, 'Síndrome de Cushing'],
  [{ area: 'Adrenal', stem: 'Nódulo adrenal de 2,8 cm achado incidentalmente, 8 unidades Hounsfield na TC sem contraste.' }, 'Incidentaloma adrenal'],
  [{ area: 'Adrenal', stem: 'Carcinoma adrenocortical ressecado, Ki-67 de 25%. Indicação de mitotano adjuvante?' }, 'Carcinoma adrenocortical'],
  [{ area: 'Adrenal', stem: 'Sobre a embriologia do córtex, assinale a correta.' }, 'Miscelânea'],
  // A fronteira de palavra considera letra acentuada (\b nativo do JavaScript não considera): "Huánuco" não é "HU".
  [{ area: 'Adrenal', stem: 'Paciente natural de Huánuco, sem queixas, assinale a correta.' }, 'Miscelânea'],
  // A categoria vale antes do enunciado.
  [{ area: 'Adrenal', category: 'Feocromocitoma', stem: 'Hipertensão com aldosterona normal.' }, 'Feocromocitoma e paraganglioma'],
  [{ area: 'Neuroendocrinologia', stem: 'Mulher de 34 anos com doença de Cushing confirmada por cateterismo de seios petrosos.' }, 'Doença de Cushing'],
  [{ area: 'Neuroendocrinologia', stem: 'Pós-operatório de cirurgia transesfenoidal com sódio de 126 mEq/L no 7º dia.' }, 'SIADH e hiponatremia'],
  [{ area: 'Neuroendocrinologia', stem: 'Sobre a ghrelina, assinale a correta.' }, 'Miscelânea'],
  [{ area: 'Neuroendocrinologia', category: 'Craniofaringioma e outras lesões selares', stem: 'Craniofaringioma adamantinomatoso.' }, 'Miscelânea'],
  [{ area: 'Neuroendocrinologia', stem: 'Adulto com pico de GH de 1,2 ng/mL no teste de tolerância à insulina.' }, 'Deficiência de GH'],
  // Rótulo antigo de área passa pela taxonomia (canonSub).
  [{ area: 'Básica', stem: 'Exposição a bisfenol A e ftalatos.' }, 'Disruptores endócrinos'],
  [{ area: 'Geral', stem: 'Qualquer coisa.' }, ''],
  // Nome exato do tema em `category` vence as regras (28/11/2026); e "adolescência" conta para infância.
  [{ area: 'Obesidade', category: 'Obesidade na infância e adolescência', stem: 'Adolescente de 14 anos inicia semaglutida 2,4 mg.' }, 'Obesidade na infância e adolescência'],
  [{ area: 'Obesidade', stem: 'Obesidade na adolescência: qual exame de rastreio?' }, 'Obesidade na infância e adolescência'],
  [{ area: 'Adrenal', category: 'Incidentaloma adrenal', stem: 'Cortisol pós-dexametasona de 2,9 µg/dL.' }, 'Incidentaloma adrenal'],
  // As alternativas entram só depois do enunciado.
  [{ area: 'Adrenal', stem: 'Qual o tratamento?', options: { A: 'Espironolactona e dosar aldosterona', B: 'Outra' } }, 'Hiperaldosteronismo primário'],
];
casos.forEach(([q, esperado]) => {
  const t = temaDe(q);
  ok(t === esperado, 'tema de "' + q.stem.slice(0, 50) + '…" (' + q.area + ') = "' + t + '", esperado "' + esperado + '"');
});

// A memória do tema se refaz se o professor editar a questão.
const ed = { area: 'Adrenal', stem: 'Cortisol salivar noturno elevado.' };
ok(temaDe(ed) === 'Síndrome de Cushing', 'antes da edição: Síndrome de Cushing');
ed.stem = 'Relação aldosterona/renina elevada, com potássio baixo e muito mais texto.';
ok(temaDe(ed) === 'Hiperaldosteronismo primário', 'depois da edição, o tema acompanha o texto novo');

// Opções da caixa: só temas com questão, em ordem alfabética, "Miscelânea" por último, com a contagem.
pool = [
  { area: 'Adrenal', stem: 'aldosterona alta' }, { area: 'Adrenal', stem: 'relação aldosterona/renina' },
  { area: 'Adrenal', stem: 'cortisol salivar' }, { area: 'Adrenal', stem: 'nada a ver' },
  { area: 'Adrenal', stem: 'mitotano', type: 'disc' }, { area: 'Tireoide', stem: 'aldosterona' },
];
const ops = ctx.qbTemaOpcoes('Adrenal', pool);
ok(ops.map((o) => o.tema).join('|') === 'Carcinoma adrenocortical|Hiperaldosteronismo primário|Síndrome de Cushing|Miscelânea', 'ordem das opções: ' + ops.map((o) => o.tema).join('|'));
ok(ops.find((o) => o.tema === 'Hiperaldosteronismo primário').n === 2, 'contagem por tema só da subespecialidade escolhida');
ok(ctx.qbTemaOpcoes('', pool).length === 0 && ctx.qbTemaOpcoes('Geral', pool).length === 0, 'sem subespecialidade (ou sem temas), a caixa some');
const sel = ctx.qbTemaSelectHTML(ops, 'Síndrome de Cushing');
ok(/^<option value="">Todos os temas<\/option>/.test(sel) && /value="Síndrome de Cushing" selected>Síndrome de Cushing \(1\)/.test(sel), 'a caixa traz "Todos os temas" e o tema escolhido marcado, com a contagem');

// filterProvas: o tema soma aos outros filtros; sem tema, nada muda (o Simulado chama com 3 argumentos).
ok(ctx.filterProvas('', '', 'Adrenal', '', 'Hiperaldosteronismo primário').length === 2, 'filtro por tema dentro de Adrenal');
ok(ctx.filterProvas('', '', 'Adrenal', 'mc', 'Carcinoma adrenocortical').length === 0, 'tema + tipo (objetiva) combinam');
ok(ctx.filterProvas('', '', 'Adrenal').length === 5, 'sem tema, a subespecialidade inteira');

// "Miscelânea" de Adrenal e de Neuro são temas separados (professor, 28/11/2026).
pool = [
  { area: 'Adrenal', stem: 'Sobre a embriologia do córtex adrenal.' },
  { area: 'Neuroendocrinologia', stem: 'Craniofaringioma adamantinomatoso com calcificação.' },
  { area: 'Neuroendocrinologia', stem: 'Sobre a ghrelina, assinale a correta.' },
];
ok(ctx.filterProvas('', '', 'Adrenal', '', 'Miscelânea').length === 1, 'Miscelânea de Adrenal traz só a de Adrenal');
ok(ctx.filterProvas('', '', 'Neuroendocrinologia', '', 'Miscelânea').length === 2, 'Miscelânea de Neuro traz só as de Neuro');
ok(ctx.qbTemaOpcoes('Adrenal', pool).find((o) => o.tema === 'Miscelânea').n === 1 && ctx.qbTemaOpcoes('Neuroendocrinologia', pool).find((o) => o.tema === 'Miscelânea').n === 2, 'a contagem da Miscelânea é de cada subespecialidade');
ok(/if\(temaSel\.getAttribute\('data-sub'\)!==subT\)curT='';/.test(corpo('updateProvaInfo')), 'trocar a subespecialidade volta o tema para "Todos"');

// Tela do aluno.
ok(/<div class="fld2" id="q-ptema-field" style="[^"]*display:none[^"]*"><label>Tema<\/label><select id="q-ptema">/.test(html), 'caixa "Tema" no Banco do aluno, escondida até escolher a subespecialidade');
ok(/\['q-inst','q-ano','q-parea','q-ptype','q-ptema'\]\.forEach/.test(html), 'trocar o tema atualiza a contagem');
ok(/var qs=filterProvas\(inst,ano,area,type,tema\);/.test(html), 'o "Estudar" usa o tema escolhido');
ok(/var lista=filterProvas\(inst,ano,area,type,tema\);/.test(corpo('updateProvaInfo')), 'a contagem do aluno respeita o tema');

// Painel do professor.
ok(/id="adm-bq-tema-field"[^>]*><label>Tema<\/label><select id="adm-bq-tema">/.test(html), 'caixa "Tema" no Banco do painel do professor');
ok(/if\(ft&&qbTemaDe\(q\)!==ft\)return;/.test(corpo('admProvasFilter')), 'o painel filtra pelo tema');
ok(/admBancoArea='';admBancoTema='';/.test(html), '"Limpar filtros" limpa o tema');
ok(/admBancoArea=fa\.value;admBancoTema='';[^}]*admBqTemaAtualiza\(\)/.test(html), 'trocar a subespecialidade no painel refaz a lista de temas');

if (falhas.length) {
  console.error('test-banco-tema: ' + falhas.length + ' falha(s)\n- ' + falhas.join('\n- '));
  process.exit(1);
}
console.log('test-banco-tema: ok (' + total + ' regras em 14 subespecialidades; ' + casos.length + ' casos; aluno e painel)');
