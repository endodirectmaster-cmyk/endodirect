// Regressão: negrito e bullet NÃO podem quebrar quando a linha do markdown quebra.
//
// ⚠️ O CASO REAL (21/08/2026). O professor mandou print de "Retinopatia, Neuropatia
// e Pé Diabético" com `**` cru na tela e a continuação do item encostada na
// margem, fora do bullet. O resumo é markdown com quebra RÍGIDA:
//
//     - **Gestante com diabetes PRÉVIO**: **a cada trimestre** — alto risco…
//       ⚠️ **Não confundir com diabetes gestacional: no DMG não há indicação de fundo de
//       olho.**
//
// `mdToHtml` lia linha a linha e dava `trim()`, apagando o recuo — o único sinal
// de continuação. Nenhuma das duas linhas tinha par `**…**` completo, e a segunda
// virava `<p>` solto. Medido no banco: 19 capítulos, 334 linhas de negrito
// partido, 413 linhas de continuação.
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { JSDOM, VirtualConsole } = require('jsdom');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const falhas = [];
const ok = (c, m) => { if (!c) falhas.push(m); };

// ⚠️ CONTADOR DE CHAVES NÃO SERVE AQUI: `mdInline` tem `{` dentro de regex e de
// string (`(?:\\{(\\d{1,3})\\})?`), e o contador ingênuo do
// test-titulo-funde-blocos.js segue contando até engolir meia página. Estas
// funções são todas de topo, então fatiar até o PRÓXIMO `function` em coluna
// zero é exato e não depende de balancear nada.
function corpo(nome) {
  const marca = '\nfunction ' + nome + '(';
  const i = html.indexOf(marca);
  if (i < 0) throw new Error('função não encontrada: ' + nome);
  const fim = html.indexOf('\nfunction ', i + marca.length);
  return html.slice(i + 1, fim < 0 ? html.length : fim);
}

const vc = new VirtualConsole(); vc.on('jsdomError', () => {});
const dom = new JSDOM('<body></body>', { url: 'https://x/', runScripts: 'outside-only', virtualConsole: vc });
const ctx = vm.createContext(dom.getInternalVMContext());
// Só o necessário para mdToHtml rodar isolado.
vm.runInContext(
  'function esc(s){return String(s==null?"":s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");}\n'
  + 'function safeImgSrc(){return false;}\n'
  + 'function isMarkdownTableSep(l){return /^\\s*\\|?\\s*:?-{2,}/.test(l);}\n'
  + 'function mdSplitRow(l){return String(l).replace(/^\\s*\\|/,"").replace(/\\|\\s*$/,"").split("|").map(function(c){return c.trim();});}\n'
  + 'function mdCelHTML(tag,c){return "<"+tag+">"+mdInline(c)+"</"+tag+">";}\n'
  + 'function mdFiguraBloco(){return "";}\n'
  + 'function pizzaSVG(){return "<figure class=\\"pz\\"></figure>";}\n'
  + 'function barraHTML(){return "<figure class=\\"br\\"></figure>";}\n'
  + 'var mdAltRE="([^\\\\]]*)";function mdUnescAlt(a){return a;}\n'
  + 'var WYS_CORES_RE="azul|verde";\n'
  + corpo('wysAlignRead') + '\n' + corpo('mdInline') + '\n'
  + corpo('mdBlocoAbre') + '\n' + corpo('mdLinhaDeTabela') + '\n' + corpo('mdFrasePronta') + '\n'
  + corpo('mdDesdobra') + '\n' + corpo('mdToHtml'), ctx);
const mdToHtml = vm.runInContext('mdToHtml', ctx);
const mdDesdobra = vm.runInContext('mdDesdobra', ctx);

// ── 1. O caso do professor, verbatim do banco ────────────────────────────────
const CASO = [
  '- **Gestante com diabetes PRÉVIO**: **a cada trimestre** — alto risco de progressão.',
  '  ⚠️ **Não confundir com diabetes gestacional: no DMG não há indicação de fundo de',
  '  olho.**',
].join('\n');
const saida = mdToHtml(CASO);
ok(!/\*\*/.test(saida), 'sobrou `**` literal na tela: ' + saida);
ok(/<strong>Não confundir com diabetes gestacional: no DMG não há indicação de fundo de olho\.<\/strong>/.test(saida),
  'o negrito que atravessa a quebra não fechou: ' + saida);
ok((saida.match(/<li>/g) || []).length === 1, 'a continuação virou item/parágrafo próprio: ' + saida);
ok(!/<p>/.test(saida), 'a continuação escapou do <li> como parágrafo: ' + saida);

// ── 2. O segundo trecho do mesmo capítulo (AAS) ──────────────────────────────
const AAS = [
  '- Controle dos fatores de risco: **hipertensão** e **dislipidemia** (reduz a',
  '  necessidade de fotocoagulação). ⚠️ **Manter o AAS se indicado — retinopatia não',
  '  contraindica aspirina.**',
].join('\n');
const sAAS = mdToHtml(AAS);
ok(!/\*\*/.test(sAAS), 'AAS: sobrou `**` literal: ' + sAAS);
ok(/retinopatia não contraindica aspirina\.<\/strong>/.test(sAAS), 'AAS: negrito não fechou: ' + sAAS);

// ── 3. O QUE NÃO PODE SER JUNTADO ────────────────────────────────────────────
// Lista aninhada: 59 linhas indentadas do banco começam com `- `. Juntar mudaria
// a estrutura em vez de restaurá-la.
const ANINHADA = ['- Pai', '  - Filho um', '  - Filho dois'].join('\n');
ok((mdToHtml(ANINHADA).match(/<li>/g) || []).length === 3,
  'lista aninhada foi fundida no item pai: ' + mdToHtml(ANINHADA));

// Título, citação e regra horizontal indentados seguem blocos próprios.
ok(/<h3/.test(mdToHtml('Texto\n  ## Título')), 'título indentado foi absorvido');
ok(/<blockquote>/.test(mdToHtml('Texto\n  > Citação')), 'citação indentada foi absorvida');
ok(/<hr>/.test(mdToHtml('Texto\n  ---')), 'regra horizontal indentada foi absorvida');

// Tabela: nem a linha indentada com pipes entra em parágrafo, nem texto indentado
// é costurado dentro de uma célula.
const TAB = ['| A | B |', '| --- | --- |', '  | 1 | 2 |'].join('\n');
ok(/<table>/.test(mdToHtml(TAB)) && !/<p>/.test(mdToHtml(TAB)), 'tabela indentada quebrou: ' + mdToHtml(TAB));
ok(mdDesdobra(['| A | B |', '  continuação solta']).length === 2,
  'texto indentado foi costurado dentro da linha de tabela');

// Linha indentada no início do texto não tem a quem se juntar.
ok(mdDesdobra(['  primeira']).length === 1, 'linha indentada inicial se perdeu');

// ── 3b. Linha SEM recuo continua sendo bloco próprio ─────────────────────────
// O recuo é o sinal. Sem ele, duas frases seguidas são dois parágrafos — juntar
// mudaria o texto do professor por conta própria.
const SOLTAS = ['Primeira frase.', 'Segunda frase.'].join('\n');
// O sinal é a PONTUAÇÃO: o acervo tem 47 pares assim, cada linha um fato próprio
// com seu rótulo em negrito. Fundi-las mudaria o texto do professor.
const DELIBERADAS = ['**Posologia:** 25–400 mg/dia (média de 100 mg/dia).', '**Regra de parada:** perda < 5% após a dose plena.'].join('\n');
ok((mdToHtml(DELIBERADAS).match(/<p/g) || []).length === 2,
  'duas linhas terminadas em ponto foram fundidas: ' + mdToHtml(DELIBERADAS));
ok((mdToHtml(SOLTAS).match(/<p/g) || []).length === 2,
  'duas linhas sem recuo foram fundidas num parágrafo só: ' + mdToHtml(SOLTAS));

// ── 3c. `>` só é citação seguido de espaço ───────────────────────────────────
// ⚠️ CASO REAL, e este comia informação clínica. A titulação da basal quebrou como
//     ...**a cada 3 dias, +2 UI se glicemia de jejum
//       >130 ou −2 UI se <80**.
// O `>130` (glicemia MAIOR QUE 130) era lido como marcador de citação: o `>`
// sumia da tela e a regra virava "glicemia de jejum 130". Um sinal de maior
// engolido numa regra de dose.
const MAIORQUE = [
  '- Titulação de ambos: **a cada 3 dias, +2 UI se glicemia de jejum',
  '  >130 ou −2 UI se <80**.',
].join('\n');
const sMQ = mdToHtml(MAIORQUE);
ok(/&gt;130/.test(sMQ), 'o ">" de >130 foi comido como citação: ' + sMQ);
ok(!/<blockquote>/.test(sMQ), '">130" virou citação: ' + sMQ);
ok(!/\*\*/.test(sMQ), 'MAIORQUE: sobrou `**` literal: ' + sMQ);

// E a citação de verdade, quebrada em duas linhas, vira UMA citação só.
const CIT = ['> **Macete**: CAS tem **3 letras** → avaliam-se **3 sinais**: **dor, edema,', '> hiperemia**.'].join('\n');
ok((mdToHtml(CIT).match(/<blockquote>/g) || []).length === 1, 'citação de 2 linhas virou 2 citações: ' + mdToHtml(CIT));
ok(!/\*\*/.test(mdToHtml(CIT)), 'citação: sobrou `**` literal: ' + mdToHtml(CIT));

// ── 4. Parágrafo comum também se desdobra ────────────────────────────────────
const PAR = ['Uma frase **que atravessa', '  a quebra** e continua.'].join('\n');
ok(!/\*\*/.test(mdToHtml(PAR)) && /<strong>que atravessa a quebra<\/strong>/.test(mdToHtml(PAR)),
  'parágrafo hard-wrapped não se desdobrou: ' + mdToHtml(PAR));
ok((mdToHtml(PAR).match(/<p/g) || []).length === 1, 'parágrafo virou dois: ' + mdToHtml(PAR));

// ── 5. Verificação por MUTAÇÃO ───────────────────────────────────────────────
// Sem isto o teste passaria com a correção desfeita — foi o erro de 06/08.
// Mede o DESDOBRADOR direto: o certo colapsa o caso do professor em 1 linha e
// deixa a lista aninhada com 3.
const nCaso = mdDesdobra(CASO.split('\n')).length;
const nAninhada = mdDesdobra(ANINHADA.split('\n')).length;
const nSoltas = mdDesdobra(SOLTAS.split('\n')).length;
ok(nCaso === 1, 'desdobrador não colapsou o caso real (deu ' + nCaso + ' linhas, esperado 1)');
ok(nAninhada === 3, 'desdobrador comeu a lista aninhada (deu ' + nAninhada + ' linhas, esperado 3)');
ok(nSoltas === 2, 'desdobrador fundiu linhas sem recuo (deu ' + nSoltas + ' linhas, esperado 2)');

const MUTANTES = [
  ['não desdobra nada (o bug original)', (ls) => ls.slice()],
  ['desdobra tudo que é indentado, inclusive lista aninhada', (ls) => {
    const o = [];
    for (const raw of ls) {
      if (/^[ \t]+\S/.test(raw) && o.length && o[o.length - 1].trim()) o[o.length - 1] += ' ' + raw.trim();
      else o.push(raw);
    }
    return o;
  }],
  ['desdobra sem exigir recuo (junta linha solta)', (ls) => {
    const o = [];
    for (const raw of ls) {
      if (raw.trim() && o.length && o[o.length - 1].trim() && !/^[ \t]*[-*+#>]/.test(raw)) o[o.length - 1] += ' ' + raw.trim();
      else o.push(raw);
    }
    return o;
  }],
];
for (const [nome, mut] of MUTANTES) {
  const errouCaso = mut(CASO.split('\n')).length !== 1;
  const errouAninhada = mut(ANINHADA.split('\n')).length !== 3;
  const errouSoltas = mut(SOLTAS.split('\n')).length !== 2;
  if (!errouCaso && !errouAninhada && !errouSoltas) falhas.push('mutação NÃO detectada: ' + nome);
}

if (falhas.length) { console.error('✗ ' + falhas.length + ' falha(s):\n - ' + falhas.join('\n - ')); process.exit(1); }
console.log('✓ quebra rígida no resumo: negrito atravessa a quebra, continuação fica no bullet, e lista aninhada/tabela/título seguem intactos');
