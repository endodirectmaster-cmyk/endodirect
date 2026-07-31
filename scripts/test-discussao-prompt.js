// O que vai (e o que NÃO vai) no prompt da discussão completa.
//
// O defeito que este teste existe para pegar: figuras e tabelas eram anexadas
// no FIM do texto e o truncamento por caractere cortava justamente elas. Num
// artigo de 8.100 palavras o bloco das tabelas ficava inteiro fora do prompt, e
// a discussão saía dizendo "a Tabela 1 (referida no artigo) sintetiza…" — o
// modelo só via a menção no corpo, nunca a tabela. O prompt mandava reproduzir
// tabelas cujo conteúdo não tinha sido enviado.
//
// O segundo: o rodapé de procedência dizia "N tabela(s) reproduzida(s) do
// artigo" contando o que o ARTIGO tinha, não o que a discussão trouxe. Rótulo
// que promete o que não está no texto foi removido a pedido do professor.
'use strict';
const fs = require('fs');
const path = require('path');
const { fullTextForPrompt } = require('../lib/fulltext');

let bad = 0;
const ok = (nome, cond, det) => { if (cond) return; bad++; console.log('  ✗ ' + nome + (det ? ' — ' + det : '')); };

// Artigo longo o bastante para o corpo sozinho estourar o teto.
const paragrafo = 'Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod. ';
const ft = {
  pmcid: 'PMC13381830',
  palavras: 8109,
  licenca: { cc: 'CC BY' },
  secoes: Array.from({ length: 12 }, (_, i) => ({
    titulo: 'Seção ' + (i + 1),
    paragrafos: Array.from({ length: 40 }, () => paragrafo.repeat(3))
  })),
  figuras: [
    { rotulo: 'Figura 1', legenda: 'Distribuição anatômica do receptor de GLP-1.' },
    { rotulo: 'Figura 2', legenda: 'Interação entre determinantes host-microbiota-fármaco.' }
  ],
  tabelas: [
    { rotulo: 'Tabela 1', legenda: 'Composição da microbiota sob GLP-1 RA.', markdown: '| Estudo | n | Achado |\n| --- | --- | --- |\n| MARCA-T1 | 52 | β-diversidade divergiu |', nota: 'AGCC: ácidos graxos de cadeia curta.' },
    { rotulo: 'Tabela 2', legenda: 'Assinaturas microbianas da resposta.', markdown: '| Táxon | Grupo |\n| --- | --- |\n| MARCA-T2 | respondedor |', nota: '' },
    { rotulo: 'Tabela 3', legenda: 'Determinantes multifatoriais.', markdown: '| Fator | Peso |\n| --- | --- |\n| MARCA-T3 | alto |', nota: '' },
    { rotulo: 'Tabela 4', legenda: 'Controle de confundimento.', markdown: '| Estudo | Ajuste |\n| --- | --- |\n| MARCA-T4 | ausente |', nota: '' }
  ]
};

// ---- 1. ⚠️ O CORPO É QUE CEDE ESPAÇO, NUNCA AS TABELAS -----------------------
{
  const TETO = 20000;
  const p = fullTextForPrompt(ft, TETO);
  ok('o corpo do artigo entra', p.indexOf('## Seção 1') >= 0);
  ok('o corpo foi truncado (o cenário é de estouro)', p.indexOf('[…texto truncado]') > 0);
  ['MARCA-T1', 'MARCA-T2', 'MARCA-T3', 'MARCA-T4'].forEach((m) => {
    ok('a ' + m + ' chegou ao prompt', p.indexOf(m) > 0);
  });
  ok('as legendas das figuras chegaram', p.indexOf('Distribuição anatômica') > 0 && p.indexOf('host-microbiota') > 0);
  ok('as notas de rodapé da tabela chegaram', p.indexOf('ácidos graxos de cadeia curta') > 0);
  ok('o prompt respeita o teto com folga razoável', p.length <= TETO + 2000, 'saiu com ' + p.length);
}

// ---- 2. sem estouro, nada é cortado -----------------------------------------
{
  const curto = Object.assign({}, ft, { secoes: [{ titulo: 'Métodos', paragrafos: [paragrafo] }] });
  const p = fullTextForPrompt(curto, 60000);
  ok('sem estouro não trunca', p.indexOf('[…texto truncado]') < 0);
  ok('sem estouro as tabelas continuam lá', p.indexOf('MARCA-T4') > 0);
}

// ---- 3. anexos gigantescos não zeram o corpo --------------------------------
{
  const inchado = Object.assign({}, ft, {
    tabelas: Array.from({ length: 60 }, (_, i) => ({
      rotulo: 'Tabela ' + (i + 1), legenda: 'x'.repeat(400), markdown: 'y'.repeat(400), nota: ''
    }))
  });
  const p = fullTextForPrompt(inchado, 20000);
  ok('resta corpo mesmo com anexos enormes', p.indexOf('## Seção 1') >= 0 && p.indexOf('Lorem ipsum') > 0);
}

// ---- 4. ⚠️ NENHUM RODAPÉ DE PROCEDÊNCIA NO MARKDOWN GRAVADO -----------------
{
  const src = fs.readFileSync(path.join(__dirname, '..', 'lib', 'discussao.js'), 'utf8');
  const codigo = src.replace(/^\s*\/\/.*$/gm, '');
  ok('lib/discussao.js não monta rodapé', codigo.indexOf('Discussão elaborada sobre') < 0);
  ok('lib/discussao.js não conta tabelas para o texto', !/tabela\(s\) reproduzida\(s\)/.test(codigo));
  // O gravado é o texto da IA com as tabelas do ARTIGO coladas no lugar dos
  // marcadores — e nada além disso. Nenhum rodapé, nenhum selo, nenhum apêndice.
  ok('o markdown gravado é o da IA com as tabelas do artigo', /markdown:\s*comTabelas\.markdown\s*,/.test(codigo));
  // ⚠️ A tabela do artigo não pode servir de enchimento para uma discussão curta:
  // a checagem de tamanho mínimo roda no texto da IA, ANTES da colagem.
  // (procura a CHAMADA, não a declaração da função, que vem antes no arquivo)
  ok('a colagem acontece depois da checagem de tamanho',
     codigo.indexOf("motivo: 'resposta_curta'") < codigo.indexOf('= inserirTabelas(md'));
}

// ---- 5. ⚠️ O CABEÇALHO DO CARD NÃO ANUNCIA TABELA NEM FIGURA ---------------
{
  const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  const i = html.indexOf('function muralDiscussaoHTML');
  const bloco = html.slice(i, i + 600);
  ok('o resumo do card não tem selo de meta', bloco.indexOf('mural-disc-meta') < 0);
  ok('o card continua anunciando a discussão', bloco.indexOf('Discussão completa do artigo') > 0);
  ok('nenhum código preenche o selo', html.indexOf("querySelector('.mural-disc-meta')") < 0);
}

// ---- 6. ⚠️ A TABELA VEM DO ARTIGO, NÃO DA IA -------------------------------
// Decisão do professor (30/07): "reproduzir fiel ao artigo". Ele viu uma league
// table de metanálise em rede sair deformada — a IA reescreveu a comparação par
// a par como tabela comum e INVENTOU um cabeçalho (`| _D_ | _A_ | _C_ | _B_ |`)
// que o artigo não tem: ali o rótulo dos tratamentos vive na DIAGONAL.
//
// A instrução antiga mandava "reproduzir em markdown" e "traduzir os cabeçalhos"
// — ou seja, mandava o modelo REESCREVER, que é justamente onde ele erra. Agora
// a IA só marca o LUGAR e a colagem é do servidor.
{
  const { montarPrompt } = require('../lib/discussao');
  const artigo = { titulo: 'T', fonte: 'F', tipo: 'Artigo de Revisão' };
  const comTabela = montarPrompt(artigo, ft);
  ok('manda marcar o lugar, não copiar', /escreva o marcador sozinho numa linha/.test(comTabela));
  ok('proíbe copiar, traduzir e reescrever', /NÃO copie, não traduza e não reescreva a tabela/.test(comTabela));
  ok('explica por que copiar à mão dá errado', /vive na diagonal/i.test(comTabela));
  ok('cada tabela chega numerada', /\[\[TABELA:1\]\]/.test(comTabela) && /\[\[TABELA:4\]\]/.test(comTabela));
  // ⚠️ A instrução de TRADUZIR não pode voltar: traduzir é reescrever.
  ok('não manda mais traduzir a tabela', comTabela.indexOf('A tabela sai em português') < 0);

  const semTabela = montarPrompt(artigo, Object.assign({}, ft, { tabelas: [] }));
  ok('sem tabela, não fala em marcador', semTabela.indexOf('[[TABELA:') < 0);
  ok('sem tabela, diz que não há', /não tem tabelas extraíveis/.test(semTabela));
}

// ---- 6b. ⚠️ A SUBSTITUIÇÃO DO MARCADOR --------------------------------------
{
  const { inserirTabelas } = require('../lib/discussao');
  // A league table exata que o professor mostrou: rótulos na diagonal.
  const league = {
    rotulo: 'Table 8',
    legenda: 'Pairwise relative effects on TPOAb: mean difference (MD, IU/mL).',
    markdown: '| D | 57,02 (50,05;63,99) | 72,71 (27,89;117,53) |\n|---|---|---|\n| -57,02 (-63,99;-50,05) | A | 15,69 (-28,65;60,03) |',
    nota: 'A = MMI; B = Xiaoyao + MMI; C = Huagan + MMI; D = Huotan Jiangni + MMI.'
  };
  const r = inserirTabelas('## Achados\n\nA tabela abaixo traz as comparações.\n\n[[TABELA:1]]\n\nLê-se nela que…', [league]);
  ok('o marcador vira a tabela do artigo', r.markdown.indexOf('57,02 (50,05;63,99)') > 0, r.markdown);
  ok('nenhum marcador sobra na tela', r.markdown.indexOf('[[TABELA') < 0, r.markdown);
  ok('a legenda original acompanha', r.markdown.indexOf('Table 8. Pairwise relative effects') > 0, r.markdown);
  // ⚠️ A NOTA É O QUE DÁ SENTIDO ÀS LETRAS DA DIAGONAL. Sem ela, "A", "B", "C" e
  // "D" não significam nada — foi metade da estranheza que o professor relatou.
  ok('a nota de rodapé acompanha', r.markdown.indexOf('A = MMI; B = Xiaoyao') > 0, r.markdown);
  ok('a prosa em volta é preservada', r.markdown.indexOf('A tabela abaixo traz') > 0 && r.markdown.indexOf('Lê-se nela') > 0);
  ok('registra qual tabela entrou', r.usadas.length === 1 && r.usadas[0] === 1, JSON.stringify(r.usadas));

  // Marcador para tabela que não existe não pode virar texto na tela.
  const inval = inserirTabelas('Texto.\n\n[[TABELA:9]]\n\nMais texto.', [league]);
  ok('marcador inválido some', inval.markdown.indexOf('[[TABELA') < 0 && inval.usadas.length === 0, inval.markdown);
  ok('e o texto em volta sobrevive', inval.markdown.indexOf('Texto.') === 0 && inval.markdown.indexOf('Mais texto.') > 0);

  // Marcador no meio de uma frase: não vira tabela, mas também não fica à vista.
  const meio = inserirTabelas('Como se vê em [[TABELA:1]] adiante.', [league]);
  ok('marcador no meio da frase não fica visível', meio.markdown.indexOf('[[TABELA') < 0, meio.markdown);

  // Sem marcador nenhum, o texto passa intacto.
  const semMarca = inserirTabelas('## Achados\n\nSó prosa aqui.', [league]);
  ok('sem marcador, o texto não é tocado', semMarca.markdown === '## Achados\n\nSó prosa aqui.' && semMarca.usadas.length === 0);
  ok('lista de tabelas vazia não quebra', inserirTabelas('a\n\n[[TABELA:1]]\n\nb', []).markdown.indexOf('[[TABELA') < 0);
}

// ---- 7. ⚠️ A COLUNA DE REFERÊNCIAS NÃO CHEGA À IA -------------------------
// Pedido do professor (29/07): a coluna com os números da bibliografia do artigo
// — "(122, 124, 126)" — é ruído para o aluno, porque a discussão não publica a
// lista de referências. Cortada na conversão da tabela, não no prompt: se a IA
// nunca vê a coluna, não tem como reproduzi-la nem copiar os números.
{
  const { tableToMarkdown } = require('../lib/fulltext');
  const tab = (cabecalhos) => '<table><thead><tr>' +
    cabecalhos.map((h) => '<th>' + h + '</th>').join('') +
    '</tr></thead><tbody><tr>' +
    cabecalhos.map((h, i) => '<td>' + (i === cabecalhos.length - 1 ? '(122, 124, 126)' : 'valor-' + i) + '</td>').join('') +
    '</tr></tbody></table>';

  ['Reference', 'References', 'Referência', 'Referencias', 'Ref.', 'Refs', 'Ref No.', 'Citations'].forEach((h) => {
    const md = tableToMarkdown(tab(['Domínio', 'Determinantes', h]));
    ok('coluna "' + h + '" é descartada', md.indexOf(h) < 0 && md.indexOf('(122, 124, 126)') < 0, md);
    ok('o resto da tabela "' + h + '" sobrevive', md.indexOf('Domínio') > 0 && md.indexOf('valor-0') > 0);
    ok('o separador acompanha a largura nova ("' + h + '")', md.indexOf('|---|---|\n') > 0, md);
  });

  // "Study"/"Estudo" NÃO sai: ali o número é o rótulo da linha.
  ['Study', 'Estudo'].forEach((h) => {
    const md = tableToMarkdown('<table><thead><tr><th>' + h + '</th><th>Achado</th></tr></thead>' +
      '<tbody><tr><td>(37)</td><td>substituição metformin-liraglutide</td></tr></tbody></table>');
    ok('coluna "' + h + '" é preservada', md.indexOf(h) > 0 && md.indexOf('(37)') > 0, md);
  });

  // Tabela de 2 colunas em que uma é referência deixa de ser tabela.
  ok('sobrar 1 coluna não vira tabela',
     tableToMarkdown('<table><thead><tr><th>Achado</th><th>Reference</th></tr></thead>' +
       '<tbody><tr><td>x</td><td>(9)</td></tr></tbody></table>') === '');
}

// ---- 8. ⚠️ A TABELA DE ESTUDOS INCLUÍDOS NÃO CHEGA À IA --------------------
// Pedido do professor (30/07): "exclui essas tabelas assim dos estudos de
// metanálises". Numa metanálise de HIIT vs MICT, a discussão reproduziu a tabela
// de 8 colunas × 20 estudos, com o protocolo de cada braço por extenso. No card
// vira um bloco com rolagem horizontal que ninguém lê.
//
// ⚠️ O QUE ESTE BLOCO PROTEGE DOS DOIS LADOS: as tabelas de RESULTADO da
// metanálise (efeito combinado, subgrupo, heterogeneidade) são o ponto da
// discussão e TÊM de passar — inclusive quando trazem coluna de estudo. Uma regra
// que corte "toda tabela com coluna Study" mata justamente o que interessa.
{
  const { tableToMarkdown, ehTabelaDeEstudosIncluidos } = require('../lib/fulltext');
  const mk = (cabecalhos, linhas) => '<table><thead><tr>' +
    cabecalhos.map((h) => '<th>' + h + '</th>').join('') + '</tr></thead><tbody>' +
    linhas.map((l) => '<tr>' + l.map((c) => '<td>' + c + '</td>').join('') + '</tr>').join('') +
    '</tbody></table>';

  // A tabela exata do artigo que o professor mostrou (cabeçalhos do JATS, em inglês).
  const caracteristicas = ['Study', 'Sample size', 'Age', 'Sex/BMI', 'Duration/frequency', 'HIIT protocol', 'MICT protocol', 'Outcomes'];
  const linhasEstudo = Array.from({ length: 20 }, (_, i) =>
    ['Ru X (' + (52 + i) + ')', '13/13', '18-22', 'Male; BMI 28.72/29.42', '8 weeks; 5 sessions/week',
     'Body-weight circuit, 4 x 30 s; 85%-95% HRmax', 'Running, 60%-70% HRmax, 30-35 min', 'MARCA-CARACT']);
  ok('a tabela de características dos estudos é descartada',
     tableToMarkdown(mk(caracteristicas, linhasEstudo)) === '',
     tableToMarkdown(mk(caracteristicas, linhasEstudo)).slice(0, 150));
  ok('o conteúdo dela não vaza por outro caminho',
     tableToMarkdown(mk(caracteristicas, linhasEstudo)).indexOf('MARCA-CARACT') < 0);

  // ⚠️ Variações reais — inclusive as que NENHUM vocabulário prevê. As três
  // últimas são as tabelas de verdade que estavam gravadas no banco: elas dizem
  // "População", "Nº de pacientes", "Metodologia", e não "sample size"/"age".
  // A primeira versão desta regra exigia 3 palavras de uma lista de
  // características e deixava passar justamente essas.
  const linhas7 = (n) => Array.from({ length: n }, (_, i) => Array.from({ length: 7 }, (_, j) => 'v' + i + j));
  [
    ['Study', 'Country', 'Design', 'Participants', 'Intervention', 'Comparator', 'Outcomes'],
    ['First author', 'n', 'Age', 'Female (%)', 'Follow-up', 'Dose', 'Primary outcome'],
    ['Estudo', 'Amostra', 'Idade', 'Sexo', 'Duração', 'Intervenção', 'Desfechos'],
    ['Study', 'Random sequence', 'Allocation concealment', 'Blinding', 'Incomplete data', 'Selective reporting', 'Overall'],
    ['Estudo', 'População', 'GLP-1 RA', 'Método de microbioma', 'Principais achados', 'Associação com resposta', 'Limitações'],
    ['Autor', 'Ano', 'Nº de pacientes', 'Condição patológica', 'Metodologia', 'Transportadores', 'Resultados']
  ].forEach((c) => {
    ok('descarta "' + c.slice(0, 3).join('/') + '…"', tableToMarkdown(mk(c, linhas7(6))) === '', c.join('|'));
  });

  // ⚠️ O QUE TEM DE SOBREVIVER.
  const resultado = mk(['Outcome', 'Studies', 'SMD', '95% CI', 'I²'],
    [['VO2max', '12', '0.42', '0.21 to 0.63', '48%']]);
  ok('tabela de efeito combinado sobrevive', tableToMarkdown(resultado).indexOf('SMD') > 0, tableToMarkdown(resultado));
  const porEstudo = mk(['Study', 'Effect', '95% CI', 'Weight'], [['Ru X', '0.51', '0.10 to 0.92', '8.1%']]);
  ok('tabela de resultado COM coluna de estudo sobrevive (só 4 colunas)',
     tableToMarkdown(porEstudo).indexOf('0.51') > 0, tableToMarkdown(porEstudo));
  const subgrupo = mk(['Subgroup', 'Studies', 'SMD', '95% CI', 'p interaction'],
    [['Supervised', '7', '0.55', '0.30 to 0.80', '0.04']]);
  ok('tabela de subgrupo sobrevive', tableToMarkdown(subgrupo).indexOf('p interaction') > 0);
  // Tabela clínica larga SEM coluna de estudo (ex.: doses por fármaco) sobrevive.
  const doses = mk(['Fármaco', 'Dose inicial', 'Dose máxima', 'Ajuste renal', 'Efeito adverso'],
    [['Semaglutida', '0,25 mg', '2,4 mg', 'Não', 'Náusea']]);
  ok('tabela clínica larga, sem coluna de estudo, sobrevive', tableToMarkdown(doses).indexOf('Semaglutida') > 0);

  // ⚠️ AS DUAS TABELAS DE 5 COLUNAS QUE A FORMA NÃO SEPARA — e é por isso que a
  // legenda entra na decisão. As duas são reais, do banco, e começam com
  // "Estudo": uma traz DESFECHO por estudo (1/23, P = 0,36) e é o dado da
  // revisão; a outra traz característica metodológica ("sem ajuste formal").
  // Contar coluna, contar linha ou contar números nas células não distingue as
  // duas — só o <caption> escrito pelo autor distingue.
  const resultadoPorEstudo = ['Estudo', 'Definição', 'PTx pré-transplante', 'PTx pós-transplante', 'Observações'];
  const linhasPTx = [
    ['Wang 2023 (27)', 'HPT persistente (>6 meses)', '1/23 (4,3%)', '4/75 (5,3%)', 'Sem diferença estatística'],
    ['Jeon 2012 (23)', 'iPTH >65 pg/mL em 1 ano', '12/37 (36%)', 'Não reportado', 'Ainda elevado'],
    ['Okada 2019 (26)', 'Não reportado', '–', '–', 'Ca mais alto'],
    ['van der Plas 2019 (25)', 'Recidiva pós-transplante', '3,7%', '2,3%', 'P = 0,36'],
    ['Callender 2017 (5)', 'HPT persistente', '–', '–', 'PTH ≥6×LSN']
  ];
  ok('tabela de RESULTADO por estudo sobrevive (legenda de desfecho)',
     tableToMarkdown(mk(resultadoPorEstudo, linhasPTx), 'Definitions and rates of persistent hyperparathyroidism after transplantation').indexOf('4,3%') > 0);
  ok('e sobrevive também sem legenda nenhuma',
     tableToMarkdown(mk(resultadoPorEstudo, linhasPTx), '').indexOf('4,3%') > 0);

  const confundidores = ['Estudo', 'Perda de peso relatada/ajustada', 'Avaliação/ajuste dietético', 'Ajuste para metformina', 'Comentários'];
  const linhasConf = Array.from({ length: 7 }, () =>
    ['(37)', 'Relatada por variações de IMC, sem ajuste formal', 'Não relatada', 'Controlada por desenho', 'MARCA-CONF']);
  ok('mesma forma, mas a legenda diz que é dos estudos → SAI',
     tableToMarkdown(mk(confundidores, linhasConf),
       'Assessment of main confounding factors in the human studies on GLP-1 receptor agonists') === '',
     tableToMarkdown(mk(confundidores, linhasConf), 'Assessment of main confounding factors in the human studies').slice(0, 120));
  ok('sem a legenda declarando, a de 5 colunas fica (a forma não basta)',
     tableToMarkdown(mk(confundidores, linhasConf), '').indexOf('MARCA-CONF') > 0);

  // A função de decisão, isolada — é ela que fica fácil de auditar depois.
  ok('exige coluna de estudo na PRIMEIRA posição',
     ehTabelaDeEstudosIncluidos(['Outcome', 'Study', 'Age', 'Sex', 'Duration', 'BMI'], 20, '') === false);
  ok('6 colunas dispensam a legenda', ehTabelaDeEstudosIncluidos(['Study', 'a', 'b', 'c', 'd', 'e'], 5, '') === true);
  ok('exige pelo menos 5 linhas de dados', ehTabelaDeEstudosIncluidos(['Study', 'a', 'b', 'c', 'd', 'e'], 4, '') === false);
  ok('4 colunas nunca saem, mesmo com legenda de características',
     ehTabelaDeEstudosIncluidos(['Study', 'a', 'b', 'c'], 20, 'Characteristics of included studies') === false);
  ok('5 colunas + legenda de características → sai',
     ehTabelaDeEstudosIncluidos(['Study', 'a', 'b', 'c', 'd'], 5, 'Characteristics of included studies') === true);
  ['Baseline characteristics of the included trials', 'Risk of bias assessment',
   'Summary of included studies', 'Quality assessment of the studies',
   'Características dos estudos incluídos'].forEach((leg) => {
    ok('legenda "' + leg.slice(0, 30) + '…" declara tabela dos estudos',
       ehTabelaDeEstudosIncluidos(['Study', 'a', 'b', 'c', 'd'], 6, leg) === true);
  });
  ok('legenda de desfecho NÃO declara',
     ehTabelaDeEstudosIncluidos(['Study', 'a', 'b', 'c', 'd'], 6, 'Pooled effect on fasting glucose') === false);
  ok('não depende do vocabulário dos cabeçalhos',
     ehTabelaDeEstudosIncluidos(['Autor', 'x1', 'x2', 'x3', 'x4', 'x5'], 9, '') === true);
}

console.log(bad ? '\nFALHOU: ' + bad : '\n✓ prompt da discussão: anexos sobrevivem ao corte; sem coluna de referências e sem tabela de estudos incluídos; resultado da metanálise preservado');
process.exit(bad ? 1 : 0);
