// Regressão da META DE LDL-c dentro da calculadora PREVENT.
//
// ⚠️ POR QUE ESTE TESTE EXISTE (27/08/2026). Pedido do professor: mostrar, na
// própria tela do PREVENT, a conduta e a meta de LDL-c da Diretriz Brasileira de
// Dislipidemias 2025 (SBC). A diretriz elege o PREVENT como ferramenta
// preferencial de estratificação, então o encaixe é legítimo — mas com uma
// armadilha que este teste existe para vigiar:
//
// 🧨 O ESCORE DÁ O PISO DA CATEGORIA, NÃO A CATEGORIA. Na SBC 2025 a faixa do
// escore é UMA das entradas. Diabetes, LDL-c e agravantes SOBEM o paciente de
// faixa e nada o desce: um escore de 2% com LDL-c de 195 é ALTO risco, não
// baixo. Ler só a faixa do escore entrega meta < 115 a quem precisa de < 70 —
// erro que não aparece na consulta seguinte, só no evento.
//
// Os números vêm da TABELA de valores referenciais da diretriz. ⚠️ A auditoria
// do acervo registrou que, no PDF de duas colunas, os bullets ao final da seção
// do MUITO ALTO risco saem com os valores do EXTREMO — quem for atualizar estes
// números tem de tirá-los da tabela ou do texto corrido, nunca daqueles bullets.
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const falhas = [];
const ok = (c, m) => { if (!c) falhas.push(m); };

function corpo(nome, fonte) {
  const src = fonte || html;
  const marca = '\nfunction ' + nome + '(';
  const i = src.indexOf(marca);
  if (i < 0) throw new Error('função não encontrada: ' + nome);
  const f = src.indexOf('\nfunction ', i + marca.length);
  return src.slice(i + 1, f < 0 ? src.length : f);
}
function trechoVar(nome, fonte) {
  const src = fonte || html;
  const i = src.indexOf('\nvar ' + nome + '=');
  if (i < 0) throw new Error('var não encontrada: ' + nome);
  // objeto multilinha: vai até a linha que fecha com `};`
  const fim = src.indexOf('\n};', i);
  return src.slice(i + 1, fim + 3);
}

function linhaVarSimples(nome, fonte) {
  const src = fonte || html;
  const i = src.indexOf('\nvar ' + nome + '=');
  if (i < 0) throw new Error('var não encontrada: ' + nome);
  return src.slice(i + 1, src.indexOf('\n', i + 1));
}
function mundo(fonte) {
  const ctx = vm.createContext({});
  vm.runInContext(
    'function esc(s){return String(s==null?"":s).replace(/[&<>"]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;","\\"":"&quot;"}[c];});}\n'
    + trechoVar('LDL_METAS', fonte) + '\n'
    + corpo('ldlFaixaEscore', fonte) + '\n'
    + linhaVarSimples('LDL_FAIXA_F', fonte) + '\n'
    + corpo('sbcCategoria', fonte) + '\n'
    + linhaVarSimples('LDL_COLS', fonte) + '\n'
    + corpo('ldlConduta', fonte) + '\n'
    + corpo('ldlQuadroHTML', fonte) + '\n'
    + corpo('ldlAlvoHTML', fonte), ctx);
  return ctx;
}
const M = mundo();
const H = 1, F = 0; // sexo: 1 = masculino
const paciente = (o) => Object.assign({ pv_sexo: String(F), pv_idade: '60', pv_dm: '0', pv_ct: '200', pv_hdl: '50' }, o);

// ── A tabela de metas é a da diretriz ──────────────────────────────────────
const T = M.LDL_METAS;
ok(T.baixo.ldl === 115 && T.intermediario.ldl === 100 && T.alto.ldl === 70
  && T.muitoalto.ldl === 50 && T.extremo.ldl === 40,
  '⚠️ as metas de LDL-c saíram da tabela da diretriz (115/100/70/50/40) — número de meta errado é dose errada');
ok([T.baixo, T.intermediario, T.alto, T.muitoalto, T.extremo].every((m) => m.nhdl === m.ldl + 30),
  'a meta de não-HDL-c tem de ser SEMPRE 30 mg/dL acima da de LDL-c da mesma faixa');
ok(T.baixo.apob === 100 && T.intermediario.apob === 90 && T.alto.apob === 70
  && T.muitoalto.apob === 55 && T.extremo.apob === 45,
  'a equivalência de ApoB da diretriz (100/90/70/55/45) mudou');
ok(T.baixo.red === 30 && T.intermediario.red === 30
  && [T.alto, T.muitoalto, T.extremo].every((m) => m.red === 50),
  'a redução mínima do LDL-c por faixa mudou: ≥30% no baixo/intermediário, ≥50% do alto para cima');

// ── A escada de categorias ─────────────────────────────────────────────────
ok(M.sbcCategoria(2, paciente({})).k === 'baixo', 'escore < 5% sem diabetes tinha de ser risco baixo');
ok(M.sbcCategoria(5, paciente({})).k === 'intermediario', '5% é o início do intermediário, não o fim do baixo');
ok(M.sbcCategoria(19.9, paciente({})).k === 'intermediario', '19,9% ainda é intermediário');
ok(M.sbcCategoria(20, paciente({})).k === 'alto', '20% é o início do risco alto');

// O que o escore NÃO vê, e que decide junto — cada uma destas é uma meta errada
// se for ignorada.
ok(M.sbcCategoria(2, paciente({ pv_ldl: '195' })).k === 'alto',
  '⚠️ escore de 2% com LDL-c 195 tem de ser ALTO (hipercolesterolemia familiar) — pela faixa do escore sairia meta < 115 em vez de < 70');
ok(M.sbcCategoria(2, paciente({ pv_ldl: '165' })).k === 'intermediario',
  'LDL-c de 160–189 sobe para intermediário mesmo com escore baixo');
ok(M.sbcCategoria(2, paciente({ pv_ldl: '159' })).k === 'baixo', 'LDL-c 159 ainda não sobe de faixa');
ok(M.sbcCategoria(2, paciente({ pv_dm: '1', pv_sexo: String(H), pv_idade: '49' })).k === 'intermediario',
  'diabetes em homem < 50 anos sobe o baixo para intermediário');
ok(M.sbcCategoria(2, paciente({ pv_dm: '1', pv_sexo: String(H), pv_idade: '50' })).k === 'alto',
  'diabetes em homem de 50 anos é risco ALTO — o corte da diretriz é 50 no homem');
ok(M.sbcCategoria(2, paciente({ pv_dm: '1', pv_sexo: String(F), pv_idade: '55' })).k === 'intermediario',
  'diabetes em mulher de 55 anos ainda é intermediário — o corte dela é 56, não 50');
ok(M.sbcCategoria(2, paciente({ pv_dm: '1', pv_sexo: String(F), pv_idade: '56' })).k === 'alto',
  'diabetes em mulher de 56 anos é risco ALTO');
// Vence sempre a MAIS ALTA que se aplica.
ok(M.sbcCategoria(2, paciente({ pv_dm: '1', pv_sexo: String(H), pv_idade: '40', pv_ldl: '200' })).k === 'alto',
  'com duas regras aplicáveis tem de valer a faixa MAIS ALTA');
ok(M.sbcCategoria(30, paciente({ pv_ldl: '80' })).k === 'alto',
  'LDL-c dentro da meta não DESCE a faixa de quem tem escore ≥ 20% — nada desce de faixa');

// Sem LDL-c informado o bloco continua funcionando (o campo é opcional).
ok(M.sbcCategoria(8, paciente({})).k === 'intermediario', 'sem LDL-c informado a faixa ainda sai do escore');
ok(/escore de 5 a < 20%/.test(M.sbcCategoria(8, paciente({})).motivo),
  'o motivo tem de dizer QUAL regra decidiu — sem ele o médico acredita em vez de conferir');

// ── O bloco na tela ────────────────────────────────────────────────────────
{
  const h = M.ldlAlvoHTML(2, paciente({ pv_ldl: '195' }));
  ok(/CATEGORIA SBC · ALTO/.test(h) && /&lt; 70/.test(h), 'o bloco não mostrou a meta da faixa em que o paciente caiu');
  ok(/hipercolesterolemia familiar/.test(h), 'o bloco não disse por que o paciente é alto risco');
  ok(/\+125 acima da meta/.test(h), 'o bloco não disse a distância medida até a meta (195 − 70)');
  ok(/estatina de alta potência/.test(h), 'a conduta do alto risco (estatina de alta potência ou + ezetimiba) sumiu');
  // ⚠️ Achado ao OLHAR a tela renderizada, não no teste: o alto risco exibia o
  // gatilho dos 30 mg/dL. Esse gatilho é regra do baixo e do intermediário; no
  // alto se medica desde o diagnóstico, e a marca sugeria esperar a distância
  // crescer — o contrário da conduta logo abaixo.
  ok(!/≥ 30 · trata/.test(h),
    '⚠️ o gatilho dos 30 mg/dL voltou a aparecer no ALTO risco, onde se trata desde já — a tela contradiz a própria conduta');
}
{
  const h = M.ldlAlvoHTML(8, paciente({ pv_ldl: '145' })); // intermediário, 45 acima da meta de 100
  ok(/≥ 30 · trata/.test(h), 'no intermediário, distância ≥ 30 mg/dL tinha de acender o gatilho de tratamento');
  const perto = M.ldlAlvoHTML(8, paciente({ pv_ldl: '115' })); // 15 acima: fora da meta, sem gatilho
  ok(/\+15 acima da meta/.test(perto) && !/≥ 30 · trata/.test(perto),
    'a 15 mg/dL acima da meta o intermediário está fora da meta mas AINDA NÃO tem gatilho farmacológico');
}
{
  // não-HDL-c sai de CT − HDL, que já são campos do escore.
  const h = M.ldlAlvoHTML(2, paciente({ pv_ct: '260', pv_hdl: '40', pv_ldl: '100' }));
  ok(/>220<\/b>/.test(h), 'o não-HDL-c calculado (260 − 40 = 220) não apareceu');
}
{
  const h = M.ldlAlvoHTML(2, paciente({ pv_ldl: '90' }));
  ok(/na meta/.test(h), 'LDL-c 90 no risco baixo (meta < 115) tinha de aparecer como na meta');
  ok(/30 mg\/dL ou mais acima da meta/.test(h),
    '⚠️ sumiu o GATILHO do baixo/intermediário: ali não se medica por estar acima da meta, e sim por persistir ≥ 30 acima dela');
}

// ── O QUADRO: a escada inteira, e a linha do paciente marcada ─────────────
// Pedido do professor em 28/08: "deixa o quadro das metas ocupando toda a tela e
// bem didático". Mostrar só a meta de quem está na tela responde ao caso;
// mostrar a escada ENSINA — e é ela que substitui a antiga lista de "sobe de
// faixa", que vivia como parágrafo de rodapé.
{
  const h = M.ldlAlvoHTML(12.7, paciente({ pv_dm: '1', pv_sexo: String(F), pv_idade: '62' }));
  ok((h.match(/adm-table-row/g) || []).length === 5,
    '⚠️ o quadro deixou de mostrar as CINCO categorias — sem a escada inteira ele volta a responder o caso sem ensinar nada');
  ['BAIXO', 'INTERMEDIÁRIO', 'ALTO', 'MUITO ALTO', 'EXTREMO'].forEach((r) => {
    ok(h.indexOf(r) >= 0, 'o quadro perdeu a linha do risco ' + r);
  });
  ['115', '100', '70', '50', '40'].forEach((n) => {
    ok(h.indexOf('&lt; ' + n) >= 0, 'o quadro perdeu a meta de LDL-c < ' + n);
  });
  ok(/QUANDO SE APLICA/.test(h) && /escore ≥ 20%/.test(h) && /doença aterosclerótica estabelecida/.test(h),
    '⚠️ sumiu a coluna que diz QUANDO cada faixa se aplica — sem ela são cinco linhas de números sem uso clínico');
  // A linha do paciente: fundo E etiqueta. Cor sozinha some ao imprimir, para
  // quem enxerga mal, e no meio das outras tarjas coloridas da tela.
  ok(/este paciente/.test(h), '⚠️ a linha do paciente deixou de ser identificada dentro do quadro');
  ok(/background:rgba\(255,255,255,\.05\)/.test(h),
    'a linha do paciente perdeu o realce de fundo — só a etiqueta é fácil de pular num quadro de cinco linhas');
  // As duas faixas fora do alcance do escore ficam marcadas na própria linha.
  ok(/fora do alcance do escore/.test(h) && /não saem deste escore/.test(h),
    '⚠️ muito alto e extremo deixaram de ser marcados como fora do alcance do escore');
  // Seis colunas não cabem em 360 px: o quadro rola em vez de espremer o número.
  ok(/overflow-x:auto/.test(h) && /min-width:56rem/.test(h),
    'o quadro deixou de rolar no celular — espremido, quebra os números, que são o conteúdo');
  // ⚠️ `.adm-table-row` traz `min-height:58px` da casa, dimensionada para linha
  // com botão. Sem soltar a amarra, cinco linhas de texto ocupam meia tela em
  // espaço vazio e o quadro deixa de ser consultável de relance.
  ok(/min-height:0/.test(h),
    'as linhas do quadro voltaram à altura mínima da tabela do painel — quadro de consulta não pode ter meia tela de vão');
}
{
  // O quadro ocupa a tela; a PROSA não. Linha de texto de 1.500 px não se lê.
  const h = M.ldlAlvoHTML(2, paciente({ pv_ldl: '90' }));
  ok(!/max-width:52rem/.test(h), 'o quadro voltou a ficar preso à largura antiga em vez de ocupar a tela');
  // ⚠️ "pelo menos N" autoriza apagar de um dos blocos sem o teste ver — foi o
  // furo de 26/08 se repetindo. Cada bloco de prosa é cobrado por nome.
  ok(/line-height:1\.55;max-width:60rem/.test(h), 'a CONDUTA perdeu a medida de leitura');
  ok(/line-height:1\.5;max-width:60rem/.test(h), 'as RESSALVAS perderam a medida de leitura');
  ok(/margin-top:\.6rem;max-width:60rem/.test(h), 'a linha do MEDIDO perdeu a medida de leitura');
  // 🧨 Aqui a largura vinha num SEGUNDO atributo `style` no mesmo elemento, que o
  // navegador ignora em silêncio: o teste passava numa marcação que não valia
  // nada. Um só `style` por elemento — achado por mutação em 28/08.
  ok(!/<div[^>]*style="[^"]*"[^>]*style="/.test(h),
    '⚠️ elemento com DOIS atributos style: o segundo é ignorado e o estilo não vale');
}
{
  // Ressalva que não se aplica é ruído. A escada saiu do rodapé (está no quadro);
  // aqui ficam só as duas coisas que o quadro NÃO diz.
  const alto = M.ldlAlvoHTML(2, paciente({ pv_ldl: '195' }));
  ok(!/fontes divergem/.test(alto), 'a divergência SBC × SBD só existe no BAIXO risco; mostrá-la no alto é ruído');
  ok(!/Procure <b>ativamente<\/b>/.test(alto),
    'procurar agravante é conselho do baixo/intermediário — no alto o paciente já está no topo do que o escore alcança');
  const baixo = M.ldlAlvoHTML(2, paciente({}));
  ok(/fontes divergem/.test(baixo) && /Procure <b>ativamente<\/b>/.test(baixo),
    'no BAIXO risco as duas ressalvas TÊM de aparecer — são elas que evitam subclassificar');
  ok(/não saem deste escore/.test(alto) && /não saem deste escore/.test(baixo),
    '⚠️ o aviso de que muito alto e extremo não saem do escore tem de aparecer em TODAS as faixas');
}
{
  // ⚠️ DUAS MEDIDAS COM O MESMO NOME DÃO DUAS RESPOSTAS. A tarja do escore dizia
  // "DASCV moderado" e o bloco dizia "RISCO ALTO" — o professor olhou a tela em
  // 27/08 e perguntou qual valia. As duas estão certas e são coisas diferentes:
  // faixa do escore × categoria da SBC. Cada uma tem de dizer O QUE É, e a tela
  // tem de dizer QUAL DECIDE — senão o médico escolhe uma das duas no chute.
  const h = M.ldlAlvoHTML(13.4, paciente({ pv_dm: '1', pv_sexo: String(F), pv_idade: '62' }));
  ok(/CATEGORIA SBC · ALTO/.test(h),
    '⚠️ o bloco voltou a rotular sua medida como "risco", o mesmo nome da tarja do escore — duas respostas para a mesma pergunta');
  ok(/a faixa do escore é moderada; sobe por diabetes em mulher ≥ 56 anos/.test(h),
    '⚠️ a tela não reconcilia as duas medidas: sem isso "moderado" em cima e "ALTO" embaixo lê como defeito');
  ok(/é ela que define a meta e a conduta/.test(h),
    '⚠️ sumiu a frase que diz QUAL das duas decide — é ela que tira a dúvida do professor');
  const im = M.ldlAlvoHTML(8, paciente({}));
  ok(/é o “moderado” da faixa do escore/.test(im),
    'no intermediário falta dizer que ele é o mesmo "moderado" da faixa do escore');
  const coerente = M.ldlAlvoHTML(25, paciente({}));
  ok(!/a faixa do escore é/.test(coerente) && /é ela que define a meta e a conduta/.test(coerente),
    'quando escore e categoria coincidem não há reconciliação a fazer, mas a frase de quem decide fica');
}
{
  // A TARJA do escore também tem de dizer o que é. "DASCV moderado" era um
  // veredito; "faixa moderada do escore" é uma medida com nome.
  const i = html.indexOf("{id:'prevent',name:'Risco CV — PREVENT (AHA)'");
  const bloco = html.slice(i, html.indexOf("{id:'prevent30'", i));
  ok(/em 10 anos · faixa '\+cat\.t\+' do escore/.test(bloco),
    '⚠️ a tarja voltou a chamar a faixa do escore de veredito ("DASCV moderado") — é ela que colide com a categoria da SBC');
  ok(!/'DASCV '\+cat\.t/.test(bloco), 'a tarja voltou a abrir com a palavra da faixa em vez do número');
  // A frase é "faixa X do escore": X concorda com "faixa". "faixa moderado" é
  // frase capenga em tela clínica, e frase capenga tira a autoridade do número
  // que está do lado.
  ok(/\{t:'baixa',/.test(bloco) && /\{t:'moderada',/.test(bloco) && /\{t:'alta',/.test(bloco),
    'a faixa do escore voltou ao masculino na tarja — a frase vira "faixa moderado do escore"');
  const F2 = M.ldlAlvoHTML(13.4, paciente({ pv_dm: '1', pv_sexo: String(F), pv_idade: '62' }));
  ok(!/faixa do escore é moderado;/.test(F2), 'o bloco voltou a escrever "a faixa do escore é moderado"');
}
// ── A fiação: a calculadora de 10 anos tem de CHAMAR o bloco ───────────────
// ⚠️ Testar `ldlAlvoHTML` isolada prova que a função funciona, não que alguém a
// usa. Sem esta asserção, apagar o `extra:` do PREVENT deixava a tela sem meta
// nenhuma e o teste seguia verde. (Furo achado por mutação em 27/08.)
{
  const i = html.indexOf("{id:'prevent',name:'Risco CV — PREVENT (AHA)'");
  const bloco = html.slice(i, html.indexOf("{id:'prevent30'", i));
  ok(i > 0 && /extra:function\(s,v\)\{try\{return ldlAlvoHTML\(s,v\);\}/.test(bloco),
    '⚠️ o PREVENT de 10 anos parou de chamar o bloco de meta de LDL — a tela volta a mostrar só o risco');
  ok(/id:'pv_ldl'/.test(bloco), 'sumiu o campo opcional de LDL-c, que é o que permite reclassificar e dizer se está na meta');
}

// ── A calculadora de 30 anos não deriva meta ───────────────────────────────
{
  const i = html.indexOf("{id:'prevent30'");
  const bloco = html.slice(i, i + 3000);
  ok(!/ldlAlvoHTML/.test(bloco),
    '⚠️ a calculadora de 30 anos passou a derivar meta de LDL-c — a diretriz diz que NÃO há limiares definidos para categorizar por essa estimativa');
  ok(/NÃO há limiares definidos/.test(bloco), 'a nota do PREVENT 30 anos tem de dizer por que não há meta ali');
}

// ── Mutação: cada uma destas devolve uma meta errada ───────────────────────
function mutante(de, para) {
  const alvo = corpo('sbcCategoria');
  if (alvo.indexOf(de) < 0) throw new Error('mutação não se aplica (o código mudou): ' + de);
  return mundo(html.replace(alvo, alvo.replace(de, para)));
}
// Sem a regra do ≥190, o 195 cai na regra seguinte (160–189) e vira
// INTERMEDIÁRIO: meta < 100 em quem precisa de < 70. Errar por uma faixa é o
// modo de falha realista aqui, não errar por três.
ok(mutante("if(isFinite(ldl)&&ldl>=190)", "if(false)").sbcCategoria(2, paciente({ pv_ldl: '195' })).k !== 'alto',
  'MUTAÇÃO: sem a regra do LDL ≥ 190, a hipercolesterolemia familiar deixaria de ser alto risco — o teste não veria');
ok(mutante("idade>=56", "idade>=50").sbcCategoria(2, paciente({ pv_dm: '1', pv_sexo: '0', pv_idade: '52' })).k === 'alto',
  'MUTAÇÃO: trocar o corte da mulher de 56 para 50 devia mudar a faixa — o teste não vigia o corte por sexo');
ok(mutante("escore>=5", "escore>=15").sbcCategoria(8, paciente({})).k === 'baixo',
  'MUTAÇÃO: mexer no corte de 5% devia mudar a faixa — o teste não vigia o piso do intermediário');
{
  const mut = mundo(html.replace(trechoVar('LDL_METAS'), trechoVar('LDL_METAS').replace('ldl:70', 'ldl:75')));
  ok(mut.LDL_METAS.alto.ldl === 75 && !/LDL-c &lt; 70/.test(mut.ldlAlvoHTML(25, paciente({}))),
    'MUTAÇÃO: mexer no número da meta devia aparecer na tela — o teste não lê a meta que o paciente recebe');
}

// ── Pendências: as tarefas de revisão contínua saíram (pedido de 27/08) ────
ok(!/admRevTasksHTML/.test(html),
  'a função das tarefas de revisão contínua voltou às Pendências — o professor pediu para tirá-las');
ok(!/Revisar a seção de Diretrizes|Revisar a trilha do/.test(html),
  'os cards de revisão contínua voltaram às Pendências');
ok(!/data-pend-goto/.test(html),
  'sobrou o listener dos cards removidos — código morto ouvindo botão que não existe');
ok(/Sua central de revisão: as <b>questões da Questão do Dia<\/b>/.test(html),
  'o texto de abertura das Pendências ainda anuncia tarefas que não existem mais');
ok(/admPendSubhead\('Questão do Dia · aguardando aprovação'/.test(html),
  'a seção da Questão do Dia, que é a que fica, saiu junto sem querer');

if (falhas.length) { console.error('✗ ' + falhas.length + ' falha(s):\n - ' + falhas.join('\n - ')); process.exit(1); }
console.log('✓ meta de LDL no PREVENT: faixa sobe por diabetes/LDL, metas da tabela da SBC, gatilho de 30 mg/dL, e o escore não vira meta de 30 anos');
