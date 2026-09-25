// O ALUNO ESCOLHE O TEMA NO OSCE E NA PRESCRIÇÃO — OS MESMOS TEMAS DOS RESUMOS.
//
// 25/09/2026. Pedido do professor a partir da sugestão de um assinante Gold:
// "Nas ferramentas de OSCE e Prescrição Comentada, colocar filtro para o aluno
// escolher também o tema de cada subespecialidade. Os temas podem ser os mesmos
// já presentes nos resumos."
//
// 🧨 O QUE ESTE TESTE PRENDE: (1) a lista de temas nasce das DUAS fontes — a do
// servidor (acervo_totais.temas, completa para qualquer plano) e a local
// (capítulos privados + temas extras) — na ordem dos Resumos, sem repetição e
// com o nome canônico da subespecialidade (o select diz "Endocrinologia
// Esportiva"; os Resumos, "Endocrinologia do Esporte"); (2) os selects existem
// nas duas ferramentas e são preenchidos ao abrir, ao trocar a subespecialidade
// e quando o conteúdo remoto chega; (3) o tema entra no pedido à IA e no
// relatório; (4) "Todas" agrupa por subespecialidade e o tema escolhido define
// a subespecialidade; (5) o .sql do acervo entrega `temas`; (6) a janela de
// novidades anuncia o filtro (prometido ao aluno na resposta ao feedback).
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const RAIZ = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(RAIZ, 'index.html'), 'utf8');
const sql = fs.readFileSync(path.join(RAIZ, 'supabase', 'temas-dos-resumos-no-acervo.sql'), 'utf8');
const falhas = [];
const ok = (c, m) => { if (!c) falhas.push(m); };
function corpo(nome) {
  const i = html.indexOf('function ' + nome + '(');
  if (i < 0) throw new Error('função ausente no index.html: ' + nome);
  let j = html.indexOf('{', i), n = 0;
  for (let k = j; k < html.length; k++) {
    if (html[k] === '{') n++;
    else if (html[k] === '}') { n--; if (!n) return html.slice(i, k + 1); }
  }
  throw new Error('chaves não fecham em ' + nome);
}
function trecho(nome) {
  const m = html.match(new RegExp('var ' + nome + '=(\\[[^\\]]*\\]);'));
  if (!m) throw new Error('lista ausente: ' + nome);
  return 'var ' + nome + '=' + m[1] + ';';
}

// ── Caixa de areia com um acervo de mentira ──────────────────────────────────
function caixa(opts) {
  opts = opts || {};
  const docs = {};
  const c = {
    console, Object, Array, String, Number,
    acervoTotais: opts.acervoTotais === undefined ? null : opts.acervoTotais,
    currentUser: opts.currentUser || { id: 'U1', role: 'aluno' },
    diretrizes: opts.diretrizes || [],
    dirTemasExtra: opts.extras || [],
    document: { getElementById: (id) => docs[id] || null, querySelector: () => null },
    _docs: docs,
  };
  vm.createContext(c);
  vm.runInContext([
    trecho('DIR_SUBS'),
    corpo('esc'), corpo('canonSub'), corpo('dirTemaOf'), corpo('dirIsRascunho'), corpo('dirTipoOf'),
    corpo('dirTemaList'), corpo('temasDaSub'), corpo('subsComTema'), corpo('subDaOptionSelecionada'), corpo('popularTemas'), corpo('popularTemasFerramentas'),
  ].join('\n'), c);
  return c;
}
// Um <select> de mentira que entende innerHTML de <option>/<optgroup>, options,
// selectedIndex, value e getAttribute('data-sub') — o suficiente para exercitar
// popularTemas e subDaOptionSelecionada de verdade.
function selectFalso() {
  const s = { options: [], selectedIndex: 0, _html: '' };
  Object.defineProperty(s, 'innerHTML', {
    get() { return s._html; },
    set(h) {
      s._html = h; s.options = []; s.selectedIndex = 0;
      const re = /<option value="([^"]*)"(?: data-sub="([^"]*)")?>/g; let m;
      while ((m = re.exec(h))) { const v = m[1], ds = m[2]; s.options.push({ value: v, getAttribute: (k) => (k === 'data-sub' ? (ds === undefined ? null : ds) : null) }); }
    },
  });
  Object.defineProperty(s, 'value', {
    get() { const o = s.options[s.selectedIndex]; return o ? o.value : ''; },
    set(v) { const i = s.options.findIndex((o) => o.value === v); s.selectedIndex = i >= 0 ? i : 0; },
  });
  return s;
}
const cap = (sub, tema, extra) => Object.assign({ sub, tema, privado: true, tipo: 'capitulo', titulo: tema }, extra || {});

// ── 1. temasDaSub: servidor + local, na ordem, sem repetição, nome canônico ──
{
  const c = caixa({
    acervoTotais: { temas: { 'Diabetes': ['Diagnóstico e Classificação do Diabetes', 'Insulinoterapia'], 'Endocrinologia do Esporte': ['RED-S e Tríade da Mulher Atleta'] } },
    diretrizes: [
      cap('Diabetes', 'Insulinoterapia'),                       // já veio do servidor: não repete
      cap('Diabetes', 'Diabetes e Gestação'),                    // só local: entra depois
      cap('Diabetes', 'Rascunho secreto', { rascunho: true }),   // rascunho: fora
      cap('Diabetes', 'Artigo qualquer', { tipo: 'artigo' }),    // artigo: fora
      cap('Diabetes', 'Pública', { privado: false }),            // diretriz pública: fora (temas são dos Resumos)
      cap('Tireoide', 'Hipotireoidismo'),
    ],
    extras: [{ sub: 'Diabetes', tema: 'Rastreamento do diabetes mellitus tipo 1' }, { sub: 'Diabetes', tema: 'insulinoterapia' }, { sub: 'Diabetes', tema: 'Só artigo', tipo: 'artigo' }],
  });
  const d = vm.runInContext('temasDaSub("Diabetes")', c);
  ok(JSON.stringify(d) === JSON.stringify(['Diagnóstico e Classificação do Diabetes', 'Insulinoterapia', 'Diabetes e Gestação']),
    'temasDaSub (aluno): servidor primeiro (na ordem), depois os capítulos locais, sem repetir, sem rascunho/artigo/pública — e SEM os extras locais (a cópia do aluno pode estar velha; os extras vêm do servidor) — veio ' + JSON.stringify(d));
  // O professor (lê o global direto) vê também os temas extras que criou, sem repetir por caixa.
  const adm = caixa({ currentUser: { id: 'A', role: 'admin' }, diretrizes: c.diretrizes, extras: c.dirTemasExtra });
  const da = vm.runInContext('temasDaSub("Diabetes")', adm);
  ok(JSON.stringify(da) === JSON.stringify(['Insulinoterapia', 'Diabetes e Gestação', 'Rastreamento do diabetes mellitus tipo 1']),
    'temasDaSub (professor): capítulos + extras (sem repetir "insulinoterapia" por caixa, sem o extra de artigo) — veio ' + JSON.stringify(da));
  const e = vm.runInContext('temasDaSub("Endocrinologia Esportiva")', c);
  ok(JSON.stringify(e) === JSON.stringify(['RED-S e Tríade da Mulher Atleta']), 'temasDaSub: "Endocrinologia Esportiva" (select) acha "Endocrinologia do Esporte" (Resumos) — veio ' + JSON.stringify(e));
  ok(vm.runInContext('temasDaSub("Adrenal")', c).length === 0, 'temasDaSub: subespecialidade sem tema em nenhuma fonte = lista vazia');
  const subs = vm.runInContext('subsComTema()', c);
  ok(JSON.stringify(subs) === JSON.stringify(['Diabetes', 'Tireoide', 'Endocrinologia do Esporte']), 'subsComTema: só as que têm tema, na ordem canônica — veio ' + JSON.stringify(subs));
}
// Degustação: sem capítulos locais, a lista do servidor sozinha preenche.
{
  const c = caixa({ acervoTotais: { temas: { 'Obesidade': ['Fisiopatologia da Obesidade', 'Tratamento Farmacológico da Obesidade'] } } });
  ok(vm.runInContext('temasDaSub("Obesidade")', c).length === 2, 'degustação: a lista do servidor basta (a degustação só recebe 1 capítulo por área)');
}
// Sem servidor (professor lê o global direto): a lista local basta.
{
  const c = caixa({ diretrizes: [cap('Adrenal', 'Síndrome de Cushing'), cap('Adrenal', 'Incidentaloma Adrenal')] });
  ok(JSON.stringify(vm.runInContext('temasDaSub("Adrenal")', c)) === JSON.stringify(['Síndrome de Cushing', 'Incidentaloma Adrenal']), 'professor: sem acervo_totais, os capítulos do navegador preenchem');
  ok(vm.runInContext('temasDaSub("Adrenal")', c).length === 2, 'acervoTotais nulo não quebra');
}

// ── 2. popularTemas: por subespecialidade, "Todas" agrupa, preserva a escolha ──
{
  // "HAC" existe em Adrenal E em Endocrinologia Pediátrica — o caso real que
  // derruba qualquer busca por valor.
  const c = caixa({ acervoTotais: { temas: { 'Diabetes': ['A', 'B'], 'Tireoide': ['C'], 'Adrenal': ['HAC', 'Cushing'], 'Endocrinologia Pediátrica': ['Puberdade Precoce', 'HAC'] } } });
  c._docs['sim-tema'] = selectFalso();
  vm.runInContext('popularTemas("sim-tema","Diabetes")', c);
  const h = c._docs['sim-tema'].innerHTML;
  ok(/^<option value="">Sortear<\/option>/.test(h) && /<option value="A">A<\/option><option value="B">B<\/option>$/.test(h) && h.indexOf('optgroup') < 0, 'popularTemas: subespecialidade escolhida = Sortear + os temas dela, sem grupos — veio ' + h);
  vm.runInContext('popularTemas("sim-tema","")', c);
  const t = c._docs['sim-tema'].innerHTML;
  ok(/<optgroup label="Diabetes">.*<\/optgroup><optgroup label="Tireoide">.*<optgroup label="Adrenal">.*<optgroup label="Endocrinologia Pediátrica">/.test(t) && /data-sub="Tireoide">C</.test(t), 'popularTemas: "Todas" agrupa por subespecialidade na ordem canônica e marca a subespecialidade de cada tema — veio ' + t);
  // A subespecialidade vem da option SELECIONADA, não do valor: escolhe o HAC do grupo Pediátrica.
  const sel = c._docs['sim-tema'];
  const iHacPed = sel.options.findIndex((o) => o.value === 'HAC' && o.getAttribute('data-sub') === 'Endocrinologia Pediátrica');
  ok(iHacPed > 0 && sel.options.findIndex((o) => o.value === 'HAC') < iHacPed, 'sanidade: há dois HAC e o de Pediátrica vem depois do de Adrenal');
  sel.selectedIndex = iHacPed;
  ok(vm.runInContext('subDaOptionSelecionada("sim-tema")', c) === 'Endocrinologia Pediátrica', '⚠️ subDaOptionSelecionada: com dois temas de mesmo nome, devolve a subespecialidade da option ESCOLHIDA (Pediátrica), não a primeira que tem esse valor (Adrenal)');
  // Repopular em "Todas" (abrir o painel de novo) reencontra a MESMA option, no mesmo grupo.
  vm.runInContext('popularTemas("sim-tema","")', c);
  ok(sel.selectedIndex === iHacPed, '⚠️ popularTemas: ao repopular, a escolha não pula para o outro grupo de mesmo nome');
  // Trocar para a subespecialidade que também tem o tema mantém a escolha; para uma que não tem, volta a Sortear.
  vm.runInContext('popularTemas("sim-tema","Adrenal")', c);
  ok(sel.value === 'HAC', 'popularTemas: o tema escolhido é preservado quando segue na nova lista');
  vm.runInContext('popularTemas("sim-tema","Tireoide")', c);
  ok(sel.value === '' && sel.selectedIndex === 0, 'popularTemas: tema que não existe na nova subespecialidade volta a Sortear');
  ok(vm.runInContext('subDaOptionSelecionada("sim-tema")', c) === '', 'subDaOptionSelecionada: fora do modo "Todas" não há data-sub → vazio');
  ok(vm.runInContext('popularTemas("nao-existe","Diabetes"); subDaOptionSelecionada("nao-existe")', c) === '', 'popularTemas/subDaOptionSelecionada: select ausente não quebra');
}

// ── 3. Fiação no index.html ──────────────────────────────────────────────────
{
  ok(/<select id="sim-tema"><option value="">Sortear<\/option><\/select>/.test(html), 'OSCE: select de tema no formulário');
  ok(/<select id="rx-tema"><option value="">Sortear<\/option><\/select>/.test(html), 'Prescrição: select de tema no formulário');
  ok(/<select id="sim-sub">[^]*?<option>Lípides<\/option><option>Endocrinopatias<\/option>/.test(html) && /<select id="rx-sub">[^]*?<option>Lípides<\/option><option>Endocrinopatias<\/option>/.test(html),
    'Lípides e Endocrinopatias entram nas duas ferramentas (têm temas nos Resumos)');
  const i = html.lastIndexOf('startSim=function(){');
  const sim = html.slice(i, i + 3000);
  ok(/var tema=\(\(document\.getElementById\('sim-tema'\)\|\|\{\}\)\.value\|\|''\)\.trim\(\);/.test(sim), 'OSCE: lê o tema escolhido');
  ok(/\+\(tema\?' — tema obrigatório do caso: '\+tema:''\)\+', complexidade '/.test(sim), 'OSCE: o tema entra no pedido à IA como obrigatório');
  ok(/tema:tema\|\|'',level:level\}/.test(sim), 'OSCE: o tema fica no estado da simulação');
  ok(/if\(!sub&&tema\)sub=subDaOptionSelecionada\('sim-tema'\);/.test(sim), 'OSCE: com "Todas", a subespecialidade vem da option SELECIONADA (não de uma busca pelo valor)');
  ok(sim.indexOf('querySelector(') < 0 || sim.indexOf("option[value=") < 0, 'OSCE: sem busca de option por valor (dois temas de mesmo nome quebrariam)');
  ok(/esc\(simState\.sub\)\+\(simState\.tema\?' · '\+esc\(simState\.tema\):''\)\+' · '\+esc\(simState\.level\)/.test(html), 'OSCE: o relatório final mostra o tema');
  ok(/var usr='Caso \('\+simState\.sub\+\(simState\.tema\?', tema: '\+simState\.tema:''\)/.test(html), 'OSCE: o relatório da IA recebe o tema');
  // 🧨 A Prescrição tem DUAS definições: `function genRxCase(){` (morta) e o
  // override `genRxCase=function(){` (o que o botão usa). O tema vive no override.
  const iRx = html.lastIndexOf('genRxCase=function(){');
  ok(iRx > 0, 'Prescrição: o override genRxCase=function existe');
  const rx = html.slice(iRx, html.indexOf('evalRx=function', iRx));
  ok(/var tema=\(\(document\.getElementById\('rx-tema'\)\|\|\{\}\)\.value\|\|''\)\.trim\(\);/.test(rx), 'Prescrição (override): lê o tema escolhido');
  ok(/if\(!sub&&tema\)sub=subDaOptionSelecionada\('rx-tema'\);/.test(rx) && /sub=sub\|\|'Endocrinologia';/.test(rx), 'Prescrição (override): com "Todas", a subespecialidade vem da option selecionada; sem nada, "Endocrinologia"');
  ok(/'Caso clínico de '\+sub\+\(tema\?' — tema obrigatório do caso: '\+tema:''\)\+', complexidade '\+level\+', que demande prescrição \(incluindo dose e monitorização\)\. Português do Brasil\.'/.test(rx), 'Prescrição (override): o tema entra no pedido à IA');
  ok(/rxCase=\{caso:d\.caso,area:d\.area\|\|sub,tema:tema\|\|''\};/.test(rx) && /setText\('rx-case-tag',rxCase\.area\+\(rxCase\.tema\?' · '\+rxCase\.tema:''\)\);/.test(rx), 'Prescrição (override): o tema fica no caso e na etiqueta');
  ok(rx.indexOf("consumeTrial('rx')") >= 0 && rx.indexOf("consumeTrial('rx')") < rx.indexOf("'rx-tema'"), 'Prescrição (override): a cota da degustação continua antes de ler o tema');
  const rxMorta = corpo('genRxCase');
  ok(rxMorta.indexOf('rx-tema') < 0 && /FUNÇÃO MORTA/.test(html.slice(html.indexOf('function genRxCase(){') - 400, html.indexOf('function genRxCase(){'))), 'Prescrição: a função morta não carrega o tema (e está marcada como morta) — foi nela que o filtro entrou primeiro');
  ok(/if\(id==='sim'\|\|id==='rx'\)try\{popularTemasFerramentas\(\);\}catch\(e\)\{\}/.test(html), 'abrir OSCE/Prescrição preenche os temas');
  ok(/try\{popularTemasFerramentas\(\);\}catch\(e\)\{\} \/\/ temas do OSCE\/Prescrição: chegaram os Resumos/.test(corpo('refreshAfterRemoteState')), 'a chegada do conteúdo remoto preenche os temas');
  ok(/_simSub\.addEventListener\('change',function\(\)\{popularTemas\('sim-tema',_simSub\.value\);\}\);/.test(html) && /_rxSub\.addEventListener\('change',function\(\)\{popularTemas\('rx-tema',_rxSub\.value\);\}\);/.test(html), 'trocar a subespecialidade repopula o tema nas duas ferramentas');
}

// ── 4. O .sql do acervo entrega os temas ────────────────────────────────────
{
  ok(/create or replace function public\.endodirect_acervo_totais\(\)/.test(sql), 'sql: define endodirect_acervo_totais');
  ok(/'temas',\s+coalesce\(\(select jsonb_object_agg\(sub, lista\) from temas\), '\{\}'::jsonb\)/.test(sql), 'sql: chave temas por subespecialidade');
  ok(/with ordinality/.test(sql) && /jsonb_agg\(tema order by ord\)/.test(sql), 'sql: a ordem é a do array (a ordem dos Resumos)');
  ok(/v->>'privado' = 'true'/.test(sql) && /coalesce\(v->>'tipo','capitulo'\) = 'capitulo'/.test(sql) && /rascunho/.test(sql), 'sql: só capítulos privados publicados');
  ok(/diretrizes_temas/.test(sql) && /1000000 \+ o/.test(sql), 'sql: temas extras do professor entram depois dos capítulos');
  ok(/distinct on \(sub, lower\(tema\)\)/.test(sql), 'sql: sem repetição por caixa');
  ['provas', 'diretrizes', 'resumos', 'artigos', 'mapas', 'podcasts'].forEach((k) => ok(sql.indexOf("'" + k + "',") >= 0, 'sql: a chave ' + k + ' segue no acervo'));
}

// ── 5. Novidades: prometido ao aluno na resposta ao feedback ────────────────
{
  ok(/var WHATSNEW_VER='2026-09-tema-osce-prescricao';/.test(html), 'a versão das novidades subiu (a janela volta a aparecer uma vez)');
  ok(/Escolha o tema no OSCE e na Prescrição/.test(html), 'a janela de novidades anuncia o filtro de tema');
}

if (falhas.length) {
  console.error('test-tema-no-osce-e-prescricao: ' + falhas.length + ' falha(s)');
  falhas.forEach((f) => console.error('  ✗ ' + f));
  process.exit(1);
}
console.log('test-tema-no-osce-e-prescricao: ok (temas das duas fontes na ordem dos Resumos, selects nas duas ferramentas, tema no pedido e no relatório, sql com temas, novidades)');
